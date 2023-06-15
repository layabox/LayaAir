import { WebGPUEngine } from "../../../RenderEngine/RenderEngine/WebGPUEngine/WebGPUEngine";
import { WebGPUInternalRT } from "../../../RenderEngine/RenderEngine/WebGPUEngine/WebGPUInternalRT";
import { BlendEquationSeparate } from "../../../RenderEngine/RenderEnum/BlendEquationSeparate";
import { BlendFactor } from "../../../RenderEngine/RenderEnum/BlendFactor";
import { BlendType } from "../../../RenderEngine/RenderEnum/BlendType";
import { CompareFunction } from "../../../RenderEngine/RenderEnum/CompareFunction";
import { CullMode } from "../../../RenderEngine/RenderEnum/CullMode";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { VertexAttributeLayout } from "../../../RenderEngine/VertexAttributeLayout";
import { VertexElementFormat } from "../../../renders/VertexElementFormat";
/**
 * WebGPU BlendState
 */
export class WGPUBlendState {
    static pool: { [key: number]: WGPUBlendState } = {}
    static getBlendState(blend: BlendType, operationRGB: BlendEquationSeparate = BlendEquationSeparate.ADD, srcBlendRGB: BlendFactor = BlendFactor.One, dstBlendRGB: BlendFactor = BlendFactor.One, operationAlpha: BlendEquationSeparate = BlendEquationSeparate.ADD, srcBlendAlpha: BlendFactor = BlendFactor.One, dstBlendAlpha: BlendFactor = BlendFactor.One) {
        let id = WGPUBlendState.getmapID(blend, operationRGB, srcBlendRGB, dstBlendRGB, operationAlpha, srcBlendAlpha, dstBlendAlpha);
        if (WGPUBlendState.pool[id]) {
            return WGPUBlendState.pool[id];
        } else {
            return new WGPUBlendState(blend, operationRGB, srcBlendRGB, dstBlendRGB, operationAlpha, srcBlendAlpha, dstBlendAlpha);
        }
    }
    public mapId: number = -1;
    state: GPUBlendState;
    constructor(blend: BlendType, operationRGB: BlendEquationSeparate, srcBlendRGB: BlendFactor, dstBlendRGB: BlendFactor, operationAlpha: BlendEquationSeparate, srcBlendAlpha: BlendFactor, dstBlendAlpha: BlendFactor) {
        //BlendFactor 4位 operation 3位
        this.mapId = WGPUBlendState.getmapID(blend, operationRGB, srcBlendRGB, dstBlendRGB, operationAlpha, srcBlendAlpha, dstBlendAlpha)
        if (blend == BlendType.BLEND_DISABLE) {
            this.state = null;
        } else {
            this.state.color = this.getComponent(operationRGB, srcBlendRGB, dstBlendRGB);
            this.state.alpha = this.getComponent(operationAlpha, srcBlendAlpha, dstBlendAlpha);
        }
        WGPUBlendState.pool[this.mapId] = this;
    }

    getComponent(operation: BlendEquationSeparate, src: BlendFactor, dst: BlendFactor): GPUBlendComponent {
        let comp: GPUBlendComponent = {}
        let getfactor = (factor: BlendFactor): GPUBlendFactor => {
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
        };
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
        comp.srcFactor = getfactor(src);
        comp.dstFactor = getfactor(dst);
        return comp;
    }

    static getmapID(blend: BlendType, operationRGB: BlendEquationSeparate, srcBlendRGB: BlendFactor, dstBlendRGB: BlendFactor, operationAlpha: BlendEquationSeparate, srcBlendAlpha: BlendFactor, dstBlendAlpha: BlendFactor) {
        if (blend == BlendType.BLEND_DISABLE) {
            return -1;
        } else {
            return srcBlendRGB + (dstBlendRGB << 4) + (srcBlendAlpha << 8) + (dstBlendAlpha << 12) + (operationRGB << 16) + (operationAlpha << 19);
        }
    }

}

/**
 * WebGPU DepthStencil
 */
export class WGPUDepthStencilState {
    static pool: { [key: number]: WGPUDepthStencilState } = {};
    static getmapID(format: RenderTargetFormat, depthWriteEnabled: boolean, depthCompare: CompareFunction, stencilParam: any = null, depthBiasParam: any = null) {
        return format + ((depthWriteEnabled ? 0 : 1) << 6) + (depthCompare << 7);
    }
    static getDepthStencilState(format: RenderTargetFormat, depthWriteEnabled: boolean, depthCompare: CompareFunction, stencilParam: any = null, depthBiasParam: any = null) {
        let id = WGPUDepthStencilState.getmapID(format, depthWriteEnabled, depthCompare, stencilParam, depthBiasParam);
        if (WGPUDepthStencilState.pool[id]) {
            return WGPUDepthStencilState.pool[id];
        } else {
            return new WGPUDepthStencilState(format, depthWriteEnabled, depthCompare, stencilParam, depthBiasParam);
        }
    }

