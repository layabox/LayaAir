import { LayaGL } from "../../../layagl/LayaGL";
import { FilterMode } from "../../../resource/FilterMode";
import { RenderTextureDepthFormat, RenderTextureFormat } from "../../../resource/RenderTextureFormat";
import { WarpMode } from "../../../resource/WrapMode";
import { BoundFrustum, FrustumCorner } from "../../math/BoundFrustum";
import { BoundSphere } from "../../math/BoundSphere";
import { MathUtils3D } from "../../math/MathUtils3D";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { Plane } from "../../math/Plane";
import { Vector3 } from "../../math/Vector3";
import { Vector4 } from "../../math/Vector4";
import { RenderTexture } from "../../resource/RenderTexture";
import { ShadowSliceData } from "../../shadowMap/ShadowSliceData";
import { Utils3D } from "../../utils/Utils3D";
import { Camera } from "../Camera";
import { LightSprite, LightType } from "./LightSprite";
import { ShadowCascadesMode } from "./ShadowCascadesMode";
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
    private static _tempVector30: Vector3 = new Vector3();
    /** @internal */
    private static _tempVector31: Vector3 = new Vector3();
    /** @internal */
    private static _tempVector32: Vector3 = new Vector3();
    /** @internal */
    private static _tempBoundSphere0: BoundSphere = new BoundSphere(new Vector3(), 0.0);

    /** @internal */
    static _shadowMapScaleOffsetMatrix: Matrix4x4 = new Matrix4x4(
        0.5, 0.0, 0.0, 0.0,
        0.0, 0.5, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.5, 0.5, 0.0, 1.0,
    );

    /** @internal */
    private static _shadowTextureFormat: RenderTextureFormat;

    /** @internal */
    private static _frustumCorners: Vector3[] = [new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3()];

    /** @internal */
    private static _adjustNearPlane: Plane = new Plane(new Vector3());
    /** @internal */
    private static _adjustFarPlane: Plane = new Plane(new Vector3());
    /** @internal */
    private static _backPlaneFaces: FrustumFace[] = new Array(5);
    /** @internal */
    private static _edgePlanePoint2: Vector3 = new Vector3();

    /** @internal */
    private static _frustumPlaneNeighbors: FrustumFace[][] = [
        [FrustumFace.Left, FrustumFace.Right, FrustumFace.Top, FrustumFace.Bottom],// near
        [FrustumFace.Left, FrustumFace.Right, FrustumFace.Top, FrustumFace.Bottom],// far
        [FrustumFace.Near, FrustumFace.Far, FrustumFace.Top, FrustumFace.Bottom],// left
        [FrustumFace.Near, FrustumFace.Far, FrustumFace.Top, FrustumFace.Bottom],// right
        [FrustumFace.Near, FrustumFace.Far, FrustumFace.Left, FrustumFace.Right],// bottom
        [FrustumFace.Near, FrustumFace.Far, FrustumFace.Left, FrustumFace.Right]];// top

    /** @internal */
    private static _frustumTwoPlaneCorners: FrustumCorner[][][] = [
        [[FrustumCorner.unknown, FrustumCorner.unknown]/* near */, [FrustumCorner.unknown, FrustumCorner.unknown]/* far */, [FrustumCorner.nearBottomLeft, FrustumCorner.nearTopLeft]/* left */, [FrustumCorner.nearTopRight, FrustumCorner.nearBottomRight]/* right */, [FrustumCorner.nearBottomRight, FrustumCorner.nearBottomLeft]/* bottom */, [FrustumCorner.nearTopLeft, FrustumCorner.nearTopRight]/* top */],// near
        [[FrustumCorner.unknown, FrustumCorner.unknown]/* near */, [FrustumCorner.unknown, FrustumCorner.unknown]/* far */, [FrustumCorner.FarTopLeft, FrustumCorner.FarBottomLeft]/* left */, [FrustumCorner.FarBottomRight, FrustumCorner.FarTopRight]/* right */, [FrustumCorner.FarBottomLeft, FrustumCorner.FarBottomRight]/* bottom */, [FrustumCorner.FarTopRight, FrustumCorner.FarTopLeft]/* top */],// far
        [[FrustumCorner.nearTopLeft, FrustumCorner.nearBottomLeft]/* near */, [FrustumCorner.FarBottomLeft, FrustumCorner.FarTopLeft]/* far */, [FrustumCorner.unknown, FrustumCorner.unknown]/* left */, [FrustumCorner.unknown, FrustumCorner.unknown]/* right */, [FrustumCorner.nearBottomLeft, FrustumCorner.FarBottomLeft]/* bottom */, [FrustumCorner.FarTopLeft, FrustumCorner.nearTopLeft]/* top */],// left
        [[FrustumCorner.nearBottomRight, FrustumCorner.nearTopRight]/* near */, [FrustumCorner.FarTopRight, FrustumCorner.FarBottomRight]/* far */, [FrustumCorner.unknown, FrustumCorner.unknown]/* left */, [FrustumCorner.unknown, FrustumCorner.unknown]/* right */, [FrustumCorner.FarBottomRight, FrustumCorner.nearBottomRight]/* bottom */, [FrustumCorner.nearTopRight, FrustumCorner.FarTopRight]/* top */],// right
        [[FrustumCorner.nearBottomLeft, FrustumCorner.nearBottomRight]/* near */, [FrustumCorner.FarBottomRight, FrustumCorner.FarBottomLeft]/* far */, [FrustumCorner.FarBottomLeft, FrustumCorner.nearBottomLeft]/* left */, [FrustumCorner.nearBottomRight, FrustumCorner.FarBottomRight]/* right */, [FrustumCorner.unknown, FrustumCorner.unknown]/* bottom */, [FrustumCorner.unknown, FrustumCorner.unknown]/* top */],// bottom
        [[FrustumCorner.nearTopRight, FrustumCorner.nearTopLeft]/* near */, [FrustumCorner.FarTopLeft, FrustumCorner.FarTopRight]/* far */, [FrustumCorner.nearTopLeft, FrustumCorner.FarTopLeft]/* left */, [FrustumCorner.FarTopRight, FrustumCorner.nearTopRight], [FrustumCorner.unknown/* right */, FrustumCorner.unknown]/* bottom */, [FrustumCorner.unknown, FrustumCorner.unknown]/* top */]// top
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
    static getShadowBias(light: LightSprite, shadowProjectionMatrix: Matrix4x4, shadowResolution: number, out: Vector4): void {
        var frustumSize: number;
        if (light._lightType == LightType.Directional) {
            // Frustum size is guaranteed to be a cube as we wrap shadow frustum around a sphere
            // elements[0] = 2.0 / (right - left)
            frustumSize = 2.0 / shadowProjectionMatrix.elements[0];
        }
        else if (light._lightType == LightType.Spot) {
            // For perspective projections, shadow texel size varies with depth
            // It will only work well if done in receiver side in the pixel shader. Currently We
            // do bias on caster side in vertex shader. When we add shader quality tiers we can properly
            // handle this. For now, as a poor approximation we do a constant bias and compute the size of
            // the frustum as if it was orthogonal considering the size at mid point between near and far planes.
            // Depending on how big the light range is, it will be good enough with some tweaks in bias
            frustumSize = Math.tan((<SpotLight>light).spotAngle * 0.5 * MathUtils3D.Deg2Rad) * (<SpotLight>light).range;
        }
        else {
            console.warn("ShadowUtils:Only spot and directional shadow casters are supported now.");
            frustumSize = 0.0;
        }

        // depth and normal bias scale is in shadowmap texel size in world space
        var texelSize: number = frustumSize / shadowResolution;
        var depthBias: number = -light._shadowDepthBias * texelSize;
        var normalBias: number = -light._shadowNormalBias * texelSize;

        if (light.shadowMode == ShadowMode.SoftHigh) {
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
    static getCameraFrustumPlanes(cameraViewProjectMatrix: Matrix4x4, frustumPlanes: Plane[]): void {
        BoundFrustum.getPlanesFromMatrix(cameraViewProjectMatrix, frustumPlanes[FrustumFace.Near], frustumPlanes[FrustumFace.Far], frustumPlanes[FrustumFace.Left], frustumPlanes[FrustumFace.Right], frustumPlanes[FrustumFace.Top], frustumPlanes[FrustumFace.Bottom]);
    }

    /**
    * @internal
    */
    static getCascadesSplitDistance(twoSplitRatio: number, fourSplitRatio: Vector3, range: number, cascadesMode: ShadowCascadesMode, out: number[]): void {
        out[0] = 0.0;
        switch (cascadesMode) {
            case ShadowCascadesMode.NoCascades:
                out[1] = range;
                break;
            case ShadowCascadesMode.TwoCascades:
                out[1] = range * twoSplitRatio;
                out[2] = range;
                break;
            case ShadowCascadesMode.FourCascades:
                out[1] = range * fourSplitRatio.x;
                out[2] = range * fourSplitRatio.y;
                out[3] = range * fourSplitRatio.z;
                out[4] = range;
                break;
        }
    }


    /**
	 * @internal
	 */
    static getDirectionLightShadowCullPlanes(cameraFrustumPlanes: Array<Plane>, cascadeIndex: number, splitDistance: number[], cameraRange: number, direction: Vector3, shadowSliceData: ShadowSliceData): void {
        // http://lspiroengine.com/?p=187
        var frustumCorners: Vector3[] = ShadowUtils._frustumCorners;
        var backPlaneFaces: FrustumFace[] = ShadowUtils._backPlaneFaces;
        var planeNeighbors: FrustumFace[][] = ShadowUtils._frustumPlaneNeighbors;
        var twoPlaneCorners: FrustumCorner[][][] = ShadowUtils._frustumTwoPlaneCorners;
        // var edgePlanePool: Plane[] = ShadowUtils._edgePlanePool;
        var edgePlanePoint2: Vector3 = ShadowUtils._edgePlanePoint2;
        var out: Plane[] = shadowSliceData.cullPlanes;

        // cameraFrustumPlanes is share
        var near: Plane = cameraFrustumPlanes[FrustumFace.Near], far: Plane = cameraFrustumPlanes[FrustumFace.Far];
        var left: Plane = cameraFrustumPlanes[FrustumFace.Left], right: Plane = cameraFrustumPlanes[FrustumFace.Right];
        var bottom: Plane = cameraFrustumPlanes[FrustumFace.Bottom], top: Plane = cameraFrustumPlanes[FrustumFace.Top];

        // adjustment the near/far plane
        var splitNearDistance: number = splitDistance[cascadeIndex];
        var splitFarDistance: number = splitDistance[cascadeIndex + 1];
        var splitNear: Plane = ShadowUtils._adjustNearPlane;
        var splitFar: Plane = ShadowUtils._adjustFarPlane;
        near.normal.cloneTo(splitNear.normal);
        far.normal.cloneTo(splitFar.normal);
        splitNear.distance = near.distance - splitNearDistance;
        splitFar.distance = far.distance - (cameraRange - splitFarDistance);

        BoundFrustum.get3PlaneInterPoint(splitNear, bottom, right, frustumCorners[FrustumCorner.nearBottomRight]);
        BoundFrustum.get3PlaneInterPoint(splitNear, top, right, frustumCorners[FrustumCorner.nearTopRight]);
        BoundFrustum.get3PlaneInterPoint(splitNear, top, left, frustumCorners[FrustumCorner.nearTopLeft]);
        BoundFrustum.get3PlaneInterPoint(splitNear, bottom, left, frustumCorners[FrustumCorner.nearBottomLeft]);
        BoundFrustum.get3PlaneInterPoint(splitFar, bottom, right, frustumCorners[FrustumCorner.FarBottomRight]);
        BoundFrustum.get3PlaneInterPoint(splitFar, top, right, frustumCorners[FrustumCorner.FarTopRight]);
        BoundFrustum.get3PlaneInterPoint(splitFar, top, left, frustumCorners[FrustumCorner.FarTopLeft]);
        BoundFrustum.get3PlaneInterPoint(splitFar, bottom, left, frustumCorners[FrustumCorner.FarBottomLeft]);


        var backIndex: number = 0;
        for (var i: FrustumFace = 0; i < 6; i++) {// meybe 3、4、5(light eye is at far, forward is near, or orth camera is any axis)
            var plane: Plane;
            switch (i) {
                case FrustumFace.Near:
                    plane = splitNear;
                    break;
                case FrustumFace.Far:
                    plane = splitFar;
                    break;
                default:
                    plane = cameraFrustumPlanes[i];
                    break;
            }
            if (Vector3.dot(plane.normal, direction) < 0.0) {
                plane.cloneTo(out[backIndex]);
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
                    Plane.createPlaneBy3P(point0, point1, edgePlanePoint2, out[edgeIndex++]);
                }
            }
        }
        shadowSliceData.cullPlaneCount = edgeIndex;
    }

    /**
     * @internal
     */
    static getBoundSphereByFrustum(near: number, far: number, fov: number, aspectRatio: number, cameraPos: Vector3, forward: Vector3, outBoundSphere: BoundSphere): void {
        // https://lxjk.github.io/2017/04/15/Calculate-Minimal-Bounding-Sphere-of-Frustum.html
        var centerZ: number;
        var radius: number;
        var k: number = Math.sqrt(1.0 + aspectRatio * aspectRatio) * Math.tan(fov / 2.0);
        var k2: number = k * k;
        var farSNear: number = far - near;
        var farANear: number = far + near;
        if (k2 > farSNear / farANear) {
            centerZ = far;
            radius = far * k;
        }
        else {
            centerZ = 0.5 * farANear * (1 + k2);
            radius = 0.5 * Math.sqrt(farSNear * farSNear + 2.0 * (far * far + near * near) * k2 + farANear * farANear * k2 * k2);
        }

        var center: Vector3 = outBoundSphere.center;
        outBoundSphere.radius = radius;
        Vector3.scale(forward, centerZ, center);
        Vector3.add(cameraPos, center, center);
    }

    /**
     * @inernal
     */
    static getMaxTileResolutionInAtlas(atlasWidth: number, atlasHeight: number, tileCount: number): number {
        var resolution: number = Math.min(atlasWidth, atlasHeight);
        var currentTileCount: number = Math.floor(atlasWidth / resolution) * Math.floor(atlasHeight / resolution);
        while (currentTileCount < tileCount) {
            resolution = Math.floor(resolution >> 1);
            currentTileCount = Math.floor(atlasWidth / resolution) * Math.floor(atlasHeight / resolution);
        }
        return resolution;
    }


    /**
     * @internal
     */
    static getDirectionalLightMatrices(camera: Camera, light: LightSprite, lightWorld: Matrix4x4, cascadeIndex: number, nearPlane: number, shadowResolution: number, outShadowSliceData: ShadowSliceData, outShadowMatrices: Float32Array): void {
        var forward: Vector3 = ShadowUtils._tempVector30;
        var boundSphere: BoundSphere = ShadowUtils._tempBoundSphere0;
        camera._transform.getForward(forward);
        Vector3.normalize(forward, forward);
        ShadowUtils.getBoundSphereByFrustum(camera.nearPlane, Math.min(camera.farPlane, light._shadowDistance), camera.fieldOfView * MathUtils3D.Deg2Rad, camera.aspectRatio, camera._transform.position, forward, boundSphere);

        // to solve shdow swimming problem
        var lightUp: Vector3 = ShadowUtils._tempVector32;
        var lightSide: Vector3 = ShadowUtils._tempVector31;
        var lightForward: Vector3 = ShadowUtils._tempVector30;
        lightSide.setValue(lightWorld.getElementByRowColumn(0, 0), lightWorld.getElementByRowColumn(0, 1), lightWorld.getElementByRowColumn(0, 2));
        lightUp.setValue(lightWorld.getElementByRowColumn(1, 0), lightWorld.getElementByRowColumn(1, 1), lightWorld.getElementByRowColumn(1, 2));
        lightForward.setValue(-lightWorld.getElementByRowColumn(2, 0), -lightWorld.getElementByRowColumn(2, 1), -lightWorld.getElementByRowColumn(2, 2));

        var center: Vector3 = boundSphere.center;
        var radius: number = boundSphere.radius;
        var diam: number = radius * 2.0;
        var sizeUnit: number = shadowResolution / diam;
        var radiusUnit: number = diam / shadowResolution;
        var upLen: number = Math.ceil(Vector3.dot(center, lightUp) * sizeUnit) * radiusUnit;
        var sideLen: number = Math.ceil(Vector3.dot(center, lightSide) * sizeUnit) * radiusUnit;
        var forwardLen: number = Vector3.dot(center, lightForward);
        center.x = lightUp.x * upLen + lightSide.x * sideLen + lightForward.x * forwardLen;
        center.y = lightUp.y * upLen + lightSide.y * sideLen + lightForward.y * forwardLen;
        center.z = lightUp.z * upLen + lightSide.z * sideLen + lightForward.z * forwardLen;

        // direction light use shadow pancaking tech,do special dispose with nearPlane.
        var origin: Vector3 = outShadowSliceData.position;
        var viewMatrix: Matrix4x4 = outShadowSliceData.viewMatrix;
        var projectMatrix: Matrix4x4 = outShadowSliceData.projectionMatrix;
        var viewProjectMatrix: Matrix4x4 = outShadowSliceData.viewProjectMatrix;
        outShadowSliceData.resolution = shadowResolution;
        outShadowSliceData.offsetX = (cascadeIndex % 2) * shadowResolution;
        outShadowSliceData.offsetY = (cascadeIndex / 2) * shadowResolution;

        Vector3.scale(lightForward, radius + nearPlane, origin);
        Vector3.subtract(center, origin, origin);
        Matrix4x4.createLookAt(origin, center, lightUp, viewMatrix);
        Matrix4x4.createOrthoOffCenter(-radius, radius, -radius, radius, 0.0, diam, projectMatrix);
        Matrix4x4.multiply(projectMatrix, viewMatrix, viewProjectMatrix);
        Utils3D._mulMatrixArray(ShadowUtils._shadowMapScaleOffsetMatrix.elements, viewProjectMatrix.elements, outShadowMatrices, cascadeIndex * 16);

        //TODO:atalsUVTransform
    }
}