import { BoundFrustum, FrustumCorner } from "../../math/BoundFrustum";
import { BoundSphere } from "../../math/BoundSphere";
import { Plane } from "../../math/Plane";
import { ShadowSliceData } from "../../shadowMap/ShadowSliceData";
import { Utils3D } from "../../utils/Utils3D";
import { ShadowCascadesMode } from "./ShadowCascadesMode";
import { ShadowMode } from "./ShadowMode";
import { Light, LightType } from "./Light";
import { SpotLightCom } from "./SpotLightCom";
import { FilterMode } from "../../../RenderEngine/RenderEnum/FilterMode";
import { WrapMode } from "../../../RenderEngine/RenderEnum/WrapMode";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { TextureCompareMode } from "../../../RenderEngine/RenderEnum/TextureCompareMode";
import { MathUtils3D } from "../../../maths/MathUtils3D";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { RenderTexture } from "../../../resource/RenderTexture";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { LayaGL } from "../../../layagl/LayaGL";

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
 * @en Enum representing the format of the shadow map.
 * @zh 表示阴影贴图格式的枚举。
 */
export enum ShadowMapFormat {
    bit16,
    bit24_8,
    bit32
}

/**
 * @internal
 * @en Utility class for shadow-related calculations and operations.
 * @zh 用于阴影相关计算和操作的实用工具类。
 */
export class ShadowUtils {
    /** @internal */
    private static _adjustNearPlane: Plane;
    /** @internal */
    private static _adjustFarPlane: Plane;
    /** @internal */
    private static _backPlaneFaces: FrustumFace[] = new Array(5);
    /** @internal */
    private static _edgePlanePoint2: Vector3 = new Vector3();

    /**
     * @internal
     * @en The size of the border for the shadow atlas, which is used to avoid shadow artifacts. Now the maximum shadow sample tent is 5x5, so the atlas border size should be at least 3 (ceiling of 2.5), plus 1 pixel for the global border in no cascade mode.
     * @zh 阴影图集的边框大小，用于避免阴影伪影。当前最大阴影采样罩是5x5，因此图集边框大小至少应为3（2.5的上取整），再加上1像素用于无级联模式下的全局边框。
     */
    static readonly atlasBorderSize: number = 4.0;//now max shadow sample tent is 5x5,atlas borderSize at leate 3=ceil(2.5),and +1 pixle is for global border for no cascade mode.

    /**
     * @en Initializes the shadow utility with default planes for adjusting the near and far planes.
     * @zh 使用默认平面初始化阴影工具，以调整近平面和远平面。
     */
    static init() {
        ShadowUtils._adjustNearPlane = new Plane(new Vector3(), 0);
        ShadowUtils._adjustFarPlane = new Plane(new Vector3(), 0);
    }

    /**
     * @internal
     * @en Checks if shadow rendering is supported by the current rendering engine.
     * @zh 检查当前渲染引擎是否支持阴影渲染。
     */
    static supportShadow(): boolean {
        return LayaGL.renderEngine.getCapable(RenderCapable.RenderTextureFormat_Depth);
    }

    /**
     * @internal
     * @en Creates a temporary shadow texture with the specified dimensions and format.
     * @param width The width of the shadow texture.
     * @param height The height of the shadow texture.
     * @param shadowFormat The format of the shadow map.
     * @zh 创建一个具有指定尺寸和格式的临时阴影纹理。
     * @param width 阴影纹理的宽度。
     * @param height 阴影纹理的高度。
     * @param shadowFormat 阴影贴图的格式。
     */
    static getTemporaryShadowTexture(witdh: number, height: number, shadowFormat: ShadowMapFormat): RenderTexture {
        let depthFormat = RenderTargetFormat.DEPTH_16;
        switch (shadowFormat) {
            case ShadowMapFormat.bit16:
                depthFormat = RenderTargetFormat.DEPTH_16;
                break;
            case ShadowMapFormat.bit24_8:
                depthFormat = RenderTargetFormat.DEPTHSTENCIL_24_8;
                break;
            case ShadowMapFormat.bit32:
                depthFormat = RenderTargetFormat.DEPTH_32;
                break;
        }

        var shadowMap: RenderTexture = RenderTexture.createFromPool(witdh, height, depthFormat, RenderTargetFormat.None, false, 1);
        shadowMap.compareMode = TextureCompareMode.LESS;
        shadowMap.filterMode = FilterMode.Bilinear;
        shadowMap.wrapModeU = WrapMode.Clamp;
        shadowMap.wrapModeV = WrapMode.Clamp;
        return shadowMap;
    }

