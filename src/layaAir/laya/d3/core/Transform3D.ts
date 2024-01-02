
import { Event } from "../../events/Event";
import { EventDispatcher } from "../../events/EventDispatcher";
import { MathUtils3D } from "../../maths/MathUtils3D";
import { Matrix3x3 } from "../../maths/Matrix3x3";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
import { Sprite3D } from "./Sprite3D";

/**
 * <code>Transform3D</code> 类用于实现3D变换。
 */
export class Transform3D extends EventDispatcher {
	/** @internal */
	protected static _tempVector30: Vector3 = new Vector3();
	/** @internal */
	protected static _tempQuaternion0: Quaternion = new Quaternion();
	/** @internal */
	protected static _tempMatrix0: Matrix4x4 = new Matrix4x4();
	/** @internal */
	protected static _tempMatrix3x30: Matrix3x3 = new Matrix3x3();
	/** @internal */
	protected static _tempMatrix3x31: Matrix3x3 = new Matrix3x3();
	/** @internal */
	protected static _tempMatrix3x32: Matrix3x3 = new Matrix3x3();
	/** @internal */
	protected static _tempMatrix3x33: Matrix3x3 = new Matrix3x3();

	/**@internal */
	static TRANSFORM_LOCALQUATERNION: number = 0x01;
	/**@internal */
	static TRANSFORM_LOCALEULER: number = 0x02;
	/**@internal */
	static TRANSFORM_LOCALMATRIX: number = 0x04;
	/**@internal */
	static TRANSFORM_WORLDPOSITION: number = 0x08;
	/**@internal */
	static TRANSFORM_WORLDQUATERNION: number = 0x10;
	/**@internal */
	static TRANSFORM_WORLDSCALE: number = 0x20;
	/**@internal */
	static TRANSFORM_WORLDMATRIX: number = 0x40;
	/**@internal */
	static TRANSFORM_WORLDEULER: number = 0x80;

	/**@internal */
	static _angleToRandin: number = 180 / Math.PI;

	/** @internal */
	protected _owner: Sprite3D;
	/** @internal */
	protected _localPosition: Vector3 = new Vector3(0, 0, 0);
	/** @internal */
	protected _localRotation: Quaternion = new Quaternion(0, 0, 0, 1);
	/** @internal */
	protected _localScale: Vector3 = new Vector3(1, 1, 1);
	/**@internal */
	protected _localRotationEuler: Vector3 = new Vector3(0, 0, 0);
	/** @internal */
	protected _localMatrix: Matrix4x4 = new Matrix4x4();

	/** @internal */
	protected _position: Vector3 = new Vector3(0, 0, 0);
	/** @internal */
	protected _rotation: Quaternion = new Quaternion(0, 0, 0, 1);
	/** @internal */
	protected _scale: Vector3 = new Vector3(1, 1, 1);
	/**@internal */
	protected _rotationEuler: Vector3 = new Vector3(0, 0, 0);
	/** @internal */
	protected _worldMatrix: Matrix4x4 = new Matrix4x4();

	/** @internal */
	_children: Transform3D[] | null = null;
	/**@internal 如果为true 表示自身相对于父节点并无任何改变，将通过这个参数忽略计算*/
	protected _isDefaultMatrix: boolean = false;
	protected _faceInvert: boolean = false;
	protected _frontFaceValue: number = 1;

	/** @internal */
	_parent: Transform3D | null = null;
	/**@internal */
	_transformFlag: number = 0;


