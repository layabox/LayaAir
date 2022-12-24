import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { IRenderGeometryElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { SingletonList } from "../../../utils/SingletonList";
import { BufferState } from "../../../webgl/utils/BufferState";


export class RenderGeometryElementOBJ implements IRenderGeometryElement {
  /**@internal */
  bufferState: BufferState;

  /**@internal */
  mode: MeshTopology;

  /**@internal */
  drawType: DrawType;

  /**@internal */
  drawParams: SingletonList<number>;

  /**@internal */
  instanceCount: number;

  /**@internal */
  indexFormat: IndexFormat;

  /**@internal */
  constructor(mode: MeshTopology, drawType: DrawType) {
    this.mode = mode;
    this.drawParams = new SingletonList();
    this.drawType = drawType;
  }

  /**@internal */
  setDrawArrayParams(first: number, count: number): void {
    this.drawParams.add(first);
    this.drawParams.add(count);
  }

  /**@internal */
  setDrawElemenParams(count: number, offset: number): void {
    this.drawParams.add(offset);
    this.drawParams.add(count);
  }
  
  /**@internal */
  destroy(): void {
    
  }

  clearRenderParams() {
    this.drawParams.length = 0;
  }
}