import { Laya } from "Laya";
import { Laya3D } from "Laya3D";
import { Stage } from "laya/display/Stage";
import { Stat } from "laya/utils/Stat";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Camera } from "laya/d3/core/Camera";
import { Vector3 } from "laya/d3/math/Vector3";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { CameraMoveScript } from "../../3d/common/CameraMoveScript";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { PostProcess } from "laya/d3/component/PostProcess";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { DepthTextureMode } from "laya/d3/depthMap/DepthPass";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { GaussianDoF } from "./PostProcess_DoF/GaussianDoF";
import { Handler } from "laya/utils/Handler";
import { Loader } from "laya/net/Loader";

export class PostProcessDoF {

    scene: Scene3D;
    camera: Camera;

    constructor() {
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;

        Stat.show();

        Shader3D.debugMode = true;

        Laya.loader.create("res/threeDimen/LayaScene_zhuandibanben/Conventional/zhuandibanben.ls", Handler.create(this, this.onComplate));

    }

    onComplate(): void {

        let scene: Scene3D = this.scene = Loader.getRes("res/threeDimen/LayaScene_zhuandibanben/Conventional/zhuandibanben.ls");
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
