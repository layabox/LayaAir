
import { Graphics } from "../../display/Graphics";
import { SpineMaterialShaderInit } from "../material/SpineMaterialShaderInit";
import { SpineMeshBase } from "./SpineMeshBase";

export class SpineWasmVirturalMesh extends SpineMeshBase {

    drawNew(graphics: Graphics, vertices: Float32Array, vblength: number, indices: Uint16Array, iblength: number) {
        this.vertexArray = vertices;
        this.indexArray = indices;
        this.verticesLength = vblength;
        this.indicesLength = iblength;
        this.draw(graphics);
    }
    get vertexDeclarition() {
        return SpineMaterialShaderInit.vertexDeclaration;
    }
}
