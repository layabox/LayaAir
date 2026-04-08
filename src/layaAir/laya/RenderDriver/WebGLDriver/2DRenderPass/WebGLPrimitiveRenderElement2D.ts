import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import { IPrimitiveRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { WebGLShaderData } from "../../RenderModuleData/WebModuleData/WebGLShaderData";
import { WebGLEngine } from "../RenderDevice/WebGLEngine";
import { WebGLShaderInstance } from "../RenderDevice/WebGLShaderInstance";
import { WebglRenderContext2D } from "./WebGLRenderContext2D";
import { WebGLRenderElement2D } from "./WebGLRenderElement2D";

export class WebGLPrimitiveRenderElement2D extends WebGLRenderElement2D implements IPrimitiveRenderElement2D {
    typeKey: number = 0;
    textureKey: number = 0;

    private static _additionShaderData: string[] = ["Sprite2DGraphics"];

    private _primitiveShaderData: WebGLShaderData;
    public get primitiveShaderData(): WebGLShaderData { return this._primitiveShaderData; }
    public set primitiveShaderData(value: WebGLShaderData) {
        if (this._primitiveShaderData !== value) {
            this._unregisterDefineFlag(this._primitiveShaderData);
            this._primitiveShaderData = value;
            this._registerDefineFlag(value);
            this._dirtyVersion++;
        }
    }

    protected _compileShader(context: WebglRenderContext2D) {
        var passes: ShaderPass[] = this.subShader._passes;
        let entry = this._curCacheEntry;
        let renderCount = 0;

        for (var j: number = 0, m: number = passes.length; j < m; j++) {
            var pass: ShaderPass = passes[j];
            //NOTE:this will cause maybe a shader not render but do prepare before，but the developer can avoide this manual,for example shaderCaster=false.
            if (pass.pipelineMode !== context.pipelineMode)
                continue;

            var comDef = WebGLRenderElement2D._compileDefine;

            if (this.globalShaderData) {
                this.globalShaderData._defineDatas.cloneTo(comDef);
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

            if (this._primitiveShaderData) {
                pass.additionShaderData = WebGLPrimitiveRenderElement2D._additionShaderData;
                comDef.addDefineDatas(this._primitiveShaderData.getDefineData());
            }

            var shaderIns = pass.withCompile(comDef, true) as WebGLShaderInstance;
            entry.shaderInss[renderCount++] = shaderIns;
        }
        entry.shaderInss.length = renderCount;
    }


    override _render(context: WebglRenderContext2D) {
        let inss = this._curCacheEntry.shaderInss;
        let count = inss.length;

        if (count === 1) {
            let shaderIns = inss[0];
            let clipInfo = this.owner.getClipInfo();
            if (this.typeKey === context._prevTypeKey
                && this.textureKey === context._prevTextureKey
                && clipInfo === context._prevClip
                && shaderIns === context._prevShaderIns) {
                // 快速路径：状态完全相同，只执行 draw
                WebGLEngine.instance.getDrawContext().drawGeometryElement(this.geometry);
            } else {
                this.renderByShaderInstance(shaderIns, context);
            }

            // 更新 context 上的 prev state 供下一个元素使用
            context._prevTypeKey = this.typeKey;
            context._prevTextureKey = this.textureKey;
            context._prevClip = clipInfo;
            context._prevShaderIns = shaderIns;
        } else {
            for (let j = 0; j < count; j++) {
                this.renderByShaderInstance(inss[j], context);
            }
        }
    }

    renderByShaderInstance(shader: WebGLShaderInstance, context: WebglRenderContext2D): void {
        if (!shader.complete || !this.geometry)
            return
        shader.bind();
        this._uploadGlobalAndPass(shader, context);

        this.value2DShaderData && shader.uploadUniforms(shader._sprite2DUniformParamsMap, this.value2DShaderData, true);
        this.materialShaderData && shader.uploadUniforms(shader._materialUniformParamsMap, this.materialShaderData, true);

        let encoder = shader._additionUniformParamsMaps.get("Sprite2DGraphics");
        encoder && this._primitiveShaderData && shader.uploadUniforms(encoder, this._primitiveShaderData, true);

        let shaderData = this.value2DShaderData;
        //blend
        if (!this.renderStateIsBySprite) {
            if (this.materialShaderData) {
                shaderData = this.materialShaderData;
            } else if (this._primitiveShaderData) {
                shaderData = this._primitiveShaderData;
            }
        }
        shader.uploadRenderStateBlendDepth(shaderData);
        shader.uploadRenderStateFrontFace(shaderData, false, context.invertY);

        WebGLEngine.instance.getDrawContext().drawGeometryElement(this.geometry);
    }

    destroy(): void {
        this._unregisterDefineFlag(this._primitiveShaderData);
        this._primitiveShaderData = null;
        super.destroy();
    }
}
