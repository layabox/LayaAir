import { MeshData } from "./MeshData";
import { Matrix } from "laya/maths/Matrix";
import { Texture } from "laya/resource/Texture";
/**
 * ...
 * @author ww
 */
export declare class SkinMeshForGraphic extends MeshData {
    constructor();
    /**
     * 矩阵
     */
    transform: Matrix;
    init2(texture: Texture, ps: any[], verticles: any[], uvs: any[]): void;
}
