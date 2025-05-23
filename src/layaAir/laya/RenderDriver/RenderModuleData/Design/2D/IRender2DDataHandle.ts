import { Color } from "../../../../maths/Color";
import { Vector4 } from "../../../../maths/Vector4";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
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
    start: number;
    length: number;
    stride: number;
    isModified: boolean;
    modifyType: BufferModifyType;
    owner: I2DGraphicWholeBuffer;
    getData(): Float32Array[] | Uint16Array;
    modify(): void;
}

export interface I2DGraphicWholeBuffer {
    buffers: IVertexBuffer[] | IIndexBuffer
    bufferData: Float32Array[] | Uint16Array;
    modifyType: BufferModifyType;
    resetData(byteLength: number): void;
    destroy(): void;
}

export type Graphic2DVBBlock = {
    positions: number[],
    vertexViews: I2DGraphicBufferDataView[],
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