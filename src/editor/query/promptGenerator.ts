import {Envelope, EnvelopeInfo, Scene, Story} from "./types";
import {lang_type} from "../config";

export function generateMakeStoryPrompt(task: string, language: lang_type) {
    switch (language) {
        case "en": {
            let demo = {
                scenes: [
                    {
                        scene_number: 1,
                        scene_title: "Scene Title",
                        scene_body: "Scene Content",
                    }
                ],
                title: "Story Title",
                characters: [
                    {name: "<Character Name> (put the protagonist first)"}
                ]
            }

            let prompt = `Create a story like the one below. ${task} \n Moreover, divide the story into separate scenes. Follow the format below in your response. \n${
                JSON.stringify(
                    demo
                )
            }`

            return prompt
        }
        case "ja": {
            let demo: Story = {
                scenes: [
                    {
                        scene_number: 1,
                        scene_title: "場面のタイトル",
                        scene_body: "場面の内容",
                    }
                ],
                title: "物語のタイトル",
                characters: [
                    {name: "<登場人物の名前>(主人公を先頭にすること)"}
                ]
            }
            let prompt = `あなたはプロの小説家です．以下のような物語を作りなさい。${task} \n なお、ストーリーは章ごとに区切って返しなさい。章の長さは150文字程度とする．返答は以下の書式に従いなさい
    ${
                JSON.stringify(
                    demo
                )
            }
    `
            return prompt
        }

    }
}


export function generateMakeEnvelopePrompt(story: Story , envelope: EnvelopeInfo, language:lang_type) {
    switch (language) {
        case "ja": {
            let prompt = `以下の話について、各章における ${envelope.character.name} の${envelope.name}を${envelope.min_description}(-0.8)~${envelope.max_description}(0.8)で表しなさい。
    `
                +
                (envelope.character.name == "鑑賞者" ? "" : "なお、そのキャラがその章に登場していない場合やわからない場合はnullと答えなさい。")
                +
                `
    答えはjson形式で以下のように返しなさい` +
                `{"result" : {"第1章" : 0.1, "第2章" : 0.2, "第3章" : null ...}}`
            prompt += generatePlainTextFromScenes(story.scenes, language)
            return prompt
        }

        case "en": {
            let prompt = `For the following story, express ${envelope.character.name}'s ${envelope.name} in each chapter on a scale of ${envelope.min_description}(-0.8) to ${envelope.max_description}(0.8).
`
                +
                (envelope.character.name == "Observer" ? "" : "If the character does not appear in the chapter or is unknown, respond with null.")
                +
                `
Answer in JSON format as follows: ` +
                `{"result" : {"Chapter 1" : 0.1, "Chapter 2" : 0.2, "Chapter 3" : null ...}}`
            prompt += generatePlainTextFromScenes(story.scenes, language)
            return prompt
        }
    }

}

