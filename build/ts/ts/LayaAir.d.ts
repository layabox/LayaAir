
	/*
	 * Config 用于配置一些全局参数。如需更改，请在初始化引擎之前设置。
	 */
	declare class Config  {

		/*
		 * 动画 Animation 的默认播放时间间隔，单位为毫秒。
		 */
		static animationInterval:number;

		/*
		 * 设置是否抗锯齿，只对2D(WebGL)、3D有效。
		 */
		static isAntialias:boolean;

		/*
		 * 设置画布是否透明，只对2D(WebGL)、3D有效。
		 */
		static isAlpha:boolean;

		/*
		 * 设置画布是否预乘，只对2D(WebGL)、3D有效。
		 */
		static premultipliedAlpha:boolean;

		/*
		 * 设置画布的是否开启模板缓冲，只对2D(WebGL)、3D有效。
		 */
		static isStencil:boolean;

		/*
		 * 是否强制WebGL同步刷新。
		 */
		static preserveDrawingBuffer:boolean;

		/*
		 * 当使用webGL渲染2d的时候，每次创建vb是否直接分配足够64k个顶点的缓存。这样可以提高效率。
		 */
		static webGL2D_MeshAllocMaxMem:boolean;

		/*
		 * 是否强制使用像素采样。适用于像素风格游戏
		 */
		static is2DPixelArtGame:boolean;

		/*
		 * 是否使用webgl2
		 */
		static useWebGL2:boolean;
		static useRetinalCanvas:boolean;
	}

	/*
	 * <code>Config3D</code> 类用于创建3D初始化配置。
	 */
	declare class Config3D implements laya.d3.core.IClone  {

		/*
		 * @private 
		 */
		static _default:Config3D;

		/*
		 * @private 
		 */
		private _defaultPhysicsMemory:any;

		/*
		 * @private 
		 */
		_editerEnvironment:boolean;

		/*
		 * 是否开启抗锯齿。
		 */
		isAntialias:boolean;

		/*
		 * 设置画布是否透明。
		 */
		isAlpha:boolean;

		/*
		 * 设置画布是否预乘。
		 */
		premultipliedAlpha:boolean;

		/*
		 * 设置画布的是否开启模板缓冲。
		 */
		isStencil:boolean;

		/*
		 * 是否开启八叉树裁剪。
		 */
		octreeCulling:boolean;

		/*
		 * 八叉树初始化尺寸。
		 */
		octreeInitialSize:number;

		/*
		 * 八叉树初始化中心。
		 */
		octreeInitialCenter:laya.d3.math.Vector3;

		/*
		 * 八叉树最小尺寸。
		 */
		octreeMinNodeSize:number;

		/*
		 * 八叉树松散值。
		 */
		octreeLooseness:number;

		/*
		 * 是否开启视锥裁剪调试。
		 * 如果开启八叉树裁剪,使用红色绘制高层次八叉树节点包围盒,使用蓝色绘制低层次八叉节点包围盒,精灵包围盒和八叉树节点包围盒颜色一致,但Alpha为半透明。如果视锥完全包含八叉树节点,八叉树节点包围盒和精灵包围盒变为蓝色,同样精灵包围盒的Alpha为半透明。
		 * 如果不开启八叉树裁剪,使用绿色像素线绘制精灵包围盒。
		 */
		debugFrustumCulling:boolean;

		/*
		 * 获取默认物理功能初始化内存，单位为M。
		 * @return 默认物理功能初始化内存。
		 */

		/*
		 * 设置默认物理功能初始化内存，单位为M。
		 * @param value 默认物理功能初始化内存。
		 */
		defaultPhysicsMemory:number;

		/*
		 * 创建一个 <code>Config3D</code> 实例。
		 */

		constructor();

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(dest:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

declare module laya.ani {

	/*
	 * 开始播放时调度。
	 * @eventType Event.PLAYED
	 */

	/*
	 * 暂停时调度。
	 * @eventType Event.PAUSED
	 */

	/*
	 * 完成一次循环时调度。
	 * @eventType Event.COMPLETE
	 */

	/*
	 * 停止时调度。
	 * @eventType Event.STOPPED
	 */

	/*
	 * <code>AnimationPlayer</code> 类用于动画播放器。
	 */
	class AnimationPlayer extends laya.events.EventDispatcher implements laya.resource.IDestroy  {

		/*
		 * @private 
		 */
		private _destroyed:any;

		/*
		 * 数据模板
		 */
		private _templet:any;

		/*
		 * 当前精确时间，不包括重播时间
		 */
		private _currentTime:any;

		/*
		 * 当前帧时间，不包括重播时间
		 */
		private _currentFrameTime:any;

		/*
		 * 动画播放的起始时间位置
		 */
		private _playStart:any;

		/*
		 * 动画播放的结束时间位置
		 */
		private _playEnd:any;

		/*
		 * 动画播放一次的总时间
		 */
		private _playDuration:any;

		/*
		 * 动画播放总时间
		 */
		private _overallDuration:any;

		/*
		 * 是否在一次动画结束时停止。 设置这个标志后就不会再发送complete事件了
		 */
		private _stopWhenCircleFinish:any;

		/*
		 * 播放时帧数
		 */
		private _startUpdateLoopCount:any;

		/*
		 * 当前动画索引
		 */
		private _currentAnimationClipIndex:any;

		/*
		 * 当前帧数
		 */
		private _currentKeyframeIndex:any;

		/*
		 * 是否暂停
		 */
		private _paused:any;

		/*
		 * 默认帧率,必须大于0
		 */
		private _cacheFrameRate:any;

		/*
		 * 帧率间隔时间
		 */
		private _cacheFrameRateInterval:any;

		/*
		 * 缓存播放速率
		 */
		private _cachePlayRate:any;

		/*
		 * 是否缓存
		 */
		isCache:boolean;

		/*
		 * 播放速率
		 */
		playbackRate:number;

		/*
		 * 停止时是否归零
		 */
		returnToZeroStopped:boolean;

		/*
		 * 获取动画数据模板
		 * @param value 动画数据模板
		 */

		/*
		 * 设置动画数据模板,注意：修改此值会有计算开销。
		 * @param value 动画数据模板
		 */
		templet:laya.ani.AnimationTemplet;

		/*
		 * 动画播放的起始时间位置。
		 * @return 起始时间位置。
		 */
		readonly playStart:number;

		/*
		 * 动画播放的结束时间位置。
		 * @return 结束时间位置。
		 */
		readonly playEnd:number;

		/*
		 * 获取动画播放一次的总时间
		 * @return 动画播放一次的总时间
		 */
		readonly playDuration:number;

		/*
		 * 获取动画播放的总总时间
		 * @return 动画播放的总时间
		 */
		readonly overallDuration:number;

		/*
		 * 获取当前动画索引
		 * @return value 当前动画索引
		 */
		readonly currentAnimationClipIndex:number;

		/*
		 * 获取当前帧数
		 * @return 当前帧数
		 */
		readonly currentKeyframeIndex:number;

		/*
		 * 获取当前精确时间，不包括重播时间
		 * @return value 当前时间
		 */
		readonly currentPlayTime:number;

		/*
		 * 获取当前帧时间，不包括重播时间
		 * @return value 当前时间
		 */
		readonly currentFrameTime:number;

		/*
		 * 获取缓存播放速率。*
		 * @return 缓存播放速率。
		 */

		/*
		 * 设置缓存播放速率,默认值为1.0,注意：修改此值会有计算开销。*
		 * @return value 缓存播放速率。
		 */
		cachePlayRate:number;

		/*
		 * 获取默认帧率*
		 * @return value 默认帧率
		 */

		/*
		 * 设置默认帧率,每秒60帧,注意：修改此值会有计算开销。*
		 * @return value 缓存帧率
		 */
		cacheFrameRate:number;

		/*
		 * 设置当前播放位置
		 * @param value 当前时间
		 */
		currentTime:number;

		/*
		 * 获取当前是否暂停
		 * @return 是否暂停
		 */

		/*
		 * 设置是否暂停
		 * @param value 是否暂停
		 */
		paused:boolean;

		/*
		 * 获取缓存帧率间隔时间
		 * @return 缓存帧率间隔时间
		 */
		readonly cacheFrameRateInterval:number;

		/*
		 * 获取当前播放状态
		 * @return 当前播放状态
		 */
		readonly state:number;

		/*
		 * 获取是否已销毁。
		 * @return 是否已销毁。
		 */
		readonly destroyed:boolean;

		/*
		 * 创建一个 <code>AnimationPlayer</code> 实例。
		 */

		constructor();

		/*
		 * @private 
		 */
		private _computeFullKeyframeIndices:any;

		/*
		 * @private 
		 */
		private _onAnimationTempletLoaded:any;

		/*
		 * @private 
		 */
		private _calculatePlayDuration:any;

		/*
		 * @private 
		 */
		private _setPlayParams:any;

		/*
		 * 动画停止了对应的参数。目前都是设置时间为最后
		 * @private 
		 */
		private _setPlayParamsWhenStop:any;

		/*
		 * 播放动画。
		 * @param index 动画索引。
		 * @param playbackRate 播放速率。
		 * @param duration 播放时长（0为1次,Number.MAX_VALUE为循环播放）。
		 * @param playStart 播放的起始时间位置。
		 * @param playEnd 播放的结束时间位置。（0为动画一次循环的最长结束时间位置）。
		 */
		play(index?:number,playbackRate?:number,overallDuration?:number,playStart?:number,playEnd?:number):void;

		/*
		 * 播放动画。
		 * @param index 动画索引。
		 * @param playbackRate 播放速率。
		 * @param duration 播放时长（0为1次,Number.MAX_VALUE为循环播放）。
		 * @param playStartFrame 播放的原始起始帧率位置。
		 * @param playEndFrame 播放的原始结束帧率位置。（0为动画一次循环的最长结束时间位置）。
		 */
		playByFrame(index?:number,playbackRate?:number,overallDuration?:number,playStartFrame?:number,playEndFrame?:number,fpsIn3DBuilder?:number):void;

		/*
		 * 停止播放当前动画
		 * 如果不是立即停止就等待动画播放完成后再停止
		 * @param immediate 是否立即停止
		 */
		stop(immediate?:boolean):void;

		/*
		 * @private 
		 */
		destroy():void;
	}

}

declare module laya.ani {

	/*
	 * <code>AnimationTemplet</code> 类用于动画模板资源。
	 */
	class AnimationTemplet extends laya.resource.Resource  {
		static interpolation:any[];

		/*
		 * @private 
		 */
		private static _LinearInterpolation_0:any;

		/*
		 * @private 
		 */
		private static _QuaternionInterpolation_1:any;

		/*
		 * @private 
		 */
		private static _AngleInterpolation_2:any;

		/*
		 * @private 
		 */
		private static _RadiansInterpolation_3:any;

		/*
		 * @private 
		 */
		private static _Matrix4x4Interpolation_4:any;

		/*
		 * @private 
		 */
		private static _NoInterpolation_5:any;

		/*
		 * @private 
		 */
		private static _BezierInterpolation_6:any;

		/*
		 * @private 
		 */
		private static _BezierInterpolation_7:any;

		/*
		 * @private 
		 */
		protected unfixedCurrentFrameIndexes:Uint32Array;

		/*
		 * @private 
		 */
		protected unfixedCurrentTimes:Float32Array;

		/*
		 * @private 
		 */
		protected unfixedKeyframes:laya.ani.KeyFramesContent[];

		/*
		 * @private 
		 */
		protected unfixedLastAniIndex:number;

		/*
		 * @private 
		 */
		private _boneCurKeyFrm:any;

		constructor();

		/*
		 * @private 
		 */
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

		/*
		 * 计算当前时间应该对应关键帧的哪一帧
		 * @param nodeframes 当前骨骼的关键帧数据
		 * @param nodeid 骨骼id，因为要使用和更新 _boneCurKeyFrm
		 * @param tm 
		 * @return 问题	最后一帧有问题，例如倒数第二帧时间是0.033ms,则后两帧非常靠近，当实际给最后一帧的时候，根据帧数计算出的时间实际上落在倒数第二帧 	使用与AnimationPlayer一致的累积时间就行
		 */
		getNodeKeyFrame(nodeframes:laya.ani.KeyFramesContent[],nodeid:number,tm:number):number;

		/*
		 * @param aniIndex 
		 * @param originalData 
		 * @param nodesFrameIndices 
		 * @param frameIndex 
		 * @param playCurTime 
		 */
		getOriginalData(aniIndex:number,originalData:Float32Array,nodesFrameIndices:any[],frameIndex:number,playCurTime:number):void;
		getNodesCurrentFrameIndex(aniIndex:number,playCurTime:number):Uint32Array;
		getOriginalDataUnfixedRate(aniIndex:number,originalData:Float32Array,playCurTime:number):void;
	}

}

declare module laya.ani.bone {

	/*
	 * @private 
	 */
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

declare module laya.ani.bone {
	class BoneSlot  {

		/*
		 * 插槽名称
		 */
		name:string;

		/*
		 * 插槽绑定的骨骼名称
		 */
		parent:string;

		/*
		 * 插糟显示数据数据的名称
		 */
		attachmentName:string;

		/*
		 * 原始数据的索引
		 */
		srcDisplayIndex:number;

		/*
		 * 判断对象是否是原对象
		 */
		type:string;

		/*
		 * 模板的指针
		 */
		templet:laya.ani.bone.Templet;

		/*
		 * 当前插槽对应的数据
		 */
		currSlotData:laya.ani.bone.SlotData;

		/*
		 * 当前插槽显示的纹理
		 */
		currTexture:laya.resource.Texture;

		/*
		 * 显示对象对应的数据
		 */
		currDisplayData:laya.ani.bone.SkinSlotDisplayData;

		/*
		 * 显示皮肤的索引
		 */
		displayIndex:number;

		/*
		 * @private 
		 */
		originalIndex:number;

		/*
		 * 用户自定义的皮肤
		 */
		private _diyTexture:any;
		private _parentMatrix:any;
		private _resultMatrix:any;

		/*
		 * 索引替换表
		 */
		private _replaceDic:any;

		/*
		 * 当前diyTexture的动画纹理
		 */
		private _curDiyUV:any;

		/*
		 * 实时模式下，复用使用
		 */
		private _skinSprite:any;

		/*
		 * @private 变形动画数据
		 */
		deformData:any[];

		/*
		 * 设置要显示的插槽数据
		 * @param slotData 
		 * @param disIndex 
		 * @param freshIndex 是否重置纹理
		 */
		showSlotData(slotData:laya.ani.bone.SlotData,freshIndex?:boolean):void;

		/*
		 * 通过名字显示指定对象
		 * @param name 
		 */
		showDisplayByName(name:string):void;

		/*
		 * 替换贴图名
		 * @param tarName 要替换的贴图名
		 * @param newName 替换后的贴图名
		 */
		replaceDisplayByName(tarName:string,newName:string):void;

		/*
		 * 替换贴图索引
		 * @param tarIndex 要替换的索引
		 * @param newIndex 替换后的索引
		 */
		replaceDisplayByIndex(tarIndex:number,newIndex:number):void;

		/*
		 * 指定显示对象
		 * @param index 
		 */
		showDisplayByIndex(index:number):void;

		/*
		 * 替换皮肤
		 * @param _texture 
		 */
		replaceSkin(_texture:laya.resource.Texture):void;

		/*
		 * 保存父矩阵的索引
		 * @param parentMatrix 
		 */
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

		/*
		 * 把纹理画到Graphics上
		 * @param graphics 
		 * @param noUseSave 不使用共享的矩阵对象 _tempResultMatrix，只有实时计算的时候才设置为true
		 */
		draw(graphics:laya.ani.GraphicsAni,boneMatrixArray:any[],noUseSave?:boolean,alpha?:number):void;
		private static _tempVerticleArr:any;

		/*
		 * 显示蒙皮动画
		 * @param boneMatrixArray 当前帧的骨骼矩阵
		 */
		private skinMesh:any;

		/*
		 * 画骨骼的起始点，方便调试
		 * @param graphics 
		 */
		drawBonePoint(graphics:laya.display.Graphics):void;

		/*
		 * 得到显示对象的矩阵
		 * @return 
		 */
		private getDisplayMatrix:any;

		/*
		 * 得到插糟的矩阵
		 * @return 
		 */
		getMatrix():laya.maths.Matrix;

		/*
		 * 用原始数据拷贝出一个
		 * @return 
		 */
		copy():BoneSlot;
	}

}

declare module laya.ani.bone.canvasmesh {

	/*
	 */
	class MeshData  {

		/*
		 * 纹理
		 */
		texture:laya.resource.Texture;

		/*
		 * uv数据
		 */
		uvs:Float32Array;

		/*
		 * 顶点数据
		 */
		vertices:Float32Array;

		/*
		 * 顶点索引
		 */
		indexes:Uint16Array;

		/*
		 * uv变换矩阵
		 */
		uvTransform:laya.maths.Matrix;

		/*
		 * 是否有uv变化矩阵
		 */
		useUvTransform:boolean;

		/*
		 * 扩展像素,用来去除黑边
		 */
		canvasPadding:number;

		/*
		 * 计算mesh的Bounds
		 * @return 
		 */
		getBounds():laya.maths.Rectangle;
	}

}

declare module laya.ani.bone.canvasmesh {
	class SkinMeshForGraphic extends laya.ani.bone.canvasmesh.MeshData  {

		constructor();

		/*
		 * 矩阵
		 */
		transform:laya.maths.Matrix;
		init2(texture:laya.resource.Texture,ps:any[],verticles:any[],uvs:any[]):void;
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

declare module laya.ani.bone {

	/*
	 * 动画开始播放调度
	 * @eventType Event.PLAYED
	 */

	/*
	 * 动画停止播放调度
	 * @eventType Event.STOPPED
	 */

	/*
	 * 动画暂停播放调度
	 * @eventType Event.PAUSED
	 */

	/*
	 * 自定义事件。
	 * @eventType Event.LABEL
	 */

	/*
	 * 骨骼动画由<code>Templet</code>，<code>AnimationPlayer</code>，<code>Skeleton</code>三部分组成。
	 */
	class Skeleton extends laya.display.Sprite  {

		/*
		 * 在canvas模式是否使用简化版的mesh绘制，简化版的mesh将不进行三角形绘制，而改为矩形绘制，能极大提高性能，但是可能某些mesh动画效果会不太正常
		 */
		static useSimpleMeshInCanvas:boolean;
		protected _templet:laya.ani.bone.Templet;

		/*
		 * @private 
		 */
		protected _player:laya.ani.AnimationPlayer;

		/*
		 * @private 
		 */
		protected _curOriginalData:Float32Array;
		private _boneMatrixArray:any;
		private _lastTime:any;
		private _currAniIndex:any;
		private _pause:any;

		/*
		 * @private 
		 */
		protected _aniClipIndex:number;

		/*
		 * @private 
		 */
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

		/*
		 * @private 
		 */
		protected _boneList:laya.ani.bone.Bone[];

		/*
		 * @private 
		 */
		protected _aniSectionDic:any;
		private _eventIndex:any;
		private _drawOrderIndex:any;
		private _drawOrder:any;
		private _lastAniClipIndex:any;
		private _lastUpdateAniClipIndex:any;
		private _playAudio:any;
		private _soundChannelArr:any;

		/*
		 * 创建一个Skeleton对象
		 * @param templet 骨骼动画模板
		 * @param aniMode 动画模式，0不支持换装，1、2支持换装
		 */

		constructor(templet?:laya.ani.bone.Templet,aniMode?:number);

		/*
		 * 初始化动画
		 * @param templet 模板
		 * @param aniMode 动画模式<table><tr><th>模式</th><th>描述</th></tr><tr><td>0</td> <td>使用模板缓冲的数据，模板缓冲的数据，不允许修改（内存开销小，计算开销小，不支持换装）</td></tr><tr><td>1</td> <td>使用动画自己的缓冲区，每个动画都会有自己的缓冲区，相当耗费内存	（内存开销大，计算开销小，支持换装）</td></tr><tr><td>2</td> <td>使用动态方式，去实时去画（内存开销小，计算开销大，支持换装,不建议使用）</td></tr></table>
		 */
		init(templet:laya.ani.bone.Templet,aniMode?:number):void;

		/*
		 * 得到资源的URL
		 */

		/*
		 * 设置动画路径
		 */
		url:string;

		/*
		 * 通过加载直接创建动画
		 * @param path 要加载的动画文件路径
		 * @param complete 加载完成的回调函数
		 * @param aniMode 与<code>Skeleton.init</code>的<code>aniMode</code>作用一致
		 */
		load(path:string,complete?:laya.utils.Handler,aniMode?:number):void;

		/*
		 * 加载完成
		 */
		private _onLoaded:any;

		/*
		 * 解析完成
		 */
		private _parseComplete:any;

		/*
		 * 解析失败
		 */
		private _parseFail:any;

		/*
		 * 传递PLAY事件
		 */
		private _onPlay:any;

		/*
		 * 传递STOP事件
		 */
		private _onStop:any;

		/*
		 * 传递PAUSE事件
		 */
		private _onPause:any;

		/*
		 * 创建骨骼的矩阵，保存每次计算的最终结果
		 */
		private _parseSrcBoneMatrix:any;
		private _emitMissedEvents:any;

		/*
		 * 更新动画
		 * @param autoKey true为正常更新，false为index手动更新
		 */
		private _update:any;

		/*
		 * @private 清掉播放完成的音频
		 * @param force 是否强制删掉所有的声音channel
		 */
		private _onAniSoundStoped:any;

		/*
		 * @private 创建grahics图像. 并且保存到cache中
		 * @param _clipIndex 第几帧
		 */
		protected _createGraphics(_clipIndex?:number):laya.ani.GraphicsAni;
		private _checkIsAllParsed:any;

		/*
		 * 设置deform数据
		 * @param tDeformAniData 
		 * @param tDeformDic 
		 * @param _boneSlotArray 
		 * @param curTime 
		 */
		private _setDeform:any;

		/*
		 * *****************************************定义接口************************************************
		 */

		/*
		 * 得到当前动画的数量
		 * @return 当前动画的数量
		 */
		getAnimNum():number;

		/*
		 * 得到指定动画的名字
		 * @param index 动画的索引
		 */
		getAniNameByIndex(index:number):string;

		/*
		 * 通过名字得到插槽的引用
		 * @param name 动画的名字
		 * @return 插槽的引用
		 */
		getSlotByName(name:string):laya.ani.bone.BoneSlot;

		/*
		 * 通过名字显示一套皮肤
		 * @param name 皮肤的名字
		 * @param freshSlotIndex 是否将插槽纹理重置到初始化状态
		 */
		showSkinByName(name:string,freshSlotIndex?:boolean):void;

		/*
		 * 通过索引显示一套皮肤
		 * @param skinIndex 皮肤索引
		 * @param freshSlotIndex 是否将插槽纹理重置到初始化状态
		 */
		showSkinByIndex(skinIndex:number,freshSlotIndex?:boolean):void;

		/*
		 * 设置某插槽的皮肤
		 * @param slotName 插槽名称
		 * @param index 插糟皮肤的索引
		 */
		showSlotSkinByIndex(slotName:string,index:number):void;

		/*
		 * 设置某插槽的皮肤
		 * @param slotName 插槽名称
		 * @param name 皮肤名称
		 */
		showSlotSkinByName(slotName:string,name:string):void;

		/*
		 * 替换插槽贴图名
		 * @param slotName 插槽名称
		 * @param oldName 要替换的贴图名
		 * @param newName 替换后的贴图名
		 */
		replaceSlotSkinName(slotName:string,oldName:string,newName:string):void;

		/*
		 * 替换插槽的贴图索引
		 * @param slotName 插槽名称
		 * @param oldIndex 要替换的索引
		 * @param newIndex 替换后的索引
		 */
		replaceSlotSkinByIndex(slotName:string,oldIndex:number,newIndex:number):void;

		/*
		 * 设置自定义皮肤
		 * @param name 插糟的名字
		 * @param texture 自定义的纹理
		 */
		setSlotSkin(slotName:string,texture:laya.resource.Texture):void;

		/*
		 * 换装的时候，需要清一下缓冲区
		 */
		private _clearCache:any;

		/*
		 * 播放动画
		 * @param nameOrIndex 动画名字或者索引
		 * @param loop 是否循环播放
		 * @param force false,如果要播的动画跟上一个相同就不生效,true,强制生效
		 * @param start 起始时间
		 * @param end 结束时间
		 * @param freshSkin 是否刷新皮肤数据
		 * @param playAudio 是否播放音频
		 */
		play(nameOrIndex:any,loop:boolean,force?:boolean,start?:number,end?:number,freshSkin?:boolean,playAudio?:boolean):void;

		/*
		 * 停止动画
		 */
		stop():void;

		/*
		 * 设置动画播放速率
		 * @param value 1为标准速率
		 */
		playbackRate(value:number):void;

		/*
		 * 暂停动画的播放
		 */
		paused():void;

		/*
		 * 恢复动画的播放
		 */
		resume():void;

		/*
		 * @private 得到缓冲数据
		 * @param aniIndex 
		 * @param frameIndex 
		 * @return 
		 */
		private _getGrahicsDataWithCache:any;

		/*
		 * @private 保存缓冲grahpics
		 * @param aniIndex 
		 * @param frameIndex 
		 * @param graphics 
		 */
		private _setGrahicsDataWithCache:any;

		/*
		 * 销毁当前动画
		 * @override 
		 */
		destroy(destroyChild?:boolean):void;

		/*
		 * @private 得到帧索引
		 */

		/*
		 * @private 设置帧索引
		 */
		index:number;

		/*
		 * 得到总帧数据
		 */
		readonly total:number;

		/*
		 * 得到播放器的引用
		 */
		readonly player:laya.ani.AnimationPlayer;

		/*
		 * 得到动画模板的引用
		 * @return templet.
		 */
		readonly templet:laya.ani.bone.Templet;
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

declare module laya.ani.bone {
	class SlotData  {
		name:string;
		displayArr:any[];
		getDisplayByName(name:string):number;
	}

}

declare module laya.ani.bone {

	/*
	 * 数据解析完成后的调度。
	 * @eventType Event.COMPLETE
	 */

	/*
	 * 数据解析错误后的调度。
	 * @eventType Event.ERROR
	 */

	/*
	 * 动画模板类
	 */
	class Templet extends laya.ani.AnimationTemplet  {
		private _mainTexture:any;
		private _graphicsCache:any;

		/*
		 * 存放原始骨骼信息
		 */
		srcBoneMatrixArr:any[];

		/*
		 * IK数据
		 */
		ikArr:any[];

		/*
		 * transform数据
		 */
		tfArr:any[];

		/*
		 * path数据
		 */
		pathArr:any[];

		/*
		 * 存放插槽数据的字典
		 */
		boneSlotDic:any;

		/*
		 * 绑定插槽数据的字典
		 */
		bindBoneBoneSlotDic:any;

		/*
		 * 存放插糟数据的数组
		 */
		boneSlotArray:any[];

		/*
		 * 皮肤数据
		 */
		skinDataArray:any[];

		/*
		 * 皮肤的字典数据
		 */
		skinDic:any;

		/*
		 * 存放纹理数据
		 */
		subTextureDic:any;

		/*
		 * 是否解析失败
		 */
		isParseFail:boolean;

		/*
		 * 反转矩阵，有些骨骼动画要反转才能显示
		 */
		yReverseMatrix:laya.maths.Matrix;

		/*
		 * 渲染顺序动画数据
		 */
		drawOrderAniArr:any[];

		/*
		 * 事件动画数据
		 */
		eventAniArr:any[];

		/*
		 * @private 索引对应的名称
		 */
		attachmentNames:any[];

		/*
		 * 顶点动画数据
		 */
		deformAniArr:any[];

		/*
		 * 实际显示对象列表，用于销毁用
		 */
		skinSlotDisplayDataArr:laya.ani.bone.SkinSlotDisplayData[];

		/*
		 * 是否需要解析audio数据
		 */
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

		/*
		 * @private 
		 */
		tMatrixDataLen:number;
		mRootBone:laya.ani.bone.Bone;
		mBoneArr:laya.ani.bone.Bone[];
		loadAni(url:string):void;
		private onComplete:any;

		/*
		 * 解析骨骼动画数据
		 * @param texture 骨骼动画用到的纹理
		 * @param skeletonData 骨骼动画信息及纹理分块信息
		 * @param playbackRate 缓冲的帧率数据（会根据帧率去分帧）
		 */
		parseData(texture:laya.resource.Texture,skeletonData:ArrayBuffer,playbackRate?:number):void;

		/*
		 * 创建动画
		 * 0,使用模板缓冲的数据，模板缓冲的数据，不允许修改					（内存开销小，计算开销小，不支持换装）
		 * 1,使用动画自己的缓冲区，每个动画都会有自己的缓冲区，相当耗费内存	（内存开销大，计算开销小，支持换装）
		 * 2,使用动态方式，去实时去画										（内存开销小，计算开销大，支持换装,不建议使用）
		 * @param aniMode 0	动画模式，0:不支持换装,1,2支持换装
		 * @return 
		 */
		buildArmature(aniMode?:number):laya.ani.bone.Skeleton;

		/*
		 * @private 解析动画
		 * @param data 解析的二进制数据
		 * @param playbackRate 帧率
		 * @override 
		 */
		parse(data:ArrayBuffer):void;
		private _parseTexturePath:any;

		/*
		 * 纹理加载完成
		 */
		private _textureComplete:any;

		/*
		 * 解析自定义数据
		 */
		private _parsePublicExtData:any;

		/*
		 * 得到指定的纹理
		 * @param name 纹理的名字
		 * @return 
		 */
		getTexture(name:string):laya.resource.Texture;

		/*
		 * @private 显示指定的皮肤
		 * @param boneSlotDic 插糟字典的引用
		 * @param skinIndex 皮肤的索引
		 * @param freshDisplayIndex 是否重置插槽纹理
		 */
		showSkinByIndex(boneSlotDic:any,skinIndex:number,freshDisplayIndex?:boolean):boolean;

		/*
		 * 通过皮肤名字得到皮肤索引
		 * @param skinName 皮肤名称
		 * @return 
		 */
		getSkinIndexByName(skinName:string):number;

		/*
		 * @private 得到缓冲数据
		 * @param aniIndex 动画索引
		 * @param frameIndex 帧索引
		 * @return 
		 */
		getGrahicsDataWithCache(aniIndex:number,frameIndex:number):laya.display.Graphics;

		/*
		 * @private 保存缓冲grahpics
		 * @param aniIndex 动画索引
		 * @param frameIndex 帧索引
		 * @param graphics 要保存的数据
		 */
		setGrahicsDataWithCache(aniIndex:number,frameIndex:number,graphics:laya.display.Graphics):void;
		deleteAniData(aniIndex:number):void;

		/*
		 * 释放纹理
		 * @override 
		 */
		destroy():void;

		/*
		 * *********************************下面为一些儿访问接口****************************************
		 */

		/*
		 * 通过索引得动画名称
		 * @param index 
		 * @return 
		 */
		getAniNameByIndex(index:number):string;
		rate:number;
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

declare module laya.ani {
	class GraphicsAni extends laya.display.Graphics  {

		/*
		 * @private 画自定义蒙皮动画
		 * @param skin 
		 */
		drawSkin(skinA:laya.ani.bone.canvasmesh.SkinMeshForGraphic,alpha:number):void;
		private static _caches:any;
		static create():GraphicsAni;
		static recycle(graphics:GraphicsAni):void;
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

declare module laya.ani.swf {

	/*
	 * 动画播放完毕后调度。
	 * @eventType Event.COMPLETE
	 */

	/*
	 * 播放到某标签后调度。
	 * @eventType Event.LABEL
	 */

	/*
	 * 加载完成后调度。
	 * @eventType Event.LOADED
	 */

	/*
	 * 进入帧后调度。
	 * @eventType Event.FRAME
	 */

	/*
	 * <p> <code>MovieClip</code> 用于播放经过工具处理后的 swf 动画。</p>
	 */
	class MovieClip extends laya.display.Sprite  {

		/*
		 * @private 
		 */
		protected static _ValueList:any[];

		/*
		 * @private 数据起始位置。
		 */
		protected _start:number;

		/*
		 * @private 当前位置。
		 */
		protected _Pos:number;

		/*
		 * @private 数据。
		 */
		protected _data:laya.utils.Byte;

		/*
		 * @private 
		 */
		protected _curIndex:number;

		/*
		 * @private 
		 */
		protected _preIndex:number;

		/*
		 * @private 
		 */
		protected _playIndex:number;

		/*
		 * @private 
		 */
		protected _playing:boolean;

		/*
		 * @private 
		 */
		protected _ended:boolean;

		/*
		 * @private 总帧数。
		 */
		protected _count:number;

		/*
		 * @private 
		 */
		protected _loadedImage:any;

		/*
		 * @private 
		 */
		protected _labels:any;

		/*
		 * 资源根目录。
		 */
		basePath:string;

		/*
		 * @private 
		 */
		private _atlasPath:any;

		/*
		 * @private 
		 */
		private _url:any;

		/*
		 * @private 
		 */
		private _isRoot:any;

		/*
		 * @private 
		 */
		private _completeHandler:any;

		/*
		 * @private 
		 */
		private _endFrame:any;

		/*
		 * 播放间隔(单位：毫秒)。
		 */
		interval:number;

		/*
		 * 是否循环播放
		 */
		loop:boolean;

		/*
		 * 创建一个 <code>MovieClip</code> 实例。
		 * @param parentMovieClip 父MovieClip,自己创建时不需要传该参数
		 */

		constructor(parentMovieClip?:MovieClip);

		/*
		 * <p>销毁此对象。以及销毁引用的Texture</p>
		 * @param destroyChild 是否同时销毁子节点，若值为true,则销毁子节点，否则不销毁子节点。
		 * @override 
		 */
		destroy(destroyChild?:boolean):void;

		/*
		 * @private 
		 * @override 
		 */
		protected _onDisplay(value?:boolean):void;

		/*
		 * @private 更新时间轴
		 */
		updates():void;

		/*
		 * 当前播放索引。
		 */
		index:number;

		/*
		 * 增加一个标签到index帧上，播放到此index后会派发label事件
		 * @param label 标签名称
		 * @param index 索引位置
		 */
		addLabel(label:string,index:number):void;

		/*
		 * 删除某个标签
		 * @param label 标签名字，如果label为空，则删除所有Label
		 */
		removeLabel(label:string):void;

		/*
		 * 帧总数。
		 */
		readonly count:number;

		/*
		 * 是否在播放中
		 */
		readonly playing:boolean;

		/*
		 * @private 动画的帧更新处理函数。
		 */
		private _update:any;

		/*
		 * 停止播放动画。
		 */
		stop():void;

		/*
		 * 跳到某帧并停止播放动画。
		 * @param frame 要跳到的帧
		 */
		gotoAndStop(index:number):void;

		/*
		 * @private 清理。
		 */
		private _clear:any;

		/*
		 * 播放动画。
		 * @param index 帧索引。
		 */
		play(index?:number,loop?:boolean):void;

		/*
		 * @private 
		 */
		private _displayFrame:any;

		/*
		 * @private 
		 */
		private _reset:any;

		/*
		 * @private 
		 */
		private _parseFrame:any;

		/*
		 * 资源地址。
		 */
		url:string;

		/*
		 * 加载资源。
		 * @param url swf 资源地址。
		 * @param atlas 是否使用图集资源
		 * @param atlasPath 图集路径，默认使用与swf同名的图集
		 */
		load(url:string,atlas?:boolean,atlasPath?:string):void;

		/*
		 * @private 
		 */
		private _onLoaded:any;

		/*
		 * @private 
		 */
		private _initState:any;

		/*
		 * @private 
		 */
		private _initData:any;

		/*
		 * 从开始索引播放到结束索引，结束之后出发complete回调
		 * @param start 开始索引
		 * @param end 结束索引
		 * @param complete 结束回调
		 */
		playTo(start:number,end:number,complete?:laya.utils.Handler):void;
	}

}

declare module laya.components {

	/*
	 * <code>CommonScript</code> 类用于创建公共脚本类。
	 */
	class CommonScript extends laya.components.Component  {

		/*
		 * @inheritDoc 
		 * @override 
		 */
		readonly isSingleton:boolean;

		constructor();

		/*
		 * 创建后只执行一次
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onAwake():void;

		/*
		 * 每次启动后执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onEnable():void;

		/*
		 * 第一次执行update之前执行，只会执行一次
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onStart():void;

		/*
		 * 每帧更新时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onUpdate():void;

		/*
		 * 每帧更新时执行，在update之后执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onLateUpdate():void;

		/*
		 * 禁用时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onDisable():void;

		/*
		 * 销毁时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onDestroy():void;
	}

}

declare module laya.components {

	/*
	 * <code>Component</code> 类用于创建组件的基类。
	 */
	class Component implements laya.resource.ISingletonElement,laya.resource.IDestroy  {

		/*
		 * @private [实现IListPool接口]
		 */
		private _indexInList:any;

		/*
		 * @private 
		 */
		private _awaked:any;

		/*
		 * [只读]获取所属Node节点。
		 * @readonly 
		 */
		owner:laya.display.Node;

		/*
		 * 创建一个新的 <code>Component</code> 实例。
		 */

		constructor();

		/*
		 * 获取唯一标识ID。
		 */
		readonly id:number;

		/*
		 * 获取是否启用组件。
		 */
		enabled:boolean;

		/*
		 * 获取是否为单实例组件。
		 */
		readonly isSingleton:boolean;

		/*
		 * 获取是否已经销毁 。
		 */
		readonly destroyed:boolean;

		/*
		 * @private 
		 */
		private _resetComp:any;

		/*
		 * [实现IListPool接口]
		 */
		_getIndexInList():number;

		/*
		 * [实现IListPool接口]
		 */
		_setIndexInList(index:number):void;

		/*
		 * 被激活后调用，可根据需要重写此方法
		 * @private 
		 */
		protected _onAwake():void;

		/*
		 * 被激活后调用，可根据需要重写此方法
		 * @private 
		 */
		protected _onEnable():void;

		/*
		 * 被禁用时调用，可根据需要重写此方法
		 * @private 
		 */
		protected _onDisable():void;

		/*
		 * 被销毁时调用，可根据需要重写此方法
		 * @private 
		 */
		protected _onDestroy():void;

		/*
		 * 重置组件参数到默认值，如果实现了这个函数，则组件会被重置并且自动回收到对象池，方便下次复用
		 * 如果没有重置，则不进行回收复用
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onReset():void;

		/*
		 * 销毁组件
		 */
		destroy():void;
	}

}

declare module laya.components {

	/*
	 * 模板，预制件
	 */
	class Prefab  {

		/*
		 * @private 
		 */
		json:any;

		/*
		 * 通过预制创建实例
		 */
		create():any;
	}

}

declare module laya.components {

	/*
	 * <code>Script</code> 类用于创建脚本的父类，该类为抽象类，不允许实例。
	 * 组件的生命周期
	 */
	class Script extends laya.components.Component  {

		/*
		 * @inheritDoc 
		 * @override 
		 */
		readonly isSingleton:boolean;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onAwake():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onEnable():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onDisable():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onDestroy():void;

		/*
		 * 组件被激活后执行，此时所有节点和组件均已创建完毕，次方法只执行一次
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onAwake():void;

		/*
		 * 组件被启用后执行，比如节点被添加到舞台后
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onEnable():void;

		/*
		 * 第一次执行update之前执行，只会执行一次
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onStart():void;

		/*
		 * 开始碰撞时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onTriggerEnter(other:any,self:any,contact:any):void;

		/*
		 * 持续碰撞时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onTriggerStay(other:any,self:any,contact:any):void;

		/*
		 * 结束碰撞时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onTriggerExit(other:any,self:any,contact:any):void;

		/*
		 * 鼠标按下时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onMouseDown(e:laya.events.Event):void;

		/*
		 * 鼠标抬起时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onMouseUp(e:laya.events.Event):void;

		/*
		 * 鼠标点击时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onClick(e:laya.events.Event):void;

		/*
		 * 鼠标在舞台按下时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onStageMouseDown(e:laya.events.Event):void;

		/*
		 * 鼠标在舞台抬起时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onStageMouseUp(e:laya.events.Event):void;

		/*
		 * 鼠标在舞台点击时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onStageClick(e:laya.events.Event):void;

		/*
		 * 鼠标在舞台移动时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onStageMouseMove(e:laya.events.Event):void;

		/*
		 * 鼠标双击时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onDoubleClick(e:laya.events.Event):void;

		/*
		 * 鼠标右键点击时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onRightClick(e:laya.events.Event):void;

		/*
		 * 鼠标移动时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onMouseMove(e:laya.events.Event):void;

		/*
		 * 鼠标经过节点时触发
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onMouseOver(e:laya.events.Event):void;

		/*
		 * 鼠标离开节点时触发
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onMouseOut(e:laya.events.Event):void;

		/*
		 * 键盘按下时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onKeyDown(e:laya.events.Event):void;

		/*
		 * 键盘产生一个字符时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onKeyPress(e:laya.events.Event):void;

		/*
		 * 键盘抬起时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onKeyUp(e:laya.events.Event):void;

		/*
		 * 每帧更新时执行，尽量不要在这里写大循环逻辑或者使用getComponent方法
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onUpdate():void;

		/*
		 * 每帧更新时执行，在update之后执行，尽量不要在这里写大循环逻辑或者使用getComponent方法
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onLateUpdate():void;

		/*
		 * 渲染之前执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onPreRender():void;

		/*
		 * 渲染之后执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onPostRender():void;

		/*
		 * 组件被禁用时执行，比如从节点从舞台移除后
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onDisable():void;

		/*
		 * 手动调用节点销毁时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onDestroy():void;
	}

}

declare module laya {

	/*
	 * @private 静态常量集合
	 */
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

declare module laya.d3.animation {

	/*
	 * <code>AnimationClip</code> 类用于动画片段资源。
	 */
	class AnimationClip extends laya.resource.Resource  {

		/*
		 * AnimationClip资源。
		 */
		static ANIMATIONCLIP:string;

		/*
		 * @inheritDoc 
		 */
		static _parse(data:any,propertyParams?:any,constructParams?:any[]):AnimationClip;

		/*
		 * 加载动画片段。
		 * @param url 动画片段地址。
		 * @param complete 完成回掉。
		 */
		static load(url:string,complete:laya.utils.Handler):void;

		/*
		 * 是否循环。
		 */
		islooping:boolean;

		/*
		 * 获取动画片段时长。
		 */
		duration():number;

		/*
		 * 创建一个 <code>AnimationClip</code> 实例。
		 */

		constructor();
		private _hermiteInterpolate:any;
		private _hermiteInterpolateVector3:any;
		private _hermiteInterpolateQuaternion:any;
		_evaluateClipDatasRealTimeForNative(nodes:any,playCurTime:number,realTimeCurrentFrameIndexes:Uint16Array,addtive:boolean):void;
		private _evaluateFrameNodeVector3DatasRealTime:any;
		private _evaluateFrameNodeQuaternionDatasRealTime:any;
		private _binarySearchEventIndex:any;

		/*
		 * 添加动画事件。
		 */
		addEvent(event:laya.d3.animation.AnimationEvent):void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _disposeResource():void;
	}

}

declare module laya.d3.animation {

	/*
	 * <code>AnimationEvent</code> 类用于实现动画事件。
	 */
	class AnimationEvent  {

		/*
		 * 事件触发时间。
		 */
		time:number;

		/*
		 * 事件触发名称。
		 */
		eventName:string;

		/*
		 * 事件触发参数。
		 */
		params:any[];

		/*
		 * 创建一个 <code>AnimationEvent</code> 实例。
		 */

		constructor();
	}

}

declare module laya.d3.animation {

	/*
	 * <code>BoneNode</code> 类用于实现骨骼节点。
	 */
	class AnimationNode implements laya.d3.core.IClone  {
		private _children:any;

		/*
		 * 节点名称。
		 */
		name:string;

		/*
		 * 创建一个新的 <code>AnimationNode</code> 实例。
		 */

		constructor(localPosition?:Float32Array,localRotation?:Float32Array,localScale?:Float32Array,worldMatrix?:Float32Array);

		/*
		 * 添加子节点。
		 * @param child 子节点。
		 */
		addChild(child:AnimationNode):void;

		/*
		 * 移除子节点。
		 * @param child 子节点。
		 */
		removeChild(child:AnimationNode):void;

		/*
		 * 根据名字获取子节点。
		 * @param name 名字。
		 */
		getChildByName(name:string):AnimationNode;

		/*
		 * 根据索引获取子节点。
		 * @param index 索引。
		 */
		getChildByIndex(index:number):AnimationNode;

		/*
		 * 获取子节点的个数。
		 */
		getChildCount():number;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.animation {

	/*
	 * <code>AnimationTransform3D</code> 类用于实现3D变换。
	 */
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

		/*
		 * 创建一个 <code>Transform3D</code> 实例。
		 * @param owner 所属精灵。
		 */

		constructor(owner:laya.d3.animation.AnimationNode,localPosition?:Float32Array,localRotation?:Float32Array,localScale?:Float32Array,worldMatrix?:Float32Array);
		private _getlocalMatrix:any;
		private _onWorldTransform:any;

		/*
		 * 获取世界矩阵。
		 * @return 世界矩阵。
		 */
		getWorldMatrix():Float32Array;

		/*
		 * 设置父3D变换。
		 * @param value 父3D变换。
		 */
		setParent(value:AnimationTransform3D):void;
	}

}

declare module laya.d3.animation {

	/*
	 * <code>AnimatorStateScript</code> 类用于动画状态脚本的父类,该类为抽象类,不允许实例。
	 */
	class AnimatorStateScript  {

		/*
		 * 创建一个新的 <code>AnimatorStateScript</code> 实例。
		 */

		constructor();

		/*
		 * 动画状态开始时执行。
		 */
		onStateEnter():void;

		/*
		 * 动画状态更新时执行。
		 */
		onStateUpdate():void;

		/*
		 * 动画状态退出时执行。
		 */
		onStateExit():void;
	}

}

declare module laya.d3 {

	/*
	 * /**
	 *    <code>CastShadowList</code> 类用于实现产生阴影者队列。
	 */
	class CastShadowList extends laya.d3.component.SingletonList<laya.resource.ISingletonElement>  {

		/*
		 * 创建一个新的 <code>CastShadowList</code> 实例。
		 */

		constructor();
	}

}

declare module laya.d3.component {

	/*
	 * <code>Animator</code> 类用于创建动画组件。
	 */
	class Animator extends laya.components.Component  {
		private static _tempVector30:any;
		private static _tempVector31:any;
		private static _tempQuaternion0:any;
		private static _tempQuaternion1:any;
		private static _tempVector3Array0:any;
		private static _tempVector3Array1:any;
		private static _tempQuaternionArray0:any;
		private static _tempQuaternionArray1:any;

		/*
		 * 裁剪模式_始终播放动画。
		 */
		static CULLINGMODE_ALWAYSANIMATE:number;

		/*
		 * 裁剪模式_不可见时完全不播放动画。
		 */
		static CULLINGMODE_CULLCOMPLETELY:number;
		private _speed:any;
		private _keyframeNodeOwnerMap:any;
		private _keyframeNodeOwners:any;
		private _updateMark:any;
		private _controllerLayers:any;

		/*
		 * 裁剪模式
		 */
		cullingMode:number;

		/*
		 * 获取动画的播放速度,1.0为正常播放速度。
		 * @return 动画的播放速度。
		 */

		/*
		 * 设置动画的播放速度,1.0为正常播放速度。
		 * @param 动画的播放速度 。
		 */
		speed:number;

		/*
		 * 创建一个 <code>Animation</code> 实例。
		 */

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

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onDestroy():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onEnable():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onDisable():void;

		/*
		 * 获取默认动画状态。
		 * @param layerIndex 层索引。
		 * @return 默认动画状态。
		 */
		getDefaultState(layerIndex?:number):laya.d3.component.AnimatorState;

		/*
		 * 添加动画状态。
		 * @param state 动画状态。
		 * @param layerIndex 层索引。
		 */
		addState(state:laya.d3.component.AnimatorState,layerIndex?:number):void;

		/*
		 * 移除动画状态。
		 * @param state 动画状态。
		 * @param layerIndex 层索引。
		 */
		removeState(state:laya.d3.component.AnimatorState,layerIndex?:number):void;

		/*
		 * 添加控制器层。
		 */
		addControllerLayer(controllderLayer:laya.d3.component.AnimatorControllerLayer):void;

		/*
		 * 获取控制器层。
		 */
		getControllerLayer(layerInex?:number):laya.d3.component.AnimatorControllerLayer;

		/*
		 * 获取当前的播放状态。
		 * @param layerIndex 层索引。
		 * @return 动画播放状态。
		 */
		getCurrentAnimatorPlayState(layerInex?:number):laya.d3.component.AnimatorPlayState;

		/*
		 * 播放动画。
		 * @param name 如果为null则播放默认动画，否则按名字播放动画片段。
		 * @param layerIndex 层索引。
		 * @param normalizedTime 归一化的播放起始时间。
		 */
		play(name?:string,layerIndex?:number,normalizedTime?:number):void;

		/*
		 * 在当前动画状态和目标动画状态之间进行融合过渡播放。
		 * @param name 目标动画状态。
		 * @param transitionDuration 过渡时间,该值为当前动画状态的归一化时间，值在0.0~1.0之间。
		 * @param layerIndex 层索引。
		 * @param normalizedTime 归一化的播放起始时间。
		 */
		crossFade(name:string,transitionDuration:number,layerIndex?:number,normalizedTime?:number):void;
		private _avatar:any;

		/*
		 * 获取avatar。
		 * @return avator。
		 */

		/*
		 * 设置avatar。
		 * @param value avatar。
		 */
		avatar:laya.d3.core.Avatar;
		private _getAvatarOwnersAndInitDatasAsync:any;
		private _isLinkSpriteToAnimationNode:any;
		private _isLinkSpriteToAnimationNodeData:any;

		/*
		 * 关联精灵节点到Avatar节点,此Animator必须有Avatar文件。
		 * @param nodeName 关联节点的名字。
		 * @param sprite3D 精灵节点。
		 * @return 是否关联成功。
		 */
		linkSprite3DToAvatarNode(nodeName:string,sprite3D:laya.d3.core.Sprite3D):boolean;

		/*
		 * 解除精灵节点到Avatar节点的关联,此Animator必须有Avatar文件。
		 * @param sprite3D 精灵节点。
		 * @return 是否解除关联成功。
		 */
		unLinkSprite3DToAvatarNode(sprite3D:laya.d3.core.Sprite3D):boolean;
	}

}

declare module laya.d3.component {

	/*
	 * <code>AnimatorControllerLayer</code> 类用于创建动画控制器层。
	 */
	class AnimatorControllerLayer implements laya.d3.resource.IReferenceCounter,laya.d3.core.IClone  {
		private _defaultState:any;
		private _referenceCount:any;

		/*
		 * 层的名称。
		 */
		name:string;

		/*
		 * 名称。
		 */
		blendingMode:number;

		/*
		 * 权重。
		 */
		defaultWeight:number;

		/*
		 * 激活时是否自动播放
		 */
		playOnWake:boolean;

		/*
		 * 获取默认动画状态。
		 * @return 默认动画状态。
		 */

		/*
		 * 设置默认动画状态。
		 * @param value 默认动画状态。
		 */
		defaultState:laya.d3.component.AnimatorState;

		/*
		 * 创建一个 <code>AnimatorControllerLayer</code> 实例。
		 */

		constructor(name:string);
		private _removeClip:any;

		/*
		 * @implements IReferenceCounter
		 */
		_getReferenceCount():number;

		/*
		 * @implements IReferenceCounter
		 */
		_addReference(count?:number):void;

		/*
		 * @implements IReferenceCounter
		 */
		_removeReference(count?:number):void;

		/*
		 * @implements IReferenceCounter
		 */
		_clearReference():void;

		/*
		 * 添加动画状态。
		 * @param state 动画状态。
		 * @param layerIndex 层索引。
		 */
		addState(state:laya.d3.component.AnimatorState):void;

		/*
		 * 移除动画状态。
		 * @param state 动画状态。
		 * @param layerIndex 层索引。
		 */
		removeState(state:laya.d3.component.AnimatorState):void;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.component {

	/*
	 * <code>AnimatorPlayState</code> 类用于创建动画播放状态信息。
	 */
	class AnimatorPlayState  {

		/*
		 * 获取播放状态的归一化时间,整数为循环次数，小数为单次播放时间。
		 */
		readonly normalizedTime:number;

		/*
		 * 获取当前动画的持续时间，以秒为单位。
		 */
		readonly duration:number;

		/*
		 * 创建一个 <code>AnimatorPlayState</code> 实例。
		 */

		constructor();
	}

}

declare module laya.d3.component {

	/*
	 * <code>AnimatorState</code> 类用于创建动作状态。
	 */
	class AnimatorState implements laya.d3.resource.IReferenceCounter,laya.d3.core.IClone  {
		private _referenceCount:any;

		/*
		 * 名称。
		 */
		name:string;

		/*
		 * 动画播放速度,1.0为正常播放速度。
		 */
		speed:number;

		/*
		 * 动作播放起始时间。
		 */
		clipStart:number;

		/*
		 * 动作播放结束时间。
		 */
		clipEnd:number;

		/*
		 * 获取动作。
		 * @return 动作
		 */

		/*
		 * 设置动作。
		 * @param value 动作。
		 */
		clip:laya.d3.animation.AnimationClip;

		/*
		 * 创建一个 <code>AnimatorState</code> 实例。
		 */

		constructor();

		/*
		 * @implements IReferenceCounter
		 */
		_getReferenceCount():number;

		/*
		 * @implements IReferenceCounter
		 */
		_addReference(count?:number):void;

		/*
		 * @implements IReferenceCounter
		 */
		_removeReference(count?:number):void;

		/*
		 * @implements IReferenceCounter
		 */
		_clearReference():void;

		/*
		 * 添加脚本。
		 * @param type 组件类型。
		 * @return 脚本。
		 */
		addScript(type:new () => any):laya.d3.animation.AnimatorStateScript;

		/*
		 * 获取脚本。
		 * @param type 组件类型。
		 * @return 脚本。
		 */
		getScript(type:new () => any):laya.d3.animation.AnimatorStateScript;

		/*
		 * 获取脚本集合。
		 * @param type 组件类型。
		 * @return 脚本集合。
		 */
		getScripts(type:new () => any):laya.d3.animation.AnimatorStateScript[];

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.component {

	/*
	 * <code>PostProcess</code> 类用于创建后期处理组件。
	 */
	class PostProcess  {
		private _compositeShader:any;
		private _compositeShaderData:any;
		private _effects:any;

		/*
		 * 创建一个 <code>PostProcess</code> 实例。
		 */

		constructor();

		/*
		 * 添加后期处理效果。
		 */
		addEffect(effect:laya.d3.core.render.PostProcessEffect):void;

		/*
		 * 移除后期处理效果。
		 */
		removeEffect(effect:laya.d3.core.render.PostProcessEffect):void;
	}

}

declare module laya.d3.component {

	/*
	 * <code>Script3D</code> 类用于创建脚本的父类,该类为抽象类,不允许实例。
	 */
	class Script3D extends laya.components.Component  {

		/*
		 * @inheritDoc 
		 * @override 
		 */
		readonly isSingleton:boolean;
		private _checkProcessTriggers:any;
		private _checkProcessCollisions:any;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onAwake():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onEnable():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onDisable():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onDestroy():void;

		/*
		 * 创建后只执行一次
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onAwake():void;

		/*
		 * 每次启动后执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onEnable():void;

		/*
		 * 第一次执行update之前执行，只会执行一次
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onStart():void;

		/*
		 * 开始触发时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onTriggerEnter(other:laya.d3.physics.PhysicsComponent):void;

		/*
		 * 持续触发时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onTriggerStay(other:laya.d3.physics.PhysicsComponent):void;

		/*
		 * 结束触发时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onTriggerExit(other:laya.d3.physics.PhysicsComponent):void;

		/*
		 * 开始碰撞时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onCollisionEnter(collision:laya.d3.physics.Collision):void;

		/*
		 * 持续碰撞时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onCollisionStay(collision:laya.d3.physics.Collision):void;

		/*
		 * 结束碰撞时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onCollisionExit(collision:laya.d3.physics.Collision):void;

		/*
		 * 鼠标按下时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onMouseDown():void;

		/*
		 * 鼠标拖拽时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onMouseDrag():void;

		/*
		 * 鼠标点击时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onMouseClick():void;

		/*
		 * 鼠标弹起时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onMouseUp():void;

		/*
		 * 鼠标进入时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onMouseEnter():void;

		/*
		 * 鼠标经过时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onMouseOver():void;

		/*
		 * 鼠标离开时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onMouseOut():void;

		/*
		 * 键盘按下时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onKeyDown(e:laya.events.Event):void;

		/*
		 * 键盘产生一个字符时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onKeyPress(e:laya.events.Event):void;

		/*
		 * 键盘抬起时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onKeyUp(e:laya.events.Event):void;

		/*
		 * 每帧更新时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onUpdate():void;

		/*
		 * 每帧更新时执行，在update之后执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onLateUpdate():void;

		/*
		 * 渲染之前执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onPreRender():void;

		/*
		 * 渲染之后执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onPostRender():void;

		/*
		 * 禁用时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onDisable():void;

		/*
		 * 销毁时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onDestroy():void;
	}

}

declare module laya.d3.component {

	/*
	 * <code>SimpleSingletonList</code> 类用于实现单例队列。
	 */
	class SimpleSingletonList extends laya.d3.component.SingletonList<laya.resource.ISingletonElement>  {

		/*
		 * 创建一个新的 <code>SimpleSingletonList</code> 实例。
		 */

		constructor();
	}

}

declare module laya.d3.component {

	/*
	 * <code>SingletonList</code> 类用于实现单例队列。
	 */
	class SingletonList<T>  {

		/*
		 * 创建一个新的 <code>SingletonList</code> 实例。
		 */

		constructor();
	}

}

declare module laya.d3.core {

	/*
	 * <code>Avatar</code> 类用于创建Avatar。
	 */
	class Avatar extends laya.resource.Resource implements laya.d3.core.IClone  {

		/*
		 * Avatar资源。
		 */
		static AVATAR:string;

		/*
		 * @inheritDoc 
		 */
		static _parse(data:any,propertyParams?:any,constructParams?:any[]):Avatar;

		/*
		 * 加载Avatar文件。
		 * @param url Avatar文件。
		 * @param complete 完成回掉。
		 */
		static load(url:string,complete:laya.utils.Handler):void;

		/*
		 * [NATIVE]
		 */
		private _nativeNodeCount:any;

		/*
		 * 创建一个 <code>Avatar</code> 实例。
		 */

		constructor();
		private _initCloneToAnimator:any;
		private _parseNode:any;

		/*
		 * 克隆数据到Avatr。
		 * @param destObject 克隆源。
		 */
		_cloneDatasToAnimator(destAnimator:laya.d3.component.Animator):void;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.core {

	/*
	 * <code>BaseCamera</code> 类用于创建摄像机的父类。
	 */
	class BaseCamera extends laya.d3.core.Sprite3D  {
		static _tempMatrix4x40:laya.d3.math.Matrix4x4;
		static CAMERAPOS:number;
		static VIEWMATRIX:number;
		static PROJECTMATRIX:number;
		static VIEWPROJECTMATRIX:number;
		static CAMERADIRECTION:number;
		static CAMERAUP:number;

		/*
		 * 渲染模式,延迟光照渲染，暂未开放。
		 */
		static RENDERINGTYPE_DEFERREDLIGHTING:string;

		/*
		 * 渲染模式,前向渲染。
		 */
		static RENDERINGTYPE_FORWARDRENDERING:string;

		/*
		 * 清除标记，固定颜色。
		 */
		static CLEARFLAG_SOLIDCOLOR:number;

		/*
		 * 清除标记，天空。
		 */
		static CLEARFLAG_SKY:number;

		/*
		 * 清除标记，仅深度。
		 */
		static CLEARFLAG_DEPTHONLY:number;

		/*
		 * 清除标记，不清除。
		 */
		static CLEARFLAG_NONE:number;
		protected static _invertYScaleMatrix:laya.d3.math.Matrix4x4;
		protected static _invertYProjectionMatrix:laya.d3.math.Matrix4x4;
		protected static _invertYProjectionViewMatrix:laya.d3.math.Matrix4x4;

		/*
		 * 近裁剪面。
		 */
		private _nearPlane:any;

		/*
		 * 远裁剪面。
		 */
		private _farPlane:any;

		/*
		 * 视野。
		 */
		private _fieldOfView:any;

		/*
		 * 正交投影的垂直尺寸。
		 */
		private _orthographicVerticalSize:any;
		private _skyRenderer:any;
		private _forward:any;
		private _up:any;

		/*
		 * 清楚标记。
		 */
		clearFlag:number;

		/*
		 * 摄像机的清除颜色,默认颜色为CornflowerBlue。
		 */
		clearColor:laya.d3.math.Vector4;

		/*
		 * 可视层位标记遮罩值,支持混合 例:cullingMask=Math.pow(2,0)|Math.pow(2,1)为第0层和第1层可见。
		 */
		cullingMask:number;

		/*
		 * 渲染时是否用遮挡剔除。
		 */
		useOcclusionCulling:boolean;

		/*
		 * 获取天空渲染器。
		 * @return 天空渲染器。
		 */
		readonly skyRenderer:laya.d3.resource.models.SkyRenderer;

		/*
		 * 获取视野。
		 * @return 视野。
		 */

		/*
		 * 设置视野。
		 * @param value 视野。
		 */
		fieldOfView:number;

		/*
		 * 获取近裁面。
		 * @return 近裁面。
		 */

		/*
		 * 设置近裁面。
		 * @param value 近裁面。
		 */
		nearPlane:number;

		/*
		 * 获取远裁面。
		 * @return 远裁面。
		 */

		/*
		 * 设置远裁面。
		 * @param value 远裁面。
		 */
		farPlane:number;

		/*
		 * 获取是否正交投影矩阵。
		 * @return 是否正交投影矩阵。
		 */

		/*
		 * 设置是否正交投影矩阵。
		 * @param 是否正交投影矩阵 。
		 */
		orthographic:boolean;

		/*
		 * 获取正交投影垂直矩阵尺寸。
		 * @return 正交投影垂直矩阵尺寸。
		 */

		/*
		 * 设置正交投影垂直矩阵尺寸。
		 * @param 正交投影垂直矩阵尺寸 。
		 */
		orthographicVerticalSize:number;
		renderingOrder:number;

		/*
		 * 创建一个 <code>BaseCamera</code> 实例。
		 * @param fieldOfView 视野。
		 * @param nearPlane 近裁面。
		 * @param farPlane 远裁面。
		 */

		constructor(nearPlane?:number,farPlane?:number);

		/*
		 * 通过RenderingOrder属性对摄像机机型排序。
		 */
		_sortCamerasByRenderingOrder():void;

		/*
		 * 相机渲染。
		 * @param shader 着色器。
		 * @param replacementTag 着色器替换标记。
		 */
		render(shader?:laya.d3.shader.Shader3D,replacementTag?:string):void;

		/*
		 * 增加可视图层,layer值为0到31层。
		 * @param layer 图层。
		 */
		addLayer(layer:number):void;

		/*
		 * 移除可视图层,layer值为0到31层。
		 * @param layer 图层。
		 */
		removeLayer(layer:number):void;

		/*
		 * 增加所有图层。
		 */
		addAllLayers():void;

		/*
		 * 移除所有图层。
		 */
		removeAllLayers():void;
		resetProjectionMatrix():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onActive():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onInActive():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		destroy(destroyChild?:boolean):void;
	}

}

declare module laya.d3.core {

	/*
	 * <code>Bounds</code> 类用于创建包围体。
	 */
	class Bounds implements laya.d3.core.IClone  {
		private _updateFlag:any;

		/*
		 */
		_boundBox:laya.d3.math.BoundBox;

		/*
		 * 设置包围盒的最小点。
		 * @param value 包围盒的最小点。
		 */
		setMin(value:laya.d3.math.Vector3):void;

		/*
		 * 获取包围盒的最小点。
		 * @return 包围盒的最小点。
		 */
		getMin():laya.d3.math.Vector3;

		/*
		 * 设置包围盒的最大点。
		 * @param value 包围盒的最大点。
		 */
		setMax(value:laya.d3.math.Vector3):void;

		/*
		 * 获取包围盒的最大点。
		 * @return 包围盒的最大点。
		 */
		getMax():laya.d3.math.Vector3;

		/*
		 * 设置包围盒的中心点。
		 * @param value 包围盒的中心点。
		 */
		setCenter(value:laya.d3.math.Vector3):void;

		/*
		 * 获取包围盒的中心点。
		 * @return 包围盒的中心点。
		 */
		getCenter():laya.d3.math.Vector3;

		/*
		 * 设置包围盒的范围。
		 * @param value 包围盒的范围。
		 */
		setExtent(value:laya.d3.math.Vector3):void;

		/*
		 * 获取包围盒的范围。
		 * @return 包围盒的范围。
		 */
		getExtent():laya.d3.math.Vector3;

		/*
		 * 创建一个 <code>Bounds</code> 实例。
		 * @param min min 最小坐标
		 * @param max max 最大坐标。
		 */

		constructor(min:laya.d3.math.Vector3,max:laya.d3.math.Vector3);
		private _getUpdateFlag:any;
		private _setUpdateFlag:any;
		private _getCenter:any;
		private _getExtent:any;
		private _getMin:any;
		private _getMax:any;
		private _rotateExtents:any;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.core {

	/*
	 * <code>Camera</code> 类用于创建摄像机。
	 */
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

		/*
		 * 是否允许渲染。
		 */
		enableRender:boolean;

		/*
		 * 获取横纵比。
		 * @return 横纵比。
		 */

		/*
		 * 设置横纵比。
		 * @param value 横纵比。
		 */
		aspectRatio:number;

		/*
		 * 获取屏幕像素坐标的视口。
		 * @return 屏幕像素坐标的视口。
		 */

		/*
		 * 设置屏幕像素坐标的视口。
		 * @param 屏幕像素坐标的视口 。
		 */
		viewport:laya.d3.math.Viewport;

		/*
		 * 获取裁剪空间的视口。
		 * @return 裁剪空间的视口。
		 */

		/*
		 * 设置裁剪空间的视口。
		 * @return 裁剪空间的视口。
		 */
		normalizedViewport:laya.d3.math.Viewport;

		/*
		 * 获取视图矩阵。
		 * @return 视图矩阵。
		 */
		readonly viewMatrix:laya.d3.math.Matrix4x4;

		/*
		 * 获取投影矩阵。
		 */

		/*
		 * 设置投影矩阵。
		 */
		projectionMatrix:laya.d3.math.Matrix4x4;

		/*
		 * 获取视图投影矩阵。
		 * @return 视图投影矩阵。
		 */
		readonly projectionViewMatrix:laya.d3.math.Matrix4x4;

		/*
		 * 获取摄像机视锥。
		 */
		readonly boundFrustum:laya.d3.math.BoundFrustum;

		/*
		 * 获取自定义渲染场景的渲染目标。
		 * @return 自定义渲染场景的渲染目标。
		 */

		/*
		 * 设置自定义渲染场景的渲染目标。
		 * @param value 自定义渲染场景的渲染目标。
		 */
		renderTarget:laya.d3.resource.RenderTexture;

		/*
		 * 获取后期处理。
		 * @return 后期处理。
		 */

		/*
		 * 设置后期处理。
		 * @param value 后期处理。
		 */
		postProcess:laya.d3.component.PostProcess;

		/*
		 * 获取是否开启HDR。
		 */

		/*
		 * 设置是否开启HDR。
		 */
		enableHDR:boolean;

		/*
		 * 创建一个 <code>Camera</code> 实例。
		 * @param aspectRatio 横纵比。
		 * @param nearPlane 近裁面。
		 * @param farPlane 远裁面。
		 */

		constructor(aspectRatio?:number,nearPlane?:number,farPlane?:number);

		/*
		 * 通过蒙版值获取蒙版是否显示。
		 * @param layer 层。
		 * @return 是否显示。
		 */
		_isLayerVisible(layer:number):boolean;
		private _calculationViewport:any;

		/*
		 * 计算从屏幕空间生成的射线。
		 * @param point 屏幕空间的位置位置。
		 * @return out  输出射线。
		 */
		viewportPointToRay(point:laya.d3.math.Vector2,out:laya.d3.math.Ray):void;

		/*
		 * 计算从裁切空间生成的射线。
		 * @param point 裁切空间的位置。。
		 * @return out  输出射线。
		 */
		normalizedViewportPointToRay(point:laya.d3.math.Vector2,out:laya.d3.math.Ray):void;

		/*
		 * 计算从世界空间准换三维坐标到屏幕空间。
		 * @param position 世界空间的位置。
		 * @return out  输出位置。
		 */
		worldToViewportPoint(position:laya.d3.math.Vector3,out:laya.d3.math.Vector3):void;

		/*
		 * 计算从世界空间准换三维坐标到裁切空间。
		 * @param position 世界空间的位置。
		 * @return out  输出位置。
		 */
		worldToNormalizedViewportPoint(position:laya.d3.math.Vector3,out:laya.d3.math.Vector3):void;

		/*
		 * 转换2D屏幕坐标系统到3D正交投影下的坐标系统，注:只有正交模型下有效。
		 * @param source 源坐标。
		 * @param out 输出坐标。
		 * @return 是否转换成功。
		 */
		convertScreenCoordToOrthographicCoord(source:laya.d3.math.Vector3,out:laya.d3.math.Vector3):boolean;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		destroy(destroyChild?:boolean):void;

		/*
		 * 在特定渲染管线阶段添加指令缓存。
		 */
		addCommandBuffer(event:number,commandBuffer:laya.d3.core.render.command.CommandBuffer):void;

		/*
		 * 在特定渲染管线阶段移除指令缓存。
		 */
		removeCommandBuffer(event:number,commandBuffer:laya.d3.core.render.command.CommandBuffer):void;

		/*
		 * 在特定渲染管线阶段移除所有指令缓存。
		 */
		removeCommandBuffers(event:number):void;
	}

}

declare module laya.d3.core {

	/*
	 * <code>FloatKeyFrame</code> 类用于创建浮点关键帧实例。
	 */
	class FloatKeyframe extends laya.d3.core.Keyframe  {
		inTangent:number;
		outTangent:number;
		value:number;

		/*
		 * 创建一个 <code>FloatKeyFrame</code> 实例。
		 */

		constructor();

		/*
		 * @inheritDoc 
		 * @override 
		 */
		cloneTo(destObject:any):void;
	}

}

declare module laya.d3.core {

	/*
	 * <code>GeometryElement</code> 类用于实现几何体元素,该类为抽象类。
	 */
	class GeometryElement implements laya.resource.IDestroy  {

		/*
		 * 获取是否销毁。
		 * @return 是否销毁。
		 */
		readonly destroyed:boolean;

		/*
		 * 创建一个 <code>GeometryElement</code> 实例。
		 */

		constructor();

		/*
		 * 获取几何体类型。
		 */
		_getType():number;

		/*
		 * 销毁。
		 */
		destroy():void;
	}

}

declare module laya.d3.core {

	/*
	 * <code>Gradient</code> 类用于创建颜色渐变。
	 */
	class Gradient implements laya.d3.core.IClone  {
		private _mode:any;
		private _maxColorRGBKeysCount:any;
		private _maxColorAlphaKeysCount:any;
		private _colorRGBKeysCount:any;
		private _colorAlphaKeysCount:any;

		/*
		 * 获取梯度模式。
		 * @return 梯度模式。
		 */

		/*
		 * 设置梯度模式。
		 * @param value 梯度模式。
		 */
		mode:number;

		/*
		 * 获取颜色RGB数量。
		 * @return 颜色RGB数量。
		 */
		readonly colorRGBKeysCount:number;

		/*
		 * 获取颜色Alpha数量。
		 * @return 颜色Alpha数量。
		 */
		readonly colorAlphaKeysCount:number;

		/*
		 * 获取最大颜色RGB帧数量。
		 * @return 最大RGB帧数量。
		 */
		readonly maxColorRGBKeysCount:number;

		/*
		 * 获取最大颜色Alpha帧数量。
		 * @return 最大Alpha帧数量。
		 */
		readonly maxColorAlphaKeysCount:number;

		/*
		 * 创建一个 <code>Gradient</code> 实例。
		 * @param maxColorRGBKeyCount 最大RGB帧个数。
		 * @param maxColorAlphaKeyCount 最大Alpha帧个数。
		 */

		constructor(maxColorRGBKeyCount:number,maxColorAlphaKeyCount:number);

		/*
		 * 增加颜色RGB帧。
		 * @param key 生命周期，范围为0到1。
		 * @param value RGB值。
		 */
		addColorRGB(key:number,value:laya.d3.math.Color):void;

		/*
		 * 增加颜色Alpha帧。
		 * @param key 生命周期，范围为0到1。
		 * @param value Alpha值。
		 */
		addColorAlpha(key:number,value:number):void;

		/*
		 * 更新颜色RGB帧。
		 * @param index 索引。
		 * @param key 生命周期，范围为0到1。
		 * @param value RGB值。
		 */
		updateColorRGB(index:number,key:number,value:laya.d3.math.Color):void;

		/*
		 * 更新颜色Alpha帧。
		 * @param index 索引。
		 * @param key 生命周期，范围为0到1。
		 * @param value Alpha值。
		 */
		updateColorAlpha(index:number,key:number,value:number):void;

		/*
		 * 通过插值获取RGB颜色。
		 * @param lerpFactor 插值因子。
		 * @param out 颜色结果。
		 * @param 开始查找索引 。
		 * @return 结果索引。
		 */
		evaluateColorRGB(lerpFactor:number,out:laya.d3.math.Color,startSearchIndex?:number,reverseSearch?:boolean):number;

		/*
		 * 通过插值获取透明值。
		 * @param lerpFactor 插值因子。
		 * @param out 颜色结果。
		 * @param 开始查找索引 。
		 * @return 结果索引 。
		 */
		evaluateColorAlpha(lerpFactor:number,outColor:laya.d3.math.Color,startSearchIndex?:number,reverseSearch?:boolean):number;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.core {

	/*
	 * ...
	 * @author ...
	 */
	class GradientMode  {

		/*
		 * 找到与请求的评估时间相邻的两个键,并线性插值在他们之间,以获得一种混合的颜色。
		 */
		static Blend:number;

		/*
		 * 返回一个固定的颜色，通过查找第一个键的时间值大于所请求的评估时间。
		 */
		static Fixed:number;
	}

}

declare module laya.d3.core {

	/*
	 * <code>HeightMap</code> 类用于实现高度图数据。
	 */
	class HeightMap  {
		private static _tempRay:any;

		/*
		 * 从网格精灵生成高度图。
		 * @param meshSprite 网格精灵。
		 * @param width 高度图宽度。
		 * @param height 高度图高度。
		 * @param outCellSize 输出 单元尺寸。
		 */
		static creatFromMesh(mesh:laya.d3.resource.models.Mesh,width:number,height:number,outCellSize:laya.d3.math.Vector2):HeightMap;

		/*
		 * 从图片生成高度图。
		 * @param image 图片。
		 * @param maxHeight 最小高度。
		 * @param maxHeight 最大高度。
		 */
		static createFromImage(texture:laya.resource.Texture2D,minHeight:number,maxHeight:number):HeightMap;
		private static _getPosition:any;
		private _datas:any;
		private _w:any;
		private _h:any;
		private _minHeight:any;
		private _maxHeight:any;

		/*
		 * 获取宽度。
		 * @return value 宽度。
		 */
		readonly width:number;

		/*
		 * 获取高度。
		 * @return value 高度。
		 */
		readonly height:number;

		/*
		 * 最大高度。
		 * @return value 最大高度。
		 */
		readonly maxHeight:number;

		/*
		 * 最大高度。
		 * @return value 最大高度。
		 */
		readonly minHeight:number;

		/*
		 * 创建一个 <code>HeightMap</code> 实例。
		 * @param width 宽度。
		 * @param height 高度。
		 * @param minHeight 最大高度。
		 * @param maxHeight 最大高度。
		 */

		constructor(width:number,height:number,minHeight:number,maxHeight:number);

		/*
		 * 获取高度。
		 * @param row 列数。
		 * @param col 行数。
		 * @return 高度。
		 */
		getHeight(row:number,col:number):number;
	}

}

declare module laya.d3.core {

	/*
	 * @private <code>IClone</code> 资源克隆接口。
	 */
	interface IClone{
		clone():any;
		cloneTo(destObject:any):void;
	}

}

declare module laya.d3.core {

	/*
	 * <code>KeyFrame</code> 类用于创建关键帧实例。
	 */
	class Keyframe implements laya.d3.core.IClone  {

		/*
		 * 时间。
		 */
		time:number;

		/*
		 * 创建一个 <code>KeyFrame</code> 实例。
		 */

		constructor();

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.core.light {

	/*
	 * <code>DirectionLight</code> 类用于创建平行光。
	 */
	class DirectionLight extends laya.d3.core.light.LightSprite  {
		private _direction:any;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		shadow:boolean;

		/*
		 * 创建一个 <code>DirectionLight</code> 实例。
		 */

		constructor();
		private _initShadow:any;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onActive():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onInActive():void;

		/*
		 * 更新平行光相关渲染状态参数。
		 * @param state 渲染状态参数。
		 * @override 
		 */
		_prepareToScene():boolean;
	}

}

declare module laya.d3.core.light {

	/*
	 * <code>LightSprite</code> 类用于创建灯光的父类。
	 */
	class LightSprite extends laya.d3.core.Sprite3D  {

		/*
		 * 灯光烘培类型-实时。
		 */
		static LIGHTMAPBAKEDTYPE_REALTIME:number;

		/*
		 * 灯光烘培类型-混合。
		 */
		static LIGHTMAPBAKEDTYPE_MIXED:number;

		/*
		 * 灯光烘培类型-烘焙。
		 */
		static LIGHTMAPBAKEDTYPE_BAKED:number;

		/*
		 * 灯光颜色。
		 */
		color:laya.d3.math.Vector3;

		/*
		 * 获取灯光强度。
		 * @return 灯光强度
		 */

		/*
		 * 设置灯光强度。
		 * @param value 灯光强度
		 */
		intensity:number;

		/*
		 * 获取是否产生阴影。
		 * @return 是否产生阴影。
		 */

		/*
		 * 设置是否产生阴影。
		 * @param value 是否产生阴影。
		 */
		shadow:boolean;

		/*
		 * 获取阴影最远范围。
		 * @return 阴影最远范围。
		 */

		/*
		 * 设置阴影最远范围。
		 * @param value 阴影最远范围。
		 */
		shadowDistance:number;

		/*
		 * 获取阴影贴图尺寸。
		 * @return 阴影贴图尺寸。
		 */

		/*
		 * 设置阴影贴图尺寸。
		 * @param value 阴影贴图尺寸。
		 */
		shadowResolution:number;

		/*
		 * 获取阴影分段数。
		 * @return 阴影分段数。
		 */

		/*
		 * 设置阴影分段数。
		 * @param value 阴影分段数。
		 */
		shadowPSSMCount:number;

		/*
		 * 获取阴影PCF类型。
		 * @return PCF类型。
		 */

		/*
		 * 设置阴影PCF类型。
		 * @param value PCF类型。
		 */
		shadowPCFType:number;

		/*
		 * 获取灯光烘培类型。
		 */

		/*
		 * 设置灯光烘培类型。
		 */
		lightmapBakedType:number;

		/*
		 * 创建一个 <code>LightSprite</code> 实例。
		 */

		constructor();

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onActive():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onInActive():void;

		/*
		 * 更新灯光相关渲染状态参数。
		 * @param state 渲染状态参数。
		 */
		_prepareToScene():boolean;

		/*
		 * 获取灯光的漫反射颜色。
		 * @return 灯光的漫反射颜色。
		 */

		/*
		 * 设置灯光的漫反射颜色。
		 * @param value 灯光的漫反射颜色。
		 */
		diffuseColor:laya.d3.math.Vector3;
	}

}

declare module laya.d3.core.light {

	/*
	 * <code>PointLight</code> 类用于创建点光。
	 */
	class PointLight extends laya.d3.core.light.LightSprite  {
		private static _tempMatrix0:any;
		private _range:any;
		private _lightMatrix:any;

		/*
		 * 创建一个 <code>PointLight</code> 实例。
		 */

		constructor();

		/*
		 * 获取点光的范围。
		 * @return 点光的范围。
		 */

		/*
		 * 设置点光的范围。
		 * @param value 点光的范围。
		 */
		range:number;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onActive():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onInActive():void;

		/*
		 * 更新点光相关渲染状态参数。
		 * @param state 渲染状态参数。
		 * @override 
		 */
		_prepareToScene():boolean;
	}

}

declare module laya.d3.core.light {

	/*
	 * <code>SpotLight</code> 类用于创建聚光。
	 */
	class SpotLight extends laya.d3.core.light.LightSprite  {
		private static _tempMatrix0:any;
		private static _tempMatrix1:any;
		private _direction:any;
		private _spotAngle:any;
		private _range:any;

		/*
		 * 获取聚光灯的锥形角度。
		 * @return 聚光灯的锥形角度。
		 */

		/*
		 * 设置聚光灯的锥形角度。
		 * @param value 聚光灯的锥形角度。
		 */
		spotAngle:number;

		/*
		 * 获取聚光的范围。
		 * @return 聚光的范围值。
		 */

		/*
		 * 设置聚光的范围。
		 * @param value 聚光的范围值。
		 */
		range:number;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onActive():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onInActive():void;

		/*
		 * 更新聚光相关渲染状态参数。
		 * @param state 渲染状态参数。
		 * @override 
		 */
		_prepareToScene():boolean;
	}

}

declare module laya.d3.core.material {

	/*
	 * <code>BaseMaterial</code> 类用于创建材质。
	 */
	class BaseMaterial extends laya.resource.Resource implements laya.d3.core.IClone  {

		/*
		 * Material资源。
		 */
		static MATERIAL:string;

		/*
		 * 渲染队列_不透明。
		 */
		static RENDERQUEUE_OPAQUE:number;

		/*
		 * 渲染队列_阿尔法裁剪。
		 */
		static RENDERQUEUE_ALPHATEST:number;

		/*
		 * 渲染队列_透明。
		 */
		static RENDERQUEUE_TRANSPARENT:number;

		/*
		 * 着色器变量,透明测试值。
		 */
		static ALPHATESTVALUE:number;

		/*
		 * 材质级着色器宏定义,透明测试。
		 */
		static SHADERDEFINE_ALPHATEST:number;
		static shaderDefines:laya.d3.shader.ShaderDefines;

		/*
		 * 加载材质。
		 * @param url 材质地址。
		 * @param complete 完成回掉。
		 */
		static load(url:string,complete:laya.utils.Handler):void;

		/*
		 * @inheritDoc 
		 */
		static _parse(data:any,propertyParams?:any,constructParams?:any[]):BaseMaterial;
		private _alphaTest:any;
		_shaderValues:laya.d3.shader.ShaderData;

		/*
		 * 所属渲染队列.
		 */
		renderQueue:number;

		/*
		 * 获取透明测试模式裁剪值。
		 * @return 透明测试模式裁剪值。
		 */

		/*
		 * 设置透明测试模式裁剪值。
		 * @param value 透明测试模式裁剪值。
		 */
		alphaTestValue:number;

		/*
		 * 获取是否透明裁剪。
		 * @return 是否透明裁剪。
		 */

		/*
		 * 设置是否透明裁剪。
		 * @param value 是否透明裁剪。
		 */
		alphaTest:boolean;

		/*
		 * 创建一个 <code>BaseMaterial</code> 实例。
		 */

		constructor();
		private _removeTetxureReference:any;

		/*
		 * @implements IReferenceCounter
		 * @override 
		 */
		_addReference(count?:number):void;

		/*
		 * @implements IReferenceCounter
		 * @override 
		 */
		_removeReference(count?:number):void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _disposeResource():void;

		/*
		 * 设置使用Shader名字。
		 * @param name 名称。
		 */
		setShaderName(name:string):void;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
		readonly _defineDatas:laya.d3.shader.DefineDatas;
	}

}

declare module laya.d3.core.material {

	/*
	 * <code>BlinnPhongMaterial</code> 类用于实现Blinn-Phong材质。
	 */
	class BlinnPhongMaterial extends laya.d3.core.material.BaseMaterial  {

		/*
		 * 高光强度数据源_漫反射贴图的Alpha通道。
		 */
		static SPECULARSOURCE_DIFFUSEMAPALPHA:number;

		/*
		 * 高光强度数据源_高光贴图的RGB通道。
		 */
		static SPECULARSOURCE_SPECULARMAP:number;

		/*
		 * 渲染状态_不透明。
		 */
		static RENDERMODE_OPAQUE:number;

		/*
		 * 渲染状态_阿尔法测试。
		 */
		static RENDERMODE_CUTOUT:number;

		/*
		 * 渲染状态_透明混合。
		 */
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

		/*
		 * 默认材质，禁止修改
		 */
		static defaultMaterial:BlinnPhongMaterial;
		private _albedoColor:any;
		private _albedoIntensity:any;
		private _enableLighting:any;
		private _enableVertexColor:any;

		/*
		 * 设置渲染模式。
		 * @return 渲染模式。
		 */
		renderMode:number;

		/*
		 * 获取是否支持顶点色。
		 * @return 是否支持顶点色。
		 */

		/*
		 * 设置是否支持顶点色。
		 * @param value 是否支持顶点色。
		 */
		enableVertexColor:boolean;

		/*
		 * 获取纹理平铺和偏移X分量。
		 * @return 纹理平铺和偏移X分量。
		 */

		/*
		 * 获取纹理平铺和偏移X分量。
		 * @param x 纹理平铺和偏移X分量。
		 */
		tilingOffsetX:number;

		/*
		 * 获取纹理平铺和偏移Y分量。
		 * @return 纹理平铺和偏移Y分量。
		 */

		/*
		 * 获取纹理平铺和偏移Y分量。
		 * @param y 纹理平铺和偏移Y分量。
		 */
		tilingOffsetY:number;

		/*
		 * 获取纹理平铺和偏移Z分量。
		 * @return 纹理平铺和偏移Z分量。
		 */

		/*
		 * 获取纹理平铺和偏移Z分量。
		 * @param z 纹理平铺和偏移Z分量。
		 */
		tilingOffsetZ:number;

		/*
		 * 获取纹理平铺和偏移W分量。
		 * @return 纹理平铺和偏移W分量。
		 */

		/*
		 * 获取纹理平铺和偏移W分量。
		 * @param w 纹理平铺和偏移W分量。
		 */
		tilingOffsetW:number;

		/*
		 * 获取纹理平铺和偏移。
		 * @return 纹理平铺和偏移。
		 */

		/*
		 * 获取纹理平铺和偏移。
		 * @param value 纹理平铺和偏移。
		 */
		tilingOffset:laya.d3.math.Vector4;

		/*
		 * 获取反照率颜色R分量。
		 * @return 反照率颜色R分量。
		 */

		/*
		 * 设置反照率颜色R分量。
		 * @param value 反照率颜色R分量。
		 */
		albedoColorR:number;

		/*
		 * 获取反照率颜色G分量。
		 * @return 反照率颜色G分量。
		 */

		/*
		 * 设置反照率颜色G分量。
		 * @param value 反照率颜色G分量。
		 */
		albedoColorG:number;

		/*
		 * 获取反照率颜色B分量。
		 * @return 反照率颜色B分量。
		 */

		/*
		 * 设置反照率颜色B分量。
		 * @param value 反照率颜色B分量。
		 */
		albedoColorB:number;

		/*
		 * 获取反照率颜色Z分量。
		 * @return 反照率颜色Z分量。
		 */

		/*
		 * 设置反照率颜色alpha分量。
		 * @param value 反照率颜色alpha分量。
		 */
		albedoColorA:number;

		/*
		 * 获取反照率颜色。
		 * @return 反照率颜色。
		 */

		/*
		 * 设置反照率颜色。
		 * @param value 反照率颜色。
		 */
		albedoColor:laya.d3.math.Vector4;

		/*
		 * 获取反照率强度。
		 * @return 反照率强度。
		 */

		/*
		 * 设置反照率强度。
		 * @param value 反照率强度。
		 */
		albedoIntensity:number;

		/*
		 * 获取高光颜色R轴分量。
		 * @return 高光颜色R轴分量。
		 */

		/*
		 * 设置高光颜色R分量。
		 * @param value 高光颜色R分量。
		 */
		specularColorR:number;

		/*
		 * 获取高光颜色G分量。
		 * @return 高光颜色G分量。
		 */

		/*
		 * 设置高光颜色G分量。
		 * @param value 高光颜色G分量。
		 */
		specularColorG:number;

		/*
		 * 获取高光颜色B分量。
		 * @return 高光颜色B分量。
		 */

		/*
		 * 设置高光颜色B分量。
		 * @param value 高光颜色B分量。
		 */
		specularColorB:number;

		/*
		 * 获取高光颜色A分量。
		 * @return 高光颜色A分量。
		 */

		/*
		 * 设置高光颜色A分量。
		 * @param value 高光颜色A分量。
		 */
		specularColorA:number;

		/*
		 * 获取高光颜色。
		 * @return 高光颜色。
		 */

		/*
		 * 设置高光颜色。
		 * @param value 高光颜色。
		 */
		specularColor:laya.d3.math.Vector4;

		/*
		 * 获取高光强度,范围为0到1。
		 * @return 高光强度。
		 */

		/*
		 * 设置高光强度,范围为0到1。
		 * @param value 高光强度。
		 */
		shininess:number;

		/*
		 * 获取反照率贴图。
		 * @return 反照率贴图。
		 */

		/*
		 * 设置反照率贴图。
		 * @param value 反照率贴图。
		 */
		albedoTexture:laya.resource.BaseTexture;

		/*
		 * 获取法线贴图。
		 * @return 法线贴图。
		 */

		/*
		 * 设置法线贴图。
		 * @param value 法线贴图。
		 */
		normalTexture:laya.resource.BaseTexture;

		/*
		 * 获取高光贴图。
		 * @return 高光贴图。
		 */

		/*
		 * 设置高光贴图，高光强度则从该贴图RGB值中获取,如果该值为空则从漫反射贴图的Alpha通道获取。
		 * @param value 高光贴图。
		 */
		specularTexture:laya.resource.BaseTexture;

		/*
		 * 获取是否启用光照。
		 * @return 是否启用光照。
		 */

		/*
		 * 设置是否启用光照。
		 * @param value 是否启用光照。
		 */
		enableLighting:boolean;

		/*
		 * 设置是否写入深度。
		 * @param value 是否写入深度。
		 */

		/*
		 * 获取是否写入深度。
		 * @return 是否写入深度。
		 */
		depthWrite:boolean;

		/*
		 * 设置剔除方式。
		 * @param value 剔除方式。
		 */

		/*
		 * 获取剔除方式。
		 * @return 剔除方式。
		 */
		cull:number;

		/*
		 * 设置混合方式。
		 * @param value 混合方式。
		 */

		/*
		 * 获取混合方式。
		 * @return 混合方式。
		 */
		blend:number;

		/*
		 * 设置混合源。
		 * @param value 混合源
		 */

		/*
		 * 获取混合源。
		 * @return 混合源。
		 */
		blendSrc:number;

		/*
		 * 设置混合目标。
		 * @param value 混合目标
		 */

		/*
		 * 获取混合目标。
		 * @return 混合目标。
		 */
		blendDst:number;

		/*
		 * 设置深度测试方式。
		 * @param value 深度测试方式
		 */

		/*
		 * 获取深度测试方式。
		 * @return 深度测试方式。
		 */
		depthTest:number;

		/*
		 * 创建一个 <code>BlinnPhongMaterial</code> 实例。
		 */

		constructor();

		/*
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		clone():any;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		cloneTo(destObject:any):void;
	}

}

declare module laya.d3.core.material {

	/*
	 * <code>EffectMaterial</code> 类用于实现Mesh特效材质。
	 */
	class EffectMaterial extends laya.d3.core.material.BaseMaterial  {

		/*
		 * 渲染状态_加色法混合。
		 */
		static RENDERMODE_ADDTIVE:number;

		/*
		 * 渲染状态_透明混合。
		 */
		static RENDERMODE_ALPHABLENDED:number;

		/*
		 * 默认材质，禁止修改
		 */
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

		/*
		 * 设置渲染模式。
		 * @return 渲染模式。
		 */
		renderMode:number;

		/*
		 * 获取颜色R分量。
		 * @return 颜色R分量。
		 */

		/*
		 * 设置颜色R分量。
		 * @param value 颜色R分量。
		 */
		colorR:number;

		/*
		 * 获取颜色G分量。
		 * @return 颜色G分量。
		 */

		/*
		 * 设置颜色G分量。
		 * @param value 颜色G分量。
		 */
		colorG:number;

		/*
		 * 获取颜色B分量。
		 * @return 颜色B分量。
		 */

		/*
		 * 设置颜色B分量。
		 * @param value 颜色B分量。
		 */
		colorB:number;

		/*
		 * 获取颜色Z分量。
		 * @return 颜色Z分量。
		 */

		/*
		 * 设置颜色alpha分量。
		 * @param value 颜色alpha分量。
		 */
		colorA:number;

		/*
		 * 获取颜色。
		 * @return 颜色。
		 */

		/*
		 * 设置颜色。
		 * @param value 颜色。
		 */
		color:laya.d3.math.Vector4;

		/*
		 * 获取贴图。
		 * @return 贴图。
		 */

		/*
		 * 设置贴图。
		 * @param value 贴图。
		 */
		texture:laya.resource.BaseTexture;

		/*
		 * 获取纹理平铺和偏移X分量。
		 * @return 纹理平铺和偏移X分量。
		 */

		/*
		 * 获取纹理平铺和偏移X分量。
		 * @param x 纹理平铺和偏移X分量。
		 */
		tilingOffsetX:number;

		/*
		 * 获取纹理平铺和偏移Y分量。
		 * @return 纹理平铺和偏移Y分量。
		 */

		/*
		 * 获取纹理平铺和偏移Y分量。
		 * @param y 纹理平铺和偏移Y分量。
		 */
		tilingOffsetY:number;

		/*
		 * 获取纹理平铺和偏移Z分量。
		 * @return 纹理平铺和偏移Z分量。
		 */

		/*
		 * 获取纹理平铺和偏移Z分量。
		 * @param z 纹理平铺和偏移Z分量。
		 */
		tilingOffsetZ:number;

		/*
		 * 获取纹理平铺和偏移W分量。
		 * @return 纹理平铺和偏移W分量。
		 */

		/*
		 * 获取纹理平铺和偏移W分量。
		 * @param w 纹理平铺和偏移W分量。
		 */
		tilingOffsetW:number;

		/*
		 * 获取纹理平铺和偏移。
		 * @return 纹理平铺和偏移。
		 */

		/*
		 * 设置纹理平铺和偏移。
		 * @param value 纹理平铺和偏移。
		 */
		tilingOffset:laya.d3.math.Vector4;

		/*
		 * 设置是否写入深度。
		 * @param value 是否写入深度。
		 */

		/*
		 * 获取是否写入深度。
		 * @return 是否写入深度。
		 */
		depthWrite:boolean;

		/*
		 * 设置剔除方式。
		 * @param value 剔除方式。
		 */

		/*
		 * 获取剔除方式。
		 * @return 剔除方式。
		 */
		cull:number;

		/*
		 * 设置混合方式。
		 * @param value 混合方式。
		 */

		/*
		 * 获取混合方式。
		 * @return 混合方式。
		 */
		blend:number;

		/*
		 * 设置混合源。
		 * @param value 混合源
		 */

		/*
		 * 获取混合源。
		 * @return 混合源。
		 */
		blendSrc:number;

		/*
		 * 设置混合目标。
		 * @param value 混合目标
		 */

		/*
		 * 获取混合目标。
		 * @return 混合目标。
		 */
		blendDst:number;

		/*
		 * 设置深度测试方式。
		 * @param value 深度测试方式
		 */

		/*
		 * 获取深度测试方式。
		 * @return 深度测试方式。
		 */
		depthTest:number;

		constructor();

		/*
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		clone():any;
	}

}

declare module laya.d3.core.material {

	/*
	 * ...
	 * @author ...
	 */
	class ExtendTerrainMaterial extends laya.d3.core.material.BaseMaterial  {

		/*
		 * 渲染状态_不透明。
		 */
		static RENDERMODE_OPAQUE:number;

		/*
		 * 渲染状态_透明混合。
		 */
		static RENDERMODE_TRANSPARENT:number;

		/*
		 * 渲染状态_透明混合。
		 */
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

		/*
		 * 地形细节宏定义。
		 */
		static SHADERDEFINE_DETAIL_NUM1:number;
		static SHADERDEFINE_DETAIL_NUM2:number;
		static SHADERDEFINE_DETAIL_NUM3:number;
		static SHADERDEFINE_DETAIL_NUM4:number;
		static SHADERDEFINE_DETAIL_NUM5:number;
		private _enableLighting:any;

		/*
		 * 获取splatAlpha贴图。
		 * @return splatAlpha贴图。
		 */

		/*
		 * 设置splatAlpha贴图。
		 * @param value splatAlpha贴图。
		 */
		splatAlphaTexture:laya.resource.BaseTexture;

		/*
		 * 设置第一层贴图。
		 * @param value 第一层贴图。
		 */
		diffuseTexture1:laya.resource.BaseTexture;

		/*
		 * 获取第二层贴图。
		 * @return 第二层贴图。
		 */

		/*
		 * 设置第二层贴图。
		 * @param value 第二层贴图。
		 */
		diffuseTexture2:laya.resource.BaseTexture;

		/*
		 * 获取第三层贴图。
		 * @return 第三层贴图。
		 */

		/*
		 * 设置第三层贴图。
		 * @param value 第三层贴图。
		 */
		diffuseTexture3:laya.resource.BaseTexture;

		/*
		 * 获取第四层贴图。
		 * @return 第四层贴图。
		 */

		/*
		 * 设置第四层贴图。
		 * @param value 第四层贴图。
		 */
		diffuseTexture4:laya.resource.BaseTexture;

		/*
		 * 获取第五层贴图。
		 * @return 第五层贴图。
		 */

		/*
		 * 设置第五层贴图。
		 * @param value 第五层贴图。
		 */
		diffuseTexture5:laya.resource.BaseTexture;
		private _setDetailNum:any;
		diffuseScaleOffset1:laya.d3.math.Vector4;
		diffuseScaleOffset2:laya.d3.math.Vector4;
		diffuseScaleOffset3:laya.d3.math.Vector4;
		diffuseScaleOffset4:laya.d3.math.Vector4;
		diffuseScaleOffset5:laya.d3.math.Vector4;

		/*
		 * 获取是否启用光照。
		 * @return 是否启用光照。
		 */

		/*
		 * 设置是否启用光照。
		 * @param value 是否启用光照。
		 */
		enableLighting:boolean;

		/*
		 * 设置渲染模式。
		 * @return 渲染模式。
		 */
		renderMode:number;

		/*
		 * 设置是否写入深度。
		 * @param value 是否写入深度。
		 */

		/*
		 * 获取是否写入深度。
		 * @return 是否写入深度。
		 */
		depthWrite:boolean;

		/*
		 * 设置剔除方式。
		 * @param value 剔除方式。
		 */

		/*
		 * 获取剔除方式。
		 * @return 剔除方式。
		 */
		cull:number;

		/*
		 * 设置混合方式。
		 * @param value 混合方式。
		 */

		/*
		 * 获取混合方式。
		 * @return 混合方式。
		 */
		blend:number;

		/*
		 * 设置混合源。
		 * @param value 混合源
		 */

		/*
		 * 获取混合源。
		 * @return 混合源。
		 */
		blendSrc:number;

		/*
		 * 设置混合目标。
		 * @param value 混合目标
		 */

		/*
		 * 获取混合目标。
		 * @return 混合目标。
		 */
		blendDst:number;

		/*
		 * 设置深度测试方式。
		 * @param value 深度测试方式
		 */

		/*
		 * 获取深度测试方式。
		 * @return 深度测试方式。
		 */
		depthTest:number;

		constructor();

		/*
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		clone():any;
	}

}

declare module laya.d3.core.material {

	/*
	 * <code>PBRSpecularMaterial</code> 类用于实现PBR(Specular)材质。
	 */
	class PBRSpecularMaterial extends laya.d3.core.material.BaseMaterial  {

		/*
		 * 光滑度数据源_高光贴图的Alpha通道。
		 */
		static SmoothnessSource_SpecularTexture_Alpha:number;

		/*
		 * 光滑度数据源_反射率贴图的Alpha通道。
		 */
		static SmoothnessSource_AlbedoTexture_Alpha:number;

		/*
		 * 渲染状态_不透明。
		 */
		static RENDERMODE_OPAQUE:number;

		/*
		 * 渲染状态_透明测试。
		 */
		static RENDERMODE_CUTOUT:number;

		/*
		 * 渲染状态_透明混合_游戏中经常使用的透明。
		 */
		static RENDERMODE_FADE:number;

		/*
		 * 渲染状态_透明混合_物理上看似合理的透明。
		 */
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

		/*
		 * 默认材质，禁止修改
		 */
		static defaultMaterial:PBRSpecularMaterial;
		private _albedoColor:any;
		private _specularColor:any;
		private _emissionColor:any;

		/*
		 * 获取反射率颜色R分量。
		 * @return 反射率颜色R分量。
		 */

		/*
		 * 设置反射率颜色R分量。
		 * @param value 反射率颜色R分量。
		 */
		albedoColorR:number;

		/*
		 * 获取反射率颜色G分量。
		 * @return 反射率颜色G分量。
		 */

		/*
		 * 设置反射率颜色G分量。
		 * @param value 反射率颜色G分量。
		 */
		albedoColorG:number;

		/*
		 * 获取反射率颜色B分量。
		 * @return 反射率颜色B分量。
		 */

		/*
		 * 设置反射率颜色B分量。
		 * @param value 反射率颜色B分量。
		 */
		albedoColorB:number;

		/*
		 * 获取反射率颜色A分量。
		 * @return 反射率颜色A分量。
		 */

		/*
		 * 设置反射率颜色A分量。
		 * @param value 反射率颜色A分量。
		 */
		albedoColorA:number;

		/*
		 * 获取反射率颜色。
		 * @return 反射率颜色。
		 */

		/*
		 * 设置反射率颜色。
		 * @param value 反射率颜色。
		 */
		albedoColor:laya.d3.math.Vector4;

		/*
		 * 获取漫反射贴图。
		 * @return 漫反射贴图。
		 */

		/*
		 * 设置漫反射贴图。
		 * @param value 漫反射贴图。
		 */
		albedoTexture:laya.resource.BaseTexture;

		/*
		 * 获取法线贴图。
		 * @return 法线贴图。
		 */

		/*
		 * 设置法线贴图。
		 * @param value 法线贴图。
		 */
		normalTexture:laya.resource.BaseTexture;

		/*
		 * 获取法线贴图缩放系数。
		 * @return 法线贴图缩放系数。
		 */

		/*
		 * 设置法线贴图缩放系数。
		 * @param value 法线贴图缩放系数。
		 */
		normalTextureScale:number;

		/*
		 * 获取视差贴图。
		 * @return 视察贴图。
		 */

		/*
		 * 设置视差贴图。
		 * @param value 视察贴图。
		 */
		parallaxTexture:laya.resource.BaseTexture;

		/*
		 * 获取视差贴图缩放系数。
		 * @return 视差缩放系数。
		 */

		/*
		 * 设置视差贴图缩放系数。
		 * @param value 视差缩放系数。
		 */
		parallaxTextureScale:number;

		/*
		 * 获取遮挡贴图。
		 * @return 遮挡贴图。
		 */

		/*
		 * 设置遮挡贴图。
		 * @param value 遮挡贴图。
		 */
		occlusionTexture:laya.resource.BaseTexture;

		/*
		 * 获取遮挡贴图强度。
		 * @return 遮挡贴图强度,范围为0到1。
		 */

		/*
		 * 设置遮挡贴图强度。
		 * @param value 遮挡贴图强度,范围为0到1。
		 */
		occlusionTextureStrength:number;

		/*
		 * 获取高光贴图。
		 * @return 高光贴图。
		 */

		/*
		 * 设置高光贴图。
		 * @param value 高光贴图。
		 */
		specularTexture:laya.resource.BaseTexture;

		/*
		 * 获取高光颜色R分量。
		 * @return 高光颜色R分量。
		 */

		/*
		 * 设置高光颜色R分量。
		 * @param value 高光颜色R分量。
		 */
		specularColorR:number;

		/*
		 * 获取高光颜色G分量。
		 * @return 高光颜色G分量。
		 */

		/*
		 * 设置高光颜色G分量。
		 * @param value 高光颜色G分量。
		 */
		specularColorG:number;

		/*
		 * 获取高光颜色B分量。
		 * @return 高光颜色B分量。
		 */

		/*
		 * 设置高光颜色B分量。
		 * @param value 高光颜色B分量。
		 */
		specularColorB:number;

		/*
		 * 获取高光颜色A分量。
		 * @return 高光颜色A分量。
		 */

		/*
		 * 设置高光颜色A分量。
		 * @param value 高光颜色A分量。
		 */
		specularColorA:number;

		/*
		 * 获取高光颜色。
		 * @return 高光颜色。
		 */

		/*
		 * 设置高光颜色。
		 * @param value 高光颜色。
		 */
		specularColor:laya.d3.math.Vector4;

		/*
		 * 获取光滑度。
		 * @return 光滑度,范围为0到1。
		 */

		/*
		 * 设置光滑度。
		 * @param value 光滑度,范围为0到1。
		 */
		smoothness:number;

		/*
		 * 获取光滑度缩放系数。
		 * @return 光滑度缩放系数,范围为0到1。
		 */

		/*
		 * 设置光滑度缩放系数。
		 * @param value 光滑度缩放系数,范围为0到1。
		 */
		smoothnessTextureScale:number;

		/*
		 * 获取光滑度数据源
		 * @return 光滑滑度数据源,0或1。
		 */

		/*
		 * 设置光滑度数据源。
		 * @param value 光滑滑度数据源,0或1。
		 */
		smoothnessSource:number;

		/*
		 * 获取是否激活放射属性。
		 * @return 是否激活放射属性。
		 */

		/*
		 * 设置是否激活放射属性。
		 * @param value 是否激活放射属性
		 */
		enableEmission:boolean;

		/*
		 * 获取放射颜色。
		 * @return 放射颜色。
		 */

		/*
		 * 设置放射颜色。
		 * @param value 放射颜色。
		 */
		emissionColor:laya.d3.math.Vector4;

		/*
		 * 获取放射贴图。
		 * @return 放射贴图。
		 */

		/*
		 * 设置放射贴图。
		 * @param value 放射贴图。
		 */
		emissionTexture:laya.resource.BaseTexture;

		/*
		 * 获取是否开启反射。
		 * @return 是否开启反射。
		 */

		/*
		 * 设置是否开启反射。
		 * @param value 是否开启反射。
		 */
		enableReflection:boolean;

		/*
		 * 获取纹理平铺和偏移X分量。
		 * @return 纹理平铺和偏移X分量。
		 */

		/*
		 * 获取纹理平铺和偏移X分量。
		 * @param x 纹理平铺和偏移X分量。
		 */
		tilingOffsetX:number;

		/*
		 * 获取纹理平铺和偏移Y分量。
		 * @return 纹理平铺和偏移Y分量。
		 */

		/*
		 * 获取纹理平铺和偏移Y分量。
		 * @param y 纹理平铺和偏移Y分量。
		 */
		tilingOffsetY:number;

		/*
		 * 获取纹理平铺和偏移Z分量。
		 * @return 纹理平铺和偏移Z分量。
		 */

		/*
		 * 获取纹理平铺和偏移Z分量。
		 * @param z 纹理平铺和偏移Z分量。
		 */
		tilingOffsetZ:number;

		/*
		 * 获取纹理平铺和偏移W分量。
		 * @return 纹理平铺和偏移W分量。
		 */

		/*
		 * 获取纹理平铺和偏移W分量。
		 * @param w 纹理平铺和偏移W分量。
		 */
		tilingOffsetW:number;

		/*
		 * 获取纹理平铺和偏移。
		 * @return 纹理平铺和偏移。
		 */

		/*
		 * 获取纹理平铺和偏移。
		 * @param value 纹理平铺和偏移。
		 */
		tilingOffset:laya.d3.math.Vector4;

		/*
		 * 设置渲染模式。
		 * @return 渲染模式。
		 */
		renderMode:number;

		/*
		 * 设置是否写入深度。
		 * @param value 是否写入深度。
		 */

		/*
		 * 获取是否写入深度。
		 * @return 是否写入深度。
		 */
		depthWrite:boolean;

		/*
		 * 设置剔除方式。
		 * @param value 剔除方式。
		 */

		/*
		 * 获取剔除方式。
		 * @return 剔除方式。
		 */
		cull:number;

		/*
		 * 设置混合方式。
		 * @param value 混合方式。
		 */

		/*
		 * 获取混合方式。
		 * @return 混合方式。
		 */
		blend:number;

		/*
		 * 设置混合源。
		 * @param value 混合源
		 */

		/*
		 * 获取混合源。
		 * @return 混合源。
		 */
		blendSrc:number;

		/*
		 * 设置混合目标。
		 * @param value 混合目标
		 */

		/*
		 * 获取混合目标。
		 * @return 混合目标。
		 */
		blendDst:number;

		/*
		 * 设置深度测试方式。
		 * @param value 深度测试方式
		 */

		/*
		 * 获取深度测试方式。
		 * @return 深度测试方式。
		 */
		depthTest:number;

		/*
		 * 创建一个 <code>PBRSpecularMaterial</code> 实例。
		 */

		constructor();

		/*
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		clone():any;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		cloneTo(destObject:any):void;
	}

}

declare module laya.d3.core.material {

	/*
	 * <code>PBRStandardMaterial</code> 类用于实现PBR(Standard)材质。
	 */
	class PBRStandardMaterial extends laya.d3.core.material.BaseMaterial  {

		/*
		 * 光滑度数据源_金属度贴图的Alpha通道。
		 */
		static SmoothnessSource_MetallicGlossTexture_Alpha:number;

		/*
		 * 光滑度数据源_反射率贴图的Alpha通道。
		 */
		static SmoothnessSource_AlbedoTexture_Alpha:number;

		/*
		 * 渲染状态_不透明。
		 */
		static RENDERMODE_OPAQUE:number;

		/*
		 * 渲染状态_透明测试。
		 */
		static RENDERMODE_CUTOUT:number;

		/*
		 * 渲染状态_透明混合_游戏中经常使用的透明。
		 */
		static RENDERMODE_FADE:number;

		/*
		 * 渲染状态_透明混合_物理上看似合理的透明。
		 */
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

		/*
		 * 默认材质，禁止修改
		 */
		static defaultMaterial:PBRStandardMaterial;
		private _albedoColor:any;
		private _emissionColor:any;

		/*
		 * 获取反射率颜色R分量。
		 * @return 反射率颜色R分量。
		 */

		/*
		 * 设置反射率颜色R分量。
		 * @param value 反射率颜色R分量。
		 */
		albedoColorR:number;

		/*
		 * 获取反射率颜色G分量。
		 * @return 反射率颜色G分量。
		 */

		/*
		 * 设置反射率颜色G分量。
		 * @param value 反射率颜色G分量。
		 */
		albedoColorG:number;

		/*
		 * 获取反射率颜色B分量。
		 * @return 反射率颜色B分量。
		 */

		/*
		 * 设置反射率颜色B分量。
		 * @param value 反射率颜色B分量。
		 */
		albedoColorB:number;

		/*
		 * 获取反射率颜色Z分量。
		 * @return 反射率颜色Z分量。
		 */

		/*
		 * 设置反射率颜色alpha分量。
		 * @param value 反射率颜色alpha分量。
		 */
		albedoColorA:number;

		/*
		 * 获取漫反射颜色。
		 * @return 漫反射颜色。
		 */

		/*
		 * 设置漫反射颜色。
		 * @param value 漫反射颜色。
		 */
		albedoColor:laya.d3.math.Vector4;

		/*
		 * 获取漫反射贴图。
		 * @return 漫反射贴图。
		 */

		/*
		 * 设置漫反射贴图。
		 * @param value 漫反射贴图。
		 */
		albedoTexture:laya.resource.BaseTexture;

		/*
		 * 获取法线贴图。
		 * @return 法线贴图。
		 */

		/*
		 * 设置法线贴图。
		 * @param value 法线贴图。
		 */
		normalTexture:laya.resource.BaseTexture;

		/*
		 * 获取法线贴图缩放系数。
		 * @return 法线贴图缩放系数。
		 */

		/*
		 * 设置法线贴图缩放系数。
		 * @param value 法线贴图缩放系数。
		 */
		normalTextureScale:number;

		/*
		 * 获取视差贴图。
		 * @return 视察贴图。
		 */

		/*
		 * 设置视差贴图。
		 * @param value 视察贴图。
		 */
		parallaxTexture:laya.resource.BaseTexture;

		/*
		 * 获取视差贴图缩放系数。
		 * @return 视差缩放系数。
		 */

		/*
		 * 设置视差贴图缩放系数。
		 * @param value 视差缩放系数。
		 */
		parallaxTextureScale:number;

		/*
		 * 获取遮挡贴图。
		 * @return 遮挡贴图。
		 */

		/*
		 * 设置遮挡贴图。
		 * @param value 遮挡贴图。
		 */
		occlusionTexture:laya.resource.BaseTexture;

		/*
		 * 获取遮挡贴图强度。
		 * @return 遮挡贴图强度,范围为0到1。
		 */

		/*
		 * 设置遮挡贴图强度。
		 * @param value 遮挡贴图强度,范围为0到1。
		 */
		occlusionTextureStrength:number;

		/*
		 * 获取金属光滑度贴图。
		 * @return 金属光滑度贴图。
		 */

		/*
		 * 设置金属光滑度贴图。
		 * @param value 金属光滑度贴图。
		 */
		metallicGlossTexture:laya.resource.BaseTexture;

		/*
		 * 获取金属度。
		 * @return 金属度,范围为0到1。
		 */

		/*
		 * 设置金属度。
		 * @param value 金属度,范围为0到1。
		 */
		metallic:number;

		/*
		 * 获取光滑度。
		 * @return 光滑度,范围为0到1。
		 */

		/*
		 * 设置光滑度。
		 * @param value 光滑度,范围为0到1。
		 */
		smoothness:number;

		/*
		 * 获取光滑度缩放系数。
		 * @return 光滑度缩放系数,范围为0到1。
		 */

		/*
		 * 设置光滑度缩放系数。
		 * @param value 光滑度缩放系数,范围为0到1。
		 */
		smoothnessTextureScale:number;

		/*
		 * 获取光滑度数据源
		 * @return 光滑滑度数据源,0或1。
		 */

		/*
		 * 设置光滑度数据源。
		 * @param value 光滑滑度数据源,0或1。
		 */
		smoothnessSource:number;

		/*
		 * 获取是否激活放射属性。
		 * @return 是否激活放射属性。
		 */

		/*
		 * 设置是否激活放射属性。
		 * @param value 是否激活放射属性
		 */
		enableEmission:boolean;

		/*
		 * 获取放射颜色R分量。
		 * @return 放射颜色R分量。
		 */

		/*
		 * 设置放射颜色R分量。
		 * @param value 放射颜色R分量。
		 */
		emissionColorR:number;

		/*
		 * 获取放射颜色G分量。
		 * @return 放射颜色G分量。
		 */

		/*
		 * 设置放射颜色G分量。
		 * @param value 放射颜色G分量。
		 */
		emissionColorG:number;

		/*
		 * 获取放射颜色B分量。
		 * @return 放射颜色B分量。
		 */

		/*
		 * 设置放射颜色B分量。
		 * @param value 放射颜色B分量。
		 */
		emissionColorB:number;

		/*
		 * 获取放射颜色A分量。
		 * @return 放射颜色A分量。
		 */

		/*
		 * 设置放射颜色A分量。
		 * @param value 放射颜色A分量。
		 */
		emissionColorA:number;

		/*
		 * 获取放射颜色。
		 * @return 放射颜色。
		 */

		/*
		 * 设置放射颜色。
		 * @param value 放射颜色。
		 */
		emissionColor:laya.d3.math.Vector4;

		/*
		 * 获取放射贴图。
		 * @return 放射贴图。
		 */

		/*
		 * 设置放射贴图。
		 * @param value 放射贴图。
		 */
		emissionTexture:laya.resource.BaseTexture;

		/*
		 * 获取是否开启反射。
		 * @return 是否开启反射。
		 */

		/*
		 * 设置是否开启反射。
		 * @param value 是否开启反射。
		 */
		enableReflection:boolean;

		/*
		 * 获取纹理平铺和偏移X分量。
		 * @return 纹理平铺和偏移X分量。
		 */

		/*
		 * 获取纹理平铺和偏移X分量。
		 * @param x 纹理平铺和偏移X分量。
		 */
		tilingOffsetX:number;

		/*
		 * 获取纹理平铺和偏移Y分量。
		 * @return 纹理平铺和偏移Y分量。
		 */

		/*
		 * 获取纹理平铺和偏移Y分量。
		 * @param y 纹理平铺和偏移Y分量。
		 */
		tilingOffsetY:number;

		/*
		 * 获取纹理平铺和偏移Z分量。
		 * @return 纹理平铺和偏移Z分量。
		 */

		/*
		 * 获取纹理平铺和偏移Z分量。
		 * @param z 纹理平铺和偏移Z分量。
		 */
		tilingOffsetZ:number;

		/*
		 * 获取纹理平铺和偏移W分量。
		 * @return 纹理平铺和偏移W分量。
		 */

		/*
		 * 获取纹理平铺和偏移W分量。
		 * @param w 纹理平铺和偏移W分量。
		 */
		tilingOffsetW:number;

		/*
		 * 获取纹理平铺和偏移。
		 * @return 纹理平铺和偏移。
		 */

		/*
		 * 获取纹理平铺和偏移。
		 * @param value 纹理平铺和偏移。
		 */
		tilingOffset:laya.d3.math.Vector4;

		/*
		 * 设置渲染模式。
		 * @return 渲染模式。
		 */
		renderMode:number;

		/*
		 * 设置是否写入深度。
		 * @param value 是否写入深度。
		 */

		/*
		 * 获取是否写入深度。
		 * @return 是否写入深度。
		 */
		depthWrite:boolean;

		/*
		 * 设置剔除方式。
		 * @param value 剔除方式。
		 */

		/*
		 * 获取剔除方式。
		 * @return 剔除方式。
		 */
		cull:number;

		/*
		 * 设置混合方式。
		 * @param value 混合方式。
		 */

		/*
		 * 获取混合方式。
		 * @return 混合方式。
		 */
		blend:number;

		/*
		 * 设置混合源。
		 * @param value 混合源
		 */

		/*
		 * 获取混合源。
		 * @return 混合源。
		 */
		blendSrc:number;

		/*
		 * 设置混合目标。
		 * @param value 混合目标
		 */

		/*
		 * 获取混合目标。
		 * @return 混合目标。
		 */
		blendDst:number;

		/*
		 * 设置深度测试方式。
		 * @param value 深度测试方式
		 */

		/*
		 * 获取深度测试方式。
		 * @return 深度测试方式。
		 */
		depthTest:number;

		/*
		 * 创建一个 <code>PBRStandardMaterial</code> 实例。
		 */

		constructor();

		/*
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		clone():any;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		cloneTo(destObject:any):void;
	}

}

declare module laya.d3.core.material {

	/*
	 * <code>RenderState</code> 类用于控制渲染状态。
	 */
	class RenderState implements laya.d3.core.IClone  {

		/*
		 * 剔除枚举_不剔除。
		 */
		static CULL_NONE:number;

		/*
		 * 剔除枚举_剔除正面。
		 */
		static CULL_FRONT:number;

		/*
		 * 剔除枚举_剔除背面。
		 */
		static CULL_BACK:number;

		/*
		 * 混合枚举_禁用。
		 */
		static BLEND_DISABLE:number;

		/*
		 * 混合枚举_启用_RGB和Alpha统一混合。
		 */
		static BLEND_ENABLE_ALL:number;

		/*
		 * 混合枚举_启用_RGB和Alpha单独混合。
		 */
		static BLEND_ENABLE_SEPERATE:number;

		/*
		 * 混合参数枚举_零,例：RGB(0,0,0),Alpha:(1)。
		 */
		static BLENDPARAM_ZERO:number;

		/*
		 * 混合参数枚举_一,例：RGB(1,1,1),Alpha:(1)。
		 */
		static BLENDPARAM_ONE:number;

		/*
		 * 混合参数枚举_源颜色,例：RGB(Rs, Gs, Bs)，Alpha(As)。
		 */
		static BLENDPARAM_SRC_COLOR:number;

		/*
		 * 混合参数枚举_一减源颜色,例：RGB(1-Rs, 1-Gs, 1-Bs)，Alpha(1-As)。
		 */
		static BLENDPARAM_ONE_MINUS_SRC_COLOR:number;

		/*
		 * 混合参数枚举_目标颜色,例：RGB(Rd, Gd, Bd),Alpha(Ad)。
		 */
		static BLENDPARAM_DST_COLOR:number;

		/*
		 * 混合参数枚举_一减目标颜色,例：RGB(1-Rd, 1-Gd, 1-Bd)，Alpha(1-Ad)。
		 */
		static BLENDPARAM_ONE_MINUS_DST_COLOR:number;

		/*
		 * 混合参数枚举_源透明,例:RGB(As, As, As),Alpha(1-As)。
		 */
		static BLENDPARAM_SRC_ALPHA:number;

		/*
		 * 混合参数枚举_一减源阿尔法,例:RGB(1-As, 1-As, 1-As),Alpha(1-As)。
		 */
		static BLENDPARAM_ONE_MINUS_SRC_ALPHA:number;

		/*
		 * 混合参数枚举_目标阿尔法，例：RGB(Ad, Ad, Ad),Alpha(Ad)。
		 */
		static BLENDPARAM_DST_ALPHA:number;

		/*
		 * 混合参数枚举_一减目标阿尔法,例：RGB(1-Ad, 1-Ad, 1-Ad),Alpha(Ad)。
		 */
		static BLENDPARAM_ONE_MINUS_DST_ALPHA:number;

		/*
		 * 混合参数枚举_阿尔法饱和，例：RGB(min(As, 1 - Ad), min(As, 1 - Ad), min(As, 1 - Ad)),Alpha(1)。
		 */
		static BLENDPARAM_SRC_ALPHA_SATURATE:number;

		/*
		 * 混合方程枚举_加法,例：source + destination
		 */
		static BLENDEQUATION_ADD:number;

		/*
		 * 混合方程枚举_减法，例：source - destination
		 */
		static BLENDEQUATION_SUBTRACT:number;

		/*
		 * 混合方程枚举_反序减法，例：destination - source
		 */
		static BLENDEQUATION_REVERSE_SUBTRACT:number;

		/*
		 * 深度测试函数枚举_关闭深度测试。
		 */
		static DEPTHTEST_OFF:number;

		/*
		 * 深度测试函数枚举_从不通过。
		 */
		static DEPTHTEST_NEVER:number;

		/*
		 * 深度测试函数枚举_小于时通过。
		 */
		static DEPTHTEST_LESS:number;

		/*
		 * 深度测试函数枚举_等于时通过。
		 */
		static DEPTHTEST_EQUAL:number;

		/*
		 * 深度测试函数枚举_小于等于时通过。
		 */
		static DEPTHTEST_LEQUAL:number;

		/*
		 * 深度测试函数枚举_大于时通过。
		 */
		static DEPTHTEST_GREATER:number;

		/*
		 * 深度测试函数枚举_不等于时通过。
		 */
		static DEPTHTEST_NOTEQUAL:number;

		/*
		 * 深度测试函数枚举_大于等于时通过。
		 */
		static DEPTHTEST_GEQUAL:number;

		/*
		 * 深度测试函数枚举_总是通过。
		 */
		static DEPTHTEST_ALWAYS:number;

		/*
		 * 渲染剔除状态。
		 */
		cull:number;

		/*
		 * 透明混合。
		 */
		blend:number;

		/*
		 * 源混合参数,在blend为BLEND_ENABLE_ALL时生效。
		 */
		srcBlend:number;

		/*
		 * 目标混合参数,在blend为BLEND_ENABLE_ALL时生效。
		 */
		dstBlend:number;

		/*
		 * RGB源混合参数,在blend为BLEND_ENABLE_SEPERATE时生效。
		 */
		srcBlendRGB:number;

		/*
		 * RGB目标混合参数,在blend为BLEND_ENABLE_SEPERATE时生效。
		 */
		dstBlendRGB:number;

		/*
		 * Alpha源混合参数,在blend为BLEND_ENABLE_SEPERATE时生效。
		 */
		srcBlendAlpha:number;

		/*
		 * Alpha目标混合参数,在blend为BLEND_ENABLE_SEPERATE时生效。
		 */
		dstBlendAlpha:number;

		/*
		 * 混合常量颜色。
		 */
		blendConstColor:laya.d3.math.Vector4;

		/*
		 * 混合方程。
		 */
		blendEquation:number;

		/*
		 * RGB混合方程。
		 */
		blendEquationRGB:number;

		/*
		 * Alpha混合方程。
		 */
		blendEquationAlpha:number;

		/*
		 * 深度测试函数。
		 */
		depthTest:number;

		/*
		 * 是否深度写入。
		 */
		depthWrite:boolean;

		/*
		 * 创建一个 <code>RenderState</code> 实例。
		 */

		constructor();

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(dest:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.core.material {

	/*
	 * <code>SkyBoxMaterial</code> 类用于实现SkyBoxMaterial材质。
	 */
	class SkyBoxMaterial extends laya.d3.core.material.BaseMaterial  {
		static TINTCOLOR:number;
		static EXPOSURE:number;
		static ROTATION:number;
		static TEXTURECUBE:number;

		/*
		 * 默认材质，禁止修改
		 */
		static defaultMaterial:SkyBoxMaterial;

		/*
		 * 获取颜色。
		 * @return 颜色。
		 */

		/*
		 * 设置颜色。
		 * @param value 颜色。
		 */
		tintColor:laya.d3.math.Vector4;

		/*
		 * 获取曝光强度。
		 * @return 曝光强度。
		 */

		/*
		 * 设置曝光强度。
		 * @param value 曝光强度。
		 */
		exposure:number;

		/*
		 * 获取曝光强度。
		 * @return 曝光强度。
		 */

		/*
		 * 设置曝光强度。
		 * @param value 曝光强度。
		 */
		rotation:number;

		/*
		 * 获取天空盒纹理。
		 */

		/*
		 * 设置天空盒纹理。
		 */
		textureCube:laya.d3.resource.TextureCube;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		clone():any;

		/*
		 * 创建一个 <code>SkyBoxMaterial</code> 实例。
		 */

		constructor();
	}

}

declare module laya.d3.core.material {

	/*
	 * <code>SkyProceduralMaterial</code> 类用于实现SkyProceduralMaterial材质。
	 */
	class SkyProceduralMaterial extends laya.d3.core.material.BaseMaterial  {

		/*
		 * 太阳_无
		 */
		static SUN_NODE:number;

		/*
		 * 太阳_精简
		 */
		static SUN_SIMPLE:number;

		/*
		 * 太阳_高质量
		 */
		static SUN_HIGH_QUALITY:number;

		/*
		 * 默认材质，禁止修改
		 */
		static defaultMaterial:SkyProceduralMaterial;
		private _sunDisk:any;

		/*
		 * 获取太阳状态。
		 * @return 太阳状态。
		 */

		/*
		 * 设置太阳状态。
		 * @param value 太阳状态。
		 */
		sunDisk:number;

		/*
		 * 获取太阳尺寸,范围是0到1。
		 * @return 太阳尺寸。
		 */

		/*
		 * 设置太阳尺寸,范围是0到1。
		 * @param value 太阳尺寸。
		 */
		sunSize:number;

		/*
		 * 获取太阳尺寸收缩,范围是0到20。
		 * @return 太阳尺寸收缩。
		 */

		/*
		 * 设置太阳尺寸收缩,范围是0到20。
		 * @param value 太阳尺寸收缩。
		 */
		sunSizeConvergence:number;

		/*
		 * 获取大气厚度,范围是0到5。
		 * @return 大气厚度。
		 */

		/*
		 * 设置大气厚度,范围是0到5。
		 * @param value 大气厚度。
		 */
		atmosphereThickness:number;

		/*
		 * 获取天空颜色。
		 * @return 天空颜色。
		 */

		/*
		 * 设置天空颜色。
		 * @param value 天空颜色。
		 */
		skyTint:laya.d3.math.Vector4;

		/*
		 * 获取地面颜色。
		 * @return 地面颜色。
		 */

		/*
		 * 设置地面颜色。
		 * @param value 地面颜色。
		 */
		groundTint:laya.d3.math.Vector4;

		/*
		 * 获取曝光强度,范围是0到8。
		 * @return 曝光强度。
		 */

		/*
		 * 设置曝光强度,范围是0到8。
		 * @param value 曝光强度。
		 */
		exposure:number;

		/*
		 * 创建一个 <code>SkyProceduralMaterial</code> 实例。
		 */

		constructor();

		/*
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		clone():any;
	}

}

declare module laya.d3.core.material {

	/*
	 * <code>UnlitMaterial</code> 类用于实现不受光照影响的材质。
	 */
	class UnlitMaterial extends laya.d3.core.material.BaseMaterial  {

		/*
		 * 渲染状态_不透明。
		 */
		static RENDERMODE_OPAQUE:number;

		/*
		 * 渲染状态_阿尔法测试。
		 */
		static RENDERMODE_CUTOUT:number;

		/*
		 * 渲染状态__透明混合。
		 */
		static RENDERMODE_TRANSPARENT:number;

		/*
		 * 渲染状态__加色法混合。
		 */
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

		/*
		 * 默认材质，禁止修改
		 */
		static defaultMaterial:UnlitMaterial;
		private _albedoColor:any;
		private _albedoIntensity:any;
		private _enableVertexColor:any;

		/*
		 * 获取反照率颜色R分量。
		 * @return 反照率颜色R分量。
		 */

		/*
		 * 设置反照率颜色R分量。
		 * @param value 反照率颜色R分量。
		 */
		albedoColorR:number;

		/*
		 * 获取反照率颜色G分量。
		 * @return 反照率颜色G分量。
		 */

		/*
		 * 设置反照率颜色G分量。
		 * @param value 反照率颜色G分量。
		 */
		albedoColorG:number;

		/*
		 * 获取反照率颜色B分量。
		 * @return 反照率颜色B分量。
		 */

		/*
		 * 设置反照率颜色B分量。
		 * @param value 反照率颜色B分量。
		 */
		albedoColorB:number;

		/*
		 * 获取反照率颜色Z分量。
		 * @return 反照率颜色Z分量。
		 */

		/*
		 * 设置反照率颜色alpha分量。
		 * @param value 反照率颜色alpha分量。
		 */
		albedoColorA:number;

		/*
		 * 获取反照率颜色。
		 * @return 反照率颜色。
		 */

		/*
		 * 设置反照率颜色。
		 * @param value 反照率颜色。
		 */
		albedoColor:laya.d3.math.Vector4;

		/*
		 * 获取反照率强度。
		 * @return 反照率强度。
		 */

		/*
		 * 设置反照率强度。
		 * @param value 反照率强度。
		 */
		albedoIntensity:number;

		/*
		 * 获取反照率贴图。
		 * @return 反照率贴图。
		 */

		/*
		 * 设置反照率贴图。
		 * @param value 反照率贴图。
		 */
		albedoTexture:laya.resource.BaseTexture;

		/*
		 * 获取纹理平铺和偏移X分量。
		 * @return 纹理平铺和偏移X分量。
		 */

		/*
		 * 获取纹理平铺和偏移X分量。
		 * @param x 纹理平铺和偏移X分量。
		 */
		tilingOffsetX:number;

		/*
		 * 获取纹理平铺和偏移Y分量。
		 * @return 纹理平铺和偏移Y分量。
		 */

		/*
		 * 获取纹理平铺和偏移Y分量。
		 * @param y 纹理平铺和偏移Y分量。
		 */
		tilingOffsetY:number;

		/*
		 * 获取纹理平铺和偏移Z分量。
		 * @return 纹理平铺和偏移Z分量。
		 */

		/*
		 * 获取纹理平铺和偏移Z分量。
		 * @param z 纹理平铺和偏移Z分量。
		 */
		tilingOffsetZ:number;

		/*
		 * 获取纹理平铺和偏移W分量。
		 * @return 纹理平铺和偏移W分量。
		 */

		/*
		 * 获取纹理平铺和偏移W分量。
		 * @param w 纹理平铺和偏移W分量。
		 */
		tilingOffsetW:number;

		/*
		 * 获取纹理平铺和偏移。
		 * @return 纹理平铺和偏移。
		 */

		/*
		 * 获取纹理平铺和偏移。
		 * @param value 纹理平铺和偏移。
		 */
		tilingOffset:laya.d3.math.Vector4;

		/*
		 * 获取是否支持顶点色。
		 * @return 是否支持顶点色。
		 */

		/*
		 * 设置是否支持顶点色。
		 * @param value 是否支持顶点色。
		 */
		enableVertexColor:boolean;

		/*
		 * 设置渲染模式。
		 * @return 渲染模式。
		 */
		renderMode:number;

		/*
		 * 设置是否写入深度。
		 * @param value 是否写入深度。
		 */

		/*
		 * 获取是否写入深度。
		 * @return 是否写入深度。
		 */
		depthWrite:boolean;

		/*
		 * 设置剔除方式。
		 * @param value 剔除方式。
		 */

		/*
		 * 获取剔除方式。
		 * @return 剔除方式。
		 */
		cull:number;

		/*
		 * 设置混合方式。
		 * @param value 混合方式。
		 */

		/*
		 * 获取混合方式。
		 * @return 混合方式。
		 */
		blend:number;

		/*
		 * 设置混合源。
		 * @param value 混合源
		 */

		/*
		 * 获取混合源。
		 * @return 混合源。
		 */
		blendSrc:number;

		/*
		 * 设置混合目标。
		 * @param value 混合目标
		 */

		/*
		 * 获取混合目标。
		 * @return 混合目标。
		 */
		blendDst:number;

		/*
		 * 设置深度测试方式。
		 * @param value 深度测试方式
		 */

		/*
		 * 获取深度测试方式。
		 * @return 深度测试方式。
		 */
		depthTest:number;

		constructor();

		/*
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		clone():any;
	}

}

declare module laya.d3.core.material {

	/*
	 * <code>WaterPrimaryMaterial</code> 类用于实现水材质。
	 */
	class WaterPrimaryMaterial extends laya.d3.core.material.BaseMaterial  {
		static HORIZONCOLOR:number;
		static MAINTEXTURE:number;
		static NORMALTEXTURE:number;
		static WAVESCALE:number;
		static WAVESPEED:number;
		static SHADERDEFINE_MAINTEXTURE:number;
		static SHADERDEFINE_NORMALTEXTURE:number;

		/*
		 * 默认材质，禁止修改
		 */
		static defaultMaterial:WaterPrimaryMaterial;

		/*
		 * 获取地平线颜色。
		 * @return 地平线颜色。
		 */

		/*
		 * 设置地平线颜色。
		 * @param value 地平线颜色。
		 */
		horizonColor:laya.d3.math.Vector4;

		/*
		 * 获取主贴图。
		 * @return 主贴图。
		 */

		/*
		 * 设置主贴图。
		 * @param value 主贴图。
		 */
		mainTexture:laya.resource.BaseTexture;

		/*
		 * 获取法线贴图。
		 * @return 法线贴图。
		 */

		/*
		 * 设置法线贴图。
		 * @param value 法线贴图。
		 */
		normalTexture:laya.resource.BaseTexture;

		/*
		 * 获取波动缩放系数。
		 * @return 波动缩放系数。
		 */

		/*
		 * 设置波动缩放系数。
		 * @param value 波动缩放系数。
		 */
		waveScale:number;

		/*
		 * 获取波动速率。
		 * @return 波动速率。
		 */

		/*
		 * 设置波动速率。
		 * @param value 波动速率。
		 */
		waveSpeed:laya.d3.math.Vector4;

		constructor();

		/*
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		clone():any;
	}

}

declare module laya.d3.core {

	/*
	 * <code>MeshFilter</code> 类用于创建网格过滤器。
	 */
	class MeshFilter  {
		private _owner:any;
		private _sharedMesh:any;

		/*
		 * 获取共享网格。
		 * @return 共享网格。
		 */

		/*
		 * 设置共享网格。
		 * @return value 共享网格。
		 */
		sharedMesh:laya.d3.resource.models.Mesh;

		/*
		 * 创建一个新的 <code>MeshFilter</code> 实例。
		 * @param owner 所属网格精灵。
		 */

		constructor(owner:laya.d3.core.RenderableSprite3D);
		private _getMeshDefine:any;

		/*
		 * @inheritDoc 
		 */
		destroy():void;
	}

}

declare module laya.d3.core {

	/*
	 * <code>MeshRenderer</code> 类用于网格渲染器。
	 */
	class MeshRenderer extends laya.d3.core.render.BaseRender  {

		/*
		 * 创建一个新的 <code>MeshRender</code> 实例。
		 */

		constructor(owner:laya.d3.core.RenderableSprite3D);
	}

}

declare module laya.d3.core {

	/*
	 * <code>MeshSprite3D</code> 类用于创建网格。
	 */
	class MeshSprite3D extends laya.d3.core.RenderableSprite3D  {
		private _meshFilter:any;

		/*
		 * 获取网格过滤器。
		 * @return 网格过滤器。
		 */
		readonly meshFilter:laya.d3.core.MeshFilter;

		/*
		 * 获取网格渲染器。
		 * @return 网格渲染器。
		 */
		readonly meshRenderer:laya.d3.core.MeshRenderer;

		/*
		 * 创建一个 <code>MeshSprite3D</code> 实例。
		 * @param mesh 网格,同时会加载网格所用默认材质。
		 * @param name 名字。
		 */

		constructor(mesh?:laya.d3.resource.models.Mesh,name?:string);

		/*
		 * @inheritDoc 
		 * @override 
		 */
		destroy(destroyChild?:boolean):void;
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

declare module laya.d3.core {

	/*
	 * <code>TerrainMeshSprite3D</code> 类用于创建网格。
	 */
	class MeshTerrainSprite3D extends laya.d3.core.MeshSprite3D  {
		private static _tempVector3:any;
		private static _tempMatrix4x4:any;

		/*
		 * 从网格创建一个TerrainMeshSprite3D实例和其高度图属性。
		 * @param mesh 网格。
		 * @param heightMapWidth 高度图宽度。
		 * @param heightMapHeight 高度图高度。
		 * @param name 名字。
		 */
		static createFromMesh(mesh:laya.d3.resource.models.Mesh,heightMapWidth:number,heightMapHeight:number,name?:string):MeshTerrainSprite3D;

		/*
		 * 从网格创建一个TerrainMeshSprite3D实例、图片读取高度图属性。
		 * @param mesh 网格。
		 * @param image 高度图。
		 * @param name 名字。
		 */
		static createFromMeshAndHeightMap(mesh:laya.d3.resource.models.Mesh,texture:laya.resource.Texture2D,minHeight:number,maxHeight:number,name?:string):MeshTerrainSprite3D;
		private _minX:any;
		private _minZ:any;
		private _cellSize:any;
		private _heightMap:any;

		/*
		 * 获取地形X轴最小位置。
		 * @return 地形X轴最小位置。
		 */
		readonly minX:number;

		/*
		 * 获取地形Z轴最小位置。
		 * @return 地形X轴最小位置。
		 */
		readonly minZ:number;

		/*
		 * 获取地形X轴长度。
		 * @return 地形X轴长度。
		 */
		readonly width:number;

		/*
		 * 获取地形Z轴长度。
		 * @return 地形Z轴长度。
		 */
		readonly depth:number;

		/*
		 * 创建一个 <code>TerrainMeshSprite3D</code> 实例。
		 * @param mesh 网格。
		 * @param heightMap 高度图。
		 * @param name 名字。
		 */

		constructor(mesh:laya.d3.resource.models.Mesh,heightMap:laya.d3.core.HeightMap,name?:string);
		private _disableRotation:any;
		private _getScaleX:any;
		private _getScaleZ:any;
		private _initCreateFromMesh:any;
		private _initCreateFromMeshHeightMap:any;
		private _computeCellSize:any;

		/*
		 * 获取地形高度。
		 * @param x X轴坐标。
		 * @param z Z轴坐标。
		 */
		getHeight(x:number,z:number):number;
	}

}

declare module laya.d3.core.particleShuriKen.module {

	/*
	 * <code>Burst</code> 类用于粒子的爆裂描述。
	 */
	class Burst implements laya.d3.core.IClone  {

		/*
		 * 爆裂时间,单位为秒。
		 */
		private _time:any;

		/*
		 * 爆裂的最小数量。
		 */
		private _minCount:any;

		/*
		 * 爆裂的最大数量。
		 */
		private _maxCount:any;

		/*
		 * 获取爆裂时间,单位为秒。
		 * @return 爆裂时间,单位为秒。
		 */
		readonly time:number;

		/*
		 * 获取爆裂的最小数量。
		 * @return 爆裂的最小数量。
		 */
		readonly minCount:number;

		/*
		 * 获取爆裂的最大数量。
		 * @return 爆裂的最大数量。
		 */
		readonly maxCount:number;

		/*
		 * 创建一个 <code>Burst</code> 实例。
		 * @param time 爆裂时间,单位为秒。
		 * @param minCount 爆裂的最小数量。
		 * @param time 爆裂的最大数量。
		 */

		constructor(time:number,minCount:number,maxCount:number);

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.core.particleShuriKen.module {

	/*
	 * <code>ColorOverLifetime</code> 类用于粒子的生命周期颜色。
	 */
	class ColorOverLifetime  {
		private _color:any;

		/*
		 * 是否启用。
		 */
		enbale:boolean;

		/*
		 * 获取颜色。
		 */
		readonly color:laya.d3.core.particleShuriKen.module.GradientColor;

		/*
		 * 创建一个 <code>ColorOverLifetime</code> 实例。
		 */

		constructor(color:laya.d3.core.particleShuriKen.module.GradientColor);

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.core.particleShuriKen.module {

	/*
	 * <code>Emission</code> 类用于粒子发射器。
	 */
	class Emission implements laya.d3.core.IClone,laya.resource.IDestroy  {
		private _destroyed:any;

		/*
		 * 粒子发射速率,每秒发射的个数。
		 */
		private _emissionRate:any;

		/*
		 * 是否启用。
		 */
		enbale:boolean;

		/*
		 * 设置粒子发射速率。
		 * @param emissionRate 粒子发射速率 (个/秒)。
		 */

		/*
		 * 获取粒子发射速率。
		 * @return 粒子发射速率 (个/秒)。
		 */
		emissionRate:number;

		/*
		 * 获取是否已销毁。
		 * @return 是否已销毁。
		 */
		readonly destroyed:boolean;

		/*
		 * 创建一个 <code>Emission</code> 实例。
		 */

		constructor();

		/*
		 * @private 
		 */
		destroy():void;

		/*
		 * 获取粒子爆裂个数。
		 * @return 粒子爆裂个数。
		 */
		getBurstsCount():number;

		/*
		 * 通过索引获取粒子爆裂。
		 * @param index 爆裂索引。
		 * @return 粒子爆裂。
		 */
		getBurstByIndex(index:number):laya.d3.core.particleShuriKen.module.Burst;

		/*
		 * 增加粒子爆裂。
		 * @param burst 爆裂。
		 */
		addBurst(burst:laya.d3.core.particleShuriKen.module.Burst):void;

		/*
		 * 移除粒子爆裂。
		 * @param burst 爆裂。
		 */
		removeBurst(burst:laya.d3.core.particleShuriKen.module.Burst):void;

		/*
		 * 通过索引移除粒子爆裂。
		 * @param index 爆裂索引。
		 */
		removeBurstByIndex(index:number):void;

		/*
		 * 清空粒子爆裂。
		 */
		clearBurst():void;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.core.particleShuriKen.module {

	/*
	 * <code>FrameOverTime</code> 类用于创建时间帧。
	 */
	class FrameOverTime implements laya.d3.core.IClone  {

		/*
		 * 通过固定帧创建一个 <code>FrameOverTime</code> 实例。
		 * @param constant 固定帧。
		 * @return 时间帧。
		 */
		static createByConstant(constant:number):FrameOverTime;

		/*
		 * 通过时间帧创建一个 <code>FrameOverTime</code> 实例。
		 * @param overTime 时间帧。
		 * @return 时间帧。
		 */
		static createByOverTime(overTime:laya.d3.core.particleShuriKen.module.GradientDataInt):FrameOverTime;

		/*
		 * 通过随机双固定帧创建一个 <code>FrameOverTime</code> 实例。
		 * @param constantMin 最小固定帧。
		 * @param constantMax 最大固定帧。
		 * @return 时间帧。
		 */
		static createByRandomTwoConstant(constantMin:number,constantMax:number):FrameOverTime;

		/*
		 * 通过随机双时间帧创建一个 <code>FrameOverTime</code> 实例。
		 * @param gradientFrameMin 最小时间帧。
		 * @param gradientFrameMax 最大时间帧。
		 * @return 时间帧。
		 */
		static createByRandomTwoOverTime(gradientFrameMin:laya.d3.core.particleShuriKen.module.GradientDataInt,gradientFrameMax:laya.d3.core.particleShuriKen.module.GradientDataInt):FrameOverTime;
		private _type:any;
		private _constant:any;
		private _overTime:any;
		private _constantMin:any;
		private _constantMax:any;
		private _overTimeMin:any;
		private _overTimeMax:any;

		/*
		 * 生命周期旋转类型,0常量模式，1曲线模式，2随机双常量模式，3随机双曲线模式。
		 */
		readonly type:number;

		/*
		 * 固定帧。
		 */
		readonly constant:number;

		/*
		 * 时间帧。
		 */
		readonly frameOverTimeData:laya.d3.core.particleShuriKen.module.GradientDataInt;

		/*
		 * 最小固定帧。
		 */
		readonly constantMin:number;

		/*
		 * 最大固定帧。
		 */
		readonly constantMax:number;

		/*
		 * 最小时间帧。
		 */
		readonly frameOverTimeDataMin:laya.d3.core.particleShuriKen.module.GradientDataInt;

		/*
		 * 最大时间帧。
		 */
		readonly frameOverTimeDataMax:laya.d3.core.particleShuriKen.module.GradientDataInt;

		/*
		 * 创建一个 <code>FrameOverTime,不允许new，请使用静态创建函数。</code> 实例。
		 */

		constructor();

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.core.particleShuriKen.module {

	/*
	 * <code>GradientRotation</code> 类用于创建渐变角速度。
	 */
	class GradientAngularVelocity implements laya.d3.core.IClone  {

		/*
		 * 通过固定角速度创建一个 <code>GradientAngularVelocity</code> 实例。
		 * @param constant 固定角速度。
		 * @return 渐变角速度。
		 */
		static createByConstant(constant:number):GradientAngularVelocity;

		/*
		 * 通过分轴固定角速度创建一个 <code>GradientAngularVelocity</code> 实例。
		 * @param separateConstant 分轴固定角速度。
		 * @return 渐变角速度。
		 */
		static createByConstantSeparate(separateConstant:laya.d3.math.Vector3):GradientAngularVelocity;

		/*
		 * 通过渐变角速度创建一个 <code>GradientAngularVelocity</code> 实例。
		 * @param gradient 渐变角速度。
		 * @return 渐变角速度。
		 */
		static createByGradient(gradient:laya.d3.core.particleShuriKen.module.GradientDataNumber):GradientAngularVelocity;

		/*
		 * 通过分轴渐变角速度创建一个 <code>GradientAngularVelocity</code> 实例。
		 * @param gradientX X轴渐变角速度。
		 * @param gradientY Y轴渐变角速度。
		 * @param gradientZ Z轴渐变角速度。
		 * @return 渐变角速度。
		 */
		static createByGradientSeparate(gradientX:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientY:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientZ:laya.d3.core.particleShuriKen.module.GradientDataNumber):GradientAngularVelocity;

		/*
		 * 通过随机双固定角速度创建一个 <code>GradientAngularVelocity</code> 实例。
		 * @param constantMin 最小固定角速度。
		 * @param constantMax 最大固定角速度。
		 * @return 渐变角速度。
		 */
		static createByRandomTwoConstant(constantMin:number,constantMax:number):GradientAngularVelocity;

		/*
		 * 通过随机分轴双固定角速度创建一个 <code>GradientAngularVelocity</code> 实例。
		 * @param separateConstantMin 最小分轴固定角速度。
		 * @param separateConstantMax 最大分轴固定角速度。
		 * @return 渐变角速度。
		 */
		static createByRandomTwoConstantSeparate(separateConstantMin:laya.d3.math.Vector3,separateConstantMax:laya.d3.math.Vector3):GradientAngularVelocity;

		/*
		 * 通过随机双渐变角速度创建一个 <code>GradientAngularVelocity</code> 实例。
		 * @param gradientMin 最小渐变角速度。
		 * @param gradientMax 最大渐变角速度。
		 * @return 渐变角速度。
		 */
		static createByRandomTwoGradient(gradientMin:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientMax:laya.d3.core.particleShuriKen.module.GradientDataNumber):GradientAngularVelocity;

		/*
		 * 通过分轴随机双渐变角速度创建一个 <code>GradientAngularVelocity</code> 实例。
		 * @param gradientXMin 最小X轴渐变角速度。
		 * @param gradientXMax 最大X轴渐变角速度。
		 * @param gradientYMin 最小Y轴渐变角速度。
		 * @param gradientYMax 最大Y轴渐变角速度。
		 * @param gradientZMin 最小Z轴渐变角速度。
		 * @param gradientZMax 最大Z轴渐变角速度。
		 * @return 渐变角速度。
		 */
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

		/*
		 * 生命周期角速度类型,0常量模式，1曲线模式，2随机双常量模式，3随机双曲线模式。
		 */
		readonly type:number;

		/*
		 * 是否分轴。
		 */
		readonly separateAxes:boolean;

		/*
		 * 固定角速度。
		 */
		readonly constant:number;

		/*
		 * 分轴固定角速度。
		 */
		readonly constantSeparate:laya.d3.math.Vector3;

		/*
		 * 渐变角速度。
		 */
		readonly gradient:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 渐变角角速度X。
		 */
		readonly gradientX:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 渐变角速度Y。
		 */
		readonly gradientY:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 渐变角速度Z。
		 */
		readonly gradientZ:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 渐变角速度Z。
		 */
		readonly gradientW:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 最小随机双固定角速度。
		 */
		readonly constantMin:number;

		/*
		 * 最大随机双固定角速度。
		 */
		readonly constantMax:number;

		/*
		 * 最小分轴随机双固定角速度。
		 */
		readonly constantMinSeparate:laya.d3.math.Vector3;

		/*
		 * 最大分轴随机双固定角速度。
		 */
		readonly constantMaxSeparate:laya.d3.math.Vector3;

		/*
		 * 最小渐变角速度。
		 */
		readonly gradientMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 最大渐变角速度。
		 */
		readonly gradientMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 最小渐变角速度X。
		 */
		readonly gradientXMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 最大渐变角速度X。
		 */
		readonly gradientXMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 最小渐变角速度Y。
		 */
		readonly gradientYMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 最大渐变角速度Y。
		 */
		readonly gradientYMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 最小渐变角速度Z。
		 */
		readonly gradientZMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 最大渐变角速度Z。
		 */
		readonly gradientZMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 最小渐变角速度Z。
		 */
		readonly gradientWMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 最大渐变角速度Z。
		 */
		readonly gradientWMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 创建一个 <code>GradientAngularVelocity,不允许new，请使用静态创建函数。</code> 实例。
		 */

		constructor();

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.core.particleShuriKen.module {

	/*
	 * <code>GradientColor</code> 类用于创建渐变颜色。
	 */
	class GradientColor implements laya.d3.core.IClone  {

		/*
		 * 通过固定颜色创建一个 <code>GradientColor</code> 实例。
		 * @param constant 固定颜色。
		 */
		static createByConstant(constant:laya.d3.math.Vector4):GradientColor;

		/*
		 * 通过渐变颜色创建一个 <code>GradientColor</code> 实例。
		 * @param gradient 渐变色。
		 */
		static createByGradient(gradient:laya.d3.core.Gradient):GradientColor;

		/*
		 * 通过随机双固定颜色创建一个 <code>GradientColor</code> 实例。
		 * @param minConstant 最小固定颜色。
		 * @param maxConstant 最大固定颜色。
		 */
		static createByRandomTwoConstant(minConstant:laya.d3.math.Vector4,maxConstant:laya.d3.math.Vector4):GradientColor;

		/*
		 * 通过随机双渐变颜色创建一个 <code>GradientColor</code> 实例。
		 * @param minGradient 最小渐变颜色。
		 * @param maxGradient 最大渐变颜色。
		 */
		static createByRandomTwoGradient(minGradient:laya.d3.core.Gradient,maxGradient:laya.d3.core.Gradient):GradientColor;
		private _type:any;
		private _constant:any;
		private _constantMin:any;
		private _constantMax:any;
		private _gradient:any;
		private _gradientMin:any;
		private _gradientMax:any;

		/*
		 * 生命周期颜色类型,0为固定颜色模式,1渐变模式,2为随机双固定颜色模式,3随机双渐变模式。
		 */
		readonly type:number;

		/*
		 * 固定颜色。
		 */
		readonly constant:laya.d3.math.Vector4;

		/*
		 * 最小固定颜色。
		 */
		readonly constantMin:laya.d3.math.Vector4;

		/*
		 * 最大固定颜色。
		 */
		readonly constantMax:laya.d3.math.Vector4;

		/*
		 * 渐变颜色。
		 */
		readonly gradient:laya.d3.core.Gradient;

		/*
		 * 最小渐变颜色。
		 */
		readonly gradientMin:laya.d3.core.Gradient;

		/*
		 * 最大渐变颜色。
		 */
		readonly gradientMax:laya.d3.core.Gradient;

		/*
		 * 创建一个 <code>GradientColor,不允许new，请使用静态创建函数。</code> 实例。
		 */

		constructor();

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.core.particleShuriKen.module {

	/*
	 * <code>GradientDataInt</code> 类用于创建整形渐变。
	 */
	class GradientDataInt implements laya.d3.core.IClone  {
		private _currentLength:any;

		/*
		 * 整形渐变数量。
		 */
		readonly gradientCount:number;

		/*
		 * 创建一个 <code>GradientDataInt</code> 实例。
		 */

		constructor();

		/*
		 * 增加整形渐变。
		 * @param key 生命周期，范围为0到1。
		 * @param value 整形值。
		 */
		add(key:number,value:number):void;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.core.particleShuriKen.module {

	/*
	 * <code>GradientDataNumber</code> 类用于创建浮点渐变。
	 */
	class GradientDataNumber implements laya.d3.core.IClone  {
		private _currentLength:any;

		/*
		 * 渐变浮点数量。
		 */
		readonly gradientCount:number;

		/*
		 * 创建一个 <code>GradientDataNumber</code> 实例。
		 */

		constructor();

		/*
		 * 增加浮点渐变。
		 * @param key 生命周期，范围为0到1。
		 * @param value 浮点值。
		 */
		add(key:number,value:number):void;

		/*
		 * 通过索引获取键。
		 * @param index 索引。
		 * @return value 键。
		 */
		getKeyByIndex(index:number):number;

		/*
		 * 通过索引获取值。
		 * @param index 索引。
		 * @return value 值。
		 */
		getValueByIndex(index:number):number;

		/*
		 * 获取平均值。
		 */
		getAverageValue():number;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.core.particleShuriKen.module {

	/*
	 * <code>GradientDataVector2</code> 类用于创建二维向量渐变。
	 */
	class GradientDataVector2 implements laya.d3.core.IClone  {
		private _currentLength:any;

		/*
		 * 二维向量渐变数量。
		 */
		readonly gradientCount:number;

		/*
		 * 创建一个 <code>GradientDataVector2</code> 实例。
		 */

		constructor();

		/*
		 * 增加二维向量渐变。
		 * @param key 生命周期，范围为0到1。
		 * @param value 二维向量值。
		 */
		add(key:number,value:laya.d3.math.Vector2):void;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.core.particleShuriKen.module {

	/*
	 * <code>GradientSize</code> 类用于创建渐变尺寸。
	 */
	class GradientSize implements laya.d3.core.IClone  {

		/*
		 * 通过渐变尺寸创建一个 <code>GradientSize</code> 实例。
		 * @param gradient 渐变尺寸。
		 * @return 渐变尺寸。
		 */
		static createByGradient(gradient:laya.d3.core.particleShuriKen.module.GradientDataNumber):GradientSize;

		/*
		 * 通过分轴渐变尺寸创建一个 <code>GradientSize</code> 实例。
		 * @param gradientX 渐变尺寸X。
		 * @param gradientY 渐变尺寸Y。
		 * @param gradientZ 渐变尺寸Z。
		 * @return 渐变尺寸。
		 */
		static createByGradientSeparate(gradientX:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientY:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientZ:laya.d3.core.particleShuriKen.module.GradientDataNumber):GradientSize;

		/*
		 * 通过随机双固定尺寸创建一个 <code>GradientSize</code> 实例。
		 * @param constantMin 最小固定尺寸。
		 * @param constantMax 最大固定尺寸。
		 * @return 渐变尺寸。
		 */
		static createByRandomTwoConstant(constantMin:number,constantMax:number):GradientSize;

		/*
		 * 通过分轴随机双固定尺寸创建一个 <code>GradientSize</code> 实例。
		 * @param constantMinSeparate 分轴最小固定尺寸.
		 * @param constantMaxSeparate 分轴最大固定尺寸。
		 * @return 渐变尺寸。
		 */
		static createByRandomTwoConstantSeparate(constantMinSeparate:laya.d3.math.Vector3,constantMaxSeparate:laya.d3.math.Vector3):GradientSize;

		/*
		 * 通过随机双渐变尺寸创建一个 <code>GradientSize</code> 实例。
		 * @param gradientMin 最小渐变尺寸。
		 * @param gradientMax 最大渐变尺寸。
		 * @return 渐变尺寸。
		 */
		static createByRandomTwoGradient(gradientMin:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientMax:laya.d3.core.particleShuriKen.module.GradientDataNumber):GradientSize;

		/*
		 * 通过分轴随机双渐变尺寸创建一个 <code>GradientSize</code> 实例。
		 * @param gradientXMin X轴最小渐变尺寸。
		 * @param gradientXMax X轴最大渐变尺寸。
		 * @param gradientYMin Y轴最小渐变尺寸。
		 * @param gradientYMax Y轴最大渐变尺寸。
		 * @param gradientZMin Z轴最小渐变尺寸。
		 * @param gradientZMax Z轴最大渐变尺寸。
		 * @return 渐变尺寸。
		 */
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

		/*
		 * 生命周期尺寸类型，0曲线模式，1随机双常量模式，2随机双曲线模式。
		 */
		readonly type:number;

		/*
		 * 是否分轴。
		 */
		readonly separateAxes:boolean;

		/*
		 * 渐变尺寸。
		 */
		readonly gradient:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 渐变尺寸X。
		 */
		readonly gradientX:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 渐变尺寸Y。
		 */
		readonly gradientY:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 渐变尺寸Z。
		 */
		readonly gradientZ:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 最小随机双固定尺寸。
		 */
		readonly constantMin:number;

		/*
		 * 最大随机双固定尺寸。
		 */
		readonly constantMax:number;

		/*
		 * 最小分轴随机双固定尺寸。
		 */
		readonly constantMinSeparate:laya.d3.math.Vector3;

		/*
		 * 最小分轴随机双固定尺寸。
		 */
		readonly constantMaxSeparate:laya.d3.math.Vector3;

		/*
		 * 渐变最小尺寸。
		 */
		readonly gradientMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 渐变最大尺寸。
		 */
		readonly gradientMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 渐变最小尺寸X。
		 */
		readonly gradientXMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 渐变最大尺寸X。
		 */
		readonly gradientXMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 渐变最小尺寸Y。
		 */
		readonly gradientYMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 渐变最大尺寸Y。
		 */
		readonly gradientYMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 渐变最小尺寸Z。
		 */
		readonly gradientZMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 渐变最大尺寸Z。
		 */
		readonly gradientZMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 创建一个 <code>GradientSize,不允许new，请使用静态创建函数。</code> 实例。
		 */

		constructor();

		/*
		 * 获取最大尺寸。
		 */
		getMaxSizeInGradient():number;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.core.particleShuriKen.module {

	/*
	 * <code>GradientVelocity</code> 类用于创建渐变速度。
	 */
	class GradientVelocity implements laya.d3.core.IClone  {

		/*
		 * 通过固定速度创建一个 <code>GradientVelocity</code> 实例。
		 * @param constant 固定速度。
		 * @return 渐变速度。
		 */
		static createByConstant(constant:laya.d3.math.Vector3):GradientVelocity;

		/*
		 * 通过渐变速度创建一个 <code>GradientVelocity</code> 实例。
		 * @param gradientX 渐变速度X。
		 * @param gradientY 渐变速度Y。
		 * @param gradientZ 渐变速度Z。
		 * @return 渐变速度。
		 */
		static createByGradient(gradientX:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientY:laya.d3.core.particleShuriKen.module.GradientDataNumber,gradientZ:laya.d3.core.particleShuriKen.module.GradientDataNumber):GradientVelocity;

		/*
		 * 通过随机双固定速度创建一个 <code>GradientVelocity</code> 实例。
		 * @param constantMin 最小固定角速度。
		 * @param constantMax 最大固定角速度。
		 * @return 渐变速度。
		 */
		static createByRandomTwoConstant(constantMin:laya.d3.math.Vector3,constantMax:laya.d3.math.Vector3):GradientVelocity;

		/*
		 * 通过随机双渐变速度创建一个 <code>GradientVelocity</code> 实例。
		 * @param gradientXMin X轴最小渐变速度。
		 * @param gradientXMax X轴最大渐变速度。
		 * @param gradientYMin Y轴最小渐变速度。
		 * @param gradientYMax Y轴最大渐变速度。
		 * @param gradientZMin Z轴最小渐变速度。
		 * @param gradientZMax Z轴最大渐变速度。
		 * @return 渐变速度。
		 */
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

		/*
		 * 生命周期速度类型，0常量模式，1曲线模式，2随机双常量模式，3随机双曲线模式。
		 */
		readonly type:number;

		/*
		 * 固定速度。
		 */
		readonly constant:laya.d3.math.Vector3;

		/*
		 * 渐变速度X。
		 */
		readonly gradientX:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 渐变速度Y。
		 */
		readonly gradientY:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 渐变速度Z。
		 */
		readonly gradientZ:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 最小固定速度。
		 */
		readonly constantMin:laya.d3.math.Vector3;

		/*
		 * 最大固定速度。
		 */
		readonly constantMax:laya.d3.math.Vector3;

		/*
		 * 渐变最小速度X。
		 */
		readonly gradientXMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 渐变最大速度X。
		 */
		readonly gradientXMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 渐变最小速度Y。
		 */
		readonly gradientYMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 渐变最大速度Y。
		 */
		readonly gradientYMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 渐变最小速度Z。
		 */
		readonly gradientZMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 渐变最大速度Z。
		 */
		readonly gradientZMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 创建一个 <code>GradientVelocity,不允许new，请使用静态创建函数。</code> 实例。
		 */

		constructor();

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.core.particleShuriKen.module {

	/*
	 * <code>RotationOverLifetime</code> 类用于粒子的生命周期旋转。
	 */
	class RotationOverLifetime implements laya.d3.core.IClone  {
		private _angularVelocity:any;

		/*
		 * 是否启用
		 */
		enbale:boolean;

		/*
		 * 获取角速度。
		 */
		readonly angularVelocity:laya.d3.core.particleShuriKen.module.GradientAngularVelocity;

		/*
		 * 创建一个 <code>RotationOverLifetime,不允许new，请使用静态创建函数。</code> 实例。
		 */

		constructor(angularVelocity:laya.d3.core.particleShuriKen.module.GradientAngularVelocity);

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.core.particleShuriKen.module.shape {

	/*
	 * <code>BaseShape</code> 类用于粒子形状。
	 */
	class BaseShape implements laya.d3.core.IClone  {

		/*
		 * 是否启用。
		 */
		enable:boolean;

		/*
		 * 随机方向。
		 */
		randomDirection:boolean;

		/*
		 * 创建一个 <code>BaseShape</code> 实例。
		 */

		constructor();

		/*
		 * 用于生成粒子初始位置和方向。
		 * @param position 粒子位置。
		 * @param direction 粒子方向。
		 */
		generatePositionAndDirection(position:laya.d3.math.Vector3,direction:laya.d3.math.Vector3,rand?:laya.d3.math.Rand,randomSeeds?:Uint32Array):void;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.core.particleShuriKen.module.shape {

	/*
	 * <code>BoxShape</code> 类用于创建球形粒子形状。
	 */
	class BoxShape extends laya.d3.core.particleShuriKen.module.shape.BaseShape  {

		/*
		 * 发射器X轴长度。
		 */
		x:number;

		/*
		 * 发射器Y轴长度。
		 */
		y:number;

		/*
		 * 发射器Z轴长度。
		 */
		z:number;

		/*
		 * 创建一个 <code>BoxShape</code> 实例。
		 */

		constructor();

		/*
		 * 用于生成粒子初始位置和方向。
		 * @param position 粒子位置。
		 * @param direction 粒子方向。
		 * @override 
		 */
		generatePositionAndDirection(position:laya.d3.math.Vector3,direction:laya.d3.math.Vector3,rand?:laya.d3.math.Rand,randomSeeds?:Uint32Array):void;

		/*
		 * @param destObject 
		 * @override 
		 */
		cloneTo(destObject:any):void;
	}

}

declare module laya.d3.core.particleShuriKen.module.shape {

	/*
	 * <code>CircleShape</code> 类用于创建环形粒子形状。
	 */
	class CircleShape extends laya.d3.core.particleShuriKen.module.shape.BaseShape  {

		/*
		 * 发射器半径。
		 */
		radius:number;

		/*
		 * 环形弧度。
		 */
		arc:number;

		/*
		 * 从边缘发射。
		 */
		emitFromEdge:boolean;

		/*
		 * 创建一个 <code>CircleShape</code> 实例。
		 */

		constructor();

		/*
		 * 用于生成粒子初始位置和方向。
		 * @param position 粒子位置。
		 * @param direction 粒子方向。
		 * @override 
		 */
		generatePositionAndDirection(position:laya.d3.math.Vector3,direction:laya.d3.math.Vector3,rand?:laya.d3.math.Rand,randomSeeds?:Uint32Array):void;

		/*
		 * @param destObject 
		 * @override 
		 */
		cloneTo(destObject:any):void;
	}

}

declare module laya.d3.core.particleShuriKen.module.shape {

	/*
	 * <code>ConeShape</code> 类用于创建锥形粒子形状。
	 */
	class ConeShape extends laya.d3.core.particleShuriKen.module.shape.BaseShape  {

		/*
		 * 发射角度。
		 */
		angle:number;

		/*
		 * 发射器半径。
		 */
		radius:number;

		/*
		 * 椎体长度。
		 */
		length:number;

		/*
		 * 发射类型,0为Base,1为BaseShell,2为Volume,3为VolumeShell。
		 */
		emitType:number;

		/*
		 * 创建一个 <code>ConeShape</code> 实例。
		 */

		constructor();

		/*
		 * 用于生成粒子初始位置和方向。
		 * @param position 粒子位置。
		 * @param direction 粒子方向。
		 * @override 
		 */
		generatePositionAndDirection(position:laya.d3.math.Vector3,direction:laya.d3.math.Vector3,rand?:laya.d3.math.Rand,randomSeeds?:Uint32Array):void;

		/*
		 * @override 
		 */
		cloneTo(destObject:any):void;
	}

}

declare module laya.d3.core.particleShuriKen.module.shape {

	/*
	 * <code>HemisphereShape</code> 类用于创建半球形粒子形状。
	 */
	class HemisphereShape extends laya.d3.core.particleShuriKen.module.shape.BaseShape  {

		/*
		 * 发射器半径。
		 */
		radius:number;

		/*
		 * 从外壳发射。
		 */
		emitFromShell:boolean;

		/*
		 * 创建一个 <code>HemisphereShape</code> 实例。
		 */

		constructor();

		/*
		 * 用于生成粒子初始位置和方向。
		 * @param position 粒子位置。
		 * @param direction 粒子方向。
		 * @override 
		 */
		generatePositionAndDirection(position:laya.d3.math.Vector3,direction:laya.d3.math.Vector3,rand?:laya.d3.math.Rand,randomSeeds?:Uint32Array):void;

		/*
		 * @override 
		 */
		cloneTo(destObject:any):void;
	}

}

declare module laya.d3.core.particleShuriKen.module.shape {

	/*
	 * ...
	 * @author ...
	 */
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

declare module laya.d3.core.particleShuriKen.module.shape {

	/*
	 * <code>SphereShape</code> 类用于创建球形粒子形状。
	 */
	class SphereShape extends laya.d3.core.particleShuriKen.module.shape.BaseShape  {

		/*
		 * 发射器半径。
		 */
		radius:number;

		/*
		 * 从外壳发射。
		 */
		emitFromShell:boolean;

		/*
		 * 创建一个 <code>SphereShape</code> 实例。
		 */

		constructor();

		/*
		 * 用于生成粒子初始位置和方向。
		 * @param position 粒子位置。
		 * @param direction 粒子方向。
		 * @override 
		 */
		generatePositionAndDirection(position:laya.d3.math.Vector3,direction:laya.d3.math.Vector3,rand?:laya.d3.math.Rand,randomSeeds?:Uint32Array):void;

		/*
		 * @override 
		 */
		cloneTo(destObject:any):void;
	}

}

declare module laya.d3.core.particleShuriKen.module {

	/*
	 * <code>SizeOverLifetime</code> 类用于粒子的生命周期尺寸。
	 */
	class SizeOverLifetime implements laya.d3.core.IClone  {
		private _size:any;

		/*
		 * 是否启用
		 */
		enbale:boolean;

		/*
		 * 获取尺寸。
		 */
		readonly size:laya.d3.core.particleShuriKen.module.GradientSize;

		/*
		 * 创建一个 <code>SizeOverLifetime</code> 实例。
		 */

		constructor(size:laya.d3.core.particleShuriKen.module.GradientSize);

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.core.particleShuriKen.module {

	/*
	 * <code>StartFrame</code> 类用于创建开始帧。
	 */
	class StartFrame implements laya.d3.core.IClone  {

		/*
		 * 通过随机常量旋转创建一个 <code>StartFrame</code> 实例。
		 * @param constant 固定帧。
		 * @return 开始帧。
		 */
		static createByConstant(constant:number):StartFrame;

		/*
		 * 通过随机双常量旋转创建一个 <code>StartFrame</code> 实例。
		 * @param constantMin 最小固定帧。
		 * @param constantMax 最大固定帧。
		 * @return 开始帧。
		 */
		static createByRandomTwoConstant(constantMin:number,constantMax:number):StartFrame;
		private _type:any;
		private _constant:any;
		private _constantMin:any;
		private _constantMax:any;

		/*
		 * 开始帧类型,0常量模式，1随机双常量模式。
		 */
		readonly type:number;

		/*
		 * 固定帧。
		 */
		readonly constant:number;

		/*
		 * 最小固定帧。
		 */
		readonly constantMin:number;

		/*
		 * 最大固定帧。
		 */
		readonly constantMax:number;

		/*
		 * 创建一个 <code>StartFrame,不允许new，请使用静态创建函数。</code> 实例。
		 */

		constructor();

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.core.particleShuriKen.module {

	/*
	 * <code>TextureSheetAnimation</code> 类用于创建粒子帧动画。
	 */
	class TextureSheetAnimation implements laya.d3.core.IClone  {

		/*
		 * 纹理平铺。
		 */
		tiles:laya.d3.math.Vector2;

		/*
		 * 类型,0为whole sheet、1为singal row。
		 */
		type:number;

		/*
		 * 是否随机行，type为1时有效。
		 */
		randomRow:boolean;

		/*
		 * 行索引,type为1时有效。
		 */
		rowIndex:number;

		/*
		 * 循环次数。
		 */
		cycles:number;

		/*
		 * UV通道类型,0为Noting,1为Everything,待补充,暂不支持。
		 */
		enableUVChannels:number;

		/*
		 * 是否启用
		 */
		enable:boolean;

		/*
		 * 获取时间帧率。
		 */
		readonly frame:laya.d3.core.particleShuriKen.module.FrameOverTime;

		/*
		 * 获取开始帧率。
		 */
		readonly startFrame:laya.d3.core.particleShuriKen.module.StartFrame;

		/*
		 * 创建一个 <code>TextureSheetAnimation</code> 实例。
		 * @param frame 动画帧。
		 * @param startFrame 开始帧。
		 */

		constructor(frame:laya.d3.core.particleShuriKen.module.FrameOverTime,startFrame:laya.d3.core.particleShuriKen.module.StartFrame);

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.core.particleShuriKen.module {

	/*
	 * <code>VelocityOverLifetime</code> 类用于粒子的生命周期速度。
	 */
	class VelocityOverLifetime implements laya.d3.core.IClone  {

		/*
		 * 是否启用
		 */
		enbale:boolean;

		/*
		 * 速度空间,0为local,1为world。
		 */
		space:number;

		/*
		 * 获取尺寸。
		 */
		readonly velocity:laya.d3.core.particleShuriKen.module.GradientVelocity;

		/*
		 * 创建一个 <code>VelocityOverLifetime</code> 实例。
		 */

		constructor(velocity:laya.d3.core.particleShuriKen.module.GradientVelocity);

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.core.particleShuriKen {

	/*
	 * <code>ShuriKenParticle3D</code> 3D粒子。
	 */
	class ShuriKenParticle3D extends laya.d3.core.RenderableSprite3D  {

		/*
		 * 获取粒子系统。
		 * @return 粒子系统。
		 */
		readonly particleSystem:laya.d3.core.particleShuriKen.ShurikenParticleSystem;

		/*
		 * 获取粒子渲染器。
		 * @return 粒子渲染器。
		 */
		readonly particleRenderer:laya.d3.core.particleShuriKen.ShurikenParticleRenderer;

		/*
		 * 创建一个 <code>Particle3D</code> 实例。
		 * @param settings value 粒子配置。
		 */

		constructor();

		/*
		 * <p>销毁此对象。</p>
		 * @param destroyChild 是否同时销毁子节点，若值为true,则销毁子节点，否则不销毁子节点。
		 * @override 
		 */
		destroy(destroyChild?:boolean):void;
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

declare module laya.d3.core.particleShuriKen {

	/*
	 * <code>ShurikenParticleMaterial</code> 类用于实现粒子材质。
	 */
	class ShurikenParticleMaterial extends laya.d3.core.material.BaseMaterial  {

		/*
		 * 渲染状态_透明混合。
		 */
		static RENDERMODE_ALPHABLENDED:number;

		/*
		 * 渲染状态_加色法混合。
		 */
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

		/*
		 * 默认材质，禁止修改
		 */
		static defaultMaterial:ShurikenParticleMaterial;

		/*
		 * 设置渲染模式。
		 * @return 渲染模式。
		 */
		renderMode:number;

		/*
		 * 获取颜色R分量。
		 * @return 颜色R分量。
		 */

		/*
		 * 设置颜色R分量。
		 * @param value 颜色R分量。
		 */
		colorR:number;

		/*
		 * 获取颜色G分量。
		 * @return 颜色G分量。
		 */

		/*
		 * 设置颜色G分量。
		 * @param value 颜色G分量。
		 */
		colorG:number;

		/*
		 * 获取颜色B分量。
		 * @return 颜色B分量。
		 */

		/*
		 * 设置颜色B分量。
		 * @param value 颜色B分量。
		 */
		colorB:number;

		/*
		 * 获取颜色Z分量。
		 * @return 颜色Z分量。
		 */

		/*
		 * 设置颜色alpha分量。
		 * @param value 颜色alpha分量。
		 */
		colorA:number;

		/*
		 * 获取颜色。
		 * @return 颜色。
		 */

		/*
		 * 设置颜色。
		 * @param value 颜色。
		 */
		color:laya.d3.math.Vector4;

		/*
		 * 获取纹理平铺和偏移X分量。
		 * @return 纹理平铺和偏移X分量。
		 */

		/*
		 * 获取纹理平铺和偏移X分量。
		 * @param x 纹理平铺和偏移X分量。
		 */
		tilingOffsetX:number;

		/*
		 * 获取纹理平铺和偏移Y分量。
		 * @return 纹理平铺和偏移Y分量。
		 */

		/*
		 * 获取纹理平铺和偏移Y分量。
		 * @param y 纹理平铺和偏移Y分量。
		 */
		tilingOffsetY:number;

		/*
		 * 获取纹理平铺和偏移Z分量。
		 * @return 纹理平铺和偏移Z分量。
		 */

		/*
		 * 获取纹理平铺和偏移Z分量。
		 * @param z 纹理平铺和偏移Z分量。
		 */
		tilingOffsetZ:number;

		/*
		 * 获取纹理平铺和偏移W分量。
		 * @return 纹理平铺和偏移W分量。
		 */

		/*
		 * 获取纹理平铺和偏移W分量。
		 * @param w 纹理平铺和偏移W分量。
		 */
		tilingOffsetW:number;

		/*
		 * 获取纹理平铺和偏移。
		 * @return 纹理平铺和偏移。
		 */

		/*
		 * 获取纹理平铺和偏移。
		 * @param value 纹理平铺和偏移。
		 */
		tilingOffset:laya.d3.math.Vector4;

		/*
		 * 获取漫反射贴图。
		 * @return 漫反射贴图。
		 */

		/*
		 * 设置漫反射贴图。
		 * @param value 漫反射贴图。
		 */
		texture:laya.resource.BaseTexture;

		/*
		 * 设置是否写入深度。
		 * @param value 是否写入深度。
		 */

		/*
		 * 获取是否写入深度。
		 * @return 是否写入深度。
		 */
		depthWrite:boolean;

		/*
		 * 设置剔除方式。
		 * @param value 剔除方式。
		 */

		/*
		 * 获取剔除方式。
		 * @return 剔除方式。
		 */
		cull:number;

		/*
		 * 设置混合方式。
		 * @param value 混合方式。
		 */

		/*
		 * 获取混合方式。
		 * @return 混合方式。
		 */
		blend:number;

		/*
		 * 设置混合源。
		 * @param value 混合源
		 */

		/*
		 * 获取混合源。
		 * @return 混合源。
		 */
		blendSrc:number;

		/*
		 * 设置混合目标。
		 * @param value 混合目标
		 */

		/*
		 * 获取混合目标。
		 * @return 混合目标。
		 */
		blendDst:number;

		/*
		 * 设置深度测试方式。
		 * @param value 深度测试方式
		 */

		/*
		 * 获取深度测试方式。
		 * @return 深度测试方式。
		 */
		depthTest:number;

		constructor();

		/*
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		clone():any;
	}

}

declare module laya.d3.core.particleShuriKen {

	/*
	 * <code>ShurikenParticleRender</code> 类用于创建3D粒子渲染器。
	 */
	class ShurikenParticleRenderer extends laya.d3.core.render.BaseRender  {

		/*
		 * 拉伸广告牌模式摄像机速度缩放,暂不支持。
		 */
		stretchedBillboardCameraSpeedScale:number;

		/*
		 * 拉伸广告牌模式速度缩放。
		 */
		stretchedBillboardSpeedScale:number;

		/*
		 * 拉伸广告牌模式长度缩放。
		 */
		stretchedBillboardLengthScale:number;

		/*
		 * 获取渲染模式。
		 * @return 渲染模式。
		 */

		/*
		 * 设置渲染模式,0为BILLBOARD、1为STRETCHEDBILLBOARD、2为HORIZONTALBILLBOARD、3为VERTICALBILLBOARD、4为MESH。
		 * @param value 渲染模式。
		 */
		renderMode:number;

		/*
		 * 获取网格渲染模式所使用的Mesh,rendderMode为4时生效。
		 * @return 网格模式所使用Mesh。
		 */

		/*
		 * 设置网格渲染模式所使用的Mesh,rendderMode为4时生效。
		 * @param value 网格模式所使用Mesh。
		 */
		mesh:laya.d3.resource.models.Mesh;

		/*
		 * 创建一个 <code>ShurikenParticleRender</code> 实例。
		 */

		constructor(owner:laya.d3.core.particleShuriKen.ShuriKenParticle3D);

		/*
		 * @inheritDoc 
		 * @override 
		 */
		readonly bounds:laya.d3.core.Bounds;
	}

}

declare module laya.d3.core.particleShuriKen {

	/*
	 * <code>ShurikenParticleSystem</code> 类用于创建3D粒子数据模板。
	 */
	class ShurikenParticleSystem extends laya.d3.core.GeometryElement implements laya.d3.core.IClone  {

		/*
		 * 粒子运行的总时长，单位为秒。
		 */
		duration:number;

		/*
		 * 是否循环。
		 */
		looping:boolean;

		/*
		 * 是否预热。暂不支持
		 */
		prewarm:boolean;

		/*
		 * 开始延迟类型，0为常量模式,1为随机随机双常量模式，不能和prewarm一起使用。
		 */
		startDelayType:number;

		/*
		 * 开始播放延迟，不能和prewarm一起使用。
		 */
		startDelay:number;

		/*
		 * 开始播放最小延迟，不能和prewarm一起使用。
		 */
		startDelayMin:number;

		/*
		 * 开始播放最大延迟，不能和prewarm一起使用。
		 */
		startDelayMax:number;

		/*
		 * 开始速度模式，0为恒定速度，2为两个恒定速度的随机插值。缺少1、3模式
		 */
		startSpeedType:number;

		/*
		 * 开始速度,0模式。
		 */
		startSpeedConstant:number;

		/*
		 * 最小开始速度,1模式。
		 */
		startSpeedConstantMin:number;

		/*
		 * 最大开始速度,1模式。
		 */
		startSpeedConstantMax:number;

		/*
		 * 开始尺寸是否为3D模式。
		 */
		threeDStartSize:boolean;

		/*
		 * 开始尺寸模式,0为恒定尺寸，2为两个恒定尺寸的随机插值。缺少1、3模式和对应的二种3D模式
		 */
		startSizeType:number;

		/*
		 * 开始尺寸，0模式。
		 */
		startSizeConstant:number;

		/*
		 * 开始三维尺寸，0模式。
		 */
		startSizeConstantSeparate:laya.d3.math.Vector3;

		/*
		 * 最小开始尺寸，2模式。
		 */
		startSizeConstantMin:number;

		/*
		 * 最大开始尺寸，2模式。
		 */
		startSizeConstantMax:number;

		/*
		 * 最小三维开始尺寸，2模式。
		 */
		startSizeConstantMinSeparate:laya.d3.math.Vector3;

		/*
		 * 最大三维开始尺寸，2模式。
		 */
		startSizeConstantMaxSeparate:laya.d3.math.Vector3;

		/*
		 * 3D开始旋转。
		 */
		threeDStartRotation:boolean;

		/*
		 * 开始旋转模式,0为恒定尺寸，2为两个恒定旋转的随机插值,缺少2种模式,和对应的四种3D模式。
		 */
		startRotationType:number;

		/*
		 * 开始旋转，0模式。
		 */
		startRotationConstant:number;

		/*
		 * 开始三维旋转，0模式。
		 */
		startRotationConstantSeparate:laya.d3.math.Vector3;

		/*
		 * 最小开始旋转，1模式。
		 */
		startRotationConstantMin:number;

		/*
		 * 最大开始旋转，1模式。
		 */
		startRotationConstantMax:number;

		/*
		 * 最小开始三维旋转，1模式。
		 */
		startRotationConstantMinSeparate:laya.d3.math.Vector3;

		/*
		 * 最大开始三维旋转，1模式。
		 */
		startRotationConstantMaxSeparate:laya.d3.math.Vector3;

		/*
		 * 随机旋转方向，范围为0.0到1.0
		 */
		randomizeRotationDirection:number;

		/*
		 * 开始颜色模式，0为恒定颜色，2为两个恒定颜色的随机插值,缺少2种模式。
		 */
		startColorType:number;

		/*
		 * 开始颜色，0模式。
		 */
		startColorConstant:laya.d3.math.Vector4;

		/*
		 * 最小开始颜色，1模式。
		 */
		startColorConstantMin:laya.d3.math.Vector4;

		/*
		 * 最大开始颜色，1模式。
		 */
		startColorConstantMax:laya.d3.math.Vector4;

		/*
		 * 重力敏感度。
		 */
		gravityModifier:number;

		/*
		 * 模拟器空间,0为World,1为Local。暂不支持Custom。
		 */
		simulationSpace:number;

		/*
		 * 缩放模式，0为Hiercachy,1为Local,2为World。
		 */
		scaleMode:number;

		/*
		 * 激活时是否自动播放。
		 */
		playOnAwake:boolean;

		/*
		 * 随机种子,注:play()前设置有效。
		 */
		randomSeed:Uint32Array;

		/*
		 * 是否使用随机种子。
		 */
		autoRandomSeed:boolean;

		/*
		 * 是否为性能模式,性能模式下会延迟粒子释放。
		 */
		isPerformanceMode:boolean;

		/*
		 * 获取最大粒子数。
		 */

		/*
		 * 设置最大粒子数,注意:谨慎修改此属性，有性能损耗。
		 */
		maxParticles:number;

		/*
		 * 获取发射器。
		 */
		readonly emission:laya.d3.core.particleShuriKen.module.Emission;

		/*
		 * 粒子存活个数。
		 */
		readonly aliveParticleCount:number;

		/*
		 * 获取一次循环内的累计时间。
		 * @return 一次循环内的累计时间。
		 */
		readonly emissionTime:number;

		/*
		 * 获取形状。
		 */

		/*
		 * 设置形状。
		 */
		shape:laya.d3.core.particleShuriKen.module.shape.BaseShape;

		/*
		 * 是否存活。
		 */
		readonly isAlive:boolean;

		/*
		 * 是否正在发射。
		 */
		readonly isEmitting:boolean;

		/*
		 * 是否正在播放。
		 */
		readonly isPlaying:boolean;

		/*
		 * 是否已暂停。
		 */
		readonly isPaused:boolean;

		/*
		 * 获取开始生命周期模式,0为固定时间，1为渐变时间，2为两个固定之间的随机插值,3为两个渐变时间的随机插值。
		 */

		/*
		 * 设置开始生命周期模式,0为固定时间，1为渐变时间，2为两个固定之间的随机插值,3为两个渐变时间的随机插值。
		 */
		startLifetimeType:number;

		/*
		 * 获取开始生命周期，0模式,单位为秒。
		 */

		/*
		 * 设置开始生命周期，0模式,单位为秒。
		 */
		startLifetimeConstant:number;

		/*
		 * 获取开始渐变生命周期，1模式,单位为秒。
		 */

		/*
		 * 设置开始渐变生命周期，1模式,单位为秒。
		 */
		startLifeTimeGradient:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 获取最小开始生命周期，2模式,单位为秒。
		 */

		/*
		 * 设置最小开始生命周期，2模式,单位为秒。
		 */
		startLifetimeConstantMin:number;

		/*
		 * 获取最大开始生命周期，2模式,单位为秒。
		 */

		/*
		 * 设置最大开始生命周期，2模式,单位为秒。
		 */
		startLifetimeConstantMax:number;

		/*
		 * 获取开始渐变最小生命周期，3模式,单位为秒。
		 */

		/*
		 * 设置开始渐变最小生命周期，3模式,单位为秒。
		 */
		startLifeTimeGradientMin:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 获取开始渐变最大生命周期，3模式,单位为秒。
		 */

		/*
		 * 设置开始渐变最大生命周期，3模式,单位为秒。
		 */
		startLifeTimeGradientMax:laya.d3.core.particleShuriKen.module.GradientDataNumber;

		/*
		 * 获取生命周期速度,注意:如修改该值的某些属性,需重新赋值此属性才可生效。
		 * @return 生命周期速度.
		 */

		/*
		 * 设置生命周期速度,注意:如修改该值的某些属性,需重新赋值此属性才可生效。
		 * @param value 生命周期速度.
		 */
		velocityOverLifetime:laya.d3.core.particleShuriKen.module.VelocityOverLifetime;

		/*
		 * 获取生命周期颜色,注意:如修改该值的某些属性,需重新赋值此属性才可生效。
		 * @return 生命周期颜色
		 */

		/*
		 * 设置生命周期颜色,注意:如修改该值的某些属性,需重新赋值此属性才可生效。
		 * @param value 生命周期颜色
		 */
		colorOverLifetime:laya.d3.core.particleShuriKen.module.ColorOverLifetime;

		/*
		 * 获取生命周期尺寸,注意:如修改该值的某些属性,需重新赋值此属性才可生效。
		 * @return 生命周期尺寸
		 */

		/*
		 * 设置生命周期尺寸,注意:如修改该值的某些属性,需重新赋值此属性才可生效。
		 * @param value 生命周期尺寸
		 */
		sizeOverLifetime:laya.d3.core.particleShuriKen.module.SizeOverLifetime;

		/*
		 * 获取生命周期旋转,注意:如修改该值的某些属性,需重新赋值此属性才可生效。
		 * @return 生命周期旋转。
		 */

		/*
		 * 设置生命周期旋转,注意:如修改该值的某些属性,需重新赋值此属性才可生效。
		 * @param value 生命周期旋转。
		 */
		rotationOverLifetime:laya.d3.core.particleShuriKen.module.RotationOverLifetime;

		/*
		 * 获取生命周期纹理动画,注意:如修改该值的某些属性,需重新赋值此属性才可生效。
		 * @return 生命周期纹理动画。
		 */

		/*
		 * 设置生命周期纹理动画,注意:如修改该值的某些属性,需重新赋值此属性才可生效。
		 * @param value 生命周期纹理动画。
		 */
		textureSheetAnimation:laya.d3.core.particleShuriKen.module.TextureSheetAnimation;
		_getVertexBuffer(index?:number):laya.d3.graphics.VertexBuffer3D;
		_getIndexBuffer():laya.d3.graphics.IndexBuffer3D;

		constructor(owner:laya.d3.core.particleShuriKen.ShuriKenParticle3D);

		/*
		 * 发射一个粒子。
		 */
		emit(time:number):boolean;
		addParticle(position:laya.d3.math.Vector3,direction:laya.d3.math.Vector3,time:number):boolean;
		addNewParticlesToVertexBuffer():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		_getType():number;

		/*
		 * 开始发射粒子。
		 */
		play():void;

		/*
		 * 暂停发射粒子。
		 */
		pause():void;

		/*
		 * 通过指定时间增加粒子播放进度，并暂停播放。
		 * @param time 进度时间.如果restart为true,粒子播放时间会归零后再更新进度。
		 * @param restart 是否重置播放状态。
		 */
		simulate(time:number,restart?:boolean):void;

		/*
		 * 停止发射粒子。
		 */
		stop():void;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.core.pixelLine {

	/*
	 * <code>PixelLineData</code> 类用于表示线数据。
	 */
	class PixelLineData  {
		startPosition:laya.d3.math.Vector3;
		endPosition:laya.d3.math.Vector3;
		startColor:laya.d3.math.Color;
		endColor:laya.d3.math.Color;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:PixelLineData):void;
	}

}

declare module laya.d3.core.pixelLine {

	/*
	 * <code>PixelLineFilter</code> 类用于线过滤器。
	 */
	class PixelLineFilter extends laya.d3.core.GeometryElement  {

		constructor(owner:laya.d3.core.pixelLine.PixelLineSprite3D,maxLineCount:number);

		/*
		 * {@inheritDoc PixelLineFilter._getType}
		 * @override 
		 */
		_getType():number;

		/*
		 * 获取线段数据
		 * @return 线段数据。
		 */
		_getLineData(index:number,out:laya.d3.core.pixelLine.PixelLineData):void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		destroy():void;
	}

}

declare module laya.d3.core.pixelLine {

	/*
	 * <code>PixelLineMaterial</code> 类用于实现像素线材质。
	 */
	class PixelLineMaterial extends laya.d3.core.material.BaseMaterial  {
		static COLOR:number;

		/*
		 * 默认材质，禁止修改
		 */
		static defaultMaterial:PixelLineMaterial;
		static CULL:number;
		static BLEND:number;
		static BLEND_SRC:number;
		static BLEND_DST:number;
		static DEPTH_TEST:number;
		static DEPTH_WRITE:number;

		/*
		 * 获取颜色。
		 * @return 颜色。
		 */

		/*
		 * 设置颜色。
		 * @param value 颜色。
		 */
		color:laya.d3.math.Vector4;

		/*
		 * 设置是否写入深度。
		 * @param value 是否写入深度。
		 */

		/*
		 * 获取是否写入深度。
		 * @return 是否写入深度。
		 */
		depthWrite:boolean;

		/*
		 * 设置剔除方式。
		 * @param value 剔除方式。
		 */

		/*
		 * 获取剔除方式。
		 * @return 剔除方式。
		 */
		cull:number;

		/*
		 * 设置混合方式。
		 * @param value 混合方式。
		 */

		/*
		 * 获取混合方式。
		 * @return 混合方式。
		 */
		blend:number;

		/*
		 * 设置混合源。
		 * @param value 混合源
		 */

		/*
		 * 获取混合源。
		 * @return 混合源。
		 */
		blendSrc:number;

		/*
		 * 设置混合目标。
		 * @param value 混合目标
		 */

		/*
		 * 获取混合目标。
		 * @return 混合目标。
		 */
		blendDst:number;

		/*
		 * 设置深度测试方式。
		 * @param value 深度测试方式
		 */

		/*
		 * 获取深度测试方式。
		 * @return 深度测试方式。
		 */
		depthTest:number;

		constructor();
	}

}

declare module laya.d3.core.pixelLine {

	/*
	 * <code>PixelLineRenderer</code> 类用于线渲染器。
	 */
	class PixelLineRenderer extends laya.d3.core.render.BaseRender  {

		constructor(owner:laya.d3.core.pixelLine.PixelLineSprite3D);
	}

}

declare module laya.d3.core.pixelLine {

	/*
	 * <code>PixelLineSprite3D</code> 类用于像素线渲染精灵。
	 */
	class PixelLineSprite3D extends laya.d3.core.RenderableSprite3D  {

		/*
		 * 获取最大线数量
		 * @return 最大线数量。
		 */

		/*
		 * 设置最大线数量
		 * @param value 最大线数量。
		 */
		maxLineCount:number;

		/*
		 * 获取线数量。
		 * @return 线段数量。
		 */

		/*
		 * 设置获取线数量。
		 * @param value 线段数量。
		 */
		lineCount:number;

		/*
		 * 获取line渲染器。
		 * @return line渲染器。
		 */
		readonly pixelLineRenderer:laya.d3.core.pixelLine.PixelLineRenderer;

		/*
		 * 创建一个 <code>PixelLineSprite3D</code> 实例。
		 * @param maxCount 最大线段数量。
		 * @param name 名字。
		 */

		constructor(maxCount?:number,name?:string);

		/*
		 * @inheritDoc 
		 */
		_changeRenderObjects(sender:laya.d3.core.pixelLine.PixelLineRenderer,index:number,material:laya.d3.core.material.BaseMaterial):void;

		/*
		 * 增加一条线。
		 * @param startPosition 初始点位置
		 * @param endPosition 结束点位置
		 * @param startColor 初始点颜色
		 * @param endColor 结束点颜色
		 */
		addLine(startPosition:laya.d3.math.Vector3,endPosition:laya.d3.math.Vector3,startColor:laya.d3.math.Color,endColor:laya.d3.math.Color):void;

		/*
		 * 添加多条线段。
		 * @param lines 线段数据
		 */
		addLines(lines:laya.d3.core.pixelLine.PixelLineData[]):void;

		/*
		 * 移除一条线段。
		 * @param index 索引。
		 */
		removeLine(index:number):void;

		/*
		 * 更新线
		 * @param index 索引
		 * @param startPosition 初始点位置
		 * @param endPosition 结束点位置
		 * @param startColor 初始点颜色
		 * @param endColor 结束点颜色
		 */
		setLine(index:number,startPosition:laya.d3.math.Vector3,endPosition:laya.d3.math.Vector3,startColor:laya.d3.math.Color,endColor:laya.d3.math.Color):void;

		/*
		 * 获取线段数据
		 * @param out 线段数据。
		 */
		getLine(index:number,out:laya.d3.core.pixelLine.PixelLineData):void;

		/*
		 * 清除所有线段。
		 */
		clear():void;
	}

}

declare module laya.d3.core.pixelLine {

	/*
	 * ...
	 * @author 
	 */
	class PixelLineVertex  {
		private static _vertexDeclaration:any;
		static readonly vertexDeclaration:laya.d3.graphics.VertexDeclaration;
		readonly vertexDeclaration:laya.d3.graphics.VertexDeclaration;

		constructor();
	}

}

declare module laya.d3.core {

	/*
	 * <code>QuaternionKeyframe</code> 类用于创建四元数关键帧实例。
	 */
	class QuaternionKeyframe extends laya.d3.core.Keyframe  {
		inTangent:laya.d3.math.Vector4;
		outTangent:laya.d3.math.Vector4;
		value:laya.d3.math.Quaternion;

		/*
		 * 创建一个 <code>QuaternionKeyframe</code> 实例。
		 */

		constructor();

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 * @override 
		 */
		cloneTo(dest:any):void;
	}

}

declare module laya.d3.core.render {

	/*
	 * <code>Render</code> 类用于渲染器的父类，抽象类不允许实例。
	 */
	class BaseRender extends laya.events.EventDispatcher implements laya.resource.ISingletonElement,laya.d3.core.scene.IOctreeObject  {
		_supportOctree:boolean;

		/*
		 * 排序矫正值。
		 */
		sortingFudge:number;

		/*
		 * 获取唯一标识ID,通常用于识别。
		 */
		readonly id:number;

		/*
		 * 获取光照贴图的索引。
		 * @return 光照贴图的索引。
		 */

		/*
		 * 设置光照贴图的索引。
		 * @param value 光照贴图的索引。
		 */
		lightmapIndex:number;

		/*
		 * 获取光照贴图的缩放和偏移。
		 * @return 光照贴图的缩放和偏移。
		 */

		/*
		 * 设置光照贴图的缩放和偏移。
		 * @param 光照贴图的缩放和偏移 。
		 */
		lightmapScaleOffset:laya.d3.math.Vector4;

		/*
		 * 获取是否可用。
		 * @return 是否可用。
		 */

		/*
		 * 设置是否可用。
		 * @param value 是否可用。
		 */
		enable:boolean;

		/*
		 * 返回第一个实例材质,第一次使用会拷贝实例对象。
		 * @return 第一个实例材质。
		 */

		/*
		 * 设置第一个实例材质。
		 * @param value 第一个实例材质。
		 */
		material:laya.d3.core.material.BaseMaterial;

		/*
		 * 获取潜拷贝实例材质列表,第一次使用会拷贝实例对象。
		 * @return 浅拷贝实例材质列表。
		 */

		/*
		 * 设置实例材质列表。
		 * @param value 实例材质列表。
		 */
		materials:laya.d3.core.material.BaseMaterial[];

		/*
		 * 返回第一个材质。
		 * @return 第一个材质。
		 */

		/*
		 * 设置第一个材质。
		 * @param value 第一个材质。
		 */
		sharedMaterial:laya.d3.core.material.BaseMaterial;

		/*
		 * 获取浅拷贝材质列表。
		 * @return 浅拷贝材质列表。
		 */

		/*
		 * 设置材质列表。
		 * @param value 材质列表。
		 */
		sharedMaterials:laya.d3.core.material.BaseMaterial[];

		/*
		 * 获取包围盒,只读,不允许修改其值。
		 * @return 包围盒。
		 */
		readonly bounds:laya.d3.core.Bounds;

		/*
		 * 设置是否接收阴影属性
		 */

		/*
		 * 获得是否接收阴影属性
		 */
		receiveShadow:boolean;

		/*
		 * 获取是否产生阴影。
		 * @return 是否产生阴影。
		 */

		/*
		 * 设置是否产生阴影。
		 * @param value 是否产生阴影。
		 */
		castShadow:boolean;

		/*
		 * 是否是静态的一部分。
		 */
		readonly isPartOfStaticBatch:boolean;

		/*
		 */
		_getOctreeNode():laya.d3.core.scene.BoundsOctreeNode;

		/*
		 */
		_setOctreeNode(value:laya.d3.core.scene.BoundsOctreeNode):void;

		/*
		 */
		_getIndexInMotionList():number;

		/*
		 */
		_setIndexInMotionList(value:number):void;

		/*
		 * [实现ISingletonElement接口]
		 */
		_getIndexInList():number;

		/*
		 * [实现ISingletonElement接口]
		 */
		_setIndexInList(index:number):void;
	}

}

declare module laya.d3.core.render {

	/*
	 * <code>BloomEffect</code> 类用于创建泛光效果。
	 */
	class BloomEffect extends laya.d3.core.render.PostProcessEffect  {

		/*
		 * 限制泛光像素的数量,该值在伽马空间。
		 */
		clamp:number;

		/*
		 * 泛光颜色。
		 */
		color:laya.d3.math.Color;

		/*
		 * 是否开启快速模式。该模式通过降低质量来提升性能。
		 */
		fastMode:boolean;

		/*
		 * 镜头污渍纹路,用于为泛光特效增加污渍灰尘效果
		 */
		dirtTexture:laya.resource.Texture2D;

		/*
		 * 获取泛光过滤器强度,最小值为0。
		 * @return 强度。
		 */

		/*
		 * 设置泛光过滤器强度,最小值为0。
		 * @param value 强度。
		 */
		intensity:number;

		/*
		 * 设置泛光阈值,在该阈值亮度以下的像素会被过滤掉,该值在伽马空间。
		 * @return 阈值。
		 */

		/*
		 * 获取泛光阈值,在该阈值亮度以下的像素会被过滤掉,该值在伽马空间。
		 * @param value 阈值。
		 */
		threshold:number;

		/*
		 * 获取软膝盖过渡强度,在阈值以下进行渐变过渡(0为完全硬过度,1为完全软过度)。
		 * @return 软膝盖值。
		 */

		/*
		 * 设置软膝盖过渡强度,在阈值以下进行渐变过渡(0为完全硬过度,1为完全软过度)。
		 * @param value 软膝盖值。
		 */
		softKnee:number;

		/*
		 * 获取扩散值,改变泛光的扩散范围,最好使用整数值保证效果,该值会改变内部的迭代次数,范围是1到10。
		 * @return 光晕的扩散范围。
		 */

		/*
		 * 设置扩散值,改变泛光的扩散范围,最好使用整数值保证效果,该值会改变内部的迭代次数,范围是1到10。
		 * @param value 光晕的扩散范围。
		 */
		diffusion:number;

		/*
		 * 获取形变比,通过扭曲泛光产生视觉上形变,负值为垂直扭曲,正值为水平扭曲。
		 * @return 形变比。
		 */

		/*
		 * 设置形变比,通过扭曲泛光产生视觉上形变,负值为垂直扭曲,正值为水平扭曲。
		 * @param value 形变比。
		 */
		anamorphicRatio:number;

		/*
		 * 获取污渍强度。
		 * @return 污渍强度。
		 */

		/*
		 * 设置污渍强度。
		 * @param value 污渍强度。
		 */
		dirtIntensity:number;

		/*
		 * 创建一个 <code>BloomEffect</code> 实例。
		 */

		constructor();
	}

}

declare module laya.d3.core.render.command {

	/*
	 * <code>BlitCMD</code> 类用于创建从一张渲染目标输出到另外一张渲染目标指令。
	 */
	class BlitScreenQuadCMD extends laya.d3.core.render.command.Command  {

		/*
		 */
		static create(source:laya.resource.BaseTexture,dest:laya.d3.resource.RenderTexture,shader?:laya.d3.shader.Shader3D,shaderData?:laya.d3.shader.ShaderData,subShader?:number,screenType?:number):BlitScreenQuadCMD;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		run():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		recover():void;
	}

}

declare module laya.d3.core.render.command {

	/*
	 * <code>Command</code> 类用于创建指令。
	 */
	class Command  {

		/*
		 * 创建一个 <code>Command</code> 实例。
		 */

		constructor();

		/*
		 */
		run():void;

		/*
		 */
		recover():void;
	}

}

declare module laya.d3.core.render.command {

	/*
	 * <code>CommandBuffer</code> 类用于创建命令流。
	 */
	class CommandBuffer  {

		/*
		 * 创建一个 <code>CommandBuffer</code> 实例。
		 */

		constructor();

		/*
		 * 添加一条通过全屏四边形将源纹理渲染到目标渲染纹理指令。
		 * @param source 源纹理。
		 * @param dest 目标纹理。
		 * @param shader 着色器,如果为null使用内部拷贝着色器,不做任何处理。
		 * @param shaderData 着色器数据,如果为null只接收sourceTexture。
		 * @param subShader subShader索引,默认值为0。
		 */
		blitScreenQuad(source:laya.resource.BaseTexture,dest:laya.d3.resource.RenderTexture,shader?:laya.d3.shader.Shader3D,shaderData?:laya.d3.shader.ShaderData,subShader?:number):void;

		/*
		 * 添加一条通过全屏三角形将源纹理渲染到目标渲染纹理指令。
		 * @param source 源纹理。
		 * @param dest 目标纹理。
		 * @param shader 着色器,如果为null使用内部拷贝着色器,不做任何处理。
		 * @param shaderData 着色器数据,如果为null只接收sourceTexture。
		 * @param subShader subShader索引,默认值为0。
		 */
		blitScreenTriangle(source:laya.resource.BaseTexture,dest:laya.d3.resource.RenderTexture,shader?:laya.d3.shader.Shader3D,shaderData?:laya.d3.shader.ShaderData,subShader?:number):void;
	}

}

declare module laya.d3.core.render {

	/*
	 * <code>PostProcessEffect</code> 类用于创建后期处理渲染效果。
	 */
	class PostProcessEffect  {

		/*
		 * 创建一个 <code>PostProcessEffect</code> 实例。
		 */

		constructor();
	}

}

declare module laya.d3.core.render {

	/*
	 * * <code>PostProcessRenderContext</code> 类用于创建后期处理渲染上下文。
	 */
	class PostProcessRenderContext  {

		/*
		 * 源纹理。
		 */
		source:laya.d3.resource.RenderTexture;

		/*
		 * 输出纹理。
		 */
		destination:laya.d3.resource.RenderTexture;

		/*
		 * 渲染相机。
		 */
		camera:laya.d3.core.Camera;

		/*
		 * 合成着色器数据。
		 */
		compositeShaderData:laya.d3.shader.ShaderData;

		/*
		 * 后期处理指令流。
		 */
		command:laya.d3.core.render.command.CommandBuffer;

		/*
		 * 临时纹理数组。
		 */
		deferredReleaseTextures:laya.d3.resource.RenderTexture[];
	}

}

declare module laya.d3.core.render {

	/*
	 * <code>RenderContext3D</code> 类用于实现渲染状态。
	 */
	class RenderContext3D  {

		/*
		 * 渲染区宽度。
		 */
		static clientWidth:number;

		/*
		 * 渲染区高度。
		 */
		static clientHeight:number;

		/*
		 * 创建一个 <code>RenderContext3D</code> 实例。
		 */

		constructor();
	}

}

declare module laya.d3.core.render {

	/*
	 * <code>RenderElement</code> 类用于实现渲染元素。
	 */
	class RenderElement  {

		/*
		 * 创建一个 <code>RenderElement</code> 实例。
		 */

		constructor();
	}

}

declare module laya.d3.core.render {

	/*
	 * <code>ScreenQuad</code> 类用于创建全屏四边形。
	 */
	class ScreenQuad extends laya.resource.Resource  {

		/*
		 * 创建一个 <code>ScreenQuad</code> 实例,禁止使用。
		 */

		constructor();

		/*
		 * @inheritDoc 
		 * @override 
		 */
		destroy():void;
	}

}

declare module laya.d3.core.render {

	/*
	 * <code>ScreenTriangle</code> 类用于创建全屏三角形。
	 */
	class ScreenTriangle extends laya.resource.Resource  {

		/*
		 * 创建一个 <code>ScreenTriangle</code> 实例,禁止使用。
		 */

		constructor();

		/*
		 * @inheritDoc 
		 * @override 
		 */
		destroy():void;
	}

}

declare module laya.d3.core {

	/*
	 * <code>RenderableSprite3D</code> 类用于可渲染3D精灵的父类，抽象类不允许实例。
	 */
	class RenderableSprite3D extends laya.d3.core.Sprite3D  {

		/*
		 * 精灵级着色器宏定义,接收阴影。
		 */
		static SHADERDEFINE_RECEIVE_SHADOW:number;

		/*
		 * 精灵级着色器宏定义,光照贴图便宜和缩放。
		 */
		static SHADERDEFINE_SCALEOFFSETLIGHTINGMAPUV:number;

		/*
		 * 精灵级着色器宏定义,光照贴图。
		 */
		static SAHDERDEFINE_LIGHTMAP:number;

		/*
		 * 着色器变量名，光照贴图缩放和偏移。
		 */
		static LIGHTMAPSCALEOFFSET:number;

		/*
		 * 着色器变量名，光照贴图。
		 */
		static LIGHTMAP:number;

		/*
		 * 拾取颜色。
		 */
		static PICKCOLOR:number;
		pickColor:laya.d3.math.Vector4;
		static shaderDefines:laya.d3.shader.ShaderDefines;

		/*
		 * 创建一个 <code>RenderableSprite3D</code> 实例。
		 */

		constructor(name:string);

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onInActive():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onActive():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onActiveInScene():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		destroy(destroyChild?:boolean):void;
	}

}

declare module laya.d3.core.scene {

	/*
	 * <code>BoundsOctree</code> 类用于创建八叉树。
	 */
	class BoundsOctree  {

		/*
		 * 创建一个 <code>BoundsOctree</code> 实例。
		 * @param initialWorldSize 八叉树尺寸
		 * @param initialWorldPos 八叉树中心
		 * @param minNodeSize 节点最小尺寸
		 * @param loosenessVal 松散值
		 */

		constructor(initialWorldSize:number,initialWorldPos:laya.d3.math.Vector3,minNodeSize:number,looseness:number);

		/*
		 * 添加物体
		 * @param object 
		 */
		add(object:laya.d3.core.scene.IOctreeObject):void;

		/*
		 * 移除物体
		 * @return 是否成功
		 */
		remove(object:laya.d3.core.scene.IOctreeObject):boolean;

		/*
		 * 更新物体
		 */
		update(object:laya.d3.core.scene.IOctreeObject):boolean;

		/*
		 * 如果可能则收缩根节点。
		 */
		shrinkRootIfPossible():void;

		/*
		 * 添加运动物体。
		 * @param 运动物体 。
		 */
		addMotionObject(object:laya.d3.core.scene.IOctreeObject):void;

		/*
		 * 移除运动物体。
		 * @param 运动物体 。
		 */
		removeMotionObject(object:laya.d3.core.scene.IOctreeObject):void;

		/*
		 * 更新所有运动物体。
		 */
		updateMotionObjects():void;

		/*
		 * 获取是否与指定包围盒相交。
		 * @param checkBound AABB包围盒。
		 * @return 是否相交。
		 */
		isCollidingWithBoundBox(checkBounds:laya.d3.math.BoundBox):boolean;

		/*
		 * 获取是否与指定射线相交。
		 * @param ray 射线。
		 * @param maxDistance 射线的最大距离。
		 * @return 是否相交。
		 */
		isCollidingWithRay(ray:laya.d3.math.Ray,maxDistance?:number):boolean;

		/*
		 * 获取与指定包围盒相交的物体列表。
		 * @param checkBound AABB包围盒。
		 * @param result 相交物体列表
		 */
		getCollidingWithBoundBox(checkBound:laya.d3.math.BoundBox,result:any[]):void;

		/*
		 * 获取与指定射线相交的的物理列表。
		 * @param ray 射线。
		 * @param result 相交物体列表。
		 * @param maxDistance 射线的最大距离。
		 */
		getCollidingWithRay(ray:laya.d3.math.Ray,result:any[],maxDistance?:number):void;

		/*
		 * 获取与指定视锥相交的的物理列表。
		 * @param 渲染上下文 。
		 */
		getCollidingWithFrustum(context:laya.d3.core.render.RenderContext3D,shader:laya.d3.shader.Shader3D,replacementTag:string):void;

		/*
		 * 获取最大包围盒
		 * @return 最大包围盒
		 */
		getMaxBounds():laya.d3.math.BoundBox;
	}

}

declare module laya.d3.core.scene {

	/*
	 * <code>BoundsOctreeNode</code> 类用于创建八叉树节点。
	 */
	class BoundsOctreeNode  {

		/*
		 * 创建一个 <code>BoundsOctreeNode</code> 实例。
		 * @param octree 所属八叉树。
		 * @param parent 父节点。
		 * @param baseLength 节点基本长度。
		 * @param center 节点的中心位置。
		 */

		constructor(octree:laya.d3.core.scene.BoundsOctree,parent:BoundsOctreeNode,baseLength:number,center:laya.d3.math.Vector3);

		/*
		 * 添加指定物体。
		 * @param object 指定物体。
		 */
		add(object:laya.d3.core.scene.IOctreeObject):boolean;

		/*
		 * 移除指定物体。
		 * @param obejct 指定物体。
		 * @return 是否成功。
		 */
		remove(object:laya.d3.core.scene.IOctreeObject):boolean;

		/*
		 * 更新制定物体，
		 * @param obejct 指定物体。
		 * @return 是否成功。
		 */
		update(object:laya.d3.core.scene.IOctreeObject):boolean;

		/*
		 * 收缩八叉树节点。
		 * -所有物体都在根节点的八分之一区域
		 * -该节点无子节点或有子节点但1/8的子节点不包含物体
		 * @param minLength 最小尺寸。
		 * @return 新的根节点。
		 */
		shrinkIfPossible(minLength:number):BoundsOctreeNode;

		/*
		 * 检查该节点和其子节点是否包含任意物体。
		 * @return 是否包含任意物体。
		 */
		hasAnyObjects():boolean;

		/*
		 * 获取与指定包围盒相交的物体列表。
		 * @param checkBound AABB包围盒。
		 * @param result 相交物体列表
		 */
		getCollidingWithBoundBox(checkBound:laya.d3.math.BoundBox,result:any[]):void;

		/*
		 * 获取与指定射线相交的的物理列表。
		 * @param ray 射线。
		 * @param result 相交物体列表。
		 * @param maxDistance 射线的最大距离。
		 */
		getCollidingWithRay(ray:laya.d3.math.Ray,result:any[],maxDistance?:number):void;

		/*
		 * 获取与指定视锥相交的的物理列表。
		 * @param ray 射线。.
		 * @param result 相交物体列表。
		 */
		getCollidingWithFrustum(context:laya.d3.core.render.RenderContext3D,customShader:laya.d3.shader.Shader3D,replacementTag:string):void;

		/*
		 * 获取是否与指定包围盒相交。
		 * @param checkBound AABB包围盒。
		 * @return 是否相交。
		 */
		isCollidingWithBoundBox(checkBound:laya.d3.math.BoundBox):boolean;

		/*
		 * 获取是否与指定射线相交。
		 * @param ray 射线。
		 * @param maxDistance 射线的最大距离。
		 * @return 是否相交。
		 */
		isCollidingWithRay(ray:laya.d3.math.Ray,maxDistance?:number):boolean;

		/*
		 * 获取包围盒。
		 */
		getBound():laya.d3.math.BoundBox;
	}

}

declare module laya.d3.core.scene {

	/*
	 * <code>IOctreeObject</code> 类用于实现八叉树物体规范。
	 */
	interface IOctreeObject{
		_getOctreeNode():laya.d3.core.scene.BoundsOctreeNode;
		_setOctreeNode(value:laya.d3.core.scene.BoundsOctreeNode):void;
		_getIndexInMotionList():number;
		_setIndexInMotionList(value:number):void;
		bounds:laya.d3.core.Bounds;
	}

}

declare module laya.d3.core.scene {

	/*
	 * <code>OctreeMotionList</code> 类用于实现物理更新队列。
	 */
	class OctreeMotionList extends laya.d3.component.SingletonList<laya.d3.core.scene.IOctreeObject>  {

		/*
		 * 创建一个新的 <code>OctreeMotionList</code> 实例。
		 */

		constructor();
	}

}

declare module laya.d3.core.scene {

	/*
	 * <code>Scene3D</code> 类用于实现场景。
	 */
	class Scene3D extends laya.display.Sprite implements laya.webgl.submit.ISubmit,laya.resource.ICreateResource  {

		/*
		 * Hierarchy资源。
		 */
		static HIERARCHY:string;

		/*
		 * 是否开启八叉树裁剪。
		 */
		static octreeCulling:boolean;

		/*
		 * 八叉树初始化尺寸。
		 */
		static octreeInitialSize:number;

		/*
		 * 八叉树初始化中心。
		 */
		static octreeInitialCenter:laya.d3.math.Vector3;

		/*
		 * 八叉树最小尺寸。
		 */
		static octreeMinNodeSize:number;

		/*
		 * 八叉树松散值。
		 */
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

		/*
		 * 加载场景,注意:不缓存。
		 * @param url 模板地址。
		 * @param complete 完成回调。
		 */
		static load(url:string,complete:laya.utils.Handler):void;

		/*
		 * 当前创建精灵所属遮罩层。
		 */
		currentCreationLayer:number;

		/*
		 * 是否启用灯光。
		 */
		enableLight:boolean;
		parallelSplitShadowMaps:laya.d3.shadowMap.ParallelSplitShadowMap[];
		private _time:any;

		/*
		 * 获取资源的URL地址。
		 * @return URL地址。
		 */
		readonly url:string;

		/*
		 * 获取是否允许雾化。
		 * @return 是否允许雾化。
		 */

		/*
		 * 设置是否允许雾化。
		 * @param value 是否允许雾化。
		 */
		enableFog:boolean;

		/*
		 * 获取雾化颜色。
		 * @return 雾化颜色。
		 */

		/*
		 * 设置雾化颜色。
		 * @param value 雾化颜色。
		 */
		fogColor:laya.d3.math.Vector3;

		/*
		 * 获取雾化起始位置。
		 * @return 雾化起始位置。
		 */

		/*
		 * 设置雾化起始位置。
		 * @param value 雾化起始位置。
		 */
		fogStart:number;

		/*
		 * 获取雾化范围。
		 * @return 雾化范围。
		 */

		/*
		 * 设置雾化范围。
		 * @param value 雾化范围。
		 */
		fogRange:number;

		/*
		 * 获取环境光颜色。
		 * @return 环境光颜色。
		 */

		/*
		 * 设置环境光颜色。
		 * @param value 环境光颜色。
		 */
		ambientColor:laya.d3.math.Vector3;

		/*
		 * 获取天空渲染器。
		 * @return 天空渲染器。
		 */
		readonly skyRenderer:laya.d3.resource.models.SkyRenderer;

		/*
		 * 获取反射贴图。
		 * @return 反射贴图。
		 */

		/*
		 * 设置反射贴图。
		 * @param 反射贴图 。
		 */
		customReflection:laya.d3.resource.TextureCube;

		/*
		 * 获取反射强度。
		 * @return 反射强度。
		 */

		/*
		 * 设置反射强度。
		 * @param 反射强度 。
		 */
		reflectionIntensity:number;

		/*
		 * 获取物理模拟器。
		 * @return 物理模拟器。
		 */
		readonly physicsSimulation:laya.d3.physics.PhysicsSimulation;

		/*
		 * 获取反射模式。
		 * @return 反射模式。
		 */

		/*
		 * 设置反射模式。
		 * @param value 反射模式。
		 */
		reflectionMode:number;

		/*
		 * 获取场景时钟。
		 * @override 
		 */

		/*
		 * 设置场景时钟。
		 */
		timer:laya.utils.Timer;

		/*
		 * 获取输入。
		 * @return 输入。
		 */
		readonly input:laya.d3.Input3D;

		/*
		 * 创建一个 <code>Scene3D</code> 实例。
		 */

		constructor();

		/*
		 */
		_setCreateURL(url:string):void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onActive():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onInActive():void;

		/*
		 * 设置光照贴图。
		 * @param value 光照贴图。
		 */
		setlightmaps(value:laya.resource.Texture2D[]):void;

		/*
		 * 获取光照贴图浅拷贝列表。
		 * @return 获取光照贴图浅拷贝列表。
		 */
		getlightmaps():laya.resource.Texture2D[];

		/*
		 * @inheritDoc 
		 * @override 
		 */
		destroy(destroyChild?:boolean):void;

		/*
		 */
		renderSubmit():number;

		/*
		 */
		getRenderType():number;

		/*
		 */
		releaseRender():void;

		/*
		 */
		reUse(context:laya.resource.Context,pos:number):number;
	}

}

declare module laya.d3.core.scene {
	class Scene3DShaderDeclaration  {
	}

}

declare module laya.d3.core.scene {

	/*
	 * ...
	 * @author ...
	 */
	class SceneManager  {

		constructor();
	}

}

declare module laya.d3.core {

	/*
	 * <code>SkinMeshRenderer</code> 类用于蒙皮渲染器。
	 */
	class SkinnedMeshRenderer extends laya.d3.core.MeshRenderer  {

		/*
		 * 获取局部边界。
		 * @return 边界。
		 */

		/*
		 * 设置局部边界。
		 * @param value 边界
		 */
		localBounds:laya.d3.core.Bounds;

		/*
		 * 获取根节点。
		 * @return 根节点。
		 */

		/*
		 * 设置根节点。
		 * @param value 根节点。
		 */
		rootBone:laya.d3.core.Sprite3D;

		/*
		 * 用于蒙皮的骨骼。
		 */
		readonly bones:laya.d3.core.Sprite3D[];

		/*
		 * 创建一个 <code>SkinnedMeshRender</code> 实例。
		 */

		constructor(owner:laya.d3.core.RenderableSprite3D);
		private _computeSkinnedData:any;

		/*
		 * @override 获取包围盒,只读,不允许修改其值。
		 * @return 包围盒。
		 */
		readonly bounds:laya.d3.core.Bounds;
	}

}

declare module laya.d3.core {

	/*
	 * <code>SkinnedMeshSprite3D</code> 类用于创建网格。
	 */
	class SkinnedMeshSprite3D extends laya.d3.core.RenderableSprite3D  {

		/*
		 * 着色器变量名，蒙皮动画。
		 */
		static BONES:number;

		/*
		 * 获取网格过滤器。
		 * @return 网格过滤器。
		 */
		readonly meshFilter:laya.d3.core.MeshFilter;

		/*
		 * 获取网格渲染器。
		 * @return 网格渲染器。
		 */
		readonly skinnedMeshRenderer:laya.d3.core.SkinnedMeshRenderer;

		/*
		 * 创建一个 <code>MeshSprite3D</code> 实例。
		 * @param mesh 网格,同时会加载网格所用默认材质。
		 * @param name 名字。
		 */

		constructor(mesh?:laya.d3.resource.models.Mesh,name?:string);

		/*
		 * @inheritDoc 
		 * @override 
		 */
		destroy(destroyChild?:boolean):void;
	}

}

declare module laya.d3.core {
	class SkinnedMeshSprite3DShaderDeclaration  {

		/*
		 * 精灵级着色器宏定义,蒙皮动画。
		 */
		static SHADERDEFINE_BONE:number;
	}

}

declare module laya.d3.core {

	/*
	 * <code>Sprite3D</code> 类用于实现3D精灵。
	 */
	class Sprite3D extends laya.display.Node implements laya.resource.ICreateResource  {

		/*
		 * Hierarchy资源。
		 */
		static HIERARCHY:string;

		/*
		 * 创建精灵的克隆实例。
		 * @param original 原始精灵。
		 * @param parent 父节点。
		 * @param worldPositionStays 是否保持自身世界变换。
		 * @param position 世界位置,worldPositionStays为false时生效。
		 * @param rotation 世界旋转,worldPositionStays为false时生效。
		 * @return 克隆实例。
		 */
		static instantiate(original:Sprite3D,parent?:laya.display.Node,worldPositionStays?:boolean,position?:laya.d3.math.Vector3,rotation?:laya.d3.math.Quaternion):Sprite3D;

		/*
		 * 加载网格模板。
		 * @param url 模板地址。
		 * @param complete 完成回掉。
		 */
		static load(url:string,complete:laya.utils.Handler):void;

		/*
		 * 获取唯一标识ID。
		 * @return 唯一标识ID。
		 */
		readonly id:number;

		/*
		 * 获取蒙版。
		 * @return 蒙版。
		 */

		/*
		 * 设置蒙版。
		 * @param value 蒙版。
		 */
		layer:number;

		/*
		 * 获取资源的URL地址。
		 * @return URL地址。
		 */
		readonly url:string;

		/*
		 * 获取是否为静态。
		 * @return 是否为静态。
		 */
		readonly isStatic:boolean;

		/*
		 * 获取精灵变换。
		 * @return 精灵变换。
		 */
		readonly transform:laya.d3.core.Transform3D;

		/*
		 * 创建一个 <code>Sprite3D</code> 实例。
		 * @param name 精灵名称。
		 * @param isStatic 是否为静态。
		 */

		constructor(name?:string,isStatic?:boolean);

		/*
		 */
		_setCreateURL(url:string):void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onAdded():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onRemoved():void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():laya.display.Node;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		destroy(destroyChild?:boolean):void;
	}

}

declare module laya.d3.core {
	class TextureMode  {

		/*
		 * 拉伸模式。
		 */
		static Stretch:number;

		/*
		 * 平铺模式。
		 */
		static Tile:number;
	}

}

declare module laya.d3.core.trail {
enum TrailAlignment {
    View = 0,
    TransformZ = 1
}
}

declare module laya.d3.core.trail {

	/*
	 * <code>TrailFilter</code> 类用于创建拖尾过滤器。
	 */
	class TrailFilter  {
		static CURTIME:number;
		static LIFETIME:number;
		static WIDTHCURVE:number;
		static WIDTHCURVEKEYLENGTH:number;
		_owner:laya.d3.core.trail.TrailSprite3D;
		_lastPosition:laya.d3.math.Vector3;
		_curtime:number;

		/*
		 * 轨迹准线。
		 */
		alignment:number;

		/*
		 * 获取淡出时间。
		 * @return 淡出时间。
		 */

		/*
		 * 设置淡出时间。
		 * @param value 淡出时间。
		 */
		time:number;

		/*
		 * 获取新旧顶点之间最小距离。
		 * @return 新旧顶点之间最小距离。
		 */

		/*
		 * 设置新旧顶点之间最小距离。
		 * @param value 新旧顶点之间最小距离。
		 */
		minVertexDistance:number;

		/*
		 * 获取宽度倍数。
		 * @return 宽度倍数。
		 */

		/*
		 * 设置宽度倍数。
		 * @param value 宽度倍数。
		 */
		widthMultiplier:number;

		/*
		 * 获取宽度曲线。
		 * @return 宽度曲线。
		 */

		/*
		 * 设置宽度曲线。
		 * @param value 宽度曲线。
		 */
		widthCurve:laya.d3.core.FloatKeyframe[];

		/*
		 * 获取颜色梯度。
		 * @return 颜色梯度。
		 */

		/*
		 * 设置颜色梯度。
		 * @param value 颜色梯度。
		 */
		colorGradient:laya.d3.core.Gradient;

		/*
		 * 获取纹理模式。
		 * @return 纹理模式。
		 */

		/*
		 * 设置纹理模式。
		 * @param value 纹理模式。
		 */
		textureMode:number;

		constructor(owner:laya.d3.core.trail.TrailSprite3D);

		/*
		 * 轨迹准线_面向摄像机。
		 */
		static ALIGNMENT_VIEW:number;

		/*
		 * 轨迹准线_面向运动方向。
		 */
		static ALIGNMENT_TRANSFORM_Z:number;
	}

}

declare module laya.d3.core.trail {

	/*
	 * <code>TrailGeometry</code> 类用于创建拖尾渲染单元。
	 */
	class TrailGeometry extends laya.d3.core.GeometryElement  {

		/*
		 * 轨迹准线_面向摄像机。
		 */
		static ALIGNMENT_VIEW:number;

		/*
		 * 轨迹准线_面向运动方向。
		 */
		static ALIGNMENT_TRANSFORM_Z:number;
		private tmpColor:any;

		/*
		 * @private 
		 */
		private _disappearBoundsMode:any;

		constructor(owner:laya.d3.core.trail.TrailFilter);

		/*
		 * @inheritDoc 
		 * @override 
		 */
		_getType():number;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		destroy():void;
	}

}

declare module laya.d3.core.trail {

	/*
	 * <code>TrailMaterial</code> 类用于实现拖尾材质。
	 */
	class TrailMaterial extends laya.d3.core.material.BaseMaterial  {

		/*
		 * 渲染状态_透明混合。
		 */
		static RENDERMODE_ALPHABLENDED:number;

		/*
		 * 渲染状态_加色法混合。
		 */
		static RENDERMODE_ADDTIVE:number;

		/*
		 * 默认材质，禁止修改
		 */
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

		/*
		 * 设置渲染模式。
		 * @return 渲染模式。
		 */
		renderMode:number;

		/*
		 * 获取颜色R分量。
		 * @return 颜色R分量。
		 */

		/*
		 * 设置颜色R分量。
		 * @param value 颜色R分量。
		 */
		colorR:number;

		/*
		 * 获取颜色G分量。
		 * @return 颜色G分量。
		 */

		/*
		 * 设置颜色G分量。
		 * @param value 颜色G分量。
		 */
		colorG:number;

		/*
		 * 获取颜色B分量。
		 * @return 颜色B分量。
		 */

		/*
		 * 设置颜色B分量。
		 * @param value 颜色B分量。
		 */
		colorB:number;

		/*
		 * 获取颜色Z分量。
		 * @return 颜色Z分量。
		 */

		/*
		 * 设置颜色alpha分量。
		 * @param value 颜色alpha分量。
		 */
		colorA:number;

		/*
		 * 获取颜色。
		 * @return 颜色。
		 */

		/*
		 * 设置颜色。
		 * @param value 颜色。
		 */
		color:laya.d3.math.Vector4;

		/*
		 * 获取贴图。
		 * @return 贴图。
		 */

		/*
		 * 设置贴图。
		 * @param value 贴图。
		 */
		texture:laya.resource.BaseTexture;

		/*
		 * 获取纹理平铺和偏移X分量。
		 * @return 纹理平铺和偏移X分量。
		 */

		/*
		 * 获取纹理平铺和偏移X分量。
		 * @param x 纹理平铺和偏移X分量。
		 */
		tilingOffsetX:number;

		/*
		 * 获取纹理平铺和偏移Y分量。
		 * @return 纹理平铺和偏移Y分量。
		 */

		/*
		 * 获取纹理平铺和偏移Y分量。
		 * @param y 纹理平铺和偏移Y分量。
		 */
		tilingOffsetY:number;

		/*
		 * 获取纹理平铺和偏移Z分量。
		 * @return 纹理平铺和偏移Z分量。
		 */

		/*
		 * 获取纹理平铺和偏移Z分量。
		 * @param z 纹理平铺和偏移Z分量。
		 */
		tilingOffsetZ:number;

		/*
		 * 获取纹理平铺和偏移W分量。
		 * @return 纹理平铺和偏移W分量。
		 */

		/*
		 * 获取纹理平铺和偏移W分量。
		 * @param w 纹理平铺和偏移W分量。
		 */
		tilingOffsetW:number;

		/*
		 * 获取纹理平铺和偏移。
		 * @return 纹理平铺和偏移。
		 */

		/*
		 * 设置纹理平铺和偏移。
		 * @param value 纹理平铺和偏移。
		 */
		tilingOffset:laya.d3.math.Vector4;

		/*
		 * 设置是否写入深度。
		 * @param value 是否写入深度。
		 */

		/*
		 * 获取是否写入深度。
		 * @return 是否写入深度。
		 */
		depthWrite:boolean;

		/*
		 * 设置剔除方式。
		 * @param value 剔除方式。
		 */

		/*
		 * 获取剔除方式。
		 * @return 剔除方式。
		 */
		cull:number;

		/*
		 * 设置混合方式。
		 * @param value 混合方式。
		 */

		/*
		 * 获取混合方式。
		 * @return 混合方式。
		 */
		blend:number;

		/*
		 * 设置混合源。
		 * @param value 混合源
		 */

		/*
		 * 获取混合源。
		 * @return 混合源。
		 */
		blendSrc:number;

		/*
		 * 设置混合目标。
		 * @param value 混合目标
		 */

		/*
		 * 获取混合目标。
		 * @return 混合目标。
		 */
		blendDst:number;

		/*
		 * 设置深度测试方式。
		 * @param value 深度测试方式
		 */

		/*
		 * 获取深度测试方式。
		 * @return 深度测试方式。
		 */
		depthTest:number;

		constructor();

		/*
		 * @inheritdoc 
		 * @override 
		 */
		clone():any;
	}

}

declare module laya.d3.core.trail {

	/*
	 * <code>TrailRenderer</code> 类用于创建拖尾渲染器。
	 */
	class TrailRenderer extends laya.d3.core.render.BaseRender  {

		constructor(owner:laya.d3.core.trail.TrailSprite3D);
		protected _projectionViewWorldMatrix:laya.d3.math.Matrix4x4;
	}

}

declare module laya.d3.core.trail {

	/*
	 * <code>TrailSprite3D</code> 类用于创建拖尾渲染精灵。
	 */
	class TrailSprite3D extends laya.d3.core.RenderableSprite3D  {

		/*
		 * 获取Trail过滤器。
		 * @return Trail过滤器。
		 */
		readonly trailFilter:laya.d3.core.trail.TrailFilter;

		/*
		 * 获取Trail渲染器。
		 * @return Trail渲染器。
		 */
		readonly trailRenderer:laya.d3.core.trail.TrailRenderer;

		constructor(name?:string);

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onActive():void;

		/*
		 * <p>销毁此对象。</p>
		 * @param destroyChild 是否同时销毁子节点，若值为true,则销毁子节点，否则不销毁子节点。
		 * @override 
		 */
		destroy(destroyChild?:boolean):void;
	}

}

declare module laya.d3.core.trail {

	/*
	 * <code>VertexTrail</code> 类用于创建拖尾顶点结构。
	 */
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

declare module laya.d3.core {

	/*
	 * <code>Transform3D</code> 类用于实现3D变换。
	 */
	class Transform3D extends laya.events.EventDispatcher  {

		/*
		 * 获取所属精灵。
		 */
		readonly owner:laya.d3.core.Sprite3D;

		/*
		 * 获取世界矩阵是否需要更新。
		 * @return 世界矩阵是否需要更新。
		 */
		readonly worldNeedUpdate:boolean;

		/*
		 * 获取局部位置X轴分量。
		 * @return 局部位置X轴分量。
		 */

		/*
		 * 设置局部位置X轴分量。
		 * @param x 局部位置X轴分量。
		 */
		localPositionX:number;

		/*
		 * 获取局部位置Y轴分量。
		 * @return 局部位置Y轴分量。
		 */

		/*
		 * 设置局部位置Y轴分量。
		 * @param y 局部位置Y轴分量。
		 */
		localPositionY:number;

		/*
		 * 获取局部位置Z轴分量。
		 * @return 局部位置Z轴分量。
		 */

		/*
		 * 设置局部位置Z轴分量。
		 * @param z 局部位置Z轴分量。
		 */
		localPositionZ:number;

		/*
		 * 获取局部位置。
		 * @return 局部位置。
		 */

		/*
		 * 设置局部位置。
		 * @param value 局部位置。
		 */
		localPosition:laya.d3.math.Vector3;

		/*
		 * 获取局部旋转四元数X分量。
		 * @return 局部旋转四元数X分量。
		 */

		/*
		 * 设置局部旋转四元数X分量。
		 * @param x 局部旋转四元数X分量。
		 */
		localRotationX:number;

		/*
		 * 获取局部旋转四元数Y分量。
		 * @return 局部旋转四元数Y分量。
		 */

		/*
		 * 设置局部旋转四元数Y分量。
		 * @param y 局部旋转四元数Y分量。
		 */
		localRotationY:number;

		/*
		 * 获取局部旋转四元数Z分量。
		 * @return 局部旋转四元数Z分量。
		 */

		/*
		 * 设置局部旋转四元数Z分量。
		 * @param z 局部旋转四元数Z分量。
		 */
		localRotationZ:number;

		/*
		 * 获取局部旋转四元数W分量。
		 * @return 局部旋转四元数W分量。
		 */

		/*
		 * 设置局部旋转四元数W分量。
		 * @param w 局部旋转四元数W分量。
		 */
		localRotationW:number;

		/*
		 * 获取局部旋转。
		 * @return 局部旋转。
		 */

		/*
		 * 设置局部旋转。
		 * @param value 局部旋转。
		 */
		localRotation:laya.d3.math.Quaternion;

		/*
		 * 获取局部缩放X。
		 * @return 局部缩放X。
		 */

		/*
		 * 设置局部缩放X。
		 * @param value 局部缩放X。
		 */
		localScaleX:number;

		/*
		 * 获取局部缩放Y。
		 * @return 局部缩放Y。
		 */

		/*
		 * 设置局部缩放Y。
		 * @param value 局部缩放Y。
		 */
		localScaleY:number;

		/*
		 * 获取局部缩放Z。
		 * @return 局部缩放Z。
		 */

		/*
		 * 设置局部缩放Z。
		 * @param value 局部缩放Z。
		 */
		localScaleZ:number;

		/*
		 * 获取局部缩放。
		 * @return 局部缩放。
		 */

		/*
		 * 设置局部缩放。
		 * @param value 局部缩放。
		 */
		localScale:laya.d3.math.Vector3;

		/*
		 * 获取局部空间的X轴欧拉角。
		 * @return 局部空间的X轴欧拉角。
		 */

		/*
		 * 设置局部空间的X轴欧拉角。
		 * @param value 局部空间的X轴欧拉角。
		 */
		localRotationEulerX:number;

		/*
		 * 获取局部空间的Y轴欧拉角。
		 * @return 局部空间的Y轴欧拉角。
		 */

		/*
		 * 设置局部空间的Y轴欧拉角。
		 * @param value 局部空间的Y轴欧拉角。
		 */
		localRotationEulerY:number;

		/*
		 * 获取局部空间的Z轴欧拉角。
		 * @return 局部空间的Z轴欧拉角。
		 */

		/*
		 * 设置局部空间的Z轴欧拉角。
		 * @param value 局部空间的Z轴欧拉角。
		 */
		localRotationEulerZ:number;

		/*
		 * 获取局部空间欧拉角。
		 * @return 欧拉角的旋转值。
		 */

		/*
		 * 设置局部空间的欧拉角。
		 * @param value 欧拉角的旋转值。
		 */
		localRotationEuler:laya.d3.math.Vector3;

		/*
		 * 获取局部矩阵。
		 * @return 局部矩阵。
		 */

		/*
		 * 设置局部矩阵。
		 * @param value 局部矩阵。
		 */
		localMatrix:laya.d3.math.Matrix4x4;

		/*
		 * 获取世界位置。
		 * @return 世界位置。
		 */

		/*
		 * 设置世界位置。
		 * @param value 世界位置。
		 */
		position:laya.d3.math.Vector3;

		/*
		 * 获取世界旋转。
		 * @return 世界旋转。
		 */

		/*
		 * 设置世界旋转。
		 * @param value 世界旋转。
		 */
		rotation:laya.d3.math.Quaternion;

		/*
		 * 获取世界空间的旋转角度。
		 * @return 欧拉角的旋转值，顺序为x、y、z。
		 */

		/*
		 * 设置世界空间的旋转角度。
		 * @param 欧拉角的旋转值 ，顺序为x、y、z。
		 */
		rotationEuler:laya.d3.math.Vector3;

		/*
		 * 获取世界矩阵。
		 * @return 世界矩阵。
		 */

		/*
		 * 设置世界矩阵。
		 * @param value 世界矩阵。
		 */
		worldMatrix:laya.d3.math.Matrix4x4;

		/*
		 * 创建一个 <code>Transform3D</code> 实例。
		 * @param owner 所属精灵。
		 */

		constructor(owner:laya.d3.core.Sprite3D);

		/*
		 * 平移变换。
		 * @param translation 移动距离。
		 * @param isLocal 是否局部空间。
		 */
		translate(translation:laya.d3.math.Vector3,isLocal?:boolean):void;

		/*
		 * 旋转变换。
		 * @param rotations 旋转幅度。
		 * @param isLocal 是否局部空间。
		 * @param isRadian 是否弧度制。
		 */
		rotate(rotation:laya.d3.math.Vector3,isLocal?:boolean,isRadian?:boolean):void;

		/*
		 * 获取向前方向。
		 * @param 前方向 。
		 */
		getForward(forward:laya.d3.math.Vector3):void;

		/*
		 * 获取向上方向。
		 * @param 上方向 。
		 */
		getUp(up:laya.d3.math.Vector3):void;

		/*
		 * 获取向右方向。
		 * @param 右方向 。
		 */
		getRight(right:laya.d3.math.Vector3):void;

		/*
		 * 观察目标位置。
		 * @param target 观察目标。
		 * @param up 向上向量。
		 * @param isLocal 是否局部空间。
		 */
		lookAt(target:laya.d3.math.Vector3,up:laya.d3.math.Vector3,isLocal?:boolean):void;

		/*
		 * 世界缩放。
		 * 某种条件下获取该值可能不正确（例如：父节点有缩放，子节点有旋转），缩放会倾斜，无法使用Vector3正确表示,必须使用Matrix3x3矩阵才能正确表示。
		 * @return 世界缩放。
		 */
		getWorldLossyScale():laya.d3.math.Vector3;

		/*
		 * 设置世界缩放。
		 * 某种条件下设置该值可能不正确（例如：父节点有缩放，子节点有旋转），缩放会倾斜，无法使用Vector3正确表示,必须使用Matrix3x3矩阵才能正确表示。
		 * @return 世界缩放。
		 */
		setWorldLossyScale(value:laya.d3.math.Vector3):void;
		scale:laya.d3.math.Vector3;
	}

}

declare module laya.d3.core {

	/*
	 * <code>Vector3Keyframe</code> 类用于创建三维向量关键帧实例。
	 */
	class Vector3Keyframe extends laya.d3.core.Keyframe  {
		inTangent:laya.d3.math.Vector3;
		outTangent:laya.d3.math.Vector3;
		value:laya.d3.math.Vector3;

		/*
		 * 创建一个 <code>Vector3Keyframe</code> 实例。
		 */

		constructor();

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 * @override 
		 */
		cloneTo(dest:any):void;
	}

}

declare module laya.d3.graphics {

	/*
	 * <code>IndexBuffer3D</code> 类用于创建索引缓冲。
	 */
	class IndexBuffer3D extends laya.webgl.utils.Buffer  {

		/*
		 * 8位ubyte无符号索引类型。
		 */
		static INDEXTYPE_UBYTE:string;

		/*
		 * 16位ushort无符号索引类型。
		 */
		static INDEXTYPE_USHORT:string;

		/*
		 * 获取索引类型。
		 * @return 索引类型。
		 */
		readonly indexType:string;

		/*
		 * 获取索引类型字节数量。
		 * @return 索引类型字节数量。
		 */
		readonly indexTypeByteCount:number;

		/*
		 * 获取索引个数。
		 * @return 索引个数。
		 */
		readonly indexCount:number;

		/*
		 * 获取是否可读。
		 * @return 是否可读。
		 */
		readonly canRead:boolean;

		/*
		 * 创建一个 <code>IndexBuffer3D,不建议开发者使用并用IndexBuffer3D.create()代替</code> 实例。
		 * @param indexType 索引类型。
		 * @param indexCount 索引个数。
		 * @param bufferUsage IndexBuffer3D用途类型。
		 * @param canRead 是否可读。
		 */

		constructor(indexType:string,indexCount:number,bufferUsage?:number,canRead?:boolean);

		/*
		 * @inheritDoc 
		 * @override 
		 */
		_bindForVAO():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		bind():boolean;

		/*
		 * 设置数据。
		 * @param data 索引数据。
		 * @param bufferOffset 索引缓冲中的偏移。
		 * @param dataStartIndex 索引数据的偏移。
		 * @param dataCount 索引数据的数量。
		 */
		setData(data:any,bufferOffset?:number,dataStartIndex?:number,dataCount?:number):void;

		/*
		 * 获取索引数据。
		 * @return 索引数据。
		 */
		getData():Uint16Array;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		destroy():void;
	}

}

declare module laya.d3.graphics {

	/*
	 * <code>IVertex</code> 接口用于实现创建顶点声明。
	 */
	interface IVertex{
		vertexDeclaration:laya.d3.graphics.VertexDeclaration;
	}

}

declare module laya.d3.graphics {

	/*
	 * <code>StaticBatchManager</code> 类用于静态批处理管理的父类。
	 */
	class StaticBatchManager  {

		/*
		 * 静态批处理合并，合并后子节点修改Transform属性无效，根节点staticBatchRoot可为null,如果根节点不为null，根节点可移动。
		 * 如果renderableSprite3Ds为null，合并staticBatchRoot以及其所有子节点为静态批处理，staticBatchRoot作为静态根节点。
		 * 如果renderableSprite3Ds不为null,合并renderableSprite3Ds为静态批处理，staticBatchRoot作为静态根节点。
		 * @param staticBatchRoot 静态批处理根节点。
		 * @param renderableSprite3Ds 静态批处理子节点队列。
		 */
		static combine(staticBatchRoot:laya.d3.core.Sprite3D,renderableSprite3Ds?:laya.d3.core.RenderableSprite3D[]):void;

		/*
		 * 创建一个 <code>StaticBatchManager</code> 实例。
		 */

		constructor();
	}

}

declare module laya.d3.graphics.Vertex {

	/*
	 * ...
	 * @author ...
	 */
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

		/*
		 * 获取顶点声明。
		 * @param vertexFlag 顶点声明标记字符,格式为:"POSITION,NORMAL,COLOR,UV,UV1,BLENDWEIGHT,BLENDINDICES,TANGENT"。
		 * @return 顶点声明。
		 */
		static getVertexDeclaration(vertexFlag:string,compatible?:boolean):laya.d3.graphics.VertexDeclaration;
	}

}

declare module laya.d3.graphics.Vertex {

	/*
	 * <code>VertexPositionTerrain</code> 类用于创建位置、法线、纹理1、纹理2顶点结构。
	 */
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

declare module laya.d3.graphics.Vertex {

	/*
	 * <code>VertexPositionNormalTexture</code> 类用于创建位置、纹理顶点结构。
	 */
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

declare module laya.d3.graphics.Vertex {

	/*
	 * ...
	 * @author ...
	 */
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

declare module laya.d3.graphics.Vertex {

	/*
	 * <code>VertexShurikenParticle</code> 类用于创建粒子顶点结构。
	 */
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

declare module laya.d3.graphics.Vertex {

	/*
	 * /**
	 *    <code>VertexShurikenParticle</code> 类用于创建粒子顶点结构。
	 */
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

declare module laya.d3.graphics {

	/*
	 * <code>VertexBuffer3D</code> 类用于创建顶点缓冲。
	 */
	class VertexBuffer3D extends laya.webgl.utils.Buffer  {

		/*
		 * 数据类型_Float32Array类型。
		 */
		static DATATYPE_FLOAT32ARRAY:number;

		/*
		 * 数据类型_Uint8Array类型。
		 */
		static DATATYPE_UINT8ARRAY:number;

		/*
		 * 获取顶点声明。
		 */

		/*
		 * 获取顶点声明。
		 */
		vertexDeclaration:laya.d3.graphics.VertexDeclaration;

		/*
		 * 获取顶点个数。
		 * @return 顶点个数。
		 */
		readonly vertexCount:number;

		/*
		 * 获取是否可读。
		 * @return 是否可读。
		 */
		readonly canRead:boolean;

		/*
		 * 创建一个 <code>VertexBuffer3D</code> 实例。
		 * @param vertexCount 顶点个数。
		 * @param bufferUsage VertexBuffer3D用途类型。
		 * @param canRead 是否可读。
		 * @param dateType 数据类型。
		 */

		constructor(byteLength:number,bufferUsage:number,canRead?:boolean);

		/*
		 * @inheritDoc 
		 * @override 
		 */
		bind():boolean;

		/*
		 * 设置数据。
		 * @param data 顶点数据。
		 * @param bufferOffset 顶点缓冲中的偏移,以字节为单位。
		 * @param dataStartIndex 顶点数据的偏移,以字节为单位。
		 * @param dataCount 顶点数据的长度,以字节为单位。
		 */
		setData(buffer:ArrayBuffer,bufferOffset?:number,dataStartIndex?:number,dataCount?:number):void;

		/*
		 * 获取顶点数据。
		 * @return 顶点数据。
		 */
		getUint8Data():Uint8Array;

		/*
		 * @ignore 
		 */
		getFloat32Data():Float32Array;

		/*
		 * @ignore 
		 */
		markAsUnreadbale():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		destroy():void;
	}

}

declare module laya.d3.graphics {

	/*
	 * <code>VertexDeclaration</code> 类用于生成顶点声明。
	 */
	class VertexDeclaration  {

		/*
		 * 获取唯一标识ID(通常用于优化或识别)。
		 * @return 唯一标识ID
		 */
		readonly id:number;

		/*
		 * 顶点跨度，以字节为单位。
		 */
		readonly vertexStride:number;

		/*
		 * 顶点元素的数量。
		 */
		readonly vertexElementCount:number;

		/*
		 * 创建一个 <code>VertexDeclaration</code> 实例。
		 * @param vertexStride 顶点跨度。
		 * @param vertexElements 顶点元素集合。
		 */

		constructor(vertexStride:number,vertexElements:Array<laya.d3.graphics.VertexElement>);

		/*
		 * 通过索引获取顶点元素。
		 * @param index 索引。
		 */
		getVertexElementByIndex(index:number):laya.d3.graphics.VertexElement;
	}

}

declare module laya.d3.graphics {

	/*
	 * <code>VertexElement</code> 类用于创建顶点结构分配。
	 */
	class VertexElement  {
		readonly offset:number;
		readonly elementFormat:string;
		readonly elementUsage:number;

		constructor(offset:number,elementFormat:string,elementUsage:number);
	}

}

declare module laya.d3.graphics {

	/*
	 * ...
	 * @author ...
	 */
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

		/*
		 * 获取顶点元素格式信息。
		 */
		static getElementInfos(element:string):any[];
	}

}

declare module laya.d3 {

	/*
	 * <code>Input3D</code> 类用于实现3D输入。
	 */
	class Input3D  {

		/*
		 * 获取触摸点个数。
		 * @return 触摸点个数。
		 */
		touchCount():number;

		/*
		 * 获取是否可以使用多点触摸。
		 * @return 是否可以使用多点触摸。
		 */

		/*
		 * 设置是否可以使用多点触摸。
		 * @param 是否可以使用多点触摸 。
		 */
		multiTouchEnabled:boolean;

		/*
		 * 获取触摸点。
		 * @param index 索引。
		 * @return 触摸点。
		 */
		getTouch(index:number):laya.d3.Touch;
	}

}

declare module laya.d3.loaders {

	/*
	 * ...
	 * @author ...
	 */
	class MeshReader  {

		constructor();
		static read(data:ArrayBuffer,mesh:laya.d3.resource.models.Mesh,subMeshes:laya.d3.resource.models.SubMesh[]):void;
	}

}

declare module laya.d3.math {

	/*
	 * <code>BoundBox</code> 类用于创建包围盒。
	 */
	class BoundBox implements laya.d3.core.IClone  {

		/*
		 * 最小顶点。
		 */
		min:laya.d3.math.Vector3;

		/*
		 * 最大顶点。
		 */
		max:laya.d3.math.Vector3;

		/*
		 * 创建一个 <code>BoundBox</code> 实例。
		 * @param min 包围盒的最小顶点。
		 * @param max 包围盒的最大顶点。
		 */

		constructor(min:laya.d3.math.Vector3,max:laya.d3.math.Vector3);

		/*
		 * 获取包围盒的8个角顶点。
		 * @param corners 返回顶点的输出队列。
		 */
		getCorners(corners:laya.d3.math.Vector3[]):void;

		/*
		 * 获取中心点。
		 * @param out 
		 */
		getCenter(out:laya.d3.math.Vector3):void;

		/*
		 * 获取范围。
		 * @param out 
		 */
		getExtent(out:laya.d3.math.Vector3):void;

		/*
		 * 设置中心点和范围。
		 * @param center 
		 */
		setCenterAndExtent(center:laya.d3.math.Vector3,extent:laya.d3.math.Vector3):void;
		toDefault():void;

		/*
		 * 从顶点生成包围盒。
		 * @param points 所需顶点队列。
		 * @param out 生成的包围盒。
		 */
		static createfromPoints(points:laya.d3.math.Vector3[],out:BoundBox):void;

		/*
		 * 合并两个包围盒。
		 * @param box1 包围盒1。
		 * @param box2 包围盒2。
		 * @param out 生成的包围盒。
		 */
		static merge(box1:BoundBox,box2:BoundBox,out:BoundBox):void;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.math {

	/*
	 * <code>BoundFrustum</code> 类用于创建锥截体。
	 */
	class BoundFrustum  {

		/*
		 * 4x4矩阵
		 */
		private _matrix:any;

		/*
		 * 近平面
		 */
		private _near:any;

		/*
		 * 远平面
		 */
		private _far:any;

		/*
		 * 左平面
		 */
		private _left:any;

		/*
		 * 右平面
		 */
		private _right:any;

		/*
		 * 顶平面
		 */
		private _top:any;

		/*
		 * 底平面
		 */
		private _bottom:any;

		/*
		 * 创建一个 <code>BoundFrustum</code> 实例。
		 * @param matrix 锥截体的描述4x4矩阵。
		 */

		constructor(matrix:laya.d3.math.Matrix4x4);

		/*
		 * 获取描述矩阵。
		 * @return 描述矩阵。
		 */

		/*
		 * 设置描述矩阵。
		 * @param matrix 描述矩阵。
		 */
		matrix:laya.d3.math.Matrix4x4;

		/*
		 * 获取近平面。
		 * @return 近平面。
		 */
		readonly near:laya.d3.math.Plane;

		/*
		 * 获取远平面。
		 * @return 远平面。
		 */
		readonly far:laya.d3.math.Plane;

		/*
		 * 获取左平面。
		 * @return 左平面。
		 */
		readonly left:laya.d3.math.Plane;

		/*
		 * 获取右平面。
		 * @return 右平面。
		 */
		readonly right:laya.d3.math.Plane;

		/*
		 * 获取顶平面。
		 * @return 顶平面。
		 */
		readonly top:laya.d3.math.Plane;

		/*
		 * 获取底平面。
		 * @return 底平面。
		 */
		readonly bottom:laya.d3.math.Plane;

		/*
		 * 判断是否与其他锥截体相等。
		 * @param other 锥截体。
		 */
		equalsBoundFrustum(other:BoundFrustum):boolean;

		/*
		 * 判断是否与其他对象相等。
		 * @param obj 对象。
		 */
		equalsObj(obj:any):boolean;

		/*
		 * 获取锥截体的任意一平面。
		 * 0:近平面
		 * 1:远平面
		 * 2:左平面
		 * 3:右平面
		 * 4:顶平面
		 * 5:底平面
		 * @param index 索引。
		 */
		getPlane(index:number):laya.d3.math.Plane;

		/*
		 * 根据描述矩阵获取锥截体的6个面。
		 * @param m 描述矩阵。
		 * @param np 近平面。
		 * @param fp 远平面。
		 * @param lp 左平面。
		 * @param rp 右平面。
		 * @param tp 顶平面。
		 * @param bp 底平面。
		 */
		private static _getPlanesFromMatrix:any;

		/*
		 * 锥截体三个相交平面的交点。
		 * @param p1 平面1。
		 * @param p2 平面2。
		 * @param p3 平面3。
		 */
		private static _get3PlaneInterPoint:any;

		/*
		 * 锥截体的8个顶点。
		 * @param corners 返回顶点的输出队列。
		 */
		getCorners(corners:laya.d3.math.Vector3[]):void;

		/*
		 * 与点的位置关系。返回-1,包涵;0,相交;1,不相交
		 * @param point 点。
		 */
		containsPoint(point:laya.d3.math.Vector3):number;

		/*
		 * 是否与包围盒交叉。
		 * @param box 包围盒。
		 */
		intersects(box:laya.d3.math.BoundBox):boolean;

		/*
		 * 与包围盒的位置关系。返回-1,包涵;0,相交;1,不相交
		 * @param box 包围盒。
		 */
		containsBoundBox(box:laya.d3.math.BoundBox):number;

		/*
		 * 与包围球的位置关系。返回-1,包涵;0,相交;1,不相交
		 * @param sphere 包围球。
		 */
		containsBoundSphere(sphere:laya.d3.math.BoundSphere):number;
	}

}

declare module laya.d3.math {

	/*
	 * <code>BoundSphere</code> 类用于创建包围球。
	 */
	class BoundSphere implements laya.d3.core.IClone  {
		private static _tempVector3:any;

		/*
		 * 包围球的中心。
		 */
		center:laya.d3.math.Vector3;

		/*
		 * 包围球的半径。
		 */
		radius:number;

		/*
		 * 创建一个 <code>BoundSphere</code> 实例。
		 * @param center 包围球的中心。
		 * @param radius 包围球的半径。
		 */

		constructor(center:laya.d3.math.Vector3,radius:number);
		toDefault():void;

		/*
		 * 从顶点的子队列生成包围球。
		 * @param points 顶点的队列。
		 * @param start 顶点子队列的起始偏移。
		 * @param count 顶点子队列的顶点数。
		 * @param result 生成的包围球。
		 */
		static createFromSubPoints(points:laya.d3.math.Vector3[],start:number,count:number,out:BoundSphere):void;

		/*
		 * 从顶点队列生成包围球。
		 * @param points 顶点的队列。
		 * @param result 生成的包围球。
		 */
		static createfromPoints(points:laya.d3.math.Vector3[],out:BoundSphere):void;

		/*
		 * 判断射线是否与碰撞球交叉，并返回交叉距离。
		 * @param ray 射线。
		 * @return 距离交叉点的距离，-1表示不交叉。
		 */
		intersectsRayDistance(ray:laya.d3.math.Ray):number;

		/*
		 * 判断射线是否与碰撞球交叉，并返回交叉点。
		 * @param ray 射线。
		 * @param outPoint 交叉点。
		 * @return 距离交叉点的距离，-1表示不交叉。
		 */
		intersectsRayPoint(ray:laya.d3.math.Ray,outPoint:laya.d3.math.Vector3):number;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.math {

	/*
	 * <code>Collision</code> 类用于检测碰撞。
	 */
	class CollisionUtils  {

		/*
		 * 创建一个 <code>Collision</code> 实例。
		 */

		constructor();

		/*
		 * 空间中点到平面的距离
		 * @param plane 平面
		 * @param point 点
		 */
		static distancePlaneToPoint(plane:laya.d3.math.Plane,point:laya.d3.math.Vector3):number;

		/*
		 * 空间中点到包围盒的距离
		 * @param box 包围盒
		 * @param point 点
		 */
		static distanceBoxToPoint(box:laya.d3.math.BoundBox,point:laya.d3.math.Vector3):number;

		/*
		 * 空间中包围盒到包围盒的距离
		 * @param box1 包围盒1
		 * @param box2 包围盒2
		 */
		static distanceBoxToBox(box1:laya.d3.math.BoundBox,box2:laya.d3.math.BoundBox):number;

		/*
		 * 空间中点到包围球的距离
		 * @param sphere 包围球
		 * @param point 点
		 */
		static distanceSphereToPoint(sphere:laya.d3.math.BoundSphere,point:laya.d3.math.Vector3):number;

		/*
		 * 空间中包围球到包围球的距离
		 * @param sphere1 包围球1
		 * @param sphere2 包围球2
		 */
		static distanceSphereToSphere(sphere1:laya.d3.math.BoundSphere,sphere2:laya.d3.math.BoundSphere):number;

		/*
		 * 空间中射线和三角面是否相交,输出距离
		 * @param ray 射线
		 * @param vertex1 三角面顶点1
		 * @param vertex2 三角面顶点2
		 * @param vertex3 三角面顶点3
		 * @param out 点和三角面的距离
		 * @return 是否相交
		 */
		static intersectsRayAndTriangleRD(ray:laya.d3.math.Ray,vertex1:laya.d3.math.Vector3,vertex2:laya.d3.math.Vector3,vertex3:laya.d3.math.Vector3,out:number):boolean;

		/*
		 * 空间中射线和三角面是否相交,输出相交点
		 * @param ray 射线
		 * @param vertex1 三角面顶点1
		 * @param vertex2 三角面顶点2
		 * @param vertex3 三角面顶点3
		 * @param out 相交点
		 * @return 是否相交
		 */
		static intersectsRayAndTriangleRP(ray:laya.d3.math.Ray,vertex1:laya.d3.math.Vector3,vertex2:laya.d3.math.Vector3,vertex3:laya.d3.math.Vector3,out:laya.d3.math.Vector3):boolean;

		/*
		 * 空间中射线和点是否相交
		 * @param sphere1 包围球1
		 * @param sphere2 包围球2
		 */
		static intersectsRayAndPoint(ray:laya.d3.math.Ray,point:laya.d3.math.Vector3):boolean;

		/*
		 * 空间中射线和射线是否相交
		 * @param ray1 射线1
		 * @param ray2 射线2
		 * @param out 相交点
		 */
		static intersectsRayAndRay(ray1:laya.d3.math.Ray,ray2:laya.d3.math.Ray,out:laya.d3.math.Vector3):boolean;

		/*
		 * 空间中平面和三角面是否相交
		 * @param plane 平面
		 * @param vertex1 三角面顶点1
		 * @param vertex2 三角面顶点2
		 * @param vertex3 三角面顶点3
		 * @return 返回空间位置关系
		 */
		static intersectsPlaneAndTriangle(plane:laya.d3.math.Plane,vertex1:laya.d3.math.Vector3,vertex2:laya.d3.math.Vector3,vertex3:laya.d3.math.Vector3):number;

		/*
		 * 空间中射线和平面是否相交
		 * @param ray 射线
		 * @param plane 平面
		 * @param out 相交距离,如果为0,不相交
		 */
		static intersectsRayAndPlaneRD(ray:laya.d3.math.Ray,plane:laya.d3.math.Plane,out:number):boolean;

		/*
		 * 空间中射线和平面是否相交
		 * @param ray 射线
		 * @param plane 平面
		 * @param out 相交点
		 */
		static intersectsRayAndPlaneRP(ray:laya.d3.math.Ray,plane:laya.d3.math.Plane,out:laya.d3.math.Vector3):boolean;

		/*
		 * 空间中射线和包围盒是否相交
		 * @param ray 射线
		 * @param box 包围盒
		 * @param out 相交距离,如果为0,不相交
		 */
		static intersectsRayAndBoxRD(ray:laya.d3.math.Ray,box:laya.d3.math.BoundBox):number;

		/*
		 * 空间中射线和包围盒是否相交
		 * @param ray 射线
		 * @param box 包围盒
		 * @param out 相交点
		 */
		static intersectsRayAndBoxRP(ray:laya.d3.math.Ray,box:laya.d3.math.BoundBox,out:laya.d3.math.Vector3):number;

		/*
		 * 空间中射线和包围球是否相交
		 * @param ray 射线
		 * @param sphere 包围球
		 * @return 相交距离,-1表示不相交
		 */
		static intersectsRayAndSphereRD(ray:laya.d3.math.Ray,sphere:laya.d3.math.BoundSphere):number;

		/*
		 * 空间中射线和包围球是否相交
		 * @param ray 射线
		 * @param sphere 包围球
		 * @param out 相交点
		 * @return 相交距离,-1表示不相交
		 */
		static intersectsRayAndSphereRP(ray:laya.d3.math.Ray,sphere:laya.d3.math.BoundSphere,out:laya.d3.math.Vector3):number;

		/*
		 * 空间中包围球和三角面是否相交
		 * @param sphere 包围球
		 * @param vertex1 三角面顶点1
		 * @param vertex2 三角面顶点2
		 * @param vertex3 三角面顶点3
		 * @return 返回是否相交
		 */
		static intersectsSphereAndTriangle(sphere:laya.d3.math.BoundSphere,vertex1:laya.d3.math.Vector3,vertex2:laya.d3.math.Vector3,vertex3:laya.d3.math.Vector3):boolean;

		/*
		 * 空间中点和平面是否相交
		 * @param plane 平面
		 * @param point 点
		 * @return 碰撞状态
		 */
		static intersectsPlaneAndPoint(plane:laya.d3.math.Plane,point:laya.d3.math.Vector3):number;

		/*
		 * 空间中平面和平面是否相交
		 * @param plane1 平面1
		 * @param plane2 平面2
		 * @return 是否相交
		 */
		static intersectsPlaneAndPlane(plane1:laya.d3.math.Plane,plane2:laya.d3.math.Plane):boolean;

		/*
		 * 空间中平面和平面是否相交
		 * @param plane1 平面1
		 * @param plane2 平面2
		 * @param line 相交线
		 * @return 是否相交
		 */
		static intersectsPlaneAndPlaneRL(plane1:laya.d3.math.Plane,plane2:laya.d3.math.Plane,line:laya.d3.math.Ray):boolean;

		/*
		 * 空间中平面和包围盒是否相交
		 * @param plane 平面
		 * @param box 包围盒
		 * @return 碰撞状态
		 */
		static intersectsPlaneAndBox(plane:laya.d3.math.Plane,box:laya.d3.math.BoundBox):number;

		/*
		 * 空间中平面和包围球是否相交
		 * @param plane 平面
		 * @param sphere 包围球
		 * @return 碰撞状态
		 */
		static intersectsPlaneAndSphere(plane:laya.d3.math.Plane,sphere:laya.d3.math.BoundSphere):number;

		/*
		 * 空间中包围盒和包围盒是否相交
		 * @param box1 包围盒1
		 * @param box2 包围盒2
		 * @return 是否相交
		 */
		static intersectsBoxAndBox(box1:laya.d3.math.BoundBox,box2:laya.d3.math.BoundBox):boolean;

		/*
		 * 空间中包围盒和包围球是否相交
		 * @param box 包围盒
		 * @param sphere 包围球
		 * @return 是否相交
		 */
		static intersectsBoxAndSphere(box:laya.d3.math.BoundBox,sphere:laya.d3.math.BoundSphere):boolean;

		/*
		 * 空间中包围球和包围球是否相交
		 * @param sphere1 包围球1
		 * @param sphere2 包围球2
		 * @return 是否相交
		 */
		static intersectsSphereAndSphere(sphere1:laya.d3.math.BoundSphere,sphere2:laya.d3.math.BoundSphere):boolean;

		/*
		 * 空间中包围盒是否包含另一个点
		 * @param box 包围盒
		 * @param point 点
		 * @return 位置关系:0 不想交,1 包含, 2 相交
		 */
		static boxContainsPoint(box:laya.d3.math.BoundBox,point:laya.d3.math.Vector3):number;

		/*
		 * 空间中包围盒是否包含另一个包围盒
		 * @param box1 包围盒1
		 * @param box2 包围盒2
		 * @return 位置关系:0 不想交,1 包含, 2 相交
		 */
		static boxContainsBox(box1:laya.d3.math.BoundBox,box2:laya.d3.math.BoundBox):number;

		/*
		 * 空间中包围盒是否包含另一个包围球
		 * @param box 包围盒
		 * @param sphere 包围球
		 * @return 位置关系:0 不想交,1 包含, 2 相交
		 */
		static boxContainsSphere(box:laya.d3.math.BoundBox,sphere:laya.d3.math.BoundSphere):number;

		/*
		 * 空间中包围球是否包含另一个点
		 * @param sphere 包围球
		 * @param point 点
		 * @return 位置关系:0 不想交,1 包含, 2 相交
		 */
		static sphereContainsPoint(sphere:laya.d3.math.BoundSphere,point:laya.d3.math.Vector3):number;

		/*
		 * 空间中包围球是否包含另一个三角面
		 * @param sphere 
		 * @param vertex1 三角面顶点1
		 * @param vertex2 三角面顶点2
		 * @param vertex3 三角面顶点3
		 * @return 返回空间位置关系
		 */
		static sphereContainsTriangle(sphere:laya.d3.math.BoundSphere,vertex1:laya.d3.math.Vector3,vertex2:laya.d3.math.Vector3,vertex3:laya.d3.math.Vector3):number;

		/*
		 * 空间中包围球是否包含另一包围盒
		 * @param sphere 包围球
		 * @param box 包围盒
		 * @return 位置关系:0 不想交,1 包含, 2 相交
		 */
		static sphereContainsBox(sphere:laya.d3.math.BoundSphere,box:laya.d3.math.BoundBox):number;

		/*
		 * 空间中包围球是否包含另一包围球
		 * @param sphere1 包围球
		 * @param sphere2 包围球
		 * @return 位置关系:0 不想交,1 包含, 2 相交
		 */
		static sphereContainsSphere(sphere1:laya.d3.math.BoundSphere,sphere2:laya.d3.math.BoundSphere):number;

		/*
		 * 空间中点与三角面的最近点
		 * @param point 点
		 * @param vertex1 三角面顶点1
		 * @param vertex2 三角面顶点2
		 * @param vertex3 三角面顶点3
		 * @param out 最近点
		 */
		static closestPointPointTriangle(point:laya.d3.math.Vector3,vertex1:laya.d3.math.Vector3,vertex2:laya.d3.math.Vector3,vertex3:laya.d3.math.Vector3,out:laya.d3.math.Vector3):void;

		/*
		 * 空间中平面与一点的最近点
		 * @param plane 平面
		 * @param point 点
		 * @param out 最近点
		 */
		static closestPointPlanePoint(plane:laya.d3.math.Plane,point:laya.d3.math.Vector3,out:laya.d3.math.Vector3):void;

		/*
		 * 空间中包围盒与一点的最近点
		 * @param box 包围盒
		 * @param point 点
		 * @param out 最近点
		 */
		static closestPointBoxPoint(box:laya.d3.math.BoundBox,point:laya.d3.math.Vector3,out:laya.d3.math.Vector3):void;

		/*
		 * 空间中包围球与一点的最近点
		 * @param sphere 包围球
		 * @param point 点
		 * @param out 最近点
		 */
		static closestPointSpherePoint(sphere:laya.d3.math.BoundSphere,point:laya.d3.math.Vector3,out:laya.d3.math.Vector3):void;

		/*
		 * 空间中包围球与包围球的最近点
		 * @param sphere1 包围球1
		 * @param sphere2 包围球2
		 * @param out 最近点
		 */
		static closestPointSphereSphere(sphere1:laya.d3.math.BoundSphere,sphere2:laya.d3.math.BoundSphere,out:laya.d3.math.Vector3):void;
	}

}

declare module laya.d3.math {

	/*
	 * <code>Color</code> 类用于创建颜色实例。
	 */
	class Color implements laya.d3.core.IClone  {

		/*
		 * 红色
		 */
		static RED:Color;

		/*
		 * 绿色
		 */
		static GREEN:Color;

		/*
		 * 蓝色
		 */
		static BLUE:Color;

		/*
		 * 蓝绿色
		 */
		static CYAN:Color;

		/*
		 * 黄色
		 */
		static YELLOW:Color;

		/*
		 * 品红色
		 */
		static MAGENTA:Color;

		/*
		 * 灰色
		 */
		static GRAY:Color;

		/*
		 * 白色
		 */
		static WHITE:Color;

		/*
		 * 黑色
		 */
		static BLACK:Color;
		static gammaToLinearSpace(value:number):number;
		static linearToGammaSpace(value:number):number;

		/*
		 * red分量
		 */
		r:number;

		/*
		 * green分量
		 */
		g:number;

		/*
		 * blue分量
		 */
		b:number;

		/*
		 * alpha分量
		 */
		a:number;

		/*
		 * 创建一个 <code>Color</code> 实例。
		 * @param r 颜色的red分量。
		 * @param g 颜色的green分量。
		 * @param b 颜色的blue分量。
		 * @param a 颜色的alpha分量。
		 */

		constructor(r?:number,g?:number,b?:number,a?:number);

		/*
		 * Gamma空间转换到线性空间。
		 * @param linear 线性空间颜色。
		 */
		toLinear(out:Color):void;

		/*
		 * 线性空间转换到Gamma空间。
		 * @param gamma Gamma空间颜色。
		 */
		toGamma(out:Color):void;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
		forNativeElement():void;
	}

}

declare module laya.d3.math {

	/*
	 * <code>ContainmentType</code> 类用于定义空间物体位置关系。
	 */
	class ContainmentType  {
		static Disjoint:number;
		static Contains:number;
		static Intersects:number;
	}

}

declare module laya.d3.math {

	/*
	 * <code>HalfFloatUtils</code> 类用于创建HalfFloat工具。
	 */
	class HalfFloatUtils  {

		/*
		 * round a number to a half float number bits.
		 * @param num 
		 */
		static roundToFloat16Bits(num:number):number;

		/*
		 * convert a half float number bits to a number.
		 * @param float16bits - half float number bits
		 */
		static convertToNumber(float16bits:number):number;
	}

}

declare module laya.d3.math {

	/*
	 * <code>MathUtils</code> 类用于创建数学工具。
	 */
	class MathUtils3D  {

		/*
		 * 单精度浮点(float)零的容差
		 */
		static zeroTolerance:number;

		/*
		 * 浮点数默认最大值
		 */
		static MaxValue:number;

		/*
		 * 浮点数默认最小值
		 */
		static MinValue:number;

		/*
		 * 创建一个 <code>MathUtils</code> 实例。
		 */

		constructor();

		/*
		 * 是否在容差的范围内近似于0
		 * @param 判断值 
		 * @return 是否近似于0
		 */
		static isZero(v:number):boolean;

		/*
		 * 两个值是否在容差的范围内近似相等Sqr Magnitude
		 * @param 判断值 
		 * @return 是否近似于0
		 */
		static nearEqual(n1:number,n2:number):boolean;
		static fastInvSqrt(value:number):number;
	}

}

declare module laya.d3.math {

	/*
	 * <code>Matrix3x3</code> 类用于创建3x3矩阵。
	 */
	class Matrix3x3 implements laya.d3.core.IClone  {

		/*
		 * 默认矩阵,禁止修改
		 */
		static DEFAULT:Matrix3x3;

		/*
		 * 通过四元数创建旋转矩阵。
		 * @param rotation 旋转四元数。
		 * @param out 旋转矩阵。
		 */
		static createRotationQuaternion(rotation:laya.d3.math.Quaternion,out:Matrix3x3):void;

		/*
		 * 根据指定平移生成3x3矩阵
		 * @param tra 平移
		 * @param out 输出矩阵
		 */
		static createFromTranslation(trans:laya.d3.math.Vector2,out:Matrix3x3):void;

		/*
		 * 根据指定旋转生成3x3矩阵
		 * @param rad 旋转值
		 * @param out 输出矩阵
		 */
		static createFromRotation(rad:number,out:Matrix3x3):void;

		/*
		 * 根据制定缩放生成3x3矩阵
		 * @param scale 缩放值
		 * @param out 输出矩阵
		 */
		static createFromScaling(scale:laya.d3.math.Vector3,out:Matrix3x3):void;

		/*
		 * 从4x4矩阵转换为一个3x3的矩阵（原则为upper-left,忽略第四行四列）
		 * @param sou 4x4源矩阵
		 * @param out 3x3输出矩阵
		 */
		static createFromMatrix4x4(sou:laya.d3.math.Matrix4x4,out:Matrix3x3):void;

		/*
		 * 两个3x3矩阵的相乘
		 * @param left 左矩阵
		 * @param right 右矩阵
		 * @param out 输出矩阵
		 */
		static multiply(left:Matrix3x3,right:Matrix3x3,out:Matrix3x3):void;

		/*
		 * 矩阵元素数组
		 */
		elements:Float32Array;

		/*
		 * 创建一个 <code>Matrix3x3</code> 实例。
		 */

		constructor();

		/*
		 * 计算3x3矩阵的行列式
		 * @return 矩阵的行列式
		 */
		determinant():number;

		/*
		 * 通过一个二维向量转换3x3矩阵
		 * @param tra 转换向量
		 * @param out 输出矩阵
		 */
		translate(trans:laya.d3.math.Vector2,out:Matrix3x3):void;

		/*
		 * 根据指定角度旋转3x3矩阵
		 * @param rad 旋转角度
		 * @param out 输出矩阵
		 */
		rotate(rad:number,out:Matrix3x3):void;

		/*
		 * 根据制定缩放3x3矩阵
		 * @param scale 缩放值
		 * @param out 输出矩阵
		 */
		scale(scale:laya.d3.math.Vector2,out:Matrix3x3):void;

		/*
		 * 计算3x3矩阵的逆矩阵
		 * @param out 输出的逆矩阵
		 */
		invert(out:Matrix3x3):void;

		/*
		 * 计算3x3矩阵的转置矩阵
		 * @param out 输出矩阵
		 */
		transpose(out:Matrix3x3):void;

		/*
		 * 设置已有的矩阵为单位矩阵
		 */
		identity():void;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;

		/*
		 * 计算观察3x3矩阵
		 * @param eye 观察者位置
		 * @param target 目标位置
		 * @param up 上向量
		 * @param out 输出3x3矩阵
		 */
		static lookAt(eye:laya.d3.math.Vector3,target:laya.d3.math.Vector3,up:laya.d3.math.Vector3,out:Matrix3x3):void;
	}

}

declare module laya.d3.math {

	/*
	 * <code>Matrix4x4</code> 类用于创建4x4矩阵。
	 */
	class Matrix4x4 implements laya.d3.core.IClone  {

		/*
		 * 默认矩阵,禁止修改
		 */
		static DEFAULT:Matrix4x4;

		/*
		 * 默认矩阵,禁止修改
		 */
		static ZERO:Matrix4x4;

		/*
		 * 绕X轴旋转
		 * @param rad 旋转角度
		 * @param out 输出矩阵
		 */
		static createRotationX(rad:number,out:Matrix4x4):void;

		/*
		 * 绕Y轴旋转
		 * @param rad 旋转角度
		 * @param out 输出矩阵
		 */
		static createRotationY(rad:number,out:Matrix4x4):void;

		/*
		 * 绕Z轴旋转
		 * @param rad 旋转角度
		 * @param out 输出矩阵
		 */
		static createRotationZ(rad:number,out:Matrix4x4):void;

		/*
		 * 通过yaw pitch roll旋转创建旋转矩阵。
		 * @param yaw 
		 * @param pitch 
		 * @param roll 
		 * @param result 
		 */
		static createRotationYawPitchRoll(yaw:number,pitch:number,roll:number,result:Matrix4x4):void;

		/*
		 * 通过旋转轴axis和旋转角度angle计算旋转矩阵。
		 * @param axis 旋转轴,假定已经归一化。
		 * @param angle 旋转角度。
		 * @param result 结果矩阵。
		 */
		static createRotationAxis(axis:laya.d3.math.Vector3,angle:number,result:Matrix4x4):void;
		setRotation(rotation:laya.d3.math.Quaternion):void;
		setPosition(position:laya.d3.math.Vector3):void;

		/*
		 * 通过四元数创建旋转矩阵。
		 * @param rotation 旋转四元数。
		 * @param result 输出旋转矩阵
		 */
		static createRotationQuaternion(rotation:laya.d3.math.Quaternion,result:Matrix4x4):void;

		/*
		 * 根据平移计算输出矩阵
		 * @param trans 平移向量
		 * @param out 输出矩阵
		 */
		static createTranslate(trans:laya.d3.math.Vector3,out:Matrix4x4):void;

		/*
		 * 根据缩放计算输出矩阵
		 * @param scale 缩放值
		 * @param out 输出矩阵
		 */
		static createScaling(scale:laya.d3.math.Vector3,out:Matrix4x4):void;

		/*
		 * 计算两个矩阵的乘法
		 * @param left left矩阵
		 * @param right right矩阵
		 * @param out 输出矩阵
		 */
		static multiply(left:Matrix4x4,right:Matrix4x4,out:Matrix4x4):void;
		static multiplyForNative(left:Matrix4x4,right:Matrix4x4,out:Matrix4x4):void;

		/*
		 * 从四元数计算旋转矩阵
		 * @param rotation 四元数
		 * @param out 输出矩阵
		 */
		static createFromQuaternion(rotation:laya.d3.math.Quaternion,out:Matrix4x4):void;

		/*
		 * 计算仿射矩阵
		 * @param trans 平移
		 * @param rot 旋转
		 * @param scale 缩放
		 * @param out 输出矩阵
		 */
		static createAffineTransformation(trans:laya.d3.math.Vector3,rot:laya.d3.math.Quaternion,scale:laya.d3.math.Vector3,out:Matrix4x4):void;

		/*
		 * 计算观察矩阵
		 * @param eye 视点位置
		 * @param center 视点目标
		 * @param up 向上向量
		 * @param out 输出矩阵
		 */
		static createLookAt(eye:laya.d3.math.Vector3,target:laya.d3.math.Vector3,up:laya.d3.math.Vector3,out:Matrix4x4):void;

		/*
		 * 通过FOV创建透视投影矩阵。
		 * @param fov 视角。
		 * @param aspect 横纵比。
		 * @param near 近裁面。
		 * @param far 远裁面。
		 * @param out 输出矩阵。
		 */
		static createPerspective(fov:number,aspect:number,znear:number,zfar:number,out:Matrix4x4):void;

		/*
		 * 创建透视投影矩阵。
		 * @param left 视椎左边界。
		 * @param right 视椎右边界。
		 * @param bottom 视椎底边界。
		 * @param top 视椎顶边界。
		 * @param znear 视椎近边界。
		 * @param zfar 视椎远边界。
		 * @param out 输出矩阵。
		 */
		static createPerspectiveOffCenter(left:number,right:number,bottom:number,top:number,znear:number,zfar:number,out:Matrix4x4):void;

		/*
		 * 计算正交投影矩阵。
		 * @param left 视椎左边界。
		 * @param right 视椎右边界。
		 * @param bottom 视椎底边界。
		 * @param top 视椎顶边界。
		 * @param near 视椎近边界。
		 * @param far 视椎远边界。
		 * @param out 输出矩阵。
		 */
		static createOrthoOffCenter(left:number,right:number,bottom:number,top:number,znear:number,zfar:number,out:Matrix4x4):void;

		/*
		 * 矩阵元素数组
		 */
		elements:Float32Array;

		/*
		 * 创建一个 <code>Matrix4x4</code> 实例。
		 * @param  4x4矩阵的各元素
		 */

		constructor(m11?:number,m12?:number,m13?:number,m14?:number,m21?:number,m22?:number,m23?:number,m24?:number,m31?:number,m32?:number,m33?:number,m34?:number,m41?:number,m42?:number,m43?:number,m44?:number,elements?:Float32Array);
		getElementByRowColumn(row:number,column:number):number;
		setElementByRowColumn(row:number,column:number,value:number):void;

		/*
		 * 判断两个4x4矩阵的值是否相等。
		 * @param other 4x4矩阵
		 */
		equalsOtherMatrix(other:Matrix4x4):boolean;

		/*
		 * 分解矩阵为平移向量、旋转四元数、缩放向量。
		 * @param translation 平移向量。
		 * @param rotation 旋转四元数。
		 * @param scale 缩放向量。
		 * @return 是否分解成功。
		 */
		decomposeTransRotScale(translation:laya.d3.math.Vector3,rotation:laya.d3.math.Quaternion,scale:laya.d3.math.Vector3):boolean;

		/*
		 * 分解矩阵为平移向量、旋转矩阵、缩放向量。
		 * @param translation 平移向量。
		 * @param rotationMatrix 旋转矩阵。
		 * @param scale 缩放向量。
		 * @return 是否分解成功。
		 */
		decomposeTransRotMatScale(translation:laya.d3.math.Vector3,rotationMatrix:Matrix4x4,scale:laya.d3.math.Vector3):boolean;

		/*
		 * 分解旋转矩阵的旋转为YawPitchRoll欧拉角。
		 * @param out float yaw
		 * @param out float pitch
		 * @param out float roll
		 * @return 
		 */
		decomposeYawPitchRoll(yawPitchRoll:laya.d3.math.Vector3):void;

		/*
		 * 归一化矩阵
		 */
		normalize():void;

		/*
		 * 计算矩阵的转置矩阵
		 */
		transpose():Matrix4x4;

		/*
		 * 计算一个矩阵的逆矩阵
		 * @param out 输出矩阵
		 */
		invert(out:Matrix4x4):void;

		/*
		 * 计算BlillBoard矩阵
		 * @param objectPosition 物体位置
		 * @param cameraPosition 相机位置
		 * @param cameraUp 相机上向量
		 * @param cameraForward 相机前向量
		 * @param mat 变换矩阵
		 */
		static billboard(objectPosition:laya.d3.math.Vector3,cameraPosition:laya.d3.math.Vector3,cameraRight:laya.d3.math.Vector3,cameraUp:laya.d3.math.Vector3,cameraForward:laya.d3.math.Vector3,mat:Matrix4x4):void;

		/*
		 * 设置矩阵为单位矩阵
		 */
		identity():void;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
		static translation(v3:laya.d3.math.Vector3,out:Matrix4x4):void;

		/*
		 * 获取平移向量。
		 * @param out 平移向量。
		 */
		getTranslationVector(out:laya.d3.math.Vector3):void;

		/*
		 * 设置平移向量。
		 * @param translate 平移向量。
		 */
		setTranslationVector(translate:laya.d3.math.Vector3):void;

		/*
		 * 获取前向量。
		 * @param out 前向量。
		 */
		getForward(out:laya.d3.math.Vector3):void;

		/*
		 * 设置前向量。
		 * @param forward 前向量。
		 */
		setForward(forward:laya.d3.math.Vector3):void;
	}

}

declare module laya.d3.math.Native {

	/*
	 * <code>Quaternion</code> 类用于创建四元数。
	 */
	class ConchQuaternion implements laya.d3.core.IClone  {

		/*
		 * 默认矩阵,禁止修改
		 */
		static DEFAULT:ConchQuaternion;

		/*
		 * 无效矩阵,禁止修改
		 */
		static NAN:ConchQuaternion;

		/*
		 * 从欧拉角生成四元数（顺序为Yaw、Pitch、Roll）
		 * @param yaw yaw值
		 * @param pitch pitch值
		 * @param roll roll值
		 * @param out 输出四元数
		 */
		static createFromYawPitchRoll(yaw:number,pitch:number,roll:number,out:ConchQuaternion):void;

		/*
		 * 计算两个四元数相乘
		 * @param left left四元数
		 * @param right right四元数
		 * @param out 输出四元数
		 */
		static multiply(left:ConchQuaternion,right:ConchQuaternion,out:ConchQuaternion):void;
		private static arcTanAngle:any;
		private static angleTo:any;

		/*
		 * 从指定的轴和角度计算四元数
		 * @param axis 轴
		 * @param rad 角度
		 * @param out 输出四元数
		 */
		static createFromAxisAngle(axis:laya.d3.math.Native.ConchVector3,rad:number,out:ConchQuaternion):void;

		/*
		 * 根据3x3矩阵计算四元数
		 * @param sou 源矩阵
		 * @param out 输出四元数
		 */
		static createFromMatrix3x3(sou:laya.d3.math.Matrix3x3,out:ConchQuaternion):void;

		/*
		 * 从旋转矩阵计算四元数
		 * @param mat 旋转矩阵
		 * @param out 输出四元数
		 */
		static createFromMatrix4x4(mat:laya.d3.math.Matrix4x4,out:ConchQuaternion):void;

		/*
		 * 球面插值
		 * @param left left四元数
		 * @param right right四元数
		 * @param a 插值比例
		 * @param out 输出四元数
		 * @return 输出Float32Array
		 */
		static slerp(left:ConchQuaternion,right:ConchQuaternion,t:number,out:ConchQuaternion):Float32Array;

		/*
		 * 计算两个四元数的线性插值
		 * @param left left四元数
		 * @param right right四元数b
		 * @param t 插值比例
		 * @param out 输出四元数
		 */
		static lerp(left:ConchQuaternion,right:ConchQuaternion,amount:number,out:ConchQuaternion):void;

		/*
		 * 计算两个四元数的和
		 * @param left left四元数
		 * @param right right 四元数
		 * @param out 输出四元数
		 */
		static add(left:any,right:ConchQuaternion,out:ConchQuaternion):void;

		/*
		 * 计算两个四元数的点积
		 * @param left left四元数
		 * @param right right四元数
		 * @return 点积
		 */
		static dot(left:any,right:ConchQuaternion):number;

		/*
		 * 四元数元素数组
		 */
		elements:Float32Array;

		/*
		 * 获取四元数的x值
		 */

		/*
		 * 设置四元数的x值
		 */
		x:number;

		/*
		 * 获取四元数的y值
		 */

		/*
		 * 设置四元数的y值
		 */
		y:number;

		/*
		 * 获取四元数的z值
		 */

		/*
		 * 设置四元数的z值
		 */
		z:number;

		/*
		 * 获取四元数的w值
		 */

		/*
		 * 设置四元数的w值
		 */
		w:number;

		/*
		 * 创建一个 <code>Quaternion</code> 实例。
		 * @param x 四元数的x值
		 * @param y 四元数的y值
		 * @param z 四元数的z值
		 * @param w 四元数的w值
		 */

		constructor(x?:number,y?:number,z?:number,w?:number,nativeElements?:Float32Array);

		/*
		 * 根据缩放值缩放四元数
		 * @param scale 缩放值
		 * @param out 输出四元数
		 */
		scaling(scaling:number,out:ConchQuaternion):void;

		/*
		 * 归一化四元数
		 * @param out 输出四元数
		 */
		normalize(out:ConchQuaternion):void;

		/*
		 * 计算四元数的长度
		 * @return 长度
		 */
		length():number;

		/*
		 * 根据绕X轴的角度旋转四元数
		 * @param rad 角度
		 * @param out 输出四元数
		 */
		rotateX(rad:number,out:ConchQuaternion):void;

		/*
		 * 根据绕Y轴的制定角度旋转四元数
		 * @param rad 角度
		 * @param out 输出四元数
		 */
		rotateY(rad:number,out:ConchQuaternion):void;

		/*
		 * 根据绕Z轴的制定角度旋转四元数
		 * @param rad 角度
		 * @param out 输出四元数
		 */
		rotateZ(rad:number,out:ConchQuaternion):void;

		/*
		 * 分解四元数到欧拉角（顺序为Yaw、Pitch、Roll），参考自http://xboxforums.create.msdn.com/forums/p/4574/23988.aspx#23988,问题绕X轴翻转超过±90度时有，会产生瞬间反转
		 * @param quaternion 源四元数
		 * @param out 欧拉角值
		 */
		getYawPitchRoll(out:laya.d3.math.Native.ConchVector3):void;

		/*
		 * 求四元数的逆
		 * @param out 输出四元数
		 */
		invert(out:ConchQuaternion):void;

		/*
		 * 设置四元数为单位算数
		 * @param out 输出四元数
		 */
		identity():void;

		/*
		 * 从Array数组拷贝值。
		 * @param array 数组。
		 * @param offset 数组偏移。
		 */
		fromArray(array:any[],offset?:number):void;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
		equals(b:ConchQuaternion):boolean;

		/*
		 * 计算旋转观察四元数
		 * @param forward 方向
		 * @param up 上向量
		 * @param out 输出四元数
		 */
		static rotationLookAt(forward:laya.d3.math.Native.ConchVector3,up:laya.d3.math.Native.ConchVector3,out:ConchQuaternion):void;

		/*
		 * 计算观察四元数
		 * @param eye 观察者位置
		 * @param target 目标位置
		 * @param up 上向量
		 * @param out 输出四元数
		 */
		static lookAt(eye:any,target:any,up:any,out:ConchQuaternion):void;

		/*
		 * 计算长度的平方。
		 * @return 长度的平方。
		 */
		lengthSquared():number;

		/*
		 * 计算四元数的逆四元数。
		 * @param value 四元数。
		 * @param out 逆四元数。
		 */
		static invert(value:ConchQuaternion,out:ConchQuaternion):void;

		/*
		 * 通过一个3x3矩阵创建一个四元数
		 * @param matrix3x3 3x3矩阵
		 * @param out 四元数
		 */
		static rotationMatrix(matrix3x3:laya.d3.math.Matrix3x3,out:ConchQuaternion):void;
	}

}

declare module laya.d3.math.Native {

	/*
	 * <code>Vector3</code> 类用于创建三维向量。
	 */
	class ConchVector3 implements laya.d3.core.IClone  {

		/*
		 * 零向量，禁止修改
		 */
		static ZERO:ConchVector3;

		/*
		 * 一向量，禁止修改
		 */
		static ONE:ConchVector3;

		/*
		 * X轴单位向量，禁止修改
		 */
		static NegativeUnitX:ConchVector3;

		/*
		 * X轴单位向量，禁止修改
		 */
		static UnitX:ConchVector3;

		/*
		 * Y轴单位向量，禁止修改
		 */
		static UnitY:ConchVector3;

		/*
		 * Z轴单位向量，禁止修改
		 */
		static UnitZ:ConchVector3;

		/*
		 * 右手坐标系统前向量，禁止修改
		 */
		static ForwardRH:ConchVector3;

		/*
		 * 左手坐标系统前向量,禁止修改
		 */
		static ForwardLH:ConchVector3;

		/*
		 * 上向量,禁止修改
		 */
		static Up:ConchVector3;

		/*
		 * 无效矩阵,禁止修改
		 */
		static NAN:ConchVector3;

		/*
		 * [只读]向量元素集合。
		 */
		elements:Float32Array;

		/*
		 * 两个三维向量距离的平方。
		 * @param value1 向量1。
		 * @param value2 向量2。
		 * @return 距离的平方。
		 */
		static distanceSquared(value1:ConchVector3,value2:ConchVector3):number;

		/*
		 * 两个三维向量距离。
		 * @param value1 向量1。
		 * @param value2 向量2。
		 * @return 距离。
		 */
		static distance(value1:ConchVector3,value2:ConchVector3):number;

		/*
		 * 分别取两个三维向量x、y、z的最小值计算新的三维向量。
		 * @param a 。
		 * @param b 。
		 * @param out 。
		 */
		static min(a:ConchVector3,b:ConchVector3,out:ConchVector3):void;

		/*
		 * 分别取两个三维向量x、y、z的最大值计算新的三维向量。
		 * @param a a三维向量。
		 * @param b b三维向量。
		 * @param out 结果三维向量。
		 */
		static max(a:ConchVector3,b:ConchVector3,out:ConchVector3):void;

		/*
		 * 根据四元数旋转三维向量。
		 * @param source 源三维向量。
		 * @param rotation 旋转四元数。
		 * @param out 输出三维向量。
		 */
		static transformQuat(source:ConchVector3,rotation:laya.d3.math.Native.ConchQuaternion,out:ConchVector3):void;

		/*
		 * 计算标量长度。
		 * @param a 源三维向量。
		 * @return 标量长度。
		 */
		static scalarLength(a:ConchVector3):number;

		/*
		 * 计算标量长度的平方。
		 * @param a 源三维向量。
		 * @return 标量长度的平方。
		 */
		static scalarLengthSquared(a:ConchVector3):number;

		/*
		 * 归一化三维向量。
		 * @param s 源三维向量。
		 * @param out 输出三维向量。
		 */
		static normalize(s:ConchVector3,out:ConchVector3):void;

		/*
		 * 计算两个三维向量的乘积。
		 * @param a left三维向量。
		 * @param b right三维向量。
		 * @param out 输出三维向量。
		 */
		static multiply(a:ConchVector3,b:ConchVector3,out:ConchVector3):void;

		/*
		 * 缩放三维向量。
		 * @param a 源三维向量。
		 * @param b 缩放值。
		 * @param out 输出三维向量。
		 */
		static scale(a:ConchVector3,b:number,out:ConchVector3):void;

		/*
		 * 插值三维向量。
		 * @param a left向量。
		 * @param b right向量。
		 * @param t 插值比例。
		 * @param out 输出向量。
		 */
		static lerp(a:ConchVector3,b:ConchVector3,t:number,out:ConchVector3):void;

		/*
		 * 通过矩阵转换一个三维向量到另外一个三维向量。
		 * @param vector 源三维向量。
		 * @param transform 变换矩阵。
		 * @param result 输出三维向量。
		 */
		static transformV3ToV3(vector:ConchVector3,transform:any,result:ConchVector3):void;

		/*
		 * 通过矩阵转换一个三维向量到另外一个四维向量。
		 * @param vector 源三维向量。
		 * @param transform 变换矩阵。
		 * @param result 输出四维向量。
		 */
		static transformV3ToV4(vector:ConchVector3,transform:any,result:laya.d3.math.Native.ConchVector4):void;

		/*
		 * 通过法线矩阵转换一个法线三维向量到另外一个三维向量。
		 * @param normal 源法线三维向量。
		 * @param transform 法线变换矩阵。
		 * @param result 输出法线三维向量。
		 */
		static TransformNormal(normal:ConchVector3,transform:any,result:ConchVector3):void;

		/*
		 * 通过矩阵转换一个三维向量到另外一个归一化的三维向量。
		 * @param vector 源三维向量。
		 * @param transform 变换矩阵。
		 * @param result 输出三维向量。
		 */
		static transformCoordinate(coordinate:ConchVector3,transform:any,result:ConchVector3):void;

		/*
		 * 求一个指定范围的向量
		 * @param value clamp向量
		 * @param min 最小
		 * @param max 最大
		 * @param out 输出向量
		 */
		static Clamp(value:ConchVector3,min:ConchVector3,max:ConchVector3,out:ConchVector3):void;

		/*
		 * 求两个三维向量的和。
		 * @param a left三维向量。
		 * @param b right三维向量。
		 * @param out 输出向量。
		 */
		static add(a:ConchVector3,b:ConchVector3,out:ConchVector3):void;

		/*
		 * 求两个三维向量的差。
		 * @param a left三维向量。
		 * @param b right三维向量。
		 * @param o out 输出向量。
		 */
		static subtract(a:ConchVector3,b:ConchVector3,o:ConchVector3):void;

		/*
		 * 求两个三维向量的叉乘。
		 * @param a left向量。
		 * @param b right向量。
		 * @param o 输出向量。
		 */
		static cross(a:ConchVector3,b:ConchVector3,o:ConchVector3):void;

		/*
		 * 求两个三维向量的点积。
		 * @param a left向量。
		 * @param b right向量。
		 * @return 点积。
		 */
		static dot(a:ConchVector3,b:ConchVector3):number;

		/*
		 * 判断两个三维向量是否相等。
		 * @param a 三维向量。
		 * @param b 三维向量。
		 * @return 是否相等。
		 */
		static equals(a:ConchVector3,b:ConchVector3):boolean;

		/*
		 * 获取X轴坐标。
		 * @return X轴坐标。
		 */

		/*
		 * 设置X轴坐标。
		 * @param value X轴坐标。
		 */
		x:number;

		/*
		 * 获取Y轴坐标。
		 * @return Y轴坐标。
		 */

		/*
		 * 设置Y轴坐标。
		 * @param value Y轴坐标。
		 */
		y:number;

		/*
		 * 获取Z轴坐标。
		 * @return Z轴坐标。
		 */

		/*
		 * 设置Z轴坐标。
		 * @param value Z轴坐标。
		 */
		z:number;

		/*
		 * 创建一个 <code>Vector3</code> 实例。
		 * @param x X轴坐标。
		 * @param y Y轴坐标。
		 * @param z Z轴坐标。
		 */

		constructor(x?:number,y?:number,z?:number,nativeElements?:Float32Array);

		/*
		 * 设置xyz值。
		 * @param x X值。
		 * @param y Y值。
		 * @param z Z值。
		 */
		setValue(x:number,y:number,z:number):void;

		/*
		 * 从Array数组拷贝值。
		 * @param array 数组。
		 * @param offset 数组偏移。
		 */
		fromArray(array:any[],offset?:number):void;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
		toDefault():void;
	}

}

declare module laya.d3.math.Native {

	/*
	 * <code>Vector4</code> 类用于创建四维向量。
	 */
	class ConchVector4 implements laya.d3.core.IClone  {

		/*
		 * 零向量，禁止修改
		 */
		static ZERO:ConchVector4;
		static ONE:ConchVector4;
		static UnitX:ConchVector4;
		static UnitY:ConchVector4;
		static UnitZ:ConchVector4;
		static UnitW:ConchVector4;

		/*
		 * [只读]向量元素集合。
		 */
		elements:Float32Array;

		/*
		 * 获取X轴坐标。
		 * @return X轴坐标。
		 */

		/*
		 * 设置X轴坐标。
		 * @param value X轴坐标。
		 */
		x:number;

		/*
		 * 获取Y轴坐标。
		 * @return Y轴坐标。
		 */

		/*
		 * 设置Y轴坐标。
		 * @param value Y轴坐标。
		 */
		y:number;

		/*
		 * 获取Z轴坐标。
		 * @return Z轴坐标。
		 */

		/*
		 * 设置Z轴坐标。
		 * @param value Z轴坐标。
		 */
		z:number;

		/*
		 * 获取W轴坐标。
		 * @return W轴坐标。
		 */

		/*
		 * 设置W轴坐标。
		 * @param value W轴坐标。
		 */
		w:number;

		/*
		 * 创建一个 <code>Vector4</code> 实例。
		 * @param x X轴坐标。
		 * @param y Y轴坐标。
		 * @param z Z轴坐标。
		 * @param w W轴坐标。
		 */

		constructor(x?:number,y?:number,z?:number,w?:number);

		/*
		 * 从Array数组拷贝值。
		 * @param array 数组。
		 * @param offset 数组偏移。
		 */
		fromArray(array:any[],offset?:number):void;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;

		/*
		 * 插值四维向量。
		 * @param a left向量。
		 * @param b right向量。
		 * @param t 插值比例。
		 * @param out 输出向量。
		 */
		static lerp(a:ConchVector4,b:ConchVector4,t:number,out:ConchVector4):void;

		/*
		 * 通过4x4矩阵把一个四维向量转换为另一个四维向量
		 * @param vector4 带转换四维向量。
		 * @param M4x4 4x4矩阵。
		 * @param out 转换后四维向量。
		 */
		static transformByM4x4(vector4:ConchVector4,m4x4:any,out:ConchVector4):void;

		/*
		 * 判断两个四维向量是否相等。
		 * @param a 四维向量。
		 * @param b 四维向量。
		 * @return 是否相等。
		 */
		static equals(a:ConchVector4,b:ConchVector4):boolean;

		/*
		 * 求四维向量的长度。
		 * @return 长度。
		 */
		length():number;

		/*
		 * 求四维向量长度的平方。
		 * @return 长度的平方。
		 */
		lengthSquared():number;

		/*
		 * 归一化四维向量。
		 * @param s 源四维向量。
		 * @param out 输出四维向量。
		 */
		static normalize(s:ConchVector4,out:ConchVector4):void;

		/*
		 * 求两个四维向量的和。
		 * @param a 四维向量。
		 * @param b 四维向量。
		 * @param out 输出向量。
		 */
		static add(a:ConchVector4,b:ConchVector4,out:ConchVector4):void;

		/*
		 * 求两个四维向量的差。
		 * @param a 四维向量。
		 * @param b 四维向量。
		 * @param out 输出向量。
		 */
		static subtract(a:ConchVector4,b:ConchVector4,out:ConchVector4):void;

		/*
		 * 计算两个四维向量的乘积。
		 * @param a 四维向量。
		 * @param b 四维向量。
		 * @param out 输出向量。
		 */
		static multiply(a:ConchVector4,b:ConchVector4,out:ConchVector4):void;

		/*
		 * 缩放四维向量。
		 * @param a 源四维向量。
		 * @param b 缩放值。
		 * @param out 输出四维向量。
		 */
		static scale(a:ConchVector4,b:number,out:ConchVector4):void;

		/*
		 * 求一个指定范围的四维向量
		 * @param value clamp向量
		 * @param min 最小
		 * @param max 最大
		 * @param out 输出向量
		 */
		static Clamp(value:ConchVector4,min:ConchVector4,max:ConchVector4,out:ConchVector4):void;

		/*
		 * 两个四维向量距离的平方。
		 * @param value1 向量1。
		 * @param value2 向量2。
		 * @return 距离的平方。
		 */
		static distanceSquared(value1:ConchVector4,value2:ConchVector4):number;

		/*
		 * 两个四维向量距离。
		 * @param value1 向量1。
		 * @param value2 向量2。
		 * @return 距离。
		 */
		static distance(value1:ConchVector4,value2:ConchVector4):number;

		/*
		 * 求两个四维向量的点积。
		 * @param a 向量。
		 * @param b 向量。
		 * @return 点积。
		 */
		static dot(a:ConchVector4,b:ConchVector4):number;

		/*
		 * 分别取两个四维向量x、y、z的最小值计算新的四维向量。
		 * @param a 四维向量。
		 * @param b 四维向量。
		 * @param out 结果三维向量。
		 */
		static min(a:ConchVector4,b:ConchVector4,out:ConchVector4):void;

		/*
		 * 分别取两个四维向量x、y、z的最大值计算新的四维向量。
		 * @param a 四维向量。
		 * @param b 四维向量。
		 * @param out 结果三维向量。
		 */
		static max(a:ConchVector4,b:ConchVector4,out:ConchVector4):void;
	}

}

declare module laya.d3.math {

	/*
	 * <code>Plane</code> 类用于创建平面。
	 */
	class Plane  {

		/*
		 * 平面的向量
		 */
		normal:laya.d3.math.Vector3;

		/*
		 * 平面到坐标系原点的距离
		 */
		distance:number;

		/*
		 * 平面与其他几何体相交类型
		 */
		static PlaneIntersectionType_Back:number;
		static PlaneIntersectionType_Front:number;
		static PlaneIntersectionType_Intersecting:number;

		/*
		 * 创建一个 <code>Plane</code> 实例。
		 * @param normal 平面的向量
		 * @param d 平面到原点的距离
		 */

		constructor(normal:laya.d3.math.Vector3,d?:number);

		/*
		 * 创建一个 <code>Plane</code> 实例。
		 * @param point1 第一点
		 * @param point2 第二点
		 * @param point3 第三点
		 */
		static createPlaneBy3P(point1:laya.d3.math.Vector3,point2:laya.d3.math.Vector3,point3:laya.d3.math.Vector3):Plane;

		/*
		 * 更改平面法线向量的系数，使之成单位长度。
		 */
		normalize():void;
	}

}

declare module laya.d3.math {

	/*
	 * <code>Quaternion</code> 类用于创建四元数。
	 */
	class Quaternion implements laya.d3.core.IClone  {

		/*
		 * 默认矩阵,禁止修改
		 */
		static DEFAULT:Quaternion;

		/*
		 * 无效矩阵,禁止修改
		 */
		static NAN:Quaternion;

		/*
		 * 从欧拉角生成四元数（顺序为Yaw、Pitch、Roll）
		 * @param yaw yaw值
		 * @param pitch pitch值
		 * @param roll roll值
		 * @param out 输出四元数
		 */
		static createFromYawPitchRoll(yaw:number,pitch:number,roll:number,out:Quaternion):void;

		/*
		 * 计算两个四元数相乘
		 * @param left left四元数
		 * @param right right四元数
		 * @param out 输出四元数
		 */
		static multiply(left:Quaternion,right:Quaternion,out:Quaternion):void;
		private static arcTanAngle:any;
		private static angleTo:any;

		/*
		 * 从指定的轴和角度计算四元数
		 * @param axis 轴
		 * @param rad 角度
		 * @param out 输出四元数
		 */
		static createFromAxisAngle(axis:laya.d3.math.Vector3,rad:number,out:Quaternion):void;

		/*
		 * 从旋转矩阵计算四元数
		 * @param mat 旋转矩阵
		 * @param out 输出四元数
		 */
		static createFromMatrix4x4(mat:laya.d3.math.Matrix4x4,out:Quaternion):void;

		/*
		 * 球面插值
		 * @param left left四元数
		 * @param right right四元数
		 * @param a 插值比例
		 * @param out 输出四元数
		 * @return 输出Float32Array
		 */
		static slerp(left:Quaternion,right:Quaternion,t:number,out:Quaternion):Quaternion;

		/*
		 * 计算两个四元数的线性插值
		 * @param left left四元数
		 * @param right right四元数b
		 * @param t 插值比例
		 * @param out 输出四元数
		 */
		static lerp(left:Quaternion,right:Quaternion,amount:number,out:Quaternion):void;

		/*
		 * 计算两个四元数的和
		 * @param left left四元数
		 * @param right right 四元数
		 * @param out 输出四元数
		 */
		static add(left:Quaternion,right:Quaternion,out:Quaternion):void;

		/*
		 * 计算两个四元数的点积
		 * @param left left四元数
		 * @param right right四元数
		 * @return 点积
		 */
		static dot(left:Quaternion,right:Quaternion):number;

		/*
		 * X轴坐标
		 */
		x:number;

		/*
		 * Y轴坐标
		 */
		y:number;

		/*
		 * Z轴坐标
		 */
		z:number;

		/*
		 * W轴坐标
		 */
		w:number;

		/*
		 * 创建一个 <code>Quaternion</code> 实例。
		 * @param x 四元数的x值
		 * @param y 四元数的y值
		 * @param z 四元数的z值
		 * @param w 四元数的w值
		 */

		constructor(x?:number,y?:number,z?:number,w?:number,nativeElements?:Float32Array);

		/*
		 * 根据缩放值缩放四元数
		 * @param scale 缩放值
		 * @param out 输出四元数
		 */
		scaling(scaling:number,out:Quaternion):void;

		/*
		 * 归一化四元数
		 * @param out 输出四元数
		 */
		normalize(out:Quaternion):void;

		/*
		 * 计算四元数的长度
		 * @return 长度
		 */
		length():number;

		/*
		 * 根据绕X轴的角度旋转四元数
		 * @param rad 角度
		 * @param out 输出四元数
		 */
		rotateX(rad:number,out:Quaternion):void;

		/*
		 * 根据绕Y轴的制定角度旋转四元数
		 * @param rad 角度
		 * @param out 输出四元数
		 */
		rotateY(rad:number,out:Quaternion):void;

		/*
		 * 根据绕Z轴的制定角度旋转四元数
		 * @param rad 角度
		 * @param out 输出四元数
		 */
		rotateZ(rad:number,out:Quaternion):void;

		/*
		 * 分解四元数到欧拉角（顺序为Yaw、Pitch、Roll），参考自http://xboxforums.create.msdn.com/forums/p/4574/23988.aspx#23988,问题绕X轴翻转超过±90度时有，会产生瞬间反转
		 * @param quaternion 源四元数
		 * @param out 欧拉角值
		 */
		getYawPitchRoll(out:laya.d3.math.Vector3):void;

		/*
		 * 求四元数的逆
		 * @param out 输出四元数
		 */
		invert(out:Quaternion):void;

		/*
		 * 设置四元数为单位算数
		 * @param out 输出四元数
		 */
		identity():void;

		/*
		 * 从Array数组拷贝值。
		 * @param array 数组。
		 * @param offset 数组偏移。
		 */
		fromArray(array:any[],offset?:number):void;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
		equals(b:Quaternion):boolean;

		/*
		 * 计算旋转观察四元数
		 * @param forward 方向
		 * @param up 上向量
		 * @param out 输出四元数
		 */
		static rotationLookAt(forward:laya.d3.math.Vector3,up:laya.d3.math.Vector3,out:Quaternion):void;

		/*
		 * 计算观察四元数
		 * @param eye 观察者位置
		 * @param target 目标位置
		 * @param up 上向量
		 * @param out 输出四元数
		 */
		static lookAt(eye:laya.d3.math.Vector3,target:laya.d3.math.Vector3,up:laya.d3.math.Vector3,out:Quaternion):void;

		/*
		 * 计算长度的平方。
		 * @return 长度的平方。
		 */
		lengthSquared():number;

		/*
		 * 计算四元数的逆四元数。
		 * @param value 四元数。
		 * @param out 逆四元数。
		 */
		static invert(value:Quaternion,out:Quaternion):void;

		/*
		 * 通过一个3x3矩阵创建一个四元数
		 * @param matrix3x3 3x3矩阵
		 * @param out 四元数
		 */
		static rotationMatrix(matrix3x3:laya.d3.math.Matrix3x3,out:Quaternion):void;
		forNativeElement(nativeElements?:Float32Array):void;
	}

}

declare module laya.d3.math {

	/*
	 * <code>Rand</code> 类用于通过32位无符号整型随机种子创建随机数。
	 */
	class Rand  {

		/*
		 * 通过无符号32位整形，获取32位浮点随机数。
		 * @param 无符号32位整形随机数 。
		 * @return 32位浮点随机数。
		 */
		static getFloatFromInt(v:number):number;

		/*
		 * 通过无符号32位整形，获取无符号8位字节随机数。
		 * @param 无符号32位整形随机数 。
		 * @return 无符号8位字节随机数。
		 */
		static getByteFromInt(v:number):number;

		/*
		 * 获取随机种子。
		 */
		seeds:Uint32Array;

		/*
		 * 获取随机种子。
		 * @return 随机种子。
		 */

		/*
		 * 设置随机种子。
		 * @param seed 随机种子。
		 */
		seed:number;

		/*
		 * 创建一个 <code>Rand</code> 实例。
		 * @param seed 32位无符号整型随机种子。
		 */

		constructor(seed:number);

		/*
		 * 获取无符号32位整形随机数。
		 * @return 无符号32位整形随机数。
		 */
		getUint():number;

		/*
		 * 获取0到1之间的浮点随机数。
		 * @return 0到1之间的浮点随机数。
		 */
		getFloat():number;

		/*
		 * 获取-1到1之间的浮点随机数。
		 * @return -1到1之间的浮点随机数。
		 */
		getSignedFloat():number;
	}

}

declare module laya.d3.math {

	/*
	 * <code>Rand</code> 类用于通过128位整型种子创建随机数,算法来自:https://github.com/AndreasMadsen/xorshift。
	 */
	class RandX  {

		/*
		 * 基于时间种子的随机数。
		 */
		static defaultRand:RandX;

		/*
		 * 创建一个 <code>Rand</code> 实例。
		 * @param seed 随机种子。
		 */

		constructor(seed:any[]);

		/*
		 * 通过2x32位的数组，返回64位的随机数。
		 * @return 64位的随机数。
		 */
		randomint():any[];

		/*
		 * 返回[0,1)之间的随机数。
		 * @return 
		 */
		random():number;
	}

}

declare module laya.d3.math {

	/*
	 * <code>Ray</code> 类用于创建射线。
	 */
	class Ray  {

		/*
		 * 原点
		 */
		origin:laya.d3.math.Vector3;

		/*
		 * 方向
		 */
		direction:laya.d3.math.Vector3;

		/*
		 * 创建一个 <code>Ray</code> 实例。
		 * @param origin 射线的起点
		 * @param direction 射线的方向
		 */

		constructor(origin:laya.d3.math.Vector3,direction:laya.d3.math.Vector3);
	}

}

declare module laya.d3.math {

	/*
	 * <code>Vector2</code> 类用于创建二维向量。
	 */
	class Vector2 implements laya.d3.core.IClone  {

		/*
		 * 零向量,禁止修改
		 */
		static ZERO:Vector2;

		/*
		 * 一向量,禁止修改
		 */
		static ONE:Vector2;

		/*
		 * X轴坐标
		 */
		x:number;

		/*
		 * Y轴坐标
		 */
		y:number;

		/*
		 * 创建一个 <code>Vector2</code> 实例。
		 * @param x X轴坐标。
		 * @param y Y轴坐标。
		 */

		constructor(x?:number,y?:number);

		/*
		 * 设置xy值。
		 * @param x X值。
		 * @param y Y值。
		 */
		setValue(x:number,y:number):void;

		/*
		 * 缩放二维向量。
		 * @param a 源二维向量。
		 * @param b 缩放值。
		 * @param out 输出二维向量。
		 */
		static scale(a:Vector2,b:number,out:Vector2):void;

		/*
		 * 从Array数组拷贝值。
		 * @param array 数组。
		 * @param offset 数组偏移。
		 */
		fromArray(array:any[],offset?:number):void;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 求两个二维向量的点积。
		 * @param a left向量。
		 * @param b right向量。
		 * @return 点积。
		 */
		static dot(a:Vector2,b:Vector2):number;

		/*
		 * 归一化二维向量。
		 * @param s 源三维向量。
		 * @param out 输出三维向量。
		 */
		static normalize(s:Vector2,out:Vector2):void;

		/*
		 * 计算标量长度。
		 * @param a 源三维向量。
		 * @return 标量长度。
		 */
		static scalarLength(a:Vector2):number;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
		forNativeElement(nativeElements?:Float32Array):void;
		static rewriteNumProperty(proto:any,name:string,index:number):void;
	}

}

declare module laya.d3.math {

	/*
	 * <code>Vector3</code> 类用于创建三维向量。
	 */
	class Vector3 implements laya.d3.core.IClone  {

		/*
		 * 两个三维向量距离的平方。
		 * @param value1 向量1。
		 * @param value2 向量2。
		 * @return 距离的平方。
		 */
		static distanceSquared(value1:Vector3,value2:Vector3):number;

		/*
		 * 两个三维向量距离。
		 * @param value1 向量1。
		 * @param value2 向量2。
		 * @return 距离。
		 */
		static distance(value1:Vector3,value2:Vector3):number;

		/*
		 * 分别取两个三维向量x、y、z的最小值计算新的三维向量。
		 * @param a 。
		 * @param b 。
		 * @param out 。
		 */
		static min(a:Vector3,b:Vector3,out:Vector3):void;

		/*
		 * 分别取两个三维向量x、y、z的最大值计算新的三维向量。
		 * @param a a三维向量。
		 * @param b b三维向量。
		 * @param out 结果三维向量。
		 */
		static max(a:Vector3,b:Vector3,out:Vector3):void;

		/*
		 * 根据四元数旋转三维向量。
		 * @param source 源三维向量。
		 * @param rotation 旋转四元数。
		 * @param out 输出三维向量。
		 */
		static transformQuat(source:Vector3,rotation:laya.d3.math.Quaternion,out:Vector3):void;

		/*
		 * 计算标量长度。
		 * @param a 源三维向量。
		 * @return 标量长度。
		 */
		static scalarLength(a:Vector3):number;

		/*
		 * 计算标量长度的平方。
		 * @param a 源三维向量。
		 * @return 标量长度的平方。
		 */
		static scalarLengthSquared(a:Vector3):number;

		/*
		 * 归一化三维向量。
		 * @param s 源三维向量。
		 * @param out 输出三维向量。
		 */
		static normalize(s:Vector3,out:Vector3):void;

		/*
		 * 计算两个三维向量的乘积。
		 * @param a left三维向量。
		 * @param b right三维向量。
		 * @param out 输出三维向量。
		 */
		static multiply(a:Vector3,b:Vector3,out:Vector3):void;

		/*
		 * 缩放三维向量。
		 * @param a 源三维向量。
		 * @param b 缩放值。
		 * @param out 输出三维向量。
		 */
		static scale(a:Vector3,b:number,out:Vector3):void;

		/*
		 * 插值三维向量。
		 * @param a left向量。
		 * @param b right向量。
		 * @param t 插值比例。
		 * @param out 输出向量。
		 */
		static lerp(a:Vector3,b:Vector3,t:number,out:Vector3):void;

		/*
		 * 通过矩阵转换一个三维向量到另外一个三维向量。
		 * @param vector 源三维向量。
		 * @param transform 变换矩阵。
		 * @param result 输出三维向量。
		 */
		static transformV3ToV3(vector:Vector3,transform:laya.d3.math.Matrix4x4,result:Vector3):void;

		/*
		 * 通过矩阵转换一个三维向量到另外一个四维向量。
		 * @param vector 源三维向量。
		 * @param transform 变换矩阵。
		 * @param result 输出四维向量。
		 */
		static transformV3ToV4(vector:Vector3,transform:laya.d3.math.Matrix4x4,result:laya.d3.math.Vector4):void;

		/*
		 * 通过法线矩阵转换一个法线三维向量到另外一个三维向量。
		 * @param normal 源法线三维向量。
		 * @param transform 法线变换矩阵。
		 * @param result 输出法线三维向量。
		 */
		static TransformNormal(normal:Vector3,transform:laya.d3.math.Matrix4x4,result:Vector3):void;

		/*
		 * 通过矩阵转换一个三维向量到另外一个归一化的三维向量。
		 * @param vector 源三维向量。
		 * @param transform 变换矩阵。
		 * @param result 输出三维向量。
		 */
		static transformCoordinate(coordinate:Vector3,transform:laya.d3.math.Matrix4x4,result:Vector3):void;

		/*
		 * 求一个指定范围的向量
		 * @param value clamp向量
		 * @param min 最小
		 * @param max 最大
		 * @param out 输出向量
		 */
		static Clamp(value:Vector3,min:Vector3,max:Vector3,out:Vector3):void;

		/*
		 * 求两个三维向量的和。
		 * @param a left三维向量。
		 * @param b right三维向量。
		 * @param out 输出向量。
		 */
		static add(a:Vector3,b:Vector3,out:Vector3):void;

		/*
		 * 求两个三维向量的差。
		 * @param a left三维向量。
		 * @param b right三维向量。
		 * @param o out 输出向量。
		 */
		static subtract(a:Vector3,b:Vector3,o:Vector3):void;

		/*
		 * 求两个三维向量的叉乘。
		 * @param a left向量。
		 * @param b right向量。
		 * @param o 输出向量。
		 */
		static cross(a:Vector3,b:Vector3,o:Vector3):void;

		/*
		 * 求两个三维向量的点积。
		 * @param a left向量。
		 * @param b right向量。
		 * @return 点积。
		 */
		static dot(a:Vector3,b:Vector3):number;

		/*
		 * 判断两个三维向量是否相等。
		 * @param a 三维向量。
		 * @param b 三维向量。
		 * @return 是否相等。
		 */
		static equals(a:Vector3,b:Vector3):boolean;

		/*
		 * X轴坐标
		 */
		x:number;

		/*
		 * Y轴坐标
		 */
		y:number;

		/*
		 * Z轴坐标
		 */
		z:number;

		/*
		 * 创建一个 <code>Vector3</code> 实例。
		 * @param x X轴坐标。
		 * @param y Y轴坐标。
		 * @param z Z轴坐标。
		 */

		constructor(x?:number,y?:number,z?:number,nativeElements?:Float32Array);

		/*
		 * 设置xyz值。
		 * @param x X值。
		 * @param y Y值。
		 * @param z Z值。
		 */
		setValue(x:number,y:number,z:number):void;

		/*
		 * 从Array数组拷贝值。
		 * @param array 数组。
		 * @param offset 数组偏移。
		 */
		fromArray(array:any[],offset?:number):void;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
		toDefault():void;
		forNativeElement(nativeElements?:Float32Array):void;
	}

}

declare module laya.d3.math {

	/*
	 * <code>Vector4</code> 类用于创建四维向量。
	 */
	class Vector4 implements laya.d3.core.IClone  {

		/*
		 * 零向量，禁止修改
		 */
		static ZERO:Vector4;
		static ONE:Vector4;
		static UnitX:Vector4;
		static UnitY:Vector4;
		static UnitZ:Vector4;
		static UnitW:Vector4;

		/*
		 * X轴坐标
		 */
		x:number;

		/*
		 * Y轴坐标
		 */
		y:number;

		/*
		 * Z轴坐标
		 */
		z:number;

		/*
		 * W轴坐标
		 */
		w:number;

		/*
		 * 创建一个 <code>Vector4</code> 实例。
		 * @param x X轴坐标。
		 * @param y Y轴坐标。
		 * @param z Z轴坐标。
		 * @param w W轴坐标。
		 */

		constructor(x?:number,y?:number,z?:number,w?:number);

		/*
		 * 设置xyzw值。
		 * @param x X值。
		 * @param y Y值。
		 * @param z Z值。
		 * @param w W值。
		 */
		setValue(x:number,y:number,z:number,w:number):void;

		/*
		 * 从Array数组拷贝值。
		 * @param array 数组。
		 * @param offset 数组偏移。
		 */
		fromArray(array:any[],offset?:number):void;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;

		/*
		 * 插值四维向量。
		 * @param a left向量。
		 * @param b right向量。
		 * @param t 插值比例。
		 * @param out 输出向量。
		 */
		static lerp(a:Vector4,b:Vector4,t:number,out:Vector4):void;

		/*
		 * 通过4x4矩阵把一个四维向量转换为另一个四维向量
		 * @param vector4 带转换四维向量。
		 * @param M4x4 4x4矩阵。
		 * @param out 转换后四维向量。
		 */
		static transformByM4x4(vector4:Vector4,m4x4:laya.d3.math.Matrix4x4,out:Vector4):void;

		/*
		 * 判断两个四维向量是否相等。
		 * @param a 四维向量。
		 * @param b 四维向量。
		 * @return 是否相等。
		 */
		static equals(a:Vector4,b:Vector4):boolean;

		/*
		 * 求四维向量的长度。
		 * @return 长度。
		 */
		length():number;

		/*
		 * 求四维向量长度的平方。
		 * @return 长度的平方。
		 */
		lengthSquared():number;

		/*
		 * 归一化四维向量。
		 * @param s 源四维向量。
		 * @param out 输出四维向量。
		 */
		static normalize(s:Vector4,out:Vector4):void;

		/*
		 * 求两个四维向量的和。
		 * @param a 四维向量。
		 * @param b 四维向量。
		 * @param out 输出向量。
		 */
		static add(a:Vector4,b:Vector4,out:Vector4):void;

		/*
		 * 求两个四维向量的差。
		 * @param a 四维向量。
		 * @param b 四维向量。
		 * @param out 输出向量。
		 */
		static subtract(a:Vector4,b:Vector4,out:Vector4):void;

		/*
		 * 计算两个四维向量的乘积。
		 * @param a 四维向量。
		 * @param b 四维向量。
		 * @param out 输出向量。
		 */
		static multiply(a:Vector4,b:Vector4,out:Vector4):void;

		/*
		 * 缩放四维向量。
		 * @param a 源四维向量。
		 * @param b 缩放值。
		 * @param out 输出四维向量。
		 */
		static scale(a:Vector4,b:number,out:Vector4):void;

		/*
		 * 求一个指定范围的四维向量
		 * @param value clamp向量
		 * @param min 最小
		 * @param max 最大
		 * @param out 输出向量
		 */
		static Clamp(value:Vector4,min:Vector4,max:Vector4,out:Vector4):void;

		/*
		 * 两个四维向量距离的平方。
		 * @param value1 向量1。
		 * @param value2 向量2。
		 * @return 距离的平方。
		 */
		static distanceSquared(value1:Vector4,value2:Vector4):number;

		/*
		 * 两个四维向量距离。
		 * @param value1 向量1。
		 * @param value2 向量2。
		 * @return 距离。
		 */
		static distance(value1:Vector4,value2:Vector4):number;

		/*
		 * 求两个四维向量的点积。
		 * @param a 向量。
		 * @param b 向量。
		 * @return 点积。
		 */
		static dot(a:Vector4,b:Vector4):number;

		/*
		 * 分别取两个四维向量x、y、z的最小值计算新的四维向量。
		 * @param a 四维向量。
		 * @param b 四维向量。
		 * @param out 结果三维向量。
		 */
		static min(a:Vector4,b:Vector4,out:Vector4):void;

		/*
		 * 分别取两个四维向量x、y、z的最大值计算新的四维向量。
		 * @param a 四维向量。
		 * @param b 四维向量。
		 * @param out 结果三维向量。
		 */
		static max(a:Vector4,b:Vector4,out:Vector4):void;
		forNativeElement(nativeElements?:Float32Array):void;
	}

}

declare module laya.d3.math {

	/*
	 * <code>Viewport</code> 类用于创建视口。
	 */
	class Viewport  {
		private static _tempMatrix4x4:any;

		/*
		 * X轴坐标
		 */
		x:number;

		/*
		 * Y轴坐标
		 */
		y:number;

		/*
		 * 宽度
		 */
		width:number;

		/*
		 * 高度
		 */
		height:number;

		/*
		 * 最小深度
		 */
		minDepth:number;

		/*
		 * 最大深度
		 */
		maxDepth:number;

		/*
		 * 创建一个 <code>Viewport</code> 实例。
		 * @param x x坐标。
		 * @param y y坐标。
		 * @param width 宽度。
		 * @param height 高度。
		 */

		constructor(x:number,y:number,width:number,height:number);

		/*
		 * 变换一个三维向量。
		 * @param source 源三维向量。
		 * @param matrix 变换矩阵。
		 * @param vector 输出三维向量。
		 */
		project(source:laya.d3.math.Vector3,matrix:laya.d3.math.Matrix4x4,out:laya.d3.math.Vector3):void;

		/*
		 * 反变换一个三维向量。
		 * @param source 源三维向量。
		 * @param matrix 变换矩阵。
		 * @param vector 输出三维向量。
		 */
		unprojectFromMat(source:laya.d3.math.Vector3,matrix:laya.d3.math.Matrix4x4,out:laya.d3.math.Vector3):void;

		/*
		 * 反变换一个三维向量。
		 * @param source 源三维向量。
		 * @param projection 透视投影矩阵。
		 * @param view 视图矩阵。
		 * @param world 世界矩阵,可设置为null。
		 * @param out 输出向量。
		 */
		unprojectFromWVP(source:laya.d3.math.Vector3,projection:laya.d3.math.Matrix4x4,view:laya.d3.math.Matrix4x4,world:laya.d3.math.Matrix4x4,out:laya.d3.math.Vector3):void;

		/*
		 * 克隆
		 * @param out 
		 */
		cloneTo(out:Viewport):void;
	}

}

declare module laya.d3.physics {

	/*
	 * <code>CharacterController</code> 类用于创建角色控制器。
	 */
	class CharacterController extends laya.d3.physics.PhysicsComponent  {
		static UPAXIS_X:number;
		static UPAXIS_Y:number;
		static UPAXIS_Z:number;

		/*
		 * 获取角色降落速度。
		 * @return 角色降落速度。
		 */

		/*
		 * 设置角色降落速度。
		 * @param value 角色降落速度。
		 */
		fallSpeed:number;

		/*
		 * 获取角色跳跃速度。
		 * @return 角色跳跃速度。
		 */

		/*
		 * 设置角色跳跃速度。
		 * @param value 角色跳跃速度。
		 */
		jumpSpeed:number;

		/*
		 * 获取重力。
		 * @return 重力。
		 */

		/*
		 * 设置重力。
		 * @param value 重力。
		 */
		gravity:laya.d3.math.Vector3;

		/*
		 * 获取最大坡度。
		 * @return 最大坡度。
		 */

		/*
		 * 设置最大坡度。
		 * @param value 最大坡度。
		 */
		maxSlope:number;

		/*
		 * 获取角色是否在地表。
		 */
		readonly isGrounded:boolean;

		/*
		 * 获取角色行走的脚步高度，表示可跨越的最大高度。
		 * @return 脚步高度。
		 */

		/*
		 * 设置角色行走的脚步高度，表示可跨越的最大高度。
		 * @param value 脚步高度。
		 */
		stepHeight:number;

		/*
		 * 获取角色的Up轴。
		 * @return 角色的Up轴。
		 */

		/*
		 * 设置角色的Up轴。
		 * @return 角色的Up轴。
		 */
		upAxis:laya.d3.math.Vector3;

		/*
		 * 创建一个 <code>CharacterController</code> 实例。
		 * @param stepheight 角色脚步高度。
		 * @param upAxis 角色Up轴
		 * @param collisionGroup 所属碰撞组。
		 * @param canCollideWith 可产生碰撞的碰撞组。
		 */

		constructor(stepheight?:number,upAxis?:laya.d3.math.Vector3,collisionGroup?:number,canCollideWith?:number);

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onDestroy():void;

		/*
		 * 通过指定移动向量移动角色。
		 * @param movement 移动向量。
		 */
		move(movement:laya.d3.math.Vector3):void;

		/*
		 * 跳跃。
		 * @param velocity 跳跃速度。
		 */
		jump(velocity?:laya.d3.math.Vector3):void;
	}

}

declare module laya.d3.physics {

	/*
	 * <code>Collision</code> 类用于创建物理碰撞信息。
	 */
	class Collision  {

		/*
		 * @readonly 
		 */
		contacts:laya.d3.physics.ContactPoint[];

		/*
		 * @readonly 
		 */
		other:laya.d3.physics.PhysicsComponent;

		/*
		 * 创建一个 <code>Collision</code> 实例。
		 */

		constructor();
	}

}

declare module laya.d3.physics {

	/*
	 * <code>CollisionMap</code> 类用于实现碰撞组合实例图。
	 */
	class CollisionTool  {

		/*
		 * 创建一个 <code>CollisionMap</code> 实例。
		 */

		constructor();
	}

}

declare module laya.d3.physics {

	/*
	 * ...
	 * @author ...
	 */
	class Constraint3D  {

		/*
		 * 获取刚体A。[只读]
		 */
		rigidbodyA:laya.d3.physics.Rigidbody3D;

		/*
		 * 获取刚体A。[只读]
		 */
		rigidbodyB:laya.d3.physics.Rigidbody3D;

		constructor();
	}

}

declare module laya.d3.physics.constraints {

	/*
	 * <code>ConstraintComponent</code> 类用于创建约束的父类。
	 */
	class ConstraintComponent extends laya.components.Component  {

		/*
		 * @inheritDoc 
		 * @override 
		 */

		/*
		 * @inheritDoc 
		 * @override 
		 */
		enabled:boolean;

		/*
		 * 获取打破冲力阈值。
		 * @return 打破冲力阈值。
		 */

		/*
		 * 设置打破冲力阈值。
		 * @param value 打破冲力阈值。
		 */
		breakingImpulseThreshold:number;

		/*
		 * 获取应用的冲力。
		 */
		readonly appliedImpulse:number;

		/*
		 * 获取已连接的刚体。
		 * @return 已连接刚体。
		 */

		/*
		 * 设置已连接刚体。
		 * @param value 已连接刚体。
		 */
		connectedBody:laya.d3.physics.Rigidbody3D;

		/*
		 * 创建一个 <code>ConstraintComponent</code> 实例。
		 */

		constructor();

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onDestroy():void;
	}

}

declare module laya.d3.physics.constraints {

	/*
	 * <code>Point2PointConstraint</code> 类用于创建物理组件的父类。
	 */
	class Point2PointConstraint  {
		pivotInA:laya.d3.math.Vector3;
		pivotInB:laya.d3.math.Vector3;
		damping:number;
		impulseClamp:number;
		tau:number;

		/*
		 * 创建一个 <code>Point2PointConstraint</code> 实例。
		 */

		constructor();
	}

}

declare module laya.d3.physics {

	/*
	 * <code>ContactPoint</code> 类用于创建物理碰撞信息。
	 */
	class ContactPoint  {

		/*
		 * 碰撞器A。
		 */
		colliderA:laya.d3.physics.PhysicsComponent;

		/*
		 * 碰撞器B。
		 */
		colliderB:laya.d3.physics.PhysicsComponent;

		/*
		 * 距离。
		 */
		distance:number;

		/*
		 * 法线。
		 */
		normal:laya.d3.math.Vector3;

		/*
		 * 碰撞器A的碰撞点。
		 */
		positionOnA:laya.d3.math.Vector3;

		/*
		 * 碰撞器B的碰撞点。
		 */
		positionOnB:laya.d3.math.Vector3;

		/*
		 * 创建一个 <code>ContactPoint</code> 实例。
		 */

		constructor();
	}

}

declare module laya.d3.physics {

	/*
	 * <code>HitResult</code> 类用于实现射线检测或形状扫描的结果。
	 */
	class HitResult  {

		/*
		 * 是否成功。
		 */
		succeeded:boolean;

		/*
		 * 发生碰撞的碰撞组件。
		 */
		collider:laya.d3.physics.PhysicsComponent;

		/*
		 * 碰撞点。
		 */
		point:laya.d3.math.Vector3;

		/*
		 * 碰撞法线。
		 */
		normal:laya.d3.math.Vector3;

		/*
		 * 碰撞分数。
		 */
		hitFraction:number;

		/*
		 * 创建一个 <code>HitResult</code> 实例。
		 */

		constructor();
	}

}

declare module laya.d3.physics {
	class Physics3D  {
	}

}

declare module laya.d3.physics {

	/*
	 * <code>PhysicsCollider</code> 类用于创建物理碰撞器。
	 */
	class PhysicsCollider extends laya.d3.physics.PhysicsTriggerComponent  {

		/*
		 * 创建一个 <code>PhysicsCollider</code> 实例。
		 * @param collisionGroup 所属碰撞组。
		 * @param canCollideWith 可产生碰撞的碰撞组。
		 */

		constructor(collisionGroup?:number,canCollideWith?:number);
	}

}

declare module laya.d3.physics {

	/*
	 * <code>PhysicsComponent</code> 类用于创建物理组件的父类。
	 */
	class PhysicsComponent extends laya.components.Component  {

		/*
		 * 是否可以缩放Shape。
		 */
		canScaleShape:boolean;

		/*
		 * 获取弹力。
		 * @return 弹力。
		 */

		/*
		 * 设置弹力。
		 * @param 弹力 。
		 */
		restitution:number;

		/*
		 * 获取摩擦力。
		 * @return 摩擦力。
		 */

		/*
		 * 设置摩擦力。
		 * @param value 摩擦力。
		 */
		friction:number;

		/*
		 * 获取滚动摩擦力。
		 * @return 滚动摩擦力。
		 */

		/*
		 * 设置滚动摩擦力。
		 * @param 滚动摩擦力 。
		 */
		rollingFriction:number;

		/*
		 * 获取用于连续碰撞检测(CCD)的速度阈值,当物体移动速度小于该值时不进行CCD检测,防止快速移动物体(例如:子弹)错误的穿过其它物体,0表示禁止。
		 * @return 连续碰撞检测(CCD)的速度阈值。
		 */

		/*
		 * 设置用于连续碰撞检测(CCD)的速度阈值，当物体移动速度小于该值时不进行CCD检测,防止快速移动物体(例如:子弹)错误的穿过其它物体,0表示禁止。
		 * @param value 连续碰撞检测(CCD)的速度阈值。
		 */
		ccdMotionThreshold:number;

		/*
		 * 获取用于进入连续碰撞检测(CCD)范围的球半径。
		 * @return 球半径。
		 */

		/*
		 * 设置用于进入连续碰撞检测(CCD)范围的球半径。
		 * @param 球半径 。
		 */
		ccdSweptSphereRadius:number;

		/*
		 * 获取是否激活。
		 */
		readonly isActive:boolean;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		enabled:boolean;

		/*
		 * 获取碰撞形状。
		 */

		/*
		 * 设置碰撞形状。
		 */
		colliderShape:laya.d3.physics.shape.ColliderShape;

		/*
		 * 获取模拟器。
		 * @return 模拟器。
		 */
		readonly simulation:laya.d3.physics.PhysicsSimulation;

		/*
		 * 获取所属碰撞组。
		 * @return 所属碰撞组。
		 */

		/*
		 * 设置所属碰撞组。
		 * @param 所属碰撞组 。
		 */
		collisionGroup:number;

		/*
		 * 获取可碰撞的碰撞组。
		 * @return 可碰撞组。
		 */

		/*
		 * 设置可碰撞的碰撞组。
		 * @param 可碰撞组 。
		 */
		canCollideWith:number;

		/*
		 * 创建一个 <code>PhysicsComponent</code> 实例。
		 * @param collisionGroup 所属碰撞组。
		 * @param canCollideWith 可产生碰撞的碰撞组。
		 */

		constructor(collisionGroup:number,canCollideWith:number);

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onEnable():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onDisable():void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onDestroy():void;
	}

}

declare module laya.d3.physics {

	/*
	 * <code>PhysicsSettings</code> 类用于创建物理配置信息。
	 */
	class PhysicsSettings  {

		/*
		 * 标志集合。
		 */
		flags:number;

		/*
		 * 物理引擎在一帧中用于补偿减速的最大次数。
		 */
		maxSubSteps:number;

		/*
		 * 物理模拟器帧的间隔时间。
		 */
		fixedTimeStep:number;

		/*
		 * 创建一个 <code>PhysicsSettings</code> 实例。
		 */

		constructor();
	}

}

declare module laya.d3.physics {

	/*
	 * <code>Simulation</code> 类用于创建物理模拟器。
	 */
	class PhysicsSimulation  {
		static disableSimulation:boolean;

		/*
		 * 创建限制刚体运动的约束条件。
		 */
		static createConstraint():void;

		/*
		 * 物理引擎在一帧中用于补偿减速的最大次数：模拟器每帧允许的最大模拟次数，如果引擎运行缓慢,可能需要增加该次数，否则模拟器会丢失“时间",引擎间隔时间小于maxSubSteps*fixedTimeStep非常重要。
		 */
		maxSubSteps:number;

		/*
		 * 物理模拟器帧的间隔时间:通过减少fixedTimeStep可增加模拟精度，默认是1.0 / 60.0。
		 */
		fixedTimeStep:number;

		/*
		 * 获取是否进行连续碰撞检测。
		 * @return 是否进行连续碰撞检测。
		 */

		/*
		 * 设置是否进行连续碰撞检测。
		 * @param value 是否进行连续碰撞检测。
		 */
		continuousCollisionDetection:boolean;

		/*
		 * 获取重力。
		 */

		/*
		 * 设置重力。
		 */
		gravity:laya.d3.math.Vector3;

		/*
		 * 射线检测第一个碰撞物体。
		 * @param from 起始位置。
		 * @param to 结束位置。
		 * @param out 碰撞结果。
		 * @param collisonGroup 射线所属碰撞组。
		 * @param collisionMask 与射线可产生碰撞的组。
		 * @return 是否成功。
		 */
		raycastFromTo(from:laya.d3.math.Vector3,to:laya.d3.math.Vector3,out?:laya.d3.physics.HitResult,collisonGroup?:number,collisionMask?:number):boolean;

		/*
		 * 射线检测所有碰撞的物体。
		 * @param from 起始位置。
		 * @param to 结束位置。
		 * @param out 碰撞结果[数组元素会被回收]。
		 * @param collisonGroup 射线所属碰撞组。
		 * @param collisionMask 与射线可产生碰撞的组。
		 * @return 是否成功。
		 */
		raycastAllFromTo(from:laya.d3.math.Vector3,to:laya.d3.math.Vector3,out:laya.d3.physics.HitResult[],collisonGroup?:number,collisionMask?:number):boolean;

		/*
		 * 射线检测第一个碰撞物体。
		 * @param ray 射线
		 * @param outHitInfo 与该射线发生碰撞的第一个碰撞器的碰撞信息
		 * @param distance 射线长度,默认为最大值
		 * @param collisonGroup 射线所属碰撞组。
		 * @param collisionMask 与射线可产生碰撞的组。
		 * @return 是否检测成功。
		 */
		rayCast(ray:laya.d3.math.Ray,outHitResult?:laya.d3.physics.HitResult,distance?:number,collisonGroup?:number,collisionMask?:number):boolean;

		/*
		 * 射线检测所有碰撞的物体。
		 * @param ray 射线
		 * @param out 碰撞结果[数组元素会被回收]。
		 * @param distance 射线长度,默认为最大值
		 * @param collisonGroup 射线所属碰撞组。
		 * @param collisionMask 与射线可产生碰撞的组。
		 * @return 是否检测成功。
		 */
		rayCastAll(ray:laya.d3.math.Ray,out:laya.d3.physics.HitResult[],distance?:number,collisonGroup?:number,collisionMask?:number):boolean;

		/*
		 * 形状检测第一个碰撞的物体。
		 * @param shape 形状。
		 * @param fromPosition 世界空间起始位置。
		 * @param toPosition 世界空间结束位置。
		 * @param out 碰撞结果。
		 * @param fromRotation 起始旋转。
		 * @param toRotation 结束旋转。
		 * @param collisonGroup 射线所属碰撞组。
		 * @param collisionMask 与射线可产生碰撞的组。
		 * @return 是否成功。
		 */
		shapeCast(shape:laya.d3.physics.shape.ColliderShape,fromPosition:laya.d3.math.Vector3,toPosition:laya.d3.math.Vector3,out?:laya.d3.physics.HitResult,fromRotation?:laya.d3.math.Quaternion,toRotation?:laya.d3.math.Quaternion,collisonGroup?:number,collisionMask?:number,allowedCcdPenetration?:number):boolean;

		/*
		 * 形状检测所有碰撞的物体。
		 * @param shape 形状。
		 * @param fromPosition 世界空间起始位置。
		 * @param toPosition 世界空间结束位置。
		 * @param out 碰撞结果[数组元素会被回收]。
		 * @param fromRotation 起始旋转。
		 * @param toRotation 结束旋转。
		 * @param collisonGroup 射线所属碰撞组。
		 * @param collisionMask 与射线可产生碰撞的组。
		 * @return 是否成功。
		 */
		shapeCastAll(shape:laya.d3.physics.shape.ColliderShape,fromPosition:laya.d3.math.Vector3,toPosition:laya.d3.math.Vector3,out:laya.d3.physics.HitResult[],fromRotation?:laya.d3.math.Quaternion,toRotation?:laya.d3.math.Quaternion,collisonGroup?:number,collisionMask?:number,allowedCcdPenetration?:number):boolean;

		/*
		 * 添加刚体运动的约束条件。
		 * @param constraint 约束。
		 * @param disableCollisionsBetweenLinkedBodies 是否禁用
		 */
		addConstraint(constraint:laya.d3.physics.Constraint3D,disableCollisionsBetweenLinkedBodies?:boolean):void;

		/*
		 * 移除刚体运动的约束条件。
		 */
		removeConstraint(constraint:laya.d3.physics.Constraint3D):void;

		/*
		 * 清除力。
		 */
		clearForces():void;
	}

}

declare module laya.d3.physics {

	/*
	 * <code>PhysicsTriggerComponent</code> 类用于创建物理触发器组件。
	 */
	class PhysicsTriggerComponent extends laya.d3.physics.PhysicsComponent  {

		/*
		 * 获取是否为触发器。
		 * @return 是否为触发器。
		 */

		/*
		 * 设置是否为触发器。
		 * @param value 是否为触发器。
		 */
		isTrigger:boolean;

		/*
		 * 创建一个 <code>PhysicsTriggerComponent</code> 实例。
		 * @param collisionGroup 所属碰撞组。
		 * @param canCollideWith 可产生碰撞的碰撞组。
		 */

		constructor(collisionGroup:number,canCollideWith:number);
	}

}

declare module laya.d3.physics {

	/*
	 * <code>PhysicsUpdateList</code> 类用于实现物理更新队列。
	 */
	class PhysicsUpdateList extends laya.d3.component.SingletonList<laya.resource.ISingletonElement>  {

		/*
		 * 创建一个新的 <code>PhysicsUpdateList</code> 实例。
		 */

		constructor();
	}

}

declare module laya.d3.physics {

	/*
	 * <code>Rigidbody3D</code> 类用于创建刚体碰撞器。
	 */
	class Rigidbody3D extends laya.d3.physics.PhysicsTriggerComponent  {
		static TYPE_STATIC:number;
		static TYPE_DYNAMIC:number;
		static TYPE_KINEMATIC:number;

		/*
		 * 获取质量。
		 * @return 质量。
		 */

		/*
		 * 设置质量。
		 * @param value 质量。
		 */
		mass:number;

		/*
		 * 获取是否为运动物体，如果为true仅可通过transform属性移动物体,而非其他力相关属性。
		 * @return 是否为运动物体。
		 */

		/*
		 * 设置是否为运动物体，如果为true仅可通过transform属性移动物体,而非其他力相关属性。
		 * @param value 是否为运动物体。
		 */
		isKinematic:boolean;

		/*
		 * 获取刚体的线阻力。
		 * @return 线阻力。
		 */

		/*
		 * 设置刚体的线阻力。
		 * @param value 线阻力。
		 */
		linearDamping:number;

		/*
		 * 获取刚体的角阻力。
		 * @return 角阻力。
		 */

		/*
		 * 设置刚体的角阻力。
		 * @param value 角阻力。
		 */
		angularDamping:number;

		/*
		 * 获取是否重载重力。
		 * @return 是否重载重力。
		 */

		/*
		 * 设置是否重载重力。
		 * @param value 是否重载重力。
		 */
		overrideGravity:boolean;

		/*
		 * 获取重力。
		 * @return 重力。
		 */

		/*
		 * 设置重力。
		 * @param value 重力。
		 */
		gravity:laya.d3.math.Vector3;

		/*
		 * 获取总力。
		 */
		readonly totalForce:laya.d3.math.Vector3;

		/*
		 * 获取性因子。
		 */

		/*
		 * 设置性因子。
		 */
		linearFactor:laya.d3.math.Vector3;

		/*
		 * 获取线速度
		 * @return 线速度
		 */

		/*
		 * 设置线速度。
		 * @param 线速度 。
		 */
		linearVelocity:laya.d3.math.Vector3;

		/*
		 * 获取角因子。
		 */

		/*
		 * 设置角因子。
		 */
		angularFactor:laya.d3.math.Vector3;

		/*
		 * 获取角速度。
		 * @return 角速度。
		 */

		/*
		 * 设置角速度。
		 * @param 角速度 
		 */
		angularVelocity:laya.d3.math.Vector3;

		/*
		 * 获取刚体所有扭力。
		 */
		readonly totalTorque:laya.d3.math.Vector3;

		/*
		 * 获取是否进行碰撞检测。
		 * @return 是否进行碰撞检测。
		 */

		/*
		 * 设置是否进行碰撞检测。
		 * @param value 是否进行碰撞检测。
		 */
		detectCollisions:boolean;

		/*
		 * 获取是否处于睡眠状态。
		 * @return 是否处于睡眠状态。
		 */
		readonly isSleeping:boolean;

		/*
		 * 获取刚体睡眠的线速度阈值。
		 * @return 刚体睡眠的线速度阈值。
		 */

		/*
		 * 设置刚体睡眠的线速度阈值。
		 * @param value 刚体睡眠的线速度阈值。
		 */
		sleepLinearVelocity:number;

		/*
		 * 获取刚体睡眠的角速度阈值。
		 * @return 刚体睡眠的角速度阈值。
		 */

		/*
		 * 设置刚体睡眠的角速度阈值。
		 * @param value 刚体睡眠的角速度阈值。
		 */
		sleepAngularVelocity:number;

		/*
		 * 创建一个 <code>RigidBody</code> 实例。
		 * @param collisionGroup 所属碰撞组。
		 * @param canCollideWith 可产生碰撞的碰撞组。
		 */

		constructor(collisionGroup?:number,canCollideWith?:number);

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _onDestroy():void;

		/*
		 * 应用作用力。
		 * @param force 作用力。
		 * @param localOffset 偏移,如果为null则为中心点
		 */
		applyForce(force:laya.d3.math.Vector3,localOffset?:laya.d3.math.Vector3):void;

		/*
		 * 应用扭转力。
		 * @param torque 扭转力。
		 */
		applyTorque(torque:laya.d3.math.Vector3):void;

		/*
		 * 应用冲量。
		 * @param impulse 冲量。
		 * @param localOffset 偏移,如果为null则为中心点。
		 */
		applyImpulse(impulse:laya.d3.math.Vector3,localOffset?:laya.d3.math.Vector3):void;

		/*
		 * 应用扭转冲量。
		 * @param torqueImpulse 
		 */
		applyTorqueImpulse(torqueImpulse:laya.d3.math.Vector3):void;

		/*
		 * 唤醒刚体。
		 */
		wakeUp():void;

		/*
		 * 清除应用到刚体上的所有力。
		 */
		clearForces():void;
	}

}

declare module laya.d3.physics.shape {

	/*
	 * <code>BoxColliderShape</code> 类用于创建盒子形状碰撞器。
	 */
	class BoxColliderShape extends laya.d3.physics.shape.ColliderShape  {

		/*
		 * 获取X轴尺寸。
		 */
		readonly sizeX:number;

		/*
		 * 获取Y轴尺寸。
		 */
		readonly sizeY:number;

		/*
		 * 获取Z轴尺寸。
		 */
		readonly sizeZ:number;

		/*
		 * 创建一个新的 <code>BoxColliderShape</code> 实例。
		 * @param sizeX 盒子X轴尺寸。
		 * @param sizeY 盒子Y轴尺寸。
		 * @param sizeZ 盒子Z轴尺寸。
		 */

		constructor(sizeX?:number,sizeY?:number,sizeZ?:number);

		/*
		 * @inheritDoc 
		 * @override 
		 */
		clone():any;
	}

}

declare module laya.d3.physics.shape {

	/*
	 * <code>CapsuleColliderShape</code> 类用于创建胶囊形状碰撞器。
	 */
	class CapsuleColliderShape extends laya.d3.physics.shape.ColliderShape  {

		/*
		 * 获取半径。
		 */
		readonly radius:number;

		/*
		 * 获取长度。
		 */
		readonly length:number;

		/*
		 * 获取方向。
		 */
		readonly orientation:number;

		/*
		 * 创建一个新的 <code>CapsuleColliderShape</code> 实例。
		 * @param 半径 。
		 * @param 高 (包含半径)。
		 * @param orientation 胶囊体方向。
		 */

		constructor(radius?:number,length?:number,orientation?:number);

		/*
		 * @inheritDoc 
		 * @override 
		 */
		clone():any;
	}

}

declare module laya.d3.physics.shape {

	/*
	 * <code>ColliderShape</code> 类用于创建形状碰撞器的父类，该类为抽象类。
	 */
	class ColliderShape implements laya.d3.core.IClone  {
		needsCustomCollisionCallback:boolean;

		/*
		 * 获取碰撞类型。
		 * @return 碰撞类型。
		 */
		readonly type:number;

		/*
		 * 获取Shape的本地偏移。
		 * @return Shape的本地偏移。
		 */

		/*
		 * 设置Shape的本地偏移。
		 * @param Shape的本地偏移 。
		 */
		localOffset:laya.d3.math.Vector3;

		/*
		 * 获取Shape的本地旋转。
		 * @return Shape的本地旋转。
		 */

		/*
		 * 设置Shape的本地旋转。
		 * @param Shape的本地旋转 。
		 */
		localRotation:laya.d3.math.Quaternion;

		/*
		 * 创建一个新的 <code>ColliderShape</code> 实例。
		 */

		constructor();

		/*
		 * 更新本地偏移,如果修改LocalOffset或LocalRotation需要调用。
		 */
		updateLocalTransformations():void;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;

		/*
		 * 销毁。
		 */
		destroy():void;
	}

}

declare module laya.d3.physics.shape {

	/*
	 * <code>CompoundColliderShape</code> 类用于创建盒子形状碰撞器。
	 */
	class CompoundColliderShape extends laya.d3.physics.shape.ColliderShape  {

		/*
		 * 创建一个新的 <code>CompoundColliderShape</code> 实例。
		 */

		constructor();

		/*
		 * 添加子碰撞器形状。
		 * @param shape 子碰撞器形状。
		 */
		addChildShape(shape:laya.d3.physics.shape.ColliderShape):void;

		/*
		 * 移除子碰撞器形状。
		 * @param shape 子碰撞器形状。
		 */
		removeChildShape(shape:laya.d3.physics.shape.ColliderShape):void;

		/*
		 * 清空子碰撞器形状。
		 */
		clearChildShape():void;

		/*
		 * 获取子形状数量。
		 * @return 
		 */
		getChildShapeCount():number;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		cloneTo(destObject:any):void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		clone():any;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		destroy():void;
	}

}

declare module laya.d3.physics.shape {

	/*
	 * <code>ConeColliderShape</code> 类用于创建圆柱碰撞器。
	 */
	class ConeColliderShape extends laya.d3.physics.shape.ColliderShape  {
		private _orientation:any;
		private _radius:any;
		private _height:any;

		/*
		 * 获取半径。
		 */
		readonly radius:number;

		/*
		 * 获取高度。
		 */
		readonly height:number;

		/*
		 * 获取方向。
		 */
		readonly orientation:number;

		/*
		 * 创建一个新的 <code>ConeColliderShape</code> 实例。
		 * @param height 高。
		 * @param radius 半径。
		 */

		constructor(radius?:number,height?:number,orientation?:number);

		/*
		 * @inheritDoc 
		 * @override 
		 */
		clone():any;
	}

}

declare module laya.d3.physics.shape {

	/*
	 * <code>CylinderColliderShape</code> 类用于创建圆柱碰撞器。
	 */
	class CylinderColliderShape extends laya.d3.physics.shape.ColliderShape  {
		private static _nativeSize:any;
		private _orientation:any;
		private _radius:any;
		private _height:any;

		/*
		 * 获取半径。
		 */
		readonly radius:number;

		/*
		 * 获取高度。
		 */
		readonly height:number;

		/*
		 * 获取方向。
		 */
		readonly orientation:number;

		/*
		 * 创建一个新的 <code>CylinderColliderShape</code> 实例。
		 * @param height 高。
		 * @param radius 半径。
		 */

		constructor(radius?:number,height?:number,orientation?:number);

		/*
		 * @inheritDoc 
		 * @override 
		 */
		clone():any;
	}

}

declare module laya.d3.physics.shape {

	/*
	 * ...
	 * @author ...
	 */
	class HeightfieldColliderShape  {

		constructor();
	}

}

declare module laya.d3.physics.shape {

	/*
	 * <code>MeshColliderShape</code> 类用于创建网格碰撞器。
	 */
	class MeshColliderShape extends laya.d3.physics.shape.ColliderShape  {
		private _mesh:any;
		private _convex:any;

		/*
		 * 获取网格。
		 * @return 网格。
		 */

		/*
		 * 设置网格。
		 * @param 网格 。
		 */
		mesh:laya.d3.resource.models.Mesh;

		/*
		 * 获取是否使用凸多边形。
		 * @return 是否使用凸多边形。
		 */

		/*
		 * 设置是否使用凸多边形。
		 * @param value 是否使用凸多边形。
		 */
		convex:boolean;

		/*
		 * 创建一个新的 <code>MeshColliderShape</code> 实例。
		 */

		constructor();

		/*
		 * @inheritDoc 
		 * @override 
		 */
		cloneTo(destObject:any):void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		clone():any;
	}

}

declare module laya.d3.physics.shape {

	/*
	 * <code>SphereColliderShape</code> 类用于创建球形碰撞器。
	 */
	class SphereColliderShape extends laya.d3.physics.shape.ColliderShape  {
		private _radius:any;

		/*
		 * 获取半径。
		 */
		readonly radius:number;

		/*
		 * 创建一个新的 <code>SphereColliderShape</code> 实例。
		 * @param radius 半径。
		 */

		constructor(radius?:number);

		/*
		 * @inheritDoc 
		 * @override 
		 */
		clone():any;
	}

}

declare module laya.d3.physics.shape {

	/*
	 * <code>StaticPlaneColliderShape</code> 类用于创建静态平面碰撞器。
	 */
	class StaticPlaneColliderShape extends laya.d3.physics.shape.ColliderShape  {
		private static _nativeNormal:any;

		/*
		 * 创建一个新的 <code>StaticPlaneColliderShape</code> 实例。
		 */

		constructor(normal:laya.d3.math.Vector3,offset:number);

		/*
		 * @inheritDoc 
		 * @override 
		 */
		clone():any;
	}

}

declare module laya.d3.resource {

	/*
	 * <code>IReferenceCounter</code> 引用计数器接口。
	 */
	interface IReferenceCounter{
		_getReferenceCount():number;
		_addReference(count:number):void;
		_removeReference(count:number):void;
		_clearReference():void;
	}

}

declare module laya.d3.resource.models {

	/*
	 * <code>Mesh</code> 类用于创建文件网格数据模板。
	 */
	class Mesh extends laya.resource.Resource implements laya.d3.core.IClone  {

		/*
		 * Mesh资源。
		 */
		static MESH:string;

		/*
		 * 加载网格模板。
		 * @param url 模板地址。
		 * @param complete 完成回掉。
		 */
		static load(url:string,complete:laya.utils.Handler):void;

		/*
		 * 获取网格的全局默认绑定动作逆矩阵。
		 * @return 网格的全局默认绑定动作逆矩阵。
		 */
		readonly inverseAbsoluteBindPoses:laya.d3.math.Matrix4x4[];

		/*
		 * 获取顶点个数。
		 */
		readonly vertexCount:number;

		/*
		 * 获取索引个数。
		 */
		readonly indexCount:number;

		/*
		 * 获取SubMesh的个数。
		 * @return SubMesh的个数。
		 */
		readonly subMeshCount:number;

		/*
		 * 边界。
		 */
		bounds:laya.d3.core.Bounds;

		/*
		 * 创建一个 <code>Mesh</code> 实例,禁止使用。
		 * @param isReadable 是否可读。
		 */

		constructor(isReadable?:boolean);

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _disposeResource():void;

		/*
		 * 根据获取子网格。
		 * @param index 索引。
		 */
		getSubMesh(index:number):laya.d3.resource.models.SubMesh;

		/*
		 * 拷贝并填充位置数据至数组。
		 * @param positions 位置数组。
		 * @remark 该方法为拷贝操作，比较耗费性能。
		 */
		getPositions(positions:laya.d3.math.Vector3[]):void;

		/*
		 * 设置位置数据。
		 * @param positions 位置。
		 */
		setPositions(positions:laya.d3.math.Vector3[]):void;

		/*
		 * 拷贝并填充颜色数据至数组。
		 * @param colors 颜色数组。
		 * @remark 该方法为拷贝操作，比较耗费性能。
		 */
		getColors(colors:laya.d3.math.Color[]):void;

		/*
		 * 设置颜色数据。
		 * @param colors 颜色。
		 */
		setColors(colors:laya.d3.math.Color[]):void;

		/*
		 * 拷贝并填充纹理坐标数据至数组。
		 * @param uvs 纹理坐标数组。
		 * @param channel 纹理坐标通道。
		 * @remark 该方法为拷贝操作，比较耗费性能。
		 */
		getUVs(uvs:laya.d3.math.Vector2[],channel?:number):void;

		/*
		 * 设置纹理坐标数据。
		 * @param uvs 纹理坐标。
		 * @param channel 纹理坐标通道。
		 */
		setUVs(uvs:laya.d3.math.Vector2[],channel?:number):void;

		/*
		 * 拷贝并填充法线数据至数组。
		 * @param normals 法线数组。
		 * @remark 该方法为拷贝操作，比较耗费性能。
		 */
		getNormals(normals:laya.d3.math.Vector3[]):void;

		/*
		 * 设置法线数据。
		 * @param normals 法线。
		 */
		setNormals(normals:laya.d3.math.Vector3[]):void;

		/*
		 * 拷贝并填充切线数据至数组。
		 * @param tangents 切线。
		 */
		getTangents(tangents:laya.d3.math.Vector4[]):void;

		/*
		 * 设置切线数据。
		 * @param tangents 切线。
		 */
		setTangents(tangents:laya.d3.math.Vector4[]):void;

		/*
		 * 获取骨骼权重。
		 * @param boneWeights 骨骼权重。
		 */
		getBoneWeights(boneWeights:laya.d3.math.Vector4[]):void;

		/*
		 * 拷贝并填充骨骼权重数据至数组。
		 * @param boneWeights 骨骼权重。
		 */
		setBoneWeights(boneWeights:laya.d3.math.Vector4[]):void;

		/*
		 * 获取骨骼索引。
		 * @param boneIndices 骨骼索引。
		 */
		getBoneIndices(boneIndices:laya.d3.math.Vector4[]):void;

		/*
		 * 拷贝并填充骨骼索引数据至数组。
		 * @param boneWeights 骨骼索引。
		 */
		setBoneIndices(boneIndices:laya.d3.math.Vector4[]):void;

		/*
		 * 将Mesh标记为不可读,可减少内存，标记后不可再调用相关读取方法。
		 */
		markAsUnreadbale():void;

		/*
		 * 获取顶点声明。
		 */
		getVertexDeclaration():laya.d3.graphics.VertexDeclaration;

		/*
		 * 拷贝并获取顶点数据的副本。
		 * @return 顶点数据。
		 */
		getVertices():ArrayBuffer;

		/*
		 * 设置顶点数据。
		 * @param vertices 顶点数据。
		 */
		setVertices(vertices:ArrayBuffer):void;

		/*
		 * 拷贝并获取网格索引数据的副本。
		 */
		getIndices():Uint16Array;

		/*
		 * 设置网格索引。
		 * @param indices 
		 */
		setIndices(indices:Uint16Array):void;

		/*
		 * 从模型位置数据生成包围盒。
		 */
		calculateBounds():void;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.resource.models {

	/*
	 * <code>PrimitiveMesh</code> 类用于创建简单网格。
	 */
	class PrimitiveMesh  {
		static __init__():void;

		/*
		 * 创建Box网格。
		 * @param long 半径
		 * @param height 垂直层数
		 * @param width 水平层数
		 * @return 
		 */
		static createBox(long?:number,height?:number,width?:number):laya.d3.resource.models.Mesh;

		/*
		 * 创建一个胶囊体模型
		 * @param radius 半径
		 * @param height 高度
		 * @param stacks 水平层数,一般设为垂直层数的一半
		 * @param slices 垂直层数
		 */
		static createCapsule(radius?:number,height?:number,stacks?:number,slices?:number):laya.d3.resource.models.Mesh;

		/*
		 * 创建一个圆锥体模型
		 * @param radius 半径
		 * @param height 高度
		 * @param slices 分段数
		 */
		static createCone(radius?:number,height?:number,slices?:number):laya.d3.resource.models.Mesh;

		/*
		 * 创建一个圆柱体模型
		 * @param radius 半径
		 * @param height 高度
		 * @param slices 垂直层数
		 */
		static createCylinder(radius?:number,height?:number,slices?:number):laya.d3.resource.models.Mesh;

		/*
		 * 创建一个平面模型
		 * @param long 长
		 * @param width 宽
		 */
		static createPlane(long?:number,width?:number,stacks?:number,slices?:number):laya.d3.resource.models.Mesh;

		/*
		 * 创建一个四边形模型
		 * @param long 长
		 * @param width 宽
		 */
		static createQuad(long?:number,width?:number):laya.d3.resource.models.Mesh;

		/*
		 * 创建一个球体模型
		 * @param radius 半径
		 * @param stacks 水平层数
		 * @param slices 垂直层数
		 */
		static createSphere(radius?:number,stacks?:number,slices?:number):laya.d3.resource.models.Mesh;
	}

}

declare module laya.d3.resource.models {

	/*
	 * <code>SkyBox</code> 类用于创建天空盒。
	 */
	class SkyBox extends laya.d3.resource.models.SkyMesh  {
		static instance:SkyBox;

		/*
		 * 创建一个 <code>SkyBox</code> 实例。
		 */

		constructor();
	}

}

declare module laya.d3.resource.models {

	/*
	 * <code>SkyDome</code> 类用于创建天空盒。
	 */
	class SkyDome extends laya.d3.resource.models.SkyMesh  {
		static instance:SkyDome;

		/*
		 * 获取堆数。
		 */
		readonly stacks:number;

		/*
		 * 获取层数。
		 */
		readonly slices:number;

		/*
		 * 创建一个 <code>SkyDome</code> 实例。
		 * @param stacks 堆数。
		 * @param slices 层数。
		 */

		constructor(stacks?:number,slices?:number);
	}

}

declare module laya.d3.resource.models {

	/*
	 * <code>SkyMesh</code> 类用于实现天空网格。
	 */
	class SkyMesh  {

		/*
		 * 创建一个新的 <code>SkyMesh</code> 实例。
		 */

		constructor();
	}

}

declare module laya.d3.resource.models {

	/*
	 * <code>SkyRenderer</code> 类用于实现天空渲染器。
	 */
	class SkyRenderer  {
		private static _tempMatrix0:any;
		private static _tempMatrix1:any;

		/*
		 * 获取材质。
		 * @return 材质。
		 */

		/*
		 * 设置材质。
		 * @param 材质 。
		 */
		material:laya.d3.core.material.BaseMaterial;

		/*
		 * 获取网格。
		 * @return 网格。
		 */

		/*
		 * 设置网格。
		 * @param 网格 。
		 */
		mesh:laya.d3.resource.models.SkyMesh;

		/*
		 * 创建一个新的 <code>SkyRenderer</code> 实例。
		 */

		constructor();
	}

}

declare module laya.d3.resource.models {

	/*
	 * <code>SubMesh</code> 类用于创建子网格数据模板。
	 */
	class SubMesh extends laya.d3.core.GeometryElement  {

		/*
		 * 获取索引数量。
		 */
		readonly indexCount:number;

		/*
		 * 创建一个 <code>SubMesh</code> 实例。
		 * @param mesh 网格数据模板。
		 */

		constructor(mesh:laya.d3.resource.models.Mesh);

		/*
		 * 拷贝并获取子网格索引数据的副本。
		 */
		getIndices():Uint16Array;

		/*
		 * 设置子网格索引。
		 * @param indices 
		 */
		setIndices(indices:Uint16Array):void;

		/*
		 * {@inheritDoc GeometryElement.destroy}
		 * @override 
		 */
		destroy():void;
	}

}

declare module laya.d3.resource {

	/*
	 * //* <code>RenderTexture</code> 类用于创建渲染目标。
	 */
	class RenderTexture extends laya.resource.BaseTexture  {

		/*
		 * 获取当前激活的Rendertexture。
		 */
		static readonly currentActive:RenderTexture;

		/*
		 * 从对象池获取临时渲染目标。
		 */
		static createFromPool(width:number,height:number,format?:number,depthStencilFormat?:number,filterMode?:number):RenderTexture;

		/*
		 * 回收渲染目标到对象池,释放后可通过createFromPool复用。
		 */
		static recoverToPool(renderTexture:RenderTexture):void;

		/*
		 * 获取深度格式。
		 * @return 深度格式。
		 */
		readonly depthStencilFormat:number;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		readonly defaulteTexture:laya.resource.BaseTexture;

		/*
		 * @param width 宽度。
		 * @param height 高度。
		 * @param format 纹理格式。
		 * @param depthStencilFormat 深度格式。创建一个 <code>RenderTexture</code> 实例。
		 */

		constructor(width:number,height:number,format?:number,depthStencilFormat?:number);

		/*
		 * 获得像素数据。
		 * @param x X像素坐标。
		 * @param y Y像素坐标。
		 * @param width 宽度。
		 * @param height 高度。
		 * @return 像素数据。
		 */
		getData(x:number,y:number,width:number,height:number,out:Uint8Array):Uint8Array;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _disposeResource():void;
	}

}

declare module laya.d3.resource {

	/*
	 * <code>TextureCube</code> 类用于生成立方体纹理。
	 */
	class TextureCube extends laya.resource.BaseTexture  {

		/*
		 * TextureCube资源。
		 */
		static TEXTURECUBE:string;

		/*
		 * 灰色纯色纹理。
		 */
		static grayTexture:TextureCube;

		/*
		 * @inheritDoc 
		 */
		static _parse(data:any,propertyParams?:any,constructParams?:any[]):TextureCube;

		/*
		 * 加载TextureCube。
		 * @param url TextureCube地址。
		 * @param complete 完成回调。
		 */
		static load(url:string,complete:laya.utils.Handler):void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		readonly defaulteTexture:laya.resource.BaseTexture;

		/*
		 * 创建一个 <code>TextureCube</code> 实例。
		 * @param format 贴图格式。
		 * @param mipmap 是否生成mipmap。
		 */

		constructor(size:number,format?:number,mipmap?:boolean);

		/*
		 * @private 
		 */
		private _setPixels:any;

		/*
		 * 通过六张图片源填充纹理。
		 * @param 图片源数组 。
		 */
		setSixSideImageSources(source:any[],premultiplyAlpha?:boolean):void;

		/*
		 * 通过六张图片源填充纹理。
		 * @param 图片源数组 。
		 */
		setSixSidePixels(pixels:Array<Uint8Array>,miplevel?:number):void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _recoverResource():void;
	}

}

declare module laya.d3.resource {

	/*
	 * ...
	 * @author 
	 */
	class TextureGenerator  {

		constructor();
		static lightAttenTexture(x:number,y:number,maxX:number,maxY:number,index:number,data:Uint8Array):void;
		static haloTexture(x:number,y:number,maxX:number,maxY:number,index:number,data:Uint8Array):void;
		static _generateTexture2D(texture:laya.resource.Texture2D,textureWidth:number,textureHeight:number,func:Function):void;
	}

}

declare module laya.d3.shader {

	/*
	 * <code>DefineDatas</code> 类用于创建宏定义数据。
	 */
	class DefineDatas implements laya.d3.core.IClone  {

		/*
		 * 创建一个 <code>DefineDatas</code> 实例。
		 */

		constructor();

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;
	}

}

declare module laya.d3.shader {

	/*
	 * <code>Shader3D</code> 类用于创建Shader3D。
	 */
	class Shader3D  {

		/*
		 * 渲染状态_剔除。
		 */
		static RENDER_STATE_CULL:number;

		/*
		 * 渲染状态_混合。
		 */
		static RENDER_STATE_BLEND:number;

		/*
		 * 渲染状态_混合源。
		 */
		static RENDER_STATE_BLEND_SRC:number;

		/*
		 * 渲染状态_混合目标。
		 */
		static RENDER_STATE_BLEND_DST:number;

		/*
		 * 渲染状态_混合源RGB。
		 */
		static RENDER_STATE_BLEND_SRC_RGB:number;

		/*
		 * 渲染状态_混合目标RGB。
		 */
		static RENDER_STATE_BLEND_DST_RGB:number;

		/*
		 * 渲染状态_混合源ALPHA。
		 */
		static RENDER_STATE_BLEND_SRC_ALPHA:number;

		/*
		 * 渲染状态_混合目标ALPHA。
		 */
		static RENDER_STATE_BLEND_DST_ALPHA:number;

		/*
		 * 渲染状态_混合常量颜色。
		 */
		static RENDER_STATE_BLEND_CONST_COLOR:number;

		/*
		 * 渲染状态_混合方程。
		 */
		static RENDER_STATE_BLEND_EQUATION:number;

		/*
		 * 渲染状态_RGB混合方程。
		 */
		static RENDER_STATE_BLEND_EQUATION_RGB:number;

		/*
		 * 渲染状态_ALPHA混合方程。
		 */
		static RENDER_STATE_BLEND_EQUATION_ALPHA:number;

		/*
		 * 渲染状态_深度测试。
		 */
		static RENDER_STATE_DEPTH_TEST:number;

		/*
		 * 渲染状态_深度写入。
		 */
		static RENDER_STATE_DEPTH_WRITE:number;

		/*
		 * shader变量提交周期，自定义。
		 */
		static PERIOD_CUSTOM:number;

		/*
		 * shader变量提交周期，逐材质。
		 */
		static PERIOD_MATERIAL:number;

		/*
		 * shader变量提交周期，逐精灵和相机，注：因为精灵包含MVP矩阵，为复合属性，所以摄像机发生变化时也应提交。
		 */
		static PERIOD_SPRITE:number;

		/*
		 * shader变量提交周期，逐相机。
		 */
		static PERIOD_CAMERA:number;

		/*
		 * shader变量提交周期，逐场景。
		 */
		static PERIOD_SCENE:number;

		/*
		 * 是否开启调试模式。
		 */
		static debugMode:boolean;

		/*
		 * 通过Shader属性名称获得唯一ID。
		 * @param name Shader属性名称。
		 * @return 唯一ID。
		 */
		static propertyNameToID(name:string):number;

		/*
		 * 编译shader。
		 * @param name Shader名称。
		 * @param subShaderIndex 子着色器索引。
		 * @param passIndex 通道索引。
		 * @param publicDefine 公共宏定义值。
		 * @param spriteDefine 精灵宏定义值。
		 * @param materialDefine 材质宏定义值。
		 */
		static compileShader(name:string,subShaderIndex:number,passIndex:number,publicDefine:number,spriteDefine:number,materialDefine:number):void;

		/*
		 * 添加预编译shader文件，主要是处理宏定义
		 */
		static add(name:string,attributeMap?:any,uniformMap?:any,enableInstancing?:boolean):Shader3D;

		/*
		 * 获取ShaderCompile3D。
		 * @param name 
		 * @return ShaderCompile3D。
		 */
		static find(name:string):Shader3D;

		/*
		 * 创建一个 <code>Shader3D</code> 实例。
		 */

		constructor(name:string,attributeMap:any,uniformMap:any,enableInstancing:boolean);

		/*
		 * 添加子着色器。
		 * @param 子着色器 。
		 */
		addSubShader(subShader:laya.d3.shader.SubShader):void;

		/*
		 * 在特定索引获取子着色器。
		 * @param index 索引。
		 * @return 子着色器。
		 */
		getSubShaderAt(index:number):laya.d3.shader.SubShader;
	}

}

declare module laya.d3.shader {

	/*
	 * @private 
	 */
	class ShaderData implements laya.d3.core.IClone  {

		/*
		 * 增加Shader宏定义。
		 * @param value 宏定义。
		 */
		addDefine(define:number):void;

		/*
		 * 移除Shader宏定义。
		 * @param value 宏定义。
		 */
		removeDefine(define:number):void;

		/*
		 * 是否包含Shader宏定义。
		 * @param value 宏定义。
		 */
		hasDefine(define:number):boolean;

		/*
		 * 清空宏定义。
		 */
		clearDefine():void;

		/*
		 * 获取布尔。
		 * @param index shader索引。
		 * @return 布尔。
		 */
		getBool(index:number):boolean;

		/*
		 * 设置布尔。
		 * @param index shader索引。
		 * @param value 布尔。
		 */
		setBool(index:number,value:boolean):void;

		/*
		 * 获取整形。
		 * @param index shader索引。
		 * @return 整形。
		 */
		getInt(index:number):number;

		/*
		 * 设置整型。
		 * @param index shader索引。
		 * @param value 整形。
		 */
		setInt(index:number,value:number):void;

		/*
		 * 获取浮点。
		 * @param index shader索引。
		 * @return 浮点。
		 */
		getNumber(index:number):number;

		/*
		 * 设置浮点。
		 * @param index shader索引。
		 * @param value 浮点。
		 */
		setNumber(index:number,value:number):void;

		/*
		 * 获取Vector2向量。
		 * @param index shader索引。
		 * @return Vector2向量。
		 */
		getVector2(index:number):laya.d3.math.Vector2;

		/*
		 * 设置Vector2向量。
		 * @param index shader索引。
		 * @param value Vector2向量。
		 */
		setVector2(index:number,value:laya.d3.math.Vector2):void;

		/*
		 * 获取Vector3向量。
		 * @param index shader索引。
		 * @return Vector3向量。
		 */
		getVector3(index:number):laya.d3.math.Vector3;

		/*
		 * 设置Vector3向量。
		 * @param index shader索引。
		 * @param value Vector3向量。
		 */
		setVector3(index:number,value:laya.d3.math.Vector3):void;

		/*
		 * 获取颜色。
		 * @param index shader索引。
		 * @return 颜色向量。
		 */
		getVector(index:number):laya.d3.math.Vector4;

		/*
		 * 设置向量。
		 * @param index shader索引。
		 * @param value 向量。
		 */
		setVector(index:number,value:laya.d3.math.Vector4):void;

		/*
		 * 获取四元数。
		 * @param index shader索引。
		 * @return 四元。
		 */
		getQuaternion(index:number):laya.d3.math.Quaternion;

		/*
		 * 设置四元数。
		 * @param index shader索引。
		 * @param value 四元数。
		 */
		setQuaternion(index:number,value:laya.d3.math.Quaternion):void;

		/*
		 * 获取矩阵。
		 * @param index shader索引。
		 * @return 矩阵。
		 */
		getMatrix4x4(index:number):laya.d3.math.Matrix4x4;

		/*
		 * 设置矩阵。
		 * @param index shader索引。
		 * @param value 矩阵。
		 */
		setMatrix4x4(index:number,value:laya.d3.math.Matrix4x4):void;

		/*
		 * 获取Buffer。
		 * @param index shader索引。
		 * @return 
		 */
		getBuffer(shaderIndex:number):Float32Array;

		/*
		 * 设置Buffer。
		 * @param index shader索引。
		 * @param value buffer数据。
		 */
		setBuffer(index:number,value:Float32Array):void;

		/*
		 * 设置纹理。
		 * @param index shader索引。
		 * @param value 纹理。
		 */
		setTexture(index:number,value:laya.resource.BaseTexture):void;

		/*
		 * 获取纹理。
		 * @param index shader索引。
		 * @return 纹理。
		 */
		getTexture(index:number):laya.resource.BaseTexture;

		/*
		 * 设置Attribute。
		 * @param index shader索引。
		 * @param value 纹理。
		 */
		setAttribute(index:number,value:Int32Array):void;

		/*
		 * 获取Attribute。
		 * @param index shader索引。
		 * @return 纹理。
		 */
		getAttribute(index:number):any[];

		/*
		 * 获取长度。
		 * @return 长度。
		 */
		getLength():number;

		/*
		 * 设置长度。
		 * @param 长度 。
		 */
		setLength(value:number):void;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneTo(destObject:any):void;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		clone():any;

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		cloneToForNative(destObject:any):void;
		needRenewArrayBufferForNative(index:number):void;
		getDataForNative():any[];
		setReferenceForNative(value:any):number;
		static setRuntimeValueMode(bReference:boolean):void;
		clearRuntimeCopyArray():void;
	}

}

declare module laya.d3.shader {
	class ShaderDefines  {

		/*
		 */

		constructor(superDefines?:ShaderDefines);
		registerDefine(name:string):number;
	}

}

declare module laya.d3.shader {

	/*
	 * <code>ShaderPass</code> 类用于实现ShaderPass。
	 */
	class ShaderPass extends laya.webgl.utils.ShaderCompile  {

		/*
		 * 获取渲染状态。
		 * @return 渲染状态。
		 */
		readonly renderState:laya.d3.core.material.RenderState;

		constructor(owner:laya.d3.shader.SubShader,vs:string,ps:string,stateMap:any);

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _compileToTree(parent:laya.webgl.utils.ShaderNode,lines:any[],start:number,includefiles:any[],defs:any):void;
	}

}

declare module laya.d3.shader {

	/*
	 * <code>SubShader</code> 类用于创建SubShader。
	 */
	class SubShader  {

		/*
		 * 创建一个 <code>SubShader</code> 实例。
		 * @param attributeMap 顶点属性表。
		 * @param uniformMap uniform属性表。
		 * @param spriteDefines spriteDefines 精灵宏定义。
		 * @param materialDefines materialDefines 材质宏定义。
		 */

		constructor(attributeMap:any,uniformMap:any,spriteDefines?:laya.d3.shader.ShaderDefines,materialDefines?:laya.d3.shader.ShaderDefines);

		/*
		 * 通过名称获取宏定义值。
		 * @param name 名称。
		 * @return 宏定义值。
		 */
		getMaterialDefineByName(name:string):number;

		/*
		 * 添加标记。
		 * @param key 标记键。
		 * @param value 标记值。
		 */
		setFlag(key:string,value:string):void;

		/*
		 * 获取标记值。
		 * @return key 标记键。
		 */
		getFlag(key:string):string;

		/*
		 * 添加着色器Pass
		 * @param vs 
		 * @param ps 
		 * @param stateMap 
		 */
		addShaderPass(vs:string,ps:string,stateMap?:any):laya.d3.shader.ShaderPass;
	}

}

declare module laya.d3.shadowMap {

	/*
	 * ...
	 * @author ...
	 */
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

		/*
		 * 计算两个矩阵的乘法
		 * @param left left矩阵
		 * @param right right矩阵
		 * @param out 输出矩阵
		 */
		static multiplyMatrixOutFloat32Array(left:laya.d3.math.Matrix4x4,right:laya.d3.math.Matrix4x4,out:Float32Array):void;
		setShadowMapTextureSize(size:number):void;
		disposeAllRenderTarget():void;
	}

}

declare module laya.d3.text {

	/*
	 * <code>TextMesh</code> 类用于创建文本网格。
	 */
	class TextMesh  {
		private static _indexBuffer:any;
		private _vertices:any;
		private _vertexBuffer:any;
		private _text:any;
		private _fontSize:any;
		private _color:any;

		/*
		 * 获取文本。
		 * @return 文本。
		 */

		/*
		 * 设置文本。
		 * @param value 文本。
		 */
		text:string;

		/*
		 * 获取字体尺寸。
		 * @param value 字体尺寸。
		 */

		/*
		 * 设置字体储存。
		 * @return 字体尺寸。
		 */
		fontSize:number;

		/*
		 * 获取颜色。
		 * @return 颜色。
		 */

		/*
		 * 设置颜色。
		 * @param 颜色 。
		 */
		color:laya.d3.math.Color;

		/*
		 * 创建一个新的 <code>TextMesh</code> 实例。
		 */

		constructor();
		private _createVertexBuffer:any;
		private _resizeVertexBuffer:any;
		private _addChar:any;
	}

}

declare module laya.d3 {

	/*
	 * <code>Touch</code> 类用于实现触摸描述。
	 */
	class Touch implements laya.resource.ISingletonElement  {

		/*
		 * [实现IListPool接口]
		 */
		private _indexInList:any;

		/*
		 * 获取唯一识别ID。
		 * @return 唯一识别ID。
		 */
		readonly identifier:number;

		/*
		 * 获取触摸点的像素坐标。
		 * @return 触摸点的像素坐标 [只读]。
		 */
		readonly position:laya.d3.math.Vector2;

		/*
		 * [实现ISingletonElement接口]
		 */
		_getIndexInList():number;

		/*
		 * [实现ISingletonElement接口]
		 */
		_setIndexInList(index:number):void;
	}

}

declare module laya.d3.utils {

	/*
	 * <code>Physics</code> 类用于简单物理检测。
	 */
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

		/*
		 * 重力值。
		 */
		static gravity:laya.d3.math.Vector3;

		/*
		 * 创建一个 <code>Physics</code> 实例。
		 */

		constructor();

		/*
		 * 是否忽略两个碰撞器的碰撞检测。
		 * @param collider1 碰撞器一。
		 * @param collider2 碰撞器二。
		 * @param ignore 是否忽略。
		 */
		static setColliderCollision(collider1:laya.d3.physics.PhysicsComponent,collider2:laya.d3.physics.PhysicsComponent,collsion:boolean):void;

		/*
		 * 获取是否忽略两个碰撞器的碰撞检测。
		 * @param collider1 碰撞器一。
		 * @param collider2 碰撞器二。
		 * @return 是否忽略。
		 */
		static getIColliderCollision(collider1:laya.d3.physics.PhysicsComponent,collider2:laya.d3.physics.PhysicsComponent):boolean;
	}

}

declare module laya.d3.utils {

	/*
	 * <code>Picker</code> 类用于创建拾取。
	 */
	class Picker  {
		private static _tempVector30:any;
		private static _tempVector31:any;
		private static _tempVector32:any;
		private static _tempVector33:any;
		private static _tempVector34:any;

		/*
		 * 创建一个 <code>Picker</code> 实例。
		 */

		constructor();

		/*
		 * 计算鼠标生成的射线。
		 * @param point 鼠标位置。
		 * @param viewPort 视口。
		 * @param projectionMatrix 透视投影矩阵。
		 * @param viewMatrix 视图矩阵。
		 * @param world 世界偏移矩阵。
		 * @return out  输出射线。
		 */
		static calculateCursorRay(point:laya.d3.math.Vector2,viewPort:laya.d3.math.Viewport,projectionMatrix:laya.d3.math.Matrix4x4,viewMatrix:laya.d3.math.Matrix4x4,world:laya.d3.math.Matrix4x4,out:laya.d3.math.Ray):void;

		/*
		 * 计算射线和三角形碰撞并返回碰撞距离。
		 * @param ray 射线。
		 * @param vertex1 顶点1。
		 * @param vertex2 顶点2。
		 * @param vertex3 顶点3。
		 * @return 射线距离三角形的距离，返回Number.NaN则不相交。
		 */
		static rayIntersectsTriangle(ray:laya.d3.math.Ray,vertex1:laya.d3.math.Vector3,vertex2:laya.d3.math.Vector3,vertex3:laya.d3.math.Vector3):number;
	}

}

declare module laya.d3.utils {

	/*
	 * <code>Utils3D</code> 类用于创建3D工具。
	 */
	class Scene3DUtils  {
		private static _createSprite3DInstance:any;
		private static _createComponentInstance:any;
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

declare module laya.d3.utils {

	/*
	 * <code>Utils3D</code> 类用于创建3D工具。
	 */
	class Utils3D  {
		private static _tempVector3_0:any;
		private static _tempVector3_1:any;
		private static _tempVector3_2:any;
		private static _tempColor0:any;
		private static _tempArray16_0:any;
		private static _tempArray16_1:any;
		private static _tempArray16_2:any;
		private static _tempArray16_3:any;

		/*
		 * 通过数平移、旋转、缩放值计算到结果矩阵数组,骨骼动画专用。
		 * @param tx left矩阵数组。
		 * @param ty left矩阵数组的偏移。
		 * @param tz right矩阵数组。
		 * @param qx right矩阵数组的偏移。
		 * @param qy 输出矩阵数组。
		 * @param qz 输出矩阵数组的偏移。
		 * @param qw 输出矩阵数组的偏移。
		 * @param sx 输出矩阵数组的偏移。
		 * @param sy 输出矩阵数组的偏移。
		 * @param sz 输出矩阵数组的偏移。
		 * @param outArray 结果矩阵数组。
		 * @param outOffset 结果矩阵数组的偏移。
		 */
		private static _rotationTransformScaleSkinAnimation:any;

		/*
		 * 根据四元数旋转三维向量。
		 * @param source 源三维向量。
		 * @param rotation 旋转四元数。
		 * @param out 输出三维向量。
		 */
		static transformVector3ArrayByQuat(sourceArray:Float32Array,sourceOffset:number,rotation:laya.d3.math.Quaternion,outArray:Float32Array,outOffset:number):void;

		/*
		 * 通过数组数据计算矩阵乘法。
		 * @param leftArray left矩阵数组。
		 * @param leftOffset left矩阵数组的偏移。
		 * @param rightArray right矩阵数组。
		 * @param rightOffset right矩阵数组的偏移。
		 * @param outArray 输出矩阵数组。
		 * @param outOffset 输出矩阵数组的偏移。
		 */
		static mulMatrixByArray(leftArray:Float32Array,leftOffset:number,rightArray:Float32Array,rightOffset:number,outArray:Float32Array,outOffset:number):void;

		/*
		 * 通过数组数据计算矩阵乘法,rightArray和outArray不能为同一数组引用。
		 * @param leftArray left矩阵数组。
		 * @param leftOffset left矩阵数组的偏移。
		 * @param rightArray right矩阵数组。
		 * @param rightOffset right矩阵数组的偏移。
		 * @param outArray 结果矩阵数组。
		 * @param outOffset 结果矩阵数组的偏移。
		 */
		static mulMatrixByArrayFast(leftArray:Float32Array,leftOffset:number,rightArray:Float32Array,rightOffset:number,outArray:Float32Array,outOffset:number):void;

		/*
		 * 通过数组数据计算矩阵乘法,rightArray和outArray不能为同一数组引用。
		 * @param leftArray left矩阵数组。
		 * @param leftOffset left矩阵数组的偏移。
		 * @param rightMatrix right矩阵。
		 * @param outArray 结果矩阵数组。
		 * @param outOffset 结果矩阵数组的偏移。
		 */
		static mulMatrixByArrayAndMatrixFast(leftArray:Float32Array,leftOffset:number,rightMatrix:laya.d3.math.Matrix4x4,outArray:Float32Array,outOffset:number):void;

		/*
		 * 通过数平移、旋转、缩放值计算到结果矩阵数组。
		 * @param tX left矩阵数组。
		 * @param tY left矩阵数组的偏移。
		 * @param tZ right矩阵数组。
		 * @param qX right矩阵数组的偏移。
		 * @param qY 输出矩阵数组。
		 * @param qZ 输出矩阵数组的偏移。
		 * @param qW 输出矩阵数组的偏移。
		 * @param sX 输出矩阵数组的偏移。
		 * @param sY 输出矩阵数组的偏移。
		 * @param sZ 输出矩阵数组的偏移。
		 * @param outArray 结果矩阵数组。
		 * @param outOffset 结果矩阵数组的偏移。
		 */
		static createAffineTransformationArray(tX:number,tY:number,tZ:number,rX:number,rY:number,rZ:number,rW:number,sX:number,sY:number,sZ:number,outArray:Float32Array,outOffset:number):void;

		/*
		 * 通过矩阵转换一个三维向量数组到另外一个归一化的三维向量数组。
		 * @param source 源三维向量所在数组。
		 * @param sourceOffset 源三维向量数组偏移。
		 * @param transform 变换矩阵。
		 * @param result 输出三维向量所在数组。
		 * @param resultOffset 输出三维向量数组偏移。
		 */
		static transformVector3ArrayToVector3ArrayCoordinate(source:Float32Array,sourceOffset:number,transform:laya.d3.math.Matrix4x4,result:Float32Array,resultOffset:number):void;

		/*
		 * 获取URL版本字符。
		 * @param url 
		 * @return 
		 */
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

declare module laya.device.geolocation {

	/*
	 * 使用前可用<code>supported</code>查看浏览器支持。
	 */
	class Geolocation  {
		private static navigator:any;
		private static position:any;

		/*
		 * 由于权限被拒绝造成的地理信息获取失败。
		 */
		static PERMISSION_DENIED:number;

		/*
		 * 由于内部位置源返回了内部错误导致地理信息获取失败。
		 */
		static POSITION_UNAVAILABLE:number;

		/*
		 * 信息获取所用时长超出<code>timeout</code>所设置时长。
		 */
		static TIMEOUT:number;

		/*
		 * 是否支持。
		 */
		static supported:boolean;

		/*
		 * 如果<code>enableHighAccuracy</code>为true，并且设备能够提供一个更精确的位置，则会获取最佳可能的结果。
		 * 请注意,这可能会导致较慢的响应时间或增加电量消耗（如使用GPS）。
		 * 另一方面，如果设置为false，将会得到更快速的响应和更少的电量消耗。
		 * 默认值为false。
		 */
		static enableHighAccuracy:boolean;

		/*
		 * 表示允许设备获取位置的最长时间。默认为Infinity，意味着getCurentPosition()直到位置可用时才会返回信息。
		 */
		static timeout:number;

		/*
		 * 表示可被返回的缓存位置信息的最大时限。
		 * 如果设置为0，意味着设备不使用缓存位置，并且尝试获取实时位置。
		 * 如果设置为Infinity，设备必须返回缓存位置而无论其时限。
		 */
		static maximumAge:number;

		constructor();

		/*
		 * 获取设备当前位置。
		 * @param onSuccess 带有唯一<code>Position</code>参数的回调处理器。
		 * @param onError 可选的。带有错误信息的回调处理器。错误代码为Geolocation.PERMISSION_DENIED、Geolocation.POSITION_UNAVAILABLE和Geolocation.TIMEOUT之一。
		 */
		static getCurrentPosition(onSuccess:laya.utils.Handler,onError?:laya.utils.Handler):void;

		/*
		 * 监视设备当前位置。回调处理器在设备位置改变时被执行。
		 * @param onSuccess 带有唯一<code>Position</code>参数的回调处理器。
		 * @param onError 可选的。带有错误信息的回调处理器。错误代码为Geolocation.PERMISSION_DENIED、Geolocation.POSITION_UNAVAILABLE和Geolocation.TIMEOUT之一。
		 */
		static watchPosition(onSuccess:laya.utils.Handler,onError:laya.utils.Handler):number;

		/*
		 * 移除<code>watchPosition</code>安装的指定处理器。
		 * @param id 
		 */
		static clearWatch(id:number):void;
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

declare module laya.device.media {

	/*
	 * Media用于捕捉摄像头和麦克风。可以捕捉任意之一，或者同时捕捉两者。<code>getCamera</code>前可以使用<code>supported()</code>检查当前浏览器是否支持。
	 * <b>NOTE:</b>
	 * <p>目前Media在移动平台只支持Android，不支持IOS。只可在FireFox完整地使用，Chrome测试时无法捕捉视频。</p>
	 */
	class Media  {

		constructor();

		/*
		 * 检查浏览器兼容性。
		 */
		static supported():boolean;

		/*
		 * 获取用户媒体。
		 * @param options 简单的可选项可以使<code>{ audio:true, video:true }</code>表示同时捕捉两者。详情见<i>https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia</i>。
		 * @param onSuccess 获取成功的处理器，唯一参数返回媒体的Blob地址，可以将其传给Video。
		 * @param onError 获取失败的处理器，唯一参数是Error。
		 */
		static getMedia(options:any,onSuccess:laya.utils.Handler,onError:laya.utils.Handler):void;
	}

}

declare module laya.device.media {
const enum VIDEOTYPE {
    MP4 = 1,
    OGG = 2,
    CAMERA = 4,
    WEBM = 8
}
	/*
	 * <code>Video</code>将视频显示到Canvas上。<code>Video</code>可能不会在所有浏览器有效。
	 * <p>关于Video支持的所有事件参见：<i>http://www.w3school.com.cn/tags/html_ref_audio_video_dom.asp</i>。</p>
	 * <p>
	 * <b>注意：</b><br/>
	 * 在PC端可以在任何时机调用<code>play()</code>因此，可以在程序开始运行时就使Video开始播放。但是在移动端，只有在用户第一次触碰屏幕后才可以调用play()，所以移动端不可能在程序开始运行时就自动开始播放Video。
	 * </p>
	 * 
	 * <p>MDN Video链接： <i>https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video</i></p>
	 */
	class Video extends laya.display.Sprite  {
		static MP4:number;
		static OGG:number;
		static CAMERA:number;
		static WEBM:number;

		/*
		 * 表示最有可能支持。
		 */
		static SUPPORT_PROBABLY:string;

		/*
		 * 表示可能支持。
		 */
		static SUPPORT_MAYBY:string;

		/*
		 * 表示不支持。
		 */
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

		/*
		 * 设置播放源。
		 * @param url 播放源路径。
		 */
		load(url:string):void;

		/*
		 * 开始播放视频。
		 */
		play():void;

		/*
		 * 暂停视频播放。
		 */
		pause():void;

		/*
		 * 重新加载视频。
		 */
		reload():void;

		/*
		 * 检测是否支持播放指定格式视频。
		 * @param type 参数为Video.MP4 / Video.OGG / Video.WEBM之一。
		 * @return 表示支持的级别。可能的值：<ul><li>"probably"，Video.SUPPORT_PROBABLY - 浏览器最可能支持该音频/视频类型</li><li>"maybe"，Video.SUPPORT_MAYBY - 浏览器也许支持该音频/视频类型</li><li>""，Video.SUPPORT_NO- （空字符串）浏览器不支持该音频/视频类型</li></ul>
		 */
		canPlayType(type:number):string;
		private renderCanvas:any;
		private onDocumentClick:any;

		/*
		 * buffered 属性返回 TimeRanges(JS)对象。TimeRanges 对象表示用户的音视频缓冲范围。缓冲范围指的是已缓冲音视频的时间范围。如果用户在音视频中跳跃播放，会得到多个缓冲范围。
		 * <p>buffered.length返回缓冲范围个数。如获取第一个缓冲范围则是buffered.start(0)和buffered.end(0)。以秒计。</p>
		 * @return TimeRanges(JS)对象
		 */
		readonly buffered:any;

		/*
		 * 获取当前播放源路径。
		 */
		readonly currentSrc:string;

		/*
		 * 设置和获取当前播放头位置。
		 */
		currentTime:number;

		/*
		 * 设置和获取当前音量。
		 */
		volume:number;

		/*
		 * 表示视频元素的就绪状态：
		 * <ul>
		 * <li>0 = HAVE_NOTHING - 没有关于音频/视频是否就绪的信息</li>
		 * <li>1 = HAVE_METADATA - 关于音频/视频就绪的元数据</li>
		 * <li>2 = HAVE_CURRENT_DATA - 关于当前播放位置的数据是可用的，但没有足够的数据来播放下一帧/毫秒</li>
		 * <li>3 = HAVE_FUTURE_DATA - 当前及至少下一帧的数据是可用的</li>
		 * <li>4 = HAVE_ENOUGH_DATA - 可用数据足以开始播放</li>
		 * </ul>
		 */
		readonly readyState:any;

		/*
		 * 获取视频源尺寸。ready事件触发后可用。
		 */
		readonly videoWidth:number;
		readonly videoHeight:number;

		/*
		 * 获取视频长度（秒）。ready事件触发后可用。
		 */
		readonly duration:number;

		/*
		 * 返回音频/视频的播放是否已结束
		 */
		readonly ended:boolean;

		/*
		 * 返回表示音频/视频错误状态的 MediaError（JS）对象。
		 */
		readonly error:boolean;

		/*
		 * 设置或返回音频/视频是否应在结束时重新播放。
		 */
		loop:boolean;

		/*
		 * 设置视频的x坐标
		 * @override 
		 */
		x:number;

		/*
		 * 设置视频的y坐标
		 * @override 
		 */
		y:number;

		/*
		 * playbackRate 属性设置或返回音频/视频的当前播放速度。如：
		 * <ul>
		 * <li>1.0 正常速度</li>
		 * <li>0.5 半速（更慢）</li>
		 * <li>2.0 倍速（更快）</li>
		 * <li>-1.0 向后，正常速度</li>
		 * <li>-0.5 向后，半速</li>
		 * </ul>
		 * <p>只有 Google Chrome 和 Safari 支持 playbackRate 属性。</p>
		 */
		playbackRate:number;

		/*
		 * 获取和设置静音状态。
		 */
		muted:boolean;

		/*
		 * 返回视频是否暂停
		 */
		readonly paused:boolean;

		/*
		 * preload 属性设置或返回是否在页面加载后立即加载视频。可赋值如下：
		 * <ul>
		 * <li>auto	指示一旦页面加载，则开始加载视频。</li>
		 * <li>metadata	指示当页面加载后仅加载音频/视频的元数据。</li>
		 * <li>none	指示页面加载后不应加载音频/视频。</li>
		 * </ul>
		 */
		preload:string;

		/*
		 * 参见 <i>http://www.w3school.com.cn/tags/av_prop_seekable.asp</i>。
		 */
		readonly seekable:any;

		/*
		 * seeking 属性返回用户目前是否在音频/视频中寻址。
		 * 寻址中（Seeking）指的是用户在音频/视频中移动/跳跃到新的位置。
		 */
		readonly seeking:boolean;

		/*
		 * @param width 
		 * @param height 
		 * @override 
		 */
		size(width:number,height:number):laya.display.Sprite;

		/*
		 * @override 
		 */
		width:number;

		/*
		 * @override 
		 */
		height:number;

		/*
		 * 销毁内部事件绑定。
		 * @override 
		 */
		destroy(detroyChildren?:boolean):void;
		private syncVideoPosition:any;
	}

}

declare module laya.device.motion {

	/*
	 * 加速度x/y/z的单位均为m/s²。
	 * 在硬件（陀螺仪）不支持的情况下，alpha、beta和gamma值为null。
	 * @author Survivor
	 */
	class AccelerationInfo  {

		/*
		 * x轴上的加速度值。
		 */
		x:number;

		/*
		 * y轴上的加速度值。
		 */
		y:number;

		/*
		 * z轴上的加速度值。
		 */
		z:number;

		constructor();
	}

}

declare module laya.device.motion {

	/*
	 * Accelerator.instance获取唯一的Accelerator引用，请勿调用构造函数。
	 * 
	 * <p>
	 * listen()的回调处理器接受四个参数：
	 * <ol>
	 * <li><b>acceleration</b>: 表示用户给予设备的加速度。</li>
	 * <li><b>accelerationIncludingGravity</b>: 设备受到的总加速度（包含重力）。</li>
	 * <li><b>rotationRate</b>: 设备的自转速率。</li>
	 * <li><b>interval</b>: 加速度获取的时间间隔（毫秒）。</li>
	 * </ol>
	 * </p>
	 * <p>
	 * <b>NOTE</b><br/>
	 * 如，rotationRate的alpha在apple和moz文档中都是z轴旋转角度，但是实测是x轴旋转角度。为了使各属性表示的值与文档所述相同，实际值与其他属性进行了对调。
	 * 其中：
	 * <ul>
	 * <li>alpha使用gamma值。</li>
	 * <li>beta使用alpha值。</li>
	 * <li>gamma使用beta。</li>
	 * </ul>
	 * 目前孰是孰非尚未可知，以此为注。
	 * </p>
	 */
	class Accelerator extends laya.events.EventDispatcher  {

		/*
		 * Accelerator的唯一引用。
		 */
		private static _instance:any;
		static readonly instance:Accelerator;
		private static acceleration:any;
		private static accelerationIncludingGravity:any;
		private static rotationRate:any;

		constructor(singleton:number);

		/*
		 * 侦听加速器运动。
		 * @param observer 回调函数接受4个参数，见类说明。
		 * @override 
		 */
		on(type:string,caller:any,listener:Function,args?:any[]):laya.events.EventDispatcher;

		/*
		 * 取消侦听加速器。
		 * @param handle 侦听加速器所用处理器。
		 * @override 
		 */
		off(type:string,caller:any,listener:Function,onceOnly?:boolean):laya.events.EventDispatcher;
		private onDeviceOrientationChange:any;
		private static transformedAcceleration:any;

		/*
		 * 把加速度值转换为视觉上正确的加速度值。依赖于Browser.window.orientation，可能在部分低端机无效。
		 * @param acceleration 
		 * @return 
		 */
		static getTransformedAcceleration(acceleration:laya.device.motion.AccelerationInfo):laya.device.motion.AccelerationInfo;
	}

}

declare module laya.device.motion {

	/*
	 * 使用Gyroscope.instance获取唯一的Gyroscope引用，请勿调用构造函数。
	 * 
	 * <p>
	 * listen()的回调处理器接受两个参数：
	 * <code>function onOrientationChange(absolute:Boolean, info:RotationInfo):void</code>
	 * <ol>
	 * <li><b>absolute</b>: 指示设备是否可以提供绝对方位数据（指向地球坐标系），或者设备决定的任意坐标系。关于坐标系参见<i>https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Orientation_and_motion_data_explained</i>。</li>
	 * <li><b>info</b>: <code>RotationInfo</code>类型参数，保存设备的旋转值。</li>
	 * </ol>
	 * </p>
	 * 
	 * <p>
	 * 浏览器兼容性参见：<i>http://caniuse.com/#search=deviceorientation</i>
	 * </p>
	 */
	class Gyroscope extends laya.events.EventDispatcher  {
		private static info:any;

		/*
		 * Gyroscope的唯一引用。
		 */
		private static _instance:any;
		static readonly instance:Gyroscope;

		constructor(singleton:number);

		/*
		 * 监视陀螺仪运动。
		 * @param observer 回调函数接受一个Boolean类型的<code>absolute</code>和<code>GyroscopeInfo</code>类型参数。
		 * @override 
		 */
		on(type:string,caller:any,listener:Function,args?:any[]):laya.events.EventDispatcher;

		/*
		 * 取消指定处理器对陀螺仪的监视。
		 * @param observer 
		 * @override 
		 */
		off(type:string,caller:any,listener:Function,onceOnly?:boolean):laya.events.EventDispatcher;
		private onDeviceOrientationChange:any;
	}

}

declare module laya.device.motion {

	/*
	 * 保存旋转信息的类。请勿修改本类的属性。
	 * @author Survivor
	 */
	class RotationInfo  {

		/*
		 * <p>
		 * 指示设备是否可以提供绝对方位数据（指向地球坐标系），或者设备决定的任意坐标系。
		 * 关于坐标系参见<i>https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Orientation_and_motion_data_explained</i>。
		 * </p>
		 * 需要注意的是，IOS环境下，该值始终为false。即使如此，你依旧可以从<code>alpha</code>中取得正确的值。
		 */
		absolute:boolean;

		/*
		 * Z轴旋转角度，其值范围从0至360。
		 * 若<code>absolute</code>为true或者在IOS中，alpha值是从北方到当前设备方向的角度值。
		 */
		alpha:number;

		/*
		 * X轴旋转角度, 其值范围从-180至180。代表设备从前至后的运动。
		 */
		beta:number;

		/*
		 * Y轴旋转角度，其值范围从-90至90。代表设备从左至右的运动。
		 */
		gamma:number;

		/*
		 * 罗盘数据的精确度（角度）。仅IOS可用。
		 */
		compassAccuracy:number;

		constructor();
	}

}

declare module laya.device {

	/*
	 * Shake只能在支持此操作的设备上有效。
	 */
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

		/*
		 * 开始响应设备摇晃。
		 * @param throushold 响应的瞬时速度阈值，轻度摇晃的值约在5~10间。
		 * @param timeout 设备摇晃的响应间隔时间。
		 * @param callback 在设备摇晃触发时调用的处理器。
		 */
		start(throushold:number,interval:number):void;

		/*
		 * 停止响应设备摇晃。
		 */
		stop():void;
		private onShake:any;
		private isShaked:any;
	}

}

declare module laya.display {

	/*
	 * 动画播放完毕后调度。
	 * @eventType Event.COMPLETE
	 */

	/*
	 * 播放到某标签后调度。
	 * @eventType Event.LABEL
	 */

	/*
	 * <p> <code>Animation</code> 是Graphics动画类。实现了基于Graphics的动画创建、播放、控制接口。</p>
	 * <p>本类使用了动画模版缓存池，它以一定的内存开销来节省CPU开销，当相同的动画模版被多次使用时，相比于每次都创建新的动画模版，使用动画模版缓存池，只需创建一次，缓存之后多次复用，从而节省了动画模版创建的开销。</p>
	 * <p>动画模版缓存池，以key-value键值对存储，key可以自定义，也可以从指定的配置文件中读取，value为对应的动画模版，是一个Graphics对象数组，每个Graphics对象对应一个帧图像，动画的播放实质就是定时切换Graphics对象。</p>
	 * <p>使用set source、loadImages(...)、loadAtlas(...)、loadAnimation(...)方法可以创建动画模版。使用play(...)可以播放指定动画。</p>
	 * @example <caption>以下示例代码，创建了一个 <code>Text</code> 实例。</caption>package{import laya.display.Animation;import laya.net.Loader;import laya.utils.Handler;public class Animation_Example{public function Animation_Example(){Laya.init(640, 800);//设置游戏画布宽高、渲染模式。Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。init();//初始化}private function init():void{var animation:Animation = new Animation();//创建一个 Animation 类的实例对象 animation 。animation.loadAtlas("resource/ani/fighter.json");//加载图集并播放animation.x = 200;//设置 animation 对象的属性 x 的值，用于控制 animation 对象的显示位置。animation.y = 200;//设置 animation 对象的属性 x 的值，用于控制 animation 对象的显示位置。animation.interval = 50;//设置 animation 对象的动画播放间隔时间，单位：毫秒。animation.play();//播放动画。Laya.stage.addChild(animation);//将 animation 对象添加到显示列表。}}}
	 * @example Animation_Example();function Animation_Example(){    Laya.init(640, 800);//设置游戏画布宽高、渲染模式。    Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。    init();//初始化}function init(){    var animation = new Laya.Animation();//创建一个 Animation 类的实例对象 animation 。    animation.loadAtlas("resource/ani/fighter.json");//加载图集并播放    animation.x = 200;//设置 animation 对象的属性 x 的值，用于控制 animation 对象的显示位置。    animation.y = 200;//设置 animation 对象的属性 x 的值，用于控制 animation 对象的显示位置。    animation.interval = 50;//设置 animation 对象的动画播放间隔时间，单位：毫秒。    animation.play();//播放动画。    Laya.stage.addChild(animation);//将 animation 对象添加到显示列表。}
	 * @example import Animation = laya.display.Animation;class Animation_Example {    constructor() {        Laya.init(640, 800);//设置游戏画布宽高、渲染模式。        Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。        this.init();    }    private init(): void {        var animation:Animation = new Laya.Animation();//创建一个 Animation 类的实例对象 animation 。        animation.loadAtlas("resource/ani/fighter.json");//加载图集并播放        animation.x = 200;//设置 animation 对象的属性 x 的值，用于控制 animation 对象的显示位置。        animation.y = 200;//设置 animation 对象的属性 x 的值，用于控制 animation 对象的显示位置。        animation.interval = 50;//设置 animation 对象的动画播放间隔时间，单位：毫秒。        animation.play();//播放动画。        Laya.stage.addChild(animation);//将 animation 对象添加到显示列表。    }}new Animation_Example();
	 */
	class Animation extends laya.display.AnimationBase  {

		/*
		 * <p>动画模版缓存池，以key-value键值对存储，key可以自定义，也可以从指定的配置文件中读取，value为对应的动画模版，是一个Graphics对象数组，每个Graphics对象对应一个帧图像，动画的播放实质就是定时切换Graphics对象。</p>
		 * <p>使用loadImages(...)、loadAtlas(...)、loadAnimation(...)、set source方法可以创建动画模版。使用play(...)可以播放指定动画。</p>
		 */
		static framesMap:any;

		/*
		 * @private 
		 */
		protected _frames:any[];

		/*
		 * @private 
		 */
		protected _url:string;

		/*
		 * 创建一个新的 <code>Animation</code> 实例。
		 */

		constructor();

		/*
		 * @inheritDoc 
		 * @override 
		 */
		destroy(destroyChild?:boolean):void;

		/*
		 * <p>开始播放动画。会在动画模版缓存池中查找key值为name的动画模版，存在则用此动画模版初始化当前序列帧， 如果不存在，则使用当前序列帧。</p>
		 * <p>play(...)方法被设计为在创建实例后的任何时候都可以被调用，调用后就处于播放状态，当相应的资源加载完毕、调用动画帧填充方法(set frames)或者将实例显示在舞台上时，会判断是否处于播放状态，如果是，则开始播放。</p>
		 * <p>配合wrapMode属性，可设置动画播放顺序类型。</p>
		 * @param start （可选）指定动画播放开始的索引(int)或帧标签(String)。帧标签可以通过addLabel(...)和removeLabel(...)进行添加和删除。
		 * @param loop （可选）是否循环播放。
		 * @param name （可选）动画模板在动画模版缓存池中的key，也可认为是动画名称。如果name为空，则播放当前动画序列帧；如果不为空，则在动画模版缓存池中寻找key值为name的动画模版，如果存在则用此动画模版初始化当前序列帧并播放，如果不存在，则仍然播放当前动画序列帧；如果没有当前动画的帧数据，则不播放，但该实例仍然处于播放状态。
		 * @override 
		 */
		play(start?:any,loop?:boolean,name?:string):void;

		/*
		 * @private 
		 */
		protected _setFramesFromCache(name:string,showWarn?:boolean):boolean;

		/*
		 * @private 
		 */
		private _copyLabels:any;

		/*
		 * @private 
		 * @override 
		 */
		protected _frameLoop():void;

		/*
		 * @private 
		 * @override 
		 */
		protected _displayToIndex(value:number):void;

		/*
		 * 当前动画的帧图像数组。本类中，每个帧图像是一个Graphics对象，而动画播放就是定时切换Graphics对象的过程。
		 */
		frames:any[];

		/*
		 * <p>动画数据源。</p>
		 * <p>类型如下：<br/>
		 * 1. LayaAir IDE动画文件路径：使用此类型需要预加载所需的图集资源，否则会创建失败，如果不想预加载或者需要创建完毕的回调，请使用loadAnimation(...)方法；<br/>
		 * 2. 图集路径：使用此类型创建的动画模版不会被缓存到动画模版缓存池中，如果需要缓存或者创建完毕的回调，请使用loadAtlas(...)方法；<br/>
		 * 3. 图片路径集合：使用此类型创建的动画模版不会被缓存到动画模版缓存池中，如果需要缓存，请使用loadImages(...)方法。</p>
		 * @param value 数据源。比如：图集："xx/a1.atlas"；图片集合："a1.png,a2.png,a3.png"；LayaAir IDE动画"xx/a1.ani"。
		 */
		source:string;

		/*
		 * 设置自动播放的动画名称，在LayaAir IDE中可以创建的多个动画组成的动画集合，选择其中一个动画名称进行播放。
		 */
		autoAnimation:string;

		/*
		 * 是否自动播放，默认为false。如果设置为true，则动画被创建并添加到舞台后自动播放。
		 */
		autoPlay:boolean;

		/*
		 * 停止动画播放，并清理对象属性。之后可存入对象池，方便对象复用。
		 * @override 
		 */
		clear():laya.display.AnimationBase;

		/*
		 * <p>根据指定的动画模版初始化当前动画序列帧。选择动画模版的过程如下：1. 动画模版缓存池中key为cacheName的动画模版；2. 如果不存在，则加载指定的图片集合并创建动画模版。注意：只有指定不为空的cacheName，才能将创建好的动画模版以此为key缓存到动画模版缓存池，否则不进行缓存。</p>
		 * <p>动画模版缓存池是以一定的内存开销来节省CPU开销，当相同的动画模版被多次使用时，相比于每次都创建新的动画模版，使用动画模版缓存池，只需创建一次，缓存之后多次复用，从而节省了动画模版创建的开销。</p>
		 * <p>因为返回值为Animation对象本身，所以可以使用如下语法：loadImages(...).loadImages(...).play(...);。</p>
		 * @param urls 图片路径集合。需要创建动画模版时，会以此为数据源。参数形如：[url1,url2,url3,...]。
		 * @param cacheName （可选）动画模板在动画模版缓存池中的key。如果此参数不为空，表示使用动画模版缓存池。如果动画模版缓存池中存在key为cacheName的动画模版，则使用此模版。否则，创建新的动画模版，如果cacheName不为空，则以cacheName为key缓存到动画模版缓存池中，如果cacheName为空，不进行缓存。
		 * @return 返回Animation对象本身。
		 */
		loadImages(urls:any[],cacheName?:string):Animation;

		/*
		 * <p>根据指定的动画模版初始化当前动画序列帧。选择动画模版的过程如下：1. 动画模版缓存池中key为cacheName的动画模版；2. 如果不存在，则加载指定的图集并创建动画模版。</p>
		 * <p>注意：只有指定不为空的cacheName，才能将创建好的动画模版以此为key缓存到动画模版缓存池，否则不进行缓存。</p>
		 * <p>动画模版缓存池是以一定的内存开销来节省CPU开销，当相同的动画模版被多次使用时，相比于每次都创建新的动画模版，使用动画模版缓存池，只需创建一次，缓存之后多次复用，从而节省了动画模版创建的开销。</p>
		 * <p>因为返回值为Animation对象本身，所以可以使用如下语法：loadAtlas(...).loadAtlas(...).play(...);。</p>
		 * @param url 图集路径。需要创建动画模版时，会以此为数据源。
		 * @param loaded （可选）使用指定图集初始化动画完毕的回调。
		 * @param cacheName （可选）动画模板在动画模版缓存池中的key。如果此参数不为空，表示使用动画模版缓存池。如果动画模版缓存池中存在key为cacheName的动画模版，则使用此模版。否则，创建新的动画模版，如果cacheName不为空，则以cacheName为key缓存到动画模版缓存池中，如果cacheName为空，不进行缓存。
		 * @return 返回动画本身。
		 */
		loadAtlas(url:string,loaded?:laya.utils.Handler,cacheName?:string):Animation;

		/*
		 * <p>加载并解析由LayaAir IDE制作的动画文件，此文件中可能包含多个动画。默认帧率为在IDE中设计的帧率，如果调用过set interval，则使用此帧间隔对应的帧率。加载后创建动画模版，并缓存到动画模版缓存池，key "url#动画名称" 对应相应动画名称的动画模板，key "url#" 对应动画模版集合的默认动画模版。</p>
		 * <p>注意：如果调用本方法前，还没有预加载动画使用的图集，请将atlas参数指定为对应的图集路径，否则会导致动画创建失败。</p>
		 * <p>动画模版缓存池是以一定的内存开销来节省CPU开销，当相同的动画模版被多次使用时，相比于每次都创建新的动画模版，使用动画模版缓存池，只需创建一次，缓存之后多次复用，从而节省了动画模版创建的开销。</p>
		 * <p>因为返回值为Animation对象本身，所以可以使用如下语法：loadAnimation(...).loadAnimation(...).play(...);。</p>
		 * @param url 动画文件路径。可由LayaAir IDE创建并发布。
		 * @param loaded （可选）使用指定动画资源初始化动画完毕的回调。
		 * @param atlas （可选）动画用到的图集地址（可选）。
		 * @return 返回动画本身。
		 */
		loadAnimation(url:string,loaded?:laya.utils.Handler,atlas?:string):Animation;

		/*
		 * @private 
		 */
		private _loadAnimationData:any;

		/*
		 * <p>创建动画模板，多个动画可共享同一份动画模板，而不必每次都创建一份新的，从而节省创建Graphics集合的开销。</p>
		 * @param url 图集路径或者图片路径数组。如果是图集路径，需要相应图集已经被预加载，如果没有预加载，会导致创建失败。
		 * @param name 动画模板在动画模版缓存池中的key。如果不为空，则以此为key缓存动画模板，否则不缓存。
		 * @return 动画模板。
		 */
		static createFrames(url:string|string[],name:string):any[];

		/*
		 * <p>从动画模版缓存池中清除指定key值的动画数据。</p>
		 * <p>开发者在调用创建动画模版函数时，可以手动指定此值。而如果是由LayaAir IDE创建的动画集，解析后的key格式为："url#"：表示动画集的默认动画模版，如果以此值为参数，会清除整个动画集数据；"url#aniName"：表示相应名称的动画模版。</p>
		 * @param key 动画模板在动画模版缓存池中的key。
		 */
		static clearCache(key:string):void;
	}

}

declare module laya.display {

	/*
	 * 动画播放完毕后调度。
	 * @eventType Event.COMPLETE
	 */

	/*
	 * 播放到某标签后调度。
	 * @eventType Event.LABEL
	 */

	/*
	 * <p>动画基类，提供了基础的动画播放控制方法和帧标签事件相关功能。</p>
	 * <p>可以继承此类，但不要直接实例化此类，因为有些方法需要由子类实现。</p>
	 */
	class AnimationBase extends laya.display.Sprite  {

		/*
		 * 动画播放顺序类型：正序播放。
		 */
		static WRAP_POSITIVE:number;

		/*
		 * 动画播放顺序类型：逆序播放。
		 */
		static WRAP_REVERSE:number;

		/*
		 * 动画播放顺序类型：pingpong播放(当按指定顺序播放完结尾后，如果继续播放，则会改变播放顺序)。
		 */
		static WRAP_PINGPONG:number;

		/*
		 * 是否循环播放，调用play(...)方法时，会将此值设置为指定的参数值。
		 */
		loop:boolean;

		/*
		 * 播放顺序类型：AnimationBase.WRAP_POSITIVE为正序播放(默认值)，AnimationBase.WRAP_REVERSE为倒序播放，AnimationBase.WRAP_PINGPONG为pingpong播放(当按指定顺序播放完结尾后，如果继续播发，则会改变播放顺序)。
		 */
		wrapMode:number;

		/*
		 * @private 播放间隔(单位：毫秒)。
		 */
		protected _interval:number;

		/*
		 * @private 
		 */
		protected _index:number;

		/*
		 * @private 
		 */
		protected _count:number;

		/*
		 * @private 
		 */
		protected _isPlaying:boolean;

		/*
		 * @private 
		 */
		protected _labels:any;

		/*
		 * 是否是逆序播放
		 */
		protected _isReverse:boolean;

		/*
		 * @private 
		 */
		protected _frameRateChanged:boolean;

		/*
		 * @private 
		 */
		protected _actionName:string;

		/*
		 * @private 
		 */
		private _controlNode:any;

		/*
		 * 可以继承此类，但不要直接实例化此类，因为有些方法需要由子类实现。
		 */

		constructor();

		/*
		 * <p>开始播放动画。play(...)方法被设计为在创建实例后的任何时候都可以被调用，当相应的资源加载完毕、调用动画帧填充方法(set frames)或者将实例显示在舞台上时，会判断是否正在播放中，如果是，则进行播放。</p>
		 * <p>配合wrapMode属性，可设置动画播放顺序类型。</p>
		 * @param start （可选）指定动画播放开始的索引(int)或帧标签(String)。帧标签可以通过addLabel(...)和removeLabel(...)进行添加和删除。
		 * @param loop （可选）是否循环播放。
		 * @param name （可选）动画名称。
		 */
		play(start?:any,loop?:boolean,name?:string):void;

		/*
		 * <p>动画播放的帧间隔时间(单位：毫秒)。默认值依赖于Config.animationInterval=50，通过Config.animationInterval可以修改默认帧间隔时间。</p>
		 * <p>要想为某动画设置独立的帧间隔时间，可以使用set interval，注意：如果动画正在播放，设置后会重置帧循环定时器的起始时间为当前时间，也就是说，如果频繁设置interval，会导致动画帧更新的时间间隔会比预想的要慢，甚至不更新。</p>
		 */
		interval:number;

		/*
		 * @private 
		 */
		protected _getFrameByLabel(label:string):number;

		/*
		 * @private 
		 */
		protected _frameLoop():void;

		/*
		 * @private 
		 */
		protected _resumePlay():void;

		/*
		 * 停止动画播放。
		 */
		stop():void;

		/*
		 * 是否正在播放中。
		 */
		readonly isPlaying:boolean;

		/*
		 * 增加一个帧标签到指定索引的帧上。当动画播放到此索引的帧时会派发Event.LABEL事件，派发事件是在完成当前帧画面更新之后。
		 * @param label 帧标签名称
		 * @param index 帧索引
		 */
		addLabel(label:string,index:number):void;

		/*
		 * 删除指定的帧标签。
		 * @param label 帧标签名称。注意：如果为空，则删除所有帧标签！
		 */
		removeLabel(label:string):void;

		/*
		 * @private 
		 */
		private _removeLabelFromList:any;

		/*
		 * 将动画切换到指定帧并停在那里。
		 * @param position 帧索引或帧标签
		 */
		gotoAndStop(position:any):void;

		/*
		 * 动画当前帧的索引。
		 */
		index:number;

		/*
		 * @private 显示到某帧
		 * @param value 帧索引
		 */
		protected _displayToIndex(value:number):void;

		/*
		 * 当前动画中帧的总数。
		 */
		readonly count:number;

		/*
		 * 停止动画播放，并清理对象属性。之后可存入对象池，方便对象复用。
		 * @return 返回对象本身
		 */
		clear():AnimationBase;
	}

}

declare module laya.display {

	/*
	 * <code>BitmapFont</code> 是位图字体类，用于定义位图字体信息。
	 * 字体制作及使用方法，请参考文章
	 * @see http://ldc2.layabox.com/doc/?nav=ch-js-1-2-5
	 */
	class BitmapFont  {
		private _texture:any;
		private _fontCharDic:any;
		private _fontWidthMap:any;
		private _complete:any;
		private _path:any;
		private _maxWidth:any;
		private _spaceWidth:any;
		private _padding:any;

		/*
		 * 当前位图字体字号，使用时，如果字号和设置不同，并且autoScaleSize=true，则按照设置字号比率进行缩放显示。
		 */
		fontSize:number;

		/*
		 * 表示是否根据实际使用的字体大小缩放位图字体大小。
		 */
		autoScaleSize:boolean;

		/*
		 * 字符间距（以像素为单位）。
		 */
		letterSpacing:number;

		/*
		 * 通过指定位图字体文件路径，加载位图字体文件，加载完成后会自动解析。
		 * @param path 位图字体文件的路径。
		 * @param complete 加载并解析完成的回调。
		 */
		loadFont(path:string,complete:laya.utils.Handler):void;

		/*
		 * @private 
		 */
		private _onLoaded:any;

		/*
		 * 解析字体文件。
		 * @param xml 字体文件XML。
		 * @param texture 字体的纹理。
		 */
		parseFont(xml:XMLDocument,texture:laya.resource.Texture):void;

		/*
		 * 解析字体文件。
		 * @param xml 字体文件XML。
		 * @param texture 字体的纹理。
		 */
		parseFont2(xml:XMLDocument,texture:laya.resource.Texture):void;

		/*
		 * 获取指定字符的字体纹理对象。
		 * @param char 字符。
		 * @return 指定的字体纹理对象。
		 */
		getCharTexture(char:string):laya.resource.Texture;

		/*
		 * 销毁位图字体，调用Text.unregisterBitmapFont 时，默认会销毁。
		 */
		destroy():void;

		/*
		 * 设置空格的宽（如果字体库有空格，这里就可以不用设置了）。
		 * @param spaceWidth 宽度，单位为像素。
		 */
		setSpaceWidth(spaceWidth:number):void;

		/*
		 * 获取指定字符的宽度。
		 * @param char 字符。
		 * @return 宽度。
		 */
		getCharWidth(char:string):number;

		/*
		 * 获取指定文本内容的宽度。
		 * @param text 文本内容。
		 * @return 宽度。
		 */
		getTextWidth(text:string):number;

		/*
		 * 获取最大字符宽度。
		 */
		getMaxWidth():number;

		/*
		 * 获取最大字符高度。
		 */
		getMaxHeight():number;
	}

}

declare module laya.display.cmd {

	/*
	 * 透明命令
	 */
	class AlphaCmd  {
		static ID:string;

		/*
		 * 透明度
		 */
		alpha:number;

		/*
		 * @private 
		 */
		static create(alpha:number):AlphaCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 裁剪命令
	 */
	class ClipRectCmd  {
		static ID:string;

		/*
		 * X 轴偏移量。
		 */
		x:number;

		/*
		 * Y 轴偏移量。
		 */
		y:number;

		/*
		 * 宽度。
		 */
		width:number;

		/*
		 * 高度。
		 */
		height:number;

		/*
		 * @private 
		 */
		static create(x:number,y:number,width:number,height:number):ClipRectCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 绘制圆形
	 */
	class DrawCircleCmd  {
		static ID:string;

		/*
		 * 圆点X 轴位置。
		 */
		x:number;

		/*
		 * 圆点Y 轴位置。
		 */
		y:number;

		/*
		 * 半径。
		 */
		radius:number;

		/*
		 * 填充颜色，或者填充绘图的渐变对象。
		 */
		fillColor:any;

		/*
		 * （可选）边框颜色，或者填充绘图的渐变对象。
		 */
		lineColor:any;

		/*
		 * （可选）边框宽度。
		 */
		lineWidth:number;

		/*
		 * @private 
		 */
		vid:number;

		/*
		 * @private 
		 */
		static create(x:number,y:number,radius:number,fillColor:any,lineColor:any,lineWidth:number,vid:number):DrawCircleCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 绘制曲线
	 */
	class DrawCurvesCmd  {
		static ID:string;

		/*
		 * 开始绘制的 X 轴位置。
		 */
		x:number;

		/*
		 * 开始绘制的 Y 轴位置。
		 */
		y:number;

		/*
		 * 线段的点集合，格式[controlX, controlY, anchorX, anchorY...]。
		 */
		points:any[];

		/*
		 * 线段颜色，或者填充绘图的渐变对象。
		 */
		lineColor:any;

		/*
		 * （可选）线段宽度。
		 */
		lineWidth:number;

		/*
		 * @private 
		 */
		static create(x:number,y:number,points:any[],lineColor:any,lineWidth:number):DrawCurvesCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 绘制图片
	 */
	class DrawImageCmd  {
		static ID:string;

		/*
		 * 纹理。
		 */
		texture:laya.resource.Texture;

		/*
		 * （可选）X轴偏移量。
		 */
		x:number;

		/*
		 * （可选）Y轴偏移量。
		 */
		y:number;

		/*
		 * （可选）宽度。
		 */
		width:number;

		/*
		 * （可选）高度。
		 */
		height:number;

		/*
		 * @private 
		 */
		static create(texture:laya.resource.Texture,x:number,y:number,width:number,height:number):DrawImageCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 绘制单条曲线
	 */
	class DrawLineCmd  {
		static ID:string;

		/*
		 * X轴开始位置。
		 */
		fromX:number;

		/*
		 * Y轴开始位置。
		 */
		fromY:number;

		/*
		 * X轴结束位置。
		 */
		toX:number;

		/*
		 * Y轴结束位置。
		 */
		toY:number;

		/*
		 * 颜色。
		 */
		lineColor:string;

		/*
		 * （可选）线条宽度。
		 */
		lineWidth:number;

		/*
		 * @private 
		 */
		vid:number;

		/*
		 * @private 
		 */
		static create(fromX:number,fromY:number,toX:number,toY:number,lineColor:string,lineWidth:number,vid:number):DrawLineCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 绘制连续曲线
	 */
	class DrawLinesCmd  {
		static ID:string;

		/*
		 * 开始绘制的X轴位置。
		 */
		x:number;

		/*
		 * 开始绘制的Y轴位置。
		 */
		y:number;

		/*
		 * 线段的点集合。格式:[x1,y1,x2,y2,x3,y3...]。
		 */
		points:any[];

		/*
		 * 线段颜色，或者填充绘图的渐变对象。
		 */
		lineColor:any;

		/*
		 * （可选）线段宽度。
		 */
		lineWidth:number;

		/*
		 * @private 
		 */
		vid:number;

		/*
		 * @private 
		 */
		static create(x:number,y:number,points:any[],lineColor:any,lineWidth:number,vid:number):DrawLinesCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 绘制粒子
	 * @private 
	 */
	class DrawParticleCmd  {
		static ID:string;
		private _templ:any;

		/*
		 * @private 
		 */
		static create(_temp:any):DrawParticleCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 根据路径绘制矢量图形
	 */
	class DrawPathCmd  {
		static ID:string;

		/*
		 * 开始绘制的 X 轴位置。
		 */
		x:number;

		/*
		 * 开始绘制的 Y 轴位置。
		 */
		y:number;

		/*
		 * 路径集合，路径支持以下格式：[["moveTo",x,y],["lineTo",x,y],["arcTo",x1,y1,x2,y2,r],["closePath"]]。
		 */
		paths:any[];

		/*
		 * （可选）刷子定义，支持以下设置{fillStyle:"#FF0000"}。
		 */
		brush:any;

		/*
		 * （可选）画笔定义，支持以下设置{strokeStyle,lineWidth,lineJoin:"bevel|round|miter",lineCap:"butt|round|square",miterLimit}。
		 */
		pen:any;

		/*
		 * @private 
		 */
		static create(x:number,y:number,paths:any[],brush:any,pen:any):DrawPathCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 绘制扇形
	 */
	class DrawPieCmd  {
		static ID:string;

		/*
		 * 开始绘制的 X 轴位置。
		 */
		x:number;

		/*
		 * 开始绘制的 Y 轴位置。
		 */
		y:number;

		/*
		 * 扇形半径。
		 */
		radius:number;
		private _startAngle:any;
		private _endAngle:any;

		/*
		 * 填充颜色，或者填充绘图的渐变对象。
		 */
		fillColor:any;

		/*
		 * （可选）边框颜色，或者填充绘图的渐变对象。
		 */
		lineColor:any;

		/*
		 * （可选）边框宽度。
		 */
		lineWidth:number;

		/*
		 * @private 
		 */
		vid:number;

		/*
		 * @private 
		 */
		static create(x:number,y:number,radius:number,startAngle:number,endAngle:number,fillColor:any,lineColor:any,lineWidth:number,vid:number):DrawPieCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;

		/*
		 * 开始角度。
		 */
		startAngle:number;

		/*
		 * 结束角度。
		 */
		endAngle:number;
	}

}

declare module laya.display.cmd {

	/*
	 * 绘制多边形
	 */
	class DrawPolyCmd  {
		static ID:string;

		/*
		 * 开始绘制的 X 轴位置。
		 */
		x:number;

		/*
		 * 开始绘制的 Y 轴位置。
		 */
		y:number;

		/*
		 * 多边形的点集合。
		 */
		points:any[];

		/*
		 * 填充颜色，或者填充绘图的渐变对象。
		 */
		fillColor:any;

		/*
		 * （可选）边框颜色，或者填充绘图的渐变对象。
		 */
		lineColor:any;

		/*
		 * 可选）边框宽度。
		 */
		lineWidth:number;

		/*
		 * @private 
		 */
		isConvexPolygon:boolean;

		/*
		 * @private 
		 */
		vid:number;

		/*
		 * @private 
		 */
		static create(x:number,y:number,points:any[],fillColor:any,lineColor:any,lineWidth:number,isConvexPolygon:boolean,vid:number):DrawPolyCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 绘制矩形
	 */
	class DrawRectCmd  {
		static ID:string;

		/*
		 * 开始绘制的 X 轴位置。
		 */
		x:number;

		/*
		 * 开始绘制的 Y 轴位置。
		 */
		y:number;

		/*
		 * 矩形宽度。
		 */
		width:number;

		/*
		 * 矩形高度。
		 */
		height:number;

		/*
		 * 填充颜色，或者填充绘图的渐变对象。
		 */
		fillColor:any;

		/*
		 * （可选）边框颜色，或者填充绘图的渐变对象。
		 */
		lineColor:any;

		/*
		 * （可选）边框宽度。
		 */
		lineWidth:number;

		/*
		 * @private 
		 */
		static create(x:number,y:number,width:number,height:number,fillColor:any,lineColor:any,lineWidth:number):DrawRectCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 绘制单个贴图
	 */
	class DrawTextureCmd  {
		static ID:string;

		/*
		 * 纹理。
		 */
		texture:laya.resource.Texture;

		/*
		 * （可选）X轴偏移量。
		 */
		x:number;

		/*
		 * （可选）Y轴偏移量。
		 */
		y:number;

		/*
		 * （可选）宽度。
		 */
		width:number;

		/*
		 * （可选）高度。
		 */
		height:number;

		/*
		 * （可选）矩阵信息。
		 */
		matrix:laya.maths.Matrix;

		/*
		 * （可选）透明度。
		 */
		alpha:number;

		/*
		 * （可选）颜色滤镜。
		 */
		color:string;
		colorFlt:laya.filters.ColorFilter;

		/*
		 * （可选）混合模式。
		 */
		blendMode:string;
		uv:number[];

		/*
		 * @private 
		 */
		static create(texture:laya.resource.Texture,x:number,y:number,width:number,height:number,matrix:laya.maths.Matrix,alpha:number,color:string,blendMode:string,uv?:number[]):DrawTextureCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 根据坐标集合绘制多个贴图
	 */
	class DrawTexturesCmd  {
		static ID:string;

		/*
		 * 纹理。
		 */
		texture:laya.resource.Texture;

		/*
		 * 绘制次数和坐标。
		 */
		pos:any[];

		/*
		 * @private 
		 */
		static create(texture:laya.resource.Texture,pos:any[]):DrawTexturesCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 绘制三角形命令
	 */
	class DrawTrianglesCmd  {
		static ID:string;

		/*
		 * 纹理。
		 */
		texture:laya.resource.Texture;

		/*
		 * X轴偏移量。
		 */
		x:number;

		/*
		 * Y轴偏移量。
		 */
		y:number;

		/*
		 * 顶点数组。
		 */
		vertices:Float32Array;

		/*
		 * UV数据。
		 */
		uvs:Float32Array;

		/*
		 * 顶点索引。
		 */
		indices:Uint16Array;

		/*
		 * 缩放矩阵。
		 */
		matrix:laya.maths.Matrix;

		/*
		 * alpha
		 */
		alpha:number;

		/*
		 * blend模式
		 */
		blendMode:string;

		/*
		 * 颜色变换
		 */
		color:laya.filters.ColorFilter;

		/*
		 * @private 
		 */
		static create(texture:laya.resource.Texture,x:number,y:number,vertices:Float32Array,uvs:Float32Array,indices:Uint16Array,matrix:laya.maths.Matrix,alpha:number,color:string,blendMode:string):DrawTrianglesCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 绘制文本边框
	 */
	class FillBorderTextCmd  {
		static ID:string;

		/*
		 * 在画布上输出的文本。
		 */
		text:string;

		/*
		 * 开始绘制文本的 x 坐标位置（相对于画布）。
		 */
		x:number;

		/*
		 * 开始绘制文本的 y 坐标位置（相对于画布）。
		 */
		y:number;

		/*
		 * 定义字体和字号，比如"20px Arial"。
		 */
		font:string;

		/*
		 * 定义文本颜色，比如"#ff0000"。
		 */
		fillColor:string;

		/*
		 * 定义镶边文本颜色。
		 */
		borderColor:string;

		/*
		 * 镶边线条宽度。
		 */
		lineWidth:number;

		/*
		 * 文本对齐方式，可选值："left"，"center"，"right"。
		 */
		textAlign:string;

		/*
		 * @private 
		 */
		static create(text:string,x:number,y:number,font:string,fillColor:string,borderColor:string,lineWidth:number,textAlign:string):FillBorderTextCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 绘制边框
	 */
	class FillBorderWordsCmd  {
		static ID:string;

		/*
		 * 文字数组
		 */
		words:any[];

		/*
		 * 开始绘制文本的 x 坐标位置（相对于画布）。
		 */
		x:number;

		/*
		 * 开始绘制文本的 y 坐标位置（相对于画布）。
		 */
		y:number;

		/*
		 * 定义字体和字号，比如"20px Arial"。
		 */
		font:string;

		/*
		 * 定义文本颜色，比如"#ff0000"。
		 */
		fillColor:string;

		/*
		 * 定义镶边文本颜色。
		 */
		borderColor:string;

		/*
		 * 镶边线条宽度。
		 */
		lineWidth:number;

		/*
		 * @private 
		 */
		static create(words:any[],x:number,y:number,font:string,fillColor:string,borderColor:string,lineWidth:number):FillBorderWordsCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 绘制文字
	 */
	class FillTextCmd  {
		static ID:string;
		private _text:any;

		/*
		 * 开始绘制文本的 x 坐标位置（相对于画布）。
		 */
		x:number;

		/*
		 * 开始绘制文本的 y 坐标位置（相对于画布）。
		 */
		y:number;
		private _font:any;
		private _color:any;
		private _textAlign:any;
		private _fontColor:any;
		private _strokeColor:any;
		private static _defFontObj:any;
		private _fontObj:any;
		private _nTexAlign:any;

		/*
		 * @private 
		 */
		static create(text:string|laya.utils.WordText,x:number,y:number,font:string,color:string,textAlign:string):FillTextCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;

		/*
		 * 在画布上输出的文本。
		 */
		text:string|laya.utils.WordText;

		/*
		 * 定义字号和字体，比如"20px Arial"。
		 */
		font:string;

		/*
		 * 定义文本颜色，比如"#ff0000"。
		 */
		color:string;

		/*
		 * 文本对齐方式，可选值："left"，"center"，"right"。
		 */
		textAlign:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 填充贴图
	 */
	class FillTextureCmd  {
		static ID:string;

		/*
		 * 纹理。
		 */
		texture:laya.resource.Texture;

		/*
		 * X轴偏移量。
		 */
		x:number;

		/*
		 * Y轴偏移量。
		 */
		y:number;

		/*
		 * （可选）宽度。
		 */
		width:number;

		/*
		 * （可选）高度。
		 */
		height:number;

		/*
		 * （可选）填充类型 repeat|repeat-x|repeat-y|no-repeat
		 */
		type:string;

		/*
		 * （可选）贴图纹理偏移
		 */
		offset:laya.maths.Point;

		/*
		 * @private 
		 */
		other:any;

		/*
		 * @private 
		 */
		static create(texture:laya.resource.Texture,x:number,y:number,width:number,height:number,type:string,offset:laya.maths.Point,other:any):FillTextureCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 填充文字命令
	 * @private 
	 */
	class FillWordsCmd  {
		static ID:string;

		/*
		 * 文字数组
		 */
		words:any[];

		/*
		 * 开始绘制文本的 x 坐标位置（相对于画布）。
		 */
		x:number;

		/*
		 * 开始绘制文本的 y 坐标位置（相对于画布）。
		 */
		y:number;

		/*
		 * 定义字体和字号，比如"20px Arial"。
		 */
		font:string;

		/*
		 * 定义文本颜色，比如"#ff0000"。
		 */
		color:string;

		/*
		 * @private 
		 */
		static create(words:any[],x:number,y:number,font:string,color:string):FillWordsCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 恢复命令，和save配套使用
	 */
	class RestoreCmd  {
		static ID:string;

		/*
		 * @private 
		 */
		static create():RestoreCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 旋转命令
	 */
	class RotateCmd  {
		static ID:string;

		/*
		 * 旋转角度，以弧度计。
		 */
		angle:number;

		/*
		 * （可选）水平方向轴心点坐标。
		 */
		pivotX:number;

		/*
		 * （可选）垂直方向轴心点坐标。
		 */
		pivotY:number;

		/*
		 * @private 
		 */
		static create(angle:number,pivotX:number,pivotY:number):RotateCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 存储命令，和restore配套使用
	 */
	class SaveCmd  {
		static ID:string;

		/*
		 * @private 
		 */
		static create():SaveCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 缩放命令
	 */
	class ScaleCmd  {
		static ID:string;

		/*
		 * 水平方向缩放值。
		 */
		scaleX:number;

		/*
		 * 垂直方向缩放值。
		 */
		scaleY:number;

		/*
		 * （可选）水平方向轴心点坐标。
		 */
		pivotX:number;

		/*
		 * （可选）垂直方向轴心点坐标。
		 */
		pivotY:number;

		/*
		 * @private 
		 */
		static create(scaleX:number,scaleY:number,pivotX:number,pivotY:number):ScaleCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 绘制描边文字
	 */
	class StrokeTextCmd  {
		static ID:string;

		/*
		 * 在画布上输出的文本。
		 */
		text:string;

		/*
		 * 开始绘制文本的 x 坐标位置（相对于画布）。
		 */
		x:number;

		/*
		 * 开始绘制文本的 y 坐标位置（相对于画布）。
		 */
		y:number;

		/*
		 * 定义字体和字号，比如"20px Arial"。
		 */
		font:string;

		/*
		 * 定义文本颜色，比如"#ff0000"。
		 */
		color:string;

		/*
		 * 线条宽度。
		 */
		lineWidth:number;

		/*
		 * 文本对齐方式，可选值："left"，"center"，"right"。
		 */
		textAlign:string;

		/*
		 * @private 
		 */
		static create(text:string,x:number,y:number,font:string,color:string,lineWidth:number,textAlign:string):StrokeTextCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 矩阵命令
	 */
	class TransformCmd  {
		static ID:string;

		/*
		 * 矩阵。
		 */
		matrix:laya.maths.Matrix;

		/*
		 * （可选）水平方向轴心点坐标。
		 */
		pivotX:number;

		/*
		 * （可选）垂直方向轴心点坐标。
		 */
		pivotY:number;

		/*
		 * @private 
		 */
		static create(matrix:laya.maths.Matrix,pivotX:number,pivotY:number):TransformCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.cmd {

	/*
	 * 位移命令
	 */
	class TranslateCmd  {
		static ID:string;

		/*
		 * 添加到水平坐标（x）上的值。
		 */
		tx:number;

		/*
		 * 添加到垂直坐标（y）上的值。
		 */
		ty:number;

		/*
		 * @private 
		 */
		static create(tx:number,ty:number):TranslateCmd;

		/*
		 * 回收到对象池
		 */
		recover():void;

		/*
		 * @private 
		 */
		run(context:laya.resource.Context,gx:number,gy:number):void;

		/*
		 * @private 
		 */
		readonly cmdID:string;
	}

}

declare module laya.display.css {

	/*
	 * 元素样式
	 */
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

		/*
		 * 重置，方便下次复用
		 */
		reset():SpriteStyle;

		/*
		 * 回收
		 */
		recover():void;

		/*
		 * 从对象池中创建
		 */
		static create():SpriteStyle;
	}

}

declare module laya.display.css {

	/*
	 * 文本的样式类
	 */
	class TextStyle extends laya.display.css.SpriteStyle  {

		/*
		 * 一个已初始化的 <code>TextStyle</code> 实例。
		 */
		static EMPTY:TextStyle;

		/*
		 * 表示使用此文本格式的文本是否为斜体。
		 * @default false
		 */
		italic:boolean;

		/*
		 * <p>表示使用此文本格式的文本段落的水平对齐方式。</p>
		 * @default "left"
		 */
		align:string;

		/*
		 * <p>表示使用此文本格式的文本字段是否自动换行。</p>
		 * 如果 wordWrap 的值为 true，则该文本字段自动换行；如果值为 false，则该文本字段不自动换行。
		 * @default false。
		 */
		wordWrap:boolean;

		/*
		 * <p>垂直行间距（以像素为单位）</p>
		 */
		leading:number;

		/*
		 * <p>默认边距信息</p>
		 * <p>[左边距，上边距，右边距，下边距]（边距以像素为单位）</p>
		 */
		padding:any[];

		/*
		 * 文本背景颜色，以字符串表示。
		 */
		bgColor:string;

		/*
		 * 文本边框背景颜色，以字符串表示。
		 */
		borderColor:string;

		/*
		 * <p>指定文本字段是否是密码文本字段。</p>
		 * 如果此属性的值为 true，则文本字段被视为密码文本字段，并使用星号而不是实际字符来隐藏输入的字符。如果为 false，则不会将文本字段视为密码文本字段。
		 */
		asPassword:boolean;

		/*
		 * <p>描边宽度（以像素为单位）。</p>
		 * 默认值0，表示不描边。
		 * @default 0
		 */
		stroke:number;

		/*
		 * <p>描边颜色，以字符串表示。</p>
		 * @default "#000000";
		 */
		strokeColor:string;

		/*
		 * 是否为粗体
		 */
		bold:boolean;

		/*
		 * 是否显示下划线
		 */
		underline:boolean;

		/*
		 * 下划线颜色
		 */
		underlineColor:string;

		/*
		 * 当前使用的位置字体。
		 */
		currBitmapFont:laya.display.BitmapFont;

		/*
		 * @override 
		 */
		reset():laya.display.css.SpriteStyle;

		/*
		 * @override 
		 */
		recover():void;

		/*
		 * 从对象池中创建
		 */
		static create():TextStyle;

		/*
		 * @inheritDoc 
		 */
		render(sprite:laya.display.Sprite,context:laya.resource.Context,x:number,y:number):void;
	}

}

declare module laya.display {

	/*
	 * <p> 动效模板。用于为指定目标对象添加动画效果。每个动效有唯一的目标对象，而同一个对象可以添加多个动效。 当一个动效开始播放时，其他动效会自动停止播放。</p>
	 * <p> 可以通过LayaAir IDE创建。 </p>
	 */
	class EffectAnimation extends laya.display.FrameAnimation  {

		/*
		 * @private 动效开始事件。
		 */
		private static EFFECT_BEGIN:any;

		/*
		 * @private 
		 */
		private _target:any;

		/*
		 * @private 
		 */
		private _playEvent:any;

		/*
		 * @private 
		 */
		private _initData:any;

		/*
		 * @private 
		 */
		private _aniKeys:any;

		/*
		 * @private 
		 */
		private _effectClass:any;

		/*
		 * 本实例的目标对象。通过本实例控制目标对象的属性变化。
		 * @param v 指定的目标对象。
		 */
		target:any;

		/*
		 * @private 
		 */
		private _onOtherBegin:any;

		/*
		 * 设置开始播放的事件。本实例会侦听目标对象的指定事件，触发后播放相应动画效果。
		 * @param event 
		 */
		playEvent:string;

		/*
		 * @private 
		 */
		private _addEvent:any;

		/*
		 * @private 
		 */
		private _onPlayAction:any;

		/*
		 * @param start 
		 * @param loop 
		 * @param name 
		 * @override 
		 */
		play(start?:any,loop?:boolean,name?:string):void;

		/*
		 * @private 
		 */
		private _recordInitData:any;

		/*
		 * 设置提供数据的类。
		 * @param classStr 类路径
		 */
		effectClass:string;

		/*
		 * 设置动画数据。
		 * @param uiData 
		 */
		effectData:any;

		/*
		 * @private 
		 * @override 
		 */
		protected _displayToIndex(value:number):void;

		/*
		 * @private 
		 * @override 
		 */
		protected _displayNodeToFrame(node:any,frame:number,targetDic?:any):void;

		/*
		 * @private 
		 * @override 
		 */
		protected _calculateKeyFrames(node:any):void;
	}

}

declare module laya.display {

	/*
	 * 动画播放完毕后调度。
	 * @eventType Event.COMPLETE
	 */

	/*
	 * 播放到某标签后调度。
	 * @eventType Event.LABEL
	 */

	/*
	 * 节点关键帧动画播放类。解析播放IDE内制作的节点动画。
	 */
	class FrameAnimation extends laya.display.AnimationBase  {

		/*
		 * @private 
		 */
		private static _sortIndexFun:any;

		/*
		 * @private id对象表
		 */
		_targetDic:any;

		/*
		 * @private 动画数据
		 */
		_animationData:any;

		/*
		 * @private 
		 */
		protected _usedFrames:any[];

		constructor();

		/*
		 * @inheritDoc 
		 * @override 
		 */
		clear():laya.display.AnimationBase;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		protected _displayToIndex(value:number):void;

		/*
		 * @private 将节点设置到某一帧的状态
		 * @param node 节点ID
		 * @param frame 
		 * @param targetDic 节点表
		 */
		protected _displayNodeToFrame(node:any,frame:number,targetDic?:any):void;

		/*
		 * @private 计算帧数据
		 */
		private _calculateDatas:any;

		/*
		 * @private 计算某个节点的帧数据
		 */
		protected _calculateKeyFrames(node:any):void;

		/*
		 * 重置节点，使节点恢复到动画之前的状态，方便其他动画控制
		 */
		resetNodes():void;

		/*
		 * @private 计算节点某个属性的帧数据
		 */
		private _calculateNodePropFrames:any;

		/*
		 * @private 
		 */
		private _dealKeyFrame:any;

		/*
		 * @private 计算两个关键帧直接的帧数据
		 */
		private _calculateFrameValues:any;
	}

}

declare module laya.display {

	/*
	 * <code>Graphics</code> 类用于创建绘图显示对象。Graphics可以同时绘制多个位图或者矢量图，还可以结合save，restore，transform，scale，rotate，translate，alpha等指令对绘图效果进行变化。
	 * Graphics以命令流方式存储，可以通过cmds属性访问所有命令流。Graphics是比Sprite更轻量级的对象，合理使用能提高应用性能(比如把大量的节点绘图改为一个节点的Graphics命令集合，能减少大量节点创建消耗)。
	 * @see laya.display.Sprite#graphics
	 */
	class Graphics  {

		/*
		 * @private 
		 */
		private _cmds:any;

		/*
		 * @private 
		 */
		protected _vectorgraphArray:any[];

		/*
		 * @private 
		 */
		private _graphicBounds:any;

		/*
		 * @private 
		 */
		autoDestroy:boolean;

		constructor();

		/*
		 * <p>销毁此对象。</p>
		 */
		destroy():void;

		/*
		 * <p>清空绘制命令。</p>
		 * @param recoverCmds 是否回收绘图指令数组，设置为true，则对指令数组进行回收以节省内存开销，建议设置为true进行回收，但如果手动引用了数组，不建议回收
		 */
		clear(recoverCmds?:boolean):void;

		/*
		 * @private 
		 */
		private _clearBoundsCache:any;

		/*
		 * @private 
		 */
		private _initGraphicBounds:any;

		/*
		 * @private 命令流。存储了所有绘制命令。
		 */
		cmds:any[];

		/*
		 * 获取位置及宽高信息矩阵(比较耗CPU，频繁使用会造成卡顿，尽量少用)。
		 * @param realSize （可选）使用图片的真实大小，默认为false
		 * @return 位置与宽高组成的 一个 Rectangle 对象。
		 */
		getBounds(realSize?:boolean):laya.maths.Rectangle;

		/*
		 * @private 
		 * @param realSize （可选）使用图片的真实大小，默认为false获取端点列表。
		 */
		getBoundPoints(realSize?:boolean):any[];

		/*
		 * 绘制单独图片
		 * @param texture 纹理。
		 * @param x （可选）X轴偏移量。
		 * @param y （可选）Y轴偏移量。
		 * @param width （可选）宽度。
		 * @param height （可选）高度。
		 */
		drawImage(texture:laya.resource.Texture,x?:number,y?:number,width?:number,height?:number):laya.display.cmd.DrawImageCmd;

		/*
		 * 绘制纹理，相比drawImage功能更强大，性能会差一些
		 * @param texture 纹理。
		 * @param x （可选）X轴偏移量。
		 * @param y （可选）Y轴偏移量。
		 * @param width （可选）宽度。
		 * @param height （可选）高度。
		 * @param matrix （可选）矩阵信息。
		 * @param alpha （可选）透明度。
		 * @param color （可选）颜色滤镜。
		 * @param blendMode （可选）混合模式。
		 */
		drawTexture(texture:laya.resource.Texture,x?:number,y?:number,width?:number,height?:number,matrix?:laya.maths.Matrix,alpha?:number,color?:string,blendMode?:string,uv?:number[]):laya.display.cmd.DrawTextureCmd;

		/*
		 * 批量绘制同样纹理。
		 * @param texture 纹理。
		 * @param pos 绘制次数和坐标。
		 */
		drawTextures(texture:laya.resource.Texture,pos:any[]):laya.display.cmd.DrawTexturesCmd;

		/*
		 * 绘制一组三角形
		 * @param texture 纹理。
		 * @param x X轴偏移量。
		 * @param y Y轴偏移量。
		 * @param vertices 顶点数组。
		 * @param indices 顶点索引。
		 * @param uvData UV数据。
		 * @param matrix 缩放矩阵。
		 * @param alpha alpha
		 * @param color 颜色变换
		 * @param blendMode blend模式
		 */
		drawTriangles(texture:laya.resource.Texture,x:number,y:number,vertices:Float32Array,uvs:Float32Array,indices:Uint16Array,matrix?:laya.maths.Matrix,alpha?:number,color?:string,blendMode?:string):laya.display.cmd.DrawTrianglesCmd;

		/*
		 * 用texture填充。
		 * @param texture 纹理。
		 * @param x X轴偏移量。
		 * @param y Y轴偏移量。
		 * @param width （可选）宽度。
		 * @param height （可选）高度。
		 * @param type （可选）填充类型 repeat|repeat-x|repeat-y|no-repeat
		 * @param offset （可选）贴图纹理偏移
		 */
		fillTexture(texture:laya.resource.Texture,x:number,y:number,width?:number,height?:number,type?:string,offset?:laya.maths.Point):laya.display.cmd.FillTextureCmd;

		/*
		 * 设置剪裁区域，超出剪裁区域的坐标不显示。
		 * @param x X 轴偏移量。
		 * @param y Y 轴偏移量。
		 * @param width 宽度。
		 * @param height 高度。
		 */
		clipRect(x:number,y:number,width:number,height:number):laya.display.cmd.ClipRectCmd;

		/*
		 * 在画布上绘制文本。
		 * @param text 在画布上输出的文本。
		 * @param x 开始绘制文本的 x 坐标位置（相对于画布）。
		 * @param y 开始绘制文本的 y 坐标位置（相对于画布）。
		 * @param font 定义字号和字体，比如"20px Arial"。
		 * @param color 定义文本颜色，比如"#ff0000"。
		 * @param textAlign 文本对齐方式，可选值："left"，"center"，"right"。
		 */
		fillText(text:string,x:number,y:number,font:string,color:string,textAlign:string):laya.display.cmd.FillTextCmd;

		/*
		 * 在画布上绘制“被填充且镶边的”文本。
		 * @param text 在画布上输出的文本。
		 * @param x 开始绘制文本的 x 坐标位置（相对于画布）。
		 * @param y 开始绘制文本的 y 坐标位置（相对于画布）。
		 * @param font 定义字体和字号，比如"20px Arial"。
		 * @param fillColor 定义文本颜色，比如"#ff0000"。
		 * @param borderColor 定义镶边文本颜色。
		 * @param lineWidth 镶边线条宽度。
		 * @param textAlign 文本对齐方式，可选值："left"，"center"，"right"。
		 */
		fillBorderText(text:string,x:number,y:number,font:string,fillColor:string,borderColor:string,lineWidth:number,textAlign:string):laya.display.cmd.FillBorderTextCmd;

		/*
		 * * @private
		 */
		fillWords(words:any[],x:number,y:number,font:string,color:string):laya.display.cmd.FillWordsCmd;

		/*
		 * * @private
		 */
		fillBorderWords(words:any[],x:number,y:number,font:string,fillColor:string,borderColor:string,lineWidth:number):laya.display.cmd.FillBorderWordsCmd;

		/*
		 * 在画布上绘制文本（没有填色）。文本的默认颜色是黑色。
		 * @param text 在画布上输出的文本。
		 * @param x 开始绘制文本的 x 坐标位置（相对于画布）。
		 * @param y 开始绘制文本的 y 坐标位置（相对于画布）。
		 * @param font 定义字体和字号，比如"20px Arial"。
		 * @param color 定义文本颜色，比如"#ff0000"。
		 * @param lineWidth 线条宽度。
		 * @param textAlign 文本对齐方式，可选值："left"，"center"，"right"。
		 */
		strokeText(text:string,x:number,y:number,font:string,color:string,lineWidth:number,textAlign:string):laya.display.cmd.StrokeTextCmd;

		/*
		 * 设置透明度。
		 * @param value 透明度。
		 */
		alpha(alpha:number):laya.display.cmd.AlphaCmd;

		/*
		 * 替换绘图的当前转换矩阵。
		 * @param mat 矩阵。
		 * @param pivotX （可选）水平方向轴心点坐标。
		 * @param pivotY （可选）垂直方向轴心点坐标。
		 */
		transform(matrix:laya.maths.Matrix,pivotX?:number,pivotY?:number):laya.display.cmd.TransformCmd;

		/*
		 * 旋转当前绘图。(推荐使用transform，性能更高)
		 * @param angle 旋转角度，以弧度计。
		 * @param pivotX （可选）水平方向轴心点坐标。
		 * @param pivotY （可选）垂直方向轴心点坐标。
		 */
		rotate(angle:number,pivotX?:number,pivotY?:number):laya.display.cmd.RotateCmd;

		/*
		 * 缩放当前绘图至更大或更小。(推荐使用transform，性能更高)
		 * @param scaleX 水平方向缩放值。
		 * @param scaleY 垂直方向缩放值。
		 * @param pivotX （可选）水平方向轴心点坐标。
		 * @param pivotY （可选）垂直方向轴心点坐标。
		 */
		scale(scaleX:number,scaleY:number,pivotX?:number,pivotY?:number):laya.display.cmd.ScaleCmd;

		/*
		 * 重新映射画布上的 (0,0) 位置。
		 * @param x 添加到水平坐标（x）上的值。
		 * @param y 添加到垂直坐标（y）上的值。
		 */
		translate(tx:number,ty:number):laya.display.cmd.TranslateCmd;

		/*
		 * 保存当前环境的状态。
		 */
		save():laya.display.cmd.SaveCmd;

		/*
		 * 返回之前保存过的路径状态和属性。
		 */
		restore():laya.display.cmd.RestoreCmd;

		/*
		 * @private 替换文本内容。
		 * @param text 文本内容。
		 * @return 替换成功则值为true，否则值为flase。
		 */
		replaceText(text:string):boolean;

		/*
		 * @private 
		 */
		private _isTextCmd:any;

		/*
		 * @private 替换文本颜色。
		 * @param color 颜色。
		 */
		replaceTextColor(color:string):void;

		/*
		 * @private 
		 */
		private _setTextCmdColor:any;

		/*
		 * 加载并显示一个图片。
		 * @param url 图片地址。
		 * @param x （可选）显示图片的x位置。
		 * @param y （可选）显示图片的y位置。
		 * @param width （可选）显示图片的宽度，设置为0表示使用图片默认宽度。
		 * @param height （可选）显示图片的高度，设置为0表示使用图片默认高度。
		 * @param complete （可选）加载完成回调。
		 */
		loadImage(url:string,x?:number,y?:number,width?:number,height?:number,complete?:Function):void;

		/*
		 * 绘制一条线。
		 * @param fromX X轴开始位置。
		 * @param fromY Y轴开始位置。
		 * @param toX X轴结束位置。
		 * @param toY Y轴结束位置。
		 * @param lineColor 颜色。
		 * @param lineWidth （可选）线条宽度。
		 */
		drawLine(fromX:number,fromY:number,toX:number,toY:number,lineColor:string,lineWidth?:number):laya.display.cmd.DrawLineCmd;

		/*
		 * 绘制一系列线段。
		 * @param x 开始绘制的X轴位置。
		 * @param y 开始绘制的Y轴位置。
		 * @param points 线段的点集合。格式:[x1,y1,x2,y2,x3,y3...]。
		 * @param lineColor 线段颜色，或者填充绘图的渐变对象。
		 * @param lineWidth （可选）线段宽度。
		 */
		drawLines(x:number,y:number,points:any[],lineColor:any,lineWidth?:number):laya.display.cmd.DrawLinesCmd;

		/*
		 * 绘制一系列曲线。
		 * @param x 开始绘制的 X 轴位置。
		 * @param y 开始绘制的 Y 轴位置。
		 * @param points 线段的点集合，格式[controlX, controlY, anchorX, anchorY...]。
		 * @param lineColor 线段颜色，或者填充绘图的渐变对象。
		 * @param lineWidth （可选）线段宽度。
		 */
		drawCurves(x:number,y:number,points:any[],lineColor:any,lineWidth?:number):laya.display.cmd.DrawCurvesCmd;

		/*
		 * 绘制矩形。
		 * @param x 开始绘制的 X 轴位置。
		 * @param y 开始绘制的 Y 轴位置。
		 * @param width 矩形宽度。
		 * @param height 矩形高度。
		 * @param fillColor 填充颜色，或者填充绘图的渐变对象。
		 * @param lineColor （可选）边框颜色，或者填充绘图的渐变对象。
		 * @param lineWidth （可选）边框宽度。
		 */
		drawRect(x:number,y:number,width:number,height:number,fillColor:any,lineColor?:any,lineWidth?:number):laya.display.cmd.DrawRectCmd;

		/*
		 * 绘制圆形。
		 * @param x 圆点X 轴位置。
		 * @param y 圆点Y 轴位置。
		 * @param radius 半径。
		 * @param fillColor 填充颜色，或者填充绘图的渐变对象。
		 * @param lineColor （可选）边框颜色，或者填充绘图的渐变对象。
		 * @param lineWidth （可选）边框宽度。
		 */
		drawCircle(x:number,y:number,radius:number,fillColor:any,lineColor?:any,lineWidth?:number):laya.display.cmd.DrawCircleCmd;

		/*
		 * 绘制扇形。
		 * @param x 开始绘制的 X 轴位置。
		 * @param y 开始绘制的 Y 轴位置。
		 * @param radius 扇形半径。
		 * @param startAngle 开始角度。
		 * @param endAngle 结束角度。
		 * @param fillColor 填充颜色，或者填充绘图的渐变对象。
		 * @param lineColor （可选）边框颜色，或者填充绘图的渐变对象。
		 * @param lineWidth （可选）边框宽度。
		 */
		drawPie(x:number,y:number,radius:number,startAngle:number,endAngle:number,fillColor:any,lineColor?:any,lineWidth?:number):laya.display.cmd.DrawPieCmd;

		/*
		 * 绘制多边形。
		 * @param x 开始绘制的 X 轴位置。
		 * @param y 开始绘制的 Y 轴位置。
		 * @param points 多边形的点集合。
		 * @param fillColor 填充颜色，或者填充绘图的渐变对象。
		 * @param lineColor （可选）边框颜色，或者填充绘图的渐变对象。
		 * @param lineWidth （可选）边框宽度。
		 */
		drawPoly(x:number,y:number,points:any[],fillColor:any,lineColor?:any,lineWidth?:number):laya.display.cmd.DrawPolyCmd;

		/*
		 * 绘制路径。
		 * @param x 开始绘制的 X 轴位置。
		 * @param y 开始绘制的 Y 轴位置。
		 * @param paths 路径集合，路径支持以下格式：[["moveTo",x,y],["lineTo",x,y],["arcTo",x1,y1,x2,y2,r],["closePath"]]。
		 * @param brush （可选）刷子定义，支持以下设置{fillStyle:"#FF0000"}。
		 * @param pen （可选）画笔定义，支持以下设置{strokeStyle,lineWidth,lineJoin:"bevel|round|miter",lineCap:"butt|round|square",miterLimit}。
		 */
		drawPath(x:number,y:number,paths:any[],brush?:any,pen?:any):laya.display.cmd.DrawPathCmd;

		/*
		 * @private 绘制带九宫格的图片
		 * @param texture 
		 * @param x 
		 * @param y 
		 * @param width 
		 * @param height 
		 * @param sizeGrid 
		 */
		draw9Grid(texture:laya.resource.Texture,x?:number,y?:number,width?:number,height?:number,sizeGrid?:any[]):void;
	}

}

declare module laya.display {

	/*
	 * @private Graphic bounds数据类
	 */
	class GraphicsBounds  {

		/*
		 * @private 
		 */
		private static _tempMatrix:any;

		/*
		 * @private 
		 */
		private static _initMatrix:any;

		/*
		 * @private 
		 */
		private static _tempPoints:any;

		/*
		 * @private 
		 */
		private static _tempMatrixArrays:any;

		/*
		 * @private 
		 */
		private static _tempCmds:any;

		/*
		 * @private 
		 */
		private _temp:any;

		/*
		 * @private 
		 */
		private _bounds:any;

		/*
		 * @private 
		 */
		private _rstBoundPoints:any;

		/*
		 * @private 
		 */
		private _cacheBoundsType:any;

		/*
		 * 销毁
		 */
		destroy():void;

		/*
		 * 创建
		 */
		static create():GraphicsBounds;

		/*
		 * 重置数据
		 */
		reset():void;

		/*
		 * 获取位置及宽高信息矩阵(比较耗CPU，频繁使用会造成卡顿，尽量少用)。
		 * @param realSize （可选）使用图片的真实大小，默认为false
		 * @return 位置与宽高组成的 一个 Rectangle 对象。
		 */
		getBounds(realSize?:boolean):laya.maths.Rectangle;

		/*
		 * @private 
		 * @param realSize （可选）使用图片的真实大小，默认为false获取端点列表。
		 */
		getBoundPoints(realSize?:boolean):any[];
		private _getCmdPoints:any;
		private _switchMatrix:any;
		private static _addPointArrToRst:any;
		private static _addPointToRst:any;

		/*
		 * 获得drawPie命令可能的产生的点。注意 这里只假设用在包围盒计算上。
		 * @param x 
		 * @param y 
		 * @param radius 
		 * @param startAngle 
		 * @param endAngle 
		 * @return 
		 */
		private _getPiePoints:any;
		private _getTriAngBBXPoints:any;
		private _getDraw9GridBBXPoints:any;
		private _getPathPoints:any;
	}

}

declare module laya.display {

	/*
	 * 用户输入一个或多个文本字符时后调度。
	 * @eventType Event.INPUT
	 */

	/*
	 * 文本发生变化后调度。
	 * @eventType Event.CHANGE
	 */

	/*
	 * 用户在输入框内敲回车键后，将会调度 <code>enter</code> 事件。
	 * @eventType Event.ENTER
	 */

	/*
	 * 显示对象获得焦点后调度。
	 * @eventType Event.FOCUS
	 */

	/*
	 * 显示对象失去焦点后调度。
	 * @eventType Event.BLUR
	 */

	/*
	 * <p><code>Input</code> 类用于创建显示对象以显示和输入文本。</p>
	 * <p>Input 类封装了原生的文本输入框，由于不同浏览器的差异，会导致此对象的默认文本的位置与用户点击输入时的文本的位置有少许的偏差。</p>
	 */
	class Input extends laya.display.Text  {

		/*
		 * 常规文本域。
		 */
		static TYPE_TEXT:string;

		/*
		 * password 类型用于密码域输入。
		 */
		static TYPE_PASSWORD:string;

		/*
		 * email 类型用于应该包含 e-mail 地址的输入域。
		 */
		static TYPE_EMAIL:string;

		/*
		 * url 类型用于应该包含 URL 地址的输入域。
		 */
		static TYPE_URL:string;

		/*
		 * number 类型用于应该包含数值的输入域。
		 */
		static TYPE_NUMBER:string;

		/*
		 * <p>range 类型用于应该包含一定范围内数字值的输入域。</p>
		 * <p>range 类型显示为滑动条。</p>
		 * <p>您还能够设定对所接受的数字的限定。</p>
		 */
		static TYPE_RANGE:string;

		/*
		 * 选取日、月、年。
		 */
		static TYPE_DATE:string;

		/*
		 * month - 选取月、年。
		 */
		static TYPE_MONTH:string;

		/*
		 * week - 选取周和年。
		 */
		static TYPE_WEEK:string;

		/*
		 * time - 选取时间（小时和分钟）。
		 */
		static TYPE_TIME:string;

		/*
		 * datetime - 选取时间、日、月、年（UTC 时间）。
		 */
		static TYPE_DATE_TIME:string;

		/*
		 * datetime-local - 选取时间、日、月、年（本地时间）。
		 */
		static TYPE_DATE_TIME_LOCAL:string;

		/*
		 * <p>search 类型用于搜索域，比如站点搜索或 Google 搜索。</p>
		 * <p>search 域显示为常规的文本域。</p>
		 */
		static TYPE_SEARCH:string;

		/*
		 * @private 
		 */
		protected static input:any;

		/*
		 * @private 
		 */
		protected static area:any;

		/*
		 * @private 
		 */
		protected static inputElement:any;

		/*
		 * @private 
		 */
		protected static inputContainer:any;

		/*
		 * @private 
		 */
		protected static confirmButton:any;

		/*
		 * @private 
		 */
		protected static promptStyleDOM:any;

		/*
		 * @private 
		 */
		protected _focus:boolean;

		/*
		 * @private 
		 */
		protected _multiline:boolean;

		/*
		 * @private 
		 */
		protected _editable:boolean;

		/*
		 * @private 
		 */
		protected _restrictPattern:any;

		/*
		 * @private 
		 */
		protected _maxChars:number;
		private _type:any;

		/*
		 * 输入提示符。
		 */
		private _prompt:any;

		/*
		 * 输入提示符颜色。
		 */
		private _promptColor:any;
		private _originColor:any;
		private _content:any;

		/*
		 * @private 
		 */
		static IOS_IFRAME:boolean;
		private static inputHeight:any;

		/*
		 * 表示是否处于输入状态。
		 */
		static isInputting:boolean;

		/*
		 * 创建一个新的 <code>Input</code> 类实例。
		 */

		constructor();

		/*
		 * @private 
		 */
		static __init__():void;
		private static _popupInputMethod:any;
		private static _createInputElement:any;
		private static _initInput:any;
		private static _processInputting:any;
		private static _stopEvent:any;

		/*
		 * 设置光标位置和选取字符。
		 * @param startIndex 光标起始位置。
		 * @param endIndex 光标结束位置。
		 */
		setSelection(startIndex:number,endIndex:number):void;

		/*
		 * 表示是否是多行输入框。
		 */
		multiline:boolean;

		/*
		 * 获取对输入框的引用实例。
		 */
		readonly nativeInput:any;
		private _onUnDisplay:any;
		private _onMouseDown:any;
		private static stageMatrix:any;

		/*
		 * 在输入期间，如果 Input 实例的位置改变，调用_syncInputTransform同步输入框的位置。
		 */
		private _syncInputTransform:any;

		/*
		 * 选中当前实例的所有文本。
		 */
		select():void;

		/*
		 * 表示焦点是否在此实例上。
		 */
		focus:boolean;
		private _setInputMethod:any;
		private _focusIn:any;
		private _setPromptColor:any;

		/*
		 * @private 
		 */
		private _focusOut:any;

		/*
		 * @private 
		 */
		private _onKeyDown:any;

		/*
		 * @inheritDoc 
		 * @override 
		 */

		/*
		 * @override 
		 */
		text:string;

		/*
		 * @param text 
		 * @override 
		 */
		changeText(text:string):void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		color:string;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		bgColor:string;

		/*
		 * 限制输入的字符。
		 */
		restrict:string;

		/*
		 * 是否可编辑。
		 */
		editable:boolean;

		/*
		 * <p>字符数量限制，默认为10000。</p>
		 * <p>设置字符数量限制时，小于等于0的值将会限制字符数量为10000。</p>
		 */
		maxChars:number;

		/*
		 * 设置输入提示符。
		 */
		prompt:string;

		/*
		 * 设置输入提示符颜色。
		 */
		promptColor:string;

		/*
		 * <p>输入框类型为Input静态常量之一。</p>
		 * <ul>
		 * <li>TYPE_TEXT</li>
		 * <li>TYPE_PASSWORD</li>
		 * <li>TYPE_EMAIL</li>
		 * <li>TYPE_URL</li>
		 * <li>TYPE_NUMBER</li>
		 * <li>TYPE_RANGE</li>
		 * <li>TYPE_DATE</li>
		 * <li>TYPE_MONTH</li>
		 * <li>TYPE_WEEK</li>
		 * <li>TYPE_TIME</li>
		 * <li>TYPE_DATE_TIME</li>
		 * <li>TYPE_DATE_TIME_LOCAL</li>
		 * </ul>
		 * <p>平台兼容性参见http://www.w3school.com.cn/html5/html_5_form_input_types.asp。</p>
		 */
		type:string;
	}

}

declare module laya.display {

	/*
	 * 添加到父对象后调度。
	 * @eventType Event.ADDED
	 */

	/*
	 * 被父对象移除后调度。
	 * @eventType Event.REMOVED
	 */

	/*
	 * 加入节点树时调度。
	 * @eventType Event.DISPLAY
	 */

	/*
	 * 从节点树移除时调度。
	 * @eventType Event.UNDISPLAY
	 */

	/*
	 * <code>Node</code> 类是可放在显示列表中的所有对象的基类。该显示列表管理 Laya 运行时中显示的所有对象。使用 Node 类排列显示列表中的显示对象。Node 对象可以有子显示对象。
	 */
	class Node extends laya.events.EventDispatcher  {

		/*
		 * @private 
		 */
		protected static ARRAY_EMPTY:any[];

		/*
		 * @private 
		 */
		private _bits:any;

		/*
		 * 节点名称。
		 */
		name:string;

		/*
		 * [只读]是否已经销毁。对象销毁后不能再使用。
		 */
		destroyed:boolean;

		constructor();

		/*
		 * <p>增加事件侦听器，以使侦听器能够接收事件通知。</p>
		 * <p>如果侦听鼠标事件，则会自动设置自己和父亲节点的属性 mouseEnabled 的值为 true(如果父节点mouseEnabled=false，则停止设置父节点mouseEnabled属性)。</p>
		 * @param type 事件的类型。
		 * @param caller 事件侦听函数的执行域。
		 * @param listener 事件侦听函数。
		 * @param args （可选）事件侦听函数的回调参数。
		 * @return 此 EventDispatcher 对象。
		 * @override 
		 */
		on(type:string,caller:any,listener:Function,args?:any[]):laya.events.EventDispatcher;

		/*
		 * <p>增加事件侦听器，以使侦听器能够接收事件通知，此侦听事件响应一次后则自动移除侦听。</p>
		 * <p>如果侦听鼠标事件，则会自动设置自己和父亲节点的属性 mouseEnabled 的值为 true(如果父节点mouseEnabled=false，则停止设置父节点mouseEnabled属性)。</p>
		 * @param type 事件的类型。
		 * @param caller 事件侦听函数的执行域。
		 * @param listener 事件侦听函数。
		 * @param args （可选）事件侦听函数的回调参数。
		 * @return 此 EventDispatcher 对象。
		 * @override 
		 */
		once(type:string,caller:any,listener:Function,args?:any[]):laya.events.EventDispatcher;

		/*
		 * <p>销毁此对象。destroy对象默认会把自己从父节点移除，并且清理自身引用关系，等待js自动垃圾回收机制回收。destroy后不能再使用。</p>
		 * <p>destroy时会移除自身的事情监听，自身的timer监听，移除子对象及从父节点移除自己。</p>
		 * @param destroyChild （可选）是否同时销毁子节点，若值为true,则销毁子节点，否则不销毁子节点。
		 */
		destroy(destroyChild?:boolean):void;

		/*
		 * 销毁时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onDestroy():void;

		/*
		 * 销毁所有子对象，不销毁自己本身。
		 */
		destroyChildren():void;

		/*
		 * 添加子节点。
		 * @param node 节点对象
		 * @return 返回添加的节点
		 */
		addChild(node:Node):Node;
		addInputChild(node:Node):Node;
		removeInputChild(node:Node):void;

		/*
		 * 批量增加子节点
		 * @param ...args 无数子节点。
		 */
		addChildren(...args:any[]):void;

		/*
		 * 添加子节点到指定的索引位置。
		 * @param node 节点对象。
		 * @param index 索引位置。
		 * @return 返回添加的节点。
		 */
		addChildAt(node:Node,index:number):Node;

		/*
		 * 根据子节点对象，获取子节点的索引位置。
		 * @param node 子节点。
		 * @return 子节点所在的索引位置。
		 */
		getChildIndex(node:Node):number;

		/*
		 * 根据子节点的名字，获取子节点对象。
		 * @param name 子节点的名字。
		 * @return 节点对象。
		 */
		getChildByName(name:string):Node;

		/*
		 * 根据子节点的索引位置，获取子节点对象。
		 * @param index 索引位置
		 * @return 子节点
		 */
		getChildAt(index:number):Node;

		/*
		 * 设置子节点的索引位置。
		 * @param node 子节点。
		 * @param index 新的索引。
		 * @return 返回子节点本身。
		 */
		setChildIndex(node:Node,index:number):Node;

		/*
		 * 子节点发生改变。
		 * @private 
		 * @param child 子节点。
		 */
		protected _childChanged(child?:Node):void;

		/*
		 * 删除子节点。
		 * @param node 子节点
		 * @return 被删除的节点
		 */
		removeChild(node:Node):Node;

		/*
		 * 从父容器删除自己，如已经被删除不会抛出异常。
		 * @return 当前节点（ Node ）对象。
		 */
		removeSelf():Node;

		/*
		 * 根据子节点名字删除对应的子节点对象，如果找不到不会抛出异常。
		 * @param name 对象名字。
		 * @return 查找到的节点（ Node ）对象。
		 */
		removeChildByName(name:string):Node;

		/*
		 * 根据子节点索引位置，删除对应的子节点对象。
		 * @param index 节点索引位置。
		 * @return 被删除的节点。
		 */
		removeChildAt(index:number):Node;

		/*
		 * 删除指定索引区间的所有子对象。
		 * @param beginIndex 开始索引。
		 * @param endIndex 结束索引。
		 * @return 当前节点对象。
		 */
		removeChildren(beginIndex?:number,endIndex?:number):Node;

		/*
		 * 子对象数量。
		 */
		readonly numChildren:number;

		/*
		 * 父节点。
		 */
		readonly parent:Node;

		/*
		 * @private 
		 */
		protected _setParent(value:Node):void;

		/*
		 * 表示是否在显示列表中显示。
		 */
		readonly displayedInStage:boolean;

		/*
		 * @private 
		 */
		private _updateDisplayedInstage:any;

		/*
		 * 设置指定节点对象是否可见(是否在渲染列表中)。
		 * @private 
		 * @param node 节点。
		 * @param display 是否可见。
		 */
		private _displayChild:any;

		/*
		 * 当前容器是否包含指定的 <code>Node</code> 节点对象 。
		 * @param node 指定的 <code>Node</code> 节点对象 。
		 * @return 一个布尔值表示是否包含指定的 <code>Node</code> 节点对象 。
		 */
		contains(node:Node):boolean;

		/*
		 * 定时重复执行某函数。功能同Laya.timer.timerLoop()。
		 * @param delay 间隔时间(单位毫秒)。
		 * @param caller 执行域(this)。
		 * @param method 结束时的回调方法。
		 * @param args （可选）回调参数。
		 * @param coverBefore （可选）是否覆盖之前的延迟执行，默认为true。
		 * @param jumpFrame 时钟是否跳帧。基于时间的循环回调，单位时间间隔内，如能执行多次回调，出于性能考虑，引擎默认只执行一次，设置jumpFrame=true后，则回调会连续执行多次
		 */
		timerLoop(delay:number,caller:any,method:Function,args?:any[],coverBefore?:boolean,jumpFrame?:boolean):void;

		/*
		 * 定时执行某函数一次。功能同Laya.timer.timerOnce()。
		 * @param delay 延迟时间(单位毫秒)。
		 * @param caller 执行域(this)。
		 * @param method 结束时的回调方法。
		 * @param args （可选）回调参数。
		 * @param coverBefore （可选）是否覆盖之前的延迟执行，默认为true。
		 */
		timerOnce(delay:number,caller:any,method:Function,args?:any[],coverBefore?:boolean):void;

		/*
		 * 定时重复执行某函数(基于帧率)。功能同Laya.timer.frameLoop()。
		 * @param delay 间隔几帧(单位为帧)。
		 * @param caller 执行域(this)。
		 * @param method 结束时的回调方法。
		 * @param args （可选）回调参数。
		 * @param coverBefore （可选）是否覆盖之前的延迟执行，默认为true。
		 */
		frameLoop(delay:number,caller:any,method:Function,args?:any[],coverBefore?:boolean):void;

		/*
		 * 定时执行一次某函数(基于帧率)。功能同Laya.timer.frameOnce()。
		 * @param delay 延迟几帧(单位为帧)。
		 * @param caller 执行域(this)
		 * @param method 结束时的回调方法
		 * @param args （可选）回调参数
		 * @param coverBefore （可选）是否覆盖之前的延迟执行，默认为true
		 */
		frameOnce(delay:number,caller:any,method:Function,args?:any[],coverBefore?:boolean):void;

		/*
		 * 清理定时器。功能同Laya.timer.clearTimer()。
		 * @param caller 执行域(this)。
		 * @param method 结束时的回调方法。
		 */
		clearTimer(caller:any,method:Function):void;

		/*
		 * <p>延迟运行指定的函数。</p>
		 * <p>在控件被显示在屏幕之前调用，一般用于延迟计算数据。</p>
		 * @param method 要执行的函数的名称。例如，functionName。
		 * @param args 传递给 <code>method</code> 函数的可选参数列表。
		 * @see #runCallLater()
		 */
		callLater(method:Function,args?:any[]):void;

		/*
		 * <p>如果有需要延迟调用的函数（通过 <code>callLater</code> 函数设置），则立即执行延迟调用函数。</p>
		 * @param method 要执行的函数名称。例如，functionName。
		 * @see #callLater()
		 */
		runCallLater(method:Function):void;

		/*
		 * @private 
		 */
		private _components:any;

		/*
		 * @private 
		 */
		private _activeChangeScripts:any;

		/*
		 * 获得所属场景。
		 * @return 场景。
		 */
		readonly scene:any;

		/*
		 * 获取自身是否激活。
		 * @return 自身是否激活。
		 */

		/*
		 * 设置是否激活。
		 * @param value 是否激活。
		 */
		active:boolean;

		/*
		 * 获取在场景中是否激活。
		 * @return 在场景中是否激活。
		 */
		readonly activeInHierarchy:boolean;

		/*
		 * @private 
		 */
		protected _onActive():void;

		/*
		 * @private 
		 */
		protected _onInActive():void;

		/*
		 * @private 
		 */
		protected _onActiveInScene():void;

		/*
		 * @private 
		 */
		protected _onInActiveInScene():void;

		/*
		 * 组件被激活后执行，此时所有节点和组件均已创建完毕，次方法只执行一次
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onAwake():void;

		/*
		 * 组件被启用后执行，比如节点被添加到舞台后
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onEnable():void;

		/*
		 * @private 
		 */
		private _activeScripts:any;

		/*
		 * @private 
		 */
		private _processInActive:any;

		/*
		 * @private 
		 */
		private _inActiveScripts:any;

		/*
		 * 组件被禁用时执行，比如从节点从舞台移除后
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		onDisable():void;

		/*
		 * @private 
		 */
		protected _onAdded():void;

		/*
		 * @private 
		 */
		protected _onRemoved():void;

		/*
		 * 添加组件实例。
		 * @param comp 组件实例。
		 * @return 组件。
		 */
		addComponentIntance(comp:laya.components.Component):any;

		/*
		 * 添加组件。
		 * @param type 组件类型。
		 * @return 组件。
		 */
		addComponent(type:new () => any):any;

		/*
		 * 获得组件实例，如果没有则返回为null
		 * @param clas 组建类型
		 * @return 返回组件
		 */
		getComponent(clas:any):any;

		/*
		 * 获得组件实例，如果没有则返回为null
		 * @param clas 组建类型
		 * @return 返回组件数组
		 */
		getComponents(clas:any):any[];

		/*
		 * @private 获取timer
		 */
		readonly timer:laya.utils.Timer;
	}

}

declare module laya.display {

	/*
	 * 场景类，负责场景创建，加载，销毁等功能
	 * 场景被从节点移除后，并不会被自动垃圾机制回收，如果想回收，请调用destroy接口，可以通过unDestroyedScenes属性查看还未被销毁的场景列表
	 */
	class Scene extends laya.display.Sprite  {

		/*
		 * 创建后，还未被销毁的场景列表，方便查看还未被销毁的场景列表，方便内存管理，本属性只读，请不要直接修改
		 */
		static unDestroyedScenes:any[];

		/*
		 * 获取根节点
		 */
		private static _root:any;

		/*
		 * @private 
		 */
		private static _loadPage:any;

		/*
		 * 场景被关闭后，是否自动销毁（销毁节点和使用到的资源），默认为false
		 */
		autoDestroyAtClosed:boolean;

		/*
		 * 场景地址
		 */
		url:string;

		/*
		 * 场景时钟
		 */
		private _timer:any;

		/*
		 * @private 
		 */
		private _viewCreated:any;

		constructor();

		/*
		 * @private 兼容老项目
		 */
		protected createChildren():void;

		/*
		 * @private 兼容老项目装载场景视图。用于加载模式。
		 * @param path 场景地址。
		 */
		loadScene(path:string):void;
		private _onSceneLoaded:any;

		/*
		 * @private 兼容老项目通过视图数据创建视图。
		 * @param uiView 视图数据信息。
		 */
		createView(view:any):void;

		/*
		 * 根据IDE内的节点id，获得节点实例
		 */
		getNodeByID(id:number):any;

		/*
		 * 打开场景。【注意】被关闭的场景，如果没有设置autoDestroyAtRemoved=true，则资源可能不能被回收，需要自己手动回收
		 * @param closeOther 是否关闭其他场景，默认为true（可选）
		 * @param param 打开页面的参数，会传递给onOpened方法（可选）
		 */
		open(closeOther?:boolean,param?:any):void;

		/*
		 * 场景打开完成后，调用此方法（如果有弹出动画，则在动画完成后执行）
		 */
		onOpened(param:any):void;

		/*
		 * 关闭场景
		 * 【注意】被关闭的场景，如果没有设置autoDestroyAtRemoved=true，则资源可能不能被回收，需要自己手动回收
		 * @param type 关闭的原因，会传递给onClosed函数
		 */
		close(type?:string):void;

		/*
		 * 关闭完成后，调用此方法（如果有关闭动画，则在动画完成后执行）
		 * @param type 如果是点击默认关闭按钮触发，则传入关闭按钮的名字(name)，否则为null。
		 */
		onClosed(type?:string):void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		destroy(destroyChild?:boolean):void;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		scaleX:number;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		scaleY:number;

		/*
		 * @inheritDoc 
		 * @override 
		 */

		/*
		 * @inheritDoc 
		 * @override 
		 */
		width:number;

		/*
		 * @inheritDoc 
		 * @override 
		 */

		/*
		 * @inheritDoc 
		 * @override 
		 */
		height:number;

		/*
		 * @private 
		 */
		protected _sizeChanged():void;

		/*
		 * 获取场景根容器
		 */
		static readonly root:laya.display.Sprite;

		/*
		 * 场景时钟
		 * @override 
		 */
		timer:laya.utils.Timer;

		/*
		 * 加载场景及场景使用到的资源
		 * @param url 场景地址
		 * @param complete 加载完成回调，返回场景实例（可选）
		 * @param progress 加载进度回调（可选）
		 */
		static load(url:string,complete?:laya.utils.Handler,progress?:laya.utils.Handler):void;

		/*
		 * 加载并打开场景
		 * @param url 场景地址
		 * @param closeOther 是否关闭其他场景，默认为true（可选），【注意】被关闭的场景，如果没有设置autoDestroyAtRemoved=true，则资源可能不能被回收，需要自己手动回收
		 * @param param 打开页面的参数，会传递给onOpened方法（可选）
		 * @param complete 打开完成回调，返回场景实例（可选）
		 * @param progress 加载进度回调（可选）
		 */
		static open(url:string,closeOther?:boolean,param?:any,complete?:laya.utils.Handler,progress?:laya.utils.Handler):void;

		/*
		 * @private 
		 */
		private static _onSceneLoaded:any;

		/*
		 * 根据地址，关闭场景（包括对话框）
		 * @param url 场景地址
		 * @param name 如果name不为空，name必须相同才能关闭
		 * @return 返回是否关闭成功，如果url找不到，则不成功
		 */
		static close(url:string,name?:string):boolean;

		/*
		 * 关闭所有场景，不包括对话框，如果关闭对话框，请使用Dialog.closeAll()
		 * 【注意】被关闭的场景，如果没有设置autoDestroyAtRemoved=true，则资源可能不能被回收，需要自己手动回收
		 */
		static closeAll():void;

		/*
		 * 根据地址，销毁场景（包括对话框）
		 * @param url 场景地址
		 * @param name 如果name不为空，name必须相同才能关闭
		 * @return 返回是否销毁成功，如果url找不到，则不成功
		 */
		static destroy(url:string,name?:string):boolean;

		/*
		 * 销毁当前没有被使用的资源,该函数会忽略lock=true的资源。
		 */
		static gc():void;

		/*
		 * 设置loading界面，引擎会在调用open方法后，延迟打开loading界面，在页面添加到舞台之后，关闭loading界面
		 * @param loadPage load界面实例
		 */
		static setLoadingPage(loadPage:Scene):void;

		/*
		 * 显示loading界面
		 * @param param 打开参数，如果是scene，则会传递给onOpened方法
		 * @param delay 延迟打开时间，默认500毫秒
		 */
		static showLoadingPage(param?:any,delay?:number):void;
		private static _showLoading:any;
		private static _hideLoading:any;

		/*
		 * 隐藏loading界面
		 * @param delay 延迟关闭时间，默认500毫秒
		 */
		static hideLoadingPage(delay?:number):void;
	}

}
declare module Laya {

	/*
	 * 开始播放时调度。
	 * @eventType Event.PLAYED
	 */

	/*
	 * 暂停时调度。
	 * @eventType Event.PAUSED
	 */

	/*
	 * 完成一次循环时调度。
	 * @eventType Event.COMPLETE
	 */

	/*
	 * 停止时调度。
	 * @eventType Event.STOPPED
	 */

	/*
	 * <code>AnimationPlayer</code> 类用于动画播放器。
	 */

	class AnimationPlayer extends laya.ani.AnimationPlayer {}

	/*
	 * <code>AnimationTemplet</code> 类用于动画模板资源。
	 */

	class AnimationTemplet extends laya.ani.AnimationTemplet {}

	/*
	 * @private 
	 */

	class Bone extends laya.ani.bone.Bone {}

	class BoneSlot extends laya.ani.bone.BoneSlot {}

	/*
	 */

	class MeshData extends laya.ani.bone.canvasmesh.MeshData {}

	class SkinMeshForGraphic extends laya.ani.bone.canvasmesh.SkinMeshForGraphic {}

	class EventData extends laya.ani.bone.EventData {}

	/*
	 * 动画开始播放调度
	 * @eventType Event.PLAYED
	 */

	/*
	 * 动画停止播放调度
	 * @eventType Event.STOPPED
	 */

	/*
	 * 动画暂停播放调度
	 * @eventType Event.PAUSED
	 */

	/*
	 * 自定义事件。
	 * @eventType Event.LABEL
	 */

	/*
	 * 骨骼动画由<code>Templet</code>，<code>AnimationPlayer</code>，<code>Skeleton</code>三部分组成。
	 */

	class Skeleton extends laya.ani.bone.Skeleton {}

	class SkinSlotDisplayData extends laya.ani.bone.SkinSlotDisplayData {}

	class SlotData extends laya.ani.bone.SlotData {}

	/*
	 * 数据解析完成后的调度。
	 * @eventType Event.COMPLETE
	 */

	/*
	 * 数据解析错误后的调度。
	 * @eventType Event.ERROR
	 */

	/*
	 * 动画模板类
	 */

	class Templet extends laya.ani.bone.Templet {}

	class Transform extends laya.ani.bone.Transform {}

	class GraphicsAni extends laya.ani.GraphicsAni {}

	class KeyFramesContent extends laya.ani.KeyFramesContent {}

	/*
	 * 动画播放完毕后调度。
	 * @eventType Event.COMPLETE
	 */

	/*
	 * 播放到某标签后调度。
	 * @eventType Event.LABEL
	 */

	/*
	 * 加载完成后调度。
	 * @eventType Event.LOADED
	 */

	/*
	 * 进入帧后调度。
	 * @eventType Event.FRAME
	 */

	/*
	 * <p> <code>MovieClip</code> 用于播放经过工具处理后的 swf 动画。</p>
	 */

	class MovieClip extends laya.ani.swf.MovieClip {}

	/*
	 * <code>CommonScript</code> 类用于创建公共脚本类。
	 */

	class CommonScript extends laya.components.CommonScript {}

	/*
	 * <code>Component</code> 类用于创建组件的基类。
	 */

	class Component extends laya.components.Component {}

	/*
	 * 模板，预制件
	 */

	class Prefab extends laya.components.Prefab {}

	/*
	 * <code>Script</code> 类用于创建脚本的父类，该类为抽象类，不允许实例。
	 * 组件的生命周期
	 */

	class Script extends laya.components.Script {}

	/*
	 * @private 静态常量集合
	 */

	class Const extends laya.Const {}

	/*
	 * <code>AnimationClip</code> 类用于动画片段资源。
	 */

	class AnimationClip extends laya.d3.animation.AnimationClip {}

	/*
	 * <code>AnimationEvent</code> 类用于实现动画事件。
	 */

	class AnimationEvent extends laya.d3.animation.AnimationEvent {}

	/*
	 * <code>BoneNode</code> 类用于实现骨骼节点。
	 */

	class AnimationNode extends laya.d3.animation.AnimationNode {}

	/*
	 * <code>AnimationTransform3D</code> 类用于实现3D变换。
	 */

	class AnimationTransform3D extends laya.d3.animation.AnimationTransform3D {}

	/*
	 * <code>AnimatorStateScript</code> 类用于动画状态脚本的父类,该类为抽象类,不允许实例。
	 */

	class AnimatorStateScript extends laya.d3.animation.AnimatorStateScript {}

	/*
	 * /**
	 *    <code>CastShadowList</code> 类用于实现产生阴影者队列。
	 */

	class CastShadowList extends laya.d3.CastShadowList {}

	/*
	 * <code>Animator</code> 类用于创建动画组件。
	 */

	class Animator extends laya.d3.component.Animator {}

	/*
	 * <code>AnimatorControllerLayer</code> 类用于创建动画控制器层。
	 */

	class AnimatorControllerLayer extends laya.d3.component.AnimatorControllerLayer {}

	/*
	 * <code>AnimatorPlayState</code> 类用于创建动画播放状态信息。
	 */

	class AnimatorPlayState extends laya.d3.component.AnimatorPlayState {}

	/*
	 * <code>AnimatorState</code> 类用于创建动作状态。
	 */

	class AnimatorState extends laya.d3.component.AnimatorState {}

	/*
	 * <code>PostProcess</code> 类用于创建后期处理组件。
	 */

	class PostProcess extends laya.d3.component.PostProcess {}

	/*
	 * <code>Script3D</code> 类用于创建脚本的父类,该类为抽象类,不允许实例。
	 */

	class Script3D extends laya.d3.component.Script3D {}

	/*
	 * <code>SimpleSingletonList</code> 类用于实现单例队列。
	 */

	class SimpleSingletonList extends laya.d3.component.SimpleSingletonList {}

	/*
	 * <code>SingletonList</code> 类用于实现单例队列。
	 */

	class SingletonList<T> extends laya.d3.component.SingletonList<T> {}

	/*
	 * <code>Avatar</code> 类用于创建Avatar。
	 */

	class Avatar extends laya.d3.core.Avatar {}

	/*
	 * <code>BaseCamera</code> 类用于创建摄像机的父类。
	 */

	class BaseCamera extends laya.d3.core.BaseCamera {}

	/*
	 * <code>Bounds</code> 类用于创建包围体。
	 */

	class Bounds extends laya.d3.core.Bounds {}

	/*
	 * <code>Camera</code> 类用于创建摄像机。
	 */

	class Camera extends laya.d3.core.Camera {}

	/*
	 * <code>FloatKeyFrame</code> 类用于创建浮点关键帧实例。
	 */

	class FloatKeyframe extends laya.d3.core.FloatKeyframe {}

	/*
	 * <code>GeometryElement</code> 类用于实现几何体元素,该类为抽象类。
	 */

	class GeometryElement extends laya.d3.core.GeometryElement {}

	/*
	 * <code>Gradient</code> 类用于创建颜色渐变。
	 */

	class Gradient extends laya.d3.core.Gradient {}

	/*
	 * ...
	 * @author ...
	 */

	class GradientMode extends laya.d3.core.GradientMode {}

	/*
	 * <code>HeightMap</code> 类用于实现高度图数据。
	 */

	class HeightMap extends laya.d3.core.HeightMap {}

	/*
	 * <code>KeyFrame</code> 类用于创建关键帧实例。
	 */

	class Keyframe extends laya.d3.core.Keyframe {}

	/*
	 * <code>DirectionLight</code> 类用于创建平行光。
	 */

	class DirectionLight extends laya.d3.core.light.DirectionLight {}

	/*
	 * <code>LightSprite</code> 类用于创建灯光的父类。
	 */

	class LightSprite extends laya.d3.core.light.LightSprite {}

	/*
	 * <code>PointLight</code> 类用于创建点光。
	 */

	class PointLight extends laya.d3.core.light.PointLight {}

	/*
	 * <code>SpotLight</code> 类用于创建聚光。
	 */

	class SpotLight extends laya.d3.core.light.SpotLight {}

	/*
	 * <code>BaseMaterial</code> 类用于创建材质。
	 */

	class BaseMaterial extends laya.d3.core.material.BaseMaterial {}

	/*
	 * <code>BlinnPhongMaterial</code> 类用于实现Blinn-Phong材质。
	 */

	class BlinnPhongMaterial extends laya.d3.core.material.BlinnPhongMaterial {}

	/*
	 * <code>EffectMaterial</code> 类用于实现Mesh特效材质。
	 */

	class EffectMaterial extends laya.d3.core.material.EffectMaterial {}

	/*
	 * ...
	 * @author ...
	 */

	class ExtendTerrainMaterial extends laya.d3.core.material.ExtendTerrainMaterial {}

	/*
	 * <code>PBRSpecularMaterial</code> 类用于实现PBR(Specular)材质。
	 */

	class PBRSpecularMaterial extends laya.d3.core.material.PBRSpecularMaterial {}

	/*
	 * <code>PBRStandardMaterial</code> 类用于实现PBR(Standard)材质。
	 */

	class PBRStandardMaterial extends laya.d3.core.material.PBRStandardMaterial {}

	/*
	 * <code>RenderState</code> 类用于控制渲染状态。
	 */

	class RenderState extends laya.d3.core.material.RenderState {}

	/*
	 * <code>SkyBoxMaterial</code> 类用于实现SkyBoxMaterial材质。
	 */

	class SkyBoxMaterial extends laya.d3.core.material.SkyBoxMaterial {}

	/*
	 * <code>SkyProceduralMaterial</code> 类用于实现SkyProceduralMaterial材质。
	 */

	class SkyProceduralMaterial extends laya.d3.core.material.SkyProceduralMaterial {}

	/*
	 * <code>UnlitMaterial</code> 类用于实现不受光照影响的材质。
	 */

	class UnlitMaterial extends laya.d3.core.material.UnlitMaterial {}

	/*
	 * <code>WaterPrimaryMaterial</code> 类用于实现水材质。
	 */

	class WaterPrimaryMaterial extends laya.d3.core.material.WaterPrimaryMaterial {}

	/*
	 * <code>MeshFilter</code> 类用于创建网格过滤器。
	 */

	class MeshFilter extends laya.d3.core.MeshFilter {}

	/*
	 * <code>MeshRenderer</code> 类用于网格渲染器。
	 */

	class MeshRenderer extends laya.d3.core.MeshRenderer {}

	/*
	 * <code>MeshSprite3D</code> 类用于创建网格。
	 */

	class MeshSprite3D extends laya.d3.core.MeshSprite3D {}

	class MeshSprite3DShaderDeclaration extends laya.d3.core.MeshSprite3DShaderDeclaration {}

	/*
	 * <code>TerrainMeshSprite3D</code> 类用于创建网格。
	 */

	class MeshTerrainSprite3D extends laya.d3.core.MeshTerrainSprite3D {}

	/*
	 * <code>Burst</code> 类用于粒子的爆裂描述。
	 */

	class Burst extends laya.d3.core.particleShuriKen.module.Burst {}

	/*
	 * <code>ColorOverLifetime</code> 类用于粒子的生命周期颜色。
	 */

	class ColorOverLifetime extends laya.d3.core.particleShuriKen.module.ColorOverLifetime {}

	/*
	 * <code>Emission</code> 类用于粒子发射器。
	 */

	class Emission extends laya.d3.core.particleShuriKen.module.Emission {}

	/*
	 * <code>FrameOverTime</code> 类用于创建时间帧。
	 */

	class FrameOverTime extends laya.d3.core.particleShuriKen.module.FrameOverTime {}

	/*
	 * <code>GradientRotation</code> 类用于创建渐变角速度。
	 */

	class GradientAngularVelocity extends laya.d3.core.particleShuriKen.module.GradientAngularVelocity {}

	/*
	 * <code>GradientColor</code> 类用于创建渐变颜色。
	 */

	class GradientColor extends laya.d3.core.particleShuriKen.module.GradientColor {}

	/*
	 * <code>GradientDataInt</code> 类用于创建整形渐变。
	 */

	class GradientDataInt extends laya.d3.core.particleShuriKen.module.GradientDataInt {}

	/*
	 * <code>GradientDataNumber</code> 类用于创建浮点渐变。
	 */

	class GradientDataNumber extends laya.d3.core.particleShuriKen.module.GradientDataNumber {}

	/*
	 * <code>GradientDataVector2</code> 类用于创建二维向量渐变。
	 */

	class GradientDataVector2 extends laya.d3.core.particleShuriKen.module.GradientDataVector2 {}

	/*
	 * <code>GradientSize</code> 类用于创建渐变尺寸。
	 */

	class GradientSize extends laya.d3.core.particleShuriKen.module.GradientSize {}

	/*
	 * <code>GradientVelocity</code> 类用于创建渐变速度。
	 */

	class GradientVelocity extends laya.d3.core.particleShuriKen.module.GradientVelocity {}

	/*
	 * <code>RotationOverLifetime</code> 类用于粒子的生命周期旋转。
	 */

	class RotationOverLifetime extends laya.d3.core.particleShuriKen.module.RotationOverLifetime {}

	/*
	 * <code>BaseShape</code> 类用于粒子形状。
	 */

	class BaseShape extends laya.d3.core.particleShuriKen.module.shape.BaseShape {}

	/*
	 * <code>BoxShape</code> 类用于创建球形粒子形状。
	 */

	class BoxShape extends laya.d3.core.particleShuriKen.module.shape.BoxShape {}

	/*
	 * <code>CircleShape</code> 类用于创建环形粒子形状。
	 */

	class CircleShape extends laya.d3.core.particleShuriKen.module.shape.CircleShape {}

	/*
	 * <code>ConeShape</code> 类用于创建锥形粒子形状。
	 */

	class ConeShape extends laya.d3.core.particleShuriKen.module.shape.ConeShape {}

	/*
	 * <code>HemisphereShape</code> 类用于创建半球形粒子形状。
	 */

	class HemisphereShape extends laya.d3.core.particleShuriKen.module.shape.HemisphereShape {}

	/*
	 * ...
	 * @author ...
	 */

	class ShapeUtils extends laya.d3.core.particleShuriKen.module.shape.ShapeUtils {}

	/*
	 * <code>SphereShape</code> 类用于创建球形粒子形状。
	 */

	class SphereShape extends laya.d3.core.particleShuriKen.module.shape.SphereShape {}

	/*
	 * <code>SizeOverLifetime</code> 类用于粒子的生命周期尺寸。
	 */

	class SizeOverLifetime extends laya.d3.core.particleShuriKen.module.SizeOverLifetime {}

	/*
	 * <code>StartFrame</code> 类用于创建开始帧。
	 */

	class StartFrame extends laya.d3.core.particleShuriKen.module.StartFrame {}

	/*
	 * <code>TextureSheetAnimation</code> 类用于创建粒子帧动画。
	 */

	class TextureSheetAnimation extends laya.d3.core.particleShuriKen.module.TextureSheetAnimation {}

	/*
	 * <code>VelocityOverLifetime</code> 类用于粒子的生命周期速度。
	 */

	class VelocityOverLifetime extends laya.d3.core.particleShuriKen.module.VelocityOverLifetime {}

	/*
	 * <code>ShuriKenParticle3D</code> 3D粒子。
	 */

	class ShuriKenParticle3D extends laya.d3.core.particleShuriKen.ShuriKenParticle3D {}

	class ShuriKenParticle3DShaderDeclaration extends laya.d3.core.particleShuriKen.ShuriKenParticle3DShaderDeclaration {}

	/*
	 * <code>ShurikenParticleMaterial</code> 类用于实现粒子材质。
	 */

	class ShurikenParticleMaterial extends laya.d3.core.particleShuriKen.ShurikenParticleMaterial {}

	/*
	 * <code>ShurikenParticleRender</code> 类用于创建3D粒子渲染器。
	 */

	class ShurikenParticleRenderer extends laya.d3.core.particleShuriKen.ShurikenParticleRenderer {}

	/*
	 * <code>ShurikenParticleSystem</code> 类用于创建3D粒子数据模板。
	 */

	class ShurikenParticleSystem extends laya.d3.core.particleShuriKen.ShurikenParticleSystem {}

	/*
	 * <code>PixelLineData</code> 类用于表示线数据。
	 */

	class PixelLineData extends laya.d3.core.pixelLine.PixelLineData {}

	/*
	 * <code>PixelLineFilter</code> 类用于线过滤器。
	 */

	class PixelLineFilter extends laya.d3.core.pixelLine.PixelLineFilter {}

	/*
	 * <code>PixelLineMaterial</code> 类用于实现像素线材质。
	 */

	class PixelLineMaterial extends laya.d3.core.pixelLine.PixelLineMaterial {}

	/*
	 * <code>PixelLineRenderer</code> 类用于线渲染器。
	 */

	class PixelLineRenderer extends laya.d3.core.pixelLine.PixelLineRenderer {}

	/*
	 * <code>PixelLineSprite3D</code> 类用于像素线渲染精灵。
	 */

	class PixelLineSprite3D extends laya.d3.core.pixelLine.PixelLineSprite3D {}

	/*
	 * ...
	 * @author 
	 */

	class PixelLineVertex extends laya.d3.core.pixelLine.PixelLineVertex {}

	/*
	 * <code>QuaternionKeyframe</code> 类用于创建四元数关键帧实例。
	 */

	class QuaternionKeyframe extends laya.d3.core.QuaternionKeyframe {}

	/*
	 * <code>Render</code> 类用于渲染器的父类，抽象类不允许实例。
	 */

	class BaseRender extends laya.d3.core.render.BaseRender {}

	/*
	 * <code>BloomEffect</code> 类用于创建泛光效果。
	 */

	class BloomEffect extends laya.d3.core.render.BloomEffect {}

	/*
	 * <code>BlitCMD</code> 类用于创建从一张渲染目标输出到另外一张渲染目标指令。
	 */

	class BlitScreenQuadCMD extends laya.d3.core.render.command.BlitScreenQuadCMD {}

	/*
	 * <code>Command</code> 类用于创建指令。
	 */

	class Command extends laya.d3.core.render.command.Command {}

	/*
	 * <code>CommandBuffer</code> 类用于创建命令流。
	 */

	class CommandBuffer extends laya.d3.core.render.command.CommandBuffer {}

	/*
	 * <code>PostProcessEffect</code> 类用于创建后期处理渲染效果。
	 */

	class PostProcessEffect extends laya.d3.core.render.PostProcessEffect {}

	/*
	 * * <code>PostProcessRenderContext</code> 类用于创建后期处理渲染上下文。
	 */

	class PostProcessRenderContext extends laya.d3.core.render.PostProcessRenderContext {}

	/*
	 * <code>RenderContext3D</code> 类用于实现渲染状态。
	 */

	class RenderContext3D extends laya.d3.core.render.RenderContext3D {}

	/*
	 * <code>RenderElement</code> 类用于实现渲染元素。
	 */

	class RenderElement extends laya.d3.core.render.RenderElement {}

	/*
	 * <code>ScreenQuad</code> 类用于创建全屏四边形。
	 */

	class ScreenQuad extends laya.d3.core.render.ScreenQuad {}

	/*
	 * <code>ScreenTriangle</code> 类用于创建全屏三角形。
	 */

	class ScreenTriangle extends laya.d3.core.render.ScreenTriangle {}

	/*
	 * <code>RenderableSprite3D</code> 类用于可渲染3D精灵的父类，抽象类不允许实例。
	 */

	class RenderableSprite3D extends laya.d3.core.RenderableSprite3D {}

	/*
	 * <code>BoundsOctree</code> 类用于创建八叉树。
	 */

	class BoundsOctree extends laya.d3.core.scene.BoundsOctree {}

	/*
	 * <code>BoundsOctreeNode</code> 类用于创建八叉树节点。
	 */

	class BoundsOctreeNode extends laya.d3.core.scene.BoundsOctreeNode {}

	/*
	 * <code>OctreeMotionList</code> 类用于实现物理更新队列。
	 */

	class OctreeMotionList extends laya.d3.core.scene.OctreeMotionList {}

	/*
	 * <code>Scene3D</code> 类用于实现场景。
	 */

	class Scene3D extends laya.d3.core.scene.Scene3D {}

	class Scene3DShaderDeclaration extends laya.d3.core.scene.Scene3DShaderDeclaration {}

	/*
	 * ...
	 * @author ...
	 */

	class SceneManager extends laya.d3.core.scene.SceneManager {}

	/*
	 * <code>SkinMeshRenderer</code> 类用于蒙皮渲染器。
	 */

	class SkinnedMeshRenderer extends laya.d3.core.SkinnedMeshRenderer {}

	/*
	 * <code>SkinnedMeshSprite3D</code> 类用于创建网格。
	 */

	class SkinnedMeshSprite3D extends laya.d3.core.SkinnedMeshSprite3D {}

	class SkinnedMeshSprite3DShaderDeclaration extends laya.d3.core.SkinnedMeshSprite3DShaderDeclaration {}

	/*
	 * <code>Sprite3D</code> 类用于实现3D精灵。
	 */

	class Sprite3D extends laya.d3.core.Sprite3D {}

	class TextureMode extends laya.d3.core.TextureMode {}

	/*
	 * <code>TrailFilter</code> 类用于创建拖尾过滤器。
	 */

	class TrailFilter extends laya.d3.core.trail.TrailFilter {}

	/*
	 * <code>TrailGeometry</code> 类用于创建拖尾渲染单元。
	 */

	class TrailGeometry extends laya.d3.core.trail.TrailGeometry {}

	/*
	 * <code>TrailMaterial</code> 类用于实现拖尾材质。
	 */

	class TrailMaterial extends laya.d3.core.trail.TrailMaterial {}

	/*
	 * <code>TrailRenderer</code> 类用于创建拖尾渲染器。
	 */

	class TrailRenderer extends laya.d3.core.trail.TrailRenderer {}

	/*
	 * <code>TrailSprite3D</code> 类用于创建拖尾渲染精灵。
	 */

	class TrailSprite3D extends laya.d3.core.trail.TrailSprite3D {}

	/*
	 * <code>VertexTrail</code> 类用于创建拖尾顶点结构。
	 */

	class VertexTrail extends laya.d3.core.trail.VertexTrail {}

	/*
	 * <code>Transform3D</code> 类用于实现3D变换。
	 */

	class Transform3D extends laya.d3.core.Transform3D {}

	/*
	 * <code>Vector3Keyframe</code> 类用于创建三维向量关键帧实例。
	 */

	class Vector3Keyframe extends laya.d3.core.Vector3Keyframe {}

	/*
	 * <code>IndexBuffer3D</code> 类用于创建索引缓冲。
	 */

	class IndexBuffer3D extends laya.d3.graphics.IndexBuffer3D {}

	/*
	 * <code>StaticBatchManager</code> 类用于静态批处理管理的父类。
	 */

	class StaticBatchManager extends laya.d3.graphics.StaticBatchManager {}

	/*
	 * ...
	 * @author ...
	 */

	class VertexMesh extends laya.d3.graphics.Vertex.VertexMesh {}

	/*
	 * <code>VertexPositionTerrain</code> 类用于创建位置、法线、纹理1、纹理2顶点结构。
	 */

	class VertexPositionTerrain extends laya.d3.graphics.Vertex.VertexPositionTerrain {}

	/*
	 * <code>VertexPositionNormalTexture</code> 类用于创建位置、纹理顶点结构。
	 */

	class VertexPositionTexture0 extends laya.d3.graphics.Vertex.VertexPositionTexture0 {}

	/*
	 * ...
	 * @author ...
	 */

	class VertexShuriKenParticle extends laya.d3.graphics.Vertex.VertexShuriKenParticle {}

	/*
	 * <code>VertexShurikenParticle</code> 类用于创建粒子顶点结构。
	 */

	class VertexShurikenParticleBillboard extends laya.d3.graphics.Vertex.VertexShurikenParticleBillboard {}

	/*
	 * /**
	 *    <code>VertexShurikenParticle</code> 类用于创建粒子顶点结构。
	 */

	class VertexShurikenParticleMesh extends laya.d3.graphics.Vertex.VertexShurikenParticleMesh {}

	/*
	 * <code>VertexBuffer3D</code> 类用于创建顶点缓冲。
	 */

	class VertexBuffer3D extends laya.d3.graphics.VertexBuffer3D {}

	/*
	 * <code>VertexDeclaration</code> 类用于生成顶点声明。
	 */

	class VertexDeclaration extends laya.d3.graphics.VertexDeclaration {}

	/*
	 * <code>VertexElement</code> 类用于创建顶点结构分配。
	 */

	class VertexElement extends laya.d3.graphics.VertexElement {}

	/*
	 * ...
	 * @author ...
	 */

	class VertexElementFormat extends laya.d3.graphics.VertexElementFormat {}

	/*
	 * <code>Input3D</code> 类用于实现3D输入。
	 */

	class Input3D extends laya.d3.Input3D {}

	/*
	 * ...
	 * @author ...
	 */

	class MeshReader extends laya.d3.loaders.MeshReader {}

	/*
	 * <code>BoundBox</code> 类用于创建包围盒。
	 */

	class BoundBox extends laya.d3.math.BoundBox {}

	/*
	 * <code>BoundFrustum</code> 类用于创建锥截体。
	 */

	class BoundFrustum extends laya.d3.math.BoundFrustum {}

	/*
	 * <code>BoundSphere</code> 类用于创建包围球。
	 */

	class BoundSphere extends laya.d3.math.BoundSphere {}

	/*
	 * <code>Collision</code> 类用于检测碰撞。
	 */

	class CollisionUtils extends laya.d3.math.CollisionUtils {}

	/*
	 * <code>Color</code> 类用于创建颜色实例。
	 */

	class Color extends laya.d3.math.Color {}

	/*
	 * <code>ContainmentType</code> 类用于定义空间物体位置关系。
	 */

	class ContainmentType extends laya.d3.math.ContainmentType {}

	/*
	 * <code>HalfFloatUtils</code> 类用于创建HalfFloat工具。
	 */

	class HalfFloatUtils extends laya.d3.math.HalfFloatUtils {}

	/*
	 * <code>MathUtils</code> 类用于创建数学工具。
	 */

	class MathUtils3D extends laya.d3.math.MathUtils3D {}

	/*
	 * <code>Matrix3x3</code> 类用于创建3x3矩阵。
	 */

	class Matrix3x3 extends laya.d3.math.Matrix3x3 {}

	/*
	 * <code>Matrix4x4</code> 类用于创建4x4矩阵。
	 */

	class Matrix4x4 extends laya.d3.math.Matrix4x4 {}

	/*
	 * <code>Quaternion</code> 类用于创建四元数。
	 */

	class ConchQuaternion extends laya.d3.math.Native.ConchQuaternion {}

	/*
	 * <code>Vector3</code> 类用于创建三维向量。
	 */

	class ConchVector3 extends laya.d3.math.Native.ConchVector3 {}

	/*
	 * <code>Vector4</code> 类用于创建四维向量。
	 */

	class ConchVector4 extends laya.d3.math.Native.ConchVector4 {}

	/*
	 * <code>Plane</code> 类用于创建平面。
	 */

	class Plane extends laya.d3.math.Plane {}

	/*
	 * <code>Quaternion</code> 类用于创建四元数。
	 */

	class Quaternion extends laya.d3.math.Quaternion {}

	/*
	 * <code>Rand</code> 类用于通过32位无符号整型随机种子创建随机数。
	 */

	class Rand extends laya.d3.math.Rand {}

	/*
	 * <code>Rand</code> 类用于通过128位整型种子创建随机数,算法来自:https://github.com/AndreasMadsen/xorshift。
	 */

	class RandX extends laya.d3.math.RandX {}

	/*
	 * <code>Ray</code> 类用于创建射线。
	 */

	class Ray extends laya.d3.math.Ray {}

	/*
	 * <code>Vector2</code> 类用于创建二维向量。
	 */

	class Vector2 extends laya.d3.math.Vector2 {}

	/*
	 * <code>Vector3</code> 类用于创建三维向量。
	 */

	class Vector3 extends laya.d3.math.Vector3 {}

	/*
	 * <code>Vector4</code> 类用于创建四维向量。
	 */

	class Vector4 extends laya.d3.math.Vector4 {}

	/*
	 * <code>Viewport</code> 类用于创建视口。
	 */

	class Viewport extends laya.d3.math.Viewport {}

	/*
	 * <code>CharacterController</code> 类用于创建角色控制器。
	 */

	class CharacterController extends laya.d3.physics.CharacterController {}

	/*
	 * <code>Collision</code> 类用于创建物理碰撞信息。
	 */

	class Collision extends laya.d3.physics.Collision {}

	/*
	 * <code>CollisionMap</code> 类用于实现碰撞组合实例图。
	 */

	class CollisionTool extends laya.d3.physics.CollisionTool {}

	/*
	 * ...
	 * @author ...
	 */

	class Constraint3D extends laya.d3.physics.Constraint3D {}

	/*
	 * <code>ConstraintComponent</code> 类用于创建约束的父类。
	 */

	class ConstraintComponent extends laya.d3.physics.constraints.ConstraintComponent {}

	/*
	 * <code>Point2PointConstraint</code> 类用于创建物理组件的父类。
	 */

	class Point2PointConstraint extends laya.d3.physics.constraints.Point2PointConstraint {}

	/*
	 * <code>ContactPoint</code> 类用于创建物理碰撞信息。
	 */

	class ContactPoint extends laya.d3.physics.ContactPoint {}

	/*
	 * <code>HitResult</code> 类用于实现射线检测或形状扫描的结果。
	 */

	class HitResult extends laya.d3.physics.HitResult {}

	class Physics3D extends laya.d3.physics.Physics3D {}

	/*
	 * <code>PhysicsCollider</code> 类用于创建物理碰撞器。
	 */

	class PhysicsCollider extends laya.d3.physics.PhysicsCollider {}

	/*
	 * <code>PhysicsComponent</code> 类用于创建物理组件的父类。
	 */

	class PhysicsComponent extends laya.d3.physics.PhysicsComponent {}

	/*
	 * <code>PhysicsSettings</code> 类用于创建物理配置信息。
	 */

	class PhysicsSettings extends laya.d3.physics.PhysicsSettings {}

	/*
	 * <code>Simulation</code> 类用于创建物理模拟器。
	 */

	class PhysicsSimulation extends laya.d3.physics.PhysicsSimulation {}

	/*
	 * <code>PhysicsTriggerComponent</code> 类用于创建物理触发器组件。
	 */

	class PhysicsTriggerComponent extends laya.d3.physics.PhysicsTriggerComponent {}

	/*
	 * <code>PhysicsUpdateList</code> 类用于实现物理更新队列。
	 */

	class PhysicsUpdateList extends laya.d3.physics.PhysicsUpdateList {}

	/*
	 * <code>Rigidbody3D</code> 类用于创建刚体碰撞器。
	 */

	class Rigidbody3D extends laya.d3.physics.Rigidbody3D {}

	/*
	 * <code>BoxColliderShape</code> 类用于创建盒子形状碰撞器。
	 */

	class BoxColliderShape extends laya.d3.physics.shape.BoxColliderShape {}

	/*
	 * <code>CapsuleColliderShape</code> 类用于创建胶囊形状碰撞器。
	 */

	class CapsuleColliderShape extends laya.d3.physics.shape.CapsuleColliderShape {}

	/*
	 * <code>ColliderShape</code> 类用于创建形状碰撞器的父类，该类为抽象类。
	 */

	class ColliderShape extends laya.d3.physics.shape.ColliderShape {}

	/*
	 * <code>CompoundColliderShape</code> 类用于创建盒子形状碰撞器。
	 */

	class CompoundColliderShape extends laya.d3.physics.shape.CompoundColliderShape {}

	/*
	 * <code>ConeColliderShape</code> 类用于创建圆柱碰撞器。
	 */

	class ConeColliderShape extends laya.d3.physics.shape.ConeColliderShape {}

	/*
	 * <code>CylinderColliderShape</code> 类用于创建圆柱碰撞器。
	 */

	class CylinderColliderShape extends laya.d3.physics.shape.CylinderColliderShape {}

	/*
	 * ...
	 * @author ...
	 */

	class HeightfieldColliderShape extends laya.d3.physics.shape.HeightfieldColliderShape {}

	/*
	 * <code>MeshColliderShape</code> 类用于创建网格碰撞器。
	 */

	class MeshColliderShape extends laya.d3.physics.shape.MeshColliderShape {}

	/*
	 * <code>SphereColliderShape</code> 类用于创建球形碰撞器。
	 */

	class SphereColliderShape extends laya.d3.physics.shape.SphereColliderShape {}

	/*
	 * <code>StaticPlaneColliderShape</code> 类用于创建静态平面碰撞器。
	 */

	class StaticPlaneColliderShape extends laya.d3.physics.shape.StaticPlaneColliderShape {}

	/*
	 * <code>Mesh</code> 类用于创建文件网格数据模板。
	 */

	class Mesh extends laya.d3.resource.models.Mesh {}

	/*
	 * <code>PrimitiveMesh</code> 类用于创建简单网格。
	 */

	class PrimitiveMesh extends laya.d3.resource.models.PrimitiveMesh {}

	/*
	 * <code>SkyBox</code> 类用于创建天空盒。
	 */

	class SkyBox extends laya.d3.resource.models.SkyBox {}

	/*
	 * <code>SkyDome</code> 类用于创建天空盒。
	 */

	class SkyDome extends laya.d3.resource.models.SkyDome {}

	/*
	 * <code>SkyMesh</code> 类用于实现天空网格。
	 */

	class SkyMesh extends laya.d3.resource.models.SkyMesh {}

	/*
	 * <code>SkyRenderer</code> 类用于实现天空渲染器。
	 */

	class SkyRenderer extends laya.d3.resource.models.SkyRenderer {}

	/*
	 * <code>SubMesh</code> 类用于创建子网格数据模板。
	 */

	class SubMesh extends laya.d3.resource.models.SubMesh {}

	/*
	 * //* <code>RenderTexture</code> 类用于创建渲染目标。
	 */

	class RenderTexture extends laya.d3.resource.RenderTexture {}

	/*
	 * <code>TextureCube</code> 类用于生成立方体纹理。
	 */

	class TextureCube extends laya.d3.resource.TextureCube {}

	/*
	 * ...
	 * @author 
	 */

	class TextureGenerator extends laya.d3.resource.TextureGenerator {}

	/*
	 * <code>DefineDatas</code> 类用于创建宏定义数据。
	 */

	class DefineDatas extends laya.d3.shader.DefineDatas {}

	/*
	 * <code>Shader3D</code> 类用于创建Shader3D。
	 */

	class Shader3D extends laya.d3.shader.Shader3D {}

	/*
	 * @private 
	 */

	class ShaderData extends laya.d3.shader.ShaderData {}

	class ShaderDefines extends laya.d3.shader.ShaderDefines {}

	/*
	 * <code>ShaderPass</code> 类用于实现ShaderPass。
	 */

	class ShaderPass extends laya.d3.shader.ShaderPass {}

	/*
	 * <code>SubShader</code> 类用于创建SubShader。
	 */

	class SubShader extends laya.d3.shader.SubShader {}

	/*
	 * ...
	 * @author ...
	 */

	class ParallelSplitShadowMap extends laya.d3.shadowMap.ParallelSplitShadowMap {}

	/*
	 * <code>TextMesh</code> 类用于创建文本网格。
	 */

	class TextMesh extends laya.d3.text.TextMesh {}

	/*
	 * <code>Touch</code> 类用于实现触摸描述。
	 */

	class Touch extends laya.d3.Touch {}

	/*
	 * <code>Physics</code> 类用于简单物理检测。
	 */

	class Physics3DUtils extends laya.d3.utils.Physics3DUtils {}

	/*
	 * <code>Picker</code> 类用于创建拾取。
	 */

	class Picker extends laya.d3.utils.Picker {}

	/*
	 * <code>Utils3D</code> 类用于创建3D工具。
	 */

	class Scene3DUtils extends laya.d3.utils.Scene3DUtils {}

	class Size extends laya.d3.utils.Size {}

	/*
	 * <code>Utils3D</code> 类用于创建3D工具。
	 */

	class Utils3D extends laya.d3.utils.Utils3D {}

	/*
	 * 使用前可用<code>supported</code>查看浏览器支持。
	 */

	class Geolocation extends laya.device.geolocation.Geolocation {}

	class GeolocationInfo extends laya.device.geolocation.GeolocationInfo {}

	/*
	 * Media用于捕捉摄像头和麦克风。可以捕捉任意之一，或者同时捕捉两者。<code>getCamera</code>前可以使用<code>supported()</code>检查当前浏览器是否支持。
	 * <b>NOTE:</b>
	 * <p>目前Media在移动平台只支持Android，不支持IOS。只可在FireFox完整地使用，Chrome测试时无法捕捉视频。</p>
	 */

	class Media extends laya.device.media.Media {}

	/*
	 * <code>Video</code>将视频显示到Canvas上。<code>Video</code>可能不会在所有浏览器有效。
	 * <p>关于Video支持的所有事件参见：<i>http://www.w3school.com.cn/tags/html_ref_audio_video_dom.asp</i>。</p>
	 * <p>
	 * <b>注意：</b><br/>
	 * 在PC端可以在任何时机调用<code>play()</code>因此，可以在程序开始运行时就使Video开始播放。但是在移动端，只有在用户第一次触碰屏幕后才可以调用play()，所以移动端不可能在程序开始运行时就自动开始播放Video。
	 * </p>
	 * 
	 * <p>MDN Video链接： <i>https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video</i></p>
	 */

	class Video extends laya.device.media.Video {}

	/*
	 * 加速度x/y/z的单位均为m/s²。
	 * 在硬件（陀螺仪）不支持的情况下，alpha、beta和gamma值为null。
	 * @author Survivor
	 */

	class AccelerationInfo extends laya.device.motion.AccelerationInfo {}

	/*
	 * Accelerator.instance获取唯一的Accelerator引用，请勿调用构造函数。
	 * 
	 * <p>
	 * listen()的回调处理器接受四个参数：
	 * <ol>
	 * <li><b>acceleration</b>: 表示用户给予设备的加速度。</li>
	 * <li><b>accelerationIncludingGravity</b>: 设备受到的总加速度（包含重力）。</li>
	 * <li><b>rotationRate</b>: 设备的自转速率。</li>
	 * <li><b>interval</b>: 加速度获取的时间间隔（毫秒）。</li>
	 * </ol>
	 * </p>
	 * <p>
	 * <b>NOTE</b><br/>
	 * 如，rotationRate的alpha在apple和moz文档中都是z轴旋转角度，但是实测是x轴旋转角度。为了使各属性表示的值与文档所述相同，实际值与其他属性进行了对调。
	 * 其中：
	 * <ul>
	 * <li>alpha使用gamma值。</li>
	 * <li>beta使用alpha值。</li>
	 * <li>gamma使用beta。</li>
	 * </ul>
	 * 目前孰是孰非尚未可知，以此为注。
	 * </p>
	 */

	class Accelerator extends laya.device.motion.Accelerator {}

	/*
	 * 使用Gyroscope.instance获取唯一的Gyroscope引用，请勿调用构造函数。
	 * 
	 * <p>
	 * listen()的回调处理器接受两个参数：
	 * <code>function onOrientationChange(absolute:Boolean, info:RotationInfo):void</code>
	 * <ol>
	 * <li><b>absolute</b>: 指示设备是否可以提供绝对方位数据（指向地球坐标系），或者设备决定的任意坐标系。关于坐标系参见<i>https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Orientation_and_motion_data_explained</i>。</li>
	 * <li><b>info</b>: <code>RotationInfo</code>类型参数，保存设备的旋转值。</li>
	 * </ol>
	 * </p>
	 * 
	 * <p>
	 * 浏览器兼容性参见：<i>http://caniuse.com/#search=deviceorientation</i>
	 * </p>
	 */

	class Gyroscope extends laya.device.motion.Gyroscope {}

	/*
	 * 保存旋转信息的类。请勿修改本类的属性。
	 * @author Survivor
	 */

	class RotationInfo extends laya.device.motion.RotationInfo {}

	/*
	 * Shake只能在支持此操作的设备上有效。
	 */

	class Shake extends laya.device.Shake {}

	/*
	 * 动画播放完毕后调度。
	 * @eventType Event.COMPLETE
	 */

	/*
	 * 播放到某标签后调度。
	 * @eventType Event.LABEL
	 */

	/*
	 * <p> <code>Animation</code> 是Graphics动画类。实现了基于Graphics的动画创建、播放、控制接口。</p>
	 * <p>本类使用了动画模版缓存池，它以一定的内存开销来节省CPU开销，当相同的动画模版被多次使用时，相比于每次都创建新的动画模版，使用动画模版缓存池，只需创建一次，缓存之后多次复用，从而节省了动画模版创建的开销。</p>
	 * <p>动画模版缓存池，以key-value键值对存储，key可以自定义，也可以从指定的配置文件中读取，value为对应的动画模版，是一个Graphics对象数组，每个Graphics对象对应一个帧图像，动画的播放实质就是定时切换Graphics对象。</p>
	 * <p>使用set source、loadImages(...)、loadAtlas(...)、loadAnimation(...)方法可以创建动画模版。使用play(...)可以播放指定动画。</p>
	 * @example <caption>以下示例代码，创建了一个 <code>Text</code> 实例。</caption>package{import laya.display.Animation;import laya.net.Loader;import laya.utils.Handler;public class Animation_Example{public function Animation_Example(){Laya.init(640, 800);//设置游戏画布宽高、渲染模式。Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。init();//初始化}private function init():void{var animation:Animation = new Animation();//创建一个 Animation 类的实例对象 animation 。animation.loadAtlas("resource/ani/fighter.json");//加载图集并播放animation.x = 200;//设置 animation 对象的属性 x 的值，用于控制 animation 对象的显示位置。animation.y = 200;//设置 animation 对象的属性 x 的值，用于控制 animation 对象的显示位置。animation.interval = 50;//设置 animation 对象的动画播放间隔时间，单位：毫秒。animation.play();//播放动画。Laya.stage.addChild(animation);//将 animation 对象添加到显示列表。}}}
	 * @example Animation_Example();function Animation_Example(){    Laya.init(640, 800);//设置游戏画布宽高、渲染模式。    Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。    init();//初始化}function init(){    var animation = new Laya.Animation();//创建一个 Animation 类的实例对象 animation 。    animation.loadAtlas("resource/ani/fighter.json");//加载图集并播放    animation.x = 200;//设置 animation 对象的属性 x 的值，用于控制 animation 对象的显示位置。    animation.y = 200;//设置 animation 对象的属性 x 的值，用于控制 animation 对象的显示位置。    animation.interval = 50;//设置 animation 对象的动画播放间隔时间，单位：毫秒。    animation.play();//播放动画。    Laya.stage.addChild(animation);//将 animation 对象添加到显示列表。}
	 * @example import Animation = laya.display.Animation;class Animation_Example {    constructor() {        Laya.init(640, 800);//设置游戏画布宽高、渲染模式。        Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。        this.init();    }    private init(): void {        var animation:Animation = new Laya.Animation();//创建一个 Animation 类的实例对象 animation 。        animation.loadAtlas("resource/ani/fighter.json");//加载图集并播放        animation.x = 200;//设置 animation 对象的属性 x 的值，用于控制 animation 对象的显示位置。        animation.y = 200;//设置 animation 对象的属性 x 的值，用于控制 animation 对象的显示位置。        animation.interval = 50;//设置 animation 对象的动画播放间隔时间，单位：毫秒。        animation.play();//播放动画。        Laya.stage.addChild(animation);//将 animation 对象添加到显示列表。    }}new Animation_Example();
	 */

	class Animation extends laya.display.Animation {}

	/*
	 * 动画播放完毕后调度。
	 * @eventType Event.COMPLETE
	 */

	/*
	 * 播放到某标签后调度。
	 * @eventType Event.LABEL
	 */

	/*
	 * <p>动画基类，提供了基础的动画播放控制方法和帧标签事件相关功能。</p>
	 * <p>可以继承此类，但不要直接实例化此类，因为有些方法需要由子类实现。</p>
	 */

	class AnimationBase extends laya.display.AnimationBase {}

	/*
	 * <code>BitmapFont</code> 是位图字体类，用于定义位图字体信息。
	 * 字体制作及使用方法，请参考文章
	 * @see http://ldc2.layabox.com/doc/?nav=ch-js-1-2-5
	 */

	class BitmapFont extends laya.display.BitmapFont {}

	/*
	 * 透明命令
	 */

	class AlphaCmd extends laya.display.cmd.AlphaCmd {}

	/*
	 * 裁剪命令
	 */

	class ClipRectCmd extends laya.display.cmd.ClipRectCmd {}

	/*
	 * 绘制圆形
	 */

	class DrawCircleCmd extends laya.display.cmd.DrawCircleCmd {}

	/*
	 * 绘制曲线
	 */

	class DrawCurvesCmd extends laya.display.cmd.DrawCurvesCmd {}

	/*
	 * 绘制图片
	 */

	class DrawImageCmd extends laya.display.cmd.DrawImageCmd {}

	/*
	 * 绘制单条曲线
	 */

	class DrawLineCmd extends laya.display.cmd.DrawLineCmd {}

	/*
	 * 绘制连续曲线
	 */

	class DrawLinesCmd extends laya.display.cmd.DrawLinesCmd {}

	/*
	 * 绘制粒子
	 * @private 
	 */

	class DrawParticleCmd extends laya.display.cmd.DrawParticleCmd {}

	/*
	 * 根据路径绘制矢量图形
	 */

	class DrawPathCmd extends laya.display.cmd.DrawPathCmd {}

	/*
	 * 绘制扇形
	 */

	class DrawPieCmd extends laya.display.cmd.DrawPieCmd {}

	/*
	 * 绘制多边形
	 */

	class DrawPolyCmd extends laya.display.cmd.DrawPolyCmd {}

	/*
	 * 绘制矩形
	 */

	class DrawRectCmd extends laya.display.cmd.DrawRectCmd {}

	/*
	 * 绘制单个贴图
	 */

	class DrawTextureCmd extends laya.display.cmd.DrawTextureCmd {}

	/*
	 * 根据坐标集合绘制多个贴图
	 */

	class DrawTexturesCmd extends laya.display.cmd.DrawTexturesCmd {}

	/*
	 * 绘制三角形命令
	 */

	class DrawTrianglesCmd extends laya.display.cmd.DrawTrianglesCmd {}

	/*
	 * 绘制文本边框
	 */

	class FillBorderTextCmd extends laya.display.cmd.FillBorderTextCmd {}

	/*
	 * 绘制边框
	 */

	class FillBorderWordsCmd extends laya.display.cmd.FillBorderWordsCmd {}

	/*
	 * 绘制文字
	 */

	class FillTextCmd extends laya.display.cmd.FillTextCmd {}

	/*
	 * 填充贴图
	 */

	class FillTextureCmd extends laya.display.cmd.FillTextureCmd {}

	/*
	 * 填充文字命令
	 * @private 
	 */

	class FillWordsCmd extends laya.display.cmd.FillWordsCmd {}

	/*
	 * 恢复命令，和save配套使用
	 */

	class RestoreCmd extends laya.display.cmd.RestoreCmd {}

	/*
	 * 旋转命令
	 */

	class RotateCmd extends laya.display.cmd.RotateCmd {}

	/*
	 * 存储命令，和restore配套使用
	 */

	class SaveCmd extends laya.display.cmd.SaveCmd {}

	/*
	 * 缩放命令
	 */

	class ScaleCmd extends laya.display.cmd.ScaleCmd {}

	/*
	 * 绘制描边文字
	 */

	class StrokeTextCmd extends laya.display.cmd.StrokeTextCmd {}

	/*
	 * 矩阵命令
	 */

	class TransformCmd extends laya.display.cmd.TransformCmd {}

	/*
	 * 位移命令
	 */

	class TranslateCmd extends laya.display.cmd.TranslateCmd {}

	/*
	 * 元素样式
	 */

	class SpriteStyle extends laya.display.css.SpriteStyle {}

	/*
	 * 文本的样式类
	 */

	class TextStyle extends laya.display.css.TextStyle {}

	/*
	 * <p> 动效模板。用于为指定目标对象添加动画效果。每个动效有唯一的目标对象，而同一个对象可以添加多个动效。 当一个动效开始播放时，其他动效会自动停止播放。</p>
	 * <p> 可以通过LayaAir IDE创建。 </p>
	 */

	class EffectAnimation extends laya.display.EffectAnimation {}

	/*
	 * 动画播放完毕后调度。
	 * @eventType Event.COMPLETE
	 */

	/*
	 * 播放到某标签后调度。
	 * @eventType Event.LABEL
	 */

	/*
	 * 节点关键帧动画播放类。解析播放IDE内制作的节点动画。
	 */

	class FrameAnimation extends laya.display.FrameAnimation {}

	/*
	 * <code>Graphics</code> 类用于创建绘图显示对象。Graphics可以同时绘制多个位图或者矢量图，还可以结合save，restore，transform，scale，rotate，translate，alpha等指令对绘图效果进行变化。
	 * Graphics以命令流方式存储，可以通过cmds属性访问所有命令流。Graphics是比Sprite更轻量级的对象，合理使用能提高应用性能(比如把大量的节点绘图改为一个节点的Graphics命令集合，能减少大量节点创建消耗)。
	 * @see laya.display.Sprite#graphics
	 */

	class Graphics extends laya.display.Graphics {}

	/*
	 * @private Graphic bounds数据类
	 */

	class GraphicsBounds extends laya.display.GraphicsBounds {}

	/*
	 * 用户输入一个或多个文本字符时后调度。
	 * @eventType Event.INPUT
	 */

	/*
	 * 文本发生变化后调度。
	 * @eventType Event.CHANGE
	 */

	/*
	 * 用户在输入框内敲回车键后，将会调度 <code>enter</code> 事件。
	 * @eventType Event.ENTER
	 */

	/*
	 * 显示对象获得焦点后调度。
	 * @eventType Event.FOCUS
	 */

	/*
	 * 显示对象失去焦点后调度。
	 * @eventType Event.BLUR
	 */

	/*
	 * <p><code>Input</code> 类用于创建显示对象以显示和输入文本。</p>
	 * <p>Input 类封装了原生的文本输入框，由于不同浏览器的差异，会导致此对象的默认文本的位置与用户点击输入时的文本的位置有少许的偏差。</p>
	 */

	class Input extends laya.display.Input {}

	/*
	 * 添加到父对象后调度。
	 * @eventType Event.ADDED
	 */

	/*
	 * 被父对象移除后调度。
	 * @eventType Event.REMOVED
	 */

	/*
	 * 加入节点树时调度。
	 * @eventType Event.DISPLAY
	 */

	/*
	 * 从节点树移除时调度。
	 * @eventType Event.UNDISPLAY
	 */

	/*
	 * <code>Node</code> 类是可放在显示列表中的所有对象的基类。该显示列表管理 Laya 运行时中显示的所有对象。使用 Node 类排列显示列表中的显示对象。Node 对象可以有子显示对象。
	 */

	class Node extends laya.display.Node {}

	/*
	 * 场景类，负责场景创建，加载，销毁等功能
	 * 场景被从节点移除后，并不会被自动垃圾机制回收，如果想回收，请调用destroy接口，可以通过unDestroyedScenes属性查看还未被销毁的场景列表
	 */

	class Scene extends laya.display.Scene {}

}
