import { CommandBuffer2D } from "../../../../display/Scene2DSpecial/RenderCMD2D/CommandBuffer2D";
import { LayaGL } from "../../../../layagl/LayaGL";
import { RenderTargetFormat } from "../../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { RenderTexture2D } from "../../../../resource/RenderTexture2D";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { IRender2DPass } from "../../Design/2D/IRender2DPass";

export class PostProcess2D {
   _effects: any[] = [];

   _enabled: boolean;

   _context: PostProcessRenderContext2D;

   /**@internal */
   private _compositeShaderData: ShaderData = LayaGL.renderDeviceFactory.createShaderData(null);


   get enabled(): boolean {
      return this._enabled;
   }

   set enabled(value: boolean) {
      this._enabled = value;
   }

   constructor() {
      this._context = new PostProcessRenderContext2D();
      this._context.compositeShaderData = this._compositeShaderData;
      this._context.command = new CommandBuffer2D();
   }

   render(pass: IRender2DPass): void {
      this._context.source = pass.getRenderTexture();
      
   }

   destroy(): void {
      this._context.compositeShaderData.destroy();
      this._context.compositeShaderData = null;
      //todo
      this._effects.length = 0;
   }
}

export class PostProcessRenderContext2D {
   /**
    * @en The original RenderTexture that is rendered to initially. Do not modify this RT.
    * @zh 原始渲染 RenderTexture (RT)，禁止改变此 RT。
    */
   source: RenderTexture2D | null = null;
   /** 
    * @en forward effect target 
    * @zh 上个后期处理的结果
    */
   indirectTarget: RenderTexture2D | null = null;
   /**
    * @en The RenderTexture where the processed result should be drawn to.
    * @zh 需要将处理后的结果画入此 RenderTexture。
    */
   destination: RenderTexture2D | null = null;
   /**
    * @en The composite shader data.
    * @zh 合成着色器数据。
    */
   compositeShaderData: ShaderData | null = null;
   /**
    * @en The post-processing command buffer.
    * @zh 后期处理指令流。
    */
   command: CommandBuffer2D | null = null;
   /**
	 * @en Temporary texture array. You can put created textures here or select an RT to use from here to save memory.
	 * @zh 临时纹理数组。可以将创建的纹理放入此数组，也可以从这里选取要用的 RT 来节省显存。
	 */
	deferredReleaseTextures: RenderTexture2D[] = [];

   /**
	 * @en Selects an RT from recycled RTs to save memory.
	 * @param width The width of the RenderTexture.
	 * @param height The height of the RenderTexture.
	 * @param colorFormat The color format of the RenderTexture.
	 * @param depthFormat The depth format of the RenderTexture.
	 * @returns The selected RenderTexture or null if no match is found.
	 * @zh 从回收的 RT 中选择一个 RT 用来节省内存。
	 * @param width 纹理的宽度。	
	 * @param height 纹理的高度。
	 * @param colorFormat 纹理的颜色格式。
	 * @param depthFormat 纹理的深度格式。
	 * @returns 选择到的 RenderTexture，如果没有匹配的，则返回 null。
	 */
	// createRTByContextReleaseTexture(width: number, height: number, colorFormat: RenderTargetFormat, depthFormat: RenderTargetFormat) {
	// 	let n = this.deferredReleaseTextures.length
	// 	for (let index = 0; index < n; index++) {
	// 		let rt = this.deferredReleaseTextures[index];
	// 		if (
   //          rt.width == width 
   //          && rt.height == height 
   //          && rt.getColorFormat() == colorFormat 
   //          && rt.depthStencilFormat == depthFormat 
   //       ) {
	// 			rt._inPool = false;
	// 			let end = this.deferredReleaseTextures[n - 1];
	// 			this.deferredReleaseTextures[index] = end;
	// 			this.deferredReleaseTextures.length -= 1;
	// 			return rt;
	// 		}
	// 	}
	// 	return null;
	// }

}