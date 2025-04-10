/**
description
 使用物理引擎创建旋转刚体容器,生成小矩形刚体的交互演示
 */
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
import { Physics2D } from "laya/physics/Physics2D";
import { Scene } from "laya/display/Scene";
import { Physics2DWorldManager } from "laya/physics/Physics2DWorldManager";
import { EPhycis2DBlit } from "laya/physics/factory/IPhysics2DFactory";
import { BoxShape2D } from "laya/physics/Shape/BoxShape2D";

export class Physics_Tumbler_Shapes {
    private count = 0;
    private totalBox = 200;
    private label: Label;
    Main: typeof Main = null;
    _scene: Scene;

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
        this._scene = new Scene();
        this.Main.box2D.addChild(this._scene);

        let man: Physics2DWorldManager = this._scene.getComponentElementManager(Physics2DWorldManager.__managerName) as Physics2DWorldManager;
        man.enableDebugDraw(true, EPhycis2DBlit.Shape);
        man.enableDebugDraw(true, EPhycis2DBlit.Joint);
        man.enableDebugDraw(true, EPhycis2DBlit.CenterOfMass);

        const width = 300, height = 20;
        const
            posx = Laya.stage.width / 2,
            posy = Laya.stage.height / 2;

        let off = -width / 2 - height;
        let box = new Sprite();
        box.size(width + height * 2, width + height * 2);
        box.pos(posx, posy);
        this._scene.addChild(box);

        let boxBody: RigidBody = box.addComponent(RigidBody);
        boxBody.applyOwnerColliderComponent = false;
        let shapes = [];
        let box1Shape: BoxShape2D = new BoxShape2D();
        box1Shape.width = width + height * 2;
        box1Shape.height = height;
        box1Shape.x = off;
        box1Shape.y = off;

        let box2Shape: BoxShape2D = new BoxShape2D();
        box2Shape.width = width + height * 2;
        box2Shape.height = height;
        box2Shape.x = off;
        box2Shape.y = width + height + off;

        let box3Shape: BoxShape2D = new BoxShape2D();
        box3Shape.width = height;
        box3Shape.height = width + height * 2;
        box3Shape.x = off;
        box3Shape.y = off;

        let box4Shape: BoxShape2D = new BoxShape2D();
        box4Shape.width = height;
        box4Shape.height = width + height * 2;
        box4Shape.x = width + height + off;
        box4Shape.y = off;

        shapes.push(box1Shape);
        shapes.push(box2Shape);
        shapes.push(box3Shape);
        shapes.push(box4Shape);
        boxBody.shapes = shapes;
        let revoluteJoint = new RevoluteJoint();
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
        this._scene.addChild(sp);
        sp.x = Laya.stage.width / 2;
        sp.y = Laya.stage.height / 2;
        let boxBody = sp.addComponent(RigidBody);
        boxBody.applyOwnerColliderComponent = false;
        let boxshape = new BoxShape2D();
        boxshape.width = 5;
        boxshape.height = 5;
        let shapes = [boxshape];
        boxBody.shapes = shapes;
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
    }
}
