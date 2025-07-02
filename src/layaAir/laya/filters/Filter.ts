import { PostProcess2DEffect } from "../display/PostProcess2DEffect";
import { Event } from "../events/Event";
import { EventDispatcher } from "../events/EventDispatcher";

/**
 * 
 * @en The `Filter` class is the base class for filters. Filters are post-processing operations on nodes, so they inevitably operate on a renderTexture.
 * @zh Filter 是滤镜基类。滤镜是针对节点的后处理过程，所以必然操作一个rendertexture
 */
export abstract class Filter extends EventDispatcher {
    protected onChange() {
        this.event(Event.CHANGED);
    }
    abstract getEffect(): PostProcess2DEffect;
}