import { Config } from "Config";
import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { BoxCollider } from "laya/physics/BoxCollider";
import { ChainCollider } from "laya/physics/ChainCollider";
import { CircleCollider } from "laya/physics/CircleCollider";
import { RevoluteJoint } from "laya/physics/joint/RevoluteJoint";
import { Physics } from "laya/physics/Physics";
import { PhysicsDebugDraw } from "laya/physics/PhysicsDebugDraw";
import { PolygonCollider } from "laya/physics/PolygonCollider";
import { RigidBody } from "laya/physics/RigidBody";
import { Label } from "laya/ui/Label";
import { Stat } from "laya/utils/Stat";
import { WebGL } from "laya/webgl/WebGL";
import { Main } from "../Main";

export class Physics_Bridge {
    Main: typeof Main = null;
    private ecount = 30;
    private label: Label;

    constructor(maincls: typeof Main) {
        this.Main = maincls;
        Config.isAntialias = true;
        Laya.init(1200, 700, WebGL);
        Stat.show();
        Physics.enable();
        PhysicsDebugDraw.enable();
		Laya.stage.alignV = Stage.ALIGN_MIDDLE;
		Laya.stage.alignH = Stage.ALIGN_CENTER;
		Laya.stage.scaleMode = Stage.SCALE_FIXED_AUTO;
		Laya.stage.bgColor = "#232628";

        this.createBridge();
        this.eventListener();
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
            let 
                targetX = (300 + Math.random() * 400) / Physics.PIXEL_RATIO, // [300, 700)
                targetY = 500 / Physics.PIXEL_RATIO;
            let newBall = new Sprite();
            this.Main.box2D.addChild(newBall);
            let circleBody: RigidBody = newBall.addComponent(RigidBody);
            circleBody.bullet = true;
            let circleCollider: CircleCollider = newBall.addComponent(CircleCollider);
            circleCollider.radius = 5;
            circleCollider.x = Laya.stage.mouseX;
            circleCollider.y = Laya.stage.mouseY;
            let circlePosx = circleCollider.x / Physics.PIXEL_RATIO;
            let circlePosy = circleCollider.y / Physics.PIXEL_RATIO;
            let velocityX = targetX - circlePosx;
            let velocityY = targetY - circlePosy;
            circleBody.linearVelocity = {"x": velocityX * 3, "y": velocityY * 3};
            Laya.timer.frameOnce(120, this, function() {
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
    }
}