import { Event } from "../../events/Event";
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
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { BaseTexture } from "../../resource/BaseTexture";
import { Material } from "../../resource/Material";
import { RenderTexture2D } from "../../resource/RenderTexture2D";
import { Resource } from "../../resource/Resource";
import { Texture } from "../../resource/Texture";
import { Browser } from "../../utils/Browser";
import { IPool, Pool } from "../../utils/Pool";
import { FastSinglelist } from "../../utils/SingletonList";
import { Stat } from "../../utils/Stat";
import { BlendModeHandler } from "../../webgl/canvas/BlendMode";
import { Shader2D } from "../../webgl/shader/d2/Shader2D";
import { GraphicsShaderInfo } from "../../webgl/shader/d2/value/GraphicsShaderInfo";
import { SubmitBase } from "../../webgl/submit/SubmitBase";
import { GraphicsMesh, MeshBlockInfo } from "../../webgl/utils/GraphicsMesh";
import { Graphics } from "../Graphics";
import { Render2DProcessor } from "../Render2DProcessor";
import { Sprite } from "../Sprite";
import { BaseRender2DType, SpriteConst, TransformKind } from "../SpriteConst";
import { SpriteGlobalTransform } from "../SpriteGlobaTransform";
import { GraphicsRunner } from "./GraphicsRunner";

type GraphicBlockRecord = {
   index: number;
   view: I2DGraphicVertexDataView;
};

type GraphicBlockBucket = {
   mesh: GraphicsMesh;
   blocks: GraphicBlockRecord[];
   indexs: number[];
   used: number;
};

// /** @internal */
// export type GraphicsCache = {
//    graphics: Graphics;
//    modified: number;
//    bufferBlocks: IGraphics2DBufferBlock[];
//    renderElements: IPrimitiveRenderElement2D[];
//    submits: FastSinglelist<SubmitBase>;
//    texturesMap: number[];
// }


/** @internal */
export class GraphicsRenderer {

   static _emptyList: IPrimitiveRenderElement2D[] = [];

   static readonly _pool: IPool<IPrimitiveRenderElement2D> = Pool.createPool2<IPrimitiveRenderElement2D>(() => { //create
      let element = LayaGL.render2DRenderPassFactory.createPrimitiveRenderElement2D();
      element.renderStateIsBySprite = false;
      element.nodeCommonMap = ["Sprite2D"];
      return element;

   }, (element: IPrimitiveRenderElement2D, needGeometry?: boolean) => { //init
      if (needGeometry || needGeometry == null) {
         element.geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
         element.geometry.indexFormat = IndexFormat.UInt16;
      } else {
         if (element.geometry) {
            element.geometry.destroy();
            element.geometry = null;
         }
      }

   }, (element: IPrimitiveRenderElement2D) => { //reset
      if (element.geometry) {
         element.geometry.clearRenderParams();
         element.geometry.bufferState = null;
      }
      element.materialShaderData = null;
      element.value2DShaderData = null;
      element.primitiveShaderData = null;
      element.globalShaderData = null;
      element.owner = null;
      element.subShader = null;
      element.renderStateIsBySprite = false;
      element.type = 0;
   });

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

   /** @internal 上一帧保留的块按 mesh 分组 */
   // _usedBlockBuckets: GraphicBlockBucket[] = [];
   /** @internal 当前帧记录的块按 mesh 分组 */
   _blockBuckets: GraphicBlockBucket[] = [];

   constructor(owner: Sprite) {
      this.owner = owner;
      this._struct = owner._struct;
      this._renderDataHandle = LayaGL.render2DRenderPassFactory.create2D2DPrimitiveDataHandle();
      this.owner.on(SpriteGlobalTransform.CHANGED, this, this._onOwnerTransformChanged);
   }

