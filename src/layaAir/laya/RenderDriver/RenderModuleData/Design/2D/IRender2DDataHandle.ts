import { Color } from "../../../../maths/Color";
import { Matrix } from "../../../../maths/Matrix";
import { Vector2 } from "../../../../maths/Vector2";
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
    /** minx , maxx , miny , maxy */
    cullRect: Vector4;
    renderLayerMask: number;
    globalShaderData: ShaderData;
}

/** @blueprintIgnore */
export interface I2DGraphicBufferDataView {
    setData(data: ArrayLike<number>): void;
}

/** @blueprintIgnore */
export interface I2DGraphicVertexDataView extends I2DGraphicBufferDataView {
    length: number;
    start: number;
    stride: number;
}

export interface I2DGraphicIndexDataView extends I2DGraphicBufferDataView {
    length: number;
    setGeometry(value: IRenderGeometryElement): void;
    destroy(): void;
}

/** @blueprintIgnore */
export interface I2DGraphicWholeBuffer {
    buffer: IVertexBuffer | IIndexBuffer
    resetData(byteLength: number): void;
    addDataView?(dataView: I2DGraphicBufferDataView): void;
    removeDataView(dataView: I2DGraphicBufferDataView): void;
    destroy(): void;
}

//需要保证get 出去不会改动
/** @blueprintIgnore */
export interface IGraphics2DVertexBlock {
    positions: number[],//
    vertexViews: I2DGraphicVertexDataView[],
}

//需要保证get 出去不会改动
/** @blueprintIgnore */
export interface IGraphics2DBufferBlock {
    vertexs: IGraphics2DVertexBlock[],
    indexView: I2DGraphicIndexDataView,
    vertexBuffer: IVertexBuffer,
}

/**
 * primitive渲染数据处理
 * @blueprintIgnore
 */
export interface I2DPrimitiveDataHandle extends IRender2DDataHandle {
    mask: IRenderStruct2D | null;
    logicMatrix: Matrix | null;
    applyVertexBufferBlock(views: IGraphics2DBufferBlock[]): void;
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
    tilingOffset: Vector4;
}

/**
 * spine数据处理类
 * @blueprintIgnore
 */
export interface ISpineRenderDataHandle extends I2DBaseRenderDataHandle {
    baseColor: Color;
    skeleton: spine.Skeleton;
    offset: Vector2;
}