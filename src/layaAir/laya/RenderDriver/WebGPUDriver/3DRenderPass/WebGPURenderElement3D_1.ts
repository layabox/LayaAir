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
import { WebGPURenderEngine } from "../RenderDevice/WebGPURenderEngine";
import { WebGPURenderGeometry } from "../RenderDevice/WebGPURenderGeometry";
import { DepthStencilParam, getDepthStencilParamFromMaterial, getDepthStencilParamFromShader, IRenderPipelineInfo, WebGPUBlendState, WebGPUBlendStateCache, WebGPUDepthStencilState, WebGPUDepthStencilStateCache } from "../RenderDevice/WebGPURenderPipelineHelper";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUShaderInstance } from "../RenderDevice/WebGPUShaderInstance";
import { WebGPUUniformBufferBase } from "../RenderDevice/WebGPUUniform/WebGPUUniformBufferBase";
import { WebGPUBaseRenderNode } from "./WebGPUBaseRenderNode";
import { WebGPURenderContext3D } from "./WebGPURenderContext3D";
import { WebGPURenderElement3D } from "./WebGPURenderElement3D";

export function compareCahceFlag(changeFlag: Vector2, cacheFlag: Vector2) {
    let needUpdate = false;
    if (changeFlag.x > cacheFlag.x)
        needUpdate = true;
    else if (changeFlag.x === cacheFlag.x) {
        needUpdate = changeFlag.y > cacheFlag.y;
    }
    return needUpdate
}

export function coverCahceFlag(coverFlag: Vector2, oldFlag: Vector2) {
    let needUpdate = false;
    if (coverFlag.x > oldFlag.x)
        needUpdate = true;
    else if (coverFlag.x === oldFlag.x) {
        needUpdate = coverFlag.y > oldFlag.y;
    }
    if (needUpdate) {
        coverFlag.cloneTo(oldFlag);
    }
    return;
}


export class oneDrawPassCacheInfo {
    matCacheFlag: Vector2 = new Vector2();
    passDefineCacheFlag: Vector2 = new Vector2();
    drawInfos: oneDrawCacheInfo[] = [];
}

//记录一个RenderElement 一次DrawCall的缓存数据
export class oneDrawCacheInfo {
    shaderInstance: WebGPUShaderInstance;
    pipeline: GPURenderPipeline;
    shaderChange: boolean;
    pipeLineCacheFlag: Vector2 = new Vector2();//和global的BindGroup引起的pipeline的更新Flag做对比
    defineCacheFlag: Vector2 = new Vector2();//define的改动cache数据
}

/**
 * 基本渲染单元
 */
export class WebGPURenderElement3D_1 implements IRenderElement3D, IRenderPipelineInfo {
    static _matChangeFlagMap: Map<string, Map<number, Vector2[]>> = new Map();//根据shaderpass name 来取到Map，根据shaderDataID，拿到三个change变量，1、Bindgroup，2、bindgroupLayout，3defineFlag

    static _compileDefine: WebDefineDatas = new WebDefineDatas();

    private _geometryID: number = null;
    private _geometry: WebGPURenderGeometry;
    public get geometry(): WebGPURenderGeometry {
        return this._geometry;
    }
    public set geometry(value: WebGPURenderGeometry) {
        if (value?.getStateCacheID() != this._geometryID) {
            this._needUpdatePipeline();
        }

        this._geometryID = value?.getStateCacheID();
        this._geometry = value;
    }


    private materialUBO: WebGPUUniformBufferBase;

    //override
    private _materialRenderDataChange: boolean = false;
    private _materialShaderData: WebGPUShaderData;
    public get materialShaderData(): WebGPUShaderData {
        return this._materialShaderData;
    }
    public set materialShaderData(value: WebGPUShaderData) {
        if (this.materialShaderData != value) {
            this._materialShaderData = value;
            this._matChangeFlag.setValue(Stat.loopCount, WebGPURenderEngine._framePassCount)
        }
    }

    materialRenderQueue: number;

    materialId: number;

    renderShaderData: WebGPUShaderData;

    transform: Transform3D;

    canDynamicBatch: boolean;

    isRender: boolean;

    declare owner: WebGPUBaseRenderNode;

    private _subShader: SubShader;
    public get subShader(): SubShader {
        return this._subShader;
    }
    public set subShader(value: SubShader) {
        if (this.subShader != value) {
            this._subShader = value;
            this._matChangeFlag.setValue(Stat.loopCount, WebGPURenderEngine._framePassCount);
        }
    }

