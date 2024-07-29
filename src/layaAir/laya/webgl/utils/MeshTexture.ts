import { Matrix } from "../../maths/Matrix";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { VertexElement } from "../../renders/VertexElement";
import { VertexElementFormat } from "../../renders/VertexElementFormat";
import { Sprite2DGeometry } from "./Sprite2DGeometry";

/**
 * 与MeshQuadTexture基本相同。不过index不是固定的
 */
export class MeshTexture extends Sprite2DGeometry {
    static const_stride = 48;
    static VertexDeclarition: VertexDeclaration = null;
    //private _vbUin32Array: Uint32Array;
    private _vbFloat32Array: Float32Array;
    private _ibU16Array:Uint16Array;

    static __init__(): void {
        MeshTexture.VertexDeclarition = new VertexDeclaration(48, [
            new VertexElement(0, VertexElementFormat.Vector4, 0),//pos,uv
            new VertexElement(16, VertexElementFormat.Vector4, 1),//color,alpha
            new VertexElement(32, VertexElementFormat.Vector4, 2),//
        ])
    }

    constructor() {
        super(MeshTexture.const_stride, 4, 4);	//x,y,u,v,rgba
    }

	protected onVBRealloc(buff: ArrayBuffer): void {
		//this._vbUin32Array = new Uint32Array(buff);
		this._vbFloat32Array = new Float32Array(buff);
	}    
    protected onIBRealloc(buff: ArrayBuffer): void {
        this._ibU16Array = new Uint16Array(buff);
    }

    /**
     * 增加四个顶点
     * @param vertices 
     * @param uvs 
     * @param idx 
     * @param matrix 
     * @param rgba 
     */
    addData(vertices: Float32Array, uvs: Float32Array, idx: Uint16Array, matrix: Matrix, rgba: number, uvrect:number[]=null): void {
        //vb
        let addVert = vertices.length/2;
        this.expVBSize(addVert*MeshTexture.const_stride);
        var vertsz= vertices.length >> 1;
        var startpos= this._vertNum*MeshTexture.const_stride;//vb的起点。			
        var f32pos= startpos >> 2;
        var vbdata = this._vbFloat32Array;
        //var vbu32Arr = this._vbUin32Array;
        var ci= 0;
        var m00= matrix.a;
        var m01= matrix.b;
        var m10= matrix.c;
        var m11= matrix.d;
        var tx= matrix.tx;
        var ty= matrix.ty;
        var i= 0;
        //var clipinfo:Array = ctx.getTransedClipInfo();
        let uvminx=0;
        let uvminy=0;
        let uvu=1;
        let uvv=1;
        if(uvrect){
            uvminx=uvrect[0];
            uvminy=uvrect[1];
            uvu=uvrect[2];
            uvv=uvrect[3];
        }
        let r = ((rgba>>>16)&0xff)/255.0;
        let g = ((rgba>>>8)&0xff)/255.0;
        let b = (rgba&0xff)/255.0;
        let a = (rgba>>>24)/255.0;
        for (i = 0; i < vertsz; i++) {
            var x= vertices[ci], y= vertices[ci + 1];
            vbdata[f32pos] = x * m00 + y * m10 + tx;
            vbdata[f32pos + 1] = x * m01 + y * m11 + ty;
            vbdata[f32pos + 2] = uvminx + uvs[ci]*uvu;
            vbdata[f32pos + 3] = uvminy + uvs[ci + 1]*uvv;

            vbdata[f32pos + 4] = b;
            vbdata[f32pos + 5] = g;
            vbdata[f32pos + 6] = r;
            vbdata[f32pos + 7] = a;
            vbdata[f32pos+8] = 0xff;
            f32pos += 12;
            ci += 2;
        }

        var vertN= this._vertNum;
        var ibstart= this._indexNum;
        this.expIBSize(idx.byteLength)
        var indexBuffer = this._ibU16Array;
        if (vertN > 0) {
            for (let i = ibstart,si=0, end=ibstart + idx.length; i < end; i++, si++) {
                indexBuffer[i] = idx[si] + vertN;
            }
        } else {
            indexBuffer.set(idx);
        }

        this._vertNum += vertsz;
        this._indexNum += idx.length;
    }

	get vertexDeclarition(){
		return MeshTexture.VertexDeclarition;
	}
}

