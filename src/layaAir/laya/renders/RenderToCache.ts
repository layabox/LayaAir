import { LayaGL } from "../layagl/LayaGL";
import { Matrix } from "../maths/Matrix";
import { IRenderElement2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IRenderGeometryElement } from "../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { BufferUsage } from "../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../RenderEngine/VertexDeclaration";
import { Material } from "../resource/Material";
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { NotImplementedError } from "../utils/Error";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";
import { Value2D } from "../webgl/shader/d2/value/Value2D";
import { Render2D, ISprite2DGeometry } from "./Render2D";

export class RenderToCache extends Render2D {
    renderResult: RenderObject2D[] = [];
    private _tex_vert_decl: VertexDeclaration;

    constructor() {
        super(null);
    }

    clone(out: RenderTexture2D): RenderToCache {
        return null;
    }

    private _createMesh() {
        // let geo = this.geo = new WebGLRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
        // let mesh = new WebGLBufferState();
        // geo.bufferState = mesh;
        // let vb = new WebGLVertexBuffer(BufferTargetType.ARRAY_BUFFER, BufferUsage.Dynamic);
        // vb.vertexDeclaration = this._tex_vert_decl;
        // let ib = new WebGLIndexBuffer(BufferTargetType.ELEMENT_ARRAY_BUFFER, BufferUsage.Dynamic);
        // mesh.applyState([vb], ib)
        // geo.indexFormat = IndexFormat.UInt16;
    }

    private setVertexDecl(decl: VertexDeclaration) {
        if (this._tex_vert_decl != decl) {
            this._tex_vert_decl = decl;
            this._createMesh();
        }
    }

    renderStart(): void {
    }

    draw(mesh2d: ISprite2DGeometry, vboff: number, vblen: number, iboff: number, iblen: number, mtl: Value2D): void {
        this.setVertexDecl(mesh2d.vertexDeclarition);
        let submesh = new RenderObject2D(mesh2d, vboff, vblen, iboff, iblen, mtl);
        let clipPos = mtl.clipMatPos;
        let clipDir = mtl.clipMatDir;
        let clipMat = submesh.localClipMatrix;
        clipMat.a = clipDir.x; clipMat.b = clipDir.y; clipMat.c = clipDir.z; clipMat.d = clipDir.w;
        clipMat.tx = clipPos.x; clipMat.ty = clipPos.y;
        mtl.shaderData.addDefine(ShaderDefines2D.WORLDMAT);
        submesh.toNativeMesh();
        this.renderResult.push(submesh);
    }

    drawMesh(mesh: IRenderGeometryElement, mtl: Material): void {
        throw new NotImplementedError();
    }
    drawElement(ele: IRenderElement2D): void {
        throw new NotImplementedError();
    }
    renderEnd(): void {
    }

}

export class RenderObject2D implements ISprite2DGeometry {
    vboff: number;
    vblen: number;
    iboff: number;
    iblen: number;
    mtl: Value2D;
    //本地裁剪，给cacheas = normal用，用来组合出一个世界裁剪
    localClipMatrix: Matrix;

    dynaResourcesNeedTouch: any[];
    vertexDeclarition: VertexDeclaration;
    vbBuffer: ArrayBuffer;
    ibBuffer: ArrayBuffer;

    geo: IRenderGeometryElement;
    renderElement: IRenderElement2D;

    constructor(mesh: ISprite2DGeometry, vboff: number, vblen: number, iboff: number, iblen: number, mtl: Value2D) {
        this.localClipMatrix = new Matrix();
        this.vertexDeclarition = mesh.vertexDeclarition;
        this.vbBuffer = new ArrayBuffer(vblen);
        this.ibBuffer = new ArrayBuffer(iblen);
        (new Uint8Array(this.vbBuffer)).set(new Uint8Array(mesh.vbBuffer, vboff, vblen));
        (new Uint8Array(this.ibBuffer)).set(new Uint8Array(mesh.ibBuffer, iboff, iblen));
        this.mtl = mtl; //TODO clone?
        this.vboff = 0;
        this.vblen = vblen;
        this.iboff = 0;
        this.iblen = iblen;
    }

    toNativeMesh() {
        let renderDevice = LayaGL.renderDeviceFactory;
        let geo = this.geo = renderDevice.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
        let mesh = geo.bufferState = renderDevice.createBufferState();
        let vb = renderDevice.createVertexBuffer(BufferUsage.Dynamic);
        vb.vertexDeclaration = this.vertexDeclarition;
        let ib = renderDevice.createIndexBuffer(BufferUsage.Dynamic);
        mesh.applyState([vb], ib)
        geo.indexFormat = IndexFormat.UInt16;
        vb.setDataLength(this.vblen);
        vb.setData(this.vbBuffer, this.vboff, 0, this.vblen)
        ib._setIndexDataLength(this.iblen)
        ib._setIndexData(new Uint16Array(this.ibBuffer, this.iboff, this.iblen / 2), 0)
        geo.clearRenderParams();
        geo.setDrawElemenParams(this.iblen / 2, 0);

        this.renderElement = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        this.renderElement.geometry = geo;
        this.renderElement.value2DShaderData = this.mtl.shaderData;
        this.renderElement.subShader = this.mtl._defaultShader.getSubShaderAt(0);
        this.renderElement.materialShaderData = null;
        this.renderElement.nodeCommonMap = ["Sprite2D"];
    }

    destroyGPUResource() {
        this.renderElement && this.renderElement.destroy();
        let geo = this.geo;
        if (geo) {
            geo.bufferState._vertexBuffers[0].destroy();
            geo.bufferState._bindedIndexBuffer.destroy();
            geo.bufferState.destroy();
            geo.bufferState
            geo.destroy();
            this.geo = null;
        }
    }
}