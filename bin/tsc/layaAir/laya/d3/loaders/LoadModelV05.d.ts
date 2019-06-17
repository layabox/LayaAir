import { Mesh } from "../resource/models/Mesh";
import { SubMesh } from "../resource/models/SubMesh";
import { Byte } from "../../utils/Byte";
/**
 * @private
 * <code>LoadModelV05</code> 类用于模型加载。
 */
export declare class LoadModelV05 {
    /**@private */
    private static _BLOCK;
    /**@private */
    private static _DATA;
    /**@private */
    private static _strings;
    /**@private */
    private static _readData;
    /**@private */
    private static _version;
    /**@private */
    private static _mesh;
    /**@private */
    private static _subMeshes;
    /**@private */
    private static _bindPoseIndices;
    /**
     * @private
     */
    static parse(readData: Byte, version: string, mesh: Mesh, subMeshes: SubMesh[]): void;
    /**
     * @private
     */
    private static _readString;
    /**
     * @private
     */
    private static READ_DATA;
    /**
     * @private
     */
    private static READ_BLOCK;
    /**
     * @private
     */
    private static READ_STRINGS;
    /**
     * @private
     */
    private static READ_MESH;
    /**
     * @private
     */
    private static READ_SUBMESH;
}
