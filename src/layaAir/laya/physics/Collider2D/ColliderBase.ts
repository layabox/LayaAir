import { Component } from "../../components/Component";
import { FixtureBox2DDef, PhysicsShape } from "./ColliderStructInfo";
import { Physics2D } from "../Physics2D";
import { RigidBody } from "../RigidBody";
import { Sprite } from "../../display/Sprite";


/**
 * 碰撞体基类
 */
export class ColliderBase extends Component {

    /**@internal FixtureBox2DDef 数据 */
    private static TempDef: FixtureBox2DDef = new FixtureBox2DDef()

    /**@internal 是否是传感器，传感器能够触发碰撞事件，但不会产生碰撞反应*/
    private _isSensor: boolean = false;

    /**@internal 密度值，值可以为零或者是正数，建议使用相似的密度，这样做可以改善堆叠稳定性，默认值为10*/
    private _density: number = 10;

    /**@internal 摩擦力，取值范围0-1，值越大，摩擦越大，默认值为0.2*/
    private _friction: number = 0.2;

    /**@internal 弹性系数，取值范围0-1，值越大，弹性越大，默认值为0*/
    private _restitution: number = 0;

    /**@internal shape类型标记*/
    protected _physicShape: PhysicsShape;

    /**@internal box2D fixture Def */
    protected _fixtureDef: any;

    /**@internal [只读]b2Fixture对象 */
    private _fixture: any;

    /**@internal 相对节点的x轴偏移*/
    private _x: number = 0;
    /**@internal 相对节点的y轴偏移*/
    private _y: number = 0;

    /**标签*/
    label: string;


    /**刚体引用*/
    rigidBody: RigidBody;

    /**
     * @internal
     * 获得节点的全局缩放X
     */
    protected get scaleX(): number {
        return (<Sprite>this.owner).globalScaleX;
    }

    /**
     * @internal
     * 获得节点的全局缩放Y
     */
    protected get scaleY(): number {
        return (<Sprite>this.owner).globalScaleY;
    }

    /**@internal 创建获得相对于描点x的偏移 */
    protected get pivotoffx(): number {
        return this._x - (<Sprite>this.owner).pivotX;
    }

    /**@internal 创建获得相对于描点y的偏移 */
    protected get pivotoffy(): number {
        return this._y - (<Sprite>this.owner).pivotY;
    }

    /**相对节点的x轴偏移*/
    get x(): number {
        return this._x;
    }

    set x(value: number) {
        if (this._x == value) return;
        this._x = value;
        this._needupdataShapeAttribute();
    }

    /**相对节点的y轴偏移*/
    get y(): number {
        return this._y;
    }

    set y(value: number) {
        if (this._y == value) return;
        this._y = value;
        this._needupdataShapeAttribute();
    }

    /**是否是传感器，传感器能够触发碰撞事件，但不会产生碰撞反应*/
    get isSensor(): boolean {
        return this._isSensor;
    }

    set isSensor(value: boolean) {
        if (this._isSensor == value) return;
        this._isSensor = value;
        this._needupdataShapeAttribute();
    }

    /**密度值，值可以为零或者是正数，建议使用相似的密度，这样做可以改善堆叠稳定性，默认值为10*/
    get density(): number {
        return this._density;
    }

    set density(value: number) {
        if (this._density == value) return;
        this._density = value;
        this._needupdataShapeAttribute();
    }

    /**摩擦力，取值范围0-1，值越大，摩擦越大，默认值为0.2*/
    get friction(): number {
        return this._friction;
    }

    set friction(value: number) {
        if (this._friction == value) return;
        this._friction = value;
        this._needupdataShapeAttribute();
    }

    /**弹性系数，取值范围0-1，值越大，弹性越大，默认值为0*/
    get restitution(): number {
        return this._restitution;
    }

    set restitution(value: number) {
        if (this._restitution == value) return;
        this._restitution = value;
        this._needupdataShapeAttribute();
    }

    /**
     * 创建一个新的 <code>ColliderBase</code> 实例。
     */
    constructor() {
        super();
        this._singleton = false;
    }

    /**@internal 设置shape数据 */
    _setShapeData(shape: any): void {
        throw ("ColliderBase: must override it.");
    }

    /**@internal 创建Shape*/
    _createfixture(): any {
        let factory = Physics2D.I._factory;
        var body: any = this.rigidBody.body;
        var def: any = ColliderBase.TempDef;
        def.density = this.density;
        def.friction = this.friction;
        def.isSensor = this.isSensor;
        def.restitution = this.restitution;
        def.shape = this._physicShape;
        let fixtureDef = factory.createFixtureDef(def);
        this._setShapeData(fixtureDef._shape);
        this._fixture = factory.createfixture(body, fixtureDef);
    }

    /**@internal 设置shape属性*/
    _resetFixtureData() {
        var def: any = ColliderBase.TempDef;
        def.density = this.density;
        def.friction = this.friction;
        def.isSensor = this.isSensor;
        def.restitution = this.restitution;
        Physics2D.I._factory.resetFixtureData(this._fixture, def);
        this._setShapeData(this._fixture.shape);
    }

    /**@internal */
    _onEnable(): void {
        if (this.owner.getComponent(RigidBody)) {
            this.rigidBody = this.owner.getComponent(RigidBody)
            this._needupdataShapeAttribute();
        }
    }

    /**@internal */
    _onAwake(): void {
        if (this.owner.getComponent(RigidBody)) {
            this.rigidBody = this.owner.getComponent(RigidBody)
            this._needupdataShapeAttribute();
        }
    }

    /**@internal 通知rigidBody 更新shape 属性值 */
    _needupdataShapeAttribute(): void {
        if (!this.rigidBody) {
            return;
        }
        this.rigidBody._needrefeshShape();
    }

    /**
    * @internal
    * 碰撞体参数发生变化后，刷新物理世界碰撞信息
    */
    _refresh(): void {
        if (!this.enabled) {
            return;
        }
        let factory = Physics2D.I._factory;
        if (!this._fixture) this._createfixture();
        else this._resetFixtureData();
        factory.set_fixtureDef_GroupIndex(this._fixture, this.rigidBody.group);
        factory.set_fixtureDef_CategoryBits(this._fixture, this.rigidBody.category);
        factory.set_fixtureDef_maskBits(this._fixture, this.rigidBody.mask);
        factory.set_fixture_collider(this._fixture, this);
    }

    /**@internal */
    _onDisable(): void {
        let factory = Physics2D.I._factory;
        if (this._fixture && this.rigidBody._body) {
            factory.rigidBody_DestroyFixture(this.rigidBody.body, this._fixture);
        }
        this._fixture = null;
        this.rigidBody = null;
    }
}
