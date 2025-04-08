import { LayaGL } from "../../../layagl/LayaGL";
import { CullMode, FrontFace } from "../../../RenderEngine/RenderEnum/CullMode";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { FastSinglelist } from "../../../utils/SingletonList";
import { Stat } from "../../../utils/Stat";
import { IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPUBindGroup, WebGPUBindGroupHelper } from "../RenderDevice/WebGPUBindGroupHelper";
import { WebGPURenderBundle } from "../RenderDevice/WebGPUBundle/WebGPURenderBundle";
import { WebGPUCommandUniformMap } from "../RenderDevice/WebGPUCommandUniformMap";
import { WebGPUInternalRT } from "../RenderDevice/WebGPUInternalRT";
import { WebGPURenderCommandEncoder } from "../RenderDevice/WebGPURenderCommandEncoder";
import { WebGPURenderEngine } from "../RenderDevice/WebGPURenderEngine";
import { WebGPURenderGeometry } from "../RenderDevice/WebGPURenderGeometry";
import { IRenderPipelineInfo, WebGPUBlendState, WebGPUBlendStateCache, WebGPUDepthStencilState, WebGPUDepthStencilStateCache, WebGPURenderPipeline } from "../RenderDevice/WebGPURenderPipelineHelper";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUShaderInstance } from "../RenderDevice/WebGPUShaderInstance";
import { WebGPUGlobal } from "../RenderDevice/WebGPUStatis/WebGPUGlobal";
import { WebGPURenderContext2D } from "./WebGPURenderContext2D";

export class WebGPURenderElement2D implements IRenderElement2D, IRenderPipelineInfo {

    static _compileDefine: WebDefineDatas = new WebDefineDatas();

    private _nodeCommonMap: string[];

    private _value2DgpuRS: WebGPUBindGroup = new WebGPUBindGroup();

    private _nodeCommonMapMask: number = 0;

    protected _shaderInstances: FastSinglelist<WebGPUShaderInstance> = new FastSinglelist<WebGPUShaderInstance>(); //着色器缓存

    geometry: WebGPURenderGeometry;

    materialShaderData: WebGPUShaderData;

    value2DShaderData: WebGPUShaderData;

    subShader: SubShader;
    //@renderPipeline Interface TODO
    blendState: WebGPUBlendStateCache;
    //@renderPipeline Interface TODO
    depthStencilState: WebGPUDepthStencilStateCache;
    //@renderPipeline Interface TODO
    cullMode: CullMode;
    //@renderPipeline Interface TODO
    frontFace: FrontFace;

    renderStateIsBySprite: boolean = true;

    public get nodeCommonMap(): string[] {
        return this._nodeCommonMap;
    }
    public set nodeCommonMap(value: string[]) {
        this._nodeCommonMap = value;
        this._nodeCommonMapMask = Stat.loopCount;
    }

    constructor() {
    }


    protected _getShaderInstanceDefines(context: WebGPURenderContext2D) {
        const comDef = WebGPURenderElement2D._compileDefine;

        const globalShaderDefines = context._cacheGlobalDefines;

        globalShaderDefines.cloneTo(comDef);

        if (this.value2DShaderData)
            comDef.addDefineDatas(this.value2DShaderData.getDefineData());

        if (this.materialShaderData)
            comDef.addDefineDatas(this.materialShaderData._defineDatas);
        return comDef;
    }

