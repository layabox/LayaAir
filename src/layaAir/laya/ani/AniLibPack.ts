import { Skeleton } from "./bone/Skeleton";
import { AnimationTemplet } from "./AnimationTemplet";
import { Templet } from "./bone/Templet";
/**
 * @internal
 */
export class IAniLib {
    static Skeleton: typeof Skeleton|null = null;
    static AnimationTemplet: typeof AnimationTemplet|null = null;
    static Templet: typeof Templet|null = null;
}
