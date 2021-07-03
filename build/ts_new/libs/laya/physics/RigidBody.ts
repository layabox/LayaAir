import { IPhysics } from "./IPhysics";
import { Laya } from "../../Laya";
import { ColliderBase } from "./ColliderBase";
import { Component } from "../components/Component"
import { Sprite } from "..//display/Sprite"
import { Point } from "../maths/Point"
import { Utils } from "../utils/Utils"
import { ClassUtils } from "../utils/ClassUtils"

/**
 * 2D刚体，显示对象通过RigidBody和物理世界进行绑定，保持物理和显示对象之间的位置同步
 * 物理世界的位置变化会自动同步到显示对象，显示对象本身的位移，旋转（父对象位移无效）也会自动同步到物理世界
 * 由于引擎限制，暂时不支持以下情形：
 * 1.不支持绑定节点缩放
 * 2.不支持绑定节点的父节点缩放和旋转
 * 3.不支持实时控制父对象位移，IDE内父对象位移是可以的
 * 如果想整体位移物理世界，可以Physics.I.worldRoot=场景，然后移动场景即可
 * 可以通过IDE-"项目设置" 开启物理辅助线显示，或者通过代码PhysicsDebugDraw.enable();
 */
export class RigidBody extends Component {
    /**
     * 刚体类型，支持三种类型static，dynamic和kinematic类型，默认为dynamic类型
     * static为静态类型，静止不动，不受重力影响，质量无限大，可以通过节点移动，旋转，缩放进行控制
     * dynamic为动态类型，受重力影响
     * kinematic为运动类型，不受重力影响，可以通过施加速度或者力的方式使其运动
     */
    protected _type: string = "dynamic";
    /**是否允许休眠，允许休眠能提高性能*/
    protected _allowSleep: boolean = true;
    /**角速度，设置会导致旋转*/
    protected _angularVelocity: number = 0;
    /**旋转速度阻尼系数，范围可以在0到无穷大之间，0表示没有阻尼，无穷大表示满阻尼，通常阻尼的值应该在0到0.1之间*/
    protected _angularDamping: number = 0;
    /**线性运动速度，比如{x:10,y:10}*/
    protected _linearVelocity: any = { x: 0, y: 0 };
    /**线性速度阻尼系数，范围可以在0到无穷大之间，0表示没有阻尼，无穷大表示满阻尼，通常阻尼的值应该在0到0.1之间*/
    protected _linearDamping: number = 0;
    /**是否高速移动的物体，设置为true，可以防止高速穿透*/
    protected _bullet: boolean = false;
    /**是否允许旋转，如果不希望刚体旋转，这设置为false*/
    protected _allowRotation: boolean = true;
    /**重力缩放系数，设置为0为没有重力*/
    protected _gravityScale: number = 1;

    /**[只读] 指定了该主体所属的碰撞组，默认为0，碰撞规则如下：
     * 1.如果两个对象group相等
     * 		group值大于零，它们将始终发生碰撞
     * 		group值小于零，它们将永远不会发生碰撞
     * 		group值等于0，则使用规则3
     * 2.如果group值不相等，则使用规则3
     * 3.每个刚体都有一个category类别，此属性接收位字段，范围为[1,2^31]范围内的2的幂
     * 每个刚体也都有一个mask类别，指定与其碰撞的类别值之和（值是所有category按位AND的值）
     */
    group: number = 0;
    /**[只读]碰撞类别，使用2的幂次方值指定，有32种不同的碰撞类别可用*/
    category: number = 1;
    /**[只读]指定冲突位掩码碰撞的类别，category位操作的结果*/
    mask: number = -1;
    /**[只读]自定义标签*/
    label: string = "RigidBody";
    /**[只读]原始刚体*/
    protected _body: any;

