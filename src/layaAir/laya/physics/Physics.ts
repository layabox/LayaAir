import { BoxCollider } from "./BoxCollider";
import { ChainCollider } from "./ChainCollider";
import { CircleCollider } from "./CircleCollider";
import { PolygonCollider } from "./PolygonCollider";
import { RigidBody } from "./RigidBody";
import { PhysicsDebugDraw } from "./PhysicsDebugDraw";
import { Laya } from "../../Laya";
import { Sprite } from "../display/Sprite"
import { Event } from "../events/Event"
import { EventDispatcher } from "../events/EventDispatcher"
import { Point } from "../maths/Point"
import { DistanceJoint } from "./joint/DistanceJoint"
import { GearJoint } from "./joint/GearJoint"
import { MotorJoint } from "./joint/MotorJoint"
import { MouseJoint } from "./joint/MouseJoint"
import { PrismaticJoint } from "./joint/PrismaticJoint"
import { PulleyJoint } from "./joint/PulleyJoint"
import { RevoluteJoint } from "./joint/RevoluteJoint"
import { RopeJoint } from "./joint/RopeJoint"
import { WeldJoint } from "./joint/WeldJoint"
import { WheelJoint } from "./joint/WheelJoint"
import { ClassUtils } from "../utils/ClassUtils"
import { IPhysics } from "./IPhysics";
import { DestructionListener } from "./DestructionListener";
/**
 * 2D物理引擎，使用Box2d驱动
 */
export class Physics extends EventDispatcher {
    /**2D游戏默认单位为像素，物理默认单位为米，此值设置了像素和米的转换比率，默认50像素=1米*/
    static PIXEL_RATIO: number = 50;
    /**@private */
    private static _I: Physics;

    /**Box2d引擎的全局引用，更多属性和api请参考 http://box2d.org */
    box2d: any = (<any>window).box2d;
    /**[只读]物理世界引用，更多属性请参考官网 */
    world: any;
    /**旋转迭代次数，增大数字会提高精度，但是会降低性能*/
    velocityIterations: number = 8;
    /**位置迭代次数，增大数字会提高精度，但是会降低性能*/
    positionIterations: number = 3;

    /**@private 是否已经激活*/
    private _enabled: boolean;
    /**@private 根容器*/
    private _worldRoot: Sprite;
    /**@private 空的body节点，给一些不需要节点的关节使用*/
    _emptyBody: any;
    /**@private */
    _eventList: any[] = [];

    /**全局物理单例*/
    static get I(): Physics {
        return Physics._I || (Physics._I = new Physics());
    }

    constructor() {
        super();
    }

    /**
     * 开启物理世界
     * options值参考如下：
       allowSleeping:true,
       gravity:10,
       customUpdate:false 自己控制物理更新时机，自己调用Physics.update
     */
    static enable(options: any = null): void {
        Physics.I.start(options);
        IPhysics.RigidBody = RigidBody;
        IPhysics.Physics = this;
    }

    /**
     * 开启物理世界
     * options值参考如下：
       allowSleeping:true,
       gravity:10,
       customUpdate:false 自己控制物理更新时机，自己调用Physics.update
     */
    start(options: any = null): void {
        if (!this._enabled) {
            this._enabled = true;

            options || (options = {});
            var box2d: any = (<any>window).box2d;
            if (box2d == null) {
                console.error("Can not find box2d libs, you should request box2d.js first.");
                return;
            }

            var gravity: any = new box2d.b2Vec2(0, options.gravity || 500 / Physics.PIXEL_RATIO);
            this.world = new box2d.b2World(gravity);
            this.world.SetDestructionListener(new DestructionListener());
            this.world.SetContactListener(new ContactListener());
            this.allowSleeping = options.allowSleeping == null ? true : options.allowSleeping;
            if (!options.customUpdate) Laya.physicsTimer.frameLoop(1, this, this._update);
            this._emptyBody = this._createBody(new (<any>window).box2d.b2BodyDef());
        }
    }

    private _update(): void {
        var delta = Laya.timer.delta / 1000;
        if (delta > .033) { // 时间步太长，会导致错误穿透
            delta = .033;
        }
        this.world.Step(delta, this.velocityIterations, this.positionIterations, 3);
        var len: number = this._eventList.length;
        if (len > 0) {
            for (var i: number = 0; i < len; i += 2) {
                this._sendEvent(this._eventList[i], this._eventList[i + 1]);
            }
            this._eventList.length = 0;
        }
    }

