import $ from "jquery";
import {Track} from "./track";
import {SizeInfo} from "./utils";

export class Point {
    index : number;
    value : number;
    x: number;
    y: number;
    beingDragged: boolean = false;
    callback : (v: number, i:number)=>void ;

    track: Track
    r:number = 10;

    constructor(index:number, value:number, track:Track, callback:(v: number, i:number) => void) {
        this.index = index
        this.value = value
        this.track = track
        this.callback = callback
        this.ivToXy()
    }

    ivToXy() {
        let sf = new SizeInfo()
        let height = this.track.height
        this.x =  sf.story_units_padding +  ((this.index + 0.5) * ( sf.story_unit_width + sf.story_unit_margin * 2))
        this.y = this.track.y - this.value * height/2 + height/2
    }
    yTov() {
        let height = this.track.height
        this.value = (this.track.y -(this.y - height/2)) /(height/2)
    }

    dragging() {

    }

    async dragFinish() {
        this.yTov()
        this.callback(this.value, this.index)
    }

}