import { Sprite_DisplayImage } from "./../2d/Sprite_DisplayImage";
import { Sprite_Container } from "./../2d/Sprite_Container";
import { Sprite_RoateAndScale } from "./../2d/Sprite_RoateAndScale";
import { Sprite_DrawPath } from "./../2d/Sprite_DrawPath";
import { Sprite_MagnifyingGlass } from "./../2d/Sprite_MagnifyingGlass";
import { Sprite_DrawShapes } from "./../2d/Sprite_DrawShapes";
import { Sprite_Cache } from "./../2d/Sprite_Cache";
import { Sprite_NodeControl } from "./../2d/Sprite_NodeControl";
import { Sprite_Pivot } from "./../2d/Sprite_Pivot";
import { Sprite_SwitchTexture } from "./../2d/Sprite_SwitchTexture";
import { Animation_SWF } from "./../2d/Animation_SWF";
import { Animation_Altas } from "./../2d/Animation_Altas";
import { Skeleton_MultiTexture } from "./../2d/Skeleton_MultiTexture";
import { Skeleton_SpineEvent } from "./../2d/Skeleton_SpineEvent";
import { Skeleton_SpineIkMesh } from "./../2d/Skeleton_SpineIkMesh";
import { Skeleton_SpineVine } from "./../2d/Skeleton_SpineVine";
import { Skeleton_ChangeSkin } from "./../2d/Skeleton_ChangeSkin";
import { BlendMode_Lighter } from "./../2d/BlendMode_Lighter";
import { TiledMap_AnimationTile } from "./../2d/TiledMap_AnimationTile";
import { TiledMap_IsometricWorld } from "./../2d/TiledMap_IsometricWorld";
import { TiledMap_PerspectiveWall } from "./../2d/TiledMap_PerspectiveWall";
import { TiledMap_ScrollMap } from "./../2d/TiledMap_ScrollMap";
import { Filters_Glow } from "./../2d/Filters_Glow";
import { Filters_Blur } from "./../2d/Filters_Blur";
import { Filters_Color } from "./../2d/Filters_Color";
import { Particle_T1 } from "./../2d/Particle_T1";
import { Particle_T2 } from "./../2d/Particle_T2";
import { Particle_T3 } from "./../2d/Particle_T3";
import { Sound_SimpleDemo } from "./../2d/Sound_SimpleDemo";
import { Text_AutoSize } from "./../2d/Text_AutoSize";
import { Text_ComplexStyle } from "./../2d/Text_ComplexStyle";
import { Text_Editable } from "./../2d/Text_Editable";
import { Text_Overflow } from "./../2d/Text_Overflow";
import { Text_Underline } from "./../2d/Text_Underline";
import { Text_InputSingleline } from "./../2d/Text_InputSingleline";
import { Text_InputMultiline } from "./../2d/Text_InputMultiline";
import { Text_MaxChars } from "./../2d/Text_MaxChars";
import { Text_Restrict } from "./../2d/Text_Restrict";
import { Text_Scroll } from "./../2d/Text_Scroll";
import { Text_WordWrap } from "./../2d/Text_WordWrap";
import { Text_BitmapFont } from "./../2d/Text_BitmapFont";
import { Text_HTML } from "./../2d/Text_HTML";
import { UI_Label } from "./../2d/UI_Label";
import { UI_Button } from "./../2d/UI_Button";
import { UI_RadioGroup } from "./../2d/UI_RadioGroup";
import { UI_CheckBox } from "./../2d/UI_CheckBox";
import { UI_Clip } from "./../2d/UI_Clip";
import { UI_ColorPicker } from "./../2d/UI_ColorPicker";
import { UI_ComboBox } from "./../2d/UI_ComboBox";
import { UI_Dialog } from "./../2d/UI_Dialog";
import { UI_ScrollBar } from "./../2d/UI_ScrollBar";
import { UI_Slider } from "./../2d/UI_Slider";
import { UI_Image } from "./../2d/UI_Image";
import { UI_List } from "./../2d/UI_List";
import { UI_ProgressBar } from "./../2d/UI_ProgressBar";
import { UI_Tab } from "./../2d/UI_Tab";
import { UI_Input } from "./../2d/UI_Input";
import { UI_TextArea } from "./../2d/UI_TextArea";
import { UI_Tree } from "./../2d/UI_Tree";
import { Timer_CallLater } from "./../2d/Timer_CallLater";
import { Timer_DelayExcute } from "./../2d/Timer_DelayExcute";
import { Timer_Interval } from "./../2d/Timer_Interval";
import { Tween_SimpleSample } from "./../2d/Tween_SimpleSample";
import { Tween_Letters } from "./../2d/Tween_Letters";
import { Tween_EaseFunctionsDemo } from "./../2d/Tween_EaseFunctionsDemo";
import { Tween_TimeLine } from "./../2d/Tween_TimeLine";
import { Interaction_Hold } from "./../2d/Interaction_Hold";
import { Interaction_Drag } from "./../2d/Interaction_Drag";
import { Interaction_Rotate } from "./../2d/Interaction_Rotate";
import { Interaction_Scale } from "./../2d/Interaction_Scale";
import { Interaction_Swipe } from "./../2d/Interaction_Swipe";
import { Interaction_CustomEvent } from "./../2d/Interaction_CustomEvent";
import { Interaction_Mouse } from "./../2d/Interaction_Mouse";
import { Interaction_FixInteractiveRegion } from "./../2d/Interaction_FixInteractiveRegion";
import { SmartScale_Scale_EXTRACT_FIT } from "./../2d/SmartScale_Scale_EXTRACT_FIT";
import { SmartScale_Scale_NOBORDER } from "./../2d/SmartScale_Scale_NOBORDER";
import { SmartScale_Scale_SHOW_ALL } from "./../2d/SmartScale_Scale_SHOW_ALL";
import { SmartScale_T } from "./../2d/SmartScale_T";
import { Network_POST } from "./../2d/Network_POST";
import { Network_GET } from "./../2d/Network_GET";
import { Network_XML } from "./../2d/Network_XML";
import { Network_Socket } from "./../2d/Network_Socket";
import { Network_Socket2 } from "./../2d/Network_Socket2";
import { Debug_FPSStats } from "./../2d/Debug_FPSStats";
import { PerformanceTest_Maggots } from "./../2d/PerformanceTest_Maggots";
import { PerformanceTest_Cartoon } from "./../2d/PerformanceTest_Cartoon";
import { PerformanceTest_Cartoon2 } from "./../2d/PerformanceTest_Cartoon2";
import { PerformanceTest_Skeleton } from "./../2d/PerformanceTest_Skeleton";
import { Skeleton_SpineAdapted } from "../2d/Skeleton_SpineAdapted";
import { IDE_Project } from "./../2d/IDE_Project";
import { Laya } from "Laya";
import { Event } from "laya/events/Event"
import { Button } from "laya/ui/Button"
import { Handler } from "laya/utils/Handler"
import { IndexViewUI } from "../ui/IndexViewUI"
import { Sprite } from "laya/display/Sprite";
import { Main } from "../Main";
import Sprite_ScreenShot from "../2d/Sprite_ScreenShot";
import { Physics_Tumbler } from "../2d/PhySics_Tumbler";
import { Physics_CollisionFiltering } from "../2d/Physics_CollisionFiltering";
import { Physics_Strandbeests } from "../2d/Physics_Strandbeests";
import { Physics_Bridge } from "../2d/Physics_Bridge";
import { Physics_CollisionEvent } from "../2d/Physics_CollisionEvent";
import { Utils } from "laya/utils/Utils";
import Client from "../Client";
import { UI_FontClip } from "../2d/UI_FontClip";
import { ScrollType } from "laya/ui/Styles";
import { Browser } from "laya/utils/Browser";

