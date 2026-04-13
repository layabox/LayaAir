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
