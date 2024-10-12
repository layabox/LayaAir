
import { IRenderElement2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { type VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { LayaGL } from "../../layagl/LayaGL";
import { type Material } from "../../resource/Material";
import { SpineShaderInit } from "../material/SpineShaderInit";
import { SpineMeshBase } from "./SpineMeshBase";

/**
 * @en SpineWasmVirturalMesh class for handling Spine skeleton mesh rendering using WebAssembly.
 * @zh SpineWasmVirturalMesh 类用于使用 WebAssembly 处理 Spine 骨骼网格渲染。
 */
export class SpineWasmVirturalMesh extends SpineMeshBase {

    private _renderElement2D: IRenderElement2D;
    /**
     * @en Create a SpineWasmVirturalMesh instance.
     * @param material Material to be used for rendering.
     * @zh 创建 SpineWasmVirturalMesh 实例。
     * @param material 用于渲染的材质。
     */
    constructor(material: Material) {
        super(material);
        this._renderElement2D = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        this._renderElement2D.geometry = this.geo;
    }

    /**
     * @en The vertex declaration for the mesh.
     * @zh 网格的顶点声明。
     */
    get vertexDeclarition(): VertexDeclaration {
        return SpineShaderInit.SpineNormalVertexDeclaration;
    }
}
