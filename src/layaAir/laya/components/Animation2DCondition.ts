
/**
 * 动画条件类型
 */
export enum AniConditionType {
    /**
     * 大于
     */
    Greater,
    /**
     * 小于
     */
    Less,
    /**
     * 等于
     */
    Equals,
    /**
     * 不等于
     */
    NotEqual,//不等于
}

/**
 * 2D动画类型
 */
export class Animation2DCondition {
    /**
     * id编号
     */
    id: number;
    /**
     * 动画条件
     */
    type: AniConditionType;
    /**
     * 检测值
     */
    checkValue: any
}