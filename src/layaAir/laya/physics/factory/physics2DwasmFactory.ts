
import { ILaya } from "../../../ILaya";
import { Sprite } from "../../display/Sprite";
import { Point } from "../../maths/Point";
import { IV2, Vector2 } from "../../maths/Vector2";
import { ColliderBase } from "../Collider2D/ColliderBase";
import { FixtureBox2DDef } from "../Collider2D/ColliderStructInfo";
import { IPhysiscs2DFactory } from "../IPhysiscs2DFactory";
import { Physics2D } from "../Physics2D";
import { Physics2DOption } from "../Physics2DOption";
import { Physics2DDebugDraw } from "../Physics2DDebugDraw";
import { RigidBody2DInfo } from "../RigidBody2DInfo";
import { physics2D_DistancJointDef, physics2D_GearJointDef, physics2D_MotorJointDef, physics2D_MouseJointJointDef, physics2D_PrismaticJointDef, physics2D_PulleyJointDef, physics2D_RevoluteJointDef, physics2D_WeldJointDef, physics2D_WheelJointDef } from "../joint/JointDefStructInfo"

const b2_maxFloat = 1E+37;

/**
 * 实现Box2D c++  2.4.1 版本
 */
export class physics2DwasmFactory implements IPhysiscs2DFactory {
    private _tempVe21: any;
    private _tempVe22: any;

    /**@internal box2D Engine */
    _box2d: any;

    /**@internal box2D world */
    _world: any;

    /**@internal  */
    _debugDraw: Physics2DDebugDraw;

    /**@internal  */
    private _jsDraw: any;

    /**@internal 旋转迭代次数，增大数字会提高精度，但是会降低性能*/
    _velocityIterations: number = 8;

    /**@internal 位置迭代次数，增大数字会提高精度，但是会降低性能*/
    _positionIterations: number = 3;

    /**@internal 像素转换米的转换比率*/
    _PIXEL_RATIO: number;

    /**@internal 米转换像素的转换比率*/
    _Re_PIXEL_RATIO: number;

    /**@internal  */
    _tempVec2: any;

    /**@internal  */
    protected _tempDistanceJointDef: any;

    /**@internal  */
    protected _tempGearJoinDef: any;

    /**@internal  */
    protected _tempPulleyJointDef: any;

    /**@internal  */
    protected _tempWheelJointDef: any;

    /**@internal  */
    protected _tempWeldJointDef: any;

    /**@internal  */
    protected _tempMouseJointDef: any;

    /**@internal  */
    protected _tempRevoluteJointDef: any;

    /**@internal  */
    protected _tempMotorJointDef: any;

    /**@internal  */
    protected _tempPrismaticJointDef: any;

    /** 
    * @internal
    */
    get drawFlags_none(): number {
        return 0;
    }

    /** 
     * @internal
     */
    get drawFlags_shapeBit(): number {
        return this._box2d.b2Draw.e_shapeBit;
    }

    /** 
     * @internal
     */
    get drawFlags_jointBit(): number {
        return this._box2d.b2Draw.e_jointBit;
    }

    /** 
     * @internal
     */
    get drawFlags_aabbBit(): number {
        return this._box2d.b2Draw.e_aabbBit;
    }

    /** 
     * @internal
     */
    get drawFlags_pairBit(): number {
        return this._box2d.b2Draw.e_pairBit;
    }

    /** 
     * @internal
     */
    get drawFlags_centerOfMassBit(): number {
        return this._box2d.b2Draw.e_centerOfMassBit;
    }

    /** 
     * @internal
     */
    get drawFlags_all(): number {
        return 63;
    }

    /** 
     * @internal
     */
    get box2d(): any {
        return this._box2d;
    }

    /** 
     * @internal
     */
    get world(): any {
        return this._world;
    }

    /** 
     * @internal
     */
    get debugDraw(): Physics2DDebugDraw {
        return this._debugDraw;
    }

    /** 
     * @internal
     */
    get PIXEL_RATIO(): number {
        return this._PIXEL_RATIO;
    }

    /** 
     * @internal
     */
    get velocityIterations(): number {
        return this._velocityIterations;
    }

    /** 
     * @internal
     */
    get positionIterations(): number {
        return this._positionIterations;
    }

    /**
     * @internal
     * 物理世界重力环境，默认值为{x:0,y:1}
     * 如果修改y方向重力方向向上，可以直接设置gravity.y=-1;
     */
    get gravity(): any {
        return this.world.GetGravity();
    }

    set gravity(value: Vector2) {
        var gravity: any = this.createPhyVec2(value.x, value.y);//TODO 全局设置，不必New
        this.world.SetGravity(gravity);
    }

    /**
     * @internal
     * 设置是否允许休眠，休眠可以提高稳定性和性能，但通常会牺牲准确性
     */
    get allowSleeping(): boolean {
        return this.world.GetAllowSleeping();
    }

    set allowSleeping(value: boolean) {
        this.world.SetAllowSleeping(value);
    }


    /**@internal 获得刚体总数量*/
    get bodyCount(): number {
        return this.world.GetBodyCount();
    }

    /**@internal 获得碰撞总数量*/
    get contactCount(): number {
        return this.world.GetContactCount();
    }

    /**@internal 获得关节总数量*/
    get jointCount(): number {
        return this.world.GetJointCount();
    }


    /**
     * @internal
     * 渲染系统数据转换为物理系统数据 
     */
    layaToPhyValue(value: number): number {
        return value * this._Re_PIXEL_RATIO;
    }

    /**
     * @internal
     * 物理系统数据转换为渲染系统数据 
     */
    phyToLayaValue(value: number): number {
        return value * this.PIXEL_RATIO;
    }

    /** 
     * @internal
     * 获得节点相对于物理根节点的坐标
     * @param node 节点
     * @param x (单位： 像素)
     * @param y (单位： 像素)
     * @param localToGlobal true :本地转全局 falsle：全局转本地
     */
    getLayaPosition(node: Sprite, anchorx: number = 0, anchory: number = 0, localToGlobal: boolean = true): Point {
        if (localToGlobal) {
            return node.localToGlobal(Point.TEMP.setTo(anchorx, anchory), false, Physics2D.I.worldRoot);
        } else {
            return node.globalToLocal(Point.TEMP.setTo(anchorx, anchory), false, Physics2D.I.worldRoot);
        }

    }

