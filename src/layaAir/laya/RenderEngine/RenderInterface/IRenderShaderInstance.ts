import { ShaderVariable } from "../../d3/shader/ShaderVariable";

export interface IRenderShaderInstance{
    getUniformMap(): ShaderVariable[];
    bind(): boolean;
    destroy():void;
}