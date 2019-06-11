import { RenderContext3D } from "./render/RenderContext3D";
import { IDestroy } from "laya/resource/IDestroy";
/**
 * @private
 * <code>GeometryElement</code> 类用于实现几何体元素,该类为抽象类。
 */
export declare class GeometryElement implements IDestroy {
    /**@private */
    protected static _typeCounter: number;
    /**@private */
    protected _destroyed: boolean;
    /**
     * 获取是否销毁。
     * @return 是否销毁。
     */
    readonly destroyed: boolean;
    /**
     * 创建一个 <code>GeometryElement</code> 实例。
     */
    constructor();
    /**
     * 获取几何体类型。
     */
    _getType(): number;
    /**
     * @private
     * @return  是否需要渲染。
     */
    _prepareRender(state: RenderContext3D): boolean;
    /**
     * @private
     */
    _render(state: RenderContext3D): void;
    /**
     * 销毁。
     */
    destroy(): void;
}