    /** 
     * @internal
     * 创建物理系统的Vec2
     * @param x (单位： 米)
     * @param y (单位： 米)
     */
    createPhyVec2(x: number, y: number): any {
        return new this.box2d.b2Vec2(x, y);
    }

    /** 
     * @internal
     * 创建物理系统的Vec2
     * @param x (单位： 像素)
     * @param y (单位： 像素)
     */
    createPhyFromLayaVec2(x: number, y: number): any {
        return new this.box2d.b2Vec2(this.layaToPhyValue(x), this.layaToPhyValue(y));
    }

    /**
     * initial box2D physics Engine
     * @returns 
     */
    initialize(): Promise<void> {
        return (window as any).Box2D().then((box2d: any) => {
            this._box2d = box2d;
            this._box2d.b2LinearStiffness = this.b2LinearStiffness;
            this._tempVe21 = new box2d.b2Vec2();
            this._tempVe22 = new box2d.b2Vec2();
            return Promise.resolve();
        });
    }

    /**
     * create Box2D world
     * @param options 
     */
    start(options: Physics2DOption) {
        this._PIXEL_RATIO = options.pixelTatio;
        this._Re_PIXEL_RATIO = 1 / options.pixelTatio;
        var gravity: any = this.createPhyFromLayaVec2(options.gravity.x, options.gravity.y);
        this._world = new this.box2d.b2World(gravity);
        this.world.SetDestructionListener(this.getDestructionListener());
        this.world.SetContactListener(this.getContactListener());
        this.allowSleeping = options.allowSleeping == null ? true : options.allowSleeping;
        this._velocityIterations = options.velocityIterations;
        this._positionIterations = options.positionIterations;
    }

    /**
    * @internal
    * destroy Box2D world
    * @param options 
    */
    destroyWorld() {
        let bodylist = this._world.GetBodyList();
        while(!this.isNullData(bodylist)){
            for(let fixture = bodylist.GetFixtureList();!this.isNullData(fixture);){
                fixture.GetUserData().pointer = -1;
                fixture = fixture.GetNext();
            }
            bodylist = bodylist.GetNext();
        }
        this.box2d.destroy(this._world)
        this._world = null;
        this._jsDraw = null;
        if (this._debugDraw) this._debugDraw.removeSelf()
        this._debugDraw = null;
    }

    /**
     * update Frame
     * @param delta 
     */
    update(delta: number): void {

        //set Physics Position from Engine TODO
        this._world & this._world.Step(delta, this.velocityIterations, this.positionIterations, 3);

        //set engine Position from Phyiscs TODO
    }

    /**
     * set Event CallBack
     * @param type 
     * @param contact 
     */
    sendEvent(type: number, contact: any): void {
        if (contact.GetFixtureA() == null || contact.GetFixtureB() == null) {
            return;
        }
        let colliderA: any = contact.GetFixtureA().collider;
        let colliderB: any = contact.GetFixtureB().collider;
        if(colliderA == null||colliderB == null){
            return;
        }
        if (colliderA.destroyed || colliderB.destroyed) {
            return;
        }
        let ownerA: any = colliderA.owner;
        let ownerB: any = colliderB.owner;
        let __this = this;
        contact.getHitInfo = function (): any {
            var manifold: any = new this.box2d.b2WorldManifold();
            this.GetWorldManifold(manifold);
            //第一点？
            let p: any = manifold.points[0];
            p.x = __this.phyToLayaValue(p.x);
            p.y = __this.phyToLayaValue(p.y);
            return manifold;
        }
        if (ownerA) {
            var args: any[] = [colliderB, colliderA, contact];
            if (type === 0) {
                ownerA.event("triggerenter", args);
                if (!ownerA["_triggered"]) {
                    ownerA["_triggered"] = true;
                } else {
                    ownerA.event("triggerstay", args);
                }
            } else {
                ownerA["_triggered"] = false;
                ownerA.event("triggerexit", args);
            }
        }
        if (ownerB) {
            args = [colliderA, colliderB, contact];
            if (type === 0) {
                ownerB.event("triggerenter", args);
                if (!ownerB["_triggered"]) {
                    ownerB["_triggered"] = true;
                } else {
                    ownerB.event("triggerstay", args);
                }
            } else {
                ownerB["_triggered"] = false;
                ownerB.event("triggerexit", args);
            }
        }
    }

    /** 
     * @internal
     * 创建物理绘制
     */
    createDebugDraw(flags: number) {
        if (this._debugDraw) return;
        this._debugDraw = new Physics2DDebugDraw(this);
        ILaya.stage.addChild(this._debugDraw);
        this._debugDraw.zOrder = 1000;

        if (this._jsDraw == null) {
            var jsDraw = this._jsDraw = new this.box2d.JSDraw();
            jsDraw.SetFlags(flags);
            jsDraw.DrawSegment = this.DrawSegment.bind(this);
            jsDraw.DrawPolygon = this.DrawPolygon.bind(this);
            jsDraw.DrawSolidPolygon = this.DrawSolidPolygon.bind(this);
            jsDraw.DrawCircle = this.DrawCircle.bind(this);
            jsDraw.DrawSolidCircle = this.DrawSolidCircle.bind(this);
            jsDraw.DrawTransform = this.DrawTransform.bind(this);
            jsDraw.DrawPoint = this.DrawPoint.bind(this);
        }

        this.world.SetDebugDraw(this._jsDraw);
    }

    /** 
     * @internal
     * 删除物理绘制
     */
    removeDebugDraw() {
        if (!this._debugDraw) return;
        this.world.SetDebugDraw(null);
        this._debugDraw.removeSelf()
        this._debugDraw.destroy()
        this._debugDraw = null;
    }

    /** 
     * @internal
     * 更新显示数据
     */
    setDebugFlag(flags: number): void {
        if (this._jsDraw) this._jsDraw.SetFlags(flags);
    }

