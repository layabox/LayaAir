	declare class Config  {
		static animationInterval:number;
		static isAntialias:boolean;
		static isAlpha:boolean;
		static premultipliedAlpha:boolean;
		static isStencil:boolean;
		static preserveDrawingBuffer:boolean;
		static webGL2D_MeshAllocMaxMem:boolean;
		static is2DPixelArtGame:boolean;
		static useWebGL2:boolean;
		static useRetinalCanvas:boolean;
	}
	declare class Config3D implements laya.d3.core.IClone  {
		static _default:Config3D;
		private _defaultPhysicsMemory:any;
		_editerEnvironment:boolean;
		isAntialias:boolean;
		isAlpha:boolean;
		premultipliedAlpha:boolean;
		isStencil:boolean;
		octreeCulling:boolean;
		octreeInitialSize:number;
		octreeInitialCenter:laya.d3.math.Vector3;
		octreeMinNodeSize:number;
		octreeLooseness:number;
		debugFrustumCulling:boolean;
		defaultPhysicsMemory:number;

		constructor();
		cloneTo(dest:any):void;
		clone():any;
	}
	declare class GCanvas  {
		static MainCanvas:laya.resource.HTMLCanvas;
		static MainCtx:laya.resource.Context;
		static canvas:laya.resource.HTMLCanvas;
		static context:laya.resource.Context;
	}
	declare class ILaya  {
		static Laya:any;
		static Timer:laya.utils.Timer;
		static WorkerLoader:laya.net.WorkerLoader;
		static Dragging:laya.utils.Dragging;
		static GraphicsBounds:laya.display.GraphicsBounds;
		static Sprite:laya.display.Sprite;
		static TextRender:laya.webgl.text.TextRender;
		static TextAtlas:laya.webgl.text.TextAtlas;
		static timer:laya.utils.Timer;
		static systemTimer:laya.utils.Timer;
		static startTimer:laya.utils.Timer;
		static updateTimer:laya.utils.Timer;
		static lateTimer:laya.utils.Timer;
		static physicsTimer:laya.utils.Timer;
		static stage:laya.display.Stage;
		static Loader:laya.net.Loader;
		static loader:laya.net.LoaderManager;
		static TTFLoader:laya.net.TTFLoader;
		static SoundManager:laya.media.SoundManager;
		static WebAudioSound:laya.media.webaudio.WebAudioSound;
		static AudioSound:laya.media.h5audio.AudioSound;
		static ShaderCompile:laya.webgl.utils.ShaderCompile;
		static ClassUtils:laya.utils.ClassUtils;
		static SceneUtils:laya.utils.SceneUtils;
		static Context:laya.resource.Context;
		static Render:laya.renders.Render;
		static MouseManager:laya.events.MouseManager;
		static Text:laya.display.Text;
		static Browser:laya.utils.Browser;
		static WebGL:laya.webgl.WebGL;
		static Pool:laya.utils.Pool;
		static Utils:laya.utils.Utils;
		static Graphics:laya.display.Graphics;
		static Submit:laya.webgl.submit.Submit;
		static Stage:laya.display.Stage;
		static Resource:laya.resource.Resource;
		static __classMap:Object;
		static regClass(c:any):void;
	}
	declare class Laya  {
		static stage:laya.display.Stage;
		static systemTimer:laya.utils.Timer;
		static startTimer:laya.utils.Timer;
		static physicsTimer:laya.utils.Timer;
		static updateTimer:laya.utils.Timer;
		static lateTimer:laya.utils.Timer;
		static timer:laya.utils.Timer;
		static loader:laya.net.LoaderManager;
		static version:string;
		static render:laya.renders.Render;
		static _currentStage:laya.display.Sprite;
		private static _isinit:any;
		static isWXOpenDataContext:boolean;
		static isWXPosMsg:boolean;
		static init(width:number,height:number,...plugins:any[]):any;
		static _getUrlPath():string;
		static _arrayBufferSlice(start:number,end:number):ArrayBuffer;
		static alertGlobalError:boolean;
		private static _evcode:any;
		static _runScript(script:string):any;
		static enableDebugPanel(debugJsPath?:string):void;
		private static isNativeRender_enable:any;
		private static enableNative:any;
	}

declare module laya {
	class Const  {
		static NOT_ACTIVE:number;
		static ACTIVE_INHIERARCHY:number;
		static AWAKED:number;
		static NOT_READY:number;
		static DISPLAY:number;
		static HAS_ZORDER:number;
		static HAS_MOUSE:number;
		static DISPLAYED_INSTAGE:number;
		static DRAWCALL_OPTIMIZE:number;
	}

}

declare module laya.ani {
	class IAniLib  {
		static Skeleton:laya.ani.bone.Skeleton;
		static AnimationTemplet:laya.ani.AnimationTemplet;
		static Templet:laya.ani.bone.Templet;
	}

}

declare module laya.components {
	class CommonScript extends laya.components.Component  {
		readonly isSingleton:boolean;

		constructor();
		onAwake():void;
		onEnable():void;
		onStart():void;
		onUpdate():void;
		onLateUpdate():void;
		onDisable():void;
		onDestroy():void;
	}

}
	declare class Laya3D  {
		static HIERARCHY:string;
		static MESH:string;
		static MATERIAL:string;
		static TEXTURE2D:string;
		static TEXTURECUBE:string;
		static ANIMATIONCLIP:string;
		static AVATAR:string;
		static TERRAINHEIGHTDATA:string;
		static TERRAINRES:string;
		private static _innerFirstLevelLoaderManager:any;
		private static _innerSecondLevelLoaderManager:any;
		private static _innerThirdLevelLoaderManager:any;
		private static _innerFourthLevelLoaderManager:any;
		private static _isInit:any;
		static _editerEnvironment:boolean;
		static _config:Config3D;
		static physicsSettings:laya.d3.physics.PhysicsSettings;
		static readonly enbalePhysics:any;
		static _cancelLoadByUrl(url:string):void;
		private static _changeWebGLSize:any;
		private static __init__:any;
		private static enableNative3D:any;
		private static formatRelativePath:any;
		private static _endLoad:any;
		private static _eventLoadManagerError:any;
		private static _addHierarchyInnerUrls:any;
		private static _getSprite3DHierarchyInnerUrls:any;
		private static _loadHierarchy:any;
		private static _onHierarchylhLoaded:any;
		private static _onHierarchyInnerForthLevResouLoaded:any;
		private static _onHierarchyInnerThirdLevResouLoaded:any;
		private static _onHierarchyInnerSecondLevResouLoaded:any;
		private static _onHierarchyInnerFirstLevResouLoaded:any;
		private static _loadMesh:any;
		private static _onMeshLmLoaded:any;
		private static _loadMaterial:any;
		private static _onMaterilLmatLoaded:any;
		private static _onMateialTexturesLoaded:any;
		private static _loadAvatar:any;
		private static _loadAnimationClip:any;
		private static _loadTexture2D:any;
		private static _loadTextureCube:any;
		private static _onTextureCubeLtcLoaded:any;
		private static _onTextureCubeImagesLoaded:any;
		private static _onProcessChange:any;
		static init(width:number,height:number,config?:Config3D,compolete?:laya.utils.Handler):void;

		constructor();
	}

declare module laya.components {
	class Component implements laya.resource.ISingletonElement,laya.resource.IDestroy  {
		private _indexInList:any;
		private _awaked:any;
		owner:laya.display.Node;

		constructor();
		readonly id:number;
		enabled:boolean;
		readonly isSingleton:boolean;
		readonly destroyed:boolean;
		private _resetComp:any;
		_getIndexInList():number;
		_setIndexInList(index:number):void;
		protected _onAwake():void;
		protected _onEnable():void;
		protected _onDisable():void;
		protected _onDestroy():void;
		onReset():void;
		destroy():void;
	}

}

declare module laya.d3 {
	class CastShadowList extends laya.d3.component.SingletonList<laya.resource.ISingletonElement>  {

		constructor();
	}

}

declare module laya.d3.animation {
	class AnimationClip extends laya.resource.Resource  {
		static ANIMATIONCLIP:string;
		static _parse(data:any,propertyParams?:any,constructParams?:any[]):AnimationClip;
		static load(url:string,complete:laya.utils.Handler):void;
		islooping:boolean;
		duration():number;

		constructor();
		private _hermiteInterpolate:any;
		private _hermiteInterpolateVector3:any;
		private _hermiteInterpolateQuaternion:any;
		_evaluateClipDatasRealTimeForNative(nodes:any,playCurTime:number,realTimeCurrentFrameIndexes:Uint16Array,addtive:boolean):void;
		private _evaluateFrameNodeVector3DatasRealTime:any;
		private _evaluateFrameNodeQuaternionDatasRealTime:any;
		private _binarySearchEventIndex:any;
		addEvent(event:laya.d3.animation.AnimationEvent):void;
		protected _disposeResource():void;
	}

}

declare module laya.d3Extend {
	class FileSaver  {

		constructor();
		static dataURLtoBlob(dataurl:string):any;
		static createBlob(arr:any[],option:any):any;
		static saveBlob(blob:any,filename:string):void;
		static saveTxtFile(filename:string,content:string):void;
		static saveCanvas(filename:string,canvas:any):void;
	}

}

declare module laya.d3Extend.cartoonMaterial {
	class CartoonMaterial extends laya.d3.core.material.BaseMaterial  {
		static ALBEDOTEXTURE:number;
		static BLENDTEXTURE:number;
		static OUTLINETEXTURE:number;
		static SHADOWCOLOR:number;
		static SHADOWRANGE:number;
		static SHADOWINTENSITY:number;
		static SPECULARRANGE:number;
		static SPECULARINTENSITY:number;
		static OUTLINEWIDTH:number;
		static OUTLINELIGHTNESS:number;
		static TILINGOFFSET:number;
		static SHADERDEFINE_ALBEDOTEXTURE:number;
		static SHADERDEFINE_BLENDTEXTURE:number;
		static SHADERDEFINE_OUTLINETEXTURE:number;
		static SHADERDEFINE_TILINGOFFSET:number;
		static shaderDefines:laya.d3.shader.ShaderDefines;
		static __init__():void;
		static initShader():void;
		albedoTexture:laya.resource.BaseTexture;
		blendTexture:laya.resource.BaseTexture;
		outlineTexture:laya.resource.BaseTexture;
		shadowColor:laya.d3.math.Vector4;
		shadowRange:number;
		shadowIntensity:number;
		specularRange:number;
		specularIntensity:number;
		outlineWidth:number;
		outlineLightness:number;
		tilingOffset:laya.d3.math.Vector4;

		constructor();
		clone():any;
	}

}

declare module laya.display {
	class Animation extends laya.display.AnimationBase  {
		static framesMap:any;
		protected _frames:any[];
		protected _url:string;

		constructor();
		destroy(destroyChild?:boolean):void;
		play(start?:any,loop?:boolean,name?:string):void;
		protected _setFramesFromCache(name:string,showWarn?:boolean):boolean;
		private _copyLabels:any;
		protected _frameLoop():void;
		protected _displayToIndex(value:number):void;
		frames:any[];
		source:string;
		autoAnimation:string;
		autoPlay:boolean;
		clear():laya.display.AnimationBase;
		loadImages(urls:any[],cacheName?:string):Animation;
		loadAtlas(url:string,loaded?:laya.utils.Handler,cacheName?:string):Animation;
		loadAnimation(url:string,loaded?:laya.utils.Handler,atlas?:string):Animation;
		private _loadAnimationData:any;
		static createFrames(url:string|string[],name:string):any[];
		static clearCache(key:string):void;
	}

}
	declare class UIConfig  {
		static touchScrollEnable:boolean;
		static mouseWheelEnable:boolean;
		static showButtons:boolean;
		static popupBgColor:string;
		static popupBgAlpha:number;
		static closeDialogOnSide:boolean;
	}

declare module laya.device.geolocation {
	class Geolocation  {
		private static navigator:any;
		private static position:any;
		static PERMISSION_DENIED:number;
		static POSITION_UNAVAILABLE:number;
		static TIMEOUT:number;
		static supported:boolean;
		static enableHighAccuracy:boolean;
		static timeout:number;
		static maximumAge:number;

		constructor();
		static getCurrentPosition(onSuccess:laya.utils.Handler,onError?:laya.utils.Handler):void;
		static watchPosition(onSuccess:laya.utils.Handler,onError:laya.utils.Handler):number;
		static clearWatch(id:number):void;
	}

}

declare module laya.effect {
	class BlurFilterSetter extends laya.effect.FilterSetterBase  {
		private _strength:any;

		constructor();
		protected buildFilter():void;
		strength:number;
	}

}

declare module laya.device {
	class Shake extends laya.events.EventDispatcher  {
		private throushold:any;
		private shakeInterval:any;
		private callback:any;
		private lastX:any;
		private lastY:any;
		private lastZ:any;
		private lastMillSecond:any;

		constructor();
		private static _instance:any;
		static readonly instance:Shake;
		start(throushold:number,interval:number):void;
		stop():void;
		private onShake:any;
		private isShaked:any;
	}

}

declare module laya.events {
	class Event  {
		static EMPTY:Event;
		static MOUSE_DOWN:string;
		static MOUSE_UP:string;
		static CLICK:string;
		static RIGHT_MOUSE_DOWN:string;
		static RIGHT_MOUSE_UP:string;
		static RIGHT_CLICK:string;
		static MOUSE_MOVE:string;
		static MOUSE_OVER:string;
		static MOUSE_OUT:string;
		static MOUSE_WHEEL:string;
		static ROLL_OVER:string;
		static ROLL_OUT:string;
		static DOUBLE_CLICK:string;
		static CHANGE:string;
		static CHANGED:string;
		static RESIZE:string;
		static ADDED:string;
		static REMOVED:string;
		static DISPLAY:string;
		static UNDISPLAY:string;
		static ERROR:string;
		static COMPLETE:string;
		static LOADED:string;
		static READY:string;
		static PROGRESS:string;
		static INPUT:string;
		static RENDER:string;
		static OPEN:string;
		static MESSAGE:string;
		static CLOSE:string;
		static KEY_DOWN:string;
		static KEY_PRESS:string;
		static KEY_UP:string;
		static FRAME:string;
		static DRAG_START:string;
		static DRAG_MOVE:string;
		static DRAG_END:string;
		static ENTER:string;
		static SELECT:string;
		static BLUR:string;
		static FOCUS:string;
		static VISIBILITY_CHANGE:string;
		static FOCUS_CHANGE:string;
		static PLAYED:string;
		static PAUSED:string;
		static STOPPED:string;
		static START:string;
		static END:string;
		static COMPONENT_ADDED:string;
		static COMPONENT_REMOVED:string;
		static RELEASED:string;
		static LINK:string;
		static LABEL:string;
		static FULL_SCREEN_CHANGE:string;
		static DEVICE_LOST:string;
		static TRANSFORM_CHANGED:string;
		static ANIMATION_CHANGED:string;
		static TRAIL_FILTER_CHANGE:string;
		static TRIGGER_ENTER:string;
		static TRIGGER_STAY:string;
		static TRIGGER_EXIT:string;
		type:string;
		nativeEvent:any;
		target:laya.display.Sprite;
		currentTarget:laya.display.Sprite;
		touchId:number;
		keyCode:number;
		delta:number;
		setTo(type:string,currentTarget:laya.display.Sprite,target:laya.display.Sprite):Event;
		stopPropagation():void;
		readonly touches:any[];
		readonly altKey:boolean;
		readonly ctrlKey:boolean;
		readonly shiftKey:boolean;
		readonly charCode:boolean;
		readonly keyLocation:number;
		readonly stageX:number;
		readonly stageY:number;
	}

}

declare module laya.device.motion {
	class AccelerationInfo  {
		x:number;
		y:number;
		z:number;

		constructor();
	}

}

declare module laya.filters {
	class BlurFilter extends laya.filters.Filter  {
		strength:number;
		strength_sig2_2sig2_gauss1:any[];
		strength_sig2_native:Float32Array;
		renderFunc:any;

		constructor(strength?:number);
		readonly type:number;
		getStrenth_sig2_2sig2_native():Float32Array;
	}

}

declare module laya.components {
	class Prefab  {
		json:any;
		create():any;
	}

}

declare module laya.layagl {
	class CommandEncoder  {

		constructor(layagl:any,reserveSize:number,adjustSize:number,isSyncToRenderThread:boolean);
		getArrayData():any[];
		getPtrID():number;
		beginEncoding():void;
		endEncoding():void;
		clearEncoding():void;
		getCount():number;
		add_ShaderValue(o:any):void;
		addShaderUniform(one:any):void;
	}

}

declare module laya.map {
	class GridSprite extends laya.display.Sprite  {
		relativeX:number;
		relativeY:number;
		isAloneObject:boolean;
		isHaveAnimation:boolean;
		aniSpriteArray:any[];
		drawImageNum:number;
		private _map:any;
		initData(map:laya.map.TiledMap,objectKey?:boolean):void;
		addAniSprite(sprite:laya.map.TileAniSprite):void;
		show():void;
		hide():void;
		updatePos():void;
		clearAll():void;
	}

}

declare module laya.html.utils {
	class HTMLExtendStyle  {
		static EMPTY:HTMLExtendStyle;
		stroke:number;
		strokeColor:string;
		leading:number;
		lineHeight:number;
		letterSpacing:number;
		href:string;

		constructor();
		reset():HTMLExtendStyle;
		recover():void;
		static create():HTMLExtendStyle;
	}

}

declare module laya.maths {
	class Bezier  {
		static I:Bezier;
		private _controlPoints:any;
		private _calFun:any;
		private _switchPoint:any;
		getPoint2(t:number,rst:any[]):void;
		getPoint3(t:number,rst:any[]):void;
		insertPoints(count:number,rst:any[]):void;
		getBezierPoints(pList:any[],inSertCount?:number,count?:number):any[];
	}

}

declare module laya.device.media {
	class Media  {

		constructor();
		static supported():boolean;
		static getMedia(options:any,onSuccess:laya.utils.Handler,onError:laya.utils.Handler):void;
	}

}

declare module laya.d3.component {
	class Animator extends laya.components.Component  {
		private static _tempVector30:any;
		private static _tempVector31:any;
		private static _tempQuaternion0:any;
		private static _tempQuaternion1:any;
		private static _tempVector3Array0:any;
		private static _tempVector3Array1:any;
		private static _tempQuaternionArray0:any;
		private static _tempQuaternionArray1:any;
		static CULLINGMODE_ALWAYSANIMATE:number;
		static CULLINGMODE_CULLCOMPLETELY:number;
		private _speed:any;
		private _keyframeNodeOwnerMap:any;
		private _keyframeNodeOwners:any;
		private _updateMark:any;
		private _controllerLayers:any;
		cullingMode:number;
		speed:number;

		constructor();
		private _linkToSprites:any;
		private _addKeyframeNodeOwner:any;
		private _updatePlayer:any;
		private _eventScript:any;
		private _updateEventScript:any;
		private _updateClipDatas:any;
		private _applyFloat:any;
		private _applyPositionAndRotationEuler:any;
		private _applyRotation:any;
		private _applyScale:any;
		private _applyCrossData:any;
		private _setClipDatasToNode:any;
		private _setCrossClipDatasToNode:any;
		private _setFixedCrossClipDatasToNode:any;
		private _revertDefaultKeyframeNodes:any;
		_onAdded():void;
		protected _onDestroy():void;
		protected _onEnable():void;
		protected _onDisable():void;
		_parse(data:any):void;
		getDefaultState(layerIndex?:number):laya.d3.component.AnimatorState;
		addState(state:laya.d3.component.AnimatorState,layerIndex?:number):void;
		removeState(state:laya.d3.component.AnimatorState,layerIndex?:number):void;
		addControllerLayer(controllderLayer:laya.d3.component.AnimatorControllerLayer):void;
		getControllerLayer(layerInex?:number):laya.d3.component.AnimatorControllerLayer;
		getCurrentAnimatorPlayState(layerInex?:number):laya.d3.component.AnimatorPlayState;
		play(name?:string,layerIndex?:number,normalizedTime?:number):void;
		crossFade(name:string,transitionDuration:number,layerIndex?:number,normalizedTime?:number):void;
		private _avatar:any;
		avatar:laya.d3.core.Avatar;
		private _getAvatarOwnersAndInitDatasAsync:any;
		private _isLinkSpriteToAnimationNode:any;
		private _isLinkSpriteToAnimationNodeData:any;
		linkSprite3DToAvatarNode(nodeName:string,sprite3D:laya.d3.core.Sprite3D):boolean;
		unLinkSprite3DToAvatarNode(sprite3D:laya.d3.core.Sprite3D):boolean;
	}

}

declare module laya.media {
	class Sound extends laya.events.EventDispatcher  {
		load(url:string):void;
		play(startTime?:number,loops?:number):laya.media.SoundChannel;
		readonly duration:number;
		dispose():void;
	}

}

declare module laya.net {
	class AtlasInfoManager  {
		private static _fileLoadDic:any;
		static enable(infoFile:string,callback?:laya.utils.Handler):void;
		private static _onInfoLoaded:any;
		static getFileLoadPath(file:string):string;
	}

}

declare module laya.display {
	class AnimationBase extends laya.display.Sprite  {
		static WRAP_POSITIVE:number;
		static WRAP_REVERSE:number;
		static WRAP_PINGPONG:number;
		loop:boolean;
		wrapMode:number;
		protected _interval:number;
		protected _index:number;
		protected _count:number;
		protected _isPlaying:boolean;
		protected _labels:any;
		protected _isReverse:boolean;
		protected _frameRateChanged:boolean;
		protected _actionName:string;
		private _controlNode:any;

		constructor();
		play(start?:any,loop?:boolean,name?:string):void;
		interval:number;
		protected _getFrameByLabel(label:string):number;
		protected _frameLoop():void;
		protected _resumePlay():void;
		stop():void;
		readonly isPlaying:boolean;
		addLabel(label:string,index:number):void;
		removeLabel(label:string):void;
		private _removeLabelFromList:any;
		gotoAndStop(position:any):void;
		index:number;
		protected _displayToIndex(value:number):void;
		readonly count:number;
		clear():AnimationBase;
	}

}

declare module laya.d3 {
	class Input3D  {
		touchCount():number;
		multiTouchEnabled:boolean;
		getTouch(index:number):laya.d3.Touch;
	}

}

declare module laya.d3.core {
	class Avatar extends laya.resource.Resource implements laya.d3.core.IClone  {
		static AVATAR:string;
		static _parse(data:any,propertyParams?:any,constructParams?:any[]):Avatar;
		static load(url:string,complete:laya.utils.Handler):void;
		private _nativeNodeCount:any;

		constructor();
		private _initCloneToAnimator:any;
		private _parseNode:any;
		_cloneDatasToAnimator(destAnimator:laya.d3.component.Animator):void;
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.device.geolocation {
	class GeolocationInfo  {
		private pos:any;
		private coords:any;
		setPosition(pos:any):void;
		readonly latitude:number;
		readonly longitude:number;
		readonly altitude:number;
		readonly accuracy:number;
		readonly altitudeAccuracy:number;
		readonly heading:number;
		readonly speed:number;
		readonly timestamp:number;
	}

}

declare module laya.effect {
	class ButtonEffect  {
		private _tar:any;
		private _curState:any;
		private _curTween:any;
		effectScale:number;
		tweenTime:number;
		effectEase:string;
		backEase:string;
		target:laya.display.Sprite;
		private toChangedState:any;
		private toInitState:any;
		private tweenComplete:any;
	}

}

declare module laya.media.h5audio {
	class AudioSound extends laya.events.EventDispatcher  {
		private static _audioCache:any;
		url:string;
		audio:HTMLAudioElement;
		loaded:boolean;
		dispose():void;
		private static _makeMusicOK:any;
		load(url:string):void;
		play(startTime?:number,loops?:number):laya.media.SoundChannel;
		readonly duration:number;
	}

}

declare module laya.events {
	class EventDispatcher  {
		static MOUSE_EVENTS:any;
		private _events:any;
		hasListener(type:string):boolean;
		event(type:string,data?:any):boolean;
		on(type:string,caller:any,listener:Function,args?:any[]):EventDispatcher;
		once(type:string,caller:any,listener:Function,args?:any[]):EventDispatcher;
		off(type:string,caller:any,listener:Function,onceOnly?:boolean):EventDispatcher;
		offAll(type?:string):EventDispatcher;
		offAllCaller(caller:any):EventDispatcher;
		private _recoverHandlers:any;
		isMouseEvent(type:string):boolean;
	}

}

declare module laya.particle {
	class Particle2D extends laya.display.Sprite  {
		private _matrix4:any;
		private _particleTemplate:any;
		private _canvasTemplate:any;
		private _emitter:any;
		autoPlay:boolean;
		tempCmd:any;

		constructor(setting:laya.particle.ParticleSetting);
		url:string;
		load(url:string):void;
		setParticleSetting(setting:laya.particle.ParticleSetting):void;
		readonly emitter:laya.particle.emitter.EmitterBase;
		play():void;
		stop():void;
		private _loop:any;
		advanceTime(passedTime?:number):void;
		customRender(context:laya.resource.Context,x:number,y:number):void;
		destroy(destroyChild?:boolean):void;
	}

}

declare module laya.physics {
	class BoxCollider extends laya.physics.ColliderBase  {
		private static _temp:any;
		private _x:any;
		private _y:any;
		private _width:any;
		private _height:any;
		protected getDef():any;
		private _setShape:any;
		x:number;
		y:number;
		width:number;
		height:number;
		resetShape(re?:boolean):void;
	}

}

declare module laya.device.motion {
	class Accelerator extends laya.events.EventDispatcher  {
		private static _instance:any;
		static readonly instance:Accelerator;
		private static acceleration:any;
		private static accelerationIncludingGravity:any;
		private static rotationRate:any;
		private static onChrome:any;

		constructor(singleton:number);
		on(type:string,caller:any,listener:Function,args?:any[]):laya.events.EventDispatcher;
		off(type:string,caller:any,listener:Function,onceOnly?:boolean):laya.events.EventDispatcher;
		private onDeviceOrientationChange:any;
		private static transformedAcceleration:any;
		static getTransformedAcceleration(acceleration:laya.device.motion.AccelerationInfo):laya.device.motion.AccelerationInfo;
	}

}

declare module laya.html.dom {
	class HTMLDivElement extends laya.display.Sprite  {
		private _recList:any;
		private _innerHTML:any;
		private _repaintState:any;

		constructor();
		destroy(destroyChild?:boolean):void;
		private _htmlDivRepaint:any;
		private _updateGraphicWork:any;
		private _setGraphicDirty:any;
		private _doClears:any;
		private _updateGraphic:any;
		readonly style:laya.html.utils.HTMLStyle;
		innerHTML:string;
		private _refresh:any;
		readonly contextWidth:number;
		readonly contextHeight:number;
		private _onMouseClick:any;
		private _eventLink:any;
	}

}

declare module laya.filters {
	class BlurFilterGLRender  {
		private static blurinfo:any;
		render(rt:laya.resource.RenderTexture2D,ctx:laya.resource.Context,width:number,height:number,filter:laya.filters.BlurFilter):void;
		setShaderInfo(shader:laya.webgl.shader.d2.value.Value2D,filter:laya.filters.BlurFilter,w:number,h:number):void;
	}

}

declare module laya.particle.emitter {
	class Emitter2D extends laya.particle.emitter.EmitterBase  {
		setting:laya.particle.ParticleSetting;
		private _posRange:any;
		private _canvasTemplate:any;
		private _emitFun:any;

		constructor(_template:laya.particle.ParticleTemplateBase);
		template:laya.particle.ParticleTemplateBase;
		emit():void;
		getRandom(value:number):number;
		webGLEmit():void;
		canvasEmit():void;
	}

}

declare module laya.resource {
	class BaseTexture extends laya.resource.Bitmap  {
		static WARPMODE_REPEAT:number;
		static WARPMODE_CLAMP:number;
		static FILTERMODE_POINT:number;
		static FILTERMODE_BILINEAR:number;
		static FILTERMODE_TRILINEAR:number;
		static FORMAT_R8G8B8:number;
		static FORMAT_R8G8B8A8:number;
		static FORMAT_ALPHA8:number;
		static FORMAT_DXT1:number;
		static FORMAT_DXT5:number;
		static FORMAT_ETC1RGB:number;
		static FORMAT_PVRTCRGB_2BPPV:number;
		static FORMAT_PVRTCRGBA_2BPPV:number;
		static FORMAT_PVRTCRGB_4BPPV:number;
		static FORMAT_PVRTCRGBA_4BPPV:number;
		static RENDERTEXTURE_FORMAT_RGBA_HALF_FLOAT:number;
		static FORMAT_DEPTH_16:number;
		static FORMAT_STENCIL_8:number;
		static FORMAT_DEPTHSTENCIL_16_8:number;
		static FORMAT_DEPTHSTENCIL_NONE:number;
		protected _readyed:boolean;
		protected _glTextureType:number;
		protected _glTexture:any;
		protected _format:number;
		protected _mipmap:boolean;
		protected _wrapModeU:number;
		protected _wrapModeV:number;
		protected _filterMode:number;
		protected _anisoLevel:number;
		protected _mipmapCount:number;
		readonly mipmap:boolean;
		readonly format:number;
		wrapModeU:number;
		wrapModeV:number;
		filterMode:number;
		anisoLevel:number;
		readonly mipmapCount:number;
		readonly defaulteTexture:BaseTexture;

		constructor(format:number,mipMap:boolean);
		protected _getFormatByteCount():number;
		protected _isPot(size:number):boolean;
		protected _getGLFormat():number;
		protected _setFilterMode(value:number):void;
		protected _setWarpMode(orientation:number,mode:number):void;
		protected _setAnisotropy(value:number):void;
		protected _disposeResource():void;
		generateMipmap():void;
	}

}

declare module laya.components {
	class Script extends laya.components.Component  {
		readonly isSingleton:boolean;
		protected _onAwake():void;
		protected _onEnable():void;
		protected _onDisable():void;
		protected _onDestroy():void;
		onAwake():void;
		onEnable():void;
		onStart():void;
		onTriggerEnter(other:any,self:any,contact:any):void;
		onTriggerStay(other:any,self:any,contact:any):void;
		onTriggerExit(other:any,self:any,contact:any):void;
		onMouseDown(e:laya.events.Event):void;
		onMouseUp(e:laya.events.Event):void;
		onClick(e:laya.events.Event):void;
		onStageMouseDown(e:laya.events.Event):void;
		onStageMouseUp(e:laya.events.Event):void;
		onStageClick(e:laya.events.Event):void;
		onStageMouseMove(e:laya.events.Event):void;
		onDoubleClick(e:laya.events.Event):void;
		onRightClick(e:laya.events.Event):void;
		onMouseMove(e:laya.events.Event):void;
		onMouseOver(e:laya.events.Event):void;
		onMouseOut(e:laya.events.Event):void;
		onKeyDown(e:laya.events.Event):void;
		onKeyPress(e:laya.events.Event):void;
		onKeyUp(e:laya.events.Event):void;
		onUpdate():void;
		onLateUpdate():void;
		onPreRender():void;
		onPostRender():void;
		onDisable():void;
		onDestroy():void;
	}

}

declare module laya.system {
	class System  {
		static changeDefinition(name:string,classObj:any):void;
	}

}

declare module laya.layagl {
	class LayaGL  {
		static EXECUTE_JS_THREAD_BUFFER:number;
		static EXECUTE_RENDER_THREAD_BUFFER:number;
		static EXECUTE_COPY_TO_RENDER:number;
		static EXECUTE_COPY_TO_RENDER3D:number;
		static ARRAY_BUFFER_TYPE_DATA:number;
		static ARRAY_BUFFER_TYPE_CMD:number;
		static ARRAY_BUFFER_REF_REFERENCE:number;
		static ARRAY_BUFFER_REF_COPY:number;
		static UPLOAD_SHADER_UNIFORM_TYPE_ID:number;
		static UPLOAD_SHADER_UNIFORM_TYPE_DATA:number;
		static instance:WebGLRenderingContext;
		static layaGPUInstance:laya.webgl.LayaGPU;
		createCommandEncoder(reserveSize?:number,adjustSize?:number,isSyncToRenderThread?:boolean):laya.layagl.CommandEncoder;
		beginCommandEncoding(commandEncoder:laya.layagl.CommandEncoder):void;
		endCommandEncoding():void;
		static getFrameCount():number;
		static syncBufferToRenderThread(value:any,index?:number):void;
		static createArrayBufferRef(arrayBuffer:any,type:number,syncRender:boolean):void;
		static createArrayBufferRefs(arrayBuffer:any,type:number,syncRender:boolean,refType:number):void;
		matrix4x4Multiply(m1:any,m2:any,out:any):void;
		evaluateClipDatasRealTime(nodes:any,playCurTime:number,realTimeCurrentFrameIndexs:any,addtive:boolean):void;
	}

}

declare module laya.map {
	class IMap  {
		static TiledMap:laya.map.TiledMap;
	}

}

declare module laya.ui {
	class AdvImage extends laya.ui.Image  {
		private advsListArr:any;
		private resUrl:any;
		private _http:any;
		private _data:any;
		private _resquestTime:any;
		private _appid:any;
		private _playIndex:any;
		private _lunboTime:any;

		constructor(skin?:string);
		private setLoadUrl:any;
		private init:any;
		private initEvent:any;
		private onAdvsImgClick:any;
		private revertAdvsData:any;
		isSupportJump():boolean;
		private jumptoGame:any;
		private updateAdvsInfo:any;
		private onLunbo:any;
		private getCurrentAppidObj:any;
		private onGetAdvsListData:any;
		static randRange(minNum:any,maxNum:any):number;
		private _onError:any;
		private _onLoad:any;
		private error:any;
		private complete:any;
		private getAdvsQArr:any;
		private clear:any;
		destroy(destroyChild?:boolean):void;
	}

}

declare module laya.html.utils {
	class HTMLParse  {
		private static char255:any;
		private static spacePattern:any;
		private static char255AndOneSpacePattern:any;
		private static _htmlClassMapShort:any;
		static getInstance(type:string):any;
		static parse(ower:laya.html.dom.HTMLDivParser,xmlString:string,url:laya.net.URL):void;
		private static _parseXML:any;
	}

}

declare module laya.maths {
	class GrahamScan  {
		private static _mPointList:any;
		private static _tempPointList:any;
		private static _temPList:any;
		private static _temArr:any;
		static multiply(p1:laya.maths.Point,p2:laya.maths.Point,p0:laya.maths.Point):number;
		static dis(p1:laya.maths.Point,p2:laya.maths.Point):number;
		private static _getPoints:any;
		static getFrom(rst:any[],src:any[],count:number):any[];
		static getFromR(rst:any[],src:any[],count:number):any[];
		static pListToPointList(pList:any[],tempUse?:boolean):any[];
		static pointListToPlist(pointList:any[]):any[];
		static scanPList(pList:any[]):any[];
		static scan(PointSet:any[]):any[];
	}

}

declare module laya.utils {
	class Browser  {
		static userAgent:string;
		static onMobile:boolean;
		static onIOS:boolean;
		static onMac:boolean;
		static onIPhone:boolean;
		static onIPad:boolean;
		static onAndroid:boolean;
		static onWP:boolean;
		static onQQBrowser:boolean;
		static onMQQBrowser:boolean;
		static onSafari:boolean;
		static onIE:boolean;
		static onWeiXin:boolean;
		static onPC:boolean;
		static onMiniGame:boolean;
		static onBDMiniGame:boolean;
		static onKGMiniGame:boolean;
		static onQGMiniGame:boolean;
		static onVVMiniGame:boolean;
		static onLimixiu:boolean;
		static onFirefox:boolean;
		static onEdge:boolean;
		static onLayaRuntime:boolean;
		static supportWebAudio:boolean;
		static supportLocalStorage:boolean;
		static canvas:laya.resource.HTMLCanvas;
		static context:CanvasRenderingContext2D;
		private static _window:any;
		private static _document:any;
		private static _container:any;
		private static _pixelRatio:any;
		static mainCanvas:any;
		private static hanzi:any;
		private static fontMap:any;
		static measureText:Function;
		static createElement(type:string):any;
		static getElementById(type:string):any;
		static removeElement(ele:any):void;
		static now():number;
		static readonly clientWidth:number;
		static readonly clientHeight:number;
		static readonly width:number;
		static readonly height:number;
		static readonly pixelRatio:number;
		static container:any;
		static readonly window:any;
		static readonly document:any;
	}

}

declare module laya.device.media {
	class Video extends laya.display.Sprite  {
		static MP4:number;
		static OGG:number;
		static CAMERA:number;
		static WEBM:number;
		static SUPPORT_PROBABLY:string;
		static SUPPORT_MAYBY:string;
		static SUPPORT_NO:string;
		private htmlVideo:any;
		private videoElement:any;
		private internalTexture:any;

		constructor(width?:number,height?:number);
		private static onAbort:any;
		private static onCanplay:any;
		private static onCanplaythrough:any;
		private static onDurationchange:any;
		private static onEmptied:any;
		private static onError:any;
		private static onLoadeddata:any;
		private static onLoadedmetadata:any;
		private static onLoadstart:any;
		private static onPause:any;
		private static onPlay:any;
		private static onPlaying:any;
		private static onProgress:any;
		private static onRatechange:any;
		private static onSeeked:any;
		private static onSeeking:any;
		private static onStalled:any;
		private static onSuspend:any;
		private static onTimeupdate:any;
		private static onVolumechange:any;
		private static onWaiting:any;
		private onPlayComplete:any;
		load(url:string):void;
		play():void;
		pause():void;
		reload():void;
		canPlayType(type:number):string;
		private renderCanvas:any;
		private onDocumentClick:any;
		readonly buffered:any;
		readonly currentSrc:string;
		currentTime:number;
		volume:number;
		readonly readyState:any;
		readonly videoWidth:number;
		readonly videoHeight:number;
		readonly duration:number;
		readonly ended:boolean;
		readonly error:boolean;
		loop:boolean;
		x:number;
		y:number;
		playbackRate:number;
		muted:boolean;
		readonly paused:boolean;
		preload:string;
		readonly seekable:any;
		readonly seeking:boolean;
		size(width:number,height:number):laya.display.Sprite;
		width:number;
		height:number;
		destroy(detroyChildren?:boolean):void;
		private syncVideoPosition:any;
	}

}

declare module laya.webgl {
	class BufferState2D extends laya.webgl.BufferStateBase  {

		constructor();
	}

}

declare module laya.media {
	class SoundChannel extends laya.events.EventDispatcher  {
		url:string;
		loops:number;
		startTime:number;
		isStopped:boolean;
		completeHandler:laya.utils.Handler;
		volume:number;
		readonly position:number;
		readonly duration:number;
		play():void;
		stop():void;
		pause():void;
		resume():void;
		protected __runComplete(handler:laya.utils.Handler):void;
	}

}

declare module laya.d3.component {
	class AnimatorControllerLayer implements laya.d3.resource.IReferenceCounter,laya.d3.core.IClone  {
		private _defaultState:any;
		private _referenceCount:any;
		name:string;
		blendingMode:number;
		defaultWeight:number;
		playOnWake:boolean;
		defaultState:laya.d3.component.AnimatorState;

		constructor(name:string);
		private _removeClip:any;
		_getReferenceCount():number;
		_addReference(count?:number):void;
		_removeReference(count?:number):void;
		_clearReference():void;
		addState(state:laya.d3.component.AnimatorState):void;
		removeState(state:laya.d3.component.AnimatorState):void;
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.ani {
	class AnimationPlayer extends laya.events.EventDispatcher implements laya.resource.IDestroy  {
		private _destroyed:any;
		private _templet:any;
		private _currentTime:any;
		private _currentFrameTime:any;
		private _playStart:any;
		private _playEnd:any;
		private _playDuration:any;
		private _overallDuration:any;
		private _stopWhenCircleFinish:any;
		private _startUpdateLoopCount:any;
		private _currentAnimationClipIndex:any;
		private _currentKeyframeIndex:any;
		private _paused:any;
		private _cacheFrameRate:any;
		private _cacheFrameRateInterval:any;
		private _cachePlayRate:any;
		isCache:boolean;
		playbackRate:number;
		returnToZeroStopped:boolean;
		templet:laya.ani.AnimationTemplet;
		readonly playStart:number;
		readonly playEnd:number;
		readonly playDuration:number;
		readonly overallDuration:number;
		readonly currentAnimationClipIndex:number;
		readonly currentKeyframeIndex:number;
		readonly currentPlayTime:number;
		readonly currentFrameTime:number;
		cachePlayRate:number;
		cacheFrameRate:number;
		currentTime:number;
		paused:boolean;
		readonly cacheFrameRateInterval:number;
		readonly state:number;
		readonly destroyed:boolean;

		constructor();
		private _computeFullKeyframeIndices:any;
		private _onAnimationTempletLoaded:any;
		private _calculatePlayDuration:any;
		private _setPlayParams:any;
		private _setPlayParamsWhenStop:any;
		play(index?:number,playbackRate?:number,overallDuration?:number,playStart?:number,playEnd?:number):void;
		playByFrame(index?:number,playbackRate?:number,overallDuration?:number,playStartFrame?:number,playEndFrame?:number,fpsIn3DBuilder?:number):void;
		stop(immediate?:boolean):void;
		destroy():void;
	}

}

declare module laya.renders {
	class Render  {
		static supportWebGLPlusCulling:boolean;
		static supportWebGLPlusAnimation:boolean;
		static supportWebGLPlusRendering:boolean;
		static isConchApp:boolean;
		static is3DMode:boolean;

		constructor(width:number,height:number,mainCanv:laya.resource.HTMLCanvas);
		private _timeId:any;
		private _onVisibilitychange:any;
		initRender(canvas:laya.resource.HTMLCanvas,w:number,h:number):boolean;
		private _enterFrame:any;
		static readonly context:laya.resource.Context;
		static readonly canvas:any;
	}

}

declare module laya.net {
	class HttpRequest extends laya.events.EventDispatcher  {
		protected _http:any;
		protected _responseType:string;
		protected _data:any;
		protected _url:string;
		send(url:string,data?:any,method?:string,responseType?:string,headers?:any[]):void;
		protected _onProgress(e:any):void;
		protected _onAbort(e:any):void;
		protected _onError(e:any):void;
		protected _onLoad(e:any):void;
		protected error(message:string):void;
		protected complete():void;
		protected clear():void;
		readonly url:string;
		readonly data:any;
		readonly http:any;
	}

}

declare module laya.display {
	class BitmapFont  {
		private _texture:any;
		private _fontCharDic:any;
		private _fontWidthMap:any;
		private _complete:any;
		private _path:any;
		private _maxWidth:any;
		private _spaceWidth:any;
		private _padding:any;
		fontSize:number;
		autoScaleSize:boolean;
		letterSpacing:number;
		loadFont(path:string,complete:laya.utils.Handler):void;
		private _onLoaded:any;
		parseFont(xml:XMLDocument,texture:laya.resource.Texture):void;
		parseFont2(xml:XMLDocument,texture:laya.resource.Texture):void;
		getCharTexture(char:string):laya.resource.Texture;
		destroy():void;
		setSpaceWidth(spaceWidth:number):void;
		getCharWidth(char:string):number;
		getTextWidth(text:string):number;
		getMaxWidth():number;
		getMaxHeight():number;
	}

}

declare module laya.d3 {
	class Input3D  {
		touchCount():number;
		multiTouchEnabled:boolean;
		getTouch(index:number):laya.d3.Touch;
	}

}

declare module laya.d3.core {
	class BaseCamera extends laya.d3.core.Sprite3D  {
		static _tempMatrix4x40:laya.d3.math.Matrix4x4;
		static CAMERAPOS:number;
		static VIEWMATRIX:number;
		static PROJECTMATRIX:number;
		static VIEWPROJECTMATRIX:number;
		static CAMERADIRECTION:number;
		static CAMERAUP:number;
		static RENDERINGTYPE_DEFERREDLIGHTING:string;
		static RENDERINGTYPE_FORWARDRENDERING:string;
		static CLEARFLAG_SOLIDCOLOR:number;
		static CLEARFLAG_SKY:number;
		static CLEARFLAG_DEPTHONLY:number;
		static CLEARFLAG_NONE:number;
		protected static _invertYScaleMatrix:laya.d3.math.Matrix4x4;
		protected static _invertYProjectionMatrix:laya.d3.math.Matrix4x4;
		protected static _invertYProjectionViewMatrix:laya.d3.math.Matrix4x4;
		private _nearPlane:any;
		private _farPlane:any;
		private _fieldOfView:any;
		private _orthographicVerticalSize:any;
		private _skyRenderer:any;
		private _forward:any;
		private _up:any;
		clearFlag:number;
		clearColor:laya.d3.math.Vector4;
		cullingMask:number;
		useOcclusionCulling:boolean;
		readonly skyRenderer:laya.d3.resource.models.SkyRenderer;
		fieldOfView:number;
		nearPlane:number;
		farPlane:number;
		orthographic:boolean;
		orthographicVerticalSize:number;
		renderingOrder:number;

		constructor(nearPlane?:number,farPlane?:number);
		_sortCamerasByRenderingOrder():void;
		render(shader?:laya.d3.shader.Shader3D,replacementTag?:string):void;
		addLayer(layer:number):void;
		removeLayer(layer:number):void;
		addAllLayers():void;
		removeAllLayers():void;
		resetProjectionMatrix():void;
		protected _onActive():void;
		protected _onInActive():void;
		_parse(data:any,spriteMap:any):void;
		destroy(destroyChild?:boolean):void;
	}

}

declare module laya.effect {
	class ColorFilterSetter extends laya.effect.FilterSetterBase  {
		private _brightness:any;
		private _contrast:any;
		private _saturation:any;
		private _hue:any;
		private _red:any;
		private _green:any;
		private _blue:any;
		private _alpha:any;

		constructor();
		protected buildFilter():void;
		brightness:number;
		contrast:number;
		saturation:number;
		hue:number;
		red:number;
		green:number;
		blue:number;
		private _color:any;
		color:string;
		alpha:number;
	}

}

declare module laya.d3.animation {
	class AnimationEvent  {
		time:number;
		eventName:string;
		params:any[];

		constructor();
	}

}

declare module laya.media.h5audio {
	class AudioSoundChannel extends laya.media.SoundChannel  {
		private _audio:any;
		private _onEnd:any;
		private _resumePlay:any;

		constructor(audio:HTMLAudioElement);
		private __onEnd:any;
		private __resumePlay:any;
		play():void;
		readonly position:number;
		readonly duration:number;
		stop():void;
		pause():void;
		resume():void;
		volume:number;
	}

}

declare module laya.particle {
	class ParticleData  {
		private static _tempVelocity:any;
		private static _tempStartColor:any;
		private static _tempEndColor:any;
		private static _tempSizeRotation:any;
		private static _tempRadius:any;
		private static _tempRadian:any;
		position:Float32Array;
		velocity:Float32Array;
		startColor:Float32Array;
		endColor:Float32Array;
		sizeRotation:Float32Array;
		radius:Float32Array;
		radian:Float32Array;
		durationAddScale:number;
		time:number;

		constructor();
		static Create(settings:laya.particle.ParticleSetting,position:Float32Array,velocity:Float32Array,time:number):ParticleData;
	}

}

declare module laya.events {
	class Keyboard  {
		static NUMBER_0:number;
		static NUMBER_1:number;
		static NUMBER_2:number;
		static NUMBER_3:number;
		static NUMBER_4:number;
		static NUMBER_5:number;
		static NUMBER_6:number;
		static NUMBER_7:number;
		static NUMBER_8:number;
		static NUMBER_9:number;
		static A:number;
		static B:number;
		static C:number;
		static D:number;
		static E:number;
		static F:number;
		static G:number;
		static H:number;
		static I:number;
		static J:number;
		static K:number;
		static L:number;
		static M:number;
		static N:number;
		static O:number;
		static P:number;
		static Q:number;
		static R:number;
		static S:number;
		static T:number;
		static U:number;
		static V:number;
		static W:number;
		static X:number;
		static Y:number;
		static Z:number;
		static F1:number;
		static F2:number;
		static F3:number;
		static F4:number;
		static F5:number;
		static F6:number;
		static F7:number;
		static F8:number;
		static F9:number;
		static F10:number;
		static F11:number;
		static F12:number;
		static F13:number;
		static F14:number;
		static F15:number;
		static NUMPAD:number;
		static NUMPAD_0:number;
		static NUMPAD_1:number;
		static NUMPAD_2:number;
		static NUMPAD_3:number;
		static NUMPAD_4:number;
		static NUMPAD_5:number;
		static NUMPAD_6:number;
		static NUMPAD_7:number;
		static NUMPAD_8:number;
		static NUMPAD_9:number;
		static NUMPAD_ADD:number;
		static NUMPAD_DECIMAL:number;
		static NUMPAD_DIVIDE:number;
		static NUMPAD_ENTER:number;
		static NUMPAD_MULTIPLY:number;
		static NUMPAD_SUBTRACT:number;
		static SEMICOLON:number;
		static EQUAL:number;
		static COMMA:number;
		static MINUS:number;
		static PERIOD:number;
		static SLASH:number;
		static BACKQUOTE:number;
		static LEFTBRACKET:number;
		static BACKSLASH:number;
		static RIGHTBRACKET:number;
		static QUOTE:number;
		static ALTERNATE:number;
		static BACKSPACE:number;
		static CAPS_LOCK:number;
		static COMMAND:number;
		static CONTROL:number;
		static DELETE:number;
		static ENTER:number;
		static ESCAPE:number;
		static PAGE_UP:number;
		static PAGE_DOWN:number;
		static END:number;
		static HOME:number;
		static LEFT:number;
		static UP:number;
		static RIGHT:number;
		static DOWN:number;
		static SHIFT:number;
		static SPACE:number;
		static TAB:number;
		static INSERT:number;
	}

}

declare module laya.physics {
	class ChainCollider extends laya.physics.ColliderBase  {
		private _x:any;
		private _y:any;
		private _points:any;
		private _loop:any;
		protected getDef():any;
		private _setShape:any;
		x:number;
		y:number;
		points:string;
		loop:boolean;
	}

}

declare module laya.device.motion {
	class Gyroscope extends laya.events.EventDispatcher  {
		private static info:any;
		private static _instance:any;
		static readonly instance:Gyroscope;

		constructor(singleton:number);
		on(type:string,caller:any,listener:Function,args?:any[]):laya.events.EventDispatcher;
		off(type:string,caller:any,listener:Function,onceOnly?:boolean):laya.events.EventDispatcher;
		private onDeviceOrientationChange:any;
	}

}

declare module laya.html.dom {
	class HTMLDivParser extends laya.html.dom.HTMLElement  {
		contextHeight:number;
		contextWidth:number;
		private _htmlBounds:any;
		private _boundsRec:any;
		repaintHandler:laya.utils.Handler;
		reset():laya.html.dom.HTMLElement;
		innerHTML:string;
		width:number;
		appendHTML(text:string):void;
		getBounds():laya.maths.Rectangle;
		parentRepaint(recreate?:boolean):void;
		layout():void;
		height:number;
	}

}

declare module laya.filters {
	class ColorFilter extends laya.filters.Filter implements laya.filters.IFilter  {
		private static DELTA_INDEX:any;
		private static GRAY_MATRIX:any;
		private static IDENTITY_MATRIX:any;
		private static LENGTH:any;
		private _matrix:any;

		constructor(mat?:any[]);
		gray():ColorFilter;
		color(red?:number,green?:number,blue?:number,alpha?:number):ColorFilter;
		setColor(color:string):ColorFilter;
		setByMatrix(matrix:any[]):ColorFilter;
		readonly type:number;
		adjustColor(brightness:number,contrast:number,saturation:number,hue:number):ColorFilter;
		adjustBrightness(brightness:number):ColorFilter;
		adjustContrast(contrast:number):ColorFilter;
		adjustSaturation(saturation:number):ColorFilter;
		adjustHue(hue:number):ColorFilter;
		reset():ColorFilter;
		private _multiplyMatrix:any;
		private _clampValue:any;
		private _fixMatrix:any;
		private _copyMatrix:any;
	}

}

declare module laya.particle.emitter {
	class EmitterBase  {
		protected _frameTime:number;
		protected _emissionRate:number;
		protected _emissionTime:number;
		minEmissionTime:number;
		particleTemplate:laya.particle.ParticleTemplateBase;
		emissionRate:number;
		start(duration?:number):void;
		stop():void;
		clear():void;
		emit():void;
		advanceTime(passedTime?:number):void;
	}

}

declare module laya.d3.graphics {
	class IndexBuffer3D extends laya.webgl.utils.Buffer  {
		static INDEXTYPE_UBYTE:string;
		static INDEXTYPE_USHORT:string;
		readonly indexType:string;
		readonly indexTypeByteCount:number;
		readonly indexCount:number;
		readonly canRead:boolean;

		constructor(indexType:string,indexCount:number,bufferUsage?:number,canRead?:boolean);
		_bindForVAO():void;
		bind():boolean;
		setData(data:any,bufferOffset?:number,dataStartIndex?:number,dataCount?:number):void;
		getData():Uint16Array;
		destroy():void;
	}

}

declare module laya.resource {
	class Bitmap extends laya.resource.Resource  {
		protected _width:number;
		protected _height:number;
		readonly width:number;
		readonly height:number;

		constructor();
	}

}

declare module laya.layagl {
	class LayaGLRunner  {
		static uploadShaderUniforms(layaGL:laya.layagl.LayaGL,commandEncoder:laya.layagl.CommandEncoder,shaderData:any,uploadUnTexture:boolean):number;
		static uploadCustomUniform(layaGL:laya.layagl.LayaGL,custom:any[],index:number,data:any):number;
		static uploadShaderUniformsForNative(layaGL:any,commandEncoder:laya.layagl.CommandEncoder,shaderData:any):number;
	}

}

declare module laya.map {
	class MapLayer extends laya.display.Sprite  {
		private _map:any;
		private _tileWidthHalf:any;
		private _tileHeightHalf:any;
		private _mapWidthHalf:any;
		private _mapHeightHalf:any;
		private _objDic:any;
		private _dataDic:any;
		private _tempMapPos:any;
		private _properties:any;
		tarLayer:MapLayer;
		layerName:string;
		init(layerData:any,map:laya.map.TiledMap):void;
		getObjectByName(objName:string):laya.map.GridSprite;
		getObjectDataByName(objName:string):laya.map.GridSprite;
		getLayerProperties(name:string):any;
		getTileData(tileX:number,tileY:number):number;
		getScreenPositionByTilePos(tileX:number,tileY:number,screenPos?:laya.maths.Point):void;
		getTileDataByScreenPos(screenX:number,screenY:number):number;
		getTilePositionByScreenPos(screenX:number,screenY:number,result?:laya.maths.Point):boolean;
		getDrawSprite(gridX:number,gridY:number):laya.map.GridSprite;
		updateGridPos():void;
		drawTileTexture(gridSprite:laya.map.GridSprite,tileX:number,tileY:number):boolean;
		clearAll():void;
	}

}

declare module laya.ui {
	class AutoBitmap extends laya.display.Graphics  {
		autoCacheCmd:boolean;
		private _width:any;
		private _height:any;
		private _source:any;
		private _sizeGrid:any;
		protected _isChanged:boolean;
		uv:number[];
		destroy():void;
		sizeGrid:number[];
		width:number;
		height:number;
		source:laya.resource.Texture;
		protected _setChanged():void;
		protected changeSource():void;
		private drawBitmap:any;
		private static getTexture:any;
	}

}

declare module laya.html.utils {
	class HTMLStyle  {
		private static _CSSTOVALUE:any;
		private static _parseCSSRegExp:any;
		private static _inheritProps:any;
		static ALIGN_LEFT:string;
		static ALIGN_CENTER:string;
		static ALIGN_RIGHT:string;
		static VALIGN_TOP:string;
		static VALIGN_MIDDLE:string;
		static VALIGN_BOTTOM:string;
		static styleSheets:any;
		static ADDLAYOUTED:number;
		private static _PADDING:any;
		protected static _HEIGHT_SET:number;
		protected static _LINE_ELEMENT:number;
		protected static _NOWARP:number;
		protected static _WIDTHAUTO:number;
		protected static _BOLD:number;
		protected static _ITALIC:number;
		protected static _CSS_BLOCK:number;
		protected static _DISPLAY_NONE:number;
		protected static _ABSOLUTE:number;
		protected static _WIDTH_SET:number;
		protected static alignVDic:any;
		protected static align_Value:any;
		protected static vAlign_Value:any;
		protected static _ALIGN:number;
		protected static _VALIGN:number;
		fontSize:number;
		family:string;
		color:string;
		ower:laya.html.dom.HTMLElement;
		private _extendStyle:any;
		textDecoration:string;
		bgColor:string;
		borderColor:string;
		padding:any[];

		constructor();
		private _getExtendStyle:any;
		href:string;
		stroke:number;
		strokeColor:string;
		leading:number;
		lineHeight:number;
		align:string;
		valign:string;
		font:string;
		block:boolean;
		reset():HTMLStyle;
		recover():void;
		static create():HTMLStyle;
		inherit(src:HTMLStyle):void;
		wordWrap:boolean;
		bold:boolean;
		italic:boolean;
		widthed(sprite:any):boolean;
		whiteSpace:string;
		width:any;
		height:any;
		heighted(sprite:any):boolean;
		size(w:number,h:number):void;
		getLineElement():boolean;
		setLineElement(value:boolean):void;
		letterSpacing:number;
		cssText(text:string):void;
		attrs(attrs:any[]):void;
		position:string;
		readonly absolute:boolean;
		readonly paddingLeft:number;
		readonly paddingTop:number;
		static parseOneCSS(text:string,clipWord:string):any[];
	}

}

declare module laya.utils {
	class Byte  {
		static BIG_ENDIAN:string;
		static LITTLE_ENDIAN:string;
		private static _sysEndian:any;
		protected _xd_:boolean;
		private _allocated_:any;
		protected _d_:any;
		protected _u8d_:any;
		protected _pos_:number;
		protected _length:number;
		static getSystemEndian():string;

		constructor(data?:any);
		readonly buffer:ArrayBuffer;
		endian:string;
		length:number;
		private _resizeBuffer:any;
		getString():string;
		readString():string;
		getFloat32Array(start:number,len:number):any;
		readFloat32Array(start:number,len:number):any;
		getUint8Array(start:number,len:number):Uint8Array;
		readUint8Array(start:number,len:number):Uint8Array;
		getInt16Array(start:number,len:number):any;
		readInt16Array(start:number,len:number):any;
		getFloat32():number;
		readFloat32():number;
		getFloat64():number;
		readFloat64():number;
		writeFloat32(value:number):void;
		writeFloat64(value:number):void;
		getInt32():number;
		readInt32():number;
		getUint32():number;
		readUint32():number;
		writeInt32(value:number):void;
		writeUint32(value:number):void;
		getInt16():number;
		readInt16():number;
		getUint16():number;
		readUint16():number;
		writeUint16(value:number):void;
		writeInt16(value:number):void;
		getUint8():number;
		readUint8():number;
		writeUint8(value:number):void;
		private _rUTF:any;
		getCustomString(len:number):string;
		readCustomString(len:number):string;
		pos:number;
		readonly bytesAvailable:number;
		clear():void;
		writeUTFBytes(value:string):void;
		writeUTFString(value:string):void;
		readUTFString():string;
		getUTFString():string;
		readUTFBytes(len?:number):string;
		getUTFBytes(len?:number):string;
		writeByte(value:number):void;
		readByte():number;
		getByte():number;
		writeArrayBuffer(arraybuffer:any,offset?:number,length?:number):void;
		readArrayBuffer(length:number):ArrayBuffer;
	}

}

declare module laya.maths {
	class MathUtil  {
		static subtractVector3(l:Float32Array,r:Float32Array,o:Float32Array):void;
		static lerp(left:number,right:number,amount:number):number;
		static scaleVector3(f:Float32Array,b:number,e:Float32Array):void;
		static lerpVector3(l:Float32Array,r:Float32Array,t:number,o:Float32Array):void;
		static lerpVector4(l:Float32Array,r:Float32Array,t:number,o:Float32Array):void;
		static slerpQuaternionArray(a:Float32Array,Offset1:number,b:Float32Array,Offset2:number,t:number,out:Float32Array,Offset3:number):Float32Array;
		static getRotation(x0:number,y0:number,x1:number,y1:number):number;
		static sortBigFirst(a:number,b:number):number;
		static sortSmallFirst(a:number,b:number):number;
		static sortNumBigFirst(a:any,b:any):number;
		static sortNumSmallFirst(a:any,b:any):number;
		static sortByKey(key:string,bigFirst?:boolean,forceNum?:boolean):(a: any, b: any) => number;
	}

}

declare module laya.media {
	class SoundManager  {
		static musicVolume:number;
		static soundVolume:number;
		static playbackRate:number;
		private static _useAudioMusic:any;
		private static _muted:any;
		private static _soundMuted:any;
		private static _musicMuted:any;
		static _bgMusic:string;
		private static _musicChannel:any;
		private static _channels:any;
		private static _autoStopMusic:any;
		private static _blurPaused:any;
		private static _isActive:any;
		static _soundClass:new () => any;
		static _musicClass:new () => any;
		private static _lastSoundUsedTimeDic:any;
		private static _isCheckingDispose:any;
		static __init__():boolean;
		static autoReleaseSound:boolean;
		static addChannel(channel:laya.media.SoundChannel):void;
		static removeChannel(channel:laya.media.SoundChannel):void;
		static disposeSoundLater(url:string):void;
		private static _checkDisposeSound:any;
		static disposeSoundIfNotUsed(url:string):void;
		static autoStopMusic:boolean;
		private static _visibilityChange:any;
		private static _stageOnBlur:any;
		private static _recoverWebAudio:any;
		private static _stageOnFocus:any;
		static muted:boolean;
		static soundMuted:boolean;
		static musicMuted:boolean;
		static useAudioMusic:boolean;
		static playSound(url:string,loops?:number,complete?:laya.utils.Handler,soundClass?:new () => any,startTime?:number):laya.media.SoundChannel;
		static destroySound(url:string):void;
		static playMusic(url:string,loops?:number,complete?:laya.utils.Handler,startTime?:number):laya.media.SoundChannel;
		static stopSound(url:string):void;
		static stopAll():void;
		static stopAllSound():void;
		static stopMusic():void;
		static setSoundVolume(volume:number,url?:string):void;
		static setMusicVolume(volume:number):void;
		private static _setVolume:any;
	}

}

declare module laya.webgl {
	class BufferStateBase  {
		private _nativeVertexArrayObject:any;

		constructor();
		bind():void;
		unBind():void;
		destroy():void;
		bindForNative():void;
		unBindForNative():void;
	}

}

declare module laya.renders {
	class RenderInfo  {
		static loopStTm:number;
		static loopCount:number;
	}

}

declare module laya.d3.component {
	class AnimatorPlayState  {
		readonly normalizedTime:number;
		readonly duration:number;

		constructor();
	}

}

declare module laya.net {
	class Loader extends laya.events.EventDispatcher  {
		static TEXT:string;
		static JSON:string;
		static PREFAB:string;
		static XML:string;
		static BUFFER:string;
		static IMAGE:string;
		static SOUND:string;
		static ATLAS:string;
		static FONT:string;
		static TTF:string;
		static PLF:string;
		static PLFB:string;
		static HIERARCHY:string;
		static MESH:string;
		static MATERIAL:string;
		static TEXTURE2D:string;
		static TEXTURECUBE:string;
		static ANIMATIONCLIP:string;
		static AVATAR:string;
		static TERRAINHEIGHTDATA:string;
		static TERRAINRES:string;
		static typeMap:any;
		static parserMap:any;
		static maxTimeOut:number;
		static groupMap:any;
		static loadedMap:any;
		protected static atlasMap:any;
		static preLoadedMap:any;
		protected static _imgCache:any;
		protected static _loaders:any[];
		protected static _isWorking:boolean;
		protected static _startIndex:number;
		static getTypeFromUrl(url:string):string;
		protected _url:string;
		protected _type:string;
		protected _http:laya.net.HttpRequest;
		protected _useWorkerLoader:boolean;
		load(url:string,type?:string,cache?:boolean,group?:string,ignoreCache?:boolean,useWorkerLoader?:boolean):void;
		_loadResourceFilter(type:string,url:string):void;
		private _loadHttpRequest:any;
		private _loadHtmlImage:any;
		_loadHttpRequestWhat(url:string,contentType:string):void;
		protected _loadTTF(url:string):void;
		protected _loadImage(url:string):void;
		_loadSound(url:string):void;
		protected onProgress(value:number):void;
		protected onError(message:string):void;
		protected onLoaded(data?:any):void;
		private parsePLFData:any;
		private parsePLFBData:any;
		private parseOnePLFBFile:any;
		protected complete(data:any):void;
		private static checkNext:any;
		endLoad(content?:any):void;
		readonly url:string;
		readonly type:string;
		readonly cache:boolean;
		readonly data:any;
		static clearRes(url:string):void;
		static clearTextureRes(url:string):void;
		static getRes(url:string):any;
		static getAtlas(url:string):any[];
		static cacheRes(url:string,data:any):void;
		static setGroup(url:string,group:string):void;
		static clearResByGroup(group:string):void;
	}

}

declare module laya.d3.core {
	class Bounds implements laya.d3.core.IClone  {
		private _updateFlag:any;
		_boundBox:laya.d3.math.BoundBox;
		setMin(value:laya.d3.math.Vector3):void;
		getMin():laya.d3.math.Vector3;
		setMax(value:laya.d3.math.Vector3):void;
		getMax():laya.d3.math.Vector3;
		setCenter(value:laya.d3.math.Vector3):void;
		getCenter():laya.d3.math.Vector3;
		setExtent(value:laya.d3.math.Vector3):void;
		getExtent():laya.d3.math.Vector3;

		constructor(min:laya.d3.math.Vector3,max:laya.d3.math.Vector3);
		private _getUpdateFlag:any;
		private _setUpdateFlag:any;
		private _getCenter:any;
		private _getExtent:any;
		private _getMin:any;
		private _getMax:any;
		private _rotateExtents:any;
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.effect {
	class EffectBase extends laya.components.Component  {
		duration:number;
		delay:number;
		repeat:number;
		ease:string;
		eventName:string;
		target:laya.display.Sprite;
		autoDestroyAtComplete:boolean;
		protected _comlete:laya.utils.Handler;
		protected _tween:laya.utils.Tween;
		protected _onAwake():void;
		protected _exeTween():void;
		protected _doTween():laya.utils.Tween;
		onReset():void;
	}

}

declare module laya.d3.animation {
	class AnimationNode implements laya.d3.core.IClone  {
		private _children:any;
		name:string;

		constructor(localPosition?:Float32Array,localRotation?:Float32Array,localScale?:Float32Array,worldMatrix?:Float32Array);
		addChild(child:AnimationNode):void;
		removeChild(child:AnimationNode):void;
		getChildByName(name:string):AnimationNode;
		getChildByIndex(index:number):AnimationNode;
		getChildCount():number;
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.particle {
	class ParticleEmitter  {
		private _templet:any;
		private _timeBetweenParticles:any;
		private _previousPosition:any;
		private _timeLeftOver:any;
		private _tempVelocity:any;
		private _tempPosition:any;

		constructor(templet:laya.particle.ParticleTemplateBase,particlesPerSecond:number,initialPosition:Float32Array);
		update(elapsedTime:number,newPosition:Float32Array):void;
	}

}

declare module laya.events {
	class KeyBoardManager  {
		private static _pressKeys:any;
		static enabled:boolean;
		static _event:laya.events.Event;
		static __init__():void;
		private static _addEvent:any;
		private static _dispatch:any;
		static hasKeyDown(key:number):boolean;
	}

}

declare module laya.display {
	class EffectAnimation extends laya.display.FrameAnimation  {
		private static EFFECT_BEGIN:any;
		private _target:any;
		private _playEvent:any;
		private _initData:any;
		private _aniKeys:any;
		private _effectClass:any;
		target:any;
		private _onOtherBegin:any;
		playEvent:string;
		private _addEvent:any;
		private _onPlayAction:any;
		play(start?:any,loop?:boolean,name?:string):void;
		private _recordInitData:any;
		effectClass:string;
		effectData:any;
		protected _displayToIndex(value:number):void;
		protected _displayNodeToFrame(node:any,frame:number,targetDic?:any):void;
		protected _calculateKeyFrames(node:any):void;
	}

}

declare module laya.display.cmd {
	class AlphaCmd  {
		static ID:string;
		alpha:number;
		static create(alpha:number):AlphaCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.physics {
	class CircleCollider extends laya.physics.ColliderBase  {
		private static _temp:any;
		private _x:any;
		private _y:any;
		private _radius:any;
		protected getDef():any;
		private _setShape:any;
		x:number;
		y:number;
		radius:number;
		resetShape(re?:boolean):void;
	}

}

declare module laya.device.motion {
	class RotationInfo  {
		absolute:boolean;
		alpha:number;
		beta:number;
		gamma:number;
		compassAccuracy:number;

		constructor();
	}

}

declare module laya.html.dom {
	class HTMLDocument  {
		static document:HTMLDocument;
		all:laya.html.dom.HTMLElement[];
		styleSheets:any;
		getElementById(id:string):laya.html.dom.HTMLElement;
		setElementById(id:string,e:laya.html.dom.HTMLElement):void;
	}

}

declare module laya.filters {
	class Filter implements laya.filters.IFilter  {
		static BLUR:number;
		static COLOR:number;
		static GLOW:number;

		constructor();
		readonly type:number;
		static _filter:Function;
	}

}

declare module laya.d3.math {
	class BoundBox implements laya.d3.core.IClone  {
		min:laya.d3.math.Vector3;
		max:laya.d3.math.Vector3;

		constructor(min:laya.d3.math.Vector3,max:laya.d3.math.Vector3);
		getCorners(corners:laya.d3.math.Vector3[]):void;
		getCenter(out:laya.d3.math.Vector3):void;
		getExtent(out:laya.d3.math.Vector3):void;
		setCenterAndExtent(center:laya.d3.math.Vector3,extent:laya.d3.math.Vector3):void;
		toDefault():void;
		static createfromPoints(points:laya.d3.math.Vector3[],out:BoundBox):void;
		static merge(box1:BoundBox,box2:BoundBox,out:BoundBox):void;
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.d3.graphics {
	interface IVertex{
		vertexDeclaration:laya.d3.graphics.VertexDeclaration;
	}

}

declare module laya.resource {
	class Context  {
		static ENUM_TEXTALIGN_DEFAULT:number;
		static ENUM_TEXTALIGN_CENTER:number;
		static ENUM_TEXTALIGN_RIGHT:number;
		static _SUBMITVBSIZE:number;
		static _MAXSIZE:number;
		private static _MAXVERTNUM:any;
		static MAXCLIPRECT:laya.maths.Rectangle;
		static _COUNT:number;
		private static SEGNUM:any;
		private static _contextcount:any;
		private _drawTexToDrawTri_Vert:any;
		private _drawTexToDrawTri_Index:any;
		private _tempUV:any;
		private _drawTriUseAbsMatrix:any;
		static __init__():void;
		drawImage(...args:any[]):void;
		getImageData(...args:any[]):any;
		measureText(text:string):any;
		setTransform(...args:any[]):void;
		$transform(a:number,b:number,c:number,d:number,tx:number,ty:number):void;
		lineJoin:string;
		lineCap:string;
		miterLimit:string;
		clearRect(x:number,y:number,width:number,height:number):void;
		drawTexture2(x:number,y:number,pivotX:number,pivotY:number,m:laya.maths.Matrix,args2:any[]):void;
		transformByMatrix(matrix:laya.maths.Matrix,tx:number,ty:number):void;
		saveTransform(matrix:laya.maths.Matrix):void;
		restoreTransform(matrix:laya.maths.Matrix):void;
		drawRect(x:number,y:number,width:number,height:number,fillColor:any,lineColor:any,lineWidth:number):void;
		alpha(value:number):void;
		drawCurves(x:number,y:number,points:any[],lineColor:any,lineWidth:number):void;
		private _fillAndStroke:any;
		static PI2:number;
		static set2DRenderConfig():void;
		private _other:any;
		private _renderNextSubmitIndex:any;
		private _path:any;
		private _primitiveValue2D:any;
		private _width:any;
		private _height:any;
		private _renderCount:any;
		private _isConvexCmd:any;
		meshlist:any[];
		private _transedPoints:any;
		private _temp4Points:any;
		private _clipID_Gen:any;
		private _lastMat_a:any;
		private _lastMat_b:any;
		private _lastMat_c:any;
		private _lastMat_d:any;
		sprite:laya.display.Sprite;
		private static _textRender:any;
		private _fillColor:any;
		private _flushCnt:any;
		private defTexture:any;
		drawTexAlign:boolean;
		isMain:boolean;

		constructor();
		clearBG(r:number,g:number,b:number,a:number):void;
		private _releaseMem:any;
		destroy(keepRT?:boolean):void;
		clear():void;
		size(w:number,h:number):void;
		asBitmap:boolean;
		getMatScaleX():number;
		getMatScaleY():number;
		setFillColor(color:number):void;
		getFillColor():number;
		fillStyle:any;
		globalAlpha:number;
		textAlign:string;
		textBaseline:string;
		globalCompositeOperation:string;
		strokeStyle:any;
		translate(x:number,y:number):void;
		lineWidth:number;
		save():void;
		restore():void;
		font:string;
		fillText(txt:string,x:number,y:number,fontStr:string,color:string,align:string):void;
		private _fillText:any;
		fillWords(words:any[],x:number,y:number,fontStr:string,color:string):void;
		fillBorderWords(words:any[],x:number,y:number,font:string,color:string,borderColor:string,lineWidth:number):void;
		drawText(text:any,x:number,y:number,font:string,color:string,textAlign:string):void;
		strokeWord(text:any,x:number,y:number,font:string,color:string,lineWidth:number,textAlign:string):void;
		fillBorderText(txt:any,x:number,y:number,fontStr:string,fillColor:string,borderColor:string,lineWidth:number,textAlign:string):void;
		private _fillBorderText:any;
		private _fillRect:any;
		fillRect(x:number,y:number,width:number,height:number,fillStyle:any):void;
		fillTexture(texture:laya.resource.Texture,x:number,y:number,width:number,height:number,type:string,offset:laya.maths.Point,other:any):void;
		setColorFilter(filter:laya.filters.ColorFilter):void;
		drawTexture(tex:laya.resource.Texture,x:number,y:number,width:number,height:number):void;
		drawTextures(tex:laya.resource.Texture,pos:any[],tx:number,ty:number):void;
		private _drawTextureAddSubmit:any;
		submitDebugger():void;
		private isSameClipInfo:any;
		drawCallOptimize(enbale:boolean):boolean;
		transform4Points(a:any[],m:laya.maths.Matrix,out:any[]):void;
		clipedOff(pt:any[]):boolean;
		transformQuad(x:number,y:number,w:number,h:number,italicDeg:number,m:laya.maths.Matrix,out:any[]):void;
		pushRT():void;
		popRT():void;
		useRT(rt:laya.resource.RenderTexture2D):void;
		RTRestore(rt:laya.resource.RenderTexture2D):void;
		breakNextMerge():void;
		private _repaintSprite:any;
		drawTextureWithTransform(tex:laya.resource.Texture,x:number,y:number,width:number,height:number,transform:laya.maths.Matrix,tx:number,ty:number,alpha:number,blendMode:string,colorfilter?:laya.filters.ColorFilter,uv?:number[]):void;
		private _flushToTarget:any;
		drawCanvas(canvas:laya.resource.HTMLCanvas,x:number,y:number,width:number,height:number):void;
		drawTarget(rt:laya.resource.RenderTexture2D,x:number,y:number,width:number,height:number,m:laya.maths.Matrix,shaderValue:laya.webgl.shader.d2.value.Value2D,uv?:ArrayLike<number>,blend?:number):boolean;
		drawTriangles(tex:laya.resource.Texture,x:number,y:number,vertices:Float32Array,uvs:Float32Array,indices:Uint16Array,matrix:laya.maths.Matrix,alpha:number,color:laya.filters.ColorFilter,blendMode:string):void;
		transform(a:number,b:number,c:number,d:number,tx:number,ty:number):void;
		setTransformByMatrix(value:laya.maths.Matrix):void;
		rotate(angle:number):void;
		scale(scaleX:number,scaleY:number):void;
		clipRect(x:number,y:number,width:number,height:number):void;
		drawMesh(x:number,y:number,ib:laya.webgl.utils.IndexBuffer2D,vb:laya.webgl.utils.VertexBuffer2D,numElement:number,mat:laya.maths.Matrix,shader:laya.webgl.shader.Shader,shaderValues:laya.webgl.shader.d2.value.Value2D,startIndex?:number):void;
		addRenderObject(o:laya.webgl.submit.ISubmit):void;
		submitElement(start:number,end:number):number;
		flush():number;
		beginPath(convex?:boolean):void;
		closePath():void;
		addPath(points:any[],close:boolean,convex:boolean,dx:number,dy:number):void;
		fill():void;
		private addVGSubmit:any;
		stroke():void;
		moveTo(x:number,y:number):void;
		lineTo(x:number,y:number):void;
		arcTo(x1:number,y1:number,x2:number,y2:number,r:number):void;
		arc(cx:number,cy:number,r:number,startAngle:number,endAngle:number,counterclockwise?:boolean,b?:boolean):void;
		quadraticCurveTo(cpx:number,cpy:number,x:number,y:number):void;
		mixRGBandAlpha(color:number):number;
		strokeRect(x:number,y:number,width:number,height:number,parameterLineWidth:number):void;
		clip():void;
		drawParticle(x:number,y:number,pt:any):void;
		private _getPath:any;
		readonly canvas:laya.resource.HTMLCanvas;
		private static tmpuv1:any;
		private _fillTexture_h:any;
		private _fillTexture_v:any;
		private static tmpUV:any;
		private static tmpUVRect:any;
		drawTextureWithSizeGrid(tex:laya.resource.Texture,tx:number,ty:number,width:number,height:number,sizeGrid:any[],gx:number,gy:number):void;
	}

}

declare module laya.layagl {
	class QuickTestTool  {
		private static showedDic:any;
		private static _rendertypeToStrDic:any;
		private static _typeToNameDic:any;
		static getMCDName(type:number):string;
		static showRenderTypeInfo(type:any,force?:boolean):void;
		static __init__():void;
		_renderType:number;
		_repaint:number;
		_x:number;
		_y:number;

		constructor();
		render(context:laya.resource.Context,x:number,y:number):void;
		private static _PreStageRender:any;
		private static _countDic:any;
		private static _countStart:any;
		private static _i:any;
		private static _countEnd:any;
		static showCountInfo():void;
		static enableQuickTest():void;
	}

}

declare module laya.ani {
	class AnimationTemplet extends laya.resource.Resource  {
		static interpolation:any[];
		private static _LinearInterpolation_0:any;
		private static _QuaternionInterpolation_1:any;
		private static _AngleInterpolation_2:any;
		private static _RadiansInterpolation_3:any;
		private static _Matrix4x4Interpolation_4:any;
		private static _NoInterpolation_5:any;
		private static _BezierInterpolation_6:any;
		private static _BezierInterpolation_7:any;
		protected unfixedCurrentFrameIndexes:Uint32Array;
		protected unfixedCurrentTimes:Float32Array;
		protected unfixedKeyframes:laya.ani.KeyFramesContent[];
		protected unfixedLastAniIndex:number;
		private _boneCurKeyFrm:any;

		constructor();
		parse(data:ArrayBuffer):void;
		getAnimationCount():number;
		getAnimation(aniIndex:number):any;
		getAniDuration(aniIndex:number):number;
		getNodes(aniIndex:number):any;
		getNodeIndexWithName(aniIndex:number,name:string):number;
		getNodeCount(aniIndex:number):number;
		getTotalkeyframesLength(aniIndex:number):number;
		getPublicExtData():ArrayBuffer;
		getAnimationDataWithCache(key:any,cacheDatas:any,aniIndex:number,frameIndex:number):Float32Array;
		setAnimationDataWithCache(key:any,cacheDatas:any[],aniIndex:number,frameIndex:number,data:any):void;
		getNodeKeyFrame(nodeframes:laya.ani.KeyFramesContent[],nodeid:number,tm:number):number;
		getOriginalData(aniIndex:number,originalData:Float32Array,nodesFrameIndices:any[],frameIndex:number,playCurTime:number):void;
		getNodesCurrentFrameIndex(aniIndex:number,playCurTime:number):Uint32Array;
		getOriginalDataUnfixedRate(aniIndex:number,originalData:Float32Array,playCurTime:number):void;
	}

}

declare module laya.ui {
	class Box extends laya.ui.UIComponent implements laya.ui.IBox  {
		private _bgColor:any;
		dataSource:any;
		bgColor:string;
		private _onResize:any;
	}

}

declare module laya.map {
	class TileAniSprite extends laya.display.Sprite  {
		private _tileTextureSet:any;
		private _aniName:any;
		setTileTextureSet(aniName:string,tileTextureSet:laya.map.TileTexSet):void;
		show():void;
		hide():void;
		clearAll():void;
	}

}

declare module laya.maths {
	class Matrix  {
		static EMPTY:Matrix;
		static TEMP:Matrix;
		static _createFun:Function;
		a:number;
		b:number;
		c:number;
		d:number;
		tx:number;
		ty:number;

		constructor(a?:number,b?:number,c?:number,d?:number,tx?:number,ty?:number,nums?:number);
		identity():Matrix;
		setTranslate(x:number,y:number):Matrix;
		translate(x:number,y:number):Matrix;
		scale(x:number,y:number):Matrix;
		rotate(angle:number):Matrix;
		skew(x:number,y:number):Matrix;
		invertTransformPoint(out:laya.maths.Point):laya.maths.Point;
		transformPoint(out:laya.maths.Point):laya.maths.Point;
		transformPointN(out:laya.maths.Point):laya.maths.Point;
		getScaleX():number;
		getScaleY():number;
		invert():Matrix;
		setTo(a:number,b:number,c:number,d:number,tx:number,ty:number):Matrix;
		concat(matrix:Matrix):Matrix;
		static mul(m1:Matrix,m2:Matrix,out:Matrix):Matrix;
		static mul16(m1:Matrix,m2:Matrix,out:any[]):any[];
		scaleEx(x:number,y:number):void;
		rotateEx(angle:number):void;
		clone():Matrix;
		copyTo(dec:Matrix):Matrix;
		toString():string;
		destroy():void;
		recover():void;
		static create():Matrix;
	}

}

declare module laya.utils {
	class CacheManger  {
		static loopTimeLimit:number;
		private static _cacheList:any;
		private static _index:any;

		constructor();
		static regCacheByFunction(disposeFunction:Function,getCacheListFunction:Function):void;
		static unRegCacheByFunction(disposeFunction:Function,getCacheListFunction:Function):void;
		static forceDispose():void;
		static beginCheck(waitTime?:number):void;
		static stopCheck():void;
		private static _checkLoop:any;
	}

}

declare module laya.media {
	class SoundNode extends laya.display.Sprite  {
		url:string;
		private _channel:any;
		private _tar:any;
		private _playEvents:any;
		private _stopEvents:any;

		constructor();
		private _onParentChange:any;
		play(loops?:number,complete?:laya.utils.Handler):void;
		stop():void;
		private _setPlayAction:any;
		private _setPlayActions:any;
		playEvent:string;
		target:laya.display.Sprite;
		stopEvent:string;
	}

}

declare module laya.d3.component {
	class AnimatorState implements laya.d3.resource.IReferenceCounter,laya.d3.core.IClone  {
		private _referenceCount:any;
		name:string;
		speed:number;
		clipStart:number;
		clipEnd:number;
		clip:laya.d3.animation.AnimationClip;

		constructor();
		_getReferenceCount():number;
		_addReference(count?:number):void;
		_removeReference(count?:number):void;
		_clearReference():void;
		addScript(type:new () => any):laya.d3.animation.AnimatorStateScript;
		getScript(type:new () => any):laya.d3.animation.AnimatorStateScript;
		getScripts(type:new () => any):laya.d3.animation.AnimatorStateScript[];
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.renders {
	class RenderSprite  {
		static renders:any[];
		protected static NORENDER:RenderSprite;
		private static _initRenderFun:any;
		private static _getTypeRender:any;

		constructor(type:number,next:RenderSprite);
		protected onCreate(type:number):void;
		static tempUV:any[];
		static tmpTarget(ctx:laya.resource.Context,rt:laya.resource.RenderTexture2D,w:number,h:number):void;
		static recycleTarget(rt:laya.resource.RenderTexture2D):void;
		static setBlendMode(blendMode:string):void;
	}

}

declare module laya.net {
	class LoaderManager extends laya.events.EventDispatcher  {
		private static _resMap:any;
		static createMap:any;
		retryNum:number;
		retryDelay:number;
		maxLoader:number;
		private _loaders:any;
		private _loaderCount:any;
		private _resInfos:any;
		private _infoPool:any;
		private _maxPriority:any;
		private _failRes:any;
		private _statInfo:any;
		getProgress():number;
		resetProgress():void;

		constructor();
		create(url:any,complete?:laya.utils.Handler,progress?:laya.utils.Handler,type?:string,constructParams?:any[],propertyParams?:any,priority?:number,cache?:boolean):void;
		private _createOne:any;
		load(url:any,complete?:laya.utils.Handler,progress?:laya.utils.Handler,type?:string,priority?:number,cache?:boolean,group?:string,ignoreCache?:boolean,useWorkerLoader?:boolean):LoaderManager;
		private _resInfoLoaded:any;
		private _next:any;
		private _doLoad:any;
		private _endLoad:any;
		private _addReTry:any;
		clearRes(url:string):void;
		clearTextureRes(url:string):void;
		getRes(url:string):any;
		cacheRes(url:string,data:any):void;
		setGroup(url:string,group:string):void;
		clearResByGroup(group:string):void;
		static cacheRes(url:string,data:any):void;
		clearUnLoaded():void;
		cancelLoadByUrls(urls:any[]):void;
		cancelLoadByUrl(url:string):void;
		private _loadAssets:any;
		decodeBitmaps(urls:any[]):void;
		private _decodeTexture:any;
	}

}

declare module laya.effect {
	class FadeIn extends laya.effect.EffectBase  {
		protected _doTween():laya.utils.Tween;
	}

}

declare module laya.d3.animation {
	class AnimationTransform3D extends laya.events.EventDispatcher  {
		private static _tempVector3:any;
		private static _angleToRandin:any;
		private _localMatrix:any;
		private _worldMatrix:any;
		private _localPosition:any;
		private _localRotation:any;
		private _localScale:any;
		private _localQuaternionUpdate:any;
		private _locaEulerlUpdate:any;
		private _localUpdate:any;
		private _parent:any;
		private _children:any;

		constructor(owner:laya.d3.animation.AnimationNode,localPosition?:Float32Array,localRotation?:Float32Array,localScale?:Float32Array,worldMatrix?:Float32Array);
		private _getlocalMatrix:any;
		private _onWorldTransform:any;
		getWorldMatrix():Float32Array;
		setParent(value:AnimationTransform3D):void;
	}

}

declare module laya.d3.physics {
	class CharacterController extends laya.d3.physics.PhysicsComponent  {
		static UPAXIS_X:number;
		static UPAXIS_Y:number;
		static UPAXIS_Z:number;
		fallSpeed:number;
		jumpSpeed:number;
		gravity:laya.d3.math.Vector3;
		maxSlope:number;
		readonly isGrounded:boolean;
		stepHeight:number;
		upAxis:laya.d3.math.Vector3;

		constructor(stepheight?:number,upAxis?:laya.d3.math.Vector3,collisionGroup?:number,canCollideWith?:number);
		_onShapeChange(colShape:laya.d3.physics.shape.ColliderShape):void;
		_onAdded():void;
		_addToSimulation():void;
		_removeFromSimulation():void;
		_cloneTo(dest:laya.components.Component):void;
		protected _onDestroy():void;
		move(movement:laya.d3.math.Vector3):void;
		jump(velocity?:laya.d3.math.Vector3):void;
	}

}

declare module laya.webgl {
	class LayaGPU  {
		private static _extentionVendorPrefixes:any;
		private _gl:any;
		private _vaoExt:any;
		private _angleInstancedArrays:any;

		constructor(gl:any,isWebGL2:boolean);
		private _getExtension:any;
		createVertexArray():any;
		bindVertexArray(vertexArray:any):void;
		deleteVertexArray(vertexArray:any):void;
		isVertexArray(vertexArray:any):void;
		drawElementsInstanced(mode:number,count:number,type:number,offset:number,instanceCount:number):void;
		drawArraysInstanced(mode:number,first:number,count:number,instanceCount:number):void;
		vertexAttribDivisor(index:number,divisor:number):void;
		supportInstance():boolean;
	}

}

declare module laya.particle {
	class ParticleSetting  {
		textureName:string;
		textureCount:number;
		maxPartices:number;
		duration:number;
		ageAddScale:number;
		emitterVelocitySensitivity:number;
		minStartSize:number;
		maxStartSize:number;
		minEndSize:number;
		maxEndSize:number;
		minHorizontalVelocity:number;
		maxHorizontalVelocity:number;
		minVerticalVelocity:number;
		maxVerticalVelocity:number;
		endVelocity:number;
		gravity:Float32Array;
		minRotateSpeed:number;
		maxRotateSpeed:number;
		minStartRadius:number;
		maxStartRadius:number;
		minEndRadius:number;
		maxEndRadius:number;
		minHorizontalStartRadian:number;
		maxHorizontalStartRadian:number;
		minVerticalStartRadian:number;
		maxVerticalStartRadian:number;
		useEndRadian:boolean;
		minHorizontalEndRadian:number;
		maxHorizontalEndRadian:number;
		minVerticalEndRadian:number;
		maxVerticalEndRadian:number;
		minStartColor:Float32Array;
		maxStartColor:Float32Array;
		minEndColor:Float32Array;
		maxEndColor:Float32Array;
		colorComponentInter:boolean;
		disableColor:boolean;
		blendState:number;
		emitterType:string;
		emissionRate:number;
		pointEmitterPosition:Float32Array;
		pointEmitterPositionVariance:Float32Array;
		pointEmitterVelocity:Float32Array;
		pointEmitterVelocityAddVariance:Float32Array;
		boxEmitterCenterPosition:Float32Array;
		boxEmitterSize:Float32Array;
		boxEmitterVelocity:Float32Array;
		boxEmitterVelocityAddVariance:Float32Array;
		sphereEmitterCenterPosition:Float32Array;
		sphereEmitterRadius:number;
		sphereEmitterVelocity:number;
		sphereEmitterVelocityAddVariance:number;
		ringEmitterCenterPosition:Float32Array;
		ringEmitterRadius:number;
		ringEmitterVelocity:number;
		ringEmitterVelocityAddVariance:number;
		ringEmitterUp:number;
		positionVariance:Float32Array;

		constructor();
		private static _defaultSetting:any;
		static checkSetting(setting:any):void;
	}

}

declare module laya.events {
	class KeyLocation  {
		static STANDARD:number;
		static LEFT:number;
		static RIGHT:number;
		static NUM_PAD:number;
	}

}

declare module laya.display {
	class FrameAnimation extends laya.display.AnimationBase  {
		private static _sortIndexFun:any;
		_targetDic:any;
		_animationData:any;
		protected _usedFrames:any[];

		constructor();
		clear():laya.display.AnimationBase;
		protected _displayToIndex(value:number):void;
		protected _displayNodeToFrame(node:any,frame:number,targetDic?:any):void;
		private _calculateDatas:any;
		protected _calculateKeyFrames(node:any):void;
		resetNodes():void;
		private _calculateNodePropFrames:any;
		private _dealKeyFrame:any;
		private _calculateFrameValues:any;
	}

}

declare module laya.display.cmd {
	class ClipRectCmd  {
		static ID:string;
		x:number;
		y:number;
		width:number;
		height:number;
		static create(x:number,y:number,width:number,height:number):ClipRectCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.d3.resource {
	interface IReferenceCounter{
		_getReferenceCount():number;
		_addReference(count:number):void;
		_removeReference(count:number):void;
		_clearReference():void;
	}

}

declare module laya.webgl.canvas {
	class BlendMode  {
		static activeBlendFunction:Function;
		static NAMES:any[];
		static TOINT:any;
		static NORMAL:string;
		static ADD:string;
		static MULTIPLY:string;
		static SCREEN:string;
		static OVERLAY:string;
		static LIGHT:string;
		static MASK:string;
		static DESTINATIONOUT:string;
		static LIGHTER:string;
		static fns:any[];
		static targetFns:any[];
		static BlendNormal(gl:WebGLRenderingContext):void;
		static BlendAdd(gl:WebGLRenderingContext):void;
		static BlendMultiply(gl:WebGLRenderingContext):void;
		static BlendScreen(gl:WebGLRenderingContext):void;
		static BlendOverlay(gl:WebGLRenderingContext):void;
		static BlendLight(gl:WebGLRenderingContext):void;
		static BlendNormalTarget(gl:WebGLRenderingContext):void;
		static BlendAddTarget(gl:WebGLRenderingContext):void;
		static BlendMultiplyTarget(gl:WebGLRenderingContext):void;
		static BlendScreenTarget(gl:WebGLRenderingContext):void;
		static BlendOverlayTarget(gl:WebGLRenderingContext):void;
		static BlendLightTarget(gl:WebGLRenderingContext):void;
		static BlendMask(gl:WebGLRenderingContext):void;
		static BlendDestinationOut(gl:WebGLRenderingContext):void;
	}

}

declare module laya.physics {
	class ColliderBase extends laya.components.Component  {
		private _isSensor:any;
		private _density:any;
		private _friction:any;
		private _restitution:any;
		label:string;
		protected _shape:any;
		protected _def:any;
		fixture:any;
		rigidBody:laya.physics.RigidBody;
		protected getDef():any;
		protected _onEnable():void;
		private _checkRigidBody:any;
		protected _onDestroy():void;
		isSensor:boolean;
		density:number;
		friction:number;
		restitution:number;
		refresh():void;
		resetShape(re?:boolean):void;
		readonly isSingleton:boolean;
	}

}

declare module laya.html.dom {
enum HTMLElementType {
    BASE = 0,
    IMAGE = 1
}	class HTMLElement  {
		private static _EMPTYTEXT:any;
		eletype:HTMLElementType;
		URI:laya.net.URL;
		parent:HTMLElement;
		_style:laya.html.utils.HTMLStyle;
		protected _text:any;
		protected _children:any[];
		protected _x:number;
		protected _y:number;
		protected _width:number;
		protected _height:number;
		static formatURL1(url:string,basePath?:string):string;

		constructor();
		protected _creates():void;
		reset():HTMLElement;
		id:string;
		repaint(recreate?:boolean):void;
		parentRepaint(recreate?:boolean):void;
		innerTEXT:string;
		protected _setParent(value:HTMLElement):void;
		appendChild(c:HTMLElement):HTMLElement;
		addChild(c:HTMLElement):HTMLElement;
		removeChild(c:HTMLElement):HTMLElement;
		static getClassName(tar:any):string;
		destroy():void;
		destroyChildren():void;
		readonly style:laya.html.utils.HTMLStyle;
		x:number;
		y:number;
		width:number;
		height:number;
		href:string;
		formatURL(url:string):string;
		color:string;
		className:string;
		drawToGraphic(graphic:laya.display.Graphics,gX:number,gY:number,recList:any[]):void;
		renderSelfToGraphic(graphic:laya.display.Graphics,gX:number,gY:number,recList:any[]):void;
		private workLines:any;
		private createOneLine:any;
	}

}

declare module laya.html.utils {
	interface ILayout{
		x:number;
		y:number;
		width:number;
		height:number;
	}

}

declare module laya.filters {
	class GlowFilter extends laya.filters.Filter  {
		private _elements:any;
		private _color:any;

		constructor(color:string,blur?:number,offX?:number,offY?:number);
		readonly type:number;
		offY:number;
		offX:number;
		getColor():any[];
		blur:number;
		getColorNative():Float32Array;
		getBlurInfo1Native():Float32Array;
		getBlurInfo2Native():Float32Array;
	}

}

declare module laya.d3.shader {
	class DefineDatas implements laya.d3.core.IClone  {

		constructor();
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.d3.math {
	class BoundFrustum  {
		private _matrix:any;
		private _near:any;
		private _far:any;
		private _left:any;
		private _right:any;
		private _top:any;
		private _bottom:any;

		constructor(matrix:laya.d3.math.Matrix4x4);
		matrix:laya.d3.math.Matrix4x4;
		readonly near:laya.d3.math.Plane;
		readonly far:laya.d3.math.Plane;
		readonly left:laya.d3.math.Plane;
		readonly right:laya.d3.math.Plane;
		readonly top:laya.d3.math.Plane;
		readonly bottom:laya.d3.math.Plane;
		equalsBoundFrustum(other:BoundFrustum):boolean;
		equalsObj(obj:any):boolean;
		getPlane(index:number):laya.d3.math.Plane;
		private static _getPlanesFromMatrix:any;
		private static _get3PlaneInterPoint:any;
		getCorners(corners:laya.d3.math.Vector3[]):void;
		containsPoint(point:laya.d3.math.Vector3):number;
		containsBoundBox(box:laya.d3.math.BoundBox):number;
		containsBoundSphere(sphere:laya.d3.math.BoundSphere):number;
	}

}

declare module laya.d3.shadowMap {
	class ParallelSplitShadowMap  {

		constructor();
		setInfo(scene:laya.d3.core.scene.Scene3D,maxDistance:number,globalParallelDir:laya.d3.math.Vector3,shadowMapTextureSize:number,numberOfPSSM:number,PCFType:number):void;
		setPCFType(PCFtype:number):void;
		getPCFType():number;
		setFarDistance(value:number):void;
		getFarDistance():number;
		shadowMapCount:number;
		private _beginSampler:any;
		calcSplitFrustum(sceneCamera:laya.d3.core.BaseCamera):void;
		static multiplyMatrixOutFloat32Array(left:laya.d3.math.Matrix4x4,right:laya.d3.math.Matrix4x4,out:Float32Array):void;
		setShadowMapTextureSize(size:number):void;
		disposeAllRenderTarget():void;
	}

}

declare module laya.d3 {
	class Touch implements laya.resource.ISingletonElement  {
		private _indexInList:any;
		readonly identifier:number;
		readonly position:laya.d3.math.Vector2;
		_getIndexInList():number;
		_setIndexInList(index:number):void;
	}

}

declare module laya.resource {
	class HTMLCanvas extends laya.resource.Bitmap  {
		private _ctx:any;
		readonly source:any;

		constructor(createCanvas?:boolean);
		clear():void;
		destroy():void;
		release():void;
		readonly context:laya.resource.Context;
		getContext(contextID:string,other?:any):laya.resource.Context;
		getMemSize():number;
		size(w:number,h:number):void;
		getTexture():laya.resource.Texture;
		toBase64(type:string,encoderOptions:number):string;
		toBase64Async(type:string,encoderOptions:number,callBack:Function):void;
	}

}

declare module laya.d3.text {
	class TextMesh  {
		private static _indexBuffer:any;
		private _vertices:any;
		private _vertexBuffer:any;
		private _text:any;
		private _fontSize:any;
		private _color:any;
		text:string;
		fontSize:number;
		color:laya.d3.math.Color;

		constructor();
		private _createVertexBuffer:any;
		private _resizeVertexBuffer:any;
		private _addChar:any;
	}

}

declare module laya.display.css {
	class SpriteStyle  {
		static EMPTY:SpriteStyle;
		scaleX:number;
		scaleY:number;
		skewX:number;
		skewY:number;
		pivotX:number;
		pivotY:number;
		rotation:number;
		alpha:number;
		scrollRect:laya.maths.Rectangle;
		viewport:laya.maths.Rectangle;
		hitArea:any;
		dragging:laya.utils.Dragging;
		blendMode:string;

		constructor();
		reset():SpriteStyle;
		recover():void;
		static create():SpriteStyle;
	}

}

declare module laya.d3.loaders {
	class MeshReader  {

		constructor();
		static read(data:ArrayBuffer,mesh:laya.d3.resource.models.Mesh,subMeshes:laya.d3.resource.models.SubMesh[]):void;
	}

}

declare module laya.ui {
	class Button extends laya.ui.UIComponent implements laya.ui.ISelect  {
		protected static stateMap:any;
		toggle:boolean;
		protected _bitmap:laya.ui.AutoBitmap;
		protected _text:laya.display.Text;
		protected _labelColors:any[];
		protected _strokeColors:any[];
		protected _state:number;
		protected _selected:boolean;
		protected _skin:string;
		protected _autoSize:boolean;
		protected _stateNum:number;
		protected _sources:any[];
		protected _clickHandler:laya.utils.Handler;
		protected _stateChanged:boolean;

		constructor(skin?:string,label?:string);
		destroy(destroyChild?:boolean):void;
		protected createChildren():void;
		protected createText():void;
		protected initialize():void;
		protected onMouse(e:laya.events.Event):void;
		skin:string;
		protected _skinLoaded():void;
		stateNum:number;
		protected changeClips():void;
		protected measureWidth():number;
		protected measureHeight():number;
		label:string;
		selected:boolean;
		protected state:number;
		protected changeState():void;
		labelColors:string;
		strokeColors:string;
		labelPadding:string;
		labelSize:number;
		labelStroke:number;
		labelStrokeColor:string;
		labelBold:boolean;
		labelFont:string;
		labelAlign:string;
		clickHandler:laya.utils.Handler;
		readonly text:laya.display.Text;
		sizeGrid:string;
		width:number;
		height:number;
		dataSource:any;
		iconOffset:string;
		protected _setStateChanged():void;
	}

}

declare module laya.map {
	class TiledMap  {
		static ORIENTATION_ORTHOGONAL:string;
		static ORIENTATION_ISOMETRIC:string;
		static ORIENTATION_STAGGERED:string;
		static ORIENTATION_HEXAGONAL:string;
		static RENDERORDER_RIGHTDOWN:string;
		static RENDERORDER_RIGHTUP:string;
		static RENDERORDER_LEFTDOWN:string;
		static RENDERORDER_LEFTUP:string;
		private _jsonData:any;
		private _tileTexSetArr:any;
		private _texArray:any;
		private _x:any;
		private _y:any;
		private _width:any;
		private _height:any;
		private _mapW:any;
		private _mapH:any;
		private _mapTileW:any;
		private _mapTileH:any;
		private _rect:any;
		private _paddingRect:any;
		private _mapSprite:any;
		private _layerArray:any;
		private _renderLayerArray:any;
		private _gridArray:any;
		private _showGridKey:any;
		private _totalGridNum:any;
		private _gridW:any;
		private _gridH:any;
		private _gridWidth:any;
		private _gridHeight:any;
		private _jsonLoader:any;
		private _loader:any;
		private _tileSetArray:any;
		private _currTileSet:any;
		private _completeHandler:any;
		private _mapRect:any;
		private _mapLastRect:any;
		private _index:any;
		private _animationDic:any;
		private _properties:any;
		private _tileProperties:any;
		private _tileProperties2:any;
		private _orientation:any;
		private _renderOrder:any;
		private _colorArray:any;
		private _scale:any;
		private _pivotScaleX:any;
		private _pivotScaleY:any;
		private _centerX:any;
		private _centerY:any;
		private _viewPortWidth:any;
		private _viewPortHeight:any;
		private _enableLinear:any;
		private _resPath:any;
		private _pathArray:any;
		private _limitRange:any;
		autoCache:boolean;
		autoCacheType:string;
		enableMergeLayer:boolean;
		removeCoveredTile:boolean;
		showGridTextureCount:boolean;
		antiCrack:boolean;
		cacheAllAfterInit:boolean;

		constructor();
		createMap(mapName:string,viewRect:laya.maths.Rectangle,completeHandler:laya.utils.Handler,viewRectPadding?:laya.maths.Rectangle,gridSize?:laya.maths.Point,enableLinear?:boolean,limitRange?:boolean):void;
		private onJsonComplete:any;
		private mergePath:any;
		private _texutreStartDic:any;
		private onTextureComplete:any;
		private adptTexture:any;
		private initMap:any;
		private addTileProperties:any;
		getTileUserData(id:number,sign:string,defaultV?:any):any;
		private adptTiledMapData:any;
		private removeCoverd:any;
		private collectCovers:any;
		getTexture(index:number):laya.map.TileTexSet;
		getMapProperties(name:string):any;
		getTileProperties(index:number,id:number,name:string):any;
		getSprite(index:number,width:number,height:number):laya.map.GridSprite;
		setViewPortPivotByScale(scaleX:number,scaleY:number):void;
		scale:number;
		moveViewPort(moveX:number,moveY:number):void;
		changeViewPort(moveX:number,moveY:number,width:number,height:number):void;
		changeViewPortBySize(width:number,height:number,rect?:laya.maths.Rectangle):laya.maths.Rectangle;
		private updateViewPort:any;
		private clipViewPort:any;
		private showGrid:any;
		private cacheAllGrid:any;
		private static _tempCanvas:any;
		private cacheGridsArray:any;
		private getGridArray:any;
		private hideGrid:any;
		getLayerObject(layerName:string,objectName:string):laya.map.GridSprite;
		destroy():void;
		readonly tileWidth:number;
		readonly tileHeight:number;
		readonly width:number;
		readonly height:number;
		readonly numColumnsTile:number;
		readonly numRowsTile:number;
		readonly viewPortX:number;
		readonly viewPortY:number;
		readonly viewPortWidth:number;
		readonly viewPortHeight:number;
		readonly x:number;
		readonly y:number;
		readonly gridWidth:number;
		readonly gridHeight:number;
		readonly numColumnsGrid:number;
		readonly numRowsGrid:number;
		readonly orientation:string;
		readonly renderOrder:string;
		mapSprite():laya.display.Sprite;
		getLayerByName(layerName:string):laya.map.MapLayer;
		getLayerByIndex(index:number):laya.map.MapLayer;
	}

}

declare module laya.d3.core {
	class Camera extends laya.d3.core.BaseCamera  {
		private _aspectRatio:any;
		private _viewport:any;
		private _normalizedViewport:any;
		private _viewMatrix:any;
		private _projectionMatrix:any;
		private _projectionViewMatrix:any;
		private _boundFrustum:any;
		private _updateViewMatrix:any;
		private _postProcess:any;
		private _enableHDR:any;
		enableRender:boolean;
		aspectRatio:number;
		viewport:laya.d3.math.Viewport;
		normalizedViewport:laya.d3.math.Viewport;
		readonly viewMatrix:laya.d3.math.Matrix4x4;
		projectionMatrix:laya.d3.math.Matrix4x4;
		readonly projectionViewMatrix:laya.d3.math.Matrix4x4;
		readonly boundFrustum:laya.d3.math.BoundFrustum;
		renderTarget:laya.d3.resource.RenderTexture;
		postProcess:laya.d3.component.PostProcess;
		enableHDR:boolean;

		constructor(aspectRatio?:number,nearPlane?:number,farPlane?:number);
		_isLayerVisible(layer:number):boolean;
		private _calculationViewport:any;
		_parse(data:any,spriteMap:any):void;
		protected _calculateProjectionMatrix():void;
		render(shader?:laya.d3.shader.Shader3D,replacementTag?:string):void;
		viewportPointToRay(point:laya.d3.math.Vector2,out:laya.d3.math.Ray):void;
		normalizedViewportPointToRay(point:laya.d3.math.Vector2,out:laya.d3.math.Ray):void;
		worldToViewportPoint(position:laya.d3.math.Vector3,out:laya.d3.math.Vector3):void;
		worldToNormalizedViewportPoint(position:laya.d3.math.Vector3,out:laya.d3.math.Vector3):void;
		convertScreenCoordToOrthographicCoord(source:laya.d3.math.Vector3,out:laya.d3.math.Vector3):boolean;
		destroy(destroyChild?:boolean):void;
		addCommandBuffer(event:number,commandBuffer:laya.d3.core.render.command.CommandBuffer):void;
		removeCommandBuffer(event:number,commandBuffer:laya.d3.core.render.command.CommandBuffer):void;
		removeCommandBuffers(event:number):void;
	}

}

declare module laya.maths {
	class Point  {
		static TEMP:Point;
		static EMPTY:Point;
		x:number;
		y:number;

		constructor(x?:number,y?:number);
		static create():Point;
		setTo(x:number,y:number):Point;
		reset():Point;
		recover():void;
		distance(x:number,y:number):number;
		toString():string;
		normalize():void;
		copy(point:Point):Point;
	}

}

declare module laya.ani {
	class GraphicsAni extends laya.display.Graphics  {
		drawSkin(skinA:laya.ani.bone.canvasmesh.SkinMeshForGraphic,alpha:number):void;
		private static _caches:any;
		static create():GraphicsAni;
		static recycle(graphics:GraphicsAni):void;
	}

}

declare module laya.utils {
	class CallLater  {
		static I:CallLater;
		private _pool:any;
		private _map:any;
		private _laters:any;
		private _getHandler:any;
		callLater(caller:any,method:Function,args?:any[]):void;
		runCallLater(caller:any,method:Function):void;
	}

}

declare module laya.ani.bone {
	class Bone  {
		static ShowBones:any;
		name:string;
		root:Bone;
		parentBone:Bone;
		length:number;
		transform:laya.ani.bone.Transform;
		resultTransform:laya.ani.bone.Transform;
		resultMatrix:laya.maths.Matrix;
		inheritScale:boolean;
		inheritRotation:boolean;
		rotation:number;
		resultRotation:number;
		d:number;
		private _tempMatrix:any;
		private _children:any;
		private _sprite:any;

		constructor();
		setTempMatrix(matrix:laya.maths.Matrix):void;
		update(pMatrix?:laya.maths.Matrix):void;
		updateChild():void;
		setRotation(rd:number):void;
		updateDraw(x:number,y:number):void;
		addChild(bone:Bone):void;
		findBone(boneName:string):Bone;
		localToWorld(local:number[]):void;
	}

}

declare module laya.net {
	class LocalStorage  {
		static _baseClass:any;
		static items:any;
		static support:boolean;
		static __init__():boolean;
		static setItem(key:string,value:string):void;
		static getItem(key:string):string;
		static setJSON(key:string,value:any):void;
		static getJSON(key:string):any;
		static removeItem(key:string):void;
		static clear():void;
	}

}

declare module laya.effect {
	class FadeOut extends laya.effect.EffectBase  {
		protected _doTween():laya.utils.Tween;
	}

}

declare module laya.d3.animation {
	class AnimatorStateScript  {

		constructor();
		onStateEnter():void;
		onStateUpdate():void;
		onStateExit():void;
	}

}

declare module laya.media.webaudio {
	class WebAudioSound extends laya.events.EventDispatcher  {
		private static _dataCache:any;
		static webAudioEnabled:boolean;
		static ctx:any;
		static buffs:any[];
		static isDecoding:boolean;
		static _miniBuffer:any;
		static e:laya.events.EventDispatcher;
		private static _unlocked:any;
		static tInfo:any;
		private static __loadingSound:any;
		url:string;
		loaded:boolean;
		data:ArrayBuffer;
		audioBuffer:any;
		private __toPlays:any;
		private _disposed:any;
		static decode():void;
		private static _done:any;
		private static _fail:any;
		private static _playEmptySound:any;
		private static _unlock:any;
		static initWebAudio():void;
		load(url:string):void;
		private _err:any;
		private _loaded:any;
		private _removeLoadEvents:any;
		private __playAfterLoaded:any;
		play(startTime?:number,loops?:number,channel?:laya.media.SoundChannel):laya.media.SoundChannel;
		readonly duration:number;
		dispose():void;
	}

}

declare module laya.d3.physics {
	class Collision  {
		contacts:laya.d3.physics.ContactPoint[];
		other:laya.d3.physics.PhysicsComponent;

		constructor();
	}

}

declare module laya.events {
	class MouseManager  {
		static instance:MouseManager;
		static enabled:boolean;
		static multiTouchEnabled:boolean;
		mouseX:number;
		mouseY:number;
		disableMouseEvent:boolean;
		mouseDownTime:number;
		mouseMoveAccuracy:number;
		private static _isTouchRespond:any;
		private _stage:any;
		private _captureSp:any;
		private _captureChain:any;
		private _captureExlusiveMode:any;
		private _hitCaputreSp:any;
		private _point:any;
		private _rect:any;
		private _target:any;
		private _lastMoveTimer:any;
		private _isLeftMouse:any;
		private _prePoint:any;
		private _touchIDs:any;
		private _curTouchID:any;
		private _id:any;
		private static _isFirstTouch:any;
		__init__(stage:laya.display.Stage,canvas:any):void;
		private _tTouchID:any;
		private initEvent:any;
		private checkMouseWheel:any;
		private onMouseMove:any;
		private onMouseDown:any;
		private onMouseUp:any;
		private check:any;
		private hitTest:any;
		private _checkAllBaseUI:any;
		check3DUI(mousex:number,mousey:number,callback:Function):boolean;
		handleExclusiveCapture(mousex:number,mousey:number,callback:Function):boolean;
		handleCapture(mousex:number,mousey:number,callback:Function):boolean;
		runEvent(evt:any):void;
		setCapture(sp:laya.display.Sprite,exclusive?:boolean):void;
		releaseCapture():void;
	}

}

declare module laya.display {
	class Graphics  {
		private _cmds:any;
		protected _vectorgraphArray:any[];
		private _graphicBounds:any;
		autoDestroy:boolean;

		constructor();
		destroy():void;
		clear(recoverCmds?:boolean):void;
		private _clearBoundsCache:any;
		private _initGraphicBounds:any;
		cmds:any[];
		getBounds(realSize?:boolean):laya.maths.Rectangle;
		getBoundPoints(realSize?:boolean):any[];
		drawImage(texture:laya.resource.Texture,x?:number,y?:number,width?:number,height?:number):laya.display.cmd.DrawImageCmd;
		drawTexture(texture:laya.resource.Texture,x?:number,y?:number,width?:number,height?:number,matrix?:laya.maths.Matrix,alpha?:number,color?:string,blendMode?:string,uv?:number[]):laya.display.cmd.DrawTextureCmd;
		drawTextures(texture:laya.resource.Texture,pos:any[]):laya.display.cmd.DrawTexturesCmd;
		drawTriangles(texture:laya.resource.Texture,x:number,y:number,vertices:Float32Array,uvs:Float32Array,indices:Uint16Array,matrix?:laya.maths.Matrix,alpha?:number,color?:string,blendMode?:string):laya.display.cmd.DrawTrianglesCmd;
		fillTexture(texture:laya.resource.Texture,x:number,y:number,width?:number,height?:number,type?:string,offset?:laya.maths.Point):laya.display.cmd.FillTextureCmd;
		clipRect(x:number,y:number,width:number,height:number):laya.display.cmd.ClipRectCmd;
		fillText(text:string,x:number,y:number,font:string,color:string,textAlign:string):laya.display.cmd.FillTextCmd;
		fillBorderText(text:string,x:number,y:number,font:string,fillColor:string,borderColor:string,lineWidth:number,textAlign:string):laya.display.cmd.FillBorderTextCmd;
		fillWords(words:any[],x:number,y:number,font:string,color:string):laya.display.cmd.FillWordsCmd;
		fillBorderWords(words:any[],x:number,y:number,font:string,fillColor:string,borderColor:string,lineWidth:number):laya.display.cmd.FillBorderWordsCmd;
		strokeText(text:string,x:number,y:number,font:string,color:string,lineWidth:number,textAlign:string):laya.display.cmd.StrokeTextCmd;
		alpha(alpha:number):laya.display.cmd.AlphaCmd;
		transform(matrix:laya.maths.Matrix,pivotX?:number,pivotY?:number):laya.display.cmd.TransformCmd;
		rotate(angle:number,pivotX?:number,pivotY?:number):laya.display.cmd.RotateCmd;
		scale(scaleX:number,scaleY:number,pivotX?:number,pivotY?:number):laya.display.cmd.ScaleCmd;
		translate(tx:number,ty:number):laya.display.cmd.TranslateCmd;
		save():laya.display.cmd.SaveCmd;
		restore():laya.display.cmd.RestoreCmd;
		replaceText(text:string):boolean;
		private _isTextCmd:any;
		replaceTextColor(color:string):void;
		private _setTextCmdColor:any;
		loadImage(url:string,x?:number,y?:number,width?:number,height?:number,complete?:Function):void;
		drawLine(fromX:number,fromY:number,toX:number,toY:number,lineColor:string,lineWidth?:number):laya.display.cmd.DrawLineCmd;
		drawLines(x:number,y:number,points:any[],lineColor:any,lineWidth?:number):laya.display.cmd.DrawLinesCmd;
		drawCurves(x:number,y:number,points:any[],lineColor:any,lineWidth?:number):laya.display.cmd.DrawCurvesCmd;
		drawRect(x:number,y:number,width:number,height:number,fillColor:any,lineColor?:any,lineWidth?:number):laya.display.cmd.DrawRectCmd;
		drawCircle(x:number,y:number,radius:number,fillColor:any,lineColor?:any,lineWidth?:number):laya.display.cmd.DrawCircleCmd;
		drawPie(x:number,y:number,radius:number,startAngle:number,endAngle:number,fillColor:any,lineColor?:any,lineWidth?:number):laya.display.cmd.DrawPieCmd;
		drawPoly(x:number,y:number,points:any[],fillColor:any,lineColor?:any,lineWidth?:number):laya.display.cmd.DrawPolyCmd;
		drawPath(x:number,y:number,paths:any[],brush?:any,pen?:any):laya.display.cmd.DrawPathCmd;
		draw9Grid(texture:laya.resource.Texture,x?:number,y?:number,width?:number,height?:number,sizeGrid?:any[]):void;
	}

}

declare module laya.webgl.canvas {
	class DrawStyle  {
		static DEFAULT:DrawStyle;
		_color:laya.utils.ColorUtils;
		static create(value:any):DrawStyle;

		constructor(value:any);
		setValue(value:any):void;
		reset():void;
		toInt():number;
		equal(value:any):boolean;
		toColorStr():string;
	}

}

declare module laya.physics {
	class IPhysics  {
		static RigidBody:laya.physics.RigidBody;
		static Physics:laya.physics.Physics;
	}

}

declare module laya.html.dom {
	class HTMLHitRect  {
		rec:laya.maths.Rectangle;
		href:string;

		constructor();
		reset():HTMLHitRect;
		recover():void;
		static create():HTMLHitRect;
	}

}

declare module laya.filters {
	class GlowFilterGLRender  {
		private setShaderInfo:any;
		render(rt:laya.resource.RenderTexture2D,ctx:laya.resource.Context,width:number,height:number,filter:laya.filters.GlowFilter):void;
	}

}

declare module laya.html.utils {
	class Layout  {
		private static DIV_ELEMENT_PADDING:any;
		private static _will:any;
		static later(element:laya.html.dom.HTMLElement):void;
		static layout(element:laya.html.dom.HTMLElement):any[];
		static _multiLineLayout(element:laya.html.dom.HTMLElement):any[];
	}

}

declare module laya.d3.resource {
	class RenderTexture extends laya.resource.BaseTexture  {
		static readonly currentActive:RenderTexture;
		static createFromPool(width:number,height:number,format?:number,depthStencilFormat?:number,filterMode?:number):RenderTexture;
		static recoverToPool(renderTexture:RenderTexture):void;
		readonly depthStencilFormat:number;
		readonly defaulteTexture:laya.resource.BaseTexture;

		constructor(width:number,height:number,format?:number,depthStencilFormat?:number);
		getData(x:number,y:number,width:number,height:number,out:Uint8Array):Uint8Array;
		protected _disposeResource():void;
	}

}

declare module laya.d3.math {
	class BoundSphere implements laya.d3.core.IClone  {
		private static _tempVector3:any;
		center:laya.d3.math.Vector3;
		radius:number;

		constructor(center:laya.d3.math.Vector3,radius:number);
		toDefault():void;
		static createFromSubPoints(points:laya.d3.math.Vector3[],start:number,count:number,out:BoundSphere):void;
		static createfromPoints(points:laya.d3.math.Vector3[],out:BoundSphere):void;
		intersectsRayDistance(ray:laya.d3.math.Ray):number;
		intersectsRayPoint(ray:laya.d3.math.Ray,outPoint:laya.d3.math.Vector3):number;
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.d3.resource.models {
	class Mesh extends laya.resource.Resource implements laya.d3.core.IClone  {
		static MESH:string;
		static load(url:string,complete:laya.utils.Handler):void;
		readonly inverseAbsoluteBindPoses:laya.d3.math.Matrix4x4[];
		readonly vertexCount:number;
		readonly indexCount:number;
		readonly subMeshCount:number;
		bounds:laya.d3.core.Bounds;

		constructor(isReadable?:boolean);
		protected _disposeResource():void;
		getSubMesh(index:number):laya.d3.resource.models.SubMesh;
		getPositions(positions:laya.d3.math.Vector3[]):void;
		setPositions(positions:laya.d3.math.Vector3[]):void;
		getColors(colors:laya.d3.math.Color[]):void;
		setColors(colors:laya.d3.math.Color[]):void;
		getUVs(uvs:laya.d3.math.Vector2[],channel?:number):void;
		setUVs(uvs:laya.d3.math.Vector2[],channel?:number):void;
		getNormals(normals:laya.d3.math.Vector3[]):void;
		setNormals(normals:laya.d3.math.Vector3[]):void;
		getTangents(tangents:laya.d3.math.Vector4[]):void;
		setTangents(tangents:laya.d3.math.Vector4[]):void;
		getBoneWeights(boneWeights:laya.d3.math.Vector4[]):void;
		setBoneWeights(boneWeights:laya.d3.math.Vector4[]):void;
		getBoneIndices(boneIndices:laya.d3.math.Vector4[]):void;
		setBoneIndices(boneIndices:laya.d3.math.Vector4[]):void;
		markAsUnreadbale():void;
		getVertexDeclaration():laya.d3.graphics.VertexDeclaration;
		getVertices():ArrayBuffer;
		setVertices(vertices:ArrayBuffer):void;
		getIndices():Uint16Array;
		setIndices(indices:Uint16Array):void;
		calculateBounds():void;
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.resource {
	class HTMLImage extends laya.resource.Bitmap  {
		static create:Function;
	}

}

declare module laya.d3.shader {
	class Shader3D  {
		static RENDER_STATE_CULL:number;
		static RENDER_STATE_BLEND:number;
		static RENDER_STATE_BLEND_SRC:number;
		static RENDER_STATE_BLEND_DST:number;
		static RENDER_STATE_BLEND_SRC_RGB:number;
		static RENDER_STATE_BLEND_DST_RGB:number;
		static RENDER_STATE_BLEND_SRC_ALPHA:number;
		static RENDER_STATE_BLEND_DST_ALPHA:number;
		static RENDER_STATE_BLEND_CONST_COLOR:number;
		static RENDER_STATE_BLEND_EQUATION:number;
		static RENDER_STATE_BLEND_EQUATION_RGB:number;
		static RENDER_STATE_BLEND_EQUATION_ALPHA:number;
		static RENDER_STATE_DEPTH_TEST:number;
		static RENDER_STATE_DEPTH_WRITE:number;
		static PERIOD_CUSTOM:number;
		static PERIOD_MATERIAL:number;
		static PERIOD_SPRITE:number;
		static PERIOD_CAMERA:number;
		static PERIOD_SCENE:number;
		static debugMode:boolean;
		static propertyNameToID(name:string):number;
		static compileShader(name:string,subShaderIndex:number,passIndex:number,publicDefine:number,spriteDefine:number,materialDefine:number):void;
		static add(name:string,attributeMap?:any,uniformMap?:any,enableInstancing?:boolean):Shader3D;
		static find(name:string):Shader3D;

		constructor(name:string,attributeMap:any,uniformMap:any,enableInstancing:boolean);
		addSubShader(subShader:laya.d3.shader.SubShader):void;
		getSubShaderAt(index:number):laya.d3.shader.SubShader;
	}

}

declare module laya.display.css {
	class TextStyle extends laya.display.css.SpriteStyle  {
		static EMPTY:TextStyle;
		italic:boolean;
		align:string;
		wordWrap:boolean;
		leading:number;
		padding:any[];
		bgColor:string;
		borderColor:string;
		asPassword:boolean;
		stroke:number;
		strokeColor:string;
		bold:boolean;
		underline:boolean;
		underlineColor:string;
		currBitmapFont:laya.display.BitmapFont;
		reset():laya.display.css.SpriteStyle;
		recover():void;
		static create():TextStyle;
		render(sprite:laya.display.Sprite,context:laya.resource.Context,x:number,y:number):void;
	}

}

declare module laya.d3.component {
	class PostProcess  {
		private _compositeShader:any;
		private _compositeShaderData:any;
		private _effects:any;

		constructor();
		addEffect(effect:laya.d3.core.render.PostProcessEffect):void;
		removeEffect(effect:laya.d3.core.render.PostProcessEffect):void;
	}

}

declare module laya.ui {
	class CheckBox extends laya.ui.Button  {

		constructor(skin?:string,label?:string);
		protected preinitialize():void;
		protected initialize():void;
		dataSource:any;
	}

}

declare module laya.d3.utils {
	class Physics3DUtils  {
		static COLLISIONFILTERGROUP_DEFAULTFILTER:number;
		static COLLISIONFILTERGROUP_STATICFILTER:number;
		static COLLISIONFILTERGROUP_KINEMATICFILTER:number;
		static COLLISIONFILTERGROUP_DEBRISFILTER:number;
		static COLLISIONFILTERGROUP_SENSORTRIGGER:number;
		static COLLISIONFILTERGROUP_CHARACTERFILTER:number;
		static COLLISIONFILTERGROUP_CUSTOMFILTER1:number;
		static COLLISIONFILTERGROUP_CUSTOMFILTER2:number;
		static COLLISIONFILTERGROUP_CUSTOMFILTER3:number;
		static COLLISIONFILTERGROUP_CUSTOMFILTER4:number;
		static COLLISIONFILTERGROUP_CUSTOMFILTER5:number;
		static COLLISIONFILTERGROUP_CUSTOMFILTER6:number;
		static COLLISIONFILTERGROUP_CUSTOMFILTER7:number;
		static COLLISIONFILTERGROUP_CUSTOMFILTER8:number;
		static COLLISIONFILTERGROUP_CUSTOMFILTER9:number;
		static COLLISIONFILTERGROUP_CUSTOMFILTER10:number;
		static COLLISIONFILTERGROUP_ALLFILTER:number;
		static gravity:laya.d3.math.Vector3;

		constructor();
		static setColliderCollision(collider1:laya.d3.physics.PhysicsComponent,collider2:laya.d3.physics.PhysicsComponent,collsion:boolean):void;
		static getIColliderCollision(collider1:laya.d3.physics.PhysicsComponent,collider2:laya.d3.physics.PhysicsComponent):boolean;
	}

}

declare module laya.d3.graphics {
	class StaticBatchManager  {
		static combine(staticBatchRoot:laya.d3.core.Sprite3D,renderableSprite3Ds?:laya.d3.core.RenderableSprite3D[]):void;

		constructor();
	}

}

declare module laya.map {
	class TileTexSet  {
		gid:number;
		texture:laya.resource.Texture;
		offX:number;
		offY:number;
		textureArray:any[];
		durationTimeArray:any[];
		animationTotalTime:number;
		isAnimation:boolean;
		private _spriteNum:any;
		private _aniDic:any;
		private _frameIndex:any;
		private _time:any;
		private _interval:any;
		private _preFrameTime:any;
		addAniSprite(aniName:string,sprite:laya.map.TileAniSprite):void;
		private animate:any;
		private drawTexture:any;
		removeAniSprite(_name:string):void;
		showDebugInfo():string;
		clearAll():void;
	}

}

declare module laya.d3.core {
	class FloatKeyframe extends laya.d3.core.Keyframe  {
		inTangent:number;
		outTangent:number;
		value:number;

		constructor();
		cloneTo(destObject:any):void;
	}

}

declare module laya.maths {
	class Rectangle  {
		static EMPTY:Rectangle;
		static TEMP:Rectangle;
		private static _temB:any;
		private static _temA:any;
		x:number;
		y:number;
		width:number;
		height:number;

		constructor(x?:number,y?:number,width?:number,height?:number);
		readonly right:number;
		readonly bottom:number;
		setTo(x:number,y:number,width:number,height:number):Rectangle;
		reset():Rectangle;
		recover():void;
		static create():Rectangle;
		copyFrom(source:Rectangle):Rectangle;
		contains(x:number,y:number):boolean;
		intersects(rect:Rectangle):boolean;
		intersection(rect:Rectangle,out?:Rectangle):Rectangle;
		union(source:Rectangle,out?:Rectangle):Rectangle;
		clone(out?:Rectangle):Rectangle;
		toString():string;
		equals(rect:Rectangle):boolean;
		addPoint(x:number,y:number):Rectangle;
		isEmpty():boolean;
	}

}

declare module laya.ani {
	class KeyFramesContent  {
		startTime:number;
		duration:number;
		interpolationData:any[];
		data:Float32Array;
		dData:Float32Array;
		nextData:Float32Array;
	}

}

declare module laya.particle {
	class ParticleTemplateBase  {
		settings:laya.particle.ParticleSetting;
		protected texture:laya.resource.Texture;

		constructor();
		addParticleArray(position:Float32Array,velocity:Float32Array):void;
	}

}

declare module laya.utils {
	class ClassUtils  {
		private static DrawTypeDic:any;
		private static _temParam:any;
		private static _classMap:any;
		private static _tM:any;
		private static _alpha:any;
		static regClass(className:string,classDef:any):void;
		static regShortClassName(classes:any[]):void;
		static getRegClass(className:string):any;
		static getClass(className:string):any;
		static getInstance(className:string):any;
		static createByJson(json:any,node?:any,root?:laya.display.Node,customHandler?:laya.utils.Handler,instanceHandler?:laya.utils.Handler):any;
		static _addGraphicsToSprite(graphicO:any,sprite:laya.display.Sprite):void;
		private static _getGraphicsFromSprite:any;
		private static _getTransformData:any;
		private static _addGraphicToGraphics:any;
		private static _adptLineData:any;
		private static _adptTextureData:any;
		private static _adptLinesData:any;
		private static _getParams:any;
		private static _getObjVar:any;
	}

}

declare module laya.ani.bone {
	class BoneSlot  {
		name:string;
		parent:string;
		attachmentName:string;
		srcDisplayIndex:number;
		type:string;
		templet:laya.ani.bone.Templet;
		currSlotData:laya.ani.bone.SlotData;
		currTexture:laya.resource.Texture;
		currDisplayData:laya.ani.bone.SkinSlotDisplayData;
		displayIndex:number;
		originalIndex:number;
		private _diyTexture:any;
		private _parentMatrix:any;
		private _resultMatrix:any;
		private _replaceDic:any;
		private _curDiyUV:any;
		private _skinSprite:any;
		deformData:any[];
		showSlotData(slotData:laya.ani.bone.SlotData,freshIndex?:boolean):void;
		showDisplayByName(name:string):void;
		replaceDisplayByName(tarName:string,newName:string):void;
		replaceDisplayByIndex(tarIndex:number,newIndex:number):void;
		showDisplayByIndex(index:number):void;
		replaceSkin(_texture:laya.resource.Texture):void;
		setParentMatrix(parentMatrix:laya.maths.Matrix):void;
		private _mVerticleArr:any;
		private static _tempMatrix:any;
		static createSkinMesh():any;
		private static isSameArr:any;
		private static _tempResultMatrix:any;
		private _preGraphicVerticle:any;
		private getSaveVerticle:any;
		static isSameMatrix(mtA:laya.maths.Matrix,mtB:laya.maths.Matrix):boolean;
		private _preGraphicMatrix:any;
		private static useSameMatrixAndVerticle:any;
		private getSaveMatrix:any;
		draw(graphics:laya.ani.GraphicsAni,boneMatrixArray:any[],noUseSave?:boolean,alpha?:number):void;
		private static _tempVerticleArr:any;
		private skinMesh:any;
		drawBonePoint(graphics:laya.display.Graphics):void;
		private getDisplayMatrix:any;
		getMatrix():laya.maths.Matrix;
		copy():BoneSlot;
	}

}

declare module laya.net {
	class ResourceVersion  {
		static FOLDER_VERSION:number;
		static FILENAME_VERSION:number;
		static manifest:any;
		static type:number;
		static enable(manifestFile:string,callback:laya.utils.Handler,type?:number):void;
		private static onManifestLoaded:any;
		static addVersionPrefix(originURL:string):string;
	}

}

declare module laya.effect {
	class FilterSetterBase  {
		_filter:any;

		constructor();
		paramChanged():void;
		protected buildFilter():void;
		protected addFilter(sprite:laya.display.Sprite):void;
		protected removeFilter(sprite:laya.display.Sprite):void;
		private _target:any;
		target:any;
	}

}

declare module laya.media.webaudio {
	class WebAudioSoundChannel extends laya.media.SoundChannel  {
		audioBuffer:any;
		private gain:any;
		private bufferSource:any;
		private _currentTime:any;
		private _volume:any;
		private _startTime:any;
		private _pauseTime:any;
		private context:any;
		private _onPlayEnd:any;
		private static _tryCleanFailed:any;
		static SetTargetDelay:number;

		constructor();
		play():void;
		private __onPlayEnd:any;
		readonly position:number;
		readonly duration:number;
		private _clearBufferSource:any;
		private _tryClearBuffer:any;
		stop():void;
		pause():void;
		resume():void;
		volume:number;
	}

}

declare module laya.d3.physics {
	class CollisionTool  {

		constructor();
	}

}

declare module laya.events {
	class TouchManager  {
		static I:TouchManager;
		private static _oldArr:any;
		private static _newArr:any;
		private static _tEleArr:any;
		private preOvers:any;
		private preDowns:any;
		private preRightDowns:any;
		enable:boolean;
		private _lastClickTime:any;
		private _clearTempArrs:any;
		private getTouchFromArr:any;
		private removeTouchFromArr:any;
		private createTouchO:any;
		onMouseDown(ele:any,touchID:number,isLeft?:boolean):void;
		private sendEvents:any;
		private getEles:any;
		private checkMouseOutAndOverOfMove:any;
		onMouseMove(ele:any,touchID:number):void;
		getLastOvers():any[];
		stageMouseOut():void;
		onMouseUp(ele:any,touchID:number,isLeft?:boolean):void;
	}

}

declare module laya.display {
	class GraphicsBounds  {
		private static _tempMatrix:any;
		private static _initMatrix:any;
		private static _tempPoints:any;
		private static _tempMatrixArrays:any;
		private static _tempCmds:any;
		private _temp:any;
		private _bounds:any;
		private _rstBoundPoints:any;
		private _cacheBoundsType:any;
		destroy():void;
		static create():GraphicsBounds;
		reset():void;
		getBounds(realSize?:boolean):laya.maths.Rectangle;
		getBoundPoints(realSize?:boolean):any[];
		private _getCmdPoints:any;
		private _switchMatrix:any;
		private static _addPointArrToRst:any;
		private static _addPointToRst:any;
		private _getPiePoints:any;
		private _getTriAngBBXPoints:any;
		private _getDraw9GridBBXPoints:any;
		private _getPathPoints:any;
	}

}

declare module laya.webgl.canvas {
	class Path  {
		paths:any[];
		private _curPath:any;

		constructor();
		beginPath(convex:boolean):void;
		closePath():void;
		newPath():void;
		addPoint(pointX:number,pointY:number):void;
		push(points:any[],convex:boolean):void;
		reset():void;
	}

}

declare module laya.html.dom {
	class HTMLIframeElement extends laya.html.dom.HTMLDivElement  {

		constructor();
		href:string;
	}

}

declare module laya.filters {
	interface IFilter{
		type:number;
	}

}

declare module laya.html.utils {
	class LayoutLine  {
		elements:laya.html.utils.ILayout[];
		x:number;
		y:number;
		w:number;
		h:number;
		wordStartIndex:number;
		minTextHeight:number;
		mWidth:number;
		updatePos(left:number,width:number,lineNum:number,dy:number,align:string,valign:string,lineHeight:number):void;
	}

}

declare module laya.physics {
	class Physics extends laya.events.EventDispatcher  {
		static PIXEL_RATIO:number;
		private static _I:any;
		box2d:any;
		world:any;
		velocityIterations:number;
		positionIterations:number;
		private _enabled:any;
		private _worldRoot:any;
		_emptyBody:any;
		_eventList:any[];
		static readonly I:Physics;

		constructor();
		static enable(options?:any):void;
		start(options?:any):void;
		private _update:any;
		private _sendEvent:any;
		_createBody(def:any):any;
		_removeBody(body:any):void;
		_createJoint(def:any):any;
		_removeJoint(joint:any):void;
		stop():void;
		allowSleeping:boolean;
		gravity:any;
		getBodyCount():number;
		getContactCount():number;
		getJointCount():number;
		worldRoot:laya.display.Sprite;
	}

}

declare module laya.d3.resource {
	class TextureCube extends laya.resource.BaseTexture  {
		static TEXTURECUBE:string;
		static grayTexture:TextureCube;
		static _parse(data:any,propertyParams?:any,constructParams?:any[]):TextureCube;
		static load(url:string,complete:laya.utils.Handler):void;
		readonly defaulteTexture:laya.resource.BaseTexture;

		constructor(size:number,format?:number,mipmap?:boolean);
		private _setPixels:any;
		setSixSideImageSources(source:any[],premultiplyAlpha?:boolean):void;
		setSixSidePixels(pixels:any[],miplevel?:number):void;
		protected _recoverResource():void;
	}

}

declare module laya.webgl.shader {
	class BaseShader extends laya.resource.Resource  {
		static activeShader:BaseShader;
		static bindShader:BaseShader;

		constructor();
	}

}

declare module laya.d3.resource.models {
	class PrimitiveMesh  {
		static __init__():void;
		static createBox(long?:number,height?:number,width?:number):laya.d3.resource.models.Mesh;
		static createCapsule(radius?:number,height?:number,stacks?:number,slices?:number):laya.d3.resource.models.Mesh;
		static createCone(radius?:number,height?:number,slices?:number):laya.d3.resource.models.Mesh;
		static createCylinder(radius?:number,height?:number,slices?:number):laya.d3.resource.models.Mesh;
		static createPlane(long?:number,width?:number,stacks?:number,slices?:number):laya.d3.resource.models.Mesh;
		static createQuad(long?:number,width?:number):laya.d3.resource.models.Mesh;
		static createSphere(radius?:number,stacks?:number,slices?:number):laya.d3.resource.models.Mesh;
	}

}

declare module laya.d3.math {
	class CollisionUtils  {

		constructor();
		static distancePlaneToPoint(plane:laya.d3.math.Plane,point:laya.d3.math.Vector3):number;
		static distanceBoxToPoint(box:laya.d3.math.BoundBox,point:laya.d3.math.Vector3):number;
		static distanceBoxToBox(box1:laya.d3.math.BoundBox,box2:laya.d3.math.BoundBox):number;
		static distanceSphereToPoint(sphere:laya.d3.math.BoundSphere,point:laya.d3.math.Vector3):number;
		static distanceSphereToSphere(sphere1:laya.d3.math.BoundSphere,sphere2:laya.d3.math.BoundSphere):number;
		static intersectsRayAndTriangleRD(ray:laya.d3.math.Ray,vertex1:laya.d3.math.Vector3,vertex2:laya.d3.math.Vector3,vertex3:laya.d3.math.Vector3,out:number):boolean;
		static intersectsRayAndTriangleRP(ray:laya.d3.math.Ray,vertex1:laya.d3.math.Vector3,vertex2:laya.d3.math.Vector3,vertex3:laya.d3.math.Vector3,out:laya.d3.math.Vector3):boolean;
		static intersectsRayAndPoint(ray:laya.d3.math.Ray,point:laya.d3.math.Vector3):boolean;
		static intersectsRayAndRay(ray1:laya.d3.math.Ray,ray2:laya.d3.math.Ray,out:laya.d3.math.Vector3):boolean;
		static intersectsPlaneAndTriangle(plane:laya.d3.math.Plane,vertex1:laya.d3.math.Vector3,vertex2:laya.d3.math.Vector3,vertex3:laya.d3.math.Vector3):number;
		static intersectsRayAndPlaneRD(ray:laya.d3.math.Ray,plane:laya.d3.math.Plane,out:number):boolean;
		static intersectsRayAndPlaneRP(ray:laya.d3.math.Ray,plane:laya.d3.math.Plane,out:laya.d3.math.Vector3):boolean;
		static intersectsRayAndBoxRD(ray:laya.d3.math.Ray,box:laya.d3.math.BoundBox):number;
		static intersectsRayAndBoxRP(ray:laya.d3.math.Ray,box:laya.d3.math.BoundBox,out:laya.d3.math.Vector3):number;
		static intersectsRayAndSphereRD(ray:laya.d3.math.Ray,sphere:laya.d3.math.BoundSphere):number;
		static intersectsRayAndSphereRP(ray:laya.d3.math.Ray,sphere:laya.d3.math.BoundSphere,out:laya.d3.math.Vector3):number;
		static intersectsSphereAndTriangle(sphere:laya.d3.math.BoundSphere,vertex1:laya.d3.math.Vector3,vertex2:laya.d3.math.Vector3,vertex3:laya.d3.math.Vector3):boolean;
		static intersectsPlaneAndPoint(plane:laya.d3.math.Plane,point:laya.d3.math.Vector3):number;
		static intersectsPlaneAndPlane(plane1:laya.d3.math.Plane,plane2:laya.d3.math.Plane):boolean;
		static intersectsPlaneAndPlaneRL(plane1:laya.d3.math.Plane,plane2:laya.d3.math.Plane,line:laya.d3.math.Ray):boolean;
		static intersectsPlaneAndBox(plane:laya.d3.math.Plane,box:laya.d3.math.BoundBox):number;
		static intersectsPlaneAndSphere(plane:laya.d3.math.Plane,sphere:laya.d3.math.BoundSphere):number;
		static intersectsBoxAndBox(box1:laya.d3.math.BoundBox,box2:laya.d3.math.BoundBox):boolean;
		static intersectsBoxAndSphere(box:laya.d3.math.BoundBox,sphere:laya.d3.math.BoundSphere):boolean;
		static intersectsSphereAndSphere(sphere1:laya.d3.math.BoundSphere,sphere2:laya.d3.math.BoundSphere):boolean;
		static boxContainsPoint(box:laya.d3.math.BoundBox,point:laya.d3.math.Vector3):number;
		static boxContainsBox(box1:laya.d3.math.BoundBox,box2:laya.d3.math.BoundBox):number;
		static boxContainsSphere(box:laya.d3.math.BoundBox,sphere:laya.d3.math.BoundSphere):number;
		static sphereContainsPoint(sphere:laya.d3.math.BoundSphere,point:laya.d3.math.Vector3):number;
		static sphereContainsTriangle(sphere:laya.d3.math.BoundSphere,vertex1:laya.d3.math.Vector3,vertex2:laya.d3.math.Vector3,vertex3:laya.d3.math.Vector3):number;
		static sphereContainsBox(sphere:laya.d3.math.BoundSphere,box:laya.d3.math.BoundBox):number;
		static sphereContainsSphere(sphere1:laya.d3.math.BoundSphere,sphere2:laya.d3.math.BoundSphere):number;
		static closestPointPointTriangle(point:laya.d3.math.Vector3,vertex1:laya.d3.math.Vector3,vertex2:laya.d3.math.Vector3,vertex3:laya.d3.math.Vector3,out:laya.d3.math.Vector3):void;
		static closestPointPlanePoint(plane:laya.d3.math.Plane,point:laya.d3.math.Vector3,out:laya.d3.math.Vector3):void;
		static closestPointBoxPoint(box:laya.d3.math.BoundBox,point:laya.d3.math.Vector3,out:laya.d3.math.Vector3):void;
		static closestPointSpherePoint(sphere:laya.d3.math.BoundSphere,point:laya.d3.math.Vector3,out:laya.d3.math.Vector3):void;
		static closestPointSphereSphere(sphere1:laya.d3.math.BoundSphere,sphere2:laya.d3.math.BoundSphere,out:laya.d3.math.Vector3):void;
	}

}

declare module laya.resource {
	interface ICreateResource{
		_setCreateURL(url:string):void;
	}

}

declare module laya.physics.joint {
	class DistanceJoint extends laya.physics.joint.JointBase  {
		private static _temp:any;
		selfBody:laya.physics.RigidBody;
		otherBody:laya.physics.RigidBody;
		selfAnchor:any[];
		otherAnchor:any[];
		collideConnected:boolean;
		private _length:any;
		private _frequency:any;
		private _damping:any;
		protected _createJoint():void;
		length:number;
		frequency:number;
		damping:number;
	}

}

declare module laya.d3.shader {
	class ShaderData implements laya.d3.core.IClone  {
		addDefine(define:number):void;
		removeDefine(define:number):void;
		hasDefine(define:number):boolean;
		clearDefine():void;
		getBool(index:number):boolean;
		setBool(index:number,value:boolean):void;
		getInt(index:number):number;
		setInt(index:number,value:number):void;
		getNumber(index:number):number;
		setNumber(index:number,value:number):void;
		getVector2(index:number):laya.d3.math.Vector2;
		setVector2(index:number,value:laya.d3.math.Vector2):void;
		getVector3(index:number):laya.d3.math.Vector3;
		setVector3(index:number,value:laya.d3.math.Vector3):void;
		getVector(index:number):laya.d3.math.Vector4;
		setVector(index:number,value:laya.d3.math.Vector4):void;
		getQuaternion(index:number):laya.d3.math.Quaternion;
		setQuaternion(index:number,value:laya.d3.math.Quaternion):void;
		getMatrix4x4(index:number):laya.d3.math.Matrix4x4;
		setMatrix4x4(index:number,value:laya.d3.math.Matrix4x4):void;
		getBuffer(shaderIndex:number):Float32Array;
		setBuffer(index:number,value:Float32Array):void;
		setTexture(index:number,value:laya.resource.BaseTexture):void;
		getTexture(index:number):laya.resource.BaseTexture;
		setAttribute(index:number,value:Int32Array):void;
		getAttribute(index:number):any[];
		getLength():number;
		setLength(value:number):void;
		cloneTo(destObject:any):void;
		clone():any;
		cloneToForNative(destObject:any):void;
		needRenewArrayBufferForNative(index:number):void;
		getDataForNative():any[];
		setReferenceForNative(value:any):number;
		static setRuntimeValueMode(bReference:boolean):void;
		clearRuntimeCopyArray():void;
	}

}

declare module laya.webgl.shapes {
	class BasePoly  {
		private static tempData:any;
		static createLine2(p:any[],indices:any[],lineWidth:number,indexBase:number,outVertex:any[],loop:boolean):any[];
		static createLineTriangle(path:any[],color:number,width:number,loop:boolean,outvb:Float32Array,vbstride:number,outib:Uint16Array):void;
	}

}

declare module laya.display.cmd {
	class DrawCircleCmd  {
		static ID:string;
		x:number;
		y:number;
		radius:number;
		fillColor:any;
		lineColor:any;
		lineWidth:number;
		vid:number;
		static create(x:number,y:number,radius:number,fillColor:any,lineColor:any,lineWidth:number,vid:number):DrawCircleCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.webgl.submit {
	interface ISubmit{
		renderSubmit():number;
		getRenderType():number;
		releaseRender():void;
	}

}

declare module laya.d3.component {
	class Script3D extends laya.components.Component  {
		readonly isSingleton:boolean;
		private _checkProcessTriggers:any;
		private _checkProcessCollisions:any;
		protected _onAwake():void;
		protected _onEnable():void;
		protected _onDisable():void;
		_isScript():boolean;
		_onAdded():void;
		protected _onDestroy():void;
		onAwake():void;
		onEnable():void;
		onStart():void;
		onTriggerEnter(other:laya.d3.physics.PhysicsComponent):void;
		onTriggerStay(other:laya.d3.physics.PhysicsComponent):void;
		onTriggerExit(other:laya.d3.physics.PhysicsComponent):void;
		onCollisionEnter(collision:laya.d3.physics.Collision):void;
		onCollisionStay(collision:laya.d3.physics.Collision):void;
		onCollisionExit(collision:laya.d3.physics.Collision):void;
		onMouseDown():void;
		onMouseDrag():void;
		onMouseClick():void;
		onMouseUp():void;
		onMouseEnter():void;
		onMouseOver():void;
		onMouseOut():void;
		onKeyDown(e:laya.events.Event):void;
		onKeyPress(e:laya.events.Event):void;
		onKeyUp(e:laya.events.Event):void;
		onUpdate():void;
		onLateUpdate():void;
		onPreRender():void;
		onPostRender():void;
		onDisable():void;
		onDestroy():void;
	}

}

declare module laya.d3.utils {
	class Picker  {
		private static _tempVector30:any;
		private static _tempVector31:any;
		private static _tempVector32:any;
		private static _tempVector33:any;
		private static _tempVector34:any;

		constructor();
		static calculateCursorRay(point:laya.d3.math.Vector2,viewPort:laya.d3.math.Viewport,projectionMatrix:laya.d3.math.Matrix4x4,viewMatrix:laya.d3.math.Matrix4x4,world:laya.d3.math.Matrix4x4,out:laya.d3.math.Ray):void;
		static rayIntersectsTriangle(ray:laya.d3.math.Ray,vertex1:laya.d3.math.Vector3,vertex2:laya.d3.math.Vector3,vertex3:laya.d3.math.Vector3):number;
	}

}

declare module laya.ui {
	class Clip extends laya.ui.UIComponent  {
		protected _sources:any[];
		protected _bitmap:laya.ui.AutoBitmap;
		protected _skin:string;
		protected _clipX:number;
		protected _clipY:number;
		protected _clipWidth:number;
		protected _clipHeight:number;
		protected _autoPlay:boolean;
		protected _interval:number;
		protected _complete:laya.utils.Handler;
		protected _isPlaying:boolean;
		protected _index:number;
		protected _clipChanged:boolean;
		protected _group:string;
		protected _toIndex:number;

		constructor(url?:string,clipX?:number,clipY?:number);
		destroy(destroyChild?:boolean):void;
		dispose():void;
		protected createChildren():void;
		protected _onDisplay(e?:boolean):void;
		skin:string;
		protected _skinLoaded():void;
		clipX:number;
		clipY:number;
		clipWidth:number;
		clipHeight:number;
		protected changeClip():void;
		protected loadComplete(url:string,img:laya.resource.Texture):void;
		sources:any[];
		group:string;
		width:number;
		height:number;
		protected measureWidth():number;
		protected measureHeight():number;
		sizeGrid:string;
		index:number;
		readonly total:number;
		autoPlay:boolean;
		interval:number;
		isPlaying:boolean;
		play(from?:number,to?:number):void;
		protected _loop():void;
		stop():void;
		dataSource:any;
		readonly bitmap:laya.ui.AutoBitmap;
		protected _setClipChanged():void;
	}

}

declare module laya.d3.core {
	class GeometryElement implements laya.resource.IDestroy  {
		readonly destroyed:boolean;

		constructor();
		_getType():number;
		destroy():void;
	}

}

declare module laya.webgl.text {
	class ArabicReshaper  {
		private static charsMap:any;
		private static combCharsMap:any;
		private static transChars:any;
		characterMapContains(c:number):boolean;
		getCharRep(c:number):boolean;
		getCombCharRep(c1:any,c2:any):boolean;
		isTransparent(c:any):boolean;
		getOriginalCharsFromCode(code:any):string;
		convertArabic(normal:any):string;
		convertArabicBack(apfb:any):string;
	}

}

declare module laya.webgl {
	class VertexArrayObject  {

		constructor();
	}

}

declare module laya.particle {
	class ParticleTemplateWebGL extends laya.particle.ParticleTemplateBase  {
		protected _vertices:Float32Array;
		protected _mesh:laya.webgl.utils.MeshParticle2D;
		protected _conchMesh:any;
		protected _floatCountPerVertex:number;
		protected _firstActiveElement:number;
		protected _firstNewElement:number;
		protected _firstFreeElement:number;
		protected _firstRetiredElement:number;
		protected _drawCounter:number;

		constructor(parSetting:laya.particle.ParticleSetting);
		reUse(context:laya.resource.Context,pos:number):number;
		protected initialize():void;
		update(elapsedTime:number):void;
		private retireActiveParticles:any;
		private freeRetiredParticles:any;
		addNewParticlesToVertexBuffer():void;
		addParticleArray(position:Float32Array,velocity:Float32Array):void;
	}

}

declare module laya.webgl.utils {
	class Buffer  {
		static _bindedVertexBuffer:any;
		static _bindedIndexBuffer:any;
		protected _glBuffer:any;
		protected _buffer:any;
		protected _bufferType:number;
		protected _bufferUsage:number;
		_byteLength:number;
		readonly bufferUsage:number;

		constructor();
		_bindForVAO():void;
		bind():boolean;
		destroy():void;
	}

}

declare module laya.utils {
	class ColorUtils  {
		static _SAVE:any;
		static _SAVE_SIZE:number;
		private static _COLOR_MAP:any;
		private static _DEFAULT:any;
		private static _COLODID:any;
		arrColor:any[];
		strColor:string;
		numColor:number;

		constructor(value:any);
		static _initDefault():any;
		static _initSaveMap():void;
		static create(value:any):ColorUtils;
	}

}

declare module laya.effect {
	class GlowFilterSetter extends laya.effect.FilterSetterBase  {
		private _color:any;
		private _blur:any;
		private _offX:any;
		private _offY:any;

		constructor();
		protected buildFilter():void;
		color:string;
		blur:number;
		offX:number;
		offY:number;
	}

}

declare module laya.net {
	class SceneLoader extends laya.events.EventDispatcher  {
		static LoadableExtensions:any;
		static No3dLoadTypes:any;
		totalCount:number;
		private _completeHandler:any;
		private _toLoadList:any;
		private _isLoading:any;
		private _curUrl:any;

		constructor();
		reset():void;
		readonly leftCount:number;
		readonly loadedCount:number;
		load(url:any,is3D?:boolean,ifCheck?:boolean):void;
		private _addToLoadList:any;
		private _checkNext:any;
		private loadOne:any;
		private onOneLoadComplete:any;
		getProgress():number;
	}

}

declare module laya.ani.bone.canvasmesh {
	class MeshData  {
		texture:laya.resource.Texture;
		uvs:Float32Array;
		vertices:Float32Array;
		indexes:Uint16Array;
		uvTransform:laya.maths.Matrix;
		useUvTransform:boolean;
		canvasPadding:number;
		getBounds():laya.maths.Rectangle;
	}

}

declare module laya.ani.swf {
	class MovieClip extends laya.display.Sprite  {
		protected static _ValueList:any[];
		protected _start:number;
		protected _Pos:number;
		protected _data:laya.utils.Byte;
		protected _curIndex:number;
		protected _preIndex:number;
		protected _playIndex:number;
		protected _playing:boolean;
		protected _ended:boolean;
		protected _count:number;
		protected _loadedImage:any;
		protected _labels:any;
		basePath:string;
		private _atlasPath:any;
		private _url:any;
		private _isRoot:any;
		private _completeHandler:any;
		private _endFrame:any;
		interval:number;
		loop:boolean;

		constructor(parentMovieClip?:MovieClip);
		destroy(destroyChild?:boolean):void;
		protected _onDisplay(value?:boolean):void;
		updates():void;
		index:number;
		addLabel(label:string,index:number):void;
		removeLabel(label:string):void;
		readonly count:number;
		readonly playing:boolean;
		private _update:any;
		stop():void;
		gotoAndStop(index:number):void;
		private _clear:any;
		play(index?:number,loop?:boolean):void;
		private _displayFrame:any;
		private _reset:any;
		private _parseFrame:any;
		url:string;
		load(url:string,atlas?:boolean,atlasPath?:string):void;
		private _onLoaded:any;
		private _initState:any;
		private _initData:any;
		playTo(start:number,end:number,complete?:laya.utils.Handler):void;
	}

}

declare module laya.d3.physics {
	class Constraint3D  {
		rigidbodyA:laya.d3.physics.Rigidbody3D;
		rigidbodyB:laya.d3.physics.Rigidbody3D;

		constructor();
	}

}

declare module laya.display {
	class Input extends laya.display.Text  {
		static TYPE_TEXT:string;
		static TYPE_PASSWORD:string;
		static TYPE_EMAIL:string;
		static TYPE_URL:string;
		static TYPE_NUMBER:string;
		static TYPE_RANGE:string;
		static TYPE_DATE:string;
		static TYPE_MONTH:string;
		static TYPE_WEEK:string;
		static TYPE_TIME:string;
		static TYPE_DATE_TIME:string;
		static TYPE_DATE_TIME_LOCAL:string;
		static TYPE_SEARCH:string;
		protected static input:any;
		protected static area:any;
		protected static inputElement:any;
		protected static inputContainer:any;
		protected static confirmButton:any;
		protected static promptStyleDOM:any;
		protected _focus:boolean;
		protected _multiline:boolean;
		protected _editable:boolean;
		protected _restrictPattern:any;
		protected _maxChars:number;
		private _type:any;
		private _prompt:any;
		private _promptColor:any;
		private _originColor:any;
		private _content:any;
		static IOS_IFRAME:boolean;
		private static inputHeight:any;
		static isInputting:boolean;

		constructor();
		static __init__():void;
		private static _popupInputMethod:any;
		private static _createInputElement:any;
		private static _initInput:any;
		private static _processInputting:any;
		private static _stopEvent:any;
		setSelection(startIndex:number,endIndex:number):void;
		multiline:boolean;
		readonly nativeInput:any;
		private _onUnDisplay:any;
		private _onMouseDown:any;
		private static stageMatrix:any;
		private _syncInputTransform:any;
		select():void;
		focus:boolean;
		private _setInputMethod:any;
		private _focusIn:any;
		private _setPromptColor:any;
		private _focusOut:any;
		private _onKeyDown:any;
		text:string;
		changeText(text:string):void;
		color:string;
		bgColor:string;
		restrict:string;
		editable:boolean;
		maxChars:number;
		prompt:string;
		promptColor:string;
		type:string;
	}

}

declare module laya.html.dom {
	class HTMLImageElement extends laya.html.dom.HTMLElement  {
		private _tex:any;
		private _url:any;

		constructor();
		reset():laya.html.dom.HTMLElement;
		src:string;
		private onloaded:any;
		renderSelfToGraphic(graphic:laya.display.Graphics,gX:number,gY:number,recList:any[]):void;
	}

}

declare module laya.webgl.canvas {
	class WebGLCacheAsNormalCanvas  {
		submitStartPos:number;
		submitEndPos:number;
		context:laya.resource.Context;
		touches:any[];
		submits:any[];
		sprite:laya.display.Sprite;
		private _pathMesh:any;
		private _triangleMesh:any;
		meshlist:any[];
		private _oldMesh:any;
		private _oldPathMesh:any;
		private _oldTriMesh:any;
		private _oldMeshList:any;
		private cachedClipInfo:any;
		private oldTx:any;
		private oldTy:any;
		private static matI:any;
		invMat:laya.maths.Matrix;

		constructor(ctx:laya.resource.Context,sp:laya.display.Sprite);
		startRec():void;
		endRec():void;
		isCacheValid():boolean;
		flushsubmit():void;
		releaseMem():void;
	}

}

declare module laya.d3.resource {
	class TextureGenerator  {

		constructor();
		static lightAttenTexture(x:number,y:number,maxX:number,maxY:number,index:number,data:Uint8Array):void;
		static haloTexture(x:number,y:number,maxX:number,maxY:number,index:number,data:Uint8Array):void;
		static _generateTexture2D(texture:laya.resource.Texture2D,textureWidth:number,textureHeight:number,func:Function):void;
	}

}

declare module laya.d3.resource.models {
	class SkyBox extends laya.d3.resource.models.SkyMesh  {
		static instance:SkyBox;

		constructor();
		_render(state:laya.d3.core.render.RenderContext3D):void;
	}

}

declare module laya.resource {
	interface IDestroy{
		destroyed:boolean;
		destroy():void;
	}

}

declare module laya.d3.math {
	class Color implements laya.d3.core.IClone  {
		static RED:Color;
		static GREEN:Color;
		static BLUE:Color;
		static CYAN:Color;
		static YELLOW:Color;
		static MAGENTA:Color;
		static GRAY:Color;
		static WHITE:Color;
		static BLACK:Color;
		static gammaToLinearSpace(value:number):number;
		static linearToGammaSpace(value:number):number;
		r:number;
		g:number;
		b:number;
		a:number;

		constructor(r?:number,g?:number,b?:number,a?:number);
		toLinear(out:Color):void;
		toGamma(out:Color):void;
		cloneTo(destObject:any):void;
		clone():any;
		forNativeElement():void;
	}

}

declare module laya.physics.joint {
	class GearJoint extends laya.physics.joint.JointBase  {
		private static _temp:any;
		joint1:any;
		joint2:any;
		collideConnected:boolean;
		private _ratio:any;
		protected _createJoint():void;
		ratio:number;
	}

}

declare module laya.webgl.canvas.save {
	interface ISaveData{
		isSaveMark():boolean;
		restore(context:laya.resource.Context):void;
	}

}

declare module laya.d3.shader {
	class ShaderDefines  {

		constructor(superDefines?:ShaderDefines);
		registerDefine(name:string):number;
	}

}

declare module laya.physics {
	class PhysicsDebugDraw extends laya.display.Sprite  {
		m_drawFlags:number;
		static box2d:any;
		static DrawString_s_color:any;
		static DrawStringWorld_s_p:any;
		static DrawStringWorld_s_cc:any;
		static DrawStringWorld_s_color:any;
		world:any;
		private _camera:any;
		private static _canvas:any;
		private static _inited:any;
		private _mG:any;
		private _textSp:any;
		private _textG:any;
		static init():void;

		constructor();
		render(ctx:laya.resource.Context,x:number,y:number):void;
		private lineWidth:any;
		private _renderToGraphic:any;
		SetFlags(flags:number):void;
		GetFlags():number;
		AppendFlags(flags:number):void;
		ClearFlags(flags:any):void;
		PushTransform(xf:any):void;
		PopTransform(xf:any):void;
		DrawPolygon(vertices:any,vertexCount:any,color:any):void;
		DrawSolidPolygon(vertices:any,vertexCount:any,color:any):void;
		DrawCircle(center:any,radius:any,color:any):void;
		DrawSolidCircle(center:any,radius:any,axis:any,color:any):void;
		DrawParticles(centers:any,radius:any,colors:any,count:any):void;
		DrawSegment(p1:any,p2:any,color:any):void;
		DrawTransform(xf:any):void;
		DrawPoint(p:any,size:any,color:any):void;
		DrawString(x:any,y:any,message:any):void;
		DrawStringWorld(x:any,y:any,message:any):void;
		DrawAABB(aabb:any,color:any):void;
		static I:PhysicsDebugDraw;
		static enable(flags?:number):PhysicsDebugDraw;
	}

}

declare module laya.webgl.shapes {
	class Earcut  {
		static earcut(data:any,holeIndices:any,dim:any):any;
		static linkedList(data:any,start:any,end:any,dim:any,clockwise:any):any;
		static filterPoints(start:any,end:any):any;
		static earcutLinked(ear:any,triangles:any,dim:any,minX:any,minY:any,invSize:any,pass?:any):any;
		static isEar(ear:any):any;
		static isEarHashed(ear:any,minX:any,minY:any,invSize:any):boolean;
		static cureLocalIntersections(start:any,triangles:any,dim:any):any;
		static splitEarcut(start:any,triangles:any,dim:any,minX:any,minY:any,invSize:any):void;
		static eliminateHoles(data:any,holeIndices:any,outerNode:any,dim:any):any;
		static compareX(a:any,b:any):any;
		static eliminateHole(hole:any,outerNode:any):void;
		static findHoleBridge(hole:any,outerNode:any):any;
		static indexCurve(start:any,minX:any,minY:any,invSize:any):void;
		static sortLinked(list:any):any;
		static zOrder(x:any,y:any,minX:any,minY:any,invSize:any):any;
		static getLeftmost(start:any):any;
		static pointInTriangle(ax:any,ay:any,bx:any,by:any,cx:any,cy:any,px:any,py:any):boolean;
		static isValidDiagonal(a:any,b:any):boolean;
		static area(p:any,q:any,r:any):any;
		static equals(p1:any,p2:any):boolean;
		static intersects(p1:any,q1:any,p2:any,q2:any):boolean;
		static intersectsPolygon(a:any,b:any):boolean;
		static locallyInside(a:any,b:any):boolean;
		static middleInside(a:any,b:any):boolean;
		static splitPolygon(a:any,b:any):any;
		static insertNode(i:any,x:any,y:any,last:any):any;
		static removeNode(p:any):void;
		static signedArea(data:any,start:any,end:any,dim:any):any;
	}

}

declare module laya.display.cmd {
	class DrawCurvesCmd  {
		static ID:string;
		x:number;
		y:number;
		points:any[];
		lineColor:any;
		lineWidth:number;
		static create(x:number,y:number,points:any[],lineColor:any,lineWidth:number):DrawCurvesCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.webgl.shader {
	class Shader extends laya.webgl.shader.BaseShader  {
		private static _count:any;
		private _attribInfo:any;
		static SHADERNAME2ID:number;
		static nameKey:laya.utils.StringKey;
		static sharders:any[];
		static getShader(name:any):Shader;
		static create(vs:string,ps:string,saveName?:any,nameMap?:any,bindAttrib?:any[]):Shader;
		static withCompile(nameID:number,define:any,shaderName:any,createShader:Function):Shader;
		static withCompile2D(nameID:number,mainID:number,define:any,shaderName:any,createShader:Function,bindAttrib?:any[]):Shader;
		static addInclude(fileName:string,txt:string):void;
		static preCompile(nameID:number,vs:string,ps:string,nameMap:any):void;
		static preCompile2D(nameID:number,mainID:number,vs:string,ps:string,nameMap:any):void;
		private customCompile:any;
		private _nameMap:any;
		private _vs:any;
		private _ps:any;
		private _curActTexIndex:any;
		private _reCompile:any;
		tag:any;

		constructor(vs:string,ps:string,saveName?:any,nameMap?:any,bindAttrib?:any[]);
		protected recreateResource():void;
		protected _disposeResource():void;
		private _compile:any;
		private static _createShader:any;
		getUniform(name:string):any;
		private _uniform1f:any;
		private _uniform1fv:any;
		private _uniform_vec2:any;
		private _uniform_vec2v:any;
		private _uniform_vec3:any;
		private _uniform_vec3v:any;
		private _uniform_vec4:any;
		private _uniform_vec4v:any;
		private _uniformMatrix2fv:any;
		private _uniformMatrix3fv:any;
		private _uniformMatrix4fv:any;
		private _uniform1i:any;
		private _uniform1iv:any;
		private _uniform_ivec2:any;
		private _uniform_ivec2v:any;
		private _uniform_vec3i:any;
		private _uniform_vec3vi:any;
		private _uniform_vec4i:any;
		private _uniform_vec4vi:any;
		private _uniform_sampler2D:any;
		private _uniform_samplerCube:any;
		private _noSetValue:any;
		uploadOne(name:string,value:any):void;
		uploadTexture2D(value:any):void;
		upload(shaderValue:laya.webgl.shader.ShaderValue,params?:any[]):void;
		uploadArray(shaderValue:any[],length:number,_bufferUsage:any):void;
		getParams():any[];
		setAttributesLocation(attribDesc:any[]):void;
	}

}

declare module laya.webgl.submit {
	class Submit extends laya.webgl.submit.SubmitBase  {
		protected static _poolSize:number;
		protected static POOL:any[];

		constructor(renderType?:number);
		renderSubmit():number;
		releaseRender():void;
		static create(context:laya.resource.Context,mesh:laya.webgl.utils.Mesh2D,sv:laya.webgl.shader.d2.value.Value2D):Submit;
		static createShape(ctx:laya.resource.Context,mesh:laya.webgl.utils.Mesh2D,numEle:number,sv:laya.webgl.shader.d2.value.Value2D):Submit;
	}

}

declare module laya.d3.component {
	class SimpleSingletonList extends laya.d3.component.SingletonList<laya.resource.ISingletonElement>  {

		constructor();
	}

}

declare module laya.ui {
	class ColorPicker extends laya.ui.UIComponent  {
		changeHandler:laya.utils.Handler;
		protected _gridSize:number;
		protected _bgColor:string;
		protected _borderColor:string;
		protected _inputColor:string;
		protected _inputBgColor:string;
		protected _colorPanel:laya.ui.Box;
		protected _colorTiles:laya.display.Sprite;
		protected _colorBlock:laya.display.Sprite;
		protected _colorInput:laya.display.Input;
		protected _colorButton:laya.ui.Button;
		protected _colors:any[];
		protected _selectedColor:string;
		protected _panelChanged:boolean;
		destroy(destroyChild?:boolean):void;
		protected createChildren():void;
		protected initialize():void;
		private onPanelMouseDown:any;
		protected changePanel():void;
		private onColorButtonClick:any;
		open():void;
		close():void;
		private removeColorBox:any;
		private onColorFieldKeyDown:any;
		private onColorInputChange:any;
		private onColorTilesClick:any;
		private onColorTilesMouseMove:any;
		protected getColorByMouse():string;
		private drawBlock:any;
		selectedColor:string;
		skin:string;
		private changeColor:any;
		bgColor:string;
		borderColor:string;
		inputColor:string;
		inputBgColor:string;
		protected _setPanelChanged():void;
	}

}

declare module laya.d3.utils {
	class Scene3DUtils  {
		private static _createSprite3DInstance:any;
		private static _createComponentInstance:any;
	}

}

declare module laya.d3.core {
	class Gradient implements laya.d3.core.IClone  {
		private _mode:any;
		private _maxColorRGBKeysCount:any;
		private _maxColorAlphaKeysCount:any;
		private _colorRGBKeysCount:any;
		private _colorAlphaKeysCount:any;
		mode:number;
		readonly colorRGBKeysCount:number;
		readonly colorAlphaKeysCount:number;
		readonly maxColorRGBKeysCount:number;
		readonly maxColorAlphaKeysCount:number;

		constructor(maxColorRGBKeyCount:number,maxColorAlphaKeyCount:number);
		addColorRGB(key:number,value:laya.d3.math.Color):void;
		addColorAlpha(key:number,value:number):void;
		updateColorRGB(index:number,key:number,value:laya.d3.math.Color):void;
		updateColorAlpha(index:number,key:number,value:number):void;
		evaluateColorRGB(lerpFactor:number,out:laya.d3.math.Color,startSearchIndex?:number,reverseSearch?:boolean):number;
		evaluateColorAlpha(lerpFactor:number,outColor:laya.d3.math.Color,startSearchIndex?:number,reverseSearch?:boolean):number;
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.webgl.text {
	class AtlasGrid  {
		atlasID:number;
		private _width:any;
		private _height:any;
		private _texCount:any;
		private _rowInfo:any;
		private _cells:any;
		_used:number;

		constructor(width?:number,height?:number,id?:number);
		addRect(type:number,width:number,height:number,pt:laya.maths.Point):boolean;
		private _release:any;
		private _init:any;
		private _get:any;
		private _fill:any;
		private _check:any;
		private _clear:any;
	}

}

declare module laya.webgl {
	class WebGL  {
		static shaderHighPrecision:boolean;
		static _isWebGL2:boolean;
		static isNativeRender_enable:boolean;
		private static _uint8ArraySlice:any;
		private static _float32ArraySlice:any;
		private static _uint16ArraySlice:any;
		static _nativeRender_enable():void;
		static enable():boolean;
		static inner_enable():boolean;
		static onStageResize(width:number,height:number):void;
	}

}

declare module laya.webgl.shader.d2 {
	class Shader2D  {
		ALPHA:number;
		shader:laya.webgl.shader.Shader;
		filters:any[];
		defines:laya.webgl.shader.d2.ShaderDefines2D;
		shaderType:number;
		colorAdd:any[];
		fillStyle:laya.webgl.canvas.DrawStyle;
		strokeStyle:laya.webgl.canvas.DrawStyle;
		destroy():void;
		static __init__():void;
	}

}

declare module laya.webgl.utils {
	class Buffer2D extends laya.webgl.utils.Buffer  {
		static FLOAT32:number;
		static SHORT:number;
		static __int__(gl:laya.webgl.WebGLContext):void;
		protected _maxsize:number;
		_upload:boolean;
		protected _uploadSize:number;
		protected _bufferSize:number;
		protected _u8Array:Uint8Array;
		readonly bufferLength:number;
		byteLength:number;
		setByteLength(value:number):void;
		needSize(sz:number):number;

		constructor();
		protected _bufferData():void;
		protected _bufferSubData(offset?:number,dataStart?:number,dataLength?:number):void;
		protected _checkArrayUse():void;
		_bind_uploadForVAO():boolean;
		_bind_upload():boolean;
		_bind_subUpload(offset?:number,dataStart?:number,dataLength?:number):boolean;
		_resizeBuffer(nsz:number,copy:boolean):Buffer2D;
		append(data:any):void;
		appendU16Array(data:Uint16Array,len:number):void;
		appendEx(data:any,type:new (buf: any, len: any) => any):void;
		appendEx2(data:any,type:new (buff: any, len: any) => any,dataLen:number,perDataLen?:number):void;
		getBuffer():ArrayBuffer;
		setNeedUpload():void;
		getNeedUpload():boolean;
		upload():boolean;
		subUpload(offset?:number,dataStart?:number,dataLength?:number):boolean;
		protected _disposeResource():void;
		clear():void;
	}

}

declare module laya.utils {
	class Dragging  {
		target:laya.display.Sprite;
		ratio:number;
		maxOffset:number;
		area:laya.maths.Rectangle;
		hasInertia:boolean;
		elasticDistance:number;
		elasticBackTime:number;
		data:any;
		private _dragging:any;
		private _clickOnly:any;
		private _elasticRateX:any;
		private _elasticRateY:any;
		private _lastX:any;
		private _lastY:any;
		private _offsetX:any;
		private _offsetY:any;
		private _offsets:any;
		private _disableMouseEvent:any;
		private _tween:any;
		private _parent:any;
		start(target:laya.display.Sprite,area:laya.maths.Rectangle,hasInertia:boolean,elasticDistance:number,elasticBackTime:number,data:any,disableMouseEvent:boolean,ratio?:number):void;
		private clearTimer:any;
		stop():void;
		private loop:any;
		private checkArea:any;
		private backToArea:any;
		private onStageMouseUp:any;
		private checkElastic:any;
		private tweenMove:any;
		private clear:any;
	}

}

declare module laya.particle.shader {
	class ParticleShader extends laya.webgl.shader.Shader  {
		static vs:string;
		static ps:string;

		constructor();
	}

}

declare module laya.ani.bone.canvasmesh {
	class SkinMeshForGraphic extends laya.ani.bone.canvasmesh.MeshData  {

		constructor();
		transform:laya.maths.Matrix;
		init2(texture:laya.resource.Texture,ps:any[],verticles:any[],uvs:any[]):void;
	}

}

declare module laya.net {
	class Socket extends laya.events.EventDispatcher  {
		static LITTLE_ENDIAN:string;
		static BIG_ENDIAN:string;
		protected _socket:any;
		private _connected:any;
		private _addInputPosition:any;
		private _input:any;
		private _output:any;
		disableInput:boolean;
		private _byteClass:any;
		protocols:any;
		readonly input:any;
		readonly output:any;
		readonly connected:boolean;
		endian:string;

		constructor(host?:string,port?:number,byteClass?:new () => any,protocols?:any[]);
		connect(host:string,port:number):void;
		connectByUrl(url:string):void;
		cleanSocket():void;
		close():void;
		protected _onOpen(e:any):void;
		protected _onMessage(msg:any):void;
		protected _onClose(e:any):void;
		protected _onError(e:any):void;
		send(data:any):void;
		flush():void;
	}

}

declare module laya.d3.physics {
	class ContactPoint  {
		colliderA:laya.d3.physics.PhysicsComponent;
		colliderB:laya.d3.physics.PhysicsComponent;
		distance:number;
		normal:laya.d3.math.Vector3;
		positionOnA:laya.d3.math.Vector3;
		positionOnB:laya.d3.math.Vector3;

		constructor();
	}

}

declare module laya.html.dom {
	class HTMLLinkElement extends laya.html.dom.HTMLElement  {
		static _cuttingStyle:RegExp;
		type:string;
		private _loader:any;
		protected _creates():void;
		drawToGraphic(graphic:laya.display.Graphics,gX:number,gY:number,recList:any[]):void;
		reset():laya.html.dom.HTMLElement;
		href:string;
	}

}

declare module laya.display {
	class Node extends laya.events.EventDispatcher  {
		protected static ARRAY_EMPTY:any[];
		private _bits:any;
		name:string;
		destroyed:boolean;

		constructor();
		on(type:string,caller:any,listener:Function,args?:any[]):laya.events.EventDispatcher;
		once(type:string,caller:any,listener:Function,args?:any[]):laya.events.EventDispatcher;
		destroy(destroyChild?:boolean):void;
		onDestroy():void;
		destroyChildren():void;
		addChild(node:Node):Node;
		addInputChild(node:Node):Node;
		removeInputChild(node:Node):void;
		addChildren(...args:any[]):void;
		addChildAt(node:Node,index:number):Node;
		getChildIndex(node:Node):number;
		getChildByName(name:string):Node;
		getChildAt(index:number):Node;
		setChildIndex(node:Node,index:number):Node;
		protected _childChanged(child?:Node):void;
		removeChild(node:Node):Node;
		removeSelf():Node;
		removeChildByName(name:string):Node;
		removeChildAt(index:number):Node;
		removeChildren(beginIndex?:number,endIndex?:number):Node;
		readonly numChildren:number;
		readonly parent:Node;
		protected _setParent(value:Node):void;
		readonly displayedInStage:boolean;
		private _updateDisplayedInstage:any;
		private _displayChild:any;
		contains(node:Node):boolean;
		timerLoop(delay:number,caller:any,method:Function,args?:any[],coverBefore?:boolean,jumpFrame?:boolean):void;
		timerOnce(delay:number,caller:any,method:Function,args?:any[],coverBefore?:boolean):void;
		frameLoop(delay:number,caller:any,method:Function,args?:any[],coverBefore?:boolean):void;
		frameOnce(delay:number,caller:any,method:Function,args?:any[],coverBefore?:boolean):void;
		clearTimer(caller:any,method:Function):void;
		callLater(method:Function,args?:any[]):void;
		runCallLater(method:Function):void;
		private _components:any;
		private _activeChangeScripts:any;
		readonly scene:any;
		active:boolean;
		readonly activeInHierarchy:boolean;
		protected _onActive():void;
		protected _onInActive():void;
		protected _onActiveInScene():void;
		protected _onInActiveInScene():void;
		onAwake():void;
		onEnable():void;
		private _activeScripts:any;
		private _processInActive:any;
		private _inActiveScripts:any;
		onDisable():void;
		protected _onAdded():void;
		protected _onRemoved():void;
		addComponentIntance(comp:laya.components.Component):any;
		addComponent(type:new () => any):any;
		getComponent(clas:any):any;
		getComponents(clas:any):any[];
		readonly timer:laya.utils.Timer;
	}

}

declare module laya.d3.physics.constraints {
	class ConstraintComponent extends laya.components.Component  {
		enabled:boolean;
		breakingImpulseThreshold:number;
		readonly appliedImpulse:number;
		connectedBody:laya.d3.physics.Rigidbody3D;

		constructor();
		protected _onDestroy():void;
	}

}

declare module laya.d3.resource.models {
	class SkyDome extends laya.d3.resource.models.SkyMesh  {
		static instance:SkyDome;
		readonly stacks:number;
		readonly slices:number;

		constructor(stacks?:number,slices?:number);
	}

}

declare module laya.d3.math {
	class ContainmentType  {
		static Disjoint:number;
		static Contains:number;
		static Intersects:number;
	}

}

declare module laya.physics.joint {
	class JointBase extends laya.components.Component  {
		protected _joint:any;
		readonly joint:any;
		protected _onEnable():void;
		protected _onAwake():void;
		protected _createJoint():void;
		protected _onDisable():void;
	}

}

declare module laya.webgl.canvas.save {
	class SaveBase implements laya.webgl.canvas.save.ISaveData  {
		static TYPE_ALPHA:number;
		static TYPE_FILESTYLE:number;
		static TYPE_FONT:number;
		static TYPE_LINEWIDTH:number;
		static TYPE_STROKESTYLE:number;
		static TYPE_MARK:number;
		static TYPE_TRANSFORM:number;
		static TYPE_TRANSLATE:number;
		static TYPE_ENABLEMERGE:number;
		static TYPE_TEXTBASELINE:number;
		static TYPE_TEXTALIGN:number;
		static TYPE_GLOBALCOMPOSITEOPERATION:number;
		static TYPE_CLIPRECT:number;
		static TYPE_CLIPRECT_STENCIL:number;
		static TYPE_IBVB:number;
		static TYPE_SHADER:number;
		static TYPE_FILTERS:number;
		static TYPE_FILTERS_TYPE:number;
		static TYPE_COLORFILTER:number;
		private static POOL:any;
		private static _namemap:any;
		private _valueName:any;
		private _value:any;
		private _dataObj:any;
		private _newSubmit:any;

		constructor();
		isSaveMark():boolean;
		restore(context:laya.resource.Context):void;
		static save(context:laya.resource.Context,type:number,dataObj:any,newSubmit:boolean):void;
	}

}

declare module laya.physics {
	class PolygonCollider extends laya.physics.ColliderBase  {
		private _x:any;
		private _y:any;
		private _points:any;
		protected getDef():any;
		private _setShape:any;
		x:number;
		y:number;
		points:string;
	}

}

declare module laya.webgl.shapes {
	class EarcutNode  {
		i:any;
		x:any;
		y:any;
		prev:any;
		next:any;
		z:any;
		prevZ:any;
		nextZ:any;
		steiner:any;

		constructor(i:any,x:any,y:any);
	}

}

declare module laya.display.cmd {
	class DrawImageCmd  {
		static ID:string;
		texture:laya.resource.Texture;
		x:number;
		y:number;
		width:number;
		height:number;
		static create(texture:laya.resource.Texture,x:number,y:number,width:number,height:number):DrawImageCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.webgl.shader {
	class ShaderDefinesBase  {
		private _name2int:any;
		private _int2name:any;
		private _int2nameMap:any;

		constructor(name2int:any,int2name:any[],int2nameMap:any[]);
		add(value:any):number;
		addInt(value:number):number;
		remove(value:any):number;
		isDefine(def:number):boolean;
		getValue():number;
		setValue(value:number):void;
		toNameDic():any;
		static _reg(name:string,value:number,_name2int:any,_int2name:any[]):void;
		static _toText(value:number,_int2name:any[],_int2nameMap:any):any;
		static _toInt(names:string,_name2int:any):number;
	}

}

declare module laya.webgl.submit {
	class SubmitBase implements laya.webgl.submit.ISubmit  {
		static TYPE_2D:number;
		static TYPE_CANVAS:number;
		static TYPE_CMDSETRT:number;
		static TYPE_CUSTOM:number;
		static TYPE_BLURRT:number;
		static TYPE_CMDDESTORYPRERT:number;
		static TYPE_DISABLESTENCIL:number;
		static TYPE_OTHERIBVB:number;
		static TYPE_PRIMITIVE:number;
		static TYPE_RT:number;
		static TYPE_BLUR_RT:number;
		static TYPE_TARGET:number;
		static TYPE_CHANGE_VALUE:number;
		static TYPE_SHAPE:number;
		static TYPE_TEXTURE:number;
		static TYPE_FILLTEXTURE:number;
		static KEY_ONCE:number;
		static KEY_FILLRECT:number;
		static KEY_DRAWTEXTURE:number;
		static KEY_VG:number;
		static KEY_TRIANGLES:number;
		static RENDERBASE:SubmitBase;
		static ID:number;
		static preRender:laya.webgl.submit.ISubmit;
		clipInfoID:number;
		protected _id:number;
		shaderValue:laya.webgl.shader.d2.value.Value2D;
		static __init__():void;

		constructor(renderType?:number);
		getID():number;
		getRenderType():number;
		toString():string;
		renderSubmit():number;
		releaseRender():void;
	}

}

declare module laya.d3.component {
	class SingletonList<T>  {

		constructor();
	}

}

declare module laya.ui {
	class ComboBox extends laya.ui.UIComponent  {
		protected _visibleNum:number;
		protected _button:laya.ui.Button;
		protected _list:laya.ui.List;
		protected _isOpen:boolean;
		protected _itemColors:any[];
		protected _itemSize:number;
		protected _labels:any[];
		protected _selectedIndex:number;
		protected _selectHandler:laya.utils.Handler;
		protected _itemHeight:number;
		protected _listHeight:number;
		protected _listChanged:boolean;
		protected _itemChanged:boolean;
		protected _scrollBarSkin:string;
		protected _isCustomList:boolean;
		itemRender:any;

		constructor(skin?:string,labels?:string);
		destroy(destroyChild?:boolean):void;
		protected createChildren():void;
		private _createList:any;
		private _setListEvent:any;
		private onListDown:any;
		private onScrollBarDown:any;
		private onButtonMouseDown:any;
		skin:string;
		protected measureWidth():number;
		protected measureHeight():number;
		protected changeList():void;
		protected onlistItemMouse(e:laya.events.Event,index:number):void;
		private switchTo:any;
		protected changeOpen():void;
		width:number;
		height:number;
		labels:string;
		protected changeItem():void;
		selectedIndex:number;
		private changeSelected:any;
		selectHandler:laya.utils.Handler;
		selectedLabel:string;
		visibleNum:number;
		itemColors:string;
		itemSize:number;
		isOpen:boolean;
		private _onStageMouseWheel:any;
		protected removeList(e:laya.events.Event):void;
		scrollBarSkin:string;
		sizeGrid:string;
		readonly scrollBar:laya.ui.VScrollBar;
		readonly button:laya.ui.Button;
		list:laya.ui.List;
		dataSource:any;
		labelColors:string;
		labelPadding:string;
		labelSize:number;
		labelBold:boolean;
		labelFont:string;
		stateNum:number;
	}

}

declare module laya.d3.core {
	class GradientMode  {
		static Blend:number;
		static Fixed:number;
	}

}

declare module laya.d3.utils {
	class Size  {
		static readonly fullScreen:Size;
		private _width:any;
		private _height:any;
		readonly width:number;
		readonly height:number;

		constructor(width:number,height:number);
	}

}

declare module laya.webgl.text {
	class CharRenderInfo  {
		char:string;
		tex:any;
		deleted:boolean;
		uv:any[];
		pos:number;
		width:number;
		height:number;
		bmpWidth:number;
		bmpHeight:number;
		orix:number;
		oriy:number;
		touchTick:number;
		isSpace:boolean;
		touch():void;
	}

}

declare module laya.webgl.shader.d2 {
	class Shader2X extends laya.webgl.shader.Shader  {
		_params2dQuick2:any[];
		_shaderValueWidth:number;
		_shaderValueHeight:number;

		constructor(vs:string,ps:string,saveName?:any,nameMap?:any,bindAttrib?:any[]);
		protected _disposeResource():void;
		upload2dQuick2(shaderValue:laya.webgl.shader.ShaderValue):void;
		_make2dQuick2():any[];
		static create(vs:string,ps:string,saveName?:any,nameMap?:any,bindAttrib?:any[]):laya.webgl.shader.Shader;
	}

}

declare module laya.d3.graphics {
	class VertexBuffer3D extends laya.webgl.utils.Buffer  {
		static DATATYPE_FLOAT32ARRAY:number;
		static DATATYPE_UINT8ARRAY:number;
		vertexDeclaration:laya.d3.graphics.VertexDeclaration;
		readonly vertexCount:number;
		readonly canRead:boolean;

		constructor(byteLength:number,bufferUsage:number,canRead?:boolean);
		bind():boolean;
		setData(buffer:ArrayBuffer,bufferOffset?:number,dataStartIndex?:number,dataCount?:number):void;
		getUint8Data():Uint8Array;
		getFloat32Data():Float32Array;
		markAsUnreadbale():void;
		destroy():void;
	}

}

declare module laya.webgl {
	class WebGLContext  {
		static mainContext:WebGLRenderingContext;
		static useProgram(gl:WebGLRenderingContext,program:any):boolean;
		static setDepthTest(gl:WebGLRenderingContext,value:boolean):void;
		static setDepthMask(gl:WebGLRenderingContext,value:boolean):void;
		static setDepthFunc(gl:WebGLRenderingContext,value:number):void;
		static setBlend(gl:WebGLRenderingContext,value:boolean):void;
		static setBlendFunc(gl:WebGLRenderingContext,sFactor:number,dFactor:number):void;
		static setBlendFuncSeperate(gl:WebGLRenderingContext,srcRGB:number,dstRGB:number,srcAlpha:number,dstAlpha:number):void;
		static setCullFace(gl:WebGLRenderingContext,value:boolean):void;
		static setFrontFace(gl:WebGLRenderingContext,value:number):void;
		static activeTexture(gl:WebGLRenderingContext,textureID:number):void;
		static bindTexture(gl:WebGLRenderingContext,target:any,texture:any):void;
		static __init_native():void;
		static useProgramForNative(gl:WebGLRenderingContext,program:any):boolean;
		static setDepthTestForNative(gl:WebGLRenderingContext,value:boolean):void;
		static setDepthMaskForNative(gl:WebGLRenderingContext,value:boolean):void;
		static setDepthFuncForNative(gl:WebGLRenderingContext,value:number):void;
		static setBlendForNative(gl:WebGLRenderingContext,value:boolean):void;
		static setBlendFuncForNative(gl:WebGLRenderingContext,sFactor:number,dFactor:number):void;
		static setCullFaceForNative(gl:WebGLRenderingContext,value:boolean):void;
		static setFrontFaceForNative(gl:WebGLRenderingContext,value:number):void;
		static activeTextureForNative(gl:WebGLRenderingContext,textureID:number):void;
		static bindTextureForNative(gl:WebGLRenderingContext,target:any,texture:any):void;
		static bindVertexArrayForNative(gl:WebGLContext,vertexArray:any):void;
	}

}

declare module laya.webgl.utils {
	class CONST3D2D  {
		static BYTES_PE:number;
		static BYTES_PIDX:number;
		static defaultMatrix4:any[];
		static defaultMinusYMatrix4:any[];
		static uniformMatrix3:any[];
		static _TMPARRAY:any[];
		static _OFFSETX:number;
		static _OFFSETY:number;
	}

}

declare module laya.d3.graphics.Vertex {
	class VertexMesh  {
		static MESH_POSITION0:number;
		static MESH_COLOR0:number;
		static MESH_TEXTURECOORDINATE0:number;
		static MESH_NORMAL0:number;
		static MESH_TANGENT0:number;
		static MESH_BLENDINDICES0:number;
		static MESH_BLENDWEIGHT0:number;
		static MESH_TEXTURECOORDINATE1:number;
		static MESH_WORLDMATRIX_ROW0:number;
		static MESH_WORLDMATRIX_ROW1:number;
		static MESH_WORLDMATRIX_ROW2:number;
		static MESH_WORLDMATRIX_ROW3:number;
		static MESH_MVPMATRIX_ROW0:number;
		static MESH_MVPMATRIX_ROW1:number;
		static MESH_MVPMATRIX_ROW2:number;
		static MESH_MVPMATRIX_ROW3:number;
		static instanceWorldMatrixDeclaration:laya.d3.graphics.VertexDeclaration;
		static instanceMVPMatrixDeclaration:laya.d3.graphics.VertexDeclaration;
		static getVertexDeclaration(vertexFlag:string,compatible?:boolean):laya.d3.graphics.VertexDeclaration;
	}

}

declare module laya.utils {
	class Ease  {
		private static HALF_PI:any;
		private static PI2:any;
		static linearNone(t:number,b:number,c:number,d:number):number;
		static linearIn(t:number,b:number,c:number,d:number):number;
		static linearInOut(t:number,b:number,c:number,d:number):number;
		static linearOut(t:number,b:number,c:number,d:number):number;
		static bounceIn(t:number,b:number,c:number,d:number):number;
		static bounceInOut(t:number,b:number,c:number,d:number):number;
		static bounceOut(t:number,b:number,c:number,d:number):number;
		static backIn(t:number,b:number,c:number,d:number,s?:number):number;
		static backInOut(t:number,b:number,c:number,d:number,s?:number):number;
		static backOut(t:number,b:number,c:number,d:number,s?:number):number;
		static elasticIn(t:number,b:number,c:number,d:number,a?:number,p?:number):number;
		static elasticInOut(t:number,b:number,c:number,d:number,a?:number,p?:number):number;
		static elasticOut(t:number,b:number,c:number,d:number,a?:number,p?:number):number;
		static strongIn(t:number,b:number,c:number,d:number):number;
		static strongInOut(t:number,b:number,c:number,d:number):number;
		static strongOut(t:number,b:number,c:number,d:number):number;
		static sineInOut(t:number,b:number,c:number,d:number):number;
		static sineIn(t:number,b:number,c:number,d:number):number;
		static sineOut(t:number,b:number,c:number,d:number):number;
		static quintIn(t:number,b:number,c:number,d:number):number;
		static quintInOut(t:number,b:number,c:number,d:number):number;
		static quintOut(t:number,b:number,c:number,d:number):number;
		static quartIn(t:number,b:number,c:number,d:number):number;
		static quartInOut(t:number,b:number,c:number,d:number):number;
		static quartOut(t:number,b:number,c:number,d:number):number;
		static cubicIn(t:number,b:number,c:number,d:number):number;
		static cubicInOut(t:number,b:number,c:number,d:number):number;
		static cubicOut(t:number,b:number,c:number,d:number):number;
		static quadIn(t:number,b:number,c:number,d:number):number;
		static quadInOut(t:number,b:number,c:number,d:number):number;
		static quadOut(t:number,b:number,c:number,d:number):number;
		static expoIn(t:number,b:number,c:number,d:number):number;
		static expoInOut(t:number,b:number,c:number,d:number):number;
		static expoOut(t:number,b:number,c:number,d:number):number;
		static circIn(t:number,b:number,c:number,d:number):number;
		static circInOut(t:number,b:number,c:number,d:number):number;
		static circOut(t:number,b:number,c:number,d:number):number;
	}

}

declare module laya.resource {
	interface ISingletonElement{
		_getIndexInList():number;
		_setIndexInList(index:number):void;
	}

}

declare module laya.net {
	class TTFLoader  {
		private static _testString:any;
		fontName:string;
		complete:laya.utils.Handler;
		err:laya.utils.Handler;
		private _fontTxt:any;
		private _url:any;
		private _div:any;
		private _txtWidth:any;
		private _http:any;
		load(fontPath:string):void;
		private _loadConch:any;
		private _onHttpLoaded:any;
		private _clearHttp:any;
		private _onErr:any;
		private _complete:any;
		private _checkComplete:any;
		private _loadWithFontFace:any;
		private _createDiv:any;
		private _loadWithCSS:any;
	}

}

declare module laya.d3.physics {
	class HitResult  {
		succeeded:boolean;
		collider:laya.d3.physics.PhysicsComponent;
		point:laya.d3.math.Vector3;
		normal:laya.d3.math.Vector3;
		hitFraction:number;

		constructor();
	}

}

declare module laya.html.dom {
	class HTMLStyleElement extends laya.html.dom.HTMLElement  {
		protected _creates():void;
		drawToGraphic(graphic:laya.display.Graphics,gX:number,gY:number,recList:any[]):void;
		reset():laya.html.dom.HTMLElement;
		innerTEXT:string;
	}

}

declare module laya.display {
	class Scene extends laya.display.Sprite  {
		static unDestroyedScenes:any[];
		private static _root:any;
		private static _loadPage:any;
		autoDestroyAtClosed:boolean;
		url:string;
		private _timer:any;
		private _viewCreated:any;

		constructor();
		protected createChildren():void;
		loadScene(path:string):void;
		private _onSceneLoaded:any;
		createView(view:any):void;
		getNodeByID(id:number):any;
		open(closeOther?:boolean,param?:any):void;
		onOpened(param:any):void;
		close(type?:string):void;
		onClosed(type?:string):void;
		destroy(destroyChild?:boolean):void;
		scaleX:number;
		scaleY:number;
		width:number;
		height:number;
		protected _sizeChanged():void;
		static readonly root:laya.display.Sprite;
		timer:laya.utils.Timer;
		static load(url:string,complete?:laya.utils.Handler,progress?:laya.utils.Handler):void;
		static open(url:string,closeOther?:boolean,param?:any,complete?:laya.utils.Handler,progress?:laya.utils.Handler):void;
		private static _onSceneLoaded:any;
		static close(url:string,name?:string):boolean;
		static closeAll():void;
		static destroy(url:string,name?:string):boolean;
		static gc():void;
		static setLoadingPage(loadPage:Scene):void;
		static showLoadingPage(param?:any,delay?:number):void;
		private static _showLoading:any;
		private static _hideLoading:any;
		static hideLoadingPage(delay?:number):void;
	}

}

declare module laya.d3.physics.constraints {
	class Point2PointConstraint  {
		pivotInA:laya.d3.math.Vector3;
		pivotInB:laya.d3.math.Vector3;
		damping:number;
		impulseClamp:number;
		tau:number;

		constructor();
	}

}

declare module laya.d3.math {
	class HalfFloatUtils  {
		static roundToFloat16Bits(num:number):number;
		static convertToNumber(float16bits:number):number;
	}

}

declare module laya.d3.resource.models {
	class SkyMesh  {

		constructor();
	}

}

declare module laya.physics.joint {
	class MotorJoint extends laya.physics.joint.JointBase  {
		private static _temp:any;
		selfBody:laya.physics.RigidBody;
		otherBody:laya.physics.RigidBody;
		collideConnected:boolean;
		private _linearOffset:any;
		private _angularOffset:any;
		private _maxForce:any;
		private _maxTorque:any;
		private _correctionFactor:any;
		protected _createJoint():void;
		linearOffset:any[];
		angularOffset:number;
		maxForce:number;
		maxTorque:number;
		correctionFactor:number;
	}

}

declare module laya.webgl.canvas.save {
	class SaveClipRect implements laya.webgl.canvas.save.ISaveData  {
		private static POOL:any;
		private _globalClipMatrix:any;
		private _clipInfoID:any;
		incache:boolean;
		isSaveMark():boolean;
		restore(context:laya.resource.Context):void;
		static save(context:laya.resource.Context):void;
	}

}

declare module laya.physics {
	class RigidBody extends laya.components.Component  {
		protected _type:string;
		protected _allowSleep:boolean;
		protected _angularVelocity:number;
		protected _angularDamping:number;
		protected _linearVelocity:any;
		protected _linearDamping:number;
		protected _bullet:boolean;
		protected _allowRotation:boolean;
		protected _gravityScale:number;
		group:number;
		category:number;
		mask:number;
		label:string;
		protected _body:any;
		private _createBody:any;
		protected _onAwake():void;
		protected _onEnable():void;
		private accessGetSetFunc:any;
		private resetCollider:any;
		private _sysPhysicToNode:any;
		private _sysNodeToPhysic:any;
		private _sysPosToPhysic:any;
		private _overSet:any;
		protected _onDisable():void;
		getBody():any;
		readonly body:any;
		applyForce(position:any,force:any):void;
		applyForceToCenter(force:any):void;
		applyLinearImpulse(position:any,impulse:any):void;
		applyLinearImpulseToCenter(impulse:any):void;
		applyTorque(torque:number):void;
		setVelocity(velocity:any):void;
		setAngle(value:any):void;
		getMass():number;
		getCenter():any;
		getWorldCenter():any;
		type:string;
		gravityScale:number;
		allowRotation:boolean;
		allowSleep:boolean;
		angularDamping:number;
		angularVelocity:number;
		linearDamping:number;
		linearVelocity:any;
		bullet:boolean;
	}

}

declare module laya.ani.bone {
	class EventData  {
		name:string;
		intValue:number;
		floatValue:number;
		stringValue:string;
		audioValue:string;
		time:number;

		constructor();
	}

}

declare module laya.display.cmd {
	class DrawLineCmd  {
		static ID:string;
		fromX:number;
		fromY:number;
		toX:number;
		toY:number;
		lineColor:string;
		lineWidth:number;
		vid:number;
		static create(fromX:number,fromY:number,toX:number,toY:number,lineColor:string,lineWidth:number,vid:number):DrawLineCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.webgl.shader {
	class ShaderValue  {

		constructor();
	}

}

declare module laya.webgl.submit {
	class SubmitCanvas extends laya.webgl.submit.SubmitBase  {
		canv:laya.resource.Context;
		static create(canvas:any,alpha:number,filters:any[]):SubmitCanvas;

		constructor();
		renderSubmit():number;
		releaseRender():void;
		getRenderType():number;
		static POOL:any;
	}

}

declare module laya.ui {
	class Dialog extends laya.ui.View  {
		static CLOSE:string;
		static CANCEL:string;
		static SURE:string;
		static NO:string;
		static YES:string;
		static OK:string;
		private static _manager:any;
		static manager:laya.ui.DialogManager;
		closeHandler:laya.utils.Handler;
		popupEffect:laya.utils.Handler;
		closeEffect:laya.utils.Handler;
		group:string;
		isModal:boolean;
		isShowEffect:boolean;
		isPopupCenter:boolean;
		closeType:string;
		private _dragArea:any;

		constructor();
		protected _dealDragArea():void;
		dragArea:string;
		private _onMouseDown:any;
		protected _onClick(e:laya.events.Event):void;
		open(closeOther?:boolean,param?:any):void;
		close(type?:string):void;
		destroy(destroyChild?:boolean):void;
		show(closeOther?:boolean,showEffect?:boolean):void;
		popup(closeOther?:boolean,showEffect?:boolean):void;
		protected _open(modal:boolean,closeOther:boolean,showEffect:boolean):void;
		readonly isPopup:boolean;
		zOrder:number;
		static setLockView(view:laya.ui.UIComponent):void;
		static lock(value:boolean):void;
		static closeAll():void;
		static getDialogsByGroup(group:string):any[];
		static closeByGroup(group:string):any[];
	}

}

declare module laya.d3.graphics {
	class VertexDeclaration  {
		readonly id:number;
		readonly vertexStride:number;
		readonly vertexElementCount:number;

		constructor(vertexStride:number,vertexElements:Array<laya.d3.graphics.VertexElement>);
		getVertexElementByIndex(index:number):laya.d3.graphics.VertexElement;
	}

}

declare module laya.d3.core {
	class HeightMap  {
		private static _tempRay:any;
		static creatFromMesh(mesh:laya.d3.resource.models.Mesh,width:number,height:number,outCellSize:laya.d3.math.Vector2):HeightMap;
		static createFromImage(texture:laya.resource.Texture2D,minHeight:number,maxHeight:number):HeightMap;
		private static _getPosition:any;
		private _datas:any;
		private _w:any;
		private _h:any;
		private _minHeight:any;
		private _maxHeight:any;
		readonly width:number;
		readonly height:number;
		readonly maxHeight:number;
		readonly minHeight:number;

		constructor(width:number,height:number,minHeight:number,maxHeight:number);
		getHeight(row:number,col:number):number;
	}

}

declare module laya.webgl.shader.d2 {
	class ShaderDefines2D extends laya.webgl.shader.ShaderDefinesBase  {
		static TEXTURE2D:number;
		static PRIMITIVE:number;
		static FILTERGLOW:number;
		static FILTERBLUR:number;
		static FILTERCOLOR:number;
		static COLORADD:number;
		static WORLDMAT:number;
		static FILLTEXTURE:number;
		static SKINMESH:number;
		static SHADERDEFINE_FSHIGHPRECISION:number;
		static MVP3D:number;
		static NOOPTMASK:number;
		private static __name2int:any;
		private static __int2name:any;
		private static __int2nameMap:any;
		static __init__():void;

		constructor();
		static reg(name:string,value:number):void;
		static toText(value:number,int2name:any[],int2nameMap:any):any;
		static toInt(names:string):number;
	}

}

declare module laya.d3.utils {
	class Utils3D  {
		private static _tempVector3_0:any;
		private static _tempVector3_1:any;
		private static _tempVector3_2:any;
		private static _tempColor0:any;
		private static _tempArray16_0:any;
		private static _tempArray16_1:any;
		private static _tempArray16_2:any;
		private static _tempArray16_3:any;
		private static _rotationTransformScaleSkinAnimation:any;
		static transformVector3ArrayByQuat(sourceArray:Float32Array,sourceOffset:number,rotation:laya.d3.math.Quaternion,outArray:Float32Array,outOffset:number):void;
		static mulMatrixByArray(leftArray:Float32Array,leftOffset:number,rightArray:Float32Array,rightOffset:number,outArray:Float32Array,outOffset:number):void;
		static mulMatrixByArrayFast(leftArray:Float32Array,leftOffset:number,rightArray:Float32Array,rightOffset:number,outArray:Float32Array,outOffset:number):void;
		static mulMatrixByArrayAndMatrixFast(leftArray:Float32Array,leftOffset:number,rightMatrix:laya.d3.math.Matrix4x4,outArray:Float32Array,outOffset:number):void;
		static createAffineTransformationArray(tX:number,tY:number,tZ:number,rX:number,rY:number,rZ:number,rW:number,sX:number,sY:number,sZ:number,outArray:Float32Array,outOffset:number):void;
		static transformVector3ArrayToVector3ArrayCoordinate(source:Float32Array,sourceOffset:number,transform:laya.d3.math.Matrix4x4,result:Float32Array,resultOffset:number):void;
		static getURLVerion(url:string):string;
		private static arcTanAngle:any;
		private static angleTo:any;
		static transformQuat(source:laya.d3.math.Vector3,rotation:Float32Array,out:laya.d3.math.Vector3):void;
		static quaternionWeight(f:laya.d3.math.Quaternion,weight:number,e:laya.d3.math.Quaternion):void;
		static matrix4x4MultiplyFFF(a:Float32Array,b:Float32Array,e:Float32Array):void;
		static matrix4x4MultiplyFFFForNative(a:Float32Array,b:Float32Array,e:Float32Array):void;
		static matrix4x4MultiplyMFM(left:laya.d3.math.Matrix4x4,right:Float32Array,out:laya.d3.math.Matrix4x4):void;
	}

}

declare module laya.d3.shader {
	class ShaderPass extends laya.webgl.utils.ShaderCompile  {
		readonly renderState:laya.d3.core.material.RenderState;

		constructor(owner:laya.d3.shader.SubShader,vs:string,ps:string,stateMap:any);
		protected _compileToTree(parent:laya.webgl.utils.ShaderNode,lines:any[],start:number,includefiles:any[],defs:any):void;
	}

}

declare module laya.webgl.text {
	class CharRender_Canvas extends laya.webgl.text.ICharRender  {
		private static canvas:any;
		private ctx:any;
		private lastScaleX:any;
		private lastScaleY:any;
		private needResetScale:any;
		private maxTexW:any;
		private maxTexH:any;
		private scaleFontSize:any;
		private showDbgInfo:any;
		private supportImageData:any;

		constructor(maxw:number,maxh:number,scalefont?:boolean,useImageData?:boolean,showdbg?:boolean);
		canvasWidth:number;
		getWidth(font:string,str:string):number;
		scale(sx:number,sy:number):void;
		getCharBmp(char:string,font:string,lineWidth:number,colStr:string,strokeColStr:string,cri:laya.webgl.text.CharRenderInfo,margin_left:number,margin_top:number,margin_right:number,margin_bottom:number,rect?:any[]):ImageData;
		getCharCanvas(char:string,font:string,lineWidth:number,colStr:string,strokeColStr:string,cri:laya.webgl.text.CharRenderInfo,margin_left:number,margin_top:number,margin_right:number,margin_bottom:number):ImageData;
	}

}

declare module laya.webgl.utils {
	class IndexBuffer2D extends laya.webgl.utils.Buffer2D  {
		static create:Function;
		protected _uint16Array:Uint16Array;

		constructor(bufferUsage?:number);
		protected _checkArrayUse():void;
		getUint16Array():Uint16Array;
		_bindForVAO():void;
		bind():boolean;
		destory():void;
		disposeResource():void;
	}

}

declare module laya.d3.graphics.Vertex {
	class VertexPositionTerrain implements laya.d3.graphics.IVertex  {
		static TERRAIN_POSITION0:number;
		static TERRAIN_NORMAL0:number;
		static TERRAIN_TEXTURECOORDINATE0:number;
		static TERRAIN_TEXTURECOORDINATE1:number;
		private static _vertexDeclaration:any;
		static readonly vertexDeclaration:laya.d3.graphics.VertexDeclaration;
		private _position:any;
		private _normal:any;
		private _textureCoord0:any;
		private _textureCoord1:any;
		readonly position:laya.d3.math.Vector3;
		readonly normal:laya.d3.math.Vector3;
		readonly textureCoord0:laya.d3.math.Vector2;
		readonly textureCoord1:laya.d3.math.Vector2;
		readonly vertexDeclaration:laya.d3.graphics.VertexDeclaration;

		constructor(position:laya.d3.math.Vector3,normal:laya.d3.math.Vector3,textureCoord0:laya.d3.math.Vector2,textureCoord1:laya.d3.math.Vector2);
	}

}

declare module laya.utils {
	class FontInfo  {
		static EMPTY:FontInfo;
		private static _cache:any;
		private static _gfontID:any;
		private static _lastFont:any;
		private static _lastFontInfo:any;
		static Parse(font:string):FontInfo;
		_id:number;
		_font:string;
		_family:string;
		_size:number;
		_italic:boolean;
		_bold:boolean;

		constructor(font:string);
		setFont(value:string):void;
	}

}

declare module laya.resource {
	class RenderTexture2D extends laya.resource.BaseTexture  {
		private static _currentActive:any;
		private _lastRT:any;
		private _lastWidth:any;
		private _lastHeight:any;
		private static rtStack:any;
		static defuv:any[];
		static flipyuv:any[];
		static readonly currentActive:RenderTexture2D;
		private _frameBuffer:any;
		private _depthStencilBuffer:any;
		private _depthStencilFormat:any;
		readonly depthStencilFormat:number;
		readonly defaulteTexture:laya.resource.BaseTexture;
		getIsReady():boolean;
		readonly sourceWidth:number;
		readonly sourceHeight:number;
		readonly offsetX:number;
		readonly offsetY:number;

		constructor(width:number,height:number,format?:number,depthStencilFormat?:number);
		private _create:any;
		generateMipmap():void;
		static pushRT():void;
		static popRT():void;
		start():void;
		end():void;
		restore():void;
		clear(r?:number,g?:number,b?:number,a?:number):void;
		getData(x:number,y:number,width:number,height:number):Uint8Array;
		getDataAsync(x:number,y:number,width:number,height:number,callBack:Function):void;
		recycle():void;
		_disposeResource():void;
	}

}

declare module laya.net {
	class URL  {
		static version:any;
		private _url:any;
		private _path:any;
		static exportSceneToJson:boolean;

		constructor(url:string);
		readonly url:string;
		readonly path:string;
		static _basePath:string;
		static rootPath:string;
		static basePath:string;
		static customFormat:Function;
		static formatURL(url:string):string;
		static getPath(url:string):string;
		static getFileName(url:string):string;
		private static _adpteTypeList:any;
		static getAdptedFilePath(url:string):string;
	}

}

declare module laya.d3.physics {
	class Physics3D  {
	}

}

declare module laya.display {
	class Sprite extends laya.display.Node  {
		_width:number;
		_height:number;
		protected _tfChanged:boolean;
		protected _repaint:number;
		private _texture:any;
		mouseThrough:boolean;
		autoSize:boolean;
		hitTestPrior:boolean;
		destroy(destroyChild?:boolean):void;

		constructor();
		updateZOrder():void;
		customRenderEnable:boolean;
		cacheAs:string;
		private _checkCanvasEnable:any;
		staticCache:boolean;
		reCache():void;
		getRepaint():number;
		x:number;
		y:number;
		width:number;
		set_width(value:number):void;
		get_width():number;
		height:number;
		set_height(value:number):void;
		get_height():number;
		readonly displayWidth:number;
		readonly displayHeight:number;
		setSelfBounds(bound:laya.maths.Rectangle):void;
		getBounds():laya.maths.Rectangle;
		getSelfBounds():laya.maths.Rectangle;
		getGraphicBounds(realSize?:boolean):laya.maths.Rectangle;
		getStyle():laya.display.css.SpriteStyle;
		setStyle(value:laya.display.css.SpriteStyle):void;
		scaleX:number;
		scaleY:number;
		set_scaleX(value:number):void;
		get_scaleX():number;
		set_scaleY(value:number):void;
		get_scaleY():number;
		rotation:number;
		skewX:number;
		skewY:number;
		protected _adjustTransform():laya.maths.Matrix;
		transform:laya.maths.Matrix;
		get_transform():laya.maths.Matrix;
		set_transform(value:laya.maths.Matrix):void;
		pivotX:number;
		pivotY:number;
		alpha:number;
		visible:boolean;
		get_visible():boolean;
		set_visible(value:boolean):void;
		blendMode:string;
		graphics:laya.display.Graphics;
		scrollRect:laya.maths.Rectangle;
		pos(x:number,y:number,speedMode?:boolean):Sprite;
		pivot(x:number,y:number):Sprite;
		size(width:number,height:number):Sprite;
		scale(scaleX:number,scaleY:number,speedMode?:boolean):Sprite;
		skew(skewX:number,skewY:number):Sprite;
		render(ctx:laya.resource.Context,x:number,y:number):void;
		drawToCanvas(canvasWidth:number,canvasHeight:number,offsetX:number,offsetY:number):laya.resource.HTMLCanvas;
		drawToTexture(canvasWidth:number,canvasHeight:number,offsetX:number,offsetY:number):laya.resource.Texture;
		drawToTexture3D(offx:number,offy:number,tex:laya.resource.Texture2D):void;
		static drawToCanvas:Function;
		static drawToTexture:Function;
		customRender(context:laya.resource.Context,x:number,y:number):void;
		filters:any[];
		localToGlobal(point:laya.maths.Point,createNewPoint?:boolean,globalNode?:Sprite):laya.maths.Point;
		globalToLocal(point:laya.maths.Point,createNewPoint?:boolean,globalNode?:Sprite):laya.maths.Point;
		toParentPoint(point:laya.maths.Point):laya.maths.Point;
		fromParentPoint(point:laya.maths.Point):laya.maths.Point;
		fromStagePoint(point:laya.maths.Point):laya.maths.Point;
		on(type:string,caller:any,listener:Function,args?:any[]):laya.events.EventDispatcher;
		once(type:string,caller:any,listener:Function,args?:any[]):laya.events.EventDispatcher;
		protected _onDisplay(v?:boolean):void;
		protected _setParent(value:laya.display.Node):void;
		loadImage(url:string,complete?:laya.utils.Handler):Sprite;
		static fromImage(url:string):Sprite;
		repaint(type?:number):void;
		protected _childChanged(child?:laya.display.Node):void;
		parentRepaint(type?:number):void;
		readonly stage:laya.display.Stage;
		hitArea:any;
		mask:Sprite;
		mouseEnabled:boolean;
		startDrag(area?:laya.maths.Rectangle,hasInertia?:boolean,elasticDistance?:number,elasticBackTime?:number,data?:any,disableMouseEvent?:boolean,ratio?:number):void;
		stopDrag():void;
		hitTestPoint(x:number,y:number):boolean;
		getMousePoint():laya.maths.Point;
		readonly globalScaleX:number;
		readonly globalRotation:number;
		readonly globalScaleY:number;
		readonly mouseX:number;
		readonly mouseY:number;
		zOrder:number;
		texture:laya.resource.Texture;
		viewport:laya.maths.Rectangle;
		captureMouseEvent(exclusive:boolean):void;
		releaseMouseEvent():void;
		drawCallOptimize:boolean;
	}

}

declare module laya.d3.resource.models {
	class SkyRenderer  {
		private static _tempMatrix0:any;
		private static _tempMatrix1:any;
		material:laya.d3.core.material.BaseMaterial;
		mesh:laya.d3.resource.models.SkyMesh;

		constructor();
	}

}

declare module laya.d3.math {
	class MathUtils3D  {
		static zeroTolerance:number;
		static MaxValue:number;
		static MinValue:number;

		constructor();
		static isZero(v:number):boolean;
		static nearEqual(n1:number,n2:number):boolean;
		static fastInvSqrt(value:number):number;
	}

}

declare module laya.physics.joint {
	class MouseJoint extends laya.physics.joint.JointBase  {
		private static _temp:any;
		selfBody:laya.physics.RigidBody;
		anchor:any[];
		private _maxForce:any;
		private _frequency:any;
		private _damping:any;
		protected _onEnable():void;
		protected _onAwake():void;
		private onMouseDown:any;
		protected _createJoint():void;
		private onStageMouseUp:any;
		private onMouseMove:any;
		protected _onDisable():void;
		maxForce:number;
		frequency:number;
		damping:number;
	}

}

declare module laya.webgl.canvas.save {
	class SaveMark implements laya.webgl.canvas.save.ISaveData  {
		private static POOL:any;

		constructor();
		isSaveMark():boolean;
		restore(context:laya.resource.Context):void;
		static Create(context:laya.resource.Context):SaveMark;
	}

}

declare module laya.display.cmd {
	class DrawLinesCmd  {
		static ID:string;
		x:number;
		y:number;
		points:any[];
		lineColor:any;
		lineWidth:number;
		vid:number;
		static create(x:number,y:number,points:any[],lineColor:any,lineWidth:number,vid:number):DrawLinesCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.webgl.submit {
	class SubmitCMD implements laya.webgl.submit.ISubmit  {
		static POOL:any;
		fun:Function;
		args:any[];

		constructor();
		renderSubmit():number;
		getRenderType():number;
		releaseRender():void;
		static create(args:any[],fun:Function,thisobj:any):SubmitCMD;
	}

}

declare module laya.d3.graphics {
	class VertexElement  {
		readonly offset:number;
		readonly elementFormat:string;
		readonly elementUsage:number;

		constructor(offset:number,elementFormat:string,elementUsage:number);
	}

}

declare module laya.ui {
	class DialogManager extends laya.display.Sprite  {
		maskLayer:laya.display.Sprite;
		lockLayer:laya.display.Sprite;
		popupEffect:Function;
		closeEffect:Function;
		popupEffectHandler:laya.utils.Handler;
		closeEffectHandler:laya.utils.Handler;

		constructor();
		private _closeOnSide:any;
		setLockView(value:laya.ui.UIComponent):void;
		private _onResize:any;
		private _centerDialog:any;
		open(dialog:laya.ui.Dialog,closeOther?:boolean,showEffect?:boolean):void;
		private _clearDialogEffect:any;
		doOpen(dialog:laya.ui.Dialog):void;
		lock(value:boolean):void;
		close(dialog:laya.ui.Dialog):void;
		doClose(dialog:laya.ui.Dialog):void;
		closeAll():void;
		private _closeAll:any;
		getDialogsByGroup(group:string):any[];
		closeByGroup(group:string):any[];
	}

}

declare module laya.d3.core {
	interface IClone{
		clone():any;
		cloneTo(destObject:any):void;
	}

}

declare module laya.webgl.text {
	class CharRender_Native extends laya.webgl.text.ICharRender  {
		private lastFont:any;

		constructor();
		getWidth(font:string,str:string):number;
		scale(sx:number,sy:number):void;
		getCharBmp(char:string,font:string,lineWidth:number,colStr:string,strokeColStr:string,size:laya.webgl.text.CharRenderInfo,margin_left:number,margin_top:number,margin_right:number,margin_bottom:number,rect?:any[]):ImageData;
	}

}

declare module laya.webgl.utils {
	class InlcudeFile  {
		script:string;
		codes:any;
		funs:any;
		curUseID:number;
		funnames:string;

		constructor(txt:string);
		getWith(name?:string):string;
		getFunsScript(funsdef:string):string;
	}

}

declare module laya.d3.graphics.Vertex {
	class VertexPositionTexture0 implements laya.d3.graphics.IVertex  {
		private static _vertexDeclaration:any;
		static readonly vertexDeclaration:laya.d3.graphics.VertexDeclaration;
		private _position:any;
		private _textureCoordinate0:any;
		readonly position:laya.d3.math.Vector3;
		readonly textureCoordinate0:laya.d3.math.Vector2;
		readonly vertexDeclaration:laya.d3.graphics.VertexDeclaration;

		constructor(position:laya.d3.math.Vector3,textureCoordinate0:laya.d3.math.Vector2);
	}

}

declare module laya.utils {
	class GraphicAnimation extends laya.display.FrameAnimation  {
		animationList:any[];
		animationDic:any;
		protected _nodeList:any[];
		protected _nodeDefaultProps:any;
		protected _gList:any[];
		protected _nodeIDAniDic:any;
		protected static _drawTextureCmd:any[];
		protected static _temParam:any[];
		private static _I:any;
		private static _rootMatrix:any;
		private _rootNode:any;
		protected _nodeGDic:any;
		private _parseNodeList:any;
		private _calGraphicData:any;
		private _createGraphicData:any;
		protected _createFrameGraphic(frame:number):any;
		protected _updateNodeGraphic(node:any,frame:number,parentTransfrom:laya.maths.Matrix,g:laya.display.Graphics,alpha?:number):void;
		protected _updateNoChilds(tNodeG:GraphicNode,g:laya.display.Graphics):void;
		protected _updateNodeGraphic2(node:any,frame:number,g:laya.display.Graphics):void;
		protected _calculateKeyFrames(node:any):void;
		protected getNodeDataByID(nodeID:number):any;
		protected _getParams(obj:any,params:any[],frame:number,obj2:any):any[];
		private _getObjVar:any;
		protected _getNodeGraphicData(nodeID:number,frame:number,rst:GraphicNode):GraphicNode;
		private static _tempMt:any;
		protected _getTextureByUrl(url:string):any;
		setAniData(uiView:any,aniName?:string):void;
		parseByData(aniData:any):any;
		setUpAniData(uiView:any):void;
		protected _clear():void;
		static parseAnimationByData(animationObject:any):any;
		static parseAnimationData(aniData:any):any;
	}
	class GraphicNode  {
		skin:string;
		transform:laya.maths.Matrix;
		resultTransform:laya.maths.Matrix;
		width:number;
		height:number;
		alpha:number;
	}

}

declare module laya.webgl.shader.d2.skinAnishader {
	class SkinMeshBuffer  {
		ib:laya.webgl.utils.IndexBuffer2D;
		vb:laya.webgl.utils.VertexBuffer2D;
		static instance:SkinMeshBuffer;

		constructor();
		static getInstance():SkinMeshBuffer;
		addSkinMesh(skinMesh:any):void;
		reset():void;
	}

}

declare module laya.webgl.shader.d2.value {
	class PrimitiveSV extends laya.webgl.shader.d2.value.Value2D  {

		constructor(args:any);
	}

}

declare module laya.net {
	class WorkerLoader extends laya.events.EventDispatcher  {
		static I:WorkerLoader;
		static workerPath:string;
		private static _preLoadFun:any;
		private static _enable:any;
		private static _tryEnabled:any;
		worker:Worker;
		protected _useWorkerLoader:boolean;

		constructor();
		static workerSupported():boolean;
		static enableWorkerLoader():void;
		static enable:boolean;
		private workerMessage:any;
		private imageLoaded:any;
		loadImage(url:string):void;
		protected _loadImage(url:string):void;
	}

}

declare module laya.resource {
	class Resource extends laya.events.EventDispatcher implements laya.resource.ICreateResource,laya.resource.IDestroy  {
		private static _uniqueIDCounter:any;
		private static _idResourcesMap:any;
		private static _urlResourcesMap:any;
		private static _cpuMemory:any;
		private static _gpuMemory:any;
		static readonly cpuMemory:number;
		static readonly gpuMemory:number;
		static getResourceByID(id:number):Resource;
		static getResourceByURL(url:string,index?:number):Resource;
		static destroyUnusedResources():void;
		protected _id:number;
		private _url:any;
		private _cpuMemory:any;
		private _gpuMemory:any;
		private _destroyed:any;
		protected _referenceCount:number;
		lock:boolean;
		name:string;
		readonly id:number;
		readonly url:string;
		readonly cpuMemory:number;
		readonly gpuMemory:number;
		readonly destroyed:boolean;
		readonly referenceCount:number;

		constructor();
		_setCreateURL(url:string):void;
		protected _recoverResource():void;
		protected _disposeResource():void;
		protected _activeResource():void;
		destroy():void;
	}

}

declare module laya.d3.physics {
	class PhysicsCollider extends laya.d3.physics.PhysicsTriggerComponent  {

		constructor(collisionGroup?:number,canCollideWith?:number);
		_addToSimulation():void;
		_removeFromSimulation():void;
		_onTransformChanged(flag:number):void;
		_parse(data:any):void;
		_onAdded():void;
	}

}

declare module laya.d3.resource.models {
	class SubMesh extends laya.d3.core.GeometryElement  {
		readonly indexCount:number;

		constructor(mesh:laya.d3.resource.models.Mesh);
		getIndices():Uint16Array;
		setIndices(indices:Uint16Array):void;
		destroy():void;
	}

}

declare module laya.d3.math {
	class Matrix3x3 implements laya.d3.core.IClone  {
		static DEFAULT:Matrix3x3;
		static createFromTranslation(trans:laya.d3.math.Vector2,out:Matrix3x3):void;
		static createFromRotation(rad:number,out:Matrix3x3):void;
		static createFromScaling(scale:laya.d3.math.Vector2,out:Matrix3x3):void;
		static createFromMatrix4x4(sou:laya.d3.math.Matrix4x4,out:Matrix3x3):void;
		static multiply(left:Matrix3x3,right:Matrix3x3,out:Matrix3x3):void;
		elements:Float32Array;

		constructor();
		determinant():number;
		translate(trans:laya.d3.math.Vector2,out:Matrix3x3):void;
		rotate(rad:number,out:Matrix3x3):void;
		scale(scale:laya.d3.math.Vector2,out:Matrix3x3):void;
		invert(out:Matrix3x3):void;
		transpose(out:Matrix3x3):void;
		identity():void;
		cloneTo(destObject:any):void;
		clone():any;
		static lookAt(eye:laya.d3.math.Vector3,target:laya.d3.math.Vector3,up:laya.d3.math.Vector3,out:Matrix3x3):void;
	}

}

declare module laya.physics.joint {
	class PrismaticJoint extends laya.physics.joint.JointBase  {
		private static _temp:any;
		selfBody:laya.physics.RigidBody;
		otherBody:laya.physics.RigidBody;
		anchor:any[];
		axis:any[];
		collideConnected:boolean;
		private _enableMotor:any;
		private _motorSpeed:any;
		private _maxMotorForce:any;
		private _enableLimit:any;
		private _lowerTranslation:any;
		private _upperTranslation:any;
		protected _createJoint():void;
		enableMotor:boolean;
		motorSpeed:number;
		maxMotorForce:number;
		enableLimit:boolean;
		lowerTranslation:number;
		upperTranslation:number;
	}

}

declare module laya.webgl.canvas.save {
	class SaveTransform implements laya.webgl.canvas.save.ISaveData  {
		private static POOL:any;

		constructor();
		isSaveMark():boolean;
		restore(context:laya.resource.Context):void;
		static save(context:laya.resource.Context):void;
	}

}

declare module laya.display {
	class SpriteConst  {
		static ALPHA:number;
		static TRANSFORM:number;
		static BLEND:number;
		static CANVAS:number;
		static FILTERS:number;
		static MASK:number;
		static CLIP:number;
		static STYLE:number;
		static TEXTURE:number;
		static GRAPHICS:number;
		static LAYAGL3D:number;
		static CUSTOM:number;
		static ONECHILD:number;
		static CHILDS:number;
		static REPAINT_NONE:number;
		static REPAINT_NODE:number;
		static REPAINT_CACHE:number;
		static REPAINT_ALL:number;
	}

}

declare module laya.d3.shader {
	class SubShader  {

		constructor(attributeMap:any,uniformMap:any,spriteDefines?:laya.d3.shader.ShaderDefines,materialDefines?:laya.d3.shader.ShaderDefines);
		getMaterialDefineByName(name:string):number;
		setFlag(key:string,value:string):void;
		getFlag(key:string):string;
		addShaderPass(vs:string,ps:string,stateMap?:any):laya.d3.shader.ShaderPass;
	}

}

declare module laya.display.cmd {
	class DrawParticleCmd  {
		static ID:string;
		private _templ:any;
		static create(_temp:any):DrawParticleCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.d3.graphics {
	class VertexElementFormat  {
		static Single:string;
		static Vector2:string;
		static Vector3:string;
		static Vector4:string;
		static Color:string;
		static Byte4:string;
		static Short2:string;
		static Short4:string;
		static NormalizedShort2:string;
		static NormalizedShort4:string;
		static HalfVector2:string;
		static HalfVector4:string;
		static __init__():void;
		static getElementInfos(element:string):any[];
	}

}

declare module laya.webgl.submit {
	class SubmitKey  {
		blendShader:number;
		submitType:number;
		other:number;

		constructor();
		clear():void;
		copyFrom(src:SubmitKey):void;
		copyFrom2(src:SubmitKey,submitType:number,other:number):void;
		equal3_2(next:SubmitKey,submitType:number,other:number):boolean;
		equal4_2(next:SubmitKey,submitType:number,other:number):boolean;
		equal_3(next:SubmitKey):boolean;
		equal(next:SubmitKey):boolean;
	}

}

declare module laya.ui {
	class FontClip extends laya.ui.Clip  {
		protected _valueArr:string;
		protected _indexMap:any;
		protected _sheet:string;
		protected _direction:string;
		protected _spaceX:number;
		protected _spaceY:number;
		private _align:any;
		private _wordsW:any;
		private _wordsH:any;

		constructor(skin?:string,sheet?:string);
		protected createChildren():void;
		private _onClipLoaded:any;
		sheet:string;
		value:string;
		direction:string;
		spaceX:number;
		spaceY:number;
		align:string;
		protected changeValue():void;
		width:number;
		height:number;
		protected measureWidth():number;
		protected measureHeight():number;
		destroy(destroyChild?:boolean):void;
	}

}

declare module laya.d3.core {
	class Keyframe implements laya.d3.core.IClone  {
		time:number;

		constructor();
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.webgl.text {
	class CharSubmitCache  {
		private static __posPool:any;
		private static __nPosPool:any;
		private _data:any;
		private _ndata:any;
		private _tex:any;
		private _imgId:any;
		private _clipid:any;
		private _clipMatrix:any;

		constructor();
		clear():void;
		destroy():void;
		add(ctx:laya.resource.Context,tex:laya.resource.Texture,imgid:number,pos:any[],uv:ArrayLike<number>,color:number):void;
		getPos():any[];
		enable(value:boolean,ctx:laya.resource.Context):void;
		submit(ctx:laya.resource.Context):void;
	}

}

declare module laya.d3.graphics.Vertex {
	class VertexShuriKenParticle  {
		static PARTICLE_CORNERTEXTURECOORDINATE0:number;
		static PARTICLE_POSITION0:number;
		static PARTICLE_COLOR0:number;
		static PARTICLE_TEXTURECOORDINATE0:number;
		static PARTICLE_SHAPEPOSITIONSTARTLIFETIME:number;
		static PARTICLE_DIRECTIONTIME:number;
		static PARTICLE_STARTCOLOR0:number;
		static PARTICLE_ENDCOLOR0:number;
		static PARTICLE_STARTSIZE:number;
		static PARTICLE_STARTROTATION:number;
		static PARTICLE_STARTSPEED:number;
		static PARTICLE_RANDOM0:number;
		static PARTICLE_RANDOM1:number;
		static PARTICLE_SIMULATIONWORLDPOSTION:number;
		static PARTICLE_SIMULATIONWORLDROTATION:number;

		constructor();
	}

}

declare module laya.utils {
	class Handler  {
		protected static _pool:any[];
		private static _gid:any;
		caller:any;
		method:Function;
		args:any[];
		once:boolean;
		protected _id:number;

		constructor(caller?:any,method?:Function,args?:any[],once?:boolean);
		setTo(caller:any,method:Function,args:any[],once:boolean):Handler;
		run():any;
		runWith(data:any):any;
		clear():Handler;
		recover():void;
		static create(caller:any,method:Function,args?:any[],once?:boolean):Handler;
	}

}

declare module laya.webgl.utils {
	class MatirxArray  {
		static ArrayMul(a:any[],b:any[],o:any[]):void;
		static copyArray(f:any[],t:any[]):void;
	}

}

declare module laya.webgl.shader.d2.value {
	class TextureSV extends laya.webgl.shader.d2.value.Value2D  {
		u_colorMatrix:any[];
		strength:number;
		blurInfo:any[];
		colorMat:Float32Array;
		colorAlpha:Float32Array;

		constructor(subID?:number);
		clear():void;
	}

}

declare module laya.webgl.shader.d2.skinAnishader {
	class SkinSV extends laya.webgl.shader.d2.value.Value2D  {
		texcoord:any;
		position:any;
		offsetX:number;
		offsetY:number;

		constructor(type:any);
	}

}

declare module laya.resource {
	class Texture extends laya.events.EventDispatcher  {
		static DEF_UV:Float32Array;
		static NO_UV:Float32Array;
		static INV_UV:Float32Array;
		private static _rect1:any;
		private static _rect2:any;
		uvrect:any[];
		private _destroyed:any;
		private _bitmap:any;
		_uv:ArrayLike<number>;
		private _referenceCount:any;
		$_GID:number;
		offsetX:number;
		offsetY:number;
		private _w:any;
		private _h:any;
		sourceWidth:number;
		sourceHeight:number;
		url:string;
		scaleRate:number;
		static moveUV(offsetX:number,offsetY:number,uv:any[]):any[];
		static create(source:laya.resource.Texture2D|Texture,x:number,y:number,width:number,height:number,offsetX?:number,offsetY?:number,sourceWidth?:number,sourceHeight?:number):Texture;
		static createFromTexture(texture:Texture,x:number,y:number,width:number,height:number):Texture;
		uv:ArrayLike<number>;
		width:number;
		height:number;
		bitmap:laya.resource.Texture2D|Texture;
		readonly destroyed:boolean;

		constructor(bitmap?:laya.resource.Texture2D|Texture,uv?:ArrayLike<number>,sourceWidth?:number,sourceHeight?:number);
		private _onLoaded:any;
		getIsReady():boolean;
		setTo(bitmap?:laya.resource.Texture2D|Texture,uv?:ArrayLike<number>,sourceWidth?:number,sourceHeight?:number):void;
		load(url:string,complete?:laya.utils.Handler):void;
		getTexturePixels(x:number,y:number,width:number,height:number):Uint8Array;
		getPixels(x:number,y:number,width:number,height:number):Uint8Array;
		recoverBitmap(onok?:Function):void;
		disposeBitmap():void;
		destroy(force?:boolean):void;
	}

}

declare module laya.d3.math {
	class Matrix4x4 implements laya.d3.core.IClone  {
		static DEFAULT:Matrix4x4;
		static ZERO:Matrix4x4;
		static createRotationX(rad:number,out:Matrix4x4):void;
		static createRotationY(rad:number,out:Matrix4x4):void;
		static createRotationZ(rad:number,out:Matrix4x4):void;
		static createRotationYawPitchRoll(yaw:number,pitch:number,roll:number,result:Matrix4x4):void;
		static createRotationAxis(axis:laya.d3.math.Vector3,angle:number,result:Matrix4x4):void;
		setRotation(rotation:laya.d3.math.Quaternion):void;
		setPosition(position:laya.d3.math.Vector3):void;
		static createRotationQuaternion(rotation:laya.d3.math.Quaternion,result:Matrix4x4):void;
		static createTranslate(trans:laya.d3.math.Vector3,out:Matrix4x4):void;
		static createScaling(scale:laya.d3.math.Vector3,out:Matrix4x4):void;
		static multiply(left:Matrix4x4,right:Matrix4x4,out:Matrix4x4):void;
		static multiplyForNative(left:Matrix4x4,right:Matrix4x4,out:Matrix4x4):void;
		static createFromQuaternion(rotation:laya.d3.math.Quaternion,out:Matrix4x4):void;
		static createAffineTransformation(trans:laya.d3.math.Vector3,rot:laya.d3.math.Quaternion,scale:laya.d3.math.Vector3,out:Matrix4x4):void;
		static createLookAt(eye:laya.d3.math.Vector3,target:laya.d3.math.Vector3,up:laya.d3.math.Vector3,out:Matrix4x4):void;
		static createPerspective(fov:number,aspect:number,znear:number,zfar:number,out:Matrix4x4):void;
		static createPerspectiveOffCenter(left:number,right:number,bottom:number,top:number,znear:number,zfar:number,out:Matrix4x4):void;
		static createOrthoOffCenter(left:number,right:number,bottom:number,top:number,znear:number,zfar:number,out:Matrix4x4):void;
		elements:Float32Array;

		constructor(m11?:number,m12?:number,m13?:number,m14?:number,m21?:number,m22?:number,m23?:number,m24?:number,m31?:number,m32?:number,m33?:number,m34?:number,m41?:number,m42?:number,m43?:number,m44?:number,elements?:Float32Array);
		getElementByRowColumn(row:number,column:number):number;
		setElementByRowColumn(row:number,column:number,value:number):void;
		equalsOtherMatrix(other:Matrix4x4):boolean;
		decomposeTransRotScale(translation:laya.d3.math.Vector3,rotation:laya.d3.math.Quaternion,scale:laya.d3.math.Vector3):boolean;
		decomposeTransRotMatScale(translation:laya.d3.math.Vector3,rotationMatrix:Matrix4x4,scale:laya.d3.math.Vector3):boolean;
		decomposeYawPitchRoll(yawPitchRoll:laya.d3.math.Vector3):void;
		normalize():void;
		transpose():Matrix4x4;
		invert(out:Matrix4x4):void;
		static billboard(objectPosition:laya.d3.math.Vector3,cameraPosition:laya.d3.math.Vector3,cameraRight:laya.d3.math.Vector3,cameraUp:laya.d3.math.Vector3,cameraForward:laya.d3.math.Vector3,mat:Matrix4x4):void;
		identity():void;
		cloneTo(destObject:any):void;
		clone():any;
		static translation(v3:laya.d3.math.Vector3,out:Matrix4x4):void;
		getTranslationVector(out:laya.d3.math.Vector3):void;
		setTranslationVector(translate:laya.d3.math.Vector3):void;
		getForward(out:laya.d3.math.Vector3):void;
		setForward(forward:laya.d3.math.Vector3):void;
	}

}

declare module laya.d3.physics {
	class PhysicsComponent extends laya.components.Component  {
		canScaleShape:boolean;
		restitution:number;
		friction:number;
		rollingFriction:number;
		ccdMotionThreshold:number;
		ccdSweptSphereRadius:number;
		readonly isActive:boolean;
		enabled:boolean;
		colliderShape:laya.d3.physics.shape.ColliderShape;
		readonly simulation:laya.d3.physics.PhysicsSimulation;
		collisionGroup:number;
		canCollideWith:number;

		constructor(collisionGroup:number,canCollideWith:number);
		_parse(data:any):void;
		protected _onEnable():void;
		protected _onDisable():void;
		_onAdded():void;
		protected _onDestroy():void;
		_cloneTo(dest:laya.components.Component):void;
	}

}

declare module laya.physics.joint {
	class PulleyJoint extends laya.physics.joint.JointBase  {
		private static _temp:any;
		selfBody:laya.physics.RigidBody;
		otherBody:laya.physics.RigidBody;
		selfAnchor:any[];
		otherAnchor:any[];
		selfGroundPoint:any[];
		otherGroundPoint:any[];
		ratio:number;
		collideConnected:boolean;
		protected _createJoint():void;
	}

}

declare module laya.webgl.canvas.save {
	class SaveTranslate implements laya.webgl.canvas.save.ISaveData  {
		private static POOL:any;
		isSaveMark():boolean;
		restore(context:laya.resource.Context):void;
		static save(context:laya.resource.Context):void;
	}

}

declare module laya.display {
	class Stage extends laya.display.Sprite  {
		static SCALE_NOSCALE:string;
		static SCALE_EXACTFIT:string;
		static SCALE_SHOWALL:string;
		static SCALE_NOBORDER:string;
		static SCALE_FULL:string;
		static SCALE_FIXED_WIDTH:string;
		static SCALE_FIXED_HEIGHT:string;
		static SCALE_FIXED_AUTO:string;
		static ALIGN_LEFT:string;
		static ALIGN_RIGHT:string;
		static ALIGN_CENTER:string;
		static ALIGN_TOP:string;
		static ALIGN_MIDDLE:string;
		static ALIGN_BOTTOM:string;
		static SCREEN_NONE:string;
		static SCREEN_HORIZONTAL:string;
		static SCREEN_VERTICAL:string;
		static FRAME_FAST:string;
		static FRAME_SLOW:string;
		static FRAME_MOUSE:string;
		static FRAME_SLEEP:string;
		focus:laya.display.Node;
		offset:laya.maths.Point;
		private _frameRate:any;
		designWidth:number;
		designHeight:number;
		canvasRotation:boolean;
		canvasDegree:number;
		renderingEnabled:boolean;
		screenAdaptationEnabled:boolean;
		_canvasTransform:laya.maths.Matrix;
		private _screenMode:any;
		private _scaleMode:any;
		private _alignV:any;
		private _alignH:any;
		private _bgColor:any;
		private _mouseMoveTime:any;
		private _renderCount:any;
		private _safariOffsetY:any;
		private _frameStartTime:any;
		private _previousOrientation:any;
		private _isFocused:any;
		private _isVisibility:any;
		private _globalRepaintSet:any;
		private _globalRepaintGet:any;
		static _dbgSprite:laya.display.Sprite;
		useRetinalCanvas:boolean;

		constructor();
		private _isInputting:any;
		width:number;
		height:number;
		transform:laya.maths.Matrix;
		readonly isFocused:boolean;
		readonly isVisibility:boolean;
		private _changeCanvasSize:any;
		protected _resetCanvas():void;
		setScreenSize(screenWidth:number,screenHeight:number):void;
		private _formatData:any;
		scaleMode:string;
		alignH:string;
		alignV:string;
		bgColor:string;
		readonly mouseX:number;
		readonly mouseY:number;
		getMousePoint():laya.maths.Point;
		readonly clientScaleX:number;
		readonly clientScaleY:number;
		screenMode:string;
		repaint(type?:number):void;
		parentRepaint(type?:number):void;
		getFrameTm():number;
		private _onmouseMove:any;
		getTimeFromFrameStart():number;
		visible:boolean;
		static clear:Function;
		render(context:laya.resource.Context,x:number,y:number):void;
		renderToNative(context:laya.resource.Context,x:number,y:number):void;
		private _updateTimers:any;
		fullScreenEnabled:boolean;
		frameRate:string;
		private _requestFullscreen:any;
		private _fullScreenChanged:any;
		exitFullscreen():void;
		isGlobalRepaint():boolean;
		setGlobalRepaint():void;
		add3DUI(uibase:laya.display.Sprite):void;
		remove3DUI(uibase:laya.display.Sprite):boolean;
	}

}

declare module laya.display.cmd {
	class DrawPathCmd  {
		static ID:string;
		x:number;
		y:number;
		paths:any[];
		brush:any;
		pen:any;
		static create(x:number,y:number,paths:any[],brush:any,pen:any):DrawPathCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.webgl.submit {
	class SubmitTarget implements laya.webgl.submit.ISubmit  {
		shaderValue:laya.webgl.shader.d2.value.Value2D;
		blendType:number;
		srcRT:laya.resource.RenderTexture2D;

		constructor();
		static POOL:any;
		renderSubmit():number;
		blend():void;
		getRenderType():number;
		releaseRender():void;
		static create(context:laya.resource.Context,mesh:laya.webgl.utils.Mesh2D,sv:laya.webgl.shader.d2.value.Value2D,rt:laya.resource.RenderTexture2D):SubmitTarget;
	}

}

declare module laya.ui {
	class HBox extends laya.ui.LayoutBox  {
		static NONE:string;
		static TOP:string;
		static MIDDLE:string;
		static BOTTOM:string;
		protected sortItem(items:any[]):void;
		height:number;
		protected changeItems():void;
	}

}

declare module laya.webgl.text {
	class ICharRender  {
		getWidth(font:string,str:string):number;
		scale(sx:number,sy:number):void;
		canvasWidth:number;
		getCharBmp(char:string,font:string,lineWidth:number,colStr:string,strokeColStr:string,size:laya.webgl.text.CharRenderInfo,margin_left:number,margin_top:number,margin_right:number,margin_bottom:number,rect?:any[]):ImageData;
	}

}

declare module laya.d3.core {
	class MeshFilter  {
		private _owner:any;
		private _sharedMesh:any;
		sharedMesh:laya.d3.resource.models.Mesh;

		constructor(owner:laya.d3.core.RenderableSprite3D);
		private _getMeshDefine:any;
		destroy():void;
	}

}

declare module laya.d3.core.light {
	class DirectionLight extends laya.d3.core.light.LightSprite  {
		private _direction:any;
		shadow:boolean;

		constructor();
		private _initShadow:any;
		protected _onActive():void;
		protected _onInActive():void;
		_prepareToScene():boolean;
	}

}

declare module laya.d3.graphics.Vertex {
	class VertexShurikenParticleBillboard extends laya.d3.graphics.Vertex.VertexShuriKenParticle  {
		static readonly vertexDeclaration:laya.d3.graphics.VertexDeclaration;
		readonly cornerTextureCoordinate:laya.d3.math.Vector4;
		readonly positionStartLifeTime:laya.d3.math.Vector4;
		readonly velocity:laya.d3.math.Vector3;
		readonly startColor:laya.d3.math.Vector4;
		readonly startSize:laya.d3.math.Vector3;
		readonly startRotation0:laya.d3.math.Vector3;
		readonly startRotation1:laya.d3.math.Vector3;
		readonly startRotation2:laya.d3.math.Vector3;
		readonly startLifeTime:number;
		readonly time:number;
		readonly startSpeed:number;
		readonly random0:laya.d3.math.Vector4;
		readonly random1:laya.d3.math.Vector4;
		readonly simulationWorldPostion:laya.d3.math.Vector3;

		constructor(cornerTextureCoordinate:laya.d3.math.Vector4,positionStartLifeTime:laya.d3.math.Vector4,velocity:laya.d3.math.Vector3,startColor:laya.d3.math.Vector4,startSize:laya.d3.math.Vector3,startRotation0:laya.d3.math.Vector3,startRotation1:laya.d3.math.Vector3,startRotation2:laya.d3.math.Vector3,ageAddScale:number,time:number,startSpeed:number,randoms0:laya.d3.math.Vector4,randoms1:laya.d3.math.Vector4,simulationWorldPostion:laya.d3.math.Vector3);
	}

}

declare module laya.utils {
	class HitArea  {
		private static _cmds:any;
		private static _rect:any;
		private static _ptPoint:any;
		private _hit:any;
		private _unHit:any;
		contains(x:number,y:number):boolean;
		static _isHitGraphic(x:number,y:number,graphic:laya.display.Graphics):boolean;
		hit:laya.display.Graphics;
		unHit:laya.display.Graphics;
	}

}

declare module laya.webgl.utils {
	class Mesh2D  {
		_stride:number;
		vertNum:number;
		indexNum:number;
		protected _applied:boolean;
		_vb:laya.webgl.utils.VertexBuffer2D;
		_ib:laya.webgl.utils.IndexBuffer2D;
		private _vao:any;
		private static _gvaoid:any;
		private _attribInfo:any;
		protected _quadNum:number;
		canReuse:boolean;

		constructor(stride:number,vballoc:number,iballoc:number);
		cloneWithNewVB():Mesh2D;
		cloneWithNewVBIB():Mesh2D;
		getVBW():laya.webgl.utils.VertexBuffer2D;
		getVBR():laya.webgl.utils.VertexBuffer2D;
		getIBR():laya.webgl.utils.IndexBuffer2D;
		getIBW():laya.webgl.utils.IndexBuffer2D;
		createQuadIB(QuadNum:number):void;
		setAttributes(attribs:any[]):void;
		private configVAO:any;
		useMesh(gl:WebGLRenderingContext):void;
		getEleNum():number;
		releaseMesh():void;
		destroy():void;
		clearVB():void;
	}

}

declare module laya.d3.core.material {
	class BaseMaterial extends laya.resource.Resource implements laya.d3.core.IClone  {
		static MATERIAL:string;
		static RENDERQUEUE_OPAQUE:number;
		static RENDERQUEUE_ALPHATEST:number;
		static RENDERQUEUE_TRANSPARENT:number;
		static ALPHATESTVALUE:number;
		static SHADERDEFINE_ALPHATEST:number;
		static shaderDefines:laya.d3.shader.ShaderDefines;
		static load(url:string,complete:laya.utils.Handler):void;
		static _parse(data:any,propertyParams?:any,constructParams?:any[]):BaseMaterial;
		private _alphaTest:any;
		_shaderValues:laya.d3.shader.ShaderData;
		renderQueue:number;
		alphaTestValue:number;
		alphaTest:boolean;

		constructor();
		private _removeTetxureReference:any;
		_addReference(count?:number):void;
		_removeReference(count?:number):void;
		protected _disposeResource():void;
		setShaderName(name:string):void;
		cloneTo(destObject:any):void;
		clone():any;
		readonly _defineDatas:laya.d3.shader.DefineDatas;
	}

}

declare module laya.webgl.shader.d2.value {
	class Value2D  {
		protected static _cache:any[];
		protected static _typeClass:any;
		static TEMPMAT4_ARRAY:any[];
		static _initone(type:number,classT:any):void;
		static __init__():void;
		defines:laya.webgl.shader.d2.ShaderDefines2D;
		size:any[];
		alpha:number;
		mmat:any[];
		u_MvpMatrix:any[];
		texture:any;
		ALPHA:number;
		shader:laya.webgl.shader.Shader;
		mainID:number;
		subID:number;
		filters:any[];
		textureHost:laya.resource.Texture;
		color:any[];
		colorAdd:any[];
		u_mmat2:any[];
		ref:number;
		protected _attribLocation:any[];
		private _inClassCache:any;
		private _cacheID:any;
		clipMatDir:any[];
		clipMatPos:any[];
		clipOff:any[];

		constructor(mainID:number,subID:number);
		setValue(value:laya.webgl.shader.d2.Shader2D):void;
		private _ShaderWithCompile:any;
		upload():void;
		setFilters(value:any[]):void;
		clear():void;
		release():void;
		static create(mainType:number,subType:number):Value2D;
	}

}

declare module laya.ani.bone {
	class Skeleton extends laya.display.Sprite  {
		static useSimpleMeshInCanvas:boolean;
		protected _templet:laya.ani.bone.Templet;
		protected _player:laya.ani.AnimationPlayer;
		protected _curOriginalData:Float32Array;
		private _boneMatrixArray:any;
		private _lastTime:any;
		private _currAniIndex:any;
		private _pause:any;
		protected _aniClipIndex:number;
		protected _clipIndex:number;
		private _skinIndex:any;
		private _skinName:any;
		private _aniMode:any;
		private _graphicsCache:any;
		private _boneSlotDic:any;
		private _bindBoneBoneSlotDic:any;
		private _boneSlotArray:any;
		private _index:any;
		private _total:any;
		private _indexControl:any;
		private _aniPath:any;
		private _complete:any;
		private _loadAniMode:any;
		private _yReverseMatrix:any;
		private _ikArr:any;
		private _tfArr:any;
		private _pathDic:any;
		private _rootBone:any;
		protected _boneList:laya.ani.bone.Bone[];
		protected _aniSectionDic:any;
		private _eventIndex:any;
		private _drawOrderIndex:any;
		private _drawOrder:any;
		private _lastAniClipIndex:any;
		private _lastUpdateAniClipIndex:any;
		private _playAudio:any;
		private _soundChannelArr:any;

		constructor(templet?:laya.ani.bone.Templet,aniMode?:number);
		init(templet:laya.ani.bone.Templet,aniMode?:number):void;
		url:string;
		load(path:string,complete?:laya.utils.Handler,aniMode?:number):void;
		private _onLoaded:any;
		private _parseComplete:any;
		private _parseFail:any;
		private _onPlay:any;
		private _onStop:any;
		private _onPause:any;
		private _parseSrcBoneMatrix:any;
		private _emitMissedEvents:any;
		private _update:any;
		private _onAniSoundStoped:any;
		protected _createGraphics(_clipIndex?:number):laya.ani.GraphicsAni;
		private _checkIsAllParsed:any;
		private _setDeform:any;
		getAnimNum():number;
		getAniNameByIndex(index:number):string;
		getSlotByName(name:string):laya.ani.bone.BoneSlot;
		showSkinByName(name:string,freshSlotIndex?:boolean):void;
		showSkinByIndex(skinIndex:number,freshSlotIndex?:boolean):void;
		showSlotSkinByIndex(slotName:string,index:number):void;
		showSlotSkinByName(slotName:string,name:string):void;
		replaceSlotSkinName(slotName:string,oldName:string,newName:string):void;
		replaceSlotSkinByIndex(slotName:string,oldIndex:number,newIndex:number):void;
		setSlotSkin(slotName:string,texture:laya.resource.Texture):void;
		private _clearCache:any;
		play(nameOrIndex:any,loop:boolean,force?:boolean,start?:number,end?:number,freshSkin?:boolean,playAudio?:boolean):void;
		stop():void;
		playbackRate(value:number):void;
		paused():void;
		resume():void;
		private _getGrahicsDataWithCache:any;
		private _setGrahicsDataWithCache:any;
		destroy(destroyChild?:boolean):void;
		index:number;
		readonly total:number;
		readonly player:laya.ani.AnimationPlayer;
		readonly templet:laya.ani.bone.Templet;
	}

}

declare module laya.resource {
	class Texture2D extends laya.resource.BaseTexture  {
		static TEXTURE2D:string;
		static grayTexture:Texture2D;
		static whiteTexture:Texture2D;
		static blackTexture:Texture2D;
		static load(url:string,complete:laya.utils.Handler):void;
		private _canRead:any;
		private _pixels:any;
		readonly defaulteTexture:laya.resource.BaseTexture;

		constructor(width?:number,height?:number,format?:number,mipmap?:boolean,canRead?:boolean);
		private _setPixels:any;
		private _calcualatesCompressedDataSize:any;
		private _pharseDDS:any;
		private _pharseKTX:any;
		private _pharsePVR:any;
		loadImageSource(source:any,premultiplyAlpha?:boolean):void;
		setPixels(pixels:Uint8Array,miplevel?:number):void;
		setSubPixels(x:number,y:number,width:number,height:number,pixels:Uint8Array,miplevel?:number):void;
		setCompressData(data:ArrayBuffer):void;
		protected _recoverResource():void;
		getPixels():Uint8Array;
	}

}

declare module laya.d3.physics {
	class PhysicsSettings  {
		flags:number;
		maxSubSteps:number;
		fixedTimeStep:number;

		constructor();
	}

}

declare module laya.physics.joint {
	class RevoluteJoint extends laya.physics.joint.JointBase  {
		private static _temp:any;
		selfBody:laya.physics.RigidBody;
		otherBody:laya.physics.RigidBody;
		anchor:any[];
		collideConnected:boolean;
		private _enableMotor:any;
		private _motorSpeed:any;
		private _maxMotorTorque:any;
		private _enableLimit:any;
		private _lowerAngle:any;
		private _upperAngle:any;
		protected _createJoint():void;
		enableMotor:boolean;
		motorSpeed:number;
		maxMotorTorque:number;
		enableLimit:boolean;
		lowerAngle:number;
		upperAngle:number;
	}

}

declare module laya.display {
	class Text extends laya.display.Sprite  {
		static VISIBLE:string;
		static SCROLL:string;
		static HIDDEN:string;
		static defaultFontSize:number;
		static defaultFont:string;
		static defaultFontStr():string;
		static langPacks:any;
		static isComplexText:boolean;
		static fontFamilyMap:any;
		static _testWord:string;
		private static _bitmapFonts:any;
		static CharacterCache:boolean;
		static RightToLeft:boolean;
		private _clipPoint:any;
		protected _text:string;
		protected _isChanged:boolean;
		protected _textWidth:number;
		protected _textHeight:number;
		protected _lines:any[];
		protected _lineWidths:any[];
		protected _startX:number;
		protected _startY:number;
		protected _words:laya.utils.WordText[];
		protected _charSize:any;
		protected _valign:string;
		private _singleCharRender:any;
		overflow:string;

		constructor();
		getStyle():laya.display.css.SpriteStyle;
		protected _getTextStyle():laya.display.css.TextStyle;
		static registerBitmapFont(name:string,bitmapFont:laya.display.BitmapFont):void;
		static unregisterBitmapFont(name:string,destroy?:boolean):void;
		destroy(destroyChild?:boolean):void;
		getGraphicBounds(realSize?:boolean):laya.maths.Rectangle;
		width:number;
		height:number;
		readonly textWidth:number;
		readonly textHeight:number;
		text:string;
		get_text():string;
		set_text(value:string):void;
		lang(text:string,arg1?:any,arg2?:any,arg3?:any,arg4?:any,arg5?:any,arg6?:any,arg7?:any,arg8?:any,arg9?:any,arg10?:any):void;
		font:string;
		fontSize:number;
		bold:boolean;
		color:string;
		get_color():string;
		set_color(value:string):void;
		italic:boolean;
		align:string;
		valign:string;
		wordWrap:boolean;
		leading:number;
		padding:any[];
		bgColor:string;
		set_bgColor(value:string):void;
		get_bgColor():string;
		borderColor:string;
		stroke:number;
		strokeColor:string;
		protected isChanged:boolean;
		protected _getContextFont():string;
		protected _isPassWordMode():boolean;
		protected _getPassWordTxt(txt:string):string;
		protected _renderText():void;
		private _drawUnderline:any;
		typeset():void;
		private _evalTextSize:any;
		private _checkEnabledViewportOrNot:any;
		changeText(text:string):void;
		protected _parseLines(text:string):void;
		protected _parseLine(line:string,wordWrapWidth:number):void;
		private _getTextWidth:any;
		private _getWordWrapWidth:any;
		getCharPoint(charIndex:number,out?:laya.maths.Point):laya.maths.Point;
		scrollX:number;
		scrollY:number;
		readonly maxScrollX:number;
		readonly maxScrollY:number;
		readonly lines:any[];
		underlineColor:string;
		underline:boolean;
		singleCharRender:boolean;
	}

}

declare module laya.d3.math {
	class Plane  {
		normal:laya.d3.math.Vector3;
		distance:number;
		static PlaneIntersectionType_Back:number;
		static PlaneIntersectionType_Front:number;
		static PlaneIntersectionType_Intersecting:number;

		constructor(normal:laya.d3.math.Vector3,d?:number);
		static createPlaneBy3P(point1:laya.d3.math.Vector3,point2:laya.d3.math.Vector3,point3:laya.d3.math.Vector3):Plane;
		normalize():void;
	}

}

declare module laya.d3.math.Native {
	class ConchQuaternion implements laya.d3.core.IClone  {
		static DEFAULT:ConchQuaternion;
		static NAN:ConchQuaternion;
		static createFromYawPitchRoll(yaw:number,pitch:number,roll:number,out:ConchQuaternion):void;
		static multiply(left:ConchQuaternion,right:ConchQuaternion,out:ConchQuaternion):void;
		private static arcTanAngle:any;
		private static angleTo:any;
		static createFromAxisAngle(axis:laya.d3.math.Native.ConchVector3,rad:number,out:ConchQuaternion):void;
		static createFromMatrix3x3(sou:laya.d3.math.Matrix3x3,out:ConchQuaternion):void;
		static createFromMatrix4x4(mat:laya.d3.math.Matrix4x4,out:ConchQuaternion):void;
		static slerp(left:ConchQuaternion,right:ConchQuaternion,t:number,out:ConchQuaternion):Float32Array;
		static lerp(left:ConchQuaternion,right:ConchQuaternion,amount:number,out:ConchQuaternion):void;
		static add(left:any,right:ConchQuaternion,out:ConchQuaternion):void;
		static dot(left:any,right:ConchQuaternion):number;
		elements:Float32Array;
		x:number;
		y:number;
		z:number;
		w:number;

		constructor(x?:number,y?:number,z?:number,w?:number,nativeElements?:Float32Array);
		scaling(scaling:number,out:ConchQuaternion):void;
		normalize(out:ConchQuaternion):void;
		length():number;
		rotateX(rad:number,out:ConchQuaternion):void;
		rotateY(rad:number,out:ConchQuaternion):void;
		rotateZ(rad:number,out:ConchQuaternion):void;
		getYawPitchRoll(out:laya.d3.math.Native.ConchVector3):void;
		invert(out:ConchQuaternion):void;
		identity():void;
		fromArray(array:any[],offset?:number):void;
		cloneTo(destObject:any):void;
		clone():any;
		equals(b:ConchQuaternion):boolean;
		static rotationLookAt(forward:laya.d3.math.Native.ConchVector3,up:laya.d3.math.Native.ConchVector3,out:ConchQuaternion):void;
		static lookAt(eye:any,target:any,up:any,out:ConchQuaternion):void;
		lengthSquared():number;
		static invert(value:ConchQuaternion,out:ConchQuaternion):void;
		static rotationMatrix(matrix3x3:laya.d3.math.Matrix3x3,out:ConchQuaternion):void;
	}

}

declare module laya.webgl.submit {
	class SubmitTexture extends laya.webgl.submit.SubmitBase  {
		private static _poolSize:any;
		private static POOL:any;

		constructor(renderType?:number);
		releaseRender():void;
		renderSubmit():number;
		static create(context:laya.resource.Context,mesh:laya.webgl.utils.Mesh2D,sv:laya.webgl.shader.d2.value.Value2D):SubmitTexture;
	}

}

declare module laya.display.cmd {
	class DrawPieCmd  {
		static ID:string;
		x:number;
		y:number;
		radius:number;
		private _startAngle:any;
		private _endAngle:any;
		fillColor:any;
		lineColor:any;
		lineWidth:number;
		vid:number;
		static create(x:number,y:number,radius:number,startAngle:number,endAngle:number,fillColor:any,lineColor:any,lineWidth:number,vid:number):DrawPieCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
		startAngle:number;
		endAngle:number;
	}

}

declare module laya.ui {
	class HScrollBar extends laya.ui.ScrollBar  {
		protected initialize():void;
	}

}

declare module laya.webgl.text {
	class TextAtlas  {
		texWidth:number;
		texHeight:number;
		private atlasgrid:any;
		private protectDist:any;
		texture:laya.webgl.text.TextTexture;
		charMaps:any;
		static atlasGridW:number;

		constructor();
		setProtecteDist(d:number):void;
		getAEmpty(w:number,h:number,pt:laya.maths.Point):boolean;
		readonly usedRate:number;
		destroy():void;
		printDebugInfo():void;
	}

}

declare module laya.d3.core.light {
	class LightSprite extends laya.d3.core.Sprite3D  {
		static LIGHTMAPBAKEDTYPE_REALTIME:number;
		static LIGHTMAPBAKEDTYPE_MIXED:number;
		static LIGHTMAPBAKEDTYPE_BAKED:number;
		color:laya.d3.math.Vector3;
		intensity:number;
		shadow:boolean;
		shadowDistance:number;
		shadowResolution:number;
		shadowPSSMCount:number;
		shadowPCFType:number;
		lightmapBakedType:number;

		constructor();
		_parse(data:any,spriteMap:any):void;
		protected _onActive():void;
		protected _onInActive():void;
		_prepareToScene():boolean;
		diffuseColor:laya.d3.math.Vector3;
	}

}

declare module laya.d3.core {
	class MeshRenderer extends laya.d3.core.render.BaseRender  {

		constructor(owner:laya.d3.core.RenderableSprite3D);
		protected _calculateBoundingBox():void;
		_needRender(boundFrustum:laya.d3.math.BoundFrustum):boolean;
		_renderUpdate(context:laya.d3.core.render.RenderContext3D,transform:laya.d3.core.Transform3D):void;
		_renderUpdateWithCamera(context:laya.d3.core.render.RenderContext3D,transform:laya.d3.core.Transform3D):void;
		_renderUpdateWithCameraForNative(context:laya.d3.core.render.RenderContext3D,transform:laya.d3.core.Transform3D):void;
		_destroy():void;
	}

}

declare module laya.utils {
	class HTMLChar  {
		private static _isWordRegExp:any;
		x:number;
		y:number;
		width:number;
		height:number;
		isWord:boolean;
		char:string;
		charNum:number;
		style:any;

		constructor();
		setData(char:string,w:number,h:number,style:any):HTMLChar;
		reset():HTMLChar;
		recover():void;
		static create():HTMLChar;
	}

}

declare module laya.d3.graphics.Vertex {
	class VertexShurikenParticleMesh extends laya.d3.graphics.Vertex.VertexShuriKenParticle  {
		static readonly vertexDeclaration:laya.d3.graphics.VertexDeclaration;
		readonly cornerTextureCoordinate:laya.d3.math.Vector4;
		readonly position:laya.d3.math.Vector4;
		readonly velocity:laya.d3.math.Vector3;
		readonly startColor:laya.d3.math.Vector4;
		readonly startSize:laya.d3.math.Vector3;
		readonly startRotation0:laya.d3.math.Vector3;
		readonly startRotation1:laya.d3.math.Vector3;
		readonly startRotation2:laya.d3.math.Vector3;
		readonly startLifeTime:number;
		readonly time:number;
		readonly startSpeed:number;
		readonly random0:laya.d3.math.Vector4;
		readonly random1:laya.d3.math.Vector4;
		readonly simulationWorldPostion:laya.d3.math.Vector3;

		constructor(cornerTextureCoordinate:laya.d3.math.Vector4,positionStartLifeTime:laya.d3.math.Vector4,velocity:laya.d3.math.Vector3,startColor:laya.d3.math.Vector4,startSize:laya.d3.math.Vector3,startRotation0:laya.d3.math.Vector3,startRotation1:laya.d3.math.Vector3,startRotation2:laya.d3.math.Vector3,ageAddScale:number,time:number,startSpeed:number,randoms0:laya.d3.math.Vector4,randoms1:laya.d3.math.Vector4,simulationWorldPostion:laya.d3.math.Vector3);
	}

}

declare module laya.webgl.utils {
	class MeshParticle2D extends laya.webgl.utils.Mesh2D  {
		static const_stride:number;
		private static _fixattriInfo:any;
		private static _POOL:any;
		static __init__():void;

		constructor(maxNum:number);
		setMaxParticleNum(maxNum:number):void;
		static getAMesh(maxNum:number):MeshParticle2D;
		releaseMesh():void;
		destroy():void;
	}

}

declare module laya.d3.core.material {
	class BlinnPhongMaterial extends laya.d3.core.material.BaseMaterial  {
		static SPECULARSOURCE_DIFFUSEMAPALPHA:number;
		static SPECULARSOURCE_SPECULARMAP:number;
		static RENDERMODE_OPAQUE:number;
		static RENDERMODE_CUTOUT:number;
		static RENDERMODE_TRANSPARENT:number;
		static SHADERDEFINE_DIFFUSEMAP:number;
		static SHADERDEFINE_NORMALMAP:number;
		static SHADERDEFINE_SPECULARMAP:number;
		static SHADERDEFINE_TILINGOFFSET:number;
		static SHADERDEFINE_ENABLEVERTEXCOLOR:number;
		static ALBEDOTEXTURE:number;
		static NORMALTEXTURE:number;
		static SPECULARTEXTURE:number;
		static ALBEDOCOLOR:number;
		static MATERIALSPECULAR:number;
		static SHININESS:number;
		static TILINGOFFSET:number;
		static CULL:number;
		static BLEND:number;
		static BLEND_SRC:number;
		static BLEND_DST:number;
		static DEPTH_TEST:number;
		static DEPTH_WRITE:number;
		static defaultMaterial:BlinnPhongMaterial;
		private _albedoColor:any;
		private _albedoIntensity:any;
		private _enableLighting:any;
		private _enableVertexColor:any;
		renderMode:number;
		enableVertexColor:boolean;
		tilingOffsetX:number;
		tilingOffsetY:number;
		tilingOffsetZ:number;
		tilingOffsetW:number;
		tilingOffset:laya.d3.math.Vector4;
		albedoColorR:number;
		albedoColorG:number;
		albedoColorB:number;
		albedoColorA:number;
		albedoColor:laya.d3.math.Vector4;
		albedoIntensity:number;
		specularColorR:number;
		specularColorG:number;
		specularColorB:number;
		specularColorA:number;
		specularColor:laya.d3.math.Vector4;
		shininess:number;
		albedoTexture:laya.resource.BaseTexture;
		normalTexture:laya.resource.BaseTexture;
		specularTexture:laya.resource.BaseTexture;
		enableLighting:boolean;
		depthWrite:boolean;
		cull:number;
		blend:number;
		blendSrc:number;
		blendDst:number;
		depthTest:number;

		constructor();
		clone():any;
		cloneTo(destObject:any):void;
	}

}

declare module laya.resource {
	class WebGLRTMgr  {
		private static dict:any;
		static getRT(w:number,h:number):laya.resource.RenderTexture2D;
		static releaseRT(rt:laya.resource.RenderTexture2D):void;
	}

}

declare module laya.d3.physics {
	class PhysicsSimulation  {
		static disableSimulation:boolean;
		static createConstraint():void;
		maxSubSteps:number;
		fixedTimeStep:number;
		continuousCollisionDetection:boolean;
		gravity:laya.d3.math.Vector3;
		raycastFromTo(from:laya.d3.math.Vector3,to:laya.d3.math.Vector3,out?:laya.d3.physics.HitResult,collisonGroup?:number,collisionMask?:number):boolean;
		raycastAllFromTo(from:laya.d3.math.Vector3,to:laya.d3.math.Vector3,out:laya.d3.physics.HitResult[],collisonGroup?:number,collisionMask?:number):boolean;
		rayCast(ray:laya.d3.math.Ray,outHitResult?:laya.d3.physics.HitResult,distance?:number,collisonGroup?:number,collisionMask?:number):boolean;
		rayCastAll(ray:laya.d3.math.Ray,out:laya.d3.physics.HitResult[],distance?:number,collisonGroup?:number,collisionMask?:number):boolean;
		shapeCast(shape:laya.d3.physics.shape.ColliderShape,fromPosition:laya.d3.math.Vector3,toPosition:laya.d3.math.Vector3,out?:laya.d3.physics.HitResult,fromRotation?:laya.d3.math.Quaternion,toRotation?:laya.d3.math.Quaternion,collisonGroup?:number,collisionMask?:number,allowedCcdPenetration?:number):boolean;
		shapeCastAll(shape:laya.d3.physics.shape.ColliderShape,fromPosition:laya.d3.math.Vector3,toPosition:laya.d3.math.Vector3,out:laya.d3.physics.HitResult[],fromRotation?:laya.d3.math.Quaternion,toRotation?:laya.d3.math.Quaternion,collisonGroup?:number,collisionMask?:number,allowedCcdPenetration?:number):boolean;
		addConstraint(constraint:laya.d3.physics.Constraint3D,disableCollisionsBetweenLinkedBodies?:boolean):void;
		removeConstraint(constraint:laya.d3.physics.Constraint3D):void;
		clearForces():void;
	}

}

declare module laya.physics.joint {
	class RopeJoint extends laya.physics.joint.JointBase  {
		private static _temp:any;
		selfBody:laya.physics.RigidBody;
		otherBody:laya.physics.RigidBody;
		selfAnchor:any[];
		otherAnchor:any[];
		collideConnected:boolean;
		private _maxLength:any;
		protected _createJoint():void;
		maxLength:number;
	}

}

declare module laya.d3.math {
	class Quaternion implements laya.d3.core.IClone  {
		static DEFAULT:Quaternion;
		static NAN:Quaternion;
		static createFromYawPitchRoll(yaw:number,pitch:number,roll:number,out:Quaternion):void;
		static multiply(left:Quaternion,right:Quaternion,out:Quaternion):void;
		private static arcTanAngle:any;
		private static angleTo:any;
		static createFromAxisAngle(axis:laya.d3.math.Vector3,rad:number,out:Quaternion):void;
		static createFromMatrix4x4(mat:laya.d3.math.Matrix4x4,out:Quaternion):void;
		static slerp(left:Quaternion,right:Quaternion,t:number,out:Quaternion):Quaternion;
		static lerp(left:Quaternion,right:Quaternion,amount:number,out:Quaternion):void;
		static add(left:Quaternion,right:Quaternion,out:Quaternion):void;
		static dot(left:Quaternion,right:Quaternion):number;
		x:number;
		y:number;
		z:number;
		w:number;

		constructor(x?:number,y?:number,z?:number,w?:number,nativeElements?:Float32Array);
		scaling(scaling:number,out:Quaternion):void;
		normalize(out:Quaternion):void;
		length():number;
		rotateX(rad:number,out:Quaternion):void;
		rotateY(rad:number,out:Quaternion):void;
		rotateZ(rad:number,out:Quaternion):void;
		getYawPitchRoll(out:laya.d3.math.Vector3):void;
		invert(out:Quaternion):void;
		identity():void;
		fromArray(array:any[],offset?:number):void;
		cloneTo(destObject:any):void;
		clone():any;
		equals(b:Quaternion):boolean;
		static rotationLookAt(forward:laya.d3.math.Vector3,up:laya.d3.math.Vector3,out:Quaternion):void;
		static lookAt(eye:laya.d3.math.Vector3,target:laya.d3.math.Vector3,up:laya.d3.math.Vector3,out:Quaternion):void;
		lengthSquared():number;
		static invert(value:Quaternion,out:Quaternion):void;
		static rotationMatrix(matrix3x3:laya.d3.math.Matrix3x3,out:Quaternion):void;
		forNativeElement(nativeElements?:Float32Array):void;
	}

}

declare module laya.d3.math.Native {
	class ConchVector3 implements laya.d3.core.IClone  {
		static ZERO:ConchVector3;
		static ONE:ConchVector3;
		static NegativeUnitX:ConchVector3;
		static UnitX:ConchVector3;
		static UnitY:ConchVector3;
		static UnitZ:ConchVector3;
		static ForwardRH:ConchVector3;
		static ForwardLH:ConchVector3;
		static Up:ConchVector3;
		static NAN:ConchVector3;
		elements:Float32Array;
		static distanceSquared(value1:ConchVector3,value2:ConchVector3):number;
		static distance(value1:ConchVector3,value2:ConchVector3):number;
		static min(a:ConchVector3,b:ConchVector3,out:ConchVector3):void;
		static max(a:ConchVector3,b:ConchVector3,out:ConchVector3):void;
		static transformQuat(source:ConchVector3,rotation:laya.d3.math.Native.ConchQuaternion,out:ConchVector3):void;
		static scalarLength(a:ConchVector3):number;
		static scalarLengthSquared(a:ConchVector3):number;
		static normalize(s:ConchVector3,out:ConchVector3):void;
		static multiply(a:ConchVector3,b:ConchVector3,out:ConchVector3):void;
		static scale(a:ConchVector3,b:number,out:ConchVector3):void;
		static lerp(a:ConchVector3,b:ConchVector3,t:number,out:ConchVector3):void;
		static transformV3ToV3(vector:ConchVector3,transform:any,result:ConchVector3):void;
		static transformV3ToV4(vector:ConchVector3,transform:any,result:laya.d3.math.Native.ConchVector4):void;
		static TransformNormal(normal:ConchVector3,transform:any,result:ConchVector3):void;
		static transformCoordinate(coordinate:ConchVector3,transform:any,result:ConchVector3):void;
		static Clamp(value:ConchVector3,min:ConchVector3,max:ConchVector3,out:ConchVector3):void;
		static add(a:ConchVector3,b:ConchVector3,out:ConchVector3):void;
		static subtract(a:ConchVector3,b:ConchVector3,o:ConchVector3):void;
		static cross(a:ConchVector3,b:ConchVector3,o:ConchVector3):void;
		static dot(a:ConchVector3,b:ConchVector3):number;
		static equals(a:ConchVector3,b:ConchVector3):boolean;
		x:number;
		y:number;
		z:number;

		constructor(x?:number,y?:number,z?:number,nativeElements?:Float32Array);
		setValue(x:number,y:number,z:number):void;
		fromArray(array:any[],offset?:number):void;
		cloneTo(destObject:any):void;
		clone():any;
		toDefault():void;
	}

}

declare module laya.display.cmd {
	class DrawPolyCmd  {
		static ID:string;
		x:number;
		y:number;
		points:any[];
		fillColor:any;
		lineColor:any;
		lineWidth:number;
		isConvexPolygon:boolean;
		vid:number;
		static create(x:number,y:number,points:any[],fillColor:any,lineColor:any,lineWidth:number,isConvexPolygon:boolean,vid:number):DrawPolyCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.ui {
	class HSlider extends laya.ui.Slider  {

		constructor(skin?:string);
	}

}

declare module laya.ani.bone {
	class SkinSlotDisplayData  {
		name:string;
		attachmentName:string;
		type:number;
		transform:laya.ani.bone.Transform;
		width:number;
		height:number;
		texture:laya.resource.Texture;
		bones:any[];
		uvs:any[];
		weights:any[];
		triangles:any[];
		vertices:any[];
		lengths:any[];
		verLen:number;
		createTexture(currTexture:laya.resource.Texture):laya.resource.Texture;
		destory():void;
	}

}

declare module laya.webgl.text {
	class TextRender  {
		static useOldCharBook:boolean;
		static atlasWidth:number;
		static noAtlas:boolean;
		static forceSplitRender:boolean;
		static forceWholeRender:boolean;
		static scaleFontWithCtx:boolean;
		static standardFontSize:number;
		static destroyAtlasDt:number;
		static checkCleanTextureDt:number;
		static destroyUnusedTextureDt:number;
		static cleanMem:number;
		static isWan1Wan:boolean;
		static showLog:boolean;
		static debugUV:boolean;
		private fontSizeInfo:any;
		static atlasWidth2:number;
		private charRender:any;
		private static tmpRI:any;
		private static pixelBBX:any;
		private mapFont:any;
		private fontID:any;
		private mapColor:any;
		private colorID:any;
		private fontScaleX:any;
		private fontScaleY:any;
		private _curStrPos:any;
		static textRenderInst:TextRender;
		textAtlases:laya.webgl.text.TextAtlas[];
		private isoTextures:any;
		private bmpData32:any;
		private static imgdtRect:any;
		private lastFont:any;
		private fontSizeW:any;
		private fontSizeH:any;
		private fontSizeOffX:any;
		private fontSizeOffY:any;
		private renderPerChar:any;
		private tmpAtlasPos:any;
		private textureMem:any;
		private fontStr:any;
		static simClean:boolean;

		constructor();
		setFont(font:laya.utils.FontInfo):void;
		getNextChar(str:string):string;
		filltext(ctx:laya.resource.Context,data:string|laya.utils.WordText,x:number,y:number,fontStr:string,color:string,strokeColor:string,lineWidth:number,textAlign:string,underLine?:number):void;
		fillWords(ctx:laya.resource.Context,data:laya.utils.HTMLChar[],x:number,y:number,fontStr:string,color:string,strokeColor:string,lineWidth:number):void;
		_fast_filltext(ctx:laya.resource.Context,data:string|laya.utils.WordText,htmlchars:laya.utils.HTMLChar[],x:number,y:number,font:laya.utils.FontInfo,color:string,strokeColor:string,lineWidth:number,textAlign:number,underLine?:number):void;
		protected _drawResortedWords(ctx:laya.resource.Context,startx:number,starty:number,samePagesData:any[]):void;
		hasFreedText(txts:any[]):boolean;
		getCharRenderInfo(str:string,font:laya.utils.FontInfo,color:string,strokeColor:string,lineWidth:number,isoTexture?:boolean):laya.webgl.text.CharRenderInfo;
		addBmpData(data:ImageData,ri:laya.webgl.text.CharRenderInfo):laya.webgl.text.TextAtlas;
		GC():void;
		cleanAtlases():void;
		getCharBmp(c:string):any;
		private checkBmpLine:any;
		private updateBbx:any;
		getFontSizeInfo(font:string):number;
		printDbgInfo():void;
		showAtlas(n:number,bgcolor:string,x:number,y:number,w:number,h:number):laya.display.Sprite;
		filltext_native(ctx:laya.resource.Context,data:string|laya.utils.WordText,htmlchars:laya.utils.HTMLChar[],x:number,y:number,fontStr:string,color:string,strokeColor:string,lineWidth:number,textAlign:string,underLine?:number):void;
	}

}

declare module laya.d3.core.light {
	class PointLight extends laya.d3.core.light.LightSprite  {
		private static _tempMatrix0:any;
		private _range:any;
		private _lightMatrix:any;

		constructor();
		range:number;
		protected _onActive():void;
		protected _onInActive():void;
		_prepareToScene():boolean;
		_parse(data:any,spriteMap:any):void;
	}

}

declare module laya.utils {
	class IStatRender  {
		show(x?:number,y?:number):void;
		enable():void;
		hide():void;
		set_onclick(fn:Function):void;
		isCanvasRender():boolean;
		renderNotCanvas(ctx:any,x:number,y:number):void;
	}

}

declare module laya.d3.core {
	class MeshSprite3D extends laya.d3.core.RenderableSprite3D  {
		private _meshFilter:any;
		readonly meshFilter:laya.d3.core.MeshFilter;
		readonly meshRenderer:laya.d3.core.MeshRenderer;

		constructor(mesh?:laya.d3.resource.models.Mesh,name?:string);
		_parse(data:any,spriteMap:any):void;
		_addToInitStaticBatchManager():void;
		_cloneTo(destObject:any,rootSprite:laya.display.Node,dstSprite:laya.display.Node):void;
		destroy(destroyChild?:boolean):void;
	}

}

declare module laya.webgl.utils {
	class MeshQuadTexture extends laya.webgl.utils.Mesh2D  {
		static const_stride:number;
		private static _fixib:any;
		private static _maxIB:any;
		private static _fixattriInfo:any;
		private static _POOL:any;
		static __int__():void;

		constructor();
		static getAMesh(mainctx:boolean):MeshQuadTexture;
		releaseMesh():void;
		destroy():void;
		addQuad(pos:any[],uv:ArrayLike<number>,color:number,useTex:boolean):void;
	}

}

declare module laya.d3.core.material {
	class EffectMaterial extends laya.d3.core.material.BaseMaterial  {
		static RENDERMODE_ADDTIVE:number;
		static RENDERMODE_ALPHABLENDED:number;
		static defaultMaterial:EffectMaterial;
		static SHADERDEFINE_MAINTEXTURE:number;
		static SHADERDEFINE_TILINGOFFSET:number;
		static SHADERDEFINE_ADDTIVEFOG:number;
		static MAINTEXTURE:number;
		static TINTCOLOR:number;
		static TILINGOFFSET:number;
		static CULL:number;
		static BLEND:number;
		static BLEND_SRC:number;
		static BLEND_DST:number;
		static DEPTH_TEST:number;
		static DEPTH_WRITE:number;
		private _color:any;
		renderMode:number;
		colorR:number;
		colorG:number;
		colorB:number;
		colorA:number;
		color:laya.d3.math.Vector4;
		texture:laya.resource.BaseTexture;
		tilingOffsetX:number;
		tilingOffsetY:number;
		tilingOffsetZ:number;
		tilingOffsetW:number;
		tilingOffset:laya.d3.math.Vector4;
		depthWrite:boolean;
		cull:number;
		blend:number;
		blendSrc:number;
		blendDst:number;
		depthTest:number;

		constructor();
		clone():any;
	}

}

declare module laya.d3.physics {
	class PhysicsTriggerComponent extends laya.d3.physics.PhysicsComponent  {
		isTrigger:boolean;

		constructor(collisionGroup:number,canCollideWith:number);
		_onAdded():void;
		_cloneTo(dest:laya.components.Component):void;
	}

}

declare module laya.physics.joint {
	class WeldJoint extends laya.physics.joint.JointBase  {
		private static _temp:any;
		selfBody:laya.physics.RigidBody;
		otherBody:laya.physics.RigidBody;
		anchor:any[];
		collideConnected:boolean;
		private _frequency:any;
		private _damping:any;
		protected _createJoint():void;
		frequency:number;
		damping:number;
	}

}

declare module laya.d3.math {
	class Rand  {
		static getFloatFromInt(v:number):number;
		static getByteFromInt(v:number):number;
		seeds:Uint32Array;
		seed:number;

		constructor(seed:number);
		getUint():number;
		getFloat():number;
		getSignedFloat():number;
	}

}

declare module laya.d3.math.Native {
	class ConchVector4 implements laya.d3.core.IClone  {
		static ZERO:ConchVector4;
		static ONE:ConchVector4;
		static UnitX:ConchVector4;
		static UnitY:ConchVector4;
		static UnitZ:ConchVector4;
		static UnitW:ConchVector4;
		elements:Float32Array;
		x:number;
		y:number;
		z:number;
		w:number;

		constructor(x?:number,y?:number,z?:number,w?:number);
		fromArray(array:any[],offset?:number):void;
		cloneTo(destObject:any):void;
		clone():any;
		static lerp(a:ConchVector4,b:ConchVector4,t:number,out:ConchVector4):void;
		static transformByM4x4(vector4:ConchVector4,m4x4:any,out:ConchVector4):void;
		static equals(a:ConchVector4,b:ConchVector4):boolean;
		length():number;
		lengthSquared():number;
		static normalize(s:ConchVector4,out:ConchVector4):void;
		static add(a:ConchVector4,b:ConchVector4,out:ConchVector4):void;
		static subtract(a:ConchVector4,b:ConchVector4,out:ConchVector4):void;
		static multiply(a:ConchVector4,b:ConchVector4,out:ConchVector4):void;
		static scale(a:ConchVector4,b:number,out:ConchVector4):void;
		static Clamp(value:ConchVector4,min:ConchVector4,max:ConchVector4,out:ConchVector4):void;
		static distanceSquared(value1:ConchVector4,value2:ConchVector4):number;
		static distance(value1:ConchVector4,value2:ConchVector4):number;
		static dot(a:ConchVector4,b:ConchVector4):number;
		static min(a:ConchVector4,b:ConchVector4,out:ConchVector4):void;
		static max(a:ConchVector4,b:ConchVector4,out:ConchVector4):void;
	}

}

declare module laya.display.cmd {
	class DrawRectCmd  {
		static ID:string;
		x:number;
		y:number;
		width:number;
		height:number;
		fillColor:any;
		lineColor:any;
		lineWidth:number;
		static create(x:number,y:number,width:number,height:number,fillColor:any,lineColor:any,lineWidth:number):DrawRectCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.ui {
	interface IBox{
	}

}

declare module laya.ani.bone {
	class SlotData  {
		name:string;
		displayArr:any[];
		getDisplayByName(name:string):number;
	}

}

declare module laya.webgl.text {
	interface ITextRender{
		atlasWidth:number;
		checkCleanTextureDt:number;
		debugUV:boolean;
		isWan1Wan:boolean;
		destroyUnusedTextureDt:number;
	}
	class TextTexture extends laya.resource.Resource  {
		static gTextRender:ITextRender;
		private static pool:any;
		private static poolLen:any;
		private static cleanTm:any;
		genID:number;
		bitmap:any;
		curUsedCovRate:number;
		curUsedCovRateAtlas:number;
		lastTouchTm:number;
		ri:laya.webgl.text.CharRenderInfo;

		constructor(textureW:number,textureH:number);
		recreateResource():void;
		addChar(data:ImageData,x:number,y:number,uv?:any[]):any[];
		addCharCanvas(canv:any,x:number,y:number,uv?:any[]):any[];
		fillWhite():void;
		discard():void;
		static getTextTexture(w:number,h:number):TextTexture;
		destroy():void;
		static clean():void;
		touchRect(ri:laya.webgl.text.CharRenderInfo,curloop:number):void;
		readonly texture:any;
		drawOnScreen(x:number,y:number):void;
	}

}

declare module laya.d3.core.light {
	class SpotLight extends laya.d3.core.light.LightSprite  {
		private static _tempMatrix0:any;
		private static _tempMatrix1:any;
		private _direction:any;
		private _spotAngle:any;
		private _range:any;
		spotAngle:number;
		range:number;
		protected _onActive():void;
		protected _onInActive():void;
		_prepareToScene():boolean;
		_parse(data:any,spriteMap:any):void;
	}

}

declare module laya.utils {
	class Log  {
		private static _logdiv:any;
		private static _btn:any;
		private static _count:any;
		static maxCount:number;
		static autoScrollToBottom:boolean;
		static enable():void;
		static toggle():void;
		static print(value:string):void;
		static clear():void;
	}

}

declare module laya.d3.core {
	class MeshSprite3DShaderDeclaration  {
		static SHADERDEFINE_UV0:number;
		static SHADERDEFINE_COLOR:number;
		static SHADERDEFINE_UV1:number;
		static SHADERDEFINE_GPU_INSTANCE:number;
	}

}

declare module laya.webgl.utils {
	class MeshTexture extends laya.webgl.utils.Mesh2D  {
		static const_stride:number;
		private static _fixattriInfo:any;
		private static _POOL:any;
		static __init__():void;

		constructor();
		static getAMesh(mainctx:boolean):MeshTexture;
		addData(vertices:Float32Array,uvs:Float32Array,idx:Uint16Array,matrix:laya.maths.Matrix,rgba:number):void;
		releaseMesh():void;
		destroy():void;
	}

}

declare module laya.d3.core.material {
	class ExtendTerrainMaterial extends laya.d3.core.material.BaseMaterial  {
		static RENDERMODE_OPAQUE:number;
		static RENDERMODE_TRANSPARENT:number;
		static SPLATALPHATEXTURE:number;
		static DIFFUSETEXTURE1:number;
		static DIFFUSETEXTURE2:number;
		static DIFFUSETEXTURE3:number;
		static DIFFUSETEXTURE4:number;
		static DIFFUSETEXTURE5:number;
		static DIFFUSESCALEOFFSET1:number;
		static DIFFUSESCALEOFFSET2:number;
		static DIFFUSESCALEOFFSET3:number;
		static DIFFUSESCALEOFFSET4:number;
		static DIFFUSESCALEOFFSET5:number;
		static CULL:number;
		static BLEND:number;
		static BLEND_SRC:number;
		static BLEND_DST:number;
		static DEPTH_TEST:number;
		static DEPTH_WRITE:number;
		static SHADERDEFINE_DETAIL_NUM1:number;
		static SHADERDEFINE_DETAIL_NUM2:number;
		static SHADERDEFINE_DETAIL_NUM3:number;
		static SHADERDEFINE_DETAIL_NUM4:number;
		static SHADERDEFINE_DETAIL_NUM5:number;
		private _enableLighting:any;
		splatAlphaTexture:laya.resource.BaseTexture;
		diffuseTexture1:laya.resource.BaseTexture;
		diffuseTexture2:laya.resource.BaseTexture;
		diffuseTexture3:laya.resource.BaseTexture;
		diffuseTexture4:laya.resource.BaseTexture;
		diffuseTexture5:laya.resource.BaseTexture;
		private _setDetailNum:any;
		diffuseScaleOffset1:laya.d3.math.Vector4;
		diffuseScaleOffset2:laya.d3.math.Vector4;
		diffuseScaleOffset3:laya.d3.math.Vector4;
		diffuseScaleOffset4:laya.d3.math.Vector4;
		diffuseScaleOffset5:laya.d3.math.Vector4;
		enableLighting:boolean;
		renderMode:number;
		depthWrite:boolean;
		cull:number;
		blend:number;
		blendSrc:number;
		blendDst:number;
		depthTest:number;

		constructor();
		clone():any;
	}

}

declare module laya.d3.physics {
	class PhysicsUpdateList extends laya.d3.component.SingletonList<laya.resource.ISingletonElement>  {

		constructor();
	}

}

declare module laya.physics.joint {
	class WheelJoint extends laya.physics.joint.JointBase  {
		private static _temp:any;
		selfBody:laya.physics.RigidBody;
		otherBody:laya.physics.RigidBody;
		anchor:any[];
		collideConnected:boolean;
		axis:any[];
		private _frequency:any;
		private _damping:any;
		private _enableMotor:any;
		private _motorSpeed:any;
		private _maxMotorTorque:any;
		protected _createJoint():void;
		frequency:number;
		damping:number;
		enableMotor:boolean;
		motorSpeed:number;
		maxMotorTorque:number;
	}

}

declare module laya.d3.math {
	class RandX  {
		static defaultRand:RandX;

		constructor(seed:any[]);
		randomint():any[];
		random():number;
	}

}

declare module laya.display.cmd {
	class DrawTextureCmd  {
		static ID:string;
		texture:laya.resource.Texture;
		x:number;
		y:number;
		width:number;
		height:number;
		matrix:laya.maths.Matrix;
		alpha:number;
		color:string;
		colorFlt:laya.filters.ColorFilter;
		blendMode:string;
		uv:number[];
		static create(texture:laya.resource.Texture,x:number,y:number,width:number,height:number,matrix:laya.maths.Matrix,alpha:number,color:string,blendMode:string,uv?:number[]):DrawTextureCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.ani.bone {
	class Templet extends laya.ani.AnimationTemplet  {
		private _mainTexture:any;
		private _graphicsCache:any;
		srcBoneMatrixArr:any[];
		ikArr:any[];
		tfArr:any[];
		pathArr:any[];
		boneSlotDic:any;
		bindBoneBoneSlotDic:any;
		boneSlotArray:any[];
		skinDataArray:any[];
		skinDic:any;
		subTextureDic:any;
		isParseFail:boolean;
		yReverseMatrix:laya.maths.Matrix;
		drawOrderAniArr:any[];
		eventAniArr:any[];
		attachmentNames:any[];
		deformAniArr:any[];
		skinSlotDisplayDataArr:laya.ani.bone.SkinSlotDisplayData[];
		private _isParseAudio:any;
		private _isDestroyed:any;
		private _rate:any;
		isParserComplete:boolean;
		aniSectionDic:any;
		private _skBufferUrl:any;
		private _textureDic:any;
		private _loadList:any;
		private _path:any;
		private _relativeUrl:any;
		tMatrixDataLen:number;
		mRootBone:laya.ani.bone.Bone;
		mBoneArr:laya.ani.bone.Bone[];
		loadAni(url:string):void;
		private onComplete:any;
		parseData(texture:laya.resource.Texture,skeletonData:ArrayBuffer,playbackRate?:number):void;
		buildArmature(aniMode?:number):laya.ani.bone.Skeleton;
		parse(data:ArrayBuffer):void;
		private _parseTexturePath:any;
		private _textureComplete:any;
		private _parsePublicExtData:any;
		getTexture(name:string):laya.resource.Texture;
		showSkinByIndex(boneSlotDic:any,skinIndex:number,freshDisplayIndex?:boolean):boolean;
		getSkinIndexByName(skinName:string):number;
		getGrahicsDataWithCache(aniIndex:number,frameIndex:number):laya.display.Graphics;
		setGrahicsDataWithCache(aniIndex:number,frameIndex:number,graphics:laya.display.Graphics):void;
		deleteAniData(aniIndex:number):void;
		destroy():void;
		getAniNameByIndex(index:number):string;
		rate:number;
	}

}

declare module laya.ui {
	interface IItem{
		initItems():void;
	}

}

declare module laya.utils {
	class Mouse  {
		private static _style:any;
		private static _preCursor:any;
		static cursor:string;
		static __init__():any;
		static hide():void;
		static show():void;
	}

}

declare module laya.d3.core {
	class MeshTerrainSprite3D extends laya.d3.core.MeshSprite3D  {
		private static _tempVector3:any;
		private static _tempMatrix4x4:any;
		static createFromMesh(mesh:laya.d3.resource.models.Mesh,heightMapWidth:number,heightMapHeight:number,name?:string):MeshTerrainSprite3D;
		static createFromMeshAndHeightMap(mesh:laya.d3.resource.models.Mesh,texture:laya.resource.Texture2D,minHeight:number,maxHeight:number,name?:string):MeshTerrainSprite3D;
		private _minX:any;
		private _minZ:any;
		private _cellSize:any;
		private _heightMap:any;
		readonly minX:number;
		readonly minZ:number;
		readonly width:number;
		readonly depth:number;

		constructor(mesh:laya.d3.resource.models.Mesh,heightMap:laya.d3.core.HeightMap,name?:string);
		private _disableRotation:any;
		private _getScaleX:any;
		private _getScaleZ:any;
		private _initCreateFromMesh:any;
		private _initCreateFromMeshHeightMap:any;
		private _computeCellSize:any;
		getHeight(x:number,z:number):number;
	}

}

declare module laya.webgl.utils {
	class MeshVG extends laya.webgl.utils.Mesh2D  {
		static const_stride:number;
		private static _fixattriInfo:any;
		private static _POOL:any;
		static __init__():void;

		constructor();
		static getAMesh(mainctx:boolean):MeshVG;
		addVertAndIBToMesh(ctx:laya.resource.Context,points:any[],rgba:number,ib:any[]):void;
		releaseMesh():void;
		destroy():void;
	}

}

declare module laya.d3.core.material {
	class PBRSpecularMaterial extends laya.d3.core.material.BaseMaterial  {
		static SmoothnessSource_SpecularTexture_Alpha:number;
		static SmoothnessSource_AlbedoTexture_Alpha:number;
		static RENDERMODE_OPAQUE:number;
		static RENDERMODE_CUTOUT:number;
		static RENDERMODE_FADE:number;
		static RENDERMODE_TRANSPARENT:number;
		static SHADERDEFINE_ALBEDOTEXTURE:number;
		static SHADERDEFINE_NORMALTEXTURE:number;
		static SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA:number;
		static SHADERDEFINE_SPECULARTEXTURE:number;
		static SHADERDEFINE_OCCLUSIONTEXTURE:number;
		static SHADERDEFINE_PARALLAXTEXTURE:number;
		static SHADERDEFINE_EMISSION:number;
		static SHADERDEFINE_EMISSIONTEXTURE:number;
		static SHADERDEFINE_TILINGOFFSET:number;
		static SHADERDEFINE_ALPHAPREMULTIPLY:number;
		static ALBEDOTEXTURE:number;
		static SPECULARTEXTURE:number;
		static NORMALTEXTURE:number;
		static PARALLAXTEXTURE:number;
		static OCCLUSIONTEXTURE:number;
		static EMISSIONTEXTURE:number;
		static ALBEDOCOLOR:number;
		static SPECULARCOLOR:number;
		static EMISSIONCOLOR:number;
		static SMOOTHNESS:number;
		static SMOOTHNESSSCALE:number;
		static SMOOTHNESSSOURCE:number;
		static OCCLUSIONSTRENGTH:number;
		static NORMALSCALE:number;
		static PARALLAXSCALE:number;
		static ENABLEEMISSION:number;
		static ENABLEREFLECT:number;
		static TILINGOFFSET:number;
		static CULL:number;
		static BLEND:number;
		static BLEND_SRC:number;
		static BLEND_DST:number;
		static DEPTH_TEST:number;
		static DEPTH_WRITE:number;
		static defaultMaterial:PBRSpecularMaterial;
		private _albedoColor:any;
		private _specularColor:any;
		private _emissionColor:any;
		albedoColorR:number;
		albedoColorG:number;
		albedoColorB:number;
		albedoColorA:number;
		albedoColor:laya.d3.math.Vector4;
		albedoTexture:laya.resource.BaseTexture;
		normalTexture:laya.resource.BaseTexture;
		normalTextureScale:number;
		parallaxTexture:laya.resource.BaseTexture;
		parallaxTextureScale:number;
		occlusionTexture:laya.resource.BaseTexture;
		occlusionTextureStrength:number;
		specularTexture:laya.resource.BaseTexture;
		specularColorR:number;
		specularColorG:number;
		specularColorB:number;
		specularColorA:number;
		specularColor:laya.d3.math.Vector4;
		smoothness:number;
		smoothnessTextureScale:number;
		smoothnessSource:number;
		enableEmission:boolean;
		emissionColor:laya.d3.math.Vector4;
		emissionTexture:laya.resource.BaseTexture;
		enableReflection:boolean;
		tilingOffsetX:number;
		tilingOffsetY:number;
		tilingOffsetZ:number;
		tilingOffsetW:number;
		tilingOffset:laya.d3.math.Vector4;
		renderMode:number;
		depthWrite:boolean;
		cull:number;
		blend:number;
		blendSrc:number;
		blendDst:number;
		depthTest:number;

		constructor();
		clone():any;
		cloneTo(destObject:any):void;
	}

}

declare module laya.d3.physics {
	class Rigidbody3D extends laya.d3.physics.PhysicsTriggerComponent  {
		static TYPE_STATIC:number;
		static TYPE_DYNAMIC:number;
		static TYPE_KINEMATIC:number;
		mass:number;
		isKinematic:boolean;
		linearDamping:number;
		angularDamping:number;
		overrideGravity:boolean;
		gravity:laya.d3.math.Vector3;
		readonly totalForce:laya.d3.math.Vector3;
		linearFactor:laya.d3.math.Vector3;
		linearVelocity:laya.d3.math.Vector3;
		angularFactor:laya.d3.math.Vector3;
		angularVelocity:laya.d3.math.Vector3;
		readonly totalTorque:laya.d3.math.Vector3;
		detectCollisions:boolean;
		readonly isSleeping:boolean;
		sleepLinearVelocity:number;
		sleepAngularVelocity:number;

		constructor(collisionGroup?:number,canCollideWith?:number);
		protected _onScaleChange(scale:laya.d3.math.Vector3):void;
		_onAdded():void;
		_onShapeChange(colShape:laya.d3.physics.shape.ColliderShape):void;
		_parse(data:any):void;
		protected _onDestroy():void;
		_addToSimulation():void;
		_removeFromSimulation():void;
		_cloneTo(dest:laya.components.Component):void;
		applyForce(force:laya.d3.math.Vector3,localOffset?:laya.d3.math.Vector3):void;
		applyTorque(torque:laya.d3.math.Vector3):void;
		applyImpulse(impulse:laya.d3.math.Vector3,localOffset?:laya.d3.math.Vector3):void;
		applyTorqueImpulse(torqueImpulse:laya.d3.math.Vector3):void;
		wakeUp():void;
		clearForces():void;
	}

}

declare module laya.d3.math {
	class Ray  {
		origin:laya.d3.math.Vector3;
		direction:laya.d3.math.Vector3;

		constructor(origin:laya.d3.math.Vector3,direction:laya.d3.math.Vector3);
	}

}

declare module laya.display.cmd {
	class DrawTexturesCmd  {
		static ID:string;
		texture:laya.resource.Texture;
		pos:any[];
		static create(texture:laya.resource.Texture,pos:any[]):DrawTexturesCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.ui {
	class Image extends laya.ui.UIComponent  {
		protected _skin:string;
		protected _group:string;

		constructor(skin?:string);
		destroy(destroyChild?:boolean):void;
		dispose():void;
		protected createChildren():void;
		skin:string;
		source:laya.resource.Texture;
		group:string;
		protected setSource(url:string,img?:any):void;
		protected measureWidth():number;
		protected measureHeight():number;
		width:number;
		height:number;
		sizeGrid:string;
		dataSource:any;
	}

}

declare module laya.utils {
	class PerfData  {
		id:number;
		name:string;
		color:number;
		scale:number;
		datas:any[];
		datapos:number;

		constructor(id:number,color:number,name:string,scale:number);
		addData(v:number):void;
	}

}

declare module laya.webgl.utils {
	class RenderState2D  {
		static _MAXSIZE:number;
		static EMPTYMAT4_ARRAY:any[];
		static TEMPMAT4_ARRAY:any[];
		static worldMatrix4:any[];
		static worldMatrix:laya.maths.Matrix;
		static matWVP:any;
		static worldAlpha:number;
		static worldScissorTest:boolean;
		static worldShaderDefines:laya.webgl.shader.d2.ShaderDefines2D;
		static worldFilters:any[];
		static width:number;
		static height:number;
		static mat2MatArray(mat:laya.maths.Matrix,matArray:any[]):any[];
		static restoreTempArray():void;
		static clear():void;
	}

}

declare module laya.d3.core {
	class QuaternionKeyframe extends laya.d3.core.Keyframe  {
		inTangent:laya.d3.math.Vector4;
		outTangent:laya.d3.math.Vector4;
		value:laya.d3.math.Quaternion;

		constructor();
		cloneTo(dest:any):void;
	}

}

declare module laya.d3.core.pixelLine {
	class PixelLineData  {
		startPosition:laya.d3.math.Vector3;
		endPosition:laya.d3.math.Vector3;
		startColor:laya.d3.math.Color;
		endColor:laya.d3.math.Color;
		cloneTo(destObject:PixelLineData):void;
	}

}

declare module laya.d3.core.particleShuriKen {
	class ShuriKenParticle3D extends laya.d3.core.RenderableSprite3D  {
		readonly particleSystem:laya.d3.core.particleShuriKen.ShurikenParticleSystem;
		readonly particleRenderer:laya.d3.core.particleShuriKen.ShurikenParticleRenderer;

		constructor();
		_parse(data:any,spriteMap:any):void;
		_activeHierarchy(activeChangeComponents:any[]):void;
		_inActiveHierarchy(activeChangeComponents:any[]):void;
		destroy(destroyChild?:boolean):void;
	}

}

declare module laya.d3.core.material {
	class PBRStandardMaterial extends laya.d3.core.material.BaseMaterial  {
		static SmoothnessSource_MetallicGlossTexture_Alpha:number;
		static SmoothnessSource_AlbedoTexture_Alpha:number;
		static RENDERMODE_OPAQUE:number;
		static RENDERMODE_CUTOUT:number;
		static RENDERMODE_FADE:number;
		static RENDERMODE_TRANSPARENT:number;
		static SHADERDEFINE_ALBEDOTEXTURE:number;
		static SHADERDEFINE_NORMALTEXTURE:number;
		static SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA:number;
		static SHADERDEFINE_METALLICGLOSSTEXTURE:number;
		static SHADERDEFINE_OCCLUSIONTEXTURE:number;
		static SHADERDEFINE_PARALLAXTEXTURE:number;
		static SHADERDEFINE_EMISSION:number;
		static SHADERDEFINE_EMISSIONTEXTURE:number;
		static SHADERDEFINE_REFLECTMAP:number;
		static SHADERDEFINE_TILINGOFFSET:number;
		static SHADERDEFINE_ALPHAPREMULTIPLY:number;
		static ALBEDOTEXTURE:number;
		static METALLICGLOSSTEXTURE:number;
		static NORMALTEXTURE:number;
		static PARALLAXTEXTURE:number;
		static OCCLUSIONTEXTURE:number;
		static EMISSIONTEXTURE:number;
		static ALBEDOCOLOR:number;
		static EMISSIONCOLOR:number;
		static METALLIC:number;
		static SMOOTHNESS:number;
		static SMOOTHNESSSCALE:number;
		static SMOOTHNESSSOURCE:number;
		static OCCLUSIONSTRENGTH:number;
		static NORMALSCALE:number;
		static PARALLAXSCALE:number;
		static ENABLEEMISSION:number;
		static ENABLEREFLECT:number;
		static TILINGOFFSET:number;
		static CULL:number;
		static BLEND:number;
		static BLEND_SRC:number;
		static BLEND_DST:number;
		static DEPTH_TEST:number;
		static DEPTH_WRITE:number;
		static defaultMaterial:PBRStandardMaterial;
		private _albedoColor:any;
		private _emissionColor:any;
		albedoColorR:number;
		albedoColorG:number;
		albedoColorB:number;
		albedoColorA:number;
		albedoColor:laya.d3.math.Vector4;
		albedoTexture:laya.resource.BaseTexture;
		normalTexture:laya.resource.BaseTexture;
		normalTextureScale:number;
		parallaxTexture:laya.resource.BaseTexture;
		parallaxTextureScale:number;
		occlusionTexture:laya.resource.BaseTexture;
		occlusionTextureStrength:number;
		metallicGlossTexture:laya.resource.BaseTexture;
		metallic:number;
		smoothness:number;
		smoothnessTextureScale:number;
		smoothnessSource:number;
		enableEmission:boolean;
		emissionColorR:number;
		emissionColorG:number;
		emissionColorB:number;
		emissionColorA:number;
		emissionColor:laya.d3.math.Vector4;
		emissionTexture:laya.resource.BaseTexture;
		enableReflection:boolean;
		tilingOffsetX:number;
		tilingOffsetY:number;
		tilingOffsetZ:number;
		tilingOffsetW:number;
		tilingOffset:laya.d3.math.Vector4;
		renderMode:number;
		depthWrite:boolean;
		cull:number;
		blend:number;
		blendSrc:number;
		blendDst:number;
		depthTest:number;

		constructor();
		clone():any;
		cloneTo(destObject:any):void;
	}

}

declare module laya.d3.core.particleShuriKen.module {
	class Burst implements laya.d3.core.IClone  {
		private _time:any;
		private _minCount:any;
		private _maxCount:any;
		readonly time:number;
		readonly minCount:number;
		readonly maxCount:number;

		constructor(time:number,minCount:number,maxCount:number);
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.d3.physics.shape {
	class BoxColliderShape extends laya.d3.physics.shape.ColliderShape  {
		readonly sizeX:number;
		readonly sizeY:number;
		readonly sizeZ:number;

		constructor(sizeX?:number,sizeY?:number,sizeZ?:number);
		clone():any;
	}

}

declare module laya.d3.math {
	class Vector2 implements laya.d3.core.IClone  {
		static ZERO:Vector2;
		static ONE:Vector2;
		x:number;
		y:number;

		constructor(x?:number,y?:number);
		setValue(x:number,y:number):void;
		static scale(a:Vector2,b:number,out:Vector2):void;
		fromArray(array:any[],offset?:number):void;
		cloneTo(destObject:any):void;
		static dot(a:Vector2,b:Vector2):number;
		static normalize(s:Vector2,out:Vector2):void;
		static scalarLength(a:Vector2):number;
		clone():any;
		forNativeElement(nativeElements?:Float32Array):void;
		static rewriteNumProperty(proto:any,name:string,index:number):void;
	}

}

declare module laya.display.cmd {
	class DrawTrianglesCmd  {
		static ID:string;
		texture:laya.resource.Texture;
		x:number;
		y:number;
		vertices:Float32Array;
		uvs:Float32Array;
		indices:Uint16Array;
		matrix:laya.maths.Matrix;
		alpha:number;
		blendMode:string;
		color:laya.filters.ColorFilter;
		static create(texture:laya.resource.Texture,x:number,y:number,vertices:Float32Array,uvs:Float32Array,indices:Uint16Array,matrix:laya.maths.Matrix,alpha:number,color:string,blendMode:string):DrawTrianglesCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.ui {
	interface IRender{
		itemRender:any;
	}

}

declare module laya.utils {
	class PerfHUD extends laya.display.Sprite  {
		private static _lastTm:any;
		private static _now:any;
		private datas:any;
		static DATANUM:number;
		xdata:any[];
		ydata:any[];
		hud_width:number;
		hud_height:number;
		gMinV:number;
		gMaxV:number;
		private textSpace:any;
		static inst:PerfHUD;
		private _now:any;
		private sttm:any;
		static drawTexTm:number;

		constructor();
		now():number;
		start():void;
		end(i:number):void;
		config(w:number,h:number):void;
		addDataDef(id:number,color:number,name:string,scale:number):void;
		updateValue(id:number,v:number):void;
		v2y(v:number):number;
		drawHLine(ctx:laya.resource.Context,v:number,color:string,text:string):void;
		customRender(ctx:laya.resource.Context,x:number,y:number):void;
	}

}

declare module laya.ani.bone {
	class Transform  {
		skX:number;
		skY:number;
		scX:number;
		scY:number;
		x:number;
		y:number;
		skewX:number;
		skewY:number;
		private mMatrix:any;
		initData(data:any):void;
		getMatrix():laya.maths.Matrix;
		skew(m:laya.maths.Matrix,x:number,y:number):laya.maths.Matrix;
	}

}

declare module laya.webgl.utils {
	class ShaderCompile  {
		static IFDEF_NO:number;
		static IFDEF_YES:number;
		static IFDEF_ELSE:number;
		static IFDEF_PARENT:number;
		static _removeAnnotation:RegExp;
		static _reg:RegExp;
		static _splitToWordExps:RegExp;
		static includes:any;
		static shaderParamsMap:any;
		private _nameMap:any;
		protected _VS:laya.webgl.utils.ShaderNode;
		protected _PS:laya.webgl.utils.ShaderNode;
		private static _parseOne:any;
		static addInclude(fileName:string,txt:string):void;
		static preGetParams(vs:string,ps:string):any;
		static splitToWords(str:string,block:laya.webgl.utils.ShaderNode):any[];
		static _clearCR:RegExp;
		defs:Object;

		constructor(vs:string,ps:string,nameMap:any);
		static _splitToWordExps3:RegExp;
		protected _compileToTree(parent:laya.webgl.utils.ShaderNode,lines:any[],start:number,includefiles:any[],defs:any):void;
		createShader(define:any,shaderName:any,createShader:Function,bindAttrib:any[]):laya.webgl.shader.Shader;
	}

}

declare module laya.d3.core.pixelLine {
	class PixelLineFilter extends laya.d3.core.GeometryElement  {

		constructor(owner:laya.d3.core.pixelLine.PixelLineSprite3D,maxLineCount:number);
		_getType():number;
		_getLineData(index:number,out:laya.d3.core.pixelLine.PixelLineData):void;
		_prepareRender(state:laya.d3.core.render.RenderContext3D):boolean;
		_render(state:laya.d3.core.render.RenderContext3D):void;
		destroy():void;
	}

}

declare module laya.d3.core.material {
	class RenderState implements laya.d3.core.IClone  {
		static CULL_NONE:number;
		static CULL_FRONT:number;
		static CULL_BACK:number;
		static BLEND_DISABLE:number;
		static BLEND_ENABLE_ALL:number;
		static BLEND_ENABLE_SEPERATE:number;
		static BLENDPARAM_ZERO:number;
		static BLENDPARAM_ONE:number;
		static BLENDPARAM_SRC_COLOR:number;
		static BLENDPARAM_ONE_MINUS_SRC_COLOR:number;
		static BLENDPARAM_DST_COLOR:number;
		static BLENDPARAM_ONE_MINUS_DST_COLOR:number;
		static BLENDPARAM_SRC_ALPHA:number;
		static BLENDPARAM_ONE_MINUS_SRC_ALPHA:number;
		static BLENDPARAM_DST_ALPHA:number;
		static BLENDPARAM_ONE_MINUS_DST_ALPHA:number;
		static BLENDPARAM_SRC_ALPHA_SATURATE:number;
		static BLENDEQUATION_ADD:number;
		static BLENDEQUATION_SUBTRACT:number;
		static BLENDEQUATION_REVERSE_SUBTRACT:number;
		static DEPTHTEST_OFF:number;
		static DEPTHTEST_NEVER:number;
		static DEPTHTEST_LESS:number;
		static DEPTHTEST_EQUAL:number;
		static DEPTHTEST_LEQUAL:number;
		static DEPTHTEST_GREATER:number;
		static DEPTHTEST_NOTEQUAL:number;
		static DEPTHTEST_GEQUAL:number;
		static DEPTHTEST_ALWAYS:number;
		cull:number;
		blend:number;
		srcBlend:number;
		dstBlend:number;
		srcBlendRGB:number;
		dstBlendRGB:number;
		srcBlendAlpha:number;
		dstBlendAlpha:number;
		blendConstColor:laya.d3.math.Vector4;
		blendEquation:number;
		blendEquationRGB:number;
		blendEquationAlpha:number;
		depthTest:number;
		depthWrite:boolean;

		constructor();
		cloneTo(dest:any):void;
		clone():any;
	}

}

declare module laya.d3.core.particleShuriKen {
	class ShuriKenParticle3DShaderDeclaration  {
		static SHADERDEFINE_RENDERMODE_BILLBOARD:number;
		static SHADERDEFINE_RENDERMODE_STRETCHEDBILLBOARD:number;
		static SHADERDEFINE_RENDERMODE_HORIZONTALBILLBOARD:number;
		static SHADERDEFINE_RENDERMODE_VERTICALBILLBOARD:number;
		static SHADERDEFINE_COLOROVERLIFETIME:number;
		static SHADERDEFINE_RANDOMCOLOROVERLIFETIME:number;
		static SHADERDEFINE_VELOCITYOVERLIFETIMECONSTANT:number;
		static SHADERDEFINE_VELOCITYOVERLIFETIMECURVE:number;
		static SHADERDEFINE_VELOCITYOVERLIFETIMERANDOMCONSTANT:number;
		static SHADERDEFINE_VELOCITYOVERLIFETIMERANDOMCURVE:number;
		static SHADERDEFINE_TEXTURESHEETANIMATIONCURVE:number;
		static SHADERDEFINE_TEXTURESHEETANIMATIONRANDOMCURVE:number;
		static SHADERDEFINE_ROTATIONOVERLIFETIME:number;
		static SHADERDEFINE_ROTATIONOVERLIFETIMESEPERATE:number;
		static SHADERDEFINE_ROTATIONOVERLIFETIMECONSTANT:number;
		static SHADERDEFINE_ROTATIONOVERLIFETIMECURVE:number;
		static SHADERDEFINE_ROTATIONOVERLIFETIMERANDOMCONSTANTS:number;
		static SHADERDEFINE_ROTATIONOVERLIFETIMERANDOMCURVES:number;
		static SHADERDEFINE_SIZEOVERLIFETIMECURVE:number;
		static SHADERDEFINE_SIZEOVERLIFETIMECURVESEPERATE:number;
		static SHADERDEFINE_SIZEOVERLIFETIMERANDOMCURVES:number;
		static SHADERDEFINE_SIZEOVERLIFETIMERANDOMCURVESSEPERATE:number;
		static SHADERDEFINE_RENDERMODE_MESH:number;
		static SHADERDEFINE_SHAPE:number;
		static WORLDPOSITION:number;
		static WORLDROTATION:number;
		static POSITIONSCALE:number;
		static SIZESCALE:number;
		static SCALINGMODE:number;
		static GRAVITY:number;
		static THREEDSTARTROTATION:number;
		static STRETCHEDBILLBOARDLENGTHSCALE:number;
		static STRETCHEDBILLBOARDSPEEDSCALE:number;
		static SIMULATIONSPACE:number;
		static CURRENTTIME:number;
		static VOLVELOCITYCONST:number;
		static VOLVELOCITYGRADIENTX:number;
		static VOLVELOCITYGRADIENTY:number;
		static VOLVELOCITYGRADIENTZ:number;
		static VOLVELOCITYCONSTMAX:number;
		static VOLVELOCITYGRADIENTXMAX:number;
		static VOLVELOCITYGRADIENTYMAX:number;
		static VOLVELOCITYGRADIENTZMAX:number;
		static VOLSPACETYPE:number;
		static COLOROVERLIFEGRADIENTALPHAS:number;
		static COLOROVERLIFEGRADIENTCOLORS:number;
		static MAXCOLOROVERLIFEGRADIENTALPHAS:number;
		static MAXCOLOROVERLIFEGRADIENTCOLORS:number;
		static SOLSIZEGRADIENT:number;
		static SOLSIZEGRADIENTX:number;
		static SOLSIZEGRADIENTY:number;
		static SOLSizeGradientZ:number;
		static SOLSizeGradientMax:number;
		static SOLSIZEGRADIENTXMAX:number;
		static SOLSIZEGRADIENTYMAX:number;
		static SOLSizeGradientZMAX:number;
		static ROLANGULARVELOCITYCONST:number;
		static ROLANGULARVELOCITYCONSTSEPRARATE:number;
		static ROLANGULARVELOCITYGRADIENT:number;
		static ROLANGULARVELOCITYGRADIENTX:number;
		static ROLANGULARVELOCITYGRADIENTY:number;
		static ROLANGULARVELOCITYGRADIENTZ:number;
		static ROLANGULARVELOCITYCONSTMAX:number;
		static ROLANGULARVELOCITYCONSTMAXSEPRARATE:number;
		static ROLANGULARVELOCITYGRADIENTMAX:number;
		static ROLANGULARVELOCITYGRADIENTXMAX:number;
		static ROLANGULARVELOCITYGRADIENTYMAX:number;
		static ROLANGULARVELOCITYGRADIENTZMAX:number;
		static ROLANGULARVELOCITYGRADIENTWMAX:number;
		static TEXTURESHEETANIMATIONCYCLES:number;
		static TEXTURESHEETANIMATIONSUBUVLENGTH:number;
		static TEXTURESHEETANIMATIONGRADIENTUVS:number;
		static TEXTURESHEETANIMATIONGRADIENTMAXUVS:number;
	}

}

declare module laya.d3.core {
	class RenderableSprite3D extends laya.d3.core.Sprite3D  {
		static SHADERDEFINE_RECEIVE_SHADOW:number;
		static SHADERDEFINE_SCALEOFFSETLIGHTINGMAPUV:number;
		static SAHDERDEFINE_LIGHTMAP:number;
		static LIGHTMAPSCALEOFFSET:number;
		static LIGHTMAP:number;
		static PICKCOLOR:number;
		pickColor:laya.d3.math.Vector4;
		static shaderDefines:laya.d3.shader.ShaderDefines;

		constructor(name:string);
		protected _onInActive():void;
		protected _onActive():void;
		protected _onActiveInScene():void;
		_setBelongScene(scene:laya.display.Node):void;
		_setUnBelongScene():void;
		protected _changeHierarchyAnimator(animator:laya.d3.component.Animator):void;
		destroy(destroyChild?:boolean):void;
	}

}

declare module laya.d3.core.particleShuriKen.module {
	class ColorOverLifetime  {
		private _color:any;
		enbale:boolean;
		readonly color:laya.d3.core.particleShuriKen.module.GradientColor;

		constructor(color:laya.d3.core.particleShuriKen.module.GradientColor);
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.d3.core.render {
	class BaseRender extends laya.events.EventDispatcher implements laya.resource.ISingletonElement,laya.d3.core.scene.IOctreeObject  {
		_supportOctree:boolean;
		sortingFudge:number;
		readonly id:number;
		lightmapIndex:number;
		lightmapScaleOffset:laya.d3.math.Vector4;
		enable:boolean;
		material:laya.d3.core.material.BaseMaterial;
		materials:laya.d3.core.material.BaseMaterial[];
		sharedMaterial:laya.d3.core.material.BaseMaterial;
		sharedMaterials:laya.d3.core.material.BaseMaterial[];
		readonly bounds:laya.d3.core.Bounds;
		receiveShadow:boolean;
		castShadow:boolean;
		readonly isPartOfStaticBatch:boolean;
		_getOctreeNode():laya.d3.core.scene.BoundsOctreeNode;
		_setOctreeNode(value:laya.d3.core.scene.BoundsOctreeNode):void;
		_getIndexInMotionList():number;
		_setIndexInMotionList(value:number):void;
		_getIndexInList():number;
		_setIndexInList(index:number):void;
	}

}

declare module laya.d3.physics.shape {
	class CapsuleColliderShape extends laya.d3.physics.shape.ColliderShape  {
		readonly radius:number;
		readonly length:number;
		readonly orientation:number;

		constructor(radius?:number,length?:number,orientation?:number);
		_setScale(value:laya.d3.math.Vector3):void;
		clone():any;
	}

}

declare module laya.d3.math {
	class Vector3 implements laya.d3.core.IClone  {
		static distanceSquared(value1:Vector3,value2:Vector3):number;
		static distance(value1:Vector3,value2:Vector3):number;
		static min(a:Vector3,b:Vector3,out:Vector3):void;
		static max(a:Vector3,b:Vector3,out:Vector3):void;
		static transformQuat(source:Vector3,rotation:laya.d3.math.Quaternion,out:Vector3):void;
		static scalarLength(a:Vector3):number;
		static scalarLengthSquared(a:Vector3):number;
		static normalize(s:Vector3,out:Vector3):void;
		static multiply(a:Vector3,b:Vector3,out:Vector3):void;
		static scale(a:Vector3,b:number,out:Vector3):void;
		static lerp(a:Vector3,b:Vector3,t:number,out:Vector3):void;
		static transformV3ToV3(vector:Vector3,transform:laya.d3.math.Matrix4x4,result:Vector3):void;
		static transformV3ToV4(vector:Vector3,transform:laya.d3.math.Matrix4x4,result:laya.d3.math.Vector4):void;
		static TransformNormal(normal:Vector3,transform:laya.d3.math.Matrix4x4,result:Vector3):void;
		static transformCoordinate(coordinate:Vector3,transform:laya.d3.math.Matrix4x4,result:Vector3):void;
		static Clamp(value:Vector3,min:Vector3,max:Vector3,out:Vector3):void;
		static add(a:Vector3,b:Vector3,out:Vector3):void;
		static subtract(a:Vector3,b:Vector3,o:Vector3):void;
		static cross(a:Vector3,b:Vector3,o:Vector3):void;
		static dot(a:Vector3,b:Vector3):number;
		static equals(a:Vector3,b:Vector3):boolean;
		x:number;
		y:number;
		z:number;

		constructor(x?:number,y?:number,z?:number,nativeElements?:Float32Array);
		setValue(x:number,y:number,z:number):void;
		fromArray(array:any[],offset?:number):void;
		cloneTo(destObject:any):void;
		clone():any;
		toDefault():void;
		forNativeElement(nativeElements?:Float32Array):void;
	}

}

declare module laya.display.cmd {
	class FillBorderTextCmd  {
		static ID:string;
		text:string;
		x:number;
		y:number;
		font:string;
		fillColor:string;
		borderColor:string;
		lineWidth:number;
		textAlign:string;
		static create(text:string,x:number,y:number,font:string,fillColor:string,borderColor:string,lineWidth:number,textAlign:string):FillBorderTextCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.ui {
	interface ISelect{
		selected:boolean;
		clickHandler:laya.utils.Handler;
	}

}

declare module laya.utils {
	class Pool  {
		private static _CLSID:any;
		private static POOLSIGN:any;
		private static _poolDic:any;
		static getPoolBySign(sign:string):any[];
		static clearBySign(sign:string):void;
		static recover(sign:string,item:any):void;
		static recoverByClass(instance:any):void;
		private static _getClassSign:any;
		static createByClass(cls:new () => any):any;
		static getItemByClass(sign:string,cls:new () => any):any;
		static getItemByCreateFun(sign:string,createFun:Function,caller?:any):any;
		static getItem(sign:string):any;
	}

}

declare module laya.webgl.utils {
	class ShaderNode  {
		private static __id:any;
		childs:any[];
		text:string;
		parent:ShaderNode;
		name:string;
		noCompile:boolean;
		includefiles:any[];
		condition:any;
		conditionType:number;
		useFuns:string;
		z:number;
		src:string;

		constructor(includefiles:any[]);
		setParent(parent:ShaderNode):void;
		setCondition(condition:string,type:number):void;
		toscript(def:any,out:any[]):any[];
		private _toscript:any;
	}

}

declare module laya.d3.core.pixelLine {
	class PixelLineMaterial extends laya.d3.core.material.BaseMaterial  {
		static COLOR:number;
		static defaultMaterial:PixelLineMaterial;
		static CULL:number;
		static BLEND:number;
		static BLEND_SRC:number;
		static BLEND_DST:number;
		static DEPTH_TEST:number;
		static DEPTH_WRITE:number;
		color:laya.d3.math.Vector4;
		depthWrite:boolean;
		cull:number;
		blend:number;
		blendSrc:number;
		blendDst:number;
		depthTest:number;

		constructor();
		clone():any;
	}

}

declare module laya.d3.core.material {
	class SkyBoxMaterial extends laya.d3.core.material.BaseMaterial  {
		static TINTCOLOR:number;
		static EXPOSURE:number;
		static ROTATION:number;
		static TEXTURECUBE:number;
		static defaultMaterial:SkyBoxMaterial;
		tintColor:laya.d3.math.Vector4;
		exposure:number;
		rotation:number;
		textureCube:laya.d3.resource.TextureCube;
		clone():any;

		constructor();
	}

}

declare module laya.d3.core.particleShuriKen.module {
	class Emission implements laya.d3.core.IClone,laya.resource.IDestroy  {
		private _destroyed:any;
		private _emissionRate:any;
		enbale:boolean;
		emissionRate:number;
		readonly destroyed:boolean;

		constructor();
		destroy():void;
		getBurstsCount():number;
		getBurstByIndex(index:number):laya.d3.core.particleShuriKen.module.Burst;
		addBurst(burst:laya.d3.core.particleShuriKen.module.Burst):void;
		removeBurst(burst:laya.d3.core.particleShuriKen.module.Burst):void;
		removeBurstByIndex(index:number):void;
		clearBurst():void;
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.d3.physics.shape {
	class ColliderShape implements laya.d3.core.IClone  {
		needsCustomCollisionCallback:boolean;
		readonly type:number;
		localOffset:laya.d3.math.Vector3;
		localRotation:laya.d3.math.Quaternion;

		constructor();
		updateLocalTransformations():void;
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.d3.core {
	class SkinnedMeshRenderer extends laya.d3.core.MeshRenderer  {
		localBounds:laya.d3.core.Bounds;
		rootBone:laya.d3.core.Sprite3D;
		readonly bones:laya.d3.core.Sprite3D[];

		constructor(owner:laya.d3.core.RenderableSprite3D);
		private _computeSkinnedData:any;
		_createRenderElement():laya.d3.core.render.RenderElement;
		_onMeshChange(value:laya.d3.resource.models.Mesh):void;
		protected _calculateBoundingBox():void;
		_renderUpdate(context:laya.d3.core.render.RenderContext3D,transform:laya.d3.core.Transform3D):void;
		_renderUpdateWithCamera(context:laya.d3.core.render.RenderContext3D,transform:laya.d3.core.Transform3D):void;
		_destroy():void;
		readonly bounds:laya.d3.core.Bounds;
	}

}

declare module laya.d3.core.scene {
	class BoundsOctree  {

		constructor(initialWorldSize:number,initialWorldPos:laya.d3.math.Vector3,minNodeSize:number,looseness:number);
		add(object:laya.d3.core.scene.IOctreeObject):void;
		remove(object:laya.d3.core.scene.IOctreeObject):boolean;
		update(object:laya.d3.core.scene.IOctreeObject):boolean;
		shrinkRootIfPossible():void;
		addMotionObject(object:laya.d3.core.scene.IOctreeObject):void;
		removeMotionObject(object:laya.d3.core.scene.IOctreeObject):void;
		updateMotionObjects():void;
		isCollidingWithBoundBox(checkBounds:laya.d3.math.BoundBox):boolean;
		isCollidingWithRay(ray:laya.d3.math.Ray,maxDistance?:number):boolean;
		getCollidingWithBoundBox(checkBound:laya.d3.math.BoundBox,result:any[]):void;
		getCollidingWithRay(ray:laya.d3.math.Ray,result:any[],maxDistance?:number):void;
		getCollidingWithFrustum(context:laya.d3.core.render.RenderContext3D,shader:laya.d3.shader.Shader3D,replacementTag:string):void;
		getMaxBounds():laya.d3.math.BoundBox;
	}

}

declare module laya.d3.math {
	class Vector4 implements laya.d3.core.IClone  {
		static ZERO:Vector4;
		static ONE:Vector4;
		static UnitX:Vector4;
		static UnitY:Vector4;
		static UnitZ:Vector4;
		static UnitW:Vector4;
		x:number;
		y:number;
		z:number;
		w:number;

		constructor(x?:number,y?:number,z?:number,w?:number);
		setValue(x:number,y:number,z:number,w:number):void;
		fromArray(array:any[],offset?:number):void;
		cloneTo(destObject:any):void;
		clone():any;
		static lerp(a:Vector4,b:Vector4,t:number,out:Vector4):void;
		static transformByM4x4(vector4:Vector4,m4x4:laya.d3.math.Matrix4x4,out:Vector4):void;
		static equals(a:Vector4,b:Vector4):boolean;
		length():number;
		lengthSquared():number;
		static normalize(s:Vector4,out:Vector4):void;
		static add(a:Vector4,b:Vector4,out:Vector4):void;
		static subtract(a:Vector4,b:Vector4,out:Vector4):void;
		static multiply(a:Vector4,b:Vector4,out:Vector4):void;
		static scale(a:Vector4,b:number,out:Vector4):void;
		static Clamp(value:Vector4,min:Vector4,max:Vector4,out:Vector4):void;
		static distanceSquared(value1:Vector4,value2:Vector4):number;
		static distance(value1:Vector4,value2:Vector4):number;
		static dot(a:Vector4,b:Vector4):number;
		static min(a:Vector4,b:Vector4,out:Vector4):void;
		static max(a:Vector4,b:Vector4,out:Vector4):void;
		forNativeElement(nativeElements?:Float32Array):void;
	}

}

declare module laya.display.cmd {
	class FillBorderWordsCmd  {
		static ID:string;
		words:any[];
		x:number;
		y:number;
		font:string;
		fillColor:string;
		borderColor:string;
		lineWidth:number;
		static create(words:any[],x:number,y:number,font:string,fillColor:string,borderColor:string,lineWidth:number):FillBorderWordsCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.ui {
	class IUI  {
		static Dialog:laya.ui.Dialog;
	}

}

declare module laya.d3.core.particleShuriKen {
	class ShurikenParticleMaterial extends laya.d3.core.material.BaseMaterial  {
		static RENDERMODE_ALPHABLENDED:number;
		static RENDERMODE_ADDTIVE:number;
		static SHADERDEFINE_DIFFUSEMAP:number;
		static SHADERDEFINE_TINTCOLOR:number;
		static SHADERDEFINE_TILINGOFFSET:number;
		static SHADERDEFINE_ADDTIVEFOG:number;
		static DIFFUSETEXTURE:number;
		static TINTCOLOR:number;
		static TILINGOFFSET:number;
		static CULL:number;
		static BLEND:number;
		static BLEND_SRC:number;
		static BLEND_DST:number;
		static DEPTH_TEST:number;
		static DEPTH_WRITE:number;
		static defaultMaterial:ShurikenParticleMaterial;
		renderMode:number;
		colorR:number;
		colorG:number;
		colorB:number;
		colorA:number;
		color:laya.d3.math.Vector4;
		tilingOffsetX:number;
		tilingOffsetY:number;
		tilingOffsetZ:number;
		tilingOffsetW:number;
		tilingOffset:laya.d3.math.Vector4;
		texture:laya.resource.BaseTexture;
		depthWrite:boolean;
		cull:number;
		blend:number;
		blendSrc:number;
		blendDst:number;
		depthTest:number;

		constructor();
		clone():any;
	}

}

declare module laya.utils {
	class PoolCache  {
		sign:string;
		maxCount:number;
		getCacheList():any[];
		tryDispose(force:boolean):void;
		static addPoolCacheManager(sign:string,maxCount?:number):void;
	}

}

declare module laya.d3.core.render {
	class BloomEffect extends laya.d3.core.render.PostProcessEffect  {
		clamp:number;
		color:laya.d3.math.Color;
		fastMode:boolean;
		dirtTexture:laya.resource.Texture2D;
		intensity:number;
		threshold:number;
		softKnee:number;
		diffusion:number;
		anamorphicRatio:number;
		dirtIntensity:number;

		constructor();
		render(context:laya.d3.core.render.PostProcessRenderContext):void;
	}

}

declare module laya.d3.core.pixelLine {
	class PixelLineRenderer extends laya.d3.core.render.BaseRender  {

		constructor(owner:laya.d3.core.pixelLine.PixelLineSprite3D);
		protected _calculateBoundingBox():void;
		_renderUpdateWithCamera(context:laya.d3.core.render.RenderContext3D,transform:laya.d3.core.Transform3D):void;
	}

}

declare module laya.d3.core.material {
	class SkyProceduralMaterial extends laya.d3.core.material.BaseMaterial  {
		static SUN_NODE:number;
		static SUN_SIMPLE:number;
		static SUN_HIGH_QUALITY:number;
		static defaultMaterial:SkyProceduralMaterial;
		private _sunDisk:any;
		sunDisk:number;
		sunSize:number;
		sunSizeConvergence:number;
		atmosphereThickness:number;
		skyTint:laya.d3.math.Vector4;
		groundTint:laya.d3.math.Vector4;
		exposure:number;

		constructor();
		clone():any;
	}

}

declare module laya.webgl.utils {
	class VertexBuffer2D extends laya.webgl.utils.Buffer2D  {
		static create:Function;
		_floatArray32:Float32Array;
		_uint32Array:Uint32Array;
		private _vertexStride:any;
		readonly vertexStride:number;

		constructor(vertexStride:number,bufferUsage:number);
		getFloat32Array():Float32Array;
		appendArray(data:any[]):void;
		protected _checkArrayUse():void;
		deleteBuffer():void;
		_bindForVAO():void;
		bind():boolean;
		destroy():void;
	}

}

declare module laya.d3.core.particleShuriKen.module {
	class FrameOverTime implements laya.d3.core.IClone  {
		static createByConstant(constant:number):FrameOverTime;
		static createByOverTime(overTime:laya.d3.core.particleShuriKen.module.GradientDataInt):FrameOverTime;
		static createByRandomTwoConstant(constantMin:number,constantMax:number):FrameOverTime;
		static createByRandomTwoOverTime(gradientFrameMin:laya.d3.core.particleShuriKen.module.GradientDataInt,gradientFrameMax:laya.d3.core.particleShuriKen.module.GradientDataInt):FrameOverTime;
		private _type:any;
		private _constant:any;
		private _overTime:any;
		private _constantMin:any;
		private _constantMax:any;
		private _overTimeMin:any;
		private _overTimeMax:any;
		readonly type:number;
		readonly constant:number;
		readonly frameOverTimeData:laya.d3.core.particleShuriKen.module.GradientDataInt;
		readonly constantMin:number;
		readonly constantMax:number;
		readonly frameOverTimeDataMin:laya.d3.core.particleShuriKen.module.GradientDataInt;
		readonly frameOverTimeDataMax:laya.d3.core.particleShuriKen.module.GradientDataInt;

		constructor();
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.d3.physics.shape {
	class CompoundColliderShape extends laya.d3.physics.shape.ColliderShape  {

		constructor();
		_addReference():void;
		_removeReference():void;
		addChildShape(shape:laya.d3.physics.shape.ColliderShape):void;
		removeChildShape(shape:laya.d3.physics.shape.ColliderShape):void;
		clearChildShape():void;
		getChildShapeCount():number;
		cloneTo(destObject:any):void;
		clone():any;
		destroy():void;
	}

}

declare module laya.d3.core {
	class SkinnedMeshSprite3D extends laya.d3.core.RenderableSprite3D  {
		static BONES:number;
		readonly meshFilter:laya.d3.core.MeshFilter;
		readonly skinnedMeshRenderer:laya.d3.core.SkinnedMeshRenderer;

		constructor(mesh?:laya.d3.resource.models.Mesh,name?:string);
		_parse(data:any,spriteMap:any):void;
		protected _changeHierarchyAnimator(animator:laya.d3.component.Animator):void;
		protected _changeAnimatorAvatar(avatar:laya.d3.core.Avatar):void;
		_cloneTo(destObject:any,srcRoot:laya.display.Node,dstRoot:laya.display.Node):void;
		destroy(destroyChild?:boolean):void;
	}

}

declare module laya.d3.core.scene {
	class BoundsOctreeNode  {

		constructor(octree:laya.d3.core.scene.BoundsOctree,parent:BoundsOctreeNode,baseLength:number,center:laya.d3.math.Vector3);
		add(object:laya.d3.core.scene.IOctreeObject):boolean;
		remove(object:laya.d3.core.scene.IOctreeObject):boolean;
		update(object:laya.d3.core.scene.IOctreeObject):boolean;
		shrinkIfPossible(minLength:number):BoundsOctreeNode;
		hasAnyObjects():boolean;
		getCollidingWithBoundBox(checkBound:laya.d3.math.BoundBox,result:any[]):void;
		getCollidingWithRay(ray:laya.d3.math.Ray,result:any[],maxDistance?:number):void;
		getCollidingWithFrustum(context:laya.d3.core.render.RenderContext3D,customShader:laya.d3.shader.Shader3D,replacementTag:string):void;
		isCollidingWithBoundBox(checkBound:laya.d3.math.BoundBox):boolean;
		isCollidingWithRay(ray:laya.d3.math.Ray,maxDistance?:number):boolean;
		getBound():laya.d3.math.BoundBox;
	}

}

declare module laya.d3.math {
	class Viewport  {
		private static _tempMatrix4x4:any;
		x:number;
		y:number;
		width:number;
		height:number;
		minDepth:number;
		maxDepth:number;

		constructor(x:number,y:number,width:number,height:number);
		project(source:laya.d3.math.Vector3,matrix:laya.d3.math.Matrix4x4,out:laya.d3.math.Vector3):void;
		unprojectFromMat(source:laya.d3.math.Vector3,matrix:laya.d3.math.Matrix4x4,out:laya.d3.math.Vector3):void;
		unprojectFromWVP(source:laya.d3.math.Vector3,projection:laya.d3.math.Matrix4x4,view:laya.d3.math.Matrix4x4,world:laya.d3.math.Matrix4x4,out:laya.d3.math.Vector3):void;
		cloneTo(out:Viewport):void;
	}

}

declare module laya.display.cmd {
	class FillTextCmd  {
		static ID:string;
		private _text:any;
		x:number;
		y:number;
		private _font:any;
		private _color:any;
		private _textAlign:any;
		private _fontColor:any;
		private _strokeColor:any;
		private static _defFontObj:any;
		private _fontObj:any;
		private _nTexAlign:any;
		static create(text:string|laya.utils.WordText,x:number,y:number,font:string,color:string,textAlign:string):FillTextCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
		text:string|laya.utils.WordText;
		font:string;
		color:string;
		textAlign:string;
	}

}

declare module laya.ui {
	class Label extends laya.ui.UIComponent  {
		protected _tf:laya.display.Text;

		constructor(text?:string);
		destroy(destroyChild?:boolean):void;
		protected createChildren():void;
		text:string;
		changeText(text:string):void;
		wordWrap:boolean;
		color:string;
		font:string;
		align:string;
		valign:string;
		bold:boolean;
		italic:boolean;
		leading:number;
		fontSize:number;
		padding:string;
		bgColor:string;
		borderColor:string;
		stroke:number;
		strokeColor:string;
		readonly textField:laya.display.Text;
		protected measureWidth():number;
		protected measureHeight():number;
		width:number;
		height:number;
		dataSource:any;
		overflow:string;
		underline:boolean;
		underlineColor:string;
	}

}

declare module laya.d3.core.particleShuriKen {
	class ShurikenParticleRenderer extends laya.d3.core.render.BaseRender  {
		stretchedBillboardCameraSpeedScale:number;
		stretchedBillboardSpeedScale:number;
		stretchedBillboardLengthScale:number;
		renderMode:number;
		mesh:laya.d3.resource.models.Mesh;

		constructor(owner:laya.d3.core.particleShuriKen.ShuriKenParticle3D);
		protected _calculateBoundingBox():void;
		_needRender(boundFrustum:laya.d3.math.BoundFrustum):boolean;
		_renderUpdate(context:laya.d3.core.render.RenderContext3D,transfrom:laya.d3.core.Transform3D):void;
		readonly bounds:laya.d3.core.Bounds;
		_destroy():void;
	}

}

declare module laya.utils {
	class RunDriver  {
		static createShaderCondition:Function;
		static changeWebGLSize:Function;
	}

}

declare module laya.d3.core.render {
	class PostProcessEffect  {

		constructor();
	}

}

declare module laya.d3.core.pixelLine {
	class PixelLineSprite3D extends laya.d3.core.RenderableSprite3D  {
		maxLineCount:number;
		lineCount:number;
		readonly pixelLineRenderer:laya.d3.core.pixelLine.PixelLineRenderer;

		constructor(maxCount?:number,name?:string);
		_changeRenderObjects(sender:laya.d3.core.pixelLine.PixelLineRenderer,index:number,material:laya.d3.core.material.BaseMaterial):void;
		addLine(startPosition:laya.d3.math.Vector3,endPosition:laya.d3.math.Vector3,startColor:laya.d3.math.Color,endColor:laya.d3.math.Color):void;
		addLines(lines:laya.d3.core.pixelLine.PixelLineData[]):void;
		removeLine(index:number):void;
		setLine(index:number,startPosition:laya.d3.math.Vector3,endPosition:laya.d3.math.Vector3,startColor:laya.d3.math.Color,endColor:laya.d3.math.Color):void;
		getLine(index:number,out:laya.d3.core.pixelLine.PixelLineData):void;
		clear():void;
	}

}

declare module laya.d3.core.material {
	class UnlitMaterial extends laya.d3.core.material.BaseMaterial  {
		static RENDERMODE_OPAQUE:number;
		static RENDERMODE_CUTOUT:number;
		static RENDERMODE_TRANSPARENT:number;
		static RENDERMODE_ADDTIVE:number;
		static SHADERDEFINE_ALBEDOTEXTURE:number;
		static SHADERDEFINE_TILINGOFFSET:number;
		static SHADERDEFINE_ENABLEVERTEXCOLOR:number;
		static ALBEDOTEXTURE:number;
		static ALBEDOCOLOR:number;
		static TILINGOFFSET:number;
		static CULL:number;
		static BLEND:number;
		static BLEND_SRC:number;
		static BLEND_DST:number;
		static DEPTH_TEST:number;
		static DEPTH_WRITE:number;
		static defaultMaterial:UnlitMaterial;
		private _albedoColor:any;
		private _albedoIntensity:any;
		private _enableVertexColor:any;
		albedoColorR:number;
		albedoColorG:number;
		albedoColorB:number;
		albedoColorA:number;
		albedoColor:laya.d3.math.Vector4;
		albedoIntensity:number;
		albedoTexture:laya.resource.BaseTexture;
		tilingOffsetX:number;
		tilingOffsetY:number;
		tilingOffsetZ:number;
		tilingOffsetW:number;
		tilingOffset:laya.d3.math.Vector4;
		enableVertexColor:boolean;
		renderMode:number;
		depthWrite:boolean;
		cull:number;
		blend:number;
		blendSrc:number;
		blendDst:number;
		depthTest:number;

		constructor();
		clone():any;
	}

}

declare module laya.d3.physics.shape {
	class ConeColliderShape extends laya.d3.physics.shape.ColliderShape  {
		private _orientation:any;
		private _radius:any;
		private _height:any;
		readonly radius:number;
		readonly height:number;
		readonly orientation:number;

		constructor(radius?:number,height?:number,orientation?:number);
		clone():any;
	}

}

declare module laya.d3.core.particleShuriKen.module {
	class GradientAngularVelocity implements laya.d3.core.IClone  {
		static createByConstant(constant:number):GradientAngularVelocity;
		static createByConstantSeparate(separateConstant:laya.d3.math.Vector3):GradientAngularVelocity;
		static createByGradient(gradient:laya.d3.core.particleShuriKen.module.GradientDataNumber):GradientAngularVelocity;
		static createByGradientSeparate(gradientX:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientY:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientZ:laya.d3.core.particleShuriKen.module.GradientDataNumber):GradientAngularVelocity;
		static createByRandomTwoConstant(constantMin:number,constantMax:number):GradientAngularVelocity;
		static createByRandomTwoConstantSeparate(separateConstantMin:laya.d3.math.Vector3,separateConstantMax:laya.d3.math.Vector3):GradientAngularVelocity;
		static createByRandomTwoGradient(gradientMin:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientMax:laya.d3.core.particleShuriKen.module.GradientDataNumber):GradientAngularVelocity;
		static createByRandomTwoGradientSeparate(gradientXMin:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientXMax:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientYMin:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientYMax:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientZMin:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientZMax:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientWMin:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientWMax:laya.d3.core.particleShuriKen.module.GradientDataNumber):GradientAngularVelocity;
		private _type:any;
		private _separateAxes:any;
		private _constant:any;
		private _constantSeparate:any;
		private _gradient:any;
		private _gradientX:any;
		private _gradientY:any;
		private _gradientZ:any;
		private _gradientW:any;
		private _constantMin:any;
		private _constantMax:any;
		private _constantMinSeparate:any;
		private _constantMaxSeparate:any;
		private _gradientMin:any;
		private _gradientMax:any;
		private _gradientXMin:any;
		private _gradientXMax:any;
		private _gradientYMin:any;
		private _gradientYMax:any;
		private _gradientZMin:any;
		private _gradientZMax:any;
		private _gradientWMin:any;
		private _gradientWMax:any;
		readonly type:number;
		readonly separateAxes:boolean;
		readonly constant:number;
		readonly constantSeparate:laya.d3.math.Vector3;
		readonly gradient:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientX:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientY:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientZ:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientW:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly constantMin:number;
		readonly constantMax:number;
		readonly constantMinSeparate:laya.d3.math.Vector3;
		readonly constantMaxSeparate:laya.d3.math.Vector3;
		readonly gradientMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientXMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientXMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientYMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientYMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientZMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientZMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientWMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientWMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		constructor();
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.d3.core {
	class SkinnedMeshSprite3DShaderDeclaration  {
		static SHADERDEFINE_BONE:number;
	}

}

declare module laya.d3.core.scene {
	interface IOctreeObject{
		_getOctreeNode():laya.d3.core.scene.BoundsOctreeNode;
		_setOctreeNode(value:laya.d3.core.scene.BoundsOctreeNode):void;
		_getIndexInMotionList():number;
		_setIndexInMotionList(value:number):void;
		bounds:laya.d3.core.Bounds;
	}

}

declare module laya.display.cmd {
	class FillTextureCmd  {
		static ID:string;
		texture:laya.resource.Texture;
		x:number;
		y:number;
		width:number;
		height:number;
		type:string;
		offset:laya.maths.Point;
		other:any;
		static create(texture:laya.resource.Texture,x:number,y:number,width:number,height:number,type:string,offset:laya.maths.Point,other:any):FillTextureCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.ui {
	class LayoutBox extends laya.ui.Box  {
		protected _space:number;
		protected _align:string;
		protected _itemChanged:boolean;
		addChild(child:laya.display.Node):laya.display.Node;
		private onResize:any;
		addChildAt(child:laya.display.Node,index:number):laya.display.Node;
		removeChildAt(index:number):laya.display.Node;
		refresh():void;
		protected changeItems():void;
		space:number;
		align:string;
		protected sortItem(items:any[]):void;
		protected _setItemChanged():void;
	}

}

declare module laya.d3.core.particleShuriKen {
	class ShurikenParticleSystem extends laya.d3.core.GeometryElement implements laya.d3.core.IClone  {
		duration:number;
		looping:boolean;
		prewarm:boolean;
		startDelayType:number;
		startDelay:number;
		startDelayMin:number;
		startDelayMax:number;
		startSpeedType:number;
		startSpeedConstant:number;
		startSpeedConstantMin:number;
		startSpeedConstantMax:number;
		threeDStartSize:boolean;
		startSizeType:number;
		startSizeConstant:number;
		startSizeConstantSeparate:laya.d3.math.Vector3;
		startSizeConstantMin:number;
		startSizeConstantMax:number;
		startSizeConstantMinSeparate:laya.d3.math.Vector3;
		startSizeConstantMaxSeparate:laya.d3.math.Vector3;
		threeDStartRotation:boolean;
		startRotationType:number;
		startRotationConstant:number;
		startRotationConstantSeparate:laya.d3.math.Vector3;
		startRotationConstantMin:number;
		startRotationConstantMax:number;
		startRotationConstantMinSeparate:laya.d3.math.Vector3;
		startRotationConstantMaxSeparate:laya.d3.math.Vector3;
		randomizeRotationDirection:number;
		startColorType:number;
		startColorConstant:laya.d3.math.Vector4;
		startColorConstantMin:laya.d3.math.Vector4;
		startColorConstantMax:laya.d3.math.Vector4;
		gravityModifier:number;
		simulationSpace:number;
		scaleMode:number;
		playOnAwake:boolean;
		randomSeed:Uint32Array;
		autoRandomSeed:boolean;
		isPerformanceMode:boolean;
		maxParticles:number;
		readonly emission:laya.d3.core.particleShuriKen.module.Emission;
		readonly aliveParticleCount:number;
		readonly emissionTime:number;
		shape:laya.d3.core.particleShuriKen.module.shape.BaseShape;
		readonly isAlive:boolean;
		readonly isEmitting:boolean;
		readonly isPlaying:boolean;
		readonly isPaused:boolean;
		startLifetimeType:number;
		startLifetimeConstant:number;
		startLifeTimeGradient:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		startLifetimeConstantMin:number;
		startLifetimeConstantMax:number;
		startLifeTimeGradientMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		startLifeTimeGradientMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		velocityOverLifetime:laya.d3.core.particleShuriKen.module.VelocityOverLifetime;
		colorOverLifetime:laya.d3.core.particleShuriKen.module.ColorOverLifetime;
		sizeOverLifetime:laya.d3.core.particleShuriKen.module.SizeOverLifetime;
		rotationOverLifetime:laya.d3.core.particleShuriKen.module.RotationOverLifetime;
		textureSheetAnimation:laya.d3.core.particleShuriKen.module.TextureSheetAnimation;
		_getVertexBuffer(index?:number):laya.d3.graphics.VertexBuffer3D;
		_getIndexBuffer():laya.d3.graphics.IndexBuffer3D;

		constructor(owner:laya.d3.core.particleShuriKen.ShuriKenParticle3D);
		emit(time:number):boolean;
		addParticle(position:laya.d3.math.Vector3,direction:laya.d3.math.Vector3,time:number):boolean;
		addNewParticlesToVertexBuffer():void;
		_getType():number;
		_prepareRender(state:laya.d3.core.render.RenderContext3D):boolean;
		play():void;
		pause():void;
		simulate(time:number,restart?:boolean):void;
		stop():void;
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.utils {
	class SceneUtils  {
		private static _funMap:any;
		private static _parseWatchData:any;
		private static _parseKeyWord:any;
		static __init():void;
		static getBindFun(value:string):Function;
		static createByData(root:any,uiView:any):any;
		static createInitTool():InitTool;
		static createComp(uiView:any,comp?:any,view?:any,dataMap?:any[],initTool?:InitTool):any;
		private static setCompValue:any;
		static getCompInstance(json:any):any;
	}
	class InitTool  {
		private _nodeRefList:any;
		private _initList:any;
		private _loadList:any;
		reset():void;
		recover():void;
		static create():InitTool;
		addLoadRes(url:string,type?:string):void;
		addNodeRef(node:any,prop:string,referStr:string):void;
		setNodeRef():void;
		getReferData(referStr:string):any;
		addInitItem(item:any):void;
		doInits():void;
		finish():void;
		beginLoad(scene:laya.display.Scene):void;
	}

}

declare module laya.d3.core.render {
	class PostProcessRenderContext  {
		source:laya.d3.resource.RenderTexture;
		destination:laya.d3.resource.RenderTexture;
		camera:laya.d3.core.Camera;
		compositeShaderData:laya.d3.shader.ShaderData;
		command:laya.d3.core.render.command.CommandBuffer;
		deferredReleaseTextures:laya.d3.resource.RenderTexture[];
	}

}

declare module laya.d3.core.material {
	class WaterPrimaryMaterial extends laya.d3.core.material.BaseMaterial  {
		static HORIZONCOLOR:number;
		static MAINTEXTURE:number;
		static NORMALTEXTURE:number;
		static WAVESCALE:number;
		static WAVESPEED:number;
		static SHADERDEFINE_MAINTEXTURE:number;
		static SHADERDEFINE_NORMALTEXTURE:number;
		static defaultMaterial:WaterPrimaryMaterial;
		horizonColor:laya.d3.math.Vector4;
		mainTexture:laya.resource.BaseTexture;
		normalTexture:laya.resource.BaseTexture;
		waveScale:number;
		waveSpeed:laya.d3.math.Vector4;

		constructor();
		clone():any;
	}

}

declare module laya.d3.core.pixelLine {
	class PixelLineVertex  {
		private static _vertexDeclaration:any;
		static readonly vertexDeclaration:laya.d3.graphics.VertexDeclaration;
		readonly vertexDeclaration:laya.d3.graphics.VertexDeclaration;

		constructor();
	}

}

declare module laya.d3.core.particleShuriKen.module {
	class GradientColor implements laya.d3.core.IClone  {
		static createByConstant(constant:laya.d3.math.Vector4):GradientColor;
		static createByGradient(gradient:laya.d3.core.Gradient):GradientColor;
		static createByRandomTwoConstant(minConstant:laya.d3.math.Vector4,maxConstant:laya.d3.math.Vector4):GradientColor;
		static createByRandomTwoGradient(minGradient:laya.d3.core.Gradient,maxGradient:laya.d3.core.Gradient):GradientColor;
		private _type:any;
		private _constant:any;
		private _constantMin:any;
		private _constantMax:any;
		private _gradient:any;
		private _gradientMin:any;
		private _gradientMax:any;
		readonly type:number;
		readonly constant:laya.d3.math.Vector4;
		readonly constantMin:laya.d3.math.Vector4;
		readonly constantMax:laya.d3.math.Vector4;
		readonly gradient:laya.d3.core.Gradient;
		readonly gradientMin:laya.d3.core.Gradient;
		readonly gradientMax:laya.d3.core.Gradient;

		constructor();
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.d3.core.render.command {
	class CommandBuffer  {

		constructor();
		blitScreenQuad(source:laya.resource.BaseTexture,dest:laya.d3.resource.RenderTexture,shader?:laya.d3.shader.Shader3D,shaderData?:laya.d3.shader.ShaderData,subShader?:number):void;
		blitScreenTriangle(source:laya.resource.BaseTexture,dest:laya.d3.resource.RenderTexture,shader?:laya.d3.shader.Shader3D,shaderData?:laya.d3.shader.ShaderData,subShader?:number):void;
	}

}

declare module laya.d3.physics.shape {
	class CylinderColliderShape extends laya.d3.physics.shape.ColliderShape  {
		private static _nativeSize:any;
		private _orientation:any;
		private _radius:any;
		private _height:any;
		readonly radius:number;
		readonly height:number;
		readonly orientation:number;

		constructor(radius?:number,height?:number,orientation?:number);
		clone():any;
	}

}

declare module laya.d3.core {
	class Sprite3D extends laya.display.Node implements laya.resource.ICreateResource  {
		static HIERARCHY:string;
		static instantiate(original:Sprite3D,parent?:laya.display.Node,worldPositionStays?:boolean,position?:laya.d3.math.Vector3,rotation?:laya.d3.math.Quaternion):Sprite3D;
		static load(url:string,complete:laya.utils.Handler):void;
		readonly id:number;
		layer:number;
		readonly url:string;
		readonly isStatic:boolean;
		readonly transform:laya.d3.core.Transform3D;

		constructor(name?:string,isStatic?:boolean);
		_setCreateURL(url:string):void;
		protected _onAdded():void;
		protected _onRemoved():void;
		_parse(data:any,spriteMap:any):void;
		_cloneTo(destObject:any,srcRoot:laya.display.Node,dstRoot:laya.display.Node):void;
		clone():laya.display.Node;
		destroy(destroyChild?:boolean):void;
	}

}

declare module laya.d3.core.scene {
	class OctreeMotionList extends laya.d3.component.SingletonList<laya.d3.core.scene.IOctreeObject>  {

		constructor();
	}

}

declare module laya.display.cmd {
	class FillWordsCmd  {
		static ID:string;
		words:any[];
		x:number;
		y:number;
		font:string;
		color:string;
		static create(words:any[],x:number,y:number,font:string,color:string):FillWordsCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.ui {
	class List extends laya.ui.Box implements laya.ui.IRender,laya.ui.IItem  {
		selectHandler:laya.utils.Handler;
		renderHandler:laya.utils.Handler;
		mouseHandler:laya.utils.Handler;
		selectEnable:boolean;
		totalPage:number;
		protected _content:laya.ui.Box;
		protected _scrollBar:laya.ui.ScrollBar;
		protected _itemRender:any;
		protected _repeatX:number;
		protected _repeatY:number;
		protected _repeatX2:number;
		protected _repeatY2:number;
		protected _spaceX:number;
		protected _spaceY:number;
		protected _cells:laya.ui.Box[];
		protected _array:any[];
		protected _startIndex:number;
		protected _selectedIndex:number;
		protected _page:number;
		protected _isVertical:boolean;
		protected _cellSize:number;
		protected _cellOffset:number;
		protected _isMoved:boolean;
		cacheContent:boolean;
		protected _createdLine:number;
		protected _cellChanged:boolean;
		protected _offset:laya.maths.Point;
		protected _usedCache:string;
		protected _elasticEnabled:boolean;
		destroy(destroyChild?:boolean):void;
		protected createChildren():void;
		cacheAs:string;
		private onScrollStart:any;
		private onScrollEnd:any;
		readonly content:laya.ui.Box;
		vScrollBarSkin:string;
		private _removePreScrollBar:any;
		hScrollBarSkin:string;
		scrollBar:laya.ui.ScrollBar;
		itemRender:any;
		width:number;
		height:number;
		repeatX:number;
		repeatY:number;
		spaceX:number;
		spaceY:number;
		private _getOneCell:any;
		private _createItems:any;
		protected createItem():laya.ui.Box;
		protected addCell(cell:laya.ui.Box):void;
		initItems():void;
		setContentSize(width:number,height:number):void;
		protected onCellMouse(e:laya.events.Event):void;
		protected changeCellState(cell:laya.ui.Box,visible:boolean,index:number):void;
		protected _sizeChanged():void;
		protected onScrollBarChange(e?:laya.events.Event):void;
		private posCell:any;
		selectedIndex:number;
		protected changeSelectStatus():void;
		selectedItem:any;
		selection:laya.ui.Box;
		startIndex:number;
		protected renderItems(from?:number,to?:number):void;
		protected renderItem(cell:laya.ui.Box,index:number):void;
		private _bindData:any;
		array:any[];
		private _preLen:any;
		updateArray(array:any[]):void;
		page:number;
		readonly length:number;
		dataSource:any;
		readonly cells:laya.ui.Box[];
		elasticEnabled:boolean;
		refresh():void;
		getItem(index:number):any;
		changeItem(index:number,source:any):void;
		setItem(index:number,source:any):void;
		addItem(souce:any):void;
		addItemAt(souce:any,index:number):void;
		deleteItem(index:number):void;
		getCell(index:number):laya.ui.Box;
		scrollTo(index:number):void;
		tweenTo(index:number,time?:number,complete?:laya.utils.Handler):void;
		protected _setCellChanged():void;
		protected commitMeasure():void;
	}

}

declare module laya.utils {
	class Stat  {
		static FPS:number;
		static loopCount:number;
		static shaderCall:number;
		static renderBatches:number;
		static savedRenderBatches:number;
		static trianglesFaces:number;
		static spriteCount:number;
		static spriteRenderUseCacheCount:number;
		static frustumCulling:number;
		static octreeNodeCulling:number;
		static canvasNormal:number;
		static canvasBitmap:number;
		static canvasReCache:number;
		static renderSlow:boolean;
		static gpuMemory:number;
		static cpuMemory:number;
		static _fpsStr:string;
		static _canvasStr:string;
		static _spriteStr:string;
		static _fpsData:any[];
		static _timer:number;
		static _count:number;
		static show(x?:number,y?:number):void;
		static enable():void;
		static hide():void;
		static clear():void;
		static onclick:Function;
	}

}

declare module laya.d3.core.render {
	class RenderContext3D  {
		static clientWidth:number;
		static clientHeight:number;

		constructor();
	}

}

declare module laya.d3.core.particleShuriKen.module {
	class GradientDataInt implements laya.d3.core.IClone  {
		private _currentLength:any;
		readonly gradientCount:number;

		constructor();
		add(key:number,value:number):void;
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.d3.physics.shape {
	class HeightfieldColliderShape  {

		constructor();
	}

}

declare module laya.d3.core {
	class TextureMode  {
		static Stretch:number;
		static Tile:number;
	}

}

declare module laya.d3.core.scene {
	class Scene3D extends laya.display.Sprite implements laya.webgl.submit.ISubmit,laya.resource.ICreateResource  {
		static HIERARCHY:string;
		static octreeCulling:boolean;
		static octreeInitialSize:number;
		static octreeInitialCenter:laya.d3.math.Vector3;
		static octreeMinNodeSize:number;
		static octreeLooseness:number;
		static REFLECTIONMODE_SKYBOX:number;
		static REFLECTIONMODE_CUSTOM:number;
		static FOGCOLOR:number;
		static FOGSTART:number;
		static FOGRANGE:number;
		static LIGHTDIRECTION:number;
		static LIGHTDIRCOLOR:number;
		static POINTLIGHTPOS:number;
		static POINTLIGHTRANGE:number;
		static POINTLIGHTATTENUATION:number;
		static POINTLIGHTCOLOR:number;
		static SPOTLIGHTPOS:number;
		static SPOTLIGHTDIRECTION:number;
		static SPOTLIGHTSPOTANGLE:number;
		static SPOTLIGHTRANGE:number;
		static SPOTLIGHTCOLOR:number;
		static SHADOWDISTANCE:number;
		static SHADOWLIGHTVIEWPROJECT:number;
		static SHADOWMAPPCFOFFSET:number;
		static SHADOWMAPTEXTURE1:number;
		static SHADOWMAPTEXTURE2:number;
		static SHADOWMAPTEXTURE3:number;
		static AMBIENTCOLOR:number;
		static REFLECTIONTEXTURE:number;
		static REFLETIONINTENSITY:number;
		static TIME:number;
		static ANGLEATTENUATIONTEXTURE:number;
		static RANGEATTENUATIONTEXTURE:number;
		static POINTLIGHTMATRIX:number;
		static SPOTLIGHTMATRIX:number;
		static load(url:string,complete:laya.utils.Handler):void;
		currentCreationLayer:number;
		enableLight:boolean;
		parallelSplitShadowMaps:laya.d3.shadowMap.ParallelSplitShadowMap[];
		private _time:any;
		readonly url:string;
		enableFog:boolean;
		fogColor:laya.d3.math.Vector3;
		fogStart:number;
		fogRange:number;
		ambientColor:laya.d3.math.Vector3;
		readonly skyRenderer:laya.d3.resource.models.SkyRenderer;
		customReflection:laya.d3.resource.TextureCube;
		reflectionIntensity:number;
		readonly physicsSimulation:laya.d3.physics.PhysicsSimulation;
		reflectionMode:number;
		timer:laya.utils.Timer;
		readonly input:laya.d3.Input3D;

		constructor();
		_setCreateURL(url:string):void;
		_parse(data:any,spriteMap:any):void;
		protected _onActive():void;
		protected _onInActive():void;
		setlightmaps(value:laya.resource.Texture2D[]):void;
		getlightmaps():laya.resource.Texture2D[];
		destroy(destroyChild?:boolean):void;
		render(ctx:laya.resource.Context,x:number,y:number):void;
		renderSubmit():number;
		getRenderType():number;
		releaseRender():void;
		reUse(context:laya.resource.Context,pos:number):number;
	}

}

declare module laya.display.cmd {
	class RestoreCmd  {
		static ID:string;
		static create():RestoreCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.ui {
	class Panel extends laya.ui.Box  {
		protected _content:laya.ui.Box;
		protected _vScrollBar:laya.ui.VScrollBar;
		protected _hScrollBar:laya.ui.HScrollBar;
		protected _scrollChanged:boolean;
		protected _usedCache:string;
		protected _elasticEnabled:boolean;

		constructor();
		destroy(destroyChild?:boolean):void;
		destroyChildren():void;
		protected createChildren():void;
		addChild(child:laya.display.Node):laya.display.Node;
		private onResize:any;
		addChildAt(child:laya.display.Node,index:number):laya.display.Node;
		removeChild(child:laya.display.Node):laya.display.Node;
		removeChildAt(index:number):laya.display.Node;
		removeChildren(beginIndex?:number,endIndex?:number):laya.display.Node;
		getChildAt(index:number):laya.display.Node;
		getChildByName(name:string):laya.display.Node;
		getChildIndex(child:laya.display.Node):number;
		readonly numChildren:number;
		private changeScroll:any;
		protected _sizeChanged():void;
		readonly contentWidth:number;
		readonly contentHeight:number;
		private setContentSize:any;
		width:number;
		height:number;
		vScrollBarSkin:string;
		hScrollBarSkin:string;
		readonly vScrollBar:laya.ui.ScrollBar;
		readonly hScrollBar:laya.ui.ScrollBar;
		readonly content:laya.display.Sprite;
		protected onScrollBarChange(scrollBar:laya.ui.ScrollBar):void;
		scrollTo(x?:number,y?:number):void;
		refresh():void;
		cacheAs:string;
		elasticEnabled:boolean;
		private onScrollStart:any;
		private onScrollEnd:any;
		protected _setScrollChanged():void;
	}

}

declare module laya.utils {
	class StatUI extends laya.utils.IStatRender  {
		private static _fontSize:any;
		private _txt:any;
		private _leftText:any;
		private _canvas:any;
		private _ctx:any;
		private _first:any;
		private _vx:any;
		private _width:any;
		private _height:any;
		private _view:any;
		show(x?:number,y?:number):void;
		private createUIPre:any;
		private createUI:any;
		enable():void;
		hide():void;
		set_onclick(fn:Function):void;
		loop():void;
		private renderInfoPre:any;
		private renderInfo:any;
		isCanvasRender():boolean;
		renderNotCanvas(ctx:any,x:number,y:number):void;
	}

}

declare module laya.d3.core.render {
	class RenderElement  {

		constructor();
	}

}

declare module laya.d3.core.particleShuriKen.module {
	class GradientDataNumber implements laya.d3.core.IClone  {
		private _currentLength:any;
		readonly gradientCount:number;

		constructor();
		add(key:number,value:number):void;
		getKeyByIndex(index:number):number;
		getValueByIndex(index:number):number;
		getAverageValue():number;
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.d3.physics.shape {
	class MeshColliderShape extends laya.d3.physics.shape.ColliderShape  {
		private _mesh:any;
		private _convex:any;
		mesh:laya.d3.resource.models.Mesh;
		convex:boolean;

		constructor();
		_setScale(value:laya.d3.math.Vector3):void;
		cloneTo(destObject:any):void;
		clone():any;
		destroy():void;
	}

}

declare module laya.display.cmd {
	class RotateCmd  {
		static ID:string;
		angle:number;
		pivotX:number;
		pivotY:number;
		static create(angle:number,pivotX:number,pivotY:number):RotateCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.d3.core {
	class Transform3D extends laya.events.EventDispatcher  {
		readonly owner:laya.d3.core.Sprite3D;
		readonly worldNeedUpdate:boolean;
		localPositionX:number;
		localPositionY:number;
		localPositionZ:number;
		localPosition:laya.d3.math.Vector3;
		localRotationX:number;
		localRotationY:number;
		localRotationZ:number;
		localRotationW:number;
		localRotation:laya.d3.math.Quaternion;
		localScaleX:number;
		localScaleY:number;
		localScaleZ:number;
		localScale:laya.d3.math.Vector3;
		localRotationEulerX:number;
		localRotationEulerY:number;
		localRotationEulerZ:number;
		localRotationEuler:laya.d3.math.Vector3;
		localMatrix:laya.d3.math.Matrix4x4;
		position:laya.d3.math.Vector3;
		rotation:laya.d3.math.Quaternion;
		scale:laya.d3.math.Vector3;
		rotationEuler:laya.d3.math.Vector3;
		worldMatrix:laya.d3.math.Matrix4x4;

		constructor(owner:laya.d3.core.Sprite3D);
		translate(translation:laya.d3.math.Vector3,isLocal?:boolean):void;
		rotate(rotation:laya.d3.math.Vector3,isLocal?:boolean,isRadian?:boolean):void;
		getForward(forward:laya.d3.math.Vector3):void;
		getUp(up:laya.d3.math.Vector3):void;
		getRight(right:laya.d3.math.Vector3):void;
		lookAt(target:laya.d3.math.Vector3,up:laya.d3.math.Vector3,isLocal?:boolean):void;
	}

}

declare module laya.d3.core.trail {
enum TrailAlignment {
    View = 0,
    TransformZ = 1
}
}

declare module laya.ui {
	class ProgressBar extends laya.ui.UIComponent  {
		changeHandler:laya.utils.Handler;
		protected _bg:laya.ui.Image;
		protected _bar:laya.ui.Image;
		protected _skin:string;
		protected _value:number;

		constructor(skin?:string);
		destroy(destroyChild?:boolean):void;
		protected createChildren():void;
		skin:string;
		protected _skinLoaded():void;
		protected measureWidth():number;
		protected measureHeight():number;
		value:number;
		protected changeValue():void;
		readonly bar:laya.ui.Image;
		readonly bg:laya.ui.Image;
		sizeGrid:string;
		width:number;
		height:number;
		dataSource:any;
	}

}

declare module laya.utils {
	class StringKey  {
		private _strsToID:any;
		private _idToStrs:any;
		private _length:any;
		add(str:string):number;
		getID(str:string):number;
		getName(id:number):string;
	}

}

declare module laya.d3.core.particleShuriKen.module {
	class GradientDataVector2 implements laya.d3.core.IClone  {
		private _currentLength:any;
		readonly gradientCount:number;

		constructor();
		add(key:number,value:laya.d3.math.Vector2):void;
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.d3.physics.shape {
	class SphereColliderShape extends laya.d3.physics.shape.ColliderShape  {
		private _radius:any;
		readonly radius:number;

		constructor(radius?:number);
		clone():any;
	}

}

declare module laya.display.cmd {
	class SaveCmd  {
		static ID:string;
		static create():SaveCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.d3.core.render {
	class ScreenQuad extends laya.resource.Resource  {

		constructor();
		destroy():void;
	}

}

declare module laya.d3.core {
	class Vector3Keyframe extends laya.d3.core.Keyframe  {
		inTangent:laya.d3.math.Vector3;
		outTangent:laya.d3.math.Vector3;
		value:laya.d3.math.Vector3;

		constructor();
		cloneTo(dest:any):void;
	}

}

declare module laya.d3.core.trail {
	class TrailFilter  {
		static CURTIME:number;
		static LIFETIME:number;
		static WIDTHCURVE:number;
		static WIDTHCURVEKEYLENGTH:number;
		_owner:laya.d3.core.trail.TrailSprite3D;
		_lastPosition:laya.d3.math.Vector3;
		_curtime:number;
		alignment:number;
		time:number;
		minVertexDistance:number;
		widthMultiplier:number;
		widthCurve:laya.d3.core.FloatKeyframe[];
		colorGradient:laya.d3.core.Gradient;
		textureMode:number;

		constructor(owner:laya.d3.core.trail.TrailSprite3D);
		static ALIGNMENT_VIEW:number;
		static ALIGNMENT_TRANSFORM_Z:number;
	}

}

declare module laya.ui {
	class Radio extends laya.ui.Button  {
		protected _value:any;

		constructor(skin?:string,label?:string);
		destroy(destroyChild?:boolean):void;
		protected preinitialize():void;
		protected initialize():void;
		protected onClick(e:laya.events.Event):void;
		value:any;
	}

}

declare module laya.utils {
	class TimeLine extends laya.events.EventDispatcher  {
		private _labelDic:any;
		private _tweenDic:any;
		private _tweenDataList:any;
		private _endTweenDataList:any;
		private _currTime:any;
		private _lastTime:any;
		private _startTime:any;
		private _index:any;
		private _gidIndex:any;
		private _firstTweenDic:any;
		private _startTimeSort:any;
		private _endTimeSort:any;
		private _loopKey:any;
		scale:number;
		private _frameRate:any;
		private _frameIndex:any;
		private _total:any;
		static to(target:any,props:any,duration:number,ease?:Function,offset?:number):TimeLine;
		static from(target:any,props:any,duration:number,ease?:Function,offset?:number):TimeLine;
		to(target:any,props:any,duration:number,ease?:Function,offset?:number):TimeLine;
		from(target:any,props:any,duration:number,ease?:Function,offset?:number):TimeLine;
		private _create:any;
		addLabel(label:string,offset:number):TimeLine;
		removeLabel(label:string):void;
		gotoTime(time:number):void;
		gotoLabel(Label:string):void;
		pause():void;
		resume():void;
		play(timeOrLabel?:any,loop?:boolean):void;
		private _update:any;
		private _animComplete:any;
		private _complete:any;
		index:number;
		readonly total:number;
		reset():void;
		destroy():void;
	}

}

declare module laya.d3.core.scene {
	class Scene3DShaderDeclaration  {
	}

}

declare module laya.d3.core.particleShuriKen.module {
	class GradientSize implements laya.d3.core.IClone  {
		static createByGradient(gradient:laya.d3.core.particleShuriKen.module.GradientDataNumber):GradientSize;
		static createByGradientSeparate(gradientX:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientY:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientZ:laya.d3.core.particleShuriKen.module.GradientDataNumber):GradientSize;
		static createByRandomTwoConstant(constantMin:number,constantMax:number):GradientSize;
		static createByRandomTwoConstantSeparate(constantMinSeparate:laya.d3.math.Vector3,constantMaxSeparate:laya.d3.math.Vector3):GradientSize;
		static createByRandomTwoGradient(gradientMin:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientMax:laya.d3.core.particleShuriKen.module.GradientDataNumber):GradientSize;
		static createByRandomTwoGradientSeparate(gradientXMin:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientXMax:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientYMin:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientYMax:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientZMin:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientZMax:laya.d3.core.particleShuriKen.module.GradientDataNumber):GradientSize;
		private _type:any;
		private _separateAxes:any;
		private _gradient:any;
		private _gradientX:any;
		private _gradientY:any;
		private _gradientZ:any;
		private _constantMin:any;
		private _constantMax:any;
		private _constantMinSeparate:any;
		private _constantMaxSeparate:any;
		private _gradientMin:any;
		private _gradientMax:any;
		private _gradientXMin:any;
		private _gradientXMax:any;
		private _gradientYMin:any;
		private _gradientYMax:any;
		private _gradientZMin:any;
		private _gradientZMax:any;
		readonly type:number;
		readonly separateAxes:boolean;
		readonly gradient:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientX:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientY:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientZ:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly constantMin:number;
		readonly constantMax:number;
		readonly constantMinSeparate:laya.d3.math.Vector3;
		readonly constantMaxSeparate:laya.d3.math.Vector3;
		readonly gradientMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientXMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientXMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientYMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientYMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientZMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientZMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		constructor();
		getMaxSizeInGradient():number;
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.display.cmd {
	class ScaleCmd  {
		static ID:string;
		scaleX:number;
		scaleY:number;
		pivotX:number;
		pivotY:number;
		static create(scaleX:number,scaleY:number,pivotX:number,pivotY:number):ScaleCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.d3.core.render {
	class ScreenTriangle extends laya.resource.Resource  {

		constructor();
		destroy():void;
	}

}

declare module laya.ui {
	class RadioGroup extends laya.ui.UIGroup  {
		protected createItem(skin:string,label:string):laya.display.Sprite;
	}

}

declare module laya.d3.core.trail {
	class TrailGeometry extends laya.d3.core.GeometryElement  {
		static ALIGNMENT_VIEW:number;
		static ALIGNMENT_TRANSFORM_Z:number;
		private tmpColor:any;
		private _disappearBoundsMode:any;

		constructor(owner:laya.d3.core.trail.TrailFilter);
		_getType():number;
		_prepareRender(state:laya.d3.core.render.RenderContext3D):boolean;
		_render(state:laya.d3.core.render.RenderContext3D):void;
		destroy():void;
	}

}

declare module laya.utils {
	class Timer  {
		static gSysTimer:Timer;
		private static _pool:any;
		static _mid:number;
		scale:number;
		currTimer:number;
		currFrame:number;
		private _map:any;
		private _handlers:any;
		private _temp:any;
		private _count:any;

		constructor(autoActive?:boolean);
		readonly delta:number;
		private _clearHandlers:any;
		private _recoverHandler:any;
		private _indexHandler:any;
		once(delay:number,caller:any,method:Function,args?:any[],coverBefore?:boolean):void;
		loop(delay:number,caller:any,method:Function,args?:any[],coverBefore?:boolean,jumpFrame?:boolean):void;
		frameOnce(delay:number,caller:any,method:Function,args?:any[],coverBefore?:boolean):void;
		frameLoop(delay:number,caller:any,method:Function,args?:any[],coverBefore?:boolean):void;
		toString():string;
		clear(caller:any,method:Function):void;
		clearAll(caller:any):void;
		private _getHandler:any;
		callLater(caller:any,method:Function,args?:any[]):void;
		runCallLater(caller:any,method:Function):void;
		runTimer(caller:any,method:Function):void;
		pause():void;
		resume():void;
	}

}

declare module laya.d3.core.scene {
	class SceneManager  {

		constructor();
	}

}

declare module laya.d3.physics.shape {
	class StaticPlaneColliderShape extends laya.d3.physics.shape.ColliderShape  {
		private static _nativeNormal:any;

		constructor(normal:laya.d3.math.Vector3,offset:number);
		clone():any;
	}

}

declare module laya.d3.core.particleShuriKen.module {
	class GradientVelocity implements laya.d3.core.IClone  {
		static createByConstant(constant:laya.d3.math.Vector3):GradientVelocity;
		static createByGradient(gradientX:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientY:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientZ:laya.d3.core.particleShuriKen.module.GradientDataNumber):GradientVelocity;
		static createByRandomTwoConstant(constantMin:laya.d3.math.Vector3,constantMax:laya.d3.math.Vector3):GradientVelocity;
		static createByRandomTwoGradient(gradientXMin:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientXMax:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientYMin:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientYMax:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientZMin:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientZMax:laya.d3.core.particleShuriKen.module.GradientDataNumber):GradientVelocity;
		private _type:any;
		private _constant:any;
		private _gradientX:any;
		private _gradientY:any;
		private _gradientZ:any;
		private _constantMin:any;
		private _constantMax:any;
		private _gradientXMin:any;
		private _gradientXMax:any;
		private _gradientYMin:any;
		private _gradientYMax:any;
		private _gradientZMin:any;
		private _gradientZMax:any;
		readonly type:number;
		readonly constant:laya.d3.math.Vector3;
		readonly gradientX:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientY:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientZ:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly constantMin:laya.d3.math.Vector3;
		readonly constantMax:laya.d3.math.Vector3;
		readonly gradientXMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientXMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientYMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientYMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientZMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;
		readonly gradientZMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		constructor();
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.display.cmd {
	class StrokeTextCmd  {
		static ID:string;
		text:string;
		x:number;
		y:number;
		font:string;
		color:string;
		lineWidth:number;
		textAlign:string;
		static create(text:string,x:number,y:number,font:string,color:string,lineWidth:number,textAlign:string):StrokeTextCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.d3.core.trail {
	class TrailMaterial extends laya.d3.core.material.BaseMaterial  {
		static RENDERMODE_ALPHABLENDED:number;
		static RENDERMODE_ADDTIVE:number;
		static defaultMaterial:TrailMaterial;
		static SHADERDEFINE_MAINTEXTURE:number;
		static SHADERDEFINE_TILINGOFFSET:number;
		static SHADERDEFINE_ADDTIVEFOG:number;
		static MAINTEXTURE:number;
		static TINTCOLOR:number;
		static TILINGOFFSET:number;
		static CULL:number;
		static BLEND:number;
		static BLEND_SRC:number;
		static BLEND_DST:number;
		static DEPTH_TEST:number;
		static DEPTH_WRITE:number;
		renderMode:number;
		colorR:number;
		colorG:number;
		colorB:number;
		colorA:number;
		color:laya.d3.math.Vector4;
		texture:laya.resource.BaseTexture;
		tilingOffsetX:number;
		tilingOffsetY:number;
		tilingOffsetZ:number;
		tilingOffsetW:number;
		tilingOffset:laya.d3.math.Vector4;
		depthWrite:boolean;
		cull:number;
		blend:number;
		blendSrc:number;
		blendDst:number;
		depthTest:number;

		constructor();
		clone():any;
	}

}

declare module laya.ui {
	class ScaleBox extends laya.ui.Box  {
		private _oldW:any;
		private _oldH:any;
		onEnable():void;
		onDisable():void;
		private onResize:any;
		width:number;
		height:number;
	}

}

declare module laya.utils {
	class Tween  {
		private static tweenMap:any;
		private _complete:any;
		private _target:any;
		private _ease:any;
		private _props:any;
		private _duration:any;
		private _delay:any;
		private _startTimer:any;
		private _usedTimer:any;
		private _usedPool:any;
		private _delayParam:any;
		gid:number;
		update:laya.utils.Handler;
		repeat:number;
		private _count:any;
		static to(target:any,props:any,duration:number,ease?:Function,complete?:laya.utils.Handler,delay?:number,coverBefore?:boolean,autoRecover?:boolean):Tween;
		static from(target:any,props:any,duration:number,ease?:Function,complete?:laya.utils.Handler,delay?:number,coverBefore?:boolean,autoRecover?:boolean):Tween;
		to(target:any,props:any,duration:number,ease?:Function,complete?:laya.utils.Handler,delay?:number,coverBefore?:boolean):Tween;
		from(target:any,props:any,duration:number,ease?:Function,complete?:laya.utils.Handler,delay?:number,coverBefore?:boolean):Tween;
		private firstStart:any;
		private _initProps:any;
		private _beginLoop:any;
		private _doEase:any;
		progress:number;
		complete():void;
		pause():void;
		setStartTime(startTime:number):void;
		static clearAll(target:any):void;
		static clear(tween:Tween):void;
		static clearTween(target:any):void;
		clear():void;
		recover():void;
		private _remove:any;
		restart():void;
		resume():void;
		private static easeNone:any;
	}

}

declare module laya.display.cmd {
	class TransformCmd  {
		static ID:string;
		matrix:laya.maths.Matrix;
		pivotX:number;
		pivotY:number;
		static create(matrix:laya.maths.Matrix,pivotX:number,pivotY:number):TransformCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.ui {
	class ScrollBar extends laya.ui.UIComponent  {
		rollRatio:number;
		changeHandler:laya.utils.Handler;
		scaleBar:boolean;
		autoHide:boolean;
		elasticDistance:number;
		elasticBackTime:number;
		upButton:laya.ui.Button;
		downButton:laya.ui.Button;
		slider:laya.ui.Slider;
		protected _showButtons:boolean;
		protected _scrollSize:number;
		protected _skin:string;
		protected _thumbPercent:number;
		protected _target:laya.display.Sprite;
		protected _lastPoint:laya.maths.Point;
		protected _lastOffset:number;
		protected _checkElastic:boolean;
		protected _isElastic:boolean;
		protected _value:number;
		protected _hide:boolean;
		protected _clickOnly:boolean;
		protected _offsets:any[];
		protected _touchScrollEnable:boolean;
		protected _mouseWheelEnable:boolean;

		constructor(skin?:string);
		destroy(destroyChild?:boolean):void;
		protected createChildren():void;
		protected initialize():void;
		protected onSliderChange():void;
		protected onButtonMouseDown(e:laya.events.Event):void;
		protected startLoop(isUp:boolean):void;
		protected slide(isUp:boolean):void;
		protected onStageMouseUp(e:laya.events.Event):void;
		skin:string;
		protected _skinLoaded():void;
		protected changeScrollBar():void;
		protected _sizeChanged():void;
		private resetPositions:any;
		protected resetButtonPosition():void;
		protected measureWidth():number;
		protected measureHeight():number;
		setScroll(min:number,max:number,value:number):void;
		max:number;
		min:number;
		value:number;
		isVertical:boolean;
		sizeGrid:string;
		scrollSize:number;
		dataSource:any;
		thumbPercent:number;
		target:laya.display.Sprite;
		hide:boolean;
		showButtons:boolean;
		touchScrollEnable:boolean;
		mouseWheelEnable:boolean;
		protected onTargetMouseWheel(e:laya.events.Event):void;
		isLockedFun:Function;
		protected onTargetMouseDown(e:laya.events.Event):void;
		startDragForce():void;
		private cancelDragOp:any;
		triggerDownDragLimit:Function;
		triggerUpDragLimit:Function;
		private checkTriggers:any;
		readonly lastOffset:number;
		startTweenMoveForce(lastOffset:number):void;
		protected loop():void;
		protected onStageMouseUp2(e:laya.events.Event):void;
		private elasticOver:any;
		protected tweenMove(maxDistance:number):void;
		stopScroll():void;
		tick:number;
	}

}

declare module laya.d3.core.particleShuriKen.module {
	class RotationOverLifetime implements laya.d3.core.IClone  {
		private _angularVelocity:any;
		enbale:boolean;
		readonly angularVelocity:laya.d3.core.particleShuriKen.module.GradientAngularVelocity;

		constructor(angularVelocity:laya.d3.core.particleShuriKen.module.GradientAngularVelocity);
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.d3.core.trail {
	class TrailRenderer extends laya.d3.core.render.BaseRender  {

		constructor(owner:laya.d3.core.trail.TrailSprite3D);
		protected _calculateBoundingBox():void;
		_needRender(boundFrustum:laya.d3.math.BoundFrustum):boolean;
		_renderUpdate(state:laya.d3.core.render.RenderContext3D,transform:laya.d3.core.Transform3D):void;
		protected _projectionViewWorldMatrix:laya.d3.math.Matrix4x4;
		_renderUpdateWithCamera(context:laya.d3.core.render.RenderContext3D,transform:laya.d3.core.Transform3D):void;
	}

}

declare module laya.utils {
	class Utils  {
		static gStage:laya.display.Stage;
		private static _gid:any;
		private static _pi:any;
		private static _pi2:any;
		protected static _extReg:RegExp;
		static toRadian(angle:number):number;
		static toAngle(radian:number):number;
		static toHexColor(color:number):string;
		static getGID():number;
		static parseXMLFromString:Function;
		static concatArray(source:any[],array:any[]):any[];
		static clearArray(array:any[]):any[];
		static copyArray(source:any[],array:any[]):any[];
		static getGlobalRecByPoints(sprite:laya.display.Sprite,x0:number,y0:number,x1:number,y1:number):laya.maths.Rectangle;
		static getGlobalPosAndScale(sprite:laya.display.Sprite):laya.maths.Rectangle;
		static bind(fun:Function,scope:any):Function;
		static updateOrder(array:any[]):boolean;
		static transPointList(points:any[],x:number,y:number):void;
		static parseInt(str:string,radix?:number):number;
		static getFileExtension(path:string):string;
		static getTransformRelativeToWindow(coordinateSpace:laya.display.Sprite,x:number,y:number):any;
		static fitDOMElementInArea(dom:any,coordinateSpace:laya.display.Sprite,x:number,y:number,width:number,height:number):void;
		static isOkTextureList(textureList:any[]):boolean;
		static isOKCmdList(cmds:any[]):boolean;
		static getQueryString(name:string):string;
	}

}

declare module laya.display.cmd {
	class TranslateCmd  {
		static ID:string;
		tx:number;
		ty:number;
		static create(tx:number,ty:number):TranslateCmd;
		recover():void;
		run(context:laya.resource.Context,gx:number,gy:number):void;
		readonly cmdID:string;
	}

}

declare module laya.ui {
	class Slider extends laya.ui.UIComponent  {
		static label:laya.ui.Label;
		changeHandler:laya.utils.Handler;
		isVertical:boolean;
		showLabel:boolean;
		protected _allowClickBack:boolean;
		protected _max:number;
		protected _min:number;
		protected _tick:number;
		protected _value:number;
		protected _skin:string;
		protected _bg:laya.ui.Image;
		protected _progress:laya.ui.Image;
		protected _bar:laya.ui.Button;
		protected _tx:number;
		protected _ty:number;
		protected _maxMove:number;
		protected _globalSacle:laya.maths.Point;

		constructor(skin?:string);
		destroy(destroyChild?:boolean):void;
		protected createChildren():void;
		protected initialize():void;
		protected onBarMouseDown(e:laya.events.Event):void;
		protected showValueText():void;
		protected hideValueText():void;
		private mouseUp:any;
		private mouseMove:any;
		protected sendChangeEvent(type?:string):void;
		skin:string;
		protected _skinLoaded():void;
		protected setBarPoint():void;
		protected measureWidth():number;
		protected measureHeight():number;
		protected _sizeChanged():void;
		sizeGrid:string;
		setSlider(min:number,max:number,value:number):void;
		tick:number;
		changeValue():void;
		max:number;
		min:number;
		value:number;
		allowClickBack:boolean;
		protected onBgMouseDown(e:laya.events.Event):void;
		dataSource:any;
		readonly bar:laya.ui.Button;
	}

}

declare module laya.d3.core.particleShuriKen.module {
	class SizeOverLifetime implements laya.d3.core.IClone  {
		private _size:any;
		enbale:boolean;
		readonly size:laya.d3.core.particleShuriKen.module.GradientSize;

		constructor(size:laya.d3.core.particleShuriKen.module.GradientSize);
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.d3.core.particleShuriKen.module.shape {
	class BaseShape implements laya.d3.core.IClone  {
		enable:boolean;
		randomDirection:boolean;

		constructor();
		generatePositionAndDirection(position:laya.d3.math.Vector3,direction:laya.d3.math.Vector3,rand?:laya.d3.math.Rand,randomSeeds?:Uint32Array):void;
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.d3.core.trail {
	class TrailSprite3D extends laya.d3.core.RenderableSprite3D  {
		readonly trailFilter:laya.d3.core.trail.TrailFilter;
		readonly trailRenderer:laya.d3.core.trail.TrailRenderer;

		constructor(name?:string);
		_parse(data:any,spriteMap:any):void;
		protected _onActive():void;
		_cloneTo(destObject:any,srcSprite:laya.display.Node,dstSprite:laya.display.Node):void;
		destroy(destroyChild?:boolean):void;
	}

}

declare module laya.utils {
	class VectorGraphManager  {
		static instance:VectorGraphManager;
		useDic:any;
		shapeDic:any;
		shapeLineDic:any;
		private _id:any;
		private _checkKey:any;
		private _freeIdArray:any;

		constructor();
		static getInstance():VectorGraphManager;
		getId():number;
		addShape(id:number,shape:any):void;
		addLine(id:number,Line:any):void;
		getShape(id:number):void;
		deleteShape(id:number):void;
		getCacheList():any[];
		startDispose(key:boolean):void;
		endDispose():void;
	}

}

declare module laya.ui {
	class Styles  {
		static defaultSizeGrid:any[];
		static labelColor:string;
		static labelPadding:any[];
		static inputLabelPadding:any[];
		static buttonStateNum:number;
		static buttonLabelColors:any[];
		static comboBoxItemColors:any[];
		static scrollBarMinNum:number;
		static scrollBarDelayTime:number;
	}

}

declare module laya.d3.core.particleShuriKen.module {
	class StartFrame implements laya.d3.core.IClone  {
		static createByConstant(constant:number):StartFrame;
		static createByRandomTwoConstant(constantMin:number,constantMax:number):StartFrame;
		private _type:any;
		private _constant:any;
		private _constantMin:any;
		private _constantMax:any;
		readonly type:number;
		readonly constant:number;
		readonly constantMin:number;
		readonly constantMax:number;

		constructor();
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.d3.core.particleShuriKen.module.shape {
	class BoxShape extends laya.d3.core.particleShuriKen.module.shape.BaseShape  {
		x:number;
		y:number;
		z:number;

		constructor();
		protected _getShapeBoundBox(boundBox:laya.d3.math.BoundBox):void;
		protected _getSpeedBoundBox(boundBox:laya.d3.math.BoundBox):void;
		generatePositionAndDirection(position:laya.d3.math.Vector3,direction:laya.d3.math.Vector3,rand?:laya.d3.math.Rand,randomSeeds?:Uint32Array):void;
		cloneTo(destObject:any):void;
	}

}

declare module laya.d3.core.trail {
	class VertexTrail implements laya.d3.graphics.IVertex  {
		static TRAIL_POSITION0:number;
		static TRAIL_OFFSETVECTOR:number;
		static TRAIL_TIME0:number;
		static TRAIL_TEXTURECOORDINATE0Y:number;
		static TRAIL_TEXTURECOORDINATE0X:number;
		static TRAIL_COLOR:number;
		private static _vertexDeclaration1:any;
		private static _vertexDeclaration2:any;
		static readonly vertexDeclaration1:laya.d3.graphics.VertexDeclaration;
		static readonly vertexDeclaration2:laya.d3.graphics.VertexDeclaration;
		readonly vertexDeclaration:laya.d3.graphics.VertexDeclaration;

		constructor();
	}

}

declare module laya.d3.core.particleShuriKen.module {
	class TextureSheetAnimation implements laya.d3.core.IClone  {
		tiles:laya.d3.math.Vector2;
		type:number;
		randomRow:boolean;
		rowIndex:number;
		cycles:number;
		enableUVChannels:number;
		enable:boolean;
		readonly frame:laya.d3.core.particleShuriKen.module.FrameOverTime;
		readonly startFrame:laya.d3.core.particleShuriKen.module.StartFrame;

		constructor(frame:laya.d3.core.particleShuriKen.module.FrameOverTime,startFrame:laya.d3.core.particleShuriKen.module.StartFrame);
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.ui {
	class Tab extends laya.ui.UIGroup  {
		protected createItem(skin:string,label:string):laya.display.Sprite;
	}

}

declare module laya.utils {
	class WeakObject  {
		static supportWeakMap:boolean;
		static delInterval:number;
		static I:WeakObject;
		private static _keys:any;
		private static _maps:any;
		static clearCache():void;

		constructor();
		set(key:any,value:any):void;
		get(key:any):any;
		del(key:any):void;
		has(key:any):boolean;
	}

}

declare module laya.d3.core.particleShuriKen.module.shape {
	class CircleShape extends laya.d3.core.particleShuriKen.module.shape.BaseShape  {
		radius:number;
		arc:number;
		emitFromEdge:boolean;

		constructor();
		protected _getShapeBoundBox(boundBox:laya.d3.math.BoundBox):void;
		protected _getSpeedBoundBox(boundBox:laya.d3.math.BoundBox):void;
		generatePositionAndDirection(position:laya.d3.math.Vector3,direction:laya.d3.math.Vector3,rand?:laya.d3.math.Rand,randomSeeds?:Uint32Array):void;
		cloneTo(destObject:any):void;
	}

}

declare module laya.ui {
	class TextArea extends laya.ui.TextInput  {
		protected _vScrollBar:laya.ui.VScrollBar;
		protected _hScrollBar:laya.ui.HScrollBar;

		constructor(text?:string);
		private _onTextChange:any;
		destroy(destroyChild?:boolean):void;
		protected initialize():void;
		width:number;
		height:number;
		vScrollBarSkin:string;
		hScrollBarSkin:string;
		protected onVBarChanged(e:laya.events.Event):void;
		protected onHBarChanged(e:laya.events.Event):void;
		readonly vScrollBar:laya.ui.VScrollBar;
		readonly hScrollBar:laya.ui.HScrollBar;
		readonly maxScrollY:number;
		readonly scrollY:number;
		readonly maxScrollX:number;
		readonly scrollX:number;
		private changeScroll:any;
		scrollTo(y:number):void;
	}

}

declare module laya.d3.core.particleShuriKen.module {
	class VelocityOverLifetime implements laya.d3.core.IClone  {
		enbale:boolean;
		space:number;
		readonly velocity:laya.d3.core.particleShuriKen.module.GradientVelocity;

		constructor(velocity:laya.d3.core.particleShuriKen.module.GradientVelocity);
		cloneTo(destObject:any):void;
		clone():any;
	}

}

declare module laya.utils {
	class WordText  {
		id:number;
		save:any[];
		toUpperCase:string;
		changed:boolean;
		width:number;
		pageChars:any[];
		startID:number;
		startIDStroke:number;
		lastGCCnt:number;
		splitRender:boolean;
		setText(txt:string):void;
		toString():string;
		readonly length:number;
		charCodeAt(i:number):number;
		charAt(i:number):string;
		cleanCache():void;
	}

}

declare module laya.d3.core.particleShuriKen.module.shape {
	class ConeShape extends laya.d3.core.particleShuriKen.module.shape.BaseShape  {
		angle:number;
		radius:number;
		length:number;
		emitType:number;

		constructor();
		protected _getShapeBoundBox(boundBox:laya.d3.math.BoundBox):void;
		protected _getSpeedBoundBox(boundBox:laya.d3.math.BoundBox):void;
		generatePositionAndDirection(position:laya.d3.math.Vector3,direction:laya.d3.math.Vector3,rand?:laya.d3.math.Rand,randomSeeds?:Uint32Array):void;
		cloneTo(destObject:any):void;
	}

}

declare module laya.ui {
	class TextInput extends laya.ui.Label  {
		protected _bg:laya.ui.AutoBitmap;
		protected _skin:string;

		constructor(text?:string);
		protected preinitialize():void;
		destroy(destroyChild?:boolean):void;
		protected createChildren():void;
		private _onFocus:any;
		private _onBlur:any;
		private _onInput:any;
		private _onEnter:any;
		protected initialize():void;
		bg:laya.ui.AutoBitmap;
		skin:string;
		protected _skinLoaded():void;
		sizeGrid:string;
		text:string;
		width:number;
		height:number;
		multiline:boolean;
		editable:boolean;
		select():void;
		restrict:string;
		prompt:string;
		promptColor:string;
		maxChars:number;
		focus:boolean;
		type:string;
		setSelection(startIndex:number,endIndex:number):void;
	}

}

declare module laya.ui {
	class TipManager extends laya.ui.UIComponent  {
		static offsetX:number;
		static offsetY:number;
		static tipTextColor:string;
		static tipBackColor:string;
		static tipDelay:number;
		private _tipBox:any;
		private _tipText:any;
		private _defaultTipHandler:any;

		constructor();
		private _onStageHideTip:any;
		private _onStageShowTip:any;
		private _showTip:any;
		private _onStageMouseDown:any;
		private _onStageMouseMove:any;
		private _showToStage:any;
		closeAll():void;
		showDislayTip(tip:laya.display.Sprite):void;
		private _showDefaultTip:any;
		defaultTipHandler:Function;
	}

}

declare module laya.d3.core.particleShuriKen.module.shape {
	class HemisphereShape extends laya.d3.core.particleShuriKen.module.shape.BaseShape  {
		radius:number;
		emitFromShell:boolean;

		constructor();
		protected _getShapeBoundBox(boundBox:laya.d3.math.BoundBox):void;
		protected _getSpeedBoundBox(boundBox:laya.d3.math.BoundBox):void;
		generatePositionAndDirection(position:laya.d3.math.Vector3,direction:laya.d3.math.Vector3,rand?:laya.d3.math.Rand,randomSeeds?:Uint32Array):void;
		cloneTo(destObject:any):void;
	}

}

declare module laya.ui {
	class Tree extends laya.ui.Box implements laya.ui.IRender  {
		protected _list:laya.ui.List;
		protected _source:any[];
		protected _renderHandler:laya.utils.Handler;
		protected _spaceLeft:number;
		protected _spaceBottom:number;
		protected _keepStatus:boolean;

		constructor();
		destroy(destroyChild?:boolean):void;
		protected createChildren():void;
		protected onListChange(e?:laya.events.Event):void;
		keepStatus:boolean;
		array:any[];
		readonly source:any[];
		readonly list:laya.ui.List;
		itemRender:any;
		scrollBarSkin:string;
		readonly scrollBar:laya.ui.ScrollBar;
		mouseHandler:laya.utils.Handler;
		renderHandler:laya.utils.Handler;
		spaceLeft:number;
		spaceBottom:number;
		selectedIndex:number;
		selectedItem:any;
		width:number;
		height:number;
		protected getArray():any[];
		protected getDepth(item:any,num?:number):number;
		protected getParentOpenStatus(item:any):boolean;
		protected renderItem(cell:laya.ui.Box,index:number):void;
		private onArrowClick:any;
		setItemState(index:number,isOpen:boolean):void;
		fresh():void;
		dataSource:any;
		xml:XMLDocument;
		protected parseXml(xml:ChildNode,source:any[],nodeParent:any,isRoot:boolean):void;
		protected parseOpenStatus(oldSource:any[],newSource:any[]):void;
		protected isSameParent(item1:any,item2:any):boolean;
		readonly selectedPath:string;
		filter(key:string):void;
		private getFilterSource:any;
	}

}

declare module laya.d3.core.particleShuriKen.module.shape {
	class ShapeUtils  {
		static _randomPointUnitArcCircle(arc:number,out:laya.d3.math.Vector2,rand?:laya.d3.math.Rand):void;
		static _randomPointInsideUnitArcCircle(arc:number,out:laya.d3.math.Vector2,rand?:laya.d3.math.Rand):void;
		static _randomPointUnitCircle(out:laya.d3.math.Vector2,rand?:laya.d3.math.Rand):void;
		static _randomPointInsideUnitCircle(out:laya.d3.math.Vector2,rand?:laya.d3.math.Rand):void;
		static _randomPointUnitSphere(out:laya.d3.math.Vector3,rand?:laya.d3.math.Rand):void;
		static _randomPointInsideUnitSphere(out:laya.d3.math.Vector3,rand?:laya.d3.math.Rand):void;
		static _randomPointInsideHalfUnitBox(out:laya.d3.math.Vector3,rand?:laya.d3.math.Rand):void;

		constructor();
	}

}

declare module laya.ui {
	class UIComponent extends laya.display.Sprite  {
		protected _anchorX:number;
		protected _anchorY:number;
		protected _dataSource:any;
		protected _toolTip:any;
		protected _tag:any;
		protected _disabled:boolean;
		protected _gray:boolean;
		protected _widget:laya.ui.Widget;

		constructor();
		destroy(destroyChild?:boolean):void;
		width:number;
		get_width():number;
		protected measureWidth():number;
		height:number;
		get_height():number;
		protected measureHeight():number;
		dataSource:any;
		get_dataSource():any;
		set_dataSource(value:any):void;
		top:number;
		get_top():number;
		set_top(value:number):void;
		bottom:number;
		get_bottom():number;
		set_bottom(value:number):void;
		left:number;
		right:number;
		centerX:number;
		centerY:number;
		protected _sizeChanged():void;
		toolTip:any;
		private onMouseOver:any;
		private onMouseOut:any;
		gray:boolean;
		disabled:boolean;
		private _getWidget:any;
		scaleX:number;
		set_scaleX(value:number):void;
		scaleY:number;
		set_scaleY(value:number):void;
		protected onCompResize():void;
		set_width(value:number):void;
		set_height(value:number):void;
		anchorX:number;
		get_anchorX():number;
		set_anchorX(value:number):void;
		anchorY:number;
		get_anchorY():number;
		set_anchorY(value:number):void;
		protected _childChanged(child?:laya.display.Node):void;
	}

}

declare module laya.d3.core.particleShuriKen.module.shape {
	class SphereShape extends laya.d3.core.particleShuriKen.module.shape.BaseShape  {
		radius:number;
		emitFromShell:boolean;

		constructor();
		protected _getShapeBoundBox(boundBox:laya.d3.math.BoundBox):void;
		protected _getSpeedBoundBox(boundBox:laya.d3.math.BoundBox):void;
		generatePositionAndDirection(position:laya.d3.math.Vector3,direction:laya.d3.math.Vector3,rand?:laya.d3.math.Rand,randomSeeds?:Uint32Array):void;
		cloneTo(destObject:any):void;
	}

}

declare module laya.ui {
	class UIEvent extends laya.events.Event  {
		static SHOW_TIP:string;
		static HIDE_TIP:string;
	}

}

declare module laya.ui {
	class UIGroup extends laya.ui.Box implements laya.ui.IItem  {
		selectHandler:laya.utils.Handler;
		protected _items:laya.ui.ISelect[];
		protected _selectedIndex:number;
		protected _skin:string;
		protected _direction:string;
		protected _space:number;
		protected _labels:string;
		protected _labelColors:string;
		private _labelFont:any;
		protected _labelStrokeColor:string;
		protected _strokeColors:string;
		protected _labelStroke:number;
		protected _labelSize:number;
		protected _labelBold:boolean;
		protected _labelPadding:string;
		protected _labelAlign:string;
		protected _stateNum:number;
		protected _labelChanged:boolean;

		constructor(labels?:string,skin?:string);
		protected preinitialize():void;
		destroy(destroyChild?:boolean):void;
		addItem(item:laya.ui.ISelect,autoLayOut?:boolean):number;
		delItem(item:laya.ui.ISelect,autoLayOut?:boolean):void;
		initItems():void;
		protected itemClick(index:number):void;
		selectedIndex:number;
		protected setSelect(index:number,selected:boolean):void;
		skin:string;
		protected _skinLoaded():void;
		labels:string;
		protected createItem(skin:string,label:string):laya.display.Sprite;
		labelColors:string;
		labelStroke:number;
		labelStrokeColor:string;
		strokeColors:string;
		labelSize:number;
		stateNum:number;
		labelBold:boolean;
		labelFont:string;
		labelPadding:string;
		direction:string;
		space:number;
		protected changeLabels():void;
		protected commitMeasure():void;
		readonly items:laya.ui.ISelect[];
		selection:laya.ui.ISelect;
		dataSource:any;
		protected _setLabelChanged():void;
	}

}

declare module laya.ui {
	class UILib  {
		static __init__():void;
	}

}

declare module laya.ui {
	class UIUtils  {
		private static grayFilter:any;
		static escapeSequence:any;
		static fillArray(arr:any[],str:string,type?:typeof Number|typeof String):any[];
		static toColor(color:number):string;
		static gray(traget:laya.display.Sprite,isGray?:boolean):void;
		static addFilter(target:laya.display.Sprite,filter:laya.filters.IFilter):void;
		static clearFilter(target:laya.display.Sprite,filterType:new () => any):void;
		private static _getReplaceStr:any;
		static adptString(str:string):string;
		private static _funMap:any;
		static getBindFun(value:string):Function;
	}

}

declare module laya.ui {
	class VBox extends laya.ui.LayoutBox  {
		static NONE:string;
		static LEFT:string;
		static CENTER:string;
		static RIGHT:string;
		width:number;
		protected changeItems():void;
	}

}

declare module laya.ui {
	class View extends laya.display.Scene  {
		static uiMap:any;
		protected _widget:laya.ui.Widget;
		protected _dataSource:any;
		protected _anchorX:number;
		protected _anchorY:number;
		static __init__():void;

		constructor();
		static regComponent(key:string,compClass:new () => any):void;
		static regUI(url:string,json:any):void;
		destroy(destroyChild?:boolean):void;
		changeData(key:string):void;
		top:number;
		bottom:number;
		left:number;
		right:number;
		centerX:number;
		centerY:number;
		anchorX:number;
		anchorY:number;
		protected _sizeChanged():void;
		private _getWidget:any;
		protected loadUI(path:string):void;
		dataSource:any;
	}

}

declare module laya.ui {
	class ViewStack extends laya.ui.Box implements laya.ui.IItem  {
		protected _items:any[];
		protected _setIndexHandler:laya.utils.Handler;
		protected _selectedIndex:number;
		setItems(views:any[]):void;
		initItems():void;
		selectedIndex:number;
		protected setSelect(index:number,selected:boolean):void;
		selection:laya.display.Node;
		setIndexHandler:laya.utils.Handler;
		protected setIndex(index:number):void;
		readonly items:any[];
		dataSource:any;
	}

}

declare module laya.ui {
	class VScrollBar extends laya.ui.ScrollBar  {
	}

}

declare module laya.ui {
	class VSlider extends laya.ui.Slider  {
	}

}

declare module laya.ui {
	class Widget extends laya.components.Component  {
		static EMPTY:Widget;
		private _top:any;
		private _bottom:any;
		private _left:any;
		private _right:any;
		private _centerX:any;
		private _centerY:any;
		onReset():void;
		protected _onEnable():void;
		protected _onDisable():void;
		protected _onParentResize():void;
		resetLayoutX():boolean;
		resetLayoutY():boolean;
		resetLayout():void;
		top:number;
		bottom:number;
		left:number;
		right:number;
		centerX:number;
		centerY:number;
	}

}
declare module Laya {

	class Const extends laya.Const {}

	class IAniLib extends laya.ani.IAniLib {}

	class CommonScript extends laya.components.CommonScript {}

	class Component extends laya.components.Component {}

	class CastShadowList extends laya.d3.CastShadowList {}

	class AnimationClip extends laya.d3.animation.AnimationClip {}

	class FileSaver extends laya.d3Extend.FileSaver {}

	class CartoonMaterial extends laya.d3Extend.cartoonMaterial.CartoonMaterial {}

	class Animation extends laya.display.Animation {}

	class Geolocation extends laya.device.geolocation.Geolocation {}

	class BlurFilterSetter extends laya.effect.BlurFilterSetter {}

	class Shake extends laya.device.Shake {}

	class Event extends laya.events.Event {}

	class AccelerationInfo extends laya.device.motion.AccelerationInfo {}

	class BlurFilter extends laya.filters.BlurFilter {}

	class Prefab extends laya.components.Prefab {}

	class CommandEncoder extends laya.layagl.CommandEncoder {}

	class GridSprite extends laya.map.GridSprite {}

	class HTMLExtendStyle extends laya.html.utils.HTMLExtendStyle {}

	class Bezier extends laya.maths.Bezier {}

	class Media extends laya.device.media.Media {}

	class Animator extends laya.d3.component.Animator {}

	class Sound extends laya.media.Sound {}

	class AtlasInfoManager extends laya.net.AtlasInfoManager {}

	class AnimationBase extends laya.display.AnimationBase {}

	class Input3D extends laya.d3.Input3D {}

	class Avatar extends laya.d3.core.Avatar {}

	class GeolocationInfo extends laya.device.geolocation.GeolocationInfo {}

	class ButtonEffect extends laya.effect.ButtonEffect {}

	class AudioSound extends laya.media.h5audio.AudioSound {}

	class EventDispatcher extends laya.events.EventDispatcher {}

	class Particle2D extends laya.particle.Particle2D {}

	class BoxCollider extends laya.physics.BoxCollider {}

	class Accelerator extends laya.device.motion.Accelerator {}

	class HTMLDivElement extends laya.html.dom.HTMLDivElement {}

	class BlurFilterGLRender extends laya.filters.BlurFilterGLRender {}

	class Emitter2D extends laya.particle.emitter.Emitter2D {}

	class BaseTexture extends laya.resource.BaseTexture {}

	class Script extends laya.components.Script {}

	class System extends laya.system.System {}

	class LayaGL extends laya.layagl.LayaGL {}

	class IMap extends laya.map.IMap {}

	class AdvImage extends laya.ui.AdvImage {}

	class HTMLParse extends laya.html.utils.HTMLParse {}

	class GrahamScan extends laya.maths.GrahamScan {}

	class Browser extends laya.utils.Browser {}

	class Video extends laya.device.media.Video {}

	class BufferState2D extends laya.webgl.BufferState2D {}

	class SoundChannel extends laya.media.SoundChannel {}

	class AnimatorControllerLayer extends laya.d3.component.AnimatorControllerLayer {}

	class AnimationPlayer extends laya.ani.AnimationPlayer {}

	class Render extends laya.renders.Render {}

	class HttpRequest extends laya.net.HttpRequest {}

	class BitmapFont extends laya.display.BitmapFont {}

	class Input3D extends laya.d3.Input3D {}

	class BaseCamera extends laya.d3.core.BaseCamera {}

	class ColorFilterSetter extends laya.effect.ColorFilterSetter {}

	class AnimationEvent extends laya.d3.animation.AnimationEvent {}

	class AudioSoundChannel extends laya.media.h5audio.AudioSoundChannel {}

	class ParticleData extends laya.particle.ParticleData {}

	class Keyboard extends laya.events.Keyboard {}

	class ChainCollider extends laya.physics.ChainCollider {}

	class Gyroscope extends laya.device.motion.Gyroscope {}

	class HTMLDivParser extends laya.html.dom.HTMLDivParser {}

	class ColorFilter extends laya.filters.ColorFilter {}

	class EmitterBase extends laya.particle.emitter.EmitterBase {}

	class IndexBuffer3D extends laya.d3.graphics.IndexBuffer3D {}

	class Bitmap extends laya.resource.Bitmap {}

	class LayaGLRunner extends laya.layagl.LayaGLRunner {}

	class MapLayer extends laya.map.MapLayer {}

	class AutoBitmap extends laya.ui.AutoBitmap {}

	class HTMLStyle extends laya.html.utils.HTMLStyle {}

	class Byte extends laya.utils.Byte {}

	class MathUtil extends laya.maths.MathUtil {}

	class SoundManager extends laya.media.SoundManager {}

	class BufferStateBase extends laya.webgl.BufferStateBase {}

	class RenderInfo extends laya.renders.RenderInfo {}

	class AnimatorPlayState extends laya.d3.component.AnimatorPlayState {}

	class Loader extends laya.net.Loader {}

	class Bounds extends laya.d3.core.Bounds {}

	class EffectBase extends laya.effect.EffectBase {}

	class AnimationNode extends laya.d3.animation.AnimationNode {}

	class ParticleEmitter extends laya.particle.ParticleEmitter {}

	class KeyBoardManager extends laya.events.KeyBoardManager {}

	class EffectAnimation extends laya.display.EffectAnimation {}

	class AlphaCmd extends laya.display.cmd.AlphaCmd {}

	class CircleCollider extends laya.physics.CircleCollider {}

	class RotationInfo extends laya.device.motion.RotationInfo {}

	class HTMLDocument extends laya.html.dom.HTMLDocument {}

	class Filter extends laya.filters.Filter {}

	class BoundBox extends laya.d3.math.BoundBox {}

	class Context extends laya.resource.Context {}

	class QuickTestTool extends laya.layagl.QuickTestTool {}

	class AnimationTemplet extends laya.ani.AnimationTemplet {}

	class Box extends laya.ui.Box {}

	class TileAniSprite extends laya.map.TileAniSprite {}

	class Matrix extends laya.maths.Matrix {}

	class CacheManger extends laya.utils.CacheManger {}

	class SoundNode extends laya.media.SoundNode {}

	class AnimatorState extends laya.d3.component.AnimatorState {}

	class RenderSprite extends laya.renders.RenderSprite {}

	class LoaderManager extends laya.net.LoaderManager {}

	class FadeIn extends laya.effect.FadeIn {}

	class AnimationTransform3D extends laya.d3.animation.AnimationTransform3D {}

	class CharacterController extends laya.d3.physics.CharacterController {}

	class LayaGPU extends laya.webgl.LayaGPU {}

	class ParticleSetting extends laya.particle.ParticleSetting {}

	class KeyLocation extends laya.events.KeyLocation {}

	class FrameAnimation extends laya.display.FrameAnimation {}

	class ClipRectCmd extends laya.display.cmd.ClipRectCmd {}

	class BlendMode extends laya.webgl.canvas.BlendMode {}

	class ColliderBase extends laya.physics.ColliderBase {}

	class HTMLElement extends laya.html.dom.HTMLElement {}

	class GlowFilter extends laya.filters.GlowFilter {}

	class DefineDatas extends laya.d3.shader.DefineDatas {}

	class BoundFrustum extends laya.d3.math.BoundFrustum {}

	class ParallelSplitShadowMap extends laya.d3.shadowMap.ParallelSplitShadowMap {}

	class Touch extends laya.d3.Touch {}

	class HTMLCanvas extends laya.resource.HTMLCanvas {}

	class TextMesh extends laya.d3.text.TextMesh {}

	class SpriteStyle extends laya.display.css.SpriteStyle {}

	class MeshReader extends laya.d3.loaders.MeshReader {}

	class Button extends laya.ui.Button {}

	class TiledMap extends laya.map.TiledMap {}

	class Camera extends laya.d3.core.Camera {}

	class Point extends laya.maths.Point {}

	class GraphicsAni extends laya.ani.GraphicsAni {}

	class CallLater extends laya.utils.CallLater {}

	class Bone extends laya.ani.bone.Bone {}

	class LocalStorage extends laya.net.LocalStorage {}

	class FadeOut extends laya.effect.FadeOut {}

	class AnimatorStateScript extends laya.d3.animation.AnimatorStateScript {}

	class WebAudioSound extends laya.media.webaudio.WebAudioSound {}

	class Collision extends laya.d3.physics.Collision {}

	class MouseManager extends laya.events.MouseManager {}

	class Graphics extends laya.display.Graphics {}

	class DrawStyle extends laya.webgl.canvas.DrawStyle {}

	class IPhysics extends laya.physics.IPhysics {}

	class HTMLHitRect extends laya.html.dom.HTMLHitRect {}

	class GlowFilterGLRender extends laya.filters.GlowFilterGLRender {}

	class Layout extends laya.html.utils.Layout {}

	class RenderTexture extends laya.d3.resource.RenderTexture {}

	class BoundSphere extends laya.d3.math.BoundSphere {}

	class Mesh extends laya.d3.resource.models.Mesh {}

	class HTMLImage extends laya.resource.HTMLImage {}

	class Shader3D extends laya.d3.shader.Shader3D {}

	class TextStyle extends laya.display.css.TextStyle {}

	class PostProcess extends laya.d3.component.PostProcess {}

	class CheckBox extends laya.ui.CheckBox {}

	class Physics3DUtils extends laya.d3.utils.Physics3DUtils {}

	class StaticBatchManager extends laya.d3.graphics.StaticBatchManager {}

	class TileTexSet extends laya.map.TileTexSet {}

	class FloatKeyframe extends laya.d3.core.FloatKeyframe {}

	class Rectangle extends laya.maths.Rectangle {}

	class KeyFramesContent extends laya.ani.KeyFramesContent {}

	class ParticleTemplateBase extends laya.particle.ParticleTemplateBase {}

	class ClassUtils extends laya.utils.ClassUtils {}

	class BoneSlot extends laya.ani.bone.BoneSlot {}

	class ResourceVersion extends laya.net.ResourceVersion {}

	class FilterSetterBase extends laya.effect.FilterSetterBase {}

	class WebAudioSoundChannel extends laya.media.webaudio.WebAudioSoundChannel {}

	class CollisionTool extends laya.d3.physics.CollisionTool {}

	class TouchManager extends laya.events.TouchManager {}

	class GraphicsBounds extends laya.display.GraphicsBounds {}

	class Path extends laya.webgl.canvas.Path {}

	class HTMLIframeElement extends laya.html.dom.HTMLIframeElement {}

	class LayoutLine extends laya.html.utils.LayoutLine {}

	class Physics extends laya.physics.Physics {}

	class TextureCube extends laya.d3.resource.TextureCube {}

	class BaseShader extends laya.webgl.shader.BaseShader {}

	class PrimitiveMesh extends laya.d3.resource.models.PrimitiveMesh {}

	class CollisionUtils extends laya.d3.math.CollisionUtils {}

	class DistanceJoint extends laya.physics.joint.DistanceJoint {}

	class ShaderData extends laya.d3.shader.ShaderData {}

	class BasePoly extends laya.webgl.shapes.BasePoly {}

	class DrawCircleCmd extends laya.display.cmd.DrawCircleCmd {}

	class Script3D extends laya.d3.component.Script3D {}

	class Picker extends laya.d3.utils.Picker {}

	class Clip extends laya.ui.Clip {}

	class GeometryElement extends laya.d3.core.GeometryElement {}

	class ArabicReshaper extends laya.webgl.text.ArabicReshaper {}

	class VertexArrayObject extends laya.webgl.VertexArrayObject {}

	class ParticleTemplateWebGL extends laya.particle.ParticleTemplateWebGL {}

	class Buffer extends laya.webgl.utils.Buffer {}

	class ColorUtils extends laya.utils.ColorUtils {}

	class GlowFilterSetter extends laya.effect.GlowFilterSetter {}

	class SceneLoader extends laya.net.SceneLoader {}

	class MeshData extends laya.ani.bone.canvasmesh.MeshData {}

	class MovieClip extends laya.ani.swf.MovieClip {}

	class Constraint3D extends laya.d3.physics.Constraint3D {}

	class Input extends laya.display.Input {}

	class HTMLImageElement extends laya.html.dom.HTMLImageElement {}

	class WebGLCacheAsNormalCanvas extends laya.webgl.canvas.WebGLCacheAsNormalCanvas {}

	class TextureGenerator extends laya.d3.resource.TextureGenerator {}

	class SkyBox extends laya.d3.resource.models.SkyBox {}

	class Color extends laya.d3.math.Color {}

	class GearJoint extends laya.physics.joint.GearJoint {}

	class ShaderDefines extends laya.d3.shader.ShaderDefines {}

	class PhysicsDebugDraw extends laya.physics.PhysicsDebugDraw {}

	class Earcut extends laya.webgl.shapes.Earcut {}

	class DrawCurvesCmd extends laya.display.cmd.DrawCurvesCmd {}

	class Shader extends laya.webgl.shader.Shader {}

	class Submit extends laya.webgl.submit.Submit {}

	class SimpleSingletonList extends laya.d3.component.SimpleSingletonList {}

	class ColorPicker extends laya.ui.ColorPicker {}

	class Scene3DUtils extends laya.d3.utils.Scene3DUtils {}

	class Gradient extends laya.d3.core.Gradient {}

	class AtlasGrid extends laya.webgl.text.AtlasGrid {}

	class WebGL extends laya.webgl.WebGL {}

	class Shader2D extends laya.webgl.shader.d2.Shader2D {}

	class Buffer2D extends laya.webgl.utils.Buffer2D {}

	class Dragging extends laya.utils.Dragging {}

	class ParticleShader extends laya.particle.shader.ParticleShader {}

	class SkinMeshForGraphic extends laya.ani.bone.canvasmesh.SkinMeshForGraphic {}

	class Socket extends laya.net.Socket {}

	class ContactPoint extends laya.d3.physics.ContactPoint {}

	class HTMLLinkElement extends laya.html.dom.HTMLLinkElement {}

	class Node extends laya.display.Node {}

	class ConstraintComponent extends laya.d3.physics.constraints.ConstraintComponent {}

	class SkyDome extends laya.d3.resource.models.SkyDome {}

	class ContainmentType extends laya.d3.math.ContainmentType {}

	class JointBase extends laya.physics.joint.JointBase {}

	class SaveBase extends laya.webgl.canvas.save.SaveBase {}

	class PolygonCollider extends laya.physics.PolygonCollider {}

	class EarcutNode extends laya.webgl.shapes.EarcutNode {}

	class DrawImageCmd extends laya.display.cmd.DrawImageCmd {}

	class ShaderDefinesBase extends laya.webgl.shader.ShaderDefinesBase {}

	class SubmitBase extends laya.webgl.submit.SubmitBase {}

	class SingletonList<T> extends laya.d3.component.SingletonList<T> {}

	class ComboBox extends laya.ui.ComboBox {}

	class GradientMode extends laya.d3.core.GradientMode {}

	class Size extends laya.d3.utils.Size {}

	class CharRenderInfo extends laya.webgl.text.CharRenderInfo {}

	class Shader2X extends laya.webgl.shader.d2.Shader2X {}

	class VertexBuffer3D extends laya.d3.graphics.VertexBuffer3D {}

	class WebGLContext extends laya.webgl.WebGLContext {}

	class CONST3D2D extends laya.webgl.utils.CONST3D2D {}

	class VertexMesh extends laya.d3.graphics.Vertex.VertexMesh {}

	class Ease extends laya.utils.Ease {}

	class TTFLoader extends laya.net.TTFLoader {}

	class HitResult extends laya.d3.physics.HitResult {}

	class HTMLStyleElement extends laya.html.dom.HTMLStyleElement {}

	class Scene extends laya.display.Scene {}

	class Point2PointConstraint extends laya.d3.physics.constraints.Point2PointConstraint {}

	class HalfFloatUtils extends laya.d3.math.HalfFloatUtils {}

	class SkyMesh extends laya.d3.resource.models.SkyMesh {}

	class MotorJoint extends laya.physics.joint.MotorJoint {}

	class SaveClipRect extends laya.webgl.canvas.save.SaveClipRect {}

	class RigidBody extends laya.physics.RigidBody {}

	class EventData extends laya.ani.bone.EventData {}

	class DrawLineCmd extends laya.display.cmd.DrawLineCmd {}

	class ShaderValue extends laya.webgl.shader.ShaderValue {}

	class SubmitCanvas extends laya.webgl.submit.SubmitCanvas {}

	class Dialog extends laya.ui.Dialog {}

	class VertexDeclaration extends laya.d3.graphics.VertexDeclaration {}

	class HeightMap extends laya.d3.core.HeightMap {}

	class ShaderDefines2D extends laya.webgl.shader.d2.ShaderDefines2D {}

	class Utils3D extends laya.d3.utils.Utils3D {}

	class ShaderPass extends laya.d3.shader.ShaderPass {}

	class CharRender_Canvas extends laya.webgl.text.CharRender_Canvas {}

	class IndexBuffer2D extends laya.webgl.utils.IndexBuffer2D {}

	class VertexPositionTerrain extends laya.d3.graphics.Vertex.VertexPositionTerrain {}

	class FontInfo extends laya.utils.FontInfo {}

	class RenderTexture2D extends laya.resource.RenderTexture2D {}

	class URL extends laya.net.URL {}

	class Physics3D extends laya.d3.physics.Physics3D {}

	class Sprite extends laya.display.Sprite {}

	class SkyRenderer extends laya.d3.resource.models.SkyRenderer {}

	class MathUtils3D extends laya.d3.math.MathUtils3D {}

	class MouseJoint extends laya.physics.joint.MouseJoint {}

	class SaveMark extends laya.webgl.canvas.save.SaveMark {}

	class DrawLinesCmd extends laya.display.cmd.DrawLinesCmd {}

	class SubmitCMD extends laya.webgl.submit.SubmitCMD {}

	class VertexElement extends laya.d3.graphics.VertexElement {}

	class DialogManager extends laya.ui.DialogManager {}

	class CharRender_Native extends laya.webgl.text.CharRender_Native {}

	class InlcudeFile extends laya.webgl.utils.InlcudeFile {}

	class VertexPositionTexture0 extends laya.d3.graphics.Vertex.VertexPositionTexture0 {}

	class GraphicAnimation extends laya.utils.GraphicAnimation {}

	class GraphicNode extends laya.utils.GraphicNode {}

	class SkinMeshBuffer extends laya.webgl.shader.d2.skinAnishader.SkinMeshBuffer {}

	class PrimitiveSV extends laya.webgl.shader.d2.value.PrimitiveSV {}

	class WorkerLoader extends laya.net.WorkerLoader {}

	class Resource extends laya.resource.Resource {}

	class PhysicsCollider extends laya.d3.physics.PhysicsCollider {}

	class SubMesh extends laya.d3.resource.models.SubMesh {}

	class Matrix3x3 extends laya.d3.math.Matrix3x3 {}

	class PrismaticJoint extends laya.physics.joint.PrismaticJoint {}

	class SaveTransform extends laya.webgl.canvas.save.SaveTransform {}

	class SpriteConst extends laya.display.SpriteConst {}

	class SubShader extends laya.d3.shader.SubShader {}

	class DrawParticleCmd extends laya.display.cmd.DrawParticleCmd {}

	class VertexElementFormat extends laya.d3.graphics.VertexElementFormat {}

	class SubmitKey extends laya.webgl.submit.SubmitKey {}

	class FontClip extends laya.ui.FontClip {}

	class Keyframe extends laya.d3.core.Keyframe {}

	class CharSubmitCache extends laya.webgl.text.CharSubmitCache {}

	class VertexShuriKenParticle extends laya.d3.graphics.Vertex.VertexShuriKenParticle {}

	class Handler extends laya.utils.Handler {}

	class MatirxArray extends laya.webgl.utils.MatirxArray {}

	class TextureSV extends laya.webgl.shader.d2.value.TextureSV {}

	class SkinSV extends laya.webgl.shader.d2.skinAnishader.SkinSV {}

	class Texture extends laya.resource.Texture {}

	class Matrix4x4 extends laya.d3.math.Matrix4x4 {}

	class PhysicsComponent extends laya.d3.physics.PhysicsComponent {}

	class PulleyJoint extends laya.physics.joint.PulleyJoint {}

	class SaveTranslate extends laya.webgl.canvas.save.SaveTranslate {}

	class Stage extends laya.display.Stage {}

	class DrawPathCmd extends laya.display.cmd.DrawPathCmd {}

	class SubmitTarget extends laya.webgl.submit.SubmitTarget {}

	class HBox extends laya.ui.HBox {}

	class ICharRender extends laya.webgl.text.ICharRender {}

	class MeshFilter extends laya.d3.core.MeshFilter {}

	class DirectionLight extends laya.d3.core.light.DirectionLight {}

	class VertexShurikenParticleBillboard extends laya.d3.graphics.Vertex.VertexShurikenParticleBillboard {}

	class HitArea extends laya.utils.HitArea {}

	class Mesh2D extends laya.webgl.utils.Mesh2D {}

	class BaseMaterial extends laya.d3.core.material.BaseMaterial {}

	class Value2D extends laya.webgl.shader.d2.value.Value2D {}

	class Skeleton extends laya.ani.bone.Skeleton {}

	class Texture2D extends laya.resource.Texture2D {}

	class PhysicsSettings extends laya.d3.physics.PhysicsSettings {}

	class RevoluteJoint extends laya.physics.joint.RevoluteJoint {}

	class Text extends laya.display.Text {}

	class Plane extends laya.d3.math.Plane {}

	class ConchQuaternion extends laya.d3.math.Native.ConchQuaternion {}

	class SubmitTexture extends laya.webgl.submit.SubmitTexture {}

	class DrawPieCmd extends laya.display.cmd.DrawPieCmd {}

	class HScrollBar extends laya.ui.HScrollBar {}

	class TextAtlas extends laya.webgl.text.TextAtlas {}

	class LightSprite extends laya.d3.core.light.LightSprite {}

	class MeshRenderer extends laya.d3.core.MeshRenderer {}

	class HTMLChar extends laya.utils.HTMLChar {}

	class VertexShurikenParticleMesh extends laya.d3.graphics.Vertex.VertexShurikenParticleMesh {}

	class MeshParticle2D extends laya.webgl.utils.MeshParticle2D {}

	class BlinnPhongMaterial extends laya.d3.core.material.BlinnPhongMaterial {}

	class WebGLRTMgr extends laya.resource.WebGLRTMgr {}

	class PhysicsSimulation extends laya.d3.physics.PhysicsSimulation {}

	class RopeJoint extends laya.physics.joint.RopeJoint {}

	class Quaternion extends laya.d3.math.Quaternion {}

	class ConchVector3 extends laya.d3.math.Native.ConchVector3 {}

	class DrawPolyCmd extends laya.display.cmd.DrawPolyCmd {}

	class HSlider extends laya.ui.HSlider {}

	class SkinSlotDisplayData extends laya.ani.bone.SkinSlotDisplayData {}

	class TextRender extends laya.webgl.text.TextRender {}

	class PointLight extends laya.d3.core.light.PointLight {}

	class IStatRender extends laya.utils.IStatRender {}

	class MeshSprite3D extends laya.d3.core.MeshSprite3D {}

	class MeshQuadTexture extends laya.webgl.utils.MeshQuadTexture {}

	class EffectMaterial extends laya.d3.core.material.EffectMaterial {}

	class PhysicsTriggerComponent extends laya.d3.physics.PhysicsTriggerComponent {}

	class WeldJoint extends laya.physics.joint.WeldJoint {}

	class Rand extends laya.d3.math.Rand {}

	class ConchVector4 extends laya.d3.math.Native.ConchVector4 {}

	class DrawRectCmd extends laya.display.cmd.DrawRectCmd {}

	class SlotData extends laya.ani.bone.SlotData {}

	class TextTexture extends laya.webgl.text.TextTexture {}

	class SpotLight extends laya.d3.core.light.SpotLight {}

	class Log extends laya.utils.Log {}

	class MeshSprite3DShaderDeclaration extends laya.d3.core.MeshSprite3DShaderDeclaration {}

	class MeshTexture extends laya.webgl.utils.MeshTexture {}

	class ExtendTerrainMaterial extends laya.d3.core.material.ExtendTerrainMaterial {}

	class PhysicsUpdateList extends laya.d3.physics.PhysicsUpdateList {}

	class WheelJoint extends laya.physics.joint.WheelJoint {}

	class RandX extends laya.d3.math.RandX {}

	class DrawTextureCmd extends laya.display.cmd.DrawTextureCmd {}

	class Templet extends laya.ani.bone.Templet {}

	class Mouse extends laya.utils.Mouse {}

	class MeshTerrainSprite3D extends laya.d3.core.MeshTerrainSprite3D {}

	class MeshVG extends laya.webgl.utils.MeshVG {}

	class PBRSpecularMaterial extends laya.d3.core.material.PBRSpecularMaterial {}

	class Rigidbody3D extends laya.d3.physics.Rigidbody3D {}

	class Ray extends laya.d3.math.Ray {}

	class DrawTexturesCmd extends laya.display.cmd.DrawTexturesCmd {}

	class Image extends laya.ui.Image {}

	class PerfData extends laya.utils.PerfData {}

	class RenderState2D extends laya.webgl.utils.RenderState2D {}

	class QuaternionKeyframe extends laya.d3.core.QuaternionKeyframe {}

	class PixelLineData extends laya.d3.core.pixelLine.PixelLineData {}

	class ShuriKenParticle3D extends laya.d3.core.particleShuriKen.ShuriKenParticle3D {}

	class PBRStandardMaterial extends laya.d3.core.material.PBRStandardMaterial {}

	class Burst extends laya.d3.core.particleShuriKen.module.Burst {}

	class BoxColliderShape extends laya.d3.physics.shape.BoxColliderShape {}

	class Vector2 extends laya.d3.math.Vector2 {}

	class DrawTrianglesCmd extends laya.display.cmd.DrawTrianglesCmd {}

	class PerfHUD extends laya.utils.PerfHUD {}

	class Transform extends laya.ani.bone.Transform {}

	class ShaderCompile extends laya.webgl.utils.ShaderCompile {}

	class PixelLineFilter extends laya.d3.core.pixelLine.PixelLineFilter {}

	class RenderState extends laya.d3.core.material.RenderState {}

	class ShuriKenParticle3DShaderDeclaration extends laya.d3.core.particleShuriKen.ShuriKenParticle3DShaderDeclaration {}

	class RenderableSprite3D extends laya.d3.core.RenderableSprite3D {}

	class ColorOverLifetime extends laya.d3.core.particleShuriKen.module.ColorOverLifetime {}

	class BaseRender extends laya.d3.core.render.BaseRender {}

	class CapsuleColliderShape extends laya.d3.physics.shape.CapsuleColliderShape {}

	class Vector3 extends laya.d3.math.Vector3 {}

	class FillBorderTextCmd extends laya.display.cmd.FillBorderTextCmd {}

	class Pool extends laya.utils.Pool {}

	class ShaderNode extends laya.webgl.utils.ShaderNode {}

	class PixelLineMaterial extends laya.d3.core.pixelLine.PixelLineMaterial {}

	class SkyBoxMaterial extends laya.d3.core.material.SkyBoxMaterial {}

	class Emission extends laya.d3.core.particleShuriKen.module.Emission {}

	class ColliderShape extends laya.d3.physics.shape.ColliderShape {}

	class SkinnedMeshRenderer extends laya.d3.core.SkinnedMeshRenderer {}

	class BoundsOctree extends laya.d3.core.scene.BoundsOctree {}

	class Vector4 extends laya.d3.math.Vector4 {}

	class FillBorderWordsCmd extends laya.display.cmd.FillBorderWordsCmd {}

	class IUI extends laya.ui.IUI {}

	class ShurikenParticleMaterial extends laya.d3.core.particleShuriKen.ShurikenParticleMaterial {}

	class PoolCache extends laya.utils.PoolCache {}

	class BloomEffect extends laya.d3.core.render.BloomEffect {}

	class PixelLineRenderer extends laya.d3.core.pixelLine.PixelLineRenderer {}

	class SkyProceduralMaterial extends laya.d3.core.material.SkyProceduralMaterial {}

	class VertexBuffer2D extends laya.webgl.utils.VertexBuffer2D {}

	class FrameOverTime extends laya.d3.core.particleShuriKen.module.FrameOverTime {}

	class CompoundColliderShape extends laya.d3.physics.shape.CompoundColliderShape {}

	class SkinnedMeshSprite3D extends laya.d3.core.SkinnedMeshSprite3D {}

	class BoundsOctreeNode extends laya.d3.core.scene.BoundsOctreeNode {}

	class Viewport extends laya.d3.math.Viewport {}

	class FillTextCmd extends laya.display.cmd.FillTextCmd {}

	class Label extends laya.ui.Label {}

	class ShurikenParticleRenderer extends laya.d3.core.particleShuriKen.ShurikenParticleRenderer {}

	class RunDriver extends laya.utils.RunDriver {}

	class PostProcessEffect extends laya.d3.core.render.PostProcessEffect {}

	class PixelLineSprite3D extends laya.d3.core.pixelLine.PixelLineSprite3D {}

	class UnlitMaterial extends laya.d3.core.material.UnlitMaterial {}

	class ConeColliderShape extends laya.d3.physics.shape.ConeColliderShape {}

	class GradientAngularVelocity extends laya.d3.core.particleShuriKen.module.GradientAngularVelocity {}

	class SkinnedMeshSprite3DShaderDeclaration extends laya.d3.core.SkinnedMeshSprite3DShaderDeclaration {}

	class FillTextureCmd extends laya.display.cmd.FillTextureCmd {}

	class LayoutBox extends laya.ui.LayoutBox {}

	class ShurikenParticleSystem extends laya.d3.core.particleShuriKen.ShurikenParticleSystem {}

	class SceneUtils extends laya.utils.SceneUtils {}

	class InitTool extends laya.utils.InitTool {}

	class PostProcessRenderContext extends laya.d3.core.render.PostProcessRenderContext {}

	class WaterPrimaryMaterial extends laya.d3.core.material.WaterPrimaryMaterial {}

	class PixelLineVertex extends laya.d3.core.pixelLine.PixelLineVertex {}

	class GradientColor extends laya.d3.core.particleShuriKen.module.GradientColor {}

	class CommandBuffer extends laya.d3.core.render.command.CommandBuffer {}

	class CylinderColliderShape extends laya.d3.physics.shape.CylinderColliderShape {}

	class Sprite3D extends laya.d3.core.Sprite3D {}

	class OctreeMotionList extends laya.d3.core.scene.OctreeMotionList {}

	class FillWordsCmd extends laya.display.cmd.FillWordsCmd {}

	class List extends laya.ui.List {}

	class Stat extends laya.utils.Stat {}

	class RenderContext3D extends laya.d3.core.render.RenderContext3D {}

	class GradientDataInt extends laya.d3.core.particleShuriKen.module.GradientDataInt {}

	class HeightfieldColliderShape extends laya.d3.physics.shape.HeightfieldColliderShape {}

	class TextureMode extends laya.d3.core.TextureMode {}

	class Scene3D extends laya.d3.core.scene.Scene3D {}

	class RestoreCmd extends laya.display.cmd.RestoreCmd {}

	class Panel extends laya.ui.Panel {}

	class StatUI extends laya.utils.StatUI {}

	class RenderElement extends laya.d3.core.render.RenderElement {}

	class GradientDataNumber extends laya.d3.core.particleShuriKen.module.GradientDataNumber {}

	class MeshColliderShape extends laya.d3.physics.shape.MeshColliderShape {}

	class RotateCmd extends laya.display.cmd.RotateCmd {}

	class Transform3D extends laya.d3.core.Transform3D {}

	class ProgressBar extends laya.ui.ProgressBar {}

	class StringKey extends laya.utils.StringKey {}

	class GradientDataVector2 extends laya.d3.core.particleShuriKen.module.GradientDataVector2 {}

	class SphereColliderShape extends laya.d3.physics.shape.SphereColliderShape {}

	class SaveCmd extends laya.display.cmd.SaveCmd {}

	class ScreenQuad extends laya.d3.core.render.ScreenQuad {}

	class Vector3Keyframe extends laya.d3.core.Vector3Keyframe {}

	class TrailFilter extends laya.d3.core.trail.TrailFilter {}

	class Radio extends laya.ui.Radio {}

	class TimeLine extends laya.utils.TimeLine {}

	class Scene3DShaderDeclaration extends laya.d3.core.scene.Scene3DShaderDeclaration {}

	class GradientSize extends laya.d3.core.particleShuriKen.module.GradientSize {}

	class ScaleCmd extends laya.display.cmd.ScaleCmd {}

	class ScreenTriangle extends laya.d3.core.render.ScreenTriangle {}

	class RadioGroup extends laya.ui.RadioGroup {}

	class TrailGeometry extends laya.d3.core.trail.TrailGeometry {}

	class Timer extends laya.utils.Timer {}

	class SceneManager extends laya.d3.core.scene.SceneManager {}

	class StaticPlaneColliderShape extends laya.d3.physics.shape.StaticPlaneColliderShape {}

	class GradientVelocity extends laya.d3.core.particleShuriKen.module.GradientVelocity {}

	class StrokeTextCmd extends laya.display.cmd.StrokeTextCmd {}

	class TrailMaterial extends laya.d3.core.trail.TrailMaterial {}

	class ScaleBox extends laya.ui.ScaleBox {}

	class Tween extends laya.utils.Tween {}

	class TransformCmd extends laya.display.cmd.TransformCmd {}

	class ScrollBar extends laya.ui.ScrollBar {}

	class RotationOverLifetime extends laya.d3.core.particleShuriKen.module.RotationOverLifetime {}

	class TrailRenderer extends laya.d3.core.trail.TrailRenderer {}

	class Utils extends laya.utils.Utils {}

	class TranslateCmd extends laya.display.cmd.TranslateCmd {}

	class Slider extends laya.ui.Slider {}

	class SizeOverLifetime extends laya.d3.core.particleShuriKen.module.SizeOverLifetime {}

	class BaseShape extends laya.d3.core.particleShuriKen.module.shape.BaseShape {}

	class TrailSprite3D extends laya.d3.core.trail.TrailSprite3D {}

	class VectorGraphManager extends laya.utils.VectorGraphManager {}

	class Styles extends laya.ui.Styles {}

	class StartFrame extends laya.d3.core.particleShuriKen.module.StartFrame {}

	class BoxShape extends laya.d3.core.particleShuriKen.module.shape.BoxShape {}

	class VertexTrail extends laya.d3.core.trail.VertexTrail {}

	class TextureSheetAnimation extends laya.d3.core.particleShuriKen.module.TextureSheetAnimation {}

	class Tab extends laya.ui.Tab {}

	class WeakObject extends laya.utils.WeakObject {}

	class CircleShape extends laya.d3.core.particleShuriKen.module.shape.CircleShape {}

	class TextArea extends laya.ui.TextArea {}

	class VelocityOverLifetime extends laya.d3.core.particleShuriKen.module.VelocityOverLifetime {}

	class WordText extends laya.utils.WordText {}

	class ConeShape extends laya.d3.core.particleShuriKen.module.shape.ConeShape {}

	class TextInput extends laya.ui.TextInput {}

	class TipManager extends laya.ui.TipManager {}

	class HemisphereShape extends laya.d3.core.particleShuriKen.module.shape.HemisphereShape {}

	class Tree extends laya.ui.Tree {}

	class ShapeUtils extends laya.d3.core.particleShuriKen.module.shape.ShapeUtils {}

	class UIComponent extends laya.ui.UIComponent {}

	class SphereShape extends laya.d3.core.particleShuriKen.module.shape.SphereShape {}

	class UIEvent extends laya.ui.UIEvent {}

	class UIGroup extends laya.ui.UIGroup {}

	class UILib extends laya.ui.UILib {}

	class UIUtils extends laya.ui.UIUtils {}

	class VBox extends laya.ui.VBox {}

	class View extends laya.ui.View {}

	class ViewStack extends laya.ui.ViewStack {}

	class VScrollBar extends laya.ui.VScrollBar {}

	class VSlider extends laya.ui.VSlider {}

	class Widget extends laya.ui.Widget {}

}
