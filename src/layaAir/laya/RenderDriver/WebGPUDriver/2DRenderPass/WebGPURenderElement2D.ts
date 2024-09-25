import { CullMode, FrontFace } from "../../../RenderEngine/RenderEnum/CullMode";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import { IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPUContext } from "../3DRenderPass/WebGPUContext";
import { WebGPUCodeGenerator, WebGPUUniformMapType } from "../RenderDevice/WebGPUCodeGenerator";
import { NameNumberMap } from "../RenderDevice/WebGPUCommon";
import { WebGPUInternalRT } from "../RenderDevice/WebGPUInternalRT";
import { WebGPURenderCommandEncoder } from "../RenderDevice/WebGPURenderCommandEncoder";
import { WebGPURenderGeometry } from "../RenderDevice/WebGPURenderGeometry";
import {
    IRenderPipelineInfo,
    WebGPUBlendState,
    WebGPUBlendStateCache,
    WebGPUDepthStencilState,
    WebGPUDepthStencilStateCache,
    WebGPURenderPipeline
} from "../RenderDevice/WebGPURenderPipelineHelper";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUShaderInstance } from "../RenderDevice/WebGPUShaderInstance";
import { WebGPUGlobal } from "../RenderDevice/WebGPUStatis/WebGPUGlobal";
import { WebGPURenderContext2D } from "./WebGPURenderContext2D";

export class WebGPURenderElement2D implements IRenderElement2D, IRenderPipelineInfo {
    static _value2DShaderData: WebGPUShaderData = new WebGPUShaderData();
    static _materialShaderData: WebGPUShaderData = new WebGPUShaderData();
    static _compileDefine: WebDefineDatas = new WebDefineDatas();
    static _defineStrings: Array<string> = [];

    protected _sceneData: WebGPUShaderData;
    protected _cameraData: WebGPUShaderData;
    materialShaderData: WebGPUShaderData;
    value2DShaderData: WebGPUShaderData;
    subShader: SubShader;

    geometry: WebGPURenderGeometry;
    blendState: WebGPUBlendStateCache;
    depthStencilState: WebGPUDepthStencilStateCache;
    cullMode: CullMode;
    frontFace: FrontFace;

    protected _stateKey: string[] = []; //用于判断渲染状态是否改变
    protected _pipeline: GPURenderPipeline[] = []; //渲染管线缓存
    protected _shaderInstances: WebGPUShaderInstance[] = []; //着色器缓存

    protected _passNum = 0; //当前渲染通道数量
    protected _passName: string; //当前渲染名称
    protected _passIndex: number[] = []; //当前渲染通道索引

    //着色器数据状态，如果状态改变了，说明需要重建资源，否则直接使用缓存
    protected _shaderDataState: { [key: string]: number[] } = {};
    protected _shaderDataObject: { [key: string]: number[] } = {};

    bundleId: number; //用于bundle管理（被bundle管理器识别）
    needClearBundle: boolean = false; //是否需要清除bundle（bindGroup，pipeline等改变都需要清除指令缓存）
    static bundleIdCounter: number = 0;

    //是否静态节点
    isStatic: boolean = false;
    staticChange: boolean = false;

    nodeCommonMap: string[];
    renderStateIsBySprite: boolean = true;

    globalId: number;
    objectName: string = 'WebGPURenderElement2D';

    constructor() {
        this.globalId = WebGPUGlobal.getId(this);
    }

    /**
     * 获取渲染通道的uniform
     * @param shaderpass 
     * @param defineData 
     */
    private _getShaderPassUniform(shaderpass: ShaderPass, defineData: WebDefineDatas) {
        const defineString = WebGPURenderElement2D._defineStrings;
        Shader3D._getNamesByDefineData(defineData, defineString);
        return WebGPUCodeGenerator.collectUniform(defineString, shaderpass._owner._uniformMap, shaderpass._VS, shaderpass._PS);
    }

    /**
     * 收集uniform
     * @param compileDefine 
     */
    protected _collectUniform(compileDefine: WebDefineDatas) {
        const uniformMap: WebGPUUniformMapType = {};
        const arrayMap: NameNumberMap = {};
        const passes = this.subShader._passes;
        for (let i = passes.length - 1; i > -1; i--) {
            const { uniform, arr } = this._getShaderPassUniform(passes[i], compileDefine);
            for (const key in uniform)
                uniformMap[key] = uniform[key];
            for (const key in arr)
                arrayMap[key] = arr[key];
        }
        return { uniformMap, arrayMap };
    }

