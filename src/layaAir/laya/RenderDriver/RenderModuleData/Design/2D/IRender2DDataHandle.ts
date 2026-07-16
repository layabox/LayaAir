import { Color } from "../../../../maths/Color";
import { Matrix } from "../../../../maths/Matrix";
import { Vector2 } from "../../../../maths/Vector2";
import { Vector4 } from "../../../../maths/Vector4";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Texture } from "../../../../resource/Texture";
import { SubShader } from "../../../../RenderEngine/RenderShader/SubShader";
import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { IRenderStruct2D } from "./IRenderStruct2D";
import {
    GraphicsOpProfile,
} from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";
import {
	GraphicsOp2DDirtyFlag,
	GraphicsOp2DKind,
    type GraphicsCommandId,
	type GraphicsOp2DTextureHost,
    type GraphicsOp2DType,
} from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";

export { GraphicsInfoDirtyFlag } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";

/** @blueprintIgnore */
export type GraphicsInfoTextureHost = Texture | BaseTexture;

/**
 * @en Abstract Graphics 2D op owned by the active render backend.
 * @zh 当前渲染后端持有的 2D Graphics 操作抽象接口。
 *  @blueprintIgnore
 */
export interface IGraphicsOp2D {
    readonly kind: GraphicsOp2DKind;
    readonly opType: GraphicsOp2DType;
    readonly opProfile: GraphicsOpProfile;
    readonly commandIndex: number;
    readonly commandId: GraphicsCommandId;
    texture: GraphicsOp2DTextureHost | null;
    readonly buffer: ArrayBuffer;
    dirtyFlags: GraphicsOp2DDirtyFlag;
    canUpdate(commandId: GraphicsCommandId): boolean;
    resetRecords(): void;
    getStructureKey(): string;
    markDirty(flags: GraphicsOp2DDirtyFlag): void;
    clearDirty(): void;
    clearDirtyFlagsOnly?(): void;
    destroy(): void;
}

/**
 * @en Texture quad Graphics op.
 * @zh 纹理四边形 Graphics 操作。
 * @blueprintIgnore
 */
export interface IGraphicsTextureQuadOp2D extends IGraphicsOp2D {
    recordCount: number;
    writeRecord(x: number, y: number, width: number, height: number,
        u0: number, v0: number, u1: number, v1: number,
        packedColor: number, alpha: number, blendMode: number, textureLayer: number, matrix: Matrix, uvClip?: ArrayLike<number> | null): void;
}

/**
 * @en Fill-texture Graphics op.
 * @zh 平铺填充纹理 Graphics 操作。
 * @blueprintIgnore
 */
export interface IGraphicsFillTextureOp2D extends IGraphicsOp2D {
    recordCount: number;
    writeRecord(x: number, y: number, width: number, height: number,
        u0: number, v0: number, u1: number, v1: number,
        repeatX: number, repeatY: number, offsetX: number, offsetY: number,
        texRangeX: number, texRangeY: number, texRangeWidth: number, texRangeHeight: number,
        packedColor: number, alpha: number, blendMode: number, textureLayer: number, matrix: Matrix, uvClip?: ArrayLike<number> | null): void;
}

/**
 * @en Solid quad Graphics op.
 * @zh 纯色四边形 Graphics 操作。
 * @blueprintIgnore
 */
/** @blueprintIgnore */
export interface IGraphicsSolidQuadOp2D extends IGraphicsOp2D {
    recordCount: number;
    writeRecord(x: number, y: number, width: number, height: number,
        packedColor: number, alpha: number, blendMode: number, matrix: Matrix): void;
}

