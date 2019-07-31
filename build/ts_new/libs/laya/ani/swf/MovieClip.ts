import { Sprite } from "../../display/Sprite";
import { Byte } from "../../utils/Byte";
import { Handler } from "../../utils/Handler";
import { Const } from "../../Const";
import { Event } from "../../events/Event";
import { ILaya } from "../../../ILaya";
import { Matrix } from "../../maths/Matrix";


/**
 * 动画播放完毕后调度。
 * @eventType Event.COMPLETE
 */
/*[Event(name = "complete", type = "laya.events.Event")]*/

/**
 * 播放到某标签后调度。
 * @eventType Event.LABEL
 */
/*[Event(name = "label", type = "laya.events.Event")]*/

/**
 * 加载完成后调度。
 * @eventType Event.LOADED
 */
/*[Event(name = "loaded", type = "laya.events.Event")]*/

/**
 * 进入帧后调度。
 * @eventType Event.FRAME
 */
/*[Event(name = "frame", type = "laya.events.Event")]*/

/**
 * <p> <code>MovieClip</code> 用于播放经过工具处理后的 swf 动画。</p>
 */
export class MovieClip extends Sprite {
	/**@internal */
	protected static _ValueList: any[] = ["x", "y", "width", "height", "scaleX", "scaleY", "rotation", "alpha"];
	/**@internal 数据起始位置。*/
	protected _start: number = 0;
	/**@internal 当前位置。*/
	protected _Pos: number = 0;
	/**@internal 数据。*/
	protected _data: Byte;
	/**@internal */
	protected _curIndex: number;
	/**@internal */
	protected _preIndex: number;
	/**@internal */
	protected _playIndex: number;
	/**@internal */
	protected _playing: boolean;
	/**@internal */
	protected _ended: boolean = true;
	/**@internal 总帧数。*/
	protected _count: number;
	/**@internal id_data起始位置表*/
	_ids: any;
	/**@internal */
	protected _loadedImage: any = {};
	/**@internal id_实例表*/
	_idOfSprite: any[];
	/**@internal 父mc*/
	_parentMovieClip: MovieClip;
	/**@internal 需要更新的movieClip表*/
	_movieClipList: any[];
	/**@internal */
	protected _labels: any;
	/**资源根目录。*/
	basePath: string;
	/**@internal */
	private _atlasPath: string;
	/**@internal */
	private _url: string;
	/**@internal */
	private _isRoot: boolean;
	/**@internal */
	private _completeHandler: Handler;
	/**@internal */
	private _endFrame: number = -1;

	/** 播放间隔(单位：毫秒)。*/
	interval: number = 30;
	/**是否循环播放 */
	loop: boolean;

	/**
	 * 创建一个 <code>MovieClip</code> 实例。
	 * @param parentMovieClip 父MovieClip,自己创建时不需要传该参数
	 */
	constructor(parentMovieClip: MovieClip = null) {
		super();
		this._ids = {};
		this._idOfSprite = [];
		this._reset();
		this._playing = false;
		this._parentMovieClip = parentMovieClip;
		if (!parentMovieClip) {
			this._movieClipList = [this];
			this._isRoot = true;
			this._setBitUp(Const.DISPLAY);
		} else {
			this._isRoot = false;
			this._movieClipList = parentMovieClip._movieClipList;
			this._movieClipList.push(this);
		}
	}

	/**
	 * <p>销毁此对象。以及销毁引用的Texture</p>
	 * @param	destroyChild 是否同时销毁子节点，若值为true,则销毁子节点，否则不销毁子节点。
	 * @override
	 */
	destroy(destroyChild: boolean = true): void {
		this._clear();
		super.destroy(destroyChild);
	}

	/**
	 * @internal
	 * @override 
	 */
	_setDisplay(value: boolean): void {
		super._setDisplay(value);
		if (this._isRoot) {
			this._onDisplay(value);
		}
	}
	/**
	 * @internal 
	 * @override
	 */
	protected _onDisplay(value?: boolean): void {
		if (value) this.timer.loop(this.interval, this, this.updates, null, true);
		else this.timer.clear(this, this.updates);
	}

	/**@private 更新时间轴*/
	//TODO:coverage
	updates(): void {
		if (this._parentMovieClip) return;
		var i: number, len: number;
		len = this._movieClipList.length;
		for (i = 0; i < len; i++) {
			this._movieClipList[i] && this._movieClipList[i]._update();
		}
	}

	/**当前播放索引。*/
	get index(): number {
		return this._playIndex;
	}

	set index(value: number) {
		this._playIndex = value;
		if (this._data)
			this._displayFrame(this._playIndex);
		if (this._labels && this._labels[value]) this.event(Event.LABEL, this._labels[value]);
	}

	/**
	 * 增加一个标签到index帧上，播放到此index后会派发label事件
	 * @param	label	标签名称
	 * @param	index	索引位置
	 */
	addLabel(label: string, index: number): void {
		if (!this._labels) this._labels = {};
		this._labels[index] = label;
	}

