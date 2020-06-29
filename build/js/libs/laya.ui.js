(function (exports, Laya) {
	'use strict';

	class UIConfig {
	}
	UIConfig.touchScrollEnable = true;
	UIConfig.mouseWheelEnable = true;
	UIConfig.showButtons = true;
	UIConfig.popupBgColor = "#000000";
	UIConfig.popupBgAlpha = 0.5;
	UIConfig.closeDialogOnSide = true;
	window.UIConfig = UIConfig;

	class Styles {
	}
	Styles.defaultSizeGrid = [4, 4, 4, 4, 0];
	Styles.labelColor = "#000000";
	Styles.labelPadding = [2, 2, 2, 2];
	Styles.inputLabelPadding = [1, 1, 1, 3];
	Styles.buttonStateNum = 3;
	Styles.buttonLabelColors = ["#32556b", "#32cc6b", "#ff0000", "#C0C0C0"];
	Styles.comboBoxItemColors = ["#5e95b6", "#ffffff", "#000000", "#8fa4b1", "#ffffff"];
	Styles.scrollBarMinNum = 15;
	Styles.scrollBarDelayTime = 500;

	class AutoBitmap extends Laya.Graphics {
	    constructor() {
	        super(...arguments);
	        this.autoCacheCmd = true;
	        this._width = 0;
	        this._height = 0;
	        this.uv = null;
	    }
	    destroy() {
	        super.destroy();
	        this._source = null;
	        this._sizeGrid = null;
	        this._offset = null;
	    }
	    get sizeGrid() {
	        return this._sizeGrid;
	    }
	    set sizeGrid(value) {
	        this._sizeGrid = value.map((v) => { return +v; });
	        this._setChanged();
	    }
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
	    _setChanged() {
	        if (!this._isChanged) {
	            this._isChanged = true;
	            Laya.ILaya.timer.callLater(this, this.changeSource);
	        }
	    }
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
	        if (!sizeGrid || (sw === width && sh === height)) {
	            this.clear();
	            this.drawTexture(source, this._offset ? this._offset[0] : 0, this._offset ? this._offset[1] : 0, width, height, null, 1, null, null, this.uv);
	        }
	        else {
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
	        var texture;
	        if (!texture || !texture._getSource()) {
	            texture = Laya.Texture.createFromTexture(tex, x, y, width, height);
	        }
	        return texture;
	    }
	}
	Laya.ClassUtils.regClass("laya.ui.AutoBitmap", AutoBitmap);
	Laya.ClassUtils.regClass("Laya.AutoBitmap", AutoBitmap);

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
	    onReset() {
	        this._top = this._bottom = this._left = this._right = this._centerX = this._centerY = NaN;
	    }
	    _onEnable() {
	        if (this.owner.parent)
	            this._onAdded();
	        else
	            this.owner.once(Laya.Event.ADDED, this, this._onAdded);
	    }
	    _onDisable() {
	        this.owner.off(Laya.Event.ADDED, this, this._onAdded);
	        if (this.owner.parent)
	            this.owner.parent.off(Laya.Event.RESIZE, this, this._onParentResize);
	    }
	    _onAdded() {
	        if (this.owner.parent)
	            this.owner.parent.on(Laya.Event.RESIZE, this, this._onParentResize);
	        this.resetLayoutX();
	        this.resetLayoutY();
	    }
	    _onParentResize() {
	        var flagX = this.resetLayoutX();
	        var flagY = this.resetLayoutY();
	        if (flagX || flagY)
	            this.owner.event(Laya.Event.RESIZE);
	    }
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
	    resetLayout() {
	        if (this.owner) {
	            this.resetLayoutX();
	            this.resetLayoutY();
	        }
	    }
	    get top() {
	        return this._top;
	    }
	    set top(value) {
	        if (this._top != value) {
	            this._top = value;
	            this.resetLayoutY();
	        }
	    }
	    get bottom() {
	        return this._bottom;
	    }
	    set bottom(value) {
	        if (this._bottom != value) {
	            this._bottom = value;
	            this.resetLayoutY();
	        }
	    }
	    get left() {
	        return this._left;
	    }
	    set left(value) {
	        if (this._left != value) {
	            this._left = value;
	            this.resetLayoutX();
	        }
	    }
	    get right() {
	        return this._right;
	    }
	    set right(value) {
	        if (this._right != value) {
	            this._right = value;
	            this.resetLayoutX();
	        }
	    }
	    get centerX() {
	        return this._centerX;
	    }
	    set centerX(value) {
	        if (this._centerX != value) {
	            this._centerX = value;
	            this.resetLayoutX();
	        }
	    }
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
	Widget.EMPTY = null;
	Laya.ILaya.regClass(Widget);
	Widget.EMPTY = new Widget();
	Laya.ClassUtils.regClass("laya.ui.Widget", Widget);
	Laya.ClassUtils.regClass("Laya.Widget", Widget);

	class UIEvent extends Laya.Event {
	}
	UIEvent.SHOW_TIP = "showtip";
	UIEvent.HIDE_TIP = "hidetip";
	Laya.ILaya.regClass(UIEvent);
	Laya.ClassUtils.regClass("laya.ui.UIEvent", UIEvent);
	Laya.ClassUtils.regClass("Laya.UIEvent", UIEvent);

	class UIUtils {
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
	    static toColor(color) {
	        return Laya.Utils.toHexColor(color);
	    }
	    static gray(traget, isGray = true) {
	        if (isGray) {
	            UIUtils.addFilter(traget, UIUtils.grayFilter);
	        }
	        else {
	            UIUtils.clearFilter(traget, Laya.ColorFilter);
	        }
	    }
	    static addFilter(target, filter) {
	        var filters = target.filters || [];
	        filters.push(filter);
	        target.filters = filters;
	    }
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
	    static _getReplaceStr(word) {
	        return UIUtils.escapeSequence[word];
	    }
	    static adptString(str) {
	        return str.replace(/\\(\w)/g, UIUtils._getReplaceStr);
	    }
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
	UIUtils.escapeSequence = { "\\n": "\n", "\\t": "\t" };
	UIUtils._funMap = null;
	Laya.ClassUtils.regClass("laya.ui.UIUtils", UIUtils);
	Laya.ClassUtils.regClass("Laya.UIUtils", UIUtils);

	class UIComponent extends Laya.Sprite {
	    constructor(createChildren = true) {
	        super();
	        this._anchorX = NaN;
	        this._anchorY = NaN;
	        this._widget = Widget.EMPTY;
	        if (createChildren) {
	            this.preinitialize();
	            this.createChildren();
	            this.initialize();
	        }
	    }
	    destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._dataSource = null;
	        this._tag = null;
	        this._toolTip = null;
	    }
	    preinitialize() {
	    }
	    createChildren() {
	    }
	    initialize() {
	    }
	    get width() {
	        return this.get_width();
	    }
	    get_width() {
	        if (this._width)
	            return this._width;
	        return this.measureWidth();
	    }
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
	    commitMeasure() {
	    }
	    get height() {
	        return this.get_height();
	    }
	    get_height() {
	        if (this._height)
	            return this._height;
	        return this.measureHeight();
	    }
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
	    get left() {
	        return this._widget.left;
	    }
	    set left(value) {
	        if (value != this._widget.left) {
	            this._getWidget().left = value;
	        }
	    }
	    get right() {
	        return this._widget.right;
	    }
	    set right(value) {
	        if (value != this._widget.right) {
	            this._getWidget().right = value;
	        }
	    }
	    get centerX() {
	        return this._widget.centerX;
	    }
	    set centerX(value) {
	        if (value != this._widget.centerX) {
	            this._getWidget().centerX = value;
	        }
	    }
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
	    get tag() {
	        return this._tag;
	    }
	    set tag(value) {
	        this._tag = value;
	    }
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
	    onMouseOver(e) {
	        Laya.ILaya.stage.event(UIEvent.SHOW_TIP, this._toolTip);
	    }
	    onMouseOut(e) {
	        Laya.ILaya.stage.event(UIEvent.HIDE_TIP, this._toolTip);
	    }
	    get gray() {
	        return this._gray;
	    }
	    set gray(value) {
	        if (value !== this._gray) {
	            this._gray = value;
	            UIUtils.gray(this, value);
	        }
	    }
	    get disabled() {
	        return this._disabled;
	    }
	    set disabled(value) {
	        if (value !== this._disabled) {
	            this.gray = this._disabled = value;
	            this.mouseEnabled = !value;
	        }
	    }
	    _getWidget() {
	        this._widget === Widget.EMPTY && (this._widget = this.addComponent(Widget));
	        return this._widget;
	    }
	    set scaleX(value) {
	        this.set_scaleX(value);
	    }
	    set_scaleX(value) {
	        if (super.get_scaleX() == value)
	            return;
	        super.set_scaleX(value);
	        this.event(Laya.Event.RESIZE);
	    }
	    get scaleX() {
	        return super.scaleX;
	    }
	    set scaleY(value) {
	        this.set_scaleY(value);
	    }
	    set_scaleY(value) {
	        if (super.get_scaleY() == value)
	            return;
	        super.set_scaleY(value);
	        this.event(Laya.Event.RESIZE);
	    }
	    get scaleY() {
	        return super.scaleY;
	    }
	    onCompResize() {
	        this._sizeChanged();
	    }
	    set width(value) {
	        this.set_width(value);
	    }
	    set_width(value) {
	        if (super.get_width() == value)
	            return;
	        super.set_width(value);
	        this.callLater(this._sizeChanged);
	    }
	    set height(value) {
	        this.set_height(value);
	    }
	    set_height(value) {
	        if (super.get_height() == value)
	            return;
	        super.set_height(value);
	        this.callLater(this._sizeChanged);
	    }
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
	    _childChanged(child = null) {
	        this.callLater(this._sizeChanged);
	        super._childChanged(child);
	    }
	}
	Laya.ILaya.regClass(UIComponent);
	Laya.ClassUtils.regClass("laya.ui.UIComponent", UIComponent);
	Laya.ClassUtils.regClass("Laya.UIComponent", UIComponent);

	class Image extends UIComponent {
	    constructor(skin = null) {
	        super();
	        this.skin = skin;
	    }
	    destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._bitmap && this._bitmap.destroy();
	        this._bitmap = null;
	    }
	    dispose() {
	        this.destroy(true);
	        Laya.ILaya.loader.clearRes(this._skin);
	    }
	    createChildren() {
	        this.graphics = this._bitmap = new AutoBitmap();
	        this._bitmap.autoCacheCmd = false;
	    }
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
	                    Laya.ILaya.loader.load(this._skin, Laya.Handler.create(this, this.setSource, [this._skin]), null, Laya.Loader.IMAGE, 1, true, this._group);
	            }
	            else {
	                this.source = null;
	            }
	        }
	    }
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
	    get group() {
	        return this._group;
	    }
	    set group(value) {
	        if (value && this._skin)
	            Laya.Loader.setGroup(this._skin, value);
	        this._group = value;
	    }
	    setSource(url, img = null) {
	        if (url === this._skin && img) {
	            this.source = img;
	            this.onCompResize();
	        }
	    }
	    measureWidth() {
	        return this._bitmap.width;
	    }
	    measureHeight() {
	        return this._bitmap.height;
	    }
	    set width(value) {
	        super.width = value;
	        this._bitmap.width = value == 0 ? 0.0000001 : value;
	    }
	    get width() {
	        return super.width;
	    }
	    set height(value) {
	        super.height = value;
	        this._bitmap.height = value == 0 ? 0.0000001 : value;
	    }
	    get height() {
	        return super.height;
	    }
	    get sizeGrid() {
	        if (this._bitmap.sizeGrid)
	            return this._bitmap.sizeGrid.join(",");
	        return null;
	    }
	    set sizeGrid(value) {
	        this._bitmap.sizeGrid = UIUtils.fillArray(Styles.defaultSizeGrid, value, Number);
	    }
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

	class AdvImage extends Image {
	    constructor(skin = null) {
	        super();
	        this.advsListArr = [];
	        this.resUrl = "https://unioncdn.layabox.com/config/iconlist.json";
	        this._http = new Laya.Browser.window.XMLHttpRequest();
	        this._data = [];
	        this._resquestTime = 360000;
	        this._playIndex = 0;
	        this._lunboTime = 5000;
	        this.skin = skin;
	        this.setLoadUrl();
	        this.init();
	        this.size(120, 120);
	    }
	    setLoadUrl() {
	    }
	    init() {
	        if (this.isSupportJump()) {
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
	    isSupportJump() {
	        if (Laya.Browser.onMiniGame) {
	            var isSupperJump = window.wx.navigateToMiniProgram instanceof Function;
	            return isSupperJump;
	        }
	        else if (Laya.Browser.onBDMiniGame)
	            return true;
	        return false;
	    }
	    jumptoGame() {
	        var advsObj = this.advsListArr[this._playIndex];
	        var desGameId = parseInt(advsObj.gameid);
	        var extendInfo = advsObj.extendInfo;
	        var path = advsObj.path;
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
	    getCurrentAppidObj() {
	        return this.advsListArr[this._playIndex];
	    }
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
	    static randRange(minNum, maxNum) {
	        return (Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum);
	    }
	    _onError(e) {
	        this.error("Request failed Status:" + this._http.status + " text:" + this._http.statusText);
	    }
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
	    error(message) {
	        this.event(Laya.Event.ERROR, message);
	    }
	    complete() {
	        try {
	            this._data = this._http.response || this._http.responseText;
	            this._data = JSON.parse(this._data);
	            this.advsListArr = this._data.list;
	            this._appid = this._data.appid;
	            this.updateAdvsInfo();
	            this.revertAdvsData();
	        }
	        catch (e) {
	            this.error(e.message);
	        }
	    }
	    getAdvsQArr(data) {
	        var tempArr = [];
	        var gameAdvsObj = Laya.LocalStorage.getJSON("gameObj");
	        for (var key in data) {
	            var tempObj = data[key];
	            if (gameAdvsObj && gameAdvsObj[tempObj.gameid] && !tempObj.isQiangZhi)
	                continue;
	            tempArr.push(tempObj);
	        }
	        return tempArr;
	    }
	    clear() {
	        var http = this._http;
	        http.onerror = http.onabort = http.onprogress = http.onload = null;
	    }
	    destroy(destroyChild = true) {
	        Laya.ILaya.timer.clear(this, this.onLunbo);
	        super.destroy(true);
	        this.clear();
	        Laya.ILaya.timer.clear(this, this.onGetAdvsListData);
	    }
	}
	Laya.ClassUtils.regClass("laya.ui.AdvImage", AdvImage);
	Laya.ClassUtils.regClass("Laya.AdvImage", AdvImage);

	class Box extends UIComponent {
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

	class Button extends UIComponent {
	    constructor(skin = null, label = "") {
	        super();
	        this._labelColors = Styles.buttonLabelColors;
	        this._state = 0;
	        this._autoSize = true;
	        this._stateNum = Styles.buttonStateNum;
	        this._stateChanged = false;
	        this.skin = skin;
	        this.label = label;
	    }
	    destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._bitmap && this._bitmap.destroy();
	        this._text && this._text.destroy(destroyChild);
	        this._bitmap = null;
	        this._text = null;
	        this._clickHandler = null;
	        this._labelColors = this._sources = this._strokeColors = null;
	    }
	    createChildren() {
	        this.graphics = this._bitmap = new AutoBitmap();
	    }
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
	    get skin() {
	        return this._skin;
	    }
	    set skin(value) {
	        if (this._skin != value) {
	            this._skin = value;
	            if (value) {
	                if (!Laya.Loader.getRes(value)) {
	                    Laya.ILaya.loader.load(this._skin, Laya.Handler.create(this, this._skinLoaded), null, Laya.Loader.IMAGE, 1);
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
	    measureWidth() {
	        this.runCallLater(this.changeClips);
	        if (this._autoSize)
	            return this._bitmap.width;
	        this.runCallLater(this.changeState);
	        return this._bitmap.width + (this._text ? this._text.width : 0);
	    }
	    measureHeight() {
	        this.runCallLater(this.changeClips);
	        return this._text ? Math.max(this._bitmap.height, this._text.height) : this._bitmap.height;
	    }
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
	    get state() {
	        return this._state;
	    }
	    set state(value) {
	        if (this._state != value) {
	            this._state = value;
	            this._setStateChanged();
	        }
	    }
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
	    get labelColors() {
	        return this._labelColors.join(",");
	    }
	    set labelColors(value) {
	        this._labelColors = UIUtils.fillArray(Styles.buttonLabelColors, value, String);
	        this._setStateChanged();
	    }
	    get strokeColors() {
	        return this._strokeColors ? this._strokeColors.join(",") : "";
	    }
	    set strokeColors(value) {
	        this._strokeColors = UIUtils.fillArray(Styles.buttonLabelColors, value, String);
	        this._setStateChanged();
	    }
	    get labelPadding() {
	        this.createText();
	        return this._text.padding.join(",");
	    }
	    set labelPadding(value) {
	        this.createText();
	        this._text.padding = UIUtils.fillArray(Styles.labelPadding, value, Number);
	    }
	    get labelSize() {
	        this.createText();
	        return this._text.fontSize;
	    }
	    set labelSize(value) {
	        this.createText();
	        this._text.fontSize = value;
	    }
	    get labelStroke() {
	        this.createText();
	        return this._text.stroke;
	    }
	    set labelStroke(value) {
	        this.createText();
	        this._text.stroke = value;
	    }
	    get labelStrokeColor() {
	        this.createText();
	        return this._text.strokeColor;
	    }
	    set labelStrokeColor(value) {
	        this.createText();
	        this._text.strokeColor = value;
	    }
	    get labelBold() {
	        this.createText();
	        return this._text.bold;
	    }
	    set labelBold(value) {
	        this.createText();
	        this._text.bold = value;
	    }
	    get labelFont() {
	        this.createText();
	        return this._text.font;
	    }
	    set labelFont(value) {
	        this.createText();
	        this._text.font = value;
	    }
	    get labelAlign() {
	        this.createText();
	        return this._text.align;
	    }
	    set labelAlign(value) {
	        this.createText();
	        this._text.align = value;
	    }
	    get clickHandler() {
	        return this._clickHandler;
	    }
	    set clickHandler(value) {
	        this._clickHandler = value;
	    }
	    get text() {
	        this.createText();
	        return this._text;
	    }
	    get sizeGrid() {
	        if (this._bitmap.sizeGrid)
	            return this._bitmap.sizeGrid.join(",");
	        return null;
	    }
	    set sizeGrid(value) {
	        this._bitmap.sizeGrid = UIUtils.fillArray(Styles.defaultSizeGrid, value, Number);
	    }
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
	    get iconOffset() {
	        return this._bitmap._offset ? this._bitmap._offset.join(",") : null;
	    }
	    set iconOffset(value) {
	        if (value)
	            this._bitmap._offset = UIUtils.fillArray([1, 1], value, Number);
	        else
	            this._bitmap._offset = [];
	    }
	    _setStateChanged() {
	        if (!this._stateChanged) {
	            this._stateChanged = true;
	            this.callLater(this.changeState);
	        }
	    }
	}
	Button.stateMap = { "mouseup": 0, "mouseover": 1, "mousedown": 2, "mouseout": 0 };
	Laya.ILaya.regClass(Button);
	Laya.ClassUtils.regClass("laya.ui.Button", Button);
	Laya.ClassUtils.regClass("Laya.Button", Button);

	class CheckBox extends Button {
	    constructor(skin = null, label = "") {
	        super(skin, label);
	        this.toggle = true;
	        this._autoSize = false;
	    }
	    preinitialize() {
	        super.preinitialize();
	        this.toggle = true;
	        this._autoSize = false;
	    }
	    initialize() {
	        super.initialize();
	        this.createText();
	        this._text.align = "left";
	        this._text.valign = "top";
	        this._text.width = 0;
	    }
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

	class Clip extends UIComponent {
	    constructor(url = null, clipX = 1, clipY = 1) {
	        super();
	        this._clipX = 1;
	        this._clipY = 1;
	        this._clipWidth = 0;
	        this._clipHeight = 0;
	        this._interval = 50;
	        this._index = 0;
	        this._toIndex = -1;
	        this._clipX = clipX;
	        this._clipY = clipY;
	        this.skin = url;
	    }
	    destroy(destroyChild = true) {
	        super.destroy(true);
	        this._bitmap && this._bitmap.destroy();
	        this._bitmap = null;
	        this._sources = null;
	    }
	    dispose() {
	        this.destroy(true);
	        Laya.ILaya.loader.clearRes(this._skin);
	    }
	    createChildren() {
	        this.graphics = this._bitmap = new AutoBitmap();
	    }
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
	    get skin() {
	        return this._skin;
	    }
	    set skin(value) {
	        if (this._skin != value) {
	            this._skin = value;
	            if (value) {
	                if (!Laya.Loader.getRes(value)) {
	                    Laya.ILaya.loader.load(this._skin, Laya.Handler.create(this, this._skinLoaded), null, Laya.Loader.IMAGE, 1);
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
	    get clipX() {
	        return this._clipX;
	    }
	    set clipX(value) {
	        this._clipX = value || 1;
	        this._setClipChanged();
	    }
	    get clipY() {
	        return this._clipY;
	    }
	    set clipY(value) {
	        this._clipY = value || 1;
	        this._setClipChanged();
	    }
	    get clipWidth() {
	        return this._clipWidth;
	    }
	    set clipWidth(value) {
	        this._clipWidth = value;
	        this._setClipChanged();
	    }
	    get clipHeight() {
	        return this._clipHeight;
	    }
	    set clipHeight(value) {
	        this._clipHeight = value;
	        this._setClipChanged();
	    }
	    changeClip() {
	        this._clipChanged = false;
	        if (!this._skin)
	            return;
	        var img = Laya.Loader.getRes(this._skin);
	        if (img) {
	            this.loadComplete(this._skin, img);
	        }
	        else {
	            Laya.ILaya.loader.load(this._skin, Laya.Handler.create(this, this.loadComplete, [this._skin]));
	        }
	    }
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
	    get sources() {
	        return this._sources;
	    }
	    set sources(value) {
	        this._sources = value;
	        this.index = this._index;
	        this.event(Laya.Event.LOADED);
	    }
	    get group() {
	        return this._group;
	    }
	    set group(value) {
	        if (value && this._skin)
	            Laya.Loader.setGroup(this._skin, value);
	        this._group = value;
	    }
	    set width(value) {
	        super.width = value;
	        this._bitmap.width = value;
	    }
	    get width() {
	        return super.width;
	    }
	    set height(value) {
	        super.height = value;
	        this._bitmap.height = value;
	    }
	    get height() {
	        return super.height;
	    }
	    measureWidth() {
	        this.runCallLater(this.changeClip);
	        return this._bitmap.width;
	    }
	    measureHeight() {
	        this.runCallLater(this.changeClip);
	        return this._bitmap.height;
	    }
	    get sizeGrid() {
	        if (this._bitmap.sizeGrid)
	            return this._bitmap.sizeGrid.join(",");
	        return null;
	    }
	    set sizeGrid(value) {
	        this._bitmap.sizeGrid = UIUtils.fillArray(Styles.defaultSizeGrid, value, Number);
	    }
	    get index() {
	        return this._index;
	    }
	    set index(value) {
	        this._index = value;
	        this._bitmap && this._sources && (this._bitmap.source = this._sources[value]);
	        this.event(Laya.Event.CHANGE);
	    }
	    get total() {
	        this.runCallLater(this.changeClip);
	        return this._sources ? this._sources.length : 0;
	    }
	    get autoPlay() {
	        return this._autoPlay;
	    }
	    set autoPlay(value) {
	        if (this._autoPlay != value) {
	            this._autoPlay = value;
	            value ? this.play() : this.stop();
	        }
	    }
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
	    get isPlaying() {
	        return this._isPlaying;
	    }
	    set isPlaying(value) {
	        this._isPlaying = value;
	    }
	    play(from = 0, to = -1) {
	        this._isPlaying = true;
	        this.index = from;
	        this._toIndex = to;
	        this._index++;
	        Laya.ILaya.timer.loop(this.interval, this, this._loop);
	        this.on(Laya.Event.DISPLAY, this, this._onDisplay);
	        this.on(Laya.Event.UNDISPLAY, this, this._onDisplay);
	    }
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
	    stop() {
	        this._isPlaying = false;
	        Laya.ILaya.timer.clear(this, this._loop);
	        this.event(Laya.Event.COMPLETE);
	    }
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
	    get bitmap() {
	        return this._bitmap;
	    }
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

	class ColorPicker extends UIComponent {
	    constructor(createChildren = true) {
	        super(false);
	        this._gridSize = 11;
	        this._bgColor = "#ffffff";
	        this._borderColor = "#000000";
	        this._inputColor = "#000000";
	        this._inputBgColor = "#efefef";
	        this._colors = [];
	        this._selectedColor = "#000000";
	        if (createChildren) {
	            this.preinitialize();
	            this.createChildren();
	            this.initialize();
	        }
	    }
	    destroy(destroyChild = true) {
	        Laya.ILaya.stage.off(Laya.Event.MOUSE_DOWN, this, this.removeColorBox);
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
	    createChildren() {
	        this.addChild(this._colorButton = new Button());
	        this._colorPanel = new Box();
	        this._colorPanel.size(230, 166);
	        this._colorPanel.addChild(this._colorTiles = new Laya.Sprite());
	        this._colorPanel.addChild(this._colorBlock = new Laya.Sprite());
	        this._colorPanel.addChild(this._colorInput = new Laya.Input());
	    }
	    initialize() {
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
	    changePanel() {
	        this._panelChanged = false;
	        var g = this._colorPanel.graphics;
	        g.clear(true);
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
	            }
	        }
	    }
	    onColorButtonClick(e) {
	        if (this._colorPanel.parent)
	            this.close();
	        else
	            this.open();
	    }
	    open() {
	        let stage = Laya.ILaya.stage;
	        var p = this.localToGlobal(new Laya.Point());
	        var px = p.x + this._colorPanel.width <= stage.width ? p.x : stage.width - this._colorPanel.width;
	        var py = p.y + this._colorButton.height;
	        py = py + this._colorPanel.height <= stage.height ? py : p.y - this._colorPanel.height;
	        this._colorPanel.pos(px, py);
	        this._colorPanel.zOrder = 1001;
	        stage.addChild(this._colorPanel);
	        stage.on(Laya.Event.MOUSE_DOWN, this, this.removeColorBox);
	    }
	    close() {
	        Laya.ILaya.stage.off(Laya.Event.MOUSE_DOWN, this, this.removeColorBox);
	        this._colorPanel.removeSelf();
	    }
	    removeColorBox(e = null) {
	        this.close();
	    }
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
	    onColorInputChange(e = null) {
	        if (this._colorInput.text)
	            this.drawBlock(this._colorInput.text);
	        else
	            this.drawBlock("#FFFFFF");
	    }
	    onColorTilesClick(e) {
	        this.selectedColor = this.getColorByMouse();
	        this.close();
	    }
	    onColorTilesMouseMove(e) {
	        this._colorInput.focus = false;
	        var color = this.getColorByMouse();
	        this._colorInput.text = color;
	        this.drawBlock(color);
	    }
	    getColorByMouse() {
	        var point = this._colorTiles.getMousePoint();
	        var x = Math.floor(point.x / this._gridSize);
	        var y = Math.floor(point.y / this._gridSize);
	        return this._colors[y * 20 + x];
	    }
	    drawBlock(color) {
	        var g = this._colorBlock.graphics;
	        g.clear(true);
	        var showColor = color ? color : "#ffffff";
	        g.drawRect(0, 0, 50, 20, showColor, this._borderColor);
	        color || g.drawLine(0, 0, 50, 20, "#ff0000");
	    }
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
	    get skin() {
	        return this._colorButton.skin;
	    }
	    set skin(value) {
	        this._colorButton.once(Laya.Event.LOADED, this, this.changeColor);
	        this._colorButton.skin = value;
	    }
	    changeColor() {
	        var g = this.graphics;
	        g.clear(true);
	        var showColor = this._selectedColor || "#000000";
	        g.drawRect(0, 0, this._colorButton.width, this._colorButton.height, showColor);
	    }
	    get bgColor() {
	        return this._bgColor;
	    }
	    set bgColor(value) {
	        this._bgColor = value;
	        this._setPanelChanged();
	    }
	    get borderColor() {
	        return this._borderColor;
	    }
	    set borderColor(value) {
	        this._borderColor = value;
	        this._setPanelChanged();
	    }
	    get inputColor() {
	        return this._inputColor;
	    }
	    set inputColor(value) {
	        this._inputColor = value;
	        this._setPanelChanged();
	    }
	    get inputBgColor() {
	        return this._inputBgColor;
	    }
	    set inputBgColor(value) {
	        this._inputBgColor = value;
	        this._setPanelChanged();
	    }
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

	class Label extends UIComponent {
	    constructor(text = "") {
	        super();
	        this.text = text;
	    }
	    destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._tf = null;
	    }
	    createChildren() {
	        this.addChild(this._tf = new Laya.Text());
	    }
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
	    changeText(text) {
	        this._tf.changeText(text);
	    }
	    get wordWrap() {
	        return this._tf.wordWrap;
	    }
	    set wordWrap(value) {
	        this._tf.wordWrap = value;
	    }
	    get color() {
	        return this._tf.color;
	    }
	    set color(value) {
	        this._tf.color = value;
	    }
	    get font() {
	        return this._tf.font;
	    }
	    set font(value) {
	        this._tf.font = value;
	    }
	    get align() {
	        return this._tf.align;
	    }
	    set align(value) {
	        this._tf.align = value;
	    }
	    get valign() {
	        return this._tf.valign;
	    }
	    set valign(value) {
	        this._tf.valign = value;
	    }
	    get bold() {
	        return this._tf.bold;
	    }
	    set bold(value) {
	        this._tf.bold = value;
	    }
	    get italic() {
	        return this._tf.italic;
	    }
	    set italic(value) {
	        this._tf.italic = value;
	    }
	    get leading() {
	        return this._tf.leading;
	    }
	    set leading(value) {
	        this._tf.leading = value;
	    }
	    get fontSize() {
	        return this._tf.fontSize;
	    }
	    set fontSize(value) {
	        this._tf.fontSize = value;
	    }
	    get padding() {
	        return this._tf.padding.join(",");
	    }
	    set padding(value) {
	        this._tf.padding = UIUtils.fillArray(Styles.labelPadding, value, Number);
	    }
	    get bgColor() {
	        return this._tf.bgColor;
	    }
	    set bgColor(value) {
	        this._tf.bgColor = value;
	    }
	    get borderColor() {
	        return this._tf.borderColor;
	    }
	    set borderColor(value) {
	        this._tf.borderColor = value;
	    }
	    get stroke() {
	        return this._tf.stroke;
	    }
	    set stroke(value) {
	        this._tf.stroke = value;
	    }
	    get strokeColor() {
	        return this._tf.strokeColor;
	    }
	    set strokeColor(value) {
	        this._tf.strokeColor = value;
	    }
	    get textField() {
	        return this._tf;
	    }
	    measureWidth() {
	        return this._tf.width;
	    }
	    measureHeight() {
	        return this._tf.height;
	    }
	    get width() {
	        if (this._width || this._tf.text)
	            return super.width;
	        return 0;
	    }
	    set width(value) {
	        super.width = value;
	        this._tf.width = value;
	    }
	    get height() {
	        if (this._height || this._tf.text)
	            return super.height;
	        return 0;
	    }
	    set height(value) {
	        super.height = value;
	        this._tf.height = value;
	    }
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
	    get overflow() {
	        return this._tf.overflow;
	    }
	    set overflow(value) {
	        this._tf.overflow = value;
	    }
	    get underline() {
	        return this._tf.underline;
	    }
	    set underline(value) {
	        this._tf.underline = value;
	    }
	    get underlineColor() {
	        return this._tf.underlineColor;
	    }
	    set underlineColor(value) {
	        this._tf.underlineColor = value;
	    }
	}
	Laya.ILaya.regClass(Label);
	Laya.ClassUtils.regClass("laya.ui.Label", Label);
	Laya.ClassUtils.regClass("Laya.Label", Label);

	class Slider extends UIComponent {
	    constructor(skin = null) {
	        super();
	        this.isVertical = true;
	        this.showLabel = true;
	        this._max = 100;
	        this._min = 0;
	        this._tick = 1;
	        this._value = 0;
	        if (!Slider.label) {
	            Slider.label = new Label();
	        }
	        this.skin = skin;
	    }
	    destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._bg && this._bg.destroy(destroyChild);
	        this._bar && this._bar.destroy(destroyChild);
	        this._progress && this._progress.destroy(destroyChild);
	        this._bg = null;
	        this._bar = null;
	        this._progress = null;
	        this.changeHandler = null;
	    }
	    createChildren() {
	        this.addChild(this._bg = new Image());
	        this.addChild(this._bar = new Button());
	    }
	    initialize() {
	        this._bar.on(Laya.Event.MOUSE_DOWN, this, this.onBarMouseDown);
	        this._bg.sizeGrid = this._bar.sizeGrid = "4,4,4,4,0";
	        if (this._progress)
	            this._progress.sizeGrid = this._bar.sizeGrid;
	        this.allowClickBack = true;
	    }
	    onBarMouseDown(e) {
	        var Laya$1 = Laya.ILaya;
	        this._globalSacle || (this._globalSacle = new Laya.Point());
	        this._globalSacle.setTo(this.globalScaleX || 0.01, this.globalScaleY || 0.01);
	        this._maxMove = this.isVertical ? (this.height - this._bar.height) : (this.width - this._bar.width);
	        this._tx = Laya$1.stage.mouseX;
	        this._ty = Laya$1.stage.mouseY;
	        Laya$1.stage.on(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
	        Laya$1.stage.once(Laya.Event.MOUSE_UP, this, this.mouseUp);
	        Laya$1.stage.once(Laya.Event.MOUSE_OUT, this, this.mouseUp);
	        this.showValueText();
	    }
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
	    hideValueText() {
	        Slider.label && Slider.label.removeSelf();
	    }
	    mouseUp(e) {
	        let stage = Laya.ILaya.stage;
	        stage.off(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
	        stage.off(Laya.Event.MOUSE_UP, this, this.mouseUp);
	        stage.off(Laya.Event.MOUSE_OUT, this, this.mouseUp);
	        this.sendChangeEvent(Laya.Event.CHANGED);
	        this.hideValueText();
	    }
	    mouseMove(e) {
	        let stage = Laya.ILaya.stage;
	        var oldValue = this._value;
	        if (this.isVertical) {
	            this._bar.y += (stage.mouseY - this._ty) / this._globalSacle.y;
	            if (this._bar._y > this._maxMove)
	                this._bar.y = this._maxMove;
	            else if (this._bar._y < 0)
	                this._bar.y = 0;
	            this._value = this._bar._y / this._maxMove * (this._max - this._min) + this._min;
	            if (this._progress)
	                this._progress.height = this._bar._y + 0.5 * this._bar.height;
	        }
	        else {
	            this._bar.x += (stage.mouseX - this._tx) / this._globalSacle.x;
	            if (this._bar._x > this._maxMove)
	                this._bar.x = this._maxMove;
	            else if (this._bar._x < 0)
	                this._bar.x = 0;
	            this._value = this._bar._x / this._maxMove * (this._max - this._min) + this._min;
	            if (this._progress)
	                this._progress.width = this._bar._x + 0.5 * this._bar.width;
	        }
	        this._tx = stage.mouseX;
	        this._ty = stage.mouseY;
	        if (this._tick != 0) {
	            var pow = Math.pow(10, (this._tick + "").length - 1);
	            this._value = Math.round(Math.round(this._value / this._tick) * this._tick * pow) / pow;
	        }
	        if (this._value != oldValue) {
	            this.sendChangeEvent();
	        }
	        this.showValueText();
	    }
	    sendChangeEvent(type = Laya.Event.CHANGE) {
	        this.event(type);
	        this.changeHandler && this.changeHandler.runWith(this._value);
	    }
	    get skin() {
	        return this._skin;
	    }
	    set skin(value) {
	        if (this._skin != value) {
	            this._skin = value;
	            if (this._skin && !Laya.Loader.getRes(this._skin)) {
	                Laya.ILaya.loader.load([this._skin, this._skin.replace(".png", "$bar.png")], Laya.Handler.create(this, this._skinLoaded));
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
	    setBarPoint() {
	        if (this.isVertical)
	            this._bar.x = Math.round((this._bg.width - this._bar.width) * 0.5);
	        else
	            this._bar.y = Math.round((this._bg.height - this._bar.height) * 0.5);
	    }
	    measureWidth() {
	        return Math.max(this._bg.width, this._bar.width);
	    }
	    measureHeight() {
	        return Math.max(this._bg.height, this._bar.height);
	    }
	    _sizeChanged() {
	        super._sizeChanged();
	        if (this.isVertical)
	            this._bg.height = this.height;
	        else
	            this._bg.width = this.width;
	        this.setBarPoint();
	        this.changeValue();
	    }
	    get sizeGrid() {
	        return this._bg.sizeGrid;
	    }
	    set sizeGrid(value) {
	        this._bg.sizeGrid = value;
	        this._bar.sizeGrid = value;
	        if (this._progress)
	            this._progress.sizeGrid = this._bar.sizeGrid;
	    }
	    setSlider(min, max, value) {
	        this._value = -1;
	        this._min = min;
	        this._max = max > min ? max : min;
	        this.value = value < min ? min : value > max ? max : value;
	    }
	    get tick() {
	        return this._tick;
	    }
	    set tick(value) {
	        if (this._tick != value) {
	            this._tick = value;
	            this.callLater(this.changeValue);
	        }
	    }
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
	    get max() {
	        return this._max;
	    }
	    set max(value) {
	        if (this._max != value) {
	            this._max = value;
	            this.callLater(this.changeValue);
	        }
	    }
	    get min() {
	        return this._min;
	    }
	    set min(value) {
	        if (this._min != value) {
	            this._min = value;
	            this.callLater(this.changeValue);
	        }
	    }
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
	    onBgMouseDown(e) {
	        var point = this._bg.getMousePoint();
	        if (this.isVertical)
	            this.value = point.y / (this.height - this._bar.height) * (this._max - this._min) + this._min;
	        else
	            this.value = point.x / (this.width - this._bar.width) * (this._max - this._min) + this._min;
	    }
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
	    get bar() {
	        return this._bar;
	    }
	}
	Slider.label = null;
	Laya.ILaya.regClass(Slider);
	Laya.ClassUtils.regClass("laya.ui.Slider", Slider);
	Laya.ClassUtils.regClass("Laya.Slider", Slider);

	class ScrollBar extends UIComponent {
	    constructor(skin = null) {
	        super();
	        this.rollRatio = 0.97;
	        this.scaleBar = true;
	        this.autoHide = false;
	        this.elasticDistance = 0;
	        this.elasticBackTime = 500;
	        this._showButtons = UIConfig.showButtons;
	        this._scrollSize = 1;
	        this._thumbPercent = 1;
	        this._lastOffset = 0;
	        this._checkElastic = false;
	        this._isElastic = false;
	        this._hide = false;
	        this._clickOnly = true;
	        this._touchScrollEnable = UIConfig.touchScrollEnable;
	        this._mouseWheelEnable = UIConfig.mouseWheelEnable;
	        this.skin = skin;
	        this.max = 1;
	    }
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
	    createChildren() {
	        this.addChild(this.slider = new Slider());
	        this.addChild(this.upButton = new Button());
	        this.addChild(this.downButton = new Button());
	    }
	    initialize() {
	        this.slider.showLabel = false;
	        this.slider.tick = 0;
	        this.slider.on(Laya.Event.CHANGE, this, this.onSliderChange);
	        this.slider.setSlider(0, 0, 0);
	        this.upButton.on(Laya.Event.MOUSE_DOWN, this, this.onButtonMouseDown);
	        this.downButton.on(Laya.Event.MOUSE_DOWN, this, this.onButtonMouseDown);
	    }
	    onSliderChange() {
	        if (this._value != this.slider.value)
	            this.value = this.slider.value;
	    }
	    onButtonMouseDown(e) {
	        var isUp = e.currentTarget === this.upButton;
	        this.slide(isUp);
	        Laya.ILaya.timer.once(Styles.scrollBarDelayTime, this, this.startLoop, [isUp]);
	        Laya.ILaya.stage.once(Laya.Event.MOUSE_UP, this, this.onStageMouseUp);
	    }
	    startLoop(isUp) {
	        Laya.ILaya.timer.frameLoop(1, this, this.slide, [isUp]);
	    }
	    slide(isUp) {
	        if (isUp)
	            this.value -= this._scrollSize;
	        else
	            this.value += this._scrollSize;
	    }
	    onStageMouseUp(e) {
	        Laya.ILaya.timer.clear(this, this.startLoop);
	        Laya.ILaya.timer.clear(this, this.slide);
	    }
	    get skin() {
	        return this._skin;
	    }
	    set skin(value) {
	        if (value == " ")
	            return;
	        if (this._skin != value) {
	            this._skin = value;
	            if (this._skin && !Laya.Loader.getRes(this._skin)) {
	                Laya.ILaya.loader.load([this._skin, this._skin.replace(".png", "$up.png"), this._skin.replace(".png", "$down.png"), this._skin.replace(".png", "$bar.png")], Laya.Handler.create(this, this._skinLoaded));
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
	    _sizeChanged() {
	        super._sizeChanged();
	        this.repaint();
	        this.resetPositions();
	        this.event(Laya.Event.CHANGE);
	        this.changeHandler && this.changeHandler.runWith(this.value);
	    }
	    resetPositions() {
	        if (this.slider.isVertical)
	            this.slider.height = this.height - (this._showButtons ? (this.upButton.height + this.downButton.height) : 0);
	        else
	            this.slider.width = this.width - (this._showButtons ? (this.upButton.width + this.downButton.width) : 0);
	        this.resetButtonPosition();
	    }
	    resetButtonPosition() {
	        if (this.slider.isVertical)
	            this.downButton.y = this.slider._y + this.slider.height;
	        else
	            this.downButton.x = this.slider._x + this.slider.width;
	    }
	    measureWidth() {
	        if (this.slider.isVertical)
	            return this.slider.width;
	        return 100;
	    }
	    measureHeight() {
	        if (this.slider.isVertical)
	            return 100;
	        return this.slider.height;
	    }
	    setScroll(min, max, value) {
	        this.runCallLater(this._sizeChanged);
	        this.slider.setSlider(min, max, value);
	        this.slider.bar.visible = max > 0;
	        if (!this._hide && this.autoHide)
	            this.visible = false;
	    }
	    get max() {
	        return this.slider.max;
	    }
	    set max(value) {
	        this.slider.max = value;
	    }
	    get min() {
	        return this.slider.min;
	    }
	    set min(value) {
	        this.slider.min = value;
	    }
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
	    get isVertical() {
	        return this.slider.isVertical;
	    }
	    set isVertical(value) {
	        this.slider.isVertical = value;
	    }
	    get sizeGrid() {
	        return this.slider.sizeGrid;
	    }
	    set sizeGrid(value) {
	        this.slider.sizeGrid = value;
	    }
	    get scrollSize() {
	        return this._scrollSize;
	    }
	    set scrollSize(value) {
	        this._scrollSize = value;
	    }
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
	    get hide() {
	        return this._hide;
	    }
	    set hide(value) {
	        this._hide = value;
	        this.visible = !value;
	    }
	    get showButtons() {
	        return this._showButtons;
	    }
	    set showButtons(value) {
	        this._showButtons = value;
	        this.callLater(this.changeScrollBar);
	    }
	    get touchScrollEnable() {
	        return this._touchScrollEnable;
	    }
	    set touchScrollEnable(value) {
	        this._touchScrollEnable = value;
	        this.target = this._target;
	    }
	    get mouseWheelEnable() {
	        return this._mouseWheelEnable;
	    }
	    set mouseWheelEnable(value) {
	        this._mouseWheelEnable = value;
	        this.target = this._target;
	    }
	    onTargetMouseWheel(e) {
	        this.value -= e.delta * this._scrollSize;
	        this.target = this._target;
	    }
	    onTargetMouseDown(e) {
	        if ((this.isLockedFun) && !this.isLockedFun(e))
	            return;
	        this.event(Laya.Event.END);
	        this._clickOnly = true;
	        this._lastOffset = 0;
	        this._checkElastic = false;
	        this._lastPoint || (this._lastPoint = new Laya.Point());
	        this._lastPoint.setTo(Laya.ILaya.stage.mouseX, Laya.ILaya.stage.mouseY);
	        Laya.ILaya.timer.clear(this, this.tweenMove);
	        Laya.Tween.clearTween(this);
	        Laya.ILaya.stage.once(Laya.Event.MOUSE_UP, this, this.onStageMouseUp2);
	        Laya.ILaya.stage.once(Laya.Event.MOUSE_OUT, this, this.onStageMouseUp2);
	        Laya.ILaya.timer.frameLoop(1, this, this.loop);
	    }
	    startDragForce() {
	        this._clickOnly = true;
	        this._lastOffset = 0;
	        this._checkElastic = false;
	        this._lastPoint || (this._lastPoint = new Laya.Point());
	        this._lastPoint.setTo(Laya.ILaya.stage.mouseX, Laya.ILaya.stage.mouseY);
	        Laya.ILaya.timer.clear(this, this.tweenMove);
	        Laya.Tween.clearTween(this);
	        Laya.ILaya.stage.once(Laya.Event.MOUSE_UP, this, this.onStageMouseUp2);
	        Laya.ILaya.stage.once(Laya.Event.MOUSE_OUT, this, this.onStageMouseUp2);
	        Laya.ILaya.timer.frameLoop(1, this, this.loop);
	    }
	    cancelDragOp() {
	        Laya.ILaya.stage.off(Laya.Event.MOUSE_UP, this, this.onStageMouseUp2);
	        Laya.ILaya.stage.off(Laya.Event.MOUSE_OUT, this, this.onStageMouseUp2);
	        Laya.ILaya.timer.clear(this, this.tweenMove);
	        Laya.ILaya.timer.clear(this, this.loop);
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
	        Laya.ILaya.timer.frameLoop(1, this, this.tweenMove, [200]);
	    }
	    loop() {
	        var mouseY = Laya.ILaya.stage.mouseY;
	        var mouseX = Laya.ILaya.stage.mouseX;
	        this._lastOffset = this.isVertical ? (mouseY - this._lastPoint.y) : (mouseX - this._lastPoint.x);
	        if (this._clickOnly) {
	            if (Math.abs(this._lastOffset * (this.isVertical ? Laya.ILaya.stage._canvasTransform.getScaleY() : Laya.ILaya.stage._canvasTransform.getScaleX())) > 1) {
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
	    onStageMouseUp2(e) {
	        Laya.ILaya.stage.off(Laya.Event.MOUSE_UP, this, this.onStageMouseUp2);
	        Laya.ILaya.stage.off(Laya.Event.MOUSE_OUT, this, this.onStageMouseUp2);
	        Laya.ILaya.timer.clear(this, this.loop);
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
	            if (this._offsets.length < 1) {
	                this._offsets[0] = this.isVertical ? Laya.ILaya.stage.mouseY - this._lastPoint.y : Laya.ILaya.stage.mouseX - this._lastPoint.x;
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
	            Laya.ILaya.timer.frameLoop(1, this, this.tweenMove, [dis]);
	        }
	    }
	    elasticOver() {
	        this._isElastic = false;
	        if (!this.hide && this.autoHide) {
	            Laya.Tween.to(this, { alpha: 0 }, 500);
	        }
	        this.event(Laya.Event.END);
	    }
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
	        if (Math.abs(this._lastOffset) < 0.1) {
	            Laya.ILaya.timer.clear(this, this.tweenMove);
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
	    stopScroll() {
	        this.onStageMouseUp2(null);
	        Laya.ILaya.timer.clear(this, this.tweenMove);
	        Laya.Tween.clearTween(this);
	    }
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

	class VScrollBar extends ScrollBar {
	}
	Laya.ILaya.regClass(VScrollBar);
	Laya.ClassUtils.regClass("laya.ui.VScrollBar", VScrollBar);
	Laya.ClassUtils.regClass("Laya.VScrollBar", VScrollBar);

	class HScrollBar extends ScrollBar {
	    initialize() {
	        super.initialize();
	        this.slider.isVertical = false;
	    }
	}
	Laya.ILaya.regClass(HScrollBar);
	Laya.ClassUtils.regClass("laya.ui.HScrollBar", HScrollBar);
	Laya.ClassUtils.regClass("Laya.HScrollBar", HScrollBar);

	class List extends Box {
	    constructor() {
	        super(...arguments);
	        this.selectEnable = false;
	        this.totalPage = 0;
	        this._$componentType = "List";
	        this._repeatX = 0;
	        this._repeatY = 0;
	        this._repeatX2 = 0;
	        this._repeatY2 = 0;
	        this._spaceX = 0;
	        this._spaceY = 0;
	        this._cells = [];
	        this._startIndex = 0;
	        this._selectedIndex = -1;
	        this._page = 0;
	        this._isVertical = true;
	        this._cellSize = 20;
	        this._cellOffset = 0;
	        this._createdLine = 0;
	        this._offset = new Laya.Point();
	        this._usedCache = null;
	        this._elasticEnabled = false;
	        this._preLen = 0;
	    }
	    destroy(destroyChild = true) {
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
	    createChildren() {
	        this.addChild(this._content = new Box());
	    }
	    set cacheAs(value) {
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
	    get content() {
	        return this._content;
	    }
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
	    get itemRender() {
	        return this._itemRender;
	    }
	    set itemRender(value) {
	        if (this._itemRender != value) {
	            this._itemRender = value;
	            for (var i = this._cells.length - 1; i > -1; i--) {
	                this._cells[i].destroy();
	            }
	            this._cells.length = 0;
	            this._setCellChanged();
	        }
	    }
	    set width(value) {
	        if (value != this._width) {
	            super.width = value;
	            this._setCellChanged();
	        }
	    }
	    get width() {
	        return super.width;
	    }
	    set height(value) {
	        if (value != this._height) {
	            super.height = value;
	            this._setCellChanged();
	        }
	    }
	    get height() {
	        return super.height;
	    }
	    get repeatX() {
	        return this._repeatX > 0 ? this._repeatX : this._repeatX2 > 0 ? this._repeatX2 : 1;
	    }
	    set repeatX(value) {
	        this._repeatX = value;
	        this._setCellChanged();
	    }
	    get repeatY() {
	        return this._repeatY > 0 ? this._repeatY : this._repeatY2 > 0 ? this._repeatY2 : 1;
	    }
	    set repeatY(value) {
	        this._repeatY = value;
	        this._setCellChanged();
	    }
	    get spaceX() {
	        return this._spaceX;
	    }
	    set spaceX(value) {
	        this._spaceX = value;
	        this._setCellChanged();
	    }
	    get spaceY() {
	        return this._spaceY;
	    }
	    set spaceY(value) {
	        this._spaceY = value;
	        this._setCellChanged();
	    }
	    changeCells() {
	        this._cellChanged = false;
	        if (this._itemRender) {
	            this.scrollBar = this.getChildByName("scrollBar");
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
	        if (typeof (this._itemRender) == "function") {
	            var box = new this._itemRender();
	        }
	        else {
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
	    addCell(cell) {
	        cell.on(Laya.Event.CLICK, this, this.onCellMouse);
	        cell.on(Laya.Event.RIGHT_CLICK, this, this.onCellMouse);
	        cell.on(Laya.Event.MOUSE_OVER, this, this.onCellMouse);
	        cell.on(Laya.Event.MOUSE_OUT, this, this.onCellMouse);
	        cell.on(Laya.Event.MOUSE_DOWN, this, this.onCellMouse);
	        cell.on(Laya.Event.MOUSE_UP, this, this.onCellMouse);
	        this._cells.push(cell);
	    }
	    _afterInited() {
	        this.initItems();
	    }
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
	    changeCellState(cell, visible, index) {
	        var selectBox = cell.getChildByName("selectBox");
	        if (selectBox) {
	            this.selectEnable = true;
	            selectBox.visible = visible;
	            selectBox.index = index;
	        }
	    }
	    _sizeChanged() {
	        super._sizeChanged();
	        this.setContentSize(this.width, this.height);
	        if (this._scrollBar)
	            this.callLater(this.onScrollBarChange);
	    }
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
	    get selectedIndex() {
	        return this._selectedIndex;
	    }
	    set selectedIndex(value) {
	        if (this._selectedIndex != value) {
	            this._selectedIndex = value;
	            this.changeSelectStatus();
	            this.event(Laya.Event.CHANGE);
	            this.selectHandler && this.selectHandler.runWith(value);
	            this.startIndex = this._startIndex;
	        }
	    }
	    changeSelectStatus() {
	        for (var i = 0, n = this._cells.length; i < n; i++) {
	            this.changeCellState(this._cells[i], this._selectedIndex === this._startIndex + i, 1);
	        }
	    }
	    get selectedItem() {
	        return this._selectedIndex != -1 ? this._array[this._selectedIndex] : null;
	    }
	    set selectedItem(value) {
	        this.selectedIndex = this._array.indexOf(value);
	    }
	    get selection() {
	        return this.getCell(this._selectedIndex);
	    }
	    set selection(value) {
	        this.selectedIndex = this._startIndex + this._cells.indexOf(value);
	    }
	    get startIndex() {
	        return this._startIndex;
	    }
	    set startIndex(value) {
	        this._startIndex = value > 0 ? value : 0;
	        this.callLater(this.renderItems);
	    }
	    renderItems(from = 0, to = 0) {
	        for (var i = from, n = to || this._cells.length; i < n; i++) {
	            this.renderItem(this._cells[i], this._startIndex + i);
	        }
	        this.changeSelectStatus();
	    }
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
	    get array() {
	        return this._array;
	    }
	    set array(value) {
	        this.runCallLater(this.changeCells);
	        this._array = value || [];
	        this._preLen = this._array.length;
	        var length = this._array.length;
	        this.totalPage = Math.ceil(length / (this.repeatX * this.repeatY));
	        this._selectedIndex = this._selectedIndex < length ? this._selectedIndex : length - 1;
	        this.startIndex = this._startIndex;
	        if (this._scrollBar) {
	            this._scrollBar.stopScroll();
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
	    get length() {
	        return this._array ? this._array.length : 0;
	    }
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
	    get cells() {
	        this.runCallLater(this.changeCells);
	        return this._cells;
	    }
	    get elasticEnabled() {
	        return this._elasticEnabled;
	    }
	    set elasticEnabled(value) {
	        this._elasticEnabled = value;
	        if (this._scrollBar) {
	            this._scrollBar.elasticDistance = value ? 200 : 0;
	        }
	    }
	    refresh() {
	        this.array = this._array;
	    }
	    getItem(index) {
	        if (index > -1 && index < this._array.length) {
	            return this._array[index];
	        }
	        return null;
	    }
	    changeItem(index, source) {
	        if (index > -1 && index < this._array.length) {
	            this._array[index] = source;
	            if (index >= this._startIndex && index < this._startIndex + this._cells.length) {
	                this.renderItem(this.getCell(index), index);
	            }
	        }
	    }
	    setItem(index, source) {
	        this.changeItem(index, source);
	    }
	    addItem(souce) {
	        this._array.push(souce);
	        this.array = this._array;
	    }
	    addItemAt(souce, index) {
	        this._array.splice(index, 0, souce);
	        this.array = this._array;
	    }
	    deleteItem(index) {
	        this._array.splice(index, 1);
	        this.array = this._array;
	    }
	    getCell(index) {
	        this.runCallLater(this.changeCells);
	        if (index > -1 && this._cells) {
	            return this._cells[(index - this._startIndex) % this._cells.length];
	        }
	        return null;
	    }
	    scrollTo(index) {
	        if (this._scrollBar) {
	            var numX = this._isVertical ? this.repeatX : this.repeatY;
	            this._scrollBar.value = Math.floor(index / numX) * this._cellSize;
	        }
	        else {
	            this.startIndex = index;
	        }
	    }
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
	    _setCellChanged() {
	        if (!this._cellChanged) {
	            this._cellChanged = true;
	            this.callLater(this.changeCells);
	        }
	    }
	    commitMeasure() {
	        this.runCallLater(this.changeCells);
	    }
	}
	Laya.ILaya.regClass(List);
	Laya.ClassUtils.regClass("laya.ui.List", List);
	Laya.ClassUtils.regClass("Laya.List", List);

	class ComboBox extends UIComponent {
	    constructor(skin = null, labels = null) {
	        super();
	        this._visibleNum = 6;
	        this._itemColors = Styles.comboBoxItemColors;
	        this._itemSize = 12;
	        this._labels = [];
	        this._selectedIndex = -1;
	        this.itemRender = null;
	        this.skin = skin;
	        this.labels = labels;
	    }
	    destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._button && this._button.destroy(destroyChild);
	        this._list && this._list.destroy(destroyChild);
	        this._button = null;
	        this._list = null;
	        this._itemColors = null;
	        this._labels = null;
	        this._selectHandler = null;
	    }
	    createChildren() {
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
	    onListDown(e) {
	        e.stopPropagation();
	    }
	    onScrollBarDown(e) {
	        e.stopPropagation();
	    }
	    onButtonMouseDown(e) {
	        this.callLater(this.switchTo, [!this._isOpen]);
	    }
	    get skin() {
	        return this._button.skin;
	    }
	    set skin(value) {
	        if (this._button.skin != value) {
	            this._button.skin = value;
	            this._listChanged = true;
	        }
	    }
	    measureWidth() {
	        return this._button.width;
	    }
	    measureHeight() {
	        return this._button.height;
	    }
	    changeList() {
	        this._listChanged = false;
	        var labelWidth = this.width - 2;
	        var labelColor = this._itemColors[2];
	        this._itemHeight = this._itemSize + 6;
	        this._list.itemRender = this.itemRender || { type: "Box", child: [{ type: "Label", props: { name: "label", x: 1, padding: "3,3,3,3", width: labelWidth, height: this._itemHeight, fontSize: this._itemSize, color: labelColor } }] };
	        this._list.repeatY = this._visibleNum;
	        this._list.refresh();
	    }
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
	    switchTo(value) {
	        this.isOpen = value;
	    }
	    changeOpen() {
	        this.isOpen = !this._isOpen;
	    }
	    set width(value) {
	        super.width = value;
	        this._button.width = this._width;
	        this._itemChanged = true;
	        this._listChanged = true;
	    }
	    get width() {
	        return super.width;
	    }
	    set height(value) {
	        super.height = value;
	        this._button.height = this._height;
	    }
	    get height() {
	        return super.height;
	    }
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
	    changeItem() {
	        this._itemChanged = false;
	        this._listHeight = this._labels.length > 0 ? Math.min(this._visibleNum, this._labels.length) * this._itemHeight : this._itemHeight;
	        if (!this._isCustomList) {
	            var g = this._list.graphics;
	            g.clear(true);
	            g.drawRect(0, 0, this.width - 1, this._listHeight, this._itemColors[4], this._itemColors[3]);
	        }
	        var a = this._list.array || [];
	        a.length = 0;
	        for (var i = 0, n = this._labels.length; i < n; i++) {
	            a.push({ label: this._labels[i] });
	        }
	        this._list.height = this._listHeight;
	        this._list.array = a;
	    }
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
	    get selectHandler() {
	        return this._selectHandler;
	    }
	    set selectHandler(value) {
	        this._selectHandler = value;
	    }
	    get selectedLabel() {
	        return this._selectedIndex > -1 && this._selectedIndex < this._labels.length ? this._labels[this._selectedIndex] : null;
	    }
	    set selectedLabel(value) {
	        this.selectedIndex = this._labels.indexOf(value);
	    }
	    get visibleNum() {
	        return this._visibleNum;
	    }
	    set visibleNum(value) {
	        this._visibleNum = value;
	        this._listChanged = true;
	    }
	    get itemColors() {
	        return String(this._itemColors);
	    }
	    set itemColors(value) {
	        this._itemColors = UIUtils.fillArray(this._itemColors, value, String);
	        this._listChanged = true;
	    }
	    get itemSize() {
	        return this._itemSize;
	    }
	    set itemSize(value) {
	        this._itemSize = value;
	        this._listChanged = true;
	    }
	    get isOpen() {
	        return this._isOpen;
	    }
	    set isOpen(value) {
	        if (this._isOpen != value) {
	            this._isOpen = value;
	            this._button.selected = this._isOpen;
	            if (this._isOpen) {
	                this._list || this._createList();
	                this._listChanged && !this._isCustomList && this.changeList();
	                this._itemChanged && this.changeItem();
	                var p = this.localToGlobal(Laya.Point.TEMP.setTo(0, 0));
	                var py = p.y + this._button.height;
	                py = py + this._listHeight <= Laya.ILaya.stage.height ? py : p.y - this._listHeight;
	                this._list.pos(p.x, py);
	                this._list.zOrder = 1001;
	                Laya.ILaya.stage.addChild(this._list);
	                Laya.ILaya.stage.once(Laya.Event.MOUSE_DOWN, this, this.removeList);
	                Laya.ILaya.stage.on(Laya.Event.MOUSE_WHEEL, this, this._onStageMouseWheel);
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
	    removeList(e) {
	        Laya.ILaya.stage.off(Laya.Event.MOUSE_DOWN, this, this.removeList);
	        Laya.ILaya.stage.off(Laya.Event.MOUSE_WHEEL, this, this._onStageMouseWheel);
	        this.isOpen = false;
	    }
	    get scrollBarSkin() {
	        return this._scrollBarSkin;
	    }
	    set scrollBarSkin(value) {
	        this._scrollBarSkin = value;
	    }
	    get sizeGrid() {
	        return this._button.sizeGrid;
	    }
	    set sizeGrid(value) {
	        this._button.sizeGrid = value;
	    }
	    get scrollBar() {
	        return this.list.scrollBar;
	    }
	    get button() {
	        return this._button;
	    }
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
	    get labelColors() {
	        return this._button.labelColors;
	    }
	    set labelColors(value) {
	        if (this._button.labelColors != value) {
	            this._button.labelColors = value;
	        }
	    }
	    get labelPadding() {
	        return this._button.text.padding.join(",");
	    }
	    set labelPadding(value) {
	        this._button.text.padding = UIUtils.fillArray(Styles.labelPadding, value, Number);
	    }
	    get labelSize() {
	        return this._button.text.fontSize;
	    }
	    set labelSize(value) {
	        this._button.text.fontSize = value;
	    }
	    get labelBold() {
	        return this._button.text.bold;
	    }
	    set labelBold(value) {
	        this._button.text.bold = value;
	    }
	    get labelFont() {
	        return this._button.text.font;
	    }
	    set labelFont(value) {
	        this._button.text.font = value;
	    }
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

	class ProgressBar extends UIComponent {
	    constructor(skin = null) {
	        super();
	        this._value = 0.5;
	        this.skin = skin;
	    }
	    destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._bg && this._bg.destroy(destroyChild);
	        this._bar && this._bar.destroy(destroyChild);
	        this._bg = this._bar = null;
	        this.changeHandler = null;
	    }
	    createChildren() {
	        this.addChild(this._bg = new Image());
	        this.addChild(this._bar = new Image());
	        this._bar._bitmap.autoCacheCmd = false;
	    }
	    get skin() {
	        return this._skin;
	    }
	    set skin(value) {
	        if (this._skin != value) {
	            this._skin = value;
	            if (this._skin && !Laya.Loader.getRes(this._skin)) {
	                Laya.ILaya.loader.load(this._skin, Laya.Handler.create(this, this._skinLoaded), null, Laya.Loader.IMAGE, 1);
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
	    measureWidth() {
	        return this._bg.width;
	    }
	    measureHeight() {
	        return this._bg.height;
	    }
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
	    get bar() {
	        return this._bar;
	    }
	    get bg() {
	        return this._bg;
	    }
	    get sizeGrid() {
	        return this._bg.sizeGrid;
	    }
	    set sizeGrid(value) {
	        this._bg.sizeGrid = this._bar.sizeGrid = value;
	    }
	    set width(value) {
	        super.width = value;
	        this._bg.width = this._width;
	        this.callLater(this.changeValue);
	    }
	    get width() {
	        return super.width;
	    }
	    set height(value) {
	        super.height = value;
	        this._bg.height = this._height;
	        this._bar.height = this._height;
	    }
	    get height() {
	        return super.height;
	    }
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

	class Radio extends Button {
	    constructor(skin = null, label = "") {
	        super(skin, label);
	        this.toggle = false;
	        this._autoSize = false;
	    }
	    destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._value = null;
	    }
	    preinitialize() {
	        super.preinitialize();
	        this.toggle = false;
	        this._autoSize = false;
	    }
	    initialize() {
	        super.initialize();
	        this.createText();
	        this._text.align = "left";
	        this._text.valign = "top";
	        this._text.width = 0;
	        this.on(Laya.Event.CLICK, this, this.onClick);
	    }
	    onClick(e) {
	        this.selected = true;
	    }
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

	class UIGroup extends Box {
	    constructor(labels = null, skin = null) {
	        super();
	        this._selectedIndex = -1;
	        this._direction = "horizontal";
	        this._space = 0;
	        this.skin = skin;
	        this.labels = labels;
	    }
	    preinitialize() {
	        this.mouseEnabled = true;
	    }
	    destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._items && (this._items.length = 0);
	        this._items = null;
	        this.selectHandler = null;
	    }
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
	    _afterInited() {
	        this.initItems();
	    }
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
	    itemClick(index) {
	        this.selectedIndex = index;
	    }
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
	    setSelect(index, selected) {
	        if (this._items && index > -1 && index < this._items.length)
	            this._items[index].selected = selected;
	    }
	    get skin() {
	        return this._skin;
	    }
	    set skin(value) {
	        if (this._skin != value) {
	            this._skin = value;
	            if (this._skin && !Laya.Loader.getRes(this._skin)) {
	                Laya.ILaya.loader.load(this._skin, Laya.Handler.create(this, this._skinLoaded), null, Laya.Loader.IMAGE, 1);
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
	    createItem(skin, label) {
	        return null;
	    }
	    get labelColors() {
	        return this._labelColors;
	    }
	    set labelColors(value) {
	        if (this._labelColors != value) {
	            this._labelColors = value;
	            this._setLabelChanged();
	        }
	    }
	    get labelStroke() {
	        return this._labelStroke;
	    }
	    set labelStroke(value) {
	        if (this._labelStroke != value) {
	            this._labelStroke = value;
	            this._setLabelChanged();
	        }
	    }
	    get labelStrokeColor() {
	        return this._labelStrokeColor;
	    }
	    set labelStrokeColor(value) {
	        if (this._labelStrokeColor != value) {
	            this._labelStrokeColor = value;
	            this._setLabelChanged();
	        }
	    }
	    get strokeColors() {
	        return this._strokeColors;
	    }
	    set strokeColors(value) {
	        if (this._strokeColors != value) {
	            this._strokeColors = value;
	            this._setLabelChanged();
	        }
	    }
	    get labelSize() {
	        return this._labelSize;
	    }
	    set labelSize(value) {
	        if (this._labelSize != value) {
	            this._labelSize = value;
	            this._setLabelChanged();
	        }
	    }
	    get stateNum() {
	        return this._stateNum;
	    }
	    set stateNum(value) {
	        if (this._stateNum != value) {
	            this._stateNum = value;
	            this._setLabelChanged();
	        }
	    }
	    get labelBold() {
	        return this._labelBold;
	    }
	    set labelBold(value) {
	        if (this._labelBold != value) {
	            this._labelBold = value;
	            this._setLabelChanged();
	        }
	    }
	    get labelFont() {
	        return this._labelFont;
	    }
	    set labelFont(value) {
	        if (this._labelFont != value) {
	            this._labelFont = value;
	            this._setLabelChanged();
	        }
	    }
	    get labelPadding() {
	        return this._labelPadding;
	    }
	    set labelPadding(value) {
	        if (this._labelPadding != value) {
	            this._labelPadding = value;
	            this._setLabelChanged();
	        }
	    }
	    get direction() {
	        return this._direction;
	    }
	    set direction(value) {
	        this._direction = value;
	        this._setLabelChanged();
	    }
	    get space() {
	        return this._space;
	    }
	    set space(value) {
	        this._space = value;
	        this._setLabelChanged();
	    }
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
	    commitMeasure() {
	        this.runCallLater(this.changeLabels);
	    }
	    get items() {
	        return this._items;
	    }
	    get selection() {
	        return this._selectedIndex > -1 && this._selectedIndex < this._items.length ? this._items[this._selectedIndex] : null;
	    }
	    set selection(value) {
	        this.selectedIndex = this._items.indexOf(value);
	    }
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

	class RadioGroup extends UIGroup {
	    createItem(skin, label) {
	        return new Radio(skin, label);
	    }
	}
	Laya.ILaya.regClass(RadioGroup);
	Laya.ClassUtils.regClass("laya.ui.RadioGroup", RadioGroup);
	Laya.ClassUtils.regClass("Laya.RadioGroup", RadioGroup);

	class Tab extends UIGroup {
	    createItem(skin, label) {
	        return new Button(skin, label);
	    }
	}
	Laya.ILaya.regClass(Tab);
	Laya.ClassUtils.regClass("laya.ui.Tab", Tab);
	Laya.ClassUtils.regClass("Laya.Tab", Tab);

	class ViewStack extends Box {
	    constructor() {
	        super(...arguments);
	        this._setIndexHandler = Laya.Handler.create(this, this.setIndex, null, false);
	    }
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
	    addItem(view) {
	        view.name = "item" + this._items.length;
	        this.addChild(view);
	        this.initItems();
	    }
	    _afterInited() {
	        this.initItems();
	    }
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
	    setSelect(index, selected) {
	        if (this._items && index > -1 && index < this._items.length) {
	            this._items[index].visible = selected;
	        }
	    }
	    get selection() {
	        return this._selectedIndex > -1 && this._selectedIndex < this._items.length ? this._items[this._selectedIndex] : null;
	    }
	    set selection(value) {
	        this.selectedIndex = this._items.indexOf(value);
	    }
	    get setIndexHandler() {
	        return this._setIndexHandler;
	    }
	    set setIndexHandler(value) {
	        this._setIndexHandler = value;
	    }
	    setIndex(index) {
	        this.selectedIndex = index;
	    }
	    get items() {
	        return this._items;
	    }
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

	class TextInput extends Label {
	    constructor(text = "") {
	        super();
	        this.text = text;
	        this.skin = this.skin;
	    }
	    preinitialize() {
	        this.mouseEnabled = true;
	    }
	    destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._bg && this._bg.destroy();
	        this._bg = null;
	    }
	    createChildren() {
	        this.addChild(this._tf = new Laya.Input());
	        this._tf.padding = Styles.inputLabelPadding;
	        this._tf.on(Laya.Event.INPUT, this, this._onInput);
	        this._tf.on(Laya.Event.ENTER, this, this._onEnter);
	        this._tf.on(Laya.Event.BLUR, this, this._onBlur);
	        this._tf.on(Laya.Event.FOCUS, this, this._onFocus);
	    }
	    _onFocus() {
	        this.event(Laya.Event.FOCUS, this);
	    }
	    _onBlur() {
	        this.event(Laya.Event.BLUR, this);
	    }
	    _onInput() {
	        this.event(Laya.Event.INPUT, this);
	    }
	    _onEnter() {
	        this.event(Laya.Event.ENTER, this);
	    }
	    initialize() {
	        this.width = 128;
	        this.height = 22;
	    }
	    get bg() {
	        return this._bg;
	    }
	    set bg(value) {
	        this.graphics = this._bg = value;
	    }
	    get skin() {
	        return this._skin;
	    }
	    set skin(value) {
	        if (this._skin != value) {
	            this._skin = value;
	            if (this._skin && !Laya.Loader.getRes(this._skin)) {
	                Laya.ILaya.loader.load(this._skin, Laya.Handler.create(this, this._skinLoaded), null, Laya.Loader.IMAGE, 1);
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
	    get sizeGrid() {
	        return this._bg && this._bg.sizeGrid ? this._bg.sizeGrid.join(",") : null;
	    }
	    set sizeGrid(value) {
	        this._bg || (this.graphics = this._bg = new AutoBitmap());
	        this._bg.sizeGrid = UIUtils.fillArray(Styles.defaultSizeGrid, value, Number);
	    }
	    set text(value) {
	        if (this._tf.text != value) {
	            value = value + "";
	            this._tf.text = value;
	            this.event(Laya.Event.CHANGE);
	        }
	    }
	    get text() {
	        return super.text;
	    }
	    set width(value) {
	        super.width = value;
	        this._bg && (this._bg.width = value);
	    }
	    get width() {
	        return super.width;
	    }
	    set height(value) {
	        super.height = value;
	        this._bg && (this._bg.height = value);
	    }
	    get height() {
	        return super.height;
	    }
	    get multiline() {
	        return this._tf.multiline;
	    }
	    set multiline(value) {
	        this._tf.multiline = value;
	    }
	    set editable(value) {
	        this._tf.editable = value;
	    }
	    get editable() {
	        return this._tf.editable;
	    }
	    select() {
	        this._tf.select();
	    }
	    get restrict() {
	        return this._tf.restrict;
	    }
	    set restrict(pattern) {
	        this._tf.restrict = pattern;
	    }
	    get prompt() {
	        return this._tf.prompt;
	    }
	    set prompt(value) {
	        this._tf.prompt = value;
	    }
	    get promptColor() {
	        return this._tf.promptColor;
	    }
	    set promptColor(value) {
	        this._tf.promptColor = value;
	    }
	    get maxChars() {
	        return this._tf.maxChars;
	    }
	    set maxChars(value) {
	        this._tf.maxChars = value;
	    }
	    get focus() {
	        return this._tf.focus;
	    }
	    set focus(value) {
	        this._tf.focus = value;
	    }
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

	class TextArea extends TextInput {
	    constructor(text = "") {
	        super(text);
	        this.on(Laya.Event.CHANGE, this, this._onTextChange);
	    }
	    _onTextChange() {
	        this.callLater(this.changeScroll);
	    }
	    destroy(destroyChild = true) {
	        this._vScrollBar && this._vScrollBar.destroy();
	        this._hScrollBar && this._hScrollBar.destroy();
	        this._vScrollBar = null;
	        this._hScrollBar = null;
	        super.destroy(destroyChild);
	    }
	    initialize() {
	        this.width = 180;
	        this.height = 150;
	        this._tf.wordWrap = true;
	        this.multiline = true;
	    }
	    set width(value) {
	        super.width = value;
	        this.callLater(this.changeScroll);
	    }
	    get width() {
	        return super.width;
	    }
	    set height(value) {
	        super.height = value;
	        this.callLater(this.changeScroll);
	    }
	    get height() {
	        return super.height;
	    }
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
	    get vScrollBar() {
	        return this._vScrollBar;
	    }
	    get hScrollBar() {
	        return this._hScrollBar;
	    }
	    get maxScrollY() {
	        return this._tf.maxScrollY;
	    }
	    get scrollY() {
	        return this._tf.scrollY;
	    }
	    get maxScrollX() {
	        return this._tf.maxScrollX;
	    }
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
	    scrollTo(y) {
	        this.commitMeasure();
	        this._tf.scrollY = y;
	    }
	}
	Laya.ILaya.regClass(TextArea);
	Laya.ClassUtils.regClass("laya.ui.TextArea", TextArea);
	Laya.ClassUtils.regClass("Laya.TextArea", TextArea);

	class ScaleBox extends Box {
	    constructor() {
	        super(...arguments);
	        this._oldW = 0;
	        this._oldH = 0;
	    }
	    onEnable() {
	        Laya.ILaya.stage.on("resize", this, this.onResize);
	        this.onResize();
	    }
	    onDisable() {
	        Laya.ILaya.stage.off("resize", this, this.onResize);
	    }
	    onResize() {
	        let stage = Laya.ILaya.stage;
	        if (this.width > 0 && this.height > 0) {
	            var scale = Math.min(stage.width / this._oldW, stage.height / this._oldH);
	            super.width = stage.width;
	            super.height = stage.height;
	            this.scale(scale, scale);
	        }
	    }
	    set width(value) {
	        super.width = value;
	        this._oldW = value;
	    }
	    get width() {
	        return super.width;
	    }
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

	class HSlider extends Slider {
	    constructor(skin = null) {
	        super(skin);
	        this.isVertical = false;
	    }
	}
	Laya.ILaya.regClass(HSlider);
	Laya.ClassUtils.regClass("laya.ui.HSlider", HSlider);
	Laya.ClassUtils.regClass("Laya.HSlider", HSlider);

	class Panel extends Box {
	    constructor() {
	        super();
	        this._usedCache = null;
	        this._elasticEnabled = false;
	        this.width = this.height = 100;
	    }
	    destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._content && this._content.destroy(destroyChild);
	        this._vScrollBar && this._vScrollBar.destroy(destroyChild);
	        this._hScrollBar && this._hScrollBar.destroy(destroyChild);
	        this._vScrollBar = null;
	        this._hScrollBar = null;
	        this._content = null;
	    }
	    destroyChildren() {
	        this._content.destroyChildren();
	    }
	    createChildren() {
	        super.addChild(this._content = new Box());
	    }
	    addChild(child) {
	        child.on(Laya.Event.RESIZE, this, this.onResize);
	        this._setScrollChanged();
	        return this._content.addChild(child);
	    }
	    onResize() {
	        this._setScrollChanged();
	    }
	    addChildAt(child, index) {
	        child.on(Laya.Event.RESIZE, this, this.onResize);
	        this._setScrollChanged();
	        return this._content.addChildAt(child, index);
	    }
	    removeChild(child) {
	        child.off(Laya.Event.RESIZE, this, this.onResize);
	        this._setScrollChanged();
	        return this._content.removeChild(child);
	    }
	    removeChildAt(index) {
	        this.getChildAt(index).off(Laya.Event.RESIZE, this, this.onResize);
	        this._setScrollChanged();
	        return this._content.removeChildAt(index);
	    }
	    removeChildren(beginIndex = 0, endIndex = 0x7fffffff) {
	        this._content.removeChildren(beginIndex, endIndex);
	        this._setScrollChanged();
	        return this;
	    }
	    getChildAt(index) {
	        return this._content.getChildAt(index);
	    }
	    getChildByName(name) {
	        return this._content.getChildByName(name);
	    }
	    getChildIndex(child) {
	        return this._content.getChildIndex(child);
	    }
	    get numChildren() {
	        return this._content.numChildren;
	    }
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
	    _sizeChanged() {
	        super._sizeChanged();
	        this.setContentSize(this._width, this._height);
	    }
	    get contentWidth() {
	        var max = 0;
	        for (var i = this._content.numChildren - 1; i > -1; i--) {
	            var comp = this._content.getChildAt(i);
	            max = Math.max(comp._x + comp.width * comp.scaleX - comp.pivotX, max);
	        }
	        return max;
	    }
	    get contentHeight() {
	        var max = 0;
	        for (var i = this._content.numChildren - 1; i > -1; i--) {
	            var comp = this._content.getChildAt(i);
	            max = Math.max(comp._y + comp.height * comp.scaleY - comp.pivotY, max);
	        }
	        return max;
	    }
	    setContentSize(width, height) {
	        var content = this._content;
	        content.width = width;
	        content.height = height;
	        content._style.scrollRect || (content.scrollRect = Laya.Rectangle.create());
	        content._style.scrollRect.setTo(0, 0, width, height);
	        content.scrollRect = content.scrollRect;
	    }
	    set width(value) {
	        super.width = value;
	        this._setScrollChanged();
	    }
	    get width() {
	        return super.width;
	    }
	    set height(value) {
	        super.height = value;
	        this._setScrollChanged();
	    }
	    get height() {
	        return super.height;
	    }
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
	    get vScrollBar() {
	        return this._vScrollBar;
	    }
	    get hScrollBar() {
	        return this._hScrollBar;
	    }
	    get content() {
	        return this._content;
	    }
	    onScrollBarChange(scrollBar) {
	        var rect = this._content._style.scrollRect;
	        if (rect) {
	            var start = Math.round(scrollBar.value);
	            scrollBar.isVertical ? rect.y = start : rect.x = start;
	            this._content.scrollRect = rect;
	        }
	    }
	    scrollTo(x = 0, y = 0) {
	        if (this.vScrollBar)
	            this.vScrollBar.value = y;
	        if (this.hScrollBar)
	            this.hScrollBar.value = x;
	    }
	    refresh() {
	        this.changeScroll();
	    }
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

	class VSlider extends Slider {
	}
	Laya.ILaya.regClass(VSlider);
	Laya.ClassUtils.regClass("laya.ui.VSlider", VSlider);
	Laya.ClassUtils.regClass("Laya.VSlider", VSlider);

	class Tree extends Box {
	    constructor() {
	        super();
	        this._spaceLeft = 10;
	        this._spaceBottom = 0;
	        this._keepStatus = true;
	        this.width = this.height = 200;
	    }
	    destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._list && this._list.destroy(destroyChild);
	        this._list = null;
	        this._source = null;
	        this._renderHandler = null;
	    }
	    createChildren() {
	        this.addChild(this._list = new List());
	        this._list.renderHandler = Laya.Handler.create(this, this.renderItem, null, false);
	        this._list.repeatX = 1;
	        this._list.on(Laya.Event.CHANGE, this, this.onListChange);
	    }
	    onListChange(e = null) {
	        this.event(Laya.Event.CHANGE);
	    }
	    get keepStatus() {
	        return this._keepStatus;
	    }
	    set keepStatus(value) {
	        this._keepStatus = value;
	    }
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
	    get source() {
	        return this._source;
	    }
	    get list() {
	        return this._list;
	    }
	    get itemRender() {
	        return this._list.itemRender;
	    }
	    set itemRender(value) {
	        this._list.itemRender = value;
	    }
	    get scrollBarSkin() {
	        return this._list.vScrollBarSkin;
	    }
	    set scrollBarSkin(value) {
	        this._list.vScrollBarSkin = value;
	    }
	    get scrollBar() {
	        return this._list.scrollBar;
	    }
	    get mouseHandler() {
	        return this._list.mouseHandler;
	    }
	    set mouseHandler(value) {
	        this._list.mouseHandler = value;
	    }
	    get renderHandler() {
	        return this._renderHandler;
	    }
	    set renderHandler(value) {
	        this._renderHandler = value;
	    }
	    get spaceLeft() {
	        return this._spaceLeft;
	    }
	    set spaceLeft(value) {
	        this._spaceLeft = value;
	    }
	    get spaceBottom() {
	        return this._list.spaceY;
	    }
	    set spaceBottom(value) {
	        this._list.spaceY = value;
	    }
	    get selectedIndex() {
	        return this._list.selectedIndex;
	    }
	    set selectedIndex(value) {
	        this._list.selectedIndex = value;
	    }
	    get selectedItem() {
	        return this._list.selectedItem;
	    }
	    set selectedItem(value) {
	        this._list.selectedItem = value;
	    }
	    set width(value) {
	        super.width = value;
	        this._list.width = value;
	    }
	    get width() {
	        return super.width;
	    }
	    set height(value) {
	        super.height = value;
	        this._list.height = value;
	    }
	    get height() {
	        return super.height;
	    }
	    getArray() {
	        var arr = [];
	        for (let key in this._source) {
	            let item = this._source[key];
	            if (this.getParentOpenStatus(item)) {
	                item.x = this._spaceLeft * this.getDepth(item);
	                arr.push(item);
	            }
	        }
	        return arr;
	    }
	    getDepth(item, num = 0) {
	        if (item.nodeParent == null)
	            return num;
	        else
	            return this.getDepth(item.nodeParent, num + 1);
	    }
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
	    onArrowClick(e) {
	        var arrow = e.currentTarget;
	        var index = arrow.tag;
	        this._list.array[index].isOpen = !this._list.array[index].isOpen;
	        this.event(Laya.Event.OPEN);
	        this._list.array = this.getArray();
	    }
	    setItemState(index, isOpen) {
	        if (!this._list.array[index])
	            return;
	        this._list.array[index].isOpen = isOpen;
	        this._list.array = this.getArray();
	    }
	    fresh() {
	        this._list.array = this.getArray();
	        this.repaint();
	    }
	    set dataSource(value) {
	        this._dataSource = value;
	        super.dataSource = value;
	    }
	    get dataSource() {
	        return super.dataSource;
	    }
	    set xml(value) {
	        var arr = [];
	        this.parseXml(value.childNodes[0], arr, null, true);
	        this.array = arr;
	    }
	    parseXml(xml, source, nodeParent, isRoot) {
	        var obj;
	        var list = xml.childNodes;
	        var childCount = list.length;
	        if (!isRoot) {
	            obj = {};
	            var list2 = xml.attributes;
	            for (let key in list2) {
	                var attrs = list2[key];
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
	    get selectedPath() {
	        if (this._list.selectedItem) {
	            return this._list.selectedItem.path;
	        }
	        return null;
	    }
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

	class LayoutBox extends Box {
	    constructor() {
	        super(...arguments);
	        this._space = 0;
	        this._align = "none";
	        this._itemChanged = false;
	    }
	    addChild(child) {
	        child.on(Laya.Event.RESIZE, this, this.onResize);
	        this._setItemChanged();
	        return super.addChild(child);
	    }
	    onResize(e) {
	        this._setItemChanged();
	    }
	    addChildAt(child, index) {
	        child.on(Laya.Event.RESIZE, this, this.onResize);
	        this._setItemChanged();
	        return super.addChildAt(child, index);
	    }
	    removeChildAt(index) {
	        this.getChildAt(index).off(Laya.Event.RESIZE, this, this.onResize);
	        this._setItemChanged();
	        return super.removeChildAt(index);
	    }
	    refresh() {
	        this._setItemChanged();
	    }
	    changeItems() {
	        this._itemChanged = false;
	    }
	    get space() {
	        return this._space;
	    }
	    set space(value) {
	        this._space = value;
	        this._setItemChanged();
	    }
	    get align() {
	        return this._align;
	    }
	    set align(value) {
	        this._align = value;
	        this._setItemChanged();
	    }
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

	class HBox extends LayoutBox {
	    sortItem(items) {
	        if (items)
	            items.sort(function (a, b) { return a.x - b.x; });
	    }
	    set height(value) {
	        if (this._height != value) {
	            super.height = value;
	            this.callLater(this.changeItems);
	        }
	    }
	    get height() {
	        return super.height;
	    }
	    changeItems() {
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
	HBox.NONE = "none";
	HBox.TOP = "top";
	HBox.MIDDLE = "middle";
	HBox.BOTTOM = "bottom";
	Laya.ILaya.regClass(HBox);
	Laya.ClassUtils.regClass("laya.ui.HBox", HBox);
	Laya.ClassUtils.regClass("Laya.HBox", HBox);

	class VBox extends LayoutBox {
	    set width(value) {
	        if (this._width != value) {
	            super.width = value;
	            this.callLater(this.changeItems);
	        }
	    }
	    get width() {
	        return super.width;
	    }
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
	VBox.NONE = "none";
	VBox.LEFT = "left";
	VBox.CENTER = "center";
	VBox.RIGHT = "right";
	Laya.ILaya.regClass(VBox);
	Laya.ClassUtils.regClass("laya.ui.VBox", VBox);
	Laya.ClassUtils.regClass("Laya.VBox", VBox);

	class FontClip extends Clip {
	    constructor(skin = null, sheet = null) {
	        super();
	        this._valueArr = '';
	        this._indexMap = null;
	        this._sheet = null;
	        this._direction = "horizontal";
	        this._spaceX = 0;
	        this._spaceY = 0;
	        this._align = "left";
	        this._wordsW = 0;
	        this._wordsH = 0;
	        if (skin)
	            this.skin = skin;
	        if (sheet)
	            this.sheet = sheet;
	    }
	    createChildren() {
	        this._bitmap = new AutoBitmap();
	        this.on(Laya.Event.LOADED, this, this._onClipLoaded);
	    }
	    _onClipLoaded() {
	        this.callLater(this.changeValue);
	    }
	    get sheet() {
	        return this._sheet;
	    }
	    set sheet(value) {
	        value += "";
	        this._sheet = value;
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
	    get direction() {
	        return this._direction;
	    }
	    set direction(value) {
	        this._direction = value;
	        this.callLater(this.changeValue);
	    }
	    get spaceX() {
	        return this._spaceX;
	    }
	    set spaceX(value) {
	        this._spaceX = value;
	        if (this._direction === "horizontal")
	            this.callLater(this.changeValue);
	    }
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
	    get align() {
	        return this._align;
	    }
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
	    set width(value) {
	        super.width = value;
	        this.callLater(this.changeValue);
	    }
	    get width() {
	        return super.width;
	    }
	    set height(value) {
	        super.height = value;
	        this.callLater(this.changeValue);
	    }
	    get height() {
	        return super.height;
	    }
	    measureWidth() {
	        return this._wordsW;
	    }
	    measureHeight() {
	        return this._wordsH;
	    }
	    destroy(destroyChild = true) {
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

	class View extends Laya.Scene {
	    constructor() {
	        super(false);
	        this._watchMap = {};
	        this._anchorX = NaN;
	        this._anchorY = NaN;
	        this._widget = Widget.EMPTY;
	        this.createChildren();
	    }
	    static __init__() {
	        Laya.ILaya.ClassUtils.regShortClassName([ViewStack, Button, TextArea, ColorPicker, Box, ScaleBox, CheckBox, Clip, ComboBox, UIComponent,
	            HScrollBar, HSlider, Image, Label, List, Panel, ProgressBar, Radio, RadioGroup, ScrollBar, Slider, Tab, TextInput, View,
	            VScrollBar, VSlider, Tree, HBox, VBox, Laya.Animation, Laya.Text, FontClip]);
	    }
	    static regComponent(key, compClass) {
	        Laya.ILaya.ClassUtils.regClass(key, compClass);
	    }
	    static regViewRuntime(key, compClass) {
	        Laya.ILaya.ClassUtils.regClass(key, compClass);
	    }
	    static regUI(url, json) {
	        Laya.ILaya.loader.cacheRes(url, json);
	    }
	    destroy(destroyChild = true) {
	        this._watchMap = null;
	        super.destroy(destroyChild);
	    }
	    changeData(key) {
	        var arr = this._watchMap[key];
	        if (!arr)
	            return;
	        for (var i = 0, n = arr.length; i < n; i++) {
	            var watcher = arr[i];
	            watcher.exe(this);
	        }
	    }
	    get top() {
	        return this._widget.top;
	    }
	    set top(value) {
	        if (value != this._widget.top) {
	            this._getWidget().top = value;
	        }
	    }
	    get bottom() {
	        return this._widget.bottom;
	    }
	    set bottom(value) {
	        if (value != this._widget.bottom) {
	            this._getWidget().bottom = value;
	        }
	    }
	    get left() {
	        return this._widget.left;
	    }
	    set left(value) {
	        if (value != this._widget.left) {
	            this._getWidget().left = value;
	        }
	    }
	    get right() {
	        return this._widget.right;
	    }
	    set right(value) {
	        if (value != this._widget.right) {
	            this._getWidget().right = value;
	        }
	    }
	    get centerX() {
	        return this._widget.centerX;
	    }
	    set centerX(value) {
	        if (value != this._widget.centerX) {
	            this._getWidget().centerX = value;
	        }
	    }
	    get centerY() {
	        return this._widget.centerY;
	    }
	    set centerY(value) {
	        if (value != this._widget.centerY) {
	            this._getWidget().centerY = value;
	        }
	    }
	    get anchorX() {
	        return this._anchorX;
	    }
	    set anchorX(value) {
	        if (this._anchorX != value) {
	            this._anchorX = value;
	            this.callLater(this._sizeChanged);
	        }
	    }
	    get anchorY() {
	        return this._anchorY;
	    }
	    set anchorY(value) {
	        if (this._anchorY != value) {
	            this._anchorY = value;
	            this.callLater(this._sizeChanged);
	        }
	    }
	    _sizeChanged() {
	        if (!isNaN(this._anchorX))
	            this.pivotX = this.anchorX * this.width;
	        if (!isNaN(this._anchorY))
	            this.pivotY = this.anchorY * this.height;
	        this.event(Laya.Event.RESIZE);
	    }
	    _getWidget() {
	        this._widget === Widget.EMPTY && (this._widget = this.addComponent(Widget));
	        return this._widget;
	    }
	    loadUI(path) {
	        var uiView = View.uiMap[path];
	        View.uiMap && this.createView(uiView);
	    }
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
	View.uiMap = {};
	Laya.ILaya.regClass(View);
	Laya.ClassUtils.regClass("laya.ui.View", View);
	Laya.ClassUtils.regClass("Laya.View", View);

	class IUI {
	}
	IUI.Dialog = null;

	class DialogManager extends Laya.Sprite {
	    constructor() {
	        super();
	        this.maskLayer = new Laya.Sprite();
	        this.popupEffect = (dialog) => {
	            dialog.scale(1, 1);
	            dialog._effectTween = Laya.Tween.from(dialog, { x: Laya.ILaya.stage.width / 2, y: Laya.ILaya.stage.height / 2, scaleX: 0, scaleY: 0 }, 300, Laya.Ease.backOut, Laya.Handler.create(this, this.doOpen, [dialog]), 0, false, false);
	        };
	        this.closeEffect = (dialog) => {
	            dialog._effectTween = Laya.Tween.to(dialog, { x: Laya.ILaya.stage.width / 2, y: Laya.ILaya.stage.height / 2, scaleX: 0, scaleY: 0 }, 300, Laya.Ease.strongOut, Laya.Handler.create(this, this.doClose, [dialog]), 0, false, false);
	        };
	        this.popupEffectHandler = new Laya.Handler(this, this.popupEffect);
	        this.closeEffectHandler = new Laya.Handler(this, this.closeEffect);
	        this.mouseEnabled = this.maskLayer.mouseEnabled = true;
	        this.zOrder = 1000;
	        Laya.ILaya.stage.addChild(this);
	        Laya.ILaya.stage.on(Laya.Event.RESIZE, this, this._onResize);
	        if (UIConfig.closeDialogOnSide)
	            this.maskLayer.on("click", this, this._closeOnSide);
	        this._onResize(null);
	    }
	    _closeOnSide() {
	        var dialog = this.getChildAt(this.numChildren - 1);
	        if (dialog instanceof IUI.Dialog)
	            dialog.close();
	    }
	    setLockView(value) {
	        if (!this.lockLayer) {
	            this.lockLayer = new Box();
	            this.lockLayer.mouseEnabled = true;
	            this.lockLayer.size(Laya.ILaya.stage.width, Laya.ILaya.stage.height);
	        }
	        this.lockLayer.removeChildren();
	        if (value) {
	            value.centerX = value.centerY = 0;
	            this.lockLayer.addChild(value);
	        }
	    }
	    _onResize(e = null) {
	        var width = this.maskLayer.width = Laya.ILaya.stage.width;
	        var height = this.maskLayer.height = Laya.ILaya.stage.height;
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
	        dialog.x = Math.round(((Laya.ILaya.stage.width - dialog.width) >> 1) + dialog.pivotX);
	        dialog.y = Math.round(((Laya.ILaya.stage.height - dialog.height) >> 1) + dialog.pivotY);
	    }
	    open(dialog, closeOther = false, showEffect = false) {
	        if (closeOther)
	            this._closeAll();
	        this._clearDialogEffect(dialog);
	        if (dialog.isPopupCenter)
	            this._centerDialog(dialog);
	        this.addChild(dialog);
	        if (dialog.isModal || this._getBit(Laya.Const.HAS_ZORDER))
	            Laya.ILaya.timer.callLater(this, this._checkMask);
	        if (showEffect && dialog.popupEffect != null)
	            dialog.popupEffect.runWith(dialog);
	        else
	            this.doOpen(dialog);
	        this.event(Laya.Event.OPEN);
	    }
	    _clearDialogEffect(dialog) {
	        if (dialog._effectTween) {
	            Laya.Tween.clear(dialog._effectTween);
	            dialog._effectTween = null;
	        }
	    }
	    doOpen(dialog) {
	        dialog.onOpened(dialog._param);
	    }
	    lock(value) {
	        if (this.lockLayer) {
	            if (value)
	                this.addChild(this.lockLayer);
	            else
	                this.lockLayer.removeSelf();
	        }
	    }
	    close(dialog) {
	        this._clearDialogEffect(dialog);
	        if (dialog.isShowEffect && dialog.closeEffect != null)
	            dialog.closeEffect.runWith([dialog]);
	        else
	            this.doClose(dialog);
	        this.event(Laya.Event.CLOSE);
	    }
	    doClose(dialog) {
	        dialog.removeSelf();
	        dialog.isModal && this._checkMask();
	        dialog.closeHandler && dialog.closeHandler.runWith(dialog.closeType);
	        dialog.onClosed(dialog.closeType);
	        if (dialog.autoDestroyAtClosed)
	            dialog.destroy();
	    }
	    closeAll() {
	        this._closeAll();
	        this.event(Laya.Event.CLOSE);
	    }
	    _closeAll() {
	        for (var i = this.numChildren - 1; i > -1; i--) {
	            var item = this.getChildAt(i);
	            if (item && item.close != null) {
	                this.doClose(item);
	            }
	        }
	    }
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
	    _checkMask() {
	        this.maskLayer.removeSelf();
	        for (var i = this.numChildren - 1; i > -1; i--) {
	            var dialog = this.getChildAt(i);
	            if (dialog && dialog.isModal) {
	                this.addChildAt(this.maskLayer, i);
	                return;
	            }
	        }
	    }
	}
	Laya.ClassUtils.regClass("laya.ui.DialogManager", DialogManager);
	Laya.ClassUtils.regClass("Laya.DialogManager", DialogManager);

	class Dialog extends View {
	    constructor() {
	        super();
	        this.isShowEffect = true;
	        this.isPopupCenter = true;
	        this.popupEffect = Dialog.manager.popupEffectHandler;
	        this.closeEffect = Dialog.manager.closeEffectHandler;
	        this._dealDragArea();
	        this.on(Laya.Event.CLICK, this, this._onClick);
	    }
	    static get manager() {
	        return Dialog._manager = Dialog._manager || new DialogManager();
	    }
	    static set manager(value) {
	        Dialog._manager = value;
	    }
	    _dealDragArea() {
	        var dragTarget = this.getChildByName("drag");
	        if (dragTarget) {
	            this.dragArea = dragTarget._x + "," + dragTarget._y + "," + dragTarget.width + "," + dragTarget.height;
	            dragTarget.removeSelf();
	        }
	    }
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
	    _onMouseDown(e) {
	        var point = this.getMousePoint();
	        if (this._dragArea.contains(point.x, point.y))
	            this.startDrag();
	        else
	            this.stopDrag();
	    }
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
	    open(closeOther = true, param = null) {
	        this._dealDragArea();
	        this._param = param;
	        Dialog.manager.open(this, closeOther, this.isShowEffect);
	        Dialog.manager.lock(false);
	    }
	    close(type = null) {
	        this.closeType = type;
	        Dialog.manager.close(this);
	    }
	    destroy(destroyChild = true) {
	        this.closeHandler = null;
	        this.popupEffect = null;
	        this.closeEffect = null;
	        this._dragArea = null;
	        super.destroy(destroyChild);
	    }
	    show(closeOther = false, showEffect = true) {
	        this._open(false, closeOther, showEffect);
	    }
	    popup(closeOther = false, showEffect = true) {
	        this._open(true, closeOther, showEffect);
	    }
	    _open(modal, closeOther, showEffect) {
	        this.isModal = modal;
	        this.isShowEffect = showEffect;
	        Dialog.manager.lock(true);
	        this.open(closeOther);
	    }
	    get isPopup() {
	        return this.parent != null;
	    }
	    set zOrder(value) {
	        super.zOrder = value;
	        Dialog.manager._checkMask();
	    }
	    get zOrder() {
	        return super.zOrder;
	    }
	    static setLockView(view) {
	        Dialog.manager.setLockView(view);
	    }
	    static lock(value) {
	        Dialog.manager.lock(value);
	    }
	    static closeAll() {
	        Dialog.manager.closeAll();
	    }
	    static getDialogsByGroup(group) {
	        return Dialog.manager.getDialogsByGroup(group);
	    }
	    static closeByGroup(group) {
	        return Dialog.manager.closeByGroup(group);
	    }
	}
	Dialog.CLOSE = "close";
	Dialog.CANCEL = "cancel";
	Dialog.SURE = "sure";
	Dialog.NO = "no";
	Dialog.YES = "yes";
	Dialog.OK = "ok";
	IUI.Dialog = Dialog;
	Laya.ILaya.regClass(Dialog);
	Laya.ClassUtils.regClass("laya.ui.Dialog", Dialog);
	Laya.ClassUtils.regClass("Laya.Dialog", Dialog);

	class TipManager extends UIComponent {
	    constructor() {
	        super();
	        this._tipBox = new UIComponent();
	        this._tipBox.addChild(this._tipText = new Laya.Text());
	        this._tipText.x = this._tipText.y = 5;
	        this._tipText.color = TipManager.tipTextColor;
	        this._defaultTipHandler = this._showDefaultTip;
	        Laya.ILaya.stage.on(UIEvent.SHOW_TIP, this, this._onStageShowTip);
	        Laya.ILaya.stage.on(UIEvent.HIDE_TIP, this, this._onStageHideTip);
	        this.zOrder = 1100;
	    }
	    _onStageHideTip(e) {
	        Laya.ILaya.timer.clear(this, this._showTip);
	        this.closeAll();
	        this.removeSelf();
	    }
	    _onStageShowTip(data) {
	        Laya.ILaya.timer.once(TipManager.tipDelay, this, this._showTip, [data], true);
	    }
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
	            Laya.ILaya.stage.on(Laya.Event.MOUSE_MOVE, this, this._onStageMouseMove);
	            Laya.ILaya.stage.on(Laya.Event.MOUSE_DOWN, this, this._onStageMouseDown);
	        }
	        this._onStageMouseMove(null);
	    }
	    _onStageMouseDown(e) {
	        this.closeAll();
	    }
	    _onStageMouseMove(e) {
	        this._showToStage(this, TipManager.offsetX, TipManager.offsetY);
	    }
	    _showToStage(dis, offX = 0, offY = 0) {
	        var rec = dis.getBounds();
	        dis.x = Laya.ILaya.stage.mouseX + offX;
	        dis.y = Laya.ILaya.stage.mouseY + offY;
	        if (dis._x + rec.width > Laya.ILaya.stage.width) {
	            dis.x -= rec.width + offX;
	        }
	        if (dis._y + rec.height > Laya.ILaya.stage.height) {
	            dis.y -= rec.height + offY;
	        }
	    }
	    closeAll() {
	        Laya.ILaya.timer.clear(this, this._showTip);
	        Laya.ILaya.stage.off(Laya.Event.MOUSE_MOVE, this, this._onStageMouseMove);
	        Laya.ILaya.stage.off(Laya.Event.MOUSE_DOWN, this, this._onStageMouseDown);
	        this.removeChildren();
	    }
	    showDislayTip(tip) {
	        this.addChild(tip);
	        this._showToStage(this);
	        Laya.ILaya.stage.addChild(this);
	    }
	    _showDefaultTip(text) {
	        this._tipText.text = text;
	        var g = this._tipBox.graphics;
	        g.clear(true);
	        g.drawRect(0, 0, this._tipText.width + 10, this._tipText.height + 10, TipManager.tipBackColor);
	        this.addChild(this._tipBox);
	        this._showToStage(this);
	        Laya.ILaya.stage.addChild(this);
	    }
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

	class UILib {
	    static __init__() {
	    }
	}

	class WXOpenDataViewer extends UIComponent {
	    constructor() {
	        super();
	        this._width = this._height = 200;
	        var tex = new Laya.Texture();
	        tex.bitmap = new Laya.Texture2D();
	        this.texture = tex;
	    }
	    onEnable() {
	        this.postMsg({ type: "display", rate: Laya.Laya.stage.frameRate });
	        if (window.wx && window.sharedCanvas)
	            Laya.Laya.timer.frameLoop(1, this, this._onLoop);
	    }
	    onDisable() {
	        this.postMsg({ type: "undisplay" });
	        Laya.Laya.timer.clear(this, this._onLoop);
	    }
	    _onLoop() {
	        this.texture.bitmap.loadImageSource(window.sharedCanvas);
	    }
	    set width(value) {
	        super.width = value;
	        if (window.sharedCanvas)
	            window.sharedCanvas.width = value;
	        this.callLater(this._postMsg);
	    }
	    get width() {
	        return super.width;
	    }
	    set height(value) {
	        super.height = value;
	        if (window.sharedCanvas)
	            window.sharedCanvas.height = value;
	        this.callLater(this._postMsg);
	    }
	    get height() {
	        return super.height;
	    }
	    set x(value) {
	        super.x = value;
	        this.callLater(this._postMsg);
	    }
	    get x() {
	        return super.x;
	    }
	    set y(value) {
	        super.y = value;
	        this.callLater(this._postMsg);
	    }
	    get y() {
	        return super.y;
	    }
	    _postMsg() {
	        var mat = new Laya.Matrix();
	        mat.translate(this.x, this.y);
	        var stage = Laya.Laya.stage;
	        mat.scale(stage._canvasTransform.getScaleX() * this.globalScaleX * stage.transform.getScaleX(), stage._canvasTransform.getScaleY() * this.globalScaleY * stage.transform.getScaleY());
	        this.postMsg({ type: "changeMatrix", a: mat.a, b: mat.b, c: mat.c, d: mat.d, tx: mat.tx, ty: mat.ty, w: this.width, h: this.height });
	    }
	    postMsg(msg) {
	        if (window.wx && window.wx.getOpenDataContext) {
	            var openDataContext = window.wx.getOpenDataContext();
	            openDataContext.postMessage(msg);
	        }
	    }
	}
	Laya.ILaya.regClass(WXOpenDataViewer);
	Laya.ClassUtils.regClass("laya.ui.WXOpenDataViewer", WXOpenDataViewer);
	Laya.ClassUtils.regClass("Laya.WXOpenDataViewer", WXOpenDataViewer);

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

}(window.Laya = window.Laya || {}, Laya));
