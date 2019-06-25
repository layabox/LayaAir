import { Camera } from "../Camera";
import { CommandBuffer } from "./command/CommandBuffer";
import { RenderTexture } from "../../resource/RenderTexture";
import { ShaderData } from "../../shader/ShaderData";
/**
 * * <code>PostProcessRenderContext</code> 类用于创建后期处理渲染上下文。
 */
export declare class PostProcessRenderContext {
    /** 源纹理。*/
    source: RenderTexture;
    /** 输出纹理。*/
    destination: RenderTexture;
    /** 渲染相机。*/
    camera: Camera;
    /** 合成着色器数据。*/
    compositeShaderData: ShaderData;
    /** 后期处理指令流。*/
    command: CommandBuffer;
    /** 临时纹理数组。*/
    deferredReleaseTextures: RenderTexture[];
}
