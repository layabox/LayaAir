import { Component } from "./Component";
import { Event } from "../events/Event";
import { ILaya } from "../../ILaya";
/**
 * <code>Script</code> 类用于创建脚本的父类，该类为抽象类，不允许实例。
 * 组件的生命周期
 */
export class Script extends Component {
    /**
     * @inheritDoc
     */
    /*override*/ get isSingleton() {
        return false;
    }
    /**
     * @inheritDoc
     */
    /*override*/ _onAwake() {
        this.onAwake();
        if (this.onStart !== Script.prototype.onStart) {
            ILaya.startTimer.callLater(this, this.onStart);
        }
    }
    /**
     * @inheritDoc
     */
    /*override*/ _onEnable() {
        var proto = Script.prototype;
        if (this.onTriggerEnter !== proto.onTriggerEnter) {
            this.owner.on(Event.TRIGGER_ENTER, this, this.onTriggerEnter);
        }
        if (this.onTriggerStay !== proto.onTriggerStay) {
            this.owner.on(Event.TRIGGER_STAY, this, this.onTriggerStay);
        }
        if (this.onTriggerExit !== proto.onTriggerExit) {
            this.owner.on(Event.TRIGGER_EXIT, this, this.onTriggerExit);
        }
        if (this.onMouseDown !== proto.onMouseDown) {
            this.owner.on(Event.MOUSE_DOWN, this, this.onMouseDown);
        }
        if (this.onMouseUp !== proto.onMouseUp) {
            this.owner.on(Event.MOUSE_UP, this, this.onMouseUp);
        }
        if (this.onClick !== proto.onClick) {
            this.owner.on(Event.CLICK, this, this.onClick);
        }
        if (this.onStageMouseDown !== proto.onStageMouseDown) {
            ILaya.stage.on(Event.MOUSE_DOWN, this, this.onStageMouseDown);
        }
        if (this.onStageMouseUp !== proto.onStageMouseUp) {
            ILaya.stage.on(Event.MOUSE_UP, this, this.onStageMouseUp);
        }
        if (this.onStageClick !== proto.onStageClick) {
            ILaya.stage.on(Event.CLICK, this, this.onStageClick);
        }
        if (this.onStageMouseMove !== proto.onStageMouseMove) {
            ILaya.stage.on(Event.MOUSE_MOVE, this, this.onStageMouseMove);
        }
        if (this.onDoubleClick !== proto.onDoubleClick) {
            this.owner.on(Event.DOUBLE_CLICK, this, this.onDoubleClick);
        }
        if (this.onRightClick !== proto.onRightClick) {
            this.owner.on(Event.RIGHT_CLICK, this, this.onRightClick);
        }
        if (this.onMouseMove !== proto.onMouseMove) {
            this.owner.on(Event.MOUSE_MOVE, this, this.onMouseMove);
        }
        if (this.onMouseOver !== proto.onMouseOver) {
            this.owner.on(Event.MOUSE_OVER, this, this.onMouseOver);
        }
        if (this.onMouseOut !== proto.onMouseOut) {
            this.owner.on(Event.MOUSE_OUT, this, this.onMouseOut);
        }
        if (this.onKeyDown !== proto.onKeyDown) {
            ILaya.stage.on(Event.KEY_DOWN, this, this.onKeyDown);
        }
        if (this.onKeyPress !== proto.onKeyPress) {
            ILaya.stage.on(Event.KEY_PRESS, this, this.onKeyPress);
        }
        if (this.onKeyUp !== proto.onKeyUp) {
            ILaya.stage.on(Event.KEY_UP, this, this.onKeyUp);
        }
        if (this.onUpdate !== proto.onUpdate) {
            ILaya.updateTimer.frameLoop(1, this, this.onUpdate);
        }
        if (this.onLateUpdate !== proto.onLateUpdate) {
            ILaya.lateTimer.frameLoop(1, this, this.onLateUpdate);
        }
        if (this.onPreRender !== proto.onPreRender) {
            ILaya.lateTimer.frameLoop(1, this, this.onPreRender);
        }
    }
    /**
     * @inheritDoc
     */
    /*override*/ _onDisable() {
        this.owner.offAllCaller(this);
        ILaya.stage.offAllCaller(this);
        ILaya.startTimer.clearAll(this);
        ILaya.updateTimer.clearAll(this);
        ILaya.lateTimer.clearAll(this);
    }
    /**
     * @internal
     */
    /*override*/ _isScript() {
        return true;
    }
    /**
     * @inheritDoc
     */
    /*override*/ _onDestroy() {
        this.onDestroy();
    }
    /**
     * 组件被激活后执行，此时所有节点和组件均已创建完毕，次方法只执行一次
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onAwake() {
    }
    /**
     * 组件被启用后执行，比如节点被添加到舞台后
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onEnable() {
    }
    /**
     * 第一次执行update之前执行，只会执行一次
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onStart() {
    }
    /**
     * 开始碰撞时执行
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onTriggerEnter(other, self, contact) {
    }
    /**
     * 持续碰撞时执行
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onTriggerStay(other, self, contact) {
    }
    /**
     * 结束碰撞时执行
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onTriggerExit(other, self, contact) {
    }
    /**
     * 鼠标按下时执行
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onMouseDown(e) {
    }
    /**
     * 鼠标抬起时执行
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onMouseUp(e) {
    }
    /**
     * 鼠标点击时执行
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onClick(e) {
    }
    /**
     * 鼠标在舞台按下时执行
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onStageMouseDown(e) {
    }
    /**
     * 鼠标在舞台抬起时执行
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onStageMouseUp(e) {
    }
    /**
     * 鼠标在舞台点击时执行
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onStageClick(e) {
    }
    /**
     * 鼠标在舞台移动时执行
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onStageMouseMove(e) {
    }
    /**
     * 鼠标双击时执行
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onDoubleClick(e) {
    }
    /**
     * 鼠标右键点击时执行
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onRightClick(e) {
    }
    /**
     * 鼠标移动时执行
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onMouseMove(e) {
    }
    /**
     * 鼠标经过节点时触发
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onMouseOver(e) {
    }
    /**
     * 鼠标离开节点时触发
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onMouseOut(e) {
    }
    /**
     * 键盘按下时执行
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onKeyDown(e) {
    }
    /**
     * 键盘产生一个字符时执行
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onKeyPress(e) {
    }
    /**
     * 键盘抬起时执行
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onKeyUp(e) {
    }
    /**
     * 每帧更新时执行，尽量不要在这里写大循环逻辑或者使用getComponent方法
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onUpdate() {
    }
    /**
     * 每帧更新时执行，在update之后执行，尽量不要在这里写大循环逻辑或者使用getComponent方法
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onLateUpdate() {
    }
    /**
     * 渲染之前执行
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onPreRender() {
    }
    /**
     * 渲染之后执行
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onPostRender() {
    }
    /**
     * 组件被禁用时执行，比如从节点从舞台移除后
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onDisable() {
    }
    /**
     * 手动调用节点销毁时执行
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onDestroy() {
    }
}
