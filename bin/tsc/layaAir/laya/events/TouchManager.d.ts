/**
 * @private
 * Touch事件管理类，处理多点触控下的鼠标事件
 */
export declare class TouchManager {
    static I: TouchManager;
    private static _oldArr;
    private static _newArr;
    private static _tEleArr;
    /**
     * 当前over的touch表
     */
    private preOvers;
    /**
     * 当前down的touch表
     */
    private preDowns;
    private preRightDowns;
    /**
     * 是否启用
     */
    enable: boolean;
    private _lastClickTime;
    private _clearTempArrs;
    /**
     * 从touch表里查找对应touchID的数据
     * @param touchID touch ID
     * @param arr touch表
     * @return
     *
     */
    private getTouchFromArr;
    /**
     * 从touch表里移除一个元素
     * @param touchID touch ID
     * @param arr touch表
     *
     */
    private removeTouchFromArr;
    /**
     * 创建一个touch数据
     * @param ele 当前的根节点
     * @param touchID touchID
     * @return
     *
     */
    private createTouchO;
    /**
     * 处理touchStart
     * @param ele		根节点
     * @param touchID	touchID
     * @param isLeft	（可选）是否为左键
     */
    onMouseDown(ele: any, touchID: number, isLeft?: boolean): void;
    /**
     * 派发事件。
     * @param eles		对象列表。
     * @param type		事件类型。
     */
    private sendEvents;
    /**
     * 获取对象列表。
     * @param start	起始节点。
     * @param end	结束节点。
     * @param rst	返回值。如果此值不为空，则将其赋值为计算结果，从而避免创建新数组；如果此值为空，则创建新数组返回。
     * @return Array 返回节点列表。
     */
    private getEles;
    /**
     * touchMove时处理out事件和over时间。
     * @param eleNew	新的根节点。
     * @param elePre	旧的根节点。
     * @param touchID	（可选）touchID，默认为0。
     */
    private checkMouseOutAndOverOfMove;
    /**
     * 处理TouchMove事件
     * @param ele 根节点
     * @param touchID touchID
     *
     */
    onMouseMove(ele: any, touchID: number): void;
    getLastOvers(): any[];
    stageMouseOut(): void;
    /**
     * 处理TouchEnd事件
     * @param ele		根节点
     * @param touchID	touchID
     * @param isLeft	是否为左键
     */
    onMouseUp(ele: any, touchID: number, isLeft?: boolean): void;
}
