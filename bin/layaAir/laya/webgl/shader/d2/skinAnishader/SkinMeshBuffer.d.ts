import { IndexBuffer2D } from "../../../utils/IndexBuffer2D";
import { VertexBuffer2D } from "../../../utils/VertexBuffer2D";
export declare class SkinMeshBuffer {
    ib: IndexBuffer2D;
    vb: VertexBuffer2D;
    static instance: SkinMeshBuffer;
    constructor();
    static getInstance(): SkinMeshBuffer;
    addSkinMesh(skinMesh: any): void;
    reset(): void;
}
