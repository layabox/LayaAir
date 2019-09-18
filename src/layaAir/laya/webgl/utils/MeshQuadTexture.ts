import { IndexBuffer2D } from "./IndexBuffer2D";
import { Mesh2D } from "./Mesh2D";
import { VertexBuffer2D } from "./VertexBuffer2D";
/**
 * drawImage，fillRect等会用到的简单的mesh。每次添加必然是一个四边形。
 */
export class MeshQuadTexture extends Mesh2D {
	static const_stride: number = 24;// 48;  24是不带clip的
	private static _fixib: IndexBuffer2D;
	private static _maxIB: number = 16 * 1024;
	private static _fixattriInfo: any[];
	private static _POOL: any[] = [];
	//private static var _num;

	static __int__(): void {
		//var gl: WebGLRenderingContext = LayaGL.instance;
		MeshQuadTexture._fixattriInfo = [5126/*gl.FLOAT*/, 4, 0,	//pos,uv
		5121/*gl.UNSIGNED_BYTE*/, 4, 16,	//color alpha
		5121/*gl.UNSIGNED_BYTE*/, 4, 20];
	}


	constructor() {
		super(MeshQuadTexture.const_stride, 4, 4);	//x,y,u,v,rgba
		this.canReuse = true;
		this.setAttributes(MeshQuadTexture._fixattriInfo);
		if (!MeshQuadTexture._fixib) {
			this.createQuadIB(MeshQuadTexture._maxIB);	//每个quad 4个顶点。正好达到64k的索引。
			MeshQuadTexture._fixib = this._ib;
		} else {
			this._ib = MeshQuadTexture._fixib;
			this._quadNum = MeshQuadTexture._maxIB;
		}
	}

	/**
	 * 
	 */
	static getAMesh(mainctx: boolean): MeshQuadTexture {
		//console.log('getmesh');
		var ret: MeshQuadTexture = null;
		if (MeshQuadTexture._POOL.length) {
			ret = MeshQuadTexture._POOL.pop();
		} else
			ret = new MeshQuadTexture();
		// 先分配64k顶点的空间，这样可以避免浪费内存，否则后面增加内存的时候是成倍增加的，当快超过64k的时候，直接变成了128k
		mainctx && ret._vb._resizeBuffer(64 * 1024 * MeshQuadTexture.const_stride, false);
		return ret;
	}

		/**
		 * 把本对象放到回收池中，以便getMesh能用。
		 * @override
		 */
		  releaseMesh(): void {
		this._vb.setByteLength(0);
		this.vertNum = 0;
		this.indexNum = 0;
		//_applied = false;
		MeshQuadTexture._POOL.push(this);
	}
		/**
		 * @override
		 */
		  destroy(): void {
		//_ib.destroy(); ib是公用的。
		this._vb.destroy();
		this._vb.deleteBuffer();
	}

	/**
	 * 
	 * @param	pos
	 * @param	uv
	 * @param	color
	 * @param	clip   ox,oy,xx,xy,yx,yy
	 * @param 	useTex 是否使用贴图。false的话是给fillRect用的
	 */
	addQuad(pos: any[], uv: ArrayLike<number>, color: number, useTex: boolean): void {
		var vb: VertexBuffer2D = this._vb;
		var vpos: number = (vb._byteLength >> 2);	//float数组的下标
		//x,y,u,v,rgba
		vb.setByteLength((vpos + MeshQuadTexture.const_stride) << 2); //是一个四边形的大小，也是这里填充的大小
		var vbdata: Float32Array = vb._floatArray32 || vb.getFloat32Array();
		var vbu32Arr: Uint32Array = vb._uint32Array;
		var cpos: number = vpos;
		var useTexVal: number = useTex ? 0xff : 0;
		vbdata[cpos++] = pos[0]; vbdata[cpos++] = pos[1]; vbdata[cpos++] = uv[0]; vbdata[cpos++] = uv[1]; vbu32Arr[cpos++] = color; vbu32Arr[cpos++] = useTexVal;
		vbdata[cpos++] = pos[2]; vbdata[cpos++] = pos[3]; vbdata[cpos++] = uv[2]; vbdata[cpos++] = uv[3]; vbu32Arr[cpos++] = color; vbu32Arr[cpos++] = useTexVal;
		vbdata[cpos++] = pos[4]; vbdata[cpos++] = pos[5]; vbdata[cpos++] = uv[4]; vbdata[cpos++] = uv[5]; vbu32Arr[cpos++] = color; vbu32Arr[cpos++] = useTexVal;
		vbdata[cpos++] = pos[6]; vbdata[cpos++] = pos[7]; vbdata[cpos++] = uv[6]; vbdata[cpos++] = uv[7]; vbu32Arr[cpos++] = color; vbu32Arr[cpos++] = useTexVal;
		vb._upload = true;
	}
}

