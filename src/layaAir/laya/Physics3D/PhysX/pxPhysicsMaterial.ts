import { PhysicsCombineMode } from "../../d3/physics/PhysicsColliderComponent";
import { pxPhysicsCreateUtil } from "./pxPhysicsCreateUtil";

export class pxPhysicsMaterial {
    private _bounciness: number = 0.1;
    private _dynamicFriction: number = 0.1;
    private _staticFriction: number = 0.1;
    private _bounceCombine: PhysicsCombineMode = PhysicsCombineMode.Average;
    private _frictionCombine: PhysicsCombineMode = PhysicsCombineMode.Average;
    /** @internal */
    _pxMaterial: any;

    constructor() {
        this._pxMaterial = pxPhysicsCreateUtil._pxPhysics.createMaterial(this._staticFriction, this._dynamicFriction, this._bounciness);
        this._pxMaterial.setFrictionCombineMode(this._frictionCombine);
        this._pxMaterial.setRestitutionCombineMode(this._bounceCombine);
    }

    setBounciness(value: number) {
        this._pxMaterial.setRestitution(value);
    }

    setDynamicFriction(value: number) {
        this._pxMaterial.setDynamicFriction(value);
    }

    setStaticFriction(value: number) {
        this._pxMaterial.setStaticFriction(value);
    }

    setBounceCombine(value: PhysicsCombineMode) {
        this._pxMaterial.setRestitutionCombineMode(value);
    }

    setFrictionCombine(value: PhysicsCombineMode) {
        this._pxMaterial.setFrictionCombineMode(value);
    }

    destroy(): void {
        this._pxMaterial.release();
    }
}