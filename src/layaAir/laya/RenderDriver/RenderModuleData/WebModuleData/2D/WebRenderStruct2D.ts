import { BaseRenderNode2D } from "../../../../NodeRender2D/BaseRenderNode2D";
import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { IClipInfo, IRenderStruct2D } from "../../Design/2D/IRenderStruct2D";
import { Rectangle } from "../../../../maths/Rectangle";
import { SpriteGlobalTransform } from "../../../../display/SpriteGlobaTransform";
import { WebRender2DPass } from "./WebRender2DPass";
import { Render2DSimple } from "../../../../renders/Render2D";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { LayaGL } from "../../../../layagl/LayaGL";
import { ShaderDefines2D } from "../../../../webgl/shader/d2/ShaderDefines2D";
import { Matrix } from "../../../../maths/Matrix";
import { Vector4 } from "../../../../maths/Vector4";
import { Vector2 } from "../../../../maths/Vector2";
import { Const } from "../../../../Const";

const _DefaultClipInfo : IClipInfo = {
   clipMatrix: new Matrix(),
   clipMatDir: new Vector4(Const.MAX_CLIP_SIZE, 0, 0, Const.MAX_CLIP_SIZE),
   clipMatPos: new Vector4(0, 0, 0, 0),
}
export class WebRenderStruct2D implements IRenderStruct2D {

   zOrder: number;

   rect: Rectangle = new Rectangle(0, 0, 0, 0);
   /** 待定 */
   transform: SpriteGlobalTransform = null;

   _renderType: number = -1;

   _renderElements: IRenderElement2D[] = [];

   globalAlpha: number = 1.0;

   alpha: number = 1.0;
   
   spriteShaderData: ShaderData = null;

   parent: WebRenderStruct2D | null;

   children: WebRenderStruct2D[] = [];

   pass: WebRender2DPass;

   renderLayer: number = 0;
   /** @internal */
   _renderUpdateMask: number = 0;
   /** 目前只做记录 */
   blendMode:string = null;
   /** 是否启动 */
   enable:boolean = true;

   constructor() {
   }

   public get lightReceive() {
      return this.spriteShaderData.hasDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_ENABLE);
   }

   public set lightReceive(value) {
      if (value) {
         this.spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_ENABLE);
      } else {
         this.spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_ENABLE);
      }
   }

   // private _clipMatrix: Matrix = null;
   // private _parentClipMatrix: Matrix = null;
   private _clipRect: Rectangle = null;
   private _parentClipInfo: IClipInfo = null;
   private _clipInfo:IClipInfo = null;

   // RenderNode
   private _rnUpdateCall: any = null;
   private _rnUpdateFun: any = null;
   private _rnPreUpdateFun: any = null;
   private _rnGetElementsFun: any = null;
   // graphics
   private _gUpdateCall: any = null;
   private _gUpdateFun: any = null;
   private _gGetElementsFun: any = null;

   private _getBoundsCall: any = null;
   private _getBoundsFun: any = null;
   // sprite
   private _sUpdateCall: any = null;
   private _sUpdateFun: any = null;
   private _sClearRepaint: any = null;

   set_spriteUpdateCall(call: any, renderUpdateFun: any , clearRepaint:any): void {
      this._sUpdateCall = call;
      this._sUpdateFun = renderUpdateFun;
      this._sClearRepaint = clearRepaint;
   }

   set_renderNodeUpdateCall(call: any, renderUpdateFun: any, preRenderUpdateFun: any, getRenderElements: any): void {
      this._rnUpdateCall = call;
      this._rnUpdateFun = renderUpdateFun;
      this._rnPreUpdateFun = preRenderUpdateFun;
      this._rnGetElementsFun = getRenderElements;
   }

   set_grapicsUpdateCall(call: any, renderUpdateFun: any, getRenderElements: any): void {
      this._gUpdateCall = call;
      this._gUpdateFun = renderUpdateFun;
      this._gGetElementsFun = getRenderElements;
   }

   set_getBoundsCall(call: any, getBoundsFun: any): void {
      this._getBoundsCall = call;
      this._getBoundsFun = getBoundsFun;
   }

   // /** @internal */
   // private _updateChildrenRect(): void {
   //    let clipRect: Rectangle = this._clipRect ? this._clipRect : this._parentClipRect;
   //    for (const child of this.children) {
   //       child._parentClipRect = clipRect;
   //       child._updateChildrenRect();
   //    }
   // }

   private _updateGlobalAlpha(): void {
      if (this.parent) {
         this.globalAlpha = this.alpha * this.parent.globalAlpha;
      } else {
         this.globalAlpha = this.alpha;
      }
   }

   setClipRect(rect:Rectangle):void{
      this._clipRect = rect;
      this._initClipInfo();
      this._updateChildrenClipMatirx();
   }

   private _initClipInfo(): void {
      if (!this._clipInfo) {
         this._clipInfo = {} as any;
         this._clipInfo.clipMatDir = new Vector4;
         this._clipInfo.clipMatPos = new Vector4;
         this._clipInfo.clipMatrix = new Matrix;
      }
   }

   // getClipRect():Rectangle{
   //    return this._clipRect ? this._clipRect : this._parentClipRect;
   // }

   // setClipMatrix(matrix: Matrix): void {
   //    this._clipMatrix = matrix;
   //    this._updateChildrenClipMatirx();
   // }

   getClipInfo(): IClipInfo {
      return this._clipInfo || this._parentClipInfo || _DefaultClipInfo;
   }

   /** @internal */
   _updateChildrenClipMatirx() {
      let info = this.getClipInfo();
      for (const child of this.children) {
         if (!child._parentClipInfo) {
            child._parentClipInfo = info;
            child._updateChildrenClipMatirx();
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
      this._updateGlobalAlpha();

      this._sUpdateFun?.call(this._sUpdateCall, context);

      this._rnUpdateFun?.call(this._rnUpdateCall, context);

      this._gUpdateFun?.call(this._gUpdateCall, Render2DSimple.runner, 0, 0);
      
      this._sClearRepaint?.call(this._sUpdateCall);
   }

   preRenderUpdate(context: IRenderContext2D): void {

      this._renderElements.length = 0;

      if (this._rnPreUpdateFun) {
         this._rnPreUpdateFun.call(this._rnUpdateCall, context);
      }

      if (this._gGetElementsFun) {
         let elements = this._gGetElementsFun.call(this._gUpdateCall);
         this._renderElements.push(...elements);
      }

      if (this._rnGetElementsFun) {
         let elements = this._rnGetElementsFun.call(this._rnUpdateCall);
         this._renderElements.push(...elements);
      }

      // let _needRepaint = this.owner._needRepaint();
      // if (_needRepaint) {
      //    
      // }
      // //整理渲染元素
      // if (this.owner._renderNode) {
      //    this.owner._renderNode.preRenderUpdate?.(context);
      //    if (_needRepaint) {
      //       let elements = this.owner._renderNode._renderElements;
      //       for (let i = 0; i < elements.length; i++) {
      //          this._renderElements.push(elements[i]);
      //       }
      //    }
      // }
   }

}