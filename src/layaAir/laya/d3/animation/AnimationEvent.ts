/**
 * @en The AnimationEvent class is used to implement animation events.
 * @zh AnimationEvent 类用于实现动画事件。
 */
export class AnimationEvent {
    /**
     * @en The time at which the event is triggered.
     * @zh 事件触发的时间。
     */
	time: number;
    /**
     * @en The name of the triggered event.
     * @zh 触发的事件名称。
     */
	eventName: string;
    /**
     * @en The parameters of the triggered event.
     * @zh 触发事件的参数。
     */
	params: any[];

    /**
     * @ignore
     */
	constructor() {
	}

}


