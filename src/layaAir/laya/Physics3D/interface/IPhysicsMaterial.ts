export interface IPhysicsMaterial {
    /**
     * 设置弹力
     * @param value - The bounciness
     */
    setBounciness(value: number): void;

    /**
     * 设置动态摩擦力
     * @param value - The dynamic friction
     */
    setDynamicFriction(value: number): void;

    /**
     * 设置静态摩擦力
     * @param value - The static friction
     */
    setStaticFriction(value: number): void;

    /**
     * 设置弹性组合模式
     * @param value - The combine mode
     */
    setBounceCombine(value: number): void;

    /**
     * 设置摩擦组合模式
     * @param value - The combine mode
     */
    setFrictionCombine(value: number): void;

    /**
     * Decrements the reference count of a material and releases it if the new reference count is zero.
     */
    destroy(): void;
}