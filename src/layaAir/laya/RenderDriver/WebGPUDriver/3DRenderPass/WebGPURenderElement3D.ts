import { CullMode, FrontFace } from "../../../RenderEngine/RenderEnum/CullMode";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { Transform3D } from "../../../d3/core/Transform3D";
import { IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { WebBaseRenderNode } from "../../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPURenderBundle } from "../RenderDevice/WebGPUBundle/WebGPURenderBundle";
import { WebGPUInternalRT } from "../RenderDevice/WebGPUInternalRT";
import { WebGPURenderCommandEncoder } from "../RenderDevice/WebGPURenderCommandEncoder";
import { WebGPURenderGeometry } from "../RenderDevice/WebGPURenderGeometry";
import {
    IRenderPipelineInfo,
    WebGPUBlendState,
    WebGPUBlendStateCache,
    WebGPUDepthStencilState,
    WebGPUDepthStencilStateCache,
    WebGPUPrimitiveState,
    WebGPURenderPipeline
} from "../RenderDevice/WebGPURenderPipelineHelper";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUShaderInstance } from "../RenderDevice/WebGPUShaderInstance";
import { WebGPUGlobal } from "../RenderDevice/WebGPUStatis/WebGPUGlobal";
import { WebGPUContext } from "./WebGPUContext";
import { WebGPURenderContext3D } from "./WebGPURenderContext3D";

export class WebGPURenderElement3D implements IRenderElement3D, IRenderPipelineInfo {
    static _compileDefine: WebDefineDatas = new WebDefineDatas();

    private _sceneData: WebGPUShaderData;
    private _cameraData: WebGPUShaderData;
    renderShaderData: WebGPUShaderData;
    materialShaderData: WebGPUShaderData;
    materialRenderQueue: number;
    transform: Transform3D;
    canDynamicBatch: boolean;
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

    private _stateKey: string[] = []; //用于判断渲染状态是否改变
    private _stateKeyCounter: number = 0; //用于控制stateKey计算频率
    private _shaderInstances: WebGPUShaderInstance[] = []; //着色器缓存
    private _pipelineCache: GPURenderPipeline[] = []; //渲染管线缓存

    //是否启用GPU资源缓存机制
    useCache: boolean = WebGPUGlobal.useCache;

    //着色器数据状态，如果状态改变了，说明需要重建资源，否则直接使用缓存
    private _shaderDataState: number[] = [];

    bundleId: number; //用于bundle管理（被bundle管理器识别）
    needClearBundle: boolean = false; //是否需要清除bundle（bindGroup，pipeline等改变都需要清除指令缓存）
    static bundleIdCounter: number = 0;

    //是否静态节点
    isStatic: boolean = false;
    staticChange: boolean = false;

    globalId: number;
    objectName: string = 'WebGPURenderElement3D';

    constructor() {
        //this.globalId = WebGPUGlobal.getId(this);
        this.bundleId = WebGPURenderElement3D.bundleIdCounter++;
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
        const passes = this.subShader._passes;

        const comDef = WebGPURenderElement3D._compileDefine;
        //将场景或全局配置的定义一次性准备好
        if (context.sceneData) {
            context.sceneData._defineDatas.cloneTo(comDef);
        } else context.globalConfigShaderData.cloneTo(comDef);

        //添加相机数据定义
        if (context.cameraData)
            comDef.addDefineDatas(context.cameraData._defineDatas);

        this._shaderInstances.length = 0;
        for (let i = 0, m = passes.length; i < m; i++) {
            const pass = passes[i];
            if (pass.pipelineMode !== context.pipelineMode) continue;

            if (this.renderShaderData)
                comDef.addDefineDatas(this.renderShaderData.getDefineData());
            comDef.addDefineDatas(this.materialShaderData._defineDatas);
            pass.nodeCommonMap = this.owner ? this.owner._commonUniformMap : null;

            //获取shaderInstance，会先查找缓存，如果没有则创建
            const shaderInstance = pass.withCompile(comDef) as WebGPUShaderInstance;
            this._shaderInstances[i] = shaderInstance;

            context.sceneData?.createUniformBuffer(shaderInstance.uniformInfo[0], true);
            context.cameraData?.createUniformBuffer(shaderInstance.uniformInfo[1], true);
            this.renderShaderData?.createUniformBuffer(shaderInstance.uniformInfo[2]);
            this.materialShaderData.createUniformBuffer(shaderInstance.uniformInfo[3]);
        }

        //重编译着色器后，清理绑定组缓存
        if (this.renderShaderData)
            this.renderShaderData.clearBindGroup();
        if (this.materialShaderData)
            this.materialShaderData.clearBindGroup();

        //强制stateKey重新计算
        this._stateKeyCounter = 0;
    }

