import { Color } from "../../../../maths/Color";
import { Vector4 } from "../../../../maths/Vector4";
import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { RenderTexture2D } from "../../../../resource/RenderTexture2D";
import { FastSinglelist } from "../../../../utils/SingletonList";
import { RenderState2D } from "../../../../webgl/utils/RenderState2D";
import { WebRenderStruct2D } from "./WebRenderStruct2D";
import { IRender2DPass, IRender2DPassManager } from "../../Design/2D/IRender2DPass";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { LayaGL } from "../../../../layagl/LayaGL";
import { Vector2 } from "../../../../maths/Vector2";
import { ShaderDefines2D } from "../../../../webgl/shader/d2/ShaderDefines2D";
import { Matrix } from "../../../../maths/Matrix";
import { Vector3 } from "../../../../maths/Vector3";
import { CommandBuffer2D } from "../../../../display/Scene2DSpecial/RenderCMD2D/CommandBuffer2D";
import { PostProcess2D } from "../../../../display/PostProcess2D";
import { WebGraphicsBatch } from "./WebGraphicsBatch";
import { BaseRender2DType } from "../../../../display/SpriteConst";
import { IPool, Pool } from "../../../../utils/Pool";
import { Web2DGraphicWholeBuffer } from "./Web2DGraphic2DBuffer";

export interface IBatch2DContext {
   reset(): void;
   destroy(): void;
}
export interface IBatch2DRender {

   createBatchContext(): IBatch2DContext;
   /**合批范围，合批的RenderElement2D直接add进list中 */
   batchRenderElement(list: FastSinglelist<IRenderElement2D>, start: number, length: number, context: IBatch2DContext): void;

   prepare(strcut: WebRenderStruct2D, context: IBatch2DContext, offset: number): void;
}


class Batch2DInfo {
   batchFun: IBatch2DRender = null;
   batchContext: IBatch2DContext = null;
   batch: boolean = false;
   indexStart: number = -1;
   elementLength: number = 0;
   elementCount: number = 0;

   static readonly _pool: IPool<Batch2DInfo> = Pool.createPool(Batch2DInfo);
}

/**
 * 合批管理
 * TODO 需要挪出去
 */
export class BatchManager {
   /**
    * @internal
    * 根据不同的RenderNode注册合批方式，来优化性能
    */
   static _batchMapManager: { [key: number]: IBatch2DRender } = {};

   /**
    * 注册渲染节点之间的合批
    * @param renderElementType 
    * @param batch 
    */
   static registerBatch(renderElementType: number, batch: IBatch2DRender): void {
      if (BatchManager._batchMapManager[renderElementType])
         throw new Error("Overlapping batch optimization");
      else
         BatchManager._batchMapManager[renderElementType] = batch;
   }
}

const _TEMP_InvertMatrix = new Matrix();
export class WebRender2DPass implements IRender2DPass {
   static buffers: Set<Web2DGraphicWholeBuffer> = new Set();
   /** @internal */
   _list: PassRenderList = new PassRenderList();
   /** @internal */
   _priority: number = 0;

   public get priority(): number {
      return this._priority;
   }

   public set priority(value: number) {
      this._priority = value;
      if (this._mask && this._mask.pass) {
         this._mask.pass._priority = value + 1;
      }
   }

   enable: boolean = true;

   isSupport: boolean = false;

   renderTexture: RenderTexture2D;

   postProcess: PostProcess2D = null;

   repaint: boolean = true;

   _clearColor = new Color;

   doClearColor: boolean = true;

   finalize: CommandBuffer2D = null;

   private _mask: WebRenderStruct2D;

   public get mask(): WebRenderStruct2D {
      return this._mask;
   }

   public set mask(value: WebRenderStruct2D) {
      this._mask = value;
      if (value && value.pass) {
         value.pass.priority = this.priority + 1;
      }
   }

   private _enableBatch: boolean = true;
   /** 需要挪出去? */
   public get enableBatch(): boolean {
      return this._enableBatch;
   }

   public set enableBatch(value: boolean) {
      this.repaint = true;
      this._enableBatch = value;
   }

   setClearColor(r: number, g: number, b: number, a: number): void {
      this._clearColor.setValue(r, g, b, a);
   }

   private _rtsize: Vector2 = new Vector2;

