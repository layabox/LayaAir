import { GTextField } from "./GTextField";
import { GTextInput } from "./GTextInput";
import { GWidget } from "./GWidget";
import { WidgetRef } from "./WidgetRef";

export class GLabel extends GWidget {
    protected _titleWidget: WidgetRef;
    protected _iconWidget: WidgetRef;

    public get title(): string {
        if (this._titleWidget)
            return this._titleWidget.p.text;
        else
            return "";
    }

    public set title(value: string) {
        if (this._titleWidget)
            this._titleWidget.p.text = value;
    }

    public get text(): string {
        return this.title;
    }

    public set text(value: string) {
        this.title = value;
    }

    public get icon(): string {
        if (this._iconWidget)
            return this._iconWidget.p.icon;
        else
            return "";
    }

    public set icon(value: string) {
        if (this._iconWidget)
            this._iconWidget.p.icon = value;
    }

    public get titleColor(): string {
        let tf = this.findTextWidget();
        if (tf)
            return tf.color;
        else
            return "#000000";
    }

    public set titleColor(value: string) {
        let tf = this.findTextWidget();
        if (tf)
            tf.color = value;
    }

    public get titleFontSize(): number {
        let tf = this.findTextWidget();
        if (tf)
            return tf.fontSize;
        else
            return 0;
    }

    public set titleFontSize(value: number) {
        let tf = this.findTextWidget();
        if (tf)
            tf.fontSize = value;
    }

    public get titleWidget(): GWidget {
        return this._titleWidget?.p || null;
    }

    public set titleWidget(val: GWidget) {
        this._titleWidget = WidgetRef.create(this._titleWidget, val, () => this._onPartChanged("title"));
        this._onPartChanged("title");
    }

    public get iconWidget(): GWidget {
        return this._iconWidget?.p || null;
    }

    public set iconWidget(val: GWidget) {
        this._iconWidget = WidgetRef.create(this._iconWidget, val, () => this._onPartChanged("icon"));
        this._onPartChanged("icon");
    }

    protected _onPartChanged(which: string) {
    }

    public findTextWidget<T extends GTextField | GTextInput>(): T {
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