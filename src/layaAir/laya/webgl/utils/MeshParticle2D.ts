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
    static const_stride: number = 116;
    private static _fixattriInfo: any[];
    private static _POOL: any[] = [];
    static vertexDeclaration: VertexDeclaration = null;
    static __init__(): void {
        const glfloat = LayaGL.renderEngine.getParams(RenderParams.FLOAT);
        MeshParticle2D._fixattriInfo = [
            glfloat, 4, 0,	//CornerTextureCoordinate
            glfloat, 3, 16,//pos
            glfloat, 3, 28,//vel
            glfloat, 4, 40,//start color
            glfloat, 4, 56,//end color
            glfloat, 3, 72,//size,rot
            glfloat, 2, 84,//radius
            glfloat, 4, 92,//radian
            glfloat, 1, 108,//AgeAddScale
            glfloat, 1, 112];


    }

    //TODO:coverage
    constructor(maxNum: number) {
        super(MeshParticle2D.const_stride, maxNum * 4 * MeshParticle2D.const_stride, 4);		//ib 先4
        this.canReuse = true;
        this.setAttributes(MeshParticle2D._fixattriInfo);
        this.createQuadIB(maxNum);
        this._quadNum = maxNum;

        if (!MeshParticle2D.vertexDeclaration) {
            MeshParticle2D.vertexDeclaration = new VertexDeclaration(116, [
                new VertexElement(0, VertexElementFormat.Vector4, 0),
                new VertexElement(16, VertexElementFormat.Vector3, 1),
                new VertexElement(28, VertexElementFormat.Vector3, 2),
                new VertexElement(40, VertexElementFormat.Vector4, 3),
                new VertexElement(56, VertexElementFormat.Vector4, 4),
                new VertexElement(72, VertexElementFormat.Vector3, 5),
                new VertexElement(84, VertexElementFormat.Vector2, 6),
                new VertexElement(92, VertexElementFormat.Vector4, 7),
                new VertexElement(108, VertexElementFormat.Single, 8),
                new VertexElement(112, VertexElementFormat.Single, 9)
            ]);
        }

        this._vb.vertexDeclaration = MeshParticle2D.vertexDeclaration;
    }

    setMaxParticleNum(maxNum: number): void {
        this._vb.buffer2D._resizeBuffer(maxNum * 4 * MeshParticle2D.const_stride, false);
        this.createQuadIB(maxNum);
    }

    /**
     * 
     */
    //TODO:coverage
    static getAMesh(maxNum: number): MeshParticle2D {
        //console.log('getmesh');
        if (MeshParticle2D._POOL.length) {
            var ret: MeshParticle2D = MeshParticle2D._POOL.pop();
            ret.setMaxParticleNum(maxNum);
            return ret;
        }
        return new MeshParticle2D(maxNum);
    }

    /**
     * 把本对象放到回收池中，以便getMesh能用。
     * @override
     */
    //TODO:coverage
    releaseMesh(): void {
        this._vb.buffer2D.setByteLength(0);
        this.vertNum = 0;
        this.indexNum = 0;
        //_applied = false;
        MeshParticle2D._POOL.push(this);
    }

    //TODO:coverage
    /**
     * @override
     */
    destroy(): void {
        this._ib.destroy();
        this._vb.destroy();
        this._vb.deleteBuffer();
        //ib用deletebuffer么
    }
}

