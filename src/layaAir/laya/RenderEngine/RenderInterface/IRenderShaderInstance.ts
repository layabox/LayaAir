import { ShaderVariable } from "../RenderShader/ShaderVariable";

export interface IRenderShaderInstance {
    _complete: boolean;
    getUniformMap(): ShaderVariable[];
    bind(): boolean;
    destroy(): void;
}