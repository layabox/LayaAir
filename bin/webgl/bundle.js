window.Laya=window.Laya||{};

(function (Laya) {
    'use strict';

    window.Laya = window.Laya || {};
    window.Laya.WasmAdapter = Laya.WasmAdapter;
    Laya.Laya.addBeforeInitCallback(() => {
        return Laya.Browser.loadLib("jsLibs/laya.Box2D.wasm.js");
    });

    class Sprite_DisplayImage {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.showApe();
            });
        }
        showApe() {
            var ape = new Laya.Sprite();
            this.Main.box2D.addChild(ape);
            ape.loadImage("res/apes/monkey3.png");
            Laya.Laya.loader.load("res/apes/monkey2.png", Laya.Loader.IMAGE).then(() => {
                var t = Laya.Laya.loader.getRes("res/apes/monkey2.png");
                var ape = new Laya.Sprite();
                ape.graphics.drawTexture(t, 0, 0);
                this.Main.box2D.addChild(ape);
                ape.pos(200, 0);
            });
        }
    }

    class Sprite_Container {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.createApes();
            });
        }
        createApes() {
            var layoutRadius = 150;
            var radianUnit = Math.PI / 2;
            this.apesCtn = new Laya.Sprite();
            this.Main.box2D.addChild(this.apesCtn);
            for (var i = 0; i < 4; i++) {
                var ape = new Laya.Sprite();
                ape.loadImage("res/apes/monkey" + i + ".png");
                ape.pivot(55, 72);
                ape.pos(Math.cos(radianUnit * i) * layoutRadius, Math.sin(radianUnit * i) * layoutRadius);
                this.apesCtn.addChild(ape);
            }
            this.apesCtn.pos(Laya.Laya.stage.width / 2, Laya.Laya.stage.height / 2);
            Laya.Laya.timer.frameLoop(1, this, this.animate);
        }
        animate(e = null) {
            this.apesCtn.rotation += 1;
        }
        dispose() {
            Laya.Laya.timer.clear(this, this.animate);
        }
    }

    class Sprite_RoateAndScale {
        constructor(maincls) {
            this.scaleDelta = 0;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.createApe();
            });
        }
        createApe() {
            this.ape = new Laya.Sprite();
            this.ape.loadImage("res/apes/monkey2.png");
            this.Main.box2D.addChild(this.ape);
            this.ape.pivot(55, 72);
            this.ape.x = Laya.Laya.stage.width / 2;
            this.ape.y = Laya.Laya.stage.height / 2;
            Laya.Laya.timer.frameLoop(1, this, this.animate);
        }
        animate(e = null) {
            this.ape.rotation += 2;
            this.scaleDelta += 0.02;
            var scaleValue = Math.sin(this.scaleDelta);
            this.ape.scale(scaleValue, scaleValue);
        }
        dispose() {
            Laya.Laya.timer.clear(this, this.animate);
        }
    }

    class Sprite_DrawPath {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.drawPentagram();
            });
        }
        drawPentagram() {
            var canvas = new Laya.Sprite();
            this.Main.box2D.addChild(canvas);
            var path = [];
            path.push(0, -130);
            path.push(33, -33);
            path.push(137, -30);
            path.push(55, 32);
            path.push(85, 130);
            path.push(0, 73);
            path.push(-85, 130);
            path.push(-55, 32);
            path.push(-137, -30);
            path.push(-33, -33);
            canvas.graphics.drawPoly(Laya.Laya.stage.width / 2, Laya.Laya.stage.height / 2, path, "#FF7F50");
        }
    }

    class Sprite_MagnifyingGlass {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(1136, 640).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Laya.loader.load("res/bg2.png", Laya.Handler.create(this, this.setup));
            });
        }
        setup(_e = null) {
            var bg = new Laya.Sprite();
            bg.loadImage("res/bg2.png");
            this.Main.box2D.addChild(bg);
            this.bg2 = new Laya.Sprite();
            this.bg2.loadImage("res/bg2.png");
            this.Main.box2D.addChild(this.bg2);
            this.bg2.scale(3, 3);
            this.maskSp = new Laya.Sprite();
            this.maskSp.loadImage("res/mask.png");
            this.maskSp.pivot(50, 50);
            this.bg2.mask = this.maskSp;
            Laya.Laya.stage.on("mousemove", this, this.onMouseMove);
        }
        onMouseMove(_e = null) {
            this.bg2.x = -Laya.Laya.stage.mouseX * 2;
            this.bg2.y = -Laya.Laya.stage.mouseY * 2;
            this.maskSp.x = Laya.Laya.stage.mouseX;
            this.maskSp.y = Laya.Laya.stage.mouseY;
        }
        dispose() {
            Laya.Laya.stage.off("mousemove", this, this.onMouseMove);
        }
    }

    class Sprite_DrawShapes {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(740, 400).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.drawSomething();
            });
        }
        drawSomething() {
            this.sp = new Laya.Sprite();
            this.Main.box2D.addChild(this.sp);
            this.sp.graphics.drawLine(10, 58, 146, 58, "#ff0000", 3);
            this.sp.graphics.drawLines(176, 58, [0, 0, 39, -50, 78, 0, 117, 50, 156, 0], "#ff0000", 5);
            this.sp.graphics.drawCurves(352, 58, [0, 0, 19, -100, 39, 0, 58, 100, 78, 0, 97, -100, 117, 0, 136, 100, 156, 0], "#ff0000", 5);
            this.sp.graphics.drawRect(10, 166, 166, 90, "#ffff00");
            this.sp.graphics.drawPoly(264, 166, [0, 0, 60, 0, 78.48, 57, 30, 93.48, -18.48, 57], "#ffff00");
            this.sp.graphics.drawPoly(400, 166, [0, 100, 50, 0, 100, 100], "#ffff00");
            this.sp.graphics.drawCircle(98, 332, 50, "#00ffff");
            this.sp.graphics.drawPie(240, 290, 100, 10, 60, "#00ffff");
            this.sp.graphics.drawPath(400, 310, [["moveTo", 5, 0], ["lineTo", 105, 0], ["arcTo", 110, 0, 110, 5, 5], ["lineTo", 110, 55], ["arcTo", 110, 60, 105, 60, 5], ["lineTo", 5, 60], ["arcTo", 0, 60, 0, 55, 5], ["lineTo", 0, 5], ["arcTo", 0, 0, 5, 0, 5], ["closePath"]], { fillStyle: "#00ffff" });
        }
    }

    class Sprite_Cache {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(800, 600).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Stat.show();
                this.setup();
            });
        }
        setup() {
            var textBox = new Laya.Sprite();
            var text;
            for (var i = 0; i < 1000; i++) {
                text = new Laya.Text();
                text.fontSize = 20;
                text.text = (Math.random() * 100).toFixed(0);
                text.rotation = Math.random() * 360;
                text.color = "#CCCCCC";
                text.x = Math.random() * Laya.Laya.stage.width;
                text.y = Math.random() * Laya.Laya.stage.height;
                textBox.addChild(text);
            }
            this.Main.box2D.addChild(textBox);
        }
    }

    class Sprite_NodeControl {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.createApes();
            });
        }
        createApes() {
            this.ape1 = new Laya.Sprite();
            this.ape2 = new Laya.Sprite();
            this.ape1.loadImage("res/apes/monkey2.png");
            this.ape2.loadImage("res/apes/monkey2.png");
            this.ape1.pivot(55, 72);
            this.ape2.pivot(55, 72);
            this.ape1.pos(Laya.Laya.stage.width / 2, Laya.Laya.stage.height / 2);
            this.ape2.pos(200, 0);
            this.Main.box2D.addChild(this.ape1);
            this.ape1.addChild(this.ape2);
            Laya.Laya.timer.frameLoop(1, this, this.animate);
        }
        animate(e = null) {
            this.ape1.rotation += 2;
            this.ape2.rotation -= 4;
        }
        dispose() {
            Laya.Laya.timer.clear(this, this.animate);
        }
    }

    class Sprite_Pivot {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.createApes();
            });
        }
        createApes() {
            var gap = 300;
            this.sp1 = new Laya.Sprite();
            this.sp1.loadImage("res/apes/monkey2.png");
            this.sp1.pos((Laya.Laya.stage.width - gap) / 2, Laya.Laya.stage.height / 2);
            this.sp1.pivot(55, 72);
            this.Main.box2D.addChild(this.sp1);
            this.sp2 = new Laya.Sprite();
            this.sp2.loadImage("res/apes/monkey2.png");
            this.sp2.pos((Laya.Laya.stage.width + gap) / 2, Laya.Laya.stage.height / 2);
            this.Main.box2D.addChild(this.sp2);
            Laya.Laya.timer.frameLoop(1, this, this.animate);
        }
        animate(e = null) {
            this.sp1.rotation += 2;
            this.sp2.rotation += 2;
        }
        dispose() {
            Laya.Laya.timer.clear(this, this.animate);
        }
    }

    class Sprite_SwitchTexture {
        constructor(maincls) {
            this.texture1 = "res/apes/monkey2.png";
            this.texture2 = "res/apes/monkey3.png";
            this.flag = false;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Laya.loader.load([this.texture1, this.texture2], Laya.Handler.create(this, this.onAssetsLoaded));
            });
        }
        onAssetsLoaded(e = null) {
            this.ape = new Laya.Sprite();
            this.Main.box2D.addChild(this.ape);
            this.ape.pivot(55, 72);
            this.ape.pos(Laya.Laya.stage.width / 2, Laya.Laya.stage.height / 2);
            this.switchTexture();
            this.ape.on("click", this, this.switchTexture);
        }
        switchTexture(e = null) {
            var textureUrl = (this.flag = !this.flag) ? this.texture1 :
                this.texture2;
            this.ape.graphics.clear();
            var texture = Laya.Laya.loader.getRes(textureUrl);
            this.ape.graphics.drawTexture(texture, 0, 0);
            this.ape.size(texture.width, texture.height);
        }
    }

    class Animation_SWF {
        constructor(maincls) {
            this.MCWidth = 318;
            this.MCHeight = 406;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.createMovieClip();
            });
        }
        createMovieClip() {
            var mc = new Laya.MovieClip();
            mc.load("res/swf/dragon.swf");
            mc.x = (Laya.Laya.stage.width - this.MCWidth) / 2;
            mc.y = (Laya.Laya.stage.height - this.MCHeight) / 2;
            this.Main.box2D.addChild(mc);
        }
    }

    class Animation_Altas {
        constructor(maincls) {
            this.AniConfPath = "res/fighter/fighter.json";
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Laya.loader.load(this.AniConfPath, Laya.Handler.create(this, this.createAnimation), null, Laya.Loader.ATLAS);
            });
        }
        createAnimation(_e = null) {
            var ani = new Laya.Animation();
            ani.loadAtlas(this.AniConfPath);
            ani.interval = 30;
            ani.index = 1;
            ani.play();
            var bounds = ani.getGraphicBounds();
            ani.pivot(bounds.width / 2, bounds.height / 2);
            ani.pos(Laya.Laya.stage.width / 2, Laya.Laya.stage.height / 2);
            this.Main.box2D.addChild(ani);
        }
        onMouseDown(ani) {
            if (ani.index > ani.count) {
                ani.index = 0;
            }
            else {
                ani.index++;
            }
        }
    }

    class Skeleton_MultiTexture {
        constructor(maincls) {
            this.mStartX = 300;
            this.mStartY = 280;
            this.mActionIndex = 0;
            this.mCurrIndex = 0;
            this.mCurrSkinIndex = 0;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.width, Laya.Browser.height).then(() => {
                Laya.Laya.stage.bgColor = "#ffffff";
                Laya.Stat.show();
                Laya.Laya.loader.load("res/spine/spineRes1/dragon.sk").then((templet) => {
                    this.mArmature = templet.buildArmature(0);
                    this.mArmature.x = this.mStartX;
                    this.mArmature.y = this.mStartY;
                    this.mArmature.scale(0.5, 0.5);
                    this.Main.box2D.addChild(this.mArmature);
                    this.mArmature.on(Laya.Event.STOPPED, this, this.completeHandler);
                    this.play();
                });
            });
        }
        completeHandler() {
            this.play();
        }
        play() {
            this.mCurrIndex++;
            if (this.mCurrIndex >= this.mArmature.getAnimNum()) {
                this.mCurrIndex = 0;
            }
            this.mArmature.play(this.mCurrIndex, false);
        }
        dispose() {
            if (this.mArmature == null)
                return;
            this.mArmature.stop();
            this.mArmature.off(Laya.Event.STOPPED, this, this.completeHandler);
        }
    }

    class Skeleton_SpineEvent {
        constructor(maincls) {
            this.mStartX = 300;
            this.mStartY = 340;
            this.mActionIndex = 0;
            this.mCurrIndex = 0;
            this.mCurrSkinIndex = 0;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.width, Laya.Browser.height).then(() => {
                Laya.Laya.stage.bgColor = "#ffffff";
                Laya.Stat.show();
                this.mLabelSprite = new Laya.Sprite();
                Laya.Laya.loader.load("res/spine/spineRes6/alien.sk").then((templet) => {
                    this.mArmature = templet.buildArmature(1);
                    this.mArmature.x = this.mStartX;
                    this.mArmature.y = this.mStartY;
                    this.mArmature.scale(0.5, 0.5);
                    this.Main.box2D.addChild(this.mArmature);
                    this.mArmature.on(Laya.Event.LABEL, this, this.onEvent);
                    this.mArmature.on(Laya.Event.STOPPED, this, this.completeHandler);
                    this.play();
                });
            });
        }
        completeHandler() {
            this.play();
        }
        play() {
            this.mCurrIndex++;
            if (this.mCurrIndex >= this.mArmature.getAnimNum()) {
                this.mCurrIndex = 0;
            }
            this.mArmature.play(this.mCurrIndex, false);
        }
        onEvent(e) {
            var tEventData = e;
            this.Main.box2D.addChild(this.mLabelSprite);
            this.mLabelSprite.x = this.mStartX;
            this.mLabelSprite.y = this.mStartY;
            this.mLabelSprite.graphics.clear();
            this.mLabelSprite.graphics.fillText(tEventData.name, 0, 0, "20px Arial", "#ff0000", "center");
            Laya.Tween.to(this.mLabelSprite, { "y": this.mStartY - 200 }, 1000, null, Laya.Handler.create(this, this.playEnd));
        }
        playEnd() {
            this.mLabelSprite.removeSelf();
        }
        dispose() {
            if (this.mArmature == null)
                return;
            Laya.Tween.clearAll(this.mLabelSprite);
            this.mArmature.stop();
            this.mArmature.off(Laya.Event.STOPPED, this, this.completeHandler);
        }
    }

    class Skeleton_SpineIkMesh {
        constructor(maincls) {
            this.mStartX = 180;
            this.mStartY = 340;
            this.mActionIndex = 0;
            this.mCurrIndex = 0;
            this.mCurrSkinIndex = 0;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.width, Laya.Browser.height).then(() => {
                Laya.Laya.stage.bgColor = "#ffffff";
                Laya.Stat.show();
                Laya.Laya.loader.load("res/spine/spineRes3/raptor.sk").then((templet) => {
                    this.mArmature = templet.buildArmature(1);
                    this.mArmature.x = this.mStartX;
                    this.mArmature.y = this.mStartY;
                    this.mArmature.scale(0.3, 0.3);
                    this.Main.box2D.addChild(this.mArmature);
                    this.mArmature.on(Laya.Event.STOPPED, this, this.completeHandler);
                    this.play();
                });
            });
        }
        completeHandler() {
            this.play();
        }
        play() {
            this.mCurrIndex++;
            if (this.mCurrIndex >= this.mArmature.getAnimNum()) {
                this.mCurrIndex = 0;
            }
            this.mArmature.play(this.mCurrIndex, false);
        }
        dispose() {
            if (this.mArmature == null)
                return;
            this.mArmature.stop();
            this.mArmature.off(Laya.Event.STOPPED, this, this.completeHandler);
        }
    }

    class Skeleton_SpineVine {
        constructor(maincls) {
            this.mStartX = 200;
            this.mStartY = 400;
            this.mActionIndex = 0;
            this.mCurrIndex = 0;
            this.mCurrSkinIndex = 0;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.width, Laya.Browser.height).then(() => {
                Laya.Laya.stage.bgColor = "#ffffff";
                Laya.Stat.show();
                Laya.Laya.loader.load("res/spine/spineRes5/vine.sk").then((templet) => {
                    this.mArmature = templet.buildArmature(1);
                    this.mArmature.x = this.mStartX;
                    this.mArmature.y = this.mStartY;
                    this.mArmature.scale(0.5, 0.5);
                    this.Main.box2D.addChild(this.mArmature);
                    this.mArmature.on(Laya.Event.STOPPED, this, this.completeHandler);
                    this.play();
                });
            });
        }
        completeHandler() {
            this.play();
        }
        play() {
            this.mCurrIndex++;
            if (this.mCurrIndex >= this.mArmature.getAnimNum()) {
                this.mCurrIndex = 0;
            }
            this.mArmature.play(this.mCurrIndex, false);
        }
        dispose() {
            if (this.mArmature == null)
                return;
            this.mArmature.stop();
            this.mArmature.off(Laya.Event.STOPPED, this, this.completeHandler);
        }
    }

    class Skeleton_ChangeSkin {
        constructor(maincls) {
            this.mStartX = 300;
            this.mStartY = 350;
            this.mActionIndex = 0;
            this.mCurrIndex = 0;
            this.mCurrSkinIndex = 0;
            this.mSkinList = ["goblin", "goblingirl"];
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.width, Laya.Browser.height).then(() => {
                Laya.Laya.stage.bgColor = "#ffffff";
                Laya.Stat.show();
                Laya.Laya.loader.load("res/spine/spineRes2/goblins.sk").then((templet) => {
                    this.mArmature = templet.buildArmature(1);
                    this.mArmature.x = this.mStartX;
                    this.mArmature.y = this.mStartY;
                    this.mArmature.scale(0.8, 0.8);
                    this.Main.box2D.addChild(this.mArmature);
                    this.mArmature.on(Laya.Event.STOPPED, this, this.completeHandler);
                    this.play();
                    this.changeSkin();
                    Laya.Laya.timer.loop(1000, this, this.changeSkin);
                });
            });
        }
        changeSkin() {
            this.mCurrSkinIndex++;
            if (this.mCurrSkinIndex >= this.mSkinList.length) {
                this.mCurrSkinIndex = 0;
            }
            this.mArmature.showSkinByName(this.mSkinList[this.mCurrSkinIndex]);
        }
        completeHandler() {
            this.play();
        }
        play() {
            this.mCurrIndex++;
            if (this.mCurrIndex >= this.mArmature.getAnimNum()) {
                this.mCurrIndex = 0;
            }
            this.mArmature.play(this.mCurrIndex, false);
        }
        dispose() {
            if (this.mArmature == null)
                return;
            this.mArmature.stop();
            Laya.Laya.timer.clear(this, this.changeSkin);
            this.mArmature.off(Laya.Event.STOPPED, this, this.completeHandler);
        }
    }

    class BlendMode_Lighter {
        constructor(maincls) {
            this.phoenixWidth = 750;
            this.phoenixHeight = 550;
            this.bgColorTweener = Laya.Tween.create();
            this.gradientInterval = 2000;
            this.bgColorChannels = { 'r': 99, 'g': 0, 'b': 0xFF };
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(this.phoenixWidth * 2, this.phoenixHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.setup();
            });
        }
        setup() {
            this.createPhoenixes();
            this.evalBgColor();
            Laya.Laya.timer.frameLoop(1, this, this.renderBg);
        }
        createPhoenixes() {
            var scaleFactor = Math.min(Laya.Laya.stage.width / (this.phoenixWidth * 2), Laya.Laya.stage.height / this.phoenixHeight);
            this.blendedPhoenix = this.createAnimation();
            this.blendedPhoenix.blendMode = "lighter";
            this.blendedPhoenix.scale(scaleFactor, scaleFactor);
            this.blendedPhoenix.y = (Laya.Laya.stage.height - this.phoenixHeight * scaleFactor) / 2;
            this.normalPhoenix = this.createAnimation();
            this.normalPhoenix.scale(scaleFactor, scaleFactor);
            this.normalPhoenix.x = this.phoenixWidth * scaleFactor;
            this.normalPhoenix.y = (Laya.Laya.stage.height - this.phoenixHeight * scaleFactor) / 2;
        }
        createAnimation() {
            var frames = [];
            for (var i = 1; i <= 25; ++i) {
                frames.push("res/phoenix/phoenix" + this.preFixNumber(i, 4) + ".jpg");
            }
            var animation = new Laya.Animation();
            animation.loadImages(frames);
            this.Main.box2D.addChild(animation);
            var clips = frames.concat();
            clips = clips.reverse();
            animation.images = frames.concat(clips);
            animation.play();
            return animation;
        }
        preFixNumber(num, strLen) {
            return ("0000000000" + num).slice(-strLen);
        }
        evalBgColor() {
            var color = Math.random() * 0xFFFFFF;
            var channels = this.getColorChannals(color);
            Laya.Tween.to(this.bgColorChannels, { "r": channels[0], "g": channels[1], "b": channels[2] }, this.gradientInterval, null, Laya.Handler.create(this, this.onTweenComplete));
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
            this.bgColorChannels.g = 0;
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
            Laya.Laya.timer.clear(this, this.renderBg);
            this.Main.box2D.graphics.clear();
        }
    }

    class Filters_Glow {
        constructor(maincls) {
            this.apePath = "res/apes/monkey2.png";
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Laya.loader.load(this.apePath, Laya.Handler.create(this, this.setup));
            });
        }
        setup(tex) {
            this.createApe();
            this.applayFilter();
        }
        createApe() {
            this.ape = new Laya.Sprite();
            this.ape.loadImage(this.apePath);
            var texture = Laya.Laya.loader.getRes(this.apePath);
            this.ape.x = (Laya.Laya.stage.width - texture.width) / 2;
            this.ape.y = (Laya.Laya.stage.height - texture.height) / 2;
            this.Main.box2D.addChild(this.ape);
        }
        applayFilter() {
            var glowFilter = new Laya.GlowFilter("#ffff00", 10, 0, 0);
            this.ape.filters = [glowFilter];
        }
    }

    class Filters_Blur {
        constructor(maincls) {
            this.apePath = "res/apes/monkey2.png";
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Laya.loader.load(this.apePath, Laya.Handler.create(this, this.createApe));
            });
        }
        createApe(_e = null) {
            var ape = new Laya.Sprite();
            ape.loadImage(this.apePath);
            ape.x = (Laya.Laya.stage.width - ape.width) / 2;
            ape.y = (Laya.Laya.stage.height - ape.height) / 2;
            this.Main.box2D.addChild(ape);
            this.applayFilter(ape);
        }
        applayFilter(ape) {
            var blurFilter = new Laya.BlurFilter();
            blurFilter.strength = 5;
            ape.filters = [blurFilter];
        }
    }

    class Filters_Color {
        constructor(maincls) {
            this.ApePath = "res/apes/monkey2.png";
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Laya.loader.load(this.ApePath, Laya.Handler.create(this, this.setup));
            });
        }
        setup(e = null) {
            this.normalizeApe();
            this.makeRedApe();
            this.grayingApe();
        }
        normalizeApe() {
            var originalApe = this.createApe();
            this.apeTexture = Laya.Laya.loader.getRes(this.ApePath);
            originalApe.x = (1280 - this.apeTexture.width * 3) / 2;
            originalApe.y = (720 - this.apeTexture.height) / 2;
        }
        makeRedApe() {
            var redMat = [1, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 1, 0];
            var redFilter = new Laya.ColorFilter(redMat);
            var redApe = this.createApe();
            redApe.filters = [redFilter];
            var firstChild = this.Main.box2D.getChildAt(0);
            redApe.x = firstChild.x + this.apeTexture.width;
            redApe.y = firstChild.y;
        }
        grayingApe() {
            var grayscaleMat = [0.3086, 0.6094, 0.0820, 0, 0,
                0.3086, 0.6094, 0.0820, 0, 0,
                0.3086, 0.6094, 0.0820, 0, 0,
                0, 0, 0, 1, 0];
            var grayscaleFilter = new Laya.ColorFilter(grayscaleMat);
            var grayApe = this.createApe();
            grayApe.filters = [grayscaleFilter];
            var secondChild = this.Main.box2D.getChildAt(1);
            grayApe.x = secondChild.x + this.apeTexture.width;
            grayApe.y = secondChild.y;
        }
        createApe() {
            var ape = new Laya.Sprite();
            ape.loadImage("res/apes/monkey2.png");
            this.Main.box2D.addChild(ape);
            return ape;
        }
    }

    class Sound_SimpleDemo {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.setup();
            });
        }
        setup() {
            var gap = 10;
            var soundButton = this.createButton("播放音效");
            soundButton.x = (Laya.Laya.stage.width - soundButton.width * 2 + gap) / 2;
            soundButton.y = (Laya.Laya.stage.height - soundButton.height) / 2;
            this.Main.box2D.addChild(soundButton);
            var musicButton = this.createButton("播放音乐");
            musicButton.x = soundButton.x + gap + soundButton.width;
            musicButton.y = soundButton.y;
            this.Main.box2D.addChild(musicButton);
            soundButton.on(Laya.Event.CLICK, this, this.onPlaySound);
            musicButton.on(Laya.Event.CLICK, this, this.onPlayMusic);
        }
        createButton(label) {
            var w = 110;
            var h = 40;
            var button = new Laya.Sprite();
            button.size(w, h);
            button.graphics.drawRect(0, 0, w, h, "#FF7F50");
            button.graphics.fillText(label, w / 2, 8, "25px SimHei", "#FFFFFF", "center");
            this.Main.box2D.addChild(button);
            return button;
        }
        onPlayMusic(e = null) {
            console.log("播放音乐");
            Laya.SoundManager.playMusic("res/sounds/bgm.mp3", 1, new Laya.Handler(this, this.onComplete));
        }
        onPlaySound(e = null) {
            console.log("播放音效");
            Laya.SoundManager.playSound("res/sounds/btn.mp3", 1, new Laya.Handler(this, this.onComplete));
        }
        onComplete() {
            console.log("播放完成");
        }
        dispose() {
            Laya.SoundManager.stopAllSound();
            Laya.SoundManager.stopMusic();
        }
    }

    class Text_AutoSize {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(550, 400).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.setup();
            });
        }
        setup() {
            var autoSizeText = this.createSampleText();
            autoSizeText.overflow = Laya.Text.VISIBLE;
            autoSizeText.y = 50;
            var widthLimitText = this.createSampleText();
            widthLimitText.width = 100;
            widthLimitText.y = 180;
            var heightLimitText = this.createSampleText();
            heightLimitText.height = 20;
            heightLimitText.y = 320;
        }
        createSampleText() {
            var text = new Laya.Text();
            text.overflow = Laya.Text.HIDDEN;
            text.color = "#FFFFFF";
            text.font = "Impact";
            text.fontSize = 20;
            text.borderColor = "#FFFF00";
            text.x = 80;
            this.Main.box2D.addChild(text);
            text.text = "A POWERFUL HTML5 ENGINE ON FLASH TECHNICAL\n" + "A POWERFUL HTML5 ENGINE ON FLASH TECHNICAL\n" + "A POWERFUL HTML5 ENGINE ON FLASH TECHNICAL";
            return text;
        }
    }

    class Text_ComplexStyle {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.createText();
            });
        }
        createText() {
            var txt = new Laya.Text();
            txt.text = "Layabox是性能最强的HTML5引擎技术提供商与优秀的游戏发行商，面向Flash开发者提供HTML5开发技术方案！";
            txt.width = 400;
            txt.wordWrap = true;
            txt.align = "center";
            txt.fontSize = 40;
            txt.font = "Microsoft YaHei";
            txt.color = "#ff0000";
            txt.bold = true;
            txt.leading = 5;
            txt.stroke = 2;
            txt.strokeColor = "#ffffff";
            txt.borderColor = "#00ff00";
            txt.x = (Laya.Laya.stage.width - txt.textWidth) / 2;
            txt.y = (Laya.Laya.stage.height - txt.textHeight) / 2;
            this.Main.box2D.addChild(txt);
        }
    }

    class Text_Editable {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.createInput();
            });
        }
        createInput() {
            var inputText = new Laya.Input();
            inputText.size(350, 100);
            inputText.x = Laya.Laya.stage.width - inputText.width >> 1;
            inputText.y = Laya.Laya.stage.height - inputText.height >> 1;
            inputText.text = "这段文本不可编辑，但可复制";
            inputText.editable = false;
            inputText.bold = true;
            inputText.bgColor = "#666666";
            inputText.color = "#ffffff";
            inputText.fontSize = 20;
            this.Main.box2D.addChild(inputText);
        }
    }

    class Text_Overflow {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(600, 300).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                this.createTexts();
            });
        }
        createTexts() {
            var t1 = this.createText();
            t1.overflow = Laya.Text.VISIBLE;
            t1.pos(10, 10);
            var t2 = this.createText();
            t2.overflow = Laya.Text.SCROLL;
            t2.pos(10, 110);
            var t3 = this.createText();
            t3.overflow = Laya.Text.HIDDEN;
            t3.pos(10, 210);
        }
        createText() {
            var txt = new Laya.Text();
            txt.text =
                "Layabox是HTML5引擎技术提供商与优秀的游戏发行商，面向AS/JS/TS开发者提供HTML5开发技术方案！\n" +
                    "Layabox是HTML5引擎技术提供商与优秀的游戏发行商，面向AS/JS/TS开发者提供HTML5开发技术方案！\n" +
                    "Layabox是HTML5引擎技术提供商与优秀的游戏发行商，面向AS/JS/TS开发者提供HTML5开发技术方案！";
            txt.borderColor = "#FFFF00";
            txt.size(300, 50);
            txt.fontSize = 20;
            txt.color = "#ffffff";
            this.Main.box2D.addChild(txt);
            return txt;
        }
    }

    class Text_Underline {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(600, 400).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                this.createTexts();
            });
        }
        createTexts() {
            this.createText('left', 1, null, 100, 10);
            this.createText('center', 2, "#00BFFF", 155, 150);
            this.createText('right', 3, "#FF7F50", 210, 290);
        }
        createText(align, underlineWidth, underlineColor, x, y) {
            var txt = new Laya.Text();
            txt.text = "Layabox\n是HTML5引擎技术提供商\n与优秀的游戏发行商\n面向AS/JS/TS开发者提供HTML5开发技术方案";
            txt.size(300, 50);
            txt.fontSize = 20;
            txt.color = "#ffffff";
            txt.align = align;
            txt.underline = true;
            txt.underlineColor = underlineColor;
            txt.pos(x, y);
            this.Main.box2D.addChild(txt);
            return txt;
        }
    }

    class Text_InputSingleline {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.createInput();
            });
        }
        createInput() {
            var inputText = new Laya.Input();
            inputText.size(350, 100);
            inputText.x = Laya.Laya.stage.width - inputText.width >> 1;
            inputText.y = Laya.Laya.stage.height - inputText.height >> 1;
            inputText.prompt = "Type some word...";
            inputText.bold = true;
            inputText.bgColor = "#666666";
            inputText.color = "#ffffff";
            inputText.fontSize = 20;
            this.Main.box2D.addChild(inputText);
        }
    }

    class Text_InputMultiline {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.createInput();
            });
        }
        createInput() {
            var inputText = new Laya.Input();
            inputText.prompt = "Type some word...";
            inputText.multiline = true;
            inputText.wordWrap = true;
            inputText.size(350, 100);
            inputText.x = Laya.Laya.stage.width - inputText.width >> 1;
            inputText.y = Laya.Laya.stage.height - inputText.height >> 1;
            inputText.padding = [2, 2, 2, 2];
            inputText.bgColor = "#666666";
            inputText.color = "#ffffff";
            inputText.fontSize = 20;
            this.Main.box2D.addChild(inputText);
        }
    }

    class Text_MaxChars {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                this.createInput();
            });
        }
        createInput() {
            var inputText = new Laya.Input();
            inputText.size(350, 100);
            inputText.x = Laya.Laya.stage.width - inputText.width >> 1;
            inputText.y = Laya.Laya.stage.height - inputText.height >> 1;
            inputText.bold = true;
            inputText.bgColor = "#666666";
            inputText.color = "#ffffff";
            inputText.fontSize = 20;
            inputText.maxChars = 5;
            this.Main.box2D.addChild(inputText);
        }
    }

    class Text_Restrict {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(550, 300).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                this.createTexts();
            });
        }
        createTexts() {
            this.createLabel("只允许输入数字：").pos(50, 20);
            var input = this.createInput();
            input.pos(50, 50);
            input.restrict = "0-9";
            this.createLabel("只允许输入字母：").pos(50, 100);
            input = this.createInput();
            input.pos(50, 130);
            input.restrict = "a-zA-Z";
            this.createLabel("只允许输入中文字符：").pos(50, 180);
            input = this.createInput();
            input.pos(50, 210);
            input.restrict = "\u4e00-\u9fa5";
        }
        createLabel(text) {
            var label = new Laya.Text();
            label.text = text;
            label.color = "white";
            label.fontSize = 20;
            this.Main.box2D.addChild(label);
            return label;
        }
        createInput() {
            var input = new Laya.Input();
            input.size(200, 30);
            input.borderColor = "#FFFF00";
            input.bold = true;
            input.fontSize = 20;
            input.color = "#FFFFFF";
            input.padding = [0, 4, 0, 4];
            this.Main.box2D.addChild(input);
            return input;
        }
    }

    class Text_Scroll {
        constructor(maincls) {
            this.prevX = 0;
            this.prevY = 0;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                this.createText();
            });
        }
        createText() {
            this.txt = new Laya.Text();
            this.txt.overflow = Laya.Text.SCROLL;
            this.txt.text =
                "Layabox是HTML5引擎技术提供商与优秀的游戏发行商，面向AS/JS/TS开发者提供HTML5开发技术方案！\n" +
                    "Layabox是HTML5引擎技术提供商与优秀的游戏发行商，面向AS/JS/TS开发者提供HTML5开发技术方案！\n" +
                    "Layabox是HTML5引擎技术提供商与优秀的游戏发行商，面向AS/JS/TS开发者提供HTML5开发技术方案！\n" +
                    "Layabox是HTML5引擎技术提供商与优秀的游戏发行商，面向AS/JS/TS开发者提供HTML5开发技术方案！\n" +
                    "Layabox是HTML5引擎技术提供商与优秀的游戏发行商，面向AS/JS/TS开发者提供HTML5开发技术方案！\n" +
                    "Layabox是HTML5引擎技术提供商与优秀的游戏发行商，面向AS/JS/TS开发者提供HTML5开发技术方案！";
            this.txt.size(200, 100);
            this.txt.x = Laya.Laya.stage.width - this.txt.width >> 1;
            this.txt.y = Laya.Laya.stage.height - this.txt.height >> 1;
            this.txt.borderColor = "#FFFF00";
            this.txt.fontSize = 20;
            this.txt.color = "#ffffff";
            this.Main.box2D.addChild(this.txt);
            this.txt.on(Laya.Event.MOUSE_DOWN, this, this.startScrollText);
        }
        startScrollText(e) {
            this.prevX = this.txt.mouseX;
            this.prevY = this.txt.mouseY;
            Laya.Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.scrollText);
            Laya.Laya.stage.on(Laya.Event.MOUSE_UP, this, this.finishScrollText);
        }
        finishScrollText(e) {
            Laya.Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.scrollText);
            Laya.Laya.stage.off(Laya.Event.MOUSE_UP, this, this.finishScrollText);
        }
        scrollText(e) {
            var nowX = this.txt.mouseX;
            var nowY = this.txt.mouseY;
            this.txt.scrollX += this.prevX - nowX;
            this.txt.scrollY += this.prevY - nowY;
            this.prevX = nowX;
            this.prevY = nowY;
        }
    }

    class Text_WordWrap {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                this.createText();
            });
        }
        createText() {
            var txt = new Laya.Text();
            txt.text = "Layabox是HTML5引擎技术提供商与优秀的游戏发行商，面向AS/JS/TS开发者提供HTML5开发技术方案！";
            txt.width = 300;
            txt.fontSize = 40;
            txt.color = "#ffffff";
            txt.wordWrap = true;
            txt.x = Laya.Laya.stage.width - txt.textWidth >> 1;
            txt.y = Laya.Laya.stage.height - txt.textHeight >> 1;
            this.Main.box2D.addChild(txt);
        }
    }

    class Text_BitmapFont {
        constructor(maincls) {
            this.fontName = "diyFont";
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.loadFont();
            });
        }
        loadFont() {
            Laya.Laya.loader.load("res/bitmapFont/test.fnt", Laya.Loader.FONT).then((res) => {
                this.onFontLoaded(res);
            });
        }
        onFontLoaded(bitmapFont) {
            bitmapFont.letterSpacing = 10;
            Laya.Text.registerBitmapFont(this.fontName, bitmapFont);
            this.createText(this.fontName);
        }
        createText(font) {
            var txt = new Laya.Text();
            txt.width = 250;
            txt.wordWrap = true;
            txt.text = "Do one thing at a time, and do well.";
            txt.font = font;
            txt.leading = 5;
            txt.pos(Laya.Laya.stage.width - txt.width >> 1, Laya.Laya.stage.height - txt.height >> 1);
            this.Main.box2D.addChild(txt);
        }
    }

    class Text_HTML {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.setup();
            });
        }
        setup() {
            this.createParagraph();
        }
        createParagraph() {
            var p = new Laya.Text();
            this.Main.box2D.addChild(p);
            p.zOrder = 90000;
            p.font = "Impact";
            p.fontSize = 40;
            p.html = true;
            p.text = '<font color=#e3d26a>使用</font><br/>';
            p.text += '<font color=#409ed7><b>文本的</b>HTML</font><br/>';
            p.text += '<font color=#10d269><i>创建的</i></font><br/>';
            p.text += '<font color=#dfbfc9><u>HTML富文本</u></font>';
        }
    }

    class UI_Label {
        constructor(maincls) {
            this.Main = maincls;
            Laya.Laya.init(800, 600).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                this.setup();
            });
        }
        setup() {
            this.createLabel("#FFFFFF", null).pos(30, 50);
            this.createLabel("#00FFFF", null).pos(290, 50);
            this.createLabel("#FFFF00", "#FFFFFF").pos(30, 100);
            this.createLabel("#000000", "#FFFFFF").pos(290, 100);
            this.createLabel("#FFFFFF", "#00FFFF").pos(30, 150);
            this.createLabel("#0080FF", "#00FFFF").pos(290, 150);
        }
        createLabel(color, strokeColor) {
            const STROKE_WIDTH = 4;
            var label = new Laya.Label();
            label.font = "Microsoft YaHei";
            label.text = "SAMPLE DEMO";
            label.fontSize = 30;
            label.color = color;
            if (strokeColor) {
                label.stroke = STROKE_WIDTH;
                label.strokeColor = strokeColor;
            }
            this.Main.box2D.addChild(label);
            return label;
        }
    }

    class UI_Button {
        constructor(maincls) {
            this.COLUMNS = 2;
            this.BUTTON_WIDTH = 147;
            this.BUTTON_HEIGHT = 165 / 3;
            this.HORIZONTAL_SPACING = 200;
            this.VERTICAL_SPACING = 100;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(800, 600).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                this.skins = ["res/ui/button-1.png", "res/ui/button-2.png", "res/ui/button-3.png",
                    "res/ui/button-4.png", "res/ui/button-5.png", "res/ui/button-6.png"];
                this.xOffset = (Laya.Laya.stage.width - this.HORIZONTAL_SPACING * (this.COLUMNS - 1) - this.BUTTON_WIDTH) / 2;
                this.yOffset = (Laya.Laya.stage.height - this.VERTICAL_SPACING * (this.skins.length / this.COLUMNS - 1) - this.BUTTON_HEIGHT) / 2;
                Laya.Laya.loader.load(this.skins, Laya.Handler.create(this, this.onUIAssetsLoaded));
            });
        }
        onUIAssetsLoaded(e = null) {
            for (var i = 0, len = this.skins.length; i < len; ++i) {
                var btn = this.createButton(this.skins[i]);
                var x = i % this.COLUMNS * this.HORIZONTAL_SPACING + this.xOffset;
                var y = (i / this.COLUMNS | 0) * this.VERTICAL_SPACING + this.yOffset;
                btn.pos(x, y);
                console.log(x, y);
            }
        }
        createButton(skin) {
            var btn = new Laya.Button(skin);
            this.Main.box2D.addChild(btn);
            return btn;
        }
    }

    class UI_RadioGroup {
        constructor(maincls) {
            this.SPACING = 150;
            this.X_OFFSET = 200;
            this.Y_OFFSET = 80;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(800, 600).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                this.skins = ["res/ui/radioButton (1).png", "res/ui/radioButton (2).png", "res/ui/radioButton (3).png"];
                Laya.Laya.loader.load(this.skins, Laya.Handler.create(this, this.initRadioGroups));
            });
        }
        initRadioGroups(e = null) {
            for (var i = 0; i < this.skins.length; ++i) {
                var rg = this.createRadioGroup(this.skins[i]);
                rg.selectedIndex = i;
                rg.x = i * this.SPACING + this.X_OFFSET;
                rg.y = this.Y_OFFSET;
            }
        }
        createRadioGroup(skin) {
            var rg = new Laya.RadioGroup();
            rg.skin = skin;
            rg.space = 70;
            rg.direction = "v";
            rg.labels = "Item1, Item2, Item3";
            rg.labelColors = "#787878,#d3d3d3,#FFFFFF";
            rg.labelSize = 20;
            rg.labelBold = true;
            rg.labelPadding = "5,0,0,5";
            rg.selectHandler = new Laya.Handler(this, this.onSelectChange);
            this.Main.box2D.addChild(rg);
            return rg;
        }
        onSelectChange(index) {
            console.log("你选择了第 " + (index + 1) + " 项");
        }
    }

    class UI_CheckBox {
        constructor(maincls) {
            this.COL_AMOUNT = 2;
            this.ROW_AMOUNT = 3;
            this.HORIZONTAL_SPACING = 200;
            this.VERTICAL_SPACING = 100;
            this.X_OFFSET = 100;
            this.Y_OFFSET = 50;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(800, 600).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                this.skins = ["res/ui/checkbox (1).png", "res/ui/checkbox (2).png", "res/ui/checkbox (3).png", "res/ui/checkbox (4).png", "res/ui/checkbox (5).png", "res/ui/checkbox (6).png"];
                Laya.Laya.loader.load(this.skins, Laya.Handler.create(this, this.onCheckBoxSkinLoaded));
            });
        }
        onCheckBoxSkinLoaded(e = null) {
            var cb;
            for (var i = 0; i < this.COL_AMOUNT; ++i) {
                for (var j = 0; j < this.ROW_AMOUNT; ++j) {
                    cb = this.createCheckBox(this.skins[i * this.ROW_AMOUNT + j]);
                    cb.selected = true;
                    cb.x = this.HORIZONTAL_SPACING * i + this.X_OFFSET;
                    cb.y += this.VERTICAL_SPACING * j + this.Y_OFFSET;
                    if (i == 0) {
                        cb.y += 20;
                        cb.on("change", this, this.updateLabel, [cb]);
                        this.updateLabel(cb);
                    }
                }
            }
        }
        createCheckBox(skin) {
            var cb = new Laya.CheckBox(skin);
            this.Main.box2D.addChild(cb);
            cb.labelColors = "white";
            cb.labelSize = 20;
            cb.labelFont = "Microsoft YaHei";
            cb.labelPadding = "3,0,0,5";
            return cb;
        }
        updateLabel(checkBox) {
            checkBox.label = checkBox.selected ? "已选中" : "未选中";
        }
    }

    class UI_Clip {
        constructor(maincls) {
            this.buttonSkin = "res/ui/button-7.png";
            this.clipSkin = "res/ui/num0-9.png";
            this.bgSkin = "res/ui/coutDown.png";
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(800, 600).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Laya.loader.load([this.buttonSkin, this.clipSkin, this.bgSkin], Laya.Handler.create(this, this.onSkinLoaded));
            });
        }
        onSkinLoaded(e = null) {
            this.showBg();
            this.createTimerAnimation();
            this.showTotalSeconds();
            this.createController();
        }
        showBg() {
            var bg = new Laya.Image(this.bgSkin);
            bg.size(224, 302);
            bg.pos(Laya.Laya.stage.width - bg.width >> 1, Laya.Laya.stage.height - bg.height >> 1);
            this.Main.box2D.addChild(bg);
        }
        createTimerAnimation() {
            this.counter = new Laya.Clip(this.clipSkin, 10, 1);
            this.counter.autoPlay = true;
            this.counter.interval = 1000;
            this.counter.x = (Laya.Laya.stage.width - this.counter.width) / 2 - 35;
            this.counter.y = (Laya.Laya.stage.height - this.counter.height) / 2 - 40;
            this.Main.box2D.addChild(this.counter);
        }
        showTotalSeconds() {
            var clip = new Laya.Clip(this.clipSkin, 10, 1);
            clip.index = clip.clipX - 1;
            clip.pos(this.counter.x + 60, this.counter.y);
            this.Main.box2D.addChild(clip);
        }
        createController() {
            this.controller = new Laya.Button(this.buttonSkin, "暂停");
            this.controller.labelBold = true;
            this.controller.labelColors = "#FFFFFF,#FFFFFF,#FFFFFF,#FFFFFF";
            this.controller.size(84, 30);
            this.controller.on('click', this, this.onClipSwitchState);
            this.controller.x = (Laya.Laya.stage.width - this.controller.width) / 2;
            this.controller.y = (Laya.Laya.stage.height - this.controller.height) / 2 + 110;
            this.Main.box2D.addChild(this.controller);
        }
        onClipSwitchState(e = null) {
            if (this.counter.isPlaying) {
                this.counter.stop();
                this.currFrame = this.counter.index;
                this.controller.label = "播放";
            }
            else {
                this.counter.play();
                this.counter.index = this.currFrame;
                this.controller.label = "暂停";
            }
        }
    }

    class UI_ColorPicker {
        constructor(maincls) {
            this.skin = "res/ui/colorPicker.png";
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Laya.loader.load(this.skin, Laya.Handler.create(this, this.onColorPickerSkinLoaded));
            });
        }
        onColorPickerSkinLoaded(e = null) {
            var colorPicker = new Laya.ColorPicker();
            colorPicker.selectedColor = "#ff0033";
            colorPicker.skin = this.skin;
            colorPicker.pos(100, 100);
            colorPicker.changeHandler = new Laya.Handler(this, this.onChangeColor, [colorPicker]);
            this.Main.box2D.addChild(colorPicker);
            this.onChangeColor(colorPicker);
        }
        onChangeColor(colorPicker, e = null) {
            console.log(colorPicker.selectedColor);
        }
    }

    class UI_ComboBox {
        constructor(maincls) {
            this.skin = "res/ui/combobox.png";
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(800, 600).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Laya.loader.load(this.skin, Laya.Handler.create(this, this.onLoadComplete));
            });
        }
        onLoadComplete(e = null) {
            var cb = this.createComboBox(this.skin);
            cb.autoSize = true;
            cb.pos((Laya.Laya.stage.width - cb.width) / 2, 100);
            cb.autoSize = false;
        }
        createComboBox(skin) {
            var comboBox = new Laya.ComboBox(skin, "item0,item1,item2,item3,item4,item5");
            comboBox.labelSize = 30;
            comboBox.itemSize = 25;
            comboBox.selectHandler = new Laya.Handler(this, this.onSelect, [comboBox]);
            this.Main.box2D.addChild(comboBox);
            return comboBox;
        }
        onSelect(cb, e = null) {
            console.log("选中了： " + cb.selectedLabel);
        }
    }

    class UI_Dialog {
        constructor() {
            this.DIALOG_WIDTH = 220;
            this.DIALOG_HEIGHT = 275;
            this.CLOSE_BTN_WIDTH = 43;
            this.CLOSE_BTN_PADDING = 5;
            Laya.Laya.init(800, 600).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                this.assets = ["res/ui/dialog (1).png", "res/ui/close.png"];
                Laya.Laya.loader.load(this.assets, Laya.Handler.create(this, this.onSkinLoadComplete));
            });
        }
        onSkinLoadComplete(e = null) {
            this.dialog = new Laya.Dialog();
            var bg = new Laya.Image(this.assets[0]);
            this.dialog.addChild(bg);
            var button = new Laya.Button(this.assets[1]);
            button.name = Laya.Dialog.CLOSE;
            button.pos(this.DIALOG_WIDTH - this.CLOSE_BTN_WIDTH - this.CLOSE_BTN_PADDING, this.CLOSE_BTN_PADDING);
            this.dialog.addChild(button);
            this.dialog.dragArea = "0,0," + this.DIALOG_WIDTH + "," + this.DIALOG_HEIGHT;
            this.dialog.show();
        }
        dispose() {
            if (this.dialog) {
                this.dialog.close();
            }
        }
    }

    class UI_ScrollBar {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(550, 400).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                var skins = [];
                skins.push("res/ui/hscroll.png", "res/ui/hscroll$bar.png", "res/ui/hscroll$down.png", "res/ui/hscroll$up.png");
                skins.push("res/ui/vscroll.png", "res/ui/vscroll$bar.png", "res/ui/vscroll$down.png", "res/ui/vscroll$up.png");
                Laya.Laya.loader.load(skins, Laya.Handler.create(this, this.onSkinLoadComplete));
            });
        }
        onSkinLoadComplete(e = null) {
            this.placeHScroller();
            this.placeVScroller();
        }
        placeHScroller() {
            var hs = new Laya.HScrollBar();
            hs.skin = "res/ui/hscroll.png";
            hs.width = 300;
            hs.pos(50, 170);
            hs.min = 0;
            hs.max = 100;
            hs.changeHandler = new Laya.Handler(this, this.onChange);
            this.Main.box2D.addChild(hs);
        }
        placeVScroller() {
            var vs = new Laya.VScrollBar();
            vs.skin = "res/ui/vscroll.png";
            vs.height = 300;
            vs.pos(400, 50);
            vs.min = 0;
            vs.max = 100;
            vs.changeHandler = new Laya.Handler(this, this.onChange);
            this.Main.box2D.addChild(vs);
        }
        onChange(value) {
            console.log("滚动条的位置： value=" + value);
        }
    }

    class UI_Slider {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(550, 400).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                var skins = [];
                skins.push("res/ui/hslider.png", "res/ui/hslider$bar.png");
                skins.push("res/ui/vslider.png", "res/ui/vslider$bar.png");
                Laya.Laya.loader.load(skins, Laya.Handler.create(this, this.onLoadComplete));
            });
        }
        onLoadComplete(e = null) {
            this.placeHSlider();
            this.placeVSlider();
        }
        placeHSlider() {
            var hs = new Laya.HSlider();
            hs.skin = "res/ui/hslider.png";
            hs.width = 300;
            hs.pos(50, 170);
            hs.min = 0;
            hs.max = 100;
            hs.value = 50;
            hs.tick = 1;
            hs.changeHandler = new Laya.Handler(this, this.onChange);
            this.Main.box2D.addChild(hs);
        }
        placeVSlider() {
            var vs = new Laya.VSlider();
            vs.skin = "res/ui/vslider.png";
            vs.height = 300;
            vs.pos(400, 50);
            vs.min = 0;
            vs.max = 100;
            vs.value = 50;
            vs.tick = 1;
            vs.changeHandler = new Laya.Handler(this, this.onChange);
            this.Main.box2D.addChild(vs);
        }
        onChange(value) {
            console.log("滑块的位置：" + value);
        }
    }

    class UI_Image {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(550, 400).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                this.setup();
            });
        }
        setup() {
            var dialog = new Laya.Image("res/ui/dialog (3).png");
            dialog.pos(165, 62.5);
            this.Main.box2D.addChild(dialog);
        }
    }

    class UI_List {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(800, 600).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                this.setup();
            });
        }
        setup() {
            var list = new Laya.List();
            list.itemRender = Item$1;
            list.repeatX = 1;
            list.repeatY = 4;
            list.x = (Laya.Laya.stage.width - Item$1.WID) / 2;
            list.y = (Laya.Laya.stage.height - Item$1.HEI * list.repeatY) / 2;
            list.vScrollBarSkin = "";
            list.scrollType = Laya.ScrollType.Vertical;
            list.scrollBar.elasticBackTime = 0;
            list.scrollBar.elasticDistance = 0;
            list.selectEnable = true;
            list.selectHandler = new Laya.Handler(this, this.onSelect);
            list.renderHandler = new Laya.Handler(this, this.updateItem);
            this.Main.box2D.addChild(list);
            var data = [];
            for (var i = 0; i < 10; ++i) {
                data.push("res/ui/listskins/1.jpg");
                data.push("res/ui/listskins/2.jpg");
                data.push("res/ui/listskins/3.jpg");
                data.push("res/ui/listskins/4.jpg");
                data.push("res/ui/listskins/5.jpg");
            }
            list.array = data;
            this._list = list;
        }
        onMuseHandler(type, index) {
            console.log("type:" + type.type + "ddd--" + this._list.scrollBar.value + "---index:" + index);
            var curX, curY;
            if (type.type == "mousedown") {
                this._oldY = Laya.Laya.stage.mouseY;
                let itemBox = this._list.getCell(index);
                this._itemHeight = itemBox.height;
            }
            else if (type.type == "mouseout") {
                curY = Laya.Laya.stage.mouseY;
                var chazhiY = Math.abs(curY - this._oldY);
                var tempIndex = Math.ceil(chazhiY / this._itemHeight);
                console.log("----------tempIndex:" + tempIndex + "---_itemHeight:" + this._itemHeight + "---chazhiY:" + chazhiY);
                var newIndex;
            }
        }
        updateItem(cell, index) {
            cell.setImg(cell.dataSource);
        }
        onSelect(index) {
            console.log("当前选择的索引：" + index);
        }
    }
    class Item$1 extends Laya.Box {
        constructor(maincls) {
            super();
            this.size(Item$1.WID, Item$1.HEI);
            this.img = new Laya.Image();
            this.addChild(this.img);
        }
        setImg(src) {
            this.img.skin = src;
        }
    }
    Item$1.WID = 373;
    Item$1.HEI = 85;

    class UI_ProgressBar {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(800, 600).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Laya.loader.load(["res/ui/progressBar.png", "res/ui/progressBar$bar.png"], Laya.Handler.create(this, this.onLoadComplete));
            });
        }
        onLoadComplete(e = null) {
            this.progressBar = new Laya.ProgressBar("res/ui/progressBar.png");
            this.progressBar.width = 400;
            this.progressBar.x = (Laya.Laya.stage.width - this.progressBar.width) / 2;
            this.progressBar.y = Laya.Laya.stage.height / 2;
            this.progressBar.sizeGrid = "5,5,5,5";
            this.progressBar.changeHandler = new Laya.Handler(this, this.onChange);
            this.Main.box2D.addChild(this.progressBar);
            Laya.Laya.timer.loop(100, this, this.changeValue);
        }
        changeValue() {
            if (this.progressBar.value >= 1)
                this.progressBar.value = 0;
            this.progressBar.value += 0.05;
        }
        onChange(value) {
            console.log("进度：" + Math.floor(value * 100) + "%");
        }
    }

    class UI_Tab {
        constructor(maincls) {
            this.skins = ["res/ui/tab1.png", "res/ui/tab2.png"];
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(550, 400).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Laya.stage.bgColor = "#3d3d3d";
                Laya.Laya.loader.load(this.skins, Laya.Handler.create(this, this.onSkinLoaded));
            });
        }
        onSkinLoaded(e = null) {
            var tabA = this.createTab(this.skins[0]);
            tabA.pos(40, 120);
            tabA.labelColors = "#000000,#d3d3d3,#333333";
            var tabB = this.createTab(this.skins[1]);
            tabB.pos(40, 220);
            tabB.labelColors = "#FFFFFF,#8FB299,#FFFFFF";
        }
        createTab(skin) {
            var tab = new Laya.Tab();
            tab.skin = skin;
            tab.labelBold = true;
            tab.labelSize = 20;
            tab.labelStrokeColor = "#000000";
            tab.labels = "Tab Control 1,Tab Control 2,Tab Control 3";
            tab.labelPadding = "0,0,0,0";
            tab.selectedIndex = 1;
            this.onSelect(tab.selectedIndex);
            tab.selectHandler = new Laya.Handler(this, this.onSelect);
            this.Main.box2D.addChild(tab);
            return tab;
        }
        onSelect(index) {
            console.log("当前选择的标签页索引为 " + index);
        }
    }

    class UI_Input {
        constructor(maincls) {
            this.SPACING = 100;
            this.INPUT_WIDTH = 300;
            this.INPUT_HEIGHT = 50;
            this.Y_OFFSET = 50;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(800, 600).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                this.skins = ["res/ui/input (1).png", "res/ui/input (2).png", "res/ui/input (3).png", "res/ui/input (4).png"];
                Laya.Laya.loader.load(this.skins, Laya.Handler.create(this, this.onLoadComplete));
            });
        }
        onLoadComplete(e = null) {
            for (var i = 0; i < this.skins.length; ++i) {
                var input = this.createInput(this.skins[i]);
                input.prompt = 'Type:';
                input.x = (Laya.Laya.stage.width - input.width) / 2;
                input.y = i * this.SPACING + this.Y_OFFSET;
            }
        }
        createInput(skin) {
            var ti = new Laya.TextInput();
            ti.skin = skin;
            ti.size(300, 50);
            ti.sizeGrid = "0,40,0,40";
            ti.font = "Arial";
            ti.fontSize = 30;
            ti.bold = true;
            ti.color = "#606368";
            this.Main.box2D.addChild(ti);
            return ti;
        }
    }

    class UI_TextArea {
        constructor(maincls) {
            this.skin = "res/ui/textarea.png";
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(550, 400).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Laya.loader.load(this.skin, Laya.Handler.create(this, this.onLoadComplete));
            });
        }
        onLoadComplete(e = null) {
            var ta = new Laya.TextArea("");
            ta.skin = this.skin;
            ta.font = "Arial";
            ta.fontSize = 18;
            ta.bold = true;
            ta.color = "#3d3d3d";
            ta.pos(100, 15);
            ta.size(375, 355);
            ta.padding = "70,8,8,8";
            var scaleFactor = Laya.Browser.pixelRatio;
            this.Main.box2D.addChild(ta);
        }
    }

    class UI_Tree {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(550, 400).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                var res = ["res/ui/vscroll.png",
                    "res/ui/vscroll$bar.png",
                    "res/ui/vscroll$down.png",
                    "res/ui/vscroll$up.png",
                    "res/ui/tree/clip_selectBox.png",
                    "res/ui/tree/clip_tree_folder.png",
                    "res/ui/tree/clip_tree_arrow.png"];
                Laya.Laya.loader.load(res, new Laya.Handler(this, this.onLoadComplete));
            });
        }
        onLoadComplete(e = null) {
            var treeData = "<data>";
            for (var i = 0; i < 5; ++i) {
                treeData += "<item label='Directory " + (i + 1) + "' isOpen='true'>";
                for (var j = 0; j < 5; ++j) {
                    treeData += "<leaf label='File " + (j + 1) + "'/>";
                }
                treeData += "</item>";
            }
            treeData += "</data>";
            var xml = new Laya.XML(treeData);
            var tree = new Laya.Tree();
            tree.scrollBarSkin = "res/ui/vscroll.png";
            tree.itemRender = Item;
            tree.xml = xml;
            tree.size(300, 300);
            tree.x = (Laya.Laya.stage.width - tree.width) / 2;
            tree.y = (Laya.Laya.stage.height - tree.height) / 2;
            this.Main.box2D.addChild(tree);
        }
    }
    class Item extends Laya.Box {
        constructor(maincls) {
            super();
            this.Main = null;
            this.Main = maincls;
            this.right = 0;
            this.left = 0;
            var selectBox = new Laya.Clip("res/ui/tree/clip_selectBox.png", 1, 2);
            selectBox.name = "selectBox";
            selectBox.height = 32;
            selectBox.x = 13;
            selectBox.left = 12;
            this.addChild(selectBox);
            var folder = new Laya.Clip("res/ui/tree/clip_tree_folder.png", 1, 3);
            folder.name = "folder";
            folder.x = 14;
            folder.y = 4;
            this.addChild(folder);
            var label = new Laya.Label("treeItem");
            label.name = "label";
            label.fontSize = 20;
            label.color = "#FFFFFF";
            label.padding = "6,0,0,13";
            label.width = 150;
            label.height = 30;
            label.x = 33;
            label.y = 1;
            label.left = 33;
            label.right = 0;
            this.addChild(label);
            var arrow = new Laya.Clip("res/ui/tree/clip_tree_arrow.png", 1, 2);
            arrow.name = "arrow";
            arrow.x = 0;
            arrow.y = 5;
            this.addChild(arrow);
        }
    }

    class Timer_CallLater {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                this.demonstrate();
            });
        }
        demonstrate() {
            for (var i = 0; i < 10; i++) {
                Laya.Laya.timer.callLater(this, this.onCallLater);
            }
        }
        onCallLater(e = null) {
            console.log("onCallLater triggered");
            var text = new Laya.Text();
            text.font = "SimHei";
            text.fontSize = 30;
            text.color = "#FFFFFF";
            text.text = "打开控制台可见该函数仅触发了一次";
            text.size(Laya.Laya.stage.width, Laya.Laya.stage.height);
            text.wordWrap = true;
            text.valign = "middle";
            text.align = "center";
            this.Main.box2D.addChild(text);
        }
    }

    class Timer_DelayExcute {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                this.setup();
            });
        }
        setup() {
            var vGap = 100;
            this.button1 = this.createButton("点我3秒之后 alpha - 0.5");
            this.button1.x = (Laya.Laya.stage.width - this.button1.width) / 2;
            this.button1.y = (Laya.Laya.stage.height - this.button1.height - vGap) / 2;
            this.Main.box2D.addChild(this.button1);
            this.button1.on(Laya.Event.CLICK, this, this.onDecreaseAlpha1);
            this.button2 = this.createButton("点我60帧之后 alpha - 0.5");
            this.button2.pos(this.button1.x, this.button1.y + vGap);
            this.Main.box2D.addChild(this.button2);
            this.button2.on(Laya.Event.CLICK, this, this.onDecreaseAlpha2);
        }
        createButton(label) {
            var w = 300, h = 60;
            var button = new Laya.Sprite();
            button.graphics.drawRect(0, 0, w, h, "#FF7F50");
            button.size(w, h);
            button.graphics.fillText(label, w / 2, 17, "20px simHei", "#ffffff", "center");
            return button;
        }
        onDecreaseAlpha1(e = null) {
            this.button1.off(Laya.Event.CLICK, this, this.onDecreaseAlpha1);
            Laya.Laya.timer.once(3000, this, this.onComplete1);
        }
        onDecreaseAlpha2(e = null) {
            this.button2.off(Laya.Event.CLICK, this, this.onDecreaseAlpha2);
            Laya.Laya.timer.frameOnce(60, this, this.onComplete2);
        }
        onComplete1() {
            this.button1.alpha -= 0.5;
        }
        onComplete2() {
            this.button2.alpha -= 0.5;
        }
        dispose() {
            Laya.Laya.timer.clearAll(this);
        }
    }

    class Timer_Interval {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                this.setup();
            });
        }
        setup() {
            var vGap = 200;
            this.rotateTimeBasedText = this.createText("基于时间旋转", Laya.Laya.stage.width / 2, (Laya.Laya.stage.height - vGap) / 2);
            this.rotateFrameRateBasedText = this.createText("基于帧频旋转", this.rotateTimeBasedText.x, this.rotateTimeBasedText.y + vGap);
            Laya.Laya.timer.loop(200, this, this.animateTimeBased);
            Laya.Laya.timer.frameLoop(2, this, this.animateFrameRateBased);
        }
        createText(text, x, y) {
            var t = new Laya.Text();
            t.text = text;
            t.fontSize = 30;
            t.color = "white";
            t.bold = true;
            t.pivot(t.width / 2, t.height / 2);
            t.pos(x, y);
            this.Main.box2D.addChild(t);
            return t;
        }
        animateTimeBased() {
            this.rotateTimeBasedText.rotation += 1;
        }
        animateFrameRateBased() {
            this.rotateFrameRateBasedText.rotation += 1;
        }
        dispose() {
            Laya.Laya.timer.clear(this, this.animateTimeBased);
            Laya.Laya.timer.clear(this, this.animateFrameRateBased);
        }
    }

    class Tween_SimpleSample {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                this.setup();
            });
        }
        setup() {
            var terminalX = 200;
            var characterA = this.createCharacter("res/cartoonCharacters/1.png");
            characterA.pivot(46.5, 50);
            characterA.y = 100;
            var characterB = this.createCharacter("res/cartoonCharacters/2.png");
            characterB.pivot(34, 50);
            characterB.y = 250;
            this.Main.box2D.graphics.drawLine(terminalX, 0, terminalX, Laya.Laya.stage.height, "#FFFFFF");
            Laya.Tween.to(characterA, { "x": terminalX }, 1000);
            characterB.x = terminalX;
            Laya.Tween.from(characterB, { "x": 0 }, 1000);
        }
        createCharacter(skin) {
            var character = new Laya.Sprite();
            character.loadImage(skin);
            this.Main.box2D.addChild(character);
            return character;
        }
        dispose() {
            this.Main.box2D.graphics.clear();
        }
    }

    class Tween_Letters {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                this.setup();
            });
        }
        setup() {
            var w = 400;
            var offset = Laya.Laya.stage.width - w >> 1;
            var endY = Laya.Laya.stage.height / 2 - 50;
            var demoString = "LayaBox";
            for (var i = 0, len = demoString.length; i < len; ++i) {
                var letterText = this.createLetter(demoString.charAt(i));
                letterText.x = w / len * i + offset;
                Laya.Tween.to(letterText, { "y": endY }, 1000, Laya.Ease.elasticOut, null, i * 1000);
            }
        }
        createLetter(char) {
            var letter = new Laya.Text();
            letter.text = char;
            letter.color = "#FFFFFF";
            letter.font = "Impact";
            letter.fontSize = 110;
            this.Main.box2D.addChild(letter);
            return letter;
        }
    }

    class Tween_EaseFunctionsDemo {
        constructor(maincls) {
            this.duration = 2000;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(550, 400).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                this.setup();
            });
        }
        setup() {
            this.createCharacter();
            this.createEaseFunctionList();
            this.createDurationCrontroller();
        }
        createCharacter() {
            this.character = new Laya.Sprite();
            this.character.loadImage("res/cartoonCharacters/1.png");
            this.character.pos(100, 50);
            this.Main.box2D.addChild(this.character);
        }
        createEaseFunctionList() {
            var easeFunctionsList = new Laya.List();
            easeFunctionsList.itemRender = ListItemRender;
            easeFunctionsList.pos(5, 5);
            easeFunctionsList.repeatX = 1;
            easeFunctionsList.repeatY = 20;
            easeFunctionsList.vScrollBarSkin = '';
            easeFunctionsList.selectEnable = true;
            easeFunctionsList.selectHandler = new Laya.Handler(this, this.onEaseFunctionChange, [easeFunctionsList]);
            easeFunctionsList.renderHandler = new Laya.Handler(this, this.renderList);
            this.Main.box2D.addChild(easeFunctionsList);
            var data = [];
            data.push('backIn', 'backOut', 'backInOut');
            data.push('bounceIn', 'bounceOut', 'bounceInOut');
            data.push('circIn', 'circOut', 'circInOut');
            data.push('cubicIn', 'cubicOut', 'cubicInOut');
            data.push('elasticIn', 'elasticOut', 'elasticInOut');
            data.push('expoIn', 'expoOut', 'expoInOut');
            data.push('linearIn', 'linearOut', 'linearInOut');
            data.push('linearNone');
            data.push('QuadIn', 'QuadOut', 'QuadInOut');
            data.push('quartIn', 'quartOut', 'quartInOut');
            data.push('quintIn', 'quintOut', 'quintInOut');
            data.push('sineIn', 'sineOut', 'sineInOut');
            data.push('strongIn', 'strongOut', 'strongInOut');
            easeFunctionsList.array = data;
        }
        renderList(item, e = null) {
            item.setLabel(item.dataSource);
        }
        onEaseFunctionChange(list, e = null) {
            this.character.pos(100, 50);
            this.tween && this.tween.clear();
            this.tween = Laya.Tween.to(this.character, { "x": 350, "y": 250 }, this.duration, Laya.Ease[list.selectedItem]);
        }
        createDurationCrontroller() {
            var durationInput = this.createInputWidthLabel("Duration:", '2000', 400, 10);
            durationInput.on(Laya.Event.INPUT, this, function () {
                this.duration = parseInt(durationInput.text);
            });
        }
        createInputWidthLabel(label, prompt, x, y) {
            var text = new Laya.Text();
            text.text = label;
            text.color = "white";
            this.Main.box2D.addChild(text);
            text.pos(x, y);
            var input = new Laya.Input();
            input.size(50, 20);
            input.text = prompt;
            input.align = 'center';
            this.Main.box2D.addChild(input);
            input.color = "#FFFFFF";
            input.borderColor = "#FFFFFF";
            input.pos(text.x + text.width + 10, text.y - 3);
            return input;
        }
        dispose() {
            if (this.tween) {
                this.tween.clear();
            }
        }
    }
    class ListItemRender extends Laya.Box {
        constructor() {
            super();
            this.size(100, 20);
            this.label = new Laya.Label();
            this.label.fontSize = 12;
            this.label.color = "#FFFFFF";
            this.addChild(this.label);
        }
        setLabel(value) {
            this.label.text = value;
        }
    }

    class Tween_TimeLine {
        constructor(maincls) {
            this.timeLine = new Laya.TimeLine();
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(550, 400).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                this.setup();
            });
        }
        setup() {
            this.createApe();
            this.createTimerLine();
            Laya.Laya.stage.on(Laya.Event.KEY_DOWN, this, this.keyDown);
        }
        createApe() {
            this.target = new Laya.Sprite();
            this.target.loadImage("res/apes/monkey2.png");
            this.Main.box2D.addChild(this.target);
            this.target.pivot(55, 72);
            this.target.pos(100, 100);
        }
        createTimerLine() {
            this.timeLine.addLabel("turnRight", 0).to(this.target, { 'x': 450, 'y': 100, 'scaleX': 0.5, 'scaleY': 0.5 }, 2000, null, 0).
                addLabel("turnDown", 0).to(this.target, { 'x': 450, 'y': 300, 'scaleX': 0.2, 'scaleY': 1, 'alpha': 1 }, 2000, null, 0).
                addLabel("turnLeft", 0).to(this.target, { 'x': 100, 'y': 300, 'scaleX': 1, 'scaleY': 0.2, 'alpha': 0.1 }, 2000, null, 0).
                addLabel("turnUp", 0).to(this.target, { 'x': 100, 'y': 100, 'scaleX': 1, 'scaleY': 1, 'alpha': 1 }, 2000, null, 0);
            this.timeLine.play(0, true);
            this.timeLine.on(Laya.Event.COMPLETE, this, this.onComplete);
            this.timeLine.on(Laya.Event.LABEL, this, this.onLabel);
        }
        onComplete() {
            console.log("timeLine complete!!!!");
        }
        onLabel(label) {
            console.log("LabelName:" + label);
        }
        keyDown(e) {
            switch (e.keyCode) {
                case Laya.Keyboard.LEFT:
                    this.timeLine.play("turnLeft");
                    break;
                case Laya.Keyboard.RIGHT:
                    this.timeLine.play("turnRight");
                    break;
                case Laya.Keyboard.UP:
                    this.timeLine.play("turnUp");
                    break;
                case Laya.Keyboard.DOWN:
                    this.timeLine.play("turnDown");
                    break;
                case Laya.Keyboard.P:
                    this.timeLine.pause();
                    break;
                case Laya.Keyboard.R:
                    this.timeLine.resume();
                    break;
            }
        }
        dispose() {
            Laya.Laya.stage.off(Laya.Event.KEY_DOWN, this, this.keyDown);
            if (this.timeLine) {
                this.timeLine.on(Laya.Event.COMPLETE, this, this.onComplete);
                this.timeLine.on(Laya.Event.LABEL, this, this.onLabel);
                this.timeLine.destroy();
                this.timeLine = null;
            }
        }
    }

    class Interaction_Hold {
        constructor(maincls) {
            this.HOLD_TRIGGER_TIME = 1000;
            this.apePath = "res/apes/monkey2.png";
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Laya.loader.load(this.apePath, Laya.Handler.create(this, this.createApe));
            });
        }
        createApe(_e = null) {
            this.ape = new Laya.Sprite();
            this.ape.loadImage(this.apePath);
            var texture = Laya.Laya.loader.getRes(this.apePath);
            this.ape.pivot(texture.width / 2, texture.height / 2);
            this.ape.pos(Laya.Laya.stage.width / 2, Laya.Laya.stage.height / 2);
            this.ape.scale(0.8, 0.8);
            this.Main.box2D.addChild(this.ape);
            this.ape.on(Laya.Event.MOUSE_DOWN, this, this.onApePress);
        }
        onApePress(e = null) {
            Laya.Laya.timer.once(this.HOLD_TRIGGER_TIME, this, this.onHold);
            Laya.Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onApeRelease);
        }
        onHold(e = null) {
            Laya.Tween.to(this.ape, { "scaleX": 1, "scaleY": 1 }, 500, Laya.Ease.bounceOut);
            this.isApeHold = true;
        }
        onApeRelease(e = null) {
            if (this.isApeHold) {
                this.isApeHold = false;
                Laya.Tween.to(this.ape, { "scaleX": 0.8, "scaleY": 0.8 }, 300);
            }
            else
                Laya.Laya.timer.clear(this, this.onHold);
            Laya.Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onApeRelease);
        }
        dispose() {
            if (this.ape) {
                this.ape.off(Laya.Event.MOUSE_DOWN, this, this.onApePress);
            }
            Laya.Laya.timer.clear(this, this.onHold);
            Laya.Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onApeRelease);
        }
    }

    class Interaction_Drag {
        constructor(maincls) {
            this.ApePath = "res/apes/monkey2.png";
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Laya.loader.load(this.ApePath, Laya.Handler.create(this, this.setup));
            });
        }
        setup(_e = null) {
            this.createApe();
            this.showDragRegion();
        }
        createApe() {
            this.ape = new Laya.Sprite();
            this.ape.loadImage(this.ApePath);
            this.Main.box2D.addChild(this.ape);
            var texture = Laya.Laya.loader.getRes(this.ApePath);
            this.ape.pivot(texture.width / 2, texture.height / 2);
            this.ape.x = Laya.Laya.stage.width / 2;
            this.ape.y = Laya.Laya.stage.height / 2;
            this.ape.on(Laya.Event.MOUSE_DOWN, this, this.onStartDrag);
        }
        showDragRegion() {
            var dragWidthLimit = 350;
            var dragHeightLimit = 200;
            this.dragRegion = new Laya.Rectangle(Laya.Laya.stage.width - dragWidthLimit >> 1, Laya.Laya.stage.height - dragHeightLimit >> 1, dragWidthLimit, dragHeightLimit);
            Laya.Laya.stage.graphics.drawRect(this.dragRegion.x, this.dragRegion.y, this.dragRegion.width, this.dragRegion.height, null, "#FFFFFF", 2);
        }
        onStartDrag(e = null) {
            this.ape.startDrag(this.dragRegion, true, 100);
        }
        dispose() {
            if (this.ape) {
                this.ape.off(Laya.Event.MOUSE_DOWN, this, this.onStartDrag);
            }
        }
    }

    class Interaction_Rotate {
        constructor(maincls) {
            this.preRadian = 0;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.setup();
            });
        }
        setup() {
            this.createSprite();
            Laya.Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            Laya.Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
        }
        createSprite() {
            this.sp = new Laya.Sprite();
            var w = 200, h = 300;
            this.sp.graphics.drawRect(0, 0, w, h, "#FF7F50");
            this.sp.size(w, h);
            this.sp.pivot(w / 2, h / 2);
            this.sp.pos(Laya.Laya.stage.width / 2, Laya.Laya.stage.height / 2);
            this.Main.box2D.addChild(this.sp);
            this.sp.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        }
        onMouseDown(e) {
            let touches = e.touches;
            if (touches && touches.length == 2) {
                this.preRadian = Math.atan2(touches[0].pos.y - touches[1].pos.y, touches[0].pos.x - touches[1].pos.y);
                Laya.Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            }
        }
        onMouseMove(e) {
            var touches = e.touches;
            if (touches && touches.length == 2) {
                var nowRadian = Math.atan2(touches[0].pos.y - touches[1].pos.y, touches[0].pos.x - touches[1].pos.x);
                this.sp.rotation += 180 / Math.PI * (nowRadian - this.preRadian);
                this.preRadian = nowRadian;
            }
        }
        onMouseUp(e) {
            Laya.Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        }
        dispose() {
            if (this.sp) {
                this.sp.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            }
            Laya.Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            Laya.Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
            Laya.Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        }
    }

    class Interaction_Scale {
        constructor(maincls) {
            this.lastDistance = 0;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.setup();
            });
        }
        setup() {
            this.createSprite();
            Laya.Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            Laya.Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
        }
        createSprite() {
            this.sp = new Laya.Sprite();
            var w = 300, h = 300;
            this.sp.graphics.drawRect(0, 0, w, h, "#FF7F50");
            this.sp.size(w, h);
            this.sp.pivot(w / 2, h / 2);
            this.sp.pos(Laya.Laya.stage.width / 2, Laya.Laya.stage.height / 2);
            this.Main.box2D.addChild(this.sp);
            this.sp.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        }
        onMouseDown(e = null) {
            var touches = e.touches;
            if (touches && touches.length == 2) {
                this.lastDistance = this.getDistance(touches);
                Laya.Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            }
        }
        onMouseMove(e = null) {
            var distance = this.getDistance(e.touches);
            const factor = 0.01;
            this.sp.scaleX += (distance - this.lastDistance) * factor;
            this.sp.scaleY += (distance - this.lastDistance) * factor;
            this.lastDistance = distance;
        }
        onMouseUp(e = null) {
            Laya.Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        }
        getDistance(touches) {
            var distance = 0;
            if (touches && touches.length == 2) {
                var dx = touches[0].pos.x - touches[1].pos.x;
                var dy = touches[0].pos.y - touches[1].pos.y;
                distance = Math.sqrt(dx * dx + dy * dy);
            }
            return distance;
        }
        dispose() {
            if (this.sp) {
                this.sp.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            }
            Laya.Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            Laya.Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
            Laya.Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        }
    }

    class Interaction_Swipe {
        constructor(maincls) {
            this.TrackLength = 200;
            this.TOGGLE_DIST = this.TrackLength / 2;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.setup();
            });
        }
        setup() {
            this.createSprtie();
            this.drawTrack();
        }
        createSprtie() {
            const w = 50;
            const h = 30;
            this.button = new Laya.Sprite();
            this.button.graphics.drawRect(0, 0, w, h, "#FF7F50");
            this.button.anchorX = 0.5;
            this.button.anchorY = 0.5;
            this.button.size(w, h);
            this.button.x = (Laya.Laya.stage.width - this.TrackLength) / 2;
            this.button.y = Laya.Laya.stage.height / 2;
            this.button.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            this.Main.box2D.addChild(this.button);
            this.beginPosition = this.button.x;
            this.endPosition = this.beginPosition + this.TrackLength;
        }
        drawTrack() {
            var graph = new Laya.Sprite();
            Laya.Laya.stage.graphics.drawLine(this.beginPosition, Laya.Laya.stage.height / 2, this.endPosition, Laya.Laya.stage.height / 2, "#FFFFFF", 20);
            this.Main.box2D.addChild(graph);
        }
        onMouseDown(e = null) {
            Laya.Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            this.buttonPosition = this.button.x;
            Laya.Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            Laya.Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
        }
        onMouseMove(e = null) {
            this.button.x = Math.max(Math.min(Laya.Laya.stage.mouseX, this.endPosition), this.beginPosition);
        }
        onMouseUp(e = null) {
            Laya.Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            Laya.Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            Laya.Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
            var dist = Laya.Laya.stage.mouseX - this.buttonPosition;
            var targetX = this.beginPosition;
            if (dist > this.TOGGLE_DIST)
                targetX = this.endPosition;
            Laya.Tween.to(this.button, { x: targetX }, 100);
        }
        dispose() {
            if (this.button) {
                this.button.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            }
            Laya.Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            Laya.Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            Laya.Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
            Laya.Laya.stage.graphics.clear();
        }
    }

    class Interaction_CustomEvent {
        constructor(maincls) {
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.createSprite();
            });
        }
        createSprite() {
            this.sp = new Laya.Sprite();
            this.sp.graphics.drawRect(0, 0, 200, 200, "#D2691E");
            this.sp.anchorX = 0.5;
            this.sp.anchorY = 0.5;
            this.sp.x = Laya.Laya.stage.width / 2;
            this.sp.y = Laya.Laya.stage.height / 2;
            this.sp.size(200, 200);
            this.Main.box2D.addChild(this.sp);
            this.sp.on(Interaction_CustomEvent.ROTATE, this, this.onRotate);
            this.sp.on(Laya.Event.CLICK, this, this.onSpriteClick);
        }
        onSpriteClick(e = null) {
            var randomAngle = Math.random() * 180;
            this.sp.event(Interaction_CustomEvent.ROTATE, [randomAngle]);
        }
        onRotate(newAngle) {
            Laya.Tween.to(this.sp, { "rotation": newAngle }, 1000, Laya.Ease.elasticOut);
        }
    }
    Interaction_CustomEvent.ROTATE = "rotate";

    class Interaction_Mouse {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.setup();
            });
        }
        setup() {
            this.createInteractiveTarget();
            this.createLogger();
        }
        createInteractiveTarget() {
            var rect = new Laya.Sprite();
            rect.graphics.drawRect(0, 0, 200, 200, "#D2691E");
            rect.size(200, 200);
            rect.x = (Laya.Laya.stage.width - 200) / 2;
            rect.y = (Laya.Laya.stage.height - 200) / 2;
            this.Main.box2D.addChild(rect);
            rect.on(Laya.Event.MOUSE_DOWN, this, this.mouseHandler);
            rect.on(Laya.Event.MOUSE_UP, this, this.mouseHandler);
            rect.on(Laya.Event.RIGHT_MOUSE_DOWN, this, this.mouseHandler);
            rect.on(Laya.Event.RIGHT_MOUSE_UP, this, this.mouseHandler);
            rect.on(Laya.Event.CLICK, this, this.mouseHandler);
            rect.on(Laya.Event.RIGHT_CLICK, this, this.mouseHandler);
            rect.on(Laya.Event.MOUSE_MOVE, this, this.mouseHandler);
            rect.on(Laya.Event.MOUSE_OVER, this, this.mouseHandler);
            rect.on(Laya.Event.MOUSE_OUT, this, this.mouseHandler);
            rect.on(Laya.Event.DOUBLE_CLICK, this, this.mouseHandler);
            rect.on(Laya.Event.MOUSE_WHEEL, this, this.mouseHandler);
        }
        mouseHandler(e = null) {
            switch (e.type) {
                case Laya.Event.MOUSE_DOWN:
                    this.appendText("\n————————\n左键按下");
                    break;
                case Laya.Event.MOUSE_UP:
                    this.appendText("\n左键抬起");
                    break;
                case Laya.Event.CLICK:
                    this.appendText("\n左键点击\n————————");
                    break;
                case Laya.Event.RIGHT_MOUSE_DOWN:
                    this.appendText("\n————————\n右键按下");
                    break;
                case Laya.Event.RIGHT_MOUSE_UP:
                    this.appendText("\n右键抬起");
                    break;
                case Laya.Event.RIGHT_CLICK:
                    this.appendText("\n右键单击\n————————");
                    break;
                case Laya.Event.MOUSE_MOVE:
                    if (/鼠标移动\.*$/.test(this.txt.text))
                        this.appendText(".");
                    else
                        this.appendText("\n鼠标移动");
                    break;
                case Laya.Event.MOUSE_OVER:
                    this.appendText("\n鼠标经过目标");
                    break;
                case Laya.Event.MOUSE_OUT:
                    this.appendText("\n鼠标移出目标");
                    break;
                case Laya.Event.DOUBLE_CLICK:
                    this.appendText("\n鼠标左键双击\n————————");
                    break;
                case Laya.Event.MOUSE_WHEEL:
                    this.appendText("\n鼠标滚轮滚动");
                    break;
            }
        }
        appendText(value) {
            this.txt.text += value;
            this.txt.scrollY = this.txt.maxScrollY;
        }
        createLogger() {
            this.txt = new Laya.Text();
            this.txt.overflow = Laya.Text.SCROLL;
            this.txt.text = "请把鼠标移到到矩形方块,左右键操作触发相应事件\n";
            this.txt.size(Laya.Laya.stage.width, Laya.Laya.stage.height);
            this.txt.pos(10, 50);
            this.txt.fontSize = 20;
            this.txt.wordWrap = true;
            this.txt.color = "#FFFFFF";
            this.Main.box2D.addChild(this.txt);
        }
        dispose() {
        }
    }

    class Interaction_FixInteractiveRegion {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.setup();
            });
        }
        setup() {
            this.buildWorld();
            this.createLogger();
        }
        buildWorld() {
            this.createCoralRect();
            this.createDeepSkyblueRect();
            this.createDarkOrchidRect();
            Laya.Laya.stage.name = "暗灰色舞台";
            Laya.Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onDown);
        }
        createCoralRect() {
            var coralRect = new Laya.Sprite();
            coralRect.graphics.drawRect(0, 0, Laya.Laya.stage.width, Laya.Laya.stage.height / 2, "#FF7F50");
            coralRect.name = "珊瑚色容器";
            coralRect.size(Laya.Laya.stage.width, Laya.Laya.stage.height / 2);
            this.Main.box2D.addChild(coralRect);
            coralRect.on(Laya.Event.MOUSE_DOWN, this, this.onDown);
        }
        createDeepSkyblueRect() {
            var deepSkyblueRect = new Laya.Sprite();
            deepSkyblueRect.graphics.drawRect(0, 0, 100, 100, "#00BFFF");
            deepSkyblueRect.name = "天蓝色矩形";
            deepSkyblueRect.size(100, 100);
            deepSkyblueRect.pos(10, 10);
            this.Main.box2D.addChild(deepSkyblueRect);
            deepSkyblueRect.on(Laya.Event.MOUSE_DOWN, this, this.onDown);
        }
        createDarkOrchidRect() {
            var darkOrchidRect = new Laya.Sprite();
            darkOrchidRect.name = "暗紫色矩形容器";
            darkOrchidRect.graphics.drawRect(-100, -100, 200, 200, "#9932CC");
            darkOrchidRect.pos(Laya.Laya.stage.width / 2, Laya.Laya.stage.height / 2);
            this.Main.box2D.addChild(darkOrchidRect);
            darkOrchidRect.mouseThrough = true;
            darkOrchidRect.on(Laya.Event.MOUSE_DOWN, this, this.onDown);
        }
        createLogger() {
            this.logger = new Laya.Text();
            this.logger.size(Laya.Laya.stage.width, Laya.Laya.stage.height);
            this.logger.align = 'right';
            this.logger.fontSize = 20;
            this.logger.color = "#FFFFFF";
            this.Main.box2D.addChild(this.logger);
        }
        onDown(e = null) {
            this.logger.text += "点击 - " + e.target.name + "\n";
        }
        dispose() {
            Laya.Laya.stage.off(Laya.Event.MOUSE_DOWN, this, this.onDown);
        }
    }

    class SmartScale_Scale_NOBORDER {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(550, 400).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_NOBORDER;
                Laya.Laya.stage.bgColor = "#232628";
                this.createCantralRect();
            });
        }
        createCantralRect() {
            this.rect = new Laya.Sprite();
            this.rect.graphics.drawRect(-100, -100, 200, 200, "gray");
            this.Main.box2D.addChild(this.rect);
            this.updateRectPos();
        }
        updateRectPos() {
            this.rect.x = Laya.Laya.stage.width / 2;
            this.rect.y = Laya.Laya.stage.height / 2;
        }
    }

    class SmartScale_Scale_SHOW_ALL {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(550, 400).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                this.createCantralRect();
            });
        }
        createCantralRect() {
            this.rect = new Laya.Sprite();
            this.rect.graphics.drawRect(-100, -100, 200, 200, "gray");
            this.Main.box2D.addChild(this.rect);
            this.updateRectPos();
        }
        updateRectPos() {
            this.rect.x = Laya.Laya.stage.width / 2;
            this.rect.y = Laya.Laya.stage.height / 2;
        }
    }

    class SmartScale_T {
        constructor(maincls) {
            this.modes = ["noscale", "exactfit", "showall", "noborder", "full", "fixedwidth", "fixedheight"];
            this.index = 0;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(1136, 640).then(() => {
                Laya.Laya.stage.scaleMode = "noscale";
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_HORIZONTAL;
                Laya.Laya.stage.alignH = "center";
                Laya.Laya.stage.alignV = "middle";
                var bg = new Laya.Image();
                bg.skin = "res/bg.jpg";
                this.Main.box2D.addChild(bg);
                this.txt = new Laya.Text();
                this.txt.text = "点击我切换适配模式(noscale)";
                this.txt.bold = true;
                this.txt.pos(0, 200);
                this.txt.fontSize = 30;
                this.txt.on("click", this, this.onTxtClick);
                this.Main.box2D.addChild(this.txt);
                var boy1 = new Laya.Image();
                boy1.skin = "res/cartoonCharacters/1.png";
                boy1.top = 0;
                boy1.right = 0;
                boy1.on("click", this, this.onBoyClick);
                this.Main.box2D.addChild(boy1);
                var boy2 = new Laya.Image();
                boy2.skin = "res/cartoonCharacters/2.png";
                boy2.bottom = 0;
                boy2.right = 0;
                boy2.on("click", this, this.onBoyClick);
                this.Main.box2D.addChild(boy2);
                Laya.Laya.stage.on("click", this, this.onClick);
                Laya.Laya.stage.on("resize", this, this.onResize);
            });
        }
        onBoyClick(e) {
            var boy = e.target;
            if (boy.scaleX === 1) {
                boy.scale(1.2, 1.2);
            }
            else {
                boy.scale(1, 1);
            }
        }
        onTxtClick(e) {
            e.stopPropagation();
            this.index++;
            if (this.index >= this.modes.length)
                this.index = 0;
            Laya.Laya.stage.scaleMode = this.modes[this.index];
            this.txt.text = "点击我切换适配模式" + "(" + this.modes[this.index] + ")";
        }
        onClick(e) {
            console.log("mouse:", Laya.Laya.stage.mouseX, Laya.Laya.stage.mouseY);
        }
        onResize() {
            console.log("size:", Laya.Laya.stage.width, Laya.Laya.stage.height);
        }
    }

    class Network_POST {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.connect();
                this.showLogger();
            });
        }
        connect() {
            this.hr = new Laya.HttpRequest();
            this.hr.once(Laya.Event.PROGRESS, this, this.onHttpRequestProgress);
            this.hr.once(Laya.Event.COMPLETE, this, this.onHttpRequestComplete);
            this.hr.once(Laya.Event.ERROR, this, this.onHttpRequestError);
            this.hr.send('https://httpbin.org/post', 'key1=value1&key2=value2', 'post', 'text');
        }
        showLogger() {
            this.logger = new Laya.Text();
            this.logger.fontSize = 30;
            this.logger.color = "#FFFFFF";
            this.logger.align = 'center';
            this.logger.valign = 'middle';
            this.logger.size(Laya.Laya.stage.width, Laya.Laya.stage.height);
            this.logger.text = "等待响应...\n";
            this.Main.box2D.addChild(this.logger);
        }
        onHttpRequestError(e = null) {
            console.log(e);
        }
        onHttpRequestProgress(e = null) {
            console.log(e);
        }
        onHttpRequestComplete(e = null) {
            this.logger.text += "收到数据：" + this.hr.data;
        }
    }

    class Network_GET {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.connect();
                this.showLogger();
            });
        }
        connect() {
            this.hr = new Laya.HttpRequest();
            this.hr.once(Laya.Event.PROGRESS, this, this.onHttpRequestProgress);
            this.hr.once(Laya.Event.COMPLETE, this, this.onHttpRequestComplete);
            this.hr.once(Laya.Event.ERROR, this, this.onHttpRequestError);
            this.hr.send('https://httpbin.org/get', null, 'get', 'text');
        }
        showLogger() {
            this.logger = new Laya.Text();
            this.logger.fontSize = 30;
            this.logger.color = "#FFFFFF";
            this.logger.align = 'center';
            this.logger.valign = 'middle';
            this.logger.size(Laya.Laya.stage.width, Laya.Laya.stage.height);
            this.logger.text = "等待响应...\n";
            this.Main.box2D.addChild(this.logger);
        }
        onHttpRequestError(e = null) {
            console.log(e);
        }
        onHttpRequestProgress(e = null) {
            console.log(e);
        }
        onHttpRequestComplete(e = null) {
            this.logger.text += "收到数据：" + this.hr.data;
        }
    }

    class Network_XML {
        constructor() {
            this.setup();
        }
        setup() {
            var xmlValueContainsError = "<root><item>item a</item><item>item b</item>somethis...</root1>";
            var xmlValue = "<root><item>item a</item><item>item b</item>somethings...</root>";
            this.proessXML(xmlValueContainsError);
            console.log("\n");
            this.proessXML(xmlValue);
        }
        proessXML(source) {
            try {
                var xml = new Laya.XML(source);
            }
            catch (e) {
                console.log(e.massage);
                return;
            }
            this.printDirectChildren(xml);
        }
        printDirectChildren(xml) {
            var nodes = xml.elements();
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                console.log("节点名称: " + node.name);
                console.log("\n");
            }
        }
    }

    class Network_Socket {
        constructor() {
            Laya.Laya.init(550, 400).then(() => {
                this.connect();
            });
        }
        connect() {
            this.socket = new Laya.Socket();
            this.socket.connectByUrl("ws://echo.websocket.org:80");
            this.output = this.socket.output;
            this.socket.on(Laya.Event.OPEN, this, this.onSocketOpen);
            this.socket.on(Laya.Event.CLOSE, this, this.onSocketClose);
            this.socket.on(Laya.Event.MESSAGE, this, this.onMessageReveived);
            this.socket.on(Laya.Event.ERROR, this, this.onConnectError);
        }
        onSocketOpen(e = null) {
            console.log("Connected");
            this.socket.send("demonstrate <sendString>");
            var message = "demonstrate <output.writeByte>";
            for (var i = 0; i < message.length; ++i) {
                this.output.writeByte(message.charCodeAt(i));
            }
            this.socket.flush();
        }
        onSocketClose(e = null) {
            console.log("Socket closed");
        }
        onMessageReveived(message = null) {
            console.log("Message from server:");
            if (typeof (message) == 'string') {
                console.log(message);
            }
            else if (message instanceof ArrayBuffer) {
                console.log(new Laya.Byte(message).readUTFBytes());
            }
            this.socket.input.clear();
        }
        onConnectError(e = null) {
            console.log("error");
        }
    }

    class Network_Socket2 {
        constructor() {
            Laya.Laya.init(550, 400).then(() => {
                this.connect();
            });
        }
        connect() {
            this.socket = new Laya.Socket();
            this.socket.connectByUrl("wss://echo.websocket.org:443");
            this.output = this.socket.output;
            this.socket.on(Laya.Event.OPEN, this, this.onSocketOpen);
            this.socket.on(Laya.Event.CLOSE, this, this.onSocketClose);
            this.socket.on(Laya.Event.MESSAGE, this, this.onMessageReveived);
            this.socket.on(Laya.Event.ERROR, this, this.onConnectError);
        }
        onSocketOpen(e = null) {
            console.log("Connected");
            this.socket.send("demonstrate <sendString>");
            var message = "demonstrate <output.writeByte>";
            for (var i = 0; i < message.length; ++i) {
                this.output.writeByte(message.charCodeAt(i));
            }
            this.socket.flush();
        }
        onSocketClose(e = null) {
            console.log("Socket closed");
        }
        onMessageReveived(message = null) {
            console.log("Message from server:");
            if (typeof (message) == 'string') {
                console.log(message);
            }
            else if (message instanceof ArrayBuffer) {
                console.log(new Laya.Byte(message).readUTFBytes());
            }
            this.socket.input.clear();
        }
        onConnectError(e = null) {
            console.log("error");
        }
    }

    class Debug_FPSStats {
        constructor() {
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Stat.show(Laya.Browser.clientWidth - 120 >> 1, Laya.Browser.clientHeight - 100 >> 1);
            });
        }
    }

    class PerformanceTest_Maggots {
        constructor(maincls) {
            this.texturePath = "res/tinyMaggot.png";
            this.padding = 100;
            this.maggotAmount = 5000;
            this.tick = 0;
            this.maggots = [];
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.width, Laya.Browser.height).then(() => {
                Laya.Laya.stage.bgColor = "#000000";
                Laya.Stat.show();
                this.wrapBounds = new Laya.Rectangle(-this.padding, -this.padding, Laya.Laya.stage.width + this.padding * 2, Laya.Laya.stage.height + this.padding * 2);
                Laya.Laya.loader.load(this.texturePath, Laya.Handler.create(this, this.onTextureLoaded));
            });
        }
        onTextureLoaded(e = null) {
            this.maggotTexture = Laya.Laya.loader.getRes(this.texturePath);
            this.initMaggots();
            Laya.Laya.timer.frameLoop(1, this, this.animate);
        }
        initMaggots() {
            var maggotContainer;
            for (var i = 0; i < this.maggotAmount; i++) {
                if (i % 16000 == 0)
                    maggotContainer = this.createNewContainer();
                var maggot = this.newMaggot();
                maggotContainer.addChild(maggot);
                this.maggots.push(maggot);
            }
        }
        createNewContainer() {
            var container = new Laya.Sprite();
            container.size(Laya.Browser.clientWidth, Laya.Browser.clientHeight);
            this.Main.box2D.addChild(container);
            return container;
        }
        newMaggot() {
            var maggot = new Maggot$1();
            maggot.graphics.drawTexture(this.maggotTexture, 0, 0);
            maggot.pivot(16.5, 35);
            var rndScale = 0.8 + Math.random() * 0.3;
            maggot.scale(rndScale, rndScale);
            maggot.rotation = 0.1;
            maggot.x = Math.random() * Laya.Laya.stage.width;
            maggot.y = Math.random() * Laya.Laya.stage.height;
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
        }
        dispose() {
            Laya.Laya.timer.clear(this, this.animate);
        }
    }
    class Maggot$1 extends Laya.Sprite {
    }

    class PerformanceTest_Cartoon {
        constructor(maincls) {
            this.colAmount = 100;
            this.extraSpace = 50;
            this.moveSpeed = 2;
            this.rotateSpeed = 2;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.width, Laya.Browser.height).then(() => {
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Stat.show();
                Laya.Laya.loader.load("res/cartoonCharacters/cartoonCharactors.json", Laya.Handler.create(this, this.createCharacters), null, Laya.Loader.ATLAS);
            });
        }
        createCharacters(e = null) {
            this.characterGroup = [];
            for (var i = 0; i < this.colAmount; ++i) {
                var tx = (Laya.Laya.stage.width + this.extraSpace * 2) / this.colAmount * i - this.extraSpace;
                var tr = 360 / this.colAmount * i;
                var startY = (Laya.Laya.stage.height - 500) / 2;
                this.createCharacter("cartoonCharactors/1.png", 46, 50, tr).pos(tx, 50 + startY);
                this.createCharacter("cartoonCharactors/2.png", 34, 50, tr).pos(tx, 150 + startY);
                this.createCharacter("cartoonCharactors/3.png", 42, 50, tr).pos(tx, 250 + startY);
                this.createCharacter("cartoonCharactors/4.png", 48, 50, tr).pos(tx, 350 + startY);
                this.createCharacter("cartoonCharactors/5.png", 36, 50, tr).pos(tx, 450 + startY);
            }
            Laya.Laya.timer.frameLoop(1, this, this.animate);
        }
        createCharacter(skin, pivotX, pivotY, rotation) {
            var charactor = new Laya.Sprite();
            charactor.loadImage(skin);
            charactor.rotation = rotation;
            charactor.pivot(pivotX, pivotY);
            this.Main.box2D.addChild(charactor);
            this.characterGroup.push(charactor);
            return charactor;
        }
        animate() {
            for (var i = this.characterGroup.length - 1; i >= 0; --i) {
                this.animateCharactor(this.characterGroup[i]);
            }
        }
        animateCharactor(charactor) {
            charactor.x += this.moveSpeed;
            charactor.rotation += this.rotateSpeed;
            if (charactor.x > Laya.Laya.stage.width + this.extraSpace) {
                charactor.x = -this.extraSpace;
            }
        }
        dispose() {
            Laya.Laya.timer.clear(this, this.animate);
        }
    }

    class PerformanceTest_Cartoon2 {
        constructor(maincls) {
            this.amount = 500;
            this.character1 = ["res/cartoon2/yd-6_01.png",
                "res/cartoon2/yd-6_02.png",
                "res/cartoon2/yd-6_03.png",
                "res/cartoon2/yd-6_04.png",
                "res/cartoon2/yd-6_05.png",
                "res/cartoon2/yd-6_06.png",
                "res/cartoon2/yd-6_07.png",
                "res/cartoon2/yd-6_08.png"];
            this.character2 = ["res/cartoon2/yd-3_01.png",
                "res/cartoon2/yd-3_02.png",
                "res/cartoon2/yd-3_03.png",
                "res/cartoon2/yd-3_04.png",
                "res/cartoon2/yd-3_05.png",
                "res/cartoon2/yd-3_06.png",
                "res/cartoon2/yd-3_07.png",
                "res/cartoon2/yd-3_08.png"];
            this.character3 = ["res/cartoon2/yd-2_01.png",
                "res/cartoon2/yd-2_02.png",
                "res/cartoon2/yd-2_03.png",
                "res/cartoon2/yd-2_04.png",
                "res/cartoon2/yd-2_05.png",
                "res/cartoon2/yd-2_06.png",
                "res/cartoon2/yd-2_07.png",
                "res/cartoon2/yd-2_08.png"];
            this.character4 = ["res/cartoon2/wyd-1_01.png",
                "res/cartoon2/wyd-1_02.png",
                "res/cartoon2/wyd-1_03.png",
                "res/cartoon2/wyd-1_04.png",
                "res/cartoon2/wyd-1_05.png",
                "res/cartoon2/wyd-1_06.png",
                "res/cartoon2/wyd-1_07.png",
                "res/cartoon2/wyd-1_08.png"];
            this.characterSkins = [this.character1, this.character2, this.character3, this.character4];
            this.characters = [];
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(1280, 720).then(() => {
                this.image = new Laya.Image();
                this.image.skin = "res/cartoon2/background.jpg";
                this.Main.box2D.addChild(this.image);
                this.createCharacters();
                this.text = new Laya.Text();
                this.text.zOrder = 10000;
                this.text.fontSize = 60;
                this.text.color = "#ff0000";
                this.Main.box2D.addChild(this.text);
                Laya.Laya.timer.frameLoop(1, this, this.gameLoop);
            });
        }
        createCharacters() {
            var char;
            var charSkin;
            for (var i = 0; i < this.amount; i++) {
                charSkin = this.characterSkins[Math.floor(Math.random() * this.characterSkins.length)];
                char = new Character(charSkin);
                char.x = Math.random() * (Laya.Laya.stage.width + Character.WIDTH * 2);
                char.y = Math.random() * (Laya.Laya.stage.height - Character.HEIGHT);
                char.zOrder = char.y;
                char.setSpeed(Math.floor(Math.random() * 2 + 3));
                char.setName(i.toString());
                this.Main.box2D.addChild(char);
                this.characters.push(char);
            }
        }
        gameLoop() {
            for (var i = this.characters.length - 1; i >= 0; i--) {
                this.characters[i].update();
            }
            if (Laya.Laya.timer.currFrame % 60 === 0) {
                this.text.text = Laya.Stat.FPS.toString();
            }
        }
        dispose() {
            Laya.Laya.timer.clear(this, this.gameLoop);
            this.image.dispose();
            this.image = null;
        }
    }
    class Character extends Laya.Sprite {
        constructor(images) {
            super();
            this.speed = 5;
            this.createAnimation(images);
            this.createBloodBar();
            this.createNameLabel();
        }
        createAnimation(images) {
            this.animation = new Laya.Animation();
            this.animation.loadImages(images);
            this.animation.interval = 70;
            this.animation.play(0);
            this.addChild(this.animation);
        }
        createBloodBar() {
            this.bloodBar = new Laya.Sprite();
            this.bloodBar.loadImage("res/cartoon2/blood_1_r.png");
            this.bloodBar.x = 20;
            this.addChild(this.bloodBar);
        }
        createNameLabel() {
            this.nameLabel = new Laya.Text();
            this.nameLabel.color = "#FFFFFF";
            this.nameLabel.text = "Default";
            this.nameLabel.fontSize = 13;
            this.nameLabel.width = Character.WIDTH;
            this.nameLabel.align = "center";
            this.addChild(this.nameLabel);
        }
        setSpeed(value) {
            this.speed = value;
        }
        setName(value) {
            this.nameLabel.text = value;
        }
        update() {
            this.x += this.speed;
            if (this.x >= Laya.Laya.stage.width + Character.WIDTH)
                this.x = -Character.WIDTH;
        }
    }
    Character.WIDTH = 110;
    Character.HEIGHT = 110;

    class PerformanceTest_Skeleton {
        constructor(maincls) {
            this.fileName = "Dragon";
            this.rowCount = 10;
            this.colCount = 10;
            this.xOff = 50;
            this.yOff = 100;
            this.mAnimationArray = [];
            this.Main = null;
            this.mActionIndex = 0;
            this.Main = maincls;
            this.mSpacingX = Laya.Browser.width / this.colCount;
            this.mSpacingY = Laya.Browser.height / this.rowCount;
            Laya.Laya.init(Laya.Browser.width, Laya.Browser.height).then(() => {
                Laya.Stat.show();
                Laya.Laya.loader.load("res/skeleton/" + this.fileName + "/" + this.fileName + ".sk", { mainTexture: true }).then((templet) => {
                    for (var i = 0; i < this.rowCount; i++) {
                        for (var j = 0; j < this.colCount; j++) {
                            this.mArmature = templet.buildArmature(1);
                            this.mArmature.x = this.xOff + j * this.mSpacingX;
                            this.mArmature.y = this.yOff + i * this.mSpacingY;
                            this.mAnimationArray.push(this.mArmature);
                            this.mArmature.play(0, true);
                            this.Main.box2D.addChild(this.mArmature);
                        }
                    }
                    Laya.Laya.stage.on(Laya.Event.CLICK, this, this.toggleAction);
                });
            });
        }
        dispose() {
            Laya.Laya.stage.off(Laya.Event.CLICK, this, this.toggleAction);
        }
        toggleAction(e = null) {
            this.mActionIndex++;
            var tAnimNum = this.mArmature.getAnimNum();
            if (this.mActionIndex >= tAnimNum) {
                this.mActionIndex = 0;
            }
            for (var i = 0, n = this.mAnimationArray.length; i < n; i++) {
                this.mAnimationArray[i].play(this.mActionIndex, true);
            }
        }
    }

    class Skeleton_SpineAdapted {
        constructor(maincls) {
            this.index = -1;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.width, Laya.Browser.height).then(() => {
                Laya.Laya.stage.bgColor = "#cccccc";
                Laya.Stat.show();
                Laya.Laya.loader.load("res/spine/spineboy-pma.skel", Laya.Loader.SPINE).then((templet) => {
                    this.skeleton = new Laya.SpineSkeleton();
                    this.skeleton.templet = templet;
                    this.Main.box2D.addChild(this.skeleton);
                    this.skeleton.pos(Laya.Browser.width / 2, Laya.Browser.height / 2 + 100);
                    this.skeleton.scale(0.5, 0.5);
                    this.skeleton.on(Laya.Event.STOPPED, this, this.play);
                    this.play();
                });
            });
        }
        play() {
            if (++this.index >= this.skeleton.getAnimNum()) {
                this.index = 0;
            }
            this.skeleton.play(this.index, false, true);
        }
    }

    class IndexViewUI extends Laya.View {
        createChildren() {
            super.createChildren();
        }
    }
    IndexViewUI.uiView = { "type": "View", "props": { "y": 0, "x": 0, "width": 272, "height": 54 }, "child": [{ "type": "Box", "props": { "y": 21, "x": 0, "width": 272, "var": "box1", "height": 33 }, "child": [{ "type": "ComboBox", "props": { "y": 0, "x": 146, "width": 120, "var": "smallComBox", "skin": "comp/combobox.png", "sizeGrid": "3,21,15,6", "selectedIndex": 0, "labels": "label1,label2", "height": 30 } }, { "type": "ComboBox", "props": { "y": 0, "x": 0, "width": 120, "var": "bigComBox", "skin": "comp/combobox.png", "sizeGrid": "3,21,15,6", "selectedLabel": "label1", "selectedIndex": 0, "labels": "label1,label2", "labelSize": 16, "height": 30 } }] }] };

    class Sprite_ScreenShot {
        constructor(_m) {
            this.btnArr = ["res/threeDimen/ui/button.png", "res/threeDimen/ui/button.png"];
            this.nameArr = ["sprite截图", "清理"];
            this._clearColor = "#999999";
            this.main = _m;
            Laya.Config.preserveDrawingBuffer = true;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_AUTO;
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Laya.loader.load(this.btnArr.concat("res/apes/monkey3.png"), Laya.Handler.create(this, this.onLoaded));
            });
        }
        createButton(skin, name, cb, index) {
            var btn = new Laya.Button(skin, name);
            this.main.box2D.addChild(btn);
            btn.on(Laya.Event.CLICK, this, cb);
            btn.size(147, 55);
            btn.name = name;
            btn.x = 200;
            btn.y = index * (btn.height + 10);
            return btn;
        }
        onLoaded() {
            this.aimSp = new Laya.Sprite();
            this.aimSp.size(Laya.Browser.clientWidth / 2, Laya.Browser.clientHeight / 2);
            this.main.box2D.addChild(this.aimSp);
            this.aimSp.graphics.drawRect(0, 0, this.aimSp.width, this.aimSp.height, "#333333");
            this.monkeyTexture = Laya.Laya.loader.getRes("res/apes/monkey3.png");
            this.aimSp.graphics.drawTexture(this.monkeyTexture, 0, 0, this.monkeyTexture.width, this.monkeyTexture.height);
            this.drawImage = new Laya.Image();
            this.drawImage.size(Laya.Browser.clientWidth / 2, Laya.Browser.clientHeight / 2);
            this.main.box2D.addChild(this.drawImage);
            this.drawImage.bottom = this.drawImage.right = 0;
            this.drawSp = new Laya.Sprite();
            this.main.box2D.addChild(this.drawSp);
            this.drawSp.size(Laya.Browser.clientWidth / 2, Laya.Browser.clientHeight / 2);
            this.drawSp.y = Laya.Browser.clientHeight / 2;
            this.drawSp.graphics.drawRect(0, 0, this.drawSp.width, this.drawSp.height, this._clearColor);
            for (let index = 0; index < this.btnArr.length; index++) {
                this.createButton(this.btnArr[index], this.nameArr[index], this._onclick, index);
            }
        }
        _onclick(e) {
            switch (e.target.name) {
                case this.nameArr[0]:
                    var ddrt = new Laya.RenderTexture2D(Laya.Browser.clientWidth, Laya.Browser.clientHeight, Laya.RenderTargetFormat.R8G8B8A8, Laya.RenderTargetFormat.None);
                    Laya.Laya.stage.drawToRenderTexture2D(Laya.Browser.clientWidth, Laya.Browser.clientHeight, 0, 0, ddrt, true, true);
                    var text = new Laya.Texture(ddrt);
                    this.drawSp.graphics.drawTexture(text, 0, 0, this.drawSp.width, this.drawSp.height);
                    break;
                case this.nameArr[1]:
                    this.drawImage.skin = null;
                    this.drawSp.graphics.clear();
                    this.drawSp.graphics.drawRect(0, 0, this.drawSp.width, this.drawSp.height, this._clearColor);
                    break;
            }
        }
    }
    function endCapture() {
        throw new Error("Function not implemented.");
    }

    class Physics_CollisionFiltering {
        constructor(maincls) {
            this.Main = null;
            this.preMovementX = 0;
            this.preMovementY = 0;
            this.Main = maincls;
            Laya.Config.isAntialias = true;
            Laya.Laya.init(1200, 700).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_AUTO;
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Physics2D.I.start();
                this.createHouse();
                for (let i = 1; i <= 3; i++) {
                    this.createBox(300, 300, 20, 20, i);
                    this.createTriangle(500, 300, 20, i);
                    this.createCircle(700, 300, 10, i);
                }
            });
        }
        createHouse() {
            this._scene = new Laya.Scene();
            this.Main.box2D.addChild(this._scene);
            let man = this._scene.getComponentElementManager(Laya.Physics2DWorldManager.__managerName);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.Shape);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.Joint);
            let house = new Laya.Sprite();
            this._scene.addChild(house);
            let rigidbody = house.addComponent(Laya.RigidBody);
            rigidbody.type = "static";
            let chainCollider = house.addComponent(Laya.ChainCollider);
            chainCollider.loop = true;
            chainCollider.datas = [600, 50, 100, 200, 100, 600, 1100, 600, 1100, 200];
        }
        createBox(posx, posy, width, height, ratio) {
            let box = new Laya.Sprite();
            box.on(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
            this._scene.addChild(box);
            box.pos(posx, posy).size(width * ratio, height * ratio);
            let rigidbody = box.addComponent(Laya.RigidBody);
            rigidbody.category = Physics_CollisionFiltering.k_boxCategory;
            rigidbody.mask = Physics_CollisionFiltering.k_boxMask;
            let boxCollider = box.addComponent(Laya.BoxCollider);
            boxCollider.width = width * ratio;
            boxCollider.height = height * ratio;
            this.addGroup(rigidbody, ratio);
        }
        createTriangle(posx, posy, side, ratio) {
            let triangle = new Laya.Sprite();
            triangle.on(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
            this._scene.addChild(triangle);
            triangle.pos(posx, posy).size(side * ratio, side * ratio);
            let rigidbody = triangle.addComponent(Laya.RigidBody);
            rigidbody.category = Physics_CollisionFiltering.k_triangleCategory;
            rigidbody.mask = Physics_CollisionFiltering.k_triangleMask;
            let polygonCollider = triangle.addComponent(Laya.PolygonCollider);
            polygonCollider.datas = [0, 0, 0, side * ratio, side * ratio, 0];
            this.addGroup(rigidbody, ratio);
        }
        createCircle(posx, posy, radius, ratio) {
            let circle = new Laya.Sprite();
            circle.on(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
            this._scene.addChild(circle);
            circle.pos(posx, posy).size(radius * 2 * ratio, radius * 2 * ratio);
            circle.pivot(0.5, 0.5);
            let rigidbody = circle.addComponent(Laya.RigidBody);
            rigidbody.category = Physics_CollisionFiltering.k_circleCategory;
            rigidbody.mask = Physics_CollisionFiltering.k_circleMask;
            let circleCollider = circle.addComponent(Laya.CircleCollider);
            circleCollider.radius = radius * ratio;
            this.addGroup(rigidbody, ratio);
        }
        addGroup(rigidbody, ratio) {
            switch (ratio) {
                case 1:
                    rigidbody.group = Physics_CollisionFiltering.k_smallGroup;
                    break;
                case 2:
                    rigidbody.group = Physics_CollisionFiltering.k_middleGroup;
                    break;
                case 3:
                    rigidbody.group = Physics_CollisionFiltering.k_largeGroup;
                    break;
            }
        }
        mouseDown(e) {
            this.curTarget = e.target;
            let mouseJoint = this.curTarget.addComponent(Laya.MouseJoint);
            Laya.Laya.timer.callLater(mouseJoint, mouseJoint._onMouseDown);
            Laya.Laya.stage.on(Laya.Event.MOUSE_UP, this, this.destoryJoint);
            Laya.Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.destoryJoint);
        }
        mouseMove(e) {
            let movementX = e.nativeEvent.movementX;
            let movementY = e.nativeEvent.movementY;
            this.preMovementX = movementX;
            this.preMovementY = movementY;
            this.curTarget.pos(Laya.Laya.stage.mouseX, Laya.Laya.stage.mouseY);
        }
        mouseUp() {
            Laya.Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
            Laya.Laya.stage.off(Laya.Event.MOUSE_UP, this, this.mouseUp);
            Laya.Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.mouseUp);
            let rigidbody = this.curTarget.getComponent(Laya.RigidBody);
            rigidbody.type = "dynamic";
            rigidbody.linearVelocity = { x: this.preMovementX, y: this.preMovementY };
            this.curTarget = null;
        }
        destoryJoint() {
            Laya.Laya.stage.off(Laya.Event.MOUSE_UP, this, this.destoryJoint);
            Laya.Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.destoryJoint);
            let mouseJoint = this.curTarget.getComponent(Laya.MouseJoint);
            mouseJoint.destroy();
            this.curTarget = null;
        }
        dispose() {
            Laya.Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
            Laya.Laya.stage.off(Laya.Event.MOUSE_UP, this, this.mouseUp);
            Laya.Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.mouseUp);
            Laya.Laya.stage.off(Laya.Event.MOUSE_UP, this, this.destoryJoint);
            Laya.Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.destoryJoint);
        }
    }
    Physics_CollisionFiltering.k_smallGroup = 1;
    Physics_CollisionFiltering.k_middleGroup = 0;
    Physics_CollisionFiltering.k_largeGroup = -1;
    Physics_CollisionFiltering.k_triangleCategory = 0x2;
    Physics_CollisionFiltering.k_boxCategory = 0x4;
    Physics_CollisionFiltering.k_circleCategory = 0x8;
    Physics_CollisionFiltering.k_triangleMask = 0xF;
    Physics_CollisionFiltering.k_boxMask = 0xF ^ Physics_CollisionFiltering.k_circleCategory;
    Physics_CollisionFiltering.k_circleMask = Physics_CollisionFiltering.k_triangleCategory | Physics_CollisionFiltering.k_boxCategory | 0x01;

    const dampingRatio$1 = 0.5;
    const frequencyHz$1 = 10.0;
    class Physics_Strandbeests {
        constructor(maincls) {
            this.Main = null;
            this.scale = 2.5;
            this.pos = [550, 200];
            this.TempVec = new Laya.Vector2();
            this.drawFlags = ["Shape", "Joint", "AABB", "Pair", "CenterOfMass"];
            this.Main = maincls;
            Laya.Config.isAntialias = true;
            Laya.Laya.init(1200, 700).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_AUTO;
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Physics2D.I.start();
                this.Construct();
                Laya.Laya.loader.load(["res/ui/checkbox (1).png"], Laya.Handler.create(this, this.eventListener));
            });
        }
        Construct() {
            this._scene = new Laya.Scene();
            this.Main.box2D.addChild(this._scene);
            let man = this._scene.getComponentElementManager(Laya.Physics2DWorldManager.__managerName);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.Shape);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.Joint);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.CenterOfMass);
            let ground = new Laya.Sprite();
            ground.name = "ground";
            this._scene.addChild(ground);
            let rigidbody = new Laya.RigidBody();
            rigidbody.type = "static";
            ground.addComponentInstance(rigidbody);
            let chainCollider = new Laya.ChainCollider();
            chainCollider.datas = [50, 200, 50, 570, 1050, 570, 1050, 200];
            ground.addComponentInstance(chainCollider);
            for (let i = 1; i <= 32; i++) {
                let small = new Laya.Sprite();
                small.name = "ground" + i;
                small.pos(i * 30 + 50, 570 - 5 * this.scale);
                let rig = small.addComponent(Laya.RigidBody);
                this._scene.addChild(small);
                let sCollider = small.addComponent(Laya.CircleCollider);
                sCollider.radius = 2.5 * this.scale;
            }
            let chassis = this.chassis = new Laya.Sprite();
            chassis.size(50 * this.scale, 20 * this.scale);
            chassis.anchorX = chassis.anchorY = 0.5;
            chassis.pos(this.pos[0], this.pos[1]);
            this._scene.addChild(chassis);
            let chassisBody = chassis.addComponent(Laya.RigidBody);
            chassisBody.group = -1;
            let chassisCollider = chassis.addComponent(Laya.BoxCollider);
            chassisCollider.density = 1;
            chassisCollider.width = 50 * this.scale;
            chassisCollider.height = 20 * this.scale;
            let wheel = this.wheel = new Laya.Sprite();
            wheel.pos(chassis.x, chassis.y);
            this._scene.addChild(wheel);
            let wheelBody = wheel.addComponent(Laya.RigidBody);
            wheelBody.group = -1;
            let wheelCollider = wheel.addComponent(Laya.CircleCollider);
            wheelCollider.density = 1;
            wheelCollider.radius = 16 * this.scale;
            let motorJoint = this.motorJoint = new Laya.RevoluteJoint();
            motorJoint.otherBody = chassisBody;
            motorJoint.collideConnected = false;
            motorJoint.motorSpeed = 2.0;
            motorJoint.maxMotorTorque = 400.0;
            motorJoint.enableMotor = true;
            wheel.addComponentInstance(motorJoint);
            let wheelAnchor = [0, 8 * this.scale];
            this.createLeg(-1, wheelAnchor, 0);
            this.createLeg(1, wheelAnchor, 0);
            this.createLeg(-1.0, wheelAnchor, Laya.Utils.toRadian(120.0));
            this.createLeg(1.0, wheelAnchor, Laya.Utils.toRadian(120.0));
            this.createLeg(-1.0, wheelAnchor, Laya.Utils.toRadian(-120.0));
            this.createLeg(1.0, wheelAnchor, Laya.Utils.toRadian(-120.0));
        }
        getDistance(body, p, body1, p1) {
            let g1 = body.getWorldPoint(p[0], p[1]);
            let x = g1.x;
            let y = g1.y;
            g1 = body1.getWorldPoint(p1[0], p1[1]);
            return Math.sqrt(Math.pow(g1.x - x, 2) + Math.pow(g1.y - y, 2));
        }
        getRotateVector(rotate, p) {
            let cos = Math.cos(rotate);
            let sin = Math.sin(rotate);
            let x = cos * p[0] - sin * p[1];
            let y = sin * p[0] + cos * p[1];
            return [x, y];
        }
        createDistanceJoint(selfBody, selfAnchor, otherBody, otherAnchor, distance) {
            let distanceJoint = new Laya.DistanceJoint();
            distanceJoint.otherBody = otherBody;
            distanceJoint.otherAnchor = otherAnchor;
            distanceJoint.selfAnchor = selfAnchor;
            distanceJoint.frequency = frequencyHz$1;
            distanceJoint.damping = dampingRatio$1;
            distanceJoint.maxLength = distanceJoint.minLength = distanceJoint.length = distance;
            selfBody.owner.addComponentInstance(distanceJoint);
            return distanceJoint;
        }
        createLeg(s, wheelAnchor, rotate) {
            const wheelBody = this.wheel.getComponent(Laya.RigidBody);
            const chassisBody = this.chassis.getComponent(Laya.RigidBody);
            const p1 = [54, -61];
            const p2 = [72, -12];
            const p3 = [43, -19];
            const p4 = [31, 0];
            const p5 = [60, 15];
            const p6 = [25, 37];
            let leg1 = new Laya.Sprite();
            leg1.pos(this.chassis.x, this.chassis.y + 16 * this.scale);
            leg1.scale(s * this.scale, -this.scale);
            this._scene.addChild(leg1);
            let leg2 = new Laya.Sprite();
            leg2.scale(s * this.scale, -this.scale);
            leg2.pos(this.chassis.x, this.chassis.y);
            this._scene.addChild(leg2);
            let legBody1 = leg1.addComponent(Laya.RigidBody);
            legBody1.angularDamping = 10;
            legBody1.group = -1;
            let legCollider1 = leg1.addComponent(Laya.PolygonCollider);
            legCollider1.density = 1;
            let legBody2 = leg2.addComponent(Laya.RigidBody);
            legBody2.angularDamping = 10;
            legBody2.group = -1;
            let legCollider2 = leg2.addComponent(Laya.PolygonCollider);
            legCollider2.density = 1;
            legCollider1.datas = p1.concat(p2).concat(p3);
            legCollider2.datas = p4.concat(p5).concat(p6);
            let distance = this.getDistance(legBody1, p2, legBody2, p5);
            this.createDistanceJoint(legBody1, p2, legBody2, p5, distance);
            distance = this.getDistance(legBody1, p3, legBody2, p4);
            this.createDistanceJoint(legBody1, p3, legBody2, p4, distance);
            let anchor = this.getRotateVector(rotate, wheelAnchor);
            distance = this.getDistance(legBody1, p3, wheelBody, wheelAnchor);
            this.createDistanceJoint(legBody1, p3, wheelBody, anchor, distance);
            distance = this.getDistance(legBody2, p6, wheelBody, wheelAnchor);
            this.createDistanceJoint(legBody2, p6, wheelBody, anchor, distance);
            let revoluteJoint = new Laya.RevoluteJoint();
            revoluteJoint.otherBody = chassisBody;
            revoluteJoint.anchor = p4;
            revoluteJoint.collideConnected = false;
            leg2.addComponentInstance(revoluteJoint);
        }
        eventListener() {
            Laya.Laya.stage.on(Laya.Event.DOUBLE_CLICK, this, () => {
                this.motorJoint.motorSpeed = -this.motorJoint.motorSpeed;
            });
            let index = 0;
            Laya.Laya.stage.on(Laya.Event.CLICK, this, () => {
                let tempVec = this.TempVec;
                let newBall = new Laya.Sprite();
                newBall.pos(Laya.Laya.stage.mouseX, Laya.Laya.stage.mouseY);
                this._scene.addChild(newBall);
                newBall.name = "bullet" + index;
                index++;
                let circleBody = newBall.addComponent(Laya.RigidBody);
                let circleCollider = newBall.addComponent(Laya.CircleCollider);
                circleCollider.radius = 3 * this.scale;
                tempVec.x = this.chassis.x - newBall.x;
                tempVec.y = this.chassis.y - newBall.y;
                Laya.Vector2.normalize(tempVec, tempVec);
                Laya.Vector2.scale(tempVec, 50, tempVec);
                Laya.Vector2.scale(tempVec, Laya.Physics2DOption.pixelRatio, tempVec);
                circleBody.linearVelocity = tempVec;
                Laya.Laya.timer.frameOnce(120, this, function () {
                    newBall.destroy();
                });
            });
            let label = this.label = Laya.Laya.stage.addChild(new Laya.Label("双击屏幕，仿生机器人向相反方向运动\n单击产生新的小球刚体"));
            label.top = 20;
            label.right = 20;
            label.fontSize = 16;
            label.color = "#e69999";
            for (var i = 0, n = this.drawFlags.length; i < n; i++) {
                this.createCheckBox(this.drawFlags[i], i <= 1, 1300, 70 + 50 * i);
            }
        }
        createCheckBox(lable, isselect, x, y) {
            var cb = new Laya.CheckBox("res/ui/checkbox (1).png");
            this._scene.addChild(cb);
            cb.labelColors = "white";
            cb.labelSize = 20;
            cb.labelFont = "Microsoft YaHei";
            cb.labelPadding = "3,0,0,5";
            cb.x = x;
            cb.y = y;
            cb.label = lable;
            cb.selected = isselect;
            cb.on("change", this, this.updateSelect, [cb]);
        }
        updateSelect(checkBox) {
            let isselect = checkBox.selected;
            let man = this._scene.getComponentElementManager(Laya.Physics2DWorldManager.__managerName);
            switch (checkBox.label) {
                case "Shape":
                    man.enableDebugDraw(true, Laya.EPhycis2DBlit.Shape);
                    break;
                case "Joint":
                    man.enableDebugDraw(true, Laya.EPhycis2DBlit.Joint);
                    break;
                case "AABB":
                    man.enableDebugDraw(true, Laya.EPhycis2DBlit.AABB);
                    break;
                case "Pair":
                    man.enableDebugDraw(true, Laya.EPhycis2DBlit.Pair);
                    break;
                case "CenterOfMass":
                    man.enableDebugDraw(true, Laya.EPhycis2DBlit.CenterOfMass);
                    break;
            }
        }
        dispose() {
            Laya.Laya.stage.offAll(Laya.Event.CLICK);
            Laya.Laya.stage.offAll(Laya.Event.DOUBLE_CLICK);
            Laya.Laya.stage.removeChild(this.label);
        }
    }

    class Physics_Bridge {
        constructor(maincls) {
            this.Main = null;
            this.ecount = 30;
            this.TempVec = new Laya.Vector2();
            this.Main = maincls;
            Laya.Config.isAntialias = true;
            Laya.Laya.init(1200, 700).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_AUTO;
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Physics2D.I.start();
                this.createBridge();
                this.eventListener();
            });
        }
        createBridge() {
            this._scene = new Laya.Scene();
            this.Main.box2D.addChild(this._scene);
            let man = this._scene.getComponentElementManager(Laya.Physics2DWorldManager.__managerName);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.Shape);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.Joint);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.CenterOfMass);
            const startPosX = 250, startPosY = 450;
            let ground = new Laya.Sprite();
            let groundBody = new Laya.RigidBody();
            groundBody.type = "static";
            ground.addComponentInstance(groundBody);
            let chainCollider = ground.addComponent(Laya.ChainCollider);
            chainCollider.datas = [50, 600, 1050, 600];
            this._scene.addChild(ground);
            let point1 = new Laya.Sprite();
            this._scene.addChild(point1);
            point1.pos(startPosX, startPosY);
            let pointRB1 = new Laya.RigidBody();
            pointRB1.type = "static";
            point1.addComponentInstance(pointRB1);
            let preBody = pointRB1;
            let width = 20, height = 2.5;
            for (let i = 0; i < this.ecount; i++) {
                let sp = new Laya.Sprite();
                this._scene.addChild(sp);
                sp.pos(startPosX + i * width, startPosY);
                let rb = sp.addComponent(Laya.RigidBody);
                let bc = sp.addComponent(Laya.BoxCollider);
                bc.width = width;
                bc.height = height;
                bc.density = 20;
                bc.friction = 0.2;
                bc.y = -height / 2;
                let rj = new Laya.RevoluteJoint();
                rj.otherBody = preBody;
                sp.addComponentInstance(rj);
                preBody = rb;
            }
            let point2 = new Laya.Sprite();
            this._scene.addChild(point2);
            point2.pos(startPosX + this.ecount * width, startPosY);
            let pointRB2 = new Laya.RigidBody();
            pointRB2.type = "static";
            point2.addComponentInstance(pointRB2);
            let rj = new Laya.RevoluteJoint();
            rj.otherBody = preBody;
            point2.addComponentInstance(rj);
            for (let i = 0; i < 2; i++) {
                let sp = new Laya.Sprite();
                this._scene.addChild(sp);
                sp.pos(350 + 100 * i, 300);
                let rb = sp.addComponent(Laya.RigidBody);
                rb.bullet = true;
                let pc = sp.addComponent(Laya.PolygonCollider);
                pc.points = "-10,0,10,0,0,30";
                pc.density = 1.0;
            }
            for (let i = 0; i < 2; i++) {
                let sp = new Laya.Sprite();
                this._scene.addChild(sp);
                sp.pos(400 + 150 * i, 350);
                let rb = sp.addComponent(Laya.RigidBody);
                rb.bullet = true;
                let pc = sp.addComponent(Laya.CircleCollider);
                pc.radius = 10;
            }
        }
        eventListener() {
            Laya.Laya.stage.on(Laya.Event.CLICK, this, () => {
                let tempVec = this.TempVec;
                let targetX = 300 + Math.random() * 400, targetY = 500;
                let newBall = new Laya.Sprite();
                this._scene.addChild(newBall);
                let circleBody = newBall.addComponent(Laya.RigidBody);
                circleBody.bullet = true;
                circleBody.type = "dynamic";
                let circleCollider = newBall.addComponent(Laya.CircleCollider);
                circleCollider.radius = 5;
                circleCollider.x = Laya.Laya.stage.mouseX;
                circleCollider.y = Laya.Laya.stage.mouseY;
                tempVec.x = targetX - circleCollider.x;
                tempVec.y = targetY - circleCollider.y;
                Laya.Vector2.normalize(tempVec, tempVec);
                Laya.Vector2.scale(tempVec, 25, tempVec);
                Laya.Vector2.scale(tempVec, Laya.Physics2DOption.pixelRatio, tempVec);
                circleBody.linearVelocity = tempVec;
                Laya.Laya.timer.frameOnce(120, this, function () {
                    newBall.destroy();
                });
            });
            let label = this.label = Laya.Laya.stage.addChild(new Laya.Label("单击屏幕产生新的小球刚体，击向bridge的随机位置"));
            label.top = 20;
            label.right = 20;
            label.fontSize = 16;
            label.color = "#e69999";
        }
        dispose() {
            Laya.Laya.stage.offAll(Laya.Event.CLICK);
            Laya.Laya.stage.removeChild(this.label);
        }
    }

    class Physics_CollisionEvent {
        constructor(maincls) {
            this.Main = null;
            this.count = 7;
            this.bodys = [];
            this.touching = [];
            this.Main = maincls;
            Laya.Config.isAntialias = true;
            Laya.Laya.init(1200, 700).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_AUTO;
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Physics2D.I.start();
                this.createSensor();
            });
        }
        createSensor() {
            this._scene = new Laya.Scene();
            this.Main.box2D.addChild(this._scene);
            let man = this._scene.getComponentElementManager(Laya.Physics2DWorldManager.__managerName);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.Shape);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.Joint);
            let ground = new Laya.Sprite();
            this._scene.addChild(ground);
            let groundBody = new Laya.RigidBody();
            groundBody.type = "static";
            ground.addComponentInstance(groundBody);
            let chainCollider = ground.addComponent(Laya.ChainCollider);
            chainCollider.datas = [50, 400, 50, 600, 1050, 600, 1050, 400];
            let sensorCollider = this.sensorCollider = ground.addComponent(Laya.CircleCollider);
            sensorCollider.isSensor = true;
            sensorCollider.radius = 100;
            sensorCollider.x = 450;
            sensorCollider.y = 300;
            for (let i = 0, len = this.count; i < len; i++) {
                let sp = new Laya.Sprite();
                this._scene.addChild(sp);
                sp.pos(350 + i * 50, 200).size(40, 40);
                let rb = sp.addComponent(Laya.RigidBody);
                this.bodys.push(rb);
                this.touching[i] = false;
                rb.getBody().GetUserData().pointer = i;
                let circleCollider = sp.addComponent(Laya.CircleCollider);
                circleCollider.radius = 20;
                circleCollider.x = circleCollider.y = 20;
                sp.addComponent(Laya.MouseJoint);
            }
            ground.on(Laya.Event.TRIGGER_ENTER, this, this.onTriggerEnter);
            ground.on(Laya.Event.TRIGGER_EXIT, this, this.onTriggerExit);
            Laya.Laya.physicsTimer.frameLoop(1, this, this.onTriggerStay);
        }
        onTriggerEnter(colliderB, colliderA, contact) {
            if (colliderA === this.sensorCollider) {
                console.log("onTriggerEnter");
                let bodyB = colliderB.owner.getComponent(Laya.RigidBody);
                let index = bodyB.getBody().GetUserData().pointer;
                this.touching[index] = true;
            }
        }
        onTriggerStay() {
            console.log("onTriggerStay");
            let bodys = this.bodys, body;
            for (let i = 0, len = this.count; i < len; i++) {
                body = bodys[i];
                if (!this.touching[i]) {
                    continue;
                }
                let bodyA = this.sensorCollider.owner.getComponent(Laya.RigidBody);
                let bodyB = body.owner.getComponent(Laya.RigidBody);
                let position = bodyB.getWorldCenter();
                let center = bodyA.getWorldPoint(this.sensorCollider.x, this.sensorCollider.y);
                let x = center.x - position.x;
                let y = center.y - position.y;
                let vec = new Laya.Vector2(x, y);
                if (Laya.Vector2.scalarLength(vec) < 1E-5) {
                    continue;
                }
                Laya.Vector2.normalize(vec, vec);
                bodyB.applyForce(position, {
                    x: vec.x * 100,
                    y: vec.y * 100
                });
            }
        }
        onTriggerExit(colliderB, colliderA, contact) {
            console.log("onTriggerExit");
            if (colliderA === this.sensorCollider) {
                let bodyB = colliderB.owner.getComponent(Laya.RigidBody);
                let index = bodyB.getBody().GetUserData().pointer;
                this.touching[index] = false;
            }
        }
        dispose() {
            let ground = this.sensorCollider.owner;
            ground.off(Laya.Event.TRIGGER_ENTER, this, this.onTriggerEnter);
            ground.off(Laya.Event.TRIGGER_EXIT, this, this.onTriggerExit);
            Laya.Laya.physicsTimer.clearAll(this);
        }
    }

    class Client {
        constructor() {
        }
        static get instance() {
            if (!Client._instance) {
                Client._instance = new Client();
                Client._instance.initEvent();
            }
            return Client._instance;
        }
        static init() {
        }
        initEvent() {
            var host = "10.10.20.80";
            var post = 10000;
            var websocketurl = "ws://" + host + ":" + post + "/";
            this.socket = new Laya.Socket();
            this.socket.on("open", this, this.onScoektOpen);
            this.socket.on("message", this, this.onSocketMssage);
            this.socket.on("close", this, this.onSocketClose);
            this.socket.on("error", this, this.onSocketClose);
            this.socket.connectByUrl(websocketurl);
        }
        send(data) {
            var isMaster = parseInt(Laya.Browser.getQueryString("isMaster")) || 0;
            if (!isMaster)
                return;
            if (this.socket) {
                data.isMaster = isMaster;
                this.socket.send(JSON.stringify(data));
            }
        }
        onScoektOpen() {
            console.log("websocket open");
        }
        onSocketMssage(data) {
            console.log("接收信息 data：" + data);
            var data = JSON.parse(data);
            Laya.Laya.stage.event(data.type, [data]);
        }
        onSocketClose() {
            console.log("websocket close");
        }
    }
    Client._instance = null;

    class UI_FontClip {
        constructor(maincls) {
            this.TestClipNum = "res/comp/fontClip_num.png";
            this._ClipNum = "res/comp/fontClip_num.png";
            this._ClipNum1 = "res/comp/fontClip_num.png";
            this.TestFontClip = "res/comp/fontClip.png";
            this._FontClip = "res/comp/fontClip.png";
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(800, 600).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Laya.loader.load([this.TestClipNum, this.TestFontClip, this._ClipNum, this._FontClip, this._ClipNum1], Laya.Handler.create(this, this.ShowContent));
            });
        }
        ShowContent() {
            var clipnum = new Laya.FontClip(this._ClipNum);
            var fontClip = new Laya.FontClip(this._FontClip);
            var testFontClip = new Laya.FontClip(this.TestFontClip);
            var testClipNum = new Laya.FontClip(this.TestClipNum);
            var clipnum1 = new Laya.FontClip(this._ClipNum1);
            clipnum.pos(240, 500);
            clipnum.size(250, 50);
            clipnum.sheet = "0123456789";
            clipnum.value = "114499";
            clipnum.spaceY = 10;
            testClipNum.pos(200, 400);
            testClipNum.sheet = "0123456789";
            testClipNum.value = "0123456789";
            clipnum1.pos(150, 200);
            clipnum1.direction = "vertical";
            clipnum1.sheet = "0123456789";
            clipnum1.value = "223388";
            fontClip.pos(240, 300);
            fontClip.sheet = "鼠牛虎兔龙蛇马羊 猴鸡狗猪年快乐";
            fontClip.value = "猪年快乐";
            fontClip.spaceY = 10;
            testFontClip.pos(200, 200);
            testFontClip.sheet = "鼠牛虎兔龙蛇马羊猴鸡狗猪年快乐";
            testFontClip.value = "鼠牛虎兔龙蛇马羊猴鸡狗猪年快乐";
            testFontClip.spaceY = 10;
            this.Main.box2D.addChild(clipnum);
            this.Main.box2D.addChild(fontClip);
            this.Main.box2D.addChild(testFontClip);
            this.Main.box2D.addChild(testClipNum);
            this.Main.box2D.addChild(clipnum1);
        }
    }

    class Physics_Tumbler {
        constructor(maincls) {
            this.count = 0;
            this.totalBox = 200;
            this.Main = null;
            this.Main = maincls;
            Laya.Config.isAntialias = true;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_AUTO;
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Physics2D.I.start();
                this.createBox();
                this.eventListener();
            });
        }
        createBox() {
            this._scene = new Laya.Scene();
            this.Main.box2D.addChild(this._scene);
            let man = this._scene.getComponentElementManager(Laya.Physics2DWorldManager.__managerName);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.Shape);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.Joint);
            const width = 300, height = 20;
            const posx = Laya.Laya.stage.width / 2, posy = Laya.Laya.stage.height / 2;
            let off = -width / 2 - height;
            let box = new Laya.Sprite();
            box.size(width + height * 2, width + height * 2);
            box.pos(posx, posy);
            this._scene.addChild(box);
            let boxBody = box.addComponent(Laya.RigidBody);
            let box1Shape = box.addComponent(Laya.BoxCollider);
            let box2Shape = box.addComponent(Laya.BoxCollider);
            let box3Shape = box.addComponent(Laya.BoxCollider);
            let box4Shape = box.addComponent(Laya.BoxCollider);
            box1Shape.width = width + height * 2;
            box1Shape.height = height;
            box1Shape.x = off;
            box1Shape.y = off;
            box2Shape.width = width + height * 2;
            box2Shape.height = height;
            box2Shape.x = off;
            box2Shape.y = width + height + off;
            box3Shape.width = height;
            box3Shape.height = width + height * 2;
            box3Shape.x = off;
            box3Shape.y = off;
            box4Shape.width = height;
            box4Shape.height = width + height * 2;
            box4Shape.x = width + height + off;
            box4Shape.y = off;
            let revoluteJoint = new Laya.RevoluteJoint();
            revoluteJoint.motorSpeed = 0.05 * Math.PI;
            revoluteJoint.maxMotorTorque = 1e8;
            revoluteJoint.enableMotor = true;
            box.addComponentInstance(revoluteJoint);
        }
        addMiniBox() {
            if (this.count >= this.totalBox) {
                return;
            }
            let sp = new Laya.Sprite();
            this._scene.addChild(sp);
            sp.x = Laya.Laya.stage.width / 2;
            sp.y = Laya.Laya.stage.height / 2;
            let boxBody = sp.addComponent(Laya.RigidBody);
            boxBody.type = "dynamic";
            let collider = sp.addComponent(Laya.BoxCollider);
            collider.width = 5;
            collider.height = 5;
            this.count++;
        }
        eventListener() {
            let label = this.label = Laya.Laya.stage.addChild(new Laya.Label("双击屏幕，将会产生100个新的小刚体"));
            label.top = 20;
            label.right = 20;
            label.fontSize = 16;
            label.color = "#e69999";
            Laya.Laya.stage.on(Laya.Event.DOUBLE_CLICK, this, () => {
                this.totalBox += 100;
            });
            Laya.Laya.timer.frameLoop(1, this, this.addMiniBox);
        }
        dispose() {
            Laya.Laya.stage.offAll(Laya.Event.DOUBLE_CLICK);
            Laya.Laya.stage.removeChild(this.label);
        }
    }

    class DOM_Form {
        constructor(maincls) {
            this.rowHeight = 30;
            this.rowSpacing = 10;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(600, 400).then(() => {
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_HORIZONTAL;
                this.form = new Laya.Sprite();
                this.form.size(250, 120);
                this.form.pos((Laya.Laya.stage.width - this.form.width) / 2, (Laya.Laya.stage.height - this.form.height) / 2);
                this.Main.box2D.addChild(this.form);
                var rowHeightDelta = this.rowSpacing + this.rowHeight;
                this.showLabel("邮箱", 0, rowHeightDelta * 0);
                this.showLabel("出生日期", 0, rowHeightDelta * 1);
                this.showLabel("密码", 0, rowHeightDelta * 2);
                this.emailInput = this.createInputElement();
                this.birthdayInput = this.createInputElement();
                this.passwordInput = this.createInputElement();
                this.birthdayInput.type = "date";
                this.passwordInput.type = "password";
                Laya.Laya.stage.on(Laya.Event.RESIZE, this, this.fitDOMElements, [this.emailInput, this.birthdayInput, this.passwordInput]);
            });
        }
        showLabel(label, x, y) {
            var t = new Laya.Text();
            t.height = this.rowHeight;
            t.valign = "middle";
            t.fontSize = 15;
            t.font = "SimHei";
            t.text = label;
            t.pos(x, y);
            this.form.addChild(t);
        }
        createInputElement() {
            var input = Laya.Browser.createElement("input");
            input.style.zIndex = Laya.Render.canvas.zIndex + 1;
            input.style.width = "100px";
            Laya.Browser.document.body.appendChild(input);
            return input;
        }
        fitDOMElements() {
            var dom;
            for (var i = 0; i < arguments.length; i++) {
                dom = arguments[i];
                Laya.SpriteUtils.fitDOMElementInArea(dom, this.form, 100, i * (this.rowSpacing + this.rowHeight), 150, this.rowHeight);
            }
        }
        dispose() {
            Laya.Browser.document.body.removeChild(this.emailInput);
            Laya.Browser.document.body.removeChild(this.birthdayInput);
            Laya.Browser.document.body.removeChild(this.passwordInput);
            this.emailInput = null;
            this.birthdayInput = null;
            this.passwordInput = null;
        }
    }

    class DOM_Video {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(800, 600).then(() => {
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                this.videoElement = Laya.Browser.createElement("video");
                Laya.Browser.document.body.appendChild(this.videoElement);
                this.videoElement.style.zInddex = Laya.Render.canvas.style.zIndex + 1;
                this.videoElement.src = "sample-resource/res/av/mov_bbb.mp4";
                this.videoElement.controls = true;
                this.videoElement.setAttribute("webkit-playsinline", true);
                this.videoElement.setAttribute("playsinline", true);
                var reference = new Laya.Sprite();
                this.Main.box2D.addChild(reference);
                reference.pos(100, 100);
                reference.size(600, 400);
                reference.graphics.drawRect(0, 0, reference.width, reference.height, "#CCCCCC");
                Laya.Laya.stage.on(Laya.Event.RESIZE, this, Laya.SpriteUtils.fitDOMElementInArea, [this.videoElement, reference, 0, 0, reference.width, reference.height]);
                Laya.SpriteUtils.fitDOMElementInArea(this.videoElement, reference, 0, 0, reference.width, reference.height);
            });
        }
        dispose() {
            Laya.Browser.document.body.removeChild(this.videoElement);
            this.videoElement = null;
        }
    }

    class HitTest_Point {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(800, 600).then(() => {
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                var size = 200;
                var color = "orange";
                this.rect = new Laya.Sprite();
                this.rect.graphics.drawRect(0, 0, size, size, color);
                this.rect.size(size, size);
                this.rect.x = (Laya.Laya.stage.width - this.rect.width) / 2;
                this.rect.y = (Laya.Laya.stage.height - this.rect.height) / 2;
                this.Main.box2D.addChild(this.rect);
                Laya.Laya.timer.frameLoop(1, this, this.loop);
            });
        }
        loop() {
            var hit = this.rect.hitTestPoint(Laya.Laya.stage.mouseX, Laya.Laya.stage.mouseY);
            this.rect.alpha = hit ? 0.5 : 1;
        }
        dispose() {
            Laya.Laya.timer.clear(this, this.loop);
        }
    }

    class HitTest_Rectangular {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(800, 600).then(() => {
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.rect1 = this.createRect(100, "orange");
                this.rect2 = this.createRect(200, "purple");
                Laya.Laya.timer.frameLoop(1, this, this.loop);
            });
        }
        createRect(size, color) {
            var rect = new Laya.Sprite();
            rect.graphics.drawRect(0, 0, size, size, color);
            rect.size(size, size);
            this.Main.box2D.addChild(rect);
            rect.on(Laya.Event.MOUSE_DOWN, this, this.startDrag, [rect]);
            rect.on(Laya.Event.MOUSE_UP, this, this.stopDrag, [rect]);
            return rect;
        }
        startDrag(target) {
            target.startDrag();
        }
        stopDrag(target) {
            target.stopDrag();
        }
        loop() {
            var bounds1 = this.rect1.getBounds();
            var bounds2 = this.rect2.getBounds();
            var hit = bounds1.intersects(bounds2);
            this.rect1.alpha = this.rect2.alpha = hit ? 0.5 : 1;
        }
        dispose() {
            Laya.Laya.timer.clear(this, this.loop);
        }
    }

    class Loader_ClearTextureRes {
        constructor() {
            this.isDestroyed = false;
            this.PathBg = "res/bg2.png";
            this.PathFly = "res/fighter/fighter.atlas";
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.init();
                Laya.Stat.show();
            });
        }
        init() {
            this.spBg = Laya.Sprite.fromImage(this.PathBg);
            Laya.Laya.stage.addChild(this.spBg);
            this.aniFly = new Laya.Animation();
            this.aniFly.loadAtlas(this.PathFly);
            this.aniFly.play();
            this.aniFly.pos(250, 100);
            Laya.Laya.stage.addChild(this.aniFly);
            this.btn = new Laya.Sprite().size(205, 55);
            this.btn.graphics.drawRect(0, 0, this.btn.width, this.btn.height, "#057AFB");
            this.txt = new Laya.Text();
            this.txt.text = "销毁";
            this.txt.pos(75, 15);
            this.txt.fontSize = 25;
            this.txt.color = "#FF0000";
            this.btn.addChild(this.txt);
            this.btn.pos(20, 160);
            this.btn.mouseEnabled = true;
            this.btn.name = "btnBg";
            Laya.Laya.stage.addChild(this.btn);
            this.btn.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        }
        onMouseUp(evt) {
            if (this.isDestroyed) {
                this.spBg.visible = true;
                this.aniFly.visible = true;
                this.isDestroyed = false;
                this.txt.text = "销毁";
            }
            else {
                this.spBg.visible = false;
                this.aniFly.visible = false;
                Laya.Laya.loader.clearTextureRes(this.PathBg);
                Laya.Laya.loader.clearTextureRes(this.PathFly);
                this.isDestroyed = true;
                this.txt.text = "恢复";
            }
        }
        dispose() {
            this.btn.destroy();
            this.aniFly && this.aniFly.destroy();
            this.spBg && this.spBg.destroy();
        }
    }

    class Loader_MultipleType {
        constructor() {
            this.ROBOT_DATA_PATH = "res/skeleton/robot/robot.bin";
            this.ROBOT_TEXTURE_PATH = "res/skeleton/robot/texture.png";
            Laya.Laya.init(100, 100).then(() => {
                var assets = [];
                assets.push({ "url": this.ROBOT_DATA_PATH, "type": Laya.Loader.BUFFER });
                assets.push({ "url": this.ROBOT_TEXTURE_PATH, "type": Laya.Loader.IMAGE });
                Laya.Laya.loader.load(assets, Laya.Handler.create(this, this.onAssetsLoaded));
            });
        }
        onAssetsLoaded(e = null) {
            var robotData = Laya.Loader.getRes(this.ROBOT_DATA_PATH);
            var robotTexture = Laya.Loader.getRes(this.ROBOT_TEXTURE_PATH);
        }
    }

    class Loader_ProgressAndErrorHandle {
        constructor() {
            Laya.Laya.init(550, 400).then(() => {
                Laya.Loader.warnFailed = this.loaderError;
                Laya.Laya.loader.retryNum = 0;
                var urls = ["do not exist", "res/fighter/fighter.png", "res/legend/map.jpg"];
                Laya.Laya.loader.load(urls, Laya.Handler.create(this, this.onAssetLoaded), Laya.Handler.create(this, this.onLoading, null, false));
            });
        }
        loaderError(url, err, initiatorUrl) {
            console.error("[自定义接管 Loader Failed] ==>");
            console.error("资源加载失败地址：", url);
            console.error("资源加载失败代码：", err);
            console.error("资源加载失败替代url：", initiatorUrl);
            console.error("[自定义接管 Loader Failed] ===");
        }
        onAssetLoaded(texture) {
            console.log("加载结束");
        }
        onLoading(progress) {
            console.log("加载进度: " + progress);
        }
    }

    class Loader_Sequence {
        constructor() {
            this.numLoaded = 0;
            this.resAmount = 3;
            Laya.Laya.init(500, 400).then(() => {
                Laya.Laya.loader.maxLoader = 1;
                Laya.Laya.loader.load("res/apes/monkey2.png", Laya.Handler.create(this, this.onAssetLoaded), null, null, 0, false);
                Laya.Laya.loader.load("res/apes/monkey1.png", Laya.Handler.create(this, this.onAssetLoaded), null, null, 1, false);
                Laya.Laya.loader.load("res/apes/monkey0.png", Laya.Handler.create(this, this.onAssetLoaded), null, null, 2, false);
            });
        }
        onAssetLoaded(texture) {
            if (++this.numLoaded == 3) {
                Laya.Laya.loader.maxLoader = 5;
                console.log("All done.");
            }
        }
    }

    class Loader_SingleType {
        constructor() {
            Laya.Laya.init(550, 400).then(() => {
                Laya.Laya.loader.load("res/apes/monkey0.png", Laya.Handler.create(this, this.onAssetLoaded1));
                Laya.Laya.loader.load(["res/apes/monkey0.png", "res/apes/monkey1.png", "res/apes/monkey2.png"], Laya.Handler.create(this, this.onAssetLoaded2));
            });
        }
        onAssetLoaded1(texture) {
        }
        onAssetLoaded2() {
            var pic1 = Laya.Loader.getRes("res/apes/monkey0.png");
            var pic2 = Laya.Loader.getRes("res/apes/monkey1.png");
            var pic3 = Laya.Loader.getRes("res/apes/monkey2.png");
        }
    }

    class PerformanceTest_Maggots2 {
        constructor(maincls) {
            this.texturePath = "res/tinyMaggot.png";
            this.padding = 100;
            this.maggotAmount = 0;
            this.tick = 0;
            this.maggots = [];
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.width, Laya.Browser.height).then(() => {
                Laya.Laya.stage.bgColor = "#000001";
                Laya.Stat.show(0, 0);
                this.wrapBounds = new Laya.Rectangle(-this.padding, -this.padding, Laya.Laya.stage.width + this.padding * 2, Laya.Laya.stage.height + this.padding * 2);
                Laya.Laya.loader.load(this.texturePath, Laya.Handler.create(this, this.onTextureLoaded2));
            });
        }
        onTextureLoaded2() {
            this.maggotContainer = this.createNewContainer();
            this.maggotTexture = Laya.Laya.loader.getRes(this.texturePath);
            Laya.Laya.timer.frameLoop(1, this, this.animate);
            Laya.Laya.timer.loop(2000, this, this.initMaggots);
        }
        onTextureLoaded(e = null) {
            this.maggotTexture = Laya.Laya.loader.getRes(this.texturePath);
            this.initMaggots();
            Laya.Laya.timer.frameLoop(1, this, this.animate);
        }
        initMaggots(num = 1000) {
            this.nowTime = performance.now();
            this.maggotAmount += num;
            for (var i = 0; i < num; i++) {
                var maggot = this.newMaggot();
                this.maggotContainer.addChild(maggot);
                this.maggots.push(maggot);
            }
        }
        createNewContainer() {
            var container = new Laya.Sprite();
            container.size(Laya.Laya.stage.width, Laya.Laya.stage.height);
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
            maggot.x = Math.random() * Laya.Laya.stage.width;
            maggot.y = Math.random() * Laya.Laya.stage.height;
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
            var currentTime = performance.now();
            var chazhi = currentTime - this.nowTime;
            console.log("------------chazhi:" + chazhi);
            if (Laya.Stat.FPS < 50 && (chazhi > 4990) && !this._isClear) {
                this._isClear = true;
                console.log("---------clear---------");
                Laya.Laya.timer.clear(this, this.initMaggots);
            }
        }
        dispose() {
            Laya.Laya.timer.clear(this, this.animate);
            Laya.Laya.timer.clear(this, this.initMaggots);
        }
    }
    class Maggot extends Laya.Sprite {
    }

    class InputDevice_Compass {
        constructor(maincls) {
            this.compassImgPath = "res/inputDevice/kd.png";
            this.firstTime = true;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(700, 1024).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.loader.load(this.compassImgPath, Laya.Handler.create(this, this.init));
            });
        }
        init() {
            this.createCompass();
            this.createDirectionIndicator();
            this.drawUI();
            this.createDegreesText();
            Laya.Gyroscope.instance.on(Laya.Event.CHANGE, this, this.onOrientationChange);
        }
        createCompass() {
            this.compassImg = new Laya.Sprite();
            this.Main.box2D.addChild(this.compassImg);
            this.compassImg.loadImage(this.compassImgPath);
            this.compassImg.pivot(this.compassImg.width / 2, this.compassImg.height / 2);
            this.compassImg.pos(Laya.Laya.stage.width / 2, 400);
        }
        drawUI() {
            var canvas = new Laya.Sprite();
            this.Main.box2D.addChild(canvas);
            canvas.graphics.drawLine(this.compassImg.x, 50, this.compassImg.x, 182, "#FFFFFF", 3);
            canvas.graphics.drawLine(-140 + this.compassImg.x, this.compassImg.y, 140 + this.compassImg.x, this.compassImg.y, "#AAAAAA", 1);
            canvas.graphics.drawLine(this.compassImg.x, -140 + this.compassImg.y, this.compassImg.x, 140 + this.compassImg.y, "#AAAAAA", 1);
        }
        createDegreesText() {
            this.degreesText = new Laya.Text();
            this.Main.box2D.addChild(this.degreesText);
            this.degreesText.align = "center";
            this.degreesText.size(Laya.Laya.stage.width, 100);
            this.degreesText.pos(0, this.compassImg.y + 400);
            this.degreesText.fontSize = 100;
            this.degreesText.color = "#FFFFFF";
        }
        createDirectionIndicator() {
            this.directionIndicator = new Laya.Sprite();
            this.Main.box2D.addChild(this.directionIndicator);
            this.directionIndicator.alpha = 0.8;
            this.directionIndicator.graphics.drawCircle(0, 0, 70, "#343434");
            this.directionIndicator.graphics.drawLine(-40, 0, 40, 0, "#FFFFFF", 3);
            this.directionIndicator.graphics.drawLine(0, -40, 0, 40, "#FFFFFF", 3);
            this.directionIndicator.x = this.compassImg.x;
            this.directionIndicator.y = this.compassImg.y;
        }
        onOrientationChange(absolute, info) {
            if (info.alpha === null) {
                alert("当前设备不支持陀螺仪。");
            }
            else if (this.firstTime && !absolute && !Laya.Browser.onIOS) {
                this.firstTime = false;
                alert("在当前设备中无法获取地球坐标系，使用设备坐标系，你可以继续观赏，但是提供的方位并非正确方位。");
            }
            this.degreesText.text = 360 - Math.floor(info.alpha) + "°";
            this.compassImg.rotation = info.alpha;
            this.directionIndicator.x = -1 * Math.floor(info.gamma) / 90 * 70 + this.compassImg.x;
            this.directionIndicator.y = -1 * Math.floor(info.beta) / 90 * 70 + this.compassImg.y;
        }
    }

    class InputDevice_GluttonousSnake {
        constructor(maincls) {
            this.segments = [];
            this.foods = [];
            this.initialSegmentsAmount = 5;
            this.vx = 0;
            this.vy = 0;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.width, Laya.Browser.height).then(() => {
                this.initSnake();
                Laya.Accelerator.instance.on(Laya.Event.CHANGE, this, this.monitorAccelerator);
                Laya.Laya.timer.frameLoop(1, this, this.animate);
                Laya.Laya.timer.loop(3000, this, this.produceFood);
                this.produceFood();
            });
        }
        initSnake() {
            for (var i = 0; i < this.initialSegmentsAmount; i++) {
                this.addSegment();
                if (i == 0) {
                    var header = this.segments[0];
                    header.rotation = 180;
                    this.targetPosition = new Laya.Point();
                    this.targetPosition.x = Laya.Laya.stage.width / 2;
                    this.targetPosition.y = Laya.Laya.stage.height / 2;
                    header.pos(this.targetPosition.x + header.width, this.targetPosition.y);
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
            this.targetPosition.x += this.vx;
            this.targetPosition.y += this.vy;
            this.limitMoveRange();
            this.checkEatFood();
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
            else if (this.targetPosition.x > Laya.Laya.stage.width)
                this.targetPosition.x = Laya.Laya.stage.width;
            if (this.targetPosition.y < 0)
                this.targetPosition.y = 0;
            else if (this.targetPosition.y > Laya.Laya.stage.height)
                this.targetPosition.y = Laya.Laya.stage.height;
        }
        checkEatFood() {
            var food;
            for (var i = this.foods.length - 1; i >= 0; i--) {
                food = this.foods[i];
                if (food.hitTestPoint(this.targetPosition.x, this.targetPosition.y)) {
                    this.addSegment();
                    Laya.Laya.stage.removeChild(food);
                    this.foods.splice(i, 1);
                }
            }
        }
        produceFood() {
            if (this.foods.length == 5)
                return;
            var food = new Laya.Sprite();
            this.Main.box2D.addChild(food);
            this.foods.push(food);
            const foodSize = 40;
            food.size(foodSize, foodSize);
            food.graphics.drawRect(0, 0, foodSize, foodSize, "#00BFFF");
            food.x = Math.random() * Laya.Laya.stage.width;
            food.y = Math.random() * Laya.Laya.stage.height;
        }
        dispose() {
            Laya.Laya.timer.clear(this, this.animate);
            Laya.Laya.timer.clear(this, this.produceFood);
        }
    }
    class Segment extends Laya.Sprite {
        constructor(width, height) {
            super();
            this.size(width, height);
            this.init();
        }
        init() {
            this.graphics.drawRect(-this.height / 2, -this.height / 2, this.width + this.height, this.height, "#FF7F50");
        }
        getPinPosition() {
            var radian = this.rotation * Math.PI / 180;
            var tx = this.x + Math.cos(radian) * this.width;
            var ty = this.y + Math.sin(radian) * this.width;
            return new Laya.Point(tx, ty);
        }
    }

    class InputDevice_Map {
        constructor(maincls) {
            this.BMap = Laya.Browser.window.BMap;
            this.convertor = new this.BMap.Convertor();
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.width, 255).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_NOSCALE;
                this.createDom();
                this.initMap();
                this.createInfoText();
                var successHandler = new Laya.Handler(this, this.updatePosition);
                var errorHandler = new Laya.Handler(this, this.onError);
                Laya.Geolocation.enableHighAccuracy = true;
                Laya.Geolocation.watchPosition(successHandler, errorHandler);
                this.convertToBaiduCoord = this.convertToBaiduCoord.bind(this);
            });
        }
        createDom() {
            this.mapDiv = Laya.Browser.createElement("div");
            var style = this.mapDiv.style;
            style.position = "absolute";
            style.top = Laya.Laya.stage.height / Laya.Browser.pixelRatio + "px";
            style.left = "0px";
            style.width = Laya.Browser.width / Laya.Browser.pixelRatio + "px";
            style.height = (Laya.Browser.height - Laya.Laya.stage.height) / Laya.Browser.pixelRatio + "px";
            Laya.Browser.document.body.appendChild(this.mapDiv);
        }
        initMap() {
            this.map = new this.BMap.Map(this.mapDiv);
            this.map.disableKeyboard();
            this.map.disableScrollWheelZoom();
            this.map.disableDoubleClickZoom();
            this.map.disablePinchToZoom();
            this.map.centerAndZoom(new this.BMap.Point(116.32715863448607, 39.990912172420714), 15);
            this.marker = new this.BMap.Marker(new this.BMap.Point(0, 0));
            this.map.addOverlay(this.marker);
            var label = new this.BMap.Label("当前位置", { "offset": new this.BMap.Size(-15, 30) });
            this.marker.setLabel(label);
        }
        createInfoText() {
            this.infoText = new Laya.Text();
            this.Main.box2D.addChild(this.infoText);
            this.infoText.fontSize = 50;
            this.infoText.color = "#FFFFFF";
            this.infoText.size(Laya.Laya.stage.width, Laya.Laya.stage.height);
        }
        updatePosition(p) {
            var point = new this.BMap.Point(p.longitude, p.latitude);
            this.convertor.translate([point], 1, 5, this.convertToBaiduCoord);
            this.infoText.text =
                "经度：" + p.longitude +
                    "\t纬度：" + p.latitude +
                    "\t精度：" + p.accuracy +
                    "\n海拔：" + p.altitude +
                    "\t海拔精度：" + p.altitudeAccuracy +
                    "\n头：" + p.heading +
                    "\n速度：" + p.speed +
                    "\n时间戳：" + p.timestamp;
        }
        convertToBaiduCoord(data) {
            if (data.status == 0) {
                var position = data.points[0];
                this.marker.setPosition(position);
                this.map.panTo(position);
                this.map.setZoom(17);
            }
        }
        onError(e) {
            if (e.code == Laya.Geolocation.TIMEOUT)
                alert("获取位置超时");
            else if (e.code == Laya.Geolocation.POSITION_UNAVAILABLE)
                alert("位置不可用");
            else if (e.code == Laya.Geolocation.PERMISSION_DENIED)
                alert("无权限");
        }
        dispose() {
            Laya.Browser.document.body.removeChild(this.mapDiv);
            this.mapDiv = null;
            this.map = null;
            this.marker = null;
        }
    }

    class InputDevice_Media {
        constructor() {
            if (Laya.Media.supported() === false)
                alert("当前浏览器不支持");
            else {
                var options = {
                    "audio": false,
                    "video": {
                        "width": Laya.Browser.width,
                        "height": Laya.Browser.height
                    }
                };
                Laya.Media.getMedia(options, Laya.Handler.create(this, this.onSuccess), Laya.Handler.create(this, this.onError));
            }
        }
        onSuccess(url) {
            var video = Laya.Browser.document.createElement("video");
            video.width = Laya.Browser.clientWidth;
            video.height = Laya.Browser.clientHeight;
            video.style.zIndex = "1E5";
            Laya.Browser.document.body.appendChild(video);
            video.controls = true;
            video.src = url;
            video.play();
        }
        onError(error) {
            alert(error.name + ":" + error.message);
        }
    }

    class InputDevice_Shake {
        constructor(maincls) {
            this.picW = 824;
            this.picH = 484;
            this.shakeCount = 0;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(this.picW, Laya.Browser.height * this.picW / Laya.Browser.width).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                this.showShakePic();
                this.showConsoleText();
                this.startShake();
            });
        }
        showShakePic() {
            var shakePic = new Laya.Sprite();
            shakePic.loadImage("res/inputDevice/shake.png");
            this.Main.box2D.addChild(shakePic);
        }
        showConsoleText() {
            this.console = new Laya.Text();
            this.Main.box2D.addChild(this.console);
            this.console.y = this.picH + 10;
            this.console.width = Laya.Laya.stage.width;
            this.console.height = Laya.Laya.stage.height - this.console.y;
            this.console.color = "#FFFFFF";
            this.console.fontSize = 50;
            this.console.align = "center";
            this.console.valign = 'middle';
            this.console.leading = 10;
        }
        startShake() {
            Laya.Shake.instance.start(5, 500);
            Laya.Shake.instance.on(Laya.Event.CHANGE, this, this.onShake);
            this.console.text = '开始接收设备摇动\n';
        }
        onShake() {
            this.shakeCount++;
            this.console.text += "设备摇晃了" + this.shakeCount + "次\n";
            if (this.shakeCount >= 3) {
                Laya.Shake.instance.stop();
                this.console.text += "停止接收设备摇动";
            }
        }
    }

    class InputDevice_Video {
        constructor(maincls) {
            this.BackgroundSkin = "res/inputDevice/videoPlayer/background.png";
            this.TimeLineBoxSkin = "res/inputDevice/videoPlayer/time line-box.png";
            this.TimeLineSkin = "res/inputDevice/videoPlayer/time line.png";
            this.ColorTimelineSkin = "res/inputDevice/videoPlayer/color time line.png";
            this.PauseButtonSkin = "res/inputDevice/videoPlayer/pause button.png";
            this.PlayButtonSkin = "res/inputDevice/videoPlayer/play button.png";
            this.NormalSoundControlSkin = "res/inputDevice/videoPlayer/normal sound control.png";
            this.SoundBgControlSkin = "res/inputDevice/videoPlayer/sound bg.png";
            this.MuteButtonSkin = "res/inputDevice/videoPlayer/mute.png";
            this.VolumnLineSkin = "res/inputDevice/videoPlayer/light-blue.png";
            this.VolumeSliderSkin = "res/inputDevice/videoPlayer/volumeSlider.png";
            this.PlayHeadSliderSkin = "res/inputDevice/videoPlayer/playHeadSlider.png";
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(650, 350).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.loader.load([this.BackgroundSkin, this.TimeLineBoxSkin, this.TimeLineSkin, this.ColorTimelineSkin, this.PauseButtonSkin, this.PlayButtonSkin, this.NormalSoundControlSkin, this.SoundBgControlSkin, this.MuteButtonSkin, this.VolumnLineSkin, this.VolumeSliderSkin, this.PlayHeadSliderSkin], Laya.Handler.create(this, this.setupUI));
            });
        }
        setupUI() {
            this.showGUI();
            this.createVideo();
        }
        showGUI() {
            this.showBackground();
            this.showTimelineControls();
            this.showSoundControl();
        }
        showBackground() {
            var background = new Laya.Sprite();
            this.Main.box2D.addChild(background);
            background.loadImage(this.BackgroundSkin);
            background.y = 25;
        }
        showTimelineControls() {
            this.showTimelineBox();
            this.showPlaybackControls();
            this.showTimeline();
            this.showColorTimeline();
            this.showPlayHeadSlider();
        }
        showTimelineBox() {
            this.timelineBox = new Laya.Sprite();
            this.Main.box2D.addChild(this.timelineBox);
            this.timelineBox.loadImage(this.TimeLineBoxSkin);
            this.timelineBox.pos(108, 280);
        }
        showPlaybackControls() {
            this.togglePlayButton = new Laya.Button();
            this.togglePlayButton.skin = this.PlayButtonSkin;
            this.Main.box2D.addChild(this.togglePlayButton);
            this.togglePlayButton.pos(110, 290);
            this.togglePlayButton.on(Laya.Event.CLICK, this, this.onTogglePlay);
        }
        showTimeline() {
            var timeline = new Laya.Sprite();
            this.Main.box2D.addChild(timeline);
            timeline.loadImage(this.TimeLineSkin);
            timeline.pos(143, 295);
        }
        showColorTimeline() {
            var texture = Laya.Loader.getRes(this.ColorTimelineSkin);
            this.colorTimeline = new Laya.Sprite();
            this.Main.box2D.addChild(this.colorTimeline);
            this.colorTimeline.graphics.drawTexture(texture, 0, 0);
            this.colorTimeline.size(texture.width, texture.height);
            this.colorTimeline.pos(143, 296);
            this.playProgressScrollRect = new Laya.Rectangle(0, 0, 0, 8);
            this.colorTimeline.scrollRect = this.playProgressScrollRect;
        }
        showPlayHeadSlider() {
            this.playHeadSlider = new Laya.Sprite();
            this.playHeadSlider.loadImage(this.PlayHeadSliderSkin);
            this.Main.box2D.addChild(this.playHeadSlider);
            this.playHeadSlider.pos(143, 292);
            this.playHeadSlider.pivotX = this.playHeadSlider.width / 2;
            this.timelineBox.on(Laya.Event.MOUSE_DOWN, this, function () {
                if (!this.video.paused)
                    this.pause();
                Laya.Laya.stage.on(Laya.Event.MOUSE_MOVE, this, moveSlider);
                Laya.Laya.stage.on(Laya.Event.MOUSE_UP, this, endDrag);
                this.prevX = Laya.Laya.stage.mouseX;
            });
            function moveSlider() {
                var dx = Laya.Laya.stage.mouseX - this.prevX;
                this.playHeadSlider.x += dx;
                this.prevX = Laya.Laya.stage.mouseX;
                if (this.playHeadSlider.x < 143)
                    this.playHeadSlider.x = 143;
                else if (this.playHeadSlider.x > 143 + this.colorTimeline.width)
                    this.playHeadSlider.x = 143 + this.colorTimeline.width;
                this.video.currentTime = this.video.duration * (this.playHeadSlider.x - 143) / this.colorTimeline.width;
                console.log(this.video.currentTime);
                this.playProgressScrollRect.width = this.video.currentTime / this.video.duration * this.colorTimeline.width;
            }
            function endDrag() {
                Laya.Laya.stage.off(Laya.Event.MOUSE_MOVE, this, moveSlider);
                Laya.Laya.stage.off(Laya.Event.MOUSE_UP, this, endDrag);
                this.play();
            }
        }
        showSoundControl() {
            this.showNormalSoundControl();
            this.createVolumeControl();
            this.createVolumeLine();
            this.createVolumeSlider();
            this.createMuteButton();
        }
        showNormalSoundControl() {
            var soundContorl = new Laya.Sprite();
            this.Main.box2D.addChild(soundContorl);
            soundContorl.loadImage(this.NormalSoundControlSkin);
            soundContorl.pos(68, 280);
            soundContorl.on(Laya.Event.CLICK, this, function () {
                if (this.volumeControl.parent)
                    Laya.Laya.stage.removeChild(this.volumeControl);
                else
                    this.Main.box2D.addChild(this.volumeControl);
            });
        }
        createVolumeControl() {
            this.volumeControl = new Laya.Sprite();
            this.volumeControl.loadImage(this.SoundBgControlSkin);
            this.volumeControl.pos(68, 176);
        }
        createVolumeLine() {
            this.volumeLine = new Laya.Sprite();
            this.volumeControl.addChild(this.volumeLine);
            this.volumeLine.loadImage(this.VolumnLineSkin);
            this.volumeLine.pos(15, 12);
            this.volumeScrollRect = new Laya.Rectangle(0, 0, 7, 55);
            this.volumeLine.scrollRect = this.volumeScrollRect;
        }
        createVolumeSlider() {
            var volumeSlider = new Laya.Sprite();
            this.volumeControl.addChild(volumeSlider);
            volumeSlider.loadImage(this.VolumeSliderSkin);
            volumeSlider.pos(12, 8);
            this.volumeControl.on(Laya.Event.MOUSE_DOWN, this, function () {
                Laya.Laya.stage.on(Laya.Event.MOUSE_MOVE, this, moveSlider);
                Laya.Laya.stage.on(Laya.Event.MOUSE_UP, this, endDrag);
                this.prevY = Laya.Laya.stage.mouseY;
            });
            function moveSlider() {
                var dy = Laya.Laya.stage.mouseY - this.prevY;
                this.prevY = Laya.Laya.stage.mouseY;
                volumeSlider.y += dy;
                if (volumeSlider.y < 8)
                    volumeSlider.y = 8;
                else if (volumeSlider.y > 8 + 50)
                    volumeSlider.y = 8 + 50;
                this.video.volume = 1 - (volumeSlider.y - 8) / 50;
                this.volumeLine.y = volumeSlider.y - 8 + 12;
                this.volumeScrollRect.y = volumeSlider.y - 8;
            }
            function endDrag() {
                Laya.Laya.stage.off(Laya.Event.MOUSE_MOVE, this, moveSlider);
                Laya.Laya.stage.off(Laya.Event.MOUSE_UP, this, endDrag);
            }
        }
        createMuteButton() {
            var muteButton = new Laya.Sprite();
            this.volumeControl.addChild(muteButton);
            muteButton.loadImage(this.MuteButtonSkin);
            muteButton.y = -(muteButton.height + 3);
            muteButton.on(Laya.Event.CLICK, this, function () {
                this.video.muted = !this.video.muted;
            });
        }
        createVideo() {
            this.video = new Laya.VideoNode();
            this.video.videoTexture = Laya.VideoTexture.createInstance();
            if (this.video.canPlayType("mp4") == "" && this.video.canPlayType("ogg") == "") {
                alert("当前浏览器不支持播放本视频");
            }
            this.video.videoTexture.on('loadedmetadata', this, this.onVideoReady);
            this.video.videoTexture.on('ended', this, this.onVideoPlayEnded);
            this.video.load("res/av/mov_bbb.mp4");
            this.Main.box2D.addChild(this.video);
        }
        onTogglePlay(e) {
            if (this.video.paused)
                this.play();
            else
                this.pause();
        }
        play() {
            this.video.play();
            this.togglePlayButton.skin = this.PauseButtonSkin;
            Laya.Laya.timer.frameLoop(1, this, this.loop);
        }
        pause() {
            Laya.Laya.timer.clear(this, this.loop);
            this.video.pause();
            this.togglePlayButton.skin = this.PlayButtonSkin;
        }
        onVideoPlayEnded(e) {
            this.togglePlayButton.skin = this.PlayButtonSkin;
            Laya.Laya.timer.clear(this, this.loop);
        }
        onVideoReady() {
            if (this.video.readyState == 0)
                return;
            console.log("当前使用源：" + this.video.currentSrc);
            this.video.width = this.video.videoWidth;
            this.video.height = this.video.videoHeight;
            this.video.x = 160;
            this.video.y = 65;
        }
        loop() {
            this.playProgressScrollRect.width = this.video.currentTime / this.video.duration * this.colorTimeline.width;
            this.playHeadSlider.x = 143 + this.playProgressScrollRect.width;
        }
        dispose() {
            Laya.Laya.timer.clear(this, this.loop);
        }
    }

    class Interaction_Keyboard {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.setup();
            });
        }
        setup() {
            this.listenKeyboard();
            this.createLogger();
            Laya.Laya.timer.frameLoop(1, this, this.keyboardInspector);
        }
        listenKeyboard() {
            this.keyDownList = [];
            Laya.Laya.stage.on(Laya.Event.KEY_DOWN, this, this.onKeyDown);
            Laya.Laya.stage.on(Laya.Event.KEY_UP, this, this.onKeyUp);
        }
        onKeyDown(e = null) {
            this.keyDownList[e["keyCode"]] = true;
        }
        onKeyUp(e = null) {
            delete this.keyDownList[e["keyCode"]];
        }
        keyboardInspector(e = null) {
            var numKeyDown = this.keyDownList.length;
            var newText = '[ ';
            for (var i = 0; i < numKeyDown; i++) {
                if (this.keyDownList[i]) {
                    newText += i + " ";
                }
            }
            newText += ']';
            this.logger.changeText(newText);
        }
        createLogger() {
            this.logger = new Laya.Text();
            this.logger.size(Laya.Laya.stage.width, Laya.Laya.stage.height);
            this.logger.fontSize = 30;
            this.logger.font = "SimHei";
            this.logger.wordWrap = true;
            this.logger.color = "#FFFFFF";
            this.logger.align = 'center';
            this.logger.valign = 'middle';
            this.Main.box2D.addChild(this.logger);
        }
    }

    class PIXI_Example_04 {
        constructor(maincls) {
            this.starCount = 2500;
            this.sx = 1.0 + (Math.random() / 20);
            this.sy = 1.0 + (Math.random() / 20);
            this.stars = [];
            this.w = Laya.Browser.width;
            this.h = Laya.Browser.height;
            this.slideX = this.w / 2;
            this.slideY = this.h / 2;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(this.w, this.h).then(() => {
                this.createText();
                this.start();
            });
        }
        start() {
            for (var i = 0; i < this.starCount; i++) {
                var tempBall = new Laya.Sprite();
                tempBall.loadImage("res/pixi/bubble_32x32.png");
                tempBall.x = (Math.random() * this.w) - this.slideX;
                tempBall.y = (Math.random() * this.h) - this.slideY;
                tempBall.pivot(16, 16);
                this.stars.push({ "sprite": tempBall, "x": tempBall.x, "y": tempBall.y });
                this.Main.box2D.addChild(tempBall);
            }
            Laya.Laya.stage.on('click', this, this.newWave);
            this.speedInfo.text = 'SX: ' + this.sx + '\nSY: ' + this.sy;
            this.resize();
            Laya.Laya.timer.frameLoop(1, this, this.update);
        }
        createText() {
            this.speedInfo = new Laya.Text();
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
            this.w = Laya.Laya.stage.width;
            this.h = Laya.Laya.stage.height;
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

    class PIXI_Example_05 {
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
            Laya.Laya.init(Laya.Browser.width, Laya.Browser.height).then(() => {
                Laya.Stat.show();
                this.setup();
            });
        }
        setup() {
            Laya.Laya.stage.on(Laya.Event.RESIZE, this, this.onResize);
            this.makeObject(0);
            for (var i = 0; i < this.n; i++) {
                this.tpoint1[i] = this.points1[i];
                this.tpoint2[i] = this.points2[i];
                this.tpoint3[i] = this.points3[i];
                var tempBall = new Laya.Sprite();
                tempBall.loadImage('res/pixi/pixel.png');
                tempBall.pivot(3, 3);
                tempBall.alpha = 0.5;
                this.balls[i] = tempBall;
                this.Main.box2D.addChild(tempBall);
            }
            this.onResize();
            Laya.Laya.timer.loop(5000, this, this.nextObject);
            Laya.Laya.timer.frameLoop(1, this, this.update);
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
                this.balls[i].x = (512 * tx) / (this.d - tz) + Laya.Laya.stage.width / 2;
                this.balls[i].y = (Laya.Laya.stage.height / 2) - (512 * ty) / (this.d - tz);
            }
        }
    }

    class PIXI_Example_21 {
        constructor(maincls) {
            this.colors = ["#5D0776", "#EC8A49", "#AF3666", "#F6C84C", "#4C779A"];
            this.colorCount = 0;
            this.isDown = false;
            this.path = [];
            this.color = this.colors[0];
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.width, Laya.Browser.height).then(() => {
                Laya.Laya.stage.bgColor = "#3da8bb";
                this.createCanvases();
                Laya.Laya.timer.frameLoop(1, this, this.animate);
                Laya.Laya.stage.on('mousedown', this, this.onMouseDown);
                Laya.Laya.stage.on('mousemove', this, this.onMouseMove);
                Laya.Laya.stage.on('mouseup', this, this.onMouseUp);
            });
        }
        createCanvases() {
            var graphicsCanvas = new Laya.Sprite();
            this.Main.box2D.addChild(graphicsCanvas);
            var liveGraphicsCanvas = new Laya.Sprite();
            this.Main.box2D.addChild(liveGraphicsCanvas);
            this.liveGraphics = liveGraphicsCanvas.graphics;
            this.canvasGraphics = graphicsCanvas.graphics;
        }
        onMouseDown(e = null) {
            this.isDown = true;
            this.color = this.colors[this.colorCount++ % this.colors.length];
            this.path.length = 0;
        }
        onMouseMove(e = null) {
            if (!this.isDown)
                return;
            this.path.push(Laya.Laya.stage.mouseX);
            this.path.push(Laya.Laya.stage.mouseY);
        }
        onMouseUp(e = null) {
            this.isDown = false;
            this.canvasGraphics.drawPoly(0, 0, this.path.concat(), this.color);
        }
        animate() {
            this.liveGraphics.clear();
            this.liveGraphics.drawPoly(0, 0, this.path, this.color);
        }
        dispose() {
            Laya.Laya.timer.clear(this, this.animate);
        }
    }

    class PIXI_Example_23 {
        constructor(maincls) {
            this.viewWidth = Laya.Browser.width;
            this.viewHeight = Laya.Browser.height;
            this.lasers = [];
            this.tick = 0;
            this.frequency = 80;
            this.type = 0;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(this.viewWidth, this.viewHeight).then(() => {
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_HORIZONTAL;
                Laya.Laya.stage.bgColor = '#181818';
                let bgsp = new Laya.Sprite();
                bgsp.loadImage("res/pixi/laserBG.jpg");
                this.Main.box2D.addChild(bgsp);
                Laya.Laya.stage.frameLoop(1, this, this.animate);
            });
        }
        animate() {
            if (this.tick > this.frequency) {
                this.tick = 0;
                var laser = new Laser();
                laser.loadImage("res/pixi/laser0" + ((this.type % 5) + 1) + ".png");
                this.type++;
                laser.life = 0;
                var pos1;
                var pos2;
                if (this.type % 2) {
                    pos1 = new Laya.Point(-20, Math.random() * this.viewHeight);
                    pos2 = new Laya.Point(this.viewWidth, Math.random() * this.viewHeight + 20);
                }
                else {
                    pos1 = new Laya.Point(Math.random() * this.viewWidth, -20);
                    pos2 = new Laya.Point(Math.random() * this.viewWidth, this.viewHeight + 20);
                }
                var distX = pos1.x - pos2.x;
                var distY = pos1.y - pos2.y;
                var dist = Math.sqrt(distX * distX + distY * distY) + 40;
                laser.scaleX = dist / 20;
                laser.pos(pos1.x, pos1.y);
                laser.pivotY = 43 / 2;
                laser.blendMode = "lighter";
                laser.rotation = (Math.atan2(distY, distX) + Math.PI) * 180 / Math.PI;
                this.lasers.push(laser);
                this.Main.box2D.addChild(laser);
                this.frequency *= 0.9;
            }
            for (var i = 0; i < this.lasers.length; i++) {
                laser = this.lasers[i];
                laser.life++;
                if (laser.life > 60 * 0.3) {
                    laser.alpha *= 0.9;
                    laser.scaleY = laser.alpha;
                    if (laser.alpha < 0.01) {
                        this.lasers.splice(i, 1);
                        laser.removeSelf();
                        i--;
                    }
                }
            }
            this.tick += 1;
        }
        dispose() {
            Laya.Laya.timer.clear(this, this.animate);
        }
    }
    class Laser extends Laya.Sprite {
    }

    class Skeleton_SpineStretchyman {
        constructor(maincls) {
            this.mStartX = 200;
            this.mStartY = 500;
            this.mActionIndex = 0;
            this.mCurrIndex = 0;
            this.mCurrSkinIndex = 0;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.width, Laya.Browser.height).then(() => {
                Laya.Laya.stage.bgColor = "#ffffff";
                Laya.Stat.show();
                Laya.Laya.loader.load("res/spine/spineRes4/stretchyman.sk").then((templet) => {
                    this.mArmature = templet.buildArmature(1);
                    this.mArmature.x = this.mStartX;
                    this.mArmature.y = this.mStartY;
                    this.Main.box2D.addChild(this.mArmature);
                    this.mArmature.on(Laya.Event.STOPPED, this, this.completeHandler);
                    this.play();
                });
            });
        }
        completeHandler() {
            this.play();
        }
        play() {
            this.mCurrIndex++;
            if (this.mCurrIndex >= this.mArmature.getAnimNum()) {
                this.mCurrIndex = 0;
            }
            this.mArmature.play(this.mCurrIndex, false);
        }
        dispose() {
            if (this.mArmature == null)
                return;
            this.mArmature.stop();
            this.mArmature.off(Laya.Event.STOPPED, this, this.completeHandler);
        }
    }

    class SmartScale_Align_Contral {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(100, 100).then(() => {
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.bgColor = "#232628";
            });
        }
    }

    class SmartScale_Landscape {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(550, 400).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_HORIZONTAL;
                Laya.Laya.stage.bgColor = "#232628";
                this.showText();
            });
        }
        showText() {
            var text = new Laya.Text();
            text.text = "Orientation-Landscape";
            text.color = "gray";
            text.font = "Impact";
            text.fontSize = 50;
            text.x = Laya.Laya.stage.width - text.width >> 1;
            text.y = Laya.Laya.stage.height - text.height >> 1;
            this.Main.box2D.addChild(text);
        }
    }

    class SmartScale_Portrait {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(550, 400).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_VERTICAL;
                Laya.Laya.stage.bgColor = "#232628";
                this.showText();
            });
        }
        showText() {
            var text = new Laya.Text();
            text.text = "Orientation-Portrait";
            text.color = "gray";
            text.font = "Impact";
            text.fontSize = 50;
            text.x = Laya.Laya.stage.width - text.width >> 1;
            text.y = Laya.Laya.stage.height - text.height >> 1;
            this.Main.box2D.addChild(text);
        }
    }

    class SmartScale_Scale_NOSCALE {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(550, 400).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_NOSCALE;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_HORIZONTAL;
                Laya.Laya.stage.bgColor = "#232628";
                this.createCantralRect();
            });
        }
        createCantralRect() {
            this.rect = new Laya.Sprite();
            this.rect.graphics.drawRect(-100, -100, 200, 200, "gray");
            this.Main.box2D.addChild(this.rect);
            this.rect.mouseEnabled = this.rect.mouseThrough = true;
            this.updateRectPos();
        }
        updateRectPos() {
            this.rect.x = Laya.Laya.stage.width / 2;
            this.rect.y = Laya.Laya.stage.height / 2;
        }
    }

    class Sprite_Guide {
        constructor(maincls) {
            this.guideSteps = [{ 'x': 151, 'y': 575, 'radius': 150, 'tip': "res/guide/help6.png", 'tipx': 200, 'tipy': 250 },
                { 'x': 883, 'y': 620, 'radius': 100, 'tip': "res/guide/help4.png", 'tipx': 730, 'tipy': 380 },
                { 'x': 1128, 'y': 583, 'radius': 110, 'tip': "res/guide/help3.png", 'tipx': 900, 'tipy': 300 }];
            this.guideStep = 0;
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(1285, 727).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_HORIZONTAL;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                var gameContainer = new Laya.Sprite();
                gameContainer.loadImage("res/guide/crazy_snowball.png");
                this.Main.box2D.addChild(gameContainer);
                this.guideContainer = new Laya.Sprite();
                this.guideContainer.cacheAs = "bitmap";
                this.Main.box2D.addChild(this.guideContainer);
                gameContainer.on("click", this, this.nextStep);
                var maskArea = new Laya.Sprite();
                maskArea.alpha = 0.5;
                maskArea.graphics.drawRect(0, 0, Laya.Laya.stage.width, Laya.Laya.stage.height, "#000000");
                this.guideContainer.addChild(maskArea);
                this.interactionArea = new Laya.Sprite();
                this.interactionArea.blendMode = "destinationOut";
                this.guideContainer.addChild(this.interactionArea);
                this.hitArea = new Laya.HitArea();
                this.hitArea.hit.drawRect(0, 0, Laya.Laya.stage.width, Laya.Laya.stage.height, "#000000");
                this.guideContainer.hitArea = this.hitArea;
                this.guideContainer.mouseEnabled = true;
                this.tipContainer = new Laya.Sprite();
                this.Main.box2D.addChild(this.tipContainer);
                this.nextStep();
            });
        }
        nextStep() {
            if (this.guideStep == this.guideSteps.length) {
                this.Main.box2D.removeChild(this.guideContainer);
                this.Main.box2D.removeChild(this.tipContainer);
                return;
            }
            else {
                var step = this.guideSteps[this.guideStep++];
                this.hitArea.unHit.clear();
                this.hitArea.unHit.drawCircle(step.x, step.y, step.radius, "#000000");
                this.interactionArea.graphics.clear();
                this.interactionArea.graphics.drawCircle(step.x, step.y, step.radius, "#000000");
                this.tipContainer.graphics.clear();
                this.tipContainer.loadImage(step.tip);
                this.tipContainer.pos(step.tipx, step.tipy);
            }
        }
    }

    class Text_Prompt {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(550, 400).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                this.createInput();
            });
        }
        createInput() {
            var inputText = new Laya.Input();
            inputText.size(350, 100);
            inputText.x = Laya.Laya.stage.width - inputText.width >> 1;
            inputText.y = Laya.Laya.stage.height - inputText.height >> 1;
            inputText.inputElementXAdjuster = -1;
            inputText.inputElementYAdjuster = 1;
            inputText.bold = true;
            inputText.bgColor = "#666666";
            inputText.color = "#ffffff";
            inputText.fontSize = 20;
            inputText.prompt = "输入用户名";
            inputText.promptColor = "#000000";
            this.Main.box2D.addChild(inputText);
        }
    }

    class UI_Panel {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(800, 600).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.Laya.stage.bgColor = "#232628";
                this.setup();
            });
        }
        setup() {
            var panel = new Laya.Panel();
            panel.hScrollBarSkin = "res/ui/hscroll.png";
            panel.hScrollBar.hide = true;
            panel.size(600, 275);
            panel.x = (Laya.Laya.stage.width - panel.width) / 2;
            panel.y = (Laya.Laya.stage.height - panel.height) / 2;
            this.Main.box2D.addChild(panel);
            var img;
            for (var i = 0; i < 4; i++) {
                img = new Laya.Image("res/ui/dialog (1).png");
                img.x = i * 250;
                panel.addChild(img);
            }
        }
    }

    class Text_UBB {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.setup();
            });
        }
        setup() {
            this.createParagraph();
        }
        createParagraph() {
            var t = new Laya.Text();
            t.ubb = true;
            t.fontSize = 50;
            t.zOrder = 90000;
            t.text = '[color=#e3d26a]使用[/color]<br/>';
            t.text += '[color=#0bbd71]U[/color][color=#ff133c][u]B[/u][color][color=#409ed7][b]B[/b][/color]<br/>';
            t.text += '[color=#6ad2e3]创建的[/color]<br/>';
            t.text += '[color=#d26ae3]UBB文本[/color]<br/>';
            this.Main.box2D.addChild(t);
        }
    }

    class Line2DRenderDemo {
        constructor(mainClass) {
            this.Main = null;
            this._lastX = 0;
            this._line2Drender = null;
            this.Main = mainClass;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Stat.show();
                Laya.Laya.loader.load("res/apes/monkey2.png", Laya.Loader.IMAGE).then(() => {
                    let image = Laya.Loader.getRes("res/apes/monkey2.png");
                    this.showApe(image);
                });
            });
        }
        showApe(img) {
            let texture = img.bitmap;
            texture.wrapModeV = Laya.WrapMode.Repeat;
            texture.wrapModeU = Laya.WrapMode.Repeat;
            var ape = new Laya.Sprite();
            let line2Drender = this._line2Drender = ape.addComponent(Laya.Line2DRender);
            line2Drender.lineWidth = 10;
            line2Drender.tillOffset = new Laya.Vector4(0, 0, 0.01, 1);
            line2Drender.color = new Laya.Color(1, 0, 0, 1);
            let last = new Laya.Vector2(Math.random() * Laya.Browser.clientWidth, Math.random() * Laya.Browser.clientHeight);
            for (let i = 0; i < 20; i++) {
                let x = Math.random() * Laya.Browser.clientWidth;
                let y = Math.random() * Laya.Browser.clientHeight;
                line2Drender.addPoint(last.x, last.y, x, y);
                last.setValue(x, y);
            }
            this.Main.box2D.addChild(ape);
        }
    }

    class Camera2DDemo {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.bgColor = "#232628";
                this.showApe();
            });
        }
        showApe() {
            var scene = new Laya.Scene();
            this.Main.box2D.addChild(scene);
            var area2D = this.area = new Laya.Area2D();
            scene.addChild(area2D);
            var bg = new Laya.Sprite();
            area2D.addChild(bg);
            bg.loadImage("res/guide/crazy_snowball.png");
            bg.x = 0;
            bg.y = 0;
            bg.width = Laya.Laya.stage.width;
            bg.height = Laya.Laya.stage.height;
            Laya.Laya.loader.load(["res/apes/monkey2.png", "res/apes/monkey3.png"], Laya.Loader.IMAGE).then(() => {
                var ape = new Laya.Sprite();
                ape.loadImage("res/apes/monkey2.png");
                ape.pos(500, 500);
                let camera = new Laya.Camera2D();
                ape.addChild(camera);
                this.testSmooth(camera);
                camera.isMain = true;
                ape.addComponent(testMove$1);
                this.area.addChild(ape);
                Camera2DDemo.camera = camera;
                for (let i = 0; i < 10; i++) {
                    this.addApeOutCamera(camera, i);
                }
            });
        }
        addApeOutCamera(camera, i) {
            var ape = new Laya.Sprite();
            ape.loadImage("res/apes/monkey3.png");
            ape.pos(400 - Laya.RenderState2D.width / 2, 400 + i * 50);
            this.area.addChild(ape);
            ape.enableCulling = true;
        }
        testDrag(camera) {
            camera.dragHorizontalEnable = true;
            camera.dragVerticalEnable = true;
            camera.drag_Bottom = 0.5;
            camera.drag_Top = 0.5;
            camera.drag_Left = 0.5;
            camera.drag_Right = 0.5;
        }
        testLimit(camera) {
            camera.limit_Left = -1000;
            camera.limit_Right = 3000;
            camera.limit_Top = -1000;
            camera.limit_Bottom = 3000;
        }
        testSmooth(camera) {
            camera.positionSmooth = true;
            camera.positionSpeed = 0.5;
        }
    }
    class testMove$1 extends Laya.Script {
        onKeyDown(evt) {
            console.log(evt.keyCode);
            let speed = 30;
            switch (evt.keyCode) {
                case 87:
                    this.owner.y -= speed;
                    break;
                case 83:
                    this.owner.y += speed;
                    break;
                case 65:
                    this.owner.x -= speed;
                    break;
                case 68:
                    this.owner.x += speed;
                    break;
                case 90:
                    Camera2DDemo.camera.zoom.x += 0.2;
                    Camera2DDemo.camera.zoom.y += 0.2;
                    Camera2DDemo.camera.zoom = Camera2DDemo.camera.zoom;
                    break;
                case 88:
                    Camera2DDemo.camera.zoom.y -= 0.2;
                    Camera2DDemo.camera.zoom.x -= 0.2;
                    Camera2DDemo.camera.zoom = Camera2DDemo.camera.zoom;
                    break;
                case 32:
                    this.owner.rotation += Math.PI / 2 / 10;
            }
        }
    }

    class Light2DDemo {
        constructor(mainClass) {
            this.useWebGPU = false;
            this.Main = null;
            this.mousePoint = new Laya.Vector2();
            this.Main = mainClass;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Stat.show();
                this._createScene();
            });
        }
        _createScene() {
            this.scene = this.Main.box2D.addChild(new Laya.Scene());
            this.area2d = new Laya.Area2D();
            this.scene.addChild(this.area2d);
            this.camera = new Laya.Camera2D();
            Laya.Laya.loader.load("res/light.png", Laya.Loader.IMAGE).then(() => {
                const tex = Laya.Laya.loader.getRes("res/light.png");
                tex.bitmap.wrapModeU = Laya.WrapMode.Clamp;
                tex.bitmap.wrapModeV = Laya.WrapMode.Clamp;
                const spriteLightD1 = this.area2d.addChild(new Laya.Sprite());
                const lightD1 = spriteLightD1.addComponent(Laya.DirectionLight2D);
                lightD1.directionAngle = 30;
                lightD1.color = new Laya.Color(0.5, 0.5, 0.5, 1);
                lightD1.shadowColor = new Laya.Color(0, 0.5, 0, 1);
                lightD1.shadowFilterType = Laya.ShadowFilterType.None;
                lightD1.layerMask = 1;
                lightD1.shadowEnable = true;
                const spriteLight1 = this.area2d.addChild(new Laya.Sprite());
                const light1 = spriteLight1.addComponent(Laya.SpriteLight2D);
                spriteLight1.x = 500;
                spriteLight1.y = 800;
                spriteLight1.scale(5, 5);
                light1.color = new Laya.Color(1, 1, 1, 1);
                light1.shadowColor = new Laya.Color(1, 1, 0, 1);
                light1.shadowFilterType = Laya.ShadowFilterType.None;
                light1.spriteTexture = tex.bitmap;
                light1.layerMask = 1;
                light1.shadowEnable = true;
                const spriteLight2 = this.area2d.addChild(new Laya.Sprite());
                const light2 = spriteLight2.addComponent(Laya.FreeformLight2D);
                const ox = 0;
                const oy = 0;
                const poly = new Laya.PolygonPoint2D();
                poly.addPoint(-100 + ox, -100 + oy);
                poly.addPoint(0 + ox, -50 + oy);
                poly.addPoint(100 + ox, -100 + oy);
                poly.addPoint(100 + ox, 100 + oy);
                poly.addPoint(0 + ox, 150 + oy);
                poly.addPoint(-100 + ox, 100 + oy);
                light2.polygonPoint = poly;
                spriteLight2.x = 200;
                spriteLight2.y = 300;
                light2.intensity = 1;
                light2.color = new Laya.Color(0, 1, 1, 1);
                light2.shadowColor = new Laya.Color(1, 0, 0, 1);
                light2.shadowStrength = 0.5;
                light2.shadowFilterType = Laya.ShadowFilterType.None;
                light2.falloffRange = 0.5;
                light2.layerMask = 1;
                light2.shadowEnable = true;
                spriteLight2.addComponent(lightRotate);
                const spriteLight3 = this.area2d.addChild(new Laya.Sprite());
                const light3 = spriteLight3.addComponent(Laya.SpotLight2D);
                spriteLight3.x = 500;
                spriteLight3.y = 500;
                spriteLight3.rotation = 0;
                light3.innerRadius = 300;
                light3.outerRadius = 400;
                light3.innerAngle = 60;
                light3.outerAngle = 125;
                light3.intensity = 1;
                light3.color = new Laya.Color(1, 1, 1, 1);
                light3.shadowColor = new Laya.Color(0, 1, 0, 1);
                light3.shadowStrength = 0.5;
                light3.shadowFilterType = Laya.ShadowFilterType.PCF5;
                light3.shadowFilterSmooth = 5;
                light3.layerMask = 1;
                light3.shadowEnable = true;
                const spriteLight4 = this.area2d.addChild(new Laya.Sprite());
                const light4 = spriteLight4.addComponent(Laya.SpotLight2D);
                spriteLight4.x = 2000;
                spriteLight4.y = 400;
                spriteLight4.rotation = 90;
                light4.innerRadius = 300;
                light4.outerRadius = 400;
                light4.innerAngle = 60;
                light4.outerAngle = 125;
                light4.intensity = 1;
                light4.color = new Laya.Color(1, 1, 0, 1);
                light4.shadowColor = new Laya.Color(0, 1, 1, 1);
                light4.shadowStrength = 0.5;
                light4.shadowFilterType = Laya.ShadowFilterType.PCF9;
                light4.shadowFilterSmooth = 5;
                light4.layerMask = 1;
                light4.shadowEnable = true;
                const spriteLight5 = this.area2d.addChild(new Laya.Sprite());
                const light5 = spriteLight5.addComponent(Laya.SpotLight2D);
                spriteLight5.x = 3000;
                spriteLight5.y = 1000;
                spriteLight5.rotation = 180;
                light4.innerRadius = 200;
                light4.outerRadius = 400;
                light4.innerAngle = 30;
                light4.outerAngle = 90;
                light5.intensity = 1;
                light5.color = new Laya.Color(0, 1, 1, 1);
                light5.shadowColor = new Laya.Color(0, 1, 1, 1);
                light5.shadowStrength = 0.5;
                light5.shadowFilterType = Laya.ShadowFilterType.None;
                light5.shadowFilterSmooth = 5;
                light5.layerMask = 1;
                light5.shadowEnable = true;
            });
            Laya.Laya.loader.load("res/bg2.png", Laya.Loader.IMAGE).then(() => {
                const tex = Laya.Laya.loader.getRes("res/bg2.png");
                const bk = this.area2d.addChild(new Laya.Sprite());
                const mesh2Drender = bk.addComponent(Laya.Mesh2DRender);
                mesh2Drender.sharedMesh = this.generateRectVerticesAndUV(100000, 100000);
                mesh2Drender.texture = tex;
                mesh2Drender.lightReceive = true;
                bk.x = -50000;
                bk.y = -50000;
                Laya.Laya.loader.load("res/apes/monkey2.png", Laya.Loader.IMAGE).then(() => {
                    const tex = Laya.Laya.loader.getRes("res/apes/monkey2.png");
                    const ape = this.area2d.addChild(new Laya.Sprite());
                    const mesh2Drender = ape.addComponent(Laya.Mesh2DRender);
                    mesh2Drender.sharedMesh = this.generateRectVerticesAndUV(110, 145);
                    mesh2Drender.texture = tex;
                    mesh2Drender.lightReceive = true;
                    ape.x = 500;
                    ape.y = 300;
                    const ls = ape.addComponent(Laya.LightOccluder2D);
                    const poly = new Laya.PolygonPoint2D();
                    poly.addPoint(55, 3);
                    poly.addPoint(68, 15);
                    poly.addPoint(78, 25);
                    poly.addPoint(83, 40);
                    poly.addPoint(85, 60);
                    poly.addPoint(95, 70);
                    poly.addPoint(100, 80);
                    poly.addPoint(105, 90);
                    poly.addPoint(107, 100);
                    poly.addPoint(105, 110);
                    poly.addPoint(105, 120);
                    poly.addPoint(100, 130);
                    poly.addPoint(95, 140);
                    poly.addPoint(80, 142);
                    poly.addPoint(70, 130);
                    poly.addPoint(55, 120);
                    poly.addPoint(40, 130);
                    poly.addPoint(30, 142);
                    poly.addPoint(15, 140);
                    poly.addPoint(10, 130);
                    poly.addPoint(5, 120);
                    poly.addPoint(5, 110);
                    poly.addPoint(3, 100);
                    poly.addPoint(5, 90);
                    poly.addPoint(10, 80);
                    poly.addPoint(15, 70);
                    poly.addPoint(25, 60);
                    poly.addPoint(27, 40);
                    poly.addPoint(32, 25);
                    poly.addPoint(42, 15);
                    ls.polygonPoint = poly;
                    ape.addComponent(testMove);
                    ape.addChild(this.camera);
                    this.camera.isMain = true;
                });
                const ape = new Laya.Sprite();
                this.area2d.addChild(ape);
                ape.loadImage("res/apes/monkey1.png");
                ape.x = 50;
                ape.y = 50;
            });
        }
        testDrag(camera) {
            camera.dragHorizontalEnable = true;
            camera.dragVerticalEnable = true;
            camera.drag_Bottom = 0.5;
            camera.drag_Top = 0.5;
            camera.drag_Left = 0.5;
            camera.drag_Right = 0.5;
        }
        testLimit(camera) {
            camera.limit_Left = -1000;
            camera.limit_Right = 3000;
            camera.limit_Top = -1000;
            camera.limit_Bottom = 3000;
        }
        testSmooth(camera) {
            camera.positionSmooth = true;
            camera.positionSpeed = 0.5;
        }
        generateCircleVerticesAndUV(radius, numSegments) {
            const twoPi = Math.PI * 2;
            const vertexs = new Float32Array((numSegments + 1) * 5);
            const index = new Uint16Array((numSegments + 1) * 3);
            let pos = 0;
            for (let i = 0; i < numSegments; i++, pos += 5) {
                const angle = twoPi * i / numSegments;
                const x = vertexs[pos + 0] = radius * Math.cos(angle);
                const y = vertexs[pos + 1] = radius * Math.sin(angle);
                vertexs[pos + 2] = 0;
                vertexs[pos + 3] = 0.5 + x / (2 * radius);
                vertexs[pos + 4] = 0.5 + y / (2 * radius);
            }
            vertexs[pos] = 0;
            vertexs[pos + 1] = 0;
            vertexs[pos + 2] = 0;
            vertexs[pos + 3] = 0.5;
            vertexs[pos + 4] = 0.5;
            let ibIndex = 0;
            for (let i = 1; i < numSegments; i++, ibIndex += 3) {
                index[ibIndex] = i;
                index[ibIndex + 1] = i - 1;
                index[ibIndex + 2] = numSegments;
            }
            index[ibIndex] = numSegments - 1;
            index[ibIndex + 1] = 0;
            index[ibIndex + 2] = numSegments;
            const declaration = Laya.VertexMesh2D.getVertexDeclaration(["POSITION,UV"], false)[0];
            const mesh2D = Laya.Mesh2D.createMesh2DByPrimitive([vertexs], [declaration], index, Laya.IndexFormat.UInt16, [{ length: index.length, start: 0 }]);
            return mesh2D;
        }
        generateRectVerticesAndUV(width, height) {
            const vertices = new Float32Array(4 * 5);
            const indices = new Uint16Array(2 * 3);
            let index = 0;
            vertices[index++] = 0;
            vertices[index++] = 0;
            vertices[index++] = 0;
            vertices[index++] = 0;
            vertices[index++] = 0;
            vertices[index++] = width;
            vertices[index++] = 0;
            vertices[index++] = 0;
            vertices[index++] = 1;
            vertices[index++] = 0;
            vertices[index++] = width;
            vertices[index++] = height;
            vertices[index++] = 0;
            vertices[index++] = 1;
            vertices[index++] = 1;
            vertices[index++] = 0;
            vertices[index++] = height;
            vertices[index++] = 0;
            vertices[index++] = 0;
            vertices[index++] = 1;
            index = 0;
            indices[index++] = 0;
            indices[index++] = 1;
            indices[index++] = 3;
            indices[index++] = 1;
            indices[index++] = 2;
            indices[index++] = 3;
            const declaration = Laya.VertexMesh2D.getVertexDeclaration(["POSITION,UV"], false)[0];
            const mesh2D = Laya.Mesh2D.createMesh2DByPrimitive([vertices], [declaration], indices, Laya.IndexFormat.UInt16, [{ length: indices.length, start: 0 }]);
            return mesh2D;
        }
    }
    class lightRotate extends Laya.Script {
        onUpdate() {
            this.owner.rotation += 1;
        }
    }
    class testMove extends Laya.Script {
        onKeyDown(evt) {
            const speed = 10;
            const angle = 5;
            switch (evt.keyCode) {
                case 87:
                    this.owner.y -= speed;
                    break;
                case 83:
                    this.owner.y += speed;
                    break;
                case 65:
                    this.owner.x -= speed;
                    break;
                case 68:
                    this.owner.x += speed;
                    break;
                case 32:
                    this.owner.rotation += angle;
                    break;
                case 33:
                    this.owner.scaleX *= 1.1;
                    break;
                case 34:
                    this.owner.scaleX /= 1.1;
                    break;
            }
        }
    }

    class Mesh2DRenderDemo {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.showApe();
            });
        }
        showApe() {
            Laya.Laya.loader.load("res/apes/monkey2.png", Laya.Loader.IMAGE).then(() => {
                var t = Laya.Laya.loader.getRes("res/apes/monkey2.png")._bitmap;
                var ape = new Laya.Sprite();
                let mesh2Drender = ape.addComponent(Laya.Mesh2DRender);
                mesh2Drender.sharedMesh = this.generateCircleVerticesAndUV(100, 100);
                mesh2Drender.texture = t;
                this.Main.box2D.addChild(ape);
                ape.pos(300, 300);
            });
        }
        generateCircleVerticesAndUV(radius, numSegments) {
            const twoPi = Math.PI * 2;
            let vertexs = new Float32Array((numSegments + 1) * 5);
            let index = new Uint16Array((numSegments + 1) * 3);
            var pos = 0;
            for (let i = 0; i < numSegments; i++, pos += 5) {
                const angle = twoPi * i / numSegments;
                var x = vertexs[pos + 0] = radius * Math.cos(angle);
                var y = vertexs[pos + 1] = radius * Math.sin(angle);
                vertexs[pos + 2] = 0;
                vertexs[pos + 3] = 0.5 + x / (2 * radius);
                vertexs[pos + 4] = 0.5 + y / (2 * radius);
            }
            vertexs[pos] = 0;
            vertexs[pos + 1] = 0;
            vertexs[pos + 2] = 0;
            vertexs[pos + 3] = 0.5;
            vertexs[pos + 4] = 0.5;
            for (var i = 1, ibIndex = 0; i < numSegments; i++, ibIndex += 3) {
                index[ibIndex] = i;
                index[ibIndex + 1] = i - 1;
                index[ibIndex + 2] = numSegments;
            }
            index[ibIndex] = numSegments - 1;
            index[ibIndex + 1] = 0;
            index[ibIndex + 2] = numSegments;
            var declaration = Laya.VertexMesh2D.getVertexDeclaration(["POSITION,UV"], false)[0];
            let mesh2D = Laya.Mesh2D.createMesh2DByPrimitive([vertexs], [declaration], index, Laya.IndexFormat.UInt16, [{ length: index.length, start: 0 }]);
            return mesh2D;
        }
    }

    class Trail2DRenderDemo {
        constructor(mainClass) {
            this.Main = null;
            this._lastX = 0;
            this.trail2Drender = null;
            this.Main = mainClass;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Stat.show();
                Laya.Laya.loader.load("res/apes/monkey2.png", Laya.Loader.IMAGE).then(() => {
                    let image = Laya.Loader.getRes("res/apes/monkey2.png");
                    this.showApe(image);
                });
            });
        }
        showApe(img) {
            let texture = img.bitmap;
            texture.wrapModeV = Laya.WrapMode.Repeat;
            texture.wrapModeU = Laya.WrapMode.Repeat;
            var ape = new Laya.Sprite();
            this.rotateSprite = ape;
            ape.texture = img;
            var ape2 = new Laya.Sprite();
            this.Main.box2D.addChild(ape);
            ape.addChild(ape2);
            ape2.texture = img;
            ape.pos(500, 500);
            ape2.pos(300, 300);
            var ape3 = new Laya.Sprite();
            ape2.addChild(ape3);
            ape3.pos(0, 0);
            this.trail2Drender = ape3.addComponent(Laya.Trail2DRender);
            this.trail2Drender.widthMultiplier = 50;
            this.trail2Drender.time = 0.5;
            this.trail2Drender.minVertexDistance = 1;
            this.trail2Drender.texture = img.bitmap;
            this.trail2Drender.color = Laya.Color.WHITE;
            Laya.Laya.timer.frameLoop(1, this, () => {
                this.rotateSprite.rotation += 1;
            });
        }
    }

    class TileMapLayerDemo {
        constructor(mainClass) {
            this.collectCellData = new Map();
            this.Main = mainClass;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Stat.show();
                this.PreloadingRes();
            });
        }
        PreloadingRes() {
            var resource = [
                "res/tilemapResource/TilesetVillageAbandoned.png",
                "res/tilemapResource/TilesetTowers.png",
            ];
            Laya.Laya.loader.load(resource, Laya.Handler.create(this, this.onPreLoadFinish));
        }
        onPreLoadFinish() {
            var scene = new Laya.Scene();
            this.Main.box2D.addChild(scene);
            var bg = new Laya.Sprite();
            scene.addChild(bg);
            this.createTileMapLayer(bg);
        }
        createTileMapLayer(bg) {
            let layer = bg.addComponent(Laya.TileMapLayer);
            let tileset = this.createTileSet();
            layer.tileSet = tileset;
            {
                for (var x = 0; x <= 5; x++) {
                    for (var y = 0; y <= 5; y++) {
                        layer.setCellData(x, y, this.collectCellData.get("paota2"), false);
                    }
                }
                for (var x = 5; x <= 10; x++) {
                    for (var y = 0; y <= 5; y++) {
                        layer.setCellData(x, y, this.collectCellData.get("paota3"), false);
                    }
                }
            }
            {
                layer.setCellData(5, 5, this.collectCellData.get("paota1"), false);
                layer.setCellData(5, 6, this.collectCellData.get("paota1_1"), false);
            }
            {
                layer.setCellData(7, 5, this.collectCellData.get("Ani_chengbao"), false);
                layer.setCellData(7, 6, this.collectCellData.get("Ani_shuijin"), false);
            }
            {
                layer.setCellData(10, 5, this.collectCellData.get("pofangzi"), false);
                layer.setCellData(10, 8, this.collectCellData.get("pofangzi2"), false);
                layer.setCellData(10, 10, this.collectCellData.get("shu1"), false);
                layer.setCellData(10, 12, this.collectCellData.get("liangtin"), false);
            }
        }
        createTileSet() {
            let tileSet = new Laya.TileSet();
            tileSet.tileShape = Laya.TileShape.TILE_SHAPE_SQUARE;
            tileSet.tileSize = new Laya.Vector2(64, 64);
            let textuer1 = Laya.Loader.getTexture2D("res/tilemapResource/TilesetTowers.png");
            let texture2 = Laya.Loader.getTexture2D("res/tilemapResource/TilesetVillageAbandoned.png");
            let group0 = this.createTileSetGroup("resource1", 0, textuer1, new Laya.Vector2(32, 32));
            let group1 = this.createTileSetGroup("resource2", 1, texture2, new Laya.Vector2(16, 16));
            tileSet.addTileSetCellGroup(group0);
            tileSet.addTileSetCellGroup(group1);
            this.collectCellDataToMap(group0, new Laya.Vector2(0, 0), new Laya.Vector2(1, 1), 0, "paota1");
            let cellData = this.collectCellDataToMap(group0, new Laya.Vector2(0, 0), new Laya.Vector2(1, 1), 1, "paota1_1");
            cellData.texture_origin = new Laya.Vector2(10, 0);
            cellData.colorModulate = new Laya.Color(1.0, 0.0, 0.0, 1.0);
            this.collectCellDataToMap(group0, new Laya.Vector2(0, 1), new Laya.Vector2(1, 1), 0, "paota2ori");
            cellData = this.collectCellDataToMap(group0, new Laya.Vector2(0, 1), new Laya.Vector2(1, 1), 1, "paota2");
            this.collectCellDataToMap(group0, new Laya.Vector2(0, 2), new Laya.Vector2(1, 1), 0, "paota3");
            {
                let cellData = this.collectCellDataToMap(group0, new Laya.Vector2(6, 2), new Laya.Vector2(1, 1), 1, "Ani_chengbao");
                let alternative = cellData.cellowner;
                alternative.animationMode = Laya.TileAnimationMode.DEFAULT;
                alternative.animation_columns = 0;
                alternative.animation_separation = new Laya.Vector2(0, 0);
                alternative.animation_speed = 1;
                alternative.animationFrams = [1, 1, 1];
            }
            {
                let cellData = this.collectCellDataToMap(group0, new Laya.Vector2(9, 2), new Laya.Vector2(1, 1), 1, "Ani_shuijin");
                let alternative = cellData.cellowner;
                alternative.animationMode = Laya.TileAnimationMode.DEFAULT;
                alternative.animation_columns = 0;
                alternative.animation_separation = new Laya.Vector2(0, 0);
                alternative.animation_speed = 1;
                alternative.animationFrams = [1, 1, 1];
            }
            {
                let cellData = this.collectCellDataToMap(group1, new Laya.Vector2(0, 0), new Laya.Vector2(4, 3), 0, "pofangzi");
                cellData = this.collectCellDataToMap(group1, new Laya.Vector2(0, 0), new Laya.Vector2(4, 3), 1, "pofangzi2");
                cellData.colorModulate = new Laya.Color(1, 0, 0, 1);
            }
            {
                let cellData = this.collectCellDataToMap(group1, new Laya.Vector2(0, 6), new Laya.Vector2(4, 3), 0, "shu1");
                cellData.cellowner.animation_columns = 1;
                cellData.cellowner.animationFrams = [1, 1];
            }
            {
                let cellData = this.collectCellDataToMap(group1, new Laya.Vector2(17, 0), new Laya.Vector2(3, 3), 0, "liangtin");
            }
            return tileSet;
        }
        createTileSetGroup(name, id, texture, textureRegion) {
            let setgroup = new Laya.TileSetCellGroup();
            setgroup.id = id;
            setgroup.name = name;
            setgroup.atlas = texture;
            setgroup.textureRegionSize = textureRegion;
            return setgroup;
        }
        collectCellDataToMap(tileSetGroup, groupLocalPos, cellSize, cellDataIndex, cellDataKey) {
            let alternative = tileSetGroup.addAlternaltive(groupLocalPos.x, groupLocalPos.y, cellSize);
            let cellData = alternative.addCellData(cellDataIndex);
            this.collectCellData.set(cellDataKey, cellData);
            return cellData;
        }
    }

    class RenderCMD2DDemo {
        constructor(maincls) {
            this.Main = null;
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                this.showApe();
            });
        }
        showApe() {
            Laya.Laya.loader.load("res/apes/monkey2.png", Laya.Loader.IMAGE).then(() => {
                let rtMesh = new Laya.RenderTexture(500, 500, Laya.RenderTargetFormat.R8G8B8A8, Laya.RenderTargetFormat.None);
                let mesh = this.generateCircleVerticesAndUV(100, 100);
                var t = Laya.Laya.loader.getRes("res/apes/monkey2.png")._bitmap;
                let testMesh2DCMD = true;
                let testRenderElementCMD = true;
                let testBLitQuadRTCMD = true;
                if (testMesh2DCMD) {
                    let cmd = RenderCMD2DDemo.cmd = new Laya.CommandBuffer2D("test");
                    cmd.setRenderTarget(rtMesh, true, Laya.Color.YELLOW);
                    let mat = Laya.Matrix.TEMP;
                    mat.setMatrix(0, 0, 1, 1, 0, 0, 0, 0, 0);
                    cmd.drawMesh(mesh, mat, t);
                    cmd.apply(true);
                    Laya.Utils3D.uint8ArrayToArrayBufferAsync(rtMesh).then((res) => {
                        console.log(res);
                    });
                }
                let sp1 = new Laya.Sprite();
                sp1.texture = new Laya.Texture(rtMesh);
                sp1.pos(300, 10);
                sp1.scale(0.5, 0.5);
                this.Main.box2D.addChild(sp1);
                let rtMeshRender = new Laya.RenderTexture(500, 500, Laya.RenderTargetFormat.R8G8B8A8, Laya.RenderTargetFormat.None);
                if (testRenderElementCMD) {
                    var ape = new Laya.Sprite();
                    let mesh2Drender = ape.addComponent(Laya.Mesh2DRender);
                    mesh2Drender.sharedMesh = mesh;
                    mesh2Drender.color = Laya.Color.BLUE;
                    mesh2Drender.texture = t;
                    let cmd = RenderCMD2DDemo.cmd = new Laya.CommandBuffer2D("test");
                    cmd.setRenderTarget(rtMeshRender, true, Laya.Color.YELLOW);
                    let mat = new Laya.Matrix();
                    mat.setTranslate(100, 100);
                    cmd.drawRenderElement(mesh2Drender._renderElements[0], mat);
                    mat.setTranslate(100, 300);
                    cmd.apply(true);
                    Laya.Utils3D.uint8ArrayToArrayBufferAsync(rtMeshRender).then((res) => {
                        console.log(res);
                    });
                }
                let sp2 = new Laya.Sprite();
                sp2.texture = new Laya.Texture(rtMeshRender);
                sp2.pos(600, 10);
                sp2.scale(0.5, 0.5);
                this.Main.box2D.addChild(sp2);
                let rtBlit = new Laya.RenderTexture(500, 500, Laya.RenderTargetFormat.R8G8B8A8, Laya.RenderTargetFormat.None);
                if (testBLitQuadRTCMD) {
                    let cmd = RenderCMD2DDemo.cmd = new Laya.CommandBuffer2D("test");
                    cmd.setRenderTarget(rtBlit, true, Laya.Color.YELLOW);
                    cmd.blitTextureQuad(t, rtBlit, new Laya.Vector4(0, 0, 0.3, 0.3));
                    cmd.blitTextureQuad(t, rtBlit, new Laya.Vector4(0.3, 0.3, 0.5, 0.5));
                    cmd.blitTextureQuad(t, rtBlit, new Laya.Vector4(0.8, 0.8, 0.2, 0.2));
                    cmd.apply(true);
                    Laya.Utils3D.uint8ArrayToArrayBufferAsync(rtBlit).then((res) => {
                        console.log(res);
                    });
                }
                let sp3 = new Laya.Sprite();
                sp3.texture = new Laya.Texture(rtBlit);
                sp3.pos(900, 10);
                sp3.scale(0.5, 0.5);
                this.Main.box2D.addChild(sp3);
            });
        }
        generateCircleVerticesAndUV(radius, numSegments) {
            const twoPi = Math.PI * 2;
            let vertexs = new Float32Array((numSegments + 1) * 5);
            let index = new Uint16Array((numSegments + 1) * 3);
            var pos = 0;
            for (let i = 0; i < numSegments; i++, pos += 5) {
                const angle = twoPi * i / numSegments;
                var x = vertexs[pos + 0] = radius * Math.cos(angle);
                var y = vertexs[pos + 1] = radius * Math.sin(angle);
                vertexs[pos + 2] = 0;
                vertexs[pos + 3] = 0.5 + x / (2 * radius);
                vertexs[pos + 4] = 0.5 + y / (2 * radius);
            }
            vertexs[pos] = 0;
            vertexs[pos + 1] = 0;
            vertexs[pos + 2] = 0;
            vertexs[pos + 3] = 0.5;
            vertexs[pos + 4] = 0.5;
            for (var i = 1, ibIndex = 0; i < numSegments; i++, ibIndex += 3) {
                index[ibIndex] = i;
                index[ibIndex + 1] = i - 1;
                index[ibIndex + 2] = numSegments;
            }
            index[ibIndex] = numSegments - 1;
            index[ibIndex + 1] = 0;
            index[ibIndex + 2] = numSegments;
            var declaration = Laya.VertexMesh2D.getVertexDeclaration(["POSITION,UV"], false)[0];
            let mesh2D = Laya.Mesh2D.createMesh2DByPrimitive([vertexs], [declaration], index, Laya.IndexFormat.UInt16, [{ length: index.length, start: 0 }]);
            return mesh2D;
        }
    }

    class Material2DDemo {
        constructor(mainClass) {
            this.Main = null;
            this.Main = mainClass;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                Laya.Laya.stage.bgColor = "#232628";
                let res = ["res/shaders/2d/custom2DShader_1.shader", "res/apes/monkey3.png"];
                this.scene = new Laya.Scene();
                this.Main.box2D.addChild(this.scene);
                Laya.Laya.loader.load(res).then(() => {
                    this.set2DCustomMaterial();
                });
            });
        }
        set2DCustomMaterial() {
            let customShaderSp = new Laya.Sprite();
            customShaderSp.loadImage("res/apes/monkey3.png");
            this.scene.addChild(customShaderSp);
            this.loadCustom2DShader(customShaderSp);
            Laya.Laya.loader.load("res/2DRender/customMaterial_1.lmat").then((mat) => {
                let customMaterialSp = new Laya.Sprite();
                customMaterialSp.pos(200, 0);
                this.scene.addChild(customMaterialSp);
                customMaterialSp.loadImage("res/apes/monkey3.png");
                customMaterialSp.graphics.material = mat;
                customMaterialSp.graphics.useSpriteState = false;
            });
        }
        loadCustom2DShader(sp) {
            Laya.Laya.loader.load("res/shaders/2d/custom2DShader_0.shader").then(() => {
                let mat = new Laya.Material();
                mat.setShaderName("custom2DShader_0");
                Laya.Graphics.add2DGlobalUniformData(Laya.Shader3D.propertyNameToID("u_GlobalColor"), "u_GlobalColor", Laya.ShaderDataType.Color);
                this.scene.setglobalRenderData(Laya.Shader3D.propertyNameToID("u_GlobalColor"), Laya.ShaderDataType.Color, new Laya.Color(0.0, 1.0, 0.0, 1.0));
                sp.graphics.material = mat;
            });
        }
    }

    class Physics_Tumbler_Shapes {
        constructor(maincls) {
            this.count = 0;
            this.totalBox = 200;
            this.Main = null;
            this.Main = maincls;
            Laya.Config.isAntialias = true;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_AUTO;
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Physics2D.I.start();
                this.createBox();
                this.eventListener();
            });
        }
        createBox() {
            this._scene = new Laya.Scene();
            this.Main.box2D.addChild(this._scene);
            let man = this._scene.getComponentElementManager(Laya.Physics2DWorldManager.__managerName);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.Shape);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.Joint);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.CenterOfMass);
            const width = 300, height = 20;
            const posx = Laya.Laya.stage.width / 2, posy = Laya.Laya.stage.height / 2;
            let off = -width / 2 - height;
            let box = new Laya.Sprite();
            box.size(width + height * 2, width + height * 2);
            box.pos(posx, posy);
            this._scene.addChild(box);
            let boxBody = box.addComponent(Laya.RigidBody);
            boxBody.applyOwnerColliderComponent = false;
            let shapes = [];
            let box1Shape = new Laya.BoxShape2D();
            box1Shape.width = width + height * 2;
            box1Shape.height = height;
            box1Shape.x = off;
            box1Shape.y = off;
            let box2Shape = new Laya.BoxShape2D();
            box2Shape.width = width + height * 2;
            box2Shape.height = height;
            box2Shape.x = off;
            box2Shape.y = width + height + off;
            let box3Shape = new Laya.BoxShape2D();
            box3Shape.width = height;
            box3Shape.height = width + height * 2;
            box3Shape.x = off;
            box3Shape.y = off;
            let box4Shape = new Laya.BoxShape2D();
            box4Shape.width = height;
            box4Shape.height = width + height * 2;
            box4Shape.x = width + height + off;
            box4Shape.y = off;
            shapes.push(box1Shape);
            shapes.push(box2Shape);
            shapes.push(box3Shape);
            shapes.push(box4Shape);
            boxBody.shapes = shapes;
            let revoluteJoint = new Laya.RevoluteJoint();
            revoluteJoint.motorSpeed = 0.05 * Math.PI;
            revoluteJoint.maxMotorTorque = 1e8;
            revoluteJoint.enableMotor = true;
            box.addComponentInstance(revoluteJoint);
        }
        addMiniBox() {
            if (this.count >= this.totalBox) {
                return;
            }
            let sp = new Laya.Sprite();
            this._scene.addChild(sp);
            sp.x = Laya.Laya.stage.width / 2;
            sp.y = Laya.Laya.stage.height / 2;
            let boxBody = sp.addComponent(Laya.RigidBody);
            boxBody.applyOwnerColliderComponent = false;
            let boxshape = new Laya.BoxShape2D();
            boxshape.width = 5;
            boxshape.height = 5;
            let shapes = [boxshape];
            boxBody.shapes = shapes;
            this.count++;
        }
        eventListener() {
            let label = this.label = Laya.Laya.stage.addChild(new Laya.Label("双击屏幕，将会产生100个新的小刚体"));
            label.top = 20;
            label.right = 20;
            label.fontSize = 16;
            label.color = "#e69999";
            Laya.Laya.stage.on(Laya.Event.DOUBLE_CLICK, this, () => {
                this.totalBox += 100;
            });
            Laya.Laya.timer.frameLoop(1, this, this.addMiniBox);
        }
        dispose() {
            Laya.Laya.stage.offAll(Laya.Event.DOUBLE_CLICK);
            Laya.Laya.stage.removeChild(this.label);
        }
    }

    class Physics_CollisionFiltering_Shapes {
        constructor(maincls) {
            this.Main = null;
            this.preMovementX = 0;
            this.preMovementY = 0;
            this.Main = maincls;
            Laya.Config.isAntialias = true;
            Laya.Laya.init(1200, 700).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_AUTO;
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Physics2D.I.start();
                this.createHouse();
                for (let i = 1; i <= 3; i++) {
                    this.createBox(300, 300, 20, 20, i);
                    this.createTriangle(500, 300, 20, i);
                    this.createCircle(700, 300, 10, i);
                }
            });
        }
        createHouse() {
            this._scene = new Laya.Scene();
            this.Main.box2D.addChild(this._scene);
            let man = this._scene.getComponentElementManager(Laya.Physics2DWorldManager.__managerName);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.Shape);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.Joint);
            let house = new Laya.Sprite();
            this._scene.addChild(house);
            let rigidbody = house.addComponent(Laya.StaticCollider);
            let chainShape = new Laya.ChainShape2D();
            chainShape.loop = true;
            chainShape.datas = [600, 50, 100, 200, 100, 600, 1100, 600, 1100, 200];
            rigidbody.shapes = [chainShape];
        }
        createBox(posx, posy, width, height, ratio) {
            let box = new Laya.Sprite();
            box.on(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
            this._scene.addChild(box);
            box.pos(posx, posy).size(width * ratio, height * ratio);
            let rigidbody = box.addComponent(Laya.RigidBody);
            rigidbody.applyOwnerColliderComponent = false;
            let boxShape = new Laya.BoxShape2D();
            boxShape.width = width * ratio;
            boxShape.height = height * ratio;
            let filter = new Laya.FilterData();
            filter.category = Physics_CollisionFiltering_Shapes.k_boxCategory;
            filter.mask = Physics_CollisionFiltering_Shapes.k_boxMask;
            this.addGroup(ratio, filter);
            boxShape.filterData = filter;
            rigidbody.shapes = [boxShape];
        }
        createTriangle(posx, posy, side, ratio) {
            let triangle = new Laya.Sprite();
            triangle.on(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
            this._scene.addChild(triangle);
            triangle.pos(posx, posy).size(side * ratio, side * ratio);
            let rigidbody = triangle.addComponent(Laya.RigidBody);
            rigidbody.applyOwnerColliderComponent = false;
            let polygonShape = new Laya.PolygonShape2D();
            let filterdata = new Laya.FilterData();
            polygonShape.datas = [0, 0, 0, side * ratio, side * ratio, 0];
            filterdata.category = Physics_CollisionFiltering_Shapes.k_triangleCategory;
            filterdata.mask = Physics_CollisionFiltering_Shapes.k_triangleMask;
            this.addGroup(ratio, filterdata);
            polygonShape.filterData = filterdata;
            rigidbody.shapes = [polygonShape];
        }
        createCircle(posx, posy, radius, ratio) {
            let circle = new Laya.Sprite();
            circle.on(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
            this._scene.addChild(circle);
            circle.pos(posx, posy).size(radius * 2 * ratio, radius * 2 * ratio);
            circle.pivot(0.5, 0.5);
            let rigidbody = circle.addComponent(Laya.RigidBody);
            rigidbody.applyOwnerColliderComponent = false;
            let circleShape = new Laya.CircleShape2D();
            circleShape.radius = radius * ratio;
            let filterdata = new Laya.FilterData();
            filterdata.category = Physics_CollisionFiltering_Shapes.k_circleCategory;
            filterdata.mask = Physics_CollisionFiltering_Shapes.k_circleMask;
            this.addGroup(ratio, filterdata);
            circleShape.filterData = filterdata;
            rigidbody.shapes = [circleShape];
        }
        addGroup(ratio, filterdata) {
            switch (ratio) {
                case 1:
                    filterdata.group = Physics_CollisionFiltering_Shapes.k_smallGroup;
                    break;
                case 2:
                    filterdata.group = Physics_CollisionFiltering_Shapes.k_middleGroup;
                    break;
                case 3:
                    filterdata.group = Physics_CollisionFiltering_Shapes.k_largeGroup;
                    break;
            }
        }
        mouseDown(e) {
            this.curTarget = e.target;
            let mouseJoint = this.curTarget.addComponent(Laya.MouseJoint);
            Laya.Laya.timer.callLater(mouseJoint, mouseJoint._onMouseDown);
            Laya.Laya.stage.on(Laya.Event.MOUSE_UP, this, this.destoryJoint);
            Laya.Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.destoryJoint);
        }
        mouseMove(e) {
            let movementX = e.nativeEvent.movementX;
            let movementY = e.nativeEvent.movementY;
            this.preMovementX = movementX;
            this.preMovementY = movementY;
            this.curTarget.pos(Laya.Laya.stage.mouseX, Laya.Laya.stage.mouseY);
        }
        mouseUp() {
            Laya.Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
            Laya.Laya.stage.off(Laya.Event.MOUSE_UP, this, this.mouseUp);
            Laya.Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.mouseUp);
            let rigidbody = this.curTarget.getComponent(Laya.RigidBody);
            rigidbody.type = "dynamic";
            rigidbody.linearVelocity = { x: this.preMovementX, y: this.preMovementY };
            this.curTarget = null;
        }
        destoryJoint() {
            Laya.Laya.stage.off(Laya.Event.MOUSE_UP, this, this.destoryJoint);
            Laya.Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.destoryJoint);
            let mouseJoint = this.curTarget.getComponent(Laya.MouseJoint);
            mouseJoint.destroy();
            this.curTarget = null;
        }
        dispose() {
            Laya.Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
            Laya.Laya.stage.off(Laya.Event.MOUSE_UP, this, this.mouseUp);
            Laya.Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.mouseUp);
            Laya.Laya.stage.off(Laya.Event.MOUSE_UP, this, this.destoryJoint);
            Laya.Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.destoryJoint);
        }
    }
    Physics_CollisionFiltering_Shapes.k_smallGroup = 1;
    Physics_CollisionFiltering_Shapes.k_middleGroup = 0;
    Physics_CollisionFiltering_Shapes.k_largeGroup = -1;
    Physics_CollisionFiltering_Shapes.k_triangleCategory = 0x2;
    Physics_CollisionFiltering_Shapes.k_boxCategory = 0x4;
    Physics_CollisionFiltering_Shapes.k_circleCategory = 0x8;
    Physics_CollisionFiltering_Shapes.k_triangleMask = 0xF;
    Physics_CollisionFiltering_Shapes.k_boxMask = 0xF ^ Physics_CollisionFiltering_Shapes.k_circleCategory;
    Physics_CollisionFiltering_Shapes.k_circleMask = Physics_CollisionFiltering_Shapes.k_triangleCategory | Physics_CollisionFiltering_Shapes.k_boxCategory | 0x01;

    class Physics_CollisionEvent_Shapes {
        constructor(maincls) {
            this.Main = null;
            this.count = 7;
            this.bodys = [];
            this.touching = [];
            this.Main = maincls;
            Laya.Config.isAntialias = true;
            Laya.Laya.init(1200, 700).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_AUTO;
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Physics2D.I.start();
                this.createSensor();
            });
        }
        createSensor() {
            this._scene = new Laya.Scene();
            this.Main.box2D.addChild(this._scene);
            let man = this._scene.getComponentElementManager(Laya.Physics2DWorldManager.__managerName);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.Shape);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.Joint);
            let ground = new Laya.Sprite();
            ground.name = "ground";
            this._scene.addChild(ground);
            let groundBody = new Laya.StaticCollider();
            ground.addComponentInstance(groundBody);
            let chainShape = new Laya.ChainShape2D();
            chainShape.datas = [50, 400, 50, 600, 1050, 600, 1050, 400];
            groundBody.shapes = [chainShape];
            let sensor = new Laya.Sprite();
            sensor.pos(450, 300);
            sensor.name = "sensor";
            this._scene.addChild(sensor);
            let sensorCol = sensor.addComponent(Laya.StaticCollider);
            let circleShape = new Laya.CircleShape2D();
            circleShape.isSensor = true;
            circleShape.radius = 100;
            sensorCol.shapes = [circleShape];
            this.sensorCollider = sensorCol;
            for (let i = 0, len = this.count; i < len; i++) {
                let sp = new Laya.Sprite();
                sp.name = "ball" + i;
                this._scene.addChild(sp);
                sp.pos(350 + i * 50, 200).size(40, 40);
                let rb = sp.addComponent(Laya.RigidBody);
                this.bodys.push(rb);
                this.touching[i] = false;
                rb.getBody().GetUserData().pointer = i;
                let circleShape = new Laya.CircleShape2D();
                circleShape.radius = 20;
                circleShape.x = circleShape.y = 20;
                rb.shapes = [circleShape];
                sp.addComponent(Laya.MouseJoint);
                sp.on(Laya.Event.TRIGGER_ENTER, this, this.onTriggerEnter);
                sp.on(Laya.Event.TRIGGER_EXIT, this, this.onTriggerExit);
            }
            Laya.Laya.physicsTimer.frameLoop(1, this, this.onTriggerStay);
        }
        onTriggerEnter(colliderB, colliderA, contact) {
            if (colliderB === this.sensorCollider) {
                console.log("onTriggerEnter");
                let bodyB = colliderA.owner.getComponent(Laya.RigidBody);
                let index = bodyB.getBox2DBody().GetUserData().pointer;
                this.touching[index] = true;
            }
        }
        onTriggerStay() {
            let bodys = this.bodys, body;
            for (let i = 0, len = this.count; i < len; i++) {
                body = bodys[i];
                if (!this.touching[i]) {
                    continue;
                }
                let bodyA = this.sensorCollider.owner.getComponent(Laya.StaticCollider);
                let bodyB = body.owner.getComponent(Laya.RigidBody);
                let position = bodyB.getWorldCenter();
                let center = bodyA.getWorldPoint(this.sensorCollider.x, this.sensorCollider.y);
                let x = center.x - position.x;
                let y = center.y - position.y;
                let vec = new Laya.Vector2(x, y);
                if (Laya.Vector2.scalarLength(vec) < 1E-5) {
                    continue;
                }
                Laya.Vector2.normalize(vec, vec);
                bodyB.applyForce(position, {
                    x: vec.x * 100,
                    y: vec.y * 100
                });
            }
        }
        onTriggerExit(colliderB, colliderA, contact) {
            if (colliderB === this.sensorCollider) {
                console.log("onTriggerExit");
                let bodyB = colliderA.owner.getComponent(Laya.RigidBody);
                let index = bodyB.getBody().GetUserData().pointer;
                this.touching[index] = false;
            }
        }
        dispose() {
            let sensor = this.sensorCollider.owner;
            sensor.off(Laya.Event.TRIGGER_ENTER, this, this.onTriggerEnter);
            sensor.off(Laya.Event.TRIGGER_EXIT, this, this.onTriggerExit);
            Laya.Laya.physicsTimer.clearAll(this);
        }
    }

    class Physics_Bridge_Shapes {
        constructor(maincls) {
            this.Main = null;
            this.ecount = 30;
            this.TempVec = new Laya.Vector2();
            this.Main = maincls;
            Laya.Config.isAntialias = true;
            Laya.Laya.init(1200, 700).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_AUTO;
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Physics2D.I.start();
                this.createBridge();
                this.eventListener();
            });
        }
        createBridge() {
            this._scene = new Laya.Scene();
            this.Main.box2D.addChild(this._scene);
            let man = this._scene.getComponentElementManager(Laya.Physics2DWorldManager.__managerName);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.Shape);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.Joint);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.CenterOfMass);
            const startPosX = 250, startPosY = 450;
            let ground = new Laya.Sprite();
            let groundBody = new Laya.StaticCollider();
            ground.addComponentInstance(groundBody);
            let chainShape = new Laya.ChainShape2D();
            chainShape.datas = [50, 600, 1050, 600];
            let boxShape = new Laya.BoxShape2D();
            boxShape.width = 100;
            boxShape.width = 50;
            let groundShapes = [];
            groundShapes.push(chainShape);
            groundShapes.push(boxShape);
            groundBody.shapes = groundShapes;
            this._scene.addChild(ground);
            let point1 = new Laya.Sprite();
            this._scene.addChild(point1);
            point1.pos(startPosX, startPosY);
            let pointRB1 = new Laya.StaticCollider();
            point1.addComponentInstance(pointRB1);
            let preBody = pointRB1;
            let width = 20, height = 2.5;
            for (let i = 0; i < this.ecount; i++) {
                let sp = new Laya.Sprite();
                this._scene.addChild(sp);
                sp.pos(startPosX + i * width, startPosY);
                let rb = sp.addComponent(Laya.RigidBody);
                rb.applyOwnerColliderComponent = false;
                let boxShape = new Laya.BoxShape2D();
                let shapes = [];
                shapes.push(boxShape);
                boxShape.width = width;
                boxShape.height = height;
                boxShape.density = 20;
                boxShape.friction = 0.2;
                boxShape.y = -height / 2;
                rb.shapes = shapes;
                let rj = new Laya.RevoluteJoint();
                rj.otherBody = preBody;
                sp.addComponentInstance(rj);
                preBody = rb;
            }
            let point2 = new Laya.Sprite();
            this._scene.addChild(point2);
            point2.pos(startPosX + this.ecount * width, startPosY);
            let pointRB2 = new Laya.StaticCollider();
            point2.addComponentInstance(pointRB2);
            let rj = new Laya.RevoluteJoint();
            rj.otherBody = preBody;
            point2.addComponentInstance(rj);
            for (let i = 0; i < 2; i++) {
                let sp = new Laya.Sprite();
                this._scene.addChild(sp);
                sp.pos(350 + 100 * i, 300);
                let rb = sp.addComponent(Laya.RigidBody);
                rb.applyOwnerColliderComponent = false;
                rb.bullet = true;
                let polyShape = new Laya.PolygonShape2D();
                polyShape.datas = [-10, 0, 10, 0, 0, 30];
                polyShape.density = 1.0;
                let shapes = [];
                shapes.push(polyShape);
                rb.shapes = shapes;
            }
            for (let i = 0; i < 2; i++) {
                let sp = new Laya.Sprite();
                this._scene.addChild(sp);
                sp.pos(400 + 150 * i, 350);
                let rb = sp.addComponent(Laya.RigidBody);
                rb.applyOwnerColliderComponent = false;
                rb.bullet = true;
                let circleShape = new Laya.CircleShape2D();
                circleShape.radius = 10;
                rb.shapes = [circleShape];
            }
        }
        eventListener() {
            Laya.Laya.stage.on(Laya.Event.CLICK, this, () => {
                let tempVec = this.TempVec;
                let targetX = 300 + Math.random() * 400, targetY = 500;
                let newBall = new Laya.Sprite();
                this._scene.addChild(newBall);
                let circleBody = newBall.addComponent(Laya.RigidBody);
                circleBody.applyOwnerColliderComponent = false;
                circleBody.bullet = true;
                let circleShape = new Laya.CircleShape2D();
                let shapes = [circleShape];
                circleShape.radius = 5;
                circleShape.x = Laya.Laya.stage.mouseX;
                circleShape.y = Laya.Laya.stage.mouseY;
                tempVec.x = targetX - circleShape.x;
                tempVec.y = targetY - circleShape.y;
                Laya.Vector2.normalize(tempVec, tempVec);
                Laya.Vector2.scale(tempVec, 25, tempVec);
                Laya.Vector2.scale(tempVec, Laya.Physics2DOption.pixelRatio, tempVec);
                circleBody.shapes = shapes;
                circleBody.linearVelocity = tempVec;
                Laya.Laya.timer.frameOnce(120, this, function () {
                    newBall.destroy();
                });
            });
            let label = this.label = Laya.Laya.stage.addChild(new Laya.Label("单击屏幕产生新的小球刚体，击向bridge的随机位置"));
            label.top = 20;
            label.right = 20;
            label.fontSize = 16;
            label.color = "#e69999";
        }
        dispose() {
            Laya.Laya.stage.offAll(Laya.Event.CLICK);
            Laya.Laya.stage.removeChild(this.label);
        }
    }

    const dampingRatio = 0.5;
    const frequencyHz = 10.0;
    class Physics_Strandbeests_Shapes {
        constructor(maincls) {
            this.Main = null;
            this.scale = 2.5;
            this.pos = [550, 200];
            this.TempVec = new Laya.Vector2();
            this.drawFlags = ["Shape", "Joint", "AABB", "Pair", "CenterOfMass"];
            this.Main = maincls;
            Laya.Config.isAntialias = true;
            Laya.Laya.init(1200, 700).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_AUTO;
                Laya.Laya.stage.bgColor = "#232628";
                Laya.Physics2D.I.start();
                this.Construct();
                Laya.Laya.loader.load(["res/ui/checkbox (1).png"], Laya.Handler.create(this, this.eventListener));
            });
        }
        Construct() {
            this._scene = new Laya.Scene();
            this.Main.box2D.addChild(this._scene);
            let man = this._scene.getComponentElementManager(Laya.Physics2DWorldManager.__managerName);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.Shape);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.Joint);
            man.enableDebugDraw(true, Laya.EPhycis2DBlit.CenterOfMass);
            let ground = new Laya.Sprite();
            ground.name = "ground";
            this._scene.addChild(ground);
            let rigidbody = new Laya.StaticCollider();
            ground.addComponentInstance(rigidbody);
            let chainShape = new Laya.ChainShape2D();
            chainShape.datas = [50, 200, 50, 570, 1050, 570, 1050, 200];
            rigidbody.shapes = [chainShape];
            for (let i = 1; i <= 32; i++) {
                let small = new Laya.Sprite();
                small.name = "ground" + i;
                small.pos(i * 30 + 50, 570 - 5 * this.scale);
                small.addComponent(Laya.RigidBody);
                let smRd = small.getComponent(Laya.RigidBody);
                smRd.applyOwnerColliderComponent = false;
                this._scene.addChild(small);
                let circleshape = new Laya.CircleShape2D();
                circleshape.radius = 2.5 * this.scale;
                smRd.shapes = [circleshape];
            }
            let chassis = this.chassis = new Laya.Sprite();
            chassis.size(50 * this.scale, 20 * this.scale);
            chassis.anchorX = chassis.anchorY = 0.5;
            chassis.pos(this.pos[0], this.pos[1]);
            this._scene.addChild(chassis);
            let chassisBody = chassis.addComponent(Laya.RigidBody);
            chassisBody.applyOwnerColliderComponent = false;
            let boxshape = new Laya.BoxShape2D();
            let filter = new Laya.FilterData();
            filter.group = -1;
            boxshape.filterData = filter;
            boxshape.density = 1;
            boxshape.width = 50 * this.scale;
            boxshape.height = 20 * this.scale;
            chassisBody.shapes = [boxshape];
            let wheel = this.wheel = new Laya.Sprite();
            wheel.pos(chassis.x, chassis.y);
            this._scene.addChild(wheel);
            let wheelBody = wheel.addComponent(Laya.RigidBody);
            wheelBody.applyOwnerColliderComponent = false;
            let circleshape = new Laya.CircleShape2D();
            circleshape.filterData = filter;
            circleshape.density = 1;
            circleshape.radius = 16 * this.scale;
            wheelBody.shapes = [circleshape];
            let motorJoint = this.motorJoint = new Laya.RevoluteJoint();
            motorJoint.otherBody = chassisBody;
            motorJoint.collideConnected = false;
            motorJoint.motorSpeed = 2.0;
            motorJoint.maxMotorTorque = 400.0;
            motorJoint.enableMotor = true;
            wheel.addComponentInstance(motorJoint);
            let wheelAnchor = [0, 8 * this.scale];
            this.createLeg(-1, wheelAnchor, 0);
            this.createLeg(1, wheelAnchor, 0);
            this.createLeg(-1.0, wheelAnchor, Laya.Utils.toRadian(120.0));
            this.createLeg(1.0, wheelAnchor, Laya.Utils.toRadian(120.0));
            this.createLeg(-1.0, wheelAnchor, Laya.Utils.toRadian(-120.0));
            this.createLeg(1.0, wheelAnchor, Laya.Utils.toRadian(-120.0));
        }
        getDistance(body, p, body1, p1) {
            let g1 = body.getWorldPoint(p[0], p[1]);
            let x = g1.x;
            let y = g1.y;
            g1 = body1.getWorldPoint(p1[0], p1[1]);
            return Math.sqrt(Math.pow(g1.x - x, 2) + Math.pow(g1.y - y, 2));
        }
        getRotateVector(rotate, p) {
            let cos = Math.cos(rotate);
            let sin = Math.sin(rotate);
            let x = cos * p[0] - sin * p[1];
            let y = sin * p[0] + cos * p[1];
            return [x, y];
        }
        createDistanceJoint(selfBody, selfAnchor, otherBody, otherAnchor, distance) {
            let distanceJoint = new Laya.DistanceJoint();
            distanceJoint.otherBody = otherBody;
            distanceJoint.otherAnchor = otherAnchor;
            distanceJoint.selfAnchor = selfAnchor;
            distanceJoint.frequency = frequencyHz;
            distanceJoint.damping = dampingRatio;
            distanceJoint.maxLength = distanceJoint.minLength = distanceJoint.length = distance;
            selfBody.owner.addComponentInstance(distanceJoint);
            return distanceJoint;
        }
        createLeg(s, wheelAnchor, rotate) {
            const wheelBody = this.wheel.getComponent(Laya.RigidBody);
            const chassisBody = this.chassis.getComponent(Laya.RigidBody);
            const p1 = [54, -61];
            const p2 = [72, -12];
            const p3 = [43, -19];
            const p4 = [31, 0];
            const p5 = [60, 15];
            const p6 = [25, 37];
            let leg1 = new Laya.Sprite();
            leg1.pos(this.chassis.x, this.chassis.y + 16 * this.scale);
            leg1.scale(s * this.scale, -this.scale);
            this._scene.addChild(leg1);
            let leg2 = new Laya.Sprite();
            leg2.scale(s * this.scale, -this.scale);
            leg2.pos(this.chassis.x, this.chassis.y);
            this._scene.addChild(leg2);
            let legBody1 = leg1.addComponent(Laya.RigidBody);
            legBody1.applyOwnerColliderComponent = false;
            legBody1.angularDamping = 10;
            let polyShape1 = new Laya.PolygonShape2D();
            let filter = new Laya.FilterData();
            filter.group = -1;
            polyShape1.filterData = filter;
            polyShape1.density = 1;
            polyShape1.datas = p1.concat(p2).concat(p3);
            legBody1.shapes = [polyShape1];
            let legBody2 = leg2.addComponent(Laya.RigidBody);
            legBody2.applyOwnerColliderComponent = false;
            legBody2.angularDamping = 10;
            let polyShape2 = new Laya.PolygonShape2D();
            polyShape2.filterData = filter;
            polyShape2.density = 1;
            polyShape2.datas = p4.concat(p5).concat(p6);
            legBody2.shapes = [polyShape2];
            let distance = this.getDistance(legBody1, p2, legBody2, p5);
            this.createDistanceJoint(legBody1, p2, legBody2, p5, distance);
            distance = this.getDistance(legBody1, p3, legBody2, p4);
            this.createDistanceJoint(legBody1, p3, legBody2, p4, distance);
            let anchor = this.getRotateVector(rotate, wheelAnchor);
            distance = this.getDistance(legBody1, p3, wheelBody, wheelAnchor);
            this.createDistanceJoint(legBody1, p3, wheelBody, anchor, distance);
            distance = this.getDistance(legBody2, p6, wheelBody, wheelAnchor);
            this.createDistanceJoint(legBody2, p6, wheelBody, anchor, distance);
            let revoluteJoint = new Laya.RevoluteJoint();
            revoluteJoint.otherBody = chassisBody;
            revoluteJoint.anchor = p4;
            revoluteJoint.collideConnected = false;
            leg2.addComponentInstance(revoluteJoint);
        }
        eventListener() {
            Laya.Laya.stage.on(Laya.Event.DOUBLE_CLICK, this, () => {
                this.motorJoint.motorSpeed = -this.motorJoint.motorSpeed;
            });
            let index = 0;
            Laya.Laya.stage.on(Laya.Event.CLICK, this, () => {
                let tempVec = this.TempVec;
                let newBall = new Laya.Sprite();
                newBall.pos(Laya.Laya.stage.mouseX, Laya.Laya.stage.mouseY);
                this._scene.addChild(newBall);
                newBall.name = "bullet" + index;
                index++;
                let circleBody = newBall.addComponent(Laya.RigidBody);
                circleBody.applyOwnerColliderComponent = false;
                let circle = new Laya.CircleShape2D();
                circle.radius = 3 * this.scale;
                circleBody.shapes = [circle];
                tempVec.x = this.chassis.x - newBall.x;
                tempVec.y = this.chassis.y - newBall.y;
                Laya.Vector2.normalize(tempVec, tempVec);
                Laya.Vector2.scale(tempVec, 50, tempVec);
                Laya.Vector2.scale(tempVec, Laya.Physics2DOption.pixelRatio, tempVec);
                circleBody.linearVelocity = tempVec;
                Laya.Laya.timer.frameOnce(120, this, function () {
                    newBall.destroy();
                });
            });
            let label = this.label = Laya.Laya.stage.addChild(new Laya.Label("双击屏幕，仿生机器人向相反方向运动\n单击产生新的小球刚体"));
            label.top = 20;
            label.right = 20;
            label.fontSize = 16;
            label.color = "#e69999";
            for (var i = 0, n = this.drawFlags.length; i < n; i++) {
                this.createCheckBox(this.drawFlags[i], i <= 1, 1300, 70 + 50 * i);
            }
        }
        createCheckBox(lable, isselect, x, y) {
            var cb = new Laya.CheckBox("res/ui/checkbox (1).png");
            this._scene.addChild(cb);
            cb.labelColors = "white";
            cb.labelSize = 20;
            cb.labelFont = "Microsoft YaHei";
            cb.labelPadding = "3,0,0,5";
            cb.x = x;
            cb.y = y;
            cb.label = lable;
            cb.selected = isselect;
            cb.on("change", this, this.updateSelect, [cb]);
        }
        updateSelect(checkBox) {
            let isselect = checkBox.selected;
            let man = this._scene.getComponentElementManager(Laya.Physics2DWorldManager.__managerName);
            switch (checkBox.label) {
                case "Shape":
                    man.enableDebugDraw(true, Laya.EPhycis2DBlit.Shape);
                    break;
                case "Joint":
                    man.enableDebugDraw(true, Laya.EPhycis2DBlit.Joint);
                    break;
                case "AABB":
                    man.enableDebugDraw(true, Laya.EPhycis2DBlit.AABB);
                    break;
                case "Pair":
                    man.enableDebugDraw(true, Laya.EPhycis2DBlit.Pair);
                    break;
                case "CenterOfMass":
                    man.enableDebugDraw(true, Laya.EPhycis2DBlit.CenterOfMass);
                    break;
            }
        }
        dispose() {
            Laya.Laya.stage.offAll(Laya.Event.CLICK);
            Laya.Laya.stage.offAll(Laya.Event.DOUBLE_CLICK);
            Laya.Laya.stage.removeChild(this.label);
        }
    }

    class Camera2D_Layer {
        constructor(maincls) {
            this.Main = null;
            this._index = 0;
            this.loadArray = [
                "res/threeDimen/ui/button.png",
                "res/apes/monkey1.png",
                "res/apes/monkey2.png",
                "res/apes/monkey3.png",
            ];
            this._texts = [
                "layer all",
                "layer 1",
                "layer 2",
                "layer 3",
            ];
            this.Main = maincls;
            Laya.Laya.init(Laya.Browser.clientWidth, Laya.Browser.clientHeight).then(() => {
                Laya.Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
                Laya.Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.Laya.stage.scaleMode = "showall";
                Laya.Laya.stage.bgColor = "#232628";
                let scene = new Laya.Scene();
                this.scene = scene;
                this.Main.box2D.addChild(scene);
                let area = new Laya.Area2D();
                this.area = area;
                this.scene.addChild(area);
                let camera = new Laya.Camera2D();
                camera.isMain = true;
                this.camera = camera;
                area.addChild(camera);
                camera.pos(300, 100);
                this.loadRes();
            });
        }
        loadRes() {
            Laya.Laya.loader.load(this.loadArray).then((res) => {
                this.createButton(this.loadArray[0]);
                this.createSprite(this.loadArray[1], 1);
                this.createSprite(this.loadArray[2], 2);
                this.createSprite(this.loadArray[3], 3);
            });
        }
        createButton(url) {
            let button = new Laya.Button(url, this._texts[0]);
            button.on(Laya.Event.CLICK, this, this.changeLayer);
            button.y = 200;
            button.x = 220;
            button.size(200, 60);
            button.labelSize = 40;
            this.btn = button;
            this.area.addChild(button);
        }
        changeLayer() {
            this._index = (this._index + 1) % 4;
            let result = 0;
            if (this._index === 0) {
                result = -1;
            }
            else {
                result = 1 | (1 << this._index);
            }
            this.camera.visiableLayer = result;
            this.btn.text.text = this._texts[this._index];
        }
        createSprite(url, layer) {
            let sprite = new Laya.Sprite();
            sprite.texture = Laya.Laya.loader.getRes(url);
            sprite.layer = layer;
            sprite.x = layer * 130;
            this.area.addChild(sprite);
        }
    }

    class IndexView2D extends IndexViewUI {
        constructor(box, MainCls) {
            super();
            this.btnOn = false;
            this._comboxBigArr = ['Sprite', '动画', '骨骼动画', '混合模式', '滤镜', '点击', '音频', '文本', 'UI', '计时器', '缓动', '鼠标交互', '屏幕适配', '网络和格式', '调试', '性能测试', '物理', 'DOM', '输入设备', 'Loader加载', 'Demo', "2D相机", "2D渲染"];
            this._comboBoxSpriteClsArr = [Sprite_DisplayImage, Sprite_Container, Sprite_RoateAndScale, Sprite_DrawPath, Sprite_MagnifyingGlass, Sprite_DrawShapes, Sprite_Cache, Sprite_NodeControl, Sprite_Pivot, Sprite_SwitchTexture, Sprite_ScreenShot, Sprite_Guide];
            this._comboBoxSpriteArr = ['显示图片', '容器', '旋转缩放', '根据数据绘制路径', '遮罩-放大镜', '绘制各种形状', '缓存为静态图像', '节点控制', '轴中心', '切换纹理', '截图', '新手指导'];
            this._comboBoxAnimationClsArr = [Animation_SWF, Animation_Altas];
            this._comboBoxAnimationArr = ['SWF动画', '图集动画'];
            this._comboBoxSkeletonClsArr = [Skeleton_MultiTexture, Skeleton_SpineEvent, Skeleton_SpineIkMesh, Skeleton_SpineVine, Skeleton_ChangeSkin, Skeleton_SpineAdapted, Skeleton_SpineStretchyman];
            this._comboBoxSkeletonArr = ['多纹理', 'Spine事件', '橡胶人', '藤蔓', '换装', 'SpineDemo', '火柴人'];
            this._comboBoxBlendModeClsArr = [BlendMode_Lighter];
            this._comboBoxBlendModeArr = ['Lighter'];
            this._comboBoxFiltersClsArr = [Filters_Glow, Filters_Blur, Filters_Color];
            this._comboBoxFiltersArr = ['发光滤镜', '模糊滤镜', '颜色滤镜'];
            this._comboBoxSoundClsArr = [Sound_SimpleDemo];
            this._comboBoxSoundArr = ['播放演示'];
            this._comboBoxTextClsArr = [Text_AutoSize, Text_ComplexStyle, Text_Prompt, Text_Editable, Text_Overflow, Text_Underline, Text_InputSingleline, Text_InputMultiline, Text_MaxChars, Text_Restrict, Text_Scroll, Text_WordWrap, Text_BitmapFont, Text_HTML, Text_UBB];
            this._comboBoxTextArr = ['自动调整文本尺寸', '复杂的文本样式', '文本提示', '禁止编辑', 'Overflow', '下划线', '单行输入', '多行输入', '字数限制', '字符限制', '滚动文本', '自动换行', '位图字体', 'HTML文本', 'UBB文本'];
            this._comboBoxUIClsArr = [UI_Label, UI_Button, UI_RadioGroup, UI_CheckBox, UI_Clip, UI_FontClip, UI_ColorPicker, UI_ComboBox, UI_Dialog, UI_ScrollBar, UI_Slider, UI_Image, UI_List, UI_ProgressBar, UI_Tab, UI_Input, UI_TextArea, UI_Tree, UI_Panel];
            this._comboBoxUIArr = ['Label', 'Button', 'RadioGroup', 'CheckBox', 'Clip', 'FontClip', 'ColorPicker', 'ComboBox', 'Dialog', 'ScrollBar', 'Slider', 'Image', 'List', 'ProgressBar', 'Tab', 'Input', 'TextArea', 'Tree', 'Panel'];
            this._comboBoxTimerClsArr = [Timer_CallLater, Timer_DelayExcute, Timer_Interval];
            this._comboBoxTimerArr = ['延迟调用', '延迟执行', '间隔循环'];
            this._comboBoxTweenClsArr = [Tween_SimpleSample, Tween_Letters, Tween_EaseFunctionsDemo, Tween_TimeLine];
            this._comboBoxTweenArr = ['简单的Tween', '逐字缓动', '缓动函数演示', '时间线'];
            this._comboBoxInteractionClsArr = [Interaction_Hold, Interaction_Drag, Interaction_Rotate, Interaction_Scale, Interaction_Swipe, Interaction_CustomEvent, Interaction_Mouse, Interaction_FixInteractiveRegion, Interaction_Keyboard];
            this._comboBoxInteractionArr = ['Hold', '拖动', '双指旋转（多点触控）', '双指缩放（多点触控）', '滑动', '自定义事件', '鼠标交互', '修正交互区域', '键盘'];
            this._comboBoxSmartScaleClsArr = [SmartScale_Align_Contral, SmartScale_Landscape, SmartScale_Portrait, SmartScale_Scale_NOSCALE, SmartScale_Scale_NOBORDER, SmartScale_Scale_SHOW_ALL, SmartScale_T];
            this._comboBoxSmartScaleArr = ['缩放-Align 居中', '屏幕-横屏', '屏幕-竖屏', '缩放-NoScale', '缩放-No Border', '缩放-Show All', '屏幕适配'];
            this._comboBoxNetworkClsArr = [Network_POST, Network_GET, Network_XML, Network_Socket, Network_Socket2];
            this._comboBoxNetworkArr = ['POST', 'GET', 'XML', 'Websocket', 'Websocket-WSS'];
            this._comboBoxDebugClsArr = [Debug_FPSStats];
            this._comboBoxDebugArr = ['Debug'];
            this._comboBoxPerformanceTestClsArr = [PerformanceTest_Maggots, PerformanceTest_Maggots2, PerformanceTest_Cartoon, PerformanceTest_Cartoon2, PerformanceTest_Skeleton];
            this._comboBoxPerformanceTestArr = ['虫子(慎入)', '虫子逐增(慎入)', '卡通人物', '卡通人物2', '骨骼'];
            this._comboBoxPhysicsClsArr = [Physics_Tumbler, Physics_Tumbler_Shapes, Physics_CollisionFiltering, Physics_CollisionFiltering_Shapes, Physics_CollisionEvent, Physics_CollisionEvent_Shapes, Physics_Bridge, Physics_Bridge_Shapes, Physics_Strandbeests, Physics_Strandbeests_Shapes];
            this._comboBoxPhysicsArr = ['复合碰撞器', 'Shapes模式_复合碰撞器', '碰撞过滤器', 'Shapes模式_碰撞过滤器', '碰撞事件与传感器', 'Shapes模式_碰撞事件与传感器', '桥', 'Shapes模式_桥', '仿生机器人', 'Shapes模式_仿生机器人'];
            this._comboBoxDomClsArr = [DOM_Form, DOM_Video];
            this._comboBoxDomArr = ['表单输入', '视频'];
            this._comboBoxInputDeviceClsArr = [InputDevice_Compass, InputDevice_GluttonousSnake, InputDevice_Map, InputDevice_Media, InputDevice_Shake, InputDevice_Video];
            this._comboBoxInputDeviceArr = ['指南针', '加速计贪吃蛇', '地图', '媒体', '摇一摇', '视频'];
            this._comboBoxLoaderClsArr = [Loader_ClearTextureRes, Loader_MultipleType, Loader_ProgressAndErrorHandle, Loader_Sequence, Loader_SingleType];
            this._comboBoxLoaderArr = ['清除纹理资源', '加载多种类型', '加载进度及错误处理', '序列加载', '多种类型加载'];
            this._comboBoxDemoClsArr = [PIXI_Example_04, PIXI_Example_05, PIXI_Example_21, PIXI_Example_23];
            this._comboBoxDemoArr = ['示例04', '示例05', '示例21', '示例23'];
            this._comboBoxHitTestClsArr = [HitTest_Point, HitTest_Rectangular];
            this._comboBoxHitTestArr = ['区域检测', '矩形检测'];
            this._comboBoxCamera2DClsArr = [Camera2DDemo, Camera2D_Layer];
            this._comboBoxCamera2DArr = ['2D相机', "2D相机层级"];
            this._render2DTestClsArr = [Material2DDemo, Light2DDemo, Line2DRenderDemo, Mesh2DRenderDemo, Trail2DRenderDemo, TileMapLayerDemo, RenderCMD2DDemo];
            this._render2DTestArr = ["2D自定义材质示例", '2D灯光示例', '2D线段渲染器', '2D网格渲染器', '2D拖尾渲染器', '瓦块地图层级示例', '2D渲染命令示例'];
            this._bigIndex = -1;
            this.Main = MainCls;
            this.box2d = box;
            this.name = "Index2D";
            Laya.PrefabImpl.legacySceneOrPrefab.createByData(this, IndexViewUI.uiView);
            this.initView();
            this.initEvent();
            this.zOrder = 99999;
        }
        initView() {
            var lables = this._comboxBigArr.toString();
            this.bigComBox.labels = lables;
            this.bigComBox.selectedIndex = 0;
            this.bigComBox.visibleNum = 5;
            this.bigComBox.list.scrollType = Laya.ScrollType.Vertical;
            this.bigComBox.autoSize = false;
            this.bigComBox.list.selectEnable = true;
            this.bigComBox.width = 230;
            this.bigComBox.height = 50;
            this.bigComBox.labelSize = 35;
            this.bigComBox.itemSize = 30;
            this.bigComBox.left = 50;
            this.bigComBox.bottom = 50;
            this.smallComBox.x = this.bigComBox.x + this.bigComBox.width + 20;
            this.smallComBox.labels = this._comboBoxSpriteArr.toString();
            this.smallComBox.selectedIndex = 0;
            this.smallComBox.list.scrollType = Laya.ScrollType.Vertical;
            this.smallComBox.visibleNum = 5;
            this.smallComBox.list.selectEnable = true;
            this.smallComBox.width = 360;
            this.smallComBox.height = 50;
            this.smallComBox.labelSize = 35;
            this.smallComBox.itemSize = 30;
            this.smallComBox.left = 300;
            this.smallComBox.bottom = 50;
            this.btn = new Laya.Button();
            this.btn.skin = "comp/vscroll$down.png";
            this.addChild(this.btn);
            this.btn.scale(4, 4);
            this.btn.bottom = 50;
            this.btn.left = 700;
            this.btn.on(Laya.Event.MOUSE_DOWN, this, this.nextBtn);
        }
        nextBtn() {
            var isMaster = Laya.Browser.getQueryString("isMaster");
            var i_length;
            this.a_length = this._bigIndex;
            if (this.smallComBox.selectedIndex == this.b_length) {
                this.a_length += 1;
                i_length = 0;
            }
            else {
                i_length = this.smallComBox.selectedIndex + 1;
            }
            var bigType = this.a_length;
            var smallType = i_length;
            if (Main.isOpenSocket && parseInt(isMaster) == 1) {
                Client.instance.send({ type: "next", bigType: bigType, smallType: smallType, isMaster: isMaster });
            }
            else {
                this.switchFunc(this.a_length, i_length);
            }
        }
        initEvent() {
            this.bigComBox.selectHandler = new Laya.Handler(this, this.onBigComBoxSelectHandler);
            this.smallComBox.selectHandler = new Laya.Handler(this, this.onSmallBoxSelectHandler);
            Laya.Laya.stage.on("next", this, this.onNext);
        }
        onNext(data) {
            if (data.hasOwnProperty("bigType")) {
                this.a_length = data.bigType;
                var smallType = data.smallType;
                this.switchFunc(this.a_length, smallType);
            }
            else {
                var isMaster = parseInt(Laya.Browser.getQueryString("isMaster")) || 0;
                if (isMaster)
                    return;
                this._oldView && this._oldView['stypeFun' + data.stype] && this._oldView['stypeFun' + data.stype](data.value);
            }
        }
        onClearPreBox() {
            if (this._oldView && this._oldView['dispose']) {
                Laya.Laya.timer.clearAll(this._oldView);
                Laya.Laya.stage.offAllCaller(this._oldView);
                this._oldView.dispose();
            }
            this._oldView = null;
            this.box2d.destroyChildren();
        }
        resetConfig() {
            Laya.Config.isAntialias = false;
            Laya.Config.preserveDrawingBuffer = false;
        }
        onSmallBoxSelectHandler(index) {
            if (index < 0)
                return;
            if (this.btnOn && this.m_length != 0) {
                return;
            }
            var isMaster = parseInt(Laya.Browser.getQueryString("isMaster")) || 0;
            if (Main.isOpenSocket && !this.btnOn && isMaster) {
                this.onDirectSwitch();
            }
            this.m_length += 1;
            this.onClearPreBox();
            this.resetConfig();
            this._smallIndex = index;
            switch (this._bigIndex) {
                case 0:
                    this._oldView = new this._comboBoxSpriteClsArr[index](this.Main);
                    this.b_length = this._comboBoxSpriteClsArr.length - 1;
                    break;
                case 1:
                    this._oldView = new this._comboBoxAnimationClsArr[index](this.Main);
                    this.b_length = this._comboBoxAnimationClsArr.length - 1;
                    break;
                case 2:
                    this._oldView = new this._comboBoxSkeletonClsArr[index](this.Main);
                    this.b_length = this._comboBoxSkeletonClsArr.length - 1;
                    break;
                case 3:
                    this._oldView = new this._comboBoxBlendModeClsArr[index](this.Main);
                    this.b_length = this._comboBoxBlendModeClsArr.length - 1;
                    break;
                case 4:
                    this._oldView = new this._comboBoxFiltersClsArr[index](this.Main);
                    this.b_length = this._comboBoxFiltersClsArr.length - 1;
                    break;
                case 5:
                    this._oldView = new this._comboBoxHitTestClsArr[index](this.Main);
                    this.b_length = this._comboBoxHitTestClsArr.length - 1;
                    break;
                case 6:
                    this._oldView = new this._comboBoxSoundClsArr[index](this.Main);
                    this.b_length = this._comboBoxSoundClsArr.length - 1;
                    break;
                case 7:
                    this._oldView = new this._comboBoxTextClsArr[index](this.Main);
                    this.b_length = this._comboBoxTextClsArr.length - 1;
                    break;
                case 8:
                    this._oldView = new this._comboBoxUIClsArr[index](this.Main);
                    this.b_length = this._comboBoxUIClsArr.length - 1;
                    break;
                case 9:
                    this._oldView = new this._comboBoxTimerClsArr[index](this.Main);
                    this.b_length = this._comboBoxTimerClsArr.length - 1;
                    break;
                case 10:
                    this._oldView = new this._comboBoxTweenClsArr[index](this.Main);
                    this.b_length = this._comboBoxTweenClsArr.length - 1;
                    break;
                case 11:
                    this._oldView = new this._comboBoxInteractionClsArr[index](this.Main);
                    this.b_length = this._comboBoxInteractionClsArr.length - 1;
                    break;
                case 12:
                    this._oldView = new this._comboBoxSmartScaleClsArr[index](this.Main);
                    this.b_length = this._comboBoxSmartScaleClsArr.length - 1;
                    break;
                case 13:
                    this._oldView = new this._comboBoxNetworkClsArr[index](this.Main);
                    this.b_length = this._comboBoxNetworkClsArr.length - 1;
                    break;
                case 14:
                    this._oldView = new this._comboBoxDebugClsArr[index](this.Main);
                    this.b_length = this._comboBoxDebugClsArr.length - 1;
                    break;
                case 15:
                    this._oldView = new this._comboBoxPerformanceTestClsArr[index](this.Main);
                    this.b_length = this._comboBoxPerformanceTestClsArr.length - 1;
                    break;
                case 16:
                    this._oldView = new this._comboBoxPhysicsClsArr[index](this.Main);
                    this.b_length = this._comboBoxPhysicsClsArr.length - 1;
                    break;
                case 17:
                    this._oldView = new this._comboBoxDomClsArr[index](this.Main);
                    this.b_length = this._comboBoxDomClsArr.length - 1;
                    break;
                case 18:
                    this._oldView = new this._comboBoxInputDeviceClsArr[index](this.Main);
                    this.b_length = this._comboBoxInputDeviceClsArr.length - 1;
                    break;
                case 19:
                    this._oldView = new this._comboBoxLoaderClsArr[index](this.Main);
                    this.b_length = this._comboBoxLoaderClsArr.length - 1;
                    break;
                case 20:
                    this._oldView = new this._comboBoxDemoClsArr[index](this.Main);
                    this.b_length = this._comboBoxDemoClsArr.length - 1;
                    break;
                case 21:
                    this._oldView = new this._comboBoxCamera2DClsArr[index](this.Main);
                    this.b_length = this._comboBoxCamera2DClsArr.length - 1;
                    break;
                case 22:
                    this._oldView = new this._render2DTestClsArr[index](this.Main);
                    this.b_length = this._render2DTestArr.length - 1;
                    break;
                default:
                    break;
            }
            if (this._oldView) {
                this._oldView.Main = this.Main;
            }
        }
        switchFunc(bigListIndex, smallListIndex, isAutoSwitch = true) {
            this.btnOn = true;
            this.m_length = 0;
            this.bigComBox.selectedIndex = bigListIndex;
            this.onBigComBoxSelectHandler(bigListIndex, smallListIndex, isAutoSwitch);
            this.btnOn = false;
        }
        onBigComBoxSelectHandler(index, smallIndex = 0, isAutoSwitch = false) {
            if (this._bigIndex != index) {
                var isMaster = parseInt(Laya.Browser.getQueryString("isMaster")) || 0;
                if (Main.isOpenSocket && !isAutoSwitch && isMaster) {
                    this.onDirectSwitch();
                    return;
                }
                this._bigIndex = index;
                var labelStr;
                switch (index) {
                    case 0:
                        labelStr = this._comboBoxSpriteArr.toString();
                        break;
                    case 1:
                        labelStr = this._comboBoxAnimationArr.toString();
                        break;
                    case 2:
                        labelStr = this._comboBoxSkeletonArr.toString();
                        break;
                    case 3:
                        labelStr = this._comboBoxBlendModeArr.toString();
                        break;
                    case 4:
                        labelStr = this._comboBoxFiltersArr.toString();
                        break;
                    case 5:
                        labelStr = this._comboBoxHitTestArr.toString();
                        break;
                    case 6:
                        labelStr = this._comboBoxSoundArr.toString();
                        break;
                    case 7:
                        labelStr = this._comboBoxTextArr.toString();
                        break;
                    case 8:
                        labelStr = this._comboBoxUIArr.toString();
                        break;
                    case 9:
                        labelStr = this._comboBoxTimerArr.toString();
                        break;
                    case 10:
                        labelStr = this._comboBoxTweenArr.toString();
                        break;
                    case 11:
                        labelStr = this._comboBoxInteractionArr.toString();
                        break;
                    case 12:
                        labelStr = this._comboBoxSmartScaleArr.toString();
                        break;
                    case 13:
                        labelStr = this._comboBoxNetworkArr.toString();
                        break;
                    case 14:
                        labelStr = this._comboBoxDebugArr.toString();
                        break;
                    case 15:
                        labelStr = this._comboBoxPerformanceTestArr.toString();
                        break;
                    case 16:
                        labelStr = this._comboBoxPhysicsArr.toString();
                        break;
                    case 17:
                        labelStr = this._comboBoxDomArr.toString();
                        break;
                    case 18:
                        labelStr = this._comboBoxInputDeviceArr.toString();
                        break;
                    case 19:
                        labelStr = this._comboBoxLoaderArr.toString();
                        break;
                    case 20:
                        labelStr = this._comboBoxDemoArr.toString();
                        break;
                    case 21:
                        labelStr = this._comboBoxCamera2DArr.toString();
                        break;
                    case 22:
                        labelStr = this._render2DTestArr.toString();
                        break;
                    default:
                        break;
                }
                this.smallComBox.labels = labelStr;
            }
            this.smallComBox.selectedIndex = smallIndex;
        }
        onDirectSwitch() {
            var smallType = this.smallComBox.selectedIndex;
            var bigType = this.bigComBox.selectedIndex;
            if (this._bigIndex != this.bigComBox.selectedIndex)
                smallType = 0;
            Client.instance.send({ type: "next", bigType: bigType, smallType: smallType });
        }
    }

    class CameraMoveScript extends Laya.Script {
        constructor() {
            super();
            this._tempVector3 = new Laya.Vector3();
            this.yawPitchRoll = new Laya.Vector3();
            this.resultRotation = new Laya.Quaternion();
            this.tempRotationZ = new Laya.Quaternion();
            this.tempRotationX = new Laya.Quaternion();
            this.tempRotationY = new Laya.Quaternion();
            this.rotaionSpeed = 0.00006;
            this.speed = 0.01;
        }
        _updateRotation() {
            if (Math.abs(this.yawPitchRoll.y) < 1.50) {
                Laya.Quaternion.createFromYawPitchRoll(this.yawPitchRoll.x, this.yawPitchRoll.y, this.yawPitchRoll.z, this.tempRotationZ);
                this.tempRotationZ.cloneTo(this.camera.transform.localRotation);
                this.camera.transform.localRotation = this.camera.transform.localRotation;
            }
        }
        onAwake() {
            Laya.Laya.stage.on(Laya.Event.RIGHT_MOUSE_DOWN, this, this.mouseDown);
            Laya.Laya.stage.on(Laya.Event.RIGHT_MOUSE_UP, this, this.mouseUp);
            this.camera = this.owner;
        }
        onUpdate() {
            var elapsedTime = Laya.Laya.timer.delta;
            if (!isNaN(this.lastMouseX) && !isNaN(this.lastMouseY) && this.isMouseDown) {
                var scene = this.owner.scene;
                Laya.InputManager.hasKeyDown(87) && this.moveForward(-this.speed * elapsedTime);
                Laya.InputManager.hasKeyDown(83) && this.moveForward(this.speed * elapsedTime);
                Laya.InputManager.hasKeyDown(65) && this.moveRight(-this.speed * elapsedTime);
                Laya.InputManager.hasKeyDown(68) && this.moveRight(this.speed * elapsedTime);
                Laya.InputManager.hasKeyDown(81) && this.moveVertical(this.speed * elapsedTime);
                Laya.InputManager.hasKeyDown(69) && this.moveVertical(-this.speed * elapsedTime);
                var offsetX = Laya.Laya.stage.mouseX - this.lastMouseX;
                var offsetY = Laya.Laya.stage.mouseY - this.lastMouseY;
                var yprElem = this.yawPitchRoll;
                yprElem.x -= offsetX * this.rotaionSpeed * elapsedTime;
                yprElem.y -= offsetY * this.rotaionSpeed * elapsedTime;
                this._updateRotation();
            }
            this.lastMouseX = Laya.Laya.stage.mouseX;
            this.lastMouseY = Laya.Laya.stage.mouseY;
        }
        onDestroy() {
            Laya.Laya.stage.off(Laya.Event.RIGHT_MOUSE_DOWN, this, this.mouseDown);
            Laya.Laya.stage.off(Laya.Event.RIGHT_MOUSE_UP, this, this.mouseUp);
        }
        mouseDown(e) {
            this.camera.transform.localRotation.getYawPitchRoll(this.yawPitchRoll);
            this.lastMouseX = Laya.Laya.stage.mouseX;
            this.lastMouseY = Laya.Laya.stage.mouseY;
            this.isMouseDown = true;
        }
        mouseUp(e) {
            this.isMouseDown = false;
        }
        mouseOut(e) {
            this.isMouseDown = false;
        }
        moveForward(distance) {
            this._tempVector3.x = this._tempVector3.y = 0;
            this._tempVector3.z = distance;
            this.camera.transform.translate(this._tempVector3);
        }
        moveRight(distance) {
            this._tempVector3.y = this._tempVector3.z = 0;
            this._tempVector3.x = distance;
            this.camera.transform.translate(this._tempVector3);
        }
        moveVertical(distance) {
            this._tempVector3.x = this._tempVector3.z = 0;
            this._tempVector3.y = distance;
            this.camera.transform.translate(this._tempVector3, false);
        }
    }

    class DrawTextTexture {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.transform.translate(new Laya.Vector3(0, 0, 15));
                camera.transform.rotate(new Laya.Vector3(0, 0, 0), true, false);
                camera.clearColor = new Laya.Color(0.2, 0.2, 0.2, 1.0);
                camera.addComponent(CameraMoveScript);
                this.plane = new Laya.Sprite3D();
                let mesh = Laya.PrimitiveMesh.createPlane(10, 10);
                let planeMeshrender = this.plane.addComponent(Laya.MeshRenderer);
                let planeMeshfilter = this.plane.addComponent(Laya.MeshFilter);
                planeMeshfilter.sharedMesh = mesh;
                this.plane.transform.rotate(new Laya.Vector3(90, 0, 0), true, true);
                scene.addChild(this.plane);
                this.mat = new Laya.UnlitMaterial();
                planeMeshrender.sharedMaterial = this.mat;
                this.cav = Laya.Browser.createElement("canvas");
                var cxt = this.cav.getContext("2d");
                this.cav.width = 256;
                this.cav.height = 256;
                cxt.fillStyle = 'rgb(' + '132' + ',' + '240' + ',109)';
                cxt.font = "bold 50px 宋体";
                cxt.textAlign = "center";
                cxt.textBaseline = "middle";
                cxt.fillText("LayaAir", 100, 50, 200);
                cxt.strokeStyle = 'rgb(' + '200' + ',' + '125' + ',0)';
                cxt.font = "bold 40px 黑体";
                cxt.strokeText("runtime", 100, 100, 200);
                cxt.strokeStyle = 'rgb(' + '255' + ',' + '240' + ',109)';
                cxt.font = "bold 30px 黑体";
                cxt.fillText("LayaBox", 100, 150, 200);
                cxt.strokeStyle = "yellow";
                cxt.font = "bold 30px 黑体";
                cxt.strokeText("LayaBox", 100, 150);
                this.texture2D = new Laya.Texture2D(256, 256, Laya.TextureFormat.R8G8B8A8, true, false, false);
                this.texture2D.setImageData(this.cav, false, false);
                this.mat.materialRenderMode = Laya.MaterialRenderMode.RENDERMODE_TRANSPARENT;
                this.mat.albedoTexture = this.texture2D;
                planeMeshrender.sharedMaterial.cull = Laya.RenderState.CULL_NONE;
                var rotate = new Laya.Vector3(0, 0, 1);
                Laya.Laya.timer.frameLoop(1, this, function () {
                    this.plane.transform.rotate(rotate, true, false);
                });
            });
        }
    }

    class Laya3DCombineHtml {
        constructor() {
            Laya.Config.isAlpha = true;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Laya.stage.bgColor = '#000000';
                this.div = document.createElement('div');
                this.div.innerHTML = '<h1 style=\'color: red;\'>此内容来源于HTML网页, 可直接在html代码中书写 - h1标签</h1>';
                this.div.style = "position:absolute;z-order:99";
                document.body.appendChild(this.div);
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.clearColor = new Laya.Color(0.006, 0.193, 0.36, 0.392);
                camera.transform.translate(new Laya.Vector3(0, 0.5, 1));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                let lightsprit = new Laya.Sprite3D();
                let dirCom = lightsprit.addComponent(Laya.DirectionLightCom);
                scene.addChild(lightsprit);
                dirCom.color = new Laya.Color(1, 1, 1, 1);
                Laya.Sprite3D.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Laya.Handler.create(this, function (layaMonkey) {
                    scene.addChild(layaMonkey);
                    layaMonkey.on(Laya.Event.REMOVED, this, this.destroy);
                }));
            });
        }
        destroy() {
            document.body.removeChild(this.div);
        }
    }

    class Secne3DPlayer2D {
        constructor() {
            this._position = new Laya.Vector3();
            this._outPos = new Laya.Vector4();
            this._translate = new Laya.Vector3(0, 0.35, 1);
            this._rotation = new Laya.Vector3(-3.14 / 3, 0, 0);
            this.scaleDelta = 0;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this._scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                this._camera = this._scene.addChild(new Laya.Camera(0, 0.1, 100));
                this._camera.transform.translate(this._translate);
                this._camera.transform.rotate(this._rotation, true, false);
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                this._scene.addChild(directlightSprite);
                dircom.color = new Laya.Color(1, 1, 1, 1);
                directlightSprite.transform.rotate(this._rotation);
                Laya.Laya.loader.load("res/threeDimen/staticModel/grid/plane.lh", Laya.Handler.create(this, this.onComplete));
            });
        }
        onComplete() {
            var grid = this._scene.addChild(Laya.Loader.createNodes("res/threeDimen/staticModel/grid/plane.lh"));
            this._layaMonkey2D = Laya.Laya.stage.addChild(new Laya.Image("res/threeDimen/monkey.png"));
            Laya.Laya.timer.frameLoop(1, this, this.animate);
        }
        animate() {
            this._position.x = Math.sin(this.scaleDelta += 0.01);
            var outPos = this._outPos;
            this._camera.viewport.project(this._position, this._camera.projectionViewMatrix, outPos);
            this._layaMonkey2D.pos(outPos.x / Laya.Laya.stage.clientScaleX, outPos.y / Laya.Laya.stage.clientScaleY);
        }
    }

    class AnimationEventDemo {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Scene3D.load("res/threeDimen/scene/LayaScene_AnimationEvent/Conventional/layaScene.ls", Laya.Handler.create(this, function (scene) {
                    Laya.Laya.stage.addChild(scene);
                    var cube = scene.getChildByName("Cube");
                    cube.addComponent(SceneScript$1);
                }));
            });
        }
    }
    class SceneScript$1 extends Laya.Script {
        constructor() {
            super();
        }
        ShowMsg() {
            console.log("TTTTTTT");
        }
    }

    class AnimationLayerBlend {
        constructor() {
            this.transitionSp3Path = "res/danding/danding.lh";
            this.isTransition = false;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                Laya.Laya.loader.load([this.transitionSp3Path]).then(() => {
                    this.initScene();
                });
            });
        }
        initScene() {
            this.scene = new Laya.Scene3D();
            Laya.Laya.stage.addChild(this.scene);
            let camera = new Laya.Camera(0, 0.1, 100);
            camera.addComponent(CameraMoveScript);
            camera.transform.position = new Laya.Vector3(-2.4, 1.3, 3.2);
            camera.transform.rotationEuler = new Laya.Vector3(-2.13, -6.0, 0.0);
            this.scene.addChild(camera);
            let dirLit = new Laya.Sprite3D();
            let dirLitCom = dirLit.addComponent(Laya.DirectionLightCom);
            this.scene.addChild(dirLit);
            this.transitionSp3 = Laya.Laya.loader.getRes(this.transitionSp3Path).create();
            this.scene.addChild(this.transitionSp3);
            this.animator = this.transitionSp3.getComponent(Laya.Animator);
            this.loadUI();
        }
        loadUI() {
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, () => {
                this.btnTransition = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "动画融合: 关"));
                this.btnTransition.size(160, 40);
                this.btnTransition.labelBold = true;
                this.btnTransition.labelSize = 30;
                this.btnTransition.sizeGrid = "4,4,4,4";
                this.btnTransition.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.btnTransition.top = 150;
                this.btnTransition.left = 250;
                this.btnTransition.on(Laya.Event.CLICK, this, this.btnTransitionClick);
                this.btnRun = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "播放Run动作"));
                this.btnRun.size(200, 40);
                this.btnRun.labelBold = true;
                this.btnRun.labelSize = 30;
                this.btnRun.sizeGrid = "4,4,4,4";
                this.btnRun.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.btnRun.top = 250;
                this.btnRun.left = 250;
                this.btnRun.on(Laya.Event.CLICK, this, this.btnRunClick);
                this.btnSkill = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "播放Skill动作"));
                this.btnSkill.size(200, 40);
                this.btnSkill.labelBold = true;
                this.btnSkill.labelSize = 30;
                this.btnSkill.sizeGrid = "4,4,4,4";
                this.btnSkill.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.btnSkill.top = 350;
                this.btnSkill.left = 250;
                this.btnSkill.on(Laya.Event.CLICK, this, this.btnSkillClick);
            }));
        }
        btnTransitionClick() {
            if (this.isTransition) {
                this.btnTransition.label = "动画融合: 关";
            }
            else {
                this.btnTransition.label = "动画融合: 开";
            }
            this.isTransition = !this.isTransition;
        }
        btnRunClick() {
            if (this.isTransition) {
                this.animator.crossFade("Run", 0.5);
            }
            else {
                this.animator.play("Run");
            }
        }
        btnSkillClick() {
            if (this.isTransition) {
                this.animator.crossFade("Skill1", 0.5);
            }
            else {
                this.animator.play("Skill1");
            }
        }
    }

    class CustomAnimatorStateScript extends Laya.AnimatorStateScript {
        constructor() {
            super();
        }
        onStateEnter() {
            console.log("动画开始播放了");
        }
        onStateUpdate(normalizeTime) {
            console.log("动画状态更新了");
        }
        onStateExit() {
            console.log("动画退出了");
        }
    }

    class AnimatorDemo {
        constructor() {
            this.btype = "AnimatorDemo";
            this.stype = 0;
            this._PlayStopIndex = 0;
            this._curStateIndex = 0;
            this._text = new Laya.Text();
            this._textName = new Laya.Text();
            this._curActionName = null;
            this._translate = new Laya.Vector3(0, 3, 5);
            this._rotation = new Laya.Vector3(-15, 0, 0);
            this._forward = new Laya.Vector3(-1.0, -1.0, -1.0);
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var resource = ["res/threeDimen/skinModel/BoneLinkScene/PangZi.lh"];
                Laya.Laya.loader.load(resource, Laya.Handler.create(this, this.onLoadFinish));
            });
        }
        onLoadFinish() {
            this._scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
            this._scene.ambientColor = new Laya.Color(0.5, 0.5, 0.5);
            var camera = this._scene.addChild(new Laya.Camera(0, 0.1, 100));
            camera.transform.translate(this._translate);
            camera.transform.rotate(this._rotation, true, false);
            camera.addComponent(CameraMoveScript);
            let directlightSprite = new Laya.Sprite3D();
            let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
            this._scene.addChild(directlightSprite);
            var mat = directlightSprite.transform.worldMatrix;
            mat.setForward(this._forward);
            directlightSprite.transform.worldMatrix = mat;
            var role = this._scene.addChild(new Laya.Sprite3D());
            var pangzi = role.addChild(Laya.Loader.createNodes("res/threeDimen/skinModel/BoneLinkScene/PangZi.lh"));
            this._animator = pangzi.getChildAt(0).getComponent(Laya.Animator);
            var state1 = new Laya.AnimatorState();
            state1.name = "hello";
            state1.clipStart = 296 / 581;
            state1.clipEnd = 346 / 581;
            state1.clip = this._animator.getDefaultState().clip;
            state1.clip.islooping = true;
            state1.addScript(CustomAnimatorStateScript);
            this._animator.getControllerLayer(0).addState(state1);
            var state2 = new Laya.AnimatorState();
            state2.name = "ride";
            state2.clipStart = 0 / 581;
            state2.clipEnd = 33 / 581;
            state2.clip = this._animator.getDefaultState().clip;
            state2.clip.islooping = true;
            state2.addScript(CustomAnimatorStateScript);
            this._animator.getControllerLayer(0).addState(state2);
            this._animator.speed = 0.0;
            var state3 = new Laya.AnimatorState();
            state3.name = "动作状态三";
            state3.clipStart = 34 / 581;
            state3.clipEnd = 100 / 581;
            state3.clip = this._animator.getDefaultState().clip;
            state3.clip.islooping = true;
            state3.addScript(CustomAnimatorStateScript);
            this._animator.getControllerLayer(0).addState(state3);
            this._animator.speed = 0.0;
            var state4 = new Laya.AnimatorState();
            state4.name = "动作状态四";
            state4.clipStart = 101 / 581;
            state4.clipEnd = 200 / 581;
            state4.clip = this._animator.getDefaultState().clip;
            state4.clip.islooping = true;
            state4.addScript(CustomAnimatorStateScript);
            this._animator.getControllerLayer(0).addState(state4);
            this._animator.speed = 0.0;
            var state5 = new Laya.AnimatorState();
            state5.name = "动作状态五";
            state5.clipStart = 201 / 581;
            state5.clipEnd = 295 / 581;
            state5.clip = this._animator.getDefaultState().clip;
            state5.clip.islooping = true;
            state5.addScript(CustomAnimatorStateScript);
            this._animator.getControllerLayer(0).addState(state5);
            this._animator.speed = 0.0;
            var state6 = new Laya.AnimatorState();
            state6.name = "动作状态六";
            state6.clipStart = 345 / 581;
            state6.clipEnd = 581 / 581;
            state6.clip = this._animator.getDefaultState().clip;
            state6.clip.islooping = true;
            state6.addScript(CustomAnimatorStateScript);
            this._animator.getControllerLayer(0).addState(state6);
            this._animator.speed = 0.0;
            this.loadUI();
            this._textName.x = Laya.Laya.stage.width / 2 - 50;
            this._textName.overflow = Laya.Text.HIDDEN;
            this._textName.color = "#FFFFFF";
            this._textName.font = "Impact";
            this._textName.fontSize = 20;
            this._textName.borderColor = "#FFFF00";
            this._textName.x = Laya.Laya.stage.width / 2;
            this._textName.text = "当前动作状态名称：";
            Laya.Laya.stage.addChild(this._textName);
            this._text.x = Laya.Laya.stage.width / 2 - 50;
            this._text.y = 50;
            this._text.overflow = Laya.Text.HIDDEN;
            this._text.color = "#FFFFFF";
            this._text.font = "Impact";
            this._text.fontSize = 20;
            this._text.borderColor = "#FFFF00";
            this._text.x = Laya.Laya.stage.width / 2;
            this._text.text = "当前动作状态进度：";
            Laya.Laya.stage.addChild(this._text);
            Laya.Laya.timer.frameLoop(1, this, this.onFrame);
        }
        loadUI() {
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, () => {
                this._changeActionButton = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "播放动画"));
                this._changeActionButton.size(160, 40);
                this._changeActionButton.labelBold = true;
                this._changeActionButton.labelSize = 30;
                this._changeActionButton.sizeGrid = "4,4,4,4";
                this._changeActionButton.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this._changeActionButton.pos(Laya.Laya.stage.width / 2 - this._changeActionButton.width * Laya.Browser.pixelRatio / 2 - 100, Laya.Laya.stage.height - 100 * Laya.Browser.pixelRatio);
                this._changeActionButton.on(Laya.Event.CLICK, this, this.stypeFun0);
                this._changeActionButton2 = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "切换动作状态"));
                this._changeActionButton2.size(200, 40);
                this._changeActionButton2.labelBold = true;
                this._changeActionButton2.labelSize = 30;
                this._changeActionButton2.sizeGrid = "4,4,4,4";
                this._changeActionButton2.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this._changeActionButton2.pos(Laya.Laya.stage.width / 2 - this._changeActionButton2.width * Laya.Browser.pixelRatio / 2 + 100, Laya.Laya.stage.height - 100 * Laya.Browser.pixelRatio);
                this._changeActionButton2.on(Laya.Event.CLICK, this, this.stypeFun1);
            }));
        }
        stypeFun0(label = "播放动画") {
            this._PlayStopIndex++;
            if (this._changeActionButton.label === "暂停动画") {
                this._changeActionButton.label = "播放动画";
                this._animator.speed = 0.0;
            }
            else if (this._changeActionButton.label === "播放动画") {
                this._changeActionButton.label = "暂停动画";
                this._animator.play(this._curActionName);
                this._animator.speed = 1.0;
            }
            label = this._changeActionButton.label;
            Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: label });
        }
        stypeFun1(curStateIndex = 0) {
            this._curStateIndex++;
            if (this._curStateIndex % 6 == 0) {
                this._changeActionButton.label = "暂停动画";
                this._animator.speed = 0.0;
                this._animator.play("hello");
                this._curActionName = "hello";
                this._textName.text = "当前动作状态名称:" + "hello";
                this._animator.speed = 1.0;
            }
            else if (this._curStateIndex % 6 == 1) {
                this._changeActionButton.label = "暂停动画";
                this._animator.speed = 0.0;
                this._animator.play("ride");
                this._curActionName = "ride";
                this._textName.text = "当前动作状态名称:" + "ride";
                this._animator.speed = 1.0;
            }
            else if (this._curStateIndex % 6 == 2) {
                this._changeActionButton.label = "暂停动画";
                this._animator.speed = 0.0;
                this._animator.play("动作状态三");
                this._curActionName = "动作状态三";
                this._textName.text = "当前动作状态名称:" + "动作状态三";
                this._animator.speed = 1.0;
            }
            else if (this._curStateIndex % 6 == 3) {
                this._changeActionButton.label = "暂停动画";
                this._animator.speed = 0.0;
                this._animator.play("动作状态四");
                this._curActionName = "动作状态四";
                this._textName.text = "当前动作状态名称:" + "动作状态四";
                this._animator.speed = 1.0;
            }
            else if (this._curStateIndex % 6 == 4) {
                this._changeActionButton.label = "暂停动画";
                this._animator.speed = 0.0;
                this._animator.play("动作状态五");
                this._curActionName = "动作状态五";
                this._textName.text = "当前动作状态名称:" + "动作状态五";
                this._animator.speed = 1.0;
            }
            else if (this._curStateIndex % 6 == 5) {
                this._changeActionButton.label = "暂停动画";
                this._animator.speed = 0.0;
                this._animator.play("动作状态六");
                this._curActionName = "动作状态六";
                this._textName.text = "当前动作状态名称:" + "动作状态六";
                this._animator.speed = 1.0;
            }
            curStateIndex = this._curStateIndex;
            Client.instance.send({ type: "next", btype: this.btype, stype: 1, value: curStateIndex });
        }
        onFrame() {
            if (this._animator.speed > 0.0) {
                var curNormalizedTime = this._animator.getCurrentAnimatorPlayState(0).normalizedTime;
                this._text.text = "当前动画状态进度：" + curNormalizedTime;
            }
        }
    }

    class AnimatorStateScriptTest extends Laya.AnimatorStateScript {
        get text() {
            return this._text;
        }
        set text(value) {
            this._text = value;
        }
        constructor() {
            super();
            this._text = null;
        }
        onStateEnter() {
            console.log("动画开始播放了");
            this._text.text = "动画状态：动画开始播放";
        }
        onStateUpdate(normalizeTime) {
            console.log("动画状态更新了");
            this._text.text = "动画状态：动画更新中";
        }
        onStateExit() {
            console.log("动画退出了");
            this._text.text = "动画状态：动画开始退出";
        }
    }

    class AnimatorStateScriptDemo {
        constructor() {
            this.PlayStopIndex = 0;
            this.curStateIndex = 0;
            this.text = new Laya.Text();
            this.textName = new Laya.Text();
            this.curActionName = null;
            this._translate = new Laya.Vector3(0, 3, 5);
            this._rotation = new Laya.Vector3(-15, 0, 0);
            this._forward = new Laya.Vector3(-1.0, -1.0, -1.0);
            this.btype = "AnimatorStateScriptDemo";
            this.stype = 0;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var resource = ["res/threeDimen/skinModel/BoneLinkScene/PangZi.lh"];
                Laya.Laya.loader.load(resource, Laya.Handler.create(this, this.onLoadFinish));
            });
        }
        onLoadFinish() {
            this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
            this.scene.ambientColor = new Laya.Color(0.5, 0.5, 0.5);
            var camera = this.scene.addChild(new Laya.Camera(0, 0.1, 100));
            camera.transform.translate(this._translate);
            camera.transform.rotate(this._rotation, true, false);
            camera.addComponent(CameraMoveScript);
            let directlightSprite = new Laya.Sprite3D();
            let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
            this.scene.addChild(directlightSprite);
            var mat = directlightSprite.transform.worldMatrix;
            mat.setForward(this._forward);
            directlightSprite.transform.worldMatrix = mat;
            var role = this.scene.addChild(new Laya.Sprite3D());
            var pangzi = role.addChild(Laya.Loader.createNodes("res/threeDimen/skinModel/BoneLinkScene/PangZi.lh"));
            this.animator = pangzi.getChildAt(0).getComponent(Laya.Animator);
            var state1 = new Laya.AnimatorState();
            state1.name = "hello";
            state1.clipStart = 296 / 581;
            state1.clipEnd = 346 / 581;
            state1.clip = this.animator.getDefaultState().clip;
            state1.clip.islooping = true;
            var asst1 = state1.addScript(AnimatorStateScriptTest);
            asst1.text = this.text;
            this.animator.speed = 0.0;
            this.animator.getControllerLayer(0).addState(state1);
            var state2 = new Laya.AnimatorState();
            state2.name = "ride";
            state2.clipStart = 0 / 581;
            state2.clipEnd = 33 / 581;
            state2.clip = this.animator.getDefaultState().clip;
            state2.clip.islooping = true;
            var asst2 = state2.addScript(AnimatorStateScriptTest);
            asst2.text = this.text;
            this.animator.getControllerLayer(0).addState(state2);
            var state3 = new Laya.AnimatorState();
            state3.name = "动作状态三";
            state3.clipStart = 34 / 581;
            state3.clipEnd = 100 / 581;
            state3.clip = this.animator.getDefaultState().clip;
            state3.clip.islooping = true;
            this.animator.speed = 0.0;
            var asst3 = state3.addScript(AnimatorStateScriptTest);
            asst3.text = this.text;
            this.animator.getControllerLayer(0).addState(state3);
            this.loadUI();
            this.textName.x = Laya.Laya.stage.width / 2 - 50;
            this.text.x = Laya.Laya.stage.width / 2 - 50;
            this.text.y = 50;
            this.textName.overflow = Laya.Text.HIDDEN;
            this.textName.color = "#FFFFFF";
            this.textName.font = "Impact";
            this.textName.fontSize = 20;
            this.textName.borderColor = "#FFFF00";
            this.textName.x = Laya.Laya.stage.width / 2;
            this.textName.text = "当前动作状态名称：";
            Laya.Laya.stage.addChild(this.textName);
            this.text.name = "text";
            this.text.overflow = Laya.Text.HIDDEN;
            this.text.color = "#FFFFFF";
            this.text.font = "Impact";
            this.text.fontSize = 20;
            this.text.borderColor = "#FFFF00";
            this.text.x = Laya.Laya.stage.width / 2;
            this.text.text = "动画状态：";
            Laya.Laya.stage.addChild(this.text);
        }
        loadUI() {
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, function () {
                this.changeActionButton = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "切换动作状态"));
                this.changeActionButton.size(200, 40);
                this.changeActionButton.labelBold = true;
                this.changeActionButton.labelSize = 30;
                this.changeActionButton.sizeGrid = "4,4,4,4";
                this.changeActionButton.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.changeActionButton.pos(Laya.Laya.stage.width / 2 - this.changeActionButton.width * Laya.Browser.pixelRatio / 2, Laya.Laya.stage.height - 100 * Laya.Browser.pixelRatio);
                this.changeActionButton.on(Laya.Event.CLICK, this, this.stypeFun0);
            }));
        }
        stypeFun0(curStateIndex = 0) {
            this.curStateIndex++;
            if (this.curStateIndex % 3 == 0) {
                this.animator.speed = 0.0;
                this.animator.play("hello");
                this.curActionName = "hello";
                this.textName.text = "当前动作状态名称:" + "hello";
                this.animator.speed = 1.0;
            }
            else if (this.curStateIndex % 3 == 1) {
                this.animator.speed = 0.0;
                this.animator.play("ride");
                this.curActionName = "ride";
                this.textName.text = "当前动作状态名称:" + "ride";
                this.animator.speed = 1.0;
            }
            else if (this.curStateIndex % 3 == 2) {
                this.animator.speed = 0.0;
                this.animator.play("动作状态三");
                this.curActionName = "动作状态三";
                this.textName.text = "当前动作状态名称:" + "动作状态三";
                this.animator.speed = 1.0;
            }
            curStateIndex = this.curStateIndex;
            Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: curStateIndex });
        }
    }

    class BoneLinkSprite3D {
        constructor() {
            this._dragonScale = new Laya.Vector3(0.1, 0.1, 0.1);
            this._translate = new Laya.Vector3(0, 3, 5);
            this._rotation2 = new Laya.Vector3(-15, 0, 0);
            this._forward = new Laya.Vector3(-1.0, -1.0, -1.0);
            this.curStateIndex = 0;
            this.btype = "BoneLinkSprite3D";
            this.stype = 0;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var resource = ["res/threeDimen/skinModel/BoneLinkScene/Assets/XunLongShi/Bary/Bary.lh",
                    "res/threeDimen/skinModel/BoneLinkScene/Assets/XunLongShi/Carn/Carn.lh",
                    "res/threeDimen/skinModel/BoneLinkScene/PangZi.lh"];
                Laya.Laya.loader.load(resource, Laya.Handler.create(this, this.onLoadFinish));
            });
        }
        onLoadFinish() {
            this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
            this.scene.ambientColor = new Laya.Color(0.5, 0.5, 0.5);
            var camera = this.scene.addChild(new Laya.Camera(0, 0.1, 100));
            camera.transform.translate(this._translate);
            camera.transform.rotate(this._rotation2, true, false);
            camera.addComponent(CameraMoveScript);
            let directlightSprite = new Laya.Sprite3D();
            let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
            this.scene.addChild(directlightSprite);
            var mat = directlightSprite.transform.worldMatrix;
            mat.setForward(this._forward);
            directlightSprite.transform.worldMatrix = mat;
            this.role = this.scene.addChild(new Laya.Sprite3D());
            this.pangzi = this.role.addChild(Laya.Loader.createNodes("res/threeDimen/skinModel/BoneLinkScene/PangZi.lh"));
            this.animator = this.pangzi.getChildAt(0).getComponent(Laya.Animator);
            var state1 = new Laya.AnimatorState();
            state1.name = "hello";
            state1.clipStart = 296 / 581;
            state1.clipEnd = 346 / 581;
            state1.clip = this.animator.getDefaultState().clip;
            state1.clip.islooping = true;
            this.animator.getControllerLayer(0).addState(state1);
            this.animator.play("hello");
            var state2 = new Laya.AnimatorState();
            state2.name = "ride";
            state2.clipStart = 3 / 581;
            state2.clipEnd = 33 / 581;
            state2.clip = this.animator.getDefaultState().clip;
            state2.clip.islooping = true;
            this.animator.getControllerLayer(0).addState(state2);
            this.dragon1 = Laya.Loader.createNodes("res/threeDimen/skinModel/BoneLinkScene/Assets/XunLongShi/Bary/Bary.lh");
            this.dragon1.transform.localScale = this._dragonScale;
            this.aniSprte3D1 = this.dragon1.getChildAt(0);
            this.dragon2 = Laya.Loader.createNodes("res/threeDimen/skinModel/BoneLinkScene/Assets/XunLongShi/Carn/Carn.lh");
            this.dragon2.transform.localScale = this._dragonScale;
            this.aniSprte3D2 = this.dragon2.getChildAt(0);
            this.loadUI();
        }
        loadUI() {
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, function () {
                this.changeActionButton = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "乘骑坐骑"));
                this.changeActionButton.size(160, 40);
                this.changeActionButton.labelBold = true;
                this.changeActionButton.labelSize = 30;
                this.changeActionButton.sizeGrid = "4,4,4,4";
                this.changeActionButton.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.changeActionButton.pos(Laya.Laya.stage.width / 2 - this.changeActionButton.width * Laya.Browser.pixelRatio / 2, Laya.Laya.stage.height - 100 * Laya.Browser.pixelRatio);
                this.changeActionButton.on(Laya.Event.CLICK, this, this.stypeFun0);
            }));
        }
        stypeFun0(label = "乘骑坐骑") {
            this.curStateIndex++;
            if (this.curStateIndex % 3 == 1) {
                this.changeActionButton.label = "切换坐骑";
                this.dragon1.removeSelf();
                this.dragon2.removeSelf();
                let linkNode = this.getAvatarNodeByNames(this.pangzi, "AvatarNode");
                linkNode && linkNode.addChild(this.dragon1);
                this.dragon1.transform.localPosition = new Laya.Vector3(-0.5, 0, 0);
                this.dragon1.transform.localRotationEuler = new Laya.Vector3(0, -180, 100);
                this.animator.play("ride");
            }
            else if (this.curStateIndex % 3 == 2) {
                this.changeActionButton.label = "卸下坐骑";
                this.dragon1.removeSelf();
                this.dragon2.removeSelf();
                let linkNode = this.getAvatarNodeByNames(this.pangzi, "AvatarNode");
                linkNode && linkNode.addChild(this.dragon2);
                this.dragon2.transform.localPosition = new Laya.Vector3(-0.7, 0, 0);
                this.dragon2.transform.localRotationEuler = new Laya.Vector3(0, 180, 95);
                this.animator.play("ride");
            }
            else {
                this.changeActionButton.label = "乘骑坐骑";
                this.dragon1.removeSelf();
                this.dragon2.removeSelf();
                this.scene.addChild(this.role);
                this.animator.play("hello");
            }
            label = this.changeActionButton.label;
            Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: label });
        }
        getAvatarNodeByNames(target, name) {
            for (let i = 0; i < target.numChildren; i++) {
                let child = target.getChildAt(i);
                if (child.name == name) {
                    return child;
                }
                let res = this.getAvatarNodeByNames(child, name);
                if (res) {
                    return res;
                }
            }
        }
    }

    class CameraAnimation {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Scene3D.load("res/threeDimen/scene/cameraDonghua/Conventional/layaScene.ls", Laya.Handler.create(this, function (scene) {
                    Laya.Laya.stage.addChild(scene);
                    var camera = scene.getChildByName("Main Camera");
                    camera.addComponent(CameraMoveScript);
                }));
            });
        }
    }

    class RigidbodyAnimationDemo {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Scene3D.load("res/threeDimen/scene/LayaScene_RigidbodyAnimation/Conventional/scene.ls", Laya.Handler.create(this, function (scene) {
                    Laya.Laya.stage.addChild(scene);
                    var camera = scene.getChildByName("Main Camera");
                    camera.addComponent(CameraMoveScript);
                }));
            });
        }
    }

    class CameraDemo {
        constructor() {
            this.index = 0;
            this.index2 = 0;
            this._translate = new Laya.Vector3(0, 0.7, 5);
            this._rotation = new Laya.Vector3(-15, 0, 0);
            this._rotation2 = new Laya.Vector3(-3.14 / 3, 0, 0);
            this._rotation3 = new Laya.Vector3(0, 45, 0);
            this._clearColor = new Laya.Vector4(0, 0.2, 0.6, 1);
            this.btype = "CameraDemo";
            this.stype = 0;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var resource = ["res/threeDimen/texture/layabox.png"];
                Laya.Laya.loader.load(resource, Laya.Handler.create(this, this.onPreLoadFinish));
            });
        }
        onPreLoadFinish() {
            var scene = new Laya.Scene3D();
            Laya.Laya.stage.addChild(scene);
            this.camera = new Laya.Camera(0, 0.1, 100);
            this.camera.transform.translate(this._translate);
            this.camera.transform.rotate(this._rotation, true, false);
            this.camera.useOcclusionCulling = false;
            this.camera.clearFlag = Laya.CameraClearFlags.SolidColor;
            this.camera.fieldOfView = 60;
            this.camera.addComponent(CameraMoveScript);
            scene.addChild(this.camera);
            let directlightSprite = new Laya.Sprite3D();
            let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
            scene.addChild(directlightSprite);
            dircom.color.setValue(1, 1, 1, 1);
            directlightSprite.transform.rotate(this._rotation2);
            var sprite = new Laya.Sprite3D;
            scene.addChild(sprite);
            var box = new Laya.Sprite3D();
            let boxMesh = Laya.PrimitiveMesh.createBox(0.5, 0.5, 0.5);
            let boxrender = box.addComponent(Laya.MeshRenderer);
            let boxfilter = box.addComponent(Laya.MeshFilter);
            boxfilter.sharedMesh = boxMesh;
            sprite.addChild(box);
            box.transform.position.setValue(0.0, 0.0, 2);
            box.transform.rotate(this._rotation3, false, false);
            var materialBill = new Laya.BlinnPhongMaterial;
            boxrender.material = materialBill;
            var tex = Laya.Loader.getTexture2D("res/threeDimen/texture/layabox.png");
            materialBill.albedoTexture = tex;
            this.loadUI();
        }
        loadUI() {
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, function () {
                var changeActionButton = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "正透切换"));
                changeActionButton.size(160, 40);
                changeActionButton.labelBold = true;
                changeActionButton.labelSize = 30;
                changeActionButton.sizeGrid = "4,4,4,4";
                changeActionButton.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                changeActionButton.pos(Laya.Laya.stage.width / 2 - changeActionButton.width * Laya.Browser.pixelRatio / 2 - 100, Laya.Laya.stage.height - 100 * Laya.Browser.pixelRatio);
                changeActionButton.on(Laya.Event.CLICK, this, this.stypeFun0);
                var changeActionButton2 = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "切换背景"));
                changeActionButton2.size(160, 40);
                changeActionButton2.labelBold = true;
                changeActionButton2.labelSize = 30;
                changeActionButton2.sizeGrid = "4,4,4,4";
                changeActionButton2.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                changeActionButton2.pos(Laya.Laya.stage.width / 2 - changeActionButton2.width * Laya.Browser.pixelRatio / 2 + 100, Laya.Laya.stage.height - 100 * Laya.Browser.pixelRatio);
                changeActionButton2.on(Laya.Event.CLICK, this, this.stypeFun1);
            }));
        }
        stypeFun0(index = 0) {
            this.index++;
            if (this.index % 2 === 1) {
                this.camera.orthographic = true;
                this.camera.orthographicVerticalSize = 7;
            }
            else {
                this.camera.orthographic = false;
            }
            index = this.index;
            Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: index });
        }
        stypeFun1(index2 = 0) {
            this.index2++;
            if (this.index2 % 2 === 1) {
                this.camera.clearFlag = Laya.CameraClearFlags.Sky;
                Laya.Material.load("res/threeDimen/skyBox/skyBox2/skyBox2.lmat", Laya.Handler.create(this, () => {
                    var skyboxMaterial = Laya.Loader.getRes("res/threeDimen/skyBox/skyBox2/skyBox2.lmat");
                    var skyRenderer = this.camera.scene.skyRenderer;
                    skyRenderer.mesh = Laya.SkyBox.instance;
                    skyRenderer.material = skyboxMaterial;
                }));
            }
            else {
                this.camera.clearFlag = Laya.CameraClearFlags.SolidColor;
            }
            index2 = this.index2;
            Client.instance.send({ type: "next", btype: this.btype, stype: 1, value: index2 });
        }
    }

    class CameraLayer {
        constructor() {
            this._translate = new Laya.Vector3(0, 0.7, 3);
            this._rotation = new Laya.Vector3(-15, 0, 0);
            this._rotation2 = new Laya.Vector3(-3.14 / 3, 0, 0);
            this._rotation3 = new Laya.Quaternion(0.7071068, 0, 0, -0.7071067);
            this._rotation4 = new Laya.Vector3(0, 60, 0);
            this._position = new Laya.Vector3(0.0, 0, 0.5);
            this.btype = "CameraLayer";
            this.stype = 0;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this._scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                this.camera = (this._scene.addChild(new Laya.Camera(0, 0.1, 100)));
                this.camera.transform.translate(this._translate);
                this.camera.transform.rotate(this._rotation, true, false);
                this.camera.addComponent(CameraMoveScript);
                this.camera.removeAllLayers();
                this.camera.addLayer(5);
                var directionLight = this._scene.addChild(new Laya.Sprite3D());
                var directionLightCom = directionLight.addComponent(Laya.DirectionLightCom);
                directionLightCom.color.setValue(1, 1, 1, 1);
                directionLight.transform.rotate(this._rotation2);
                Laya.Laya.loader.load(["res/threeDimen/staticModel/grid/plane.lh",
                    "res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh"], Laya.Handler.create(this, this.onComplete));
            });
        }
        onComplete() {
            var grid = this._scene.addChild(Laya.Loader.createNodes("res/threeDimen/staticModel/grid/plane.lh"));
            grid.getChildAt(0).getComponent(Laya.MeshRenderer).receiveShadow = true;
            grid.getChildAt(0).layer = 5;
            let monkeyMesh = Laya.Loader.getRes("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm");
            var staticLayaMonkey = new Laya.Sprite3D();
            let monkeyFilter = staticLayaMonkey.addComponent(Laya.MeshFilter);
            let monkeyMeshRender = staticLayaMonkey.addComponent(Laya.MeshRenderer);
            monkeyFilter.sharedMesh = monkeyMesh;
            this._scene.addChild(staticLayaMonkey);
            staticLayaMonkey.getComponent(Laya.MeshRenderer).material = Laya.Loader.getRes("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/Materials/T_Diffuse.lmat");
            staticLayaMonkey.layer = 1;
            staticLayaMonkey.transform.position = new Laya.Vector3(0, 0, 0.5);
            staticLayaMonkey.transform.localScale = new Laya.Vector3(0.3, 0.3, 0.3);
            staticLayaMonkey.transform.rotation = this._rotation3;
            staticLayaMonkey.getComponent(Laya.MeshRenderer).castShadow = true;
            var layaMonkey_clone1 = Laya.Sprite3D.instantiate(staticLayaMonkey, this._scene, false, this._position);
            var layaMonkey_clone2 = Laya.Sprite3D.instantiate(staticLayaMonkey, this._scene, false, this._position);
            var layaMonkey_clone3 = Laya.Sprite3D.instantiate(staticLayaMonkey, this._scene, false, this._position);
            layaMonkey_clone1.layer = 2;
            layaMonkey_clone2.layer = 3;
            layaMonkey_clone3.layer = 0;
            this._translate.setValue(1.5, 0, 0.0);
            layaMonkey_clone1.transform.translate(this._translate);
            this._translate.setValue(-1.5, 0, 0.0);
            layaMonkey_clone2.transform.translate(this._translate);
            this._translate.setValue(2.5, 0, 0.0);
            layaMonkey_clone3.transform.translate(this._translate);
            layaMonkey_clone2.transform.rotate(this._rotation4, false, false);
            layaMonkey_clone3.transform.localScale = new Laya.Vector3(0.1, 0.1, 0.1);
            this.loadUI();
        }
        loadUI() {
            this.layerIndex = 0;
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, function () {
                this.changeActionButton = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "切换图层"));
                this.changeActionButton.size(160, 40);
                this.changeActionButton.labelBold = true;
                this.changeActionButton.labelSize = 30;
                this.changeActionButton.sizeGrid = "4,4,4,4";
                this.changeActionButton.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.changeActionButton.pos(Laya.Laya.stage.width / 2 - this.changeActionButton.width * Laya.Browser.pixelRatio / 2, Laya.Laya.stage.height - 100 * Laya.Browser.pixelRatio);
                this.changeActionButton.on(Laya.Event.CLICK, this, this.stypeFun0);
            }));
        }
        stypeFun0(layerIndex = 0) {
            this.camera.removeAllLayers();
            this.layerIndex++;
            this.camera.addLayer(this.layerIndex % 4);
            this.camera.addLayer(5);
            layerIndex = this.layerIndex;
            Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: layerIndex });
        }
    }

    class CameraLookAt {
        constructor() {
            this.index = 0;
            this._translate = new Laya.Vector3(0, 0.7, 5);
            this._rotation = new Laya.Vector3(-15, 0, 0);
            this._rotation2 = new Laya.Vector3(-3.14 / 3, 0, 0);
            this._rotation3 = new Laya.Vector3(0, 45, 0);
            this._position = new Laya.Vector3(1.5, 0.0, 2);
            this._position2 = new Laya.Vector3(-1.5, 0.0, 2);
            this._position3 = new Laya.Vector3(0.0, 0.0, 2);
            this._up = new Laya.Vector3(0, 1, 0);
            this.btype = "CameraLookAt";
            this.stype = 0;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var resource = ["res/threeDimen/texture/layabox.png",
                    "res/threeDimen/skyBox/skyBox3/skyBox3.lmat"];
                Laya.Laya.loader.load(resource, Laya.Handler.create(this, this.onPreLoadFinish));
            });
        }
        onPreLoadFinish() {
            var scene = new Laya.Scene3D();
            Laya.Laya.stage.addChild(scene);
            this.camera = new Laya.Camera(0, 0.1, 100);
            this.camera.transform.translate(this._translate);
            this.camera.transform.rotate(this._rotation, true, false);
            this.camera.clearFlag = Laya.CameraClearFlags.SolidColor;
            this.camera.fieldOfView = 60;
            this.camera.addComponent(CameraMoveScript);
            scene.addChild(this.camera);
            let directlightSprite = new Laya.Sprite3D();
            let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
            scene.addChild(directlightSprite);
            dircom.color.setValue(1, 1, 1, 1);
            directlightSprite.transform.rotate(this._rotation2);
            var sprite = new Laya.Sprite3D;
            scene.addChild(sprite);
            this.box = sprite.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(0.5, 0.5, 0.5)));
            this.box.transform.position = this._position;
            this.box.transform.rotate(this._rotation3, false, false);
            this.capsule = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCapsule(0.25, 1, 10, 20));
            this.capsule.transform.position = this._position2;
            sprite.addChild(this.capsule);
            this.cylinder = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCylinder(0.25, 1, 20));
            this.cylinder.transform.position = this._position3;
            sprite.addChild(this.cylinder);
            var materialBill = new Laya.BlinnPhongMaterial;
            this.box.meshRenderer.material = materialBill;
            this.capsule.meshRenderer.material = materialBill;
            this.cylinder.meshRenderer.material = materialBill;
            var tex = Laya.Loader.getTexture2D("res/threeDimen/texture/layabox.png");
            materialBill.albedoTexture = tex;
            this.loadUI();
        }
        loadUI() {
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, function () {
                var changeActionButton = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "切换注视目标"));
                changeActionButton.size(200, 40);
                changeActionButton.labelBold = true;
                changeActionButton.labelSize = 30;
                changeActionButton.sizeGrid = "4,4,4,4";
                changeActionButton.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                changeActionButton.pos(Laya.Laya.stage.width / 2 - changeActionButton.width * Laya.Browser.pixelRatio / 2, Laya.Laya.stage.height - 100 * Laya.Browser.pixelRatio);
                changeActionButton.on(Laya.Event.CLICK, this, this.stypeFun0);
            }));
        }
        stypeFun0(index = 0) {
            this.index++;
            if (this.index % 3 === 1) {
                this.camera.transform.lookAt(this.box.transform.position, this._up);
            }
            else if (this.index % 3 === 2) {
                this.camera.transform.lookAt(this.cylinder.transform.position, this._up);
            }
            else {
                this.camera.transform.lookAt(this.capsule.transform.position, this._up);
            }
            index = this.index;
            Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: index });
        }
    }

    class CameraRay {
        constructor() {
            this._outHitResult = new Laya.HitResult();
            this.outs = [];
            this.posX = 0.0;
            this.posY = 0.0;
            this.point = new Laya.Vector2();
            this._text = new Laya.Text();
            this._translate = new Laya.Vector3(0, 6, 9.5);
            this._rotation = new Laya.Vector3(-15, 0, 0);
            this._forward = new Laya.Vector3(-1.0, -1.0, -1.0);
            this._tilingOffset = new Laya.Vector4(10, 10, 0, 0);
            this.tmpVector = new Laya.Vector3(0, 0, 0);
            this.tmpVector2 = new Laya.Vector3(0, 0, 0);
            this.btype = "CameraRay";
            this.stype = 0;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                this.camera = this.scene.addChild(new Laya.Camera(0, 0.1, 100));
                this.camera.transform.translate(this._translate);
                this.camera.transform.rotate(this._rotation, true, false);
                this.camera.addComponent(CameraMoveScript);
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                this.scene.addChild(directlightSprite);
                dircom.color.setValue(0.6, 0.6, 0.6, 1);
                var mat = directlightSprite.transform.worldMatrix;
                mat.setForward(this._forward);
                directlightSprite.transform.worldMatrix = mat;
                var plane = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(10, 10, 10, 10)));
                var planeMat = new Laya.BlinnPhongMaterial();
                Laya.Texture2D.load("res/threeDimen/Physics/grass.png", Laya.Handler.create(this, function (tex) {
                    planeMat.albedoTexture = tex;
                }));
                planeMat.tilingOffset = this._tilingOffset;
                plane.meshRenderer.material = planeMat;
                var planeStaticCollider = plane.addComponent(Laya.PhysicsCollider);
                var planeShape = new Laya.BoxColliderShape(10, 0, 10);
                planeStaticCollider.colliderShape = planeShape;
                planeStaticCollider.friction = 2;
                planeStaticCollider.restitution = 0.3;
                this.addMouseEvent();
                this._ray = new Laya.Ray(new Laya.Vector3(0, 0, 0), new Laya.Vector3(0, 0, 0));
            });
        }
        addBoxXYZ(x, y, z) {
            var mat1 = new Laya.BlinnPhongMaterial();
            Laya.Texture2D.load("res/threeDimen/Physics/rocks.jpg", Laya.Handler.create(this, function (tex) {
                mat1.albedoTexture = tex;
            }));
            var sX = Math.random() * 0.75 + 0.25;
            var sY = Math.random() * 0.75 + 0.25;
            var sZ = Math.random() * 0.75 + 0.25;
            var box = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(sX, sY, sZ)));
            box.meshRenderer.material = mat1;
            this.tmpVector.setValue(x, y, z);
            box.transform.position = this.tmpVector;
            this.tmpVector2.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
            box.transform.rotationEuler = this.tmpVector2;
            var rigidBody = box.addComponent(Laya.Rigidbody3D);
            var boxShape = new Laya.BoxColliderShape(sX, sY, sZ);
            rigidBody.colliderShape = boxShape;
            rigidBody.mass = 10;
        }
        addMouseEvent() {
            Laya.Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        }
        onMouseDown() {
            this.posX = this.point.x = Laya.Laya.stage.mouseX;
            this.posY = this.point.y = Laya.Laya.stage.mouseY;
            this.camera.viewportPointToRay(this.point, this._ray);
            this.scene.physicsSimulation.rayCastAll(this._ray, this.outs);
            if (this.outs.length != 0) {
                for (var i = 0; i < this.outs.length; i++) {
                    this.addBoxXYZ(this.outs[i].point.x, this.outs[i].point.y, this.outs[i].point.z);
                }
            }
            Client.instance.send({ type: "next", btype: this.btype, stype: 0 });
        }
    }

    class D3SpaceToD2Space {
        constructor() {
            this._position = new Laya.Vector3();
            this._outPos = new Laya.Vector4();
            this.scaleDelta = 0;
            this._translate = new Laya.Vector3(0, 0.35, 1);
            this._rotation = new Laya.Vector3(-15, 0, 0);
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                this.camera = this.scene.addChild(new Laya.Camera(0, 0.1, 100));
                this.camera.transform.translate(this._translate);
                this.camera.transform.rotate(this._rotation, true, false);
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                this.scene.addChild(directlightSprite);
                var completeHandler = Laya.Handler.create(this, this.onComplete);
                Laya.Laya.loader.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", completeHandler);
            });
        }
        onComplete() {
            var _this = this;
            Laya.Sprite3D.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Laya.Handler.create(this, function (layaMonkey3D) {
                _this.layaMonkey3D = layaMonkey3D;
                this.scene.addChild(layaMonkey3D);
                this.layaMonkey2D = Laya.Laya.stage.addChild(new Laya.Image("res/threeDimen/monkey.png"));
                Laya.Laya.timer.frameLoop(1, _this, this.animate);
            }));
        }
        animate() {
            this._position.x = Math.sin(this.scaleDelta += 0.01);
            this.layaMonkey3D.transform.position = this._position;
            var outPos = this._outPos;
            this.camera.viewport.project(this.layaMonkey3D.transform.position, this.camera.projectionViewMatrix, outPos);
            this.layaMonkey2D.pos(outPos.x / Laya.Laya.stage.clientScaleX, outPos.y / Laya.Laya.stage.clientScaleY);
        }
    }

    class MultiCamera {
        constructor() {
            this._translate = new Laya.Vector3(0, 0, 1.5);
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera1 = scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera1.clearColor = new Laya.Color(0.3, 0.3, 0.3, 1.0);
                camera1.transform.translate(this._translate);
                camera1.normalizedViewport = new Laya.Viewport(0, 0, 0.5, 1.0);
                var camera2 = scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera2.clearColor = new Laya.Color(0.0, 0.0, 1.0, 1.0);
                this._translate.setValue(0, 0, 1.5);
                camera2.transform.translate(this._translate);
                camera2.normalizedViewport = new Laya.Viewport(0.5, 0.0, 0.5, 0.5);
                camera2.addComponent(CameraMoveScript);
                camera2.clearFlag = Laya.CameraClearFlags.Sky;
                Laya.Material.load("res/threeDimen/skyBox/skyBox2/skyBox2.lmat", Laya.Handler.create(this, function (mat) {
                    var skyRenderer = camera2.scene.skyRenderer;
                    skyRenderer.mesh = Laya.SkyBox.instance;
                    skyRenderer.material = mat;
                }));
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                scene.addChild(directlightSprite);
                Laya.Sprite3D.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Laya.Handler.create(this, function (sp) {
                    var layaMonkey = scene.addChild(sp);
                }));
            });
        }
    }

    class OrthographicCamera {
        constructor() {
            this.pos = new Laya.Vector3(310, 500, 0);
            this._translate = new Laya.Vector3(0, 0, 0);
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = scene.addChild(new Laya.Camera(0, 0.1, 1000));
                camera.transform.rotate(new Laya.Vector3(0, 0, 0), false, false);
                camera.transform.translate(new Laya.Vector3(0, 1, 3));
                camera.orthographic = true;
                camera.clearFlag = Laya.CameraClearFlags.SolidColor;
                camera.orthographicVerticalSize = 10;
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                scene.addChild(directlightSprite);
                Laya.Sprite3D.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Laya.Handler.create(this, function (layaMonkey) {
                    scene.addChild(layaMonkey);
                    layaMonkey.transform.localScale = new Laya.Vector3(10, 10, 10);
                    layaMonkey.transform.localPosition = new Laya.Vector3(0, 0, 0);
                }));
            });
        }
    }

    class PickPixel {
        constructor() {
            this.isPick = false;
            this.text = new Laya.Text();
            this.btype = "PickPixel";
            this.stype = 0;
            Laya.Config.useRetinalCanvas = true;
            Laya.Laya.init(750, 1334).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.ray = new Laya.Ray(new Laya.Vector3(0, 0, 0), new Laya.Vector3(0, 0, 0));
                this._sp = new Laya.Sprite();
                Laya.Laya.stage.addChild(this._sp);
                this._sp.zOrder = 10;
                Laya.Laya.loader.load(["res/threeDimen/scene/CourtyardScene/Courtyard.ls", "res/threeDimen/texture/earth.png"], Laya.Handler.create(this, this.onComplete));
            });
        }
        onMouseDown() {
            this._sp.graphics.clear();
            this._sp.x = Laya.Laya.stage.mouseX;
            this._sp.y = Laya.Laya.stage.mouseY;
            var posX = Laya.Laya.stage.mouseX;
            var posY = Laya.Laya.stage.mouseY;
            var out = new Uint8Array(4);
            this.renderTargetCamera.renderTarget.getDataAsync(posX, posY, 1, 1, out).then((out) => {
                this.text.text = out[0] + " " + out[1] + " " + out[2] + " " + out[3];
                let r = out[0].toString(16);
                let g = out[1].toString(16);
                let b = out[2].toString(16);
                if (r.length < 2) {
                    r = 0 + r;
                }
                if (g.length < 2) {
                    g = 0 + g;
                }
                if (b.length < 2) {
                    b = 0 + b;
                }
                let color = `#${r}${g}${b}`;
                console.log(color);
                this._sp.alpha = out[3] / 255;
                this._sp.graphics.drawRect(0, 0, 100, 100, color, "#ffffff");
                Client.instance.send({ type: "next", btype: this.btype, stype: 1 });
            });
        }
        onResize() {
            var stageHeight = Laya.Laya.stage.height;
            var stageWidth = Laya.Laya.stage.width;
            this.renderTargetCamera && this.renderTargetCamera.renderTarget && this.renderTargetCamera.renderTarget.destroy();
            this.renderTargetCamera.renderTarget = Laya.RenderTexture.createFromPool(stageWidth, stageHeight, Laya.RenderTargetFormat.R8G8B8A8, Laya.RenderTargetFormat.DEPTH_16, false, 1, false, true);
            this.text.x = Laya.Laya.stage.width / 2;
            this.changeActionButton.pos(Laya.Laya.stage.width / 2 - this.changeActionButton.width * Laya.Browser.pixelRatio / 2, Laya.Laya.stage.height - 100 * Laya.Browser.pixelRatio);
        }
        onComplete() {
            this._thisscene = (Laya.Laya.stage.addChild(Laya.Loader.createNodes("res/threeDimen/scene/CourtyardScene/Courtyard.ls").scene3D));
            var scene = this._thisscene;
            var camera = scene.addChild(new Laya.Camera(0, 0.01, 1000));
            camera.transform.translate(new Laya.Vector3(57, 2.5, 58));
            camera.transform.rotate(new Laya.Vector3(-10, 150, 0), true, false);
            camera.clearFlag = Laya.CameraClearFlags.Sky;
            camera.addComponent(CameraMoveScript);
            this.renderTargetCamera = scene.addChild(new Laya.Camera(0, 0.1, 1000));
            this.renderTargetCamera.transform.translate(new Laya.Vector3(57, 2.5, 58));
            this.renderTargetCamera.transform.rotate(new Laya.Vector3(-10, 150, 0), true, false);
            this.renderTargetCamera.clearFlag = Laya.CameraClearFlags.Sky;
            var stageHeight = Laya.Laya.stage.height;
            var stageWidth = Laya.Laya.stage.width;
            this.renderTargetCamera.renderTarget = Laya.RenderTexture.createFromPool(stageWidth, stageHeight, Laya.RenderTargetFormat.R8G8B8A8, Laya.RenderTargetFormat.DEPTH_16, false, 1, false, true);
            this.renderTargetCamera.renderingOrder = -1;
            this.renderTargetCamera.addComponent(CameraMoveScript);
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, function () {
                this.changeActionButton = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "拾取像素"));
                this.changeActionButton.size(160, 40);
                this.changeActionButton.labelBold = true;
                this.changeActionButton.labelSize = 30;
                this.changeActionButton.sizeGrid = "4,4,4,4";
                this.changeActionButton.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.changeActionButton.pos(Laya.Laya.stage.width / 2 - this.changeActionButton.width * Laya.Browser.pixelRatio / 2, Laya.Laya.stage.height - 100 * Laya.Browser.pixelRatio);
                this.changeActionButton.on(Laya.Event.CLICK, this, this.stypeFun0);
            }));
            this.text.x = Laya.Laya.stage.width / 2 - 50;
            this.text.y = 50;
            this.text.overflow = Laya.Text.HIDDEN;
            this.text.color = "#FFFFFF";
            this.text.font = "Impact";
            this.text.fontSize = 20;
            this.text.borderColor = "#FFFF00";
            this.text.x = Laya.Laya.stage.width / 2;
            this.text.text = "选中的颜色：";
            Laya.Laya.stage.addChild(this.text);
            Laya.Laya.stage.on(Laya.Event.RESIZE, this, this.onResize);
        }
        stypeFun0(label = "拾取像素") {
            if (this.isPick) {
                Laya.Laya.stage.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
                this.changeActionButton.label = "拾取像素";
                this.isPick = false;
            }
            else {
                Laya.Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
                this.changeActionButton.label = "结束拾取";
                this.isPick = true;
            }
            label = this.changeActionButton.label;
            Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: label });
        }
    }

    class RenderTargetCamera {
        constructor() {
            this.btype = "RenderTargetCamera";
            this.stype = 0;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                Laya.Laya.loader.load(["res/threeDimen/scene/LayaScene_city01/Conventional/city01.ls"], Laya.Handler.create(this, this.onComplete));
            });
        }
        onComplete() {
            Laya.Scene.open("res/threeDimen/scene/LayaScene_city01/Conventional/city01.ls", true, null, Laya.Handler.create(this, function (sce) {
                var scene = sce.scene3D;
                var camera = scene.getChildByName("Main Camera");
                camera.addComponent(CameraMoveScript);
                var box = scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(6, 6)));
                box.transform.position = new Laya.Vector3(-28.8, 8, -65);
                box.transform.rotate(new Laya.Vector3(90, 0, 0), true, false);
                var mat = new Laya.UnlitMaterial();
                mat.albedoColor = new Laya.Color(1.0, 1.0, 1.0, 1.0);
                mat.cull = Laya.RenderState.CULL_NONE;
                box.meshRenderer.sharedMaterial = mat;
                Laya.Sprite3D.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Laya.Handler.create(this, function (layaMonkey) {
                    scene.addChild(layaMonkey);
                    layaMonkey.transform.localScale = new Laya.Vector3(6, 6, 6);
                    layaMonkey.transform.rotate(new Laya.Vector3(0, 180, 0), true, false);
                    layaMonkey.transform.position = new Laya.Vector3(-28.8, 5, -53);
                }));
                Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, function () {
                    var changeActionButton = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "渲染目标"));
                    changeActionButton.size(160, 40);
                    changeActionButton.labelBold = true;
                    changeActionButton.labelSize = 30;
                    changeActionButton.sizeGrid = "4,4,4,4";
                    changeActionButton.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                    changeActionButton.pos(Laya.Laya.stage.width / 2 - changeActionButton.width * Laya.Browser.pixelRatio / 2, Laya.Laya.stage.height - 100 * Laya.Browser.pixelRatio);
                    changeActionButton.on(Laya.Event.CLICK, this, this.stypeFun0);
                }));
                this.scene = scene;
                this.mat = mat;
            }));
        }
        stypeFun0() {
            Client.instance.send({ type: "next", btype: this.btype, stype: 0 });
            var renderTargetCamera = this.scene.addChild(new Laya.Camera(0, 0.3, 1000));
            renderTargetCamera.transform.position = new Laya.Vector3(-28.8, 8, -60);
            renderTargetCamera.transform.rotate(new Laya.Vector3(0, 180, 0), true, false);
            renderTargetCamera.renderTarget = Laya.RenderTexture.createFromPool(512, 512, Laya.RenderTargetFormat.R8G8B8A8, Laya.RenderTargetFormat.DEPTH_16, false, 1, false, true);
            renderTargetCamera.renderingOrder = -1;
            renderTargetCamera.clearFlag = Laya.CameraClearFlags.Sky;
            this.mat.albedoTexture = renderTargetCamera.renderTarget;
        }
    }

    class DirectionLightDemo {
        constructor() {
            this._quaternion = new Laya.Quaternion();
            this._direction = new Laya.Vector3();
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = (scene.addChild(new Laya.Camera(0, 0.1, 1000)));
                camera.transform.translate(new Laya.Vector3(0, 0.7, 1.3));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                camera.addComponent(CameraMoveScript);
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                scene.addChild(directlightSprite);
                dircom.color.setValue(1, 1, 1, 1);
                var mat = directlightSprite.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(-1.0, -1.0, -1.0));
                directlightSprite.transform.worldMatrix = mat;
                Laya.Sprite3D.load("res/threeDimen/staticModel/grid/plane.lh", Laya.Handler.create(this, function (sprite) {
                    var grid = scene.addChild(sprite);
                    Laya.Sprite3D.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Laya.Handler.create(this, function (layaMonkey) {
                        var layaMonkey = scene.addChild(layaMonkey);
                        Laya.Laya.timer.frameLoop(1, this, function () {
                            Laya.Quaternion.createFromYawPitchRoll(0.025, 0, 0, this._quaternion);
                            directlightSprite.transform.worldMatrix.getForward(this._direction);
                            Laya.Vector3.transformQuat(this._direction, this._quaternion, this._direction);
                            var mat = directlightSprite.transform.worldMatrix;
                            mat.setForward(this._direction);
                            directlightSprite.transform.worldMatrix = mat;
                        });
                    }));
                }));
            });
        }
    }

    class PointLightDemo {
        constructor() {
            this._temp_position = new Laya.Vector3();
            this._temp_quaternion = new Laya.Quaternion();
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                scene.ambientColor = new Laya.Color(0.1, 0.1, 0.1);
                var camera = (scene.addChild(new Laya.Camera(0, 0.1, 1000)));
                camera.transform.translate(new Laya.Vector3(0, 0.7, 1.3));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                camera.addComponent(CameraMoveScript);
                let pointLight = new Laya.Sprite3D();
                let pointCom = pointLight.addComponent(Laya.PointLightCom);
                scene.addChild(pointLight);
                pointCom.color = new Laya.Color(1.0, 0.5, 0.0, 1);
                pointCom.range = 3.0;
                pointLight.transform.position = new Laya.Vector3(0.4, 0.4, 0.0);
                Laya.Sprite3D.load("res/threeDimen/staticModel/grid/plane.lh", Laya.Handler.create(this, (sprite) => {
                    var grid = scene.addChild(sprite);
                    Laya.Sprite3D.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Laya.Handler.create(this, (layaMonkey) => {
                        scene.addChild(layaMonkey);
                        Laya.Laya.timer.frameLoop(1, this, () => {
                            Laya.Quaternion.createFromYawPitchRoll(0.025, 0, 0, this._temp_quaternion);
                            Laya.Vector3.transformQuat(pointLight.transform.position, this._temp_quaternion, this._temp_position);
                            pointLight.transform.position = this._temp_position;
                        });
                    }));
                }));
            });
        }
    }

    class RotationScript$2 extends Laya.Script {
        constructor() {
            super(...arguments);
            this.autoRotateSpeed = new Laya.Vector3(0, 0.05, 0);
            this.rotation = true;
        }
        onUpdate() {
            if (this.rotation)
                this.owner.transform.rotate(this.autoRotateSpeed, false);
        }
    }
    class RealTimeShadow {
        constructor() {
            this.btype = "RealTimeShadow";
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                Laya.Laya.loader.load([
                    "res/threeDimen/staticModel/grid/plane.lh",
                    "res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh"
                ], Laya.Handler.create(this, this.onComplete));
            });
        }
        onComplete() {
            var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
            var camera = (scene.addChild(new Laya.Camera(0, 0.1, 100)));
            camera.transform.translate(new Laya.Vector3(0, 1.2, 1.6));
            camera.transform.rotate(new Laya.Vector3(-35, 0, 0), true, false);
            camera.addComponent(CameraMoveScript);
            var directionLight = new Laya.Sprite3D();
            var directionLightCom = directionLight.addComponent(Laya.DirectionLightCom);
            scene.addChild(directionLight);
            directionLightCom.color = new Laya.Color(0.85, 0.85, 0.8, 1);
            directionLight.transform.rotate(new Laya.Vector3(-Math.PI / 3, 0, 0));
            directionLightCom.shadowMode = Laya.ShadowMode.SoftLow;
            directionLightCom.shadowDistance = 3;
            directionLightCom.shadowResolution = 1024;
            directionLightCom.shadowCascadesMode = Laya.ShadowCascadesMode.NoCascades;
            directionLightCom.shadowNormalBias = 4;
            this.rotationScript = directionLight.addComponent(RotationScript$2);
            var grid = scene.addChild(Laya.Loader.createNodes("res/threeDimen/staticModel/grid/plane.lh"));
            grid.getChildAt(0).getComponent(Laya.MeshRenderer).receiveShadow = true;
            var layaMonkey = scene.addChild(Laya.Loader.createNodes("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh"));
            layaMonkey.transform.localScale = new Laya.Vector3(2, 2, 2);
            layaMonkey.getChildAt(0).getChildAt(1).getComponent(Laya.SkinnedMeshRenderer).castShadow = true;
            var sphereSprite = this.addPBRSphere(Laya.PrimitiveMesh.createSphere(0.1), new Laya.Vector3(0, 0.2, 0.5), scene);
            sphereSprite.getComponent(Laya.MeshRenderer).castShadow = true;
            this.loadUI();
        }
        addPBRSphere(sphereMesh, position, scene) {
            var mat = new Laya.PBRStandardMaterial();
            mat.smoothness = 0.2;
            var meshSprite = new Laya.MeshSprite3D(sphereMesh);
            meshSprite.getComponent(Laya.MeshRenderer).sharedMaterial = mat;
            var transform = meshSprite.transform;
            transform.localPosition = position;
            scene.addChild(meshSprite);
            return meshSprite;
        }
        loadUI() {
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, function () {
                this.rotationButton = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "Stop Rotation"));
                this.rotationButton.size(150, 30);
                this.rotationButton.labelSize = 20;
                this.rotationButton.sizeGrid = "4,4,4,4";
                this.rotationButton.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.rotationButton.pos(Laya.Laya.stage.width / 2 - this.rotationButton.width * Laya.Browser.pixelRatio / 2, Laya.Laya.stage.height - 40 * Laya.Browser.pixelRatio);
                this.rotationButton.on(Laya.Event.CLICK, this, this.stypeFun0);
            }));
        }
        stypeFun0(label = "Stop Rotation") {
            if (this.rotationScript.rotation) {
                this.rotationButton.label = "Start Rotation";
                this.rotationScript.rotation = false;
            }
            else {
                this.rotationButton.label = "Stop Rotation";
                this.rotationScript.rotation = true;
            }
            label = this.rotationButton.label;
            Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: label });
        }
    }

    class SpotLightDemo {
        constructor() {
            this._quaternion = new Laya.Quaternion();
            this._direction = new Laya.Vector3();
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = (scene.addChild(new Laya.Camera(0, 0.1, 1000)));
                camera.transform.translate(new Laya.Vector3(0, 0.7, 1.3));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                camera.addComponent(CameraMoveScript);
                let spotlightSprite = new Laya.Sprite3D();
                let spotcom = spotlightSprite.addComponent(Laya.SpotLightCom);
                scene.addChild(spotlightSprite);
                spotcom.color = new Laya.Color(1, 1, 0, 1);
                spotlightSprite.transform.position = new Laya.Vector3(0.0, 1.2, 0.0);
                var mat = spotlightSprite.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(0.15, -1.0, 0.0));
                spotlightSprite.transform.worldMatrix = mat;
                spotcom.range = 1.6;
                spotcom.intensity = 8.0;
                spotcom.spotAngle = 32;
                Laya.Sprite3D.load("res/threeDimen/staticModel/grid/plane.lh", Laya.Handler.create(this, function (sprite) {
                    scene.addChild(sprite);
                    Laya.Sprite3D.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Laya.Handler.create(this, function (layaMonkey) {
                        scene.addChild(layaMonkey);
                        Laya.Laya.timer.frameLoop(1, this, function () {
                            Laya.Quaternion.createFromYawPitchRoll(0.025, 0, 0, this._quaternion);
                            spotlightSprite.transform.worldMatrix.getForward(this._direction);
                            Laya.Vector3.transformQuat(this._direction, this._quaternion, this._direction);
                            var mat = spotlightSprite.transform.worldMatrix;
                            mat.setForward(this._direction);
                            spotlightSprite.transform.worldMatrix = mat;
                        });
                    }));
                }));
            });
        }
    }

    class BlinnPhongMaterialLoad {
        constructor() {
            this.rotation = new Laya.Vector3(0, 0.01, 0);
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.transform.translate(new Laya.Vector3(0, 0.9, 1.5));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                scene.addChild(directlightSprite);
                dircom.color.setValue(0.6, 0.6, 0.6, 1);
                Laya.Mesh.load("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm", Laya.Handler.create(this, (mesh) => {
                    var layaMonkey = scene.addChild(new Laya.MeshSprite3D(mesh));
                    layaMonkey.transform.localScale = new Laya.Vector3(0.3, 0.3, 0.3);
                    layaMonkey.transform.rotation = new Laya.Quaternion(0.7071068, 0, 0, -0.7071067);
                    Laya.Material.load("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/Materials/T_Diffuse.lmat", Laya.Handler.create(this, (mat) => {
                        layaMonkey.meshRenderer.material = mat;
                    }));
                    Laya.Laya.timer.frameLoop(1, this, () => {
                        layaMonkey.transform.rotate(this.rotation, false);
                    });
                }));
            });
        }
    }

    class BlinnPhong_DiffuseMap {
        constructor() {
            this.rotation = new Laya.Vector3(0, 0.01, 0);
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = (scene.addChild(new Laya.Camera(0, 0.1, 100)));
                camera.transform.translate(new Laya.Vector3(0, 0.5, 1.5));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                camera.clearFlag = Laya.CameraClearFlags.Sky;
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                scene.addChild(directlightSprite);
                dircom.color.setValue(1, 1, 1, 1);
                var sphereMesh = Laya.PrimitiveMesh.createSphere();
                var earth1 = scene.addChild(new Laya.MeshSprite3D(sphereMesh));
                earth1.transform.position = new Laya.Vector3(-0.6, 0, 0);
                var earth2 = scene.addChild(new Laya.MeshSprite3D(sphereMesh));
                earth2.transform.position = new Laya.Vector3(0.6, 0, 0);
                var material = new Laya.BlinnPhongMaterial();
                Laya.Texture2D.load("res/threeDimen/texture/earth.png", Laya.Handler.create(this, function (texture) {
                    material.albedoTexture = texture;
                }));
                earth2.meshRenderer.material = material;
                Laya.Laya.timer.frameLoop(1, this, function () {
                    earth1.transform.rotate(this.rotation, false);
                    earth2.transform.rotate(this.rotation, false);
                });
            });
        }
    }

    class BlinnPhong_NormalMap {
        constructor() {
            this.rotation = new Laya.Vector3(0, 0.01, 0);
            this.normalMapUrl = ["res/threeDimen/staticModel/lizard/Assets/Lizard/lizardeye_norm.png", "res/threeDimen/staticModel/lizard/Assets/Lizard/lizard_norm.png", "res/threeDimen/staticModel/lizard/Assets/Lizard/rock_norm.png"];
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = (this.scene.addChild(new Laya.Camera(0, 0.1, 100)));
                camera.transform.translate(new Laya.Vector3(0, 0.6, 1.1));
                camera.transform.rotate(new Laya.Vector3(-30, 0, 0), true, false);
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                this.scene.addChild(directlightSprite);
                var mat = directlightSprite.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(0.0, -0.8, -1.0));
                directlightSprite.transform.worldMatrix = mat;
                dircom.color.setValue(1, 1, 1, 1);
                Laya.Laya.loader.load("res/threeDimen/staticModel/lizard/lizard.lh", Laya.Handler.create(this, this.onComplete), null, Laya.Loader.HIERARCHY);
            });
        }
        onComplete(s) {
            Laya.Sprite3D.load("res/threeDimen/staticModel/lizard/lizard.lh", Laya.Handler.create(this, function (sprite) {
                var monster1 = this.scene.addChild(sprite);
                monster1.transform.position = new Laya.Vector3(-0.6, 0, 0);
                monster1.transform.localScale = new Laya.Vector3(0.075, 0.075, 0.075);
                var monster2 = Laya.Sprite3D.instantiate(monster1, this.scene, false, new Laya.Vector3(0.6, 0, 0));
                monster2.transform.localScale = new Laya.Vector3(0.075, 0.075, 0.075);
                for (var i = 0; i < monster2.getChildByName("lizard").numChildren; i++) {
                    var meshSprite3D = monster2.getChildByName("lizard").getChildAt(i);
                    let render = meshSprite3D.getComponent(Laya.MeshRenderer);
                    var material = render.material;
                    Laya.Texture2D.load(this.normalMapUrl[i], Laya.Handler.create(this, function (mat, texture) {
                        mat.addDefine(Laya.Shader3D.getDefineByName("NORMALMAP"));
                        mat.setTexture("u_NormalTexture", texture);
                    }, [material]));
                }
                Laya.Laya.timer.frameLoop(1, this, function () {
                    monster1.transform.rotate(this.rotation);
                    monster2.transform.rotate(this.rotation);
                });
            }));
        }
    }

    class BlinnPhong_SpecularMap {
        constructor() {
            this.rotation = new Laya.Vector3(0, 0.01, 0);
            this.specularMapUrl = ["res/threeDimen/skinModel/dude/Assets/dude/headS.png", "res/threeDimen/skinModel/dude/Assets/dude/jacketS.png", "res/threeDimen/skinModel/dude/Assets/dude/pantsS.png", "res/threeDimen/skinModel/dude/Assets/dude/upBodyS.png", "res/threeDimen/skinModel/dude/Assets/dude/upBodyS.png"];
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = (this.scene.addChild(new Laya.Camera(0, 0.1, 1000)));
                camera.transform.translate(new Laya.Vector3(0, 3, 5));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                camera.addComponent(CameraMoveScript);
                let directionLight = new Laya.Sprite3D();
                let dircom = directionLight.addComponent(Laya.DirectionLightCom);
                this.scene.addChild(directionLight);
                dircom.color.setValue(1, 1, 1, 1);
                Laya.Laya.loader.load("res/threeDimen/skinModel/dude/dude.lh", Laya.Handler.create(this, this.onComplete));
            });
        }
        onComplete() {
            Laya.Sprite3D.load("res/threeDimen/skinModel/dude/dude.lh", Laya.Handler.create(this, (sprite) => {
                var dude1 = this.scene.addChild(sprite);
                dude1.transform.position = new Laya.Vector3(-1.5, 0, 0);
                var dude2 = Laya.Sprite3D.instantiate(dude1, this.scene, false, new Laya.Vector3(1.5, 0, 0));
                var skinnedMeshSprite3d = dude2.getChildAt(0).getChildAt(0);
                for (var i = 0; i < skinnedMeshSprite3d.getComponent(Laya.SkinnedMeshRenderer).materials.length; i++) {
                    var material = skinnedMeshSprite3d.getComponent(Laya.SkinnedMeshRenderer).materials[i];
                    Laya.Texture2D.load(this.specularMapUrl[i], Laya.Handler.create(this, function (mat, tex) {
                        mat.specularTexture = tex;
                    }, [material]));
                }
                Laya.Laya.timer.frameLoop(1, this, () => {
                    dude1.transform.rotate(this.rotation);
                    dude2.transform.rotate(this.rotation);
                });
            }));
        }
    }

    class EffectMaterialDemo {
        constructor() {
            this.rotation = new Laya.Vector3(0, 0.01, 0);
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = (scene.addChild(new Laya.Camera(0, 0.1, 100)));
                camera.transform.translate(new Laya.Vector3(0, 0.5, 1.5));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                camera.clearFlag = Laya.CameraClearFlags.Sky;
                let directionLight = new Laya.Sprite3D();
                let dircom = directionLight.addComponent(Laya.DirectionLightCom);
                scene.addChild(directionLight);
                dircom.color.setValue(1, 1, 1, 1);
                let mesh = Laya.PrimitiveMesh.createSphere();
                var earth = new Laya.Sprite3D();
                let earthMeshrender = earth.addComponent(Laya.MeshRenderer);
                let earthFilter = earth.addComponent(Laya.MeshFilter);
                earthFilter.sharedMesh = mesh;
                scene.addChild(earth);
                earth.transform.position = new Laya.Vector3(0, 0, 0);
                var material = new Laya.EffectMaterial();
                Laya.Texture2D.load("res/threeDimen/texture/earth.png", Laya.Handler.create(this, (texture) => {
                    material.texture = texture;
                    material.color = new Laya.Color(0.6, 0.6, 0.6, 1);
                }));
                earthMeshrender.material = material;
                Laya.Laya.timer.frameLoop(1, this, () => {
                    earth.transform.rotate(this.rotation, false);
                });
            });
        }
    }

    class MaterialDemo {
        constructor() {
            this.index = 0;
            this.btype = "MaterialDemo";
            this.stype = 0;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var resource = ["res/threeDimen/scene/ChangeMaterialDemo/Conventional/scene.ls", "res/threeDimen/texture/earth.png"];
                Laya.Laya.loader.load(resource, Laya.Handler.create(this, this.onPreLoadFinish));
            });
        }
        onPreLoadFinish() {
            Laya.Scene.open("res/threeDimen/scene/ChangeMaterialDemo/Conventional/scene.ls", true, null, Laya.Handler.create(this, (sce) => {
                var scene = sce.scene3D;
                var camera = scene.getChildByName("Main Camera");
                camera.addComponent(CameraMoveScript);
                this.sphere = scene.getChildByName("Sphere");
                this.loadUI();
            }));
        }
        loadUI() {
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, () => {
                this.changeActionButton = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "切换材质"));
                this.changeActionButton.size(160, 40);
                this.changeActionButton.labelBold = true;
                this.changeActionButton.labelSize = 30;
                this.changeActionButton.sizeGrid = "4,4,4,4";
                this.changeActionButton.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.changeActionButton.pos(Laya.Laya.stage.width / 2 - this.changeActionButton.width * Laya.Browser.pixelRatio / 2, Laya.Laya.stage.height - 100 * Laya.Browser.pixelRatio);
                this.changeActionButton.on(Laya.Event.CLICK, this, this.stypeFun0);
            }));
        }
        stypeFun0(index = 0) {
            this.index++;
            if (this.index % 2 === 1) {
                Laya.Laya.loader.load("res/threeDimen/texture/earth.png").then(() => {
                    var pbrStandardMaterial = new Laya.PBRStandardMaterial();
                    var pbrTexture = Laya.Loader.getTexture2D("res/threeDimen/texture/earth.png");
                    pbrStandardMaterial.albedoTexture = pbrTexture;
                    this.sphere.getComponent(Laya.MeshRenderer).material = pbrStandardMaterial;
                });
            }
            else {
                Laya.Material.load("res/threeDimen/scene/ChangeMaterialDemo/Conventional/Assets/Materials/layabox.lmat", Laya.Handler.create(this, (mat) => {
                    this.sphere.getComponent(Laya.MeshRenderer).material = mat;
                }));
            }
            index = this.index;
            Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: index });
        }
    }

    class UnlitMaterialDemo {
        constructor() {
            this.rotation = new Laya.Vector3(0, 0.01, 0);
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = (scene.addChild(new Laya.Camera(0, 0.1, 100)));
                camera.transform.translate(new Laya.Vector3(0, 0.5, 1.5));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                camera.clearFlag = Laya.CameraClearFlags.Sky;
                var directionLight = scene.addChild(new Laya.Sprite3D());
                var directionLightCom = directionLight.addComponent(Laya.DirectionLightCom);
                directionLightCom.color.setValue(1, 1, 1, 1);
                var sphereMesh = Laya.PrimitiveMesh.createSphere();
                var earth1 = new Laya.Sprite3D();
                let earth1Meshrender = earth1.addComponent(Laya.MeshRenderer);
                let earth1Meshfilter = earth1.addComponent(Laya.MeshFilter);
                earth1Meshfilter.sharedMesh = sphereMesh;
                scene.addChild(earth1);
                earth1.transform.position = new Laya.Vector3(-0.6, 0, 0);
                var earth2 = new Laya.Sprite3D();
                let earth2Meshrender = earth2.addComponent(Laya.MeshRenderer);
                let earth2Meshfilter = earth2.addComponent(Laya.MeshFilter);
                earth2Meshfilter.sharedMesh = sphereMesh;
                scene.addChild(earth2);
                earth2.transform.position = new Laya.Vector3(0.6, 0, 0);
                var material = new Laya.BlinnPhongMaterial();
                Laya.Texture2D.load("res/threeDimen/texture/earth.png", Laya.Handler.create(this, function (texture) {
                    material.albedoTexture = texture;
                    material.albedoIntensity = 1;
                }));
                earth1Meshrender.material = material;
                var material2 = new Laya.UnlitMaterial();
                Laya.Texture2D.load("res/threeDimen/texture/earth.png", Laya.Handler.create(this, function (texture) {
                    material2.albedoTexture = texture;
                    material2.albedoIntensity = 1;
                    material2.albedoColor = new Laya.Color(1, 1, 1, 1);
                }));
                earth2Meshrender.material = material2;
                Laya.Laya.timer.frameLoop(1, this, () => {
                    earth1.transform.rotate(this.rotation, false);
                    earth2.transform.rotate(this.rotation, false);
                });
            });
        }
    }

    class ChangeMesh {
        constructor() {
            this.index = 0;
            this.btype = "ChangeMesh";
            this.stype = 0;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var resource = ["res/threeDimen/scene/ChangeMaterialDemo/Conventional/scene.ls"];
                Laya.Laya.loader.load(resource, Laya.Handler.create(this, this.onPreLoadFinish));
            });
        }
        onPreLoadFinish() {
            Laya.Scene.open("res/threeDimen/scene/ChangeMaterialDemo/Conventional/scene.ls", true, null, Laya.Handler.create(this, (sce) => {
                var scene = sce.scene3D;
                var camera = scene.getChildByName("Main Camera");
                camera.addComponent(CameraMoveScript);
                this.sphere = scene.getChildByName("Sphere");
                this.sphereMesh = this.sphere.getComponent(Laya.MeshFilter).sharedMesh;
                console.log("创建mesh");
                this.box = this.createBox();
                this.capsule = this.createCapsule();
                this.cylinder = this.createCylinder();
                this.cone = this.createCone();
                this.loadUI();
            }));
        }
        createBox() {
            return Laya.PrimitiveMesh.createBox(0.5, 0.5, 0.5);
        }
        createCapsule() {
            return Laya.PrimitiveMesh.createCapsule(0.25, 1, 10, 20);
        }
        createCylinder() {
            return Laya.PrimitiveMesh.createCylinder(0.25, 1, 20);
        }
        createCone() {
            return Laya.PrimitiveMesh.createCone(0.25, 0.75);
        }
        loadUI() {
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, () => {
                this.changeActionButton = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "切换Mesh"));
                this.changeActionButton.size(160, 40);
                this.changeActionButton.labelBold = true;
                this.changeActionButton.labelSize = 30;
                this.changeActionButton.sizeGrid = "4,4,4,4";
                this.changeActionButton.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.changeActionButton.pos(Laya.Laya.stage.width / 2 - this.changeActionButton.width * Laya.Browser.pixelRatio / 2, Laya.Laya.stage.height - 100 * Laya.Browser.pixelRatio);
                this.changeActionButton.on(Laya.Event.CLICK, this, this.stypeFun0);
            }));
        }
        stypeFun0(index = 0) {
            this.index++;
            if (this.index % 5 === 1) {
                this.sphere.getComponent(Laya.MeshFilter).sharedMesh = this.createBox();
            }
            else if (this.index % 5 === 2) {
                this.sphere.getComponent(Laya.MeshFilter).sharedMesh = this.createCapsule();
            }
            else if (this.index % 5 === 3) {
                this.sphere.getComponent(Laya.MeshFilter).sharedMesh = this.createCylinder();
            }
            else if (this.index % 5 === 4) {
                this.sphere.getComponent(Laya.MeshFilter).sharedMesh = this.createCone();
            }
            else {
                this.sphere.getComponent(Laya.MeshFilter).sharedMesh = this.sphereMesh;
            }
            index = this.index;
            Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: index });
        }
    }

    class Tool {
        static linearModel(sprite3D, lineSprite3D, color) {
            if (sprite3D instanceof Laya.Sprite3D && sprite3D.getComponent(Laya.MeshRenderer) && sprite3D.getComponent(Laya.MeshFilter)) {
                var meshSprite3D = sprite3D;
                var mesh = meshSprite3D.getComponent(Laya.MeshFilter).sharedMesh;
                var positions = [];
                mesh.getPositions(positions);
                var indices = mesh.getSubMesh(0).getIndices();
                for (var i = 0; i < indices.length; i += 3) {
                    var vertex0 = positions[indices[i]];
                    var vertex1 = positions[indices[i + 1]];
                    var vertex2 = positions[indices[i + 2]];
                    Laya.Vector3.transformCoordinate(vertex0, meshSprite3D.transform.worldMatrix, this.transVertex0);
                    Laya.Vector3.transformCoordinate(vertex1, meshSprite3D.transform.worldMatrix, this.transVertex1);
                    Laya.Vector3.transformCoordinate(vertex2, meshSprite3D.transform.worldMatrix, this.transVertex2);
                    lineSprite3D.addLine(this.transVertex0, this.transVertex1, color, color);
                    lineSprite3D.addLine(this.transVertex1, this.transVertex2, color, color);
                    lineSprite3D.addLine(this.transVertex2, this.transVertex0, color, color);
                }
            }
            for (var i = 0, n = sprite3D.numChildren; i < n; i++)
                Tool.linearModel(sprite3D.getChildAt(i), lineSprite3D, color);
        }
        static DrawBoundingBox(sprite3D, sprite, color) {
            (sprite3D).getComponent(Laya.MeshRenderer).bounds.getCorners(Tool.corners);
            var rotate = new Laya.Vector3(0, 0, 90);
            Tool.DrawTwelveLines(Tool.corners[0], Tool.corners[1], rotate, sprite);
            rotate.setValue(0, 0, 0);
            Tool.DrawTwelveLines(Tool.corners[1], Tool.corners[2], rotate, sprite);
            rotate.setValue(0, 0, 90);
            Tool.DrawTwelveLines(Tool.corners[2], Tool.corners[3], rotate, sprite);
            rotate.setValue(0, 0, 0);
            Tool.DrawTwelveLines(Tool.corners[3], Tool.corners[0], rotate, sprite);
            rotate.setValue(0, 0, 90);
            Tool.DrawTwelveLines(Tool.corners[4], Tool.corners[5], rotate, sprite);
            rotate.setValue(0, 0, 0);
            Tool.DrawTwelveLines(Tool.corners[5], Tool.corners[6], rotate, sprite);
            rotate.setValue(0, 0, 90);
            Tool.DrawTwelveLines(Tool.corners[6], Tool.corners[7], rotate, sprite);
            rotate.setValue(0, 0, 0);
            Tool.DrawTwelveLines(Tool.corners[7], Tool.corners[4], rotate, sprite);
            rotate.setValue(90, 0, 0);
            Tool.DrawTwelveLines(Tool.corners[0], Tool.corners[4], rotate, sprite);
            rotate.setValue(90, 0, 0);
            Tool.DrawTwelveLines(Tool.corners[1], Tool.corners[5], rotate, sprite);
            rotate.setValue(90, 0, 0);
            Tool.DrawTwelveLines(Tool.corners[2], Tool.corners[6], rotate, sprite);
            rotate.setValue(90, 0, 0);
            Tool.DrawTwelveLines(Tool.corners[3], Tool.corners[7], rotate, sprite);
        }
        static DrawTwelveLines(start, end, rotate, sprite3D) {
            var length = Laya.Vector3.distance(start, end);
            var cylinder = new Laya.Sprite3D();
            let mesh = Laya.PrimitiveMesh.createCylinder(0.004, length, 3);
            let cylinderrender = cylinder.addComponent(Laya.MeshRenderer);
            let cylinderfilter = cylinder.addComponent(Laya.MeshFilter);
            cylinderfilter.sharedMesh = mesh;
            sprite3D.addChild(cylinder);
            cylinder.transform.rotate(rotate, true, false);
            var cylPos = cylinder.transform.position;
            var x = start.x + end.x;
            var y = start.y + end.y;
            var z = start.z + end.z;
            cylPos.setValue(x / 2, y / 2, z / 2);
            cylinder.transform.position = cylPos;
        }
        constructor() {
        }
    }
    Tool.transVertex0 = new Laya.Vector3();
    Tool.transVertex1 = new Laya.Vector3();
    Tool.transVertex2 = new Laya.Vector3();
    Tool.corners = [];

    class CustomMesh {
        constructor() {
            this.btype = "CustomMesh";
            this.stype = 0;
            this.curStateIndex = 0;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.transform.translate(new Laya.Vector3(0, 2, 5));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                camera.addComponent(CameraMoveScript);
                camera.clearColor = new Laya.Color(0.2, 0.2, 0.2, 1.0);
                let directionLight = new Laya.Sprite3D();
                let dircom = directionLight.addComponent(Laya.DirectionLightCom);
                scene.addChild(directionLight);
                var mat = directionLight.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(-1.0, -1.0, -1.0));
                directionLight.transform.worldMatrix = mat;
                this.sprite3D = scene.addChild(new Laya.Sprite3D());
                this.lineSprite3D = scene.addChild(new Laya.Sprite3D());
                var box = this.sprite3D.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(0.5, 0.5, 0.5)));
                box.transform.position = new Laya.Vector3(2.0, 0.25, 0.6);
                box.transform.rotate(new Laya.Vector3(0, 45, 0), false, false);
                var boxLineSprite3D = this.lineSprite3D.addChild(new Laya.PixelLineSprite3D(100));
                Tool.linearModel(box, boxLineSprite3D, Laya.Color.GREEN);
                var sphere = this.sprite3D.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createSphere(0.25, 20, 20)));
                sphere.transform.position = new Laya.Vector3(1.0, 0.25, 0.6);
                var sphereLineSprite3D = this.lineSprite3D.addChild(new Laya.PixelLineSprite3D(3500));
                Tool.linearModel(sphere, sphereLineSprite3D, Laya.Color.GREEN);
                var cylinder = this.sprite3D.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCylinder(0.25, 1, 20)));
                cylinder.transform.position = new Laya.Vector3(0, 0.5, 0.6);
                var cylinderLineSprite3D = this.lineSprite3D.addChild(new Laya.PixelLineSprite3D(1000));
                Tool.linearModel(cylinder, cylinderLineSprite3D, Laya.Color.GREEN);
                var capsule = this.sprite3D.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCapsule(0.25, 1, 10, 20)));
                capsule.transform.position = new Laya.Vector3(-1.0, 0.5, 0.6);
                var capsuleLineSprite3D = this.lineSprite3D.addChild(new Laya.PixelLineSprite3D(3000));
                Tool.linearModel(capsule, capsuleLineSprite3D, Laya.Color.GREEN);
                var cone = this.sprite3D.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCone(0.25, 0.75)));
                cone.transform.position = new Laya.Vector3(-2.0, 0.375, 0.6);
                var coneLineSprite3D = this.lineSprite3D.addChild(new Laya.PixelLineSprite3D(500));
                Tool.linearModel(cone, coneLineSprite3D, Laya.Color.GREEN);
                var plane = this.sprite3D.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(6, 6, 10, 10)));
                var planeLineSprite3D = this.lineSprite3D.addChild(new Laya.PixelLineSprite3D(1000));
                Tool.linearModel(plane, planeLineSprite3D, Laya.Color.GRAY);
                this.lineSprite3D.active = false;
                this.loadUI();
            });
        }
        loadUI() {
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, function () {
                this.changeActionButton = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "正常模式"));
                this.changeActionButton.size(160, 40);
                this.changeActionButton.labelBold = true;
                this.changeActionButton.labelSize = 30;
                this.changeActionButton.sizeGrid = "4,4,4,4";
                this.changeActionButton.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.changeActionButton.pos(Laya.Laya.stage.width / 2 - this.changeActionButton.width * Laya.Browser.pixelRatio / 2, Laya.Laya.stage.height - 100 * Laya.Browser.pixelRatio);
                this.changeActionButton.on(Laya.Event.CLICK, this, this.stypeFun0);
            }));
        }
        stypeFun0(label = "正常模式") {
            if (++this.curStateIndex % 2 == 1) {
                this.sprite3D.active = false;
                this.lineSprite3D.active = true;
                this.changeActionButton.label = "网格模式";
            }
            else {
                this.sprite3D.active = true;
                this.lineSprite3D.active = false;
                this.changeActionButton.label = "正常模式";
            }
            label = this.changeActionButton.label;
            Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: label });
        }
    }

    class MeshLoad {
        constructor() {
            this.rotation = new Laya.Vector3(0, 0.01, 0);
            this.btype = "MeshLoad";
            this.stype = 0;
            this.curStateIndex = 0;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.transform.translate(new Laya.Vector3(0, 0.8, 1.5));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                let directionLight = new Laya.Sprite3D();
                let dircom = directionLight.addComponent(Laya.DirectionLightCom);
                scene.addChild(directionLight);
                dircom.color = new Laya.Color(0.6, 0.6, 0.6, 1);
                this.sprite3D = scene.addChild(new Laya.Sprite3D());
                this.lineSprite3D = scene.addChild(new Laya.Sprite3D());
                Laya.Mesh.load("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm", Laya.Handler.create(this, function (mesh) {
                    var layaMonkey = this.sprite3D.addChild(new Laya.MeshSprite3D(mesh));
                    layaMonkey.transform.localScale = new Laya.Vector3(0.3, 0.3, 0.3);
                    layaMonkey.transform.rotation = new Laya.Quaternion(0.7071068, 0, 0, -0.7071067);
                    var layaMonkeyLineSprite3D = this.lineSprite3D.addChild(new Laya.PixelLineSprite3D(5000));
                    Tool.linearModel(layaMonkey, layaMonkeyLineSprite3D, Laya.Color.GREEN);
                    var plane = this.sprite3D.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(6, 6, 10, 10)));
                    plane.transform.position = new Laya.Vector3(0, 0, -1);
                    var planeLineSprite3D = this.lineSprite3D.addChild(new Laya.PixelLineSprite3D(1000));
                    Tool.linearModel(plane, planeLineSprite3D, Laya.Color.GRAY);
                    Laya.Laya.timer.frameLoop(1, this, function () {
                        layaMonkeyLineSprite3D.transform.rotate(this.rotation, false);
                        layaMonkey.transform.rotate(this.rotation, false);
                    });
                    this.lineSprite3D.active = false;
                    this.loadUI();
                }));
            });
        }
        loadUI() {
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, function () {
                this.changeActionButton = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "正常模式"));
                this.changeActionButton.size(160, 40);
                this.changeActionButton.labelBold = true;
                this.changeActionButton.labelSize = 30;
                this.changeActionButton.sizeGrid = "4,4,4,4";
                this.changeActionButton.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.changeActionButton.pos(Laya.Laya.stage.width / 2 - this.changeActionButton.width * Laya.Browser.pixelRatio / 2, Laya.Laya.stage.height - 100 * Laya.Browser.pixelRatio);
                this.changeActionButton.on(Laya.Event.CLICK, this, this.stypeFun0);
            }));
        }
        stypeFun0(label = "正常模式") {
            if (++this.curStateIndex % 2 == 1) {
                this.sprite3D.active = false;
                this.lineSprite3D.active = true;
                this.changeActionButton.label = "网格模式";
            }
            else {
                this.sprite3D.active = true;
                this.lineSprite3D.active = false;
                this.changeActionButton.label = "正常模式";
            }
            label = this.changeActionButton.label;
            Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: label });
        }
    }

    class MouseInteraction {
        constructor() {
            this._outHitResult = new Laya.HitResult();
            this.posX = 0.0;
            this.posY = 0.0;
            this.point = new Laya.Vector2();
            this.text = new Laya.Text();
            this.tmpVector = new Laya.Vector3(0, 0, 0);
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this._scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                this._camera = (this._scene.addChild(new Laya.Camera(0, 0.1, 100)));
                this._camera.transform.translate(new Laya.Vector3(0, 0.7, 5));
                this._camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                this._camera.addComponent(CameraMoveScript);
                let directionLight = new Laya.Sprite3D();
                let dircom = directionLight.addComponent(Laya.DirectionLightCom);
                this._scene.addChild(directionLight);
                dircom.color = new Laya.Color(1, 1, 1, 1);
                directionLight.transform.rotate(new Laya.Vector3(-3.14 / 3, 0, 0));
                Laya.Laya.loader.load(["res/threeDimen/staticModel/grid/plane.lh", "res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh"], Laya.Handler.create(this, this.onComplete));
            });
        }
        onComplete() {
            var grid = this._scene.addChild(Laya.Loader.createNodes("res/threeDimen/staticModel/grid/plane.lh"));
            grid.layer = 10;
            let monkeyMesh = Laya.Loader.getRes("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm");
            var staticLayaMonkey = new Laya.Sprite3D();
            let staticLayaMonkeyrender = staticLayaMonkey.addComponent(Laya.MeshRenderer);
            let staticLayaMonkeyfilter = staticLayaMonkey.addComponent(Laya.MeshFilter);
            staticLayaMonkeyfilter.sharedMesh = monkeyMesh;
            this._scene.addChild(staticLayaMonkey);
            staticLayaMonkeyrender.material = Laya.Loader.getRes("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/Materials/T_Diffuse.lmat");
            staticLayaMonkey.transform.position = new Laya.Vector3(0, 0, 0.5);
            staticLayaMonkey.transform.localScale = new Laya.Vector3(0.3, 0.3, 0.3);
            staticLayaMonkey.transform.rotation = new Laya.Quaternion(0.7071068, 0, 0, -0.7071067);
            this.tmpVector.setValue(0.0, 0, 0.5);
            var layaMonkey_clone1 = Laya.Sprite3D.instantiate(staticLayaMonkey, this._scene, false, this.tmpVector);
            var layaMonkey_clone2 = Laya.Sprite3D.instantiate(staticLayaMonkey, this._scene, false, this.tmpVector);
            var layaMonkey_clone3 = Laya.Sprite3D.instantiate(staticLayaMonkey, this._scene, false, this.tmpVector);
            staticLayaMonkey.name = "大熊";
            layaMonkey_clone1.name = "二熊";
            layaMonkey_clone2.name = "三熊";
            layaMonkey_clone3.name = "小小熊";
            this.tmpVector.setValue(1.5, 0, 0.0);
            layaMonkey_clone1.transform.translate(this.tmpVector);
            this.tmpVector.setValue(-1.5, 0, 0.0);
            layaMonkey_clone2.transform.translate(this.tmpVector);
            this.tmpVector.setValue(2.5, 0, 0.0);
            layaMonkey_clone3.transform.translate(this.tmpVector);
            this.tmpVector.setValue(0, 60, 0);
            layaMonkey_clone2.transform.rotate(this.tmpVector, false, false);
            this.tmpVector.setValue(0.1, 0.1, 0.1);
            layaMonkey_clone3.transform.localScale = this.tmpVector;
            var meshCollider = staticLayaMonkey.addComponent(Laya.PhysicsCollider);
            var meshShape = new Laya.MeshColliderShape();
            meshShape.mesh = staticLayaMonkeyfilter.sharedMesh;
            meshShape.convex = true;
            meshCollider.colliderShape = meshShape;
            var meshCollider1 = layaMonkey_clone1.addComponent(Laya.PhysicsCollider);
            var meshShape1 = new Laya.MeshColliderShape();
            meshShape1.mesh = layaMonkey_clone1.getComponent(Laya.MeshFilter).sharedMesh;
            meshShape1.convex = true;
            meshCollider1.colliderShape = meshShape1;
            var meshCollider2 = layaMonkey_clone2.addComponent(Laya.PhysicsCollider);
            var meshShape2 = new Laya.MeshColliderShape();
            meshShape2.mesh = layaMonkey_clone2.getComponent(Laya.MeshFilter).sharedMesh;
            meshShape2.convex = true;
            meshCollider2.colliderShape = meshShape2;
            var meshCollider3 = layaMonkey_clone3.addComponent(Laya.PhysicsCollider);
            var meshShape3 = new Laya.MeshColliderShape();
            meshShape3.mesh = layaMonkey_clone3.getComponent(Laya.MeshFilter).sharedMesh;
            meshShape3.convex = true;
            meshCollider3.colliderShape = meshShape3;
            this.text.x = Laya.Laya.stage.width / 2 - 50;
            this.text.y = 50;
            this._ray = new Laya.Ray(new Laya.Vector3(0, 0, 0), new Laya.Vector3(0, 0, 0));
            this.addMouseEvent();
            this.text.name = "text";
            this.text.overflow = Laya.Text.HIDDEN;
            this.text.color = "#FFFFFF";
            this.text.font = "Impact";
            this.text.fontSize = 20;
            this.text.x = Laya.Laya.stage.width / 2;
            Laya.Laya.stage.addChild(this.text);
            staticLayaMonkey.addComponent(SceneScript);
            layaMonkey_clone1.addComponent(SceneScript);
            layaMonkey_clone2.addComponent(SceneScript);
            layaMonkey_clone3.addComponent(SceneScript);
        }
        addMouseEvent() {
            Laya.Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        }
        onMouseDown() {
            this.posX = this.point.x = Laya.Laya.stage.mouseX;
            this.posY = this.point.y = Laya.Laya.stage.mouseY;
            this._camera.viewportPointToRay(this.point, this._ray);
            this._scene.physicsSimulation.rayCast(this._ray, this._outHitResult);
            if (this._outHitResult.succeeded) {
                this.text.text = "碰撞到了" + this._outHitResult.collider.owner.name;
                console.log("碰撞到物体！！");
            }
        }
    }
    class SceneScript extends Laya.Script {
        constructor() {
            super();
            this._albedoColor = new Laya.Color(0.0, 0.0, 0.0, 1.0);
        }
        onAwake() {
            this.meshSprite = this.owner;
            this.text = Laya.Laya.stage.getChildByName("text");
        }
        onUpdate() {
        }
        onMouseDown() {
            this.text.text = "碰撞到了" + this.owner.name;
        }
        onCollisionEnter(collision) {
            this.meshSprite.getComponent(Laya.MeshRenderer).sharedMaterial.albedoColor = this._albedoColor;
        }
    }

    class MultiTouch {
        constructor() {
            this.text = new Laya.Text();
            this._upVector3 = new Laya.Vector3(0, 1, 0);
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                var resource = ["res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh"];
                Laya.Laya.loader.load(resource, Laya.Handler.create(this, this.onComplete));
            });
        }
        onComplete() {
            var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
            var camera = scene.addChild(new Laya.Camera(0, 0.1, 100));
            camera.name = "camera";
            camera.transform.translate(new Laya.Vector3(0, 0.8, 1.5));
            camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
            let directionLight = new Laya.Sprite3D();
            let dircom = directionLight.addComponent(Laya.DirectionLightCom);
            scene.addChild(directionLight);
            dircom.color = new Laya.Color(0.6, 0.6, 0.6, 1);
            var monkey = Laya.Loader.createNodes("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh");
            monkey.addComponent(MonkeyScript);
            scene.addChild(monkey);
            camera.transform.lookAt(monkey.transform.position, new Laya.Vector3(0, 1, 0));
            this.text.x = Laya.Laya.stage.width / 2 - 50;
            this.text.text = "触控点归零";
            this.text.name = "ceshi";
            this.text.overflow = Laya.Text.HIDDEN;
            this.text.color = "#FFFFFF";
            this.text.font = "Impact";
            this.text.fontSize = 30;
            this.text.borderColor = "#FFFF00";
            this.text.x = Laya.Laya.stage.width / 2;
            Laya.Laya.stage.addChild(this.text);
        }
    }
    class MonkeyScript extends Laya.Script {
        constructor() {
            super(...arguments);
            this.rotation = new Laya.Vector3(0, 0.01, 0);
            this.lastPosition = new Laya.Vector2(0, 0);
            this.distance = 0.0;
            this.disVector1 = new Laya.Vector2(0, 0);
            this.disVector2 = new Laya.Vector2(0, 0);
            this.isTwoTouch = false;
            this.first = true;
            this.twoFirst = true;
            this.tmpVector = new Laya.Vector3(0, 0, 0);
        }
        onAwake() {
        }
        onStart() {
            this._scene = this.owner.parent;
            this._text = this._scene.parent.getChildByName("ceshi");
            this._camera = this._scene.getChildByName("camera");
        }
        onUpdate() {
            var touchCount = Laya.InputManager.touchCount;
            if (1 === touchCount) {
                if (this.isTwoTouch) {
                    return;
                }
                this._text.text = "触控点为1";
                var touch = Laya.InputManager.touches[0];
                if (this.first) {
                    this.lastPosition.x = touch.pos.x;
                    this.lastPosition.y = touch.pos.y;
                    this.first = false;
                }
                else {
                    var deltaY = touch.pos.y - this.lastPosition.y;
                    var deltaX = touch.pos.x - this.lastPosition.x;
                    this.lastPosition.x = touch.pos.x;
                    this.lastPosition.y = touch.pos.y;
                    this.tmpVector.setValue(1 * deltaY / 2, 1 * deltaX / 2, 0);
                    this.owner.transform.rotate(this.tmpVector, true, false);
                }
            }
            else if (2 === touchCount) {
                this._text.text = "触控点为2";
                this.isTwoTouch = true;
                var touch = Laya.InputManager.touches[0];
                var touch2 = Laya.InputManager.touches[1];
                if (this.twoFirst) {
                    this.disVector1.x = touch.pos.x - touch2.pos.x;
                    this.disVector1.y = touch.pos.y - touch2.pos.y;
                    this.distance = Laya.Vector2.scalarLength(this.disVector1);
                    this.twoFirst = false;
                }
                else {
                    this.disVector2.x = touch.pos.x - touch2.pos.x;
                    this.disVector2.y = touch.pos.y - touch2.pos.y;
                    var distance2 = Laya.Vector2.scalarLength(this.disVector2);
                    this.tmpVector.setValue(0, 0, -0.01 * (distance2 - this.distance));
                    this._camera.transform.translate(this.tmpVector);
                    this.distance = distance2;
                }
            }
            else if (0 === touchCount) {
                this._text.text = "触控点归零";
                this.first = true;
                this.twoFirst = true;
                this.lastPosition.x = 0;
                this.lastPosition.y = 0;
                this.isTwoTouch = false;
            }
        }
        onLateUpdate() {
        }
    }

    class Particle_BurningGround {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.transform.translate(new Laya.Vector3(0, 2, 4));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                camera.clearFlag = Laya.CameraClearFlags.SolidColor;
                camera.clearColor = new Laya.Color(0, 0, 0, 1);
                Laya.Sprite3D.load("res/threeDimen/particle/ETF_Burning_Ground.lh", Laya.Handler.create(this, function (sprite) {
                    scene.addChild(sprite);
                }));
            });
        }
    }

    class Particle_EternalLight {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.transform.translate(new Laya.Vector3(0, 2, 4));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                camera.clearFlag = Laya.CameraClearFlags.SolidColor;
                camera.clearColor = new Laya.Color(0, 0, 0, 1);
                Laya.Sprite3D.load("res/threeDimen/particle/ETF_Eternal_Light.lh", Laya.Handler.create(this, function (sprite) {
                    scene.addChild(sprite);
                }));
            });
        }
    }

    class testUtil {
        constructor() {
            this.meshArray = [];
            this.materialArray = [];
            this.createMesh();
            this.createMaterial();
        }
        createMesh() {
            this.meshArray.push(Laya.PrimitiveMesh.createBox(1, 1, 1));
            this.meshArray.push(Laya.PrimitiveMesh.createBox(0.5, 2, 0.5));
            this.meshArray.push(Laya.PrimitiveMesh.createBox(2, 0.5, 1));
            this.meshArray.push(Laya.PrimitiveMesh.createBox(0.3, 0.3, 0.3));
            this.meshArray.push(Laya.PrimitiveMesh.createSphere(0.5, 16, 16));
            this.meshArray.push(Laya.PrimitiveMesh.createSphere(0.3, 8, 8));
            this.meshArray.push(Laya.PrimitiveMesh.createSphere(1.0, 32, 32));
            this.meshArray.push(Laya.PrimitiveMesh.createSphere(0.8, 12, 12));
            this.meshArray.push(Laya.PrimitiveMesh.createCylinder(0.5, 2, 16));
            this.meshArray.push(Laya.PrimitiveMesh.createCylinder(0.3, 1, 8));
            this.meshArray.push(Laya.PrimitiveMesh.createCylinder(1.0, 1, 32));
            this.meshArray.push(Laya.PrimitiveMesh.createCylinder(0.2, 3, 12));
            this.meshArray.push(Laya.PrimitiveMesh.createCone(0.5, 2, 16));
            this.meshArray.push(Laya.PrimitiveMesh.createCone(0.3, 1, 8));
            this.meshArray.push(Laya.PrimitiveMesh.createCone(1.0, 1, 32));
            this.meshArray.push(Laya.PrimitiveMesh.createCone(0.2, 3, 12));
            this.meshArray.push(Laya.PrimitiveMesh.createCapsule(0.5, 2, 16, 16));
            this.meshArray.push(Laya.PrimitiveMesh.createCapsule(0.3, 1, 8, 8));
            this.meshArray.push(Laya.PrimitiveMesh.createCapsule(0.8, 3, 20, 20));
            this.meshArray.push(Laya.PrimitiveMesh.createCapsule(1.0, 1, 12, 12));
            this.meshArray.push(Laya.PrimitiveMesh.createPlane(2, 2, 10, 10));
            this.meshArray.push(Laya.PrimitiveMesh.createPlane(1, 1, 5, 5));
            this.meshArray.push(Laya.PrimitiveMesh.createPlane(5, 5, 20, 20));
            this.meshArray.push(Laya.PrimitiveMesh.createPlane(3, 1, 15, 5));
            this.meshArray.push(Laya.PrimitiveMesh.createQuad(1, 1));
            this.meshArray.push(Laya.PrimitiveMesh.createQuad(0.5, 0.5));
            this.meshArray.push(Laya.PrimitiveMesh.createQuad(2, 2));
            this.meshArray.push(Laya.PrimitiveMesh.createQuad(1.5, 0.5));
            this.meshArray.push(Laya.PrimitiveMesh.createBox(0.8, 1.2, 0.8));
            this.meshArray.push(Laya.PrimitiveMesh.createBox(1.5, 0.8, 1.2));
            this.meshArray.push(Laya.PrimitiveMesh.createBox(0.6, 0.6, 2.0));
            this.meshArray.push(Laya.PrimitiveMesh.createBox(1.8, 1.8, 0.4));
            this.meshArray.push(Laya.PrimitiveMesh.createSphere(0.7, 12, 12));
            this.meshArray.push(Laya.PrimitiveMesh.createSphere(1.2, 24, 24));
            this.meshArray.push(Laya.PrimitiveMesh.createSphere(0.4, 6, 6));
            this.meshArray.push(Laya.PrimitiveMesh.createSphere(0.9, 48, 48));
            this.meshArray.push(Laya.PrimitiveMesh.createCylinder(0.7, 3, 24));
            this.meshArray.push(Laya.PrimitiveMesh.createCylinder(1.2, 0.5, 40));
            this.meshArray.push(Laya.PrimitiveMesh.createCylinder(0.3, 4, 8));
            this.meshArray.push(Laya.PrimitiveMesh.createCylinder(0.9, 1.5, 60));
            console.log(`已创建 ${this.meshArray.length} 种网格类型`);
        }
        createMaterial() {
            let createOneMaterial = (r, g, b, name) => {
                let mat = new Laya.Material();
                mat.setShaderName("PBR");
                mat.materialRenderMode = Laya.MaterialRenderMode.RENDERMODE_OPAQUE;
                mat.setColor("u_AlbedoColor", new Laya.Color(r, g, b, 1));
                if (name) {
                    mat.name = name;
                }
                return mat;
            };
            this.materialArray.push(createOneMaterial(1, 1, 1, "White"));
            this.materialArray.push(createOneMaterial(1, 0, 0, "Red"));
            this.materialArray.push(createOneMaterial(0, 1, 0, "Green"));
            this.materialArray.push(createOneMaterial(0, 0, 1, "Blue"));
            this.materialArray.push(createOneMaterial(1, 1, 0, "Yellow"));
            this.materialArray.push(createOneMaterial(1, 0, 1, "Magenta"));
            this.materialArray.push(createOneMaterial(0, 1, 1, "Cyan"));
            this.materialArray.push(createOneMaterial(0.5, 0.5, 0.5, "Gray"));
            this.materialArray.push(createOneMaterial(0.5, 0, 0, "DarkRed"));
            this.materialArray.push(createOneMaterial(0, 0.5, 0, "DarkGreen"));
            this.materialArray.push(createOneMaterial(0, 0, 0.5, "DarkBlue"));
            this.materialArray.push(createOneMaterial(0.5, 0.5, 0, "Olive"));
            this.materialArray.push(createOneMaterial(0.5, 0, 0.5, "Purple"));
            this.materialArray.push(createOneMaterial(0, 0.5, 0.5, "Teal"));
            this.materialArray.push(createOneMaterial(1, 0.5, 0, "Orange"));
            this.materialArray.push(createOneMaterial(1, 0.2, 0.6, "Pink"));
            this.materialArray.push(createOneMaterial(0.2, 0.8, 0.4, "Lime"));
            this.materialArray.push(createOneMaterial(0.4, 0.2, 0.8, "Lavender"));
            this.materialArray.push(createOneMaterial(0.8, 0.4, 0.2, "Coral"));
            this.materialArray.push(createOneMaterial(0.6, 0.8, 0.2, "Chartreuse"));
            this.materialArray.push(createOneMaterial(0.8, 0.6, 0.4, "Tan"));
            this.materialArray.push(createOneMaterial(0.4, 0.6, 0.8, "SkyBlue"));
            this.materialArray.push(createOneMaterial(0.8, 0.2, 0.4, "Rose"));
            this.materialArray.push(createOneMaterial(0.2, 0.6, 0.8, "Azure"));
            this.materialArray.push(createOneMaterial(0.9, 0.5, 0.1, "Gold"));
            this.materialArray.push(createOneMaterial(0.7, 0.7, 0.7, "Silver"));
            this.materialArray.push(createOneMaterial(0.6, 0.3, 0.1, "Bronze"));
            this.materialArray.push(createOneMaterial(0.8, 0.8, 0.2, "LightYellow"));
            this.materialArray.push(createOneMaterial(0.9, 0.3, 0.3, "Salmon"));
            this.materialArray.push(createOneMaterial(0.3, 0.9, 0.3, "LightGreen"));
            this.materialArray.push(createOneMaterial(0.3, 0.3, 0.9, "LightBlue"));
            this.materialArray.push(createOneMaterial(0.7, 0.9, 0.7, "Mint"));
            this.materialArray.push(createOneMaterial(0.9, 0.7, 0.3, "Peach"));
            this.materialArray.push(createOneMaterial(0.5, 0.7, 0.9, "PowderBlue"));
            this.materialArray.push(createOneMaterial(0.8, 0.4, 0.6, "Pinkish"));
            this.materialArray.push(createOneMaterial(0.4, 0.8, 0.6, "Greenish"));
            this.materialArray.push(createOneMaterial(0.6, 0.4, 0.8, "Purplish"));
            this.materialArray.push(createOneMaterial(0.8, 0.6, 0.4, "Orangish"));
            this.materialArray.push(createOneMaterial(0.6, 0.8, 0.6, "Yellowish"));
            this.materialArray.push(createOneMaterial(0.4, 0.6, 0.4, "DarkCyan"));
            this.materialArray.push(createOneMaterial(0.6, 0.4, 0.6, "DarkMagenta"));
            this.materialArray.push(createOneMaterial(0.4, 0.4, 0.8, "DarkBlue"));
            this.materialArray.push(createOneMaterial(0.8, 0.8, 0.4, "LightOrange"));
            this.materialArray.push(createOneMaterial(0.4, 0.8, 0.8, "LightCyan"));
            console.log(`已创建 ${this.materialArray.length} 种材质`);
        }
    }

    class DynamicBatchTest {
        constructor() {
            this._testUtil = new testUtil();
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                scene.ambientColor = new Laya.Color(1, 1, 1);
                var camera = scene.addChild(new Laya.Camera(0, 0.1, 1000));
                camera.transform.translate(new Laya.Vector3(0, 6.2, 10.5));
                camera.transform.rotate(new Laya.Vector3(-40, 0, 0), true, false);
                camera.addComponent(CameraMoveScript);
                camera.clearFlag = Laya.CameraClearFlags.Sky;
                Laya.Material.load("res/threeDimen/skyBox/DawnDusk/SkyBox.lmat", Laya.Handler.create(this, function (mat) {
                    var skyRenderer = camera.scene.skyRenderer;
                    skyRenderer.mesh = Laya.SkyDome.instance;
                    var exposureNumber = 1.0;
                    mat.exposure = exposureNumber;
                    skyRenderer.material = mat;
                    this.test8(scene, camera);
                }));
            });
        }
        test1(scene, camera) {
            Laya.Texture2D.load("res/threeDimen/layabox.png", Laya.Handler.create(null, function (tex) {
                var radius = new Laya.Vector3(0, 0, 1);
                var radMatrix = new Laya.Matrix4x4();
                var circleCount = 50;
                var boxMesh = Laya.PrimitiveMesh.createBox(0.02, 0.02, 0.02);
                var boxMat = new Laya.BlinnPhongMaterial();
                boxMat.albedoTexture = tex;
                let count = 0;
                for (var i = 0; i < circleCount; i++) {
                    radius.z = 1.0 + i * 0.15;
                    radius.y = i * 0.03;
                    var oneCircleCount = 100 + i * 15;
                    for (var j = 0; j < oneCircleCount; j++) {
                        count++;
                        var boxSprite = new Laya.MeshSprite3D(boxMesh);
                        boxSprite.meshRenderer.sharedMaterial = boxMat;
                        var localPos = boxSprite.transform.localPosition;
                        var rad = ((Math.PI * 2) / oneCircleCount) * j;
                        Laya.Matrix4x4.createRotationY(rad, radMatrix);
                        Laya.Vector3.transformCoordinate(radius, radMatrix, localPos);
                        boxSprite.transform.localPosition = localPos;
                        scene.addChild(boxSprite);
                    }
                }
            }));
        }
        test2(scene, camera) {
            let mesh = Laya.PrimitiveMesh.createBox(0.5, 0.5, 0.5);
            let material = new Laya.BlinnPhongMaterial();
            Laya.Texture2D.load("res/threeDimen/layabox.png", Laya.Handler.create(null, (tex) => {
                material.albedoTexture = tex;
                let nodes = [];
                for (let i = 0; i < 10; i++) {
                    let node = new Laya.MeshSprite3D(mesh);
                    node.meshRenderer.sharedMaterial = material;
                    node.transform.localPosition = new Laya.Vector3(i * 1.5, 0, 0);
                    scene.addChild(node);
                    nodes.push(node);
                }
                let time = 0;
                Laya.Laya.timer.frameLoop(1, this, () => {
                    time += Laya.Laya.timer.delta / 1000;
                    const movingIndices = [1, 3, 5, 7, 9];
                    for (let idx of movingIndices) {
                        let node = nodes[idx];
                        let pos = node.transform.localPosition;
                        pos.y = Math.sin(time + idx * 0.1) * 2.0;
                        node.transform.localPosition = pos;
                    }
                });
            }));
        }
        test3(scene, camera) {
            let meshes = this._testUtil.meshArray;
            let materials = this._testUtil.materialArray;
            const meshCount = Math.min(meshes.length, materials.length);
            let Count = 10;
            let curCount = 0;
            let elementCount = 10;
            camera.transform.position = new Laya.Vector3(5.36, 15.04, 23.66);
            camera.transform.rotation = new Laya.Quaternion(-0.07, -0.07, -0.00, 0.99);
            for (let i = 0; i < meshes.length; i++) {
                for (let j = 0; j < materials.length; j++) {
                    if (curCount >= Count) {
                        return;
                    }
                    curCount++;
                    for (let k = 0; k < elementCount; k++) {
                        let node = new Laya.MeshSprite3D(meshes[i]);
                        node.meshRenderer.sharedMaterial = materials[j];
                        node.transform.localPosition = new Laya.Vector3(k * 2, curCount * 2, 0);
                        scene.addChild(node);
                    }
                }
            }
        }
        test4(scene, camera) {
            let meshes = this._testUtil.meshArray;
            let materials = this._testUtil.materialArray;
            const meshCount = Math.min(meshes.length, materials.length);
            let Count = 20;
            let curCount = 0;
            let elementCount = 10;
            camera.transform.position = new Laya.Vector3(5.36, 15.04, 23.66);
            camera.transform.rotation = new Laya.Quaternion(-0.07, -0.07, -0.00, 0.99);
            for (let i = 0; i < meshes.length; i++) {
                for (let j = 0; j < materials.length; j++) {
                    if (curCount >= Count) {
                        return;
                    }
                    curCount++;
                    for (let k = 0; k < curCount; k++) {
                        let node = new Laya.MeshSprite3D(meshes[i]);
                        node.meshRenderer.sharedMaterial = materials[j];
                        node.transform.localPosition = new Laya.Vector3(k * 2, curCount * 2, 0);
                        scene.addChild(node);
                    }
                }
            }
        }
        test5(scene, camera) {
            camera.transform.position = new Laya.Vector3(39.54820590529586, 14.969745756280817, 57.85090397492968);
            camera.transform.rotation = new Laya.Quaternion(0.04542888842020109, -0.0293354336761753, 0.0013346312567456974, 0.9985358617432548);
            Laya.Laya.timer.once(0, this, (scene, camera, offset) => {
                let meshes = this._testUtil.meshArray;
                let materials = this._testUtil.materialArray;
                for (let i = 0; i < 20; i++) {
                    for (let j = 0; j < 10; j++) {
                        let node = new Laya.MeshSprite3D(meshes[0]);
                        node.meshRenderer.sharedMaterial = materials[0];
                        node.transform.localPosition = new Laya.Vector3(i * 2 + offset, j * 2, 0);
                        scene.addChild(node);
                    }
                }
            }, [scene, camera, 0]);
            Laya.Laya.timer.once(5000, this, (scene, camera, offset) => {
                let meshes = this._testUtil.meshArray;
                let materials = this._testUtil.materialArray;
                let count = 0;
                for (let i = 0; i < 20; i++) {
                    for (let j = 0; j < 20; j++) {
                        count++;
                        let node = new Laya.MeshSprite3D(meshes[0]);
                        node.meshRenderer.sharedMaterial = materials[count % 4];
                        node.transform.localPosition = new Laya.Vector3(i * 2 + offset, j * 2, 0);
                        scene.addChild(node);
                    }
                }
            }, [scene, camera, 50]);
        }
        test6(scene, camera) {
            let batcucull = scene._sceneRenderManager._sceneManagerOBJ.batchAgentList.get(Laya.BaseRenderType.MeshRender);
            camera.transform.position = new Laya.Vector3(39.54820590529586, 14.969745756280817, 57.85090397492968);
            camera.transform.rotation = new Laya.Quaternion(0.04542888842020109, -0.0293354336761753, 0.0013346312567456974, 0.9985358617432548);
            Laya.Laya.timer.once(0, this, (scene, camera, offset) => {
                let meshes = this._testUtil.meshArray;
                let materials = this._testUtil.materialArray;
                let count = 0;
                for (let i = 0; i < 20; i++) {
                    for (let j = 0; j < 10; j++) {
                        let node = new Laya.MeshSprite3D(meshes[0]);
                        node.meshRenderer.sharedMaterial = materials[count % 4];
                        node.transform.localPosition = new Laya.Vector3(i * 2 + offset, j * 2, 0);
                        scene.addChild(node);
                    }
                }
            }, [scene, camera, 0]);
            Laya.Laya.timer.once(5000, this, (scene, camera, offset) => {
                let meshes = this._testUtil.meshArray;
                let materials = this._testUtil.materialArray;
                let count = 0;
                for (let i = 0; i < 20; i++) {
                    for (let j = 0; j < 20; j++) {
                        count++;
                        let node = new Laya.MeshSprite3D(meshes[0]);
                        node.meshRenderer.sharedMaterial = materials[(count % 4) + 4];
                        node.transform.localPosition = new Laya.Vector3(i * 2 + offset, j * 2, 0);
                        scene.addChild(node);
                    }
                }
            }, [scene, camera, 50]);
        }
        test7(scene, camera) {
            let spriteArray = [];
            let meshes = this._testUtil.meshArray;
            let materials = this._testUtil.materialArray;
            const meshCount = Math.min(meshes.length, materials.length);
            let Count = 20;
            let curCount = 0;
            let elementCount = 10;
            camera.transform.position = new Laya.Vector3(5.36, 15.04, 23.66);
            camera.transform.rotation = new Laya.Quaternion(-0.07, -0.07, -0.00, 0.99);
            for (let i = 0; i < meshes.length; i++) {
                for (let j = 0; j < materials.length; j++) {
                    if (curCount >= Count) {
                        break;
                    }
                    curCount++;
                    for (let k = 0; k < curCount + 1; k++) {
                        let node = new Laya.MeshSprite3D(meshes[i]);
                        node.meshRenderer.sharedMaterial = materials[j];
                        node.transform.localPosition = new Laya.Vector3(k * 2, curCount * 2, 0);
                        spriteArray.push(node);
                    }
                }
            }
            let remainSprites = spriteArray.slice();
            let addPerTime = () => {
                if (remainSprites.length === 0) {
                    return;
                }
                let num = Math.min(remainSprites.length, Math.floor(Math.random() * 5) + 5);
                num = 1;
                for (let i = 0; i < num; i++) {
                    let idx = Math.floor(Math.random() * remainSprites.length);
                    let node = remainSprites[idx];
                    scene.addChild(node);
                    remainSprites.splice(idx, 1);
                }
                if (remainSprites.length > 0) {
                    Laya.Laya.timer.once(50, this, addPerTime);
                }
                else {
                    let removeSprites = spriteArray.slice();
                    let removePerTime = () => {
                        if (removeSprites.length === 0) {
                            return;
                        }
                        let num = Math.min(removeSprites.length, Math.floor(Math.random() * 5) + 5);
                        num = 1;
                        let nodesToRemove = [];
                        for (let i = 0; i < num && removeSprites.length > 0; i++) {
                            let idx = Math.floor(Math.random() * removeSprites.length);
                            let node = removeSprites[idx];
                            nodesToRemove.push(node);
                            removeSprites.splice(idx, 1);
                        }
                        for (let node of nodesToRemove) {
                            if (node.parent) {
                                node.parent.removeChild(node);
                            }
                        }
                        if (removeSprites.length > 0) {
                            Laya.Laya.timer.once(50, this, removePerTime);
                        }
                    };
                    removePerTime();
                }
            };
            addPerTime();
        }
        test8(scene, camera) {
            scene.ambientIntensity = 0;
            scene.reflectionIntensity = 0;
            let meshes = this._testUtil.meshArray;
            let materials = this._testUtil.materialArray;
            const meshCount = Math.min(meshes.length, materials.length);
            let Count = 625;
            let curCount = 0;
            let elementCount = 10;
            camera.transform.position = new Laya.Vector3(-10.808851850002986, 41.07002728417983, -14.432153815427254);
            camera.transform.rotation = new Laya.Quaternion(-0.1078350694262135, -0.8960223514808572, -0.30990185345037524, 0.29912603476892685);
            var directionLight = new Laya.Sprite3D();
            var directionLightCom = directionLight.addComponent(Laya.DirectionLightCom);
            directionLightCom.shadowCascadesMode = Laya.ShadowCascadesMode.NoCascades;
            directionLightCom.color = new Laya.Color(0.85, 0.85, 0.8, 1);
            directionLight.transform.rotate(new Laya.Vector3(-Math.PI / 3, 0, 0));
            scene.addChild(directionLight);
            directionLightCom.shadowDistance = 100;
            directionLightCom.shadowMode = Laya.ShadowMode.Hard;
            let node = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(Count * 3, Count * 3, Count * 3));
            node.meshRenderer.sharedMaterial = materials[0];
            node.meshRenderer.receiveShadow = true;
            node.transform.localPosition = new Laya.Vector3(Count, -1, Count);
            scene.addChild(node);
            let elementCCC = 0;
            for (let i = 0; i < 30; i++) {
                for (let j = 0; j < 30; j++) {
                    if (curCount >= Count) {
                        return;
                    }
                    curCount++;
                    let heng = curCount / 80 | 0;
                    let zong = (curCount % 80) | 0;
                    for (let k = 0; k < elementCount; k++) {
                        let node = new Laya.MeshSprite3D(meshes[i]);
                        node.meshRenderer.sharedMaterial = materials[j];
                        node.meshRenderer.castShadow = true;
                        node.transform.localPosition = new Laya.Vector3(k * 2 + heng * elementCount * 2, 0, zong * 2);
                        scene.addChild(node);
                        elementCCC++;
                    }
                }
            }
        }
        test9(scene, camera) {
            var radius = new Laya.Vector3(0, 0, 1);
            var radMatrix = new Laya.Matrix4x4();
            var circleCount = 100;
            var boxMesh = Laya.PrimitiveMesh.createBox(0.02, 0.02, 0.02);
            var boxMat = new Laya.BlinnPhongMaterial();
            let count = 0;
            let materialCOunt = 25;
            let meshCount = 25;
            let meshArray = this._testUtil.meshArray;
            let matArray = this._testUtil.materialArray;
            let spriteArray = [];
            let allCube = true;
            if (!allCube) {
                for (let i = 0; i < meshCount; i++) {
                    for (let j = 0; j < materialCOunt; j++) {
                        for (let k = 0; k < 10; k++) {
                            var boxSprite = new Laya.MeshSprite3D(meshArray[j]);
                            boxSprite.meshRenderer.sharedMaterial = matArray[i];
                            spriteArray.push(boxSprite);
                        }
                    }
                }
            }
            else {
                for (let i = 0; i < meshCount; i++) {
                    let mesh = Laya.PrimitiveMesh.createBox(0.5, 0.5, 0.5);
                    for (let j = 0; j < materialCOunt; j++) {
                        for (let k = 0; k < 10; k++) {
                            var boxSprite = new Laya.MeshSprite3D(mesh);
                            boxSprite.meshRenderer.sharedMaterial = matArray[j];
                            spriteArray.push(boxSprite);
                        }
                    }
                }
            }
            for (var i = 0; i < circleCount; i++) {
                radius.z = 1.0 + i * 0.15;
                radius.y = i * 0.03;
                var oneCircleCount = 100 + i * 15;
                for (var j = 0; j < oneCircleCount; j++) {
                    if (count >= spriteArray.length)
                        return;
                    var boxSprite = spriteArray[count];
                    var localPos = boxSprite.transform.localPosition;
                    var rad = ((Math.PI * 2) / oneCircleCount) * j;
                    Laya.Matrix4x4.createRotationY(rad, radMatrix);
                    Laya.Vector3.transformCoordinate(radius, radMatrix, localPos);
                    boxSprite.transform.localPosition = localPos;
                    let scalesss = 0.1;
                    boxSprite.transform.localScale = new Laya.Vector3(scalesss, scalesss, scalesss);
                    scene.addChild(boxSprite);
                    count++;
                }
            }
        }
        test10(scene, camera) {
            let meshes = this._testUtil.meshArray;
            let materials = this._testUtil.materialArray;
            const meshCount = Math.min(meshes.length, materials.length);
            let Count = 10;
            let curCount = 0;
            let elementCount = 10;
            camera.transform.position = new Laya.Vector3(5.36, 10.04, 23.66);
            camera.transform.rotation = new Laya.Quaternion(-0.07, -0.07, -0.00, 0.99);
            for (let i = 0; i < 1; i++) {
                for (let j = 0; j < 1; j++) {
                    if (curCount >= Count) {
                        return;
                    }
                    curCount++;
                    for (let k = 0; k < elementCount; k++) {
                        let node = new Laya.MeshSprite3D(meshes[i]);
                        node.meshRenderer.sharedMaterial = materials[j];
                        node.transform.localPosition = new Laya.Vector3(k * 2, curCount * 2, 0);
                        scene.addChild(node);
                    }
                }
            }
        }
        test11(scene, camera) {
            var radius = new Laya.Vector3(0, 0, 1);
            var radMatrix = new Laya.Matrix4x4();
            var circleCount = 100;
            var boxMesh = Laya.PrimitiveMesh.createBox(0.02, 0.02, 0.02);
            var boxMat = new Laya.BlinnPhongMaterial();
            let count = 0;
            let materialCOunt = 40;
            let meshCount = 25;
            let meshArray = this._testUtil.meshArray;
            let matArray = this._testUtil.materialArray;
            let spriteArray = [];
            for (let i = 0; i < meshCount; i++) {
                for (let j = 0; j < materialCOunt * 4; j++) {
                    for (let k = 0; k < 10; k++) {
                        var boxSprite = new Laya.MeshSprite3D(meshArray[j]);
                        boxSprite.meshRenderer.sharedMaterial = matArray[i];
                        spriteArray.push(boxSprite);
                    }
                }
            }
            for (var i = 0; i < circleCount; i++) {
                radius.z = 1.0 + i * 0.15;
                radius.y = i * 0.03;
                var oneCircleCount = 100 + i * 15;
                for (var j = 0; j < oneCircleCount; j++) {
                    if (count >= spriteArray.length)
                        return;
                    var boxSprite = spriteArray[count];
                    var localPos = boxSprite.transform.localPosition;
                    var rad = ((Math.PI * 2) / oneCircleCount) * j;
                    Laya.Matrix4x4.createRotationY(rad, radMatrix);
                    Laya.Vector3.transformCoordinate(radius, radMatrix, localPos);
                    boxSprite.transform.localPosition = localPos;
                    let scalesss = 0.1;
                    boxSprite.transform.localScale = new Laya.Vector3(scalesss, scalesss, scalesss);
                    scene.addChild(boxSprite);
                    count++;
                }
            }
        }
    }

    class PhysicsWorld_BaseCollider {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Laya.stage.on(Laya.Event.KEY_DOWN, this, this.test);
                Laya.Stat.show();
                this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = this.scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.transform.translate(new Laya.Vector3(0, 6, 9.5));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                camera.addComponent(CameraMoveScript);
                let directionLight = new Laya.Sprite3D();
                let dircom = directionLight.addComponent(Laya.DirectionLightCom);
                this.scene.addChild(directionLight);
                dircom.color = new Laya.Color(0.6, 0.6, 0.6, 1);
                var mat = directionLight.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(-1.0, -1.0, -1.0));
                directionLight.transform.worldMatrix = mat;
                var plane = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(10, 10, 10, 10)));
                var planeMat = new Laya.BlinnPhongMaterial();
                Laya.Texture2D.load("res/threeDimen/Physics/grass.png", Laya.Handler.create(this, function (tex) {
                    planeMat.albedoTexture = tex;
                }));
                var tilingOffset = planeMat.tilingOffset;
                tilingOffset.setValue(5, 5, 0, 0);
                planeMat.tilingOffset = tilingOffset;
                plane.meshRenderer.material = planeMat;
                var planeStaticCollider = plane.addComponent(Laya.PhysicsCollider);
                var planeShape = new Laya.BoxColliderShape(10, 0.1, 10);
                planeStaticCollider.colliderShape = planeShape;
                planeStaticCollider.friction = 2;
                planeStaticCollider.restitution = 0.3;
                this.randomAddPhysicsSprite();
            });
        }
        randomAddPhysicsSprite() {
            Laya.Laya.timer.loop(1000, this, function () {
                var random = Math.floor(Math.random() * 3) % 3;
                switch (random) {
                    case 0:
                        this.addBox();
                        break;
                    case 1:
                        this.addSphere();
                        break;
                    case 2:
                        this.addCapsule();
                        break;
                    default:
                        break;
                }
            });
        }
        addBox() {
            var sX = Math.random() * 0.75 + 0.25;
            var sY = Math.random() * 0.75 + 0.25;
            var sZ = Math.random() * 0.75 + 0.25;
            var box = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(sX, sY, sZ)));
            box.meshRenderer.material = new Laya.BlinnPhongMaterial();
            Laya.Laya.loader.load("res/threeDimen/Physics/rocks.jpg").then((res) => {
                box.meshRenderer.material.albedoTexture = res;
            });
            var transform = box.transform;
            var pos = transform.position;
            pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
            transform.position = pos;
            var rotationEuler = transform.rotationEuler;
            rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
            transform.rotationEuler = rotationEuler;
            var rigidBody = box.addComponent(Laya.Rigidbody3D);
            var boxShape = new Laya.BoxColliderShape(sX, sY, sZ);
            rigidBody.colliderShape = boxShape;
            rigidBody.mass = 10;
            window.rig = rigidBody;
        }
        test() {
        }
        addSphere() {
            var radius = Math.random() * 0.2 + 0.2;
            var sphere = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createSphere(radius)));
            sphere.meshRenderer.material = new Laya.BlinnPhongMaterial();
            Laya.Laya.loader.load("res/threeDimen/Physics/plywood.jpg").then((res) => {
                sphere.meshRenderer.material.albedoTexture = res;
            });
            var pos = sphere.transform.position;
            pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
            sphere.transform.position = pos;
            var rigidBody = sphere.addComponent(Laya.Rigidbody3D);
            var sphereShape = new Laya.SphereColliderShape(radius);
            rigidBody.colliderShape = sphereShape;
            rigidBody.mass = 10;
        }
        addCapsule() {
            var raidius = Math.random() * 0.2 + 0.2;
            var height = Math.random() * 0.5 + 0.8;
            var capsule = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCapsule(raidius, height)));
            capsule.meshRenderer.material = new Laya.BlinnPhongMaterial();
            Laya.Laya.loader.load("res/threeDimen/Physics/wood.jpg").then((res) => {
                capsule.meshRenderer.material.albedoTexture = res;
            });
            var transform = capsule.transform;
            var pos = transform.position;
            pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
            transform.position = pos;
            var rotationEuler = transform.rotationEuler;
            rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
            transform.rotationEuler = rotationEuler;
            var rigidBody = capsule.addComponent(Laya.Rigidbody3D);
            var sphereShape = new Laya.CapsuleColliderShape(raidius, height);
            rigidBody.colliderShape = sphereShape;
            rigidBody.mass = 10;
        }
        addCone() {
            var raidius = Math.random() * 0.2 + 0.2;
            var height = Math.random() * 0.5 + 0.8;
            var cone = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCone(raidius, height));
            this.scene.addChild(cone);
            cone.meshRenderer.material = new Laya.BlinnPhongMaterial();
            Laya.Laya.loader.load("res/threeDimen/Physics/steel2.jpg").then((res) => {
                cone.meshRenderer.material.albedoTexture = res;
            });
            var pos = cone.transform.position;
            pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
            cone.transform.position = pos;
            var rigidBody = cone.addComponent(Laya.Rigidbody3D);
            var coneShape = new Laya.ConeColliderShape(raidius, height);
            rigidBody.colliderShape = coneShape;
            rigidBody.mass = 10;
        }
        addCylinder() {
            var raidius = Math.random() * 0.2 + 0.2;
            var height = Math.random() * 0.5 + 0.8;
            var cylinder = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCylinder(raidius, height));
            this.scene.addChild(cylinder);
            cylinder.meshRenderer.material = new Laya.BlinnPhongMaterial();
            Laya.Laya.loader.load("res/threeDimen/Physics/steel.jpg").then((res) => {
                cylinder.meshRenderer.material.albedoTexture = res;
            });
            var transform = cylinder.transform;
            var pos = transform.position;
            pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
            transform.position = pos;
            var rotationEuler = transform.rotationEuler;
            rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
            transform.rotationEuler = rotationEuler;
            var rigidBody = cylinder.addComponent(Laya.Rigidbody3D);
            var cylinderShape = new Laya.CylinderColliderShape(raidius, height);
            rigidBody.colliderShape = cylinderShape;
            rigidBody.mass = 10;
        }
    }

    class PhysicsWorld_BuildingBlocks {
        constructor() {
            this.ray = new Laya.Ray(new Laya.Vector3(0, 0, 0), new Laya.Vector3(0, 0, 0));
            this.point = new Laya.Vector2();
            this._outHitResult = new Laya.HitResult();
            this.ZERO = new Laya.Vector3(0, 0, 0);
            this.ONE = new Laya.Vector3(1, 1, 1);
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                this.camera = this.scene.addChild(new Laya.Camera(0, 0.1, 100));
                this.camera.transform.translate(new Laya.Vector3(4.5, 6, 4.5));
                this.camera.transform.rotate(new Laya.Vector3(-30, 45, 0), true, false);
                let directionLight = new Laya.Sprite3D();
                let dircom = directionLight.addComponent(Laya.DirectionLightCom);
                this.scene.addChild(directionLight);
                dircom.color = new Laya.Color(1, 1, 1, 1);
                var mat = directionLight.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(-1.0, -1.0, 1.0));
                directionLight.transform.worldMatrix = mat;
                var plane = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(13, 13, 10, 10)));
                var planeMat = new Laya.BlinnPhongMaterial();
                Laya.Texture2D.load("res/threeDimen/Physics/wood.jpg", Laya.Handler.create(this, function (tex) {
                    planeMat.albedoTexture = tex;
                }));
                planeMat.tilingOffset = new Laya.Vector4(2, 2, 0, 0);
                plane.meshRenderer.material = planeMat;
                plane.meshRenderer.receiveShadow = true;
                this.mesh1 = Laya.PrimitiveMesh.createBox(2, 0.33, 0.5);
                this.mesh2 = Laya.PrimitiveMesh.createBox(0.5, 0.33, 2);
                this.mat = new Laya.BlinnPhongMaterial();
                Laya.Texture2D.load("res/threeDimen/Physics/plywood.jpg", Laya.Handler.create(this, function (tex) {
                    this.mat.albedoTexture = tex;
                }));
                var rigidBody = plane.addComponent(Laya.PhysicsCollider);
                var boxShape = new Laya.BoxColliderShape(13, 0, 13);
                rigidBody.colliderShape = boxShape;
                this.addMouseEvent();
                this.addBox();
            });
        }
        addBox() {
            for (var i = 0; i < 8; i++) {
                this.addVerticalBox(-0.65, 0.165 + i * 0.33 * 2, 0);
                this.addVerticalBox(0, 0.165 + i * 0.33 * 2, 0);
                this.addVerticalBox(0.65, 0.165 + i * 0.33 * 2, 0);
                this.addHorizontalBox(0, 0.165 + 0.33 + i * 0.33 * 2, -0.65);
                this.addHorizontalBox(0, 0.165 + 0.33 + i * 0.33 * 2, 0);
                this.addHorizontalBox(0, 0.165 + 0.33 + i * 0.33 * 2, 0.65);
            }
        }
        addHorizontalBox(x, y, z) {
            var box = this.scene.addChild(new Laya.MeshSprite3D(this.mesh1));
            box.meshRenderer.material = this.mat;
            box.meshRenderer.castShadow = true;
            box.meshRenderer.receiveShadow = true;
            box.transform.position = new Laya.Vector3(x, y, z);
            var rigidBody = box.addComponent(Laya.Rigidbody3D);
            rigidBody.mass = 10;
            rigidBody.friction = 0.4;
            rigidBody.restitution = 0.2;
            var boxShape = new Laya.BoxColliderShape(2, 0.33, 0.5);
            rigidBody.colliderShape = boxShape;
        }
        addVerticalBox(x, y, z) {
            var box = this.scene.addChild(new Laya.MeshSprite3D(this.mesh2));
            box.meshRenderer.material = this.mat;
            box.meshRenderer.castShadow = true;
            box.meshRenderer.receiveShadow = true;
            box.transform.position = new Laya.Vector3(x, y, z);
            var rigidBody = box.addComponent(Laya.Rigidbody3D);
            rigidBody.mass = 10;
            rigidBody.friction = 0.4;
            rigidBody.restitution = 0.2;
            var boxShape = new Laya.BoxColliderShape(0.5, 0.33, 2);
            rigidBody.colliderShape = boxShape;
        }
        addMouseEvent() {
            Laya.Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            Laya.Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            Laya.Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseOut);
        }
        onMouseDown() {
            this.posX = this.point.x = Laya.Laya.stage.mouseX;
            this.posY = this.point.y = Laya.Laya.stage.mouseY;
            this.camera.viewportPointToRay(this.point, this.ray);
            this.scene.physicsSimulation.rayCast(this.ray, this._outHitResult);
            if (this._outHitResult.succeeded) {
                var collider = this._outHitResult.collider.owner.getComponent(Laya.Rigidbody3D);
                this.hasSelectedSprite = collider.owner;
                this.hasSelectedRigidBody = collider;
                collider.angularFactor = this.ZERO;
                collider.angularVelocity = this.ZERO;
                collider.linearFactor = this.ZERO;
                collider.linearVelocity = this.ZERO;
            }
            Laya.Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        }
        onMouseMove() {
            this.delX = Laya.Laya.stage.mouseX - this.posX;
            this.delY = Laya.Laya.stage.mouseY - this.posY;
            if (this.hasSelectedSprite) {
                this.hasSelectedRigidBody.linearVelocity = new Laya.Vector3(this.delX / 4, 0, this.delY / 4);
            }
            this.posX = Laya.Laya.stage.mouseX;
            this.posY = Laya.Laya.stage.mouseY;
        }
        onMouseUp() {
            Laya.Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            if (this.hasSelectedSprite) {
                this.hasSelectedRigidBody.angularFactor = this.ONE;
                this.hasSelectedRigidBody.linearFactor = this.ONE;
                this.hasSelectedSprite = null;
            }
        }
        onMouseOut() {
            Laya.Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            if (this.hasSelectedSprite) {
                this.hasSelectedRigidBody.angularFactor = this.ONE;
                this.hasSelectedRigidBody.linearFactor = this.ONE;
                this.hasSelectedSprite = null;
            }
        }
    }

    class PhysicsWorld_Character {
        constructor() {
            this.translateW = new Laya.Vector3(0, 0, -0.2);
            this.translateS = new Laya.Vector3(0, 0, 0.2);
            this.translateA = new Laya.Vector3(-0.2, 0, 0);
            this.translateD = new Laya.Vector3(0.2, 0, 0);
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                this.camera = this.scene.addChild(new Laya.Camera(0, 0.1, 100));
                this.camera.transform.translate(new Laya.Vector3(0, 8, 20));
                this.camera.transform.rotate(new Laya.Vector3(-30, 0, 0), true, false);
                let directionLight = new Laya.Sprite3D();
                let dircom = directionLight.addComponent(Laya.DirectionLightCom);
                this.scene.addChild(directionLight);
                this.scene.addChild(directionLight);
                dircom.color = new Laya.Color(1, 1, 1, 1);
                var mat = directionLight.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(-1.0, -1.0, 1.0));
                directionLight.transform.worldMatrix = mat;
                var plane = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(20, 20, 10, 10)));
                var planeMat = new Laya.BlinnPhongMaterial();
                Laya.Texture2D.load("res/threeDimen/Physics/wood.jpg", Laya.Handler.create(this, function (tex) {
                    planeMat.albedoTexture = tex;
                }));
                var tilingOffset = planeMat.tilingOffset;
                tilingOffset.setValue(2, 2, 0, 0);
                planeMat.tilingOffset = tilingOffset;
                plane.meshRenderer.material = planeMat;
                this.mat1 = new Laya.BlinnPhongMaterial();
                this.mat2 = new Laya.BlinnPhongMaterial();
                Laya.Texture2D.load("res/threeDimen/Physics/rocks.jpg", Laya.Handler.create(this, function (tex) {
                    this.mat1.albedoTexture = tex;
                }));
                Laya.Texture2D.load("res/threeDimen/Physics/wood.jpg", Laya.Handler.create(this, function (tex) {
                    this.mat2.albedoTexture = tex;
                }));
                var physicsCollider = plane.addComponent(Laya.PhysicsCollider);
                var boxShape = new Laya.BoxColliderShape(20, 0.5, 20);
                var boxoffset = boxShape.localOffset;
                boxoffset.setValue(0, -0.25, 0);
                boxShape.localOffset = boxoffset;
                physicsCollider.colliderShape = boxShape;
                for (var i = 0; i < 60; i++) {
                    this.addBox();
                    this.addCapsule();
                }
                this.addCharacter();
            });
        }
        addCharacter() {
            var _this = this;
            Laya.Sprite3D.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Laya.Handler.create(this, function (monkey) {
                this.scene.addChild(monkey);
                monkey.transform.position = new Laya.Vector3(0.0, 0.0, 0.0);
                monkey.getChildAt(0).transform.localScale = new Laya.Vector3(1, 1, 1);
                var character = monkey.addComponent(Laya.CharacterController);
                var sphereShape = new Laya.CapsuleColliderShape(1.0, 4.0);
                var localOffset = sphereShape.localOffset;
                localOffset.setValue(0, 2.0, 0);
                sphereShape.localOffset = localOffset;
                character.colliderShape = sphereShape;
                _this.kinematicSphere = monkey;
                Laya.Laya.timer.frameLoop(1, _this, this.onKeyDown);
            }));
        }
        onKeyDown() {
            var character = this.kinematicSphere.getComponent(Laya.CharacterController);
            Laya.InputManager.hasKeyDown(87) && character.move(this.translateW);
            Laya.InputManager.hasKeyDown(83) && character.move(this.translateS);
            Laya.InputManager.hasKeyDown(65) && character.move(this.translateA);
            Laya.InputManager.hasKeyDown(68) && character.move(this.translateD);
            Laya.InputManager.hasKeyDown(69) && character.jump();
        }
        addBox() {
            var sX = Math.random() * 0.75 + 0.25;
            var sY = Math.random() * 0.75 + 0.25;
            var sZ = Math.random() * 0.75 + 0.25;
            var box = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(sX, sY, sZ)));
            box.meshRenderer.material = this.mat1;
            var transform = box.transform;
            var pos = transform.position;
            pos.setValue(Math.random() * 4 - 2, 2, Math.random() * 4 - 2);
            transform.position = pos;
            var rotationEuler = transform.rotationEuler;
            rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
            transform.rotationEuler = rotationEuler;
            var rigidBody = box.addComponent(Laya.Rigidbody3D);
            var boxShape = new Laya.BoxColliderShape(sX, sY, sZ);
            rigidBody.colliderShape = boxShape;
            rigidBody.mass = 10;
        }
        addCapsule() {
            var raidius = Math.random() * 0.2 + 0.2;
            var height = Math.random() * 0.5 + 0.8;
            var capsule = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCapsule(raidius, height)));
            capsule.meshRenderer.material = this.mat2;
            var transform = capsule.transform;
            var pos = transform.position;
            pos.setValue(Math.random() * 4 - 2, 2, Math.random() * 4 - 2);
            transform.position = pos;
            var rotationEuler = transform.rotationEuler;
            rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
            transform.rotationEuler = rotationEuler;
            var rigidBody = capsule.addComponent(Laya.Rigidbody3D);
            var sphereShape = new Laya.CapsuleColliderShape(raidius, height);
            rigidBody.colliderShape = sphereShape;
            rigidBody.mass = 10;
        }
    }

    class PhysicsWorld_CollisionFiflter {
        constructor() {
            this.translateW = new Laya.Vector3(0, 0, -0.2);
            this.translateS = new Laya.Vector3(0, 0, 0.2);
            this.translateA = new Laya.Vector3(-0.2, 0, 0);
            this.translateD = new Laya.Vector3(0.2, 0, 0);
            this.translateQ = new Laya.Vector3(-0.01, 0, 0);
            this.translateE = new Laya.Vector3(0.01, 0, 0);
            this._albedoColor = new Laya.Color(1.0, 0.0, 0.0, 1.0);
            this.tmpVector = new Laya.Vector3(0, 0, 0);
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                this.camera = this.scene.addChild(new Laya.Camera(0, 0.1, 100));
                this.camera.transform.translate(new Laya.Vector3(0, 8, 18));
                this.camera.transform.rotate(new Laya.Vector3(-30, 0, 0), true, false);
                let directionLight = new Laya.Sprite3D();
                let dircom = directionLight.addComponent(Laya.DirectionLightCom);
                this.scene.addChild(directionLight);
                dircom.color = new Laya.Color(1, 1, 1, 1);
                var mat = directionLight.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(-1.0, -1.0, 1.0));
                directionLight.transform.worldMatrix = mat;
                this.mat1 = new Laya.BlinnPhongMaterial();
                this.mat2 = new Laya.BlinnPhongMaterial();
                this.mat3 = new Laya.BlinnPhongMaterial();
                this.mat4 = new Laya.BlinnPhongMaterial();
                this.mat5 = new Laya.BlinnPhongMaterial();
                Laya.Texture2D.load("res/threeDimen/Physics/rocks.jpg", Laya.Handler.create(this, function (tex) {
                    this.mat1.albedoTexture = tex;
                }));
                Laya.Texture2D.load("res/threeDimen/Physics/plywood.jpg", Laya.Handler.create(this, function (tex) {
                    this.mat2.albedoTexture = tex;
                }));
                Laya.Texture2D.load("res/threeDimen/Physics/wood.jpg", Laya.Handler.create(this, function (tex) {
                    this.mat3.albedoTexture = tex;
                }));
                Laya.Texture2D.load("res/threeDimen/Physics/steel2.jpg", Laya.Handler.create(this, function (tex) {
                    this.mat4.albedoTexture = tex;
                }));
                Laya.Texture2D.load("res/threeDimen/Physics/steel.jpg", Laya.Handler.create(this, function (tex) {
                    this.mat5.albedoTexture = tex;
                }));
                this.plane = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(20, 20, 10, 10)));
                var planeMat = new Laya.BlinnPhongMaterial();
                Laya.Texture2D.load("res/threeDimen/Physics/wood.jpg", Laya.Handler.create(this, function (tex) {
                    planeMat.albedoTexture = tex;
                }));
                planeMat.tilingOffset = new Laya.Vector4(2, 2, 0, 0);
                this.plane.meshRenderer.material = planeMat;
                var staticCollider = this.plane.addComponent(Laya.PhysicsCollider);
                var boxShape = new Laya.BoxColliderShape(20, 0, 20);
                staticCollider.colliderShape = boxShape;
                this.addKinematicSphere();
                for (var i = 0; i < 20; i++) {
                    this.addBox();
                    this.addCapsule();
                    this.addCone();
                    this.addCylinder();
                    this.addSphere();
                }
            });
        }
        addKinematicSphere() {
            var mat2 = new Laya.BlinnPhongMaterial();
            Laya.Texture2D.load("res/threeDimen/Physics/plywood.jpg", Laya.Handler.create(this, function (tex) {
                mat2.albedoTexture = tex;
            }));
            mat2.albedoColor = this._albedoColor;
            var radius = 0.8;
            var sphere = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createSphere(radius)));
            sphere.meshRenderer.material = mat2;
            var pos = sphere.transform.position;
            pos.setValue(0, 0.8, 0);
            sphere.transform.position = pos;
            var rigidBody = sphere.addComponent(Laya.Rigidbody3D);
            var sphereShape = new Laya.SphereColliderShape(radius);
            rigidBody.colliderShape = sphereShape;
            rigidBody.mass = 60;
            rigidBody.isKinematic = true;
            rigidBody.canCollideWith = Laya.Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER1 | Laya.Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER3 | Laya.Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER5;
            this.kinematicSphere = sphere;
            Laya.Laya.timer.frameLoop(1, this, this.onKeyDown);
        }
        onKeyDown() {
            Laya.InputManager.hasKeyDown(87) && this.kinematicSphere.transform.translate(this.translateW);
            Laya.InputManager.hasKeyDown(83) && this.kinematicSphere.transform.translate(this.translateS);
            Laya.InputManager.hasKeyDown(65) && this.kinematicSphere.transform.translate(this.translateA);
            Laya.InputManager.hasKeyDown(68) && this.kinematicSphere.transform.translate(this.translateD);
            Laya.InputManager.hasKeyDown(81) && this.plane.transform.translate(this.translateQ);
            Laya.InputManager.hasKeyDown(69) && this.plane.transform.translate(this.translateE);
        }
        addBox() {
            var sX = Math.random() * 0.75 + 0.25;
            var sY = Math.random() * 0.75 + 0.25;
            var sZ = Math.random() * 0.75 + 0.25;
            var box = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(sX, sY, sZ)));
            box.meshRenderer.material = this.mat1;
            var transform = box.transform;
            var pos = transform.position;
            pos.setValue(Math.random() * 16 - 8, sY / 2, Math.random() * 16 - 8);
            transform.position = pos;
            var rotationEuler = transform.rotationEuler;
            rotationEuler.setValue(0, Math.random() * 360, 0);
            transform.rotationEuler = rotationEuler;
            var rigidBody = box.addComponent(Laya.Rigidbody3D);
            var boxShape = new Laya.BoxColliderShape(sX, sY, sZ);
            rigidBody.colliderShape = boxShape;
            rigidBody.mass = 10;
            rigidBody.collisionGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER1;
        }
        addCapsule() {
            var raidius = Math.random() * 0.2 + 0.2;
            var height = Math.random() * 0.5 + 0.8;
            var capsule = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCapsule(raidius, height)));
            capsule.meshRenderer.material = this.mat3;
            var transform = capsule.transform;
            var pos = transform.position;
            pos.setValue(Math.random() * 4 - 2, 2, Math.random() * 4 - 2);
            transform.position = pos;
            var rotationEuler = transform.rotationEuler;
            rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
            transform.rotationEuler = rotationEuler;
            var rigidBody = capsule.addComponent(Laya.Rigidbody3D);
            var sphereShape = new Laya.CapsuleColliderShape(raidius, height);
            rigidBody.colliderShape = sphereShape;
            rigidBody.mass = 10;
            rigidBody.collisionGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER2;
        }
        addCone() {
            var raidius = Math.random() * 0.2 + 0.2;
            var height = Math.random() * 0.5 + 0.8;
            var cone = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCone(raidius, height));
            this.scene.addChild(cone);
            cone.meshRenderer.material = this.mat4;
            var transform = cone.transform;
            var pos = transform.position;
            pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
            transform.position = pos;
            var rigidBody = cone.addComponent(Laya.Rigidbody3D);
            var coneShape = new Laya.ConeColliderShape(raidius, height);
            rigidBody.colliderShape = coneShape;
            rigidBody.mass = 10;
            rigidBody.collisionGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER3;
        }
        addCylinder() {
            var mat5 = new Laya.BlinnPhongMaterial();
            Laya.Texture2D.load("res/threeDimen/Physics/steel.jpg", Laya.Handler.create(this, function (tex) {
                mat5.albedoTexture = tex;
            }));
            var raidius = Math.random() * 0.2 + 0.2;
            var height = Math.random() * 0.5 + 0.8;
            var cylinder = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCylinder(raidius, height));
            this.scene.addChild(cylinder);
            cylinder.meshRenderer.material = mat5;
            var transform = cylinder.transform;
            var pos = transform.position;
            pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
            transform.position = pos;
            var rotationEuler = transform.rotationEuler;
            rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
            transform.rotationEuler = rotationEuler;
            var rigidBody = cylinder.addComponent(Laya.Rigidbody3D);
            var cylinderShape = new Laya.CylinderColliderShape(raidius, height);
            rigidBody.colliderShape = cylinderShape;
            rigidBody.mass = 10;
            rigidBody.collisionGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER4;
        }
        addSphere() {
            var radius = Math.random() * 0.2 + 0.2;
            var sphere = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createSphere(radius)));
            sphere.meshRenderer.material = this.mat2;
            var pos = sphere.transform.position;
            pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
            sphere.transform.position = pos;
            var rigidBody = sphere.addComponent(Laya.Rigidbody3D);
            var sphereShape = new Laya.SphereColliderShape(radius);
            rigidBody.colliderShape = sphereShape;
            rigidBody.mass = 10;
            rigidBody.collisionGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER5;
        }
    }

    class PhysicsWorld_ContinueCollisionDetection {
        constructor() {
            let physet = new Laya.PhysicsSettings();
            physet.enableCCD = true;
            Laya.Scene3D.physicsSettings = physet;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = this.scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.transform.translate(new Laya.Vector3(0, 6, 9.5));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                camera.addComponent(CameraMoveScript);
                let directionLight = new Laya.Sprite3D();
                let dircom = directionLight.addComponent(Laya.DirectionLightCom);
                this.scene.addChild(directionLight);
                dircom.color.setValue(0.6, 0.6, 0.6, 1);
                var mat = directionLight.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(-1.0, -1.0, -1.0));
                directionLight.transform.worldMatrix = mat;
                this.mat2 = new Laya.BlinnPhongMaterial();
                Laya.Texture2D.load("res/threeDimen/Physics/plywood.jpg", Laya.Handler.create(this, function (tex) {
                    this.mat2.albedoTexture = tex;
                }));
                var plane = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(10, 10, 10, 10)));
                var planeMat = new Laya.BlinnPhongMaterial();
                Laya.Texture2D.load("res/threeDimen/Physics/grass.png", Laya.Handler.create(this, function (tex) {
                    planeMat.albedoTexture = tex;
                }));
                var tilingOffset = planeMat.tilingOffset;
                tilingOffset.setValue(10, 10, 0, 0);
                planeMat.tilingOffset = tilingOffset;
                plane.meshRenderer.material = planeMat;
                var planeStaticCollider = plane.addComponent(Laya.PhysicsCollider);
                var planeShape = new Laya.BoxColliderShape(10, 0, 10);
                planeStaticCollider.colliderShape = planeShape;
                planeStaticCollider.friction = 2;
                planeStaticCollider.restitution = 0.3;
                Laya.Laya.timer.loop(200, this, function () {
                    this.addSphere();
                });
            });
        }
        addSphere() {
            var radius = Math.random() * 0.2 + 0.2;
            var sphere = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createSphere(radius)));
            sphere.meshRenderer.material = new Laya.BlinnPhongMaterial();
            sphere.meshRenderer.material.albedoTexture = Laya.Loader.getRes("resources/res/threeDimen/Physics/plywood.jpg");
            var pos = sphere.transform.position;
            pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
            sphere.transform.position = pos;
            var rigidBody = sphere.addComponent(Laya.Rigidbody3D);
            var sphereShape = new Laya.SphereColliderShape(radius);
            rigidBody.gravity = new Laya.Vector3(0, -98.0, 0);
            rigidBody.colliderShape = sphereShape;
            rigidBody.mass = 10;
        }
    }

    class PhysicsWorld_Kinematic {
        constructor() {
            this.translateW = new Laya.Vector3(0, 0, -0.2);
            this.translateS = new Laya.Vector3(0, 0, 0.2);
            this.translateA = new Laya.Vector3(-0.2, 0, 0);
            this.translateD = new Laya.Vector3(0.2, 0, 0);
            this.translateQ = new Laya.Vector3(-0.01, 0, 0);
            this.translateE = new Laya.Vector3(0.01, 0, 0);
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                this.camera = this.scene.addChild(new Laya.Camera(0, 0.1, 100));
                this.camera.transform.translate(new Laya.Vector3(0, 8, 20));
                this.camera.transform.rotate(new Laya.Vector3(-30, 0, 0), true, false);
                let directionLight = new Laya.Sprite3D();
                let dircom = directionLight.addComponent(Laya.DirectionLightCom);
                this.scene.addChild(directionLight);
                dircom.color = new Laya.Color(1, 1, 1, 1);
                var mat = directionLight.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(-1.0, -1.0, 1.0));
                directionLight.transform.worldMatrix = mat;
                this.mat1 = new Laya.BlinnPhongMaterial();
                this.mat3 = new Laya.BlinnPhongMaterial();
                Laya.Texture2D.load("res/threeDimen/Physics/rocks.jpg", Laya.Handler.create(this, function (tex) {
                    this.mat1.albedoTexture = tex;
                }));
                Laya.Texture2D.load("res/threeDimen/Physics/wood.jpg", Laya.Handler.create(this, function (tex) {
                    this.mat3.albedoTexture = tex;
                }));
                this.plane = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(20, 20, 10, 10)));
                var planeMat = new Laya.BlinnPhongMaterial();
                Laya.Texture2D.load("res/threeDimen/Physics/wood.jpg", Laya.Handler.create(this, function (tex) {
                    planeMat.albedoTexture = tex;
                }));
                planeMat.tilingOffset = new Laya.Vector4(2, 2, 0, 0);
                this.plane.meshRenderer.material = planeMat;
                var rigidBody = this.plane.addComponent(Laya.PhysicsCollider);
                var boxShape = new Laya.BoxColliderShape(20, 0, 20);
                rigidBody.colliderShape = boxShape;
                for (var i = 0; i < 60; i++) {
                    this.addBox();
                    this.addCapsule();
                }
                this.addKinematicSphere();
            });
        }
        addKinematicSphere() {
            var mat2 = new Laya.BlinnPhongMaterial();
            Laya.Texture2D.load("res/threeDimen/Physics/plywood.jpg", Laya.Handler.create(this, function (tex) {
                mat2.albedoTexture = tex;
            }));
            var albedoColor = mat2.albedoColor;
            albedoColor.setValue(1.0, 0.0, 0.0, 1.0);
            mat2.albedoColor = albedoColor;
            var radius = 0.8;
            var sphere = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createSphere(radius)));
            sphere.meshRenderer.material = mat2;
            var pos = sphere.transform.position;
            pos.setValue(0, 0.8, 0);
            sphere.transform.position = pos;
            var rigidBody = sphere.addComponent(Laya.Rigidbody3D);
            var sphereShape = new Laya.SphereColliderShape(radius);
            rigidBody.colliderShape = sphereShape;
            rigidBody.isKinematic = true;
            this.kinematicSphere = sphere;
            Laya.Laya.timer.frameLoop(1, this, this.onKeyDown);
        }
        onKeyDown() {
            Laya.InputManager.hasKeyDown(87) && this.kinematicSphere.transform.translate(this.translateW);
            Laya.InputManager.hasKeyDown(83) && this.kinematicSphere.transform.translate(this.translateS);
            Laya.InputManager.hasKeyDown(65) && this.kinematicSphere.transform.translate(this.translateA);
            Laya.InputManager.hasKeyDown(68) && this.kinematicSphere.transform.translate(this.translateD);
            Laya.InputManager.hasKeyDown(81) && this.plane.transform.translate(this.translateQ);
            Laya.InputManager.hasKeyDown(69) && this.plane.transform.translate(this.translateE);
        }
        addBox() {
            var sX = Math.random() * 0.75 + 0.25;
            var sY = Math.random() * 0.75 + 0.25;
            var sZ = Math.random() * 0.75 + 0.25;
            var box = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(sX, sY, sZ)));
            box.meshRenderer.material = this.mat1;
            var transform = box.transform;
            var pos = transform.position;
            pos.setValue(Math.random() * 4 - 2, 2, Math.random() * 4 - 2);
            transform.position = pos;
            var rotationEuler = transform.rotationEuler;
            rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
            transform.rotationEuler = rotationEuler;
            var rigidBody = box.addComponent(Laya.Rigidbody3D);
            var boxShape = new Laya.BoxColliderShape(sX, sY, sZ);
            rigidBody.colliderShape = boxShape;
            rigidBody.mass = 10;
        }
        addCapsule() {
            var raidius = Math.random() * 0.2 + 0.2;
            var height = Math.random() * 0.5 + 0.8;
            var capsule = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCapsule(raidius, height)));
            capsule.meshRenderer.material = this.mat3;
            var transform = capsule.transform;
            var pos = transform.position;
            pos.setValue(Math.random() * 4 - 2, 2, Math.random() * 4 - 2);
            transform.position = pos;
            var rotationEuler = transform.rotationEuler;
            rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
            transform.rotationEuler = rotationEuler;
            var rigidBody = capsule.addComponent(Laya.Rigidbody3D);
            var sphereShape = new Laya.CapsuleColliderShape(raidius, height);
            rigidBody.colliderShape = sphereShape;
            rigidBody.mass = 10;
        }
    }

    class PhysicsWorld_MeshCollider {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = this.scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.transform.translate(new Laya.Vector3(0, 6, 9.5));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                camera.addComponent(CameraMoveScript);
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                this.scene.addChild(directlightSprite);
                var mat = directlightSprite.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(0.0, -0.8, -1.0));
                directlightSprite.transform.worldMatrix = mat;
                dircom.color = new Laya.Color(1, 1, 1, 1);
                Laya.Laya.loader.load(["res/threeDimen/staticModel/lizard/Assets/Lizard/lizard-lizard_geo.lm", "res/threeDimen/staticModel/lizard/Assets/Lizard/lizard_diff.png", "res/threeDimen/staticModel/lizard/Assets/Lizard/lizard_norm.png"], Laya.Handler.create(this, this.complete));
            });
        }
        complete() {
            var mesh = Laya.Loader.getRes("res/threeDimen/staticModel/lizard/Assets/Lizard/lizard-lizard_geo.lm");
            var albedo = Laya.Loader.getTexture2D("res/threeDimen/staticModel/lizard/Assets/Lizard/lizard_diff.png");
            var normal = Laya.Loader.getTexture2D("res/threeDimen/staticModel/lizard/Assets/Lizard/lizard_norm.png");
            var mat = new Laya.BlinnPhongMaterial();
            mat.specularColor = new Laya.Color(0.5, 0.5, 0.5, 0.5);
            mat.albedoTexture = albedo;
            mat.normalTexture = normal;
            var lizard = this.scene.addChild(new Laya.MeshSprite3D(mesh));
            lizard.transform.localPosition = new Laya.Vector3(-2, 0, 0);
            lizard.transform.localScale = new Laya.Vector3(0.01, 0.01, 0.01);
            lizard.meshRenderer.material = mat;
            var lizardCollider = lizard.addComponent(Laya.PhysicsCollider);
            var meshShape = new Laya.MeshColliderShape();
            meshShape.mesh = mesh;
            lizardCollider.colliderShape = meshShape;
            lizardCollider.friction = 2;
            lizardCollider.restitution = 0.3;
            var lizard1 = this.scene.addChild(new Laya.MeshSprite3D(mesh));
            var transform = lizard1.transform;
            var localPosition = transform.localPosition;
            var localRotationEuler = transform.localRotationEuler;
            var localScale = transform.localScale;
            localPosition.setValue(3, 0, 0);
            localRotationEuler.setValue(0, 80, 0);
            localScale.setValue(0.01, 0.01, 0.01);
            transform.localPosition = localPosition;
            transform.localRotationEuler = localRotationEuler;
            transform.localScale = localScale;
            lizard1.meshRenderer.material = mat;
            var lizardCollider1 = lizard1.addComponent(Laya.PhysicsCollider);
            var meshShape1 = new Laya.MeshColliderShape();
            meshShape1.mesh = mesh;
            lizardCollider1.colliderShape = meshShape1;
            lizardCollider1.friction = 2;
            lizardCollider1.restitution = 0.3;
            this.randomAddPhysicsSprite();
        }
        randomAddPhysicsSprite() {
            Laya.Laya.timer.loop(1000, this, function () {
                var random = Math.floor(Math.random() * 3) % 3;
                switch (random) {
                    case 0:
                        this.addBox();
                        break;
                    case 1:
                        this.addSphere();
                        break;
                    case 2:
                        this.addCapsule();
                        break;
                    default:
                        break;
                }
            });
        }
        addBox() {
            var sX = Math.random() * 0.75 + 0.25;
            var sY = Math.random() * 0.75 + 0.25;
            var sZ = Math.random() * 0.75 + 0.25;
            var box = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(sX, sY, sZ)));
            box.meshRenderer.material = new Laya.BlinnPhongMaterial();
            Laya.Laya.loader.load("res/threeDimen/Physics/rocks.jpg").then((res) => {
                box.meshRenderer.material.albedoTexture = res;
            });
            var transform = box.transform;
            var pos = transform.position;
            pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
            transform.position = pos;
            var rotationEuler = transform.rotationEuler;
            rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
            transform.rotationEuler = rotationEuler;
            var rigidBody = box.addComponent(Laya.Rigidbody3D);
            var boxShape = new Laya.BoxColliderShape(sX, sY, sZ);
            rigidBody.colliderShape = boxShape;
            rigidBody.mass = 10;
        }
        addSphere() {
            var radius = Math.random() * 0.2 + 0.2;
            var sphere = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createSphere(radius)));
            sphere.meshRenderer.material = new Laya.BlinnPhongMaterial();
            Laya.Laya.loader.load("res/threeDimen/Physics/plywood.jpg").then((res) => {
                sphere.meshRenderer.material.albedoTexture = res;
            });
            var pos = sphere.transform.position;
            pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
            sphere.transform.position = pos;
            var rigidBody = sphere.addComponent(Laya.Rigidbody3D);
            var sphereShape = new Laya.SphereColliderShape(radius);
            rigidBody.colliderShape = sphereShape;
            rigidBody.mass = 10;
        }
        addCapsule() {
            var raidius = Math.random() * 0.2 + 0.2;
            var height = Math.random() * 0.5 + 0.8;
            var capsule = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCapsule(raidius, height)));
            capsule.meshRenderer.material = new Laya.BlinnPhongMaterial();
            Laya.Laya.loader.load("res/threeDimen/Physics/wood.jpg").then((res) => {
                capsule.meshRenderer.material.albedoTexture = res;
            });
            var transform = capsule.transform;
            var pos = transform.position;
            pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
            transform.position = pos;
            var rotationEuler = transform.rotationEuler;
            rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
            transform.rotationEuler = rotationEuler;
            var rigidBody = capsule.addComponent(Laya.Rigidbody3D);
            var sphereShape = new Laya.CapsuleColliderShape(raidius, height);
            rigidBody.colliderShape = sphereShape;
            rigidBody.mass = 10;
        }
    }

    class PhysicsWorld_RayShapeCast {
        constructor() {
            this.castType = 0;
            this.castAll = false;
            this.ray = new Laya.Ray(new Laya.Vector3(0, 0, 0), new Laya.Vector3(0, 0, 0));
            this.hitResult = new Laya.HitResult();
            this.hitResults = [];
            this.debugSprites = [];
            this.from = new Laya.Vector3(0, 1, 10);
            this.to = new Laya.Vector3(0, 1, -5);
            this.dir = new Laya.Vector3(0, 0, -1);
            this._albedoColor = new Laya.Color(1.0, 1.0, 1.0, 0.5);
            this._position = new Laya.Vector3(0, 0, 0);
            this.btype = "PhysicsWorld_RayShapeCast";
            this.stype = 0;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = this.scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.transform.translate(new Laya.Vector3(0, 8, 20));
                camera.transform.rotate(new Laya.Vector3(-30, 0, 0), true, false);
                camera.addComponent(CameraMoveScript);
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                this.scene.addChild(directlightSprite);
                dircom.color = new Laya.Color(1, 1, 1, 1);
                var mat = directlightSprite.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(-1.0, -1.0, 1.0));
                directlightSprite.transform.worldMatrix = mat;
                var plane = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(20, 20, 10, 10)));
                var planeMat = new Laya.BlinnPhongMaterial();
                Laya.Texture2D.load("res/threeDimen/Physics/wood.jpg", Laya.Handler.create(this, function (tex) {
                    planeMat.albedoTexture = tex;
                }));
                var tilingOffset = planeMat.tilingOffset;
                tilingOffset.setValue(2, 2, 0, 0);
                planeMat.tilingOffset = tilingOffset;
                plane.meshRenderer.material = planeMat;
                Laya.Texture2D.load("res/threeDimen/Physics/rocks.jpg", Laya.Handler.create(this, function (tex) {
                    this.tex = tex;
                }));
                Laya.Texture2D.load("res/threeDimen/Physics/wood.jpg", Laya.Handler.create(this, function (tex) {
                    this.tex1 = tex;
                }));
                var planeBody = plane.addComponent(Laya.PhysicsCollider);
                var boxCollider = new Laya.BoxColliderShape(20, 0, 20);
                planeBody.colliderShape = boxCollider;
                for (var i = 0; i < 60; i++) {
                    this.addBox();
                    this.addCapsule();
                }
                this.loadUI();
            });
        }
        loadUI() {
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, function () {
                this.changeActionButton0 = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "射线模式"));
                this.changeActionButton0.size(160, 40);
                this.changeActionButton0.labelBold = true;
                this.changeActionButton0.labelSize = 30;
                this.changeActionButton0.sizeGrid = "4,4,4,4";
                this.changeActionButton0.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.changeActionButton0.pos(200, 200);
                this.changeActionButton0.on(Laya.Event.CLICK, this, this.stypeFun0);
                this.changeActionButton1 = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "不穿透"));
                this.changeActionButton1.size(160, 40);
                this.changeActionButton1.labelBold = true;
                this.changeActionButton1.labelSize = 30;
                this.changeActionButton1.sizeGrid = "4,4,4,4";
                this.changeActionButton1.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.changeActionButton1.pos(200, 300);
                this.changeActionButton1.on(Laya.Event.CLICK, this, this.stypeFun1);
                this.changeActionButton2 = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "检测"));
                this.changeActionButton2.size(160, 40);
                this.changeActionButton2.labelBold = true;
                this.changeActionButton2.labelSize = 30;
                this.changeActionButton2.sizeGrid = "4,4,4,4";
                this.changeActionButton2.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.changeActionButton2.pos(200, 400);
                this.changeActionButton2.on(Laya.Event.CLICK, this, this.stypeFun2);
            }));
        }
        stypeFun0(label = "射线模式") {
            this.castType++;
            this.castType %= 4;
            switch (this.castType) {
                case 0:
                    this.changeActionButton0.label = "射线模式";
                    break;
                case 1:
                    this.changeActionButton0.label = "盒子模式";
                    break;
                case 2:
                    this.changeActionButton0.label = "球模式";
                    break;
                case 3:
                    this.changeActionButton0.label = "胶囊模式";
                    break;
            }
            label = this.changeActionButton0.label;
            Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: label });
        }
        stypeFun1(label = "不穿透") {
            if (this.castAll) {
                this.changeActionButton1.label = "不穿透";
                this.castAll = false;
            }
            else {
                this.changeActionButton1.label = "穿透";
                this.castAll = true;
            }
            label = this.changeActionButton1.label;
            Client.instance.send({ type: "next", btype: this.btype, stype: 1, value: label });
        }
        stypeFun2(castType = 0) {
            if (this.hitResult.succeeded)
                this.hitResult.collider.owner.meshRenderer.sharedMaterial.albedoColor = new Laya.Color(1.0, 1.0, 1.0, 1.0);
            if (this.hitResults.length > 0) {
                for (var i = 0, n = this.hitResults.length; i < n; i++)
                    this.hitResults[i].collider.owner.meshRenderer.sharedMaterial.albedoColor = new Laya.Color(1.0, 1.0, 1.0, 1.0);
                this.hitResults.length = 0;
            }
            if (this.debugSprites.length > 0) {
                for (i = 0, n = this.debugSprites.length; i < n; i++)
                    this.debugSprites[i].destroy();
                this.debugSprites.length = 0;
            }
            switch (this.castType) {
                case 0:
                    var lineSprite = this.scene.addChild(new Laya.PixelLineSprite3D(1));
                    lineSprite.addLine(this.from, this.to, Laya.Color.RED, Laya.Color.RED);
                    this.ray.origin = this.from;
                    this.ray.direction = this.dir;
                    this.debugSprites.push(lineSprite);
                    if (this.castAll) {
                        this.scene.physicsSimulation.rayCastAll(this.ray, this.hitResults);
                        for (i = 0, n = this.hitResults.length; i < n; i++)
                            this.hitResults[i].collider.owner.meshRenderer.sharedMaterial.albedoColor = new Laya.Color(1.0, 0.0, 0.0, 1.0);
                    }
                    else {
                        this.scene.physicsSimulation.rayCast(this.ray, this.hitResult, 15);
                        this.hitResult.collider.owner.meshRenderer.sharedMaterial.albedoColor = new Laya.Color(1.0, 0.0, 0.0, 1.0);
                    }
                    break;
                case 1:
                    var boxCollider = new Laya.BoxColliderShape(1.0, 1.0, 1.0);
                    for (i = 0; i < 21; i++) {
                        var boxSprite = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(1.0, 1.0, 1.0)));
                        var mat = new Laya.BlinnPhongMaterial();
                        mat.albedoColor = this._albedoColor;
                        mat.renderMode = Laya.BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
                        boxSprite.meshRenderer.material = mat;
                        Laya.Vector3.lerp(this.from, this.to, i / 20, this._position);
                        boxSprite.transform.localPosition = this._position;
                        this.debugSprites.push(boxSprite);
                    }
                    let ray = new Laya.Ray(this.from, this.to);
                    if (this.castAll) {
                        this.scene.physicsSimulation.shapeCastAll(boxCollider.shape, this.from, this.to, this.hitResults);
                        for (i = 0, n = this.hitResults.length; i < n; i++)
                            this.hitResults[i].collider.owner.meshRenderer.sharedMaterial.albedoColor = new Laya.Color(1.0, 0.0, 0.0, 1.0);
                    }
                    else {
                        if (this.scene.physicsSimulation.rayCast(ray, this.hitResult))
                            this.hitResult.collider.owner.meshRenderer.sharedMaterial.albedoColor = new Laya.Color(1.0, 0.0, 0.0, 1.0);
                    }
                    break;
                case 2:
                    var sphereCollider = new Laya.SphereColliderShape(0.5);
                    for (i = 0; i < 41; i++) {
                        var sphereSprite = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createSphere(0.5)));
                        var mat = new Laya.BlinnPhongMaterial();
                        mat.albedoColor = this._albedoColor;
                        mat.renderMode = Laya.BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
                        sphereSprite.meshRenderer.material = mat;
                        Laya.Vector3.lerp(this.from, this.to, i / 40, this._position);
                        sphereSprite.transform.localPosition = this._position;
                        this.debugSprites.push(sphereSprite);
                    }
                    if (this.castAll) {
                        this.scene.physicsSimulation.shapeCastAll(sphereCollider.shape, this.from, this.to, this.hitResults);
                        for (i = 0, n = this.hitResults.length; i < n; i++)
                            this.hitResults[i].collider.owner.meshRenderer.sharedMaterial.albedoColor = new Laya.Color(1.0, 0.0, 0.0, 1.0);
                    }
                    else {
                        if (this.scene.physicsSimulation.shapeCast(sphereCollider.shape, this.from, this.to, this.hitResult))
                            this.hitResult.collider.owner.meshRenderer.sharedMaterial.albedoColor = new Laya.Color(1.0, 0.0, 0.0, 1.0);
                    }
                    break;
                case 3:
                    var capsuleCollider = new Laya.CapsuleColliderShape(0.25, 1.0);
                    for (i = 0; i < 41; i++) {
                        var capsuleSprite = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCapsule(0.25, 1.0)));
                        var mat = new Laya.BlinnPhongMaterial();
                        mat.albedoColor = this._albedoColor;
                        mat.renderMode = Laya.BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
                        capsuleSprite.meshRenderer.material = mat;
                        Laya.Vector3.lerp(this.from, this.to, i / 40, this._position);
                        capsuleSprite.transform.localPosition = this._position;
                        this.debugSprites.push(capsuleSprite);
                    }
                    if (this.castAll) {
                        this.scene.physicsSimulation.shapeCastAll(capsuleCollider.shape, this.from, this.to, this.hitResults);
                        for (i = 0, n = this.hitResults.length; i < n; i++)
                            this.hitResults[i].collider.owner.meshRenderer.sharedMaterial.albedoColor = new Laya.Color(1.0, 0.0, 0.0, 1.0);
                    }
                    else {
                        if (this.scene.physicsSimulation.shapeCast(capsuleCollider.shape, this.from, this.to, this.hitResult))
                            this.hitResult.collider.owner.meshRenderer.sharedMaterial.albedoColor = new Laya.Color(1.0, 0.0, 0.0, 1.0);
                    }
                    break;
            }
            castType = this.castType;
            Client.instance.send({ type: "next", btype: this.btype, stype: 2, value: castType });
        }
        addBox() {
            var mat1 = new Laya.BlinnPhongMaterial();
            Laya.Texture2D.load("res/threeDimen/Physics/rocks.jpg", Laya.Handler.create(this, function (tex) {
                mat1.albedoTexture = tex;
            }));
            var sX = Math.random() * 0.75 + 0.25;
            var sY = Math.random() * 0.75 + 0.25;
            var sZ = Math.random() * 0.75 + 0.25;
            var box = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(sX, sY, sZ)));
            box.meshRenderer.material = mat1;
            var transform = box.transform;
            var pos = transform.position;
            pos.setValue(Math.random() * 4 - 2, 2, Math.random() * 4 - 2);
            transform.position = pos;
            var rotationEuler = transform.rotationEuler;
            rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
            transform.rotationEuler = rotationEuler;
            var rigidBody = box.addComponent(Laya.Rigidbody3D);
            var boxShape = new Laya.BoxColliderShape(sX, sY, sZ);
            rigidBody.colliderShape = boxShape;
            rigidBody.mass = 10;
        }
        addCapsule() {
            var mat = new Laya.BlinnPhongMaterial();
            Laya.Texture2D.load("res/threeDimen/Physics/wood.jpg", Laya.Handler.create(this, function (tex) {
                mat.albedoTexture = tex;
            }));
            var raidius = Math.random() * 0.2 + 0.2;
            var height = Math.random() * 0.5 + 0.8;
            var capsule = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCapsule(raidius, height)));
            capsule.meshRenderer.material = mat;
            var transform = capsule.transform;
            var pos = transform.position;
            pos.setValue(Math.random() * 4 - 2, 2, Math.random() * 4 - 2);
            transform.position = pos;
            var rotationEuler = transform.rotationEuler;
            rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
            transform.rotationEuler = rotationEuler;
            var rigidBody = capsule.addComponent(Laya.Rigidbody3D);
            var sphereShape = new Laya.CapsuleColliderShape(raidius, height);
            rigidBody.colliderShape = sphereShape;
            rigidBody.mass = 10;
        }
    }

    class PhysicsWorld_TriggerAndCollisionEvent {
        constructor() {
            this.translateW = new Laya.Vector3(0, 0, -0.2);
            this.translateS = new Laya.Vector3(0, 0, 0.2);
            this.translateA = new Laya.Vector3(-0.2, 0, 0);
            this.translateD = new Laya.Vector3(0.2, 0, 0);
            this.translateQ = new Laya.Vector3(-0.01, 0, 0);
            this.translateE = new Laya.Vector3(0.01, 0, 0);
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.scene = new Laya.Scene3D();
                Laya.Laya.stage.addChild(this.scene);
                this.camera = new Laya.Camera(0, 0.1, 100);
                this.scene.addChild(this.camera);
                this.camera.transform.translate(new Laya.Vector3(0, 8, 18));
                this.camera.transform.rotate(new Laya.Vector3(-30, 0, 0), true, false);
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                this.scene.addChild(directlightSprite);
                dircom.color = new Laya.Color(1, 1, 1, 1);
                var mat = directlightSprite.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(-1.0, -1.0, 1.0));
                directlightSprite.transform.worldMatrix = mat;
                this.plane = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(20, 20, 10, 10)));
                var planeMat = new Laya.BlinnPhongMaterial();
                Laya.Texture2D.load("res/threeDimen/Physics/wood.jpg", Laya.Handler.create(this, function (tex) {
                    planeMat.albedoTexture = tex;
                }));
                planeMat.tilingOffset = new Laya.Vector4(2, 2, 0, 0);
                this.plane.meshRenderer.material = planeMat;
                var staticCollider = this.plane.addComponent(Laya.PhysicsCollider);
                var boxShape = new Laya.BoxColliderShape(20, 0, 20);
                staticCollider.colliderShape = boxShape;
                this.addKinematicSphere();
                for (var i = 0; i < 30; i++) {
                    this.addBoxAndTrigger();
                    this.addCapsuleCollision();
                }
            });
        }
        addKinematicSphere() {
            var mat2 = new Laya.BlinnPhongMaterial();
            Laya.Texture2D.load("res/threeDimen/Physics/plywood.jpg", Laya.Handler.create(this, function (tex) {
                mat2.albedoTexture = tex;
            }));
            mat2.albedoColor = new Laya.Color(1.0, 0.0, 0.0, 1.0);
            var radius = 0.8;
            var sphere = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createSphere(radius)));
            sphere.meshRenderer.material = mat2;
            var pos = sphere.transform.position;
            pos.setValue(0, 0.8, 0);
            sphere.transform.position = pos;
            var rigidBody = sphere.addComponent(Laya.Rigidbody3D);
            var sphereShape = new Laya.SphereColliderShape(radius);
            rigidBody.colliderShape = sphereShape;
            rigidBody.mass = 60;
            rigidBody.isKinematic = true;
            this.kinematicSphere = sphere;
            Laya.Laya.timer.frameLoop(1, this, this.onKeyDown);
        }
        onKeyDown() {
            Laya.InputManager.hasKeyDown(87) && this.kinematicSphere.transform.translate(this.translateW);
            Laya.InputManager.hasKeyDown(83) && this.kinematicSphere.transform.translate(this.translateS);
            Laya.InputManager.hasKeyDown(65) && this.kinematicSphere.transform.translate(this.translateA);
            Laya.InputManager.hasKeyDown(68) && this.kinematicSphere.transform.translate(this.translateD);
            Laya.InputManager.hasKeyDown(81) && this.plane.transform.translate(this.translateQ);
            Laya.InputManager.hasKeyDown(69) && this.plane.transform.translate(this.translateE);
        }
        addBoxAndTrigger() {
            var mat1 = new Laya.BlinnPhongMaterial();
            Laya.Texture2D.load("res/threeDimen/Physics/rocks.jpg", Laya.Handler.create(this, function (tex) {
                mat1.albedoTexture = tex;
            }));
            mat1.albedoColor = new Laya.Color(1.0, 1.0, 1.0, 1.0);
            var sX = Math.random() * 0.75 + 0.25;
            var sY = Math.random() * 0.75 + 0.25;
            var sZ = Math.random() * 0.75 + 0.25;
            var box = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(sX, sY, sZ)));
            box.meshRenderer.material = mat1;
            var transform = box.transform;
            var pos = transform.position;
            pos.setValue(Math.random() * 16 - 8, sY / 2, Math.random() * 16 - 8);
            transform.position = pos;
            var rotationEuler = transform.rotationEuler;
            rotationEuler.setValue(0, Math.random() * 360, 0);
            transform.rotationEuler = rotationEuler;
            var staticCollider = box.addComponent(Laya.PhysicsCollider);
            var boxShape = new Laya.BoxColliderShape(sX, sY, sZ);
            staticCollider.colliderShape = boxShape;
            staticCollider.isTrigger = true;
            var script = box.addComponent(TriggerCollisionScript);
            script.kinematicSprite = this.kinematicSphere;
        }
        addCapsuleCollision() {
            var mat3 = new Laya.BlinnPhongMaterial();
            Laya.Texture2D.load("res/threeDimen/Physics/wood.jpg", Laya.Handler.create(this, function (tex) {
                mat3.albedoTexture = tex;
            }));
            var raidius = Math.random() * 0.2 + 0.2;
            var height = Math.random() * 0.5 + 0.8;
            var capsule = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCapsule(raidius, height)));
            capsule.meshRenderer.material = mat3;
            var transform = capsule.transform;
            var pos = transform.position;
            pos.setValue(Math.random() * 4 - 2, 2, Math.random() * 4 - 2);
            transform.position = pos;
            var rotationEuler = transform.rotationEuler;
            rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
            transform.rotationEuler = rotationEuler;
            var rigidBody = capsule.addComponent(Laya.Rigidbody3D);
            var sphereShape = new Laya.CapsuleColliderShape(raidius, height);
            rigidBody.colliderShape = sphereShape;
            rigidBody.mass = 10;
            var script = capsule.addComponent(TriggerCollisionScript);
            script.kinematicSprite = this.kinematicSphere;
        }
        addSphere() {
            var mat2 = new Laya.BlinnPhongMaterial();
            Laya.Texture2D.load("res/threeDimen/Physics/plywood.jpg", Laya.Handler.create(this, function (tex) {
                mat2.albedoTexture = tex;
            }));
            var radius = Math.random() * 0.2 + 0.2;
            var sphere = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createSphere(radius)));
            sphere.meshRenderer.material = mat2;
            var pos = sphere.transform.position;
            pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
            sphere.transform.position = pos;
            var rigidBody = sphere.addComponent(Laya.Rigidbody3D);
            var sphereShape = new Laya.SphereColliderShape(radius);
            rigidBody.colliderShape = sphereShape;
            rigidBody.mass = 10;
        }
    }
    class TriggerCollisionScript extends Laya.Script {
        constructor() {
            super();
        }
        onTriggerEnter(other) {
            this.owner.meshRenderer.sharedMaterial.albedoColor = new Laya.Color(0.0, 1.0, 0.0, 1.0);
            console.log("onTriggerEnter");
        }
        onTriggerStay(other) {
            console.log("onTriggerStay");
        }
        onTriggerExit(other) {
            this.owner.meshRenderer.sharedMaterial.albedoColor = new Laya.Color(1.0, 1.0, 1.0, 1.0);
            console.log("onTriggerExit");
        }
        onCollisionEnter(collision) {
            if (collision.other.owner === this.kinematicSprite)
                this.owner.meshRenderer.sharedMaterial.albedoColor = new Laya.Color(0.0, 0.0, 0.0, 1.0);
        }
        onCollisionStay(collision) {
        }
        onCollisionExit(collision) {
        }
    }

    class GarbageCollection {
        constructor() {
            this._castType = 0;
            this.btype = "GarbageCollection";
            this.stype = 0;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.loadScene();
                this.loadUI();
            });
        }
        loadUI() {
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, function () {
                this.changeActionButton = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "释放显存"));
                this.changeActionButton.zOrder = 10000;
                this.changeActionButton.size(160, 40);
                this.changeActionButton.labelBold = true;
                this.changeActionButton.labelSize = 30;
                this.changeActionButton.sizeGrid = "4,4,4,4";
                this.changeActionButton.pos(200, 200);
                this.changeActionButton.on(Laya.Event.CLICK, this, this.stypeFun0);
            }));
        }
        stypeFun0(label = "加载场景") {
            this._castType++;
            this._castType %= 2;
            switch (this._castType) {
                case 0:
                    this.changeActionButton.label = "释放显存";
                    this.loadScene();
                    break;
                case 1:
                    this.changeActionButton.label = "加载场景";
                    if (this._scene)
                        this.garbageCollection();
                    break;
            }
            label = this.changeActionButton.label;
            Client.instance.send({ "type": "next", "btype": this.btype, "stype": 0, "value": label });
        }
        loadScene() {
            Laya.Scene3D.load("res/threeDimen/scene/ParticleScene/Scene.ls", Laya.Handler.create(this, function (sprite) {
                this._scene = Laya.Laya.stage.addChild(sprite);
            }));
        }
        garbageCollection() {
            this._scene.destroy();
            this._scene = null;
            Laya.Resource.destroyUnusedResources();
        }
    }

    class LoadResourceDemo {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                Laya.Shader3D.debugMode = true;
                this.PreloadingRes();
                Laya.Laya.stage.on(Laya.Event.CLICK, this, () => {
                    Laya.Resource.destroyUnusedResources();
                });
            });
        }
        PreloadingRes() {
            var resource = [
                "res/VRscene/Conventional/SampleScene.ls",
                "res/threeDimen/scene/LayaScene_city01/Conventional/Assets/Sky.lmat",
                "res/threeDimen/texture/earth.png",
                "res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm",
                "res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh",
                "res/threeDimen/skinModel/BoneLinkScene/PangZi.lh",
                "res/threeDimen/skinModel/BoneLinkScene/Assets/Model3D/PangZi-Take 001.lani"
            ];
            Laya.Laya.loader.load(resource, Laya.Handler.create(this, this.onPreLoadFinish));
        }
        onPreLoadFinish() {
            this._scene = Laya.Laya.stage.addChild(Laya.Loader.createNodes("res/VRscene/Conventional/SampleScene.ls").scene3D);
            var camera = new Laya.Camera();
            this._scene.addChild(camera);
            camera.clearFlag = Laya.CameraClearFlags.Sky;
            camera.transform.translate(new Laya.Vector3(3, 20, 47));
            camera.addComponent(CameraMoveScript);
            var directionLight = this._scene.addChild(new Laya.Sprite3D());
            var directionLightCom = directionLight.addComponent(Laya.DirectionLightCom);
            directionLightCom.color = new Laya.Color(1, 1, 1, 1);
            directionLight.transform.rotate(new Laya.Vector3(-3.14 / 3, 0, 0));
            var skyboxMaterial = Laya.Loader.getRes("res/threeDimen/scene/LayaScene_city01/Conventional/Assets/Sky.lmat");
            var skyRenderer = this._scene.skyRenderer;
            skyRenderer.mesh = Laya.SkyDome.instance;
            skyRenderer.material = skyboxMaterial;
            var earth1 = this._scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createSphere(5, 32, 32)));
            earth1.transform.translate(new Laya.Vector3(17, 20, 0));
            var earthMat = new Laya.BlinnPhongMaterial();
            earthMat.albedoTexture = Laya.Loader.getTexture2D("res/threeDimen/texture/earth.png");
            earthMat.albedoIntensity = 1;
            earth1.meshRenderer.material = earthMat;
            var mesh = Laya.Loader.getRes("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm");
            var layaMonkey = this._scene.addChild(new Laya.MeshSprite3D(mesh));
            var layaMonkeyTrans = layaMonkey.transform;
            var layaMonkeyScale = layaMonkeyTrans.localScale;
            var mat = new Laya.BlinnPhongMaterial();
            layaMonkey.meshRenderer.sharedMaterial = mat;
            layaMonkeyScale.setValue(4, 4, 4);
            layaMonkeyTrans.localScale = layaMonkeyScale;
            layaMonkeyTrans.rotation = new Laya.Quaternion(0.7071068, 0, 0, -0.7071067);
            layaMonkeyTrans.translate(new Laya.Vector3(5, 3, 13));
            var sp = Laya.Loader.createNodes("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh");
            var layaMonkey2 = this._scene.addChild(sp);
            var layaMonkey2Trans = layaMonkey2.transform;
            var layaMonkey2Scale = layaMonkey2Trans.localScale;
            layaMonkey2Scale.setValue(32, 32, 32);
            layaMonkey2Trans.localScale = layaMonkey2Scale;
            layaMonkey2Trans.translate(new Laya.Vector3(-10, 13, 0));
            this.pangzi = Laya.Loader.createNodes("res/threeDimen/skinModel/BoneLinkScene/PangZi.lh");
            this.pangzi = this._scene.addChild(this.pangzi);
            var pangziTrans = this.pangzi.transform;
            var pangziScale = pangziTrans.localScale;
            pangziScale.setValue(4, 4, 4);
            pangziTrans.localScale = pangziScale;
            pangziTrans.translate(new Laya.Vector3(-20, 13, 0));
        }
    }

    class EnvironmentalReflection {
        constructor() {
            this.rotation = new Laya.Vector3(0, 0.01, 0);
            this.scene = null;
            this.teapot = null;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = new Laya.Scene3D();
                Laya.Laya.stage.addChild(scene);
                scene.sceneReflectionProb.reflectionIntensity = 1.0;
                scene.sceneReflectionProb.ambientMode = Laya.AmbientMode.SphericalHarmonics;
                scene.ambientSH = new Float32Array([
                    0.12385793775320053, 0.10619205236434937, 0.08616825193166733, 0.04508036747574806, 0.045333947986364365, 0.033974453806877136, -0.06488952040672302, -0.040771741420030594, -0.017472300678491592,
                    -0.03556367754936218, -0.022215088829398155, -0.009243164211511612, -0.014421734027564526, -0.010046920739114285, -0.004614028614014387, -0.03045407310128212, -0.0210751760751009, -0.009959095157682896,
                    0.008590752258896828, 0.00588414678350091, 0.002829564269632101, 0.03831017017364502, 0.02638474479317665, 0.01317161601036787, 0.006225926335901022, 0.0029086272697895765, -0.00009956751455320045
                ]);
                var camera = scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.transform.translate(new Laya.Vector3(0, 2, 3));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                camera.addComponent(CameraMoveScript);
                camera.clearFlag = Laya.CameraClearFlags.Sky;
                Laya.Material.load("res/threeDimen/skyBox/DawnDusk/SkyBox.lmat", Laya.Handler.create(this, (mat) => {
                    var skyRenderer = scene.skyRenderer;
                    skyRenderer.mesh = Laya.SkyBox.instance;
                    skyRenderer.material = mat;
                    mat.exposure = 0.6 + 1;
                    Laya.Laya.loader.load("res/threeDimen/skyBox/DawnDusk/EnvironmentalReflection.ktx", Laya.Loader.TEXTURECUBE).then((res) => {
                        scene.ambientMode = Laya.AmbientMode.SphericalHarmonics;
                        scene.sceneReflectionProb.iblTex = res;
                    });
                }));
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                scene.addChild(directlightSprite);
                dircom.color = new Laya.Color(0.6, 0.6, 0.6, 1);
                Laya.Mesh.load("res/threeDimen/staticModel/teapot/teapot-Teapot001.lm", Laya.Handler.create(this, function (mesh) {
                    this.teapot = scene.addChild(new Laya.MeshSprite3D(mesh));
                    this.teapot.transform.position = new Laya.Vector3(0, 1.75, 2);
                    this.teapot.transform.rotate(new Laya.Vector3(-90, 0, 0), false, false);
                    var pbrMat = new Laya.PBRStandardMaterial();
                    pbrMat.metallic = 1;
                    pbrMat.smoothness = 1;
                    this.teapot.meshRenderer.material = pbrMat;
                }));
            });
        }
    }

    class LightmapScene {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                Laya.Scene3D.load("res/threeDimen/scene/ParticleScene/Scene.ls", Laya.Handler.create(this, function (sprite) {
                    var scene = Laya.Laya.stage.addChild(sprite);
                    var camera = scene.addChild(new Laya.Camera(0, 0.1, 100));
                    camera.transform.translate(new Laya.Vector3(2, 2.7, 3));
                    camera.transform.rotate(new Laya.Vector3(0, 43, 0), false, false);
                    camera.clearFlag = Laya.CameraClearFlags.SolidColor;
                    camera.clearColor = new Laya.Color(0, 0, 0, 1);
                    camera.addComponent(CameraMoveScript);
                }));
            });
        }
    }

    class SceneLoad1 {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Shader3D.debugMode = true;
                Laya.Scene3D.load("res/threeDimen/scene/LayaScene_dudeScene/Conventional/dudeScene.ls", Laya.Handler.create(this, function (scene) {
                    Laya.Laya.stage.addChild(scene);
                    var camera = scene.getChildByName("Camera");
                    camera.transform.position = new Laya.Vector3(0, 0.81, -1.85);
                    camera.transform.rotate(new Laya.Vector3(0, 0, 0), true, false);
                    camera.fieldOfView = 60;
                    camera.clearColor = new Laya.Color(0, 0, 0.6, 1);
                    camera.addComponent(CameraMoveScript);
                }));
            });
        }
    }

    class ScriptDemo {
        constructor() {
            this._translate = new Laya.Vector3(0, 3, 3);
            this._rotation = new Laya.Vector3(-30, 0, 0);
            this._rotation2 = new Laya.Vector3(0, 45, 0);
            this._forward = new Laya.Vector3(1, -1, 0);
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = (scene.addChild(new Laya.Camera(0, 0.1, 100)));
                camera.transform.translate(this._translate);
                camera.transform.rotate(this._rotation, true, false);
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                scene.addChild(directlightSprite);
                var lightColor = dircom.color;
                lightColor.setValue(0.6, 0.6, 0.6, 1);
                var mat = directlightSprite.transform.worldMatrix;
                mat.setForward(this._forward);
                directlightSprite.transform.worldMatrix = mat;
                var box = scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(1, 1, 1), "MOs"));
                box.transform.rotate(this._rotation2, false, false);
                var material = new Laya.PBRStandardMaterial();
                Laya.Texture2D.load("res/threeDimen/layabox.png", Laya.Handler.create(this, function (text) {
                    material.albedoTexture = text;
                    box.meshRenderer.material = material;
                    box.addComponent(BoxControlScript);
                }));
                Laya.Laya.timer.once(4000, this, this.onLoop, [box]);
            });
        }
        onLoop(box) {
            console.log("移除组件");
            var boxContro = box.getComponent(BoxControlScript);
            boxContro.destroy();
        }
    }
    class BoxControlScript extends Laya.Script3D {
        constructor() {
            super();
            this._albedoColor = new Laya.Color(1, 0, 0, 1);
            this._rotation = new Laya.Vector3(0, 0.5, 0);
        }
        onAwake() {
            this.box = this.owner;
        }
        onStart() {
            var material = this.box.meshRenderer.material;
            material.albedoColor = this._albedoColor;
        }
        onUpdate() {
            this.box.transform.rotate(this._rotation, false, false);
        }
        onDisable() {
            console.log("组件设置为不可用");
        }
    }

    var GlowingEdgeShaderFS = "#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了\r\n\tprecision highp float;\r\n\tprecision highp int;\r\n#else\r\n\tprecision mediump float;\r\n\tprecision mediump int;\r\n#endif\r\n#define SHADER_NAME EDGE_FS\r\n\r\n#include \"Lighting.glsl\";\r\n#include \"Camera.glsl\";\r\n// #include \"Color.glsl\";\r\n\r\n#include \"Scene.glsl\";\r\n// #include \"SceneFog.glsl\";\r\n#include \"globalIllumination.glsl\";\r\n// #include \"Camera.glsl\";\r\n// #include \"Lighting.glsl\";\r\n// #include \"BlinnPhongFrag.glsl\";\r\n\r\nvarying vec2 v_Texcoord;\r\nuniform sampler2D u_texture;\r\nuniform vec3 u_marginalColor;\r\n\r\nvarying vec3 v_Normal;\r\n\r\n// uniform DirectionLight u_SunLight;\r\nvarying vec3 v_PositionWorld;\r\n\r\nvoid main()\r\n{\r\n\tgl_FragColor=texture2D(u_texture, v_Texcoord);\r\n\tvec3 ambientCol = diffuseIrradiance(v_Normal);\r\n\tvec3 normal=normalize(v_Normal);\r\n\tvec3 toEyeDir = normalize(getViewDirection(v_PositionWorld));\r\n\tfloat Rim = 1.0 - max(0.0,dot(toEyeDir, normal));\r\n\tvec3 lightColor = ambientCol;\r\n\tvec3 Emissive = 2.0 * lightColor * u_marginalColor * pow(Rim,3.0);  \r\n\t\r\n\tgl_FragColor = texture2D(u_texture, v_Texcoord) + vec4(Emissive,1.0);\r\n}\r\n\r\n";

    var GlowingEdgeShaderVS = "#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了\r\n\tprecision highp float;\r\n\tprecision highp int;\r\n#else\r\n\tprecision mediump float;\r\n\tprecision mediump int;\r\n#endif\r\n\r\n#define SHADER_NAME EDGE_VS\r\n\r\n// #include \"Lighting.glsl\";\r\n#include \"VertexCommon.glsl\";\r\n#include \"Scene.glsl\";\r\n#include \"Camera.glsl\";\r\n#include \"Sprite3DVertex.glsl\";\r\nvarying vec2 v_Texcoord;\r\nvarying vec3 v_Normal;\r\nvarying vec3 v_PositionWorld;\r\n\r\nvoid main()\r\n{\r\n\tVertex vertex;\r\n\tgetVertexParams(vertex);\r\n\tv_Texcoord = vertex.texCoord0;\r\n\tmat4 worldMat = getWorldMatrix();\r\n\tvec3 positionWS = (worldMat * vec4(vertex.positionOS, 1.0)).xyz;\r\n\tv_PositionWorld = positionWS;\r\n\tv_Normal = normalize((worldMat * vec4(vertex.normalOS, 0.0))).xyz;\r\n\tgl_Position = getPositionCS(positionWS);\r\n\tgl_Position=remapPositionZ(gl_Position);\r\n}";

    class GlowingEdgeMaterial extends Laya.Material {
        __init__() {
            GlowingEdgeMaterial.DIFFUSETEXTURE = Laya.Shader3D.propertyNameToID("u_texture");
            GlowingEdgeMaterial.MARGINALCOLOR = Laya.Shader3D.propertyNameToID("u_marginalColor");
        }
        constructor() {
            super();
            this.isInit = false;
            if (!this.isInit) {
                this.__init__();
                this.isInit = true;
            }
            this.setShaderName("GlowingEdgeMaterial");
        }
        get diffuseTexture() {
            return this.getTextureByIndex(GlowingEdgeMaterial.DIFFUSETEXTURE);
        }
        set diffuseTexture(value) {
            this.setTextureByIndex(GlowingEdgeMaterial.DIFFUSETEXTURE, value);
        }
        set marginalColor(value) {
            this.setVector3ByIndex(GlowingEdgeMaterial.MARGINALCOLOR, value);
        }
    }

    class Shader_GlowingEdge {
        constructor() {
            this.rotation = new Laya.Vector3(0, 0.01, 0);
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.initShader();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = (scene.addChild(new Laya.Camera(0, 0.1, 1000)));
                camera.transform.translate(new Laya.Vector3(0, 0.85, 1.7));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                camera.addComponent(CameraMoveScript);
                var directionLight = new Laya.Sprite3D();
                var directionLightCom = directionLight.addComponent(Laya.DirectionLightCom);
                scene.addChild(directionLight);
                directionLightCom.color = new Laya.Color(1, 1, 1, 1);
                scene.ambientColor = new Laya.Color(1.0, 0.0, 0.0);
                Laya.Sprite3D.load("res/threeDimen/skinModel/dude/dude.lh", Laya.Handler.create(this, function (dude) {
                    scene.addChild(dude);
                    var glowingEdgeMaterial1 = new GlowingEdgeMaterial();
                    Laya.Texture2D.load("res/threeDimen/skinModel/dude/Assets/dude/head.png", Laya.Handler.create(this, function (tex) {
                        glowingEdgeMaterial1.diffuseTexture = tex;
                    }));
                    glowingEdgeMaterial1.marginalColor = new Laya.Vector3(1, 0.7, 0);
                    var glowingEdgeMaterial2 = new GlowingEdgeMaterial();
                    Laya.Texture2D.load("res/threeDimen/skinModel/dude/Assets/dude/jacket.png", Laya.Handler.create(this, function (tex) {
                        glowingEdgeMaterial2.diffuseTexture = tex;
                    }));
                    glowingEdgeMaterial2.marginalColor = new Laya.Vector3(1, 0.7, 0);
                    var glowingEdgeMaterial3 = new GlowingEdgeMaterial();
                    Laya.Texture2D.load("res/threeDimen/skinModel/dude/Assets/dude/pants.png", Laya.Handler.create(this, function (tex) {
                        glowingEdgeMaterial3.diffuseTexture = tex;
                    }));
                    glowingEdgeMaterial3.marginalColor = new Laya.Vector3(1, 0.7, 0);
                    var glowingEdgeMaterial4 = new GlowingEdgeMaterial();
                    Laya.Texture2D.load("res/threeDimen/skinModel/dude/Assets/dude/upBodyC.png", Laya.Handler.create(this, function (tex) {
                        glowingEdgeMaterial4.diffuseTexture = tex;
                    }));
                    glowingEdgeMaterial4.marginalColor = new Laya.Vector3(1, 0.7, 0);
                    var baseMaterials = [];
                    baseMaterials[0] = glowingEdgeMaterial1;
                    baseMaterials[1] = glowingEdgeMaterial2;
                    baseMaterials[2] = glowingEdgeMaterial3;
                    baseMaterials[3] = glowingEdgeMaterial4;
                    baseMaterials[4] = glowingEdgeMaterial4;
                    dude.getChildAt(0).getChildAt(0).getComponent(Laya.SkinnedMeshRenderer).materials = baseMaterials;
                    dude.transform.position = new Laya.Vector3(0, 0.5, 0);
                    dude.transform.setWorldLossyScale(new Laya.Vector3(0.2, 0.2, 0.2));
                    dude.transform.rotate(new Laya.Vector3(0, 180, 0), false, false);
                }));
                var earth = scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createSphere(0.5, 128, 128)));
                var glowingEdgeMaterial = new GlowingEdgeMaterial();
                Laya.Texture2D.load("res/threeDimen/texture/earth.png", Laya.Handler.create(this, function (tex) {
                    glowingEdgeMaterial.diffuseTexture = tex;
                }));
                glowingEdgeMaterial.marginalColor = new Laya.Vector3(0.0, 0.3, 1.0);
                earth.meshRenderer.sharedMaterial = glowingEdgeMaterial;
                Laya.Laya.timer.frameLoop(1, this, function () {
                    earth.transform.rotate(this.rotation, true);
                });
            });
        }
        initShader() {
            var glowingEdgeShader = Laya.Shader3D.add("GlowingEdgeMaterial", true, true);
            var subShader = new Laya.SubShader();
            glowingEdgeShader.addSubShader(subShader);
            subShader.addShaderPass(GlowingEdgeShaderVS, GlowingEdgeShaderFS);
        }
    }

    var OutlineFS = "#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了\r\nprecision highp float; \r\n#else \r\n    precision mediump float; \r\n#endif \r\n\r\n\r\nvoid main() \r\n{ \r\n    vec3 finalColor = u_OutlineColor.rgb * u_OutlineLightness; \r\n    gl_FragColor = vec4(finalColor,0.0); \r\n}";

    var OutlineVS = "#include \"Sprite3DVertex.glsl\";\r\n\r\n#include \"VertexCommon.glsl\";\r\n#include \"Camera.glsl\";\r\nvoid main()\r\n{\r\n\r\n    Vertex vertex;\r\n    getVertexParams(vertex);\r\n    vec4 position = vec4((vertex.positionOS) + (vertex.normalOS) * u_OutlineWidth, 1.0);\r\n\r\n    mat4 worldMat = getWorldMatrix();\r\n    vec3 positionWS = (worldMat * vec4(position)).xyz;\r\n    gl_Position = getPositionCS(positionWS);\r\n    gl_Position = remapPositionZ(gl_Position);\r\n}";

    var Outline02FS = "#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了\r\nprecision highp float;\r\n#else\r\nprecision mediump float;\r\n#endif\r\nvarying vec2 v_Texcoord0;\r\nvarying vec3 v_Normal;\r\n\r\n// uniform sampler2D u_AlbedoTexture;\r\n\r\n\r\nvoid main()\r\n{\r\n    vec4 albedoTextureColor = vec4(1.0);\r\n    \r\n    albedoTextureColor = texture2D(u_AlbedoTexture, v_Texcoord0);\r\n    gl_FragColor = albedoTextureColor;\r\n}";

    var Outline02VS = "#include \"Camera.glsl\";\r\n#include \"Sprite3DVertex.glsl\";\r\n\r\n#include \"VertexCommon.glsl\";\r\n\r\n// attribute vec4 a_Position; \r\n// attribute vec2 a_Texcoord0; \r\n\r\n// uniform mat4 u_MvpMatrix; \r\n\r\n\r\n// attribute vec3 a_Normal; \r\nvarying vec3 v_Normal; \r\nvarying vec2 v_Texcoord0; \r\n\r\nvoid main() \r\n{ \r\n\r\n    Vertex vertex;\r\n    getVertexParams(vertex);\r\n    mat4 worldMat = getWorldMatrix();\r\n    vec3 positionWS = (worldMat * vec4(vertex.positionOS, 1.0)).xyz;\r\n\r\n    gl_Position = getPositionCS(positionWS);\r\n\r\n    v_Normal = normalize((worldMat * vec4(vertex.normalOS, 0.0)).xyz);\r\n    v_Texcoord0 = vertex.texCoord0; \r\n    gl_Position=remapPositionZ(gl_Position); \r\n}";

    class MultiplePassOutlineMaterial extends Laya.Material {
        static __init__() {
            MultiplePassOutlineMaterial.ALBEDOTEXTURE = Laya.Shader3D.propertyNameToID("u_AlbedoTexture");
            MultiplePassOutlineMaterial.OUTLINECOLOR = Laya.Shader3D.propertyNameToID("u_OutlineColor");
            MultiplePassOutlineMaterial.OUTLINEWIDTH = Laya.Shader3D.propertyNameToID("u_OutlineWidth");
            MultiplePassOutlineMaterial.OUTLINELIGHTNESS = Laya.Shader3D.propertyNameToID("u_OutlineLightness");
        }
        get albedoTexture() {
            return this.getTextureByIndex(MultiplePassOutlineMaterial.ALBEDOTEXTURE);
        }
        set albedoTexture(value) {
            this.setTextureByIndex(MultiplePassOutlineMaterial.ALBEDOTEXTURE, value);
        }
        get outlineColor() {
            return this.getColorByIndex(MultiplePassOutlineMaterial.OUTLINECOLOR);
        }
        set outlineColor(value) {
            this.setColorByIndex(MultiplePassOutlineMaterial.OUTLINECOLOR, value);
        }
        get outlineWidth() {
            return this.getFloatByIndex(MultiplePassOutlineMaterial.OUTLINEWIDTH);
        }
        set outlineWidth(value) {
            value = Math.max(0.0, Math.min(0.05, value));
            this.setFloatByIndex(MultiplePassOutlineMaterial.OUTLINEWIDTH, value);
        }
        get outlineLightness() {
            return this.getFloatByIndex(MultiplePassOutlineMaterial.OUTLINELIGHTNESS);
        }
        set outlineLightness(value) {
            value = Math.max(0.0, Math.min(1.0, value));
            this.setFloatByIndex(MultiplePassOutlineMaterial.OUTLINELIGHTNESS, value);
        }
        static initShader() {
            MultiplePassOutlineMaterial.__init__();
            var uniformMap = {
                'u_OutlineLightness': Laya.ShaderDataType.Float,
                'u_OutlineColor': Laya.ShaderDataType.Color,
                'u_AlbedoTexture': Laya.ShaderDataType.Texture2D,
                'u_OutlineWidth': Laya.ShaderDataType.Float
            };
            var customShader = Laya.Shader3D.add("MultiplePassOutlineShader");
            var subShader = new Laya.SubShader(Laya.SubShader.DefaultAttributeMap, uniformMap);
            customShader.addSubShader(subShader);
            var pass1 = subShader.addShaderPass(OutlineVS, OutlineFS);
            pass1.renderState.cull = Laya.RenderState.CULL_FRONT;
            pass1.statefirst = true;
            subShader.addShaderPass(Outline02VS, Outline02FS);
        }
        constructor() {
            super();
            this.setShaderName("MultiplePassOutlineShader");
            this.setFloatByIndex(MultiplePassOutlineMaterial.OUTLINEWIDTH, 0.01581197);
            this.setFloatByIndex(MultiplePassOutlineMaterial.OUTLINELIGHTNESS, 1);
            this.setColorByIndex(MultiplePassOutlineMaterial.OUTLINECOLOR, new Laya.Color(1.0, 1.0, 1.0, 0.0));
        }
    }

    class Shader_MultiplePassOutline {
        constructor() {
            this.rotation = new Laya.Vector3(0, 0.01, 0);
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                MultiplePassOutlineMaterial.initShader();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = (scene.addChild(new Laya.Camera(0, 0.1, 1000)));
                camera.transform.translate(new Laya.Vector3(0, 0.85, 1.7));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                camera.addComponent(CameraMoveScript);
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                scene.addChild(directlightSprite);
                dircom.color = new Laya.Color(1, 1, 1, 1);
                Laya.Mesh.load("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm", Laya.Handler.create(this, function (mesh) {
                    var layaMonkey = scene.addChild(new Laya.MeshSprite3D(mesh));
                    layaMonkey.transform.localScale = new Laya.Vector3(0.3, 0.3, 0.3);
                    layaMonkey.transform.rotation = new Laya.Quaternion(0.7071068, 0, 0, -0.7071067);
                    var customMaterial = new MultiplePassOutlineMaterial();
                    Laya.Texture2D.load("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/diffuse.png", Laya.Handler.create(this, function (texture) {
                        customMaterial.albedoTexture = texture;
                    }));
                    layaMonkey.meshRenderer.sharedMaterial = customMaterial;
                    Laya.Laya.timer.frameLoop(1, this, function () {
                        layaMonkey.transform.rotate(this.rotation, false);
                    });
                }));
            });
        }
    }

    class CustomMaterial extends Laya.Material {
        constructor() {
            super();
            this.setShaderName("CustomShader");
            this.materialRenderMode = Laya.MaterialRenderMode.RENDERMODE_OPAQUE;
        }
    }

    var SimpleShaderFS = "#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了\r\nprecision highp float;\r\n#else\r\nprecision mediump float;\r\n#endif\r\n\r\nvarying vec3 v_Normal;\r\n\r\nvoid main()\r\n{\t\r\n  gl_FragColor=vec4(v_Normal, 1.0);\r\n}\r\n\r\n";

    var SimpleShaderVS = "#include \"Camera.glsl\";\r\n#include \"Sprite3DVertex.glsl\";\r\n#include \"VertexCommon.glsl\";\r\n\r\nvarying vec3 v_Normal;\r\n\r\nvoid main()\r\n{\r\n\tVertex vertex;\r\n    getVertexParams(vertex);\r\n  \tmat4 worldMat = getWorldMatrix();\r\n    vec3 positionWS = (worldMat * vec4(vertex.positionOS, 1.0)).xyz;\r\n\r\n    gl_Position = getPositionCS(positionWS);\r\n\t  \r\n\tvec3 normalWS = normalize((worldMat * vec4(vertex.normalOS, 0.0)).xyz);\r\n    v_Normal = normalWS;\r\n\tgl_Position=remapPositionZ(gl_Position);\r\n}";

    class Shader_Simple {
        constructor() {
            this.rotation = new Laya.Vector3(0, 0.01, 0);
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.initShader();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = (scene.addChild(new Laya.Camera(0, 0.1, 100)));
                camera.transform.translate(new Laya.Vector3(0, 0.5, 1.5));
                camera.addComponent(CameraMoveScript);
                camera.clearColor = new Laya.Color(0.207, 0.269, 0.383, 1.0);
                Laya.Mesh.load("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm", Laya.Handler.create(this, function (mesh) {
                    var layaMonkey = scene.addChild(new Laya.MeshSprite3D(mesh));
                    layaMonkey.transform.localScale = new Laya.Vector3(0.3, 0.3, 0.3);
                    layaMonkey.transform.rotation = new Laya.Quaternion(0.7071068, 0, 0, -0.7071067);
                    var customMaterial = new CustomMaterial();
                    layaMonkey.meshRenderer.sharedMaterial = customMaterial;
                    Laya.Laya.timer.frameLoop(1, this, function () {
                        layaMonkey.transform.rotate(this.rotation, false);
                    });
                }));
            });
        }
        initShader() {
            var customShader = Laya.Shader3D.add("CustomShader");
            var subShader = new Laya.SubShader();
            customShader.addSubShader(subShader);
            subShader.addShaderPass(SimpleShaderVS, SimpleShaderFS);
        }
    }

    class Sky_Procedural {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var skyRenderer = scene.skyRenderer;
                skyRenderer.mesh = Laya.SkyDome.instance;
                skyRenderer.material = new Laya.SkyProceduralMaterial();
                var camera = scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.addComponent(CameraMoveScript);
                camera.clearFlag = Laya.CameraClearFlags.Sky;
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                scene.addChild(directlightSprite);
                var mat = directlightSprite.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(0, -1, 0));
                directlightSprite.transform.worldMatrix = mat;
                var rotation = new Laya.Vector3(-0.01, 0, 0);
                Laya.Laya.timer.frameLoop(1, this, function () {
                    directlightSprite.transform.rotate(rotation);
                });
            });
        }
    }

    class Sky_SkyBox {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.transform.rotate(new Laya.Vector3(10, 0, 0), true, false);
                camera.addComponent(CameraMoveScript);
                camera.clearFlag = Laya.CameraClearFlags.Sky;
                this.camerad = camera;
                Laya.Material.load("res/threeDimen/skyBox/DawnDusk/SkyBox.lmat", Laya.Handler.create(this, function (mat) {
                    var skyRenderer = camera.scene.skyRenderer;
                    skyRenderer.mesh = Laya.SkyDome.instance;
                    var exposureNumber = 1.0;
                    mat.exposure = exposureNumber;
                    skyRenderer.material = mat;
                }));
            });
        }
    }

    class PixelLineSprite3DDemo {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.transform.translate(new Laya.Vector3(0, 2, 5));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                camera.addComponent(CameraMoveScript);
                camera.clearColor = new Laya.Color(0.2, 0.2, 0.2, 1.0);
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                scene.addChild(directlightSprite);
                var mat = directlightSprite.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(-1.0, -1.0, -1.0));
                directlightSprite.transform.worldMatrix = mat;
                this.sprite3D = scene.addChild(new Laya.Sprite3D());
                this.lineSprite3D = scene.addChild(new Laya.Sprite3D());
                var sphere = this.sprite3D.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createSphere(0.25, 20, 20)));
                sphere.transform.position = new Laya.Vector3(0.0, 0.75, 2);
                var sphereLineSprite3D = this.lineSprite3D.addChild(new Laya.PixelLineSprite3D(3500));
                Tool.linearModel(sphere, sphereLineSprite3D, Laya.Color.GREEN);
                this.sprite3D.active = false;
                ;
                this.lineSprite3D.active = true;
            });
        }
    }

    class SkinnedMeshSprite3DDemo {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = this.scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.transform.translate(new Laya.Vector3(0, 0.5, 1));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                camera.addComponent(CameraMoveScript);
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                this.scene.addChild(directlightSprite);
                dircom.color = new Laya.Color(1, 1, 1, 1);
                directlightSprite.transform.rotate(new Laya.Vector3(-3.14 / 3, 0, 0));
                Laya.Laya.loader.load("res/threeDimen/skinModel/dude/dude.lh", Laya.Handler.create(this, this.onComplete));
            });
        }
        onComplete() {
            var dude = this.scene.addChild(Laya.Loader.createNodes("res/threeDimen/skinModel/dude/dude.lh"));
            var scale = new Laya.Vector3(0.1, 0.1, 0.1);
            dude.transform.localScale = scale;
            dude.transform.rotate(new Laya.Vector3(0, 3.14, 0));
        }
    }

    class Sprite3DClone {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                this.scene.ambientColor = new Laya.Color(1, 1, 1);
                var camera = this.scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.transform.translate(new Laya.Vector3(0, 0.5, 1));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                Laya.Laya.loader.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Laya.Handler.create(this, this.onComplete));
            });
        }
        onComplete() {
            var layaMonkey = this.scene.addChild(Laya.Loader.createNodes("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh"));
            var layaMonkey_clone1 = Laya.Sprite3D.instantiate(layaMonkey, this.scene, false, new Laya.Vector3(0.6, 0, 0));
            var layaMonkey_clone2 = this.scene.addChild(Laya.Sprite3D.instantiate(layaMonkey, null, false, new Laya.Vector3(-0.6, 0, 0)));
        }
    }

    class Sprite3DLoad {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                scene.ambientColor = new Laya.Color(1, 1, 1);
                var camera = scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.transform.translate(new Laya.Vector3(0, 0.5, 1));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 2), true, false);
                camera.addComponent(CameraMoveScript);
                Laya.Sprite3D.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Laya.Handler.create(null, function (sprite) {
                    scene.addChild(sprite);
                }));
            });
        }
    }

    class Sprite3DParent {
        constructor() {
            this.stype = 0;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = this.scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.transform.translate(new Laya.Vector3(0, 0.75, 1));
                camera.transform.rotate(new Laya.Vector3(-30, 0, 0), true, false);
                camera.addComponent(CameraMoveScript);
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                this.scene.addChild(directlightSprite);
                dircom.color = new Laya.Color(1, 1, 1, 1);
                directlightSprite.transform.rotate(new Laya.Vector3(-3.14 / 3, 0, 0));
                var resource = ["res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh"];
                Laya.Laya.loader.load(resource, Laya.Handler.create(this, this.onPreLoadFinish));
            });
        }
        onPreLoadFinish() {
            this.layaMonkeyParent = this.scene.addChild(Laya.Loader.createNodes("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh"));
            this.layaMonkeySon = this.layaMonkeyParent.clone();
            this.layaMonkeySon.transform.translate(new Laya.Vector3(0.5, 0, 0));
            var scale = new Laya.Vector3(0.5, 0.5, 0.5);
            this.layaMonkeySon.transform.localScale = scale;
            this.layaMonkeyParent.addChild(this.layaMonkeySon);
            this.loadUI();
        }
        loadUI() {
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, () => {
                this.changeActionButton = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "移动父级猴子"));
                this.changeActionButton.size(160, 30);
                this.changeActionButton.labelBold = true;
                this.changeActionButton.labelSize = 20;
                this.changeActionButton.sizeGrid = "4,4,4,4";
                this.changeActionButton.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.changeActionButton.pos(100, 120);
                this.changeActionButton.on(Laya.Event.CLICK, this, this.stypeFun0);
                this.changeActionButton1 = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "放大父级猴子"));
                this.changeActionButton1.size(160, 30);
                this.changeActionButton1.labelBold = true;
                this.changeActionButton1.labelSize = 20;
                this.changeActionButton1.sizeGrid = "4,4,4,4";
                this.changeActionButton1.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.changeActionButton1.pos(100, 160);
                this.changeActionButton1.on(Laya.Event.CLICK, this, this.stypeFun1);
                this.changeActionButton2 = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "旋转父级猴子"));
                this.changeActionButton2.size(160, 30);
                this.changeActionButton2.labelBold = true;
                this.changeActionButton2.labelSize = 20;
                this.changeActionButton2.sizeGrid = "4,4,4,4";
                this.changeActionButton2.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.changeActionButton2.pos(100, 200);
                this.changeActionButton2.on(Laya.Event.CLICK, this, this.stypeFun2);
                this.changeActionButton3 = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "移动子级猴子"));
                this.changeActionButton3.size(160, 30);
                this.changeActionButton3.labelBold = true;
                this.changeActionButton3.labelSize = 20;
                this.changeActionButton3.sizeGrid = "4,4,4,4";
                this.changeActionButton3.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.changeActionButton3.pos(100, 250);
                this.changeActionButton3.on(Laya.Event.CLICK, this, this.stypeFun3);
                this.changeActionButton4 = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "放大子级猴子"));
                this.changeActionButton4.size(160, 30);
                this.changeActionButton4.labelBold = true;
                this.changeActionButton4.labelSize = 20;
                this.changeActionButton4.sizeGrid = "4,4,4,4";
                this.changeActionButton4.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.changeActionButton4.pos(100, 290);
                this.changeActionButton4.on(Laya.Event.CLICK, this, this.stypeFun4);
                this.changeActionButton5 = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "旋转子级猴子"));
                this.changeActionButton5.size(160, 30);
                this.changeActionButton5.labelBold = true;
                this.changeActionButton5.labelSize = 20;
                this.changeActionButton5.sizeGrid = "4,4,4,4";
                this.changeActionButton5.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.changeActionButton5.pos(100, 330);
                this.changeActionButton5.on(Laya.Event.CLICK, this, this.stypeFun5);
            }));
        }
        stypeFun0() {
            this.layaMonkeyParent.transform.translate(new Laya.Vector3(-0.1, 0, 0));
            Client.instance.send({ type: "next", btype: this.btype, stype: 0 });
        }
        stypeFun1() {
            var scale = new Laya.Vector3(2, 2, 2);
            this.layaMonkeyParent.transform.localScale = scale;
            Client.instance.send({ type: "next", btype: this.btype, stype: 1 });
        }
        stypeFun2() {
            this.layaMonkeyParent.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
            Client.instance.send({ type: "next", btype: this.btype, stype: 2 });
        }
        stypeFun3() {
            this.layaMonkeySon.transform.translate(new Laya.Vector3(-0.1, 0, 0));
            Client.instance.send({ type: "next", btype: this.btype, stype: 3 });
        }
        stypeFun4() {
            var scale = new Laya.Vector3(1, 1, 1);
            this.layaMonkeySon.transform.localScale = scale;
            Client.instance.send({ type: "next", btype: this.btype, stype: 4 });
        }
        stypeFun5() {
            this.layaMonkeySon.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
            Client.instance.send({ type: "next", btype: this.btype, stype: 5 });
        }
    }

    class TransformDemo {
        constructor() {
            this._position = new Laya.Vector3(0, 0, 0);
            this._position1 = new Laya.Vector3(0, 0, 0);
            this._rotate = new Laya.Vector3(0, 1, 0);
            this._rotate1 = new Laya.Vector3(0, 0, 0);
            this._scale = new Laya.Vector3();
            this.scaleDelta = 0;
            this.scaleValue = 0;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this._scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = (this._scene.addChild(new Laya.Camera(0, 0.1, 100)));
                camera.transform.translate(new Laya.Vector3(0, 2.0, 5));
                camera.transform.rotate(new Laya.Vector3(-30, 0, 0), true, false);
                camera.addComponent(CameraMoveScript);
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                this._scene.addChild(directlightSprite);
                dircom.color = new Laya.Color(1, 1, 1, 1);
                directlightSprite.transform.rotate(new Laya.Vector3(-3.14 / 3, 0, 0));
                Laya.Laya.loader.load(["res/threeDimen/staticModel/grid/plane.lh", "res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh"], Laya.Handler.create(this, this.onComplete));
            });
        }
        onComplete() {
            var grid = this._scene.addChild(Laya.Loader.createNodes("res/threeDimen/staticModel/grid/plane.lh"));
            var staticLayaMonkey = Laya.Loader.createNodes("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh");
            var staticMonkeyTransform = staticLayaMonkey.transform;
            var staticMonkeyScale = staticMonkeyTransform.localScale;
            staticMonkeyScale.setValue(1.5, 1.5, 1.5);
            staticMonkeyTransform.localScale = staticMonkeyScale;
            this.layaMonkey_clone1 = Laya.Sprite3D.instantiate(staticLayaMonkey, this._scene, false, this._position1);
            this.layaMonkey_clone2 = Laya.Sprite3D.instantiate(staticLayaMonkey, this._scene, false, this._position1);
            this.layaMonkey_clone3 = Laya.Sprite3D.instantiate(staticLayaMonkey, this._scene, false, this._position1);
            this.clone1Transform = this.layaMonkey_clone1.transform;
            this.clone2Transform = this.layaMonkey_clone2.transform;
            this.clone3Transform = this.layaMonkey_clone3.transform;
            this._position1.setValue(0.0, 0, 0.0);
            this.clone1Transform.translate(this._position1);
            this._position1.setValue(-1.5, 0, 0.0);
            this.clone2Transform.translate(this._position1);
            this._position1.setValue(1.0, 0, 0.0);
            this.clone3Transform.translate(this._position1);
            this._rotate1.setValue(0, 60, 0);
            this.clone2Transform.rotate(this._rotate1, false, false);
            var scale = this.clone3Transform.localScale;
            scale.setValue(1.2, 1.2, 1.2);
            this.layaMonkey_clone3.transform.localScale = scale;
            staticLayaMonkey.destroy();
            Laya.Laya.timer.frameLoop(1, this, this.animate);
        }
        animate() {
            this.scaleValue = Math.sin(this.scaleDelta += 0.1);
            this._position.y = Math.max(0, this.scaleValue / 2);
            this.clone1Transform.position = this._position;
            this.clone2Transform.rotate(this._rotate, false, false);
            this._scale.x = this._scale.y = this._scale.z = Math.abs(this.scaleValue);
            this.clone3Transform.localScale = this._scale;
        }
    }

    class TextureDemo {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.transform.translate(new Laya.Vector3(0, 2, 5));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                camera.addComponent(CameraMoveScript);
                camera.clearColor = new Laya.Color(0.2, 0.2, 0.2, 1.0);
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                scene.addChild(directlightSprite);
                var mat = directlightSprite.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(-1.0, -1.0, -1.0));
                directlightSprite.transform.worldMatrix = mat;
                this.sprite3D = scene.addChild(new Laya.Sprite3D());
                var box = this.sprite3D.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(0.5, 0.5, 0.5)));
                box.transform.position = new Laya.Vector3(0.0, 1.0, 2.5);
                box.transform.rotate(new Laya.Vector3(0, 0, 0), false, false);
                var mat1 = new Laya.BlinnPhongMaterial();
            });
        }
    }

    class TextureGPUCompression {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Scene3D.load("res/CompressTexture/scene.ls", Laya.Handler.create(this, (scene) => {
                    Laya.Laya.stage.addChild(scene);
                }));
            });
        }
    }

    class TrailDemo {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                Laya.Scene3D.load("res/threeDimen/TrailTest/Trail.ls", Laya.Handler.create(this, function (scene) {
                    Laya.Laya.stage.addChild(scene);
                    var camera = scene.getChildByName("Main Camera");
                    camera.addComponent(CameraMoveScript);
                    let directlightSprite = new Laya.Sprite3D();
                    let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                    scene.addChild(directlightSprite);
                    dircom.color = new Laya.Color(1, 1, 1, 1);
                    directlightSprite.transform.rotate(new Laya.Vector3(-Math.PI / 3, 0, 0));
                }));
            });
        }
    }

    class TrailRender {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = (scene.addChild(new Laya.Camera(0, 0.1, 1000)));
                camera.transform.translate(new Laya.Vector3(0, 8, 10));
                camera.transform.rotate(new Laya.Vector3(-45, 0, 0), true, false);
                camera.clearFlag = Laya.CameraClearFlags.Sky;
                camera.addComponent(CameraMoveScript);
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                scene.addChild(directlightSprite);
                dircom.color = new Laya.Color(1, 1, 1, 1);
                directlightSprite.transform.rotate(new Laya.Vector3(-Math.PI / 3, 0, 0));
                Laya.Sprite3D.load("res/threeDimen/staticModel/grid/plane.lh", Laya.Handler.create(this, function (plane) {
                    scene.addChild(plane);
                }));
                Laya.Sprite3D.load("res/threeDimen/trail/Cube.lh", Laya.Handler.create(this, function (sprite) {
                    scene.addChild(sprite);
                }));
            });
        }
    }

    class PostProcessBloom {
        constructor() {
            this.camera = null;
            this.btype = "PostProcessBloom";
            this.stype = 0;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Scene3D.load("res/threeDimen/scene/LayaScene_BloomScene/Conventional/BloomScene.ls", Laya.Handler.create(this, function (scene) {
                    Laya.Laya.stage.addChild(scene);
                    this.camera = scene.getChildByName("Main Camera");
                    this.camera.addComponent(CameraMoveScript);
                    var postProcess = new Laya.PostProcess();
                    var bloom = new Laya.BloomEffect();
                    postProcess.addEffect(bloom);
                    this.camera.postProcess = postProcess;
                    this.camera.enableHDR = true;
                    bloom.intensity = 5;
                    bloom.threshold = 0.9;
                    bloom.softKnee = 0.5;
                    bloom.clamp = 65472;
                    bloom.diffusion = 5;
                    bloom.anamorphicRatio = 0.0;
                    bloom.color = new Laya.Color(1, 1, 1, 1);
                    bloom.fastMode = true;
                    Laya.Texture2D.load("res/threeDimen/scene/LayaScene_BloomScene/Conventional/Assets/LensDirt01.png", Laya.Handler.create(null, function (tex) {
                        bloom.dirtTexture = tex;
                        bloom.dirtIntensity = 2.0;
                    }));
                    this.loadUI();
                }));
            });
        }
        loadUI() {
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, function () {
                this.button = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "关闭HDR"));
                this.button.size(200, 40);
                this.button.labelBold = true;
                this.button.labelSize = 30;
                this.button.sizeGrid = "4,4,4,4";
                this.button.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.button.pos(Laya.Laya.stage.width / 2 - this.button.width * Laya.Browser.pixelRatio / 2, Laya.Laya.stage.height - 60 * Laya.Browser.pixelRatio);
                this.button.on(Laya.Event.CLICK, this, this.stypeFun0);
            }));
        }
        stypeFun0(label = "关闭HDR") {
            var enableHDR = this.camera.enableHDR;
            if (enableHDR) {
                this.button.label = "开启HDR";
            }
            else {
                this.button.label = "关闭HDR";
            }
            this.camera.enableHDR = !enableHDR;
            label = this.button.label;
            Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: label });
        }
    }

    class LightMoveScript extends Laya.Script {
        constructor() {
            super(...arguments);
            this.forward = new Laya.Vector3();
            this.lights = [];
            this.offsets = [];
            this.moveRanges = [];
        }
        onUpdate() {
            var seed = Laya.Laya.timer.currTimer * 0.002;
            for (var i = 0, n = this.lights.length; i < n; i++) {
                var transform = this.lights[i].transform;
                var pos = transform.localPosition;
                var off = this.offsets[i];
                var ran = this.moveRanges[i];
                pos.x = off.x + Math.sin(seed) * ran.x;
                pos.y = off.y + Math.sin(seed) * ran.y;
                pos.z = off.z + Math.sin(seed) * ran.z;
                transform.localPosition = pos;
            }
        }
    }
    class MultiLight {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                Laya.Scene3D.load("res/threeDimen/scene/MultiLightScene/InventoryScene_Forest.ls", Laya.Handler.create(this, function (scene) {
                    Laya.Laya.stage.addChild(scene);
                    var camera = scene.getChildByName("Main Camera");
                    camera.addComponent(CameraMoveScript);
                    camera.transform.localPosition = new Laya.Vector3(8.937199060699333, 61.364798067809126, -66.77836086472654);
                    var moveScript = camera.addComponent(LightMoveScript);
                    var moverLights = moveScript.lights;
                    var offsets = moveScript.offsets;
                    var moveRanges = moveScript.moveRanges;
                    moverLights.length = 15;
                    for (var i = 0; i < 15; i++) {
                        let pointlightSprite = new Laya.Sprite3D();
                        let pointcom = pointlightSprite.addComponent(Laya.PointLightCom);
                        scene.addChild(pointlightSprite);
                        pointcom.range = 2.0 + Math.random() * 8.0;
                        pointcom.color.setValue(Math.random(), Math.random(), Math.random(), 1);
                        pointcom.intensity = 6.0 + Math.random() * 8;
                        moverLights[i] = pointlightSprite;
                        offsets[i] = new Laya.Vector3((Math.random() - 0.5) * 10, pointcom.range * 0.75, (Math.random() - 0.5) * 10);
                        moveRanges[i] = new Laya.Vector3((Math.random() - 0.5) * 40, 0, (Math.random() - 0.5) * 40);
                    }
                    let spotLight = new Laya.Sprite3D();
                    let spotCom = spotLight.addComponent(Laya.SpotLightCom);
                    scene.addChild(spotLight);
                    spotLight.transform.localPosition = new Laya.Vector3(0.0, 9.0, -35.0);
                    spotLight.transform.localRotationEuler = new Laya.Vector3(-15.0, 180.0, 0.0);
                    spotCom.color.setValue(Math.random(), Math.random(), Math.random(), 1);
                    spotCom.range = 50;
                    spotCom.intensity = 15;
                    spotCom.spotAngle = 60;
                }));
            });
        }
    }

    class PBRMaterialDemo {
        constructor() {
            Laya.Shader3D.debugMode = true;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Scene3D.load("res/threeDimen/scene/LayaScene_EmptyScene/Conventional/EmptyScene.ls", Laya.Handler.create(this, (scene) => {
                    Laya.Laya.stage.addChild(scene);
                    var camera = scene.getChildByName("Main Camera");
                    var moveScript = camera.addComponent(CameraMoveScript);
                    moveScript.speed = 0.005;
                    var sphereMesh = Laya.PrimitiveMesh.createSphere(0.25, 32, 32);
                    const row = 6;
                    this.addSpheresSpecialMetallic(sphereMesh, new Laya.Vector3(0, 1.5, 0), scene, row, new Laya.Color(186 / 255, 110 / 255, 64 / 255, 1.0), 1.0);
                    this.addSpheresSmoothnessMetallic(sphereMesh, new Laya.Vector3(0, 0, 0), scene, 3, row, new Laya.Color(1.0, 1.0, 1.0, 1.0));
                    this.addSpheresSpecialMetallic(sphereMesh, new Laya.Vector3(0, -1.5, 0), scene, row, new Laya.Color(0.0, 0.0, 0.0, 1.0), 0.0);
                }));
            });
        }
        addPBRSphere(sphereMesh, position, scene, color, smoothness, metallic) {
            var mat = new Laya.PBRStandardMaterial();
            mat.albedoColor = color;
            mat.smoothness = smoothness;
            mat.metallic = metallic;
            var meshSprite = new Laya.MeshSprite3D(sphereMesh);
            meshSprite.meshRenderer.sharedMaterial = mat;
            var transform = meshSprite.transform;
            transform.localPosition = position;
            scene.addChild(meshSprite);
            return mat;
        }
        addSpheresSmoothnessMetallic(sphereMesh, offset, scene, row, col, color) {
            const width = col * 0.5;
            const height = row * 0.5;
            for (var i = 0, n = col; i < n; i++) {
                for (var j = 0, m = row; j < m; j++) {
                    var smoothness = i / (n - 1);
                    var metallic = 1.0 - j / (m - 1);
                    var pos = PBRMaterialDemo._tempPos;
                    pos.setValue(-width / 2 + i * width / (n - 1), height / 2 - j * height / (m - 1), 3.0);
                    Laya.Vector3.add(offset, pos, pos);
                    this.addPBRSphere(sphereMesh, pos, scene, color, smoothness, metallic);
                }
            }
        }
        addSpheresSpecialMetallic(sphereMesh, offset, scene, col, color, metallic = 0) {
            const width = col * 0.5;
            for (var i = 0, n = col; i < n; i++) {
                var smoothness = i / (n - 1);
                var pos = PBRMaterialDemo._tempPos;
                pos.setValue(-width / 2 + i * width / (n - 1), 0, 3.0);
                Laya.Vector3.add(offset, pos, pos);
                this.addPBRSphere(sphereMesh, pos, scene, color, smoothness, metallic);
            }
        }
    }
    PBRMaterialDemo._tempPos = new Laya.Vector3();

    class RotationScript$1 extends Laya.Script {
        constructor() {
            super();
            this._mouseDown = false;
            this._rotate = new Laya.Vector3();
            this._autoRotateSpeed = new Laya.Vector3(0, 0.25, 0);
            Laya.Laya.stage.on(Laya.Event.MOUSE_DOWN, this, function () {
                this._mouseDown = true;
                this._lastMouseX = Laya.Laya.stage.mouseX;
            });
            Laya.Laya.stage.on(Laya.Event.MOUSE_UP, this, function () {
                this._mouseDown = false;
            });
        }
        onUpdate() {
            if (this._mouseDown) {
                var deltaX = Laya.Laya.stage.mouseX - this._lastMouseX;
                this._rotate.y = deltaX * 0.2;
                this.model.transform.rotate(this._rotate, false, false);
                this._lastMouseX = Laya.Laya.stage.mouseX;
            }
            else {
                this.model.transform.rotate(this._autoRotateSpeed, false, false);
            }
        }
    }
    class DamagedHelmetModelShow {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Scene3D.load("res/threeDimen/LayaScene_DamagedHelmetScene/Conventional/Assets/DamagedHelmetScene.ls", Laya.Handler.create(this, function (scene) {
                    Laya.Laya.stage.addChild(scene);
                    var damagedHelmet = scene.getChildAt(2).getChildAt(0);
                    var rotationScript = damagedHelmet.addComponent(RotationScript$1);
                    rotationScript.model = damagedHelmet;
                    var size = 20;
                    this.addText(size, size * 4, "Drag the screen to rotate the model.", "#F09900");
                    size = 10;
                    this.addText(size, Laya.Laya.stage.height - size * 4, "Battle Damaged Sci-fi Helmet by theblueturtle_    www.leonardocarrion.com", "#FFFF00");
                }));
            });
        }
        addText(size, y, text, color) {
            var cerberusText = new Laya.Text();
            cerberusText.color = color;
            cerberusText.fontSize = size * Laya.Browser.pixelRatio;
            cerberusText.x = size;
            cerberusText.y = y;
            cerberusText.text = text;
            Laya.Laya.stage.addChild(cerberusText);
        }
    }

    class RotationScript extends Laya.Script {
        constructor() {
            super();
            this._mouseDown = false;
            this._rotate = new Laya.Vector3();
            Laya.Laya.stage.on(Laya.Event.MOUSE_DOWN, this, function () {
                this._mouseDown = true;
                this._lastMouseX = Laya.Laya.stage.mouseX;
            });
            Laya.Laya.stage.on(Laya.Event.MOUSE_UP, this, function () {
                this._mouseDown = false;
            });
        }
        onUpdate() {
            if (this._mouseDown) {
                var deltaX = Laya.Laya.stage.mouseX - this._lastMouseX;
                this._rotate.y = deltaX * 0.2;
                this.model.transform.rotate(this._rotate, false, false);
                this._lastMouseX = Laya.Laya.stage.mouseX;
            }
        }
    }
    class CerberusModelShow {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Scene3D.load("res/threeDimen/scene/LayaScene_CerberusScene/Conventional/CerberusScene.ls", Laya.Handler.create(this, function (scene) {
                    Laya.Laya.stage.addChild(scene);
                    scene.ambientMode = Laya.AmbientMode.SphericalHarmonics;
                    var model = scene.getChildByName("Cerberus_LP");
                    var rotationScript = model.addComponent(RotationScript);
                    rotationScript.model = model;
                    var size = 20;
                    this.addText(size, size * 4, "Drag the screen to rotate the model.", "#F09900");
                    size = 10;
                    this.addText(size, Laya.Laya.stage.height - size * 4, "Cerberus by Andrew Maximov     http://artisaverb.info/PBT.html", "#FFFF00");
                }));
            });
        }
        addText(size, y, text, color) {
            var cerberusText = new Laya.Text();
            cerberusText.color = color;
            cerberusText.fontSize = size * Laya.Browser.pixelRatio;
            cerberusText.x = size;
            cerberusText.y = y;
            cerberusText.text = text;
            Laya.Laya.stage.addChild(cerberusText);
        }
    }

    class PhysicsWorld_ConstraintFixedJoint {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                this.camera = this.scene.addChild(new Laya.Camera(0, 0.1, 100));
                this.camera.transform.translate(new Laya.Vector3(0, 3, 10));
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                this.scene.addChild(directlightSprite);
                dircom.color = new Laya.Color(1, 1, 1, 1);
                var mat = directlightSprite.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(-1.0, -1.0, 1.0));
                directlightSprite.transform.worldMatrix = mat;
                this.addbox();
            });
        }
        addbox() {
            var box = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(1, 1, 1)));
            var transform = box.transform;
            var pos = transform.position;
            pos.setValue(0, 5, 0);
            transform.position = pos;
            box.meshRenderer.sharedMaterial = new Laya.BlinnPhongMaterial();
            var rigidBody = box.addComponent(Laya.Rigidbody3D);
            var boxShape = new Laya.BoxColliderShape(1, 1, 1);
            rigidBody.colliderShape = boxShape;
            rigidBody.mass = 10;
            rigidBody.isKinematic = true;
            var box2 = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(1, 1, 1)));
            var transform2 = box2.transform;
            var pos2 = transform2.position;
            pos2.setValue(0, 3, 0);
            transform2.position = pos2;
            box2.meshRenderer.sharedMaterial = new Laya.BlinnPhongMaterial();
            var rigidBody2 = box2.addComponent(Laya.Rigidbody3D);
            var boxShape2 = new Laya.BoxColliderShape(1, 1, 1);
            rigidBody2.colliderShape = boxShape2;
            rigidBody2.mass = 10;
            var fixedConstraint = box.addComponent(Laya.FixedConstraint);
            fixedConstraint.anchor = new Laya.Vector3(0, 0, 0);
            fixedConstraint.connectAnchor = new Laya.Vector3(0, 2, 0);
            box.addComponent(FixedEventTest);
            fixedConstraint.ownBody = rigidBody;
            fixedConstraint.connectedBody = rigidBody2;
        }
    }
    class FixedEventTest extends Laya.Script {
        onStart() {
            this.fixedConstraint = this.owner.getComponent(Laya.FixedConstraint);
            this.fixedConstraint.breakForce = 1000;
        }
        onUpdate() {
            if (this.fixedConstraint) {
                var mass = this.fixedConstraint.connectedBody.mass;
                this.fixedConstraint.connectedBody.mass = mass + 1;
            }
        }
        onJointBreak() {
            console.log("duanle");
        }
    }

    class PhysicsWorld_ConfigurableJoint {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                Laya.Shader3D.debugMode = true;
                this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                this.camera = this.scene.addChild(new Laya.Camera(0, 0.1, 100));
                this.camera.transform.translate(new Laya.Vector3(0, 3, 30));
                this.camera.addComponent(CameraMoveScript);
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                this.scene.addChild(directlightSprite);
                dircom.color = new Laya.Color(1, 1, 1, 1);
                var mat = directlightSprite.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(-1.0, -1.0, 1.0));
                directlightSprite.transform.worldMatrix = mat;
                var plane = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(40, 40, 40, 40)));
                plane.transform.position = new Laya.Vector3(0, -2.0, 0);
                var planeMat = new Laya.BlinnPhongMaterial();
                Laya.Texture2D.load("res/threeDimen/Physics/grass.png", Laya.Handler.create(this, function (tex) {
                    planeMat.albedoTexture = tex;
                }));
                var tilingOffset = planeMat.tilingOffset;
                tilingOffset.setValue(5, 5, 0, 0);
                planeMat.tilingOffset = tilingOffset;
                plane.meshRenderer.material = planeMat;
                this.springTest();
                this.bounceTest();
                this.alongZAixs();
                this.freeRotate();
                this.rotateAngularX();
                this.rotateAngularPoint();
            });
        }
        springTest() {
            var boxA = this.addRigidBodySphere(new Laya.Vector3(7, 3, 0), 1);
            var boxARigid = boxA.getComponent(Laya.Rigidbody3D);
            boxARigid.isKinematic = true;
            var boxB = this.addRigidBodyBox(new Laya.Vector3(10, 0, 0), 1);
            boxB.meshRenderer.material.albedoColor = new Laya.Color(1, 0, 0, 1);
            var boxBRigid = boxB.getComponent(Laya.Rigidbody3D);
            var configurableJoint = boxA.addComponent(Laya.ConfigurableConstraint);
            configurableJoint.ownBody = boxARigid;
            configurableJoint.connectedBody = boxBRigid;
            configurableJoint.anchor = new Laya.Vector3(0, -3, 0);
            configurableJoint.connectAnchor = new Laya.Vector3(0, 0, 0);
            configurableJoint.distanceLimit = 3;
            configurableJoint.XMotion = Laya.D6Axis.eLIMITED;
            configurableJoint.YMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.ZMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.angularXMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.angularYMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.angularZMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.distanceSpring = 100;
            boxBRigid.applyImpulse(new Laya.Vector3(100, 0, 0));
        }
        bounceTest() {
            var boxA = this.addRigidBodySphere(new Laya.Vector3(7, 3, 3), 1);
            var boxARigid = boxA.getComponent(Laya.Rigidbody3D);
            var boxB = this.addRigidBodyBox(new Laya.Vector3(7, 0, 3), 1);
            boxB.meshRenderer.material.albedoColor = new Laya.Color(1, 0, 0, 1);
            var boxBRigid = boxB.getComponent(Laya.Rigidbody3D);
            var configurableJoint = boxA.addComponent(Laya.ConfigurableConstraint);
            configurableJoint.ownBody = boxARigid;
            configurableJoint.connectedBody = boxBRigid;
            configurableJoint.anchor = new Laya.Vector3(0, -3, 0);
            configurableJoint.connectAnchor = new Laya.Vector3(0, 0, 0);
            configurableJoint.distanceLimit = 2;
            configurableJoint.XMotion = Laya.D6Axis.eLIMITED;
            configurableJoint.YMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.ZMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.angularXMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.angularYMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.angularZMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.distanceBounciness = 0.5;
            boxBRigid.applyImpulse(new Laya.Vector3(100, 0, 0));
        }
        rotateAngularX() {
            var boxA = this.addRigidBodySphere(new Laya.Vector3(-2, 3, 0), 1);
            var boxARigid = boxA.getComponent(Laya.Rigidbody3D);
            var boxB = this.addRigidBodyBox(new Laya.Vector3(-2, 1, 0), 1);
            boxB.meshRenderer.material.albedoColor = new Laya.Color(1, 0, 0, 1);
            var boxBRigid = boxB.getComponent(Laya.Rigidbody3D);
            var configurableJoint = boxA.addComponent(Laya.ConfigurableConstraint);
            configurableJoint.ownBody = boxARigid;
            configurableJoint.connectedBody = boxBRigid;
            configurableJoint.anchor = new Laya.Vector3(0, -3, 0);
            configurableJoint.connectAnchor = new Laya.Vector3(0, 0, 0);
            configurableJoint.angularXMinLimit = -180;
            configurableJoint.angularXMaxLimit = 180;
            configurableJoint.XMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.YMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.ZMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.angularXMotion = Laya.D6Axis.eFREE;
            configurableJoint.angularYMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.angularZMotion = Laya.D6Axis.eLOCKED;
            boxBRigid.angularVelocity = new Laya.Vector3(5, 0, 0);
        }
        freeRotate() {
            var boxA = this.addRigidBodySphere(new Laya.Vector3(-6, 3, 0), 1);
            var boxARigid = boxA.getComponent(Laya.Rigidbody3D);
            var boxB = this.addRigidBodyBox(new Laya.Vector3(-6, 1, 0), 1);
            boxB.meshRenderer.material.albedoColor = new Laya.Color(1, 0, 0, 1);
            var boxBRigid = boxB.getComponent(Laya.Rigidbody3D);
            var configurableJoint = boxA.addComponent(Laya.ConfigurableConstraint);
            configurableJoint.ownBody = boxARigid;
            configurableJoint.connectedBody = boxBRigid;
            configurableJoint.anchor = new Laya.Vector3(0, -1, 0);
            configurableJoint.connectAnchor = new Laya.Vector3(0, 1, 0);
            configurableJoint.XMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.YMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.ZMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.angularXMotion = Laya.D6Axis.eFREE;
            configurableJoint.angularYMotion = Laya.D6Axis.eFREE;
            configurableJoint.angularZMotion = Laya.D6Axis.eFREE;
            boxBRigid.angularVelocity = new Laya.Vector3(2, 2, 2);
            boxBRigid.angularVelocity = new Laya.Vector3(20, 2, 10);
        }
        rotateAngularPoint() {
            var boxA = this.addRigidBodySphere(new Laya.Vector3(0, 10, 0), 1);
            var boxARigid = boxA.getComponent(Laya.Rigidbody3D);
            var boxB = this.addRigidBodyBox(new Laya.Vector3(6, 10, 0), 1);
            boxB.meshRenderer.material.albedoColor = new Laya.Color(1, 0, 0, 1);
            var boxBRigid = boxB.getComponent(Laya.Rigidbody3D);
            var configurableJoint = boxA.addComponent(Laya.ConfigurableConstraint);
            configurableJoint.ownBody = boxARigid;
            configurableJoint.connectedBody = boxBRigid;
            configurableJoint.anchor = new Laya.Vector3(0, 0, 0);
            configurableJoint.connectAnchor = new Laya.Vector3(-6, 0, 0);
            configurableJoint.AngleZLimit = 180;
            configurableJoint.XMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.YMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.ZMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.angularXMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.angularYMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.angularZMotion = Laya.D6Axis.eLIMITED;
        }
        alongZAixs() {
            var boxA = this.addRigidBodySphere(new Laya.Vector3(2, 3, 0), 1);
            var boxARigid = boxA.getComponent(Laya.Rigidbody3D);
            var boxB = this.addRigidBodyBox(new Laya.Vector3(2, 0, 0), 1);
            boxB.meshRenderer.material.albedoColor = new Laya.Color(1, 0, 0, 1);
            var boxBRigid = boxB.getComponent(Laya.Rigidbody3D);
            var configurableJoint = boxA.addComponent(Laya.ConfigurableConstraint);
            configurableJoint.ownBody = boxARigid;
            configurableJoint.connectedBody = boxBRigid;
            configurableJoint.anchor = new Laya.Vector3(0, 0, 0);
            configurableJoint.connectAnchor = new Laya.Vector3(0, 3, 0);
            configurableJoint.distanceLimit = 4;
            configurableJoint.XMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.YMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.ZMotion = Laya.D6Axis.eLIMITED;
            configurableJoint.angularXMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.angularYMotion = Laya.D6Axis.eLOCKED;
            configurableJoint.angularZMotion = Laya.D6Axis.eLOCKED;
            boxBRigid.linearVelocity = new Laya.Vector3(0.0, 0.0, 4);
        }
        addRigidBodyBox(pos, scale) {
            var box = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(scale, scale, scale)));
            box.transform.position = pos;
            var mat = new Laya.BlinnPhongMaterial();
            box.meshRenderer.material = mat;
            var rigidBody = box.addComponent(Laya.Rigidbody3D);
            var boxShape = new Laya.BoxColliderShape(scale, scale, scale);
            rigidBody.colliderShape = boxShape;
            rigidBody.mass = 1;
            rigidBody.friction = 0.5;
            rigidBody.restitution = 10.0;
            return box;
        }
        addRigidBodySphere(pos, scale) {
            var sphere = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createSphere(0.2)));
            sphere.transform.position = pos;
            var mat = new Laya.BlinnPhongMaterial();
            mat.albedoColor = new Laya.Color(0, 1, 0, 1);
            sphere.meshRenderer.material = mat;
            var rigidBody = sphere.addComponent(Laya.Rigidbody3D);
            var boxShape = new Laya.SphereColliderShape(0.2);
            rigidBody.colliderShape = boxShape;
            rigidBody.mass = 1;
            rigidBody.friction = 0.5;
            rigidBody.restitution = 0.0;
            rigidBody.isKinematic = true;
            return sphere;
        }
    }

    class SpotLightShadowMap {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Shader3D.debugMode = true;
                Laya.Scene3D.load("res/threeDimen/testNewFunction/LayaScene_depthScene/Conventional/depthScene.ls", Laya.Handler.create(this, (scene) => {
                    this.demoScene = Laya.Laya.stage.addChild(scene);
                    this.camera = scene.getChildByName("Camera");
                    this.camera.addComponent(CameraMoveScript);
                    this.camera.active = true;
                    this.receaveRealShadow(this.demoScene);
                }));
            });
        }
        receaveRealShadow(scene3d) {
            var childLength = scene3d.numChildren;
            for (var i = 0; i < childLength; i++) {
                var childSprite = scene3d.getChildAt(i);
                if (childSprite.getComponent(Laya.MeshRenderer)) {
                    childSprite.getComponent(Laya.MeshRenderer).receiveShadow = true;
                    childSprite.getComponent(Laya.MeshRenderer).castShadow = true;
                }
                else if (childSprite.getComponent(Laya.SpotLightCom) instanceof Laya.SpotLightCom) {
                    childSprite.getComponent(Laya.SpotLightCom).shadowMode = Laya.ShadowMode.Hard;
                    childSprite.getComponent(Laya.SpotLightCom).shadowDistance = 3;
                    childSprite.getComponent(Laya.SpotLightCom).shadowResolution = 512;
                    childSprite.getComponent(Laya.SpotLightCom).shadowDepthBias = 1.0;
                }
            }
            return;
        }
    }

    class ChinarMirrorPlane extends Laya.Script {
        set mirrorPlane(value) {
            this._mirrorPlane = value;
            var material = new Laya.UnlitMaterial();
            value.getComponent(Laya.MeshRenderer).sharedMaterial = material;
            material.albedoTexture = this.renderTexture;
            material.tilingOffset = new Laya.Vector4(-1, 1, 0, 0);
        }
        set onlyMainCamera(value) {
            value.scene.addChild(this.mirrorCamera);
            this.mainCamera = value;
        }
        constructor() {
            super();
            this.mirrorCamera = new Laya.Camera();
            this.renderTexture = Laya.RenderTexture.createFromPool(1024, 1024, Laya.RenderTargetFormat.R8G8B8, Laya.RenderTargetFormat.DEPTH_16, false, 1);
            this.estimateViewFrustum = true;
            this.setNearClipPlane = true;
            this.nearClipDistanceOffset = -0.01;
            this.vn = new Laya.Vector3();
            this.pa = new Laya.Vector3();
            this.pb = new Laya.Vector3();
            this.pc = new Laya.Vector3();
            this.pe = new Laya.Vector3();
            this.va = new Laya.Vector3();
            this.vb = new Laya.Vector3();
            this.vc = new Laya.Vector3();
            this.vr = new Laya.Vector3();
            this.vu = new Laya.Vector3();
            this.p = new Laya.Matrix4x4();
            this.rm = new Laya.Matrix4x4();
            this.tm = new Laya.Matrix4x4();
        }
        onStart() {
            this.mirrorCamera.renderTarget = this.renderTexture;
            this.mirrorCamera.clearColor = new Laya.Color(0.0, 0.0, 0.0, 1.0);
        }
        onUpdate() {
            if (this.mirrorCamera == null || this._mirrorPlane == null || this.mainCamera == null) {
                return;
            }
            this._mirrorPlane.transform.worldMatrix.invert(ChinarMirrorPlane.tempMat);
            Laya.Vector3.transformV3ToV3(this.mainCamera.transform.position, ChinarMirrorPlane.tempMat, ChinarMirrorPlane.tempV3);
            ChinarMirrorPlane.tempV3.y = -ChinarMirrorPlane.tempV3.y;
            Laya.Vector3.transformV3ToV3(ChinarMirrorPlane.tempV3, this._mirrorPlane.transform.worldMatrix, ChinarMirrorPlane.tempV3);
            this.mirrorCamera.transform.position = ChinarMirrorPlane.tempV3;
            Laya.Vector3.transformV3ToV3(ChinarMirrorPlane.oriPa, this._mirrorPlane.transform.worldMatrix, this.pa);
            Laya.Vector3.transformV3ToV3(ChinarMirrorPlane.oriPb, this._mirrorPlane.transform.worldMatrix, this.pb);
            Laya.Vector3.transformV3ToV3(ChinarMirrorPlane.oriPc, this._mirrorPlane.transform.worldMatrix, this.pc);
            this.pe = this.mirrorCamera.transform.position;
            this.n = this.mirrorCamera.nearPlane;
            this.f = this.mirrorCamera.farPlane;
            Laya.Vector3.subtract(this.pa, this.pe, this.va);
            Laya.Vector3.subtract(this.pb, this.pe, this.vb);
            Laya.Vector3.subtract(this.pc, this.pe, this.vc);
            Laya.Vector3.subtract(this.pb, this.pa, this.vr);
            Laya.Vector3.subtract(this.pc, this.pa, this.vu);
            Laya.Vector3.cross(this.va, this.vc, ChinarMirrorPlane.tempV3);
            if (Laya.Vector3.dot(ChinarMirrorPlane.tempV3, this.vb) < 0.0) {
                Laya.Vector3.scale(this.vu, -1, this.vu);
                this.pc.cloneTo(this.pa);
                Laya.Vector3.add(this.pa, this.vr, this.pb);
                Laya.Vector3.add(this.pa, this.vu, this.pc);
                Laya.Vector3.subtract(this.pa, this.pe, this.va);
                Laya.Vector3.subtract(this.pb, this.pe, this.vb);
                Laya.Vector3.subtract(this.pc, this.pe, this.vc);
            }
            Laya.Vector3.normalize(this.vr, this.vr);
            Laya.Vector3.normalize(this.vu, this.vu);
            Laya.Vector3.cross(this.vr, this.vu, ChinarMirrorPlane.tempV3);
            Laya.Vector3.normalize(ChinarMirrorPlane.tempV3, this.vn);
            this.d = Laya.Vector3.dot(this.va, this.vn);
            if (this.setNearClipPlane) {
                this.n = this.d + this.nearClipDistanceOffset;
                this.mirrorCamera.nearPlane = this.n;
            }
            this.l = Laya.Vector3.dot(this.vr, this.va) * this.n / this.d;
            this.r = Laya.Vector3.dot(this.vr, this.vb) * this.n / this.d;
            this.b = Laya.Vector3.dot(this.vu, this.va) * this.n / this.d;
            this.t = Laya.Vector3.dot(this.vu, this.vc) * this.n / this.d;
            this.p.elements[0] = 2.0 * this.n / (this.r - this.l);
            this.p.elements[4] = 0;
            this.p.elements[8] = (this.r + this.l) / (this.r - this.l);
            this.p.elements[12] = 0.0;
            this.p.elements[1] = 0.0;
            this.p.elements[5] = 2.0 * this.n / (this.t - this.b);
            this.p.elements[9] = (this.t + this.b) / (this.t - this.b);
            this.p.elements[13] = 0.0;
            this.p.elements[2] = 0;
            this.p.elements[6] = 0;
            this.p.elements[10] = (this.f + this.n) / (this.n - this.f);
            this.p.elements[14] = (2.0 * this.f * this.n / (this.n - this.f)) / 2;
            this.p.elements[3] = 0;
            this.p.elements[7] = 0;
            this.p.elements[11] = -1;
            this.p.elements[15] = 0;
            this.p.elements[0] *= -1;
            this.p.elements[5] *= -1;
            this.p.elements[14] *= -1;
            this.rm.elements[0] = this.vr.x;
            this.rm.elements[4] = this.vr.y;
            this.rm.elements[8] = this.vr.z;
            this.rm.elements[12] = this.pe.x;
            this.rm.elements[1] = this.vu.x;
            this.rm.elements[5] = this.vu.y;
            this.rm.elements[9] = this.vu.z;
            this.rm.elements[13] = this.pe.z;
            this.rm.elements[2] = this.vn.x;
            this.rm.elements[6] = this.vn.y;
            this.rm.elements[10] = this.vn.z;
            this.rm.elements[14] = this.pe.y;
            this.rm.elements[3] = 0;
            this.rm.elements[7] = 0;
            this.rm.elements[11] = 0;
            this.rm.elements[15] = 1;
            this.mirrorCamera.projectionMatrix = this.p;
            this.rm.invert(ChinarMirrorPlane.tempMat);
            this.mirrorCamera.transform.worldMatrix = ChinarMirrorPlane.tempMat;
            if (!this.estimateViewFrustum)
                return;
        }
    }
    ChinarMirrorPlane.oriPa = new Laya.Vector3(5, 0, -5);
    ChinarMirrorPlane.oriPb = new Laya.Vector3(-5, 0, -5);
    ChinarMirrorPlane.oriPc = new Laya.Vector3(5, 0, 5);
    ChinarMirrorPlane.tempMat = new Laya.Matrix4x4();
    ChinarMirrorPlane.tempV3 = new Laya.Vector3();

    class VideoPlayIn3DWorld {
        constructor() {
            this.isoneVideo = false;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Scene3D.load("res/threeDimen/moveClipSample/moveclip/Conventional/moveclip.ls", Laya.Handler.create(this, function (scene) {
                    Laya.Laya.stage.addChild(scene);
                    var camera = scene.getChildByName("Main Camera");
                    camera.enableHDR = false;
                    camera.addComponent(CameraMoveScript);
                    var mirrorFloor = camera.addComponent(ChinarMirrorPlane);
                    mirrorFloor.onlyMainCamera = camera;
                    mirrorFloor.mirrorPlane = scene.getChildByName("reflectionPlan");
                    this.videoPlane = scene.getChildByName("moveclip");
                    Laya.Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.createVideo, ["res/av/mov_bbb.mp4"]);
                }));
            });
        }
        createVideo(url) {
            if (!this.isoneVideo) {
                var videoTexture = Laya.VideoTexture.createInstance();
                videoTexture.on(Laya.Event.READY, this, () => {
                    mat.albedoTexture = videoTexture;
                });
                videoTexture.source = url;
                videoTexture.play();
                videoTexture.loop = true;
                let mat = new Laya.UnlitMaterial();
                this.videoPlane.getComponent(Laya.MeshRenderer).sharedMaterial = mat;
                this.isoneVideo = true;
            }
        }
    }

    class SimpleSkinAnimationInstance {
        constructor() {
            this.animatorName = [
                ["PickUp", "PotionDrink", "BattleWalkRight", "VictoryStart", "DefendStart", "Die", "Interact", "VictoryMaintain"],
                ["DefendHit_SwordAndShield", "SwordAndShiled2", "Defend_SwordAndShield", "SwordAndShiled", "Attack04_Start_SwordAndShield", "Attack04_SwordAndShiled"],
            ];
            this.widthNums = 20;
            this.step = 2.5;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                Laya.Shader3D.debugMode = true;
                this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = new Laya.Camera();
                this.scene.addChild(camera);
                camera.clearFlag = Laya.CameraClearFlags.SolidColor;
                camera.clearColor = new Laya.Color(0.79, 0.72, 0.72, 1.0);
                camera.transform.localPosition = new Laya.Vector3(-16.4, 2.96, 24.3);
                camera.transform.localRotationEuler = new Laya.Vector3(-7.5, -30, 0.0);
                camera.addComponent(CameraMoveScript);
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                this.scene.addChild(directlightSprite);
                dircom.intensity = 0.5;
                directlightSprite.transform.localRotationEuler = new Laya.Vector3(-20, 0, 0);
                var res = [
                    "res/threeDimen/texAnimation/Attack01/Attack01.lh",
                    "res/threeDimen/texAnimation/role/role.lh",
                ];
                Laya.Laya.loader.load(res).then(() => {
                    this.oriSprite3D = Laya.Loader.createNodes(res[0]);
                    this.sceneBuild(0);
                    this.oriSprite3D = Laya.Loader.createNodes(res[1]);
                    this.sceneBuild(1);
                });
                let planeMesh = Laya.PrimitiveMesh.createPlane(100, 100, 1, 1);
                var plane = new Laya.Sprite3D();
                let planerender = plane.addComponent(Laya.MeshRenderer);
                let planefilter = plane.addComponent(Laya.MeshFilter);
                var planeMat = new Laya.BlinnPhongMaterial();
                planerender.sharedMaterial = planeMat;
                this.scene.addChild(plane);
            });
        }
        cloneSprite(pos, quaterial, aniNameIndex) {
            var clonesprite = this.oriSprite3D.clone();
            this.scene.addChild(clonesprite);
            var animate = clonesprite.getComponent(Laya.Animator);
            var nums = Math.round(Math.random() * 5);
            animate.play(this.animatorName[aniNameIndex][nums], 0, Math.random());
            clonesprite.transform.position = pos;
            clonesprite.transform.rotationEuler = quaterial;
        }
        sceneBuild(aniNameIndex) {
            var left = -0.5 * this.step * (this.widthNums);
            var right = -1 * left;
            for (var i = left; i < right; i += this.step)
                for (var j = left; j < right; j += this.step) {
                    var xchange = (Math.random() - 0.5) * 5;
                    var zchange = (Math.random() - 0.5) * 5;
                    var quaterial = new Laya.Vector3(0, Math.random() * 180, 0);
                    this.cloneSprite(new Laya.Vector3(i + xchange, 0, j + zchange), quaterial, aniNameIndex);
                }
        }
    }

    var BlurVS = "#include \"Camera.glsl\";\r\nvarying vec2 v_Texcoord0;\r\n\r\nvoid main() {\r\n\tgl_Position = vec4(a_PositionTexcoord.xy, 0.0, 1.0);\r\n\tv_Texcoord0 = a_PositionTexcoord.zw;\r\n\tgl_Position = remapPositionZ(gl_Position);\r\n}";

    var BlurHorizentalFS = "#define SHADER_NAME BlurHorizontal\r\n\r\n#include \"Color.glsl\";\r\n\r\nvarying vec2 v_Texcoord0;\r\n\r\nvec4 sampleMainTex(vec2 uv)\r\n{\r\n    vec4 mainSampler = texture2D(u_MainTex, uv);\r\n#ifdef Gamma_u_MainTex\r\n    mainSampler = gammaToLinear(mainSampler);\r\n#endif // Gamma_u_MainTex\r\n    return mainSampler;\r\n}\r\n\r\nvoid main()\r\n{\r\n    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);\r\n    vec2 uv = v_Texcoord0;\r\n    vec2 uvOffset = vec2(1.0, 0.0) * u_MainTex_TexelSize.xy * u_DownSampleValue;\r\n    uv = uv - uvOffset * 3.0;\r\n    //高斯参数\r\n    color += 0.0205 * sampleMainTex(uv);\r\n    uv += uvOffset;\r\n    color += 0.0855 * sampleMainTex(uv);\r\n    uv += uvOffset;\r\n    color += 0.232 * sampleMainTex(uv);\r\n    uv += uvOffset;\r\n    color += 0.324 * sampleMainTex(uv);\r\n    uv += uvOffset;\r\n    color += 0.232 * sampleMainTex(uv);\r\n    uv += uvOffset;\r\n    color += 0.0855 * sampleMainTex(uv);\r\n    uv += uvOffset;\r\n    color += 0.0205 * sampleMainTex(uv);\r\n\r\n    gl_FragColor = color;\r\n\r\n    gl_FragColor = outputTransform(gl_FragColor);\r\n}";

    var BlurVerticalFS = "#define SHADER_NAME BlurVertical\r\n\r\n#include \"Color.glsl\";\r\n\r\nvarying vec2 v_Texcoord0;\r\n\r\nvec4 sampleMainTex(vec2 uv)\r\n{\r\n    vec4 mainSampler = texture2D(u_MainTex, uv);\r\n#ifdef Gamma_u_MainTex\r\n    mainSampler = gammaToLinear(mainSampler);\r\n#endif // Gamma_u_MainTex\r\n    return mainSampler;\r\n}\r\n\r\nvoid main()\r\n{\r\n    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);\r\n    vec2 uv = v_Texcoord0;\r\n    vec2 uvOffset = vec2(0.0, 1.0) * u_MainTex_TexelSize.xy * u_DownSampleValue;\r\n    uv = uv - uvOffset * 3.0;\r\n    //高斯参数\r\n    color += 0.0205 * sampleMainTex(uv);\r\n    uv += uvOffset;\r\n    color += 0.0855 * sampleMainTex(uv);\r\n    uv += uvOffset;\r\n    color += 0.232 * sampleMainTex(uv);\r\n    uv += uvOffset;\r\n    color += 0.324 * sampleMainTex(uv);\r\n    uv += uvOffset;\r\n    color += 0.232 * sampleMainTex(uv);\r\n    uv += uvOffset;\r\n    color += 0.0855 * sampleMainTex(uv);\r\n    uv += uvOffset;\r\n    color += 0.0205 * sampleMainTex(uv);\r\n\r\n    gl_FragColor = color;\r\n\r\n    gl_FragColor = outputTransform(gl_FragColor);\r\n}";

    var BlurDownSampleFS = "#define SHADER_NAME BlurDownSample\r\n\r\n#include \"Color.glsl\";\r\n\r\nvarying vec2 v_Texcoord0;\r\n\r\nvec4 sampleMainTex(vec2 uv)\r\n{\r\n    vec4 mainSampler = texture2D(u_MainTex, uv);\r\n#ifdef Gamma_u_MainTex\r\n    mainSampler = gammaToLinear(mainSampler);\r\n#endif // Gamma_u_MainTex\r\n    return mainSampler;\r\n}\r\n\r\nvoid main()\r\n{\r\n    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);\r\n    color += sampleMainTex(v_Texcoord0 + u_MainTex_TexelSize.xy * vec2(1.0, 0.0));\r\n    color += sampleMainTex(v_Texcoord0 + u_MainTex_TexelSize.xy * vec2(-1.0, 0.0));\r\n    color += sampleMainTex(v_Texcoord0 + u_MainTex_TexelSize.xy * vec2(0.0, -1.0));\r\n    color += sampleMainTex(v_Texcoord0 + u_MainTex_TexelSize.xy * vec2(0.0, 1.0));\r\n    gl_FragColor = color / 4.0;\r\n\r\n    gl_FragColor = outputTransform(gl_FragColor);\r\n}";

    var BlurDownSampleVS = "#include \"Camera.glsl\";\r\nvarying vec2 v_Texcoord0;\r\n\r\nvoid main() {\r\n\tgl_Position = vec4(a_PositionTexcoord.xy, 0.0, 1.0);\r\n\tv_Texcoord0 = a_PositionTexcoord.zw;\r\n\tgl_Position = remapPositionZ(gl_Position);\r\n}";

    var BlurEdgeAdd = "#define SHADER_NAME EdgeAdd\r\nvarying vec2 v_Texcoord0;\r\n\r\nvoid main()\r\n{\r\n    vec2 uv = v_Texcoord0;\r\n    vec4 mainColor = texture2D(u_MainTex,uv);\r\n    vec4 sourceColor = texture2D(u_sourceTexture0,v_Texcoord0);\r\n    float factor = step(sourceColor.x+sourceColor.y+sourceColor.z,0.001);\r\n    vec4 color = mix(sourceColor,mainColor,factor);\r\n    gl_FragColor = color;\r\n}";

    var BlurEdgeSub = "#define SHADER_NAME EdgeSub\r\nvarying vec2 v_Texcoord0;\r\n\r\nvoid main()\r\n{\r\n    vec2 uv = v_Texcoord0;\r\n    vec4 blurColor = texture2D(u_sourceTexture0,uv);\r\n    vec4 clearColor = texture2D(u_sourceTexture1,uv);\r\n    float factor = step(clearColor.x+clearColor.y+clearColor.z,0.001);\r\n    vec4 color = blurColor*factor;\r\n    color = (1.0-step(color.x+color.y+color.z,0.15))*vec4(1.0,0.0,0.0,1.0);\r\n    gl_FragColor = color;\r\n}";

    class BlurEffect extends Laya.PostProcessEffect {
        static init() {
            BlurEffect.SHADERVALUE_MAINTEX = Laya.Shader3D.propertyNameToID("u_MainTex");
            BlurEffect.SHADERVALUE_TEXELSIZE = Laya.Shader3D.propertyNameToID("u_MainTex_TexelSize");
            BlurEffect.SHADERVALUE_DOWNSAMPLEVALUE = Laya.Shader3D.propertyNameToID("u_DownSampleValue");
            let attributeMap = {
                'a_PositionTexcoord': [Laya.VertexMesh.MESH_POSITION0, Laya.ShaderDataType.Vector4]
            };
            let uniformMap = {
                "u_MainTex": Laya.ShaderDataType.Texture2D,
                "u_sourceTexture0": Laya.ShaderDataType.Texture2D,
                "u_sourceTexture1": Laya.ShaderDataType.Texture2D,
                "u_MainTex_TexelSize": Laya.ShaderDataType.Vector4,
                "u_DownSampleValue": Laya.ShaderDataType.Float
            };
            var shader = Laya.Shader3D.add("blurEffect");
            var subShader = new Laya.SubShader(attributeMap, uniformMap);
            shader.addSubShader(subShader);
            var shaderpass = subShader.addShaderPass(BlurDownSampleVS, BlurDownSampleFS);
            var renderState = shaderpass.renderState;
            renderState.depthTest = Laya.RenderState.DEPTHTEST_ALWAYS;
            renderState.depthWrite = false;
            renderState.cull = Laya.RenderState.CULL_NONE;
            renderState.blend = Laya.RenderState.BLEND_DISABLE;
            subShader = new Laya.SubShader(attributeMap, uniformMap);
            shader.addSubShader(subShader);
            shaderpass = subShader.addShaderPass(BlurVS, BlurVerticalFS);
            renderState = shaderpass.renderState;
            renderState.depthTest = Laya.RenderState.DEPTHTEST_ALWAYS;
            renderState.depthWrite = false;
            renderState.cull = Laya.RenderState.CULL_NONE;
            renderState.blend = Laya.RenderState.BLEND_DISABLE;
            subShader = new Laya.SubShader(attributeMap, uniformMap);
            shader.addSubShader(subShader);
            shaderpass = subShader.addShaderPass(BlurVS, BlurHorizentalFS);
            renderState = shaderpass.renderState;
            renderState.depthTest = Laya.RenderState.DEPTHTEST_ALWAYS;
            renderState.depthWrite = false;
            renderState.cull = Laya.RenderState.CULL_NONE;
            renderState.blend = Laya.RenderState.BLEND_DISABLE;
            subShader = new Laya.SubShader(attributeMap, uniformMap);
            shader.addSubShader(subShader);
            shaderpass = subShader.addShaderPass(BlurVS, BlurEdgeSub);
            renderState = shaderpass.renderState;
            renderState.depthTest = Laya.RenderState.DEPTHTEST_ALWAYS;
            renderState.depthWrite = false;
            renderState.cull = Laya.RenderState.CULL_NONE;
            renderState.blend = Laya.RenderState.BLEND_DISABLE;
            subShader = new Laya.SubShader(attributeMap, uniformMap);
            shader.addSubShader(subShader);
            shaderpass = subShader.addShaderPass(BlurVS, BlurEdgeAdd);
            renderState = shaderpass.renderState;
            renderState.depthTest = Laya.RenderState.DEPTHTEST_ALWAYS;
            renderState.depthWrite = false;
            renderState.cull = Laya.RenderState.CULL_NONE;
            renderState.blend = Laya.RenderState.BLEND_DISABLE;
        }
        constructor() {
            super();
            this._shader = null;
            this._shaderData = Laya.LayaGL.renderDeviceFactory.createShaderData(null);
            this._downSampleNum = 1;
            this._blurSpreadSize = 1;
            this._blurIterations = 2;
            this._texSize = new Laya.Vector4(1.0, 1.0, 1.0, 1.0);
            this._shader = Laya.Shader3D.find("blurEffect");
            this._tempRenderTexture = new Array(13);
        }
        get downSampleNum() {
            return this._downSampleNum;
        }
        set downSampleNum(value) {
            this._downSampleNum = Math.min(6, Math.max(value, 0.0));
        }
        get blurSpreadSize() {
            return this._blurSpreadSize;
        }
        set blurSpreadSize(value) {
            this._blurSpreadSize = Math.min(10.0, Math.max(value, 1.0));
        }
        get blurIterations() {
            return this._blurIterations;
        }
        set blurIterations(value) {
            this._blurIterations = Math.min(Math.max(value, 0.0), 6.0);
        }
        render(context) {
            var cmd = context.command;
            var viewport = context.camera.viewport;
            var scaleFactor = 1.0 / (1 << Math.floor(this._downSampleNum));
            var tw = Math.floor(viewport.width * scaleFactor);
            var th = Math.floor(viewport.height * scaleFactor);
            this._texSize.setValue(1.0 / tw, 1.0 / th, tw, th);
            this._shaderData.setNumber(BlurEffect.SHADERVALUE_DOWNSAMPLEVALUE, this.blurSpreadSize);
            this._shaderData.setVector(BlurEffect.SHADERVALUE_TEXELSIZE, this._texSize);
            var downSampleTexture = Laya.RenderTexture.createFromPool(tw, th, Laya.RenderTargetFormat.R8G8B8, Laya.RenderTargetFormat.None, false, 1);
            downSampleTexture.filterMode = Laya.FilterMode.Bilinear;
            this._tempRenderTexture[0] = downSampleTexture;
            var lastDownTexture = context.source;
            cmd.blitScreenTriangle(lastDownTexture, downSampleTexture, null, this._shader, this._shaderData, 0);
            lastDownTexture = downSampleTexture;
            for (var i = 0; i < this._blurIterations; i++) {
                var blurTexture = Laya.RenderTexture.createFromPool(tw, th, Laya.RenderTargetFormat.R8G8B8, Laya.RenderTargetFormat.None, false, 1);
                blurTexture.filterMode = Laya.FilterMode.Bilinear;
                cmd.blitScreenTriangle(lastDownTexture, blurTexture, null, this._shader, this._shaderData, 1);
                lastDownTexture = blurTexture;
                this._tempRenderTexture[i * 2 + 1] = blurTexture;
                blurTexture = Laya.RenderTexture.createFromPool(tw, th, Laya.RenderTargetFormat.R8G8B8, Laya.RenderTargetFormat.None, false, 1);
                blurTexture.filterMode = Laya.FilterMode.Bilinear;
                cmd.blitScreenTriangle(lastDownTexture, blurTexture, null, this._shader, this._shaderData, 2);
                lastDownTexture = blurTexture;
                this._tempRenderTexture[i * 2 + 2] = blurTexture;
            }
            context.source = lastDownTexture;
            cmd.blitScreenTriangle(context.source, context.destination);
            var maxTexture = this._blurIterations * 2 + 1;
            for (i = 0; i < maxTexture; i++) {
                Laya.RenderTexture.recoverToPool(this._tempRenderTexture[i]);
            }
            context.deferredReleaseTextures.push(lastDownTexture);
        }
    }
    BlurEffect.BLUR_TYPE_GaussianBlur = 0;
    BlurEffect.BLUR_TYPE_Simple = 1;
    class BlurMaterial extends Laya.Material {
        static __init__() {
            BlurMaterial.SHADERVALUE_MAINTEX = Laya.Shader3D.propertyNameToID("u_MainTex");
            BlurMaterial.SHADERVALUE_TEXELSIZE = Laya.Shader3D.propertyNameToID("u_MainTex_TexelSize");
            BlurMaterial.SHADERVALUE_DOWNSAMPLEVALUE = Laya.Shader3D.propertyNameToID("u_DownSampleValue");
            BlurMaterial.SHADERVALUE_SOURCETEXTURE0 = Laya.Shader3D.propertyNameToID("u_sourceTexture0");
            BlurMaterial.ShADERVALUE_SOURCETEXTURE1 = Laya.Shader3D.propertyNameToID("u_sourceTexture1");
        }
        constructor(texelSize, offset) {
            super();
            BlurMaterial.__init__();
            this.setShaderName("blurEffect");
            this.setFloatByIndex(BlurMaterial.SHADERVALUE_DOWNSAMPLEVALUE, offset);
            this.setVector4ByIndex(BlurMaterial.SHADERVALUE_TEXELSIZE, texelSize);
        }
        sourceTexture(sourceTexture0, sourceTexture1) {
            this.setTextureByIndex(BlurMaterial.SHADERVALUE_SOURCETEXTURE0, sourceTexture0);
            this.setTextureByIndex(BlurMaterial.ShADERVALUE_SOURCETEXTURE1, sourceTexture1);
        }
    }

    class PostProcess_Blur {
        constructor() {
            this.btype = "PostProcess_Blur";
            this.stype = 0;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Shader3D.debugMode = true;
                BlurEffect.init();
                Laya.Scene3D.load("res/threeDimen/LayaScene_zhuandibanben/Conventional/zhuandibanben.ls", Laya.Handler.create(this, function (scene) {
                    Laya.Laya.stage.addChild(scene);
                    this.camera = scene.getChildByName("MainCamera");
                    this.camera.addComponent(CameraMoveScript);
                    this.camera.clearFlag = Laya.CameraClearFlags.Sky;
                    this.camera.cullingMask ^= 2;
                    this.camera.enableHDR = false;
                    var mainCamera = scene.getChildByName("BlurCamera");
                    mainCamera.clearFlag = Laya.CameraClearFlags.DepthOnly;
                    mainCamera.cullingMask = 2;
                    mainCamera.renderingOrder = 1;
                    mainCamera.enableHDR = false;
                    this.camera.addChild(mainCamera);
                    mainCamera.transform.localMatrix = new Laya.Matrix4x4();
                    this.postProcess = new Laya.PostProcess();
                    var blurEffect = new BlurEffect();
                    this.postProcess.addEffect(blurEffect);
                    this.camera.postProcess = this.postProcess;
                    blurEffect.downSampleNum = 6;
                    blurEffect.blurSpreadSize = 1;
                    blurEffect.blurIterations = 1;
                    this.loadUI();
                }));
            });
        }
        loadUI() {
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, function () {
                this.button = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "关闭高斯模糊"));
                this.button.size(200, 40);
                this.button.labelBold = true;
                this.button.labelSize = 30;
                this.button.sizeGrid = "4,4,4,4";
                this.button.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.button.pos(Laya.Laya.stage.width / 2 - this.button.width * Laya.Browser.pixelRatio / 2, Laya.Laya.stage.height - 60 * Laya.Browser.pixelRatio);
                this.button.on(Laya.Event.CLICK, this, this.stypeFun0);
            }));
        }
        stypeFun0(label = "关闭高斯模糊") {
            var enableHDR = !!this.camera.postProcess;
            if (enableHDR) {
                this.button.label = "开启高斯模糊";
                this.camera.postProcess = null;
            }
            else {
                this.button.label = "关闭高斯模糊";
                this.camera.postProcess = this.postProcess;
            }
            label = this.button.label;
            Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: label });
        }
    }

    class CommandBuffer_Outline {
        constructor() {
            this.cameraEventFlag = Laya.CameraEventFlags.BeforeImageEffect;
            this.enableCommandBuffer = false;
            this.btype = "CommandBuffer_Outline";
            this.stype = 0;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                BlurEffect.init();
                var unlitMaterial = new Laya.UnlitMaterial();
                unlitMaterial.albedoColor = new Laya.Color(255, 0, 0, 255);
                var shurikenMaterial = new Laya.ShurikenParticleMaterial();
                shurikenMaterial.color = new Laya.Color(255, 0, 0, 255);
                Laya.Shader3D.debugMode = true;
                Laya.Scene3D.load("res/threeDimen/OutlineEdgeScene/Conventional/OutlineEdgeScene.ls", Laya.Handler.create(this, function (scene) {
                    Laya.Laya.stage.addChild(scene);
                    this.camera = scene.getChildByName("Main Camera");
                    this.camera.addComponent(CameraMoveScript);
                    var renders = [];
                    var materials = [];
                    renders.push((scene.getChildByName("Cube")).getComponent(Laya.MeshRenderer));
                    materials.push(unlitMaterial);
                    renders.push(scene.getChildByName("Particle").getComponent(Laya.ShurikenParticleRenderer));
                    materials.push(shurikenMaterial);
                    renders.push(scene.getChildByName("LayaMonkey").getChildByName("LayaMonkey").getComponent(Laya.SkinnedMeshRenderer));
                    materials.push(unlitMaterial);
                    this.commandBuffer = this.createDrawMeshCommandBuffer(this.camera, renders, materials);
                    this.camera.addCommandBuffer(this.cameraEventFlag, this.commandBuffer);
                    this.loadUI();
                }));
            });
        }
        createDrawMeshCommandBuffer(camera, renders, materials) {
            var buf = new Laya.CommandBuffer();
            camera.enableBuiltInRenderTexture = true;
            var viewPort = camera.viewport;
            var renderTexture = Laya.RenderTexture.createFromPool(viewPort.width, viewPort.height, Laya.RenderTargetFormat.R8G8B8A8, Laya.RenderTargetFormat.None, false, 1);
            buf.setRenderTarget(renderTexture, true, false);
            for (var i = 0, n = renders.length; i < n; i++) {
                buf.drawRender(renders[i], materials[i]);
            }
            var subRendertexture = Laya.RenderTexture.createFromPool(viewPort.width, viewPort.height, Laya.RenderTargetFormat.R8G8B8A8, Laya.RenderTargetFormat.None, false, 1);
            buf.blitScreenQuad(renderTexture, subRendertexture);
            var downSampleFactor = 2;
            var downSampleWidth = viewPort.width / downSampleFactor;
            var downSampleheigh = viewPort.height / downSampleFactor;
            var texSize = new Laya.Vector4(1.0 / viewPort.width, 1.0 / viewPort.height, viewPort.width, downSampleheigh);
            var blurMaterial = new BlurMaterial(texSize, 1);
            blurMaterial.lock = true;
            var downRenderTexture = Laya.RenderTexture.createFromPool(downSampleWidth, downSampleheigh, Laya.RenderTargetFormat.R8G8B8, Laya.RenderTargetFormat.None, false, 1);
            buf.blitScreenQuadByMaterial(renderTexture, downRenderTexture, null, blurMaterial, 0);
            var blurTexture = Laya.RenderTexture.createFromPool(downSampleWidth, downSampleheigh, Laya.RenderTargetFormat.R8G8B8, Laya.RenderTargetFormat.None, false, 1);
            blurTexture.filterMode = Laya.FilterMode.Bilinear;
            buf.blitScreenQuadByMaterial(downRenderTexture, blurTexture, null, blurMaterial, 1);
            buf.blitScreenQuadByMaterial(blurTexture, downRenderTexture, null, blurMaterial, 2);
            buf.blitScreenQuadByMaterial(downRenderTexture, blurTexture, null, blurMaterial, 1);
            buf.blitScreenQuadByMaterial(blurTexture, downRenderTexture, null, blurMaterial, 2);
            buf.setShaderDataTexture(blurMaterial.shaderData, BlurMaterial.SHADERVALUE_SOURCETEXTURE0, downRenderTexture);
            buf.setShaderDataTexture(blurMaterial.shaderData, BlurMaterial.ShADERVALUE_SOURCETEXTURE1, subRendertexture);
            buf.blitScreenQuadByMaterial(blurTexture, renderTexture, null, blurMaterial, 3);
            buf.setShaderDataTexture(blurMaterial.shaderData, BlurMaterial.SHADERVALUE_SOURCETEXTURE0, renderTexture);
            buf.blitScreenQuadByMaterial(null, subRendertexture, null, blurMaterial, 4);
            buf.blitScreenQuadByMaterial(subRendertexture, null);
            return buf;
        }
        loadUI() {
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, function () {
                this.button = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "关闭描边"));
                this.button.size(200, 40);
                this.button.labelBold = true;
                this.button.labelSize = 30;
                this.button.sizeGrid = "4,4,4,4";
                this.button.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.button.pos(Laya.Laya.stage.width / 2 - this.button.width * Laya.Browser.pixelRatio / 2, Laya.Laya.stage.height - 60 * Laya.Browser.pixelRatio);
                this.button.on(Laya.Event.CLICK, this, this.stypeFun0);
            }));
        }
        stypeFun0(label = "关闭描边") {
            this.enableCommandBuffer = !this.enableCommandBuffer;
            if (this.enableCommandBuffer) {
                this.button.label = "开启描边";
                this.camera.removeCommandBuffer(this.cameraEventFlag, this.commandBuffer);
            }
            else {
                this.button.label = "关闭描边";
                this.camera.addCommandBuffer(this.cameraEventFlag, this.commandBuffer);
            }
            label = this.button.label;
            Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: label });
        }
    }

    var GlassShaderVS = "#define SHADER_NAME GlassShaderVS\r\n#include \"Camera.glsl\";\r\n#include \"Sprite3DVertex.glsl\";\r\n#include \"VertexCommon.glsl\";\r\nvarying vec2 v_Texcoord0;\r\nvarying vec4 v_ScreenTexcoord;\r\n\r\nvoid main() {\r\n\tVertex vertex;\r\n\tgetVertexParams(vertex);\r\n\tmat4 worldMat = getWorldMatrix();\r\n\tvec3 positionWS = (worldMat * vec4(vertex.positionOS, 1.0)).xyz;\r\n\tgl_Position = getPositionCS(positionWS);\r\n\tgl_Position = remapPositionZ(gl_Position);\r\n\tv_Texcoord0= transformUV(a_Texcoord0, u_TilingOffset);\r\n\t//v_ScreenTexcoord =vec2((gl_Position.x/gl_Position.w+1.0)*0.5, (gl_Position.y/gl_Position.w+1.0)*0.5);\r\n\tv_ScreenTexcoord = gl_Position*0.5;\r\n\tv_ScreenTexcoord.xy = vec2(v_ScreenTexcoord.x,v_ScreenTexcoord.y)+v_ScreenTexcoord.w;\r\n\tv_ScreenTexcoord.zw = gl_Position.zw;\r\n\t\r\n}";

    var GlassShaderFS = "#define SHADER_NAME GlassShaderFS\r\n\r\nvarying vec2 v_Texcoord0;\r\nvarying vec4 v_ScreenTexcoord;\r\n\r\nvoid main()\r\n{\r\n\tvec4 color;\r\n\tvec4 screenTexColor = texture2D(u_screenTexture,v_ScreenTexcoord.xy/v_ScreenTexcoord.w);\r\n\tvec4 tintTexColor = texture2D(u_tintTexure, v_Texcoord0);\r\n\tcolor = mix(screenTexColor, tintTexColor,0.5);\r\n\tgl_FragColor = color;\r\n}\r\n\r\n";

    class GlassWithoutGrabMaterial extends Laya.Material {
        static init() {
            var attributeMap = {
                'a_Position': [Laya.VertexMesh.MESH_POSITION0, Laya.ShaderDataType.Vector4],
                'a_Normal': [Laya.VertexMesh.MESH_NORMAL0, Laya.ShaderDataType.Vector3],
                'a_Texcoord0': [Laya.VertexMesh.MESH_TEXTURECOORDINATE0, Laya.ShaderDataType.Vector2],
                'a_Tangent0': [Laya.VertexMesh.MESH_TANGENT0, Laya.ShaderDataType.Vector4],
            };
            var uniformMap = {
                "u_tintTexure": Laya.ShaderDataType.Texture2D,
                "u_screenTexture": Laya.ShaderDataType.Texture2D,
                "u_normalTexture": Laya.ShaderDataType.Texture2D,
                "u_TilingOffset": Laya.ShaderDataType.Vector4,
                "u_tintAmount": Laya.ShaderDataType.Color,
            };
            var shader = Laya.Shader3D.add("GlassShader", false);
            var subShader = new Laya.SubShader(attributeMap, uniformMap);
            shader.addSubShader(subShader);
            subShader.addShaderPass(GlassShaderVS, GlassShaderFS);
            GlassWithoutGrabMaterial.TINTTEXTURE = Laya.Shader3D.propertyNameToID("u_tintTexure");
            GlassWithoutGrabMaterial.NORMALTEXTURE = Laya.Shader3D.propertyNameToID("u_normalTexture");
            GlassWithoutGrabMaterial.TILINGOFFSET = Laya.Shader3D.propertyNameToID("u_TilingOffset");
            GlassWithoutGrabMaterial.ALBEDOCOLOR = Laya.Shader3D.propertyNameToID("u_tintAmount");
        }
        constructor(texture) {
            super();
            this.setShaderName("GlassShader");
            this.renderModeSet();
            this.shaderData.setVector(GlassWithoutGrabMaterial.TILINGOFFSET, new Laya.Vector4(1, 1, 0, 0));
            this.shaderData.setTexture(GlassWithoutGrabMaterial.TINTTEXTURE, texture);
        }
        renderModeSet() {
            this.alphaTest = false;
            this.renderQueue = Laya.Material.RENDERQUEUE_TRANSPARENT;
            this.depthWrite = true;
            this.cull = Laya.RenderState.CULL_BACK;
            this.blend = Laya.RenderState.BLEND_DISABLE;
            this.depthTest = Laya.RenderState.DEPTHTEST_LESS;
        }
    }

    class CommandBuffer_BlurryGlass {
        constructor() {
            Laya.Laya.init(100, 100).then(() => {
                Laya.Stat.show();
                Laya.Shader3D.debugMode = true;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                BlurEffect.init();
                GlassWithoutGrabMaterial.init();
                Laya.Scene3D.load("res/threeDimen/BlurryRefraction/Conventional/BlurryGlass.ls", Laya.Handler.create(this, function (scene) {
                    Laya.Laya.stage.addChild(scene);
                    var camera = scene.getChildByName("Main Camera");
                    camera.addComponent(CameraMoveScript);
                    var glass01 = scene.getChildByName("glass01");
                    var glass02 = scene.getChildByName("glass02");
                    var pbrStandard = glass01.getComponent(Laya.MeshRenderer).sharedMaterial;
                    var glassMaterial = new GlassWithoutGrabMaterial(pbrStandard.getTexture("u_AlbedoTexture"));
                    glass01.getComponent(Laya.MeshRenderer).sharedMaterial = glassMaterial;
                    glass02.getComponent(Laya.MeshRenderer).sharedMaterial = glassMaterial;
                    this.mat = glassMaterial;
                    this.createCommandBuffer(camera);
                }));
            });
        }
        createCommandBuffer(camera) {
            camera.enableBuiltInRenderTexture = true;
            var buf = new Laya.CommandBuffer();
            var viewPort = camera.viewport;
            var renderTexture = Laya.RenderTexture.createFromPool(viewPort.width, viewPort.height, Laya.RenderTargetFormat.R8G8B8, Laya.RenderTargetFormat.None, false, 1);
            this.texture = renderTexture;
            buf.blitScreenTriangle(null, renderTexture);
            var shader = Laya.Shader3D.find("blurEffect");
            var shaderValue = Laya.LayaGL.renderDeviceFactory.createShaderData(null);
            var downSampleFactor = 4;
            var downSampleWidth = viewPort.width / downSampleFactor;
            var downSampleheigh = viewPort.height / downSampleFactor;
            var texSize = new Laya.Vector4(1.0 / viewPort.width, 1.0 / viewPort.height, viewPort.width, downSampleheigh);
            shaderValue.setNumber(BlurEffect.SHADERVALUE_DOWNSAMPLEVALUE, 1.0);
            shaderValue.setVector(BlurEffect.SHADERVALUE_TEXELSIZE, texSize);
            var downRenderTexture = Laya.RenderTexture.createFromPool(downSampleWidth, downSampleheigh, Laya.RenderTargetFormat.R8G8B8, Laya.RenderTargetFormat.None, false, 1);
            buf.blitScreenTriangle(renderTexture, downRenderTexture, null, shader, shaderValue, 0);
            var blurTexture = Laya.RenderTexture.createFromPool(downSampleWidth, downSampleheigh, Laya.RenderTargetFormat.R8G8B8, Laya.RenderTargetFormat.None, false, 1);
            blurTexture.filterMode = Laya.FilterMode.Bilinear;
            buf.blitScreenTriangle(downRenderTexture, blurTexture, null, shader, shaderValue, 1);
            buf.blitScreenTriangle(blurTexture, downRenderTexture, null, shader, shaderValue, 2);
            buf.blitScreenTriangle(downRenderTexture, blurTexture, null, shader, shaderValue, 1);
            buf.blitScreenTriangle(blurTexture, downRenderTexture, null, shader, shaderValue, 2);
            this.mat.setTexture("u_screenTexture", downRenderTexture);
            camera.addCommandBuffer(Laya.CameraEventFlags.BeforeTransparent, buf);
            return;
        }
    }

    class HalfFloatTexture {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.transform.translate(new Laya.Vector3(0, 2, 5));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                camera.addComponent(CameraMoveScript);
                camera.clearColor = new Laya.Color(0.2, 0.2, 0.2, 1.0);
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                scene.addChild(directlightSprite);
                var mat = directlightSprite.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(-1.0, -1.0, -1.0));
                directlightSprite.transform.worldMatrix = mat;
                this.sprite3D = scene.addChild(new Laya.Sprite3D());
                var box = this.sprite3D.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(1, 1)));
                box.transform.position = new Laya.Vector3(0.0, 1.0, 2.5);
                box.transform.rotate(new Laya.Vector3(90, 0, 0), false, false);
                var material = new Laya.BlinnPhongMaterial();
                material.albedoTexture = this.createHalfFloatTexture();
                box.meshRenderer.sharedMaterial = material;
            });
        }
        createHalfFloatTexture() {
            var texture = new Laya.Texture2D(64, 64, Laya.TextureFormat.R16G16B16A16, true, true);
            var pixelData = new Uint16Array(64 * 64 * 4);
            var pixelIndex;
            var step = 1.0 / 64;
            for (var x = 0, n = 64; x < n; x++) {
                for (var y = 0, m = 64; y < m; y++) {
                    pixelIndex = (x + y * 64) * 4;
                    pixelData[pixelIndex] = Laya.HalfFloatUtils.roundToFloat16Bits(1.0);
                    pixelData[pixelIndex + 1] = Laya.HalfFloatUtils.roundToFloat16Bits(x * step);
                    pixelData[pixelIndex + 2] = Laya.HalfFloatUtils.roundToFloat16Bits(y * step);
                    pixelData[pixelIndex + 3] = Laya.HalfFloatUtils.roundToFloat16Bits(1.0);
                }
            }
            texture.setPixelsData(pixelData, false, false);
            texture.filterMode = Laya.FilterMode.Bilinear;
            return texture;
        }
    }

    class ReflectionProbeDemo {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Scene3D.load("res/threeDimen/ReflectionProbeDemo/ReflectionProbe.ls", Laya.Handler.create(this, function (scene) {
                    Laya.Laya.stage.addChild(scene);
                    var camera = scene.getChildByName("Camera");
                    camera.addComponent(CameraMoveScript);
                }));
            });
        }
    }

    var DepthVS = "#define SHADER_NAME DepthTextureTestVS\r\n\r\n#include \"Color.glsl\";\r\n\r\n#include \"Scene.glsl\";\r\n#include \"Camera.glsl\";\r\n#include \"Sprite3DVertex.glsl\";\r\n\r\n#include \"VertexCommon.glsl\";\r\n\r\nvarying vec2 v_Texcoord0;\r\nvoid main() {\r\n    Vertex vertex;\r\n    getVertexParams(vertex);\r\n\r\n    v_Texcoord0 = vertex.texCoord0;\r\n    mat4 worldMat = getWorldMatrix();\r\n    vec3 PositionWS = (worldMat * vec4(vertex.positionOS, 1.0)).xyz;\r\n\r\n    gl_Position = getPositionCS(PositionWS);\r\n    gl_Position=remapPositionZ(gl_Position);\r\n}";

    var DepthFS = "#define SHADER_NAME DepthTextureTestFS\r\n#include \"Camera.glsl\";\r\n#include \"DepthNormalUtil.glsl\";\r\n\r\n\r\nvarying vec2 v_Texcoord0;\r\n\r\nvoid main(){\r\n    vec4 col;\r\n    vec2 uv = vec2(v_Texcoord0.x,1.0-v_Texcoord0.y);\r\n    float depth = SAMPLE_DEPTH_TEXTURE(u_CameraDepthTexture,uv);\r\n    depth =Linear01Depth(depth,u_ZBufferParams);\r\n    col = vec4(depth,depth,depth,1.0);\r\n    gl_FragColor = col;\r\n}";

    class DepthMaterial extends Laya.Material {
        static init() {
            var shader = Laya.Shader3D.add("DepthShader");
            var subShader = new Laya.SubShader(Laya.SubShader.DefaultAttributeMap);
            shader.addSubShader(subShader);
            subShader.addShaderPass(DepthVS, DepthFS, "Forward");
        }
        constructor() {
            super();
            this.setShaderName("DepthShader");
            this.renderModeSet();
        }
        renderModeSet() {
            this.alphaTest = false;
            this.renderQueue = Laya.Material.RENDERQUEUE_OPAQUE;
            this.depthWrite = true;
            this.cull = Laya.RenderState.CULL_BACK;
            this.blend = Laya.RenderState.BLEND_DISABLE;
            this.depthTest = Laya.RenderState.DEPTHTEST_LESS;
        }
    }

    var DepthNormalVS = "#define SHADER_NAME DepthNormalTextureTestVS\r\n#include \"Lighting.glsl\";\r\n#include \"Color.glsl\";\r\n\r\n#include \"Scene.glsl\";\r\n#include \"Camera.glsl\";\r\n#include \"Sprite3DVertex.glsl\";\r\n\r\n#include \"VertexCommon.glsl\";\r\n\r\nvarying vec2 v_Texcoord0;\r\n\r\nvoid main() {\r\n   Vertex vertex;\r\n    getVertexParams(vertex);\r\n\r\n    v_Texcoord0 = vertex.texCoord0;\r\n    mat4 worldMat = getWorldMatrix();\r\n    vec3 PositionWS = (worldMat * vec4(vertex.positionOS, 1.0)).xyz;\r\n\r\n    gl_Position = getPositionCS(PositionWS);\r\n    gl_Position=remapPositionZ(gl_Position);\r\n}";

    var DepthNormalFS = "#define SHADER_NAME DepthNormalTextureTestFS\r\n#include \"Camera.glsl\";\r\n#include \"DepthNormalUtil.glsl\";\r\n\r\n\r\nvarying vec2 v_Texcoord0;\r\n\r\nvoid main(){\r\n    vec2 uv = vec2(v_Texcoord0.x,1.0-v_Texcoord0.y);\r\n    vec4 col = texture2D(u_CameraDepthNormalsTexture,uv);\r\n    vec3 normals;\r\n    float depth;\r\n    DecodeDepthNormal(col,depth,normals);\r\n    col = vec4(normals,1.0);\r\n    gl_FragColor = col;\r\n}";

    class DepthNormalsMaterial extends Laya.Material {
        static init() {
            var shader = Laya.Shader3D.add("DepthNormalShader", false, false);
            var subShader = new Laya.SubShader(Laya.SubShader.DefaultAttributeMap);
            shader.addSubShader(subShader);
            subShader.addShaderPass(DepthNormalVS, DepthNormalFS, "Forward");
        }
        constructor() {
            super();
            this.setShaderName("DepthNormalShader");
            this.renderModeSet();
        }
        renderModeSet() {
            this.alphaTest = false;
            this.renderQueue = Laya.Material.RENDERQUEUE_OPAQUE;
            this.depthWrite = true;
            this.cull = Laya.RenderState.CULL_BACK;
            this.blend = Laya.RenderState.BLEND_DISABLE;
            this.depthTest = Laya.RenderState.DEPTHTEST_LESS;
        }
    }

    class CameraDepthModeTextureDemo {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                Laya.Shader3D.debugMode = true;
                DepthMaterial.init();
                DepthNormalsMaterial.init();
                this.PreloadingRes();
            });
        }
        PreloadingRes() {
            var resource = ["res/threeDimen/LayaScene_depthNormalScene/Conventional/depthNormalPlane.lh",
                "res/threeDimen/LayaScene_depthNormalScene/Conventional/depthPlane.lh",
                "res/threeDimen/LayaScene_depthNormalScene/Conventional/depthscene.lh",
                "res/threeDimen/LayaScene_depthNormalScene/Conventional/Main Camera.lh",
            ];
            Laya.Laya.loader.load(resource, Laya.Handler.create(this, this.onPreLoadFinish));
        }
        onPreLoadFinish() {
            this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
            this.scene.ambientColor = new Laya.Color(0.858, 0.858, 0.858);
            this.depthNormalPlane = this.scene.addChild(Laya.Loader.createNodes("res/threeDimen/LayaScene_depthNormalScene/Conventional/depthNormalPlane.lh"));
            this.depthPlane = this.scene.addChild(Laya.Loader.createNodes("res/threeDimen/LayaScene_depthNormalScene/Conventional/depthPlane.lh"));
            this.scene.addChild(Laya.Loader.createNodes("res/threeDimen/LayaScene_depthNormalScene/Conventional/depthscene.lh"));
            var camera = this.scene.addChild(Laya.Loader.createNodes("res/threeDimen/LayaScene_depthNormalScene/Conventional/Main Camera.lh"));
            camera.depthTextureMode |= Laya.DepthTextureMode.Depth;
            this.depthPlane.getComponent(Laya.MeshRenderer).sharedMaterial = new DepthMaterial();
            camera.depthTextureMode |= Laya.DepthTextureMode.DepthNormals;
            this.depthNormalPlane.getComponent(Laya.MeshRenderer).sharedMaterial = new DepthNormalsMaterial();
        }
    }

    var EdgeEffectVS = "#define SHADER_NAME EdgeEffectVS\r\n\r\n#include \"Camera.glsl\";\r\nvarying vec2 v_Texcoord0;\r\n\r\nvoid main() {\r\n\tgl_Position = vec4(a_PositionTexcoord.xy, 0.0, 1.0);\r\n\tv_Texcoord0 = a_PositionTexcoord.zw;\r\n\tgl_Position = remapPositionZ(gl_Position);\r\n}\r\n";

    var EdgeEffectFS = "#define SHADER_NAME EdgeEffectFS\r\n#include \"DepthNormalUtil.glsl\";\r\n\r\nvarying vec2 v_Texcoord0;\r\n\r\n#ifdef DEPTHNORMAL\r\n    void getDepthNormal(out float depth, out vec3 normal){\r\n        vec4 col = texture2D(u_DepthNormalTex, v_Texcoord0);\r\n        DecodeDepthNormal(col, depth, normal);\r\n    }\r\n\r\n    float getDepth(vec2 uv) {\r\n        float depth;\r\n        vec3 normal;\r\n        vec4 col = texture2D(u_DepthNormalTex, uv);\r\n        DecodeDepthNormal(col, depth, normal);\r\n        return depth;\r\n    }\r\n\r\n    vec3 getNormal(vec2 uv) {\r\n        float depth;\r\n        vec3 normal;\r\n        vec4 col = texture2D(u_DepthNormalTex, uv);\r\n        DecodeDepthNormal(col, depth, normal);\r\n        return normal;\r\n    }\r\n\r\n#endif\r\n\r\n#ifdef DEPTH\r\n    float getDepth(vec2 uv) {\r\n        float depth = texture2D(u_DepthTex, uv).r;\r\n        depth = Linear01Depth(depth, u_DepthBufferParams);\r\n        return depth;\r\n    }\r\n#endif\r\n\r\nvoid SobelSample(in vec2 uv,out vec3 colorG, out vec3 normalG, out vec3 depthG) {\r\n\r\n    float offsetx = u_MainTex_TexelSize.x;\r\n    float offsety = u_MainTex_TexelSize.y;\r\n    vec2 offsets[9];\r\n    offsets[0] = vec2(-offsetx,  offsety); // 左上\r\n    offsets[1] = vec2( 0.0,    offsety); // 正上\r\n    offsets[2] = vec2( offsetx,  offsety); // 右上\r\n    offsets[3] = vec2(-offsetx,  0.0);   // 左\r\n    offsets[4] = vec2( 0.0,    0.0);   // 中\r\n    offsets[5] = vec2( offsetx,  0.0);   // 右\r\n    offsets[6] = vec2(-offsetx, -offsety); // 左下\r\n    offsets[7] = vec2( 0.0,   -offsety); // 正下\r\n    offsets[8] = vec2( offsetx, -offsety); // 右下\r\n\r\n    float Gx[9];\r\n    Gx[0] = -1.0; Gx[1] = 0.0; Gx[2] = 1.0; \r\n    Gx[3] = -2.0; Gx[4] = 0.0; Gx[5] = 2.0; \r\n    Gx[6] = -1.0; Gx[7] = 0.0; Gx[8] = 1.0; \r\n\r\n    float Gy[9];\r\n    Gy[0] = 1.0; Gy[1] = 2.0; Gy[2] = 1.0; \r\n    Gy[3] = 0.0; Gy[4] = 0.0; Gy[5] = 0.0; \r\n    Gy[6] = -1.0; Gy[7] = -2.0;Gy[8] = -1.0; \r\n\r\n    vec3 sampleTex[9];\r\n    float sampleDepth[9];\r\n    vec3 sampleNormal[9];\r\n    for (int i = 0; i < 9; i++)\r\n    {\r\n        vec2 uvOffset = uv + offsets[i];\r\n        sampleTex[i] = texture2D(u_MainTex, uvOffset).rgb;\r\n        sampleDepth[i] = getDepth(uvOffset);\r\n        sampleNormal[i] = (getNormal(uvOffset) + 1.0) / 2.0;\r\n    }\r\n\r\n    vec3 colorGx = vec3(0.0);\r\n    vec3 colorGy = vec3(0.0);\r\n    float depthGx = 0.0;\r\n    float depthGy = 0.0;\r\n    vec3 normalGx = vec3(0.0);\r\n    vec3 normalGy = vec3(0.0);\r\n\r\n    for (int i = 0; i < 9; i++) {\r\n        colorGx += sampleTex[i] * Gx[i];\r\n        colorGy += sampleTex[i] * Gy[i];\r\n        depthGx += sampleDepth[i] * Gx[i];\r\n        depthGy += sampleDepth[i] * Gy[i];\r\n        normalGx += sampleNormal[i] * Gx[i];\r\n        normalGy += sampleNormal[i] * Gy[i];\r\n    }\r\n\r\n    float colDepthG = abs(depthGx) + abs(depthGy);\r\n    depthG = vec3(colDepthG);\r\n\r\n    colorG = abs(colorGx) + abs(colorGy);\r\n\r\n    normalG = abs(normalGx) + abs(normalGy);\r\n\r\n}\r\n\r\nfloat ColorGray(vec3 color) {\r\n    return (color.r + color.g + color.b) / 3.0;\r\n}\r\n\r\nvec3 getEdgeValue(float hold, vec3 valueG) {\r\n    return vec3(step(hold, ColorGray(valueG)));\r\n}\r\n\r\nvoid main() {\r\n    \r\n    vec2 uv = v_Texcoord0;\r\n\r\n    vec3 colorG, normalG, depthG;\r\n    SobelSample(uv, colorG, normalG, depthG);\r\n    vec3 edgeColor = vec3(0.2);\r\n\r\n    #if defined(DEPTHEDGE)\r\n        vec3 edgeValue = getEdgeValue(u_Depthhold, depthG);\r\n    #endif\r\n\r\n    #if defined(NORMALEDGE)\r\n        vec3 edgeValue = getEdgeValue(u_NormalHold, normalG);\r\n    #endif\r\n\r\n    #if defined(COLOREDGE)\r\n        vec3 edgeValue = getEdgeValue(u_ColorHold, colorG);\r\n    #endif\r\n\r\n    vec3 fillColor = u_EdgeColor.xyz;\r\n\r\n    #ifdef SOURCE\r\n        fillColor = texture2D(u_MainTex, uv).rgb;\r\n    #endif\r\n\r\n    vec3 finalColor = mix(fillColor, edgeColor, edgeValue);\r\n    gl_FragColor = vec4(finalColor, 1.0);\r\n\r\n}";

    var EdgeMode;
    (function (EdgeMode) {
        EdgeMode[EdgeMode["ColorEdge"] = 0] = "ColorEdge";
        EdgeMode[EdgeMode["NormalEdge"] = 1] = "NormalEdge";
        EdgeMode[EdgeMode["DepthEdge"] = 2] = "DepthEdge";
    })(EdgeMode || (EdgeMode = {}));
    class EdgeEffect extends Laya.PostProcessEffect {
        static __init__() {
            EdgeEffect.DEPTHTEXTURE = Laya.Shader3D.propertyNameToID("u_DepthTex");
            EdgeEffect.DEPTHNORMALTEXTURE = Laya.Shader3D.propertyNameToID("u_DepthNormalTex");
            EdgeEffect.DEPTHBUFFERPARAMS = Laya.Shader3D.propertyNameToID("u_DepthBufferParams");
            EdgeEffect.EDGECOLOR = Laya.Shader3D.propertyNameToID("u_EdgeColor");
            EdgeEffect.COLORHOLD = Laya.Shader3D.propertyNameToID("u_ColorHold");
            EdgeEffect.DEPTHHOLD = Laya.Shader3D.propertyNameToID("u_Depthhold");
            EdgeEffect.NORMALHOLD = Laya.Shader3D.propertyNameToID("u_NormalHold");
        }
        static EdgeEffectShaderInit() {
            EdgeEffect.__init__();
            EdgeEffect.SHADERDEFINE_DEPTH = Laya.Shader3D.getDefineByName("DEPTH");
            EdgeEffect.SHADERDEFINE_DEPTHNORMAL = Laya.Shader3D.getDefineByName("DEPTHNORMAL");
            EdgeEffect.SHADERDEFINE_DEPTHEDGE = Laya.Shader3D.getDefineByName("DEPTHEDGE");
            EdgeEffect.SHADERDEFINE_NORMALEDGE = Laya.Shader3D.getDefineByName("NORMALEDGE");
            EdgeEffect.SHADERDEFINE_COLOREDGE = Laya.Shader3D.getDefineByName("COLOREDGE");
            EdgeEffect.SHADERDEFINE_SOURCE = Laya.Shader3D.getDefineByName("SOURCE");
            let attributeMap = {
                'a_PositionTexcoord': [Laya.VertexMesh.MESH_POSITION0, Laya.ShaderDataType.Vector4]
            };
            let uniformMap = {
                "u_MainTex": Laya.ShaderDataType.Texture2D,
                "u_MainTex_TexelSize": Laya.ShaderDataType.Vector4,
                "u_DepthTex": Laya.ShaderDataType.Texture2D,
                "u_DepthNormalTex": Laya.ShaderDataType.Texture2D,
                "u_DepthBufferParams": Laya.ShaderDataType.Vector4,
                "u_EdgeColor": Laya.ShaderDataType.Vector3,
                "u_ColorHold": Laya.ShaderDataType.Float,
                "u_Depthhold": Laya.ShaderDataType.Float,
                "u_NormalHold": Laya.ShaderDataType.Float,
            };
            let shader = Laya.Shader3D.add("PostProcessEdge");
            let subShader = new Laya.SubShader(attributeMap, uniformMap);
            shader.addSubShader(subShader);
            let pass = subShader.addShaderPass(EdgeEffectVS, EdgeEffectFS);
            pass.renderState.depthWrite = false;
        }
        constructor() {
            super();
            this._shader = null;
            this._shaderData = Laya.LayaGL.renderDeviceFactory.createShaderData(null);
            this._depthBufferparam = new Laya.Vector4();
            this._edgeMode = EdgeMode.NormalEdge;
            if (!EdgeEffect._isShaderInit) {
                EdgeEffect._isShaderInit = true;
                EdgeEffect.EdgeEffectShaderInit();
            }
            this._shader = Laya.Shader3D.find("PostProcessEdge");
            this.edgeColor = new Laya.Vector3(0.0, 0.0, 0.0);
            this.colorHold = 0.7;
            this.normalHold = 0.7;
            this.depthHold = 0.7;
            this.edgeMode = EdgeMode.DepthEdge;
            this.showSource = true;
        }
        get edgeColor() {
            return this._shaderData.getVector3(EdgeEffect.EDGECOLOR);
        }
        set edgeColor(value) {
            this._shaderData.setVector3(EdgeEffect.EDGECOLOR, value);
        }
        get colorHold() {
            return this._shaderData.getNumber(EdgeEffect.COLORHOLD);
        }
        set colorHold(value) {
            this._shaderData.setNumber(EdgeEffect.COLORHOLD, value);
        }
        get depthHold() {
            return this._shaderData.getNumber(EdgeEffect.DEPTHHOLD);
        }
        set depthHold(value) {
            this._shaderData.setNumber(EdgeEffect.DEPTHHOLD, value);
        }
        get normalHold() {
            return this._shaderData.getNumber(EdgeEffect.NORMALHOLD);
        }
        set normalHold(value) {
            this._shaderData.setNumber(EdgeEffect.NORMALHOLD, value);
        }
        get edgeMode() {
            return this._edgeMode;
        }
        get showSource() {
            return this._shaderData.hasDefine(EdgeEffect.SHADERDEFINE_SOURCE);
        }
        set showSource(value) {
            if (value) {
                this._shaderData.addDefine(EdgeEffect.SHADERDEFINE_SOURCE);
            }
            else {
                this._shaderData.removeDefine(EdgeEffect.SHADERDEFINE_SOURCE);
            }
        }
        set edgeMode(value) {
            this._edgeMode = value;
            switch (value) {
                case EdgeMode.ColorEdge:
                    this._shaderData.addDefine(EdgeEffect.SHADERDEFINE_COLOREDGE);
                    this._shaderData.removeDefine(EdgeEffect.SHADERDEFINE_DEPTHEDGE);
                    this._shaderData.removeDefine(EdgeEffect.SHADERDEFINE_NORMALEDGE);
                    break;
                case EdgeMode.NormalEdge:
                    this._shaderData.addDefine(EdgeEffect.SHADERDEFINE_NORMALEDGE);
                    this._shaderData.removeDefine(EdgeEffect.SHADERDEFINE_DEPTHEDGE);
                    this._shaderData.removeDefine(EdgeEffect.SHADERDEFINE_COLOREDGE);
                    break;
                case EdgeMode.DepthEdge:
                    this._shaderData.addDefine(EdgeEffect.SHADERDEFINE_DEPTHEDGE);
                    this._shaderData.removeDefine(EdgeEffect.SHADERDEFINE_COLOREDGE);
                    this._shaderData.removeDefine(EdgeEffect.SHADERDEFINE_NORMALEDGE);
                    break;
            }
        }
        render(context) {
            let cmd = context.command;
            let viewport = context.camera.viewport;
            let camera = context.camera;
            let far = camera.farPlane;
            let near = camera.nearPlane;
            let source = context.indirectTarget;
            let destination = context.destination;
            let width = viewport.width;
            let height = viewport.height;
            let renderTexture = Laya.RenderTexture.createFromPool(width, height, Laya.RenderTargetFormat.R8G8B8A8, Laya.RenderTargetFormat.DEPTH_16, false, 1);
            renderTexture.filterMode = Laya.FilterMode.Bilinear;
            if (camera.depthTextureMode == Laya.DepthTextureMode.Depth) {
                this._shaderData.addDefine(EdgeEffect.SHADERDEFINE_DEPTH);
                this._shaderData.removeDefine(EdgeEffect.SHADERDEFINE_DEPTHNORMAL);
                this._shaderData.setTexture(EdgeEffect.DEPTHTEXTURE, camera.depthTexture);
            }
            else if (camera.depthTextureMode == Laya.DepthTextureMode.DepthNormals) {
                this._shaderData.addDefine(EdgeEffect.SHADERDEFINE_DEPTHNORMAL);
                this._shaderData.removeDefine(EdgeEffect.SHADERDEFINE_DEPTH);
                this._shaderData.setTexture(EdgeEffect.DEPTHNORMALTEXTURE, camera.depthNormalTexture);
            }
            this._depthBufferparam.setValue(1.0 - far / near, far / near, (near - far) / (near * far), 1 / near);
            this._shaderData.setVector(EdgeEffect.DEPTHBUFFERPARAMS, this._depthBufferparam);
            cmd.blitScreenTriangle(source, context.destination, null, this._shader, this._shaderData, 0);
            context.deferredReleaseTextures.push(renderTexture);
        }
    }
    EdgeEffect._isShaderInit = false;

    class PostProcess_Edge {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                Laya.Shader3D.debugMode = true;
                this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D);
                this.camera = this.scene.addChild(new Laya.Camera(0, 0.2, 50));
                this.camera.addComponent(CameraMoveScript);
                this.camera.transform.position = new Laya.Vector3(0, 4, 10);
                this.camera.transform.rotation = new Laya.Quaternion(-0.2, 0, 0, 0.97);
                this.addLight();
                let res = [
                    "res/threeDimen/skinModel/dude/dude.lh",
                ];
                Laya.Laya.loader.load(res, Laya.Handler.create(this, this.onResComplate));
            });
        }
        onResComplate() {
            let sphere = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createSphere(1), "Sphere");
            this.scene.addChild(sphere);
            sphere.transform.position = new Laya.Vector3(0, 1, 0);
            let plane = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(), "Plane");
            this.scene.addChild(plane);
            plane.transform.position = new Laya.Vector3(0, -0.5, 0);
            let cube = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(1, 1, 1), "Cube");
            this.scene.addChild(cube);
            cube.transform.position = new Laya.Vector3(0, 3, 0);
            this.camera.depthTextureMode |= Laya.DepthTextureMode.DepthNormals;
            let dude = Laya.Loader.createNodes("res/threeDimen/skinModel/dude/dude.lh");
            this.scene.addChild(dude);
            dude.transform.position = new Laya.Vector3(1.5, 0, 0);
            dude.transform.rotationEuler = new Laya.Vector3(0, 180, 0);
            let postProcess = new Laya.PostProcess();
            this.camera.postProcess = postProcess;
            let edgeEffect = new EdgeEffect();
            postProcess.addEffect(edgeEffect);
            this.addUI(edgeEffect);
        }
        addLight() {
            let dirLightDirections = [new Laya.Vector3(-1, -1, -1), new Laya.Vector3(1, -1, -1)];
            let lightColor = new Laya.Color(0.6, 0.6, 0.6, 1.0);
            for (let index = 0; index < dirLightDirections.length; index++) {
                let dir = dirLightDirections[index];
                Laya.Vector3.normalize(dir, dirLightDirections[index]);
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                this.scene.addChild(directlightSprite);
                var mat = directlightSprite.transform.worldMatrix;
                mat.setForward(dirLightDirections[index]);
                directlightSprite.transform.worldMatrix = mat;
                dircom.color = lightColor;
            }
        }
        addUI(edgeEffect) {
            Laya.Laya.loader.load(["res/ui/hslider.png", "res/threeDimen/ui/button.png", "res/ui/hslider$bar.png", "res/ui/colorPicker.png"], Laya.Handler.create(this, function () {
                let colorButton = this.addButton(100, 250, 160, 30, "color edge", 20, function () {
                    edgeEffect.edgeMode = EdgeMode.ColorEdge;
                    colorSlider.visible = true;
                    normalSlider.visible = false;
                    depthSlider.visible = false;
                });
                let colorSlider = this.addSlider(100, 290, 300, 0.01, 1, 0.7, 0.01, function (value) {
                    edgeEffect.colorHold = value;
                });
                let normalFunc = function () {
                    edgeEffect.edgeMode = EdgeMode.NormalEdge;
                    colorSlider.visible = false;
                    normalSlider.visible = true;
                    depthSlider.visible = false;
                };
                let normalButton = this.addButton(100, 330, 160, 30, "normal edge", 20, normalFunc);
                let normalSlider = this.addSlider(100, 370, 300, 0.01, 1, 0.7, 0.01, function (value) {
                    edgeEffect.normalHold = value;
                });
                let depthButton = this.addButton(100, 410, 160, 30, "depth edge", 20, function () {
                    edgeEffect.edgeMode = EdgeMode.DepthEdge;
                    colorSlider.visible = false;
                    normalSlider.visible = false;
                    depthSlider.visible = true;
                });
                let depthSlider = this.addSlider(100, 450, 300, 0.01, 1, 0.7, 0.01, function (value) {
                    edgeEffect.depthHold = value;
                });
                let source = this.addButton(100, 490, 160, 30, "show source", 20, function () {
                    edgeEffect.showSource = !edgeEffect.showSource;
                });
                normalFunc();
            }));
        }
        addButton(x, y, width, height, text, size, clickFunc) {
            let button = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", text));
            button.size(width, height);
            button.labelBold = true;
            button.labelSize = size;
            button.sizeGrid = "4,4,4,4";
            button.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
            button.pos(x, y);
            button.on(Laya.Event.CLICK, this, clickFunc);
            return button;
        }
        addSlider(x, y, width, min, max, value, tick, changeFunc) {
            let slider = Laya.Laya.stage.addChild(new Laya.HSlider("res/ui/hslider.png"));
            slider.width = width;
            slider.pos(x, y);
            slider.min = min;
            slider.max = max;
            slider.value = value;
            slider.tick = tick;
            slider.changeHandler = Laya.Handler.create(this, changeFunc, [], false);
            slider.visible = false;
            return slider;
        }
    }

    class LoadGltfResource {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                Laya.Shader3D.debugMode = true;
                this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D);
                this.camera = this.scene.addChild(new Laya.Camera);
                this.camera.addComponent(CameraMoveScript);
                this.scene.ambientColor = Laya.Color.WHITE;
                this.camera.transform.position = new Laya.Vector3(0, 1, 7);
                var directionLight = this.scene.addChild(new Laya.Sprite3D());
                var directionLightCom = directionLight.addComponent(Laya.DirectionLightCom);
                directionLightCom.color = new Laya.Color(0.6, 0.6, 0.6, 1);
                var mat = directionLight.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(-1.0, -1.0, -1.0));
                directionLight.transform.worldMatrix = mat;
                Laya.Laya.loader.load("res/threeDimen/skyBox/DawnDusk/Skybox.lmat", Laya.Handler.create(this, () => {
                    let skyRender = this.scene.skyRenderer;
                    let mat = Laya.Loader.getRes("res/threeDimen/skyBox/DawnDusk/Skybox.lmat");
                    skyRender.material = mat;
                    skyRender.mesh = Laya.SkyBox.instance;
                }));
                var gltfResource = [
                    "res/threeDimen/gltf/RiggedFigure/RiggedFigure.gltf",
                    "res/threeDimen/gltf/Duck/Duck.gltf",
                    "res/threeDimen/gltf/AnimatedCube/AnimatedCube.gltf"
                ];
                Laya.Laya.loader.load(gltfResource, Laya.Handler.create(this, this.onGLTFComplate));
            });
        }
        onGLTFComplate(success) {
            if (!success) {
                console.log("gltf load failed");
                return;
            }
            var RiggedFigure = Laya.Loader.createNodes("res/threeDimen/gltf/RiggedFigure/RiggedFigure.gltf");
            this.scene.addChild(RiggedFigure);
            RiggedFigure.transform.position = new Laya.Vector3(-2, 0, 0);
            console.log("RiggedFigure: This model is licensed under a Creative Commons Attribution 4.0 International License.");
            var duck = Laya.Loader.createNodes("res/threeDimen/gltf/Duck/Duck.gltf");
            this.scene.addChild(duck);
            var cube = Laya.Loader.createNodes("res/threeDimen/gltf/AnimatedCube/AnimatedCube.gltf");
            this.scene.addChild(cube);
            cube.transform.position = new Laya.Vector3(2.5, 0.6, 0);
            cube.transform.setWorldLossyScale(new Laya.Vector3(0.6, 0.6, 0.6));
        }
    }

    var CustomInstanceVS = "#define SHADER_NAME CustomInstanceVS\r\n#include \"Camera.glsl\";\r\n#include \"Sprite3DVertex.glsl\";\r\n\r\n#include \"VertexCommon.glsl\";\r\n#include \"Color.glsl\";\r\nvarying vec4 v_Color;\r\nvoid main() {\r\n\tVertex vertex;\r\n\tgetVertexParams(vertex);\r\n\tmat4 worldMat = getWorldMatrix();\r\n\tvec3 positionWS = (worldMat *vec4(vertex.positionOS, 1.0)).xyz; \r\n\tgl_Position = getPositionCS(positionWS);\r\n\r\n    #ifdef GPU_INSTANCE\r\n\t\tv_Color = gammaToLinear(a_InstanceColor);\r\n\t#else\r\n\t\tv_Color = gammaToLinear(vec4(1.0,1.0,1.0,1.0));\r\n\t#endif\r\n\r\n\tgl_Position=remapPositionZ(gl_Position);\r\n}";

    var CustomInstanceFS = "#define SHADER_NAME CustomInstanceFS\r\n#include \"Color.glsl\";\r\n\r\nvarying vec4 v_Color;\r\n\r\nvoid main()\r\n{\r\n\tvec4 color =  v_Color;\r\n\tcolor = color;\r\n\tgl_FragColor.rgb = color.rgb;\r\n}\r\n\r\n";

    class CustomInstanceMaterial extends Laya.Material {
        static init() {
            var attributeMap = {
                'a_Position': [Laya.VertexMesh.MESH_POSITION0, Laya.ShaderDataType.Vector4],
                'a_Normal': [Laya.VertexMesh.MESH_NORMAL0, Laya.ShaderDataType.Vector3],
                'a_Texcoord0': [Laya.VertexMesh.MESH_TEXTURECOORDINATE0, Laya.ShaderDataType.Vector2],
                'a_Tangent0': [Laya.VertexMesh.MESH_TANGENT0, Laya.ShaderDataType.Vector4],
                'a_WorldMat': [Laya.VertexMesh.MESH_WORLDMATRIX_ROW0, Laya.ShaderDataType.Matrix4x4],
                'a_InstanceColor': [Laya.VertexMesh.MESH_CUSTOME0, Laya.ShaderDataType.Color],
            };
            var uniformMap = {};
            var shader = Laya.Shader3D.add("CustomInstanceMat", false);
            var subShader = new Laya.SubShader(attributeMap, uniformMap);
            shader.addSubShader(subShader);
            subShader.addShaderPass(CustomInstanceVS, CustomInstanceFS, "Forward");
        }
        constructor() {
            super();
            this.setShaderName("CustomInstanceMat");
            this.renderModeSet();
        }
        renderModeSet() {
            this.alphaTest = true;
            this.renderQueue = Laya.Material.RENDERQUEUE_OPAQUE;
            this.depthWrite = true;
            this.cull = Laya.RenderState.CULL_BACK;
            this.blend = Laya.RenderState.BLEND_DISABLE;
            this.depthTest = Laya.RenderState.DEPTHTEST_LESS;
        }
    }

    class CommandBuffer_DrawCustomInstance {
        constructor() {
            this.matrixs = [];
            this.matrixs1 = [];
            this.colors = [];
            this.colors1 = [];
            this.currentColor = [];
            this.currentMatrix = [];
            this.btype = "CommandBuffer_DrawCustomInstance";
            this.stype = 0;
            this.timer = 0;
            this.delta = 0.01;
            this.curStateIndex = 0;
            Laya.Laya.init(100, 100).then(() => {
                Laya.Stat.show();
                Laya.Shader3D.debugMode = true;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                CustomInstanceMaterial.init();
                let scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                let camera = scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.transform.position = new Laya.Vector3(14.85, 17.08, 35.89);
                camera.transform.rotation = new Laya.Quaternion(0, 0, 0, 1);
                camera.addComponent(CameraMoveScript);
                camera.clearColor = new Laya.Color(0.8, 0.4, 0.2, 1.0);
                this.mat = new CustomInstanceMaterial();
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                scene.addChild(directlightSprite);
                dircom.color = new Laya.Color(1, 1, 1, 1);
                let mat = directlightSprite.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(-1.0, -1.0, -1.0));
                directlightSprite.transform.worldMatrix = mat;
                this.createCommandBuffer(camera);
                this.loadUI();
                Laya.Laya.timer.frameLoop(1, this, this.changetwoon);
            });
        }
        createCommandBuffer(camera) {
            let buf = new Laya.CommandBuffer();
            this.createMatrixArray();
            this.materialBlock = new Laya.MaterialInstancePropertyBlock();
            this.materialBlock.setVectorArray("a_InstanceColor", this.colors1, Laya.InstanceLocation.CUSTOME0);
            this.instanceCMD = buf.drawMeshInstance(Laya.PrimitiveMesh.createSphere(0.5), 0, this.matrixs1, this.mat, 0, this.materialBlock, 900);
            camera.addCommandBuffer(Laya.CameraEventFlags.BeforeTransparent, buf);
            return;
        }
        createMatrixArray() {
            for (let i = 0; i < 30; i++) {
                for (let j = 0; j < 30; j++) {
                    let ind = j * 30 + i;
                    if (ind > 1023)
                        break;
                    this.matrixs[ind] = new Laya.Matrix4x4();
                    this.matrixs1[ind] = new Laya.Matrix4x4();
                    this.currentMatrix[ind] = new Laya.Matrix4x4();
                    Laya.Matrix4x4.createTranslate(new Laya.Vector3(i, j, 0), this.matrixs[ind]);
                    Laya.Matrix4x4.createTranslate(new Laya.Vector3(ind % 10 + 10, Math.floor(ind / 100) + 10, Math.floor(ind / 10) % 10 - 5), this.matrixs1[ind]);
                    this.colors[ind] = new Laya.Vector4(1 - i / 30.0, 1 - j / 30.0, 1.0, 1.0);
                    this.colors1[ind] = new Laya.Vector4(1 - i / 30.0, 1 - j / 30.0, 0.0, 1.0);
                    this.currentColor[ind] = new Laya.Vector4();
                }
            }
            return null;
        }
        changePositionColor(sourceColor, sourceMatrix, destColor, destMatrix, lerp) {
            var lep = lerp;
            var invert = 1 - lerp;
            for (let i = 0; i < 30; i++) {
                for (let j = 0; j < 30; j++) {
                    let ind = j * 30 + i;
                    this.currentColor[ind].setValue(sourceColor[ind].x * lep + destColor[ind].x * invert, sourceColor[ind].y * lep + destColor[ind].y * invert, sourceColor[ind].z * lep + destColor[ind].z * invert, 1.0);
                    var mat = this.currentMatrix[ind].elements;
                    var sourcemat = sourceMatrix[ind].elements;
                    var destmat = destMatrix[ind].elements;
                    mat[12] = sourcemat[12] * lep + destmat[12] * invert;
                    mat[13] = sourcemat[13] * lep + destmat[13] * invert;
                    mat[14] = sourcemat[14] * lep + destmat[14] * invert;
                }
            }
        }
        changetwoon() {
            this.timer += this.delta;
            if (this.timer < 0 || this.timer > 1) {
                this.timer = Math.round(this.timer);
                return;
            }
            this.changePositionColor(this.colors, this.matrixs, this.colors1, this.matrixs1, this.timer);
            this.instanceCMD.setWorldMatrix(this.currentMatrix);
            this.materialBlock.setVectorArray("a_InstanceColor", this.currentColor, Laya.InstanceLocation.CUSTOME0);
        }
        loadUI() {
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, function () {
                this.changeActionButton = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "切换颜色位置1"));
                this.changeActionButton.size(160, 40);
                this.changeActionButton.labelBold = true;
                this.changeActionButton.labelSize = 30;
                this.changeActionButton.sizeGrid = "4,4,4,4";
                this.changeActionButton.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.changeActionButton.pos(Laya.Laya.stage.width / 2 - this.changeActionButton.width * Laya.Browser.pixelRatio / 2, Laya.Laya.stage.height - 100 * Laya.Browser.pixelRatio);
                this.changeActionButton.on(Laya.Event.CLICK, this, this.stypeFun0);
            }));
        }
        stypeFun0(label = "颜色位置2") {
            if (++this.curStateIndex % 2 == 1) {
                this.changeActionButton.label = "颜色位置1";
                this.delta = -0.01;
            }
            else {
                this.changeActionButton.label = "颜色位置2";
                this.delta = 0.01;
            }
            label = this.changeActionButton.label;
            Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: label });
        }
    }

    class GrassCellInfo {
        constructor(maxGrassNums, cellSize, privotPos) {
            this.privotPos = new Laya.Vector3();
            this.grassHight = 5;
            this.posArray = new Float32Array(maxGrassNums * 3);
            this.size = cellSize;
            this.privotPos = privotPos;
            this.updateGrassPos();
            this.bound = new Laya.BoundBox(new Laya.Vector3(this.privotPos.x - this.size / 2, this.privotPos.y, this.privotPos.z - this.size / 2), new Laya.Vector3(this.privotPos.x + this.size / 2, this.privotPos.y + this.grassHight, this.privotPos.z + this.size / 2));
        }
        updateGrassPos() {
            let array = this.posArray;
            let orix = this.privotPos.x;
            let oriy = this.privotPos.y;
            let oriz = this.privotPos.z;
            let size = this.size / 2;
            for (let i = 0, n = this.posArray.length / 3; i < n; i += 3) {
                var x = (Math.random() * 2 - 1) * size;
                var z = (Math.random() * 2 - 1) * size;
                array[i] = x + orix;
                array[i + 1] = oriy;
                array[i + 2] = z + oriz;
            }
        }
        setDrawLevel(level) {
            this.drawlevelRatio = Math.max(1 - level, 0.0);
        }
        setGrassCellData(drawArray, offset) {
            let setLength = Math.floor(this.posArray.length / 3 * this.drawlevelRatio) * 3;
            drawArray.set(this.posArray, offset);
            return setLength + offset;
        }
    }

    var UnityGrassVS = "#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了\r\n\tprecision highp float;\r\n#else\r\n\tprecision mediump float;\r\n#endif\r\n\r\n#include \"Camera.glsl\";\r\n#include \"VertexCommon.glsl\";\r\n#include \"Scene.glsl\";\r\n\r\nvarying vec4 v_Color;\r\n\r\nvoid main() {\r\n    // Vertex vertex;\r\n    // getVertexParams(vertex);\r\n    \r\n    // uniform\r\n    vec3 baseColor = vec3(0.1, 0.5, 0.1);\r\n    float boundSize = 70.71067811865476;\r\n\r\n    // const\r\n    float minHeight = 2.0;\r\n    float maxHeight = 5.0;\r\n\r\n\r\n    vec4 aposition = getVertexPosition();\r\n    vec3 perGrassPivotPosWS = a_privotPosition;\r\n    float perGrassHeight = mix(minHeight, maxHeight, (sin(perGrassPivotPosWS.x * 23.4643 + perGrassPivotPosWS.z) * 0.45 + 0.55)) * u_grassHeight;\r\n\r\n\r\n    vec3 cameraUpWS = normalize(u_CameraUp);\r\n    vec3 cameraForwardWS = normalize(u_CameraDirection);\r\n    vec3 cameraRightWS = normalize(cross(cameraForwardWS, cameraUpWS));\r\n\r\n    //BlillBoard x\r\n    vec3 positionOS = aposition.x * cameraRightWS * u_grassWidth * (sin(perGrassPivotPosWS.x * 95.4643 + perGrassPivotPosWS.z) * 0.45 + 0.55);\r\n    //BillBoard y\r\n    positionOS += aposition.y * cameraUpWS;\r\n\r\n    // 每根草 高度\r\n    positionOS.y *= perGrassHeight;\r\n\r\n\r\n    float wind = 0.0;\r\n    wind += (sin(u_Time * u_WindAFrequency + perGrassPivotPosWS.x * u_WindATiling.x + perGrassPivotPosWS.z * u_WindATiling.y)*u_WindAWrap.x+u_WindAWrap.y) * u_WindAIntensity; //windA\r\n    wind += (sin(u_Time * u_WindBFrequency + perGrassPivotPosWS.x * u_WindBTiling.x + perGrassPivotPosWS.z * u_WindBTiling.y)*u_WindBWrap.x+u_WindBWrap.y) * u_WindBIntensity; //windB\r\n    wind += (sin(u_Time * u_WindCFrequency + perGrassPivotPosWS.x * u_WindCTiling.x + perGrassPivotPosWS.z * u_WindCTiling.y)*u_WindCWrap.x+u_WindCWrap.y) * u_WindCIntensity; //windC\r\n    wind *= a_Position.y; //wind only affect top region, don't affect root region\r\n    vec3 windOffset = cameraRightWS * wind; //swing using billboard left right direction\r\n    //风的影响\r\n    positionOS += windOffset;\r\n\r\n\r\n    vec3 viewWS = u_CameraPos - perGrassPivotPosWS;\r\n    float viewWSLength = length(viewWS);\r\n    positionOS += cameraRightWS * aposition.x * max(0.0, viewWSLength * 0.02225);\r\n\r\n    vec3 positionWS = positionOS + perGrassPivotPosWS;\r\n    vec4 position = u_ViewProjection * vec4(positionWS, 1.0);\r\n\r\n\r\n    //reset Texture \r\n    vec2 uv = (positionWS.xz-u_BoundSize.xy)/u_BoundSize.zw;\r\n    baseColor = texture2D(u_albedoTexture, uv).rgb;\r\n    \r\n    vec3 albedo = mix(u_GroundColor,baseColor,a_Position.y);\r\n\r\n    v_Color = vec4(albedo, 1.0);\r\n\r\n    gl_Position = position;\r\n    gl_Position=remapPositionZ(gl_Position);\r\n}";

    var UnityGrassFS = "#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了\r\n\tprecision highp float;\r\n#else\r\n\tprecision mediump float;\r\n#endif\r\n#include \"Scene.glsl\"\r\n\r\nvarying vec4 v_Color;\r\n\r\nvoid main() {\r\n\r\n    vec4 color = v_Color;\r\n     gl_FragColor = color;\r\n\t#ifdef FOG\r\n\t\tfloat lerpFact=clamp((1.0/gl_FragCoord.w-u_FogParams.x)/u_FogParams.y,0.0,1.0);\r\n\t\tgl_FragColor.rgb=mix(gl_FragColor.rgb,u_FogColor.rgb,lerpFact);\r\n\t#endif\r\n   \r\n}";

    class GrassMaterial extends Laya.Material {
        static __init__() {
            GrassMaterial.WINDAINTENSITY = Laya.Shader3D.propertyNameToID("u_WindAIntensity");
            GrassMaterial.WINDAFREQUECY = Laya.Shader3D.propertyNameToID("u_WindAFrequency");
            GrassMaterial.WINDATILING = Laya.Shader3D.propertyNameToID("u_WindATiling");
            GrassMaterial.WINDAWRAP = Laya.Shader3D.propertyNameToID("u_WindAWrap");
            GrassMaterial.WINDBINTENSITY = Laya.Shader3D.propertyNameToID("u_WindBIntensity");
            GrassMaterial.WINDBFREQUECY = Laya.Shader3D.propertyNameToID("u_WindBFrequency");
            GrassMaterial.WINDBTILING = Laya.Shader3D.propertyNameToID("u_WindBTiling");
            GrassMaterial.WINDBWRAP = Laya.Shader3D.propertyNameToID("u_WindBWrap");
            GrassMaterial.WINDCINTENSITY = Laya.Shader3D.propertyNameToID("u_WindCIntensity");
            GrassMaterial.WINDCFREQUECY = Laya.Shader3D.propertyNameToID("u_WindCFrequency");
            GrassMaterial.WINDCTILING = Laya.Shader3D.propertyNameToID("u_WindCTiling");
            GrassMaterial.WINDCWRAP = Laya.Shader3D.propertyNameToID("u_WindCWrap");
            GrassMaterial.GRASSHEIGHT = Laya.Shader3D.propertyNameToID("u_grassHeight");
            GrassMaterial.GRASSWIDTH = Laya.Shader3D.propertyNameToID("u_grassWidth");
            GrassMaterial.GRASSBOUND = Laya.Shader3D.propertyNameToID("u_BoundSize");
            GrassMaterial.GROUNDCOLOR = Laya.Shader3D.propertyNameToID("u_GroundColor");
            GrassMaterial.ALBEDOTEXTURE = Laya.Shader3D.propertyNameToID("u_albedoTexture");
            var attributeMap = {
                'a_Position': [Laya.VertexMesh.MESH_POSITION0, Laya.ShaderDataType.Vector4],
                'a_Normal': [Laya.VertexMesh.MESH_NORMAL0, Laya.ShaderDataType.Vector3],
                'a_privotPosition': [Laya.VertexMesh.MESH_CUSTOME0, Laya.ShaderDataType.Vector3]
            };
            var uniformMap = {
                "u_WindAIntensity": Laya.ShaderDataType.Float,
                "u_WindAFrequency": Laya.ShaderDataType.Float,
                "u_WindATiling": Laya.ShaderDataType.Vector2,
                "u_WindAWrap": Laya.ShaderDataType.Vector2,
                "u_WindBIntensity": Laya.ShaderDataType.Float,
                "u_WindBFrequency": Laya.ShaderDataType.Float,
                "u_WindBTiling": Laya.ShaderDataType.Vector2,
                "u_WindBWrap": Laya.ShaderDataType.Vector2,
                "u_WindCIntensity": Laya.ShaderDataType.Float,
                "u_WindCFrequency": Laya.ShaderDataType.Float,
                "u_WindCTiling": Laya.ShaderDataType.Vector2,
                "u_WindCWrap": Laya.ShaderDataType.Vector2,
                "u_grassHeight": Laya.ShaderDataType.Float,
                "u_grassWidth": Laya.ShaderDataType.Float,
                "u_BoundSize": Laya.ShaderDataType.Vector4,
                "u_GroundColor": Laya.ShaderDataType.Vector3,
                "u_albedoTexture": Laya.ShaderDataType.Texture2D
            };
            var shader = Laya.Shader3D.add("GrassShader", false, false);
            var subShader = new Laya.SubShader(attributeMap, uniformMap);
            shader.addSubShader(subShader);
            var pass = subShader.addShaderPass(UnityGrassVS, UnityGrassFS, "Forward");
            pass.renderState.cull = Laya.RenderState.CULL_BACK;
        }
        constructor() {
            if (!GrassMaterial.hasInited) {
                GrassMaterial.__init__();
                GrassMaterial.hasInited = true;
            }
            super();
            this.setShaderName("GrassShader");
            this.alphaTest = false;
            this.renderQueue = Laya.Material.RENDERQUEUE_OPAQUE;
            this.depthWrite = true;
            this.cull = Laya.RenderState.CULL_BACK;
            this.blend = Laya.RenderState.BLEND_DISABLE;
            this.depthTest = Laya.RenderState.DEPTHTEST_LESS;
            this.setWindA(1.77, 4, new Laya.Vector2(0.1, 0.1), new Laya.Vector2(0.5, 0.5));
            this.setWindB(0.25, 7.7, new Laya.Vector2(0.37, 3), new Laya.Vector2(0.5, 0.5));
            this.setWindC(0.125, 11.7, new Laya.Vector2(0.77, 3), new Laya.Vector2(0.5, 0.5));
            this.grassHight = 1.0;
            this.grassWidth = 1.0;
            this.grassGroundColor = new Laya.Vector3(0.25, 0.49, 0.23);
            this.grassBoundSize = new Laya.Vector4(-105, -105, 210, 210);
            this.albedoTexture = Laya.Loader.getTexture2D("res/InstancedIndirectGrassVertexColor.jpg");
        }
        setWindA(windIntensity, windFrequency, windTiling, windWrap) {
            this.shaderData.setNumber(GrassMaterial.WINDAINTENSITY, windIntensity);
            this.shaderData.setNumber(GrassMaterial.WINDAFREQUECY, windFrequency);
            this.shaderData.setVector2(GrassMaterial.WINDATILING, windTiling);
            this.shaderData.setVector2(GrassMaterial.WINDAWRAP, windWrap);
        }
        setWindB(windIntensity, windFrequency, windTiling, windWrap) {
            this.shaderData.setNumber(GrassMaterial.WINDBINTENSITY, windIntensity);
            this.shaderData.setNumber(GrassMaterial.WINDBFREQUECY, windFrequency);
            this.shaderData.setVector2(GrassMaterial.WINDBTILING, windTiling);
            this.shaderData.setVector2(GrassMaterial.WINDBWRAP, windWrap);
        }
        setWindC(windIntensity, windFrequency, windTiling, windWrap) {
            this.shaderData.setNumber(GrassMaterial.WINDCINTENSITY, windIntensity);
            this.shaderData.setNumber(GrassMaterial.WINDCFREQUECY, windFrequency);
            this.shaderData.setVector2(GrassMaterial.WINDCTILING, windTiling);
            this.shaderData.setVector2(GrassMaterial.WINDCWRAP, windWrap);
        }
        set grassHight(value) {
            this.shaderData.setNumber(GrassMaterial.GRASSHEIGHT, value);
        }
        set grassWidth(value) {
            this.shaderData.setNumber(GrassMaterial.GRASSWIDTH, value);
        }
        set grassGroundColor(value) {
            this.shaderData.setVector3(GrassMaterial.GROUNDCOLOR, value);
        }
        set grassBoundSize(value) {
            this.shaderData.setVector(GrassMaterial.GRASSBOUND, value);
        }
        set albedoTexture(value) {
            this.shaderData.setTexture(GrassMaterial.ALBEDOTEXTURE, value);
        }
    }
    GrassMaterial.hasInited = false;

    class GlassRender {
        constructor(manager, camera) {
            this.grassManager = manager;
            this.createCommandBuffer();
            this.camera = camera;
        }
        creatGrassMesh() {
            var vertexArray = new Float32Array(6 * 3);
            vertexArray[0] = -0.25;
            vertexArray[6] = 0.25;
            vertexArray[13] = 1;
            var indexArray = new Uint16Array([2, 1, 0]);
            var vertexDeclaration = Laya.VertexMesh.getVertexDeclaration("POSITION,NORMAL");
            var mesh = Laya.PrimitiveMesh._createMesh(vertexDeclaration, vertexArray, indexArray);
            return mesh;
        }
        createMaterial() {
            var mat = new GrassMaterial();
            this.grassMaterial = mat;
            return mat;
        }
        createCommandBuffer() {
            Laya.DrawMeshInstancedCMD.maxInstanceCount = 1000000;
            this.buf = new Laya.CommandBuffer();
            this.materialBlock = new Laya.MaterialInstancePropertyBlock();
            this.materialBlock.setVector3Array("a_privotPosition", this.grassManager.dataArrayBuffer, Laya.InstanceLocation.CUSTOME0);
            this.instanceCMD = this.buf.drawMeshInstance(this.creatGrassMesh(), 0, null, this.createMaterial(), 0, this.materialBlock, this.grassManager.drawArrayLength);
            return;
        }
        removeCommandBuffer() {
            this.camera.removeCommandBuffer(Laya.CameraEventFlags.BeforeTransparent, this.buf);
        }
        addCommandBuffer() {
            this.camera.addCommandBuffer(Laya.CameraEventFlags.BeforeTransparent, this.buf);
        }
        changeDrawNums() {
            this.materialBlock.setVector3Array("a_privotPosition", this.grassManager.dataArrayBuffer, Laya.InstanceLocation.CUSTOME0);
            this.instanceCMD.setDrawNums(this.grassManager.drawArrayLength);
        }
    }

    class GrassRenderManager {
        constructor(camera) {
            this.instanceCount = 1000000;
            this.grassCellsize = 10;
            this.cellMaxGrassNum = 1000;
            this.cellMipmapByDistance = 10;
            this.DrawDistance = 150;
            this.enableLevelDraw = true;
            this.subGrassByLevel = 0.1;
            this.grassMap = [];
            this.drawArrayLength = 0;
            this.drawGrassCellLeverlArray = [];
            this.drawGrassCellLeverlArray.length = this.cellMipmapByDistance;
            for (let index = 0; index < this.cellMipmapByDistance; index++) {
                this.drawGrassCellLeverlArray[index] = [];
            }
            this.drawGrassLevelNums = [];
            this.drawGrassLevelNums.length = this.cellMipmapByDistance;
            this.dataArrayBuffer = new Float32Array(this.instanceCount * 3);
            this.glassRender = new GlassRender(this, camera);
        }
        set enable(value) {
            if (value)
                this.glassRender.addCommandBuffer();
            else
                this.glassRender.removeCommandBuffer();
        }
        frustumCulling(camera) {
            for (let j = 0; j < this.drawGrassLevelNums.length; j++) {
                this.drawGrassLevelNums[j] = 0;
            }
            this.drawGrassCellNums = 0;
            let distance = this.DrawDistance;
            let levelDistance = this.DrawDistance / this.cellMipmapByDistance;
            let boundFrustum = camera.boundFrustum;
            let cameraPos = camera.transform.position;
            for (let i = 0, n = this.grassMap.length; i < n; i++) {
                let grasscell = this.grassMap[i];
                let grassDistance = Laya.Vector3.distance(grasscell.privotPos, cameraPos);
                if (grassDistance < distance) {
                    if (boundFrustum.intersects(grasscell.bound)) {
                        if (this.enableLevelDraw) {
                            let leval = Math.floor(grassDistance / levelDistance);
                            grasscell.setDrawLevel(leval * this.subGrassByLevel);
                            this.drawGrassCellLeverlArray[leval] || (this.drawGrassCellLeverlArray[leval] = {});
                            this.drawGrassCellLeverlArray[leval][this.drawGrassLevelNums[leval]] = i;
                            this.drawGrassLevelNums[leval] += 1;
                        }
                        else {
                            grasscell.setDrawLevel(0);
                            this.drawGrassCellLeverlArray[0][this.drawGrassLevelNums[0]] = i;
                            this.drawGrassLevelNums[0] += 1;
                        }
                        this.drawGrassCellNums++;
                    }
                }
            }
        }
        addGrassCell(grassPrivot) {
            let grassCell = new GrassCellInfo(this.cellMaxGrassNum, this.grassCellsize, grassPrivot);
            this.grassMap.push(grassCell);
        }
        removeGrassCell(grassCell) {
            let index = this.grassMap.indexOf(grassCell);
            let lastIndex = this.grassMap.length - 1;
            this.grassMap[index] = this.grassMap[lastIndex];
            this.grassMap.length = lastIndex;
        }
        update(caemra) {
            this.frustumCulling(caemra);
            let offset = 0;
            for (let i = 0, n = this.drawGrassLevelNums.length; i < n; i++) {
                let drawnums = this.drawGrassLevelNums[i];
                var array = this.drawGrassCellLeverlArray[i];
                for (var j = 0; j < drawnums; j++) {
                    offset = this.grassMap[array[j]].setGrassCellData(this.dataArrayBuffer, offset);
                }
            }
            this.drawArrayLength = offset / 3;
            this.glassRender.changeDrawNums();
        }
    }

    class GrassDemo {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                Laya.Shader3D.debugMode = true;
                this.PreloadingRes();
            });
        }
        PreloadingRes() {
            var resource = ["res/InstancedIndirectGrassVertexColor.jpg",
                "res/LayaScene_GrassScene/Conventional/GrassScene.ls"];
            Laya.Laya.loader.load(resource, Laya.Handler.create(this, this.onPreLoadFinish));
        }
        onPreLoadFinish() {
            Laya.Scene.open("res/LayaScene_GrassScene/Conventional/GrassScene.ls", true, null, Laya.Handler.create(this, (sce) => {
                var scene = sce.scene3D;
                this.camera = scene.addChild(new Laya.Camera(0, 0.1, 1000));
                this.camera.addComponent(CameraMoveScript);
                this.camera.clearFlag = Laya.CameraClearFlags.Sky;
                this.camera.transform.position = new Laya.Vector3(-45.56605299366802, 7.79715240971953, 9.329663960933718);
                var directionLight = scene.addChild(new Laya.Sprite3D());
                var directionLightCom = directionLight.addComponent(Laya.DirectionLightCom);
                var mat = directionLight.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(-1.0, -1.0, -1.0));
                directionLight.transform.worldMatrix = mat;
                this.grassManager = new GrassRenderManager(this.camera);
                var grasssize = this.grassManager.grassCellsize;
                for (let x = -100; x < 100; x += grasssize) {
                    for (let z = -100; z < 100; z += grasssize) {
                        this.grassManager.addGrassCell(new Laya.Vector3(x, 0, z));
                    }
                }
                this.grassManager.enable = true;
                Laya.Laya.timer.loop(1, this, this.update, [this.camera]);
            }));
        }
        update(camera) {
            this.grassManager.update(camera);
        }
    }

    class GPUCompression_ETC2 {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.transform.translate(new Laya.Vector3(0, 2, 5));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                camera.addComponent(CameraMoveScript);
                camera.clearColor = new Laya.Color(0.2, 0.2, 0.2, 1.0);
                let meshSprite = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox());
                this.mat = new Laya.UnlitMaterial();
                scene.addChild(meshSprite);
                meshSprite.meshRenderer.sharedMaterial = this.mat;
                if (!Laya.Browser.onAndroid) {
                    console.log("只有安卓支持ETC");
                    return;
                }
                Laya.Texture2D.load("res/threeDimen/texture/ETC2Test.ktx", Laya.Handler.create(this, function (texture) {
                    this.mat.albedoTexture = texture;
                }));
            });
        }
    }

    class GPUCompression_ASTC {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var camera = scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.transform.translate(new Laya.Vector3(0, 2, 5));
                camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
                camera.addComponent(CameraMoveScript);
                camera.clearColor = new Laya.Color(0.2, 0.2, 0.2, 1.0);
                let meshSprite = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox());
                this.mat = new Laya.UnlitMaterial();
                scene.addChild(meshSprite);
                meshSprite.meshRenderer.sharedMaterial = this.mat;
                if (!Laya.Browser.onAndroid && !Laya.Browser.onIOS) {
                    console.log("PC不支持ASTC纹理");
                    return;
                }
                Laya.Texture2D.load("res/threeDimen/texture/ASTC4x4Test.ktx", Laya.Handler.create(this, function (texture) {
                    this.mat.albedoTexture = texture;
                }));
            });
        }
    }

    var SeprableSSSFS = "#define SHADER_NAME SeparableSSSGasFS\r\nconst int StepRange = 3;\r\nconst int SamplerNum = 17;\r\nuniform vec4 u_kernel[17]; //兼容WGSL\r\n\r\n//uv\r\nvarying vec2 v_Texcoord0;\r\n\r\nvec4 Sample17Nums(vec2 finalStep,vec4 colorBlurred,float depthM,vec4 colorM){\r\n      for (int i = 1; i < SamplerNum; i++) {\r\n        // Fetch color and depth for current sample:\r\n        vec2 offset = v_Texcoord0 + u_kernel[i].a * finalStep;\r\n        vec4 color = texture2D(u_MainTex, offset);\r\n\r\n            // // If the difference in depth is huge, we lerp color back to \"colorM\"://深度差异过大 我们把颜色还原为原色\r\n             float depth = texture2D(u_depthTex, offset).r;\r\n             float s = clamp(300.0 * abs(depthM - depth),0.0,1.0);\r\n            color.rgb = mix(color.rgb, colorM.rgb, s);\r\n\r\n        // Accumulate:\r\n        colorBlurred.rgb += u_kernel[i].rgb * color.rgb;\r\n       \r\n    }\r\n     return colorBlurred;\r\n}\r\n\r\n\r\nvoid main()\r\n{\r\n    vec4 colorM = texture2D(u_MainTex,v_Texcoord0);\r\n\r\n    //   if (initStencil) // (Checked in compile time, it's optimized away)如果模具缓冲区不可用，请初始化该缓冲区：\r\n    //     if (SSSS_STREGTH_SOURCE == 0.0) discard;\r\n\r\n    float depthM = texture2D(u_depthTex,v_Texcoord0).r;\r\n    //计算随着depth的变化ssswidth的比例\r\n    float scale = u_distanceToProjectionWindow/depthM;\r\n    //计算像素采样步长\r\n    vec2 finalStep = u_sssWidth *scale* u_blurDir;\r\n    finalStep *=colorM.a* 0.2;\r\n\r\n    vec4 colorBlurred = colorM;\r\n\r\n    colorBlurred.rgb*=u_kernel[0].rgb;\r\n    colorBlurred = Sample17Nums(finalStep,colorBlurred,depthM,colorM);\r\n    //累计其他采样\r\n    //   for (int i = 1; i < SSSS_N_SAMPLES; i++) {\r\n    //     // Fetch color and depth for current sample:\r\n    //     float2 offset = texcoord + kernel[i].a * finalStep;\r\n    //     float4 color = SSSSSample(colorTex, offset);\r\n\r\n    //     #if SSSS_FOLLOW_SURFACE == 1\r\n    //     // If the difference in depth is huge, we lerp color back to \"colorM\":\r\n    //     float depth = SSSSSample(depthTex, offset).r;\r\n    //     float s = SSSSSaturate(300.0f * distanceToProjectionWindow *\r\n    //                            sssWidth * abs(depthM - depth));\r\n    //     color.rgb = SSSSLerp(color.rgb, colorM.rgb, s);\r\n    //     #endif\r\n\r\n    //     // Accumulate:\r\n    //     colorBlurred.rgb += kernel[i].rgb * color.rgb;\r\n    // }\r\n    gl_FragColor = colorBlurred;\r\n}\r\n\r\n";

    var SeprableSSSVS = "#define SHADER_NAME SeparableSSSGasVS\r\n#include \"Camera.glsl\";\r\nvarying vec2 v_Texcoord0;\r\n\r\nvoid main() {\t\r\n\tgl_Position = vec4(a_PositionTexcoord.xy, 0.0, 1.0);\r\n\tv_Texcoord0 = a_PositionTexcoord.zw;\r\n\tgl_Position = remapPositionZ(gl_Position);\r\n}";

    class SeparableSSS_BlitMaterial extends Laya.Material {
        static init() {
            SeparableSSS_BlitMaterial.SHADERVALUE_COLORTEX = Laya.Shader3D.propertyNameToID("u_MainTex");
            SeparableSSS_BlitMaterial.SHADERVALUE_DEPTHTEX = Laya.Shader3D.propertyNameToID("u_depthTex");
            SeparableSSS_BlitMaterial.SHADERVALUE_BLURDIR = Laya.Shader3D.propertyNameToID("u_blurDir");
            SeparableSSS_BlitMaterial.SHADERVALUE_SSSWIDTH = Laya.Shader3D.propertyNameToID("u_sssWidth");
            SeparableSSS_BlitMaterial.SHADERVALUE_DISTANCETOPROJECTIONWINDOW = Laya.Shader3D.propertyNameToID("u_distanceToProjectionWindow");
            SeparableSSS_BlitMaterial.SHADERVALUE_KENEL = Laya.Shader3D.propertyNameToID("u_kernel");
            var attributeMap = {
                'a_PositionTexcoord': [Laya.VertexMesh.MESH_POSITION0, Laya.ShaderDataType.Vector4]
            };
            var uniformMap = {
                "u_MainTex": Laya.ShaderDataType.Texture2D,
                "u_depthTex": Laya.ShaderDataType.Texture2D,
                "u_blurDir": Laya.ShaderDataType.Vector2,
                "u_sssWidth": Laya.ShaderDataType.Float,
                "u_distanceToProjectionWindow": Laya.ShaderDataType.Float,
            };
            var shader = Laya.Shader3D.add("SeparableSSS", true, true);
            var subShader = new Laya.SubShader(attributeMap, uniformMap);
            shader.addSubShader(subShader);
            var shaderpass = subShader.addShaderPass(SeprableSSSVS, SeprableSSSFS);
            var renderState = shaderpass.renderState;
            renderState = shaderpass.renderState;
            renderState.depthTest = Laya.RenderState.DEPTHTEST_ALWAYS;
            renderState.depthWrite = false;
            renderState.cull = Laya.RenderState.CULL_NONE;
            renderState.blend = Laya.RenderState.BLEND_DISABLE;
        }
        constructor() {
            super();
            this.setShaderName("SeparableSSS");
            this._fallOff = new Laya.Vector3(1.0, 0.37, 0.3);
            this._strength = new Laya.Vector3(0.48, 0.41, 0.28);
            this._nSampler = 17;
            this.sssWidth = 0.0012;
            this.kenel = this.calculateKernel(this._nSampler, this._strength, this._fallOff);
        }
        set colorTex(value) {
            this.shaderData.setTexture(SeparableSSS_BlitMaterial.SHADERVALUE_COLORTEX, value);
        }
        set blurDir(value) {
            this.shaderData.setVector2(SeparableSSS_BlitMaterial.SHADERVALUE_BLURDIR, value);
        }
        set depthTex(value) {
            this.shaderData.setTexture(SeparableSSS_BlitMaterial.SHADERVALUE_DEPTHTEX, value);
        }
        set sssWidth(value) {
            value = Math.max(value, 0);
            value = Math.min(value, 0.025);
            this.shaderData.setNumber(SeparableSSS_BlitMaterial.SHADERVALUE_SSSWIDTH, value);
        }
        set kenel(value) {
            let shaderval = new Float32Array(value.length * 4);
            for (let i = 0, n = value.length; i < n; i++) {
                let ind = i * 4;
                shaderval[ind] = value[i].x;
                shaderval[ind + 1] = value[i].y;
                shaderval[ind + 2] = value[i].z;
                shaderval[ind + 3] = value[i].w;
            }
            this.shaderData.setBuffer(SeparableSSS_BlitMaterial.SHADERVALUE_KENEL, shaderval);
        }
        set falloff(value) {
            Laya.Vector3.max(value, Laya.Vector3.ZERO, value);
            Laya.Vector3.min(value, Laya.Vector3.ONE, value);
            this._fallOff = value;
            this.kenel = this.calculateKernel(this._nSampler, this._fallOff, this._strength);
        }
        set strength(value) {
            Laya.Vector3.max(value, Laya.Vector3.ZERO, value);
            Laya.Vector3.min(value, Laya.Vector3.ONE, value);
            this._strength = value;
            this.kenel = this.calculateKernel(this._nSampler, this._fallOff, this._strength);
        }
        set nSamples(value) {
            this._nSampler = value;
            this.kenel = this.calculateKernel(this._nSampler, this._fallOff, this._strength);
        }
        set cameraFiledOfView(value) {
            let distanceToProject = 1.0 / Math.tan(0.5 * value * Laya.MathUtils3D.Deg2Rad);
            this.shaderData.setNumber(SeparableSSS_BlitMaterial.SHADERVALUE_DISTANCETOPROJECTIONWINDOW, distanceToProject);
        }
        calculateKernel(nSamples, strength, falloff) {
            let range = nSamples > 20 ? 3.0 : 2.0;
            let exponent = 2.0;
            let Kernel = new Array(nSamples);
            let step = 2.0 * range / (nSamples - 1);
            for (let i = 0; i < nSamples; i++) {
                let o = -range + i * step;
                let sign = o < 0.0 ? -1.0 : 1.0;
                Kernel[i] = new Laya.Vector4();
                Kernel[i].w = range * sign * Math.abs(Math.pow(o, exponent)) / Math.pow(range, exponent);
            }
            for (let i = 0; i < nSamples; i++) {
                let w0 = i > 0 ? Math.abs(Kernel[i].w - Kernel[i - 1].w) : 0.0;
                let w1 = i < nSamples - 1 ? Math.abs(Kernel[i].w - Kernel[i + 1].w) : 0.0;
                let area = (w0 + w1) / 2.0;
                let t = this.prefile(Kernel[i].w, falloff);
                Laya.Vector3.scale(t, area, t);
                Kernel[i].x = t.x;
                Kernel[i].y = t.y;
                Kernel[i].z = t.z;
            }
            let t = Kernel[Math.floor(nSamples / 2)];
            for (var i = Math.floor(nSamples / 2); i > 0; i--) {
                Kernel[i] = Kernel[i - 1];
            }
            Kernel[0] = t;
            let sum = new Laya.Vector3(0.0, 0.0, 0.0);
            for (let i = 0; i < nSamples; i++) {
                sum.x += Kernel[i].x;
                sum.y += Kernel[i].y;
                sum.z += Kernel[i].z;
            }
            for (let i = 0; i < nSamples; i++) {
                Kernel[i].x /= sum.x;
                Kernel[i].y /= sum.y;
                Kernel[i].z /= sum.z;
            }
            Kernel[0].x = (1.0 - strength.x) + strength.x * Kernel[0].x;
            Kernel[0].y = (1.0 - strength.y) + strength.y * Kernel[0].y;
            Kernel[0].z = (1.0 - strength.z) + strength.z * Kernel[0].z;
            for (let i = 1; i < nSamples; i++) {
                Kernel[i].x *= strength.x;
                Kernel[i].y *= strength.y;
                Kernel[i].z *= strength.z;
            }
            return Kernel;
        }
        prefile(r, falloff) {
            let falloffArray = [falloff.x, falloff.y, falloff.z];
            let v1 = this.gaussian(0.0484, r, falloffArray);
            Laya.Vector3.scale(v1, 0.100, v1);
            let v2 = this.gaussian(0.187, r, falloffArray);
            Laya.Vector3.scale(v2, 0.118, v2);
            let v3 = this.gaussian(0.567, r, falloffArray);
            Laya.Vector3.scale(v3, 0.113, v3);
            let v4 = this.gaussian(1.99, r, falloffArray);
            Laya.Vector3.scale(v4, 0.358, v4);
            let v5 = this.gaussian(7.41, r, falloffArray);
            Laya.Vector3.scale(v5, 0.078, v5);
            let vec3 = new Laya.Vector3(v1.x + v2.x + v3.x + v4.x + v5.x, v1.y + v2.y + v3.y + v4.y + v5.y, v1.z + v2.z + v3.z + v4.z + v5.z);
            return vec3;
        }
        gaussian(variance, r, falloff) {
            let g = new Laya.Vector3();
            let gg = new Array();
            for (let i = 0; i < 3; i++) {
                let rr = r / (falloff[i] + 0.001);
                gg[i] = Math.exp((-(rr * rr)) / (2.0 * variance)) / (2.0 * 3.14 * variance);
            }
            g.setValue(gg[0], gg[1], gg[2]);
            return g;
        }
    }

    var SSSSRenderVS = "#define SHADER_NAME SeparableSSSRenderVS\r\n#include \"Camera.glsl\";\r\n#include \"VertexCommon.glsl\";\r\n#include \"Sprite3DVertex.glsl\";\r\n\r\nvarying vec2 v_Texcoord0;\r\nvarying vec4 v_ScreenTexcoord;\r\n\r\nvoid main() {\r\n\tVertex vertex;\r\n\tgetVertexParams(vertex);\r\n\tmat4 worldMat = getWorldMatrix();\r\n\tvec3 positionWS = (worldMat * vec4(vertex.positionOS, 1.0)).xyz;\r\n\tgl_Position = getPositionCS(positionWS);\r\n\tgl_Position= remapPositionZ(gl_Position);\r\n\tv_Texcoord0= transformUV(a_Texcoord0, u_TilingOffset);\r\n\t//v_ScreenTexcoord =vec2((gl_Position.x/gl_Position.w+1.0)*0.5, (gl_Position.y/gl_Position.w+1.0)*0.5);\r\n\tv_ScreenTexcoord = gl_Position*0.5;\r\n\tv_ScreenTexcoord.xy = vec2(v_ScreenTexcoord.x,v_ScreenTexcoord.y)+v_ScreenTexcoord.w;\r\n\tv_ScreenTexcoord.zw = gl_Position.zw;\r\n}";

    var SSSSRenderFS = "#define SHADER_NAME SeparableSSSRenderFS\r\nvarying vec2 v_Texcoord0;\r\nvarying vec4 v_ScreenTexcoord;\r\n\r\nvoid main()\r\n{\r\n\tvec4 color;\r\n\tcolor =texture2D(sssssDiffuseTexture,v_ScreenTexcoord.xy/v_ScreenTexcoord.w)+texture2D(sssssSpecularTexture, v_ScreenTexcoord.xy/v_ScreenTexcoord.w);\r\n\r\n\tgl_FragColor = color;\r\n}\r\n\r\n";

    class SeparableSSSRenderMaterial extends Laya.Material {
        static init() {
            SeparableSSSRenderMaterial.SSSSDIFUSETEX = Laya.Shader3D.propertyNameToID("sssssDiffuseTexture");
            SeparableSSSRenderMaterial.SSSSSPECULARTEX = Laya.Shader3D.propertyNameToID("sssssSpecularTexture");
            SeparableSSSRenderMaterial.TILINGOFFSET = Laya.Shader3D.propertyNameToID("u_TilingOffset");
            var shader = Laya.Shader3D.add("SeparableRender", false, true);
            var attributeMap = {
                'a_Position': [Laya.VertexMesh.MESH_POSITION0, Laya.ShaderDataType.Vector4],
                'a_Normal': [Laya.VertexMesh.MESH_NORMAL0, Laya.ShaderDataType.Vector3],
                'a_Texcoord0': [Laya.VertexMesh.MESH_TEXTURECOORDINATE0, Laya.ShaderDataType.Vector2],
                'a_Tangent0': [Laya.VertexMesh.MESH_TANGENT0, Laya.ShaderDataType.Vector4],
            };
            var uniformMap = {
                'sssssDiffuseTexture': Laya.ShaderDataType.Texture2D,
                'sssssSpecularTexture': Laya.ShaderDataType.Texture2D,
                'u_TilingOffset': Laya.ShaderDataType.Vector4,
                'u_MvpMatrix': Laya.ShaderDataType.Matrix4x4
            };
            var subShader = new Laya.SubShader(attributeMap, uniformMap);
            shader.addSubShader(subShader);
            subShader.addShaderPass(SSSSRenderVS, SSSSRenderFS, "Forward");
        }
        constructor() {
            super();
            this.setShaderName("SeparableRender");
            this.renderModeSet();
            this.shaderData.setVector(SeparableSSSRenderMaterial.TILINGOFFSET, new Laya.Vector4(1, 1, 0, 0));
        }
        renderModeSet() {
            this.alphaTest = false;
            this.renderQueue = Laya.Material.RENDERQUEUE_TRANSPARENT;
            this.depthWrite = true;
            this.cull = Laya.RenderState.CULL_BACK;
            this.blend = Laya.RenderState.BLEND_DISABLE;
            this.depthTest = Laya.RenderState.DEPTHTEST_LESS;
        }
    }

    class SeparableSSS_RenderDemo {
        constructor() {
            this.btype = "SeparableSSS_RenderDemo";
            this.stype = 0;
            this.curStateIndex = 0;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                Laya.Shader3D.debugMode = true;
                SeparableSSS_BlitMaterial.init();
                SeparableSSSRenderMaterial.init();
                this.sssssBlitMaterail = new SeparableSSS_BlitMaterial();
                this.sssssBlitMaterail.lock = true;
                this.sssssRenderMaterial = new SeparableSSSRenderMaterial();
                this.sssssRenderMaterial.lock = true;
                this.PreloadingRes();
            });
        }
        PreloadingRes() {
            let resource = ["res/threeDimen/LayaScene_separable-sss/Conventional/separable-sss.ls",
                "res/threeDimen/LayaScene_separable-sss/Conventional/HeadBlinnphong.lh"];
            Laya.Laya.loader.load(resource, Laya.Handler.create(this, this.onPreLoadFinish));
        }
        onPreLoadFinish() {
            Laya.Scene.open("res/threeDimen/LayaScene_separable-sss/Conventional/separable-sss.ls", true, Laya.Handler.create(this, (sce) => {
                this.scene = sce.scene3D;
                this.mainCamera = this.scene.getChildByName("Main Camera");
                this.mainCamera.depthTextureMode = Laya.DepthTextureMode.Depth;
                this.mainCamera.addComponent(CameraMoveScript);
                this.blinnphongCharacter = Laya.Loader.createNodes("res/threeDimen/LayaScene_separable-sss/Conventional/HeadBlinnphong.lh");
                this.characterBlinnphongMaterial = this.blinnphongCharacter.getComponent(Laya.MeshRenderer).sharedMaterial.clone();
                this.characterBlinnphongMaterial.lock = true;
                let buf = this.createCommandBuffer(this.mainCamera, this.blinnphongCharacter.getComponent(Laya.MeshFilter).sharedMesh);
                this.mainCamera.addCommandBuffer(Laya.CameraEventFlags.BeforeForwardOpaque, buf);
                this.sssssBlitMaterail.cameraFiledOfView = this.mainCamera.fieldOfView;
                this.SSSSSCharacter = this.blinnphongCharacter.clone();
                this.SSSSSCharacter.getComponent(Laya.MeshRenderer).sharedMaterial = this.sssssRenderMaterial;
                this.scene.addChild(this.SSSSSCharacter);
                this.scene.addChild(this.blinnphongCharacter);
                this.blinnphongCharacter.active = false;
                this.loadUI();
            }));
        }
        createCommandBuffer(camera, character) {
            let oriColor = this.characterBlinnphongMaterial.getColor("u_DiffuseColor");
            let oriSpec = this.characterBlinnphongMaterial.getColor("u_MaterialSpecular");
            let buf = new Laya.CommandBuffer();
            let viewPort = camera.viewport;
            let depthTexture = Laya.RenderTexture.createFromPool(viewPort.width, viewPort.height, Laya.RenderTargetFormat.R8G8B8A8, Laya.RenderTargetFormat.DEPTH_16, false, 1, true, true);
            buf.setRenderTarget(depthTexture, true, true);
            buf.drawMesh(character, this.blinnphongCharacter.transform.worldMatrix, this.characterBlinnphongMaterial, 0, 0);
            depthTexture = depthTexture.depthStencilTexture;
            let diffuseRenderTexture = Laya.RenderTexture.createFromPool(viewPort.width, viewPort.height, Laya.RenderTargetFormat.R8G8B8A8, Laya.RenderTargetFormat.DEPTH_16, false, 1, true, true);
            buf.setRenderTarget(diffuseRenderTexture, true, true);
            buf.setShaderDataColor(this.characterBlinnphongMaterial.shaderData, Laya.BlinnPhongMaterial.ALBEDOCOLOR, oriColor);
            buf.setShaderDataColor(this.characterBlinnphongMaterial.shaderData, Laya.BlinnPhongMaterial.MATERIALSPECULAR, new Laya.Color(0.0, 0.0, 0.0, 0.0));
            buf.drawMesh(character, this.blinnphongCharacter.transform.worldMatrix, this.characterBlinnphongMaterial, 0, 0);
            let specRrenderTexture = Laya.RenderTexture.createFromPool(viewPort.width, viewPort.height, Laya.RenderTargetFormat.R8G8B8A8, Laya.RenderTargetFormat.DEPTH_16, false, 1, true, true);
            buf.setRenderTarget(specRrenderTexture, true, true);
            buf.setShaderDataColor(this.characterBlinnphongMaterial.shaderData, Laya.BlinnPhongMaterial.MATERIALSPECULAR, oriSpec);
            buf.setShaderDataColor(this.characterBlinnphongMaterial.shaderData, Laya.BlinnPhongMaterial.ALBEDOCOLOR, new Laya.Color(0.0, 0.0, 0.0, 0.0));
            buf.drawMesh(character, this.blinnphongCharacter.transform.worldMatrix, this.characterBlinnphongMaterial, 0, 0);
            buf.setShaderDataTexture(this.sssssBlitMaterail.shaderData, SeparableSSS_BlitMaterial.SHADERVALUE_DEPTHTEX, depthTexture);
            let blurRenderTexture = Laya.RenderTexture.createFromPool(viewPort.width, viewPort.height, Laya.RenderTargetFormat.R8G8B8A8, Laya.RenderTargetFormat.None, false, 1, false, true);
            buf.setShaderDataVector2(this.sssssBlitMaterail.shaderData, SeparableSSS_BlitMaterial.SHADERVALUE_BLURDIR, new Laya.Vector2(10.0, 0.0));
            buf.blitScreenQuadByMaterial(diffuseRenderTexture, blurRenderTexture, new Laya.Vector4(0, 0, 1.0, 1.0), this.sssssBlitMaterail, 0);
            buf.setShaderDataVector2(this.sssssBlitMaterail.shaderData, SeparableSSS_BlitMaterial.SHADERVALUE_BLURDIR, new Laya.Vector2(0.0, 10.0));
            buf.blitScreenQuadByMaterial(blurRenderTexture, diffuseRenderTexture, new Laya.Vector4(0.0, 0.0, 0.0, 0.0), this.sssssBlitMaterail, 0);
            buf.setGlobalTexture(Laya.Shader3D.propertyNameToID("sssssDiffuseTexture"), diffuseRenderTexture);
            this.sssssRenderMaterial.shaderData.setTexture(Laya.Shader3D.propertyNameToID("sssssSpecularTexture"), specRrenderTexture);
            this.sssssRenderMaterial.shaderData.setTexture(Laya.Shader3D.propertyNameToID("sssssDiffuseTexture"), diffuseRenderTexture);
            diffuseRenderTexture.filterMode = Laya.FilterMode.Point;
            specRrenderTexture.filterMode = Laya.FilterMode.Point;
            return buf;
        }
        loadUI() {
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, function () {
                this.changeActionButton = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "次表面散射模式"));
                this.changeActionButton.size(160, 40);
                this.changeActionButton.labelBold = true;
                this.changeActionButton.labelSize = 30;
                this.changeActionButton.sizeGrid = "4,4,4,4";
                this.changeActionButton.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.changeActionButton.pos(Laya.Laya.stage.width / 2 - this.changeActionButton.width * Laya.Browser.pixelRatio / 2, Laya.Laya.stage.height - 100 * Laya.Browser.pixelRatio);
                this.changeActionButton.on(Laya.Event.CLICK, this, this.stypeFun0);
            }));
        }
        stypeFun0(label = "次表面散射模式") {
            if (++this.curStateIndex % 2 == 1) {
                this.blinnphongCharacter.active = true;
                this.SSSSSCharacter.active = false;
                this.changeActionButton.label = "正常模式";
            }
            else {
                this.blinnphongCharacter.active = false;
                this.SSSSSCharacter.active = true;
                this.changeActionButton.label = "次表面散射模式";
            }
            label = this.changeActionButton.label;
            Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: label });
        }
    }

    class PostProcessDoF {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                Laya.Shader3D.debugMode = true;
                Laya.Laya.loader.load("res/threeDimen/LayaScene_zhuandibanben/Conventional/zhuandibanben.ls", Laya.Handler.create(this, this.onComplate));
            });
        }
        onComplate() {
            Laya.Scene.open("res/threeDimen/LayaScene_zhuandibanben/Conventional/zhuandibanben.ls", true, null, Laya.Handler.create(this, (sce) => {
                let scene = this.scene = sce.scene3D;
                Laya.Laya.stage.addChild(scene);
                let camera = this.camera = scene.getChildByName("MainCamera");
                camera.addComponent(CameraMoveScript);
                let mainCamera = scene.getChildByName("BlurCamera");
                mainCamera.removeSelf();
                camera.depthTextureMode |= Laya.DepthTextureMode.Depth;
                let postProcess = new Laya.PostProcess();
                camera.postProcess = postProcess;
                let gaussianDoF = new Laya.GaussianDoF();
                console.log(gaussianDoF);
                postProcess.addEffect(gaussianDoF);
                gaussianDoF.farStart = 1;
                gaussianDoF.farEnd = 5;
                gaussianDoF.maxRadius = 1.0;
            }));
        }
    }

    class ProstProcess_AO {
        constructor() {
            this.btype = "ProstProcess_AO";
            this.stype = 0;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.onResComplate();
            });
        }
        onResComplate() {
            this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
            var camera = this.scene.addChild(new Laya.Camera(0, 0.1, 1000));
            camera.transform.translate(new Laya.Vector3(0, 1, 5));
            camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
            camera.addComponent(CameraMoveScript);
            this.camera = camera;
            let directlightSprite = new Laya.Sprite3D();
            let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
            this.scene.addChild(directlightSprite);
            dircom.color = new Laya.Color(0.5, 0.5, 0.5, 1.0);
            var mat = directlightSprite.transform.worldMatrix;
            mat.setForward(new Laya.Vector3(-1.0, -1.0, -1.0));
            directlightSprite.transform.worldMatrix = mat;
            this.addObjectInScene(this.scene);
            this.addPostProcess(camera);
            this.loadUI();
        }
        addObjectInScene(scene) {
            let sprite = new Laya.Sprite3D();
            scene.addChild(sprite);
            let planeMesh = Laya.PrimitiveMesh.createPlane(10, 10, 1, 1);
            let plane = new Laya.MeshSprite3D(planeMesh);
            plane.meshRenderer.sharedMaterial = new Laya.BlinnPhongMaterial;
            scene.addChild(plane);
            let cubeMesh = Laya.PrimitiveMesh.createBox();
            let sphere = Laya.PrimitiveMesh.createSphere(0.3);
            let cube0 = new Laya.MeshSprite3D(cubeMesh);
            let cube1 = new Laya.MeshSprite3D(cubeMesh);
            let cube2 = new Laya.MeshSprite3D(cubeMesh);
            let cube3 = new Laya.MeshSprite3D(cubeMesh);
            let sphere0 = new Laya.MeshSprite3D(sphere);
            let sphere1 = new Laya.MeshSprite3D(sphere);
            let sphere2 = new Laya.MeshSprite3D(sphere);
            let sphere3 = new Laya.MeshSprite3D(sphere);
            cube0.meshRenderer.sharedMaterial = new Laya.BlinnPhongMaterial;
            cube1.meshRenderer.sharedMaterial = new Laya.BlinnPhongMaterial;
            cube2.meshRenderer.sharedMaterial = new Laya.BlinnPhongMaterial;
            cube3.meshRenderer.sharedMaterial = new Laya.BlinnPhongMaterial;
            sphere0.meshRenderer.sharedMaterial = new Laya.BlinnPhongMaterial;
            sphere1.meshRenderer.sharedMaterial = new Laya.BlinnPhongMaterial;
            sphere2.meshRenderer.sharedMaterial = new Laya.BlinnPhongMaterial;
            sphere3.meshRenderer.sharedMaterial = new Laya.BlinnPhongMaterial;
            sprite.addChild(cube0);
            sprite.addChild(cube1);
            sprite.addChild(cube2);
            sprite.addChild(cube3);
            sprite.addChild(sphere0);
            sprite.addChild(sphere1);
            sprite.addChild(sphere2);
            sprite.addChild(sphere3);
            cube1.transform.position = new Laya.Vector3(-1, 0, 0);
            cube2.transform.position = new Laya.Vector3(-1, 0, 1);
            cube3.transform.position = new Laya.Vector3(-1, 1, 0);
            sphere0.transform.position = new Laya.Vector3(-3, 0, 0);
            sphere1.transform.position = new Laya.Vector3(2, 0, 0);
            sphere2.transform.position = new Laya.Vector3(2, 0.5, 0);
            sphere3.transform.position = new Laya.Vector3(-1, 0, 2);
        }
        addPostProcess(camera) {
            let postProcess = new Laya.PostProcess();
            camera.postProcess = postProcess;
            this.postProcess = postProcess;
            let ao = new Laya.ScalableAO();
            ao.radius = 0.15;
            ao.aoColor = new Laya.Color(0.0, 0.0, 0.0, 0.0);
            ao.intensity = 0.5;
            postProcess.addEffect(ao);
        }
        loadUI() {
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, function () {
                this.button = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "关闭AO"));
                this.button.size(200, 40);
                this.button.labelBold = true;
                this.button.labelSize = 30;
                this.button.sizeGrid = "4,4,4,4";
                this.button.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.button.pos(Laya.Laya.stage.width / 2 - this.button.width * Laya.Browser.pixelRatio / 2, Laya.Laya.stage.height - 60 * Laya.Browser.pixelRatio);
                this.button.on(Laya.Event.CLICK, this, this.stypeFun0);
            }));
        }
        stypeFun0(label = "关闭AO") {
            var enableHDR = !!this.camera.postProcess;
            if (enableHDR) {
                this.button.label = "开启AO";
                this.camera.postProcess = null;
            }
            else {
                this.button.label = "关闭AO";
                this.camera.postProcess = this.postProcess;
            }
            label = this.button.label;
            Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: label });
        }
    }

    class StencilDemo {
        constructor() {
            this.curStateIndex = 0;
            this.btype = "StencilDemo";
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var resource = ["res/threeDimen/scene/ChangeMaterialDemo/Conventional/scene.ls", "res/threeDimen/texture/earth.png"];
                Laya.Laya.loader.load(resource, Laya.Handler.create(this, this.onPreLoadFinish));
            });
        }
        onPreLoadFinish() {
            Laya.Scene.open("res/threeDimen/scene/ChangeMaterialDemo/Conventional/scene.ls", true, null, Laya.Handler.create(this, function (sce) {
                var scene = sce.scene3D;
                var camera = scene.getChildByName("Main Camera");
                camera.depthTextureFormat = Laya.RenderTargetFormat.DEPTHSTENCIL_24_8;
                camera.addComponent(CameraMoveScript);
                let sphere = scene.getChildByName("Sphere");
                let sphereClone = sphere.clone();
                scene.addChild(sphereClone);
                let matW = sphere.getComponent(Laya.MeshRenderer).sharedMaterial;
                matW.stencilRef = 2;
                matW.stencilWrite = true;
                matW.stencilTest = Laya.RenderState.STENCILTEST_ALWAYS;
                matW.renderQueue = Laya.Material.RENDERQUEUE_OPAQUE;
                let tempVector3 = new Laya.Vector3();
                Laya.Vector3.scale(sphereClone.transform.localScale, 1.5, tempVector3);
                sphereClone.transform.localScale = tempVector3;
                let mat = new Laya.UnlitMaterial();
                mat.albedoColor = new Laya.Color(0.8, 0.5, 0.1);
                sphereClone.getComponent(Laya.MeshRenderer).sharedMaterial = mat;
                mat.stencilRef = 0;
                mat.stencilWrite = false;
                mat.stencilTest = Laya.RenderState.STENCILTEST_GEQUAL;
                mat.renderQueue = Laya.Material.RENDERQUEUE_OPAQUE + 1;
                this.stencilMat = mat;
                this.loadUI();
            }));
        }
        loadUI() {
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, function () {
                this.changeActionButton = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "Stencil开启"));
                this.changeActionButton.size(160, 40);
                this.changeActionButton.labelBold = true;
                this.changeActionButton.labelSize = 30;
                this.changeActionButton.sizeGrid = "4,4,4,4";
                this.changeActionButton.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.changeActionButton.pos(Laya.Laya.stage.width / 2 - this.changeActionButton.width * Laya.Browser.pixelRatio / 2, Laya.Laya.stage.height - 100 * Laya.Browser.pixelRatio);
                this.changeActionButton.on(Laya.Event.CLICK, this, this.stypeFun0);
            }));
        }
        stypeFun0(label = "Stencil开启") {
            if (++this.curStateIndex % 2 == 1) {
                this.changeActionButton.label = "Stencil开启";
                this.stencilMat.stencilTest = Laya.RenderState.STENCILTEST_OFF;
            }
            else {
                this.changeActionButton.label = "Stencil关闭";
                this.stencilMat.stencilTest = Laya.RenderState.STENCILTEST_GEQUAL;
            }
            label = this.changeActionButton.label;
            Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: label });
        }
    }

    class WebXRStart {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                this.PreloadingRes();
            });
        }
        PreloadingRes() {
            var resource = ["res/VRscene/Conventional/SampleScene.ls",
                "res/OculusController/controller-left.gltf",
                "res/OculusController/controller.gltf"];
            Laya.Laya.loader.load(resource, Laya.Handler.create(this, this.onPreLoadFinish));
        }
        onPreLoadFinish() {
            Laya.Scene.open("res/VRscene/Conventional/SampleScene.ls", true, null, Laya.Handler.create(this, (sce) => {
                let scene = sce.scene3D;
                this.scene = scene;
                this.camera = scene.getChildByName("Main Camera");
                this.camera.transform.rotate(new Laya.Vector3(0, 0, 0), true, false);
                this.camera.fieldOfView = 60;
                this.camera.clearColor = new Laya.Color(0.7, 0.8, 0.9, 0);
                this.camera.nearPlane = 0.01;
                this.camera.addComponent(CameraMoveScript);
                this.loadUI();
            }));
        }
        loadUI() {
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, async function () {
                this.changeActionButton = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "正常模式"));
                this.changeActionButton.size(160, 40);
                this.changeActionButton.active = await Laya.WebXRExperienceHelper.supportXR("immersive-vr");
                this.changeActionButton.labelBold = true;
                this.changeActionButton.labelSize = 30;
                this.changeActionButton.sizeGrid = "4,4,4,4";
                this.changeActionButton.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.changeActionButton.pos(Laya.Laya.stage.width / 2 - this.changeActionButton.width * Laya.Browser.pixelRatio / 2, Laya.Laya.stage.height - 100 * Laya.Browser.pixelRatio);
                this.changeActionButton.on(Laya.Event.CLICK, this, this.stypeFun);
            }));
        }
        stypeFun() {
            this.initXR();
        }
        async initXR() {
            let caInfo = new Laya.WebXRCameraInfo();
            caInfo.depthFar = this.camera.farPlane;
            caInfo.depthNear = this.camera.nearPlane;
            let webXRSessionManager = await Laya.WebXRExperienceHelper.enterXRAsync("immersive-vr", "local", caInfo);
            let webXRCameraManager = Laya.WebXRExperienceHelper.setWebXRCamera(this.camera, webXRSessionManager);
            let WebXRInput = Laya.WebXRExperienceHelper.setWebXRInput(webXRSessionManager, webXRCameraManager);
        }
    }

    class WebXRControllerDemo {
        constructor() {
            this.isLeftSelectTarget = false;
            this.isRightSelectTarget = false;
            this.rotateStrength = 0;
            this.leftTargetDistance = 3;
            this.rightTargetDistance = 3;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                this.PreloadingRes();
            });
        }
        PreloadingRes() {
            var resource = ["res/VRscene/Conventional/SampleScene.ls",
                "res/OculusController/controller-left.gltf",
                "res/OculusController/controller.gltf"];
            Laya.Laya.loader.load(resource, Laya.Handler.create(this, this.onPreLoadFinish));
        }
        onPreLoadFinish() {
            Laya.Scene.open("res/VRscene/Conventional/SampleScene.ls", true, null, Laya.Handler.create(this, (sce) => {
                let scene = sce.scene3D;
                this.camera = scene.getChildByName("Main Camera");
                this.camera.transform.rotate(new Laya.Vector3(0, 0, 0), true, false);
                this.camera.fieldOfView = 60;
                this.camera.clearColor = new Laya.Color(0.7, 0.8, 0.9, 0);
                this.camera.nearPlane = 0.01;
                this.camera.addComponent(CameraMoveScript);
                this.loadUI();
            }));
        }
        loadUI() {
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, async function () {
                this.changeActionButton = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "正常模式"));
                this.changeActionButton.size(160, 40);
                this.changeActionButton.active = await Laya.WebXRExperienceHelper.supportXR("immersive-vr");
                this.changeActionButton.labelBold = true;
                this.changeActionButton.labelSize = 30;
                this.changeActionButton.sizeGrid = "4,4,4,4";
                this.changeActionButton.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.changeActionButton.pos(Laya.Laya.stage.width / 2 - this.changeActionButton.width * Laya.Browser.pixelRatio / 2, Laya.Laya.stage.height - 100 * Laya.Browser.pixelRatio);
                this.changeActionButton.on(Laya.Event.CLICK, this, this.stypeFun);
            }));
        }
        stypeFun() {
            this.initXR();
        }
        async initXR() {
            let caInfo = new Laya.WebXRCameraInfo();
            caInfo.depthFar = this.camera.farPlane;
            caInfo.depthNear = this.camera.nearPlane;
            let webXRSessionManager = await Laya.WebXRExperienceHelper.enterXRAsync("immersive-vr", "local", caInfo);
            let webXRCameraManager = Laya.WebXRExperienceHelper.setWebXRCamera(this.camera, webXRSessionManager);
            let WebXRInput = Laya.WebXRExperienceHelper.setWebXRInput(webXRSessionManager, webXRCameraManager);
            this.bindMeshRender(WebXRInput);
        }
        bindMeshRender(webXRInput) {
            let rightControl = Laya.Laya.loader.getRes("res/OculusController/controller.gltf");
            let leftControl = Laya.Laya.loader.getRes("res/OculusController/controller-left.gltf");
            let pixelright = new Laya.PixelLineSprite3D(20, "right");
            let pixelleft = new Laya.PixelLineSprite3D(20, "left");
            this.scene.addChild(rightControl);
            this.scene.addChild(leftControl);
            this.scene.addChild(pixelright);
            this.scene.addChild(pixelleft);
            webXRInput.bindMeshNode(leftControl, Laya.WebXRInput.HANDNESS_LEFT);
            webXRInput.bindMeshNode(rightControl, Laya.WebXRInput.HANDNESS_RIGHT);
            webXRInput.bindRayNode(pixelleft, Laya.WebXRInput.HANDNESS_LEFT);
            webXRInput.bindRayNode(pixelright, Laya.WebXRInput.HANDNESS_RIGHT);
            webXRInput.getController(Laya.WebXRInput.HANDNESS_RIGHT).on(Laya.WebXRInput.EVENT_FRAMEUPDATA_WEBXRINPUT, this, this.getRightInput);
            webXRInput.getController(Laya.WebXRInput.HANDNESS_LEFT).on(Laya.WebXRInput.EVENT_FRAMEUPDATA_WEBXRINPUT, this, this.getLeftInput);
            let leftXRInput = webXRInput.getController(Laya.WebXRInput.HANDNESS_LEFT);
            leftXRInput.addButtonEvent(0, Laya.ButtonGamepad.EVENT_TOUCH_OUT, this, this.LeftbuttonEvent0);
            leftXRInput.addButtonEvent(1, Laya.ButtonGamepad.EVENT_TOUCH_STAY, this, this.LeftbuttonEvent1);
            leftXRInput.addButtonEvent(1, Laya.ButtonGamepad.EVENT_TOUCH_OUT, this, this.LeftbuttonEvent1_1);
            leftXRInput.addButtonEvent(3, Laya.ButtonGamepad.EVENT_TOUCH_OUT, this, this.LeftbuttonEvent3);
            leftXRInput.addButtonEvent(4, Laya.ButtonGamepad.EVENT_TOUCH_ENTER, this, this.LeftbuttonEvent4);
            leftXRInput.addButtonEvent(5, Laya.ButtonGamepad.EVENT_TOUCH_OUT, this, this.LeftbuttonEvent5);
            leftXRInput.addAxisEvent(1, Laya.AxiGamepad.EVENT_OUTPUT, this, this.LeftAxisEvent);
            let rightXRInput = webXRInput.getController(Laya.WebXRInput.HANDNESS_RIGHT);
            rightXRInput.addButtonEvent(0, Laya.ButtonGamepad.EVENT_PRESS_ENTER, this, this.RightbuttonEvent0);
            rightXRInput.addButtonEvent(0, Laya.ButtonGamepad.EVENT_PRESS_VALUE, this, this.rightTriggerOn);
            rightXRInput.addButtonEvent(1, Laya.ButtonGamepad.EVENT_PRESS_STAY, this, this.RightbuttonEvent1);
            rightXRInput.addButtonEvent(1, Laya.ButtonGamepad.EVENT_PRESS_OUT, this, this.RightbuttonEvent1_1);
            rightXRInput.addButtonEvent(3, Laya.ButtonGamepad.EVENT_PRESS_OUT, this, this.RightbuttonEvent3);
            rightXRInput.addButtonEvent(4, Laya.ButtonGamepad.EVENT_PRESS_ENTER, this, this.RightbuttonEvent4);
            rightXRInput.addButtonEvent(5, Laya.ButtonGamepad.EVENT_PRESS_OUT, this, this.RightbuttonEvent5);
            rightXRInput.addAxisEvent(1, Laya.AxiGamepad.EVENT_OUTPUT, this, this.RightAxisEvent);
        }
        getRightInput(rightInput) {
            var directionMod = Math.sqrt(Math.pow(rightInput.ray.direction.x, 2) + Math.pow(rightInput.ray.direction.y, 2) + Math.pow(rightInput.ray.direction.z, 2));
            var endPos = new Laya.Vector3(rightInput.ray.origin.x + Laya.Vector3.dot(rightInput.ray.direction, new Laya.Vector3(1, 0, 0)) / directionMod * this.rightTargetDistance, rightInput.ray.origin.y + Laya.Vector3.dot(rightInput.ray.direction, new Laya.Vector3(0, 1, 0)) / directionMod * this.rightTargetDistance, rightInput.ray.origin.z + Laya.Vector3.dot(rightInput.ray.direction, new Laya.Vector3(0, 0, 1)) / directionMod * this.rightTargetDistance);
            var hitRes = new Laya.HitResult();
            this.scene.physicsSimulation.rayCast(rightInput.ray, hitRes);
            if (hitRes.succeeded) {
                if (!this.isRightSelectTarget) {
                    this.rightTarget = hitRes.collider.owner;
                }
            }
            if (this.isRightSelectTarget && this.rightTarget) {
                this.rightTarget.transform.position = endPos;
                this.rightTarget.transform.rotate(new Laya.Vector3(0, 15 * this.rotateStrength, 0), false, false);
            }
        }
        getLeftInput(leftInput) {
            var directionMod = Math.sqrt(Math.pow(leftInput.ray.direction.x, 2) + Math.pow(leftInput.ray.direction.y, 2) + Math.pow(leftInput.ray.direction.z, 2));
            var endPos = new Laya.Vector3(leftInput.ray.origin.x + Laya.Vector3.dot(leftInput.ray.direction, new Laya.Vector3(1, 0, 0)) / directionMod * this.leftTargetDistance, leftInput.ray.origin.y + Laya.Vector3.dot(leftInput.ray.direction, new Laya.Vector3(0, 1, 0)) / directionMod * this.leftTargetDistance, leftInput.ray.origin.z + Laya.Vector3.dot(leftInput.ray.direction, new Laya.Vector3(0, 0, 1)) / directionMod * this.leftTargetDistance);
            var hitRes = new Laya.HitResult();
            this.scene.physicsSimulation.rayCast(leftInput.ray, hitRes);
            if (hitRes.succeeded) {
                if (!this.isLeftSelectTarget) {
                    this.leftTarget = hitRes.collider.owner;
                }
            }
            if (this.isLeftSelectTarget && this.leftTarget) {
                this.leftTarget.transform.position = endPos;
                this.leftTarget.transform.rotate(new Laya.Vector3(0, 15 * this.rotateStrength, 0), false, false);
            }
        }
        LeftbuttonEvent0() {
            console.log("left trigger");
            this.rotateStrength = 0.1;
        }
        LeftbuttonEvent1() {
            console.log("left side trigger");
            this.isLeftSelectTarget = true;
        }
        LeftbuttonEvent1_1() {
            this.isLeftSelectTarget = false;
        }
        LeftbuttonEvent3() {
            console.log("left stickPress");
        }
        LeftbuttonEvent4() {
            console.log("left key X");
            this.leftTargetDistance -= 0.5;
        }
        LeftbuttonEvent5() {
            console.log("left key Y");
            this.leftTargetDistance += 0.5;
        }
        leftTriggerOn(value) {
            this.rotateStrength = value;
        }
        LeftAxisEvent(value) {
            console.log("left Axis MOUSE_EVENT", value);
            if (this.leftTarget) {
                this.leftTarget.transform.localRotationEulerX += value.y;
                this.leftTarget.transform.localRotationEulerY += value.x;
            }
        }
        RightbuttonEvent0() {
            console.log("right trigger");
        }
        RightbuttonEvent1() {
            console.log("right side trigger");
            this.isRightSelectTarget = true;
        }
        RightbuttonEvent1_1() {
            console.log("right side trigger");
            this.isRightSelectTarget = false;
        }
        RightbuttonEvent3() {
            console.log("right stickPress");
            this.rightTarget = this.scene.getChildByName("Cube");
        }
        RightbuttonEvent4() {
            console.log("right key X");
            this.rightTargetDistance -= 0.5;
        }
        RightbuttonEvent5() {
            console.log("right key Y");
            this.rightTargetDistance += 0.5;
        }
        rightTriggerOn(value) {
            this.rotateStrength = value;
        }
        RightAxisEvent(value) {
            if (this.rightTarget) {
                this.rightTarget.transform.localRotationEulerX += value.y;
                this.rightTarget.transform.localRotationEulerY += value.x;
            }
        }
    }

    class PhysicsWorld_ConstraintSpringJoint {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                this.camera = this.scene.addChild(new Laya.Camera(0, 0.1, 100));
                this.camera.transform.translate(new Laya.Vector3(0, 3, 10));
                this.camera.addComponent(CameraMoveScript);
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                this.scene.addChild(directlightSprite);
                dircom.color = new Laya.Color(1, 1, 1, 1);
                var mat = directlightSprite.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(-1.0, -1.0, 1.0));
                directlightSprite.transform.worldMatrix = mat;
                this.addbox();
            });
        }
        addbox() {
            var box = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(1, 1, 1)));
            var transform = box.transform;
            var pos = transform.position;
            pos.setValue(0, 7, 0);
            transform.position = pos;
            box.meshRenderer.sharedMaterial = new Laya.BlinnPhongMaterial();
            var rigidBody = box.addComponent(Laya.Rigidbody3D);
            var boxShape = new Laya.BoxColliderShape(1, 1, 1);
            rigidBody.colliderShape = boxShape;
            rigidBody.mass = 10;
            rigidBody.gravity = new Laya.Vector3(0, 0, 0);
            rigidBody.isKinematic = true;
            var box2 = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(1, 1, 1)));
            var transform2 = box2.transform;
            var pos2 = transform2.position;
            pos2.setValue(0, 3, 0);
            transform2.position = pos2;
            let mat2 = new Laya.BlinnPhongMaterial();
            mat2.albedoColor = new Laya.Color(1, 0, 0, 1);
            box2.meshRenderer.sharedMaterial = mat2;
            var rigidBody2 = box2.addComponent(Laya.Rigidbody3D);
            var boxShape2 = new Laya.BoxColliderShape(1, 1, 1);
            rigidBody2.colliderShape = boxShape2;
            rigidBody2.mass = 10;
            let springJoint = box2.addComponent(Laya.SpringConstraint);
            springJoint.ownBody = rigidBody;
            springJoint.connectedBody = rigidBody2;
            springJoint.anchor = new Laya.Vector3(0, 0, 0);
            springJoint.connectAnchor = new Laya.Vector3(0, 2, 0);
            springJoint.spring = 2;
            springJoint.minDistance = 0;
            springJoint.maxDistance = 5;
            springJoint.damping = 0.5;
            Laya.Laya.stage.on(Laya.Event.CLICK, this, () => {
            });
        }
    }

    class PhysicsWorld_ConstraintHingeJoint {
        constructor() {
            this.translateW = new Laya.Vector3(0, 0, -0.2);
            this.translateS = new Laya.Vector3(0, 0, 0.2);
            this.translateA = new Laya.Vector3(-0.2, 0, 0);
            this.translateD = new Laya.Vector3(0.2, 0, 0);
            this.translateQ = new Laya.Vector3(-0.01, 0, 0);
            this.translateE = new Laya.Vector3(0.01, 0, 0);
            this.isActive = false;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                this.camera = this.scene.addChild(new Laya.Camera(0, 0.1, 100));
                this.camera.transform.translate(new Laya.Vector3(0.43343177832663077, 5.117327691614629, 13.66159209251402));
                this.camera.transform.rotationEuler = new Laya.Vector3(-18.794161595881256, 1.2857172922735671, 3.5357225315533866e-9);
                this.camSrc = this.camera.addComponent(CameraMoveScript);
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                this.scene.addChild(directlightSprite);
                dircom.color = new Laya.Color(1, 1, 1, 1);
                var mat = directlightSprite.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(-1.0, -1.0, 1.0));
                directlightSprite.transform.worldMatrix = mat;
                this.plane = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(20, 20, 10, 10)));
                var planeMat = new Laya.BlinnPhongMaterial();
                Laya.Texture2D.load("res/threeDimen/Physics/wood.jpg", Laya.Handler.create(this, function (tex) {
                    planeMat.albedoTexture = tex;
                }));
                planeMat.tilingOffset = new Laya.Vector4(2, 2, 0, 0);
                this.plane.meshRenderer.material = planeMat;
                var staticCollider = this.plane.addComponent(Laya.PhysicsCollider);
                var boxShape = new Laya.BoxColliderShape(20, 0, 20);
                staticCollider.colliderShape = boxShape;
                this.plane.active = false;
                this.addKinematicSphere();
                this.addHingeJointDoor();
            });
        }
        addKinematicSphere() {
            var mat2 = new Laya.BlinnPhongMaterial();
            Laya.Texture2D.load("res/threeDimen/Physics/plywood.jpg", Laya.Handler.create(this, function (tex) {
                mat2.albedoTexture = tex;
            }));
            mat2.albedoColor = this._albedoColor;
            var radius = 0.8;
            var sphere = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createSphere(radius)));
            sphere.meshRenderer.material = mat2;
            var pos = sphere.transform.position;
            pos.setValue(0, 0.8, 4);
            sphere.transform.position = pos;
            var rigidBody = sphere.addComponent(Laya.Rigidbody3D);
            var sphereShape = new Laya.SphereColliderShape(radius);
            rigidBody.colliderShape = sphereShape;
            rigidBody.mass = 60;
            rigidBody.linearFactor = new Laya.Vector3(1, 0, 1);
            rigidBody.isKinematic = true;
            this.kinematicSphere = sphere;
            Laya.Laya.timer.frameLoop(1, this, this.onKeyDown);
        }
        onKeyDown() {
            this.doorRig && this.doorRig.wakeUp();
            if (Laya.InputManager.hasKeyDown(Laya.Keyboard.SPACE)) {
            }
            else {
                Laya.InputManager.hasKeyDown(87) && this.kinematicSphere.transform.translate(this.translateW);
                Laya.InputManager.hasKeyDown(83) && this.kinematicSphere.transform.translate(this.translateS);
                Laya.InputManager.hasKeyDown(65) && this.kinematicSphere.transform.translate(this.translateA);
                Laya.InputManager.hasKeyDown(68) && this.kinematicSphere.transform.translate(this.translateD);
                Laya.InputManager.hasKeyDown(81) && this.kinematicSphere.transform.translate(new Laya.Vector3(0, 0.2, 0));
                Laya.InputManager.hasKeyDown(69) && this.kinematicSphere.transform.translate(new Laya.Vector3(0, -0.2, 0));
            }
        }
        addHingeJointDoor() {
            let door = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(3.5, 5.5, 0.5)));
            door.transform.position = new Laya.Vector3(0, 4, 0);
            this.doorRig = door.addComponent(Laya.Rigidbody3D);
            let doorRigShape = new Laya.BoxColliderShape(3.5, 5.5, 0.5);
            this.doorRig.colliderShape = doorRigShape;
            this.doorZhuzi = this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(1, 5.5, 0.5)));
            this.doorZhuzi.transform.position = new Laya.Vector3(3, 3.5, 0);
            let doorZhuziRig = this.doorZhuzi.addComponent(Laya.Rigidbody3D);
            doorZhuziRig.mass = 60;
            let doorZhuziRigShape = new Laya.BoxColliderShape(1, 1, 1);
            doorZhuziRig.colliderShape = doorZhuziRigShape;
            doorZhuziRig.isKinematic = true;
            let doorHingeJoint = this.doorZhuzi.addComponent(Laya.HingeConstraint);
            doorHingeJoint.ownBody = doorZhuziRig;
            doorHingeJoint.connectedBody = this.doorRig;
            doorHingeJoint.anchor = new Laya.Vector3(0, 0, 0);
            doorHingeJoint.connectAnchor = new Laya.Vector3(5, 0, 0);
            doorHingeJoint.Axis = new Laya.Vector3(0, 1, 0);
            doorHingeJoint.limit = false;
            doorHingeJoint.lowerLimit = -90;
            doorHingeJoint.uperLimit = 90;
            doorHingeJoint.motor = false;
            doorHingeJoint.targetVelocity = -1000;
            doorHingeJoint.freeSpin = true;
            doorHingeJoint.bounceness = 100;
            doorHingeJoint.bouncenMinVelocity = 1000;
        }
    }

    class PBRCoatMaterialDemo {
        constructor() {
            this.skyMatPath = "res/threeDimen/LayaScene_DamagedHelmetScene/Conventional/Assets/LayaSkyMaterial.lmat";
            this.sceneIBLTexPath = "res/threeDimen/LayaScene_DamagedHelmetScene/Conventional/Assets/DamagedHelmetScene/DamagedHelmetScene.ktx";
            this.row = 2;
            this.col = 6;
            this.offset = new Laya.Vector3(0, 1.5, 0);
            this.color = new Laya.Color(186 / 255, 110 / 255, 64 / 255, 1.0);
            Laya.Laya.init(0, 0).then(() => {
                Laya.Stat.show();
                Laya.Shader3D.debugMode = true;
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                this.initScene();
            });
        }
        initScene() {
            this.scene = new Laya.Scene3D();
            Laya.Laya.stage.addChild(this.scene);
            this.camera = new Laya.Camera(0, 0.1, 100);
            this.camera.addComponent(CameraMoveScript);
            this.camera.transform.localRotationEuler = new Laya.Vector3(-4, -180, 0);
            this.camera.transform.position = new Laya.Vector3(0.0, 0.82, 0.0);
            this.scene.addChild(this.camera);
            this.camera.clearFlag = Laya.CameraClearFlags.Sky;
            let directionLight = new Laya.Sprite3D();
            let dirLightCom = directionLight.addComponent(Laya.DirectionLightCom);
            dirLightCom.color = new Laya.Color(0.6, 0.6, 0.6);
            dirLightCom.intensity = 1.0;
            dirLightCom.lightmapBakedType = Laya.LightMode.realTime;
            directionLight.transform.position = new Laya.Vector3(5, 5, 5);
            directionLight.transform.localRotationEuler = new Laya.Vector3(-4, -180, 0);
            this.scene.addChild(directionLight);
            this.loadSkyMatAndIBLTex();
        }
        loadSkyMatAndIBLTex() {
            Laya.Material.load(this.skyMatPath, Laya.Handler.create(this, (mat) => {
                let skyRender = this.scene.skyRenderer;
                skyRender.mesh = Laya.SkyBox.instance;
                skyRender.material = mat;
                mat.exposure = 1.6;
                Laya.Laya.loader.load(this.sceneIBLTexPath, Laya.Loader.TEXTURECUBE).then((tex) => {
                    this.scene.ambientMode = Laya.AmbientMode.SphericalHarmonics;
                    this.scene.sceneReflectionProb.iblTex = tex;
                    this.addPBRCoatSphere();
                });
            }));
        }
        addPBRCoatSphere() {
            let sphereMesh = Laya.PrimitiveMesh.createSphere(0.25, 32, 32);
            const width = this.col * 0.5;
            const height = this.row * 0.5;
            for (var i = 0, n = this.col; i < n; i++) {
                for (var j = 0, m = this.row; j < m; j++) {
                    var smoothness = 0.0;
                    var metallic = 1.0;
                    if (j == 1) {
                        var state = true;
                        var coat = i / (m - 1) * (1 / this.col);
                        var coatR = 0.0;
                    }
                    else {
                        var state = false;
                        var coat = 0.0;
                        var coatR = 0.0;
                    }
                    var pos = PBRCoatMaterialDemo._tempPos;
                    pos.setValue(-width / 2 + i * width / (n - 1), height / 2 - j * height / (m - 1), 3.0);
                    Laya.Vector3.add(this.offset, pos, pos);
                    this.PBRCoatMat(sphereMesh, pos, this.scene, this.color, smoothness, metallic, coat, coatR, state);
                }
            }
        }
        PBRCoatMat(sphereMesh, position, scene, color, smoothness, metallic, coat, coatR, state) {
            var mat = new Laya.PBRStandardMaterial();
            mat.albedoColor = color;
            mat.smoothness = smoothness;
            mat.metallic = metallic;
            mat.clearCoatEnable = state;
            if (state) {
                mat.clearCoat = coat;
                mat.clearCoatRoughness = coatR;
            }
            var meshSprite = new Laya.Sprite3D();
            let meshfilter = meshSprite.addComponent(Laya.MeshFilter);
            meshfilter.sharedMesh = sphereMesh;
            let meshrender = meshSprite.addComponent(Laya.MeshRenderer);
            meshrender.sharedMaterial = mat;
            var transform = meshSprite.transform;
            transform.localPosition = position;
            scene.addChild(meshSprite);
            return mat;
        }
    }
    PBRCoatMaterialDemo._tempPos = new Laya.Vector3();

    class UI3DDemo {
        constructor() {
            this.prefabIconPath = "res/ui/prefab/ui3d.lh";
            this.prefabUIPath = "res/ui/prefab/ui3dpage.lh";
            this.avatarPath = "res/threeDimen/fbx/Danding.lh";
            this.transMode = false;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.PreloadingRes();
            });
        }
        PreloadingRes() {
            var resource = [
                "res/uvtest.png"
            ];
            Laya.Laya.loader.load(resource, Laya.Handler.create(this, this.createScene));
        }
        createScene() {
            this.scene = new Laya.Scene3D();
            Laya.Laya.stage.addChild(this.scene);
            let light = new Laya.Sprite3D();
            let lightCom = light.addComponent(Laya.DirectionLightCom);
            lightCom.intensity = 0.6;
            this.scene.addChild(light);
            let camera = new Laya.Camera(0, 0.1, 100);
            camera.addComponent(CameraMoveScript);
            camera.transform.position = new Laya.Vector3(-0.51, 2.34, 3.21);
            camera.transform.rotationEuler = new Laya.Vector3(-12, 0, 0);
            this.scene.addChild(camera);
            camera.clearFlag = Laya.CameraClearFlags.SolidColor;
            this.testCamera = camera;
            Laya.Laya.loader.load([this.avatarPath, this.prefabIconPath, this.prefabUIPath]).then(() => {
                let avatar = Laya.Laya.loader.getRes(this.avatarPath).create();
                this.scene.addChild(avatar);
                avatar.transform.position = new Laya.Vector3(0, 0, 0);
                this.createUI3DCom();
            });
        }
        createUI3DCom() {
            let sp3 = new Laya.Sprite3D();
            sp3.transform.position = new Laya.Vector3(0, 2.7, 0);
            this.scene.addChild(sp3);
            let sp3Com = sp3.addComponent(Laya.UI3D);
            sp3Com.prefab = Laya.Laya.loader.getRes(this.prefabIconPath);
            sp3Com.renderMode = Laya.MaterialRenderMode.RENDERMODE_TRANSPARENT;
            sp3Com.resolutionRate = 256;
            sp3Com.billboard = true;
            sp3Com.enableHit = false;
            let sp3UI = new Laya.Sprite3D();
            sp3UI.transform.position = new Laya.Vector3(-2, 1.5, 0);
            this.scene.addChild(sp3UI);
            let sp3UI3DCom = sp3UI.addComponent(Laya.UI3D);
            sp3UI3DCom.prefab = Laya.Laya.loader.getRes(this.prefabUIPath);
            sp3UI3DCom.renderMode = Laya.MaterialRenderMode.RENDERMODE_TRANSPARENT;
            sp3UI3DCom.resolutionRate = 256;
            sp3UI3DCom.scale = new Laya.Vector2(2, 2);
            sp3UI3DCom.billboard = true;
            sp3UI3DCom.enableHit = true;
            this.testUI3D = sp3UI3DCom;
            Laya.Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseLefeDown);
        }
        onMouseLefeDown() {
            this.transMode = !this.transMode;
            if (this.transMode) {
                this.testUI3D.cameraSpace = true;
                this.testUI3D.attachCamera = this.testCamera;
                this.testUI3D.cameraPlaneDistance = 10;
                console.log("开");
            }
            else {
                this.testUI3D.cameraSpace = false;
                console.log("关");
            }
        }
    }

    class CameraMSAADemo {
        constructor() {
            this.btype = "CameraMSAADemo";
            this.stype = 0;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.onResComplate();
            });
        }
        onResComplate() {
            this.scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
            var camera = this.scene.addChild(new Laya.Camera(0, 0.1, 1000));
            camera.transform.translate(new Laya.Vector3(0, 1, 5));
            camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
            camera.addComponent(CameraMoveScript);
            this.camera = camera;
            let directionLight = new Laya.Sprite3D();
            let dircom = directionLight.addComponent(Laya.DirectionLightCom);
            this.scene.addChild(directionLight);
            dircom.color.setValue(0.5, 0.5, 0.5, 1);
            var mat = directionLight.transform.worldMatrix;
            mat.setForward(new Laya.Vector3(-1.0, -1.0, -1.0));
            directionLight.transform.worldMatrix = mat;
            this.addObjectInScene(this.scene);
            camera.msaa = true;
            this.loadUI();
        }
        addObjectInScene(scene) {
            let sprite = new Laya.Sprite3D();
            scene.addChild(sprite);
            let planeMesh = Laya.PrimitiveMesh.createPlane(10, 10, 1, 1);
            let plane = new Laya.Sprite3D();
            let planerendere = plane.addComponent(Laya.MeshRenderer);
            let planefilter = plane.addComponent(Laya.MeshFilter);
            planefilter.sharedMesh = planeMesh;
            scene.addChild(plane);
            let cubeMesh = Laya.PrimitiveMesh.createBox();
            let sphere = Laya.PrimitiveMesh.createSphere(0.3);
            let cube0 = new Laya.Sprite3D();
            let cube0render = cube0.addComponent(Laya.MeshRenderer);
            let cube0filter = cube0.addComponent(Laya.MeshFilter);
            cube0filter.sharedMesh = cubeMesh;
            let cube1 = new Laya.Sprite3D();
            let cube1render = cube1.addComponent(Laya.MeshRenderer);
            let cube1filter = cube1.addComponent(Laya.MeshFilter);
            cube1filter.sharedMesh = cubeMesh;
            let cube2 = new Laya.Sprite3D();
            let cube2render = cube2.addComponent(Laya.MeshRenderer);
            let cube2filter = cube2.addComponent(Laya.MeshFilter);
            cube2filter.sharedMesh = cubeMesh;
            let cube3 = new Laya.Sprite3D();
            let cube3render = cube3.addComponent(Laya.MeshRenderer);
            let cube3filter = cube3.addComponent(Laya.MeshFilter);
            cube3filter.sharedMesh = cubeMesh;
            let sphere0 = new Laya.Sprite3D();
            let sphere0render = sphere0.addComponent(Laya.MeshRenderer);
            let sphere0filter = sphere0.addComponent(Laya.MeshFilter);
            sphere0filter.sharedMesh = sphere;
            let sphere1 = new Laya.Sprite3D();
            let sphere1render = sphere1.addComponent(Laya.MeshRenderer);
            let sphere1filter = sphere1.addComponent(Laya.MeshFilter);
            sphere1filter.sharedMesh = sphere;
            let sphere2 = new Laya.Sprite3D();
            let sphere2render = sphere2.addComponent(Laya.MeshRenderer);
            let sphere2filter = sphere2.addComponent(Laya.MeshFilter);
            sphere2filter.sharedMesh = sphere;
            let sphere3 = new Laya.Sprite3D();
            let sphere3render = sphere3.addComponent(Laya.MeshRenderer);
            let sphere3filter = sphere3.addComponent(Laya.MeshFilter);
            sphere3filter.sharedMesh = sphere;
            cube0render.sharedMaterial = new Laya.BlinnPhongMaterial;
            sprite.addChild(cube0);
            sprite.addChild(cube1);
            sprite.addChild(cube2);
            sprite.addChild(cube3);
            sprite.addChild(sphere0);
            sprite.addChild(sphere1);
            sprite.addChild(sphere2);
            sprite.addChild(sphere3);
            cube1.transform.position = new Laya.Vector3(-1, 0, 0);
            cube2.transform.position = new Laya.Vector3(-1, 0, 1);
            cube3.transform.position = new Laya.Vector3(-1, 1, 0);
            sphere0.transform.position = new Laya.Vector3(-3, 0, 0);
            sphere1.transform.position = new Laya.Vector3(2, 0, 0);
            sphere2.transform.position = new Laya.Vector3(2, 0.5, 0);
            sphere3.transform.position = new Laya.Vector3(-1, 0, 2);
        }
        loadUI() {
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, function () {
                this.button = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "关闭MSAA"));
                this.button.size(200, 40);
                this.button.labelBold = true;
                this.button.labelSize = 30;
                this.button.sizeGrid = "4,4,4,4";
                this.button.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.button.pos(Laya.Laya.stage.width / 2 - this.button.width * Laya.Browser.pixelRatio / 2, Laya.Laya.stage.height - 60 * Laya.Browser.pixelRatio);
                this.button.on(Laya.Event.CLICK, this, this.stypeFun0);
            }));
        }
        stypeFun0(label = "关闭MSAA") {
            var enableHDR = !!this.camera.msaa;
            if (enableHDR) {
                this.button.label = "开启MSAA";
                this.camera.msaa = false;
            }
            else {
                this.button.label = "关闭MSAA";
                this.camera.msaa = true;
            }
            label = this.button.label;
            Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: label });
        }
    }

    class LodDemo {
        constructor() {
            this.lodScenePath = "res/LOD/LodDemo.ls";
            this.startPos = new Laya.Vector3(0, 0, 0);
            this.startDir = new Laya.Vector3();
            this.farDistance = 20;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                Laya.Scene.open(this.lodScenePath).then((scene) => {
                    this.scene = scene;
                    this.camera = this.scene.scene3D.getChildByName("Main Camera");
                    this.startPos = this.camera.transform.position.clone();
                    this.camera.transform.getForward(this.startDir);
                    let oriSprite = this.scene.scene3D._children[3];
                    let posOffScale = 3;
                    for (var i = 0; i < 3; i++) {
                        for (var j = 0; j < 3; j++) {
                            let cloneSprite = oriSprite.clone();
                            cloneSprite.transform.position = new Laya.Vector3(-(i + 1) * posOffScale, 0, -(j + 1) * posOffScale);
                            cloneSprite.transform.setWorldLossyScale(oriSprite.transform.getWorldLossyScale());
                            this.scene.scene3D.addChild(cloneSprite);
                        }
                    }
                    this.addUI();
                });
            });
        }
        addUI() {
            Laya.Laya.loader.load("res/ui/vscroll.png").then(() => {
                this.placeVSlider();
            });
        }
        placeVSlider() {
            this.vs = new Laya.VSlider();
            Laya.Laya.stage.addChild(this.vs);
            this.vs.skin = "res/ui/vscroll.png";
            this.vs.height = 500;
            this.vs.right = 100;
            this.vs.centerY = 0;
            this.vs.min = 0;
            this.vs.max = 100;
            this.vs.value = 0;
            this.vs.tick = 1;
            this.vs.changeHandler = new Laya.Handler(this, this.sliderChange);
        }
        sliderChange(value) {
            let factor = value / 100;
            let tempV3 = Laya.Vector3.TEMP;
            this.startDir.cloneTo(tempV3);
            tempV3.scale(-factor * this.farDistance, tempV3);
            tempV3.vadd(this.startPos, tempV3);
            this.camera.transform.position = tempV3;
        }
    }

    class VolumetricGIDemo {
        constructor() {
            this.GIScenePath = "res/VolumeGI/volumeGIScene.ls";
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                Laya.Scene.open(this.GIScenePath).then((res) => {
                    this.scene3D = res.scene3D;
                });
            });
        }
    }

    class FogDemo {
        constructor() {
            this.fogScenePath = "res/fog/fogScene.ls";
            this.speed = 0.5;
            this.pos = new Laya.Vector3(0, 0, 0);
            this.targetPos = new Laya.Vector3(20.3, 19.0, 20.6);
            this.direction = new Laya.Vector3(1, 1, 1);
            this.dirFactor = new Laya.Vector3(1, 1, 1);
            this.lastValue = 0;
            this.lerpFactor = 0.1;
            this.changePos = false;
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Scene.open(this.fogScenePath).then((scene) => {
                    this.scene = scene;
                    this.scene3D = scene.scene3D;
                    this.camera = this.scene.scene3D.getChildByName("Main Camera");
                    this.loadUI();
                });
            });
        }
        loadUI() {
            this.placeVSlider();
            Laya.Laya.timer.frameLoop(1, this, this.update);
            Laya.Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(this, function () {
                this.fogEnableBTN = Laya.Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", "关闭雾效"));
                this.fogEnableBTN.size(200, 40);
                this.fogEnableBTN.labelBold = true;
                this.fogEnableBTN.labelSize = 30;
                this.fogEnableBTN.sizeGrid = "4,4,4,4";
                this.fogEnableBTN.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
                this.fogEnableBTN.pos(Laya.Laya.stage.width / 2 - this.fogEnableBTN.width * Laya.Browser.pixelRatio / 2, Laya.Laya.stage.height - 60 * Laya.Browser.pixelRatio);
                this.fogEnableBTN.on(Laya.Event.CLICK, this, this.fogEnable);
            }));
        }
        update() {
            if (this.changePos) {
                Laya.Vector3.lerp(this.camera.transform.position, this.targetPos, this.lerpFactor, this.pos);
                this.camera.transform.position = this.pos;
                this.changePos = false;
            }
        }
        placeVSlider() {
            this.vs = new Laya.VSlider();
            Laya.Laya.stage.addChild(this.vs);
            this.vs.skin = "res/ui/vscroll.png";
            this.vs.height = 500;
            this.vs.right = 100;
            this.vs.centerY = 0;
            this.vs.min = 0;
            this.vs.max = 100;
            this.vs.value = 0;
            this.vs.tick = 1;
            this.vs.changeHandler = new Laya.Handler(this, this.sliderChanged);
        }
        fogEnable() {
            if (this.scene3D.enableFog) {
                this.fogEnableBTN.label = "开启雾效";
            }
            else {
                this.fogEnableBTN.label = "关闭雾效";
            }
            this.scene3D.enableFog = !this.scene3D.enableFog;
        }
        sliderChanged(value) {
            this.changePos = true;
            this.camera.transform.getForward(this.direction);
            if (value >= this.lastValue) {
                this.dirFactor.setValue(-1, -1, -1);
                Laya.Vector3.multiply(this.direction, this.dirFactor, this.direction);
                this.direction.x += this.speed;
                this.direction.y += this.speed;
                this.direction.z += this.speed;
            }
            else {
                this.dirFactor.setValue(1, 1, 1);
                Laya.Vector3.multiply(this.direction, this.dirFactor, this.direction);
                this.direction.x -= this.speed;
                this.direction.y -= this.speed;
                this.direction.z -= this.speed;
            }
            Laya.Vector3.add(this.camera.transform.position, this.direction, this.targetPos);
            this.lastValue = value;
        }
        destroy() {
            Laya.Laya.timer.clear(this, this.update);
        }
    }

    class BlendShapeDemo {
        constructor() {
            this.morpheTargetPath = "res/threeDimen/gltf/morphstress/MorphStressTest.gltf";
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                Laya.Laya.loader.load([this.morpheTargetPath, "res/ui/hslider.png"]).then(() => {
                    this.morpheTarget = Laya.Laya.loader.getRes(this.morpheTargetPath).create();
                    this.initScene();
                });
            });
        }
        initScene() {
            let scene = new Laya.Scene3D();
            Laya.Laya.stage.addChild(scene);
            let camera = new Laya.Camera(0, 0.1, 100);
            camera.transform.position = new Laya.Vector3(0, 1, 5);
            scene.addChild(camera);
            let dirLight = new Laya.Sprite3D();
            let dirLightCom = dirLight.addComponent(Laya.DirectionLightCom);
            scene.addChild(dirLight);
            scene.addChild(this.morpheTarget);
            let ani = this.morpheTarget.getComponent(Laya.Animator);
            ani.speed = 0;
            this.placeHSlider();
            this.placeHSlider1();
        }
        placeHSlider() {
            var hs = new Laya.HSlider();
            hs.skin = "res/ui/hslider.png";
            hs.width = 300;
            hs.right = 200;
            hs.top = 200;
            hs.min = 0;
            hs.max = 1;
            hs.value = 0.1;
            hs.tick = 0.01;
            hs.changeHandler = new Laya.Handler(this, this.onChange);
            Laya.Laya.stage.addChild(hs);
        }
        placeHSlider1() {
            var hs1 = new Laya.HSlider();
            hs1.skin = "res/ui/hslider.png";
            hs1.width = 300;
            hs1.right = 200;
            hs1.top = 300;
            hs1.min = 0;
            hs1.max = 1;
            hs1.value = 0.1;
            hs1.tick = 0.01;
            hs1.changeHandler = new Laya.Handler(this, this.onChange1);
            Laya.Laya.stage.addChild(hs1);
        }
        onChange(value) {
            var skin = this.morpheTarget.getChildAt(0);
            var skinRender = skin.getComponent(Laya.MeshRenderer);
            skinRender.setMorphChannelWeight("Key 1", value);
        }
        onChange1(value) {
            var skin = this.morpheTarget.getChildAt(0);
            var skinRender = skin.getComponent(Laya.MeshRenderer);
            skinRender.setMorphChannelWeight("Key 4", value);
        }
    }

    class PostProcess_LensFlare {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                var scene = Laya.Laya.stage.addChild(new Laya.Scene3D());
                var skyRenderer = scene.skyRenderer;
                skyRenderer.mesh = Laya.SkyDome.instance;
                let skymat = new Laya.SkyProceduralMaterial();
                skymat.sunDisk = Laya.SkyProceduralMaterial.SUN_HIGH_QUALITY;
                skyRenderer.material = skymat;
                var camera = scene.addChild(new Laya.Camera(0, 0.1, 100));
                camera.addComponent(CameraMoveScript);
                camera.clearFlag = Laya.CameraClearFlags.Sky;
                let directlightSprite = new Laya.Sprite3D();
                let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
                scene.addChild(directlightSprite);
                var mat = directlightSprite.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(1, -1, 0));
                directlightSprite.transform.worldMatrix = mat;
                camera.transform.rotationEuler = new Laya.Vector3(34.9, 107.24, 0);
                camera.transform.position = new Laya.Vector3(4.92, -0.74, -3.6);
                Laya.Laya.loader.load(["res/threeDimen/skinModel/dude/dude.lh", "res/lensFlare/1.png", "res/lensFlare/2.png", "res/lensFlare/3.png", "res/lensFlare/7.png", "res/lensFlare/8.png", "res/lensFlare/9.png"], Laya.Handler.create(this, () => {
                    var dude = scene.addChild(Laya.Loader.createNodes("res/threeDimen/skinModel/dude/dude.lh"));
                    dude.transform.rotate(new Laya.Vector3(0, 3.14, 0));
                    let tex1 = Laya.Laya.loader.getRes("res/lensFlare/1.png");
                    let tex2 = Laya.Laya.loader.getRes("res/lensFlare/2.png");
                    let tex3 = Laya.Laya.loader.getRes("res/lensFlare/3.png");
                    let tex7 = Laya.Laya.loader.getRes("res/lensFlare/7.png");
                    let tex8 = Laya.Laya.loader.getRes("res/lensFlare/8.png");
                    let tex9 = Laya.Laya.loader.getRes("res/lensFlare/9.png");
                    let postprocess = camera.postProcess = new Laya.PostProcess();
                    let lensFlare = new Laya.LensFlareEffect();
                    postprocess.addEffect(lensFlare);
                    lensFlare.bindLight = directlightSprite.getComponent(Laya.DirectionLightCom);
                    let lensElement = new Laya.LensFlareElement();
                    lensElement.texture = tex1;
                    lensElement.startPosition = 0.0;
                    lensElement.angularOffset = 0.0;
                    lensElement.rotation = 0.0;
                    lensElement.scale = new Laya.Vector2(24.8, 24.8);
                    lensElement.positionOffset = new Laya.Vector2(0, 0);
                    lensElement.intensity = 1.4;
                    let lensElement2 = new Laya.LensFlareElement();
                    lensElement2.texture = tex2;
                    lensElement2.startPosition = 0.5;
                    lensElement2.angularOffset = 0;
                    lensElement2.rotation = 27.3;
                    lensElement2.autoRotate = true;
                    lensElement2.scale = new Laya.Vector2(22.3, 22.3);
                    lensElement2.positionOffset = new Laya.Vector2(0, 0);
                    lensElement2.intensity = 2.39;
                    let lensElement7 = new Laya.LensFlareElement();
                    lensElement7.texture = tex7;
                    lensElement7.startPosition = 0.69;
                    lensElement7.angularOffset = 0.0;
                    lensElement7.rotation = 0.0;
                    lensElement7.positionOffset = new Laya.Vector2(0, 0);
                    lensElement7.scale = new Laya.Vector2(2.73, 2.73);
                    lensElement7.intensity = 0.76;
                    let lensElement7_1 = new Laya.LensFlareElement();
                    lensElement7_1.texture = tex7;
                    lensElement7_1.startPosition = 0.85;
                    lensElement7_1.angularOffset = 0.0;
                    lensElement7_1.positionOffset = new Laya.Vector2(0, 0);
                    lensElement7_1.rotation = 0;
                    lensElement7_1.scale = new Laya.Vector2(2.73, 2.73);
                    lensElement7_1.scale = new Laya.Vector2(1.9, 1.9);
                    lensElement7_1.intensity = 0.59;
                    let lensElement3 = new Laya.LensFlareElement();
                    lensElement3.texture = tex3;
                    lensElement3.startPosition = 1.04;
                    lensElement3.angularOffset = 0.0;
                    lensElement3.positionOffset = new Laya.Vector2(0, 0);
                    lensElement3.rotation = 107.4;
                    lensElement3.autoRotate = true;
                    lensElement3.scale = new Laya.Vector2(7.5, 7.5);
                    lensElement3.intensity = 0.85;
                    let lensElement9 = new Laya.LensFlareElement();
                    lensElement9.texture = tex9;
                    lensElement9.angularOffset = 0.0;
                    lensElement9.startPosition = 0.76;
                    lensElement9.rotation = 0;
                    lensElement9.positionOffset = new Laya.Vector2(0, 0);
                    lensElement9.scale = new Laya.Vector2(2.71, 2.71);
                    lensElement9.intensity = 0.35;
                    let lensElement8 = new Laya.LensFlareElement();
                    lensElement8.texture = tex8;
                    lensElement8.angularOffset = 0.0;
                    lensElement8.startPosition = 0.31;
                    lensElement8.positionOffset = new Laya.Vector2(0, 0);
                    lensElement8.rotation = 0;
                    lensElement8.scale = new Laya.Vector2(2.35, 2.35);
                    lensElement8.intensity = 0.44;
                    let lensData = new Laya.LensFlareData();
                    lensData.elements.push(lensElement);
                    lensData.elements.push(lensElement2);
                    lensData.elements.push(lensElement7);
                    lensData.elements.push(lensElement7_1);
                    lensData.elements.push(lensElement3);
                    lensData.elements.push(lensElement9);
                    lensData.elements.push(lensElement8);
                    lensFlare.lensFlareData = lensData;
                    lensFlare.effectIntensity = 0.4;
                    lensFlare.effectScale = 1.0;
                }));
            });
        }
    }

    class NavMeshDemo {
        constructor() {
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                Laya.Scene.open("res/navMesh/navMeshScene.ls").then((sce) => {
                    this.scene = sce;
                    this.scene3D = sce.scene3D;
                    this.addScript();
                });
            });
        }
        addScript() {
            this.camera = this.scene3D.getChildByName("Main Camera");
            this.camera.addComponent(CameraMoveScript);
            this.camera.addComponent(CameraClick);
            this.navGemo = this.scene3D.getChildByName("Geometry");
            this.navGemo.addComponent(NavMeshScript);
        }
    }
    const tempV = new Laya.Vector3();
    class NavMeshScript extends Laya.Script {
        getAllComplete(node, outs, componentType) {
            let comp = node.getComponent(componentType);
            if (comp != null)
                outs.unshift(comp);
            for (var i = 0, n = node.numChildren; i < n; i++) {
                this.getAllComplete(node.getChildAt(i), outs, componentType);
            }
        }
        onStart() {
            this._angents = [];
            this.getAllComplete(this.owner.scene, this._angents, Laya.NavAgent);
            this._scene = this.owner.scene;
            this.camera = this._scene.getChildByName("Main Camera");
            this._lineSprite = new Laya.PixelLineSprite3D(100000);
            let suface = this.owner.getComponent(Laya.NavMeshSurface);
            this.showDebugMesh(suface);
            let click = this.camera.getComponent(CameraClick);
            if (click) {
                click.clickHandler = Laya.Handler.create(this, this.stageClickHandler, null, false);
            }
        }
        stageClickHandler(pos) {
            console.log(pos);
            this._angents.forEach((agent) => {
                agent.destination = pos;
            });
        }
        showDebugMesh(suface) {
            let navMesh = suface.navMesh;
            let debugMesh = navMesh.buildDebugMesh();
            var navSprite = new Laya.Sprite3D();
            let navSpriterender = navSprite.addComponent(Laya.MeshRenderer);
            let navSpritefilter = navSprite.addComponent(Laya.MeshFilter);
            this._scene.addChild(navSprite);
            let mat = new Laya.UnlitMaterial();
            mat.materialRenderMode = Laya.MaterialRenderMode.RENDERMODE_TRANSPARENT;
            mat.albedoColor = new Laya.Color(0, 0.75, 1, 0.3);
            navSpriterender.material = mat;
            Laya.Vector3.lerp(suface.min, suface.max, 0.5, tempV);
            navSprite.transform.position = tempV;
            let tiles = suface._oriTiles;
            for (var j = 0, n1 = tiles.length; j < n1; j++) {
                this.drawBoundingBox(this._lineSprite, tiles.getNavData(j).boundMin, tiles.getNavData(j).boundMax, Laya.Color.RED);
            }
            this.drawBoundingBox(this._lineSprite, suface.min, suface.max, Laya.Color.GREEN);
        }
        drawBoundingBox(lineSprite3D, min, max, color) {
            let corners = [];
            corners.push(min.clone());
            let p = min.clone();
            p.z = max.z;
            corners.push(p);
            p = max.clone();
            p.y = min.y;
            corners.push(p);
            p = min.clone();
            p.x = max.x;
            corners.push(p);
            p = min.clone();
            p.y = max.y;
            corners.push(p);
            p = min.clone();
            p.z = max.z;
            p.y = max.y;
            corners.push(p);
            p = max.clone();
            corners.push(p);
            p = min.clone();
            p.x = max.x;
            p.y = max.y;
            corners.push(p);
            lineSprite3D.addLine(corners[0], corners[1], color, color);
            lineSprite3D.addLine(corners[1], corners[2], color, color);
            lineSprite3D.addLine(corners[2], corners[3], color, color);
            lineSprite3D.addLine(corners[3], corners[0], color, color);
            lineSprite3D.addLine(corners[4], corners[5], color, color);
            lineSprite3D.addLine(corners[5], corners[6], color, color);
            lineSprite3D.addLine(corners[6], corners[7], color, color);
            lineSprite3D.addLine(corners[7], corners[4], color, color);
            lineSprite3D.addLine(corners[0], corners[4], color, color);
            lineSprite3D.addLine(corners[1], corners[5], color, color);
            lineSprite3D.addLine(corners[2], corners[6], color, color);
            lineSprite3D.addLine(corners[3], corners[7], color, color);
        }
    }
    class CameraClick extends Laya.Script {
        constructor() {
            super();
            this.point = new Laya.Vector2();
            this._ray = new Laya.Ray(new Laya.Vector3(), new Laya.Vector3());
            this._outHitResult = new Laya.HitResult();
        }
        onAwake() {
            this._camera = this.owner;
            this._scene = this._camera.scene;
            Laya.Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        }
        onMouseDown(event) {
            this.point.x = Laya.Laya.stage.mouseX;
            this.point.y = Laya.Laya.stage.mouseY;
            this._camera.viewportPointToRay(this.point, this._ray);
            this._scene.physicsSimulation.rayCast(this._ray, this._outHitResult);
            if (!this._outHitResult.succeeded) {
                return;
            }
            if (this.clickHandler) {
                this.clickHandler.runWith(this._outHitResult.point);
            }
        }
    }

    class AvatarMaskDemo {
        constructor() {
            this.fontName = "fontClip";
            Laya.Laya.init(0, 0).then(() => {
                Laya.Stat.show();
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                this.loadFont();
                Laya.Scene3D.load("res/threeDimen/LayaScene_MaskModelTest/maskScene.ls", Laya.Handler.create(this, function (scene) {
                    Laya.Laya.stage.addChild(scene);
                }));
            });
        }
        loadFont() {
            Laya.Laya.loader.load("res/threeDimen/LayaScene_MaskModelTest/font/fontClip.fnt", Laya.Loader.FONT).then((res) => {
                this.onFontLoaded(res);
            });
        }
        onFontLoaded(bitmapFont) {
            bitmapFont.letterSpacing = 10;
            Laya.Text.registerBitmapFont(this.fontName, bitmapFont);
            this.createText(this.fontName);
            this.createText1(this.fontName);
            this.createText2(this.fontName);
        }
        createText(font) {
            var txt = new Laya.Text();
            txt.width = 250;
            txt.wordWrap = true;
            txt.text = "正常动画一";
            txt.color = "#1e1e1e";
            txt.size(200, 300);
            txt.leading = 5;
            txt.fontSize = 15;
            txt.zOrder = 999999999;
            txt.scale(Laya.Browser.pixelRatio, Laya.Browser.pixelRatio);
            txt.pos(Laya.Laya.stage.width / 2 - 50, Laya.Laya.stage.height / 2);
            Laya.Laya.stage.on(Laya.Event.RESIZE, txt, () => {
                txt.pos(Laya.Laya.stage.width / 2 - 50, Laya.Laya.stage.height / 2);
            });
            Laya.Laya.stage.addChild(txt);
        }
        createText1(font) {
            var txt = new Laya.Text();
            txt.width = 250;
            txt.wordWrap = true;
            txt.text = "骨骼遮罩-遮罩上半部分";
            txt.color = "#1e1e1e";
            txt.size(200, 300);
            txt.leading = 5;
            txt.fontSize = 15;
            txt.zOrder = 999999999;
            txt.pos(Laya.Laya.stage.width / 2 - 240, Laya.Laya.stage.height / 2);
            Laya.Laya.stage.on(Laya.Event.RESIZE, txt, () => {
                txt.pos(Laya.Laya.stage.width / 2 - 240, Laya.Laya.stage.height / 2);
            });
            Laya.Laya.stage.addChild(txt);
        }
        createText2(font) {
            var txt = new Laya.Text();
            txt.width = 250;
            txt.wordWrap = true;
            txt.text = "骨骼遮罩-遮罩下半部分";
            txt.color = "#1e1e1e";
            txt.size(200, 300);
            txt.leading = 5;
            txt.zOrder = 999999999;
            txt.fontSize = 15;
            txt.pos(Laya.Laya.stage.width / 2 + 140, Laya.Laya.stage.height / 2);
            Laya.Laya.stage.on(Laya.Event.RESIZE, txt, () => {
                txt.pos(Laya.Laya.stage.width / 2 + 140, Laya.Laya.stage.height / 2);
            });
            Laya.Laya.stage.addChild(txt);
        }
    }

    class IndexView3D extends IndexViewUI {
        constructor() {
            super();
            this._bigIndex = -1;
            this.oldPath = Laya.URL.basePath;
            this.btnOn = false;
            this._comboxBigArr2 = ['Resource', 'Scene3D', 'Camera', 'Lighting', 'Sprite3D', 'Mesh', 'Material', 'Texture', 'Animation3D', 'Physics3D', 'MouseLnteraction', 'Script', 'Sky', 'Particle3D', 'Trail', 'Shader', 'Advance', 'Demo', 'PostProcess', 'WebXR'];
            this._advanceClsArr = [DrawTextTexture, Laya3DCombineHtml, NavMeshDemo, Secne3DPlayer2D, VideoPlayIn3DWorld, CommandBuffer_Outline, CommandBuffer_BlurryGlass, CommandBuffer_DrawCustomInstance, CameraDepthModeTextureDemo, ReflectionProbeDemo, SeparableSSS_RenderDemo, UI3DDemo, LodDemo];
            this._advanceArr = ['DrawTextTexture', 'Laya3DCombineHtml', 'NavMeshDemo', 'Secne3DPlayer2D', 'VideoPlayIn3DWorld', 'CommandBuffer_Outline', 'CommandBuffer_BlurryGlass', 'CommandBuffer_DrawCustomInstance', 'CameraDepthTextureDemo', 'ReflectionProbeDemo', 'SeparableSSS_RenderDemo', 'UI3DDemo', 'LodDemo'];
            this._postProcessClsArr = [PostProcessBloom, PostProcess_Blur, PostProcess_Edge, PostProcessDoF, ProstProcess_AO, PostProcess_LensFlare];
            this._postProcessArr = ['PostProcessBloom', 'PostProcess_Blur', 'PostProcess_Edge', 'PostProcessDOF', 'PostProcessAO', 'PostProcess_LensFlare'];
            this._animationClsArr = [AnimationEventDemo, AnimatorDemo, BoneLinkSprite3D, AnimationLayerBlend, AnimatorStateScriptDemo, CameraAnimation, RigidbodyAnimationDemo, SimpleSkinAnimationInstance, AvatarMaskDemo];
            this._animationArr = ["AnimationEventDemo", 'Animator', "BoneLinkSprite3D", "AnimationLayerBlend", "AnimatorStateScript", "CameraAnimation", "RigidbodyAnimation", "SimpleSkinAnimationInstance,SkinMask"];
            this._cameraClsArr = [CameraDemo, CameraMSAADemo, CameraLayer, CameraLookAt, CameraRay, D3SpaceToD2Space, MultiCamera, OrthographicCamera, PickPixel, RenderTargetCamera];
            this._cameraArr = ['Camera', 'CameraMSAADemo', 'CameraLayer', 'CameraLookAt', 'CameraRay', 'D3SpaceToD2Space', 'MultiCamera', 'OrthographicCamera', 'PickPixel', 'RenderTargetCamera'];
            this._demoClsArr = [DamagedHelmetModelShow, CerberusModelShow, GrassDemo];
            this._demoArr = ['DamagedHelmetModelShow', 'CerberusModelShow', 'Grass'];
            this._lightingClsArr = [DirectionLightDemo, PointLightDemo, RealTimeShadow, SpotLightShadowMap, SpotLightDemo, MultiLight, VolumetricGIDemo];
            this._lightingArr = ['DirectionLight', 'PointLight', 'RealTimeShadow', 'SpotLightShadowMap', 'SpotLight', 'MultiLight', 'VolumetricGIDemo'];
            this._mterialClsArr = [BlinnPhong_DiffuseMap, BlinnPhong_NormalMap, BlinnPhong_SpecularMap, BlinnPhongMaterialLoad, EffectMaterialDemo, MaterialDemo, PBRMaterialDemo, PBRCoatMaterialDemo, UnlitMaterialDemo, StencilDemo];
            this._materilArr = ['BlinnPhong_DiffuseMap', 'BlinnPhong_NormalMap', "BlinnPhong_SpecularMap", "BlinnPhongMaterialLoad", "EffectMaterial", "Material", "PBRMaterial", "PBRCoatMaterialDemo", "UnlitMaterial", "StencilDemo"];
            this._meshClsArr = [ChangeMesh, CustomMesh, MeshLoad, BlendShapeDemo];
            this._meshArr = ['ChangeMesh', 'CustomMesh', "MeshLoad", 'BlendShapeDemo'];
            this._mouseLnteractionClsArr = [MouseInteraction, MultiTouch];
            this._mouseLnteractionArr = ['MouseInteraction', 'MultiTouch'];
            this._particleClsArr = [Particle_BurningGround, Particle_EternalLight];
            this._particleArr = ['Particle_BurningGround', 'Particle_EternalLight'];
            this._performanceClsArr = [DynamicBatchTest];
            this._performanceArr = ['DynamicBatchTest'];
            this._physicsClsArr = [PhysicsWorld_BaseCollider, PhysicsWorld_BuildingBlocks, PhysicsWorld_Character, PhysicsWorld_CollisionFiflter, PhysicsWorld_ContinueCollisionDetection, PhysicsWorld_Kinematic, PhysicsWorld_MeshCollider, PhysicsWorld_RayShapeCast, PhysicsWorld_TriggerAndCollisionEvent, PhysicsWorld_ConstraintFixedJoint, PhysicsWorld_ConstraintSpringJoint, PhysicsWorld_ConstraintHingeJoint, PhysicsWorld_ConfigurableJoint];
            this._physicslArr = ['PhysicsWorld_BaseCollider', 'PhysicsWorld_BuildingBlocks', 'PhysicsWorld_Character', 'PhysicsWorld_CollisionFiflter', 'PhysicsWorld_ContinueCollisionDetection', 'PhysicsWorld_Kinematic', 'PhysicsWorld_MeshCollider', 'PhysicsWorld_RayShapeCast', 'PhysicsWorld_TriggerAndCollisionEvent', 'PhysicsWorld_ConstraintFixedJoint', 'PhysicsWorld_ConstraintSpringJoint', 'PhysicsWorld_ConstraintHingeJoint', 'PhysicsWorld_ConfigurableJoint'];
            this._resourceClsArr = [GarbageCollection, LoadResourceDemo, LoadGltfResource];
            this._resourceArr = ['GarbageCollection', 'LoadResourceDemo', 'LoadGltfResource'];
            this._scene3DClsArr = [EnvironmentalReflection, LightmapScene, SceneLoad1, FogDemo];
            this._scene3DArr = ['EnvironmentalReflection', 'LightmapScene', 'SceneLoad1', 'FogDemo'];
            this._scriptClsArr = [ScriptDemo];
            this._scriptArr = ['ScriptDemo'];
            this._shaderClsArr = [Shader_MultiplePassOutline, Shader_GlowingEdge, Shader_Simple];
            this._shaderArr = ['Shader_MultiplePassOutline', 'Shader_GlowingEdge', 'Shader_Simple'];
            this._skyClsArr = [Sky_Procedural, Sky_SkyBox];
            this._skyArr = ['Sky_Procedural', 'Sky_SkyBox'];
            this._sprite3DClsArr = [PixelLineSprite3DDemo, SkinnedMeshSprite3DDemo, Sprite3DClone, Sprite3DLoad, Sprite3DParent, TransformDemo];
            this._sprite3DArr = ['PixelLineSprite3D', 'SkinnedMeshSprite3D', "Sprite3DClone", 'Sprite3DLoad', 'Sprite3DParent', 'Transform'];
            this._textureClsArr = [TextureDemo, HalfFloatTexture, TextureGPUCompression, GPUCompression_ETC2, GPUCompression_ASTC];
            this._textureArr = ['Texture', 'HalfFloatTexture', 'TextureGPUCompression', 'ETC2Texture', 'ASTCTexture'];
            this._trailClsArr = [TrailDemo, TrailRender];
            this._trailArr = ['Trail', 'TrailRender'];
            this._webXRClsArr = [WebXRStart, WebXRControllerDemo];
            this._WebXRArr = ['WebXRStart', 'WebXRControllerDemo'];
            this.i = 0;
            Laya.PrefabImpl.legacySceneOrPrefab.createByData(this, IndexViewUI.uiView);
            this.initView3D();
            this.initEvent();
            Laya.Laya.init(0, 0).then(() => {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.Stat.show();
                this.zOrder = 99999;
            });
        }
        initEvent() {
            this.bigComBox.selectHandler = new Laya.Handler(this, this.onBigComBoxSelectHandler);
            this.smallComBox.selectHandler = new Laya.Handler(this, this.onSmallBoxSelectHandler);
            Laya.Laya.stage.on("next", this, this.onNext);
        }
        onNext(data) {
            if (data.hasOwnProperty("bigType")) {
                this.a_length = data.bigType;
                var smallType = data.smallType;
                this.switchFunc(this.a_length, smallType);
            }
            else {
                var isMaster = parseInt(Laya.Browser.getQueryString("isMaster")) || 0;
                if (isMaster)
                    return;
                this._oldView && this._oldView['stypeFun' + data.stype] && this._oldView['stypeFun' + data.stype](data.value);
            }
        }
        initView3D() {
            var lables = this._comboxBigArr2.toString();
            this.box1.mouseThrough = true;
            this.bigComBox.labels = lables;
            this.bigComBox.selectedIndex = 0;
            this.bigComBox.visibleNum = 15;
            this.bigComBox.list.scrollType = Laya.ScrollType.Vertical;
            this.bigComBox.autoSize = false;
            this.bigComBox.list.selectEnable = true;
            this.bigComBox.width = 230;
            this.bigComBox.height = 50;
            this.bigComBox.labelSize = 35;
            this.bigComBox.itemSize = 30;
            this.bigComBox.left = 50;
            this.bigComBox.bottom = 50;
            this.smallComBox.x = this.bigComBox.x + this.bigComBox.width + 20;
            this.smallComBox.selectedIndex = 0;
            this.smallComBox.list.scrollType = Laya.ScrollType.Vertical;
            this.smallComBox.visibleNum = 15;
            this.smallComBox.list.selectEnable = true;
            this.smallComBox.width = 360;
            this.smallComBox.height = 50;
            this.smallComBox.labelSize = 35;
            this.smallComBox.itemSize = 30;
            this.smallComBox.left = 300;
            this.smallComBox.bottom = 50;
            this.btn = new Laya.Button();
            this.btn.skin = "comp/vscroll$down.png";
            this.addChild(this.btn);
            this.btn.scale(4, 4);
            this.btn.bottom = 50;
            this.btn.left = 700;
            this.btn.on(Laya.Event.MOUSE_DOWN, this, this.nextBtn);
        }
        nextBtn() {
            var isMaster = Laya.Browser.getQueryString("isMaster");
            var i_length;
            this.a_length = this._bigIndex;
            if (this.smallComBox.selectedIndex == this.b_length) {
                this.a_length += 1;
                i_length = 0;
            }
            else {
                i_length = this.smallComBox.selectedIndex + 1;
            }
            var bigType = this.a_length;
            var smallType = i_length;
            if (Main.isOpenSocket && parseInt(isMaster) == 1) {
                Client.instance.send({ type: "next", bigType: bigType, smallType: smallType, isMaster: isMaster });
            }
            else {
                this.switchFunc(this.a_length, i_length);
            }
        }
        onSmallBoxSelectHandler(index) {
            if (index < 0)
                return;
            if (this.btnOn && this.m_length != 0) {
                return;
            }
            var isMaster = parseInt(Laya.Browser.getQueryString("isMaster")) || 0;
            if (Main.isOpenSocket && !this.btnOn && isMaster) {
                this.onDirectSwitch();
            }
            this.m_length += 1;
            this.onClearPreBox();
            this.resetConfig();
            this._smallIndex = index;
            if (false) {
                if (this.i % 2 == 0) {
                    this._oldView = new RealTimeShadow;
                }
                else {
                    this._oldView = new RealTimeShadow;
                }
            }
            else {
                var _comboxBigArr2 = ['Resource', 'Scene3D', 'Camera', 'Lighting', 'Sprite3D', 'Mesh', 'Material', 'Texture', 'Animation3D', 'Physics3D', 'MouseLnteraction', 'Sky', 'Script', 'Particle3D', 'Trail', 'Shader', 'Advance', 'Demo', 'PostProcess', 'WebXR'];
                switch (this._bigIndex) {
                    case 0:
                        this._oldView = new this._resourceClsArr[index];
                        this.b_length = this._resourceClsArr.length - 1;
                        break;
                    case 1:
                        this._oldView = new this._scene3DClsArr[index];
                        this.b_length = this._scene3DClsArr.length - 1;
                        break;
                    case 2:
                        this._oldView = new this._cameraClsArr[index];
                        this.b_length = this._cameraClsArr.length - 1;
                        break;
                    case 3:
                        this._oldView = new this._lightingClsArr[index];
                        this.b_length = this._lightingClsArr.length - 1;
                        break;
                    case 4:
                        this._oldView = new this._sprite3DClsArr[index];
                        this.b_length = this._sprite3DClsArr.length - 1;
                        break;
                    case 5:
                        this._oldView = new this._meshClsArr[index];
                        this.b_length = this._meshClsArr.length - 1;
                        break;
                    case 6:
                        this._oldView = new this._mterialClsArr[index];
                        this.b_length = this._mterialClsArr.length - 1;
                        break;
                    case 7:
                        this._oldView = new this._textureClsArr[index];
                        this.b_length = this._textureClsArr.length - 1;
                        break;
                    case 8:
                        this._oldView = new this._animationClsArr[index];
                        this.b_length = this._animationClsArr.length - 1;
                        break;
                    case 9:
                        this._oldView = new this._physicsClsArr[index];
                        this.b_length = this._physicsClsArr.length - 1;
                        break;
                    case 10:
                        this._oldView = new this._mouseLnteractionClsArr[index];
                        this.b_length = this._mouseLnteractionClsArr.length - 1;
                        break;
                    case 11:
                        this._oldView = new this._scriptClsArr[index];
                        this.b_length = this._scriptClsArr.length - 1;
                        break;
                    case 12:
                        this._oldView = new this._skyClsArr[index];
                        this.b_length = this._skyClsArr.length - 1;
                        break;
                    case 13:
                        this._oldView = new this._particleClsArr[index];
                        this.b_length = this._particleClsArr.length - 1;
                        break;
                    case 14:
                        this._oldView = new this._trailClsArr[index];
                        this.b_length = this._trailClsArr.length - 1;
                        break;
                    case 15:
                        this._oldView = new this._shaderClsArr[index];
                        this.b_length = this._shaderClsArr.length - 1;
                        break;
                    case 16:
                        this._oldView = new this._advanceClsArr[index];
                        this.b_length = this._advanceClsArr.length - 1;
                        break;
                    case 17:
                        this._oldView = new this._demoClsArr[index];
                        this.b_length = this._demoClsArr.length - 1;
                        break;
                    case 18:
                        this._oldView = new this._postProcessClsArr[index];
                        this.b_length = this._postProcessClsArr.length - 1;
                        break;
                    case 19:
                        this._oldView = new this._webXRClsArr[index];
                        this.b_length = this._webXRClsArr.length - 1;
                        break;
                    case 20:
                        this._oldView = new this._performanceClsArr[index];
                        this.b_length = this._performanceClsArr.length - 1;
                        break;
                    default:
                        break;
                }
            }
        }
        onClearPreBox() {
            Laya.Laya.timer.clearAll(this._oldView);
            Laya.Laya.stage.offAllCaller(this._oldView);
            if (this._oldView) {
                var i = Laya.Laya.stage.numChildren - 1;
                for (i; i > -1; i--) {
                    if ((Laya.Laya.stage.getChildAt(i)) == this || (Laya.Laya.stage.getChildAt(i)) instanceof Laya.List) {
                    }
                    else if (Laya.Laya.stage.getChildAt(i)) {
                        let node = Laya.Laya.stage.getChildAt(i);
                        if (!(node.name === "root")) {
                            node.destroy();
                        }
                    }
                }
            }
            this._oldView = null;
            Laya.Resource.destroyUnusedResources();
            Laya.URL.basePath = this.oldPath;
        }
        resetConfig() {
            Laya.Config.isAlpha = false;
            Laya.Config.useRetinalCanvas = false;
        }
        switchFunc(bigListIndex, smallListIndex, isAutoSwitch = true) {
            this.btnOn = true;
            this.m_length = 0;
            this.bigComBox.selectedIndex = bigListIndex;
            this.onBigComBoxSelectHandler(bigListIndex, smallListIndex, isAutoSwitch);
            this.btnOn = false;
        }
        onBigComBoxSelectHandler(index, smallIndex = 0, isAutoSwitch = false) {
            if (this._bigIndex != index) {
                var isMaster = parseInt(Laya.Browser.getQueryString("isMaster")) || 0;
                if (Main.isOpenSocket && !isAutoSwitch && isMaster) {
                    this.onDirectSwitch();
                    return;
                }
                this._bigIndex = index;
                var labelStr;
                switch (index) {
                    case 0:
                        labelStr = this._resourceArr.toString();
                        break;
                    case 1:
                        labelStr = this._scene3DArr.toString();
                        break;
                    case 2:
                        labelStr = this._cameraArr.toString();
                        break;
                    case 3:
                        labelStr = this._lightingArr.toString();
                        break;
                    case 4:
                        labelStr = this._sprite3DArr.toString();
                        break;
                    case 5:
                        labelStr = this._meshArr.toString();
                        break;
                    case 6:
                        labelStr = this._materilArr.toString();
                        break;
                    case 7:
                        labelStr = this._textureArr.toString();
                        break;
                    case 8:
                        labelStr = this._animationArr.toString();
                        break;
                    case 9:
                        labelStr = this._physicslArr.toString();
                        break;
                    case 10:
                        labelStr = this._mouseLnteractionArr.toString();
                        break;
                    case 11:
                        labelStr = this._scriptArr.toString();
                        break;
                    case 12:
                        labelStr = this._skyArr.toString();
                        break;
                    case 13:
                        labelStr = this._particleArr.toString();
                        break;
                    case 14:
                        labelStr = this._trailArr.toString();
                        break;
                    case 15:
                        labelStr = this._shaderArr.toString();
                        break;
                    case 16:
                        labelStr = this._advanceArr.toString();
                        break;
                    case 17:
                        labelStr = this._demoArr.toString();
                        break;
                    case 18:
                        labelStr = this._postProcessArr.toString();
                        break;
                    case 19:
                        labelStr = this._WebXRArr.toString();
                        break;
                    case 20:
                        labelStr = this._performanceArr.toString();
                        break;
                    default:
                        break;
                }
                this.smallComBox.labels = labelStr;
            }
            this.smallComBox.selectedIndex = smallIndex;
        }
        onDirectSwitch() {
            var smallType = this.smallComBox.selectedIndex;
            var bigType = this.bigComBox.selectedIndex;
            if (this._bigIndex != this.bigComBox.selectedIndex)
                smallType = 0;
            Client.instance.send({ type: "next", bigType: bigType, smallType: smallType });
        }
    }

    class Main {
        static get box3D() {
            return Main._box3D || Laya.Laya.stage;
        }
        static set box3D(value) {
            Main._box3D = value;
        }
        static get box2D() {
            return Main._box2D || Laya.Laya.stage;
        }
        static set box2D(value) {
            Main._box2D = value;
        }
        constructor(is3D = true, isReadNetWorkRes = false, singleDemo) {
            this._is3D = false;
            this._isReadNetWorkRes = true;
            this.startTest(is3D, isReadNetWorkRes, singleDemo);
        }
        async startTest(is3D = true, isReadNetWorkRes = false, singleDemo) {
            this._singleDemo = singleDemo;
            if (Laya.LayaEnv.isLayaX) {
                Laya.LayaGL.unitRenderModuleDataFactory = new Laya.LayaXUnitRenderModuleDataFactory();
                Laya.LayaGL.renderDeviceFactory = new Laya.LayaXRenderDeviceFactory();
                Laya.Laya3DRender.renderOBJCreate = new Laya.LengencyRenderEngine3DFactory();
                Laya.Laya3DRender.Render3DModuleDataFactory = new Laya.LayaX3DRenderModuleFactory();
                Laya.Laya3DRender.Render3DPassFactory = new Laya.LayaX3DRenderPassFactory();
                Laya.LayaGL.render2DRenderPassFactory = new Laya.NoRender2DProcess();
            }
            else if (!Laya.LayaEnv.isConch || (Laya.LayaEnv.isConch && window.conchConfig.getGraphicsAPI() == 2)) {
                Laya.LayaGL.unitRenderModuleDataFactory = new Laya.WebUnitRenderModuleDataFactory();
                Laya.Laya3DRender.renderOBJCreate = new Laya.LengencyRenderEngine3DFactory();
                Laya.Laya3DRender.Render3DModuleDataFactory = new Laya.Web3DRenderModuleFactory();
            }
            else {
                Laya.LayaGL.unitRenderModuleDataFactory = new Laya.RTUintRenderModuleDataFactory();
                Laya.LayaGL.renderDeviceFactory = new Laya.GLESRenderDeviceFactory();
                Laya.Laya3DRender.renderOBJCreate = new Laya.LengencyRenderEngine3DFactory();
                Laya.Laya3DRender.Render3DModuleDataFactory = new Laya.RT3DRenderModuleFactory();
                Laya.Laya3DRender.Render3DPassFactory = new Laya.GLES3DRenderPassFactory();
                Laya.LayaGL.render2DRenderPassFactory = new Laya.GLESRender2DProcess();
                Laya.LayaGL.statAgent = new Laya.RTStatisContext();
            }
            await Laya.Laya.init(this._is3D ? 0 : 1280, this._is3D ? 0 : 720);
            if (!this._is3D) {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_AUTO;
            }
            else {
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
            }
            this._is3D = is3D;
            if (!this._is3D) {
                Laya.Laya.init(1280, 720);
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_AUTO;
            }
            else {
                Laya.Laya.init(0, 0);
                Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
                Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
            }
            Laya.Laya.stage.bgColor = "#ffffff";
            if (Main.isOpenSocket)
                Client.init();
            this._isReadNetWorkRes = isReadNetWorkRes;
            if (this._isReadNetWorkRes) {
                Laya.URL.rootPath = Laya.URL.basePath = "https://layaair.layabox.com/3.x/api/EngineDemoResource/";
            }
            else {
                Laya.URL.basePath += "sample-resource/";
            }
            await Laya.Laya.loader.loadPackage("", null, null);
            await Laya.Laya.loader.load([{ url: "atlas/comp.atlas", type: Laya.Loader.ATLAS }]);
            this.onLoaded();
        }
        onLoaded() {
            if (Main.isOpenSocket)
                Client.instance.send({ type: "login" });
            if (!this._is3D) {
                Main.box2D = new Laya.Sprite();
                Laya.Laya.stage.addChild(Main.box2D);
                if (this._singleDemo) {
                    new this._singleDemo(Main);
                    return;
                }
                else {
                    Main._indexView = new IndexView2D(Main.box2D, Main);
                }
            }
            else {
                Main.box3D = new Laya.Sprite();
                Laya.Laya.stage.addChild(Main.box3D);
                if (this._singleDemo) {
                    new this._singleDemo();
                    return;
                }
                else {
                    Main._indexView = new IndexView3D();
                }
            }
            Laya.Laya.stage.addChild(Main._indexView);
            Main._indexView.left = 10;
            Main._indexView.bottom = window.viewtop || 50;
            Main._indexView.mouseEnabled = Main._indexView.mouseThrough = true;
            Main._indexView.switchFunc(0, 0);
        }
    }
    Main.useWebGPU = false;
    Main.isWXAPP = false;
    Main.isOpenSocket = false;

    Laya.LayaGL.unitRenderModuleDataFactory = new Laya.WebUnitRenderModuleDataFactory();
    Laya.Laya3DRender.renderOBJCreate = new Laya.LengencyRenderEngine3DFactory();
    Laya.Laya3DRender.Render3DModuleDataFactory = new Laya.Web3DRenderModuleFactory();
    Laya.Physics2D.I._factory = new Laya.physics2DwasmFactory();
    new Main(true, false, TextureDemo);

})(Laya);
