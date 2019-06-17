import { SingletonList } from "./component/SingletonList";
import { BaseRender } from "./core/render/BaseRender";
/**
    /**
     * <code>CastShadowList</code> 类用于实现产生阴影者队列。
     */
export declare class CastShadowList extends SingletonList {
    /**
     * 创建一个新的 <code>CastShadowList</code> 实例。
     */
    constructor();
    /**
     * @private
     */
    add(element: BaseRender): void;
    /**
     * @private
     */
    remove(element: BaseRender): void;
}
