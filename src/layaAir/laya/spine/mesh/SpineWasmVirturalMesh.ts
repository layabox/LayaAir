
import { IRenderElement2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { Graphics } from "../../display/Graphics";
import { LayaGL } from "../../layagl/LayaGL";
import { Material } from "../../resource/Material";
import { SpineShaderInit } from "../material/SpineShaderInit";
import { SpineMeshBase } from "./SpineMeshBase";

export class SpineWasmVirturalMesh extends SpineMeshBase {

    private _renderElement2D: IRenderElement2D;
    constructor(material: Material) {
        super(material);
        this._renderElement2D = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        this._renderElement2D.geometry = this.geo;
        this._renderElement2D.nodeCommonMap = ["BaseRender2D","spine2D"];
    }

    get vertexDeclarition() {
        return SpineShaderInit.SpineNormalVertexDeclaration;
    }
}
