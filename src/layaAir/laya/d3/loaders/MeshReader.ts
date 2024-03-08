import { Byte } from "../../utils/Byte";
import { Mesh } from "../resource/models/Mesh";
import { SubMesh } from "../resource/models/SubMesh";
import { LoadModelV04 } from "./LoadModelV04";
import { LoadModelV05 } from "./LoadModelV05";

/**
 * @internal
 */
export class MeshReader {
	/**
	 */
	static _parse(data: ArrayBuffer): Mesh {
		var mesh: Mesh = new Mesh();
		MeshReader.read(data, mesh, mesh._subMeshes);
		return mesh;
	}

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
			case "LAYAMODEL:0502":
				LoadModelV05.parse(readData, version, mesh, subMeshes);
				break;
			default:
				throw new Error("unknown mesh version: " + version);
		}
		mesh._setSubMeshes(subMeshes);
		if (version != "LAYAMODEL:0501" && version != "LAYAMODEL:COMPRESSION_0501" && version != "LAYAMODEL:0502")//compatible
			mesh.calculateBounds();
	}
}

