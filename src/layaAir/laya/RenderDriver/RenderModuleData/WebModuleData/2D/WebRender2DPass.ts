import { Color } from "../../../../maths/Color";
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
import { Web2DGraphicWholeBuffer } from "./Web2DGraphic2DBuffer";
import { SpriteUtils } from "../../../../utils/SpriteUtils";
import { BatchManager, IBatch2DProvider } from "./BatchManager";
import { LayaEnv } from "../../../../../LayaEnv";
import { BaseRender2DType } from "../../../../display/SpriteConst";
import { Pool } from "../../../../utils/Pool";
import { NodeFlags } from "../../../../Const";

import { WebGraphicsBatch } from "./WebGraphicsBatch";
import { Vector4 } from "../../../../maths/Vector4";
import { Rectangle } from "../../../../maths/Rectangle";
BatchManager.registerProvider(BaseRender2DType.graphics, WebGraphicsBatch);

class SortedStructs {
   readonly lists: Map<number, FastSinglelist<WebRenderStruct2D>> = new Map();

   private _indice = new Set<number>;
   private _sortedIndice: Array<number> = [];

   add(struct: WebRenderStruct2D) {
      let list = this.lists.get(struct._effectZ);
      if (!list)
         this.lists.set(struct._effectZ, list = new FastSinglelist<WebRenderStruct2D>());
      list.add(struct);
      if (list.length === 1)
         this._indice.add(struct._effectZ);
      return list;
   }

   reset() {
      this._indice.forEach(i => this.lists.get(i).clear());
      this._indice.clear();
      this._sortedIndice.length = 0;
   }

   get indice(): ReadonlyArray<number> {
      let arr = this._sortedIndice;
      if (arr.length === 0) {
         for (let zIndex of this._indice) {
            arr.push(zIndex);
         }
         arr.sort((a, b) => a - b);
      }
      return arr;
   }

   appendTo(out: FastSinglelist<WebRenderStruct2D>) {
      this.indice.forEach(zIndex => out.addList(this.lists.get(zIndex)));
   }
}

export class WebRender2DPass implements IRender2DPass {
   static buffers: Set<Web2DGraphicWholeBuffer> = new Set();

   private _renderElements = new FastSinglelist<IRenderElement2D>();
   private _elementGroups: FastSinglelist<any> = new FastSinglelist<any>();
   private _structs: SortedStructs = new SortedStructs();
   private _structsPool = Pool.createPool(SortedStructs, null, obj => obj.reset());
   private _pStructs: SortedStructs;
   private _batchProviders: IBatch2DProvider[] = [];

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

   cullAndSort(context2D: IRenderContext2D, struct: WebRenderStruct2D): void {
      if (
         !struct.enabled
         || this._mask === struct
      )
         return;

      let renderStruct: WebRenderStruct2D;
      if (this.root === struct) {
         renderStruct = struct;
      } 
      else if (struct.subStruct) {
         renderStruct = struct.subStruct;
      } else
         renderStruct = struct;

      
      renderStruct._handleInterData();
      //这里进入process2D的排序  并不帧判断
      // if (struct.renderUpdateMask !== Stat.loopCount) {
      //    struct.renderUpdateMask = Stat.loopCount;
      // 裁剪规则一：检查渲染层掩码

      let globalRenderData = struct.globalRenderData;
      if (globalRenderData) {
         if (struct._parentGlobalRenderData
            && (struct.renderLayer & globalRenderData.renderLayerMask) === 0) {
            return;
         }
   
         // 裁剪规则二：检查矩形相交
         let cullRect = globalRenderData.cullRect;
         if (struct.enableCulling && cullRect && !this._isRectIntersect(struct.rect, cullRect)) {
             return;
         }
      }
         
      renderStruct.renderUpdate(context2D);

      let list = this._pStructs.add(renderStruct);

      if (struct.stackingRoot) {
         var oldCol = this._pStructs;
         this._pStructs = this._structsPool.take();
      }

      for (let i = 0, n = renderStruct.children.length; i < n; i++) {
         const child = renderStruct.children[i];
         child._effectZ = child.zIndex + struct._effectZ;
         this.cullAndSort(context2D, child);
      }

      if (struct._dcOptimize) {
         let last = list.length - 1;
         struct.dcOptimizeEnd = list.elements[last];
      }

      if (oldCol) {
         this._pStructs.appendTo(list);
         this._structsPool.recover(this._pStructs);
         this._pStructs = oldCol;
      }
   }
  
