import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { IClipInfo, IRenderStruct2D } from "../../Design/2D/IRenderStruct2D";
import { Rectangle } from "../../../../maths/Rectangle";
import { WebRender2DPass } from "./WebRender2DPass";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { Matrix } from "../../../../maths/Matrix";
import { Vector4 } from "../../../../maths/Vector4";
import { Const } from "../../../../Const";
import { WebRender2DDataHandle } from "./WebRenderDataHandle";
import { BlendMode, BlendModeHandler } from "../../../../webgl/canvas/BlendMode";
import { I2DGlobalRenderData } from "../../Design/2D/IRender2DDataHandle";
import { Stat } from "../../../../utils/Stat";

const _DefaultClipInfo: IClipInfo = {
   clipMatrix: new Matrix(),
   clipMatDir: new Vector4(Const.MAX_CLIP_SIZE, 0, 0, Const.MAX_CLIP_SIZE),
   clipMatPos: new Vector4(0, 0, 0, 0),
}

export class WebGlobalRenderData implements I2DGlobalRenderData {
   cullRect: Vector4;
   renderLayerMask: number;
   globalShaderData: ShaderData;
}

export enum ChildrenUpdateType {
   All = -1,
   Clip = 1,
   Blend = 2,
   Alpha = 4,
   Pass = 8,
}

export class structTransform {
   matrix: Matrix;
   modifiedFrame: number;
}

export class WebRenderStruct2D implements IRenderStruct2D {

   //2d 渲染组织流程数据
   zIndex: number = 0;

   rect: Rectangle = new Rectangle(0, 0, 0, 0);

   renderLayer: number = -1;

   parent: WebRenderStruct2D | null;

   children: WebRenderStruct2D[] = [];

   /** 按标记来 */
   renderType: number = -1;

   renderUpdateMask: number = 0;

   public get renderMatrix(): Matrix {
      return this.trans.matrix;
   }

   public set renderMatrix(value: Matrix) {

      if (!this.trans) {
         this.trans = new structTransform();
         this.trans.matrix = new Matrix();
      }

      this.trans.matrix = value;
      this.trans.modifiedFrame = Stat.loopCount;
   }

   trans: structTransform

   globalAlpha: number = 1.0;

   private _alpha: number = 1.0;

   public get alpha(): number {
      return this._alpha;
   }

   public set alpha(value: number) {
      this._alpha = value;
      this.updateChildren(ChildrenUpdateType.Alpha);
   }

   private _blendMode: BlendMode = BlendMode.Normal;
   private _parentBlendMode: BlendMode = BlendMode.Normal;

   public get blendMode(): BlendMode {
      return this._blendMode || this._parentBlendMode || BlendMode.Normal;
   }

   public set blendMode(value: BlendMode) {
      this._blendMode = value;
      this._updateBlendMode();
      this.updateChildren(ChildrenUpdateType.Blend);
   }

   /** @internal */

   /** 是否启动 */
   enable: boolean = true;

   //渲染数据

   isRenderStruct: boolean = false;

   renderElements: IRenderElement2D[] = null;

   spriteShaderData: ShaderData = null;

   commonUniformMap: string[] = null;

   private _renderDataHandler: WebRender2DDataHandle;

   public get renderDataHandler(): WebRender2DDataHandle {
      return this._renderDataHandler;
   }
   
   public set renderDataHandler(value: WebRender2DDataHandle) {
      this._renderDataHandler = value;
      if (value)
         this._renderDataHandler.owner = this;
   }

   globalRenderData: WebGlobalRenderData;

   private _pass: WebRender2DPass;
   private _parentPass: WebRender2DPass;

   public get pass(): WebRender2DPass {
      return this._pass || this._parentPass;
   }

   public set pass(value: WebRender2DPass) {
      this._pass = value;
      if (value) {
         this.updateChildren(ChildrenUpdateType.Pass);
      }
   }

   constructor() {
   }

   private _clipRect: Rectangle = null;
   private _parentClipInfo: IClipInfo = null;
   private _clipInfo: IClipInfo = null;

   // RenderNode
   private _rnUpdateCall: any = null;
   private _rnUpdateFun: any = null;


   set_renderNodeUpdateCall(call: any, renderUpdateFun: any): void {
      this._rnUpdateCall = call;
      this._rnUpdateFun = renderUpdateFun;
   }


