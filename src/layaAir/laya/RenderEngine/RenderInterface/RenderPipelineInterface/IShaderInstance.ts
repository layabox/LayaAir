import { ShaderCompileDefineBase, ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";

export interface IShaderInstance {
    _create(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderCompileDefineBase): void
    _disposeResource(): void;
}