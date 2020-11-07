/**
 * 阴影模式。
 */
export enum ShadowMode {
    /**不产生阴影。*/
    None,
    /**硬阴影，对性能要求较低。*/
    Hard,
    /**低强度软阴影，对性能要求一般。*/
    SoftLow,
    /**高强度软阴影,对性能要求较高。*/
    SoftHigh
}