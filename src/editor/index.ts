import {Character, Envelope, EnvelopeInfo, Story,} from "./query/types";
import {getEnvelopeValues, makeStory} from "./query";
import {UIManager} from "../ui";




export class StoryEditor {
    ui : UIManager
    nowStory : Story
    envelopes : Envelope[] = []

    constructor(ui : UIManager) {
        this.ui = ui
    }

    async generate() {
        this.nowStory = await makeStory(
            "亀が主人公の物語",
            (story : Story) => {
                this.ui.setStory(story)
            }
        )


        this.ui.setStory(this.nowStory)

    }

    async generateDefaultEnvelopes() {
        for (let chara of this.nowStory.characters) {
            await this.generateAndAddEnvelope(new EnvelopeInfo(
                chara,
                "幸福度",
                "不幸",
                "幸"
            ))
        }
    }

    async generateAndAddEnvelope(envelopeInfo: EnvelopeInfo) {
        let env = new Envelope(envelopeInfo, await getEnvelopeValues(this.nowStory, envelopeInfo))
        this.envelopes.push(
            env
        )
        this.ui.addTrack(
            env
        )

    }
}

