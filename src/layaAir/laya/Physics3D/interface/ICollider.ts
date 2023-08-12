import { IColliderShape } from "./Shape/IColliderShape";
import { Node } from "../../display/Node";
import { PhysicsCombineMode } from "../../d3/physics/PhysicsColliderComponent";

export interface ICollider {

    owner:Node
    
    setColliderShape(shape: IColliderShape): void;

    /**
     * Deletes the collider.
     */
    destroy(): void;

    /**
     * set collision Group
     * @param value 
     */
    setCollisionGroup(value: number): void;

    /**
     * set can collision Group
     * @param value 
     */
    setCanCollideWith(value: number): void;

    /**
     * set node
     */
    setOwner(node: Node): void;

    /**
     * transform Change
     */
    transformChanged(flag:number): void;

    setBounciness?(value: number): void;

    setfriction?(value: number): void;

    setRollingFriction?(value: number): void;

    setDynamicFriction?(value: number): void;

    setStaticFriction?(value: number): void;

    setFrictionCombine?(value:PhysicsCombineMode): number;

    setBounceCombine?(value:PhysicsCombineMode): number;
}