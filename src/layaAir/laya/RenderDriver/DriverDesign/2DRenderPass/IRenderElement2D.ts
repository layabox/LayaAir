import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { IRenderStruct2D } from "../../RenderModuleData/Design/2D/IRenderStruct2D";
import { IRenderGeometryElement } from "../RenderDevice/IRenderGeometryElement";
import { ShaderData } from "../RenderDevice/ShaderData";

/**
 * @blueprintIgnore @blueprintIgnoreSubclasses
 */
export interface IRenderElement2D {
    type: number;
    geometry: IRenderGeometryElement;
    materialShaderData: ShaderData;
    value2DShaderData: ShaderData;
    globalShaderData: ShaderData;
    subShader: SubShader;
    renderStateIsBySprite: boolean;//渲染节点的renderState根据哪个ShaderData来
    nodeCommonMap: Array<string>;
    owner: IRenderStruct2D;
    destroy(): void;

    ///** @internal 在合批过程中需要收集 */
    _index?: number;
}

/**
 * @blueprintIgnore @blueprintIgnoreSubclasses
 */
export interface IPrimitiveRenderElement2D extends IRenderElement2D {
    /**
     * @en Type key encoding blend mode and flags: blendShader | useCustomMaterial | mc | hasFillTexture.
     * @zh 类型键编码混合模式和标志位：blendShader | useCustomMaterial | mc | hasFillTexture。
     */
    typeKey: number;
    /**
     * @en Texture key encoding per-element shader define bits and texture ID.
     * @zh 纹理键编码逐元素着色器宏定义位和纹理ID。
     */
    textureKey: number;
    primitiveShaderData: ShaderData;
}

