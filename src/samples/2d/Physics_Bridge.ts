import { Config } from "Config";
import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { RevoluteJoint } from "laya/physics/joint/RevoluteJoint";
import { RigidBody } from "laya/physics/RigidBody";
import { Label } from "laya/ui/Label";
import { Stat } from "laya/utils/Stat";
import { Main } from "../Main";
import { ChainCollider } from "laya/physics/Collider2D/ChainCollider";
import { BoxCollider } from "laya/physics/Collider2D/BoxCollider";
import { CircleCollider } from "laya/physics/Collider2D/CircleCollider";
import { PolygonCollider } from "laya/physics/Collider2D/PolygonCollider";
import { Vector2 } from "laya/maths/Vector2";
import { Physics2D } from "laya/physics/Physics2D";

export class Physics_Bridge {
    Main: typeof Main = null;
    private ecount = 30;
    private label: Label;
    private TempVec: Vector2 = new Vector2();

    constructor(maincls: typeof Main) {
        this.Main = maincls;
        Config.isAntialias = true;
        Laya.init(1200, 700).then(() => {
            Stat.show();

            Laya.stage.alignV = Stage.ALIGN_MIDDLE;
            Laya.stage.alignH = Stage.ALIGN_CENTER;
            Laya.stage.scaleMode = Stage.SCALE_FIXED_AUTO;
            Laya.stage.bgColor = "#232628";
            Physics2D.enable();
            this.createBridge();
            this.eventListener();
        });
    }

    createBridge() {
        const startPosX = 250, startPosY = 450;

        let ground = new Sprite();
        this.Main.box2D.addChild(ground);
        let groundBody: RigidBody = new RigidBody();
        groundBody.type = "static";
        ground.addComponentInstance(groundBody);
        let chainCollider: ChainCollider = ground.addComponent(ChainCollider);
        chainCollider.points = "50,600,1050,600";

        let point1 = new Sprite();
        this.Main.box2D.addChild(point1);
        point1.pos(startPosX, startPosY);
        let pointRB1 = new RigidBody();
        pointRB1.type = "static";
        point1.addComponentInstance(pointRB1);
        let preBody = pointRB1;

        // bridge
        let width = 20, height = 2.5;
        for (let i = 0; i < this.ecount; i++) {
            let sp = new Sprite();
            this.Main.box2D.addChild(sp);
            sp.pos(startPosX + i * width, startPosY);
            let rb: RigidBody = sp.addComponent(RigidBody);
            let bc: BoxCollider = sp.addComponent(BoxCollider);
            bc.width = width;
            bc.height = height;
            bc.density = 20;
            bc.friction = 0.2;
            bc.y = -height / 2;
            let rj = new RevoluteJoint();
            rj.otherBody = preBody;
            sp.addComponentInstance(rj);
            preBody = rb;
        }
        let point2 = new Sprite();
        this.Main.box2D.addChild(point2);
        point2.pos(startPosX + this.ecount * width, startPosY);
        let pointRB2 = new RigidBody();
        pointRB2.type = "static";
        point2.addComponentInstance(pointRB2);

        let rj = new RevoluteJoint();
        rj.otherBody = preBody;
        point2.addComponentInstance(rj);

        for (let i = 0; i < 2; i++) {
            let sp = new Sprite();
            this.Main.box2D.addChild(sp);
            sp.pos(350 + 100 * i, 300);
            let rb: RigidBody = sp.addComponent(RigidBody);
            rb.bullet = true;
            let pc: PolygonCollider = sp.addComponent(PolygonCollider);
            pc.points = "-10,0,10,0,0,30";
            pc.density = 1.0;
        }

        for (let i = 0; i < 2; i++) {
            let sp = new Sprite();
            this.Main.box2D.addChild(sp);
            sp.pos(400 + 150 * i, 350);
            let rb: RigidBody = sp.addComponent(RigidBody);
            rb.bullet = true;
            let pc: CircleCollider = sp.addComponent(CircleCollider);
            pc.radius = 10;
        }
    }

    eventListener() {
        // 单击产生新的小球刚体
        Laya.stage.on(Event.CLICK, this, () => {
            let tempVec = this.TempVec;
            let targetX = 300 + Math.random() * 400, targetY = 500;
            let newBall = new Sprite();
            this.Main.box2D.addChild(newBall);
            let circleBody: RigidBody = newBall.addComponent(RigidBody);
            circleBody.bullet = true;
            circleBody.type = "dynamic";

            let circleCollider: CircleCollider = newBall.addComponent(CircleCollider);
            circleCollider.radius = 5;
            circleCollider.x = Laya.stage.mouseX;
            circleCollider.y = Laya.stage.mouseY;

            tempVec.x = targetX - circleCollider.x;
            tempVec.y = targetY - circleCollider.y;
            Vector2.normalize(tempVec, tempVec);
            Vector2.scale(tempVec, 25, tempVec);
            circleBody.linearVelocity = tempVec.toArray();
            Laya.timer.frameOnce(120, this, function () {
                newBall.destroy();
            });
        });

        let label: Label = this.label = Laya.stage.addChild(new Label("单击屏幕产生新的小球刚体，击向bridge的随机位置")) as Label;
        label.top = 20;
        label.right = 20;
        label.fontSize = 16;
        label.color = "#e69999";
    }

    dispose() {
        Laya.stage.offAll(Event.CLICK);
        Laya.stage.removeChild(this.label);
        Physics2D.I.destroyWorld();
    }
}