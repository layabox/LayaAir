import { Color } from "../../../../maths/Color";
import { Vector4 } from "../../../../maths/Vector4";
import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { RenderTexture2D } from "../../../../resource/RenderTexture2D";
import { FastSinglelist } from "../../../../utils/SingletonList";
import { Stat } from "../../../../utils/Stat";
import { RenderState2D } from "../../../../webgl/utils/RenderState2D";
import { Context } from "../../../../renders/Context";
import { WebRenderStruct2D } from "./WebRenderStruct2D";
import { IRender2DPass } from "../../Design/2D/IRender2DPass";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { LayaGL } from "../../../../layagl/LayaGL";
import { BaseRenderNode2D } from "../../../../NodeRender2D/BaseRenderNode2D";
import { Vector2 } from "../../../../maths/Vector2";
import { ShaderDefines2D } from "../../../../webgl/shader/d2/ShaderDefines2D";
import { Const } from "../../../../Const";
import { Matrix } from "../../../../maths/Matrix";
import { PostProcess2D } from "./PostProcess2D";
import { Vector3 } from "../../../../maths/Vector3";

export interface IBatch2DRender {
   /**合批范围，合批的RenderElement2D直接add进list中 */
   batchRenderElement(list: FastSinglelist<IRenderElement2D>, start: number, length: number): void;

   recover(): void;
}

export class Batch2DInfo {
   batchFun: IBatch2DRender = null;
   batch: boolean = false;
   indexStart: number = -1;
   elementLenth: number = 0;
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
   /** @internal */
   static curRenderTexture: RenderTexture2D = null;

   /** @internal */
   _lists: PassRenderList[] = [];

   priority: number = 0;

   enable: boolean = true;

   renderTexture: RenderTexture2D;

   /** @internal */
   _internalRT: RenderTexture2D = null;

   //todo: 2D process
   postProcess: PostProcess2D = null;

   repaint: boolean = true;

   _clearColor = new Color;

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

   /**
     * 渲染层掩码，用于裁剪规则一
     */
   protected _renderLayerMask: number = 0xFFFFFFFF;

   /**
    * 裁剪矩形，用于裁剪规则二
    */
   private _cullRect: Vector4 = new Vector4();

   root: WebRenderStruct2D = null;

   private _invertMat_0: Vector3 = new Vector3(1, 1);
   private _invertMat_1: Vector3 = new Vector3(0, 0);

   /**
    * 设置裁剪矩形
    */
   set cullRect(value: Vector4) {
      value.cloneTo(this._cullRect);
   }

   /**
     * 设置渲染层掩码
     */
   set renderLayerMask(value: number) {
      this._renderLayerMask = value;
   }

   shaderData: ShaderData = null;

   constructor() {
      this.shaderData = LayaGL.renderDeviceFactory.createShaderData(null);
   }

