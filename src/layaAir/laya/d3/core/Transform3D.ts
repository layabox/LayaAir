
import { Event } from "../../events/Event";
import { EventDispatcher } from "../../events/EventDispatcher";
import { MathUtils3D } from "../../maths/MathUtils3D";
import { Matrix3x3 } from "../../maths/Matrix3x3";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
import { Sprite3D } from "./Sprite3D";

/**
 * @en The `Transform3D` class is used to implement 3D transformations.
 * @zh `Transform3D` 类用于实现3D变换。
 */
export class Transform3D extends EventDispatcher {
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
	static TRANSFORM_LOCALPOS: number = 0x100;
	/**@internal */
	static TRANSFORM_LOCALSCALE: number = 0x200;

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
	/**@internal @protected */
	protected _faceInvert: boolean = false;
	/**@internal @protected */
	protected _frontFaceValue: number = 1;

	/** @internal */
	_parent: Transform3D | null = null;
	/**@internal */
	private _transformFlag: number = 0;


	/**
	 * @en Whether it is the default matrix. If `true`, it indicates that there is no change relative to the parent node, and calculations will be skipped based on this parameter.
	 * @zh 是否为默认矩阵，如果为true，表示自身相对于父节点并无任何改变，将通过这个参数忽略计算。
	 */
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

