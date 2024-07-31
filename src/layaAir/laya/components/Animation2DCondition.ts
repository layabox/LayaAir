
/**
 * @en Animation condition types
 * @zh 动画条件类型
 */
export enum AniConditionType {
    /**
     * @en Greater than
     * @zh 大于
     */
    Greater,
    /**
     * @en Less than
     * @zh 小于
     */
    Less,
    /**
     * @en Equal to
     * @zh 等于
     */
    Equals,
    /**
     * @en Not equal to
     * @zh 不等于
     */
    NotEqual,//不等于
}

/**
 * @en 2D animation types
 * @zh 2D动画类型
 */
export class Animation2DCondition {
    /**
     * @en ID number
     * @zh id编号
     */
    id: number;
    /**
     * @en Animation conditions
     * @zh 动画条件
     */
    type: AniConditionType;
    /**
     * @en Detection value
     * @zh 检测值
     */
    checkValue: any
}