package laya.html.utils {
	import laya.html.dom.HTMLImageElement;
	
	/**
	 * @private
	 */
	public class LayoutLine {
		public var elements:Vector.<ILayout> = new Vector.<ILayout>;
		public var x:Number = 0;
		public var y:Number = 0;
		public var w:Number = 0;
		public var h:Number = 0;
		public var wordStartIndex:int = 0;
		public var minTextHeight:int = 99999;
		public var mWidth:int = 0;
		
		//注释：垂直居中对齐是以最小的文字单位为中心点对齐(如果没有文字，就以上对齐)
		//如果计算的坐标小于高度，那么以高度为主
		/**
		 * 底对齐（默认）
		 * @param	left
		 * @param	width
		 * @param	dy
		 * @param	align		水平
		 * @param	valign		垂直
		 * @param	lineHeight	行高
		 */
		public function updatePos(left:Number, width:Number, lineNum:int, dy:Number, align:String, valign:String, lineHeight:Number):void {
			var w:Number = 0;
			//重新计算宽度，因为上层的排序跟分段规则导致宽度计算不正确，把宽度计算放到这里，后面看情况再去优化
			var one:ILayout
			if (elements.length > 0) {
				one = elements[elements.length - 1];
				w = one.x + one.width - elements[0].x;
			}
			lineHeight = lineHeight || this.h;
			var dx:Number = 0, ddy:Number;
			
			if (align === HTMLStyle.ALIGN_CENTER) dx = (width - w) / 2;
			if (align === HTMLStyle.ALIGN_RIGHT) dx = (width - w);
			
			//lineHeight === 0 || valign != 0 || (valign = 1);
			for (var i:int = 0, n:int = elements.length; i < n; i++) {
				one = elements[i];
				var tCSSStyle:HTMLStyle = one._getCSSStyle();
				dx !== 0 && (one.x += dx);
				switch (tCSSStyle.valign) {
				case "top": 
					one.y = dy;
					break;
				case "middle": 
					var tMinTextHeight:Number = 0;
					if (minTextHeight != 99999) tMinTextHeight = minTextHeight;
					var tBottomLineY:Number = (tMinTextHeight + lineHeight) / 2;
					tBottomLineY = Math.max(tBottomLineY, h);//如果实际行高大于一半行高，用实际行高对齐
					if (one is HTMLImageElement) ddy = dy + tBottomLineY - one.height;
					else ddy = dy + tBottomLineY - one.height;
					one.y = ddy;
					break;
				case "bottom": 
					one.y = dy + (lineHeight - one.height);
					break;
				}
			}
		}
	}
}