   root: WebRenderStruct2D = null;
   /**
    * rt渲染偏移
    **/
   offsetMatrix: Matrix = new Matrix();

   private _invertMat_0: Vector3 = new Vector3(1, 1);
   private _invertMat_1: Vector3 = new Vector3(0, 0);

   shaderData: ShaderData = null;

   destroyed: boolean = false;

   constructor() {
      this.shaderData = LayaGL.renderDeviceFactory.createShaderData(null);
   }

   /**
     * 判断是否需要更新渲染
     * @returns 是否需要更新
     */
   needRender(): boolean {
      return this.enable
         && !this.isSupport
         && (this.repaint || !this.renderTexture);
   }

   /**
    * add Render Node
    * @param object 
    */
   addStruct(object: WebRenderStruct2D): void {
      this._list.add(object, this._enableBatch);
   }

   /**
    * remove Render Node
    * @param object 
    */
   removeStruct(object: WebRenderStruct2D): void {
      this._list.remove(object);
   }

   cullAndSort(context2D: IRenderContext2D, struct: WebRenderStruct2D): void {
      if (!struct || !struct.enabled) return;

      struct._handleInterData();
      //这里进入process2D的排序  并不帧判断
      // if (struct.renderUpdateMask !== Stat.loopCount) {
      //    struct.renderUpdateMask = Stat.loopCount;
      // 裁剪规则一：检查渲染层掩码
      if (struct._parentGlobalRenderData
         && (struct.renderLayer & struct._parentGlobalRenderData.renderLayerMask) === 0) {
         return;
      }

      // // 裁剪规则二：检查矩形相交
      // const nodeRect = renderNode.rect;
      // if (!this._isRectIntersect(nodeRect, this._cullRect)) {
      //     return;
      // }

      struct.renderUpdate(context2D);

      this.addStruct(struct);

      //需要处理全局透明的问题，统计并且生成新的 process。
      for (let i = 0; i < struct.children.length; i++) {
         const child = struct.children[i];
         this.cullAndSort(context2D, child);
      }
   }

   /**
     * 帧更新
     */
   updateRenderQueue(context: IRenderContext2D): void {
      let root = this.root;
      if (!root) {
         return;
      }

      this.cullAndSort(context, root);
   }

   /**
    * pass 2D 渲染
    * @param context 
    */
   fowardRender(context: IRenderContext2D) {
      this._initRenderProcess(context);
      this.render(context);
   }

   /**
    * 渲染
    * @param context 
    */
   render(context: IRenderContext2D): void {
      // 清理zOrder相关队列
      // if (true) {//如果需要重画或者直接渲染离屏，走下面流程
      if (this.repaint) {

         this._list.reset();

         this.updateRenderQueue(context);
         // 更新渲染元素
         this._list.updateRenderElements(this._enableBatch);
         WebRender2DPass.uploadBuffer();

         this._enableBatch && this._list.batch();
         context.drawRenderElementList(this._list.renderElements);


         if (this._mask) {
            this._mask._handleInterData();
            this._mask.renderUpdate(context);
            context.drawRenderElementOne(this._mask.renderElements[0]);
         }

         // 处理后期处理
         if (this.postProcess && this.postProcess.enabled) {
            this.postProcess._context.command.apply(true);
         }
      } else {

         this._list.structs.forEach(list => {
            list.elements.forEach(struct => {
               struct && struct.renderUpdate(context);
            });
         });

         WebRender2DPass.uploadBuffer();

         context.drawRenderElementList(this._list.renderElements);
      }

      this.repaint = false;
   }

   //预留
   private _initRenderProcess(context: IRenderContext2D) {
      //设置viewport 切换rt
      let sizeX, sizeY;

      let rt = this.renderTexture;
      if (rt) {
         context.invertY = rt._invertY;
         context.setRenderTarget(rt._renderTarget, this.doClearColor, this._clearColor);
         sizeX = rt.width;
         sizeY = rt.height;
         this._updateInvertMatrix();
         this.shaderData.addDefine(ShaderDefines2D.RENDERTEXTURE);//??

      } else {
         context.invertY = false;
         sizeX = RenderState2D.width;
         sizeY = RenderState2D.height;
         context.setOffscreenView(sizeX, sizeY);

         context.setRenderTarget(null, this.doClearColor, this._clearColor);

         this._setInvertMatrix(1, 0, 0, 1, 0, 0);
         this.shaderData.removeDefine(ShaderDefines2D.RENDERTEXTURE);
      }

      context.passData = this.shaderData;
      this._setRenderSize(sizeX, sizeY);
   }

