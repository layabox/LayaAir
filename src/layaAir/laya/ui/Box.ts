import { UIComponent } from "./UIComponent";

/**
 * @en The `Box` class is the base class for UI containers.
 * Other container components will inherit from this class.
 * @zh `Box` 类是 UI 容器的基类。
 * 其他的容器组件都会继承于该类。
 */
export class Box extends UIComponent {

    /**
     * @en The background color.
     * @zh 背景颜色。
     */
    private _bgColor: string;

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

    /**
    * @en background color
    * @zh 容器的背景颜色
    */
    get bgColor(): string {
        return this._bgColor;
    }
    set bgColor(value: string) {
        this._bgColor = value;
        this.graphics.clear();
        this.graphics.drawRect(0, 0, 1, 1, this._bgColor, null, null, true);
    }

}