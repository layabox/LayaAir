import { CullMode, FrontFace } from "../../../RenderEngine/RenderEnum/CullMode";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { Transform3D } from "../../../d3/core/Transform3D";
import { SingletonList } from "../../../utils/SingletonList";
import { IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { WebBaseRenderNode } from "../../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPUInternalRT } from "../RenderDevice/WebGPUInternalRT";
import { WebGPURenderGeometry } from "../RenderDevice/WebGPURenderGeometry";
import { IRenderpipelineInfo, WebGPUBlendState, WebGPUBlendStateCache, WebGPUDepthStencilState, WebGPUDepthStencilStateCache, WebGPUFrontFace, WebGPURenderPipeline } from "../RenderDevice/WebGPURenderPipelineHelper";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUShaderInstance } from "../RenderDevice/WebGPUShaderInstance";
import { WebGPURenderContext3D } from "./WebGPURenderContext3D";

export class WebGPURenderElement3D implements IRenderElement3D, IRenderpipelineInfo {
    destroy(): void {
        throw new Error("Method not implemented.");
    }

    /** @internal */
    static _compileDefine: WebDefineDatas = new WebDefineDatas();

    materialShaderData: WebGPUShaderData;
    materialRenderQueue: number;
    renderShaderData: WebGPUShaderData;
    transform: Transform3D;
    isRender: boolean;
    owner: WebBaseRenderNode;
    subShader: SubShader;
    materialId: number;
    private _invertFrontFace: boolean;
    protected _shaderInstances: SingletonList<WebGPUShaderInstance> = new SingletonList<WebGPUShaderInstance>();
    geometry: WebGPURenderGeometry;
    blendState: WebGPUBlendStateCache;
    depthStencilState: WebGPUDepthStencilStateCache;
    cullMode: CullMode;
    frontFace: FrontFace;

    protected _getInvertFront(): boolean {
        let transform = this.owner?.transform;
        return transform ? transform._isFrontFaceInvert : false;
    }

    protected _compileShader(context: WebGPURenderContext3D) {
        var passes: ShaderPass[] = this.subShader._passes;
        this._clearShaderInstance();
        for (var j: number = 0, m: number = passes.length; j < m; j++) {
            var pass: ShaderPass = passes[j];
            //NOTE:this will cause maybe a shader not render but do prepare before，but the developer can avoide this manual,for example shaderCaster=false.
            if (pass.pipelineMode !== context.pipelineMode)
                continue;

            var comDef = WebGPURenderElement3D._compileDefine;

            if (context.sceneData) {
                context.sceneData._defineDatas.cloneTo(comDef);
            } else {
                context._globalConfigShaderData.cloneTo(comDef);
            }

            context.cameraData && comDef.addDefineDatas(context.cameraData._defineDatas);
            if (this.renderShaderData) {
                comDef.addDefineDatas(this.renderShaderData.getDefineData());
                pass.nodeCommonMap = this.owner._commonUniformMap;
            } else {
                pass.nodeCommonMap = null;
            }
            comDef.addDefineDatas(this.materialShaderData._defineDatas);

            var shaderIns = pass.withCompile(comDef) as WebGPUShaderInstance;

            //get shaderInstance
            //create ShaderInstance

            this._addShaderInstance(shaderIns);
        }
    }

    _addShaderInstance(shader: WebGPUShaderInstance) {
        this._shaderInstances.add(shader);
    }

    _clearShaderInstance() {
        this._shaderInstances.length = 0;
    }

    _preUpdatePre(context: WebGPURenderContext3D) {
        this._compileShader(context);
        this._invertFrontFace = this._getInvertFront();
    }

    _getWebGPURenderPipeline(shaderInstance: WebGPUShaderInstance, dest: WebGPUInternalRT, context: WebGPURenderContext3D): GPURenderPipeline {
        this._getBlendState(shaderInstance);
        this._getDepthStencilState(shaderInstance, dest);
        this._getCullFrontMode(this.materialShaderData, shaderInstance, this._invertFrontFace, context.invertY)
        return WebGPURenderPipeline.getRenderPipeline(this, shaderInstance, dest);
    }

