import { LayaGL } from "../../layagl/LayaGL";
import { Matrix } from "../../maths/Matrix";
import { IndexBuffer2D } from "./IndexBuffer2D";
import { Mesh2D } from "./Mesh2D";
import { VertexBuffer2D } from "./VertexBuffer2D";

/**
 * 与MeshQuadTexture基本相同。不过index不是固定的
 */
export class MeshTexture extends Mesh2D {
    static const_stride: number = 24;
    private static _fixattriInfo: any[];
    private static _POOL: any[] = [];


    static __init__(): void {
        var gl: WebGLRenderingContext = LayaGL.instance;
        MeshTexture._fixattriInfo = [5126/*gl.FLOAT*/, 4, 0,	//pos,uv
            5121/*gl.UNSIGNED_BYTE*/, 4, 16,	//color alpha
            5121/*gl.UNSIGNED_BYTE*/, 4, 20];
    }

    constructor() {
        super(MeshTexture.const_stride, 4, 4);	//x,y,u,v,rgba
        this.canReuse = true;
        this.setAttributes(MeshTexture._fixattriInfo);
    }

	/**
	 * 
	 */
    static getAMesh(mainctx: boolean): MeshTexture {
        //console.log('getmesh');
        var ret: MeshTexture;
        if (MeshTexture._POOL.length) {
            ret = MeshTexture._POOL.pop();
        }
        else ret = new MeshTexture();
        mainctx && ret._vb._resizeBuffer(64 * 1024 * MeshTexture.const_stride, false);
        return ret;
    }

    addData(vertices: Float32Array, uvs: Float32Array, idx: Uint16Array, matrix: Matrix, rgba: number): void {
        //vb
        var vb: VertexBuffer2D = this._vb;
        var ib: IndexBuffer2D = this._ib;
        var vertsz: number = vertices.length >> 1;
        var startpos: number = vb.needSize(vertsz * MeshTexture.const_stride);//vb的起点。			
        var f32pos: number = startpos >> 2;
        var vbdata: Float32Array = vb._floatArray32 || vb.getFloat32Array();
        var vbu32Arr: Uint32Array = vb._uint32Array;
        var ci: number = 0;
        var m00: number = matrix.a;
        var m01: number = matrix.b;
        var m10: number = matrix.c;
        var m11: number = matrix.d;
        var tx: number = matrix.tx;
        var ty: number = matrix.ty;
        var i: number = 0;
        //var clipinfo:Array = ctx.getTransedClipInfo();
        for (i = 0; i < vertsz; i++) {
            var x: number = vertices[ci], y: number = vertices[ci + 1];
            vbdata[f32pos] = x * m00 + y * m10 + tx;
            vbdata[f32pos + 1] = x * m01 + y * m11 + ty;
            vbdata[f32pos + 2] = uvs[ci];
            vbdata[f32pos + 3] = uvs[ci + 1];
            vbu32Arr[f32pos + 4] = rgba;
            vbu32Arr[f32pos + 5] = 0xff;
            f32pos += 6;
            //裁剪信息。
            //vbdata[f32pos++] = clipinfo[2] ; vbdata[f32pos++] = clipinfo[3]; vbdata[f32pos++] = clipinfo[4]; vbdata[f32pos++] = clipinfo[5];//cliprect的方向
            //vbdata[f32pos++] = clipinfo[0]; vbdata[f32pos++] = clipinfo[1];	//cliprect的位置
            ci += 2;
        }
        vb.setNeedUpload();

        var vertN: number = this.vertNum;
        var sz: number = idx.length;
        var stib: number = ib.needSize(idx.byteLength);
        var cidx: Uint16Array = ib.getUint16Array();
        //var cidx:Uint16Array = new Uint16Array(__JS__('ib._buffer'), stib);
        var stibid: number = stib >> 1;	// indexbuffer的起始位置
        if (vertN > 0) {
            var end: number = stibid + sz;
            var si: number = 0;
            for (i = stibid; i < end; i++ , si++) {
                cidx[i] = idx[si] + vertN;
            }
        } else {
            cidx.set(idx, stibid);
        }
        ib.setNeedUpload();

        this.vertNum += vertsz;
        this.indexNum += idx.length;
    }

		/**
		 * 把本对象放到回收池中，以便getMesh能用。
		 * @override
		 */
		 /*override*/ releaseMesh(): void {
        this._vb.setByteLength(0);
        this._ib.setByteLength(0);
        this.vertNum = 0;
        this.indexNum = 0;
        //_applied = false;
        MeshTexture._POOL.push(this);
    }
/**
 * @override
 */
		 /*override*/ destroy(): void {
        this._ib.destroy();
        this._vb.destroy();
        this._ib.disposeResource();
        this._vb.deleteBuffer();
    }
}

