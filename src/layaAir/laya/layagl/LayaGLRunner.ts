import { ShaderVariable } from "../d3/shader/ShaderVariable";
import { CommandEncoder } from "./CommandEncoder";
import { LayaGL } from "./LayaGL";

/**
 * @internal
 * 普通命令执行器
 */
export class LayaGLRunner {

    /**
     * @private
     * 批量上传ShaderUniforms。
     */
    static uploadShaderUniforms(layaGL: LayaGL, commandEncoder: CommandEncoder, shaderData: any, uploadUnTexture: boolean): number {
        var data: any = shaderData._data;
        var shaderUniform: any[] = commandEncoder.getArrayData();
        var shaderCall: number = 0;
        for (var i: number = 0, n: number = shaderUniform.length; i < n; i++) {
            var one: any/*ShaderVariable*/ = shaderUniform[i];
            if (uploadUnTexture || one.textureID !== -1) {//如uniform为纹理切换Shader时需要重新上传
                var value: any = data[one.dataOffset];
                if (value != null)
                    shaderCall += one.fun.call(one.caller, one, value);
            }
        }
        return shaderCall;
    }

    /**
     * @private
     * 上传更新所有ShaderUniform。
     */
    static uploadCustomUniform(layaGL: LayaGL, custom: any[], index: number, data: any): number {
        var shaderCall: number = 0;
        var one: any/*ShaderVariable*/ = custom[index];
        if (one && data != null)
            shaderCall += one.fun.call(one.caller, one, data);
        return shaderCall;
    }
}

