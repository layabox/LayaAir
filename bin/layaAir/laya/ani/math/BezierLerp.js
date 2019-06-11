import { Bezier } from "laya/maths/Bezier";
/**
 * @private
 * ...
 * @author ww
 */
export class BezierLerp {
    constructor() {
    }
    //TODO:coverage
    static getBezierRate(t, px0, py0, px1, py1) {
        var key = BezierLerp._getBezierParamKey(px0, py0, px1, py1);
        var vKey = key * 100 + t;
        if (BezierLerp._bezierResultCache[vKey])
            return BezierLerp._bezierResultCache[vKey];
        var points = BezierLerp._getBezierPoints(px0, py0, px1, py1, key);
        var i, len;
        len = points.length;
        for (i = 0; i < len; i += 2) {
            if (t <= points[i]) {
                BezierLerp._bezierResultCache[vKey] = points[i + 1];
                return points[i + 1];
            }
        }
        BezierLerp._bezierResultCache[vKey] = 1;
        return 1;
    }
    //TODO:coverage
    static _getBezierParamKey(px0, py0, px1, py1) {
        return (((px0 * 100 + py0) * 100 + px1) * 100 + py1) * 100;
    }
    //TODO:coverage
    static _getBezierPoints(px0, py0, px1, py1, key) {
        if (BezierLerp._bezierPointsCache[key])
            return BezierLerp._bezierPointsCache[key];
        var controlPoints;
        controlPoints = [0, 0, px0, py0, px1, py1, 1, 1];
        var bz;
        bz = new Bezier();
        var points;
        points = bz.getBezierPoints(controlPoints, 100, 3);
        BezierLerp._bezierPointsCache[key] = points;
        return points;
    }
}
BezierLerp._bezierResultCache = {};
BezierLerp._bezierPointsCache = {};
