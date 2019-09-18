import { BoneSlot } from "./BoneSlot";
import { PathConstraintData } from "./PathConstraintData";
import { Bone } from "./Bone";
import { Graphics } from "../../display/Graphics";
import { Matrix } from "../../maths/Matrix";


/**
 * @internal
 * 路径作用器
 * 1，生成根据骨骼计算控制点
 * 2，根据控制点生成路径，并计算路径上的节点
 * 3，根据节点，重新调整骨骼位置
 */
export class PathConstraint {

	//private static NONE: number = -1;
	private static BEFORE: number = -2;
	private static AFTER: number = -3;

	target: BoneSlot;
	data: PathConstraintData;
	bones: Bone[];
	position: number;
	spacing: number;
	rotateMix: number;
	translateMix: number;

	/**@internal */
	private _debugKey: boolean = false;
	/**@internal */
	private _segments: number[] = [];
	/**@internal */
	private _curves: number[] = [];
	/**@internal */
	private _spaces: number[];

	constructor(data: PathConstraintData, bones: Bone[]) {
		this.data = data;
		this.position = data.position;
		this.spacing = data.spacing;
		this.rotateMix = data.rotateMix;
		this.translateMix = data.translateMix;
		this.bones = [];
		var tBoneIds: number[] = this.data.bones;
		for (var i: number = 0, n: number = tBoneIds.length; i < n; i++) {
			this.bones.push(bones[tBoneIds[i]]);
		}
	}

