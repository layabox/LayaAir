import { IResourceLoader, ILoadTask, Loader } from "../net/Loader";
import { AtlasResource } from "../resource/AtlasResource";
import { Texture } from "../resource/Texture";
import { Utils } from "../utils/Utils";

class AtlasLoader implements IResourceLoader {
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "json", task.progress.createCallback(0.2), task.options).then(data => {
            if (!data)
                return null;

            let toloadPics: Array<Promise<Texture>> = [];
            if (data.meta && data.meta.image) {
                let folderPath: string = "";
                let i = task.url.lastIndexOf("/");
                if (i != -1)
                    folderPath = task.url.substring(0, i + 1);

                //如果图集带了版本号，需要将图集中包含的图片也需要追加版本号，以此解决浏览器缓存的问题
                let query: string = "";
                i = task.url.lastIndexOf("?");
                if (i != -1)
                    query = task.url.substring(i);

                //带图片信息的类型
                let pics: Array<string> = data.meta.image.split(",");
                for (let pic of pics)
                    toloadPics.push(task.loader.load(folderPath + pic + query, null, task.progress.createCallback()));
            } else {  //不带图片信息
                toloadPics.push(task.loader.load(Utils.replaceFileExtension(task.url, "png"), null, task.progress.createCallback()));
            }

            return Promise.all(toloadPics).then(pics => {
                let baseUrl = task.options.baseUrl || "";

                let frames: any = data.frames;
                let directory: string = (data.meta && data.meta.prefix != null) ? data.meta.prefix : task.url.substring(0, task.url.lastIndexOf(".")) + "/";
                let subTextures: Array<Texture> = [];

                let scaleRate: number = 1;
                if (data.meta && data.meta.scale && data.meta.scale != 1)
                    scaleRate = parseFloat(data.meta.scale);

                for (let tPic of pics) {
                    if (tPic) {
                        tPic._addReference();
                        tPic.scaleRate = scaleRate;
                    }
                }

                for (let name in frames) {
                    let obj = frames[name];
                    let tPic = pics[obj.frame.idx ? obj.frame.idx : 0];
                    if (!tPic)
                        continue;

                    let url = baseUrl + directory + name;
                    let tTexture = Texture.create(tPic, obj.frame.x, obj.frame.y, obj.frame.w, obj.frame.h, obj.spriteSourceSize.x, obj.spriteSourceSize.y, obj.sourceSize.w, obj.sourceSize.h);
                    tTexture.lock = true;
                    task.loader.cacheRes(url, tTexture);
                    tTexture.url = url;
                    subTextures.push(tTexture);
                }

                return new AtlasResource(directory, pics, subTextures);
            });
        });
    }
}

Loader.registerLoader(["atlas"], AtlasLoader, Loader.ATLAS);