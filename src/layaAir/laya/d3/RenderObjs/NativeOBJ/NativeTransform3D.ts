import { EventDispatcher } from "../../../events/EventDispatcher";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { NativeMemory } from "../../../RenderEngine/RenderEngine/NativeGLEngine/CommonMemory/NativeMemory";
import { Sprite3D } from "../../core/Sprite3D";
import { Transform3D } from "../../core/Transform3D";

/**
 * <code>Transform3D</code> 类用于实现3D变换。
 */
export class NativeTransform3D  extends Transform3D {

    static MemoryBlock_size: number = 16 * 4;

    /**native Share Memory */
    private nativeMemory: NativeMemory;
    private float32Array: Float32Array;
	private float64Array: Float64Array;
    private int32Array: Int32Array;
	private eventDispatcher: EventDispatcher;
    _nativeObj: any;

	/**
	 * @internal
	 */
	get _isFrontFaceInvert(): boolean {
        return this._nativeObj._isFrontFaceInvert;
	}

	/**
	 * 所属精灵。
	 */
	get owner(): Sprite3D {
		return this._owner;
	}

	/**
	 * 局部位置X轴分量。
	 */
	get localPositionX(): number {
		return this.localPosition.x;
	}

	set localPositionX(x: number) {
		this._localPosition.x = x;
		this.localPosition = this._localPosition;
	}

	/**
	 * 局部位置Y轴分量。
	 */
	get localPositionY(): number {
		return this.localPosition.y;
	}

	set localPositionY(y: number) {
		this._localPosition.y = y;
		this.localPosition = this._localPosition;
	}

	/**
	 * 局部位置Z轴分量。
	 */
	get localPositionZ(): number {
		return this.localPosition.z;
	}

	set localPositionZ(z: number) {
		this._localPosition.z = z;
		this.localPosition = this._localPosition;
	}

	/**
	 * 局部位置。
	 */
	get localPosition(): Vector3 {
        if (this._nativeObj.getLocalPosition()) {
        	this._localPosition.x = this.float64Array[0];
       	 	this._localPosition.y = this.float64Array[1];
        	this._localPosition.z = this.float64Array[2];
		}
		return this._localPosition;
	}

	set localPosition(value: Vector3) {
        this._localPosition.x = this.float64Array[0] = value.x;
        this._localPosition.y = this.float64Array[1] = value.y;
        this._localPosition.z = this.float64Array[2] = value.z;
		this._nativeObj.setLocalPosition();
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
        if (this._nativeObj.getLocalRotation()) {
        	this._localRotation.x = this.float64Array[0];
        	this._localRotation.y = this.float64Array[1];
        	this._localRotation.z = this.float64Array[2];
        	this._localRotation.w = this.float64Array[3];
		}
		return this._localRotation;
	}

	set localRotation(value: Quaternion) {
        this._localRotation.x = this.float64Array[0] = value.x;
        this._localRotation.y = this.float64Array[1] = value.y;
        this._localRotation.z = this.float64Array[2] = value.z;
        this._localRotation.w = this.float64Array[3] = value.w;
		this._nativeObj.setLocalRotation();
	}

	/**
	 * 局部缩放X。
	 */
	get localScaleX(): number {
		return this.localScale.x;
	}

	set localScaleX(value: number) {
		this._localScale.x = value;
		this.localScale = this._localScale;
	}

	/**
	 * 局部缩放Y。
	 */
	get localScaleY(): number {
		return this.localScale.y;
	}

	set localScaleY(value: number) {
		this._localScale.y = value;
		this.localScale = this._localScale;
	}

	/**
	 * 局部缩放Z。
	 */
	get localScaleZ(): number {
		return this.localScale.z;
	}

	set localScaleZ(value: number) {
		this._localScale.z = value;
		this.localScale = this._localScale;
	}

	/**
	 * 局部缩放。
	 */
	get localScale(): Vector3 {
        if (this._nativeObj.getLocalScale())
		{
        	this._localScale.x = this.float64Array[0];
        	this._localScale.y = this.float64Array[1];
        	this._localScale.z = this.float64Array[2];
		}
		return this._localScale;
	}

	set localScale(value: Vector3) {
		this._localScale.x = this.float64Array[0] = value.x;
        this._localScale.y = this.float64Array[1] = value.y;
        this._localScale.z = this.float64Array[2] = value.z;
		this._nativeObj.setLocalScale();
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
		if (this._nativeObj.getLocalRotationEuler()) {
        	this._localRotationEuler.x = this.float64Array[0];
       	 	this._localRotationEuler.y = this.float64Array[1];
        	this._localRotationEuler.z = this.float64Array[2];
		}
		return this._localRotationEuler;
	}

