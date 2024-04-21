import { PostProcess } from "../../component/PostProcess";
import { PostProcessRenderContext } from "./PostProcessRenderContext";
/**
	 * <code>PostProcessEffect</code> 类用于创建后期处理渲染效果。
	 */
export class PostProcessEffect {

	/**@internal */
	protected _active: boolean;
	/**@internal */
	protected _singleton: boolean;

	/**
	 * 创建一个 <code>PostProcessEffect</code> 实例。
	 */
	constructor() {
		this._active = true;
		this._singleton = true;
	}

	/**
	 * 是否只能添加一个
	 * @internal
	 */
	set singleton(value: boolean) {
		this._singleton = value;
	}

	get singleton() {
		return this._singleton;
	}

	/**
	 * 是否开启
	 */
	get active() {
		return this._active;
	}

	set active(value: boolean) {
		this._active = value;
	}

	/**
	 * 根据后期处理设置cameraDepthTextureMode
	 * @inheritDoc
	 * @override
	 * @returns 
	 */
	getCameraDepthTextureModeFlag?() {
		return 0;
	}

	/**
	 * 添加到后期处理栈时,会调用
	 * @inheritDoc
	 * @override
	 */
	effectInit?(postprocess: PostProcess) {
		return;
	}

	/**
	 * 释放Effect
	 * @inheritDoc
	 * @override
	 */
	release?(postprocess: PostProcess) {

	}

	/**
	 * 渲染
	 */
	render?(context: PostProcessRenderContext): void {

	}
}


