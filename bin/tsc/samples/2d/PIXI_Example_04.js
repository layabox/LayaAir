import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Text } from "laya/display/Text";
import { Browser } from "laya/utils/Browser";
import { WebGL } from "laya/webgl/WebGL";
/**
 * ...
 * @author Survivor
 */
export class PIXI_Example_04 {
    constructor(maincls) {
        this.starCount = 2500;
        this.sx = 1.0 + (Math.random() / 20);
        this.sy = 1.0 + (Math.random() / 20);
        this.stars = [];
        this.w = Browser.width;
        this.h = Browser.height;
        this.slideX = this.w / 2;
        this.slideY = this.h / 2;
        this.Main = null;
        this.Main = maincls;
        Laya.init(this.w, this.h, WebGL);
        this.createText();
        this.start();
    }
    start() {
        for (var i = 0; i < this.starCount; i++) {
            var tempBall = new Sprite();
            tempBall.loadImage("res/pixi/bubble_32x32.png");
            tempBall.x = (Math.random() * this.w) - this.slideX;
            tempBall.y = (Math.random() * this.h) - this.slideY;
            tempBall.pivot(16, 16);
            this.stars.push({ sprite: tempBall, x: tempBall.x, y: tempBall.y });
            this.Main.box2D.addChild(tempBall);
        }
        Laya.stage.on('click', this, this.newWave);
        this.speedInfo.text = 'SX: ' + this.sx + '\nSY: ' + this.sy;
        this.resize();
        Laya.timer.frameLoop(1, this, this.update);
    }
    createText() {
        this.speedInfo = new Text();
        this.speedInfo.color = "#FFFFFF";
        this.speedInfo.pos(this.w - 160, 20);
        this.speedInfo.zOrder = 1;
        this.Main.box2D.addChild(this.speedInfo);
    }
    newWave() {
        this.sx = 1.0 + (Math.random() / 20);
        this.sy = 1.0 + (Math.random() / 20);
        this.speedInfo.text = 'SX: ' + this.sx + '\nSY: ' + this.sy;
    }
    resize() {
        this.w = Laya.stage.width;
        this.h = Laya.stage.height;
        this.slideX = this.w / 2;
        this.slideY = this.h / 2;
    }
    update() {
        for (var i = 0; i < this.starCount; i++) {
            this.stars[i].sprite.x = this.stars[i].x + this.slideX;
            this.stars[i].sprite.y = this.stars[i].y + this.slideY;
            this.stars[i].x = this.stars[i].x * this.sx;
            this.stars[i].y = this.stars[i].y * this.sy;
            if (this.stars[i].x > this.w) {
                this.stars[i].x = this.stars[i].x - this.w;
            }
            else if (this.stars[i].x < -this.w) {
                this.stars[i].x = this.stars[i].x + this.w;
            }
            if (this.stars[i].y > this.h) {
                this.stars[i].y = this.stars[i].y - this.h;
            }
            else if (this.stars[i].y < -this.h) {
                this.stars[i].y = this.stars[i].y + this.h;
            }
        }
    }
}