    /** 
     * @internal
     * 显示标记
     */
    appendFlags(flags: number): void {
        if (this._jsDraw) this._jsDraw.AppendFlags(flags);
    }

    /** 
     * @internal
     * 清除标记
     */
    clearFlags(flags: number): void {
        if (this._jsDraw) this._jsDraw.ClearFlags(flags);
    }

    /** 
     * @internal
     * 移动世界中心点
     * @param x (单位： 像素)
     * @param y (单位： 像素)
     */
    shiftOrigin(x: number, y: number) {
        this._world & this.world.ShiftOrigin({ x: x, y: y });
    }

    /**
     * create Box2D Body
     * @param def 
     * @returns 
     */
    createBody(def: any) {
        if (!def) {
            def = new this.box2d.b2BodyDef()
        }
        def.userData = { pointer: 0 };
        if (this.world) {
            return this.world.CreateBody(def);
        } else {
            console.error('The physical engine should be initialized first.use "Physics.enable()"');
            return null;
        }
    }

    /**
     * remove Box2D Body
     * @param body 
     */
    removeBody(body: any): void {
        if (this.world) this.world.DestroyBody(body);
    }

    /**
    * create Box2D Joint
    * @param def 
    * @returns 
    */
    createJoint(def: any, cls: any = null): any {
        if (this.world) {
            let joint = this.world.CreateJoint(def);
            if (cls != null) {
                joint = this.castObject(joint, cls)
            }
            joint.m_userData = {};
            joint.m_userData.isDestroy = false;
            return joint;
        } else {
            console.error('The physical engine should be initialized first.use "Physics.enable()"');
            return null;
        }
    }

    /**
     * Remove Box2D Joint
     * @param joint 
     */
    removeJoint(joint: any): void {
        if (this.world)
            this.world.DestroyJoint(joint);
    }

    /** 
     * @param joint 
     */
    getJoint_userData(joint: any) {
        return joint.GetUserData();
    }

    /** 
     * @param joint 
     */
    getJoint_userData_destroy(joint: any): boolean {
        return joint.GetUserData().pointer == -1;
    }

    /** 
     * @param joint
     * @param enableMotor 
     */
    set_Joint_EnableMotor(joint: any, enableMotor: boolean): void {
        joint.EnableMotor(enableMotor);
    }

    /** 
     * @param joint 
     * @param motorSpeed 
     */
    set_Joint_SetMotorSpeed(joint: any, motorSpeed: number): void {
        joint.SetMotorSpeed(motorSpeed);
    }

    /** 
     * @param joint 
     * @param maxTorque 
     */
    set_Joint_SetMaxMotorTorque(joint: any, maxTorque: number): void {
        joint.SetMaxMotorTorque(maxTorque);
    }

    /** 
     * @param joint 
     * @param enableLimit 
     */
    set_Joint_EnableLimit(joint: any, enableLimit: boolean): void {
        joint.EnableLimit(enableLimit);
    }

    /** 
     * @param joint 
     * @param lowerAngle 
     * @param upperAngle 
     */
    set_Joint_SetLimits(joint: any, lowerAngle: number, upperAngle: number): void {
        joint.SetLimits(lowerAngle, upperAngle);
    }

    /** 
     * @param Joint 
     * @param frequency 
     * @param dampingRatio 
     * @param isdamping 
     */
    set_Joint_frequencyAndDampingRatio(Joint: any, frequency: number, dampingRatio: number, isdamping: boolean): void {
        let out: any = {}
        this.box2d.b2AngularStiffness(out, frequency, dampingRatio, Joint.GetBodyA(), Joint.GetBodyB());
        if (!isdamping) {
            Joint.SetStiffness(out.stiffness);
        }
        Joint.SetDamping(out.damping);
    }

    /** 
     * @param defStruct 
     * @returns
     */
    createDistanceJoint(defStruct: physics2D_DistancJointDef) {
        this._tempDistanceJointDef || (this._tempDistanceJointDef = new this.box2d.b2DistanceJointDef());
        const def = this._tempDistanceJointDef;
        def.bodyA = defStruct.bodyA;
        def.bodyB = defStruct.bodyB;
        def.localAnchorA.Set(this.layaToPhyValue(defStruct.localAnchorA.x), this.layaToPhyValue(defStruct.localAnchorA.y));
        def.localAnchorB.Set(this.layaToPhyValue(defStruct.localAnchorB.x), this.layaToPhyValue(defStruct.localAnchorB.y));

        this.b2LinearStiffness(def, defStruct.frequency, defStruct.dampingRatio, def.bodyA, def.bodyB);
        def.set_collideConnected(defStruct.collideConnected);

        if (defStruct.length > 0) {
            def.length = defStruct.length;
        } else {
            var p1: any = def.bodyA.GetWorldPoint(def.localAnchorA);
            let data = { x: p1.x, y: p1.y };
            var p2: any = def.bodyB.GetWorldPoint(def.localAnchorB);
            def.length = this.getVec2Length(data, p2);
        }

        if (defStruct.maxLength > 0)
            def.maxLength = this.layaToPhyValue(defStruct.maxLength);
        else
            def.maxLength = b2_maxFloat;

        if (defStruct.minLength > 0)
            def.minLength = this.layaToPhyValue(defStruct.minLength);
        else
            def.minLength = 0;

        return this.createJoint(def, this.box2d.b2DistanceJoint);
    }

    /** 
     * @param joint 
     * @param length 
     */
    set_DistanceJoint_length(joint: any, length: number) {
        joint.SetLength(this.layaToPhyValue(length));
    }

    /** 
     * @param joint 
     * @param length 
     */
    set_DistanceJoint_MaxLength(joint: any, length: number) {
        joint.SetMaxLength(this.layaToPhyValue(length));
    }

    /** 
     * @param joint 
     * @param length 
     */
    set_DistanceJoint_MinLength(joint: any, length: number) {
        joint.SetMinLength(this.layaToPhyValue(length));
    }

    /** 
     * @param joint 
     * @param steffness 
     * @param damping 
     */
    set_DistanceJointStiffnessDamping(joint: any, steffness: number, damping: number) {
        let out: any = {};
        let bodyA = joint.bodyA;
        let bodyB = joint.bodyB;
        this.box2d.b2LinearStiffness(out, steffness, damping, bodyA, bodyB);
        joint.SetStiffness(out.stiffness);
        joint.SetDamping(out.damping);
    }