    _getBlendState(shader: WebGPUShaderInstance): void {
        if ((shader._shaderPass as ShaderPass).statefirst)
            this.blendState = this._uploadRenderStateBlendByShader(this.materialShaderData, shader);
        else
            this.blendState = this._uploadRenderStateBlendByMaterial(this.materialShaderData, shader);
    }

    private _uploadRenderStateBlendByShader(shaderData: WebGPUShaderData, shader: WebGPUShaderInstance) {
        var datas: any = shaderData.getData();
        var renderState = (shader._shaderPass as ShaderPass).renderState;
        //blend
        var blend: any = (renderState.blend ?? datas[Shader3D.BLEND]) ?? RenderState.Default.blend;
        var blendState: any;
        switch (blend) {
            case RenderState.BLEND_DISABLE:
                blendState = WebGPUBlendState.getBlendState(blend, blendEquation, srcBlend, dstBlend, blendEquation, srcBlend, dstBlend);
                break;
            case RenderState.BLEND_ENABLE_ALL:
                var blendEquation = (renderState.blendEquation ?? datas[Shader3D.BLEND_EQUATION]) ?? RenderState.Default.blendEquation;
                var srcBlend = (renderState.srcBlend ?? datas[Shader3D.BLEND_SRC]) ?? RenderState.Default.srcBlend;
                var dstBlend = (renderState.dstBlend ?? datas[Shader3D.BLEND_DST]) ?? RenderState.Default.dstBlend;
                blendState = WebGPUBlendState.getBlendState(blend, blendEquation, srcBlend, dstBlend, blendEquation, srcBlend, dstBlend);
                break;
            case RenderState.BLEND_ENABLE_SEPERATE:
                var blendEquationRGB = (renderState.blendEquationRGB ?? datas[Shader3D.BLEND_EQUATION_RGB]) ?? RenderState.Default.blendEquationRGB;
                var blendEquationAlpha = (renderState.blendEquationAlpha ?? datas[Shader3D.BLEND_EQUATION_ALPHA]) ?? RenderState.Default.blendEquationAlpha;
                var srcRGB = (renderState.srcBlendRGB ?? datas[Shader3D.BLEND_SRC_RGB]) ?? RenderState.Default.srcBlendRGB;
                var dstRGB = (renderState.dstBlendRGB ?? datas[Shader3D.BLEND_DST_RGB]) ?? RenderState.Default.dstBlendRGB;
                var srcAlpha = (renderState.srcBlendAlpha ?? datas[Shader3D.BLEND_SRC_ALPHA]) ?? RenderState.Default.srcBlendAlpha;
                var dstAlpha = (renderState.dstBlendAlpha ?? datas[Shader3D.BLEND_DST_ALPHA]) ?? RenderState.Default.dstBlendAlpha;
                blendState = WebGPUBlendState.getBlendState(blend, blendEquationRGB, srcRGB, dstRGB, blendEquationAlpha, srcAlpha, dstAlpha);
                break;
        }
        return blendState;
    }

