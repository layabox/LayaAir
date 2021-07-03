import { Loader } from "./Loader";
import { URL } from "./URL";
import { Handler } from "../utils/Handler"
import { ILaya } from "../../ILaya";

/**
 * <p>资源版本的生成由layacmd或IDE完成，使用 <code>ResourceVersion</code> 简化使用过程。</p>
 * <p>调用 <code>enable</code> 启用资源版本管理。</p>
 */
export class ResourceVersion {
    /**基于文件夹的资源管理方式（老版本IDE默认类型）*/
    static FOLDER_VERSION: number = 1;
    /**基于文件名映射管理方式（新版本IDE默认类型）*/
    static FILENAME_VERSION: number = 2;
    /**版本清单*/
    static manifest: any;
    /**当前使用的版本管理类型*/
    static type: number = ResourceVersion.FOLDER_VERSION;

    /**
     * <p>启用资源版本管理。</p>
     * <p>由于只有发布版本需要资源管理。因此没有资源管理文件时，可以设置manifestFile为null或者不存在的路径。</p>
     * @param	manifestFile	清单（json）文件的路径。
     * @param   callback		清单（json）文件加载完成后执行。
     * @param   type			FOLDER_VERSION为基于文件夹管理方式（老版本IDE默认类型），FILENAME_VERSION为基于文件名映射管理（新版本IDE默认类型
     */
    static enable(manifestFile: string, callback: Handler, type: number = 2): void {
        ResourceVersion.type = type;
        ILaya.loader.load(manifestFile, Handler.create(null, ResourceVersion.onManifestLoaded, [callback]), null, Loader.JSON);
    }

    private static onManifestLoaded(callback: Handler, data: any): void {
        ResourceVersion.manifest = data;
        URL.customFormat = ResourceVersion.addVersionPrefix;
        callback.run();
        if (!data) {
            console.warn("资源版本清单文件不存在，不使用资源版本管理。忽略ERR_FILE_NOT_FOUND错误。");
        }
    }

    /**
     * 为加载路径添加版本前缀。
     * @param	originURL	源路径。
     * @return 格式化后的新路径。
     */
    static addVersionPrefix(originURL: string): string {
        if (ResourceVersion.manifest && ResourceVersion.manifest[originURL]) {
            if (ResourceVersion.type == ResourceVersion.FILENAME_VERSION) return ResourceVersion.manifest[originURL];
            return ResourceVersion.manifest[originURL] + "/" + originURL;
        }

        return originURL;
    }
}

