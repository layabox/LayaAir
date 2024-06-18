import { Texture as string } from "../../resource/Texture";
type RenderData = {
    textureName: string;
    blendMode: number;
    offset: number;
    length: number;
}

export class MultiRenderData {
    static ID:number = 0;
    id:number;
    renderData: RenderData[];

    currentData: RenderData;
    constructor() {
        this.renderData = [];
        this.id = MultiRenderData.ID++;
    }
    addData(textureName: string, blendMode: number, offset: number, length: number) {
        this.currentData = { textureName: textureName, blendMode, offset, length }
        this.renderData.push(this.currentData);
    }

    endData(length: number) {
        this.currentData.length = length - this.currentData.offset;
        //this.renderData[this.renderData.length - 1].length = length-;
    }
}