   //处理Struct的继承数据，后续没有必要就删除
   _handleInterData(): void {
      // if (this.parent) {
      //    this.globalAlpha = this.alpha * this.parent.globalAlpha;
      //    this._parentBlendMode = this.parent.getBlendMode();
      //    this._parentClipInfo = this.parent.getClipInfo();
      // } else {
      //    this.globalAlpha = this.alpha;
      // }

      //clip处理 
      let rect = this._clipRect;
      if (rect) {
         let info = this._clipInfo;
         let mat = this.renderMatrix;
         let cm = info.clipMatrix;
         let { x, y, width, height } = rect;
         cm.tx = x * mat.a + y * mat.c + mat.tx;
         cm.ty = x * mat.b + y * mat.d + mat.ty;
         cm.a = width * mat.a;
         cm.b = width * mat.b;
         cm.c = height * mat.c;
         cm.d = height * mat.d;
         info.clipMatDir.setValue(cm.a, cm.b, cm.c, cm.d);
         info.clipMatPos.setValue(cm.tx, cm.ty, mat.tx, mat.ty);
      }
   }

   private _updateBlendMode(): void {
      if (!this.spriteShaderData) return;
      BlendModeHandler.setShaderData(this.blendMode, this.spriteShaderData);
   }


   setClipRect(rect: Rectangle): void {
      this._clipRect = rect;
      this._initClipInfo();
      this.updateChildren(ChildrenUpdateType.Clip);
   }

   private _initClipInfo(): void {
      if (!this._clipInfo) {
         this._clipInfo = {} as any;
         this._clipInfo.clipMatDir = new Vector4;
         this._clipInfo.clipMatPos = new Vector4;
         this._clipInfo.clipMatrix = new Matrix;
      }
   }

   getClipInfo(): IClipInfo {
      return this._clipInfo || this._parentClipInfo || _DefaultClipInfo;
   }


   updateChildren( type: ChildrenUpdateType): void {
      let info: IClipInfo, blendMode: BlendMode, alpha: number;
      let priority: number = 0 , pass: WebRender2DPass = null;
      let updateBlend = false , updateClip = false , updateAlpha = false , updatePass = false;

      if (type & ChildrenUpdateType.Clip) {
         info = this.getClipInfo();
         updateClip = true;
      }

      if (type & ChildrenUpdateType.Blend) {
         blendMode = this.blendMode;
         updateBlend = true;
      }

      if (type & ChildrenUpdateType.Alpha) {
         alpha = this.globalAlpha;
         updateAlpha = true;
      }

      if (type & ChildrenUpdateType.Pass) {
         pass = this.pass;
         priority = pass ? pass.priority + 1 : 0;
         updatePass = true;
      }

      for (const child of this.children) {
         let updateChild = false;
         if (updateClip) {
            if (!child._clipInfo) {
               child._parentClipInfo = info;
               updateChild = true;
            }
         }

         if (updateBlend) {
            if (!child.blendMode) {
               child._parentBlendMode = blendMode;
               child._updateBlendMode();
               updateChild = true;
            }
         }

         if (updateAlpha) {
            child.globalAlpha = alpha * child.alpha;
            updateChild = true;
         }

         if (updatePass) {
            child._parentPass = pass;

            if (child._pass && child._pass !== pass) {
               child._pass.priority = priority;
            }

            updateChild = true;
         }

         if (updateChild) {
            child.updateChildren(type);
         }
      }
   }

   setRepaint(): void {
      if (this.pass) {
         this.pass.repaint = true;
      }
   }

   addChild(child: WebRenderStruct2D, index: number): WebRenderStruct2D {
      child.parent = this;
      this.children.splice(index, 0, child);
      //效率
      this.updateChildren(ChildrenUpdateType.All);
      return child;
   }

   updateChildIndex(child: WebRenderStruct2D, oldIndex: number, index: number): void {
      if (oldIndex === index)
         return;

      this.children.splice(oldIndex, 1);
      if (index >= this.children.length) {
         this.children.push(child);
      } else {
         this.children.splice(index, 0, child);
      }
   }

   removeChild(child: WebRenderStruct2D): void {
      const index = this.children.indexOf(child);
      if (index !== -1) {
         child.parent = null;
         this.children.splice(index, 1);

         child._parentPass = null;
         child._parentClipInfo = null;
         child._parentBlendMode = BlendMode.Normal;
         child.updateChildren(ChildrenUpdateType.All);
      }
   }

   renderUpdate(context: IRenderContext2D): void {
      if (this.renderDataHandler) {
         this.renderDataHandler.inheriteRenderData(context);
      }

      if (this._rnUpdateFun)
         this._rnUpdateFun?.call(this._rnUpdateCall, context);
   }

   destroy(): void {
      this._clipInfo = null;
      this._parentClipInfo = null;
      this._clipRect = null;
      this.renderElements.length = 0;
      this.renderElements = null;
      this.spriteShaderData = null;
      this.parent = null;
      this.children.length = 0;
      this.children = null;
      this.pass = null;
   }
}