import { ILoadTask, ILoadURL } from "../../net/Loader";
import { Texture2D } from "../../resource/Texture2D";
import { ESpineRenderMode } from "../SpineConst";
import { SpineTemplet } from "../SpineTemplet";
import { ISpineRender } from "./ISpineRender";

export interface ISkeletonOptimise {
    data: any;
    getAniNameByIndex(index: number): string | null;
    findAnimation(name: string): any | null;
    getSkinIndexByName(skinName: string): number;
    getAnimationCount(): number;
    checkMainAttach(skeleton: spine.Skeleton, data: spine.SkeletonData): void;
    destroy(): void;
}

export interface ISpineTempletParser {
    collectTextures(atlasText: string, task: ILoadTask): ILoadURL[];
    create(desc: string | ArrayBuffer, textures: Texture2D[]): SpineTemplet;
    destroy(): void;
}
