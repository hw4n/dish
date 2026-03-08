import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import { ResponseInput } from "openai/resources/responses/responses";
import Local from "../../helper/local";
import Logger from "../../helper/logger";
import {
    appendSourcesToReply,
    splitDiscordMessage,
    WEB_SEARCH_TOOLS,
} from "../../helper/openai_response";

const prompt = fs.readFileSync(
    path.resolve(__dirname, "../../../gpt_prompt.txt"),
    "utf8",
);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("gpt")
        .setDescription("Generates answer from GPT model")
        .addStringOption((option) =>
            option
                .setName("question")
                .setDescription("Question to ask")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("image")
                .setDescription("Image URL to attach")
                .setRequired(false),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const question = interaction.options.getString("question");
        const imageUrl = interaction.options.getString("image");
        Logger.info(`${interaction.user.id} asked (${question})`);
        await interaction.deferReply();

        if (!question) {
            return interaction.editReply({
                content: "Please provide a valid question.",
            });
        }

        const waitString = "Generating answer...";
        const waitSteps = [".", "..", "..."];
        let waitStepIndex = 0;
        let waitActive = true;
        const waitInterval = setInterval(() => {
            if (!waitActive) {
                return;
            }

            void interaction.editReply({
                content: `${waitString}${waitSteps[waitStepIndex++]}`,
            }).catch(() => undefined);
            waitStepIndex %= waitSteps.length;
        }, 500);

        const input: ResponseInput = [{ role: "system", content: prompt }];

        if (imageUrl) {
            input.push({
                role: "user",
                content: [
                    { type: "input_text", text: question },
                    { type: "input_image", image_url: imageUrl, detail: "auto" },
                ],
            });
        } else {
            input.push({
                role: "user",
                content: [{ type: "input_text", text: question }],
            });
        }

        try {
            const response = await Local.openai.responses.create({
                model: "gpt-5.4",
                input,
                tools: WEB_SEARCH_TOOLS,
                max_output_tokens: 5000,
            });

            Logger.debug("Request ID: " + response.id);

            const reply = appendSourcesToReply(
                `## [Q] ${question}\n## [A]\n${response.output_text}`,
                response,
            );
            const chunks = splitDiscordMessage(reply);

            if (chunks.length > 0) {
                waitActive = false;
                clearInterval(waitInterval);
                const replyMessage = await interaction.editReply({
                    content: chunks[0],
                });
                await replyMessage.suppressEmbeds(true);
                for (const chunk of chunks.slice(1)) {
                    const followUpMessage = await interaction.followUp({
                        content: chunk,
                        withResponse: true,
                    });
                    await followUpMessage.suppressEmbeds(true);
                }
            }
        } finally {
            waitActive = false;
            clearInterval(waitInterval);
        }
    },
};
