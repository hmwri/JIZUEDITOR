import {ask, askStream} from "./gpt";
import {Envelope, EnvelopeInfo, Scene, Story} from "./types";
const { jsonrepair } = require('jsonrepair')



export async function makeStory(task:string, streamingCallback: (story :Story) => void) {
    let demo : Story =             {
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
    let prompt = `以下のような物語を作りなさい。${task} \n なお、ストーリーは場面ごとに区切って返しなさい。返答は以下の書式に従いなさい
    ${
        JSON.stringify(
            demo
        )
    }
    `
    let result = ""
    let callback = (token : string) =>  {
        result += token
        try {
            let dict = JSON.parse(jsonrepair(result))
            streamingCallback(dict as Story)
        }catch  (e) {
            console.log(e)
        }
    }

    let res = await askStream(prompt,callback, [], true)
    let story = JSON.parse(res.body) as Story
    story.characters.unshift({
        name: "鑑賞者",
    })
    return story
}

export async function getEnvelopeValues(story: Story , envelope: EnvelopeInfo) {
    let prompt = `以下の話について、各章における ${envelope.character.name} の${envelope.name}を${envelope.min_description}(-0.8)~${envelope.max_description}(0.8)で表しなさい。
    `
    +
        (envelope.character.name == "鑑賞者" ? "" : "なお、そのキャラがその章に登場していない場合やわからない場合はnullと答えなさい。")
        +
        `
    答えはjson形式で以下のように返しなさい` +
        `{"result" : {"第1章" : 0.1, "第2章" : 0.2, "第3章" : null ...}}`
    prompt += generatePlainTextFromScenes(story.scenes)

    console.log("from: getEnvelopeValues" , prompt)
    let body = (await ask(prompt, [], true)).body
    let dict = JSON.parse(body)["result"]
    let points: (number | null)[] = []
    for (let j = 1; j <= story.scenes.length; j++) {
        points.push(dict[`第${j}章`])
    }
    return points
}


export async function changeStory(story: Story , envelope: Envelope, index: number, value: number) {
    let story_str = generatePlainTextFromScenes(story.scenes)

    let prompt = story_str + `
以上の話について、各章における${envelope.info.character.name}の${envelope.info.name}{${envelope.info.min_description}(-1)~${envelope.info.max_description}(1)}は以下のようになっていました。
` +
        generatePlainTextFromEnvelopeData(envelope.data) +
        `このとき、第${index + 1}章の${envelope.info.name}を${value}にするために、前後の章のつながりを考えながら、第${index + 1}章を書き換えなさい。${envelope.info.name}の値は{${envelope.info.min_description}(-1)~${envelope.info.max_description}(1)という定義に沿っていることに注意しなさい
        なお、他のキャラクターにあまり影響を与えないようにすること。また、書き換える前と書き換えた後で文章の長さは決して変えないこと` +
        "返答は書き換えたストーリーのみ返しなさい、第何章かという記述はいらない"
    console.log("from: changeStory" , prompt)
    return (await ask(prompt, [], false)).body
}

export async function changeScenes(story: Story , envelopes: Envelope[]) {
    let story_str = generatePlainTextFromScenes(story.scenes)


    let envelope_str = generatePlainTextFromEnvelopes(envelopes)
    let head_envelope_str = generatePlainTextFromEnvelopes(envelopes, true)

    let changed_scene_numbers = []
    for(let i = 0; i < story.scenes.length; i++) {
        for(let env of envelopes) {
            if(env.isDiff(i)) {
                changed_scene_numbers.push(i + 1)
            }
        }
    }



    let prompt = story_str + `
以上の話について、各章におけるパラメータは以下となっている
` +
        envelope_str + "上記のパラメータを以下のように書き換えたい。\n変更後のパラメータ\n" + head_envelope_str +
        `このとき、適切な変換となるように、各章のつながりを考えながら${generatePlainTextFromSceneNumbers(changed_scene_numbers)}を書き換えなさい。
        なお、変更がないパラメータに影響を与えることはできるだけ避けなさい。また、書き換える前と書き換えた後で文章の長さは決して変えないこと` +
        "返答は以下のような形で変えなさい" +
        JSON.stringify(
            {
                scenes: [
                    {
                        scene_number: 1,
                        scene_title: "第一章のタイトル",
                        scene_body: "第一章の内容",
                    },
                    {
                        scene_number: 5,
                        scene_title: "第五章のタイトル",
                        scene_body: "第五章の内容",
                    }
                ],
            }
        )

    console.log("from: changeScenes" , prompt)
    return (await ask(prompt, [], true)).body
}


function generatePlainTextFromSceneNumbers(numbers: number[]) {
    let str = ""
    for(let n of numbers) {
        str += `第${n}章、`
    }
    return str

}


function generatePlainTextFromEnvelopes(envelopes:Envelope[], head=false) {
    const result: { [key: string]: { "パラメータ": string, "値": number }[] } = {};

    envelopes.forEach((envelope, index) => {
        let data = head ? envelope.head_data : envelope.data
        const chapter = `第${index + 1}章`;
        const parameter = `${envelope.info.character.name}の${envelope.info.name} ${envelope.info.min_description}(-1) ~ ${envelope.info.max_description}(1)`;

        if (!result[chapter]) {
            result[chapter] = [];
        }

        result[chapter].push({
            "パラメータ": parameter,
            "値": data[index]
        });
    });

    return JSON.stringify(result, null, 2);
}


function generatePlainTextFromScenes(scenes: Scene[], ignore_index=-1) {
    let prompt = ""
    let i = 0;
    for (const scene of scenes) {
        i += 1
        let  str = scene.scene_body
        if(ignore_index == i) {
            str = "この章を書き換えよ"
        }
        prompt += `第${i}章\n` + str + "\n\n"
    }
    return prompt
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

function searchEnvelopesById(envelopes:Envelope[] , id:string) {
    for(let env of envelopes) {
        if(env.id == id) {
            return env
        }
    }
}