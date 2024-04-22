import { ISubshaderData } from "../Design/ISubShaderData";
import { WebShaderPass } from "./WebShaderPass";

export class WebSubShader implements ISubshaderData {
    enableInstance: boolean;
    destroy(): void {
        throw new Error("Method not implemented.");
    }
    addShaderPass(pass: WebShaderPass): void { }
}