	set localRotationEuler(value: Vector3) {
		this._localRotationEuler.x = this.float64Array[0] = value.x;
        this._localRotationEuler.y = this.float64Array[1] = value.y;
        this._localRotationEuler.z = this.float64Array[2] = value.z;
		this._nativeObj.setLocalRotationEuler();
	}

	/**
	 * 局部矩阵。
	 */
	get localMatrix(): Matrix4x4 {
        if (this._nativeObj.getLocalMatrix()) {
        	for (var i = 0; i < 16; ++i) {
				this._localMatrix.elements[i] = this.float32Array[i];
			}
		}
		return this._localMatrix;
	}

	set localMatrix(value: Matrix4x4) {
		if (this._localMatrix !== value)
			value.cloneTo(this._localMatrix);
        this.float32Array.set(value.elements);
		this._nativeObj.setLocalMatrix();
	}

	/**
	 * 世界位置。
	 */
	get position(): Vector3 {  
        if (this._nativeObj.getPosition()) {
        	this._position.x = this.float64Array[0];
        	this._position.y = this.float64Array[1];
        	this._position.z = this.float64Array[2];
		}
		return this._position;
	}

	set position(value: Vector3) {
        this._position.x = this.float64Array[0] = value.x;
        this._position.y = this.float64Array[1] = value.y;
        this._position.z = this.float64Array[2] = value.z;
		this._nativeObj.setPosition();
	}

	/**
	 * 世界旋转。
	 */
	get rotation(): Quaternion {
		if (this._nativeObj.getRotation()) {
        	this._rotation.x = this.float64Array[0];
        	this._rotation.y = this.float64Array[1];
        	this._rotation.z = this.float64Array[2];
        	this._rotation.w = this.float64Array[3];
		}
		return this._rotation;
	}

	set rotation(value: Quaternion) {
        this._rotation.x = this.float64Array[0] = value.x;
        this._rotation.y = this.float64Array[1] = value.y;
        this._rotation.z = this.float64Array[2] = value.z;
        this._rotation.w = this.float64Array[3] = value.w;
		this._nativeObj.setRotation();
	}


	/**
	 * 世界空间的旋转角度，顺序为x、y、z。
	 */
	get rotationEuler(): Vector3 {
		if (this._nativeObj.getRotationEuler()) {
        	this._rotationEuler.x = this.float64Array[0];
        	this._rotationEuler.y = this.float64Array[1];
        	this._rotationEuler.z = this.float64Array[2];
		}
		return this._rotationEuler;
	}

	set rotationEuler(value: Vector3) {
		this._rotationEuler.x = this.float64Array[0] = value.x;
        this._rotationEuler.y = this.float64Array[1] = value.y;
        this._rotationEuler.z = this.float64Array[2] = value.z;
		this._nativeObj.setRotationEuler();
	}

	/**
	 * 世界矩阵。
	 */
	get worldMatrix(): Matrix4x4 {
		if (this._nativeObj.getWorldMatrix()) {
        	for (var i = 0; i < 16; i++) {
				this._worldMatrix.elements[i] = this.float32Array[i];
			}
		}
		return this._worldMatrix;
	}

	set worldMatrix(value: Matrix4x4) {
		if (this._worldMatrix !== value)
			value.cloneTo(this._worldMatrix);
        this.float32Array.set(value.elements);
		this._nativeObj.setWorldMatrix();
	}

	/**
	 * 创建一个 <code>Transform3D</code> 实例。
	 * @param owner 所属精灵。
	 */
	constructor(owner: Sprite3D) {
		super(owner);
        //native memory
        this.nativeMemory = new NativeMemory(NativeTransform3D.MemoryBlock_size, true);
        this.float32Array = this.nativeMemory.float32Array;
		this.float64Array = this.nativeMemory.float64Array;
        this.int32Array = this.nativeMemory.int32Array;
		this.eventDispatcher = new EventDispatcher();
        this._nativeObj = new (window as any).conchTransform(this.nativeMemory._buffer, this.eventDispatcher.event.bind(this.eventDispatcher));
	}

	/**
	 * @internal
	 */
	 _setTransformFlag(type: number, value: boolean): void {
		this._nativeObj && this._nativeObj._setTransformFlag(type, value);
	}

	/**
	 * @internal
	 */
	_getTransformFlag(type: number): boolean {
		return this._nativeObj._getTransformFlag(type);
	}

