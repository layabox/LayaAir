import { Laya } from "Laya";
import { Animation } from "laya/display/Animation";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Tween } from "laya/utils/Tween";
export class BlendMode_Lighter {
    constructor(maincls) {
        // 一只凤凰的分辨率是550 * 400
        this.phoenixWidth = 750;
        this.phoenixHeight = 550;
        this.bgColorTweener = new Tween();
        this.gradientInterval = 2000;
        this.bgColorChannels = { r: 99, g: 0, b: 0xFF };
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        //			Laya.init(phoenixWidth * 2, phoenixHeight, WebGL);
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        Laya.stage.scaleMode = "showall";
        Laya.stage.bgColor = "#232628";
        this.setup();
    }
    setup() {
        this.createPhoenixes();
        // 动态背景渲染
        this.evalBgColor();
        Laya.timer.frameLoop(1, this, this.renderBg);
    }
    createPhoenixes() {
        var scaleFactor = Math.min(Laya.stage.width / (this.phoenixWidth * 2), Laya.stage.height / this.phoenixHeight);
        // 加了混合模式的凤凰
        this.blendedPhoenix = this.createAnimation();
        this.blendedPhoenix.blendMode = "lighter";
        this.blendedPhoenix.scale(scaleFactor, scaleFactor);
        this.blendedPhoenix.y = (Laya.stage.height - this.phoenixHeight * scaleFactor) / 2;
        // 正常模式的凤凰
        this.normalPhoenix = this.createAnimation();
        this.normalPhoenix.scale(scaleFactor, scaleFactor);
        this.normalPhoenix.x = this.phoenixWidth * scaleFactor;
        this.normalPhoenix.y = (Laya.stage.height - this.phoenixHeight * scaleFactor) / 2;
    }
    createAnimation() {
        var frames = [];
        for (var i = 1; i <= 25; ++i) {
            frames.push("res/phoenix/phoenix" + this.preFixNumber(i, 4) + ".jpg");
        }
        var animation = new Animation();
        animation.loadImages(frames);
        this.Main.box2D.addChild(animation);
        var clips = animation.frames.concat();
        // 反转帧
        clips = clips.reverse();
        // 添加到已有帧末尾
        animation.frames = animation.frames.concat(clips);
        animation.play();
        return animation;
    }
    preFixNumber(num, strLen) {
        return ("0000000000" + num).slice(-strLen);
    }
    evalBgColor() {
        var color = Math.random() * 0xFFFFFF;
        var channels = this.getColorChannals(color);
        this.bgColorTweener.to(this.bgColorChannels, { r: channels[0], g: channels[1], b: channels[2] }, this.gradientInterval, null, Handler.create(this, this.onTweenComplete));
    }
    getColorChannals(color) {
        var result = [];
        result.push(color >> 16);
        result.push(color >> 8 & 0xFF);
        result.push(color & 0xFF);
        return result;
    }
    onTweenComplete() {
        this.evalBgColor();
    }
    renderBg() {
        this.Main.box2D.graphics.clear();
        this.Main.box2D.graphics.drawRect(this.blendedPhoenix.x, this.blendedPhoenix.y, this.phoenixWidth, this.phoenixHeight, this.getHexColorString());
    }
    getHexColorString() {
        this.bgColorChannels.r = Math.floor(this.bgColorChannels.r);
        // 绿色通道使用0
        this.bgColorChannels.g = 0;
        //obj.g = Math.floor(obj.g);
        this.bgColorChannels.b = Math.floor(this.bgColorChannels.b);
        var r = this.bgColorChannels.r.toString(16);
        r = r.length == 2 ? r : "0" + r;
        var g = this.bgColorChannels.g.toString(16);
        g = g.length == 2 ? g : "0" + g;
        var b = this.bgColorChannels.b.toString(16);
        b = b.length == 2 ? b : "0" + b;
        return "#" + r + g + b;
    }
    dispose() {
        if (this.blendedPhoenix == null)
            return;
        if (this.normalPhoenix == null)
            return;
        this.bgColorTweener.clear();
        this.normalPhoenix.stop();
        this.blendedPhoenix.stop();
        Laya.timer.clear(this, this.renderBg);
        this.Main.box2D.graphics.clear();
    }
}
