import $ from  'jquery'
import {StoryEditor} from "./editor";
import {UIManager} from "./ui";
import {EnvelopeInfo} from "./editor/query/types";






var editor : StoryEditor
$(document).ready(async function() {
    let ui = new UIManager()
    editor = new StoryEditor(ui)
    editor.language = "ja"

    ui.editor = editor
    ui.initialize()

    //await editor.generate("強大な敵に主人公が立ち向かう４章のSFストーリー．登場人物は主人公と敵合わせて2人で完結するようにすること", false)
    await editor.generate("", true)
    // var ts = await getTimeSeries(story)
    // console.log(ts)
    // nowTimeSeries = ts
    // jizuData = ts
    // points = []
    // jizuData.forEach(
    //     (v, i) => {
    //         points.push(new Point(i, v))
    //     }
    // )

});


