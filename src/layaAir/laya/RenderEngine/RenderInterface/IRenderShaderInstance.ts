import { ShaderVariable } from "../RenderShader/ShaderVariable";

export interface IRenderShaderInstance{
    getUniformMap(): ShaderVariable[];
    bind(): boolean;
    destroy():void;
}