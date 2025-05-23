import { Color } from "../../../../maths/Color";
import { Vector4 } from "../../../../maths/Vector4";
import { VertexDeclaration } from "../../../../RenderEngine/VertexDeclaration";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IBufferState } from "../../../DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../../../DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../../DriverDesign/RenderDevice/IVertexBuffer";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { IRenderStruct2D } from "./IRenderStruct2D";

/**
 * 渲染处理数据
 */
export interface IRender2DDataHandle {
    needUseMatrix: boolean;
    inheriteRenderData(context: IRenderContext2D): void;
    destroy(): void;
}

/**
 * 全局数据
 */
export interface I2DGlobalRenderData {
    cullRect: Vector4;
    renderLayerMask: number;
    globalShaderData: ShaderData;
}


export enum BufferModifyType {
    Vertex = 0,
    Index = 1,
}
export interface I2DGraphicBufferDataView {
    data: Float32Array | Uint16Array;
    start: number;
    length: number;
    stride: number;
    count: number;
    isModified: boolean;
    modify(type: BufferModifyType): void;
    owner: IGraphicDynamicVIBuffer;
}

export interface I2DGraphicBufferBlock {
    buffer: IGraphicDynamicVIBuffer,
    vertexViews?: I2DGraphicBufferDataView[],
    vertexBlocks?: number[],
    indexViews?: I2DGraphicBufferDataView[],
    indexBlocks?: number[],
}

export type Graphic2DVBBlock = {
    positions: number[],
    vertexViews: I2DGraphicBufferDataView[],
}

export interface IGraphicDynamicVIBuffer {
    vertexDeclaration: VertexDeclaration;
    bufferState: IBufferState;
    vertexBuffer: IVertexBuffer;
    indexBuffer: IIndexBuffer;
    checkVertexBuffer(length: number): I2DGraphicBufferBlock;
    checkIndexBuffer(length: number): I2DGraphicBufferBlock;
    releaseVertexBlocks(blocks: number[]): void;
    releaseIndexBlocks(blocks: number[]): void;
    upload(): void;
    clear(): void;
    destroy(): void;
}

/**
 * primitive渲染数据处理
 */
export interface I2DPrimitiveDataHandle extends IRender2DDataHandle {
    mask: IRenderStruct2D | null;
    applyVertexBufferBlock(views: Graphic2DVBBlock[]): void;
}

/**
 * 基础组件数据处理
 */
export interface I2DBaseRenderDataHandle extends IRender2DDataHandle {
    lightReceive: boolean;
}

/**
 * mesh2D数据处理类
 */
export interface IMesh2DRenderDataHandle extends I2DBaseRenderDataHandle {
    baseColor: Color;
    baseTexture: BaseTexture;
    baseTextureRange: Vector4;
    textureRangeIsClip: boolean;
    normal2DTexture: BaseTexture;
    normal2DStrength: number;
}

/**
 * spine数据处理类
 */
export interface ISpineRenderDataHandle extends I2DBaseRenderDataHandle {
    skeleton: spine.Skeleton;
}