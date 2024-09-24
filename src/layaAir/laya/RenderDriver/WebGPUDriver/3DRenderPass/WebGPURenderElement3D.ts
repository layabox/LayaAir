import { CullMode, FrontFace } from "../../../RenderEngine/RenderEnum/CullMode";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { Transform3D } from "../../../d3/core/Transform3D";
import { IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { WebBaseRenderNode } from "../../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPUBuffer } from "../RenderDevice/WebGPUBuffer";
import { WebGPURenderBundle } from "../RenderDevice/WebGPUBundle/WebGPURenderBundle";
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
import { WebGPUContext } from "./WebGPUContext";
import { WebGPURenderContext3D } from "./WebGPURenderContext3D";

/**
 * 基本渲染单元
 */
export class WebGPURenderElement3D implements IRenderElement3D, IRenderPipelineInfo {
    static _renderShaderData: WebGPUShaderData = new WebGPUShaderData();
    static _compileDefine: WebDefineDatas = new WebDefineDatas();
    static _defineStrings: Array<string> = [];

    protected _sceneData: WebGPUShaderData;
    protected _cameraData: WebGPUShaderData;
    renderShaderData: WebGPUShaderData;
    materialShaderData: WebGPUShaderData;
    materialRenderQueue: number;
    materialId: number;
    transform: Transform3D;
    canDynamicBatch: boolean;
    isRender: boolean;
    owner: WebBaseRenderNode;
    subShader: SubShader;
    geometry: WebGPURenderGeometry;
    blendState: WebGPUBlendStateCache;
    depthStencilState: WebGPUDepthStencilStateCache;
    cullMode: CullMode;
    frontFace: FrontFace;
    protected _invertFrontFace: boolean;
    protected _stencilParam: { [key: string]: any } = {}; //模板参数

    protected _stateKey: string[] = []; //用于判断渲染状态是否改变
    protected _pipeline: GPURenderPipeline[] = []; //渲染管线缓存
    protected _shaderInstances: WebGPUShaderInstance[] = []; //着色器缓存

    protected _passNum = 0; //当前渲染通道数量
    protected _passName: string; //当前渲染名称
    protected _passIndex: number[] = []; //当前渲染通道索引

    //着色器数据状态，如果状态改变了，说明需要重建资源，否则直接使用缓存
    protected _shaderDataState: { [key: string]: number[] } = {};

    bundleId: number; //用于bundle管理（被bundle管理器识别）
    needClearBundle: boolean = false; //是否需要清除bundle（bindGroup，pipeline等改变都需要清除指令缓存）
    static bundleIdCounter: number = 0;

    //是否静态节点
    isStatic: boolean = false;
    staticChange: boolean = false;

    globalId: number;
    objectName: string = 'WebGPURenderElement3D';

    constructor() {
        this.globalId = WebGPUGlobal.getId(this);
        this.bundleId = WebGPURenderElement3D.bundleIdCounter++;
    }

    /**
     * 是否反转面片
     */
    protected _getInvertFront(): boolean {
        const transform = this.owner?.transform;
        return transform ? transform._isFrontFaceInvert : false;
    }

    /**
     * 获取渲染通道的uniform
     * @param shaderpass 
     * @param defineData 
     */
    private _getShaderPassUniform(shaderpass: ShaderPass, defineData: WebDefineDatas) {
        const defineString = WebGPURenderElement3D._defineStrings;
        defineString.length = 0;
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
     * 提取当前渲染通道
     * @param pipelineMode 
     */
    private _takeCurrentPass(pipelineMode: string) {
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
     * 渲染前更新
     * @param context 
     */
    _preUpdatePre(context: WebGPURenderContext3D) {
        this._takeCurrentPass(context.pipelineMode);
        if (this._passNum === 0) return false;

        //设定当前渲染数据
        this._sceneData = context.sceneData;
        this._cameraData = context.cameraData;
        if (this.renderShaderData === undefined) {
            this.renderShaderData = WebGPURenderElement3D._renderShaderData;
            this.renderShaderData.clear();
        }
        if (this.transform?.owner?.isStatic) {
            if (this.isStatic !== true)
                this.staticChange = true;
            this.isStatic = true;
            this.renderShaderData.isStatic = true;
        } else {
            if (this.isStatic !== false)
                this.staticChange = true;
            this.isStatic = false;
            this.renderShaderData.isStatic = false;
        }

        //编译着色器（只在数据发生变化的时候才重新编译）
        let compile = false;
        if (this._isShaderDataChange(context)) {
            this._compileShader(context);
            compile = true;
        } else {
            const index = this._passIndex[0];
            this._sceneData?.createUniformBuffer(this._shaderInstances[index].uniformInfo[0], true);
            this._cameraData?.createUniformBuffer(this._shaderInstances[index].uniformInfo[1], true);
        }

        //是否反转面片
        this._invertFrontFace = this._getInvertFront();
        return compile;
    }

    /**
     * 编译着色器
     * @param context 
     */
    protected _compileShader(context: WebGPURenderContext3D) {
        //将场景或全局配置定义准备好
        const compileDefine = WebGPURenderElement3D._compileDefine;
        if (this._sceneData)
            this._sceneData._defineDatas.cloneTo(compileDefine);
        else if (context.globalConfigShaderData)
            context.globalConfigShaderData.cloneTo(compileDefine);

        //添加宏定义数据
        if (this._cameraData)
            compileDefine.addDefineDatas(this._cameraData._defineDatas);
        if (this.renderShaderData)
            compileDefine.addDefineDatas(this.renderShaderData._defineDatas);
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
            if (this.renderShaderData && this.owner)
                this._shaderPass[i].nodeCommonMap = this.owner._commonUniformMap;
            else this._shaderPass[i].nodeCommonMap = null;

            //获取着色器实例，先查找缓存，如果没有则创建
            const shaderInstance = pass.withCompile(compileDefine.clone()) as WebGPUShaderInstance;
            this._shaderInstances[index] = shaderInstance;

            //创建uniform缓冲区
            if (i === 0) {
                this._sceneData?.createUniformBuffer(shaderInstance.uniformInfo[0], true);
                this._cameraData?.createUniformBuffer(shaderInstance.uniformInfo[1], true);
                this.renderShaderData?.createUniformBuffer(shaderInstance.uniformInfo[2], false);
                this.materialShaderData?.createUniformBuffer(shaderInstance.uniformInfo[3], false);
            }
        }

        //重编译着色器后，清理绑定组缓存
        this.renderShaderData?.clearBindGroup();
        this.materialShaderData?.clearBindGroup();

        //提取当前渲染通道
        this._takeCurrentPass(context.pipelineMode);
    }

    /**
     * 计算状态值
     * @param shaderInstance 
     * @param dest 
     * @param context 
     */
    protected _calcStateKey(shaderInstance: WebGPUShaderInstance, dest: WebGPUInternalRT, context: WebGPURenderContext3D) {
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
    protected _getWebGPURenderPipeline(shaderInstance: WebGPUShaderInstance, dest: WebGPUInternalRT, context: WebGPURenderContext3D, entries: any, stateKey?: string) {
        if (this.materialShaderData) {
            this._getBlendState(shaderInstance);
            this._getDepthStencilState(shaderInstance, dest);
            this._getCullFrontMode(this.materialShaderData, shaderInstance, this._invertFrontFace, context.invertY);
        }
        return WebGPURenderPipeline.getRenderPipeline(this, shaderInstance, dest, entries, stateKey);
    }

    /**
     * 获取混合状态
     * @param shaderInstance 
     */
    private _getBlendState(shaderInstance: WebGPUShaderInstance) {
        if ((shaderInstance._shaderPass as ShaderPass).statefirst)
            this.blendState = this._getRenderStateBlendByShader(this.materialShaderData, shaderInstance);
        else this.blendState = this._getRenderStateBlendByMaterial(this.materialShaderData);
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
            if ((shaderInstance._shaderPass as ShaderPass).statefirst)
                this.depthStencilState = this._getRenderStateDepthByShader(this.materialShaderData, shaderInstance, dest);
            else this.depthStencilState = this._getRenderStateDepthByMaterial(this.materialShaderData, dest);
        } else this.depthStencilState = null;
    }

    private _getRenderStateDepthByShader(shaderData: WebGPUShaderData, shaderInstance: WebGPUShaderInstance, dest: WebGPUInternalRT) {
        const data = shaderData.getData();
        const renderState = (<ShaderPass>shaderInstance._shaderPass).renderState;
        const depthWrite = (renderState.depthWrite ?? data[Shader3D.DEPTH_WRITE]) ?? RenderState.Default.depthWrite;
        const depthTest = (renderState.depthTest ?? data[Shader3D.DEPTH_TEST]) ?? RenderState.Default.depthTest;

        //Stencil
        const stencilParam = this._stencilParam;
        const stencilTest = (renderState.stencilTest ?? data[Shader3D.STENCIL_TEST]) ?? RenderState.Default.stencilTest;
        if (stencilTest === RenderState.STENCILTEST_OFF)
            stencilParam['enable'] = false;
        else {
            const stencilRef = renderState.stencilRef ?? data[Shader3D.STENCIL_Ref] ?? RenderState.Default.stencilRef;
            const stencilWrite = renderState.stencilWrite ?? data[Shader3D.STENCIL_WRITE] ?? RenderState.Default.stencilWrite;
            const stencilOp = stencilWrite ? (renderState.stencilOp ?? data[Shader3D.STENCIL_Op] ?? RenderState.Default.stencilOp) : RenderState.Default.stencilOp;
            stencilParam['enable'] = true;
            stencilParam['write'] = stencilWrite;
            stencilParam['test'] = stencilTest;
            stencilParam['ref'] = stencilRef;
            stencilParam['op'] = stencilOp;
        }

        return WebGPUDepthStencilState.getDepthStencilState(dest.depthStencilFormat, depthWrite, depthTest, stencilParam);
    }

    private _getRenderStateDepthByMaterial(shaderData: WebGPUShaderData, dest: WebGPUInternalRT) {
        const data = shaderData.getData();
        const depthWrite = data[Shader3D.DEPTH_WRITE] ?? RenderState.Default.depthWrite;
        const depthTest = data[Shader3D.DEPTH_TEST] ?? RenderState.Default.depthTest;

        //Stencil
        const stencilParam = this._stencilParam;
        const stencilTest = data[Shader3D.STENCIL_TEST] ?? RenderState.Default.stencilTest;
        if (stencilTest === RenderState.STENCILTEST_OFF)
            stencilParam['enable'] = false;
        else {
            const stencilRef = data[Shader3D.STENCIL_Ref] ?? RenderState.Default.stencilRef;
            const stencilWrite = data[Shader3D.STENCIL_WRITE] ?? RenderState.Default.stencilWrite;
            const stencilOp = stencilWrite ? (data[Shader3D.STENCIL_Op] ?? RenderState.Default.stencilOp) : RenderState.Default.stencilOp;
            stencilParam['enable'] = true;
            stencilParam['write'] = stencilWrite;
            stencilParam['test'] = stencilTest;
            stencilParam['ref'] = stencilRef;
            stencilParam['op'] = stencilOp;
        }

        return WebGPUDepthStencilState.getDepthStencilState(dest.depthStencilFormat, depthWrite, depthTest, stencilParam);
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
                    this.frontFace = FrontFace.CW;
                else this.frontFace = FrontFace.CCW;
                break;
            case RenderState.CULL_FRONT:
                this.cullMode = CullMode.Front;
                if (isTarget !== invertFront)
                    this.frontFace = FrontFace.CW;
                else this.frontFace = FrontFace.CCW;
                break;
            case RenderState.CULL_BACK:
            default:
                this.cullMode = CullMode.Back;
                if (isTarget !== invertFront)
                    this.frontFace = FrontFace.CW;
                else this.frontFace = FrontFace.CCW;
                break;
        }
    }

    /**
     * 着色器数据是否改变
     * @param context
     */
    protected _isShaderDataChange(context: WebGPURenderContext3D) {
        let change = false;
        let shaderDataState = this._shaderDataState[context.pipelineMode];
        if (!shaderDataState)
            shaderDataState = this._shaderDataState[context.pipelineMode] = [];
        if (this._sceneData) {
            if (shaderDataState[0] != this._sceneData.changeMark) {
                shaderDataState[0] = this._sceneData.changeMark;
                change = true;
            }
        }
        if (this._cameraData) {
            if (shaderDataState[1] != this._cameraData.changeMark) {
                shaderDataState[1] = this._cameraData.changeMark;
                change = true;
            }
        }
        if (this.renderShaderData) {
            if (shaderDataState[2] != this.renderShaderData.changeMark) {
                shaderDataState[2] = this.renderShaderData.changeMark;
                change = true;
            }
        }
        if (this.materialShaderData) {
            if (shaderDataState[3] != this.materialShaderData.changeMark) {
                shaderDataState[3] = this.materialShaderData.changeMark;
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
        shaderData[2] = this.renderShaderData;
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
     * @param bundle 
     */
    protected _bindGroup(shaderInstance: WebGPUShaderInstance, command: WebGPURenderCommandEncoder, bundle: WebGPURenderBundle) {
        const uniformSetMap = shaderInstance.uniformSetMap;
        this._sceneData?.bindGroup(0, 'scene3D', uniformSetMap[0], command, bundle);
        this._cameraData?.bindGroup(1, 'camera', uniformSetMap[1], command, bundle);
        this.renderShaderData?.bindGroup(2, 'sprite3D', uniformSetMap[2], command, bundle);
        this.materialShaderData?.bindGroup(3, 'material', uniformSetMap[3], command, bundle);
    }

    /**
     * 上传uniform数据
     */
    protected _uploadUniform() {
        this._sceneData?.uploadUniform();
        this._cameraData?.uploadUniform();
        this.renderShaderData?.uploadUniform();
        this.materialShaderData?.uploadUniform();
    }

    /**
     * 上传模板参考值
     * @param command 
     */
    protected _uploadStencilReference(command: WebGPURenderCommandEncoder) {
        if (this._stencilParam['enable'] && command)
            command.setStencilReference(this._stencilParam['ref']);
    }

    /**
     * 上传几何数据
     * @param command 
     * @param bundle 
     */
    protected _uploadGeometry(command: WebGPURenderCommandEncoder, bundle: WebGPURenderBundle) {
        let triangles = 0;
        if (command) {
            if (WebGPUGlobal.useGlobalContext)
                triangles += WebGPUContext.applyCommandGeometryPart(command, this.geometry, 0);
            else triangles += command.applyGeometryPart(this.geometry, 0);
        }
        if (bundle) {
            if (WebGPUGlobal.useGlobalContext)
                triangles += WebGPUContext.applyBundleGeometryPart(bundle, this.geometry, 0);
            else triangles += bundle.applyGeometryPart(this.geometry, 0);
        }
        return triangles;
    }

    /**
     * 用于创建渲染管线的函数
     * @param index 
     * @param context 
     * @param shaderInstance 
     * @param command 
     * @param bundle 
     * @param stateKey 
     */
    protected _createPipeline(index: number, context: WebGPURenderContext3D, shaderInstance: WebGPUShaderInstance,
        command: WebGPURenderCommandEncoder, bundle: WebGPURenderBundle, stateKey?: string) {
        const bindGroupLayout = this._createBindGroupLayout(shaderInstance);
        if (bindGroupLayout) {
            const pipeline = this._getWebGPURenderPipeline(shaderInstance, context.destRT, context, bindGroupLayout, stateKey);
            if (command) {
                if (WebGPUGlobal.useGlobalContext)
                    WebGPUContext.setCommandPipeline(command, pipeline);
                else command.setPipeline(pipeline);
            }
            if (bundle) {
                if (WebGPUGlobal.useGlobalContext)
                    WebGPUContext.setBundlePipeline(bundle, pipeline);
                else bundle.setPipeline(pipeline);
            }
            if (WebGPUGlobal.useCache) {
                shaderInstance.renderPipelineMap.set(stateKey, pipeline);
                this._stateKey[index] = stateKey;
                this._pipeline[index] = pipeline;
            }
            context.pipelineCache.push({ pipeline, shaderInstance, samples: context.destRT._samples, stateKey });
            console.log('pipelineCache3d =', context.pipelineCache);
            return pipeline;
        }
        return null;
    }

    /**
     * 转换数据格式
     */
    protected _changeDataFormat() {
        const bufferState = this.geometry.bufferState;
        for (let i = 0; i < bufferState._vertexBuffers.length; i++) {
            const vb = bufferState._vertexBuffers[i];
            const vs = bufferState.vertexState[i];
            if (!vb.buffer) continue;
            let attrOld = [], attrNew = [];
            const attributes = vs.attributes as [];
            const attrLen = attributes.length;
            for (let j = 0; j < attrLen; j++) {
                const attr = attributes[j] as GPUVertexAttribute;
                attrOld.push({
                    offset: attr.offset,
                    format: attr.format,
                });
            }
            for (let j = 0; j < attrLen; j++) {
                const attr = attributes[j] as GPUVertexAttribute;
                if (attr.format === 'uint8x4') {
                    attr.format = 'float32x4';
                    for (let k = 0; k < attrLen; k++) {
                        const attr2 = attributes[k] as GPUVertexAttribute;
                        if (attr2.offset > attr.offset)
                            attr2.offset += 12;
                        attrNew.push({
                            offset: attr2.offset,
                            format: attr2.format,
                        });
                    }
                    bufferState.updateBufferLayoutFlag++;
                    const strideOld = vs.arrayStride;
                    const vertexCount = vb.buffer.byteLength / vs.arrayStride;
                    vs.arrayStride += 12;

                    const strideNew = vs.arrayStride;
                    const buffer = vb.buffer;
                    const buffer2 = new ArrayBuffer(vs.arrayStride * vertexCount);
                    const src_ui8 = new Uint8Array(buffer);
                    const src_f32 = new Float32Array(buffer);
                    const dst_ui8 = new Uint8Array(buffer2);
                    const dst_f32 = new Float32Array(buffer2);
                    let src_ui8_off1 = 0;
                    let src_f32_off1 = 0;
                    let dst_ui8_off1 = 0;
                    let dst_f32_off1 = 0;
                    let src_ui8_off2 = 0;
                    let src_f32_off2 = 0;
                    let dst_ui8_off2 = 0;
                    let dst_f32_off2 = 0;
                    //拷贝数据（按照新的数据布局）
                    for (let k = 0; k < vertexCount; k++) {
                        src_ui8_off1 = k * strideOld;
                        src_f32_off1 = k * strideOld / 4;
                        dst_ui8_off1 = k * strideNew;
                        dst_f32_off1 = k * strideNew / 4;
                        for (let l = 0; l < attrLen; l++) {
                            if (attrOld[l].format === 'uint8x4') {
                                if (l === j) {
                                    src_ui8_off2 = src_ui8_off1 + attrOld[l].offset;
                                    dst_f32_off2 = dst_f32_off1 + attrNew[l].offset / 4;
                                    for (let m = 0; m < 4; m++)
                                        dst_f32[dst_f32_off2 + m] = src_ui8[src_ui8_off2 + m];
                                } else {
                                    src_ui8_off2 = src_ui8_off1 + attrOld[l].offset;
                                    dst_ui8_off2 = dst_ui8_off1 + attrNew[l].offset;
                                    for (let m = 0; m < 4; m++)
                                        dst_ui8[dst_ui8_off2 + m] = src_ui8[src_ui8_off2 + m];
                                }
                            } else {
                                src_f32_off2 = src_f32_off1 + attrOld[l].offset / 4;
                                dst_f32_off2 = dst_f32_off1 + attrNew[l].offset / 4;
                                for (let m = 0; m < 4; m++)
                                    dst_f32[dst_f32_off2 + m] = src_f32[src_f32_off2 + m];
                            }
                        }
                    }
                    vb.source?.release();
                    vb.source = new WebGPUBuffer(vb.source._usage, vs.arrayStride * vertexCount);
                    vb.source.setData(buffer2, 0);
                    attrOld = attrNew;
                    attrNew = [];
                }
            }
        }
    }

    /**
     * 渲染
     * @param context 
     * @param command 
     * @param bundle 
     */
    _render(context: WebGPURenderContext3D, command: WebGPURenderCommandEncoder, bundle: WebGPURenderBundle) {
        //如果command和bundle都是null，则只上传shaderData数据，不执行bindGroup操作
        let triangles = 0;
        if (!this.geometry.checkDataFormat) {
            this._changeDataFormat(); //转换数据格式
            this.geometry.checkDataFormat = true;
        }
        if (this.isRender) {
            for (let i = 0; i < this._passNum; i++) {
                const index = this._passIndex[i];
                let pipeline = this._pipeline[index];
                const shaderInstance = this._shaderInstances[index];
                if (shaderInstance && shaderInstance.complete) {
                    this._getDepthStencilState(shaderInstance, context.destRT); //更新Stencil信息
                    if (WebGPUGlobal.useCache) { //启用缓存机制
                        let stateKey = this._calcStateKey(shaderInstance, context.destRT, context);
                        if (this._stateKey[index] !== stateKey || !pipeline) {
                            this._stateKey[index] = stateKey;
                            pipeline = this._pipeline[index] = shaderInstance.renderPipelineMap.get(stateKey);
                        }
                        if (!pipeline) {
                            pipeline = this._createPipeline(index, context, shaderInstance, command, bundle, stateKey); //新建渲染管线
                        } else { //缓存命中
                            if (command) {
                                if (WebGPUGlobal.useGlobalContext)
                                    WebGPUContext.setCommandPipeline(command, pipeline);
                                else command.setPipeline(pipeline);
                            }
                            if (bundle) {
                                if (WebGPUGlobal.useGlobalContext)
                                    WebGPUContext.setBundlePipeline(bundle, pipeline);
                                else bundle.setPipeline(pipeline);
                            }
                        }
                    } else this._createPipeline(index, context, shaderInstance, command, bundle); //不启用缓存机制
                    if (command || bundle) {
                        this._bindGroup(shaderInstance, command, bundle); //绑定资源组
                        this._uploadStencilReference(command); //上传模板参考值，bundle不支持
                    }
                    this._uploadUniform(); //上传uniform数据
                    triangles += this._uploadGeometry(command, bundle); //上传几何数据
                }
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