    private _uploadRenderStateBlendByMaterial(shaderData: WebGPUShaderData, shader: WebGPUShaderInstance) {
        //这个可以缓存ID  TODO 优化
        var datas: any = shaderData.getData();
        var blend: any = datas[Shader3D.BLEND];
        var blendState: any;
        blend = blend ?? RenderState.Default.blend;
        switch (blend) {
            case RenderState.BLEND_ENABLE_ALL:
                var blendEquation: any = datas[Shader3D.BLEND_EQUATION];
                blendEquation = blendEquation ?? RenderState.Default.blendEquation;
                var srcBlend: any = datas[Shader3D.BLEND_SRC];
                srcBlend = srcBlend ?? RenderState.Default.srcBlend;
                var dstBlend: any = datas[Shader3D.BLEND_DST];
                dstBlend = dstBlend ?? RenderState.Default.dstBlend;
                blendState = WebGPUBlendState.getBlendState(blend, blendEquation, srcBlend, dstBlend, blendEquation, srcBlend, dstBlend);
                break;
            case RenderState.BLEND_ENABLE_SEPERATE:
                var blendEquationRGB: any = datas[Shader3D.BLEND_EQUATION_RGB];
                blendEquationRGB = blendEquationRGB ?? RenderState.Default.blendEquationRGB;

                var blendEquationAlpha: any = datas[Shader3D.BLEND_EQUATION_ALPHA];
                blendEquationAlpha = blendEquationAlpha ?? RenderState.Default.blendEquationAlpha;

                var srcRGB: any = datas[Shader3D.BLEND_SRC_RGB];
                srcRGB = srcRGB ?? RenderState.Default.srcBlendRGB;

                var dstRGB: any = datas[Shader3D.BLEND_DST_RGB];
                dstRGB = dstRGB ?? RenderState.Default.dstBlendRGB;

                var srcAlpha: any = datas[Shader3D.BLEND_SRC_ALPHA];
                srcAlpha = srcAlpha ?? RenderState.Default.srcBlendAlpha;

                var dstAlpha: any = datas[Shader3D.BLEND_DST_ALPHA];
                dstAlpha = dstAlpha ?? RenderState.Default.dstBlendAlpha;
                blendState = WebGPUBlendState.getBlendState(blend, blendEquationRGB, srcRGB, dstRGB, blendEquationAlpha, srcAlpha, dstAlpha);
                break;
            case RenderState.BLEND_DISABLE:
                blendState = WebGPUBlendState.getBlendState(blend, blendEquation, srcBlend, dstBlend, blendEquation, srcBlend, dstBlend);
                break;
            default:
                throw "blendState set error"
        }
        return blendState;
    }

    _getDepthStencilState(shader: WebGPUShaderInstance, dest: WebGPUInternalRT): void {
        if ((shader._shaderPass as ShaderPass).statefirst)
            this.depthStencilState = this._uploadRenderStateDepthByShader(this.materialShaderData, shader, dest);
        else
            this.depthStencilState = this._uploadRenderStateDepthByMaterial(this.materialShaderData, dest);
    }

    private _uploadRenderStateDepthByShader(shaderData: WebGPUShaderData, shader: WebGPUShaderInstance, dest: WebGPUInternalRT) {
        var datas: any = shaderData.getData();
        var renderState: RenderState = (<ShaderPass>shader._shaderPass).renderState;
        var depthWrite: any = (renderState.depthWrite ?? datas[Shader3D.DEPTH_WRITE]) ?? RenderState.Default.depthWrite;

        var depthTest: any = (renderState.depthTest ?? datas[Shader3D.DEPTH_TEST]) ?? RenderState.Default.depthTest;
        return WebGPUDepthStencilState._getDepthStencilState(dest.depthStencilFormat, depthWrite, depthTest);
        //Stencil
        // var stencilWrite: any = (renderState.stencilWrite ?? datas[Shader3D.STENCIL_WRITE]) ?? RenderState.Default.stencilWrite;
        // var stencilWrite: any = (renderState.stencilWrite ?? datas[Shader3D.STENCIL_WRITE]) ?? RenderState.Default.stencilWrite;
        // var stencilTest: any = (renderState.stencilTest ?? datas[Shader3D.STENCIL_TEST]) ?? RenderState.Default.stencilTest;
        // RenderStateContext.setStencilMask(stencilWrite);
        // if (stencilWrite) {
        // 	var stencilOp: any = (renderState.stencilOp ?? datas[Shader3D.STENCIL_Op]) ?? RenderState.Default.stencilOp;
        // 	RenderStateContext.setstencilOp(stencilOp.x, stencilOp.y, stencilOp.z);
        // }
        // if (stencilTest == RenderState.STENCILTEST_OFF) {
        // 	RenderStateContext.setStencilTest(false);
        // } else {
        // 	var stencilRef: any = (renderState.stencilRef ?? datas[Shader3D.STENCIL_Ref]) ?? RenderState.Default.stencilRef;
        // 	RenderStateContext.setStencilTest(true);
        // 	RenderStateContext.setStencilFunc(stencilTest, stencilRef);
        // }
    }