    state: GPUDepthStencilState;

    public mapId: number = -1;

    constructor(format: RenderTargetFormat, depthWriteEnabled: boolean, depthCompare: CompareFunction, stencilParam: any = null, depthBiasParam: any = null) {
        this.mapId = WGPUDepthStencilState.getmapID(format, depthWriteEnabled, depthCompare, stencilParam, depthBiasParam);
        this.state = { format: "depth24plus-stencil8" };
        WGPUDepthStencilState.pool[this.mapId] = this;
        switch (format) {
            case RenderTargetFormat.DEPTH_16:
                this.state.format = "depth16unorm";
                break;
            case RenderTargetFormat.DEPTHSTENCIL_24_8:
                this.state.format = "depth24plus-stencil8";
                break;
            case RenderTargetFormat.DEPTH_32:
                this.state.format = "depth32float"
                break;
            case RenderTargetFormat.STENCIL_8:
                this.state.format = "stencil8"
                break;
            case RenderTargetFormat.DEPTHSTENCIL_24_Plus:
                this.state.format = "depth24plus"
                break;
        }
        this.state.depthWriteEnabled = depthWriteEnabled;
        switch (depthCompare) {
            case CompareFunction.Never:
                this.state.depthCompare = "never";
                break;
            case CompareFunction.Less:
                this.state.depthCompare = "greater";
                break;
            case CompareFunction.Equal:
                this.state.depthCompare = "equal";
                break;
            case CompareFunction.LessEqual:
                this.state.depthCompare = "less-equal";
                break;
            case CompareFunction.Greater:
                this.state.depthCompare = "greater";
                break;
            case CompareFunction.NotEqual:
                this.state.depthCompare = "not-equal";
                break;
            case CompareFunction.GreaterEqual:
                this.state.depthCompare = "greater-equal";
                break;
            case CompareFunction.Always:
                this.state.depthCompare = "always";
                break;
        }
        //this.state.depthCompare = "always";
        //TODO Stencil
        //TODO DepthBias
    }
}

/**
 * WebGPU GPUPrimitiveState
 */
export class WGPUPrimitiveState {
    static pool: { [key: number]: WGPUPrimitiveState } = {};
    static getmapID(mode: MeshTopology, indexformat: IndexFormat, cullMode: CullMode, unclippedDepth: boolean = true) {
        return (mode) + (indexformat << 3) + (cullMode << 5) + ((unclippedDepth ? 1 : 0) << 7);
    }
    static getPrimitiveState(mode: MeshTopology, indexformat: IndexFormat, cullMode: CullMode, unclippedDepth: boolean = true) {
        let id = WGPUPrimitiveState.getmapID(mode, indexformat, cullMode, unclippedDepth);
        if (WGPUPrimitiveState.pool[id]) {
            return WGPUPrimitiveState.pool[id];
        } else
            return new WGPUPrimitiveState(mode, indexformat, cullMode, unclippedDepth);
    }
    state: GPUPrimitiveState;

    public mapId: number = -1;
    constructor(mode: MeshTopology, indexformat: IndexFormat, cullMode: CullMode, unclippedDepth: boolean = true) {
        this.mapId = WGPUPrimitiveState.getmapID(mode, indexformat, cullMode, unclippedDepth);
        this.state = {};
        WGPUPrimitiveState.pool[this.mapId] = this;
        let stripIndexFormat: GPUIndexFormat;
        switch (indexformat) {
            case IndexFormat.UInt16:
                stripIndexFormat = "uint16";
                break;
            case IndexFormat.UInt32:
                stripIndexFormat = "uint32";
                break
            default:
                stripIndexFormat = "uint16";
                break;
        }
        switch (mode) {
            case MeshTopology.Points:
                this.state.topology = "point-list"
                break;
            case MeshTopology.Lines:
                this.state.topology = "line-list"
                break;
            case MeshTopology.LineStrip:
                this.state.topology = "line-strip"
                this.state.stripIndexFormat = stripIndexFormat;
                break;
            case MeshTopology.Triangles:
                this.state.topology = "triangle-list"
                break;
            case MeshTopology.TriangleStrip:
                this.state.topology = "triangle-strip";
                this.state.stripIndexFormat = stripIndexFormat;
                break;
            default:
                this.state.topology = "triangle-list"
                break;
        }

        switch (cullMode) {
            case CullMode.Off:
                this.state.cullMode = "none";
                break;
            case CullMode.Back:
                this.state.cullMode = "front";
                break;
            case CullMode.Front:
                this.state.cullMode = "back";
                break;
        }
        this.state.unclippedDepth = unclippedDepth;
    }
}

/**
 * WebGPU GPUVertexState.buffers
 */