	/**@internal */
	get isDefaultMatrix(): boolean {
		if (this._getTransformFlag(Transform3D.TRANSFORM_LOCALMATRIX)) {
			let localMat = this.localMatrix;
		}
		return this._isDefaultMatrix;
	}
	/**
	 * @internal
	 */
	get _isFrontFaceInvert(): boolean {
		if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
			var scale: Vector3 = this.getWorldLossyScale();
			var isInvert: boolean = scale.x < 0;
			(scale.y < 0) && (isInvert = !isInvert);
			(scale.z < 0) && (isInvert = !isInvert);
			this._faceInvert = isInvert;
			this._frontFaceValue = this._faceInvert ? -1 : 1;
		}
		return this._faceInvert;
	}

	getFrontFaceValue(): number {
		if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
			let value = this._isFrontFaceInvert;
		}
		return this._frontFaceValue;
	}


	/**
	 * 所属精灵。
	 */
	get owner(): Sprite3D {
		return this._owner;
	}

	/**
	 * 世界矩阵是否需要更新。
	 */
	get worldNeedUpdate(): boolean {
		return this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX);
	}

	/**
	 * 局部位置X轴分量。
	 */
	get localPositionX(): number {
		return this._localPosition.x;
	}

	set localPositionX(x: number) {
		this._localPosition.x = x;
		this.localPosition = this._localPosition;
	}

	/**
	 * 局部位置Y轴分量。
	 */
	get localPositionY(): number {
		return this._localPosition.y;
	}

	set localPositionY(y: number) {
		this._localPosition.y = y;
		this.localPosition = this._localPosition;
	}

	/**
	 * 局部位置Z轴分量。
	 */
	get localPositionZ(): number {
		return this._localPosition.z;
	}

	set localPositionZ(z: number) {
		this._localPosition.z = z;
		this.localPosition = this._localPosition;
	}

	/**
	 * 局部位置。
	 */
	get localPosition(): Vector3 {
		return this._localPosition;
	}

	set localPosition(value: Vector3) {
		if (this._localPosition !== value)
			value.cloneTo(this._localPosition);

		this._setTransformFlag(Transform3D.TRANSFORM_LOCALMATRIX, true);
		this._onWorldPositionTransform();
	}

	/**
	 * 局部旋转四元数X分量。
	 */
	get localRotationX(): number {
		return this.localRotation.x;
	}

	set localRotationX(x: number) {
		let rot = this.localRotation;
		rot.x = x;
		this.localRotation = rot;
	}

	/**
	 * 局部旋转四元数Y分量。
	 */
	get localRotationY(): number {
		return this.localRotation.y;
	}

	set localRotationY(y: number) {
		let rot = this.localRotation;
		rot.y = y;
		this.localRotation = rot;
	}

	/**
	 * 局部旋转四元数Z分量。
	 */
	get localRotationZ(): number {
		return this.localRotation.z;
	}

	set localRotationZ(z: number) {
		let rot = this.localRotation;
		rot.z = z;
		this.localRotation = rot;
	}

	/**
	 * 局部旋转四元数W分量。
	 */
	get localRotationW(): number {
		return this.localRotation.w;
	}

	set localRotationW(w: number) {
		let rot = this.localRotation;
		rot.w = w;
		this.localRotation = rot;
	}

	/**
	 * 局部旋转。
	 */
	get localRotation(): Quaternion {
		if (this._getTransformFlag(Transform3D.TRANSFORM_LOCALQUATERNION)) {
			var eulerE: Vector3 = this._localRotationEuler;
			Quaternion.createFromYawPitchRoll(eulerE.y / Transform3D._angleToRandin, eulerE.x / Transform3D._angleToRandin, eulerE.z / Transform3D._angleToRandin, this._localRotation);
			this._setTransformFlag(Transform3D.TRANSFORM_LOCALQUATERNION, false);
		}
		return this._localRotation;
	}

	set localRotation(value: Quaternion) {
		if (this._localRotation !== value)
			value.cloneTo(this._localRotation);
		this._localRotation.normalize(this._localRotation);
		this._setTransformFlag(Transform3D.TRANSFORM_LOCALEULER | Transform3D.TRANSFORM_LOCALMATRIX, true);
		this._setTransformFlag(Transform3D.TRANSFORM_LOCALQUATERNION, false);
		this._onWorldRotationTransform();
	}

	/**
	 * 局部缩放X。
	 */
	get localScaleX(): number {
		return this._localScale.x;
	}

	set localScaleX(value: number) {
		this._localScale.x = value;
		this.localScale = this._localScale;
	}

	/**
	 * 局部缩放Y。
	 */
	get localScaleY(): number {
		return this._localScale.y;
	}

	set localScaleY(value: number) {
		this._localScale.y = value;
		this.localScale = this._localScale;
	}

	/**
	 * 局部缩放Z。
	 */
	get localScaleZ(): number {
		return this._localScale.z;
	}

	set localScaleZ(value: number) {
		this._localScale.z = value;
		this.localScale = this._localScale;
	}

	/**
	 * 局部缩放。
	 */
	get localScale(): Vector3 {
		return this._localScale;
	}

	set localScale(value: Vector3) {
		if (this._localScale !== value)
			value.cloneTo(this._localScale);
		this._setTransformFlag(Transform3D.TRANSFORM_LOCALMATRIX, true);
		this._onWorldScaleTransform();
	}

	/**
	 * 局部空间的X轴欧拉角。
	 */
	get localRotationEulerX(): number {
		return this.localRotationEuler.x;
	}

	set localRotationEulerX(value: number) {
		let rot = this.localRotationEuler;
		rot.x = value;
		this.localRotationEuler = rot;
	}

	/**
	 * 局部空间的Y轴欧拉角。
	 */
	get localRotationEulerY(): number {
		return this.localRotationEuler.y;
	}

	set localRotationEulerY(value: number) {
		let rot = this.localRotationEuler;
		rot.y = value;
		this.localRotationEuler = rot;
	}

	/**
	 * 局部空间的Z轴欧拉角。
	 */
	get localRotationEulerZ(): number {
		return this.localRotationEuler.z;
	}

	set localRotationEulerZ(value: number) {
		let rot = this.localRotationEuler;
		rot.z = value;
		this.localRotationEuler = rot;
	}

	/**
	 * 局部空间欧拉角。
	 */
	get localRotationEuler(): Vector3 {
		if (this._getTransformFlag(Transform3D.TRANSFORM_LOCALEULER)) {
			this._localRotation.getYawPitchRoll(Transform3D._tempVector30);
			var euler: Vector3 = Transform3D._tempVector30;
			var localRotationEuler: Vector3 = this._localRotationEuler;
			localRotationEuler.x = euler.y * Transform3D._angleToRandin;
			localRotationEuler.y = euler.x * Transform3D._angleToRandin;
			localRotationEuler.z = euler.z * Transform3D._angleToRandin;
			this._setTransformFlag(Transform3D.TRANSFORM_LOCALEULER, false);
		}
		return this._localRotationEuler;
	}

	set localRotationEuler(value: Vector3) {
		if (this._localRotationEuler !== value)
			value.cloneTo(this._localRotationEuler);
		this._setTransformFlag(Transform3D.TRANSFORM_LOCALEULER, false);
		this._setTransformFlag(Transform3D.TRANSFORM_LOCALQUATERNION | Transform3D.TRANSFORM_LOCALMATRIX, true);
		this._onWorldRotationTransform();
	}

	/**
	 * 局部矩阵。
	 */
	get localMatrix(): Matrix4x4 {
		if (this._getTransformFlag(Transform3D.TRANSFORM_LOCALMATRIX)) {
			Matrix4x4.createAffineTransformation(this._localPosition, this.localRotation, this._localScale, this._localMatrix);
			this._isDefaultMatrix = this._localMatrix.isIdentity();
			this._setTransformFlag(Transform3D.TRANSFORM_LOCALMATRIX, false);
		}
		return this._localMatrix;
	}

	set localMatrix(value: Matrix4x4) {
		if (this._localMatrix !== value)
			value.cloneTo(this._localMatrix);
		this._isDefaultMatrix = this._localMatrix.isIdentity();
		this._localMatrix.decomposeTransRotScale(this._localPosition, this._localRotation, this._localScale);
		this._setTransformFlag(Transform3D.TRANSFORM_LOCALEULER, true);
		this._setTransformFlag(Transform3D.TRANSFORM_LOCALMATRIX, false);
		this._onWorldTransform();
	}

	/**
	 * 世界位置。
	 */
	get position(): Vector3 {
		if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION)) {
			if (this._parent != null) {
				var worldMatE = this.worldMatrix.elements;
				this._position.x = worldMatE[12];
				this._position.y = worldMatE[13];
				this._position.z = worldMatE[14];
			} else {
				this._localPosition.cloneTo(this._position);
			}
			this._setTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION, false);
		}
		return this._position;
	}

	set position(value: Vector3) {
		if (this._parent != null) {
			var parentInvMat: Matrix4x4 = Transform3D._tempMatrix0;
			this._parent.worldMatrix.invert(parentInvMat);
			Vector3.transformCoordinate(value, parentInvMat, this._localPosition);
		}
		else {
			value.cloneTo(this._localPosition);
		}
		this.localPosition = this._localPosition;
		if (this._position !== value)
			value.cloneTo(this._position);
		this._setTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION, false);
	}



	/**
	 * 世界旋转。
	 */
	get rotation(): Quaternion {
		if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION)) {
			if (this._parent != null)
				Quaternion.multiply(this._parent.rotation, this.localRotation, this._rotation);//使用localRotation不使用_localRotation,内部需要计算
			else
				this.localRotation.cloneTo(this._rotation);
			this._setTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION, false);
		}
		return this._rotation;
	}

	set rotation(value: Quaternion) {
		if (this._parent != null) {
			this._parent.rotation.invert(Transform3D._tempQuaternion0);
			Quaternion.multiply(Transform3D._tempQuaternion0, value, this._localRotation);
		} else {
			value.cloneTo(this._localRotation);
		}
		this.localRotation = this._localRotation;
		if (value !== this._rotation)
			value.cloneTo(this._rotation);

		this._setTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION, false);
	}


	/**
	 * 世界空间的旋转角度，顺序为x、y、z。
	 */
	get rotationEuler(): Vector3 {
		if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDEULER)) {
			this.rotation.getYawPitchRoll(Transform3D._tempVector30);//使用rotation属性,可能需要更新
			var eulerE: Vector3 = Transform3D._tempVector30;
			var rotationEulerE: Vector3 = this._rotationEuler;
			rotationEulerE.x = eulerE.y * Transform3D._angleToRandin;
			rotationEulerE.y = eulerE.x * Transform3D._angleToRandin;
			rotationEulerE.z = eulerE.z * Transform3D._angleToRandin;
			this._setTransformFlag(Transform3D.TRANSFORM_WORLDEULER, false);
		}
		return this._rotationEuler;
	}

	set rotationEuler(value: Vector3) {
		Quaternion.createFromYawPitchRoll(value.y / Transform3D._angleToRandin, value.x / Transform3D._angleToRandin, value.z / Transform3D._angleToRandin, this._rotation);
		this.rotation = this._rotation;
		if (this._rotationEuler !== value)
			value.cloneTo(this._rotationEuler);

		this._setTransformFlag(Transform3D.TRANSFORM_WORLDEULER, false);
	}

	/**
	 * 世界矩阵。
	 */
	get worldMatrix(): Matrix4x4 {
		if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX)) {
			if (this._parent != null) {
				//这里将剔除单位矩阵的计算
				let effectiveTrans = this._parent;

				while (effectiveTrans._parent && effectiveTrans.isDefaultMatrix) {
					effectiveTrans = effectiveTrans._parent;
				}
				Matrix4x4.multiply(effectiveTrans.worldMatrix, this.localMatrix, this._worldMatrix);
			}
			else
				this.localMatrix.cloneTo(this._worldMatrix);

			this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX, false);
		}
		return this._worldMatrix;
	}

	set worldMatrix(value: Matrix4x4) {
		if (this._parent === null) {
			value.cloneTo(this._localMatrix);
		} else {
			this._parent.worldMatrix.invert(this._localMatrix);
			Matrix4x4.multiply(this._localMatrix, value, this._localMatrix);
		}
		this.localMatrix = this._localMatrix;
		if (this._worldMatrix !== value)
			value.cloneTo(this._worldMatrix);

		this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX, false);
	}

	/**
	 * 创建一个 <code>Transform3D</code> 实例。
	 * @internal
	 * @param owner 所属精灵。
	 */
	constructor(owner: Sprite3D) {
		super();
		this._owner = owner;
		this._children = [];
		this._setTransformFlag(Transform3D.TRANSFORM_LOCALQUATERNION | Transform3D.TRANSFORM_LOCALEULER | Transform3D.TRANSFORM_LOCALMATRIX, false);
		this._setTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDEULER | Transform3D.TRANSFORM_WORLDSCALE | Transform3D.TRANSFORM_WORLDMATRIX, true);
	}

	/**
	 * @internal
	 */
	_getScaleMatrix(): Matrix3x3 {
		var invRotation: Quaternion = Transform3D._tempQuaternion0;
		var invRotationMat: Matrix3x3 = Transform3D._tempMatrix3x30;
		var worldRotScaMat: Matrix3x3 = Transform3D._tempMatrix3x31;
		var scaMat: Matrix3x3 = Transform3D._tempMatrix3x32;
		Matrix3x3.createFromMatrix4x4(this.worldMatrix, worldRotScaMat)
		this.rotation.invert(invRotation);
		Matrix3x3.createRotationQuaternion(invRotation, invRotationMat);
		Matrix3x3.multiply(invRotationMat, worldRotScaMat, scaMat);
		return scaMat;
	}

	/**
	 * @internal
	 */
	_setTransformFlag(type: number, value: boolean): void {
		if (value)
			this._transformFlag |= type;
		else
			this._transformFlag &= ~type;
	}

	/**
	 * @internal
	 */
	_getTransformFlag(type: number): boolean {
		return (this._transformFlag & type) != 0;
	}

	/**
	 * @internal
	 */
	_setParent(value: Transform3D): void {
		if (this._parent !== value) {
			if (this._parent) {
				var parentChilds: Transform3D[] = this._parent._children!;
				var index: number = parentChilds.indexOf(this);
				parentChilds.splice(index, 1);
			}
			if (value) {
				value._children!.push(this);
				(value) && (this._onWorldTransform());
			}
			this._parent = value;
		}
	}

	/**
	 * @internal
	 */
	_onWorldPositionRotationTransform(): void {
		if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDEULER)) {
			this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDEULER, true);
			this.event(Event.TRANSFORM_CHANGED, this._transformFlag);
		}
		for (var i: number = 0, n: number = this._children!.length; i < n; i++)
			this._children![i]._onWorldPositionRotationTransform();
	}

	/**
	 * @internal
	 */
	_onWorldPositionScaleTransform(): void {
		if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
			this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDSCALE, true);
			this.event(Event.TRANSFORM_CHANGED, this._transformFlag);
		}
		for (var i: number = 0, n: number = this._children!.length; i < n; i++)
			this._children![i]._onWorldPositionScaleTransform();
	}

	/**
	 * @internal
	 */
	_onWorldPositionTransform(): void {
		if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION)) {
			this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDPOSITION, true);
			this.event(Event.TRANSFORM_CHANGED, this._transformFlag);
		}
		for (var i: number = 0, n: number = this._children!.length; i < n; i++)
			this._children![i]._onWorldPositionTransform();
	}

	/**
	 * @internal
	 */
	protected _onWorldRotationTransform(): void {
		if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDEULER)) {
			this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDEULER, true);
			this.event(Event.TRANSFORM_CHANGED, this._transformFlag);
		}
		for (var i: number = 0, n: number = this._children!.length; i < n; i++)
			this._children![i]._onWorldPositionRotationTransform();//父节点旋转发生变化，子节点的世界位置和旋转都需要更新
	}

	/**
	 * @internal
	 */
	_onWorldScaleTransform(): void {
		if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
			this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDSCALE, true);
			this.event(Event.TRANSFORM_CHANGED, this._transformFlag);
		}
		for (var i: number = 0, n: number = this._children!.length; i < n; i++)
			this._children![i]._onWorldPositionScaleTransform();//父节点缩放发生变化，子节点的世界位置和缩放都需要更新
	}

	/**
	 * @internal
	 */
	_onWorldTransform(): void {
		if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDEULER) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
			this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDEULER | Transform3D.TRANSFORM_WORLDSCALE, true);
			this.event(Event.TRANSFORM_CHANGED, this._transformFlag);
		}
		for (var i: number = 0, n: number = this._children!.length; i < n; i++)
			this._children![i]._onWorldTransform();
	}

	/**
	 * 平移变换。
	 * @param 	translation 移动距离。
	 * @param 	isLocal 是否局部空间。
	 */
	translate(translation: Vector3, isLocal: boolean = true): void {
		if (isLocal) {
			Matrix4x4.createFromQuaternion(this.localRotation, Transform3D._tempMatrix0);
			Vector3.transformCoordinate(translation, Transform3D._tempMatrix0, Transform3D._tempVector30);
			Vector3.add(this.localPosition, Transform3D._tempVector30, this._localPosition);
			this.localPosition = this._localPosition;
		} else {
			Vector3.add(this.position, translation, this._position);
			this.position = this._position;
		}
	}

	/**
	 * 旋转变换。
	 * @param 	rotations 旋转幅度。
	 * @param 	isLocal 是否局部空间。
	 * @param 	isRadian 是否弧度制。
	 */
	rotate(rotation: Vector3, isLocal: boolean = true, isRadian: boolean = true): void {
		var rot: Vector3;
		if (isRadian) {
			rot = rotation;
		} else {
			Vector3.scale(rotation, Math.PI / 180.0, Transform3D._tempVector30);
			rot = Transform3D._tempVector30;
		}

		Quaternion.createFromYawPitchRoll(rot.y, rot.x, rot.z, Transform3D._tempQuaternion0);
		if (isLocal) {
			Quaternion.multiply(this._localRotation, Transform3D._tempQuaternion0, this._localRotation);
			this.localRotation = this._localRotation;
		} else {
			Quaternion.multiply(Transform3D._tempQuaternion0, this.rotation, this._rotation);
			this.rotation = this._rotation;
		}
	}

	/**
	 * 获取向前方向。
	 * @param forward 前方向。
	 */
	getForward(forward: Vector3): void {
		var worldMatElem: Float32Array = this.worldMatrix.elements;
		forward.x = -worldMatElem[8];
		forward.y = -worldMatElem[9];
		forward.z = -worldMatElem[10];
	}

	/**
	 * 获取向上方向。
	 * @param up 上方向。
	 */
	getUp(up: Vector3): void {
		var worldMatElem: Float32Array = this.worldMatrix.elements;
		up.x = worldMatElem[4];
		up.y = worldMatElem[5];
		up.z = worldMatElem[6];
	}

	/**
	 * 获取向右方向。
	 * @param 右方向。
	 */
	getRight(right: Vector3): void {
		var worldMatElem: Float32Array = this.worldMatrix.elements;
		right.x = worldMatElem[0];
		right.y = worldMatElem[1];
		right.z = worldMatElem[2];
	}

	/**
	 * 观察目标位置。
	 * @param	target 观察目标。
	 * @param	up 向上向量。
	 * @param	isLocal 是否局部空间。
	 */
	lookAt(target: Vector3, up: Vector3, isLocal: boolean = false, isCamera: boolean = true): void {
		var eye: Vector3;
		if (isLocal) {
			eye = this._localPosition;
			if (Math.abs(eye.x - target.x) < MathUtils3D.zeroTolerance && Math.abs(eye.y - target.y) < MathUtils3D.zeroTolerance && Math.abs(eye.z - target.z) < MathUtils3D.zeroTolerance)
				return;
			if (isCamera) {
				Quaternion.lookAt(this._localPosition, target, up, this._localRotation);
				this._localRotation.invert(this._localRotation);
			} else {
				Vector3.subtract(this.localPosition, target, Transform3D._tempVector30);
				Quaternion.rotationLookAt(Transform3D._tempVector30, up, this.localRotation);
				this._localRotation.invert(this._localRotation);
			}

			this.localRotation = this._localRotation;
		} else {
			var worldPosition: Vector3 = this.position;
			eye = worldPosition;
			if (Math.abs(eye.x - target.x) < MathUtils3D.zeroTolerance && Math.abs(eye.y - target.y) < MathUtils3D.zeroTolerance && Math.abs(eye.z - target.z) < MathUtils3D.zeroTolerance)
				return;
			if (isCamera) {
				Quaternion.lookAt(worldPosition, target, up, this._rotation);
				this._rotation.invert(this._rotation);
			} else {
				Vector3.subtract(this.position, target, Transform3D._tempVector30);
				Quaternion.rotationLookAt(Transform3D._tempVector30, up, this._rotation);
				this._rotation.invert(this._rotation);
			}
			this.rotation = this._rotation;
		}
	}

	/**
	 * 对象朝向目标
	 * @param target 
	 * @param up 
	 * @param isLocal 
	 */
	objLookat(target: Vector3, up: Vector3, isLocal: boolean = false): void {

	}



	/**
	 * 世界缩放。
	 * 某种条件下获取该值可能不正确（例如：父节点有缩放，子节点有旋转），缩放会倾斜，无法使用Vector3正确表示,必须使用Matrix3x3矩阵才能正确表示。
	 * @return	世界缩放。
	 */
	getWorldLossyScale(): Vector3 {
		if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
			if (this._parent !== null) {
				var scaMatE = this._getScaleMatrix().elements;
				this._scale.x = scaMatE[0];
				this._scale.y = scaMatE[4];
				this._scale.z = scaMatE[8];
			}
			else {
				this._localScale.cloneTo(this._scale);
			}
			this._setTransformFlag(Transform3D.TRANSFORM_WORLDSCALE, false);
		}
		return this._scale;
	}

	/**
	 * 设置世界缩放。
	 * 某种条件下设置该值可能不正确（例如：父节点有缩放，子节点有旋转），缩放会倾斜，无法使用Vector3正确表示,必须使用Matrix3x3矩阵才能正确表示。
	 * @return	世界缩放。
	 */
	setWorldLossyScale(value: Vector3) {
		if (this._parent !== null) {
			var scaleMat: Matrix3x3 = Transform3D._tempMatrix3x33;
			var localScaleMat: Matrix3x3 = Transform3D._tempMatrix3x33;
			var localScaleMatE: Float32Array = localScaleMat.elements;
			var parInvScaleMat: Matrix3x3 = this._parent._getScaleMatrix();
			parInvScaleMat.invert(parInvScaleMat);
			Matrix3x3.createFromScaling(value, scaleMat);
			Matrix3x3.multiply(parInvScaleMat, scaleMat, localScaleMat);
			this._localScale.x = localScaleMatE[0];
			this._localScale.y = localScaleMatE[4];
			this._localScale.z = localScaleMatE[8];
		} else {
			value.cloneTo(this._localScale);
		}
		this.localScale = this._localScale;
		if (this._scale !== value)
			value.cloneTo(this._scale);
		this._setTransformFlag(Transform3D.TRANSFORM_WORLDSCALE, false);
	}

	//----------------------------------------Discard-------------------------------------------------
	/**
	 * @deprecated
	 */
	get scale(): Vector3 {
		console.warn("Transfrm3D: discard function,please use getWorldLossyScale instead.");
		return this.getWorldLossyScale();
	}

	/**
	 * @deprecated
	 */
	set scale(value: Vector3) {
		console.warn("Transfrm3D: discard function,please use setWorldLossyScale instead.");
		this.setWorldLossyScale(value);
	}

	localToGlobal(value: Vector3, out: Vector3): void {
		Vector3.transformV3ToV3(value, this.worldMatrix, out);
	}

	/**
	 *转化成局部坐标
		* @param pos
		* @param out
		* 
		*/
	globalToLocal(pos: Vector3, out: Vector3): void {
		this.worldMatrix.invert(Transform3D._tempMatrix0);
		Vector3.transformV3ToV3(pos, Transform3D._tempMatrix0, out);
	}

	/**
	 *转化成局部向量 
	 * @param pos
	 * @param out
	 * 
	 */
	toLocalNormal(pos: Vector3, out: Vector3): void {
		this.worldMatrix.invert(Transform3D._tempMatrix0);
		Vector3.TransformNormal(pos, Transform3D._tempMatrix0, out);
	}

	toDir(forward: Vector3, dir: Vector3) {
		//TODO 判断一样么
		var wmat: Matrix4x4 = this.worldMatrix;
		//var newForward:Vector3 = new Vector3();
		//var newRot:Quaternion = new Quaternion();

		//Vector3.TransformNormal(forward,wmat,newForward);
		//Vector3.normalize(newForward,newForward);
		//rotationTo(newRot,newForward,dir);
		this.rotationTo(this.rotation, forward, dir);
		//Quaternion.multiply(rotation,newRot,rotation)
		//DEBUG
		//Quaternion.createFromAxisAngle(new Vector3(0,1,0),75*Math.PI/180,newRot)
		//DEBUG
		this.rotation = this.rotation;
	}

	static tmpVec3: Vector3 = new Vector3();
	/**
	 * 这是一个 glmatrix中的函数
	 * a,b都是规格化以后的向量
	 * Sets a quaternion to represent the shortest rotation from one
	 * vector to another.
	 *
	 * Both vectors are assumed to be unit length.
	 *
	 * @param {quat} out the receiving quaternion.
	 * @param {vec3} a the initial vector
	 * @param {vec3} b the destination vector
	 * @returns {quat} out
	 */
	rotationTo(out: Quaternion, a: Vector3, b: Vector3): boolean {
		var dot: number = Vector3.dot(a, b);
		Vector3.Up
		if (dot < -0.999999) {// 180度了，可以选择多个轴旋转
			Vector3.cross(Vector3.UnitX, a, Transform3D.tmpVec3);
			if (Vector3.scalarLength(Transform3D.tmpVec3) < 0.000001)
				Vector3.cross(Vector3.UnitY, a, Transform3D.tmpVec3);
			Vector3.normalize(Transform3D.tmpVec3, Transform3D.tmpVec3);
			Quaternion.createFromAxisAngle(Transform3D.tmpVec3, Math.PI, out);
			return true
		} else if (dot > 0.999999) {// 没有变化
			out.x = 0;
			out.y = 0;
			out.z = 0;
			out.w = 1;
			return false;
		} else {
			// 下面是求这个四元数，这是一个简化求法，根据cos(a/2)=√((1+dot)/2), cos(a/2)sin(a/2)=sin(a)/2 就能推导出来
			Vector3.cross(a, b, Transform3D.tmpVec3);
			out.x = Transform3D.tmpVec3.x;
			out.y = Transform3D.tmpVec3.y;
			out.z = Transform3D.tmpVec3.z;
			out.w = 1 + dot;
			out.normalize(out);
			return true;
		}
		return false;
	}

}


