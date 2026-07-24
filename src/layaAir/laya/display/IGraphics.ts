import { type Matrix } from "../maths/Matrix";
import type { Point } from "../maths/Point";
import type { BaseTexture } from "../resource/BaseTexture";
import type { Texture } from "../resource/Texture";
import type { BlendMode } from "../webgl/canvas/BlendMode";
import type { TextRender } from "../webgl/text/TextRender";
import type { Sprite } from "./Sprite";
import type { GraphicsCommandInfo } from "./Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";

export { GraphicsCommandDependency, GraphicsCommandLayoutRefresh, type GraphicsCommandInfo } from "./Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";

/** Internal drawing contract shared by the immediate runner and retained compiler. @internal */
export interface IGraphicsCommandExecutor {
    sprite: Sprite;
    _textRender: TextRender;
    _curMat: Matrix;
    _matrixChanged: boolean;
    globalAlpha: number;
    globalCompositeOperation: BlendMode;
    alpha(value: number): void;
    save(): void;
    restore(): void;
    translate(x: number, y: number): void;
    _transform(matrix: Matrix, pivotX: number, pivotY: number): void;
    _rotate(angle: number, pivotX: number, pivotY: number): void;
    _scale(scaleX: number, scaleY: number, pivotX: number, pivotY: number): void;
    drawTexture(texture: Texture, x: number, y: number, width: number, height: number, color?: number): void;
    drawTextureWithTransform(texture: Texture, x: number, y: number, width: number, height: number,
        transform: Matrix, tx: number, ty: number, alpha: number, blendMode: BlendMode | string, uv?: number[], color?: number): void;
    drawTextures(texture: Texture, pos: ArrayLike<number>, tx: number, ty: number, colors: number[]): void;
    drawRect(x: number, y: number, width: number, height: number, fillColor: any, lineColor: any, lineWidth: number): void;
    fillTexture(texture: Texture, x: number, y: number, width: number, height: number, type: string, offset: Point, color: number): void;
    _drawLine(x: number, y: number, fromX: number, fromY: number, toX: number, toY: number, lineColor: any, lineWidth: number, vid: number): void;
    _drawLines(x: number, y: number, points: any[], lineColor: any, lineWidth: number, vid: number): void;
    _drawCircle(x: number, y: number, radius: number, fillColor: any, lineColor: any, lineWidth: number, vid: number): void;
    _drawEllipse(x: number, y: number, width: number, height: number, fillColor: any, lineColor: any, lineWidth: number): void;
    _drawPie(x: number, y: number, radius: number, startAngle: number, endAngle: number, fillColor: any, lineColor: any, lineWidth: number, vid: number): void;
    _drawPoly(x: number, y: number, points: any[], fillColor: any, lineColor: any, lineWidth: number, isConvexPolygon: boolean, vid: number): void;
    _drawRoundRect(x: number, y: number, width: number, height: number, lt: number, rt: number, lb: number, rb: number,
        fillColor: any, lineColor: any, lineWidth: number, minNum?: number, segPixel?: number): void;
    drawCurves(x: number, y: number, points: any[], lineColor: any, lineWidth: number): void;
    _drawPath(x: number, y: number, paths: any[], brush: any, pen: any): void;
    drawTriangles(texture: Texture | BaseTexture, x: number, y: number, vertices: ArrayLike<number>, uvs: ArrayLike<number>,
        indices: ArrayLike<number>, matrix?: Matrix, alpha?: number, blendMode?: BlendMode | string, color?: number,
        colors?: ArrayLike<number>, uvRange?: ArrayLike<number>): void;
}

/**
 * @en Graphics command interface
 * @zh 图形命令接口
 * @blueprintableSubclasses
 */
export interface IGraphicsCmd {
    /**
     * @en If true, do not automatically recycle.
     * @zh 如果为true，则不自动回收
     */
    lock?: boolean;

    
    /** @internal */
    _cacheData ?: any;

    /**
     * 
     * @param runner 
     * @param gx 
     * @param gy 
     */
    run(runner: IGraphicsCommandExecutor, gx: number, gy: number): void;
    /**
     * @zh 如有回收，实现这个函数
     */
    recover(): void;
    /**
     * 
     * @param assembler 
     */
    getBounds?(assembler: IGraphicsBoundsAssembler): void;
    /**
     * 
     */
    get cmdID(): string;

    /** @internal */
    getGraphicsCommandInfo?(out: GraphicsCommandInfo, owner?: Sprite): GraphicsCommandInfo;
    
    /**
     * @en Returns 1 if this command needs to respond to layout changes (e.g., percentage-based or arc drawing), otherwise returns 0.
     * @zh 如果此命令需要响应布局变化（例如百分比显示或画弧线），返回1，否则返回0。
     * @returns 0 or 1
     * @blueprintIgnore
     */
    needsLayoutRepaint?(): number;
}

/**
 * @blueprintIgnore
 */
export interface IGraphicsBoundsAssembler {
    readonly width: number;
    readonly height: number;
    readonly points: number[];
    flushPoints(dx?: number, dy?: number, matrix?: Matrix): void;
    concatMatrix(matrix: Readonly<Matrix>): void;
}
