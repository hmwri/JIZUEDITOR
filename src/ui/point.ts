import $ from "jquery";
import {Track} from "./track";

export class Point {
    index : number;
    value : number;
    x: number;
    y: number;
    beingDragged: boolean = false;
    track: Track
    r:number = 10;

    constructor(index:number, value:number, track:Track) {
        this.index = index
        this.value = value
        this.track = track
        this.ivToXy()
    }

    ivToXy() {
        let height = this.track.height
        this.x =  (this.index + 0.5) * $(".story_unit").width()
        this.y = this.track.y - this.value * height/2 + height/2
    }
    yTov() {
        let height = this.track.height
        this.value =  -(this.y - height/2) /(height/2)
    }

    dragging() {

    }

    async dragFinish() {
        this.yTov()
        // let s = await changeStory(nowStory, nowTimeSeries, this.index, this.value)
        //
        // nowStory[this.index] = s

    }

}