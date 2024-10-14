import { IResourceLoader, ILoadTask, ILoadURL, Loader, ILoadOptions } from "../net/Loader";
import { URL } from "../net/URL";
import { Shader3D } from "../RenderEngine/RenderShader/Shader3D";
import { AssetDb } from "../resource/AssetDb";
import { Material } from "../resource/Material";
import { MaterialParser } from "./MaterialParser";

export class MaterialLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(0.3), task.options).then(data => {
            if (!data)
                return null;

            let basePath = URL.getPath(task.url);
            let urls: Array<ILoadURL | string> = MaterialParser.collectLinks(data, basePath);

            if (data.version === "LAYAMATERIAL:04") {
                let shaderName = data.props.type;
                if (!Shader3D.find(shaderName)) {
                    let url = AssetDb.inst.shaderName_to_URL(shaderName);
                    if (url)
                        urls.push(url);
                    else {
                        return AssetDb.inst.shaderName_to_URL_async(shaderName).then(url => {
                            if (url)
                                urls.push(url);
                            else if (data.props.shaderPath)
                                urls.push(URL.join(basePath, data.props.shaderPath));
                            else
                                Loader.warn(`unknown shaderName: ${shaderName}`);
                            return this.load2(task, data, urls);
                        });
                    }
                }
            }

            return this.load2(task, data, urls);
        });
    }

    private load2(task: ILoadTask, data: any, urls: Array<any>): Promise<any> {
        if (urls.length == 0) {
            let mat = MaterialParser.parse(data);
            let obsoluteInst = <Material>task.obsoluteInst;
            if (obsoluteInst)
                mat = this.move(obsoluteInst, mat);
            return Promise.resolve(mat);
        }

        let options: ILoadOptions = Object.assign({}, task.options);
        options.initiator = task;
        delete options.cache;
        delete options.ignoreCache;
        return task.loader.load(urls, options, task.progress.createCallback()).then(() => {
            let mat = MaterialParser.parse(data);

            let obsoluteInst = <Material>task.obsoluteInst;
            if (task.obsoluteInst)
                mat = this.move(obsoluteInst, mat);
            return mat;
        });
    }

    private move(obsoluteInst: Material, mat: Material) {
        obsoluteInst._shaderValues.reset();
        obsoluteInst.setShaderName(mat._shader.name);
        mat._shaderValues.cloneTo(obsoluteInst._shaderValues);
        obsoluteInst.materialRenderMode = mat.materialRenderMode;
        obsoluteInst.renderQueue = mat.renderQueue;
        obsoluteInst.obsolute = false;
        mat.destroy();
        return obsoluteInst;
    }
}

Loader.registerLoader(["lmat"], MaterialLoader, Loader.MATERIAL, true);