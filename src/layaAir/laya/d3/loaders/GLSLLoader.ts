import { ILoadTask, IResourceLoader, Loader } from "../../net/Loader";
import { ShaderCompile } from "../../webgl/utils/ShaderCompile";

/**
 * @ignore
 * @en Used for loading GLSL shader code(.glsl,.vs,.fs).
 * @zh 用于加载着色器代码(.glsl,.vs,.fs)。
 */
class GLSLLoader implements IResourceLoader {
    /**
     * @ignore
     * @en Load GLSL shader code from the given task.
     * @param task The load task.
     * @returns A Promise, when loaded successfully, it is resolves with the loaded shader code or null if loading fails.
     * @zh 从给定的任务加载 GLSL 着色器代码。
     * @param task 加载任务。
     * @returns 一个Promise，当加载成功时解析为加载的着色器代码，加载失败时为 null。
     */
    load(task: ILoadTask) {
        let url = task.url;
        return task.loader.fetch(url, "text", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;

            return ShaderCompile.addInclude(task.url, data, true);
        });
    }
}

Loader.registerLoader(["glsl", "vs", "fs"], GLSLLoader);