    private _sendEvent(type: number, contact: any): void {
        var colliderA: any = contact.GetFixtureA().collider;
        var colliderB: any = contact.GetFixtureB().collider;
        var ownerA: any = colliderA.owner;
        var ownerB: any = colliderB.owner;
        contact.getHitInfo = function (): any {
            var manifold: any = new this.box2d.b2WorldManifold();
            this.GetWorldManifold(manifold);
            //第一点？
            var p: any = manifold.points[0];
            p.x *= Physics.PIXEL_RATIO;
            p.y *= Physics.PIXEL_RATIO;
            return manifold;
        }
        if (ownerA) {
            var args: any[] = [colliderB, colliderA, contact];
            if (type === 0) {
                ownerA.event(Event.TRIGGER_ENTER, args);
                if (!ownerA["_triggered"]) {
                    ownerA["_triggered"] = true;
                } else {
                    ownerA.event(Event.TRIGGER_STAY, args);
                }
            } else {
                ownerA["_triggered"] = false;
                ownerA.event(Event.TRIGGER_EXIT, args);
            }
        }
        if (ownerB) {
            args = [colliderA, colliderB, contact];
            if (type === 0) {
                ownerB.event(Event.TRIGGER_ENTER, args);
                if (!ownerB["_triggered"]) {
                    ownerB["_triggered"] = true;
                } else {
                    ownerB.event(Event.TRIGGER_STAY, args);
                }
            } else {
                ownerB["_triggered"] = false;
                ownerB.event(Event.TRIGGER_EXIT, args);
            }
        }
    }

    /**@private */
    _createBody(def: any): any {
        if (this.world) {
            return this.world.CreateBody(def);
        } else {
            console.error('The physical engine should be initialized first.use "Physics.enable()"');
            return null;
        }
    }

    /**@private */
    _removeBody(body: any): void {
        if (this.world) {
            this.world.DestroyBody(body);
        } else {
            console.error('The physical engine should be initialized first.use "Physics.enable()"');
        }
    }

    /**@private */
    _createJoint(def: any): any {
        if (this.world) {
            let joint = this.world.CreateJoint(def);
            joint.m_userData = {};
            joint.m_userData.isDestroy = false;
            return joint;
        } else {
            console.error('The physical engine should be initialized first.use "Physics.enable()"');
            return null;
        }
    }

    /**@private */
    _removeJoint(joint: any): void {
        if (this.world) {
            this.world.DestroyJoint(joint);
        } else {
            console.error('The physical engine should be initialized first.use "Physics.enable()"');
        }
    }

    /**
     * 停止物理世界
     */
    stop(): void {
        Laya.physicsTimer.clear(this, this._update);
    }

    /**
     * 设置是否允许休眠，休眠可以提高稳定性和性能，但通常会牺牲准确性
     */
    get allowSleeping(): boolean {
        return this.world.GetAllowSleeping();
    }

    set allowSleeping(value: boolean) {
        this.world.SetAllowSleeping(value);
    }

    /**
     * 物理世界重力环境，默认值为{x:0,y:1}
     * 如果修改y方向重力方向向上，可以直接设置gravity.y=-1;
     */
    get gravity(): any {
        return this.world.GetGravity();
    }

    set gravity(value: any) {
        this.world.SetGravity(value);
    }

    /**获得刚体总数量*/
    getBodyCount(): number {
        return this.world.GetBodyCount();
    }

    /**获得碰撞总数量*/
    getContactCount(): number {
        return this.world.GetContactCount();
    }

    /**获得关节总数量*/
    getJointCount(): number {
        return this.world.GetJointCount();
    }

    /**物理世界根容器，将根据此容器作为物理世界坐标世界，进行坐标变换，默认值为stage
     * 设置特定容器后，就可整体位移物理对象，保持物理世界不变。
     * 注意，仅会在 set worldRoot 时平移一次，其他情况请配合 updatePhysicsByWorldRoot 函数使用*/
    get worldRoot(): Sprite {
        return this._worldRoot || Laya.stage;
    }

    set worldRoot(value: Sprite) {
        this._worldRoot = value;
        if (value) {
            //TODO：
            var p: Point = value.localToGlobal(Point.TEMP.setTo(0, 0));
            this.world.ShiftOrigin({ x: -p.x / Physics.PIXEL_RATIO, y: -p.y / Physics.PIXEL_RATIO });
        }
    }

    /**
     * 设定 worldRoot 后，手动触发物理世界更新
     */
    updatePhysicsByWorldRoot() {
        if (!!this.worldRoot) {
            var p: Point = this.worldRoot.localToGlobal(Point.TEMP.setTo(0, 0));
            this.world.ShiftOrigin({ x: -p.x / Physics.PIXEL_RATIO, y: -p.y / Physics.PIXEL_RATIO });
        }
    }
}

ClassUtils.regClass("laya.physics.Physics", Physics);
ClassUtils.regClass("Laya.Physics", Physics);

// import { Physics } from "./Physics"

/**@private */
class ContactListener {
    BeginContact(contact: any): void {
        Physics.I._eventList.push(0, contact);
        //console.log("BeginContact", contact);	
    }

    EndContact(contact: any): void {
        Physics.I._eventList.push(1, contact);
        //console.log("EndContact", contact);
    }

    PreSolve(contact: any, oldManifold: any): void {
        //console.log("PreSolve", contact);
    }

    PostSolve(contact: any, impulse: any): void {
        //console.log("PostSolve", contact);
    }
}
