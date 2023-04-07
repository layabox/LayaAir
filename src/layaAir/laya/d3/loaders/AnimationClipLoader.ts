import { IResourceLoader, ILoadTask, Loader } from "../../net/Loader";
import { AssetDb } from "../../resource/AssetDb";
import { AnimationClip } from "../animation/AnimationClip";

class AnimationClipLoader implements IResourceLoader {
    load(task: ILoadTask) {
        let url = AssetDb.inst.getSubAssetURL(task.url, task.uuid, null, "lani");
        return task.loader.fetch(url, "arraybuffer", task.progress.createCallback(), task.options).then(data => {
            if (!data) {
                return null;
            }
            return AnimationClip._parse(data);
        });
    }
}

Loader.registerLoader(["lani"], AnimationClipLoader, Loader.ANIMATIONCLIP);