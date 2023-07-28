import { IColliderShape } from "./IColliderShape";

export interface ISphereColliderShape extends IColliderShape {
    /**
     * Set radius of sphere.
     * @param radius - The radius
     */
    setRadius(radius: number): void;
}