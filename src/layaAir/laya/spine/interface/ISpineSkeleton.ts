import { SpineTemplet } from "../SpineTemplet";

export interface ISpineSkeleton {
    templet: SpineTemplet;
    getSkeleton(): spine.Skeleton;
    changeNormal():void;
}