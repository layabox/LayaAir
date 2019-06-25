/**
 * @private
 * ...
 * @author ww
 */
export declare class BezierLerp {
    constructor();
    private static _bezierResultCache;
    private static _bezierPointsCache;
    static getBezierRate(t: number, px0: number, py0: number, px1: number, py1: number): number;
    private static _getBezierParamKey;
    private static _getBezierPoints;
}
