import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Transform3D } from "../../../core/Transform3D";


export class GLESCameraNodeData {
    transform: Transform3D;
    farplane: number;
    nearplane: number;
    fieldOfView: number;
    aspectRatio: number;
    private _projectViewMatrix: Matrix4x4;
    constructor() {
        this._projectViewMatrix = new Matrix4x4();
    }
    setProjectionViewMatrix(value: Matrix4x4): void {
        value && value.cloneTo(this._projectViewMatrix);
    }
}

export interface GLESSceneNodeData {
    lightmapDirtyFlag: number;
}