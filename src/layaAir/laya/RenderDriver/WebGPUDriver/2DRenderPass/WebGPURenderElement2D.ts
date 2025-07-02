import { LayaGL } from "../../../layagl/LayaGL";
import { Vector2 } from "../../../maths/Vector2";
import { CullMode, FrontFace } from "../../../RenderEngine/RenderEnum/CullMode";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { Stat } from "../../../utils/Stat";
import { IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { IRenderStruct2D } from "../../RenderModuleData/Design/2D/IRenderStruct2D";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPURenderElement3D } from "../3DRenderPass/WebGPURenderElement3D";
import { WebGPUBindGroup, WebGPUBindGroupCache } from "../RenderDevice/WebGPUBindGroupCache";
import { WebGPURenderBundle } from "../RenderDevice/WebGPUBundle/WebGPURenderBundle";
import { WebGPUCommandUniformMap } from "../RenderDevice/WebGPUCommandUniformMap";
import { WebGPUInternalRT } from "../RenderDevice/WebGPUInternalRT";
import { WebGPURenderCommandEncoder } from "../RenderDevice/WebGPURenderCommandEncoder";
import { OneDrawPassCacheInfo, OneDrawCacheInfo, compareCahceFlag, coverCahceFlag } from "../RenderDevice/WebGPURenderDeviceFactory";
import { WebGPURenderEngine } from "../RenderDevice/WebGPURenderEngine";
import { WebGPURenderGeometry } from "../RenderDevice/WebGPURenderGeometry";
import { DepthStencilParam, getDepthStencilParamFromMaterial, getDepthStencilParamFromShader, IRenderPipelineInfo, WebGPUBlendState, WebGPUBlendStateCache, WebGPUDepthStencilState, WebGPUDepthStencilStateCache } from "../RenderDevice/WebGPURenderPipelineHelper";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUShaderInstance } from "../RenderDevice/WebGPUShaderInstance";
import { WebGPUGlobal } from "../RenderDevice/WebGPUStatis/WebGPUGlobal";
import { WebGPUUniformBufferBase } from "../RenderDevice/WebGPUUniform/WebGPUUniformBufferBase";
import { WebGPURenderContext2D } from "./WebGPURenderContext2D";

const zeroFlag = new Vector2(0, 0);
export class WebGPURenderElement2D implements IRenderElement2D, IRenderPipelineInfo {

    static _compileDefine: WebDefineDatas = new WebDefineDatas();

    protected _nodeCommonMap: string[] = [];

    protected _value2DgpuRS: WebGPUBindGroup;

    protected depthStencilParam: DepthStencilParam = new DepthStencilParam(); //模板参数

    protected _geometryID: number = null;

    protected _materialShaderData: WebGPUShaderData;

    protected _value2DShaderData: WebGPUShaderData;

    protected _subShader: SubShader;

    protected _bindGroupMap: Map<number, WebGPUBindGroup> = new Map();

    //material是否改变
    protected _materialRenderDataChange: boolean = false;
    //spriteRenderNode是否改变
    protected _value2DRenderDataChange: boolean = false;

    //cache Data
    //缓存每个pass的渲染信息
    protected _passRenderInfo: Map<number, OneDrawPassCacheInfo> = new Map();
    protected _drawPassInfo: OneDrawPassCacheInfo;//当前渲染pass的渲染数据组信息
    protected _drawCacheArray: OneDrawCacheInfo[];//当前渲染pass的渲染数据

    //renderElement本身资源改动
    protected _matChangeFlag: Vector2 = new Vector2();//记录material改动
    protected _pipelineChangeFlag: Vector2 = new Vector2();
    protected _valueChangeFlag: Vector2 = new Vector2();
    protected _cacheGeometryStateID: number = -1;


    //记录mat自身资源改动
    protected _matDefChangeFlag: Vector2;
    protected _matBindGroupChangeFlag: Vector2;
    protected _matBindGroupLayoutFlag: Vector2;
    protected _materialUBO: WebGPUUniformBufferBase;