/**
 * 首页View 
 * @author xiaosong
 */
export class IndexView2D extends IndexViewUI {
	private box2d: Sprite;
	private btn: Button;
	private btnOn: boolean = false;
	private a_length: number;
	private b_length: number;
	private m_length: number;

	//---------------------------------------------------------------------------------2D------------开始---------------------------------------------
	// 'IDE'去掉
	private _comboxBigArr: any[] = ['Sprite', '动画', '骨骼动画', '混合模式', '区块地图', '滤镜', '粒子', '音频', '文本', 'UI', '计时器', '缓动', '鼠标交互', '屏幕适配', '网络和格式', '调试', '性能测试', '物理'];
	/************************sprite-start***************************/
	private _comboBoxSpriteClsArr: any[] = [Sprite_DisplayImage, Sprite_Container, Sprite_RoateAndScale, Sprite_DrawPath, Sprite_MagnifyingGlass, Sprite_DrawShapes, Sprite_Cache, Sprite_NodeControl, Sprite_Pivot, Sprite_SwitchTexture, Sprite_ScreenShot];
	private _comboBoxSpriteArr: any[] = ['显示图片', '容器', '旋转缩放', '根据数据绘制路径', '遮罩-放大镜', '绘制各种形状', '缓存为静态图像', '节点控制', '轴中心', '切换纹理', '截图'];
	/************************sprite-end***************************/

