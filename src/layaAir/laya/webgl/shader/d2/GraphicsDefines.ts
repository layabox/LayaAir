import { Config } from "../../../../Config";
import { LayaEnv } from "../../../../LayaEnv";
import { LayaGL } from "../../../layagl/LayaGL";
import { IGraphicsOp2DFactory } from "../../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { VertexElement } from "../../../renders/VertexElement";
import { VertexElementFormat } from "../../../renders/VertexElementFormat";

export class GraphicsDefines{

    /** @internal */
    static GRAPHICS_INDEX_FORMAT: IndexFormat = IndexFormat.UInt16;
    /** @internal */
    static GRAPHICS_INDEX_BYTE_SIZE: number = 2;
    /** @internal */
    static GRAPHICS_INDEX_ARRAY_TYPE: Uint16ArrayConstructor | Uint32ArrayConstructor = Uint16Array;
    /** @internal */
    static GRAPHICS_VERTEX_INIT_COUNT: number = 32768;
    /** @internal */
    static GRAPHICS_MAX_VERTEX: number = 0x10000;

    /** @internal */
    static vertexDeclarition: VertexDeclaration;
    /** @internal */
    static stride: number = 0;

    static _factory: IGraphicsOp2DFactory = null;

    static __init__(): void {
        GraphicsDefines.vertexDeclarition = new VertexDeclaration(64, [
            new VertexElement(0, VertexElementFormat.Vector4, 0),//pos,uv
            new VertexElement(16, VertexElementFormat.Vector4, 1),//color,alpha
            new VertexElement(32, VertexElementFormat.Vector4, 2),//
            new VertexElement(48, VertexElementFormat.Vector4, 3),//custom
        ]);

        GraphicsDefines.stride = GraphicsDefines.vertexDeclarition.vertexStride / 4;
        let supportUInt32 = Config.useGraphics2DIndexUInt32 && LayaGL.renderEngine && LayaGL.renderEngine.getCapable(RenderCapable.Element_Index_Uint32);
        if (supportUInt32) {
            GraphicsDefines.GRAPHICS_INDEX_FORMAT = IndexFormat.UInt32;
            GraphicsDefines.GRAPHICS_INDEX_BYTE_SIZE = 4;
            GraphicsDefines.GRAPHICS_INDEX_ARRAY_TYPE = Uint32Array;
            GraphicsDefines.GRAPHICS_MAX_VERTEX = 0x100000;
        }
        else {
            GraphicsDefines.GRAPHICS_INDEX_FORMAT = IndexFormat.UInt16;
            GraphicsDefines.GRAPHICS_INDEX_BYTE_SIZE = 2;
            GraphicsDefines.GRAPHICS_INDEX_ARRAY_TYPE = Uint16Array;
            GraphicsDefines.GRAPHICS_MAX_VERTEX = 0x10000;
        }

		GraphicsDefines._factory = LayaGL.render2DRenderPassFactory.createGraphicsOp2DFactory();

        if (LayaEnv.isConch) {
            GraphicsDefines._syncNativeGraphics2D();
        }
    }

    private static _syncNativeGraphics2D(): void {
        const nativeBatch = (window as any).conchRTGraphicsBatch;
        nativeBatch.clearGraphics2DVertexDeclaration();
        let shaderValues = GraphicsDefines.vertexDeclarition._shaderValues;
        for (let key in shaderValues) {
            nativeBatch.setGraphics2DVertexDeclaration(parseInt(key), shaderValues[key]);
        }

        nativeBatch.setGraphics2DIndexFormat(GraphicsDefines.GRAPHICS_INDEX_FORMAT, GraphicsDefines.GRAPHICS_INDEX_BYTE_SIZE);
    }
}
