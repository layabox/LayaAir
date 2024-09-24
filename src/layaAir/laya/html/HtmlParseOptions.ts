import { ClassUtils } from "../utils/ClassUtils";

/**
 * @en The `HtmlParseOptions` class defines a set of options used for parsing HTML content.
 * @zh `HtmlParseOptions` 类定义了一组用于解析 HTML 内容的选项。
 */
export class HtmlParseOptions {
    /**
     * @en Indicates whether links should be displayed with an underline.
     * @zh 指示链接是否应该显示下划线。
     */
    public linkUnderline: boolean;
    /**
     * @en The default color for links.
     * @zh 链接的默认颜色。
     */
    public linkColor: string;
    /**
     * @en Indicates whether to ignore white spaces in the HTML content.
     * @zh 指示是否忽略 HTML 内容中的空白。
     */
    public ignoreWhiteSpace: boolean;

    /**
     * @en The default value for the `linkUnderline` option.
     * @zh `linkUnderline` 选项的默认值。
     */
    public static defaultLinkUnderline: boolean = true;
    /**
     * @en The default value for the `linkColor` option.
     * @zh `linkColor` 选项的默认值。
     */
    public static defaultLinkColor: string = null;

    /**
     * @ignore
     * @en Creates a new instance of the `HtmlParseOptions` class.
     * @zh 创建 HtmlParseOptions 类的新实例。
     */
    public constructor() {
        this.linkUnderline = HtmlParseOptions.defaultLinkUnderline;
        this.linkColor = HtmlParseOptions.defaultLinkColor;
    }
}

ClassUtils.regClass("HtmlParseOptions", HtmlParseOptions);