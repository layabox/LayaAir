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
import { Loader } from "laya/net/Loader";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
/**
 * ...
 * @author ...
 */
export class TransformDemo {
    constructor() {
        this.tmpVector = new Vector3(0, 0, 0);
        this._position = new Vector3(0, 0, 0);
        this._position1 = new Vector3(0, 0, 0);
        this._rotate = new Vector3(0, 1, 0);
        this._rotate1 = new Vector3(0, 0, 0);
        this._scale = new Vector3();
        this.scaleDelta = 0;
        this.scaleValue = 0;
        //初始化引擎
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        //显示性能面板
        Stat.show();
        //创建场景
        this._scene = Laya.stage.addChild(new Scene3D());
        //添加相机
        var camera = (this._scene.addChild(new Camera(0, 0.1, 100)));
        camera.transform.translate(new Vector3(0, 2.0, 5));
        camera.transform.rotate(new Vector3(-30, 0, 0), true, false);
        camera.addComponent(CameraMoveScript);
        //添加光照
        var directionLight = this._scene.addChild(new DirectionLight());
        directionLight.color = new Vector3(1, 1, 1);
        directionLight.transform.rotate(new Vector3(-3.14 / 3, 0, 0));
        //灯光开启阴影
        //directionLight.shadow = true;
        //可见阴影距离
        directionLight.shadowDistance = 5;
        //生成阴影贴图尺寸
        directionLight.shadowResolution = 2048;
        //生成阴影贴图数量
        directionLight.shadowPSSMCount = 1;
        //模糊等级,越大越高,更耗性能
        directionLight.shadowPCFType = 3;
        //批量预加载资源
        Laya.loader.create(["res/threeDimen/staticModel/grid/plane.lh", "res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh"], Handler.create(this, this.onComplete));
    }
    onComplete() {
        //加载地面
        var grid = this._scene.addChild(Loader.getRes("res/threeDimen/staticModel/grid/plane.lh"));
        //地面接收阴影
        grid.getChildAt(0).meshRenderer.receiveShadow = true;
        //加载静态小猴子
        var staticLayaMonkey = this._scene.addChild(new MeshSprite3D(Loader.getRes("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm")));
        //设置材质
        staticLayaMonkey.meshRenderer.material = Loader.getRes("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/Materials/T_Diffuse.lmat");
        //设置位置
        var staticMonkeyTransform = staticLayaMonkey.transform;
        var pos = staticMonkeyTransform.position;
        pos.setValue(0, 0, 0);
        staticMonkeyTransform.position = pos;
        //设置缩放
        var staticMonkeyScale = staticMonkeyTransform.localScale;
        staticMonkeyScale.setValue(0.3, 0.3, 0.3);
        staticMonkeyTransform.localScale = staticMonkeyScale;
        //设置旋转
        staticMonkeyTransform.rotation = new Quaternion(0.7071068, 0, 0, -0.7071067);
        //产生阴影
        staticLayaMonkey.meshRenderer.castShadow = true;
        //克隆sprite3d
        this.layaMonkey_clone1 = Sprite3D.instantiate(staticLayaMonkey, this._scene, false, this._position1);
        this.layaMonkey_clone2 = Sprite3D.instantiate(staticLayaMonkey, this._scene, false, this._position1);
        this.layaMonkey_clone3 = Sprite3D.instantiate(staticLayaMonkey, this._scene, false, this._position1);
        //得到三个Transform
        this.clone1Transform = this.layaMonkey_clone1.transform;
        this.clone2Transform = this.layaMonkey_clone2.transform;
        this.clone3Transform = this.layaMonkey_clone3.transform;
        //平移
        this._position1.setValue(0.0, 0, 0.0);
        this.clone1Transform.translate(this._position1);
        this._position1.setValue(-1.5, 0, 0.0);
        this.clone2Transform.translate(this._position1);
        this._position1.setValue(1.0, 0, 0.0);
        this.clone3Transform.translate(this._position1);
        //旋转
        this._rotate1.setValue(0, 60, 0);
        this.clone2Transform.rotate(this._rotate1, false, false);
        //缩放
        var scale = this.clone3Transform.localScale;
        scale.setValue(0.1, 0.1, 0.1);
        this.clone3Transform.localScale = scale;
        staticLayaMonkey.removeSelf();
        //设置定时器执行,定时重复执行(基于帧率)
        Laya.timer.frameLoop(1, this, this.animate);
    }
    animate() {
        this.scaleValue = Math.sin(this.scaleDelta += 0.1);
        this._position.y = Math.max(0, this.scaleValue / 2);
        this.clone1Transform.position = this._position;
        this.clone2Transform.rotate(this._rotate, false, false);
        this._scale.x = this._scale.y = this._scale.z = Math.abs(this.scaleValue) / 5;
        this.clone3Transform.localScale = this._scale;
    }
}
