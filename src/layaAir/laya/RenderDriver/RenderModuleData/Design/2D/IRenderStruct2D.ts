import { SpriteGlobalTransform } from "../../../../display/SpriteGlobaTransform";
import { Matrix } from "../../../../maths/Matrix";
import { Rectangle } from "../../../../maths/Rectangle";
import { Vector4 } from "../../../../maths/Vector4";
import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { IRender2DDataHandle } from "./IRender2DDataHandle";
import { IRender2DPass } from "./IRender2DPass";

export interface IClipInfo {
   clipMatDir: Vector4;
   clipMatPos: Vector4;
   clipMatrix: Matrix;
};

export interface IRenderStruct2D {
   //-----2d 渲染组织流程数据-----
   zOrder: number;
   //TODO
   rect: Rectangle;

   renderLayer: number;

   parent: IRenderStruct2D;

   children: IRenderStruct2D[];

   /** 按标记来 */
   renderType: number;

   renderUpdateMask: number;


   //----- 渲染继承累加数据 -----
   //待确定
   transform: SpriteGlobalTransform;
   /** 非即时数据 */
   globalAlpha: number;
   alpha: number;
   blendMode: string;
   /** 是否启动 */
   enable: boolean;

   //渲染数据
   isRenderStruct: boolean;

   renderElements: IRenderElement2D[];

   spriteShaderData: ShaderData;

   commonUniformMap: string[];
   
   renderDataHandler: IRender2DDataHandle;

   pass: IRender2DPass;

   setRepaint(): void;

   addChild(child: IRenderStruct2D): IRenderStruct2D;
   
   removeChild(child: IRenderStruct2D): void;

   setClipRect(rect: Rectangle): void;
   // getClipRect():Rectangle;

   // setClipMatrix(matrix:Matrix):void;
   getClipInfo(): IClipInfo;
   // addCMDCall(context:Context, x:number, y:number):void;
   renderUpdate(context: IRenderContext2D): void;
   preRenderUpdate(context: IRenderContext2D): void;

   set_spriteUpdateCall(call: any, renderUpdateFun: any, clearRepaint: any): void;
   set_renderNodeUpdateCall(call: any, renderUpdateFun: any, preRenderUpdateFun: any, getRenderElements: any): void;
   set_grapicsUpdateCall(call: any, renderUpdateFun: any, getRenderElements: any): void;
   // 待确认
   set_getBoundsCall(call: any, getBoundsFun: any): void;

   destroy(): void;
}


