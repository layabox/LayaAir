import { Camera } from "../Camera"
import { CommandBuffer } from "./command/CommandBuffer"
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { RenderTexture } from "../../../resource/RenderTexture";
import { ShaderData } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";

/**
 * @en The `PostProcessRenderContext` class is used to create a post-processing rendering context.
 * @zh `PostProcessRenderContext` 类用于创建后期处理渲染上下文。
 */
export class PostProcessRenderContext {
	/**
	 * @en The original RenderTexture that is rendered to initially. Do not modify this RT.
	 * @zh 原始渲染 RenderTexture (RT)，禁止改变此 RT。
	 */
	source: RenderTexture | null = null;
	/** 
	 * @en forward effect target 
	 * @zh 上个后期处理的结果
	 */
	indirectTarget:RenderTexture|null = null;
	/**
	 * @en The RenderTexture where the processed result should be drawn to.
	 * @zh 需要将处理后的结果画入此 RenderTexture。
	 */
	destination: RenderTexture | null = null;
	/**
	 * @en The rendering camera.
	 * @zh 渲染相机。
	 */
	camera: Camera | null = null;
	/**
	 * @en The composite shader data.
	 * @zh 合成着色器数据。
	 */
	compositeShaderData: ShaderData | null = null;
	/**
	 * @en The post-processing command buffer.
	 * @zh 后期处理指令流。
	 */
	command: CommandBuffer | null = null;
	/**
	 * @en Temporary texture array. You can put created textures here or select an RT to use from here to save memory.
	 * @zh 临时纹理数组。可以将创建的纹理放入此数组，也可以从这里选取要用的 RT 来节省显存。
	 */
	deferredReleaseTextures: RenderTexture[] = [];

	/**
	 * @en Selects an RT from recycled RTs to save memory.
	 * @param width The width of the RenderTexture.
	 * @param height The height of the RenderTexture.
	 * @param colorFormat The color format of the RenderTexture.
	 * @param depthFormat The depth format of the RenderTexture.
	 * @param mipmap Whether to generate mipmaps.
	 * @param multiSamples The number of multisamples.
	 * @param depthTexture Whether to generate a depth texture.
	 * @param sRGB Whether the RenderTexture is in sRGB color space.
	 * @returns The selected RenderTexture or null if no match is found.
	 * @zh 从回收的 RT 中选择一个 RT 用来节省内存。
	 * @param width 纹理的宽度。	
	 * @param height 纹理的高度。
	 * @param colorFormat 纹理的颜色格式。
	 * @param depthFormat 纹理的深度格式。
	 * @param mipmap 是否生成 mipmap。
	 * @param multiSamples 多重采样数。
	 * @param depthTexture 是否生成深度纹理。
	 * @param sRGB 纹理是否在 sRGB 色彩空间。
	 * @returns 选择到的 RenderTexture，如果没有匹配的，则返回 null。
	 */
	createRTByContextReleaseTexture(width: number, height: number, colorFormat: RenderTargetFormat, depthFormat: RenderTargetFormat, mipmap: boolean = false, multiSamples: number = 1, depthTexture: boolean = false, sRGB: boolean = false){
		let n =this.deferredReleaseTextures.length
		for (let index = 0; index <n ; index++) {
			let rt = this.deferredReleaseTextures[index];
			if (rt.width == width && rt.height == height && rt.colorFormat == colorFormat && rt.depthStencilFormat == depthFormat && rt._generateMipmap == mipmap && rt.multiSamples == multiSamples && rt.generateDepthTexture == depthTexture && rt._gammaSpace == sRGB) {
				rt._inPool = false;
				let end = this.deferredReleaseTextures[n - 1];
				this.deferredReleaseTextures[index] = end;
				this.deferredReleaseTextures.length -= 1;
				return rt;
			}
		}
		return null;
	}

}


