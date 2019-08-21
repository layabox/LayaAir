import { Laya3D } from "../../../../Laya3D";
import { Texture2D } from "../../../resource/Texture2D";
import { Camera } from "../../core/Camera";
import { LightQueue } from "../../core/light/LightQueue";
import { PointLight } from "../../core/light/PointLight";
import { SpotLight } from "../../core/light/SpotLight";
import { Scene3D } from "../../core/scene/Scene3D";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { Vector2 } from "../../math/Vector2";
import { Vector3 } from "../../math/Vector3";
import { Utils3D } from "../../utils/Utils3D";
import { Vector4 } from "../../math/Vector4";

/**
 * @internal
 */
class LightBound {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    zMin: number;
    zMax: number;
}

/**
 * @internal
 */
class ClusterData {
    updateMark: number = -1;
    pointLightCount: number = 0;
    spotLightCount: number = 0;
    indices: number[] = new Array(Laya3D._config.maxLightCountPerCluster);
}

/**
 * @internal
 */
export class Cluster {
    private static _tempVector30: Vector3 = new Vector3();
    private static _tempVector31: Vector3 = new Vector3();
    private static _tempVector32: Vector3 = new Vector3();
    private static _tempVector33: Vector3 = new Vector3();
    private static _tempVector34: Vector3 = new Vector3();
    private static _tempVector35: Vector3 = new Vector3();
    private static _tempVector36: Vector3 = new Vector3();
    private static _tempVector37: Vector3 = new Vector3();
    private static _tempLightBound: LightBound = new LightBound();

    private _xSlices: number;
    private _ySlices: number;
    private _zSlices: number;
    private _maxLightsPerCluster: number;
    private _clusterDatas: ClusterData[][][];
    private _clusterPixels: Float32Array;
    private _tanVerFovBy2: number;
    private _updateMark: number = 0;
    private _depthSliceParam: Vector2 = new Vector2();
    private _xySliceParams: Vector4 = new Vector4();

    public _clusterTexture: Texture2D;

    constructor(xSlices: number, ySlices: number, zSlices: number, maxLightsPerCluster: number) {
        this._xSlices = xSlices;
        this._ySlices = ySlices;
        this._zSlices = zSlices;
        this._maxLightsPerCluster = maxLightsPerCluster;

        var clusterTexWidth: number = xSlices * ySlices;
        var clisterTexHeight: number = zSlices * (1 + Math.ceil(maxLightsPerCluster / 4));
        this._clusterTexture = Utils3D._createFloatTextureBuffer(clusterTexWidth, clisterTexHeight);
        this._clusterPixels = new Float32Array(clusterTexWidth * clisterTexHeight * 4);

        //Init for every cluster
        var clusterDatas: ClusterData[][][] = new Array<Array<Array<ClusterData>>>(this._zSlices);
        for (var z = 0; z < this._zSlices; z++) {
            clusterDatas[z] = new Array<Array<ClusterData>>(this._ySlices);
            for (var y = 0; y < this._ySlices; y++) {
                clusterDatas[z][y] = new Array<ClusterData>(this._xSlices);
                for (var x = 0; x < this._xSlices; x++)
                    clusterDatas[z][y][x] = new ClusterData();
            }
        }
        this._clusterDatas = clusterDatas;

        /*
        Layout of clusterTexture
        |------------------------------------------------------U(XY)
        |               cluster0               cluster1       
        |        (Offs|PCou|SCou|XXXX) | (Offs|PCou|SCou|XXXX) 
        |               cluster2               cluster3      
        |        (Offs|PCou|SCou|XXXX) | (Offs|PCou|SCou|XXXX) 
        |-----------------------------------------------------------
        |                                    _                              
        |        (poi0|poi1|spo0|spo1) |(spo2|poi0|poi1|poi2)
        |             _
        |        (poi3|spo0|....|....) |(....|....|....|....) 
        |
        V(Z)
        */
    }

    private _insertSpotLightSphere(origin: Vector3, forward: Vector3, size: number, angle: number, testSphere: Vector4): boolean {
        //combine cone cull and sphere range cull
        var V: Vector3 = Cluster._tempVector35;
        V.x = testSphere.x - origin.x;
        V.y = testSphere.y - origin.y;
        V.z = testSphere.z - origin.z;

        var VlenSq = Vector3.dot(V, V);
        var sphereRadius: number = testSphere.w;

        var rangeCull: boolean = VlenSq > sphereRadius * sphereRadius;
        if (!rangeCull)
            return false;

        var V1len: number = Vector3.dot(V, forward);
        var distanceClosestPoint: number = Math.cos(angle) * Math.sqrt(VlenSq - V1len * V1len) - V1len * Math.sin(angle);

        var angleCull: boolean = distanceClosestPoint > sphereRadius;
        var frontCull: boolean = V1len > sphereRadius + size;
        var backCull: boolean = V1len < -sphereRadius;
        return !(angleCull || frontCull || backCull);
    }

