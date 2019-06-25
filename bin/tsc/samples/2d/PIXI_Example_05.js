import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Browser } from "laya/utils/Browser";
import { Stat } from "laya/utils/Stat";
import { WebGL } from "laya/webgl/WebGL";
export class PIXI_Example_05 {
    constructor(maincls) {
        this.n = 2000;
        this.d = 1;
        this.current = 0;
        this.objs = 17;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.points1 = [];
        this.points2 = [];
        this.points3 = [];
        this.tpoint1 = [];
        this.tpoint2 = [];
        this.tpoint3 = [];
        this.balls = [];
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(Browser.width, Browser.height, WebGL);
        Stat.show();
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        this.setup();
    }
    setup() {
        Laya.stage.on(Event.RESIZE, this, this.onResize);
        this.makeObject(0);
        for (var i = 0; i < this.n; i++) {
            this.tpoint1[i] = this.points1[i];
            this.tpoint2[i] = this.points2[i];
            this.tpoint3[i] = this.points3[i];
            var tempBall = new Sprite();
            tempBall.loadImage('res/pixi/pixel.png');
            tempBall.pivot(3, 3);
            tempBall.alpha = 0.5;
            this.balls[i] = tempBall;
            this.Main.box2D.addChild(tempBall);
        }
        this.onResize();
        Laya.timer.loop(5000, this, this.nextObject);
        Laya.timer.frameLoop(1, this, this.update);
    }
    nextObject() {
        this.current++;
        if (this.current > this.objs) {
            this.current = 0;
        }
        this.makeObject(this.current);
    }
    makeObject(t) {
        var xd;
        var i;
        switch (t) {
            case 0:
                for (i = 0; i < this.n; i++) {
                    this.points1[i] = -50 + Math.round(Math.random() * 100);
                    this.points2[i] = 0;
                    this.points3[i] = 0;
                }
                break;
            case 1:
                for (i = 0; i < this.n; i++) {
                    xd = -90 + Math.round(Math.random() * 180);
                    this.points1[i] = (Math.cos(xd) * 10) * (Math.cos(t * 360 / this.n) * 10);
                    this.points2[i] = (Math.cos(xd) * 10) * (Math.sin(t * 360 / this.n) * 10);
                    this.points3[i] = Math.sin(xd) * 100;
                }
                break;
            case 2:
                for (i = 0; i < this.n; i++) {
                    xd = -90 + (Math.random() * 180);
                    this.points1[i] = (Math.cos(xd) * 10) * (Math.cos(t * 360 / this.n) * 10);
                    this.points2[i] = (Math.cos(xd) * 10) * (Math.sin(t * 360 / this.n) * 10);
                    this.points3[i] = Math.sin(i * 360 / this.n) * 100;
                }
                break;
            case 3:
                for (i = 0; i < this.n; i++) {
                    xd = -90 + Math.round(Math.random() * 180);
                    this.points1[i] = (Math.cos(xd) * 10) * (Math.cos(xd) * 10);
                    this.points2[i] = (Math.cos(xd) * 10) * (Math.sin(xd) * 10);
                    this.points3[i] = Math.sin(xd) * 100;
                }
                break;
            case 4:
                for (i = 0; i < this.n; i++) {
                    xd = -90 + Math.round(Math.random() * 180);
                    this.points1[i] = (Math.cos(xd) * 10) * (Math.cos(xd) * 10);
                    this.points2[i] = (Math.cos(xd) * 10) * (Math.sin(xd) * 10);
                    this.points3[i] = Math.sin(i * 360 / this.n) * 100;
                }
                break;
            case 5:
                for (i = 0; i < this.n; i++) {
                    xd = -90 + Math.round(Math.random() * 180);
                    this.points1[i] = (Math.cos(xd) * 10) * (Math.cos(xd) * 10);
                    this.points2[i] = (Math.cos(i * 360 / this.n) * 10) * (Math.sin(xd) * 10);
                    this.points3[i] = Math.sin(i * 360 / this.n) * 100;
                }
                break;
            case 6:
                for (i = 0; i < this.n; i++) {
                    xd = -90 + Math.round(Math.random() * 180);
                    this.points1[i] = (Math.cos(i * 360 / this.n) * 10) * (Math.cos(i * 360 / this.n) * 10);
                    this.points2[i] = (Math.cos(i * 360 / this.n) * 10) * (Math.sin(xd) * 10);
                    this.points3[i] = Math.sin(i * 360 / this.n) * 100;
                }
                break;
            case 7:
                for (i = 0; i < this.n; i++) {
                    xd = -90 + Math.round(Math.random() * 180);
                    this.points1[i] = (Math.cos(i * 360 / this.n) * 10) * (Math.cos(i * 360 / this.n) * 10);
                    this.points2[i] = (Math.cos(i * 360 / this.n) * 10) * (Math.sin(i * 360 / this.n) * 10);
                    this.points3[i] = Math.sin(i * 360 / this.n) * 100;
                }
                break;
            case 8:
                for (i = 0; i < this.n; i++) {
                    xd = -90 + Math.round(Math.random() * 180);
                    this.points1[i] = (Math.cos(xd) * 10) * (Math.cos(i * 360 / this.n) * 10);
                    this.points2[i] = (Math.cos(i * 360 / this.n) * 10) * (Math.sin(i * 360 / this.n) * 10);
                    this.points3[i] = Math.sin(xd) * 100;
                }
                break;
            case 9:
                for (i = 0; i < this.n; i++) {
                    xd = -90 + Math.round(Math.random() * 180);
                    this.points1[i] = (Math.cos(xd) * 10) * (Math.cos(i * 360 / this.n) * 10);
                    this.points2[i] = (Math.cos(i * 360 / this.n) * 10) * (Math.sin(xd) * 10);
                    this.points3[i] = Math.sin(xd) * 100;
                }
                break;
            case 10:
                for (i = 0; i < this.n; i++) {
                    xd = -90 + Math.round(Math.random() * 180);
                    this.points1[i] = (Math.cos(i * 360 / this.n) * 10) * (Math.cos(i * 360 / this.n) * 10);
                    this.points2[i] = (Math.cos(xd) * 10) * (Math.sin(xd) * 10);
                    this.points3[i] = Math.sin(i * 360 / this.n) * 100;
                }
                break;
            case 11:
                for (i = 0; i < this.n; i++) {
                    xd = -90 + Math.round(Math.random() * 180);
                    this.points1[i] = (Math.cos(xd) * 10) * (Math.cos(i * 360 / this.n) * 10);
                    this.points2[i] = (Math.sin(xd) * 10) * (Math.sin(i * 360 / this.n) * 10);
                    this.points3[i] = Math.sin(xd) * 100;
                }
                break;
            case 12:
                for (i = 0; i < this.n; i++) {
                    xd = -90 + Math.round(Math.random() * 180);
                    this.points1[i] = (Math.cos(xd) * 10) * (Math.cos(xd) * 10);
                    this.points2[i] = (Math.sin(xd) * 10) * (Math.sin(xd) * 10);
                    this.points3[i] = Math.sin(i * 360 / this.n) * 100;
                }
                break;
            case 13:
                for (i = 0; i < this.n; i++) {
                    xd = -90 + Math.round(Math.random() * 180);
                    this.points1[i] = (Math.cos(xd) * 10) * (Math.cos(i * 360 / this.n) * 10);
                    this.points2[i] = (Math.sin(i * 360 / this.n) * 10) * (Math.sin(xd) * 10);
                    this.points3[i] = Math.sin(i * 360 / this.n) * 100;
                }
                break;
            case 14:
                for (i = 0; i < this.n; i++) {
                    xd = -90 + Math.round(Math.random() * 180);
                    this.points1[i] = (Math.sin(xd) * 10) * (Math.cos(xd) * 10);
                    this.points2[i] = (Math.sin(xd) * 10) * (Math.sin(i * 360 / this.n) * 10);
                    this.points3[i] = Math.sin(i * 360 / this.n) * 100;
                }
                break;
            case 15:
                for (i = 0; i < this.n; i++) {
                    xd = -90 + Math.round(Math.random() * 180);
                    this.points1[i] = (Math.cos(i * 360 / this.n) * 10) * (Math.cos(i * 360 / this.n) * 10);
                    this.points2[i] = (Math.sin(i * 360 / this.n) * 10) * (Math.sin(xd) * 10);
                    this.points3[i] = Math.sin(i * 360 / this.n) * 100;
                }
                break;
            case 16:
                for (i = 0; i < this.n; i++) {
                    xd = -90 + Math.round(Math.random() * 180);
                    this.points1[i] = (Math.cos(xd) * 10) * (Math.cos(i * 360 / this.n) * 10);
                    this.points2[i] = (Math.sin(i * 360 / this.n) * 10) * (Math.sin(xd) * 10);
                    this.points3[i] = Math.sin(xd) * 100;
                }
                break;
            case 17:
                for (i = 0; i < this.n; i++) {
                    xd = -90 + Math.round(Math.random() * 180);
                    this.points1[i] = (Math.cos(xd) * 10) * (Math.cos(xd) * 10);
                    this.points2[i] = (Math.cos(i * 360 / this.n) * 10) * (Math.sin(i * 360 / this.n) * 10);
                    this.points3[i] = Math.sin(i * 360 / this.n) * 100;
                }
                break;
        }
    }
    onResize() {
    }
    update() {
        var x3d, y3d, z3d, tx, ty, tz, ox;
        if (this.d < 200) {
            this.d++;
        }
        this.vx += 0.0075;
        this.vy += 0.0075;
        this.vz += 0.0075;
        for (var i = 0; i < this.n; i++) {
            if (this.points1[i] > this.tpoint1[i]) {
                this.tpoint1[i] = this.tpoint1[i] + 1;
            }
            if (this.points1[i] < this.tpoint1[i]) {
                this.tpoint1[i] = this.tpoint1[i] - 1;
            }
            if (this.points2[i] > this.tpoint2[i]) {
                this.tpoint2[i] = this.tpoint2[i] + 1;
            }
            if (this.points2[i] < this.tpoint2[i]) {
                this.tpoint2[i] = this.tpoint2[i] - 1;
            }
            if (this.points3[i] > this.tpoint3[i]) {
                this.tpoint3[i] = this.tpoint3[i] + 1;
            }
            if (this.points3[i] < this.tpoint3[i]) {
                this.tpoint3[i] = this.tpoint3[i] - 1;
            }
            x3d = this.tpoint1[i];
            y3d = this.tpoint2[i];
            z3d = this.tpoint3[i];
            ty = (y3d * Math.cos(this.vx)) - (z3d * Math.sin(this.vx));
            tz = (y3d * Math.sin(this.vx)) + (z3d * Math.cos(this.vx));
            tx = (x3d * Math.cos(this.vy)) - (tz * Math.sin(this.vy));
            tz = (x3d * Math.sin(this.vy)) + (tz * Math.cos(this.vy));
            ox = tx;
            tx = (tx * Math.cos(this.vz)) - (ty * Math.sin(this.vz));
            ty = (ox * Math.sin(this.vz)) + (ty * Math.cos(this.vz));
            this.balls[i].x = (512 * tx) / (this.d - tz) + Laya.stage.width / 2;
            this.balls[i].y = (Laya.stage.height / 2) - (512 * ty) / (this.d - tz);
        }
    }
}
