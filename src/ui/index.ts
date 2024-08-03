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
    [48, 67, 46],
    [30, 47, 71],
    [32, 67, 67],
];



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
        let c = pastelColors[this.tracks.length % 5]
        this.tracks.push(new Track(x, y, this.width, height, envelope, c))
        this.resizeCanvas(this.width, y + height)
        var newDiv = $(`<div>${envelope.info.character.name}<br>${envelope.info.name}</div>`);
        newDiv.height(height)
        newDiv.css("background-color", rgbToHex(darkenColor(c ,0.5)))
        $(".track_descriptions").append(newDiv)
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

    setStory(story: Story) {
        this.resetScene()
        if (story.title) {
            this.setTitle(story.title)
        }
        for (const unit of story.scenes) {
            this.addScene(unit.scene_body)
        }
        if (story.characters) {
            this.setCharacters(story.characters)
        }
        this.regenerateAddStoryButton(story)

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