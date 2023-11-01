import { ILaya } from "../../../ILaya";
import { Component } from "../../components/Component";
import { FixtureBox2DDef } from "./ColliderStructInfo";
import { Physics2D } from "../Physics2D";
import { RigidBody } from "../RigidBody";

/**
 * 碰撞体基类
 */
export class ColliderBase extends Component {
    /**是否是传感器，传感器能够触发碰撞事件，但不会产生碰撞反应*/
    private _isSensor: boolean = false;
    /**密度值，值可以为零或者是正数，建议使用相似的密度，这样做可以改善堆叠稳定性，默认值为10*/
    private _density: number = 10;
    /**摩擦力，取值范围0-1，值越大，摩擦越大，默认值为0.2*/
    private _friction: number = 0.2;
    /**弹性系数，取值范围0-1，值越大，弹性越大，默认值为0*/
    private _restitution: number = 0;
    /**标签*/
    label: string;

    /**@private b2Shape对象*/
    protected _shape: any;
    /**@private b2FixtureDef对象 */
    protected _def: FixtureBox2DDef;
    /**@private box2D fixture Def */
    protected _fixtureDef: any;
    /**[只读]b2Fixture对象 */
    fixture: any;
    /**[只读]刚体引用*/
    rigidBody: RigidBody;

    constructor() {
        super();

        this._singleton = false;
    }

    /**@private 获取碰撞体信息*/
    protected getDef(): any {
        if (!this._fixtureDef) {
            var def: any = new FixtureBox2DDef();
            def.density = this.density;
            def.friction = this.friction;
            def.isSensor = this.isSensor;
            def.restitution = this.restitution;
            def.shape = this._shape;
            this._fixtureDef = Physics2D.I._factory.createFixtureDef(def);
            this._def = def;
        }
        return this._fixtureDef;
    }

    protected _onEnable(): void {
        // if (this.rigidBody)
        //     this.refresh();
        // else
        ILaya.systemTimer.callLater(this, this._checkRigidBody);
    }

    private _checkRigidBody(): void {
        if (!this.rigidBody) {
            var comp: RigidBody = this.owner.getComponent(RigidBody);
            if (comp) {
                this.rigidBody = comp;
                this.refresh();
            }
        }
    }

    protected _onDestroy() {
        let factory = Physics2D.I._factory;
        if (this.rigidBody) {
            if (this.fixture) {
                if (factory.get_fixture_body(this.fixture) == this.rigidBody._getOriBody()) {
                    factory.rigidBody_DestroyFixture(this.rigidBody.body, this.fixture);
                }
                factory.destroy_fixture(this.fixture);
                this.fixture = null;
            }
            this.rigidBody = null;
            this._shape = null;
            this._def = null;
        }
    }

    /**是否是传感器，传感器能够触发碰撞事件，但不会产生碰撞反应*/
    get isSensor(): boolean {
        return this._isSensor;
    }

    set isSensor(value: boolean) {
        this._isSensor = value;
        if (this._def) {
            this._def.isSensor = value;
            this.refresh();
        }
    }

    /**密度值，值可以为零或者是正数，建议使用相似的密度，这样做可以改善堆叠稳定性，默认值为10*/
    get density(): number {
        return this._density;
    }

    set density(value: number) {
        this._density = value;
        if (this._def) {
            this._def.density = value;
            this.refresh();
        }
    }

    /**摩擦力，取值范围0-1，值越大，摩擦越大，默认值为0.2*/
    get friction(): number {
        return this._friction;
    }

    set friction(value: number) {
        this._friction = value;
        if (this._def) {
            this._def.friction = value;
            this.refresh();
        }
    }

    /**弹性系数，取值范围0-1，值越大，弹性越大，默认值为0*/
    get restitution(): number {
        return this._restitution;
    }

    set restitution(value: number) {
        this._restitution = value;
        if (this._def) {
            this._def.restitution = value;
            this.refresh();
        }
    }

    /**
     * @private
     * 碰撞体参数发生变化后，刷新物理世界碰撞信息
     */
    refresh(): void {
        let factory = Physics2D.I._factory;
        if (this.enabled && this.rigidBody) {
            var body: any = this.rigidBody.body;
            if (this.fixture) {
                //trace(fixture);
                if (factory.get_fixture_body(this.fixture) == this.rigidBody.body) {
                    factory.rigidBody_DestroyFixture(body, this.fixture);
                }
                factory.destroy_fixture(this.fixture);
                this.fixture = null;
            }
            let fixtureDef = this.getDef();

            factory.set_fixtureDef_GroupIndex(fixtureDef, this.rigidBody.group);
            factory.set_fixtureDef_CategoryBits(fixtureDef, this.rigidBody.category);
            factory.set_fixtureDef_maskBits(fixtureDef, this.rigidBody.mask);
            this.fixture = factory.createfixture(body, fixtureDef);

            factory.set_fixture_collider(this.fixture, this);
        }
    }

    /**
     * @private
     * 重置形状
     */
    resetShape(re: boolean = true): void {

    }
}
