import { Rectangle } from "../../../maths/Rectangle";
/**
 */
export class MeshData {
    constructor() {
        /**
         * uv数据
         */
        this.uvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
        /**
         * 顶点数据
         */
        this.vertices = new Float32Array([0, 0, 100, 0, 100, 100, 0, 100]);
        /**
         * 顶点索引
         */
        this.indexes = new Uint16Array([0, 1, 3, 3, 1, 2]);
        /**
         * 是否有uv变化矩阵
         */
        this.useUvTransform = false;
        /**
         * 扩展像素,用来去除黑边
         */
        this.canvasPadding = 1;
    }
    /**
     * 计算mesh的Bounds
     * @return
     *
     */
    //TODO:coverage
    getBounds() {
        return Rectangle._getWrapRec(this.vertices);
    }
}