    // private _insertConePlane(origin: Vector3, forward: Vector3, size: number, angle: number, planeNormal: Vector3, distance: number): boolean {
    //     var V1: Vector3 = Cluster._tempVector36;
    //     var V2: Vector3 = Cluster._tempVector37;
    //     Vector3.cross(planeNormal, forward, V1);
    //     Vector3.cross(V1, forward, V2);

    //     const float3 capRimPoint = origin +
    //         size * cos(angle) * forward +
    //         size * sin(angle) * V2;

    //     return dot(float4(capRimPoint, 1.0f), testPlane) >= 0.0f || dot(float4(origin, 1.0f), testPlane) >= 0.0f;
    // }


    private _shrinkXYByRadiusZByDepth(near: number, far: number, lightviewPos: Vector3, radius: number, lightBound: LightBound): boolean {
        var xMin: number, yMin: number, zMin: number;
        var xMax: number, yMax: number, zMax: number;
        var lvX: number = lightviewPos.x, lvY: number = lightviewPos.y, lvZ: number = -lightviewPos.z;// inverse Z

        // slice = Math.log2(z) * (numSlices / Math.log2(far / near)) - Math.log2(near) * numSlices / Math.log2(far / near)
        // slice start from near plane,near is index:0,z must large than near,or the result will NaN
        var minZ: number = lvZ - radius;
        var maxZ: number = lvZ + radius;
        if ((minZ > far) || (maxZ < near))
            return false;
        zMin = Math.floor(Math.log2(Math.max(minZ, near)) * this._depthSliceParam.x - this._depthSliceParam.y);
        zMax = Math.floor(Math.log2(Math.min(maxZ, far)) * this._depthSliceParam.x - this._depthSliceParam.y) + 1;

        var i: number;
        var n: number = this._ySlices + 1;
        var yStart = -this._xySliceParams.y;
        var yLengthPerCluster: number = this._xySliceParams.w;
        for (i = 0; i < n; i++) {
            var angle: number = yStart - yLengthPerCluster * i;
            var bigHypot: number = Math.sqrt(1 + angle * angle);
            var normY: number = 1 / bigHypot;
            var normZ: number = -angle * normY;
            if (lvY * normY + lvZ * normZ > -radius) {//Dot
                yMin = Math.max(0, i - 1);
                break;
            }
        }
        if (i == n)//fail insert
            return false;
        yMax = this._ySlices;
        for (i = yMin + 1; i < n; i++) {
            var angle: number = yStart - yLengthPerCluster * i;
            var bigHypot: number = Math.sqrt(1 + angle * angle);
            var normY: number = 1 / bigHypot;
            var normZ: number = -angle * normY;
            if (lvY * normY + lvZ * normZ > radius) {//Dot
                yMax = Math.max(0, i);
                break;
            }
        }

        var xStart: number = this._xySliceParams.x;
        var xLengthPerCluster: number = this._xySliceParams.z;
        n = this._xSlices + 1;
        for (i = 0; i < n; i++) {
            var angle: number = xStart + xLengthPerCluster * i;
            var bigHypot: number = Math.sqrt(1 + angle * angle);
            var normX: number = 1 / bigHypot;
            var normZ: number = -angle * normX;
            if (lvX * normX + lvZ * normZ < radius) {//Dot
                xMin = Math.max(0, i - 1);
                break;
            }
        }
        xMax = this._xSlices;
        for (var i = xMin + 1; i < n; i++) {
            var angle: number = xStart + xLengthPerCluster * i;
            var bigHypot: number = Math.sqrt(1 + angle * angle);
            var normX: number = 1 / bigHypot;
            var normZ: number = -angle * normX;
            if (lvX * normX + lvZ * normZ < -radius) {//Dot
                xMax = Math.max(0, i);
                break;
            }
        }
        lightBound.xMin = xMin
        lightBound.xMax = xMax;
        lightBound.yMin = yMin;
        lightBound.yMax = yMax;
        lightBound.zMin = zMin;
        lightBound.zMax = zMax;
        return true;
    }

    private _updatePointLight(near: number, far: number, viewMat: Matrix4x4, pointLight: PointLight, lightIndex: number): void {
        var lightBound: LightBound = Cluster._tempLightBound;
        var lightviewPos: Vector3 = Cluster._tempVector30;
        Vector3.transformV3ToV3(pointLight._transform.position, viewMat, lightviewPos);//World to View
        if (!this._shrinkXYByRadiusZByDepth(near, far, lightviewPos, pointLight.range, lightBound))
            return;

        for (var z: number = lightBound.zMin, zEnd: number = lightBound.zMax; z < zEnd; z++) {
            for (var y: number = lightBound.yMin, yEnd: number = lightBound.yMax; y < yEnd; y++) {
                for (var x: number = lightBound.xMin, xEnd: number = lightBound.xMax; x < xEnd; x++) {
                    var data: ClusterData = this._clusterDatas[z][y][x];
                    if (data.updateMark != this._updateMark) {
                        data.pointLightCount = 0;
                        data.spotLightCount = 0;
                        data.updateMark = this._updateMark;
                    }
                    var lightCount: number = data.pointLightCount;
                    if (lightCount < this._maxLightsPerCluster) {
                        data.indices[lightCount] = lightIndex;
                        data.pointLightCount++;
                    }
                }
            }
        }
    }

