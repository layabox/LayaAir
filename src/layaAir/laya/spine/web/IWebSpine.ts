import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { Material } from "../../resource/Material";
import { ISpineFactory } from "../interface/ISpineFactory";
import { VBCreator } from "./base/buffer/VBCreator";
import { AttachmentParse } from "./base/optimize/AttachmentParse";
import { BaseOptimizeRender } from "./base/optimize/BaseOptimizeRender";
import { SpineRenderUpdater } from "./base/optimize/SpineRenderUpdater";



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

export interface IRender {
    bind( updater: SpineRenderUpdater, skeleton: spine.Skeleton): void;
    change(): void;
    leave(): void;
    render(curTime: number, offsetX?: number, offsetY?: number): void;
    afterRender?(optimizeRender: BaseOptimizeRender): void;
    destroy():void;
}

export interface ISpineNormalUpdater { 
    renderUpdate(skeleton: spine.Skeleton, updater: SpineRenderUpdater
        , slotRangeStart?: number, slotRangeEnd?: number
        , offsetX?: number, offsetY?: number): void;
    
    needUpdate: boolean;
    subMeshes: IRenderGeometryElement[];
    materials: Material[];
}

export enum ERenderProxyType {
    RenderNormal,
    RenderRigidBody,
    RenderOptimize,
    RenderBake
}