(function (exports, Laya) {
	'use strict';

	class AccelerationInfo {
	    constructor() {
	    }
	}

	class RotationInfo {
	    constructor() {
	    }
	}

	class Accelerator extends Laya.EventDispatcher {
	    constructor(singleton) {
	        super();
	        this.onDeviceOrientationChange = this.onDeviceOrientationChange.bind(this);
	    }
	    static get instance() {
	        Accelerator._instance = Accelerator._instance || new Accelerator(0);
	        return Accelerator._instance;
	    }
	    on(type, caller, listener, args = null) {
	        super.on(type, caller, listener, args);
	        Laya.ILaya.Browser.window.addEventListener('devicemotion', this.onDeviceOrientationChange);
	        return this;
	    }
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

	class Shake extends Laya.EventDispatcher {
	    constructor() {
	        super();
	    }
	    static get instance() {
	        Shake._instance = Shake._instance || new Shake();
	        return Shake._instance;
	    }
	    start(throushold, interval) {
	        this.throushold = throushold;
	        this.shakeInterval = interval;
	        this.lastX = this.lastY = this.lastZ = NaN;
	        Accelerator.instance.on(Laya.Event.CHANGE, this, this.onShake);
	    }
	    stop() {
	        Accelerator.instance.off(Laya.Event.CHANGE, this, this.onShake);
	    }
	    onShake(acceleration, accelerationIncludingGravity, rotationRate, interval) {
	        if (isNaN(this.lastX)) {
	            this.lastX = accelerationIncludingGravity.x;
	            this.lastY = accelerationIncludingGravity.y;
	            this.lastZ = accelerationIncludingGravity.z;
	            this.lastMillSecond = Laya.ILaya.Browser.now();
	            return;
	        }
	        var deltaX = Math.abs(this.lastX - accelerationIncludingGravity.x);
	        var deltaY = Math.abs(this.lastY - accelerationIncludingGravity.y);
	        var deltaZ = Math.abs(this.lastZ - accelerationIncludingGravity.z);
	        if (this.isShaked(deltaX, deltaY, deltaZ)) {
	            var deltaMillSecond = Laya.ILaya.Browser.now() - this.lastMillSecond;
	            if (deltaMillSecond > this.shakeInterval) {
	                this.event(Laya.Event.CHANGE);
	                this.lastMillSecond = Laya.ILaya.Browser.now();
	            }
	        }
	        this.lastX = accelerationIncludingGravity.x;
	        this.lastY = accelerationIncludingGravity.y;
	        this.lastZ = accelerationIncludingGravity.z;
	    }
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

	class Geolocation {
	    constructor() {
	    }
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
	    static clearWatch(id) {
	        Geolocation.navigator.geolocation.clearWatch(id);
	    }
	}
	Geolocation.navigator = Laya.ILaya.Browser.window.navigator;
	Geolocation.position = new GeolocationInfo();
	Geolocation.PERMISSION_DENIED = 1;
	Geolocation.POSITION_UNAVAILABLE = 2;
	Geolocation.TIMEOUT = 3;
	Geolocation.supported = !!Geolocation.navigator.geolocation;
	Geolocation.enableHighAccuracy = false;
	Geolocation.timeout = 1E10;
	Geolocation.maximumAge = 0;

	class HtmlVideo extends Laya.Bitmap {
	    constructor() {
	        super();
	        this._w = 0;
	        this._h = 0;
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
	        this.video.addEventListener("loadedmetadata", () => {
	            this._w = this.video.videoWidth;
	            this._h = this.video.videoHeight;
	        });
	    }
	    setSource(url, extension) {
	        while (this.video.childElementCount)
	            this.video.firstChild.remove();
	        if (extension & 1)
	            this.appendSource(url, "video/mp4");
	        if (extension & 2)
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
	    _getSource() {
	        return this._source;
	    }
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

	class Media {
	    constructor() {
	    }
	    static supported() {
	        return !!Laya.ILaya.Browser.window.navigator.getUserMedia;
	    }
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

	class WebGLVideo extends HtmlVideo {
	    constructor() {
	        super();
	        var gl = Laya.LayaGL.instance;
	        if (!Laya.ILaya.Render.isConchApp && Laya.ILaya.Browser.onIPhone)
	            return;
	        this.gl = Laya.ILaya.Render.isConchApp ? window.LayaGLContext.instance : Laya.WebGLContext.mainContext;
	        this._source = this.gl.createTexture();
	        Laya.WebGLContext.bindTexture(this.gl, gl.TEXTURE_2D, this._source);
	        this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	        this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	        this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	        this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	        Laya.WebGLContext.bindTexture(this.gl, gl.TEXTURE_2D, null);
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
	        if (!Laya.ILaya.Render.isConchApp || !this.videoElement || !this.videoElement.loop)
	            Laya.ILaya.timer.clear(this, this.renderCanvas);
	        this.event("ended");
	    }
	    load(url) {
	        if (url.indexOf("blob:") == 0)
	            this.videoElement.src = url;
	        else
	            this.htmlVideo.setSource(url, 1);
	    }
	    play() {
	        this.videoElement.play();
	        Laya.ILaya.timer.frameLoop(1, this, this.renderCanvas);
	    }
	    pause() {
	        this.videoElement.pause();
	        Laya.ILaya.timer.clear(this, this.renderCanvas);
	    }
	    reload() {
	        this.videoElement.load();
	    }
	    canPlayType(type) {
	        var typeString;
	        switch (type) {
	            case 1:
	                typeString = "video/mp4";
	                break;
	            case 2:
	                typeString = "video/ogg";
	                break;
	            case 8:
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
	    get buffered() {
	        return this.videoElement.buffered;
	    }
	    get currentSrc() {
	        return this.videoElement.currentSrc;
	    }
	    get currentTime() {
	        return this.videoElement.currentTime;
	    }
	    set currentTime(value) {
	        this.videoElement.currentTime = value;
	        this.renderCanvas();
	    }
	    set volume(value) {
	        this.videoElement.volume = value;
	    }
	    get volume() {
	        return this.videoElement.volume;
	    }
	    get readyState() {
	        return this.videoElement.readyState;
	    }
	    get videoWidth() {
	        return this.videoElement.videoWidth;
	    }
	    get videoHeight() {
	        return this.videoElement.videoHeight;
	    }
	    get duration() {
	        return this.videoElement.duration;
	    }
	    get ended() {
	        return this.videoElement.ended;
	    }
	    get error() {
	        return this.videoElement.error;
	    }
	    get loop() {
	        return this.videoElement.loop;
	    }
	    set loop(value) {
	        this.videoElement.loop = value;
	    }
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
	    get playbackRate() {
	        return this.videoElement.playbackRate;
	    }
	    set playbackRate(value) {
	        this.videoElement.playbackRate = value;
	    }
	    get muted() {
	        return this.videoElement.muted;
	    }
	    set muted(value) {
	        this.videoElement.muted = value;
	    }
	    get paused() {
	        return this.videoElement.paused;
	    }
	    get preload() {
	        return this.videoElement.preload;
	    }
	    set preload(value) {
	        this.videoElement.preload = value;
	    }
	    get seekable() {
	        return this.videoElement.seekable;
	    }
	    get seeking() {
	        return this.videoElement.seeking;
	    }
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
	Video.SUPPORT_PROBABLY = "probably";
	Video.SUPPORT_MAYBY = "maybe";
	Video.SUPPORT_NO = "";

	class Gyroscope extends Laya.EventDispatcher {
	    constructor(singleton) {
	        super();
	        this.onDeviceOrientationChange = this.onDeviceOrientationChange.bind(this);
	    }
	    static get instance() {
	        Gyroscope._instance = Gyroscope._instance || new Gyroscope(0);
	        return Gyroscope._instance;
	    }
	    on(type, caller, listener, args = null) {
	        super.on(type, caller, listener, args);
	        Laya.ILaya.Browser.window.addEventListener('deviceorientation', this.onDeviceOrientationChange);
	        return this;
	    }
	    off(type, caller, listener, onceOnly = false) {
	        if (!this.hasListener(type))
	            Laya.ILaya.Browser.window.removeEventListener('deviceorientation', this.onDeviceOrientationChange);
	        return super.off(type, caller, listener, onceOnly);
	    }
	    onDeviceOrientationChange(e) {
	        Gyroscope.info.alpha = e.alpha;
	        Gyroscope.info.beta = e.beta;
	        Gyroscope.info.gamma = e.gamma;
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

}(window.Laya = window.Laya || {}, Laya));
