import { LayaGL } from "./LayaGL";
/**
 * @private
 * 普通命令执行器
 */
export class LayaGLRunner {
    /**
     * @private
     * 批量上传ShaderUniforms。
     */
    static uploadShaderUniforms(layaGL, commandEncoder, shaderData, uploadUnTexture) {
        var data = shaderData._data;
        var shaderUniform = commandEncoder.getArrayData();
        var shaderCall = 0;
        for (var i = 0, n = shaderUniform.length; i < n; i++) {
            var one = shaderUniform[i];
            if (uploadUnTexture || one.textureID !== -1) { //如uniform为纹理切换Shader时需要重新上传
                var value = data[one.dataOffset];
                if (value != null)
                    shaderCall += one.fun.call(one.caller, one, value);
            }
        }
        return shaderCall;
    }
    /**
     * @private
     * 上传ShaderUniform。
     */
    static uploadCustomUniform(layaGL, custom, index, data) {
        var shaderCall = 0;
        var one = custom[index];
        if (one && data != null)
            shaderCall += one.fun.call(one.caller, one, data);
        return shaderCall;
    }
    /**
     * @private
     * 批量上传ShaderUniforms。
     */
    static uploadShaderUniformsForNative(layaGL, commandEncoder, shaderData) {
        var nType = LayaGL.UPLOAD_SHADER_UNIFORM_TYPE_ID;
        if (shaderData._runtimeCopyValues.length > 0) {
            nType = LayaGL.UPLOAD_SHADER_UNIFORM_TYPE_DATA;
        }
        var data = shaderData._data;
        return layaGL.uploadShaderUniforms(commandEncoder, data, nType);
    }
}
