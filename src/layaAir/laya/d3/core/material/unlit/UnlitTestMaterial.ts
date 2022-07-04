import { Material } from "../Material";

export class UnlitTestMaterial extends Material {

    constructor() {
        super();
        this.setShaderName("UnlitShader");
    }
}