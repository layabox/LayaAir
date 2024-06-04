import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { SingletonList } from "../../../utils/SingletonList";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import { IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGLShaderData } from "../../RenderModuleData/WebModuleData/WebGLShaderData";
import { WebGLEngine } from "../RenderDevice/WebGLEngine";
import { WebGLRenderGeometryElement } from "../RenderDevice/WebGLRenderGeometryElement";
import { WebGLShaderInstance } from "../RenderDevice/WebGLShaderInstance";
import { WebglRenderContext2D } from "./WebGLRenderContext2D";

export class WebGLRenderelement2D implements IRenderElement2D {
    renderStateIsBySprite: boolean = true;


    /** @internal */
    static _compileDefine: WebDefineDatas = new WebDefineDatas();
    protected _shaderInstances: SingletonList<WebGLShaderInstance> = new SingletonList<WebGLShaderInstance>();
    geometry: WebGLRenderGeometryElement;
    materialShaderData: WebGLShaderData;
    value2DShaderData: WebGLShaderData;
    subShader: SubShader;

    protected _compileShader(context: WebglRenderContext2D) {
        var passes: ShaderPass[] = this.subShader._passes;
        this._shaderInstances.clear();

        for (var j: number = 0, m: number = passes.length; j < m; j++) {
            var pass: ShaderPass = passes[j];
            //NOTE:this will cause maybe a shader not render but do prepare before，but the developer can avoide this manual,for example shaderCaster=false.
            if (pass.pipelineMode !== context.pipelineMode)
                continue;

            var comDef = WebGLRenderelement2D._compileDefine;

            if (context.sceneData) {
                context.sceneData._defineDatas.cloneTo(comDef);
            } else {
                context._globalConfigShaderData.cloneTo(comDef);
            }
            let returnGamma: boolean = !(context._destRT) || ((context._destRT)._textures[0].gammaCorrection != 1);
            if (returnGamma) {
                comDef.add(ShaderDefines2D.GAMMASPACE);
            } else {
                comDef.remove(ShaderDefines2D.GAMMASPACE);
            }

            if (context.invertY) {
                comDef.add(ShaderDefines2D.INVERTY);
            } else {
                comDef.remove(ShaderDefines2D.INVERTY);
            }

            if (this.value2DShaderData) {
                comDef.addDefineDatas(this.value2DShaderData.getDefineData());
            }
            if (this.materialShaderData)
                comDef.addDefineDatas(this.materialShaderData._defineDatas);

            var shaderIns = pass.withCompile(comDef, true) as WebGLShaderInstance;
            this._shaderInstances.add(shaderIns);
        }
    }
    _prepare(context: WebglRenderContext2D) {
        this._compileShader(context);
    }

    _render(context: WebglRenderContext2D) {
        if (this._shaderInstances.length == 1) {
            this.renderByShaderInstance(this._shaderInstances.elements[0], context)
        } else {
            var passes: WebGLShaderInstance[] = this._shaderInstances.elements;
            for (var j: number = 0, m: number = this._shaderInstances.length; j < m; j++) {
                this.renderByShaderInstance(passes[j], context);
            }
        }
    }

    renderByShaderInstance(shader: WebGLShaderInstance, context: WebglRenderContext2D) {
        if (!shader.complete)
            return
        shader.bind();
        shader.uploadUniforms(shader._sprite2DUniformParamsMap, this.value2DShaderData, true);
        context.sceneData && shader.uploadUniforms(shader._sceneUniformParamsMap, context.sceneData, true);
        this.materialShaderData && shader.uploadUniforms(shader._materialUniformParamsMap, this.materialShaderData, true);
        //blend
        if (this.renderStateIsBySprite || !this.materialShaderData) {
            shader.uploadRenderStateBlendDepth(this.value2DShaderData);
            shader.uploadRenderStateFrontFace(this.value2DShaderData, false, context.invertY);
        } else {
            shader.uploadRenderStateBlendDepth(this.materialShaderData);
            shader.uploadRenderStateFrontFace(this.materialShaderData, false, context.invertY);
        }

        WebGLEngine.instance.getDrawContext().drawGeometryElement(this.geometry)
    }
    destroy(): void {
        //TODO
    }


}