export function generateChangeScenesPrompt(story: Story , envelopes: Envelope[], changed_scene_numbers : number[], language:lang_type) {
    let envelope_str = generatePlainTextFromEnvelopes(envelopes, language)
    let story_str = generatePlainTextFromScenes(story.scenes, language, changed_scene_numbers)


    let changed_scene_str = generatePlainTextFromSceneNumbers(changed_scene_numbers, language)

    switch (language) {
        case "ja": {
            let prompt = story_str + `
あなたはプロの小説家です。以下の指示に従って物語を生成してください。

各章におけるパラメータは以下とhなっています。なお，
- 主体：パラメータの主を表します。
- 属性：パラメータが何を意味するかを表します。
- 尺度：パラメータの最小値（-1）と最大値（1）が何を意味するかを説明しています。

${envelope_str}

指示：
1. ${changed_scene_str}を生成してください。
2. 各章のつながりを考慮し、パラメータの変動を自然に反映させてください。
3. 各章の文量は約150文字を目安とします。
4. パラメータ名を直接物語に組み込んだり、パラメータの動きを明示的に説明したりすることは避けてください。
5. 章を書く前に、パラメータの変化の流れとそれに基づく各章のプロット案を分析してください。
6. 分析は露骨に物語に反映させず、章同士のつながりが自然になるよう注意してください。
7. 分析の際は、変化に加えてパラメータの値が範囲内でどの位置にあるかに注目し，パラメータ間の動きの比較もしてください。また，それを踏まえてどのようなストーリーの流れを描くかを説明しなさい．

返答は以下の形式で行ってください：
` + JSON.stringify(
                {
                    analyzes: "<<パラメータの動きと値に関する考察と各章のプロット案>>",
                    scenes: [
                        {
                            scene_number: 1,
                            scene_title: "第一章のタイトル",
                            scene_body: "第一章の内容",
                        },
                        // 他の章も同様に
                    ],
                },
                null,
                2
            ) + `

注意：
- ${changed_scene_str}のみを生成してください。
- 各パラメータについて、主体、属性、尺度を十分に考慮して物語を構築してください。
- 分析では、「すべての」パラメータの値の位置（範囲内での位置）に注目し、その変化が物語にどのように影響するかを検討してください。
- あなたはプロの小説家です．章のつながりを意識し，パラメータの動きを説明する文章（例:その結果，幸福度は下がった）を露骨にストーリーに入れ込むことはしないでください．
- いきなり新しい仲間や登場人物を登場させないこと
- 前後の章との整合性に注意すること
- ある程度具体性をもたせなさい
`;
            return prompt
        }
        case "en" : {
            let prompt = story_str + `
You are a professional novelist. Please generate a story according to the following instructions.

The parameters for each chapter are as follows:
- Agent: Indicates the main agent of the parameter.
- Attribute: Indicates what the parameter represents.
- Scale: Explains what the minimum value (-1) and maximum value (1) of the parameter mean.

${envelope_str}

Instructions:
1. Generate ${changed_scene_str}.
2. Ensure the parameters' variations are naturally reflected, considering the connections between each chapter.
3. Aim for each chapter to be around 150 characters in length.
4. Avoid directly incorporating the parameter names or explicitly explaining the parameter movements in the story.
5. Before writing each chapter, analyze the flow of parameter changes and develop plot ideas for each chapter based on this analysis.
6. Ensure the analysis is subtly reflected in the story so that the connection between chapters feels natural.
7. In your analysis, pay attention to the position of the parameter values within their range, and compare the movements between parameters.

Respond in the following format:
` + JSON.stringify(
                {
                    analyzes: "<<Analysis of parameter movements and values with plot ideas for each chapter>>",
                    scenes: [
                        {
                            scene_number: 1,
                            scene_title: "Title of Chapter 1",
                            scene_body: "Content of Chapter 1",
                        },
                        // Repeat for other chapters
                    ],
                },
                null,
                2
            ) + `

Notes:
- Only generate ${changed_scene_str}.
- Construct the story considering the agent, attribute, and scale of each parameter.
- In the analysis, focus on the position of the parameter values within their range and examine how their changes affect the story.
- Remember, you are a professional novelist. Ensure the connections between chapters are smooth, and do not overtly include parameter names in the story.
- Generate new events that match the movement of the parameters in moderation.
`;
            return prompt

        }
    }

}


function generatePlainTextFromSceneNumbers(numbers: number[], language:lang_type) {
    let str = ""
    for(let n of numbers) {
        str += language == "ja" ? `第${n}章、` : `Chapter ${n}、`
    }
    return str

}




function generatePlainTextFromScenes(scenes: Scene[], language :lang_type, ignore_index : number | number[]=-1) {
    let prompt = ""
    let i = 0;
    for (const scene of scenes) {
        i += 1
        let  str = scene.scene_body

        if(!Array.isArray(ignore_index) && ignore_index == i) {
            str = language == "en" ? "NOTSET" : "未設定"
        }
        if(Array.isArray(ignore_index) &&  ignore_index.includes(i)) {
            str = language == "en" ? "NOTSET" : "未設定"
        }
        prompt += language == "en" ? `Chapter ${i}\n` + str + "\n\n" : `第${i}章\n` + str + "\n\n"
    }
    return prompt
}

function generatePlainTextFromEnvelopes(envelopes:Envelope[], language:lang_type,  head=false) {

    type JPresultType =
        { [key: string]: { "主体": string, "属性":string, "尺度": string , "値": number }[] }
    type ENresultType =
        { [key: string]: { "Agent": string, "Attribute": string, "Scale": string, "Value": number }[] };

    let result : JPresultType | ENresultType = {}


    for(let i =0; i < envelopes[0].data.length; i++) {
        const chapter = language == "ja" ? `第${i + 1}章` : `Chapter ${i+1}`;
        if (!result[chapter]) {
            result[chapter] = [];
        }
        envelopes.forEach((envelope, index) => {
            let data = head ? envelope.head_data : envelope.data
            if(language == "ja") {
                result = result as JPresultType
                result[chapter].push({
                    "主体": envelope.info.character.name,
                    "属性" : envelope.info.name,
                    "尺度" : `${envelope.info.min_description}(-1) ~ ${envelope.info.max_description}(1)`,
                    "値": data[i]
                });
            }else if(language =="en") {
                result = result as ENresultType
                result[chapter].push({
                    "Agent": envelope.info.character.name,
                    "Attribute" : envelope.info.name,
                    "Scale" : `${envelope.info.min_description}(-1) ~ ${envelope.info.max_description}(1)`,
                    "Value": data[i]
                });
            }

        })
    }

    return JSON.stringify(result, null, 2);
}


function generatePlainTextFromEnvelopeData(data: number[]) {
    let prompt = ""
    let i = 0;
    for (const v of data) {
        i += 1

        prompt += `第${i}章\n` + v + "\n\n"
    }
    return prompt
}