import { Camera } from "../Camera"
import { CommandBuffer } from "./command/CommandBuffer"
import { RenderTexture } from "../../resource/RenderTexture";
import { ShaderData } from "../../../RenderEngine/RenderShader/ShaderData";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";

/**
 * * <code>PostProcessRenderContext</code> 类用于创建后期处理渲染上下文。
 */
export class PostProcessRenderContext {
	/** origan RenderTexture 原始渲染RT,禁止改变此RT*/
	source: RenderTexture | null = null;
	/** forward effect target 上个后期处理的结果*/
	indirectTarget:RenderTexture|null = null;
	/** dest RenderTexture 需要将处理后的结果画入此RT*/
	destination: RenderTexture | null = null;
	/** 渲染相机。*/
	camera: Camera | null = null;
	/** 合成着色器数据。*/
	compositeShaderData: ShaderData | null = null;
	/** 后期处理指令流。*/
	command: CommandBuffer | null = null;
	/** 临时纹理数组。可以将创建的纹理放入此,也可以从这里选取要用的RT来节省显存*/
	deferredReleaseTextures: RenderTexture[] = [];

	/**
	 * 从回收的RT中选择一个RT 用来节省内存
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