    private _uploadRenderStateDepthByMaterial(shaderData: WebGPUShaderData, dest: WebGPUInternalRT) {
        var datas: any = shaderData.getData();
        // depth
        var depthWrite = datas[Shader3D.DEPTH_WRITE];
        depthWrite = depthWrite ?? RenderState.Default.depthWrite;

        var depthTest = datas[Shader3D.DEPTH_TEST];
        depthTest = depthTest ?? RenderState.Default.depthTest;
        return WebGPUDepthStencilState._getDepthStencilState(dest.depthStencilFormat, depthWrite, depthTest);
        // if (depthTest === RenderState.DEPTHTEST_OFF) {
        // 	RenderStateContext.setDepthTest(false);
        // }
        // else {
        // 	RenderStateContext.setDepthTest(true);
        // 	RenderStateContext.setDepthFunc(depthTest);
        // }

        // //Stencil
        // var stencilWrite = datas[Shader3D.STENCIL_WRITE];
        // stencilWrite = stencilWrite ?? RenderState.Default.stencilWrite;
        // RenderStateContext.setStencilMask(stencilWrite);
        // if (stencilWrite) {
        // 	var stencilOp = datas[Shader3D.STENCIL_Op];
        // 	stencilOp = stencilOp ?? RenderState.Default.stencilOp;
        // 	RenderStateContext.setstencilOp(stencilOp.x, stencilOp.y, stencilOp.z);
        // }

        // var stencilTest = datas[Shader3D.STENCIL_TEST];
        // stencilTest = stencilTest ?? RenderState.Default.stencilTest;
        // if (stencilTest == RenderState.STENCILTEST_OFF) {
        // 	RenderStateContext.setStencilTest(false);
        // }
        // else {
        // 	var stencilRef = datas[Shader3D.STENCIL_Ref];
        // 	stencilRef = stencilRef ?? RenderState.Default.stencilRef;
        // 	RenderStateContext.setStencilTest(true);
        // 	RenderStateContext.setStencilFunc(stencilTest, stencilRef);
        // }
    }

    _getCullFrontMode(shaderData: WebGPUShaderData, shader: WebGPUShaderInstance, isTarget: boolean, invertFront: boolean) {
        var renderState: RenderState = (<ShaderPass>shader._shaderPass).renderState;
        var datas: any = shaderData.getData();
        var cull: any = datas[Shader3D.CULL];
        if ((<ShaderPass>shader._shaderPass).statefirst) {
            cull = renderState.cull ?? cull;
        }
        cull = cull ?? RenderState.Default.cull;
        switch (cull) {
            case RenderState.CULL_NONE:
                this.cullMode = CullMode.Off;
                if (isTarget != invertFront)
                    this.frontFace = FrontFace.CCW;
                else
                    this.frontFace = FrontFace.CW;
                break;
            case RenderState.CULL_FRONT:
                this.cullMode = CullMode.Front;
                if (isTarget == invertFront)
                    this.frontFace = FrontFace.CCW;
                else
                    this.frontFace = FrontFace.CW;
                break;
            case RenderState.CULL_BACK:
            default:
                this.cullMode = CullMode.Back;
                if (isTarget != invertFront)
                    this.frontFace = FrontFace.CCW;
                else
                    this.frontFace = FrontFace.CW;
                break;
        }
    }

    _render(context: WebGPURenderContext3D) {
        var sceneShaderData = context.sceneData as WebGPUShaderData;
        var cameraShaderData = context.cameraData as WebGPUShaderData;
        if (this.isRender) {
            var passes: WebGPUShaderInstance[] = this._shaderInstances.elements;
            for (var j: number = 0, m: number = this._shaderInstances.length; j < m; j++) {
                //@ts-ignore
                const shaderIns = passes[j] as WGPURenderPipelineInstance;
                if (!shaderIns.complete)
                    continue;
                let pipeline = this._getWebGPURenderPipeline(shaderIns, context._destRT, context);
                context._renderCommand.setPipeline(pipeline);
                //scene
                sceneShaderData && sceneShaderData._uploadUniform(shaderIns.uniformSetMap[0], context._renderCommand);
                //camera
                cameraShaderData && cameraShaderData._uploadUniform(shaderIns.uniformSetMap[1], context._renderCommand);
                //render
                this.renderShaderData && this.renderShaderData._uploadUniform(shaderIns.uniformSetMap[2], context._renderCommand);
                //material
                this.materialShaderData && this.materialShaderData._uploadUniform(shaderIns.uniformSetMap[3], context._renderCommand);
                //draw
                context._renderCommand.applyGeometry(this.geometry);
            }
        }
    }
}