import { Mesh2D } from "./Mesh2D";
import { RenderParams } from "../../RenderEngine/RenderEnum/RenderParams";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { VertexElementFormat } from "../../renders/VertexElementFormat";
import { VertexElement } from "../../renders/VertexElement";
import { LayaGL } from "../../layagl/LayaGL";

/**
 * drawImage，fillRect等会用到的简单的mesh。每次添加必然是一个四边形。
 */
export class MeshParticle2D extends Mesh2D {
    private static const_stride = 116;
    private static vertexDeclaration: VertexDeclaration = null;

    static __init__(): void {
        const glfloat = LayaGL.renderEngine.getParams(RenderParams.FLOAT);
        MeshParticle2D.vertexDeclaration = new VertexDeclaration(116, [
            new VertexElement(0, VertexElementFormat.Vector4, 0),//CornerTextureCoordinate
            new VertexElement(16, VertexElementFormat.Vector3, 1),//pos
            new VertexElement(28, VertexElementFormat.Vector3, 2),//vel
            new VertexElement(40, VertexElementFormat.Vector4, 3),//start color
            new VertexElement(56, VertexElementFormat.Vector4, 4),//end color
            new VertexElement(72, VertexElementFormat.Vector3, 5),//size,rot
            new VertexElement(84, VertexElementFormat.Vector2, 6),//radius
            new VertexElement(92, VertexElementFormat.Vector4, 7),//radian
            new VertexElement(108, VertexElementFormat.Single, 8),//AgeAddScale
            new VertexElement(112, VertexElementFormat.Single, 9)
        ]);
    }

    constructor(maxNum: number) {
        super(MeshParticle2D.const_stride, maxNum * 4 * MeshParticle2D.const_stride, 4);		//ib 先4
    }

    setMaxParticleNum(maxNum: number): void {
    }
    protected onVBRealloc(buff: ArrayBuffer): void {
    }
    protected onIBRealloc(buff: ArrayBuffer): void {
    }

    get vertexDeclarition(){
        return MeshParticle2D.vertexDeclaration;
    }
}

