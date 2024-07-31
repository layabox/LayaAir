import { Component } from "./Component";
import { Event } from "../events/Event"
import { Collision } from "../d3/physics/Collision";
import { PhysicsColliderComponent } from "../d3/physics/PhysicsColliderComponent";
import { ColliderBase } from "../physics/Collider2D/ColliderBase";
import { Sprite3D } from "../d3/core/Sprite3D";
import { Sprite } from "../display/Sprite";
import { ILaya } from "../../ILaya";

/**
 * @en The Script class is used to create the parent class of a script, which is an abstract class and does not allow instances.
 * @zh Script 类用于创建脚本的父类，该类为抽象类，不允许实例。
 */
export class Script extends Component {
    /**
     * @en Script belonging to sprite
     * @zh 脚本所属精灵
     */
    declare owner: Sprite | Sprite3D;

    /**
     * @internal
     * @override
     */
    _isScript(): boolean {
        return true;
    }

    /**
     * @internal
     * 设置脚本
     */
    protected setupScript(): void {
        let owner = this.owner;
        let func: Function;

        if (!(this.onTriggerEnter == Script.prototype.onTriggerEnter)) owner.on(Event.TRIGGER_ENTER, this, this.onTriggerEnter);
        if (!(this.onTriggerStay == Script.prototype.onTriggerStay)) owner.on(Event.TRIGGER_STAY, this, this.onTriggerStay);
        if (!(this.onTriggerExit == Script.prototype.onTriggerExit)) owner.on(Event.TRIGGER_EXIT, this, this.onTriggerExit);

        if (!(this.onCollisionEnter == Script.prototype.onCollisionEnter)) owner.on(Event.COLLISION_ENTER, this, this.onCollisionEnter);
        if (!(this.onCollisionStay == Script.prototype.onCollisionStay)) owner.on(Event.COLLISION_STAY, this, this.onCollisionStay);
        if (!(this.onCollisionExit == Script.prototype.onCollisionExit)) owner.on(Event.COLLISION_EXIT, this, this.onCollisionExit);
        if (func = this.onJointBreak) owner.on(Event.JOINT_BREAK, this, func);

        if (func = this.onMouseDown) owner.on(Event.MOUSE_DOWN, this, func);
        if (func = this.onMouseUp) owner.on(Event.MOUSE_UP, this, func);
        if (func = this.onRightMouseDown) owner.on(Event.RIGHT_MOUSE_DOWN, this, func);
        if (func = this.onRightMouseUp) owner.on(Event.RIGHT_MOUSE_UP, this, func);
        if (func = this.onMouseMove) owner.on(Event.MOUSE_MOVE, this, func);
        if (func = this.onMouseDrag) owner.on(Event.MOUSE_DRAG, this, func);
        if (func = this.onMouseDragEnd) owner.on(Event.MOUSE_DRAG_END, this, func);
        if (func = this.onMouseOver) owner.on(Event.MOUSE_OVER, this, func);
        if (func = this.onMouseOut) owner.on(Event.MOUSE_OUT, this, func);
        if (func = this.onMouseClick) owner.on(Event.CLICK, this, func);
        if (func = this.onMouseDoubleClick) owner.on(Event.DOUBLE_CLICK, this, func);
        if (func = this.onMouseRightClick) owner.on(Event.RIGHT_CLICK, this, func);

        if (func = this.onKeyDown) ILaya.stage.on(Event.KEY_DOWN, this, func);
        if (func = this.onKeyPress) ILaya.stage.on(Event.KEY_PRESS, this, func);
        if (func = this.onKeyUp) ILaya.stage.on(Event.KEY_UP, this, func);
        owner.event(Event._Add_Script);
    }


    /**
     * @en Called when a 3D physics trigger event or a 2D physics collision event begins.
     * @param other The collider component or base of the other object in the collision.
     * @param self The collider component or base of the object itself.
     * @param contact The contact point information.
     * @zh 开始碰撞时执行的3D物理触发器事件或2D物理碰撞事件。
     * @param other 其他对象的碰撞器组件。
     * @param self 自身的碰撞器组件。
     * @param contact 接触点信息。
     */
    onTriggerEnter?(other: PhysicsColliderComponent | ColliderBase, self?: ColliderBase, contact?: any): void;

    /**
     * @en Called during the frame a 3D physics trigger event or a 2D physics collision event stays collided.
     * @param other The collider component or base of the other object in the collision.
     * @param self The collider component or base of the object itself, if not provided it's assumed to be the owner of the script.
     * @param contact The contact point information, can be any type depending on the physics engine used.
     * @zh 持续碰撞时执行的3D物理触发器事件或2D物理碰撞事件。
     * @param other 其他对象的碰撞器组件。
     * @param self 自身的碰撞器组件。
     * @param contact 接触点信息。
     */
    onTriggerStay?(other: PhysicsColliderComponent | ColliderBase, self?: ColliderBase, contact?: any): void;

