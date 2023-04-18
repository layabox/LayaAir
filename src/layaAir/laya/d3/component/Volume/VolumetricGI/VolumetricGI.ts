import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { ShaderData } from "../../../../RenderEngine/RenderShader/ShaderData";
import { Texture2D } from "../../../../resource/Texture2D";
import { Sprite3DRenderDeclaration } from "../../../core/render/Sprite3DRenderDeclaration";
import { RenderableSprite3D } from "../../../core/RenderableSprite3D";
import { Volume } from "../Volume";
import { VolumeManager } from "../VolumeManager";

export class VolumetricGI extends Volume {

    probeCounts: Vector3;
    probeStep: Vector3;

    /** @internal */
    startPosition: Vector3;

    /** @internal */
    center: Vector3;

    /** @internal */
    probeLocations: Float32Array;

    /**
     * x: irradiance probe texel size
     * y: distance probe texel size
     * z: normalBias
     * w: viewBias
     */
    private _params: Vector4;

    private _irradiance: Texture2D;

    /** @internal */
    public get irradiance(): Texture2D {
        return this._irradiance;
    }
    public set irradiance(value: Texture2D) {
        if (this._irradiance == value)
            return;

        this._irradiance && (this.irradiance._removeReference());
        value && (value._addReference());
        this._irradiance = value;
    }

    private _distance: Texture2D;
    /** @internal */
    public get distance(): Texture2D {
        return this._distance;
    }
    public set distance(value: Texture2D) {
        if (this._distance == value)
            return;
        this._distance && (this._distance._removeReference());
        value && (value._addReference());

        this._distance = value;
    }

    intensity: number;

    constructor() {
        super();
        this._type = VolumeManager.VolumetricGIType;
        this.probeCounts = new Vector3();
        this.probeStep = new Vector3();
        this.center = new Vector3();
        this._params = new Vector4(8, 16, 0, 0);
    }

    public get normalBias(): number {
        return this._params.z;
    }
    public set normalBias(value: number) {
        this._params.z = value;
    }

    public get viewBias(): number {
        return this._params.w;
    }
    public set viewBias(value: number) {
        this._params.w = value;
    }

    public get irradianceTexel(): number {
        return this._params.x;
    }

    public get distanceTexel(): number {
        return this._params.y;
    }

    applyVolumetricGI(shaderData: ShaderData) {
        shaderData.addDefine(Sprite3DRenderDeclaration.SHADERDEFINE_VOLUMETRICGI);

        shaderData.setVector3(RenderableSprite3D.VOLUMETRICGI_PROBECOUNTS, this.probeCounts);
        shaderData.setVector3(RenderableSprite3D.VOLUMETRICGI_PROBESTEPS, this.probeStep);

        shaderData.setVector3(RenderableSprite3D.VOLUMETRICGI_PROBESTARTPOS, this.bounds.getMin());
        shaderData.setVector(RenderableSprite3D.VOLUMETRICGI_PROBEPARAMS, this._params);

        shaderData.setTexture(RenderableSprite3D.VOLUMETRICGI_IRRADIANCE, this.irradiance);
        shaderData.setTexture(RenderableSprite3D.VOLUMETRICGI_DISTANCE, this.distance);

    }

    _onDestroy() {
        // todo
    }

    _cloneTo(dest: VolumetricGI): void {
        // todo
    }

}