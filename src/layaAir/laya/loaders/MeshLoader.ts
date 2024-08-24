import { IResourceLoader, ILoadTask, Loader } from "../net/Loader";
import { AssetDb } from "../resource/AssetDb";
import { Mesh2D } from "../resource/Mesh2D";
import { Resource } from "../resource/Resource";
import { Byte } from "../utils/Byte";
import { LoadModel2DV01 } from "./LoadModel2DV01";


export interface IMeshReaderAPI {
    /**解析 */
    parse(readData:Byte, version:string):Resource;
}

export class MeshLoader implements IResourceLoader {
    static v3d: IMeshReaderAPI;
    static v2d: IMeshReaderAPI;

    load(task: ILoadTask) {
        let url = AssetDb.inst.getSubAssetURL(task.url, task.uuid, null, "lm");
        return task.loader.fetch(url, "arraybuffer", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;
            return this._parse(task , data);
        });
    }

    _parse( task:ILoadTask , data:ArrayBuffer) : Resource{
        var readData: Byte = new Byte(data);
		readData.pos = 0;
		var version: string = readData.readUTFString();
        if (!version || !version.startsWith("LAYAMODEL")) {
            console.warn(`Unknow version:${version} ! Model : ${task.url}`);
            return null
        }

        let is2D = version.startsWith("LAYAMODEL2D");

        if (!is2D) {
            if(!MeshLoader.v3d){
                console.warn(`Loading ${task.url} , you need load the laya.d3 lib!`);
                return null;
            }

            return MeshLoader.v3d.parse(readData , version);
        }else{
            return MeshLoader.v2d.parse(readData , version);
        }
    }
}

export class Mesh2DReader{
    static parse(readData:Byte, version:string): Mesh2D {
		var mesh: Mesh2D = new Mesh2D();
		let subMeshes = mesh._subMeshes;
		switch (version) {
			case "LAYAMODEL2D:01":
				LoadModel2DV01.parse(readData, version, mesh, subMeshes);
				break;
			default:
				throw new Error("unknown mesh version: " + version);
		}
		mesh._setSubMeshes(subMeshes);
		return mesh;
	}
}
MeshLoader.v2d = Mesh2DReader;

Loader.registerLoader(["lm"], MeshLoader, Loader.MESH);