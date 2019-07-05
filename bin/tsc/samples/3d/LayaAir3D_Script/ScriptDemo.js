import { Laya } from "Laya";
import { Script3D } from "laya/d3/component/Script3D";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { PBRSpecularMaterial } from "laya/d3/core/material/PBRSpecularMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
export class ScriptDemo {
    constructor() {
        this._translate = new Vector3(0, 3, 3);
        this._rotation = new Vector3(-30, 0, 0);
        this._rotation2 = new Vector3(0, 45, 0);
        this._forward = new Vector3(1, -1, 0);
        //初始化引擎
        Laya3D.init(0, 0);
        //适配模式
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        //开启统计信息
        Stat.show();
        //添加3D场景
        var scene = Laya.stage.addChild(new Scene3D());
        //添加照相机
        var camera = (scene.addChild(new Camera(0, 0.1, 100)));
        //移动摄影机位置
        camera.transform.translate(this._translate);
        //旋转摄影机方向
        camera.transform.rotate(this._rotation, true, false);
        //设置背景颜色
        camera.clearColor = null;
        //添加方向光
        var directionLight = scene.addChild(new DirectionLight());
        //设置灯光漫反射颜色
        var lightColor = directionLight.color;
        lightColor.setValue(0.6, 0.6, 0.6);
        //设置平行光的方向
        var mat = directionLight.transform.worldMatrix;
        mat.setForward(this._forward);
        directionLight.transform.worldMatrix = mat;
        //添加自定义模型
        var box = scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(1, 1, 1), "MOs"));
        //设置模型的旋转
        box.transform.rotate(this._rotation2, false, false);
        //创建材质
        var material = new PBRSpecularMaterial();
        //加载模型的材质贴图
        Texture2D.load("res/threeDimen/layabox.png", Handler.create(this, function (text) {
            material.albedoTexture = text;
            //给模型添加材质
            box.meshRenderer.material = material;
            //给box添加自定义脚本组件
            box.addComponent(BoxControlScript);
        }));
        //4秒后删除自定义组件
        Laya.timer.once(4000, this, this.onLoop, [box]);
    }
    onLoop(box) {
        console.log("移除组件");
        // 获取到组件
        var boxContro = box.getComponent(BoxControlScript);
        // 移除组件
        boxContro.destroy();
        //如不想移除组件，可设置为不启用能达到同样效果（组件_update方法将不会被更新）
        //boxContro.enabled = false;
    }
}
class BoxControlScript extends Script3D {
    constructor() {
        super();
        this._albedoColor = new Vector4(1, 0, 0, 1);
        this._rotation = new Vector3(0, 0.5, 0);
    }
    /**
     * 覆写3D对象组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
     */
    /*override*/ onAwake() {
        //得到3D对象
        this.box = this.owner;
    }
    /*override*/ onStart() {
        //得到3D对象的材质
        var material = this.box.meshRenderer.material;
        //更改3D对象的材质反射率 （偏红）
        material.albedoColor = this._albedoColor;
    }
    /**
     * 覆写组件更新方法（相当于帧循环）
     */
    /*override*/ onUpdate() {
        //所属脚本对象旋转更新
        this.box.transform.rotate(this._rotation, false, false);
    }
    /*override*/ onDisable() {
        console.log("组件设置为不可用");
    }
}
