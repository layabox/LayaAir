import { Material } from "../../resource/Material";
type RenderData = {
    material?: Material;
    textureName: string;
    blendMode: number;
    offset: number;
    length: number;
}

/**
 * @en Represents a collection of multiple render data.
 * @zh 表示多个渲染数据的集合。
 */
export class MultiRenderData {
    /**
     * @en Unique identifier for MultiRenderData instances.
     * @zh MultiRenderData 实例的唯一标识符。
     */
    static ID:number = 0;
    id:number;
    /**
     * @en Render data array.
     * @zh 渲染数据数组。
     */
    renderData: RenderData[];

    /**
     * @en The current RenderData being processed.
     * @zh 当前正在处理的 RenderData。
     */
    currentData: RenderData;
    /** @ignore */
    constructor() {
        this.renderData = [];
        this.id = MultiRenderData.ID++;
    }
    /**
     * @en Adds new render data to the collection.
     * @param textureName The name of the texture.
     * @param blendMode The blend mode for rendering.
     * @param offset The starting offset in the vertex buffer.
     * @param length The initial length of data.
     * @zh 向集合中添加新的渲染数据。
     * @param textureName 纹理的名称。
     * @param blendMode 渲染的混合模式。
     * @param offset 顶点缓冲区中的起始偏移量。
     * @param length 数据的初始长度。
     */
    addData(textureName: string, blendMode: number, offset: number, length: number) {
        this.currentData = { textureName: textureName, blendMode, offset, length }
        this.renderData.push(this.currentData);
    }

    /**
     * @en Finalizes the current render data by updating its length.
     * @param length The final length of the data.
     * @zh 通过更新长度来完成当前渲染数据的处理。
     * @param length 数据的最终长度。
     */
    endData(length: number) {
        this.currentData.length = length - this.currentData.offset;
        //this.renderData[this.renderData.length - 1].length = length-;
    }
}
