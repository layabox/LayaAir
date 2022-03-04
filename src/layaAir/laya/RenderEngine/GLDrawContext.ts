import { WebGLExtension } from "./GLEnum/WebGLExtension";
import { GLObject } from "./GLObject"
import { IRenderDrawContext } from "./RenderInterface/IRenderDrawContext";
import { WebGLEngine } from "./WebGLEngine"

//TODO 先写完测试，这种封装过于死板
export class GLDrawContext extends GLObject implements IRenderDrawContext {
    private _angleInstancedArrays: any;
    constructor(engine: WebGLEngine) {
        super(engine);
        if (!this._engine.isWebGL2){
            this._angleInstancedArrays = this._engine._supportCapatable.getExtension(WebGLExtension.ANGLE_instanced_arrays);
        }
    }

    /**
     * @internal
     */
    drawElementsInstanced(mode: number, count: number, type: number, offset: number, instanceCount: number): void {
        if (this._engine.isWebGL2)
            (<WebGL2RenderingContext>this._gl).drawElementsInstanced(mode, count, type, offset, instanceCount);
        else
            this._angleInstancedArrays.drawElementsInstancedANGLE(mode, count, type, offset, instanceCount);
    }

    /**
     * @internal
     */
    drawArraysInstanced(mode: number, first: number, count: number, instanceCount: number): void {
        if (this._engine.isWebGL2)
        (<WebGL2RenderingContext>this._gl).drawArraysInstanced(mode, first, count, instanceCount);
        else
            this._angleInstancedArrays.drawArraysInstancedANGLE(mode, first, count, instanceCount);
    }

    /**
     * @internal
     */
    vertexAttribDivisor(index: number, divisor: number): void {
        if (this._engine.isWebGL2)
        (<WebGL2RenderingContext>this._gl).vertexAttribDivisor(index, divisor);
        else
            this._angleInstancedArrays.vertexAttribDivisorANGLE(index, divisor);
    }

}