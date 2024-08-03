import {ask, askStream} from "./gpt";
import {Envelope, EnvelopeInfo, Scene, Story} from "./types";
import {generateChangeScenesPrompt, generateMakeEnvelopePrompt, generateMakeStoryPrompt} from "./promptGenerator";
import {lang_type} from "../config";
const { jsonrepair } = require('jsonrepair')



export async function makeStory(task:string,streamingCallback: (story :Story) => void, language:lang_type, ) {
    let prompt = generateMakeStoryPrompt(task, language)
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
        name: language == "en" ? "Observer" : "鑑賞者",
    })
    return story
}

export async function getEnvelopeValues(story: Story , envelope: EnvelopeInfo, language:lang_type) {
    let prompt = generateMakeEnvelopePrompt(story, envelope, language)

    console.log("from: getEnvelopeValues" , prompt)
    let body = (await ask(prompt, [], true)).body
    let dict = JSON.parse(body)["result"]
    let points: (number | null)[] = []
    for (let j = 1; j <= story.scenes.length; j++) {
        points.push(language  == "en" ? dict[`Chapter ${j}`] :  dict[`第${j}章`])
    }
    return points
}



export async function changeScenes(story: Story , envelopes: Envelope[], language:lang_type) {

    console.log(envelopes[0].data)
    console.log(envelopes[0].head_data)

    // let head_envelope_str = generatePlainTextFromEnvelopes(envelopes, true)

    let changed_scene_numbers = []
    for(let i = 0; i < story.scenes.length; i++) {
        let flag = false
        for(let env of envelopes) {
            if(env.isDiff(i)) {
                flag  = true
            }
        }
        if(flag) {
            changed_scene_numbers.push(i + 1)
        }
    }
    let prompt = generateChangeScenesPrompt(story, envelopes, changed_scene_numbers, language)

//     let prompt = story_str + `
//     あなたはプロの小説家です。
// 以上の話について、各章におけるパラメータは以下となっている　なお，主体はパラメータの主を，属性はパラメータが何を意味するかを，尺度はパラメータの最小値と最大値(-1,1)が何を意味するかを説明している．
// ` +
//         envelope_str+
//         `各章のつながりを考えながら，パラメータの変動を再現できるように，${changed_scene_str}を生成しなさい。
//         文量の目安は150文字とする
//         なお、パラメータ名を物語の中に組み込むことは絶対に避けなさい．また，パラメータの動きを物語の中で説明することは絶対に避けろ` +
//         `返答は${changed_scene_str}のみでよい` +
//         "また，章を書く前にパラメータにどのような流れの変更があるか，及びそれに対してそれぞれの章はどのようなプロットにするべきかの考察文をanalyzeフィールドに書きなさい．" +
//         "ただ，考察を露骨にストーリーに反映させないこと，また，つながりが自然になることを意識しなさい" +
//         "なお，ここの考察文においては必ず値が範囲内でどの位置にあるのか（パラメータの尺度の情報）に注目すること" +
//         "返答は以下のような形で答えなさい（第一章と第五章を生成する場合）" +
//         JSON.stringify(
//             {
//                 analyzes: "<<パラメータの変更前と変更後の比較と変えるべき章に対する考察>>",
//
//                 scenes: [
//                     {
//                         scene_number: 1,
//                         scene_title: "第一章のタイトル",
//                         scene_body: "第一章の内容",
//                     },
//                     {
//                         scene_number: 5,
//                         scene_title: "第五章のタイトル",
//                         scene_body: "第五章の内容",
//                     }
//                 ],
//             }
//         )

    console.log("from: changeScenes" , prompt)
    return JSON.parse((await ask(prompt, [], true)).body).scenes as Scene[]
}


function generatePlainTextFromSceneNumbers(numbers: number[], language: lang_type) {
    let str = ""
    for(let n of numbers) {
        str += language == "en" ? `Chapter ${n}, ` : `第${n}章、`
    }
    return str

}




function generatePlainTextFromScenes(scenes: Scene[], ignore_index : number | number[]=-1) {
    let prompt = ""
    let i = 0;
    for (const scene of scenes) {
        i += 1
        let  str = scene.scene_body

        if(!Array.isArray(ignore_index) && ignore_index == i) {
            str = "未設定"
        }
        if(Array.isArray(ignore_index) &&  ignore_index.includes(i)) {
            str = "未設定"
        }
        prompt += `第${i}章\n` + str + "\n\n"
    }
    return prompt
}
