import { Scene } from "../display/Scene"
import { UIComponent } from "./UIComponent"
import { ILaya } from "../../ILaya";

/**
 * <code>View</code> 是一个视图类
 * 在2.0里，View继承自Scene类，但这是不合理的，Scene是一个2D+3D的大概念。所以在3.0里请忽略这个继承。
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

        //3.0里View并不是Scene
        this._scene = null;

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


    /**@private */
    changeData(key: string): void {
        let arr: any[] = this._watchMap[key];
        if (!arr) return;
        for (let i = 0, n = arr.length; i < n; i++) {
            let watcher: any = arr[i];
            watcher.exe(this);
        }
    }

    set_dataSource(value: any) {
        this._dataSource = value;
        for (let name in value) {
            let comp = this.getChildByName(name);
            if (comp instanceof UIComponent)
                comp.dataSource = value[name];
            else if (name in this && !((this as any)[name] instanceof Function))
                (this as any)[name] = value[name];
        }
    }
}