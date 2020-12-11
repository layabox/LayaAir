import { Texture } from "../../../resource/Texture";
import { Matrix } from "../../../maths/Matrix";
import { Rectangle } from "../../../maths/Rectangle";


/**
 */
export class MeshData {
	/**
	 * 纹理 
	 */
    texture: Texture|null=null;

	/**
	 * uv数据 
	 */
    uvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);

	/**
	 * 顶点数据 
	 */
    vertices = new Float32Array([0, 0, 100, 0, 100, 100, 0, 100]);

	/**
	 * 顶点索引 
	 */
    indexes = new Uint16Array([0, 1, 3, 3, 1, 2]);

	/**
	 * uv变换矩阵 
	 */
    uvTransform: Matrix|null=null;

	/**
	 * 是否有uv变化矩阵
	 */
    useUvTransform = false;

	/**
	 * 扩展像素,用来去除黑边 
	 */
    canvasPadding = 1;

	/**
	 * 计算mesh的Bounds 
	 * @return 
	 * 
	 */
    //TODO:coverage
    getBounds(): Rectangle {
        return Rectangle._getWrapRec(this.vertices);
    }
}


