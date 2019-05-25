import { AnimationParser01 } from "./AnimationParser01";
import { AnimationParser02 } from "./AnimationParser02";
import { Skeleton } from "./bone/Skeleton";

export class IAniLib{
    static AnimationParser01:typeof AnimationParser01=null;
    static AnimationParser02:typeof AnimationParser02=null;
    static Skeleton:typeof Skeleton = null;
}
