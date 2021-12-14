import { LayaGL } from "../../../layagl/LayaGL";
import { RenderTexture } from "../../resource/RenderTexture";


/**
 * @author miner
 * 类用来创建WebXRRenderTexture
 */
export class WebXRRenderTexture extends RenderTexture {

	/** @internal */
	protected _frameBuffer: any;
	/**update mask */
	public frameLoop: number = -1;

	/**
	 * 创建WebXRFrameBuffer
	 * @param frameBuffer 
	 */
	constructor() {
		super(1, 1, 1, 1, false);
	}

	/**
	 * set frameBuffer
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

	/**
	 * @internal
	 */
	_start(): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
		RenderTexture._currentActive = this;
	}

	/**
	 * @internal
	 */
	_end(): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		RenderTexture._currentActive = null;
	}

}