	/************************Animation-start***************************/
	private _comboBoxAnimationClsArr: any[] = [Animation_SWF, Animation_Altas];
	private _comboBoxAnimationArr: any[] = ['SWF动画', '图集动画'];
	/************************Animation-end***************************/

	/************************Skeleton-start***************************/
	private _comboBoxSkeletonClsArr: any[] = [Skeleton_MultiTexture, Skeleton_SpineEvent, Skeleton_SpineIkMesh, Skeleton_SpineVine, Skeleton_ChangeSkin, Skeleton_SpineAdapted];
	private _comboBoxSkeletonArr: any[] = ['多纹理', 'Spine事件', '橡胶人', '藤蔓', '换装', 'SpineDemo'];
	/************************Skeleton-end***************************/

	/************************BlendMode-start***************************/
	private _comboBoxBlendModeClsArr: any[] = [BlendMode_Lighter];
	private _comboBoxBlendModeArr: any[] = ['Lighter'];
	/************************BlendMode-end***************************/

	/************************TiledMap-start***************************/
	private _comboBoxTiledMapClsArr: any[] = [TiledMap_AnimationTile, TiledMap_IsometricWorld, TiledMap_PerspectiveWall, TiledMap_ScrollMap];
	private _comboBoxTiledMapArr: any[] = ['带动画的地图', '等角地图', 'PerspectiveWall', '滚动地图'];
	/************************TiledMap-end***************************/

	/************************Filters-start***************************/
	private _comboBoxFiltersClsArr: any[] = [Filters_Glow, Filters_Blur, Filters_Color];
	private _comboBoxFiltersArr: any[] = ['发光滤镜', '模糊滤镜', '颜色滤镜'];
	/************************Filters-end***************************/

	/************************Particle-start***************************/
	private _comboBoxParticleClsArr: any[] = [Particle_T1, Particle_T2, Particle_T3];
	private _comboBoxParticleArr: any[] = ['粒子演示1', '粒子演示2', '粒子演示3'];
	/************************Particle-end***************************/

	/************************Sound-start***************************/
	private _comboBoxSoundClsArr: any[] = [Sound_SimpleDemo];
	private _comboBoxSoundArr: any[] = ['播放演示'];
	/************************Sound-end***************************/

	/************************Text-start***************************/
	private _comboBoxTextClsArr: any[] = [Text_AutoSize, Text_ComplexStyle, Text_Editable, Text_Overflow, Text_Underline, Text_InputSingleline, Text_InputMultiline, Text_MaxChars, Text_Restrict, Text_Scroll, Text_WordWrap, Text_BitmapFont, Text_HTML];
	private _comboBoxTextArr: any[] = ['自动调整文本尺寸', '复杂的文本样式', '禁止编辑', 'Overflow', '下划线', '单行输入', '多行输入', '字数限制', '字符限制', '滚动文本', '自动换行', '位图字体', 'HTML文本'];
	/************************Text-end***************************/

