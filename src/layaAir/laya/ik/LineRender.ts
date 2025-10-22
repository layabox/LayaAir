import { Color } from "../maths/Color";
import { Vector3 } from "../maths/Vector3";


export interface ILinerender{
    addLine(start:Vector3,end:Vector3, c1:Color,c2:Color):void;
    destroy():void;
    clear():void;
}

