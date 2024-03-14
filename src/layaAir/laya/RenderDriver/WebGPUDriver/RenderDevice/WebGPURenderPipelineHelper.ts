import { BlendEquationSeparate } from "../../../RenderEngine/RenderEnum/BlendEquationSeparate";
import { BlendFactor } from "../../../RenderEngine/RenderEnum/BlendFactor";
import { BlendType } from "../../../RenderEngine/RenderEnum/BlendType";
import { CompareFunction } from "../../../RenderEngine/RenderEnum/CompareFunction";
import { CullMode, FrontFace } from "../../../RenderEngine/RenderEnum/CullMode";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { WebGPUInternalRT } from "./WebGPUInternalRT";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPURenderGeometry } from "./WebGPURenderGeometry";
import { WebGPUShaderInstance } from "./WebGPUShaderInstance";

export enum WebGPUCullMode {
    None = "none",
    Front = "front",
    Back = "back"
}

export enum WebGPUFrontFace {
    CCW = "ccw",
    CW = "cw"
}

export interface WebGPUBlendStateCache {
    state: GPUBlendState,
    id: number
}

export class WebGPUBlendState {
    private static _IdCounter: number = 0;
    private static _pointer_BlendType: number = 0; //0,1,2
    private static _pointer_OperationRGB_BlendEquationSeparate: number = 2; //3
    private static _pointer_OperationAlpha_BlendEquationSeparate: number = 5; //3
    private static _pointer_srcBlendRGB_BlendFactor: number = 8; //4
    private static _pointer_dstBlendRGB_BlendFactor: number = 12; //4
    private static _pointer_srcBlendAlpha_BlendFactor: number = 16; //4
    private static _pointer_dstBlendAlpha_BlendFactor: number = 20; //0-16
    private static _cache: { [key: number]: WebGPUBlendStateCache } = {};

    static getBlendState(blend: BlendType, operationRGB: BlendEquationSeparate, srcBlendRGB: BlendFactor, dstBlendRGB: BlendFactor, operationAlpha: BlendEquationSeparate, srcBlendAlpha: BlendFactor, dstBlendAlpha: BlendFactor): WebGPUBlendStateCache {
        const cacheID = this._getBlendStateCacheID(blend, operationRGB, srcBlendRGB, dstBlendRGB, operationAlpha, srcBlendAlpha, dstBlendAlpha);
        let state = this._cache[cacheID];
        if (!state)
            this._cache[cacheID] = state = { state: this._createBlendState(operationRGB, srcBlendRGB, dstBlendRGB, operationAlpha, srcBlendAlpha, dstBlendAlpha), id: this._IdCounter++ };
        return state;
    }

