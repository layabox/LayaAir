import { Laya } from "Laya";
import { BaseCamera } from "laya/d3/core/BaseCamera";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
export class BlinnPhong_DiffuseMap {
    constructor() {
        this.rotation = new Vector3(0, 0.01, 0);
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        Stat.show();
        var scene = Laya.stage.addChild(new Scene3D());
        var camera = (scene.addChild(new Camera(0, 0.1, 100)));
        camera.transform.translate(new Vector3(0, 0.5, 1.5));
        camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
        camera.clearFlag = BaseCamera.CLEARFLAG_SKY;
        var directionLight = scene.addChild(new DirectionLight());
        directionLight.color.setValue(1, 1, 1);
        //创建一个SphereMesh
        var sphereMesh = PrimitiveMesh.createSphere();
        var earth1 = scene.addChild(new MeshSprite3D(sphereMesh));
        earth1.transform.position = new Vector3(-0.6, 0, 0);
        var earth2 = scene.addChild(new MeshSprite3D(sphereMesh));
        earth2.transform.position = new Vector3(0.6, 0, 0);
        var material = new BlinnPhongMaterial();
        //漫反射贴图
        Texture2D.load("res/threeDimen/texture/earth.png", Handler.create(this, function (texture) {
            material.albedoTexture = texture;
        }));
        earth2.meshRenderer.material = material;
        Laya.timer.frameLoop(1, this, function () {
            earth1.transform.rotate(this.rotation, false);
            earth2.transform.rotate(this.rotation, false);
        });
    }
}
