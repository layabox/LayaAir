import { Widget } from "././Widget";
import { Animation } from "../display/Animation";
import { Scene } from "../display/Scene";
import { Text } from "../display/Text";
import { Event } from "../events/Event";
import { Box } from "./Box";
import { Button } from "./Button";
import { CheckBox } from "./CheckBox";
import { Image } from "./Image";
import { Label } from "./Label";
import { ProgressBar } from "./ProgressBar";
import { Radio } from "./Radio";
import { RadioGroup } from "./RadioGroup";
import { Tab } from "./Tab";
import { UIComponent } from "./UIComponent";
//import { ClassUtils } from "../utils/ClassUtils"
import { ViewStack } from "./ViewStack";
import { TextArea } from "./TextArea";
import { ColorPicker } from "./ColorPicker";
import { ScaleBox } from "./ScaleBox";
import { Clip } from "./Clip";
import { ComboBox } from "./ComboBox";
import { HScrollBar } from "./HScrollBar";
import { HSlider } from "./HSlider";
import { List } from "./List";
import { Panel } from "./Panel";
import { ScrollBar } from "./ScrollBar";
import { Slider } from "./Slider";
import { TextInput } from "./TextInput";
//import { Dialog } from "./Dialog";
import { VScrollBar } from "./VScrollBar";
import { VSlider } from "./VSlider";
import { Tree } from "./Tree";
import { HBox } from "./HBox";
import { VBox } from "./VBox";
import { FontClip } from "./FontClip";
import { ILaya } from "../../ILaya";
/**
 * <code>View</code> 是一个视图类，2.0开始，更改继承至Scene类，相对于Scene，增加相对布局功能。
 */
export class View extends Scene {
    constructor() {
        super();
        /**@private */
        this._watchMap = {};
        /**X锚点，值为0-1，设置anchorX值最终通过pivotX值来改变节点轴心点。*/
        this._anchorX = NaN;
        /**Y锚点，值为0-1，设置anchorY值最终通过pivotY值来改变节点轴心点。*/
        this._anchorY = NaN;
        this._widget = Widget.EMPTY;
    }
    /**
     * @private 兼容老版本
     * 注册组件类映射。
     * <p>用于扩展组件及修改组件对应关系。</p>
     * @param key 组件类的关键字。
     * @param compClass 组件类对象。
     */
    static regComponent(key, compClass) {
        ILaya.ClassUtils.regClass(key, compClass);
    }
    /**
     * @private 兼容老版本
     * 注册UI视图类的逻辑处理类。
     * @internal 注册runtime解析。
     * @param key UI视图类的关键字。
     * @param compClass UI视图类对应的逻辑处理类。
     */
    static regViewRuntime(key, compClass) {
        ILaya.ClassUtils.regClass(key, compClass);
    }
    /**
     * @private 兼容老版本
     * 注册UI配置信息，比如注册一个路径为"test/TestPage"的页面，UI内容是IDE生成的json
     * @param	url		UI的路径
     * @param	json	UI内容
     */
    static regUI(url, json) {
        window.Laya.loader.cacheRes(url, json);
    }
    /** @inheritDoc */
    /*override*/ destroy(destroyChild = true) {
        this._watchMap = null;
        super.destroy(destroyChild);
    }
    /**@private */
    changeData(key) {
        var arr = this._watchMap[key];
        if (!arr)
            return;
        for (var i = 0, n = arr.length; i < n; i++) {
            var watcher = arr[i];
            watcher.exe(this);
        }
    }
    /**
     * <p>从组件顶边到其内容区域顶边之间的垂直距离（以像素为单位）。</p>
     */
    get top() {
        return this._widget.top;
    }
    set top(value) {
        if (value != this._widget.top) {
            this._getWidget().top = value;
        }
    }
    /**
     * <p>从组件底边到其内容区域底边之间的垂直距离（以像素为单位）。</p>
     */
    get bottom() {
        return this._widget.bottom;
    }
    set bottom(value) {
        if (value != this._widget.bottom) {
            this._getWidget().bottom = value;
        }
    }
    /**
     * <p>从组件左边到其内容区域左边之间的水平距离（以像素为单位）。</p>
     */
    get left() {
        return this._widget.left;
    }
    set left(value) {
        if (value != this._widget.left) {
            this._getWidget().left = value;
        }
    }
    /**
     * <p>从组件右边到其内容区域右边之间的水平距离（以像素为单位）。</p>
     */
    get right() {
        return this._widget.right;
    }
    set right(value) {
        if (value != this._widget.right) {
            this._getWidget().right = value;
        }
    }
    /**
     * <p>在父容器中，此对象的水平方向中轴线与父容器的水平方向中心线的距离（以像素为单位）。</p>
     */
    get centerX() {
        return this._widget.centerX;
    }
    set centerX(value) {
        if (value != this._widget.centerX) {
            this._getWidget().centerX = value;
        }
    }
    /**
     * <p>在父容器中，此对象的垂直方向中轴线与父容器的垂直方向中心线的距离（以像素为单位）。</p>
     */
    get centerY() {
        return this._widget.centerY;
    }
    set centerY(value) {
        if (value != this._widget.centerY) {
            this._getWidget().centerY = value;
        }
    }
    /**X锚点，值为0-1，设置anchorX值最终通过pivotX值来改变节点轴心点。*/
    get anchorX() {
        return this._anchorX;
    }
    set anchorX(value) {
        if (this._anchorX != value) {
            this._anchorX = value;
            this.callLater(this._sizeChanged);
        }
    }
    /**Y锚点，值为0-1，设置anchorY值最终通过pivotY值来改变节点轴心点。*/
    get anchorY() {
        return this._anchorY;
    }
    set anchorY(value) {
        if (this._anchorY != value) {
            this._anchorY = value;
            this.callLater(this._sizeChanged);
        }
    }
    /**@private */
    /*override*/ _sizeChanged() {
        if (!isNaN(this._anchorX))
            this.pivotX = this.anchorX * this.width;
        if (!isNaN(this._anchorY))
            this.pivotY = this.anchorY * this.height;
        this.event(Event.RESIZE);
    }
    /**
     * @private
     * <p>获取对象的布局样式。请不要直接修改此对象</p>
     */
    _getWidget() {
        this._widget === Widget.EMPTY && (this._widget = this.addComponent(Widget));
        return this._widget;
    }
    /**@private 兼容老版本*/
    loadUI(path) {
        var uiView = View.uiMap[path];
        View.uiMap && this.createView(uiView);
    }
    /**@see  laya.ui.UIComponent#dataSource*/
    get dataSource() {
        return this._dataSource;
    }
    set dataSource(value) {
        this._dataSource = value;
        for (var name in value) {
            var comp = this.getChildByName(name);
            if (comp instanceof UIComponent)
                comp.dataSource = value[name];
            else if (name in this && !(this[name] instanceof Function))
                this[name] = value[name];
        }
    }
}
/**@private 兼容老版本*/
View.uiMap = {};
ILaya.regClass(View);
ILaya.ClassUtils.regShortClassName([ViewStack, Button, TextArea, ColorPicker, Box, ScaleBox, CheckBox, Clip, ComboBox, UIComponent,
    HScrollBar, HSlider, Image, Label, List, Panel, ProgressBar, Radio, RadioGroup, ScrollBar, Slider, Tab, TextInput, View,
    VScrollBar, VSlider, Tree, HBox, VBox, Animation, Text, FontClip]);
//dialog 依赖于view，放到这里的话，谁在前都会报错，所以不能放到这里了