    //记录Value2D自身的资源改动
    protected _value2DDefChangeFlag: Vector2 = new Vector2();
    protected _value2DBindGroupChangeFlag: Vector2 = new Vector2();
    protected _value2DBindGroupLayoutFlag: Vector2 = new Vector2();
    protected _value2DUBOs: WebGPUUniformBufferBase[] = [];



    //记录混合信息的cache信息
    protected _cacheMatBlendStateID: number;
    protected _cacheMatDepthStencilID: string;
    protected _cacheMatCullMode: CullMode;

    protected _additionShaderData: Map<string, WebGPUShaderData> = new Map();;
    protected _additinalArray: string[] = [];

    //get pipeline blend State
    blendState: WebGPUBlendStateCache;
    depthStencilState: WebGPUDepthStencilStateCache;
    cullMode: CullMode;
    frontFace: FrontFace;

    type: number = 0;

    owner: IRenderStruct2D;

    renderStateIsBySprite: boolean = true;

    geometry: WebGPURenderGeometry;


    public get materialShaderData(): WebGPUShaderData {
        return this._materialShaderData;
    }

    public set materialShaderData(value: WebGPUShaderData) {
        if (this._materialShaderData != value) {
            this._materialShaderData = value;
            this._matChangeFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount)
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

    public get value2DShaderData(): WebGPUShaderData {
        return this._value2DShaderData;
    }

    public set value2DShaderData(value: WebGPUShaderData) {
        if (this._value2DShaderData != value) {
            this._valueChangeFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount);
            let oldCommandMap = this._nodeCommonMap.slice();
            if (this._value2DShaderData) {
                //移除之前的资源绑定
                this.nodeCommonMap = [];
            }
            this._value2DShaderData = value;
            this.nodeCommonMap = oldCommandMap;
        }
    }

    public get nodeCommonMap(): string[] {
        return this._nodeCommonMap;
    }

    public set nodeCommonMap(value: string[]) {
        this._valueChangeFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount);
        //消除之前的影响
        //判断没有了的uniformMap,删除link
        if (this._nodeCommonMap.length > 0) {
            this._nodeCommonMap.forEach(element => {
                if (value.indexOf(element) == -1) {
                    let unifomrMap = <WebGPUCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap(element);
                    this._value2DShaderData.removeBindGroupChangeLink(element, unifomrMap._idata);
                }
            })
            this._nodeCommonMap.length = 0;
        }

