import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { IUniformBufferUser } from "../../../DriverDesign/RenderDevice/UniformBufferManager/IUniformBufferUser";
import { UniformBufferAlone } from "../../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferAlone";
import { UniformBufferBlock } from "../../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferBlock";
import { UniformBufferManager } from "../../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferManager";
import { WebGPUUniformBufferBase } from "./WebGPUUniformBlockInfo";

export class WebGPUSubUniformBuffer extends WebGPUUniformBufferBase implements IUniformBufferUser {

    bufferBlock: UniformBufferBlock;
    bufferAlone: UniformBufferAlone;
    manager: UniformBufferManager;
    data: ShaderData;
    offset: number;
    clearGPUBufferBind(): void {
        throw new Error("Method not implemented.");
    }
    notifyGPUBufferChange(info?: string): void {
        throw new Error("Method not implemented.");
    }
    updateOver(): void {
        throw new Error("Method not implemented.");
    }
    upload(): void {
        throw new Error("Method not implemented.");
    }
    bind(location: number): void {
        throw new Error("Method not implemented.");
    }
    destroy(): void {
        throw new Error("Method not implemented.");
    }

}