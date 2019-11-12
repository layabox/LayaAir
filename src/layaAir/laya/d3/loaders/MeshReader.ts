import { LoadModelV04 } from "./LoadModelV04";
import { LoadModelV05 } from "./LoadModelV05";
import { Mesh } from "../resource/models/Mesh"
import { SubMesh } from "../resource/models/SubMesh"
import { Byte } from "../../utils/Byte"

/**
 * @internal
 */
export class MeshReader {
	static read(data: ArrayBuffer, mesh: Mesh, subMeshes: SubMesh[]): void {
		var readData: Byte = new Byte(data);
		readData.pos = 0;
		var version: string = readData.readUTFString();
		switch (version) {
			case "LAYAMODEL:0301":
			case "LAYAMODEL:0400":
			case "LAYAMODEL:0401":
				LoadModelV04.parse(readData, version, mesh, subMeshes);
				break;
			case "LAYAMODEL:05":
			case "LAYAMODEL:COMPRESSION_05":
			case "LAYAMODEL:0501":
			case "LAYAMODEL:COMPRESSION_0501":
				LoadModelV05.parse(readData, version, mesh, subMeshes);
				break;
			default:
				throw new Error("MeshReader: unknown mesh version.");
		}
		mesh._setSubMeshes(subMeshes);
		if (version != "LAYAMODEL:0501" && version != "LAYAMODEL:COMPRESSION_0501")//compatible
			mesh.calculateBounds();
	}
}

