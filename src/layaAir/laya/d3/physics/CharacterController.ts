import { Component } from "../../components/Component";
import { Vector3 } from "../../maths/Vector3";
import { Scene3D } from "../core/scene/Scene3D";
import { PhysicsColliderComponent } from "./PhysicsColliderComponent";
import { Laya3D } from "../../../Laya3D";
import { ICharacterController } from "../../Physics3D/interface/ICharacterController";
import { CapsuleColliderShape } from "./shape/CapsuleColliderShape";
import { ECharacterCapable } from "../../Physics3D/physicsEnum/ECharacterCapable";
import { EPhysicsCapable } from "../../Physics3D/physicsEnum/EPhycisCapable";
import { Event } from "../../events/Event";

/**
 * @en CharacterController class is used to create a character controller.
 * @zh CharacterController 类用于创建角色控制器。
 */
export class CharacterController extends PhysicsColliderComponent {

    /**@internal */
    protected _collider: ICharacterController;
    /** @internal */
    private _stepHeight: number = 0.1;
    /** @internal */
    private _upAxis = new Vector3(0, 1, 0);
    /**@internal */
    private _maxSlope = 90.0;	// 45度容易在地形上卡住
    /** @internal */
    private _gravity = new Vector3(0, -9.8, 0);
    /**@internal */
    private _radius: number = 0.5;
    /**@internal */
    private _height: number = 2;
    /**@internal */
    private _offset: Vector3 = new Vector3();
    /**@internal */
    private _contactOffset: number = 0.0;
    /**@internal */
    private _minDistance: number = 0;
    /**@internal */
    private _simGravity: Vector3 = new Vector3(0, -9.8 / 60, 0);
    /**@internal */
    private _pushForce: number = 1;
    /**@internal */
    private _jumpSpeed: number = 10.0;
    /**
     * @override
     * @internal
     */
    protected _initCollider() {
        this._physicsManager = (this.owner.scene as Scene3D).physicsSimulation;
        if (Laya3D.enablePhysics && this._physicsManager && Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.Physics_CharacterCollider)) {
            this._physicsManager = ((<Scene3D>this.owner._scene))._physicsManager;
            this._collider = Laya3D.PhysicsCreateUtil.createCharacterController(this._physicsManager);
            this.colliderShape = new CapsuleColliderShape(this.radius, this.height);
            this._collider.component = this;
        } else {
            console.error("CharacterController: cant enable CharacterController");
        }
    }

    protected _onAdded(): void {
        super._onAdded();
        this.radius = this._radius;
        this.height = this._height;
        this.gravity = this._gravity;
        this.minDistance = this._minDistance;
        this.pushForce = this._pushForce;
        this.centerOffset = this._offset;
        this.skinWidth = this._contactOffset;
        this.maxSlope = this._maxSlope;
        this.stepHeight = this._stepHeight;
        this.upAxis = this._upAxis;
    }

    /**
     * @ignore
     * @en The frame loop.
     * @zh 帧循环
     */
    onUpdate(): void {
        if (this._collider && this._collider.getCapable(ECharacterCapable.Character_SimulateGravity)) {
            // physX need to simulate character Gravity.
            this._simGravity.setValue(this._gravity.x / 60.0, this._gravity.y / 60.0, this._gravity.z / 60.0);
            this.move(this._simGravity);
        }
    }

    /**
     * @en The capsule radius.
     * @zh 胶囊碰撞形状的半径。
     */
    get radius(): number {
        return this._radius;
    }

    set radius(value: number) {
        this._radius = value;
        if (this._collider && this.collider.getCapable(ECharacterCapable.Character_Radius)) {
            this._collider.setRadius(this._radius);
            this._colliderShape && ((this._colliderShape as CapsuleColliderShape).radius = value);
        }
    }

    /**
     * @en The capsule height.
     * @zh 胶囊碰撞形状的高度。
     */
    get height(): number {
        return this._height;
    }

    set height(value: number) {
        this._height = value;
        if (this._collider && this.collider.getCapable(ECharacterCapable.Character_Height)) {
            this._collider.setHeight(this._height);
            this._colliderShape && ((this._colliderShape as CapsuleColliderShape).length = value);
        }
    }

    /**
     * @en The minimum step distance when a character moves using `move`. This feature is only effective in the PhysX engine.
     * @zh 角色移动（通过move）时的单步最小距离。该功能只在PhysX引擎中有效。
     **/
    get minDistance(): number {
        return this._minDistance;
    }

    set minDistance(value: number) {
        this._minDistance = value;
        if (this._collider && this.collider.getCapable(ECharacterCapable.Character_minDistance)) {
            this._collider.setminDistance(this._minDistance);
        }
    }

    /**
     * @en The center offset of the capsule.
     * @zh 胶囊碰撞形状的本地偏移
     */
    get centerOffset(): Vector3 {
        return this._offset;
    }
    set centerOffset(value: Vector3) {
        this._offset = value;
        if (this._collider && this.collider.getCapable(ECharacterCapable.Character_offset)) {
            this._collider.setShapelocalOffset(this._offset);
            this._colliderShape && ((this._colliderShape as CapsuleColliderShape).localOffset = value);
        }
    }


    /**
     * @en gravity.  The gravity will affect the movement of rigidbody, making it accelerate in a certain direction (usually downward, negative Y-axis) and simulate the free fall effect in real world.
     * The default gravity value is **(0, -9.8, 0)**, which means the object will fall with an acceleration of 9.8 m/s² downward.
     * @zh 重力。重力会影响刚体的运动，使其向某个方向（通常是向下，即 Y 轴负方向）持续加速，从而模拟真实世界中的自由落体效果。默认的重力值为 **(0, -9.8, 0)**，表示物体会以 9.8 m/s² 的加速度向下坠落
     */
    get gravity(): Vector3 {
        return this._gravity;
    }
    set gravity(value: Vector3) {
        this._gravity = value;
        if (this._collider && this.collider.getCapable(ECharacterCapable.Charcater_Gravity)) {
            this._collider.setGravity(value);
        }
    }

    /**
     * @en The skin width of the CharacterController.
     * - This property is only effective in the PhysX engine.
     * - It defines the distance between the collider surface and where collision detection actually occurs. This helps in triggering collision detection and response earlier, improving the stability and reliability of the object's physical simulation.
     * @zh 碰撞器外表的宽度;
     * - 该属性仅在 PhysX 引擎中有效。
     * - 用于定义碰撞器表面与实际发生碰撞检测的距离，用于提前触发碰撞检测和响应，从而提高物体在物理模拟中的稳定性和可靠性。
     */
    get skinWidth(): number {
        return this._contactOffset;
    }
    set skinWidth(value: number) {
        this._contactOffset = value;
        if (this._collider && this.collider.getCapable(ECharacterCapable.Character_Skin)) {
            this._collider.setSkinWidth(value);
        }
    }

    /**
     * @en The maximum slope angle that the character can climb.
     * If the slope angle exceeds the set value, the character will be unable to continue moving upward and may start sliding down or stop at the bottom of the slope.
     * @zh 角色行走的最大坡度（角度值）。
     * 如果坡度角度超过设定的值，角色将无法继续向上移动，可能会开始滑落或停在斜坡下方。
     */
    get maxSlope(): number {
        return this._maxSlope;
    }
    set maxSlope(value: number) {
        this._maxSlope = value;
        if (this._collider && this.collider.getCapable(ECharacterCapable.Character_SlopeLimit)) {
            this._collider.setSlopeLimit(value);
        }
    }

    /**
     * @en The height of the character's step. It represents the maximum height that the character can step over.
     * @zh 角色行走的脚步高度，表示角色能够跨越的最大台阶高度。
     */
    get stepHeight(): number {
        return this._stepHeight;
    }
    set stepHeight(value: number) {
        this._stepHeight = value;
        if (this._collider && this.collider.getCapable(ECharacterCapable.Charcater_StepOffset)) {
            this._collider.setStepOffset(value);
        }
    }

    /**
     * @deprecated
     * @zh 角色的向上轴, 由于和其它方法设置存在冲突, 为避免开发者误解, 废弃掉.
     */
    get upAxis(): Vector3 {
        return this._upAxis;
    }
    set upAxis(value: Vector3) {
        this._upAxis = value;
        if (this._collider && this.collider.getCapable(ECharacterCapable.Character_UpDirection)) {
            this._collider.setUpDirection(value);
        }
    }

    /**
     * @en The character's position.
     * @zh 角色位置
     */
    get position(): Vector3 {
        if (this._collider && this.collider.getCapable(ECharacterCapable.Charcater_WorldPosition)) {
            return this._collider.getPosition();
        } else {
            return null;
        }
    }
    set position(v: Vector3) {
        if (this._collider && this.collider.getCapable(ECharacterCapable.Charcater_WorldPosition)) {
            this._collider.setPosition(v);
        }
    }

    /**
     * @en The magnitude of the push force.
     * @zh 推动力的大小。
     */
    public get pushForce(): number {
        return this._pushForce;
    }
    public set pushForce(value: number) {
        this._pushForce = value;
        if (this._collider && this.collider.getCapable(ECharacterCapable.Character_PushForce)) {
            this._collider.setPushForce(value);
        }
    }

    /**
     * @deprecated
     * @zh 原本是用于jump没有设置值的时候,用于影响向上轴的跳跃速度与高度.考虑到建议在jump时设置速度,避免开发者的误解,所以废弃了这个属性.
     */
    public get jumpSpeed(): number {
        return this._jumpSpeed;
    }
    public set jumpSpeed(value: number) {
        this._jumpSpeed = value;
        if (this._collider && this.collider.getCapable(ECharacterCapable.Charcater_Jump)) {
            this._collider.setJumpSpeed(value);
        }
    }

    /**
     * @ignore
     */
    constructor() {
        super();
    }

    /**
     * @en Gets the vertical speed. 
     * - When the character performs a jump action, the vertical speed starts from a positive value (rising phase), then decreases to zero and finally becomes negative (falling phase). 
     * Developers can detect changes in vertical speed to determine whether the character is rising, at the peak or falling.
     * @zh 获取角色的垂直速度。
     * - 当角色执行跳跃动作时，垂直速度会从正值开始（上升阶段），然后逐渐减小到零，再变为负值（下落阶段）。
     * 开发者可以通过检测垂直速度的变化来判断角色处于上升、顶点或下落状态
     */
    getVerticalVel() {
        return this._collider ? this._collider.getVerticalVel() : 0;
    }

    /**
     * @en Moves the character by the specified movement vector. By continuously calling the `move` method and passing in a movement vector, the character will move in the specified direction and distance.
     * When you need to stop, not only stopping calling the move movement vector. But also resetting the move's movement vector to zero vector. Otherwise it will continue moving based on the last set vector
     * @param movement The movement vector.
     * @zh 通过指定移动向量移动角色。通过不断调用 `move` 方法并传入移动向量，角色会按照指定的方向和距离进行移动。
     * 当需要停止的时候，不仅仅是停止调用move移动向量。还要将move的移动向量重置为零向量。否则会一直基于最后一次设置的向量移动。
     * @param movement 移动向量。
     */
    move(movement: Vector3): void {
        if (this._collider && this.collider.getCapable(ECharacterCapable.Charcater_Move)) {
            this._collider.move(movement);
        }
    }

    /**
     * @en The jump vector, direction and height. 
     * It is usually the opposite direction of gravity (positive Y axis), and the absolute value is larger, the higher the single jump height.
     * @param velocity The jump vector, each axis's direction and height.
     * @zh 用于控制角色控制器的跳跃方向和高度，通常是重力相反的方向（Y轴正方向），绝对值越大，单次跳跃的高度越高。
     * @param velocity 跳跃向量，各轴的方向与高度。
     */
    jump(velocity: Vector3 = null): void {
        if (this._collider && this.collider.getCapable(ECharacterCapable.Charcater_Jump)) {
            if (velocity) {
                this._collider.jump(velocity);
            } else {
                // Utils3D._tempV0.set(0, this._jumpSpeed, 0)
                this._collider.jump(velocity);
            }
        }
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _cloneTo(dest: CharacterController): void {
        super._cloneTo(dest);
        dest.stepHeight = this._stepHeight;
        dest.upAxis = this._upAxis;
        dest.maxSlope = this._maxSlope;
        dest.gravity = this._gravity;
    }

    /**
     * @internal
     */
    protected _setEventFilter() {
        if (this._collider && this._collider.getCapable(ECharacterCapable.Character_EventFilter)) {
            this._eventsArray = [];
            // event 
            if (this.owner.hasListener(Event.COLLISION_ENTER)) {
                this._eventsArray.push(Event.COLLISION_ENTER);
            }
            if (this.owner.hasListener(Event.COLLISION_STAY)) {
                this._eventsArray.push(Event.COLLISION_STAY);
            }
            if (this.owner.hasListener(Event.COLLISION_EXIT)) {
                this._eventsArray.push(Event.COLLISION_EXIT);
            }
            this._collider.setEventFilter(this._eventsArray);
        }
    }
}