	/**
	 * 删除某个标签
	 * @param	label 标签名字，如果label为空，则删除所有Label
	 */
	removeLabel(label: string): void {
		if (!label) this._labels = null;
		else if (!this._labels) {
			for (var name in this._labels) {
				if (this._labels[name] === label) {
					delete this._labels[name];
					break;
				}
			}
		}
	}

	/**
	 * 帧总数。
	 */
	get count(): number {
		return this._count;
	}

	/**
	 * 是否在播放中
	 */
	get playing(): boolean {
		return this._playing;
	}
	/**
	 * @internal
	 * 动画的帧更新处理函数。
	 */
	//TODO:coverage
	private _update(): void {
		if (!this._data) return;
		if (!this._playing) return;
		this._playIndex++;
		if (this._playIndex >= this._count) {
			if (!this.loop) {
				this._playIndex--;
				this.stop();
				return;
			}
			this._playIndex = 0;
		}
		this._parseFrame(this._playIndex);
		if (this._labels && this._labels[this._playIndex]) this.event(Event.LABEL, this._labels[this._playIndex]);
		if (this._endFrame != -1 && this._endFrame == this._playIndex) {
			this._endFrame = -1;
			if (this._completeHandler != null) {
				var handler: Handler = this._completeHandler;
				this._completeHandler = null;
				handler.run();
			}
			this.stop();

		}
	}

	/**
	 * 停止播放动画。
	 */
	stop(): void {
		this._playing = false;
	}

	/**
	 * 跳到某帧并停止播放动画。
	 * @param frame 要跳到的帧
	 */
	gotoAndStop(index: number): void {
		this.index = index;
		this.stop();
	}

	/**
	 * @internal
	 * 清理。
	 */
	private _clear(): void {
		this.stop();
		this._idOfSprite.length = 0;
		if (!this._parentMovieClip) {
			this.timer.clear(this, this.updates);
			var i: number, len: number;
			len = this._movieClipList.length;
			for (i = 0; i < len; i++) {
				if (this._movieClipList[i] != this)
					this._movieClipList[i]._clear();
			}
			this._movieClipList.length = 0;
		}
		if (this._atlasPath) {
			ILaya.Loader.clearRes(this._atlasPath);
		}
		var key: string;
		for (key in this._loadedImage) {
			if (this._loadedImage[key]) {
				ILaya.Loader.clearRes(key);
				this._loadedImage[key] = false;
			}
		}
		this.removeChildren();
		this.graphics = null;
		this._parentMovieClip = null;
	}

	/**
	 * 播放动画。
	 * @param	index 帧索引。
	 */
	play(index: number = 0, loop: boolean = true): void {
		this.loop = loop;
		this._playing = true;
		if (this._data)
			this._displayFrame(index);
	}

	/**@internal */
	//TODO:coverage
	private _displayFrame(frameIndex: number = -1): void {
		if (frameIndex != -1) {
			if (this._curIndex > frameIndex) this._reset();
			this._parseFrame(frameIndex);
		}
	}

	/**@internal */
	private _reset(rm: boolean = true): void {
		if (rm && this._curIndex != 1) this.removeChildren();
		this._preIndex = this._curIndex = -1;
		this._Pos = this._start;
	}