    private _createBody(): void {
        if (this._body||!this.owner) return;
        var sp: Sprite = (<Sprite>this.owner);
        var box2d: any = (<any>window).box2d;
        var def: any = new box2d.b2BodyDef();
        var point: Point = sp.localToGlobal(Point.TEMP.setTo(0, 0), false, IPhysics.Physics.I.worldRoot);
        def.position.Set(point.x / IPhysics.Physics.PIXEL_RATIO, point.y / IPhysics.Physics.PIXEL_RATIO);
        def.angle = Utils.toRadian(sp.rotation);
        def.allowSleep = this._allowSleep;
        def.angularDamping = this._angularDamping;
        def.angularVelocity = this._angularVelocity;
        def.bullet = this._bullet;
        def.fixedRotation = !this._allowRotation;
        def.gravityScale = this._gravityScale;
        def.linearDamping = this._linearDamping;
        var obj: any = this._linearVelocity;
        if (obj && obj.x != 0 || obj.y != 0) {
            def.linearVelocity = new box2d.b2Vec2(obj.x, obj.y);
        }
        def.type = box2d.b2BodyType["b2_" + this._type + "Body"];
        //def.userData = label;

        this._body = IPhysics.Physics.I._createBody(def);
        //trace(body);

        //查找碰撞体
        this.resetCollider(false);
    }
    /**
     * @internal
     * @override
     */
    _onAwake(): void {
        this._createBody();
    }
    /**
     * @internal
     * @override
     */
    _onEnable(): void {
        var _$this = this;
        this._createBody();
        //实时同步物理到节点
        Laya.physicsTimer.frameLoop(1, this, this._sysPhysicToNode);

        //监听节点变化，同步到物理世界
        var sp: any = <Sprite>this.owner;
        //如果节点发生变化，则同步到物理世界（仅限节点本身，父节点发生变化不会自动同步）
        if (this.accessGetSetFunc(sp, "x", "set") && !sp._changeByRigidBody) {
            sp._changeByRigidBody = true;
            function setX(value: any): void {
                _$this.accessGetSetFunc(sp, "x", "set")(value);
                _$this._sysPosToPhysic();
            }
            this._overSet(sp, "x", setX);

            function setY(value: any): void {
                _$this.accessGetSetFunc(sp, "y", "set")(value);
                _$this._sysPosToPhysic();
            };
            this._overSet(sp, "y", setY);

            function setRotation(value: any): void {
                _$this.accessGetSetFunc(sp, "rotation", "set")(value);
                _$this._sysNodeToPhysic();
            };
            this._overSet(sp, "rotation", setRotation);

            function setScaleX(value: any): void {
                _$this.accessGetSetFunc(sp, "scaleX", "set")(value);
                _$this.resetCollider(true);
            };
            this._overSet(sp, "scaleX", setScaleX);

            function setScaleY(value: any): void {
                _$this.accessGetSetFunc(sp, "scaleY", "set")(value);
                _$this.resetCollider(true);
            };
            this._overSet(sp, "scaleY", setScaleY);
        }
    }

    /**
     * 获取对象某属性的get set方法
     * 通过其本身无法获取该方法，只能从原型上获取
     * @param obj 
     * @param prop 
     * @param accessor 
     */
    private accessGetSetFunc(obj: Node, prop: string, accessor: string): any {
        if (["get", "set"].indexOf(accessor) === -1) { // includes
            return;
        }
        let privateProp = `_$${accessor}_${prop}`;
        if ((obj as any)[privateProp]) {
            return (obj as any)[privateProp];
        }
        let ObjConstructor = obj.constructor;
        let des;
        while (ObjConstructor) {
            des = Object.getOwnPropertyDescriptor(ObjConstructor.prototype, prop);
            if (des && (des as any)[accessor]) { // 构造函数(包括原型的构造函数)有该属性
                (obj as any)[privateProp] = (des as any)[accessor].bind(obj);
                break;
            }
            ObjConstructor = Object.getPrototypeOf(ObjConstructor);
        }
        return (obj as any)[privateProp];
    }

    /**
     * 重置Collider
     * @param	resetShape 是否先重置形状，比如缩放导致碰撞体变化
     */
    private resetCollider(resetShape: boolean): void {
        //查找碰撞体
        var comps: any[] = this.owner.getComponents(ColliderBase);
        if (comps) {
            for (var i: number = 0, n: number = comps.length; i < n; i++) {
                var collider: ColliderBase = comps[i];
                collider.rigidBody = this;
                if (resetShape) collider.resetShape();
                else collider.refresh();
            }
        }
    }

    /**@private 同步物理坐标到游戏坐标*/
    private _sysPhysicToNode(): void {
        if (this.type != "static" && this._body.IsAwake()) {
            var pos: any = this._body.GetPosition();
            var ang: any = this._body.GetAngle();
            var sp: any = (<Sprite>this.owner);

            //if (label == "tank") console.log("get",ang);
            this.accessGetSetFunc(sp, "rotation", "set")(Utils.toAngle(ang) - (<Sprite>sp.parent).globalRotation);

            // if (ang == 0) {
            //     var point: Point = sp.globalToLocal(Point.TEMP.setTo(pos.x * IPhysics.Physics.PIXEL_RATIO + sp.pivotX, pos.y * IPhysics.Physics.PIXEL_RATIO + sp.pivotY), false, IPhysics.Physics.I.worldRoot);
            //     point = sp.toParentPoint(point);
            //     this.accessGetSetFunc(sp, "x", "set")(point.x);
            //     this.accessGetSetFunc(sp, "y", "set")(point.y);
            // } else {
                var point = sp.globalToLocal(Point.TEMP.setTo(pos.x * IPhysics.Physics.PIXEL_RATIO, pos.y * IPhysics.Physics.PIXEL_RATIO), false, IPhysics.Physics.I.worldRoot);
                point.x += sp.pivotX;
                point.y += sp.pivotY;
                point = sp.toParentPoint(point);
                this.accessGetSetFunc(sp, "x", "set")(point.x);
                this.accessGetSetFunc(sp, "y", "set")(point.y);
            // }
        }
    }

