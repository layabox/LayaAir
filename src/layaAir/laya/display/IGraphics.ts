import { type Matrix } from "../maths/Matrix";
import { GraphicsRunner } from "./Scene2DSpecial/GraphicsRunner";

export interface IGraphicsCmd {
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
}

export interface IGraphicsBoundsAssembler {
    readonly width: number;
    readonly height: number;
    readonly points: number[];
    affectBySize: boolean;
    flushPoints(dx?: number, dy?: number, matrix?: Matrix): void;
    concatMatrix(matrix: Readonly<Matrix>): void;
}