import { LayaGL } from "../../layagl/LayaGL";
import { BaseRenderNode2D } from "../../NodeRender2D/BaseRenderNode2D";
import { IRenderElement2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { ShaderData } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { I2DPrimitiveDataHandle, I2DGraphicBufferDataView, Graphics2DBufferBlock, Graphics2DVertexBlock } from "../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { IRender2DPass } from "../../RenderDriver/RenderModuleData/Design/2D/IRender2DPass";
import { IRenderStruct2D } from "../../RenderDriver/RenderModuleData/Design/2D/IRenderStruct2D";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { IAutoExpiringResource } from "../../renders/ResNeedTouch";
import { BaseTexture } from "../../resource/BaseTexture";
import { Material } from "../../resource/Material";
import { RenderTexture2D } from "../../resource/RenderTexture2D";
import { Texture } from "../../resource/Texture";
import { Texture2D } from "../../resource/Texture2D";
import { FastSinglelist } from "../../utils/SingletonList";
import { Stat } from "../../utils/Stat";
import { BlendModeHandler } from "../../webgl/canvas/BlendMode";
import { Shader2D } from "../../webgl/shader/d2/Shader2D";
import { ShaderDefines2D } from "../../webgl/shader/d2/ShaderDefines2D";
import { GraphicsShaderInfo } from "../../webgl/shader/d2/value/GraphicsShaderInfo";
import { SubmitBase } from "../../webgl/submit/SubmitBase";
import { GraphicsMesh } from "../../webgl/utils/GraphicsMesh";
import { Render2DProcessor } from "../Render2DProcessor";
import { Sprite } from "../Sprite";
import { BaseRender2DType } from "../SpriteConst";
import { GraphicsRunner } from "./GraphicsRunner";

/** @internal */
export class GraphicsRenderData {

   static _pool: IRenderElement2D[] = [];

   static createRenderElement2D(needGeometry: boolean = true) {
      if (this._pool.length > 0) {
         let element = this._pool.pop();
         if (needGeometry) {
            element.geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
            element.geometry.indexFormat = IndexFormat.UInt16;
         } else {
            if (element.geometry) {
               element.geometry.destroy();
            }
            element.geometry = null;
         }
         return element;
      }

      let element = LayaGL.render2DRenderPassFactory.createRenderElement2D();
      if (needGeometry) {
         element.geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
         element.geometry.indexFormat = IndexFormat.UInt16;
      }
      element.renderStateIsBySprite = false;
      element.nodeCommonMap = ["Sprite2D"];
      return element;
   }

   static recoverRenderElement2D(value: IRenderElement2D) {
      if (!value) return;
      if (value.geometry) {
         value.geometry.clearRenderParams();
         value.geometry.bufferState = null;
      }
      value.materialShaderData = null;
      value.value2DShaderData = null;
      value.owner = null;
      value.subShader = null;
      value.renderStateIsBySprite = false;
      value.type = 0;
      this._pool.push(value);
   }

   /** @internal */
   _renderElements: IRenderElement2D[] = [];

   /**@internal */
   _submits: FastSinglelist<SubmitBase> = new FastSinglelist;

   private _bufferBlocks: Graphics2DBufferBlock[] = [];

   clear(): void {
      let len = this._submits.length;
      let i = 0;
      for (i = 0; i < len; i++) {
         this._submits.elements[i].clear();
      }

      this._bufferBlocks.length = 0;
      this._submits.length = 0;

      for (i = 0; i < this.touchResources.length; i++) {
         this.touchResources[i].referenceCount--;
      }
      this.touchResources.length = 0;
   }

   destroy(): void {
      this.clear();
      let submits = this._submits.elements;
      for (let i = 0; i < this._submits.length; i++) {
         submits[i].destroy();
      }
      this._submits.destroy();
      this._submits = null;
   }

   /**
   * 提交所有mesh的数据
   */
   updateRenderElement(struct: IRenderStruct2D, handle: I2DPrimitiveDataHandle): void {
      let originLen = this._renderElements.length;

      let submits = this._submits;
      let submitLength = submits.length;
      let needUpdate = originLen !== submitLength;

      let flength = Math.max(originLen, submitLength);

      let blocks: Graphics2DBufferBlock[] = this._bufferBlocks;

      for (let i = 0; i < flength; i++) {
         let submit = submits.elements[i];
         let element = this._renderElements[i];
         if (i < submitLength) {
            if (!element) {
               element = GraphicsRenderData.createRenderElement2D();
               element.value2DShaderData = struct.spriteShaderData;
               element.owner = struct;
               this._renderElements[i] = element;
            }

            if (submit.material) {
               let mShaderData = submit.material.shaderData;
               submit._internalInfo.cloneTo(mShaderData);
               element.subShader = submit.material.shader.getSubShaderAt(0);
               element.materialShaderData = mShaderData;
               element.renderStateIsBySprite = false;
            } else {
               element.subShader = Shader2D.graphicsShader.getSubShaderAt(0);
               element.materialShaderData = submit._internalInfo.shaderData;
               element.renderStateIsBySprite = submit.renderStateIsBySprite;
            }
            
            let geometry = element.geometry;
            geometry.bufferState = submit.mesh.bufferState;
            geometry.clearRenderParams();

            let indexView = this._updateIndexViews(submit, geometry);
            let vertexBuffer = submit.mesh._buffer.vertexBuffer;
            blocks.push({ vertexs : submit.vertexs , indexView , vertexBuffer });
            this._updateGraphicsKeys(element, submit);
         } else {
            GraphicsRenderData.recoverRenderElement2D(element);
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
      indexView.geometry = geometry;
      submit.indexView = indexView;

      let data = indexView.getData();
      data.set(submit.indices);

      indexView.modify();
      // clear
      submit.indexCount = 0;
      submit.indices.length = 0;
      return indexView
      // geometry.setDrawElemenParams(indexView.length, indexView.start * 2);
   }

   // TODO
   private _updateGraphicsKeys(element: IRenderElement2D, submit: SubmitBase) {
      let key = submit._key.blendShader; // max 15

      // @ts-ignore
      element.type |= (key); // 15

      let useCustomMaterial = !!submit.material;
      // @ts-ignore
      element.type |= useCustomMaterial << 4;

      let mc = !useCustomMaterial && submit._internalInfo.materialClip;
      // @ts-ignore
      element.type |= mc << 5;

      let texture : BaseTexture = Texture2D.whiteTexture;
      let textureHost = submit._internalInfo.textureHost;
      if (textureHost) {
         texture = (textureHost as Texture).bitmap || textureHost as BaseTexture ;
      }
      let texKey = texture.id;
      // texKey = tex._id;
      // if ( tex && tex !== Texture2D.whiteTexture) {
      // }
      element.type |= texKey << 6;
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

   touchResources: IAutoExpiringResource[] = [];

   touchRes(res: IAutoExpiringResource) {
      res.referenceCount++;
      this.touchResources.push(res);
   }

}

/** @internal */
export class SubStructRender {
   private _subRenderPass: IRender2DPass;
   private _subStruct: IRenderStruct2D;
   private _sprite: Sprite;

   private _renderElement: IRenderElement2D = null;
   /** @internal 模拟sprite shaderdata */
   private _shaderData: ShaderData = null;
   private _handle: I2DPrimitiveDataHandle = null;
   private _submit: SubmitBase = null;
   private _internalInfo: GraphicsShaderInfo = null;

   constructor() {
      this._shaderData = LayaGL.renderDeviceFactory.createShaderData();
      this._handle = LayaGL.render2DRenderPassFactory.create2D2DPrimitiveDataHandle();
      this._submit = new SubmitBase;
      this._internalInfo = new GraphicsShaderInfo();
      this._submit._internalInfo = this._internalInfo;
      this._renderElement = GraphicsRenderData.createRenderElement2D();
      this._renderElement.value2DShaderData = this._shaderData;
      this._renderElement.subShader = Shader2D.graphicsShader.getSubShaderAt(0);
      this._renderElement.materialShaderData = this._submit._internalInfo.shaderData;
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
      this._handle.mask = sprite.mask?._struct;
      this._renderElement.owner = this._subStruct;
      this._renderElement.type = this._subStruct.blendMode;
   }

   updateQuat(oriRT: RenderTexture2D, destRT: RenderTexture2D) {
      var tex = destRT;
      if (tex) {
         var width = destRT.sourceWidth;
         var height = destRT.sourceHeight;
         var widthExtend = width - oriRT.sourceWidth;
         var heightExtend = height - oriRT.sourceHeight;
         if (width > 0 && height > 0) {
            let px = -widthExtend / 2;
            let py = -heightExtend / 2;
            let vSize = this._internalInfo.vertexSize;
            vSize.x = px;
            vSize.y = py;
            vSize.z = width;
            vSize.w = height;
            this._internalInfo.vertexSize = vSize;
         }
         this._renderElement.type = destRT._id << 6;
      }
      this._internalInfo.textureHost = destRT;
   }

   destroy(): void {
      this._renderElement.geometry = null;
      GraphicsRenderData.recoverRenderElement2D(this._renderElement);
      this._submit.destroy();
      this._submit = null;
      this._internalInfo = null;
      this._handle = null;
      this._subRenderPass = null;
      this._subStruct = null;
      this._sprite = null;
   }
}
