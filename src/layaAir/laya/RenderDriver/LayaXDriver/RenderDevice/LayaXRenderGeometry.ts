import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { FastSinglelist } from "../../../utils/SingletonList";
import { IBufferState } from "../../DriverDesign/RenderDevice/IBufferState";
import { IDeviceBuffer } from "../../DriverDesign/RenderDevice/IDeviceBuffer";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";

/**
 * 共享属性块槽位（uint32 索引），与 C++ `LayaXRenderGeometry_JS::Props` 结构体字段
 * 顺序一一对应。改任一侧必须同步改另一侧。
 */
const enum GeoSlot {
    Mode = 0,
    DrawType = 1,
    InstanceCount = 2,
    IndexFormat = 3,
    Count = 4,
}

export class LayaXRenderGeometry implements IRenderGeometryElement {
    private _bufferState: IBufferState;

    /**@internal */
    drawParams: FastSinglelist<number>;

    _nativeObj: any;

    /** @internal 共享属性块：C++ 写、JS 读；槽位见 GeoSlot，对应 C++ Props 结构体 */
    private _propBuf = new ArrayBuffer(GeoSlot.Count * 4);
    private _propU32 = new Uint32Array(this._propBuf);

    /**@internal */
    constructor(mode: MeshTopology, drawType: DrawType) {
        this._nativeObj = new (window as any).conchLayaXRenderGeometry();
        this._nativeObj.bindPropertyBuffer(this._propBuf);   // 必须在写 mode/drawType 之前
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

    /**
     * Bind an indirect draw buffer. Pass null to disable.
     * `drawType` must also be set to DrawArrayIndirect or DrawElementIndirect
     * for indirect execution to take effect.
     */
    setIndirectDrawBuffer(buffer: IDeviceBuffer, offset: number): void {
        const nativeBuf = buffer ? (buffer as any)._nativeObj : null;
        this._nativeObj.setIndirectDrawBuffer(nativeBuf, offset >>> 0);
    }

    set bufferState(value: IBufferState) {
        this._bufferState = value;
        this._nativeObj.setBufferState(value ? (value as any)._nativeObj : null);
    }

    get bufferState(): IBufferState {
        return this._bufferState;
    }

    set mode(value: MeshTopology) {
        this._nativeObj.setMode(value);
    }

    get mode(): MeshTopology {
        return this._propU32[GeoSlot.Mode];
    }

    set drawType(value: DrawType) {
        this._nativeObj.setDrawType(value);
    }

    get drawType(): DrawType {
        return this._propU32[GeoSlot.DrawType];
    }

    set instanceCount(value: number) {
        this._nativeObj.setInstanceCount(value);
    }

    get instanceCount(): number {
        return this._propU32[GeoSlot.InstanceCount];
    }

    set indexFormat(value: IndexFormat) {
        this._nativeObj.setIndexFormat(value);
    }

    get indexFormat(): IndexFormat {
        return this._propU32[GeoSlot.IndexFormat];
    }
}
