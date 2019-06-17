import { Mesh } from "../resource/models/Mesh";
import { SubMesh } from "../resource/models/SubMesh";
/**
 * ...
 * @author ...
 */
export declare class MeshReader {
    constructor();
    static read(data: ArrayBuffer, mesh: Mesh, subMeshes: SubMesh[]): void;
}
