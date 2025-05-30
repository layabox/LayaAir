import { ILaya } from "../../ILaya";
import { ILoadTask } from "../net/Loader";
import { URL } from "../net/URL";
import { Browser } from "../utils/Browser";
import { Utils } from "../utils/Utils";
import { PAL } from "./PlatformAdapters";

/**
 * @ignore
 */
export class FontAdapter {

    loadFont(task: ILoadTask): Promise<{ family: string } | null> {
        let fontName = Utils.replaceFileExtension(Utils.getBaseName(task.url), "");
        let url = URL.postFormatURL(URL.formatURL(task.url));
        if (Browser.window.FontFace)
            return this.loadByFontFace(task, url, fontName);
        else
            return this.loadByCSS(task, url, fontName);
    }

    protected loadByFontFace(task: ILoadTask, url: string, fontName: string): Promise<{ family: string } | null> {
        let fontFace: any = new Browser.window.FontFace(fontName, "url('" + url + "')");
        (Browser.document.fonts as any).add(fontFace);
        return fontFace.load().then(() => {
            return fontFace;
        });
    }

    protected loadByCSS(task: ILoadTask, url: string, fontName: string): Promise<{ family: string } | null> {
        let fontTxt = "40px " + fontName;
        Browser.context.font = fontTxt;
        let oldWidth = Browser.context.measureText(testString).width;

        let fontStyle = Browser.createElement("style");
        fontStyle.type = "text/css";
        Browser.document.body.appendChild(fontStyle);
        fontStyle.textContent = "@font-face { font-family:'" + fontName + "'; src:url('" + url + "');}";

        return new Promise((resolve) => {
            let checkComplete = () => {
                Browser.context.font = fontTxt;
                let newWidth = Browser.context.measureText(testString).width;
                if (newWidth != oldWidth)
                    complete();
            };
            let complete = () => {
                ILaya.systemTimer.clear(this, checkComplete);
                ILaya.systemTimer.clear(this, complete);

                resolve({ family: fontName });
            };

            ILaya.systemTimer.once(10000, this, complete);
            ILaya.systemTimer.loop(20, this, checkComplete);
        });
    }
}

const testString = "LayaTTFFont";

PAL.register("font", FontAdapter);