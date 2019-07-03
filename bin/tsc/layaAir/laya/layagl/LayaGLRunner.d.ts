import { CommandEncoder } from "./CommandEncoder";
import { LayaGL } from "./LayaGL";
/**
 * @private
 * 普通命令执行器
 */
export declare class LayaGLRunner {
    /**
     * @private
     * 批量上传ShaderUniforms。
     */
    static uploadShaderUniforms(layaGL: LayaGL, commandEncoder: CommandEncoder, shaderData: any, uploadUnTexture: boolean): number;
    /**
     * @private
     * 上传ShaderUniform。
     */
    static uploadCustomUniform(layaGL: LayaGL, custom: any[], index: number, data: any): number;
    /**
     * @private
     * 批量上传ShaderUniforms。
     */
    static uploadShaderUniformsForNative(layaGL: any, commandEncoder: CommandEncoder, shaderData: any): number;
}
