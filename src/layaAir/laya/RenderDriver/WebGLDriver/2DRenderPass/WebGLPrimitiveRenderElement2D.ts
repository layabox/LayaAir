import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import { IPrimitiveRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { WebGLShaderData } from "../../RenderModuleData/WebModuleData/WebGLShaderData";
import { WebGLEngine } from "../RenderDevice/WebGLEngine";
import { WebGLShaderInstance } from "../RenderDevice/WebGLShaderInstance";
import { WebglRenderContext2D } from "./WebGLRenderContext2D";
import { WebGLRenderelement2D } from "./WebGLRenderElement2D";

export class WebGLPrimitiveRenderElement2D extends WebGLRenderelement2D implements IPrimitiveRenderElement2D {
    primitiveShaderData: WebGLShaderData;

    protected _compileShader(context: WebglRenderContext2D) {
        var passes: ShaderPass[] = this.subShader._passes;
        this._shaderInstances.clear();

        for (var j: number = 0, m: number = passes.length; j < m; j++) {
            var pass: ShaderPass = passes[j];
            //NOTE:this will cause maybe a shader not render but do prepare before，but the developer can avoide this manual,for example shaderCaster=false.
            if (pass.pipelineMode !== context.pipelineMode)
                continue;

            var comDef = WebGLRenderelement2D._compileDefine;

            if (this.owner && this.owner.globalRenderData) {
                (this.owner.globalRenderData.globalShaderData as WebGLShaderData)._defineDatas.cloneTo(comDef);
            } else {
                context._globalConfigShaderData.cloneTo(comDef);
            }

            if (context.passData) {
                comDef.addDefineDatas(context.passData._defineDatas);
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
                pass.nodeCommonMap = this.nodeCommonMap;
            }

            if (this.materialShaderData)
                comDef.addDefineDatas(this.materialShaderData._defineDatas);

            if (this.primitiveShaderData) {
                pass.additionShaderData = ["Sprite2DGraphics"];
                comDef.addDefineDatas(this.primitiveShaderData.getDefineData());
            }

            var shaderIns = pass.withCompile(comDef, true) as WebGLShaderInstance;
            this._shaderInstances.add(shaderIns);
        }
    }


    renderByShaderInstance(shader: WebGLShaderInstance, context: WebglRenderContext2D): void {
        if (!shader.complete)
            return
        shader.bind();
        this._uploadGlobalAndPass(shader, context);

        this.value2DShaderData && shader.uploadUniforms(shader._sprite2DUniformParamsMap, this.value2DShaderData, true);
        this.materialShaderData && shader.uploadUniforms(shader._materialUniformParamsMap, this.materialShaderData, true);

        let encoder = shader._additionUniformParamsMaps.get("Sprite2DGraphics");
        this.primitiveShaderData && shader.uploadUniforms(encoder, this.primitiveShaderData, true);

        let shaderData = this.value2DShaderData;
        //blend
        if (!this.renderStateIsBySprite) {
            if (this.materialShaderData) {
                shaderData = this.materialShaderData;
            } else if (this.primitiveShaderData) {
                shaderData = this.primitiveShaderData;
            }
        }
        shader.uploadRenderStateBlendDepth(shaderData);
        shader.uploadRenderStateFrontFace(shaderData, false, context.invertY);

        WebGLEngine.instance.getDrawContext().drawGeometryElement(this.geometry);
    }
}
