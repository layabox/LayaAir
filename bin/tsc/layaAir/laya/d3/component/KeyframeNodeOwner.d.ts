/**
 * @private
 * <code>KeyframeNodeOwner</code> 类用于保存帧节点的拥有者信息。
 */
export declare class KeyframeNodeOwner {
    /**@private */
    indexInList: number;
    /**@private */
    referenceCount: number;
    /**@private */
    updateMark: number;
    /**@private */
    type: number;
    /**@private */
    fullPath: string;
    /**@private */
    propertyOwner: any;
    /**@private */
    property: string[];
    /**@private */
    defaultValue: any;
    /**@private */
    crossFixedValue: any;
    /**
     * 创建一个 <code>KeyframeNodeOwner</code> 实例。
     */
    constructor();
    /**
     * @private
     */
    saveCrossFixedValue(): void;
}
