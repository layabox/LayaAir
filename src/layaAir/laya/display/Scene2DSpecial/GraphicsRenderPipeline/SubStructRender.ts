import { Config } from "../../../../Config";
import { LayaGL } from "../../../layagl/LayaGL";
import { Matrix } from "../../../maths/Matrix";
import { Rectangle } from "../../../maths/Rectangle";
import { Vector4 } from "../../../maths/Vector4";
import { IPrimitiveRenderElement2D } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { ShaderData } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { ISubStructRenderDataHandle } from "../../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { IRender2DPass } from "../../../RenderDriver/RenderModuleData/Design/2D/IRender2DPass";
import { IRenderStruct2D } from "../../../RenderDriver/RenderModuleData/Design/2D/IRenderStruct2D";
import { RenderTexture2D } from "../../../resource/RenderTexture2D";
import { Texture2D } from "../../../resource/Texture2D";
import { BlendModeHandler } from "../../../webgl/canvas/BlendMode";
import { Shader2D } from "../../../webgl/shader/d2/Shader2D";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import { Render2DProcessor } from "../../Render2DProcessor";
import { Sprite } from "../../Sprite";
import { BaseRender2DType } from "../../SpriteConst";

/** @internal */
export class SubStructRender {
   private _subRenderPass: IRender2DPass;
   private _subStruct: IRenderStruct2D;
   private _sprite: Sprite;

   private _renderElement: IPrimitiveRenderElement2D = null;
   /** @internal 模拟sprite shaderdata */
   private _spriteShaderData: ShaderData = null;
   private _primitiveShaderData: ShaderData = null;
   private _handle: ISubStructRenderDataHandle = null;
   private _blendMode: number = -1;
   private _textureHost: RenderTexture2D = null;
   private _vertexSize: Vector4 = new Vector4();
   /** @internal 渲染区域 */
   _rtRect: Rectangle = new Rectangle();
   _oriRect: Rectangle = new Rectangle();
   _logicMatrix: Matrix;

   private _needUpdateVertexSize: boolean = true;

   private _renderElements: IPrimitiveRenderElement2D[] = [];
   private _scaleX: number = 1;
   private _scaleY: number = 1;

   constructor() {
      this._spriteShaderData = LayaGL.renderDeviceFactory.createShaderData();
      this._primitiveShaderData = LayaGL.renderDeviceFactory.createShaderData();
      this._initPrimitiveShaderData();
      this._handle = LayaGL.render2DRenderPassFactory.createSubStructRenderDataHandle();
      this._renderElement = LayaGL.render2DRenderPassFactory.createPrimitiveRenderElement2D();
      this._renderElement.value2DShaderData = this._spriteShaderData;
      this._renderElement.subShader = Shader2D.graphicsShader.getSubShaderAt(0);
      this._renderElement.primitiveShaderData = this._primitiveShaderData;
      this._renderElement.nodeCommonMap = ["Sprite2D"];
      this._renderElement.geometry = Render2DProcessor.runner.inv_geometry;
      this._renderElement.renderStateIsBySprite = false;
      // Sub-structure composites can share the empty-texture key but carry independent RT state.
      this._renderElement.noBatch = true;
      BlendModeHandler.initBlendMode(this._spriteShaderData);
      this._renderElements = [this._renderElement];
   }

   private _initPrimitiveShaderData(): void {
      let data = this._primitiveShaderData;
      data.addDefine(ShaderDefines2D.TEXTURESHADER);
      data.addDefine(ShaderDefines2D.VERTEX_SIZE);
      if (Config.uvClipMode === "gpu")
         data.addDefine(ShaderDefines2D.UV_CLIP_GPU);
      data.setTexture(ShaderDefines2D.UNIFORM_SPRITETEXTURE, Texture2D.whiteTexture);
      BlendModeHandler.initBlendMode(data);
   }

