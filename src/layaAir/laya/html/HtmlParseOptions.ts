import { ClassUtils } from "../utils/ClassUtils";

export class HtmlParseOptions {
    public linkUnderline: boolean;
    public linkColor: string;
    public ignoreWhiteSpace: boolean;

    public static defaultLinkUnderline: boolean = true;
    public static defaultLinkColor: string = "#3A67CC";

    public constructor() {
        this.linkUnderline = HtmlParseOptions.defaultLinkUnderline;
        this.linkColor = HtmlParseOptions.defaultLinkColor;
    }
}

ClassUtils.regClass("HtmlParseOptions", HtmlParseOptions);