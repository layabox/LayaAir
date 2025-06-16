import { Color } from "../../../../maths/Color";
import { RenderTexture2D } from "../../../../resource/RenderTexture2D";
import { IRender2DPass, IRender2DPassManager } from "../../Design/2D/IRender2DPass";
import { LayaGL } from "../../../../layagl/LayaGL";
import { Vector2 } from "../../../../maths/Vector2";
import { PostProcess2D } from "../../../../display/PostProcess2D";
import { RTRenderStruct2D } from "./RTRenderStruct2D";
import { GLESInternalRT } from "../../../OpenGLESDriver/RenderDevice/GLESInternalRT";
import { GLESShaderData } from "../../../OpenGLESDriver/RenderDevice/GLESShaderData";
import { GLESRenderContext2D } from "../../../OpenGLESDriver/2DRenderPass/GLESRenderContext2D";


export class RTRender2DPass implements IRender2DPass {
   _nativeObj: any;
   public get enable(): boolean {
      return this._nativeObj.enable;
   }

   public set enable(value: boolean) {
      this._nativeObj.enable = value;
   }
   public get enableBatch(): boolean {
      return this._nativeObj.enableBatch;
   }

   public set enableBatch(value: boolean) {
      this._nativeObj.enableBatch = value;
   }
   public get isSupport(): boolean {
      return this._nativeObj.isSupport;
   }

   public set isSupport(value: boolean) {
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
   public set doClearColor(value: boolean) {
      this._nativeObj.doClearColor = value;
   }
   public get doClearColor(): boolean {
      return this._nativeObj.doClearColor;
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
   public get repaint(): boolean {
      return this._nativeObj.repaint;
   }

   public set repaint(value: boolean) {
      this._nativeObj.repaint = value;
   }
   private _renderTexture: RenderTexture2D;
   public get renderTexture(): RenderTexture2D {
      return this._renderTexture;
   }
   public set renderTexture(value: RenderTexture2D) {
      this._renderTexture = value;
      this._nativeObj.setRenderTexture(value ? (value._renderTarget as GLESInternalRT)._nativeObj : null);
   }
   public get priority(): number {
      return this._nativeObj.priority;
   }
   public set priority(value: number) {
      this._nativeObj.priority = value;
   }
   set shaderData(value: GLESShaderData) {
      this._nativeObj.shaderData = value;
   }
   get shaderData(): GLESShaderData {
      return this._nativeObj.shaderData;
   }  

   private _renderOffset: Vector2 = new Vector2();
   set renderOffset(value: Vector2) {
		this._nativeObj.renderOffset = value;
	}
	get renderOffset(): Vector2 {
		let offset = this._nativeObj.renderOffset;
		this._renderOffset.x = offset.x;
		this._renderOffset.y = offset.y;
		return this._renderOffset;
	}
   needRender(): boolean {
      return this._nativeObj.needRender();
   }
   setClearColor(r: number, g: number, b: number, a: number): void {
      this._nativeObj.setClearColor(r, g, b, a);
   }

   constructor() {
      this._nativeObj = new (window as any).conchRTRender2DPass();
      this._nativeObj.setRenderCallback(this.renderCallBack.bind(this));
      this.shaderData = LayaGL.renderDeviceFactory.createShaderData(null) as GLESShaderData;
   }

   /**
    * add Render Node
    * @param object 
    */
   addStruct(object: RTRenderStruct2D): void {
      this._nativeObj.addStruct(object._nativeObj);
   }

   /**
    * remove Render Node
    * @param object 
    */
   removeStruct(object: RTRenderStruct2D): void {
      this._nativeObj.removeStruct(object._nativeObj);
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

   /**
    * 渲染
    * @param context 
    */
   render(context: GLESRenderContext2D): void {
      this._nativeObj.render(context._nativeObj);
   }
   private renderCallBack(context: GLESRenderContext2D): void {
      // 处理后期处理
      if (this.postProcess && this.postProcess.enabled) {
         this.postProcess._context.command.apply(true);
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