   static setBuffer(buffer: Web2DGraphicWholeBuffer): void {
      if (buffer._inPass) return;
      buffer._inPass = true;
      this.buffers.add(buffer);
   }

   static uploadBuffer(): void {
      if (WebRender2DPass.buffers.size > 0) {
         WebRender2DPass.buffers.forEach(buffer => {
            buffer._upload();
            buffer._inPass = false;
         });
         WebRender2DPass.buffers.clear();
      }
   }

   private _updateInvertMatrix() {
      let rootTrans = this.root.trans;
      if (!rootTrans) return this._setInvertMatrix(1, 0, 0, 1, 0, 0);
      let temp = _TEMP_InvertMatrix;
      let mask = this.mask;
      let offset = this.offsetMatrix;
      if (mask && mask.trans) {
         let maskMatrix = mask.trans.matrix;
         maskMatrix.copyTo(temp);
      } else {
         rootTrans.matrix.copyTo(temp);
      }

      Matrix.mul(offset, temp, temp);
      temp.invert();
      this._setInvertMatrix(temp.a, temp.b, temp.c, temp.d, temp.tx, temp.ty);
   }


   private _setInvertMatrix(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) {
      if (
         a === this._invertMat_0.x
         && b === this._invertMat_1.x
         && c === this._invertMat_0.y
         && d === this._invertMat_1.y
         && tx === this._invertMat_0.z
         && ty === this._invertMat_1.z
      )
         return;

      this._invertMat_0.setValue(a, c, tx);
      this._invertMat_1.setValue(b, d, ty);

      this.shaderData.setVector3(ShaderDefines2D.UNIFORM_INVERTMAT_0, this._invertMat_0);
      this.shaderData.setVector3(ShaderDefines2D.UNIFORM_INVERTMAT_1, this._invertMat_1);
   }

   /**
     * @internal
     */
   private _setRenderSize(x: number, y: number) {
      if (x === this._rtsize.x && y === this._rtsize.y)
         return;
      this._rtsize.setValue(x, y);
      this.shaderData.setVector2(ShaderDefines2D.UNIFORM_SIZE, this._rtsize);
   }

   destroy(): void {
      if (this.destroyed) {
         return;
      }
      this.destroyed = true;
      this._list.destroy();
      this._list = null;
      this.root = null;
      this.renderTexture = null;
      this.postProcess = null;
      this.shaderData.destroy();
      this.shaderData = null;
   }
}

class PassRenderList {

   _batchInfoList = new FastSinglelist<Batch2DInfo>;

   private _currentType: number = -1;
   // private _currentElementCount: number = 0;
   private _currentBatch: Batch2DInfo = null;

   structs: FastSinglelist<WebRenderStruct2D>[] = [];
   renderElements: FastSinglelist<IRenderElement2D> = null;
   renderListType: number = -1;
   zOrder: number = 0;
   //预想给list更新使用
   _dirtyFlag: number = 0;

   private _batchContexts: IBatch2DContext[] = [];

   constructor() {
      this.renderElements = new FastSinglelist<IRenderElement2D>();
   }

   add(struct: WebRenderStruct2D, isBatch: boolean = true): void {
      let zOrder = struct.zIndex;
      if (!this.structs[zOrder]) {
         this.structs[zOrder] = new FastSinglelist<WebRenderStruct2D>();
      }
      this.structs[zOrder].add(struct);

   }

   updateRenderElements(enableBatch: boolean): void {
      this.structs.forEach(structArray => {
         structArray.elements.forEach(struct => this._updateRenderElements(struct, enableBatch));
      });
   }

   /**
    * @internal
    * 更新渲染元素
    * @param struct 
    * @param enableBatch 
    */
   _updateRenderElements(struct: WebRenderStruct2D, enableBatch: boolean): void {
      let n = struct.renderElements ? struct.renderElements.length : 0;
      if (n == 0) return;
      if (n == 1) {
         if (enableBatch) {
            this._batchStart(struct.renderType, 1);
            this.renderElements.add(struct.renderElements[0]);
         } else {
            this.renderElements.add(struct.renderElements[0]);
         }
      } else {
         if (enableBatch) {
            this._batchStart(struct.renderType, n);
            for (var i = 0; i < n; i++) {
               this.renderElements.add(struct.renderElements[i]);
            }
         } else {
            for (var i = 0; i < n; i++) {
               this.renderElements.add(struct.renderElements[i]);
            }
         }
      }

      if (enableBatch && this._currentBatch.batchFun) {
         let offset = this._currentBatch.indexStart + this._currentBatch.elementLength - n;
         this._currentBatch.batchFun.prepare(struct, this._currentBatch.batchContext, offset);
      }
   }