    private _calcStateKey(shaderInstance: WebGPUShaderInstance, dest: WebGPUInternalRT, context: WebGPURenderContext3D) {
        this._getBlendState(shaderInstance);
        this._getDepthStencilState(shaderInstance, dest);
        this._getCullFrontMode(this.materialShaderData, shaderInstance, this._invertFrontFace, context.invertY);
        const primitiveState = WebGPUPrimitiveState.getGPUPrimitiveState(this.geometry.mode, this.frontFace, this.cullMode);
        const bufferState = this.geometry.bufferState;
        const depthStencilId = this.depthStencilState ? this.depthStencilState.id : -1;
        return `${shaderInstance._id}_${primitiveState.key}_${this.blendState.key}_${depthStencilId}_${dest.formatId}_${bufferState.id}_${bufferState.updateBufferLayoutFlag}`;
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
        else this.blendState = this._getRenderStateBlendByMaterial(this.materialShaderData);
    }

    private _getRenderStateBlendByShader(shaderData: WebGPUShaderData, shader: WebGPUShaderInstance) {
        const data = shaderData.getData();
        const renderState = (shader._shaderPass as ShaderPass).renderState;
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
                throw "blendState set error";
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
        const data = shaderData.getData();
        const renderState = (<ShaderPass>shader._shaderPass).renderState;
        const depthWrite = (renderState.depthWrite ?? data[Shader3D.DEPTH_WRITE]) ?? RenderState.Default.depthWrite;
        const depthTest = (renderState.depthTest ?? data[Shader3D.DEPTH_TEST]) ?? RenderState.Default.depthTest;
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
        const data = shaderData.getData();
        const depthWrite = data[Shader3D.DEPTH_WRITE] ?? RenderState.Default.depthWrite;
        const depthTest = data[Shader3D.DEPTH_TEST] ?? RenderState.Default.depthTest;
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
        const renderState = (<ShaderPass>shader._shaderPass).renderState;
        const data = shaderData.getData();
        let cull = data[Shader3D.CULL];
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

    /**
     * 渲染前更新
     * @param context 
     */
    _preUpdatePre(context: WebGPURenderContext3D) {
        let compile = false;
        this._sceneData = context.sceneData;
        this._cameraData = context.cameraData;
        if (!this.renderShaderData)
            this.renderShaderData = new WebGPUShaderData();
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
        //只在数据发生变化的时候才重新编译
        if (this._isShaderDataChange()) {
            this._compileShader(context);
            compile = true;
        }
        this._invertFrontFace = this._getInvertFront();
        return compile;
    }

    /**
     * 着色器数据是否改变
     */
    private _isShaderDataChange() {
        let change = false;
        const shaderDataState = this._shaderDataState;
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
     * 用于创建渲染管线的函数
     * @param sn 
     * @param context 
     * @param shaderInstance 
     * @param command 
     * @param bundle 
     * @param stateKey 
     */
    _createPipeline(sn: number, context: WebGPURenderContext3D, shaderInstance: WebGPUShaderInstance,
        command: WebGPURenderCommandEncoder, bundle: WebGPURenderBundle, stateKey?: string) {
        let complete = true;
        let entries: GPUBindGroupLayoutEntry[];
        const bindGroupLayout = [];
        const sceneData = this._sceneData;
        const cameraData = this._cameraData;
        const renderShaderData = this.renderShaderData;
        const materialShaderData = this.materialShaderData;
        const uniformSetMap = shaderInstance.uniformSetMap;

        if (sceneData) {
            entries = sceneData.bindGroup(0, 'scene3D', uniformSetMap[0], command, bundle);
            if (!entries)
                complete = false;
            else {
                sceneData.uploadUniform();
                bindGroupLayout.push(entries);
            }
        }
        if (cameraData) {
            entries = cameraData.bindGroup(1, 'camera', uniformSetMap[1], command, bundle);
            if (!entries)
                complete = false;
            else {
                cameraData.uploadUniform();
                bindGroupLayout.push(entries);
            }
        }
        if (renderShaderData) {
            renderShaderData.isShare = false;
            entries = renderShaderData.bindGroup(2, 'sprite3D', uniformSetMap[2], command, bundle);
            if (!entries)
                complete = false;
            else {
                renderShaderData.uploadUniform();
                bindGroupLayout.push(entries);
            }
        }
        if (materialShaderData) {
            materialShaderData.isShare = false;
            entries = materialShaderData.bindGroup(3, 'material', uniformSetMap[3], command, bundle);
            if (!entries)
                complete = false;
            else {
                materialShaderData.uploadUniform();
                bindGroupLayout.push(entries);
            }
        }

        if (complete) {
            const pipeline = this._getWebGPURenderPipeline(shaderInstance, context.destRT, context, bindGroupLayout);
            if (command) {
                if (WebGPUGlobal.useGlobalContext) {
                    WebGPUContext.setCommandPipeline(command, pipeline);
                    WebGPUContext.applyCommandGeometry(command, this.geometry);
                } else {
                    command.setPipeline(pipeline);
                    command.applyGeometry(this.geometry);
                }
            }
            if (bundle) {
                if (WebGPUGlobal.useGlobalContext) {
                    WebGPUContext.setBundlePipeline(bundle, pipeline);
                    WebGPUContext.applyBundleGeometry(bundle, this.geometry);
                } else {
                    bundle.setPipeline(pipeline);
                    bundle.applyGeometry(this.geometry);
                }
            }
            if (this.useCache) {
                this._pipelineCache[sn] = pipeline;
                this._stateKey[sn] = stateKey;
            }
        }
    };

    /**
     * 渲染
     * @param context 
     * @param command 
     * @param bundle 
     */
    _render(context: WebGPURenderContext3D, command: WebGPURenderCommandEncoder, bundle: WebGPURenderBundle) {
        //如果command和bundle都是null，则只上传shaderData数据，不执行bindGroup操作
        if (this.isRender) {
            let stateKey;
            for (let i = 0, len = this._shaderInstances.length; i < len; i++) {
                const shaderInstance = this._shaderInstances[i];
                if (shaderInstance.complete) {
                    if (this.useCache) { //启用缓存机制
                        const sceneData = this._sceneData;
                        const cameraData = this._cameraData;
                        const renderShaderData = this.renderShaderData;
                        const materialShaderData = this.materialShaderData;
                        if (this._stateKeyCounter % 10 == 0)
                            stateKey = this._calcStateKey(shaderInstance, context.destRT, context);
                        else stateKey = this._stateKey[i];
                        if (stateKey != this._stateKey[i] || !this._pipelineCache[i])
                            this._createPipeline(i, context, shaderInstance, command, bundle, stateKey); //新建渲染管线
                        else { //使用缓存
                            let complete = true;
                            const uniformSetMap = shaderInstance.uniformSetMap;
                            if (sceneData) {
                                if (command || bundle) {
                                    if (!sceneData.bindGroup(0, 'scene3D', uniformSetMap[0], command, bundle))
                                        complete = false;
                                    else sceneData.uploadUniform();
                                } else sceneData.uploadUniform();
                            }
                            if (cameraData) {
                                if (command || bundle) {
                                    if (!cameraData.bindGroup(1, 'camera', uniformSetMap[1], command, bundle))
                                        complete = false;
                                    else cameraData.uploadUniform();
                                } else cameraData.uploadUniform();
                            }
                            if (renderShaderData) {
                                if (command || bundle) {
                                    if (!renderShaderData.bindGroup(2, 'sprite3D', uniformSetMap[2], command, bundle))
                                        complete = false;
                                    else renderShaderData.uploadUniform();
                                } else renderShaderData.uploadUniform();
                            }
                            if (materialShaderData) {
                                if (command || bundle) {
                                    if (!materialShaderData.bindGroup(3, 'material', uniformSetMap[3], command, bundle))
                                        complete = false;
                                    else materialShaderData.uploadUniform();
                                } else materialShaderData.uploadUniform();
                            }
                            if (complete) {
                                if (command) {
                                    if (WebGPUGlobal.useGlobalContext) {
                                        WebGPUContext.setCommandPipeline(command, this._pipelineCache[i]);
                                        WebGPUContext.applyCommandGeometry(command, this.geometry);
                                    } else {
                                        command.setPipeline(this._pipelineCache[i]);
                                        command.applyGeometry(this.geometry);
                                    }
                                }
                                if (bundle) {
                                    if (WebGPUGlobal.useGlobalContext) {
                                        WebGPUContext.setBundlePipeline(bundle, this._pipelineCache[i]);
                                        WebGPUContext.applyBundleGeometry(bundle, this.geometry);
                                    } else {
                                        bundle.setPipeline(this._pipelineCache[i]);
                                        bundle.applyGeometry(this.geometry);
                                    }
                                }
                            }
                        }
                    } else this._createPipeline(i, context, shaderInstance, command, bundle); //不启用缓存机制
                }
            }
            this._stateKeyCounter++;
        }
    }

    destroy(): void {
        WebGPUGlobal.releaseId(this);
        this._shaderInstances.length = 0;
        this._pipelineCache.length = 0;
        this._stateKey.length = 0;
    }
}