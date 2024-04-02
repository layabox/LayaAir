import { IRenderGeometryElement } from "../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { VertexDeclaration } from "../RenderEngine/VertexDeclaration";
import { Material } from "../resource/Material";
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";
import { Value2D } from "../webgl/shader/d2/value/Value2D";
import { IMesh2D, Render2D } from "./Render2D";
import { RenderObject2D } from "./SpriteCache";

export class RenderToCache extends Render2D {
    renderResult:RenderObject2D[]=[];
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

    draw(mesh2d: IMesh2D, vboff: number, vblen: number, iboff: number, iblen: number, mtl: Value2D): void {
        this.setVertexDecl(mesh2d.vertexDeclarition);
        let submesh = new RenderObject2D(mesh2d,vboff,vblen,iboff,iblen,mtl);
        mtl.shaderData.addDefine(ShaderDefines2D.WORLDMAT);
        this.renderResult.push(submesh);
    }

    drawMesh(mesh: IRenderGeometryElement, mtl: Material): void {
        throw "not implement"
    }
    renderEnd(): void {
    }

}