   private _isRectIntersect(rect: Rectangle, cullRect: Vector4): boolean {
      // return true;
      //cullRect minx , maxx , miny , maxy
      let rect_minx = rect.x;
      let rect_maxx = rect.x + rect.width;
      let rect_miny = rect.y;
      let rect_maxy = rect.y + rect.height;
      return !(rect_maxx < cullRect.x || rect_minx > cullRect.y || rect_maxy < cullRect.z || rect_miny > cullRect.w);
   }

   /**
    * pass 2D 渲染
    * @param context 
    */
   fowardRender(context: IRenderContext2D) {
      let success = this._initRenderProcess(context);
      if (!success) return;
      if (this.repaint) {
      // if (true) {
         this._structs.reset();
         this._renderElements.length = 0;
         for (let i = 0, n = this._batchProviders.length; i < n; i++) {
            this._batchProviders[i]?.reset();
         }

         if (this.root) {
            this._pStructs = this._structs;
            this.cullAndSort(context, this.root);
            this.fillRenderElements();
            this._enableBatch && LayaEnv.isPlaying && this.batch();
         }

         WebRender2DPass.uploadBuffer();
         context.drawRenderElementList(this._renderElements);

         if (this._mask) {
            let renderMask = this._mask.subStruct;
            renderMask._handleInterData();
            renderMask.renderUpdate(context);
            context.drawRenderElementOne(renderMask.renderElements[0]);
         }

         // 处理后期处理
         if (this.postProcess?.enabled) {
            this.postProcess._context.command.apply(true);
         }
      } else {
         this._structs.indice.forEach(index => {
            let list = this._structs.lists.get(index);
            for (let i = 0, cnt = list.length; i < cnt; i++) {
               let struct = list.elements[i];
               struct._handleInterData();
               struct.renderUpdate(context);
            }
         });

         WebRender2DPass.uploadBuffer();
         context.drawRenderElementList(this._renderElements);
      }

      this.repaint = false;
   }

   private fillRenderElements(): void {
      this._elementGroups.length = 0;
      let groupStart: number = 0;
      let reorderRoot: WebRenderStruct2D;
      let renderElements = this._renderElements;

      this._structs.indice.forEach(index => {
         let list = this._structs.lists.get(index);
         for (let i = 0, cnt = list.length; i < cnt; i++) {
            let struct = list.elements[i];
            let n = struct.renderElements ? struct.renderElements.length : 0;
            if (struct.owner._getBit(NodeFlags.HIDE_BY_EDITOR)) //Editor only code, native should ignore
               n = 0;

            if (struct.dcOptimize && !reorderRoot && struct.dcOptimizeEnd !== struct) {
               reorderRoot = struct;
               if (groupStart !== renderElements.length) {
                  this._elementGroups.add(groupStart);
                  this._elementGroups.add(renderElements.length - 1);
                  this._elementGroups.add(false);
                  groupStart = renderElements.length;
               }
            }

            if (n > 0) {
               // if (reorderRoot != null && struct.dcBoundsTarget != reorderRoot) {
               //    struct.dcBoundsTarget = reorderRoot;
                  // let rect = struct.owner.getSelfBounds(struct.dcBounds, false);
                  // SpriteUtils.transformRect(struct.owner, rect, reorderRoot.owner, rect);
               // }

               for (let i = 0; i < n; i++) {
                  let element = struct.renderElements[i];
                  element._index = i;
                  renderElements.add(element);
               }
            }

            if (reorderRoot?.dcOptimizeEnd === struct) {
               reorderRoot = null;
               if (groupStart !== renderElements.length) {
                  this._elementGroups.add(groupStart);
                  this._elementGroups.add(renderElements.length - 1);
                  this._elementGroups.add(true);
                  groupStart = renderElements.length;
               }
            }
         }
      });

      if (groupStart !== renderElements.length) { 
         this._elementGroups.add(groupStart);
         this._elementGroups.add(renderElements.length - 1);
         this._elementGroups.add(false);
      }
   }

