import { CullMode, FrontFace } from "../../../RenderEngine/RenderEnum/CullMode";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { Transform3D } from "../../../d3/core/Transform3D";
import { LayaGL } from "../../../layagl/LayaGL";
import { FastSinglelist } from "../../../utils/SingletonList";
import { IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { WebBaseRenderNode } from "../../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebShaderPass } from "../../RenderModuleData/WebModuleData/WebShaderPass";
import { WebGPURenderBundle } from "../RenderDevice/WebGPUBundle/WebGPURenderBundle";
import { WebGPUCommandUniformMap } from "../RenderDevice/WebGPUCommandUniformMap";
import { WebGPUInternalRT } from "../RenderDevice/WebGPUInternalRT";
import { WebGPURenderCommandEncoder } from "../RenderDevice/WebGPURenderCommandEncoder";
import { WebGPURenderEngine } from "../RenderDevice/WebGPURenderEngine";
import { WebGPURenderGeometry } from "../RenderDevice/WebGPURenderGeometry";
import { IRenderPipelineInfo, WebGPUBlendState, WebGPUBlendStateCache, WebGPUDepthStencilState, WebGPUDepthStencilStateCache, WebGPURenderPipeline } from "../RenderDevice/WebGPURenderPipelineHelper";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUShaderInstance } from "../RenderDevice/WebGPUShaderInstance";
import { WebGPURenderContext3D } from "./WebGPURenderContext3D";

/**
 * 基本渲染单元
 */
export class WebGPURenderElement3D implements IRenderElement3D, IRenderPipelineInfo {
    static _sceneShaderData: WebGPUShaderData = new WebGPUShaderData();//TODO??
    static _renderShaderData: WebGPUShaderData = new WebGPUShaderData();//TODO??
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
    protected _shaderInstances: FastSinglelist<WebGPUShaderInstance> = new FastSinglelist();

    protected _passNum = 0; //当前渲染通道数量
    protected _passName: string; //当前渲染名称
    protected _passIndex: number[] = []; //当前渲染通道索引

    //着色器数据状态，如果状态改变了，说明需要重建资源，否则直接使用缓存
    protected _shaderDataState: { [key: string]: number[] } = {};
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
        this._shaderInstances.clear();
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
            var shaderIns = pass.withCompile(comDef) as WebGPUShaderInstance;

            this._shaderInstances.add(shaderIns);
        }
    }

    /**
     * 渲染前更新,更新所有Buffer
     * @param context 
     */
    _preUpdatePre(context: WebGPURenderContext3D) {
        //编译着色器（只在数据发生变化的时候才重新编译）
        this._compileShader(context);
        // material ubo
        let subShader = this.subShader;
        let matSubBuffer = this.materialShaderData.createSubUniformBuffer("Material", subShader._owner.name, subShader._uniformMap);
        if (matSubBuffer.needUpload) {
            matSubBuffer.bufferBlock.needUpload();
        }

        //sprite ubo
        if (this.renderShaderData && this.owner._commonUniformMap.length > 0) {
            let nodemap = this.owner._commonUniformMap;
            for (var i = 0, n = nodemap.length; i < n; i++) {
                let moduleName = nodemap[i];
                let unifomrMap = <WebGPUCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap(nodemap[i]);
                let uniformBuffer = this.renderShaderData.createSubUniformBuffer(moduleName, moduleName, unifomrMap._idata);
                if (uniformBuffer && uniformBuffer.needUpload) {
                    uniformBuffer.bufferBlock.needUpload();
                }
            }
        }
        //additional ubo
        if (this.owner) {
            for (let [key, value] of this.owner.additionShaderData) {
                let shaderData = value as WebGPUShaderData;
                let unifomrMap = <WebGPUCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap(key);
                let uniformBuffer = shaderData.createSubUniformBuffer(key, key, unifomrMap._idata);
                if (uniformBuffer && uniformBuffer.needUpload) {
                    uniformBuffer.bufferBlock.needUpload();
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
        let shaders: WebGPUShaderInstance[] = this._shaderInstances.elements;
        if (!this.isRender) {
            return 0;
        }
        for (let j: number = 0, m: number = this._shaderInstances.length; j < m; j++) {
            if (!shaders[j].complete)
                continue;
            let shaderInstance = shaders[j];
            //TODO 先创建RenderPipeline  后续讨论如何Cache RenderPipeline的方案
            command.setPipeline(this._getWebGPURenderPipeline(shaderInstance, context.destRT, context));  //新建渲染管线
            this._bindGroup(shaderInstance, command); //绑定资源组
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
        return WebGPURenderPipeline.getRenderPipeline(this, shaderInstance, dest);
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
     * 绑定资源组
     * @param shaderInstance 
     * @param command 
     * @param bundle 
     */
    protected _bindGroup(shaderInstance: WebGPUShaderInstance, command: WebGPURenderCommandEncoder | WebGPURenderBundle) {
        if (!shaderInstance.uniformSetMap[0]) {
            command.setBindGroup(0, this._sceneData.);
        }
        if (!shaderInstance.uniformSetMap[1]) {
            const bindGroup = this._cameraData._get(["BaseCamera"]);
            command.setBindGroup(1, bindGroup);
        }
        if (!shaderInstance.uniformSetMap[2]) {
            //判断是否需要重新创建BindGroup TODO
            let shaderDataMap = this.owner.additionShaderData;
            let spritegroup = shaderInstance._additionalEntryGroup;
            let descriptor = shaderInstance._cacheSpriteBindGroupDescriptor;
            descriptor.entries = [];
            if (this.renderShaderData) {
                this.renderShaderData._getBindGroupEntryByArray(shaderInstance._spriteEntryGroup, descriptor.entries);
            }
            for (let [key, entries] of spritegroup) {
                if (shaderDataMap.has(key)) {

                    const shaderData = shaderDataMap.get(key) as WebGPUShaderData;
                    // 创建BindGroup的描述符
                    shaderData._getBindGroupEntryByArray(entries, descriptor.entries);
                }
            }
            let bindGroup = WebGPURenderEngine._instance.getDevice().createBindGroup(descriptor);
            command.setBindGroup(2, bindGroup);
        }
        if (!shaderInstance.uniformSetMap[3]) {
            const bindGroup = this.materialShaderData.getBindGroupByCommandMapArray(["Material"]);
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
            triangles += command.applyGeometryPart(this.geometry, 0);
        }
        return triangles;
    }

    /**
     * 销毁
     */
    destroy() {
        //WebGPUGlobal.releaseId(this);
        this._shaderInstances.length = 0;
        this._pipeline.length = 0;
        this._stateKey.length = 0;
    }
}