/**
description
 演示 getHitInfo 获取碰撞点和法线信息
 */
import { Config } from "Config";
import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { RigidBody } from "laya/physics/RigidBody";
import { Stat } from "laya/utils/Stat";
import { Main } from "../Main";
import { BoxCollider } from "laya/physics/Collider2D/BoxCollider";
import { CircleCollider } from "laya/physics/Collider2D/CircleCollider";
import { ChainCollider } from "laya/physics/Collider2D/ChainCollider";
import { ColliderBase } from "laya/physics/Collider2D/ColliderBase";
import { Physics2D } from "laya/physics/Physics2D";
import { Scene } from "laya/display/Scene";
import { Physics2DWorldManager } from "laya/physics/Physics2DWorldManager";
import { EPhycis2DBlit, IPhysics2DContact, Physics2DContactHitResult } from "laya/physics/factory/IPhysics2DFactory";
import { Text } from "laya/display/Text";

export class Physics_GetHitInfo {
    Main: typeof Main = null;
    _scene: Scene;
    _infoText: Text;

    constructor(maincls: typeof Main) {
        this.Main = maincls;
        Config.isAntialias = true;
        Laya.init(1200, 700).then(() => {
            Stat.show();
            Laya.stage.alignV = Stage.ALIGN_MIDDLE;
            Laya.stage.alignH = Stage.ALIGN_CENTER;
            Laya.stage.scaleMode = Stage.SCALE_FIXED_AUTO;
            Laya.stage.bgColor = "#232628";
            Physics2D.I.start();
            this.createScene();
        });
    }

    createScene(): void {
        this._scene = new Scene();
        this.Main.box2D.addChild(this._scene);
        let man: Physics2DWorldManager = this._scene.getComponentElementManager(Physics2DWorldManager.__managerName) as Physics2DWorldManager;
        man.enableDebugDraw(true, EPhycis2DBlit.Shape);

        // 地面
        let ground: Sprite = new Sprite();
        this._scene.addChild(ground);
        let groundBody: RigidBody = new RigidBody();
        groundBody.type = "static";
        ground.addComponentInstance(groundBody);
        let chainCollider: ChainCollider = ground.addComponent(ChainCollider);
        chainCollider.datas = [50, 600, 1150, 600];

        // 斜面
        let slope: Sprite = new Sprite();
        this._scene.addChild(slope);
        let slopeBody: RigidBody = new RigidBody();
        slopeBody.type = "static";
        slope.addComponentInstance(slopeBody);
        let slopeCollider: ChainCollider = slope.addComponent(ChainCollider);
        slopeCollider.datas = [200, 400, 600, 550];

        // 注意：当前引擎碰撞回调实际派发的是 trigger 事件名
        // BeginContact → "triggerenter"，PreSolve → "triggerstay"
        ground.on(Event.TRIGGER_ENTER, this, this.onCollisionEnter);
        ground.on("triggerstay", this, this.onCollisionStay);
        slope.on(Event.TRIGGER_ENTER, this, this.onCollisionEnter);

        // 定时生成掉落物体
        Laya.timer.loop(1500, this, this.dropObject);
        this.dropObject();

        // 信息显示文本
        this._infoText = new Text();
        this._infoText.fontSize = 16;
        this._infoText.color = "#00ff00";
        this._infoText.pos(50, 30);
        this._scene.addChild(this._infoText);
    }

    private _dropCount: number = 0;

    dropObject(): void {
        let x: number = 200 + Math.random() * 400;
        let y: number = 100 + Math.random() * 100;
        let sp: Sprite = new Sprite();
        this._scene.addChild(sp);
        sp.pos(x, y);

        let rb: RigidBody = sp.addComponent(RigidBody);
        rb.type = "dynamic";

        if (this._dropCount % 2 === 0) {
            sp.size(40, 40);
            let circle: CircleCollider = sp.addComponent(CircleCollider);
            circle.radius = 20;
            circle.x = 20;
            circle.y = 20;
        } else {
            sp.size(40, 40);
            let box: BoxCollider = sp.addComponent(BoxCollider);
            box.width = 40;
            box.height = 40;
            box.x = 20;
            box.y = 20;
        }

        sp.on(Event.TRIGGER_ENTER, this, this.onCollisionEnter);
        this._dropCount++;
    }

    onCollisionEnter(otherCollider: ColliderBase, selfCollider: ColliderBase, contact: IPhysics2DContact): void {
        let hitInfo: Physics2DContactHitResult = contact.getHitInfo();
        if (hitInfo && hitInfo.points.length > 0) {
            let p: { x: number, y: number } = hitInfo.points[0];
            let n: { x: number, y: number } = hitInfo.normal;
            let msg: string = `碰撞! 点:(${p.x.toFixed(1)}, ${p.y.toFixed(1)}) 法线:(${n.x.toFixed(2)}, ${n.y.toFixed(2)}) 接触点数:${hitInfo.points.length}`;
            console.log(msg);
            this._infoText.text = msg;
            this.drawHitPoint(p.x, p.y, n.x, n.y);
        } else {
            console.log("getHitInfo 返回空:", hitInfo);
        }
    }

    onCollisionStay(otherCollider: ColliderBase, selfCollider: ColliderBase, contact: IPhysics2DContact): void {
        let hitInfo: Physics2DContactHitResult = contact.getHitInfo();
        if (hitInfo && hitInfo.points.length > 0) {
            let p: { x: number, y: number } = hitInfo.points[0];
            let n: { x: number, y: number } = hitInfo.normal;
            this._infoText.text = `持续碰撞 点:(${p.x.toFixed(1)}, ${p.y.toFixed(1)}) 法线:(${n.x.toFixed(2)}, ${n.y.toFixed(2)})`;
        }
    }

    drawHitPoint(x: number, y: number, nx: number, ny: number): void {
        let marker: Sprite = new Sprite();
        this._scene.addChild(marker);
        marker.graphics.drawCircle(0, 0, 4, "#ff0000");
        marker.graphics.drawLine(0, 0, nx * 30, ny * 30, "#0088ff", 2);
        marker.pos(x, y);

        Laya.timer.once(2000, marker, () => {
            marker.removeSelf();
            marker.destroy();
        });
    }

    dispose(): void {
        Laya.timer.clearAll(this);
    }
}
