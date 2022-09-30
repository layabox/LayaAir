
export enum AniConditionType {
    Greater,
    Less,
    Equals,
    NotEqual,
}

export class Animation2DCondition {
    id: number;
    type: AniConditionType;
    checkValue: any
}