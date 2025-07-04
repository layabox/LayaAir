import { Laya } from "Laya";
import { Area2D } from "laya/display/Area2D";
import { Scene } from "laya/display/Scene";
import { Camera2D } from "laya/display/Scene2DSpecial/Camera2D";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Main } from "../Main";
import { Event } from "laya/events/Event";


export class Camera2D_Layer {
    Main: typeof Main = null;

    private camera: Camera2D;
    private scene: Scene;
    private area: Area2D;
    private _index: number = 0;
    private btn: Button;
    
    private loadArray: string[] = [
        "res/threeDimen/ui/button.png",
        "res/apes/monkey1.png",
        "res/apes/monkey2.png",
        "res/apes/monkey3.png",
    ];

    private _texts = [
        "layer all",
        "layer 1",
        "layer 2",
        "layer 3",
    ]

    constructor(maincls: typeof Main) {
        this.Main = maincls;

        Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
            Laya.stage.alignV = Stage.ALIGN_MIDDLE;
            Laya.stage.alignH = Stage.ALIGN_CENTER;

            Laya.stage.scaleMode = "showall";
            Laya.stage.bgColor = "#232628";

            let scene = new Scene();
            this.scene = scene;
            this.Main.box2D.addChild(scene);

            let area = new Area2D();
            this.area = area;
            this.scene.addChild(area);

            let camera = new Camera2D();
            camera.isMain = true;
            this.camera = camera;
            area.addChild(camera);
            camera.pos(300, 100);

            this.loadRes();
        });

    }
    private loadRes(): void {
        Laya.loader.load(this.loadArray).then((res: any) => {
            this.createButton(this.loadArray[0]);
            this.createSprite(this.loadArray[1], 1);
            this.createSprite(this.loadArray[2], 2);
            this.createSprite(this.loadArray[3], 3);
        });
    }

    private createButton(url: string): void {
        let button = new Button(url, this._texts[0]);
        button.on(Event.CLICK, this, this.changeLayer);
        button.y = 200;
        button.x = 220;
        button.size(200, 60);
        button.labelSize = 40;
        this.btn = button;
        this.area.addChild(button);
    }

    private changeLayer(): void {
        this._index = (this._index + 1) % 4;
        let result = 0;
        if (this._index === 0) {
            result = -1;
        } else {
            result = 1 | (1 << this._index);
        }
        this.camera.visiableLayer = result;
        this.btn.text.text = this._texts[this._index];
    }

    private createSprite(url: string, layer: number): void {
        let sprite = new Sprite();
        sprite.texture = Laya.loader.getRes(url);
        sprite.layer = layer;
        sprite.x = layer * 130;
        // sprite.y = Laya.stage.height / 2;
        // sprite.x = Laya.stage.width / 2 + ( layer - 2 ) * 100;
        this.area.addChild(sprite);
    }
}