import { IRenderContext2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IRenderGeometryElement } from "../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { WebGLBufferState } from "../RenderDriver/WebGLDriver/RenderDevice/WebGLBufferState";
import { WebGLEngine } from "../RenderDriver/WebGLDriver/RenderDevice/WebGLEngine";
import { WebGLIndexBuffer } from "../RenderDriver/WebGLDriver/RenderDevice/WebGLIndexBuffer";
import { WebGLRenderGeometryElement } from "../RenderDriver/WebGLDriver/RenderDevice/WebGLRenderGeometryElement";
import { WebGLVertexBuffer } from "../RenderDriver/WebGLDriver/RenderDevice/WebGLVertexBuffer";
import { BufferTargetType, BufferUsage } from "../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../RenderEngine/VertexDeclaration";
import { LayaGL } from "../layagl/LayaGL";
import { Material } from "../resource/Material";
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { Value2D } from "../webgl/shader/d2/value/Value2D";
import { RenderState2D } from "../webgl/utils/RenderState2D";

export interface IMesh2D {
    readonly vertexDeclarition: VertexDeclaration;
    vbBuffer: ArrayBuffer;
    ibBuffer: ArrayBuffer;
}

export abstract class Render2D {

    protected _renderTexture: RenderTexture2D = null;
    //外部设置渲染结果。默认为null,null则渲染到canvas上
    constructor(out: RenderTexture2D = null) {
        this._renderTexture = out;
    }

    abstract clone(out: RenderTexture2D): Render2D;
    //可以随时设置rt
    set out(out: RenderTexture2D) {
        this._renderTexture = out;
    }
    get out() {
        return this._renderTexture;
    }
    //output:RenderTexture2D;
    abstract renderStart(): void;
    // 有vb是外部提供的，因此，顶点描述也要由外部提供
    //abstract setVertexDecl(decl:VertexDeclaration):void;
    //shaderdata放到mtl中。之所以传内存buffer是为了给后面合并subdata机会，以便提高效率
    abstract draw(mesh: IMesh2D, vboff: number, vblen: number, iboff: number, iblen: number, mtl: Value2D): void;
    // 只是画一个方块
    drawRect(texture: RenderTexture2D, width: number, height: number, mtl: Value2D, flipY = false) { }
    abstract renderEnd(): void;
}

/**
 * 直接渲染，不攒submit
 */
export class Render2DSimple extends Render2D {
    static rendercontext2D: IRenderContext2D;
    private _tex_vert_decl: VertexDeclaration;
    private geo: IRenderGeometryElement;
    private static rectGeo: IRenderGeometryElement;
    private _renderElement: IRenderElement2D;
    constructor(out: RenderTexture2D = null) {
        super(out);
        if (!Render2DSimple.rendercontext2D) {
            Render2DSimple.rendercontext2D = LayaGL.render2DRenderPassFactory.createREnderContext2D();
        }
        this._renderElement = LayaGL.render2DRenderPassFactory.createRenderElement2D();
    }

    private _createRectGeo() {

    }

    clone(out: RenderTexture2D): Render2D {
        return new Render2DSimple(out);
    }

    private _createMesh() {
        let geo = this.geo = new WebGLRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
        let mesh = new WebGLBufferState();
        geo.bufferState = mesh;
        let vb = new WebGLVertexBuffer(BufferTargetType.ARRAY_BUFFER, BufferUsage.Dynamic);
        vb.vertexDeclaration = this._tex_vert_decl;
        let ib = new WebGLIndexBuffer(BufferTargetType.ELEMENT_ARRAY_BUFFER, BufferUsage.Dynamic);
        mesh.applyState([vb], ib)
        geo.indexFormat = IndexFormat.UInt16;
    }

    private setVertexDecl(decl: VertexDeclaration) {
        if (this._tex_vert_decl != decl) {
            this._tex_vert_decl = decl;
            this._createMesh();
        }
    }

    renderStart(): void {
        //分层
        // if (this._renderTexture) {
        //     this._renderTexture.start();
        //     this._renderTexture.clear(0, 0, 0, 0);
        // }
        if (this._renderTexture) {
            Render2DSimple.rendercontext2D.invertY = this._renderTexture._invertY;
            Render2DSimple.rendercontext2D.setRenderTarget(this._renderTexture._renderTarget, RenderTexture2D._clear, RenderTexture2D._clearColor);
        } else {
            Render2DSimple.rendercontext2D.invertY = false;
            Render2DSimple.rendercontext2D.setOffscreenView(RenderState2D.width, RenderState2D.height);
            Render2DSimple.rendercontext2D.setRenderTarget(null, RenderTexture2D._clear, RenderTexture2D._clearColor);
           
        }

        RenderTexture2D._clear = false;
    }

    draw(mesh2d: IMesh2D, vboff: number, vblen: number, iboff: number, iblen: number, mtl: Value2D): void {
        this.setVertexDecl(mesh2d.vertexDeclarition);
        let geo = this.geo;
        let mesh = geo.bufferState
        let vb = mesh._vertexBuffers[0];
        let ib = mesh._bindedIndexBuffer;
        vb.setDataLength(vblen);
        vb.setData(mesh2d.vbBuffer, vboff, 0, vblen)
        ib._setIndexDataLength(iblen)
        ib._setIndexData(new Uint16Array(mesh2d.ibBuffer, iboff, iblen / 2), 0)
        geo.clearRenderParams();
        geo.setDrawElemenParams(iblen / 2, 0);

        //Material??
        let mat: Material;
        this._renderElement.geometry = geo;
        //this._renderElement.material = mtl;
        this._renderElement.value2DShaderData = mtl.shaderData;
        if (mat)//有Material Shader是Material的shader  没有是默认的Shader
        {
            this._renderElement.subShader = mat._shader.getSubShaderAt(0);
            this._renderElement.materialShaderData = mat.shaderData;
        } else {
            this._renderElement.subShader = mtl._defaultShader.getSubShaderAt(0);
            this._renderElement.materialShaderData = null;
        }
        //blendState TODO
        Render2DSimple.rendercontext2D.drawRenderElementOne(this._renderElement);
    }

    drawRect(texture: RenderTexture2D, width: number, height: number, mtl: Value2D, flipY = false) {

    }

    renderEnd(): void {
        //分层
        // if (this._renderTexture) {
        //     this._renderTexture.end();
        //     this._renderTexture.restore();
        // }
    }

}

export class Render2DMergeVB extends Render2D {
    clone(out: RenderTexture2D): Render2D {
        return new Render2DMergeVB(out);
    }

    setVertexDecl(decl: VertexDeclaration) {

    }

    renderStart(): void {
        throw new Error("Method not implemented.");
    }
    draw(mesh2d: IMesh2D, vboff: number, vblen: number, iboff: number, iblen: number, mtl: Value2D): void {
        //TODO 保证mtl的一致性
        //1、拼起来vb ib  在复制mtl
        //2、记录start end
        //3、超过一定数量  就直接draw
        throw new Error("Method not implemented.");
    }
    renderEnd(): void {
        //真的渲染
        throw new Error("Method not implemented.");
    }

}