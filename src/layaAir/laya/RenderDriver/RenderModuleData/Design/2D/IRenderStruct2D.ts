import { SpriteGlobalTransform } from "../../../../display/SpriteGlobaTransform";
import { Rectangle } from "../../../../maths/Rectangle";
import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { IRender2DPass } from "./IRender2DPass";

export interface IRenderStruct2D {
   zOrder:number;
   //待确定
   transform: SpriteGlobalTransform;
   //待确定
   rect:Rectangle;
   renderLayer: number ;
   alpha:number;

   pass:IRender2DPass;
   
   _renderElements:IRenderElement2D[];

   /** 按标记来 */
   _renderType:number;
   _renderUpdateMask:number;
   
   parent:IRenderStruct2D;
   children:IRenderStruct2D[];
   addChild(child:IRenderStruct2D):IRenderStruct2D;
   removeChild(child:IRenderStruct2D):void;
   // addCMDCall(context:Context, x:number, y:number):void;
   renderUpdate(context:IRenderContext2D):void;
   preRenderUpdate(context:IRenderContext2D):void;
   // 带确认
   set_getBoundsCall(call:any, getBoundsFun:any):void;
   set_renderNodeUpdateCall(call:any , renderUpdateFun : any , preRenderUpdateFun : any , getRenderElements:any): void ;
   set_grapicsUpdateCall(call:any , renderUpdateFun:any , getRenderElements:any): void ;
}