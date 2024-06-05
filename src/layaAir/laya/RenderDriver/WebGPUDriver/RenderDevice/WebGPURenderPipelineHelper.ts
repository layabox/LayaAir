import { BlendEquationSeparate } from "../../../RenderEngine/RenderEnum/BlendEquationSeparate";
import { BlendFactor } from "../../../RenderEngine/RenderEnum/BlendFactor";
import { BlendType } from "../../../RenderEngine/RenderEnum/BlendType";
import { CompareFunction } from "../../../RenderEngine/RenderEnum/CompareFunction";
import { CullMode, FrontFace } from "../../../RenderEngine/RenderEnum/CullMode";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { StencilOperation } from "../../../RenderEngine/RenderEnum/StencilOperation";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { WebGPUInternalRT } from "./WebGPUInternalRT";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPURenderGeometry } from "./WebGPURenderGeometry";
import { WebGPUShaderInstance } from "./WebGPUShaderInstance";

export interface WebGPUBlendStateCache {
    state: GPUBlendState,
    key: number,
    id: number
}

export class WebGPUBlendState {
    private static _idCounter: number = 0;
    private static _pointer_BlendType: number = 0;
    private static _pointer_OperationRGB_BlendEquationSeparate: number = 4;
    private static _pointer_OperationAlpha_BlendEquationSeparate: number = 8;
    private static _pointer_srcBlendRGB_BlendFactor: number = 12;
    private static _pointer_dstBlendRGB_BlendFactor: number = 16;
    private static _pointer_srcBlendAlpha_BlendFactor: number = 20;
    private static _pointer_dstBlendAlpha_BlendFactor: number = 24;
    private static _cache: { [key: number]: WebGPUBlendStateCache } = {};

    static getBlendState(blend: BlendType, operationRGB: BlendEquationSeparate, srcBlendRGB: BlendFactor, dstBlendRGB: BlendFactor, operationAlpha: BlendEquationSeparate, srcBlendAlpha: BlendFactor, dstBlendAlpha: BlendFactor): WebGPUBlendStateCache {
        const cacheID = this._getBlendStateCacheID(blend, operationRGB, srcBlendRGB, dstBlendRGB, operationAlpha, srcBlendAlpha, dstBlendAlpha);
        let state = this._cache[cacheID];
        if (!state)
            this._cache[cacheID] = state = { state: this._createBlendState(operationRGB, srcBlendRGB, dstBlendRGB, operationAlpha, srcBlendAlpha, dstBlendAlpha), key: cacheID, id: this._idCounter++ };
        return state;
    }

    private static _getBlendStateCacheID(blend: BlendType, operationRGB: BlendEquationSeparate, srcBlendRGB: BlendFactor, dstBlendRGB: BlendFactor, operationAlpha: BlendEquationSeparate, srcBlendAlpha: BlendFactor, dstBlendAlpha: BlendFactor) {
        if (blend === BlendType.BLEND_DISABLE) {
            return 0;
        } else {
            return (blend << this._pointer_BlendType) +
                (srcBlendRGB << this._pointer_srcBlendRGB_BlendFactor) +
                (dstBlendRGB << this._pointer_dstBlendRGB_BlendFactor) +
                (srcBlendAlpha << this._pointer_srcBlendAlpha_BlendFactor) +
                (dstBlendAlpha << this._pointer_dstBlendAlpha_BlendFactor) +
                (operationRGB << this._pointer_OperationRGB_BlendEquationSeparate) +
                (operationAlpha << this._pointer_OperationAlpha_BlendEquationSeparate);
        }
    }

    private static _createBlendState(operationRGB: BlendEquationSeparate, srcBlendRGB: BlendFactor, dstBlendRGB: BlendFactor, operationAlpha: BlendEquationSeparate, srcBlendAlpha: BlendFactor, dstBlendAlpha: BlendFactor): GPUBlendState {
        return {
            color: this._getComponent(operationRGB, srcBlendRGB, dstBlendRGB),
            alpha: this._getComponent(operationAlpha, srcBlendAlpha, dstBlendAlpha)
        };
    }

