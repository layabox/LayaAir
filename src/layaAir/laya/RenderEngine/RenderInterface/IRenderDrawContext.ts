//TODO 先写完测试，这种封装过于死板
export interface IRenderDrawContext {
    drawElementsInstanced(mode: number, count: number, type: number, offset: number, instanceCount: number): void;
    drawArraysInstanced(mode: number, first: number, count: number, instanceCount: number): void;
    vertexAttribDivisor(index: number, divisor: number): void;
}