import { IResourceLoader, ILoadTask, Loader, ILoadURL } from "../../net/Loader";
import { URL } from "../../net/URL";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { AssetDb } from "../../resource/AssetDb";
import { Material } from "../core/material/Material";
import { MaterialParser } from "./MaterialParser";

class MaterialLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(0.3), task.options).then(data => {
            if (!data)
                return null;

            let urls: Array<ILoadURL | string> = MaterialParser.collectLinks(data, URL.getPath(task.url));

            if (data.version === "LAYAMATERIAL:04") {
                let shaderName = data.props.type;
                if (!Shader3D.find(shaderName)) {
                    let url = AssetDb.inst.shaderName_to_URL(shaderName);
                    if (url)
                        urls.push(url);
                    else {
                        let promise = AssetDb.inst.shaderName_to_URL_async(shaderName);
                        if (promise) {
                            return promise.then(url => {
                                if (url)
                                    urls.push(url);
                                return this.load2(task, data, urls);
                            });
                        }
                    }
                }
            }

            return this.load2(task, data, urls);
        });
    }

    private load2(task: ILoadTask, data: any, urls: Array<any>): Promise<any> {
        if (urls.length == 0)
            return Promise.resolve(MaterialParser.parse(data));

        return task.loader.load(urls, task.options, task.progress.createCallback()).then(() => {
            let mat = MaterialParser.parse(data);

            let oldMat: Material;
            if (oldMat = <Material>task.obsoluteInst) {
                oldMat.setShaderName(mat._shader.name);
                oldMat._shaderValues.reset();
                mat._shaderValues.cloneTo(oldMat._shaderValues);
                oldMat.renderQueue = mat.renderQueue;
                mat.destroy();
                mat = oldMat;
                mat.obsolute = false;
            }
            return mat;
        });
    }
}

Loader.registerLoader(["lmat"], MaterialLoader, Loader.MATERIAL);