    private _updateSpotLight(near: number, far: number, viewMat: Matrix4x4, spotLight: SpotLight, lightIndex: number): void {
        // technically could fall outside the bounds we make because the planes themeselves are tilted by some angle
        // the effect is exaggerated the steeper the angle the plane makes is
        var lightBound: LightBound = Cluster._tempLightBound;
        var lightviewPos: Vector3 = Cluster._tempVector30;
        Vector3.transformV3ToV3(spotLight._transform.position, viewMat, lightviewPos);//World to View
        if (!this._shrinkXYByRadiusZByDepth(near, far, lightviewPos, spotLight.range, lightBound))
            return;

        //TODO:go on  shrink

        for (var z: number = lightBound.zMin, zEnd: number = lightBound.zMax; z < zEnd; z++) {
            for (var y: number = lightBound.yMin, yEnd: number = lightBound.yMax; y < yEnd; y++) {
                for (var x: number = lightBound.xMin, xEnd: number = lightBound.xMax; x < xEnd; x++) {
                    var data: ClusterData = this._clusterDatas[z][y][x];
                    if (data.updateMark != this._updateMark) {
                        data.pointLightCount = 0;
                        data.spotLightCount = 0;
                        data.updateMark = this._updateMark;
                    }
                    var lightCount: number = data.pointLightCount + data.spotLightCount;
                    if (lightCount < this._maxLightsPerCluster) {
                        data.indices[lightCount] = lightIndex;
                        data.spotLightCount++;
                    }
                }
            }
        }
    }



    update(camera: Camera, scene: Scene3D): void {
        var xSlices: number = this._xSlices, ySlices: number = this._ySlices, zSlices: number = this._zSlices;
        var camNear: number = camera.nearPlane;
        this._updateMark++;
        this._tanVerFovBy2 = Math.tan(camera.fieldOfView * (Math.PI / 180.0) * 0.5);
        this._depthSliceParam.x = Laya3D._config.clusterZCount / Math.log2(camera.farPlane / camNear);
        this._depthSliceParam.y = Math.log2(camNear) * this._depthSliceParam.x;

        var halfY = Math.tan((camera.fieldOfView / 2) * Math.PI / 180);
        var halfX = camera.aspectRatio * halfY;
        var yLengthPerCluster = 2 * halfY / this._ySlices;
        var xLengthPerCluster = 2 * halfX / this._xSlices;
        this._xySliceParams.x = -halfX;
        this._xySliceParams.y = -halfY;//start from top is more similar to light pixel data
        this._xySliceParams.z = xLengthPerCluster;
        this._xySliceParams.w = yLengthPerCluster;

        var curCount: number = scene._directionallights._length;
        var near: number = camera.nearPlane;
        var far: number = camera.farPlane;
        var viewMat: Matrix4x4 = camera.viewMatrix;

        var pointLights: LightQueue<PointLight> = scene._pointLights;
        var poiElements: PointLight[] = <PointLight[]>pointLights._elements;
        for (var i = 0, n = pointLights._length; i < n; i++ , curCount++)
            this._updatePointLight(near, far, viewMat, poiElements[i], curCount);

        var spotLights: LightQueue<SpotLight> = scene._spotLights;
        var spoElements: SpotLight[] = <SpotLight[]>spotLights._elements;
        for (var i = 0, n = spotLights._length; i < n; i++ , curCount++)
            this._updateSpotLight(near, far, viewMat, spoElements[i], curCount);

        var fixOffset: number = xSlices * ySlices * zSlices * 4;//solve precision problme, if data is big some GPU int(float) have problem
        var lightOff: number = fixOffset;
        var clusterPixels: Float32Array = this._clusterPixels;
        var clusterDatas: ClusterData[][][] = this._clusterDatas;
        for (var z = 0; z < zSlices; z++) {
            for (var y = 0; y < ySlices; y++) {
                for (var x = 0; x < xSlices; x++) {
                    var data: ClusterData = clusterDatas[z][y][x];
                    var clusterOff: number = (x + y * xSlices + z * xSlices * ySlices) * 4;
                    if (data.updateMark !== this._updateMark) {
                        clusterPixels[clusterOff] = 0;
                        clusterPixels[clusterOff + 1] = 0;
                    }
                    else {
                        var indices: number[] = data.indices;
                        var pCount: number = data.pointLightCount;
                        var sCount: number = data.spotLightCount;
                        clusterPixels[clusterOff] = pCount;
                        clusterPixels[clusterOff + 1] = sCount;
                        clusterPixels[clusterOff + 2] = lightOff - fixOffset;
                        for (var i: number = 0; i < pCount; i++)
                            clusterPixels[lightOff++] = indices[i];
                        for (var i: number = 0; i < sCount; i++)
                            clusterPixels[lightOff++] = indices[pCount + i];
                    }
                }
            }
        }
        var width: number = this._clusterTexture.width;
        this._clusterTexture.setSubPixels(0, 0, width, Math.ceil(lightOff / (4 * width)), clusterPixels);
    }
}
