import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { Browser } from "laya/utils/Browser";
import { Main } from "./../Main";
import { Scene } from "laya/display/Scene";
import { Camera2D } from "laya/display/Scene2DSpecial/Camera2D";
import { Script } from "laya/components/Script";
import { Event } from "laya/events/Event";

export class Camera2DDemo {
    Main: typeof Main = null;
    constructor(maincls: typeof Main) {
        this.Main = maincls;

        Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
            Laya.stage.alignV = Stage.ALIGN_MIDDLE;
            Laya.stage.alignH = Stage.ALIGN_CENTER;

            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.bgColor = "#232628";

            this.showApe();
        });

    }

    private showApe(): void {

        var scene = new Scene();
        this.Main.box2D.addChild(scene);
        var bg: Sprite = new Sprite();
        scene.addChild(bg);
        bg.loadImage("res/guide/crazy_snowball.png");
        bg.x = 0;
        bg.y = 0;
        bg.width = Laya.stage.width;
        bg.height = Laya.stage.height;

        Laya.loader.load("res/apes/monkey2.png", Loader.IMAGE).then(() => {
            var ape: Sprite = new Sprite();
            ape.loadImage("res/apes/monkey2.png");
            ape.pos(500, 500);
            let camera = new Camera2D();
            ape.addChild(camera);
            // this.testDrag(camera);
            // this.testLimit(camera)
            this.testSmooth(camera);
            camera.isMain = true;
            ape.addComponent(testMove);
            scene.addChild(ape);
        });
    }


    private testDrag(camera: Camera2D) {

        camera.dragHorizontalEnable = true;
        camera.dragVerticalEnable = true;
        camera.drag_Bottom = 0.5;
        camera.drag_Top = 0.5;
        camera.drag_Left = 0.5;
        camera.drag_Right = 0.5;
    }

    private testLimit(camera: Camera2D) {

        camera.limit_Left = -1000;
        camera.limit_Right = 3000;
        camera.limit_Top = -1000;
        camera.limit_Bottom = 3000;
    }


    private testSmooth(camera: Camera2D) {
        camera.positionSmooth = true;
        camera.positionSpeed = 0.5;
    }
}




export class testMove extends Script {
    /**
     * 键盘按下时执行
     * @param 鼠标事件
     */
    onKeyDown(evt: Event): void {
        console.log(evt.keyCode);
        let speed = 30;
        switch (evt.keyCode) {
            case 87://w
                (this.owner as Sprite).y -= speed
                break;
            case 83://s
                (this.owner as Sprite).y += speed
                break;
            case 65://a
                (this.owner as Sprite).x -= speed
                break;
            case 68://d
                (this.owner as Sprite).x += speed
                break;
            case 32:
                (this.owner as Sprite).rotation += Math.PI / 2 / 10;
        }
    }
}