	/************************UI-start***************************/
	private _comboBoxUIClsArr: any[] = [UI_Label, UI_Button, UI_RadioGroup, UI_CheckBox, UI_Clip, UI_FontClip, UI_ColorPicker, UI_ComboBox, UI_Dialog, UI_ScrollBar, UI_Slider, UI_Image, UI_List, UI_ProgressBar, UI_Tab, UI_Input, UI_TextArea, UI_Tree];
	private _comboBoxUIArr: any[] = ['Label', 'Button', 'RadioGroup', 'CheckBox', 'Clip', 'FontClip', 'ColorPicker', 'ComboBox', 'Dialog', 'ScrollBar', 'Slider', 'Image', 'List', 'ProgressBar', 'Tab', 'Input', 'TextArea', 'Tree'];
	/************************UI-end***************************/

	/************************Timer-start***************************/
	private _comboBoxTimerClsArr: any[] = [Timer_CallLater, Timer_DelayExcute, Timer_Interval];
	private _comboBoxTimerArr: any[] = ['延迟调用', '延迟执行', '间隔循环'];
	/************************Timer-end***************************/

	/************************Tween-start***************************/
	private _comboBoxTweenClsArr: any[] = [Tween_SimpleSample, Tween_Letters, Tween_EaseFunctionsDemo, Tween_TimeLine];
	private _comboBoxTweenArr: any[] = ['简单的Tween', '逐字缓动', '缓动函数演示', '时间线'];
	/************************Tween-end***************************/

	/************************Interaction-start***************************/
	private _comboBoxInteractionClsArr: any[] = [Interaction_Hold, Interaction_Drag, Interaction_Rotate, Interaction_Scale, Interaction_Swipe, Interaction_CustomEvent, Interaction_Mouse, Interaction_FixInteractiveRegion];
	private _comboBoxInteractionArr: any[] = ['Hold', '拖动', '双指旋转（多点触控）', '双指缩放（多点触控）', '滑动', '自定义事件', '鼠标交互', '修正交互区域'];
	/************************Interaction-end***************************/

	/************************SmartScale-start***************************/
	private _comboBoxSmartScaleClsArr: any[] = [SmartScale_Scale_EXTRACT_FIT, SmartScale_Scale_NOBORDER, SmartScale_Scale_SHOW_ALL, SmartScale_T];
	private _comboBoxSmartScaleArr: any[] = ['缩放-Extract Fit', '缩放-No Border', '缩放-Show All', '屏幕适配'];
	/************************SmartScale-end***************************/

	/************************Network-start***************************/
	private _comboBoxNetworkClsArr: any[] = [Network_POST, Network_GET, Network_XML, Network_Socket, Network_Socket2];
	private _comboBoxNetworkArr: any[] = ['POST', 'GET', 'XML', 'Websocket', 'Websocket-WSS'];
	/************************Network-end***************************/

	/************************Debug-start***************************/
	private _comboBoxDebugClsArr: any[] = [Debug_FPSStats];
	private _comboBoxDebugArr: any[] = ['Debug'];
	/************************Debug-end***************************/

	/************************PerformanceTest-start***************************/
	private _comboBoxPerformanceTestClsArr: any[] = [PerformanceTest_Maggots, PerformanceTest_Cartoon, PerformanceTest_Cartoon2, PerformanceTest_Skeleton];
	private _comboBoxPerformanceTestArr: any[] = ['虫子(慎入)', '卡通人物', '卡通人物2', '骨骼'];
	/************************PerformanceTest-end***************************/

	/************************IDE-start***************************/
	private _comboBoxIDEClsArr: any[] = [IDE_Project];
	private _comboBoxIDEArr: any[] = ['显示IDE创建的界面'];
	/************************IDE-end***************************/

	/************************Particle-start***************************/
	private _comboBoxPhysicsClsArr: any[] = [Physics_Tumbler, Physics_CollisionFiltering, Physics_CollisionEvent, Physics_Bridge, Physics_Strandbeests];
	private _comboBoxPhysicsArr: any[] = ['复合碰撞器', '碰撞过滤器', '碰撞事件与传感器', '桥', '仿生机器人'];
	/************************Particle-end***************************/

