import { Laya } from "Laya";
import { Animator } from "laya/d3/component/Animator/Animator";
import { Camera } from "laya/d3/core/Camera";
import { MeshRenderer } from "laya/d3/core/MeshRenderer";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Vector3 } from "laya/maths/Vector3";
import { PrefabImpl } from "laya/resource/PrefabImpl";
import { HSlider } from "laya/ui/HSlider";
import { Label } from "laya/ui/Label";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";

export default class BlendShapeDemo {
    private morpheTargetPath: string = "res/threeDimen/gltf/morphstress/MorphStressTest.gltf";
    private morpheTarget: Sprite3D;

    constructor() {
        Laya.init(0, 0).then(() => {
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            Stat.show();
            Laya.loader.load([this.morpheTargetPath, "res/ui/hslider.png"]).then(() => {
                this.morpheTarget = ((Laya.loader.getRes(this.morpheTargetPath) as PrefabImpl).create() as Sprite3D);
                this.initScene();
            });
        });
    }

    initScene(): void {
        let scene: Scene3D = new Scene3D();
        Laya.stage.addChild(scene);
        let camera: Camera = new Camera(0, 0.1, 100);
        camera.transform.position = new Vector3(0, 1, 5);
        scene.addChild(camera);
        let dirLight: Sprite3D = new Sprite3D();
        let dirLightCom: DirectionLightCom = dirLight.addComponent(DirectionLightCom);
        scene.addChild(dirLight);
        scene.addChild(this.morpheTarget);
        let ani = this.morpheTarget.getComponent(Animator);
        ani.speed = 0;
		this.placeHSlider();
		this.placeHSlider1();
    }

    private placeHSlider(): void {
		var hs: HSlider = new HSlider();
		hs.skin = "res/ui/hslider.png";
		hs.width = 300;
		hs.right = 200;
		hs.top = 200;
		hs.min = 0;
		hs.max = 1;
		hs.value = 0.1;
		hs.tick = 0.01;

		hs.changeHandler = new Handler(this, this.onChange);
		Laya.stage.addChild(hs);
	}

	private placeHSlider1(): void {
		var hs1: HSlider = new HSlider();
		hs1.skin = "res/ui/hslider.png";
		hs1.width = 300;
		hs1.right = 200;
		hs1.top = 300;
		hs1.min = 0;
		hs1.max = 1;
		hs1.value = 0.1;
		hs1.tick = 0.01;

		hs1.changeHandler = new Handler(this, this.onChange1);
		Laya.stage.addChild(hs1);
	}

	private onChange(value: number): void {
		var skin = this.morpheTarget.getChildAt(0);
		var skinRender: MeshRenderer = skin.getComponent(MeshRenderer);
		skinRender.setMorphChannelWeight("Key 1", value)
	}

	private onChange1(value: number): void {
		var skin = this.morpheTarget.getChildAt(0);
		var skinRender: MeshRenderer = skin.getComponent(MeshRenderer);
		skinRender.setMorphChannelWeight("Key 4", value)
	}
}