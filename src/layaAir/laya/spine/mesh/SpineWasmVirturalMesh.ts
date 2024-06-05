
import { IRenderElement2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { Graphics } from "../../display/Graphics";
import { LayaGL } from "../../layagl/LayaGL";
import { Material } from "../../resource/Material";
import { SpineMaterialShaderInit } from "../material/SpineMaterialShaderInit";
import { SpineMeshBase } from "./SpineMeshBase";

export class SpineWasmVirturalMesh extends SpineMeshBase {

    private _renderElement2D: IRenderElement2D;
    constructor(material: Material) {
        super(material);
        this._renderElement2D = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        this._renderElement2D.geometry = this.geo;
    }

    drawNew(vertices: Float32Array, vblength: number, indices: Uint16Array, iblength: number) {
        this.vertexArray = vertices;
        this.indexArray = indices;
        this.verticesLength = vblength;
        this.indicesLength = iblength;

        this.draw();
    }
    get vertexDeclarition() {
        return SpineMaterialShaderInit.vertexDeclaration;
    }
}
