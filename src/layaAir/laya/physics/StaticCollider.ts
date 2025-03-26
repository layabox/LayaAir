import { Sprite } from "../display/Sprite";
import { Utils } from "../utils/Utils";
import { ColliderBase } from "./Collider2D/ColliderBase";
import { RigidBody2DType } from "./factory/IPhysics2DFactory";
import { Physics2D } from "./Physics2D";
import { RigidBody } from "./RigidBody";
import { Physics2DShapeBase } from "./Shape/Physics2DShapeBase";

/**
 * @en 2Dphysics Static Collider
 * @zh 2D物理静态碰撞体
 */
export class StaticCollider extends ColliderBase {

    private _shapes: Physics2DShapeBase[] = [];

    /**
     * @zh 2D物理静态碰撞体类型，只能为"static"类型
     * @en A 2D physics static body must have a type of 'static'.
     */
    public get type(): RigidBody2DType {
        return this._type;
    }
    public set type(value: RigidBody2DType) {
        if (value != "static") {
            console.warn("StaticCollider only can set as static.");
            value = "static";
        }
        this._type = value;
    }

    /**
     * @zh 2D物理静态碰撞体的碰撞形状数组
     * @en Array of collision shapes for a 2D physics static body
     */
    public get shapes(): Physics2DShapeBase[] {
        return this._shapes;
    }
    public set shapes(value: Physics2DShapeBase[]) {
        value.forEach((shape) => {
            shape.setCollider(this);
        });
        this._shapes = value;
    }

    constructor() {
        super();
    }

    private _setBodyDefValue(): void {
        // 静态刚体这样设置
        let owner: Sprite = this.owner;
        this._bodyDef.position.setValue(owner.globalTrans.x, owner.globalTrans.y);
        this._bodyDef.angle = Utils.toRadian(owner.globalTrans.rotation);
        this._bodyDef.allowSleep = false;
        this._bodyDef.angularVelocity = 0;
        this._bodyDef.angularDamping = 0;
        this._bodyDef.linearDamping = 0;
        this._bodyDef.linearVelocity.setValue(0, 0);

        this._bodyDef.bullet = false;
        this._bodyDef.fixedRotation = false;
        this._bodyDef.gravityScale = 0;
    }

    protected _onAwake(): void {
        this.owner.globalTrans.cache = true;
    }

    protected _onEnable(): void {
        this._getPhysicsManager();
        this.owner.globalTrans.cache = true;
        let rig: RigidBody = this.owner.getComponent(RigidBody);
        if (rig && rig.applyOwnerColliderComponent) {
            this._setRigidbodyValue(rig);
            this.createShape(rig);
        } else {
            this._setBodyDefValue();
            super._onEnable();
            this.shapes = this._shapes;
        }
        if (this.isConnectedJoint) {
            this.owner.event("bodyCreated");
            this.isConnectedJoint = false;
        }
    }

    _removeShapeAndDestroyData() {
        this._rigidbody && (this._box2DBody = this._rigidbody.getBox2DBody());
        this._box2DBody && (Physics2D.I._factory.removeBody(this._physics2DManager.box2DWorld, this._box2DBody));
        this._box2DFilter && Physics2D.I._factory.destroyData(this._box2DFilter);
        this._box2DShapeDef && Physics2D.I._factory.destroyData(this._box2DShapeDef);
        this._box2DShape && Physics2D.I._factory.destroyData(this._box2DShape);
        this._box2DBody = null;
        this._box2DFilter = null;
        this._box2DShape = null;
        this._box2DShapeDef = null;
    }

    protected _onDisable(): void {
        this._removeShapeAndDestroyData();
    }

    protected _onDestroy(): void {
        this._shapeDef = null;
        this._removeShapeAndDestroyData();
    }

    // ----------------------- deprecated 废弃方法与参数 兼容使用 ---------------------

    /**
    * @deprecated 兼容方法
    * @param collider 
    */
    createShape(collider: RigidBody): void {
        if (!collider) return;
        this._getPhysicsManager();
        this._setRigidbodyValue(collider);
        this._rigidbody = collider;
        this._box2DBody = collider.getBox2DBody();
        if (this._box2DShape) {
            Physics2D.I._factory.destroyShape(this._physics2DManager.box2DWorld, this._box2DBody, this._box2DShape);
            Physics2D.I._factory.destroyData(this._box2DShapeDef);
            this._box2DShape = null;
            this._box2DShapeDef = null;
        }
        if (!this._box2DFilter) {
            this._box2DFilter = Physics2D.I._factory.createFilter();
            this._box2DFilter.groupIndex = collider.group;
            this._box2DFilter.categoryBits = collider.category;
            this._box2DFilter.maskBits = collider.mask;
        } else {
            this._box2DFilter.groupIndex = collider.group;
            this._box2DFilter.categoryBits = collider.category;
            this._box2DFilter.maskBits = collider.mask;
        }
        this._box2DShapeDef = Physics2D.I._factory.createShapeDef(this._physics2DManager.box2DWorld, this._shapeDef, this._box2DFilter);
        this._setShapeData(this._box2DShapeDef._shape);
        this._box2DShape = Physics2D.I._factory.createShape(this._physics2DManager.box2DWorld, this._box2DBody, this._shapeDef.shapeType, this._box2DShapeDef);
        Physics2D.I._factory.set_shape_collider(this._box2DShape, this);
    }

    protected _setShapeData(shape: any): void {
    }

    /**@deprecated 兼容方法 */
    _setRigidbodyValue(collider: RigidBody): void {
        this._shapeDef.density = this.density;
        this._shapeDef.friction = this.friction;
        this._shapeDef.isSensor = this.isSensor;
        this._shapeDef.restitution = this.restitution;
        this._shapeDef.filter.group = collider.group;
        this._shapeDef.filter.category = collider.category;
        this._shapeDef.filter.mask = collider.mask;
    }

    // ----------------------- deprecated 废弃方法与参数 兼容使用 ---------------------

}