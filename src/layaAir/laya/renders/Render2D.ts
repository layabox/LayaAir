import { IRenderContext2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IRenderGeometryElement } from "../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { BufferTargetType, BufferUsage } from "../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../RenderEngine/VertexDeclaration";
import { GeometryElement } from "../d3/core/GeometryElement";
import { Mesh } from "../d3/resource/models/Mesh";
import { LayaGL } from "../layagl/LayaGL";
import { Color } from "../maths/Color";
import { Material } from "../resource/Material";
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { PERF_BEGIN, PERT_COUNT, PerformanceDefine } from "../tools/PerformanceTool";
import { Stat } from "../utils/Stat";
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
    setRenderTarget(rt:RenderTexture2D){};//临时
    abstract clone(out: RenderTexture2D): Render2D;
    //可以随时设置rt
    // set out(out: RenderTexture2D) {
    //     this._renderTexture = out;
    // }
    get out() {
        return this._renderTexture;
    }
    //output:RenderTexture2D;
    abstract renderStart(clear:boolean,clearColor:Color): void;
    // 有vb是外部提供的，因此，顶点描述也要由外部提供
    //abstract setVertexDecl(decl:VertexDeclaration):void;
    //shaderdata放到mtl中。之所以传内存buffer是为了给后面合并subdata机会，以便提高效率
    abstract draw(mesh: IMesh2D, vboff: number, vblen: number, iboff: number, iblen: number, mtl: Value2D): void;
    abstract drawMesh(mesh:IRenderGeometryElement,mtl:Material):void;

    abstract renderEnd(): void;
}

/**
 * 直接渲染，不攒submit
 */
export class Render2DSimple extends Render2D {
    static rendercontext2D: IRenderContext2D;
    private _tex_vert_decl: VertexDeclaration;
    private geo: IRenderGeometryElement;
    private _renderElement: IRenderElement2D;
    constructor(out: RenderTexture2D = null) {
        super(out);
        if (!Render2DSimple.rendercontext2D) {
            Render2DSimple.rendercontext2D = LayaGL.render2DRenderPassFactory.createRenderContext2D();
        }
        this._renderElement = LayaGL.render2DRenderPassFactory.createRenderElement2D();
    }

    clone(out: RenderTexture2D): Render2D {
        return new Render2DSimple(out);
    }

    private _createMesh() {
        let geo = this.geo = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
        let mesh = LayaGL.renderDeviceFactory.createBufferState();
        geo.bufferState = mesh;
        let vb =LayaGL.renderDeviceFactory.createVertexBuffer( BufferUsage.Dynamic);
        vb.vertexDeclaration = this._tex_vert_decl;
        let ib =LayaGL.renderDeviceFactory.createIndexBuffer( BufferUsage.Dynamic);
        mesh.applyState([vb], ib)
        geo.indexFormat = IndexFormat.UInt16;
    }

    private setVertexDecl(decl: VertexDeclaration) {
        if (this._tex_vert_decl != decl) {
            this._tex_vert_decl = decl;
            this._createMesh();
        }
    }

    renderStart(clear:boolean,clearColor:Color): void {
        //分层
        // if (this._renderTexture) {
        //     this._renderTexture.start();
        //     this._renderTexture.clear(0, 0, 0, 0);
        // }
        if (this._renderTexture) {
            Render2DSimple.rendercontext2D.invertY = this._renderTexture._invertY;
            Render2DSimple.rendercontext2D.setRenderTarget(this._renderTexture._renderTarget, clear, clearColor);
        } else {
            Render2DSimple.rendercontext2D.invertY = false;
            Render2DSimple.rendercontext2D.setOffscreenView(RenderState2D.width, RenderState2D.height);
            Render2DSimple.rendercontext2D.setRenderTarget(null, clear, clearColor);
        }
        RenderTexture2D._clear = false;
    }

    //临时。恢复rt用，以后要做到没有rt的嵌套
    override setRenderTarget(rt:RenderTexture2D){
        Render2DSimple.rendercontext2D.setRenderTarget(rt?._renderTarget, false, RenderTexture2D._clearColor);
    }

    drawMesh(geo:IRenderGeometryElement,mtl:Material){
        Stat.draw2D++;
        //Material??
        this._renderElement.geometry = geo;
        //this._renderElement.material = mtl;
        this._renderElement.value2DShaderData = mtl.shaderData;
        this._renderElement.subShader = mtl._shader.getSubShaderAt(0);
        this._renderElement.materialShaderData = mtl.shaderData;
        //blendState TODO
        Render2DSimple.rendercontext2D.drawRenderElementOne(this._renderElement);
    }

    draw(mesh2d: IMesh2D, vboff: number, vblen: number, iboff: number, iblen: number, mtl: Value2D): void {
        //PERT_COUNT(PerformanceDefine.C_DrawCount,1);
        Stat.draw2D++;
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

    renderEnd(): void {
        //分层
        // if (this._renderTexture) {
        //     this._renderTexture.end();
        //     this._renderTexture.restore();
        // }
    }

}
