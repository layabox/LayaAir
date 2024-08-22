import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { RenderTexture } from "../../../resource/RenderTexture";


/**
 * @en The `WebXRRenderTexture` class is used to create a render texture for WebXR rendering.
 * @zh `WebXRRenderTexture` 类用来创建 WebXR 渲染的渲染纹理。
 */
export class WebXRRenderTexture extends RenderTexture {

	/** @internal */
	protected _frameBuffer: any;
	/**
	 * @en The frame loop counter for the render texture.
	 * @zh 渲染纹理的帧循环计数器。
	 */
	public frameLoop: number = -1;

	/**
	 * @en Creates a new instance of the `WebXRRenderTexture` class.
	 * @zh 创建 WebXRRenderTexture 类的新实例
	 */
	constructor() {
		super(1, 1, 1, RenderTargetFormat.STENCIL_8, false, 1);
	}

    /**
     * @en The frame buffer for the render texture.
     * @zh 渲染纹理的帧缓冲。。
     */
	set frameBuffer(value: any) {
		this._frameBuffer = value;
	}

	/**
	 * No glframeBuffer create
	 * @param width 
	 * @param height 
	 */
	protected _create(width: number, height: number): void {
	}

}