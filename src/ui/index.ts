import $ from "jquery";
import p5 from "p5";
import {Point} from "./point";
import {StoryEditor} from "../editor";
import {Character, Envelope, EnvelopeInfo, Story} from "../editor/query/types";
import {Track} from "./track";
import {darkenColor, rgbToHex, SizeInfo} from "./utils";

const pastelColors :[number, number, number][] = [
    [41, 62, 72],
    [70, 36, 46],
    [30, 47, 71],
    [42,47, 27],
];

// const pastelColors :[number, number, number][] = [
//     [41, 62, 72],
//
//     [30, 47, 71],
//     [70, 36, 46],
//     [30, 47, 71],
//     [70, 36, 46],
// ];

export class UIManager {
    width: number
    tracks: Track[] = []
    height: number
    editor: StoryEditor


    p: p5

    constructor() {
        this.width = $("#story_units").width();
        this.height = $("#story_units").height();

        const sketch = (p: p5) => {
            this.p = p

            p.setup = () => {
                const canvas = p.createCanvas(this.width, this.height);
                canvas.parent('#timeline'); // キャンバスを特定の要素に追加
                const resizeObserver = new ResizeObserver(entries => {
                    for (let entry of entries) {
                        if (entry.target.id === 'story_units') {
                            this.resizeCanvas($("#story_units").width(), this.height)
                        }
                    }
                });
                resizeObserver.observe($("#story_units")[0])
            };

            p.draw = () => {
                p.clear()
                for (const track of this.tracks) {
                    track.draw(p)
                }
            };

            p.mousePressed = () => {
                for (const track of this.tracks) {
                    track.mousePressed(p)
                }
            };

            p.mouseReleased = () => {

                for (const track of this.tracks) {
                    console.log("released")
                    track.mouseReleased(p)
                }
            };
        };



// p5インスタンスを作成
        new p5(sketch);
    }


    initialize() {
        $(".generate_envelope").on("click", () => {
            let min_description = $('input[name="min_description"]').val() as string;
            let max_description = $('input[name="max_description"]').val() as string;
            let parameter = $('input[name="parameter"]').val() as string;
            let chara_name = $("#chara_name").val() as string
            let chara = this.editor.getCharacterByName(chara_name)
            this.editor.generateAndAddEnvelope(
                new EnvelopeInfo(
                    chara,
                    parameter,
                    min_description,
                    max_description
                )
            )
        })
        $("#set_initial_story_button").on("click", () => {

            let input_field = $("#original_story");
            let request = input_field.val() as string

            console.log(request)
            if(request) {
                this.editor.generate(request + "\n\n以上のストーリの内容で，改行で章を区切って内容を「そのまま」設定してほしい．絶対にあなたが書き換えるな　ストーリーの内容への追加も許さない")
                $('#popup2').fadeOut();
                $('#popup-background').hide();
            }else{
                //時間があったら実装
            }


        })

        $("#generate_initial_story_button").on("click", () => {

            let input_field = $("#llm_request");
            let request = input_field.val() as string
            console.log(request)
            if(request) {
//                 request =
//                     `
// 第一章
// 未来都市ネオトーキョー。優れたサイバネテイック技術で有名な科学者、天野玲は新たな研究に没頭していた。ある日、黄金の目を持つ謎の敵、クロノスが現れる。
//
// 第二章
// 次々と都市を襲撃し、民衆を恐怖に陥れる。玲は自らの技術を使い、エンジニアである友人、隼人と協力してクロノスに立ち向かうことを決意する。
//
// 第三章
// 玲と隼人は秘密基地で特殊装備を開発。クロノスの弱点を探り当てるため、彼の過去のデータを解析する。そして、彼の動きを解析するプログラムが完成する。
//
// 第四章
// クロノスとの最終決戦が近づく。玲と隼人は最新鋭の装備を身に着け、クロノスの本拠地に乗り込む。激しい戦いが繰り広げられ、ついにクロノスの弱点を突くチャンスが訪れる。
//
// 第五章
// 玲と隼人はクロノスを倒すことに成功する。
// ネオトーキョーは平和を取り戻し、玲は新たな研究を続けていく。困難を乗り越えた二人の友情は今後もますます深まるだろう。
//
// これをこのまま設定して
                    `
//                 request =
//                     `
// 第一章
// 春の温かい日差しが差し込む午後、美咲はいつものカフェで休息を取っていた。新しいプロジェクトの事で頭を悩ませていた彼女は、カフェの隅でノートを広げて勉強している大＋ 輝に気付く。一見ふつうの学生だが、その瞳には何か特別な輝きがあり、美咲は妙に気になってしまう。大輝も、美咲の視線に気づき、二人は軽く微笑む。
//
// 第二章
// 数日後、美咲は仕事帰りに手びそのカフェに立ち寄る。すると、大輝も同じ場所で勉強していた。彼が美咲に気付き、思わず声をかける。「またお会いしましたね。ここが好きなんですか？」二人の会話は自然に流れ、互いの趣味や日常について話し始める。
//
//
// 第三章
// ある日、大輝は美咲を桜の名所に誘う。桜が満開の公園で二人は歩きながら多くの話題を共有する。美咲は、大輝の夢や目標を聞いて、彼の前向きな姿勢に感銘を受ける。一+ 方、大輝も、美咲が経験した苦労や努力を尊敬し合う。桜の花びらが舞い散る中で、二人は一層親しくなり、お互いの心に惹かれていく。
//
// 第四章
// 日が経つにつれ、二人の距離は縮まっていくが、現実の問題も次第に浮かび上がる。美咲は仕事と恋愛のバランスに悩み、大輝は学業との両立に苦しむ。二人はお互いを支え合いながらも、自分の道に迷いが生じ始める。
//
// 第五章
// 桜が散り始めたある日、二人は手び公園を訪れる。美咲は、大輝に対して自分の気持ちを正直に伝えることを決意する。大輝も、将来について正直に話し合う覚悟を決めていた。
// 互いの気持ちを確認し合い、二人は共に歩む未来を見据えて、新たな一歩を踏み出すことを誓う。
//
//
// なお．大輝は大学院生とする．大輝を1番目とすること
// これをこのまま設定して
//                     `
                this.editor.generate(request)
                $('#popup2').fadeOut();
                $('#popup-background').hide();
            }else{
                //時間があったら実装
            }


        })

        $(".track_descriptions").css("margin-top",
            $("#story_units").outerHeight()
            )

        $('#reflectChange').click(() => {
            this.editor.reflectChange()
        });



        $(document).ready(function(){
            function syncScroll(source : string, target : string) {
                $(source).on('scroll', function() {
                    $(target).scrollTop($(source).scrollTop());
                    $(target).scrollLeft($(source).scrollLeft());
                });
            }

            syncScroll('.track_descriptions', '#timeline');
            syncScroll('#timeline', '.track_descriptions');

                // ポップアップを開く
                $('#add_envelope_button').click(function() {
                    $('#popup-background').show();
                    $('#popup').fadeIn();
                });

                // ポップアップを閉じる
                $('#close-popup, #popup-background').click(function() {
                    $('#popup').fadeOut();
                    $('#popup-background').hide();
                });

            // ポップアップを開く
            $('.set_basic_story_button').click(function() {
                $('#popup-background').show();
                $('#popup2').fadeIn();
            });

            // ポップアップを閉じる
            $('#close-popup2, #popup-background').click(function() {
                $('#popup2').fadeOut();
                $('#popup-background').hide();
            });

        });

    }

