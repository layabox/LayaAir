import { TfConstraintData } from "./TfConstraintData";
import { Bone } from "./Bone";
/**
 * @internal
 * @en Class representing a transform constraint which is used to control the transformations (translation, rotation, scale, shear) of bones based on a target bone.
 * @zh 变换约束类，用于根据目标骨骼控制其他骨骼的变换（平移、旋转、缩放、剪切）。
 */
export class TfConstraint {
	/**@internal */
	private _data: TfConstraintData;
	/**@internal */
	private _bones: Bone[];
	/**
	 * @en The target bone that the constraint will follow.
	 * @zh 约束跟随的目标骨骼。
	 */
	target: Bone;
	/**
	 * @en The mix ratio for rotation transformation.
	 * @zh 旋转变换的混合比率。
	 */
	rotateMix: number;
	/**
	 * @en The mix ratio for translation transformation.
	 * @zh 平移变换的混合比率。
	 */
	translateMix: number;
	/**
	 * @en The mix ratio for scale transformation.
	 * @zh 缩放变换的混合比率。
	 */
	scaleMix: number;
	/**
	 * @en The mix ratio for shear transformation.
	 * @zh 剪切变换的混合比率。
	 */
	shearMix: number;
	/**@internal */
	private _temp: number[] = [];

	//TODO:coverage
	/**
	 * @en Creates a new transform constraint.
	 * @param data The transform constraint data.
	 * @param bones The bones to be constrained.
	 * @zh 构造方法，创建一个新的变换约束。
	 * @param data 变换约束数据。
	 * @param bones 要被约束的骨骼。
	 */
	constructor(data: TfConstraintData, bones: Bone[]) {
		this._data = data;
		if (this._bones == null) {
			this._bones = [];
		}
		this.target = bones[data.targetIndex];
		var j: number, n: number;
		for (j = 0, n = data.boneIndexs.length; j < n; j++) {
			this._bones.push(bones[data.boneIndexs[j]]);
		}
		this.rotateMix = data.rotateMix;
		this.translateMix = data.translateMix;
		this.scaleMix = data.scaleMix;
		this.shearMix = data.shearMix;
	}

	//TODO:coverage
	/**
	 * @internal
	 * @en Applies the constraint to the bones, adjusting their transformations to match the target bone.
	 * @zh 应用约束，将骨骼的变换调整为与目标骨骼一致。
	 */
	apply(): void {
		var tTfBone: Bone;
		var ta: number = this.target.resultMatrix.a, tb: number = this.target.resultMatrix.b, tc: number = this.target.resultMatrix.c, td: number = this.target.resultMatrix.d;
		for (var j: number = 0, n: number = this._bones.length; j < n; j++) {
			tTfBone = this._bones[j];
			if (this.rotateMix > 0) {
				var a: number = tTfBone.resultMatrix.a, b: number = tTfBone.resultMatrix.b, c: number = tTfBone.resultMatrix.c, d: number = tTfBone.resultMatrix.d;
				var r: number = Math.atan2(tc, ta) - Math.atan2(c, a) + this._data.offsetRotation * Math.PI / 180;
				if (r > Math.PI)
					r -= Math.PI * 2;
				else if (r < -Math.PI) r += Math.PI * 2;
				r *= this.rotateMix;
				var cos: number = Math.cos(r), sin: number = Math.sin(r);
				tTfBone.resultMatrix.a = cos * a - sin * c;
				tTfBone.resultMatrix.b = cos * b - sin * d;
				tTfBone.resultMatrix.c = sin * a + cos * c;
				tTfBone.resultMatrix.d = sin * b + cos * d;
			}
			if (this.translateMix) {
				this._temp[0] = this._data.offsetX;
				this._temp[1] = this._data.offsetY;
				this.target.localToWorld(this._temp);
				tTfBone.resultMatrix.tx += (this._temp[0] - tTfBone.resultMatrix.tx) * this.translateMix;
				tTfBone.resultMatrix.ty += (this._temp[1] - tTfBone.resultMatrix.ty) * this.translateMix;
				tTfBone.updateChild();
			}
			if (this.scaleMix > 0) {
				var bs: number = Math.sqrt(tTfBone.resultMatrix.a * tTfBone.resultMatrix.a + tTfBone.resultMatrix.c * tTfBone.resultMatrix.c);
				var ts: number = Math.sqrt(ta * ta + tc * tc);
				var s: number = bs > 0.00001 ? (bs + (ts - bs + this._data.offsetScaleX) * this.scaleMix) / bs : 0;
				tTfBone.resultMatrix.a *= s;
				tTfBone.resultMatrix.c *= s;
				bs = Math.sqrt(tTfBone.resultMatrix.b * tTfBone.resultMatrix.b + tTfBone.resultMatrix.d * tTfBone.resultMatrix.d);
				ts = Math.sqrt(tb * tb + td * td);
				s = bs > 0.00001 ? (bs + (ts - bs + this._data.offsetScaleY) * this.scaleMix) / bs : 0;
				tTfBone.resultMatrix.b *= s;
				tTfBone.resultMatrix.d *= s;
			}

			if (this.shearMix > 0) {
				b = tTfBone.resultMatrix.b, d = tTfBone.resultMatrix.d;
				var by: number = Math.atan2(d, b);
				r = Math.atan2(td, tb) - Math.atan2(tc, ta) - (by - Math.atan2(tTfBone.resultMatrix.c, tTfBone.resultMatrix.a));
				if (r > Math.PI)
					r -= Math.PI * 2;
				else if (r < -Math.PI) r += Math.PI * 2;
				r = by + (r + this._data.offsetShearY * Math.PI / 180) * this.shearMix;
				s = Math.sqrt(b * b + d * d);
				tTfBone.resultMatrix.b = Math.cos(r) * s;
				tTfBone.resultMatrix.d = Math.sin(r) * s;
			}
		}
	}

}


