import { Matrix } from "../../maths/Matrix";
export declare class Transform {
    skX: number;
    skY: number;
    scX: number;
    scY: number;
    x: number;
    y: number;
    skewX: number;
    skewY: number;
    private mMatrix;
    initData(data: any): void;
    getMatrix(): Matrix;
    skew(m: Matrix, x: number, y: number): Matrix;
}
