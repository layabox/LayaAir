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
        // let geo = this.geo;
        // let mesh = geo.bufferState
        // let vb = mesh._vertexBuffers[0];
        // let ib = mesh._bindedIndexBuffer;
        // vb.setDataLength(vblen);
        // vb.setData(mesh2d.vbBuffer, vboff, 0, vblen)
        // ib._setIndexDataLength(iblen)
        // ib._setIndexData(new Uint16Array(mesh2d.ibBuffer, iboff, iblen / 2), 0)
        // geo.clearRenderParams();
        // geo.setDrawElemenParams(iblen / 2, 0);

        // //Material??
        // let mat: Material;
        // this._renderElement.geometry = geo;
        // //this._renderElement.material = mtl;
        // this._renderElement.value2DShaderData = mtl.shaderData;
        // if (mat)//有Material Shader是Material的shader  没有是默认的Shader
        // {
        //     this._renderElement.subShader = mat._shader.getSubShaderAt(0);
        //     this._renderElement.materialShaderData = mat.shaderData;
        // } else {
        //     this._renderElement.subShader = mtl._defaultShader.getSubShaderAt(0);
        //     this._renderElement.materialShaderData = null;
        // }
        // //blendState TODO
        // RenderToCache.rendercontext2D.drawRenderElementOne(this._renderElement);
    }

    renderEnd(): void {
    }

}