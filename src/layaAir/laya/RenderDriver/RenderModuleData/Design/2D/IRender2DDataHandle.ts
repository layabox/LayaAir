import { Color } from "../../../../maths/Color";
import { Vector4 } from "../../../../maths/Vector4";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IIndexBuffer } from "../../../DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderGeometryElement } from "../../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../../../DriverDesign/RenderDevice/IVertexBuffer";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { IRenderStruct2D } from "./IRenderStruct2D";

/**
 * 渲染处理数据
 * @blueprintIgnore
 */
export interface IRender2DDataHandle {
    needUseMatrix: boolean;
    inheriteRenderData(context: IRenderContext2D): void;
    destroy(): void;
}

/**
 * 全局数据
 * @blueprintIgnore
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

/** @blueprintIgnore */
export interface I2DGraphicBufferDataView {
    start: number;
    length: number;
    stride: number;
    modifyType: BufferModifyType;
    setGeometry(value: IRenderGeometryElement): void;
    getData(): Float32Array | Uint16Array;
    setData(data: ArrayLike<number>): void;
}

/** @blueprintIgnore */
export interface I2DGraphicWholeBuffer {
    buffer: IVertexBuffer | IIndexBuffer
    bufferData: Float32Array | Uint16Array;
    modifyType: BufferModifyType;
    resetData(byteLength: number): void;
    removeDataView(dataView: I2DGraphicBufferDataView): void;
    destroy(): void;
}

/** @blueprintIgnore */
export type Graphics2DVertexBlock = {
    positions: number[],
    vertexViews: I2DGraphicBufferDataView[],
}

/** @blueprintIgnore */
export type Graphics2DBufferBlock = {
    vertexs: Graphics2DVertexBlock[],
    indexView: I2DGraphicBufferDataView,
    vertexBuffer: IVertexBuffer,
}

/**
 * primitive渲染数据处理
 * @blueprintIgnore
 */
export interface I2DPrimitiveDataHandle extends IRender2DDataHandle {
    mask: IRenderStruct2D | null;
    applyVertexBufferBlock(views: Graphics2DBufferBlock[]): void;
}

/**
 * 基础组件数据处理
 * @blueprintIgnore
 */
export interface I2DBaseRenderDataHandle extends IRender2DDataHandle {
    lightReceive: boolean;
}

/**
 * mesh2D数据处理类
 * @blueprintIgnore
 */
export interface IMesh2DRenderDataHandle extends I2DBaseRenderDataHandle {
    baseColor: Color;
    baseTexture: BaseTexture;
    normal2DTexture: BaseTexture;
    normal2DStrength: number;
}

/**
 * spine数据处理类
 * @blueprintIgnore
 */
export interface ISpineRenderDataHandle extends I2DBaseRenderDataHandle {
    skeleton: spine.Skeleton;
}