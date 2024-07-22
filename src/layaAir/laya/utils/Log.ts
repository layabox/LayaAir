import { Browser } from "./Browser";

/**
 * @en The `Log` class is used to display log information in the interface.
 * Note: This cannot be used in the LayaAir Native Runtime.
 * @zh `Log` 类用于在界面内显示日志记录信息。
 * 注意：在LayaAir Native Runtime内不可使用
 */
export class Log {

    /**@private */
    private static _logdiv: any;
    /**@private */
    private static _btn: any;
    /**@private */
    private static _count: number = 0;
    /**
     * @en Maximum number of log messages to display before auto-cleaning.
     * @zh 最大打印数量，超过这个数量则自动清理一次，默认为50次。
     */
    static maxCount: number = 50;
    /**
     * @en Whether to automatically scroll to the bottom of the log.
     * @zh 是否自动滚动到日志底部，默认为true。
     */
    static autoScrollToBottom: boolean = true;

    /**
     * @en Enables the Log system.
     * @zh 启用Log系统
     */
    static enable(): void {
        if (!Log._logdiv) {
            Log._logdiv = Browser.createElement('div');
            Log._logdiv.style.cssText = "border:white;padding:4px;overflow-y:auto;z-index:1000000;background:rgba(100,100,100,0.6);color:white;position: absolute;left:0px;top:0px;width:50%;height:50%;";
            Browser.document.body.appendChild(Log._logdiv);

            Log._btn = Browser.createElement("button");
            Log._btn.innerText = "Hide";
            Log._btn.style.cssText = "z-index:1000001;position: absolute;left:10px;top:10px;";
            Log._btn.onclick = Log.toggle;
            Browser.document.body.appendChild(Log._btn);
        }
    }

    /**
     * @en Hides or shows the log panel.
     * @zh 隐藏或显示日志面板。
     */
    static toggle(): void {
        var style: any = Log._logdiv.style;
        if (style.display === "") {
            Log._btn.innerText = "Show";
            style.display = "none";
        } else {
            Log._btn.innerText = "Hide";
            style.display = "";
        }
    }

    /**
     * @en Adds log content.
     * @param value The log content to add.
     * @zh 增加日志内容。
     * @param value 需要增加的日志内容。
     */
    static print(value: string): void {
        if (Log._logdiv) {
            //内容太多清理掉
            if (Log._count >= Log.maxCount) Log.clear();
            Log._count++;

            Log._logdiv.innerText += value + "\n";
            //自动滚动
            if (Log.autoScrollToBottom) {
                if (Log._logdiv.scrollHeight - Log._logdiv.scrollTop - Log._logdiv.clientHeight < 50) {
                    Log._logdiv.scrollTop = Log._logdiv.scrollHeight;
                }
            }
        }
    }

    /**
     * @en Clears the log.
     * @zh 清理日志。
     */
    static clear(): void {
        Log._logdiv.innerText = "";
        Log._count = 0;
    }
}

