import { ILaya3D } from "../../../../../ILaya3D";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { ShaderData } from "../../../../RenderEngine/RenderShader/ShaderData";
import { Texture2D } from "../../../../resource/Texture2D";
import { Sprite3DRenderDeclaration } from "../../../core/render/Sprite3DRenderDeclaration";
import { RenderableSprite3D } from "../../../core/RenderableSprite3D";
import { Volume } from "../Volume";
import { VolumeManager } from "../VolumeManager";

export class VolumetricGI extends Volume {

    /**@internal */
    private _probeCounts: Vector3;

    /**@internal */
    private _probeStep: Vector3;

    /** @internal */
    probeLocations: Float32Array;

    /**
     * @internal
     * x: irradiance probe texel size
     * y: distance probe texel size
     * z: normalBias
     * w: viewBias
     */
    private _params: Vector4;

    /**@internal */
    private _irradiance: Texture2D;

    /**@internal */
    private _distance: Texture2D;

    /**密度 */
    private _intensity: number;

    /**@internal */
    _updateMark: number;

    /**
     * <code>实例化一个体积光照探针<code>
     */
    constructor() {
        super();
        this._type = VolumeManager.VolumetricGIType;
        this._probeCounts = new Vector3();
        this.probeStep = new Vector3();
        this._params = new Vector4(8, 16, 0, 0);
    }

    /**
     * light probe texture
     */
    get irradiance(): Texture2D {
        return this._irradiance;
    }

    set irradiance(value: Texture2D) {
        if (this._irradiance == value)
            return;
        this._irradiance && (this.irradiance._removeReference());
        value && (value._addReference());
        this._irradiance = value;
        this._updateMark = ILaya3D.Scene3D._updateMark;
    }

    /**
     * distance texture
     */
    get distance(): Texture2D {
        return this._distance;
    }

    set distance(value: Texture2D) {
        if (this._distance == value)
            return;
        this._distance && (this._distance._removeReference());
        value && (value._addReference());

        this._distance = value;
        this._updateMark = ILaya3D.Scene3D._updateMark;
    }

    /**
     * normal bias
     */
    get normalBias(): number {
        return this._params.z;
    }

    set normalBias(value: number) {
        this._params.z = value;
        this._updateMark = ILaya3D.Scene3D._updateMark;
    }

    /**
     * view bias
     */
    get viewBias(): number {
        return this._params.w;
    }

    set viewBias(value: number) {
        this._params.w = value;
        this._updateMark = ILaya3D.Scene3D._updateMark;
    }

    /**
     * irradiance Texture one probe texel number
     */
    get irradianceTexel(): number {
        return this._params.x;
    }

    /**
     * distance Texture one probe texel number
     */
    get distanceTexel(): number {
        return this._params.y;
    }

    /**
     * 设置反射探针强度
     */
    get intensity(): number {
        return this._intensity;
    }

    set intensity(value: number) {
        if (value == this._intensity) return;
        value = Math.max(value, 0.0);
        this._updateMark = ILaya3D.Scene3D._updateMark;
    }

    /**
     * 设置反射探针强度
     */
    get probeCounts(): Vector3 {
        return this._probeCounts;
    }

    set probeCounts(value: Vector3) {
        if (value.equal(this._probeCounts)) return;
        value.cloneTo(this._probeCounts);
        this._updateMark = ILaya3D.Scene3D._updateMark;
    }
    /**
 * 设置反射探针强度
 */
    get probeStep(): Vector3 {
        return this._probeCounts;
    }

    set probeStep(value: Vector3) {
        if (value.equal(this._probeStep)) return;
        value.cloneTo(this._probeStep);
        this._updateMark = ILaya3D.Scene3D._updateMark;
    }

    /**
     * @interanl
     * upload volumetric GI data
     * @param shaderData 
     */
    applyVolumetricGI(shaderData: ShaderData) {
        shaderData.addDefine(Sprite3DRenderDeclaration.SHADERDEFINE_VOLUMETRICGI);

        shaderData.setVector3(RenderableSprite3D.VOLUMETRICGI_PROBECOUNTS, this._probeCounts);
        shaderData.setVector3(RenderableSprite3D.VOLUMETRICGI_PROBESTEPS, this._probeStep);

        shaderData.setVector3(RenderableSprite3D.VOLUMETRICGI_PROBESTARTPOS, this.bounds.getMin());
        shaderData.setVector(RenderableSprite3D.VOLUMETRICGI_PROBEPARAMS, this._params);

        shaderData.setTexture(RenderableSprite3D.VOLUMETRICGI_IRRADIANCE, this.irradiance);
        shaderData.setTexture(RenderableSprite3D.VOLUMETRICGI_DISTANCE, this.distance);
    }

    /**
     * @interanl
     */
    _onDestroy() {
        // todo
        this.irradiance = null;
        this.distance = null;
    }

    /**@internal */
    _cloneTo(dest: VolumetricGI): void {
        dest.irradiance = this.irradiance;
        dest.distance = this.distance;
        this._probeCounts.cloneTo(dest._probeCounts);
        this.probeStep.cloneTo(dest.probeStep);
        dest.normalBias = this.normalBias;
        dest.viewBias = this.viewBias;
        dest.intensity = this.intensity;
    }

}