   private batch() {
      let list = this._renderElements;
      let length = list.length;
      let elementArray = list.elements;
      let groups = this._elementGroups;
      let groupsArray = groups.elements;
      list.length = 0;

      for (let gi = 0, gl = groups.length; gi < gl; gi += 3) {
         let groupStart = groupsArray[gi];
         let groupEnd = groupsArray[gi + 1];
         let allowReorder = groupsArray[gi + 2];
         let lastRenderType = elementArray[groupStart].owner.renderType;
         let batchStart = groupStart;

         for (let i = groupStart + 1; i <= groupEnd; i++) {
            let element = elementArray[i];
            let struct = element.owner as WebRenderStruct2D;
            if (lastRenderType === struct.renderType)
               continue;

            if (allowReorder) {
               for (let j = i + 1; j <= groupEnd; j++) {
                  let element2 = elementArray[j];
                  if (element2.owner.renderType === lastRenderType) {
                     for (let k = j - 1; k >= i; k--) {
                        if (element2.owner.rect.intersects(elementArray[k].owner.rect)) {
                           element2 = null;
                           break;
                        }
                     }

                     if (element2 != null) {
                        elementArray.splice(j, 1);
                        elementArray.splice(i, 0, element2);
                        element = elementArray[++i];
                     }
                  }
               }
            }

            if (i - batchStart > 1)
               this.getBatchProvider(lastRenderType).batch(list, batchStart, i - 1, allowReorder);
            else
               list.add(elementArray[batchStart]);

            batchStart = i;
            lastRenderType = struct.renderType;
         }

         if (groupEnd - batchStart > 0)
            this.getBatchProvider(lastRenderType).batch(list, batchStart, groupEnd, allowReorder);
         else
            list.add(elementArray[batchStart]);
      }
   }

   private getBatchProvider(renderType: number): IBatch2DProvider {
      return this._batchProviders[renderType] || (this._batchProviders[renderType] = BatchManager.createProvider(renderType));
   }

   //预留
   private _initRenderProcess(context: IRenderContext2D) : boolean {
      //设置viewport 切换rt
      let sizeX, sizeY;

      let rt = this.renderTexture;
      if (rt) {
         if (rt.width == 0 || rt.height == 0)
            return false;
         context.invertY = rt._invertY;
         context.setRenderTarget(rt._renderTarget, this.doClearColor, this._clearColor);
         sizeX = rt.width;
         sizeY = rt.height;
         this._updateInvertMatrix();
         this.shaderData.addDefine(ShaderDefines2D.RENDERTEXTURE);//??

      } else {
         sizeX = RenderState2D.width;
         sizeY = RenderState2D.height;
         if (sizeX === 0 || sizeY === 0)
            return false
         context.invertY = false;
         context.setOffscreenView(sizeX, sizeY);

         context.setRenderTarget(null, this.doClearColor, this._clearColor);

         this._setInvertMatrix(1, 0, 0, 1, 0, 0);
         this.shaderData.removeDefine(ShaderDefines2D.RENDERTEXTURE);
      }

      context.passData = this.shaderData;

      if (sizeX !== this._rtsize.x || sizeY !== this._rtsize.y) {
         this._rtsize.setValue(sizeX, sizeY);
         this.shaderData.setVector2(ShaderDefines2D.UNIFORM_SIZE, this._rtsize);
      }

      return true;
   }

   static setBuffer(buffer: Web2DGraphicWholeBuffer): void {
      if (buffer._inPass) return;
      buffer._inPass = true;
      WebRender2DPass.buffers.add(buffer);
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
      let rootTrans = this.root?.trans;
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

   destroy(): void {
      if (this.destroyed) {
         return;
      }
      this.destroyed = true;
      this._renderElements.length = 0;
      for (let i = 0, n = this._batchProviders.length; i < n; i++) {
         this._batchProviders[i] && this._batchProviders[i].destroy();
      }
      this._batchProviders.length = 0;
      this.root = null;
      this.renderTexture = null;
      this.postProcess = null;
      this.shaderData.destroy();
      this.shaderData = null;
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
         this._passes.sort((a, b) => b._priority - a._priority); // 按 priority 从大到小排序
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
}

const _TEMP_InvertMatrix = new Matrix();