    /**
     * @en Called when a 3D physics trigger event or a 2D physics collision event ends.
     * @param other The collider component or base of the other object in the collision.
     * @param self The collider component or base of the object itself.
     * @param contact The contact point information.
     * @zh 结束碰撞时执行的3D物理触发器事件或2D物理碰撞事件。
     * @param other 其他对象的碰撞器组件或基类。
     * @param self 自身的碰撞器组件或基类。
     * @param contact 接触点信息。
     */
    onTriggerExit?(other: PhysicsColliderComponent | ColliderBase, self?: ColliderBase, contact?: any): void;

    /**
     * @en Called when a 3D physics collider event begins (not applicable to 2D).
     * @param collision The collision.
     * @zh 3D物理碰撞器事件开始时调用（不适用于2D）。
     * @param collision 碰撞器。
     */
    onCollisionEnter?(collision: Collision): void;

    /**
     * @en Called during the frame a 3D physics collider event stays collided (not applicable to 2D).
     * @param collision The collision.
     * @zh 3D物理碰撞器事件持续碰撞时调用（不适用于2D）。
     * @param collision 碰撞器。
     */
    onCollisionStay?(collision: Collision): void;

    /**
     * @en Called when a 3D physics collider event ends (not applicable to 2D).
     * @param collision The collision.
     * @zh 3D物理碰撞器事件结束碰撞时调用（不适用于2D）。
     * @param collision 碰撞器。
     */
    onCollisionExit?(collision: Collision): void;

    /**
     * @en Called when a joint is broken in the physics simulation.
     * @zh 物理模拟中关节断裂时调用。
     */
    onJointBreak?(): void;

    /**
     * @en Called when the mouse button is pressed down on the node.
     * @param evt The mouse event.
     * @zh 鼠标按下时执行。
     * @param evt 鼠标事件。
     */
    onMouseDown?(evt: Event): void;

    /**
     * @en Called when the mouse button is released from the node.
     * @param evt The mouse event.
     * @zh 鼠标抬起时执行。
     * @param evt 鼠标事件。
     */
    onMouseUp?(evt: Event): void;

    /**
     * @en Called when the right or middle mouse button is pressed down.
     * @param evt The mouse event.
     * @zh 鼠标右键或中键按下时执行。
     * @param evt 鼠标事件。
     */
    onRightMouseDown?(evt: Event): void;

    /**
     * @en Called when the right or middle mouse button is released.
     * @param evt The mouse event.
     * @zh 鼠标右键或中键抬起时执行。
     * @param evt 鼠标事件。
     */
    onRightMouseUp?(evt: Event): void;

    /**
     * @en Called when the mouse moves over the node.
     * @param evt The mouse event.
     * @zh 鼠标在节点上移动时执行。
     * @param evt 鼠标事件。
     */
    onMouseMove?(evt: Event): void;

    /**
     * @en Called when the mouse enters the node boundaries.
     * @param evt The mouse event.
     * @zh 鼠标进入节点时执行。
     * @param evt 鼠标事件。
     */
    onMouseOver?(evt: Event): void;

    /**
     * @en Called when the mouse leaves the node boundaries.
     * @param evt The mouse event.
     * @zh 鼠标离开节点时执行。
     * @param evt 鼠标事件。
     */
    onMouseOut?(evt: Event): void;

    /**
     * @en Called when the mouse is held down and an object is dragged.
     * @param evt The mouse event.
     * @zh 鼠标按住一个物体后，拖拽时执行。
     * @param evt 鼠标事件。
     */
    onMouseDrag?(evt: Event): void;

    /**
     * @en Called when the mouse button is released after dragging an object.
     * @param evt The mouse event.
     * @zh 鼠标按住一个物体，拖拽一定距离，释放鼠标按键后执行。
     * @param evt 鼠标事件。
     */
    onMouseDragEnd?(evt: Event): void;

    /**
     * @en Called when the mouse button is clicked (pressed and released) on the node.
     * @param evt The mouse event.
     * @zh 鼠标点击时执行。
     * @param evt 鼠标事件。
     */
    onMouseClick?(evt: Event): void;

    /**
     * @en Called when the mouse button is double-clicked on the node.
     * @param evt The mouse event.
     * @zh 鼠标双击时执行。
     * @param evt 鼠标事件。
     */
    onMouseDoubleClick?(evt: Event): void;

    /**
     * @en Called when the right mouse button is clicked on the node.
     * @param evt The mouse event.
     * @zh 鼠标右键点击时执行。
     * @param evt 鼠标事件。
     */
    onMouseRightClick?(evt: Event): void;

    /**
     * @en Called when a key is pressed down.
     * @param evt The keyboard event.
     * @zh 键盘按下时执行。
     * @param evt 键盘事件。
     */
    onKeyDown?(evt: Event): void;

    /**
     * @en Called when a key is pressed and holds long enough to generate a character.
     * @param evt The keyboard event.
     * @zh 键盘产生一个字符时执行。
     * @param evt 键盘事件。
     */
    onKeyPress?(evt: Event): void;

    /**
     * @en Called when a key is released.
     * @param evt The keyboard event.
     * @zh 键盘抬起时执行。
     * @param evt 键盘事件。
     */
    onKeyUp?(evt: Event): void;
}

