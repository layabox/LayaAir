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

export interface IRender2DDataHandle {
    needUseMatrix: boolean;
    inheriteRenderData(context: IRenderContext2D): void;
    destroy(): void;
}

export interface IGlobalRenderData {
    cullRect: Vector4;
    renderLayerMask: number;
    globalShaderData: ShaderData;
}

export enum BufferModifyType {
    Vertex = 0,
    Index = 1,
}
export interface IBufferDataView {
    data: Float32Array | Uint16Array;
    start: number;
    length: number;
    stride: number;
    count: number;
    isModified: boolean;
    modify(type:BufferModifyType):void;
    owner: IDynamicVIBuffer;
}

export interface IBufferBlock {
    buffer: IDynamicVIBuffer,
    vertexViews?: IBufferDataView[],
    vertexBlocks?: number[],
    indexViews?: IBufferDataView[],
    indexBlocks?: number[],
}

export type VertexBufferBlock = {
    positions: number[],
    vertexViews: IBufferDataView[],
}
export interface IDynamicVIBuffer {
    vertexDeclaration: VertexDeclaration;
    bufferState: IBufferState;
    vertexBuffer: IVertexBuffer;
    indexBuffer: IIndexBuffer;
    checkVertexBuffer(length: number): IBufferBlock;
    checkIndexBuffer(length: number): IBufferBlock;
    releaseVertexBlocks(blocks: number[]): void;
    releaseIndexBlocks(blocks: number[]): void;
    upload(): void;
    clear(): void;
    destroy(): void;
}

export interface I2DPrimitiveDataHandle extends IRender2DDataHandle {
    mask: IRenderStruct2D | null;
    applyVertexBufferBlock(views: VertexBufferBlock[]): void;
}

export interface I2DBaseRenderDataHandle extends IRender2DDataHandle {
    lightReceive: boolean;
}

export interface IMesh2DRenderDataHandle extends I2DBaseRenderDataHandle {
    baseColor: Color;
    baseTexture: BaseTexture;
    baseTextureRange: Vector4;
    textureRangeIsClip: boolean;
    normal2DTexture: BaseTexture;
    normal2DStrength: number;
}

export interface ISpineRenderDataHandle extends I2DBaseRenderDataHandle {
    skeleton: spine.Skeleton;
}