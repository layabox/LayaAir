import { ProgressCallback } from "../../laya/net/BatchProgress";
import { DownloadCompleteCallback } from "../../laya/net/Downloader";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { MgDownloader } from "../minigame/MgDownloader";

export class TbDownloader extends MgDownloader {
    protected downloadFile(url: string, onProgress: ProgressCallback, onComplete: DownloadCompleteCallback): void {
        PAL.global.downloadFile({
            url,
            success: (res: { apFilePath: string }) => {
                if (this.enableCache)
                    this.cacheManager.addFile(url, res.apFilePath);
                onComplete(res.apFilePath);
            },
            fail: (err: any) => onComplete(null, PAL.getErrorMsg(err))
        });
    }
}