   /** @internal */
   private _onOwnerTransformChanged(type : number) {
      //缩放重绘
      if (type & TransformKind.Layout && this._display) {
         this.graphics?.repaint();
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

   private _checkRefresh() {
      let needRepaint = this.modified >= this.graphics._modified;

      let result = true;
      //校验图片是否都有效
      this.texturesMap.forEach((object , id) => {
         result = object.texture._getSource() && result;
      })
      return needRepaint && result;
   }

   /**
     * @internal
     */
   _render(runner: GraphicsRunner, x: number = 0, y: number = 0): void {
      if (!this.owner || !this.graphics || this.owner.destroyed || this.owner._struct.renderType !== BaseRender2DType.graphics)
         return;  

      if (this._checkRefresh()) {
         this.setRenderElement();
         return;
      }

      this.modified = this.graphics._modified;
      
      
      this.clear();
      runner.clear();
      runner.sprite = this.owner;
      runner._renderer = this;
      runner._material = this.graphics.material;
      let oldBlendMode = runner.globalCompositeOperation;
      runner.globalCompositeOperation = this.owner._struct.blendMode;

      let cmdsLength = this.graphics.cmds.length;
      // 检查是否需要缓存
      let canCache = this.graphics.needCache && cmdsLength === 1;
      
      for (let i = 0; i < cmdsLength; i++) {
         this.graphics.cmds[i].run(runner, x, y);

         if (canCache) {
            canCache = this.graphics.cmds[i].canCache && canCache;
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

      this.updateRenderElement();

      if (canCache) {
         this._saveCache();
      }

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
            bucket = { mesh: info.mesh, blocks: [], indexs: [], used: 0 };
            this._blockBuckets[id] = bucket;
         }
         
         bucket.blocks.push({
            index: info.vertexBlocks[i],
            view: info.vertexViews[i]
         });

         bucket.indexs.push(info.vertexBlocks[i]);
      }
   }

   clear(): void {
      for (const bucket of this._blockBuckets) {
         bucket.mesh.clearBlocks(bucket.indexs);
      }
      this._blockBuckets.length = 0;

      let len = this._submits.length;
      for (let i = 0; i < len; i++) {
         this._submits.elements[i].clear();
      }
      this._submits.length = 0;
   }

   destroy(): void {
      this.clear();

      let material = this.owner.material;
      
      this._renderElements.forEach(element => {
         if (material) {
            material._removeOwnerElement(element);
         }
         GraphicsRenderer._pool.recover(element);
      });
      this._renderElements.length = 0;

      this._submits.elements.forEach(submit => {
         submit.destroy();
      });
      this._submits.destroy();

      this.texturesMap.forEach(inf => {
         inf.texture.off("dispose" , this, this._resourceRepaint);
      });
      this.texturesMap.clear();

      this.graphics = null;
      this._renderDataHandle.destroy();
      this._renderDataHandle = null;
      this.owner = null;
   }

   updateRenderElement(): void {
      let struct: IRenderStruct2D = this.owner._struct;
      let handle = this._renderDataHandle;
      let elements = this._renderElements;
      let submits = this._submits;
      let needUpdate =  elements.length !== submits.length;

      let flength = Math.max(elements.length, submits.length);
      let submit:SubmitBase , element:IPrimitiveRenderElement2D;

      for (let i = 0; i < flength; i++) {
         submit = submits.elements[i];
         element = elements[i];
         if (i < submits.length) {
            if (!element) {
               element = GraphicsRenderer._pool.take();
               element.value2DShaderData = struct.spriteShaderData;
               element.owner = struct;
               elements[i] = element;
            }
            
            element.renderStateIsBySprite = submit.renderStateIsBySprite && this.graphics._useSpriteState;

            submit.prepare(element);

            this._bufferBlocks[i] = submit._bufferBlock;
         } else {
            this.graphics.material && (this.graphics.material._removeOwnerElement(element));
            GraphicsRenderer._pool.recover(element);
         }
      }

      elements.length = submits.length;
      this._bufferBlocks.length = submits.length;

      //reset
      if (needUpdate || Browser.onLayaRuntime) {
         struct.renderElements = elements;
         handle.applyVertexBufferBlock(this._bufferBlocks);
      }
      
   }


   setRenderElement(): void {
      this._struct.renderElements = this._renderElements;
      this._renderDataHandle.applyVertexBufferBlock(this._bufferBlocks);
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
            res.on("dispose", this, this._resourceRepaint , [res.id]);
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
         inf.texture.off("dispose", this, this._resourceRepaint);
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
      this._renderElement = GraphicsRenderer._pool.take();
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
      this._submit.material = sprite.material;

      subStruct.renderDataHandler = this._handle;
      subStruct.renderMatrix = sprite.globalTrans.getMatrix();
      subStruct.renderElements = this._renderElements;

      this._renderElement.owner = this._subStruct;
      this._renderElement.type = this._subStruct.blendMode;
   }

   /**
    * @internal 更新渲染区域
    * @param rect 
    * @param scaleX
    * @param scaleY
    */
   _updateRenderOffset(rect: Rectangle, oriRect: Rectangle, scaleX: number, scaleY: number) {
      rect.cloneTo(this._rtRect);

      if (!oriRect.equals(this._oriRect)) {
         this._needUpdateVertexSize = true;
      }

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
         BlendModeHandler.setShaderData(this._subStruct.blendMode, this._internalInfo.shaderData);
      }

      if (this._internalInfo.textureHost == destRT && !this._needUpdateVertexSize)
         return;

      if (destRT) {
         this._renderElement.type = destRT._id << 6;
      } else {
         this._renderElement.type = 0;
      }
      this._internalInfo.textureHost = destRT;

      let oriRect = this._oriRect;
      let vSize = Vector4.TEMP;
      vSize.x = oriRect.x;
      vSize.y = oriRect.y;

      let width = destRT.sourceWidth;
      let height = destRT.sourceHeight;
      if (width > 0 && height > 0) {
         vSize.z = Math.round(width / this._scaleX);
         vSize.w = Math.round(height / this._scaleY);
         vSize.x -= (vSize.z - oriRect.width) / 2;
         vSize.y -= (vSize.w - oriRect.height) / 2;
      } else {
         vSize.z = oriRect.width;
         vSize.w = oriRect.height;
      }
      this._internalInfo.vertexSize = vSize;
      this._needUpdateVertexSize = false;
   }

   destroy(): void {
      this._renderElement.geometry = null;
      GraphicsRenderer._pool.recover(this._renderElement);
      this._submit.destroy();
      this._submit = null;
      this._internalInfo = null;
      this._handle = null;
      this._subRenderPass = null;
      this._subStruct = null;
      this._sprite = null;
   }
}
