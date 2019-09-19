import { LayaGL } from "../../layagl/LayaGL";
import { Context } from "../../resource/Context";
import { Mesh2D } from "./Mesh2D";

/**
 * 用来画矢量的mesh。顶点格式固定为 x,y,rgba
 */
export class MeshVG extends Mesh2D {
	static const_stride: number = 12;// 36;
	private static _fixattriInfo: any[];
	private static _POOL: any[] = [];

	static __init__(): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		MeshVG._fixattriInfo = [5126/*gl.FLOAT*/, 2, 0,	//x,y
		5121/*gl.UNSIGNED_BYTE*/, 4, 8];
	}

	constructor() {
		super(MeshVG.const_stride, 4, 4);	//x,y,rgba
		this.canReuse = true;
		this.setAttributes(MeshVG._fixattriInfo);
	}

	static getAMesh(mainctx: boolean): MeshVG {
		//console.log('getmeshvg');
		var ret: MeshVG;
		if (MeshVG._POOL.length) {
			ret = MeshVG._POOL.pop();
		} else
			ret = new MeshVG();
		mainctx && ret._vb._resizeBuffer(64 * 1024 * MeshVG.const_stride, false);
		return ret;
	}

	/**
	 * 往矢量mesh中添加顶点和index。会把rgba和points在mesh中合并。
	 * @param	points	顶点数组，只包含x,y。[x,y,x,y...]
	 * @param	rgba	rgba颜色
	 * @param	ib		index数组。
	 */
	addVertAndIBToMesh(ctx: Context, points: any[], rgba: number, ib: any[]): void {
		var startpos: number = this._vb.needSize(points.length / 2 * MeshVG.const_stride);//vb的起点。
		var f32pos: number = startpos >> 2;
		var vbdata: Float32Array = this._vb._floatArray32 || this._vb.getFloat32Array();
		var vbu32Arr: Uint32Array = this._vb._uint32Array;
		var ci: number = 0;
		//vb
		//var clipinfo:Array = ctx.getTransedClipInfo();
		var sz: number = points.length / 2;
		for (var i: number = 0; i < sz; i++) {
			vbdata[f32pos++] = points[ci]; vbdata[f32pos++] = points[ci + 1]; ci += 2;
			vbu32Arr[f32pos++] = rgba;
			/*
			//裁剪信息。
			vbdata[f32pos++] = clipinfo[2] ; vbdata[f32pos++] = clipinfo[3]; vbdata[f32pos++] = clipinfo[4]; vbdata[f32pos++] = clipinfo[5];//cliprect的方向
			vbdata[f32pos++] = clipinfo[0]; vbdata[f32pos++] = clipinfo[1]; //cliprect的位置
			*/
		}
		this._vb.setNeedUpload();

		//ib
		//TODO 现在这种添加数据的方法效率非常低。而且会引起大量的gc
		this._ib.append(new Uint16Array(ib));
		this._ib.setNeedUpload();

		this.vertNum += sz;
		this.indexNum += ib.length;
	}

		/**
		 * 把本对象放到回收池中，以便getMesh能用。
		 * @override
		 */
		  releaseMesh(): void {
		this._vb.setByteLength(0);
		this._ib.setByteLength(0);
		this.vertNum = 0;
		this.indexNum = 0;
		//_applied = false;
		MeshVG._POOL.push(this);
	}
/**
 * @override
 */
		  destroy(): void {
		this._ib.destroy();
		this._vb.destroy();
		this._ib.disposeResource();
		this._vb.deleteBuffer();
	}
}

