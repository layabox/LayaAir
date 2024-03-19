import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { SingletonList } from "../../../utils/SingletonList";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import { IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPURenderEngine } from "../RenderDevice/WebGPURenderEngine";
import { WebGPURenderGeometry } from "../RenderDevice/WebGPURenderGeometry";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUShaderInstance } from "../RenderDevice/WebGPUShaderInstance";
import { WebGPURenderContext2D } from "./WebGPURenderContext2D";

export class WebGPURenderelement2D implements IRenderElement2D {
    /** @internal */
    static _compileDefine: WebDefineDatas = new WebDefineDatas();
    protected _shaderInstances: SingletonList<WebGPUShaderInstance> = new SingletonList<WebGPUShaderInstance>();
    geometry: WebGPURenderGeometry;
    materialShaderData: WebGPUShaderData;
    value2DShaderData: WebGPUShaderData;
    subShader: SubShader;

    protected _compileShader(context: WebGPURenderContext2D) {
        const passes: ShaderPass[] = this.subShader._passes;
        this._shaderInstances.clear();

        for (let j = 0, m = passes.length; j < m; j++) {
            const pass: ShaderPass = passes[j];
            if (pass.pipelineMode !== context.pipelineMode) continue;

            const comDef = WebGPURenderelement2D._compileDefine;

            if (context.sceneData) {
                context.sceneData._defineDatas.cloneTo(comDef);
            } else context._globalConfigShaderData.cloneTo(comDef);
            const returnGamma = !(context._destRT) || ((context._destRT)._textures[0].gammaCorrection != 1);
            if (returnGamma)
                comDef.add(ShaderDefines2D.GAMMASPACE);
            else comDef.remove(ShaderDefines2D.GAMMASPACE);

            if (context.invertY)
                comDef.add(ShaderDefines2D.INVERTY);
            else comDef.remove(ShaderDefines2D.INVERTY);

            if (this.value2DShaderData)
                comDef.addDefineDatas(this.value2DShaderData.getDefineData());
            if (this.materialShaderData)
                comDef.addDefineDatas(this.materialShaderData._defineDatas);

            const shaderIns = pass.withCompile(comDef, true) as WebGPUShaderInstance;
            this._shaderInstances.add(shaderIns);
        }
    }

    _prepare(context: WebGPURenderContext2D) {
        this._compileShader(context);
    }

    _render(context: WebGPURenderContext2D) {
        if (this._shaderInstances.length === 1) {
            this.renderByShaderInstance(this._shaderInstances.elements[0], context)
        } else {
            const passes: WebGPUShaderInstance[] = this._shaderInstances.elements;
            for (let j = 0, m = this._shaderInstances.length; j < m; j++)
                this.renderByShaderInstance(passes[j], context);
        }
    }

    renderByShaderInstance(shader: WebGPUShaderInstance, context: WebGPURenderContext2D) {
    }

    destroy(): void {
    }
}