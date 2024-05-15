import { Graphics } from "../../display/Graphics";

export interface ISpineRender{
    draw(skeleton: spine.Skeleton, graphics: Graphics, slotRangeStart?:number, slotRangeEnd?:number):void;
}