import { IResourceLoader, ILoadTask, Loader } from "../../net/Loader";
import { LensFlareData, LensFlareElement } from "../core/render/PostEffect/LensFlares/LensFlareEffect";
import { URL } from "../../net/URL";
import { Color } from "../../maths/Color";
import { Vector2 } from "../../maths/Vector2";

export class LensFlareSettingsLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;
            let ret = new LensFlareData();
            let basePath = URL.getPath(task.url);

            let elements = data.elements;
            if (elements)
                for (let i = elements.length - 1; i >= 0; i--) {
                    let e = elements[i];
                    if (e.texture && (e.texture as any)._$uuid && '' != (e.texture as any)._$uuid) {
                        let url = URL.getResURLByUUID((e.texture as any)._$uuid);
                        if (!url.startsWith("res://"))
                            url = URL.join(basePath, url);
                        task.loader.load(url).then((t) => {
                            e.texture = t;
                        })
                    }
                    if (e.tint) {
                        e.tint = new Color(e.tint.x, e.tint.y, e.tint.z, e.tint.w);
                    }
                    if (e.positionOffset) {
                        e.positionOffset = new Vector2(e.positionOffset.x, e.positionOffset.y);
                    }
                    if (e.scale) {
                        e.scale = new Vector2(e.scale.x, e.scale.y);
                    }
                }

            ret.elements = elements;
            return ret;
        });
    }
}

Loader.registerLoader(["lensflare"], LensFlareSettingsLoader);