import { Sprite } from "../display/Sprite";

export interface IHitArea {
    contains(x: number, y: number, sp?: Sprite): boolean;
}