	/**
	 * 计算骨骼在路径上的节点
	 * @param	boneSlot
	 * @param	boneMatrixArray
	 * @param	graphics
	 */
	//TODO:coverage
	apply(boneList: Bone[], graphics: Graphics): void {
		if (!this.target)
			return;
		var tTranslateMix: number = this.translateMix;
		var tRotateMix: number = this.translateMix;
		var tTranslate: boolean = tTranslateMix > 0;
		var tRotate: boolean = tRotateMix > 0;
		var tSpacingMode: string = this.data.spacingMode;
		var tLengthSpacing: boolean = tSpacingMode == "length";
		var tRotateMode: string = this.data.rotateMode;
		var tTangents: boolean = tRotateMode == "tangent";
		var tScale: boolean = tRotateMode == "chainScale";

		var lengths: number[] = [];
		var boneCount: number = this.bones.length;
		var spacesCount: number = tTangents ? boneCount : boneCount + 1;

		var spaces: number[] = [];
		this._spaces = spaces;
		spaces[0] = this.position;
		var spacing: number = this.spacing;
		if (tScale || tLengthSpacing) {
			for (var i: number = 0, n: number = spacesCount - 1; i < n;) {
				var bone: Bone = this.bones[i];
				var length: number = bone.length;
				//var x:Number = length * bone.transform.getMatrix().a;
				//var y:Number = length * bone.transform.getMatrix().c;
				var x: number = length * bone.resultMatrix.a;
				var y: number = length * bone.resultMatrix.b;
				length = Math.sqrt(x * x + y * y);
				if (tScale)
					lengths[i] = length;
				spaces[++i] = tLengthSpacing ? Math.max(0, length + spacing) : spacing;
			}
		}
		else {
			for (i = 1; i < spacesCount; i++) {
				spaces[i] = spacing;
			}
		}
		var positions: number[] = this.computeWorldPositions(this.target, boneList, graphics, spacesCount, tTangents, this.data.positionMode == "percent", tSpacingMode == "percent");
		if (this._debugKey) {
			for (i = 0; i < positions.length; i++) {
				graphics.drawCircle(positions[i++], positions[i++], 5, "#00ff00");
			}
			var tLinePos: any[] = [];
			for (i = 0; i < positions.length; i++) {
				tLinePos.push(positions[i++], positions[i++]);
			}
			graphics.drawLines(0, 0, tLinePos, "#ff0000");
		}
		var skeletonX: number;
		var skeletonY: number;
		var boneX: number = positions[0];
		var boneY: number = positions[1];
		var offsetRotation: number = this.data.offsetRotation;
		var tip: boolean = tRotateMode == "chain" && offsetRotation == 0;
		var p: number;
		for (i = 0, p = 3; i < boneCount; i++ , p += 3) {
			bone = this.bones[i];
			bone.resultMatrix.tx += (boneX - bone.resultMatrix.tx) * tTranslateMix;
			bone.resultMatrix.ty += (boneY - bone.resultMatrix.ty) * tTranslateMix;

			x = positions[p];
			y = positions[p + 1];
			var dx: number = x - boneX, dy: number = y - boneY;
			if (tScale) {
				length = lengths[i];
				if (length != 0) {
					var s: number = (Math.sqrt(dx * dx + dy * dy) / length - 1) * tRotateMix + 1;
					bone.resultMatrix.a *= s;
					bone.resultMatrix.c *= s;
				}
			}
			boneX = x;
			boneY = y;
			if (tRotate) {
				var a: number = bone.resultMatrix.a;
				//var b:Number = bone.resultMatrix.b;
				//var c:Number = bone.resultMatrix.c;
				var b: number = bone.resultMatrix.c;
				var c: number = bone.resultMatrix.b;
				var d: number = bone.resultMatrix.d;
				var r: number;
				var cos: number;
				var sin: number;
				if (tTangents) {
					r = positions[p - 1];
				}
				else if (spaces[i + 1] == 0) {
					r = positions[p + 2];
				}
				else {
					r = Math.atan2(dy, dx);
				}
				r -= Math.atan2(c, a) - offsetRotation / 180 * Math.PI;
				if (tip) {
					cos = Math.cos(r);
					sin = Math.sin(r);
					length = bone.length;
					boneX += (length * (cos * a - sin * c) - dx) * tRotateMix;
					boneY += (length * (sin * a + cos * c) - dy) * tRotateMix;
				}
				if (r > Math.PI) {
					r -= (Math.PI * 2);
				}
				else if (r < -Math.PI) {
					r += (Math.PI * 2);
				}
				r *= tRotateMix;
				cos = Math.cos(r);
				sin = Math.sin(r);
				bone.resultMatrix.a = cos * a - sin * c;
				bone.resultMatrix.c = cos * b - sin * d;
				bone.resultMatrix.b = sin * a + cos * c;
				bone.resultMatrix.d = sin * b + cos * d;
			}
		}
	}
	/**@internal */
	private static _tempMt: Matrix = new Matrix();
	/**
	 * 计算顶点的世界坐标
	 * @param	boneSlot
	 * @param	boneList
	 * @param	start
	 * @param	count
	 * @param	worldVertices
	 * @param	offset
	 */
	//TODO:coverage
	computeWorldVertices2(boneSlot: BoneSlot, boneList: Bone[], start: number, count: number, worldVertices: number[], offset: number): void {
		var tBones: any[] = boneSlot.currDisplayData.bones;
		var tWeights: any[] = boneSlot.currDisplayData.weights;
		var tTriangles: any[] = boneSlot.currDisplayData.triangles;

		var tMatrix: Matrix;
		var i: number = 0;
		var v: number = 0;
		var skip: number = 0;
		var n: number = 0;
		var w: number = 0;
		var b: number = 0;
		var wx: number = 0;
		var wy: number = 0;
		var vx: number = 0;
		var vy: number = 0;
		var bone: Bone;
		var len: number;
		//if (!tTriangles) tTriangles = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

		if (tBones == null) {
			if (!tTriangles) tTriangles = tWeights;
			if (boneSlot.deformData)
				tTriangles = boneSlot.deformData;
			var parentName: string;
			parentName = boneSlot.parent;
			if (boneList) {
				len = boneList.length;
				for (i = 0; i < len; i++) {
					if (boneList[i].name == parentName) {
						bone = boneList[i];
						break;
					}
				}
			}
			var tBoneMt: Matrix;
			if (bone) {
				tBoneMt = bone.resultMatrix;
			}
			//bone = boneSlot.parent;


			if (!tBoneMt) tBoneMt = PathConstraint._tempMt;
			var x: number = tBoneMt.tx;
			var y: number = tBoneMt.ty;
			var a: number = tBoneMt.a, bb: number = tBoneMt.b, c: number = tBoneMt.c, d: number = tBoneMt.d;
			if (bone) d *= bone.d;
			for (v = start, w = offset; w < count; v += 2, w += 2) {
				vx = tTriangles[v], vy = tTriangles[v + 1];
				worldVertices[w] = vx * a + vy * bb + x;
				worldVertices[w + 1] = -(vx * c + vy * d + y);
			}
			return;
		}
		for (i = 0; i < start; i += 2) {
			n = tBones[v];
			v += n + 1;
			skip += n;
		}
		var skeletonBones: Bone[] = boneList;
		for (w = offset, b = skip * 3; w < count; w += 2) {
			wx = 0, wy = 0;
			n = tBones[v++];
			n += v;
			for (; v < n; v++ , b += 3) {
				tMatrix = skeletonBones[tBones[v]].resultMatrix;
				vx = tWeights[b];
				vy = tWeights[b + 1];
				var weight: number = tWeights[b + 2];
				wx += (vx * tMatrix.a + vy * tMatrix.c + tMatrix.tx) * weight;
				wy += (vx * tMatrix.b + vy * tMatrix.d + tMatrix.ty) * weight;
			}
			worldVertices[w] = wx;
			worldVertices[w + 1] = wy;
		}
	}

