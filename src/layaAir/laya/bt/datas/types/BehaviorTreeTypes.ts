export enum BTType {
    Wait = "BTTaskWait",
    Test = "BTTaskTest",
    Loop = "BTLoop",
    Parallel = "SimpleParallel",
    Selector = "Selector",
    Sequence = "Sequence",
    Cooldown = "BTCooldown",
    BlackBorad = "BTBlackBorad",
    RunBehavior = "BTTaskRunBehavior",
    ForceSuccess = "BTForceSuccess",
    ConditionalLoop = "BTConditionalLoop",
    FinishWithResult = "BTTaskFinishWithResult",
    CompareBBEntries = "BTCompareBBEntries",
}

export interface TBTNode {
    /** 数据唯一的id号*/
    id: number;
    ver?: number;
    /**dispatcher的名字 */
    /**当前的类 */
    target?: string;
    name?: string;
    /** constData的id号 */
    cid: BTType;
    /**var或者event的id */
    dataId?: string;
    customId?: number;
    /**所有UI所用到的数据 */
    uiData?: {
        /**数据的x坐标位置 */
        x: number;
        /**数据的y坐标位置 */
        y: number;
        /**函数注释 */
        desc?: any;
        /**是否隐藏 */
        isHidden?: boolean,
        /**是否显示desc的气泡 */
        isShowDesc?: boolean;
    },
    childs?: string[];
    debugType?: number;
    decorator?: TBTDecorator[];
    service?: TBTService[];
    autoReg?: boolean;
    props?: Record<string, any>;
}

export interface TBTDecorator {
    id: number;
    cid: string;
}

export interface TBTService {
    id: number;
    cid: string;
}