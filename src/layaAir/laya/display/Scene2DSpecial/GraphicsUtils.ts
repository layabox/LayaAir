import { Event } from "../../events/Event";
import { AutoTextureConfig } from "../../large/AutoTextureConfig";
import { LargeTexProcessor } from "../../large/LargeTexProcessor";
import { LayaGL } from "../../layagl/LayaGL";
import { Matrix } from "../../maths/Matrix";
import { Rectangle } from "../../maths/Rectangle";
import { Vector4 } from "../../maths/Vector4";
import { IPrimitiveRenderElement2D, IRenderElement2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { ShaderData } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { I2DGraphicIndexDataView, I2DGraphicVertexDataView, I2DPrimitiveDataHandle, IGraphics2DBufferBlock, IGraphics2DVertexBlock } from "../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { IRender2DPass } from "../../RenderDriver/RenderModuleData/Design/2D/IRender2DPass";
import { IRenderStruct2D } from "../../RenderDriver/RenderModuleData/Design/2D/IRenderStruct2D";
import { WebRenderStruct2D } from "../../RenderDriver/RenderModuleData/WebModuleData/2D/WebRenderStruct2D";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { BaseTexture } from "../../resource/BaseTexture";
import { Material } from "../../resource/Material";
import { RenderTexture2D } from "../../resource/RenderTexture2D";
import { Resource } from "../../resource/Resource";
import { Texture } from "../../resource/Texture";
import { Browser } from "../../utils/Browser";
import { Texture2D } from "../../resource/Texture2D";
import { IPool, Pool } from "../../utils/Pool";
import { FastSinglelist } from "../../utils/SingletonList";
import { Stat } from "../../utils/Stat";
import { BlendModeHandler } from "../../webgl/canvas/BlendMode";
import { Shader2D } from "../../webgl/shader/d2/Shader2D";
import { GraphicsShaderInfo } from "../../webgl/shader/d2/value/GraphicsShaderInfo";
import { SubmitBase, SubmitCacheInfo } from "../../webgl/submit/SubmitBase";
import { GraphicsMesh, MeshBlockInfo } from "../../webgl/utils/GraphicsMesh";
import { Graphics } from "../Graphics";
import { Render2DProcessor } from "../Render2DProcessor";
import { Sprite } from "../Sprite";
import { BaseRender2DType, SpriteConst, TransformKind } from "../SpriteConst";
import { SpriteGlobalTransform } from "../SpriteGlobaTransform";
import { GraphicsRunner } from "./GraphicsRunner";
import type { IGraphicsCmd } from "../IGraphics";
import { ShaderDefines2D } from "../../webgl/shader/d2/ShaderDefines2D";

type GraphicBlockRecord = {
   index: number;
   view: I2DGraphicVertexDataView;
};

type GraphicBlockBucket = {
   mesh: GraphicsMesh;
   blocks: Record<number, I2DGraphicVertexDataView>;
   indexs: number[];
};

/** @internal */
export class GraphicsRenderer {

   static _emptyList: IPrimitiveRenderElement2D[] = [];

   /** @internal */
   _renderElements: IPrimitiveRenderElement2D[] = [];

   /**@internal */
   _submits: FastSinglelist<SubmitBase> = new FastSinglelist;

   private _bufferBlocks: IGraphics2DBufferBlock[] = [];

   owner: Sprite;

   _struct: IRenderStruct2D;

   texturesMap: Map<number, {
      texture: Texture;
      time:number;
   }> = new Map();

   _display: boolean = false;

   private _renderDataHandle: I2DPrimitiveDataHandle;

   graphics:Graphics = null;
   modified = -1;

   /** @internal 当前帧记录的块按 mesh 分组 */
   _blockBuckets: GraphicBlockBucket[] = [];
   /** @internal 上一帧保留用于复用的块 */
   _cachedBuckets: GraphicBlockBucket[] = [];

   constructor(owner: Sprite) {
      this.owner = owner;
      this._struct = owner._struct;
      this._renderDataHandle = LayaGL.render2DRenderPassFactory.create2D2DPrimitiveDataHandle();
      this.owner.on(SpriteGlobalTransform.CHANGED, this, this._onOwnerTransformChanged);
   }

   /** @internal */
   private _onOwnerTransformChanged(type : number) {
      //缩放重绘
      if (type & TransformKind.Layout && this._display && this.owner._struct.enabled) {
         // 如果graphics中有需要响应布局变化的cmd，则重绘
         if (this.graphics && this.graphics.getLayoutRepaintCount() > 0) {
            this.graphics.repaint();
         }
      }
   }

   /**
    * 设置Graphics对象
    * @param graphics Graphics对象
    */
   setGraphics(graphics: Graphics): void {
      this.graphics = graphics;
      this._checkDisplay();
   }

   /**
     * @internal
     */
   _render(runner: GraphicsRunner, x: number = 0, y: number = 0): void {
      if (!this.owner || !this.graphics || this.owner.destroyed || this.owner._struct.renderType !== BaseRender2DType.graphics)
         return;  

      if (this.modified >= this.graphics._modified) {
         this.setRenderElement();
         return;
      }

      this.modified = this.graphics._modified;
      
      this.clear();
      runner.clear();
      runner.sprite = this.owner;
      runner._renderer = this;
      runner._global = this.owner._globalTrans.getMatrix();
      let oldCache = runner._enableCache;
      let enableCache = runner._enableCache = this.graphics.needCache;
      let needSkipBufferUpdate = false;
      runner._material = this.graphics.material;
      let oldBlendMode = runner.globalCompositeOperation;
      runner.globalCompositeOperation = this.owner._struct.blendMode;

      let cmdsLength = this.graphics.cmds.length;
      let prevSubmitInfo: SubmitCacheInfo | null = null;
      let cmd:IGraphicsCmd

      for (let i = 0; i < cmdsLength; i++) {
         cmd = this.graphics.cmds[i];
         if (enableCache) {
            if (cmd._cacheData) {
               if (prevSubmitInfo !== cmd._cacheData) {
                  runner.applyCachedSubmitInfo(cmd._cacheData);
                  prevSubmitInfo = cmd._cacheData;
                  needSkipBufferUpdate = true;
               }
            }else{
               cmd.run(runner, x, y);
               cmd._cacheData = runner._currentSubmitCache;
            }
         }else{
            cmd.run(runner, x, y);
         }
      }

      let tex = this.owner._texture;
      if (tex) {  
         if (tex._getSource(() => {
            this.owner._graphics.repaint();
         })) {
            var width = this.owner._isWidthSet ? this.owner._width : tex.sourceWidth;
            var height = this.owner._isHeightSet ? this.owner._height : tex.sourceHeight;
            var wRate = width / tex.sourceWidth;
            var hRate = height / tex.sourceHeight;
            width = tex.width * wRate;
            height = tex.height * hRate;
            if (width > 0 && height > 0) {
               let px = x + tex.offsetX * wRate;
               let py = y + tex.offsetY * hRate;
               runner.drawTexture(tex, px, py, width, height, 0xffffffff);
            }
         }
      }

      this.updateRenderElement(needSkipBufferUpdate);

      runner._enableCache = oldCache;
      runner.globalCompositeOperation = oldBlendMode;
      runner._material = null;
      runner._renderer = null;
      runner.sprite = null;
   }


   /**
    * @internal
    */
   onModified(){
      //todo
      this.modified = -1;
   }

   /** @internal */
   _checkDisplay() {
      if (!this.owner || this.owner.destroyed) {
         this._display = false;
         return;
      }

      let cmd = this.graphics && this.graphics.cmds && this.graphics.cmds.length > 0;
      let value = !this.owner._renderNode && (cmd || this.owner._texture != null);
      if (this._display === value)
         return;

      this._display = value;

      let struct = this.owner._struct;
      if (value) {
         this.owner._initShaderData();
         this.owner._renderType |= SpriteConst.GRAPHICS;
         struct.renderType = BaseRender2DType.graphics;
         struct.renderDataHandler = this._renderDataHandle;
         struct.renderElements = this._renderElements;
         this.owner._updateStruct();
      } else {
         this.owner._renderType &= ~SpriteConst.GRAPHICS;
         if (struct.renderElements === this._renderElements) {
            struct.renderElements = GraphicsRenderer._emptyList;
         }
         this.modified = -1;
         struct.renderType = -1;
         struct.renderDataHandler = null;
      }
   }

   take(info: MeshBlockInfo) {
      for (let i = 0; i < info.vertexBlocks.length; i++) {
         let id = info.mesh.id;

         let bucket = this._blockBuckets[id];
         if (!bucket) {
            bucket = { mesh: info.mesh, blocks: [], indexs: [] };
            this._blockBuckets[id] = bucket;
         }
         
         bucket.blocks[info.vertexBlocks[i]] = info.vertexViews[i];
         bucket.indexs.push(info.vertexBlocks[i]);
      }
   }

   clear(): void {
      for (const bucket of this._cachedBuckets) {
         if (bucket) {
            bucket.mesh.clearBlocks(bucket.indexs);
         }
      }
      this._cachedBuckets = this._blockBuckets;
      this._blockBuckets = [];

      let len = this._submits.length;
      for (let i = 0; i < len; i++) {
         this._submits.elements[i].clear();
      }
      this._submits.length = 0;
   }

   destroy(): void {
      this.clear();

      for (const bucket of this._cachedBuckets) {
         if (bucket) {
            bucket.mesh.clearBlocks(bucket.indexs);
         }
      }
      this._cachedBuckets = null;
      this._blockBuckets = null;
      
      this._renderElements.length = 0;

      this._submits.elements.forEach(submit => {
         submit.destroy();
      });
      this._submits.destroy();

      this.texturesMap.forEach(inf => {
         inf.texture.off(Event.CHANGE, this, this._resourceRepaint);
      });
      this.texturesMap.clear();

      this.graphics = null;
      this._renderDataHandle.destroy();
      this._renderDataHandle = null;
      this.owner = null;
   }

   updateRenderElement(needSkipBufferUpdate: boolean): void {
      let elements = this._renderElements;
      let submits = this._submits;
      let needUpdate =  elements.length !== submits.length;
      let bufferDirty = needUpdate;
      let flength = submits.length;
      let submit:SubmitBase , element:IPrimitiveRenderElement2D;

      for (let i = 0; i < flength; i++) {
         submit = submits.elements[i];
         element = submit.renderElement;
         if (!element.owner) {
            element.value2DShaderData = this._struct.spriteShaderData;
            element.owner = this._struct;
         }
         
         element.renderStateIsBySprite = submit.renderStateIsBySprite && this.graphics._useSpriteState;

         submit.prepare();

         this._bufferBlocks[i] = submit._bufferBlock;
         bufferDirty = bufferDirty || submit._bufferBlockDirty;
         elements[i] = element;
      }

      
      //reset
      if (needUpdate) {
         this._bufferBlocks.length = submits.length;
         elements.length = submits.length;
         this._struct.renderElements = elements;
      }

      if (bufferDirty) {
         this._renderDataHandle.applyVertexBufferBlock(this._bufferBlocks);
         for (let i = 0; i < flength; i++) {
            submits.elements[i]._bufferBlockDirty = false;
         }
      }else if (needSkipBufferUpdate) {
         this._renderDataHandle.skipBufferUpdate();
      }
   }

   setRenderElement(): void {
      this._struct.renderElements = this._renderElements;
      // this._renderDataHandle.applyVertexBufferBlock(this._bufferBlocks);
   }

   createSubmit(runner: GraphicsRunner): SubmitBase {
      let elements = this._submits.elements;
      let submit: SubmitBase = null;
      if (elements.length > this._submits.length) {
         submit = elements[this._submits.length];
         submit.update(runner);
         this._submits.length++;
      } else {
         submit = SubmitBase.create(runner);
         this._submits.add(submit);
      }

      return submit;
   }

   addResRef(res: Resource) {
      if (res instanceof Texture) {
         let inf = this.texturesMap.get(res.id);
         if (!inf) {
            res.on(Event.CHANGE, this, this._resourceRepaint , [res.id]);
            this.texturesMap.set(res.id, {
               texture: res,
               time: this.modified
            });
         } else 
            inf.time = this.modified;
      }
   }

   private _resourceRepaint(id: number) {
      let inf = this.texturesMap.get(id);
      if (inf.time !== this.modified) {
         this.texturesMap.delete(id);
         inf.texture.off(Event.CHANGE, this, this._resourceRepaint);
         return;
      }

      let graphics = this.graphics;
      if (this.owner._needGraphicsUpdate()) {
         graphics.repaint();
      }else {
         graphics._modified = Stat.loopCount;
      }
   }
   /**
    * @internal
    */
   protected _saveCache(): void {
      
   }

}

/** @internal */
export class SubStructRender {
   private _subRenderPass: IRender2DPass;
   private _subStruct: IRenderStruct2D;
   private _sprite: Sprite;

   private _renderElement: IPrimitiveRenderElement2D = null;
   /** @internal 模拟sprite shaderdata */
   private _shaderData: ShaderData = null;
   private _handle: I2DPrimitiveDataHandle = null;
   private _submit: SubmitBase = null;
   private _internalInfo: GraphicsShaderInfo = null;
   /** @internal 渲染区域 */
   _rtRect: Rectangle = new Rectangle();
   _oriRect: Rectangle = new Rectangle();
   _logicMatrix: Matrix;

   private _needUpdateVertexSize: boolean = true;

   private _renderElements: IPrimitiveRenderElement2D[] = [];
   private _scaleX: number = 1;
   private _scaleY: number = 1;
   constructor() {
      this._shaderData = LayaGL.renderDeviceFactory.createShaderData();
      this._handle = LayaGL.render2DRenderPassFactory.create2D2DPrimitiveDataHandle();
      this._submit = new SubmitBase;
      this._internalInfo = new GraphicsShaderInfo();
      this._submit._internalInfo = this._internalInfo;
      this._renderElement = SubmitBase._pool.take();
      this._renderElement.value2DShaderData = this._shaderData;
      this._renderElement.subShader = Shader2D.graphicsShader.getSubShaderAt(0);
      this._renderElement.primitiveShaderData = this._submit._internalInfo.shaderData;
      this._renderElement.nodeCommonMap = ["Sprite2D"];
      this._renderElement.geometry = Render2DProcessor.runner.inv_geometry;
      BlendModeHandler.initBlendMode(this._shaderData);
      this._internalInfo.enableVertexSize = true;
      this._renderElements = [this._renderElement];
   }

   bind(sprite: Sprite, subRenderPass: IRender2DPass, subStruct: IRenderStruct2D): void {
      this._sprite = sprite;
      this._subRenderPass = subRenderPass;
      this._subStruct = subStruct;
      this._subStruct.spriteShaderData = this._shaderData;
      this._subStruct.renderType = BaseRender2DType.graphics;
      // this._submit.material = sprite.material;

      subStruct.renderDataHandler = this._handle;
      // subStruct 共享 sprite 的 slot：renderMatrix getter 按 slot 直读 store(不经 SpriteGlobalTransform)
      subStruct.transSlot = sprite._globalTrans.slot;
      subStruct.renderElements = this._renderElements;

      this._renderElement.owner = this._subStruct;
      this._renderElement.typeKey = this._subStruct.blendMode;
      this._renderElement.textureKey = 0;
   }

   /**
    * @internal 更新渲染区域
    * @param rect 
    * @param scaleX
    * @param scaleY
    */
   _updateRenderOffset(rect: Rectangle, oriRect: Rectangle, scaleX: number, scaleY: number) {
      if (!rect.equals(this._rtRect) || !oriRect.equals(this._oriRect) || scaleX !== this._scaleX || scaleY !== this._scaleY) {
         this._needUpdateVertexSize = true;
      }

      rect.cloneTo(this._rtRect);
      oriRect.cloneTo(this._oriRect);

      this._scaleX = scaleX;
      this._scaleY = scaleY;

      let originPass = this._subRenderPass;
      let matrix = originPass.offsetMatrix;

      let sprite = this._sprite;
      //rect 为 mask 逻辑父节点世界坐标系下
      if (sprite.mask) {
         this._updateLogicMatrix(sprite.mask, sprite.globalTrans.getMatrix(), rect.x, rect.y, matrix);
      }
      else if (sprite._maskParent && sprite.transform) {
         this._updateLogicMatrix(sprite, sprite.globalTrans.getMatrix(), rect.x, rect.y, matrix);
      }
      else {
         this._handle.logicMatrix = null;
         matrix.identity();
         matrix.tx = rect.x;
         matrix.ty = rect.y;
      }

      // matrix.tx = matrix.a * rect.x + matrix.c * rect.y + matrix.tx;
      // matrix.ty = matrix.b * rect.x + matrix.d * rect.y + matrix.ty;
      matrix.scale(1 / scaleX, 1 / scaleY);
      originPass.offsetMatrix = matrix;
   }

   private _updateLogicMatrix(sprite: Sprite, global: Matrix, offsetX: number, offsetY: number, out: Matrix) {
      if (!this._logicMatrix) {
         this._logicMatrix = new Matrix;
      }

      let logicMatrix = this._logicMatrix;
      let spriteGlobal = sprite.globalTrans.getMatrix();
      let parent = sprite.parent ? sprite.parent : sprite._maskParent;
      let parentGlobal = parent.globalTrans.getMatrix();
      parentGlobal.copyTo(logicMatrix);

      let x = sprite.x - sprite._pivotX;
      let y = sprite.y - sprite._pivotY;
      logicMatrix.tx = x * parentGlobal.a + y * parentGlobal.c + parentGlobal.tx;
      logicMatrix.ty = x * parentGlobal.b + y * parentGlobal.d + parentGlobal.ty;

      logicMatrix.copyTo(out);
      Matrix.mul(logicMatrix, global.copyTo(Matrix.TEMP).invert(), logicMatrix);
      this._handle.logicMatrix = this._logicMatrix;

      //逻辑父节点localMatrix
      out.tx = offsetX * out.a + offsetY * out.c + out.tx;
      out.ty = offsetX * out.b + offsetY * out.d + out.ty;
      //用于补充
      Matrix.mul(spriteGlobal, out.invert(), out);
      out.invert();
   }

   /**
    * @internal
    * @param oriRT 
    * @param destRT 
    */
   _updateRenderTexture(oriRT: RenderTexture2D, destRT: RenderTexture2D) {
      this._handle.mask = this._sprite.mask?._struct;

      if (this._submit._key.blendShader !== this._subStruct.blendMode) {
         this._submit._key.blendShader = this._subStruct.blendMode;
         BlendModeHandler.setShaderData(this._subStruct.blendMode, this._shaderData);
         BlendModeHandler.setShaderData(this._subStruct.blendMode, this._internalInfo.shaderData);
      }

      if (this._internalInfo.textureHost == destRT && !this._needUpdateVertexSize)
         return;

      this._internalInfo.textureHost = destRT;

      let rtRect = this._rtRect;
      let vSize = Vector4.TEMP;
      vSize.x = rtRect.x / this._scaleX;
      vSize.y = rtRect.y / this._scaleY;

      let width = destRT.sourceWidth;
      let height = destRT.sourceHeight;
      if (width > 0 && height > 0) {
         vSize.z = width / this._scaleX;
         vSize.w = height / this._scaleY;
      } else {
         vSize.z = rtRect.width / this._scaleX;
         vSize.w = rtRect.height / this._scaleY;
      }
      this._internalInfo.vertexSize = vSize;
      this._needUpdateVertexSize = false;
      let defineBits = ShaderDefines2D.getPerElementDefineBits(this._internalInfo.shaderData);
      this._renderElement.typeKey = this._subStruct.blendMode | defineBits;
      this._renderElement.textureKey = destRT ? destRT._id : 0;
   }

   destroy(): void {
      this._renderElement.geometry = null;
      SubmitBase._pool.recover(this._renderElement);
      this._submit.destroy();
      this._submit = null;
      this._internalInfo = null;
      this._handle = null;
      this._subRenderPass = null;
      this._subStruct = null;
      this._sprite = null;
   }
}
