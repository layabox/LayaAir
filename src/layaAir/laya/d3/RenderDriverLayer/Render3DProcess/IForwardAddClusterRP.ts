import { ICameraCullInfo } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { PipelineMode } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderContext3D";
import { Vector4 } from "../../../maths/Vector4";
import { RenderTexture } from "../../../resource/RenderTexture";
import { CameraCullInfo } from "../../RenderObjs/RenderObj/CameraCullInfo";
import { CommandBuffer } from "../../core/render/command/CommandBuffer"
import { Viewport } from "../../math/Viewport";
import { IBaseRenderNode } from "../Render3DNode/IBaseRenderNode";
/**
 * 深度贴图模式
 */
export enum DepthTextureMode {
    /**不生成深度贴图 */
    None = 0,
    /**生成深度贴图 */
    Depth = 1,
    /**生成深度+法线贴图 */
    DepthNormals = 2,
    /**是否应渲染运动矢量  TODO*/
    DepthAndDepthNormals = 3,
    MotionVectors = 4,
}

export interface IForwardAddClusterRP {
    /**enable */
    /**@internal */
    enableOpaque: boolean;
    /**@internal */
    enableCMD: boolean;
    /**@internal */
    enableTransparent: boolean;
    /**@internal */
    enableOpaqueTexture: boolean;

    /**@internal */
    destTarget: RenderTexture;
    /**@internal */
    pipelineMode: PipelineMode;

    /**@internal */
    depthTarget: RenderTexture;
    /**@internal */
    depthPipelineMode: PipelineMode;

    /**@internal */
    depthNormalTarget: RenderTexture;
    /**@internal */
    depthNormalPipelineMode: PipelineMode

    /**@internal sky TODO*/
    skyRenderNode: IBaseRenderNode;
    /**@internal */
    depthTextureMode: DepthTextureMode;
    /**@internal */
    opaqueTexture: RenderTexture;

    setCameraCullInfo(value: ICameraCullInfo): void;
    setViewPort(value: Viewport): void;
    setScissor(value: Vector4): void;
    setBeforeForwardCmds(value: Array<CommandBuffer>): void;
    setBeforeSkyboxCmds(value: Array<CommandBuffer>): void;
    setBeforeTransparentCmds(value: Array<CommandBuffer>): void;
}