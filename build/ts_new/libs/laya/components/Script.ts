import { Component } from "./Component";
import { Event } from "../events/Event"
import { ILaya } from "../../ILaya";

/**
 * <code>Script</code> 类用于创建脚本的父类，该类为抽象类，不允许实例。
 * 组件的生命周期
 */
export class Script extends Component {
	/**
	 * @inheritDoc
	 * @override
	 */
	get isSingleton(): boolean {
		return false;
	}

	/**
	 * @internal
	 * @inheritDoc
	 * @override
	 */
	_onAwake(): void {
		this.onAwake();
		if (this.onStart !== Script.prototype.onStart) {
			ILaya.startTimer.callLater(this, this.onStart);
		}
	}

	/**
	 * @internal
	 * @inheritDoc
	 * @override
	 */
	_onEnable(): void {
		var proto: any = Script.prototype;
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
		this.onEnable();
	}

	/**
	 * @internal
	 * @inheritDoc
	 * @override
	 */
	protected _onDisable(): void {
		this.owner.offAllCaller(this);
		ILaya.stage.offAllCaller(this);
		ILaya.startTimer.clearAll(this);
		ILaya.updateTimer.clearAll(this);
		ILaya.lateTimer.clearAll(this);
	}

	/**
	 * @internal
	 * @override
	 */
	_isScript(): boolean {
		return true;
	}

	/**
	 * @internal
	 * @inheritDoc
	 * @override
	 */
	protected _onDestroy(): void {
		this.onDestroy();
	}

	/**
	 * 组件被激活后执行，此时所有节点和组件均已创建完毕，次方法只执行一次
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onAwake(): void {

	}

	/**
	 * 组件被启用后执行，比如节点被添加到舞台后
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onEnable(): void {

	}

	/**
	 * 第一次执行update之前执行，只会执行一次
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onStart(): void {

	}

	/**
	 * 开始碰撞时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onTriggerEnter(other: any, self: any, contact: any): void {

	}

	/**
	 * 持续碰撞时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onTriggerStay(other: any, self: any, contact: any): void {

	}

	/**
	 * 结束碰撞时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onTriggerExit(other: any, self: any, contact: any): void {

	}

	/**
	 * 鼠标按下时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onMouseDown(e: Event): void {

	}

	/**
	 * 鼠标抬起时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onMouseUp(e: Event): void {

	}

	/**
	 * 鼠标点击时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onClick(e: Event): void {

	}

	/**
	 * 鼠标在舞台按下时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onStageMouseDown(e: Event): void {

	}

	/**
	 * 鼠标在舞台抬起时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onStageMouseUp(e: Event): void {

	}

	/**
	 * 鼠标在舞台点击时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onStageClick(e: Event): void {

	}

	/**
	 * 鼠标在舞台移动时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onStageMouseMove(e: Event): void {

	}

	/**
	 * 鼠标双击时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onDoubleClick(e: Event): void {

	}

	/**
	 * 鼠标右键点击时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onRightClick(e: Event): void {

	}

	/**
	 * 鼠标移动时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onMouseMove(e: Event): void {

	}

	/**
	 * 鼠标经过节点时触发
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onMouseOver(e: Event): void {

	}

	/**
	 * 鼠标离开节点时触发
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onMouseOut(e: Event): void {

	}

	/**
	 * 键盘按下时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onKeyDown(e: Event): void {

	}

	/**
	 * 键盘产生一个字符时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onKeyPress(e: Event): void {

	}

	/**
	 * 键盘抬起时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onKeyUp(e: Event): void {

	}

	/**
	 * 每帧更新时执行，尽量不要在这里写大循环逻辑或者使用getComponent方法
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onUpdate(): void {

	}

	/**
	 * 每帧更新时执行，在update之后执行，尽量不要在这里写大循环逻辑或者使用getComponent方法
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onLateUpdate(): void {

	}

	/**
	 * 渲染之前执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onPreRender(): void {

	}

	/**
	 * 渲染之后执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onPostRender(): void {

	}

	/**
	 * 组件被禁用时执行，比如从节点从舞台移除后
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onDisable(): void {

	}

	/**
	 * 手动调用节点销毁时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onDestroy(): void {

	}
}

