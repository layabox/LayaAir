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
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { Value2D } from "../webgl/shader/d2/value/Value2D";

export interface IMesh2D{
    readonly vertexDeclarition:VertexDeclaration;
    vbBuffer:ArrayBuffer;
    ibBuffer:ArrayBuffer;
}

export abstract class Render2D{
    protected _renderTexture:RenderTexture2D=null;
    //外部设置渲染结果。默认为null,null则渲染到canvas上
    constructor(out:RenderTexture2D=null){
        this._renderTexture = out;
    }

    abstract clone(out:RenderTexture2D):Render2D;
    //可以随时设置rt
    set out(out:RenderTexture2D){
        this._renderTexture=out;
    }
    get out(){
        return this._renderTexture;
    }
    //output:RenderTexture2D;
    abstract renderStart():void;
    // 有vb是外部提供的，因此，顶点描述也要由外部提供
    //abstract setVertexDecl(decl:VertexDeclaration):void;
    //shaderdata放到mtl中。之所以传内存buffer是为了给后面合并subdata机会，以便提高效率
    abstract draw(mesh:IMesh2D, vboff:number, vblen:number, iboff:number,iblen:number, mtl:Value2D ):void;
    // 只是画一个方块
    drawRect( texture:RenderTexture2D, width:number, height:number, mtl:Value2D,flipY=false){}
    abstract renderEnd():void;
}

/**
 * 直接渲染，不攒submit
 */
export class Render2DSimple extends Render2D{
    private _tex_vert_decl:VertexDeclaration;
    private geo:WebGLRenderGeometryElement;
    private static rectGeo:WebGLRenderGeometryElement;

    constructor(out:RenderTexture2D=null){
        super(out);

    }

    private _createRectGeo(){

    }

    clone(out:RenderTexture2D):Render2D{
        return new Render2DSimple(out);
    }

    private _createMesh(){
        let geo  = this.geo = new WebGLRenderGeometryElement(MeshTopology.Triangles,DrawType.DrawElement);
        let mesh = new WebGLBufferState();
        geo.bufferState = mesh;
        let vb = new WebGLVertexBuffer(BufferTargetType.ARRAY_BUFFER,BufferUsage.Dynamic);
        vb.vertexDeclaration = this._tex_vert_decl;
        let ib = new WebGLIndexBuffer(BufferTargetType.ELEMENT_ARRAY_BUFFER, BufferUsage.Dynamic);
        mesh.applyState([vb],ib)
        geo.indexFormat = IndexFormat.UInt16;
    }

    private setVertexDecl(decl:VertexDeclaration){
        if(this._tex_vert_decl!=decl){
            this._tex_vert_decl=decl;
            this._createMesh();
        }
    }

    renderStart(): void {
        if(this._renderTexture){
            this._renderTexture.start();
            this._renderTexture.clear(0, 0, 0, 0);
        }
    }

    draw(mesh2d:IMesh2D, vboff:number,vblen:number, iboff:number,iblen:number, mtl: Value2D): void {
        this.setVertexDecl(mesh2d.vertexDeclarition);
        let geo = this.geo;
        let mesh = geo.bufferState
        let vb = mesh._vertexBuffers[0];
        let ib = mesh._bindedIndexBuffer;
        vb.setDataLength(vblen);
        vb.setData(mesh2d.vbBuffer,vboff,0,vblen)
        ib._setIndexDataLength(iblen)
        ib._setIndexData(new Uint16Array(mesh2d.ibBuffer,iboff,iblen/2),0)
        geo.clearRenderParams();
        geo.setDrawElemenParams(iblen/2,0);
        mtl.upload(null, mtl.shaderData)
        WebGLEngine.instance.getDrawContext().drawGeometryElement(geo);
    }

    drawRect( texture:RenderTexture2D, width:number, height:number, mtl:Value2D,flipY=false){

    }

    renderEnd(): void {
        if(this._renderTexture){
            this._renderTexture.end();
            this._renderTexture.restore();
        }
    }

}

export class Render2DMergeVB extends Render2D{
    clone(out:RenderTexture2D):Render2D{
        return new Render2DMergeVB(out);
    }

    setVertexDecl(decl:VertexDeclaration){

    }

    renderStart(): void {
        throw new Error("Method not implemented.");
    }
    draw(mesh2d:IMesh2D, vboff:number, vblen:number,iboff:number,iblen:number,mtl: Value2D): void {
        throw new Error("Method not implemented.");
    }
    renderEnd(): void {
        throw new Error("Method not implemented.");
    }

}