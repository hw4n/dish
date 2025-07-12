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
import axios from "axios";

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

        // 화려한 로딩
        let waitString = "Generating answer...";
        const waitEmoji = ["⠋", "⠙", "⠸", "⠴", "⠦", "⠇"];
        let waitEmojiIndex = 0;
        const waitInterval = setInterval(() => {
            interaction.editReply({
                content: `${waitString} ${waitEmoji[waitEmojiIndex++]}`,
            });
            waitEmojiIndex = waitEmojiIndex % waitEmoji.length;
        }, 500);

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

        if (!response.output) {
            // 만약 output이 없다면 function call을 안해서 끝났을테니
            return interaction.editReply({
                content: `## [Q] ${question}\n## [A]\n${response.output_text}`,
            });
        }

        // 최초 응답을 다시 넣기
        input.push(response.output[0]);

        let preInputLength = input.length;
        // mcp 같은놈 불렀으면 실행
        for (const todoCall of response.output) {
            if (todoCall.type !== "function_call") {
                continue;
            }

            waitInterval && clearInterval(waitInterval);

            await interaction.editReply({
                content: `## [Q] ${question}\n## [A]\n(함수 실행 대기중)`,
            });

            const name = todoCall.name;
            const args = todoCall.arguments;
            Logger.debug(
                `Function call: ${name} with args: ${JSON.stringify(args)}`
            );

            if (name === "web_search") {
                try {
                    const response = await axios.post(
                        "http://localhost:3000/browser/search",
                        {
                            args,
                        }
                    );

                    console.log("-----\n" + response.data + "\n-----");

                    input.push({
                        type: "function_call_output",
                        call_id: todoCall.call_id,
                        output: response.data,
                    });
                    Logger.debug(
                        "Appended input: " + JSON.stringify(input.slice(2))
                    );
                } catch (error) {
                    Logger.error("Error calling web_search: " + error);
                }
            }
        }

        let response2;
        if (input.length > preInputLength) {
            Logger.debug(
                "Before second request input: " + JSON.stringify(input.slice(2))
            );
            // 다시 GPT에게 응답을 요청
            response2 = await Local.openai.responses.create({
                model: "gpt-4.1",
                input,
                tools,
                max_output_tokens: 1500,
            });
        }

        waitInterval && clearInterval(waitInterval);

        // 진짜 최종 응답을 가져오기
        let responseText = response2?.output_text
            ? response2.output_text
            : response.output_text;

        // 최종 응답 (필요하면 나눠서) 출력
        let reply = `## [Q] ${question}\n## [A]\n` + responseText;
        const chunks = reply.match(/[\s\S]{1,2000}/g);
        if (chunks) {
            await interaction.editReply({ content: chunks[0] });
            for (let i = 1; i < chunks.length; i++) {
                await interaction.followUp({ content: chunks[i] });
            }
        }
    },
};
