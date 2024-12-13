import { Transform3D } from "../../../../d3/core/Transform3D";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { ICameraNodeData, ISceneNodeData } from "../../Design/3D/I3DRenderModuleData";

export class WebCameraNodeData implements ICameraNodeData {
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

export class WebSceneNodeData implements ISceneNodeData {
    lightmapDirtyFlag: number;
}



