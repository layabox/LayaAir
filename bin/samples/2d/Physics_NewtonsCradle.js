import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Render } from "laya/renders/Render";
import { Browser } from "laya/utils/Browser";
import { WebGL } from "laya/webgl/WebGL";
export class Physics_NewtonsCradle {
    constructor(maincls) {
        this.stageWidth = 800;
        this.stageHeight = 600;
        this.Matter = Browser.window.Matter;
        this.LayaRender = Browser.window.LayaRender;
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(this.stageWidth, this.stageHeight, WebGL);
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        Laya.stage.scaleMode = "showall";
        Laya.stage.bgColor = "#232628";
        this.setup();
    }
    setup() {
        this.initMatter();
        this.initWorld();
        Laya.stage.on("resize", this, this.onResize);
    }
    initMatter() {
        var gameWorld = new Sprite();
        this.Main.box2D.addChild(gameWorld);
        // 初始化物理引擎
        this.engine = this.Matter.Engine.create({ enableSleeping: true });
        this.Matter.Engine.run(this.engine);
        var render = this.LayaRender.create({ engine: this.engine, container: gameWorld, width: this.stageWidth, height: this.stageHeight, options: { wireframes: false } });
        this.LayaRender.run(render);
        this.mouseConstraint = this.Matter.MouseConstraint.create(this.engine, { element: Render.canvas });
        this.Matter.World.add(this.engine.world, this.mouseConstraint);
        render.mouse = this.mouseConstraint.mouse;
    }
    initWorld() {
        var cradle = this.Matter.Composites.newtonsCradle(280, 100, 5, 30, 200);
        this.Matter.World.add(this.engine.world, cradle);
        this.Matter.Body.translate(cradle.bodies[0], { x: -180, y: -100 });
        cradle = this.Matter.Composites.newtonsCradle(280, 380, 7, 20, 140);
        this.Matter.World.add(this.engine.world, cradle);
        this.Matter.Body.translate(cradle.bodies[0], { x: -140, y: -100 });
    }
    onResize() {
        // 设置鼠标的坐标缩放
        this.Matter.Mouse.setScale(this.mouseConstraint.mouse, { x: 1 / (Laya.stage.clientScaleX * Laya.stage._canvasTransform.a), y: 1 / (Laya.stage.clientScaleY * Laya.stage._canvasTransform.d) });
    }
}
