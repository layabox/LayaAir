
// import { LayaGL } from "../../../layagl/LayaGL";
// import { NativeRenderElementOBJ, RenderElementType } from "./NativeRenderElementOBJ";

// export class NativeSkinRenderElementOBJ extends  NativeRenderElementOBJ {
    
//     _skinnedData:Float32Array[];

//     constructor(){
//         super();
//     }
//     get skinnedData():Float32Array[] {
//         return this._skinnedData;
//     }
//     set skinnedData(data:Float32Array[]) {
//         this._skinnedData = data;
//         this._nativeObj._skinnedData = data;
//     }
//     init(): void {
//         this._nativeObj = new (window as any).conchRenderElement(RenderElementType.Skin, (LayaGL.renderEngine as any)._nativeObj);
//     }
// }