import * as glTF from "./glTFInterface";
import { IResourceLoader, ILoadTask, Loader } from "../net/Loader";
import { glTFResource } from "./glTFResource";
import { Byte } from "../utils/Byte";

class glTFLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(0.5), task.options).then((data: glTF.glTF) => {
            if (!data.asset || data.asset.version !== "2.0") {
                console.warn("glTF version wrong!");
                return null;
            }

            let glTF = new glTFResource();
            return glTF._parse(data, task.url, task.progress).then(() => glTF);
        });
    }
}

Loader.registerLoader(["gltf"], glTFLoader);

class glbLoader implements IResourceLoader {
    load(task: ILoadTask): Promise<any> {
        return task.loader.fetch(task.url, "arraybuffer", task.progress.createCallback(0.5), task.options).then((data: ArrayBuffer) => {
            let byte = new Byte(data);
            let magic = byte.readUint32();

            //  ASCII string glTF
            if (magic != 0x46546C67) {
                console.warn("glb fromat wrong!");
                return null;
            }

            let version = byte.readUint32();
            if (version != 2) {
                console.warn("glb version wrong!");
                return null;
            }

            // total length of the Binary glTF, including header and all chunks, in bytes.
            let length = byte.readUint32();
            /**
             * first chunk: json 
             * second chunk: buffer
             * other chunk: ignore
             */
            let firstChunkLength = byte.readUint32();
            let firstChunkType = byte.readUint32();
            if (firstChunkType != 0x4E4F534A) {
                console.warn("glb json chunk data wrong!");
                return null;
            }

            let firstChunkData = byte.readArrayBuffer(firstChunkLength);
            let texDecoder = new TextDecoder();
            let jsonStr = texDecoder.decode(firstChunkData);
            let glTFObj: glTF.glTF = JSON.parse(jsonStr);
            let binData: ArrayBuffer;

            let chunkLength = byte.readUint32();
            let chunkType = byte.readUint32();
            if (chunkType != 0x004E4942) {
                console.warn("glb bin chunk data wrong!");
                return null;
            }

            let firstBuffer = glTFObj.buffers?.[0];
            firstBuffer.byteLength = firstBuffer.byteLength ? (Math.min(firstBuffer.byteLength, chunkLength)) : chunkLength;
            binData = byte.readArrayBuffer(firstBuffer.byteLength);

            let glTF = new glTFResource();
            return glTF._parseglb(glTFObj, binData, task.url, task.progress).then(() => glTF);
        });
    }
}

Loader.registerLoader(["glb"], glbLoader);