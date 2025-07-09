import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import Logger from "../../helper/logger";
import Local from "../../helper/local";
import {
    ResponseInputText,
    ResponseInputImage,
} from "openai/resources/responses/responses";

// load prompt.txt to variable
const fs = require("fs");
const path = require("path");
// put expected start prompt to prompt.txt
const prompt = fs.readFileSync(
    path.resolve(__dirname, "../../../msg_prompt.txt"),
    "utf8"
);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("msg")
        .setDescription("Generates answer from msgkGPT model")
        .addStringOption((option) =>
            option
                .setName("question")
                .setDescription("Question to ask")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("image")
                .setDescription("Image URL to attach")
                .setRequired(false)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        let question = interaction.options.getString("question");
        let image_url = interaction.options.getString("image");
        Logger.info(`${interaction.user.id} asked (${question})`);
        await interaction.deferReply();

        let lastEdit = new Date();

        if (!question) {
            return interaction.editReply({
                content: "Please provide a valid question.",
            });
        }

        const userContent: Array<ResponseInputText | ResponseInputImage> = [
            { type: "input_text", text: question },
        ];

        if (image_url) {
            userContent.push({
                type: "input_image",
                image_url: image_url,
                detail: "auto",
            });
        }

        const stream = await Local.openai.responses.create({
            model: "gpt-4.1",
            input: [
                { role: "system", content: prompt },
                {
                    role: "user",
                    content: userContent,
                },
            ],
            tools: [],
            max_output_tokens: 1500,
            stream: true,
        });

        let fullResponse = "";
        for await (const chunk of stream) {
            if (chunk.type === "response.output_text.delta") {
                fullResponse += chunk.delta;
            }

            // 실시간 업데이트
            if (
                fullResponse.length < 1900 &&
                lastEdit.getTime() + 500 < new Date().getTime()
            ) {
                await interaction.editReply({
                    content: `## [mQ] ${question}\n## [mA]\n` + fullResponse,
                });
                lastEdit = new Date();
            }
        }

        // 최종 응답 처리
        let reply = `## [mQ] ${question}\n## [mA]\n` + fullResponse;
        const chunks = reply.match(/[\s\S]{1,2000}/g);
        if (chunks) {
            await interaction.editReply({ content: chunks[0] });
            for (let i = 1; i < chunks.length; i++) {
                await interaction.followUp({ content: chunks[i] });
            }
        }
    },
};
