import { ILaya } from "../../ILaya";
import { ILoadTask } from "../net/Loader";
import { URL } from "../net/URL";
import { Browser } from "../utils/Browser";
import { ClassUtils } from "../utils/ClassUtils";
import { Utils } from "../utils/Utils";

/**
 * @ignore
 */
export class FontAdapter {
    constructor() {
    }

    loadFont(task: ILoadTask): Promise<{ family: string } | null> {
        let fontName = Utils.replaceFileExtension(Utils.getBaseName(task.url), "");
        let url = URL.postFormatURL(URL.formatURL(task.url));
        if (window.FontFace)
            return this.loadByFontFace(task, url, fontName);
        else
            return this.loadByCSS(task, url, fontName);
    }

    protected loadByFontFace(task: ILoadTask, url: string, fontName: string): Promise<{ family: string } | null> {
        let fontFace: any = new window.FontFace(fontName, "url('" + url + "')");
        (window.document.fonts as any).add(fontFace);
        return fontFace.load().then(() => {
            return fontFace;
        });
    }

    protected loadByCSS(task: ILoadTask, url: string, fontName: string): Promise<{ family: string } | null> {
        let fontTxt = "40px " + fontName;
        let txtWidth = this.measureText(testString, fontTxt).width;

        let fontStyle = Browser.createElement("style");
        fontStyle.type = "text/css";
        document.body.appendChild(fontStyle);
        fontStyle.textContent = "@font-face { font-family:'" + fontName + "'; src:url('" + url + "');}";

        return new Promise((resolve) => {
            let checkComplete = () => {
                if (this.measureText(testString, fontTxt).width != txtWidth)
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

    protected measureText(txt: string, font: string): TextMetrics {
        let isChinese: boolean = hanzi.test(txt);
        if (isChinese && fontMap[font])
            return fontMap[font];

        Browser.context.font = font;
        let r = Browser.context.measureText(txt);
        if (isChinese)
            fontMap[font] = r;
        return r;
    }
}

const testString = "LayaTTFFont";
const hanzi: RegExp = new RegExp("^[\u4E00-\u9FA5]$");
const fontMap: { [key: string]: TextMetrics } = {};

ClassUtils.regClass("PAL.Font", FontAdapter);