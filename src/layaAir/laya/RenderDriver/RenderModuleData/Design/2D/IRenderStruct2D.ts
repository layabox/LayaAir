import { Sprite } from "../../../../display/Sprite";
import { Matrix } from "../../../../maths/Matrix";
import { Rectangle } from "../../../../maths/Rectangle";
import { Vector4 } from "../../../../maths/Vector4";
import { BlendMode } from "../../../../webgl/canvas/BlendMode";
import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { I2DGlobalRenderData, IRender2DDataHandle } from "./IRender2DDataHandle";
import { IRender2DPass } from "./IRender2DPass";

/** @ignore @blueprintIgnore */
export interface IClipInfo {
   clipMatDir: Vector4;
   clipMatPos: Vector4;
   clipMatrix: Matrix;
   _updateFrame: number;
}

/** 
 * @ignore @blueprintIgnore
 * 需要传递的属性 get 效率慢
 */
export interface IRenderStruct2D {

   subStruct: IRenderStruct2D;

   owner: Sprite;

   //-----2d 渲染组织流程数据-----
   zIndex: number;
   stackingRoot: boolean; //是否是堆叠根节点

   enableCulling: boolean;
   
   rect: Rectangle;

   renderLayer: number;

   parent: IRenderStruct2D | null;

   children: IRenderStruct2D[];

   /** 按标记来 */
   renderType: number;

   renderUpdateMask: number;

   //----- 渲染继承累加数据 -----
   renderMatrix: Matrix;
   /** 非即时数据 */
   globalAlpha: number;

   alpha: number;

   blendMode: BlendMode;
   /** 是否启动 */
   enabled: boolean;

   //自动优化dc相关
   dcOptimize: boolean;
   // dcBoundsTarget: IRenderStruct2D;

   //渲染数据
   isRenderStruct: boolean;

   renderElements: IRenderElement2D[];

   spriteShaderData: ShaderData;

   renderDataHandler: IRender2DDataHandle;

   globalRenderData: I2DGlobalRenderData;

   pass: IRender2DPass;

   setRepaint(): void;

   addChild(child: IRenderStruct2D, index: number): void;

   updateChildIndex(child: IRenderStruct2D, oldIndex: number, index: number): void;

   removeChild(child: IRenderStruct2D): void;

   setClipRect(rect: Rectangle): void;

   // renderUpdate(context: IRenderContext2D): void;

   setRenderUpdateCallback(func: Function): void;

   destroy(): void;
}


