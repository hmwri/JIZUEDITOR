import {OpenAI} from "openai";


import {OPENAI_API_KEY} from "../../ignore/apikey";


const openai = new OpenAI({
    dangerouslyAllowBrowser: true,
    apiKey: OPENAI_API_KEY // 先程取得したAPI KEY
})

interface GptResponse {
    body: string,
    context: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
}


export async function ask(prompt: string, context:OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [], json=false): Promise<GptResponse> {
    context.push(
        {
            "role" : "user",
            "content" : prompt
        }
    )
    const completion = await openai.chat.completions.create({
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