	/**
	 * 计算路径上的节点
	 * @param	boneSlot
	 * @param	boneList
	 * @param	graphics
	 * @param	spacesCount
	 * @param	tangents
	 * @param	percentPosition
	 * @param	percentSpacing
	 * @return
	 */
	//TODO:coverage
	private computeWorldPositions(boneSlot: BoneSlot, boneList: Bone[], graphics: Graphics, spacesCount: number, tangents: boolean, percentPosition: boolean, percentSpacing: boolean): number[] {
		var tBones: any[] = boneSlot.currDisplayData.bones;
		var tWeights: any[] = boneSlot.currDisplayData.weights;
		var tTriangles: any[] = boneSlot.currDisplayData.triangles;

		var tRx: number = 0;
		var tRy: number = 0;
		var nn: number = 0;
		var tMatrix: Matrix;
		var tX: number;
		var tY: number;
		var tB: number = 0;
		var tWeight: number = 0;
		var tVertices: number[] = [];
		var i: number = 0, j: number = 0, n: number = 0;
		var verticesLength: number = boneSlot.currDisplayData.verLen;
		var target: BoneSlot = boneSlot;
		var position: number = this.position;
		var spaces: number[] = this._spaces;
		var world: number[] = [];
		var out: number[] = [];
		var closed: boolean = false;
		var curveCount: number = verticesLength / 6;
		var prevCurve: number = -1;
		var pathLength: number;
		var o: number, curve: number;
		var p: number;
		var space: number;
		var prev: number;
		var length: number;
		if (!true) { //path.constantSpeed) {
			var lengths: number[] = boneSlot.currDisplayData.lengths as number[];
			curveCount -= closed ? 1 : 2;
			pathLength = lengths[curveCount];
			if (percentPosition)
				position *= pathLength;
			if (percentSpacing) {
				for (i = 0; i < spacesCount; i++)
					spaces[i] *= pathLength;
			}
			world.length = 8;
			//world = this._world;

			for (i = 0, o = 0, curve = 0; i < spacesCount; i++ , o += 3) {
				space = spaces[i];
				position += space;
				p = position;

				if (closed) {
					p %= pathLength;
					if (p < 0)
						p += pathLength;
					curve = 0;
				}
				else if (p < 0) {
					if (prevCurve != PathConstraint.BEFORE) {
						prevCurve = PathConstraint.BEFORE;
						this.computeWorldVertices2(target, boneList, 2, 4, world, 0);
					}
					this.addBeforePosition(p, world, 0, out, o);
					continue;
				}
				else if (p > pathLength) {
					if (prevCurve != PathConstraint.AFTER) {
						prevCurve = PathConstraint.AFTER;
						this.computeWorldVertices2(target, boneList, verticesLength - 6, 4, world, 0);
					}
					this.addAfterPosition(p - pathLength, world, 0, out, o);
					continue;
				}

				// Determine curve containing position.
				for (; ; curve++) {
					length = lengths[curve];
					if (p > length)
						continue;
					if (curve == 0)
						p /= length;
					else {
						prev = lengths[curve - 1];
						p = (p - prev) / (length - prev);
					}
					break;
				}
				if (curve != prevCurve) {
					prevCurve = curve;
					if (closed && curve == curveCount) {
						this.computeWorldVertices2(target, boneList, verticesLength - 4, 4, world, 0);
						this.computeWorldVertices2(target, boneList, 0, 4, world, 4);
					}
					else
						this.computeWorldVertices2(target, boneList, curve * 6 + 2, 8, world, 0);
				}
				this.addCurvePosition(p, world[0], world[1], world[2], world[3], world[4], world[5], world[6], world[7], out, o, tangents || (i > 0 && space == 0));
			}
			return out;
		}

		// World vertices.
		if (closed) {
			verticesLength += 2;
			world[verticesLength - 2] = world[0];
			world[verticesLength - 1] = world[1];
		}
		else {
			curveCount--;
			verticesLength -= 4;
			this.computeWorldVertices2(boneSlot, boneList, 2, verticesLength, tVertices, 0);
			if (this._debugKey) {
				for (i = 0; i < tVertices.length;) {
					graphics.drawCircle(tVertices[i++], tVertices[i++], 10, "#ff0000");
				}
			}
			world = tVertices;
		}

		// Curve lengths.
		this._curves.length = curveCount;
		var curves: number[] = this._curves;
		pathLength = 0;
		var x1: number = world[0], y1: number = world[1], cx1: number = 0, cy1: number = 0, cx2: number = 0, cy2: number = 0, x2: number = 0, y2: number = 0;
		var tmpx: number, tmpy: number, dddfx: number, dddfy: number, ddfx: number, ddfy: number, dfx: number, dfy: number;
		var w: number;
		for (i = 0, w = 2; i < curveCount; i++ , w += 6) {
			cx1 = world[w];
			cy1 = world[w + 1];
			cx2 = world[w + 2];
			cy2 = world[w + 3];
			x2 = world[w + 4];
			y2 = world[w + 5];
			tmpx = (x1 - cx1 * 2 + cx2) * 0.1875;
			tmpy = (y1 - cy1 * 2 + cy2) * 0.1875;
			dddfx = ((cx1 - cx2) * 3 - x1 + x2) * 0.09375;
			dddfy = ((cy1 - cy2) * 3 - y1 + y2) * 0.09375;
			ddfx = tmpx * 2 + dddfx;
			ddfy = tmpy * 2 + dddfy;
			dfx = (cx1 - x1) * 0.75 + tmpx + dddfx * 0.16666667;
			dfy = (cy1 - y1) * 0.75 + tmpy + dddfy * 0.16666667;
			pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
			dfx += ddfx;
			dfy += ddfy;
			ddfx += dddfx;
			ddfy += dddfy;
			pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
			dfx += ddfx;
			dfy += ddfy;
			pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
			dfx += ddfx + dddfx;
			dfy += ddfy + dddfy;
			pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
			curves[i] = pathLength;
			x1 = x2;
			y1 = y2;
		}
		if (percentPosition)
			position *= pathLength;
		if (percentSpacing) {
			for (i = 0; i < spacesCount; i++)
				spaces[i] *= pathLength;
		}

		var segments: number[] = this._segments;
		var curveLength: number = 0;
		var segment: number;
		for (i = 0, o = 0, curve = 0, segment = 0; i < spacesCount; i++ , o += 3) {
			space = spaces[i];
			position += space;
			p = position;

			if (closed) {
				p %= pathLength;
				if (p < 0)
					p += pathLength;
				curve = 0;
			}
			else if (p < 0) {
				this.addBeforePosition(p, world, 0, out, o);
				continue;
			}
			else if (p > pathLength) {
				this.addAfterPosition(p - pathLength, world, verticesLength - 4, out, o);
				continue;
			}

			// Determine curve containing position.
			for (; ; curve++) {
				length = curves[curve];
				if (p > length)
					continue;
				if (curve == 0)
					p /= length;
				else {
					prev = curves[curve - 1];
					p = (p - prev) / (length - prev);
				}
				break;
			}

			// Curve segment lengths.
			if (curve != prevCurve) {
				prevCurve = curve;
				var ii: number = curve * 6;
				x1 = world[ii];
				y1 = world[ii + 1];
				cx1 = world[ii + 2];
				cy1 = world[ii + 3];
				cx2 = world[ii + 4];
				cy2 = world[ii + 5];
				x2 = world[ii + 6];
				y2 = world[ii + 7];
				tmpx = (x1 - cx1 * 2 + cx2) * 0.03;
				tmpy = (y1 - cy1 * 2 + cy2) * 0.03;
				dddfx = ((cx1 - cx2) * 3 - x1 + x2) * 0.006;
				dddfy = ((cy1 - cy2) * 3 - y1 + y2) * 0.006;
				ddfx = tmpx * 2 + dddfx;
				ddfy = tmpy * 2 + dddfy;
				dfx = (cx1 - x1) * 0.3 + tmpx + dddfx * 0.16666667;
				dfy = (cy1 - y1) * 0.3 + tmpy + dddfy * 0.16666667;
				curveLength = Math.sqrt(dfx * dfx + dfy * dfy);
				segments[0] = curveLength;
				for (ii = 1; ii < 8; ii++) {
					dfx += ddfx;
					dfy += ddfy;
					ddfx += dddfx;
					ddfy += dddfy;
					curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
					segments[ii] = curveLength;
				}
				dfx += ddfx;
				dfy += ddfy;
				curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
				segments[8] = curveLength;
				dfx += ddfx + dddfx;
				dfy += ddfy + dddfy;
				curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
				segments[9] = curveLength;
				segment = 0;
			}

			// Weight by segment length.
			p *= curveLength;
			for (; ; segment++) {
				length = segments[segment];
				if (p > length)
					continue;
				if (segment == 0)
					p /= length;
				else {
					prev = segments[segment - 1];
					p = segment + (p - prev) / (length - prev);
				}
				break;
			}
			this.addCurvePosition(p * 0.1, x1, y1, cx1, cy1, cx2, cy2, x2, y2, out, o, tangents || (i > 0 && space == 0));
		}
		return out;
	}

