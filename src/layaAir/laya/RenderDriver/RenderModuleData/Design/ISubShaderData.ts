import { UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { IShaderPassData } from "./IShaderPassData";

/** @ignore */
export interface ISubshaderData {
    addShaderPass(pass: IShaderPassData): void;
    setUniformMap(_uniformMap: Map<number, UniformProperty>): void;
    enableInstance: boolean;
    shaderName:string;
    destroy(): void;
}