	//private _VIPClsArr:any[] = [VIPMergeBinary_as,VIPMergeText,VIPTexturetrans_as_a,VIPTexturetrans_as_b];
	private _VIPArr: any[] = ['VIP_MergeBinary', "VIP_MergeText", "VIP_Texturetrans_a", "VIP_Texturetrans_b"];

	private _bigIndex: number = -1;
	private _smallIndex: number;
	private _oldView: any;
	private Main: typeof Main;
	constructor(box: Sprite, MainCls: typeof Main) {
		super();
		this.Main = MainCls;
		this.box2d = box;
		this.initView();
		this.initEvent();
		this.zOrder = 99999;
	}

	private initView(): void {
		var lables: string = this._comboxBigArr.toString()
		this.bigComBox.labels = lables;
		this.bigComBox.selectedIndex = 0;
		this.bigComBox.visibleNum = 5;//_comboxBigArr.length;
		this.bigComBox.list.scrollType = ScrollType.Vertical;
		this.bigComBox.autoSize = false;
		this.bigComBox.list.selectEnable = true;
		this.bigComBox.width = 230;
		this.bigComBox.height = 50;
		this.bigComBox.labelSize = 35;
		this.bigComBox.itemSize = 30;

		this.smallComBox.x = this.bigComBox.x + this.bigComBox.width + 20;

		this.smallComBox.labels = this._comboBoxSpriteArr.toString();
		this.smallComBox.selectedIndex = 0;
		//默认显示第一项
		//onSmallBoxSelectHandler(0);
		this.smallComBox.list.scrollType = ScrollType.Vertical;
		this.smallComBox.visibleNum = 5;//_comboBoxSpriteArr.length;
		this.smallComBox.list.selectEnable = true;
		this.smallComBox.width = 260;
		this.smallComBox.height = 50;
		this.smallComBox.labelSize = 35;
		this.smallComBox.itemSize = 30;

		this.btn = new Button();
		this.btn.skin = "comp/vscroll$down.png"
		this.addChild(this.btn);
		this.btn.scale(4, 4);
		this.btn.bottom = -30;
		this.btn.right = -430;

		this.btn.on(Event.MOUSE_DOWN, this, this.nextBtn);
	}

	private nextBtn(): void {
		//_bigIndex += 1;
		var isMaster: any = Browser.getQueryString("isMaster");

		var i_length: number;
		this.a_length = this._bigIndex;
		if (this.smallComBox.selectedIndex == this.b_length) {
			this.a_length += 1;
			i_length = 0;
		}
		else {
			i_length = this.smallComBox.selectedIndex + 1;
		}
		var bigType: number = this.a_length;
		var smallType: number = i_length;
		if (Main.isOpenSocket && parseInt(isMaster) == 1) {
			//主控制推送
			Client.instance.send({ type: "next", bigType: bigType, smallType: smallType, isMaster: isMaster });
		} else {

			this.switchFunc(this.a_length, i_length);
		}
	}

	private initEvent(): void {

		this.bigComBox.selectHandler = new Handler(this, this.onBigComBoxSelectHandler);
		this.smallComBox.selectHandler = new Handler(this, this.onSmallBoxSelectHandler);
		Laya.stage.on("next", this, this.onNext);
	}

	onNext(data: any) {

		if (data.hasOwnProperty("bigType")) {
			//示例切换
			this.a_length = data.bigType;
			var smallType: number = data.smallType;
			this.switchFunc(this.a_length, smallType);
		}
		else {
			var isMaster: any = parseInt(Browser.getQueryString("isMaster")) || 0;
			if (isMaster) return;
			//示例内单独小类型切换
			this._oldView && this._oldView['stypeFun' + data.stype] && this._oldView['stypeFun' + data.stype](data.value);
		}
	}

