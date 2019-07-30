(function (exports, Laya) {
	'use strict';

	/**全局配置*/
	class UIConfig {
	}
	/**是否开启触摸滚动（针对滚动条）*/
	UIConfig.touchScrollEnable = true;
	/**是否开启滑轮滚动（针对滚动条）*/
	UIConfig.mouseWheelEnable = true;
	/**是否显示滚动条按钮*/
	UIConfig.showButtons = true;
	/**弹出框背景颜色*/
	UIConfig.popupBgColor = "#000000";
	/**弹出框背景透明度*/
	UIConfig.popupBgAlpha = 0.5;
	/**模式窗口点击边缘，是否关闭窗口，默认是关闭的*/
	UIConfig.closeDialogOnSide = true;

	/**
	     * <code>Styles</code> 定义了组件常用的样式属性。
	     */
	class Styles {
	}
	/**
	 * 默认九宫格信息。
	 * @see laya.ui.AutoBitmap#sizeGrid
	 */
	Styles.defaultSizeGrid = [4, 4, 4, 4, 0];
	//-----------------Label-----------------
	/**
	 * 标签颜色。
	 */
	Styles.labelColor = "#000000";
	/**
	 * 标签的边距。
	 * <p><b>格式：</b>[上边距，右边距，下边距，左边距]。</p>
	 */
	Styles.labelPadding = [2, 2, 2, 2];
	/**
	 * 标签的边距。
	 * <p><b>格式：</b>[上边距，右边距，下边距，左边距]。</p>
	 */
	Styles.inputLabelPadding = [1, 1, 1, 3];
	//-----------------Button-----------------
	/**
	 * 按钮皮肤的状态数，支持1,2,3三种状态值。
	 */
	Styles.buttonStateNum = 3;
	/**
	 * 按钮标签颜色。
	 * <p><b>格式：</b>[upColor,overColor,downColor,disableColor]。</p>
	 */
	Styles.buttonLabelColors = ["#32556b", "#32cc6b", "#ff0000", "#C0C0C0"];
	//-----------------ComboBox-----------------
	/**
	 * 下拉框项颜色。
	 * <p><b>格式：</b>[overBgColor,overLabelColor,outLabelColor,borderColor,bgColor]。</p>
	 */
	Styles.comboBoxItemColors = ["#5e95b6", "#ffffff", "#000000", "#8fa4b1", "#ffffff"];
	//-----------------ScrollBar-----------------
	/**
	 * 滚动条的最小值。
	 */
	Styles.scrollBarMinNum = 15;
	/**
	 * 长按按钮，等待时间，使其可激活连续滚动。
	 */
	Styles.scrollBarDelayTime = 500;
	//ILaya.regClass(Styles);

	/**
	 * <code>AutoBitmap</code> 类是用于表示位图图像或绘制图形的显示对象。
	 * <p>封装了位置，宽高及九宫格的处理，供UI组件使用。</p>
	 */
	class AutoBitmap extends Laya.Graphics {
	    constructor() {
	        super(...arguments);
	        /**@private 是否自动缓存命令*/
	        this.autoCacheCmd = true;
	        /**@private 宽度*/
	        this._width = 0;
	        /**@private 高度*/
	        this._height = 0;
	        this.uv = null;
	        //override public function clear(recoverCmds:Boolean = true):void {
	        ////重写clear，防止缓存被清理
	        //super.clear(recoverCmds);
	        //_key && WeakObject.I.del(_key);
	        //}
	    }
	    ///**@private */
	    //private var _key:String;
	    /**@inheritDoc
	     * @override
	    */
	    destroy() {
	        super.destroy();
	        this._source = null;
	        this._sizeGrid = null;
	        this._offset = null;
	    }
	    /**
	     * 当前实例的有效缩放网格数据。
	     * <p>如果设置为null,则在应用任何缩放转换时，将正常缩放整个显示对象。</p>
	     * <p>数据格式：[上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)]。
	     * <ul><li>例如：[4,4,4,4,1]</li></ul></p>
	     * <p> <code>sizeGrid</code> 的值如下所示：
	     * <ol>
	     * <li>上边距</li>
	     * <li>右边距</li>
	     * <li>下边距</li>
	     * <li>左边距</li>
	     * <li>是否重复填充(值为0：不重复填充，1：重复填充)</li>
	     * </ol></p>
	     * <p>当定义 <code>sizeGrid</code> 属性时，该显示对象被分割到以 <code>sizeGrid</code> 数据中的"上边距,右边距,下边距,左边距" 组成的矩形为基础的具有九个区域的网格中，该矩形定义网格的中心区域。网格的其它八个区域如下所示：
	     * <ul>
	     * <li>矩形上方的区域</li>
	     * <li>矩形外的右上角</li>
	     * <li>矩形左侧的区域</li>
	     * <li>矩形右侧的区域</li>
	     * <li>矩形外的左下角</li>
	     * <li>矩形下方的区域</li>
	     * <li>矩形外的右下角</li>
	     * <li>矩形外的左上角</li>
	     * </ul>
	     * 同时也支持3宫格，比如0,4,0,4,1为水平3宫格，4,0,4,0,1为垂直3宫格，3宫格性能比9宫格高。
	     * </p>
	     */
	    get sizeGrid() {
	        return this._sizeGrid;
	    }
	    set sizeGrid(value) {
	        this._sizeGrid = value.map((v) => { return +v; });
	        this._setChanged();
	    }
	    /**
	     * 表示显示对象的宽度，以像素为单位。
	     */
	    get width() {
	        if (this._width)
	            return this._width;
	        if (this._source)
	            return this._source.sourceWidth;
	        return 0;
	    }
	    set width(value) {
	        if (this._width != value) {
	            this._width = value;
	            this._setChanged();
	        }
	    }
	    /**
	     * 表示显示对象的高度，以像素为单位。
	     */
	    get height() {
	        if (this._height)
	            return this._height;
	        if (this._source)
	            return this._source.sourceHeight;
	        return 0;
	    }
	    set height(value) {
	        if (this._height != value) {
	            this._height = value;
	            this._setChanged();
	        }
	    }
	    /**
	     * 对象的纹理资源。
	     * @see laya.resource.Texture
	     */
	    get source() {
	        return this._source;
	    }
	    set source(value) {
	        if (value) {
	            this._source = value;
	            this._setChanged();
	        }
	        else {
	            this._source = null;
	            this.clear();
	        }
	    }
	    /** @private */
	    _setChanged() {
	        if (!this._isChanged) {
	            this._isChanged = true;
	            window.Laya.timer.callLater(this, this.changeSource);
	        }
	    }
	    /**
	     * @private
	     * 修改纹理资源。
	     */
	    changeSource() {
	        this._isChanged = false;
	        var source = this._source;
	        if (!source || !source.bitmap)
	            return;
	        var width = this.width;
	        var height = this.height;
	        var sizeGrid = this._sizeGrid;
	        var sw = source.sourceWidth;
	        var sh = source.sourceHeight;
	        //如果没有设置9宫格，或大小未改变，则直接用原图绘制
	        if (!sizeGrid || (sw === width && sh === height)) {
	            this.clear();
	            this.drawTexture(source, this._offset ? this._offset[0] : 0, this._offset ? this._offset[1] : 0, width, height, null, 1, null, null, this.uv);
	        }
	        else {
	            //从缓存中读取渲染命令(和回收冲突，暂时去掉)
	            //source.$_GID || (source.$_GID = Utils.getGID());
	            //_key = source.$_GID + "." + width + "." + height + "." + sizeGrid.join(".");
	            //if (Utils.isOKCmdList(WeakObject.I.get(_key))) {
	            //this.cmds = WeakObject.I.get(_key);
	            //return;
	            //}
	            this.clear();
	            this.draw9Grid(source, 0, 0, width, height, sizeGrid);
	            this._repaint();
	            return;
	        }
	        this._repaint();
	    }
	    drawBitmap(repeat, tex, x, y, width = 0, height = 0) {
	        if (width < 0.1 || height < 0.1)
	            return;
	        if (repeat && (tex.width != width || tex.height != height))
	            this.fillTexture(tex, x, y, width, height);
	        else
	            this.drawImage(tex, x, y, width, height);
	    }
	    static getTexture(tex, x, y, width, height) {
	        if (width <= 0)
	            width = 1;
	        if (height <= 0)
	            height = 1;
	        tex.$_GID || (tex.$_GID = Laya.Utils.getGID());
	        //var key:String = tex.$_GID + "." + x + "." + y + "." + width + "." + height;
	        //var texture:Texture = WeakObject.I.get(key);
	        var texture;
	        if (!texture || !texture._getSource()) {
	            texture = Laya.Texture.createFromTexture(tex, x, y, width, height);
	            //WeakObject.I.set(key, texture);
	        }
	        return texture;
	    }
	}
	Laya.ClassUtils.regClass("laya.ui.AutoBitmap", AutoBitmap);
	Laya.ClassUtils.regClass("Laya.AutoBitmap", AutoBitmap);

	/**
	 * 相对布局插件
	 */
	class Widget extends Laya.Component {
	    constructor() {
	        super(...arguments);
	        this._top = NaN;
	        this._bottom = NaN;
	        this._left = NaN;
	        this._right = NaN;
	        this._centerX = NaN;
	        this._centerY = NaN;
	    }
	    /**
	     * @override
	     */
	    /*override*/ onReset() {
	        this._top = this._bottom = this._left = this._right = this._centerX = this._centerY = NaN;
	    }
	    /**
	     * @override
	     */
	    /*override*/ _onEnable() {
	        if (this.owner.parent)
	            this._onAdded();
	        else
	            this.owner.once(Laya.Event.ADDED, this, this._onAdded);
	    }
	    /**
	     * @override
	     */
	    /*override*/ _onDisable() {
	        this.owner.off(Laya.Event.ADDED, this, this._onAdded);
	        if (this.owner.parent)
	            this.owner.parent.off(Laya.Event.RESIZE, this, this._onParentResize);
	    }
	    /**
	     * @internal
	     * 对象被添加到显示列表的事件侦听处理函数。
	     * @override
	     */
	    /*override*/ _onAdded() {
	        if (this.owner.parent)
	            this.owner.parent.on(Laya.Event.RESIZE, this, this._onParentResize);
	        this.resetLayoutX();
	        this.resetLayoutY();
	    }
	    /**
	     * 父容器的 <code>Event.RESIZE</code> 事件侦听处理函数。
	     */
	    _onParentResize() {
	        if (this.resetLayoutX() || this.resetLayoutY())
	            this.owner.event(Laya.Event.RESIZE);
	    }
	    /**
	     * <p>重置对象的 <code>X</code> 轴（水平方向）布局。</p>
	     * @private
	     */
	    resetLayoutX() {
	        var owner = this.owner;
	        if (!owner)
	            return false;
	        var parent = owner.parent;
	        if (parent) {
	            if (!isNaN(this.centerX)) {
	                owner.x = Math.round((parent.width - owner.displayWidth) * 0.5 + this.centerX + owner.pivotX * owner.scaleX);
	            }
	            else if (!isNaN(this.left)) {
	                owner.x = Math.round(this.left + owner.pivotX * owner.scaleX);
	                if (!isNaN(this.right)) {
	                    //TODO:如果用width，会死循环
	                    var temp = (parent._width - this.left - this.right) / (owner.scaleX || 0.01);
	                    if (temp != owner.width) {
	                        owner.width = temp;
	                        return true;
	                    }
	                }
	            }
	            else if (!isNaN(this.right)) {
	                owner.x = Math.round(parent.width - owner.displayWidth - this.right + owner.pivotX * owner.scaleX);
	            }
	        }
	        return false;
	    }
	    /**
	     * <p>重置对象的 <code>Y</code> 轴（垂直方向）布局。</p>
	     * @private
	     */
	    resetLayoutY() {
	        var owner = this.owner;
	        if (!owner)
	            return false;
	        var parent = owner.parent;
	        if (parent) {
	            if (!isNaN(this.centerY)) {
	                owner.y = Math.round((parent.height - owner.displayHeight) * 0.5 + this.centerY + owner.pivotY * owner.scaleY);
	            }
	            else if (!isNaN(this.top)) {
	                owner.y = Math.round(this.top + owner.pivotY * owner.scaleY);
	                if (!isNaN(this.bottom)) {
	                    //TODO:
	                    var temp = (parent._height - this.top - this.bottom) / (owner.scaleY || 0.01);
	                    if (temp != owner.height) {
	                        owner.height = temp;
	                        return true;
	                    }
	                }
	            }
	            else if (!isNaN(this.bottom)) {
	                owner.y = Math.round(parent.height - owner.displayHeight - this.bottom + owner.pivotY * owner.scaleY);
	            }
	        }
	        return false;
	    }
	    /**
	     * 重新计算布局
	     */
	    resetLayout() {
	        if (this.owner) {
	            this.resetLayoutX();
	            this.resetLayoutY();
	        }
	    }
	    /**表示距顶边的距离（以像素为单位）。*/
	    get top() {
	        return this._top;
	    }
	    set top(value) {
	        if (this._top != value) {
	            this._top = value;
	            this.resetLayoutY();
	        }
	    }
	    /**表示距底边的距离（以像素为单位）。*/
	    get bottom() {
	        return this._bottom;
	    }
	    set bottom(value) {
	        if (this._bottom != value) {
	            this._bottom = value;
	            this.resetLayoutY();
	        }
	    }
	    /**表示距左边的距离（以像素为单位）。*/
	    get left() {
	        return this._left;
	    }
	    set left(value) {
	        if (this._left != value) {
	            this._left = value;
	            this.resetLayoutX();
	        }
	    }
	    /**表示距右边的距离（以像素为单位）。*/
	    get right() {
	        return this._right;
	    }
	    set right(value) {
	        if (this._right != value) {
	            this._right = value;
	            this.resetLayoutX();
	        }
	    }
	    /**表示距水平方向中心轴的距离（以像素为单位）。*/
	    get centerX() {
	        return this._centerX;
	    }
	    set centerX(value) {
	        if (this._centerX != value) {
	            this._centerX = value;
	            this.resetLayoutX();
	        }
	    }
	    /**表示距垂直方向中心轴的距离（以像素为单位）。*/
	    get centerY() {
	        return this._centerY;
	    }
	    set centerY(value) {
	        if (this._centerY != value) {
	            this._centerY = value;
	            this.resetLayoutY();
	        }
	    }
	}
	/**一个已初始化的 <code>Widget</code> 实例。*/
	Widget.EMPTY = null; // new Widget();
	Laya.ILaya.regClass(Widget);
	Widget.EMPTY = new Widget();
	Laya.ClassUtils.regClass("laya.ui.Widget", Widget);
	Laya.ClassUtils.regClass("Laya.Widget", Widget);

	/**
	 * <code>UIEvent</code> 类用来定义UI组件类的事件类型。
	 */
	class UIEvent extends Laya.Event {
	}
	/**
	 * 显示提示信息。
	 */
	UIEvent.SHOW_TIP = "showtip";
	/**
	 * 隐藏提示信息。
	 */
	UIEvent.HIDE_TIP = "hidetip";
	Laya.ILaya.regClass(UIEvent);
	Laya.ClassUtils.regClass("laya.ui.UIEvent", UIEvent);
	Laya.ClassUtils.regClass("Laya.UIEvent", UIEvent);

	/**
	 * <code>UIUtils</code> 是文本工具集。
	 */
	class UIUtils {
	    /**
	     * 用字符串填充数组，并返回数组副本。
	     * @param	arr 源数组对象。
	     * @param	str 用逗号连接的字符串。如"p1,p2,p3,p4"。
	     * @param	type 如果值不为null，则填充的是新增值得类型。
	     * @return 填充后的数组。
	     */
	    static fillArray(arr, str, type = null) {
	        var temp = arr.concat();
	        if (str) {
	            var a = str.split(",");
	            for (var i = 0, n = Math.min(temp.length, a.length); i < n; i++) {
	                var value = a[i];
	                temp[i] = (value == "true" ? true : (value == "false" ? false : value));
	                if (type != null)
	                    temp[i] = type(value);
	            }
	        }
	        return temp;
	    }
	    /**
	     * 转换uint类型颜色值为字符型颜色值。
	     * @param color uint颜色值。
	     * @return 字符型颜色值。
	     */
	    static toColor(color) {
	        return Laya.Utils.toHexColor(color);
	    }
	    /**
	     * 给指定的目标显示对象添加或移除灰度滤镜。
	     * @param	traget 目标显示对象。
	     * @param	isGray 如果值true，则添加灰度滤镜，否则移除灰度滤镜。
	     */
	    //TODO:coverage
	    static gray(traget, isGray = true) {
	        if (isGray) {
	            UIUtils.addFilter(traget, UIUtils.grayFilter);
	        }
	        else {
	            UIUtils.clearFilter(traget, Laya.ColorFilter);
	        }
	    }
	    /**
	     * 给指定的目标显示对象添加滤镜。
	     * @param	target 目标显示对象。
	     * @param	filter 滤镜对象。
	     */
	    //TODO:coverage
	    static addFilter(target, filter) {
	        var filters = target.filters || [];
	        filters.push(filter);
	        target.filters = filters;
	    }
	    /**
	     * 移除目标显示对象的指定类型滤镜。
	     * @param	target 目标显示对象。
	     * @param	filterType 滤镜类型。
	     */
	    //TODO:coverage
	    static clearFilter(target, filterType) {
	        var filters = target.filters;
	        if (filters != null && filters.length > 0) {
	            for (var i = filters.length - 1; i > -1; i--) {
	                var filter = filters[i];
	                if (filter instanceof filterType)
	                    filters.splice(i, 1);
	            }
	            target.filters = filters;
	        }
	    }
	    /**
	     * 获取当前要替换的转移字符
	     * @param word
	     * @return
	     *
	     */
	    //TODO:coverage
	    static _getReplaceStr(word) {
	        return UIUtils.escapeSequence[word];
	    }
	    /**
	     * 替换字符串中的转义字符
	     * @param str
	     */
	    static adptString(str) {
	        return str.replace(/\\(\w)/g, UIUtils._getReplaceStr);
	    }
	    /**
	     * @private 根据字符串，返回函数表达式
	     */
	    //TODO:coverage
	    static getBindFun(value) {
	        if (!UIUtils._funMap) {
	            UIUtils._funMap = new Laya.WeakObject();
	        }
	        var fun = UIUtils._funMap.get(value);
	        if (fun == null) {
	            var temp = "\"" + value + "\"";
	            temp = temp.replace(/^"\${|}"$/g, "").replace(/\${/g, "\"+").replace(/}/g, "+\"");
	            var str = "(function(data){if(data==null)return;with(data){try{\nreturn " + temp + "\n}catch(e){}}})";
	            fun = window.Laya._runScript(str);
	            UIUtils._funMap.set(value, fun);
	        }
	        return fun;
	    }
	}
	UIUtils.grayFilter = new Laya.ColorFilter([0.3086, 0.6094, 0.082, 0, 0, 0.3086, 0.6094, 0.082, 0, 0, 0.3086, 0.6094, 0.082, 0, 0, 0, 0, 0, 1, 0]);
	/**
	 * 需要替换的转义字符表
	 */
	UIUtils.escapeSequence = { "\\n": "\n", "\\t": "\t" };
	/**@private */
	UIUtils._funMap = null; //new WeakObject();
	Laya.ClassUtils.regClass("laya.ui.UIUtils", UIUtils);
	Laya.ClassUtils.regClass("Laya.UIUtils", UIUtils);

	/**
	 * <code>Component</code> 是ui控件类的基类。
	 * <p>生命周期：preinitialize > createChildren > initialize > 组件构造函数</p>
	 */
	class UIComponent extends Laya.Sprite {
	    /**
	     * <p>创建一个新的 <code>Component</code> 实例。</p>
	     */
	    constructor() {
	        super();
	        /**X锚点，值为0-1，设置anchorX值最终通过pivotX值来改变节点轴心点。*/
	        this._anchorX = NaN;
	        /**Y锚点，值为0-1，设置anchorY值最终通过pivotY值来改变节点轴心点。*/
	        this._anchorY = NaN;
	        /**@private 相对布局组件*/
	        this._widget = Widget.EMPTY;
	        this.preinitialize();
	        this.createChildren();
	        this.initialize();
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._dataSource = null;
	        this._tag = null;
	        this._toolTip = null;
	    }
	    /**
	     * <p>预初始化。</p>
	     * @internal 子类可在此函数内设置、修改属性默认值
	     */
	    preinitialize() {
	    }
	    /**
	     * <p>创建并添加控件子节点。</p>
	     * @internal 子类可在此函数内创建并添加子节点。
	     */
	    createChildren() {
	    }
	    /**
	     * <p>控件初始化。</p>
	     * @internal 在此子对象已被创建，可以对子对象进行修改。
	     */
	    initialize() {
	    }
	    /**
	     * <p>表示显示对象的宽度，以像素为单位。</p>
	     * <p><b>注：</b>当值为0时，宽度为自适应大小。</p>
	     *@override
	     */
	    get width() {
	        return this.get_width();
	    }
	    /**
	     * @override
	     */
	    get_width() {
	        if (this._width)
	            return this._width;
	        return this.measureWidth();
	    }
	    /**
	     * <p>显示对象的实际显示区域宽度（以像素为单位）。</p>
	     */
	    measureWidth() {
	        var max = 0;
	        this.commitMeasure();
	        for (var i = this.numChildren - 1; i > -1; i--) {
	            var comp = this.getChildAt(i);
	            if (comp._visible) {
	                max = Math.max(comp._x + comp.width * comp.scaleX, max);
	            }
	        }
	        return max;
	    }
	    /**
	     * <p>立即执行影响宽高度量的延迟调用函数。</p>
	     * @internal <p>使用 <code>runCallLater</code> 函数，立即执行影响宽高度量的延迟运行函数(使用 <code>callLater</code> 设置延迟执行函数)。</p>
	     * @see #callLater()
	     * @see #runCallLater()
	     */
	    commitMeasure() {
	    }
	    /**
	     * <p>表示显示对象的高度，以像素为单位。</p>
	     * <p><b>注：</b>当值为0时，高度为自适应大小。</p>
	     * @override
	     */
	    get height() {
	        return this.get_height();
	    }
	    /**
	     * @override
	     */
	    get_height() {
	        if (this._height)
	            return this._height;
	        return this.measureHeight();
	    }
	    /**
	     * <p>显示对象的实际显示区域高度（以像素为单位）。</p>
	     */
	    measureHeight() {
	        var max = 0;
	        this.commitMeasure();
	        for (var i = this.numChildren - 1; i > -1; i--) {
	            var comp = this.getChildAt(i);
	            if (comp._visible) {
	                max = Math.max(comp._y + comp.height * comp.scaleY, max);
	            }
	        }
	        return max;
	    }
	    /**
	     * @implements
	     * <p>数据赋值，通过对UI赋值来控制UI显示逻辑。</p>
	     * <p>简单赋值会更改组件的默认属性，使用大括号可以指定组件的任意属性进行赋值。</p>
	     * @example
	       //默认属性赋值
	       dataSource = {label1: "改变了label", checkbox1: true};//(更改了label1的text属性值，更改checkbox1的selected属性)。
	       //任意属性赋值
	       dataSource = {label2: {text:"改变了label",size:14}, checkbox2: {selected:true,x:10}};
	     */
	    get dataSource() {
	        return this.get_dataSource();
	    }
	    get_dataSource() {
	        return this._dataSource;
	    }
	    set dataSource(value) {
	        this.set_dataSource(value);
	    }
	    set_dataSource(value) {
	        this._dataSource = value;
	        for (var prop in this._dataSource) {
	            if (prop in this && !(typeof (this[prop]) == 'function')) {
	                this[prop] = this._dataSource[prop];
	            }
	        }
	    }
	    /**
	     * <p>从组件顶边到其内容区域顶边之间的垂直距离（以像素为单位）。</p>
	     */
	    get top() {
	        return this.get_top();
	    }
	    get_top() {
	        return this._widget.top;
	    }
	    set top(value) {
	        this.set_top(value);
	    }
	    set_top(value) {
	        if (value != this._widget.top) {
	            this._getWidget().top = value;
	        }
	    }
	    /**
	     * <p>从组件底边到其内容区域底边之间的垂直距离（以像素为单位）。</p>
	     */
	    get bottom() {
	        return this.get_bottom();
	    }
	    get_bottom() {
	        return this._widget.bottom;
	    }
	    set bottom(value) {
	        this.set_bottom(value);
	    }
	    set_bottom(value) {
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
	    _sizeChanged() {
	        if (!isNaN(this._anchorX))
	            this.pivotX = this.anchorX * this.width;
	        if (!isNaN(this._anchorY))
	            this.pivotY = this.anchorY * this.height;
	        this.event(Laya.Event.RESIZE);
	        if (this._widget !== Widget.EMPTY)
	            this._widget.resetLayout();
	    }
	    /**
	     * <p>对象的标签。</p>
	     * @internal 冗余字段，可以用来储存数据。
	     */
	    get tag() {
	        return this._tag;
	    }
	    set tag(value) {
	        this._tag = value;
	    }
	    /**
	     * <p>鼠标悬停提示。</p>
	     * <p>可以赋值为文本 <code>String</code> 或函数 <code>Handler</code> ，用来实现自定义样式的鼠标提示和参数携带等。</p>
	     * @example
	     * private var _testTips:TestTipsUI = new TestTipsUI();
	     * private function testTips():void {
	       //简单鼠标提示
	     * btn2.toolTip = "这里是鼠标提示&lt;b&gt;粗体&lt;/b&gt;&lt;br&gt;换行";
	       //自定义的鼠标提示
	     * btn1.toolTip = showTips1;
	       //带参数的自定义鼠标提示
	     * clip.toolTip = new Handler(this,showTips2, ["clip"]);
	     * }
	     * private function showTips1():void {
	     * _testTips.label.text = "这里是按钮[" + btn1.label + "]";
	     * tip.addChild(_testTips);
	     * }
	     * private function showTips2(name:String):void {
	     * _testTips.label.text = "这里是" + name;
	     * tip.addChild(_testTips);
	     * }
	     */
	    get toolTip() {
	        return this._toolTip;
	    }
	    set toolTip(value) {
	        if (this._toolTip != value) {
	            this._toolTip = value;
	            if (value != null) {
	                this.on(Laya.Event.MOUSE_OVER, this, this.onMouseOver);
	                this.on(Laya.Event.MOUSE_OUT, this, this.onMouseOut);
	            }
	            else {
	                this.off(Laya.Event.MOUSE_OVER, this, this.onMouseOver);
	                this.off(Laya.Event.MOUSE_OUT, this, this.onMouseOut);
	            }
	        }
	    }
	    /**
	     * 对象的 <code>Event.MOUSE_OVER</code> 事件侦听处理函数。
	     */
	    onMouseOver(e) {
	        window.Laya.stage.event(UIEvent.SHOW_TIP, this._toolTip);
	    }
	    /**
	     * 对象的 <code>Event.MOUSE_OUT</code> 事件侦听处理函数。
	     */
	    onMouseOut(e) {
	        window.Laya.stage.event(UIEvent.HIDE_TIP, this._toolTip);
	    }
	    /** 是否变灰。*/
	    get gray() {
	        return this._gray;
	    }
	    set gray(value) {
	        if (value !== this._gray) {
	            this._gray = value;
	            UIUtils.gray(this, value);
	        }
	    }
	    /** 是否禁用页面，设置为true后，会变灰并且禁用鼠标。*/
	    get disabled() {
	        return this._disabled;
	    }
	    set disabled(value) {
	        if (value !== this._disabled) {
	            this.gray = this._disabled = value;
	            this.mouseEnabled = !value;
	        }
	    }
	    /**
	     * @private
	     * <p>获取对象的布局样式。请不要直接修改此对象</p>
	     */
	    _getWidget() {
	        this._widget === Widget.EMPTY && (this._widget = this.addComponent(Widget));
	        return this._widget;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    set scaleX(value) {
	        this.set_scaleX(value);
	    }
	    /**
	     * @override
	     */
	    set_scaleX(value) {
	        if (super.get_scaleX() == value)
	            return;
	        super.set_scaleX(value);
	        this.event(Laya.Event.RESIZE);
	    }
	    get scaleX() {
	        return super.scaleX;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    set scaleY(value) {
	        this.set_scaleY(value);
	    }
	    /**
	     * @override
	     */
	    set_scaleY(value) {
	        if (super.get_scaleY() == value)
	            return;
	        super.set_scaleY(value);
	        this.event(Laya.Event.RESIZE);
	    }
	    get scaleY() {
	        return super.scaleY;
	    }
	    /**@private */
	    onCompResize() {
	        this._sizeChanged();
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    set width(value) {
	        this.set_width(value);
	    }
	    /**
	     * @override
	     */
	    set_width(value) {
	        if (super.get_width() == value)
	            return;
	        super.set_width(value);
	        this.callLater(this._sizeChanged);
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    set height(value) {
	        this.set_height(value);
	    }
	    /**
	     * @override
	     */
	    set_height(value) {
	        if (super.get_height() == value)
	            return;
	        super.set_height(value);
	        this.callLater(this._sizeChanged);
	    }
	    /**X锚点，值为0-1，设置anchorX值最终通过pivotX值来改变节点轴心点。*/
	    get anchorX() {
	        return this.get_anchorX();
	    }
	    get_anchorX() {
	        return this._anchorX;
	    }
	    set anchorX(value) {
	        this.set_anchorX(value);
	    }
	    set_anchorX(value) {
	        if (this._anchorX != value) {
	            this._anchorX = value;
	            this.callLater(this._sizeChanged);
	        }
	    }
	    /**Y锚点，值为0-1，设置anchorY值最终通过pivotY值来改变节点轴心点。*/
	    get anchorY() {
	        return this.get_anchorY();
	    }
	    get_anchorY() {
	        return this._anchorY;
	    }
	    set anchorY(value) {
	        this.set_anchorY(value);
	    }
	    set_anchorY(value) {
	        if (this._anchorY != value) {
	            this._anchorY = value;
	            this.callLater(this._sizeChanged);
	        }
	    }
	    /**
	     *
	     * @param child
	     * @override
	     */
	    _childChanged(child = null) {
	        this.callLater(this._sizeChanged);
	        super._childChanged(child);
	    }
	}
	Laya.ILaya.regClass(UIComponent);
	Laya.ClassUtils.regClass("laya.ui.UIComponent", UIComponent);
	Laya.ClassUtils.regClass("Laya.UIComponent", UIComponent);

	/**
	 * 资源加载完成后调度。
	 * @eventType Event.LOADED
	 */
	/*[Event(name = "loaded", type = "laya.events.Event")]*/
	/**
	 * <code>Image</code> 类是用于表示位图图像或绘制图形的显示对象。
	 * Image和Clip组件是唯一支持异步加载的两个组件，比如img.skin = "abc/xxx.png"，其他UI组件均不支持异步加载。
	 *
	 * @example <caption>以下示例代码，创建了一个新的 <code>Image</code> 实例，设置了它的皮肤、位置信息，并添加到舞台上。</caption>
	 *	package
	 *	 {
	 *		import laya.ui.Image;
	 *		public class Image_Example
	 *		{
	 *			public function Image_Example()
	 *			{
	 *				Laya.init(640, 800);//设置游戏画布宽高。
	 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *				onInit();
	 *			}
	 *			private function onInit():void
	 *	 		{
	 *				var bg:Image = new Image("resource/ui/bg.png");//创建一个 Image 类的实例对象 bg ,并传入它的皮肤。
	 *				bg.x = 100;//设置 bg 对象的属性 x 的值，用于控制 bg 对象的显示位置。
	 *				bg.y = 100;//设置 bg 对象的属性 y 的值，用于控制 bg 对象的显示位置。
	 *				bg.sizeGrid = "40,10,5,10";//设置 bg 对象的网格信息。
	 *				bg.width = 150;//设置 bg 对象的宽度。
	 *				bg.height = 250;//设置 bg 对象的高度。
	 *				Laya.stage.addChild(bg);//将此 bg 对象添加到显示列表。
	 *				var image:Image = new Image("resource/ui/image.png");//创建一个 Image 类的实例对象 image ,并传入它的皮肤。
	 *				image.x = 100;//设置 image 对象的属性 x 的值，用于控制 image 对象的显示位置。
	 *				image.y = 100;//设置 image 对象的属性 y 的值，用于控制 image 对象的显示位置。
	 *				Laya.stage.addChild(image);//将此 image 对象添加到显示列表。
	 *			}
	 *		}
	 *	 }
	 * @example
	 * Laya.init(640, 800);//设置游戏画布宽高
	 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
	 * onInit();
	 * function onInit() {
	 *     var bg = new laya.ui.Image("resource/ui/bg.png");//创建一个 Image 类的实例对象 bg ,并传入它的皮肤。
	 *     bg.x = 100;//设置 bg 对象的属性 x 的值，用于控制 bg 对象的显示位置。
	 *     bg.y = 100;//设置 bg 对象的属性 y 的值，用于控制 bg 对象的显示位置。
	 *     bg.sizeGrid = "40,10,5,10";//设置 bg 对象的网格信息。
	 *     bg.width = 150;//设置 bg 对象的宽度。
	 *     bg.height = 250;//设置 bg 对象的高度。
	 *     Laya.stage.addChild(bg);//将此 bg 对象添加到显示列表。
	 *     var image = new laya.ui.Image("resource/ui/image.png");//创建一个 Image 类的实例对象 image ,并传入它的皮肤。
	 *     image.x = 100;//设置 image 对象的属性 x 的值，用于控制 image 对象的显示位置。
	 *     image.y = 100;//设置 image 对象的属性 y 的值，用于控制 image 对象的显示位置。
	 *     Laya.stage.addChild(image);//将此 image 对象添加到显示列表。
	 * }
	 * @example
	 * class Image_Example {
	 *     constructor() {
	 *         Laya.init(640, 800);//设置游戏画布宽高。
	 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *         this.onInit();
	 *     }
	 *     private onInit(): void {
	 *         var bg: laya.ui.Image = new laya.ui.Image("resource/ui/bg.png");//创建一个 Image 类的实例对象 bg ,并传入它的皮肤。
	 *         bg.x = 100;//设置 bg 对象的属性 x 的值，用于控制 bg 对象的显示位置。
	 *         bg.y = 100;//设置 bg 对象的属性 y 的值，用于控制 bg 对象的显示位置。
	 *         bg.sizeGrid = "40,10,5,10";//设置 bg 对象的网格信息。
	 *         bg.width = 150;//设置 bg 对象的宽度。
	 *         bg.height = 250;//设置 bg 对象的高度。
	 *         Laya.stage.addChild(bg);//将此 bg 对象添加到显示列表。
	 *         var image: laya.ui.Image = new laya.ui.Image("resource/ui/image.png");//创建一个 Image 类的实例对象 image ,并传入它的皮肤。
	 *         image.x = 100;//设置 image 对象的属性 x 的值，用于控制 image 对象的显示位置。
	 *         image.y = 100;//设置 image 对象的属性 y 的值，用于控制 image 对象的显示位置。
	 *         Laya.stage.addChild(image);//将此 image 对象添加到显示列表。
	 *     }
	 * }
	 * @see laya.ui.AutoBitmap
	 */
	class Image extends UIComponent {
	    /**
	     * 创建一个 <code>Image</code> 实例。
	     * @param skin 皮肤资源地址。
	     */
	    constructor(skin = null) {
	        super();
	        this.skin = skin;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ destroy(destroyChild = true) {
	        super.destroy(true);
	        this._bitmap && this._bitmap.destroy();
	        this._bitmap = null;
	    }
	    /**
	     * 销毁对象并释放加载的皮肤资源。
	     */
	    dispose() {
	        this.destroy(true);
	        window.Laya.loader.clearRes(this._skin);
	    }
	    /**
	     * @inheritDoc
	     * @override
	     * @internal
	    */
	    /*override*/ createChildren() {
	        this.graphics = this._bitmap = new AutoBitmap();
	        this._bitmap.autoCacheCmd = false;
	    }
	    /**
	     * <p>对象的皮肤地址，以字符串表示。</p>
	     * <p>如果资源未加载，则先加载资源，加载完成后应用于此对象。</p>
	     * <b>注意：</b>资源加载完成后，会自动缓存至资源库中。
	     */
	    get skin() {
	        return this._skin;
	    }
	    set skin(value) {
	        if (this._skin != value) {
	            this._skin = value;
	            if (value) {
	                var source = Laya.Loader.getRes(value);
	                if (source) {
	                    this.source = source;
	                    this.onCompResize();
	                }
	                else
	                    window.Laya.loader.load(this._skin, Laya.Handler.create(this, this.setSource, [this._skin]), null, Laya.Loader.IMAGE, 1, true, this._group);
	            }
	            else {
	                this.source = null;
	            }
	        }
	    }
	    /**
	     * @copy laya.ui.AutoBitmap#source
	     */
	    get source() {
	        return this._bitmap.source;
	    }
	    set source(value) {
	        if (!this._bitmap)
	            return;
	        this._bitmap.source = value;
	        this.event(Laya.Event.LOADED);
	        this.repaint();
	    }
	    /**
	     * 资源分组。
	     */
	    get group() {
	        return this._group;
	    }
	    set group(value) {
	        if (value && this._skin)
	            Laya.Loader.setGroup(this._skin, value);
	        this._group = value;
	    }
	    /**
	     * @private
	     * 设置皮肤资源。
	     */
	    setSource(url, img = null) {
	        if (url === this._skin && img) {
	            this.source = img;
	            this.onCompResize();
	        }
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ measureWidth() {
	        return this._bitmap.width;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ measureHeight() {
	        return this._bitmap.height;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ set width(value) {
	        super.width = value;
	        this._bitmap.width = value == 0 ? 0.0000001 : value;
	    }
	    get width() {
	        return super.width;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ set height(value) {
	        super.height = value;
	        this._bitmap.height = value == 0 ? 0.0000001 : value;
	    }
	    get height() {
	        return super.height;
	    }
	    /**
	     * <p>当前实例的位图 <code>AutoImage</code> 实例的有效缩放网格数据。</p>
	     * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
	     * <ul><li>例如："4,4,4,4,1"。</li></ul></p>
	     * @see laya.ui.AutoBitmap#sizeGrid
	     */
	    get sizeGrid() {
	        if (this._bitmap.sizeGrid)
	            return this._bitmap.sizeGrid.join(",");
	        return null;
	    }
	    set sizeGrid(value) {
	        this._bitmap.sizeGrid = UIUtils.fillArray(Styles.defaultSizeGrid, value, Number);
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    set dataSource(value) {
	        this._dataSource = value;
	        if (typeof (value) == 'string')
	            this.skin = value;
	        else
	            super.dataSource = value;
	    }
	    get dataSource() {
	        return super.dataSource;
	    }
	}
	Laya.ILaya.regClass(Image);
	Laya.ClassUtils.regClass("laya.ui.Image", Image);
	Laya.ClassUtils.regClass("Laya.Image", Image);

	/**
	 * 广告插件
	 * @author 小松
	 * @date -2018-09-19
	 */
	class AdvImage extends Image {
	    constructor(skin = null) {
	        super();
	        /**广告列表数据**/
	        this.advsListArr = [];
	        /**资源列表请求地址**/
	        this.resUrl = "https://unioncdn.layabox.com/config/iconlist.json";
	        /**加载请求实例**/
	        this._http = new Laya.Browser.window.XMLHttpRequest();
	        /**广告列表信息**/
	        this._data = [];
	        /**每6分钟重新请求一次新广告列表**/
	        this._resquestTime = 360000;
	        /**播放索引**/
	        this._playIndex = 0;
	        /**轮播间隔时间**/
	        this._lunboTime = 5000;
	        this.skin = skin;
	        this.setLoadUrl();
	        this.init();
	        this.size(120, 120);
	    }
	    /**设置导量加载地址**/
	    setLoadUrl() {
	    }
	    init() {
	        if (this.isSupportJump()) {
	            //这里需要去加载广告列表资源信息
	            if (Laya.Browser.onMiniGame || Laya.Browser.onBDMiniGame) {
	                Laya.ILaya.timer.loop(this._resquestTime, this, this.onGetAdvsListData);
	            }
	            this.onGetAdvsListData();
	            this.initEvent();
	        }
	        else
	            this.visible = false;
	    }
	    initEvent() {
	        this.on(Laya.Event.CLICK, this, this.onAdvsImgClick);
	    }
	    onAdvsImgClick() {
	        var currentJumpUrl = this.getCurrentAppidObj();
	        if (currentJumpUrl)
	            this.jumptoGame();
	    }
	    revertAdvsData() {
	        if (this.advsListArr[this._playIndex]) {
	            this.visible = true;
	            this.skin = this.advsListArr[this._playIndex];
	        }
	    }
	    /**当前小游戏环境是否支持游戏跳转功能**/
	    isSupportJump() {
	        if (Laya.Browser.onMiniGame) {
	            var isSupperJump = window.wx.navigateToMiniProgram instanceof Function;
	            return isSupperJump;
	        }
	        else if (Laya.Browser.onBDMiniGame)
	            return true;
	        return false;
	    }
	    /**
	     * 跳转游戏
	     * @param callBack Function 回调参数说明：type 0 跳转成功；1跳转失败；2跳转接口调用成功
	     */
	    jumptoGame() {
	        var advsObj = this.advsListArr[this._playIndex];
	        var desGameId = parseInt(advsObj.gameid); //跳转的gameid，必须为数字
	        var extendInfo = advsObj.extendInfo; //额外参数，必须为字符串
	        var path = advsObj.path; //扩展数据
	        if (Laya.Browser.onMiniGame) {
	            if (this.isSupportJump()) {
	                window.wx.navigateToMiniProgram({
	                    appId: this._appid,
	                    path: "",
	                    extraData: "",
	                    envVersion: "release",
	                    success: function success() {
	                        console.log("-------------跳转成功--------------");
	                    },
	                    fail: function fail() {
	                        console.log("-------------跳转失败--------------");
	                    },
	                    complete: function complete() {
	                        console.log("-------------跳转接口调用成功--------------");
	                        this.updateAdvsInfo();
	                    }.bind(this)
	                });
	            }
	        }
	        else if (Laya.Browser.onBDMiniGame) ;
	        else {
	            this.visible = false;
	        }
	    }
	    updateAdvsInfo() {
	        this.visible = false;
	        this.onLunbo();
	        Laya.ILaya.timer.loop(this._lunboTime, this, this.onLunbo);
	    }
	    onLunbo() {
	        if (this._playIndex >= this.advsListArr.length - 1)
	            this._playIndex = 0;
	        else
	            this._playIndex += 1;
	        this.visible = true;
	        this.revertAdvsData();
	    }
	    /**获取轮播数据**/
	    getCurrentAppidObj() {
	        return this.advsListArr[this._playIndex];
	    }
	    /**
	     * 获取广告列表数据信息
	     */
	    onGetAdvsListData() {
	        var _this = this;
	        var random = AdvImage.randRange(10000, 1000000);
	        var url = this.resUrl + "?" + random;
	        this._http.open("get", url, true);
	        this._http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	        this._http.responseType = "text";
	        this._http.onerror = function (e) {
	            _this._onError(e);
	        };
	        this._http.onload = function (e) {
	            _this._onLoad(e);
	        };
	        this._http.send(null);
	    }
	    /**
	     * 生成指定范围的随机数
	     * @param {*} minNum 最小值
	     * @param {*} maxNum 最大值
	     */
	    static randRange(minNum, maxNum) {
	        return (Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum);
	    }
	    /**
	     * @private
	     * 请求出错侦的听处理函数。
	     * @param	e 事件对象。
	     */
	    _onError(e) {
	        this.error("Request failed Status:" + this._http.status + " text:" + this._http.statusText);
	    }
	    /**
	     * @private
	     * 请求消息返回的侦听处理函数。
	     * @param	e 事件对象。
	     */
	    _onLoad(e) {
	        var http = this._http;
	        var status = http.status !== undefined ? http.status : 200;
	        if (status === 200 || status === 204 || status === 0) {
	            this.complete();
	        }
	        else {
	            this.error("[" + http.status + "]" + http.statusText + ":" + http.responseURL);
	        }
	    }
	    /**
	     * @private
	     * 请求错误的处理函数。
	     * @param	message 错误信息。
	     */
	    error(message) {
	        this.event(Laya.Event.ERROR, message);
	    }
	    /**
	     * @private
	     * 请求成功完成的处理函数。
	     */
	    complete() {
	        try {
	            this._data = this._http.response || this._http.responseText;
	            this._data = JSON.parse(this._data);
	            //加载成功，做出回调通知处理
	            //百度，微信
	            this.advsListArr = this._data.list;
	            this._appid = this._data.appid;
	            this.updateAdvsInfo();
	            this.revertAdvsData();
	        }
	        catch (e) {
	            this.error(e.message);
	        }
	    }
	    /**转换数据**/
	    getAdvsQArr(data) {
	        var tempArr = [];
	        var gameAdvsObj = Laya.LocalStorage.getJSON("gameObj");
	        for (var key in data) {
	            var tempObj = data[key];
	            if (gameAdvsObj && gameAdvsObj[tempObj.gameid] && !tempObj.isQiangZhi)
	                continue; //如果游戏id之前点击过就跳过，放弃轮播显示
	            tempArr.push(tempObj);
	        }
	        return tempArr;
	    }
	    /**
	     * @private
	     * 清除当前请求。
	     */
	    clear() {
	        var http = this._http;
	        http.onerror = http.onabort = http.onprogress = http.onload = null;
	    }
	    /**
	     * @override
	     * @param destroyChild
	     */
	    destroy(destroyChild = true) {
	        Laya.ILaya.timer.clear(this, this.onLunbo);
	        super.destroy(true);
	        this.clear();
	        Laya.ILaya.timer.clear(this, this.onGetAdvsListData);
	    }
	}
	Laya.ClassUtils.regClass("laya.ui.AdvImage", AdvImage);
	Laya.ClassUtils.regClass("Laya.AdvImage", AdvImage);

	/**
	 * 当按钮的选中状态（ <code>selected</code> 属性）发生改变时调度。
	 * @eventType laya.events.Event
	 */
	/*[Event(name = "change", type = "laya.events.Event")]*/
	/**
	 * <code>Button</code> 组件用来表示常用的多态按钮。 <code>Button</code> 组件可显示文本标签、图标或同时显示两者。	 *
	 * <p>可以是单态，两态和三态，默认三态(up,over,down)。</p>
	 *
	 * @example <caption>以下示例代码，创建了一个 <code>Button</code> 实例。</caption>
	 * package
	 *	{
	 *		import laya.ui.Button;
	 *		import laya.utils.Handler;
	 *		public class Button_Example
	 *		{
	 *			public function Button_Example()
	 *			{
	 *				Laya.init(640, 800);//设置游戏画布宽高。
	 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *				Laya.loader.load("resource/ui/button.png", Handler.create(this,onLoadComplete));//加载资源。
	 *			}
	 *			private function onLoadComplete():void
	 *			{
	 *				trace("资源加载完成！");
	 *				var button:Button = new Button("resource/ui/button.png","label");//创建一个 Button 类的实例对象 button ,并传入它的皮肤。
	 *				button.x = 100;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。
	 *				button.y = 100;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。
	 *				button.clickHandler = new Handler(this, onClickButton,[button]);//设置 button 的点击事件处理器。
	 *				Laya.stage.addChild(button);//将此 button 对象添加到显示列表。
	 *			}
	 *			private function onClickButton(button:Button):void
	 *			{
	 *				trace("按钮button被点击了！");
	 *			}
	 *		}
	 *	}
	 * @example
	 * Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
	 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 * Laya.loader.load("resource/ui/button.png",laya.utils.Handler.create(this,loadComplete));//加载资源
	 * function loadComplete()
	 * {
	 *     console.log("资源加载完成！");
	 *     var button = new laya.ui.Button("resource/ui/button.png","label");//创建一个 Button 类的实例对象 button ,传入它的皮肤skin和标签label。
	 *     button.x =100;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。
	 *     button.y =100;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。
	 *     button.clickHandler = laya.utils.Handler.create(this,onClickButton,[button],false);//设置 button 的点击事件处理函数。
	 *     Laya.stage.addChild(button);//将此 button 对象添加到显示列表。
	 * }
	 * function onClickButton(button)
	 * {
	 *     console.log("按钮被点击了。",button);
	 * }
	 * @example
	 * import Button=laya.ui.Button;
	 * import Handler=laya.utils.Handler;
	 * class Button_Example{
	 *     constructor()
	 *     {
	 *         Laya.init(640, 800);
	 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *         Laya.loader.load("resource/ui/button.png", laya.utils.Handler.create(this,this.onLoadComplete));//加载资源。
	 *     }
	 *     private onLoadComplete()
	 *     {
	 *         var button:Button = new Button("resource/ui/button.png","label");//创建一个 Button 类的实例对象 button ,并传入它的皮肤。
	 *         button.x = 100;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。
	 *         button.y = 100;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。
	 *         button.clickHandler = new Handler(this, this.onClickButton,[button]);//设置 button 的点击事件处理器。
	 *         Laya.stage.addChild(button);//将此 button 对象添加到显示列表。
	 *     }
	 *     private onClickButton(button:Button):void
	 *     {
	 *         console.log("按钮button被点击了！")
	 *     }
	 * }
	 */
	class Button extends UIComponent {
	    /**
	     * 创建一个新的 <code>Button</code> 类实例。
	     * @param skin 皮肤资源地址。
	     * @param label 按钮的文本内容。
	     */
	    constructor(skin = null, label = "") {
	        super();
	        /**
	         * @private
	         * 按钮文本标签的颜色值。
	         */
	        this._labelColors = Styles.buttonLabelColors;
	        /**
	         * @private
	         * 按钮的状态值。
	         */
	        this._state = 0;
	        /**
	         * @private
	         * 指定此显示对象是否自动计算并改变大小等属性。
	         */
	        this._autoSize = true; // 注意 由于构造函数执行顺序的区别，这里设置为true真的会导致ts的值为true，as的为false （as的 后调用super）
	        /**
	         * @private
	         * 按钮的状态数。
	         */
	        this._stateNum = Styles.buttonStateNum;
	        /**
	         * @private
	         */
	        this._stateChanged = false;
	        this.skin = skin;
	        this.label = label;
	    }
	    /**@inheritDoc
	     * @override
	    */
	    destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._bitmap && this._bitmap.destroy();
	        this._text && this._text.destroy(destroyChild);
	        this._bitmap = null;
	        this._text = null;
	        this._clickHandler = null;
	        this._labelColors = this._sources = this._strokeColors = null;
	    }
	    /**@inheritDoc
	     * @override
	     * @internal
	    */
	    createChildren() {
	        this.graphics = this._bitmap = new AutoBitmap();
	    }
	    /**@private */
	    createText() {
	        if (!this._text) {
	            this._text = new Laya.Text();
	            this._text.overflow = Laya.Text.HIDDEN;
	            this._text.align = "center";
	            this._text.valign = "middle";
	            this._text.width = this._width;
	            this._text.height = this._height;
	        }
	    }
	    /**@inheritDoc
	     * @override
	     * @internal
	    */
	    initialize() {
	        if (this._mouseState !== 1) {
	            this.mouseEnabled = true;
	            this._setBit(Laya.Const.HAS_MOUSE, true);
	        }
	        this._createListener(Laya.Event.MOUSE_OVER, this, this.onMouse, null, false, false);
	        this._createListener(Laya.Event.MOUSE_OUT, this, this.onMouse, null, false, false);
	        this._createListener(Laya.Event.MOUSE_DOWN, this, this.onMouse, null, false, false);
	        this._createListener(Laya.Event.MOUSE_UP, this, this.onMouse, null, false, false);
	        this._createListener(Laya.Event.CLICK, this, this.onMouse, null, false, false);
	    }
	    /**
	     * 对象的 <code>Event.MOUSE_OVER、Event.MOUSE_OUT、Event.MOUSE_DOWN、Event.MOUSE_UP、Event.CLICK</code> 事件侦听处理函数。
	     * @param e Event 对象。
	     */
	    onMouse(e) {
	        if (this.toggle === false && this._selected)
	            return;
	        if (e.type === Laya.Event.CLICK) {
	            this.toggle && (this.selected = !this._selected);
	            this._clickHandler && this._clickHandler.run();
	            return;
	        }
	        !this._selected && (this.state = Button.stateMap[e.type]);
	    }
	    /**
	     * <p>对象的皮肤资源地址。</p>
	     * 支持单态，两态和三态，用 <code>stateNum</code> 属性设置
	     * <p>对象的皮肤地址，以字符串表示。</p>
	     * @see #stateNum
	     */
	    get skin() {
	        return this._skin;
	    }
	    set skin(value) {
	        if (this._skin != value) {
	            this._skin = value;
	            if (value) {
	                if (!Laya.Loader.getRes(value)) {
	                    window.Laya.loader.load(this._skin, Laya.Handler.create(this, this._skinLoaded), null, Laya.Loader.IMAGE, 1); //TODO 
	                }
	                else {
	                    this._skinLoaded();
	                }
	            }
	            else {
	                this._skinLoaded();
	            }
	        }
	    }
	    _skinLoaded() {
	        this.callLater(this.changeClips);
	        this._setStateChanged();
	        this._sizeChanged();
	        this.event(Laya.Event.LOADED);
	    }
	    /**
	     * <p>指定对象的状态值，以数字表示。</p>
	     * <p>默认值为3。此值决定皮肤资源图片的切割方式。</p>
	     * <p><b>取值：</b>
	     * <li>1：单态。图片不做切割，按钮的皮肤状态只有一种。</li>
	     * <li>2：两态。图片将以竖直方向被等比切割为2部分，从上向下，依次为
	     * 弹起状态皮肤、
	     * 按下和经过及选中状态皮肤。</li>
	     * <li>3：三态。图片将以竖直方向被等比切割为3部分，从上向下，依次为
	     * 弹起状态皮肤、
	     * 经过状态皮肤、
	     * 按下和选中状态皮肤</li>
	     * </p>
	     */
	    get stateNum() {
	        return this._stateNum;
	    }
	    set stateNum(value) {
	        if (typeof value == 'string') {
	            value = parseInt(value);
	        }
	        if (this._stateNum != value) {
	            this._stateNum = value < 1 ? 1 : value > 3 ? 3 : value;
	            this.callLater(this.changeClips);
	        }
	    }
	    /**
	     * @private
	     * 对象的资源切片发生改变。
	     */
	    changeClips() {
	        var img = Laya.Loader.getRes(this._skin);
	        if (!img) {
	            console.log("lose skin", this._skin);
	            return;
	        }
	        var width = img.sourceWidth;
	        var height = img.sourceHeight / this._stateNum;
	        img.$_GID || (img.$_GID = Laya.Utils.getGID());
	        var key = img.$_GID + "-" + this._stateNum;
	        var clips = Laya.WeakObject.I.get(key);
	        if (!Laya.Utils.isOkTextureList(clips)) {
	            clips = null;
	        }
	        if (clips)
	            this._sources = clips;
	        else {
	            this._sources = [];
	            if (this._stateNum === 1) {
	                this._sources.push(img);
	            }
	            else {
	                for (var i = 0; i < this._stateNum; i++) {
	                    this._sources.push(Laya.Texture.createFromTexture(img, 0, height * i, width, height));
	                }
	            }
	            Laya.WeakObject.I.set(key, this._sources);
	        }
	        if (this._autoSize) {
	            this._bitmap.width = this._width || width;
	            this._bitmap.height = this._height || height;
	            if (this._text) {
	                this._text.width = this._bitmap.width;
	                this._text.height = this._bitmap.height;
	            }
	        }
	        else {
	            this._text && (this._text.x = width);
	        }
	    }
	    /**
	     * @inheritDoc
	     * @override
	     */
	    measureWidth() {
	        this.runCallLater(this.changeClips);
	        if (this._autoSize)
	            return this._bitmap.width;
	        this.runCallLater(this.changeState);
	        return this._bitmap.width + (this._text ? this._text.width : 0);
	    }
	    /**
	     * @inheritDoc
	     * @override
	     */
	    measureHeight() {
	        this.runCallLater(this.changeClips);
	        return this._text ? Math.max(this._bitmap.height, this._text.height) : this._bitmap.height;
	    }
	    /**
	     * 按钮的文本内容。
	     */
	    get label() {
	        return this._text ? this._text.text : null;
	    }
	    set label(value) {
	        if (!this._text && !value)
	            return;
	        this.createText();
	        if (this._text.text != value) {
	            value && !this._text.parent && this.addChild(this._text);
	            this._text.text = (value + "").replace(/\\n/g, "\n");
	            this._setStateChanged();
	        }
	    }
	    /**
	     * 表示按钮的选中状态。
	     * <p>如果值为true，表示该对象处于选中状态。否则该对象处于未选中状态。</p>
	     * @implements
	     */
	    get selected() {
	        return this._selected;
	    }
	    set selected(value) {
	        if (this._selected != value) {
	            this._selected = value;
	            this.state = this._selected ? 2 : 0;
	            this.event(Laya.Event.CHANGE);
	        }
	    }
	    /**
	     * 对象的状态值。
	     * @see #stateMap
	     */
	    get state() {
	        return this._state;
	    }
	    set state(value) {
	        if (this._state != value) {
	            this._state = value;
	            this._setStateChanged();
	        }
	    }
	    /**
	     * @private
	     * 改变对象的状态。
	     */
	    changeState() {
	        this._stateChanged = false;
	        this.runCallLater(this.changeClips);
	        var index = this._state < this._stateNum ? this._state : this._stateNum - 1;
	        this._sources && (this._bitmap.source = this._sources[index]);
	        if (this.label) {
	            this._text.color = this._labelColors[index];
	            if (this._strokeColors)
	                this._text.strokeColor = this._strokeColors[index];
	        }
	    }
	    /**
	     * 表示按钮各个状态下的文本颜色。
	     * <p><b>格式:</b> "upColor,overColor,downColor,disableColor"。</p>
	     */
	    get labelColors() {
	        return this._labelColors.join(",");
	    }
	    set labelColors(value) {
	        this._labelColors = UIUtils.fillArray(Styles.buttonLabelColors, value, String);
	        this._setStateChanged();
	    }
	    /**
	     * 表示按钮各个状态下的描边颜色。
	     * <p><b>格式:</b> "upColor,overColor,downColor,disableColor"。</p>
	     */
	    get strokeColors() {
	        return this._strokeColors ? this._strokeColors.join(",") : "";
	    }
	    set strokeColors(value) {
	        this._strokeColors = UIUtils.fillArray(Styles.buttonLabelColors, value, String);
	        this._setStateChanged();
	    }
	    /**
	     * 表示按钮文本标签的边距。
	     * <p><b>格式：</b>"上边距,右边距,下边距,左边距"。</p>
	     */
	    get labelPadding() {
	        this.createText();
	        return this._text.padding.join(",");
	    }
	    set labelPadding(value) {
	        this.createText();
	        this._text.padding = UIUtils.fillArray(Styles.labelPadding, value, Number);
	    }
	    /**
	     * 表示按钮文本标签的字体大小。
	     * @see laya.display.Text.fontSize()
	     */
	    get labelSize() {
	        this.createText();
	        return this._text.fontSize;
	    }
	    set labelSize(value) {
	        this.createText();
	        this._text.fontSize = value;
	    }
	    /**
	     * <p>描边宽度（以像素为单位）。</p>
	     * 默认值0，表示不描边。
	     * @see laya.display.Text.stroke()
	     */
	    get labelStroke() {
	        this.createText();
	        return this._text.stroke;
	    }
	    set labelStroke(value) {
	        this.createText();
	        this._text.stroke = value;
	    }
	    /**
	     * <p>描边颜色，以字符串表示。</p>
	     * 默认值为 "#000000"（黑色）;
	     * @see laya.display.Text.strokeColor()
	     */
	    get labelStrokeColor() {
	        this.createText();
	        return this._text.strokeColor;
	    }
	    set labelStrokeColor(value) {
	        this.createText();
	        this._text.strokeColor = value;
	    }
	    /**
	     * 表示按钮文本标签是否为粗体字。
	     * @see laya.display.Text.bold()
	     */
	    get labelBold() {
	        this.createText();
	        return this._text.bold;
	    }
	    set labelBold(value) {
	        this.createText();
	        this._text.bold = value;
	    }
	    /**
	     * 表示按钮文本标签的字体名称，以字符串形式表示。
	     * @see laya.display.Text.font()
	     */
	    get labelFont() {
	        this.createText();
	        return this._text.font;
	    }
	    set labelFont(value) {
	        this.createText();
	        this._text.font = value;
	    }
	    /**标签对齐模式，默认为居中对齐。*/
	    get labelAlign() {
	        this.createText();
	        return this._text.align;
	    }
	    set labelAlign(value) {
	        this.createText();
	        this._text.align = value;
	    }
	    /**
	     * 对象的点击事件处理器函数（无默认参数）。
	     * @implements
	     */
	    get clickHandler() {
	        return this._clickHandler;
	    }
	    set clickHandler(value) {
	        this._clickHandler = value;
	    }
	    /**
	     * 按钮文本标签 <code>Text</code> 控件。
	     */
	    get text() {
	        this.createText();
	        return this._text;
	    }
	    /**
	     * <p>当前实例的位图 <code>AutoImage</code> 实例的有效缩放网格数据。</p>
	     * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
	     * <ul><li>例如："4,4,4,4,1"</li></ul></p>
	     * @see laya.ui.AutoBitmap.sizeGrid
	     */
	    get sizeGrid() {
	        if (this._bitmap.sizeGrid)
	            return this._bitmap.sizeGrid.join(",");
	        return null;
	    }
	    set sizeGrid(value) {
	        this._bitmap.sizeGrid = UIUtils.fillArray(Styles.defaultSizeGrid, value, Number);
	    }
	    /**@inheritDoc
	     * @override
	    */
	    set width(value) {
	        super.set_width(value);
	        if (this._autoSize) {
	            this._bitmap.width = value;
	            this._text && (this._text.width = value);
	        }
	    }
	    get width() {
	        return super.get_width();
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    set height(value) {
	        super.set_height(value);
	        if (this._autoSize) {
	            this._bitmap.height = value;
	            this._text && (this._text.height = value);
	        }
	    }
	    get height() {
	        return super.get_height();
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    set dataSource(value) {
	        this._dataSource = value;
	        if (typeof (value) == 'number' || typeof (value) == 'string')
	            this.label = value + "";
	        else
	            super.set_dataSource(value);
	    }
	    get dataSource() {
	        return super.get_dataSource();
	    }
	    /**图标x,y偏移，格式：100,100*/
	    get iconOffset() {
	        return this._bitmap._offset ? this._bitmap._offset.join(",") : null;
	    }
	    set iconOffset(value) {
	        if (value)
	            this._bitmap._offset = UIUtils.fillArray([1, 1], value, Number);
	        else
	            this._bitmap._offset = [];
	    }
	    /**@private */
	    _setStateChanged() {
	        if (!this._stateChanged) {
	            this._stateChanged = true;
	            this.callLater(this.changeState);
	        }
	    }
	}
	/**
	 * 按钮状态集。
	 */
	Button.stateMap = { "mouseup": 0, "mouseover": 1, "mousedown": 2, "mouseout": 0 };
	Laya.ILaya.regClass(Button);
	Laya.ClassUtils.regClass("laya.ui.Button", Button);
	Laya.ClassUtils.regClass("Laya.Button", Button);

	/**
	 * 当按钮的选中状态（ <code>selected</code> 属性）发生改变时调度。
	 * @eventType laya.events.Event
	 */
	/*[Event(name = "change", type = "laya.events.Event")]*/
	/**
	 * <code>CheckBox</code> 组件显示一个小方框，该方框内可以有选中标记。
	 * <code>CheckBox</code> 组件还可以显示可选的文本标签，默认该标签位于 CheckBox 右侧。
	 * <p><code>CheckBox</code> 使用 <code>dataSource</code>赋值时的的默认属性是：<code>selected</code>。</p>
	 *
	 * @example <caption>以下示例代码，创建了一个 <code>CheckBox</code> 实例。</caption>
	 * package
	 *	{
	 *		import laya.ui.CheckBox;
	 *		import laya.utils.Handler;
	 *		public class CheckBox_Example
	 *		{
	 *			public function CheckBox_Example()
	 *			{
	 *				Laya.init(640, 800);//设置游戏画布宽高。
	 * 				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *				Laya.loader.load("resource/ui/check.png", Handler.create(this,onLoadComplete));//加载资源。
	 *			}
	 *			private function onLoadComplete():void
	 *			{
	 *				trace("资源加载完成！");
	 *				var checkBox:CheckBox = new CheckBox("resource/ui/check.png", "这个是一个CheckBox组件。");//创建一个 CheckBox 类的实例对象 checkBox ,传入它的皮肤skin和标签label。
	 *				checkBox.x = 100;//设置 checkBox 对象的属性 x 的值，用于控制 checkBox 对象的显示位置。
	 *				checkBox.y = 100;//设置 checkBox 对象的属性 y 的值，用于控制 checkBox 对象的显示位置。
	 *				checkBox.clickHandler = new Handler(this, onClick, [checkBox]);//设置 checkBox 的点击事件处理器。
	 *				Laya.stage.addChild(checkBox);//将此 checkBox 对象添加到显示列表。
	 *			}
	 *			private function onClick(checkBox:CheckBox):void
	 *			{
	 *				trace("输出选中状态: checkBox.selected = " + checkBox.selected);
	 *			}
	 *		}
	 *	}
	 * @example
	 * Laya.init(640, 800);//设置游戏画布宽高
	 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
	 * Laya.loader.load("resource/ui/check.png",laya.utils.Handler.create(this,loadComplete));//加载资源
	 * function loadComplete()
	 * {
	 *     console.log("资源加载完成！");
	 *     var checkBox:laya.ui.CheckBox= new laya.ui.CheckBox("resource/ui/check.png", "这个是一个CheckBox组件。");//创建一个 CheckBox 类的类的实例对象 checkBox ,传入它的皮肤skin和标签label。
	 *     checkBox.x =100;//设置 checkBox 对象的属性 x 的值，用于控制 checkBox 对象的显示位置。
	 *     checkBox.y =100;//设置 checkBox 对象的属性 y 的值，用于控制 checkBox 对象的显示位置。
	 *     checkBox.clickHandler = new laya.utils.Handler(this,this.onClick,[checkBox],false);//设置 checkBox 的点击事件处理器。
	 *     Laya.stage.addChild(checkBox);//将此 checkBox 对象添加到显示列表。
	 * }
	 * function onClick(checkBox)
	 * {
	 *     console.log("checkBox.selected = ",checkBox.selected);
	 * }
	 * @example
	 * import CheckBox= laya.ui.CheckBox;
	 * import Handler=laya.utils.Handler;
	 * class CheckBox_Example{
	 *     constructor()
	 *     {
	 *         Laya.init(640, 800);
	 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *         Laya.loader.load("resource/ui/check.png", Handler.create(this,this.onLoadComplete));//加载资源。
	 *     }
	 *     private onLoadComplete()
	 *     {
	 *         var checkBox:CheckBox = new CheckBox("resource/ui/check.png", "这个是一个CheckBox组件。");//创建一个 CheckBox 类的实例对象 checkBox ,传入它的皮肤skin和标签label。
	 *         checkBox.x = 100;//设置 checkBox 对象的属性 x 的值，用于控制 checkBox 对象的显示位置。
	 *         checkBox.y = 100;//设置 checkBox 对象的属性 y 的值，用于控制 checkBox 对象的显示位置。
	 *         checkBox.clickHandler = new Handler(this, this.onClick,[checkBox]);//设置 checkBox 的点击事件处理器。
	 *         Laya.stage.addChild(checkBox);//将此 checkBox 对象添加到显示列表。
	 *     }
	 *     private onClick(checkBox:CheckBox):void
	 *     {
	 *         console.log("输出选中状态: checkBox.selected = " + checkBox.selected);
	 *     }
	 * }
	 */
	class CheckBox extends Button {
	    /**
	     * 创建一个新的 <code>CheckBox</code> 组件实例。
	     * @param skin 皮肤资源地址。
	     * @param label 文本标签的内容。
	     */
	    constructor(skin = null, label = "") {
	        super(skin, label);
	        this.toggle = true;
	        this._autoSize = false;
	    }
	    /**
	     * @inheritDoc
	     * @internal
	    */
	    preinitialize() {
	        super.preinitialize();
	        this.toggle = true;
	        this._autoSize = false;
	    }
	    /**
	     * @inheritDoc
	     * @internal
	    */
	    initialize() {
	        super.initialize();
	        this.createText();
	        this._text.align = "left";
	        this._text.valign = "top";
	        this._text.width = 0;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    set dataSource(value) {
	        this._dataSource = value;
	        if (value instanceof Boolean)
	            this.selected = value;
	        else if (typeof (value) == 'string')
	            this.selected = value === "true";
	        else
	            super.dataSource = value;
	    }
	    get dataSource() {
	        return super.dataSource;
	    }
	}
	Laya.ILaya.regClass(CheckBox);
	Laya.ClassUtils.regClass("laya.ui.CheckBox", CheckBox);
	Laya.ClassUtils.regClass("Laya.CheckBox", CheckBox);

	/**
	 * <code>Box</code> 类是一个控件容器类。
	 */
	class Box extends UIComponent {
	    /**@inheritDoc
	     * @override
	     */
	    set dataSource(value) {
	        this._dataSource = value;
	        for (var name in value) {
	            var comp = this.getChildByName(name);
	            if (comp)
	                comp.dataSource = value[name];
	            else if (name in this && !(this[name] instanceof Function))
	                this[name] = value[name];
	        }
	    }
	    get dataSource() {
	        return super.dataSource;
	    }
	    /**背景颜色*/
	    get bgColor() {
	        return this._bgColor;
	    }
	    set bgColor(value) {
	        this._bgColor = value;
	        if (value) {
	            this._onResize(null);
	            this.on(Laya.Event.RESIZE, this, this._onResize);
	        }
	        else {
	            this.graphics.clear();
	            this.off(Laya.Event.RESIZE, this, this._onResize);
	        }
	    }
	    _onResize(e) {
	        this.graphics.clear();
	        this.graphics.drawRect(0, 0, this.width, this.height, this._bgColor);
	    }
	}
	Laya.ILaya.regClass(Box);
	Laya.ClassUtils.regClass("laya.ui.Box", Box);
	Laya.ClassUtils.regClass("Laya.Box", Box);

	/**
	 * 文本内容发生改变后调度。
	 * @eventType laya.events.Event
	 */
	/*[Event(name = "change", type = "laya.events.Event")]*/
	/**
	 * <p> <code>Label</code> 类用于创建显示对象以显示文本。</p>
	 *
	 * @example <caption>以下示例代码，创建了一个 <code>Label</code> 实例。</caption>
	 * package
	 *	{
	 *		import laya.ui.Label;
	 *		public class Label_Example
	 *		{
	 *			public function Label_Example()
	 *			{
	 *				Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
	 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *				onInit();
	 *			}
	 *			private function onInit():void
	 *			{
	 *				var label:Label = new Label();//创建一个 Label 类的实例对象 label 。
	 *				label.font = "Arial";//设置 label 的字体。
	 *				label.bold = true;//设置 label 显示为粗体。
	 *				label.leading = 4;//设置 label 的行间距。
	 *				label.wordWrap = true;//设置 label 自动换行。
	 *				label.padding = "10,10,10,10";//设置 label 的边距。
	 *				label.color = "#ff00ff";//设置 label 的颜色。
	 *				label.text = "Hello everyone,我是一个可爱的文本！";//设置 label 的文本内容。
	 *				label.x = 100;//设置 label 对象的属性 x 的值，用于控制 label 对象的显示位置。
	 *				label.y = 100;//设置 label 对象的属性 y 的值，用于控制 label 对象的显示位置。
	 *				label.width = 300;//设置 label 的宽度。
	 *				label.height = 200;//设置 label 的高度。
	 *				Laya.stage.addChild(label);//将 label 添加到显示列表。
	 *				var passwordLabel:Label = new Label("请原谅我，我不想被人看到我心里话。");//创建一个 Label 类的实例对象 passwordLabel 。
	 *				passwordLabel.asPassword = true;//设置 passwordLabel 的显示反式为密码显示。
	 *				passwordLabel.x = 100;//设置 passwordLabel 对象的属性 x 的值，用于控制 passwordLabel 对象的显示位置。
	 *				passwordLabel.y = 350;//设置 passwordLabel 对象的属性 y 的值，用于控制 passwordLabel 对象的显示位置。
	 *				passwordLabel.width = 300;//设置 passwordLabel 的宽度。
	 *				passwordLabel.color = "#000000";//设置 passwordLabel 的文本颜色。
	 *				passwordLabel.bgColor = "#ccffff";//设置 passwordLabel 的背景颜色。
	 *				passwordLabel.fontSize = 20;//设置 passwordLabel 的文本字体大小。
	 *				Laya.stage.addChild(passwordLabel);//将 passwordLabel 添加到显示列表。
	 *			}
	 *		}
	 *	}
	 * @example
	 * Laya.init(640, 800);//设置游戏画布宽高
	 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
	 * onInit();
	 * function onInit(){
	 *     var label = new laya.ui.Label();//创建一个 Label 类的实例对象 label 。
	 *     label.font = "Arial";//设置 label 的字体。
	 *     label.bold = true;//设置 label 显示为粗体。
	 *     label.leading = 4;//设置 label 的行间距。
	 *     label.wordWrap = true;//设置 label 自动换行。
	 *     label.padding = "10,10,10,10";//设置 label 的边距。
	 *     label.color = "#ff00ff";//设置 label 的颜色。
	 *     label.text = "Hello everyone,我是一个可爱的文本！";//设置 label 的文本内容。
	 *     label.x = 100;//设置 label 对象的属性 x 的值，用于控制 label 对象的显示位置。
	 *     label.y = 100;//设置 label 对象的属性 y 的值，用于控制 label 对象的显示位置。
	 *     label.width = 300;//设置 label 的宽度。
	 *     label.height = 200;//设置 label 的高度。
	 *     Laya.stage.addChild(label);//将 label 添加到显示列表。
	 *     var passwordLabel = new laya.ui.Label("请原谅我，我不想被人看到我心里话。");//创建一个 Label 类的实例对象 passwordLabel 。
	 *     passwordLabel.asPassword = true;//设置 passwordLabel 的显示反式为密码显示。
	 *     passwordLabel.x = 100;//设置 passwordLabel 对象的属性 x 的值，用于控制 passwordLabel 对象的显示位置。
	 *     passwordLabel.y = 350;//设置 passwordLabel 对象的属性 y 的值，用于控制 passwordLabel 对象的显示位置。
	 *     passwordLabel.width = 300;//设置 passwordLabel 的宽度。
	 *     passwordLabel.color = "#000000";//设置 passwordLabel 的文本颜色。
	 *     passwordLabel.bgColor = "#ccffff";//设置 passwordLabel 的背景颜色。
	 *     passwordLabel.fontSize = 20;//设置 passwordLabel 的文本字体大小。
	 *     Laya.stage.addChild(passwordLabel);//将 passwordLabel 添加到显示列表。
	 * }
	 * @example
	 * import Label = laya.ui.Label;
	 * class Label_Example {
	 *     constructor() {
	 *         Laya.init(640, 800);//设置游戏画布宽高。
	 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *         this.onInit();
	 *     }
	 *     private onInit(): void {
	 *         var label: Label = new Label();//创建一个 Label 类的实例对象 label 。
	 *         label.font = "Arial";//设置 label 的字体。
	 *         label.bold = true;//设置 label 显示为粗体。
	 *         label.leading = 4;//设置 label 的行间距。
	 *         label.wordWrap = true;//设置 label 自动换行。
	 *         label.padding = "10,10,10,10";//设置 label 的边距。
	 *         label.color = "#ff00ff";//设置 label 的颜色。
	 *         label.text = "Hello everyone,我是一个可爱的文本！";//设置 label 的文本内容。
	 *         label.x = 100;//设置 label 对象的属性 x 的值，用于控制 label 对象的显示位置。
	 *         label.y = 100;//设置 label 对象的属性 y 的值，用于控制 label 对象的显示位置。
	 *         label.width = 300;//设置 label 的宽度。
	 *         label.height = 200;//设置 label 的高度。
	 *         Laya.stage.addChild(label);//将 label 添加到显示列表。
	 *         var passwordLabel: Label = new Label("请原谅我，我不想被人看到我心里话。");//创建一个 Label 类的实例对象 passwordLabel 。
	 *         passwordLabel.asPassword = true;//设置 passwordLabel 的显示反式为密码显示。
	 *         passwordLabel.x = 100;//设置 passwordLabel 对象的属性 x 的值，用于控制 passwordLabel 对象的显示位置。
	 *         passwordLabel.y = 350;//设置 passwordLabel 对象的属性 y 的值，用于控制 passwordLabel 对象的显示位置。
	 *         passwordLabel.width = 300;//设置 passwordLabel 的宽度。
	 *         passwordLabel.color = "#000000";//设置 passwordLabel 的文本颜色。
	 *         passwordLabel.bgColor = "#ccffff";//设置 passwordLabel 的背景颜色。
	 *         passwordLabel.fontSize = 20;//设置 passwordLabel 的文本字体大小。
	 *         Laya.stage.addChild(passwordLabel);//将 passwordLabel 添加到显示列表。
	 *     }
	 * }
	 * @see laya.display.Text
	 */
	class Label extends UIComponent {
	    /**
	     * 创建一个新的 <code>Label</code> 实例。
	     * @param text 文本内容字符串。
	     */
	    constructor(text = "") {
	        super();
	        this.text = text;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._tf = null;
	    }
	    /**
	     * @inheritDoc
	     * @internal
	    */
	    createChildren() {
	        this.addChild(this._tf = new Laya.Text());
	    }
	    /**
	     * 当前文本内容字符串。
	     * @see laya.display.Text.text
	     */
	    get text() {
	        return this._tf.text;
	    }
	    set text(value) {
	        if (this._tf.text != value) {
	            if (value)
	                value = UIUtils.adptString(value + "");
	            this._tf.text = value;
	            this.event(Laya.Event.CHANGE);
	            if (!this._width || !this._height)
	                this.onCompResize();
	        }
	    }
	    /**@copy laya.display.Text#changeText()
	     **/
	    changeText(text) {
	        this._tf.changeText(text);
	    }
	    /**
	     * @copy laya.display.Text#wordWrap
	     */
	    get wordWrap() {
	        return this._tf.wordWrap;
	    }
	    /**
	     * @copy laya.display.Text#wordWrap
	     */
	    set wordWrap(value) {
	        this._tf.wordWrap = value;
	    }
	    /**
	     * @copy laya.display.Text#color
	     */
	    get color() {
	        return this._tf.color;
	    }
	    set color(value) {
	        this._tf.color = value;
	    }
	    /**
	     * @copy laya.display.Text#font
	     */
	    get font() {
	        return this._tf.font;
	    }
	    set font(value) {
	        this._tf.font = value;
	    }
	    /**
	     * @copy laya.display.Text#align
	     */
	    get align() {
	        return this._tf.align;
	    }
	    set align(value) {
	        this._tf.align = value;
	    }
	    /**
	     * @copy laya.display.Text#valign
	     */
	    get valign() {
	        return this._tf.valign;
	    }
	    set valign(value) {
	        this._tf.valign = value;
	    }
	    /**
	     * @copy laya.display.Text#bold
	     */
	    get bold() {
	        return this._tf.bold;
	    }
	    set bold(value) {
	        this._tf.bold = value;
	    }
	    /**
	     * @copy laya.display.Text#italic
	     */
	    get italic() {
	        return this._tf.italic;
	    }
	    set italic(value) {
	        this._tf.italic = value;
	    }
	    /**
	     * @copy laya.display.Text#leading
	     */
	    get leading() {
	        return this._tf.leading;
	    }
	    set leading(value) {
	        this._tf.leading = value;
	    }
	    /**
	     * @copy laya.display.Text#fontSize
	     */
	    get fontSize() {
	        return this._tf.fontSize;
	    }
	    set fontSize(value) {
	        this._tf.fontSize = value;
	    }
	    /**
	     * <p>边距信息</p>
	     * <p>"上边距，右边距，下边距 , 左边距（边距以像素为单位）"</p>
	     * @see laya.display.Text.padding
	     */
	    get padding() {
	        return this._tf.padding.join(",");
	    }
	    set padding(value) {
	        this._tf.padding = UIUtils.fillArray(Styles.labelPadding, value, Number);
	    }
	    /**
	     * @copy laya.display.Text#bgColor
	     */
	    get bgColor() {
	        return this._tf.bgColor;
	    }
	    set bgColor(value) {
	        this._tf.bgColor = value;
	    }
	    /**
	     * @copy laya.display.Text#borderColor
	     */
	    get borderColor() {
	        return this._tf.borderColor;
	    }
	    set borderColor(value) {
	        this._tf.borderColor = value;
	    }
	    /**
	     * @copy laya.display.Text#stroke
	     */
	    get stroke() {
	        return this._tf.stroke;
	    }
	    set stroke(value) {
	        this._tf.stroke = value;
	    }
	    /**
	     * @copy laya.display.Text#strokeColor
	     */
	    get strokeColor() {
	        return this._tf.strokeColor;
	    }
	    set strokeColor(value) {
	        this._tf.strokeColor = value;
	    }
	    /**
	     * 文本控件实体 <code>Text</code> 实例。
	     */
	    get textField() {
	        return this._tf;
	    }
	    /**
	     * @inheritDoc
	     * @override
	     */
	    /*override*/ measureWidth() {
	        return this._tf.width;
	    }
	    /**
	     * @inheritDoc
	     * @override
	     */
	    /*override*/ measureHeight() {
	        return this._tf.height;
	    }
	    /**
	     * @inheritDoc
	     * @override
	     */
	    /*override*/ get width() {
	        if (this._width || this._tf.text)
	            return super.width;
	        return 0;
	    }
	    /**
	     * @inheritDoc
	     * @override
	     */
	    /*override*/ set width(value) {
	        super.width = value;
	        this._tf.width = value;
	    }
	    /**
	     * @inheritDoc
	     * @override
	     */
	    /*override*/ get height() {
	        if (this._height || this._tf.text)
	            return super.height;
	        return 0;
	    }
	    /**
	     * @inheritDoc
	     * @override
	     */
	    /*override*/ set height(value) {
	        super.height = value;
	        this._tf.height = value;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    set dataSource(value) {
	        this._dataSource = value;
	        if (typeof (value) == 'number' || typeof (value) == 'string')
	            this.text = value + "";
	        else
	            super.dataSource = value;
	    }
	    get dataSource() {
	        return super.dataSource;
	    }
	    /**
	     * @copy laya.display.Text#overflow
	     */
	    get overflow() {
	        return this._tf.overflow;
	    }
	    /**
	     * @copy laya.display.Text#overflow
	     */
	    set overflow(value) {
	        this._tf.overflow = value;
	    }
	    /**
	     * @copy laya.display.Text#underline
	     */
	    get underline() {
	        return this._tf.underline;
	    }
	    /**
	     * @copy laya.display.Text#underline
	     */
	    set underline(value) {
	        this._tf.underline = value;
	    }
	    /**
	     * @copy laya.display.Text#underlineColor
	     */
	    get underlineColor() {
	        return this._tf.underlineColor;
	    }
	    /**
	     * @copy laya.display.Text#underlineColor
	     */
	    set underlineColor(value) {
	        this._tf.underlineColor = value;
	    }
	}
	Laya.ILaya.regClass(Label);
	Laya.ClassUtils.regClass("laya.ui.Label", Label);
	Laya.ClassUtils.regClass("Laya.Label", Label);

	/**
	 * 移动滑块位置时调度。
	 * @eventType laya.events.Event
	 */
	/*[Event(name = "change", type = "laya.events.Event")]*/
	/**
	 * 移动滑块位置完成（用户鼠标抬起）后调度。
	 * @eventType @eventType laya.events.EventD
	 *
	 */
	/*[Event(name = "changed", type = "laya.events.Event")]*/
	/**
	 * 使用 <code>Slider</code> 控件，用户可以通过在滑块轨道的终点之间移动滑块来选择值。
	 * <p>滑块的当前值由滑块端点（对应于滑块的最小值和最大值）之间滑块的相对位置确定。</p>
	 * <p>滑块允许最小值和最大值之间特定间隔内的值。滑块还可以使用数据提示显示其当前值。</p>
	 *
	 * @see laya.ui.HSlider
	 * @see laya.ui.VSlider
	 */
	class Slider extends UIComponent {
	    /**
	     * 创建一个新的 <code>Slider</code> 类示例。
	     * @param skin 皮肤。
	     */
	    constructor(skin = null) {
	        super();
	        /**
	         * 一个布尔值，指示是否为垂直滚动。如果值为true，则为垂直方向，否则为水平方向。
	         * <p>默认值为：true。</p>
	         * @default true
	         */
	        this.isVertical = true;
	        /**
	         * 一个布尔值，指示是否显示标签。
	         * @default true
	         */
	        this.showLabel = true;
	        /**@private */
	        this._max = 100;
	        /**@private */
	        this._min = 0;
	        /**@private */
	        this._tick = 1;
	        /**@private */
	        this._value = 0;
	        if (!Slider.label) {
	            Slider.label = new Label();
	        }
	        this.skin = skin;
	    }
	    /**
	     *@inheritDoc
	     @override
	     */
	    /*override*/ destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._bg && this._bg.destroy(destroyChild);
	        this._bar && this._bar.destroy(destroyChild);
	        this._progress && this._progress.destroy(destroyChild);
	        this._bg = null;
	        this._bar = null;
	        this._progress = null;
	        this.changeHandler = null;
	    }
	    /**
	     * @inheritDoc
	     * @internal
	    */
	    /*override*/ createChildren() {
	        this.addChild(this._bg = new Image());
	        this.addChild(this._bar = new Button());
	    }
	    /**
	     * @inheritDoc
	     * @internal
	    */
	    /*override*/ initialize() {
	        this._bar.on(Laya.Event.MOUSE_DOWN, this, this.onBarMouseDown);
	        this._bg.sizeGrid = this._bar.sizeGrid = "4,4,4,4,0";
	        if (this._progress)
	            this._progress.sizeGrid = this._bar.sizeGrid;
	        this.allowClickBack = true;
	    }
	    /**
	     * @private
	     * 滑块的的 <code>Event.MOUSE_DOWN</code> 事件侦听处理函数。
	     */
	    onBarMouseDown(e) {
	        var Laya$1 = window.Laya;
	        this._globalSacle || (this._globalSacle = new Laya.Point());
	        this._globalSacle.setTo(this.globalScaleX || 0.01, this.globalScaleY || 0.01);
	        this._maxMove = this.isVertical ? (this.height - this._bar.height) : (this.width - this._bar.width);
	        this._tx = Laya$1.stage.mouseX;
	        this._ty = Laya$1.stage.mouseY;
	        Laya$1.stage.on(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
	        Laya$1.stage.once(Laya.Event.MOUSE_UP, this, this.mouseUp);
	        Laya$1.stage.once(Laya.Event.MOUSE_OUT, this, this.mouseUp);
	        //显示提示
	        this.showValueText();
	    }
	    /**
	     * @private
	     * 显示标签。
	     */
	    showValueText() {
	        if (this.showLabel) {
	            var label = Slider.label;
	            this.addChild(label);
	            label.textField.changeText(this._value + "");
	            if (this.isVertical) {
	                label.x = this._bar._x + 20;
	                label.y = (this._bar.height - label.height) * 0.5 + this._bar._y;
	            }
	            else {
	                label.y = this._bar._y - 20;
	                label.x = (this._bar.width - label.width) * 0.5 + this._bar._x;
	            }
	        }
	    }
	    /**
	     * @private
	     * 隐藏标签。
	     */
	    hideValueText() {
	        Slider.label && Slider.label.removeSelf();
	    }
	    /**
	     * @private
	     */
	    mouseUp(e) {
	        var Laya$1 = window.Laya;
	        Laya$1.stage.off(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
	        Laya$1.stage.off(Laya.Event.MOUSE_UP, this, this.mouseUp);
	        Laya$1.stage.off(Laya.Event.MOUSE_OUT, this, this.mouseUp);
	        this.sendChangeEvent(Laya.Event.CHANGED);
	        this.hideValueText();
	    }
	    /**
	     * @private
	     */
	    mouseMove(e) {
	        var Laya = window.Laya;
	        var oldValue = this._value;
	        if (this.isVertical) {
	            this._bar.y += (Laya.stage.mouseY - this._ty) / this._globalSacle.y;
	            if (this._bar._y > this._maxMove)
	                this._bar.y = this._maxMove;
	            else if (this._bar._y < 0)
	                this._bar.y = 0;
	            this._value = this._bar._y / this._maxMove * (this._max - this._min) + this._min;
	            if (this._progress)
	                this._progress.height = this._bar._y + 0.5 * this._bar.height;
	        }
	        else {
	            this._bar.x += (Laya.stage.mouseX - this._tx) / this._globalSacle.x;
	            if (this._bar._x > this._maxMove)
	                this._bar.x = this._maxMove;
	            else if (this._bar._x < 0)
	                this._bar.x = 0;
	            this._value = this._bar._x / this._maxMove * (this._max - this._min) + this._min;
	            if (this._progress)
	                this._progress.width = this._bar._x + 0.5 * this._bar.width;
	        }
	        this._tx = Laya.stage.mouseX;
	        this._ty = Laya.stage.mouseY;
	        if (this._tick != 0) {
	            var pow = Math.pow(10, (this._tick + "").length - 1);
	            this._value = Math.round(Math.round(this._value / this._tick) * this._tick * pow) / pow;
	        }
	        if (this._value != oldValue) {
	            this.sendChangeEvent();
	        }
	        this.showValueText();
	    }
	    /**
	     * @private
	     */
	    sendChangeEvent(type = Laya.Event.CHANGE) {
	        this.event(type);
	        this.changeHandler && this.changeHandler.runWith(this._value);
	    }
	    /**
	     * @copy laya.ui.Image#skin
	     */
	    get skin() {
	        return this._skin;
	    }
	    set skin(value) {
	        if (this._skin != value) {
	            this._skin = value;
	            if (this._skin && !Laya.Loader.getRes(this._skin)) {
	                window.Laya.loader.load([this._skin, this._skin.replace(".png", "$bar.png")], Laya.Handler.create(this, this._skinLoaded));
	            }
	            else {
	                this._skinLoaded();
	            }
	        }
	    }
	    _skinLoaded() {
	        this._bg.skin = this._skin;
	        this._bar.skin = this._skin.replace(".png", "$bar.png");
	        var progressSkin = this._skin.replace(".png", "$progress.png");
	        if (Laya.Loader.getRes(progressSkin)) {
	            if (!this._progress) {
	                this.addChild(this._progress = new Image());
	                this._progress.sizeGrid = this._bar.sizeGrid;
	                this.setChildIndex(this._progress, 1);
	            }
	            this._progress.skin = progressSkin;
	        }
	        this.setBarPoint();
	        this.callLater(this.changeValue);
	        this._sizeChanged();
	        this.event(Laya.Event.LOADED);
	    }
	    /**
	     * @private
	     * 设置滑块的位置信息。
	     */
	    setBarPoint() {
	        if (this.isVertical)
	            this._bar.x = Math.round((this._bg.width - this._bar.width) * 0.5);
	        else
	            this._bar.y = Math.round((this._bg.height - this._bar.height) * 0.5);
	    }
	    /**@inheritDoc @override*/
	    measureWidth() {
	        return Math.max(this._bg.width, this._bar.width);
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ measureHeight() {
	        return Math.max(this._bg.height, this._bar.height);
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ _sizeChanged() {
	        super._sizeChanged();
	        if (this.isVertical)
	            this._bg.height = this.height;
	        else
	            this._bg.width = this.width;
	        this.setBarPoint();
	        this.changeValue();
	    }
	    /**
	     * <p>当前实例的背景图（ <code>Image</code> ）和滑块按钮（ <code>Button</code> ）实例的有效缩放网格数据。</p>
	     * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
	     * <ul><li>例如："4,4,4,4,1"</li></ul></p>
	     * @see laya.ui.AutoBitmap.sizeGrid
	     */
	    get sizeGrid() {
	        return this._bg.sizeGrid;
	    }
	    set sizeGrid(value) {
	        this._bg.sizeGrid = value;
	        this._bar.sizeGrid = value;
	        if (this._progress)
	            this._progress.sizeGrid = this._bar.sizeGrid;
	    }
	    /**
	     * 设置滑动条的信息。
	     * @param min 滑块的最小值。
	     * @param max 滑块的最小值。
	     * @param value 滑块的当前值。
	     */
	    setSlider(min, max, value) {
	        this._value = -1;
	        this._min = min;
	        this._max = max > min ? max : min;
	        this.value = value < min ? min : value > max ? max : value;
	    }
	    /**
	     * 滑动的刻度值，滑动数值为tick的整数倍。默认值为1。
	     */
	    get tick() {
	        return this._tick;
	    }
	    set tick(value) {
	        if (this._tick != value) {
	            this._tick = value;
	            this.callLater(this.changeValue);
	        }
	    }
	    /**
	     * @private
	     * 改变滑块的位置值。
	     */
	    changeValue() {
	        if (this.tick != 0) {
	            var pow = Math.pow(10, (this._tick + "").length - 1);
	            this._value = Math.round(Math.round(this._value / this._tick) * this._tick * pow) / pow;
	        }
	        this._value = this._value > this._max ? this._max : this._value < this._min ? this._min : this._value;
	        var num = this._max - this._min;
	        if (num === 0)
	            num = 1;
	        if (this.isVertical) {
	            this._bar.y = (this._value - this._min) / num * (this.height - this._bar.height);
	            if (this._progress)
	                this._progress.height = this._bar._y + 0.5 * this._bar.height;
	        }
	        else {
	            this._bar.x = (this._value - this._min) / num * (this.width - this._bar.width);
	            if (this._progress)
	                this._progress.width = this._bar._x + 0.5 * this._bar.width;
	        }
	    }
	    /**
	     * 获取或设置表示最高位置的数字。 默认值为100。
	     */
	    get max() {
	        return this._max;
	    }
	    set max(value) {
	        if (this._max != value) {
	            this._max = value;
	            this.callLater(this.changeValue);
	        }
	    }
	    /**
	     * 获取或设置表示最低位置的数字。 默认值为0。
	     */
	    get min() {
	        return this._min;
	    }
	    set min(value) {
	        if (this._min != value) {
	            this._min = value;
	            this.callLater(this.changeValue);
	        }
	    }
	    /**
	     * 获取或设置表示当前滑块位置的数字。
	     */
	    get value() {
	        return this._value;
	    }
	    set value(num) {
	        if (this._value != num) {
	            var oldValue = this._value;
	            this._value = num;
	            this.changeValue();
	            if (this._value != oldValue) {
	                this.sendChangeEvent();
	            }
	        }
	    }
	    /**
	     * 一个布尔值，指定是否允许通过点击滑动条改变 <code>Slider</code> 的 <code>value</code> 属性值。
	     */
	    get allowClickBack() {
	        return this._allowClickBack;
	    }
	    set allowClickBack(value) {
	        if (this._allowClickBack != value) {
	            this._allowClickBack = value;
	            if (value)
	                this._bg.on(Laya.Event.MOUSE_DOWN, this, this.onBgMouseDown);
	            else
	                this._bg.off(Laya.Event.MOUSE_DOWN, this, this.onBgMouseDown);
	        }
	    }
	    /**
	     * @private
	     * 滑动条的 <code>Event.MOUSE_DOWN</code> 事件侦听处理函数。
	     */
	    onBgMouseDown(e) {
	        var point = this._bg.getMousePoint();
	        if (this.isVertical)
	            this.value = point.y / (this.height - this._bar.height) * (this._max - this._min) + this._min;
	        else
	            this.value = point.x / (this.width - this._bar.width) * (this._max - this._min) + this._min;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    set dataSource(value) {
	        this._dataSource = value;
	        if (typeof (value) == 'number' || typeof (value) == 'string')
	            this.value = Number(value);
	        else
	            super.dataSource = value;
	    }
	    get dataSource() {
	        return super.dataSource;
	    }
	    /**
	     * 表示滑块按钮的引用。
	     */
	    get bar() {
	        return this._bar;
	    }
	}
	/** @private 获取对 <code>Slider</code> 组件所包含的 <code>Label</code> 组件的引用。*/
	Slider.label = null; // new Label(); 静态的可能还没有初始化
	Laya.ILaya.regClass(Slider);
	Laya.ClassUtils.regClass("laya.ui.Slider", Slider);
	Laya.ClassUtils.regClass("Laya.Slider", Slider);

	/**
	 * 滚动条滑块位置发生变化后调度。
	 * @eventType laya.events.Event
	 */
	/*[Event(name = "change", type = "laya.events.Event")]*/
	/**
	 * 开始滑动。
	 * @eventType laya.events.Event
	 */
	/*[Event(name = "start", type = "laya.events.Event")]*/
	/**
	 * 结束滑动。
	 * @eventType laya.events.Event
	 */
	/*[Event(name = "end", type = "laya.events.Event")]*/
	/**
	 * <code>ScrollBar</code> 组件是一个滚动条组件。
	 * <p>当数据太多以至于显示区域无法容纳时，最终用户可以使用 <code>ScrollBar</code> 组件控制所显示的数据部分。</p>
	 * <p> 滚动条由四部分组成：两个箭头按钮、一个轨道和一个滑块。 </p>	 *
	 *
	 * @see laya.ui.VScrollBar
	 * @see laya.ui.HScrollBar
	 */
	class ScrollBar extends UIComponent {
	    /**
	     * 创建一个新的 <code>ScrollBar</code> 实例。
	     * @param skin 皮肤资源地址。
	     */
	    constructor(skin = null) {
	        super();
	        /**滚动衰减系数*/
	        this.rollRatio = 0.97;
	        /**是否缩放滑动条，默认值为true。 */
	        this.scaleBar = true;
	        /**一个布尔值，指定是否自动隐藏滚动条(无需滚动时)，默认值为false。*/
	        this.autoHide = false;
	        /**橡皮筋效果极限距离，0为没有橡皮筋效果。*/
	        this.elasticDistance = 0;
	        /**橡皮筋回弹时间，单位为毫秒。*/
	        this.elasticBackTime = 500;
	        /**@private */
	        this._showButtons = UIConfig.showButtons;
	        /**@private */
	        this._scrollSize = 1;
	        /**@private */
	        this._thumbPercent = 1;
	        /**@private */
	        this._lastOffset = 0;
	        /**@private */
	        this._checkElastic = false;
	        /**@private */
	        this._isElastic = false;
	        /**@private */
	        this._hide = false;
	        /**@private */
	        this._clickOnly = true;
	        /**@private */
	        this._touchScrollEnable = UIConfig.touchScrollEnable;
	        /**@private */
	        this._mouseWheelEnable = UIConfig.mouseWheelEnable;
	        this.skin = skin;
	        this.max = 1;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    destroy(destroyChild = true) {
	        this.stopScroll();
	        this.target = null;
	        super.destroy(destroyChild);
	        this.upButton && this.upButton.destroy(destroyChild);
	        this.downButton && this.downButton.destroy(destroyChild);
	        this.slider && this.slider.destroy(destroyChild);
	        this.upButton = this.downButton = null;
	        this.slider = null;
	        this.changeHandler = null;
	        this._offsets = null;
	    }
	    /**
	     * @internal
	    */
	    createChildren() {
	        this.addChild(this.slider = new Slider());
	        //TODO:
	        this.addChild(this.upButton = new Button());
	        this.addChild(this.downButton = new Button());
	    }
	    /**
	     * @internal
	    */
	    initialize() {
	        this.slider.showLabel = false;
	        this.slider.tick = 0;
	        this.slider.on(Laya.Event.CHANGE, this, this.onSliderChange);
	        this.slider.setSlider(0, 0, 0);
	        this.upButton.on(Laya.Event.MOUSE_DOWN, this, this.onButtonMouseDown);
	        this.downButton.on(Laya.Event.MOUSE_DOWN, this, this.onButtonMouseDown);
	    }
	    /**
	     * @private
	     * 滑块位置发生改变的处理函数。
	     */
	    onSliderChange() {
	        if (this._value != this.slider.value)
	            this.value = this.slider.value;
	    }
	    /**
	     * @private
	     * 向上和向下按钮的 <code>Event.MOUSE_DOWN</code> 事件侦听处理函数。
	     */
	    onButtonMouseDown(e) {
	        var Laya$1 = window.Laya;
	        var isUp = e.currentTarget === this.upButton;
	        this.slide(isUp);
	        Laya$1.timer.once(Styles.scrollBarDelayTime, this, this.startLoop, [isUp]);
	        Laya$1.stage.once(Laya.Event.MOUSE_UP, this, this.onStageMouseUp);
	    }
	    /**@private */
	    startLoop(isUp) {
	        window.Laya.timer.frameLoop(1, this, this.slide, [isUp]);
	    }
	    /**@private */
	    slide(isUp) {
	        if (isUp)
	            this.value -= this._scrollSize;
	        else
	            this.value += this._scrollSize;
	    }
	    /**
	     * @private
	     * 舞台的 <code>Event.MOUSE_DOWN</code> 事件侦听处理函数。
	     */
	    onStageMouseUp(e) {
	        var Laya = window.Laya;
	        Laya.timer.clear(this, this.startLoop);
	        Laya.timer.clear(this, this.slide);
	    }
	    /**
	     * @copy laya.ui.Image#skin
	     */
	    get skin() {
	        return this._skin;
	    }
	    set skin(value) {
	        if (value == " ")
	            return;
	        if (this._skin != value) {
	            this._skin = value;
	            if (this._skin && !Laya.Loader.getRes(this._skin)) {
	                window.Laya.loader.load([this._skin, this._skin.replace(".png", "$up.png"), this._skin.replace(".png", "$down.png"), this._skin.replace(".png", "$bar.png")], Laya.Handler.create(this, this._skinLoaded));
	            }
	            else {
	                this._skinLoaded();
	            }
	        }
	    }
	    _skinLoaded() {
	        this.slider.skin = this._skin;
	        this.callLater(this.changeScrollBar);
	        this._sizeChanged();
	        this.event(Laya.Event.LOADED);
	    }
	    /**
	     * @private
	     * 更改对象的皮肤及位置。
	     */
	    changeScrollBar() {
	        this.upButton.visible = this._showButtons;
	        this.downButton.visible = this._showButtons;
	        if (this._showButtons) {
	            this.upButton.skin = this._skin.replace(".png", "$up.png");
	            this.downButton.skin = this._skin.replace(".png", "$down.png");
	        }
	        if (this.slider.isVertical)
	            this.slider.y = this._showButtons ? this.upButton.height : 0;
	        else
	            this.slider.x = this._showButtons ? this.upButton.width : 0;
	        this.resetPositions();
	        this.repaint();
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    _sizeChanged() {
	        super._sizeChanged();
	        this.repaint();
	        this.resetPositions();
	        this.event(Laya.Event.CHANGE);
	        this.changeHandler && this.changeHandler.runWith(this.value);
	    }
	    /**@private */
	    resetPositions() {
	        if (this.slider.isVertical)
	            this.slider.height = this.height - (this._showButtons ? (this.upButton.height + this.downButton.height) : 0);
	        else
	            this.slider.width = this.width - (this._showButtons ? (this.upButton.width + this.downButton.width) : 0);
	        this.resetButtonPosition();
	    }
	    /**@private */
	    resetButtonPosition() {
	        if (this.slider.isVertical)
	            this.downButton.y = this.slider._y + this.slider.height;
	        else
	            this.downButton.x = this.slider._x + this.slider.width;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    measureWidth() {
	        if (this.slider.isVertical)
	            return this.slider.width;
	        return 100;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    measureHeight() {
	        if (this.slider.isVertical)
	            return 100;
	        return this.slider.height;
	    }
	    /**
	     * 设置滚动条信息。
	     * @param min 滚动条最小位置值。
	     * @param max 滚动条最大位置值。
	     * @param value 滚动条当前位置值。
	     */
	    setScroll(min, max, value) {
	        this.runCallLater(this._sizeChanged);
	        this.slider.setSlider(min, max, value);
	        //_upButton.disabled = max <= 0;
	        //_downButton.disabled = max <= 0;
	        this.slider.bar.visible = max > 0;
	        if (!this._hide && this.autoHide)
	            this.visible = false;
	    }
	    /**
	     * 获取或设置表示最高滚动位置的数字。
	     */
	    get max() {
	        return this.slider.max;
	    }
	    set max(value) {
	        this.slider.max = value;
	    }
	    /**
	     * 获取或设置表示最低滚动位置的数字。
	     */
	    get min() {
	        return this.slider.min;
	    }
	    set min(value) {
	        this.slider.min = value;
	    }
	    /**
	     * 获取或设置表示当前滚动位置的数字。
	     */
	    get value() {
	        return this._value;
	    }
	    set value(v) {
	        if (v !== this._value) {
	            this._value = v;
	            if (!this._isElastic) {
	                if (this.slider["_value"] != v) {
	                    this.slider["_value"] = v;
	                    this.slider.changeValue();
	                }
	                this._value = this.slider["_value"];
	            }
	            this.event(Laya.Event.CHANGE);
	            this.changeHandler && this.changeHandler.runWith(this._value);
	        }
	    }
	    /**
	     * 一个布尔值，指示滚动条是否为垂直滚动。如果值为true，则为垂直滚动，否则为水平滚动。
	     * <p>默认值为：true。</p>
	     */
	    get isVertical() {
	        return this.slider.isVertical;
	    }
	    set isVertical(value) {
	        this.slider.isVertical = value;
	    }
	    /**
	     * <p>当前实例的 <code>Slider</code> 实例的有效缩放网格数据。</p>
	     * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
	     * <ul><li>例如："4,4,4,4,1"</li></ul></p>
	     * @see laya.ui.AutoBitmap.sizeGrid
	     */
	    get sizeGrid() {
	        return this.slider.sizeGrid;
	    }
	    set sizeGrid(value) {
	        this.slider.sizeGrid = value;
	    }
	    /**获取或设置一个值，该值表示按下滚动条轨道时页面滚动的增量。 */
	    get scrollSize() {
	        return this._scrollSize;
	    }
	    set scrollSize(value) {
	        this._scrollSize = value;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    set dataSource(value) {
	        this._dataSource = value;
	        if (typeof (value) == 'number' || typeof (value) == 'string')
	            this.value = Number(value);
	        else
	            super.dataSource = value;
	    }
	    get dataSource() {
	        return super.dataSource;
	    }
	    /**获取或设置一个值，该值表示滑条长度比例，值为：（0-1）。 */
	    get thumbPercent() {
	        return this._thumbPercent;
	    }
	    set thumbPercent(value) {
	        this.runCallLater(this.changeScrollBar);
	        this.runCallLater(this._sizeChanged);
	        value = value >= 1 ? 0.99 : value;
	        this._thumbPercent = value;
	        if (this.scaleBar) {
	            if (this.slider.isVertical)
	                this.slider.bar.height = Math.max(this.slider.height * value, Styles.scrollBarMinNum);
	            else
	                this.slider.bar.width = Math.max(this.slider.width * value, Styles.scrollBarMinNum);
	        }
	    }
	    /**
	     * 设置滚动对象。
	     * @see laya.ui.TouchScroll#target
	     */
	    get target() {
	        return this._target;
	    }
	    set target(value) {
	        if (this._target) {
	            this._target.off(Laya.Event.MOUSE_WHEEL, this, this.onTargetMouseWheel);
	            this._target.off(Laya.Event.MOUSE_DOWN, this, this.onTargetMouseDown);
	        }
	        this._target = value;
	        if (value) {
	            this._mouseWheelEnable && this._target.on(Laya.Event.MOUSE_WHEEL, this, this.onTargetMouseWheel);
	            this._touchScrollEnable && this._target.on(Laya.Event.MOUSE_DOWN, this, this.onTargetMouseDown);
	        }
	    }
	    /**是否隐藏滚动条，不显示滚动条，但是可以正常滚动，默认为false。*/
	    get hide() {
	        return this._hide;
	    }
	    set hide(value) {
	        this._hide = value;
	        this.visible = !value;
	    }
	    /**一个布尔值，指定是否显示向上、向下按钮，默认值为true。*/
	    get showButtons() {
	        return this._showButtons;
	    }
	    set showButtons(value) {
	        this._showButtons = value;
	        this.callLater(this.changeScrollBar);
	    }
	    /**一个布尔值，指定是否开启触摸，默认值为true。*/
	    get touchScrollEnable() {
	        return this._touchScrollEnable;
	    }
	    set touchScrollEnable(value) {
	        this._touchScrollEnable = value;
	        this.target = this._target;
	    }
	    /** 一个布尔值，指定是否滑轮滚动，默认值为true。*/
	    get mouseWheelEnable() {
	        return this._mouseWheelEnable;
	    }
	    set mouseWheelEnable(value) {
	        this._mouseWheelEnable = value;
	        this.target = this._target;
	    }
	    /**@private */
	    onTargetMouseWheel(e) {
	        this.value -= e.delta * this._scrollSize;
	        this.target = this._target;
	    }
	    /**@private */
	    onTargetMouseDown(e) {
	        var Laya$1 = window.Laya;
	        if ((this.isLockedFun) && !this.isLockedFun(e))
	            return;
	        this.event(Laya.Event.END);
	        this._clickOnly = true;
	        this._lastOffset = 0;
	        this._checkElastic = false;
	        this._lastPoint || (this._lastPoint = new Laya.Point());
	        this._lastPoint.setTo(Laya$1.stage.mouseX, Laya$1.stage.mouseY);
	        Laya$1.timer.clear(this, this.tweenMove);
	        Laya.Tween.clearTween(this);
	        Laya$1.stage.once(Laya.Event.MOUSE_UP, this, this.onStageMouseUp2);
	        Laya$1.stage.once(Laya.Event.MOUSE_OUT, this, this.onStageMouseUp2);
	        Laya$1.timer.frameLoop(1, this, this.loop);
	    }
	    startDragForce() {
	        var Laya$1 = window.Laya;
	        this._clickOnly = true;
	        this._lastOffset = 0;
	        this._checkElastic = false;
	        this._lastPoint || (this._lastPoint = new Laya.Point());
	        this._lastPoint.setTo(Laya$1.stage.mouseX, Laya$1.stage.mouseY);
	        Laya$1.timer.clear(this, this.tweenMove);
	        Laya.Tween.clearTween(this);
	        Laya$1.stage.once(Laya.Event.MOUSE_UP, this, this.onStageMouseUp2);
	        Laya$1.stage.once(Laya.Event.MOUSE_OUT, this, this.onStageMouseUp2);
	        Laya$1.timer.frameLoop(1, this, this.loop);
	    }
	    cancelDragOp() {
	        var Laya$1 = window.Laya;
	        Laya$1.stage.off(Laya.Event.MOUSE_UP, this, this.onStageMouseUp2);
	        Laya$1.stage.off(Laya.Event.MOUSE_OUT, this, this.onStageMouseUp2);
	        Laya$1.timer.clear(this, this.tweenMove);
	        Laya$1.timer.clear(this, this.loop);
	        this._target.mouseEnabled = true;
	    }
	    checkTriggers(isTweenMove = false) {
	        if (this.value >= 0 && this.value - this._lastOffset <= 0) {
	            if ((this.triggerDownDragLimit) && this.triggerDownDragLimit(isTweenMove)) {
	                this.cancelDragOp();
	                this.value = 0;
	                return true;
	            }
	        }
	        if (this.value <= this.max && (this.value - this._lastOffset >= this.max)) {
	            if ((this.triggerUpDragLimit) && this.triggerUpDragLimit(isTweenMove)) {
	                this.cancelDragOp();
	                this.value = this.max;
	                return true;
	            }
	        }
	        return false;
	    }
	    get lastOffset() {
	        return this._lastOffset;
	    }
	    startTweenMoveForce(lastOffset) {
	        this._lastOffset = lastOffset;
	        window.Laya.timer.frameLoop(1, this, this.tweenMove, [200]);
	    }
	    /**@private */
	    loop() {
	        var Laya$1 = window.Laya;
	        var mouseY = Laya$1.stage.mouseY;
	        var mouseX = Laya$1.stage.mouseX;
	        this._lastOffset = this.isVertical ? (mouseY - this._lastPoint.y) : (mouseX - this._lastPoint.x);
	        if (this._clickOnly) {
	            if (Math.abs(this._lastOffset * (this.isVertical ? Laya$1.stage._canvasTransform.getScaleY() : Laya$1.stage._canvasTransform.getScaleX())) > 1) {
	                this._clickOnly = false;
	                if (this.checkTriggers())
	                    return;
	                this._offsets || (this._offsets = []);
	                this._offsets.length = 0;
	                this._target.mouseEnabled = false;
	                if (!this.hide && this.autoHide) {
	                    this.alpha = 1;
	                    this.visible = true;
	                }
	                this.event(Laya.Event.START);
	            }
	            else
	                return;
	        }
	        else {
	            if (this.checkTriggers())
	                return;
	        }
	        this._offsets.push(this._lastOffset);
	        this._lastPoint.x = mouseX;
	        this._lastPoint.y = mouseY;
	        if (this._lastOffset === 0)
	            return;
	        if (!this._checkElastic) {
	            if (this.elasticDistance > 0) {
	                if (!this._checkElastic && this._lastOffset != 0) {
	                    if ((this._lastOffset > 0 && this._value <= this.min) || (this._lastOffset < 0 && this._value >= this.max)) {
	                        this._isElastic = true;
	                        this._checkElastic = true;
	                    }
	                    else {
	                        this._isElastic = false;
	                    }
	                }
	            }
	            else {
	                this._checkElastic = true;
	            }
	        }
	        if (this._isElastic) {
	            if (this._value <= this.min) {
	                if (this._lastOffset > 0) {
	                    this.value -= this._lastOffset * Math.max(0, (1 - ((this.min - this._value) / this.elasticDistance)));
	                }
	                else {
	                    this.value -= this._lastOffset * 0.5;
	                    if (this._value >= this.min)
	                        this._checkElastic = false;
	                }
	            }
	            else if (this._value >= this.max) {
	                if (this._lastOffset < 0) {
	                    this.value -= this._lastOffset * Math.max(0, (1 - ((this._value - this.max) / this.elasticDistance)));
	                }
	                else {
	                    this.value -= this._lastOffset * 0.5;
	                    if (this._value <= this.max)
	                        this._checkElastic = false;
	                }
	            }
	        }
	        else {
	            this.value -= this._lastOffset;
	        }
	    }
	    /**@private */
	    onStageMouseUp2(e) {
	        var Laya$1 = window.Laya;
	        Laya$1.stage.off(Laya.Event.MOUSE_UP, this, this.onStageMouseUp2);
	        Laya$1.stage.off(Laya.Event.MOUSE_OUT, this, this.onStageMouseUp2);
	        Laya$1.timer.clear(this, this.loop);
	        if (this._clickOnly) {
	            if (this._value >= this.min && this._value <= this.max)
	                return;
	        }
	        this._target.mouseEnabled = true;
	        if (this._isElastic) {
	            if (this._value < this.min) {
	                Laya.Tween.to(this, { value: this.min }, this.elasticBackTime, Laya.Ease.sineOut, Laya.Handler.create(this, this.elasticOver));
	            }
	            else if (this._value > this.max) {
	                Laya.Tween.to(this, { value: this.max }, this.elasticBackTime, Laya.Ease.sineOut, Laya.Handler.create(this, this.elasticOver));
	            }
	        }
	        else {
	            if (!this._offsets)
	                return;
	            //计算平均值
	            if (this._offsets.length < 1) {
	                this._offsets[0] = this.isVertical ? Laya$1.stage.mouseY - this._lastPoint.y : Laya$1.stage.mouseX - this._lastPoint.x;
	            }
	            var offset = 0;
	            var n = Math.min(this._offsets.length, 3);
	            for (var i = 0; i < n; i++) {
	                offset += this._offsets[this._offsets.length - 1 - i];
	            }
	            this._lastOffset = offset / n;
	            offset = Math.abs(this._lastOffset);
	            if (offset < 2) {
	                this.event(Laya.Event.END);
	                return;
	            }
	            if (offset > 250)
	                this._lastOffset = this._lastOffset > 0 ? 250 : -250;
	            var dis = Math.round(Math.abs(this.elasticDistance * (this._lastOffset / 150)));
	            Laya$1.timer.frameLoop(1, this, this.tweenMove, [dis]);
	        }
	    }
	    /**@private */
	    elasticOver() {
	        this._isElastic = false;
	        if (!this.hide && this.autoHide) {
	            Laya.Tween.to(this, { alpha: 0 }, 500);
	        }
	        this.event(Laya.Event.END);
	    }
	    /**@private */
	    tweenMove(maxDistance) {
	        this._lastOffset *= this.rollRatio;
	        if (this.checkTriggers(true)) {
	            return;
	        }
	        var tarSpeed;
	        if (maxDistance > 0) {
	            if (this._lastOffset > 0 && this.value <= this.min) {
	                this._isElastic = true;
	                tarSpeed = -(this.min - maxDistance - this.value) * 0.5;
	                if (this._lastOffset > tarSpeed)
	                    this._lastOffset = tarSpeed;
	            }
	            else if (this._lastOffset < 0 && this.value >= this.max) {
	                this._isElastic = true;
	                tarSpeed = -(this.max + maxDistance - this.value) * 0.5;
	                if (this._lastOffset < tarSpeed)
	                    this._lastOffset = tarSpeed;
	            }
	        }
	        this.value -= this._lastOffset;
	        //if (Math.abs(_lastOffset) < 1 || value == max || value == min) 
	        if (Math.abs(this._lastOffset) < 0.1) {
	            window.Laya.timer.clear(this, this.tweenMove);
	            if (this._isElastic) {
	                if (this._value < this.min) {
	                    Laya.Tween.to(this, { value: this.min }, this.elasticBackTime, Laya.Ease.sineOut, Laya.Handler.create(this, this.elasticOver));
	                }
	                else if (this._value > this.max) {
	                    Laya.Tween.to(this, { value: this.max }, this.elasticBackTime, Laya.Ease.sineOut, Laya.Handler.create(this, this.elasticOver));
	                }
	                else {
	                    this.elasticOver();
	                }
	                return;
	            }
	            this.event(Laya.Event.END);
	            if (!this.hide && this.autoHide) {
	                Laya.Tween.to(this, { alpha: 0 }, 500);
	            }
	        }
	    }
	    /**
	     * 停止滑动。
	     */
	    stopScroll() {
	        this.onStageMouseUp2(null);
	        window.Laya.timer.clear(this, this.tweenMove);
	        Laya.Tween.clearTween(this);
	    }
	    /**
	     * 滚动的刻度值，滑动数值为tick的整数倍。默认值为1。
	     */
	    get tick() {
	        return this.slider.tick;
	    }
	    set tick(value) {
	        this.slider.tick = value;
	    }
	}
	Laya.ILaya.regClass(ScrollBar);
	Laya.ClassUtils.regClass("laya.ui.ScrollBar", ScrollBar);
	Laya.ClassUtils.regClass("Laya.ScrollBar", ScrollBar);

	/**
	     *
	     * 使用 <code>VScrollBar</code> （垂直 <code>ScrollBar</code> ）控件，可以在因数据太多而不能在显示区域完全显示时控制显示的数据部分。
	     *
	     * @example <caption>以下示例代码，创建了一个 <code>VScrollBar</code> 实例。</caption>
	     * package
	     *	{
	     *		import laya.ui.vScrollBar;
	     *		import laya.ui.VScrollBar;
	     *		import laya.utils.Handler;
	     *		public class VScrollBar_Example
	     *		{
	     *			private var vScrollBar:VScrollBar;
	     *			public function VScrollBar_Example()
	     *			{
	     *				Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
	     *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	     *				Laya.loader.load(["resource/ui/vscroll.png", "resource/ui/vscroll$bar.png", "resource/ui/vscroll$down.png", "resource/ui/vscroll$up.png"], Handler.create(this, onLoadComplete));
	     *			}
	     *			private function onLoadComplete():void
	     *			{
	     *				vScrollBar = new VScrollBar();//创建一个 vScrollBar 类的实例对象 hScrollBar 。
	     *				vScrollBar.skin = "resource/ui/vscroll.png";//设置 vScrollBar 的皮肤。
	     *				vScrollBar.x = 100;//设置 vScrollBar 对象的属性 x 的值，用于控制 vScrollBar 对象的显示位置。
	     *				vScrollBar.y = 100;//设置 vScrollBar 对象的属性 y 的值，用于控制 vScrollBar 对象的显示位置。
	     *				vScrollBar.changeHandler = new Handler(this, onChange);//设置 vScrollBar 的滚动变化处理器。
	     *				Laya.stage.addChild(vScrollBar);//将此 vScrollBar 对象添加到显示列表。
	     *			}
	     *			private function onChange(value:Number):void
	     *			{
	     *				trace("滚动条的位置： value=" + value);
	     *			}
	     *		}
	     *	}
	     * @example
	     * Laya.init(640, 800);//设置游戏画布宽高
	     * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
	     * var vScrollBar;
	     * var res = ["resource/ui/vscroll.png", "resource/ui/vscroll$bar.png", "resource/ui/vscroll$down.png", "resource/ui/vscroll$up.png"];
	     * Laya.loader.load(res, laya.utils.Handler.create(this, onLoadComplete));//加载资源。
	     * function onLoadComplete() {
	     *     vScrollBar = new laya.ui.VScrollBar();//创建一个 vScrollBar 类的实例对象 hScrollBar 。
	     *     vScrollBar.skin = "resource/ui/vscroll.png";//设置 vScrollBar 的皮肤。
	     *     vScrollBar.x = 100;//设置 vScrollBar 对象的属性 x 的值，用于控制 vScrollBar 对象的显示位置。
	     *     vScrollBar.y = 100;//设置 vScrollBar 对象的属性 y 的值，用于控制 vScrollBar 对象的显示位置。
	     *     vScrollBar.changeHandler = new laya.utils.Handler(this, onChange);//设置 vScrollBar 的滚动变化处理器。
	     *     Laya.stage.addChild(vScrollBar);//将此 vScrollBar 对象添加到显示列表。
	     * }
	     * function onChange(value) {
	     *     console.log("滚动条的位置： value=" + value);
	     * }
	     * @example
	     * import VScrollBar = laya.ui.VScrollBar;
	     * import Handler = laya.utils.Handler;
	     * class VScrollBar_Example {
	     *     private vScrollBar: VScrollBar;
	     *     constructor() {
	     *         Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
	     *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	     *         Laya.loader.load(["resource/ui/vscroll.png", "resource/ui/vscroll$bar.png", "resource/ui/vscroll$down.png", "resource/ui/vscroll$up.png"], Handler.create(this, this.onLoadComplete));
	     *     }
	     *     private onLoadComplete(): void {
	     *         this.vScrollBar = new VScrollBar();//创建一个 vScrollBar 类的实例对象 hScrollBar 。
	     *         this.vScrollBar.skin = "resource/ui/vscroll.png";//设置 vScrollBar 的皮肤。
	     *         this.vScrollBar.x = 100;//设置 vScrollBar 对象的属性 x 的值，用于控制 vScrollBar 对象的显示位置。
	     *         this.vScrollBar.y = 100;//设置 vScrollBar 对象的属性 y 的值，用于控制 vScrollBar 对象的显示位置。
	     *         this.vScrollBar.changeHandler = new Handler(this, this.onChange);//设置 vScrollBar 的滚动变化处理器。
	     *         Laya.stage.addChild(this.vScrollBar);//将此 vScrollBar 对象添加到显示列表。
	     *     }
	     *     private onChange(value: number): void {
	     *         console.log("滚动条的位置： value=" + value);
	     *     }
	     * }
	     */
	class VScrollBar extends ScrollBar {
	}
	Laya.ILaya.regClass(VScrollBar);
	Laya.ClassUtils.regClass("laya.ui.VScrollBar", VScrollBar);
	Laya.ClassUtils.regClass("Laya.VScrollBar", VScrollBar);

	/**
	     * 使用 <code>HScrollBar</code> （水平 <code>ScrollBar</code> ）控件，可以在因数据太多而不能在显示区域完全显示时控制显示的数据部分。
	     * @example <caption>以下示例代码，创建了一个 <code>HScrollBar</code> 实例。</caption>
	     * package
	     *	{
	     *		import laya.ui.HScrollBar;
	     *		import laya.utils.Handler;
	     *		public class HScrollBar_Example
	     *		{
	     *			private var hScrollBar:HScrollBar;
	     *			public function HScrollBar_Example()
	     *			{
	     *				Laya.init(640, 800);//设置游戏画布宽高。
	     *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	     *				Laya.loader.load(["resource/ui/hscroll.png", "resource/ui/hscroll$bar.png", "resource/ui/hscroll$down.png", "resource/ui/hscroll$up.png"], Handler.create(this, onLoadComplete));//加载资源。
	     *			}
	     *			private function onLoadComplete():void
	     *			{
	     *				hScrollBar = new HScrollBar();//创建一个 HScrollBar 类的实例对象 hScrollBar 。
	     *				hScrollBar.skin = "resource/ui/hscroll.png";//设置 hScrollBar 的皮肤。
	     *				hScrollBar.x = 100;//设置 hScrollBar 对象的属性 x 的值，用于控制 hScrollBar 对象的显示位置。
	     *				hScrollBar.y = 100;//设置 hScrollBar 对象的属性 y 的值，用于控制 hScrollBar 对象的显示位置。
	     *				hScrollBar.changeHandler = new Handler(this, onChange);//设置 hScrollBar 的滚动变化处理器。
	     *				Laya.stage.addChild(hScrollBar);//将此 hScrollBar 对象添加到显示列表。
	     *			}
	     *			private function onChange(value:Number):void
	     *			{
	     *				trace("滚动条的位置： value=" + value);
	     *			}
	     *		}
	     *	}
	     * @example
	     * Laya.init(640, 800);//设置游戏画布宽高
	     * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
	     * var hScrollBar;
	     * var res  = ["resource/ui/hscroll.png", "resource/ui/hscroll$bar.png", "resource/ui/hscroll$down.png", "resource/ui/hscroll$up.png"];
	     * Laya.loader.load(res,laya.utils.Handler.create(this, onLoadComplete));//加载资源。
	     * function onLoadComplete() {
	     *     console.log("资源加载完成！");
	     *     hScrollBar = new laya.ui.HScrollBar();//创建一个 HScrollBar 类的实例对象 hScrollBar 。
	     *     hScrollBar.skin = "resource/ui/hscroll.png";//设置 hScrollBar 的皮肤。
	     *     hScrollBar.x = 100;//设置 hScrollBar 对象的属性 x 的值，用于控制 hScrollBar 对象的显示位置。
	     *     hScrollBar.y = 100;//设置 hScrollBar 对象的属性 y 的值，用于控制 hScrollBar 对象的显示位置。
	     *     hScrollBar.changeHandler = new laya.utils.Handler(this, onChange);//设置 hScrollBar 的滚动变化处理器。
	     *     Laya.stage.addChild(hScrollBar);//将此 hScrollBar 对象添加到显示列表。
	     * }
	     * function onChange(value)
	     * {
	     *     console.log("滚动条的位置： value=" + value);
	     * }
	     * @example
	     * import HScrollBar = laya.ui.HScrollBar;
	     * import Handler = laya.utils.Handler;
	     * class HScrollBar_Example {
	     *     private hScrollBar: HScrollBar;
	     *     constructor() {
	     *         Laya.init(640, 800);//设置游戏画布宽高。
	     *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	     *         Laya.loader.load(["resource/ui/hscroll.png", "resource/ui/hscroll$bar.png", "resource/ui/hscroll$down.png", "resource/ui/hscroll$up.png"], Handler.create(this, this.onLoadComplete));//加载资源。
	     *     }
	     *     private onLoadComplete(): void {
	     *         this.hScrollBar = new HScrollBar();//创建一个 HScrollBar 类的实例对象 hScrollBar 。
	     *         this.hScrollBar.skin = "resource/ui/hscroll.png";//设置 hScrollBar 的皮肤。
	     *         this.hScrollBar.x = 100;//设置 hScrollBar 对象的属性 x 的值，用于控制 hScrollBar 对象的显示位置。
	     *         this.hScrollBar.y = 100;//设置 hScrollBar 对象的属性 y 的值，用于控制 hScrollBar 对象的显示位置。
	     *         this.hScrollBar.changeHandler = new Handler(this, this.onChange);//设置 hScrollBar 的滚动变化处理器。
	     *         Laya.stage.addChild(this.hScrollBar);//将此 hScrollBar 对象添加到显示列表。
	     *     }
	     *     private onChange(value: number): void {
	     *         console.log("滚动条的位置： value=" + value);
	     *     }
	     * }
	     */
	class HScrollBar extends ScrollBar {
	    /**
	     * @inheritDoc
	     * @internal
	     */
	    initialize() {
	        super.initialize();
	        this.slider.isVertical = false;
	    }
	}
	Laya.ILaya.regClass(HScrollBar);
	Laya.ClassUtils.regClass("laya.ui.HScrollBar", HScrollBar);
	Laya.ClassUtils.regClass("Laya.HScrollBar", HScrollBar);

	/**
	 * 当对象的 <code>selectedIndex</code> 属性发生变化时调度。
	 * @eventType laya.events.Event
	 */
	/*[Event(name = "change", type = "laya.events.Event")]*/
	/**
	 * 渲染列表的单元项对象时调度。
	 * @eventType Event.RENDER
	 */
	/*[Event(name = "render", type = "laya.events.Event")]*/
	/**
	 * <code>List</code> 控件可显示项目列表。默认为垂直方向列表。可通过UI编辑器自定义列表。
	 *
	 * @example <caption>以下示例代码，创建了一个 <code>List</code> 实例。</caption>
	 * package
	 *	{
	 *		import laya.ui.List;
	 *		import laya.utils.Handler;
	 *		public class List_Example
	 *		{
	 *			public function List_Example()
	 *			{
	 *				Laya.init(640, 800, "false");//设置游戏画布宽高、渲染模式。
	 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *				Laya.loader.load(["resource/ui/vscroll.png", "resource/ui/vscroll$bar.png", "resource/ui/vscroll$down.png", "resource/ui/vscroll$up.png"], Handler.create(this, onLoadComplete));
	 *			}
	 *			private function onLoadComplete():void
	 *			{
	 *				var arr:Array = [];//创建一个数组，用于存贮列表的数据信息。
	 *				for (var i:int = 0; i &lt; 20; i++)
	 *				{
	 *					arr.push({label: "item" + i});
	 *				}
	 *				var list:List = new List();//创建一个 List 类的实例对象 list 。
	 *				list.itemRender = Item;//设置 list 的单元格渲染器。
	 *				list.repeatX = 1;//设置 list 的水平方向单元格数量。
	 *				list.repeatY = 10;//设置 list 的垂直方向单元格数量。
	 *				list.vScrollBarSkin = "resource/ui/vscroll.png";//设置 list 的垂直方向滚动条皮肤。
	 *				list.array = arr;//设置 list 的列表数据源。
	 *				list.pos(100, 100);//设置 list 的位置。
	 *				list.selectEnable = true;//设置 list 可选。
	 *				list.selectHandler = new Handler(this, onSelect);//设置 list 改变选择项执行的处理器。
	 *				Laya.stage.addChild(list);//将 list 添加到显示列表。
	 *			}
	 *			private function onSelect(index:int):void
	 *			{
	 *				trace("当前选择的项目索引： index= ", index);
	 *			}
	 *		}
	 *	}
	 *	import laya.ui.Box;
	 *	import laya.ui.Label;
	 *	class Item extends Box
	 *	{
	 *		public function Item()
	 *		{
	 *			graphics.drawRect(0, 0, 100, 20,null, "#ff0000");
	 *			var label:Label = new Label();
	 *			label.text = "100000";
	 *			label.name = "label";//设置 label 的name属性值。
	 *			label.size(100, 20);
	 *			addChild(label);
	 *		}
	 *	}
	 * @example
	 * (function (_super){
	 *     function Item(){
	 *         Item.__super.call(this);//初始化父类
	 *         this.graphics.drawRect(0, 0, 100, 20, "#ff0000");
	 *         var label = new laya.ui.Label();//创建一个 Label 类的实例对象 label 。
	 *         label.text = "100000";//设置 label 的文本内容。
	 *         label.name = "label";//设置 label 的name属性值。
	 *         label.size(100, 20);//设置 label 的宽度、高度。
	 *         this.addChild(label);//将 label 添加到显示列表。
	 *     };
	 *     Laya.class(Item,"mypackage.listExample.Item",_super);//注册类 Item 。
	 * })(laya.ui.Box);
	    
	 * Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
	 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 * var res = ["resource/ui/vscroll.png", "resource/ui/vscroll$bar.png", "resource/ui/vscroll$down.png", "resource/ui/vscroll$up.png"];
	 * Laya.loader.load(res, new laya.utils.Handler(this, onLoadComplete));//加载资源。
	    
	 * function onLoadComplete() {
	 *     var arr = [];//创建一个数组，用于存贮列表的数据信息。
	 *     for (var i = 0; i &lt; 20; i++) {
	 *         arr.push({label: "item" + i});
	 *     }
	    
	 *     var list = new laya.ui.List();//创建一个 List 类的实例对象 list 。
	 *     list.itemRender = mypackage.listExample.Item;//设置 list 的单元格渲染器。
	 *     list.repeatX = 1;//设置 list 的水平方向单元格数量。
	 *     list.repeatY = 10;//设置 list 的垂直方向单元格数量。
	 *     list.vScrollBarSkin = "resource/ui/vscroll.png";//设置 list 的垂直方向滚动条皮肤。
	 *     list.array = arr;//设置 list 的列表数据源。
	 *     list.pos(100, 100);//设置 list 的位置。
	 *     list.selectEnable = true;//设置 list 可选。
	 *     list.selectHandler = new laya.utils.Handler(this, onSelect);//设置 list 改变选择项执行的处理器。
	 *     Laya.stage.addChild(list);//将 list 添加到显示列表。
	 * }
	    
	 * function onSelect(index)
	 * {
	 *     console.log("当前选择的项目索引： index= ", index);
	 * }
	 *
	 * @example
	 * import List = laya.ui.List;
	 * import Handler = laya.utils.Handler;
	 * public class List_Example {
	 *     public List_Example() {
	 *         Laya.init(640, 800);//设置游戏画布宽高。
	 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *         Laya.loader.load(["resource/ui/vscroll.png", "resource/ui/vscroll$bar.png", "resource/ui/vscroll$down.png", "resource/ui/vscroll$up.png"], Handler.create(this, this.onLoadComplete));
	 *     }
	 *     private onLoadComplete(): void {
	 *         var arr= [];//创建一个数组，用于存贮列表的数据信息。
	 *         for (var i: number = 0; i &lt; 20; i++)
	 *         {
	 *             arr.push({ label: "item" + i });
	 *         }
	 *         var list: List = new List();//创建一个 List 类的实例对象 list 。
	 *         list.itemRender = Item;//设置 list 的单元格渲染器。
	 *         list.repeatX = 1;//设置 list 的水平方向单元格数量。
	 *         list.repeatY = 10;//设置 list 的垂直方向单元格数量。
	 *         list.vScrollBarSkin = "resource/ui/vscroll.png";//设置 list 的垂直方向滚动条皮肤。
	 *         list.array = arr;//设置 list 的列表数据源。
	 *         list.pos(100, 100);//设置 list 的位置。
	 *         list.selectEnable = true;//设置 list 可选。
	 *         list.selectHandler = new Handler(this, this.onSelect);//设置 list 改变选择项执行的处理器。
	 *         Laya.stage.addChild(list);//将 list 添加到显示列表。
	 *     }
	 *     private onSelect(index: number): void {
	 *         console.log("当前选择的项目索引： index= ", index);
	 *     }
	 * }
	 * import Box = laya.ui.Box;
	 * import Label = laya.ui.Label;
	 * class Item extends Box {
	 *     constructor() {
	 *         this.graphics.drawRect(0, 0, 100, 20, null, "#ff0000");
	 *         var label: Label = new Label();
	 *         label.text = "100000";
	 *         label.name = "label";//设置 label 的name属性值。
	 *         label.size(100, 20);
	 *         this.addChild(label);
	 *     }
	 * }
	 */
	class List extends Box {
	    constructor() {
	        super(...arguments);
	        /**指定是否可以选择，若值为true则可以选择，否则不可以选择。 @default false*/
	        this.selectEnable = false;
	        /**最大分页数。*/
	        this.totalPage = 0;
	        /**@internal */
	        this._$componentType = "List";
	        /**@private */
	        this._repeatX = 0;
	        /**@private */
	        this._repeatY = 0;
	        /**@private */
	        this._repeatX2 = 0;
	        /**@private */
	        this._repeatY2 = 0;
	        /**@private */
	        this._spaceX = 0;
	        /**@private */
	        this._spaceY = 0;
	        /**@private */
	        this._cells = [];
	        /**@private */
	        this._startIndex = 0;
	        /**@private */
	        this._selectedIndex = -1;
	        /**@private */
	        this._page = 0;
	        /**@private */
	        this._isVertical = true;
	        /**@private */
	        this._cellSize = 20;
	        /**@private */
	        this._cellOffset = 0;
	        /**@private */
	        this._createdLine = 0;
	        /**@private */
	        this._offset = new Laya.Point();
	        /**@private */
	        this._usedCache = null;
	        /**@private */
	        this._elasticEnabled = false;
	        this._preLen = 0;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ destroy(destroyChild = true) {
	        this._content && this._content.destroy(destroyChild);
	        this._scrollBar && this._scrollBar.destroy(destroyChild);
	        super.destroy(destroyChild);
	        this._content = null;
	        this._scrollBar = null;
	        this._itemRender = null;
	        this._cells = null;
	        this._array = null;
	        this.selectHandler = this.renderHandler = this.mouseHandler = null;
	    }
	    /**
	     * @inheritDoc
	     * @internal
	     */
	    createChildren() {
	        this.addChild(this._content = new Box());
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ set cacheAs(value) {
	        super.cacheAs = value;
	        if (this._scrollBar) {
	            this._usedCache = null;
	            if (value !== "none")
	                this._scrollBar.on(Laya.Event.START, this, this.onScrollStart);
	            else
	                this._scrollBar.off(Laya.Event.START, this, this.onScrollStart);
	        }
	    }
	    get cacheAs() {
	        return super.cacheAs;
	    }
	    onScrollStart() {
	        this._usedCache || (this._usedCache = super.cacheAs);
	        super.cacheAs = "none";
	        this._scrollBar.once(Laya.Event.END, this, this.onScrollEnd);
	    }
	    onScrollEnd() {
	        super.cacheAs = this._usedCache;
	    }
	    /**
	     * 获取对 <code>List</code> 组件所包含的内容容器 <code>Box</code> 组件的引用。
	     */
	    get content() {
	        return this._content;
	    }
	    /**
	     * 垂直方向滚动条皮肤。
	     */
	    get vScrollBarSkin() {
	        return this._scrollBar ? this._scrollBar.skin : null;
	    }
	    set vScrollBarSkin(value) {
	        this._removePreScrollBar();
	        var scrollBar = new VScrollBar();
	        scrollBar.name = "scrollBar";
	        scrollBar.right = 0;
	        scrollBar.skin = value;
	        scrollBar.elasticDistance = this._elasticEnabled ? 200 : 0;
	        this.scrollBar = scrollBar;
	        this.addChild(scrollBar);
	        this._setCellChanged();
	    }
	    _removePreScrollBar() {
	        var preNode = this.removeChildByName("scrollBar");
	        if (preNode)
	            preNode.destroy(true);
	    }
	    /**
	     * 水平方向滚动条皮肤。
	     */
	    get hScrollBarSkin() {
	        return this._scrollBar ? this._scrollBar.skin : null;
	    }
	    set hScrollBarSkin(value) {
	        this._removePreScrollBar();
	        var scrollBar = new HScrollBar();
	        scrollBar.name = "scrollBar";
	        scrollBar.bottom = 0;
	        scrollBar.skin = value;
	        scrollBar.elasticDistance = this._elasticEnabled ? 200 : 0;
	        this.scrollBar = scrollBar;
	        this.addChild(scrollBar);
	        this._setCellChanged();
	    }
	    /**
	     * 获取对 <code>List</code> 组件所包含的滚动条 <code>ScrollBar</code> 组件的引用。
	     */
	    get scrollBar() {
	        return this._scrollBar;
	    }
	    set scrollBar(value) {
	        if (this._scrollBar != value) {
	            this._scrollBar = value;
	            if (value) {
	                this._isVertical = this._scrollBar.isVertical;
	                this.addChild(this._scrollBar);
	                this._scrollBar.on(Laya.Event.CHANGE, this, this.onScrollBarChange);
	            }
	        }
	    }
	    /**
	     * 单元格渲染器。
	     * <p><b>取值：</b>
	     * <ol>
	     * <li>单元格类对象。</li>
	     * <li> UI 的 JSON 描述。</li>
	     * </ol></p>
	     * @implements
	     */
	    get itemRender() {
	        return this._itemRender;
	    }
	    set itemRender(value) {
	        if (this._itemRender != value) {
	            this._itemRender = value;
	            //销毁老单元格
	            for (var i = this._cells.length - 1; i > -1; i--) {
	                this._cells[i].destroy();
	            }
	            this._cells.length = 0;
	            this._setCellChanged();
	        }
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ set width(value) {
	        if (value != this._width) {
	            super.width = value;
	            this._setCellChanged();
	        }
	    }
	    get width() {
	        return super.width;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ set height(value) {
	        if (value != this._height) {
	            super.height = value;
	            this._setCellChanged();
	        }
	    }
	    get height() {
	        return super.height;
	    }
	    /**
	     * 水平方向显示的单元格数量。
	     */
	    get repeatX() {
	        return this._repeatX > 0 ? this._repeatX : this._repeatX2 > 0 ? this._repeatX2 : 1;
	    }
	    set repeatX(value) {
	        this._repeatX = value;
	        this._setCellChanged();
	    }
	    /**
	     * 垂直方向显示的单元格数量。
	     */
	    get repeatY() {
	        return this._repeatY > 0 ? this._repeatY : this._repeatY2 > 0 ? this._repeatY2 : 1;
	    }
	    set repeatY(value) {
	        this._repeatY = value;
	        this._setCellChanged();
	    }
	    /**
	     * 水平方向显示的单元格之间的间距（以像素为单位）。
	     */
	    get spaceX() {
	        return this._spaceX;
	    }
	    set spaceX(value) {
	        this._spaceX = value;
	        this._setCellChanged();
	    }
	    /**
	     * 垂直方向显示的单元格之间的间距（以像素为单位）。
	     */
	    get spaceY() {
	        return this._spaceY;
	    }
	    set spaceY(value) {
	        this._spaceY = value;
	        this._setCellChanged();
	    }
	    /**
	     * @private
	     * 更改单元格的信息。
	     * @internal 在此销毁、创建单元格，并设置单元格的位置等属性。相当于此列表内容发送改变时调用此函数。
	     */
	    changeCells() {
	        this._cellChanged = false;
	        if (this._itemRender) {
	            //获取滚动条
	            this.scrollBar = this.getChildByName("scrollBar");
	            //自适应宽高				
	            var cell = this._getOneCell();
	            var cellWidth = (cell.width + this._spaceX) || 1;
	            var cellHeight = (cell.height + this._spaceY) || 1;
	            if (this._width > 0)
	                this._repeatX2 = this._isVertical ? Math.round(this._width / cellWidth) : Math.ceil(this._width / cellWidth);
	            if (this._height > 0)
	                this._repeatY2 = this._isVertical ? Math.ceil(this._height / cellHeight) : Math.round(this._height / cellHeight);
	            var listWidth = this._width ? this._width : (cellWidth * this.repeatX - this._spaceX);
	            var listHeight = this._height ? this._height : (cellHeight * this.repeatY - this._spaceY);
	            this._cellSize = this._isVertical ? cellHeight : cellWidth;
	            this._cellOffset = this._isVertical ? (cellHeight * Math.max(this._repeatY2, this._repeatY) - listHeight - this._spaceY) : (cellWidth * Math.max(this._repeatX2, this._repeatX) - listWidth - this._spaceX);
	            if (this._isVertical && this.vScrollBarSkin)
	                this._scrollBar.height = listHeight;
	            else if (!this._isVertical && this.hScrollBarSkin)
	                this._scrollBar.width = listWidth;
	            this.setContentSize(listWidth, listHeight);
	            //创建新单元格				
	            var numX = this._isVertical ? this.repeatX : this.repeatY;
	            var numY = (this._isVertical ? this.repeatY : this.repeatX) + (this._scrollBar ? 1 : 0);
	            this._createItems(0, numX, numY);
	            this._createdLine = numY;
	            if (this._array) {
	                this.array = this._array;
	                this.runCallLater(this.renderItems);
	            }
	        }
	    }
	    _getOneCell() {
	        if (this._cells.length === 0) {
	            var item = this.createItem();
	            this._offset.setTo(item._x, item._y);
	            if (this.cacheContent)
	                return item;
	            this._cells.push(item);
	        }
	        return this._cells[0];
	    }
	    _createItems(startY, numX, numY) {
	        var box = this._content;
	        var cell = this._getOneCell();
	        var cellWidth = cell.width + this._spaceX;
	        var cellHeight = cell.height + this._spaceY;
	        if (this.cacheContent) {
	            var cacheBox = new Box();
	            cacheBox.cacheAs = "normal";
	            cacheBox.pos((this._isVertical ? 0 : startY) * cellWidth, (this._isVertical ? startY : 0) * cellHeight);
	            this._content.addChild(cacheBox);
	            box = cacheBox;
	        }
	        else {
	            var arr = [];
	            for (var i = this._cells.length - 1; i > -1; i--) {
	                var item = this._cells[i];
	                item.removeSelf();
	                arr.push(item);
	            }
	            this._cells.length = 0;
	        }
	        for (var k = startY; k < numY; k++) {
	            for (var l = 0; l < numX; l++) {
	                if (arr && arr.length) {
	                    cell = arr.pop();
	                }
	                else {
	                    cell = this.createItem();
	                }
	                cell.x = (this._isVertical ? l : k) * cellWidth - box._x;
	                cell.y = (this._isVertical ? k : l) * cellHeight - box._y;
	                cell.name = "item" + (k * numX + l);
	                box.addChild(cell);
	                this.addCell(cell);
	            }
	        }
	    }
	    createItem() {
	        var arr = [];
	        if (typeof (this._itemRender) == "function") { //TODO:
	            var box = new this._itemRender();
	        }
	        else {
	            //box = View.createComp(_itemRender, null, null, arr)
	            box = Laya.SceneUtils.createComp(this._itemRender, null, null, arr);
	        }
	        if (arr.length == 0 && box["_watchMap"]) {
	            var watchMap = box["_watchMap"];
	            for (var name in watchMap) {
	                var a = watchMap[name];
	                for (var i = 0; i < a.length; i++) {
	                    var watcher = a[i];
	                    arr.push(watcher.comp, watcher.prop, watcher.value);
	                }
	            }
	        }
	        if (arr.length)
	            box["_$bindData"] = arr;
	        return box;
	    }
	    /**
	     * @private
	     * 添加单元格。
	     * @param cell 需要添加的单元格对象。
	     */
	    addCell(cell) {
	        cell.on(Laya.Event.CLICK, this, this.onCellMouse);
	        cell.on(Laya.Event.RIGHT_CLICK, this, this.onCellMouse);
	        cell.on(Laya.Event.MOUSE_OVER, this, this.onCellMouse);
	        cell.on(Laya.Event.MOUSE_OUT, this, this.onCellMouse);
	        cell.on(Laya.Event.MOUSE_DOWN, this, this.onCellMouse);
	        cell.on(Laya.Event.MOUSE_UP, this, this.onCellMouse);
	        this._cells.push(cell);
	    }
	    /**@internal */
	    _afterInited() {
	        this.initItems();
	    }
	    /**
	     * 初始化单元格信息。
	     */
	    initItems() {
	        if (!this._itemRender && this.getChildByName("item0") != null) {
	            this.repeatX = 1;
	            var count;
	            count = 0;
	            for (var i = 0; i < 10000; i++) {
	                var cell = this.getChildByName("item" + i);
	                if (cell) {
	                    this.addCell(cell);
	                    count++;
	                    continue;
	                }
	                break;
	            }
	            this.repeatY = count;
	        }
	    }
	    /**
	     * 设置可视区域大小。
	     * <p>以（0，0，width参数，height参数）组成的矩形区域为可视区域。</p>
	     * @param width 可视区域宽度。
	     * @param height 可视区域高度。
	     */
	    setContentSize(width, height) {
	        this._content.width = width;
	        this._content.height = height;
	        if (this._scrollBar || this._offset.x != 0 || this._offset.y != 0) {
	            this._content._style.scrollRect || (this._content.scrollRect = Laya.Rectangle.create());
	            this._content._style.scrollRect.setTo(-this._offset.x, -this._offset.y, width, height);
	            this._content.scrollRect = this._content.scrollRect;
	        }
	        this.event(Laya.Event.RESIZE);
	    }
	    /**
	     * @private
	     * 单元格的鼠标事件侦听处理函数。
	     */
	    onCellMouse(e) {
	        if (e.type === Laya.Event.MOUSE_DOWN)
	            this._isMoved = false;
	        var cell = e.currentTarget;
	        var index = this._startIndex + this._cells.indexOf(cell);
	        if (index < 0)
	            return;
	        if (e.type === Laya.Event.CLICK || e.type === Laya.Event.RIGHT_CLICK) {
	            if (this.selectEnable && !this._isMoved)
	                this.selectedIndex = index;
	            else
	                this.changeCellState(cell, true, 0);
	        }
	        else if ((e.type === Laya.Event.MOUSE_OVER || e.type === Laya.Event.MOUSE_OUT) && this._selectedIndex !== index) {
	            this.changeCellState(cell, e.type === Laya.Event.MOUSE_OVER, 0);
	        }
	        this.mouseHandler && this.mouseHandler.runWith([e, index]);
	    }
	    /**
	     * @private
	     * 改变单元格的可视状态。
	     * @param cell 单元格对象。
	     * @param visable 是否显示。
	     * @param index 单元格的属性 <code>index</code> 值。
	     */
	    changeCellState(cell, visible, index) {
	        var selectBox = cell.getChildByName("selectBox");
	        if (selectBox) {
	            this.selectEnable = true;
	            selectBox.visible = visible;
	            selectBox.index = index;
	        }
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ _sizeChanged() {
	        super._sizeChanged();
	        this.setContentSize(this.width, this.height);
	        if (this._scrollBar)
	            this.callLater(this.onScrollBarChange);
	    }
	    /**
	     * @private
	     * 滚动条的 <code>Event.CHANGE</code> 事件侦听处理函数。
	     */
	    onScrollBarChange(e = null) {
	        this.runCallLater(this.changeCells);
	        var scrollValue = this._scrollBar.value;
	        var lineX = (this._isVertical ? this.repeatX : this.repeatY);
	        var lineY = (this._isVertical ? this.repeatY : this.repeatX);
	        var scrollLine = Math.floor(scrollValue / this._cellSize);
	        if (!this.cacheContent) {
	            var index = scrollLine * lineX;
	            var num = 0;
	            if (index > this._startIndex) {
	                num = index - this._startIndex;
	                var down = true;
	                var toIndex = this._startIndex + lineX * (lineY + 1);
	                this._isMoved = true;
	            }
	            else if (index < this._startIndex) {
	                num = this._startIndex - index;
	                down = false;
	                toIndex = this._startIndex - 1;
	                this._isMoved = true;
	            }
	            for (var i = 0; i < num; i++) {
	                if (down) {
	                    var cell = this._cells.shift();
	                    this._cells[this._cells.length] = cell;
	                    var cellIndex = toIndex + i;
	                }
	                else {
	                    cell = this._cells.pop();
	                    this._cells.unshift(cell);
	                    cellIndex = toIndex - i;
	                }
	                var pos = Math.floor(cellIndex / lineX) * this._cellSize;
	                this._isVertical ? cell.y = pos : cell.x = pos;
	                this.renderItem(cell, cellIndex);
	            }
	            this._startIndex = index;
	            this.changeSelectStatus();
	        }
	        else {
	            num = (lineY + 1);
	            if (this._createdLine - scrollLine < num) {
	                this._createItems(this._createdLine, lineX, this._createdLine + num);
	                this.renderItems(this._createdLine * lineX, 0);
	                this._createdLine += num;
	            }
	        }
	        var r = this._content._style.scrollRect;
	        if (this._isVertical) {
	            r.y = scrollValue - this._offset.y;
	            r.x = -this._offset.x;
	        }
	        else {
	            r.y = -this._offset.y;
	            r.x = scrollValue - this._offset.x;
	        }
	        this._content.scrollRect = r;
	    }
	    posCell(cell, cellIndex) {
	        if (!this._scrollBar)
	            return;
	        var lineX = (this._isVertical ? this.repeatX : this.repeatY);
	        var lineY = (this._isVertical ? this.repeatY : this.repeatX);
	        var pos = Math.floor(cellIndex / lineX) * this._cellSize;
	        this._isVertical ? cell._y = pos : cell.x = pos;
	    }
	    /**
	     * 表示当前选择的项索引。selectedIndex值更改会引起list重新渲染
	     */
	    get selectedIndex() {
	        return this._selectedIndex;
	    }
	    set selectedIndex(value) {
	        if (this._selectedIndex != value) {
	            this._selectedIndex = value;
	            this.changeSelectStatus();
	            this.event(Laya.Event.CHANGE);
	            this.selectHandler && this.selectHandler.runWith(value);
	            //选择发生变化，自动渲染一次
	            this.startIndex = this._startIndex;
	        }
	    }
	    /**
	     * @private
	     * 改变单元格的选择状态。
	     */
	    changeSelectStatus() {
	        for (var i = 0, n = this._cells.length; i < n; i++) {
	            this.changeCellState(this._cells[i], this._selectedIndex === this._startIndex + i, 1);
	        }
	    }
	    /**
	     * 当前选中的单元格数据源。
	     */
	    get selectedItem() {
	        return this._selectedIndex != -1 ? this._array[this._selectedIndex] : null;
	    }
	    set selectedItem(value) {
	        this.selectedIndex = this._array.indexOf(value);
	    }
	    /**
	     * 获取或设置当前选择的单元格对象。
	     */
	    get selection() {
	        return this.getCell(this._selectedIndex);
	    }
	    set selection(value) {
	        this.selectedIndex = this._startIndex + this._cells.indexOf(value);
	    }
	    /**
	     * 当前显示的单元格列表的开始索引。
	     */
	    get startIndex() {
	        return this._startIndex;
	    }
	    set startIndex(value) {
	        this._startIndex = value > 0 ? value : 0;
	        this.callLater(this.renderItems);
	    }
	    /**
	     * @private
	     * 渲染单元格列表。
	     */
	    renderItems(from = 0, to = 0) {
	        for (var i = from, n = to || this._cells.length; i < n; i++) {
	            this.renderItem(this._cells[i], this._startIndex + i);
	        }
	        this.changeSelectStatus();
	    }
	    /**
	     * 渲染一个单元格。
	     * @param cell 需要渲染的单元格对象。
	     * @param index 单元格索引。
	     */
	    renderItem(cell, index) {
	        if (this._array && index >= 0 && index < this._array.length) {
	            cell.visible = true;
	            if (cell["_$bindData"]) {
	                cell["_dataSource"] = this._array[index];
	                this._bindData(cell, this._array[index]);
	            }
	            else
	                cell.dataSource = this._array[index];
	            if (!this.cacheContent) {
	                //TODO:
	                this.posCell(cell, index);
	            }
	            if (this.hasListener(Laya.Event.RENDER))
	                this.event(Laya.Event.RENDER, [cell, index]);
	            if (this.renderHandler)
	                this.renderHandler.runWith([cell, index]);
	        }
	        else {
	            cell.visible = false;
	            cell.dataSource = null;
	        }
	    }
	    _bindData(cell, data) {
	        var arr = cell._$bindData;
	        for (var i = 0, n = arr.length; i < n; i++) {
	            var ele = arr[i++];
	            var prop = arr[i++];
	            var value = arr[i];
	            var fun = UIUtils.getBindFun(value);
	            ele[prop] = fun.call(this, data);
	        }
	    }
	    /**
	     * 列表数据源。
	     */
	    get array() {
	        return this._array;
	    }
	    set array(value) {
	        this.runCallLater(this.changeCells);
	        this._array = value || [];
	        this._preLen = this._array.length;
	        var length = this._array.length;
	        this.totalPage = Math.ceil(length / (this.repeatX * this.repeatY));
	        //重设selectedIndex
	        this._selectedIndex = this._selectedIndex < length ? this._selectedIndex : length - 1;
	        //重设startIndex
	        this.startIndex = this._startIndex;
	        //重设滚动条
	        if (this._scrollBar) {
	            this._scrollBar.stopScroll();
	            //自动隐藏滚动条
	            var numX = this._isVertical ? this.repeatX : this.repeatY;
	            var numY = this._isVertical ? this.repeatY : this.repeatX;
	            var lineCount = Math.ceil(length / numX);
	            var total = this._cellOffset > 0 ? this.totalPage + 1 : this.totalPage;
	            if (total > 1 && lineCount >= numY) {
	                this._scrollBar.scrollSize = this._cellSize;
	                this._scrollBar.thumbPercent = numY / lineCount;
	                this._scrollBar.setScroll(0, (lineCount - numY) * this._cellSize + this._cellOffset, this._scrollBar.value);
	                this._scrollBar.target = this._content;
	            }
	            else {
	                this._scrollBar.setScroll(0, 0, 0);
	                this._scrollBar.target = this._content;
	            }
	        }
	    }
	    /**
	     * 更新数据源，不刷新list，只增加滚动长度
	     * @param	array 数据源
	     */
	    updateArray(array) {
	        this._array = array;
	        var freshStart;
	        if (this._array) {
	            freshStart = this._preLen - this._startIndex;
	            if (freshStart >= 0)
	                this.renderItems(freshStart);
	            this._preLen = this._array.length;
	        }
	        if (this._scrollBar) {
	            var length = array.length;
	            var numX = this._isVertical ? this.repeatX : this.repeatY;
	            var numY = this._isVertical ? this.repeatY : this.repeatX;
	            var lineCount = Math.ceil(length / numX);
	            if (lineCount >= numY) {
	                this._scrollBar.thumbPercent = numY / lineCount;
	                this._scrollBar.slider["_max"] = (lineCount - numY) * this._cellSize + this._cellOffset;
	            }
	        }
	    }
	    /**
	     * 列表的当前页码。
	     */
	    get page() {
	        return this._page;
	    }
	    set page(value) {
	        this._page = value;
	        if (this._array) {
	            this._page = value > 0 ? value : 0;
	            this._page = this._page < this.totalPage ? this._page : this.totalPage - 1;
	            this.startIndex = this._page * this.repeatX * this.repeatY;
	        }
	    }
	    /**
	     * 列表的数据总个数。
	     */
	    get length() {
	        return this._array ? this._array.length : 0;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    set dataSource(value) {
	        this._dataSource = value;
	        if (typeof (value) == 'number' || typeof (value) == 'string')
	            this.selectedIndex = parseInt(value);
	        else if (value instanceof Array)
	            this.array = value;
	        else
	            super.dataSource = value;
	    }
	    get dataSource() {
	        return super.dataSource;
	    }
	    /**
	     * 单元格集合。
	     */
	    get cells() {
	        this.runCallLater(this.changeCells);
	        return this._cells;
	    }
	    /**是否开启橡皮筋效果*/
	    get elasticEnabled() {
	        return this._elasticEnabled;
	    }
	    set elasticEnabled(value) {
	        this._elasticEnabled = value;
	        if (this._scrollBar) {
	            this._scrollBar.elasticDistance = value ? 200 : 0;
	        }
	    }
	    /**
	     * 刷新列表数据源。
	     */
	    refresh() {
	        this.array = this._array;
	        //startIndex = _startIndex;
	    }
	    /**
	     * 获取单元格数据源。
	     * @param index 单元格索引。
	     */
	    getItem(index) {
	        if (index > -1 && index < this._array.length) {
	            return this._array[index];
	        }
	        return null;
	    }
	    /**
	     * 修改单元格数据源。
	     * @param index 单元格索引。
	     * @param source 单元格数据源。
	     */
	    changeItem(index, source) {
	        if (index > -1 && index < this._array.length) {
	            this._array[index] = source;
	            //如果是可视范围，则重新渲染
	            if (index >= this._startIndex && index < this._startIndex + this._cells.length) {
	                this.renderItem(this.getCell(index), index);
	            }
	        }
	    }
	    /**
	     * 设置单元格数据源。
	     * @param index 单元格索引。
	     * @param source 单元格数据源。
	     */
	    setItem(index, source) {
	        this.changeItem(index, source);
	    }
	    /**
	     * 添加单元格数据源。
	     * @param souce 数据源。
	     */
	    addItem(souce) {
	        this._array.push(souce);
	        this.array = this._array;
	    }
	    /**
	     * 添加单元格数据源到对应的数据索引处。
	     * @param souce 单元格数据源。
	     * @param index 索引。
	     */
	    addItemAt(souce, index) {
	        this._array.splice(index, 0, souce);
	        this.array = this._array;
	    }
	    /**
	     * 通过数据源索引删除单元格数据源。
	     * @param index 需要删除的数据源索引值。
	     */
	    deleteItem(index) {
	        this._array.splice(index, 1);
	        this.array = this._array;
	    }
	    /**
	     * 通过可视单元格索引，获取单元格。
	     * @param index 可视单元格索引。
	     * @return 单元格对象。
	     */
	    getCell(index) {
	        this.runCallLater(this.changeCells);
	        if (index > -1 && this._cells) {
	            return this._cells[(index - this._startIndex) % this._cells.length];
	        }
	        return null;
	    }
	    /**
	     * <p>滚动列表，以设定的数据索引对应的单元格为当前可视列表的第一项。</p>
	     * @param index 单元格在数据列表中的索引。
	     */
	    scrollTo(index) {
	        if (this._scrollBar) {
	            var numX = this._isVertical ? this.repeatX : this.repeatY;
	            this._scrollBar.value = Math.floor(index / numX) * this._cellSize;
	        }
	        else {
	            this.startIndex = index;
	        }
	    }
	    /**
	     * <p>缓动滚动列表，以设定的数据索引对应的单元格为当前可视列表的第一项。</p>
	     * @param index 单元格在数据列表中的索引。
	     * @param time	缓动时间。
	     * @param complete	缓动结束回掉
	     */
	    tweenTo(index, time = 200, complete = null) {
	        if (this._scrollBar) {
	            this._scrollBar.stopScroll();
	            var numX = this._isVertical ? this.repeatX : this.repeatY;
	            Laya.Tween.to(this._scrollBar, { value: Math.floor(index / numX) * this._cellSize }, time, null, complete, 0, true);
	        }
	        else {
	            this.startIndex = index;
	            if (complete)
	                complete.run();
	        }
	    }
	    /**@private */
	    _setCellChanged() {
	        if (!this._cellChanged) {
	            this._cellChanged = true;
	            this.callLater(this.changeCells);
	        }
	    }
	    /**
	     * @internal
	     */
	    commitMeasure() {
	        this.runCallLater(this.changeCells);
	    }
	}
	Laya.ILaya.regClass(List);
	Laya.ClassUtils.regClass("laya.ui.List", List);
	Laya.ClassUtils.regClass("Laya.List", List);

	/**
	 * 当用户更改 <code>ComboBox</code> 组件中的选定内容时调度。
	 * @eventType laya.events.Event
	 * selectedIndex属性变化时调度。
	 */
	/*[Event(name = "change", type = "laya.events.Event")]*/
	/**
	 * <code>ComboBox</code> 组件包含一个下拉列表，用户可以从该列表中选择单个值。
	 *
	 * @example <caption>以下示例代码，创建了一个 <code>ComboBox</code> 实例。</caption>
	 * package
	 *	{
	 *		import laya.ui.ComboBox;
	 *		import laya.utils.Handler;
	 *		public class ComboBox_Example
	 *		{
	 *			public function ComboBox_Example()
	 *			{
	 *				Laya.init(640, 800);//设置游戏画布宽高。
	 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *				Laya.loader.load("resource/ui/button.png", Handler.create(this,onLoadComplete));//加载资源。
	 *			}
	 *			private function onLoadComplete():void
	 *			{
	 *				trace("资源加载完成！");
	 *				var comboBox:ComboBox = new ComboBox("resource/ui/button.png", "item0,item1,item2,item3,item4,item5");//创建一个 ComboBox 类的实例对象 comboBox ,传入它的皮肤和标签集。
	 *				comboBox.x = 100;//设置 comboBox 对象的属性 x 的值，用于控制 comboBox 对象的显示位置。
	 *				comboBox.y = 100;//设置 comboBox 对象的属性 x 的值，用于控制 comboBox 对象的显示位置。
	 *				comboBox.selectHandler = new Handler(this, onSelect);//设置 comboBox 选择项改变时执行的处理器。
	 *				Laya.stage.addChild(comboBox);//将此 comboBox 对象添加到显示列表。
	 *			}
	 *			private function onSelect(index:int):void
	 *			{
	 *				trace("当前选中的项对象索引： ",index);
	 *			}
	 *		}
	 *	}
	 * @example
	 * Laya.init(640, 800);//设置游戏画布宽高。
	 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 * Laya.loader.load("resource/ui/button.png",laya.utils.Handler.create(this,loadComplete));//加载资源
	 * function loadComplete() {
	 *     console.log("资源加载完成！");
	 *     var comboBox = new laya.ui.ComboBox("resource/ui/button.png", "item0,item1,item2,item3,item4,item5");//创建一个 ComboBox 类的实例对象 comboBox ,传入它的皮肤和标签集。
	 *     comboBox.x = 100;//设置 comboBox 对象的属性 x 的值，用于控制 comboBox 对象的显示位置。
	 *     comboBox.y = 100;//设置 comboBox 对象的属性 x 的值，用于控制 comboBox 对象的显示位置。
	 *     comboBox.selectHandler = new laya.utils.Handler(this, onSelect);//设置 comboBox 选择项改变时执行的处理器。
	 *     Laya.stage.addChild(comboBox);//将此 comboBox 对象添加到显示列表。
	 * }
	 * function onSelect(index)
	 * {
	 *     console.log("当前选中的项对象索引： ",index);
	 * }
	 * @example
	 * import ComboBox = laya.ui.ComboBox;
	 * import Handler = laya.utils.Handler;
	 * class ComboBox_Example {
	 *     constructor() {
	 *         Laya.init(640, 800);//设置游戏画布宽高。
	 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *         Laya.loader.load("resource/ui/button.png", Handler.create(this, this.onLoadComplete));//加载资源。
	 *     }
	 *     private onLoadComplete(): void {
	 *         console.log("资源加载完成！");
	 *         var comboBox: ComboBox = new ComboBox("resource/ui/button.png", "item0,item1,item2,item3,item4,item5");//创建一个 ComboBox 类的实例对象 comboBox ,传入它的皮肤和标签集。
	 *         comboBox.x = 100;//设置 comboBox 对象的属性 x 的值，用于控制 comboBox 对象的显示位置。
	 *         comboBox.y = 100;//设置 comboBox 对象的属性 x 的值，用于控制 comboBox 对象的显示位置。
	 *         comboBox.selectHandler = new Handler(this, this.onSelect);//设置 comboBox 选择项改变时执行的处理器。
	 *         Laya.stage.addChild(comboBox);//将此 comboBox 对象添加到显示列表。
	 *     }
	 *     private onSelect(index: number): void {
	 *         console.log("当前选中的项对象索引： ", index);
	 *     }
	 * }
	 *
	 */
	class ComboBox extends UIComponent {
	    /**
	     * 创建一个新的 <code>ComboBox</code> 组件实例。
	     * @param skin 皮肤资源地址。
	     * @param labels 下拉列表的标签集字符串。以逗号做分割，如"item0,item1,item2,item3,item4,item5"。
	     */
	    constructor(skin = null, labels = null) {
	        super();
	        /**@private */
	        this._visibleNum = 6;
	        /**
	         * @private
	         */
	        this._itemColors = Styles.comboBoxItemColors;
	        /**
	         * @private
	         */
	        this._itemSize = 12;
	        /**
	         * @private
	         */
	        this._labels = [];
	        /**
	         * @private
	         */
	        this._selectedIndex = -1;
	        /**
	         * 渲染项，用来显示下拉列表展示对象
	         */
	        this.itemRender = null;
	        this.skin = skin;
	        this.labels = labels;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._button && this._button.destroy(destroyChild);
	        this._list && this._list.destroy(destroyChild);
	        this._button = null;
	        this._list = null;
	        this._itemColors = null;
	        this._labels = null;
	        this._selectHandler = null;
	    }
	    /**
	     * @inheritDoc
	     * @internal
	    */
	    /*override*/ createChildren() {
	        this.addChild(this._button = new Button());
	        this._button.text.align = "left";
	        this._button.labelPadding = "0,0,0,5";
	        this._button.on(Laya.Event.MOUSE_DOWN, this, this.onButtonMouseDown);
	    }
	    _createList() {
	        this._list = new List();
	        if (this._scrollBarSkin)
	            this._list.vScrollBarSkin = this._scrollBarSkin;
	        this._setListEvent(this._list);
	    }
	    _setListEvent(list) {
	        this._list.selectEnable = true;
	        this._list.on(Laya.Event.MOUSE_DOWN, this, this.onListDown);
	        this._list.mouseHandler = Laya.Handler.create(this, this.onlistItemMouse, null, false);
	        if (this._list.scrollBar)
	            this._list.scrollBar.on(Laya.Event.MOUSE_DOWN, this, this.onScrollBarDown);
	    }
	    /**
	     * @private
	     */
	    onListDown(e) {
	        e.stopPropagation();
	    }
	    onScrollBarDown(e) {
	        e.stopPropagation();
	    }
	    onButtonMouseDown(e) {
	        this.callLater(this.switchTo, [!this._isOpen]);
	    }
	    /**
	     * @copy laya.ui.Button#skin
	     */
	    get skin() {
	        return this._button.skin;
	    }
	    set skin(value) {
	        if (this._button.skin != value) {
	            this._button.skin = value;
	            this._listChanged = true;
	        }
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ measureWidth() {
	        return this._button.width;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ measureHeight() {
	        return this._button.height;
	    }
	    /**
	     * @private
	     */
	    changeList() {
	        this._listChanged = false;
	        var labelWidth = this.width - 2;
	        var labelColor = this._itemColors[2];
	        this._itemHeight = this._itemSize + 6;
	        this._list.itemRender = this.itemRender || { type: "Box", child: [{ type: "Label", props: { name: "label", x: 1, padding: "3,3,3,3", width: labelWidth, height: this._itemHeight, fontSize: this._itemSize, color: labelColor } }] };
	        this._list.repeatY = this._visibleNum;
	        this._list.refresh();
	    }
	    /**
	     * @private
	     * 下拉列表的鼠标事件响应函数。
	     */
	    onlistItemMouse(e, index) {
	        var type = e.type;
	        if (type === Laya.Event.MOUSE_OVER || type === Laya.Event.MOUSE_OUT) {
	            if (this._isCustomList)
	                return;
	            var box = this._list.getCell(index);
	            if (!box)
	                return;
	            var label = box.getChildByName("label");
	            if (label) {
	                if (type === Laya.Event.ROLL_OVER) {
	                    label.bgColor = this._itemColors[0];
	                    label.color = this._itemColors[1];
	                }
	                else {
	                    label.bgColor = null;
	                    label.color = this._itemColors[2];
	                }
	            }
	        }
	        else if (type === Laya.Event.CLICK) {
	            this.selectedIndex = index;
	            this.isOpen = false;
	        }
	    }
	    /**
	     * @private
	     */
	    switchTo(value) {
	        this.isOpen = value;
	    }
	    /**
	     * 更改下拉列表的打开状态。
	     */
	    changeOpen() {
	        this.isOpen = !this._isOpen;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ set width(value) {
	        super.width = value;
	        this._button.width = this._width;
	        this._itemChanged = true;
	        this._listChanged = true;
	    }
	    get width() {
	        return super.width;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ set height(value) {
	        super.height = value;
	        this._button.height = this._height;
	    }
	    get height() {
	        return super.height;
	    }
	    /**
	     * 标签集合字符串。
	     */
	    get labels() {
	        return this._labels.join(",");
	    }
	    set labels(value) {
	        if (this._labels.length > 0)
	            this.selectedIndex = -1;
	        if (value)
	            this._labels = value.split(",");
	        else
	            this._labels.length = 0;
	        this._itemChanged = true;
	    }
	    /**
	     * 更改下拉列表。
	     */
	    changeItem() {
	        this._itemChanged = false;
	        //显示边框
	        this._listHeight = this._labels.length > 0 ? Math.min(this._visibleNum, this._labels.length) * this._itemHeight : this._itemHeight;
	        if (!this._isCustomList) {
	            //填充背景
	            var g = this._list.graphics;
	            g.clear(true);
	            g.drawRect(0, 0, this.width - 1, this._listHeight, this._itemColors[4], this._itemColors[3]);
	        }
	        //填充数据			
	        var a = this._list.array || [];
	        a.length = 0;
	        for (var i = 0, n = this._labels.length; i < n; i++) {
	            a.push({ label: this._labels[i] });
	        }
	        this._list.height = this._listHeight;
	        this._list.array = a;
	        //if (_visibleNum > a.length) {
	        //_list.height = _listHeight;
	        //} else {
	        //_list.height = 0;
	        //}
	    }
	    /**
	     * 表示选择的下拉列表项的索引。
	     */
	    get selectedIndex() {
	        return this._selectedIndex;
	    }
	    set selectedIndex(value) {
	        if (this._selectedIndex != value) {
	            this._selectedIndex = value;
	            if (this._labels.length > 0)
	                this.changeSelected();
	            else
	                this.callLater(this.changeSelected);
	            this.event(Laya.Event.CHANGE, [Laya.Event.EMPTY.setTo(Laya.Event.CHANGE, this, this)]);
	            this._selectHandler && this._selectHandler.runWith(this._selectedIndex);
	        }
	    }
	    changeSelected() {
	        this._button.label = this.selectedLabel;
	    }
	    /**
	     * 改变下拉列表的选择项时执行的处理器(默认返回参数index:int)。
	     */
	    get selectHandler() {
	        return this._selectHandler;
	    }
	    set selectHandler(value) {
	        this._selectHandler = value;
	    }
	    /**
	     * 表示选择的下拉列表项的的标签。
	     */
	    get selectedLabel() {
	        return this._selectedIndex > -1 && this._selectedIndex < this._labels.length ? this._labels[this._selectedIndex] : null;
	    }
	    set selectedLabel(value) {
	        this.selectedIndex = this._labels.indexOf(value);
	    }
	    /**
	     * 获取或设置没有滚动条的下拉列表中可显示的最大行数。
	     */
	    get visibleNum() {
	        return this._visibleNum;
	    }
	    set visibleNum(value) {
	        this._visibleNum = value;
	        this._listChanged = true;
	    }
	    /**
	     * 下拉列表项颜色。
	     * <p><b>格式：</b>"悬停或被选中时背景颜色,悬停或被选中时标签颜色,标签颜色,边框颜色,背景颜色"</p>
	     */
	    get itemColors() {
	        return String(this._itemColors);
	    }
	    set itemColors(value) {
	        this._itemColors = UIUtils.fillArray(this._itemColors, value, String);
	        this._listChanged = true;
	    }
	    /**
	     * 下拉列表项标签的字体大小。
	     */
	    get itemSize() {
	        return this._itemSize;
	    }
	    set itemSize(value) {
	        this._itemSize = value;
	        this._listChanged = true;
	    }
	    /**
	     * 表示下拉列表的打开状态。
	     */
	    get isOpen() {
	        return this._isOpen;
	    }
	    set isOpen(value) {
	        var Laya$1 = window.Laya;
	        if (this._isOpen != value) {
	            this._isOpen = value;
	            this._button.selected = this._isOpen;
	            if (this._isOpen) {
	                this._list || this._createList();
	                this._listChanged && !this._isCustomList && this.changeList();
	                this._itemChanged && this.changeItem();
	                var p = this.localToGlobal(Laya.Point.TEMP.setTo(0, 0));
	                var py = p.y + this._button.height;
	                py = py + this._listHeight <= Laya$1.stage.height ? py : p.y - this._listHeight;
	                this._list.pos(p.x, py);
	                this._list.zOrder = 1001;
	                Laya$1._currentStage.addChild(this._list);
	                //Laya.stage.once(Event.MOUSE_DOWN, this, removeList);
	                //Laya.stage.on(Event.MOUSE_WHEEL, this, _onStageMouseWheel);
	                //parent.addChild(_list);
	                Laya$1.stage.once(Laya.Event.MOUSE_DOWN, this, this.removeList);
	                Laya$1.stage.on(Laya.Event.MOUSE_WHEEL, this, this._onStageMouseWheel);
	                this._list.selectedIndex = this._selectedIndex;
	            }
	            else {
	                this._list && this._list.removeSelf();
	            }
	        }
	    }
	    _onStageMouseWheel(e) {
	        if (!this._list || this._list.contains(e.target))
	            return;
	        this.removeList(null);
	    }
	    /**
	     * 关闭下拉列表。
	     */
	    removeList(e) {
	        var Laya$1 = window.Laya;
	        Laya$1.stage.off(Laya.Event.MOUSE_DOWN, this, this.removeList);
	        Laya$1.stage.off(Laya.Event.MOUSE_WHEEL, this, this._onStageMouseWheel);
	        this.isOpen = false;
	    }
	    /**
	     * 滚动条皮肤。
	     */
	    get scrollBarSkin() {
	        return this._scrollBarSkin;
	    }
	    set scrollBarSkin(value) {
	        this._scrollBarSkin = value;
	    }
	    /**
	     * <p>当前实例的位图 <code>AutoImage</code> 实例的有效缩放网格数据。</p>
	     * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
	     * <ul><li>例如："4,4,4,4,1"</li></ul></p>
	     * @see laya.ui.AutoBitmap.sizeGrid
	     */
	    get sizeGrid() {
	        return this._button.sizeGrid;
	    }
	    set sizeGrid(value) {
	        this._button.sizeGrid = value;
	    }
	    /**
	     * 获取对 <code>ComboBox</code> 组件所包含的 <code>VScrollBar</code> 滚动条组件的引用。
	     */
	    get scrollBar() {
	        return this.list.scrollBar;
	    }
	    /**
	     * 获取对 <code>ComboBox</code> 组件所包含的 <code>Button</code> 组件的引用。
	     */
	    get button() {
	        return this._button;
	    }
	    /**
	     * 获取对 <code>ComboBox</code> 组件所包含的 <code>List</code> 列表组件的引用。
	     */
	    get list() {
	        this._list || this._createList();
	        return this._list;
	    }
	    set list(value) {
	        if (value) {
	            value.removeSelf();
	            this._isCustomList = true;
	            this._list = value;
	            this._setListEvent(value);
	            this._itemHeight = value.getCell(0).height + value.spaceY;
	        }
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    set dataSource(value) {
	        this._dataSource = value;
	        if (typeof (value) == 'number' || typeof (value) == 'string')
	            this.selectedIndex = parseInt(value);
	        else if (value instanceof Array)
	            this.labels = value.join(",");
	        else
	            super.dataSource = value;
	    }
	    get dataSource() {
	        return super.dataSource;
	    }
	    /**
	     * 获取或设置对 <code>ComboBox</code> 组件所包含的 <code>Button</code> 组件的文本标签颜色。
	     * <p><b>格式：</b>upColor,overColor,downColor,disableColor</p>
	     */
	    get labelColors() {
	        return this._button.labelColors;
	    }
	    set labelColors(value) {
	        if (this._button.labelColors != value) {
	            this._button.labelColors = value;
	        }
	    }
	    /**
	     * 获取或设置对 <code>ComboBox</code> 组件所包含的 <code>Button</code> 组件的文本边距。
	     * <p><b>格式：</b>上边距,右边距,下边距,左边距</p>
	     */
	    get labelPadding() {
	        return this._button.text.padding.join(",");
	    }
	    set labelPadding(value) {
	        this._button.text.padding = UIUtils.fillArray(Styles.labelPadding, value, Number);
	    }
	    /**
	     * 获取或设置对 <code>ComboBox</code> 组件所包含的 <code>Button</code> 组件的标签字体大小。
	     */
	    get labelSize() {
	        return this._button.text.fontSize;
	    }
	    set labelSize(value) {
	        this._button.text.fontSize = value;
	    }
	    /**
	     * 表示按钮文本标签是否为粗体字。
	     * @see laya.display.Text#bold
	     */
	    get labelBold() {
	        return this._button.text.bold;
	    }
	    set labelBold(value) {
	        this._button.text.bold = value;
	    }
	    /**
	     * 表示按钮文本标签的字体名称，以字符串形式表示。
	     * @see laya.display.Text#font
	     */
	    get labelFont() {
	        return this._button.text.font;
	    }
	    set labelFont(value) {
	        this._button.text.font = value;
	    }
	    /**
	     * 表示按钮的状态值。
	     * @see laya.ui.Button#stateNum
	     */
	    get stateNum() {
	        return this._button.stateNum;
	    }
	    set stateNum(value) {
	        this._button.stateNum = value;
	    }
	}
	Laya.ILaya.regClass(ComboBox);
	Laya.ClassUtils.regClass("laya.ui.ComboBox", ComboBox);
	Laya.ClassUtils.regClass("Laya.ComboBox", ComboBox);

	/**
	 * 图片加载完成后调度。
	 * @eventType Event.LOADED
	 */
	/*[Event(name = "loaded", type = "laya.events.Event")]*/
	/**
	 * 当前帧发生变化后调度。
	 * @eventType laya.events.Event
	 */
	/*[Event(name = "change", type = "laya.events.Event")]*/
	/**
	 * <p> <code>Clip</code> 类是位图切片动画。</p>
	 * <p> <code>Clip</code> 可将一张图片，按横向分割数量 <code>clipX</code> 、竖向分割数量 <code>clipY</code> ，
	 * 或横向分割每个切片的宽度 <code>clipWidth</code> 、竖向分割每个切片的高度 <code>clipHeight</code> ，
	 * 从左向右，从上到下，分割组合为一个切片动画。</p>
	 * Image和Clip组件是唯一支持异步加载的两个组件，比如clip.skin = "abc/xxx.png"，其他UI组件均不支持异步加载。
	 *
	 * @example <caption>以下示例代码，创建了一个 <code>Clip</code> 实例。</caption>
	 * package
	 *	{
	 *		import laya.ui.Clip;
	 *		public class Clip_Example
	 *		{
	 *			private var clip:Clip;
	 *			public function Clip_Example()
	 *			{
	 *				Laya.init(640, 800);//设置游戏画布宽高。
	 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *				onInit();
	 *			}
	 *			private function onInit():void
	 *			{
	 *				clip = new Clip("resource/ui/clip_num.png", 10, 1);//创建一个 Clip 类的实例对象 clip ,传入它的皮肤skin和横向分割数量、竖向分割数量。
	 *				clip.autoPlay = true;//设置 clip 动画自动播放。
	 *				clip.interval = 100;//设置 clip 动画的播放时间间隔。
	 *				clip.x = 100;//设置 clip 对象的属性 x 的值，用于控制 clip 对象的显示位置。
	 *				clip.y = 100;//设置 clip 对象的属性 y 的值，用于控制 clip 对象的显示位置。
	 *				clip.on(Event.CLICK, this, onClick);//给 clip 添加点击事件函数侦听。
	 *				Laya.stage.addChild(clip);//将此 clip 对象添加到显示列表。
	 *			}
	 *			private function onClick():void
	 *			{
	 *				trace("clip 的点击事件侦听处理函数。clip.total="+ clip.total);
	 *				if (clip.isPlaying == true)
	 *				{
	 *					clip.stop();//停止动画。
	 *				}else {
	 *					clip.play();//播放动画。
	 *				}
	 *			}
	 *		}
	 *	}
	 * @example
	 * Laya.init(640, 800);//设置游戏画布宽高
	 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
	 * var clip;
	 * Laya.loader.load("resource/ui/clip_num.png",laya.utils.Handler.create(this,loadComplete));//加载资源
	 * function loadComplete() {
	 *     console.log("资源加载完成！");
	 *     clip = new laya.ui.Clip("resource/ui/clip_num.png",10,1);//创建一个 Clip 类的实例对象 clip ,传入它的皮肤skin和横向分割数量、竖向分割数量。
	 *     clip.autoPlay = true;//设置 clip 动画自动播放。
	 *     clip.interval = 100;//设置 clip 动画的播放时间间隔。
	 *     clip.x =100;//设置 clip 对象的属性 x 的值，用于控制 clip 对象的显示位置。
	 *     clip.y =100;//设置 clip 对象的属性 y 的值，用于控制 clip 对象的显示位置。
	 *     clip.on(Event.CLICK,this,onClick);//给 clip 添加点击事件函数侦听。
	 *     Laya.stage.addChild(clip);//将此 clip 对象添加到显示列表。
	 * }
	 * function onClick()
	 * {
	 *     console.log("clip 的点击事件侦听处理函数。");
	 *     if(clip.isPlaying == true)
	 *     {
	 *         clip.stop();
	 *     }else {
	 *         clip.play();
	 *     }
	 * }
	 * @example
	 * import Clip = laya.ui.Clip;
	 * import Handler = laya.utils.Handler;
	 * class Clip_Example {
	 *     private clip: Clip;
	 *     constructor() {
	 *         Laya.init(640, 800);//设置游戏画布宽高。
	 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *         this.onInit();
	 *     }
	 *     private onInit(): void {
	 *         this.clip = new Clip("resource/ui/clip_num.png", 10, 1);//创建一个 Clip 类的实例对象 clip ,传入它的皮肤skin和横向分割数量、竖向分割数量。
	 *         this.clip.autoPlay = true;//设置 clip 动画自动播放。
	 *         this.clip.interval = 100;//设置 clip 动画的播放时间间隔。
	 *         this.clip.x = 100;//设置 clip 对象的属性 x 的值，用于控制 clip 对象的显示位置。
	 *         this.clip.y = 100;//设置 clip 对象的属性 y 的值，用于控制 clip 对象的显示位置。
	 *         this.clip.on(laya.events.Event.CLICK, this, this.onClick);//给 clip 添加点击事件函数侦听。
	 *         Laya.stage.addChild(this.clip);//将此 clip 对象添加到显示列表。
	 *     }
	 *     private onClick(): void {
	 *         console.log("clip 的点击事件侦听处理函数。clip.total=" + this.clip.total);
	 *         if (this.clip.isPlaying == true) {
	 *             this.clip.stop();//停止动画。
	 *         } else {
	 *             this.clip.play();//播放动画。
	 *         }
	 *     }
	 * }
	 *
	 */
	class Clip extends UIComponent {
	    /**
	     * 创建一个新的 <code>Clip</code> 示例。
	     * @param url 资源类库名或者地址
	     * @param clipX x方向分割个数
	     * @param clipY y方向分割个数
	     */
	    constructor(url = null, clipX = 1, clipY = 1) {
	        super();
	        /**@private */
	        this._clipX = 1;
	        /**@private */
	        this._clipY = 1;
	        /**@private */
	        this._clipWidth = 0;
	        /**@private */
	        this._clipHeight = 0;
	        /**@private */
	        this._interval = 50;
	        /**@private */
	        this._index = 0;
	        /**@private */
	        this._toIndex = -1;
	        this._clipX = clipX;
	        this._clipY = clipY;
	        this.skin = url;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ destroy(destroyChild = true) {
	        super.destroy(true);
	        this._bitmap && this._bitmap.destroy();
	        this._bitmap = null;
	        this._sources = null;
	    }
	    /**
	     * 销毁对象并释放加载的皮肤资源。
	     */
	    dispose() {
	        this.destroy(true);
	        window.Laya.loader.clearRes(this._skin);
	    }
	    /**
	     * @inheritDoc
	     * @internal
	    */
	    /*override*/ createChildren() {
	        this.graphics = this._bitmap = new AutoBitmap();
	    }
	    /**@private	 @override*/
	    _onDisplay(e) {
	        if (this._isPlaying) {
	            if (this._getBit(Laya.Const.DISPLAYED_INSTAGE))
	                this.play();
	            else
	                this.stop();
	        }
	        else if (this._autoPlay) {
	            this.play();
	        }
	    }
	    /**
	     * @copy laya.ui.Image#skin
	     */
	    get skin() {
	        return this._skin;
	    }
	    set skin(value) {
	        if (this._skin != value) {
	            this._skin = value;
	            if (value) {
	                if (!Laya.Loader.getRes(value)) {
	                    window.Laya.loader.load(this._skin, Laya.Handler.create(this, this._skinLoaded), null, Laya.Loader.IMAGE, 1);
	                }
	                else {
	                    this._skinLoaded();
	                }
	            }
	            else {
	                this._bitmap.source = null;
	            }
	        }
	    }
	    _skinLoaded() {
	        this._setClipChanged();
	        this._sizeChanged();
	        this.event(Laya.Event.LOADED);
	    }
	    /**X轴（横向）切片数量。*/
	    get clipX() {
	        return this._clipX;
	    }
	    set clipX(value) {
	        this._clipX = value || 1;
	        this._setClipChanged();
	    }
	    /**Y轴(竖向)切片数量。*/
	    get clipY() {
	        return this._clipY;
	    }
	    set clipY(value) {
	        this._clipY = value || 1;
	        this._setClipChanged();
	    }
	    /**
	     * 横向分割时每个切片的宽度，与 <code>clipX</code> 同时设置时优先级高于 <code>clipX</code> 。
	     */
	    get clipWidth() {
	        return this._clipWidth;
	    }
	    set clipWidth(value) {
	        this._clipWidth = value;
	        this._setClipChanged();
	    }
	    /**
	     * 竖向分割时每个切片的高度，与 <code>clipY</code> 同时设置时优先级高于 <code>clipY</code> 。
	     */
	    get clipHeight() {
	        return this._clipHeight;
	    }
	    set clipHeight(value) {
	        this._clipHeight = value;
	        this._setClipChanged();
	    }
	    /**
	     * @private
	     * 改变切片的资源、切片的大小。
	     */
	    changeClip() {
	        this._clipChanged = false;
	        if (!this._skin)
	            return;
	        var img = Laya.Loader.getRes(this._skin);
	        if (img) {
	            this.loadComplete(this._skin, img);
	        }
	        else {
	            window.Laya.loader.load(this._skin, Laya.Handler.create(this, this.loadComplete, [this._skin]));
	        }
	    }
	    /**
	     * @private
	     * 加载切片图片资源完成函数。
	     * @param url 资源地址。
	     * @param img 纹理。
	     */
	    loadComplete(url, img) {
	        if (url === this._skin && img) {
	            var w = this._clipWidth || Math.ceil(img.sourceWidth / this._clipX);
	            var h = this._clipHeight || Math.ceil(img.sourceHeight / this._clipY);
	            var key = this._skin + w + h;
	            var clips = Laya.WeakObject.I.get(key);
	            if (!Laya.Utils.isOkTextureList(clips)) {
	                clips = null;
	            }
	            if (clips)
	                this._sources = clips;
	            else {
	                this._sources = [];
	                for (var i = 0; i < this._clipY; i++) {
	                    for (var j = 0; j < this._clipX; j++) {
	                        this._sources.push(Laya.Texture.createFromTexture(img, w * j, h * i, w, h));
	                    }
	                }
	                Laya.WeakObject.I.set(key, this._sources);
	            }
	            this.index = this._index;
	            this.event(Laya.Event.LOADED);
	            this.onCompResize();
	        }
	    }
	    /**
	     * 源数据。
	     */
	    get sources() {
	        return this._sources;
	    }
	    set sources(value) {
	        this._sources = value;
	        this.index = this._index;
	        this.event(Laya.Event.LOADED);
	    }
	    /**
	     * 资源分组。
	     */
	    get group() {
	        return this._group;
	    }
	    set group(value) {
	        if (value && this._skin)
	            Laya.Loader.setGroup(this._skin, value);
	        this._group = value;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ set width(value) {
	        super.width = value;
	        this._bitmap.width = value;
	    }
	    get width() {
	        return super.width;
	    }
	    /**
	     * @inheritDoc
	     * @override
	     * */
	    /*override*/ set height(value) {
	        super.height = value;
	        this._bitmap.height = value;
	    }
	    get height() {
	        return super.height;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ measureWidth() {
	        this.runCallLater(this.changeClip);
	        return this._bitmap.width;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ measureHeight() {
	        this.runCallLater(this.changeClip);
	        return this._bitmap.height;
	    }
	    /**
	     * <p>当前实例的位图 <code>AutoImage</code> 实例的有效缩放网格数据。</p>
	     * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
	     * <ul><li>例如："4,4,4,4,1"</li></ul></p>
	     * @see laya.ui.AutoBitmap.sizeGrid
	     */
	    get sizeGrid() {
	        if (this._bitmap.sizeGrid)
	            return this._bitmap.sizeGrid.join(",");
	        return null;
	    }
	    set sizeGrid(value) {
	        this._bitmap.sizeGrid = UIUtils.fillArray(Styles.defaultSizeGrid, value, Number);
	    }
	    /**
	     * 当前帧索引。
	     */
	    get index() {
	        return this._index;
	    }
	    set index(value) {
	        this._index = value;
	        this._bitmap && this._sources && (this._bitmap.source = this._sources[value]);
	        this.event(Laya.Event.CHANGE);
	    }
	    /**
	     * 切片动画的总帧数。
	     */
	    get total() {
	        this.runCallLater(this.changeClip);
	        return this._sources ? this._sources.length : 0;
	    }
	    /**
	     * 表示是否自动播放动画，若自动播放值为true,否则值为false;
	     * <p>可控制切片动画的播放、停止。</p>
	     */
	    get autoPlay() {
	        return this._autoPlay;
	    }
	    set autoPlay(value) {
	        if (this._autoPlay != value) {
	            this._autoPlay = value;
	            value ? this.play() : this.stop();
	        }
	    }
	    /**
	     * 表示动画播放间隔时间(以毫秒为单位)。
	     */
	    get interval() {
	        return this._interval;
	    }
	    set interval(value) {
	        if (this._interval != value) {
	            this._interval = value;
	            if (this._isPlaying)
	                this.play();
	        }
	    }
	    /**
	     * 表示动画的当前播放状态。
	     * 如果动画正在播放中，则为true，否则为flash。
	     */
	    get isPlaying() {
	        return this._isPlaying;
	    }
	    set isPlaying(value) {
	        this._isPlaying = value;
	    }
	    /**
	     * 播放动画。
	     * @param	from	开始索引
	     * @param	to		结束索引，-1为不限制
	     */
	    play(from = 0, to = -1) {
	        this._isPlaying = true;
	        this.index = from;
	        this._toIndex = to;
	        this._index++;
	        window.Laya.timer.loop(this.interval, this, this._loop);
	        this.on(Laya.Event.DISPLAY, this, this._onDisplay);
	        this.on(Laya.Event.UNDISPLAY, this, this._onDisplay);
	    }
	    /**
	     * @private
	     */
	    _loop() {
	        if (this._visible && this._sources) {
	            this._index++;
	            if (this._toIndex > -1 && this._index >= this._toIndex)
	                this.stop();
	            else if (this._index >= this._sources.length)
	                this._index = 0;
	            this.index = this._index;
	        }
	    }
	    /**
	     * 停止动画。
	     */
	    stop() {
	        this._isPlaying = false;
	        window.Laya.timer.clear(this, this._loop);
	        this.event(Laya.Event.COMPLETE);
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    set dataSource(value) {
	        this._dataSource = value;
	        if (typeof (value) == 'number' || typeof (value) == 'string')
	            this.index = parseInt(value);
	        else
	            super.dataSource = value;
	    }
	    get dataSource() {
	        return super.dataSource;
	    }
	    /**
	     * <code>AutoBitmap</code> 位图实例。
	     */
	    get bitmap() {
	        return this._bitmap;
	    }
	    /**@private */
	    _setClipChanged() {
	        if (!this._clipChanged) {
	            this._clipChanged = true;
	            this.callLater(this.changeClip);
	        }
	    }
	}
	Laya.ILaya.regClass(Clip);
	Laya.ClassUtils.regClass("laya.ui.Clip", Clip);
	Laya.ClassUtils.regClass("Laya.Clip", Clip);

	/**
	 * 选择项改变后调度。
	 * @eventType laya.events.Event
	 */
	/*[Event(name = "change", type = "laya.events.Event")]*/
	/**
	 * <code>ColorPicker</code> 组件将显示包含多个颜色样本的列表，用户可以从中选择颜色。
	 *
	 * @example <caption>以下示例代码，创建了一个 <code>ColorPicker</code> 实例。</caption>
	 * package
	 *	{
	 *		import laya.ui.ColorPicker;
	 *		import laya.utils.Handler;
	 *		public class ColorPicker_Example
	 *		{
	 *			public function ColorPicker_Example()
	 *			{
	 *				Laya.init(640, 800);//设置游戏画布宽高。
	 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *				Laya.loader.load("resource/ui/color.png", Handler.create(this,onLoadComplete));//加载资源。
	 *			}
	 *			private function onLoadComplete():void
	 *			{
	 *				trace("资源加载完成！");
	 *				var colorPicket:ColorPicker = new ColorPicker();//创建一个 ColorPicker 类的实例对象 colorPicket 。
	 *				colorPicket.skin = "resource/ui/color.png";//设置 colorPicket 的皮肤。
	 *				colorPicket.x = 100;//设置 colorPicket 对象的属性 x 的值，用于控制 colorPicket 对象的显示位置。
	 *				colorPicket.y = 100;//设置 colorPicket 对象的属性 y 的值，用于控制 colorPicket 对象的显示位置。
	 *				colorPicket.changeHandler = new Handler(this, onChangeColor,[colorPicket]);//设置 colorPicket 的颜色改变回调函数。
	 *				Laya.stage.addChild(colorPicket);//将此 colorPicket 对象添加到显示列表。
	 *			}
	 *			private function onChangeColor(colorPicket:ColorPicker):void
	 *			{
	 *				trace("当前选择的颜色： " + colorPicket.selectedColor);
	 *			}
	 *		}
	 *	}
	 * @example
	 * Laya.init(640, 800);//设置游戏画布宽高
	 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
	 * Laya.loader.load("resource/ui/color.png",laya.utils.Handler.create(this,loadComplete));//加载资源
	 * function loadComplete()
	 * {
	 *     console.log("资源加载完成！");
	 *     var colorPicket = new laya.ui.ColorPicker();//创建一个 ColorPicker 类的实例对象 colorPicket 。
	 *     colorPicket.skin = "resource/ui/color.png";//设置 colorPicket 的皮肤。
	 *     colorPicket.x = 100;//设置 colorPicket 对象的属性 x 的值，用于控制 colorPicket 对象的显示位置。
	 *     colorPicket.y = 100;//设置 colorPicket 对象的属性 y 的值，用于控制 colorPicket 对象的显示位置。
	 *     colorPicket.changeHandler = laya.utils.Handler.create(this, onChangeColor,[colorPicket],false);//设置 colorPicket 的颜色改变回调函数。
	 *     Laya.stage.addChild(colorPicket);//将此 colorPicket 对象添加到显示列表。
	 * }
	 * function onChangeColor(colorPicket)
	 * {
	 *     console.log("当前选择的颜色： " + colorPicket.selectedColor);
	 * }
	 * @example
	 * import ColorPicker = laya.ui.ColorPicker;
	 * import Handler = laya.utils.Handler;
	 * class ColorPicker_Example {
	 *     constructor() {
	 *         Laya.init(640, 800);//设置游戏画布宽高。
	 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *         Laya.loader.load("resource/ui/color.png", Handler.create(this, this.onLoadComplete));//加载资源。
	 *     }
	 *     private onLoadComplete(): void {
	 *         console.log("资源加载完成！");
	 *         var colorPicket: ColorPicker = new ColorPicker();//创建一个 ColorPicker 类的实例对象 colorPicket 。
	 *         colorPicket.skin = "resource/ui/color.png";//设置 colorPicket 的皮肤。
	 *         colorPicket.x = 100;//设置 colorPicket 对象的属性 x 的值，用于控制 colorPicket 对象的显示位置。
	 *         colorPicket.y = 100;//设置 colorPicket 对象的属性 y 的值，用于控制 colorPicket 对象的显示位置。
	 *         colorPicket.changeHandler = new Handler(this, this.onChangeColor, [colorPicket]);//设置 colorPicket 的颜色改变回调函数。
	 *         Laya.stage.addChild(colorPicket);//将此 colorPicket 对象添加到显示列表。
	 *     }
	 *     private onChangeColor(colorPicket: ColorPicker): void {
	 *         console.log("当前选择的颜色： " + colorPicket.selectedColor);
	 *     }
	 * }
	 */
	class ColorPicker extends UIComponent {
	    constructor() {
	        super(...arguments);
	        /**
	         * @private
	         * 指定每个正方形的颜色小格子的宽高（以像素为单位）。
	         */
	        this._gridSize = 11;
	        /**
	         * @private
	         * 表示颜色样本列表面板的背景颜色值。
	         */
	        this._bgColor = "#ffffff";
	        /**
	         * @private
	         * 表示颜色样本列表面板的边框颜色值。
	         */
	        this._borderColor = "#000000";
	        /**
	         * @private
	         * 表示颜色样本列表面板选择或输入的颜色值。
	         */
	        this._inputColor = "#000000";
	        /**
	         * @private
	         * 表示颜色输入框的背景颜色值。
	         */
	        this._inputBgColor = "#efefef";
	        /**
	         * @private
	         * 表示颜色值列表。
	         */
	        this._colors = [];
	        /**
	         * @private
	         * 表示选择的颜色值。
	         */
	        this._selectedColor = "#000000";
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._colorPanel && this._colorPanel.destroy(destroyChild);
	        this._colorButton && this._colorButton.destroy(destroyChild);
	        this._colorPanel = null;
	        this._colorTiles = null;
	        this._colorBlock = null;
	        this._colorInput = null;
	        this._colorButton = null;
	        this._colors = null;
	        this.changeHandler = null;
	    }
	    /**
	     * @inheritDoc
	     * @internal
	    */
	    /*override*/ createChildren() {
	        this.addChild(this._colorButton = new Button());
	        this._colorPanel = new Box();
	        this._colorPanel.size(230, 166);
	        this._colorPanel.addChild(this._colorTiles = new Laya.Sprite());
	        this._colorPanel.addChild(this._colorBlock = new Laya.Sprite());
	        this._colorPanel.addChild(this._colorInput = new Laya.Input());
	    }
	    /**
	     * @inheritDoc
	     * @internal
	    */
	    /*override*/ initialize() {
	        this._colorButton.on(Laya.Event.CLICK, this, this.onColorButtonClick);
	        this._colorBlock.pos(5, 5);
	        this._colorInput.pos(60, 5);
	        this._colorInput.size(60, 20);
	        this._colorInput.on(Laya.Event.CHANGE, this, this.onColorInputChange);
	        this._colorInput.on(Laya.Event.KEY_DOWN, this, this.onColorFieldKeyDown);
	        this._colorTiles.pos(5, 30);
	        this._colorTiles.on(Laya.Event.MOUSE_MOVE, this, this.onColorTilesMouseMove);
	        this._colorTiles.on(Laya.Event.CLICK, this, this.onColorTilesClick);
	        this._colorTiles.size(20 * this._gridSize, 12 * this._gridSize);
	        this._colorPanel.on(Laya.Event.MOUSE_DOWN, this, this.onPanelMouseDown);
	        this.bgColor = this._bgColor;
	    }
	    onPanelMouseDown(e) {
	        e.stopPropagation();
	    }
	    /**
	     * 改变颜色样本列表面板。
	     */
	    changePanel() {
	        this._panelChanged = false;
	        var g = this._colorPanel.graphics;
	        g.clear(true);
	        //g.drawRect(0, 0, 230, 166, _bgColor);
	        g.drawRect(0, 0, 230, 166, this._bgColor, this._borderColor);
	        this.drawBlock(this._selectedColor);
	        this._colorInput.borderColor = this._borderColor;
	        this._colorInput.bgColor = this._inputBgColor;
	        this._colorInput.color = this._inputColor;
	        g = this._colorTiles.graphics;
	        g.clear(true);
	        var mainColors = [0x000000, 0x333333, 0x666666, 0x999999, 0xCCCCCC, 0xFFFFFF, 0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0x00FFFF, 0xFF00FF];
	        for (var i = 0; i < 12; i++) {
	            for (var j = 0; j < 20; j++) {
	                var color;
	                if (j === 0)
	                    color = mainColors[i];
	                else if (j === 1)
	                    color = 0x000000;
	                else
	                    color = (((i * 3 + j / 6) % 3 << 0) + ((i / 6) << 0) * 3) * 0x33 << 16 | j % 6 * 0x33 << 8 | (i << 0) % 6 * 0x33;
	                var strColor = UIUtils.toColor(color);
	                this._colors.push(strColor);
	                var x = j * this._gridSize;
	                var y = i * this._gridSize;
	                g.drawRect(x, y, this._gridSize, this._gridSize, strColor, "#000000");
	                //g.drawRect(x + 1, y + 1, _gridSize - 1, _gridSize - 1, strColor);
	            }
	        }
	    }
	    /**
	     * 颜色样本列表面板的显示按钮的 <code>Event.MOUSE_DOWN</code> 事件侦听处理函数。
	     */
	    onColorButtonClick(e) {
	        if (this._colorPanel.parent)
	            this.close();
	        else
	            this.open();
	    }
	    /**
	     * 打开颜色样本列表面板。
	     */
	    open() {
	        var Laya$1 = window.Laya;
	        var p = this.localToGlobal(new Laya.Point());
	        var px = p.x + this._colorPanel.width <= Laya$1.stage.width ? p.x : Laya$1.stage.width - this._colorPanel.width;
	        var py = p.y + this._colorButton.height;
	        py = py + this._colorPanel.height <= Laya$1.stage.height ? py : p.y - this._colorPanel.height;
	        this._colorPanel.pos(px, py);
	        this._colorPanel.zOrder = 1001;
	        Laya$1._currentStage.addChild(this._colorPanel);
	        Laya$1.stage.on(Laya.Event.MOUSE_DOWN, this, this.removeColorBox);
	    }
	    /**
	     * 关闭颜色样本列表面板。
	     */
	    close() {
	        window.Laya.stage.off(Laya.Event.MOUSE_DOWN, this, this.removeColorBox);
	        this._colorPanel.removeSelf();
	    }
	    /**
	     * 舞台的 <code>Event.MOUSE_DOWN</code> 事件侦听处理函数。
	     */
	    removeColorBox(e = null) {
	        this.close();
	        //var target:Sprite = e.target as Sprite;
	        //if (!_colorButton.contains(target) && !_colorPanel.contains(target)) {
	        //close();
	        //}
	    }
	    /**
	     * 小格子色块的 <code>Event.KEY_DOWN</code> 事件侦听处理函数。
	     */
	    onColorFieldKeyDown(e) {
	        if (e.keyCode == 13) {
	            if (this._colorInput.text)
	                this.selectedColor = this._colorInput.text;
	            else
	                this.selectedColor = null;
	            this.close();
	            e.stopPropagation();
	        }
	    }
	    /**
	     * 颜色值输入框 <code>Event.CHANGE</code> 事件侦听处理函数。
	     */
	    onColorInputChange(e = null) {
	        if (this._colorInput.text)
	            this.drawBlock(this._colorInput.text);
	        else
	            this.drawBlock("#FFFFFF");
	    }
	    /**
	     * 小格子色块的 <code>Event.CLICK</code> 事件侦听处理函数。
	     */
	    onColorTilesClick(e) {
	        this.selectedColor = this.getColorByMouse();
	        this.close();
	    }
	    /**
	     * @private
	     * 小格子色块的 <code>Event.MOUSE_MOVE</code> 事件侦听处理函数。
	     */
	    onColorTilesMouseMove(e) {
	        this._colorInput.focus = false;
	        var color = this.getColorByMouse();
	        this._colorInput.text = color;
	        this.drawBlock(color);
	    }
	    /**
	     * 通过鼠标位置取对应的颜色块的颜色值。
	     */
	    getColorByMouse() {
	        var point = this._colorTiles.getMousePoint();
	        var x = Math.floor(point.x / this._gridSize);
	        var y = Math.floor(point.y / this._gridSize);
	        return this._colors[y * 20 + x];
	    }
	    /**
	     * 绘制颜色块。
	     * @param color 需要绘制的颜色块的颜色值。
	     */
	    drawBlock(color) {
	        var g = this._colorBlock.graphics;
	        g.clear(true);
	        var showColor = color ? color : "#ffffff";
	        g.drawRect(0, 0, 50, 20, showColor, this._borderColor);
	        color || g.drawLine(0, 0, 50, 20, "#ff0000");
	    }
	    /**
	     * 表示选择的颜色值。
	     */
	    get selectedColor() {
	        return this._selectedColor;
	    }
	    set selectedColor(value) {
	        if (this._selectedColor != value) {
	            this._selectedColor = this._colorInput.text = value;
	            this.drawBlock(value);
	            this.changeColor();
	            this.changeHandler && this.changeHandler.runWith(this._selectedColor);
	            this.event(Laya.Event.CHANGE, Laya.Event.EMPTY.setTo(Laya.Event.CHANGE, this, this));
	        }
	    }
	    /**
	     * @copy laya.ui.Button#skin
	     */
	    get skin() {
	        return this._colorButton.skin;
	    }
	    set skin(value) {
	        this._colorButton.once(Laya.Event.LOADED, this, this.changeColor);
	        this._colorButton.skin = value;
	        //changeColor();
	    }
	    /**
	     * 改变颜色。
	     */
	    changeColor() {
	        var g = this.graphics;
	        g.clear(true);
	        var showColor = this._selectedColor || "#000000";
	        g.drawRect(0, 0, this._colorButton.width, this._colorButton.height, showColor);
	    }
	    /**
	     * 表示颜色样本列表面板的背景颜色值。
	     */
	    get bgColor() {
	        return this._bgColor;
	    }
	    set bgColor(value) {
	        this._bgColor = value;
	        this._setPanelChanged();
	    }
	    /**
	     * 表示颜色样本列表面板的边框颜色值。
	     */
	    get borderColor() {
	        return this._borderColor;
	    }
	    set borderColor(value) {
	        this._borderColor = value;
	        this._setPanelChanged();
	    }
	    /**
	     * 表示颜色样本列表面板选择或输入的颜色值。
	     */
	    get inputColor() {
	        return this._inputColor;
	    }
	    set inputColor(value) {
	        this._inputColor = value;
	        this._setPanelChanged();
	    }
	    /**
	     * 表示颜色输入框的背景颜色值。
	     */
	    get inputBgColor() {
	        return this._inputBgColor;
	    }
	    set inputBgColor(value) {
	        this._inputBgColor = value;
	        this._setPanelChanged();
	    }
	    /**@private */
	    _setPanelChanged() {
	        if (!this._panelChanged) {
	            this._panelChanged = true;
	            this.callLater(this.changePanel);
	        }
	    }
	}
	Laya.ILaya.regClass(ColorPicker);
	Laya.ClassUtils.regClass("laya.ui.ColorPicker", ColorPicker);
	Laya.ClassUtils.regClass("Laya.ColorPicker", ColorPicker);

	class IUI {
	}
	//static DialogManager:typeof DialogManager=null;
	IUI.Dialog = null;

	/**打开任意窗口后调度。
	 * @eventType Event.OPEN
	 */
	/*[Event(name = "open", type = "laya.events.Event")]*/
	/**关闭任意窗口后调度。
	 * @eventType Event.CLOSE
	 */
	/*[Event(name = "close", type = "laya.events.Event")]*/
	/**
	 * <code>DialogManager</code> 对话框管理容器，所有的对话框都在该容器内，并且受管理器管理。
	 * 任意对话框打开和关闭，都会出发管理类的open和close事件
	 * 可以通过UIConfig设置弹出框背景透明度，模式窗口点击边缘是否关闭，点击窗口是否切换层次等
	 * 通过设置对话框的zOrder属性，可以更改弹出的层次
	 */
	class DialogManager extends Laya.Sprite {
	    /**
	     * 创建一个新的 <code>DialogManager</code> 类实例。
	     */
	    constructor() {
	        super();
	        /**遮罩层*/
	        this.maskLayer = new Laya.Sprite();
	        /**@private 全局默认弹出对话框效果，可以设置一个效果代替默认的弹出效果，如果不想有任何效果，可以赋值为null*/
	        this.popupEffect = function (dialog) {
	            var Laya$1 = window.Laya;
	            dialog.scale(1, 1);
	            dialog._effectTween = Laya.Tween.from(dialog, { x: Laya$1.stage.width / 2, y: Laya$1.stage.height / 2, scaleX: 0, scaleY: 0 }, 300, Laya.Ease.backOut, Laya.Handler.create(this, this.doOpen, [dialog]), 0, false, false);
	        };
	        /**@private 全局默认关闭对话框效果，可以设置一个效果代替默认的关闭效果，如果不想有任何效果，可以赋值为null*/
	        this.closeEffect = function (dialog) {
	            var Laya$1 = window.Laya;
	            dialog._effectTween = Laya.Tween.to(dialog, { x: Laya$1.stage.width / 2, y: Laya$1.stage.height / 2, scaleX: 0, scaleY: 0 }, 300, Laya.Ease.strongOut, Laya.Handler.create(this, this.doClose, [dialog]), 0, false, false);
	        };
	        /**全局默认关闭对话框效果，可以设置一个效果代替默认的关闭效果，如果不想有任何效果，可以赋值为null*/
	        this.popupEffectHandler = new Laya.Handler(this, this.popupEffect);
	        /**全局默认弹出对话框效果，可以设置一个效果代替默认的弹出效果，如果不想有任何效果，可以赋值为null*/
	        this.closeEffectHandler = new Laya.Handler(this, this.closeEffect);
	        this.mouseEnabled = this.maskLayer.mouseEnabled = true;
	        this.zOrder = 1000;
	        var Laya$1 = window.Laya;
	        Laya$1.stage.addChild(this);
	        Laya$1.stage.on(Laya.Event.RESIZE, this, this._onResize);
	        if (UIConfig.closeDialogOnSide)
	            this.maskLayer.on("click", this, this._closeOnSide);
	        this._onResize(null);
	    }
	    _closeOnSide() {
	        var dialog = this.getChildAt(this.numChildren - 1);
	        if (dialog instanceof IUI.Dialog)
	            dialog.close();
	    }
	    /**设置锁定界面，如果为空则什么都不显示*/
	    setLockView(value) {
	        var Laya = window.Laya;
	        if (!this.lockLayer) {
	            this.lockLayer = new Box();
	            this.lockLayer.mouseEnabled = true;
	            this.lockLayer.size(Laya.stage.width, Laya.stage.height);
	        }
	        this.lockLayer.removeChildren();
	        if (value) {
	            value.centerX = value.centerY = 0;
	            this.lockLayer.addChild(value);
	        }
	    }
	    /**@private */
	    _onResize(e = null) {
	        var Laya = window.Laya;
	        var width = this.maskLayer.width = Laya.stage.width;
	        var height = this.maskLayer.height = Laya.stage.height;
	        if (this.lockLayer)
	            this.lockLayer.size(width, height);
	        this.maskLayer.graphics.clear(true);
	        this.maskLayer.graphics.drawRect(0, 0, width, height, UIConfig.popupBgColor);
	        this.maskLayer.alpha = UIConfig.popupBgAlpha;
	        for (var i = this.numChildren - 1; i > -1; i--) {
	            var item = this.getChildAt(i);
	            if (item.isPopupCenter)
	                this._centerDialog(item);
	        }
	    }
	    _centerDialog(dialog) {
	        var Laya = window.Laya;
	        dialog.x = Math.round(((Laya.stage.width - dialog.width) >> 1) + dialog.pivotX);
	        dialog.y = Math.round(((Laya.stage.height - dialog.height) >> 1) + dialog.pivotY);
	    }
	    /**
	     * 显示对话框
	     * @param dialog 需要显示的对象框 <code>Dialog</code> 实例。
	     * @param closeOther 是否关闭其它对话框，若值为ture，则关闭其它的对话框。
	     * @param showEffect 是否显示弹出效果
	     */
	    open(dialog, closeOther = false, showEffect = false) {
	        if (closeOther)
	            this._closeAll();
	        this._clearDialogEffect(dialog);
	        if (dialog.isPopupCenter)
	            this._centerDialog(dialog);
	        this.addChild(dialog);
	        if (dialog.isModal || this._getBit(Laya.Const.HAS_ZORDER))
	            window.Laya.timer.callLater(this, this._checkMask);
	        if (showEffect && dialog.popupEffect != null)
	            dialog.popupEffect.runWith(dialog);
	        else
	            this.doOpen(dialog);
	        this.event(Laya.Event.OPEN);
	    }
	    /**@private */
	    _clearDialogEffect(dialog) {
	        if (dialog._effectTween) {
	            Laya.Tween.clear(dialog._effectTween);
	            dialog._effectTween = null;
	        }
	    }
	    /**
	     * 执行打开对话框。
	     * @param dialog 需要关闭的对象框 <code>Dialog</code> 实例。
	     */
	    doOpen(dialog) {
	        dialog.onOpened(dialog._param);
	    }
	    /**
	     * 锁定所有层，显示加载条信息，防止双击
	     */
	    lock(value) {
	        if (this.lockLayer) {
	            if (value)
	                this.addChild(this.lockLayer);
	            else
	                this.lockLayer.removeSelf();
	        }
	    }
	    /**
	     * 关闭对话框。
	     * @param dialog 需要关闭的对象框 <code>Dialog</code> 实例。
	     */
	    close(dialog) {
	        this._clearDialogEffect(dialog);
	        if (dialog.isShowEffect && dialog.closeEffect != null)
	            dialog.closeEffect.runWith([dialog]);
	        else
	            this.doClose(dialog);
	        this.event(Laya.Event.CLOSE);
	    }
	    /**
	     * 执行关闭对话框。
	     * @param dialog 需要关闭的对象框 <code>Dialog</code> 实例。
	     */
	    doClose(dialog) {
	        dialog.removeSelf();
	        dialog.isModal && this._checkMask();
	        dialog.closeHandler && dialog.closeHandler.runWith(dialog.closeType);
	        dialog.onClosed(dialog.closeType);
	        if (dialog.autoDestroyAtClosed)
	            dialog.destroy();
	    }
	    /**
	     * 关闭所有的对话框。
	     */
	    closeAll() {
	        this._closeAll();
	        this.event(Laya.Event.CLOSE);
	    }
	    /**@private */
	    _closeAll() {
	        for (var i = this.numChildren - 1; i > -1; i--) {
	            var item = this.getChildAt(i);
	            if (item && item.close != null) {
	                this.doClose(item);
	            }
	        }
	    }
	    /**
	     * 根据组获取所有对话框
	     * @param	group 组名称
	     * @return	对话框数组
	     */
	    getDialogsByGroup(group) {
	        var arr = [];
	        for (var i = this.numChildren - 1; i > -1; i--) {
	            var item = this.getChildAt(i);
	            if (item && item.group === group) {
	                arr.push(item);
	            }
	        }
	        return arr;
	    }
	    /**
	     * 根据组关闭所有弹出框
	     * @param	group 需要关闭的组名称
	     * @return	需要关闭的对话框数组
	     */
	    closeByGroup(group) {
	        var arr = [];
	        for (var i = this.numChildren - 1; i > -1; i--) {
	            var item = this.getChildAt(i);
	            if (item && item.group === group) {
	                item.close();
	                arr.push(item);
	            }
	        }
	        return arr;
	    }
	    /**@internal 发生层次改变后，重新检查遮罩层是否正确*/
	    _checkMask() {
	        this.maskLayer.removeSelf();
	        for (var i = this.numChildren - 1; i > -1; i--) {
	            var dialog = this.getChildAt(i);
	            if (dialog && dialog.isModal) {
	                //trace(numChildren,i);
	                this.addChildAt(this.maskLayer, i);
	                return;
	            }
	        }
	    }
	}
	Laya.ClassUtils.regClass("laya.ui.DialogManager", DialogManager);
	Laya.ClassUtils.regClass("Laya.DialogManager", DialogManager);

	/**
	 * <code>LayoutBox</code> 是一个布局容器类。
	 */
	class LayoutBox extends Box {
	    constructor() {
	        super(...arguments);
	        /**@private */
	        this._space = 0;
	        /**@private */
	        this._align = "none";
	        /**@private */
	        this._itemChanged = false;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ addChild(child) {
	        child.on(Laya.Event.RESIZE, this, this.onResize);
	        this._setItemChanged();
	        return super.addChild(child);
	    }
	    onResize(e) {
	        this._setItemChanged();
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ addChildAt(child, index) {
	        child.on(Laya.Event.RESIZE, this, this.onResize);
	        this._setItemChanged();
	        return super.addChildAt(child, index);
	    }
	    /**
	     *  @inheritDoc
	     * @override
	    */
	    /*override*/ removeChildAt(index) {
	        this.getChildAt(index).off(Laya.Event.RESIZE, this, this.onResize);
	        this._setItemChanged();
	        return super.removeChildAt(index);
	    }
	    /** 刷新。*/
	    refresh() {
	        this._setItemChanged();
	    }
	    /**
	     * 改变子对象的布局。
	     */
	    changeItems() {
	        this._itemChanged = false;
	    }
	    /** 子对象的间隔。*/
	    get space() {
	        return this._space;
	    }
	    set space(value) {
	        this._space = value;
	        this._setItemChanged();
	    }
	    /** 子对象对齐方式。*/
	    get align() {
	        return this._align;
	    }
	    set align(value) {
	        this._align = value;
	        this._setItemChanged();
	    }
	    /**
	     * 排序项目列表。可通过重写改变默认排序规则。
	     * @param items  项目列表。
	     */
	    sortItem(items) {
	        if (items)
	            items.sort(function (a, b) { return a.y - b.y; });
	    }
	    _setItemChanged() {
	        if (!this._itemChanged) {
	            this._itemChanged = true;
	            this.callLater(this.changeItems);
	        }
	    }
	}
	Laya.ILaya.regClass(LayoutBox);
	Laya.ClassUtils.regClass("laya.ui.LayoutBox", LayoutBox);
	Laya.ClassUtils.regClass("Laya.LayoutBox", LayoutBox);

	/**
	     * <code>HBox</code> 是一个水平布局容器类。
	     */
	class HBox extends LayoutBox {
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ sortItem(items) {
	        if (items)
	            items.sort(function (a, b) { return a.x - b.x; });
	    }
	    /**
	     * @override
	     */
	    /*override*/ set height(value) {
	        if (this._height != value) {
	            super.height = value;
	            this.callLater(this.changeItems);
	        }
	    }
	    get height() {
	        return super.height;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ changeItems() {
	        this._itemChanged = false;
	        var items = [];
	        var maxHeight = 0;
	        for (var i = 0, n = this.numChildren; i < n; i++) {
	            var item = this.getChildAt(i);
	            if (item) {
	                items.push(item);
	                maxHeight = this._height ? this._height : Math.max(maxHeight, item.height * item.scaleY);
	            }
	        }
	        this.sortItem(items);
	        var left = 0;
	        for (i = 0, n = items.length; i < n; i++) {
	            item = items[i];
	            item.x = left;
	            left += item.width * item.scaleX + this._space;
	            if (this._align == HBox.TOP) {
	                item.y = 0;
	            }
	            else if (this._align == HBox.MIDDLE) {
	                item.y = (maxHeight - item.height * item.scaleY) * 0.5;
	            }
	            else if (this._align == HBox.BOTTOM) {
	                item.y = maxHeight - item.height * item.scaleY;
	            }
	        }
	        this._sizeChanged();
	    }
	}
	/**
	 * 无对齐。
	 */
	HBox.NONE = "none";
	/**
	 * 居顶部对齐。
	 */
	HBox.TOP = "top";
	/**
	 * 居中对齐。
	 */
	HBox.MIDDLE = "middle";
	/**
	 * 居底部对齐。
	 */
	HBox.BOTTOM = "bottom";
	Laya.ILaya.regClass(HBox);
	Laya.ClassUtils.regClass("laya.ui.HBox", HBox);
	Laya.ClassUtils.regClass("Laya.HBox", HBox);

	/**
	 * 值发生改变后调度。
	 * @eventType laya.events.Event
	 */
	/*[Event(name = "change", type = "laya.events.Event")]*/
	/**
	 * <code>ProgressBar</code> 组件显示内容的加载进度。
	 * @example <caption>以下示例代码，创建了一个新的 <code>ProgressBar</code> 实例，设置了它的皮肤、位置、宽高、网格等信息，并添加到舞台上。</caption>
	 * package
	 *	{
	 *		import laya.ui.ProgressBar;
	 *		import laya.utils.Handler;
	 *		public class ProgressBar_Example
	 *		{
	 *			private var progressBar:ProgressBar;
	 *			public function ProgressBar_Example()
	 *			{
	 *				Laya.init(640, 800);//设置游戏画布宽高。
	 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *				Laya.loader.load(["resource/ui/progress.png", "resource/ui/progress$bar.png"], Handler.create(this, onLoadComplete));//加载资源。
	 *			}
	 *			private function onLoadComplete():void
	 *			{
	 *				progressBar = new ProgressBar("resource/ui/progress.png");//创建一个 ProgressBar 类的实例对象 progressBar 。
	 *				progressBar.x = 100;//设置 progressBar 对象的属性 x 的值，用于控制 progressBar 对象的显示位置。
	 *				progressBar.y = 100;//设置 progressBar 对象的属性 y 的值，用于控制 progressBar 对象的显示位置。
	 *				progressBar.value = 0.3;//设置 progressBar 的进度值。
	 *				progressBar.width = 200;//设置 progressBar 的宽度。
	 *				progressBar.height = 50;//设置 progressBar 的高度。
	 *				progressBar.sizeGrid = "5,10,5,10";//设置 progressBar 的网格信息。
	 *				progressBar.changeHandler = new Handler(this, onChange);//设置 progressBar 的value值改变时执行的处理器。
	 *				Laya.stage.addChild(progressBar);//将 progressBar 添加到显示列表。
	 *				Laya.timer.once(3000, this, changeValue);//设定 3000ms（毫秒）后，执行函数changeValue。
	 *			}
	 *			private function changeValue():void
	 *			{
	 *				trace("改变进度条的进度值。");
	 *				progressBar.value = 0.6;
	 *			}
	 *			private function onChange(value:Number):void
	 *			{
	 *				trace("进度发生改变： value=" ,value);
	 *			}
	 *		}
	 *	}
	 * @example
	 * Laya.init(640, 800);//设置游戏画布宽高
	 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
	 * var res = ["resource/ui/progress.png", "resource/ui/progress$bar.png"];
	 * Laya.loader.load(res, laya.utils.Handler.create(this, onLoadComplete));//加载资源。
	 * function onLoadComplete()
	 * {
	 *     progressBar = new laya.ui.ProgressBar("resource/ui/progress.png");//创建一个 ProgressBar 类的实例对象 progressBar 。
	 *     progressBar.x = 100;//设置 progressBar 对象的属性 x 的值，用于控制 progressBar 对象的显示位置。
	 *     progressBar.y = 100;//设置 progressBar 对象的属性 y 的值，用于控制 progressBar 对象的显示位置。
	 *     progressBar.value = 0.3;//设置 progressBar 的进度值。
	 *     progressBar.width = 200;//设置 progressBar 的宽度。
	 *     progressBar.height = 50;//设置 progressBar 的高度。
	 *     progressBar.sizeGrid = "10,5,10,5";//设置 progressBar 的网格信息。
	 *     progressBar.changeHandler = new laya.utils.Handler(this, onChange);//设置 progressBar 的value值改变时执行的处理器。
	 *     Laya.stage.addChild(progressBar);//将 progressBar 添加到显示列表。
	 *     Laya.timer.once(3000, this, changeValue);//设定 3000ms（毫秒）后，执行函数changeValue。
	 * }
	 * function changeValue()
	 * {
	 *     console.log("改变进度条的进度值。");
	 *     progressBar.value = 0.6;
	 * }
	 * function onChange(value)
	 * {
	 *     console.log("进度发生改变： value=" ,value);
	 * }
	 * @example
	 * import ProgressBar = laya.ui.ProgressBar;
	 * import Handler = laya.utils.Handler;
	 * class ProgressBar_Example {
	 *     private progressBar: ProgressBar;
	 *     public ProgressBar_Example() {
	 *         Laya.init(640, 800);//设置游戏画布宽高。
	 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *         Laya.loader.load(["resource/ui/progress.png", "resource/ui/progress$bar.png"], Handler.create(this, this.onLoadComplete));//加载资源。
	 *     }
	 *     private onLoadComplete(): void {
	 *         this.progressBar = new ProgressBar("resource/ui/progress.png");//创建一个 ProgressBar 类的实例对象 progressBar 。
	 *         this.progressBar.x = 100;//设置 progressBar 对象的属性 x 的值，用于控制 progressBar 对象的显示位置。
	 *         this.progressBar.y = 100;//设置 progressBar 对象的属性 y 的值，用于控制 progressBar 对象的显示位置。
	 *         this.progressBar.value = 0.3;//设置 progressBar 的进度值。
	 *         this.progressBar.width = 200;//设置 progressBar 的宽度。
	 *         this.progressBar.height = 50;//设置 progressBar 的高度。
	 *         this.progressBar.sizeGrid = "5,10,5,10";//设置 progressBar 的网格信息。
	 *         this.progressBar.changeHandler = new Handler(this, this.onChange);//设置 progressBar 的value值改变时执行的处理器。
	 *         Laya.stage.addChild(this.progressBar);//将 progressBar 添加到显示列表。
	 *         Laya.timer.once(3000, this, this.changeValue);//设定 3000ms（毫秒）后，执行函数changeValue。
	 *     }
	 *     private changeValue(): void {
	 *         console.log("改变进度条的进度值。");
	 *         this.progressBar.value = 0.6;
	 *     }
	 *     private onChange(value: number): void {
	 *         console.log("进度发生改变： value=", value);
	 *     }
	 * }
	 */
	class ProgressBar extends UIComponent {
	    /**
	     * 创建一个新的 <code>ProgressBar</code> 类实例。
	     * @param skin 皮肤地址。
	     */
	    constructor(skin = null) {
	        super();
	        /**@private */
	        this._value = 0.5;
	        this.skin = skin;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._bg && this._bg.destroy(destroyChild);
	        this._bar && this._bar.destroy(destroyChild);
	        this._bg = this._bar = null;
	        this.changeHandler = null;
	    }
	    /**
	     * @inheritDoc
	     * @internal
	    */
	    createChildren() {
	        this.addChild(this._bg = new Image());
	        this.addChild(this._bar = new Image());
	        this._bar._bitmap.autoCacheCmd = false;
	    }
	    /**
	     * @copy laya.ui.Image#skin
	     */
	    get skin() {
	        return this._skin;
	    }
	    set skin(value) {
	        if (this._skin != value) {
	            this._skin = value;
	            if (this._skin && !Laya.Loader.getRes(this._skin)) {
	                window.Laya.loader.load(this._skin, Laya.Handler.create(this, this._skinLoaded), null, Laya.Loader.IMAGE, 1); // TODO TS
	            }
	            else {
	                this._skinLoaded();
	            }
	        }
	    }
	    _skinLoaded() {
	        this._bg.skin = this._skin;
	        this._bar.skin = this._skin.replace(".png", "$bar.png");
	        this.callLater(this.changeValue);
	        this._sizeChanged();
	        this.event(Laya.Event.LOADED);
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    measureWidth() {
	        return this._bg.width;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    measureHeight() {
	        return this._bg.height;
	    }
	    /**
	     * 当前的进度量。
	     * <p><b>取值：</b>介于0和1之间。</p>
	     */
	    get value() {
	        return this._value;
	    }
	    set value(num) {
	        if (this._value != num) {
	            num = num > 1 ? 1 : num < 0 ? 0 : num;
	            this._value = num;
	            this.callLater(this.changeValue);
	            this.event(Laya.Event.CHANGE);
	            this.changeHandler && this.changeHandler.runWith(num);
	        }
	    }
	    /**
	     * @private
	     * 更改进度值的显示。
	     */
	    changeValue() {
	        if (this.sizeGrid) {
	            var grid = this.sizeGrid.split(",");
	            var left = Number(grid[3]);
	            var right = Number(grid[1]);
	            var max = this.width - left - right;
	            var sw = max * this._value;
	            this._bar.width = left + right + sw;
	            this._bar.visible = this._bar.width > left + right;
	        }
	        else {
	            this._bar.width = this.width * this._value;
	        }
	    }
	    /**
	     * 获取进度条对象。
	     */
	    get bar() {
	        return this._bar;
	    }
	    /**
	     * 获取背景条对象。
	     */
	    get bg() {
	        return this._bg;
	    }
	    /**
	     * <p>当前 <code>ProgressBar</code> 实例的进度条背景位图（ <code>Image</code> 实例）的有效缩放网格数据。</p>
	     * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
	     * <ul><li>例如："4,4,4,4,1"</li></ul></p>
	     * @see laya.ui.AutoBitmap.sizeGrid
	     */
	    get sizeGrid() {
	        return this._bg.sizeGrid;
	    }
	    set sizeGrid(value) {
	        this._bg.sizeGrid = this._bar.sizeGrid = value;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    set width(value) {
	        super.width = value;
	        this._bg.width = this._width;
	        this.callLater(this.changeValue);
	    }
	    get width() {
	        return super.width;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    set height(value) {
	        super.height = value;
	        this._bg.height = this._height;
	        this._bar.height = this._height;
	    }
	    get height() {
	        return super.height;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    set dataSource(value) {
	        this._dataSource = value;
	        if (typeof (value) == 'number' || typeof (value) == 'string')
	            this.value = Number(value);
	        else
	            super.dataSource = value;
	    }
	    get dataSource() {
	        return super.dataSource;
	    }
	}
	Laya.ILaya.regClass(ProgressBar);
	Laya.ClassUtils.regClass("laya.ui.ProgressBar", ProgressBar);
	Laya.ClassUtils.regClass("Laya.ProgressBar", ProgressBar);

	/**
	 * <code>Radio</code> 控件使用户可在一组互相排斥的选择中做出一种选择。
	 * 用户一次只能选择 <code>Radio</code> 组中的一个成员。选择未选中的组成员将取消选择该组中当前所选的 <code>Radio</code> 控件。
	 * @see laya.ui.RadioGroup
	 */
	class Radio extends Button {
	    /**
	     * 创建一个新的 <code>Radio</code> 类实例。
	     * @param skin 皮肤。
	     * @param label 标签。
	     */
	    constructor(skin = null, label = "") {
	        super(skin, label);
	        // preinitialize 放到这里了，因为不知道什么时候调用
	        this.toggle = false;
	        this._autoSize = false;
	    }
	    /**
	     * @inheritDoc
	     * @override
	     * */
	    /*override*/ destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._value = null;
	    }
	    /**
	     * @internal
	     */
	    preinitialize() {
	        super.preinitialize();
	        this.toggle = false;
	        this._autoSize = false;
	    }
	    /**
	     * @inheritDoc
	     * @internal
	     * */
	    initialize() {
	        super.initialize();
	        this.createText();
	        this._text.align = "left";
	        this._text.valign = "top";
	        this._text.width = 0;
	        this.on(Laya.Event.CLICK, this, this.onClick);
	    }
	    /**
	     * @private
	     * 对象的<code>Event.CLICK</code>事件侦听处理函数。
	     */
	    onClick(e) {
	        this.selected = true;
	    }
	    /**
	     * 获取或设置 <code>Radio</code> 关联的可选用户定义值。
	     */
	    get value() {
	        return this._value != null ? this._value : this.label;
	    }
	    set value(obj) {
	        this._value = obj;
	    }
	}
	Laya.ILaya.regClass(Radio);
	Laya.ClassUtils.regClass("laya.ui.Radio", Radio);
	Laya.ClassUtils.regClass("Laya.Radio", Radio);

	/**
	 * 当 <code>Group</code> 实例的 <code>selectedIndex</code> 属性发生变化时调度。
	 * @eventType laya.events.Event
	 */
	/*[Event(name = "change", type = "laya.events.Event")]*/
	/**
	 * <code>Group</code> 是一个可以自动布局的项集合控件。
	 * <p> <code>Group</code> 的默认项对象为 <code>Button</code> 类实例。
	 * <code>Group</code> 是 <code>Tab</code> 和 <code>RadioGroup</code> 的基类。</p>
	 */
	class UIGroup extends Box {
	    /**
	     * 创建一个新的 <code>Group</code> 类实例。
	     * @param labels 标签集字符串。以逗号做分割，如"item0,item1,item2,item3,item4,item5"。
	     * @param skin 皮肤。
	     */
	    constructor(labels = null, skin = null) {
	        super();
	        /**@private */
	        this._selectedIndex = -1;
	        /**@private */
	        this._direction = "horizontal";
	        /**@private */
	        this._space = 0;
	        this.skin = skin;
	        this.labels = labels;
	    }
	    /**
	     * @internal
	    */
	    preinitialize() {
	        this.mouseEnabled = true;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._items && (this._items.length = 0);
	        this._items = null;
	        this.selectHandler = null;
	    }
	    /**
	     * 添加一个项对象，返回此项对象的索引id。
	     *
	     * @param item 需要添加的项对象。
	     * @param autoLayOut 是否自动布局，如果为true，会根据 <code>direction</code> 和 <code>space</code> 属性计算item的位置。
	     * @return
	     */
	    addItem(item, autoLayOut = true) {
	        var display = item;
	        var index = this._items.length;
	        display.name = "item" + index;
	        this.addChild(display);
	        this.initItems();
	        if (autoLayOut && index > 0) {
	            var preItem = this._items[index - 1];
	            if (this._direction == "horizontal") {
	                display.x = preItem._x + preItem.width + this._space;
	            }
	            else {
	                display.y = preItem._y + preItem.height + this._space;
	            }
	        }
	        else {
	            if (autoLayOut) {
	                display.x = 0;
	                display.y = 0;
	            }
	        }
	        return index;
	    }
	    /**
	     * 删除一个项对象。
	     * @param item 需要删除的项对象。
	     * @param autoLayOut 是否自动布局，如果为true，会根据 <code>direction</code> 和 <code>space</code> 属性计算item的位置。
	     */
	    delItem(item, autoLayOut = true) {
	        var index = this._items.indexOf(item);
	        if (index != -1) {
	            var display = item;
	            this.removeChild(display);
	            for (var i = index + 1, n = this._items.length; i < n; i++) {
	                var child = this._items[i];
	                child.name = "item" + (i - 1);
	                if (autoLayOut) {
	                    if (this._direction == "horizontal") {
	                        child.x -= display.width + this._space;
	                    }
	                    else {
	                        child.y -= display.height + this._space;
	                    }
	                }
	            }
	            this.initItems();
	            if (this._selectedIndex > -1) {
	                var newIndex;
	                newIndex = this._selectedIndex < this._items.length ? this._selectedIndex : (this._selectedIndex - 1);
	                this._selectedIndex = -1;
	                this.selectedIndex = newIndex;
	            }
	        }
	    }
	    /**@internal */
	    _afterInited() {
	        this.initItems();
	    }
	    /**
	     * 初始化项对象们。
	     */
	    initItems() {
	        this._items || (this._items = []);
	        this._items.length = 0;
	        for (var i = 0; i < 10000; i++) {
	            var item = this.getChildByName("item" + i);
	            if (item == null)
	                break;
	            this._items.push(item);
	            item.selected = (i === this._selectedIndex);
	            item.clickHandler = Laya.Handler.create(this, this.itemClick, [i], false);
	        }
	    }
	    /**
	     * @private
	     * 项对象的点击事件侦听处理函数。
	     * @param index 项索引。
	     */
	    itemClick(index) {
	        this.selectedIndex = index;
	    }
	    /**
	     * 表示当前选择的项索引。默认值为-1。
	     */
	    get selectedIndex() {
	        return this._selectedIndex;
	    }
	    set selectedIndex(value) {
	        if (this._selectedIndex != value) {
	            this.setSelect(this._selectedIndex, false);
	            this._selectedIndex = value;
	            this.setSelect(value, true);
	            this.event(Laya.Event.CHANGE);
	            this.selectHandler && this.selectHandler.runWith(this._selectedIndex);
	        }
	    }
	    /**
	     * @private
	     * 通过对象的索引设置项对象的 <code>selected</code> 属性值。
	     * @param index 需要设置的项对象的索引。
	     * @param selected 表示项对象的选中状态。
	     */
	    setSelect(index, selected) {
	        if (this._items && index > -1 && index < this._items.length)
	            this._items[index].selected = selected;
	    }
	    /**
	     * @copy laya.ui.Image#skin
	     */
	    get skin() {
	        return this._skin;
	    }
	    set skin(value) {
	        if (this._skin != value) {
	            this._skin = value;
	            if (this._skin && !Laya.Loader.getRes(this._skin)) {
	                window.Laya.loader.load(this._skin, Laya.Handler.create(this, this._skinLoaded), null, Laya.Loader.IMAGE, 1);
	            }
	            else {
	                this._skinLoaded();
	            }
	        }
	    }
	    _skinLoaded() {
	        this._setLabelChanged();
	        this.event(Laya.Event.LOADED);
	    }
	    /**
	     * 标签集合字符串。以逗号做分割，如"item0,item1,item2,item3,item4,item5"。
	     */
	    get labels() {
	        return this._labels;
	    }
	    set labels(value) {
	        if (this._labels != value) {
	            this._labels = value;
	            this.removeChildren();
	            this._setLabelChanged();
	            if (this._labels) {
	                var a = this._labels.split(",");
	                for (var i = 0, n = a.length; i < n; i++) {
	                    var item = this.createItem(this._skin, a[i]);
	                    item.name = "item" + i;
	                    this.addChild(item);
	                }
	            }
	            this.initItems();
	        }
	    }
	    /**
	     * @private
	     * 创建一个项显示对象。
	     * @param skin 项对象的皮肤。
	     * @param label 项对象标签。
	     */
	    createItem(skin, label) {
	        return null;
	    }
	    /**
	     * @copy laya.ui.Button#labelColors()
	     */
	    get labelColors() {
	        return this._labelColors;
	    }
	    set labelColors(value) {
	        if (this._labelColors != value) {
	            this._labelColors = value;
	            this._setLabelChanged();
	        }
	    }
	    /**
	     * <p>描边宽度（以像素为单位）。</p>
	     * 默认值0，表示不描边。
	     * @see laya.display.Text.stroke()
	     */
	    get labelStroke() {
	        return this._labelStroke;
	    }
	    set labelStroke(value) {
	        if (this._labelStroke != value) {
	            this._labelStroke = value;
	            this._setLabelChanged();
	        }
	    }
	    /**
	     * <p>描边颜色，以字符串表示。</p>
	     * 默认值为 "#000000"（黑色）;
	     * @see laya.display.Text.strokeColor()
	     */
	    get labelStrokeColor() {
	        return this._labelStrokeColor;
	    }
	    set labelStrokeColor(value) {
	        if (this._labelStrokeColor != value) {
	            this._labelStrokeColor = value;
	            this._setLabelChanged();
	        }
	    }
	    /**
	     * <p>表示各个状态下的描边颜色。</p>
	     * @see laya.display.Text.strokeColor()
	     */
	    get strokeColors() {
	        return this._strokeColors;
	    }
	    set strokeColors(value) {
	        if (this._strokeColors != value) {
	            this._strokeColors = value;
	            this._setLabelChanged();
	        }
	    }
	    /**
	     * 表示按钮文本标签的字体大小。
	     */
	    get labelSize() {
	        return this._labelSize;
	    }
	    set labelSize(value) {
	        if (this._labelSize != value) {
	            this._labelSize = value;
	            this._setLabelChanged();
	        }
	    }
	    /**
	     * 表示按钮的状态值，以数字表示，默认为3态。
	     * @see laya.ui.Button#stateNum
	     */
	    get stateNum() {
	        return this._stateNum;
	    }
	    set stateNum(value) {
	        if (this._stateNum != value) {
	            this._stateNum = value;
	            this._setLabelChanged();
	        }
	    }
	    /**
	     * 表示按钮文本标签是否为粗体字。
	     */
	    get labelBold() {
	        return this._labelBold;
	    }
	    set labelBold(value) {
	        if (this._labelBold != value) {
	            this._labelBold = value;
	            this._setLabelChanged();
	        }
	    }
	    /**
	     * 表示按钮文本标签的字体名称，以字符串形式表示。
	     * @see laya.display.Text.font()
	     */
	    get labelFont() {
	        return this._labelFont;
	    }
	    set labelFont(value) {
	        if (this._labelFont != value) {
	            this._labelFont = value;
	            this._setLabelChanged();
	        }
	    }
	    /**
	     * 表示按钮文本标签的边距。
	     * <p><b>格式：</b>"上边距,右边距,下边距,左边距"。</p>
	     */
	    get labelPadding() {
	        return this._labelPadding;
	    }
	    set labelPadding(value) {
	        if (this._labelPadding != value) {
	            this._labelPadding = value;
	            this._setLabelChanged();
	        }
	    }
	    /**
	     * 布局方向。
	     * <p>默认值为"horizontal"。</p>
	     * <p><b>取值：</b>
	     * <li>"horizontal"：表示水平布局。</li>
	     * <li>"vertical"：表示垂直布局。</li>
	     * </p>
	     */
	    get direction() {
	        return this._direction;
	    }
	    set direction(value) {
	        this._direction = value;
	        this._setLabelChanged();
	    }
	    /**
	     * 项对象们之间的间隔（以像素为单位）。
	     */
	    get space() {
	        return this._space;
	    }
	    set space(value) {
	        this._space = value;
	        this._setLabelChanged();
	    }
	    /**
	     * @private
	     * 更改项对象的属性值。
	     */
	    changeLabels() {
	        this._labelChanged = false;
	        if (this._items) {
	            var left = 0;
	            for (var i = 0, n = this._items.length; i < n; i++) {
	                var btn = this._items[i];
	                this._skin && (btn.skin = this._skin);
	                this._labelColors && (btn.labelColors = this._labelColors);
	                this._labelSize && (btn.labelSize = this._labelSize);
	                this._labelStroke && (btn.labelStroke = this._labelStroke);
	                this._labelStrokeColor && (btn.labelStrokeColor = this._labelStrokeColor);
	                this._strokeColors && (btn.strokeColors = this._strokeColors);
	                this._labelBold && (btn.labelBold = this._labelBold);
	                this._labelPadding && (btn.labelPadding = this._labelPadding);
	                this._labelAlign && (btn.labelAlign = this._labelAlign);
	                this._stateNum && (btn.stateNum = this._stateNum);
	                this._labelFont && (btn.labelFont = this._labelFont);
	                if (this._direction === "horizontal") {
	                    btn.y = 0;
	                    btn.x = left;
	                    left += btn.width + this._space;
	                }
	                else {
	                    btn.x = 0;
	                    btn.y = left;
	                    left += btn.height + this._space;
	                }
	            }
	        }
	        this._sizeChanged();
	    }
	    /**
	     * @inheritDoc
	     * @internal
	    */
	    commitMeasure() {
	        this.runCallLater(this.changeLabels);
	    }
	    /**
	     * 项对象们的存放数组。
	     */
	    get items() {
	        return this._items;
	    }
	    /**
	     * 获取或设置当前选择的项对象。
	     */
	    get selection() {
	        return this._selectedIndex > -1 && this._selectedIndex < this._items.length ? this._items[this._selectedIndex] : null;
	    }
	    set selection(value) {
	        this.selectedIndex = this._items.indexOf(value);
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    set dataSource(value) {
	        this._dataSource = value;
	        if (typeof (value) == 'number' || typeof (value) == 'string')
	            this.selectedIndex = parseInt(value);
	        else if (value instanceof Array)
	            this.labels = value.join(",");
	        else
	            super.dataSource = value;
	    }
	    get dataSource() {
	        return super.dataSource;
	    }
	    /**@private */
	    _setLabelChanged() {
	        if (!this._labelChanged) {
	            this._labelChanged = true;
	            this.callLater(this.changeLabels);
	        }
	    }
	}
	Laya.ILaya.regClass(UIGroup);
	Laya.ClassUtils.regClass("laya.ui.UIGroup", UIGroup);
	Laya.ClassUtils.regClass("Laya.UIGroup", UIGroup);

	/**
	 * 当 <code>Group</code> 实例的 <code>selectedIndex</code> 属性发生变化时调度。
	 * @eventType laya.events.Event
	 */
	/*[Event(name = "change", type = "laya.events.Event")]*/
	/**
	 * <code>RadioGroup</code> 控件定义一组 <code>Radio</code> 控件，这些控件相互排斥；
	 * 因此，用户每次只能选择一个 <code>Radio</code> 控件。
	 *
	 * @example <caption>以下示例代码，创建了一个 <code>RadioGroup</code> 实例。</caption>
	 * package
	 *	{
	 *		import laya.ui.Radio;
	 *		import laya.ui.RadioGroup;
	 *		import laya.utils.Handler;
	 *		public class RadioGroup_Example
	 *		{
	 *			public function RadioGroup_Example()
	 *			{
	 *				Laya.init(640, 800);//设置游戏画布宽高。
	 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *				Laya.loader.load(["resource/ui/radio.png"], Handler.create(this, onLoadComplete));//加载资源。
	 *			}
	 *			private function onLoadComplete():void
	 *			{
	 *				var radioGroup:RadioGroup = new RadioGroup();//创建一个 RadioGroup 类的实例对象 radioGroup 。
	 *				radioGroup.pos(100, 100);//设置 radioGroup 的位置信息。
	 *				radioGroup.labels = "item0,item1,item2";//设置 radioGroup 的标签集。
	 *				radioGroup.skin = "resource/ui/radio.png";//设置 radioGroup 的皮肤。
	 *				radioGroup.space = 10;//设置 radioGroup 的项间隔距离。
	 *				radioGroup.selectHandler = new Handler(this, onSelect);//设置 radioGroup 的选择项发生改变时执行的处理器。
	 *				Laya.stage.addChild(radioGroup);//将 radioGroup 添加到显示列表。
	 *			}
	 *			private function onSelect(index:int):void
	 *			{
	 *				trace("当前选择的单选按钮索引: index= ", index);
	 *			}
	 *		}
	 *	}
	 * @example
	 * Laya.init(640, 800);//设置游戏画布宽高、渲染模式
	 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
	 * Laya.loader.load(["resource/ui/radio.png"], laya.utils.Handler.create(this, onLoadComplete));
	 * function onLoadComplete() {
	 *     var radioGroup= new laya.ui.RadioGroup();//创建一个 RadioGroup 类的实例对象 radioGroup 。
	 *     radioGroup.pos(100, 100);//设置 radioGroup 的位置信息。
	 *     radioGroup.labels = "item0,item1,item2";//设置 radioGroup 的标签集。
	 *     radioGroup.skin = "resource/ui/radio.png";//设置 radioGroup 的皮肤。
	 *     radioGroup.space = 10;//设置 radioGroup 的项间隔距离。
	 *     radioGroup.selectHandler = new laya.utils.Handler(this, onSelect);//设置 radioGroup 的选择项发生改变时执行的处理器。
	 *     Laya.stage.addChild(radioGroup);//将 radioGroup 添加到显示列表。
	 * }
	 * function onSelect(index) {
	 *     console.log("当前选择的单选按钮索引: index= ", index);
	 * }
	 * @example
	 * import Radio = laya.ui.Radio;
	 * import RadioGroup = laya.ui.RadioGroup;
	 * import Handler = laya.utils.Handler;
	 * class RadioGroup_Example {
	 *     constructor() {
	 *         Laya.init(640, 800);//设置游戏画布宽高。
	 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *         Laya.loader.load(["resource/ui/radio.png"], Handler.create(this, this.onLoadComplete));//加载资源。
	 *     }
	 *     private onLoadComplete(): void {
	 *         var radioGroup: RadioGroup = new RadioGroup();//创建一个 RadioGroup 类的实例对象 radioGroup 。
	 *         radioGroup.pos(100, 100);//设置 radioGroup 的位置信息。
	 *         radioGroup.labels = "item0,item1,item2";//设置 radioGroup 的标签集。
	 *         radioGroup.skin = "resource/ui/radio.png";//设置 radioGroup 的皮肤。
	 *         radioGroup.space = 10;//设置 radioGroup 的项间隔距离。
	 *         radioGroup.selectHandler = new Handler(this, this.onSelect);//设置 radioGroup 的选择项发生改变时执行的处理器。
	 *         Laya.stage.addChild(radioGroup);//将 radioGroup 添加到显示列表。
	 *     }
	 *     private onSelect(index: number): void {
	 *         console.log("当前选择的单选按钮索引: index= ", index);
	 *     }
	 * }
	 */
	class RadioGroup extends UIGroup {
	    /**@inheritDoc
	     * @override
	    */
	    createItem(skin, label) {
	        return new Radio(skin, label);
	    }
	}
	Laya.ILaya.regClass(RadioGroup);
	Laya.ClassUtils.regClass("laya.ui.RadioGroup", RadioGroup);
	Laya.ClassUtils.regClass("Laya.RadioGroup", RadioGroup);

	/**
	 * 当 <code>Group</code> 实例的 <code>selectedIndex</code> 属性发生变化时调度。
	 * @eventType laya.events.Event
	 */
	/*[Event(name = "change", type = "laya.events.Event")]*/
	/**
	 * <code>Tab</code> 组件用来定义选项卡按钮组。	 *
	 * <p>属性：<code>selectedIndex</code> 的默认值为-1。</p>
	 *
	 * @example <caption>以下示例代码，创建了一个 <code>Tab</code> 实例。</caption>
	 * package
	 *	{
	 *		import laya.ui.Tab;
	 *		import laya.utils.Handler;
	 *		public class Tab_Example
	 *		{
	 *			public function Tab_Example()
	 *			{
	 *				Laya.init(640, 800);//设置游戏画布宽高。
	 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *				Laya.loader.load(["resource/ui/tab.png"], Handler.create(this, onLoadComplete));//加载资源。
	 *			}
	 *			private function onLoadComplete():void
	 *			{
	 *				var tab:Tab = new Tab();//创建一个 Tab 类的实例对象 tab 。
	 *				tab.skin = "resource/ui/tab.png";//设置 tab 的皮肤。
	 *				tab.labels = "item0,item1,item2";//设置 tab 的标签集。
	 *				tab.x = 100;//设置 tab 对象的属性 x 的值，用于控制 tab 对象的显示位置。
	 *				tab.y = 100;//设置 tab 对象的属性 y 的值，用于控制 tab 对象的显示位置。
	 *				tab.selectHandler = new Handler(this, onSelect);//设置 tab 的选择项发生改变时执行的处理器。
	 *				Laya.stage.addChild(tab);//将 tab 添到显示列表。
	 *			}
	 *			private function onSelect(index:int):void
	 *			{
	 *				trace("当前选择的表情页索引: index= ", index);
	 *			}
	 *		}
	 *	}
	 * @example
	 * Laya.init(640, 800);//设置游戏画布宽高
	 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
	 * Laya.loader.load(["resource/ui/tab.png"], laya.utils.Handler.create(this, onLoadComplete));
	 * function onLoadComplete() {
	 *     var tab = new laya.ui.Tab();//创建一个 Tab 类的实例对象 tab 。
	 *     tab.skin = "resource/ui/tab.png";//设置 tab 的皮肤。
	 *     tab.labels = "item0,item1,item2";//设置 tab 的标签集。
	 *     tab.x = 100;//设置 tab 对象的属性 x 的值，用于控制 tab 对象的显示位置。
	 *     tab.y = 100;//设置 tab 对象的属性 y 的值，用于控制 tab 对象的显示位置。
	 *     tab.selectHandler = new laya.utils.Handler(this, onSelect);//设置 tab 的选择项发生改变时执行的处理器。
	 *     Laya.stage.addChild(tab);//将 tab 添到显示列表。
	 * }
	 * function onSelect(index) {
	 *     console.log("当前选择的标签页索引: index= ", index);
	 * }
	 * @example
	 * import Tab = laya.ui.Tab;
	 * import Handler = laya.utils.Handler;
	 * class Tab_Example {
	 *     constructor() {
	 *         Laya.init(640, 800);//设置游戏画布宽高。
	 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *         Laya.loader.load(["resource/ui/tab.png"], Handler.create(this, this.onLoadComplete));//加载资源。
	 *     }
	 *     private onLoadComplete(): void {
	 *         var tab: Tab = new Tab();//创建一个 Tab 类的实例对象 tab 。
	 *         tab.skin = "resource/ui/tab.png";//设置 tab 的皮肤。
	 *         tab.labels = "item0,item1,item2";//设置 tab 的标签集。
	 *         tab.x = 100;//设置 tab 对象的属性 x 的值，用于控制 tab 对象的显示位置。
	 *         tab.y = 100;//设置 tab 对象的属性 y 的值，用于控制 tab 对象的显示位置。
	 *         tab.selectHandler = new Handler(this, this.onSelect);//设置 tab 的选择项发生改变时执行的处理器。
	 *         Laya.stage.addChild(tab);//将 tab 添到显示列表。
	 *     }
	 *     private onSelect(index: number): void {
	 *         console.log("当前选择的表情页索引: index= ", index);
	 *     }
	 * }
	 */
	class Tab extends UIGroup {
	    /**
	     * @private
	     * @inheritDoc
	     * @override
	     */
	    createItem(skin, label) {
	        return new Button(skin, label);
	    }
	}
	Laya.ILaya.regClass(Tab);
	Laya.ClassUtils.regClass("laya.ui.Tab", Tab);
	Laya.ClassUtils.regClass("Laya.Tab", Tab);

	/**
	 * <code>ViewStack</code> 类用于视图堆栈类，用于视图的显示等设置处理。
	 */
	class ViewStack extends Box {
	    constructor() {
	        super(...arguments);
	        /**@private */
	        this._setIndexHandler = Laya.Handler.create(this, this.setIndex, null, false);
	    }
	    /**
	     * 批量设置视图对象。
	     * @param views 视图对象数组。
	     */
	    setItems(views) {
	        this.removeChildren();
	        var index = 0;
	        for (var i = 0, n = views.length; i < n; i++) {
	            var item = views[i];
	            if (item) {
	                item.name = "item" + index;
	                this.addChild(item);
	                index++;
	            }
	        }
	        this.initItems();
	    }
	    /**
	     * 添加视图。
	     * @internal 添加视图对象，并设置此视图对象的<code>name</code> 属性。
	     * @param view 需要添加的视图对象。
	     */
	    addItem(view) {
	        view.name = "item" + this._items.length;
	        this.addChild(view);
	        this.initItems();
	    }
	    /**@internal */
	    _afterInited() {
	        this.initItems();
	    }
	    /**
	     * 初始化视图对象集合。
	     */
	    initItems() {
	        this._items = [];
	        for (var i = 0; i < 10000; i++) {
	            var item = this.getChildByName("item" + i);
	            if (item == null) {
	                break;
	            }
	            this._items.push(item);
	            item.visible = (i == this._selectedIndex);
	        }
	    }
	    /**
	     * 表示当前视图索引。
	     */
	    get selectedIndex() {
	        return this._selectedIndex;
	    }
	    set selectedIndex(value) {
	        if (this._selectedIndex != value) {
	            this.setSelect(this._selectedIndex, false);
	            this._selectedIndex = value;
	            this.setSelect(this._selectedIndex, true);
	        }
	    }
	    /**
	     * @private
	     * 通过对象的索引设置项对象的 <code>selected</code> 属性值。
	     * @param index 需要设置的对象的索引。
	     * @param selected 表示对象的选中状态。
	     */
	    setSelect(index, selected) {
	        if (this._items && index > -1 && index < this._items.length) {
	            this._items[index].visible = selected;
	        }
	    }
	    /**
	     * 获取或设置当前选择的项对象。
	     */
	    get selection() {
	        return this._selectedIndex > -1 && this._selectedIndex < this._items.length ? this._items[this._selectedIndex] : null;
	    }
	    set selection(value) {
	        this.selectedIndex = this._items.indexOf(value);
	    }
	    /**
	     *  索引设置处理器。
	     * <p>默认回调参数：index:int</p>
	     */
	    get setIndexHandler() {
	        return this._setIndexHandler;
	    }
	    set setIndexHandler(value) {
	        this._setIndexHandler = value;
	    }
	    /**
	     * @private
	     * 设置属性<code>selectedIndex</code>的值。
	     * @param index 选中项索引值。
	     */
	    setIndex(index) {
	        this.selectedIndex = index;
	    }
	    /**
	     * 视图集合数组。
	     */
	    get items() {
	        return this._items;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    set dataSource(value) {
	        this._dataSource = value;
	        if (typeof (value) == 'number' || typeof (value) == 'string') {
	            this.selectedIndex = parseInt(value);
	        }
	        else {
	            for (var prop in this._dataSource) {
	                if (prop in this) {
	                    this[prop] = this._dataSource[prop];
	                }
	            }
	        }
	    }
	    get dataSource() {
	        return super.dataSource;
	    }
	}
	Laya.ILaya.regClass(ViewStack);
	Laya.ClassUtils.regClass("laya.ui.ViewStack", ViewStack);
	Laya.ClassUtils.regClass("Laya.ViewStack", ViewStack);

	/**
	 * 输入文本后调度。
	 * @eventType Event.INPUT
	 */
	/*[Event(name = "input", type = "laya.events.Event")]*/
	/**
	 * 在输入框内敲回车键后调度。
	 * @eventType Event.ENTER
	 */
	/*[Event(name = "enter", type = "laya.events.Event")]*/
	/**
	 * 当获得输入焦点后调度。
	 * @eventType Event.FOCUS
	 */
	/*[Event(name = "focus", type = "laya.events.Event")]*/
	/**
	 * 当失去输入焦点后调度。
	 * @eventType Event.BLUR
	 */
	/*[Event(name = "blur", type = "laya.events.Event")]*/
	/**
	 * <code>TextInput</code> 类用于创建显示对象以显示和输入文本。
	 *
	 * @example <caption>以下示例代码，创建了一个 <code>TextInput</code> 实例。</caption>
	 * package
	 *	{
	 *		import laya.display.Stage;
	 *		import laya.ui.TextInput;
	 *		import laya.utils.Handler;
	 *		public class TextInput_Example
	 *		{
	 *			public function TextInput_Example()
	 *			{
	 *				Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
	 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *				Laya.loader.load(["resource/ui/input.png"], Handler.create(this, onLoadComplete));//加载资源。
	 *			}
	 *			private function onLoadComplete():void
	 *			{
	 *				var textInput:TextInput = new TextInput("这是一个TextInput实例。");//创建一个 TextInput 类的实例对象 textInput 。
	 *				textInput.skin = "resource/ui/input.png";//设置 textInput 的皮肤。
	 *				textInput.sizeGrid = "4,4,4,4";//设置 textInput 的网格信息。
	 *				textInput.color = "#008fff";//设置 textInput 的文本颜色。
	 *				textInput.font = "Arial";//设置 textInput 的文本字体。
	 *				textInput.bold = true;//设置 textInput 的文本显示为粗体。
	 *				textInput.fontSize = 30;//设置 textInput 的字体大小。
	 *				textInput.wordWrap = true;//设置 textInput 的文本自动换行。
	 *				textInput.x = 100;//设置 textInput 对象的属性 x 的值，用于控制 textInput 对象的显示位置。
	 *				textInput.y = 100;//设置 textInput 对象的属性 y 的值，用于控制 textInput 对象的显示位置。
	 *				textInput.width = 300;//设置 textInput 的宽度。
	 *				textInput.height = 200;//设置 textInput 的高度。
	 *				Laya.stage.addChild(textInput);//将 textInput 添加到显示列表。
	 *			}
	 *		}
	 *	}
	 * @example
	 * Laya.init(640, 800);//设置游戏画布宽高
	 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
	 * Laya.loader.load(["resource/ui/input.png"], laya.utils.Handler.create(this, onLoadComplete));//加载资源。
	 * function onLoadComplete() {
	 *     var textInput = new laya.ui.TextInput("这是一个TextInput实例。");//创建一个 TextInput 类的实例对象 textInput 。
	 *     textInput.skin = "resource/ui/input.png";//设置 textInput 的皮肤。
	 *     textInput.sizeGrid = "4,4,4,4";//设置 textInput 的网格信息。
	 *     textInput.color = "#008fff";//设置 textInput 的文本颜色。
	 *     textInput.font = "Arial";//设置 textInput 的文本字体。
	 *     textInput.bold = true;//设置 textInput 的文本显示为粗体。
	 *     textInput.fontSize = 30;//设置 textInput 的字体大小。
	 *     textInput.wordWrap = true;//设置 textInput 的文本自动换行。
	 *     textInput.x = 100;//设置 textInput 对象的属性 x 的值，用于控制 textInput 对象的显示位置。
	 *     textInput.y = 100;//设置 textInput 对象的属性 y 的值，用于控制 textInput 对象的显示位置。
	 *     textInput.width = 300;//设置 textInput 的宽度。
	 *     textInput.height = 200;//设置 textInput 的高度。
	 *     Laya.stage.addChild(textInput);//将 textInput 添加到显示列表。
	 * }
	 * @example
	 * import Stage = laya.display.Stage;
	 * import TextInput = laya.ui.TextInput;
	 * import Handler = laya.utils.Handler;
	 * class TextInput_Example {
	 *     constructor() {
	 *         Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
	 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *         Laya.loader.load(["resource/ui/input.png"], Handler.create(this, this.onLoadComplete));//加载资源。
	 *     }
	 *     private onLoadComplete(): void {
	 *         var textInput: TextInput = new TextInput("这是一个TextInput实例。");//创建一个 TextInput 类的实例对象 textInput 。
	 *         textInput.skin = "resource/ui/input.png";//设置 textInput 的皮肤。
	 *         textInput.sizeGrid = "4,4,4,4";//设置 textInput 的网格信息。
	 *         textInput.color = "#008fff";//设置 textInput 的文本颜色。
	 *         textInput.font = "Arial";//设置 textInput 的文本字体。
	 *         textInput.bold = true;//设置 textInput 的文本显示为粗体。
	 *         textInput.fontSize = 30;//设置 textInput 的字体大小。
	 *         textInput.wordWrap = true;//设置 textInput 的文本自动换行。
	 *         textInput.x = 100;//设置 textInput 对象的属性 x 的值，用于控制 textInput 对象的显示位置。
	 *         textInput.y = 100;//设置 textInput 对象的属性 y 的值，用于控制 textInput 对象的显示位置。
	 *         textInput.width = 300;//设置 textInput 的宽度。
	 *         textInput.height = 200;//设置 textInput 的高度。
	 *         Laya.stage.addChild(textInput);//将 textInput 添加到显示列表。
	 *     }
	 * }
	 */
	class TextInput extends Label {
	    /**
	     * 创建一个新的 <code>TextInput</code> 类实例。
	     * @param text 文本内容。
	     */
	    constructor(text = "") {
	        super();
	        this.text = text;
	        this.skin = this.skin;
	    }
	    /**
	     * @inheritDoc
	     * @internal
	    */
	    /*override*/ preinitialize() {
	        this.mouseEnabled = true;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._bg && this._bg.destroy();
	        this._bg = null;
	    }
	    /**
	     * @inheritDoc
	     * @internal
	    */
	    createChildren() {
	        this.addChild(this._tf = new Laya.Input());
	        this._tf.padding = Styles.inputLabelPadding;
	        this._tf.on(Laya.Event.INPUT, this, this._onInput);
	        this._tf.on(Laya.Event.ENTER, this, this._onEnter);
	        this._tf.on(Laya.Event.BLUR, this, this._onBlur);
	        this._tf.on(Laya.Event.FOCUS, this, this._onFocus);
	    }
	    /**
	     * @private
	     */
	    _onFocus() {
	        this.event(Laya.Event.FOCUS, this);
	    }
	    /**
	     * @private
	     */
	    _onBlur() {
	        this.event(Laya.Event.BLUR, this);
	    }
	    /**
	     * @private
	     */
	    _onInput() {
	        this.event(Laya.Event.INPUT, this);
	    }
	    /**
	     * @private
	     */
	    _onEnter() {
	        this.event(Laya.Event.ENTER, this);
	    }
	    /**
	     * @inheritDoc
	     * @internal
	    */
	    initialize() {
	        this.width = 128;
	        this.height = 22;
	    }
	    /**
	     * 表示此对象包含的文本背景 <code>AutoBitmap</code> 组件实例。
	     */
	    get bg() {
	        return this._bg;
	    }
	    set bg(value) {
	        this.graphics = this._bg = value;
	    }
	    /**
	     * @copy laya.ui.Image#skin
	     */
	    get skin() {
	        return this._skin;
	    }
	    set skin(value) {
	        if (this._skin != value) {
	            this._skin = value;
	            if (this._skin && !Laya.Loader.getRes(this._skin)) {
	                window.Laya.loader.load(this._skin, Laya.Handler.create(this, this._skinLoaded), null, Laya.Loader.IMAGE, 1);
	            }
	            else {
	                this._skinLoaded();
	            }
	        }
	    }
	    _skinLoaded() {
	        this._bg || (this.graphics = this._bg = new AutoBitmap());
	        this._bg.source = Laya.Loader.getRes(this._skin);
	        this._width && (this._bg.width = this._width);
	        this._height && (this._bg.height = this._height);
	        this._sizeChanged();
	        this.event(Laya.Event.LOADED);
	    }
	    /**
	     * <p>当前实例的背景图（ <code>AutoBitmap</code> ）实例的有效缩放网格数据。</p>
	     * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
	     * <ul><li>例如："4,4,4,4,1"</li></ul></p>
	     * @see laya.ui.AutoBitmap.sizeGrid
	     */
	    get sizeGrid() {
	        return this._bg && this._bg.sizeGrid ? this._bg.sizeGrid.join(",") : null;
	    }
	    set sizeGrid(value) {
	        this._bg || (this.graphics = this._bg = new AutoBitmap());
	        this._bg.sizeGrid = UIUtils.fillArray(Styles.defaultSizeGrid, value, Number);
	    }
	    /**
	     * 当前文本内容字符串。
	     * @see laya.display.Text.text
	     * @override
	     */
	    /*override*/ set text(value) {
	        if (this._tf.text != value) {
	            value = value + "";
	            this._tf.text = value;
	            this.event(Laya.Event.CHANGE);
	        }
	    }
	    get text() {
	        return super.text;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ set width(value) {
	        super.width = value;
	        this._bg && (this._bg.width = value);
	    }
	    get width() {
	        return super.width;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ set height(value) {
	        super.height = value;
	        this._bg && (this._bg.height = value);
	    }
	    get height() {
	        return super.height;
	    }
	    /**
	     * <p>指示当前是否是文本域。</p>
	     * 值为true表示当前是文本域，否则不是文本域。
	     */
	    get multiline() {
	        return this._tf.multiline;
	    }
	    set multiline(value) {
	        this._tf.multiline = value;
	    }
	    /**
	     * 设置可编辑状态。
	     */
	    set editable(value) {
	        this._tf.editable = value;
	    }
	    get editable() {
	        return this._tf.editable;
	    }
	    /**选中输入框内的文本。*/
	    select() {
	        this._tf.select();
	    }
	    /**限制输入的字符。*/
	    get restrict() {
	        return this._tf.restrict;
	    }
	    set restrict(pattern) {
	        this._tf.restrict = pattern;
	    }
	    /**
	     * @copy laya.display.Input#prompt
	     */
	    get prompt() {
	        return this._tf.prompt;
	    }
	    set prompt(value) {
	        this._tf.prompt = value;
	    }
	    /**
	     * @copy laya.display.Input#promptColor
	     */
	    get promptColor() {
	        return this._tf.promptColor;
	    }
	    set promptColor(value) {
	        this._tf.promptColor = value;
	    }
	    /**
	     * @copy laya.display.Input#maxChars
	     */
	    get maxChars() {
	        return this._tf.maxChars;
	    }
	    set maxChars(value) {
	        this._tf.maxChars = value;
	    }
	    /**
	     * @copy laya.display.Input#focus
	     */
	    get focus() {
	        return this._tf.focus;
	    }
	    set focus(value) {
	        this._tf.focus = value;
	    }
	    /**
	     * @copy laya.display.Input#type
	     */
	    get type() {
	        return this._tf.type;
	    }
	    set type(value) {
	        this._tf.type = value;
	    }
	    setSelection(startIndex, endIndex) {
	        this._tf.setSelection(startIndex, endIndex);
	    }
	}
	Laya.ILaya.regClass(TextInput);
	Laya.ClassUtils.regClass("laya.ui.TextInput", TextInput);
	Laya.ClassUtils.regClass("Laya.TextInput", TextInput);

	/**
	 * <code>TextArea</code> 类用于创建显示对象以显示和输入文本。
	 * @example <caption>以下示例代码，创建了一个 <code>TextArea</code> 实例。</caption>
	 * package
	 *	{
	 *		import laya.ui.TextArea;
	 *		import laya.utils.Handler;
	 *		public class TextArea_Example
	 *		{
	 *			public function TextArea_Example()
	 *			{
	 *				Laya.init(640, 800);//设置游戏画布宽高。
	 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *				Laya.loader.load(["resource/ui/input.png"], Handler.create(this, onLoadComplete));//加载资源。
	 *			}
	 *			private function onLoadComplete():void
	 *			{
	 *				var textArea:TextArea = new TextArea("这个一个TextArea实例。");//创建一个 TextArea 类的实例对象 textArea 。
	 *				textArea.skin = "resource/ui/input.png";//设置 textArea 的皮肤。
	 *				textArea.sizeGrid = "4,4,4,4";//设置 textArea 的网格信息。
	 *				textArea.color = "#008fff";//设置 textArea 的文本颜色。
	 *				textArea.font = "Arial";//设置 textArea 的字体。
	 *				textArea.bold = true;//设置 textArea 的文本显示为粗体。
	 *				textArea.fontSize = 20;//设置 textArea 的文本字体大小。
	 *				textArea.wordWrap = true;//设置 textArea 的文本自动换行。
	 *				textArea.x = 100;//设置 textArea 对象的属性 x 的值，用于控制 textArea 对象的显示位置。
	 *				textArea.y = 100;//设置 textArea 对象的属性 y 的值，用于控制 textArea 对象的显示位置。
	 *				textArea.width = 300;//设置 textArea 的宽度。
	 *				textArea.height = 200;//设置 textArea 的高度。
	 *				Laya.stage.addChild(textArea);//将 textArea 添加到显示列表。
	 *			}
	 *		}
	 *	}
	 * @example
	 * Laya.init(640, 800);//设置游戏画布宽高、渲染模式
	 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
	 * Laya.loader.load(["resource/ui/input.png"], laya.utils.Handler.create(this, onLoadComplete));//加载资源。
	 * function onLoadComplete() {
	 *     var textArea = new laya.ui.TextArea("这个一个TextArea实例。");//创建一个 TextArea 类的实例对象 textArea 。
	 *     textArea.skin = "resource/ui/input.png";//设置 textArea 的皮肤。
	 *     textArea.sizeGrid = "4,4,4,4";//设置 textArea 的网格信息。
	 *     textArea.color = "#008fff";//设置 textArea 的文本颜色。
	 *     textArea.font = "Arial";//设置 textArea 的字体。
	 *     textArea.bold = true;//设置 textArea 的文本显示为粗体。
	 *     textArea.fontSize = 20;//设置 textArea 的文本字体大小。
	 *     textArea.wordWrap = true;//设置 textArea 的文本自动换行。
	 *     textArea.x = 100;//设置 textArea 对象的属性 x 的值，用于控制 textArea 对象的显示位置。
	 *     textArea.y = 100;//设置 textArea 对象的属性 y 的值，用于控制 textArea 对象的显示位置。
	 *     textArea.width = 300;//设置 textArea 的宽度。
	 *     textArea.height = 200;//设置 textArea 的高度。
	 *     Laya.stage.addChild(textArea);//将 textArea 添加到显示列表。
	 * }
	 * @example
	 * import TextArea = laya.ui.TextArea;
	 * import Handler = laya.utils.Handler;
	 * class TextArea_Example {
	 *     constructor() {
	 *         Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
	 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *         Laya.loader.load(["resource/ui/input.png"], Handler.create(this, this.onLoadComplete));//加载资源。
	 *     }

	 *     private onLoadComplete(): void {
	 *         var textArea: TextArea = new TextArea("这个一个TextArea实例。");//创建一个 TextArea 类的实例对象 textArea 。
	 *         textArea.skin = "resource/ui/input.png";//设置 textArea 的皮肤。
	 *         textArea.sizeGrid = "4,4,4,4";//设置 textArea 的网格信息。
	 *         textArea.color = "#008fff";//设置 textArea 的文本颜色。
	 *         textArea.font = "Arial";//设置 textArea 的字体。
	 *         textArea.bold = true;//设置 textArea 的文本显示为粗体。
	 *         textArea.fontSize = 20;//设置 textArea 的文本字体大小。
	 *         textArea.wordWrap = true;//设置 textArea 的文本自动换行。
	 *         textArea.x = 100;//设置 textArea 对象的属性 x 的值，用于控制 textArea 对象的显示位置。
	 *         textArea.y = 100;//设置 textArea 对象的属性 y 的值，用于控制 textArea 对象的显示位置。
	 *         textArea.width = 300;//设置 textArea 的宽度。
	 *         textArea.height = 200;//设置 textArea 的高度。
	 *         Laya.stage.addChild(textArea);//将 textArea 添加到显示列表。
	 *     }
	 * }
	 */
	class TextArea extends TextInput {
	    /**
	     * <p>创建一个新的 <code>TextArea</code> 示例。</p>
	     * @param text 文本内容字符串。
	     */
	    constructor(text = "") {
	        super(text);
	        this.on(Laya.Event.CHANGE, this, this._onTextChange);
	    }
	    _onTextChange() {
	        this.callLater(this.changeScroll);
	    }
	    /**
	     *
	     * @param destroyChild
	     * @override
	     */
	    /*override*/ destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._vScrollBar && this._vScrollBar.destroy();
	        this._hScrollBar && this._hScrollBar.destroy();
	        this._vScrollBar = null;
	        this._hScrollBar = null;
	    }
	    /**
	     * @override
	     * @internal
	     */
	    initialize() {
	        this.width = 180;
	        this.height = 150;
	        this._tf.wordWrap = true;
	        this.multiline = true;
	    }
	    /**
	     * @override
	     */
	    /*override*/ set width(value) {
	        super.width = value;
	        this.callLater(this.changeScroll);
	    }
	    get width() {
	        return super.width;
	    }
	    /**
	     * @override
	     */
	    /*override*/ set height(value) {
	        super.height = value;
	        this.callLater(this.changeScroll);
	    }
	    get height() {
	        return super.height;
	    }
	    /**垂直滚动条皮肤*/
	    get vScrollBarSkin() {
	        return this._vScrollBar ? this._vScrollBar.skin : null;
	    }
	    set vScrollBarSkin(value) {
	        if (this._vScrollBar == null) {
	            this.addChild(this._vScrollBar = new VScrollBar());
	            this._vScrollBar.on(Laya.Event.CHANGE, this, this.onVBarChanged);
	            this._vScrollBar.target = this._tf;
	            this.callLater(this.changeScroll);
	        }
	        this._vScrollBar.skin = value;
	    }
	    /**水平滚动条皮肤*/
	    get hScrollBarSkin() {
	        return this._hScrollBar ? this._hScrollBar.skin : null;
	    }
	    set hScrollBarSkin(value) {
	        if (this._hScrollBar == null) {
	            this.addChild(this._hScrollBar = new HScrollBar());
	            this._hScrollBar.on(Laya.Event.CHANGE, this, this.onHBarChanged);
	            this._hScrollBar.mouseWheelEnable = false;
	            this._hScrollBar.target = this._tf;
	            this.callLater(this.changeScroll);
	        }
	        this._hScrollBar.skin = value;
	    }
	    onVBarChanged(e) {
	        if (this._tf.scrollY != this._vScrollBar.value) {
	            this._tf.scrollY = this._vScrollBar.value;
	        }
	    }
	    onHBarChanged(e) {
	        if (this._tf.scrollX != this._hScrollBar.value) {
	            this._tf.scrollX = this._hScrollBar.value;
	        }
	    }
	    /**垂直滚动条实体*/
	    get vScrollBar() {
	        return this._vScrollBar;
	    }
	    /**水平滚动条实体*/
	    get hScrollBar() {
	        return this._hScrollBar;
	    }
	    /**垂直滚动最大值*/
	    get maxScrollY() {
	        return this._tf.maxScrollY;
	    }
	    /**垂直滚动值*/
	    get scrollY() {
	        return this._tf.scrollY;
	    }
	    /**水平滚动最大值*/
	    get maxScrollX() {
	        return this._tf.maxScrollX;
	    }
	    /**水平滚动值*/
	    get scrollX() {
	        return this._tf.scrollX;
	    }
	    changeScroll() {
	        var vShow = this._vScrollBar && this._tf.maxScrollY > 0;
	        var hShow = this._hScrollBar && this._tf.maxScrollX > 0;
	        var showWidth = vShow ? this._width - this._vScrollBar.width : this._width;
	        var showHeight = hShow ? this._height - this._hScrollBar.height : this._height;
	        var padding = this._tf.padding || Styles.labelPadding;
	        this._tf.width = showWidth;
	        this._tf.height = showHeight;
	        if (this._vScrollBar) {
	            this._vScrollBar.x = this._width - this._vScrollBar.width - padding[2];
	            this._vScrollBar.y = padding[1];
	            this._vScrollBar.height = this._height - (hShow ? this._hScrollBar.height : 0) - padding[1] - padding[3];
	            this._vScrollBar.scrollSize = 1;
	            this._vScrollBar.thumbPercent = showHeight / Math.max(this._tf.textHeight, showHeight);
	            this._vScrollBar.setScroll(1, this._tf.maxScrollY, this._tf.scrollY);
	            this._vScrollBar.visible = vShow;
	        }
	        if (this._hScrollBar) {
	            this._hScrollBar.x = padding[0];
	            this._hScrollBar.y = this._height - this._hScrollBar.height - padding[3];
	            this._hScrollBar.width = this._width - (vShow ? this._vScrollBar.width : 0) - padding[0] - padding[2];
	            this._hScrollBar.scrollSize = Math.max(showWidth * 0.033, 1);
	            this._hScrollBar.thumbPercent = showWidth / Math.max(this._tf.textWidth, showWidth);
	            this._hScrollBar.setScroll(0, this.maxScrollX, this.scrollX);
	            this._hScrollBar.visible = hShow;
	        }
	    }
	    /**滚动到某个位置*/
	    scrollTo(y) {
	        this.commitMeasure();
	        this._tf.scrollY = y;
	    }
	}
	Laya.ILaya.regClass(TextArea);
	Laya.ClassUtils.regClass("laya.ui.TextArea", TextArea);
	Laya.ClassUtils.regClass("Laya.TextArea", TextArea);

	/**
	 * 自适应缩放容器，容器设置大小后，容器大小始终保持stage大小，子内容按照原始最小宽高比缩放
	 */
	class ScaleBox extends Box {
	    constructor() {
	        super(...arguments);
	        this._oldW = 0;
	        this._oldH = 0;
	    }
	    /**
	     * @override
	     */
	    onEnable() {
	        window.Laya.stage.on("resize", this, this.onResize);
	        this.onResize();
	    }
	    /**
	     * @override
	     */
	    onDisable() {
	        window.Laya.stage.off("resize", this, this.onResize);
	    }
	    onResize() {
	        var Laya = window.Laya;
	        if (this.width > 0 && this.height > 0) {
	            var scale = Math.min(Laya.stage.width / this._oldW, Laya.stage.height / this._oldH);
	            super.width = Laya.stage.width;
	            super.height = Laya.stage.height;
	            this.scale(scale, scale);
	        }
	    }
	    /**
	     * @override
	     */
	    set width(value) {
	        super.width = value;
	        this._oldW = value;
	    }
	    get width() {
	        return super.width;
	    }
	    /**
	     * @override
	     */
	    set height(value) {
	        super.height = value;
	        this._oldH = value;
	    }
	    get height() {
	        return super.height;
	    }
	}
	Laya.ILaya.regClass(ScaleBox);
	Laya.ClassUtils.regClass("laya.ui.ScaleBox", ScaleBox);
	Laya.ClassUtils.regClass("Laya.ScaleBox", ScaleBox);

	/**
	     * 使用 <code>HSlider</code> 控件，用户可以通过在滑块轨道的终点之间移动滑块来选择值。
	     * <p> <code>HSlider</code> 控件采用水平方向。滑块轨道从左向右扩展，而标签位于轨道的顶部或底部。</p>
	     *
	     * @example <caption>以下示例代码，创建了一个 <code>HSlider</code> 实例。</caption>
	     * package
	     *	{
	     *		import laya.ui.HSlider;
	     *		import laya.utils.Handler;
	     *		public class HSlider_Example
	     *		{
	     *			private var hSlider:HSlider;
	     *			public function HSlider_Example()
	     *			{
	     *				Laya.init(640, 800);//设置游戏画布宽高。
	     *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	     *				Laya.loader.load(["resource/ui/hslider.png", "resource/ui/hslider$bar.png"], Handler.create(this, onLoadComplete));//加载资源。
	     *			}
	     *			private function onLoadComplete():void
	     *			{
	     *				hSlider = new HSlider();//创建一个 HSlider 类的实例对象 hSlider 。
	     *				hSlider.skin = "resource/ui/hslider.png";//设置 hSlider 的皮肤。
	     *				hSlider.min = 0;//设置 hSlider 最低位置值。
	     *				hSlider.max = 10;//设置 hSlider 最高位置值。
	     *				hSlider.value = 2;//设置 hSlider 当前位置值。
	     *				hSlider.tick = 1;//设置 hSlider 刻度值。
	     *				hSlider.x = 100;//设置 hSlider 对象的属性 x 的值，用于控制 hSlider 对象的显示位置。
	     *				hSlider.y = 100;//设置 hSlider 对象的属性 y 的值，用于控制 hSlider 对象的显示位置。
	     *				hSlider.changeHandler = new Handler(this, onChange);//设置 hSlider 位置变化处理器。
	     *				Laya.stage.addChild(hSlider);//把 hSlider 添加到显示列表。
	     *			}
	     *			private function onChange(value:Number):void
	     *			{
	     *				trace("滑块的位置： value=" + value);
	     *			}
	     *		}
	     *	}
	     * @example
	     * Laya.init(640, 800, "canvas");//设置游戏画布宽高、渲染模式
	     * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
	     * var hSlider;
	     * var res = ["resource/ui/hslider.png", "resource/ui/hslider$bar.png"];
	     * Laya.loader.load(res, laya.utils.Handler.create(this, onLoadComplete));
	     * function onLoadComplete() {
	     *     console.log("资源加载完成！");
	     *     hSlider = new laya.ui.HSlider();//创建一个 HSlider 类的实例对象 hSlider 。
	     *     hSlider.skin = "resource/ui/hslider.png";//设置 hSlider 的皮肤。
	     *     hSlider.min = 0;//设置 hSlider 最低位置值。
	     *     hSlider.max = 10;//设置 hSlider 最高位置值。
	     *     hSlider.value = 2;//设置 hSlider 当前位置值。
	     *     hSlider.tick = 1;//设置 hSlider 刻度值。
	     *     hSlider.x = 100;//设置 hSlider 对象的属性 x 的值，用于控制 hSlider 对象的显示位置。
	     *     hSlider.y = 100;//设置 hSlider 对象的属性 y 的值，用于控制 hSlider 对象的显示位置。
	     *     hSlider.changeHandler = new laya.utils.Handler(this, onChange);//设置 hSlider 位置变化处理器。
	     *     Laya.stage.addChild(hSlider);//把 hSlider 添加到显示列表。
	     * }
	     * function onChange(value)
	     * {
	     *     console.log("滑块的位置： value=" + value);
	     * }
	     * @example
	     * import Handler = laya.utils.Handler;
	     * import HSlider = laya.ui.HSlider;
	     * class HSlider_Example {
	     *     private hSlider: HSlider;
	     *     constructor() {
	     *         Laya.init(640, 800);//设置游戏画布宽高。
	     *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	     *         Laya.loader.load(["resource/ui/hslider.png", "resource/ui/hslider$bar.png"], Handler.create(this, this.onLoadComplete));//加载资源。
	     *     }
	     *     private onLoadComplete(): void {
	     *         this.hSlider = new HSlider();//创建一个 HSlider 类的实例对象 hSlider 。
	     *         this.hSlider.skin = "resource/ui/hslider.png";//设置 hSlider 的皮肤。
	     *         this.hSlider.min = 0;//设置 hSlider 最低位置值。
	     *         this.hSlider.max = 10;//设置 hSlider 最高位置值。
	     *         this.hSlider.value = 2;//设置 hSlider 当前位置值。
	     *         this.hSlider.tick = 1;//设置 hSlider 刻度值。
	     *         this.hSlider.x = 100;//设置 hSlider 对象的属性 x 的值，用于控制 hSlider 对象的显示位置。
	     *         this.hSlider.y = 100;//设置 hSlider 对象的属性 y 的值，用于控制 hSlider 对象的显示位置。
	     *         this.hSlider.changeHandler = new Handler(this, this.onChange);//设置 hSlider 位置变化处理器。
	     *         Laya.stage.addChild(this.hSlider);//把 hSlider 添加到显示列表。
	     *     }
	     *     private onChange(value: number): void {
	     *         console.log("滑块的位置： value=" + value);
	     *     }
	     * }
	     *
	     * @see laya.ui.Slider
	     */
	class HSlider extends Slider {
	    /**
	     * 创建一个 <code>HSlider</code> 类实例。
	     * @param skin 皮肤。
	     */
	    constructor(skin = null) {
	        super(skin);
	        this.isVertical = false;
	    }
	}
	Laya.ILaya.regClass(HSlider);
	Laya.ClassUtils.regClass("laya.ui.HSlider", HSlider);
	Laya.ClassUtils.regClass("Laya.HSlider", HSlider);

	/**
	 * <code>Panel</code> 是一个面板容器类。
	 */
	class Panel extends Box {
	    /**
	     * 创建一个新的 <code>Panel</code> 类实例。
	     * <p>在 <code>Panel</code> 构造函数中设置属性width、height的值都为100。</p>
	     */
	    constructor() {
	        super();
	        /**@private */
	        this._usedCache = null;
	        /**@private */
	        this._elasticEnabled = false;
	        this.width = this.height = 100;
	        //子对象缩放的情况下，优化会有问题，先屏蔽掉
	        //_content.optimizeScrollRect = true;
	    }
	    /**@inheritDoc @override*/
	    destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._content && this._content.destroy(destroyChild);
	        this._vScrollBar && this._vScrollBar.destroy(destroyChild);
	        this._hScrollBar && this._hScrollBar.destroy(destroyChild);
	        this._vScrollBar = null;
	        this._hScrollBar = null;
	        this._content = null;
	    }
	    /**@inheritDoc @override*/
	    destroyChildren() {
	        this._content.destroyChildren();
	    }
	    /**@inheritDoc @internal*/
	    createChildren() {
	        super.addChild(this._content = new Box());
	    }
	    /**@inheritDoc @override*/
	    addChild(child) {
	        child.on(Laya.Event.RESIZE, this, this.onResize);
	        this._setScrollChanged();
	        return this._content.addChild(child);
	    }
	    /**
	     * @private
	     * 子对象的 <code>Event.RESIZE</code> 事件侦听处理函数。
	     */
	    onResize() {
	        this._setScrollChanged();
	    }
	    /**@inheritDoc @override*/
	    addChildAt(child, index) {
	        child.on(Laya.Event.RESIZE, this, this.onResize);
	        this._setScrollChanged();
	        return this._content.addChildAt(child, index);
	    }
	    /**@inheritDoc @override*/
	    removeChild(child) {
	        child.off(Laya.Event.RESIZE, this, this.onResize);
	        this._setScrollChanged();
	        return this._content.removeChild(child);
	    }
	    /**@inheritDoc @override*/
	    removeChildAt(index) {
	        this.getChildAt(index).off(Laya.Event.RESIZE, this, this.onResize);
	        this._setScrollChanged();
	        return this._content.removeChildAt(index);
	    }
	    /**@inheritDoc @override*/
	    removeChildren(beginIndex = 0, endIndex = 0x7fffffff) {
	        this._content.removeChildren(beginIndex, endIndex);
	        this._setScrollChanged();
	        return this;
	    }
	    /**@inheritDoc @override*/
	    getChildAt(index) {
	        return this._content.getChildAt(index);
	    }
	    /**@inheritDoc @override*/
	    getChildByName(name) {
	        return this._content.getChildByName(name);
	    }
	    /**@inheritDoc @override*/
	    getChildIndex(child) {
	        return this._content.getChildIndex(child);
	    }
	    /**@inheritDoc @override*/
	    get numChildren() {
	        return this._content.numChildren;
	    }
	    /**@private */
	    changeScroll() {
	        this._scrollChanged = false;
	        var contentW = this.contentWidth || 1;
	        var contentH = this.contentHeight || 1;
	        var vscroll = this._vScrollBar;
	        var hscroll = this._hScrollBar;
	        var vShow = vscroll && contentH > this._height;
	        var hShow = hscroll && contentW > this._width;
	        var showWidth = vShow ? this._width - vscroll.width : this._width;
	        var showHeight = hShow ? this._height - hscroll.height : this._height;
	        if (vscroll) {
	            vscroll.x = this._width - vscroll.width;
	            vscroll.y = 0;
	            vscroll.height = this._height - (hShow ? hscroll.height : 0);
	            vscroll.scrollSize = Math.max(this._height * 0.033, 1);
	            vscroll.thumbPercent = showHeight / contentH;
	            vscroll.setScroll(0, contentH - showHeight, vscroll.value);
	        }
	        if (hscroll) {
	            hscroll.x = 0;
	            hscroll.y = this._height - hscroll.height;
	            hscroll.width = this._width - (vShow ? vscroll.width : 0);
	            hscroll.scrollSize = Math.max(this._width * 0.033, 1);
	            hscroll.thumbPercent = showWidth / contentW;
	            hscroll.setScroll(0, contentW - showWidth, hscroll.value);
	        }
	    }
	    /**@inheritDoc @override*/
	    _sizeChanged() {
	        super._sizeChanged();
	        this.setContentSize(this._width, this._height);
	    }
	    /**
	     * @private
	     * 获取内容宽度（以像素为单位）。
	     */
	    get contentWidth() {
	        var max = 0;
	        for (var i = this._content.numChildren - 1; i > -1; i--) {
	            var comp = this._content.getChildAt(i);
	            max = Math.max(comp._x + comp.width * comp.scaleX - comp.pivotX, max);
	        }
	        return max;
	    }
	    /**
	     * @private
	     * 获取内容高度（以像素为单位）。
	     */
	    get contentHeight() {
	        var max = 0;
	        for (var i = this._content.numChildren - 1; i > -1; i--) {
	            var comp = this._content.getChildAt(i);
	            max = Math.max(comp._y + comp.height * comp.scaleY - comp.pivotY, max);
	        }
	        return max;
	    }
	    /**
	     * @private
	     * 设置内容的宽度、高度（以像素为单位）。
	     * @param width 宽度。
	     * @param height 高度。
	     */
	    setContentSize(width, height) {
	        var content = this._content;
	        content.width = width;
	        content.height = height;
	        content._style.scrollRect || (content.scrollRect = Laya.Rectangle.create());
	        content._style.scrollRect.setTo(0, 0, width, height);
	        content.scrollRect = content.scrollRect;
	    }
	    /**
	     * @inheritDoc
	     * @override
	     */
	    set width(value) {
	        super.width = value;
	        this._setScrollChanged();
	    }
	    get width() {
	        return super.width;
	    }
	    /**@inheritDoc @override*/
	    set height(value) {
	        super.height = value;
	        this._setScrollChanged();
	    }
	    get height() {
	        return super.height;
	    }
	    /**
	     * 垂直方向滚动条皮肤。
	     */
	    get vScrollBarSkin() {
	        return this._vScrollBar ? this._vScrollBar.skin : null;
	    }
	    set vScrollBarSkin(value) {
	        if (this._vScrollBar == null) {
	            super.addChild(this._vScrollBar = new VScrollBar());
	            this._vScrollBar.on(Laya.Event.CHANGE, this, this.onScrollBarChange, [this._vScrollBar]);
	            this._vScrollBar.target = this._content;
	            this._vScrollBar.elasticDistance = this._elasticEnabled ? 200 : 0;
	            this._setScrollChanged();
	        }
	        this._vScrollBar.skin = value;
	    }
	    /**
	     * 水平方向滚动条皮肤。
	     */
	    get hScrollBarSkin() {
	        return this._hScrollBar ? this._hScrollBar.skin : null;
	    }
	    set hScrollBarSkin(value) {
	        if (this._hScrollBar == null) {
	            super.addChild(this._hScrollBar = new HScrollBar());
	            this._hScrollBar.on(Laya.Event.CHANGE, this, this.onScrollBarChange, [this._hScrollBar]);
	            this._hScrollBar.target = this._content;
	            this._hScrollBar.elasticDistance = this._elasticEnabled ? 200 : 0;
	            this._setScrollChanged();
	        }
	        this._hScrollBar.skin = value;
	    }
	    /**
	     * 垂直方向滚动条对象。
	     */
	    get vScrollBar() {
	        return this._vScrollBar;
	    }
	    /**
	     * 水平方向滚动条对象。
	     */
	    get hScrollBar() {
	        return this._hScrollBar;
	    }
	    /**
	     * 获取内容容器对象。
	     */
	    get content() {
	        return this._content;
	    }
	    /**
	     * @private
	     * 滚动条的<code><code>Event.MOUSE_DOWN</code>事件侦听处理函数。</code>事件侦听处理函数。
	     * @param scrollBar 滚动条对象。
	     * @param e Event 对象。
	     */
	    onScrollBarChange(scrollBar) {
	        var rect = this._content._style.scrollRect;
	        if (rect) {
	            var start = Math.round(scrollBar.value);
	            scrollBar.isVertical ? rect.y = start : rect.x = start;
	            this._content.scrollRect = rect;
	        }
	    }
	    /**
	     * <p>滚动内容容器至设定的垂直、水平方向滚动条位置。</p>
	     * @param x 水平方向滚动条属性value值。滚动条位置数字。
	     * @param y 垂直方向滚动条属性value值。滚动条位置数字。
	     */
	    scrollTo(x = 0, y = 0) {
	        if (this.vScrollBar)
	            this.vScrollBar.value = y;
	        if (this.hScrollBar)
	            this.hScrollBar.value = x;
	    }
	    /**
	     * 刷新滚动内容。
	     */
	    refresh() {
	        this.changeScroll();
	    }
	    /**@inheritDoc @override*/
	    set cacheAs(value) {
	        super.cacheAs = value;
	        this._usedCache = null;
	        if (value !== "none") {
	            this._hScrollBar && this._hScrollBar.on(Laya.Event.START, this, this.onScrollStart);
	            this._vScrollBar && this._vScrollBar.on(Laya.Event.START, this, this.onScrollStart);
	        }
	        else {
	            this._hScrollBar && this._hScrollBar.off(Laya.Event.START, this, this.onScrollStart);
	            this._vScrollBar && this._vScrollBar.off(Laya.Event.START, this, this.onScrollStart);
	        }
	    }
	    get cacheAs() {
	        return super.cacheAs;
	    }
	    /**是否开启橡皮筋效果*/
	    get elasticEnabled() {
	        return this._elasticEnabled;
	    }
	    set elasticEnabled(value) {
	        this._elasticEnabled = value;
	        if (this._vScrollBar) {
	            this._vScrollBar.elasticDistance = value ? 200 : 0;
	        }
	        if (this._hScrollBar) {
	            this._hScrollBar.elasticDistance = value ? 200 : 0;
	        }
	    }
	    onScrollStart() {
	        this._usedCache || (this._usedCache = super.cacheAs);
	        super.cacheAs = "none";
	        this._hScrollBar && this._hScrollBar.once(Laya.Event.END, this, this.onScrollEnd);
	        this._vScrollBar && this._vScrollBar.once(Laya.Event.END, this, this.onScrollEnd);
	    }
	    onScrollEnd() {
	        super.cacheAs = this._usedCache;
	    }
	    /**@private */
	    _setScrollChanged() {
	        if (!this._scrollChanged) {
	            this._scrollChanged = true;
	            this.callLater(this.changeScroll);
	        }
	    }
	}
	Laya.ILaya.regClass(Panel);
	Laya.ClassUtils.regClass("laya.ui.Panel", Panel);
	Laya.ClassUtils.regClass("Laya.Panel", Panel);

	/**
	     * 使用 <code>VSlider</code> 控件，用户可以通过在滑块轨道的终点之间移动滑块来选择值。
	     * <p> <code>VSlider</code> 控件采用垂直方向。滑块轨道从下往上扩展，而标签位于轨道的左右两侧。</p>
	     *
	     * @example <caption>以下示例代码，创建了一个 <code>VSlider</code> 实例。</caption>
	     * package
	     *	{
	     *		import laya.ui.HSlider;
	     *		import laya.ui.VSlider;
	     *		import laya.utils.Handler;
	     *		public class VSlider_Example
	     *		{
	     *			private var vSlider:VSlider;
	     *			public function VSlider_Example()
	     *			{
	     *				Laya.init(640, 800);//设置游戏画布宽高。
	     *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	     *				Laya.loader.load(["resource/ui/vslider.png", "resource/ui/vslider$bar.png"], Handler.create(this, onLoadComplete));//加载资源。
	     *			}
	     *			private function onLoadComplete():void
	     *			{
	     *				vSlider = new VSlider();//创建一个 VSlider 类的实例对象 vSlider 。
	     *				vSlider.skin = "resource/ui/vslider.png";//设置 vSlider 的皮肤。
	     *				vSlider.min = 0;//设置 vSlider 最低位置值。
	     *				vSlider.max = 10;//设置 vSlider 最高位置值。
	     *				vSlider.value = 2;//设置 vSlider 当前位置值。
	     *				vSlider.tick = 1;//设置 vSlider 刻度值。
	     *				vSlider.x = 100;//设置 vSlider 对象的属性 x 的值，用于控制 vSlider 对象的显示位置。
	     *				vSlider.y = 100;//设置 vSlider 对象的属性 y 的值，用于控制 vSlider 对象的显示位置。
	     *				vSlider.changeHandler = new Handler(this, onChange);//设置 vSlider 位置变化处理器。
	     *				Laya.stage.addChild(vSlider);//把 vSlider 添加到显示列表。
	     *			}
	     *			private function onChange(value:Number):void
	     *			{
	     *				trace("滑块的位置： value=" + value);
	     *			}
	     *		}
	     *	}
	     * @example
	     * Laya.init(640, 800);//设置游戏画布宽高
	     * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
	     * var vSlider;
	     * Laya.loader.load(["resource/ui/vslider.png", "resource/ui/vslider$bar.png"], laya.utils.Handler.create(this, onLoadComplete));//加载资源。
	     * function onLoadComplete() {
	     *     vSlider = new laya.ui.VSlider();//创建一个 VSlider 类的实例对象 vSlider 。
	     *     vSlider.skin = "resource/ui/vslider.png";//设置 vSlider 的皮肤。
	     *     vSlider.min = 0;//设置 vSlider 最低位置值。
	     *     vSlider.max = 10;//设置 vSlider 最高位置值。
	     *     vSlider.value = 2;//设置 vSlider 当前位置值。
	     *     vSlider.tick = 1;//设置 vSlider 刻度值。
	     *     vSlider.x = 100;//设置 vSlider 对象的属性 x 的值，用于控制 vSlider 对象的显示位置。
	     *     vSlider.y = 100;//设置 vSlider 对象的属性 y 的值，用于控制 vSlider 对象的显示位置。
	     *     vSlider.changeHandler = new laya.utils.Handler(this, onChange);//设置 vSlider 位置变化处理器。
	     *     Laya.stage.addChild(vSlider);//把 vSlider 添加到显示列表。
	     * }
	     * function onChange(value) {
	     *     console.log("滑块的位置： value=" + value);
	     * }
	     * @example
	     * import HSlider = laya.ui.HSlider;
	     * import VSlider = laya.ui.VSlider;
	     * import Handler = laya.utils.Handler;
	     * class VSlider_Example {
	     *     private vSlider: VSlider;
	     *     constructor() {
	     *         Laya.init(640, 800);//设置游戏画布宽高。
	     *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	     *         Laya.loader.load(["resource/ui/vslider.png", "resource/ui/vslider$bar.png"], Handler.create(this, this.onLoadComplete));//加载资源。
	     *     }
	     *     private onLoadComplete(): void {
	     *         this.vSlider = new VSlider();//创建一个 VSlider 类的实例对象 vSlider 。
	     *         this.vSlider.skin = "resource/ui/vslider.png";//设置 vSlider 的皮肤。
	     *         this.vSlider.min = 0;//设置 vSlider 最低位置值。
	     *         this.vSlider.max = 10;//设置 vSlider 最高位置值。
	     *         this.vSlider.value = 2;//设置 vSlider 当前位置值。
	     *         this.vSlider.tick = 1;//设置 vSlider 刻度值。
	     *         this.vSlider.x = 100;//设置 vSlider 对象的属性 x 的值，用于控制 vSlider 对象的显示位置。
	     *         this.vSlider.y = 100;//设置 vSlider 对象的属性 y 的值，用于控制 vSlider 对象的显示位置。
	     *         this.vSlider.changeHandler = new Handler(this, this.onChange);//设置 vSlider 位置变化处理器。
	     *         Laya.stage.addChild(this.vSlider);//把 vSlider 添加到显示列表。
	     *     }
	     *     private onChange(value: number): void {
	     *         console.log("滑块的位置： value=" + value);
	     *     }
	     * }
	     * @see laya.ui.Slider
	     */
	class VSlider extends Slider {
	}
	Laya.ILaya.regClass(VSlider);
	Laya.ClassUtils.regClass("laya.ui.VSlider", VSlider);
	Laya.ClassUtils.regClass("Laya.VSlider", VSlider);

	/**
	 * 实例的 <code>selectedIndex</code> 属性发生变化时调度。
	 * @eventType laya.events.Event
	 */
	/*[Event(name = "change", type = "laya.events.Event")]*/
	/**
	 * 节点打开关闭时触发。
	 * @eventType laya.events.Event
	 */
	/*[Event(name = "open", type = "laya.events.Event")]*/
	/**
	 * <code>Tree</code> 控件使用户可以查看排列为可扩展树的层次结构数据。
	 *
	 * @example
	 * package
	 *	{
	 *		import laya.ui.Tree;
	 *		import laya.utils.Browser;
	 *		import laya.utils.Handler;

	 *		public class Tree_Example
	 *		{

	 *			public function Tree_Example()
	 *			{
	 *				Laya.init(640, 800);
	 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *				Laya.loader.load(["resource/ui/vscroll.png", "resource/ui/vscroll$bar.png", "resource/ui/vscroll$down.png", "resource/ui/vscroll$up.png", "resource/ui/clip_selectBox.png", "resource/ui/clip_tree_folder.png", "resource/ui/clip_tree_arrow.png"], Handler.create(this, onLoadComplete));
	 *			}

	 *			private function onLoadComplete():void
	 *			{
	 *				var xmlString:String;//创建一个xml字符串，用于存储树结构数据。
	 *				xmlString = "&lt;root&gt;&lt;item label='box1'&gt;&lt;abc label='child1'/&gt;&lt;abc label='child2'/&gt;&lt;abc label='child3'/&gt;&lt;abc label='child4'/&gt;&lt;abc label='child5'/&gt;&lt;/item&gt;&lt;item label='box2'&gt;&lt;abc label='child1'/&gt;&lt;abc label='child2'/&gt;&lt;abc label='child3'/&gt;&lt;abc label='child4'/&gt;&lt;/item&gt;&lt;/root&gt;";
	 *				var domParser:* = new Browser.window.DOMParser();//创建一个DOMParser实例domParser。
	 *				var xml:* = domParser.parseFromString(xmlString, "text/xml");//解析xml字符。

	 *				var tree:Tree = new Tree();//创建一个 Tree 类的实例对象 tree 。
	 *				tree.scrollBarSkin = "resource/ui/vscroll.png";//设置 tree 的皮肤。
	 *				tree.itemRender = Item;//设置 tree 的项渲染器。
	 *				tree.xml = xml;//设置 tree 的树结构数据。
	 *				tree.x = 100;//设置 tree 对象的属性 x 的值，用于控制 tree 对象的显示位置。
	 *				tree.y = 100;//设置 tree 对象的属性 y 的值，用于控制 tree 对象的显示位置。
	 *				tree.width = 200;//设置 tree 的宽度。
	 *				tree.height = 100;//设置 tree 的高度。
	 *				Laya.stage.addChild(tree);//将 tree 添加到显示列表。
	 *			}
	 *		}
	 *	}

	 * import laya.ui.Box;
	 * import laya.ui.Clip;
	 * import laya.ui.Label;
	 *	class Item extends Box
	 *	{
	 *		public function Item()
	 *		{
	 *			this.name = "render";
	 *			this.right = 0;
	 *			this.left = 0;

	 *			var selectBox:Clip = new Clip("resource/ui/clip_selectBox.png", 1, 2);
	 *			selectBox.name = "selectBox";
	 *			selectBox.height = 24;
	 *			selectBox.x = 13;
	 *			selectBox.y = 0;
	 *			selectBox.left = 12;
	 *			addChild(selectBox);

	 *			var folder:Clip = new Clip("resource/ui/clip_tree_folder.png", 1, 3);
	 *			folder.name = "folder";
	 *			folder.x = 14;
	 *			folder.y = 4;
	 *			addChild(folder);

	 *			var label:Label = new Label("treeItem");
	 *			label.name = "label";
	 *			label.color = "#ffff00";
	 *			label.width = 150;
	 *			label.height = 22;
	 *			label.x = 33;
	 *			label.y = 1;
	 *			label.left = 33;
	 *			label.right = 0;
	 *			addChild(label);

	 *			var arrow:Clip = new Clip("resource/ui/clip_tree_arrow.png", 1, 2);
	 *			arrow.name = "arrow";
	 *			arrow.x = 0;
	 *			arrow.y = 5;
	 *			addChild(arrow);
	 *		}
	 *	 }
	 * @example
	 * Laya.init(640, 800);//设置游戏画布宽高、渲染模式
	 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
	 * var res = ["resource/ui/vscroll.png", "resource/ui/vscroll$bar.png", "resource/ui/vscroll$down.png", "resource/ui/vscroll$up.png", "resource/ui/clip_selectBox.png", "resource/ui/clip_tree_folder.png", "resource/ui/clip_tree_arrow.png"];
	 * Laya.loader.load(res, new laya.utils.Handler(this, onLoadComplete));
	 * function onLoadComplete() {
	 *     var xmlString;//创建一个xml字符串，用于存储树结构数据。
	 *     xmlString = "&lt;root&gt;&lt;item label='box1'&gt;&lt;abc label='child1'/&gt;&lt;abc label='child2'/&gt;&lt;abc label='child3'/&gt;&lt;abc label='child4'/&gt;&lt;abc label='child5'/&gt;&lt;/item&gt;&lt;item label='box2'&gt;&lt;abc label='child1'/&gt;&lt;abc label='child2'/&gt;&lt;abc label='child3'/&gt;&lt;abc label='child4'/&gt;&lt;/item&gt;&lt;/root&gt;";
	 *     var domParser = new laya.utils.Browser.window.DOMParser();//创建一个DOMParser实例domParser。
	 *     var xml = domParser.parseFromString(xmlString, "text/xml");//解析xml字符。

	 *     var tree = new laya.ui.Tree();//创建一个 Tree 类的实例对象 tree 。
	 *     tree.scrollBarSkin = "resource/ui/vscroll.png";//设置 tree 的皮肤。
	 *     tree.itemRender = mypackage.treeExample.Item;//设置 tree 的项渲染器。
	 *     tree.xml = xml;//设置 tree 的树结构数据。
	 *     tree.x = 100;//设置 tree 对象的属性 x 的值，用于控制 tree 对象的显示位置。
	 *     tree.y = 100;//设置 tree 对象的属性 y 的值，用于控制 tree 对象的显示位置。
	 *     tree.width = 200;//设置 tree 的宽度。
	 *     tree.height = 100;//设置 tree 的高度。
	 *     Laya.stage.addChild(tree);//将 tree 添加到显示列表。
	 * }
	 * (function (_super) {
	 *     function Item() {
	 *         Item.__super.call(this);//初始化父类。
	 *         this.right = 0;
	 *         this.left = 0;

	 *         var selectBox = new laya.ui.Clip("resource/ui/clip_selectBox.png", 1, 2);
	 *         selectBox.name = "selectBox";//设置 selectBox 的name 为“selectBox”时，将被识别为树结构的项的背景。2帧：悬停时背景、选中时背景。
	 *         selectBox.height = 24;
	 *         selectBox.x = 13;
	 *         selectBox.y = 0;
	 *         selectBox.left = 12;
	 *         this.addChild(selectBox);//需要使用this.访问父类的属性或方法。

	 *         var folder = new laya.ui.Clip("resource/ui/clip_tree_folder.png", 1, 3);
	 *         folder.name = "folder";//设置 folder 的name 为“folder”时，将被识别为树结构的文件夹开启状态图表。2帧：折叠状态、打开状态。
	 *         folder.x = 14;
	 *         folder.y = 4;
	 *         this.addChild(folder);

	 *         var label = new laya.ui.Label("treeItem");
	 *         label.name = "label";//设置 label 的name 为“label”时，此值将用于树结构数据赋值。
	 *         label.color = "#ffff00";
	 *         label.width = 150;
	 *         label.height = 22;
	 *         label.x = 33;
	 *         label.y = 1;
	 *         label.left = 33;
	 *         label.right = 0;
	 *         this.addChild(label);

	 *         var arrow = new laya.ui.Clip("resource/ui/clip_tree_arrow.png", 1, 2);
	 *         arrow.name = "arrow";//设置 arrow 的name 为“arrow”时，将被识别为树结构的文件夹开启状态图表。2帧：折叠状态、打开状态。
	 *         arrow.x = 0;
	 *         arrow.y = 5;
	 *         this.addChild(arrow);
	 *     };
	 *     Laya.class(Item,"mypackage.treeExample.Item",_super);//注册类 Item 。
	 * })(laya.ui.Box);
	 * @example
	 * import Tree = laya.ui.Tree;
	 * import Browser = laya.utils.Browser;
	 * import Handler = laya.utils.Handler;
	 * class Tree_Example {

	 *     constructor() {
	 *         Laya.init(640, 800);
	 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *         Laya.loader.load(["resource/ui/vscroll.png", "resource/ui/vscroll$bar.png", "resource/ui/vscroll$down.png", "resource/ui/vscroll$up.png", "resource/ui/vscroll$up.png", "resource/ui/clip_selectBox.png", "resource/ui/clip_tree_folder * . * png", "resource/ui/clip_tree_arrow.png"], Handler.create(this, this.onLoadComplete));
	 *     }
	 *     private onLoadComplete(): void {
	 *         var xmlString: String;//创建一个xml字符串，用于存储树结构数据。
	 *         xmlString = "&lt;root&gt;&lt;item label='box1'&gt;&lt;abc label='child1'/&gt;&lt;abc label='child2'/&gt;&lt;abc label='child3'/&gt;&lt;abc label='child4'/&gt;&lt;abc label='child5'/&gt;&lt;/item&gt;&lt;item label='box2'&gt;&lt;abc  * label='child1'/&gt;&lt;abc label='child2'/&gt;&lt;abc label='child3'/&gt;&lt;abc label='child4'/&gt;&lt;/item&gt;&lt;/root&gt;";
	 *         var domParser: any = new Browser.window.DOMParser();//创建一个DOMParser实例domParser。
	 *         var xml: any = domParser.parseFromString(xmlString, "text/xml");//解析xml字符。

	 *         var tree: Tree = new Tree();//创建一个 Tree 类的实例对象 tree 。
	 *         tree.scrollBarSkin = "resource/ui/vscroll.png";//设置 tree 的皮肤。
	 *         tree.itemRender = Item;//设置 tree 的项渲染器。
	 *         tree.xml = xml;//设置 tree 的树结构数据。
	 *         tree.x = 100;//设置 tree 对象的属性 x 的值，用于控制 tree 对象的显示位置。
	 *         tree.y = 100;//设置 tree 对象的属性 y 的值，用于控制 tree 对象的显示位置。
	 *         tree.width = 200;//设置 tree 的宽度。
	 *         tree.height = 100;//设置 tree 的高度。
	 *         Laya.stage.addChild(tree);//将 tree 添加到显示列表。
	 *     }
	 * }
	 * import Box = laya.ui.Box;
	 * import Clip = laya.ui.Clip;
	 * import Label = laya.ui.Label;
	 * class Item extends Box {
	 *     constructor() {
	 *         super();
	 *         this.name = "render";
	 *         this.right = 0;
	 *         this.left = 0;
	 *         var selectBox: Clip = new Clip("resource/ui/clip_selectBox.png", 1, 2);
	 *         selectBox.name = "selectBox";
	 *         selectBox.height = 24;
	 *         selectBox.x = 13;
	 *         selectBox.y = 0;
	 *         selectBox.left = 12;
	 *         this.addChild(selectBox);

	 *         var folder: Clip = new Clip("resource/ui/clip_tree_folder.png", 1, 3);
	 *         folder.name = "folder";
	 *         folder.x = 14;
	 *         folder.y = 4;
	 *         this.addChild(folder);

	 *         var label: Label = new Label("treeItem");
	 *         label.name = "label";
	 *         label.color = "#ffff00";
	 *         label.width = 150;
	 *         label.height = 22;
	 *         label.x = 33;
	 *         label.y = 1;
	 *         label.left = 33;
	 *         label.right = 0;
	 *         this.addChild(label);

	 *         var arrow: Clip = new Clip("resource/ui/clip_tree_arrow.png", 1, 2);
	 *         arrow.name = "arrow";
	 *         arrow.x = 0;
	 *         arrow.y = 5;
	 *         this.addChild(arrow);
	 *     }
	 * }
	 */
	class Tree extends Box {
	    /**
	     * 创建一个新的 <code>Tree</code> 类实例。
	     * <p>在 <code>Tree</code> 构造函数中设置属性width、height的值都为200。</p>
	     */
	    constructor() {
	        super();
	        /**@private */
	        this._spaceLeft = 10;
	        /**@private */
	        this._spaceBottom = 0;
	        /**@private */
	        this._keepStatus = true;
	        this.width = this.height = 200;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._list && this._list.destroy(destroyChild);
	        this._list = null;
	        this._source = null;
	        this._renderHandler = null;
	    }
	    /**
	     * @internal
	    */
	    createChildren() {
	        this.addChild(this._list = new List());
	        this._list.renderHandler = Laya.Handler.create(this, this.renderItem, null, false);
	        this._list.repeatX = 1;
	        this._list.on(Laya.Event.CHANGE, this, this.onListChange);
	    }
	    /**
	     * @private
	     * 此对象包含的<code>List</code>实例的<code>Event.CHANGE</code>事件侦听处理函数。
	     */
	    onListChange(e = null) {
	        this.event(Laya.Event.CHANGE);
	    }
	    /**
	     * 数据源发生变化后，是否保持之前打开状态，默认为true。
	     * <p><b>取值：</b>
	     * <li>true：保持之前打开状态。</li>
	     * <li>false：不保持之前打开状态。</li>
	     * </p>
	     */
	    get keepStatus() {
	        return this._keepStatus;
	    }
	    set keepStatus(value) {
	        this._keepStatus = value;
	    }
	    /**
	     * 列表数据源，只包含当前可视节点数据。
	     */
	    get array() {
	        return this._list.array;
	    }
	    set array(value) {
	        if (this._keepStatus && this._list.array && value) {
	            this.parseOpenStatus(this._list.array, value);
	        }
	        this._source = value;
	        this._list.array = this.getArray();
	    }
	    /**
	     * 数据源，全部节点数据。
	     */
	    get source() {
	        return this._source;
	    }
	    /**
	     * 此对象包含的<code>List</code>实例对象。
	     */
	    get list() {
	        return this._list;
	    }
	    /**
	     * 此对象包含的<code>List</code>实例的单元格渲染器。
	     * <p><b>取值：</b>
	     * <ol>
	     * <li>单元格类对象。</li>
	     * <li> UI 的 JSON 描述。</li>
	     * </ol></p>
	     * @implements
	     */
	    get itemRender() {
	        return this._list.itemRender;
	    }
	    set itemRender(value) {
	        this._list.itemRender = value;
	    }
	    /**
	     * 滚动条皮肤。
	     */
	    get scrollBarSkin() {
	        return this._list.vScrollBarSkin;
	    }
	    set scrollBarSkin(value) {
	        this._list.vScrollBarSkin = value;
	    }
	    /**滚动条*/
	    get scrollBar() {
	        return this._list.scrollBar;
	    }
	    /**
	     * 单元格鼠标事件处理器。
	     * <p>默认返回参数（e:Event,index:int）。</p>
	     */
	    get mouseHandler() {
	        return this._list.mouseHandler;
	    }
	    set mouseHandler(value) {
	        this._list.mouseHandler = value;
	    }
	    /**
	     * <code>Tree</code> 实例的渲染处理器。
	     */
	    get renderHandler() {
	        return this._renderHandler;
	    }
	    set renderHandler(value) {
	        this._renderHandler = value;
	    }
	    /**
	     * 左侧缩进距离（以像素为单位）。
	     */
	    get spaceLeft() {
	        return this._spaceLeft;
	    }
	    set spaceLeft(value) {
	        this._spaceLeft = value;
	    }
	    /**
	     * 每一项之间的间隔距离（以像素为单位）。
	     */
	    get spaceBottom() {
	        return this._list.spaceY;
	    }
	    set spaceBottom(value) {
	        this._list.spaceY = value;
	    }
	    /**
	     * 表示当前选择的项索引。
	     */
	    get selectedIndex() {
	        return this._list.selectedIndex;
	    }
	    set selectedIndex(value) {
	        this._list.selectedIndex = value;
	    }
	    /**
	     * 当前选中的项对象的数据源。
	     */
	    get selectedItem() {
	        return this._list.selectedItem;
	    }
	    set selectedItem(value) {
	        this._list.selectedItem = value;
	    }
	    /**
	     * @inheritDoc
	     * @override
	     */
	    set width(value) {
	        super.width = value;
	        this._list.width = value;
	    }
	    get width() {
	        return super.width;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    set height(value) {
	        super.height = value;
	        this._list.height = value;
	    }
	    get height() {
	        return super.height;
	    }
	    /**
	     * @private
	     * 获取数据源集合。
	     */
	    getArray() {
	        var arr = [];
	        for (let item of this._source) { //TODO TS
	            if (this.getParentOpenStatus(item)) {
	                item.x = this._spaceLeft * this.getDepth(item);
	                arr.push(item);
	            }
	        }
	        return arr;
	    }
	    /**
	     * @private
	     * 获取项对象的深度。
	     */
	    getDepth(item, num = 0) {
	        if (item.nodeParent == null)
	            return num;
	        else
	            return this.getDepth(item.nodeParent, num + 1);
	    }
	    /**
	     * @private
	     * 获取项对象的上一级的打开状态。
	     */
	    getParentOpenStatus(item) {
	        var parent = item.nodeParent;
	        if (parent == null) {
	            return true;
	        }
	        else {
	            if (parent.isOpen) {
	                if (parent.nodeParent != null)
	                    return this.getParentOpenStatus(parent);
	                else
	                    return true;
	            }
	            else {
	                return false;
	            }
	        }
	    }
	    /**
	     * @private
	     * 渲染一个项对象。
	     * @param cell 一个项对象。
	     * @param index 项的索引。
	     */
	    renderItem(cell, index) {
	        var item = cell.dataSource;
	        if (item) {
	            cell.left = item.x;
	            var arrow = cell.getChildByName("arrow");
	            if (arrow) {
	                if (item.hasChild) {
	                    arrow.visible = true;
	                    arrow.index = item.isOpen ? 1 : 0;
	                    arrow.tag = index;
	                    arrow.off(Laya.Event.CLICK, this, this.onArrowClick);
	                    arrow.on(Laya.Event.CLICK, this, this.onArrowClick);
	                }
	                else {
	                    arrow.visible = false;
	                }
	            }
	            var folder = cell.getChildByName("folder");
	            if (folder) {
	                if (folder.clipY == 2) {
	                    folder.index = item.isDirectory ? 0 : 1;
	                }
	                else {
	                    folder.index = item.isDirectory ? item.isOpen ? 1 : 0 : 2;
	                }
	            }
	            this._renderHandler && this._renderHandler.runWith([cell, index]);
	        }
	    }
	    /**
	     * @private
	     */
	    onArrowClick(e) {
	        var arrow = e.currentTarget;
	        var index = arrow.tag;
	        this._list.array[index].isOpen = !this._list.array[index].isOpen;
	        this.event(Laya.Event.OPEN);
	        this._list.array = this.getArray();
	    }
	    /**
	     * 设置指定项索引的项对象的打开状态。
	     * @param index 项索引。
	     * @param isOpen 是否处于打开状态。
	     */
	    setItemState(index, isOpen) {
	        if (!this._list.array[index])
	            return;
	        this._list.array[index].isOpen = isOpen;
	        this._list.array = this.getArray();
	    }
	    /**
	     * 刷新项列表。
	     */
	    fresh() {
	        this._list.array = this.getArray();
	        this.repaint();
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    set dataSource(value) {
	        this._dataSource = value;
	        //if (value is XmlDom) xml = value as XmlDom;
	        super.dataSource = value;
	    }
	    get dataSource() {
	        return super.dataSource;
	    }
	    /**
	     *  xml结构的数据源。
	     */
	    set xml(value) {
	        var arr = [];
	        this.parseXml(value.childNodes[0], arr, null, true);
	        this.array = arr;
	    }
	    /**
	     * @private
	     * 解析并处理XML类型的数据源。
	     */
	    parseXml(xml, source, nodeParent, isRoot) {
	        var obj;
	        var list = xml.childNodes;
	        var childCount = list.length;
	        if (!isRoot) {
	            obj = {};
	            var list2 = xml.attributes;
	            for (let attrs of list2) {
	                var prop = attrs.nodeName;
	                var value = attrs.nodeValue;
	                obj[prop] = value == "true" ? true : value == "false" ? false : value;
	            }
	            obj.nodeParent = nodeParent;
	            if (childCount > 0)
	                obj.isDirectory = true;
	            obj.hasChild = childCount > 0;
	            source.push(obj);
	        }
	        for (var i = 0; i < childCount; i++) {
	            var node = list[i];
	            this.parseXml(node, source, obj, false);
	        }
	    }
	    /**
	     * @private
	     * 处理数据项的打开状态。
	     */
	    parseOpenStatus(oldSource, newSource) {
	        for (var i = 0, n = newSource.length; i < n; i++) {
	            var newItem = newSource[i];
	            if (newItem.isDirectory) {
	                for (var j = 0, m = oldSource.length; j < m; j++) {
	                    var oldItem = oldSource[j];
	                    if (oldItem.isDirectory && this.isSameParent(oldItem, newItem) && newItem.label == oldItem.label) {
	                        newItem.isOpen = oldItem.isOpen;
	                        break;
	                    }
	                }
	            }
	        }
	    }
	    /**
	     * @private
	     * 判断两个项对象在树结构中的父节点是否相同。
	     * @param item1 项对象。
	     * @param item2 项对象。
	     * @return 如果父节点相同值为true，否则值为false。
	     */
	    isSameParent(item1, item2) {
	        if (item1.nodeParent == null && item2.nodeParent == null)
	            return true;
	        else if (item1.nodeParent == null || item2.nodeParent == null)
	            return false;
	        else {
	            if (item1.nodeParent.label == item2.nodeParent.label)
	                return this.isSameParent(item1.nodeParent, item2.nodeParent);
	            else
	                return false;
	        }
	    }
	    /**
	     * 表示选择的树节点项的<code>path</code>属性值。
	     */
	    get selectedPath() {
	        if (this._list.selectedItem) {
	            return this._list.selectedItem.path;
	        }
	        return null;
	    }
	    /**
	     * 更新项列表，显示指定键名的数据项。
	     * @param	key 键名。
	     */
	    filter(key) {
	        if (Boolean(key)) {
	            var result = [];
	            this.getFilterSource(this._source, result, key);
	            this._list.array = result;
	        }
	        else {
	            this._list.array = this.getArray();
	        }
	    }
	    /**
	     * @private
	     * 获取数据源中指定键名的值。
	     */
	    getFilterSource(array, result, key) {
	        key = key.toLocaleLowerCase();
	        for (let item of array) {
	            if (!item.isDirectory && String(item.label).toLowerCase().indexOf(key) > -1) {
	                item.x = 0;
	                result.push(item);
	            }
	            if (item.child && item.child.length > 0) {
	                this.getFilterSource(item.child, result, key);
	            }
	        }
	    }
	}
	Laya.ILaya.regClass(Tree);
	Laya.ClassUtils.regClass("laya.ui.Tree", Tree);
	Laya.ClassUtils.regClass("Laya.Tree", Tree);

	/**
	     * <code>VBox</code> 是一个垂直布局容器类。
	     */
	class VBox extends LayoutBox {
	    /**
	     * @override
	     */
	    set width(value) {
	        if (this._width != value) {
	            super.width = value;
	            this.callLater(this.changeItems);
	        }
	    }
	    get width() {
	        return super.width;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    changeItems() {
	        this._itemChanged = false;
	        var items = [];
	        var maxWidth = 0;
	        for (var i = 0, n = this.numChildren; i < n; i++) {
	            var item = this.getChildAt(i);
	            if (item) {
	                items.push(item);
	                maxWidth = this._width ? this._width : Math.max(maxWidth, item.width * item.scaleX);
	            }
	        }
	        this.sortItem(items);
	        var top = 0;
	        for (i = 0, n = items.length; i < n; i++) {
	            item = items[i];
	            item.y = top;
	            top += item.height * item.scaleY + this._space;
	            if (this._align == VBox.LEFT) {
	                item.x = 0;
	            }
	            else if (this._align == VBox.CENTER) {
	                item.x = (maxWidth - item.width * item.scaleX) * 0.5;
	            }
	            else if (this._align == VBox.RIGHT) {
	                item.x = maxWidth - item.width * item.scaleX;
	            }
	        }
	        this._sizeChanged();
	    }
	}
	/**
	 * 无对齐。
	 */
	VBox.NONE = "none";
	/**
	 * 左对齐。
	 */
	VBox.LEFT = "left";
	/**
	 * 居中对齐。
	 */
	VBox.CENTER = "center";
	/**
	 * 右对齐。
	 */
	VBox.RIGHT = "right";
	Laya.ILaya.regClass(VBox);
	Laya.ClassUtils.regClass("laya.ui.VBox", VBox);
	Laya.ClassUtils.regClass("Laya.VBox", VBox);

	/**
	 * 字体切片，简化版的位图字体，只需设置一个切片图片和文字内容即可使用，效果同位图字体
	 * 使用方式：设置位图字体皮肤skin，设置皮肤对应的字体内容sheet（如果多行，可以使用空格换行），示例：
	 * fontClip.skin = "font1.png";//设置皮肤
	 * fontClip.sheet = "abc123 456";//设置皮肤对应的内容，空格换行。此皮肤为2行5列（显示时skin会被等分为2行5列），第一行对应的文字为"abc123"，第二行为"456"
	 * fontClip.value = "a1326";//显示"a1326"文字
	 */
	class FontClip extends Clip {
	    /**
	     * @param skin 位图字体皮肤
	     * @param sheet 位图字体内容，空格代表换行
	     */
	    constructor(skin = null, sheet = null) {
	        super();
	        /**数值*/
	        this._valueArr = '';
	        /**文字内容数组**/
	        this._indexMap = null;
	        /**位图字体内容**/
	        this._sheet = null;
	        /**@private */
	        this._direction = "horizontal";
	        /**X方向间隙*/
	        this._spaceX = 0;
	        /**Y方向间隙*/
	        this._spaceY = 0;
	        /**@private 水平对齐方式*/
	        this._align = "left";
	        /**@private 显示文字宽*/
	        this._wordsW = 0;
	        /**@private 显示文字高*/
	        this._wordsH = 0;
	        if (skin)
	            this.skin = skin;
	        if (sheet)
	            this.sheet = sheet;
	    }
	    /**
	     * @internal
	     */
	    /*override*/ createChildren() {
	        this._bitmap = new AutoBitmap();
	        this.on(Laya.Event.LOADED, this, this._onClipLoaded);
	    }
	    /**
	     * 资源加载完毕
	     */
	    _onClipLoaded() {
	        this.callLater(this.changeValue);
	    }
	    /**
	     * 设置位图字体内容，空格代表换行。比如"abc123 456"，代表第一行对应的文字为"abc123"，第二行为"456"
	     */
	    get sheet() {
	        return this._sheet;
	    }
	    set sheet(value) {
	        value += "";
	        this._sheet = value;
	        //根据空格换行
	        var arr = value.split(" ");
	        this._clipX = String(arr[0]).length;
	        this.clipY = arr.length;
	        this._indexMap = {};
	        for (var i = 0; i < this._clipY; i++) {
	            var line = arr[i].split("");
	            for (var j = 0, n = line.length; j < n; j++) {
	                this._indexMap[line[j]] = i * this._clipX + j;
	            }
	        }
	    }
	    /**
	     * 设置位图字体的显示内容
	     */
	    get value() {
	        if (!this._valueArr)
	            return "";
	        return this._valueArr;
	    }
	    set value(value) {
	        value += "";
	        this._valueArr = value;
	        this.callLater(this.changeValue);
	    }
	    /**
	     * 布局方向。
	     * <p>默认值为"horizontal"。</p>
	     * <p><b>取值：</b>
	     * <li>"horizontal"：表示水平布局。</li>
	     * <li>"vertical"：表示垂直布局。</li>
	     * </p>
	     */
	    get direction() {
	        return this._direction;
	    }
	    set direction(value) {
	        this._direction = value;
	        this.callLater(this.changeValue);
	    }
	    /**X方向文字间隙*/
	    get spaceX() {
	        return this._spaceX;
	    }
	    set spaceX(value) {
	        this._spaceX = value;
	        if (this._direction === "horizontal")
	            this.callLater(this.changeValue);
	    }
	    /**Y方向文字间隙*/
	    get spaceY() {
	        return this._spaceY;
	    }
	    set spaceY(value) {
	        this._spaceY = value;
	        if (!(this._direction === "horizontal"))
	            this.callLater(this.changeValue);
	    }
	    set align(v) {
	        this._align = v;
	        this.callLater(this.changeValue);
	    }
	    /**水平对齐方式*/
	    get align() {
	        return this._align;
	    }
	    /**渲染数值*/
	    changeValue() {
	        if (!this._sources)
	            return;
	        if (!this._valueArr)
	            return;
	        this.graphics.clear(true);
	        var texture;
	        texture = this._sources[0];
	        if (!texture)
	            return;
	        var isHorizontal = (this._direction === "horizontal");
	        if (isHorizontal) {
	            this._wordsW = this._valueArr.length * (texture.sourceWidth + this.spaceX);
	            this._wordsH = texture.sourceHeight;
	        }
	        else {
	            this._wordsW = texture.sourceWidth;
	            this._wordsH = (texture.sourceHeight + this.spaceY) * this._valueArr.length;
	        }
	        var dX = 0;
	        if (this._width) {
	            switch (this._align) {
	                case "center":
	                    dX = 0.5 * (this._width - this._wordsW);
	                    break;
	                case "right":
	                    dX = this._width - this._wordsW;
	                    break;
	                default:
	                    dX = 0;
	            }
	        }
	        for (var i = 0, sz = this._valueArr.length; i < sz; i++) {
	            var index = this._indexMap[this._valueArr.charAt(i)];
	            if (!this.sources[index])
	                continue;
	            texture = this.sources[index];
	            if (isHorizontal)
	                this.graphics.drawImage(texture, dX + i * (texture.sourceWidth + this.spaceX), 0, texture.sourceWidth, texture.sourceHeight);
	            else
	                this.graphics.drawImage(texture, 0 + dX, i * (texture.sourceHeight + this.spaceY), texture.sourceWidth, texture.sourceHeight);
	        }
	        if (!this._width) {
	            this._widget.resetLayoutX();
	            this.callLater(this._sizeChanged);
	        }
	        if (!this._height) {
	            this._widget.resetLayoutY();
	            this.callLater(this._sizeChanged);
	        }
	    }
	    /**
	     * @override
	     */
	    /*override*/ set width(value) {
	        super.width = value;
	        this.callLater(this.changeValue);
	    }
	    get width() {
	        return super.width;
	    }
	    /**
	     * @override
	     */
	    /*override*/ set height(value) {
	        super.height = value;
	        this.callLater(this.changeValue);
	    }
	    get height() {
	        return super.height;
	    }
	    /**
	     * @override
	     */
	    /*override*/ measureWidth() {
	        return this._wordsW;
	    }
	    /**
	     * @override
	     */
	    /*override*/ measureHeight() {
	        return this._wordsH;
	    }
	    /**
	     *
	     * @param destroyChild
	     * @override
	     */
	    /*override*/ destroy(destroyChild = true) {
	        this._valueArr = null;
	        this._indexMap = null;
	        this.graphics.clear(true);
	        this.removeSelf();
	        this.off(Laya.Event.LOADED, this, this._onClipLoaded);
	        super.destroy(destroyChild);
	    }
	}
	Laya.ILaya.regClass(FontClip);
	Laya.ClassUtils.regClass("laya.ui.FontClip", FontClip);
	Laya.ClassUtils.regClass("Laya.FontClip", FontClip);

	/**
	 * <code>View</code> 是一个视图类，2.0开始，更改继承至Scene类，相对于Scene，增加相对布局功能。
	 */
	class View extends Laya.Scene {
	    constructor() {
	        super();
	        /**@internal */
	        this._watchMap = {};
	        /**X锚点，值为0-1，设置anchorX值最终通过pivotX值来改变节点轴心点。*/
	        this._anchorX = NaN;
	        /**Y锚点，值为0-1，设置anchorY值最终通过pivotY值来改变节点轴心点。*/
	        this._anchorY = NaN;
	        this._widget = Widget.EMPTY;
	    }
	    static __init__() {
	        Laya.ILaya.ClassUtils.regShortClassName([ViewStack, Button, TextArea, ColorPicker, Box, ScaleBox, CheckBox, Clip, ComboBox, UIComponent,
	            HScrollBar, HSlider, Image, Label, List, Panel, ProgressBar, Radio, RadioGroup, ScrollBar, Slider, Tab, TextInput, View,
	            VScrollBar, VSlider, Tree, HBox, VBox, Laya.Animation, Laya.Text, FontClip]);
	    }
	    /**
	     * @private 兼容老版本
	     * 注册组件类映射。
	     * <p>用于扩展组件及修改组件对应关系。</p>
	     * @param key 组件类的关键字。
	     * @param compClass 组件类对象。
	     */
	    static regComponent(key, compClass) {
	        Laya.ILaya.ClassUtils.regClass(key, compClass);
	    }
	    /**
	     * @private 兼容老版本
	     * 注册UI视图类的逻辑处理类。
	     * @internal 注册runtime解析。
	     * @param key UI视图类的关键字。
	     * @param compClass UI视图类对应的逻辑处理类。
	     */
	    static regViewRuntime(key, compClass) {
	        Laya.ILaya.ClassUtils.regClass(key, compClass);
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
	    /**
	     * @inheritDoc
	     * @override
	    */
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
	    /**
	     * @private
	     * @override
	    */
	    /*override*/ _sizeChanged() {
	        if (!isNaN(this._anchorX))
	            this.pivotX = this.anchorX * this.width;
	        if (!isNaN(this._anchorY))
	            this.pivotY = this.anchorY * this.height;
	        this.event(Laya.Event.RESIZE);
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
	    /**
	     * @implements
	     * laya.ui.UIComponent#dataSource
	     * */
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
	Laya.ILaya.regClass(View);
	Laya.ClassUtils.regClass("laya.ui.View", View);
	Laya.ClassUtils.regClass("Laya.View", View);
	//dialog 依赖于view，放到这里的话，谁在前都会报错，所以不能放到这里了

	/**
	 * <code>Dialog</code> 组件是一个弹出对话框，实现对话框弹出，拖动，模式窗口功能。
	 * 可以通过UIConfig设置弹出框背景透明度，模式窗口点击边缘是否关闭等
	 * 通过设置zOrder属性，可以更改弹出的层次
	 * 通过设置popupEffect和closeEffect可以设置弹出效果和关闭效果，如果不想有任何弹出关闭效果，可以设置前述属性为空
	 *
	 * @example <caption>以下示例代码，创建了一个 <code>Dialog</code> 实例。</caption>
	 * package
	 *	{
	 *		import laya.ui.Dialog;
	 *		import laya.utils.Handler;
	 *		public class Dialog_Example
	 *		{
	 *			private var dialog:Dialog_Instance;
	 *			public function Dialog_Example()
	 *			{
	 *				Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
	 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *				Laya.loader.load("resource/ui/btn_close.png", Handler.create(this, onLoadComplete));//加载资源。
	 *			}
	 *			private function onLoadComplete():void
	 *			{
	 *				dialog = new Dialog_Instance();//创建一个 Dialog_Instance 类的实例对象 dialog。
	 *				dialog.dragArea = "0,0,150,50";//设置 dialog 的拖拽区域。
	 *				dialog.show();//显示 dialog。
	 *				dialog.closeHandler = new Handler(this, onClose);//设置 dialog 的关闭函数处理器。
	 *			}
	 *			private function onClose(name:String):void
	 *			{
	 *				if (name == Dialog.CLOSE)
	 *				{
	 *					trace("通过点击 name 为" + name +"的组件，关闭了dialog。");
	 *				}
	 *			}
	 *		}
	 *	}
	 *	import laya.ui.Button;
	 *	import laya.ui.Dialog;
	 *	import laya.ui.Image;
	 *	class Dialog_Instance extends Dialog
	 *	{
	 *		function Dialog_Instance():void
	 *		{
	 *			var bg:Image = new Image("resource/ui/bg.png");
	 *			bg.sizeGrid = "40,10,5,10";
	 *			bg.width = 150;
	 *			bg.height = 250;
	 *			addChild(bg);
	 *			var image:Image = new Image("resource/ui/image.png");
	 *			addChild(image);
	 *			var button:Button = new Button("resource/ui/btn_close.png");
	 *			button.name = Dialog.CLOSE;//设置button的name属性值。
	 *			button.x = 0;
	 *			button.y = 0;
	 *			addChild(button);
	 *		}
	 *	}
	 * @example
	 * Laya.init(640, 800);//设置游戏画布宽高、渲染模式
	 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
	 * var dialog;
	 * Laya.loader.load("resource/ui/btn_close.png", laya.utils.Handler.create(this, loadComplete));//加载资源
	 * (function (_super) {//新建一个类Dialog_Instance继承自laya.ui.Dialog。
	 *     function Dialog_Instance() {
	 *         Dialog_Instance.__super.call(this);//初始化父类
	 *         var bg = new laya.ui.Image("resource/ui/bg.png");//新建一个 Image 类的实例 bg 。
	 *         bg.sizeGrid = "10,40,10,5";//设置 bg 的网格信息。
	 *         bg.width = 150;//设置 bg 的宽度。
	 *         bg.height = 250;//设置 bg 的高度。
	 *         this.addChild(bg);//将 bg 添加到显示列表。
	 *         var image = new laya.ui.Image("resource/ui/image.png");//新建一个 Image 类的实例 image 。
	 *         this.addChild(image);//将 image 添加到显示列表。
	 *         var button = new laya.ui.Button("resource/ui/btn_close.png");//新建一个 Button 类的实例 bg 。
	 *         button.name = laya.ui.Dialog.CLOSE;//设置 button 的 name 属性值。
	 *         button.x = 0;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。
	 *         button.y = 0;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。
	 *         this.addChild(button);//将 button 添加到显示列表。
	 *     };
	 *     Laya.class(Dialog_Instance,"mypackage.dialogExample.Dialog_Instance",_super);//注册类Dialog_Instance。
	 * })(laya.ui.Dialog);
	 * function loadComplete() {
	 *     console.log("资源加载完成！");
	 *     dialog = new mypackage.dialogExample.Dialog_Instance();//创建一个 Dialog_Instance 类的实例对象 dialog。
	 *     dialog.dragArea = "0,0,150,50";//设置 dialog 的拖拽区域。
	 *     dialog.show();//显示 dialog。
	 *     dialog.closeHandler = new laya.utils.Handler(this, onClose);//设置 dialog 的关闭函数处理器。
	 * }
	 * function onClose(name) {
	 *     if (name == laya.ui.Dialog.CLOSE) {
	 *         console.log("通过点击 name 为" + name + "的组件，关闭了dialog。");
	 *     }
	 * }
	 * @example
	 * import Dialog = laya.ui.Dialog;
	 * import Handler = laya.utils.Handler;
	 * class Dialog_Example {
	 *     private dialog: Dialog_Instance;
	 *     constructor() {
	 *         Laya.init(640, 800);//设置游戏画布宽高。
	 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
	 *         Laya.loader.load("resource/ui/btn_close.png", Handler.create(this, this.onLoadComplete));//加载资源。
	 *     }
	 *     private onLoadComplete(): void {
	 *         this.dialog = new Dialog_Instance();//创建一个 Dialog_Instance 类的实例对象 dialog。
	 *         this.dialog.dragArea = "0,0,150,50";//设置 dialog 的拖拽区域。
	 *         this.dialog.show();//显示 dialog。
	 *         this.dialog.closeHandler = new Handler(this, this.onClose);//设置 dialog 的关闭函数处理器。
	 *     }
	 *     private onClose(name: string): void {
	 *         if (name == Dialog.CLOSE) {
	 *             console.log("通过点击 name 为" + name + "的组件，关闭了dialog。");
	 *         }
	 *     }
	 * }
	 * import Button = laya.ui.Button;
	 * class Dialog_Instance extends Dialog {
	 *     Dialog_Instance(): void {
	 *         var bg: laya.ui.Image = new laya.ui.Image("resource/ui/bg.png");
	 *         bg.sizeGrid = "40,10,5,10";
	 *         bg.width = 150;
	 *         bg.height = 250;
	 *         this.addChild(bg);
	 *         var image: laya.ui.Image = new laya.ui.Image("resource/ui/image.png");
	 *         this.addChild(image);
	 *         var button: Button = new Button("resource/ui/btn_close.png");
	 *         button.name = Dialog.CLOSE;//设置button的name属性值。
	 *         button.x = 0;
	 *         button.y = 0;
	 *         this.addChild(button);
	 *     }
	 * }
	 */
	class Dialog extends View {
	    constructor() {
	        super();
	        /**是否显示弹出效果*/
	        this.isShowEffect = true;
	        /**指定对话框是否居中弹。<p>如果值为true，则居中弹出，否则，则根据对象坐标显示，默认为true。</p>*/
	        this.isPopupCenter = true;
	        this.popupEffect = Dialog.manager.popupEffectHandler;
	        this.closeEffect = Dialog.manager.closeEffectHandler;
	        this._dealDragArea();
	        this.on(Laya.Event.CLICK, this, this._onClick);
	    }
	    /**对话框管理容器，所有的对话框都在该容器内，并且受管理器管理，可以自定义自己的管理器，来更改窗口管理的流程。
	     * 任意对话框打开和关闭，都会触发管理类的open和close事件*/
	    static get manager() {
	        return Dialog._manager = Dialog._manager || new DialogManager();
	    }
	    static set manager(value) {
	        Dialog._manager = value;
	    }
	    /**@private 提取拖拽区域*/
	    _dealDragArea() {
	        var dragTarget = this.getChildByName("drag");
	        if (dragTarget) {
	            this.dragArea = dragTarget._x + "," + dragTarget._y + "," + dragTarget.width + "," + dragTarget.height;
	            dragTarget.removeSelf();
	        }
	    }
	    /**
	     * 用来指定对话框的拖拽区域。默认值为"0,0,0,0"。
	     * <p><b>格式：</b>构成一个矩形所需的 x,y,width,heith 值，用逗号连接为字符串。
	     * 例如："0,0,100,200"。</p>
	     * @see #includeExamplesSummary 请参考示例
	     */
	    get dragArea() {
	        if (this._dragArea)
	            return this._dragArea.toString();
	        return null;
	    }
	    set dragArea(value) {
	        if (value) {
	            var a = UIUtils.fillArray([0, 0, 0, 0], value, Number);
	            this._dragArea = new Laya.Rectangle(a[0], a[1], a[2], a[3]);
	            this.on(Laya.Event.MOUSE_DOWN, this, this._onMouseDown);
	        }
	        else {
	            this._dragArea = null;
	            this.off(Laya.Event.MOUSE_DOWN, this, this._onMouseDown);
	        }
	    }
	    /**@private */
	    _onMouseDown(e) {
	        var point = this.getMousePoint();
	        if (this._dragArea.contains(point.x, point.y))
	            this.startDrag();
	        else
	            this.stopDrag();
	    }
	    /**@private 处理默认点击事件*/
	    _onClick(e) {
	        var btn = e.target;
	        if (btn) {
	            switch (btn.name) {
	                case Dialog.CLOSE:
	                case Dialog.CANCEL:
	                case Dialog.SURE:
	                case Dialog.NO:
	                case Dialog.OK:
	                case Dialog.YES:
	                    this.close(btn.name);
	                    return;
	            }
	        }
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ open(closeOther = true, param = null) {
	        this._dealDragArea();
	        this._param = param;
	        Dialog.manager.open(this, closeOther, this.isShowEffect);
	        Dialog.manager.lock(false);
	    }
	    /**
	     * 关闭对话框。
	     * @param type 关闭的原因，会传递给onClosed函数
	     * @override
	     */
	    /*override*/ close(type = null) {
	        this.closeType = type;
	        Dialog.manager.close(this);
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ destroy(destroyChild = true) {
	        this.closeHandler = null;
	        this.popupEffect = null;
	        this.closeEffect = null;
	        this._dragArea = null;
	        super.destroy(destroyChild);
	    }
	    /**
	     * 显示对话框（以非模式窗口方式显示）。
	     * @param closeOther 是否关闭其它的对话框。若值为true则关闭其它对话框。
	     * @param showEffect 是否显示弹出效果
	     */
	    show(closeOther = false, showEffect = true) {
	        this._open(false, closeOther, showEffect);
	    }
	    /**
	     * 显示对话框（以模式窗口方式显示）。
	     * @param closeOther 是否关闭其它的对话框。若值为true则关闭其它对话框。
	     * @param showEffect 是否显示弹出效果
	     */
	    popup(closeOther = false, showEffect = true) {
	        this._open(true, closeOther, showEffect);
	    }
	    /**@private */
	    _open(modal, closeOther, showEffect) {
	        this.isModal = modal;
	        this.isShowEffect = showEffect;
	        Dialog.manager.lock(true);
	        this.open(closeOther);
	    }
	    /**弹出框的显示状态；如果弹框处于显示中，则为true，否则为false;*/
	    get isPopup() {
	        return this.parent != null;
	    }
	    /**
	     * @inheritDoc
	     * @override
	    */
	    /*override*/ set zOrder(value) {
	        super.zOrder = value;
	        Dialog.manager._checkMask();
	    }
	    get zOrder() {
	        return super.zOrder;
	    }
	    /**
	     * 设置锁定界面，在界面未准备好前显示锁定界面，准备完毕后则移除锁定层，如果为空则什么都不显示
	     * @param	view 锁定界面内容
	     */
	    static setLockView(view) {
	        Dialog.manager.setLockView(view);
	    }
	    /**
	     * 锁定所有层，显示加载条信息，防止下面内容被点击
	     */
	    static lock(value) {
	        Dialog.manager.lock(value);
	    }
	    /**关闭所有对话框。*/
	    static closeAll() {
	        Dialog.manager.closeAll();
	    }
	    /**
	     * 根据组获取对话框集合
	     * @param	group 组名称
	     * @return	对话框数组
	     */
	    static getDialogsByGroup(group) {
	        return Dialog.manager.getDialogsByGroup(group);
	    }
	    /**
	     * 根据组关闭所有弹出框
	     * @param	group 需要关闭的组名称
	     */
	    static closeByGroup(group) {
	        return Dialog.manager.closeByGroup(group);
	    }
	}
	/**对话框内的某个按钮命名为close，点击此按钮则会关闭*/
	Dialog.CLOSE = "close";
	/**对话框内的某个按钮命名为cancel，点击此按钮则会关闭*/
	Dialog.CANCEL = "cancel";
	/**对话框内的某个按钮命名为sure，点击此按钮则会关闭*/
	Dialog.SURE = "sure";
	/**对话框内的某个按钮命名为no，点击此按钮则会关闭*/
	Dialog.NO = "no";
	/**对话框内的某个按钮命名为yes，点击此按钮则会关闭*/
	Dialog.YES = "yes";
	/**对话框内的某个按钮命名为ok，点击此按钮则会关闭*/
	Dialog.OK = "ok";
	IUI.Dialog = Dialog;
	Laya.ILaya.regClass(Dialog);
	Laya.ClassUtils.regClass("laya.ui.Dialog", Dialog);
	Laya.ClassUtils.regClass("Laya.Dialog", Dialog);

	/**鼠标提示管理类*/
	class TipManager extends UIComponent {
	    constructor() {
	        super();
	        this._tipBox = new UIComponent();
	        this._tipBox.addChild(this._tipText = new Laya.Text());
	        this._tipText.x = this._tipText.y = 5;
	        this._tipText.color = TipManager.tipTextColor;
	        this._defaultTipHandler = this._showDefaultTip;
	        window.Laya.stage.on(UIEvent.SHOW_TIP, this, this._onStageShowTip);
	        window.Laya.stage.on(UIEvent.HIDE_TIP, this, this._onStageHideTip);
	        this.zOrder = 1100;
	    }
	    /**
	     * @private
	     */
	    _onStageHideTip(e) {
	        window.Laya.timer.clear(this, this._showTip);
	        this.closeAll();
	        this.removeSelf();
	    }
	    /**
	     * @private
	     */
	    _onStageShowTip(data) {
	        window.Laya.timer.once(TipManager.tipDelay, this, this._showTip, [data], true);
	    }
	    /**
	     * @private
	     */
	    _showTip(tip) {
	        if (typeof (tip) == 'string') {
	            var text = String(tip);
	            if (Boolean(text)) {
	                this._defaultTipHandler(text);
	            }
	        }
	        else if (tip instanceof Laya.Handler) {
	            tip.run();
	        }
	        else if (tip instanceof Function) {
	            tip.apply();
	        }
	        {
	            window.Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this._onStageMouseMove);
	            window.Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this._onStageMouseDown);
	        }
	        this._onStageMouseMove(null);
	    }
	    /**
	     * @private
	     */
	    _onStageMouseDown(e) {
	        this.closeAll();
	    }
	    /**
	     * @private
	     */
	    _onStageMouseMove(e) {
	        this._showToStage(this, TipManager.offsetX, TipManager.offsetY);
	    }
	    /**
	     * @private
	     */
	    _showToStage(dis, offX = 0, offY = 0) {
	        var Laya = window.Laya;
	        var rec = dis.getBounds();
	        dis.x = Laya.stage.mouseX + offX;
	        dis.y = Laya.stage.mouseY + offY;
	        if (dis._x + rec.width > Laya.stage.width) {
	            dis.x -= rec.width + offX;
	        }
	        if (dis._y + rec.height > Laya.stage.height) {
	            dis.y -= rec.height + offY;
	        }
	    }
	    /**关闭所有鼠标提示*/
	    closeAll() {
	        var Laya$1 = window.Laya;
	        Laya$1.timer.clear(this, this._showTip);
	        Laya$1.stage.off(Laya.Event.MOUSE_MOVE, this, this._onStageMouseMove);
	        Laya$1.stage.off(Laya.Event.MOUSE_DOWN, this, this._onStageMouseDown);
	        this.removeChildren();
	    }
	    /**
	     * 显示显示对象类型的tip
	     */
	    showDislayTip(tip) {
	        this.addChild(tip);
	        this._showToStage(this);
	        window.Laya._currentStage.addChild(this);
	    }
	    /**
	     * @private
	     */
	    _showDefaultTip(text) {
	        this._tipText.text = text;
	        var g = this._tipBox.graphics;
	        g.clear(true);
	        g.drawRect(0, 0, this._tipText.width + 10, this._tipText.height + 10, TipManager.tipBackColor);
	        this.addChild(this._tipBox);
	        this._showToStage(this);
	        window.Laya._currentStage.addChild(this);
	    }
	    /**默认鼠标提示函数*/
	    get defaultTipHandler() {
	        return this._defaultTipHandler;
	    }
	    set defaultTipHandler(value) {
	        this._defaultTipHandler = value;
	    }
	}
	TipManager.offsetX = 10;
	TipManager.offsetY = 15;
	TipManager.tipTextColor = "#ffffff";
	TipManager.tipBackColor = "#111111";
	TipManager.tipDelay = 200;
	Laya.ILaya.regClass(TipManager);
	Laya.ClassUtils.regClass("laya.ui.TipManager", TipManager);
	Laya.ClassUtils.regClass("Laya.TipManager", TipManager);

	//TODO 什么时候做
	class UILib {
	    static __init__() {
	        //注册UI类名称映射
	    }
	}

	/**
	 * 微信开放数据展示组件，直接实例本组件，即可根据组件宽高，位置，以最优的方式显示开放域数据
	 */
	class WXOpenDataViewer extends UIComponent {
	    //private _texture:Texture;
	    constructor() {
	        super();
	        this._width = this._height = 200;
	        var tex = new Laya.Texture();
	        tex.bitmap = new Laya.Texture2D();
	        this.texture = tex;
	    }
	    /**
	     * @override
	     */
	    onEnable() {
	        this.postMsg({ type: "display", rate: Laya.Laya.stage.frameRate });
	        if (window.wx && window.sharedCanvas)
	            Laya.Laya.timer.frameLoop(1, this, this._onLoop);
	    }
	    /**
	     * @override
	     */
	    onDisable() {
	        this.postMsg({ type: "undisplay" });
	        Laya.Laya.timer.clear(this, this._onLoop);
	    }
	    _onLoop() {
	        this.texture.bitmap.loadImageSource(window.sharedCanvas);
	    }
	    /**
	     * @override
	     */
	    set width(value) {
	        super.width = value;
	        if (window.sharedCanvas)
	            window.sharedCanvas.width = value;
	        this.callLater(this._postMsg);
	    }
	    /**
	     * @override
	     */
	    set height(value) {
	        super.height = value;
	        if (window.sharedCanvas)
	            window.sharedCanvas.height = value;
	        this.callLater(this._postMsg);
	    }
	    /**
	     * @override
	     */
	    set x(value) {
	        super.x = value;
	        this.callLater(this._postMsg);
	    }
	    /**
	     * @override
	     */
	    set y(value) {
	        super.y = value;
	        this.callLater(this._postMsg);
	    }
	    _postMsg() {
	        var mat = new Laya.Matrix();
	        mat.translate(this.x, this.y);
	        var stage = Laya.Laya.stage;
	        mat.scale(stage._canvasTransform.getScaleX() * this.globalScaleX * stage.transform.getScaleX(), stage._canvasTransform.getScaleY() * this.globalScaleY * stage.transform.getScaleY());
	        this.postMsg({ type: "changeMatrix", a: mat.a, b: mat.b, c: mat.c, d: mat.d, tx: mat.tx, ty: mat.ty, w: this.width, h: this.height });
	    }
	    /**向开放数据域发送消息*/
	    postMsg(msg) {
	        if (window.wx && window.wx.getOpenDataContext) {
	            var openDataContext = window.wx.getOpenDataContext();
	            openDataContext.postMessage(msg);
	        }
	    }
	}

	exports.AdvImage = AdvImage;
	exports.AutoBitmap = AutoBitmap;
	exports.Box = Box;
	exports.Button = Button;
	exports.CheckBox = CheckBox;
	exports.Clip = Clip;
	exports.ColorPicker = ColorPicker;
	exports.ComboBox = ComboBox;
	exports.Dialog = Dialog;
	exports.DialogManager = DialogManager;
	exports.FontClip = FontClip;
	exports.HBox = HBox;
	exports.HScrollBar = HScrollBar;
	exports.HSlider = HSlider;
	exports.IUI = IUI;
	exports.Image = Image;
	exports.Label = Label;
	exports.LayoutBox = LayoutBox;
	exports.List = List;
	exports.Panel = Panel;
	exports.ProgressBar = ProgressBar;
	exports.Radio = Radio;
	exports.RadioGroup = RadioGroup;
	exports.ScaleBox = ScaleBox;
	exports.ScrollBar = ScrollBar;
	exports.Slider = Slider;
	exports.Styles = Styles;
	exports.Tab = Tab;
	exports.TextArea = TextArea;
	exports.TextInput = TextInput;
	exports.TipManager = TipManager;
	exports.Tree = Tree;
	exports.UIComponent = UIComponent;
	exports.UIConfig = UIConfig;
	exports.UIEvent = UIEvent;
	exports.UIGroup = UIGroup;
	exports.UILib = UILib;
	exports.UIUtils = UIUtils;
	exports.VBox = VBox;
	exports.VScrollBar = VScrollBar;
	exports.VSlider = VSlider;
	exports.View = View;
	exports.ViewStack = ViewStack;
	exports.WXOpenDataViewer = WXOpenDataViewer;
	exports.Widget = Widget;

}(window.Laya = window.Laya|| {}, Laya));
