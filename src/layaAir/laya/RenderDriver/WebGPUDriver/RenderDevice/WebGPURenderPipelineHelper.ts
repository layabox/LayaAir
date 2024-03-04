import { BlendEquationSeparate } from "../../../RenderEngine/RenderEnum/BlendEquationSeparate";
import { BlendFactor } from "../../../RenderEngine/RenderEnum/BlendFactor";
import { BlendType } from "../../../RenderEngine/RenderEnum/BlendType";
import { CompareFunction } from "../../../RenderEngine/RenderEnum/CompareFunction";
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

export class WebGPUBlendState {
    static pointer_BlendType: number = 0;//0,1,2
    static pointer_OperationRGB_BlendEquationSeparate: number = 2;//3
    static pointer_OperationAlpha_BlendEquationSeparate: number = 5;//3
    static pointer_srcBlendRGB_BlendFactor: number = 8;//4
    static pointer_dstBlendRGB_BlendFactor: number = 12;//4
    static pointer_srcBlendAlpha_BlendFactor: number = 16;//4
    static pointer_dstBlendAlpha_BlendFactor: number = 20;//0-16
    dstBlendAlpha: BlendFactor
    static _map: { [key: number]: GPUBlendState } = {}
    static getBlendState(blend: BlendType, operationRGB: BlendEquationSeparate, srcBlendRGB: BlendFactor, dstBlendRGB: BlendFactor, operationAlpha: BlendEquationSeparate, srcBlendAlpha: BlendFactor, dstBlendAlpha: BlendFactor): GPUBlendState {
        if (blend == BlendType.BLEND_DISABLE) {
            return null;
        }
        let cacheID = WebGPUBlendState.getBlendStateCacheID(blend, operationRGB, srcBlendRGB, dstBlendRGB, operationAlpha, srcBlendAlpha, dstBlendAlpha);
        let state = WebGPUBlendState._map[cacheID];
        if (!state)
            WebGPUBlendState._map[cacheID] = state = WebGPUBlendState.createBlendState(operationRGB, srcBlendRGB, dstBlendRGB, operationAlpha, srcBlendAlpha, dstBlendAlpha)
        return state;
    }
    static getBlendStateCacheID(blend: BlendType, operationRGB: BlendEquationSeparate, srcBlendRGB: BlendFactor, dstBlendRGB: BlendFactor, operationAlpha: BlendEquationSeparate, srcBlendAlpha: BlendFactor, dstBlendAlpha: BlendFactor) {
        if (blend == BlendType.BLEND_DISABLE) {
            return 0;
        } else {
            return (blend << WebGPUBlendState.pointer_BlendType) +
                (srcBlendRGB << WebGPUBlendState.pointer_srcBlendRGB_BlendFactor) +
                (dstBlendRGB << WebGPUBlendState.pointer_dstBlendRGB_BlendFactor) +
                (srcBlendAlpha << WebGPUBlendState.pointer_srcBlendAlpha_BlendFactor) +
                (dstBlendAlpha << WebGPUBlendState.pointer_dstBlendAlpha_BlendFactor) +
                (operationRGB << WebGPUBlendState.pointer_OperationRGB_BlendEquationSeparate) +
                (operationAlpha << WebGPUBlendState.pointer_OperationAlpha_BlendEquationSeparate);
        }
    }
    static createBlendState(operationRGB: BlendEquationSeparate, srcBlendRGB: BlendFactor, dstBlendRGB: BlendFactor, operationAlpha: BlendEquationSeparate, srcBlendAlpha: BlendFactor, dstBlendAlpha: BlendFactor): GPUBlendState {
        return {
            color: WebGPUBlendState._getComponent(operationRGB, srcBlendRGB, dstBlendRGB),
            alpha: WebGPUBlendState._getComponent(operationAlpha, srcBlendAlpha, dstBlendAlpha)
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
        let comp: GPUBlendComponent = {}

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
        };
        comp.srcFactor = WebGPUBlendState._getFactor(src);
        comp.dstFactor = WebGPUBlendState._getFactor(dst);
        return comp;
    }
}

