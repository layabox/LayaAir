import { PhysicsCombineMode } from "../../d3/physics/PhysicsColliderComponent";
import { pxPhysicsCreateUtil } from "./pxPhysicsCreateUtil";

/**
 * @en Represents a physics material in the PhysX engine.
 * @zh 表示PhysX引擎中的物理材质。
 */
export class pxPhysicsMaterial {

    private _bounciness: number = 0.1;

    private _dynamicFriction: number = 0.1;

    private _staticFriction: number = 0.1;

    private _bounceCombine: PhysicsCombineMode = PhysicsCombineMode.Average;

    private _frictionCombine: PhysicsCombineMode = PhysicsCombineMode.Average;

    /** @internal */
    _pxMaterial: any;

    /**
     * @en Creates a new pxPhysicsMaterial class.
     * @zh 创建一个新的pxPhysicsMaterial类。
     */
    constructor() {
        this._pxMaterial = pxPhysicsCreateUtil._pxPhysics.createMaterial(this._staticFriction, this._dynamicFriction, this._bounciness);
    }

    /**
     * @en Sets the bounciness (restitution).
     * @param value The bounciness value.
     * @zh 设置反弹性（恢复系数）。
     * @param value 反弹性值。
     */
    setBounciness(value: number) {
        this._pxMaterial.setRestitution(value);
    }

    /**
     * @en Sets the dynamic friction.
     * @param value The dynamic friction value.
     * @zh 设置动态摩擦力。
     * @param value 动态摩擦力值。
     */
    setDynamicFriction(value: number) {
        this._pxMaterial.setDynamicFriction(value);
    }

    /**
     * @en Sets the static friction.
     * @param value The static friction value.
     * @zh 设置静态摩擦力。
     * @param value 静态摩擦力值。
     */
    setStaticFriction(value: number) {
        this._pxMaterial.setStaticFriction(value);
    }

    /**
     * @en Sets the bounce combine mode.
     * @param value The bounce combine mode.
     * @zh 设置反弹组合模式。
     * @param value 反弹组合模式。
     */
    setBounceCombine(value: PhysicsCombineMode) {
        this._pxMaterial.setRestitutionCombineMode(value);
    }

    /**
     * @en Sets the friction combine mode.
     * @param value The friction combine mode.
     * @zh 设置摩擦力组合模式。
     * @param value 摩擦力组合模式。
     */
    setFrictionCombine(value: PhysicsCombineMode) {
        this._pxMaterial.setFrictionCombineMode(value);
    }

    /**
     * @en Destroys the physics material and releases associated resources.
     * @zh 销毁物理材质并释放相关资源。
     */
    destroy(): void {
        this._pxMaterial.release();
    }
}