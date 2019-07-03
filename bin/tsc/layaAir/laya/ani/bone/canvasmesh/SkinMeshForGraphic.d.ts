import { MeshData } from "./MeshData";
import { Matrix } from "../../../maths/Matrix";
import { Texture } from "../../../resource/Texture";
export declare class SkinMeshForGraphic extends MeshData {
    constructor();
    /**
     * 矩阵
     */
    transform: Matrix;
    init2(texture: Texture, ps: any[], verticles: any[], uvs: any[]): void;
}
