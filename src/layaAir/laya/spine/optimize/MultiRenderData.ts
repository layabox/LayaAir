import { Texture } from "../../resource/Texture";
type RenderData = {
    texture: Texture;
    blendMode: number;
    offset: number;
    length: number;
}

export class MultiRenderData {
    renderData: RenderData[];

    currentData: RenderData;
    constructor() {
        this.renderData = [];
    }
    addData(texture: Texture, blendMode: number, offset: number, length: number) {
        this.currentData = { texture, blendMode, offset, length }
        this.renderData.push(this.currentData);
    }

    endData(length: number) {
        this.currentData.length = length - this.currentData.offset;
        //this.renderData[this.renderData.length - 1].length = length-;
    }
}