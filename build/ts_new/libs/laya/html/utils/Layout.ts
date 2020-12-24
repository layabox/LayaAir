import { HTMLStyle } from "./HTMLStyle";
import { ILaya } from "../../../ILaya";
import { ILayout } from "./ILayout";
import { LayoutLine } from "./LayoutLine";
import { HTMLChar } from "../../utils/HTMLChar";
import { HTMLElement } from "../dom/HTMLElement";
import { IHtml } from "./IHtml";
import { ClassUtils } from "../../utils/ClassUtils";

/**
 * @private
 * HTML的布局类
 * 对HTML的显示对象进行排版
 */
export class Layout {

    private static DIV_ELEMENT_PADDING: number = 0;
    private static _will: HTMLElement[];

    //TODO:coverage
    static later(element: HTMLElement): void {
        if (Layout._will == null) {
            Layout._will = [];
            ILaya.stage.frameLoop(1, null, function (): void {
                if (Layout._will.length < 1)
                    return;
                for (var i: number = 0; i < Layout._will.length; i++) {
                    Layout.layout(Layout._will[i]);
                }
                Layout._will.length = 0;
            });
        }
        Layout._will.push(element);
    }

    static layout(element: HTMLElement): any[] {
        if (!element || !element._style) return null;
        var style: HTMLStyle = (<HTMLStyle>element._style);
        if ((style._type & HTMLStyle.ADDLAYOUTED) === 0)
            return null;

        element.style._type &= ~HTMLStyle.ADDLAYOUTED;
        /*
           if (element._children.length > 0)
           return _multiLineLayout(element);
           if (element is HTMLElement)
           {
           var htmlElement:HTMLElement = element as HTMLElement;
           var style:CSSStyle = htmlElement.style;
           var txt:String = htmlElement.text;
           if (txt.length < 1)
           return [0, 0];
           if (!style.wordWrap)
           return _singleLineTextLayout(htmlElement, -1, -1);
           if (style.letterSpacing || txt.indexOf('\n') >= 0)
           return _multiLineLayout(htmlElement);
           var sz:Object = Utils.measureText(txt, style.font);
           if (sz.width > element.width)
           return _multiLineLayout(htmlElement);
           return _singleLineTextLayout(htmlElement, sz.width, sz.height);
           }*/
        var arr: any[] = Layout._multiLineLayout(element);
        return arr;
    }

    /*
       //针对单行文字，还可以优化
       public static function _singleLineTextLayout(element:HTMLElement, txtWidth:int, txtHeight:int):Array
       {
       var style:CSSStyle = element._getCSSStyle();
	
       if (txtWidth < 0)
       {
       var txt:String = element.text;
       var sz:Object = Utils.measureText(txt, style.font);
       txtWidth = sz.width;
       txtHeight = sz.height;
       }
	
       if (style.italic)
       txtWidth += txtHeight / 3;
	
       var elements:Vector.<HTMLChar> = element._getWords() as Vector.<HTMLChar>;
       var x:int = 0;
       var y:int = 0;
	
       var letterSpacing:Number = style.letterSpacing;
       var align:int = style._getAlign();
       var lineHeight:Number = style.lineHeight;
       var valign:int = style._getValign();
	
       (lineHeight > 0) && valign === 0 && (valign = CSSStyle.VALIGN_MIDDLE);
	
       (align === CSSStyle.ALIGN_CENTER) && (x = (element.width - txtWidth) / 2);
       (align === CSSStyle.ALIGN_RIGHT) && (x = (element.width - txtWidth));
	
       (valign === CSSStyle.VALIGN_MIDDLE) && (y = (element.height - txtHeight) / 2);
       (valign === CSSStyle.VALIGN_BOTTOM) && (y = (element.height - txtHeight));
	
       for (var i:int = 0, n:int = elements.length; i < n; i++)
       {
       var one:ILayout = elements[i];
       one.x = x;
       one.y = y;
       x += one.width + letterSpacing;
       }
       return [txtWidth, txtHeight];
       }
     */

