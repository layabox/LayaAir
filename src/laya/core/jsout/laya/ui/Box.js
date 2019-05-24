import { UIComponent } from "./UIComponent";
import { Event } from "../events/Event";
/**
 * <code>Box</code> 类是一个控件容器类。
 */
export class Box extends UIComponent {
    /**@inheritDoc */
    /*override*/ set dataSource(value) {
        this._dataSource = value;
        for (var name in value) {
            var comp = this.getChildByName(name);
            if (comp)
                comp.dataSource = value[name];
            else if (this.hasOwnProperty(name) && !(this[name] instanceof Function))
                this[name] = value[name];
        }
    }
    /**背景颜色*/
    get bgColor() {
        return this._bgColor;
    }
    set bgColor(value) {
        this._bgColor = value;
        if (value) {
            this._onResize(null);
            this.on(Event.RESIZE, this, this._onResize);
        }
        else {
            this.graphics.clear();
            this.off(Event.RESIZE, this, this._onResize);
        }
    }
    _onResize(e) {
        this.graphics.clear();
        this.graphics.drawRect(0, 0, this.width, this.height, this._bgColor);
    }
}
