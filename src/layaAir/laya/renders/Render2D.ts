import { IRenderContext2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IRenderGeometryElement } from "../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { InternalRenderTarget } from "../RenderDriver/DriverDesign/RenderDevice/InternalRenderTarget";
import { BufferUsage } from "../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../RenderEngine/VertexDeclaration";
import { LayaGL } from "../layagl/LayaGL";
import { Color } from "../maths/Color";
import { Material } from "../resource/Material";
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { Stat } from "../utils/Stat";
import { Value2D } from "../webgl/shader/d2/value/Value2D";
import { RenderState2D } from "../webgl/utils/RenderState2D";

export interface ISprite2DGeometry {
    readonly vertexDeclarition: VertexDeclaration;
    vbBuffer: ArrayBuffer;
    ibBuffer: ArrayBuffer;
}

/**
 * 记录上层的render2d的全局的底层渲染相关的状态
 * 这个与IRenderContext2D有概念重合，但是IRenderContext2D是多个底层实现，不适合这里的需求
 * 前提是这里记录的状态不会被3d等打断
 */
class Render2DGlobalState{
    /**
     * 由于render2d可能会有嵌套调用renderStart的情况，需要记录rendertexture
     */
    static curRT:RenderTexture2D = null;
}

export abstract class Render2D {

    protected _renderTexture: RenderTexture2D = null;
    //外部设置渲染结果。默认为null,null则渲染到canvas上
    constructor(out: RenderTexture2D = null) {
        this._renderTexture = out;
    }
    abstract clone(out: RenderTexture2D): Render2D;
    abstract renderStart(clear: boolean, clearColor: Color): void;
    // 有vb是外部提供的，因此，顶点描述也要由外部提供
    //abstract setVertexDecl(decl:VertexDeclaration):void;
    //shaderdata放到mtl中。之所以传内存buffer是为了给后面合并subdata机会，以便提高效率
    abstract draw(mesh: ISprite2DGeometry, vboff: number, vblen: number, iboff: number, iblen: number, mtl: Value2D, customMaterial: Material): void;
    abstract drawElement(ele: IRenderElement2D): void;

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
    private _lastRT:RenderTexture2D=null;
    constructor(out: RenderTexture2D = null) {
        super(out);
        if (!Render2DSimple.rendercontext2D) {
            Render2DSimple.rendercontext2D = LayaGL.render2DRenderPassFactory.createRenderContext2D();
        }
        this._renderElement = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        this._renderElement.nodeCommonMap = ["Sprite2D"];
    }

    clone(out: RenderTexture2D): Render2D {
        return new Render2DSimple(out);
    }

    private _createMesh() {
        let geo = this.geo = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
        let mesh = LayaGL.renderDeviceFactory.createBufferState();
        geo.bufferState = mesh;
        let vb = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        vb.vertexDeclaration = this._tex_vert_decl;
        let ib = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Dynamic);
        mesh.applyState([vb], ib)
        geo.indexFormat = IndexFormat.UInt16;
    }

    private setVertexDecl(decl: VertexDeclaration) {
        if (this._tex_vert_decl != decl) {
            this._tex_vert_decl = decl;
            this._createMesh();
        }
    }

    renderStart(clear: boolean, clearColor: Color): void {
        this._lastRT = Render2DGlobalState.curRT;
        //分层
        // if (this._renderTexture) {
        //     this._renderTexture.start();
        //     this._renderTexture.clear(0, 0, 0, 0);
        // }
        if (this._renderTexture) {
            Render2DSimple.rendercontext2D.invertY = this._renderTexture._invertY;
            Render2DSimple.rendercontext2D.setRenderTarget(this._renderTexture._renderTarget, clear, clearColor);
            Render2DGlobalState.curRT = this._renderTexture;
        } else {
            Render2DSimple.rendercontext2D.invertY = false;
            Render2DSimple.rendercontext2D.setOffscreenView(RenderState2D.width, RenderState2D.height);
            //如果没有设置，则是继续上一次的。但是可能这是第一次，没有上一次，希望是null
            if(!Render2DGlobalState.curRT)
                Render2DSimple.rendercontext2D.setRenderTarget(null, clear, clearColor);
        }
        RenderTexture2D._clear = false;
    }

    drawElement(ele: IRenderElement2D) {
        Render2DSimple.rendercontext2D.drawRenderElementOne(ele);
    }

    draw(mesh2d: ISprite2DGeometry, vboff: number, vblen: number, iboff: number, iblen: number, mtl: Value2D, customMaterial: Material): void {
        Stat.draw2D++;
        this.setVertexDecl(mesh2d.vertexDeclarition);
        let geo = this.geo;
        let mesh = geo.bufferState
        let vb = mesh._vertexBuffers[0];
        let ib = mesh._bindedIndexBuffer;
        vb.setDataLength(vblen);
        vb.setData(mesh2d.vbBuffer, vboff, 0, vblen);
        ib._setIndexDataLength(iblen);
        ib._setIndexData(new Uint16Array(mesh2d.ibBuffer, iboff, iblen / 2), 0)
        geo.clearRenderParams();
        geo.setDrawElemenParams(iblen / 2, 0);

        //Material??
        let mat: Material = customMaterial;
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
        let lastRT:InternalRenderTarget = this._lastRT?this._lastRT._renderTarget:null;
        //恢复rt，如果有实际可以恢复的，表示是被打断了，一定不希望clear，所以clear=false
        Render2DSimple.rendercontext2D.setRenderTarget(lastRT, false, Color.BLACK);
        Render2DGlobalState.curRT = this._lastRT;
        this._lastRT = null;
    }

}
