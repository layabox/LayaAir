import { BaseRenderNode2D } from "../../../../NodeRender2D/BaseRenderNode2D";
import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { IClipInfo, IRenderStruct2D } from "../../Design/2D/IRenderStruct2D";
import { Rectangle } from "../../../../maths/Rectangle";
import { SpriteGlobalTransform } from "../../../../display/SpriteGlobaTransform";
import { WebRender2DPass } from "./WebRender2DPass";
import { Render2DSimple } from "../../../../renders/Render2D";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { Matrix } from "../../../../maths/Matrix";
import { Vector4 } from "../../../../maths/Vector4";
import { Const } from "../../../../Const";
import { IRender2DDataHandle } from "../../Design/2D/IRender2DDataHandle";
import { WebRender2DDataHandle } from "./WebRenderDataHandle";
import { BlendMode } from "../../../../webgl/canvas/BlendMode";

const _DefaultClipInfo: IClipInfo = {
   clipMatrix: new Matrix(),
   clipMatDir: new Vector4(Const.MAX_CLIP_SIZE, 0, 0, Const.MAX_CLIP_SIZE),
   clipMatPos: new Vector4(0, 0, 0, 0),
}
export class WebRenderStruct2D implements IRenderStruct2D {

   //2d 渲染组织流程数据
   zOrder: number;

   rect: Rectangle = new Rectangle(0, 0, 0, 0);

   renderLayer: number = 0;

   parent: WebRenderStruct2D | null;

   children: WebRenderStruct2D[] = [];

   /** 按标记来 */
   renderType: number;

   renderUpdateMask: number;

   //渲染继承累加数据
   transform: SpriteGlobalTransform = null;

   globalAlpha: number = 1.0;

   alpha: number = 1.0;

   blendMode: string = null;
   /** @internal */
   _parentBlendMode: string = null;

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

   pass: WebRender2DPass;

   constructor() {
   }


   // private _clipMatrix: Matrix = null;
   // private _parentClipMatrix: Matrix = null;
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

   setAlpha(alpha: number): void {
      this.alpha = alpha;
      this._updateChildren(2);
   }

   setBlendMode(blendMode: string): void {
      this.blendMode = blendMode;
      this._updateChildren(1);
   }

   //处理Struct的继承数据，后续没有必要就删除
   _handleInterData(): void {
      if (this.parent) {
         this.globalAlpha = this.alpha * this.parent.globalAlpha;
         this._parentBlendMode = this.parent.getBlendMode();
         this._parentClipInfo = this.parent.getClipInfo();
      } else {
         this.globalAlpha = this.alpha;
      }

      //clip处理 
      let rect = this._clipRect;
      if (rect) {
         let info = this._clipInfo;
         let mat = this.transform.getMatrix();
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

   getBlendMode(): string {
      return this.blendMode || this._parentBlendMode || BlendMode.NORMAL;
   }

   setClipRect(rect: Rectangle): void {
      this._clipRect = rect;
      this._initClipInfo();
      this._updateChildren(0);
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


   /**
    * @internal 
    * @type -1 | 0 | 1 |2
    * -1 all , 0 clip , 1 blend , 2 alpha
    */
   _updateChildren(type: -1 | 0 | 1 | 2): void {
      let info: IClipInfo, blendMode: string, alpha: number;
      if (type === -1) {
         info = this.getClipInfo();
         blendMode = this.getBlendMode();
         alpha = this.globalAlpha;
      }
      else if (type === 0) {
         info = this.getClipInfo();
      } else if (type === 1) {
         blendMode = this.getBlendMode();
      } else if (type === 2) {
         alpha = this.globalAlpha;
      }

      for (const child of this.children) {
         if (type === -1) {
            child._parentClipInfo = info;
            child._parentBlendMode = blendMode;
            child.globalAlpha = alpha * child.alpha;
            this._updateChildren(type);
         } else if (type === 0) {
            if (!child._parentClipInfo) {
               child._parentClipInfo = info;
               this._updateChildren(type);
            }
         } else if (type === 1) {
            if (!child._parentBlendMode) {
               child._parentBlendMode = blendMode;
               this._updateChildren(type);
            }
         } else if (type === 2) {
            child.globalAlpha = alpha * child.alpha;
            this._updateChildren(type);
         }
      }
   }

   setRepaint(): void {
      if (this.pass) {
         this.pass.repaint = true;
      }
   }

   addChild(child: WebRenderStruct2D): WebRenderStruct2D {
      child.parent = this;
      this.children.push(child);
      //效率
      if (this.pass) {
         this.updateChildren(this, this.pass.priority);
      }
      return child;
   }

   protected updateChildren(struct: WebRenderStruct2D, priority: number): void {
      for (const child of struct.children) {
         if (!child.pass) {
            child.pass = struct.pass;
         }
         else if (child.pass !== this.pass) {
            child.pass.priority = ++priority;
         }
         child.updateChildren(child, priority);
      }
   }

   removeChild(child: WebRenderStruct2D): void {
      const index = this.children.indexOf(child);
      if (index !== -1) {
         child.parent = null;
         this.children.splice(index, 1);
      }
   }

   renderUpdate(context: IRenderContext2D): void {
      this.renderDataHandler.inheriteRenderData(context);
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