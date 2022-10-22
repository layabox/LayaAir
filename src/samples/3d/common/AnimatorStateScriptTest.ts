import { AnimatorStateScript } from "laya/d3/animation/AnimatorStateScript";
import { Text } from "laya/display/Text";
/**
 * 继承自AnimatorStateScript(动画状态脚本)
 * @author ...
 */
export class AnimatorStateScriptTest extends AnimatorStateScript {
	private _text: Text = null;

	get text(): Text {
		return this._text;
	}
	set text(value: Text) {
		this._text = value;
	}
	constructor() {
		super();

	}


	/**
	 * 动画状态开始时执行。
	 */
	onStateEnter(): void {
		console.log("动画开始播放了");
		this._text.text = "动画状态：动画开始播放";
	}

	/**
	 * 动画状态运行中
	 * @param normalizeTime 0-1动画播放状态
	 */
	 onStateUpdate(normalizeTime: number): void {
		console.log("动画状态更新了");
		this._text.text = "动画状态：动画更新中";
	}

	/**
	* 动画状态退出时执行。
	*/
	onStateExit(): void {
		console.log("动画退出了");
		this._text.text = "动画状态：动画开始退出";
	}

}

