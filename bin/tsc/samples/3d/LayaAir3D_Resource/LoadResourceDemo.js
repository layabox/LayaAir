import { Laya } from "Laya";
import { AnimationClip } from "laya/d3/animation/AnimationClip";
import { Animator } from "laya/d3/component/Animator";
import { AnimatorState } from "laya/d3/component/AnimatorState";
import { BaseCamera } from "laya/d3/core/BaseCamera";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BaseMaterial } from "laya/d3/core/material/BaseMaterial";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Quaternion } from "laya/d3/math/Quaternion";
import { Vector3 } from "laya/d3/math/Vector3";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { SkyBox } from "laya/d3/resource/models/SkyBox";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
/**
 * ...
 * @author ...
 */
export class LoadResourceDemo {
    constructor() {
        //初始化引擎
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        //显示性能面板
        Stat.show();
        //加载资源
        this.LoadRes();
        //批量预加载方式
        //PreloadingRes();
    }
    //加载资源
    LoadRes() {
        //场景加载
        Scene3D.load("res/threeDimen/scene/TerrainScene/XunLongShi.ls", Handler.create(this, function (scene) {
            this._scene = scene;
            Laya.stage.addChild(scene);
            //添加相机
            var camera = new Camera();
            scene.addChild(camera);
            //设置相机清楚标记，使用天空
            camera.clearFlag = BaseCamera.CLEARFLAG_SKY;
            //调整相机的位置
            camera.transform.translate(new Vector3(3, 20, 47));
            //相机视角控制组件(脚本)
            camera.addComponent(CameraMoveScript);
            //添加光照
            var directionLight = this._scene.addChild(new DirectionLight());
            directionLight.color = new Vector3(1, 1, 1);
            directionLight.transform.rotate(new Vector3(-1.14 / 3, 0, 0));
            //材质加载
            BaseMaterial.load("res/threeDimen/skyBox/skyBox2/skyBox2.lmat", Handler.create(this, function (mat) {
                //获取相机的天空渲染器
                var skyRenderer = camera.skyRenderer;
                //创建天空盒的mesh
                skyRenderer.mesh = SkyBox.instance;
                //设置天空盒材质
                skyRenderer.material = mat;
            }));
            scene.getChildByName('Scenes').getChildByName('HeightMap').active = false;
            scene.getChildByName('Scenes').getChildByName('Area').active = false;
            this.sprite3D = this._scene.addChild(new Sprite3D());
            //加载纹理
            Texture2D.load("res/threeDimen/texture/earth.png", Handler.create(this, function (tex) {
                //使用纹理
                var earth1 = scene.addChild(new MeshSprite3D(PrimitiveMesh.createSphere(5, 32, 32)));
                earth1.transform.translate(new Vector3(17, 20, 0));
                var earthMat = new BlinnPhongMaterial();
                earthMat.albedoTexture = tex;
                earthMat.albedoIntensity = 1;
                earth1.meshRenderer.material = earthMat;
            }));
            //加载Mesh
            Mesh.load("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm", Handler.create(this, function (mesh) {
                var layaMonkey = this.sprite3D.addChild(new MeshSprite3D(mesh));
                var layaMonkeyTrans = layaMonkey.transform;
                var layaMonkeyScale = layaMonkeyTrans.localScale;
                layaMonkeyScale.setValue(4, 4, 4);
                layaMonkeyTrans.localScale = layaMonkeyScale;
                layaMonkey.transform.rotation = new Quaternion(0.7071068, 0, 0, -0.7071067);
                layaMonkey.transform.translate(new Vector3(5, 3, 13));
            }));
            //加载精灵
            Sprite3D.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Handler.create(this, function (sp) {
                var layaMonkey2 = scene.addChild(sp);
                var layaMonkey2Trans = layaMonkey2.transform;
                var layaMonkey2Scale = layaMonkey2Trans.localScale;
                layaMonkey2Scale.setValue(4, 4, 4);
                layaMonkey2Trans.localScale = layaMonkey2Scale;
                layaMonkey2Trans.translate(new Vector3(-10, 13, 0));
            }));
            //加载胖子精灵
            Sprite3D.load("res/threeDimen/skinModel/BoneLinkScene/PangZiNoAni.lh", Handler.create(this, function (sp) {
                this.pangzi = scene.addChild(sp);
                var pangziTrans = this.pangzi.transform;
                var pangziScale = pangziTrans.localScale;
                pangziScale.setValue(4, 4, 4);
                pangziTrans.localScale = pangziScale;
                pangziTrans.translate(new Vector3(-20, 13, 0));
                //获取动画组件
                this.pangziAnimator = this.pangzi.getChildAt(0).getComponent(Animator);
                //AnimationClip的加载要放在Avatar加载完成之后
                AnimationClip.load("res/threeDimen/skinModel/BoneLinkScene/Assets/Model3D/PangZi-Take 001.lani", Handler.create(this, function (aniClip) {
                    //创建动作状态
                    var state1 = new AnimatorState();
                    //动作名称
                    state1.name = "hello";
                    //动作播放起始时间
                    state1.clipStart = 0 / 581;
                    //动作播放结束时间
                    state1.clipEnd = 581 / 581;
                    //设置动作
                    state1.clip = aniClip;
                    //设置动作循环
                    state1.clip.islooping = true;
                    //为动画组件添加一个动作状态
                    this.pangziAnimator.addState(state1);
                    //播放动作
                    this.pangziAnimator.play("hello");
                }));
            }));
        }));
    }
    //批量预加载方式
    PreloadingRes() {
        //预加载所有资源
        var resource = ["res/threeDimen/scene/TerrainScene/XunLongShi.ls",
            "res/threeDimen/skyBox/skyBox2/skyBox2.lmat",
            "res/threeDimen/texture/earth.png",
            "res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm",
            "res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh",
            "res/threeDimen/skinModel/BoneLinkScene/PangZiNoAni.lh",
            "res/threeDimen/skinModel/BoneLinkScene/Assets/Model3D/PangZi-Take 001.lani"];
        Laya.loader.create(resource, Handler.create(this, this.onPreLoadFinish));
    }
    onPreLoadFinish() {
        //初始化3D场景
        this._scene = Laya.stage.addChild(Loader.getRes("res/threeDimen/scene/TerrainScene/XunLongShi.ls"));
        //添加相机
        var camera = new Camera();
        this._scene.addChild(camera);
        //设置相机清楚标记，使用天空
        camera.clearFlag = BaseCamera.CLEARFLAG_SKY;
        //调整相机的位置
        camera.transform.translate(new Vector3(4, 20, 47));
        //相机视角控制组件(脚本)
        camera.addComponent(CameraMoveScript);
        //添加光照
        var directionLight = this._scene.addChild(new DirectionLight());
        //光照颜色
        directionLight.color = new Vector3(1, 1, 1);
        directionLight.transform.rotate(new Vector3(-3.14 / 3, 0, 0));
        //使用材质
        var skyboxMaterial = Loader.getRes("res/threeDimen/skyBox/skyBox2/skyBox2.lmat");
        var skyRenderer = camera.skyRenderer;
        skyRenderer.mesh = SkyBox.instance;
        skyRenderer.material = skyboxMaterial;
        //激活场景中的子节点
        this._scene.getChildByName('Scenes').getChildByName('HeightMap').active = false;
        this._scene.getChildByName('Scenes').getChildByName('Area').active = false;
        //使用纹理
        var earth1 = this._scene.addChild(new MeshSprite3D(PrimitiveMesh.createSphere(5, 32, 32)));
        earth1.transform.translate(new Vector3(17, 20, 0));
        var earthMat = new BlinnPhongMaterial();
        earthMat.albedoTexture = Loader.getRes("res/threeDimen/texture/earth.png");
        earthMat.albedoIntensity = 1;
        earth1.meshRenderer.material = earthMat;
        //获取Mesh资源
        var mesh = Loader.getRes("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm");
        //为精灵设置Mesh资源
        var layaMonkey = this._scene.addChild(new MeshSprite3D(mesh));
        var layaMonkeyTrans = layaMonkey.transform;
        var layaMonkeyScale = layaMonkeyTrans.localScale;
        layaMonkeyScale.setValue(4, 4, 4);
        layaMonkeyTrans.localScale = layaMonkeyScale;
        layaMonkeyTrans.rotation = new Quaternion(0.7071068, 0, 0, -0.7071067);
        layaMonkeyTrans.translate(new Vector3(5, 3, 13));
        //使用精灵
        var sp = Loader.getRes("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh");
        var layaMonkey2 = this._scene.addChild(sp);
        var layaMonkey2Trans = layaMonkey2.transform;
        var layaMonkey2Scale = layaMonkey2Trans.localScale;
        layaMonkey2Scale.setValue(4, 4, 4);
        layaMonkey2Trans.localScale = layaMonkey2Scale;
        layaMonkey2Trans.translate(new Vector3(-10, 13, 0));
        //使用精灵
        this.pangzi = Loader.getRes("res/threeDimen/skinModel/BoneLinkScene/PangZiNoAni.lh");
        this.pangzi = this._scene.addChild(this.pangzi);
        var pangziTrans = this.pangzi.transform;
        var pangziScale = pangziTrans.localScale;
        pangziScale.setValue(4, 4, 4);
        pangziTrans.localScale = pangziScale;
        pangziTrans.translate(new Vector3(-20, 13, 0));
        //获取动画组件
        this.pangziAnimator = this.pangzi.getChildAt(0).getComponent(Animator);
        var pangAni = Loader.getRes("res/threeDimen/skinModel/BoneLinkScene/Assets/Model3D/PangZi-Take 001.lani");
        //创建动作状态
        var state1 = new AnimatorState();
        //动作名称
        state1.name = "hello";
        //动作播放起始时间
        state1.clipStart = 0 / 581;
        //动作播放结束时间
        state1.clipEnd = 581 / 581;
        //设置动作
        state1.clip = pangAni;
        //设置动作循环
        state1.clip.islooping = true;
        //为动画组件添加一个动作状态
        this.pangziAnimator.addState(state1);
        //播放动作
        this.pangziAnimator.play("hello");
    }
}