export interface IGraphicsMeshOp2D extends IGraphicsOp2D {
    writeMesh(
        x: number,
        y: number,
        vertices: ArrayLike<number>,
        vertexOffset: number,
        vertexCount: number,
        uvs: ArrayLike<number> | null,
        uvOffset: number,
        indices: ArrayLike<number>,
        indexOffset: number,
        indexCount: number,
        colors: ArrayLike<number> | null,
        colorOffset: number,
        packedColor: number,
        alpha: number,
        blendMode: number,
        textureLayer: number,
        matrix: Matrix | null,
        uvClip?: ArrayLike<number> | null
    ): void;
}

/**
 * @en Multi-quad Graphics op with internal records.
 * @zh 带内部记录的多四边形 Graphics 操作。
 * @blueprintIgnore
 */
export interface IGraphicsMultiQuadOp2D extends IGraphicsOp2D {
    recordCount: number;
    textures: GraphicsOp2DTextureHost[];
    setTextures(textures: ReadonlyArray<GraphicsOp2DTextureHost>, count?: number): void;
    addRecord(x: number, y: number, width: number, height: number,
        u0: number, v0: number, u1: number, v1: number,
        packedColor: number, alpha: number, blendMode: number, textureLayer: number, matrix: Matrix, uvClip?: ArrayLike<number> | null): void;
}

/**
 * @en Text Graphics op with internal texture records.
 * @zh 带内部纹理记录的文本 Graphics 操作。
 * @blueprintIgnore
 */
export interface IGraphicsTextOp2D extends IGraphicsMultiQuadOp2D {
    textures: GraphicsOp2DTextureHost[];
}

/**
 * @en Factory boundary for backend Graphics 2D ops.
 * @blueprintIgnore
 */
export interface IGraphicsOp2DFactory {
    createTextureQuadOp(commandIndex: number, commandId: GraphicsCommandId): IGraphicsTextureQuadOp2D;
    createFillTextureOp(commandIndex: number, commandId: GraphicsCommandId): IGraphicsFillTextureOp2D;
    createSolidQuadOp(commandIndex: number, commandId: GraphicsCommandId): IGraphicsSolidQuadOp2D;
    createMeshOp(commandIndex: number, commandId: GraphicsCommandId): IGraphicsMeshOp2D;
    createMultiQuadOp(commandIndex: number, commandId: GraphicsCommandId): IGraphicsMultiQuadOp2D;
    createTextOp(commandIndex: number, commandId: GraphicsCommandId): IGraphicsTextOp2D;
}

export interface IGraphicsOp2DHandle {
    setGraphicsHandleUpdateBuffer?(buffer: ArrayBuffer): void;
    setGraphicsMaterialState(subShader: SubShader | null, shaderData: ShaderData | null, useSpriteState: boolean): void;
    readonly autoGraphicsDirtySync?: boolean;
    syncGraphicsOps(ops: ReadonlyArray<IGraphicsOp2D>): void;
}


/**
 * @zh 2D 渲染数据处理接口。
 * @blueprintIgnore
 */
export interface IRender2DDataHandle {
    needUseMatrix: boolean;
    inheriteRenderData(context: IRenderContext2D): void;
    destroy(): void;
}

/**
 * @zh 全局数据。
 * @blueprintIgnore
 */
export interface I2DGlobalRenderData {
    /** minx , maxx , miny , maxy */
    cullRect: Vector4;
    renderLayerMask: number;
    globalShaderData: ShaderData;
}

/**
 * @zh Primitive 渲染数据处理接口。
 * @blueprintIgnore
 */
export interface I2DPrimitiveDataHandle extends IRender2DDataHandle, IGraphicsOp2DHandle {
    mask: IRenderStruct2D | null;
    logicMatrix: Matrix | null;
}

/**
 * @zh 基础组件数据处理接口。
 * @blueprintIgnore
 */
export interface I2DBaseRenderDataHandle extends IRender2DDataHandle {
    lightReceive: boolean;
}

/**
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
 * @blueprintIgnore
 */
export interface ISpineRenderDataHandle extends I2DBaseRenderDataHandle {
    baseColor: Color;
    skeleton: spine.Skeleton;
    offset: Vector2;
}
