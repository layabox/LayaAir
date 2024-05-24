import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { ICameraNodeData, ISceneNodeData } from "../../Design/3D/I3DRenderModuleData";
import { NativeTransform3D } from "./NativeTransform3D";
export class RTCameraNodeData implements ICameraNodeData {
    private _transform: NativeTransform3D;
    public get transform(): NativeTransform3D {
        return this._transform;
    }
    public set transform(value: NativeTransform3D) {
        this._transform = value;
        this._nativeObj.setTransform(value._nativeObj);
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

    _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchRTCameraNodeData();
    }

    setProjectionViewMatrix(value: Matrix4x4): void {
        value && this._nativeObj.setProjectionViewMatrix(value);
    }
}

export class RTSceneNodeData implements ISceneNodeData {
    public get lightmapDirtyFlag(): number {
        return this._nativeObj._lightmapDirtyFlag;
    }
    public set lightmapDirtyFlag(value: number) {
        this._nativeObj._lightmapDirtyFlag = value;
    }

    _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchRTSceneNodeData();
    }
}
