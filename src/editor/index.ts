import {Character, Envelope, EnvelopeInfo, Story,} from "./query/types";
import {changeScenes,  getEnvelopeValues, makeStory} from "./query";
import {UIManager} from "../ui";
import {lang_type} from "./config";
const clonedeep = require('lodash/cloneDeep');



export class StoryEditor {
    ui : UIManager
    nowStory : Story
    envelopes : Envelope[] = []
    language : lang_type = "ja"

    constructor(ui : UIManager) {
        this.ui = ui
    }

    async generate(prompt:string, test : boolean=false) {
        this.envelopes = []
        this.ui.removeAllTrack()
        if(test) {
            this.nowStory = JSON.parse(

                this.language == "en" ?
                    `{"title":"The Two Who Met in the Season of Cherry Blossoms","characters":[{"name":"Observer"},{"name":"Misaki"},{"name":"Daiki"}],"scenes":[{"scene_number":1,"scene_title":"A Fateful Encounter","scene_body":"On a warm spring afternoon, Misaki was taking a break at her usual café. She was troubled by thoughts of her new project and noticed Daiki studying with a notebook in a corner of the café. He seemed like an ordinary student, but there was something special about the sparkle in his eyes that intrigued Misaki. Daiki also noticed Misaki's gaze, and they exchanged a brief smile."},{"scene_number":2,"scene_title":"A Chance Reunion","scene_body":"A few days later, Misaki stopped by the same café on her way home from work. She found Daiki studying in the same spot. Noticing her, Daiki couldn't help but speak up. 'We meet again. Do you like this place too?' Their conversation flowed naturally, and they began talking about their hobbies and daily lives."},{"scene_number":3,"scene_title":"Under the Cherry Blossoms","scene_body":"One day, Daiki invited Misaki to a famous cherry blossom spot. Walking through the park full of blooming sakura, they shared many topics. Misaki was impressed by Daiki's dreams and aspirations, while Daiki admired Misaki for her struggles and hard work. As the cherry petals fluttered around them, they grew closer and felt a mutual attraction."},{"scene_number":4,"scene_title":"Conflict","scene_body":"As time passed, the distance between them decreased, but real-life problems began to surface. Misaki struggled to balance her work and romance, while Daiki found it hard to manage his studies. They supported each other, but doubts about their paths started to creep in."},{"scene_number":5,"scene_title":"Time for Decisions","scene_body":"On a day when the cherry blossoms began to fall, they visited the park again. Misaki decided to honestly express her feelings to Daiki. Daiki, too, resolved to talk openly about his future. They confirmed their feelings for each other and vowed to step forward together, envisioning a shared future."}]}` :

                `
                {"title":"桜の季節に出会った二人","characters":[{"name":"鑑賞者"},{"name":"美咲"},{"name":"大輝"}],"scenes":[{"scene_number":1,"scene_title":"運命の出会い","scene_body":"春の温かい日差しが差し込む午後、美咲はいつものカフェで休息を取っていた。新しいプロジェクトの事で頭を悩ませていた彼女は、カフェの隅でノートを広げて勉強している大輝に気付く。一見ふつうの学生だが、その瞳には何か特別な輝きがあり、美咲は妙に気になってしまう。大輝も、美咲の視線に気づき、二人は軽く微笑む。"},{"scene_number":2,"scene_title":"偶然の再会","scene_body":"数日後、美咲は仕事帰りに再びそのカフェに立ち寄る。すると、大輝も同じ場所で勉強していた。彼が美咲に気付き、思わず声をかける。「またお会いしましたね。ここが好きなんですか？」二人の会話は自然に流れ、互いの趣味や日常について話し始める。"},{"scene_number":3,"scene_title":"桜の下で","scene_body":"ある日、大輝は美咲を桜の名所に誘う。桜が満開の公園で二人は歩きながら多くの話題を共有する。美咲は、大輝の夢や目標を聞いて、彼の前向きな姿勢に感銘を受ける。一方、大輝も、美咲が経験した苦労や努力を尊敬し合う。桜の花びらが舞い散る中で、二人は一層親しくなり、お互いの心に惹かれていく。"},{"scene_number":4,"scene_title":"葛藤","scene_body":"日が経つにつれ、二人の距離は縮まっていくが、現実の問題も次第に浮かび上がる。美咲は仕事と恋愛のバランスに悩み、大輝は学業との両立に苦しむ。二人はお互いを支え合いながらも、自分の道に迷いが生じ始める。"},{"scene_number":5,"scene_title":"決断の時","scene_body":"桜が散り始めたある日、二人は再び公園を訪れる。美咲は、大輝に対して自分の気持ちを正直に伝えることを決意する。大輝も、将来について正直に話し合う覚悟を決めていた。互いの気持ちを確認し合い、二人は共に歩む未来を見据えて、新たな一歩を踏み出すことを誓う。"}]}
                `
            )
            // this.nowStory = JSON.parse(
            //     `{"scenes":[{"scene_number":1,"scene_title":"出会い","scene_body":"未来都市ネオトーキョー。優れたサイバネティック技術で有名な科学者、天野玲は新たな研究に没頭していた。ある日、黄金の目を持つ謎の敵、クロノスが現れる。"},{"scene_number":2,"scene_title":"最初の衝突","scene_body":"クロノスは次々と都市を襲撃し、民衆を恐怖に陥れる。玲は自らの技術を使い、エンジニアである友人、隼人と協力してクロノスに立ち向かうことを決意する。"},{"scene_number":3,"scene_title":"秘密の作戦","scene_body":"玲と隼人は秘密基地で特殊装備を開発。クロノスの弱点を探り当てるため、彼の過去のデータを解析する。そして、彼の動きを解析するプログラムが完成する。"},{"scene_number":4,"scene_title":"決戦の時","scene_body":"クロノスとの最終決戦が近づく。玲と隼人は最新鋭の装備を身に着け、クロノスの本拠地に乗り込む。激しい戦いが繰り広げられ、ついにクロノスの弱点を突くチャンスが訪れる。"},{"scene_number":5,"scene_title":"未来への希望","scene_body":"玲と隼人はクロノスを倒すことに成功する。ネオトーキョーは平和を取り戻し、玲は新たな研究を続けていく。困難を乗り越えた二人の友情は今後もますます深まるだろう。"}],"title":"クロノスとの戦い","characters":[{"name":"鑑賞者"},{"name":"天野玲 (主人公)"},{"name":"隼人"},{"name":"クロノス"}]}`
            //     )
        }else{
            this.nowStory = await makeStory(
                prompt,
                (story : Story) => {
                    this.ui.setStory(story)
                },
                this.language
            )
        }
        console.log(JSON.stringify(this.nowStory))
        this.ui.setStory(this.nowStory)
        this.generateDefaultEnvelopes();

    }

    async generateDefaultEnvelopes() {

        for (let chara of this.nowStory.characters) {
            await this.generateAndAddEnvelope(new EnvelopeInfo(
                chara,
                this.language == "en"  ? "Happiness Level" : "幸福度",
                this.language == "en"  ? "Unhappiness" : "不幸",
                this.language == "en" ? "Happiness" : "幸"
            ))
        }
    }

    async generateAndAddEnvelope(envelopeInfo: EnvelopeInfo) {
        let env = new Envelope(envelopeInfo, await getEnvelopeValues(this.nowStory, envelopeInfo, this.language),  async (index, value) => {
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
        let cs = await changeScenes(this.nowStory, this.envelopes, this.language)
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

