import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import Logger from "../../helper/logger";
import Local from "../../helper/local";
import fs from "fs";
import path from "path";
import {
    ResponseInput,
    ResponseInputImage,
    ResponseInputText,
    Tool,
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

        // 일단 시스템 프롬프트를 넣기
        const input: ResponseInput = [{ role: "system", content: prompt }];

        // 이미지 넣었냐 안넣었냐에 따라 분기해서 처리
        if (image_url) {
            input.push({
                role: "user",
                content: [
                    { type: "input_text", text: question },
                    { type: "input_image", image_url, detail: "auto" },
                ],
            });
        } else {
            input.push({
                role: "user",
                content: [{ type: "input_text", text: question }],
            });
        }

        const tools = Local.openai_tools;

        // 호출한다음에
        const response = await Local.openai.responses.create({
            model: "gpt-4.1",
            input,
            tools,
            max_output_tokens: 1500,
        });

        Logger.debug("Request ID: " + response.id);

        await interaction.editReply({
            content: `## [Q] ${question}\n## [A]\n(함수 실행 대기중)`,
        });

        // 최초 응답을 다시 넣기
        input.push(response.output[0]);

        // mcp 같은놈 불렀으면 실행
        for (const todoCall of response.output) {
            if (todoCall.type !== "function_call") {
                continue;
            }

            const name = todoCall.name;
            const args = todoCall.arguments;
            Logger.debug(
                `Function call: ${name} with args: ${JSON.stringify(args)}`
            );

            //
            // 여기서 실제 함수 호출
            //

            input.push({
                type: "function_call_output",
                call_id: todoCall.call_id,
                output: `{c: 2}`,
            });
            Logger.debug("Appended input: " + JSON.stringify(input.slice(2)));
        }

        Logger.debug(
            "Before second request input: " + JSON.stringify(input.slice(2))
        );
        // 다시 GPT에게 응답을 요청
        const response2 = await Local.openai.responses.create({
            model: "gpt-4.1",
            input,
            tools,
            max_output_tokens: 1500,
        });

        // 최종 응답 (필요하면 나눠서) 출력
        let reply = `## [Q] ${question}\n## [A]\n` + response2.output_text;
        const chunks = reply.match(/[\s\S]{1,2000}/g);
        if (chunks) {
            await interaction.editReply({ content: chunks[0] });
            for (let i = 1; i < chunks.length; i++) {
                await interaction.followUp({ content: chunks[i] });
            }
        }
    },
};
