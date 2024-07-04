import $ from "jquery";

export class SizeInfo {
    width:number
    height:number
    story_unit_width: number
    story_unit_height: number
    story_units_padding: number
    story_unit_margin:number
    constructor() {
        this.width = $("#story_units").outerWidth()
        this.height = $("#story_units").outerHeight()
        this.story_unit_width = $(".story_unit").outerWidth()
        this.story_unit_height =$(".story_unit").outerHeight()

        this.story_units_padding = parseInt($("#story_units").css("padding-left"), 10)
        this.story_unit_margin = parseInt($(".story_unit").css("margin-left"), 10)
    }
}

export function rgbToHex([r, g, b]: [number, number, number]): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}
// RGBカラーを少し暗くする関数
export function darkenColor(rgb: [number, number, number], factor: number): [number, number, number] {
    const [r, g, b] = rgb;
    return [
        Math.max(0, Math.floor(r * factor)),
        Math.max(0, Math.floor(g * factor)),
        Math.max(0, Math.floor(b * factor))
    ];
}