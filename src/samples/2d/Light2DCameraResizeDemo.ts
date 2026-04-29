/**
description
 验证视口尺寸变化（F12 / 拖动浏览器窗口）时 Camera2D + DirectionLight2D 的光影 RT 跟随：
 在 Light2DManager._updateScreen 修复前，_screen 永远钉在屏幕像素空间 (0,0,RT.width,RT.height)，
 拉伸窗口时光影硬切位置会跳变；修复后硬切应稳定在相机视野边缘。

 操作：
   按 F12 打开 / 关闭开发者工具，或拖动浏览器窗口大小
   B  自动每 1.5 秒切换一次窗口比例（模拟反复 resize）
 */
import { Laya } from "Laya";
import { Script } from "laya/components/Script";
import { Scene } from "laya/display/Scene";
import { Camera2D } from "laya/display/Scene2DSpecial/Camera2D";
import { Mesh2DRender } from "laya/display/Scene2DSpecial/Mesh2DRender";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Event } from "laya/events/Event";
import { Color } from "laya/maths/Color";
import { Loader } from "laya/net/Loader";
import { IndexFormat } from "laya/RenderEngine/RenderEnum/IndexFormat";
import { Mesh2D, VertexMesh2D } from "laya/resource/Mesh2D";
import { Texture } from "laya/resource/Texture";
import { Browser } from "laya/utils/Browser";
import { Stat } from "laya/utils/Stat";
import { Area2D } from "laya/display/Area2D";
import { ShadowFilterType } from "laya/Light2D/BaseLight2D";
import { DirectionLight2D } from "laya/Light2D/DirectionLight2D";
import { Main } from "../Main";

export class Light2DCameraResizeDemo {
    Main: typeof Main = null;
    scene: Scene;
    area2d: Area2D;
    camera: Camera2D;
    hud: Text;

    constructor(mainClass: typeof Main) {
        this.Main = mainClass;
        Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
            Laya.stage.alignV = Stage.ALIGN_MIDDLE;
            Laya.stage.alignH = Stage.ALIGN_CENTER;
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.bgColor = "#1a1a1a";
            Stat.show();
            this._build();
        });
    }

    private _build(): void {
        this.scene = this.Main.box2D.addChild(new Scene()) as Scene;
        this.area2d = new Area2D();
        this.scene.addChild(this.area2d);

        Laya.loader.load(["res/bg2.png", "res/apes/monkey2.png"], Loader.IMAGE).then(() => {
            const bgTex: Texture = Laya.loader.getRes("res/bg2.png");

            //铺一张大背景，玩家走到哪都仍在 mesh 上
            const bg = this.area2d.addChild(new Sprite()) as Sprite;
            const bgRender = bg.addComponent(Mesh2DRender);
            bgRender.sharedMesh = createRectMesh(20000, 20000);
            bgRender.texture = bgTex;
            bgRender.lightReceive = true;
            bg.x = -10000;
            bg.y = -10000;

            const dirSp = this.area2d.addChild(new Sprite()) as Sprite;
            const dirLight = dirSp.addComponent(DirectionLight2D);
            dirLight.directionAngle = 45;
            dirLight.color = new Color(0.8, 0.8, 0.7, 1);
            dirLight.shadowEnable = false;
            dirLight.shadowFilterType = ShadowFilterType.None;
            dirLight.layerMask = 1;

            const apeTex: Texture = Laya.loader.getRes("res/apes/monkey2.png");
            const player = this.area2d.addChild(new Sprite()) as Sprite;
            const r = player.addComponent(Mesh2DRender);
            r.sharedMesh = createRectMesh(110, 145);
            r.texture = apeTex;
            r.lightReceive = true;
            //故意放在远离 (0,0) 的位置，触发 bug 路径
            player.x = 4000;
            player.y = 3000;

            this.camera = new Camera2D();
            player.addChild(this.camera);
            this.camera.isMain = true;

            const ctrl = player.addComponent(ResizeDemoCtrl);
            ctrl.demo = this;
        });

        this.hud = this.scene.addChild(new Text()) as Text;
        this.hud.color = "#ffd9a3";
        this.hud.fontSize = 18;
        this.hud.x = 20;
        this.hud.y = 20;
        this.hud.text = "F12 / 拖窗口 | B 自动 resize 切换";
    }

    updateHUD(autoResize: boolean): void {
        if (!this.hud) return;
        this.hud.text =
            `viewport=(${Laya.stage.width.toFixed(0)} x ${Laya.stage.height.toFixed(0)})  ` +
            `auto=${autoResize ? "ON" : "OFF"}\n` +
            "F12 / 拖窗口 | B 自动 resize 切换";
    }
}

export class ResizeDemoCtrl extends Script {
    demo: Light2DCameraResizeDemo;
    private _autoResize = false;
    private _timer = 0;
    private _flip = false;
    private _origW = 0;
    private _origH = 0;

    onAwake(): void {
        this._origW = Laya.stage.designWidth;
        this._origH = Laya.stage.designHeight;
    }

    onKeyDown(evt: Event): void {
        if (evt.keyCode === 66) { //B
            this._autoResize = !this._autoResize;
            this._timer = 0;
            if (!this._autoResize) {
                Laya.stage.size(this._origW || Browser.clientWidth, this._origH || Browser.clientHeight);
            }
        }
    }

    onUpdate(): void {
        if (this._autoResize) {
            this._timer += Laya.timer.delta;
            if (this._timer > 1500) {
                this._timer = 0;
                this._flip = !this._flip;
                if (this._flip) {
                    Laya.stage.size(Browser.clientWidth * 0.6, Browser.clientHeight);
                } else {
                    Laya.stage.size(Browser.clientWidth, Browser.clientHeight * 0.6);
                }
            }
        }
        this.demo?.updateHUD(this._autoResize);
    }
}

function createRectMesh(width: number, height: number): Mesh2D {
    const vertices = new Float32Array(4 * 5);
    const indices = new Uint16Array(2 * 3);
    let i = 0;
    vertices[i++] = 0;     vertices[i++] = 0;      vertices[i++] = 0; vertices[i++] = 0; vertices[i++] = 0;
    vertices[i++] = width; vertices[i++] = 0;      vertices[i++] = 0; vertices[i++] = 1; vertices[i++] = 0;
    vertices[i++] = width; vertices[i++] = height; vertices[i++] = 0; vertices[i++] = 1; vertices[i++] = 1;
    vertices[i++] = 0;     vertices[i++] = height; vertices[i++] = 0; vertices[i++] = 0; vertices[i++] = 1;
    indices[0] = 0; indices[1] = 1; indices[2] = 3;
    indices[3] = 1; indices[4] = 2; indices[5] = 3;
    const decl = VertexMesh2D.getVertexDeclaration(["POSITION,UV"], false)[0];
    return Mesh2D.createMesh2DByPrimitive([vertices], [decl], indices, IndexFormat.UInt16, [{ length: indices.length, start: 0 }]);
}
