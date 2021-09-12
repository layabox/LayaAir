import { Config3D } from "../../../../Config3D";
import { Texture2D } from "../../../resource/Texture2D";
import { Camera } from "../../core/Camera";
import { LightQueue } from "../../core/light/LightQueue";
import { PointLight } from "../../core/light/PointLight";
import { SpotLight } from "../../core/light/SpotLight";
import { Scene3D } from "../../core/scene/Scene3D";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { Vector2 } from "../../math/Vector2";
import { Vector3 } from "../../math/Vector3";
import { Vector4 } from "../../math/Vector4";
import { Utils3D } from "../../utils/Utils3D";

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
    indices: number[] = [];
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

    static instance: Cluster;

    private _xSlices: number;
    private _ySlices: number;
    private _zSlices: number;
    private _clusterDatas: ClusterData[][][];
    private _clusterPixels: Float32Array;
    private _updateMark: number = 0;
    private _depthSliceParam: Vector2 = new Vector2();

    public _clusterTexture: Texture2D;

    constructor(xSlices: number, ySlices: number, zSlices: number, maxLightsPerClusterAverage: number) {
        this._xSlices = xSlices;
        this._ySlices = ySlices;
        this._zSlices = zSlices;
        var clusterTexWidth: number = xSlices * ySlices;
        var clisterTexHeight: number = zSlices * (1 + Math.ceil(maxLightsPerClusterAverage / 4));
        this._clusterTexture = Utils3D._createFloatTextureBuffer(clusterTexWidth, clisterTexHeight);
        this._clusterTexture.lock = true;
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
        |        (PCou|SCou|Off0|Off1) | (PCou|SCou|Off0|Off1) 
        |               cluster2               cluster3      
        |        (PCou|SCou|Off0|Off1) | (PCou|SCou|Off0|Off1) 
        |-----------------------------------------------------------
        |                                    _                              
        |        (poi0|poi1|spo0|spo1) |(spo2|poi0|poi1|poi2)
        |             _
        |        (poi3|spo0|....|....) |(....|....|....|....) 
        |
        V(Z)
        */
    }

    // private _insertSpotLightSphere(origin: Vector3, forward: Vector3, size: number, angle: number, testSphere: Vector4): boolean {
    //     //combine cone cull and sphere range cull
    //     var V: Vector3 = Cluster._tempVector35;
    //     V.x = testSphere.x - origin.x;
    //     V.y = testSphere.y - origin.y;
    //     V.z = testSphere.z - origin.z;

    //     var VlenSq = Vector3.dot(V, V);
    //     var sphereRadius: number = testSphere.w;

    //     var rangeCull: boolean = VlenSq > sphereRadius * sphereRadius;
    //     if (!rangeCull)
    //         return false;

    //     var V1len: number = Vector3.dot(V, forward);
    //     var distanceClosestPoint: number = Math.cos(angle) * Math.sqrt(VlenSq - V1len * V1len) - V1len * Math.sin(angle);

    //     var angleCull: boolean = distanceClosestPoint > sphereRadius;
    //     var frontCull: boolean = V1len > sphereRadius + size;
    //     var backCull: boolean = V1len < -sphereRadius;
    //     return !(angleCull || frontCull || backCull);
    // }

    private _placePointLightToClusters(lightIndex: number, lightBound: LightBound): void {
        var clusterDatas: ClusterData[][][] = this._clusterDatas;
        var updateMark: number = this._updateMark;
        for (var z: number = lightBound.zMin, zEnd: number = lightBound.zMax; z < zEnd; z++) {
            for (var y: number = lightBound.yMin, yEnd: number = lightBound.yMax; y < yEnd; y++) {
                for (var x: number = lightBound.xMin, xEnd: number = lightBound.xMax; x < xEnd; x++) {
                    var data: ClusterData = clusterDatas[z][y][x];
                    if (data.updateMark != updateMark) {
                        data.pointLightCount = 0;
                        data.spotLightCount = 0;
                        data.updateMark = updateMark;
                    }
                    var indices: number[] = data.indices;
                    var lightCount: number = data.pointLightCount++;
                    if (lightCount < indices.length)
                        indices[lightCount] = lightIndex;
                    else
                        indices.push(lightIndex);
                }
            }
        }
    }

    private _placeSpotLightToClusters(lightIndex: number, lightBound: LightBound): void {
        var clusterDatas: ClusterData[][][] = this._clusterDatas;
        var updateMark: number = this._updateMark;
        for (var z: number = lightBound.zMin, zEnd: number = lightBound.zMax; z < zEnd; z++) {
            for (var y: number = lightBound.yMin, yEnd: number = lightBound.yMax; y < yEnd; y++) {
                for (var x: number = lightBound.xMin, xEnd: number = lightBound.xMax; x < xEnd; x++) {
                    var data: ClusterData = clusterDatas[z][y][x];
                    if (data.updateMark != updateMark) {
                        data.pointLightCount = 0;
                        data.spotLightCount = 0;
                        data.updateMark = updateMark;
                    }
                    var indices: number[] = data.indices;
                    var lightCount: number = data.pointLightCount + data.spotLightCount++;
                    if (lightCount < indices.length)
                        indices[lightCount] = lightIndex;
                    else
                        indices.push(lightIndex);
                }
            }
        }
    }


    private _insertConePlane(origin: Vector3, forward: Vector3, radius: number, halfAngle: number, pNor: Vector3): boolean {
        //https://bartwronski.com/2017/04/13/cull-that-cone/
        //because distance is always zero so we ease this method
        var V1: Vector3 = Cluster._tempVector36;
        var V2: Vector3 = Cluster._tempVector37;
        Vector3.cross(pNor, forward, V1);
        Vector3.cross(V1, forward, V2);
        Vector3.normalize(V2, V2);
        var tanR: number = radius * Math.tan(halfAngle);
        var capRimX: number = origin.x + radius * forward.x + tanR * V2.x;
        var capRimY: number = origin.y + radius * forward.y + tanR * V2.y;
        var capRimZ: number = origin.z + radius * forward.z + tanR * V2.z;

        return capRimX * pNor.x + capRimY * pNor.y + capRimZ * pNor.z <= 0 || origin.x * pNor.x + origin.y * pNor.y + origin.z * pNor.z <= 0;
    }


    private _shrinkSphereLightZPerspective(near: number, far: number, lightviewPos: Vector3, radius: number, lightBound: LightBound): boolean {
        var lvZ: number = lightviewPos.z;
        var minZ: number = lvZ - radius;
        var maxZ: number = lvZ + radius;

        if ((minZ > far) || (maxZ <= near))
            return false;
        // slice = Math.log2(z) * (numSlices / Math.log2(far / near)) - Math.log2(near) * numSlices / Math.log2(far / near)
        // slice start from near plane,near is index:0,z must large than near,or the result will NaN
        var depthSliceParam: Vector2 = this._depthSliceParam;
        lightBound.zMin = Math.floor(Math.log2(Math.max(minZ, near)) * depthSliceParam.x - depthSliceParam.y);
        lightBound.zMax = Math.min(Math.ceil(Math.log2(maxZ) * depthSliceParam.x - depthSliceParam.y), this._zSlices);
        return true;
    }

    private _shrinkSpotLightZPerspective(near: number, far: number, viewLightPos: Vector3, viewConeCap: Vector3, radius: number, halfAngle: number, lightBound: LightBound): boolean {
        //https://bartwronski.com/2017/04/13/cull-that-cone/
        //http://www.iquilezles.org/www/articles/diskbbox/diskbbox.htm

        var pbX: number = viewConeCap.x, pbY: number = viewConeCap.y, pbZ: number = viewConeCap.z;
        var rb: number = Math.tan(halfAngle) * radius;
        var paX: number = viewLightPos.x, paY: number = viewLightPos.y, paZ: number = viewLightPos.z;
        var aX: number = pbX - paX, aY: number = pbY - paY, aZ: number = pbZ - paZ;
        var dotA: number = aX * aX + aY * aY + aZ * aZ;
        var eZ: number = Math.sqrt(1.0 - aZ * aZ / dotA);

        //flat-capped cone is not spotLight shape,spoltlight is sphere-capped.so we get the common boundBox of flat-capped cone bounds and sphere bounds.
        var minZ: number = Math.max(Math.min(paZ, pbZ - eZ * rb), viewLightPos.z - radius);
        var maxZ: number = Math.min(Math.max(paZ, pbZ + eZ * rb), viewLightPos.z + radius);

        if ((minZ > far) || (maxZ <= near))
            return false;
        // slice = Math.log2(z) * (numSlices / Math.log2(far / near)) - Math.log2(near) * numSlices / Math.log2(far / near)
        // slice start from near plane,near is index:0,z must large than near,or the result will NaN
        var depthSliceParam: Vector2 = this._depthSliceParam;
        lightBound.zMin = Math.floor(Math.log2(Math.max(minZ, near)) * depthSliceParam.x - depthSliceParam.y);
        lightBound.zMax = Math.min(Math.ceil(Math.log2(maxZ) * depthSliceParam.x - depthSliceParam.y), this._zSlices);
        return true;
    }

    private _shrinkSphereLightByBoundOrth(halfX: number, halfY: number, near: number, far: number, lightviewPos: Vector3, radius: number, lightBound: LightBound): boolean {
        var lvZ: number = lightviewPos.z;
        var minZ: number = lvZ - radius, maxZ: number = lvZ + radius;
        if ((minZ > far) || (maxZ <= near))
            return false;
        var lvX: number = lightviewPos.x;
        var minX: number = lvX - radius, maxX: number = lvX + radius;
        if ((minX > halfX) || (maxX <= -halfX))
            return false;
        var lvY: number = lightviewPos.y;
        var minY: number = lvY - radius, maxY: number = lvY + radius;
        if ((minY > halfY) || (maxY <= -halfY))
            return false;

        // slice = Math.log2(z) * (numSlices / Math.log2(far / near)) - Math.log2(near) * numSlices / Math.log2(far / near)
        // slice start from near plane,near is index:0,z must large than near,or the result will NaN
        var xSlices: number = this._xSlices, ySlices: number = this._ySlices;
        var depthSliceParam: Vector2 = this._depthSliceParam;
        var xStride: number = halfX * 2 / xSlices, yStride: number = halfY * 2 / ySlices;
        lightBound.xMin = Math.max(Math.floor((minX + halfX) / xStride), 0);
        lightBound.xMax = Math.min(Math.ceil((maxX + halfX) / xStride), xSlices);
        lightBound.yMin = Math.max(Math.floor((halfY - maxY) / yStride), 0);//zero is from top
        lightBound.yMax = Math.min(Math.ceil((halfY - minY) / yStride), ySlices);
        lightBound.zMin = Math.floor(Math.log2(Math.max(minZ, near)) * depthSliceParam.x - depthSliceParam.y);
        lightBound.zMax = Math.min(Math.ceil(Math.log2(maxZ) * depthSliceParam.x - depthSliceParam.y), this._zSlices);
        return true;
    }

    private _shrinkSpotLightByBoundOrth(halfX: number, halfY: number, near: number, far: number, viewLightPos: Vector3, viewConeCap: Vector3, radius: number, halfAngle: number, lightBound: LightBound): boolean {
        //https://bartwronski.com/2017/04/13/cull-that-cone/
        //http://www.iquilezles.org/www/articles/diskbbox/diskbbox.htm
        var pbX: number = viewConeCap.x, pbY: number = viewConeCap.y, pbZ: number = viewConeCap.z;
        var rb: number = Math.tan(halfAngle) * radius;
        var paX: number = viewLightPos.x, paY: number = viewLightPos.y, paZ: number = viewLightPos.z;
        var aX: number = pbX - paX, aY: number = pbY - paY, aZ: number = pbZ - paZ;
        var dotA: number = aX * aX + aY * aY + aZ * aZ;

        //flat-capped cone is not spotLight shape,spoltlight is sphere-capped.so we get the common boundBox of flat-capped cone bounds and sphere bounds.
        var eZ: number = Math.sqrt(1.0 - aZ * aZ / dotA);
        var minZ: number = Math.max(Math.min(paZ, pbZ - eZ * rb), viewLightPos.z - radius);
        var maxZ: number = Math.min(Math.max(paZ, pbZ + eZ * rb), viewLightPos.z + radius);
        if ((minZ > far) || (maxZ <= near))
            return false;
        var eX: number = Math.sqrt(1.0 - aX * aX / dotA);
        var minX: number = Math.max(Math.min(paX, pbX - eX * rb), viewLightPos.x - radius);
        var maxX: number = Math.min(Math.max(paX, pbX + eX * rb), viewLightPos.x + radius);
        if ((minX > halfX) || (maxX <= -halfX))
            return false;
        var eY: number = Math.sqrt(1.0 - aY * aY / dotA);
        var minY: number = Math.max(Math.min(paY, pbY - eY * rb), viewLightPos.y - radius);
        var maxY: number = Math.min(Math.max(paY, pbY + eY * rb), viewLightPos.y + radius);
        if ((minY > halfY) || (maxY <= -halfY))
            return false;

        // slice = Math.log2(z) * (numSlices / Math.log2(far / near)) - Math.log2(near) * numSlices / Math.log2(far / near)
        // slice start from near plane,near is index:0,z must large than near,or the result will NaN
        var xSlices: number = this._xSlices, ySlices: number = this._ySlices;
        var depthSliceParam: Vector2 = this._depthSliceParam;
        var xStride: number = halfX * 2 / xSlices, yStride: number = halfY * 2 / ySlices;
        lightBound.xMin = Math.max(Math.floor((minX + halfX) / xStride), 0);
        lightBound.xMax = Math.min(Math.ceil((maxX + halfX) / xStride), xSlices);
        lightBound.yMin = Math.max(Math.floor((halfY - maxY) / yStride), 0);//zero is from top
        lightBound.yMax = Math.min(Math.ceil((halfY - minY) / yStride), ySlices);
        lightBound.zMin = Math.floor(Math.log2(Math.max(minZ, near)) * depthSliceParam.x - depthSliceParam.y);
        lightBound.zMax = Math.min(Math.ceil(Math.log2(maxZ) * depthSliceParam.x - depthSliceParam.y), this._zSlices);
        return true;
    }


    private _shrinkXYByRadiusPerspective(lightviewPos: Vector3, radius: number, lightBound: LightBound, xPlanes: Vector3[], yPlanes: Vector3[]): boolean {
        var xMin: number, yMin: number;
        var xMax: number, yMax: number;
        var lvX: number = lightviewPos.x, lvY: number = lightviewPos.y, lvZ: number = lightviewPos.z;

        var i: number;
        var n: number = this._ySlices + 1;
        for (i = 0; i < n; i++) {
            var plane: Vector3 = yPlanes[i];
            if (lvY * plane.y + lvZ * plane.z < radius) {//Dot
                yMin = Math.max(0, i - 1);
                break;
            }
        }
        if (i == n)//fail scan insert
            return false;
        yMax = this._ySlices;
        for (i = yMin + 1; i < n; i++) {
            var plane: Vector3 = yPlanes[i];
            if (lvY * plane.y + lvZ * plane.z <= -radius) {//Dot
                yMax = Math.max(0, i);
                break;
            }
        }

        n = this._xSlices + 1;
        for (i = 0; i < n; i++) {
            var plane: Vector3 = xPlanes[i];
            if (lvX * plane.x + lvZ * plane.z < radius) {//Dot
                xMin = Math.max(0, i - 1);
                break;
            }
        }
        xMax = this._xSlices;
        for (i = xMin + 1; i < n; i++) {
            var plane: Vector3 = xPlanes[i];
            if (lvX * plane.x + lvZ * plane.z <= -radius) {//Dot
                xMax = Math.max(0, i);
                break;
            }
        }


        lightBound.xMin = xMin
        lightBound.xMax = xMax;
        lightBound.yMin = yMin;
        lightBound.yMax = yMax;
        return true;
    }

    private _shrinkSpotXYByConePerspective(lightviewPos: Vector3, viewForward: Vector3, radius: number, halfAngle: number, lightBound: LightBound, xPlanes: Vector3[], yPlanes: Vector3[]): void {
        var xMin: number, yMin: number;
        var xMax: number, yMax: number;

        var normal: Vector3 = Cluster._tempVector32;
        var n: number = lightBound.yMax + 1;
        for (var i: number = lightBound.yMin + 1; i < n; i++) {
            if (this._insertConePlane(lightviewPos, viewForward, radius, halfAngle, yPlanes[i])) {
                yMin = Math.max(0, i - 1);
                break;
            }
        }

        yMax = lightBound.yMax;
        for (var i: number = yMin + 1; i < n; i++) {
            var plane: Vector3 = yPlanes[i];
            normal.setValue(0, -plane.y, -plane.z);
            if (!this._insertConePlane(lightviewPos, viewForward, radius, halfAngle, normal)) {
                yMax = Math.max(0, i);
                break;
            }
        }

        n = lightBound.xMax + 1;
        for (var i: number = lightBound.xMin + 1; i < n; i++) {
            if (this._insertConePlane(lightviewPos, viewForward, radius, halfAngle, xPlanes[i])) {
                xMin = Math.max(0, i - 1);
                break;
            }
        }
        xMax = lightBound.xMax;
        for (var i: number = xMin + 1; i < n; i++) {
            var plane: Vector3 = xPlanes[i];
            normal.setValue(-plane.x, 0, -plane.z);
            if (!this._insertConePlane(lightviewPos, viewForward, radius, halfAngle, normal)) {
                xMax = Math.max(0, i);
                break;
            }
        }

        lightBound.xMin = xMin;
        lightBound.xMax = xMax;
        lightBound.yMin = yMin;
        lightBound.yMax = yMax;
    }



    private _updatePointLightPerspective(near: number, far: number, viewMat: Matrix4x4, pointLight: PointLight, lightIndex: number, xPlanes: Vector3[], yPlanes: Vector3[]): void {
        var lightBound: LightBound = Cluster._tempLightBound;
        var lightviewPos: Vector3 = Cluster._tempVector30;
        Vector3.transformV3ToV3(pointLight._transform.position, viewMat, lightviewPos);//World to View
        lightviewPos.z *= -1;
        if (!this._shrinkSphereLightZPerspective(near, far, lightviewPos, pointLight.range, lightBound))
            return;
        if (!this._shrinkXYByRadiusPerspective(lightviewPos, pointLight.range, lightBound, xPlanes, yPlanes))
            return;

        this._placePointLightToClusters(lightIndex, lightBound);
    }

    private _updateSpotLightPerspective(near: number, far: number, viewMat: Matrix4x4, spotLight: SpotLight, lightIndex: number, xPlanes: Vector3[], yPlanes: Vector3[]): void {
        // technically could fall outside the bounds we make because the planes themeselves are tilted by some angle
        // the effect is exaggerated the steeper the angle the plane makes is
        var lightBound: LightBound = Cluster._tempLightBound;
        var viewPos: Vector3 = Cluster._tempVector30;
        var forward: Vector3 = Cluster._tempVector31;
        var viewConeCap: Vector3 = Cluster._tempVector34;
        var position: Vector3 = spotLight._transform.position;
        var range: number = spotLight.range;
        spotLight._transform.worldMatrix.getForward(forward);
        Vector3.normalize(forward, forward);
        Vector3.scale(forward, range, viewConeCap);
        Vector3.add(position, viewConeCap, viewConeCap);

        Vector3.transformV3ToV3(position, viewMat, viewPos);//World to View
        Vector3.transformV3ToV3(viewConeCap, viewMat, viewConeCap);//World to View
        viewPos.z *= -1;
        viewConeCap.z *= -1;
        var halfAngle: number = (spotLight.spotAngle / 2) * Math.PI / 180;
        if (!this._shrinkSpotLightZPerspective(near, far, viewPos, viewConeCap, range, halfAngle, lightBound))
            return;
        if (!this._shrinkXYByRadiusPerspective(viewPos, range, lightBound, xPlanes, yPlanes))
            return;
        var viewFor: Vector3 = Cluster._tempVector33;
        viewFor.x = viewConeCap.x - viewPos.x, viewFor.y = viewConeCap.y - viewPos.y, viewFor.z = viewConeCap.z - viewPos.z;
        Vector3.normalize(viewFor, viewFor);
        this._shrinkSpotXYByConePerspective(viewPos, viewFor, range, halfAngle, lightBound, xPlanes, yPlanes);

        this._placeSpotLightToClusters(lightIndex, lightBound);
    }

    private _updatePointLightOrth(halfX: number, halfY: number, near: number, far: number, viewMat: Matrix4x4, pointLight: PointLight, lightIndex: number): void {
        var lightBound: LightBound = Cluster._tempLightBound;
        var lightviewPos: Vector3 = Cluster._tempVector30;
        Vector3.transformV3ToV3(pointLight._transform.position, viewMat, lightviewPos);//World to View
        lightviewPos.z *= -1;

        if (!this._shrinkSphereLightByBoundOrth(halfX, halfY, near, far, lightviewPos, pointLight.range, lightBound))
            return;

        this._placePointLightToClusters(lightIndex, lightBound);
    }

    private _updateSpotLightOrth(halfX: number, halfY: number, near: number, far: number, viewMat: Matrix4x4, spotLight: SpotLight, lightIndex: number): void {
        // technically could fall outside the bounds we make because the planes themeselves are tilted by some angle
        // the effect is exaggerated the steeper the angle the plane makes is
        var lightBound: LightBound = Cluster._tempLightBound;
        var viewPos: Vector3 = Cluster._tempVector30;
        var forward: Vector3 = Cluster._tempVector31;
        var viewConeCap: Vector3 = Cluster._tempVector34;
        var position: Vector3 = spotLight._transform.position;
        var range: number = spotLight.range;
        spotLight._transform.worldMatrix.getForward(forward);
        Vector3.normalize(forward, forward);
        Vector3.scale(forward, range, viewConeCap);
        Vector3.add(position, viewConeCap, viewConeCap);

        Vector3.transformV3ToV3(position, viewMat, viewPos);//World to View
        Vector3.transformV3ToV3(viewConeCap, viewMat, viewConeCap);//World to View
        viewPos.z *= -1;
        viewConeCap.z *= -1;
        var halfAngle: number = (spotLight.spotAngle / 2) * Math.PI / 180;
        if (!this._shrinkSpotLightByBoundOrth(halfX, halfY, near, far, viewPos, viewConeCap, range, halfAngle, lightBound))
            return;

        this._placeSpotLightToClusters(lightIndex, lightBound);
    }

    update(camera: Camera, scene: Scene3D): void {
        this._updateMark++;
        var camNear: number = camera.nearPlane;
        this._depthSliceParam.x = Config3D._config.lightClusterCount.z / Math.log2(camera.farPlane / camNear);
        this._depthSliceParam.y = Math.log2(camNear) * this._depthSliceParam.x;

        var near: number = camera.nearPlane;
        var far: number = camera.farPlane;
        var viewMat: Matrix4x4 = camera.viewMatrix;
        var curCount: number = scene._directionLights._length;
        var pointLights: LightQueue<PointLight> = scene._pointLights;
        var poiCount: number = pointLights._length;
        var poiElements: PointLight[] = <PointLight[]>pointLights._elements;
        var spotLights: LightQueue<SpotLight> = scene._spotLights;
        var spoCount: number = spotLights._length;
        var spoElements: SpotLight[] = <SpotLight[]>spotLights._elements;
        if (camera.orthographic) {
            var halfY: number = camera.orthographicVerticalSize / 2.0;
            var halfX: number = halfY * camera.aspectRatio;
            for (var i = 0; i < poiCount; i++ , curCount++)
                this._updatePointLightOrth(halfX, halfY, near, far, viewMat, poiElements[i], curCount);
            for (var i = 0; i < spoCount; i++ , curCount++)
                this._updateSpotLightOrth(halfX, halfY, near, far, viewMat, spoElements[i], curCount);
        }
        else {
            camera._updateClusterPlaneXY();
            var xPlanes: Vector3[] = camera._clusterXPlanes;//must after camera._updateClusterPlaneXY()
            var yPlanes: Vector3[] = camera._clusterYPlanes;
            for (var i = 0; i < poiCount; i++ , curCount++)
                this._updatePointLightPerspective(near, far, viewMat, poiElements[i], curCount, xPlanes, yPlanes);
            for (var i = 0; i < spoCount; i++ , curCount++)
                this._updateSpotLightPerspective(near, far, viewMat, spoElements[i], curCount, xPlanes, yPlanes);
        }

        if (poiCount + spoCount > 0) {
            var xSlices: number = this._xSlices, ySlices: number = this._ySlices, zSlices: number = this._zSlices;
            var widthFloat: number = xSlices * ySlices * 4;
            var lightOff: number = widthFloat * zSlices;
            var clusterPixels: Float32Array = this._clusterPixels;
            var clusterPixelsCount: number = clusterPixels.length;
            var clusterDatas: ClusterData[][][] = this._clusterDatas;
            var updateMark: number = this._updateMark;
            var freeSpace: boolean = true;
            for (var z = 0; z < zSlices; z++) {
                for (var y = 0; y < ySlices; y++) {
                    for (var x = 0; x < xSlices; x++) {
                        var data: ClusterData = clusterDatas[z][y][x];
                        var clusterOff: number = (x + y * xSlices + z * xSlices * ySlices) * 4;
                        if (data.updateMark !== updateMark) {
                            clusterPixels[clusterOff] = 0;
                            clusterPixels[clusterOff + 1] = 0;
                        }
                        else {
                            if (freeSpace) {
                                var indices: number[] = data.indices;
                                var pCount: number = data.pointLightCount;
                                var sCount: number = data.spotLightCount;
                                var count: number = pCount + sCount;
                                if (lightOff + count < clusterPixelsCount) {
                                    clusterPixels[clusterOff] = pCount;
                                    clusterPixels[clusterOff + 1] = sCount;
                                    clusterPixels[clusterOff + 2] = Math.floor(lightOff / widthFloat);//solve precision problme, if data is big some GPU int(float) have problem
                                    clusterPixels[clusterOff + 3] = lightOff % widthFloat;
                                    for (var i: number = 0; i < count; i++)
                                        clusterPixels[lightOff++] = indices[i];
                                }
                                else {
                                    count = clusterPixelsCount - (lightOff + count);
                                    pCount = Math.min(pCount, count);
                                    clusterPixels[clusterOff] = pCount;
                                    clusterPixels[clusterOff + 1] = Math.min(sCount, count - pCount);
                                    clusterPixels[clusterOff + 2] = Math.floor(lightOff / widthFloat);//solve precision problme, if data is big some GPU int(float) have problem
                                    clusterPixels[clusterOff + 3] = lightOff % widthFloat;
                                    for (var i: number = 0; i < count; i++)
                                        clusterPixels[lightOff++] = indices[i];
                                    freeSpace = false;//remain cluster light will be ignore
                                }
                            }
                        }
                    }
                }
            }
            var width: number = this._clusterTexture.width;
            this._clusterTexture.setSubPixels(0, 0, width, Math.ceil(lightOff / (4 * width)), clusterPixels);
        }
    }
}
