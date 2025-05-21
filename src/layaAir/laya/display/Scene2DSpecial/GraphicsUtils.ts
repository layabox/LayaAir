import { LayaGL } from "../../layagl/LayaGL";
import { IRenderElement2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { ShaderData } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { I2DPrimitiveDataHandle, IBufferDataView, VertexBufferBlock } from "../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { IRender2DPass } from "../../RenderDriver/RenderModuleData/Design/2D/IRender2DPass";
import { IRenderStruct2D } from "../../RenderDriver/RenderModuleData/Design/2D/IRenderStruct2D";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { IAutoExpiringResource } from "../../renders/ResNeedTouch";
import { Material } from "../../resource/Material";
import { RenderTexture2D } from "../../resource/RenderTexture2D";
import { Texture } from "../../resource/Texture";
import { FastSinglelist } from "../../utils/SingletonList";
import { Stat } from "../../utils/Stat";
import { BlendMode } from "../../webgl/canvas/BlendMode";
import { Shader2D } from "../../webgl/shader/d2/Shader2D";
import { ShaderDefines2D } from "../../webgl/shader/d2/ShaderDefines2D";
import { GraphicsShaderInfo } from "../../webgl/shader/d2/value/GraphicsShaderInfo";
import { SubmitBase } from "../../webgl/submit/SubmitBase";
import { GraphicsMesh, MeshBlockInfo } from "../../webgl/utils/GraphicsMesh";
import { Render2DProcessor } from "../Render2DProcessor";
import { Sprite } from "../Sprite";
import { GraphicsRunner } from "./GraphicsRunner";

export class GraphicsRenderData {

   static _pool: IRenderElement2D[] = [];

   static createRenderElement2D() {
      if (this._pool.length > 0) {
         return this._pool.pop();
      }
      let element = LayaGL.render2DRenderPassFactory.createRenderElement2D();
      element.geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
      element.geometry.indexFormat = IndexFormat.UInt16;
      element.renderStateIsBySprite = false;
      element.nodeCommonMap = ["Sprite2D"];
      return element;
   }

   static recoverRenderElement2D(value: IRenderElement2D) {
      if (!value) return;
      value.geometry.clearRenderParams();
      value.geometry.bufferState = null;
      value.materialShaderData = null;
      value.value2DShaderData = null;
      value.owner = null;
      value.subShader = null;
      value.renderStateIsBySprite = false;
      this._pool.push(value);
   }

   /** @internal */
   _renderElements: IRenderElement2D[] = [];

   /**@internal */
   _submits: FastSinglelist<SubmitBase> = new FastSinglelist;

   clear(): void {
      let len = this._submits.length;
      for (let i = 0; i < len; i++) {
         this._submits.elements[i].clear();
      }
      this._submits.length = 0;
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

      let vertexStruct:VertexBufferBlock[] = [];

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
               element.subShader = submit.material.shader.getSubShaderAt(0);
               element.materialShaderData = submit.material.shaderData;
               element.renderStateIsBySprite = false;
            } else {
               element.subShader = Shader2D.graphicsShader.getSubShaderAt(0);
               element.materialShaderData = submit._internalInfo.shaderData;
               element.renderStateIsBySprite = submit.renderStateIsBySprite;
            }

            element.geometry.bufferState = submit.mesh.bufferState;
            element.geometry.clearRenderParams();
            
            let infos = submit.infos;

            let start = 0;
            let end = 0;
            let lastView:IBufferDataView = null;
            for (let i = 0, n = infos.length; i < n; i++) {
               let info = infos[i];
               let indexViews = info.indexViews;
               
               for (let j = 0, m = indexViews.length; j < m; j ++) {
                  let view = indexViews[j];
                  if (!lastView) {
                     lastView = view;
                     start = view.start;
                     end = view.count + start;
                  }else{
                     let lastEnd = lastView.length + lastView.start;
                     if (lastEnd === view.start) {
                        lastView = view;
                        end = view.count + view.start;
                     } else {
                        element.geometry.setDrawElemenParams(end - start , start * 2);
                        start = view.start;
                        end = start + view.count;
                        lastView = view;
                     }
                  }
               }
               
               vertexStruct.push({
                  positions:info.positions,
                  vertexViews:info.vertexViews
               });
            }
            
            element.geometry.setDrawElemenParams(end - start , start * 2);
         } else {
            GraphicsRenderData.recoverRenderElement2D(element);
         }
      }

      this._renderElements.length = submitLength;
      //reset
      if (needUpdate) {
         struct.renderElements = this._renderElements;
      }

      handle.applyVertexBufferBlock(vertexStruct);
   }

   // getDrawElementParams(indexViews: IBufferDataView[]): number[] {
   //    let params: number[] = [];
   //    if (!indexViews || indexViews.length === 0) return params;

   //    let start = indexViews[0].start;
   //    let end = start + indexViews[0].length;
   //    let lastView = indexViews[0];
   //    for (let i = 1, n = indexViews.length; i < n; i++) {
   //       let view = indexViews[i];
   //       let lastEnd = lastView.length + lastView.start;
   //       if (lastEnd === view.start) {
   //          lastView = view;
   //          end = view.count + view.start;
   //       } else {
   //          params.push(start * 2, end - start);
   //          start = view.start;
   //          end = start + view.count;
   //          lastView = view;
   //       }
   //    }

   //    params.push(start * 2, end - start);

   //    return params;
   // }

   createSubmit(runner: GraphicsRunner, mesh: GraphicsMesh, material: Material): SubmitBase {
      let elements = this._submits.elements;
      let submit: SubmitBase = null;
      if (elements.length > this._submits.length) {
         submit = elements[this._submits.length];
         submit.update(runner, mesh, material);
      } else
         submit = SubmitBase.create(runner, mesh, material);

      this._submits.add(submit);
      return submit;
   }

   mustTouchRes: IAutoExpiringResource[] = [];
   randomTouchRes: IAutoExpiringResource[] = [];

   touchRes(res: IAutoExpiringResource) {
      if (res.isRandomTouch) {
         this.randomTouchRes.push(res);
      } else {
         this.mustTouchRes.push(res);
      }
   }

}

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

      BlendMode.initBlendMode(this._shaderData);
      this._internalInfo.enableVertexSize = true;
   }

   bind(sprite: Sprite, subRenderPass: IRender2DPass, subStruct: IRenderStruct2D): void {
      this._sprite = sprite;
      this._subRenderPass = subRenderPass;
      this._subStruct = subStruct;
      this._subStruct.spriteShaderData = this._shaderData;
      this._submit.material = sprite.material;

      subStruct.renderDataHandler = this._handle;
      subStruct.renderElements = [this._renderElement];
      this._handle.mask = sprite.mask?._struct;
      this._renderElement.owner = this._subStruct;

      let info = Render2DProcessor.runner.inv_uv;
      let view = info.indexViews[0];
      this._renderElement.geometry.bufferState = info.mesh.bufferState;
      this._renderElement.geometry.setDrawElemenParams(view.length, view.start * 2);
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
      }
      this._internalInfo.textureHost = destRT;
   }

   destroy(): void {
      GraphicsRenderData.recoverRenderElement2D(this._renderElement);
      // this._internalInfo.destroy();
      this._submit.destroy();
      this._submit = null;
      this._internalInfo = null;
      this._handle = null;
      this._subRenderPass = null;
      this._subStruct = null;
      this._sprite = null;
   }
}
