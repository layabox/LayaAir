import { Component } from "./Component";
import { Event } from "../events/Event"
import { Collision } from "../d3/physics/Collision";
import { PhysicsComponent } from "../d3/physics/PhysicsComponent";
import { ColliderBase } from "../physics/ColliderBase";

/**
 * <code>Script</code> 类用于创建脚本的父类，该类为抽象类，不允许实例。
 */
export class Script extends Component {
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

        if (func = this.onTriggerEnter) owner.on(Event.TRIGGER_ENTER, this, func);
        if (func = this.onTriggerStay) owner.on(Event.TRIGGER_STAY, this, func);
        if (func = this.onTriggerExit) owner.on(Event.TRIGGER_EXIT, this, func);

        if (func = this.onCollisionEnter) owner.on(Event.COLLISION_ENTER, this, func);
        if (func = this.onCollisionStay) owner.on(Event.COLLISION_STAY, this, func);
        if (func = this.onCollisionExit) owner.on(Event.COLLISION_EXIT, this, func);
        if (func = this.onJointBreak) owner.on(Event.JOINT_BREAK, this, func);

        if (func = this.onMouseDown) owner.on(Event.MOUSE_DOWN, this, func);
        if (func = this.onMouseUp) owner.on(Event.MOUSE_UP, this, func);
        if (func = this.onMouseMove) owner.on(Event.MOUSE_MOVE, this, func);
        if (func = this.onMouseDrag) owner.on(Event.MOUSE_DRAG, this, func);
        if (func = this.onMouseDragEnd) owner.on(Event.MOUSE_DRAG_END, this, func);
        if (func = this.onMouseOver) owner.on(Event.MOUSE_OVER, this, func);
        if (func = this.onMouseOut) owner.on(Event.MOUSE_OUT, this, func);
        if (func = this.onMouseClick) owner.on(Event.CLICK, this, func);
        if (func = this.onMouseDoubleClick) owner.on(Event.DOUBLE_CLICK, this, func);
        if (func = this.onMouseRightClick) owner.on(Event.RIGHT_CLICK, this, func);

        if (func = this.onKeyDown) owner.on(Event.KEY_DOWN, this, func);
        if (func = this.onKeyPress) owner.on(Event.KEY_PRESS, this, func);
        if (func = this.onKeyUp) owner.on(Event.KEY_UP, this, func);
    }

    /**
     * 开始碰撞时执行
     */
    onTriggerEnter?(other: PhysicsComponent | ColliderBase, self?: ColliderBase, contact?: any): void;

    /**
     * 持续碰撞时执行
     */
    onTriggerStay?(other: PhysicsComponent | ColliderBase, self?: ColliderBase, contact?: any): void;

    /**
     * 结束碰撞时执行
     */
    onTriggerExit?(other: PhysicsComponent | ColliderBase, self?: ColliderBase, contact?: any): void;

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
     * 开始碰撞时执行
     */
    onTrigger2DEnter?(other: ColliderBase, self: ColliderBase, contact: any): void;

    /**
     * 持续碰撞时执行
     */
    onTrigger2DStay?(other: ColliderBase, self: ColliderBase, contact: any): void;

    /**
     * 结束碰撞时执行
     */
    onTrigger2DExit?(other: ColliderBase, self: ColliderBase, contact: any): void;

    /**
     * 鼠标按下时执行
     */
    onMouseDown?(evt: Event): void;

    /**
     * 鼠标抬起时执行
     */
    onMouseUp?(evt: Event): void;

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