    //@renderPipeline Interface TODO
    private _blendStateKey: number = null;
    private _blendState: WebGPUBlendStateCache;

    public get blendState(): WebGPUBlendStateCache {
        return this._blendState;
    }
    public set blendState(value: WebGPUBlendStateCache) {
        if (value?.key != this._blendStateKey) {
            this._needUpdatePipeline();
        }
        this._blendStateKey = value?.key;
        this._blendState = value;
    }
    //@renderPipeline Interface
    private _depthStencilStateID: number = null;
    private _depthStencilState: WebGPUDepthStencilStateCache;
    public get depthStencilState(): WebGPUDepthStencilStateCache {
        return this._depthStencilState;
    }
    public set depthStencilState(value: WebGPUDepthStencilStateCache) {
        if (value?.id != this._depthStencilStateID) {
            this._needUpdatePipeline();
        }

        this._depthStencilStateID = value?.id;
        this._depthStencilState = value;
    }
    //@renderPipeline Interface
    private _cullMode: CullMode;
    public get cullMode(): CullMode {
        return this._cullMode;
    }
    public set cullMode(value: CullMode) {
        if (value !== this._cullMode) {
            this._needUpdatePipeline();
        }

        this._cullMode = value;
    }
    //@renderPipeline Interface
    private _frontFace: FrontFace;
    public get frontFace(): FrontFace {
        return this._frontFace;
    }
    public set frontFace(value: FrontFace) {
        if (value !== this._frontFace) {
            this._needUpdatePipeline();
        }
        this._frontFace = value;
    }

    protected _invertFrontFace: boolean;

    protected depthStencilParam: DepthStencilParam = new DepthStencilParam(); //模板参数

    protected _passRenderInfo: Map<number, oneDrawPassCacheInfo> = new Map();

    nodeBindGroupCacheFlag: Vector2 = new Vector2();//cache flag
    nodeBindGroup: WebGPUBindGroup;


    matBindGroupCacheFlag: Vector2 = new Vector2();
    matBindGroup: WebGPUBindGroup;

    protected _matChangeFlag: Vector2 = new Vector2();//记录material变化时间
    protected _matDefChangeFlag: Vector2;//记录宏的变化时间
    protected _matBindGroupChangeFlag: Vector2;//记录Material的bindGroup的记录时间
    protected _matBindGroupLayoutFlag: Vector2;//记录Material的BindGroupLayout的记录时间

    protected _bindGroupMap: Map<number, WebGPUBindGroup> = new Map();
    protected _pipelineChangeFlag: Vector2 = new Vector2();
    private _drawCacheArray: oneDrawCacheInfo[];
    private _drawPassInfo: oneDrawPassCacheInfo;
    private _cacheMatBlendStateID: number;
    private _cacheMatDepthStencilID: string;
    private _cacheMatCullMode: CullMode;

    /** @internal */
    _needUpdatePipeline() {
        this._pipelineChangeFlag.setValue(Stat.loopCount, WebGPURenderEngine._framePassCount);
    }

    constructor() {
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

        if (this.renderShaderData) {
            comDef.addDefineDatas(this.renderShaderData.getDefineData());
        }

        if (this.materialShaderData) {
            comDef.addDefineDatas(this.materialShaderData._defineDatas);
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

            if (this.renderShaderData) {
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
                let oneInfo = new oneDrawCacheInfo();
                oneInfo.shaderChange = true;
                oneInfo.shaderInstance = shaderIns;
                this._drawCacheArray[renderCount] = oneInfo;
            }
            renderCount++;
        }
        this._drawCacheArray.length = renderCount;
    }

