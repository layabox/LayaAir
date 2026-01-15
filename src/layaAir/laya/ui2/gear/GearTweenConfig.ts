import { EaseType } from "../../tween/ITween";

export class GearTweenConfig {
    /**
     * @en Whether to enable tweening.
     * @zh 是否启用缓动。
     */
    enabled: boolean = true;

    /**
     * @en The type of easing function to use.
     * @zh 使用的缓动函数类型。
     */
    easeType: EaseType = "quadOut";

    /**
     * @en The duration of the tween in milliseconds.
     * @zh 缓动的持续时间，单位为毫秒。
     */
    duration: number = 300;

    /**
     * @en The delay before the tween starts in milliseconds.
     * @zh 缓动开始前的延迟时间，单位为毫秒。
     */
    delay: number = 0;
}