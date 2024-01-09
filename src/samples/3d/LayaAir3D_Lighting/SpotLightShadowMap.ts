import { Laya } from "Laya";
import { Stat } from "laya/utils/Stat";
import { Stage } from "laya/display/Stage";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Camera } from "laya/d3/core/Camera";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Handler } from "laya/utils/Handler";
import { Node } from "laya/display/Node";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { ShadowMode } from "laya/d3/core/light/ShadowMode";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { SpotLightCom } from "laya/d3/core/light/SpotLightCom";

export class SpotLightShadowMap {
    public camera: Camera;
    public demoScene: Scene3D;
    constructor() {
        Laya.init(0, 0).then(() => {
            Stat.show();
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            Shader3D.debugMode = true;

            Scene3D.load("res/threeDimen/testNewFunction/LayaScene_depthScene/Conventional/depthScene.ls", Handler.create(this, function (scene: Scene3D): void {
                this.demoScene = (<Scene3D>Laya.stage.addChild(scene));
                this.camera = (<Camera>scene.getChildByName("Camera"));
                this.camera.addComponent(CameraMoveScript);
                this.camera.active = true;
                this.receaveRealShadow(this.demoScene);
            }));
        });
    }
    receaveRealShadow(scene3d: Scene3D): void {
        // var childLength: number = scene3d.numChildren;
        // for (var i: number = 0; i < childLength; i++) {
        //     var childSprite: Node = scene3d.getChildAt(i);
        //     if (childSprite instanceof MeshSprite3D) {
        //         childSprite.meshRenderer.receiveShadow = true;
        //         childSprite.meshRenderer.castShadow = true;
        //     }
        //     else if (childSprite instanceof SpotLightCom) {
        //         childSprite.shadowMode = ShadowMode.Hard;
        //         // Set shadow max distance from camera.
        //         childSprite.shadowDistance = 3;
        //         // Set shadow resolution.
        //         childSprite.shadowResolution = 512;
        //         // set shadow Bias
        //         childSprite.shadowDepthBias = 1.0;
        //     }
        // }
        // return;
    }

}