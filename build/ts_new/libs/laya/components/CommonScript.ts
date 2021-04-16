import { Component } from "./Component";
/**
 * <code>CommonScript</code> 类用于创建公共脚本类。
 */
export class CommonScript extends Component {

	/**
	 * @inheritDoc
	 * @override
	 */
	get isSingleton(): boolean {
		return false;
	}

	constructor() {
		super();


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


