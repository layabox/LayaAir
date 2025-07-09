import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Main } from "../Main";
import { Laya } from "Laya";
import { Scene } from "laya/display/Scene";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";

export class PerformanceTest_ZIndex {
    private UNIT_WIDTH: number = 300;
    private UNIT_HEIGHT: number = 300;
    private minSpacing: number = 2;  // 最小间距

    // 三个精灵使用的图片 - 使用更好看的图标
    private spriteURLs: string[] = [
        "res/particles/rect_64.png",    // 圆形图标
        "res/particles/heart_64.png",      // 心形图标
        "res/particles/star_64.png",      // 星形图标
    ];

    Main: typeof Main = null;
    constructor(maincls: typeof Main) {
        this.Main = maincls;

        Laya.init(800, 600).then(() => {
            Laya.stage.alignV = Stage.ALIGN_MIDDLE;
            Laya.stage.alignH = Stage.ALIGN_CENTER;
            Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
            Laya.stage.bgColor = "#232628";

            // 加载所有精灵图片
            Laya.loader.load(this.spriteURLs, Handler.create(this, this.onUIAssetsLoaded));
        });
    }

    private onUIAssetsLoaded(e: any = null): void {
        // let scene = Laya.stage.addChild(new Scene);
        
        // let scene3d = scene.addChild(new Scene3D);
        
        // let camera = scene3d.addChild(new Camera);

        // 计算每行和每列可以放置的unit数量
        const totalWidth = this.UNIT_WIDTH + this.minSpacing;
        const totalHeight = this.UNIT_HEIGHT + this.minSpacing;
        const cols = Math.floor(Laya.stage.width / totalWidth);
        const rows = Math.floor(Laya.stage.height / totalHeight);

        // 计算起始位置，使整体居中
        const startX = (Laya.stage.width - (cols * totalWidth - this.minSpacing)) / 2;
        const startY = (Laya.stage.height - (rows * totalHeight - this.minSpacing)) / 2;

        // 创建网格布局
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let unit = this.createUnit();
                let x = startX + col * totalWidth;
                let y = startY + row * totalHeight;
                unit.pos(x, y);
            }
        }
    }

    private createUnit(): Sprite {
        // 创建一个容器来包含三个精灵
        let unit = new Sprite();
        unit.size(this.UNIT_WIDTH, this.UNIT_HEIGHT);

        // 创建三个同心精灵
        for (let i = 0; i < 3; i++) {
            let sprite = new Sprite();
            sprite.loadImage(this.spriteURLs[i]);

            sprite.zIndex = i;
            sprite.size(this.UNIT_WIDTH, this.UNIT_HEIGHT);
            // 将精灵居中放置
            sprite.pos(
                (this.UNIT_WIDTH - sprite.width) / 2,
                (this.UNIT_HEIGHT - sprite.height) / 2
            );
            
            unit.addChild(sprite);
        }

        this.Main.box2D.addChild(unit);
        return unit;
    }

} 