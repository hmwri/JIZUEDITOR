import {OpenAI} from "openai";

import Anthropic from '@anthropic-ai/sdk';

import {OPENAI_API_KEY} from "../../ignore/apikey";
import TextBlock = Anthropic.TextBlock;


const openai = new OpenAI({
    dangerouslyAllowBrowser: true,
    apiKey: OPENAI_API_KEY // 先程取得したAPI KEY
})

interface GptResponse {
    body: string,
    context: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
}


export async function ask(prompt: string, context:OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [], json=false, model="gpt-4o"): Promise<GptResponse> {
    context.push(
        {
            "role" : "user",
            "content" : prompt
        }
    )
    const completion = await openai.chat.completions.create({
        model: model, // 使いたいGPTのModel
        messages: [
            {
                "role" : "system",
                "content" : "You are a helpful assistant. " + (json ? "Your answer will be formatted as json" : ""),
            },
            ...context,
        ],
        ... (json && {response_format: {"type" : "json_object"}})

    });
    let res = completion.choices[0].message.content

    context.push(
        {
            "role" : "assistant",
            "content" : res
        }
    )
    console.log(res)
    return {
        body : res,
        context : context
    }
}

export async function askStream(prompt: string, callback: (token: string) => void, context:OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [], json=false){
    context.push(
        {
            "role" : "user",
            "content" : prompt
        }
    )
    const chatStream = await openai.beta.chat.completions.stream({
        model: "gpt-4o", // 使いたいGPTのModel
        messages: [
            {
                "role" : "system",
                "content" : "You are a helpful assistant. " + (json ? "Your answer will be formatted as json" : ""),
            },
            ...context,
        ],
        ... (json && {response_format: {"type" : "json_object"}})

    });
    for await (const message of chatStream) {
        const token = message.choices[0].delta.content;
        if (token) {
            callback(token)
        }
    }

    const chatCompletion = await chatStream.finalChatCompletion();
    let res = chatCompletion.choices[0].message.content
    context.push(
        {
            "role" : "assistant",
            "content" : res
        }
    )
    return {
        body : res,
        context : context
    }


}

export async function askClaudeStream(prompt: string, callback: (token: string) => void, context: Anthropic.MessageCreateParams['messages'] = [], json = false) {
    context.push(
        {
            role: 'user',
            content: prompt,
        }
    );

    const client = new Anthropic({
        apiKey: "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",
        dangerouslyAllowBrowser: true
    });

    const stream = client.messages.stream({
        model: 'claude-3-5-sonnet-20240620', // Specify the desired model
        messages: [
            {
                role: 'user',
                content: 'You are a helpful assistant. ' + (json ? 'Your answer will be formatted as json' : ''),
            },
            {
                role:"assistant",
                content: " 'ok' ",
            },
            ...context,
        ],
        max_tokens: 1024,
    }).on('text', (text) => {
        callback(text)
    })

    const chatCompletion = await stream.finalMessage();
    let res = chatCompletion.content[0] as TextBlock
    context.push(
        {
            role: 'assistant',
            content: res.text,
        }
    );
    return {
        body: res.text,
        context: context,
    };
}



export async function generateImage(prompt:string) {
    const response = await openai.images.generate(
        {
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
        }
    );

    return response.data[0].url;
}
