/**
 * @en Animation update modes
 * @zh 动画更新模式
 */
export enum AnimatorUpdateMode {
    /**
     * @en Normal update mode
     * @zh 正常更新。
     */
    Normal = 0,
    /**
     * @en Low frame rate update mode
     * @zh 低频率更新。
     */
    LowFrame = 1,
    /**
     * @en Do not update thes animations based on time
     * @zh 不更新。
     */
    UnScaleTime = 2
}
