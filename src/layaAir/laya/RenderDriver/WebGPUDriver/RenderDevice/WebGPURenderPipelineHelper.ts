import { BlendEquationSeparate } from "../../../RenderEngine/RenderEnum/BlendEquationSeparate";
import { BlendFactor } from "../../../RenderEngine/RenderEnum/BlendFactor";
import { BlendType } from "../../../RenderEngine/RenderEnum/BlendType";
import { CompareFunction } from "../../../RenderEngine/RenderEnum/CompareFunction";
import { CullMode, FrontFace } from "../../../RenderEngine/RenderEnum/CullMode";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { StencilOperation } from "../../../RenderEngine/RenderEnum/StencilOperation";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { WebGPUInternalRT } from "./WebGPUInternalRT";
import { WebGPURenderGeometry } from "./WebGPURenderGeometry";
import { WebGPUShaderData } from "./WebGPUShaderData";
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
            if (cacheID == 0) {
                this._cache[cacheID] = state = { state: null, key: cacheID, id: this._idCounter++ };
            } else {
                this._cache[cacheID] = state = { state: this._createBlendState(operationRGB, srcBlendRGB, dstBlendRGB, operationAlpha, srcBlendAlpha, dstBlendAlpha), key: cacheID, id: this._idCounter++ };
            }

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
    key: string,
    id: number
}

export class DepthStencilParam {
    depthWrite: boolean;
    depthTest: CompareFunction;
    depthBias: boolean;
    depthBiasConstant: number;
    depthBiasSlopeScale: number;
    depthBiasClamp: number;

    stencilEnable: boolean;
    stencilTest: CompareFunction;
    stencilWrite: boolean;
    stencilRef: number;
    stencilReadMask: number;
    stencilWriteMask: number;
    stencilOp: {
        x: StencilOperation; // fail
        y: StencilOperation; // depthFail
        z: StencilOperation; // pass
    };

};

export class WebGPUDepthStencilState {
    private static _idCounter: number = 0;

    private static _cache: Map<string, WebGPUDepthStencilStateCache> = new Map();

    static getDepthStencilState(format: RenderTargetFormat, depthStencilParam: DepthStencilParam): WebGPUDepthStencilStateCache {
        const cacheID = this._getDepthStencilCacheID(format, depthStencilParam);
        if (this._cache.has(cacheID)) {
            return this._cache.get(cacheID);
        }

        let state = {
            state: this._createDepthStencilState(format, depthStencilParam),
            key: cacheID,
            id: this._idCounter++
        };

        this._cache.set(cacheID, state);

        return state;
    }

    private static _getDepthStencilCacheID(format: RenderTargetFormat, depthStencilParam: DepthStencilParam) {
        let depthWrite = depthStencilParam.depthWrite;
        let depthTest = depthStencilParam.depthTest;
        let depthBias = depthStencilParam.depthBias;
        let depthBiasConstant = depthStencilParam.depthBiasConstant;
        let depthBiasSlopeScale = depthStencilParam.depthBiasSlopeScale;
        let depthBiasClamp = depthStencilParam.depthBiasClamp;

        if (depthWrite == false) {
            depthBias = false;
        }

        if (depthBias == false) {
            depthBiasConstant = 0;
            depthBiasSlopeScale = 0;
            depthBiasClamp = 0;
        }

        let depthState = (depthWrite ? 1 : 0) + (depthTest << 1) + ((depthBias ? 1 : 0) << 4);

        let depthStateKey = `${depthState}_${depthBiasConstant}_${depthBiasSlopeScale}_${depthBiasClamp}`;

        let stencilEnable = depthStencilParam.stencilEnable;
        let stencilTest = depthStencilParam.stencilTest;
        let stencilWrite = depthStencilParam.stencilWrite;
        let stencilRef = depthStencilParam.stencilRef;
        let stencilReadMask = depthStencilParam.stencilReadMask;
        let stencilWriteMask = depthStencilParam.stencilWriteMask;
        let stencilOp = depthStencilParam.stencilOp;

        if (stencilEnable == false) {
            stencilTest = CompareFunction.Always;
            stencilWrite = false;
            stencilRef = 0;
            stencilReadMask = 0xff;
            stencilWriteMask = 0xff;
            stencilOp.x = StencilOperation.Keep;
            stencilOp.y = StencilOperation.Keep;
            stencilOp.z = StencilOperation.Keep;
        }

        let stencilState = stencilEnable ? 1 : 0 + (stencilTest << 1) + ((stencilWrite ? 1 : 0) << 4) + (stencilOp.x << 5) + (stencilOp.y << 8) + (stencilOp.z << 11);
        let stencilState2 = stencilRef & 0xff + ((stencilReadMask & 0xff) << 8) + ((stencilWriteMask & 0xff) << 16);
        let stencilStateKey = `${stencilState}_${stencilState2}`;

        return `${format}|${depthStateKey}|${stencilStateKey}`;
    }

