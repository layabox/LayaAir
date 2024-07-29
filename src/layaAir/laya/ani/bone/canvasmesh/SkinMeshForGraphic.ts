import { MeshData } from "./MeshData";
import { Matrix } from "../../../maths/Matrix";
import { Texture } from "../../../resource/Texture";


/**
 * @en Create SkinGraphic Mesh data.
 * @zh 创建SkinGraphic网格数据
 */
export class SkinMeshForGraphic extends MeshData {

    /**
     * @en Constructor method. Create SkinGraphic Mesh data.
     * @zh 构造方法，创建SkinGraphic网格数据
     */
    constructor() {
        super();
    }

    /**
     * @en Transform matrix
     * @zh 变换矩阵
     */
    transform: Matrix | null;

    /**
     * @en Create Texture MeshData
     * @param texture Texture
     * @param ps Index data
     * @param verticles Vertex data
     * @param uvs UV data
     * @zh 创建纹理网格数据
     * @param texture 纹理
     * @param ps 索引数据
     * @param verticles 顶点数据
     * @param uvs UV数据
     */
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


