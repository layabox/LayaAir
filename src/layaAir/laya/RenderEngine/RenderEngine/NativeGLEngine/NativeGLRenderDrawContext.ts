import { IndexFormat } from "../../RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEnum/RenderPologyMode";
import { IRenderDrawContext } from "../../RenderInterface/IRenderDrawContext";
import { WebGLExtension } from "../WebGLEngine/GLEnum/WebGLExtension";
import { NativeGLObject } from "./NativeGLObject";
import { NativeWebGLEngine } from "./NativeWebGLEngine"

//TODO
export class NativeGLRenderDrawContext extends NativeGLObject implements IRenderDrawContext {
    private _angleInstancedArrays: any;
    constructor(engine: NativeWebGLEngine) {
        super(engine);
        if (!this._engine.isWebGL2) {
            this._angleInstancedArrays = this._engine._supportCapatable.getExtension(WebGLExtension.ANGLE_instanced_arrays);
        }
    }

    //TODO 优化
    getMeshTopology(mode:MeshTopology):number{
        switch(mode){
            case MeshTopology.Points:
                return this._gl.POINTS;
            case MeshTopology.Lines:
                return this._gl.LINES;
            case MeshTopology.LineLoop:
                return this._gl.LINE_LOOP;
            case MeshTopology.LineStrip:
                return this._gl.LINE_STRIP;
            case MeshTopology.Triangles:
                return this._gl.TRIANGLES;
            case MeshTopology.TriangleStrip:
                return this._gl.TRIANGLE_STRIP;
            case MeshTopology.TriangleFan:
                return this._gl.TRIANGLE_FAN;
        }
    }

    getIndexType(type:IndexFormat):number{
        switch(type){
            case IndexFormat.UInt8:
                return this._gl.UNSIGNED_BYTE;
            case IndexFormat.UInt16:
                return this._gl.UNSIGNED_SHORT;
            case IndexFormat.UInt32:
                return this._gl.UNSIGNED_INT;
        }
    }

    /**
     * @internal
     */
    drawElementsInstanced(mode: MeshTopology, count: number, type: IndexFormat, offset: number, instanceCount: number): void {
        const glmode = this.getMeshTopology(mode);
        const gltype = this.getIndexType(type);
        if (this._engine.isWebGL2)
            (<WebGL2RenderingContext>this._gl).drawElementsInstanced(glmode, count, gltype, offset, instanceCount);
        else
            this._angleInstancedArrays.drawElementsInstancedANGLE(glmode, count, gltype, offset, instanceCount);
    }

    /**
     * @internal
     */
    drawArraysInstanced(mode: MeshTopology, first: number, count: number, instanceCount: number): void {
        const glmode = this.getMeshTopology(mode);
        if (this._engine.isWebGL2)
            (<WebGL2RenderingContext>this._gl).drawArraysInstanced(glmode, first, count, instanceCount);
        else
            this._angleInstancedArrays.drawArraysInstancedANGLE(glmode, first, count, instanceCount);
    }

    drawArrays(mode: MeshTopology,first:number,count:number):void{
        const glmode = this.getMeshTopology(mode);
        this._gl.drawArrays(glmode, first, count);
    }

    drawElements(mode:MeshTopology, count:number, type:IndexFormat, offset:number):void{
        const glmode = this.getMeshTopology(mode);
        const gltype = this.getIndexType(type);
        this._gl.drawElements(glmode, count, gltype, offset)
    }


}