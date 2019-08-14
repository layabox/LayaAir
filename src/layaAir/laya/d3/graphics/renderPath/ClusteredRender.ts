import { BaseTexture } from "../../../resource/BaseTexture";
import { Texture2D } from "../../../resource/Texture2D";
import { Camera } from "../../core/Camera";
import { PointLight } from "../../core/light/PointLight";
import { Scene3D } from "../../core/scene/Scene3D";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { Vector3 } from "../../math/Vector3";
import { SpotLight } from "../../core/light/SpotLight";
import { LightQueue } from "../../core/light/LightQueue";
import { Utils3D } from "../../utils/Utils3D";

/**
 * @internal
 */
export class ClusteredRender {
    private static _tempVector30: Vector3 = new Vector3();
    private static _tempVector31: Vector3 = new Vector3();
    private static _tempVector32: Vector3 = new Vector3();
    private static _tempVector33: Vector3 = new Vector3();
    private static _tempVector34: Vector3 = new Vector3();

    private _xSlices: number;
    private _ySlices: number;
    private _zSlices: number;
    private _maxLightsPerCluster: number;
    private _clusterTexture: Texture2D;
    private _clusterPixels: Float32Array;
    private _clusterTexWidth: number;
    private _tanVerFovBy2: number;
    private _zStride: number;
    private _camera: Camera;

    constructor(xSlices: number, ySlices: number, zSlices: number, maxLightsPerCluster: number) {
        this._xSlices = xSlices;
        this._ySlices = ySlices;
        this._zSlices = zSlices;
        this._maxLightsPerCluster = maxLightsPerCluster;

        var clusterTexWidth: number = xSlices * ySlices;
        var clisterTexHeight: number = Math.ceil((maxLightsPerCluster + 2) / 4) * zSlices;

        var cluTex: Texture2D = Utils3D._createFloatTextureBuffer(clusterTexWidth, clisterTexHeight);
        this._clusterTexture = cluTex;
        this._clusterPixels = new Float32Array(clusterTexWidth * clisterTexHeight * 4);
        this._clusterTexWidth = clusterTexWidth;

        //TODO:优化
        /*
        Layout of clusterTexture
        |------------------------------------------------------U(XY)
        |                  cluster0               cluster1       
        |component0 (PCou|SCou|lid0|lid1) | (PCou|SCou|lid0|lid1) 
        |component1 (lid2|lid3|lid4|lid5) | (lid2|lid3|lid4|lid5)
        |component2 (lid6|lid7|lid8|lid9) | (lid6|lid7|lid8|lid9)
        |                  cluster2               cluster3      
        |component0 (PCou|SCou|lid0|lid1) | (PCou|SCou|lid0|lid1) 
        |component1 (lid2|lid3|lid4|lid5) | (lid2|lid3|lid4|lid5) 
        |component2 (lid6|lid7|lid8|lid9) | (lid6|lid7|lid8|lid9)
        V(Z)
        */
    }

    private _updateLight(min: Vector3, max: Vector3, lightIndex: number, viewlightPosZ: number, type: number): void {
        var lightFrustumH: number = Math.abs(this._tanVerFovBy2 * viewlightPosZ * 2);
        var lightFrustumW: number = Math.abs(this._camera.aspectRatio * lightFrustumH);
        var xStride: number = lightFrustumW / this._xSlices;
        var yStride: number = lightFrustumH / this._ySlices;

        // Need to extend this by 0 and 1 to avoid edge cases where light 
        // technically could fall outside the bounds we make because the planes themeselves are tilted by some angle
        // the effect is exaggerated the steeper the angle the plane makes is

        //Culling:if continue light wont fall into any cluster
        var zStartIndex: number = Math.floor(min.z / this._zStride);
        var zEndIndex: number = Math.floor(max.z / this._zStride);
        if ((zStartIndex < 0 && zEndIndex < 0) || (zStartIndex >= this._zSlices && zEndIndex >= this._zSlices))
            return;

        var yStartIndex: number = Math.floor((min.y + lightFrustumH * 0.5) / yStride);
        var yEndIndex: number = Math.floor((max.y + lightFrustumH * 0.5) / yStride);
        if ((yStartIndex < 0 && yEndIndex < 0) || (yStartIndex >= this._ySlices && yEndIndex >= this._ySlices))
            return;

        var xStartIndex: number = Math.floor((min.x + lightFrustumW * 0.5) / xStride) - 1;//TODO:?
        var xEndIndex: number = Math.floor((max.x + lightFrustumW * 0.5) / xStride) + 1;//TODO:?
        if ((xStartIndex < 0 && xEndIndex < 0) || (xStartIndex >= this._xSlices && xEndIndex >= this._xSlices))
            return;

        zStartIndex = Math.max(0, Math.min(zStartIndex, this._zSlices - 1));
        zEndIndex = Math.max(0, Math.min(zEndIndex, this._zSlices - 1));
        yStartIndex = Math.max(0, Math.min(zStartIndex, this._ySlices - 1));
        yEndIndex = Math.max(0, Math.min(zEndIndex, this._ySlices - 1));
        xStartIndex = Math.max(0, Math.min(zStartIndex, this._xSlices - 1));
        xEndIndex = Math.max(0, Math.min(zEndIndex, this._xSlices - 1));


        var lightCountOffset: number;
        if (type == 0) //pointLight
            lightCountOffset = 0;
        else //spotLight
            lightCountOffset = 0;
        for (var z: number = zStartIndex; z <= zEndIndex; z++) {
            for (var y: number = yStartIndex; y <= yEndIndex; y++) {
                for (var x: number = xStartIndex; x <= xEndIndex; x++) {
                    var clusterOff: number = (x + y * this._xSlices + z * this._xSlices * this._ySlices) * 4;
                    // Update the light count for every cluster
                    var countIndex: number = clusterOff + lightCountOffset;
                    var lightCount: number = this._clusterPixels[countIndex];
                    if (lightCount < this._maxLightsPerCluster) {
                        this._clusterPixels[countIndex] = ++lightCount;
                        var indexInElemnt: number;
                        if (type == 0)
                            indexInElemnt = lightCount + 1;
                        else
                            indexInElemnt = this._clusterPixels[clusterOff] + lightCount + 1;
                        var texel: number = Math.floor(indexInElemnt / 4);
                        var texelIndex: number = clusterOff + 4 * texel * this._clusterTexWidth;
                        var texelSubIndex: number = indexInElemnt - texel * 4; //texel%4;

                        // Update the light index for the particular cluster in the light buffer
                        this._clusterPixels[texelIndex + texelSubIndex] = lightIndex;
                    }
                }
            }
        }
    }


