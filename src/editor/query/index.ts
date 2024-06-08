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
    return JSON.parse(res.body) as Story
}

export async function getEnvelopeValues(story: Story , envelope: EnvelopeInfo) {
    let prompt = `以下の話について、各章における ${envelope.name} の幸福度を${envelope.min_description}(-1)~${envelope.max_description}(1)で表しなさい。答えはjson形式で以下のように返しなさい` +
        `{"result" : {"第1章" : 0.1, "第2章" : 0.2, "第3章" : -0.2 ...}}`
    prompt += generatePlainTextFromScenes(story.scenes)
    let body = (await ask(prompt, [], true)).body
    console.log(body)
    let dict = JSON.parse(body)["result"]
    let points: number[] = []
    for (let j = 1; j <= story.scenes.length; j++) {
        points.push(dict[`第${j}章`])
    }
    return points
}


// export async function changeStory(story: string[], timeSeries: number[], index: number, value: number) {
//     let timeSeriesStr = ""
//     timeSeries.forEach(
//         (v, i) => {
//             timeSeriesStr += `第${i + 1}章:${v}`
//             timeSeriesStr += "\n"
//         }
//     )
//     let story_str = generatePlainTextFromScenes(story)
//
//     let prompt = story_str + "\n以上の話について、各章における主人公の幸福度{不幸(-1)~幸福(1)}は以下のようになっていました。\n" +
//         timeSeriesStr +
//         `このとき、第${index + 1}章の幸福度を${value}にするために、前後の章のつながりを考えながら、第${index + 1}章を書き換えなさい` +
//         "返答は書き換えたストーリーのみ返しなさい、第何章かという記述はいらない"
//
//     return (await ask(prompt, [], false)).body
// }

function generatePlainTextFromScenes(scenes: Scene[]) {
    let prompt = ""
    let i = 0;
    for (const scene of scenes) {
        i += 1
        prompt += `第${i}章\n` + scene.scene_body + "\n\n"
    }
    return prompt
}

