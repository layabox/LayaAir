import { DrawType } from "../../../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../../../RenderEngine/RenderEnum/RenderPologyMode";
import { IRenderGeometryElement } from "../../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { SingletonList } from "../../../component/SingletonList";
import { IndexFormat } from "../../../graphics/IndexFormat";
import { BufferState } from "../../BufferState";

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