   bind(sprite: Sprite, subRenderPass: IRender2DPass, subStruct: IRenderStruct2D): void {
      this._sprite = sprite;
      this._subRenderPass = subRenderPass;
      this._subStruct = subStruct;
      this._subStruct.spriteShaderData = this._spriteShaderData;
      this._subStruct.renderType = BaseRender2DType.graphics;

      subStruct.renderDataHandler = this._handle;
      subStruct.renderMatrix = sprite.globalTrans.getMatrix();
      subStruct.renderElements = this._renderElements;

      this._renderElement.owner = this._subStruct;
      this._syncRenderElementKeys();
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

   /** @internal */
   _clearRenderTexture() {
      if (this._textureHost) {
         this._primitiveShaderData.setTexture(ShaderDefines2D.UNIFORM_SPRITETEXTURE, Texture2D.whiteTexture);
         this._textureHost = null;
      }
   }

   /**
    * @internal
    * @param oriRT
    * @param destRT
    */
   _updateRenderTexture(oriRT: RenderTexture2D, destRT: RenderTexture2D) {
      this._handle.mask = this._sprite.mask?._struct;

      if (this._blendMode !== this._subStruct.blendMode) {
         this._blendMode = this._subStruct.blendMode;
         BlendModeHandler.setShaderData(this._subStruct.blendMode, this._spriteShaderData);
         BlendModeHandler.setShaderData(this._subStruct.blendMode, this._primitiveShaderData);
         this._syncRenderElementKeys();
      }

      if (this._textureHost == destRT && !this._needUpdateVertexSize)
         return;

      this._textureHost = destRT;
      this._updateTextureState(destRT);
      this._updateVertexSize(destRT);
      this._needUpdateVertexSize = false;
   }

   private _updateTextureState(destRT: RenderTexture2D): void {
      this._primitiveShaderData.setTexture(ShaderDefines2D.UNIFORM_SPRITETEXTURE, destRT || Texture2D.whiteTexture);
      if (destRT && destRT.gammaCorrection != 1)
         this._primitiveShaderData.addDefine(ShaderDefines2D.GAMMATEXTURE);
      else
         this._primitiveShaderData.removeDefine(ShaderDefines2D.GAMMATEXTURE);
      this._syncRenderElementKeys();
   }

   private _syncRenderElementKeys(): void {
      let defineBits = ShaderDefines2D.getPerElementDefineBits(this._primitiveShaderData);
      this._renderElement.typeKey = this._subStruct ? (this._subStruct.blendMode | defineBits) : defineBits;
      this._renderElement.textureKey = this._textureHost ? this._textureHost._id : 0;
   }

   private _updateVertexSize(destRT: RenderTexture2D): void {
      let rtRect = this._rtRect;
      let vSize = this._vertexSize;
      vSize.x = rtRect.x / this._scaleX;
      vSize.y = rtRect.y / this._scaleY;

      let width = destRT ? destRT.sourceWidth : 0;
      let height = destRT ? destRT.sourceHeight : 0;
      if (width > 0 && height > 0) {
         vSize.x = (rtRect.x - (width - rtRect.width) / 2) / this._scaleX;
         vSize.y = (rtRect.y - (height - rtRect.height) / 2) / this._scaleY;
         vSize.z = width / this._scaleX;
         vSize.w = height / this._scaleY;
      } else {
         vSize.z = rtRect.width / this._scaleX;
         vSize.w = rtRect.height / this._scaleY;
      }
      this._primitiveShaderData.setVector(ShaderDefines2D.UNIFORM_VERTEX_SIZE, vSize);
   }

   destroy(): void {
      this._renderElement.geometry = null;
      this._renderElement.primitiveShaderData = null;
      this._renderElement.value2DShaderData = null;
      this._renderElement.destroy();
      this._renderElement = null;
      this._renderElements.length = 0;

      this._primitiveShaderData.destroy();
      this._spriteShaderData.destroy();
      this._primitiveShaderData = null;
      this._spriteShaderData = null;

      this._handle.destroy();
      this._handle = null;
      this._subRenderPass = null;
      this._subStruct = null;
      this._sprite = null;
   }
}
