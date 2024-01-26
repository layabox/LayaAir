// import { LayaGL } from "../layagl/LayaGL";
// import { RenderStateType } from "./RenderEnum/RenderStateType";

// /**
//  * 渲染状态设置命令流
//  */
// export class RenderStateCommand{
//     cmdArray:Map<RenderStateType,any> = new Map();
//     constructor(){

//     }
//     addCMD(renderstate:RenderStateType,value:number|boolean|Array<number>){
//         this.cmdArray.set(renderstate,value);
//     }

//     applyCMD(){
//         LayaGL.renderEngine.applyRenderStateCMD(this);
//     }

//     clear(){
//         this.cmdArray.clear();
//     }
// }