	/**
	 * @internal
	 */
	_setParent(value: Transform3D): void {
        this._nativeObj.setParent(value ? (value as any)._nativeObj : null);
	}

	/**
	 * 平移变换。
	 * @param 	translation 移动距离。
	 * @param 	isLocal 是否局部空间。
	 */
	translate(translation: Vector3, isLocal: boolean = true): void {
		this.float64Array[0] = translation.x;
        this.float64Array[1] = translation.y;
        this.float64Array[2] = translation.z;
        this.int32Array[6] = isLocal ? 1 : 0;
		this._nativeObj.translate();
	}

	/**
	 * 旋转变换。
	 * @param 	rotations 旋转幅度。
	 * @param 	isLocal 是否局部空间。
	 * @param 	isRadian 是否弧度制。
	 */
	rotate(rotation: Vector3, isLocal: boolean = true, isRadian: boolean = true): void {
		this.float64Array[0] = rotation.x;
        this.float64Array[1] = rotation.y;
        this.float64Array[2] = rotation.z;
        this.int32Array[6] = isLocal ? 1 : 0;
        this.int32Array[7] = isRadian ? 1 : 0;
		this._nativeObj.rotate();
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
	lookAt(target: Vector3, up: Vector3, isLocal: boolean = false,isCamera:boolean = true): void {
		this.float64Array[0] = target.x;
        this.float64Array[1] = target.y;
        this.float64Array[2] = target.z;
        this.float64Array[3] = up.x;
        this.float64Array[4] = up.y;
        this.float64Array[5] = up.z;
        this.int32Array[12] = isLocal ? 1 : 0;
        this.int32Array[13] = isCamera ? 1 : 0;
		this._nativeObj.lookAt();
	}

	/**
	 * 对象朝向目标
	 * @param target 
	 * @param up 
	 * @param isLocal 
	 */
	objLookat(target: Vector3, up: Vector3, isLocal: boolean = false):void{

	}

	

	/**
	 * 世界缩放。
	 * 某种条件下获取该值可能不正确（例如：父节点有缩放，子节点有旋转），缩放会倾斜，无法使用Vector3正确表示,必须使用Matrix3x3矩阵才能正确表示。
	 * @return	世界缩放。
	 */
	getWorldLossyScale(): Vector3 {
        if (this._nativeObj.getWorldLossyScale()) {
        	this._scale.x = this.float64Array[0];
        	this._scale.y = this.float64Array[1];
        	this._scale.z = this.float64Array[2];
		}
		return this._scale;
	}

	/**
	 * 设置世界缩放。
	 * 某种条件下设置该值可能不正确（例如：父节点有缩放，子节点有旋转），缩放会倾斜，无法使用Vector3正确表示,必须使用Matrix3x3矩阵才能正确表示。
	 * @return	世界缩放。
	 */
	setWorldLossyScale(value: Vector3) {
		this._scale.x = this.float64Array[0] = value.x;
        this._scale.y = this.float64Array[1] = value.y;
        this._scale.z = this.float64Array[2] = value.z;
		this._nativeObj.setWorldLossyScale();
	}
	hasListener(type: string): boolean {
        return this.eventDispatcher.hasListener(type);
    }

    event(type: string, data?: any): boolean {
        return this.eventDispatcher.event(type, data);
    }

    on(type: string, listener: Function): EventDispatcher;
    on(type: string, caller: any, listener: Function, args?: any[]): EventDispatcher;
    on(type: string, caller: any, listener?: Function, args?: any[]): EventDispatcher {
		if (arguments.length == 2) {
            listener = caller;
            caller = null;
        }
		return this.eventDispatcher.on(type, caller, listener, args);
    }

    once(type: string, listener: Function): EventDispatcher;
    once(type: string, caller: any, listener: Function, args?: any[]): EventDispatcher;
    once(type: string, caller: any, listener?: Function, args?: any[]): EventDispatcher {
		if (arguments.length == 2) {
            listener = caller;
            caller = null;
        }
		return this.eventDispatcher.once(type, caller, listener, args);
    }

    off(type: string, listener: Function): EventDispatcher;
    off(type: string, caller: any, listener?: Function, args?: any[]): EventDispatcher;
    off(type: string, caller: any, listener?: Function): EventDispatcher {
		if (arguments.length == 2) {
            listener = caller;
            caller = null;
        }
		return this.eventDispatcher.off(type, caller, listener);
    }

    offAll(type?: string): EventDispatcher {
        return this.eventDispatcher.offAll(type);
    }

    offAllCaller(caller: any): EventDispatcher {
        return this.eventDispatcher.offAllCaller(caller);
    }
}


