import { UIComponent } from "./UIComponent";

/**
 * <code>Box</code> 类是一个控件容器类。
 */
export class Box extends UIComponent {
    private _bgColor: string;

    /**
     * @inheritDoc 
     * @override
     */
    set_dataSource(value: any) {
        this._dataSource = value;
        for (let name in value) {
            let comp = (<UIComponent>this.getChildByName(name));
            if (comp)
                comp.dataSource = value[name];
            else if (name in this && !((this as any)[name] instanceof Function))
                (this as any)[name] = value[name];
        }
    }

    /**背景颜色*/
    get bgColor(): string {
        return this._bgColor;
    }

    set bgColor(value: string) {
        this._bgColor = value;
        this.graphics.clear();
        this.graphics.drawRect(0, 0, 1, 1, this._bgColor, null, null, true);
    }
}