    /**
     * 编译着色器
     * @param context 
     */
    protected _compileShader(context: WebGPURenderContext2D) {
        //将场景或全局配置定义准备好
        const compileDefine = WebGPURenderElement2D._compileDefine;
        if (this._sceneData)
            this._sceneData._defineDatas.cloneTo(compileDefine);
        else if (context._globalConfigShaderData)
            context._globalConfigShaderData.cloneTo(compileDefine);

        const returnGamma = !(context.destRT) || ((context.destRT)._textures[0].gammaCorrection != 1);
        if (returnGamma)
            compileDefine.add(ShaderDefines2D.GAMMASPACE);
        else compileDefine.remove(ShaderDefines2D.GAMMASPACE);
        compileDefine.add(ShaderDefines2D.GAMMASPACE); //?
        if (context.invertY)
            compileDefine.add(ShaderDefines2D.INVERTY);
        else compileDefine.remove(ShaderDefines2D.INVERTY);

        //编译着色器，创建uniform缓冲区
        if (this.value2DShaderData)
            compileDefine.addDefineDatas(this.value2DShaderData.getDefineData());
        if (this.materialShaderData)
            compileDefine.addDefineDatas(this.materialShaderData._defineDatas);

        //查找着色器对象缓存
        for (let i = 0; i < this._passNum; i++) {
            const index = this._passIndex[i];
            const pass = this.subShader._passes[index];
            if (!pass.moduleData.getCacheShader(compileDefine.clone())) {
                const { uniformMap, arrayMap } = this._collectUniform(compileDefine); //@ts-ignore
                pass.uniformMap = uniformMap; //@ts-ignore
                pass.arrayMap = arrayMap;
            }

            //设置nodeCommonMap
            if (this.value2DShaderData)
                pass.nodeCommonMap = this.nodeCommonMap;
            else pass.nodeCommonMap = null;

            //获取着色器实例，先查找缓存，如果没有则创建
            const shaderInstance = pass.withCompile(compileDefine.clone(), true) as WebGPUShaderInstance;
            this._shaderInstances[index] = shaderInstance;

            //创建uniform缓冲区，各pass共享shaderData，因此只需要创建一份
            if (i === 0) {
                this._sceneData?.createUniformBuffer(shaderInstance.uniformInfo[0], true);
                this._cameraData?.createUniformBuffer(shaderInstance.uniformInfo[1], true);
                this.value2DShaderData?.createUniformBuffer(shaderInstance.uniformInfo[2], false);
                this.materialShaderData?.createUniformBuffer(shaderInstance.uniformInfo[3], false);
            }
        }

        //重编译着色器后，清理绑定组缓存
        this.value2DShaderData?.clearBindGroup();
        this.materialShaderData?.clearBindGroup();

        //提取当前渲染通道
        this._takeCurPass(context.pipelineMode);
    }

    /**
     * 计算状态值
     * @param shaderInstance 
     * @param dest 
     * @param context 
     */
    protected _calcStateKey(shaderInstance: WebGPUShaderInstance, dest: WebGPUInternalRT, context: WebGPURenderContext2D) {
        let stateKey = '';
        stateKey += dest.formatId + '_';
        stateKey += dest._samples + '_';
        stateKey += shaderInstance._id + '_';
        stateKey += this.materialShaderData.stateKey;
        stateKey += this.geometry.bufferState.stateId + '_';
        stateKey += this.geometry.bufferState.updateBufferLayoutFlag;
        return stateKey;
    }

    /**
     * 获取渲染管线
     * @param shaderInstance 
     * @param dest 
     * @param context 
     * @param entries 
     * @param stateKey 
     */
    protected _getWebGPURenderPipeline(shaderInstance: WebGPUShaderInstance, dest: WebGPUInternalRT, context: WebGPURenderContext2D, entries: any, stateKey?: string) {
        this._getBlendState(shaderInstance);
        this._getDepthStencilState(shaderInstance, dest);
        if (this.renderStateIsBySprite || !this.materialShaderData)
            this._getCullFrontMode(this.value2DShaderData, shaderInstance, false, context.invertY);
        else this._getCullFrontMode(this.materialShaderData, shaderInstance, false, context.invertY);
        return WebGPURenderPipeline.getRenderPipeline(this, shaderInstance, dest, entries, stateKey);
    }

