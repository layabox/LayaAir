import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Rectangle } from "laya/maths/Rectangle";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { WebGL } from "laya/webgl/WebGL";
export class PerformanceTest_Maggots2 {
    constructor(maincls) {
        this.texturePath = "res/tinyMaggot.png";
        this.padding = 100;
        this.maggotAmount = 0;
        this.tick = 0;
        this.maggots = [];
        this.Main = null;
        this.Main = maincls;
        Laya.init(Browser.width, Browser.height, WebGL);
        Laya.stage.bgColor = "#000001";
        //Stat.show(true,30);
        Stat.show(0, 0);
        this.wrapBounds = new Rectangle(-this.padding, -this.padding, Laya.stage.width + this.padding * 2, Laya.stage.height + this.padding * 2);
        Laya.loader.load(this.texturePath, Handler.create(this, this.onTextureLoaded2));
    }
    onTextureLoaded2() {
        this.maggotContainer = this.createNewContainer();
        this.maggotTexture = Laya.loader.getRes(this.texturePath);
        Laya.timer.frameLoop(1, this, this.animate);
        Laya.timer.loop(5000, this, this.initMaggots);
    }
    onTextureLoaded(e = null) {
        this.maggotTexture = Laya.loader.getRes(this.texturePath);
        this.initMaggots();
        Laya.timer.frameLoop(1, this, this.animate);
    }
    /**
     * @param num
     */
    initMaggots(num = 1000) {
        this.nowTime = Browser.now();
        this.maggotAmount += num;
        for (var i = 0; i < num; i++) {
            var maggot = this.newMaggot();
            this.maggotContainer.addChild(maggot);
            this.maggots.push(maggot);
        }
    }
    createNewContainer() {
        var container = new Sprite();
        container.size(Laya.stage.width, Laya.stage.height);
        // 此处cacheAsBitmap主要是为了创建新画布
        // 解除IBQuadrangle数量限制
        // 在显示虫子数量超过16383时需要打开下面一行
        // container.cacheAsBitmap = true;
        this.Main.box2D.addChild(container);
        return container;
    }
    newMaggot() {
        var maggot = new Maggot();
        maggot.graphics.drawTexture(this.maggotTexture, 0, 0);
        maggot.pivot(16.5, 35);
        var rndScale = 0.8 + Math.random() * 0.3;
        maggot.scale(rndScale, rndScale);
        maggot.rotation = 0.1;
        maggot.x = Math.random() * Laya.stage.width;
        maggot.y = Math.random() * Laya.stage.height;
        maggot.direction = Math.random() * Math.PI;
        maggot.turningSpeed = Math.random() - 0.8;
        maggot.speed = (2 + Math.random() * 2) * 0.2;
        maggot.offset = Math.random() * 100;
        return maggot;
    }
    animate() {
        var maggot;
        var wb = this.wrapBounds;
        var angleUnit = 180 / Math.PI;
        var dir, x = 0.0, y = 0.0;
        for (var i = 0; i < this.maggotAmount; i++) {
            maggot = this.maggots[i];
            maggot.scaleY = 0.90 + Math.sin(this.tick + maggot.offset) * 0.1;
            maggot.direction += maggot.turningSpeed * 0.01;
            dir = maggot.direction;
            x = maggot.x;
            y = maggot.y;
            x += Math.sin(dir) * (maggot.speed * maggot.scaleY);
            y += Math.cos(dir) * (maggot.speed * maggot.scaleY);
            maggot.rotation = (-dir + Math.PI) * angleUnit;
            if (x < wb.x)
                x += wb.width;
            else if (x > wb.x + wb.width)
                x -= wb.width;
            if (y < wb.y)
                y += wb.height;
            else if (y > wb.y + wb.height)
                y -= wb.height;
            maggot.pos(x, y);
        }
        this.tick += 0.1;
        var currentTime = Browser.now();
        var chazhi = currentTime - this.nowTime;
        console.log("------------chazhi:" + chazhi);
        if (Stat.FPS < 50 && (chazhi > 4990) && !this._isClear) {
            this._isClear = true;
            console.log("---------clear---------");
            Laya.timer.clear(this, this.initMaggots);
        }
    }
    dispose() {
        Laya.timer.clear(this, this.animate);
    }
}
class Maggot extends Sprite {
}
