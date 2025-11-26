
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { Camera } from "../../../d3/core/Camera";
import { Transform3D } from "../../../d3/core/Transform3D";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { FastSinglelist } from "../../../utils/SingletonList";
import { ICameraNodeData, IBaseRenderNode, ISceneNodeData, IDirectLightData, ISpotLightData } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { ShaderData } from "../RenderDevice/ShaderData";
import { IRenderGeometryElement } from "../RenderDevice/IRenderGeometryElement";
import { InternalRenderTarget } from "../RenderDevice/InternalRenderTarget";
import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { Viewport } from "../../../maths/Viewport";
import { IRenderCMD } from "../RenderDevice/IRenderCMD";
import { ISceneRenderManager } from "./ISceneRenderManager";
import { CommandBuffer } from "../../../d3/core/render/command/CommandBuffer";
import { DepthTextureMode } from "../../../resource/RenderTexture";

/**
 * @blueprintIgnore @blueprintIgnoreSubclasses
 */
export interface IRender3DProcess {
    render3DManager: ISceneRenderManager;
    fowardRender(context: IRenderContext3D, camera: Camera): void;
    destroy(): void;
}

export interface IMain3DRP {
    pipelineMode: PipelineMode;
    depthPipelineMode: PipelineMode;
    depthNormalPipelineMode: PipelineMode
    depthTextureMode: DepthTextureMode;
    blitOpaqueBuffer: CommandBuffer;
    depthTarget: InternalRenderTarget;
    destTarget: InternalRenderTarget;
    depthNormalTarget: InternalRenderTarget;
    enableCMD: boolean;
    enableOpaque: boolean;
    enableTransparent: boolean;
    clearFlag: number;
    skyRenderNode: IBaseRenderNode;
    camera: Camera;
    clearColor: Color;
    setViewPort(value: Viewport): void;
    setScissor(value: Vector4): void;
    setBeforeForwardCmds(value: CommandBuffer[]): void;
    setBeforeSkyboxCmds(value: CommandBuffer[]): void;
    setBeforeTransparentCmds(value: CommandBuffer[]): void;
    setCameraCullInfo(sceneManager: ISceneRenderManager): void;
    render(context: IRenderContext3D, renderManager: ISceneRenderManager): void;
    destory(): void;
}

export interface IDirShadowRP {
    setShadowCasterCommanBuffer(cmd: CommandBuffer[]): void;
    setRPData(dirLight: IDirectLightData, camera: ICameraNodeData, context: IRenderContext3D, renderManager: ISceneRenderManager): void;
    setCameraCullInfo(sceneManager: ISceneRenderManager): void;
    update(context: IRenderContext3D): void
    render(context: IRenderContext3D, manager: ISceneRenderManager): void;
    useRPResource(context: IRenderContext3D): void;
    unuseRPResource(context: IRenderContext3D): void;
    destory(): void;
}

export interface ISpotShadowRP {
    setRPData(spotLight: ISpotLightData, context: IRenderContext3D, renderManager: ISceneRenderManager): void;
    setCameraCullInfo(sceneManager: ISceneRenderManager): void;
    update(context: IRenderContext3D): void
    render(context: IRenderContext3D, manager: ISceneRenderManager): void;
    useRPResource(context: IRenderContext3D): void;
    unuseRPResource(context: IRenderContext3D): void;
    destory(): void;
}


/**
 * 渲染数据
 */
export interface IForwardAddRP {
    shadowCastPass: boolean;
    enableDirectLightShadow: boolean;
    enableSpotLightShadowPass: boolean;
    enablePostProcess: boolean;
    mainRenderpass: IMain3DRP;
    dirShadowRenderPass: IDirShadowRP;
    spotShadowRenderPass: ISpotShadowRP;
    postProcess: CommandBuffer;
    finalize: CommandBuffer;
    setBeforeImageEffect(value: CommandBuffer[]): void;
    setAfterEventCmd(value: CommandBuffer[]): void;
    runBeforeImageEffectCMD(context: IRenderContext3D): void;
    runAfterEventCMD(context: IRenderContext3D): void;
    destroy(): void;
}


export declare type PipelineMode = "Forward" | "ShadowCaster" | "DepthNormal" | string;

/**
 * @blueprintIgnore @blueprintIgnoreSubclasses
 */
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
    preDrawUniformMaps: Set<string>;
    setRenderTarget(value: InternalRenderTarget, clearFlag: RenderClearFlag): void;
    setViewPort(value: Viewport): void;
    setScissor(value: Vector4): void;
    setClearData(clearFlag: number, clolor: Color, depth: number, stencil: number): number;
    drawRenderElementList(list: FastSinglelist<IRenderElement3D>): number;
    drawRenderElementOne(node: IRenderElement3D): number;
    runOneCMD(cmd: IRenderCMD): void
    runCMDList(cmds: IRenderCMD[]): void;
    clearRenderTarget(): void;
}

/**
 * @blueprintIgnore @blueprintIgnoreSubclasses
 */
export interface IRenderElement3D {
    geometry: IRenderGeometryElement;
    materialShaderData: ShaderData;
    materialRenderQueue: number;
    materialId: number;
    renderShaderData: ShaderData;
    transform: Transform3D;
    canDynamicBatch: boolean;
    isRender: boolean;
    owner: IBaseRenderNode;
    subShader: SubShader;

    destroy(): void;
}

/**
 * @blueprintIgnore @blueprintIgnoreSubclasses
 */
export interface ISkinRenderElement3D {
    skinnedData: Float32Array[];
}