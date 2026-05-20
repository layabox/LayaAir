import { LayaGL } from "../../../layagl/LayaGL";
import { IIndexBuffer } from "../../../RenderDriver/DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { ShaderDataType } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { Shader3D, ShaderFeatureType } from "../../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { VertexElement } from "../../../renders/VertexElement";
import { VertexElementFormat } from "../../../renders/VertexElementFormat";
import SequenceFrame2DFS from "./shader/SequenceFrame2D.fs";
import SequenceFrame2DVS from "./shader/SequenceFrame2D.vs";

/**
 * @en Vertex attribute locations for the SequenceFrame2D shader.
 * @zh SequenceFrame2D Shader 的顶点属性位置。
 */
export enum SequenceFrame2DVertex {
    PositionUV = 0,
    Matrix0 = 1,
    Matrix1 = 2,
    Runtime = 3,
    Playback = 4,
    SizeTiles = 5,
    ColorUnit = 6,
    UVRect = 7,
}

/**
 * @en Registers the shader and shared geometry declarations for 2D sequence frames.
 * @zh 注册 2D 序列帧的 Shader 与共享网格声明。
 */
export class SequenceFrame2DShader {
    /** @internal */
    static readonly RUNTIME_FLOAT_STRIDE = 12;
    /** @internal */
    static readonly CONFIG_FLOAT_STRIDE = 16;
    /** @internal */
    static readonly INSTANCE_FLOAT_STRIDE = SequenceFrame2DShader.RUNTIME_FLOAT_STRIDE + SequenceFrame2DShader.CONFIG_FLOAT_STRIDE;

    /** @internal */
    static baseDeclaration: VertexDeclaration;
    /** @internal */
    static runtimeDeclaration: VertexDeclaration;
    /** @internal */
    static configDeclaration: VertexDeclaration;

    /** @internal */
    static _vbs: IVertexBuffer;

    /** @internal */
    static _ibs: IIndexBuffer;

    /** @en Whether shader resources have been registered. @zh Shader 资源是否已注册。 */
    private static _inited: boolean = false;

    /**
     * @en Registers the shader and shared quad buffers.
     * @zh 注册 Shader 与共享四边形缓冲。
     */
    static __init__(): void {
        if (SequenceFrame2DShader._inited) {
            return;
        }
        SequenceFrame2DShader._inited = true;

        const attributeMap: { [name: string]: [number, ShaderDataType] } = {
            "a_SequenceFramePositionUV": [SequenceFrame2DVertex.PositionUV, ShaderDataType.Vector4],
            "a_SequenceFrameMatrix0": [SequenceFrame2DVertex.Matrix0, ShaderDataType.Vector4],
            "a_SequenceFrameMatrix1": [SequenceFrame2DVertex.Matrix1, ShaderDataType.Vector4],
            "a_SequenceFrameRuntime": [SequenceFrame2DVertex.Runtime, ShaderDataType.Vector4],
            "a_SequenceFramePlayback": [SequenceFrame2DVertex.Playback, ShaderDataType.Vector4],
            "a_SequenceFrameSizeTiles": [SequenceFrame2DVertex.SizeTiles, ShaderDataType.Vector4],
            "a_SequenceFrameColorUnit": [SequenceFrame2DVertex.ColorUnit, ShaderDataType.Vector4],
            "a_SequenceFrameUVRect": [SequenceFrame2DVertex.UVRect, ShaderDataType.Vector4],
        };
        const uniformMap: { [name: string]: ShaderDataType } = {};

        const shader = Shader3D.add("SequenceFrame2D", true, false);
        shader.shaderType = ShaderFeatureType.Default;
        const subShader = new SubShader(attributeMap, uniformMap, {});
        shader.addSubShader(subShader);
        subShader.addShaderPass(SequenceFrame2DVS, SequenceFrame2DFS);

        SequenceFrame2DShader.baseDeclaration = new VertexDeclaration(16, [
            new VertexElement(0, VertexElementFormat.Vector4, SequenceFrame2DVertex.PositionUV),
        ]);

        // Runtime instance data: transform plus playback start/hold state.
        // The sequence frame itself advances from the 2D pass global u_Time.
        SequenceFrame2DShader.runtimeDeclaration = new VertexDeclaration(SequenceFrame2DShader.RUNTIME_FLOAT_STRIDE * 4, [
            new VertexElement(0, VertexElementFormat.Vector4, SequenceFrame2DVertex.Matrix0),
            new VertexElement(16, VertexElementFormat.Vector4, SequenceFrame2DVertex.Matrix1),
            new VertexElement(32, VertexElementFormat.Vector4, SequenceFrame2DVertex.Runtime),
        ]);

        // Per-instance settings: playback, sheet layout, tint RGB, unit scale, and UV rect.
        // This buffer is uploaded only when public settings or texture data change.
        SequenceFrame2DShader.configDeclaration = new VertexDeclaration(SequenceFrame2DShader.CONFIG_FLOAT_STRIDE * 4, [
            new VertexElement(0, VertexElementFormat.Vector4, SequenceFrame2DVertex.Playback),
            new VertexElement(16, VertexElementFormat.Vector4, SequenceFrame2DVertex.SizeTiles),
            new VertexElement(32, VertexElementFormat.Vector4, SequenceFrame2DVertex.ColorUnit),
            new VertexElement(48, VertexElementFormat.Vector4, SequenceFrame2DVertex.UVRect),
        ]);

        const vertexData = new Float32Array([
            -0.5, -0.5, 0, 0,
            0.5, -0.5, 1, 0,
            0.5, 0.5, 1, 1,
            -0.5, 0.5, 0, 1,
        ]);

        const indexData = new Uint16Array([0, 1, 2, 0, 2, 3]);

        const vertexBuffer = SequenceFrame2DShader._vbs = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Static);
        vertexBuffer.vertexDeclaration = SequenceFrame2DShader.baseDeclaration;
        vertexBuffer.instanceBuffer = false;
        vertexBuffer.setDataLength(vertexData.byteLength);
        vertexBuffer.setData(vertexData.buffer, 0, 0, vertexData.byteLength);

        const indexBuffer = SequenceFrame2DShader._ibs = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Static);
        indexBuffer._setIndexDataLength(indexData.byteLength);
        indexBuffer._setIndexData(indexData, 0);
    }
}
