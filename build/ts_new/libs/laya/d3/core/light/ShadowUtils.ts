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
import { ShadowSliceData, ShadowSpotData } from "../../shadowMap/ShadowSliceData";
import { Utils3D } from "../../utils/Utils3D";
import { DirectionLight } from "./DirectionLight";
import { LightSprite, LightType } from "./LightSprite";
import { ShadowCascadesMode } from "./ShadowCascadesMode";
import { ShadowMode } from "./ShadowMode";
import { SpotLight } from "./SpotLight";
import { SystemUtils } from "../../../webgl/SystemUtils";

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
    private static _tempMatrix0: Matrix4x4 = new Matrix4x4()


    /** @internal */
    private static _shadowMapScaleOffsetMatrix: Matrix4x4 = new Matrix4x4(
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

    /** @internal */
    static readonly atlasBorderSize: number = 4.0;//now max shadow sample tent is 5x5,atlas borderSize at leate 3=ceil(2.5),and +1 pixle is for global border for no cascade mode.

    /**
    * @internal
    */
    static supportShadow(): boolean {
        return LayaGL.layaGPUInstance._isWebGL2 || SystemUtils.supportRenderTextureFormat(RenderTextureFormat.Depth);
    }

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
    static getFarWithRadius(radius: number, denominator: number): number {
        // use the frustum side as the radius and get the far distance form camera.
        // var tFov: number = Math.tan(fov * 0.5);// get this the equation using Pythagorean
        // return Math.sqrt(radius * radius / (1.0 + tFov * tFov * (aspectRatio * aspectRatio + 1.0)));
        return Math.sqrt(radius * radius / denominator);
    }

    /**
    * @internal
    */
    static getCascadesSplitDistance(twoSplitRatio: number, fourSplitRatio: Vector3, cameraNear: number, shadowFar: number, fov: number, aspectRatio: number, cascadesMode: ShadowCascadesMode, out: number[]): void {
        out[0] = cameraNear;
        var range: number = shadowFar - cameraNear;
        var tFov: number = Math.tan(fov * 0.5);
        var denominator: number = 1.0 + tFov * tFov * (aspectRatio * aspectRatio + 1.0);
        switch (cascadesMode) {
            case ShadowCascadesMode.NoCascades:
                out[1] = ShadowUtils.getFarWithRadius(shadowFar, denominator);
                break;
            case ShadowCascadesMode.TwoCascades:
                out[1] = ShadowUtils.getFarWithRadius(cameraNear + range * twoSplitRatio, denominator);
                out[2] = ShadowUtils.getFarWithRadius(shadowFar, denominator);
                break;
            case ShadowCascadesMode.FourCascades:
                out[1] = ShadowUtils.getFarWithRadius(cameraNear + range * fourSplitRatio.x, denominator);
                out[2] = ShadowUtils.getFarWithRadius(cameraNear + range * fourSplitRatio.y, denominator);
                out[3] = ShadowUtils.getFarWithRadius(cameraNear + range * fourSplitRatio.z, denominator);
                out[4] = ShadowUtils.getFarWithRadius(shadowFar, denominator);
                break;
        }
    }

    /**
	 * @internal
	 */
    static applySliceTransform(shadowSliceData: ShadowSliceData, atlasWidth: number, atlasHeight: number, cascadeIndex: number, outShadowMatrices: Float32Array): void {
        // Apply shadow slice scale and offset
        var sliceE: Float32Array = ShadowUtils._tempMatrix0.elements;
        var oneOverAtlasWidth: number = 1.0 / atlasWidth;
        var oneOverAtlasHeight: number = 1.0 / atlasHeight;

        sliceE[0] = shadowSliceData.resolution * oneOverAtlasWidth;//scale
        sliceE[5] = shadowSliceData.resolution * oneOverAtlasHeight;
        sliceE[12] = shadowSliceData.offsetX * oneOverAtlasWidth;//offset
        sliceE[13] = shadowSliceData.offsetY * oneOverAtlasHeight;
        sliceE[1] = sliceE[2] = sliceE[2] = sliceE[4] = sliceE[6] = sliceE[7] = sliceE[8] = sliceE[9] = sliceE[11] = sliceE[14] = 0;
        sliceE[10] = sliceE[15] = 1;

        var offset: number = cascadeIndex * 16;
        Utils3D._mulMatrixArray(sliceE, outShadowMatrices, offset, outShadowMatrices, offset);
    }


    /**
	 * @internal
	 */
    static getDirectionLightShadowCullPlanes(cameraFrustumPlanes: Array<Plane>, cascadeIndex: number, splitDistance: number[], cameraNear: number, direction: Vector3, shadowSliceData: ShadowSliceData): void {
        // http://lspiroengine.com/?p=187
        var frustumCorners: Vector3[] = ShadowUtils._frustumCorners;
        var backPlaneFaces: FrustumFace[] = ShadowUtils._backPlaneFaces;
        var planeNeighbors: FrustumFace[][] = ShadowUtils._frustumPlaneNeighbors;
        var twoPlaneCorners: FrustumCorner[][][] = ShadowUtils._frustumTwoPlaneCorners;
        var edgePlanePoint2: Vector3 = ShadowUtils._edgePlanePoint2;
        var out: Plane[] = shadowSliceData.cullPlanes;

        // cameraFrustumPlanes is share
        var near: Plane = cameraFrustumPlanes[FrustumFace.Near], far: Plane = cameraFrustumPlanes[FrustumFace.Far];
        var left: Plane = cameraFrustumPlanes[FrustumFace.Left], right: Plane = cameraFrustumPlanes[FrustumFace.Right];
        var bottom: Plane = cameraFrustumPlanes[FrustumFace.Bottom], top: Plane = cameraFrustumPlanes[FrustumFace.Top];

        // adjustment the near/far plane
        var splitNearDistance: number = splitDistance[cascadeIndex] - cameraNear;
        var splitNear: Plane = ShadowUtils._adjustNearPlane;
        var splitFar: Plane = ShadowUtils._adjustFarPlane;
        near.normal.cloneTo(splitNear.normal);
        far.normal.cloneTo(splitFar.normal);
        splitNear.distance = near.distance - splitNearDistance;
        splitFar.distance = Math.min(-near.distance + shadowSliceData.sphereCenterZ + shadowSliceData.splitBoundSphere.radius, far.distance);//do a clamp is the sphere is out of range the far plane

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
    static getBoundSphereByFrustum(near: number, far: number, fov: number, aspectRatio: number, cameraPos: Vector3, forward: Vector3, outBoundSphere: BoundSphere): number {
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
        return centerZ;
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
    static getDirectionalLightMatrices(lightUp: Vector3, lightSide: Vector3, lightForward: Vector3, cascadeIndex: number, nearPlane: number, shadowResolution: number, shadowSliceData: ShadowSliceData, shadowMatrices: Float32Array): void {
        var boundSphere: BoundSphere = shadowSliceData.splitBoundSphere;

        // To solve shdow swimming problem.
        var center: Vector3 = boundSphere.center;
        var radius: number = boundSphere.radius;
        var halfShadowResolution: number = shadowResolution / 2;
        // Add border to prject edge pixel PCF.
        // Improve:the clip planes not conside the border,but I think is OK,because the object can clip is not continuous.
        var borderRadius: number = radius * halfShadowResolution / (halfShadowResolution - ShadowUtils.atlasBorderSize);
        var borderDiam: number = borderRadius * 2.0;
        var sizeUnit: number = shadowResolution / borderDiam;
        var radiusUnit: number = borderDiam / shadowResolution;
        var upLen: number = Math.ceil(Vector3.dot(center, lightUp) * sizeUnit) * radiusUnit;
        var sideLen: number = Math.ceil(Vector3.dot(center, lightSide) * sizeUnit) * radiusUnit;
        var forwardLen: number = Vector3.dot(center, lightForward);
        center.x = lightUp.x * upLen + lightSide.x * sideLen + lightForward.x * forwardLen;
        center.y = lightUp.y * upLen + lightSide.y * sideLen + lightForward.y * forwardLen;
        center.z = lightUp.z * upLen + lightSide.z * sideLen + lightForward.z * forwardLen;

        // Direction light use shadow pancaking tech,do special dispose with nearPlane.
        var origin: Vector3 = shadowSliceData.position;
        var viewMatrix: Matrix4x4 = shadowSliceData.viewMatrix;
        var projectMatrix: Matrix4x4 = shadowSliceData.projectionMatrix;
        var viewProjectMatrix: Matrix4x4 = shadowSliceData.viewProjectMatrix;

        shadowSliceData.resolution = shadowResolution;
        shadowSliceData.offsetX = (cascadeIndex % 2) * shadowResolution;
        shadowSliceData.offsetY = Math.floor(cascadeIndex / 2) * shadowResolution;

        Vector3.scale(lightForward, radius + nearPlane, origin);
        Vector3.subtract(center, origin, origin);
        Matrix4x4.createLookAt(origin, center, lightUp, viewMatrix);
        Matrix4x4.createOrthoOffCenter(- borderRadius, borderRadius, - borderRadius, borderRadius, 0.0, radius * 2.0 + nearPlane, projectMatrix);
        Matrix4x4.multiply(projectMatrix, viewMatrix, viewProjectMatrix);
        Utils3D._mulMatrixArray(ShadowUtils._shadowMapScaleOffsetMatrix.elements, viewProjectMatrix.elements, 0, shadowMatrices, cascadeIndex * 16);
    }

    /** 
    * @internal
    */
   static getSpotLightShadowData(shadowSpotData:ShadowSpotData,spotLight:SpotLight,resolution:number,shadowParams:Vector4,shadowSpotMatrices:Matrix4x4,shadowMapSize:Vector4)
   {
        var out:Vector3 = shadowSpotData.position = spotLight.transform.position;
        shadowSpotData.resolution = resolution;
        shadowMapSize.setValue(1.0 / resolution, 1.0 / resolution, resolution, resolution);
        shadowSpotData.offsetX = 0;
        shadowSpotData.offsetY = 0;

        var spotWorldMatrix:Matrix4x4 = spotLight.lightWorldMatrix; 
        var viewMatrix: Matrix4x4 = shadowSpotData.viewMatrix;
        var projectMatrix: Matrix4x4 = shadowSpotData.projectionMatrix;
        var viewProjectMatrix: Matrix4x4 = shadowSpotData.viewProjectMatrix;
        var BoundFrustum:BoundFrustum = shadowSpotData.cameraCullInfo.boundFrustum;
        spotWorldMatrix.invert(viewMatrix);
        Matrix4x4.createPerspective(3.1416*spotLight.spotAngle / 180.0,1,0.1,spotLight.range,projectMatrix);
        shadowParams.y = spotLight.shadowStrength;
        Matrix4x4.multiply(projectMatrix,viewMatrix,viewProjectMatrix);
        BoundFrustum.matrix = viewProjectMatrix;
        viewProjectMatrix.cloneTo(shadowSpotMatrices);
        shadowSpotData.cameraCullInfo.position = out;
   }

    /**
     * @internal
     */
    static prepareShadowReceiverShaderValues(light: DirectionLight, shadowMapWidth: number, shadowMapHeight: number, shadowSliceDatas: ShadowSliceData[], cascadeCount: number, shadowMapSize: Vector4, shadowParams: Vector4, shadowMatrices: Float32Array, splitBoundSpheres: Float32Array): void {
        shadowMapSize.setValue(1.0 / shadowMapWidth, 1.0 / shadowMapHeight, shadowMapWidth, shadowMapHeight);
        shadowParams.setValue(light._shadowStrength, 0.0, 0.0, 0.0);
        if (cascadeCount > 1) {
            const matrixFloatCount: number = 16;
            for (var i: number = cascadeCount * matrixFloatCount, n: number = 4 * matrixFloatCount; i < n; i++)//the last matrix is always ZERO
                shadowMatrices[i] = 0.0;//set Matrix4x4.ZERO to project the cascade index is 4

            for (var i: number = 0; i < cascadeCount; i++) {
                var boundSphere: BoundSphere = shadowSliceDatas[i].splitBoundSphere;
                var center: Vector3 = boundSphere.center;
                var radius: number = boundSphere.radius;
                var offset: number = i * 4;
                splitBoundSpheres[offset] = center.x;
                splitBoundSpheres[offset + 1] = center.y;
                splitBoundSpheres[offset + 2] = center.z;
                splitBoundSpheres[offset + 3] = radius * radius;
            }
            const sphereFloatCount: number = 4;
            for (var i: number = cascadeCount * sphereFloatCount, n: number = 4 * sphereFloatCount; i < n; i++)
                splitBoundSpheres[i] = 0.0;//set Matrix4x4.ZERO to project the cascade index is 4
        }
    }
}