    private static _getFactor(factor: BlendFactor): GPUBlendFactor {
        switch (factor) {
            case BlendFactor.Zero:
                return "zero";
            case BlendFactor.One:
                return "one";
            case BlendFactor.SourceColor:
                return "src";
            case BlendFactor.OneMinusSourceColor:
                return "one-minus-src";
            case BlendFactor.DestinationColor:
                return "dst";
            case BlendFactor.OneMinusDestinationColor:
                return "one-minus-dst";
            case BlendFactor.SourceAlpha:
                return "src-alpha";
            case BlendFactor.OneMinusSourceAlpha:
                return "one-minus-src-alpha";
            case BlendFactor.DestinationAlpha:
                return "dst-alpha";
            case BlendFactor.OneMinusDestinationAlpha:
                return "one-minus-dst-alpha";
            case BlendFactor.SourceAlphaSaturate:
                return "src-alpha-saturated";
            case BlendFactor.BlendColor:
                return "constant";
            case BlendFactor.OneMinusBlendColor:
                return "one-minus-constant";
        }
    }

    private static _getComponent(operation: BlendEquationSeparate, src: BlendFactor, dst: BlendFactor): GPUBlendComponent {
        const comp: GPUBlendComponent = {};
        switch (operation) {
            case BlendEquationSeparate.ADD:
                comp.operation = "add";
                break;
            case BlendEquationSeparate.SUBTRACT:
                comp.operation = "subtract";
                break;
            case BlendEquationSeparate.MAX:
                comp.operation = "max";
                break;
            case BlendEquationSeparate.MIN:
                comp.operation = "min";
                break;
            case BlendEquationSeparate.REVERSE_SUBTRACT:
                comp.operation = "reverse-subtract";
                break;
            default:
                comp.operation = "add";
                break;
        };
        comp.srcFactor = WebGPUBlendState._getFactor(src);
        comp.dstFactor = WebGPUBlendState._getFactor(dst);
        return comp;
    }
}

export interface WebGPUDepthStencilStateCache {
    state: GPUDepthStencilState,
    key: number,
    id: number
}

export class WebGPUDepthStencilState {
    private static _idCounter: number = 0;
    private static _pointer_DepthWriteEnable: number = 0;
    private static _pointer_DepthCompare: number = 4;
    private static _pointer_DepthFormat: number = 8;
    private static _pointer_StencilTest: number = 12
    private static _pointer_StencilOp1: number = 16;
    private static _pointer_StencilOp2: number = 20;
    private static _pointer_StencilOp3: number = 24;
    private static _cache: { [key: number]: WebGPUDepthStencilStateCache } = {};

    static getDepthStencilState(format: RenderTargetFormat, depthWriteEnabled: boolean, depthCompare: CompareFunction, stencilParam: any = null, depthBiasParam: any = null): WebGPUDepthStencilStateCache {
        const cacheID = this._getDepthStencilCacheID(format, depthWriteEnabled, depthCompare, stencilParam, depthBiasParam);
        let state = this._cache[cacheID];
        if (!state)
            this._cache[cacheID] = state = { state: this._createDepthStencilState(format, depthWriteEnabled, depthCompare, stencilParam, depthBiasParam), key: cacheID, id: this._idCounter++ };
        return state;
    }

    private static _getDepthStencilCacheID(format: RenderTargetFormat, depthWriteEnabled: boolean, depthCompare: CompareFunction, stencilParam: any = null, depthBiasParam: any = null) {
        if (stencilParam['enable'])
            return (Number(depthWriteEnabled) << this._pointer_DepthWriteEnable) +
                (depthCompare << this._pointer_DepthCompare) +
                (format << this._pointer_DepthFormat) +
                (stencilParam['test'] << this._pointer_StencilTest) +
                (stencilParam['op'].x << this._pointer_StencilOp1) +
                (stencilParam['op'].y << this._pointer_StencilOp2) +
                (stencilParam['op'].z << this._pointer_StencilOp3);
        return (Number(depthWriteEnabled) << this._pointer_DepthWriteEnable) +
            (depthCompare << this._pointer_DepthCompare) +
            (format << this._pointer_DepthFormat);
    }

