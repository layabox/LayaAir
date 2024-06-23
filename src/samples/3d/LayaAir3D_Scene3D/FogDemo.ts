import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Scene } from "laya/display/Scene";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Vector3 } from "laya/maths/Vector3";
import { Button } from "laya/ui/Button";
import { VSlider } from "laya/ui/VSlider";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";

export class FogDemo {
    private fogScenePath: string = "res/fog/fogScene.ls";
    private scene: Scene;
    private scene3D: Scene3D;
    private vs: VSlider;
    private fogEnableBTN: Button;
    private speed: number = 0.5;

    private pos: Vector3 = new Vector3(0, 0, 0);
    private targetPos: Vector3 = new Vector3(20.3, 19.0, 20.6);
    private direction: Vector3 = new Vector3(1, 1, 1);
    private dirFactor: Vector3 = new Vector3(1, 1, 1);
    private lastValue: number = 0;
    private lerpFactor: number = 0.1; // 插值因子，值越小，移动越平滑
    private changePos: boolean = false;
    private camera: Camera;
    constructor() {
        Laya.init(0, 0).then(() => {
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            Scene.open(this.fogScenePath).then((scene: Scene)=>{
                this.scene = scene;
                this.scene3D = scene.scene3D as Scene3D;
                this.camera = ((this.scene.scene3D as Scene3D).getChildByName("Main Camera") as Camera);
                this.loadUI();
            });
        });
    }

    loadUI():void{
        this.placeVSlider();
        Laya.timer.frameLoop(1, this, this.update);
        Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function (): void {
            this.fogEnableBTN = Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "关闭雾效"));
            this.fogEnableBTN.size(200, 40);
            this.fogEnableBTN.labelBold = true;
            this.fogEnableBTN.labelSize = 30;
            this.fogEnableBTN.sizeGrid = "4,4,4,4";
            this.fogEnableBTN.scale(Browser.pixelRatio, Browser.pixelRatio);
            this.fogEnableBTN.pos(Laya.stage.width / 2 - this.fogEnableBTN.width * Browser.pixelRatio / 2, Laya.stage.height - 60 * Browser.pixelRatio);
            this.fogEnableBTN.on(Event.CLICK, this, this.fogEnable);

        }));
    }

    update(): void {
        if (this.changePos) {
            // 线性插值相机位置
            Vector3.lerp(this.camera.transform.position, this.targetPos, this.lerpFactor, this.pos);
            this.camera.transform.position = this.pos;
            this.changePos = false;
        }
    }

    private placeVSlider(): void {
        this.vs = new VSlider();
        this.scene.addChild(this.vs);
        this.vs.skin = "res/ui/vscroll.png";
        this.vs.height = 500;
        this.vs.right = 100;
        this.vs.centerY = 0;
        this.vs.min = 0;
        this.vs.max = 100;
        this.vs.value = 0;
        this.vs.tick = 1;
        this.vs.changeHandler = new Handler(this, this.sliderChanged);
    }

    fogEnable():void{
        if(this.scene3D.enableFog){
            this.fogEnableBTN.label = "开启雾效";
        }else{
            this.fogEnableBTN.label = "关闭雾效";
        }
        this.scene3D.enableFog = !this.scene3D.enableFog;
    }


    sliderChanged(value: number): void {
        this.changePos = true;

        this.camera.transform.getForward(this.direction);
        if (value >= this.lastValue) {
            this.dirFactor.setValue(-1, -1, -1);
            Vector3.multiply(this.direction, this.dirFactor, this.direction);
            this.direction.x += this.speed;
            this.direction.y += this.speed;
            this.direction.z += this.speed;
        } else {
            this.dirFactor.setValue(1, 1, 1);
            Vector3.multiply(this.direction, this.dirFactor, this.direction);
            this.direction.x -= this.speed;
            this.direction.y -= this.speed;
            this.direction.z -= this.speed;
        }

        Vector3.add(this.camera.transform.position, this.direction, this.targetPos);

        this.lastValue = value;
    }

    destroy(): void {
        Laya.timer.clear(this, this.update);
    }
}