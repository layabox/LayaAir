
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { Camera } from "../../../d3/core/Camera";
import { Transform3D } from "../../../d3/core/Transform3D";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { FastSinglelist, SingletonList } from "../../../utils/SingletonList";
import { ICameraNodeData, IBaseRenderNode, ISceneNodeData } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { ShaderData } from "../RenderDevice/ShaderData";
import { IRenderGeometryElement } from "../RenderDevice/IRenderGeometryElement";
import { InternalRenderTarget } from "../RenderDevice/InternalRenderTarget";
import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { Viewport } from "../../../maths/Viewport";
import { IRenderCMD } from "../RenderDevice/IRenderCMD";
export interface IRender3DProcess {
    fowardRender(context: IRenderContext3D, camera: Camera): void;
}

export declare type PipelineMode = "Forward" | "ShadowCaster" | "DepthNormal" | string;
export interface IRenderContext3D {
    globalShaderData: ShaderData;
    sceneData: ShaderData;
    sceneModuleData: ISceneNodeData;
    cameraModuleData: ICameraNodeData;
    cameraData: ShaderData;
    sceneUpdataMask: number;
    cameraUpdateMask: number;
    pipelineMode: PipelineMode;
    invertY: boolean;
    setRenderTarget(value: InternalRenderTarget, clearFlag: RenderClearFlag): void;
    setViewPort(value: Viewport): void;
    setScissor(value: Vector4): void;
    setClearData(clearFlag: number, clolor: Color, depth: number, stencil: number): number;
    drawRenderElementList(list: FastSinglelist<IRenderElement3D>): number;
    drawRenderElementOne(node: IRenderElement3D): number;
    runOneCMD(cmd: IRenderCMD): void
    runCMDList(cmds: IRenderCMD[]): void;
}

export interface IRenderElement3D {
    geometry: IRenderGeometryElement;
    materialShaderData: ShaderData;
    materialRenderQueue: number;
    renderShaderData: ShaderData;
    transform: Transform3D;
    canDynamicBatch: boolean;
    isRender: boolean;
    owner: IBaseRenderNode;
    subShader: SubShader;
    materialId: number;
    destroy(): void;
}

export interface IInstanceRenderBatch {
    batch(elements: SingletonList<IRenderElement3D>): void;
    clearRenderData(): void;
    recoverData(): void;
}

export interface IInstanceRenderElement3D extends IRenderElement3D {
    instanceElementList: SingletonList<IRenderElement3D>;
    setGeometry(geometry: IRenderGeometryElement): void;
    clearRenderData(): void;
    recover(): void;
}

export interface ISkinRenderElement3D {
    skinnedData: Float32Array[];
}