    private static _createDepthStencilState(format: RenderTargetFormat, depthStencilParam: DepthStencilParam): GPUDepthStencilState {
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
        switch (depthStencilParam.depthTest) {
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
            depthWriteEnabled: depthStencilParam.depthWrite,
        };

        if (depthStencilParam.depthWrite && depthStencilParam.depthBias) {
            state.depthBias = depthStencilParam.depthBiasConstant;
            state.depthBiasSlopeScale = depthStencilParam.depthBiasSlopeScale;
            state.depthBiasClamp = depthStencilParam.depthBiasClamp;
        }

        if (depthStencilParam.stencilEnable) {
            let stateStencilCompare: GPUCompareFunction;
            let stateFailOp: GPUStencilOperation = getGPUStencilOperation(depthStencilParam.stencilOp.x);
            let stateDepthFailOp: GPUStencilOperation = getGPUStencilOperation(depthStencilParam.stencilOp.y);
            let statePassOp: GPUStencilOperation = getGPUStencilOperation(depthStencilParam.stencilOp.z);
            switch (depthStencilParam.stencilTest) {
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
            state.stencilFront = {
                compare: stateStencilCompare,
                failOp: stateFailOp,
                depthFailOp: stateDepthFailOp,
                passOp: statePassOp
            };
            state.stencilReadMask = depthStencilParam.stencilReadMask || 0xff;
            if (depthStencilParam.stencilWrite)
                state.stencilWriteMask = depthStencilParam.stencilWriteMask || 0xff;
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
                state.frontFace = "ccw"; //由于WebGPU和WebGL的坐标系不同，这里需要反转
                break;
            case FrontFace.CW:
                state.frontFace = "cw";
                break;
        }
        return state;
    }
}

export class IRenderPipelineInfo {
    geometry: WebGPURenderGeometry;
    blendState: WebGPUBlendStateCache;
    depthStencilState: WebGPUDepthStencilStateCache;
    cullMode: CullMode;
    frontFace: FrontFace;
}

function getGPUStencilOperation(key: StencilOperation): GPUStencilOperation {
    switch (key) {
        case StencilOperation.Keep:
            return "keep";
        case StencilOperation.Zero:
            return "zero";
        case StencilOperation.Invert:
            return "invert";
        case StencilOperation.Replace:
            return "replace";
        case StencilOperation.IncrementSaturate:
            return "increment-clamp";
        case StencilOperation.DecrementSaturate:
            return "decrement-clamp";
        case StencilOperation.IncrementWrap:
            return "increment-wrap";
        case StencilOperation.DecrementWrap:
            return "decrement-wrap";
    }

}

export function getDepthStencilParamFromShader(shaderData: WebGPUShaderData, shaderInstance: WebGPUShaderInstance, dest: WebGPUInternalRT, depthStencilParam: DepthStencilParam) {
    const data = shaderData.getData();
    const renderState = (shaderInstance._shaderPass).renderState;

    // depth
    {
        const depthWrite = (renderState.depthWrite ?? data[Shader3D.DEPTH_WRITE]) ?? RenderState.Default.depthWrite;
        const depthTest = (renderState.depthTest ?? data[Shader3D.DEPTH_TEST]) ?? RenderState.Default.depthTest;

        let depthBias = data[Shader3D.DEPTH_BIAS] ?? RenderState.Default.depthBias;
        let depthBiasConstant = data[Shader3D.DEPTH_BIAS_CONSTANT] ?? RenderState.Default.depthBiasConstant;
        let depthBiasSlopeScale = data[Shader3D.DEPTH_BIAS_SLOPESCALE] ?? RenderState.Default.depthBiasSlopeScale;
        let depthBiasClamp = data[Shader3D.DEPTH_BIAS_CLAMP] ?? RenderState.Default.depthBiasClamp;

        depthStencilParam.depthWrite = depthWrite;
        depthStencilParam.depthTest = depthTest;
        depthStencilParam.depthBias = depthBias;
        depthStencilParam.depthBiasConstant = depthBiasConstant;
        depthStencilParam.depthBiasSlopeScale = depthBiasSlopeScale;
        depthStencilParam.depthBiasClamp = depthBiasClamp;
    }
    // stencil
    {
        const stencilParam = depthStencilParam;
        const stencilTest = (renderState.stencilTest ?? data[Shader3D.STENCIL_TEST]) ?? RenderState.Default.stencilTest;

        let formatHasStencil = dest.depthStencilFormat === RenderTargetFormat.STENCIL_8 || dest.depthStencilFormat === RenderTargetFormat.DEPTHSTENCIL_24_8 || dest.depthStencilFormat === RenderTargetFormat.DEPTHSTENCIL_24_Plus;

        const stencilRef = renderState.stencilRef ?? data[Shader3D.STENCIL_Ref] ?? RenderState.Default.stencilRef;
        const stencilWrite: boolean = renderState.stencilWrite ?? data[Shader3D.STENCIL_WRITE] ?? RenderState.Default.stencilWrite;
        const stencilOp = stencilWrite ? (renderState.stencilOp ?? data[Shader3D.STENCIL_Op] ?? RenderState.Default.stencilOp) : RenderState.Default.stencilOp;

        const stencilReadMask = renderState.stencilReadMask ?? data[Shader3D.STENCIL_READ_MASK] ?? RenderState.Default.stencilReadMask;
        const stencilWriteMask = stencilWrite ? (renderState.stencilWriteMask ?? data[Shader3D.STENCIL_WRITE_MASK] ?? RenderState.Default.stencilWriteMask) : 0x00;

        stencilParam.stencilEnable = stencilTest !== RenderState.STENCILTEST_OFF && formatHasStencil;
        stencilParam.stencilTest = stencilTest;
        stencilParam.stencilRef = stencilRef;
        stencilParam.stencilWrite = stencilWrite;
        stencilParam.stencilOp = stencilOp;
        stencilParam.stencilReadMask = stencilReadMask;
        stencilParam.stencilWriteMask = stencilWriteMask;
    }

}

export function getDepthStencilParamFromMaterial(shaderData: WebGPUShaderData, dest: WebGPUInternalRT, depthStencilParam: DepthStencilParam) {

    const data = shaderData.getData();

    // depth
    const depthWrite = data[Shader3D.DEPTH_WRITE] ?? RenderState.Default.depthWrite;
    const depthTest = data[Shader3D.DEPTH_TEST] ?? RenderState.Default.depthTest;

    let depthBias = data[Shader3D.DEPTH_BIAS] ?? RenderState.Default.depthBias;
    let depthBiasConstant = data[Shader3D.DEPTH_BIAS_CONSTANT] ?? RenderState.Default.depthBiasConstant;
    let depthBiasSlopeScale = data[Shader3D.DEPTH_BIAS_SLOPESCALE] ?? RenderState.Default.depthBiasSlopeScale;
    let depthBiasClamp = data[Shader3D.DEPTH_BIAS_CLAMP] ?? RenderState.Default.depthBiasClamp;

    depthStencilParam.depthWrite = depthWrite;
    depthStencilParam.depthTest = depthTest;
    depthStencilParam.depthBias = depthBias;
    depthStencilParam.depthBiasConstant = depthBiasConstant;
    depthStencilParam.depthBiasSlopeScale = depthBiasSlopeScale;
    depthStencilParam.depthBiasClamp = depthBiasClamp;

    // stencil
    let formatHasStencil = dest.depthStencilFormat === RenderTargetFormat.STENCIL_8 || dest.depthStencilFormat === RenderTargetFormat.DEPTHSTENCIL_24_8 || dest.depthStencilFormat === RenderTargetFormat.DEPTHSTENCIL_24_Plus;

    const stencilTest = data[Shader3D.STENCIL_TEST] ?? RenderState.Default.stencilTest;
    const stencilRef = data[Shader3D.STENCIL_Ref] ?? RenderState.Default.stencilRef;
    const stencilWrite = data[Shader3D.STENCIL_WRITE] ?? RenderState.Default.stencilWrite;
    const stencilOp = stencilWrite ? (data[Shader3D.STENCIL_Op] ?? RenderState.Default.stencilOp) : RenderState.Default.stencilOp;
    let stencilReadMask = data[Shader3D.STENCIL_READ_MASK] ?? RenderState.Default.stencilReadMask;
    let stencilWriteMask = stencilWrite ? (data[Shader3D.STENCIL_WRITE_MASK] ?? RenderState.Default.stencilWriteMask) : 0x00;

    depthStencilParam.stencilEnable = stencilTest !== RenderState.STENCILTEST_OFF && formatHasStencil;
    depthStencilParam.stencilTest = stencilTest;
    depthStencilParam.stencilRef = stencilRef;
    depthStencilParam.stencilWrite = stencilWrite;
    depthStencilParam.stencilOp = stencilOp;
    depthStencilParam.stencilReadMask = stencilReadMask;
    depthStencilParam.stencilWriteMask = stencilWriteMask;
}
