import { BaseCamera } from "../core/BaseCamera";
import { Camera } from "../core/Camera";
import { Scene3D } from "../core/scene/Scene3D";
import { BoundBox } from "../math/BoundBox";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Vector3 } from "../math/Vector3";
/**
 * ...
 * @author ...
 */
export declare class ParallelSplitShadowMap {
    /**@private */
    static MAX_PSSM_COUNT: number;
    /**@private */
    static _tempVector30: Vector3;
    /**@private */
    private lastNearPlane;
    /**@private */
    private lastFieldOfView;
    /**@private */
    private lastAspectRatio;
    /**@private */
    private _spiltDistance;
    /**@private */
    private _currentPSSM;
    /**@private */
    private _shadowMapCount;
    /**@private */
    private _maxDistance;
    /**@private */
    private _ratioOfDistance;
    /**@private */
    private _globalParallelLightDir;
    /**@private */
    private _statesDirty;
    /**@private */
    cameras: Camera[];
    /**@private */
    private _shadowMapTextureSize;
    /**@private */
    private _scene;
    /**@private */
    private _boundingSphere;
    /**@private */
    _boundingBox: BoundBox[];
    /**@private */
    private _frustumPos;
    /**@private */
    private _uniformDistance;
    /**@private */
    private _logDistance;
    /**@private */
    private _dimension;
    /** @private */
    private _PCFType;
    /** @private */
    private _tempLookAt3;
    /** @private */
    private _tempLookAt4;
    /** @private */
    private _tempValue;
    /** @private */
    private _tempPos;
    /** @private */
    private _tempLightUp;
    /** @private */
    private _tempMin;
    /** @private */
    private _tempMax;
    /** @private */
    private _tempMatrix44;
    /**@private */
    private _splitFrustumCulling;
    /** @private */
    private _tempScaleMatrix44;
    /** @private */
    private _shadowPCFOffset;
    /** @private */
    private _shaderValueDistance;
    /** @private */
    private _shaderValueLightVP;
    /** @private */
    private _shaderValueVPs;
    constructor();
    setInfo(scene: Scene3D, maxDistance: number, globalParallelDir: Vector3, shadowMapTextureSize: number, numberOfPSSM: number, PCFType: number): void;
    setPCFType(PCFtype: number): void;
    getPCFType(): number;
    setFarDistance(value: number): void;
    getFarDistance(): number;
    shadowMapCount: number;
    /**
     * @private
     */
    private _beginSampler;
    /**
     * @private
     */
    endSampler(sceneCamera: BaseCamera): void;
    /**
     * @private
     */
    _calcAllLightCameraInfo(sceneCamera: BaseCamera): void;
    /**
     * @private
     */
    private _recalculate;
    /**
     * @private
     */
    private _update;
    /**
     * @private
     */
    private _uploadShaderValue;
    /**
     * @private
     */
    private _calcSplitDistance;
    /**
     * @private
     */
    _calcBoundingBox(fieldOfView: number, aspectRatio: number): void;
    calcSplitFrustum(sceneCamera: BaseCamera): void;
    /**
     * @private
     */
    private _rebuildRenderInfo;
    /**
     * @private
     */
    private _calcLightViewProject;
    /**
     * 计算两个矩阵的乘法
     * @param	left left矩阵
     * @param	right  right矩阵
     * @param	out  输出矩阵
     */
    static multiplyMatrixOutFloat32Array(left: Matrix4x4, right: Matrix4x4, out: Float32Array): void;
    setShadowMapTextureSize(size: number): void;
    disposeAllRenderTarget(): void;
}
