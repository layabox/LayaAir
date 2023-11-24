import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { URL } from "laya/net/URL";
import { PostProcess } from "laya/d3/component/PostProcess";
import { GodRay } from "./VolumeticLightScattering/GodRays";
import { Vector4 } from "laya/maths/Vector4";
import { Loader } from "laya/net/Loader";
import { Vector2 } from "laya/maths/Vector2";

export class CustomPostProcess_VolumeticLIghtScattering {
    constructor() {
        //初始化引擎
        Laya.init(0, 0).then(() => {
            Stat.show();
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;

            var gltfResource: any[] = [
                "res/threeDimen/scene/LayaScene_dudeScene/Conventional/dudeScene.ls",
                "res/test.png",
            ];

            Laya.loader.load(gltfResource, Handler.create(this, this.onGLTFComplate));

        });
    }
    onGLTFComplate(success: boolean): void {
        GodRay.init();
        //加载场景
        let scene = Loader.getRes("res/threeDimen/scene/LayaScene_dudeScene/Conventional/dudeScene.ls").create();
        (<Scene3D>Laya.stage.addChild(scene));
        //获取场景中的相机
        var camera: Camera = (<Camera>scene.getChildByName("Camera"));
        //移动摄像机位置
        camera.transform.position = new Vector3(0, 0.81, -1.85);
        //旋转摄像机角度
        camera.transform.rotate(new Vector3(0, 0, 0), true, false);
        //设置摄像机视野范围（角度）
        camera.fieldOfView = 60;
        //设置背景颜色
        camera.clearColor = new Color(0, 0, 0.6, 1);
        //加入摄像机移动控制脚本
        camera.addComponent(CameraMoveScript);
        scene.enableFog = false;
        camera.transform.worldMatrix.cloneByArray(new Float32Array([
            0.8751683235168457,
            2.5910138479190437e-9,
            -0.48381850123405457,
            0,
            0.22795961797237396,
            0.882043719291687,
            0.41235098242759705,
            0,
            0.4267490804195404,
            -0.4711676239967346,
            0.7719367146492004,
            0,
            0.3995323181152344,
            -0.16807153820991516,
            0.08761458098888397,
            1]));
        camera.transform.worldMatrix = camera.transform.worldMatrix;

        let postprocess = camera.postProcess = new PostProcess();
        let godray = new GodRay();
        //godray.center = new Vector2(0.1, 0.5, 0.0, 0.0);
        godray.intensity = 0.5;
        godray.blurWidth = 0.8;
        
        postprocess.addEffect(godray);
        //@ts-ignore
        window.godray = godray as any;
        //设置灯光环境色
        //scene.ambientColor = new Vector3(2.5, 0, 0);

    }
}