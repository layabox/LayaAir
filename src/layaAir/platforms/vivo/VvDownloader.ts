import { ProgressCallback } from "../../laya/net/BatchProgress";
import { DownloadCompleteCallback } from "../../laya/net/Downloader";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { MgDownloader } from "../minigame/MgDownloader";

export class VvDownloader extends MgDownloader {
    protected downloadFile(url: string, onProgress: ProgressCallback, onComplete: DownloadCompleteCallback): void {
        let task = PAL.global.download({
            url,
            success: (res: any) => {
                if (res.statusCode === 200) {
                    if (this.enableCache)
                        this.cacheManager.addFile(url, res.tempFilePath);
                    onComplete(res.tempFilePath);
                }
                else {
                    onComplete(null, PAL.getErrorMsg(res));
                }
            },
            fail: (res: any) => onComplete(null, PAL.getErrorMsg(res))
        });
        if (onProgress) {
            task.onProgressUpdate((res: any) => {
                onProgress(res.progress);
            });
        }
    }
}