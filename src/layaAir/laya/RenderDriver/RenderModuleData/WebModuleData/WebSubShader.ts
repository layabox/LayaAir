import { NotImplementedError } from "../../../utils/Error";
import { ISubshaderData } from "../Design/ISubShaderData";
import { WebShaderPass } from "./WebShaderPass";

export class WebSubShader implements ISubshaderData {
    enableInstance: boolean;
    destroy(): void {
        throw new NotImplementedError();
    }
    addShaderPass(pass: WebShaderPass): void { }
}