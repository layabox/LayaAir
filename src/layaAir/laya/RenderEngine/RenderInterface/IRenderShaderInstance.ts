import { ShaderVariable } from "../RenderShader/ShaderVariable";

export interface IRenderShaderInstance {
    /**@internal */
    _complete: boolean;
    getUniformMap(): ShaderVariable[];
    /**@internal */
    bind(): boolean;
    destroy(): void;
}