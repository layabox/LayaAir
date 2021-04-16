import { IkConstraintData } from "./IkConstraintData";
import { Bone } from "./Bone";
import { Matrix } from "../../maths/Matrix";
import { Sprite } from "../../display/Sprite";
import { ILaya } from "../../../ILaya";

/**
 * @internal
 */
export class IkConstraint {

	/**@internal */
	private _targetBone: Bone;
	/**@internal */
	private _bones: Bone[];
	/**@internal */
	//private _data: IkConstraintData;
	name: string;
	mix: number;
	bendDirection: number;
	isSpine: boolean = true;
	static radDeg: number = 180 / Math.PI;
	static degRad: number = Math.PI / 180;
	/**@internal */
	private static _tempMatrix: Matrix = new Matrix();

	//TODO:coverage
	constructor(data: IkConstraintData, bones: Bone[]) {
		//this._data = data;
		this._targetBone = bones[data.targetBoneIndex];
		this.isSpine = data.isSpine;
		if (this._bones == null) this._bones = [];
		this._bones.length = 0;
		for (var i: number = 0, n: number = data.boneIndexs.length; i < n; i++) {
			this._bones.push(bones[data.boneIndexs[i]]);
		}
		this.name = data.name;
		this.mix = data.mix;
		this.bendDirection = data.bendDirection;
	}

	apply(): void {
		switch (this._bones.length) {
			case 1:
				this._applyIk1(this._bones[0], this._targetBone.resultMatrix.tx, this._targetBone.resultMatrix.ty, this.mix);
				break;
			case 2:
				if (this.isSpine) {
					this._applyIk2(this._bones[0], this._bones[1], this._targetBone.resultMatrix.tx, this._targetBone.resultMatrix.ty, this.bendDirection, this.mix);// tIkConstraintData.mix);
				} else {
					this._applyIk3(this._bones[0], this._bones[1], this._targetBone.resultMatrix.tx, this._targetBone.resultMatrix.ty, this.bendDirection, this.mix);// tIkConstraintData.mix);
				}
				break;
		}
	}

	//TODO:coverage
	/**@internal */
	private _applyIk1(bone: Bone, targetX: number, targetY: number, alpha: number): void {
		var pp: Bone = bone.parentBone;
		var id: number = 1 / (pp.resultMatrix.a * pp.resultMatrix.d - pp.resultMatrix.b * pp.resultMatrix.c);
		var x: number = targetX - pp.resultMatrix.tx;
		var y: number = targetY - pp.resultMatrix.ty;
		var tx: number = (x * pp.resultMatrix.d - y * pp.resultMatrix.c) * id - bone.transform.x;
		var ty: number = (y * pp.resultMatrix.a - x * pp.resultMatrix.b) * id - bone.transform.y;
		var rotationIK: number = Math.atan2(ty, tx) * IkConstraint.radDeg - 0 - bone.transform.skX;
		if (bone.transform.scX < 0) rotationIK += 180;
		if (rotationIK > 180)
			rotationIK -= 360;
		else if (rotationIK < -180) rotationIK += 360;
		bone.transform.skX = bone.transform.skY = bone.transform.skX + rotationIK * alpha;
		bone.update();
	}

	//debug相关代码
	/**@internal */
	private _sp: Sprite;
	private isDebug: boolean = false;

	//TODO:coverage
	updatePos(x: number, y: number): void {
		if (this._sp) {
			this._sp.pos(x, y);
		}
	}

