import $ from  'jquery'
import {StoryEditor} from "./editor";
import {UIManager} from "./ui";
import {EnvelopeInfo} from "./editor/query/types";


var editor : StoryEditor
$(document).ready(async function() {
    let ui = new UIManager()
    editor = new StoryEditor(ui)
    await editor.generate()
    editor.generateDefaultEnvelopes()

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


