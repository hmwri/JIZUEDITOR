import {Character, Envelope, EnvelopeInfo, Scene, Story,} from "./query/types";
import {changeScenes, generateImageFromScene, getEnvelopeValues, makeStory} from "./query";
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
            // this.nowStory = JSON.parse(
            //
            //     this.language == "en" ?
            //         `{"title":"The Two Who Met in the Season of Cherry Blossoms","characters":[{"name":"Observer"},{"name":"Misaki"},{"name":"Daiki"}],"scenes":[{"scene_number":1,"scene_title":"A Fateful Encounter","scene_body":"On a warm spring afternoon, Misaki was taking a break at her usual café. She was troubled by thoughts of her new project and noticed Daiki studying with a notebook in a corner of the café. He seemed like an ordinary student, but there was something special about the sparkle in his eyes that intrigued Misaki. Daiki also noticed Misaki's gaze, and they exchanged a brief smile."},{"scene_number":2,"scene_title":"A Chance Reunion","scene_body":"A few days later, Misaki stopped by the same café on her way home from work. She found Daiki studying in the same spot. Noticing her, Daiki couldn't help but speak up. 'We meet again. Do you like this place too?' Their conversation flowed naturally, and they began talking about their hobbies and daily lives."},{"scene_number":3,"scene_title":"Under the Cherry Blossoms","scene_body":"One day, Daiki invited Misaki to a famous cherry blossom spot. Walking through the park full of blooming sakura, they shared many topics. Misaki was impressed by Daiki's dreams and aspirations, while Daiki admired Misaki for her struggles and hard work. As the cherry petals fluttered around them, they grew closer and felt a mutual attraction."},{"scene_number":4,"scene_title":"Conflict","scene_body":"As time passed, the distance between them decreased, but real-life problems began to surface. Misaki struggled to balance her work and romance, while Daiki found it hard to manage his studies. They supported each other, but doubts about their paths started to creep in."},{"scene_number":5,"scene_title":"Time for Decisions","scene_body":"On a day when the cherry blossoms began to fall, they visited the park again. Misaki decided to honestly express her feelings to Daiki. Daiki, too, resolved to talk openly about his future. They confirmed their feelings for each other and vowed to step forward together, envisioning a shared future."}]}` :
            //
            //     `
            //     {"title":"桜の季節に出会った二人","characters":[{"name":"鑑賞者"},{"name":"美咲"},{"name":"大輝"}],"scenes":[{"scene_number":1,"scene_title":"運命の出会い","scene_body":"春の温かい日差しが差し込む午後、美咲はいつものカフェで休息を取っていた。新しいプロジェクトの事で頭を悩ませていた彼女は、カフェの隅でノートを広げて勉強している大輝に気付く。一見ふつうの学生だが、その瞳には何か特別な輝きがあり、美咲は妙に気になってしまう。大輝も、美咲の視線に気づき、二人は軽く微笑む。"},{"scene_number":2,"scene_title":"偶然の再会","scene_body":"数日後、美咲は仕事帰りに再びそのカフェに立ち寄る。すると、大輝も同じ場所で勉強していた。彼が美咲に気付き、思わず声をかける。「またお会いしましたね。ここが好きなんですか？」二人の会話は自然に流れ、互いの趣味や日常について話し始める。"},{"scene_number":3,"scene_title":"桜の下で","scene_body":"ある日、大輝は美咲を桜の名所に誘う。桜が満開の公園で二人は歩きながら多くの話題を共有する。美咲は、大輝の夢や目標を聞いて、彼の前向きな姿勢に感銘を受ける。一方、大輝も、美咲が経験した苦労や努力を尊敬し合う。桜の花びらが舞い散る中で、二人は一層親しくなり、お互いの心に惹かれていく。"},{"scene_number":4,"scene_title":"葛藤","scene_body":"日が経つにつれ、二人の距離は縮まっていくが、現実の問題も次第に浮かび上がる。美咲は仕事と恋愛のバランスに悩み、大輝は学業との両立に苦しむ。二人はお互いを支え合いながらも、自分の道に迷いが生じ始める。"},{"scene_number":5,"scene_title":"決断の時","scene_body":"桜が散り始めたある日、二人は再び公園を訪れる。美咲は、大輝に対して自分の気持ちを正直に伝えることを決意する。大輝も、将来について正直に話し合う覚悟を決めていた。互いの気持ちを確認し合い、二人は共に歩む未来を見据えて、新たな一歩を踏み出すことを誓う。"}]}
            //     `
            // )


            // this.nowStory = {"title":"メロスの約束","characters":[{"name":"鑑賞者"},{"name":"メロス","description":"正義感が強く、妹思いの青年。","looks":"背が高く、筋肉質で、短い黒髪。古代ギリシャ風のチュニックを着ている。"},{"name":"セリヌンティウス","description":"メロスの親友で、冷静で思慮深い性格。","looks":"細身で、穏やかな顔立ち。メロス同様、ギリシャ風の服を着ている。"},{"name":"ディオニス王","description":"シラクスの暴君。冷酷で権力を重んじる。","looks":"中年の男で、豪華な王服をまとい、険しい表情をしている。"}],"scenes":[{"scene_number":1,"scene_title":"メロスの旅立ち","scene_body":"メロスは妹の結婚式の準備のため、シラクスの町を訪れる。親友セリヌンティウスに会う予定も立てており、心楽しく旅に出る。"},{"scene_number":2,"scene_title":"町の異変","scene_body":"シラクスに到着すると、かつて活気に溢れていたはずの町が静まり返っている。メロスは不審に思い、路地裏で老人からディオニス王の暴政が原因と聞く。"},{"scene_number":3,"scene_title":"ディオニス王との対決","scene_body":"怒りに駆られたメロスは城に乗り込み、王に捕らえられる。メロスは王の不信感を非難し、死を覚悟するが、妹の結婚式を思い出す。"},{"scene_number":4,"scene_title":"3日間の猶予","scene_body":"メロスは王に3日間の猶予を願い出る。セリヌンティウスを人質にすることで王は同意し、メロスは急いで妹の元へ戻ることを決意する。"},{"scene_number":5,"scene_title":"セリヌンティウスとの別れ","scene_body":"事情をセリヌンティウスに説明し、友は無言で受け入れる。深い友情を胸に、メロスは急ぎ足で帰路につく。"},{"scene_number":6,"scene_title":"妹の結婚式","scene_body":"村に戻ったメロスは結婚式の準備を整え、式を無事に執り行う。一瞬の迷いを振り切り、約束を守る決意を新たにする。"},{"scene_number":7,"scene_title":"帰路の苦難：氾濫する川","scene_body":"シラクスへの帰路で、氾濫した川に行く手を阻まれる。命がけで泳ぎ切るが、時間は刻々と過ぎているため、焦る。"},{"scene_number":8,"scene_title":"山賊との戦い","scene_body":"疲労困憊のメロスの前に山賊が現れる。残りの力を振り絞って戦うが、力尽きて倒れてしまう。"},{"scene_number":9,"scene_title":"最後の力","scene_body":"絶望的な状況の中、水を得たメロスは再び力を取り戻す。信念の力で驚異的なスピードで走り出し、シラクスに向かう。"},{"scene_number":10,"scene_title":"約束の成就と王の改心","scene_body":"刑場に滑り込んだメロスは、ギリギリでセリヌンティウスを救う。互いの弱さを認め合う姿に、ディオニス王が心を動かされ、信実の価値を悟る。"}]}

            // // for(let i=0; i< this.nowStory.scenes.length; i++) {
            //     this.generateImage(i).then( (value) => {
            //         console.log(value)
            //     })
            // }

            // this.nowStory = {"title":"春風に舞う偶然","characters":[{"name":"鑑賞者"},{"name":"大輝","description":"物語の主人公。誠実で優しい青年。","looks":"背が高く、短髪で清潔感のある服装を好む。"},{"name":"美咲","description":"物語のヒロイン。冷たい態度を装っているが、内面は繊細。","looks":"細身で長い黒髪を持ち、上品な服装をしている。"}],"scenes":[{"scene_number":1,"scene_title":"出会いの春風","scene_body":"春の暖かい風が吹く中、大輝は公園で一人の女性とぶつかる。それが美咲だった。突如の出会いに大輝は一瞬にして心を奪われるが、彼女の冷たい態度に気後れする。しかし、何とか彼女の名前を聞き出し、その場は互いに別れる。大輝はこの出会いが重要であることを直感し、美咲のことが頭から離れなくなる。"},{"scene_number":2,"scene_title":"再会と打ち解け","scene_body":"数週間後、桜が満開の公園で再び二人は出会う。美咲は最初の出会いよりも穏やかで、互いに少しずつ打ち解ける。大輝は美咲に話しかけ、彼女の趣味や仕事の話に興味を示す。美咲も大輝の誠実さに少しずつ心を開き、笑顔が増える。二人は連絡先を交換し、次の再会を約束する。"},{"scene_number":3,"scene_title":"友情の芽生え","scene_body":"大輝は定期的に美咲と会い、二人の関係は友情へと進展する。休日には一緒に散歩を楽しみ、カフェで長い時間を過ごす。大輝の優しさや共感力に、美咲は次第に心を許すようになる。彼女の笑顔を見るたびに、大輝の胸には温かい感情が広がる。美咲も大輝との時間を楽しみ、彼に対して好意を感じ始める。"},{"scene_number":4,"scene_title":"不協和音","scene_body":"桜吹雪が舞う中、大輝と美咲はいつもの公園で待ち合わせした。大輝は仕事で疲れていたが、美咲に会うことで元気を取り戻すつもりだった。しかし、美咲の表情は硬く、何か悩みがある様子だ。理由を聞いても美咲は言葉を飲み込み、うつむくだけだった。その後、美咲の誤解から小さな言い争いが勃発し、二人は険悪なムードに包まれる。美咲は涙をこらえながら、大輝の元を去り、その後連絡が途絶える。大輝は美咲のことが気になりながらも、どうすれば良いのか分からず途方に暮れる。"},{"scene_number":5,"scene_title":"再出発の誓い","scene_body":"桜が散り始めたある日、二人は再び公園を訪れる。美咲は、大輝に対して自分の気持ちを正直に伝えることを決意する。大輝も、将来について正直に話し合う覚悟を決めていた。互いの気持ちを確認し合い、二人は共に歩む未来を見据えて、新たな一歩を踏み出すことを誓う。"}]}
            //
            //

            this.nowStory = JSON.parse(
                `{"scenes":[{"scene_number":1,"scene_title":"出会い","scene_body":"未来都市ネオトーキョー。優れたサイバネティック技術で有名な科学者、天野玲は新たな研究に没頭していた。ある日、黄金の目を持つ謎の敵、クロノスが現れる。"},{"scene_number":2,"scene_title":"最初の衝突","scene_body":"クロノスは次々と都市を襲撃し、民衆を恐怖に陥れる。玲は自らの技術を使い、エンジニアである友人、隼人と協力してクロノスに立ち向かうことを決意する。"},{"scene_number":3,"scene_title":"秘密の作戦","scene_body":"玲と隼人は秘密基地で特殊装備を開発。クロノスの弱点を探り当てるため、彼の過去のデータを解析する。そして、彼の動きを解析するプログラムが完成する。"},{"scene_number":4,"scene_title":"決戦の時","scene_body":"クロノスとの最終決戦が近づく。玲と隼人は最新鋭の装備を身に着け、クロノスの本拠地に乗り込む。激しい戦いが繰り広げられ、ついにクロノスの弱点を突くチャンスが訪れる。"},{"scene_number":5,"scene_title":"未来への希望","scene_body":"玲と隼人はクロノスを倒すことに成功する。ネオトーキョーは平和を取り戻し、玲は新たな研究を続けていく。困難を乗り越えた二人の友情は今後もますます深まるだろう。"}],"title":"クロノスとの戦い","characters":[{"name":"鑑賞者"},{"name":"天野玲 (主人公)"},{"name":"隼人"},{"name":"クロノス"}]}`
                )
        }else{
            let last_image_generated_index = -1
            this.nowStory = await makeStory(
                prompt,
                (story : Story) => {
                    this.nowStory = story
                    if(story.scenes.length - 2 == last_image_generated_index + 1) {
                        last_image_generated_index  += 1
                        console.log(`generating... ${last_image_generated_index}`)
                        // this.generateImage(last_image_generated_index).then(
                        //     (value) => {
                        //         console.log(value)
                        //     }
                        // )
                    }
                    this.ui.setStory(story, false)
                },
                this.language
            )
        }
        console.log(JSON.stringify(this.nowStory))
        this.ui.setStory(this.nowStory, true)
        for (let scene of this.nowStory.scenes) {
            scene.scene_body
        }



        await this.generateDefaultEnvelopes();

        // let envs = [
        //     {
        //         "主体": "鑑賞者",
        //         "心情": "幸福度",
        //         "尺度": "不幸(-1) ~ 幸(1)",
        //         "値の変動": {
        //             "第1章": 0.3,
        //             "第2章": 0.4,
        //             "第3章": 0.6,
        //             "第4章": -0.2,
        //             "第5章": 0.7
        //         }
        //     },
        //     {
        //         "主体": "大輝",
        //         "心情": "幸福度",
        //         "尺度": "不幸(-1) ~ 幸(1)",
        //         "値の変動": {
        //             "第1章": 0.4,
        //             "第2章": 0.6,
        //             "第3章": 0.8,
        //             "第4章": 0.2,
        //             "第5章": 0.8
        //         }
        //     },
        //     {
        //         "主体": "美咲",
        //         "心情": "幸福度",
        //         "尺度": "不幸(-1) ~ 幸(1)",
        //         "値の変動": {
        //             "第1章": 0.4,
        //             "第2章": 0.6,
        //             "第3章": 0.8,
        //             "第4章": 0,
        //             "第5章": 0.7
        //         }
        //     },
        //     {
        //         "主体": "大輝",
        //         "心情": "美咲への好意",
        //         "尺度": "嫌い(-1) ~ 好き(1)",
        //         "値の変動": {
        //             "第1章": 0.81,
        //             "第2章": 0.83,
        //             "第3章": 0.87,
        //             "第4章": 0.7,
        //             "第5章": 0.8
        //         }
        //     },
        //     {
        //         "主体": "美咲",
        //         "心情": "大輝への好意",
        //         "尺度": "嫌い(-1) ~ 好き(1)",
        //         "値の変動": {
        //             "第1章": -0.15,
        //             "第2章": 0.21,
        //             "第3章": 0.65,
        //             "第4章": 0.5,
        //             "第5章": 0.8
        //         }
        //     }
        // ]
        //
        // let stringToSi = [0,1,2,1,2]
        //
        // for(let i=0; i< envs.length; i++) {
        //     let env =                 new Envelope(
        //         new EnvelopeInfo(
        //             this.nowStory.characters[stringToSi[i]],
        //             envs[i].心情,
        //             i <= 2 ? "不幸" : "嫌い",
        //             i <= 2 ? "幸" : "好き",
        //
        //         ),
        //         Object.values(envs[i].値の変動),
        //         async (index, value) => {
        //             // let scene_body = await  changeStory(this.nowStory, env, index, value)
        //             // this.nowStory.scenes[index].scene_body = scene_body
        //             this.ui.setStory(this.nowStory, true)
        //         }
        //     )
        //     this.envelopes.push(
        //         env
        //         )
        //     console.log(this.envelopes)
        //     this.ui.addTrack(
        //         env
        //     )
        //
        // }
        //
        // this.ui.setStory(this.nowStory, true)




        // await this.generateAndAddEnvelope(
        //     new EnvelopeInfo(
        //         this.nowStory.characters[1],
        //         "美咲への好意",
        //         "嫌い",
        //         "好き"
        //     )
        // )
        // this.generateAndAddEnvelope(
        //     new EnvelopeInfo(
        //         this.nowStory.characters[2],
        //         "大輝への好意",
        //         "嫌い",
        //         "好き"
        //     )
        // )

    }


    async generateImage(scene_number:number) {
        console.log(this.nowStory.scenes)
        return await generateImageFromScene(this.nowStory, scene_number)
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
            this.ui.setStory(this.nowStory, true)
        })
        this.envelopes.push(
            env
        )
        this.ui.addTrack(
            env
        )
    }


    async reflectChange() {

        let streamingCallback = (scenes:Scene[]) => {
            for (let c of scenes) {
                this.nowStory.scenes[c.scene_number - 1] = c
            }
            this.ui.setStory(this.nowStory, false)
        }

        let cs = await changeScenes(this.nowStory, this.envelopes, streamingCallback, this.language)
        for(let env of this.envelopes){
            env.commit()
        }

        for (let c of cs) {
           this.nowStory.scenes[c.scene_number - 1] = c
        }

        this.ui.setStory(this.nowStory, true)

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
        this.ui.setStory(this.nowStory, true)
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

