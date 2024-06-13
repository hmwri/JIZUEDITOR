import {Envelope} from "../editor/query/types";
import p5 from "p5";
import $ from "jquery";
import {Point} from "./point";
import {changeStory} from "../editor/query";

export class Track {
    x : number
    y : number
    color: number[]
    width : number
    height : number
    envelope: Envelope
    points: Point[] = []
    scene_width : number
    draggingPoint: Point | null = null;

    constructor(x:number, y:number, width:number, height:number, envelope:Envelope, color:number[]) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.envelope = envelope
        this.scene_width = $(".story_unit").width()
        this.color = color
        this.generatePoint()
    }

    regenerate() {
        this.points = []
        this.generatePoint()
    }

    draw(p : p5) {
        this.width = $("#story_units").width()
        p.noStroke()
        p.fill(this.color)
        p.rect(this.x, this.y, this.width, this.height)
        p.noFill()

        p.stroke(0,0,0, 150)

        for(let i=0; i< 5; i++) {
            if(i == 2) {
                p.stroke(0,0,0)
                p.strokeWeight(2)
            }else{
                p.stroke(0,0,0, 150)
                p.strokeWeight(1)
            }
            p.line(this.x , this.y+ i/4 * this.height, this.x + this.width, this.y+ i/4 * this.height)
        }
        p.strokeWeight(3)
        p.stroke(20,20,240)

        // ラインを描画
        p.beginShape();
        for (const point of this.points) {
            p.vertex(point.x, point.y);
        }
        p.endShape();

        p.noStroke()

        // データポイントを描画
        for (const point of this.points) {
            p.fill(0);
            p.ellipse(point.x, point.y, point.r, point.r);
        }

        // ドラッグ中のポイントを更新
        if (this.draggingPoint) {
            this.draggingPoint.y = Math.max(this.y, Math.min(p.mouseY, this.y + this.height));
        }
    }


    mousePressed(p : p5){
            for (const point of this.points) {
                const d = p.dist(p.mouseX, p.mouseY, point.x, point.y);
                if (d < point.r) {
                    this.draggingPoint = point;
                    point.beingDragged = true;
                }
            }
    }

    mouseReleased(p: p5) {
            if (this.draggingPoint) {
               this.draggingPoint.beingDragged = false;
               this.draggingPoint.dragFinish();
               this.draggingPoint = null;
            }
    }

    generatePoint() {
        for (let [i, v] of this.envelope.data.entries()) {
            this.points.push(
                new Point(i, v, this, (value, index) => {
                    this.envelope.changeValue(index, value)
                })
            )
        }
    }
}