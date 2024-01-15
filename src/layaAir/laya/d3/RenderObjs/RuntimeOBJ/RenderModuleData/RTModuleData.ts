import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { ICameraNodeData, ISceneNodeData } from "../../../RenderDriverLayer/RenderModuleData/IModuleData";
import { Transform3D } from "../../../core/Transform3D";

export class RTCameraNodeData implements ICameraNodeData {
    private _transform: Transform3D;
    public get transform(): Transform3D {
        return this._transform;
    }
    public set transform(value: Transform3D) {
        this._transform = value;
    }
    private _farplane: number;
    public get farplane(): number {
        return this._farplane;
    }
    public set farplane(value: number) {
        this._farplane = value;
    }
    private _nearplane: number;
    public get nearplane(): number {
        return this._nearplane;
    }
    public set nearplane(value: number) {
        this._nearplane = value;
    }
    private _fieldOfView: number;
    public get fieldOfView(): number {
        return this._fieldOfView;
    }
    public set fieldOfView(value: number) {
        this._fieldOfView = value;
    }
    private _aspectRatio: number;
    public get aspectRatio(): number {
        return this._aspectRatio;
    }
    public set aspectRatio(value: number) {
        this._aspectRatio = value;
    }

    private _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchRTCameraNodeData();
    }

    setProjectionViewMatrix(value: Matrix4x4): void {
        throw new Error("Method not implemented.");
    }
}

export class RTSceneNodeData implements ISceneNodeData {
    private _lightmapDirtyFlag: number;
    public get lightmapDirtyFlag(): number {
        return this._lightmapDirtyFlag;
    }
    public set lightmapDirtyFlag(value: number) {
        this._lightmapDirtyFlag = value;
    }

    private _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchRTSceneNodeData();
    }
}