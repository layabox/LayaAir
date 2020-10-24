import { HTMLDivParser } from "./HTMLDivParser";
import { HTMLHitRect } from "./HTMLHitRect";
import { Sprite } from "../../display/Sprite"
import { Event } from "../../events/Event"
import { HTMLStyle } from "../utils/HTMLStyle"
import { Rectangle } from "../../maths/Rectangle"
import { Handler } from "../../utils/Handler"
import { IHtml } from "../utils/IHtml";
import { HTMLParse } from "../utils/HTMLParse";
import { ClassUtils } from "../../utils/ClassUtils";

/**
 * HTML图文类，用于显示html内容
 *
 * 支持的标签如下:
 * a:链接标签，点击后会派发"link"事件 比如:<a href='alink'>a</a>
 * div:div容器标签，比如:<div>abc</div>
 * span:行内元素标签，比如:<span style='color:#ff0000'>abc</span>
 * p:行元素标签，p标签会自动换行，div不会，比如:<p>abc</p>
 * img:图片标签，比如:<img src='res/boy.png'></img>
 * br:换行标签，比如:<div>abc<br/>def</div>
 * style:样式标签，比如:<div style='width:130px;height:50px;color:#ff0000'>abc</div>
 * link:外链样式标签，可以加载一个css文件来当style使用，比如:<link type='text/css' href='html/test.css'/>
 *
 * style支持的属性如下:
 * italic:true|false;					是否是斜体
 * bold:true|false;						是否是粗体
 * letter-spacing:10px;					字间距
 * font-family:宋体; 					字体
 * font-size:20px;						字体大小
 * font-weight:bold:none;				字体是否是粗体，功能同bold
 * color:#ff0000;						字体颜色
 * stroke:2px;							字体描边宽度
 * strokeColor:#ff0000;					字体描边颜色
 * padding:10px 10px 20px 20px;			边缘的距离
 * vertical-align:top|bottom|middle;	垂直对齐方式
 * align:left|right|center;				水平对齐方式
 * line-height:20px;					行高
 * background-color:#ff0000;			背景颜色
 * border-color:#ff0000;				边框颜色
 * width:100px;							对象宽度
 * height:100px;						对象高度
 *
 * 示例用法：
 * var div:HTMLDivElement=new HTMLDivElement();
 * div.innerHTML = "<link type='text/css' href='html/test.css'/><a href='alink'>a</a><div style='width:130px;height:50px;color:#ff0000'>div</div><br/><span style='font-weight:bold;color:#ffffff;font-size:30px;stroke:2px;italic:true;'>span</span><span style='letter-spacing:5px'>span2</span><p>p</p><img src='res/boy.png'></img>";
 */
export class HTMLDivElement extends Sprite {
    /**@internal */
    _element: HTMLDivParser;
    /**@private */
    private _recList: any[] = [];
    /**@private */
    private _innerHTML: string;
    /**@private */
    private _repaintState: number = 0;

    constructor() {
        super();
        this._element = new HTMLDivParser();
        this._element.repaintHandler = new Handler(this, this._htmlDivRepaint);
        this.mouseEnabled = true;
        this.on(Event.CLICK, this, this._onMouseClick);
    }

    /**@private 
     * @override
    */
    destroy(destroyChild: boolean = true): void {
        if (this._element) this._element.reset();
        this._element = null;
        this._doClears();
        super.destroy(destroyChild);
    }

    /**@private */
    private _htmlDivRepaint(recreate: boolean = false): void {
        if (recreate) {
            if (this._repaintState < 2) this._repaintState = 2;
        } else {
            if (this._repaintState < 1) this._repaintState = 1;
        }
        if (this._repaintState > 0) this._setGraphicDirty();
    }


    private _updateGraphicWork(): void {
        switch (this._repaintState) {
            case 1:
                this._updateGraphic();
                break;
            case 2:
                this._refresh();
                break;
        }
    }

    private _setGraphicDirty(): void {
        this.callLater(this._updateGraphicWork);
    }

    /**@private */
    private _doClears(): void {
        if (!this._recList) return;
        var i: number, len: number = this._recList.length;
        var tRec: HTMLHitRect;
        for (i = 0; i < len; i++) {
            tRec = this._recList[i];
            tRec.recover();
        }
        this._recList.length = 0;
    }

    /**@private */
    private _updateGraphic(): void {
        this._doClears();
        this.graphics.clear(true);
        this._repaintState = 0;
        this._element.drawToGraphic(this.graphics, -this._element.x, -this._element.y, this._recList);
        var bounds: Rectangle = this._element.getBounds();
        if (bounds) this.setSelfBounds(bounds);
        //this.hitArea = bounds;
        this.size(bounds.width, bounds.height);
    }

    /**
     * 获取HTML样式
     */
    get style(): HTMLStyle {
        return this._element.style;
    }

    /**
     * 设置标签内容
     */
    set innerHTML(text: string) {
        if (this._innerHTML == text) return;
        this._repaintState = 1;
        this._innerHTML = text;
        this._element.innerHTML = text;
        this._setGraphicDirty();
    }

    private _refresh(): void {
        this._repaintState = 1;
        if (this._innerHTML) this._element.innerHTML = this._innerHTML;
        this._setGraphicDirty();
    }

    set width(value: number) {
        this._element.width = value;
    }

    get width():number {
        return this._element.width;
    }

    set height(value: number) {
        this._element.height = value;
    }

    get height():number {
        return this._element.height;
    }

    /**
     * 获取內容宽度
     */
    get contextWidth(): number {
        return this._element.contextWidth;
    }

    /**
     * 获取內容高度
     */
    get contextHeight(): number {
        return this._element.contextHeight;
    }

    /**@private */
    private _onMouseClick(): void {
        var tX: number = this.mouseX;
        var tY: number = this.mouseY;
        var i: number, len: number;
        var tHit: HTMLHitRect;
        len = this._recList.length;
        for (i = 0; i < len; i++) {
            tHit = this._recList[i];
            if (tHit.rec.contains(tX, tY)) {
                this._eventLink(tHit.href);
            }
        }
    }

    /**@private */
    private _eventLink(href: string): void {
        this.event(Event.LINK, [href]);
    }
}

IHtml.HTMLDivElement = HTMLDivElement;
IHtml.HTMLParse = HTMLParse;

ClassUtils.regClass("laya.html.dom.HTMLDivElement", HTMLDivElement);
ClassUtils.regClass("Laya.HTMLDivElement", HTMLDivElement);