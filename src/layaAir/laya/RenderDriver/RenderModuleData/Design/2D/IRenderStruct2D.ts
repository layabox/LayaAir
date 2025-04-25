import { SpriteGlobalTransform } from "../../../../display/SpriteGlobaTransform";
import { Matrix } from "../../../../maths/Matrix";
import { Rectangle } from "../../../../maths/Rectangle";
import { Vector2 } from "../../../../maths/Vector2";
import { Vector4 } from "../../../../maths/Vector4";
import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { IRender2DPass } from "./IRender2DPass";

export interface IClipInfo {
   clipMatDir: Vector4;
   clipMatPos: Vector4;
   clipMatrix: Matrix;
};

export interface IRenderStruct2D {
   zOrder:number;
   //待确定
   transform: SpriteGlobalTransform;
   /** 精灵shaderData */
   spriteShaderData:ShaderData;

   blendMode:string;
   //待确定
   rect:Rectangle;
   renderLayer: number ;
   /** 非即时数据 */
   globalAlpha:number;
   alpha:number;
   ///** 是否接收光照 */
   lightReceive: boolean;
   pass:IRender2DPass;
   
   mask:IRenderStruct2D;
   
   _renderElements:IRenderElement2D[];

   setRepaint():void;

   /** 按标记来 */
   _renderType:number;
   _renderUpdateMask:number;

   enable:boolean;
   
   parent:IRenderStruct2D;
   children:IRenderStruct2D[];
   addChild(child:IRenderStruct2D):IRenderStruct2D;
   removeChild(child:IRenderStruct2D):void;
   
   setClipRect(rect:Rectangle):void;

   // getClipRect():Rectangle;
   
   // setClipMatrix(matrix:Matrix):void;
   getClipInfo():IClipInfo;
   // addCMDCall(context:Context, x:number, y:number):void;
   renderUpdate(context:IRenderContext2D):void;
   preRenderUpdate(context:IRenderContext2D):void;

   set_spriteUpdateCall(call:any , renderUpdateFun : any , clearRepaint:any): void ;
   set_renderNodeUpdateCall(call:any , renderUpdateFun : any , preRenderUpdateFun : any , getRenderElements:any): void ;
   set_grapicsUpdateCall(call:any , renderUpdateFun:any , getRenderElements:any): void ;
   // 待确认
   set_getBoundsCall(call:any, getBoundsFun:any):void;

   destroy():void;
}