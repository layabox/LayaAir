import { LayaGL } from "../../../../layagl/LayaGL";
import { VertexBuffer3D } from "../../../graphics/VertexBuffer3D";
import { VertexDeclaration } from "../../../graphics/VertexDeclaration";
import { Vector2 } from "../../../math/Vector2";
import { Vector3 } from "../../../math/Vector3";
import { Vector4 } from "../../../math/Vector4";
import { DrawMeshInstancedCMD } from "./DrawMeshInstancedCMD";

/**
 * @internal
 * <code>Mesh</code> 类用于创建CustomInstance属性。
 */
export class MaterialInstanceProperty{
	/**@internal instanceProperty name*/
	public _name:string;
	/**@internal property Data*/
	public _value:Vector4[]|Vector3[]|Vector2[]|Float32Array;
	/**@internal vertex Declaration */
	public _vertexDeclaration:VertexDeclaration;
	/**@internal */
	public _isNeedUpdate:boolean = false;
	/**@internal */
	public _vertexStride:number;
	/**@internal */
	public _instanceData:Float32Array;
	/**@internal */
	public _vertexBuffer:VertexBuffer3D;

	/**
	 * @internal
	 * 创建instance顶点Buffer
	 */
	createInstanceVertexBuffer3D(){
		var gl = LayaGL.instance;
		this._instanceData = new Float32Array(DrawMeshInstancedCMD.maxInstanceCount*this._vertexStride);
		this._vertexBuffer = new VertexBuffer3D(this._instanceData.length*4,gl.DYNAMIC_DRAW);
		this._vertexBuffer.vertexDeclaration = this._vertexDeclaration;
	}

	/**
	 * @internal
	 * 更新顶点数据
	 */
	updateVertexBufferData(drawNums:number){
		//更新数据
		if(!this._isNeedUpdate)
			return;
		let instanceData = this._instanceData;
		let dataValue = this._value;
		let datalength = this._value.length;
		let data:Vector2|Vector3|Vector4;
		let stride = this._vertexStride;
		let updateType = 0;
		if(!(this._value instanceof Float32Array)){
			updateType = 1;//判断为Vector数据
		}

		switch(updateType){
			case 0:
				instanceData.set(<Float32Array>dataValue,0);
				break;
			case 1:
				for (let i = 0; i < datalength; i++) {
					data = <Vector2|Vector3|Vector4>dataValue[i];
					data.toArray(instanceData,i*stride);
				}
				break;
		}
		this._vertexBuffer.orphanStorage();
		this._vertexBuffer.setData(instanceData.buffer,0,0,drawNums*4*(updateType?stride:1));
	}
}