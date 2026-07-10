import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { FastSinglelist } from "../../../utils/SingletonList";
import { IBufferState } from "../../DriverDesign/RenderDevice/IBufferState";

/** JS-read mirror slot layout; shared contract with C++ GLESRenderGeometryElement. */
const enum GeoSlot {
  Mode = 0,
  DrawType = 1,
  InstanceCount = 2,
  IndexFormat = 3,
  Count = 4,
}

export class GLESRenderGeometryElement implements IRenderGeometryElement {
  private _bufferState: IBufferState;

  
  drawParams: FastSinglelist<number>;

  _nativeObj: any;

  /** JS-read mirror of [mode, drawType, instanceCount, indexFormat]; shared with C++. */
  private _props: Uint32Array;

  /**@internal */
  constructor(mode: MeshTopology, drawType: DrawType) {
    this._nativeObj = new (window as any).conchGLESRenderGeometryElement();
    const buf = new ArrayBuffer(GeoSlot.Count * 4);
    this._props = new Uint32Array(buf);
    this._nativeObj.bindPropertyBuffer(buf);
    this.mode = mode;
    this.drawParams = new FastSinglelist();
    this.drawType = drawType;
  }
  getDrawDataParams(out: FastSinglelist<number>): void {
    out && this.drawParams.cloneTo(out);
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
    this._nativeObj.rt_setMode(value);
  }

  get mode(): MeshTopology {
    return this._props[GeoSlot.Mode];
  }

  set drawType(value: DrawType) {
    this._nativeObj.rt_setDrawType(value);
  }

  get drawType(): DrawType {
    return this._props[GeoSlot.DrawType];
  }

  set instanceCount(value: number) {
    this._nativeObj.rt_setInstanceCount(value);
  }

  get instanceCount(): number {
    return this._props[GeoSlot.InstanceCount];
  }

  set indexFormat(value: IndexFormat) {
    this._nativeObj.rt_setIndexFormat(value);
  }

  get indexFormat(): IndexFormat {
    return this._props[GeoSlot.IndexFormat];
  }
  
}
