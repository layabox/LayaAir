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

export interface IForwardAddClusterRP{
    cameraCullInfo:CameraCullInfo
    beforeForwardCmds:Array<CommandBuffer>;
    beforeSkyboxCmds:Array<CommandBuffer>;
    beforeTransparentCmds:Array<CommandBuffer>;
    destTarget:RenderTexture;
    depthTarget:RenderTexture;
    depthNormalTarget:RenderTexture;
    //TODO
    skyRenderNode:IBaseRenderNode;
    depthTextureMode:DepthTextureMode;
}