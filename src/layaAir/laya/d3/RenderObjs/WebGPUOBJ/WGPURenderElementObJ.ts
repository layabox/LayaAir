import { WebGPUInternalRT } from "../../../RenderEngine/RenderEngine/WebGPUEngine/WebGPUInternalRT";
import { IBaseRenderNode } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IBaseRenderNode";
import { IRenderElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement";
import { IRenderGeometryElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { ShaderInstance } from "../../../RenderEngine/RenderShader/ShaderInstance";
import { SingletonList } from "../../../utils/SingletonList";
import { Transform3D } from "../../core/Transform3D";
import { WGPURenderContext3D } from "./WGPURenderContext3D";
import { WGPURenderPipelineInstance } from "./WGPURenderPipelineInstance";
import { WGPUShaderData } from "./WGPUShaderData";

export class WGPURenderElementObJ implements IRenderElement {

    _geometry: IRenderGeometryElement;

    _shaderInstances: SingletonList<ShaderInstance>;

    _materialShaderData: WGPUShaderData;

    _renderShaderData: WGPUShaderData;

    _transform: Transform3D;

    _isRender: boolean;

    _owner: IBaseRenderNode;

    _invertFront: boolean;

    constructor() {
        this._shaderInstances = new SingletonList();
    }

    _render(context: WGPURenderContext3D): void {
        var forceInvertFace: boolean = context.invertY;
        var updateMark: number = context.cameraUpdateMark;
        var sceneID = context.sceneID;
        var renderEncoder = context.commandEncoder;
        var sceneShaderData: WGPUShaderData = context.sceneShaderData;
        var cameraShaderData: WGPUShaderData = context.cameraShaderData;
        if (this._isRender) {
            var passes: ShaderInstance[] = this._shaderInstances.elements;
            for (var j: number = 0, m: number = this._shaderInstances.length; j < m; j++) {
                //@ts-ignore
                const shaderIns = passes[j] as WGPURenderPipelineInstance;
                if (!shaderIns.complete)
                    continue;

                let targets: WebGPUInternalRT = context.internalRT;
                let blendState = shaderIns.getBlendState(this._materialShaderData);
                let depthStencilState = shaderIns.getDepthStencilState(this._materialShaderData, targets);
                let primitiveState = shaderIns.getPrimitiveState(this._materialShaderData, forceInvertFace, this._invertFront, this._geometry.mode, this._geometry.indexFormat);
                let val = shaderIns.getVertexAttributeLayout(this._geometry.bufferState.vertexlayout);
                let pipeline = shaderIns.getGPURenderPipeline(blendState, depthStencilState, primitiveState, val, targets);
                //bind Pipeline
                renderEncoder.setPipeline(pipeline);

                //set BindGroup
                var switchUpdateMark: boolean = (updateMark !== shaderIns._uploadMark);
                var uploadScene: boolean = (shaderIns._uploadScene !== sceneID) || switchUpdateMark;
                //Scene
                if (uploadScene) {
                    sceneShaderData && shaderIns.uploadUniforms(shaderIns._sceneUniformParamsMap, sceneShaderData, renderEncoder);
                    shaderIns._uploadScene = sceneID;
                }
                //render
                if (this._renderShaderData) {
                    var uploadSprite3D: boolean = (shaderIns._uploadRender !== this._renderShaderData) || switchUpdateMark;
                    if (uploadSprite3D) {
                        shaderIns.uploadUniforms(shaderIns._spriteUniformParamsMap, this._renderShaderData, renderEncoder);
                        shaderIns._uploadRender = this._renderShaderData;
                    }
                }
                //camera
                var uploadCamera: boolean = shaderIns._uploadCameraShaderValue !== cameraShaderData || switchUpdateMark;
                if (uploadCamera) {
                    cameraShaderData && shaderIns.uploadUniforms(shaderIns._cameraUniformParamsMap, cameraShaderData, renderEncoder);
                    shaderIns._uploadCameraShaderValue = cameraShaderData;
                }
                //material
                var uploadMaterial: boolean = (shaderIns._uploadMaterial !== this._materialShaderData) || switchUpdateMark;
                if (uploadMaterial) {
                    shaderIns.uploadUniforms(shaderIns._materialUniformParamsMap, this._materialShaderData, renderEncoder);
                    shaderIns._uploadMaterial = this._materialShaderData;
                    //GlobalData
                    context.globalShaderData && shaderIns.uploadUniforms(shaderIns._materialUniformParamsMap, context.globalShaderData, renderEncoder);
                }
                renderEncoder.applyGeometry(this._geometry);
                // //renderData update
                // //TODO：Renderstate as a Object to less upload
                // shaderIns.uploadRenderStateBlendDepth(this._materialShaderData);
                // shaderIns.uploadRenderStateFrontFace(this._materialShaderData, forceInvertFace, this._invertFront);
                // this.drawGeometry(shaderIns);
            }
        }

    }
    _addShaderInstance(shader: ShaderInstance): void {
        this._shaderInstances.add(shader);
    }
    _clearShaderInstance(): void {
        this._shaderInstances.length = 0;
    }
    _destroy(): void {
        throw new Error("Method not implemented.");
    }

}