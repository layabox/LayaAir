import { Graphics } from "../../../../display/Graphics";
import { BaseRenderNode2D } from "../../../../NodeRender2D/BaseRenderNode2D";
import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { IRenderStruct2D } from "../../Design/2D/IRenderStruct2D";
import { Rectangle } from "../../../../maths/Rectangle";
import { SpriteGlobalTransform } from "../../../../display/SpriteGlobaTransform";
import { WebRender2DPass } from "./WebRender2DPass";

export class WebRenderStruct2D implements IRenderStruct2D{

   zOrder: number;
   
   rect: Rectangle = new Rectangle(0, 0, 0, 0);
   /** 待定 */
   transform: SpriteGlobalTransform = null;

   _renderType: number = -1;

   _renderElements: IRenderElement2D[] = [];
   
   alpha: number; 

   parent: WebRenderStruct2D | null;
   
   children: WebRenderStruct2D[] = [];

   pass: WebRender2DPass;

   renderLayer: number = 0;
   /** @internal */ 
   _renderUpdateMask: number = 0;

   constructor() {
      this.alpha = 1.0;
   }

   private _rnUpdateCall: any = null;
   private _rnUpdateFun: any = null;
   private _rnPreUpdateFun: any = null;
   private _rnGetElementsFun: any = null;

   private _gUpdateCall: any = null;
   private _gUpdateFun: any = null;
   private _gGetElementsFun: any = null;

   private _getBoundsCall: any = null;
   private _getBoundsFun: any = null;

   set_renderNodeUpdateCall(call:any , renderUpdateFun : any , preRenderUpdateFun : any , getRenderElements:any): void {
      this._rnUpdateCall = call;
      this._rnUpdateFun = renderUpdateFun;
      this._rnPreUpdateFun = preRenderUpdateFun;
      this._rnGetElementsFun = getRenderElements;
   }

   set_grapicsUpdateCall(call:any , renderUpdateFun : any ,  getRenderElements:any): void {
      this._gUpdateCall = call;
      this._gUpdateFun = renderUpdateFun;
      this._gGetElementsFun = getRenderElements;
   }

   set_getBoundsCall(call:any, getBoundsFun:any):void{
      this._getBoundsCall = call;
      this._getBoundsFun = getBoundsFun;
   }

   addChild(child: WebRenderStruct2D): WebRenderStruct2D {
      child.parent = this;
      this.children.push(child);
      
      if (child.pass) {
         if (child.pass !== this.pass) {
            child.pass.priority = this.pass.priority + 1;
         }
      }else{
         child.pass = this.pass;
      }
      return child;
   }

   removeChild(child: WebRenderStruct2D): void {
      const index = this.children.indexOf(child);
      if (index !== -1) {
         child.parent = null;
         this.children.splice(index, 1);
      }
   }

   renderUpdate(context:IRenderContext2D): void {
      if (this._rnUpdateFun) {
         this._rnUpdateFun.call(this._rnUpdateCall, context);
      }

      if (this._gUpdateFun) {
         this._gUpdateFun.call(this._gUpdateCall, context);
      }
      // if (
      //    this.owner._renderNode
      //    && this.owner._renderNode.renderUpdate
      // ) {
      //    this.owner._renderNode.renderUpdate(context);
      // }

      // process->
   }

   preRenderUpdate(context:IRenderContext2D): void {
      
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