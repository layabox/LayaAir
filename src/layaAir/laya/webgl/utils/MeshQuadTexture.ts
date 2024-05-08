import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { VertexElement } from "../../renders/VertexElement";
import { VertexElementFormat } from "../../renders/VertexElementFormat";
import { Byte } from "../../utils/Byte";
import { Mesh2D } from "./Mesh2D";

/**
 * 直接创建一个固定的ib。按照固定四边形的索引。
 * @param	var QuadNum
 */
function createQuadIB(quadNum: number) {
	let ibbuf = new Byte(quadNum*6*2);
	let ib = new Uint16Array(ibbuf.buffer) ;
	var idx = 0;
	var curvert = 0;
	for (var i = 0; i < quadNum; i++) {
		ib[idx++] = curvert;
		ib[idx++] = curvert + 2;
		ib[idx++] = curvert + 1;
		ib[idx++] = curvert;
		ib[idx++] = curvert + 3;
		ib[idx++] = curvert + 2;
		curvert += 4;
	}
	return ib;
}	

/**
 * drawImage，fillRect等会用到的简单的mesh。每次添加必然是一个四边形。
 */
export class MeshQuadTexture extends Mesh2D {
	static const_stride = 48;// 48;  24是不带clip的
	private static _fixib: Uint16Array;
	private static _maxIB = 16 * 1024;
	static VertexDeclarition: VertexDeclaration;
	//操作vb的buffer
	//private _vbUin32Array:Uint32Array;	//注意不要赋值，因为super会给这个赋值，如果再设置null就会冲掉
	private _vbFloat32Array:Float32Array;
	private _curVBPos=0;

	static __int__(): void {
		MeshQuadTexture._fixib = createQuadIB(MeshQuadTexture._maxIB);	//每个quad 4个顶点。正好达到64k的索引。
		MeshQuadTexture.VertexDeclarition = new VertexDeclaration(48, [
			new VertexElement(0, VertexElementFormat.Vector4, 0),
			new VertexElement(16, VertexElementFormat.Vector4, 1),
			new VertexElement(32, VertexElementFormat.Vector4, 2),
		])
	}

	constructor(vballoc=4) {
		super(MeshQuadTexture.const_stride, vballoc, 4);	//x,y,u,v,rgba
	}

	protected onVBRealloc(buff: ArrayBuffer): void {
		//this._vbUin32Array = new Uint32Array(buff);
		this._vbFloat32Array = new Float32Array(buff);
	}
	protected onIBRealloc(buff: ArrayBuffer): void {
	}


	/**
	 * 
	 * @param pos 顶点坐标
	 * @param uv 纹理坐标
	 * @param color 顶点颜色
	 * @param useTex 是否使用贴图。false的话是给fillRect用的
	 */
	addQuad(pos: ArrayLike<number>, uv: ArrayLike<number>, color: number, useTex: boolean): void {
		this.expVBSize(MeshQuadTexture.const_stride);
		//x,y,u,v,rgba
		var vbdata = this._vbFloat32Array;
		//var vbu32Arr = this._vbUin32Array;
		let r = ((color>>>16)&0xff)/255.0; 
		let g = ((color>>>8)&0xff)/255.0; 
		let b = (color&0xff)/255.0; 
		let a = (color>>>24)/255.0; 
		var cpos = this._curVBPos;
		var useTexVal = useTex ? 1 : 0;
		vbdata[cpos++] = pos[0]; vbdata[cpos++] = pos[1]; vbdata[cpos++] = uv[0]; vbdata[cpos++] = uv[1]; 
		vbdata[cpos++] = b; vbdata[cpos++] = g; vbdata[cpos++] = r; vbdata[cpos++] = a; 
		vbdata[cpos++] = useTexVal; cpos+=3;

		vbdata[cpos++] = pos[2]; vbdata[cpos++] = pos[3]; vbdata[cpos++] = uv[2]; vbdata[cpos++] = uv[3]; 
		vbdata[cpos++] = b; vbdata[cpos++] = g; vbdata[cpos++] = r; vbdata[cpos++] = a; 
		vbdata[cpos++] = useTexVal; cpos+=3;
		
		vbdata[cpos++] = pos[4]; vbdata[cpos++] = pos[5]; vbdata[cpos++] = uv[4]; vbdata[cpos++] = uv[5]; 
		vbdata[cpos++] = b; vbdata[cpos++] = g; vbdata[cpos++] = r; vbdata[cpos++] = a; 
		vbdata[cpos++] = useTexVal; cpos+=3;

		vbdata[cpos++] = pos[6]; vbdata[cpos++] = pos[7]; vbdata[cpos++] = uv[6]; vbdata[cpos++] = uv[7]; 
		vbdata[cpos++] = b; vbdata[cpos++] = g; vbdata[cpos++] = r; vbdata[cpos++] = a; 
		vbdata[cpos++] = useTexVal; cpos+=3;
		
		this._curVBPos = cpos;
		this._vertNum+=4;
		this._indexNum+=6;
	}

	clearMesh(): void {
		super.clearMesh();
		this._curVBPos=0;
	}

    get ibBuffer():ArrayBuffer{
        return MeshQuadTexture._fixib.buffer;
    }

	get vertexDeclarition(){
		return MeshQuadTexture.VertexDeclarition;
	}
}

