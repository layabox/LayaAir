import { Laya } from "Laya";
import { Accelerator } from "laya/device/motion/Accelerator";
import { Sprite } from "laya/display/Sprite";
import { Event } from "laya/events/Event";
import { Point } from "laya/maths/Point";
import { Browser } from "laya/utils/Browser";
import { WebGL } from "laya/webgl/WebGL";
/**
 * ...
 * @author Survivor
 */
export class InputDevice_GluttonousSnake {
    constructor(maincls) {
        this.segments = [];
        this.foods = [];
        this.initialSegmentsAmount = 5;
        this.vx = 0;
        this.vy = 0;
        this.Main = null;
        this.Main = maincls;
        Laya.init(Browser.width, Browser.height, WebGL);
        // 初始化蛇
        this.initSnake();
        // 监视加速器状态
        Accelerator.instance.on(Event.CHANGE, this, this.monitorAccelerator);
        // 游戏循环
        Laya.timer.frameLoop(1, this, this.animate);
        // 食物生产
        Laya.timer.loop(3000, this, this.produceFood);
        // 游戏开始时有一个食物
        this.produceFood();
    }
    initSnake() {
        for (var i = 0; i < this.initialSegmentsAmount; i++) {
            this.addSegment();
            // 蛇头部设置
            if (i == 0) {
                var header = this.segments[0];
                // 初始化位置
                header.rotation = 180;
                this.targetPosition = new Point();
                this.targetPosition.x = Laya.stage.width / 2;
                this.targetPosition.y = Laya.stage.height / 2;
                header.pos(this.targetPosition.x + header.width, this.targetPosition.y);
                // 蛇眼睛绘制
                header.graphics.drawCircle(header.width, 5, 3, "#000000");
                header.graphics.drawCircle(header.width, -5, 3, "#000000");
            }
        }
    }
    monitorAccelerator(acceleration, accelerationIncludingGravity, rotationRate, interval) {
        this.vx = accelerationIncludingGravity.x;
        this.vy = accelerationIncludingGravity.y;
    }
    addSegment() {
        var seg = new Segment(40, 30);
        this.Main.box2D.addChildAt(seg, 0);
        // 蛇尾与上一节身体对齐
        if (this.segments.length > 0) {
            var prevSeg = this.segments[this.segments.length - 1];
            seg.rotation = prevSeg.rotation;
            var point = seg.getPinPosition();
            seg.x = prevSeg.x - point.x;
            seg.y = prevSeg.y - point.y;
        }
        this.segments.push(seg);
    }
    animate() {
        var seg = this.segments[0];
        // 更新蛇的位置
        this.targetPosition.x += this.vx;
        this.targetPosition.y += this.vy;
        // 限制蛇的移动范围
        this.limitMoveRange();
        // 检测觅食
        this.checkEatFood();
        // 更新所有关节位置
        var targetX = this.targetPosition.x;
        var targetY = this.targetPosition.y;
        for (var i = 0, len = this.segments.length; i < len; i++) {
            seg = this.segments[i];
            var dx = targetX - seg.x;
            var dy = targetY - seg.y;
            var radian = Math.atan2(dy, dx);
            seg.rotation = radian * 180 / Math.PI;
            var pinPosition = seg.getPinPosition();
            var w = pinPosition.x - seg.x;
            var h = pinPosition.y - seg.y;
            seg.x = targetX - w;
            seg.y = targetY - h;
            targetX = seg.x;
            targetY = seg.y;
        }
    }
    limitMoveRange() {
        if (this.targetPosition.x < 0)
            this.targetPosition.x = 0;
        else if (this.targetPosition.x > Laya.stage.width)
            this.targetPosition.x = Laya.stage.width;
        if (this.targetPosition.y < 0)
            this.targetPosition.y = 0;
        else if (this.targetPosition.y > Laya.stage.height)
            this.targetPosition.y = Laya.stage.height;
    }
    checkEatFood() {
        var food;
        for (var i = this.foods.length - 1; i >= 0; i--) {
            food = this.foods[i];
            if (food.hitTestPoint(this.targetPosition.x, this.targetPosition.y)) {
                this.addSegment();
                Laya.stage.removeChild(food);
                this.foods.splice(i, 1);
            }
        }
    }
    produceFood() {
        // 最多五个食物同屏
        if (this.foods.length == 5)
            return;
        var food = new Sprite();
        this.Main.box2D.addChild(food);
        this.foods.push(food);
        const foodSize = 40;
        food.size(foodSize, foodSize);
        food.graphics.drawRect(0, 0, foodSize, foodSize, "#00BFFF");
        food.x = Math.random() * Laya.stage.width;
        food.y = Math.random() * Laya.stage.height;
    }
}
class Segment extends Sprite {
    constructor(width, height) {
        super();
        this.size(width, height);
        this.init();
    }
    init() {
        this.graphics.drawRect(-this.height / 2, -this.height / 2, this.width + this.height, this.height, "#FF7F50");
    }
    // 获取关节另一头位置
    getPinPosition() {
        var radian = this.rotation * Math.PI / 180;
        var tx = this.x + Math.cos(radian) * this.width;
        var ty = this.y + Math.sin(radian) * this.width;
        return new Point(tx, ty);
    }
}
