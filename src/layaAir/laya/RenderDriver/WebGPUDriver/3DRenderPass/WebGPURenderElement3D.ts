import { CullMode, FrontFace } from "../../../RenderEngine/RenderEnum/CullMode";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { Transform3D } from "../../../d3/core/Transform3D";
import { IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { WebBaseRenderNode } from "../../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPUInternalRT } from "../RenderDevice/WebGPUInternalRT";
import { WebGPURenderGeometry } from "../RenderDevice/WebGPURenderGeometry";
import { IRenderPipelineInfo, WebGPUBlendState, WebGPUBlendStateCache, WebGPUDepthStencilState, WebGPUDepthStencilStateCache, WebGPURenderPipeline } from "../RenderDevice/WebGPURenderPipelineHelper";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUShaderInstance } from "../RenderDevice/WebGPUShaderInstance";
import { WebGPUGlobal } from "../RenderDevice/WebGPUStatis/WebGPUGlobal";
import { WebGPURenderContext3D } from "./WebGPURenderContext3D";

export class WebGPURenderElement3D implements IRenderElement3D, IRenderPipelineInfo {
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
    geometry: WebGPURenderGeometry;
    blendState: WebGPUBlendStateCache;
    depthStencilState: WebGPUDepthStencilStateCache;
    cullMode: CullMode;
    frontFace: FrontFace;
    private _invertFrontFace: boolean;

    private _shaderKey: string = '';
    private _shaderInstances: WebGPUShaderInstance[] = [];

    private static _shaderArray: WebGPUShaderInstance[] = [];

    globalId: number;
    objectName: string = 'WebGPURenderElement3D';

    constructor() {
        //this.globalId = WebGPUGlobal.getId(this);
    }

    protected _getInvertFront(): boolean {
        const transform = this.owner?.transform;
        return transform ? transform._isFrontFaceInvert : false;
    }

    /**
     * 编译着色器
     * @param context 
     */
    protected _compileShader(context: WebGPURenderContext3D) {
        const passes: ShaderPass[] = this.subShader._passes;

        const comDef = WebGPURenderElement3D._compileDefine;
        //将场景或全局配置的定义一次性准备好
        if (context.sceneData) {
            context.sceneData._defineDatas.cloneTo(comDef);
        } else context.globalConfigShaderData.cloneTo(comDef);

        //如果存在，添加相机数据定义
        if (context.cameraData)
            comDef.addDefineDatas(context.cameraData._defineDatas);

        let shaderKey = '';
        let shaderCount = 0;
        for (let i = 0, m = passes.length; i < m; i++) {
            const pass: ShaderPass = passes[i];
            //NOTE: this will cause maybe a shader not render but do prepare before，
            //but the developer can avoide this manual, for example: shaderCaster = false.
            if (pass.pipelineMode !== context.pipelineMode) continue;

            if (this.renderShaderData && this.owner) {
                comDef.addDefineDatas(this.renderShaderData.getDefineData());
                pass.nodeCommonMap = this.owner._commonUniformMap;
            } else pass.nodeCommonMap = null;
            comDef.addDefineDatas(this.materialShaderData._defineDatas);

            //获取shaderInstance，会查找缓存，如果没有则创建
            const shaderInstance = pass.withCompile(comDef) as WebGPUShaderInstance;
            WebGPURenderElement3D._shaderArray[shaderCount++] = shaderInstance;
            shaderKey += shaderInstance.globalId + '_';

            context.sceneData?.createUniformBuffer(shaderInstance.uniformInfo[0], true);
            context.cameraData?.createUniformBuffer(shaderInstance.uniformInfo[1], true);
            this.renderShaderData?.createUniformBuffer(shaderInstance.uniformInfo[2]);
            this.materialShaderData?.createUniformBuffer(shaderInstance.uniformInfo[3]);
        }
        //shaderKey发生变化，说明Shader被重新编译了（条件发生了变化），清理shaderInstance和bindGroup缓存
        if (this._shaderKey !== shaderKey) {
            this._shaderInstances.length = 0;
            for (let i = 0; i < shaderCount; i++)
                this._shaderInstances[i] = WebGPURenderElement3D._shaderArray[i];
            this._shaderKey = shaderKey;
            if (this.renderShaderData)
                this.renderShaderData.clearBindGroup();
            if (this.materialShaderData)
                this.materialShaderData.clearBindGroup();
        }
    }

