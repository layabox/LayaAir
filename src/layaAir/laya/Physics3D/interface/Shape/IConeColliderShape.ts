import { IColliderShape } from "./IColliderShape";

export interface IConeColliderShape extends IColliderShape {
    /**
    * Set radius of capsule.
    * @param radius - The radius
    */
    setRadius(radius: number): void;

    /**
     * Set height of capsule.
     * @param height - The height
     */
    setHeight(height: number): void;

    /**
     * Set up axis of capsule.
     * @param upAxis - The up axis
     */
    setUpAxis(upAxis: number): void;
}