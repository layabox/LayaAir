import { LayaGL } from "../../../layagl/LayaGL";
import { FilterMode } from "../../../resource/FilterMode";
import { RenderTextureDepthFormat, RenderTextureFormat } from "../../../resource/RenderTextureFormat";
import { WarpMode } from "../../../resource/WrapMode";
import { BoundFrustum, FrustumCorner } from "../../math/BoundFrustum";
import { MathUtils3D } from "../../math/MathUtils3D";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { Plane } from "../../math/Plane";
import { Vector3 } from "../../math/Vector3";
import { Vector4 } from "../../math/Vector4";
import { RenderTexture } from "../../resource/RenderTexture";
import { LightSprite, LightType } from "./LightSprite";
import { ShadowMode } from "./ShadowMode";
import { SpotLight } from "./SpotLight";

/**
 * @internal
 */
enum FrustumFace {
    Near = 0,
    Far = 1,
    Left = 2,
    Right = 3,
    Bottom = 4,
    Top = 5,
}

/**
 * @internal
 */
export class ShadowUtils {
    /** @internal */
    private static _shadowTextureFormat: RenderTextureFormat;

    /** @internal */
    private static _frustumCorners: Array<Vector3> = [new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3()];
    /** @internal */
    private static _frustumPlanes: Array<Plane> = new Array(6);
    /** @internal */
    private static _backPlaneFaces: Array<FrustumFace> = new Array(5);
    /** @internal */
    private static _edgePlanePoint2: Vector3 = new Vector3();
    /** @internal */
    private static _edgePlanePool: Array<Plane> = new Array(new Plane(new Vector3()), new Plane(new Vector3()), new Plane(new Vector3()), new Plane(new Vector3()), new Plane(new Vector3()), new Plane(new Vector3()));

    /** @internal */
    private static _frustumPlaneNeighbors: Array<Array<FrustumFace>> = [
        [FrustumFace.Left, FrustumFace.Right, FrustumFace.Top, FrustumFace.Bottom],// near
        [FrustumFace.Left, FrustumFace.Right, FrustumFace.Top, FrustumFace.Bottom],// far
        [FrustumFace.Near, FrustumFace.Far, FrustumFace.Top, FrustumFace.Bottom],// left
        [FrustumFace.Near, FrustumFace.Far, FrustumFace.Top, FrustumFace.Bottom],// right
        [FrustumFace.Near, FrustumFace.Far, FrustumFace.Left, FrustumFace.Right],// bottom
        [FrustumFace.Near, FrustumFace.Far, FrustumFace.Left, FrustumFace.Right]];// top

    /** @internal */
    private static _frustumTwoPlaneCorners: Array<Array<Array<FrustumCorner>>> = [
        [[FrustumCorner.unknown, FrustumCorner.unknown], [FrustumCorner.unknown, FrustumCorner.unknown], [FrustumCorner.nearTopLeft, FrustumCorner.nearBottomLeft], [FrustumCorner.nearBottomRight, FrustumCorner.nearTopRight], [FrustumCorner.nearBottomLeft, FrustumCorner.nearBottomRight], [FrustumCorner.nearTopRight, FrustumCorner.nearTopLeft]],// near
        [[FrustumCorner.unknown, FrustumCorner.unknown], [FrustumCorner.unknown, FrustumCorner.unknown], [FrustumCorner.FarBottomLeft, FrustumCorner.FarTopLeft], [FrustumCorner.FarTopRight, FrustumCorner.FarBottomRight], [FrustumCorner.FarBottomRight, FrustumCorner.FarBottomLeft], [FrustumCorner.FarTopLeft, FrustumCorner.FarTopRight]],// far
        [[FrustumCorner.nearBottomLeft, FrustumCorner.nearTopLeft], [FrustumCorner.FarTopLeft, FrustumCorner.FarBottomLeft], [FrustumCorner.unknown, FrustumCorner.unknown], [FrustumCorner.unknown, FrustumCorner.unknown], [FrustumCorner.FarBottomLeft, FrustumCorner.nearBottomLeft], [FrustumCorner.nearTopLeft, FrustumCorner.FarTopLeft]],// left
        [[FrustumCorner.nearTopRight, FrustumCorner.nearBottomRight], [FrustumCorner.FarBottomRight, FrustumCorner.FarTopRight], [FrustumCorner.unknown, FrustumCorner.unknown], [FrustumCorner.unknown, FrustumCorner.unknown], [FrustumCorner.nearBottomRight, FrustumCorner.FarBottomRight], [FrustumCorner.FarTopRight, FrustumCorner.nearTopRight]],// right
        [[FrustumCorner.nearBottomRight, FrustumCorner.nearBottomLeft], [FrustumCorner.FarBottomLeft, FrustumCorner.FarBottomRight], [FrustumCorner.nearBottomLeft, FrustumCorner.FarBottomLeft], [FrustumCorner.FarBottomRight, FrustumCorner.nearBottomRight], [FrustumCorner.unknown, FrustumCorner.unknown], [FrustumCorner.unknown, FrustumCorner.unknown]],// bottom
        [[FrustumCorner.nearTopLeft, FrustumCorner.nearTopRight], [FrustumCorner.FarTopRight, FrustumCorner.FarTopLeft], [FrustumCorner.FarTopLeft, FrustumCorner.nearTopLeft], [FrustumCorner.nearTopRight, FrustumCorner.FarTopRight], [FrustumCorner.unknown, FrustumCorner.unknown], [FrustumCorner.unknown, FrustumCorner.unknown]]// top
    ];

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