   /**
    * 开启一个Batch
    */
   private _batchStart(type: number, elementLength: number) {
      if (this._currentBatch && this._currentType == type) {
         this._currentBatch.batch = !!(this._currentBatch.batchFun);
         this._currentBatch.elementLength += elementLength;
         return;
      }

      if (this._currentBatch) {
         this._batchInfoList.add(this._currentBatch);
      }
      this._currentBatch = Batch2DInfo._pool.take();
      this._currentBatch.batch = false;
      this._currentBatch.batchFun = BatchManager._batchMapManager[type];
      if (this._currentBatch.batchFun) {
         let context = this._batchContexts[type];
         if (!context) {
            context = this._currentBatch.batchFun.createBatchContext();
            this._batchContexts[type] = context;
         }
         this._currentBatch.batchContext = context;
      }
      this._currentBatch.indexStart = this.renderElements.length;
      this._currentBatch.elementLength = elementLength;
      this._currentType = type;
   }

   /**
    * 合批总循环
    */
   batch() {
      if (this._currentBatch) {
         this._batchInfoList.add(this._currentBatch);
      }

      this.renderElements.length = 0;

      for (var i = 0, n = this._batchInfoList.length; i < n; i++) {
         let info = this._batchInfoList.elements[i];
         if (info.batch) {
            info.batchFun.batchRenderElement(this.renderElements, info.indexStart, info.elementLength, info.batchContext);
         } else {
            for (let j = info.indexStart, m = info.elementLength + info.indexStart; j < m; j++)
               this.renderElements.add(this.renderElements.elements[j]);
         }
      }
   }


   remove(struct: WebRenderStruct2D): void {
      let zOrder = struct.zIndex;
      if (this.structs[zOrder]) {
         this.structs[zOrder].remove(struct);
      }
   }

   destroy(): void {
      this.structs.length = 0;
      this.clearRenderElements();
      for (let i = 0, n = this._batchContexts.length; i < n; i++) {
         this._batchContexts[i] && this._batchContexts[i].destroy();
      }
      this._batchContexts.length = 0;
   }

   clearRenderElements(): void {
      this.renderElements.clear();
      this._batchInfoList.clear();
   }

   reset(): void {

      this.structs.forEach(list => {
         list.length = 0;
      });

      this.renderElements.length = 0;
      for (let i = 0, n = this._batchContexts.length; i < n; i++) {
         this._batchContexts[i] && this._batchContexts[i].reset();
      }
      this._batchInfoList.length = 0;
      this._currentBatch = null;
      this._currentType = -1;
   }
}

export class WebRender2DPassManager implements IRender2DPassManager {
   private _modify: boolean = false;

   private _passes: WebRender2DPass[] = [];

   removePass(pass: WebRender2DPass): void {
      let index = this._passes.indexOf(pass);
      if (index === -1) {
         return;
      }
      this._passes.splice(index, 1);
      this._modify = true;
   }

   apply(context: IRenderContext2D): void {
      if (this._modify) {
         this._modify = false;
         this._sortPassesByPriority();
      }

      for (const pass of this._passes) {
         if (pass.needRender()) {
            pass.fowardRender(context);
         }
      }
   }

   clear(): void {
      this._passes.length = 0;
   }

   addPass(pass: WebRender2DPass): void {
      if (this._passes.indexOf(pass) !== -1) {
         return;
      }

      this._passes.push(pass);
      this._modify = true;
   }

   /**
    * 按照 priority 对 Pass 进行排序
    */
   private _sortPassesByPriority(): void {
      this._passes.sort((a, b) => b._priority - a._priority); // 按 priority 从大到小排序
   }
}


WebGraphicsBatch.instance = new WebGraphicsBatch;
BatchManager.registerBatch(BaseRender2DType.graphics, WebGraphicsBatch.instance)