    /** 
     * @param defStruct 
     * @returns
     */
    create_GearJoint(defStruct: physics2D_GearJointDef): void {
        this._tempGearJoinDef || (this._tempGearJoinDef = new this.box2d.b2GearJointDef());
        let def = this._tempGearJoinDef;
        def.bodyA = defStruct.bodyA;
        def.bodyB = defStruct.bodyB;
        def.joint1 = defStruct.joint1;
        def.joint2 = defStruct.joint2;
        def.ratio = defStruct.ratio;
        def.collideConnected = defStruct.collideConnected;
        return this.createJoint(def, this.box2d.b2GearJoint);
    }

    /** 
     * @param joint 
     * @param radio 
     */
    set_GearJoint_SetRatio(joint: any, radio: number): void {
        joint.SetRatio(radio);
    }

    /** 
     * @param defStruct 
     * @returns
     */
    create_PulleyJoint(defStruct: physics2D_PulleyJointDef): void {
        this._tempPulleyJointDef || (this._tempPulleyJointDef = new this.box2d.b2PulleyJointDef());
        let def = this._tempPulleyJointDef;
        let groundVecA = this.createPhyFromLayaVec2(defStruct.groundAnchorA.x, defStruct.groundAnchorA.y);
        let groundVecB = this.createPhyFromLayaVec2(defStruct.groundAnchorB.x, defStruct.groundAnchorB.y);
        let anchorVecA = this.createPhyFromLayaVec2(defStruct.localAnchorA.x, defStruct.localAnchorA.y);
        let anchorVecB = this.createPhyFromLayaVec2(defStruct.localAnchorB.x, defStruct.localAnchorB.y);
        def.Initialize(defStruct.bodyA, defStruct.bodyB, groundVecA, groundVecB, anchorVecA, anchorVecB, defStruct.ratio);
        def.collideConnected = defStruct.collideConnected;
        return this.createJoint(def, this.box2d.b2PulleyJoint);
    }

    /** 
     * @param defStruct 
     * @returns
     */
    create_WheelJoint(defStruct: physics2D_WheelJointDef) {
        this._tempWheelJointDef || (this._tempWheelJointDef = new this.box2d.b2WheelJointDef());
        let def = this._tempWheelJointDef;
        let anchorVec = this.createPhyFromLayaVec2(defStruct.anchor.x, defStruct.anchor.y);
        let axis = this.createPhyVec2(defStruct.axis.x, defStruct.axis.y);
        def.Initialize(defStruct.bodyA, defStruct.bodyB, anchorVec, axis);
        def.enableMotor = defStruct.enableMotor;
        def.motorSpeed = defStruct.motorSpeed;
        def.maxMotorTorque = defStruct.maxMotorTorque;
        this.b2LinearStiffness(def, defStruct.frequency, defStruct.dampingRatio, def.bodyA, def.bodyB);
        def.collideConnected = defStruct.collideConnected;
        def.enableLimit = defStruct.enableLimit;
        def.lowerTranslation = this.layaToPhyValue(defStruct.lowerTranslation);
        def.upperTranslation = this.layaToPhyValue(defStruct.upperTranslation);
        return this.createJoint(def, this.box2d.b2WheelJoint);
    }

    /** 
     * @param defStruct 
     * @returns
     */
    create_WeldJoint(defStruct: physics2D_WeldJointDef) {
        this._tempWeldJointDef || (this._tempWeldJointDef = new this.box2d.b2WeldJointDef());
        let def = this._tempWeldJointDef;
        let anchorVec = this.createPhyFromLayaVec2(defStruct.anchor.x, defStruct.anchor.y);
        def.Initialize(defStruct.bodyA, defStruct.bodyB, anchorVec);
        this.b2AngularStiffness(def, defStruct.frequency, defStruct.dampingRatio, defStruct.bodyA, defStruct.bodyB);
        def.collideConnected = defStruct.collideConnected;
        return this.createJoint(def, this.box2d.b2WeldJoint);
    }

    /** 
     * @param def 
     * @returns
     */
    create_MouseJoint(def: physics2D_MouseJointJointDef): any {
        this._tempMouseJointDef || (this._tempMouseJointDef = new this.box2d.b2MouseJointDef());
        this._tempMouseJointDef.bodyA = def.bodyA;
        this._tempMouseJointDef.bodyB = def.bodyB;
        this._tempMouseJointDef.target = this.createPhyFromLayaVec2(def.target.x, def.target.y);
        this._tempMouseJointDef.maxForce = def.maxForce * def.bodyB.GetMass();
        this._tempMouseJointDef.collideConnected = true;
        this.b2LinearStiffness(this._tempMouseJointDef, def.frequency, def.dampingRatio, def.bodyA, def.bodyB)
        return this.createJoint(this._tempMouseJointDef, this.box2d.b2MouseJoint);
    }

    /** 
     * @param joint 
     * @param x 
     * @param y 
     */
    set_MouseJoint_target(joint: any, x: number, y: number) {
        this._tempVe21.x = this.layaToPhyValue(x);
        this._tempVe21.y = this.layaToPhyValue(y);
        joint.SetTarget(this._tempVe21)
    }

    /** 
     * @param Joint 
     * @param frequency 
     * @param dampingRatio 
     */
    set_MouseJoint_frequencyAndDampingRatio(Joint: any, frequency: number, dampingRatio: number) {
        this.set_DistanceJointStiffnessDamping(Joint, frequency, dampingRatio);
    }

