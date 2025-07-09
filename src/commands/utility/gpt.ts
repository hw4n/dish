import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import Logger from "../../helper/logger";
import Local from "../../helper/local";
import fs from "fs";
import path from "path";
import {
    ResponseInputImage,
    ResponseInputText,
} from "openai/resources/responses/responses";

const prompt = fs.readFileSync(
    path.resolve(__dirname, "../../../gpt_prompt.txt"),
    "utf8"
);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("gpt")
        .setDescription("Generates answer from GPT model")
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
                    content: `## [Q] ${question}\n## [A]\n` + fullResponse,
                });
                lastEdit = new Date();
            }
        }

        // 최종 응답 처리
        let reply = `## [Q] ${question}\n## [A]\n` + fullResponse;
        const chunks = reply.match(/[\s\S]{1,2000}/g);
        if (chunks) {
            await interaction.editReply({ content: chunks[0] });
            for (let i = 1; i < chunks.length; i++) {
                await interaction.followUp({ content: chunks[i] });
            }
        }
    },
};
