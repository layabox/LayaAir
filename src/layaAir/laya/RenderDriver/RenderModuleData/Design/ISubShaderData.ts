import { IShaderPassData } from "./IShaderPassData";

//shader
export interface ISubshaderData {
    addShaderPass(pass: IShaderPassData): void;
    enableInstance:boolean;
    destroy(): void;
}
