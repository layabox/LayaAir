import { Point } from "../../maths/Point";
export declare class AtlasGrid {
    atlasID: number;
    private _width;
    private _height;
    private _texCount;
    private _rowInfo;
    private _cells;
    _used: number;
    constructor(width?: number, height?: number, id?: number);
    addRect(type: number, width: number, height: number, pt: Point): boolean;
    private _release;
    private _init;
    private _get;
    private _fill;
    private _check;
    private _clear;
}
