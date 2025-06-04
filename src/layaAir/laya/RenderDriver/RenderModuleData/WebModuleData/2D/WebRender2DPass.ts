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
import { Web2DGraphicWholeBuffer } from "./Web2DGraphic2DBufferDataView";
import { WebGraphicsBatch } from "./WebGraphicsBatch";
import { BaseRender2DType } from "../../../../display/SpriteConst";
import { IBufferState } from "../../../DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../../../DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../../DriverDesign/RenderDevice/IVertexBuffer";
import { BufferUsage } from "../../../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../../../RenderEngine/RenderEnum/IndexFormat";
import { BufferModifyType } from "../../Design/2D/IRender2DDataHandle";
import { IRenderGeometryElement } from "../../../DriverDesign/RenderDevice/IRenderGeometryElement";

export interface IBatch2DRender {
   /**合批范围，合批的RenderElement2D直接add进list中 */
   batchRenderElement(list: FastSinglelist<IRenderElement2D>, start: number, length: number, recoverList: FastSinglelist<IRenderElement2D> , buffer : BatchBuffer): void;

   recover(list: FastSinglelist<IRenderElement2D>): void;

   batchIndexBuffer(strcut: WebRenderStruct2D, buffer: BatchBuffer, offset: number): void;
}

export class Batch2DInfo {
   batchFun: IBatch2DRender = null;
   batch: boolean = false;
   indexStart: number = -1;
   elementLength: number = 0;
   elementCount: number = 0;

   constructor() {
   }

   static _pool: Batch2DInfo[] = [];
   static create(): Batch2DInfo {
      if (this._pool.length != 0) {
         return this._pool.pop();
      } else
         return new Batch2DInfo();
   }

   static recover(info: Batch2DInfo) {
      this._pool.push(info);
   }
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
    * @param firstRenderElementType 
    * @param lastRenderElementType 
    * @param batch 
    */
   static regisBatch(renderElementType: number, batch: IBatch2DRender): void {
      if (BatchManager._batchMapManager[renderElementType])
         throw "Overlapping batch optimization";
      else
         BatchManager._batchMapManager[renderElementType] = batch;
   }
}

const _TEMP_InvertMatrix = new Matrix();
export class WebRender2DPass implements IRender2DPass {
   static buffers: Set<Web2DGraphicWholeBuffer> = new Set();
   /** @internal */
   _lists: PassRenderList[] = [];

   priority: number = 0;

   enable: boolean = true;

   isSupport: boolean = false;

   renderTexture: RenderTexture2D;

   postProcess: PostProcess2D = null;

   repaint: boolean = true;

   _clearColor = new Color;

   doClearColor: boolean = true;

   finalize: CommandBuffer2D = null;

   mask: WebRenderStruct2D;

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
   renderOffset: Vector2 = new Vector2();

   private _invertMat_0: Vector3 = new Vector3(1, 1);
   private _invertMat_1: Vector3 = new Vector3(0, 0);

   shaderData: ShaderData = null;

   constructor() {
      this.shaderData = LayaGL.renderDeviceFactory.createShaderData(null);
   }


   /**
     * 判断是否需要更新渲染
     * @returns 是否需要更新
     */
   needRender(): boolean {
      // return true;
      return this.enable
         && !this.isSupport
         && (this.repaint || !this.renderTexture);
   }

   /**
    * add Render Node
    * @param object 
    */
   addStruct(object: WebRenderStruct2D): void {
      let zOrder = object.zIndex;
      if (!this._lists[zOrder]) {
         this._lists[zOrder] = new PassRenderList;
         this._lists[zOrder].zOrder = zOrder;
      }
      this._lists[zOrder].add(object);
   }

   /**
    * remove Render Node
    * @param object 
    */
   removeStruct(object: WebRenderStruct2D): void {
      let zOrder = object.zIndex;
      this._lists[zOrder].remove(object);
   }