    /**
     * @internal
     * @en Calculates the shadow bias for a light based on the shadow projection matrix and shadow resolution.
     * @param light The light source.
     * @param shadowProjectionMatrix The shadow projection matrix.
     * @param shadowResolution The resolution of the shadow map.
     * @param out The output vector to store the calculated depth and normal bias values.
     * @zh 根据阴影投影矩阵和阴影分辨率为光源计算阴影偏差。
     * @param light 光源。
     * @param shadowProjectionMatrix 阴影投影矩阵。
     * @param shadowResolution 阴影贴图的分辨率。
     * @param out 输出向量，用于存储计算出的深度和法线偏差值。
     */
    static getShadowBias(light: Light, shadowProjectionMatrix: Matrix4x4, shadowResolution: number, out: Vector4): void {
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
            frustumSize = Math.tan((<SpotLightCom>light).spotAngle * 0.5 * MathUtils3D.Deg2Rad) * (<SpotLightCom>light).range;
        }
        else {
            console.warn("ShadowUtils:Only spot and directional shadow casters are supported now.");
            frustumSize = 0.0;
        }

        // depth and normal bias scale is in shadowmap texel size in world space
        var texelSize: number = frustumSize / shadowResolution;
        var depthBias: number = -light.shadowDepthBias * texelSize;
        var normalBias: number = -light.shadowNormalBias * texelSize;

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
     * @en Retrieves the frustum planes from the camera's view-projection matrix.
     * @param cameraViewProjectMatrix The combined camera view and projection matrix.
     * @param frustumPlanes An array to store the retrieved frustum planes.
     * @zh 从相机的视图投影矩阵中检索透视体的各个平面。
     * @param cameraViewProjectMatrix 相机的视图和投影矩阵。
     * @param frustumPlanes 一个数组，用于存储检索到的透视体平面。
     */
    static getCameraFrustumPlanes(cameraViewProjectMatrix: Matrix4x4, frustumPlanes: Plane[]): void {
        BoundFrustum.getPlanesFromMatrix(cameraViewProjectMatrix, frustumPlanes[FrustumFace.Near], frustumPlanes[FrustumFace.Far], frustumPlanes[FrustumFace.Left], frustumPlanes[FrustumFace.Right], frustumPlanes[FrustumFace.Top], frustumPlanes[FrustumFace.Bottom]);
    }

    /**
     * @internal
     * @en Calculates the far distance based on the given radius and denominator.
     * @param radius The radius used for calculation.
     * @param denominator The denominator used in the calculation.
     * @zh 根据给定的半径和分母计算远距离。
     * @param radius 用于计算的半径。
     * @param denominator 计算中使用的分母。
     */
    static getFarWithRadius(radius: number, denominator: number): number {
        // use the frustum side as the radius and get the far distance form camera.
        // var tFov: number = Math.tan(fov * 0.5);// get this the equation using Pythagorean
        // return Math.sqrt(radius * radius / (1.0 + tFov * tFov * (aspectRatio * aspectRatio + 1.0)));
        return Math.sqrt(radius * radius / denominator);
    }