    /**@private 同步节点坐标及旋转到物理世界*/
    private _sysNodeToPhysic(): void {
        var sp: Sprite = <Sprite>this.owner;
        this._body.SetAngle(Utils.toRadian(sp.rotation));
        var p: Point = sp.localToGlobal(Point.TEMP.setTo(0, 0), false, IPhysics.Physics.I.worldRoot);
        this._body.SetPositionXY(p.x / IPhysics.Physics.PIXEL_RATIO, p.y / IPhysics.Physics.PIXEL_RATIO);
    }

    /**@private 同步节点坐标到物理世界*/
    private _sysPosToPhysic(): void {
        var sp: Sprite = <Sprite>this.owner;
        var p: Point = sp.localToGlobal(Point.TEMP.setTo(0, 0), false, IPhysics.Physics.I.worldRoot);
        this._body.SetPositionXY(p.x / IPhysics.Physics.PIXEL_RATIO, p.y / IPhysics.Physics.PIXEL_RATIO);
    }

    /**@private */
    private _overSet(sp: Node, prop: string, getfun: any): void {
        Object.defineProperty(sp, prop, { get: this.accessGetSetFunc(sp, prop, "get"), set: getfun, enumerable: false, configurable: true });;
    }
    /**
     * @internal
     * @override
     */
    protected _onDisable(): void {
        //添加到物理世界
        Laya.physicsTimer.clear(this, this._sysPhysicToNode);
        this._body && IPhysics.Physics.I._removeBody(this._body);
        this._body = null;

        var owner: any = this.owner;
        if (owner._changeByRigidBody) {
            this._overSet(owner, "x", this.accessGetSetFunc(owner, "x", "set"));
            this._overSet(owner, "y", this.accessGetSetFunc(owner, "y", "set"));
            this._overSet(owner, "rotation", this.accessGetSetFunc(owner, "rotation", "set"));
            this._overSet(owner, "scaleX", this.accessGetSetFunc(owner, "scaleX", "set"));
            this._overSet(owner, "scaleY", this.accessGetSetFunc(owner, "scaleY", "set"));
            owner._changeByRigidBody = false;
        }
    }

    /**获得原始body对象 */
    getBody(): any {
        if (!this._body) this._onAwake();
        return this._body;
    }

    _getOriBody(): any {
        return this._body;
    }

    /**[只读]获得原始body对象 */
    get body(): any {
        if (!this._body) this._onAwake();
        return this._body;
    }

    /**
     * 对刚体施加力
     * @param	position 施加力的点，如{x:100,y:100}，全局坐标
     * @param	force	施加的力，如{x:0.1,y:0.1}
     */
    applyForce(position: any, force: any): void {
        if (!this._body) this._onAwake();
        this._body.ApplyForce(force, position);
    }

    /**
     * 从中心点对刚体施加力，防止对象旋转
     * @param	force	施加的力，如{x:0.1,y:0.1}
     */
    applyForceToCenter(force: any): void {
        if (!this._body) this._onAwake();
        this._body.ApplyForceToCenter(force);
    }

    /**
     * 施加速度冲量，添加的速度冲量会与刚体原有的速度叠加，产生新的速度
     * @param	position 施加力的点，如{x:100,y:100}，全局坐标
     * @param	impulse	施加的速度冲量，如{x:0.1,y:0.1}
     */
    applyLinearImpulse(position: any, impulse: any): void {
        if (!this._body) this._onAwake();
        this._body.ApplyLinearImpulse(impulse, position);
    }

    /**
     * 施加速度冲量，添加的速度冲量会与刚体原有的速度叠加，产生新的速度
     * @param	impulse	施加的速度冲量，如{x:0.1,y:0.1}
     */
    applyLinearImpulseToCenter(impulse: any): void {
        if (!this._body) this._onAwake();
        this._body.ApplyLinearImpulseToCenter(impulse);
    }

    /**
     * 对刚体施加扭矩，使其旋转
     * @param	torque	施加的扭矩
     */
    applyTorque(torque: number): void {
        if (!this._body) this._onAwake();
        this._body.ApplyTorque(torque);
    }