   cullAndSort(context2D: IRenderContext2D, struct: WebRenderStruct2D): void {
      if (!struct.enable) return;

      struct._handleInterData();
      //这里进入process2D的排序  并不帧判断
      // if (struct.renderUpdateMask !== Stat.loopCount) {
      //    struct.renderUpdateMask = Stat.loopCount;
      // 裁剪规则一：检查渲染层掩码
      if (struct.globalRenderData
         && (struct.renderLayer & struct.globalRenderData.renderLayerMask) === 0) {
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
      let lists = this._lists;
      // 清理zOrder相关队列
      // if (this.repaint) {//如果需要重画或者直接渲染离屏，走下面流程
      for (let i = 0, len = lists.length; i < len; i++)
         lists[i]?.reset();

      this.updateRenderQueue(context);

      WebRender2DPass.uploadBuffer();

      for (let i = 0, len = lists.length; i < len; i++) {
         let list = lists[i];
         if (!list || !list.renderElements.length) continue;
         this.enableBatch && list.batch();
         context.drawRenderElementList(list.renderElements);
      }

      this.repaint = false;

      if (this.mask && this.mask.pass.enable) {
         this.mask.pass.renderTexture = this.renderTexture;
         this.mask.pass.fowardRender(context);
         this.mask.pass.renderTexture = null;
      }


      // 处理后期处理
      if (this.postProcess && this.postProcess.enabled) {
         this.postProcess._context.command.apply(true);
      }
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
            buffer.upload();
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
      if (mask && mask.trans) {
         // globalMatrix
         let rootMatrix = rootTrans.matrix;
         // localMatrix
         let maskMatrix = mask.trans.matrix;

         Matrix.mul(maskMatrix, rootMatrix, temp);
         temp.invert();
      } else {
         rootTrans.matrix.copyTo(temp);
         temp.invert();
      }
      this._setInvertMatrix(temp.a, temp.b, temp.c, temp.d, temp.tx + this.renderOffset.x, temp.ty + this.renderOffset.y);
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
      for (let i = 0, n = this._lists.length; i < n; i++) {
         if (this._lists[i]) {
            this._lists[i].destroy();
         }
      }
      this._lists.length = 0;
      this._lists = null;
      this.root = null;
      this.renderTexture = null;
      this.postProcess = null;
      this.shaderData.destroy();
      this.shaderData = null;
   }
}

/**
 * 简单的管理indexBuffer
 */
export class BatchBuffer {

   static _STEP_ = 1024;

   indexBuffer: IIndexBuffer;
   wholeBuffer: Web2DGraphicWholeBuffer;

   indexCount: number = 0;
   maxIndexCount: number = 0;

   bufferStates: Map<IVertexBuffer, IBufferState> = new Map();

   geometryList: IRenderGeometryElement[] = [];

   constructor() {
      this.indexBuffer = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Dynamic);
      this.indexBuffer.indexType = IndexFormat.UInt16;
      this.wholeBuffer = new Web2DGraphicWholeBuffer();
      this.wholeBuffer.buffer = this.indexBuffer;
      this.wholeBuffer.modifyType = BufferModifyType.Index;
   }

   updateBufLength() {
      if (this.maxIndexCount <= this.indexCount) {
         let nLength = Math.ceil(this.indexCount / BatchBuffer._STEP_) * BatchBuffer._STEP_;
         let byteLength = nLength * 2;
         this.indexBuffer._setIndexDataLength(byteLength);
         this.wholeBuffer.resetData(byteLength);
         this.maxIndexCount = nLength;
      }
   }

   bindBuffer(buffer: IVertexBuffer) {
      let bufferState = this.bufferStates.get(buffer);
      if (!bufferState) {
         bufferState = LayaGL.renderDeviceFactory.createBufferState();
         bufferState.applyState([buffer], this.indexBuffer);
         this.bufferStates.set(buffer, bufferState);
      }
      return bufferState;
   }

   clear() {
      this.indexCount = 0;
      this.wholeBuffer.clearBufferViews();
      this.bufferStates.forEach((bufferState) => {
         bufferState.destroy();
      });
      this.bufferStates.clear();
      this.geometryList.length = 0;
   }