	/**
	 * @en Whether the front face is clockwise.
	 * @zh 获取是否前向顺时针面。
	 */
	getFrontFaceValue(): number {
		if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
			let value = this._isFrontFaceInvert;
		}
		return this._frontFaceValue;
	}


	/**
	 * @en The sprite to which this transform belongs.
	 * @zh 所属精灵。
	 */
	get owner(): Sprite3D {
		return this._owner;
	}

	/**
	 * @en Whether the world matrix needs to be updated.
	 * @zh 世界矩阵是否需要更新。
	 */
	get worldNeedUpdate(): boolean {
		return this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX);
	}

	/**
	 * @en The X component of the local position.
	 * @zh 局部位置X轴分量。
	 */
	get localPositionX(): number {
		return this._localPosition.x;
	}

	set localPositionX(x: number) {
		this._localPosition.x = x;
		this.localPosition = this._localPosition;
	}

	/**
	 * @en The Y component of the local position.
	 * @zh 局部位置Y轴分量。
	 */
	get localPositionY(): number {
		return this._localPosition.y;
	}

	set localPositionY(y: number) {
		this._localPosition.y = y;
		this.localPosition = this._localPosition;
	}

	/**
	 * @en The Z component of the local position.
	 * @zh 局部位置Z轴分量。
	 */
	get localPositionZ(): number {
		return this._localPosition.z;
	}

	set localPositionZ(z: number) {
		this._localPosition.z = z;
		this.localPosition = this._localPosition;
	}

	/**
	 * @en The local position.
	 * @zh 局部位置。
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
	 * @en The X component of the local rotation quaternion.
	 * @zh 局部旋转四元数X分量。
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
	 * @en The Y component of the local rotation quaternion.
	 * @zh 局部旋转四元数Y分量。
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
	 * @en The Z component of the local rotation quaternion.
	 * @zh 局部旋转四元数Z分量。
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
	 * @en The W component of the local rotation quaternion.
	 * @zh 局部旋转四元数W分量。
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
	 * @en The local rotation.
	 * @zh 局部旋转。
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
	 * @en The X component of the local scale.
	 * @zh 局部缩放X。
	 */
	get localScaleX(): number {
		return this._localScale.x;
	}

	set localScaleX(value: number) {
		this._localScale.x = value;
		this.localScale = this._localScale;
	}

	/**
	 * @en The Y component of the local scale.
	 * @zh 局部缩放Y。
	 */
	get localScaleY(): number {
		return this._localScale.y;
	}

	set localScaleY(value: number) {
		this._localScale.y = value;
		this.localScale = this._localScale;
	}

	/**
	 * @en The Z component of the local scale.
	 * @zh 局部缩放Z。
	 */
	get localScaleZ(): number {
		return this._localScale.z;
	}

	set localScaleZ(value: number) {
		this._localScale.z = value;
		this.localScale = this._localScale;
	}

	/**
	 * @en The local scale of the transform.
	 * @zh 局部缩放。
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
	 * @en The X component of the local rotation euler angles.
	 * @zh 局部空间的X轴欧拉角。
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
	 * @en The Y component of the local rotation euler angles.
	 * @zh 局部空间的Y轴欧拉角。
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
	 * @en The Z component of the local rotation euler angles.
	 * @zh 局部空间的Z轴欧拉角。
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
	 * @en The local rotation euler angles of the transform.
	 * @zh 局部空间欧拉角。
	 */
	get localRotationEuler(): Vector3 {
		if (this._getTransformFlag(Transform3D.TRANSFORM_LOCALEULER)) {
			this._localRotation.getYawPitchRoll(_tempVector30);
			var euler: Vector3 = _tempVector30;
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
	 * @en The local matrix.
	 * @zh 局部矩阵。
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
	 * @en World position.
	 * @zh 世界位置。
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
			var parentInvMat: Matrix4x4 = _tempMatrix0;
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
	 * @en World rotation.
	 * @zh 世界旋转。
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
			this._parent.rotation.invert(_tempQuaternion0);
			Quaternion.multiply(_tempQuaternion0, value, this._localRotation);
		} else {
			value.cloneTo(this._localRotation);
		}
		this.localRotation = this._localRotation;
		if (value !== this._rotation)
			value.cloneTo(this._rotation);

		this._setTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION, false);
	}


	/**
	 * @en Rotation angles in world space, in the order of x, y, z.
	 * @zh 世界空间的旋转角度，顺序为x、y、z。
	 */
	get rotationEuler(): Vector3 {
		if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDEULER)) {
			this.rotation.getYawPitchRoll(_tempVector30);//使用rotation属性,可能需要更新
			var eulerE: Vector3 = _tempVector30;
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
	 * @en World matrix.
	 * @zh 世界矩阵。
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
	 * @internal
	 * @en Creates an instance of Transform3D.
	 * @param owner The sprite of the owner.
	 * @zh 创建一个 Transform3D 的实例。
	 * @param owner 所属精灵。
	 */
	constructor(owner: Sprite3D) {
		super();
		this._owner = owner;
		this._children = [];
		this._initProperty();
	}

	protected _initProperty() {
		this._setTransformFlag(Transform3D.TRANSFORM_LOCALQUATERNION | Transform3D.TRANSFORM_LOCALEULER | Transform3D.TRANSFORM_LOCALMATRIX, false);
		this._setTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDEULER | Transform3D.TRANSFORM_WORLDSCALE | Transform3D.TRANSFORM_WORLDMATRIX, true);
	}

	/**
	 * @internal
	 */
	_getScaleMatrix(): Matrix3x3 {
		var invRotation: Quaternion = _tempQuaternion0;
		var invRotationMat: Matrix3x3 = _tempMatrix3x30;
		var worldRotScaMat: Matrix3x3 = _tempMatrix3x31;
		var scaMat: Matrix3x3 = _tempMatrix3x32;
		Matrix3x3.createFromMatrix4x4(this.worldMatrix, worldRotScaMat)
		this.rotation.invert(invRotation);
		Matrix3x3.createRotationQuaternion(invRotation, invRotationMat);
		Matrix3x3.multiply(invRotationMat, worldRotScaMat, scaMat);
		return scaMat;
	}

	/**
	 * @internal
	 */
	protected _setTransformFlag(type: number, value: boolean): void {
		if (value)
			this._transformFlag |= type;
		else
			this._transformFlag &= ~type;
	}

	/**
	 * @internal
	 */
	protected _getTransformFlag(type: number): boolean {
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
	protected _onWorldPositionRotationTransform(): void {
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
	protected _onWorldPositionScaleTransform(): void {
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
	protected _onWorldPositionTransform(): void {
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
	protected _onWorldScaleTransform(): void {
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
	 * @en Perform translation transformation.
	 * @param translation The distance to move.
	 * @param isLocal Whether to use local space. Default is true.
	 * @zh 平移变换。
	 * @param translation 移动距离。
	 * @param isLocal 是否局部空间。默认为 true。
	 */
	translate(translation: Vector3, isLocal: boolean = true): void {
		if (isLocal) {
			Matrix4x4.createFromQuaternion(this.localRotation, _tempMatrix0);
			Vector3.transformCoordinate(translation, _tempMatrix0, _tempVector30);
			Vector3.add(this.localPosition, _tempVector30, this._localPosition);
			this.localPosition = this._localPosition;
		} else {
			Vector3.add(this.position, translation, this._position);
			this.position = this._position;
		}
	}

	/**
	 * @en Perform rotation transformation.
	 * @param rotation The rotation amount.
	 * @param isLocal Whether to use local space. Default is true.
	 * @param isRadian Whether the rotation is in radians. Default is true.
	 * @zh 旋转变换。
	 * @param rotation 旋转幅度。
	 * @param isLocal 是否局部空间。默认为 true。
	 * @param isRadian 是否弧度制。默认为 true。
	 */
	rotate(rotation: Vector3, isLocal: boolean = true, isRadian: boolean = true): void {
		var rot: Vector3;
		if (isRadian) {
			rot = rotation;
		} else {
			Vector3.scale(rotation, Math.PI / 180.0, _tempVector30);
			rot = _tempVector30;
		}

		Quaternion.createFromYawPitchRoll(rot.y, rot.x, rot.z, _tempQuaternion0);
		if (isLocal) {
			Quaternion.multiply(this.localRotation, _tempQuaternion0, this._localRotation);
			this.localRotation = this._localRotation;
		} else {
			Quaternion.multiply(_tempQuaternion0, this.rotation, this._rotation);
			this.rotation = this._rotation;
		}
	}

	/**
	 * @en Get the forward direction.
	 * @param forward The vector to the forward direction.
	 * @zh 获取向前方向。
	 * @param forward 前方向。
	 */
	getForward(forward: Vector3): void {
		var worldMatElem: Float32Array = this.worldMatrix.elements;
		forward.x = -worldMatElem[8];
		forward.y = -worldMatElem[9];
		forward.z = -worldMatElem[10];
	}

	/**
	 * @en Get the up direction.
	 * @param up The vector to the up direction.
	 * @zh 获取向上方向。
	 * @param up 上方向。
	 */
	getUp(up: Vector3): void {
		var worldMatElem: Float32Array = this.worldMatrix.elements;
		up.x = worldMatElem[4];
		up.y = worldMatElem[5];
		up.z = worldMatElem[6];
	}

	/**
	 * @en Get the right direction.
	 * @param right The vector to the right direction.
	 * @zh 获取向右方向。
	 * @param right 右方向。
	 */
	getRight(right: Vector3): void {
		var worldMatElem: Float32Array = this.worldMatrix.elements;
		right.x = worldMatElem[0];
		right.y = worldMatElem[1];
		right.z = worldMatElem[2];
	}

	/**
	 * @en Look at a target position.
	 * @param target The target to look at.
	 * @param up The up vector.
	 * @param isLocal Whether to use local space. Default is false.
	 * @param isCamera Whether it's a camera. Default is true.
	 * @zh 观察目标位置。
	 * @param target 观察目标。
	 * @param up 向上向量。
	 * @param isLocal 是否局部空间。默认为 false。
	 * @param isCamera 是否为相机。默认为 true。
	 */
	lookAt(target: Vector3, up: Vector3, isLocal: boolean = false, isCamera: boolean = true): void {
		var eye: Vector3;
		if (isLocal) {
			eye = this.localPosition;
			if (Math.abs(eye.x - target.x) < MathUtils3D.zeroTolerance && Math.abs(eye.y - target.y) < MathUtils3D.zeroTolerance && Math.abs(eye.z - target.z) < MathUtils3D.zeroTolerance)
				return;
			if (isCamera) {
				Quaternion.lookAt(this.localPosition, target, up, this._localRotation);
				this._localRotation.invert(this._localRotation);
			} else {
				Vector3.subtract(this.localPosition, target, _tempVector30);
				Quaternion.rotationLookAt(_tempVector30, up, this._localRotation);
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
				Vector3.subtract(this.position, target, _tempVector30);
				Quaternion.rotationLookAt(_tempVector30, up, this._rotation);
				this._rotation.invert(this._rotation);
			}
			this.rotation = this._rotation;
		}
	}

	/**
	 * @en Make the object face towards a target.
	 * @param target The target position to face.
	 * @param up The up vector.
	 * @param isLocal Whether to use local space. Default is false.
	 * @zh 对象朝向目标。
	 * @param target 朝向目标位置。
	 * @param up 向上向量。
	 * @param isLocal 是否局部空间。默认为 false。
	 */
	objLookat(target: Vector3, up: Vector3, isLocal: boolean = false): void {
		this.lookAt(target, up, isLocal, false);
	}



	/**
	 * @en The world scale.
	 * Under certain conditions, obtaining this value may not be accurate (e.g., when the parent node has scaling and the child node has rotation). 
	 * The scaling may be skewed and cannot be correctly represented using Vector3. A Matrix3x3 matrix must be used for correct representation.
	 * @returns The world scale.
	 * @zh 世界缩放。
	 * 某种条件下获取该值可能不正确（例如：父节点有缩放，子节点有旋转）。
	 * 缩放会倾斜，无法使用Vector3正确表示，必须使用Matrix3x3矩阵才能正确表示。
	 * @returns 世界缩放。
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
	 * @en Set the world scale.
	 * Under certain conditions, setting this value may not be accurate (e.g., when the parent node has scaling and the child node has rotation). 
	 * The scaling may be skewed and cannot be correctly represented using Vector3. A Matrix3x3 matrix must be used for correct representation.
	 * @param value The world scale to set.
	 * @return The world scale.
	 * @zh 设置世界缩放。
	 * 某种条件下设置该值可能不正确（例如：父节点有缩放，子节点有旋转）。
	 * 缩放会倾斜，无法使用Vector3正确表示，必须使用Matrix3x3矩阵才能正确表示。
	 * @param value 要设置的世界缩放。
	 * @return	世界缩放。
	 */
	setWorldLossyScale(value: Vector3) {
		if (this._parent !== null) {
			var scaleMat: Matrix3x3 = _tempMatrix3x33;
			var localScaleMat: Matrix3x3 = _tempMatrix3x33;
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

	/**
	 * @en Transform a local vector to global space.
	 * @param value The local vector to transform.
	 * @param out The output global vector.
	 * @zh 将局部向量转换为全局向量。
	 * @param value 要转换的局部向量。
	 * @param out 输出的全局向量。
	 */
	localToGlobal(value: Vector3, out: Vector3): void {
		Vector3.transformV3ToV3(value, this.worldMatrix, out);
	}

	/**
	 * @en Transform a global position to local space.
	 * @param pos The world position to transform.
	 * @param out The output local position.
	 * @zh 将世界坐标转换为局部坐标。
	 * @param pos 要转换的世界坐标。
	 * @param out 输出的局部坐标。
	 */
	globalToLocal(pos: Vector3, out: Vector3): void {
		this.worldMatrix.invert(_tempMatrix0);
		Vector3.transformV3ToV3(pos, _tempMatrix0, out);
	}

	/**
	 * @en Transform a global normal vector to local space.
	 * @param pos The global normal vector to transform.
	 * @param out The output local normal vector.
	 * @zh 将全局法线向量转换为局部空间。
	 * @param pos 要转换的全局法线向量。
	 * @param out 输出的局部法线向量。
	 */
	toLocalNormal(pos: Vector3, out: Vector3): void {
		this.worldMatrix.invert(_tempMatrix0);
		Vector3.TransformNormal(pos, _tempMatrix0, out);
	}

	/**
	 * @en Rotate to face a specified direction.
	 * @param forward The forward vector.
	 * @param dir The target direction to face.
	 * @zh 朝向指定方向。
	 * @param forward 前向向量。
	 * @param dir 目标朝向方向。
	 */
	toDir(forward: Vector3, dir: Vector3) {
		this.rotationTo(this.rotation, forward, dir);
		this.rotation = this.rotation;
	}

	/**
	 * @en This is a function from glmatrix. Sets a quaternion to represent the shortest rotation from one vector to another.
	 * Both vectors are assumed to be unit length.
	 * @param out The receiving quaternion.
	 * @param a The initial vector (normalized).
	 * @param b The destination vector (normalized).
	 * @returns {boolean} True if a rotation was applied, false if the vectors are already aligned.
	 * @zh 这是一个 glmatrix 中的函数。设置一个四元数来表示从一个向量到另一个向量的最短旋转。
	 * 假设两个向量都是单位长度。
	 * @param out 接收结果的四元数。
	 * @param a 初始向量（已归一化）。
	 * @param b 目标向量（已归一化）。
	 * @returns {boolean} 如果应用了旋转则返回 true，如果向量已经对齐则返回 false。
	 */
	rotationTo(out: Quaternion, a: Vector3, b: Vector3): boolean {
		var dot: number = Vector3.dot(a, b);
		if (dot < -0.999999) {// 180度了，可以选择多个轴旋转
			Vector3.cross(Vector3.UnitX, a, tmpVec3);
			if (Vector3.scalarLength(tmpVec3) < 0.000001)
				Vector3.cross(Vector3.UnitY, a, tmpVec3);
			Vector3.normalize(tmpVec3, tmpVec3);
			Quaternion.createFromAxisAngle(tmpVec3, Math.PI, out);
			return true
		} else if (dot > 0.999999) {// 没有变化
			out.x = 0;
			out.y = 0;
			out.z = 0;
			out.w = 1;
			return false;
		} else {
			// 下面是求这个四元数，这是一个简化求法，根据cos(a/2)=√((1+dot)/2), cos(a/2)sin(a/2)=sin(a)/2 就能推导出来
			Vector3.cross(a, b, tmpVec3);
			out.x = tmpVec3.x;
			out.y = tmpVec3.y;
			out.z = tmpVec3.z;
			out.w = 1 + dot;
			out.normalize(out);
			return true;
		}
	}

	//----------------------------------------Discard-------------------------------------------------
	/**
	 * 世界坐标系缩放。
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
}

const _tempVector30: Vector3 = new Vector3();
const _tempQuaternion0: Quaternion = new Quaternion();
const _tempMatrix0: Matrix4x4 = new Matrix4x4();
const _tempMatrix3x30: Matrix3x3 = new Matrix3x3();
const _tempMatrix3x31: Matrix3x3 = new Matrix3x3();
const _tempMatrix3x32: Matrix3x3 = new Matrix3x3();
const _tempMatrix3x33: Matrix3x3 = new Matrix3x3();
const tmpVec3: Vector3 = new Vector3();