    private _updateMatChangeFlag() {
        if (compareCahceFlag(this._matChangeFlag, this._drawPassInfo.matCacheFlag)) {//MaterialShaderData变动或者shader变动
            this._materialRenderDataChange = true;
            this._drawPassInfo.matCacheFlag.setValue(Stat.loopCount, WebGPURenderEngine._framePassCount);
            let shadername = this.subShader.owner.name;
            if (!WebGPURenderElement3D_1._matChangeFlagMap.has(shadername))
                WebGPURenderElement3D_1._matChangeFlagMap.set(shadername, new Map())
            let shadermap = WebGPURenderElement3D_1._matChangeFlagMap.get(shadername);
            if (!shadermap.has(this.materialShaderData._id)) {
                let flagArray = [new Vector2(Stat.loopCount, WebGPURenderEngine._framePassCount), new Vector2(Stat.loopCount, WebGPURenderEngine._framePassCount), new Vector2(Stat.loopCount, WebGPURenderEngine._framePassCount)];
                shadermap.set(this.materialShaderData._id, flagArray);
                this.materialShaderData.addBindGroupChangeLink(this.subShader._owner.name, this.subShader._uniformMap)
                this.materialShaderData.addBindGroupChangeFlag(this.subShader._owner.name, flagArray[0], flagArray[1]);
                this.materialShaderData._defineDatas.addChangeFlagInfo(flagArray[2]);
            }
            let flagArray = shadermap.get(this.materialShaderData._id);
            this._matBindGroupChangeFlag = flagArray[0];
            this._matBindGroupLayoutFlag = flagArray[1];
            this._matDefChangeFlag = flagArray[2];
            let subShader = this.subShader;
            this.materialUBO = this.materialShaderData.createSubUniformBuffer("Material", subShader._owner.name, subShader._uniformMap);
        }
    }


    /**
     * 渲染前更新,更新所有Buffer
     * @param context 
     */
    _preUpdatePre(context: WebGPURenderContext3D) {

        if (!this._passRenderInfo.has(context._curRenderGlobalKey)) {
            this._drawPassInfo = new oneDrawPassCacheInfo();
            this._passRenderInfo.set(context._curRenderGlobalKey, this._drawPassInfo);
        } else {
            this._drawPassInfo = this._passRenderInfo.get(context._curRenderGlobalKey);
        }
        this._drawCacheArray = this._drawPassInfo.drawInfos;
        this._updateMatChangeFlag();

        //shader变了或者宏变了 
        let passDefineChangeFlag = this._drawPassInfo.passDefineCacheFlag;
        if (this._materialRenderDataChange || //材质是否变化
            compareCahceFlag(this._matDefChangeFlag, passDefineChangeFlag) ||//material宏是否变化
            (this.owner && compareCahceFlag(this.owner.defineDataChangeFlag, passDefineChangeFlag) ||//sprite是否宏变化
                compareCahceFlag(context._curDefineChangeFlag, passDefineChangeFlag)) //判断场景中的宏是否变化
        ) {//如果宏变了 也要弄
            passDefineChangeFlag.setValue(Stat.loopCount, WebGPURenderEngine._framePassCount);
            this._compileShader(context);
        }

        let cullmode = this.materialShaderData.getInt(Shader3D.CULL);
        cullmode = cullmode ? cullmode : RenderState.CULL_NONE;
        let depthStencilID = this.materialShaderData.depthStencilStateKey;
        let blendid = this._materialShaderData.blendStateCache ? this._materialShaderData.blendStateCache.id : -1;
        if (this._cacheMatCullMode != cullmode ||
            this._cacheMatDepthStencilID != depthStencilID ||
            this._cacheMatBlendStateID != blendid) {
            this._cacheMatBlendStateID = blendid;
            this._cacheMatDepthStencilID = depthStencilID;
            this._cacheMatCullMode = cullmode;
            this._needUpdatePipeline();
        }
        this._materialRenderDataChange = false;
        // material ubo
        this.materialUBO && this.materialUBO.upload();

        //是否反转面片
        this._invertFrontFace = this._getInvertFront();
        return;
    }

