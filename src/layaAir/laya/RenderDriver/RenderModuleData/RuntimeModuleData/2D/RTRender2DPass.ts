import { RenderTexture2D } from "../../../../resource/RenderTexture2D";
import { IRender2DPass, IRender2DPassManager } from "../../Design/2D/IRender2DPass";
import { LayaGL } from "../../../../layagl/LayaGL";
import { PostProcess2D } from "../../../../display/PostProcess2D";
import { RTRenderStruct2D } from "./RTRenderStruct2D";
import { GLESInternalRT } from "../../../OpenGLESDriver/RenderDevice/GLESInternalRT";
import { GLESShaderData } from "../../../OpenGLESDriver/RenderDevice/GLESShaderData";
import { GLESRenderContext2D } from "../../../OpenGLESDriver/2DRenderPass/GLESRenderContext2D";
import { Matrix } from "../../../../maths/Matrix";

export class RTRender2DPass implements IRender2DPass {
   _nativeObj: any;
   private _enable: boolean = false;
   public get enable(): boolean {
      return this._enable;
   }

   public set enable(value: boolean) {
      this._enable = value;
      this._nativeObj.enable = value;
   }

   private _enableBatch: boolean = false;
   public get enableBatch(): boolean {
      return this._enableBatch;
   }

   public set enableBatch(value: boolean) {
      this._enableBatch = value;
      this._nativeObj.enableBatch = value;
   }

   private _isSupport = false;
   public get isSupport(): boolean {
      return this._isSupport;
   }

   public set isSupport(value: boolean) {
      this._isSupport = value;
      this._nativeObj.isSupport = value;
   }
   private _root: RTRenderStruct2D = null;
   public get root(): RTRenderStruct2D {
      return this._root;
   }

   public set root(value: RTRenderStruct2D) {
      this._root = value;
      this._nativeObj.setRoot(value ? value._nativeObj : null);
   }

   private _doClearColor: boolean;
   public set doClearColor(value: boolean) {
      this._doClearColor = value;
      this._nativeObj.doClearColor = value;
   }
   public get doClearColor(): boolean {
      return this._doClearColor;
   }
   postProcess: PostProcess2D = null;

   private _mask: RTRenderStruct2D;
   public set mask(value: RTRenderStruct2D) {
      this._mask = value;
      this._nativeObj.setMask(value ? value._nativeObj : null);
   }
   public get mask(): RTRenderStruct2D {
      return this._mask;
   }

   private _repaint: boolean;
   public get repaint(): boolean {
      return this._repaint;
   }

   public set repaint(value: boolean) {
      this._repaint = value;
      this._nativeObj.repaint = value;
   }

   private _renderTexture: RenderTexture2D;
   public get renderTexture(): RenderTexture2D {
      return this._renderTexture;
   }
   public set renderTexture(value: RenderTexture2D) {
      this._renderTexture = value;
      if (value) {
         this._nativeObj.setRenderTexture((value._renderTarget as GLESInternalRT)._nativeObj, value.width, value.height, value._invertY);
      }
      else {
         this._nativeObj.setRenderTexture(null, 0, 0, false);
      }
   }

   private _priority: number;
   public get priority(): number {
      return this._priority;
   }
   public set priority(value: number) {
      this._priority = value;
      this._nativeObj.priority = value;
   }

   private _shaderData: GLESShaderData = null;
   set shaderData(value: GLESShaderData) {
      this._shaderData = value;
   }
   get shaderData(): GLESShaderData {
      return this._shaderData;
   }

   private _renderOffset: Matrix = new Matrix();
   set offsetMatrix(value: Matrix) {
      this._renderOffset = value;
      this._nativeObj.offsetMatrix = value;
   }
   get offsetMatrix(): Matrix {
      return this._renderOffset;
   }

   needRender(): boolean {
      return (this._enable && !this._isSupport && (this._repaint || !this._renderTexture));
   }


   setClearColor(r: number, g: number, b: number, a: number): void {
      this._nativeObj.setClearColor(r, g, b, a);
   }

   constructor() {
      this._shaderData = LayaGL.renderDeviceFactory.createShaderData(null) as GLESShaderData;
      this._nativeObj = new (window as any).conchRTRender2DPass(this._shaderData._nativeObj);
      this._nativeObj.setRenderCallback(this.renderCallBack.bind(this));
      this.enable = true;
      this.enableBatch = true;
      this.isSupport = false;
      this.doClearColor = true;
      this.repaint = true;
      this.priority = 0;
      this.offsetMatrix = new Matrix();
   }

   /**
    * pass 2D 渲染
    * @param context 
    */
   fowardRender(context: GLESRenderContext2D) {
      let rt = this.renderTexture;
      if (rt) {
         context.invertY = rt._invertY;
      }
      this._nativeObj.fowardRender(context._nativeObj);
   }

   // /**
   //  * 渲染
   //  * @param context 
   //  */
   // render(context: GLESRenderContext2D): void {
   //    this._nativeObj.render(context._nativeObj);
   // }
   private renderCallBack(context: GLESRenderContext2D): void {
      // 处理后期处理
      if (this.postProcess && this.postProcess.enabled) {
         this.postProcess._context.apply();
      }
   }
   destroy(): void {
      //lvtodo
      this._nativeObj.destroy();
      this.root = null;
      this.renderTexture = null;
      this.postProcess = null;
      this.shaderData = null;
   }
}


export class RTRender2DPassManager implements IRender2DPassManager {
   _nativeObj: any;
   constructor() {
      this._nativeObj = new (window as any).conchRTRender2DPassManager();
   }

   removePass(pass: RTRender2DPass): void {
      this._nativeObj.removePass(pass._nativeObj);
   }

   apply(context: GLESRenderContext2D): void {
      this._nativeObj.apply(context._nativeObj);
   }

   clear(): void {
      this._nativeObj.clear();
   }

   addPass(pass: RTRender2DPass): void {
      this._nativeObj.addPass(pass._nativeObj);
   }
}