    /**
     * @internal
     * @en Calculates the split distances for cascade shadow mapping.
     * @param twoSplitRatio The split ratio for two cascades.
     * @param fourSplitRatio The split ratios for four cascades.
     * @param cameraNear The near plane distance of the camera.
     * @param shadowFar The far plane distance for shadow rendering.
     * @param fov The field of view of the camera.
     * @param aspectRatio The aspect ratio of the camera.
     * @param cascadesMode The cascade mode (NoCascades, TwoCascades, or FourCascades).
     * @param out The output array to store the calculated split distances.
     * @zh 计算级联阴影映射的分割距离。
     * @param twoSplitRatio 两级级联的分割比例。
     * @param fourSplitRatio 四级级联的分割比例。
     * @param cameraNear 相机的近平面距离。
     * @param shadowFar 阴影渲染的远平面距离。
     * @param fov 相机的视野角度。
     * @param aspectRatio 相机的宽高比。
     * @param cascadesMode 级联模式（无级联、两级级联或四级级联）。
     * @param out 用于存储计算得出的分割距离的输出数组。
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
     * @en Applies transformation to the shadow slice.
     * @param shadowSliceData The data containing the resolution and offset for the shadow slice.
     * @param atlasWidth The width of the shadow map atlas.
     * @param atlasHeight The height of the shadow map atlas.
     * @param cascadeIndex The index of the cascade to apply the transformation to.
     * @param outShadowMatrices The output array to store the transformed shadow matrices.
     * @zh 对阴影切片应用变换。
     * @param shadowSliceData 包含阴影切片的分辨率和偏移量的数据。
     * @param atlasWidth 阴影图集的宽度。
     * @param atlasHeight 阴影图集的高度。
     * @param cascadeIndex 要应用变换的级联索引。
     * @param outShadowMatrices 输出数组，用于存储变换后的阴影矩阵。
     */
    static applySliceTransform(shadowSliceData: ShadowSliceData, atlasWidth: number, atlasHeight: number, cascadeIndex: number, outShadowMatrices: Float32Array): void {
        // Apply shadow slice scale and offset
        var sliceE: Float32Array = _tempMatrix0.elements;
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
     * @en Calculates the culling planes for a directional light shadow from the camera frustum planes and the specified cascade index.
     * @param cameraFrustumPlanes Array containing the planes of the camera frustum.
     * @param cascadeIndex The index of the cascade for which to calculate the shadow culling planes.
     * @param splitDistance Array containing the split distances for the shadow cascades.
     * @param cameraNear The near plane distance of the camera.
     * @param direction The direction of the directional light.
     * @param shadowSliceData The data structure to store the calculated culling planes and related information.
     * @zh 根据相机透视体平面和指定的级联索引计算定向光阴影的剔除平面。
     * @param cameraFrustumPlanes 包含相机透视体平面的数组。
     * @param cascadeIndex 要计算阴影剔除平面的级联索引。
     * @param splitDistance 包含阴影级联分割距离的数组。
     * @param cameraNear 相机的近平面距离。
     * @param direction 定向光的方向。
     * @param shadowSliceData 用于存储计算得到的剔除平面和相关信息的数据结构。
     */
    static getDirectionLightShadowCullPlanes(cameraFrustumPlanes: Array<Plane>, cascadeIndex: number, splitDistance: number[], cameraNear: number, direction: Vector3, shadowSliceData: ShadowSliceData): void {
        // http://lspiroengine.com/?p=187
        var frustumCorners: Vector3[] = _frustumCorners;
        var backPlaneFaces: FrustumFace[] = ShadowUtils._backPlaneFaces;
        var planeNeighbors: FrustumFace[][] = _frustumPlaneNeighbors;
        var twoPlaneCorners: FrustumCorner[][][] = _frustumTwoPlaneCorners;
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
        splitNear.normal = near.normal;
        splitFar.normal = far.normal;
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
     * @en Calculates the minimal bounding sphere of a frustum defined by a camera.
     * @param near The distance to the near plane of the frustum.
     * @param far The distance to the far plane of the frustum.
     * @param fov The field of view angle of the camera.
     * @param aspectRatio The aspect ratio of the camera.
     * @param cameraPos The position of the camera.
     * @param forward The forward direction of the camera.
     * @param outBoundSphere The output bound sphere containing the calculated center and radius.
     * @returns The calculated center Z position of the bounding sphere.
     * @zh 计算由相机定义的透视体的最小边界球。
     * @param near 到透视体近平面的距离。
     * @param far 到透视体远平面的距离。
     * @param fov 相机的视野角度。
     * @param aspectRatio 相机的宽高比。
     * @param cameraPos 相机的位置。
     * @param forward 相机的前方向。
     * @param outBoundSphere 输出边界球，包含计算得到的中心和半径。
     * @returns 计算得到的边界球的中心 Z 位置。
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
        outBoundSphere.center = center;
        return centerZ;
    }

    /**
     * @internal
     * @en Calculates the maximum tile resolution that can fit in the given atlas dimensions.
     * @param atlasWidth The width of the atlas.
     * @param atlasHeight The height of the atlas.
     * @param tileCount The number of tiles to fit in the atlas.
     * @zh 计算在给定的图集尺寸内可以容纳的最大瓦片分辨率。
     * @param atlasWidth 图集的宽度。
     * @param atlasHeight 图集的高度。
     * @param tileCount 需要在图集中容纳的瓦片数量。
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
     * @en Calculates the matrices for directional light shadows.
     * @param lightUp The up vector of the light.
     * @param lightSide The side vector of the light.
     * @param lightForward The forward vector of the light.
     * @param cascadeIndex The index of the current cascade.
     * @param nearPlane The near plane distance.
     * @param shadowResolution The resolution of the shadow map.
     * @param shadowSliceData The data for the shadow slice.
     * @param shadowMatrices The output array for the calculated shadow matrices.
     * @zh 计算定向光阴影的矩阵。
     * @param lightUp 光源的上向量。
     * @param lightSide 光源的侧向量。
     * @param lightForward 光源的前向量。
     * @param cascadeIndex 当前级联的索引。
     * @param nearPlane 近平面距离。
     * @param shadowResolution 阴影贴图的分辨率。
     * @param shadowSliceData 阴影切片的数据。
     * @param shadowMatrices 用于存储计算得出的阴影矩阵的输出数组。
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
        boundSphere.center = center;

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
        Matrix4x4.createOrthoOffCenter(-borderRadius, borderRadius, -borderRadius, borderRadius, 0.0, radius * 2.0 + nearPlane, projectMatrix);
        Matrix4x4.multiply(projectMatrix, viewMatrix, viewProjectMatrix);
        let offsetMat = _shadowMapScaleOffsetMatrix.elements;
        if (LayaGL.renderEngine._screenInvertY) {
            offsetMat = _shadowMapInvertScaleOffsetMatrix.elements;
        }
        Utils3D._mulMatrixArray(offsetMat, viewProjectMatrix.elements, 0, shadowMatrices, cascadeIndex * 16);
    }

    // /** 
    // * @internal
    // */
    // static getSpotLightShadowData(shadowSpotData: ShadowSpotData, spotLight: SpotLightCom, resolution: number, shadowParams: Vector4, shadowSpotMatrices: Matrix4x4, shadowMapSize: Vector4) {
    //     var out: Vector3 = shadowSpotData.position = (spotLight.owner as Sprite3D).transform.position;
    //     shadowSpotData.resolution = resolution;
    //     shadowMapSize.setValue(1.0 / resolution, 1.0 / resolution, resolution, resolution);
    //     shadowSpotData.offsetX = 0;
    //     shadowSpotData.offsetY = 0;

    //     var spotWorldMatrix: Matrix4x4 = spotLight.lightWorldMatrix;
    //     var viewMatrix: Matrix4x4 = shadowSpotData.viewMatrix;
    //     var projectMatrix: Matrix4x4 = shadowSpotData.projectionMatrix;
    //     var viewProjectMatrix: Matrix4x4 = shadowSpotData.viewProjectMatrix;
    //     var BoundFrustum: BoundFrustum = shadowSpotData.cameraCullInfo.boundFrustum;
    //     spotWorldMatrix.invert(viewMatrix);
    //     Matrix4x4.createPerspective(3.1416 * spotLight.spotAngle / 180.0, 1, 0.1, spotLight.range, projectMatrix);
    //     shadowParams.y = spotLight.shadowStrength;
    //     Matrix4x4.multiply(projectMatrix, viewMatrix, viewProjectMatrix);
    //     BoundFrustum.matrix = viewProjectMatrix;
    //     viewProjectMatrix.cloneTo(shadowSpotMatrices);
    //     shadowSpotData.cameraCullInfo.position = out;
    // }

    /**
     * @internal
     * @en Prepares shader values for shadow receivers.
     * @param shadowMapWidth The width of the shadow map.
     * @param shadowMapHeight The height of the shadow map.
     * @param shadowSliceDatas An array of ShadowSliceData objects.
     * @param cascadeCount The number of shadow cascades.
     * @param shadowMapSize A Vector4 to store shadow map size information.
     * @param shadowMatrices A Float32Array to store shadow matrices.
     * @param splitBoundSpheres A Float32Array to store split bound spheres.
     * @zh 为阴影接收者准备着色器值。
     * @param shadowMapWidth 阴影贴图的宽度。
     * @param shadowMapHeight 阴影贴图的高度。
     * @param shadowSliceDatas 阴影切片数据对象的数组。
     * @param cascadeCount 阴影级联的数量。
     * @param shadowMapSize 用于存储阴影贴图大小信息的 Vector4。
     * @param shadowMatrices 用于存储阴影矩阵的 Float32Array。
     * @param splitBoundSpheres 用于存储分割边界球的 Float32Array。
     */
    static prepareShadowReceiverShaderValues(shadowMapWidth: number, shadowMapHeight: number, shadowSliceDatas: ShadowSliceData[], cascadeCount: number, shadowMapSize: Vector4, shadowMatrices: Float32Array, splitBoundSpheres: Float32Array): void {
        shadowMapSize.setValue(1.0 / shadowMapWidth, 1.0 / shadowMapHeight, shadowMapWidth, shadowMapHeight);
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

const _tempMatrix0: Matrix4x4 = new Matrix4x4()
const _shadowMapScaleOffsetMatrix: Matrix4x4 = new Matrix4x4(
    0.5, 0.0, 0.0, 0.0,
    0.0, 0.5, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.5, 0.5, 0.0, 1.0,
);
const _shadowMapInvertScaleOffsetMatrix = new Matrix4x4(
    0.5, 0.0, 0.0, 0.0,
    0.0, -0.5, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.5, 0.5, 0.0, 1.0,
);
const _frustumCorners: Vector3[] = [new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3()];
const _frustumPlaneNeighbors: FrustumFace[][] = [
    [FrustumFace.Left, FrustumFace.Right, FrustumFace.Top, FrustumFace.Bottom],// near
    [FrustumFace.Left, FrustumFace.Right, FrustumFace.Top, FrustumFace.Bottom],// far
    [FrustumFace.Near, FrustumFace.Far, FrustumFace.Top, FrustumFace.Bottom],// left
    [FrustumFace.Near, FrustumFace.Far, FrustumFace.Top, FrustumFace.Bottom],// right
    [FrustumFace.Near, FrustumFace.Far, FrustumFace.Left, FrustumFace.Right],// bottom
    [FrustumFace.Near, FrustumFace.Far, FrustumFace.Left, FrustumFace.Right]];// top

const _frustumTwoPlaneCorners: FrustumCorner[][][] = [
    [[FrustumCorner.unknown, FrustumCorner.unknown]/* near */, [FrustumCorner.unknown, FrustumCorner.unknown]/* far */, [FrustumCorner.nearBottomLeft, FrustumCorner.nearTopLeft]/* left */, [FrustumCorner.nearTopRight, FrustumCorner.nearBottomRight]/* right */, [FrustumCorner.nearBottomRight, FrustumCorner.nearBottomLeft]/* bottom */, [FrustumCorner.nearTopLeft, FrustumCorner.nearTopRight]/* top */],// near
    [[FrustumCorner.unknown, FrustumCorner.unknown]/* near */, [FrustumCorner.unknown, FrustumCorner.unknown]/* far */, [FrustumCorner.FarTopLeft, FrustumCorner.FarBottomLeft]/* left */, [FrustumCorner.FarBottomRight, FrustumCorner.FarTopRight]/* right */, [FrustumCorner.FarBottomLeft, FrustumCorner.FarBottomRight]/* bottom */, [FrustumCorner.FarTopRight, FrustumCorner.FarTopLeft]/* top */],// far
    [[FrustumCorner.nearTopLeft, FrustumCorner.nearBottomLeft]/* near */, [FrustumCorner.FarBottomLeft, FrustumCorner.FarTopLeft]/* far */, [FrustumCorner.unknown, FrustumCorner.unknown]/* left */, [FrustumCorner.unknown, FrustumCorner.unknown]/* right */, [FrustumCorner.nearBottomLeft, FrustumCorner.FarBottomLeft]/* bottom */, [FrustumCorner.FarTopLeft, FrustumCorner.nearTopLeft]/* top */],// left
    [[FrustumCorner.nearBottomRight, FrustumCorner.nearTopRight]/* near */, [FrustumCorner.FarTopRight, FrustumCorner.FarBottomRight]/* far */, [FrustumCorner.unknown, FrustumCorner.unknown]/* left */, [FrustumCorner.unknown, FrustumCorner.unknown]/* right */, [FrustumCorner.FarBottomRight, FrustumCorner.nearBottomRight]/* bottom */, [FrustumCorner.nearTopRight, FrustumCorner.FarTopRight]/* top */],// right
    [[FrustumCorner.nearBottomLeft, FrustumCorner.nearBottomRight]/* near */, [FrustumCorner.FarBottomRight, FrustumCorner.FarBottomLeft]/* far */, [FrustumCorner.FarBottomLeft, FrustumCorner.nearBottomLeft]/* left */, [FrustumCorner.nearBottomRight, FrustumCorner.FarBottomRight]/* right */, [FrustumCorner.unknown, FrustumCorner.unknown]/* bottom */, [FrustumCorner.unknown, FrustumCorner.unknown]/* top */],// bottom
    [[FrustumCorner.nearTopRight, FrustumCorner.nearTopLeft]/* near */, [FrustumCorner.FarTopLeft, FrustumCorner.FarTopRight]/* far */, [FrustumCorner.nearTopLeft, FrustumCorner.FarTopLeft]/* left */, [FrustumCorner.FarTopRight, FrustumCorner.nearTopRight], [FrustumCorner.unknown/* right */, FrustumCorner.unknown]/* bottom */, [FrustumCorner.unknown, FrustumCorner.unknown]/* top */]// top
];