    /**
	 * @internal
	 */
    static getDirationLightShadowCullPlanes(frustum: BoundFrustum, direction: Vector3, out: Array<Plane>): number {
        var frustumPlanes: Array<Plane> = ShadowUtils._frustumPlanes;
        var frustumCorners: Array<Vector3> = ShadowUtils._frustumCorners;
        var backPlaneFaces: Array<FrustumFace> = ShadowUtils._backPlaneFaces;
        var planeNeighbors: Array<Array<FrustumFace>> = ShadowUtils._frustumPlaneNeighbors;
        var twoPlaneCorners: Array<Array<Array<FrustumCorner>>> = ShadowUtils._frustumTwoPlaneCorners;
        var edgePlanePool: Array<Plane> = ShadowUtils._edgePlanePool;
        var edgePlanePoint2: Vector3 = ShadowUtils._edgePlanePoint2;
        frustumPlanes[FrustumFace.Near] = frustum._near;
        frustumPlanes[FrustumFace.Far] = frustum._far;
        frustumPlanes[FrustumFace.Left] = frustum._left;
        frustumPlanes[FrustumFace.Right] = frustum._right;
        frustumPlanes[FrustumFace.Bottom] = frustum._bottom;
        frustumPlanes[FrustumFace.Top] = frustum._top;
        frustum.getCorners(frustumCorners);

        var backIndex: number = 0;
        for (var i: FrustumFace = 0; i < 6; i++) {//meybe 3,maybe 5(light eye is at far, forward is near, or orth camera is any axis)
            var plane: Plane = frustumPlanes[i];
            if (Vector3.dot(plane.normal, direction) < 0.0) {
                out[backIndex] = plane;
                backPlaneFaces[backIndex] = i;
                backIndex++;
            }
        }

        var edgeIndex: number = backIndex;
        for (var i: FrustumFace = 0; i < backIndex; i++) {
            var backFace: FrustumFace = backPlaneFaces[i];
            var neighborFaces: Array<FrustumFace> = planeNeighbors[backFace];
            for (var j: number = 0; j < 4; j++) {
                var neighborFace: FrustumFace = neighborFaces[j];
                var notBackFace: boolean = true;
                for (var k: number = 0; k < backIndex; k++)
                    if (neighborFace == backPlaneFaces[k]) {
                        notBackFace = false;
                        break;
                    }
                if (notBackFace) {
                    var corners: Array<FrustumCorner> = twoPlaneCorners[backFace][neighborFace];
                    var point0: Vector3 = frustumCorners[corners[0]];
                    var point1: Vector3 = frustumCorners[corners[1]];
                    Vector3.add(point0, direction, edgePlanePoint2);
                    var edgePlane: Plane = edgePlanePool[edgeIndex - backIndex];
                    Plane.createPlaneBy3P(point0, point1, edgePlanePoint2, edgePlane);
                    out[edgeIndex++] = edgePlane;
                }
            }
        }
        return edgeIndex;
    }
}