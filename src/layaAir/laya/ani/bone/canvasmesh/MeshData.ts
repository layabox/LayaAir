import { Texture } from "../../../resource/Texture";
import { Matrix } from "../../../maths/Matrix";
import { Rectangle } from "../../../maths/Rectangle";


/**
 * @en Mesh data
 * @zh 网格数据
 */
export class MeshData {
    /**
     * @en Texture
     * @zh 纹理
     */
    texture: Texture;

    /**
     * @en UV data
     * @zh UV数据
     */
    uvs: Float32Array = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);

    /**
     * @en Vertex data
     * @zh 顶点数据
     */
    vertices: Float32Array = new Float32Array([0, 0, 100, 0, 100, 100, 0, 100]);

    /**
     * @en Vertex indices
     * @zh 顶点索引
     */
    indexes: Uint16Array = new Uint16Array([0, 1, 3, 3, 1, 2]);

    /**
     * @en UV transform matrix
     * @zh UV变换矩阵
     */
    uvTransform: Matrix;

    /**
     * @en Whether to use UV transform matrix
     * @zh 是否使用UV变换矩阵
     */
    useUvTransform: boolean = false;

    /**
     * @en Extended pixels used to remove black edges
     * @zh 扩展像素，用于去除黑边
     */
    canvasPadding: number = 1;

    /**
     * @en Calculate the bounds of the mesh
     * @returns Rectangle representing the bounds of the mesh
     * @zh 计算网格的边界
     * @returns 表示网格边界的矩形
     */
    //TODO:coverage
    getBounds(): Rectangle {
        return Rectangle._getWrapRec(this.vertices);
    }
}


