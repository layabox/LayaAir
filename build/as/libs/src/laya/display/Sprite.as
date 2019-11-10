package laya.display {
	import laya.events.EventDispatcher;
	import laya.maths.Matrix;
	import laya.maths.Point;
	import laya.maths.Rectangle;
	import laya.resource.Context;
	import laya.resource.HTMLCanvas;
	import laya.resource.Texture;
	import laya.resource.Texture2D;
	import laya.utils.Handler;
	import laya.display.css.SpriteStyle;
	import laya.display.Graphics;
	import laya.display.Node;
	import laya.display.Stage;
	import laya.resource.RenderTexture2D;

	/**
	 * 在显示对象上按下后调度。
	 * @eventType Event.MOUSE_DOWN
	 */

	/**
	 * 在显示对象抬起后调度。
	 * @eventType Event.MOUSE_UP
	 */

	/**
	 * 鼠标在对象身上进行移动后调度
	 * @eventType Event.MOUSE_MOVE
	 */

	/**
	 * 鼠标经过对象后调度。
	 * @eventType Event.MOUSE_OVER
	 */

	/**
	 * 鼠标离开对象后调度。
	 * @eventType Event.MOUSE_OUT
	 */

	/**
	 * 鼠标点击对象后调度。
	 * @eventType Event.CLICK
	 */

	/**
	 * 开始拖动后调度。
	 * @eventType Event.DRAG_START
	 */

	/**
	 * 拖动中调度。
	 * @eventType Event.DRAG_MOVE
	 */

	/**
	 * 拖动结束后调度。
	 * @eventType Event.DRAG_END
	 */

	/**
	 * <p> <code>Sprite</code> 是基本的显示图形的显示列表节点。 <code>Sprite</code> 默认没有宽高，默认不接受鼠标事件。通过 <code>graphics</code> 可以绘制图片或者矢量图，支持旋转，缩放，位移等操作。<code>Sprite</code>同时也是容器类，可用来添加多个子节点。</p>
	 * <p>注意： <code>Sprite</code> 默认没有宽高，可以通过<code>getBounds</code>函数获取；也可手动设置宽高；还可以设置<code>autoSize=true</code>，然后再获取宽高。<code>Sprite</code>的宽高一般用于进行碰撞检测和排版，并不影响显示图像大小，如果需要更改显示图像大小，请使用 <code>scaleX</code> ， <code>scaleY</code> ， <code>scale</code>。</p>
	 * <p> <code>Sprite</code> 默认不接受鼠标事件，即<code>mouseEnabled=false</code>，但是只要对其监听任意鼠标事件，会自动打开自己以及所有父对象的<code>mouseEnabled=true</code>。所以一般也无需手动设置<code>mouseEnabled</code>。</p>
	 * <p>LayaAir引擎API设计精简巧妙。核心显示类只有一个<code>Sprite</code>。<code>Sprite</code>针对不同的情况做了渲染优化，所以保证一个类实现丰富功能的同时，又达到高性能。</p>
	 * @example <caption>创建了一个 <code>Sprite</code> 实例。</caption>package{import laya.display.Sprite;import laya.events.Event;public class Sprite_Example{private var sprite:Sprite;private var shape:Spritepublic function Sprite_Example(){Laya.init(640, 800);//设置游戏画布宽高、渲染模式。Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。onInit();}private function onInit():void{sprite = new Sprite();//创建一个 Sprite 类的实例对象 sprite 。sprite.loadImage("resource/ui/bg.png");//加载并显示图片。sprite.x = 200;//设置 sprite 对象相对于父容器的水平方向坐标值。sprite.y = 200;//设置 sprite 对象相对于父容器的垂直方向坐标值。sprite.pivotX = 0;//设置 sprite 对象的水平方法轴心点坐标。sprite.pivotY = 0;//设置 sprite 对象的垂直方法轴心点坐标。Laya.stage.addChild(sprite);//将此 sprite 对象添加到显示列表。sprite.on(Event.CLICK, this, onClickSprite);//给 sprite 对象添加点击事件侦听。shape = new Sprite();//创建一个 Sprite 类的实例对象 sprite 。shape.graphics.drawRect(0, 0, 100, 100, "#ccff00", "#ff0000", 2);//绘制一个有边框的填充矩形。shape.x = 400;//设置 shape 对象相对于父容器的水平方向坐标值。shape.y = 200;//设置 shape 对象相对于父容器的垂直方向坐标值。shape.width = 100;//设置 shape 对象的宽度。shape.height = 100;//设置 shape 对象的高度。shape.pivotX = 50;//设置 shape 对象的水平方法轴心点坐标。shape.pivotY = 50;//设置 shape 对象的垂直方法轴心点坐标。Laya.stage.addChild(shape);//将此 shape 对象添加到显示列表。shape.on(Event.CLICK, this, onClickShape);//给 shape 对象添加点击事件侦听。}private function onClickSprite():void{trace("点击 sprite 对象。");sprite.rotation += 5;//旋转 sprite 对象。}private function onClickShape():void{trace("点击 shape 对象。");shape.rotation += 5;//旋转 shape 对象。}}}
	 * @example var sprite;var shape;Sprite_Example();function Sprite_Example(){    Laya.init(640, 800);//设置游戏画布宽高、渲染模式。    Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。    onInit();}function onInit(){    sprite = new laya.display.Sprite();//创建一个 Sprite 类的实例对象 sprite 。    sprite.loadImage("resource/ui/bg.png");//加载并显示图片。    sprite.x = 200;//设置 sprite 对象相对于父容器的水平方向坐标值。    sprite.y = 200;//设置 sprite 对象相对于父容器的垂直方向坐标值。    sprite.pivotX = 0;//设置 sprite 对象的水平方法轴心点坐标。    sprite.pivotY = 0;//设置 sprite 对象的垂直方法轴心点坐标。    Laya.stage.addChild(sprite);//将此 sprite 对象添加到显示列表。    sprite.on(Event.CLICK, this, onClickSprite);//给 sprite 对象添加点击事件侦听。     shape = new laya.display.Sprite();//创建一个 Sprite 类的实例对象 sprite 。    shape.graphics.drawRect(0, 0, 100, 100, "#ccff00", "#ff0000", 2);//绘制一个有边框的填充矩形。    shape.x = 400;//设置 shape 对象相对于父容器的水平方向坐标值。    shape.y = 200;//设置 shape 对象相对于父容器的垂直方向坐标值。    shape.width = 100;//设置 shape 对象的宽度。    shape.height = 100;//设置 shape 对象的高度。    shape.pivotX = 50;//设置 shape 对象的水平方法轴心点坐标。    shape.pivotY = 50;//设置 shape 对象的垂直方法轴心点坐标。    Laya.stage.addChild(shape);//将此 shape 对象添加到显示列表。    shape.on(laya.events.Event.CLICK, this, onClickShape);//给 shape 对象添加点击事件侦听。}function onClickSprite(){    console.log("点击 sprite 对象。");    sprite.rotation += 5;//旋转 sprite 对象。}function onClickShape(){    console.log("点击 shape 对象。");    shape.rotation += 5;//旋转 shape 对象。}
	 * @example import Sprite = laya.display.Sprite;class Sprite_Example {    private sprite: Sprite;    private shape: Sprite    public Sprite_Example() {        Laya.init(640, 800);//设置游戏画布宽高、渲染模式。        Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。        this.onInit();    }    private onInit(): void {        this.sprite = new Sprite();//创建一个 Sprite 类的实例对象 sprite 。        this.sprite.loadImage("resource/ui/bg.png");//加载并显示图片。        this.sprite.x = 200;//设置 sprite 对象相对于父容器的水平方向坐标值。        this.sprite.y = 200;//设置 sprite 对象相对于父容器的垂直方向坐标值。        this.sprite.pivotX = 0;//设置 sprite 对象的水平方法轴心点坐标。        this.sprite.pivotY = 0;//设置 sprite 对象的垂直方法轴心点坐标。        Laya.stage.addChild(this.sprite);//将此 sprite 对象添加到显示列表。        this.sprite.on(laya.events.Event.CLICK, this, this.onClickSprite);//给 sprite 对象添加点击事件侦听。         this.shape = new Sprite();//创建一个 Sprite 类的实例对象 sprite 。        this.shape.graphics.drawRect(0, 0, 100, 100, "#ccff00", "#ff0000", 2);//绘制一个有边框的填充矩形。        this.shape.x = 400;//设置 shape 对象相对于父容器的水平方向坐标值。        this.shape.y = 200;//设置 shape 对象相对于父容器的垂直方向坐标值。        this.shape.width = 100;//设置 shape 对象的宽度。        this.shape.height = 100;//设置 shape 对象的高度。        this.shape.pivotX = 50;//设置 shape 对象的水平方法轴心点坐标。        this.shape.pivotY = 50;//设置 shape 对象的垂直方法轴心点坐标。        Laya.stage.addChild(this.shape);//将此 shape 对象添加到显示列表。        this.shape.on(laya.events.Event.CLICK, this, this.onClickShape);//给 shape 对象添加点击事件侦听。    }    private onClickSprite(): void {        console.log("点击 sprite 对象。");        this.sprite.rotation += 5;//旋转 sprite 对象。    }    private onClickShape(): void {        console.log("点击 shape 对象。");        this.shape.rotation += 5;//旋转 shape 对象。    }}
	 */
	public class Sprite extends Node {

		/**
		 * <p>鼠标事件与此对象的碰撞检测是否可穿透。碰撞检测发生在鼠标事件的捕获阶段，此阶段引擎会从stage开始递归检测stage及其子对象，直到找到命中的目标对象或者未命中任何对象。</p>
		 * <p>穿透表示鼠标事件发生的位置处于本对象绘图区域内时，才算命中，而与对象宽高和值为Rectangle对象的hitArea属性无关。如果sprite.hitArea值是HitArea对象，表示显式声明了此对象的鼠标事件响应区域，而忽略对象的宽高、mouseThrough属性。</p>
		 * <p>影响对象鼠标事件响应区域的属性为：width、height、hitArea，优先级顺序为：hitArea(type:HitArea)>hitArea(type:Rectangle)>width/height。</p>
		 * @default false	不可穿透，此对象的鼠标响应区域由width、height、hitArea属性决定。</p>
		 */
		public var mouseThrough:Boolean;

		/**
		 * <p>指定是否自动计算宽高数据。默认值为 false 。</p>
		 * <p>Sprite宽高默认为0，并且不会随着绘制内容的变化而变化，如果想根据绘制内容获取宽高，可以设置本属性为true，或者通过getBounds方法获取。设置为true，对性能有一定影响。</p>
		 */
		public var autoSize:Boolean;

		/**
		 * <p>指定鼠标事件检测是优先检测自身，还是优先检测其子对象。鼠标事件检测发生在鼠标事件的捕获阶段，此阶段引擎会从stage开始递归检测stage及其子对象，直到找到命中的目标对象或者未命中任何对象。</p>
		 * <p>如果为false，优先检测子对象，当有子对象被命中时，中断检测，获得命中目标。如果未命中任何子对象，最后再检测此对象；如果为true，则优先检测本对象，如果本对象没有被命中，直接中断检测，表示没有命中目标；如果本对象被命中，则进一步递归检测其子对象，以确认最终的命中目标。</p>
		 * <p>合理使用本属性，能减少鼠标事件检测的节点，提高性能。可以设置为true的情况：开发者并不关心此节点的子节点的鼠标事件检测结果，也就是以此节点作为其子节点的鼠标事件检测依据。</p>
		 * <p>Stage对象和UI的View组件默认为true。</p>
		 * @default false	优先检测此对象的子对象，当递归检测完所有子对象后，仍然没有找到目标对象，最后再检测此对象。
		 */
		public var hitTestPrior:Boolean;

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}

		public function Sprite(){}

		/**
		 * 根据zOrder进行重新排序。
		 */
		public function updateZOrder():void{}

		/**
		 * 设置是否开启自定义渲染，只有开启自定义渲染，才能使用customRender函数渲染。
		 */
		public var customRenderEnable:Boolean;

		/**
		 * <p>指定显示对象是否缓存为静态图像，cacheAs时，子对象发生变化，会自动重新缓存，同时也可以手动调用reCache方法更新缓存。</p>
		 * <p>建议把不经常变化的“复杂内容”缓存为静态图像，能极大提高渲染性能。cacheAs有"none"，"normal"和"bitmap"三个值可选。
		 * <li>默认为"none"，不做任何缓存。</li>
		 * <li>当值为"normal"时，canvas模式下进行画布缓存，webgl模式下进行命令缓存。</li>
		 * <li>当值为"bitmap"时，canvas模式下进行依然是画布缓存，webgl模式下使用renderTarget缓存。</li></p>
		 * <p>webgl下renderTarget缓存模式缺点：会额外创建renderTarget对象，增加内存开销，缓存面积有最大2048限制，不断重绘时会增加CPU开销。优点：大幅减少drawcall，渲染性能最高。
		 * webgl下命令缓存模式缺点：只会减少节点遍历及命令组织，不会减少drawcall数，性能中等。优点：没有额外内存开销，无需renderTarget支持。</p>
		 */
		public var cacheAs:String;

		/**
		 * 更新_cnavas相关的状态
		 */
		private var _checkCanvasEnable:*;

		/**
		 * 设置cacheAs为非空时此值才有效，staticCache=true时，子对象变化时不会自动更新缓存，只能通过调用reCache方法手动刷新。
		 */
		public var staticCache:Boolean;

		/**
		 * 在设置cacheAs的情况下，调用此方法会重新刷新缓存。
		 */
		public function reCache():void{}
		public function getRepaint():Number{
			return null;
		}

		/**
		 * 表示显示对象相对于父容器的水平方向坐标值。
		 */
		public var x:Number;

		/**
		 * 表示显示对象相对于父容器的垂直方向坐标值。
		 */
		public var y:Number;

		/**
		 * <p>显示对象的宽度，单位为像素，默认为0。</p>
		 * <p>此宽度用于鼠标碰撞检测，并不影响显示对象图像大小。需要对显示对象的图像进行缩放，请使用scale、scaleX、scaleY。</p>
		 * <p>可以通过getbounds获取显示对象图像的实际宽度。</p>
		 */
		public var width:Number;
		public function set_width(value:Number):void{}
		public function get_width():Number{
			return null;
		}

		/**
		 * <p>显示对象的高度，单位为像素，默认为0。</p>
		 * <p>此高度用于鼠标碰撞检测，并不影响显示对象图像大小。需要对显示对象的图像进行缩放，请使用scale、scaleX、scaleY。</p>
		 * <p>可以通过getbounds获取显示对象图像的实际高度。</p>
		 */
		public var height:Number;
		public function set_height(value:Number):void{}
		public function get_height():Number{
			return null;
		}

		/**
		 * <p>对象的显示宽度（以像素为单位）。</p>
		 */
		public function get displayWidth():Number{
				return null;
		}

		/**
		 * <p>对象的显示高度（以像素为单位）。</p>
		 */
		public function get displayHeight():Number{
				return null;
		}

		/**
		 * 设置对象bounds大小，如果有设置，则不再通过getBounds计算，合理使用能提高性能。
		 * @param bound bounds矩形区域
		 */
		public function setSelfBounds(bound:Rectangle):void{}

		/**
		 * <p>获取本对象在父容器坐标系的矩形显示区域。</p>
		 * <p><b>注意：</b>计算量较大，尽量少用。</p>
		 * @return 矩形区域。
		 */
		public function getBounds():Rectangle{
			return null;
		}

		/**
		 * 获取本对象在自己坐标系的矩形显示区域。
		 * <p><b>注意：</b>计算量较大，尽量少用。</p>
		 * @return 矩形区域。
		 */
		public function getSelfBounds():Rectangle{
			return null;
		}

		/**
		 * 返回此实例中的绘图对象（ <code>Graphics</code> ）的显示区域，不包括子对象。
		 * @param realSize （可选）使用图片的真实大小，默认为false
		 * @return 一个 Rectangle 对象，表示获取到的显示区域。
		 */
		public function getGraphicBounds(realSize:Boolean = null):Rectangle{
			return null;
		}

		/**
		 * @private 获取样式。
		 * @return 样式 Style 。
		 */
		public function getStyle():SpriteStyle{
			return null;
		}

		/**
		 * @private 设置样式。
		 * @param value 样式。
		 */
		public function setStyle(value:SpriteStyle):void{}

		/**
		 * X轴缩放值，默认值为1。设置为负数，可以实现水平反转效果，比如scaleX=-1。
		 */
		public var scaleX:Number;

		/**
		 * Y轴缩放值，默认值为1。设置为负数，可以实现垂直反转效果，比如scaleX=-1。
		 */
		public var scaleY:Number;
		public function set_scaleX(value:Number):void{}
		public function get_scaleX():Number{
			return null;
		}
		public function set_scaleY(value:Number):void{}
		public function get_scaleY():Number{
			return null;
		}

		/**
		 * 旋转角度，默认值为0。以角度为单位。
		 */
		public var rotation:Number;

		/**
		 * 水平倾斜角度，默认值为0。以角度为单位。
		 */
		public var skewX:Number;

		/**
		 * 垂直倾斜角度，默认值为0。以角度为单位。
		 */
		public var skewY:Number;

		/**
		 * @private 
		 */
		protected function _adjustTransform():Matrix{
			return null;
		}

		/**
		 * <p>对象的矩阵信息。通过设置矩阵可以实现节点旋转，缩放，位移效果。</p>
		 * <p>矩阵更多信息请参考 <code>Matrix</code></p>
		 */
		public var transform:Matrix;
		public function get_transform():Matrix{
			return null;
		}
		public function set_transform(value:Matrix):void{}

		/**
		 * X轴 轴心点的位置，单位为像素，默认为0。轴心点会影响对象位置，缩放中心，旋转中心。
		 */
		public var pivotX:Number;

		/**
		 * Y轴 轴心点的位置，单位为像素，默认为0。轴心点会影响对象位置，缩放中心，旋转中心。
		 */
		public var pivotY:Number;

		/**
		 * 透明度，值为0-1，默认值为1，表示不透明。更改alpha值会影响drawcall。
		 */
		public var alpha:Number;

		/**
		 * 表示是否可见，默认为true。如果设置不可见，节点将不被渲染。
		 */
		public var visible:Boolean;
		public function get_visible():Boolean{
			return null;
		}
		public function set_visible(value:Boolean):void{}

		/**
		 * 指定要使用的混合模式。目前只支持"lighter"。
		 */
		public var blendMode:String;

		/**
		 * 绘图对象。封装了绘制位图和矢量图的接口，Sprite所有的绘图操作都通过Graphics来实现的。
		 */
		public var graphics:Graphics;

		/**
		 * <p>显示对象的滚动矩形范围，具有裁剪效果(如果只想限制子对象渲染区域，请使用viewport)</p>
		 * <p> srollRect和viewport的区别：<br/>
		 * 1.srollRect自带裁剪效果，viewport只影响子对象渲染是否渲染，不具有裁剪效果（性能更高）。<br/>
		 * 2.设置rect的x,y属性均能实现区域滚动效果，但scrollRect会保持0,0点位置不变。</p>
		 */
		public var scrollRect:Rectangle;

		/**
		 * <p>设置坐标位置。相当于分别设置x和y属性。</p>
		 * <p>因为返回值为Sprite对象本身，所以可以使用如下语法：spr.pos(...).scale(...);</p>
		 * @param x X轴坐标。
		 * @param y Y轴坐标。
		 * @param speedMode （可选）是否极速模式，正常是调用this.x=value进行赋值，极速模式直接调用内部函数处理，如果未重写x,y属性，建议设置为急速模式性能更高。
		 * @return 返回对象本身。
		 */
		public function pos(x:Number,y:Number,speedMode:Boolean = null):Sprite{
			return null;
		}

		/**
		 * <p>设置轴心点。相当于分别设置pivotX和pivotY属性。</p>
		 * <p>因为返回值为Sprite对象本身，所以可以使用如下语法：spr.pivot(...).pos(50, 100);</p>
		 * @param x X轴心点。
		 * @param y Y轴心点。
		 * @return 返回对象本身。
		 */
		public function pivot(x:Number,y:Number):Sprite{
			return null;
		}

		/**
		 * <p>设置宽高。相当于分别设置width和height属性。</p>
		 * <p>因为返回值为Sprite对象本身，所以可以使用如下语法：spr.size(...).pos(50, 100);</p>
		 * @param width 宽度值。
		 * @param hegiht 高度值。
		 * @return 返回对象本身。
		 */
		public function size(width:Number,height:Number):Sprite{
			return null;
		}

		/**
		 * <p>设置缩放。相当于分别设置scaleX和scaleY属性。</p>
		 * <p>因为返回值为Sprite对象本身，所以可以使用如下语法：spr.scale(...).pos(50, 100);</p>
		 * @param scaleX X轴缩放比例。
		 * @param scaleY Y轴缩放比例。
		 * @param speedMode （可选）是否极速模式，正常是调用this.scaleX=value进行赋值，极速模式直接调用内部函数处理，如果未重写scaleX,scaleY属性，建议设置为急速模式性能更高。
		 * @return 返回对象本身。
		 */
		public function scale(scaleX:Number,scaleY:Number,speedMode:Boolean = null):Sprite{
			return null;
		}

		/**
		 * <p>设置倾斜角度。相当于分别设置skewX和skewY属性。</p>
		 * <p>因为返回值为Sprite对象本身，所以可以使用如下语法：spr.skew(...).pos(50, 100);</p>
		 * @param skewX 水平倾斜角度。
		 * @param skewY 垂直倾斜角度。
		 * @return 返回对象本身
		 */
		public function skew(skewX:Number,skewY:Number):Sprite{
			return null;
		}

		/**
		 * 更新、呈现显示对象。由系统调用。
		 * @param context 渲染的上下文引用。
		 * @param x X轴坐标。
		 * @param y Y轴坐标。
		 */
		public function render(ctx:Context,x:Number,y:Number):void{}

		/**
		 * <p>绘制 当前<code>Sprite</code> 到 <code>Canvas</code> 上，并返回一个HtmlCanvas。</p>
		 * <p>绘制的结果可以当作图片源，再次绘制到其他Sprite里面，示例：</p>
		 * 
		 * var htmlCanvas:HTMLCanvas = sprite.drawToCanvas(100, 100, 0, 0);//把精灵绘制到canvas上面
		 * var sp:Sprite = new Sprite();//创建精灵
		 * sp.graphics.drawTexture(htmlCanvas.getTexture());//把截图绘制到精灵上
		 * Laya.stage.addChild(sp);//把精灵显示到舞台
		 * 
		 * <p>也可以获取原始图片数据，分享到网上，从而实现截图效果，示例：</p>
		 * 
		 * var htmlCanvas:HTMLCanvas = sprite.drawToCanvas(100, 100, 0, 0);//把精灵绘制到canvas上面
		 * htmlCanvas.toBase64("image/png",0.9);//打印图片base64信息，可以发给服务器或者保存为图片
		 * @param canvasWidth 画布宽度。
		 * @param canvasHeight 画布高度。
		 * @param x 绘制的 X 轴偏移量。
		 * @param y 绘制的 Y 轴偏移量。
		 * @return HTMLCanvas 对象。
		 */
		public function drawToCanvas(canvasWidth:Number,canvasHeight:Number,offsetX:Number,offsetY:Number):HTMLCanvas{
			return null;
		}

		/**
		 * 绘制到一个Texture对象
		 * @param canvasWidth 
		 * @param canvasHeight 
		 * @param offsetX 
		 * @param offsetY 
		 */
		public function drawToTexture(canvasWidth:Number,canvasHeight:Number,offsetX:Number,offsetY:Number,rt:RenderTexture2D = null):*{}

		/**
		 * 把当前对象渲染到指定的贴图上。贴图由外部指定，避免每次都创建。
		 * @param offx 
		 * @param offy 
		 * @param tex 输出渲染结果
		 */
		public function drawToTexture3D(offx:Number,offy:Number,tex:Texture2D):void{}

		/**
		 * @private 绘制到画布。
		 */
		public static function drawToCanvas(sprite:Sprite,_renderType:Number,canvasWidth:Number,canvasHeight:Number,offsetX:Number,offsetY:Number):HTMLCanvas{
			return null;
		}
		public static var drawtocanvCtx:Context;

		/**
		 * @private 
		 */
		public static function drawToTexture(sprite:Sprite,_renderType:Number,canvasWidth:Number,canvasHeight:Number,offsetX:Number,offsetY:Number,rt:RenderTexture2D = null):*{}

		/**
		 * <p>自定义更新、呈现显示对象。一般用来扩展渲染模式，请合理使用，可能会导致在加速器上无法渲染。</p>
		 * <p><b>注意</b>不要在此函数内增加或删除树节点，否则会对树节点遍历造成影响。</p>
		 * @param context 渲染的上下文引用。
		 * @param x X轴坐标。
		 * @param y Y轴坐标。
		 */
		public function customRender(context:Context,x:Number,y:Number):void{}

		/**
		 * 滤镜集合。可以设置多个滤镜组合。
		 */
		public var filters:Array;

		/**
		 * 把本地坐标转换为相对stage的全局坐标。
		 * @param point 本地坐标点。
		 * @param createNewPoint （可选）是否创建一个新的Point对象作为返回值，默认为false，使用输入的point对象返回，减少对象创建开销。
		 * @param globalNode global节点，默认为Laya.stage
		 * @return 转换后的坐标的点。
		 */
		public function localToGlobal(point:Point,createNewPoint:Boolean = null,globalNode:Sprite = null):Point{
			return null;
		}

		/**
		 * 把stage的全局坐标转换为本地坐标。
		 * @param point 全局坐标点。
		 * @param createNewPoint （可选）是否创建一个新的Point对象作为返回值，默认为false，使用输入的point对象返回，减少对象创建开销。
		 * @param globalNode global节点，默认为Laya.stage
		 * @return 转换后的坐标的点。
		 */
		public function globalToLocal(point:Point,createNewPoint:Boolean = null,globalNode:Sprite = null):Point{
			return null;
		}

		/**
		 * 将本地坐标系坐标转转换到父容器坐标系。
		 * @param point 本地坐标点。
		 * @return 转换后的点。
		 */
		public function toParentPoint(point:Point):Point{
			return null;
		}

		/**
		 * 将父容器坐标系坐标转换到本地坐标系。
		 * @param point 父容器坐标点。
		 * @return 转换后的点。
		 */
		public function fromParentPoint(point:Point):Point{
			return null;
		}

		/**
		 * 将Stage坐标系坐标转换到本地坐标系。
		 * @param point 父容器坐标点。
		 * @return 转换后的点。
		 */
		public function fromStagePoint(point:Point):Point{
			return null;
		}

		/**
		 * <p>增加事件侦听器，以使侦听器能够接收事件通知。</p>
		 * <p>如果侦听鼠标事件，则会自动设置自己和父亲节点的属性 mouseEnabled 的值为 true(如果父节点mouseEnabled=false，则停止设置父节点mouseEnabled属性)。</p>
		 * @param type 事件的类型。
		 * @param caller 事件侦听函数的执行域。
		 * @param listener 事件侦听函数。
		 * @param args （可选）事件侦听函数的回调参数。
		 * @return 此 EventDispatcher 对象。
		 * @override 
		 */
		override public function on(type:String,caller:*,listener:Function,args:Array = null):EventDispatcher{
			return null;
		}

		/**
		 * <p>增加事件侦听器，以使侦听器能够接收事件通知，此侦听事件响应一次后则自动移除侦听。</p>
		 * <p>如果侦听鼠标事件，则会自动设置自己和父亲节点的属性 mouseEnabled 的值为 true(如果父节点mouseEnabled=false，则停止设置父节点mouseEnabled属性)。</p>
		 * @param type 事件的类型。
		 * @param caller 事件侦听函数的执行域。
		 * @param listener 事件侦听函数。
		 * @param args （可选）事件侦听函数的回调参数。
		 * @return 此 EventDispatcher 对象。
		 * @override 
		 */
		override public function once(type:String,caller:*,listener:Function,args:Array = null):EventDispatcher{
			return null;
		}

		/**
		 * @private 
		 */
		protected function _onDisplay(v:Boolean = null):void{}

		/**
		 * @private 
		 * @override 
		 */
		override protected function _setParent(value:Node):void{}

		/**
		 * <p>加载并显示一个图片。相当于加载图片后，设置texture属性</p>
		 * <p>注意：2.0改动：多次调用，只会显示一个图片（1.0会显示多个图片）,x,y,width,height参数取消。</p>
		 * @param url 图片地址。
		 * @param complete （可选）加载完成回调。
		 * @return 返回精灵对象本身。
		 */
		public function loadImage(url:String,complete:Handler = null):Sprite{
			return null;
		}

		/**
		 * 根据图片地址创建一个新的 <code>Sprite</code> 对象用于加载并显示此图片。
		 * @param url 图片地址。
		 * @return 返回新的 <code>Sprite</code> 对象。
		 */
		public static function fromImage(url:String):Sprite{
			return null;
		}

		/**
		 * cacheAs后，设置自己和父对象缓存失效。
		 */
		public function repaint(type:Number = null):void{}

		/**
		 * @private 
		 * @override 
		 */
		override protected function _childChanged(child:Node = null):void{}

		/**
		 * cacheAs时，设置所有父对象缓存失效。
		 */
		public function parentRepaint(type:Number = null):void{}

		/**
		 * 对舞台 <code>stage</code> 的引用。
		 */
		public function get stage():Stage{
				return null;
		}

		/**
		 * <p>可以设置一个Rectangle区域作为点击区域，或者设置一个<code>HitArea</code>实例作为点击区域，HitArea内可以设置可点击和不可点击区域。</p>
		 * <p>如果不设置hitArea，则根据宽高形成的区域进行碰撞。</p>
		 */
		public var hitArea:*;

		/**
		 * <p>遮罩，可以设置一个对象(支持位图和矢量图)，根据对象形状进行遮罩显示。</p>
		 * <p>【注意】遮罩对象坐标系是相对遮罩对象本身的，和Flash机制不同</p>
		 */
		public var mask:Sprite;

		/**
		 * 是否接受鼠标事件。
		 * 默认为false，如果监听鼠标事件，则会自动设置本对象及父节点的属性 mouseEnable 的值都为 true（如果父节点手动设置为false，则不会更改）。
		 */
		public var mouseEnabled:Boolean;

		/**
		 * 开始拖动此对象。
		 * @param area （可选）拖动区域，此区域为当前对象注册点活动区域（不包括对象宽高），可选。
		 * @param hasInertia （可选）鼠标松开后，是否还惯性滑动，默认为false，可选。
		 * @param elasticDistance （可选）橡皮筋效果的距离值，0为无橡皮筋效果，默认为0，可选。
		 * @param elasticBackTime （可选）橡皮筋回弹时间，单位为毫秒，默认为300毫秒，可选。
		 * @param data （可选）拖动事件携带的数据，可选。
		 * @param disableMouseEvent （可选）禁用其他对象的鼠标检测，默认为false，设置为true能提高性能。
		 * @param ratio （可选）惯性阻尼系数，影响惯性力度和时长。
		 */
		public function startDrag(area:Rectangle = null,hasInertia:Boolean = null,elasticDistance:Number = null,elasticBackTime:Number = null,data:* = null,disableMouseEvent:Boolean = null,ratio:Number = null):void{}

		/**
		 * 停止拖动此对象。
		 */
		public function stopDrag():void{}

		/**
		 * 检测某个点是否在此对象内。
		 * @param x 全局x坐标。
		 * @param y 全局y坐标。
		 * @return 表示是否在对象内。
		 */
		public function hitTestPoint(x:Number,y:Number):Boolean{
			return null;
		}

		/**
		 * 获得相对于本对象上的鼠标坐标信息。
		 */
		public function getMousePoint():Point{
			return null;
		}

		/**
		 * 获得相对于stage的全局X轴缩放值（会叠加父亲节点的缩放值）。
		 */
		public function get globalScaleX():Number{
				return null;
		}

		/**
		 * 获得相对于stage的全局旋转值（会叠加父亲节点的旋转值）。
		 */
		public function get globalRotation():Number{
				return null;
		}

		/**
		 * 获得相对于stage的全局Y轴缩放值（会叠加父亲节点的缩放值）。
		 */
		public function get globalScaleY():Number{
				return null;
		}

		/**
		 * 返回鼠标在此对象坐标系上的 X 轴坐标信息。
		 */
		public function get mouseX():Number{
				return null;
		}

		/**
		 * 返回鼠标在此对象坐标系上的 Y 轴坐标信息。
		 */
		public function get mouseY():Number{
				return null;
		}

		/**
		 * z排序，更改此值，则会按照值的大小对同一容器的所有对象重新排序。值越大，越靠上。默认为0，则根据添加顺序排序。
		 */
		public var zOrder:Number;

		/**
		 * 设置一个Texture实例，并显示此图片（如果之前有其他绘制，则会被清除掉）。
		 * 等同于graphics.clear();graphics.drawImage()，但性能更高
		 * 还可以赋值一个图片地址，则会自动加载图片，然后显示
		 */
		public var texture:Texture;

		/**
		 * <p>视口大小，视口外的子对象，将不被渲染(如果想实现裁剪效果，请使用srollRect)，合理使用能提高渲染性能。比如由一个个小图片拼成的地图块，viewport外面的小图片将不渲染</p>
		 * <p>srollRect和viewport的区别：<br/>
		 * 1. srollRect自带裁剪效果，viewport只影响子对象渲染是否渲染，不具有裁剪效果（性能更高）。<br/>
		 * 2. 设置rect的x,y属性均能实现区域滚动效果，但scrollRect会保持0,0点位置不变。</p>
		 * @default null
		 */
		public var viewport:Rectangle;

		/**
		 * @private 
		 */
		public function captureMouseEvent(exclusive:Boolean):void{}

		/**
		 * @private 
		 */
		public function releaseMouseEvent():void{}
		public var drawCallOptimize:Boolean;
	}

}
