import { LightSprite } from "./LightSprite";
/**
 * <code>DirectionLight</code> 类用于创建平行光。
 */
export declare class DirectionLight extends LightSprite {
    /** @private */
    private _direction;
    /**
     * @inheritDoc
     */
    shadow: boolean;
    /**
     * 创建一个 <code>DirectionLight</code> 实例。
     */
    constructor();
    /**
     * @private
     */
    private _initShadow;
    /**
     * @inheritDoc
     */
    protected _onActive(): void;
    /**
     * @inheritDoc
     */
    protected _onInActive(): void;
    /**
     * 更新平行光相关渲染状态参数。
     * @param state 渲染状态参数。
     */
    _prepareToScene(): boolean;
}
