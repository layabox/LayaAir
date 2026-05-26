import { ClassUtils } from "../utils/ClassUtils";

/**
 * Bridge3DData is the data object for Bridge3D configuration.
 * It holds only serializable properties exposed to IDE and .ls files.
 *
 * The runtime manager (Bridge3DSceneInternal) is held separately by Scene.
 * This class has NO runtime references or methods.
 */
export class Bridge3DData {
    private _cameraZDistance: number = 100;
    private _cameraFarPlane: number = 1000;
    private _orthographicCamera: boolean = true;

    /** @internal 反序列化时存储 Scene3D 属性数据，initScene3D 后 apply */
    private _scene3dSettingsData: Record<string, any> = { skyRenderer: {} };
    /** @internal 反序列化时存储 Camera 属性数据，initScene3D 后 apply */
    private _cameraSettingsData: Record<string, any> = {};

    /**
     * @en Camera Z distance.
     * @zh 相机 Z 距离。
     */
    get cameraZDistance(): number {
        return this._cameraZDistance;
    }

    set cameraZDistance(value: number) {
        this._cameraZDistance = value;
    }

    /**
     * @en Camera far clipping plane distance.
     * @zh 相机远裁面距离。
     */
    get cameraFarPlane(): number {
        return this._cameraFarPlane;
    }

    set cameraFarPlane(value: number) {
        this._cameraFarPlane = value;
    }

    /**
     * @en Whether Bridge3D uses an orthographic camera. When false, Bridge3D uses a perspective camera and derives fieldOfView from cameraZDistance to keep the Z=0 plane aligned with 2D pixels. Very small distances are clamped by the runtime maximum FOV.
     * @zh Bridge3D 是否使用正交相机。为 false 时使用透视相机，并根据 cameraZDistance 反推 fieldOfView，使 Z=0 平面继续与 2D 像素对齐。过小的距离会被运行时最大视角限制保护。
     */
    get orthographicCamera(): boolean {
        return this._orthographicCamera;
    }

    set orthographicCamera(value: boolean) {
        this._orthographicCamera = value;
    }

    /**
     * @en Scene3D settings data. Used by runtime deserialization (ObjDecoder merges data into this object).
     * Applied to scene3d during finalization.
     * @zh Scene3D 配置数据。运行时反序列化时 ObjDecoder 将数据 merge 进此对象，
     * 初始化时 apply 到 scene3d。
     */
    get scene3dSettings(): Record<string, any> {
        return this._scene3dSettingsData;
    }

    /**
     * @en Camera settings data. Used by runtime deserialization (ObjDecoder merges data into this object).
     * Applied to sharedCamera during finalization.
     * @zh Camera 配置数据。运行时反序列化时 ObjDecoder 将数据 merge 进此对象，
     * 初始化时 apply 到 sharedCamera。
     */
    get cameraSettings(): Record<string, any> {
        return this._cameraSettingsData;
    }
}

ClassUtils.regClass('Bridge3DData', Bridge3DData);
