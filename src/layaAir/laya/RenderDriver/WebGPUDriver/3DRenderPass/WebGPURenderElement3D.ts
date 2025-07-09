import { CullMode, FrontFace } from "../../../RenderEngine/RenderEnum/CullMode";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { Transform3D } from "../../../d3/core/Transform3D";
import { Vector2 } from "../../../maths/Vector2";
import { Stat } from "../../../utils/Stat";
import { IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebShaderPass } from "../../RenderModuleData/WebModuleData/WebShaderPass";
import { WebGPUBindGroup, WebGPUBindGroupCache } from "../RenderDevice/WebGPUBindGroupCache";
import { WebGPURenderBundle } from "../RenderDevice/WebGPUBundle/WebGPURenderBundle";
import { WebGPUInternalRT } from "../RenderDevice/WebGPUInternalRT";
import { WebGPURenderCommandEncoder } from "../RenderDevice/WebGPURenderCommandEncoder";
import { OneDrawPassCacheInfo, OneDrawCacheInfo, compareCahceFlag, coverCahceFlag } from "../RenderDevice/WebGPURenderDeviceFactory";
import { WebGPURenderEngine } from "../RenderDevice/WebGPURenderEngine";
import { WebGPURenderGeometry } from "../RenderDevice/WebGPURenderGeometry";
import { DepthStencilParam, getDepthStencilParamFromMaterial, getDepthStencilParamFromShader, IRenderPipelineInfo, WebGPUBlendState, WebGPUBlendStateCache, WebGPUDepthStencilState, WebGPUDepthStencilStateCache } from "../RenderDevice/WebGPURenderPipelineHelper";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUShaderInstance } from "../RenderDevice/WebGPUShaderInstance";
import { WebGPUUniformBufferBase } from "../RenderDevice/WebGPUUniform/WebGPUUniformBufferBase";
import { WebGPUBaseRenderNode } from "./WebGPUBaseRenderNode";
import { WebGPURenderContext3D } from "./WebGPURenderContext3D";



/**
 * 基本渲染单元
 */
export class WebGPURenderElement3D implements IRenderElement3D, IRenderPipelineInfo {
    static _matChangeFlagMap: Map<string, Map<number, Vector2[]>> = new Map();//根据shaderpass name 来取到Map，根据shaderDataID，拿到三个change变量，1、Bindgroup，2、bindgroupLayout，3defineFlag

    static _compileDefine: WebDefineDatas = new WebDefineDatas();

    protected _materialUBO: WebGPUUniformBufferBase;
    //material是否改变
    protected _materialRenderDataChange: boolean = false;
    //spriteRenderNode是否改变
    protected _spriteRenderDataChange: boolean = false;

    protected _materialShaderData: WebGPUShaderData;

    protected _renderShaderData: WebGPUShaderData;

    protected _subShader: SubShader;

    protected _invertFrontFace: boolean;

    //生成pipeline的时候使用
    protected _bindGroupMap: Map<number, WebGPUBindGroup> = new Map();

    materialRenderQueue: number;

    materialId: number;

    transform: Transform3D;

    canDynamicBatch: boolean;

    isRender: boolean;

    declare owner: WebGPUBaseRenderNode;

    blendState: WebGPUBlendStateCache;

    depthStencilState: WebGPUDepthStencilStateCache;

    cullMode: CullMode;

    frontFace: FrontFace;

    geometry: WebGPURenderGeometry;

    protected depthStencilParam: DepthStencilParam = new DepthStencilParam(); //模板参数
    //cache Data
    //缓存每个pass的渲染信息
    protected _passRenderInfo: Map<number, OneDrawPassCacheInfo> = new Map();
    protected _drawPassInfo: OneDrawPassCacheInfo;//当前渲染pass的渲染数据组信息
    protected _drawCacheArray: OneDrawCacheInfo[];//当前渲染pass的渲染数据

    //renderElement本身资源改动
    protected _matChangeFlag: Vector2 = new Vector2();//记录material改动
    protected _renderNodeChangeFlag: Vector2 = new Vector2();
    protected _pipelineChangeFlag: Vector2 = new Vector2();
    protected _cacheGeometryStateID: number = -1;

