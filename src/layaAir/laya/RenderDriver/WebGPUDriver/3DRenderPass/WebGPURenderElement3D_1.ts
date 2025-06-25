import { CullMode, FrontFace } from "../../../RenderEngine/RenderEnum/CullMode";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { Transform3D } from "../../../d3/core/Transform3D";
import { LayaGL } from "../../../layagl/LayaGL";
import { Vector2 } from "../../../maths/Vector2";
import { Stat } from "../../../utils/Stat";
import { IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { WebBaseRenderNode } from "../../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebShaderPass } from "../../RenderModuleData/WebModuleData/WebShaderPass";
import { WebGPUBindGroup, WebGPUBindGroupCache } from "../RenderDevice/WebGPUBindGroupCache";
import { WebGPURenderBundle } from "../RenderDevice/WebGPUBundle/WebGPURenderBundle";
import { WebGPUCommandUniformMap } from "../RenderDevice/WebGPUCommandUniformMap";
import { WebGPUInternalRT } from "../RenderDevice/WebGPUInternalRT";
import { WebGPURenderCommandEncoder } from "../RenderDevice/WebGPURenderCommandEncoder";
import { WebGPURenderEngine } from "../RenderDevice/WebGPURenderEngine";
import { WebGPURenderGeometry } from "../RenderDevice/WebGPURenderGeometry";
import { DepthStencilParam, getDepthStencilParamFromMaterial, getDepthStencilParamFromShader, IRenderPipelineInfo, WebGPUBlendState, WebGPUBlendStateCache, WebGPUDepthStencilState, WebGPUDepthStencilStateCache } from "../RenderDevice/WebGPURenderPipelineHelper";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUShaderInstance } from "../RenderDevice/WebGPUShaderInstance";
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


//记录一个RenderElement 一次DrawCall的缓存数据
export class oneDrawCacheInfo {
    shaderInstance: WebGPUShaderInstance;
    pipelineMode: string;
    pipeline: GPURenderPipeline;
    shaderChange: boolean;
    pipeLineCacheFlag: Vector2 = new Vector2();//和global的BindGroup引起的pipeline的更新Flag做对比
}

/**
 * 基本渲染单元
 */
export class WebGPURenderElement3D_1 implements IRenderElement3D, IRenderPipelineInfo {

    static _compileDefine: WebDefineDatas = new WebDefineDatas();



    geometry: WebGPURenderGeometry;
    //override
    materialShaderData: WebGPUShaderData;

    materialRenderQueue: number;

    materialId: number;

    renderShaderData: WebGPUShaderData;

    transform: Transform3D;

    canDynamicBatch: boolean;

    isRender: boolean;

    declare owner: WebGPUBaseRenderNode;

    subShader: SubShader;

    //@renderPipeline Interface TODO
    blendState: WebGPUBlendStateCache;
    //@renderPipeline Interface
    depthStencilState: WebGPUDepthStencilStateCache;
    //@renderPipeline Interface
    cullMode: CullMode;
    //@renderPipeline Interface
    frontFace: FrontFace;

    protected _invertFrontFace: boolean;

    protected depthStencilParam: DepthStencilParam = new DepthStencilParam(); //模板参数

    protected _passRenderInfo: Map<string, oneDrawCacheInfo[]> = new Map();

    nodeDefCacheFlag: Vector2 = new Vector2();//和owner的defineFlag做对比
    nodeBindGroupCacheFlag: Vector2 = new Vector2();//和owner的BindGroupChangeFlag做对比
    nodeBindGroup: WebGPUBindGroup;

    matDefCacheFlag: Vector2 = new Vector2();//和material的defineFlag做对比
    matBindGroupCacheFlag: Vector2 = new Vector2();
    matBindGroup: WebGPUBindGroup;

    protected _pipelineChangeFlag: Vector2 = new Vector2();//TODO 更新



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


        }
    }

    /**
     * 渲染前更新,更新所有Buffer
     * @param context 
     */
    _preUpdatePre(context: WebGPURenderContext3D) {
        //编译着色器
        this._compileShader(context);
        // material ubo
        let subShader = this.subShader;
        let matSubBuffer = this.materialShaderData.createSubUniformBuffer("Material", subShader._owner.name, subShader._uniformMap);
        if (matSubBuffer) {
            matSubBuffer.upload();
        }

        //sprite ubo
        if (this.renderShaderData && this.owner._commonUniformMap.length > 0) {
            let nodemap = this.owner._commonUniformMap;
            for (var i = 0, n = nodemap.length; i < n; i++) {
                let moduleName = nodemap[i];
                let unifomrMap = <WebGPUCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap(nodemap[i]);
                let uniformBuffer = this.renderShaderData.createSubUniformBuffer(moduleName, moduleName, unifomrMap._idata);
                if (uniformBuffer) {
                    uniformBuffer.upload();
                }
            }
        }
        //additional ubo
        if (this.owner) {
            for (let [key, value] of this.owner.additionShaderData) {
                let shaderData = value as WebGPUShaderData;
                let unifomrMap = <WebGPUCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap(key);
                let uniformBuffer = shaderData.createSubUniformBuffer(key, key, unifomrMap._idata);
                if (uniformBuffer) {
                    uniformBuffer.upload();
                }
            }
        }
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
        let drawCaceArray = this._passRenderInfo.get(context.pipelineMode);
        if (drawCaceArray && drawCaceArray.length == 0) return 0;

        for (let j: number = 0, m: number = drawCaceArray.length; j < m; j++) {
            let drawInfo = drawCaceArray[j];
            let shaderInstance = drawInfo.shaderInstance;
            if (!shaderInstance.complete)
                return 0;

            //set BindGroup
            this._bindGroup(context, shaderInstance, command); //绑定资源组
            let pipelineCache = drawInfo.pipeLineCacheFlag;
            //1、context的pipeline变化(destRT和BindGroup资源引起的pipelineLayout变化)
            //2、自身属性变化引起的pipeline变化
            if (drawInfo.shaderChange ||
                compareCahceFlag(context._curPipeLineChangeFlag, pipelineCache) ||
                compareCahceFlag(this._pipelineChangeFlag, pipelineCache)) {
                this.bindGroupMap.clear();
                this.bindGroupMap.set(0, context._sceneBindGroup);
                this.bindGroupMap.set(1, context._cameraBindGroup);
                this.bindGroupMap.set(2, this.nodeBindGroup);
                this.bindGroupMap.set(3, this.matBindGroup);
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
        let pipeline = WebGPURenderEngine._instance.pipelineCache.getPipeline(this.bindGroupMap, this, shaderInstance, context.destRT);
        return pipeline;
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

    bindGroupMap: Map<number, WebGPUBindGroup> = new Map();

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
                let bindgroupChangeFlag = this.materialShaderData.getBindGroupChangeFlag(this.subShader._owner.name);
                if (compareCahceFlag(bindgroupChangeFlag, this.matBindGroupCacheFlag)) {
                    this.matBindGroupCacheFlag.setValue(Stat.loopCount, WebGPURenderEngine._framePassCount);
                    let shaderResource = shaderInstance.uniformSetMap.get(3);
                    let textureExitsMask = shaderInstance.uniformTextureExits.get(3);

                    this.matBindGroup = WebGPURenderEngine._instance.bindGroupCache.getBindGroup([this.subShader._owner.name], this.materialShaderData, null, shaderResource, textureExitsMask);
                    coverCahceFlag(this.materialShaderData.getBingGroupLayoutChangeFlag(this.subShader._owner.name), this._pipelineChangeFlag);
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
        this._passRenderInfo.clear();
    }
}