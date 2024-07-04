import {Character, Envelope, EnvelopeInfo, Story,} from "./query/types";
import {changeScenes, changeStory, getEnvelopeValues, makeStory} from "./query";
import {UIManager} from "../ui";
const clonedeep = require('lodash/cloneDeep');



export class StoryEditor {
    ui : UIManager
    nowStory : Story
    envelopes : Envelope[] = []

    constructor(ui : UIManager) {
        this.ui = ui
    }

    async generate(test : boolean=false) {
        if(test) {
            this.nowStory = JSON.parse(
                `
                {"title":"桜の季節に出会った二人","characters":[{"name":"鑑賞者"},{"name":"美咲"},{"name":"大輝"}],"scenes":[{"scene_number":1,"scene_title":"運命の出会い","scene_body":"春の温かい日差しが差し込む午後、美咲はいつものカフェで休息を取っていた。新しいプロジェクトの事で頭を悩ませていた彼女は、カフェの隅でノートを広げて勉強している大輝に気付く。一見ふつうの学生だが、その瞳には何か特別な輝きがあり、美咲は妙に気になってしまう。大輝も、美咲の視線に気づき、二人は軽く微笑む。"},{"scene_number":2,"scene_title":"偶然の再会","scene_body":"数日後、美咲は仕事帰りに再びそのカフェに立ち寄る。すると、大輝も同じ場所で勉強していた。彼が美咲に気付き、思わず声をかける。「またお会いしましたね。ここが好きなんですか？」二人の会話は自然に流れ、互いの趣味や日常について話し始める。"},{"scene_number":3,"scene_title":"桜の下で","scene_body":"ある日、大輝は美咲を桜の名所に誘う。桜が満開の公園で二人は歩きながら多くの話題を共有する。美咲は、大輝の夢や目標を聞いて、彼の前向きな姿勢に感銘を受ける。一方、大輝も、美咲が経験した苦労や努力を尊敬し合う。桜の花びらが舞い散る中で、二人は一層親しくなり、お互いの心に惹かれていく。"},{"scene_number":4,"scene_title":"葛藤","scene_body":"日が経つにつれ、二人の距離は縮まっていくが、現実の問題も次第に浮かび上がる。美咲は仕事と恋愛のバランスに悩み、大輝は学業との両立に苦しむ。二人はお互いを支え合いながらも、自分の道に迷いが生じ始める。"},{"scene_number":5,"scene_title":"決断の時","scene_body":"桜が散り始めたある日、二人は再び公園を訪れる。美咲は、大輝に対して自分の気持ちを正直に伝えることを決意する。大輝も、将来について正直に話し合う覚悟を決めていた。互いの気持ちを確認し合い、二人は共に歩む未来を見据えて、新たな一歩を踏み出すことを誓う。"}]}
                `
            )
        }else{
            this.nowStory = await makeStory(
                "主人公の大学生が，宇宙の巨悪，ひまわり星人のボスに立ち向かうSF映画．登場人物はボス含め2人ぐらいで",
                (story : Story) => {
                    this.ui.setStory(story)
                }
            )
        }
        console.log(JSON.stringify(this.nowStory))
        this.ui.setStory(this.nowStory)

    }

    async generateDefaultEnvelopes() {
        for (let chara of this.nowStory.characters) {
            await this.generateAndAddEnvelope(new EnvelopeInfo(
                chara,
                "幸福度",
                "不幸",
                "幸"
            ))
        }
    }

    async generateAndAddEnvelope(envelopeInfo: EnvelopeInfo) {
        let env = new Envelope(envelopeInfo, await getEnvelopeValues(this.nowStory, envelopeInfo),  async (index, value) => {
            // let scene_body = await  changeStory(this.nowStory, env, index, value)
            // this.nowStory.scenes[index].scene_body = scene_body
            this.ui.setStory(this.nowStory)
        })
        this.envelopes.push(
            env
        )
        this.ui.addTrack(
            env
        )
    }

    async reflectChange() {
        let cs = await changeScenes(this.nowStory, this.envelopes)
        for(let env of this.envelopes){
            env.commit()
        }

        for (let c of cs) {
           this.nowStory.scenes[c.scene_number - 1] = c
        }
        this.ui.setStory(this.nowStory)
    }

    insertEmptyScene(index:number) {
        this.nowStory.scenes.splice(index, 0, {
            scene_number : index,
            scene_title : "シーンの内容なし",
            scene_body : "未設定"
        })

        for(let [i, scene] of this.nowStory.scenes.entries()) {
            scene.scene_number = i + 1
        }
        for(let env of this.envelopes) {
            env.insertEmptyPoint(index)
        }
        this.ui.setStory(this.nowStory)
        this.ui.reloadTracks()
    }

    getCharacterByName(name  : string) {
        for (let c of this.nowStory.characters) {
            if(name == c.name) {
                return c
            }
        }
        return null
    }
}

