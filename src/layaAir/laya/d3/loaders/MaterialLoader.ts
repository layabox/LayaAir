import { IResourceLoader, ILoadTask, Loader } from "../../net/Loader";
import { URL } from "../../net/URL";
import { Material } from "../core/material/Material";

class MaterialLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(0.3), task.options).then(lmtData => {
            if (!lmtData)
                return null;

            let urls: Array<any> = this.getSubUrls(task, lmtData);
            return Promise.all(urls.map((e, i) => task.loader.load(e.url, { constructParams: e.constructParams, propertyParams: e.propertyParams }, task.progress.createCallback()))).then(() => {
                let mat = Material._parse(lmtData);
                return mat;
            });
        });
    }

    protected getSubUrls(item: ILoadTask, lmatData: any) {
        let basePath = URL.getPath(item.url);
        let urls: any[] = [];
        let version: string = lmatData.version;
        switch (version) {
            case "LAYAMATERIAL:01":
            case "LAYAMATERIAL:02":
            case "LAYAMATERIAL:03":
                let i: number, n: number;
                let textures: any[] = lmatData.props.textures;
                if (textures) {
                    for (i = 0, n = textures.length; i < n; i++) {
                        let tex2D: any = textures[i];
                        let tex2DPath: string = tex2D.path;
                        if (tex2DPath) {
                            tex2D.path = URL.join(basePath, tex2DPath);
                            urls.push({ url: tex2D.path, constructParams: tex2D.constructParams, propertyParams: tex2D.propertyParams });
                        }
                    }
                }
                break;
            default:
                throw new Error("Laya3D:unkonwn version.");
        }

        return urls;
    }
}

Loader.registerLoader([Loader.MATERIAL, "lmat"], MaterialLoader);