    //记录mat自身资源改动
    protected _matDefChangeFlag: Vector2;
    protected _matBindGroupChangeFlag: Vector2;
    protected _matBindGroupLayoutFlag: Vector2;

    //记录混合信息的cache信息
    protected _cacheMatBlendStateID: number;
    protected _cacheMatDepthStencilID: string;
    protected _cacheMatCullMode: CullMode;



    public get materialShaderData(): WebGPUShaderData {
        return this._materialShaderData;
    }

    public set materialShaderData(value: WebGPUShaderData) {
        if (this._materialShaderData != value) {
            this._materialShaderData = value;
            this._matChangeFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount)
        }
    }

    public get renderShaderData(): WebGPUShaderData {
        return this._renderShaderData;
    }

    public set renderShaderData(value: WebGPUShaderData) {
        if (this._renderShaderData != value) {
            this._renderShaderData = value;
            this._renderNodeChangeFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount);
        }
    }

    public get subShader(): SubShader {
        return this._subShader;
    }

    public set subShader(value: SubShader) {
        if (this._subShader != value) {
            this._subShader = value;
            this._matChangeFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount);
        }
    }



    constructor() {
    }

    /** @internal */
    protected _needUpdatePipeline() {
        this._pipelineChangeFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount);
    }

    /**
     * 是否反转面片
     */
    protected _getInvertFront(): boolean {
        const transform = this.owner?.transform;
        return transform ? transform._isFrontFaceInvert : false;
    }


    protected _getShaderInstanceDefines(context: WebGPURenderContext3D) {
        let comDef = WebGPURenderElement3D._compileDefine;

        const globalShaderDefines = context._cacheGlobalDefines;

        globalShaderDefines.cloneTo(comDef);

        if (this._renderShaderData) {
            comDef.addDefineDatas(this._renderShaderData.getDefineData());
        }

        if (this._materialShaderData) {
            comDef.addDefineDatas(this._materialShaderData._defineDatas);
        }

        if (this.owner) {
            let additionShaderData = this.owner.additionShaderData;
            if (additionShaderData.size > 0) {
                for (let [key, value] of additionShaderData.entries()) {
                    comDef.addDefineDatas(value.getDefineData());
                }
            }
        }
        return comDef;
    }

    /**
     * 编译着色器
     * @param context 
     */
    protected _compileShader(context: WebGPURenderContext3D) {
        let comDef = this._getShaderInstanceDefines(context);
        //查找着色器对象缓存
        var passes: ShaderPass[] = this.subShader._passes;
        let renderCount = 0;
        for (var j: number = 0, m: number = passes.length; j < m; j++) {
            let pass = passes[j];
            let passdata = <WebShaderPass>pass.moduleData;
            if (passdata.pipelineMode !== context.pipelineMode)
                continue;

            if (this._renderShaderData) {
                passdata.nodeCommonMap = this.owner._commonUniformMap;
            } else {
                passdata.nodeCommonMap = null;
            }

            passdata.additionShaderData = null;
            if (this.owner) {
                passdata.additionShaderData = this.owner._additionShaderDataKeys;
            }

            let attributeLocations = this.geometry.bufferState._attriLocArray;
            pass.moduleData.attributeLocations = attributeLocations;

            var shaderIns = pass.withCompile(comDef, false) as WebGPUShaderInstance;
            if (this._drawCacheArray[renderCount]) {
                let oneInfo = this._drawCacheArray[renderCount];
                if (oneInfo.shaderInstance != shaderIns) {
                    oneInfo.shaderChange = true;
                    oneInfo.shaderInstance = shaderIns;
                }
            } else {
                let oneInfo = new OneDrawCacheInfo();
                oneInfo.shaderChange = true;
                oneInfo.shaderInstance = shaderIns;
                this._drawCacheArray[renderCount] = oneInfo;
            }
            renderCount++;
        }
        this._drawCacheArray.length = renderCount;
    }

    protected _updateMatChangeFlag() {
        this._materialRenderDataChange = compareCahceFlag(this._matChangeFlag, this._drawPassInfo.matCacheFlag)//MaterialShaderData变动或者shader变动
        if (this._renderShaderData && compareCahceFlag(this._renderNodeChangeFlag, this._drawPassInfo.nodeCacheFlag)) {
            this._drawPassInfo.nodeCacheFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount);
            this._spriteRenderDataChange = true;
        } else {
            this._spriteRenderDataChange = false;
        }
    }

    protected _handleMaterialChange() {
        this._drawPassInfo.matCacheFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount);
        let shadername = this._subShader._owner.name;
        if (!WebGPURenderElement3D._matChangeFlagMap.has(shadername))
            WebGPURenderElement3D._matChangeFlagMap.set(shadername, new Map())
        let shadermap = WebGPURenderElement3D._matChangeFlagMap.get(shadername);
        if (!shadermap.has(this._materialShaderData._id)) {
            let flagArray = [new Vector2(Stat.loopCount, WebGPURenderEngine._instance._framePassCount), new Vector2(Stat.loopCount, WebGPURenderEngine._instance._framePassCount), new Vector2(Stat.loopCount, WebGPURenderEngine._instance._framePassCount)];
            shadermap.set(this._materialShaderData._id, flagArray);
            this._materialShaderData.addBindGroupChangeLink(this._subShader._owner.name, this._subShader._uniformMap)
            this._materialShaderData.addBindGroupChangeFlag(this._subShader._owner.name, flagArray[0], flagArray[1]);
            this._materialShaderData._defineDatas.addChangeFlagInfo(flagArray[2]);
        }
        let flagArray = shadermap.get(this._materialShaderData._id);
        this._matBindGroupChangeFlag = flagArray[0];
        this._matBindGroupLayoutFlag = flagArray[1];
        this._matDefChangeFlag = flagArray[2];
        let subShader = this._subShader;

        this._materialUBO = this._materialShaderData.createSubUniformBuffer("Material", subShader._owner.name, subShader._uniformMap);

    }

    protected _updateNodeUBO() {
        let owner = this.owner;
        if (owner) {
            if (owner.spriteUBO0) {
                owner.spriteUBO0.upload();
            } else {
                owner.spriteUBOs.forEach(ubo => {
                    ubo.upload();
                })
            }

            if (owner.additionalUBO0) {
                owner.additionalUBO0.upload();
            } else {
                owner.additionalUBOs.forEach(ubo => {
                    ubo.upload();
                });
            }
        }
    }


    /**
     * 渲染前更新,更新所有Buffer
     * @param context 
     */
    _preUpdatePre(context: WebGPURenderContext3D) {
        if (!this._passRenderInfo.has(context._curRenderGlobalKey)) {
            this._drawPassInfo = new OneDrawPassCacheInfo();
            this._passRenderInfo.set(context._curRenderGlobalKey, this._drawPassInfo);
        } else {
            this._drawPassInfo = this._passRenderInfo.get(context._curRenderGlobalKey);
        }
        this._drawCacheArray = this._drawPassInfo.drawInfos;

        this._updateMatChangeFlag();
        if (this.geometry.getStateCacheID() != this._cacheGeometryStateID) {
            this._needUpdatePipeline();
            this._cacheGeometryStateID = this.geometry.getStateCacheID();
        }
        //shader变了或者宏变了 
        let passDefineChangeFlag = this._drawPassInfo.passDefineCacheFlag;
        if (this._materialRenderDataChange || //材质是否变化
            !this._matDefChangeFlag ||
            compareCahceFlag(this._matDefChangeFlag, passDefineChangeFlag) ||//material宏是否变化
            (this.owner && compareCahceFlag(this.owner.defineDataChangeFlag, passDefineChangeFlag)) ||//sprite是否宏变化
            compareCahceFlag(context._curDefineChangeFlag, passDefineChangeFlag) ||//判断场景中的宏是否变化
            this._drawPassInfo.geometryStateID != this._cacheGeometryStateID) {
            passDefineChangeFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount);
            this._compileShader(context);
            this._drawPassInfo.geometryStateID = this._cacheGeometryStateID;
        }

        if (this._materialRenderDataChange) {
            this._handleMaterialChange();
        }

        let cullmode = this._materialShaderData.getInt(Shader3D.CULL);
        cullmode = cullmode ? cullmode : RenderState.CULL_NONE;
        let depthStencilID = this._materialShaderData.depthStencilStateKey;
        let blendid = this._materialShaderData.blendStateCache ? this._materialShaderData.blendStateCache.id : -1;
        if (this._cacheMatCullMode != cullmode ||
            this._cacheMatDepthStencilID != depthStencilID ||
            this._cacheMatBlendStateID != blendid) {
            this._cacheMatBlendStateID = blendid;
            this._cacheMatDepthStencilID = depthStencilID;
            this._cacheMatCullMode = cullmode;
            this._needUpdatePipeline();
        }

        this._updateNodeUBO();

        // material ubo
        this._materialUBO && this._materialUBO.upload();



        //是否反转面片
        this._invertFrontFace = this._getInvertFront();
        return;
    }

    /**
     * 提交渲染指令
     * @param context 
     * @param command
     */
    _render(context: WebGPURenderContext3D, command: WebGPURenderCommandEncoder | WebGPURenderBundle) {
        if (!this.isRender) {
            return 0;
        }

        if (!this._drawCacheArray || this._drawCacheArray.length == 0) return 0;

        for (let j: number = 0, m: number = this._drawCacheArray.length; j < m; j++) {
            let drawInfo = this._drawCacheArray[j];
            let shaderInstance = drawInfo.shaderInstance;
            if (!shaderInstance.complete)
                return 0;

            //set BindGroup
            this._bindGroup(context, drawInfo, command); //绑定资源组
            let pipelineCache = drawInfo.pipeLineCacheFlag;
            //1、context的pipeline变化(destRT和BindGroup资源引起的pipelineLayout变化)
            //2、自身属性变化引起的pipeline变化
            if (drawInfo.shaderChange ||
                compareCahceFlag(context._pipelineChange, pipelineCache) ||
                compareCahceFlag(this._pipelineChangeFlag, pipelineCache)) {
                this._bindGroupMap.clear();
                this._bindGroupMap.set(0, context._sceneBindGroup);
                this._bindGroupMap.set(1, context._cameraBindGroup);
                this._bindGroupMap.set(2, drawInfo.nodeBindGroup);
                this._bindGroupMap.set(3, drawInfo.matBindGroup);
                drawInfo.shaderChange = false;
                drawInfo.pipeline = this._getWebGPURenderPipeline(drawInfo.shaderInstance, context.destRT, context);
                drawInfo.pipeLineCacheFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount);
            }
            command.setPipeline(drawInfo.pipeline);
            if (!command.isBundle && this.depthStencilParam.stencilEnable) {
                (command as WebGPURenderCommandEncoder).setStencilReference(this.depthStencilParam.stencilRef);
            }

            // this._uploadGeometry(command); //上传几何数据 draw
            this.geometry.applyToEncoder(command.encoder)
        }

        return 1;
    }

    /**
     * 获取渲染管线
     * @param shaderInstance 
     * @param dest 
     * @param context 
     * @param entries 
     * @param stateKey 
     */
    protected _getWebGPURenderPipeline(shaderInstance: WebGPUShaderInstance, dest: WebGPUInternalRT, context: WebGPURenderContext3D) {
        if (this._materialShaderData) {
            this._getBlendState(shaderInstance);
            this._getDepthStencilState(shaderInstance, dest);
            this._getCullFrontMode(this._materialShaderData, shaderInstance, this._invertFrontFace, context.invertY);
        }
        let pipeline = WebGPURenderEngine._instance.pipelineCache.getPipeline(this._bindGroupMap, this, shaderInstance, context.destRT);
        return pipeline;
    }

    /**
     * 获取混合状态
     * @param shaderInstance 
     */
    private _getBlendState(shaderInstance: WebGPUShaderInstance) {
        if ((shaderInstance._shaderPass as ShaderPass).statefirst)
            this.blendState = this._getRenderStateBlendByShader(this._materialShaderData, shaderInstance);
        else {
            this.blendState = this._materialShaderData.blendStateCache;
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

    /**
     * 获取深度缓存状态
     * @param shaderInstance 
     * @param dest 
     */
    private _getDepthStencilState(shaderInstance: WebGPUShaderInstance, dest: WebGPUInternalRT): void {
        if (dest._depthTexture) {
            if ((shaderInstance._shaderPass as ShaderPass).statefirst)
                this.depthStencilState = this._getRenderStateDepthByShader(this._materialShaderData, shaderInstance, dest);
            else this.depthStencilState = this._getRenderStateDepthByMaterial(this._materialShaderData, dest);
        } else this.depthStencilState = null;
    }

    private _getRenderStateDepthByShader(shaderData: WebGPUShaderData, shaderInstance: WebGPUShaderInstance, dest: WebGPUInternalRT) {
        getDepthStencilParamFromShader(shaderData, shaderInstance, dest, this.depthStencilParam);

        return WebGPUDepthStencilState.getDepthStencilState(dest.depthStencilFormat, this.depthStencilParam);
    }

    private _getRenderStateDepthByMaterial(shaderData: WebGPUShaderData, dest: WebGPUInternalRT) {
        getDepthStencilParamFromMaterial(shaderData, dest, this.depthStencilParam);

        return WebGPUDepthStencilState.getDepthStencilState(dest.depthStencilFormat, this.depthStencilParam);
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
     * 绑定资源组
     * @param context
     * @param shaderInstance 
     * @param command
     */
    protected _bindGroup(context: WebGPURenderContext3D, info: OneDrawCacheInfo, command: WebGPURenderCommandEncoder | WebGPURenderBundle) {

        let shaderInstance = info.shaderInstance;
        {
            //判断 nodePipeline是否有改变
            if (this.owner) {
                let bindgroupChangeFlag = this.owner.bindGroupChangeFlag;
                if (info.shaderChange || this._spriteRenderDataChange || compareCahceFlag(bindgroupChangeFlag, info.renderNodeBindGroupCacheFlag)) {
                    info.renderNodeBindGroupCacheFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount);
                    let shaderResource = shaderInstance.uniformSetMap.get(2);
                    let textureExitsMask = shaderInstance.uniformTextureExits.get(2);

                    let commands = this.owner?._commonUniformMap;
                    let shaderData = this.owner?.shaderData as WebGPUShaderData;
                    let addition = this.owner?.additionShaderData;
                    info.nodeBindGroup = WebGPURenderEngine._instance.bindGroupCache.getBindGroup(commands, shaderData, addition, shaderResource, textureExitsMask);
                    coverCahceFlag(this.owner.bindGroupLayoutChangeFlag, this._pipelineChangeFlag);
                }
            } else {
                info.nodeBindGroup = WebGPUBindGroupCache.emptyBindGroup;
            }
            command.setBindGroup(2, info.nodeBindGroup);
        }
        {
            if (this._materialShaderData) {
                if (info.shaderChange || this._materialRenderDataChange || compareCahceFlag(this._matBindGroupChangeFlag, info.matBindGroupCacheFlag)) {
                    info.matBindGroupCacheFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount);
                    let shaderResource = shaderInstance.uniformSetMap.get(3);
                    let textureExitsMask = shaderInstance.uniformTextureExits.get(3);

                    info.matBindGroup = WebGPURenderEngine._instance.bindGroupCache.getBindGroup([this._subShader._owner.name], this._materialShaderData, null, shaderResource, textureExitsMask);
                    coverCahceFlag(this._matBindGroupLayoutFlag, this._pipelineChangeFlag);
                }
            } else {
                info.matBindGroup = WebGPUBindGroupCache.emptyBindGroup;
            }
            command.setBindGroup(3, info.matBindGroup);
        }
    }

    /**
     * 上传几何数据
     * @param command
     */
    protected _uploadGeometry(command: WebGPURenderCommandEncoder | WebGPURenderBundle) {
        let triangles = 0;
        if (command) {
            triangles += command.applyGeometry(this.geometry);
        }
        return triangles;
    }

    protected _uploadGeometryIndex(command: WebGPURenderCommandEncoder | WebGPURenderBundle, index: number) {
        let triangles = 0;
        if (command) {
            triangles += command.applyGeometryIndex(this.geometry, index);
        }
        return triangles;
    }

    /**
     * 销毁
     */
    destroy() {
        //WebGPUGlobal.releaseId(this);
        this._materialUBO = null;
        this._passRenderInfo.clear();
    }
}