	//TODO:coverage
	/**@internal */
	private _applyIk2(parent: Bone, child: Bone, targetX: number, targetY: number, bendDir: number, alpha: number): void {
		if (alpha == 0) {
			return;
		}
		//spine 双骨骼ik计算
		var px: number = parent.resultTransform.x, py: number = parent.resultTransform.y;
		var psx: number = parent.transform.scX, psy: number = parent.transform.scY;
		var csx: number = child.transform.scX;
		var os1: number, os2: number, s2: number;
		if (psx < 0) {
			psx = -psx;
			os1 = 180;
			s2 = -1;
		} else {
			os1 = 0;
			s2 = 1;
		}
		if (psy < 0) {
			psy = -psy;
			s2 = -s2;
		}
		if (csx < 0) {
			csx = -csx;
			os2 = 180;
		} else {
			os2 = 0
		}

		var cx: number = child.resultTransform.x, cy: number, cwx: number, cwy: number;
		var a: number = parent.resultMatrix.a, b: number = parent.resultMatrix.c;
		var c: number = parent.resultMatrix.b, d: number = parent.resultMatrix.d;
		var u: boolean = Math.abs(psx - psy) <= 0.0001;
		//求子骨骼的世界坐标点
		if (!u) {
			cy = 0;
			cwx = a * cx + parent.resultMatrix.tx;
			cwy = c * cx + parent.resultMatrix.ty;
		} else {
			cy = child.resultTransform.y;
			cwx = a * cx + b * cy + parent.resultMatrix.tx;
			cwy = c * cx + d * cy + parent.resultMatrix.ty;
		}
		//cwx,cwy为子骨骼应该在的世界坐标

		if (this.isDebug) {
			if (!this._sp) {
				this._sp = new Sprite();
				ILaya.stage.addChild(this._sp);
			}
			this._sp.graphics.clear();
			this._sp.graphics.drawCircle(targetX, targetY, 15, "#ffff00");

			this._sp.graphics.drawCircle(cwx, cwy, 15, "#ff00ff");
		}
		parent.setRotation(Math.atan2(cwy - parent.resultMatrix.ty, cwx - parent.resultMatrix.tx));
		var pp: Bone = parent.parentBone;
		a = pp.resultMatrix.a;
		b = pp.resultMatrix.c;
		c = pp.resultMatrix.b;
		d = pp.resultMatrix.d;
		//逆因子
		var id: number = 1 / (a * d - b * c);
		//求得IK中的子骨骼角度向量
		var x: number = targetX - pp.resultMatrix.tx, y: number = targetY - pp.resultMatrix.ty;
		var tx: number = (x * d - y * b) * id - px;
		var ty: number = (y * a - x * c) * id - py;

		//求得子骨骼的角度向量
		x = cwx - pp.resultMatrix.tx;
		y = cwy - pp.resultMatrix.ty;
		var dx: number = (x * d - y * b) * id - px;
		var dy: number = (y * a - x * c) * id - py;
		//子骨骼的实际长度
		var l1: number = Math.sqrt(dx * dx + dy * dy);
		//子骨骼的长度
		var l2: number = child.length * csx;
		var a1: number, a2: number;
		if (u) {
			l2 *= psx;
			//求IK的角度
			var cos: number = (tx * tx + ty * ty - l1 * l1 - l2 * l2) / (2 * l1 * l2);
			if (cos < -1)
				cos = -1;
			else if (cos > 1) cos = 1;
			a2 = Math.acos(cos) * bendDir;
			a = l1 + l2 * cos;
			b = l2 * Math.sin(a2);
			a1 = Math.atan2(ty * a - tx * b, tx * a + ty * b);
		} else {
			a = psx * l2;
			b = psy * l2;
			var aa: number = a * a, bb: number = b * b, dd: number = tx * tx + ty * ty, ta: number = Math.atan2(ty, tx);
			c = bb * l1 * l1 + aa * dd - aa * bb;
			var c1: number = -2 * bb * l1, c2: number = bb - aa;
			d = c1 * c1 - 4 * c2 * c;
			if (d > 0) {
				var q: number = Math.sqrt(d);
				if (c1 < 0) q = -q;
				q = -(c1 + q) / 2;
				var r0: number = q / c2, r1: number = c / q;
				var r: number = Math.abs(r0) < Math.abs(r1) ? r0 : r1;
				if (r * r <= dd) {
					y = Math.sqrt(dd - r * r) * bendDir;
					a1 = ta - Math.atan2(y, r);
					a2 = Math.atan2(y / psy, (r - l1) / psx);
				}
			}
			var minAngle: number = 0, minDist: number = Number.MAX_VALUE, minX: number = 0, minY: number = 0;
			var maxAngle: number = 0, maxDist: number = 0, maxX: number = 0, maxY: number = 0;
			x = l1 + a;
			d = x * x;
			if (d > maxDist) {
				maxAngle = 0;
				maxDist = d;
				maxX = x;
			}
			x = l1 - a;
			d = x * x;
			if (d < minDist) {
				minAngle = Math.PI;
				minDist = d;
				minX = x;
			}
			var angle: number = Math.acos(-a * l1 / (aa - bb));
			x = a * Math.cos(angle) + l1;
			y = b * Math.sin(angle);
			d = x * x + y * y;
			if (d < minDist) {
				minAngle = angle;
				minDist = d;
				minX = x;
				minY = y;
			}
			if (d > maxDist) {
				maxAngle = angle;
				maxDist = d;
				maxX = x;
				maxY = y;
			}
			if (dd <= (minDist + maxDist) / 2) {
				a1 = ta - Math.atan2(minY * bendDir, minX);
				a2 = minAngle * bendDir;
			} else {
				a1 = ta - Math.atan2(maxY * bendDir, maxX);
				a2 = maxAngle * bendDir;
			}
		}
		var os: number = Math.atan2(cy, cx) * s2;
		var rotation: number = parent.resultTransform.skX;
		a1 = (a1 - os) * IkConstraint.radDeg + os1 - rotation;
		if (a1 > 180)
			a1 -= 360;
		else if (a1 < -180) a1 += 360;
		parent.resultTransform.x = px;
		parent.resultTransform.y = py;
		parent.resultTransform.skX = parent.resultTransform.skY = rotation + a1 * alpha;
		rotation = child.resultTransform.skX;
		rotation = rotation % 360;
		a2 = ((a2 + os) * IkConstraint.radDeg - 0) * s2 + os2 - rotation;
		if (a2 > 180)
			a2 -= 360;
		else if (a2 < -180) a2 += 360;
		child.resultTransform.x = cx;
		child.resultTransform.y = cy;
		child.resultTransform.skX = child.resultTransform.skY = child.resultTransform.skY + a2 * alpha;
		parent.update();
	}