    private static _createDepthStencilState(format: RenderTargetFormat, depthWriteEnabled: boolean, depthCompare: CompareFunction, stencilParam: any = null, depthBiasParam: any = null): GPUDepthStencilState {
        let stateFormat: GPUTextureFormat;
        let stateDepthCompare: GPUCompareFunction;
        switch (format) {
            case RenderTargetFormat.DEPTH_16:
                stateFormat = "depth16unorm";
                break;
            case RenderTargetFormat.DEPTHSTENCIL_24_8:
                stateFormat = "depth24plus-stencil8";
                break;
            case RenderTargetFormat.DEPTH_32:
                stateFormat = "depth32float";
                break;
            case RenderTargetFormat.STENCIL_8:
                stateFormat = "stencil8";
                break;
            case RenderTargetFormat.DEPTHSTENCIL_24_Plus:
                stateFormat = "depth24plus";
                break;
            default:
                stateFormat = "depth24plus-stencil8";
                break;
        }
        switch (depthCompare) {
            case CompareFunction.Never:
                stateDepthCompare = "never";
                break;
            case CompareFunction.Less:
                stateDepthCompare = "less";
                break;
            case CompareFunction.Equal:
                stateDepthCompare = "equal";
                break;
            case CompareFunction.LessEqual:
                stateDepthCompare = "less-equal";
                break;
            case CompareFunction.Greater:
                stateDepthCompare = "greater";
                break;
            case CompareFunction.NotEqual:
                stateDepthCompare = "not-equal";
                break;
            case CompareFunction.GreaterEqual:
                stateDepthCompare = "greater-equal";
                break;
            case CompareFunction.Always:
                stateDepthCompare = "always";
                break;
            default:
                stateDepthCompare = "less";
                break;
        }
        const state: GPUDepthStencilState = {
            format: stateFormat,
            depthCompare: stateDepthCompare,
            depthWriteEnabled,
        };
        if (stencilParam['enable']) {
            let stateStencilCompare: GPUCompareFunction;
            let stateFailOp: GPUStencilOperation;
            let stateDepthFailOp: GPUStencilOperation;
            let statePassOp: GPUStencilOperation;
            switch (stencilParam['test']) {
                case RenderState.STENCILTEST_NEVER:
                    stateStencilCompare = 'never';
                    break;
                case RenderState.STENCILTEST_LESS:
                    stateStencilCompare = 'less';
                    break;
                case RenderState.STENCILTEST_EQUAL:
                    stateStencilCompare = 'equal';
                    break;
                case RenderState.STENCILTEST_GREATER:
                    stateStencilCompare = 'greater';
                    break;
                case RenderState.STENCILTEST_NOTEQUAL:
                    stateStencilCompare = 'not-equal';
                    break;
                case RenderState.STENCILTEST_GEQUAL:
                    stateStencilCompare = 'greater-equal';
                    break;
                case RenderState.STENCILTEST_ALWAYS:
                    stateStencilCompare = 'always';
                    break;
                default:
                    stateStencilCompare = 'less';
                    break;
            }
            switch (stencilParam['op'].x) {
                case StencilOperation.Keep:
                    stateFailOp = 'keep';
                    break;
                case StencilOperation.Zero:
                    stateFailOp = 'zero';
                    break;
                case StencilOperation.Invert:
                    stateFailOp = 'invert';
                    break;
                case StencilOperation.Replace:
                    stateFailOp = 'replace';
                    break;
                case StencilOperation.IncrementSaturate:
                    stateFailOp = 'increment-clamp';
                    break;
                case StencilOperation.DecrementSaturate:
                    stateFailOp = 'decrement-clamp';
                    break;
                case StencilOperation.IncrementWrap:
                    stateFailOp = 'increment-wrap';
                    break;
                case StencilOperation.DecrementWrap:
                    stateFailOp = 'decrement-wrap';
                    break;
            }
            switch (stencilParam['op'].y) {
                case StencilOperation.Keep:
                    stateDepthFailOp = 'keep';
                    break;
                case StencilOperation.Zero:
                    stateDepthFailOp = 'zero';
                    break;
                case StencilOperation.Invert:
                    stateDepthFailOp = 'invert';
                    break;
                case StencilOperation.Replace:
                    stateDepthFailOp = 'replace';
                    break;
                case StencilOperation.IncrementSaturate:
                    stateDepthFailOp = 'increment-clamp';
                    break;
                case StencilOperation.DecrementSaturate:
                    stateDepthFailOp = 'decrement-clamp';
                    break;
                case StencilOperation.IncrementWrap:
                    stateDepthFailOp = 'increment-wrap';
                    break;
                case StencilOperation.DecrementWrap:
                    stateDepthFailOp = 'decrement-wrap';
                    break;
            }
            switch (stencilParam['op'].z) {
                case StencilOperation.Keep:
                    statePassOp = 'keep';
                    break;
                case StencilOperation.Zero:
                    statePassOp = 'zero';
                    break;
                case StencilOperation.Invert:
                    statePassOp = 'invert';
                    break;
                case StencilOperation.Replace:
                    statePassOp = 'replace';
                    break;
                case StencilOperation.IncrementSaturate:
                    statePassOp = 'increment-clamp';
                    break;
                case StencilOperation.DecrementSaturate:
                    statePassOp = 'decrement-clamp';
                    break;
                case StencilOperation.IncrementWrap:
                    statePassOp = 'increment-wrap';
                    break;
                case StencilOperation.DecrementWrap:
                    statePassOp = 'decrement-wrap';
                    break;
            }
            state.stencilFront = {
                compare: stateStencilCompare,
                failOp: stateFailOp,
                depthFailOp: stateDepthFailOp,
                passOp: statePassOp
            };
            state.stencilReadMask = 0xff;
            if (stencilParam['write'])
                state.stencilWriteMask = 0xff;
        }
        return state;
    }
}

