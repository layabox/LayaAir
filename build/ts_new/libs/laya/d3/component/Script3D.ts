//@ts-nocheck
import { Component } from "../../components/Component"
import { Sprite3D } from "../core/Sprite3D"
import { Collision } from "../physics/Collision"
import { PhysicsComponent } from "../physics/PhysicsComponent"
import { Laya } from "../../../Laya";
import { Scene3D } from "../core/scene/Scene3D";

/**
 * <code>Script3D</code> 类用于创建脚本的父类,该类为抽象类,不允许实例。
 */
export class Script3D extends Component {
	/**@internal*/
	public _indexInPool: number = -1;
	/**@internal 避免重复调用enable disable*/
	private _enableState:boolean = false;
	/**
	 * @inheritDoc
	 * @override
	 */
	get isSingleton(): boolean {
		return false;
	}

	/**
	 * @internal
	 */
	private _checkProcessTriggers(): boolean {
		var prototype: any = Script3D.prototype;
		if (this.onTriggerEnter !== prototype.onTriggerEnter)
			return true;
		if (this.onTriggerStay !== prototype.onTriggerStay)
			return true;
		if (this.onTriggerExit !== prototype.onTriggerExit)
			return true;
		return false;
	}

	/**
	 * @internal
	 */
	private _checkProcessCollisions(): boolean {
		var prototype: any = Script3D.prototype;
		if (this.onCollisionEnter !== prototype.onCollisionEnter)
			return true;
		if (this.onCollisionStay !== prototype.onCollisionStay)
			return true;
		if (this.onCollisionExit !== prototype.onCollisionExit)
			return true;
		return false;
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	_onAwake(): void {
		this.onAwake();
		if (this.onStart !== Script3D.prototype.onStart)
			Laya.startTimer.callLater(this, this.onStart);
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	_onEnable(): void {
		if(this._enableState)
			return;
		(<Scene3D>this.owner._scene)._addScript(this);
		this._enableState = true;
		this.onEnable();
	
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	protected _onDisable(): void {
		if(!this._enableState)
			return;
		(<Scene3D>this.owner._scene)._removeScript(this);
		this.owner.offAllCaller(this);
		this._enableState = false;
		this.onDisable();
	
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	protected _onDestroy(): void {
		var scripts: Script3D[] = ((<Sprite3D>this.owner))._scripts;
		scripts.splice(scripts.indexOf(this), 1);

		var sprite: Sprite3D = (<Sprite3D>this.owner);
		sprite._needProcessTriggers = false;
		for (var i: number = 0, n: number = scripts.length; i < n; i++) {
			if (scripts[i]._checkProcessTriggers()) {
				sprite._needProcessTriggers = true;
				break;
			}
		}

		sprite._needProcessCollisions = false;
		for (i = 0, n = scripts.length; i < n; i++) {
			if (scripts[i]._checkProcessCollisions()) {
				sprite._needProcessCollisions = true;
				break;
			}
		}
		this.onDestroy();
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	_isScript(): boolean {
		return true;
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	_onAdded(): void {
		var sprite: Sprite3D = (<Sprite3D>this.owner);
		var scripts: Script3D[] = sprite._scripts;
		scripts || (sprite._scripts = scripts = []);
		scripts.push(this);

		if (!sprite._needProcessCollisions)
			sprite._needProcessCollisions = this._checkProcessCollisions();//检查是否需要处理物理碰撞

		if (!sprite._needProcessTriggers)
			sprite._needProcessTriggers = this._checkProcessTriggers();//检查是否需要处理触发器
	}

	/**
	 * 创建后只执行一次
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onAwake(): void {

	}

	/**
	 * 每次启动后执行
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
	 * 开始触发时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onTriggerEnter(other: PhysicsComponent): void {

	}

	/**
	 * 持续触发时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onTriggerStay(other: PhysicsComponent): void {

	}

	/**
	 * 结束触发时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onTriggerExit(other: PhysicsComponent): void {

	}

	/**
	 * 开始碰撞时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onCollisionEnter(collision: Collision): void {

	}

	/**
	 * 持续碰撞时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onCollisionStay(collision: Collision): void {

	}

	/**
	 * 结束碰撞时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onCollisionExit(collision: Collision): void {

	}

	/**
	 * 关节破坏时执行此方法
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onJointBreak():void{
		
	}

	/**
	 * 鼠标按下时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onMouseDown(): void {

	}

	/**
	 * 鼠标拖拽时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onMouseDrag(): void {

	}

	/**
	 * 鼠标点击时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onMouseClick(): void {

	}

	/**
	 * 鼠标弹起时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onMouseUp(): void {

	}

	/**
	 * 鼠标进入时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onMouseEnter(): void {

	}

	/**
	 * 鼠标经过时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onMouseOver(): void {

	}

	/**
	 * 鼠标离开时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onMouseOut(): void {
		
	}

	/**
	 * 每帧更新时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onUpdate(): void {

	}

	/**
	 * 每帧更新时执行，在update之后执行
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
	 * 禁用时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onDisable(): void {

	}

	/**
	 * 销毁时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onDestroy(): void {

	}
}

