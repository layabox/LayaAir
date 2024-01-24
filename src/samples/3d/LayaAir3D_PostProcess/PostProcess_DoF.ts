import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Stat } from "laya/utils/Stat";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Camera } from "laya/d3/core/Camera";
import { CameraMoveScript } from "../../3d/common/CameraMoveScript";
import { PostProcess } from "laya/d3/component/PostProcess";
import { Handler } from "laya/utils/Handler";
import { Loader } from "laya/net/Loader";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { GaussianDoF } from "laya/d3/core/render/PostEffect/GaussianDoF";
import { DepthTextureMode } from "laya/resource/RenderTexture";

export class PostProcessDoF {

    scene: Scene3D;
    camera: Camera;

    constructor() {
        Laya.init(0, 0).then(() => {
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;

            Stat.show();

            Shader3D.debugMode = true;

            Laya.loader.load("res/threeDimen/LayaScene_zhuandibanben/Conventional/zhuandibanben.ls", Handler.create(this, this.onComplate));
        });
    }

    onComplate(): void {

        let scene: Scene3D = this.scene = Loader.createNodes("res/threeDimen/LayaScene_zhuandibanben/Conventional/zhuandibanben.ls");
        Laya.stage.addChild(scene);
        let camera: Camera = this.camera = <Camera>scene.getChildByName("MainCamera");
        camera.addComponent(CameraMoveScript);
        let mainCamera = scene.getChildByName("BlurCamera");
        mainCamera.removeSelf();
        camera.depthTextureMode |= DepthTextureMode.Depth;

        let postProcess: PostProcess = new PostProcess();
        camera.postProcess = postProcess;

        let gaussianDoF: GaussianDoF = new GaussianDoF();
        console.log(gaussianDoF);

        postProcess.addEffect(gaussianDoF);
        gaussianDoF.farStart = 1;
        gaussianDoF.farEnd = 5;
        gaussianDoF.maxRadius = 1.0;
    }
}
