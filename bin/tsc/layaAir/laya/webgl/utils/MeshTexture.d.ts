import { Mesh2D } from "./Mesh2D";
import { Matrix } from "../../maths/Matrix";
/**
 * 与MeshQuadTexture基本相同。不过index不是固定的
 */
export declare class MeshTexture extends Mesh2D {
    static const_stride: number;
    private static _fixattriInfo;
    private static _POOL;
    constructor();
    /**
     *
     */
    static getAMesh(mainctx: boolean): MeshTexture;
    addData(vertices: Float32Array, uvs: Float32Array, idx: Uint16Array, matrix: Matrix, rgba: number): void;
    /**
     * 把本对象放到回收池中，以便getMesh能用。
     */
    releaseMesh(): void;
    destroy(): void;
}
