import { AniParmType } from "./AnimatorControllerParse";

/**
 * @en Represents a parameter for 2D animation that includes a name, type, and value.
 * @zh 表示2D动画的参数，包括名称、类型和值。
 */
export class Animation2DParm {
    name: string;
    type: AniParmType;
    value: boolean | number;
}