export class WebGPUDepthStencilState {
    static pointer_DepthWriteEnable: number = 0;//1(0 false,1true)
    static pointer_DepthCompare: number = 1;//3
    static Pointer_DepthFormat: number = 4;
    static _map: { [key: number]: GPUDepthStencilState } = {};
    static _getDepthStencilState(format: RenderTargetFormat, depthWriteEnabled: boolean, depthCompare: CompareFunction, stencilParam: any = null, depthBiasParam: any = null): GPUDepthStencilState {
        let cacheID = WebGPUDepthStencilState.getDepthStencilCacheID(format, depthWriteEnabled, depthCompare, stencilParam, depthBiasParam);
        let state = WebGPUDepthStencilState._map[cacheID];
        if (!state)
            WebGPUDepthStencilState._map[cacheID] = state = WebGPUDepthStencilState.createDepthStencilState(format, depthWriteEnabled, depthCompare, stencilParam, depthBiasParam);
        return state;
    }

    static getDepthStencilCacheID(format: RenderTargetFormat, depthWriteEnabled: boolean, depthCompare: CompareFunction, stencilParam: any = null, depthBiasParam: any = null) {
        return (format << WebGPUDepthStencilState.Pointer_DepthFormat) +
            (Number(depthWriteEnabled) << WebGPUDepthStencilState.pointer_DepthWriteEnable) +
            (depthCompare << WebGPUDepthStencilState.pointer_DepthCompare);
        //TODO stencil  depthbias
    }

    static createDepthStencilState(format: RenderTargetFormat, depthWriteEnabled: boolean, depthCompare: CompareFunction, stencilParam: any = null, depthBiasParam: any = null): GPUDepthStencilState {
        let stateFormat: GPUTextureFormat;
        let statdepthCompare: GPUCompareFunction;
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
                statdepthCompare = "never";
                break;
            case CompareFunction.Less:
                statdepthCompare = "greater";
                break;
            case CompareFunction.Equal:
                statdepthCompare = "equal";
                break;
            case CompareFunction.LessEqual:
                statdepthCompare = "less-equal";
                break;
            case CompareFunction.Greater:
                statdepthCompare = "greater";
                break;
            case CompareFunction.NotEqual:
                statdepthCompare = "not-equal";
                break;
            case CompareFunction.GreaterEqual:
                statdepthCompare = "greater-equal";
                break;
            case CompareFunction.Always:
                statdepthCompare = "always";
                break;
        }
        return {
            format: stateFormat,
            depthCompare: statdepthCompare,
            depthWriteEnabled: depthWriteEnabled
        };
    }
}

export interface renderpipelineInfo {
    geometry: WebGPURenderGeometry,//ID
    blendState: GPUBlendState,
    depthStencilState: GPUDepthStencilState,
    cullMode: GPUCullMode,
    frontFace: GPUFrontFace
}

export class WebGPURenderPipeline {
    static getWebGPURenderPipeline(info: renderpipelineInfo, shader: WebGPUShaderInstance, internalRT: WebGPUInternalRT) {
        let descriptor = shader._renderPipelineDescriptor;
        descriptor.vertex.buffers = info.geometry.bufferState._vertexState;
        //descriptor.vertex.constants TODO
        let blenElement = info.blendState;
        if (internalRT._colorState.length == 1) {
            internalRT._colorState[0].blend = blenElement;
        } else {
            //mul ColorAttach TODO 
        }
        descriptor.fragment.targets = internalRT._colorState;
        descriptor.primitive = info.geometry._primitiveState;
        descriptor.depthStencil = info.depthStencilState;
        descriptor.primitive.cullMode = info.cullMode;
        descriptor.primitive.frontFace = info.frontFace;
        return WebGPURenderEngine._instance.getDevice().createRenderPipeline(descriptor);
    }
}