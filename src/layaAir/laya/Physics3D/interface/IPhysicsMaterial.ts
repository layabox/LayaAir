/**
 * @en Interface for physics material.
 * @zh 物理材质的接口。
 */
export interface IPhysicsMaterial {
    /**
     * @en Sets the bounciness.
     * @param value The bounciness value.
     * @zh 设置弹力。
     * @param value 弹力值。
     */
    setBounciness(value: number): void;

    /**
     * @en Sets the dynamic friction.
     * @param value The dynamic friction.
     * @zh 设置动态摩擦力。
     * @param value 动态摩擦力值。
     */
    setDynamicFriction(value: number): void;

    /**
     * @en Sets the static friction.
     * @param value The static friction.
     * @zh 设置静态摩擦力。
     * @param value 静态摩擦力值。
     */
    setStaticFriction(value: number): void;

    /**
     * @en Sets the bounce combine mode.
     * @param value The bounce combine mode.
     * @zh 设置弹性组合模式。
     * @param value 弹力组合模式。
     */
    setBounceCombine(value: number): void;

    /**
     * @en Sets the friction combine mode.
     * @param value The friction combine mode.
     * @zh 设置摩擦组合模式。
     * @param value 摩擦力组合模式。
     */
    setFrictionCombine(value: number): void;

    /**
     * @en Decrements the reference count of a material and releases it if the new reference count is zero.
     * @zh 减少材质的引用计数，如果新的引用计数为零则释放它。
     */
    destroy(): void;
}