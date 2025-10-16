import { Event } from "../../events/Event";
import { AutoTextureConfig } from "../../large/AutoTextureConfig";
import { LargeTexProcessor } from "../../large/LargeTexProcessor";
import { LayaGL } from "../../layagl/LayaGL";
import { Rectangle } from "../../maths/Rectangle";
import { Vector4 } from "../../maths/Vector4";
import { IPrimitiveRenderElement2D, IRenderElement2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { ShaderData } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { I2DPrimitiveDataHandle, IGraphics2DBufferBlock } from "../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { IRender2DPass } from "../../RenderDriver/RenderModuleData/Design/2D/IRender2DPass";
import { IRenderStruct2D } from "../../RenderDriver/RenderModuleData/Design/2D/IRenderStruct2D";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { IAutoExpiringResource } from "../../renders/ResNeedTouch";
import { BaseTexture } from "../../resource/BaseTexture";
import { Material } from "../../resource/Material";
import { RenderTexture2D } from "../../resource/RenderTexture2D";
import { Resource } from "../../resource/Resource";
import { Texture } from "../../resource/Texture";
import { Texture2D } from "../../resource/Texture2D";
import { IPool, Pool } from "../../utils/Pool";
import { FastSinglelist } from "../../utils/SingletonList";
import { BlendMode, BlendModeHandler } from "../../webgl/canvas/BlendMode";
import { Shader2D } from "../../webgl/shader/d2/Shader2D";
import { GraphicsShaderInfo } from "../../webgl/shader/d2/value/GraphicsShaderInfo";
import { SubmitBase } from "../../webgl/submit/SubmitBase";
import { GraphicsMesh } from "../../webgl/utils/GraphicsMesh";
import { Graphics } from "../Graphics";
import { Render2DProcessor } from "../Render2DProcessor";
import { Sprite } from "../Sprite";
import { BaseRender2DType } from "../SpriteConst";
import { GraphicsRunner } from "./GraphicsRunner";

/** @internal */
export class GraphicsRenderData {

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

   constructor(owner: Sprite) {
      this.owner = owner;
   }

   clear(): void {

      let len = this._submits.length;
      let i = 0;
      for (i = 0; i < len; i++) {
         this._submits.elements[i].clear();
      }

      this.texturesMap.forEach(res => {
         res.off(Event.CHANGE, this, this._resourceRepaint);
      });
      this.texturesMap.clear();

      this._bufferBlocks.length = 0;
      this._submits.length = 0;
   }

   destroy(): void {
      this.clear();

      let material = this.owner.material;
      let elements = this._renderElements;
      for (let i = 0; i < elements.length; i++) {
         if (material) {
            material._removeOwnerElement(elements[i]);
         }
         GraphicsRenderData._pool.recover(elements[i]);
      }
      elements.length = 0;

      let submits = this._submits.elements;
      for (let i = 0; i < this._submits.length; i++) {
         submits[i].destroy();
      }
      this._submits.destroy();
      this._submits = null;

      this.owner = null;

   }

   /**
    * 提交所有mesh的数据
    * @param graphics 图形
    * @param struct 渲染结构
    * @param handle 渲染句柄
    */
   updateRenderElement(graphics: Graphics, struct: IRenderStruct2D, handle: I2DPrimitiveDataHandle): void {
      let originLen = this._renderElements.length;

      let submits = this._submits;
      let submitLength = submits.length;
      let needUpdate = originLen !== submitLength;

      let flength = Math.max(originLen, submitLength);

      let blocks: IGraphics2DBufferBlock[] = this._bufferBlocks;

      for (let i = 0; i < flength; i++) {
         let submit = submits.elements[i];
         let element = this._renderElements[i];
         if (i < submitLength) {
            if (!element) {
               element = GraphicsRenderData._pool.take();
               element.value2DShaderData = struct.spriteShaderData;
               element.owner = struct;
               this._renderElements[i] = element;
            }

            element.primitiveShaderData = submit._internalInfo.shaderData;
            element.renderStateIsBySprite = submit.renderStateIsBySprite && graphics._useSpriteState;

            if (submit.material) {
               element.subShader = submit.material.shader.getSubShaderAt(0);
               element.materialShaderData = submit.material.shaderData;
               submit.material._setOwner2DElement(element);
            } else {
               element.subShader = Shader2D.graphicsShader.getSubShaderAt(0);
            }


            let geometry = element.geometry;
            geometry.bufferState = submit.mesh.bufferState;
            geometry.clearRenderParams();

            let indexView = this._updateIndexViews(submit, geometry);
            let vertexBuffer = submit.mesh._buffer.vertexBuffer;
            {
               let vertexBlock = LayaGL.render2DRenderPassFactory.createGraphic2DBufferBlock();
               vertexBlock.vertexs = submit.vertexs;
               vertexBlock.indexView = indexView;
               vertexBlock.vertexBuffer = vertexBuffer;
               blocks.push(vertexBlock);
            }

            this._updateGraphicsKeys(element, submit);
         } else {
            graphics.material && (graphics.material._removeOwnerElement(element));
            GraphicsRenderData._pool.recover(element);
         }
      }

      this._renderElements.length = submitLength;
      //reset
      if (needUpdate) {
         struct.renderElements = this._renderElements;
      }

      handle.applyVertexBufferBlock(blocks);
   }

   private _updateIndexViews(submit: SubmitBase, geometry: IRenderGeometryElement) {
      let indexView = submit.mesh.checkIndex(submit.indexCount);
      indexView.setGeometry(geometry);
      submit.indexView = indexView;

      indexView.setData(submit.indices);
      // clear
      submit.indexCount = 0;
      submit.indices.length = 0;
      return indexView
   }

   // TODO
   private _updateGraphicsKeys(element: IRenderElement2D, submit: SubmitBase) {
      let useCustomMaterial = submit.material ? 1 : 0;
      let mc = (useCustomMaterial === 0 && submit._internalInfo.materialClip) ? 1 : 0;
      let texture: BaseTexture;
      let textureHost = submit._internalInfo.textureHost;
      if (textureHost)
         texture = (textureHost as Texture).bitmap || textureHost as BaseTexture;

      element.type = submit._key.blendShader
         | (useCustomMaterial << 4) //16
         | (mc << 5) //32
         | ((texture ? texture.id : 0) << 6); //64
   }

   setRenderElement(struct: IRenderStruct2D, handle: I2DPrimitiveDataHandle): void {
      struct.renderElements = this._renderElements;
      handle.applyVertexBufferBlock(this._bufferBlocks);
   }

   createSubmit(runner: GraphicsRunner, mesh: GraphicsMesh, material: Material): SubmitBase {
      let elements = this._submits.elements;
      let submit: SubmitBase = null;
      if (elements.length > this._submits.length) {
         submit = elements[this._submits.length];
         submit.update(runner, mesh, material);
         this._submits.length++;
      } else {
         submit = SubmitBase.create(runner, mesh, material);
         this._submits.add(submit);
      }

      return submit;
   }

   texturesMap: Map<number, Texture> = new Map();
   // touchResources: IAutoExpiringResource[] = [];

   touchRes(res: IAutoExpiringResource) {
      // res.referenceCount++;
      // this.touchResources.push(res);
   }

   referenceRes(runner: GraphicsRunner, res: Resource) {
      if (res instanceof Texture) {
         let old = this.texturesMap.get(res.id);
         if (!old) {
            res.on(Event.CHANGE, this, this._resourceRepaint);
            this.texturesMap.set(res.id, res);
            if (
               runner._textureProcessor.shouldAddToDynamicAtlas(res)
            ) {
               runner._textureProcessor.addTexture(res);
            }
         }
      }
   }

   private _resourceRepaint() {
      this.owner._graphics.repaint();
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

   private _scaleX: number = 1;
   private _scaleY: number = 1;
   constructor() {
      this._shaderData = LayaGL.renderDeviceFactory.createShaderData();
      this._handle = LayaGL.render2DRenderPassFactory.create2D2DPrimitiveDataHandle();
      this._submit = new SubmitBase;
      this._internalInfo = new GraphicsShaderInfo();
      this._submit._internalInfo = this._internalInfo;
      this._renderElement = GraphicsRenderData._pool.take();
      this._renderElement.value2DShaderData = this._shaderData;
      this._renderElement.subShader = Shader2D.graphicsShader.getSubShaderAt(0);
      this._renderElement.primitiveShaderData = this._submit._internalInfo.shaderData;
      this._renderElement.nodeCommonMap = ["Sprite2D"];
      this._renderElement.geometry = Render2DProcessor.runner.inv_geometry;
      BlendModeHandler.initBlendMode(this._shaderData);
      this._internalInfo.enableVertexSize = true;
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
      subStruct.renderElements = [this._renderElement];

      this._renderElement.owner = this._subStruct;
      this._renderElement.type = this._subStruct.blendMode;
   }

   /**
    * @internal 更新渲染区域
    * @param rect 
    * @param scaleX
    * @param scaleY
    */
   _updateRenderOffset(rect: Rectangle , oriRect: Rectangle, scaleX :number, scaleY :number) {
      rect.cloneTo(this._rtRect);
      oriRect.cloneTo(this._oriRect);

      this._scaleX = scaleX;
      this._scaleY = scaleY;

      let originPass = this._subRenderPass;
      let matrix = originPass.offsetMatrix;
      if (this._sprite.mask) {
         let mask = this._sprite.mask;
         let transform = mask.transform;
         if (transform) {
            transform.cloneTo(matrix)
            matrix.invert();
         }else
            matrix.identity();
      } else {
         matrix.identity();
      }

      matrix.tx = matrix.a * rect.x + matrix.c * rect.y + matrix.tx;
      matrix.ty = matrix.b * rect.x + matrix.d * rect.y + matrix.ty;
      matrix.scale(1 / scaleX, 1 / scaleY);
      originPass.offsetMatrix = matrix;
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

      if (this._internalInfo.textureHost == destRT)
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
   }

   destroy(): void {
      this._renderElement.geometry = null;
      GraphicsRenderData._pool.recover(this._renderElement);
      this._submit.destroy();
      this._submit = null;
      this._internalInfo = null;
      this._handle = null;
      this._subRenderPass = null;
      this._subStruct = null;
      this._sprite = null;
   }
}
