import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { OPENAI_API_KEY } from "../../ignore/apikey";
import TextBlock = Anthropic.TextBlock;
interface GptResponse {
    body: string;
    context: any[];
}

export class LLM {
    private static openai: OpenAI;
    private static anthropic: Anthropic;

    static setClients(openaiKey: string, anthropicKey: string = "") {
        this.openai = new OpenAI({
            apiKey: openaiKey,
            dangerouslyAllowBrowser: true,
        });

        this.anthropic = new Anthropic({
            apiKey: anthropicKey,
            dangerouslyAllowBrowser: true,
        });
    }

    static async ask(
        prompt: string,
        context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [],
        json = false,
        model = "gpt-4o"
    ): Promise<GptResponse> {
        context.push({ role: "user", content: prompt });

        const completion = await this.openai.chat.completions.create({
            model,
            messages: [
                {
                    role: "system",
                    content: `You are a helpful assistant. ${json ? "Your answer will be formatted as json" : ""}`,
                },
                ...context,
            ],
            ...(json && { response_format: { type: "json_object" } }),
        });

        const res = completion.choices[0].message.content || "";
        context.push({ role: "assistant", content: res });

        return { body: res, context };
    }

    static async askStream(
        prompt: string,
        callback: (token: string) => void,
        context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [],
        json = false,
        model = "gpt-4o"
    ): Promise<GptResponse> {
        context.push({ role: "user", content: prompt });

        const stream = await this.openai.beta.chat.completions.stream({
            model,
            messages: [
                {
                    role: "system",
                    content: `You are a helpful assistant. ${json ? "Your answer will be formatted as json" : ""}`,
                },
                ...context,
            ],
            ...(json && { response_format: { type: "json_object" } }),
        });

        for await (const message of stream) {
            const token = message.choices[0]?.delta?.content;
            if (token) callback(token);
        }

        const final = await stream.finalChatCompletion();
        const res = final.choices[0].message.content || "";
        context.push({ role: "assistant", content: res });

        return { body: res, context };
    }

    static async askClaudeStream(
        prompt: string,
        callback: (token: string) => void,
        context: Anthropic.MessageCreateParams["messages"] = [],
        json = false,
        model = "claude-3-5-sonnet-20240620"
    ): Promise<GptResponse> {
        context.push({ role: "user", content: prompt });

        const stream = this.anthropic.messages.stream({
            model,
            messages: [
                {
                    role: "user",
                    content: `You are a helpful assistant. ${json ? "Your answer will be formatted as json" : ""}`,
                },
                {
                    role: "assistant",
                    content: "'ok'",
                },
                ...context,
            ],
            max_tokens: 1024,
        });

        stream.on("text", callback);

        const final = await stream.finalMessage();
        const res = final.content[0] as TextBlock;

        context.push({ role: "assistant", content: res.text });

        return { body: res.text, context };
    }

    static async generateImage(prompt: string): Promise<string> {
        const response = await this.openai.images.generate({
            model: "dall-e-3",
            prompt,
            n: 1,
            size: "1024x1024",
        });

        return response.data[0].url;
    }
}
