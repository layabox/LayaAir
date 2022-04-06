import { SingletonList } from "../../d3/component/SingletonList";
import { BufferState } from "../../d3/core/BufferState";
import { DrawType } from "../RenderEnum/DrawType";
import { IndexFormat } from "../RenderEnum/IndexFormat";
import { MeshTopology } from "../RenderEnum/RenderPologyMode";
import { IRenderGeometryElement } from "../RenderInterface/RenderPipelineInterface/IRenderGeometryElement";

export class RenderGeometryElementOBJ implements IRenderGeometryElement{
    bufferState:BufferState;
    mode:MeshTopology;
    drawType:DrawType;
    drawParams:SingletonList<number>;
    instanceCount:number;
    indexFormat:IndexFormat;
    constructor(mode:MeshTopology,drawType:DrawType){
        this.mode = mode;
		this.drawParams = new SingletonList();
		this.drawType = drawType;
    }
    setDrawArrayParams(first: number, count: number):void {
		this.drawParams.add(first);
		this.drawParams.add(count);	
	}
	setDrawElemenParams(count: number, offset: number):void {
		this.drawParams.add(offset);
		this.drawParams.add(count);
	}
    destroy():void{

    }

    clearRenderParams() {
		this.drawParams.length = 0;
	}
}