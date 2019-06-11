import { AnimationParser01 } from "./AnimationParser01";
import { AnimationParser02 } from "./AnimationParser02";
import { Skeleton } from "./bone/Skeleton";
import { AnimationTemplet } from "laya/ani/AnimationTemplet";
import { Templet } from "laya/ani/bone/Templet";

export class IAniLib{
    static Skeleton:typeof Skeleton = null;
    static AnimationTemplet:typeof AnimationTemplet=null;
    static Templet:typeof Templet=null;
}
