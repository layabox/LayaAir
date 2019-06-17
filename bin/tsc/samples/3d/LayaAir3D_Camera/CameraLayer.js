import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Camera } from "laya/d3/core/Camera";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Quaternion } from "laya/d3/math/Quaternion";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Loader } from "laya/net/Loader";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
/**
 * 精灵图层示例
 * @author ...
 */
export class CameraLayer {
    constructor() {
        this._translate = new Vector3(0, 0.7, 3);
        this._rotation = new Vector3(-15, 0, 0);
        this._rotation2 = new Vector3(-3.14 / 3, 0, 0);
        this._rotation3 = new Quaternion(0.7071068, 0, 0, -0.7071067);
        this._rotation4 = new Vector3(0, 60, 0);
        this._position = new Vector3(0.0, 0, 0.5);
        //初始化引擎
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        //显示性能面板
        Stat.show();
        //创建场景
        this._scene = Laya.stage.addChild(new Scene3D());
        //添加相机
        this.camera = (this._scene.addChild(new Camera(0, 0.1, 100)));
        this.camera.transform.translate(this._translate);
        this.camera.transform.rotate(this._rotation, true, false);
        //相机添加视角控制组件(脚本)
        this.camera.addComponent(CameraMoveScript);
        //移除所有图层
        this.camera.removeAllLayers();
        //添加显示图层(为相机添加一个蒙版)
        this.camera.addLayer(5);
        //添加平行光
        var directionLight = this._scene.addChild(new DirectionLight());
        directionLight.color.setValue(1, 1, 1);
        directionLight.transform.rotate(this._rotation2);
        Laya.loader.create(["res/threeDimen/staticModel/grid/plane.lh",
            "res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh"], Handler.create(this, this.onComplete));
    }
    onComplete() {
        //添加地面
        var grid = this._scene.addChild(Loader.getRes("res/threeDimen/staticModel/grid/plane.lh"));
        //地面接收阴影
        grid.getChildAt(0).meshRenderer.receiveShadow = true;
        //设置该精灵的蒙版为5(所属图层)
        grid.getChildAt(0).layer = 5;
        //添加静态猴子
        var staticLayaMonkey = this._scene.addChild(new MeshSprite3D(Loader.getRes("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm")));
        //设置静态猴子的材质
        staticLayaMonkey.meshRenderer.material = Loader.getRes("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/Materials/T_Diffuse.lmat");
        //设置静态猴子的蒙版为1(所属图层)
        staticLayaMonkey.layer = 1;
        staticLayaMonkey.transform.position.setValue(0, 0, 0.5);
        staticLayaMonkey.transform.localScale.setValue(0.3, 0.3, 0.3);
        staticLayaMonkey.transform.rotation = this._rotation3;
        //产生阴影
        staticLayaMonkey.meshRenderer.castShadow = true;
        //克隆sprite3d
        var layaMonkey_clone1 = Sprite3D.instantiate(staticLayaMonkey, this._scene, false, this._position);
        var layaMonkey_clone2 = Sprite3D.instantiate(staticLayaMonkey, this._scene, false, this._position);
        var layaMonkey_clone3 = Sprite3D.instantiate(staticLayaMonkey, this._scene, false, this._position);
        //设置蒙版(所属图层)
        layaMonkey_clone1.layer = 2;
        layaMonkey_clone2.layer = 3;
        layaMonkey_clone3.layer = 0;
        //平移
        this._translate.setValue(1.5, 0, 0.0);
        layaMonkey_clone1.transform.translate(this._translate);
        this._translate.setValue(-1.5, 0, 0.0);
        layaMonkey_clone2.transform.translate(this._translate);
        this._translate.setValue(2.5, 0, 0.0);
        layaMonkey_clone3.transform.translate(this._translate);
        //旋转
        layaMonkey_clone2.transform.rotate(this._rotation4, false, false);
        //缩放
        layaMonkey_clone3.transform.localScale.setValue(0.1, 0.1, 0.1);
        //生成UI
        this.loadUI();
    }
    loadUI() {
        this.layerIndex = 0;
        Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function () {
            this.changeActionButton = Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "切换图层"));
            this.changeActionButton.size(160, 40);
            this.changeActionButton.labelBold = true;
            this.changeActionButton.labelSize = 30;
            this.changeActionButton.sizeGrid = "4,4,4,4";
            this.changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
            this.changeActionButton.pos(Laya.stage.width / 2 - this.changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);
            this.changeActionButton.on(Event.CLICK, this, function () {
                this.camera.removeAllLayers();
                this.layerIndex++;
                this.camera.addLayer(this.layerIndex % 4);
                this.camera.addLayer(5);
            });
        }));
    }
}
