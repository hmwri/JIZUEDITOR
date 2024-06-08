import $ from "jquery";
import p5 from "p5";
import {Point} from "./point";
import {StoryEditor} from "../editor";
import {Envelope, Story} from "../editor/query/types";
import {Track} from "./track";

const pastelColors = [
    [255, 179, 186], // Light Pink
    [255, 223, 186], // Light Peach
    [255, 255, 186], // Light Yellow
    [186, 255, 201], // Light Mint
    [186, 225, 255]  // Light Sky Blue
];

export class UIManager {
    width : number
    tracks:Track[] = []
    height : number
    p: p5
    constructor() {
        let jizuData :number[] = [];
        let points: Point[] = [];
        let nowTimeSeries : number[] = []
        let draggingPoint: Point | null = null;




        this.width  = $("#story_units").width();
        this.height = $("#story_units").height();

        let story_unit_width = $(".story_unit").width();



        const sketch = (p: p5) => {
            this.p = p

            p.setup = () => {
                const canvas = p.createCanvas(this.width, this.height);
                canvas.parent('#timeline'); // キャンバスを特定の要素に追加
                const resizeObserver = new ResizeObserver(entries => {
                    for (let entry of entries) {
                        if (entry.target.id === 'story_units') {
                            this.resizeCanvas( $("#story_units").width(),  $("#story_units").height())
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

    addTrack(envelope: Envelope) {
        let x = 0
        let height = 150
        let y = this.tracks.length * height
        this.tracks.push( new Track(x, y, this.width, height, envelope, pastelColors[this.tracks.length % 5]))
        this.resizeCanvas(this.width, y + this.height)
    }


    resizeCanvas(width : number, height : number){
        this.width = width
        this.height = height
        this.p.resizeCanvas(this.width, this.height);

    }

    setStory(story :Story) {
        this.resetScene()
        if(story.title) {
            this.setTitle(story.title)
        }
        for (const unit of story.scenes) {
            this.addScene(unit.scene_body)
        }

    }

    addScene(body:string) {
        var newDiv = $(`<div class="story_unit">${body}</div>`);
        $("#story_units").append(newDiv)

    }

    resetScene() {
        $("#story_units").empty()
    }

    setTitle(title: string){
        $(".title_name").text(title)
    }

}