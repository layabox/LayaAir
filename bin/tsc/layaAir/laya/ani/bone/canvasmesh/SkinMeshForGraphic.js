import { MeshData } from "./MeshData";
export class SkinMeshForGraphic extends MeshData {
    //TODO:coverage
    constructor() {
        super();
    }
    init2(texture, ps, verticles, uvs) {
        if (this.transform) {
            this.transform = null;
        }
        var _ps = ps || [0, 1, 3, 3, 1, 2];
        this.texture = texture;
        this.indexes = new Uint16Array(_ps);
        this.vertices = new Float32Array(verticles);
        this.uvs = new Float32Array(uvs);
    }
}
