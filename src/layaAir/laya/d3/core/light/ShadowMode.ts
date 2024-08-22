/**
 * @en The shadow mode.
 * @zh 阴影模式。
 */
export enum ShadowMode {
    /**
     * @en No shadows are produced.
     * @zh 不产生阴影。
     */
    None,
    /**
     * @en Hard shadows with lower performance requirements.
     * @zh 硬阴影，对性能要求较低。
     */
    Hard,
    /**
     * @en Soft shadows with low intensity, moderate performance requirements.
     * @zh 低强度软阴影，对性能要求一般。
     */
    SoftLow,
    /**
     * @en Soft shadows with high intensity, higher performance requirements.
     * @zh 高强度软阴影，对性能要求较高。
     */
    SoftHigh
}