    /** 
     * @param def 
     * @returns
     */
    create_RevoluteJoint(def: physics2D_RevoluteJointDef): any {
        this._tempRevoluteJointDef || (this._tempRevoluteJointDef = new this.box2d.b2RevoluteJointDef());
        var anchorVec = this.createPhyFromLayaVec2(def.anchor.x, def.anchor.y);
        this._tempRevoluteJointDef.Initialize(def.bodyA, def.bodyB, anchorVec);
        this._tempRevoluteJointDef.enableMotor = def.enableMotor;
        this._tempRevoluteJointDef.motorSpeed = def.motorSpeed;
        this._tempRevoluteJointDef.maxMotorTorque = def.maxMotorTorque;
        this._tempRevoluteJointDef.enableLimit = def.enableLimit;
        this._tempRevoluteJointDef.lowerAngle = def.lowerAngle;
        this._tempRevoluteJointDef.upperAngle = def.upperAngle;
        this._tempRevoluteJointDef.collideConnected = def.collideConnected;
        return this.createJoint(this._tempRevoluteJointDef, this.box2d.b2RevoluteJoint);
    }

    /** 
     * @param def 
     * @returns
     */
    create_MotorJoint(def: physics2D_MotorJointDef): any {
        this._tempMotorJointDef || (this._tempMotorJointDef = new this.box2d.b2MotorJointDef());
        this._tempMotorJointDef.Initialize(def.bodyA, def.bodyB);
        this._tempMotorJointDef.linearOffset = this.createPhyFromLayaVec2(def.linearOffset.x, def.linearOffset.y);
        this._tempMotorJointDef.angularOffset = def.angularOffset;
        this._tempMotorJointDef.maxForce = def.maxForce;
        this._tempMotorJointDef.maxTorque = def.maxTorque;
        this._tempMotorJointDef.correctionFactor = def.correctionFactor;
        this._tempMotorJointDef.collideConnected = def.collideConnected;
        return this.createJoint(this._tempMotorJointDef);
    }

    /** 
     * @param joint 
     * @param x 
     * @param y 
     */
    set_MotorJoint_linearOffset(joint: any, x: number, y: number): void {
        joint.SetLinearOffset(this.createPhyFromLayaVec2(x, y));
    }

    /** 
     * @param joint 
     * @param angular
     */
    set_MotorJoint_SetAngularOffset(joint: any, angular: number): void {
        joint.SetAngularOffset(angular);
    }

    /** 
     * @param joint 
     * @param maxForce 
     */
    set_MotorJoint_SetMaxForce(joint: any, maxForce: number): void {
        joint.SetMaxForce(maxForce);
    }

    /** 
     * @param joint 
     * @param maxTorque 
     */
    set_MotorJoint_SetMaxTorque(joint: any, maxTorque: number): void {
        joint.SetMaxTorque(maxTorque);
    }

    /** 
     * @param joint 
     * @param correctionFactor 
     */
    set_MotorJoint_SetCorrectionFactor(joint: any, correctionFactor: number): void {
        joint.SetCorrectionFactor(correctionFactor);
    }

    /** 
     * @param def 
     * @returns
     */
    create_PrismaticJoint(def: physics2D_PrismaticJointDef): any {
        this._tempPrismaticJointDef || (this._tempPrismaticJointDef = new this.box2d.b2PrismaticJointDef());
        let tdef = this._tempPrismaticJointDef;
        let anchorVec = this.createPhyFromLayaVec2(def.anchor.x, def.anchor.y);
        let axis = this.createPhyVec2(def.axis.x, def.axis.y);
        tdef.Initialize(def.bodyA, def.bodyB, anchorVec, axis);
        tdef.enableMotor = def.enableMotor;
        tdef.motorSpeed = def.motorSpeed;
        tdef.maxMotorForce = def.maxMotorForce;
        tdef.enableLimit = def.enableLimit;
        tdef.lowerTranslation = this.layaToPhyValue(def.lowerTranslation);
        tdef.upperTranslation = this.layaToPhyValue(def.upperTranslation);
        tdef.collideConnected = def.collideConnected;
        return this.createJoint(tdef, this.box2d.b2PrismaticJoint);
    }

    /** 
     * @returns
     */
    create_boxColliderShape() {
        return new this.box2d.b2PolygonShape();
    }

    /** 
     * @param shape 
     * @param width 
     * @param height 
     * @param pos 
     * 
     */
    set_collider_SetAsBox(shape: any, width: number, height: number, pos: IV2) {
        width = this.layaToPhyValue(width);
        height = this.layaToPhyValue(height);
        shape.SetAsBox(width, height, this.createPhyFromLayaVec2(pos.x, pos.y), 0);
    }

    /** 
     * @returns
     */
    create_ChainShape() {
        return new this.box2d.b2ChainShape();
    }

    /** 
     * @param shape 
     * @param x 
     * @param y 
     * @param arr 
     * @param loop 
     */
    set_ChainShape_data(shape: any, x: number, y: number, arr: any[], loop: boolean) {
        let len = arr.length;
        var ps: any[] = [];
        for (var i: number = 0, n: number = len; i < n; i += 2) {
            ps.push(x + parseInt(arr[i]))
            ps.push(y + parseInt(arr[i + 1]))
        }
        var ptr_wrapped = this.createWrapPointer(ps);
        if (loop) {
            shape.CreateLoop(ptr_wrapped, len / 2);
        } else {
            shape.CreateChain(ptr_wrapped, len / 2);
        }
    }

    /** 
     * @returns
     */
    create_CircleShape() {
        return new this.box2d.b2CircleShape();
    }


    /** 
     * @param shape 
     * @param radius 
     */
    set_CircleShape_radius(shape: any, radius: number) {
        shape.m_radius = this.layaToPhyValue(radius);
    }

    /** 
     * @param shape 
     * @param x 
     * @param y 
     */
    set_CircleShape_pos(shape: any, x: number, y: number) {
        shape.m_p.Set(this.layaToPhyValue(x), this.layaToPhyValue(y));
    }

    /** 
     * @returns
     */
    create_EdgeShape() {
        return new this.box2d.b2EdgeShape();
    }

    /** 
     * @param shape 
     * @param x 
     * @param y 
     * @param arr 
     */
    set_EdgeShape_data(shape: any, x: number, y: number, arr: any[]) {
        let len = arr.length;
        var ps: any[] = [];
        for (var i: number = 0, n: number = len; i < n; i += 2) {
            ps.push(this.createPhyFromLayaVec2(x + parseInt(arr[i]), y + parseInt(arr[i + 1])));
        }
        shape.SetTwoSided(ps[0], ps[1])
    }