    private static _getBlendStateCacheID(blend: BlendType, operationRGB: BlendEquationSeparate, srcBlendRGB: BlendFactor, dstBlendRGB: BlendFactor, operationAlpha: BlendEquationSeparate, srcBlendAlpha: BlendFactor, dstBlendAlpha: BlendFactor) {
        if (blend == BlendType.BLEND_DISABLE) {
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
    id: number
}

export class WebGPUDepthStencilState {
    private static _IdCounter: number = 0;
    private static _pointer_DepthWriteEnable: number = 0;
    private static _pointer_DepthCompare: number = 1;
    private static _pointer_DepthFormat: number = 4;
    private static _cache: { [key: number]: WebGPUDepthStencilStateCache } = {};

    static getDepthStencilState(format: RenderTargetFormat, depthWriteEnabled: boolean, depthCompare: CompareFunction, stencilParam: any = null, depthBiasParam: any = null): WebGPUDepthStencilStateCache {
        const cacheID = this._getDepthStencilCacheID(format, depthWriteEnabled, depthCompare, stencilParam, depthBiasParam);
        let state = this._cache[cacheID];
        if (!state)
            this._cache[cacheID] = state = { state: this._createDepthStencilState(format, depthWriteEnabled, depthCompare, stencilParam, depthBiasParam), id: this._IdCounter++ };
        return state;
    }

    private static _getDepthStencilCacheID(format: RenderTargetFormat, depthWriteEnabled: boolean, depthCompare: CompareFunction, stencilParam: any = null, depthBiasParam: any = null) {
        return (Number(depthWriteEnabled) << this._pointer_DepthWriteEnable) +
            (depthCompare << this._pointer_DepthCompare) +
            (format << this._pointer_DepthFormat);
        //TODO stencil depthbias
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
                stateFormat = "depth32float"
                break;
            case RenderTargetFormat.STENCIL_8:
                stateFormat = "stencil8"
                break;
            case RenderTargetFormat.DEPTHSTENCIL_24_Plus:
                stateFormat = "depth24plus"
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
        return {
            format: stateFormat,
            depthCompare: stateDepthCompare,
            depthWriteEnabled: depthWriteEnabled
        };
    }
}

export interface WebGPUPrimitiveStateCache {
    state: GPUPrimitiveState,
    id: number
}

export class WebGPUPrimitiveState {
    private static _IdCounter: number = 0;
    private static _pointer_Topology: number = 0;
    private static _pointer_FrontFace: number = 3;
    private static _pointer_CullMode: number = 4;
    private static _cache: { [key: number]: WebGPUPrimitiveStateCache } = {};

    static getGPUPrimitiveState(topology: MeshTopology, frontFace: FrontFace, cullMode: CullMode): WebGPUPrimitiveStateCache {
        const cacheID = this._getGPUPrimitiveStateID(topology, frontFace, cullMode);
        let state = this._cache[cacheID];
        if (!state)
            this._cache[cacheID] = state = { state: this._createPrimitiveState(topology, frontFace, cullMode), id: this._IdCounter++ };
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
                state.topology = "point-list"
                break;
            case MeshTopology.Lines:
                state.topology = "line-list"
                break;
            case MeshTopology.LineStrip:
                state.topology = "line-strip"
                break;
            case MeshTopology.Triangles:
                state.topology = "triangle-list"
                break;
            case MeshTopology.TriangleStrip:
                state.topology = "triangle-strip";
                break;
            default:
                state.topology = "triangle-list"
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
                state.frontFace = "ccw";
                break;
            case FrontFace.CW:
                state.frontFace = "cw";
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
    /**
     * 获取渲染管线，如果缓存中存在，直接取出，否则创建一个，并放入缓存
     * @param info 
     * @param shader 
     * @param rt 
     * @returns 
     */
    static getRenderPipeline(info: IRenderPipelineInfo, shader: WebGPUShaderInstance, rt: WebGPUInternalRT) {
        const map = shader.renderPipelineMap;
        const primitiveState = WebGPUPrimitiveState.getGPUPrimitiveState(info.geometry.mode, info.frontFace, info.cullMode);
        const bufferState = info.geometry.bufferState;
        const depthStencilId = info.depthStencilState ? info.depthStencilState.id : -1;
        const strId = `${primitiveState.id}_${info.blendState.id}_${depthStencilId}_${rt.formatId}_${bufferState._id}_${bufferState._updateBufferLayoutFlag}`;
        let renderPipeline = map.get(strId);
        if (!renderPipeline) {
            console.log(info.blendState.state, info.depthStencilState?.state, primitiveState.state, bufferState._vertexState, shader, rt);
            //@ts-ignore
            //console.log(WebGPURenderEngine._instance._propertyNameMap);
            renderPipeline = this.createRenderPipeline
                (info.blendState.state, info.depthStencilState?.state, primitiveState.state, bufferState._vertexState, shader, rt);
            map.set(strId, renderPipeline);
        }
        return renderPipeline;
    }

    /**
     * 创建渲染管线
     * @param blendState 
     * @param depthState 
     * @param primitiveState 
     * @param vertexBuffers 
     * @param shader 
     * @param rt 
     * @returns 
     */
    static createRenderPipeline(blendState: GPUBlendState, depthState: GPUDepthStencilState,
        primitiveState: GPUPrimitiveState, vertexBuffers: GPUVertexBufferLayout[], shader: WebGPUShaderInstance, rt: WebGPUInternalRT) {
        const descriptor = shader.renderPipelineDescriptor;
        descriptor.vertex.buffers = vertexBuffers;
        //descriptor.vertex.constants TODO
        if (rt._colorState.length == rt._textures.length) {
            for (let i = rt._colorState.length - 1; i > -1; i--)
                rt._colorState[i].blend = blendState;
        } else {
            rt._colorState.length = 0;
            for (let i = 0, len = rt._textures.length; i < len; i++) {
                rt._colorState[i] = {
                    format: rt._textures[i]._webGPUFormat,
                    blend: blendState,
                    writeMask: GPUColorWrite.ALL,
                };
            }
        }
        descriptor.fragment.targets = rt._colorState;
        descriptor.primitive = primitiveState;
        if (depthState)
            descriptor.depthStencil = depthState;
        else delete descriptor.depthStencil;
        const renderPipeline = WebGPURenderEngine._instance.getDevice().createRenderPipeline(descriptor);
        console.log("create renderPipeline", descriptor, renderPipeline);
        return renderPipeline;
    }
}