import { ShaderData } from "../ShaderData";
import { UniformBufferAlone } from "./UniformBufferAlone";
import { UniformBufferBlock } from "./UniformBufferBlock";
import { UniformBufferManager } from "./UniformBufferManager";

export interface IUniformBufferUser {
    needUpload: boolean;
    bufferBlock: UniformBufferBlock;
    bufferAlone: UniformBufferAlone;
    manager: UniformBufferManager;
    offset: number;
    notifyGPUBufferChange(info?: string): void;
    updateOver(): void;
}