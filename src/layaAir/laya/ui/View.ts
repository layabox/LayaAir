import { Scene } from "../display/Scene"
import { Event } from "../events/Event"
import { UIComponent } from "./UIComponent"
import { ILaya } from "../../ILaya";

/**
 * <code>View</code> 是一个视图类，2.0开始，更改继承至Scene类，相对于Scene，增加相对布局功能。
 */
export class View extends Scene {
    /**@private 兼容老版本*/
    static uiMap: any = {};
    /**@internal */
    _watchMap: any = {};
    /**@private 控件的数据源。 */
    protected _dataSource: any;

    constructor() {
        super(false);   // 先不要createChildren 因为 this._widget还没有赋值
        this.createChildren();
    }

    /**
     * @private 兼容老版本
     * 注册UI配置信息，比如注册一个路径为"test/TestPage"的页面，UI内容是IDE生成的json
     * @param	url		UI的路径
     * @param	json	UI内容
     */
    static regUI(url: string, json: any): void {
        ILaya.loader.cacheRes(url, json);
    }

    /** 
     * @inheritDoc 
     * @override
    */
    destroy(destroyChild: boolean = true): void {
        this._watchMap = null;
        super.destroy(destroyChild);
    }

    /**@private */
    changeData(key: string): void {
        var arr: any[] = this._watchMap[key];
        if (!arr) return;
        for (var i: number = 0, n: number = arr.length; i < n; i++) {
            var watcher: any = arr[i];
            watcher.exe(this);
        }
    }

    /**
     * @implements
     * laya.ui.UIComponent#dataSource
     * */
    get dataSource(): any {
        return this._dataSource;
    }

    set dataSource(value: any) {
        this._dataSource = value;
        for (var name in value) {
            var comp: any = this.getChildByName(name);
            if (comp instanceof UIComponent) comp.dataSource = value[name];
            else if (name in this && !((this as any)[name] instanceof Function)) (this as any)[name] = value[name];
        }
    }
}