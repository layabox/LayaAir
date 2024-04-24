
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { Camera } from "../../../d3/core/Camera";
import { Transform3D } from "../../../d3/core/Transform3D";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { SingletonList } from "../../../utils/SingletonList";
import { ICameraNodeData, IBaseRenderNode, ISceneNodeData } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { ShaderData } from "../RenderDevice/ShaderData";
import { IRenderGeometryElement } from "../RenderDevice/IRenderGeometryElement";
import { InternalRenderTarget } from "../RenderDevice/InternalRenderTarget";
import { IRenderCMD } from "./IRendderCMD";
import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Viewport } from "../../../maths/Viewport";
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
    drawRenderElementList(list: SingletonList<IRenderElement3D>): number;
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

export interface ISkyRenderElement3D extends IRenderElement3D {
    skyViewMatrix: Matrix4x4;
    skyProjectionMatrix: Matrix4x4;
}