   destroy(): void {
      this.clear();
      this.indexBuffer.destroy();
      this.indexBuffer = null;
      this.wholeBuffer.destroy();
      this.wholeBuffer = null;
   }
}

class PassRenderList {

   _batchInfoList = new FastSinglelist<Batch2DInfo>;

   private _currentType: number = -1;
   // private _currentElementCount: number = 0;
   private _currentBatch: Batch2DInfo = null;

   structs: FastSinglelist<WebRenderStruct2D> = null;
   renderElements: FastSinglelist<IRenderElement2D> = null;
   renderListType: number = -1;
   zOrder: number = 0;
   //预想给list更新使用
   _dirtyFlag: number = 0;

   private _batchBuffer = new BatchBuffer();

   private _recoverList = new FastSinglelist<IRenderElement2D>();

   constructor() {
      this.renderElements = new FastSinglelist<IRenderElement2D>();
      this.structs = new FastSinglelist<WebRenderStruct2D>();
   }

   add(struct: WebRenderStruct2D): void {
      this.structs.add(struct);

      let n = struct.renderElements ? struct.renderElements.length : 0;
      if (n == 0) return;
      if (n == 1) {
         this._batchStart(struct.renderType, 1);
         this.renderElements.add(struct.renderElements[0]);
      } else {
         this._batchStart(struct.renderType, n);
         for (var i = 0; i < n; i++) {
            this.renderElements.add(struct.renderElements[i]);
         }
      }

      if (this._currentBatch.batchFun) {
         let offset = this._currentBatch.indexStart + this._currentBatch.elementLength - n;
         this._currentBatch.batchFun.batchIndexBuffer(struct, this._batchBuffer, offset );
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
      this._currentBatch = Batch2DInfo.create();
      this._currentBatch.batch = false;
      this._currentBatch.batchFun = BatchManager._batchMapManager[type];
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
            info.batchFun.batchRenderElement(this.renderElements, info.indexStart, info.elementLength, this._recoverList , this._batchBuffer);
         } else {
            for (let j = info.indexStart, m = info.elementLength + info.indexStart; j < m; j++)
               this.renderElements.add(this.renderElements.elements[j]);
         }
      }
   }


   remove(struct: WebRenderStruct2D): void {
      this.structs.remove(struct);
   }

   destroy(): void {
      this.structs.clear();
      this.clearRenderElements();
      this._batchBuffer.destroy();
   }

   clearRenderElements(): void {
      this.renderElements.clear();
      this._batchInfoList.clear();
   }

   reset(): void {
      this.structs.length = 0;
      this.renderElements.length = 0;

      this._batchBuffer.clear();

      for (var i = 0, n = this._batchInfoList.length; i < n; i++) {
         let element = this._batchInfoList.elements[i];
         if (element.batch) {
            element.batchFun.recover(this._recoverList);
         }
         Batch2DInfo.recover(element);
      }
      this._batchInfoList.length = 0;
      this._currentBatch = null;
      this._currentType = -1;
      // this._currentElementCount = 0;
   }
}

export class WebRender2DPassManager implements IRender2DPassManager {
   private _modefy: boolean = false;

   private _passes: WebRender2DPass[] = [];

   removePass(pass: WebRender2DPass): void {
      this._passes.splice(this._passes.indexOf(pass), 1);
      this._modefy = true;
   }

   apply(context: IRenderContext2D): void {
      if (this._modefy) {
         this._modefy = false;
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
      this._passes.push(pass);
      this._modefy = true;
   }

   /**
    * 按照 priority 对 Pass 进行排序
    */
   private _sortPassesByPriority(): void {
      this._passes.sort((a, b) => b.priority - a.priority); // 按 priority 从大到小排序
   }
}


WebGraphicsBatch.instance = new WebGraphicsBatch;
BatchManager.regisBatch(BaseRender2DType.graphics, WebGraphicsBatch.instance)