	//TODO:coverage
	private addBeforePosition(p: number, temp: number[], i: number, out: number[], o: number): void {
		var x1: number = temp[i], y1: number = temp[i + 1], dx: number = temp[i + 2] - x1, dy: number = temp[i + 3] - y1, r: number = Math.atan2(dy, dx);
		out[o] = x1 + p * Math.cos(r);
		out[o + 1] = y1 + p * Math.sin(r);
		out[o + 2] = r;
	}

	//TODO:coverage
	private addAfterPosition(p: number, temp: number[], i: number, out: number[], o: number): void {
		var x1: number = temp[i + 2], y1: number = temp[i + 3], dx: number = x1 - temp[i], dy: number = y1 - temp[i + 1], r: number = Math.atan2(dy, dx);
		out[o] = x1 + p * Math.cos(r);
		out[o + 1] = y1 + p * Math.sin(r);
		out[o + 2] = r;
	}

	//TODO:coverage
	private addCurvePosition(p: number, x1: number, y1: number, cx1: number, cy1: number, cx2: number, cy2: number, x2: number, y2: number, out: number[], o: number, tangents: boolean): void {
		if (p == 0)
			p = 0.0001;
		var tt: number = p * p, ttt: number = tt * p, u: number = 1 - p, uu: number = u * u, uuu: number = uu * u;
		var ut: number = u * p, ut3: number = ut * 3, uut3: number = u * ut3, utt3: number = ut3 * p;
		var x: number = x1 * uuu + cx1 * uut3 + cx2 * utt3 + x2 * ttt, y: number = y1 * uuu + cy1 * uut3 + cy2 * utt3 + y2 * ttt;
		out[o] = x;
		out[o + 1] = y;
		if (tangents) {
			out[o + 2] = Math.atan2(y - (y1 * uu + cy1 * ut * 2 + cy2 * tt), x - (x1 * uu + cx1 * ut * 2 + cx2 * tt));
		}
		else {
			out[o + 2] = 0;
		}
	}

}


