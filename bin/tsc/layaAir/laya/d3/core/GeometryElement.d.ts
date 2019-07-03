import { IDestroy } from "../../resource/IDestroy";
/**
 * <code>GeometryElement</code> 类用于实现几何体元素,该类为抽象类。
 */
export declare class GeometryElement implements IDestroy {
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
     * 销毁。
     */
    destroy(): void;
}
