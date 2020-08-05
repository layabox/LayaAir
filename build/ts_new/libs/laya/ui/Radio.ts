import { Event } from "../events/Event"
import { Button } from "./Button"
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";


/**
 * <code>Radio</code> 控件使用户可在一组互相排斥的选择中做出一种选择。
 * 用户一次只能选择 <code>Radio</code> 组中的一个成员。选择未选中的组成员将取消选择该组中当前所选的 <code>Radio</code> 控件。 
 * @see laya.ui.RadioGroup
 */
export class Radio extends Button {

    /**@private */
    protected _value: any;


    /**
     * 创建一个新的 <code>Radio</code> 类实例。 
     * @param skin 皮肤。
     * @param label 标签。
     */
    constructor(skin: string = null, label: string = "") {
        super(skin, label);
        // preinitialize 放到这里了，因为不知道什么时候调用
        this.toggle = false;
        this._autoSize = false;
    }

		/**
		 * @inheritDoc 
		 * @override
		 * */
		/*override*/  destroy(destroyChild: boolean = true): void {
        super.destroy(destroyChild);
        this._value = null;
    }
    /**
     * @override
     */
    protected preinitialize(): void {
        super.preinitialize();
        this.toggle = false;
        this._autoSize = false;
    }

    /**
     * @inheritDoc 
     * @override
     * */
    protected initialize(): void {
        super.initialize();
        this.createText();
        this._text.align = "left";
        this._text.valign = "top";
        this._text.width = 0;
        this.on(Event.CLICK, this, this.onClick);
    }

    /**
     * @private
     * 对象的<code>Event.CLICK</code>事件侦听处理函数。 
     */
    protected onClick(e: Event): void {
        this.selected = true;
    }


    /**
     * 获取或设置 <code>Radio</code> 关联的可选用户定义值。
     */
    get value(): any {
        return this._value != null ? this._value : this.label;
    }

    set value(obj: any) {
        this._value = obj;
    }
}


ILaya.regClass(Radio);
ClassUtils.regClass("laya.ui.Radio", Radio);
ClassUtils.regClass("Laya.Radio", Radio);