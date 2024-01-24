// import { InternalRenderTarget } from "../../../RenderEngine/RenderInterface/InternalRenderTarget";
// import { Color } from "../../../maths/Color";
// import { Vector4 } from "../../../maths/Vector4";
// import { Camera } from "../../core/Camera";
// import { CommandBuffer } from "../../core/render/command/CommandBuffer"
// import { Viewport } from "../../math/Viewport";
// import { PipelineMode } from "../IRenderContext3D";
// import { IBaseRenderNode } from "../Render3DNode/IBaseRenderNode";
// import { ICameraNodeData } from "../RenderModuleData/IModuleData";
// /**
//  * 深度贴图模式
//  */
// export enum DepthTextureMode {
//     /**不生成深度贴图 */
//     None = 0,
//     /**生成深度贴图 */
//     Depth = 1,
//     /**生成深度+法线贴图 */
//     DepthNormals = 2,
//     /**是否应渲染运动矢量  TODO*/
//     DepthAndDepthNormals = 3,
//     MotionVectors = 4,
// }

// export interface IForwardAddClusterRP {
//     /**enable */
//     /**@internal */
//     enableOpaque: boolean;
//     /**@internal */
//     enableCMD: boolean;
//     /**@internal */
//     enableTransparent: boolean;
//     /**@internal */
//     enableOpaqueTexture: boolean;

//     /**@internal */
//     destTarget: InternalRenderTarget;
//     /**@internal */
//     pipelineMode: PipelineMode;

//     /**@internal */
//     depthTarget: InternalRenderTarget;
//     /**@internal */
//     depthPipelineMode: PipelineMode;

//     /**@internal */
//     depthNormalTarget: InternalRenderTarget;
//     /**@internal */
//     depthNormalPipelineMode: PipelineMode

//     /**@internal sky TODO*/
//     skyRenderNode: IBaseRenderNode;
//     /**@internal */
//     depthTextureMode: DepthTextureMode;
//     /**@internal */
//     opaqueTexture: InternalRenderTarget;
//     /**@internal */
//     camera: ICameraNodeData;
//     /**@internal */
//     clearColor: Color;
//     /**@internal */
//     clearFlag: number;

//     setCameraCullInfo(value: Camera): void;
//     setViewPort(value: Viewport): void;
//     setScissor(value: Vector4): void;
//     setBeforeForwardCmds(value: Array<CommandBuffer>): void;
//     setBeforeSkyboxCmds(value: Array<CommandBuffer>): void;
//     setBeforeTransparentCmds(value: Array<CommandBuffer>): void;
// }