	/**@internal */
	//TODO:coverage
	private _parseFrame(frameIndex: number): void {
		var mc: MovieClip, sp: Sprite, key: number, type: number, tPos: number, ttype: number, ifAdd: boolean = false;
		var _idOfSprite: any[] = this._idOfSprite, _data: Byte = this._data, eStr: string;
		if (this._ended) this._reset();
		_data.pos = this._Pos;
		this._ended = false;
		this._playIndex = frameIndex;
		if (this._curIndex > frameIndex && frameIndex < this._preIndex) {
			this._reset(true);
			_data.pos = this._Pos;
		}
		while ((this._curIndex <= frameIndex) && (!this._ended)) {
			type = _data.getUint16();
			switch (type) {
				case 12: //new MC
					key = _data.getUint16();
					tPos = this._ids[_data.getUint16()];
					this._Pos = _data.pos;
					_data.pos = tPos;
					if ((ttype = _data.getUint8()) == 0) {
						var pid: number = _data.getUint16();
						sp = _idOfSprite[key]
						if (!sp) {
							sp = _idOfSprite[key] = new Sprite();
							var spp: Sprite = new Sprite();
							spp.loadImage(this.basePath + pid + ".png");
							this._loadedImage[this.basePath + pid + ".png"] = true;
							sp.addChild(spp);
							spp.size(_data.getFloat32(), _data.getFloat32());
							var mat: Matrix = _data._getMatrix();
							spp.transform = mat;
						}
						sp.alpha = 1;
					} else if (ttype == 1) {
						mc = _idOfSprite[key]
						if (!mc) {
							_idOfSprite[key] = mc = new MovieClip(this);
							mc.interval = this.interval;
							mc._ids = this._ids;
							mc.basePath = this.basePath;
							mc._setData(_data, tPos);
							mc._initState();
							mc.play(0);
						}
						mc.alpha = 1;
					}
					_data.pos = this._Pos;
					break;
				case 3: //addChild
					var node: Sprite = _idOfSprite[ /*key*/_data.getUint16()];
					if (node) {
						this.addChild(node);
						node.zOrder = _data.getUint16();
						ifAdd = true;
					}
					break;
				case 4: //remove
					node = _idOfSprite[ /*key*/_data.getUint16()];
					node && node.removeSelf();
					break;
				case 5: //setValue
					_idOfSprite[_data.getUint16()][MovieClip._ValueList[_data.getUint16()]] = (_data.getFloat32());
					break;
				case 6: //visible
					_idOfSprite[_data.getUint16()].visible = ( /*visible*/_data.getUint8() > 0);
					break;
				case 7: //SetTransform
					sp = _idOfSprite[ /*key*/_data.getUint16()]; //.transform=mt;
					var mt: Matrix = sp.transform || Matrix.create();
					mt.setTo(_data.getFloat32(), _data.getFloat32(), _data.getFloat32(), _data.getFloat32(), _data.getFloat32(), _data.getFloat32());
					sp.transform = mt;
					break;
				case 8: //pos
					_idOfSprite[_data.getUint16()].setPos(_data.getFloat32(), _data.getFloat32());
					break;
				case 9: //size
					_idOfSprite[_data.getUint16()].setSize(_data.getFloat32(), _data.getFloat32());
					break;
				case 10: //alpha
					_idOfSprite[ /*key*/_data.getUint16()].alpha = /*alpha*/ _data.getFloat32();
					break;
				case 11: //scale
					_idOfSprite[_data.getUint16()].setScale(_data.getFloat32(), _data.getFloat32());
					break;
				case 98: //event		
					eStr = _data.getString();
					this.event(eStr);
					if (eStr == "stop") this.stop();
					break;
				case 99: //FrameBegin				
					this._curIndex = _data.getUint16();
					ifAdd && this.updateZOrder();
					break;
				case 100: //cmdEnd
					this._count = this._curIndex + 1;
					this._ended = true;
					if (this._playing) {
						this.event(Event.FRAME);
						this.event(Event.END);
						this.event(Event.COMPLETE);
					}

					this._reset(false);
					break;
			}
		}
		if (this._playing && !this._ended) this.event(Event.FRAME);
		this._Pos = _data.pos;
	}

	/**@internal */
	//TODO:coverage
	_setData(data: Byte, start: number): void {
		this._data = data;
		this._start = start + 3;
	}

	/**
	 * 资源地址。
	 */
	set url(path: string) {
		this.load(path);
	}

	/**
	 * 加载资源。
	 * @param	url swf 资源地址。
	 * @param   atlas  是否使用图集资源
	 * @param   atlasPath  图集路径，默认使用与swf同名的图集
	 */
	load(url: string, atlas: boolean = false, atlasPath: string = null): void {
		this._url = url;
		if (atlas) this._atlasPath = atlasPath ? atlasPath : url.split(".swf")[0] + ".json";
		this.stop();
		this._clear();
		this._movieClipList = [this];
		var urls: any[];
		urls = [{ url: url, type: ILaya.Loader.BUFFER }];
		if (this._atlasPath) {
			urls.push({ url: this._atlasPath, type: ILaya.Loader.ATLAS });
		}
		ILaya.loader.load(urls, Handler.create(this, this._onLoaded));
	}

	/**@internal */
	private _onLoaded(): void {
		var data: any;
		data = ILaya.Loader.getRes(this._url);
		if (!data) {
			this.event(Event.ERROR, "file not find");
			return;
		}
		if (this._atlasPath && !ILaya.Loader.getAtlas(this._atlasPath)) {
			this.event(Event.ERROR, "Atlas not find");
			return;
		}
		// guo TODO getAtlas 返回的会有dir么， 应该是数组
		this.basePath = this._atlasPath ? (ILaya.Loader.getAtlas(this._atlasPath) as any).dir : this._url.split(".swf")[0] + "/image/";
		this._initData(data);
	}

	/**@internal */
	//TODO:coverage
	private _initState(): void {
		this._reset();
		this._ended = false;
		var preState: boolean = this._playing;
		this._playing = false;
		this._curIndex = 0;
		while (!this._ended) this._parseFrame(++this._curIndex);
		this._playing = preState;
	}

	/**@internal */
	//TODO:coverage
	private _initData(data: any): void {
		this._data = new Byte(data);
		var i: number, len: number = this._data.getUint16();
		for (i = 0; i < len; i++) this._ids[this._data.getInt16()] = this._data.getInt32();
		this.interval = 1000 / this._data.getUint16();
		this._setData(this._data, this._ids[32767]);
		this._initState();
		this.play(0);
		this.event(Event.LOADED);
		if (!this._parentMovieClip) this.timer.loop(this.interval, this, this.updates, null, true);
	}


	/**
	 * 从开始索引播放到结束索引，结束之后出发complete回调
	 * @param	start	开始索引
	 * @param	end		结束索引
	 * @param	complete	结束回调
	 */
	playTo(start: number, end: number, complete: Handler = null): void {
		this._completeHandler = complete;
		this._endFrame = end;
		this.play(start, false);
	}
}