        value.forEach(element => {
            this._nodeCommonMap.push(element);
            if (this._value2DShaderData) {
                let unifomrMap = <WebGPUCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap(element);
                let uniformBuffer = this._value2DShaderData.createSubUniformBuffer(element, element, unifomrMap._idata);
                uniformBuffer && this._value2DUBOs.push(uniformBuffer);
                this._value2DShaderData.addBindGroupChangeLink(element, unifomrMap._idata);
                this._value2DShaderData.addBindGroupChangeFlag(element, this._value2DBindGroupChangeFlag, this._value2DBindGroupLayoutFlag);
                this._value2DShaderData._defineDatas.addChangeFlagInfo(this._value2DDefChangeFlag);
            }
        });
    }

    constructor() {

    }

    /** @internal */
    protected _needUpdatePipeline() {
        this._pipelineChangeFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount);
    }

    protected getGlobalShaderData() {
        if (this.owner && this.owner.globalRenderData && this.owner.globalRenderData.globalShaderData)
            return this.owner.globalRenderData.globalShaderData;
        else
            return null;
    }

    protected _getShaderInstanceDefines(context: WebGPURenderContext2D) {
        const comDef = WebGPURenderElement2D._compileDefine;

        const globalShaderDefines = context._cacheGlobalDefines;

        globalShaderDefines.cloneTo(comDef);

        if (this._value2DShaderData)
            comDef.addDefineDatas(this._value2DShaderData.getDefineData());

        if (this._materialShaderData)
            comDef.addDefineDatas(this._materialShaderData._defineDatas);

        //global TODO
        // let global = this.getGlobalShaderData(); 
        // if (global) {
        //     comDef.addDefineDatas(global.getDefineData() as WebDefineDatas);
        // }
        if (this._additionShaderData.size > 0) {
            this._additionShaderData.forEach(element => {
                comDef.addDefineDatas(element._defineDatas);
            });
        }

        let passData = context.passData;
        if (passData) {
            comDef.addDefineDatas(passData.getDefineData());
        }
        return comDef;
    }

    /**
     * 编译着色器
     * @param context 
     */
    protected _compileShader(context: WebGPURenderContext2D) {
        const comDef = this._getShaderInstanceDefines(context);

        var passes: ShaderPass[] = this._subShader._passes;
        let renderCount = 0;
        //查找着色器对象缓存
        for (var j: number = 0, m: number = passes.length; j < m; j++) {
            var pass: ShaderPass = passes[j];
            //NOTE:this will cause maybe a shader not render but do prepare before，but the developer can avoide this manual,for example shaderCaster=false.
            if (pass.pipelineMode !== context.pipelineMode || !this.geometry)
                continue;

            //设置nodeCommonMap
            if (this._value2DShaderData)
                pass.nodeCommonMap = this._nodeCommonMap;
            else
                pass.nodeCommonMap = null;

            let attributeLocations = this.geometry.bufferState._attriLocArray;
            pass.moduleData.attributeLocations = attributeLocations;

            let passData = pass.moduleData;
            passData.additionShaderData = this._additinalArray;

            //获取着色器实例，先查找缓存，如果没有则创建
            const shaderInstance = pass.withCompile(comDef, true) as WebGPUShaderInstance;
            if (this._drawCacheArray[renderCount]) {
                let oneInfo = this._drawCacheArray[renderCount];
                if (oneInfo.shaderInstance != shaderInstance) {
                    oneInfo.shaderChange = true;
                    oneInfo.shaderInstance = shaderInstance;
                }
            } else {
                let oneInfo = new OneDrawCacheInfo();
                oneInfo.shaderChange = true;
                oneInfo.shaderInstance = shaderInstance;
                this._drawCacheArray[renderCount] = oneInfo;
            }
            renderCount++;
        }
        this._drawCacheArray.length = renderCount;
    }

    /**
     * 获取混合状态
     * @param shaderInstance 
     */
    private _getBlendState(shaderInstance: WebGPUShaderInstance) {
        if (this.renderStateIsBySprite || !this._materialShaderData) {
            if ((shaderInstance._shaderPass as ShaderPass).statefirst)
                this.blendState = this._getRenderStateBlendByShader(this._value2DShaderData, shaderInstance);
            else this.blendState = this._getRenderStateBlendByMaterial(this._value2DShaderData);
        } else {
            if ((shaderInstance._shaderPass as ShaderPass).statefirst)
                this.blendState = this._getRenderStateBlendByShader(this._materialShaderData, shaderInstance);
            else this.blendState = this._getRenderStateBlendByMaterial(this._materialShaderData);
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
            if (this.renderStateIsBySprite || !this._materialShaderData) {
                if ((shaderInstance._shaderPass as ShaderPass).statefirst)
                    this.depthStencilState = this._getRenderStateDepthByShader(this._value2DShaderData, shaderInstance, dest);
                else this.depthStencilState = this._getRenderStateDepthByMaterial(this._value2DShaderData, dest);
            } else {
                if ((shaderInstance._shaderPass as ShaderPass).statefirst)
                    this.depthStencilState = this._getRenderStateDepthByShader(this._materialShaderData, shaderInstance, dest);
                else this.depthStencilState = this._getRenderStateDepthByMaterial(this._materialShaderData, dest);
            }
        } else this.depthStencilState = null;
    }

    private _getRenderStateDepthByShader(shaderData: WebGPUShaderData, shaderInstance: WebGPUShaderInstance, dest: WebGPUInternalRT) {
        getDepthStencilParamFromShader(shaderData, shaderInstance, dest, this.depthStencilParam);
        return WebGPUDepthStencilState.getDepthStencilState(dest.depthStencilFormat, this.depthStencilParam);
    }

    private _getRenderStateDepthByMaterial(shaderData: WebGPUShaderData, dest: WebGPUInternalRT) {
        getDepthStencilParamFromMaterial(shaderData, dest, this.depthStencilParam)
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
     * 绑定资源组
     * @param shaderInstance 
     * @param command 
     */
    protected _bindGroup(context: WebGPURenderContext2D, info: OneDrawCacheInfo, command: WebGPURenderCommandEncoder | WebGPURenderBundle) {
        //this.bindGroupMap.clear();
        let shaderInstance = info.shaderInstance;
        {
            command.setBindGroup(0, context._passBindGroup);
        }
        {
            if (this._value2DShaderData) {
                if (info.shaderChange || this._value2DRenderDataChange || compareCahceFlag(this._value2DBindGroupChangeFlag, info.renderNodeBindGroupCacheFlag)) {
                    info.renderNodeBindGroupCacheFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount);
                    let resource = shaderInstance.uniformSetMap.get(1);
                    let textureExitsMask = shaderInstance.uniformTextureExits.get(1);
                    info.nodeBindGroup = WebGPURenderEngine._instance.bindGroupCache.getBindGroup(this._nodeCommonMap, this._value2DShaderData, this._additionShaderData, resource, textureExitsMask);
                    coverCahceFlag(this._value2DBindGroupLayoutFlag, this._pipelineChangeFlag);
                }
            } else {
                info.nodeBindGroup = WebGPUBindGroupCache.emptyBindGroup;
            }
             command.setBindGroup(1, info.nodeBindGroup);
        }
        {
            if (this._materialShaderData) {
                if (info.shaderChange || this._materialRenderDataChange || compareCahceFlag(this._matBindGroupChangeFlag, info.matBindGroupCacheFlag)) {
                    info.matBindGroupCacheFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount);
                    let shaderResource = shaderInstance.uniformSetMap.get(2);
                    let textureExitsMask = shaderInstance.uniformTextureExits.get(2);

                    info.matBindGroup = WebGPURenderEngine._instance.bindGroupCache.getBindGroup([this._subShader._owner.name], this._materialShaderData, null, shaderResource, textureExitsMask);
                    coverCahceFlag(this._matBindGroupLayoutFlag, this._pipelineChangeFlag);
                }
            } else {
                info.matBindGroup = WebGPUBindGroupCache.emptyBindGroup;
            }
            command.setBindGroup(2, info.matBindGroup);
        }
        {
            //global TODO
        }

    }

    /**
     * 上传几何数据
     * @param command 
     */
    protected _uploadGeometry(command: WebGPURenderCommandEncoder | WebGPURenderBundle) {
        let triangles = 0;
        triangles += command.applyGeometry(this.geometry);
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
    protected _getWebGPURenderPipeline(shaderInstance: WebGPUShaderInstance, dest: WebGPUInternalRT, context: WebGPURenderContext2D) {
        this._getBlendState(shaderInstance);
        this._getDepthStencilState(shaderInstance, dest);
        if (this.renderStateIsBySprite || !this._materialShaderData)
            this._getCullFrontMode(this._value2DShaderData, shaderInstance, false, context.invertY);
        else this._getCullFrontMode(this._materialShaderData, shaderInstance, false, context.invertY);
        let pipeline = WebGPURenderEngine._instance.pipelineCache.getPipeline(this._bindGroupMap, this, shaderInstance, dest);
        return pipeline;
    }

    protected _updateMatChangeFlag() {
        if (compareCahceFlag(this._matChangeFlag, this._drawPassInfo.matCacheFlag)) {//MaterialShaderData变动或者shader变动
            this._materialRenderDataChange = true;
            this._drawPassInfo.matCacheFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount);
            if (this._materialShaderData) {
                let shadername = this._subShader.owner.name;
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
            } else {
                this._matBindGroupChangeFlag = zeroFlag;
                this._matBindGroupLayoutFlag = zeroFlag;
                this._matDefChangeFlag = zeroFlag;
                this._materialUBO = null;
            }

        } else {
            this._materialRenderDataChange = false;
        }

        if (this._value2DShaderData && compareCahceFlag(this._valueChangeFlag, this._drawPassInfo.nodeCacheFlag)) {
            this._drawPassInfo.nodeCacheFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount);
            this._value2DRenderDataChange = true;
        } else {
            this._value2DRenderDataChange = false;
        }
    }

    protected _updateNodeUBO() {
        if (this._value2DUBOs.length == 1) {
            this._value2DUBOs[0].upload();
        } else {
            this._value2DUBOs.forEach(ubo => {
                ubo.upload();
            });
        }
    }

    /**
     * 准备渲染
     * @param context 
     */
    _prepare(context: WebGPURenderContext2D) {
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
            compareCahceFlag(this._matDefChangeFlag, passDefineChangeFlag) ||//material宏是否变化
            (this.owner && compareCahceFlag(this._value2DDefChangeFlag, passDefineChangeFlag)) ||//sprite是否宏变化
            compareCahceFlag(context._curDefineChangeFlag, passDefineChangeFlag) ||
            this._drawPassInfo.geometryStateID != this._cacheGeometryStateID) //判断场景中的宏是否变化
        {
            passDefineChangeFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount);
            this._compileShader(context);
            this._drawPassInfo.geometryStateID = this._cacheGeometryStateID;
        }

        let cehckShaderData;
        if (this.renderStateIsBySprite || !this._materialShaderData) {
            cehckShaderData = this._value2DShaderData
        } else {
            cehckShaderData = this._materialShaderData;
        }

        let cullmode = cehckShaderData.getInt(Shader3D.CULL);
        cullmode = cullmode ? cullmode : RenderState.CULL_NONE;
        let depthStencilID = cehckShaderData.depthStencilStateKey;
        let blendid = cehckShaderData.blendStateCache ? cehckShaderData.blendStateCache.id : -1;
        if (this._cacheMatCullMode != cullmode ||
            this._cacheMatDepthStencilID != depthStencilID ||
            this._cacheMatBlendStateID != blendid) {
            this._cacheMatBlendStateID = blendid;
            this._cacheMatDepthStencilID = depthStencilID;
            this._cacheMatCullMode = cullmode;
            this._needUpdatePipeline();
        }

        //value2D ubo
        this._updateNodeUBO();

        // material ubo
        this._materialUBO && this._materialUBO.upload();

        //global ubo TODO

    }

    /**
     * 渲染
     * @param context 
     * @param command 
     */
    _render(context: WebGPURenderContext2D, command: WebGPURenderCommandEncoder | WebGPURenderBundle) {
        if (this._drawCacheArray && this._drawCacheArray.length == 0) return 0;

        if (this._drawCacheArray.length == 1) {
            this._renderByShaderInstance(this._drawCacheArray[0], context, command)
        } else {

            for (var j: number = 0, m: number = this._drawCacheArray.length; j < m; j++) {
                this._renderByShaderInstance(this._drawCacheArray[j], context, command);
            }
        }
        return 0;
    }

    protected _renderByShaderInstance(drawInfo: OneDrawCacheInfo, context: WebGPURenderContext2D, command: WebGPURenderCommandEncoder | WebGPURenderBundle) {
        let shader = drawInfo.shaderInstance;
        if (!shader.complete || !this.geometry)
            return

        this._bindGroup(context, drawInfo, command)
        let pipelineCache = drawInfo.pipeLineCacheFlag;
        if (drawInfo.shaderChange ||
            context._pipelineChange ||
            compareCahceFlag(this._pipelineChangeFlag, pipelineCache)) {
            this._bindGroupMap.clear();
            this._bindGroupMap.set(0, context._passBindGroup);
            this._bindGroupMap.set(1, drawInfo.nodeBindGroup);
            this._bindGroupMap.set(2, drawInfo.matBindGroup);
            //this._bindGroupMap.set(3, drawInfo.matBindGroup); Global TODO
            drawInfo.shaderChange = false;
            drawInfo.pipeline = this._getWebGPURenderPipeline(drawInfo.shaderInstance, context._destRT, context);
            drawInfo.pipeLineCacheFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount);

        }
        command.setPipeline(drawInfo.pipeline);
        //this._uploadGeometry(command); //上传几何数据 draw
        this.geometry.applyToEncoder(command.encoder);
    }

    /**
     * 销毁
     */
    destroy() {
        WebGPUGlobal.releaseId(this);
    }
}