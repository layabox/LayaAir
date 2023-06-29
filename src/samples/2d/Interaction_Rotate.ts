import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Browser } from "laya/utils/Browser";
import { Main } from "./../Main";

export class Interaction_Rotate {
    private sp: Sprite;
    private preRadian: number = 0;

    Main: typeof Main = null;
    constructor(maincls: typeof Main) {
        this.Main = maincls;

        Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
            //
            Laya.stage.alignV = Stage.ALIGN_MIDDLE;
            Laya.stage.alignH = Stage.ALIGN_CENTER;
            //
            Laya.stage.scaleMode = "showall";
            Laya.stage.bgColor = "#232628";

            this.setup();
        });
    }

    private setup(): void {
        this.createSprite();

        Laya.stage.on(Event.MOUSE_UP, this, this.onMouseUp);
        Laya.stage.on(Event.MOUSE_OUT, this, this.onMouseUp);
    }

    private createSprite(): void {
        this.sp = new Sprite();
        var w: number = 200, h: number = 300;
        this.sp.graphics.drawRect(0, 0, w, h, "#FF7F50");
        this.sp.size(w, h);
        this.sp.pivot(w / 2, h / 2);
        this.sp.pos(Laya.stage.width / 2, Laya.stage.height / 2);
        this.Main.box2D.addChild(this.sp);

        this.sp.on(Event.MOUSE_DOWN, this, this.onMouseDown);
    }

    private onMouseDown(e: Event): void {
        let touches = e.touches;

        if (touches && touches.length == 2) {
            this.preRadian = Math.atan2(
                touches[0].pos.y - touches[1].pos.y,
                touches[0].pos.x - touches[1].pos.y);

            Laya.stage.on(Event.MOUSE_MOVE, this, this.onMouseMove);
        }
    }

    private onMouseMove(e: Event): void {
        var touches = e.touches;
        if (touches && touches.length == 2) {
            var nowRadian: number = Math.atan2(
                touches[0].pos.y - touches[1].pos.y,
                touches[0].pos.x - touches[1].pos.x);

            this.sp.rotation += 180 / Math.PI * (nowRadian - this.preRadian);

            this.preRadian = nowRadian;
        }
    }

    private onMouseUp(e: Event): void {
        Laya.stage.off(Event.MOUSE_MOVE, this, this.onMouseMove);
    }

    dispose(): void {
        if (this.sp) {
            this.sp.off(Event.MOUSE_DOWN, this, this.onMouseDown);
        }
        Laya.stage.off(Event.MOUSE_UP, this, this.onMouseUp);
        Laya.stage.off(Event.MOUSE_OUT, this, this.onMouseUp);
        Laya.stage.off(Event.MOUSE_MOVE, this, this.onMouseMove);
    }
}

