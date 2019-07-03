import { LightSprite } from "./LightSprite";
/**
 * <code>PointLight</code> 类用于创建点光。
 */
export declare class PointLight extends LightSprite {
    private static _tempMatrix0;
    private _range;
    private _lightMatrix;
    /**
     * 创建一个 <code>PointLight</code> 实例。
     */
    constructor();
    /**
     * 获取点光的范围。
     * @return 点光的范围。
     */
    /**
    * 设置点光的范围。
    * @param  value 点光的范围。
    */
    range: number;
    /**
     * @inheritDoc
     */
    protected _onActive(): void;
    /**
     * @inheritDoc
     */
    protected _onInActive(): void;
    /**
     * 更新点光相关渲染状态参数。
     * @param state 渲染状态参数。
     */
    _prepareToScene(): boolean;
    /**
     * @inheritDoc
     */
    _parse(data: any, spriteMap: any): void;
}
