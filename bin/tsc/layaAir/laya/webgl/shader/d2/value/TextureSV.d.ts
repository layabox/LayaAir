import { Value2D } from "./Value2D";
export declare class TextureSV extends Value2D {
    u_colorMatrix: any[];
    strength: number;
    blurInfo: any[];
    colorMat: Float32Array;
    colorAlpha: Float32Array;
    constructor(subID?: number);
    clear(): void;
}
