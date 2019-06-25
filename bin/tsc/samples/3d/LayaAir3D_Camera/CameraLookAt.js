import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { BaseCamera } from "laya/d3/core/BaseCamera";
import { Camera } from "laya/d3/core/Camera";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Loader } from "laya/net/Loader";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
/**
 * ...
 * @author ...
 */
export class CameraLookAt {
    constructor() {
        this.index = 0;
        this._translate = new Vector3(0, 0.7, 5);
        this._rotation = new Vector3(-15, 0, 0);
        this._rotation2 = new Vector3(-3.14 / 3, 0, 0);
        this._rotation3 = new Vector3(0, 45, 0);
        this._position = new Vector3(1.5, 0.0, 2);
        this._position2 = new Vector3(-1.5, 0.0, 2);
        this._position3 = new Vector3(0.0, 0.0, 2);
        this._up = new Vector3(0, 1, 0);
        //初始化引擎
        Laya3D.init(0, 0);
        //适配模式
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        //开启统计信息
        Stat.show();
        //预加载所有资源
        var resource = ["res/threeDimen/texture/layabox.png",
            "res/threeDimen/skyBox/skyBox3/skyBox3.lmat"];
        Laya.loader.create(resource, Handler.create(this, this.onPreLoadFinish));
    }
    onPreLoadFinish() {
        //创建场景
        var scene = new Scene3D();
        Laya.stage.addChild(scene);
        //创建相机，构造函数的三个参数为相机横纵比，近距裁剪，远距裁剪
        this.camera = new Camera(0, 0.1, 100);
        this.camera.transform.translate(this._translate);
        this.camera.transform.rotate(this._rotation, true, false);
        //相机设置清楚标记,使用固定颜色
        this.camera.clearFlag = BaseCamera.CLEARFLAG_SOLIDCOLOR;
        //使用默认的背景颜色
        //camera.clearColor = new Vector4(0, 0.2, 0.6, 1);
        //设置摄像机视野范围（角度）
        this.camera.fieldOfView = 60;
        //为相机添加视角控制组件(脚本)
        this.camera.addComponent(CameraMoveScript);
        scene.addChild(this.camera);
        //添加平行光
        var directionLight = scene.addChild(new DirectionLight());
        //设置平行光颜色
        directionLight.color.setValue(1, 1, 1);
        directionLight.transform.rotate(this._rotation2);
        var sprite = new Sprite3D;
        scene.addChild(sprite);
        //正方体
        this.box = sprite.addChild(new MeshSprite3D(PrimitiveMesh.createBox(0.5, 0.5, 0.5)));
        this.box.transform.position = this._position;
        this.box.transform.rotate(this._rotation3, false, false);
        //胶囊体
        this.capsule = new MeshSprite3D(PrimitiveMesh.createCapsule(0.25, 1, 10, 20));
        this.capsule.transform.position = this._position2;
        sprite.addChild(this.capsule);
        //圆柱
        this.cylinder = new MeshSprite3D(PrimitiveMesh.createCylinder(0.25, 1, 20));
        this.cylinder.transform.position = this._position3;
        sprite.addChild(this.cylinder);
        //创建linnPhong材质
        var materialBill = new BlinnPhongMaterial;
        this.box.meshRenderer.material = materialBill;
        this.capsule.meshRenderer.material = materialBill;
        this.cylinder.meshRenderer.material = materialBill;
        //为材质加载纹理
        var tex = Loader.getRes("res/threeDimen/texture/layabox.png");
        //设置反照率贴图
        materialBill.albedoTexture = tex;
        this.loadUI();
    }
    loadUI() {
        Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function () {
            var changeActionButton = Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "切换注视目标"));
            changeActionButton.size(200, 40);
            changeActionButton.labelBold = true;
            changeActionButton.labelSize = 30;
            changeActionButton.sizeGrid = "4,4,4,4";
            changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
            changeActionButton.pos(Laya.stage.width / 2 - changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);
            changeActionButton.on(Event.CLICK, this, function () {
                this.index++;
                if (this.index % 3 === 1) {
                    //摄像机捕捉模型目标
                    this.camera.transform.lookAt(this.box.transform.position, this._up);
                }
                else if (this.index % 3 === 2) {
                    //摄像机捕捉模型目标
                    this.camera.transform.lookAt(this.cylinder.transform.position, this._up);
                }
                else {
                    //摄像机捕捉模型目标
                    this.camera.transform.lookAt(this.capsule.transform.position, this._up);
                }
            });
        }));
    }
}
