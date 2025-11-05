import { ISkeletonOptimise, ISpineTempletParser, SpineEmptyTempletParser } from "./ISpineParse";
import { ISpineRender, SpineEmptyRender } from "./ISpineRender";

export interface ISpineFactory {
    createSpineTempletParser(): ISpineTempletParser;
    createSpineRender(): ISpineRender;
    // createSkeletonOptimise(): ISkeletonOptimise;
    // createVBCreator(): IVBCreator;
    // createIBCreator(): IIBCreator;
    // createMultiRenderData(): IMultiRenderData;
    // createAttachmentParse(): IAttachmentParse;
    // createAnimationRender(): IAnimationRender;
    // createChange(): IChange;
    // createIVBChange(): IVBChange;
}

export class EmptyFactory implements ISpineFactory {
    createSpineTempletParser(): ISpineTempletParser{
        return SpineEmptyTempletParser.instance;
    }
    createSpineRender(): ISpineRender {
        return SpineEmptyRender.instance;
    }
    // createSkeletonOptimise(): ISkeletonOptimise;
    // createVBCreator(): IVBCreator;
    // createIBCreator(): IIBCreator;
    // createMultiRenderData(): IMultiRenderData;
    // createAttachmentParse(): IAttachmentParse;
    // createAnimationRender(): IAnimationRender;
    // createChange(): IChange;
    // createIVBChange(): IVBChange;
}