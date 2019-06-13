	import { Context } from "../../resource/Context"
	import { ColorUtils } from "../../utils/ColorUtils"
	import { FontInfo } from "../../utils/FontInfo"
	import { Pool } from "../../utils/Pool"
	import { WordText } from "../../utils/WordText"
import { ILaya } from "../../../ILaya";
    
	/**
	 * 绘制文字
	 */
	export class FillTextCmd {
		 static ID:string = "FillText";
		
		
		private _text:string|WordText;
		/**@private */
		 _textIsWorldText:boolean = false;
		/**
		 * 开始绘制文本的 x 坐标位置（相对于画布）。
		 */
		 x:number;
		/**
		 * 开始绘制文本的 y 坐标位置（相对于画布）。
		 */
		 y:number;
		private _font:string;
		private _color:string;
		private _textAlign:string;
		private _fontColor:number = 0xffffffff;
		private _strokeColor:number = 0;
		private static _defFontObj:FontInfo = new FontInfo(null);
		private _fontObj:FontInfo = FillTextCmd._defFontObj;
		private _nTexAlign:number = 0;
		
		/**@private */
		 static create(text:string|WordText, x:number, y:number, font:string, color:string, textAlign:string):FillTextCmd {
			var cmd:FillTextCmd = Pool.getItemByClass("FillTextCmd", FillTextCmd);
			cmd.text = text;
			cmd._textIsWorldText = text instanceof WordText;
			cmd.x = x;
			cmd.y = y;
			cmd.font = font;
			cmd.color = color;
			cmd.textAlign = textAlign;
			return cmd;
		}
		
		/**
		 * 回收到对象池
		 */
		 recover():void {
			
			Pool.recover("FillTextCmd", this);
		}
		
		/**@private */
		 run(context:Context, gx:number, gy:number):void {
			if(ILaya.stage.isGlobalRepaint()){
				this._textIsWorldText && ((<WordText>this._text )).cleanCache();
			}
			
			if (this._textIsWorldText ) {
				context._fast_filltext(((<WordText>this._text )), this.x + gx, this.y + gy, this._fontObj, this._color, null, 0, this._nTexAlign, 0);
			} else {
				context.drawText(this._text, this.x + gx, this.y + gy, this._font, this._color, this._textAlign);
			}
		}
		
		/**@private */
		 get cmdID():string {
			return FillTextCmd.ID;
		}
		
		/**
		 * 在画布上输出的文本。
		 */
		 get text():string|WordText {
			return this._text;
		}
		
		 set text(value:string|WordText) {
			//TODO 问题。 怎么通知native
			this._text = value;
			this._textIsWorldText = value instanceof WordText;
			this._textIsWorldText && ((<WordText>this._text )).cleanCache();
		}
		
		/**
		 * 定义字号和字体，比如"20px Arial"。
		 */
		 get font():string {
			return this._font;
		}
		
		 set font(value:string) {
			this._font = value;
			this._fontObj = FontInfo.Parse(value);
			this._textIsWorldText && ((<WordText>this._text )).cleanCache();
		}
		
		/**
		 * 定义文本颜色，比如"#ff0000"。
		 */
		 get color():string {
			return this._color;
		}
		
		 set color(value:string) {
			this._color = value;
			this._fontColor = ColorUtils.create(value).numColor;
			this._textIsWorldText && ((<WordText>this._text )).cleanCache();
		}
		
		/**
		 * 文本对齐方式，可选值："left"，"center"，"right"。
		 */
		 get textAlign():string {
			return this._textAlign;
		}
		
		 set textAlign(value:string) {
			this._textAlign = value;
			switch (value) {
			case 'center': 
				this._nTexAlign = ILaya.Context.ENUM_TEXTALIGN_CENTER;
				break;
			case 'right': 
				this._nTexAlign = ILaya.Context.ENUM_TEXTALIGN_RIGHT;
				break;
			default: 
				this._nTexAlign = ILaya.Context.ENUM_TEXTALIGN_DEFAULT;
			}
			this._textIsWorldText && ((<WordText>this._text )).cleanCache();
		}
	}

