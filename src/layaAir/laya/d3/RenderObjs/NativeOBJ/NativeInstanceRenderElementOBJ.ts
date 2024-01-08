
// import { LayaGL } from "../../../layagl/LayaGL";
// import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
// import { NativeRenderElementOBJ, RenderElementType } from "./NativeRenderElementOBJ";

// export class NativeInstanceRenderElementOBJ extends NativeRenderElementOBJ {
//     /**@internal 当instance数量特别大时可能需要一段一段数据来画,所以需要更新顶点数据*/
//     private _vertexBuffer3D: Array<VertexBuffer3D> = [];

//     private _updateData: Array<Float32Array> = [];


//     private _updateNums: number;

//     /**
//      * 增加UpdateBuffer
//      * @param vb 
//      * @param length 每个instance属性的数据长度
//      */
//     addUpdateBuffer(vb: VertexBuffer3D,length:number) {
//         this._vertexBuffer3D[this._updateNums++] = vb;
//         this._nativeObj.addUpdateBuffer((vb as any)._conchVertexBuffer3D, length);
//     }

//     /**
//      * 
//      * @param index index of Buffer3D
//      * @param length length of array
//      */
//     getUpdateData(index: number,length:number): Float32Array {
//         let data = this._updateData[index];
//         if (!data || data.length < length) {
//             data = this._updateData[index] = new Float32Array(length);
//             this._nativeObj.getUpdateData(index, data);
//         }
//         return data;
//     }

//     constructor() {
//         super();
//     }

//     clear() {
//         this._updateNums = 0;
//         this._nativeObj.clear();
//     }

//     init(): void {
//         this._nativeObj = new (window as any).conchRenderElement(RenderElementType.Instance, (LayaGL.renderEngine as any)._nativeObj);
//     }

//     set drawCount(drawCount: number) {
// 		this._nativeObj.drawCount = drawCount;
// 	} 

// 	get drawCount(): number {
// 		return this._nativeObj.drawCount;
// 	}
// }