    /** 
     * @returns
     */
    create_PolygonShape() {
        return new this.box2d.b2PolygonShape();
    }


    /** 
    * @param shape 
    * @param x 
    * @param y 
    * @param arr 
    */
    set_PolygonShape_data(shape: any, x: number, y: number, arr: any[]) {
        let len = arr.length;
        var ps: any[] = [];
        for (var i: number = 0, n: number = len; i < n; i += 2) {
            ps.push(x + parseInt(arr[i]))
            ps.push(y + parseInt(arr[i + 1]))
        }
        shape.Set(this.createWrapPointer(ps), len / 2);
    }

    /**
     * create fixture descript
     * @param fixtureDef 
     * @returns 
     */
    createFixtureDef(fixtureDef: FixtureBox2DDef) {
        var def: any = new this.box2d.b2FixtureDef();
        def.density = fixtureDef.density;
        def.friction = fixtureDef.friction;
        def.isSensor = fixtureDef.isSensor;
        def.restitution = fixtureDef.restitution;
        def.shape = fixtureDef.shape;
        def.world = this._world;
        return this.castObject(def, this.box2d.b2FixtureDef);
    }

    /** 
     * @param def 
     * @param groupIndex 
     */
    set_fixtureDef_GroupIndex(def: any, groupIndex: number) {
        def.filter.groupIndex = groupIndex;
    }

    /** 
     * @param def 
     * @param categoryBits 
     */
    set_fixtureDef_CategoryBits(def: any, categoryBits: number) {
        def.filter.categoryBits = categoryBits;
    }

    /** 
     * @param def 
     * @param maskbits 
     */
    set_fixtureDef_maskBits(def: any, maskbits: number) {
        def.filter.maskBits = maskbits;
    }

    /**
    * create fixture by body and def
    * @param body 
    * @param def 
    */
    createfixture(body: any, def: any) {
        let data = body.CreateFixture(def);
        data.world = this._world;
        return data;
    }

    /** 
     * @param fixture 
     * @param instance 
     */
    set_fixture_collider(fixture: any, instance: ColliderBase) {
        fixture.collider = instance;
    }

    /** 
     * @param fixture 
     */
    get_fixture_body(fixture: any): any {
        return fixture.GetBody()
    }

    /** 
     * @param fixture 
     */
    destroy_fixture(fixture: any) {
        if (fixture.world == this._world) fixture.__destroy__();
    }

    /** 
     * @param body 
     * @param fixture 
     */
    rigidBody_DestroyFixture(body: any, fixture: any) {
        body.DestroyFixture(fixture);
    }

    /** 
     * @param rigidbodyDef 
     * @returns
     */
    rigidBodyDef_Create(rigidbodyDef: RigidBody2DInfo): any {
        var def: any = new this.box2d.b2BodyDef();
        def.position.Set(this.layaToPhyValue(rigidbodyDef.position.x), this.layaToPhyValue(rigidbodyDef.position.y));
        def.angle = rigidbodyDef.angle;
        def.allowSleep = rigidbodyDef.allowSleep;
        def.angularDamping = rigidbodyDef.angularDamping;
        def.angularVelocity = rigidbodyDef.angularVelocity;
        def.bullet = rigidbodyDef.bullet;
        def.fixedRotation = rigidbodyDef.fixedRotation;
        def.gravityScale = rigidbodyDef.gravityScale;
        def.linearDamping = rigidbodyDef.linearDamping;
        def.linearVelocity = new this.box2d.b2Vec2(this.layaToPhyValue(rigidbodyDef.linearVelocity.x), this.layaToPhyValue(rigidbodyDef.linearVelocity.y));
        def.type = this.getbodyType(rigidbodyDef.type);
        return this.createBody(def);
    }

    /** 
     * @param body 
     * @param v2 
     */
    get_RigidBody_Position(body: any, v2: Vector2) {
        var pos: any = body.GetPosition();
        v2.setValue(this.phyToLayaValue(pos.x), this.phyToLayaValue(pos.y));
    }


    /** 
     * @param body 
     * @returns
     */
    get_RigidBody_Angle(body: any): number {
        return body.GetAngle();
    }

    /** 
     * @param body 
     * @param x 
     * @param y 
     * @param angle 
     */
    set_RigibBody_Transform(body: any, x: number, y: number, angle: any) {
        body.SetTransform(this.createPhyFromLayaVec2(x, y), angle);
    }

    /** 
     * @param body 
     * @param x 
     * @param y 
     * @returns
     */
    get_rigidBody_WorldPoint(body: any, x: number, y: number): IV2 {
        let data = body.GetWorldPoint(this.createPhyFromLayaVec2(x, y))
        let point: IV2 = { x: 0, y: 0 }
        point.x = this.phyToLayaValue(data.x);
        point.y = this.phyToLayaValue(data.y);
        return point;
    }

    /** 
     * @param body 
     * @param x 
     * @param y 
     */
    get_rigidBody_LocalPoint(body: any, x: number, y: number): IV2 {
        let data = body.GetLocalPoint(this.createPhyFromLayaVec2(x, y))
        let point: IV2 = { x: 0, y: 0 }
        point.x = this.phyToLayaValue(data.x);
        point.y = this.phyToLayaValue(data.y);
        return point;
    }

    /** 
     * @param body 
     * @param force 
     * @param position 
     */
    rigidBody_applyForce(body: any, force: IV2, position: IV2) {
        this._tempVe21.x = this.layaToPhyValue(position.x);
        this._tempVe21.y = this.layaToPhyValue(position.y);
        this._tempVe22.x = force.x;
        this._tempVe22.y = force.y;
        body.ApplyForce(this._tempVe22, this._tempVe21, false);
    }

    /** 
     * @param body 
     * @param force 
     */
    rigidBody_applyForceToCenter(body: any, force: IV2) {
        body.ApplyForceToCenter(force);
    }


    /** 
     * @param body 
     * @param impulse 
     * @param position 
     */
    rigidbody_ApplyLinearImpulse(body: any, impulse: IV2, position: IV2) {
        body.ApplyLinearImpulse(impulse, position);
    }

