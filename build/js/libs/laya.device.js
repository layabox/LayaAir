(function (exports, Laya) {
	'use strict';

	/**
	     * 加速度x/y/z的单位均为m/s²。
	     * 在硬件（陀螺仪）不支持的情况下，alpha、beta和gamma值为null。
	     *
	     * @author Survivor
	     */
	class AccelerationInfo {
	    constructor() {
	    }
	}

	/**
	     * 保存旋转信息的类。请勿修改本类的属性。
	     * @author Survivor
	     */
	class RotationInfo {
	    constructor() {
	    }
	}

	/**
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
	class Accelerator extends Laya.EventDispatcher {
	    constructor(singleton) {
	        super();
	        this.onDeviceOrientationChange = this.onDeviceOrientationChange.bind(this);
	    }
	    static get instance() {
	        Accelerator._instance = Accelerator._instance || new Accelerator(0);
	        return Accelerator._instance;
	    }
	    /**
	     * 侦听加速器运动。
	     * @param observer	回调函数接受4个参数，见类说明。
	     * @override
	     */
	    on(type, caller, listener, args = null) {
	        super.on(type, caller, listener, args);
	        Laya.ILaya.Browser.window.addEventListener('devicemotion', this.onDeviceOrientationChange);
	        return this;
	    }
	    /**
	     * 取消侦听加速器。
	     * @param	handle	侦听加速器所用处理器。
	     * @override
	     */
	    off(type, caller, listener, onceOnly = false) {
	        if (!this.hasListener(type))
	            Laya.ILaya.Browser.window.removeEventListener('devicemotion', this.onDeviceOrientationChange);
	        return super.off(type, caller, listener, onceOnly);
	    }
	    onDeviceOrientationChange(e) {
	        var interval = e.interval;
	        Accelerator.acceleration.x = e.acceleration.x;
	        Accelerator.acceleration.y = e.acceleration.y;
	        Accelerator.acceleration.z = e.acceleration.z;
	        Accelerator.accelerationIncludingGravity.x = e.accelerationIncludingGravity.x;
	        Accelerator.accelerationIncludingGravity.y = e.accelerationIncludingGravity.y;
	        Accelerator.accelerationIncludingGravity.z = e.accelerationIncludingGravity.z;
	        Accelerator.rotationRate.alpha = e.rotationRate.gamma * -1;
	        Accelerator.rotationRate.beta = e.rotationRate.alpha * -1;
	        Accelerator.rotationRate.gamma = e.rotationRate.beta;
	        if (Laya.ILaya.Browser.onAndroid) {
	            if (Laya.ILaya.Browser.userAgent.indexOf("Chrome") > -1) {
	                Accelerator.rotationRate.alpha *= 180 / Math.PI;
	                Accelerator.rotationRate.beta *= 180 / Math.PI;
	                Accelerator.rotationRate.gamma *= 180 / Math.PI;
	            }
	            Accelerator.acceleration.x *= -1;
	            Accelerator.accelerationIncludingGravity.x *= -1;
	        }
	        else if (Laya.ILaya.Browser.onIOS) {
	            Accelerator.acceleration.y *= -1;
	            Accelerator.acceleration.z *= -1;
	            Accelerator.accelerationIncludingGravity.y *= -1;
	            Accelerator.accelerationIncludingGravity.z *= -1;
	            interval *= 1000;
	        }
	        this.event(Laya.Event.CHANGE, [Accelerator.acceleration, Accelerator.accelerationIncludingGravity, Accelerator.rotationRate, interval]);
	    }
	    /**
	     * 把加速度值转换为视觉上正确的加速度值。依赖于Browser.window.orientation，可能在部分低端机无效。
	     * @param	acceleration
	     * @return
	     */
	    static getTransformedAcceleration(acceleration) {
	        Accelerator.transformedAcceleration = Accelerator.transformedAcceleration || new AccelerationInfo();
	        Accelerator.transformedAcceleration.z = acceleration.z;
	        if (Laya.ILaya.Browser.window.orientation == 90) {
	            Accelerator.transformedAcceleration.x = acceleration.y;
	            Accelerator.transformedAcceleration.y = -acceleration.x;
	        }
	        else if (Laya.ILaya.Browser.window.orientation == -90) {
	            Accelerator.transformedAcceleration.x = -acceleration.y;
	            Accelerator.transformedAcceleration.y = acceleration.x;
	        }
	        else if (!Laya.ILaya.Browser.window.orientation) {
	            Accelerator.transformedAcceleration.x = acceleration.x;
	            Accelerator.transformedAcceleration.y = acceleration.y;
	        }
	        else if (Laya.ILaya.Browser.window.orientation == 180) {
	            Accelerator.transformedAcceleration.x = -acceleration.x;
	            Accelerator.transformedAcceleration.y = -acceleration.y;
	        }
	        var tx;
	        if (Laya.ILaya.stage.canvasDegree == -90) {
	            tx = Accelerator.transformedAcceleration.x;
	            Accelerator.transformedAcceleration.x = -Accelerator.transformedAcceleration.y;
	            Accelerator.transformedAcceleration.y = tx;
	        }
	        else if (Laya.ILaya.stage.canvasDegree == 90) {
	            tx = Accelerator.transformedAcceleration.x;
	            Accelerator.transformedAcceleration.x = Accelerator.transformedAcceleration.y;
	            Accelerator.transformedAcceleration.y = -tx;
	        }
	        return Accelerator.transformedAcceleration;
	    }
	}
	Accelerator.acceleration = new AccelerationInfo();
	Accelerator.accelerationIncludingGravity = new AccelerationInfo();
	Accelerator.rotationRate = new RotationInfo();

	/**
	 * Shake只能在支持此操作的设备上有效。
	 *
	 */
	class Shake extends Laya.EventDispatcher {
	    constructor() {
	        super();
	    }
	    static get instance() {
	        Shake._instance = Shake._instance || new Shake();
	        return Shake._instance;
	    }
	    /**
	     * 开始响应设备摇晃。
	     * @param	throushold	响应的瞬时速度阈值，轻度摇晃的值约在5~10间。
	     * @param	timeout		设备摇晃的响应间隔时间。
	     * @param	callback	在设备摇晃触发时调用的处理器。
	     */
	    start(throushold, interval) {
	        this.throushold = throushold;
	        this.shakeInterval = interval;
	        this.lastX = this.lastY = this.lastZ = NaN;
	        // 使用加速器监听设备运动。
	        Accelerator.instance.on(Laya.Event.CHANGE, this, this.onShake);
	    }
	    /**
	     * 停止响应设备摇晃。
	     */
	    stop() {
	        Accelerator.instance.off(Laya.Event.CHANGE, this, this.onShake);
	    }
	    onShake(acceleration, accelerationIncludingGravity, rotationRate, interval) {
	        // 设定摇晃的初始状态。
	        if (isNaN(this.lastX)) {
	            this.lastX = accelerationIncludingGravity.x;
	            this.lastY = accelerationIncludingGravity.y;
	            this.lastZ = accelerationIncludingGravity.z;
	            this.lastMillSecond = Laya.ILaya.Browser.now();
	            return;
	        }
	        // 速度增量计算。
	        var deltaX = Math.abs(this.lastX - accelerationIncludingGravity.x);
	        var deltaY = Math.abs(this.lastY - accelerationIncludingGravity.y);
	        var deltaZ = Math.abs(this.lastZ - accelerationIncludingGravity.z);
	        // 是否满足摇晃选项。
	        if (this.isShaked(deltaX, deltaY, deltaZ)) {
	            var deltaMillSecond = Laya.ILaya.Browser.now() - this.lastMillSecond;
	            // 按照设定间隔触发摇晃。
	            if (deltaMillSecond > this.shakeInterval) {
	                this.event(Laya.Event.CHANGE);
	                this.lastMillSecond = Laya.ILaya.Browser.now();
	            }
	        }
	        this.lastX = accelerationIncludingGravity.x;
	        this.lastY = accelerationIncludingGravity.y;
	        this.lastZ = accelerationIncludingGravity.z;
	    }
	    // 通过任意两个分量判断是否满足摇晃设定。
	    isShaked(deltaX, deltaY, deltaZ) {
	        return (deltaX > this.throushold && deltaY > this.throushold) ||
	            (deltaX > this.throushold && deltaZ > this.throushold) ||
	            (deltaY > this.throushold && deltaZ > this.throushold);
	    }
	}

	class GeolocationInfo {
	    setPosition(pos) {
	        this.pos = pos;
	        this.coords = pos.coords;
	    }
	    get latitude() {
	        return this.coords.latitude;
	    }
	    get longitude() {
	        return this.coords.longitude;
	    }
	    get altitude() {
	        return this.coords.altitude;
	    }
	    get accuracy() {
	        return this.coords.accuracy;
	    }
	    get altitudeAccuracy() {
	        return this.coords.altitudeAccuracy;
	    }
	    get heading() {
	        return this.coords.heading;
	    }
	    get speed() {
	        return this.coords.speed;
	    }
	    get timestamp() {
	        return this.pos.timestamp;
	    }
	}

	/**
	 * 使用前可用<code>supported</code>查看浏览器支持。
	 */
	class Geolocation {
	    constructor() {
	    }
	    /**
	     * 获取设备当前位置。
	     * @param	onSuccess	带有唯一<code>Position</code>参数的回调处理器。
	     * @param	onError		可选的。带有错误信息的回调处理器。错误代码为Geolocation.PERMISSION_DENIED、Geolocation.POSITION_UNAVAILABLE和Geolocation.TIMEOUT之一。
	     */
	    static getCurrentPosition(onSuccess, onError = null) {
	        Geolocation.navigator.geolocation.getCurrentPosition(function (pos) {
	            Geolocation.position.setPosition(pos);
	            onSuccess.runWith(Geolocation.position);
	        }, function (error) {
	            onError.runWith(error);
	        }, {
	            enableHighAccuracy: Geolocation.enableHighAccuracy,
	            timeout: Geolocation.timeout,
	            maximumAge: Geolocation.maximumAge
	        });
	    }
	    /**
	     * 监视设备当前位置。回调处理器在设备位置改变时被执行。
	     * @param	onSuccess	带有唯一<code>Position</code>参数的回调处理器。
	     * @param	onError		可选的。带有错误信息的回调处理器。错误代码为Geolocation.PERMISSION_DENIED、Geolocation.POSITION_UNAVAILABLE和Geolocation.TIMEOUT之一。
	     */
	    static watchPosition(onSuccess, onError) {
	        return Geolocation.navigator.geolocation.watchPosition(function (pos) {
	            Geolocation.position.setPosition(pos);
	            onSuccess.runWith(Geolocation.position);
	        }, function (error) {
	            onError.runWith(error);
	        }, {
	            enableHighAccuracy: Geolocation.enableHighAccuracy,
	            timeout: Geolocation.timeout,
	            maximumAge: Geolocation.maximumAge
	        });
	    }
	    /**
	     * 移除<code>watchPosition</code>安装的指定处理器。
	     * @param	id
	     */
	    static clearWatch(id) {
	        Geolocation.navigator.geolocation.clearWatch(id);
	    }
	}
	Geolocation.navigator = Laya.ILaya.Browser.window.navigator;
	Geolocation.position = new GeolocationInfo();
	/**
	 * 由于权限被拒绝造成的地理信息获取失败。
	 */
	Geolocation.PERMISSION_DENIED = 1;
	/**
	 * 由于内部位置源返回了内部错误导致地理信息获取失败。
	 */
	Geolocation.POSITION_UNAVAILABLE = 2;
	/**
	 * 信息获取所用时长超出<code>timeout</code>所设置时长。
	 */
	Geolocation.TIMEOUT = 3;
	/**
	 * 是否支持。
	 */
	Geolocation.supported = !!Geolocation.navigator.geolocation;
	/**
	 * 如果<code>enableHighAccuracy</code>为true，并且设备能够提供一个更精确的位置，则会获取最佳可能的结果。
	 * 请注意,这可能会导致较慢的响应时间或增加电量消耗（如使用GPS）。
	 * 另一方面，如果设置为false，将会得到更快速的响应和更少的电量消耗。
	 * 默认值为false。
	 */
	Geolocation.enableHighAccuracy = false;
	/**
	 * 表示允许设备获取位置的最长时间。默认为Infinity，意味着getCurentPosition()直到位置可用时才会返回信息。
	 */
	Geolocation.timeout = 1E10;
	/**
	 * 表示可被返回的缓存位置信息的最大时限。
	 * 如果设置为0，意味着设备不使用缓存位置，并且尝试获取实时位置。
	 * 如果设置为Infinity，设备必须返回缓存位置而无论其时限。
	 */
	Geolocation.maximumAge = 0;

	/**
	 * Media用于捕捉摄像头和麦克风。可以捕捉任意之一，或者同时捕捉两者。<code>getCamera</code>前可以使用<code>supported()</code>检查当前浏览器是否支持。
	 * <b>NOTE:</b>
	 * <p>目前Media在移动平台只支持Android，不支持IOS。只可在FireFox完整地使用，Chrome测试时无法捕捉视频。</p>
	 */
	class Media {
	    constructor() {
	    }
	    /**
	     * 检查浏览器兼容性。
	     */
	    static supported() {
	        return !!Laya.ILaya.Browser.window.navigator.getUserMedia;
	    }
	    /**
	     * 获取用户媒体。
	     * @param	options	简单的可选项可以使<code>{ audio:true, video:true }</code>表示同时捕捉两者。详情见<i>https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia</i>。
	     * @param	onSuccess 获取成功的处理器，唯一参数返回媒体的Blob地址，可以将其传给Video。
	     * @param	onError	获取失败的处理器，唯一参数是Error。
	     */
	    static getMedia(options, onSuccess, onError) {
	        if (Laya.ILaya.Browser.window.navigator.getUserMedia) {
	            Laya.ILaya.Browser.window.navigator.getUserMedia(options, function (stream) {
	                onSuccess.runWith(Laya.ILaya.Browser.window.URL.createObjectURL(stream));
	            }, function (err) {
	                onError.runWith(err);
	            });
	        }
	    }
	}

	/**
	 * @internal
	 */
	class HtmlVideo extends Laya.Bitmap {
	    constructor() {
	        super();
	        this._width = 1;
	        this._height = 1;
	        this.createDomElement();
	    }
	    createDomElement() {
	        this._source = this.video = Laya.ILaya.Browser.createElement("video");
	        var style = this.video.style;
	        style.position = 'absolute';
	        style.top = '0px';
	        style.left = '0px';
	        this.video.addEventListener("loadedmetadata", (function () {
	            this._w = this.video.videoWidth;
	            this._h = this.video.videoHeight;
	        })['bind'](this));
	    }
	    setSource(url, extension) {
	        while (this.video.childElementCount)
	            this.video.firstChild.remove();
	        if (extension & 1 /* MP4 */)
	            this.appendSource(url, "video/mp4");
	        if (extension & 2 /* OGG */)
	            this.appendSource(url + ".ogg", "video/ogg");
	    }
	    appendSource(source, type) {
	        var sourceElement = Laya.ILaya.Browser.createElement("source");
	        sourceElement.src = source;
	        sourceElement.type = type;
	        this.video.appendChild(sourceElement);
	    }
	    getVideo() {
	        return this.video;
	    }
	    /**
	     * @internal
	     * @override
	     */
	    _getSource() {
	        // TODO Auto Generated method stub
	        return this._source;
	    }
	    /**
	     * @override
	     */
	    destroy() {
	        super.destroy();
	        var isConchApp = Laya.ILaya.Render.isConchApp;
	        if (isConchApp) {
	            this.video._destroy();
	        }
	    }
	}
	HtmlVideo.create = function () {
	    return new HtmlVideo();
	};

	/**
	 * @internal
	 */
	class WebGLVideo extends HtmlVideo {
	    constructor() {
	        super();
	        var gl = Laya.LayaGL.instance;
	        if (!Laya.ILaya.Render.isConchApp && Laya.ILaya.Browser.onIPhone)
	            return;
	        this.gl = Laya.ILaya.Render.isConchApp ? window.LayaGLContext.instance : Laya.WebGLContext.mainContext;
	        this._source = this.gl.createTexture();
	        //preTarget = WebGLContext.curBindTexTarget; 
	        //preTexture = WebGLContext.curBindTexValue;
	        Laya.WebGLContext.bindTexture(this.gl, gl.TEXTURE_2D, this._source);
	        this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	        this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	        this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	        this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	        Laya.WebGLContext.bindTexture(this.gl, gl.TEXTURE_2D, null);
	        //(preTarget && preTexture) && (WebGLContext.bindTexture(gl, preTarget, preTexture));
	    }
	    updateTexture() {
	        if (!Laya.ILaya.Render.isConchApp && Laya.ILaya.Browser.onIPhone)
	            return;
	        var gl = Laya.LayaGL.instance;
	        Laya.WebGLContext.bindTexture(this.gl, gl.TEXTURE_2D, this._source);
	        this.gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.video);
	        WebGLVideo.curBindSource = this._source;
	    }
	    get _glTexture() {
	        return this._source;
	    }
	    /**
	     * @override
	     */
	    destroy() {
	        if (this._source) {
	            this.gl = Laya.ILaya.Render.isConchApp ? window.LayaGLContext.instance : Laya.WebGLContext.mainContext;
	            if (WebGLVideo.curBindSource == this._source) {
	                Laya.WebGLContext.bindTexture(this.gl, this.gl.TEXTURE_2D, null);
	                WebGLVideo.curBindSource = null;
	            }
	            this.gl.deleteTexture(this._source);
	        }
	        super.destroy();
	    }
	}

	/**
	 * <code>Video</code>将视频显示到Canvas上。<code>Video</code>可能不会在所有浏览器有效。
	 * <p>关于Video支持的所有事件参见：<i>http://www.w3school.com.cn/tags/html_ref_audio_video_dom.asp</i>。</p>
	 * <p>
	 * <b>注意：</b><br/>
	 * 在PC端可以在任何时机调用<code>play()</code>因此，可以在程序开始运行时就使Video开始播放。但是在移动端，只有在用户第一次触碰屏幕后才可以调用play()，所以移动端不可能在程序开始运行时就自动开始播放Video。
	 * </p>
	 *
	 * <p>MDN Video链接： <i>https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video</i></p>
	 */
	class Video extends Laya.Sprite {
	    constructor(width = 320, height = 240) {
	        super();
	        this.htmlVideo = new WebGLVideo();
	        this.videoElement = this.htmlVideo.getVideo();
	        this.videoElement.layaTarget = this;
	        this.internalTexture = new Laya.Texture(this.htmlVideo);
	        this.videoElement.addEventListener("abort", Video.onAbort);
	        this.videoElement.addEventListener("canplay", Video.onCanplay);
	        this.videoElement.addEventListener("canplaythrough", Video.onCanplaythrough);
	        this.videoElement.addEventListener("durationchange", Video.onDurationchange);
	        this.videoElement.addEventListener("emptied", Video.onEmptied);
	        this.videoElement.addEventListener("error", Video.onError);
	        this.videoElement.addEventListener("loadeddata", Video.onLoadeddata);
	        this.videoElement.addEventListener("loadedmetadata", Video.onLoadedmetadata);
	        this.videoElement.addEventListener("loadstart", Video.onLoadstart);
	        this.videoElement.addEventListener("pause", Video.onPause);
	        this.videoElement.addEventListener("play", Video.onPlay);
	        this.videoElement.addEventListener("playing", Video.onPlaying);
	        this.videoElement.addEventListener("progress", Video.onProgress);
	        this.videoElement.addEventListener("ratechange", Video.onRatechange);
	        this.videoElement.addEventListener("seeked", Video.onSeeked);
	        this.videoElement.addEventListener("seeking", Video.onSeeking);
	        this.videoElement.addEventListener("stalled", Video.onStalled);
	        this.videoElement.addEventListener("suspend", Video.onSuspend);
	        this.videoElement.addEventListener("timeupdate", Video.onTimeupdate);
	        this.videoElement.addEventListener("volumechange", Video.onVolumechange);
	        this.videoElement.addEventListener("waiting", Video.onWaiting);
	        this.videoElement.addEventListener("ended", this.onPlayComplete['bind'](this));
	        this.size(width, height);
	        if (Laya.ILaya.Browser.onMobile) {
	            this.onDocumentClick = this.onDocumentClick.bind(this);
	            Laya.ILaya.Browser.document.addEventListener("touchend", this.onDocumentClick);
	        }
	    }
	    static onAbort(e) { e.target.layaTarget.event("abort"); }
	    static onCanplay(e) { e.target.layaTarget.event("canplay"); }
	    static onCanplaythrough(e) { e.target.layaTarget.event("canplaythrough"); }
	    static onDurationchange(e) { e.target.layaTarget.event("durationchange"); }
	    static onEmptied(e) { e.target.layaTarget.event("emptied"); }
	    static onError(e) { e.target.layaTarget.event("error"); }
	    static onLoadeddata(e) { e.target.layaTarget.event("loadeddata"); }
	    static onLoadedmetadata(e) { e.target.layaTarget.event("loadedmetadata"); }
	    static onLoadstart(e) { e.target.layaTarget.event("loadstart"); }
	    static onPause(e) { e.target.layaTarget.event("pause"); }
	    static onPlay(e) { e.target.layaTarget.event("play"); }
	    static onPlaying(e) { e.target.layaTarget.event("playing"); }
	    static onProgress(e) { e.target.layaTarget.event("progress"); }
	    static onRatechange(e) { e.target.layaTarget.event("ratechange"); }
	    static onSeeked(e) { e.target.layaTarget.event("seeked"); }
	    static onSeeking(e) { e.target.layaTarget.event("seeking"); }
	    static onStalled(e) { e.target.layaTarget.event("stalled"); }
	    static onSuspend(e) { e.target.layaTarget.event("suspend"); }
	    static onTimeupdate(e) { e.target.layaTarget.event("timeupdate"); }
	    static onVolumechange(e) { e.target.layaTarget.event("volumechange"); }
	    static onWaiting(e) { e.target.layaTarget.event("waiting"); }
	    onPlayComplete(e) {
	        this.event("ended");
	        if (!Laya.ILaya.Render.isConchApp || !this.videoElement || !this.videoElement.loop)
	            Laya.ILaya.timer.clear(this, this.renderCanvas);
	    }
	    /**
	     * 设置播放源。
	     * @param url	播放源路径。
	     */
	    load(url) {
	        // Camera
	        if (url.indexOf("blob:") == 0)
	            this.videoElement.src = url;
	        else
	            this.htmlVideo.setSource(url, 1 /* MP4 */);
	    }
	    /**
	     * 开始播放视频。
	     */
	    play() {
	        this.videoElement.play();
	        Laya.ILaya.timer.frameLoop(1, this, this.renderCanvas);
	    }
	    /**
	     * 暂停视频播放。
	     */
	    pause() {
	        this.videoElement.pause();
	        Laya.ILaya.timer.clear(this, this.renderCanvas);
	    }
	    /**
	     * 重新加载视频。
	     */
	    reload() {
	        this.videoElement.load();
	    }
	    /**
	     * 检测是否支持播放指定格式视频。
	     * @param type	参数为Video.MP4 / Video.OGG / Video.WEBM之一。
	     * @return 表示支持的级别。可能的值：
	     * <ul>
	     * <li>"probably"，Video.SUPPORT_PROBABLY - 浏览器最可能支持该音频/视频类型</li>
	     * <li>"maybe"，Video.SUPPORT_MAYBY - 浏览器也许支持该音频/视频类型</li>
	     * <li>""，Video.SUPPORT_NO- （空字符串）浏览器不支持该音频/视频类型</li>
	     * </ul>
	     */
	    canPlayType(type) {
	        var typeString;
	        switch (type) {
	            case 1 /* MP4 */:
	                typeString = "video/mp4";
	                break;
	            case 2 /* OGG */:
	                typeString = "video/ogg";
	                break;
	            case 8 /* WEBM */:
	                typeString = "video/webm";
	                break;
	        }
	        return this.videoElement.canPlayType(typeString);
	    }
	    renderCanvas() {
	        if (this.readyState === 0)
	            return;
	        this.htmlVideo['updateTexture']();
	        this.graphics.clear();
	        this.graphics.drawTexture(this.internalTexture, 0, 0, this.width, this.height);
	    }
	    onDocumentClick() {
	        this.videoElement.play();
	        this.videoElement.pause();
	        Laya.ILaya.Browser.document.removeEventListener("touchend", this.onDocumentClick);
	    }
	    /**
	     * buffered 属性返回 TimeRanges(JS)对象。TimeRanges 对象表示用户的音视频缓冲范围。缓冲范围指的是已缓冲音视频的时间范围。如果用户在音视频中跳跃播放，会得到多个缓冲范围。
	     * <p>buffered.length返回缓冲范围个数。如获取第一个缓冲范围则是buffered.start(0)和buffered.end(0)。以秒计。</p>
	     * @return TimeRanges(JS)对象
	     */
	    get buffered() {
	        return this.videoElement.buffered;
	    }
	    /**
	     * 获取当前播放源路径。
	     */
	    get currentSrc() {
	        return this.videoElement.currentSrc;
	    }
	    /**
	     * 设置和获取当前播放头位置。
	     */
	    get currentTime() {
	        return this.videoElement.currentTime;
	    }
	    set currentTime(value) {
	        this.videoElement.currentTime = value;
	        this.renderCanvas();
	    }
	    /**
	     * 设置和获取当前音量。
	     */
	    set volume(value) {
	        this.videoElement.volume = value;
	    }
	    get volume() {
	        return this.videoElement.volume;
	    }
	    /**
	     * 表示视频元素的就绪状态：
	     * <ul>
	     * <li>0 = HAVE_NOTHING - 没有关于音频/视频是否就绪的信息</li>
	     * <li>1 = HAVE_METADATA - 关于音频/视频就绪的元数据</li>
	     * <li>2 = HAVE_CURRENT_DATA - 关于当前播放位置的数据是可用的，但没有足够的数据来播放下一帧/毫秒</li>
	     * <li>3 = HAVE_FUTURE_DATA - 当前及至少下一帧的数据是可用的</li>
	     * <li>4 = HAVE_ENOUGH_DATA - 可用数据足以开始播放</li>
	     * </ul>
	     */
	    get readyState() {
	        return this.videoElement.readyState;
	    }
	    /**
	     * 获取视频源尺寸。ready事件触发后可用。
	     */
	    get videoWidth() {
	        return this.videoElement.videoWidth;
	    }
	    get videoHeight() {
	        return this.videoElement.videoHeight;
	    }
	    /**
	     * 获取视频长度（秒）。ready事件触发后可用。
	     */
	    get duration() {
	        return this.videoElement.duration;
	    }
	    /**
	     * 返回音频/视频的播放是否已结束
	     */
	    get ended() {
	        return this.videoElement.ended;
	    }
	    /**
	     * 返回表示音频/视频错误状态的 MediaError（JS）对象。
	     */
	    get error() {
	        return this.videoElement.error;
	    }
	    /**
	     * 设置或返回音频/视频是否应在结束时重新播放。
	     */
	    get loop() {
	        return this.videoElement.loop;
	    }
	    set loop(value) {
	        this.videoElement.loop = value;
	    }
	    /**
	     * 设置视频的x坐标
	     * @override
	     */
	    set x(val) {
	        super.x = val;
	        if (Laya.ILaya.Render.isConchApp) {
	            var transform = Laya.ILaya.Utils.getTransformRelativeToWindow(this, 0, 0);
	            this.videoElement.style.left = transform.x;
	        }
	    }
	    get x() {
	        return super.x;
	    }
	    /**
	     * 设置视频的y坐标
	     * @override
	     */
	    set y(val) {
	        super.y = val;
	        if (Laya.ILaya.Render.isConchApp) {
	            var transform = Laya.ILaya.Utils.getTransformRelativeToWindow(this, 0, 0);
	            this.videoElement.style.top = transform.y;
	        }
	    }
	    get y() {
	        return super.y;
	    }
	    /**
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
	    get playbackRate() {
	        return this.videoElement.playbackRate;
	    }
	    set playbackRate(value) {
	        this.videoElement.playbackRate = value;
	    }
	    /**
	     * 获取和设置静音状态。
	     */
	    get muted() {
	        return this.videoElement.muted;
	    }
	    set muted(value) {
	        this.videoElement.muted = value;
	    }
	    /**
	     * 返回视频是否暂停
	     */
	    get paused() {
	        return this.videoElement.paused;
	    }
	    /**
	     * preload 属性设置或返回是否在页面加载后立即加载视频。可赋值如下：
	     * <ul>
	     * <li>auto	指示一旦页面加载，则开始加载视频。</li>
	     * <li>metadata	指示当页面加载后仅加载音频/视频的元数据。</li>
	     * <li>none	指示页面加载后不应加载音频/视频。</li>
	     * </ul>
	     */
	    get preload() {
	        return this.videoElement.preload;
	    }
	    set preload(value) {
	        this.videoElement.preload = value;
	    }
	    /**
	     * 参见 <i>http://www.w3school.com.cn/tags/av_prop_seekable.asp</i>。
	     */
	    get seekable() {
	        return this.videoElement.seekable;
	    }
	    /**
	     * seeking 属性返回用户目前是否在音频/视频中寻址。
	     * 寻址中（Seeking）指的是用户在音频/视频中移动/跳跃到新的位置。
	     */
	    get seeking() {
	        return this.videoElement.seeking;
	    }
	    /**
	     *
	     * @param width
	     * @param height
	     * @override
	     */
	    size(width, height) {
	        super.size(width, height);
	        if (Laya.ILaya.Render.isConchApp) {
	            var transform = Laya.ILaya.Utils.getTransformRelativeToWindow(this, 0, 0);
	            this.videoElement.width = width * transform.scaleX;
	        }
	        else {
	            this.videoElement.width = width / Laya.ILaya.Browser.pixelRatio;
	        }
	        if (this.paused)
	            this.renderCanvas();
	        return this;
	    }
	    /**
	     * @override
	     */
	    set width(value) {
	        if (Laya.ILaya.Render.isConchApp) {
	            var transform = Laya.ILaya.Utils.getTransformRelativeToWindow(this, 0, 0);
	            this.videoElement.width = value * transform.scaleX;
	        }
	        else {
	            this.videoElement.width = this.width / Laya.ILaya.Browser.pixelRatio;
	        }
	        super.width = value;
	        if (this.paused)
	            this.renderCanvas();
	    }
	    get width() {
	        return super.width;
	    }
	    /**
	     * @override
	     */
	    set height(value) {
	        if (Laya.ILaya.Render.isConchApp) {
	            var transform = Laya.ILaya.Utils.getTransformRelativeToWindow(this, 0, 0);
	            this.videoElement.height = value * transform.scaleY;
	        }
	        else {
	            this.videoElement.height = this.height / Laya.ILaya.Browser.pixelRatio;
	        }
	        super.height = value;
	    }
	    get height() {
	        return super.height;
	    }
	    /**
	     * 销毁内部事件绑定。
	     * @override
	     */
	    destroy(detroyChildren = true) {
	        super.destroy(detroyChildren);
	        this.videoElement.removeEventListener("abort", Video.onAbort);
	        this.videoElement.removeEventListener("canplay", Video.onCanplay);
	        this.videoElement.removeEventListener("canplaythrough", Video.onCanplaythrough);
	        this.videoElement.removeEventListener("durationchange", Video.onDurationchange);
	        this.videoElement.removeEventListener("emptied", Video.onEmptied);
	        this.videoElement.removeEventListener("error", Video.onError);
	        this.videoElement.removeEventListener("loadeddata", Video.onLoadeddata);
	        this.videoElement.removeEventListener("loadedmetadata", Video.onLoadedmetadata);
	        this.videoElement.removeEventListener("loadstart", Video.onLoadstart);
	        this.videoElement.removeEventListener("pause", Video.onPause);
	        this.videoElement.removeEventListener("play", Video.onPlay);
	        this.videoElement.removeEventListener("playing", Video.onPlaying);
	        this.videoElement.removeEventListener("progress", Video.onProgress);
	        this.videoElement.removeEventListener("ratechange", Video.onRatechange);
	        this.videoElement.removeEventListener("seeked", Video.onSeeked);
	        this.videoElement.removeEventListener("seeking", Video.onSeeking);
	        this.videoElement.removeEventListener("stalled", Video.onStalled);
	        this.videoElement.removeEventListener("suspend", Video.onSuspend);
	        this.videoElement.removeEventListener("timeupdate", Video.onTimeupdate);
	        this.videoElement.removeEventListener("volumechange", Video.onVolumechange);
	        this.videoElement.removeEventListener("waiting", Video.onWaiting);
	        this.videoElement.removeEventListener("ended", this.onPlayComplete);
	        this.pause();
	        this.videoElement.layaTarget = null;
	        this.videoElement = null;
	        this.htmlVideo.destroy();
	    }
	    syncVideoPosition() {
	        var stage = Laya.ILaya.stage;
	        var rec;
	        rec = Laya.ILaya.Utils.getGlobalPosAndScale(this);
	        var a = stage._canvasTransform.a, d = stage._canvasTransform.d;
	        var x = rec.x * stage.clientScaleX * a + stage.offset.x;
	        var y = rec.y * stage.clientScaleY * d + stage.offset.y;
	        this.videoElement.style.left = x + 'px';
	        this.videoElement.style.top = y + 'px';
	        this.videoElement.width = this.width / Laya.ILaya.Browser.pixelRatio;
	        this.videoElement.height = this.height / Laya.ILaya.Browser.pixelRatio;
	    }
	}
	Video.MP4 = 1;
	Video.OGG = 2;
	Video.CAMERA = 4;
	Video.WEBM = 8;
	/** 表示最有可能支持。 */
	Video.SUPPORT_PROBABLY = "probably";
	/** 表示可能支持。*/
	Video.SUPPORT_MAYBY = "maybe";
	/** 表示不支持。 */
	Video.SUPPORT_NO = "";

	/**
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
	class Gyroscope extends Laya.EventDispatcher {
	    constructor(singleton) {
	        super();
	        this.onDeviceOrientationChange = this.onDeviceOrientationChange.bind(this);
	    }
	    static get instance() {
	        Gyroscope._instance = Gyroscope._instance || new Gyroscope(0);
	        return Gyroscope._instance;
	    }
	    /**
	     * 监视陀螺仪运动。
	     * @param	observer	回调函数接受一个Boolean类型的<code>absolute</code>和<code>GyroscopeInfo</code>类型参数。
	     * @override
	     */
	    on(type, caller, listener, args = null) {
	        super.on(type, caller, listener, args);
	        Laya.ILaya.Browser.window.addEventListener('deviceorientation', this.onDeviceOrientationChange);
	        return this;
	    }
	    /**
	     * 取消指定处理器对陀螺仪的监视。
	     * @param	observer
	     * @override
	     */
	    off(type, caller, listener, onceOnly = false) {
	        if (!this.hasListener(type))
	            Laya.ILaya.Browser.window.removeEventListener('deviceorientation', this.onDeviceOrientationChange);
	        return super.off(type, caller, listener, onceOnly);
	    }
	    onDeviceOrientationChange(e) {
	        Gyroscope.info.alpha = e.alpha;
	        Gyroscope.info.beta = e.beta;
	        Gyroscope.info.gamma = e.gamma;
	        // 在Safari中
	        if (e.webkitCompassHeading) {
	            Gyroscope.info.alpha = e.webkitCompassHeading * -1;
	            Gyroscope.info.compassAccuracy = e.webkitCompassAccuracy;
	        }
	        this.event(Laya.Event.CHANGE, [e.absolute, Gyroscope.info]);
	    }
	}
	Gyroscope.info = new RotationInfo();

	exports.AccelerationInfo = AccelerationInfo;
	exports.Accelerator = Accelerator;
	exports.Geolocation = Geolocation;
	exports.GeolocationInfo = GeolocationInfo;
	exports.Gyroscope = Gyroscope;
	exports.HtmlVideo = HtmlVideo;
	exports.Media = Media;
	exports.RotationInfo = RotationInfo;
	exports.Shake = Shake;
	exports.Video = Video;
	exports.WebGLVideo = WebGLVideo;

}(window.Laya = window.Laya|| {}, Laya));
