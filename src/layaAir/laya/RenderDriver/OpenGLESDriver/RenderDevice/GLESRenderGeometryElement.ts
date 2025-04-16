import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { FastSinglelist } from "../../../utils/SingletonList";
import { IBufferState } from "../../DriverDesign/RenderDevice/IBufferState";



export class GLESRenderGeometryElement implements IRenderGeometryElement {
  private _bufferState: IBufferState;

  /**@internal */
  drawParams: FastSinglelist<number>;

  _nativeObj: any;

  /**@internal */
  constructor(mode: MeshTopology, drawType: DrawType) {
    this._nativeObj = new (window as any).conchGLESRenderGeometryElement();
    this.mode = mode;
    this.drawParams = new FastSinglelist();
    this.drawType = drawType;
  }
  getDrawDataParams(out: FastSinglelist<number>): void {
    this.drawParams.cloneTo(out);
  }

  setDrawArrayParams(first: number, count: number): void {
    this.drawParams.add(first);
    this.drawParams.add(count);
    this._nativeObj.setDrawArrayParams(first, count);
  }

  setDrawElemenParams(count: number, offset: number): void {
    this.drawParams.add(offset);
    this.drawParams.add(count);
    this._nativeObj.setDrawElementParams(count, offset);
  }

  destroy(): void {
    this._nativeObj.destroy();
  }

  clearRenderParams() {
    this.drawParams.length = 0;
    this._nativeObj.clearRenderParams();
  }

  set bufferState(value: IBufferState) {
    this._bufferState = value;
    this._nativeObj.setBufferState(value ? (value as any)._nativeObj : null);
  }

  get bufferState(): IBufferState {
    return this._bufferState;
  }

  set mode(value: MeshTopology) {
    this._nativeObj.mode = value;
  }

  get mode(): MeshTopology {
    return this._nativeObj.mode;
  }

  set drawType(value: DrawType) {
    this._nativeObj.drawType = value;
  }

  get drawType(): DrawType {
    return this._nativeObj.drawType;
  }

  set instanceCount(value: number) {
    this._nativeObj.instanceCount = value;
  }

  get instanceCount(): number {
    return this._nativeObj.instanceCount;
  }

  set indexFormat(value: IndexFormat) {
    this._nativeObj.indexFormat = value;
  }

  get indexFormat(): IndexFormat {
    return this._nativeObj.indexFormat;
  }
  
}