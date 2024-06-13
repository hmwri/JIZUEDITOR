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
