/**
description
 验证 Camera2D + Light2D 跟随：
 - 相机平移到远离世界 (0,0) 时，受光精灵不再出现亮度硬切（环境光断层）。
 - 视口尺寸变化（F12 / 浏览器缩放）时，光影 RT 跟随相机视野。
 - positionSmooth=true 时，平滑跟随速度无双步进（与未启用光照时一致）。

 操作：
   WASD     移动角色（相机跟随）
   J/L      进一步快速平移到远离 (0,0) 的位置（用于触发原 bug）
   Z / X    放大 / 缩小
   R        重置位置到 (0,0)
   P        切换 positionSmooth
   T        切换是否显示参考网格
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
import { Vector2 } from "laya/maths/Vector2";
import { Loader } from "laya/net/Loader";
import { IndexFormat } from "laya/RenderEngine/RenderEnum/IndexFormat";
import { WrapMode } from "laya/RenderEngine/RenderEnum/WrapMode";
import { Mesh2D, VertexMesh2D } from "laya/resource/Mesh2D";
import { Texture } from "laya/resource/Texture";
import { Browser } from "laya/utils/Browser";
import { Stat } from "laya/utils/Stat";
import { Area2D } from "laya/display/Area2D";
import { ShadowFilterType } from "laya/Light2D/BaseLight2D";
import { DirectionLight2D } from "laya/Light2D/DirectionLight2D";
import { SpotLight2D } from "laya/Light2D/SpotLight2D";
import { LightOccluder2D } from "laya/Light2D/LightOccluder2D";
import { PolygonPoint2D } from "laya/Light2D/PolygonPoint2D";
import { Main } from "../Main";

export class Light2DCameraFollowDemo {
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
            Laya.stage.bgColor = "#101418";
            Stat.show();
            this._build();
        });
    }

    private _build(): void {
        this.scene = this.Main.box2D.addChild(new Scene()) as Scene;
        this.area2d = new Area2D();
        this.scene.addChild(this.area2d);

        Laya.loader.load("res/bg2.png", Loader.IMAGE).then(() => {
            const bgTex: Texture = Laya.loader.getRes("res/bg2.png");

            //铺一个 20000 x 20000 的大背景，让相机有足够空间远离世界 (0,0)
            const bgSize = 20000;
            const bg = this.area2d.addChild(new Sprite()) as Sprite;
            const bgRender = bg.addComponent(Mesh2DRender);
            bgRender.sharedMesh = createRectMesh(bgSize, bgSize);
            bgRender.texture = bgTex;
            bgRender.lightReceive = true;
            bg.x = -bgSize / 2;
            bg.y = -bgSize / 2;

            //每隔一段距离铺一些 occluder + lit sprite，便于在 (5000,5000) 等远位置肉眼判断光照是否生效
            const samplePoints = [
                { x: 0, y: 0, label: "(0,0)" },
                { x: 1500, y: 1500, label: "(1500,1500)" },
                { x: 3000, y: 0, label: "(3000,0)" },
                { x: 5000, y: 3000, label: "(5000,3000)" },
                { x: -2500, y: -2500, label: "(-2500,-2500)" },
                { x: 8000, y: 6000, label: "(8000,6000)" },
            ];
            for (const p of samplePoints) {
                this._addLitMonkey(p.x, p.y, p.label);
            }

            //一束方向光：是这次 bug 的关键 —— 它的 worldRange 锚定在 _screen 上
            const dirSp = this.area2d.addChild(new Sprite()) as Sprite;
            const dirLight = dirSp.addComponent(DirectionLight2D);
            dirLight.directionAngle = 30;
            dirLight.color = new Color(0.7, 0.7, 0.6, 1);
            dirLight.shadowColor = new Color(0, 0, 0, 1);
            dirLight.shadowFilterType = ShadowFilterType.None;
            dirLight.shadowEnable = true;
            dirLight.layerMask = 1;

            //一盏跟随玩家的聚光灯：补充验证非方向光在远离 (0,0) 时也能正常工作
            const spotHolder = new Sprite();
            const spot = spotHolder.addComponent(SpotLight2D);
            spot.innerRadius = 250;
            spot.outerRadius = 500;
            spot.innerAngle = 60;
            spot.outerAngle = 130;
            spot.intensity = 1;
            spot.color = new Color(1, 1, 1, 1);
            spot.shadowColor = new Color(0, 0, 0, 1);
            spot.shadowStrength = 0.6;
            spot.shadowFilterType = ShadowFilterType.PCF5;
            spot.shadowFilterSmooth = 5;
            spot.layerMask = 1;
            spot.shadowEnable = true;

            //玩家 + 相机
            Laya.loader.load("res/apes/monkey2.png", Loader.IMAGE).then(() => {
                const apeTex: Texture = Laya.loader.getRes("res/apes/monkey2.png");
                this.player = this.area2d.addChild(new Sprite()) as Sprite;
                const playerRender = this.player.addComponent(Mesh2DRender);
                playerRender.sharedMesh = createRectMesh(110, 145);
                playerRender.texture = apeTex;
                playerRender.lightReceive = true;
                this.player.x = 0;
                this.player.y = 0;

                this.player.addChild(spotHolder);
                spotHolder.x = 55;
                spotHolder.y = 70;

                this.camera = new Camera2D();
                this.player.addChild(this.camera);
                this.camera.isMain = true;

                const ctrl = this.player.addComponent(CameraDemoCtrl);
                ctrl.demo = this;
            });
        });

        this._buildHUD();
    }

    private _addLitMonkey(x: number, y: number, label: string): void {
        Laya.loader.load("res/apes/monkey3.png", Loader.IMAGE).then(() => {
            const tex: Texture = Laya.loader.getRes("res/apes/monkey3.png");
            const sp = this.area2d.addChild(new Sprite()) as Sprite;
            const r = sp.addComponent(Mesh2DRender);
            r.sharedMesh = createRectMesh(120, 120);
            r.texture = tex;
            r.lightReceive = true;
            sp.x = x;
            sp.y = y;

            //加个简单矩形 occluder，这样能从阴影位置直观看出方向光的"虚拟原点"是否跟随相机
            const occ = sp.addComponent(LightOccluder2D);
            const poly = new PolygonPoint2D();
            poly.addPoint(10, 10);
            poly.addPoint(110, 10);
            poly.addPoint(110, 110);
            poly.addPoint(10, 110);
            occ.polygonPoint = poly;

            const tag = this.area2d.addChild(new Text()) as Text;
            tag.text = label;
            tag.color = "#ffffff";
            tag.fontSize = 24;
            tag.x = x;
            tag.y = y - 30;
        });
    }

    private _buildHUD(): void {
        this.hud = this.scene.addChild(new Text()) as Text;
        this.hud.color = "#fff8c4";
        this.hud.fontSize = 18;
        this.hud.x = 20;
        this.hud.y = 20;
        this.hud.text = "WASD 移动 | J/L 远距瞬移 | Z/X 缩放 | R 复位 | P positionSmooth";
    }

    updateHUD(): void {
        if (!this.hud || !this.player || !this.camera) return;
        this.hud.text =
            `pos=(${this.player.x.toFixed(0)}, ${this.player.y.toFixed(0)})  ` +
            `zoom=(${this.camera.zoom.x.toFixed(2)}, ${this.camera.zoom.y.toFixed(2)})  ` +
            `smooth=${this.camera.positionSmooth ? "ON" : "OFF"}\n` +
            "WASD 移动 | J/L 远距瞬移 | Z/X 缩放 | R 复位 | P positionSmooth";
    }
}

export class CameraDemoCtrl extends Script {
    demo: Light2DCameraFollowDemo;
    private _vx = 0;
    private _vy = 0;

    onKeyDown(evt: Event): void {
        const sp = this.owner as Sprite;
        const cam = this.demo?.camera;
        if (!cam) return;
        switch (evt.keyCode) {
            case 87: this._vy = -8; break; //W
            case 83: this._vy = 8; break;  //S
            case 65: this._vx = -8; break; //A
            case 68: this._vx = 8; break;  //D
            case 74: sp.x -= 1500; break;  //J 远距瞬移
            case 76: sp.x += 1500; break;  //L
            case 82: sp.x = 0; sp.y = 0; break;       //R 复位
            case 80: cam.positionSmooth = !cam.positionSmooth; cam.positionSpeed = 0.5; break; //P
            case 90: { //Z 放大
                const z = cam.zoom; z.x = Math.max(0.25, z.x - 0.1); z.y = z.x; cam.zoom = z; break;
            }
            case 88: { //X 缩小
                const z = cam.zoom; z.x = Math.min(4.0, z.x + 0.1); z.y = z.x; cam.zoom = z; break;
            }
        }
    }

    onKeyUp(evt: Event): void {
        switch (evt.keyCode) {
            case 87: case 83: this._vy = 0; break;
            case 65: case 68: this._vx = 0; break;
        }
    }

    onUpdate(): void {
        const sp = this.owner as Sprite;
        sp.x += this._vx;
        sp.y += this._vy;
        this.demo?.updateHUD();
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
