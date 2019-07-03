import { LoadModelV04 } from "./LoadModelV04";
import { LoadModelV05 } from "./LoadModelV05";
import { Byte } from "../../utils/Byte";
/**
 * ...
 * @author ...
 */
export class MeshReader {
    constructor() {
    }
    static read(data, mesh, subMeshes) {
        var readData = new Byte(data);
        readData.pos = 0;
        var version = readData.readUTFString();
        switch (version) {
            case "LAYAMODEL:0301":
            case "LAYAMODEL:0400":
            case "LAYAMODEL:0401":
                LoadModelV04.parse(readData, version, mesh, subMeshes);
                break;
            case "LAYAMODEL:05":
            case "LAYAMODEL:COMPRESSION_05":
                LoadModelV05.parse(readData, version, mesh, subMeshes);
                break;
            default:
                throw new Error("MeshReader: unknown mesh version.");
        }
        mesh._setSubMeshes(subMeshes);
    }
}