   /**
    * add Render Node
    * @param object 
    */
   addStruct(object: WebRenderStruct2D, zOrder = 0): void {
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
   removeStruct(object: WebRenderStruct2D, zOrder = 0): void {
      this._lists[zOrder].remove(object);
   }

   cullAndSort(context2D: IRenderContext2D, struct: WebRenderStruct2D): void {
      if (!struct.enable) return;

      if (struct._renderUpdateMask !== Stat.loopCount) {
         struct._renderUpdateMask = Stat.loopCount;
         // 裁剪规则一：检查渲染层掩码
         // if ((struct.renderLayer & this._renderLayerMask) === 0) {
         //    return;
         // }

         // // 裁剪规则二：检查矩形相交
         // const nodeRect = renderNode.rect;
         // if (!this._isRectIntersect(nodeRect, this._cullRect)) {
         //     return;
         // }

         struct.renderUpdate(context2D);
         //todo 排序
         struct.preRenderUpdate(context2D);

         this.addStruct(struct);
      }

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

   render(context: IRenderContext2D) {
      this._initRenderProcess(context);
      let lists = this._lists;
      // 清理zOrder相关队列

      if (this.repaint) {
         for (let i = 0, len = lists.length; i < len; i++)
            lists[i]?.reset();

         this.updateRenderQueue(context);
         for (let i = 0, len = lists.length; i < len; i++) {
            let list = lists[i];
            if (!list || !list.renderElements.length) continue;
            this.enableBatch && list.batch();
            context.drawRenderElementList(list.renderElements);
         }

         this.repaint = false;
      } else {
         for (let i = 0, len = lists.length; i < len; i++) {
            let list = lists[i];
            if (!list || !list.renderElements.length) continue;
            context.drawRenderElementList(list.renderElements);
         }
      }

      this.endRenderProcess(context);
   }

   //预留
   private _initRenderProcess(context: IRenderContext2D) {
      //设置viewport 切换rt
      let sizeX, sizeY;
      if (this.renderTexture) {
         context.invertY = !this.renderTexture._invertY;
         context.setRenderTarget(this.renderTexture._renderTarget, true, this._clearColor);
         sizeX = this.renderTexture.width;
         sizeY = this.renderTexture.height;
         WebRender2DPass.curRenderTexture = this.renderTexture;

         this.root.transform.getMatrixInv(_TEMP_InvertMatrix);
         this._setInvertMatrix(_TEMP_InvertMatrix.a, _TEMP_InvertMatrix.b, _TEMP_InvertMatrix.c, _TEMP_InvertMatrix.d, _TEMP_InvertMatrix.tx, _TEMP_InvertMatrix.ty);

         this.shaderData.addDefine(ShaderDefines2D.RENDERTEXTURE);

      } else {
         context.invertY = false;
         sizeX = RenderState2D.width;
         sizeY = RenderState2D.height;
         context.setOffscreenView(sizeX, sizeY);
         if (!WebRender2DPass.curRenderTexture) {
            context.setRenderTarget(null, true, this._clearColor);
         }

         this._setInvertMatrix(1, 0, 0, 1, 0, 0);
         this.shaderData.removeDefine(ShaderDefines2D.RENDERTEXTURE);
      }
      
      context.passData = this.shaderData;
      // this._setClipInfo(this.clipMatrix);
      this._setRenderSize(sizeX, sizeY);
   }

   private endRenderProcess(context: IRenderContext2D) {
      if (this.renderTexture) {
         context.setRenderTarget(null, true, this._clearColor);
         WebRender2DPass.curRenderTexture = null;
      }
      // context.setOffscreenView(RenderState2D.width, RenderState2D.height);
      // context.setRenderTarget(null, true, this._clearColor);
      context.passData = null;
      this.recover(context);
   }

   // _setClipInfo(matrix:Matrix){
   //    this._clipMatrixDir.setValue(matrix.a, matrix.b, matrix.c, matrix.d);
   //    this.shaderData.setVector(ShaderDefines2D.UNIFORM_CLIPMATDIR, this._clipMatrixDir);
   //    this._clipMatrixPos.setValue(matrix.tx, matrix.ty);
   //    this.shaderData.setVector2(ShaderDefines2D.UNIFORM_CLIPMATPOS, this._clipMatrixPos);
   // }

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

   recover(context: IRenderContext2D): void {
      if (this.renderTexture) {
         context.setRenderTarget(null, this.repaint, this.repaint ? null : this._clearColor);
      }
   }
}

class PassRenderList {

   _batchInfoList = new FastSinglelist<Batch2DInfo>;

   private _currentType: number = -1;
   private _currentElementCount: number = 0;
   private _currentBatch: Batch2DInfo = null;

   structs: FastSinglelist<WebRenderStruct2D> = null;
   renderElements: FastSinglelist<IRenderElement2D> = null;
   renderListType: number = -1;
   zOrder: number = 0;
   //预想给list更新使用
   _dirtyFlag: number = 0;

   constructor() {
      this.renderElements = new FastSinglelist<IRenderElement2D>();
      this.structs = new FastSinglelist<WebRenderStruct2D>();
   }

   add(struct: WebRenderStruct2D): void {
      this.structs.add(struct);

      let n = struct._renderElements.length;
      if (n == 0) return;
      if (n == 1) {
         this._batchStart(struct._renderType, 1);
         this.renderElements.add(struct._renderElements[0]);
      } else {
         this._batchStart(struct._renderType, n);
         for (var i = 0; i < n; i++) {
            this.renderElements.add(struct._renderElements[i]);
         }
      }
   }

   /**
    * 开启一个Batch
    */
   private _batchStart(type: number, elementLength: number) {
      if (this._currentType == type && this._currentElementCount == elementLength) {
         this._currentBatch.batch = !!(this._currentBatch.batchFun);
         this._currentBatch.elementLenth += elementLength;
         return;
      }

      if (this._currentBatch) {
         this._batchInfoList.add(this._currentBatch);
      }
      this._currentBatch = Batch2DInfo.create();
      this._currentBatch.batch = false;
      this._currentBatch.batchFun = BatchManager._batchMapManager[type];
      this._currentBatch.indexStart = this.renderElements.length;
      this._currentBatch.elementLenth = elementLength;
      this._currentType = type;
      this._currentElementCount = elementLength;
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
            info.batchFun.batchRenderElement(this.renderElements, info.indexStart, info.elementLenth);
         } else {
            for (let j = info.indexStart, m = info.elementLenth + info.indexStart; j < m; j++)
               this.renderElements.add(this.renderElements.elements[j]);
         }
      }
   }


   remove(struct: WebRenderStruct2D): void {
      this.structs.remove(struct);
   }

   clear(): void {
      this.structs.clear();
      this.clearRenderElements();
   }

   clearRenderElements(): void {
      this.renderElements.clear();
      this._batchInfoList.clear();
   }

   reset(): void {
      this.structs.length = 0;
      this.renderElements.length = 0;

      for (var i = 0, n = this._batchInfoList.length; i < n; i++) {
         let element = this._batchInfoList.elements[i];
         if (element.batch) {
            element.batchFun.recover();
         }
         Batch2DInfo.recover(element);
      }
      this._batchInfoList.length = 0;
      this._currentBatch = null;
      this._currentType = -1;
      this._currentElementCount = 0;
   }
}