import { Vector4 } from "../../math/Vector4";
import { LightSprite, LightType } from "./LightSprite";
import { SpotLight } from "./SpotLight";
import { MathUtils3D } from "../../math/MathUtils3D";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { ShadowMode } from "./ShadowMode";
import { RenderTexture } from "../../resource/RenderTexture";
import { RenderTextureFormat, RenderTextureDepthFormat } from "../../../resource/RenderTextureFormat";
import { FilterMode } from "../../../resource/FilterMode";
import { LayaGL } from "../../../layagl/LayaGL";
import { WarpMode } from "../../../resource/WrapMode";

/**
 * @internal
 */
export class ShadowUtils {
    /** @internal */
    private static _shadowTextureFormat: RenderTextureFormat;
    /**
     * @internal
     */
    static init(): void {
        //some const value,only init once here.
        if (LayaGL.layaGPUInstance._isWebGL2)
            ShadowUtils._shadowTextureFormat = RenderTextureFormat.ShadowMap;
        else
            ShadowUtils._shadowTextureFormat = RenderTextureFormat.Depth;
    }

    /**
     * @internal
     */
    static getTemporaryShadowTexture(witdh: number, height: number, depthFormat: RenderTextureDepthFormat): RenderTexture {
        var shadowMap: RenderTexture = RenderTexture.createFromPool(witdh, height, ShadowUtils._shadowTextureFormat, depthFormat);
        shadowMap.filterMode = FilterMode.Bilinear;
        shadowMap.wrapModeU = WarpMode.Clamp;
        shadowMap.wrapModeV = WarpMode.Clamp;
        return shadowMap;
    }

    /**
     * @internal
     */
    static getShadowBias(lightSprite: LightSprite, shadowProjectionMatrix: Matrix4x4, shadowResolution: number, out: Vector4): void {
        var frustumSize: number;
        if (lightSprite._lightType == LightType.Directional) {
            // Frustum size is guaranteed to be a cube as we wrap shadow frustum around a sphere
            frustumSize = 2.0 / shadowProjectionMatrix.elements[0];
        }
        else if (lightSprite._lightType == LightType.Spot) {
            // For perspective projections, shadow texel size varies with depth
            // It will only work well if done in receiver side in the pixel shader. Currently We
            // do bias on caster side in vertex shader. When we add shader quality tiers we can properly
            // handle this. For now, as a poor approximation we do a constant bias and compute the size of
            // the frustum as if it was orthogonal considering the size at mid point between near and far planes.
            // Depending on how big the light range is, it will be good enough with some tweaks in bias
            frustumSize = Math.tan((<SpotLight>lightSprite).spotAngle * 0.5 * MathUtils3D.Deg2Rad) * (<SpotLight>lightSprite).range;
        }
        else {
            console.warn("ShadowUtils:Only spot and directional shadow casters are supported now.");
            frustumSize = 0.0;
        }

        // depth and normal bias scale is in shadowmap texel size in world space
        var texelSize: number = frustumSize / shadowResolution;
        var depthBias: number = -lightSprite._shadowDepthBias * texelSize;
        var normalBias: number = -lightSprite._shadowNormalBias * texelSize;

        if (lightSprite.shadowMode == ShadowMode.SoftLow || lightSprite.shadowMode == ShadowMode.SoftHigh) {
            // TODO: depth and normal bias assume sample is no more than 1 texel away from shadowmap
            // This is not true with PCF. Ideally we need to do either
            // cone base bias (based on distance to center sample)
            // or receiver place bias based on derivatives.
            // For now we scale it by the PCF kernel size (5x5)
            const kernelRadius: number = 2.5;
            depthBias *= kernelRadius;
            normalBias *= kernelRadius;
        }

        out.setValue(depthBias, normalBias, 0.0, 0.0);
    }

}