    /**
     * 提交渲染指令
     * @param context 
     * @param command 
     * @param bundle 
     */
    _render(context: WebGPURenderContext3D, command: WebGPURenderCommandEncoder | WebGPURenderBundle) {
        if (!this.isRender) {
            return 0;
        }

        if (this._drawCacheArray && this._drawCacheArray.length == 0) return 0;

        for (let j: number = 0, m: number = this._drawCacheArray.length; j < m; j++) {
            let drawInfo = this._drawCacheArray[j];
            let shaderInstance = drawInfo.shaderInstance;
            if (!shaderInstance.complete)
                return 0;

            //set BindGroup
            this._bindGroup(context, shaderInstance, command); //绑定资源组
            let pipelineCache = drawInfo.pipeLineCacheFlag;
            //1、context的pipeline变化(destRT和BindGroup资源引起的pipelineLayout变化)
            //2、自身属性变化引起的pipeline变化
            if (drawInfo.shaderChange ||
                context._pipelineChange ||
                compareCahceFlag(this._pipelineChangeFlag, pipelineCache)) {
                this._bindGroupMap.clear();
                this._bindGroupMap.set(0, context._sceneBindGroup);
                this._bindGroupMap.set(1, context._cameraBindGroup);
                this._bindGroupMap.set(2, this.nodeBindGroup);
                this._bindGroupMap.set(3, this.matBindGroup);
                drawInfo.shaderChange = false;
                drawInfo.pipeline = this._getWebGPURenderPipeline(drawInfo.shaderInstance, context.destRT, context);
                drawInfo.pipeLineCacheFlag.setValue(Stat.loopCount, WebGPURenderEngine._framePassCount);
            }
            command.setPipeline(drawInfo.pipeline);
            if (!command.isBundle && this.depthStencilParam.stencilEnable) {
                (command as WebGPURenderCommandEncoder).setStencilReference(this.depthStencilParam.stencilRef);
            }

            this._uploadGeometry(command); //上传几何数据 draw
        }

        return 0;
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
        if (this.materialShaderData) {
            this._getBlendState(shaderInstance);
            this._getDepthStencilState(shaderInstance, dest);
            this._getCullFrontMode(this.materialShaderData, shaderInstance, this._invertFrontFace, context.invertY);
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
            this.blendState = this._getRenderStateBlendByShader(this.materialShaderData, shaderInstance);
        else {
            this.blendState = this.materialShaderData.blendStateCache;
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
                this.depthStencilState = this._getRenderStateDepthByShader(this.materialShaderData, shaderInstance, dest);
            else this.depthStencilState = this._getRenderStateDepthByMaterial(this.materialShaderData, dest);
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
     * @param shaderInstance 
     * @param command 
     * @param bundle 
     */
    protected _bindGroup(context: WebGPURenderContext3D, shaderInstance: WebGPUShaderInstance, command: WebGPURenderCommandEncoder | WebGPURenderBundle) {
        {
            command.setBindGroup(0, context._sceneBindGroup);
        }
        {
            command.setBindGroup(1, context._cameraBindGroup);
        }
        {
            //判断 nodePipeline是否有改变
            if (this.owner) {
                let bindgroupChangeFlag = this.owner.bindGroupChangeFlag;
                if (compareCahceFlag(bindgroupChangeFlag, this.nodeBindGroupCacheFlag)) {
                    this.nodeBindGroupCacheFlag.setValue(Stat.loopCount, WebGPURenderEngine._framePassCount);
                    let shaderResource = shaderInstance.uniformSetMap.get(2);
                    let textureExitsMask = shaderInstance.uniformTextureExits.get(2);

                    let commands = this.owner?._commonUniformMap;
                    let shaderData = this.owner?.shaderData as WebGPUShaderData;
                    let addition = this.owner?.additionShaderData;
                    this.nodeBindGroup = WebGPURenderEngine._instance.bindGroupCache.getBindGroup(commands, shaderData, addition, shaderResource, textureExitsMask);
                    coverCahceFlag(this.owner.bindGroupLayoutChangeFlag, this._pipelineChangeFlag);
                }
            } else {
                this.nodeBindGroup = WebGPUBindGroupCache.emptyBindGroup;
            }
            command.setBindGroup(2, this.nodeBindGroup);
        }
        {
            if (this.materialShaderData) {
                if (compareCahceFlag(this._matBindGroupChangeFlag, this.matBindGroupCacheFlag)) {
                    this.matBindGroupCacheFlag.setValue(Stat.loopCount, WebGPURenderEngine._framePassCount);
                    let shaderResource = shaderInstance.uniformSetMap.get(3);
                    let textureExitsMask = shaderInstance.uniformTextureExits.get(3);

                    this.matBindGroup = WebGPURenderEngine._instance.bindGroupCache.getBindGroup([this.subShader._owner.name], this.materialShaderData, null, shaderResource, textureExitsMask);
                    coverCahceFlag(this._matBindGroupLayoutFlag, this._pipelineChangeFlag);
                }
                command.setBindGroup(3, this.matBindGroup);
            } else {
                this.matBindGroup = WebGPUBindGroupCache.emptyBindGroup;
            }
        }
    }

    /**
     * 上传几何数据
     * @param command 
     * @param bundle 
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
        this.materialUBO = null;
        this._passRenderInfo.clear();
    }
}