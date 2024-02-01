import { ShaderVariable } from "../../../../RenderEngine/RenderShader/ShaderVariable";
import { ShaderDataType } from "../../../DriverDesign/RenderDevice/ShaderData";

type UniformProperty = { id: number, propertyName: string, uniformtype?: ShaderDataType }
export class WGPUShaderVariable extends ShaderVariable {
    /**@internal */
    groupLayout: GPUBindGroupLayout;
    /**@internal */
    block: boolean = false;
    /**@internal */
    blockProperty?: UniformProperty[];
    constructor() {
        super();
    }

    containProperty(propertyIndex: number): boolean {
        if (this.block) {
            for(let i = 0,n = this.blockProperty.length;i<n;i++){
                if(this.blockProperty[i].id == propertyIndex) return true;
            } 
            return false
        } else {
            return this.dataOffset == propertyIndex;
        }
    }
}