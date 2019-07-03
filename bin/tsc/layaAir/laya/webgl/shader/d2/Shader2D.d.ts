import { ShaderDefines2D } from "./ShaderDefines2D";
import { DrawStyle } from "../../canvas/DrawStyle";
import { Shader } from "../Shader";
export declare class Shader2D {
    ALPHA: number;
    shader: Shader;
    filters: any[];
    defines: ShaderDefines2D;
    shaderType: number;
    colorAdd: any[];
    fillStyle: DrawStyle;
    strokeStyle: DrawStyle;
    destroy(): void;
    static __init__(): void;
}
