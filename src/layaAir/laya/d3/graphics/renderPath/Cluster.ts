import { Laya3D } from "../../../../Laya3D";
import { Texture2D } from "../../../resource/Texture2D";
import { Camera } from "../../core/Camera";
import { LightQueue } from "../../core/light/LightQueue";
import { PointLight } from "../../core/light/PointLight";
import { SpotLight } from "../../core/light/SpotLight";
import { Scene3D } from "../../core/scene/Scene3D";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { Vector3 } from "../../math/Vector3";
import { Utils3D } from "../../utils/Utils3D";
import { Vector2 } from "../../math/Vector2";

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


    private _xSlices: number;
    private _ySlices: number;
    private _zSlices: number;
    private _maxLightsPerCluster: number;
    private _clusterDatas: ClusterData[][][];
    private _clusterPixels: Float32Array;
    private _tanVerFovBy2: number;
    private _zStride: number;
    private _updateMark: number = 0;
    private _depthSliceParam: Vector2 = new Vector2();

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
                clusterDatas[z][y] = new Array<clusterData>(this._xSlices);
                for (var x = 0; x < this._xSlices; x++)
                    clusterDatas[z][y][x] = new clusterData();
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

    private _updatePointLight(xS: number, xE: number, yS: number, yE: number, zS: number, zE: number, lightIndex: number): void {
        for (var z: number = zS; z <= zE; z++) {
            for (var y: number = yS; y <= yE; y++) {
                for (var x: number = xS; x <= xE; x++) {
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

    private _updateSpotLight(xS: number, xE: number, yS: number, yE: number, zS: number, zE: number, lightIndex: number): void {
        for (var z: number = zS; z <= zE; z++) {
            for (var y: number = yS; y <= yE; y++) {
                for (var x: number = xS; x <= xE; x++) {
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

    private _updateLight(camera: Camera, min: Vector3, max: Vector3, lightIndex: number, viewlightPosZ: number, type: number): void {
        var xSlices: number = this._xSlices, ySlices: number = this._ySlices, zSlices: number = this._zSlices;
        var lightFrustumH: number = Math.abs(this._tanVerFovBy2 * viewlightPosZ * 2);
        var lightFrustumW: number = Math.abs(camera.aspectRatio * lightFrustumH);
        var xStride: number = lightFrustumW / xSlices, yStride: number = lightFrustumH / ySlices;

        // technically could fall outside the bounds we make because the planes themeselves are tilted by some angle
        // the effect is exaggerated the steeper the angle the plane makes is

        //if return light wont fall into any cluster
        //slice = Math.log2(z) * (numSlices / Math.log2(far / near)) - Math.log2(near) * numSlices / Math.log2(far / near)
        var zStartIndex: number = Math.floor(Math.log2(min.z) * this._depthSliceParam.x - this._depthSliceParam.y);
        var zEndIndex: number = Math.floor(Math.log2(max.z) * this._depthSliceParam.x - this._depthSliceParam.y);

        if ((zEndIndex < 0) || (zStartIndex >= zSlices))
            return;

        //should inverse Y to more easy compute
        var yStartIndex: number = Math.floor((-max.y + lightFrustumH * 0.5) / yStride);
        var yEndIndex: number = Math.floor((-min.y + lightFrustumH * 0.5) / yStride);
        if ((yEndIndex < 0) || (yStartIndex >= ySlices))
            return;

        var xStartIndex: number = Math.floor((min.x + lightFrustumW * 0.5) / xStride);
        var xEndIndex: number = Math.floor((max.x + lightFrustumW * 0.5) / xStride);
        if ((xEndIndex < 0) || (xStartIndex >= xSlices))
            return;

        zStartIndex = Math.max(0, zStartIndex);
        zEndIndex = Math.min(zEndIndex, zSlices - 1);
        yStartIndex = Math.max(0, yStartIndex);
        yEndIndex = Math.min(yEndIndex, ySlices - 1);
        xStartIndex = Math.max(0, xStartIndex);
        xEndIndex = Math.min(xEndIndex, xSlices - 1);

        if (type == 0) //pointLight
            this._updatePointLight(xStartIndex, xEndIndex, yStartIndex, yEndIndex, zStartIndex, zEndIndex, lightIndex);
        else //spotLight
            this._updateSpotLight(xStartIndex, xEndIndex, yStartIndex, yEndIndex, zStartIndex, zEndIndex, lightIndex);
    }


    update(camera: Camera, viewMatrix: Matrix4x4, scene: Scene3D): void {
        var xSlices: number = this._xSlices, ySlices: number = this._ySlices, zSlices: number = this._zSlices;
        var camNear: number = camera.nearPlane;
        this._updateMark++;
        this._tanVerFovBy2 = Math.tan(camera.fieldOfView * (Math.PI / 180.0) * 0.5);
        this._zStride = (camera.farPlane - camNear) / zSlices;
        this._depthSliceParam.x = Laya3D._config.clusterZCount / Math.log2(camera.farPlane / camNear);
        this._depthSliceParam.y = Math.log2(camNear) * this._depthSliceParam.x;

        var viewLightPos: Vector3 = Cluster._tempVector30;
        var min: Vector3 = Cluster._tempVector31;
        var max: Vector3 = Cluster._tempVector32;
        var curCount: number = scene._directionallights._length;
        var viewMat: Matrix4x4 = camera.viewMatrix;
        var pointLights: LightQueue<PointLight> = scene._pointLights;
        var spotLights: LightQueue<SpotLight> = scene._spotLights;
        var poiElements: PointLight[] = <PointLight[]>pointLights._elements;
       
        for (var i = 0, n = pointLights._length; i < n; i++ , curCount++) {
            var poiLight: PointLight = poiElements[i];
            var radius = poiLight.range;
            Vector3.transformV3ToV3(poiLight._transform.position, viewMat, viewLightPos);//World to View
            //camera looks down negative z, make z axis positive to make calculations easier
            min.setValue(viewLightPos.x - radius, viewLightPos.y - radius, -(viewLightPos.z + radius + camNear));
            max.setValue(viewLightPos.x + radius, viewLightPos.y + radius, -(viewLightPos.z - radius + camNear));
            this._updateLight(camera, min, max, curCount, viewLightPos.z, 0);
        }

        var viewForward: Vector3 = Cluster._tempVector33;
        var pb: Vector3 = Cluster._tempVector34;
        var spoElements: SpotLight[] = <SpotLight[]>spotLights._elements;
        for (var i = 0, n = spotLights._length; i < n; i++ , curCount++) {
            var spoLight: SpotLight = spoElements[i];
            var radius = spoLight.range;
            spoLight._transform.worldMatrix.getForward(viewForward);
            Vector3.transformV3ToV3(viewForward, viewMat, viewForward);//forward to View
            Vector3.normalize(viewForward, viewForward);
            Vector3.transformV3ToV3(spoLight._transform.position, viewMat, viewLightPos);//World to View

            //https://bartwronski.com/2017/04/13/cull-that-cone/
            //http://www.iquilezles.org/www/articles/diskbbox/diskbbox.htm
            Vector3.scale(viewForward, radius, pb);
            Vector3.add(viewLightPos, pb, pb);

            var pbX: number = pb.x;
            var pbY: number = pb.y;
            var pbZ: number = pb.z;
            var rb: number = Math.tan((spoLight.spotAngle / 2) * Math.PI / 180) * radius;
            var paX: number = viewLightPos.x;
            var paY: number = viewLightPos.y;
            var paZ: number = viewLightPos.z;
            var aX: number = pbX - paX;
            var aY: number = pbY - paY;
            var aZ: number = pbZ - paZ;
            var dotA: number = aX * aX + aY * aY + aZ * aZ;
            var eX: number = Math.sqrt(1.0 - aX * aX / dotA);
            var eY: number = Math.sqrt(1.0 - aY * aY / dotA);
            var eZ: number = Math.sqrt(1.0 - aZ * aZ / dotA);

            //flat-capped cone is not spotLight shape,spoltlight is sphere-capped.so we get the common boundBox of flat-capped cone bounds and sphere bounds.
            var sphereMinX = viewLightPos.x - radius;
            var sphereMinY = viewLightPos.y - radius;
            var sphereMinZ = viewLightPos.z - radius;
            var sphereMaxX = viewLightPos.x + radius;
            var sphereMaxY = viewLightPos.y + radius;
            var sphereMaxZ = viewLightPos.z + radius;

            //camera looks down negative z, make z axis positive to make calculations easier
            min.setValue(Math.max(Math.min(paX, pbX - eX * rb), sphereMinX), Math.max(Math.min(paY, pbY - eY * rb), sphereMinY), -Math.min((Math.max(paZ, pbZ + eZ * rb), sphereMaxZ) + camNear));
            max.setValue(Math.min(Math.max(paX, pbX + eX * rb), sphereMaxX), Math.min(Math.max(paY, pbY + eY * rb), sphereMaxY), -Math.max((Math.min(paZ, pbZ - eZ * rb), sphereMinZ) + camNear));

            this._updateLight(camera, min, max, curCount, viewLightPos.z, 1);
        }

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