    /**
     * 设置速度，比如{x:10,y:10}
     * @param	velocity
     */
    setVelocity(velocity: any): void {
        if (!this._body) this._onAwake();
        this._body.SetLinearVelocity(velocity);
    }

    /**
     * 设置角度
     * @param	value 单位为弧度
     */
    setAngle(value: any): void {
        if (!this._body) this._onAwake();
        this._body.SetAngle(value);
        this._body.SetAwake(true);
    }

    /**获得刚体质量*/
    getMass(): number {
        return this._body ? this._body.GetMass() : 0;
    }

    /**
     * 获得质心的相对节点0,0点的位置偏移
     */
    getCenter(): any {
        if (!this._body) this._onAwake();
        var p: Point = this._body.GetLocalCenter();
        p.x = p.x * IPhysics.Physics.PIXEL_RATIO;
        p.y = p.y * IPhysics.Physics.PIXEL_RATIO;
        return p;
    }

    /**
     * 获得质心的世界坐标，相对于Physics.I.worldRoot节点
     */
    getWorldCenter(): any {
        if (!this._body) this._onAwake();
        var p: Point = this._body.GetWorldCenter();
        p.x = p.x * IPhysics.Physics.PIXEL_RATIO;
        p.y = p.y * IPhysics.Physics.PIXEL_RATIO;
        return p;
    }

    /**
     * 刚体类型，支持三种类型static，dynamic和kinematic类型
     * static为静态类型，静止不动，不受重力影响，质量无限大，可以通过节点移动，旋转，缩放进行控制
     * dynamic为动态类型，接受重力影响
     * kinematic为运动类型，不受重力影响，可以通过施加速度或者力的方式使其运动
     */
    get type(): string {
        return this._type;
    }

    set type(value: string) {
        this._type = value;
        if (this._body) this._body.SetType((<any>window).box2d.b2BodyType["b2_" + this._type + "Body"]);
    }

    /**重力缩放系数，设置为0为没有重力*/
    get gravityScale(): number {
        return this._gravityScale;
    }

    set gravityScale(value: number) {
        this._gravityScale = value;
        if (this._body) this._body.SetGravityScale(value);
    }

    /**是否允许旋转，如果不希望刚体旋转，这设置为false*/
    get allowRotation(): boolean {
        return this._allowRotation;
    }

    set allowRotation(value: boolean) {
        this._allowRotation = value;
        if (this._body) this._body.SetFixedRotation(!value);
    }

    /**是否允许休眠，允许休眠能提高性能*/
    get allowSleep(): boolean {
        return this._allowSleep;
    }

    set allowSleep(value: boolean) {
        this._allowSleep = value;
        if (this._body) this._body.SetSleepingAllowed(value);
    }

    /**旋转速度阻尼系数，范围可以在0到无穷大之间，0表示没有阻尼，无穷大表示满阻尼，通常阻尼的值应该在0到0.1之间*/
    get angularDamping(): number {
        return this._angularDamping;
    }

    set angularDamping(value: number) {
        this._angularDamping = value;
        if (this._body) this._body.SetAngularDamping(value);
    }

    /**角速度，设置会导致旋转*/
    get angularVelocity(): number {
        if (this._body) return this._body.GetAngularVelocity();
        return this._angularVelocity;
    }

    set angularVelocity(value: number) {
        this._angularVelocity = value;
        if (this._body) this._body.SetAngularVelocity(value);
    }

    /**线性速度阻尼系数，范围可以在0到无穷大之间，0表示没有阻尼，无穷大表示满阻尼，通常阻尼的值应该在0到0.1之间*/
    get linearDamping(): number {
        return this._linearDamping;
    }

    set linearDamping(value: number) {
        this._linearDamping = value;
        if (this._body) this._body.SetLinearDamping(value);
    }

    /**线性运动速度，比如{x:5,y:5}*/
    get linearVelocity(): any {
        if (this._body) {
            var vec: any = this._body.GetLinearVelocity();
            return { x: vec.x, y: vec.y };
        }
        return this._linearVelocity;
    }

    set linearVelocity(value: any) {
        if (!value) return;
        if (value instanceof Array) {
            value = { x: value[0], y: value[1] };
        }
        this._linearVelocity = value;
        if (this._body) this._body.SetLinearVelocity(new (<any>window).box2d.b2Vec2(value.x, value.y));
    }

    /**是否高速移动的物体，设置为true，可以防止高速穿透*/
    get bullet(): boolean {
        return this._bullet;
    }

    set bullet(value: boolean) {
        this._bullet = value;
        if (this._body) this._body.SetBullet(value);
    }
}

ClassUtils.regClass("laya.physics.RigidBody", RigidBody);
ClassUtils.regClass("Laya.RigidBody", RigidBody);