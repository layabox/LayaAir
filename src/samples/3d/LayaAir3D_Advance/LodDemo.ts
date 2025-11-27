/**
description
 LayaAir 3D场景LOD演示，通过垂直滑动条控制相机位置和方向
 */
import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Scene } from "laya/display/Scene";
import { Stage } from "laya/display/Stage";
import { Vector3 } from "laya/maths/Vector3";
import { VSlider } from "laya/ui/VSlider";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";

export class LodDemo {
    private lodScenePath: string = "res/LOD/LodDemo.ls";
    private scene: Scene;
    private vs: VSlider;
    private camera: Camera;

    private startPos: Vector3 = new Vector3(0, 0, 0);
    private startDir: Vector3 = new Vector3();
    private farDistance = 20;

    constructor() {
        Laya.init(0, 0).then(() => {
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            Stat.show();

            Scene.open(this.lodScenePath).then((scene: Scene) => {
                this.scene = scene;
                this.camera = ((this.scene.scene3D as Scene3D).getChildByName("Main Camera") as Camera);
                this.startPos = this.camera.transform.position.clone();
                this.camera.transform.getForward(this.startDir);
                let oriSprite = this.scene.scene3D._children[3];
                let posOffScale = 3;
                for (var i = 0; i < 3; i++) {
                    for (var j = 0; j < 3; j++) {
                        let cloneSprite = (oriSprite as Sprite3D).clone();
                        cloneSprite.transform.position = new Vector3(-(i + 1)*posOffScale, 0, -(j + 1)*posOffScale);
                        cloneSprite.transform.setWorldLossyScale(oriSprite.transform.getWorldLossyScale());
                        this.scene.scene3D.addChild(cloneSprite);
                    }
                }
                this.addUI();
            });
        });
    }

    addUI(): void {
        Laya.loader.load("res/ui/vscroll.png").then(() => {
            this.placeVSlider();
        });
    }



    private placeVSlider(): void {
        this.vs = new VSlider();
        Laya.stage.addChild(this.vs);
        this.vs.skin = "res/ui/vscroll.png";
        this.vs.height = 500;
        this.vs.right = 100;
        this.vs.centerY = 0;
        this.vs.min = 0;
        this.vs.max = 100;
        this.vs.value = 0;
        this.vs.tick = 1;
        this.vs.changeHandler = new Handler(this, this.sliderChange);
    }

    sliderChange(value: number): void {

        let factor = value / 100;
        let tempV3 = Vector3.TEMP;
        this.startDir.cloneTo(tempV3);
        tempV3.scale(-factor * this.farDistance, tempV3);
        tempV3.vadd(this.startPos, tempV3);
        this.camera.transform.position = tempV3;
    }


}