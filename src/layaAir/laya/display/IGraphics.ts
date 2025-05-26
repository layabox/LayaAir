import { type Matrix } from "../maths/Matrix";
import { type Context } from "../renders/Context";

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

    /**
     * 
     * @param context 
     * @param gx 
     * @param gy 
     */
    run(context: Context, gx: number, gy: number): void;
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
}

/**
 * @blueprintIgnore
 */
export interface IGraphicsBoundsAssembler {
    readonly width: number;
    readonly height: number;
    readonly points: number[];
    affectBySize: boolean;
    flushPoints(dx?: number, dy?: number, matrix?: Matrix): void;
    concatMatrix(matrix: Readonly<Matrix>): void;
}