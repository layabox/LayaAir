import { Laya } from "Laya";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { UI3D } from "laya/d3/core/UI3D/UI3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Vector2 } from "laya/maths/Vector2";
import { Vector3 } from "laya/maths/Vector3";
import { MaterialRenderMode } from "laya/resource/Material";
import { PrefabImpl } from "laya/resource/PrefabImpl";
import { Stat } from "laya/utils/Stat";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";

export class UI3DDemo {
    public scene: Scene3D;
    public prefabIconPath: string = "res/ui/prefab/ui3d.lh";
    public prefabUIPath: string = "res/ui/prefab/ui3dpage.lh";
    public avatarPath: string = "res/threeDimen/fbx/Danding.lh";

    constructor() {
        Laya.init(0, 0).then(() => {
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            Stat.show();
            this.createScene();
        });
    }


    createScene(): void {
        this.scene = new Scene3D();
        Laya.stage.addChild(this.scene);
        let light: Sprite3D = new Sprite3D();
        let lightCom: DirectionLightCom = light.addComponent(DirectionLightCom);
        lightCom.intensity = 0.6;
        this.scene.addChild(light);
        let camera: Camera = new Camera(0, 0.1, 100);
        camera.addComponent(CameraMoveScript);
        camera.transform.position = new Vector3(-0.51, 2.34, 3.21);
        camera.transform.rotationEuler = new Vector3(-12, 0, 0);
        this.scene.addChild(camera);
        camera.clearFlag = CameraClearFlags.SolidColor;
        Laya.loader.load([this.avatarPath, this.prefabIconPath, this.prefabUIPath]).then(() => {
            // add Avatar
            let avatar: Sprite3D = ((Laya.loader.getRes(this.avatarPath) as PrefabImpl).create() as Sprite3D);
            this.scene.addChild(avatar);
            avatar.transform.position = new Vector3(0, 0, 0);
            this.createUI3DCom();
        });
    }


    createUI3DCom(): void {
        // 血条
        let sp3 = new Sprite3D();
        sp3.transform.position = new Vector3(0, 2.7, 0);
        this.scene.addChild(sp3);
        let sp3Com = sp3.addComponent(UI3D);
        sp3Com.prefab = Laya.loader.getRes(this.prefabIconPath);
        sp3Com.renderMode = MaterialRenderMode.RENDERMODE_TRANSPARENT;
        sp3Com.resolutionRate = 256;
        sp3Com.billboard = true;
        sp3Com.enableHit = false;

        // 交互UI
        let sp3UI = new Sprite3D();
        sp3UI.transform.position = new Vector3(-2, 1.5, 0);
        this.scene.addChild(sp3UI);
        let sp3UI3DCom = sp3UI.addComponent(UI3D);
        sp3UI3DCom.prefab = Laya.loader.getRes(this.prefabUIPath);
        sp3UI3DCom.renderMode = MaterialRenderMode.RENDERMODE_TRANSPARENT;
        sp3UI3DCom.resolutionRate = 256;
        sp3UI3DCom.scale = new Vector2(2, 2);
        sp3UI3DCom.billboard = true;
        sp3UI3DCom.enableHit = true;
    }

}