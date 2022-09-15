
export enum AniParmType {
    Float,
    Bool,
}
export class Animation2DParm {
    type: AniParmType;
    value: boolean | number;
}