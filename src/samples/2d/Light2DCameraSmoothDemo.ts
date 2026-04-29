/**
description
 验证 Camera2D positionSmooth=true 时光影跟随不会出现"双步进"。
 如果 Light2DManager._updateScreen 主动调用 mainCamera._getCameraTransform()，
 而 Area2D 渲染路径每帧也调用了一次（Area2D.ts:107、161），_cameraSmoothPos 会被插值两次，
 平滑跟随的实际速度比期望快 1.5x ~ 2x。修复后 Light2DManager 只读 _rect，速度应稳定。

 操作：
   按住 D 让玩家朝右匀速移动，观察相机平滑跟随的速度
   切换 P 关闭/启用 positionSmooth，对比无平滑时的"硬"跟随
   按 Space 在 (0,0) 与 (5000, 3000) 之间瞬移，观察相机平滑过渡的速度是否稳定
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

export class Light2DCameraSmoothDemo {
    Main: typeof Main = null;
    scene: Scene;
    area2d: Area2D;
    camera: Camera2D;
    player: Sprite;
    hud: Text;

    constructor(mainClass: typeof Main) {
        this.Main = mainClass;
        Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
            Laya.stage.alignV = Stage.ALIGN_MIDDLE;
            Laya.stage.alignH = Stage.ALIGN_CENTER;
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.bgColor = "#0c0f12";
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

            const bg = this.area2d.addChild(new Sprite()) as Sprite;
            const bgRender = bg.addComponent(Mesh2DRender);
            bgRender.sharedMesh = createRectMesh(20000, 20000);
            bgRender.texture = bgTex;
            bgRender.lightReceive = true;
            bg.x = -10000;
            bg.y = -10000;

            const dirSp = this.area2d.addChild(new Sprite()) as Sprite;
            const dirLight = dirSp.addComponent(DirectionLight2D);
            dirLight.directionAngle = 60;
            dirLight.color = new Color(0.6, 0.7, 0.8, 1);
            dirLight.shadowEnable = false;
            dirLight.shadowFilterType = ShadowFilterType.None;
            dirLight.layerMask = 1;

            const apeTex: Texture = Laya.loader.getRes("res/apes/monkey2.png");
            this.player = this.area2d.addChild(new Sprite()) as Sprite;
            const r = this.player.addComponent(Mesh2DRender);
            r.sharedMesh = createRectMesh(110, 145);
            r.texture = apeTex;
            r.lightReceive = true;

            this.camera = new Camera2D();
            this.camera.positionSmooth = true;
            this.camera.positionSpeed = 0.3;
            this.player.addChild(this.camera);
            this.camera.isMain = true;

            const ctrl = this.player.addComponent(SmoothDemoCtrl);
            ctrl.demo = this;
        });

        this.hud = this.scene.addChild(new Text()) as Text;
        this.hud.color = "#a3d9ff";
        this.hud.fontSize = 18;
        this.hud.x = 20;
        this.hud.y = 20;
        this.hud.text = "按住 D 移动 | Space 瞬移 | P 切换 positionSmooth";
    }

    updateHUD(playerPos: string, camSmoothPos: string, lag: string): void {
        if (!this.hud || !this.camera) return;
        this.hud.text =
            `player=${playerPos}  camSmooth=${camSmoothPos}  lag=${lag}px\n` +
            `smooth=${this.camera.positionSmooth ? "ON" : "OFF"}  speed=${this.camera.positionSpeed}\n` +
            "按住 D 移动 | Space 瞬移 | P 切换 positionSmooth";
    }
}

export class SmoothDemoCtrl extends Script {
    demo: Light2DCameraSmoothDemo;
    private _moving = false;
    private _teleport = false;

    onKeyDown(evt: Event): void {
        const cam = this.demo?.camera;
        const sp = this.owner as Sprite;
        if (!cam) return;
        switch (evt.keyCode) {
            case 68: this._moving = true; break;       //D
            case 80: cam.positionSmooth = !cam.positionSmooth; break; //P
            case 32:                                   //Space 瞬移
                if (this._teleport) { sp.x = 0; sp.y = 0; }
                else { sp.x = 5000; sp.y = 3000; }
                this._teleport = !this._teleport;
                break;
        }
    }

    onKeyUp(evt: Event): void {
        if (evt.keyCode === 68) this._moving = false;
    }

    onUpdate(): void {
        const sp = this.owner as Sprite;
        const cam = this.demo?.camera;
        if (this._moving) sp.x += 6;
        if (cam) {
            const camPos = cam.getCameraPos();
            const dx = sp.x - camPos.x;
            const dy = sp.y - camPos.y;
            const lag = Math.sqrt(dx * dx + dy * dy);
            this.demo?.updateHUD(
                `(${sp.x.toFixed(0)},${sp.y.toFixed(0)})`,
                `(${camPos.x.toFixed(0)},${camPos.y.toFixed(0)})`,
                lag.toFixed(0)
            );
        }
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
