/**
description
 实现物理引擎中的碰撞过滤和分组，控制不同形状物体的碰撞规则
 */
import { Config } from "Config";
import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { MouseJoint } from "laya/physics/joint/MouseJoint";
import { RigidBody } from "laya/physics/RigidBody";
import { Stat } from "laya/utils/Stat";
import { Main } from "../Main";
import { Physics2D } from "laya/physics/Physics2D";
import { Scene } from "laya/display/Scene";
import { Physics2DWorldManager } from "laya/physics/Physics2DWorldManager";
import { EPhycis2DBlit, FilterData } from "laya/physics/factory/IPhysics2DFactory";
import { StaticCollider } from "laya/physics/StaticCollider";
import { ChainShape2D } from "laya/physics/Shape/ChainShape2D";
import { BoxShape2D } from "laya/physics/Shape/BoxShape2D";
import { PolygonShape2D } from "laya/physics/Shape/PolygonShape2D";
import { CircleShape2D } from "laya/physics/Shape/CircleShape2D";
import { Physics2DShapeBase } from "laya/physics/Shape/Physics2DShapeBase";
/**
 * 碰撞过滤器
 */
export class Physics_CollisionFiltering_Shapes {
    Main: typeof Main = null;
    public static k_smallGroup = 1;
    public static k_middleGroup = 0;
    public static k_largeGroup = -1;
    public static k_triangleCategory = 0x2;
    public static k_boxCategory = 0x4;
    public static k_circleCategory = 0x8;
    public static k_triangleMask = 0xF;
    public static k_boxMask = 0xF ^ Physics_CollisionFiltering_Shapes.k_circleCategory;
    public static k_circleMask = Physics_CollisionFiltering_Shapes.k_triangleCategory | Physics_CollisionFiltering_Shapes.k_boxCategory | 0x01; // 0x01为house刚体默认的category，若不设置，则会穿透house
    private curTarget: Sprite;
    private preMovementX: number = 0;
    private preMovementY: number = 0;
    _scene: Scene;

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
            this.createHouse();
            for (let i = 1; i <= 3; i++) {
                this.createBox(300, 300, 20, 20, i);
                this.createTriangle(500, 300, 20, i);
                this.createCircle(700, 300, 10, i);
            }
        });
    }

    createHouse() {
        this._scene = new Scene();
        this.Main.box2D.addChild(this._scene);

        let man: Physics2DWorldManager = this._scene.getComponentElementManager(Physics2DWorldManager.__managerName) as Physics2DWorldManager;
        man.enableDebugDraw(true, EPhycis2DBlit.Shape);
        man.enableDebugDraw(true, EPhycis2DBlit.Joint);

        let house = new Sprite();
        this._scene.addChild(house);

        let rigidbody: StaticCollider = house.addComponent(StaticCollider);
        let chainShape: ChainShape2D = new ChainShape2D();
        chainShape.loop = true;
        chainShape.datas = [600, 50, 100, 200, 100, 600, 1100, 600, 1100, 200];
        rigidbody.shapes = [chainShape];
    }

    createBox(posx, posy, width, height, ratio) {
        let box = new Sprite();
        box.on(Event.MOUSE_DOWN, this, this.mouseDown);
        this._scene.addChild(box);
        box.pos(posx, posy).size(width * ratio, height * ratio);
        let rigidbody: RigidBody = box.addComponent(RigidBody);
        rigidbody.applyOwnerColliderComponent = false;
        let boxShape: BoxShape2D = new BoxShape2D();
        boxShape.width = width * ratio;
        boxShape.height = height * ratio;
        let filter = new FilterData();
        filter.category = Physics_CollisionFiltering_Shapes.k_boxCategory;
        filter.mask = Physics_CollisionFiltering_Shapes.k_boxMask;

        this.addGroup(ratio, boxShape);
        rigidbody.shapes = [boxShape];
    }

    createTriangle(posx, posy, side, ratio) {
        let triangle = new Sprite();
        triangle.on(Event.MOUSE_DOWN, this, this.mouseDown);
        this._scene.addChild(triangle);
        triangle.pos(posx, posy).size(side * ratio, side * ratio);

        let rigidbody: RigidBody = triangle.addComponent(RigidBody);
        rigidbody.applyOwnerColliderComponent = false;
        let polygonShape: PolygonShape2D = new PolygonShape2D();
        polygonShape.datas = [0, 0, 0, side * ratio, side * ratio, 0];
        polygonShape.filterData.category = Physics_CollisionFiltering_Shapes.k_triangleCategory;
        polygonShape.filterData.mask = Physics_CollisionFiltering_Shapes.k_triangleMask;
        this.addGroup(ratio, polygonShape);
        rigidbody.shapes = [polygonShape];
    }

    createCircle(posx, posy, radius, ratio) {
        let circle = new Sprite();
        circle.on(Event.MOUSE_DOWN, this, this.mouseDown);
        this._scene.addChild(circle);
        circle.pos(posx, posy).size(radius * 2 * ratio, radius * 2 * ratio);
        circle.pivot(0.5, 0.5)
        let rigidbody: RigidBody = circle.addComponent(RigidBody);
        rigidbody.applyOwnerColliderComponent = false;
        let circleShape: CircleShape2D = new CircleShape2D();
        circleShape.radius = radius * ratio;
        circleShape.filterData.category = Physics_CollisionFiltering_Shapes.k_circleCategory;
        circleShape.filterData.mask = Physics_CollisionFiltering_Shapes.k_circleMask;
        this.addGroup(ratio, circleShape);
        rigidbody.shapes = [circleShape];
    }

    addGroup(ratio: number, shape: Physics2DShapeBase) {
        switch (ratio) {
            case 1:
                shape.filterData.group = Physics_CollisionFiltering_Shapes.k_smallGroup;
                break;
            case 2:
                shape.filterData.group = Physics_CollisionFiltering_Shapes.k_middleGroup;
                break;
            case 3:
                shape.filterData.group = Physics_CollisionFiltering_Shapes.k_largeGroup;
                break;
        }
    }

    mouseDown(e) {
        this.curTarget = e.target;
        // 方案一，使用 MouseJoint
        let mouseJoint: MouseJoint = this.curTarget.addComponent(MouseJoint);
        Laya.timer.callLater(mouseJoint, (<any>mouseJoint)._onMouseDown);
        Laya.stage.on(Event.MOUSE_UP, this, this.destoryJoint);
        Laya.stage.on(Event.MOUSE_OUT, this, this.destoryJoint);
        // 方案二，自己实现，可以实现更大程度的控制
        // Laya.stage.on(Event.MOUSE_MOVE, this, this.mouseMove);
        // Laya.stage.on(Event.MOUSE_UP, this, this.mouseUp);
        // Laya.stage.on(Event.MOUSE_OUT, this, this.mouseUp);
        // let rigidbody = this.curTarget.getComponent(RigidBody);
        // rigidbody.type = "kinematic";
    }

    mouseMove(e) {
        let movementX = e.nativeEvent.movementX;
        let movementY = e.nativeEvent.movementY;
        this.preMovementX = movementX;
        this.preMovementY = movementY;
        this.curTarget.pos(Laya.stage.mouseX, Laya.stage.mouseY);
    }

    mouseUp() {
        Laya.stage.off(Event.MOUSE_MOVE, this, this.mouseMove);
        Laya.stage.off(Event.MOUSE_UP, this, this.mouseUp);
        Laya.stage.off(Event.MOUSE_OUT, this, this.mouseUp);
        let rigidbody: RigidBody = this.curTarget.getComponent(RigidBody);
        rigidbody.type = "dynamic";
        rigidbody.linearVelocity = { x: this.preMovementX, y: this.preMovementY };
        this.curTarget = null;
    }

    destoryJoint() {
        Laya.stage.off(Event.MOUSE_UP, this, this.destoryJoint);
        Laya.stage.off(Event.MOUSE_OUT, this, this.destoryJoint);
        let mouseJoint: MouseJoint = this.curTarget.getComponent(MouseJoint);
        mouseJoint.destroy();
        this.curTarget = null;
    }

    dispose() {
        Laya.stage.off(Event.MOUSE_MOVE, this, this.mouseMove);
        Laya.stage.off(Event.MOUSE_UP, this, this.mouseUp);
        Laya.stage.off(Event.MOUSE_OUT, this, this.mouseUp);
        Laya.stage.off(Event.MOUSE_UP, this, this.destoryJoint);
        Laya.stage.off(Event.MOUSE_OUT, this, this.destoryJoint);
    }
}