    private _getWebGPURenderPipeline(shaderInstance: WebGPUShaderInstance,
        dest: WebGPUInternalRT, context: WebGPURenderContext3D, entries: any): GPURenderPipeline {
        this._getBlendState(shaderInstance);
        this._getDepthStencilState(shaderInstance, dest);
        this._getCullFrontMode(this.materialShaderData, shaderInstance, this._invertFrontFace, context.invertY);
        return WebGPURenderPipeline.getRenderPipeline(this, shaderInstance, dest, entries);
    }

    private _getBlendState(shader: WebGPUShaderInstance) {
        if ((shader._shaderPass as ShaderPass).statefirst)
            this.blendState = this._getRenderStateBlendByShader(this.materialShaderData, shader);
        else this.blendState = this._getRenderStateBlendByMaterial(this.materialShaderData, shader);
    }

    private _getRenderStateBlendByShader(shaderData: WebGPUShaderData, shader: WebGPUShaderInstance) {
        const datas: any = shaderData.getData();
        const renderState = (shader._shaderPass as ShaderPass).renderState;
        const blend: any = (renderState.blend ?? datas[Shader3D.BLEND]) ?? RenderState.Default.blend;
        let blendState: any;
        switch (blend) {
            case RenderState.BLEND_DISABLE:
                blendState = WebGPUBlendState.getBlendState(blend,
                    RenderState.BLENDEQUATION_ADD,
                    RenderState.BLENDPARAM_ONE,
                    RenderState.BLENDPARAM_ZERO,
                    RenderState.BLENDEQUATION_ADD,
                    RenderState.BLENDPARAM_ONE,
                    RenderState.BLENDPARAM_ZERO,
                );
                break;
            case RenderState.BLEND_ENABLE_ALL:
                const blendEquation = (renderState.blendEquation ?? datas[Shader3D.BLEND_EQUATION]) ?? RenderState.Default.blendEquation;
                const srcBlend = (renderState.srcBlend ?? datas[Shader3D.BLEND_SRC]) ?? RenderState.Default.srcBlend;
                const dstBlend = (renderState.dstBlend ?? datas[Shader3D.BLEND_DST]) ?? RenderState.Default.dstBlend;
                blendState = WebGPUBlendState.getBlendState(blend, blendEquation, srcBlend, dstBlend, blendEquation, srcBlend, dstBlend);
                break;
            case RenderState.BLEND_ENABLE_SEPERATE:
                const blendEquationRGB = (renderState.blendEquationRGB ?? datas[Shader3D.BLEND_EQUATION_RGB]) ?? RenderState.Default.blendEquationRGB;
                const blendEquationAlpha = (renderState.blendEquationAlpha ?? datas[Shader3D.BLEND_EQUATION_ALPHA]) ?? RenderState.Default.blendEquationAlpha;
                const srcRGB = (renderState.srcBlendRGB ?? datas[Shader3D.BLEND_SRC_RGB]) ?? RenderState.Default.srcBlendRGB;
                const dstRGB = (renderState.dstBlendRGB ?? datas[Shader3D.BLEND_DST_RGB]) ?? RenderState.Default.dstBlendRGB;
                const srcAlpha = (renderState.srcBlendAlpha ?? datas[Shader3D.BLEND_SRC_ALPHA]) ?? RenderState.Default.srcBlendAlpha;
                const dstAlpha = (renderState.dstBlendAlpha ?? datas[Shader3D.BLEND_DST_ALPHA]) ?? RenderState.Default.dstBlendAlpha;
                blendState = WebGPUBlendState.getBlendState(blend, blendEquationRGB, srcRGB, dstRGB, blendEquationAlpha, srcAlpha, dstAlpha);
                break;
            default:
                throw "blendState set error";
        }
        return blendState;
    }