export class WGPUVertexBufferLayouts {
    static pool: { [key: number]: WGPUVertexBufferLayouts } = {};


    static getVertexBufferLayouts(vetexlayout: VertexAttributeLayout): WGPUVertexBufferLayouts {
        if (WGPUVertexBufferLayouts.pool[vetexlayout.id]) {
            return WGPUVertexBufferLayouts.pool[vetexlayout.id];
        } else {
            return new WGPUVertexBufferLayouts(vetexlayout);
        }
    }

    state: Array<GPUVertexBufferLayout>;
    mapID: number;
    constructor(vertexlayout: VertexAttributeLayout) {
        this.state = [];
        WGPUVertexBufferLayouts.pool[vertexlayout.id] = this;
        this.mapID = vertexlayout.id;
        this.state = new Array<GPUVertexBufferLayout>();
        let vaeelements = vertexlayout.VAElements;
        for (var i = 0, n = vaeelements.length; i < n; i++) {
            let vaeOneElements = vaeelements[i];
            let stride = vertexlayout.attributeByteSize[i];
            let stepmode: GPUVertexStepMode = vertexlayout.instanceMode[i] ? "instance" : 'vertex';
            let arrays: Array<GPUVertexAttribute> = new Array();
            for (var j = 0, m = vaeOneElements.length; j < m; j++) {
                let vaee = vaeOneElements[j];
                let ob: GPUVertexAttribute = {
                    format: this.getvertexAttributeFormat(vaee.format),
                    offset: vaee.stride,
                    shaderLocation: vaee.shaderLocation
                }
                arrays.push(ob);
            }
            let vbl: GPUVertexBufferLayout = {
                arrayStride: stride,
                stepMode: stepmode,
                attributes: arrays
            };
            this.state.push(vbl);
        }
    }

    getvertexAttributeFormat(data: string): GPUVertexFormat {
        switch (data) {
            case VertexElementFormat.Single:
                return "float32";
            case VertexElementFormat.Vector2:
                return "float32x2";
            case VertexElementFormat.Vector3:
                return "float32x3";
            case VertexElementFormat.Vector4:
                return "float32x4";
            case VertexElementFormat.Color:
                return "float32x4";
            case VertexElementFormat.Byte4:
                return "uint8x4";
            case VertexElementFormat.Byte2:
                return "uint8x2";
            case VertexElementFormat.Short2:
                return "float16x2";
            case VertexElementFormat.Short4:
                return "float16x4";
            case VertexElementFormat.NormalizedShort2:
                return "unorm16x2";
            case VertexElementFormat.NormalizedShort4:
                return "unorm16x4";
            case VertexElementFormat.NorByte4:
                return "unorm8x4";
            default:
                throw 'no cache has vertex mode';
        }
    }
}

export class WGPURenderPipeline {
    static offscreenFormat: GPUTextureFormat;
    pipeline: GPURenderPipeline;

    constructor(engine: WebGPUEngine, gpuPipelineLayout: GPUPipelineLayout,
        vertexModule: GPUShaderModule,
        fragModule: GPUShaderModule,
        vertexBufferLayouts: WGPUVertexBufferLayouts,
        targets: WebGPUInternalRT, blendState: WGPUBlendState,
        depthStencilState: WGPUDepthStencilState, primitiveState: WGPUPrimitiveState) {
        let dest: GPURenderPipelineDescriptor = {
            layout: gpuPipelineLayout,
            vertex: {
                module: vertexModule,
                entryPoint: "main",
                buffers: vertexBufferLayouts.state
            },
            fragment: {
                module: fragModule,
                entryPoint: "main",
                targets: this.getFragmentFormatByRT(targets, blendState),
            },
            primitive: primitiveState.state,
            depthStencil: depthStencilState.state
        }
        this.pipeline = engine._device.createRenderPipeline(dest);
    }

    getFragmentFormatByRT(rt: WebGPUInternalRT, blendState: WGPUBlendState): Array<GPUColorTargetState> {

        let colortargetState: Array<GPUColorTargetState> = new Array();
        //Color TargetState
        let gpuformat: GPUTextureFormat = "rgba8unorm"
        if (!rt.isOffscreenRT) {
            switch (rt.colorFormat) {
                case RenderTargetFormat.None:
                case RenderTargetFormat.R8G8B8A8:
                    gpuformat = rt.isSRGB ? "rgba8unorm-srgb" : "rgba8unorm";
                    break;
                case RenderTargetFormat.R16G16B16A16:
                    gpuformat = "rgba16float";
                    break;
                case RenderTargetFormat.R32G32B32A32:
                    gpuformat = "rgba32float";
                    break;
            }
        } else {
            gpuformat = WGPURenderPipeline.offscreenFormat

        }

        colortargetState.push(blendState.state ? {
            format: gpuformat,
            blend: blendState.state
        } : {
            format: gpuformat
        })

        return colortargetState;
    }
}

