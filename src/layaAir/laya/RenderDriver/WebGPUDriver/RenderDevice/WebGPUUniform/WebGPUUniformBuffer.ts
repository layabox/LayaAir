import { WebGPUUniformBufferBase } from "./WebGPUUniformBlockInfo";

export class WebGPUUniformBuffer extends WebGPUUniformBufferBase {
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