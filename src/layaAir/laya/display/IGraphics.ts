import { type Matrix } from "../maths/Matrix";
import { GraphicsRunner } from "./Scene2DSpecial/GraphicsRunner";
import type { Sprite } from "./Sprite";
import type { GraphicsCommandInfo } from "./Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";

export { GraphicsCommandDependency, GraphicsCommandLayoutRefresh, type GraphicsCommandInfo } from "./Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";

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
    run(runner: GraphicsRunner, gx: number, gy: number): void;
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
