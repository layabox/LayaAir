import { GTextField } from "./GTextField";
import { GTextInput } from "./GTextInput";
import { GWidget } from "./GWidget";
import { WidgetRef } from "./WidgetRef";

/**
 * @en GLabel is a widget that displays a text label and an icon.
 * @zh GLabel 是一个显示文本标签和图标的小部件。
 * @blueprintInheritable
 */
export class GLabel extends GWidget {
    protected _titleWidget: WidgetRef;
    protected _iconWidget: WidgetRef;

    /**
     * @en Title of the label.
     * @zh 标签的标题。
     */
    get title(): string {
        if (this._titleWidget)
            return this._titleWidget.p.text;
        else
            return "";
    }

    set title(value: string) {
        if (this._titleWidget)
            this._titleWidget.p.text = value;
    }

    /** @ignore */
    get text(): string {
        return this.title;
    }

    set text(value: string) {
        this.title = value;
    }

    /**
     * @en Icon of the label.
     * @zh 标签的图标。
     */
    get icon(): string {
        if (this._iconWidget)
            return this._iconWidget.p.icon;
        else
            return "";
    }

    set icon(value: string) {
        if (this._iconWidget)
            this._iconWidget.p.icon = value;
    }

    /**
     * @en Color of the title text.
     * @zh 标题文本的颜色。
     */
    get titleColor(): string {
        let tf = this.findTextWidget();
        if (tf)
            return tf.color;
        else
            return "#000000";
    }

    set titleColor(value: string) {
        let tf = this.findTextWidget();
        if (tf)
            tf.color = value;
    }

    /**
     * @en Font size of the title text.
     * @zh 标题文本的字体大小。
     */
    get titleFontSize(): number {
        let tf = this.findTextWidget();
        if (tf)
            return tf.fontSize;
        else
            return 0;
    }

    set titleFontSize(value: number) {
        let tf = this.findTextWidget();
        if (tf)
            tf.fontSize = value;
    }

    /**
     * @en The widget that displays the title text.
     * @zh 显示标题文本的小部件。
     */
    get titleWidget(): GWidget {
        return this._titleWidget?.p || null;
    }

    set titleWidget(val: GWidget) {
        this._titleWidget = WidgetRef.create(this._titleWidget, val, () => this._onPartChanged("title"));
        this._onPartChanged("title");
    }

    /**
     * @en The widget that displays the icon.
     * @zh 显示图标的小部件。
     */
    get iconWidget(): GWidget {
        return this._iconWidget?.p || null;
    }

    set iconWidget(val: GWidget) {
        this._iconWidget = WidgetRef.create(this._iconWidget, val, () => this._onPartChanged("icon"));
        this._onPartChanged("icon");
    }

    protected _onPartChanged(which: string) {
    }

    /**
     * @en Finds the first text widget in the label hierarchy.
     * @return The first text widget found, or null if none exists.
     * @zh 在标签层次结构中查找第一个文本小部件。
     * @returns 找到的第一个文本小部件，如果不存在则返回 null。
     */
    findTextWidget<T extends GTextField | GTextInput>(): T | null {
        let p = this._titleWidget;
        while (p) {
            let pp = p.p;
            if ((pp instanceof GTextField) || (pp instanceof GTextInput))
                return <T>pp;

            if (pp instanceof GLabel)
                p = pp._titleWidget;
            else
                break;
        }

        return null;
    }
}