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
                title: "物語のタイトル",
                characters: [
                    {
                        name: "<登場人物の名前>(主人公を先頭にすること)",
                        description:"<登場人物に関する基本的な説明>",
                        looks:"<見た目，服装や身体的特徴に関する細かな説明>"
                    }
                ],
                scenes: [
                    {
                        scene_number: 1,
                        scene_title: "場面のタイトル",
                        scene_body: "場面の内容",
                    }
                ],

            }
            let prompt = `あなたはプロの小説家です．以下のような物語を作りなさい。${task} \n なお、ストーリーは章ごとに区切って返しなさい。章の長さは150文字程度とする．
            
            返答は以下の書式に従いなさい．必ず，titleとcharactersを最初に持ってくること
            
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
                (envelope.character.name == "鑑賞者" ? "" : "なお、そのキャラがその章に登場していない場合や，わからない場合は0としなさい")
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
    let envelope_str = generatePlainTextFromEnvelopes2(envelopes, language)
    let story_str = generatePlainTextFromScenes(story.scenes, language, changed_scene_numbers)


    let changed_scene_str = generatePlainTextFromSceneNumbers(changed_scene_numbers, language)

    switch (language) {
        case "ja": {
            let prompt = story_str + `
あなたはプロの小説家です。以下の指示に従って物語を生成してください。
なお，物語のタイトルは以下の通りです
「${story.title}」

主人公は「${story.characters[1].name}」である

各章における心情に関する記述は以下となっています。なお，
- 主体：値の主を表します。
- 心情：値がどのような心情を意味するかを表します。
- 尺度：値の最小値（-1）と最大値（1）が何を意味するかを説明しています。

${envelope_str}

指示：
1. ${changed_scene_str}を生成してください。
2. 各章のつながりを考慮し、心情の変動を自然に反映させてください。
3. 各章の文量は"必ず"180文字以内としなさい。
4. 心情の名前を直接物語に組み込んだり、心情の動きを明示的に説明したりすることは避けてください。
5. 章を書く前に、特徴的な心情の変化の流れを抽出し，詳しく分析しなさい．
6. 分析は露骨に物語に反映させず、章同士のつながりが自然になるよう注意してください。
7. 分析の際は、変化に加えて心情の値が範囲内でどの位置にあるかに注目し，心情間の動きの比較もしてください。また，それを踏まえてどのようなストーリーの流れを描くかを説明しなさい．


返答は以下の形式で行ってください：
` + JSON.stringify(
                {
                    analyzes: "<<それぞれの登場人物ごとに変化に加えて心情の値が範囲内でどの位置にあるかに注目し，心情間の動きの比較>> これは決してjson形式で行うな文章で行え",
                    tenkai:"<<その分析結果からどのような展開が想起されるか具体的に説明しろ 文章でよい>>",
                    scenes: [
                        {
                            scene_number: 1,
                            scene_title: "第一章のタイトル",
                            scene_body: "第一章の内容<<ここでは，分析結果を踏まえたストーリーの内容をしっかりと生成してください>>",
                        },
                        // 他の章も同様に
                    ],
                },
                null,
                2
            ) + `

注意：
- ${changed_scene_str}のみを生成してください。
- 主体、心情、尺度を十分に考慮して物語を構築してください。
- 分析では心情の値の位置（範囲内での位置）に注目し、その変化が物語にどのように影響するかを検討してください。
- あなたはプロの小説家です．心情の動きを説明する文章（例:その結果，幸福度は下がった）を露骨にストーリーに入れ込むことはしないでください．
- いきなり新しい仲間や登場人物を登場させないこと
- 登場人物の心情の動きの違いに特に着目すること
- 前後の章との整合性に注意すること
- ストーリーには各登場人物からの視点をいれることが望ましい
- ストーリーには具体性を持たせなさい
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
        { [key: string]: { "主体": string, "心情":string, "尺度": string , "値": number }[] }
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
                    "心情" : envelope.info.name,
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

function generatePlainTextFromEnvelopes2(envelopes:Envelope[], language:lang_type,  head=false) {

    let array = []

    for(let i =0; i < envelopes.length; i++) {

// 辞書を作成
        const dictionary: { [key: string]: number } = {};

// 配列と章のタイトルを結びつける
        envelopes[i].data.forEach((value, index) => {
            dictionary[`第${index + 1}章`] = Math.round(value * 100) / 100;;
        });
        let dict = {
            "主体" : envelopes[i].info.character.name,
            "心情" : envelopes[i].info.name,
            "尺度" : `${envelopes[i].info.min_description}(-1) ~ ${envelopes[i].info.max_description}(1)`,
            "値の変動": dictionary
        }
        array.push(dict)
    }

    return JSON.stringify(array, null, 2);
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