import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Browser } from "laya/utils/Browser";
import { RigidBody } from "laya/physics/RigidBody";
import { Main } from "./../Main";
import { RevoluteJoint } from "laya/physics/joint/RevoluteJoint";
import { Stat } from "laya/utils/Stat";
import { Label } from "laya/ui/Label";
import { Event } from "laya/events/Event";
import { Config } from "Config";
import { BoxCollider } from "laya/physics/Collider2D/BoxCollider"
import { Physics2D } from "laya/physics/Physics2D";

export class Physics_Tumbler {
    private count = 0;
    private totalBox = 200;
    private label: Label;
    Main: typeof Main = null;

    constructor(maincls: typeof Main) {
        this.Main = maincls;
        Config.isAntialias = true;
        Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
            Stat.show();
            Laya.stage.alignV = Stage.ALIGN_MIDDLE;
            Laya.stage.alignH = Stage.ALIGN_CENTER;
            Laya.stage.scaleMode = Stage.SCALE_FIXED_AUTO;
            Laya.stage.bgColor = "#232628";
            Physics2D.I.start();
            this.createBox();
            this.eventListener();
        });
    }

    createBox() {
        const width = 300, height = 20;
        const
            posx = Laya.stage.width / 2,
            posy = Laya.stage.height / 2;

        let box = new Sprite();
        box.size(width + height * 2, width + height * 2);
        box.pos(posx, posy);
        box.anchorX = 0.5;
        box.anchorY = 0.5;
        let off = -0.5 * box.width;
        this.Main.box2D.addChild(box);
        let boxBody: RigidBody = box.addComponent(RigidBody);

        let box1Shape: BoxCollider = box.addComponent(BoxCollider);
        let box2Shape: BoxCollider = box.addComponent(BoxCollider);
        let box3Shape: BoxCollider = box.addComponent(BoxCollider);
        let box4Shape: BoxCollider = box.addComponent(BoxCollider);
        box1Shape.width = width + height * 2;
        box1Shape.height = height;
        box1Shape.x = off;
        box1Shape.y = off;
        box2Shape.width = width + height * 2;
        box2Shape.height = height;
        box2Shape.x = off;
        box2Shape.y = off + width + height;
        box3Shape.width = height;
        box3Shape.height = width + height * 2;
        box3Shape.x = off;
        box3Shape.y = off;
        box4Shape.width = height;
        box4Shape.height = width + height * 2;
        box4Shape.x = off + width + height;
        box4Shape.y = off;

        let revoluteJoint = new RevoluteJoint();
        revoluteJoint.anchor = [box.width / 2, box.width / 2];
        revoluteJoint.motorSpeed = 0.05 * Math.PI;
        revoluteJoint.maxMotorTorque = 1e8;
        revoluteJoint.enableMotor = true;
        box.addComponentInstance(revoluteJoint);
    }

    addMiniBox() {
        if (this.count >= this.totalBox) {
            return;
        }

        let sp = new Sprite();
        this.Main.box2D.addChild(sp);
        sp.x = Laya.stage.width / 2;
        sp.y = Laya.stage.height / 2;
        let boxBody = sp.addComponent(RigidBody);
        boxBody.type = "dynamic";
        let collider = sp.addComponent(BoxCollider);
        collider.width = 5;
        collider.height = 5;
        this.count++;
    }

    eventListener() {
        let label: Label = this.label = Laya.stage.addChild(new Label("双击屏幕，将会产生100个新的小刚体")) as Label;
        label.top = 20;
        label.right = 20;
        label.fontSize = 16;
        label.color = "#e69999";
        Laya.stage.on(Event.DOUBLE_CLICK, this, () => {
            this.totalBox += 100;
        });
        Laya.timer.frameLoop(1, this, this.addMiniBox);
    }

    dispose() {
        Laya.stage.offAll(Event.DOUBLE_CLICK);
        Laya.stage.removeChild(this.label);
        Physics2D.I.destroyWorld()
    }
}
