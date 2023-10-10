import { Component } from "./Component";
import { Event } from "../events/Event"
import { Collision } from "../d3/physics/Collision";
import { PhysicsColliderComponent } from "../d3/physics/PhysicsColliderComponent";
import { ColliderBase } from "../physics/Collider2D/ColliderBase";
import { Sprite3D } from "../d3/core/Sprite3D";
import { Sprite } from "../display/Sprite";
import { ILaya } from "../../ILaya";

/**
 * <code>Script</code> 类用于创建脚本的父类，该类为抽象类，不允许实例。
 */
export class Script extends Component {
    declare owner: Sprite | Sprite3D;

    /**
     * @internal
     * @override
     */
    _isScript(): boolean {
        return true;
    }

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
     * 开始碰撞时执行
     */
    onTriggerEnter?(other: PhysicsColliderComponent | ColliderBase, self?: ColliderBase, contact?: any): void;

    /**
     * 持续碰撞时执行
     */
    onTriggerStay?(other: PhysicsColliderComponent | ColliderBase, self?: ColliderBase, contact?: any): void;

    /**
     * 结束碰撞时执行
     */
    onTriggerExit?(other: PhysicsColliderComponent | ColliderBase, self?: ColliderBase, contact?: any): void;

    /**
     * 开始碰撞时执行
     */
    onCollisionEnter?(collision: Collision): void;

    /**
     * 持续碰撞时执行
     */
    onCollisionStay?(collision: Collision): void;

    /**
     * 结束碰撞时执行
     */
    onCollisionExit?(collision: Collision): void;

    /**
     * 关节破坏时执行此方法
     */
    onJointBreak?(): void;

    /**
     * 鼠标按下时执行
     */
    onMouseDown?(evt: Event): void;

    /**
     * 鼠标抬起时执行
     */
    onMouseUp?(evt: Event): void;

    /**
     * 鼠标右键或中键按下时执行
     */
    onRightMouseDown?(evt: Event): void;

    /**
     * 鼠标右键或中键抬起时执行
     */
    onRightMouseUp?(evt: Event): void;

    /**
     * 鼠标在节点上移动时执行
     */
    onMouseMove?(evt: Event): void;

    /**
     * 鼠标进入节点时执行
     */
    onMouseOver?(evt: Event): void;

    /**
     * 鼠标离开节点时执行
     */
    onMouseOut?(evt: Event): void;

    /**
     * 鼠标按住一个物体后，拖拽时执行
     */
    onMouseDrag?(evt: Event): void;

    /**
     * 鼠标按住一个物体，拖拽一定距离，释放鼠标按键后执行
     */
    onMouseDragEnd?(evt: Event): void;

    /**
     * 鼠标点击时执行
     */
    onMouseClick?(evt: Event): void;

    /**
     * 鼠标双击时执行
     */
    onMouseDoubleClick?(evt: Event): void;

    /**
     * 鼠标右键点击时执行
     */
    onMouseRightClick?(evt: Event): void;

    /**
     * 键盘按下时执行
     */
    onKeyDown?(evt: Event): void;

    /**
     * 键盘产生一个字符时执行
     */
    onKeyPress?(evt: Event): void;

    /**
     * 键盘抬起时执行
     */
    onKeyUp?(evt: Event): void;
}

