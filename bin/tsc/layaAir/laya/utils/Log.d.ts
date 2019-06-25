/**
     * <code>Log</code> 类用于在界面内显示日志记录信息。
     * 注意：在加速器内不可使用
     */
export declare class Log {
    /**@private */
    private static _logdiv;
    /**@private */
    private static _btn;
    /**@private */
    private static _count;
    /**最大打印数量，超过这个数量，则自动清理一次，默认为50次*/
    static maxCount: number;
    /**是否自动滚动到底部，默认为true*/
    static autoScrollToBottom: boolean;
    /**
     * 激活Log系统，使用方法Laya.init(800,600,Laya.Log);
     */
    static enable(): void;
    /**隐藏/显示日志面板*/
    static toggle(): void;
    /**
     * 增加日志内容。
     * @param	value 需要增加的日志内容。
     */
    static print(value: string): void;
    /**
     * 清理日志
     */
    static clear(): void;
}
