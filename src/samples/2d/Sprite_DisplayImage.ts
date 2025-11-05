/**
description
 在Laya框架中，展示两种加载图片的方式：loadImage和drawTexture
 */
import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { Texture } from "laya/resource/Texture";
import { Browser } from "laya/utils/Browser";
import { Main } from "./../Main";
import { Image } from "laya/ui/Image";
export * as ui2 from "laya/ui2/ModuleDef";
import { Event } from "laya/events/Event";
import { Prefab } from "laya/resource/HierarchyResource";
import { Scene } from "laya/display/Scene";
import { PrefabImpl } from "laya/resource/PrefabImpl";
import { Box } from "laya/ui/Box";
import { Rectangle } from "laya/maths/Rectangle";
import { PostProcess2D } from "laya/display/PostProcess2D";
import { BlurEffect2D } from "laya/display/effect2d/BlurEffect2D";
import { GlowEffect2D } from "laya/display/effect2d/GlowEffect2D";
import { ColorEffect2D } from "laya/display/effect2d/ColorEffect2D";
import { Config } from "Config";

export class Sprite_DisplayImage {
    Main: typeof Main = null;
    constructor(maincls: typeof Main) {
        this.Main = maincls;
        // Config.useRetinalCanvas = true;
        // ui2.GSlider;
        Laya.init(1280, 720).then(() => {
            Laya.stage.alignV = Stage.ALIGN_MIDDLE;
            Laya.stage.alignH = Stage.ALIGN_CENTER;

            Laya.stage.scaleMode = "showall";
            Laya.stage.bgColor = "#232628";

            this.showApe();
        });

    }

    private showApe(): void {
        let box = new Box();
        this.Main.box2D.addChild(box);

        // let sprite = new Sprite();
        // sprite.graphics.drawRect(0, 0, 300, 300, "#ff0000");
        // box.addChild(sprite);

        // 方法1：使用loadImage
        // var ape: Image = new Image();
        // ape.blendMode = "lighter";
        // ape.gray = true;
        // box.addChild(ape);
        // ape.skin = "res/apes/monkey3.png";
        
        // let postprocess = new PostProcess2D();
        // ape.postProcess = postprocess;

        // let blur = postprocess.addEffect(new BlurEffect2D());
        // blur.strength = 5;

        // var grayscaleMat: any[] = [0.3086, 0.6094, 0.0820, 0, 0,
		// 	0.3086, 0.6094, 0.0820, 0, 0,
		// 	0.3086, 0.6094, 0.0820, 0, 0,
        //     0, 0, 0, 1, 0];
        
        // let color = postprocess.addEffect(new ColorEffect2D(grayscaleMat));
       
        // let glow = postprocess.addEffect(new GlowEffect2D("#ffff00", 10, 0, 0));

        // 方法2：使用drawTexture
        Laya.loader.load("res/apes/monkey2.png", Loader.IMAGE).then(() => {
            var t: Texture = Laya.loader.getRes("res/apes/monkey2.png");
            var ape: Sprite = new Sprite();
            ape.graphics.drawTexture(t, 0, 0);
            this.Main.box2D.addChild(ape);
            ape.pos(200, 0);
            ape.alpha = 0.5;

            var ape1: Sprite = new Sprite();
            ape1.graphics.drawTexture(t, 0, 0);
            this.Main.box2D.addChild(ape1);
            ape1.pos(300, 0);
            ape1.alpha = 0.7;
            // ape.blendMode = "lighter";
        });
    }
}