    /** 
     * @param body 
     */
    rigidbody_ApplyLinearImpulseToCenter(body: any, impulse: IV2) {
        body.ApplyLinearImpulseToCenter(impulse);
    }


    /**
    * 对刚体施加扭矩，使其旋转
    * @param	torque	施加的扭矩
    */
    rigidbody_applyTorque(body: any, torque: number): void {
        body.ApplyTorque(torque);
    }

    /**
     * 设置速度，比如{x:10,y:10}
     * @param	velocity
     */
    set_rigidbody_Velocity(body: any, velocity: IV2): void {
        body.SetLinearVelocity(velocity);
    }

    /**
     * 设置角度
     * @param	value 单位为弧度
     */
    set_rigidbody_Awake(body: any, awake: boolean): void {
        body.SetAwake(awake);
    }

    /** 
     * 获得刚体质量
     * @param body 
     * @returns
     */
    get_rigidbody_Mass(body: any): number {
        return body.GetMass();
    }

    /**
     * 获得质心的相对节点0,0点的位置偏移
     * @param body 
     * @returns
     */
    get_rigidBody_Center(body: any): IV2 {
        let value = body.GetLocalCenter();
        let point: IV2 = { x: 0, y: 0 }
        point.x = this.phyToLayaValue(value.x);
        point.y = this.phyToLayaValue(value.y);
        return point;
    }

    /** 
     * @param body 
     */
    get_rigidBody_IsAwake(body: any) {
        return body.IsAwake();
    }

    /**
     * 获得质心的世界坐标，相对于Physics.I.worldRoot节点
     * @param body 
     * @returns
     */
    get_rigidBody_WorldCenter(body: any): IV2 {
        let value = body.GetWorldCenter();
        let point: IV2 = { x: 0, y: 0 }
        point.x = this.phyToLayaValue(value.x);
        point.y = this.phyToLayaValue(value.y);
        return point;
    }

    /** 
     * @param body 
     * @param value 
     */
    set_rigidBody_type(body: any, value: string) {
        body.SetType(this.getbodyType(value));
    }

    /** 
     * @param body 
     * @param value 
     */
    set_rigidBody_gravityScale(body: any, value: number) {
        body.SetGravityScale(value);
    }

    /** 
     * @param body 
     * @param value 
     */
    set_rigidBody_allowRotation(body: any, value: boolean) {
        body.SetFixedRotation(!value);
    }

    /** 
     * @param body 
     * @param value 
     */
    set_rigidBody_allowSleep(body: any, value: boolean) {
        body.SetSleepingAllowed(value);
    }

    /** 
     * @param body 
     * @param value 
     */
    set_rigidBody_angularDamping(body: any, value: number) {
        body.SetAngularDamping(value);
    }

    /** 
     * @param body 
     * @returns
     */
    get_rigidBody_angularVelocity(body: any): number {
        return body.GetAngularVelocity();
    }

    /** 
     * @param body 
     * @param value 
     */
    set_rigidBody_angularVelocity(body: any, value: number) {
        body.SetAngularVelocity(value);
    }

    /** 
     * @param body 
     * @param value 
     */
    set_rigidBody_linearDamping(body: any, value: number) {
        body.SetLinearDamping(value);
    }

    /** 
     * @param body 
     * @returns
     */
    get_rigidBody_linearVelocity(body: any): IV2 {
        return body.GetLinearVelocity();
    }

    /** 
     * @param body 
     * @param value 
     */
    set_rigidBody_linearVelocity(body: any, value: IV2) {
        body.SetLinearVelocity(new this.box2d.b2Vec2(value.x, value.y));
    }

    /** 
     * @param body 
     * @param value 
     */
    set_rigidBody_bullet(body: any, value: boolean) {
        body.SetBullet(value);
    }

    /**@internal */
    getbodyType(type: string): any {
        if (type == "dynamic") {
            return this.box2d.b2_dynamicBody;
        } else if (type == "static") {
            return this.box2d.b2_staticBody;
        } else if (type == "kinematic") {
            return this.box2d.b2_kinematicBody;
        }
    }

    /**@internal */
    makeStyleString(color: any, alpha: number = -1) {
        let colorData = this.box2d.wrapPointer(color, this.box2d.b2Color);
        let r = (colorData.r * 255).toFixed(1);
        let g = (colorData.g * 255).toFixed(1);
        let b = (colorData.b * 255).toFixed(1);

        let cv: string;
        if (alpha > 0) {
            cv = `rgba(${r},${g},${b},${alpha})`;
        }
        else {
            cv = `rgb(${r},${g},${b})`;
        }
        return cv;
    }

    /**@internal */
    private getBox2DPoints(vertices: any, vertexCount: any) {
        let i: number, len: number;
        len = vertices.length;
        let points: any[] = [];
        for (i = 0; i < vertexCount; i++) {
            let vert = this.box2d.wrapPointer(vertices + (i * 8), this.box2d.b2Vec2);
            points.push(vert.get_x(), vert.get_y());
        }
        return points;
    }

    /**@internal */
    DrawPolygon(vertices: any, vertexCount: any, color: any): void {
        let points: any[] = this.getBox2DPoints(vertices, vertexCount);
        this._debugDraw.mG.drawPoly(0, 0, points, null, this.makeStyleString(color, 1), this._debugDraw.lineWidth);
    }

    /**@internal */
    DrawSolidPolygon(vertices: any, vertexCount: any, color: any): void {
        let points: any[] = this.getBox2DPoints(vertices, vertexCount);
        this._debugDraw.mG.drawPoly(0, 0, points, this.makeStyleString(color, 0.5), this.makeStyleString(color, 1), this._debugDraw.lineWidth);
    }

    /**@internal */
    DrawCircle(center: any, radius: any, color: any): void {
        let centerV = this.box2d.wrapPointer(center, this.box2d.b2Vec2);
        this._debugDraw.mG.drawCircle(centerV.x, centerV.y, radius, null, this.makeStyleString(color, 1), this._debugDraw.lineWidth);
    }