    update(camera: Camera, viewMatrix: Matrix4x4, scene: Scene3D): void {
        this._tanVerFovBy2 = Math.tan(camera.fieldOfView * (Math.PI / 180.0) * 0.5);
        this._zStride = (camera.farPlane - camera.nearPlane) / this._zSlices;

        //Reset the light count to 0 for every cluster
        for (var z = 0; z < this._zSlices; z++) {
            for (var y = 0; y < this._ySlices; y++) {
                for (var x = 0; x < this._xSlices; x++) {
                    var off: number = 4 * x + y * this._xSlices + z * this._xSlices * this._ySlices;
                    this._clusterPixels[off] = 0;
                    this._clusterPixels[off + 1] = 0;
                }
            }
        }

        var viewMat: Matrix4x4 = camera.viewMatrix;
        var pointLights: LightQueue<PointLight> = scene._pointLights;
        var spotLights: LightQueue<SpotLight> = scene._spotLights;
        var viewLightPos: Vector3 = ClusteredRender._tempVector30;
        var min: Vector3 = ClusteredRender._tempVector31;
        var max: Vector3 = ClusteredRender._tempVector32;
        var poiElements: PointLight[] = <PointLight[]>pointLights._elements;
        for (var i = 0, n = pointLights._length; i < n; i++) {
            var poiLight: PointLight = poiElements[i];
            var radius = poiLight.range;
            Vector3.transformV3ToV3(poiLight._transform.position, viewMat, viewLightPos);//World to View
            viewLightPos.z *= -1; //camera looks down negative z, make z axis positive to make calculations easier

            min.setValue(viewLightPos.x - radius, viewLightPos.y - radius, viewLightPos.z - radius);
            max.setValue(viewLightPos.x + radius, viewLightPos.y + radius, viewLightPos.z + radius);
            this._updateLight(min, max, i, viewLightPos.z, 0);
        }

        var viewForward: Vector3 = ClusteredRender._tempVector33;
        var spoElements: SpotLight[] = <SpotLight[]>spotLights._elements;
        for (var i = 0, n = spotLights._length; i < n; i++) {
            var spoLight: SpotLight = spoElements[i];
            var radius = spoLight.range;
            spoLight._transform.worldMatrix.getForward(viewForward);
            Vector3.transformV3ToV3(viewForward, viewMat, viewForward);//forward to View
            Vector3.transformV3ToV3(spoLight._transform.position, viewMat, viewLightPos);//World to View
            viewForward.z *= -1;//camera looks down negative z, make z axis positive to make calculations easier
            viewLightPos.z *= -1;


            //https://bartwronski.com/2017/04/13/cull-that-cone/
            //http://www.iquilezles.org/www/articles/diskbbox/diskbbox.htm
            var pb: Vector3 = ClusteredRender._tempVector34;//TODO:优化
            Vector3.scale(viewForward, radius, pb);//TODO:viewForward是否归一化
            Vector3.add(viewLightPos, pb, pb);

            var pbX: number = pb.x;
            var pbY: number = pb.y;
            var pbZ: number = pb.z;
            var rb: number = Math.tan(spoLight.spotAngle * radius);
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

            min.setValue(Math.min(paX, pbX - eX * rb), Math.min(paY, pbY - eY * rb), Math.min(paZ, pbZ - eZ * rb));
            max.setValue(Math.max(paX, pbX + eX * rb), Math.max(paY, pbY + eY * rb), Math.max(paZ, pbZ + eZ * rb));
            this._updateLight(min, max, i, viewLightPos.z, 1);
        }
        this._clusterTexture.setPixels(this._clusterPixels);
    }

}
