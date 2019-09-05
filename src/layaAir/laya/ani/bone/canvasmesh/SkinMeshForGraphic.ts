import { MeshData } from "./MeshData";
import { Matrix } from "../../../maths/Matrix";
import { Texture } from "../../../resource/Texture";



export class SkinMeshForGraphic extends MeshData {

    //TODO:coverage
    constructor() {
        super();


    }
	/**
	 * 矩阵
	 */
    transform: Matrix|null;

    init2(texture: Texture, ps: any[], verticles: any[], uvs: any[]): void {
        if (this.transform) {
            this.transform = null;
        }
        var _ps: any[] = ps || [0, 1, 3, 3, 1, 2];
        this.texture = texture;

        this.indexes = new Uint16Array(_ps);
        this.vertices = new Float32Array(verticles);
        this.uvs = new Float32Array(uvs);
    }
}


