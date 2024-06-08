import {getEnvelopeValues} from "./index";

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
    data: number[]

    constructor(info:EnvelopeInfo, data:number[]) {
        this.info = info
        this.data = data
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