	private onClearPreBox(): void {
		if (this._oldView && this._oldView['dispose']) {
			//debugger;
			Laya.timer.clearAll(this._oldView);
			Laya.stage.offAllCaller(this._oldView);
			this._oldView.dispose();
		}
		this._oldView = null;
		this.box2d.destroyChildren();
		//if (_oldView)
		//{
		//Laya.timer.clearAll(_oldView);
		//Laya.stage.offAllCaller(_oldView);
		//var i:int =Laya.stage.numChildren-1;
		//for (i; i>-1; i--)
		//{
		//if ((Laya.stage.getChildAt(i))== Main._indexView||(Laya.stage.getChildAt(i)) is List)
		//{
		////trace("__________________");
		//}
		//else if(Laya.stage.getChildAt(i))
		//{
		//Laya.stage.getChildAt(i).destroy();
		//}
		//}
		//}
	}

	private onSmallBoxSelectHandler(index: number): void {
		if (index < 0)
			return;
		if (this.btnOn && this.m_length != 0) {
			return;
		}
		var isMaster: any = parseInt(Browser.getQueryString("isMaster")) || 0;
		if (Main.isOpenSocket && !this.btnOn && isMaster) {
			this.onDirectSwitch();
		}
		this.m_length += 1;
		this.onClearPreBox();
		this._smallIndex = index;

		if (false) {
			this._oldView = new Timer_CallLater(this.Main);
		}
		else {
			switch (this._bigIndex) {
				case 0://sprite
					this._oldView = new this._comboBoxSpriteClsArr[index](this.Main);
					this.b_length = this._comboBoxSpriteClsArr.length - 1;
					break;
				case 1://Animation
					this._oldView = new this._comboBoxAnimationClsArr[index](this.Main);
					this.b_length = this._comboBoxAnimationClsArr.length - 1;
					break;
				case 2://Skeleton
					this._oldView = new this._comboBoxSkeletonClsArr[index](this.Main);
					this.b_length = this._comboBoxSkeletonClsArr.length - 1;
					break;
				case 3://BlendMode
					this._oldView = new this._comboBoxBlendModeClsArr[index](this.Main);
					this.b_length = this._comboBoxBlendModeClsArr.length - 1;
					break;
				case 4://TiledMap
					this._oldView = new this._comboBoxTiledMapClsArr[index](this.Main);
					this.b_length = this._comboBoxTiledMapClsArr.length - 1;
					break;
				case 5://Filters
					this._oldView = new this._comboBoxFiltersClsArr[index](this.Main);
					this.b_length = this._comboBoxFiltersClsArr.length - 1;
					break;
				case 6://Particle
					this._oldView = new this._comboBoxParticleClsArr[index](this.Main);
					this.b_length = this._comboBoxParticleClsArr.length - 1;
					break;
				case 7://Sound
					this._oldView = new this._comboBoxSoundClsArr[index](this.Main);
					this.b_length = this._comboBoxSoundClsArr.length - 1;
					break;
				case 8://Text
					this._oldView = new this._comboBoxTextClsArr[index](this.Main);
					this.b_length = this._comboBoxTextClsArr.length - 1;
					break;
				case 9://UI
					this._oldView = new this._comboBoxUIClsArr[index](this.Main);
					this.b_length = this._comboBoxUIClsArr.length - 1;
					break;
				case 10://Timer
					this._oldView = new this._comboBoxTimerClsArr[index](this.Main);
					this.b_length = this._comboBoxTimerClsArr.length - 1;
					break;
				case 11://Tween
					this._oldView = new this._comboBoxTweenClsArr[index](this.Main);
					this.b_length = this._comboBoxTweenClsArr.length - 1;
					break;
				case 12://Interaction
					this._oldView = new this._comboBoxInteractionClsArr[index](this.Main);
					this.b_length = this._comboBoxInteractionClsArr.length - 1;
					break;
				case 13://SmartScale
					this._oldView = new this._comboBoxSmartScaleClsArr[index](this.Main);
					this.b_length = this._comboBoxSmartScaleClsArr.length - 1;
					break;
				case 14://Network
					this._oldView = new this._comboBoxNetworkClsArr[index](this.Main);
					this.b_length = this._comboBoxNetworkClsArr.length - 1;
					break;
				case 15://Debug
					this._oldView = new this._comboBoxDebugClsArr[index](this.Main);
					this.b_length = this._comboBoxDebugClsArr.length - 1;
					break;
				case 16://PerformanceTest
					this._oldView = new this._comboBoxPerformanceTestClsArr[index](this.Main);
					this.b_length = this._comboBoxPerformanceTestClsArr.length - 1;
					break;
				case 17:// Physics
					this._oldView = new this._comboBoxPhysicsClsArr[index](this.Main);
					this.b_length = this._comboBoxPhysicsClsArr.length - 1;
					break;
				case 18://IDE
				// this._oldView = new this._comboBoxIDEClsArr[index](this.Main);
				// this.b_length = this._comboBoxIDEClsArr.length - 1;
				// break;
				default:
					break;
			}
			if (this._oldView) {
				(this._oldView as any).Main = this.Main;
			}
		}
	}

