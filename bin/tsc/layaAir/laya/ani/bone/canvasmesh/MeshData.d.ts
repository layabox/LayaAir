import { Texture } from "../../../resource/Texture";
import { Matrix } from "../../../maths/Matrix";
import { Rectangle } from "../../../maths/Rectangle";
/**
 */
export declare class MeshData {
    /**
     * 纹理
     */
    texture: Texture;
    /**
     * uv数据
     */
    uvs: Float32Array;
    /**
     * 顶点数据
     */
    vertices: Float32Array;
    /**
     * 顶点索引
     */
    indexes: Uint16Array;
    /**
     * uv变换矩阵
     */
    uvTransform: Matrix;
    /**
     * 是否有uv变化矩阵
     */
    useUvTransform: boolean;
    /**
     * 扩展像素,用来去除黑边
     */
    canvasPadding: number;
    /**
     * 计算mesh的Bounds
     * @return
     *
     */
    getBounds(): Rectangle;
}
