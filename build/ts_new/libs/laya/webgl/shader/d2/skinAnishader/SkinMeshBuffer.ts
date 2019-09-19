import { WebGLContext } from "../../../WebGLContext"
import { IndexBuffer2D } from "../../../utils/IndexBuffer2D"
import { VertexBuffer2D } from "../../../utils/VertexBuffer2D"
import { LayaGL } from "../../../../layagl/LayaGL";

export class SkinMeshBuffer {

    ib: IndexBuffer2D;
    vb: VertexBuffer2D;

    static instance: SkinMeshBuffer;

    //TODO:coverage
    constructor() {
        var gl: WebGLRenderingContext = LayaGL.instance;
        this.ib = IndexBuffer2D.create(gl.DYNAMIC_DRAW);
        this.vb = VertexBuffer2D.create(8);
    }

    //TODO:coverage
    static getInstance(): SkinMeshBuffer {
        return SkinMeshBuffer.instance = SkinMeshBuffer.instance || new SkinMeshBuffer();
    }

    //TODO:coverage
    addSkinMesh(skinMesh: any): void {
        //skinMesh.getData(vb, ib, vb.byteLength / 32);
        skinMesh.getData2(this.vb, this.ib, this.vb._byteLength / 32);
    }


    reset(): void {
        this.vb.clear();
        this.ib.clear();
    }

}


