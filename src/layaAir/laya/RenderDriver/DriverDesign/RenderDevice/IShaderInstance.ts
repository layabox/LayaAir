import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";

export interface IShaderInstance {
    _create(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderPass): void
    _disposeResource(): void;
}



//subShader和shaderpass仅仅保留getCacheShader相关的数据
