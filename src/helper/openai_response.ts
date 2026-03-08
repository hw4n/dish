import { URL } from "url";
import {
    Response,
    ResponseOutputMessage,
    ResponseOutputText,
    Tool,
} from "openai/resources/responses/responses";

const MAX_SOURCES = 5;

export const WEB_SEARCH_TOOLS = [
    {
        type: "web_search",
        external_web_access: true,
    },
] as unknown as Tool[];

function isOutputMessage(
    item: Response["output"][number],
): item is ResponseOutputMessage {
    return item.type === "message";
}

function isOutputText(
    content: ResponseOutputMessage["content"][number],
): content is ResponseOutputText {
    return content.type === "output_text";
}

function formatSourceLabel(title: string, url: string) {
    if (title.trim()) {
        return title.trim();
    }

    try {
        return new URL(url).host;
    } catch {
        return url;
    }
}

export function appendSourcesToReply(body: string, response: Response) {
    const sourceMap = new Map<string, string>();

    for (const item of response.output) {
        if (!isOutputMessage(item)) {
            continue;
        }

        for (const content of item.content) {
            if (!isOutputText(content)) {
                continue;
            }

            for (const annotation of content.annotations) {
                if (annotation.type !== "url_citation") {
                    continue;
                }

                if (sourceMap.has(annotation.url)) {
                    continue;
                }

                sourceMap.set(
                    annotation.url,
                    formatSourceLabel(annotation.title, annotation.url),
                );

                if (sourceMap.size >= MAX_SOURCES) {
                    break;
                }
            }

            if (sourceMap.size >= MAX_SOURCES) {
                break;
            }
        }

        if (sourceMap.size >= MAX_SOURCES) {
            break;
        }
    }

    if (sourceMap.size === 0) {
        return body;
    }

    const sourceLines = [...sourceMap.entries()].map(
        ([url, label]) => `- ${label}: ${url}`,
    );

    return `${body}\n\nSources:\n${sourceLines.join("\n")}`;
}

export function splitDiscordMessage(message: string) {
    return message.match(/[\s\S]{1,2000}/g) ?? [];
}