    static _multiLineLayout(element: HTMLElement): any[] {
        var elements: ILayout[] = [];
        element._addChildsToLayout(elements);
        var i: number, n: number = elements.length, j: number;
        var style: HTMLStyle = element._getCSSStyle();
        var letterSpacing: number = style.letterSpacing;
        var leading: number = style.leading;
        var lineHeight: number = style.lineHeight;
        var widthAuto: boolean = style._widthAuto() || !style.wordWrap;
        var width: number = widthAuto ? 999999 : element.width;
        var height: number = element.height;
        var maxWidth: number = 0;
        var exWidth: number = style.italic ? style.fontSize / 3 : 0;
        var align: string = style.align;
        var valign: string = style.valign;
        var endAdjust: boolean = valign !== HTMLStyle.VALIGN_TOP || align !== HTMLStyle.ALIGN_LEFT || lineHeight != 0;

        var oneLayout: ILayout;
        var x: number = 0;
        var y: number = 0;
        var w: number = 0;
        var h: number = 0;
        var tBottom: number = 0;
        var lines: LayoutLine[] = [];
        var curStyle: HTMLStyle;
        var curPadding: any[];
        var curLine: LayoutLine = lines[0] = new LayoutLine();
        var newLine: boolean, nextNewline: boolean = false;
        var htmlWord: HTMLChar;
        var sprite: HTMLElement;

        curLine.h = 0;
        if (style.italic)
            width -= style.fontSize / 3;

        var tWordWidth: number = 0;
        var tLineFirstKey: boolean = true;
        function addLine(): void {
            curLine.y = y;
            y += curLine.h + leading;
            curLine.mWidth = tWordWidth;
            tWordWidth = 0;
            curLine = new LayoutLine();
            lines.push(curLine);
            curLine.h = 0;
            x = 0;
            tLineFirstKey = true;
            newLine = false;
        }

        //生成排版的行
        for (i = 0; i < n; i++) {
            oneLayout = elements[i];
            if (oneLayout == null) {
                if (!tLineFirstKey) {
                    x += Layout.DIV_ELEMENT_PADDING;
                }
                curLine.wordStartIndex = curLine.elements.length;
                continue;
            }
            tLineFirstKey = false;
            if (oneLayout instanceof IHtml.HTMLBrElement) {
                addLine();
                curLine.y = y;
                curLine.h = lineHeight;
                continue;
            } else if (oneLayout._isChar()) {
                htmlWord = <HTMLChar>oneLayout;
                w = htmlWord.width + htmlWord.style.letterSpacing;	// 下面要用到w，所以先计算（Bug:英文的宽度按照前面的汉字的宽度计算导致错误换行）
                h = htmlWord.height;
                if (!htmlWord.isWord) //如果是完整单词
                {
                    if (lines.length > 0 && (x + w) > width && curLine.wordStartIndex > 0) //如果完整单词超界，需要单词开始折到下一行
                    {
                        var tLineWord: number = 0;
                        tLineWord = curLine.elements.length - curLine.wordStartIndex + 1;
                        curLine.elements.length = curLine.wordStartIndex;
                        i -= tLineWord;
                        addLine();
                        continue;
                    }
                    newLine = false;
                    tWordWidth += htmlWord.width;
                } else {
                    newLine = nextNewline || (htmlWord.char === '\n');
                    curLine.wordStartIndex = curLine.elements.length;
                }

                nextNewline = false;

                newLine = newLine || ((x + w) > width);
                newLine && addLine();
                curLine.minTextHeight = Math.min(curLine.minTextHeight, oneLayout.height);
            } else {
                curStyle = oneLayout._getCSSStyle();
                sprite = (<HTMLElement>oneLayout);
                curPadding = curStyle.padding;
                //curStyle._getCssFloat() === 0 || (endAdjust = true);
                newLine = nextNewline || curStyle.getLineElement();
                w = sprite.width + curPadding[1] + curPadding[3] + curStyle.letterSpacing;
                h = sprite.height + curPadding[0] + curPadding[2];
                nextNewline = curStyle.getLineElement();
                newLine = newLine || ((x + w) > width && curStyle.wordWrap);
                newLine && addLine();
            }

            curLine.elements.push(oneLayout);
            curLine.h = Math.max(curLine.h, h);//计算最大宽和高
            oneLayout.x = x;
            oneLayout.y = y;
            x += w;
            curLine.w = x - letterSpacing;
            curLine.y = y;
            maxWidth = Math.max(x + exWidth, maxWidth);
        }
        y = curLine.y + curLine.h;

        //如果行信息需要调整，包括有浮动，有居中等
        if (endAdjust) {
            //var dy:Number = 0;
            //valign === CSSStyle.VALIGN_MIDDLE && (dy = (height - y) / 2);
            //valign === CSSStyle.VALIGN_BOTTOM && (dy = (height - y));
            var tY: number = 0;
            var tWidth: number = width;
            if (widthAuto && element.width > 0) {
                //如果使用单行，这里一定要根据单行的实际宽（element.width）来排版
                tWidth = element.width;
            }
            for (i = 0, n = lines.length; i < n; i++) {
                lines[i].updatePos(0, tWidth, i, tY, align, valign, lineHeight);
                tY += Math.max(lineHeight, lines[i].h + leading);
            }
            y = tY;
        }
        widthAuto && (element.width = maxWidth);
        (y > element.height) && (element.height = y);

        return [maxWidth, y];
    }
}

ClassUtils.regClass("laya.html.utils.Layout", Layout);
ClassUtils.regClass("Laya.Layout", Layout);