interface WebGPUPrimitiveStateCache {
    state: GPUPrimitiveState,
    key: number,
    id: number
}

export class WebGPUPrimitiveState {
    private static _idCounter: number = 0;
    private static _pointer_Topology: number = 0;
    private static _pointer_FrontFace: number = 4;
    private static _pointer_CullMode: number = 8;
    private static _cache: { [key: number]: WebGPUPrimitiveStateCache } = {};

    static getGPUPrimitiveState(topology: MeshTopology, frontFace: FrontFace, cullMode: CullMode): WebGPUPrimitiveStateCache {
        const cacheID = this._getGPUPrimitiveStateID(topology, frontFace, cullMode);
        let state = this._cache[cacheID];
        if (!state)
            this._cache[cacheID] = state = { state: this._createPrimitiveState(topology, frontFace, cullMode), key: cacheID, id: this._idCounter++ };
        return state;
    }

    private static _getGPUPrimitiveStateID(topology: MeshTopology, frontFace: FrontFace, cullMode: CullMode): number {
        return (topology << this._pointer_Topology) +
            (frontFace << this._pointer_FrontFace) +
            (cullMode << this._pointer_CullMode);
    }

    private static _createPrimitiveState(topology: MeshTopology, frontFace: FrontFace, cullMode: CullMode): GPUPrimitiveState {
        const state: GPUPrimitiveState = {};
        switch (topology) {
            case MeshTopology.Points:
                state.topology = "point-list";
                break;
            case MeshTopology.Lines:
                state.topology = "line-list";
                break;
            case MeshTopology.LineStrip:
                state.topology = "line-strip";
                break;
            case MeshTopology.Triangles:
                state.topology = "triangle-list";
                break;
            case MeshTopology.TriangleStrip:
                state.topology = "triangle-strip";
                break;
            default:
                state.topology = "triangle-list";
                break;
        }
        switch (cullMode) {
            case CullMode.Off:
                state.cullMode = "none";
                break;
            case CullMode.Back:
                state.cullMode = "back";
                break;
            case CullMode.Front:
                state.cullMode = "front";
                break;
        }
        switch (frontFace) {
            case FrontFace.CCW:
                state.frontFace = "cw"; //由于WebGPU和WebGL的坐标系不同，这里需要反转
                break;
            case FrontFace.CW:
                state.frontFace = "ccw";
                break;
        }
        return state;
    }
}

export interface IRenderPipelineInfo {
    geometry: WebGPURenderGeometry,
    blendState: WebGPUBlendStateCache,
    depthStencilState: WebGPUDepthStencilStateCache,
    cullMode: CullMode,
    frontFace: FrontFace
}

