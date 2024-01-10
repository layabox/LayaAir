import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { ICameraNodeData, ISceneNodeData } from "../../../RenderDriverLayer/RenderModuleData/IModuleData";
import { Transform3D } from "../../../core/Transform3D";


export class GLESCameraNodeData implements ICameraNodeData {
    transform: Transform3D;
    farplane: number;
    nearplane: number;
    fieldOfView: number;
    aspectRatio: number;
    _projectViewMatrix: Matrix4x4;
    constructor() {
        this._projectViewMatrix = new Matrix4x4();
    }
    setProjectionViewMatrix(value: Matrix4x4): void {
        value && value.cloneTo(this._projectViewMatrix);
    }
}

export class GLESSceneNodeData implements ISceneNodeData {
    lightmapDirtyFlag: number;
}