    /**
     * 获取混合状态
     * @param shaderInstance 
     */
    private _getBlendState(shaderInstance: WebGPUShaderInstance) {
        if (this.renderStateIsBySprite || !this.materialShaderData) {
            if ((shaderInstance._shaderPass as ShaderPass).statefirst)
                this.blendState = this._getRenderStateBlendByShader(this.value2DShaderData, shaderInstance);
            else this.blendState = this._getRenderStateBlendByMaterial(this.value2DShaderData);
        } else {
            if ((shaderInstance._shaderPass as ShaderPass).statefirst)
                this.blendState = this._getRenderStateBlendByShader(this.materialShaderData, shaderInstance);
            else this.blendState = this._getRenderStateBlendByMaterial(this.materialShaderData);
        }
    }

    private _getRenderStateBlendByShader(shaderData: WebGPUShaderData, shaderInstance: WebGPUShaderInstance) {
        const data = shaderData.getData();
        const renderState = (shaderInstance._shaderPass as ShaderPass).renderState;
        const blend = (renderState.blend ?? data[Shader3D.BLEND]) ?? RenderState.Default.blend;
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
                const blendEquation = (renderState.blendEquation ?? data[Shader3D.BLEND_EQUATION]) ?? RenderState.Default.blendEquation;
                const srcBlend = (renderState.srcBlend ?? data[Shader3D.BLEND_SRC]) ?? RenderState.Default.srcBlend;
                const dstBlend = (renderState.dstBlend ?? data[Shader3D.BLEND_DST]) ?? RenderState.Default.dstBlend;
                blendState = WebGPUBlendState.getBlendState(blend, blendEquation, srcBlend, dstBlend, blendEquation, srcBlend, dstBlend);
                break;
            case RenderState.BLEND_ENABLE_SEPERATE:
                const blendEquationRGB = (renderState.blendEquationRGB ?? data[Shader3D.BLEND_EQUATION_RGB]) ?? RenderState.Default.blendEquationRGB;
                const blendEquationAlpha = (renderState.blendEquationAlpha ?? data[Shader3D.BLEND_EQUATION_ALPHA]) ?? RenderState.Default.blendEquationAlpha;
                const srcRGB = (renderState.srcBlendRGB ?? data[Shader3D.BLEND_SRC_RGB]) ?? RenderState.Default.srcBlendRGB;
                const dstRGB = (renderState.dstBlendRGB ?? data[Shader3D.BLEND_DST_RGB]) ?? RenderState.Default.dstBlendRGB;
                const srcAlpha = (renderState.srcBlendAlpha ?? data[Shader3D.BLEND_SRC_ALPHA]) ?? RenderState.Default.srcBlendAlpha;
                const dstAlpha = (renderState.dstBlendAlpha ?? data[Shader3D.BLEND_DST_ALPHA]) ?? RenderState.Default.dstBlendAlpha;
                blendState = WebGPUBlendState.getBlendState(blend, blendEquationRGB, srcRGB, dstRGB, blendEquationAlpha, srcAlpha, dstAlpha);
                break;
            default:
                throw 'blendState set error';
        }
        return blendState;
    }

    private _getRenderStateBlendByMaterial(shaderData: WebGPUShaderData) {
        const data = shaderData.getData();
        const blend = data[Shader3D.BLEND] ?? RenderState.Default.blend;
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
                let blendEquation: any = data[Shader3D.BLEND_EQUATION];
                blendEquation = blendEquation ?? RenderState.Default.blendEquation;
                let srcBlend: any = data[Shader3D.BLEND_SRC];
                srcBlend = srcBlend ?? RenderState.Default.srcBlend;
                let dstBlend: any = data[Shader3D.BLEND_DST];
                dstBlend = dstBlend ?? RenderState.Default.dstBlend;
                blendState = WebGPUBlendState.getBlendState(blend, blendEquation, srcBlend, dstBlend, blendEquation, srcBlend, dstBlend);
                break;
            case RenderState.BLEND_ENABLE_SEPERATE:
                let blendEquationRGB: any = data[Shader3D.BLEND_EQUATION_RGB];
                blendEquationRGB = blendEquationRGB ?? RenderState.Default.blendEquationRGB;
                let blendEquationAlpha: any = data[Shader3D.BLEND_EQUATION_ALPHA];
                blendEquationAlpha = blendEquationAlpha ?? RenderState.Default.blendEquationAlpha;
                let srcRGB: any = data[Shader3D.BLEND_SRC_RGB];
                srcRGB = srcRGB ?? RenderState.Default.srcBlendRGB;
                let dstRGB: any = data[Shader3D.BLEND_DST_RGB];
                dstRGB = dstRGB ?? RenderState.Default.dstBlendRGB;
                let srcAlpha: any = data[Shader3D.BLEND_SRC_ALPHA];
                srcAlpha = srcAlpha ?? RenderState.Default.srcBlendAlpha;
                let dstAlpha: any = data[Shader3D.BLEND_DST_ALPHA];
                dstAlpha = dstAlpha ?? RenderState.Default.dstBlendAlpha;
                blendState = WebGPUBlendState.getBlendState(blend, blendEquationRGB, srcRGB, dstRGB, blendEquationAlpha, srcAlpha, dstAlpha);
                break;
            default:
                throw 'blendState set error';
        }
        return blendState;
    }

    /**
     * 获取深度缓存状态
     * @param shaderInstance 
     * @param dest 
     */
    private _getDepthStencilState(shaderInstance: WebGPUShaderInstance, dest: WebGPUInternalRT): void {
        if (dest._depthTexture) {
            if (this.renderStateIsBySprite || !this.materialShaderData) {
                if ((shaderInstance._shaderPass as ShaderPass).statefirst)
                    this.depthStencilState = this._getRenderStateDepthByShader(this.value2DShaderData, shaderInstance, dest);
                else this.depthStencilState = this._getRenderStateDepthByMaterial(this.value2DShaderData, dest);
            } else {
                if ((shaderInstance._shaderPass as ShaderPass).statefirst)
                    this.depthStencilState = this._getRenderStateDepthByShader(this.materialShaderData, shaderInstance, dest);
                else this.depthStencilState = this._getRenderStateDepthByMaterial(this.materialShaderData, dest);
            }
        } else this.depthStencilState = null;
    }

    private _getRenderStateDepthByShader(shaderData: WebGPUShaderData, shaderInstance: WebGPUShaderInstance, dest: WebGPUInternalRT) {
        const data = shaderData.getData();
        const renderState = (<ShaderPass>shaderInstance._shaderPass).renderState;
        const depthWrite = (renderState.depthWrite ?? data[Shader3D.DEPTH_WRITE]) ?? RenderState.Default.depthWrite;
        const depthTest = (renderState.depthTest ?? data[Shader3D.DEPTH_TEST]) ?? RenderState.Default.depthTest;
        return WebGPUDepthStencilState.getDepthStencilState(dest.depthStencilFormat, depthWrite, depthTest);
    }

    private _getRenderStateDepthByMaterial(shaderData: WebGPUShaderData, dest: WebGPUInternalRT) {
        const data = shaderData.getData();
        const depthWrite = data[Shader3D.DEPTH_WRITE] ?? RenderState.Default.depthWrite;
        const depthTest = data[Shader3D.DEPTH_TEST] ?? RenderState.Default.depthTest;
        return WebGPUDepthStencilState.getDepthStencilState(dest.depthStencilFormat, depthWrite, depthTest);
    }

    private _getCullFrontMode(shaderData: WebGPUShaderData, shaderInstance: WebGPUShaderInstance, isTarget: boolean, invertFront: boolean) {
        const renderState = (<ShaderPass>shaderInstance._shaderPass).renderState;
        const data = shaderData.getData();
        let cull = data[Shader3D.CULL];
        if ((<ShaderPass>shaderInstance._shaderPass).statefirst)
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
                if (isTarget !== invertFront)
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

    /**
     * 着色器数据是否改变
     * @param context
     */
    protected _isShaderDataChange(context: WebGPURenderContext2D) {
        let change = false;
        let shaderDataState = this._shaderDataState[context.pipelineMode];
        let shaderDataObject = this._shaderDataObject[context.pipelineMode];
        if (!shaderDataState)
            shaderDataState = this._shaderDataState[context.pipelineMode] = [];
        if (!shaderDataObject)
            shaderDataObject = this._shaderDataObject[context.pipelineMode] = [];
        if (this._sceneData) {
            if (shaderDataState[0] != this._sceneData.changeMark) {
                shaderDataState[0] = this._sceneData.changeMark;
                change = true;
            }
            if (shaderDataObject[0] != this._sceneData.globalId) {
                shaderDataObject[0] = this._sceneData.globalId;
                change = true;
            }
        }
        if (this._cameraData) {
            if (shaderDataState[1] != this._cameraData.changeMark) {
                shaderDataState[1] = this._cameraData.changeMark;
                change = true;
            }
            if (shaderDataObject[1] != this._cameraData.globalId) {
                shaderDataObject[1] = this._cameraData.globalId;
                change = true;
            }
        }
        if (this.value2DShaderData) {
            if (shaderDataState[2] != this.value2DShaderData.changeMark) {
                shaderDataState[2] = this.value2DShaderData.changeMark;
                change = true;
            }
            if (shaderDataObject[2] != this.value2DShaderData.globalId) {
                shaderDataObject[2] = this.value2DShaderData.globalId;
                change = true;
            }
        }
        if (this.materialShaderData) {
            if (shaderDataState[3] != this.materialShaderData.changeMark) {
                shaderDataState[3] = this.materialShaderData.changeMark;
                change = true;
            }
            if (shaderDataObject[3] != this.materialShaderData.globalId) {
                shaderDataObject[3] = this.materialShaderData.globalId;
                change = true;
            }
        }
        return change;
    }

    /**
     * 创建绑定组布局
     * @param shaderInstance 
     */
    protected _createBindGroupLayout(shaderInstance: WebGPUShaderInstance) {
        let entries: GPUBindGroupLayoutEntry[];
        const bindGroupLayout = new Array(4);
        const shaderData = new Array(4);
        shaderData[0] = this._sceneData;
        shaderData[1] = this._cameraData;
        shaderData[2] = this.value2DShaderData;
        shaderData[3] = this.materialShaderData;
        const uniformSetMap = shaderInstance.uniformSetMap;

        let error = false;
        for (let i = 0; i < 4; i++) {
            if (shaderData[i]) {
                entries = shaderData[i].createBindGroupLayoutEntry(uniformSetMap[i]);
                if (entries)
                    bindGroupLayout[i] = entries;
                else error = true;
            } else error = true;
        }
        return error ? undefined : bindGroupLayout;
    }

    /**
     * 绑定资源组
     * @param shaderInstance 
     * @param command 
     */
    protected _bindGroup(shaderInstance: WebGPUShaderInstance, command: WebGPURenderCommandEncoder) {
        const uniformSetMap = shaderInstance.uniformSetMap;
        this._sceneData?.bindGroup(0, 'scene3D', uniformSetMap[0], command);
        this._cameraData?.bindGroup(1, 'camera', uniformSetMap[1], command);
        this.value2DShaderData?.bindGroup(2, 'sprite3D', uniformSetMap[2], command);
        this.materialShaderData?.bindGroup(3, 'material', uniformSetMap[3], command);
    }

    /**
     * 上传uniform数据
     */
    protected _uploadUniform() {
        this._sceneData?.uploadUniform();
        this._cameraData?.uploadUniform();
        this.value2DShaderData?.uploadUniform();
        this.materialShaderData?.uploadUniform();
    }

    /**
     * 上传几何数据
     * @param command 
     */
    protected _uploadGeometry(command: WebGPURenderCommandEncoder) {
        let triangles = 0;
        if (command) {
            if (WebGPUGlobal.useGlobalContext)
                triangles += WebGPUContext.applyCommandGeometry(command, this.geometry);
            else triangles += command.applyGeometry(this.geometry);
        }
        return triangles;
    }

    /**
     * 用于创建渲染管线的函数
     * @param index 
     * @param context 
     * @param shaderInstance 
     * @param command 
     * @param stateKey 
     */
    protected _createPipeline(index: number, context: WebGPURenderContext2D, shaderInstance: WebGPUShaderInstance,
        command: WebGPURenderCommandEncoder, stateKey?: string) {
        this.value2DShaderData.isShare = false;
        const bindGroupLayout = this._createBindGroupLayout(shaderInstance);
        if (bindGroupLayout) {
            const pipeline = this._getWebGPURenderPipeline(shaderInstance, context.destRT, context, bindGroupLayout, stateKey);
            if (command) {
                if (WebGPUGlobal.useGlobalContext)
                    WebGPUContext.setCommandPipeline(command, pipeline);
                else command.setPipeline(pipeline);
            }
            if (WebGPUGlobal.useCache) {
                shaderInstance.renderPipelineMap.set(stateKey, pipeline);
                this._pipeline[index] = pipeline;
                this._stateKey[index] = stateKey;
            }
            context.pipelineCache.push({ name: shaderInstance.name, pipeline, shaderInstance, samples: context.destRT._samples, stateKey });
            console.log('pipelineCache2d =', context.pipelineCache);
            return pipeline;
        }
        return null;
    }

    /**
     * 提取当前渲染通道
     * @param pipelineMode 
     */
    private _takeCurPass(pipelineMode: string) {
        this._passNum = 0;
        this._passName = pipelineMode;
        const passes = this.subShader._passes;
        for (let i = 0, len = passes.length; i < len; i++) {
            if (passes[i].pipelineMode === pipelineMode) {
                this._passIndex[this._passNum++] = i;
            }
        }
    }

    /**
     * 准备渲染
     * @param context 
     */
    prepare(context: WebGPURenderContext2D) {
        this._takeCurPass(context.pipelineMode);
        if (this._passNum === 0) return false;

        //设定当前渲染数据
        this._sceneData = context.sceneData;
        this._cameraData = context.cameraData;
        if (!this.value2DShaderData)
            this.value2DShaderData = WebGPURenderElement2D._value2DShaderData;
        if (!this.materialShaderData)
            this.materialShaderData = WebGPURenderElement2D._materialShaderData;

        //编译着色器（只在数据发生变化的时候才重新编译）
        let compile = false;
        if (this._isShaderDataChange(context)) {
            this._compileShader(context);
            compile = true;
        }

        return compile;
    }

    /**
     * 渲染
     * @param context 
     * @param command 
     */
    render(context: WebGPURenderContext2D, command: WebGPURenderCommandEncoder) {
        //如果command是null，则只上传shaderData数据，不执行bindGroup操作
        let triangles = 0;
        for (let i = 0; i < this._passNum; i++) {
            const index = this._passIndex[i];
            let pipeline = this._pipeline[index];
            const shaderInstance = this._shaderInstances[index];
            if (shaderInstance && shaderInstance.complete) {
                this._getDepthStencilState(shaderInstance, context.destRT); //更新Stencil信息
                if (WebGPUGlobal.useCache) { //启用缓存机制
                    let stateKey: string;
                    if (this.materialShaderData)
                        stateKey = this._calcStateKey(shaderInstance, context.destRT, context);
                    else stateKey = this._stateKey[index];
                    if (this._stateKey[index] !== stateKey || pipeline) { //缓存未命中
                        this._stateKey[index] = stateKey;
                        pipeline = this._pipeline[index] = shaderInstance.renderPipelineMap.get(stateKey);
                    }
                    if (!pipeline)
                        pipeline = this._createPipeline(index, context, shaderInstance, command, stateKey); //新建渲染管线
                    else if (command) { //缓存命中
                        if (WebGPUGlobal.useGlobalContext)
                            WebGPUContext.setCommandPipeline(command, pipeline);
                        else command.setPipeline(pipeline);
                    }
                } else this._createPipeline(index, context, shaderInstance, command); //不启用缓存机制
                if (command)
                    this._bindGroup(shaderInstance, command); //绑定资源组
                this._uploadUniform(); //上传uniform数据
                triangles += this._uploadGeometry(command); //上传几何数据
            }
        }
        return triangles;
    }

    /**
     * 销毁
     */
    destroy() {
        WebGPUGlobal.releaseId(this);
        this._shaderInstances.length = 0;
        this._pipeline.length = 0;
        this._stateKey.length = 0;
    }
}