    private _getRenderStateBlendByMaterial(shaderData: WebGPUShaderData, shader: WebGPUShaderInstance) {
        //这个可以缓存ID TODO 优化
        const datas: any = shaderData.getData();
        let blend: any = datas[Shader3D.BLEND];
        let blendState: any;
        blend = blend ?? RenderState.Default.blend;
        switch (blend) {
            case RenderState.BLEND_DISABLE:
                blendState = WebGPUBlendState.getBlendState(blend,
                    RenderState.BLENDEQUATION_ADD,
                    RenderState.BLENDPARAM_ONE,
                    RenderState.BLENDPARAM_ZERO,
                    RenderState.BLENDEQUATION_ADD,
                    RenderState.BLENDPARAM_ONE,
                    RenderState.BLENDPARAM_ZERO,
                );
                break;
            case RenderState.BLEND_ENABLE_ALL:
                let blendEquation: any = datas[Shader3D.BLEND_EQUATION];
                blendEquation = blendEquation ?? RenderState.Default.blendEquation;

                let srcBlend: any = datas[Shader3D.BLEND_SRC];
                srcBlend = srcBlend ?? RenderState.Default.srcBlend;

                let dstBlend: any = datas[Shader3D.BLEND_DST];
                dstBlend = dstBlend ?? RenderState.Default.dstBlend;

                blendState = WebGPUBlendState.getBlendState(blend, blendEquation, srcBlend, dstBlend, blendEquation, srcBlend, dstBlend);
                break;
            case RenderState.BLEND_ENABLE_SEPERATE:
                let blendEquationRGB: any = datas[Shader3D.BLEND_EQUATION_RGB];
                blendEquationRGB = blendEquationRGB ?? RenderState.Default.blendEquationRGB;

                let blendEquationAlpha: any = datas[Shader3D.BLEND_EQUATION_ALPHA];
                blendEquationAlpha = blendEquationAlpha ?? RenderState.Default.blendEquationAlpha;

                let srcRGB: any = datas[Shader3D.BLEND_SRC_RGB];
                srcRGB = srcRGB ?? RenderState.Default.srcBlendRGB;

                let dstRGB: any = datas[Shader3D.BLEND_DST_RGB];
                dstRGB = dstRGB ?? RenderState.Default.dstBlendRGB;

                let srcAlpha: any = datas[Shader3D.BLEND_SRC_ALPHA];
                srcAlpha = srcAlpha ?? RenderState.Default.srcBlendAlpha;

                let dstAlpha: any = datas[Shader3D.BLEND_DST_ALPHA];
                dstAlpha = dstAlpha ?? RenderState.Default.dstBlendAlpha;

                blendState = WebGPUBlendState.getBlendState(blend, blendEquationRGB, srcRGB, dstRGB, blendEquationAlpha, srcAlpha, dstAlpha);
                break;
            default:
                throw "blendState set error";
        }
        return blendState;
    }

    private _getDepthStencilState(shader: WebGPUShaderInstance, dest: WebGPUInternalRT): void {
        if (dest._depthTexture) {
            if ((shader._shaderPass as ShaderPass).statefirst)
                this.depthStencilState = this._getRenderStateDepthByShader(this.materialShaderData, shader, dest);
            else this.depthStencilState = this._getRenderStateDepthByMaterial(this.materialShaderData, dest);
        } else this.depthStencilState = null;
    }

