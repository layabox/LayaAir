import { GLRenderDrawContext } from "../../../RenderEngine/RenderEngine/WebGLEngine/GLRenderDrawContext";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { IRenderGeometryElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { LayaGL } from "../../../layagl/LayaGL";
import { SingletonList } from "../../../utils/SingletonList";
import { BufferState } from "../../../webgl/utils/BufferState";

export class FastSinglelist<T> extends SingletonList<T> {

  /**
    * @internal
    */
  add(element: T): void {
    if (this.length === this.elements.length)
      this.elements.push(element);
    else
      this.elements[this.length] = element;
  }

}

export class RenderGeometryElementOBJ implements IRenderGeometryElement {
  /**@internal */
  bufferState: BufferState;

  /**@internal */
  private _mode: MeshTopology;

  /**@internal 优化使用*/
  _glmode: number;

  /**@internal */
  drawType: DrawType;

  /**@internal */
  drawParams: FastSinglelist<number>;

  /**@internal */
  instanceCount: number;

  /**@internal 优化*/
  _glindexFormat: number;

  /**@internal */
  private _indexFormat: IndexFormat;

  /**
   * index format
   */
  public get indexFormat(): IndexFormat {
    return this._indexFormat;
  }

  public set indexFormat(value: IndexFormat) {
    this._indexFormat = value;
    this._glindexFormat = (LayaGL.renderDrawContext as GLRenderDrawContext).getIndexType(this._indexFormat);
  }

  /**
   * Mesh Topology mode 
   */
  get mode(): MeshTopology {
    return this._mode;
  }

  set mode(value: MeshTopology) {
    this._mode = value;
    this._glmode = (LayaGL.renderDrawContext as GLRenderDrawContext).getMeshTopology(this._mode);
  }

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
    delete this.drawParams;
  }
  /**@internal */
  clearRenderParams() {
    this.drawParams.length = 0;
  }
}