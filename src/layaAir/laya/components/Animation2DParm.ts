
export enum AniParmType {
    Float,
    Bool,
}
export class Animation2DParm {
    name: string;
    type: AniParmType;
    value: boolean | number;
}