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

   /** @internal Pass2DProps 共享块：JS 写、C++(RTRender2DPass/LayaXRender2DPass) 读，零跨界。
    * 槽 0-3(i32)=enable/isSupport/repaint/doClearColor；槽 4-9(f32)=offsetMatrix(a,b,c,d,tx,ty)；槽 10-13(f32)=clearColor(r,g,b,a) */
   private _propsBuf = new ArrayBuffer(14 * 4);
   private _propsI32 = new Int32Array(this._propsBuf);
   private _propsF32 = new Float32Array(this._propsBuf);

   public get enable(): boolean {
      return this._propsI32[0] !== 0;
   }

   public set enable(value: boolean) {
      this._propsI32[0] = value ? 1 : 0;
   }

   private _enableBatch: boolean = false;
   public get enableBatch(): boolean {
      return this._enableBatch;
   }

   public set enableBatch(value: boolean) {
      this._enableBatch = value;
      this._nativeObj.enableBatch = value;
   }

   public get isSupport(): boolean {
      return this._propsI32[1] !== 0;
   }

   public set isSupport(value: boolean) {
      this._propsI32[1] = value ? 1 : 0;
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
      this._propsI32[3] = value ? 1 : 0;
   }
   public get doClearColor(): boolean {
      return this._propsI32[3] !== 0;
   }
   postProcess: PostProcess2D = null;
   private _enablePostProcess: boolean = false;
   private _postProcessShaderDataRef: GLESShaderData = null;

   private _mask: RTRenderStruct2D;
   public set mask(value: RTRenderStruct2D) {
      this._mask = value;
      this._nativeObj.setMask(value ? value._nativeObj : null);
   }
   public get mask(): RTRenderStruct2D {
      return this._mask;
   }

   public get repaint(): boolean {
      return this._propsI32[2] !== 0;
   }

   public set repaint(value: boolean) {
      this._propsI32[2] = value ? 1 : 0;
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
      this._propsF32[4] = value.a;
      this._propsF32[5] = value.b;
      this._propsF32[6] = value.c;
      this._propsF32[7] = value.d;
      this._propsF32[8] = value.tx;
      this._propsF32[9] = value.ty;
   }
   get offsetMatrix(): Matrix {
      return this._renderOffset;
   }

   needRender(): boolean {
      return (this._propsI32[0] !== 0 && this._propsI32[1] === 0 && (this._propsI32[2] !== 0 || !this._renderTexture));
   }


   setClearColor(r: number, g: number, b: number, a: number): void {
      this._propsF32[10] = r;
      this._propsF32[11] = g;
      this._propsF32[12] = b;
      this._propsF32[13] = a;
   }

   constructor(skipNative?: boolean) {
      this._shaderData = LayaGL.renderDeviceFactory.createShaderData(null) as GLESShaderData;
      if (!skipNative) {
         this._nativeObj = new (window as any).conchRTRender2DPass(this._shaderData._nativeObj);
         this._nativeObj.bindPass2DBuffer(this._propsBuf);
         this.enable = true;
         this.enableBatch = true;
         this.isSupport = false;
         this.doClearColor = true;
         this.repaint = true;
         this.priority = 0;
         this.offsetMatrix = new Matrix();
      }
   }

   /**
    * pass 2D 渲染
    * @param context 
    */
   fowardRender(context: GLESRenderContext2D, renderTime: number) {
      let rt = this.renderTexture;
      if (rt) {
         context.invertY = rt._invertY;
      }
      this._nativeObj.fowardRender(context._nativeObj, renderTime);
   }

   updatePostProcess(): void {
      let pp = this.postProcess;
      if (pp?._checkEnabled()) {
         let command = pp._context.command;
         // 把 CommandBuffer2D 的 shaderData 同步给 native：
         // native fowardRender 在跑 _postProcessCMDs 前会缓存 context.passData，
         // 把它克隆到这块 shaderData 后切换 passData，再在结束时还原。
         // 等价于 TS CommandBuffer2D.apply() 的 passData 切换逻辑。
         this._postProcessShaderDataRef = command.shaderData as GLESShaderData;
         this._nativeObj.setPostProcessShaderData(this._postProcessShaderDataRef._nativeObj);
         this._nativeObj.setPostProcess(
            this._getRenderCMDArray(command._renderCMDs)
         );
         this._nativeObj.setEnablePostProcess(true);
         this._enablePostProcess = true;
      } else if (this._enablePostProcess) {
         this._nativeObj.setEnablePostProcess(false);
         this._nativeObj.setPostProcessShaderData(null);
         this._postProcessShaderDataRef = null;
         this._enablePostProcess = false;
      }
   }


   private _getRenderCMDArray(cmds: any[]): any[] {
      let nativeobCMDs: any[] = [];
      cmds.forEach(element => {
         nativeobCMDs.push((element as any)._nativeObj);
      });
      return nativeobCMDs;
   }

   destroy(): void {
      //lvtodo
      this._nativeObj.destroy();
      this.root = null;
      this.renderTexture = null;
      this.postProcess = null;
      this._postProcessShaderDataRef = null;
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

   apply(context: GLESRenderContext2D, renderTime: number): void {
      this._nativeObj.apply(context._nativeObj, renderTime);
   }

   clear(): void {
      this._nativeObj.clear();
   }

   addPass(pass: RTRender2DPass): void {
      this._nativeObj.addPass(pass._nativeObj);
   }
}
