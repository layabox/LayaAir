import { Bezier } from "../../maths/Bezier";

/**
 * @internal
 * ...
 * @author ww
 */
export class BezierLerp {

	constructor() {

	}
	/**@internal */
	private static _bezierResultCache: any = {};
	/**@internal */
	private static _bezierPointsCache: any = {};

	//TODO:coverage
	static getBezierRate(t: number, px0: number, py0: number, px1: number, py1: number): number {
		var key: number = BezierLerp._getBezierParamKey(px0, py0, px1, py1);
		var vKey: number = key * 100 + t;
		if (BezierLerp._bezierResultCache[vKey]) return BezierLerp._bezierResultCache[vKey];
		var points: any[] = BezierLerp._getBezierPoints(px0, py0, px1, py1, key);
		var i: number, len: number;
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
	/**@internal */
	private static _getBezierParamKey(px0: number, py0: number, px1: number, py1: number): number {
		return (((px0 * 100 + py0) * 100 + px1) * 100 + py1) * 100;
	}

	//TODO:coverage
	/**@internal */
	private static _getBezierPoints(px0: number, py0: number, px1: number, py1: number, key: number): any[] {
		if (BezierLerp._bezierPointsCache[key]) return BezierLerp._bezierPointsCache[key];
		var controlPoints: any[];
		controlPoints = [0, 0, px0, py0, px1, py1, 1, 1];
		var bz: Bezier;
		bz = new Bezier();
		var points: any[];
		points = bz.getBezierPoints(controlPoints, 100, 3);
		BezierLerp._bezierPointsCache[key] = points;
		return points;
	}
}


