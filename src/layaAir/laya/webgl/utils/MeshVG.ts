import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { VertexElement } from "../../renders/VertexElement";
import { VertexElementFormat } from "../../renders/VertexElementFormat";
import { Mesh2D } from "./Mesh2D";

/**
 * 用来画矢量的mesh。顶点格式固定为 x,y,rgba
 */
export class MeshVG extends Mesh2D {
    static const_stride = 12;// 36;
    static vertexDeclaration: VertexDeclaration = null;
	private _vbUin32Array:Uint32Array=null;
	private _vbFloat32Array:Float32Array=null;

    static __init__(): void {
        MeshVG.vertexDeclaration = new VertexDeclaration(12, [
            new VertexElement(0, VertexElementFormat.Vector2, 0),//xy
            new VertexElement(8, VertexElementFormat.Byte4, 1), //color
        ]);
    }

    constructor() {
        super(MeshVG.const_stride, 4, 4);	//x,y,rgba
    }

	protected onVBRealloc(buff: ArrayBuffer): void {
		this._vbUin32Array = new Uint32Array(buff);
		this._vbFloat32Array = new Float32Array(buff);
	}  
    protected onIBRealloc(buff: ArrayBuffer): void {
    }

    /**
     * 往矢量mesh中添加顶点和index。会把rgba和points在mesh中合并。
     * @param	points	顶点数组，只包含x,y。[x,y,x,y...]
     * @param	rgba	rgba颜色
     * @param	ib		index数组。
     */
    addVertAndIBToMesh(points: number[], rgba: number, ib: any[]): void {
        var startpos = this._vertNum*MeshVG.const_stride;
        this.expVBSize(points.length/2*MeshVG.const_stride);
        var f32pos = startpos >> 2;
        var vbdata = this._vbFloat32Array;
        var vbu32Arr = this._vbUin32Array
        var ci = 0;
        //vb
        var sz = points.length / 2;
        for (var i = 0; i < sz; i++) {
            vbdata[f32pos++] = points[ci]; vbdata[f32pos++] = points[ci + 1]; ci += 2;  //+=2是表示留了2个float么？
            vbu32Arr[f32pos++] = rgba;
        }

        //ib
        //TODO 现在这种添加数据的方法效率非常低。而且会引起大量的gc
        this.expIBSize(ib.length*2);
        //append index
        (new Uint16Array(this._IBBuff,this._indexNum*2,ib.length)).set(new Uint16Array(ib))

        this._vertNum += sz;
        this._indexNum += ib.length;
    }

	get vertexDeclarition(){
		return MeshVG.vertexDeclaration;
	}

}