    /**@internal */
    DrawSolidCircle(center: any, radius: any, axis: any, color: any): void {
        center = this.box2d.wrapPointer(center, this.box2d.b2Vec2);
        axis = this.box2d.wrapPointer(axis, this.box2d.b2Vec2);
        let cx: any = center.x;
        let cy: any = center.y;
        this._debugDraw.mG.drawCircle(cx, cy, radius, this.makeStyleString(color, 0.5), this.makeStyleString(color, 1), this._debugDraw.lineWidth);
        this._debugDraw.mG.drawLine(cx, cy, (cx + axis.x * radius), (cy + axis.y * radius), this.makeStyleString(color, 1), this._debugDraw.lineWidth);
    }

    /**@internal */
    DrawSegment(p1: any, p2: any, color: any): void {
        p1 = this.box2d.wrapPointer(p1, this.box2d.b2Vec2);
        p2 = this.box2d.wrapPointer(p2, this.box2d.b2Vec2);
        this._debugDraw.mG.drawLine(p1.x, p1.y, p2.x, p2.y, this.makeStyleString(color, 1), this._debugDraw.lineWidth);
    }

    /**@internal */
    DrawTransform(xf: any): void {
        xf = this.box2d.wrapPointer(xf, this.box2d.b2Transform);
        this._debugDraw.PushTransform(xf.p.x, xf.p.y, xf.q.GetAngle());
        this._debugDraw.mG.drawLine(0, 0, 1, 0, this._debugDraw.Red, this._debugDraw.lineWidth);
        this._debugDraw.mG.drawLine(0, 0, 0, 1, this._debugDraw.Green, this._debugDraw.lineWidth);
        this._debugDraw.PopTransform();
    }

    /**@internal */
    DrawPoint(p: any, size: any, color: any): void {
        p = this.box2d.wrapPointer(p, this.box2d.b2Vec2);
        size *= this._debugDraw.camera.m_zoom;
        size /= this._debugDraw.camera.m_extent;
        var hsize: any = size / 2;

        this._debugDraw.mG.drawRect(p.x - hsize, p.y - hsize, size, size, this.makeStyleString(color, 1), null);
    }

    /**@internal */
    DrawString(x: any, y: any, message: any): void {
        this._debugDraw.textG.fillText(message, x, y, "15px DroidSans", this._debugDraw.DrawString_color, "left");
    }

    /**@internal */
    DrawStringWorld(x: any, y: any, message: any): void {
        this.DrawString(x, y, message);
    }

    /**@internal */
    DrawAABB(aabb: any, color: any): void {
        var x: number = aabb.lowerBound.x;
        var y: number = aabb.lowerBound.y;
        var w: number = aabb.upperBound.x - aabb.lowerBound.x;
        var h: number = aabb.upperBound.y - aabb.lowerBound.y;

        this._debugDraw.mG.drawRect(x, y, w, h, null, this.makeStyleString(color, 1), this._debugDraw.lineWidth);
    }

    /**@internal */
    getContactListener() {
        let box2d = this.box2d;
        let _this = this;
        var listner = new this.box2d.JSContactListener();
        listner.BeginContact = function (contact: any): void {
            Physics2D.I._eventList.push(0, box2d.wrapPointer(contact, box2d.b2Contact));
        }

        listner.EndContact = function (contact: any): void {
            Physics2D.I._eventList.push(1, box2d.wrapPointer(contact, box2d.b2Contact));
        }

        listner.PreSolve = function (contact: any, oldManifold: any): void {
            //console.log("PreSolve", contact);
        }

        listner.PostSolve = function (contact: any, impulse: any): void {
            //console.log("PostSolve", contact);
        }
        return listner;
    }

    /**@internal */
    getDestructionListener() {
        var listner = new this.box2d.JSDestructionListener();
        let box2d = this.box2d;
        listner.SayGoodbyeJoint = function (joint: any): void {
            joint = box2d.wrapPointer(joint, box2d.b2Joint);
            joint.GetUserData().pointer = -1;
        }
        listner.SayGoodbyeFixture= function (fixture: any): void {
            fixture = box2d.wrapPointer(fixture, box2d.b2Fixture);
            fixture.GetUserData().pointer = -1;
        }
        return listner;
    }

    /**@internal */
    castObject(pointer: any, cls: any) {
        return this.box2d.castObject(pointer, cls)
    }

    /**@internal */
    createWrapPointer(points: number[]): any {
        var len: number = points.length;
        var buffer = this.box2d._malloc(len * 4);
        var offset = 0;
        for (var i: number = 0; i < len; i++) {
            this.box2d.HEAPF32[buffer + offset >> 2] = this.layaToPhyValue(points[i]);
            offset += 4;
        }
        return this.box2d.wrapPointer(buffer, this.box2d.b2Vec2);
    }

    /**@internal */
    b2LinearStiffness(def: any, frequencyHertz: number, dampingRatio: number, bodyA: any, bodyB: any) {
        const massA = bodyA.GetMass();
        const massB = bodyB.GetMass();
        let mass;
        if (massA > 0.0 && massB > 0.0) {
            mass = massA * massB / (massA + massB);
        }
        else if (massA > 0.0) {
            mass = massA;
        }
        else {
            mass = massB;
        }
        const omega = 2.0 * Math.PI * frequencyHertz;
        def.stiffness = mass * omega * omega;
        def.damping = 2.0 * mass * dampingRatio * omega;
    }

    /**
     * @internal 
     * Utility to compute rotational stiffness values frequency and damping ratio
    */
    b2AngularStiffness(def: any, frequencyHertz: number, dampingRatio: number, bodyA: any, bodyB: any) {
        const IA = bodyA.GetInertia();
        const IB = bodyB.GetInertia();
        let I;
        if (IA > 0.0 && IB > 0.0) {
            I = IA * IB / (IA + IB);
        }
        else if (IA > 0.0) {
            I = IA;
        }
        else {
            I = IB;
        }
        const omega = 2.0 * Math.PI * frequencyHertz;
        def.stiffness = I * omega * omega;
        def.damping = 2.0 * I * dampingRatio * omega;
    }

    /**
     * @internal 
    */
    getVec2Length(p1: any, p2: any) {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
    }

    isNullData(data:any){
        return this.box2d.compare(data,this.box2d.NULL)
    }
}

Physics2D.I._factory = new physics2DwasmFactory()