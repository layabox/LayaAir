import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { ICameraNodeData } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { LayaXTransform3D } from "./LayaXTransform3D";

/**
 * LayaX CameraNodeData bridge.
 *
 * Wraps camera projection parameters for the Rust rendering pipeline via
 * `conchLayaXCameraNodeData`.
 */
export class LayaXCameraNodeData implements ICameraNodeData {

    /** @internal */
    _nativeObj: any;

    private _transform: LayaXTransform3D;

    public get transform(): LayaXTransform3D {
        return this._transform;
    }
    public set transform(value: LayaXTransform3D) {
        this._transform = value;
        this._nativeObj.setTransform(value ? value._nativeObj : null);
    }

    public get farplane(): number {
        return this._nativeObj._farplane;
    }
    public set farplane(value: number) {
        this._nativeObj._farplane = value;
    }

    public get nearplane(): number {
        return this._nativeObj._nearplane;
    }
    public set nearplane(value: number) {
        this._nativeObj._nearplane = value;
    }

    public get fieldOfView(): number {
        return this._nativeObj._fieldOfView;
    }
    public set fieldOfView(value: number) {
        this._nativeObj._fieldOfView = value;
    }

    public get aspectRatio(): number {
        return this._nativeObj._aspectRatio;
    }
    public set aspectRatio(value: number) {
        this._nativeObj._aspectRatio = value;
    }

    public get handle(): number {
        return this._nativeObj ? this._nativeObj.getHandle() : 0;
    }

    constructor() {
        // Rust 侧 layax_create_camera 负责分配 cull_bit + 4 个 cascade shadow entity
        this._nativeObj = new (window as any).conchLayaXCameraNodeData();
    }

    setProjectionViewMatrix(value: Matrix4x4): void {
        value && this._nativeObj.setProjectionViewMatrix(value.elements);
    }

    setForward(x: number, y: number, z: number): void {
        this._nativeObj.setForward(x, y, z);
    }

    syncProjection(): void {
        this._nativeObj.syncProjection();
    }

    /** 释放 native camera entity（含 cascade shadow entities + cull bit slot）。 */
    destroy(): void {
        if (this._nativeObj) {
            this._nativeObj.destroy();
            this._nativeObj = null;
        }
    }
}
