// import { Viewport } from "../../../d3/math/Viewport";
// import { Vector4 } from "../../../maths/Vector4";
// import { ShaderData } from "../../RenderShader/ShaderData";
// import { IRenderTarget } from "../IRenderTarget";
// import { IRenderElement } from "./IRenderElement";

// export type PipelineMode = "Forward" | "ShadowCaster" | "DepthNormal" | string;

// export interface IRenderContext3D {
// 	//dest Texture
// 	destTarget: IRenderTarget;
// 	//viewPort
// 	viewPort: Viewport;
// 	//scissor
// 	scissor: Vector4;
// 	//is invert Y
// 	invertY: boolean;
// 	//pipeLineMode
// 	pipelineMode: PipelineMode;
// 	// config shader data
// 	configShaderData: ShaderData;
// 	//Camera Shader Data
// 	cameraShaderData: ShaderData;
// 	//Scene cache
// 	sceneID: number;
// 	//scene Shader Data
// 	sceneShaderData: ShaderData;
// 	//Camera Update Mark
// 	cameraUpdateMark: number;
// 	//Global ShaderData
// 	globalShaderData: ShaderData;
// 	/**设置IRenderContext */
// 	applyContext(cameraUpdateMark: number): void;
// 	/**draw one element by context */
// 	drawRenderElement(renderelemt: IRenderElement): void;

// 	end():void;
// }
