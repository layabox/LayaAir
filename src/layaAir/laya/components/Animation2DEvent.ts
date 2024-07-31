/**
 * @en Animation2DEvent class is used to implement animation events.
 * @zh Animation2DEvent 类用于实现动画事件。
 */
export class Animation2DEvent {
    /**
     * @en The time at which the event is triggered.
     * @zh 事件触发的时间。
     */
    time: number;
    /**
     * @en The name of the event that is triggered.
     * @zh 被触发的事件名称。
     */
    eventName: string;
    /**
     * @en Event triggering parameters
     * @zh 事件触发参数。
     */
    params: any[];

    /**
     * @en Constructor method, instance of Animation2DEvent.
     * @zh 2D动画事件类实例
     */
    constructor() {
    }

}
