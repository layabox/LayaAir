import { NotImplementedError } from "../../../utils/Error";
import { UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { ISubshaderData } from "../Design/ISubShaderData";
import { WebShaderPass } from "./WebShaderPass";

export class WebSubShader implements ISubshaderData {
    shaderName: string;
    enableInstance: boolean;
    setUniformMap(_uniformMap: Map<number, UniformProperty>): void {

    }
    destroy(): void {
        throw new NotImplementedError();
    }
    addShaderPass(pass: WebShaderPass): void { }
}