    /**
     * 编译着色器
     * @param context 
     */
    protected _compileShader(context: WebGPURenderContext2D) {
        //将场景或全局配置定义准备好
        this._shaderInstances.clear();
        const comDef = this._getShaderInstanceDefines(context);

        var passes: ShaderPass[] = this.subShader._passes;
        //查找着色器对象缓存
        for (var j: number = 0, m: number = passes.length; j < m; j++) {
            var pass: ShaderPass = passes[j];
            //NOTE:this will cause maybe a shader not render but do prepare before，but the developer can avoide this manual,for example shaderCaster=false.
            if (pass.pipelineMode !== context.pipelineMode)
                continue;

            //设置nodeCommonMap
            if (this.value2DShaderData)
                pass.nodeCommonMap = this.nodeCommonMap;
            else
                pass.nodeCommonMap = null;
            (pass.moduleData as any).geo = this.geometry;
            //获取着色器实例，先查找缓存，如果没有则创建
            const shaderInstance = pass.withCompile(comDef, true) as WebGPUShaderInstance;
            this._shaderInstances.add(shaderInstance);
        }
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

    protected _getValue2DBindGroup() {
        let recreateBindGroup: boolean = false;
        if (!this._value2DgpuRS || this._value2DgpuRS.isNeedCreate(this._nodeCommonMapMask)) {
            recreateBindGroup = true;
        } else {
            for (var com of this._nodeCommonMap) {
                if (this._value2DgpuRS.isNeedCreate((this.value2DShaderData as WebGPUShaderData)._getBindGroupLastUpdateMask(com))) {
                    recreateBindGroup = true;
                    break;
                }
            }
        }
        if (recreateBindGroup) {//创建BindGroup
            let bindGroupArray = WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(1, this._nodeCommonMap);
            let groupLayout: GPUBindGroupLayout = WebGPUBindGroupHelper.createBindGroupEntryLayout(bindGroupArray);
            let bindgroupEntriys: GPUBindGroupEntry[] = [];
            let bindGroupDescriptor: GPUBindGroupDescriptor = {
                label: "GPUBindGroupDescriptor",
                layout: groupLayout,
                entries: bindgroupEntriys
            };
            //填充bindgroupEntriys
            let shaderData = this.value2DShaderData;
            for (var com of this._nodeCommonMap) {
                //shaderData.createSubUniformBuffer(com, com, ((LayaGL.renderDeviceFactory.createGlobalUniformMap(com) as WebGPUCommandUniformMap)._idata));
                shaderData.fillBindGroupEntry(com, com, bindgroupEntriys, bindGroupArray);
            }

            let bindGroup = WebGPURenderEngine._instance.getDevice().createBindGroup(bindGroupDescriptor);

            this._value2DgpuRS.gpuRS = bindGroup;
            this._value2DgpuRS.createMask = Stat.loopCount;
        }
    }

    /**
     * 绑定资源组
     * @param shaderInstance 
     * @param command 
     */
    protected _bindGroup(context: WebGPURenderContext2D, command: WebGPURenderCommandEncoder | WebGPURenderBundle) {
        if (context.sceneData) {
            command.setBindGroup(0, context._sceneBindGroup.gpuRS);
        }
        if (this.value2DShaderData) {
            command.setBindGroup(1, this._value2DgpuRS.gpuRS);
        }
        if (this.materialShaderData) {
            command.setBindGroup(2, this.materialShaderData._createOrGetBindGroupbyUniformMap("Material", this.subShader._owner.name, 3, this.subShader._uniformMap).gpuRS);
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
        if (this.renderStateIsBySprite || !this.materialShaderData)
            this._getCullFrontMode(this.value2DShaderData, shaderInstance, false, context.invertY);
        else this._getCullFrontMode(this.materialShaderData, shaderInstance, false, context.invertY);
        return WebGPURenderPipeline.getRenderPipeline(this, shaderInstance, dest);
    }

    /**
     * 准备渲染
     * @param context 
     */
    _prepare(context: WebGPURenderContext2D) {
        //编译着色器
        this._compileShader(context);

        //sprite ubo
        if (this.value2DShaderData && this.nodeCommonMap.length > 0) {
            let nodemap = this.nodeCommonMap;
            for (var i = 0, n = nodemap.length; i < n; i++) {
                let moduleName = nodemap[i];
                let unifomrMap = <WebGPUCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap(nodemap[i]);
                let uniformBuffer = this.value2DShaderData.createSubUniformBuffer(moduleName, moduleName, unifomrMap._idata);
                if (uniformBuffer && uniformBuffer.needUpload) {
                    uniformBuffer.bufferBlock.needUpload();
                }
            }
        }
        this._getValue2DBindGroup();
        // material ubo
        let subShader = this.subShader;
        if (this.materialShaderData) {
            let matSubBuffer = this.materialShaderData.createSubUniformBuffer("Material", subShader._owner.name, subShader._uniformMap);
            if (matSubBuffer.needUpload) {
                matSubBuffer.bufferBlock.needUpload();
            }
        }
    }

    /**
     * 渲染
     * @param context 
     * @param command 
     */
    _render(context: WebGPURenderContext2D, command: WebGPURenderCommandEncoder | WebGPURenderBundle) {
        this._bindGroup(context, command)
        if (this._shaderInstances.length == 1) {
            this._renderByShaderInstance(this._shaderInstances.elements[0], context, command)
        } else {
            var shaders = this._shaderInstances.elements;
            for (var j: number = 0, m: number = this._shaderInstances.length; j < m; j++) {
                this._renderByShaderInstance(shaders[j], context, command);
            }
        }
        return 0;
    }

    private _renderByShaderInstance(shader: WebGPUShaderInstance, context: WebGPURenderContext2D, command: WebGPURenderCommandEncoder | WebGPURenderBundle) {
        if (!shader.complete)
            return

        command.setPipeline(this._getWebGPURenderPipeline(shader, context._destRT, context));  //新建渲染管线

        this._uploadGeometry(command); //上传几何数据 draw
    }

    /**
     * 销毁
     */
    destroy() {
        WebGPUGlobal.releaseId(this);
        this._shaderInstances.length = 0;
    }
}