	switchFunc(bigListIndex: number, smallListIndex: number, isAutoSwitch: boolean = true): void {
		this.btnOn = true;
		this.m_length = 0;
		this.bigComBox.selectedIndex = bigListIndex;
		this.onBigComBoxSelectHandler(bigListIndex, smallListIndex, isAutoSwitch);
		this.btnOn = false;
	}

	private onBigComBoxSelectHandler(index: number, smallIndex: number = 0, isAutoSwitch: boolean = false): void {
		if (this._bigIndex != index) {
			var isMaster: any = parseInt(Browser.getQueryString("isMaster")) || 0;
			if (Main.isOpenSocket && !isAutoSwitch && isMaster) {
				this.onDirectSwitch();
				return;
			}
			this._bigIndex = index;
			var labelStr: string;
			switch (index) {
				case 0://sprite
					labelStr = this._comboBoxSpriteArr.toString();
					break;
				case 1://animiation
					labelStr = this._comboBoxAnimationArr.toString();
					break;
				case 2://animiation
					labelStr = this._comboBoxSkeletonArr.toString();
					break;
				case 3://BlendMode
					labelStr = this._comboBoxBlendModeArr.toString();
					break;
				case 4://TiledMap
					labelStr = this._comboBoxTiledMapArr.toString();
					break;
				case 5://Filters
					labelStr = this._comboBoxFiltersArr.toString();
					break;
				case 6://Particle
					labelStr = this._comboBoxParticleArr.toString();
					break;
				case 7://Sound
					labelStr = this._comboBoxSoundArr.toString();
					break;
				case 8://Text
					labelStr = this._comboBoxTextArr.toString();
					break;
				case 9://UI
					labelStr = this._comboBoxUIArr.toString();
					break;
				case 10://Timer
					labelStr = this._comboBoxTimerArr.toString();
					break;
				case 11://Tween
					labelStr = this._comboBoxTweenArr.toString();
					break;
				case 12://Interaction
					labelStr = this._comboBoxInteractionArr.toString();
					break;
				case 13://SmartScale
					labelStr = this._comboBoxSmartScaleArr.toString();
					break;
				case 14://Network
					labelStr = this._comboBoxNetworkArr.toString();
					break;
				case 15://Debug
					labelStr = this._comboBoxDebugArr.toString();
					break;
				case 16://PerformanceTest
					labelStr = this._comboBoxPerformanceTestArr.toString();
					break;
				case 17://Physics
					labelStr = this._comboBoxPhysicsArr.toString();
					break;
				// case 18://IDE
				// 	labelStr = this._comboBoxIDEArr.toString();
				// 	break;
			}
			this.smallComBox.labels = labelStr;
		}
		this.smallComBox.selectedIndex = smallIndex;
	}

	onDirectSwitch() {
		var smallType: number = this.smallComBox.selectedIndex;
		var bigType: number = this.bigComBox.selectedIndex;
		if (this._bigIndex != this.bigComBox.selectedIndex)
			smallType = 0;
		//主控制推送
		Client.instance.send({ type: "next", bigType: bigType, smallType: smallType });
	}

	private onRightBtnClick(): void {

	}

	private onLeftBtnClick(): void {

	}
}