    addTrack(envelope: Envelope) {
        let x = 0
        let height = 100
        let y = this.tracks.length * height
        let c = pastelColors[this.tracks.length % pastelColors.length]
        c[0] -= 10
        c[1] -= 10
        c[2] -= 10
        this.tracks.push(new Track(x, y, this.width, height, envelope, c))
        this.resizeCanvas(this.width, y + height)
        var newDiv = $(`<div>${envelope.info.character.name}<br>${envelope.info.name}</div>`);
        newDiv.height(height)
        newDiv.css("background-color", rgbToHex(darkenColor(c ,0.5)))
        $(".track_descriptions").append(newDiv)
    }

    removeAllTrack() {
        this.tracks = []
        $(".track_descriptions").empty()

    }

    addCharacter(chara: Character | Character[]) {
        function _addChara(chara: Character) {
            var newOption = $(`<option value="${chara.name}">${chara.name}</option>`);
            $("#chara_name").append(newOption)
        }
        if (Array.isArray(chara)) {
            for (let c of chara) {
                _addChara(c)
            }
        } else {
            _addChara(chara)
        }
    }

    setCharacters(charas: Character[]) {
        $("#chara_name").empty()
        this.addCharacter(charas)
    }


    resizeCanvas(width: number, height: number) {
        this.width = width
        this.height = height
        this.p.resizeCanvas(this.width, this.height);
    }

    setStory(story: Story, regenerateAddButton:boolean) {
        this.resetScene()
        if (story.title) {
            this.setTitle(story.title)
        }
        for (const unit of story.scenes) {
            this.addScene(`「${unit.scene_title}」\n` + unit.scene_body)
        }
        if (story.characters) {
            this.setCharacters(story.characters)
        }
        if(regenerateAddButton) {
            this.regenerateAddStoryButton(story)
        }


    }
    reloadTracks() {
        for(let track of this.tracks) {
            track.regenerate()
        }
    }

    addScene(body: string) {
        var newDiv = $(`<div class="story_unit">${body}</div>`);
        $("#inner_story_units").append(newDiv)
    }

    regenerateAddStoryButton(story: Story) {
        let si = new SizeInfo()
        $("#add_story_button_area").empty()
        for (let [i, scene] of story.scenes.entries()) {
            var newDiv = $(`<div id="add_button"><img src="plus_icon.png"></div>`);
            newDiv.css({
                left: si.story_units_padding + i * (si.story_unit_width + si.story_unit_margin * 2),
                top: si.story_unit_height  / 2
            })
            newDiv.on("click" , ()  => {
                this.editor.insertEmptyScene(i)
            })
            $("#add_story_button_area").append(newDiv)
        }

    }

    resetScene() {
        $("#inner_story_units").empty()
    }

    setTitle(title: string) {
        $(".title_name").text(title)
    }

}