import { DrawType } from "../../RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEnum/RenderPologyMode";
import { RenderStatisticsInfo } from "../../RenderEnum/RenderStatInfo";
import { IRenderDrawContext } from "../../RenderInterface/IRenderDrawContext";
import { IRenderGeometryElement } from "../../RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { WebGLExtension } from "./GLEnum/WebGLExtension";
import { GLObject } from "./GLObject";
import { WebGLEngine } from "./WebGLEngine"

//TODO
export class GLRenderDrawContext extends GLObject implements IRenderDrawContext {
    private _angleInstancedArrays: any;
    constructor(engine: WebGLEngine) {
        super(engine);
        if (!this._engine.isWebGL2) {
            this._angleInstancedArrays = this._engine._supportCapatable.getExtension(WebGLExtension.ANGLE_instanced_arrays);
        }
    }

    //TODO 优化
    getMeshTopology(mode: MeshTopology): number {
        switch (mode) {
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

    getIndexType(type: IndexFormat): number {
        switch (type) {
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
        
        this._engine._addStatisticsInfo(RenderStatisticsInfo.DrawCall,1);
        this._engine._addStatisticsInfo(RenderStatisticsInfo.InstanceDrawCall,1);
        this._engine._addStatisticsInfo(RenderStatisticsInfo.Triangle,count/3*instanceCount);

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
        
        this._engine._addStatisticsInfo(RenderStatisticsInfo.DrawCall,1);
        this._engine._addStatisticsInfo(RenderStatisticsInfo.InstanceDrawCall,1);
        //TODO glmode
        this._engine._addStatisticsInfo(RenderStatisticsInfo.Triangle,(count-2)*instanceCount);
    }

    drawArrays(mode: MeshTopology, first: number, count: number): void {
        const glmode = this.getMeshTopology(mode);
        this._gl.drawArrays(glmode, first, count);

        this._engine._addStatisticsInfo(RenderStatisticsInfo.DrawCall,1);
        //TODO glmode
        this._engine._addStatisticsInfo(RenderStatisticsInfo.Triangle,(count-2));
        
    }

    drawElements(mode: MeshTopology, count: number, type: IndexFormat, offset: number): void {
        const glmode = this.getMeshTopology(mode);
        const gltype = this.getIndexType(type);
        this._gl.drawElements(glmode, count, gltype, offset);

        this._engine._addStatisticsInfo(RenderStatisticsInfo.DrawCall,1);
        this._engine._addStatisticsInfo(RenderStatisticsInfo.Triangle,count/3);
        
    }


    drawGeometryElement(geometryElement: IRenderGeometryElement): void {
        geometryElement.bufferState.bind();
        let element = geometryElement.drawParams.elements;
        let length = geometryElement.drawParams.length;
        switch (geometryElement.drawType) {
            case DrawType.DrawArray:
                for(let i = 0;i<length;i+=2){
                    this.drawArrays(geometryElement.mode,element[i],element[i+1]);
                }
                break;
            case DrawType.DrawElement:
                for(let i = 0;i<length;i+=2){
                    this.drawElements(geometryElement.mode,element[i+1],geometryElement.indexFormat,element[i]);
                }
                break;
            case DrawType.DrawArrayInstance:
                for(let i = 0;i<length;i+=2){
                    this.drawArraysInstanced(geometryElement.mode,element[i],element[i+1],geometryElement.instanceCount);
                }
                break;
            case DrawType.DrawElementInstance:
                for(let i = 0;i<length;i+=2){
                    this.drawElementsInstanced(geometryElement.mode,element[i+1],geometryElement.indexFormat,element[i],geometryElement.instanceCount);
                }
                break;
            default:
                break;
        }
    }


}