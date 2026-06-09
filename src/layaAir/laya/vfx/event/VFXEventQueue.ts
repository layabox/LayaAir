import { VFXEventAttribute, VFXEventAttributeDesc } from "../VFXEventAttribute";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";

export enum VFXEventType {
    Event,
    Initialize,
    Simulate
}

export class VFXEvent {

    static OnPlayEventID: number;
    static OnStopEventID: number;

    static init() {
        this.OnPlayEventID = Shader3D.propertyNameToID("OnPlay");
        this.OnStopEventID = Shader3D.propertyNameToID("OnStop");
    }

    type: VFXEventType;
    id: number;
    attribute: VFXEventAttribute | null = null;

    constructor(type: VFXEventType = VFXEventType.Event, id: number = 0) {
        this.type = type;
        this.id = id;
    }

    /**
     * 重置事件数据
     */
    reset(type: VFXEventType, id: number): void {
        this.type = type;
        this.id = id;
    }
}

/**
 * VFX Attribute 对象池
 * 按需分配，只有带 attribute 的事件才会借用
 * 不持有 desc，acquire 时根据传入的 desc 构建
 */
class VFXEventAttributePool {

    private pool: Array<VFXEventAttribute> = [];
    private maxPoolSize: number;

    constructor(maxPoolSize: number = 100) {
        this.maxPoolSize = maxPoolSize;
    }

    acquire(desc: VFXEventAttributeDesc): VFXEventAttribute {
        if (this.pool.length > 0) {
            const attr = this.pool.pop()!;
            attr.clear();
            return attr;
        }
        const attr = new VFXEventAttribute(desc);
        attr.initBuffer(desc.createBuffer());
        return attr;
    }

    recycle(attr: VFXEventAttribute): void {
        if (this.pool.length < this.maxPoolSize) {
            this.pool.push(attr);
        }
    }

    clear(): void {
        this.pool.length = 0;
    }
}

/**
 * VFX 事件对象池
 * 用于高效地创建和回收事件对象，减少 GC 压力
 */
export class VFXEventPool {

    private pool: Array<VFXEvent> = [];
    private maxPoolSize: number;
    private attributePool: VFXEventAttributePool;

    /**
     * @param maxPoolSize 对象池最大容量，默认 100
     */
    constructor(maxPoolSize: number = 100) {
        this.maxPoolSize = maxPoolSize;
        this.attributePool = new VFXEventAttributePool(maxPoolSize);
    }

    /**
     * 从对象池获取一个事件对象
     * 如果池中没有可用对象，则创建新对象
     */
    acquire(type: VFXEventType, id: number): VFXEvent {
        let evt: VFXEvent;
        if (this.pool.length > 0) {
            evt = this.pool.pop()!;
            evt.reset(type, id);
        } else {
            evt = new VFXEvent(type, id);
        }
        return evt;
    }

    /**
     * 从 attribute 池借用一个 attribute
     * @param desc 属性布局描述，池为空时用于创建新 attribute
     */
    acquireAttribute(desc: VFXEventAttributeDesc): VFXEventAttribute {
        return this.attributePool.acquire(desc);
    }

    /**
     * 回收事件对象到对象池
     * 如果事件带有 attribute，归还给 attribute 池
     */
    recycle(evt: VFXEvent): void {
        if (evt.attribute) {
            this.attributePool.recycle(evt.attribute);
            evt.attribute = null;
        }
        if (this.pool.length < this.maxPoolSize) {
            this.pool.push(evt);
        }
    }

    /**
     * 批量回收事件对象
     */
    recycleAll(events: Array<VFXEvent>): void {
        for (let i = 0; i < events.length; i++) {
            this.recycle(events[i]);
        }
    }

    /**
     * 清空对象池
     */
    clear(): void {
        this.pool.length = 0;
        this.attributePool.clear();
    }

    /**
     * 获取对象池当前大小
     */
    get size(): number {
        return this.pool.length;
    }
}

export class VFXEventQueue {

    private evtLists: Array<Array<VFXEvent>> = [[], []];
    private eventPool: VFXEventPool;
    private currentIndex: number = 0;

    /**
     * @param poolSize 对象池大小，默认 100
     */
    constructor(poolSize: number = 100) {
        this.eventPool = new VFXEventPool(poolSize);
    }

    getCurrentList(): Array<VFXEvent> {
        return this.evtLists[this.currentIndex];
    }

    getPreviousList(): Array<VFXEvent> {
        return this.evtLists[1 - this.currentIndex];
    }

    /**
     * 推送事件到队列
     * 若传入 attribute，从 attribute 池借用并拷贝数据
     * 若未传入，event.attribute 为 null
     */
    push(id: number, type: VFXEventType = VFXEventType.Event, attribute?: VFXEventAttribute): void {
        let evt = this.eventPool.acquire(type, id);
        if (attribute) {
            evt.attribute = this.eventPool.acquireAttribute(attribute.desc);
            evt.attribute.copyFrom(attribute);
        }
        this.getCurrentList().push(evt);
    }

    empty(): boolean {
        return this.evtLists[this.currentIndex].length == 0;
    }

    /**
     * 清空列表并回收事件对象到对象池
     */
    private clearList(list: Array<VFXEvent>) {
        this.eventPool.recycleAll(list);
        list.length = 0;
    }

    clear() {
        this.clearList(this.evtLists[0]);
        this.clearList(this.evtLists[1]);
    }

    swap() {
        this.currentIndex = 1 - this.currentIndex;
        this.clearList(this.getCurrentList());
    }

    destroy() {
        this.clear();
        this.eventPool.clear();
    }

}