	//TODO:coverage
	/**@internal */
	private _applyIk3(parent: Bone, child: Bone, targetX: number, targetY: number, bendDir: number, alpha: number): void {
		if (alpha == 0) {
			return;
		}
		var cwx: number, cwy: number;

		// 龙骨双骨骼ik计算

		const x: number = child.resultMatrix.a * child.length;
		const y: number = child.resultMatrix.b * child.length;

		const lLL: number = x * x + y * y;
		//child骨骼长度
		const lL: number = Math.sqrt(lLL);


		var parentX: number = parent.resultMatrix.tx;
		var parentY: number = parent.resultMatrix.ty;

		var childX: number = child.resultMatrix.tx;
		var childY: number = child.resultMatrix.ty;
		var dX: number = childX - parentX;
		var dY: number = childY - parentY;

		const lPP: number = dX * dX + dY * dY;
		//parent骨骼长度
		const lP: number = Math.sqrt(lPP);

		dX = targetX - parent.resultMatrix.tx;
		dY = targetY - parent.resultMatrix.ty;
		const lTT: number = dX * dX + dY * dY;
		//parent到ik的长度
		const lT: number = Math.sqrt(lTT);

		var ikRadianA: number = 0;
		if (lL + lP <= lT || lT + lL <= lP || lT + lP <= lL)//构不成三角形,被拉成直线
		{
			var rate: number;
			if (lL + lP <= lT) {
				rate = 1;
			} else {
				rate = -1;
			}
			childX = parentX + rate * (targetX - parentX) * lP / lT;
			childY = parentY + rate * (targetY - parentY) * lP / lT;
		}
		else {
			const h: number = (lPP - lLL + lTT) / (2 * lTT);
			const r: number = Math.sqrt(lPP - h * h * lTT) / lT;
			const hX: number = parentX + (dX * h);
			const hY: number = parentY + (dY * h);
			const rX: number = -dY * r;
			const rY: number = dX * r;

			if (bendDir > 0) {
				childX = hX - rX;
				childY = hY - rY;
			}
			else {
				childX = hX + rX;
				childY = hY + rY;
			}

		}
		cwx = childX;
		cwy = childY;

		//cwx,cwy为子骨骼应该在的世界坐标

		if (this.isDebug) {
			if (!this._sp) {
				this._sp = new Sprite();
				ILaya.stage.addChild(this._sp);
			}
			this._sp.graphics.clear();
			this._sp.graphics.drawCircle(parentX, parentY, 15, "#ff00ff");
			this._sp.graphics.drawCircle(targetX, targetY, 15, "#ffff00");

			this._sp.graphics.drawCircle(cwx, cwy, 15, "#ff00ff");
		}


		//根据当前计算出的世界坐标更新骨骼

		//更新parent
		var pRotation: number;
		pRotation = Math.atan2(cwy - parent.resultMatrix.ty, cwx - parent.resultMatrix.tx);
		parent.setRotation(pRotation);

		var pTarMatrix: Matrix;
		pTarMatrix = IkConstraint._tempMatrix;
		pTarMatrix.identity();
		pTarMatrix.rotate(pRotation);
		pTarMatrix.scale(parent.resultMatrix.getScaleX(), parent.resultMatrix.getScaleY());
		pTarMatrix.translate(parent.resultMatrix.tx, parent.resultMatrix.ty);

		pTarMatrix.copyTo(parent.resultMatrix);
		parent.updateChild();


		//更新child
		var childRotation: number;
		childRotation = Math.atan2(targetY - cwy, targetX - cwx);
		child.setRotation(childRotation);

		var childTarMatrix: Matrix;
		childTarMatrix = IkConstraint._tempMatrix;
		childTarMatrix.identity();
		childTarMatrix.rotate(childRotation);
		childTarMatrix.scale(child.resultMatrix.getScaleX(), child.resultMatrix.getScaleY());
		childTarMatrix.translate(cwx, cwy);

		pTarMatrix.copyTo(child.resultMatrix);
		child.updateChild();
	}
}