export class WebGPURenderPipeline {
    static idCounter: number = 0;
    /**
     * 获取渲染管线，如果缓存中存在，直接取出，否则创建一个，放入缓存
     * @param info 
     * @param shaderInstance 
     * @param renderTarget 
     * @param entries 
     */
    static getRenderPipeline(info: IRenderPipelineInfo, shaderInstance: WebGPUShaderInstance, renderTarget: WebGPUInternalRT, entries: any) {
        const renderPipelineMap = shaderInstance.renderPipelineMap;
        const primitiveState = WebGPUPrimitiveState.getGPUPrimitiveState(info.geometry.mode, info.frontFace, info.cullMode);
        const bufferState = info.geometry.bufferState;
        const depthStencilId = info.depthStencilState ? info.depthStencilState.key : -1;
        const strId = `${shaderInstance._id}_${primitiveState.key}_${info.blendState.key}_${depthStencilId}_${renderTarget.formatId}_${bufferState.id}_${bufferState.updateBufferLayoutFlag}`;
        let renderPipeline = renderPipelineMap.get(strId);
        if (!renderPipeline) {
            renderPipeline = this._createRenderPipeline
                (info.blendState.state, info.depthStencilState?.state, primitiveState.state, bufferState.vertexState, shaderInstance, renderTarget, entries, strId);
            renderPipelineMap.set(strId, renderPipeline);
        }
        return renderPipeline;
    }

    /**
     * 创建渲染管线
     * @param blendState 
     * @param depthState 
     * @param primitiveState 
     * @param vertexBuffers 
     * @param shaderInstance 
     * @param renderTarget 
     * @param entries 
     * @param strId 
     */
    private static _createRenderPipeline(blendState: GPUBlendState, depthState: GPUDepthStencilState,
        primitiveState: GPUPrimitiveState, vertexBuffers: GPUVertexBufferLayout[],
        shaderInstance: WebGPUShaderInstance, renderTarget: WebGPUInternalRT, entries: any, strId: string) {
        const device = WebGPURenderEngine._instance.getDevice();
        const descriptor = shaderInstance.getRenderPipelineDescriptor(); //获取渲染管线描述符模板
        descriptor.label = 'render_' + this.idCounter;
        descriptor.vertex.buffers = vertexBuffers;
        //descriptor.vertex.constants TODO
        const textureNum = renderTarget._textures.length;
        if (renderTarget._textures[0]._webGPUFormat === 'depth16unorm'
            || renderTarget._textures[0]._webGPUFormat === 'depth24plus-stencil8'
            || renderTarget._textures[0]._webGPUFormat === 'depth32float') {
            renderTarget._colorStates.length = 0;
            renderTarget._colorStates[0] = {
                format: renderTarget._depthTexture._webGPUFormat,
                blend: blendState,
                writeMask: GPUColorWrite.ALL,
            };
        } else {
            if (renderTarget._colorStates.length === textureNum) {
                for (let i = renderTarget._colorStates.length - 1; i > -1; i--) {
                    renderTarget._colorStates[i].format = renderTarget._textures[i]._webGPUFormat;
                    renderTarget._colorStates[i].blend = blendState;
                }
            } else {
                renderTarget._colorStates.length = textureNum;
                for (let i = 0; i < textureNum; i++) {
                    renderTarget._colorStates[i] = {
                        format: renderTarget._textures[i]._webGPUFormat,
                        blend: blendState,
                        writeMask: GPUColorWrite.ALL,
                    };
                }
            }
        }
        descriptor.fragment.targets = renderTarget._colorStates;
        descriptor.primitive = primitiveState;
        if (renderTarget._textures[0]._webGPUFormat === 'depth16unorm'
            || renderTarget._textures[0]._webGPUFormat === 'depth24plus-stencil8'
            || renderTarget._textures[0]._webGPUFormat === 'depth32float') {
            descriptor.depthStencil = {
                format: renderTarget._textures[0]._webGPUFormat,
                depthWriteEnabled: true,
                depthCompare: 'less',
            };
        } else {
            if (depthState)
                descriptor.depthStencil = depthState;
            else delete descriptor.depthStencil;
        }
        descriptor.layout = shaderInstance.createPipelineLayout(device, 'pipelineLayout_' + this.idCounter, entries);
        descriptor.multisample.count = renderTarget._samples;
        const renderPipeline = device.createRenderPipeline(descriptor);
        console.log('create renderPipeline_' + this.idCounter, strId, descriptor, renderTarget._samples);
        this.idCounter++;
        return renderPipeline;
    }
}