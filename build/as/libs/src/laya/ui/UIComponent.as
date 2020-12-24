package laya.ui {
	import laya.ui.Widget;
	import laya.display.Node;
	import laya.display.Sprite;

	/**
	 * <code>Component</code> 是ui控件类的基类。
	 * <p>生命周期：preinitialize > createChildren > initialize > 组件构造函数</p>
	 */
	public class UIComponent extends Sprite {

		/**
		 * X锚点，值为0-1，设置anchorX值最终通过pivotX值来改变节点轴心点。
		 */
		protected var _anchorX:Number;

		/**
		 * Y锚点，值为0-1，设置anchorY值最终通过pivotY值来改变节点轴心点。
		 */
		protected var _anchorY:Number;

		/**
		 * @private 控件的数据源。
		 */
		protected var _dataSource:*;

		/**
		 * @private 鼠标悬停提示
		 */
		protected var _toolTip:*;

		/**
		 * @private 标签
		 */
		protected var _tag:*;

		/**
		 * @private 禁用
		 */
		protected var _disabled:Boolean;

		/**
		 * @private 变灰
		 */
		protected var _gray:Boolean;

		/**
		 * @private 相对布局组件
		 */
		protected var _widget:Widget;

		/**
		 * <p>创建一个新的 <code>Component</code> 实例。</p>
		 */

		public function UIComponent(createChildren:Boolean = undefined){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}

		/**
		 * <p>预初始化。</p>
		 * 子类可在此函数内设置、修改属性默认值
		 */
		protected function preinitialize():void{}

		/**
		 * <p>创建并添加控件子节点。</p>
		 * 子类可在此函数内创建并添加子节点。
		 */
		protected function createChildren():void{}

		/**
		 * <p>控件初始化。</p>
		 * 在此子对象已被创建，可以对子对象进行修改。
		 */
		protected function initialize():void{}

		/**
		 * <p>表示显示对象的宽度，以像素为单位。</p>
		 * <p><b>注：</b>当值为0时，宽度为自适应大小。</p>
		 * @override 
		 */
		override public function get width():Number{return null;}

		/**
		 * @override 
		 */
		override public function get_width():Number{
			return null;
		}

		/**
		 * <p>显示对象的实际显示区域宽度（以像素为单位）。</p>
		 */
		protected function measureWidth():Number{
			return null;
		}

		/**
		 * <p>立即执行影响宽高度量的延迟调用函数。</p>
		 * <p>使用 <code>runCallLater</code> 函数，立即执行影响宽高度量的延迟运行函数(使用 <code>callLater</code> 设置延迟执行函数)。</p>
		 * @see #callLater()
		 * @see #runCallLater()
		 */
		protected function commitMeasure():void{}

		/**
		 * <p>表示显示对象的高度，以像素为单位。</p>
		 * <p><b>注：</b>当值为0时，高度为自适应大小。</p>
		 * @override 
		 */
		override public function get height():Number{return null;}

		/**
		 * @override 
		 */
		override public function get_height():Number{
			return null;
		}

		/**
		 * <p>显示对象的实际显示区域高度（以像素为单位）。</p>
		 */
		protected function measureHeight():Number{
			return null;
		}

		/**
		 * @implements <p>数据赋值，通过对UI赋值来控制UI显示逻辑。</p><p>简单赋值会更改组件的默认属性，使用大括号可以指定组件的任意属性进行赋值。</p>
		 * @example //默认属性赋值dataSource = {label1: "改变了label", checkbox1: true};//(更改了label1的text属性值，更改checkbox1的selected属性)。//任意属性赋值dataSource = {label2: {text:"改变了label",size:14}, checkbox2: {selected:true,x:10}};
		 */
		public function get dataSource():*{return null;}
		public function get_dataSource():*{}
		public function set dataSource(value:*):void{}
		public function set_dataSource(value:*):void{}

		/**
		 * <p>从组件顶边到其内容区域顶边之间的垂直距离（以像素为单位）。</p>
		 */
		public function get top():Number{return null;}
		public function get_top():Number{
			return null;
		}
		public function set top(value:Number):void{}
		public function set_top(value:Number):void{}

		/**
		 * <p>从组件底边到其内容区域底边之间的垂直距离（以像素为单位）。</p>
		 */
		public function get bottom():Number{return null;}
		public function get_bottom():Number{
			return null;
		}
		public function set bottom(value:Number):void{}
		public function set_bottom(value:Number):void{}

		/**
		 * <p>从组件左边到其内容区域左边之间的水平距离（以像素为单位）。</p>
		 */
		public function get left():Number{return null;}
		public function set left(value:Number):void{}

		/**
		 * <p>从组件右边到其内容区域右边之间的水平距离（以像素为单位）。</p>
		 */
		public function get right():Number{return null;}
		public function set right(value:Number):void{}

		/**
		 * <p>在父容器中，此对象的水平方向中轴线与父容器的水平方向中心线的距离（以像素为单位）。</p>
		 */
		public function get centerX():Number{return null;}
		public function set centerX(value:Number):void{}

		/**
		 * <p>在父容器中，此对象的垂直方向中轴线与父容器的垂直方向中心线的距离（以像素为单位）。</p>
		 */
		public function get centerY():Number{return null;}
		public function set centerY(value:Number):void{}
		protected function _sizeChanged():void{}

		/**
		 * <p>对象的标签。</p>
		 * 冗余字段，可以用来储存数据。
		 */
		public function get tag():*{return null;}
		public function set tag(value:*):void{}

		/**
		 * <p>鼠标悬停提示。</p>
		 * <p>可以赋值为文本 <code>String</code> 或函数 <code>Handler</code> ，用来实现自定义样式的鼠标提示和参数携带等。</p>
		 * @example private var _testTips:TestTipsUI = new TestTipsUI();private function testTips():void {//简单鼠标提示btn2.toolTip = "这里是鼠标提示&lt;b&gt;粗体&lt;/b&gt;&lt;br&gt;换行";//自定义的鼠标提示btn1.toolTip = showTips1;//带参数的自定义鼠标提示clip.toolTip = new Handler(this,showTips2, ["clip"]);}private function showTips1():void {_testTips.label.text = "这里是按钮[" + btn1.label + "]";tip.addChild(_testTips);}private function showTips2(name:String):void {_testTips.label.text = "这里是" + name;tip.addChild(_testTips);}
		 */
		public function get toolTip():*{return null;}
		public function set toolTip(value:*):void{}

		/**
		 * 对象的 <code>Event.MOUSE_OVER</code> 事件侦听处理函数。
		 */
		private var onMouseOver:*;

		/**
		 * 对象的 <code>Event.MOUSE_OUT</code> 事件侦听处理函数。
		 */
		private var onMouseOut:*;

		/**
		 * 是否变灰。
		 */
		public function get gray():Boolean{return null;}
		public function set gray(value:Boolean):void{}

		/**
		 * 是否禁用页面，设置为true后，会变灰并且禁用鼠标。
		 */
		public function get disabled():Boolean{return null;}
		public function set disabled(value:Boolean):void{}

		/**
		 * @private <p>获取对象的布局样式。请不要直接修改此对象</p>
		 */
		private var _getWidget:*;

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function set scaleX(value:Number):void{}

		/**
		 * @override 
		 */
		override public function set_scaleX(value:Number):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function get scaleX():Number{return null;}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function set scaleY(value:Number):void{}

		/**
		 * @override 
		 */
		override public function set_scaleY(value:Number):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function get scaleY():Number{return null;}

		/**
		 * @private 
		 */
		protected function onCompResize():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function set width(value:Number):void{}

		/**
		 * @override 
		 */
		override public function set_width(value:Number):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function set height(value:Number):void{}

		/**
		 * @override 
		 */
		override public function set_height(value:Number):void{}

		/**
		 * X锚点，值为0-1，设置anchorX值最终通过pivotX值来改变节点轴心点。
		 */
		public function get anchorX():Number{return null;}
		public function get_anchorX():Number{
			return null;
		}
		public function set anchorX(value:Number):void{}
		public function set_anchorX(value:Number):void{}

		/**
		 * Y锚点，值为0-1，设置anchorY值最终通过pivotY值来改变节点轴心点。
		 */
		public function get anchorY():Number{return null;}
		public function get_anchorY():Number{
			return null;
		}
		public function set anchorY(value:Number):void{}
		public function set_anchorY(value:Number):void{}

		/**
		 * @param child 
		 * @override 
		 */
		override protected function _childChanged(child:Node = null):void{}
	}

}
