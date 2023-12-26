import { ICameraCullInfo } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { RenderTexture } from "../../../resource/RenderTexture";
import { CameraCullInfo } from "../../RenderObjs/RenderObj/CameraCullInfo";
import { CommandBuffer } from "../../core/render/command/CommandBuffer"
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
    destTarget: RenderTexture;
    depthTarget: RenderTexture;
    depthNormalTarget: RenderTexture;
    skyRenderNode: IBaseRenderNode;
    depthTextureMode: DepthTextureMode;
    setCameraCullInfo(value: ICameraCullInfo): void;
    setBeforeForwardCmds(value: Array<CommandBuffer>): void;
    setBeforeSkyboxCmds(value: Array<CommandBuffer>): void;
    setBeforeTransparentCmds(value: Array<CommandBuffer>): void;
}