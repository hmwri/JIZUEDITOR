import {changeStory, getEnvelopeValues} from "./index";
import { v4 as uuidv4 } from "uuid"
const clonedeep = require('lodash/cloneDeep');

export interface Character {
    name: string;
}

export interface Scene {
    scene_number: number;
    scene_title: string;
    scene_body: string;
}

export class Story {
    scenes: Scene[];
    title: string;
    characters: Character[];
}

export class Envelope {
    info : EnvelopeInfo
    id : string
    readonly data: number[]
    head_data : number[]
    changeValueCallback: (index: number, value: number)  => Promise<void>

    constructor(info:EnvelopeInfo, data:number[], changeValueCallback: (index: number, value: number) => Promise<void>) {
        this.info = info
        this.data = data
        this.id = uuidv4()
        this.changeValueCallback = changeValueCallback
    }

    async changeValue(index:number, value:number) {
        await this.changeValueCallback(index, value)
        this.data[index] = value

    }
    insertEmptyPoint(index: number) {
        this.data.splice(index, 0, this.data[index])
        this.head_data.splice(index, 0, this.data[index])
    }
    commit() {
        this.head_data = clonedeep(this.data)
    }
    isDiff(index:number) {
        return this.data[index] == this.head_data[index]
    }
}

export class EnvelopeInfo {
    character: Character
    name : string
    min_description : string
    max_description : string

    constructor(character:Character, name:string, min_description:string, max_description:string) {
        this.character = character
        this.name = name
        this.min_description = min_description
        this.max_description = max_description
    }



}