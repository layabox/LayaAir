import { Color } from "../../../maths/Color";
import { BaseRenderNode2D } from "../../../NodeRender2D/BaseRenderNode2D";
import { SpineTemplet } from "../../SpineTemplet";
import { VBCreator } from "../base/buffer/VBCreator";
import { AttachmentParse } from "../base/optimize/AttachmentParse";
import { SpineRenderUpdater } from "../base/optimize/SpineRenderUpdater";
import { IRenderStruct2D } from "../../../RenderDriver/RenderModuleData/Design/2D/IRenderStruct2D";
import { ShaderData } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { IRenderGeometryElement } from "../../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { Material } from "../../../resource/Material";
import { ISpineFactory } from "../../interface/ISpineFactory";


export interface IVBChange {
    slotId:number;
    startFrame:number;
    endFrame:number;
    apply(frame:number , vb: VBCreator, slots: spine.Slot[]):boolean;
    initChange(vb: VBCreator): boolean;
    clone(): IVBChange;
}

export interface IChange {
    change(vb: VBCreator, slotAttachMap: Map<number, Map<string, AttachmentParse>>): boolean;

    changeOrder(attachMap: AttachmentParse[]): number[] | null;
}

export interface INormalRenderUpdater {
    needUpdate: boolean;
    materials: Material[];
    subMeshes:IRenderGeometryElement[];
    renderUpdate(skeleton: spine.Skeleton, updater: SpineRenderUpdater, slotRangeStart?: number, slotRangeEnd?: number , offsetX?: number , offsetY?: number ): void;
}

export interface IWebSpineFactory extends ISpineFactory{
    createNormalRenderUpdater(): INormalRenderUpdater;
}