    private _getRenderStateDepthByShader(shaderData: WebGPUShaderData, shader: WebGPUShaderInstance, dest: WebGPUInternalRT) {
        const datas: any = shaderData.getData();
        const renderState: RenderState = (<ShaderPass>shader._shaderPass).renderState;
        const depthWrite: any = (renderState.depthWrite ?? datas[Shader3D.DEPTH_WRITE]) ?? RenderState.Default.depthWrite;
        const depthTest: any = (renderState.depthTest ?? datas[Shader3D.DEPTH_TEST]) ?? RenderState.Default.depthTest;
        return WebGPUDepthStencilState.getDepthStencilState(dest.depthStencilFormat, depthWrite, depthTest);
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

    private _getRenderStateDepthByMaterial(shaderData: WebGPUShaderData, dest: WebGPUInternalRT) {
        const datas: any = shaderData.getData();
        let depthWrite = datas[Shader3D.DEPTH_WRITE];
        depthWrite = depthWrite ?? RenderState.Default.depthWrite;

        let depthTest = datas[Shader3D.DEPTH_TEST];
        depthTest = depthTest ?? RenderState.Default.depthTest;
        return WebGPUDepthStencilState.getDepthStencilState(dest.depthStencilFormat, depthWrite, depthTest);
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
        // if (stencilTest === RenderState.STENCILTEST_OFF) {
        // 	RenderStateContext.setStencilTest(false);
        // }
        // else {
        // 	var stencilRef = datas[Shader3D.STENCIL_Ref];
        // 	stencilRef = stencilRef ?? RenderState.Default.stencilRef;
        // 	RenderStateContext.setStencilTest(true);
        // 	RenderStateContext.setStencilFunc(stencilTest, stencilRef);
        // }
    }

    private _getCullFrontMode(shaderData: WebGPUShaderData, shader: WebGPUShaderInstance, isTarget: boolean, invertFront: boolean) {
        const renderState: RenderState = (<ShaderPass>shader._shaderPass).renderState;
        const datas: any = shaderData.getData();
        let cull: any = datas[Shader3D.CULL];
        if ((<ShaderPass>shader._shaderPass).statefirst)
            cull = renderState.cull ?? cull;
        cull = cull ?? RenderState.Default.cull;
        switch (cull) {
            case RenderState.CULL_NONE:
                this.cullMode = CullMode.Off;
                if (isTarget !== invertFront)
                    this.frontFace = FrontFace.CCW;
                else this.frontFace = FrontFace.CW;
                break;
            case RenderState.CULL_FRONT:
                this.cullMode = CullMode.Front;
                if (isTarget === invertFront)
                    this.frontFace = FrontFace.CCW;
                else this.frontFace = FrontFace.CW;
                break;
            case RenderState.CULL_BACK:
            default:
                this.cullMode = CullMode.Back;
                if (isTarget !== invertFront)
                    this.frontFace = FrontFace.CCW;
                else this.frontFace = FrontFace.CW;
                break;
        }
    }

    _preUpdatePre(context: WebGPURenderContext3D) {
        if (!this.renderShaderData)
            this.renderShaderData = new WebGPUShaderData();
        if (this.transform?.owner?.isStatic)
            this.renderShaderData.isStatic = true;
        this._compileShader(context);
        this._invertFrontFace = this._getInvertFront();
    }

    _render(context: WebGPURenderContext3D) {
        const sceneShaderData = context.sceneData as WebGPUShaderData;
        const cameraShaderData = context.cameraData as WebGPUShaderData;
        if (this.isRender) {
            const passes: WebGPUShaderInstance[] = this._shaderInstances;
            for (let i = 0, m = passes.length; i < m; i++) {
                const shaderInstance = passes[i];
                if (shaderInstance.complete) {
                    let complete = true;
                    let entries: GPUBindGroupLayoutEntry[];
                    const bindGroupLayout = [];

                    if (sceneShaderData) {
                        entries = sceneShaderData.bindGroup(0, 'scene3D', shaderInstance.uniformSetMap[0], context.renderCommand);
                        if (!entries)
                            complete = false;
                        else {
                            sceneShaderData.uploadUniform();
                            bindGroupLayout.push(entries);
                        }
                    }
                    if (cameraShaderData) {
                        entries = cameraShaderData.bindGroup(1, 'camera', shaderInstance.uniformSetMap[1], context.renderCommand);
                        if (!entries)
                            complete = false;
                        else {
                            cameraShaderData.uploadUniform();
                            bindGroupLayout.push(entries);
                        }
                    }
                    if (this.renderShaderData) {
                        entries = this.renderShaderData.bindGroup(2, 'sprite3D', shaderInstance.uniformSetMap[2], context.renderCommand);
                        if (!entries)
                            complete = false;
                        else {
                            this.renderShaderData.uploadUniform();
                            bindGroupLayout.push(entries);
                        }
                    }
                    if (this.materialShaderData) {
                        entries = this.materialShaderData.bindGroup(3, 'material', shaderInstance.uniformSetMap[3], context.renderCommand);
                        if (!entries)
                            complete = false;
                        else {
                            this.materialShaderData.uploadUniform();
                            bindGroupLayout.push(entries);
                        }
                    }

                    if (complete) {
                        const pipeline = this._getWebGPURenderPipeline(shaderInstance, context.destRT, context, bindGroupLayout);
                        context.renderCommand.setPipeline(pipeline);
                        context.renderCommand.applyGeometry(this.geometry);
                    }
                }
            }
        }
    }

    destroy(): void {
        WebGPUGlobal.releaseId(this);
        this._shaderKey = '';
        this._shaderInstances.length = 0;
    }
}