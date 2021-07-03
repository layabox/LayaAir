(function (exports, Laya) {
	'use strict';

	class SpineGLTexture extends Laya.Texture {
	    constructor(tex) {
	        super(tex);
	    }
	    getImage() {
	        return {
	            width: this.sourceWidth,
	            height: this.sourceHeight
	        };
	    }
	    setFilters(minFilter, magFilter) {
	    }
	    setWraps(uWrap, vWrap) {
	    }
	}

	var Color = spine.Color;
	var SkeletonClipping = spine.SkeletonClipping;
	var Vector2 = spine.Vector2;
	var Utils = spine.Utils;
	var RegionAttachment = spine.RegionAttachment;
	var MeshAttachment = spine.MeshAttachment;
	var ClippingAttachment = spine.ClippingAttachment;
	class Renderable {
	    constructor(vertices, numVertices, numFloats) {
	        this.vertices = vertices;
	        this.numVertices = numVertices;
	        this.numFloats = numFloats;
	    }
	}
	class SpineSkeletonRenderer {
	    constructor(twoColorTint = true) {
	        this.vertexEffect = null;
	        this.tempColor = new Color();
	        this.tempColor2 = new Color();
	        this.vertexSize = 2 + 2 + 4;
	        this.twoColorTint = false;
	        this.renderable = new Renderable(null, 0, 0);
	        this.clipper = new SkeletonClipping();
	        this.temp = new Vector2();
	        this.temp2 = new Vector2();
	        this.temp3 = new Color();
	        this.temp4 = new Color();
	        this.twoColorTint = twoColorTint;
	        if (twoColorTint)
	            this.vertexSize += 4;
	        this.vertices = Utils.newFloatArray(this.vertexSize * 1024);
	    }
	    draw(skeleton, slotRangeStart = -1, slotRangeEnd = -1, spineSkeletonIns, textureList) {
	        let clipper = this.clipper;
	        let premultipliedAlpha = this.premultipliedAlpha;
	        let twoColorTint = false;
	        let tempPos = this.temp;
	        let tempUv = this.temp2;
	        let tempLight = this.temp3;
	        let tempDark = this.temp4;
	        let renderable = this.renderable;
	        let uvs = null;
	        let triangles = null;
	        let drawOrder = skeleton.drawOrder;
	        let attachmentColor = null;
	        let skeletonColor = skeleton.color;
	        let vertexSize =  8;
	        let inRange = false;
	        if (slotRangeStart == -1)
	            inRange = true;
	        for (let i = 0, n = drawOrder.length; i < n; i++) {
	            let clippedVertexSize = clipper.isClipping() ? 2 : vertexSize;
	            let slot = drawOrder[i];
	            if (slotRangeStart >= 0 && slotRangeStart == slot.data.index) {
	                inRange = true;
	            }
	            if (!inRange) {
	                clipper.clipEndWithSlot(slot);
	                continue;
	            }
	            if (slotRangeEnd >= 0 && slotRangeEnd == slot.data.index) {
	                inRange = false;
	            }
	            let attachment = slot.getAttachment();
	            let name = null;
	            let texture;
	            if (attachment instanceof RegionAttachment) {
	                let region = attachment;
	                renderable.vertices = this.vertices;
	                renderable.numVertices = 4;
	                renderable.numFloats = clippedVertexSize << 2;
	                region.computeWorldVertices(slot.bone, renderable.vertices, 0, clippedVertexSize);
	                triangles = SpineSkeletonRenderer.QUAD_TRIANGLES;
	                uvs = region.uvs;
	                name = region.region.renderObject.page.name;
	                texture = textureList[name];
	                attachmentColor = region.color;
	            }
	            else if (attachment instanceof MeshAttachment) {
	                let mesh = attachment;
	                renderable.vertices = this.vertices;
	                renderable.numVertices = (mesh.worldVerticesLength >> 1);
	                renderable.numFloats = renderable.numVertices * clippedVertexSize;
	                if (renderable.numFloats > renderable.vertices.length) {
	                    renderable.vertices = this.vertices = Utils.newFloatArray(renderable.numFloats);
	                }
	                mesh.computeWorldVertices(slot, 0, mesh.worldVerticesLength, renderable.vertices, 0, clippedVertexSize);
	                triangles = mesh.triangles;
	                name = mesh.region.renderObject.page.name;
	                texture = textureList[name];
	                uvs = mesh.uvs;
	                attachmentColor = mesh.color;
	            }
	            else if (attachment instanceof ClippingAttachment) {
	                let clip = (attachment);
	                clipper.clipStart(slot, clip);
	                continue;
	            }
	            else {
	                clipper.clipEndWithSlot(slot);
	                continue;
	            }
	            if (texture != null) {
	                let slotColor = slot.color;
	                let finalColor = this.tempColor;
	                finalColor.r = skeletonColor.r * slotColor.r * attachmentColor.r;
	                finalColor.g = skeletonColor.g * slotColor.g * attachmentColor.g;
	                finalColor.b = skeletonColor.b * slotColor.b * attachmentColor.b;
	                finalColor.a = skeletonColor.a * slotColor.a * attachmentColor.a;
	                if (premultipliedAlpha) {
	                    finalColor.r *= finalColor.a;
	                    finalColor.g *= finalColor.a;
	                    finalColor.b *= finalColor.a;
	                }
	                let slotBlendMode = slot.data.blendMode;
	                if (clipper.isClipping()) {
	                    clipper.clipTriangles(renderable.vertices, renderable.numFloats, triangles, triangles.length, uvs, finalColor, null, twoColorTint);
	                    let clippedVertices = new Float32Array(clipper.clippedVertices);
	                    let clippedTriangles = clipper.clippedTriangles;
	                    let mVertices = [];
	                    let mUVs = [];
	                    let colors = [];
	                    if (this.vertexEffect != null) {
	                        let vertexEffect = this.vertexEffect;
	                        let verts = clippedVertices;
	                        {
	                            for (let v = 0, n = clippedVertices.length; v < n; v += vertexSize) {
	                                tempPos.x = verts[v];
	                                tempPos.y = verts[v + 1];
	                                tempLight.set(verts[v + 2], verts[v + 3], verts[v + 4], verts[v + 5]);
	                                tempUv.x = verts[v + 6];
	                                tempUv.y = verts[v + 7];
	                                tempDark.set(0, 0, 0, 0);
	                                vertexEffect.transform(tempPos, tempUv, tempLight, tempDark);
	                                verts[v] = tempPos.x;
	                                verts[v + 1] = tempPos.y;
	                                verts[v + 2] = tempLight.r;
	                                verts[v + 3] = tempLight.g;
	                                verts[v + 4] = tempLight.b;
	                                verts[v + 5] = tempLight.a;
	                                verts[v + 6] = tempUv.x;
	                                verts[v + 7] = tempUv.y;
	                                mVertices.push(verts[v], -verts[v + 1]);
	                                colors.push(verts[v + 2], verts[v + 3], verts[v + 4], verts[v + 5]);
	                                mUVs.push(verts[v + 6], verts[v + 7]);
	                            }
	                        }
	                    }
	                    else {
	                        let vi = 0;
	                        while (Number.isFinite(clippedVertices[vi + 6]) && Number.isFinite(clippedVertices[vi + 7])) {
	                            mVertices.push(clippedVertices[vi]);
	                            mVertices.push(-clippedVertices[vi + 1]);
	                            colors.push(clippedVertices[vi + 2]);
	                            colors.push(clippedVertices[vi + 3]);
	                            colors.push(clippedVertices[vi + 4]);
	                            colors.push(clippedVertices[vi + 5]);
	                            mUVs.push(clippedVertices[vi + 6]);
	                            mUVs.push(clippedVertices[vi + 7]);
	                            vi += this.vertexSize;
	                        }
	                    }
	                    let alpha = 1;
	                    let color = null;
	                    let colorNum = null;
	                    let blendMode;
	                    switch (slotBlendMode) {
	                        case 1:
	                            blendMode = "light";
	                            break;
	                        case 2:
	                            blendMode = "multiply";
	                            break;
	                        case 3:
	                            blendMode = "screen";
	                            break;
	                        default:
	                            blendMode = "normal";
	                    }
	                    colorNum = ((colors[3] * 255) << 24) + colors[0] * 255 | 0 + ((colors[1] * 255) << 8) + ((colors[2] * 255) << 16);
	                    spineSkeletonIns.graphics.drawTriangles(texture, 0, 0, mVertices, mUVs, new Uint16Array(clippedTriangles), Laya.Matrix.EMPTY, alpha, color, blendMode, colorNum);
	                }
	                else {
	                    let verts = renderable.vertices;
	                    let mVertices = [];
	                    let mUVs = [];
	                    let colors = [];
	                    if (this.vertexEffect != null) {
	                        let vertexEffect = this.vertexEffect;
	                        {
	                            for (let v = 0, u = 0, n = renderable.numFloats; v < n; v += vertexSize, u += 2) {
	                                tempPos.x = verts[v];
	                                tempPos.y = verts[v + 1];
	                                tempUv.x = uvs[u];
	                                tempUv.y = uvs[u + 1];
	                                tempLight.setFromColor(finalColor);
	                                tempDark.set(0, 0, 0, 0);
	                                vertexEffect.transform(tempPos, tempUv, tempLight, tempDark);
	                                verts[v] = tempPos.x;
	                                verts[v + 1] = tempPos.y;
	                                verts[v + 2] = tempLight.r;
	                                verts[v + 3] = tempLight.g;
	                                verts[v + 4] = tempLight.b;
	                                verts[v + 5] = tempLight.a;
	                                verts[v + 6] = tempUv.x;
	                                verts[v + 7] = tempUv.y;
	                                mVertices.push(verts[v], -verts[v + 1]);
	                                colors.push(verts[v + 2], verts[v + 3], verts[v + 4], verts[v + 5]);
	                                mUVs.push(verts[v + 6], verts[v + 7]);
	                            }
	                        }
	                    }
	                    else {
	                        {
	                            for (let v = 2, u = 0, n = renderable.numFloats; v < n; v += vertexSize, u += 2) {
	                                verts[v] = finalColor.r;
	                                verts[v + 1] = finalColor.g;
	                                verts[v + 2] = finalColor.b;
	                                verts[v + 3] = finalColor.a;
	                                verts[v + 4] = uvs[u];
	                                verts[v + 5] = uvs[u + 1];
	                                mVertices.push(verts[v - 2], -verts[v - 1]);
	                                colors.push(verts[v], verts[v + 1], verts[v + 2], verts[v + 3]);
	                                mUVs.push(verts[v + 4], verts[v + 5]);
	                            }
	                        }
	                    }
	                    let alpha = 1;
	                    let color = null;
	                    let colorNum = null;
	                    let blendMode;
	                    switch (slotBlendMode) {
	                        case 1:
	                            blendMode = "light";
	                            break;
	                        case 2:
	                            blendMode = "multiply";
	                            break;
	                        case 3:
	                            blendMode = "screen";
	                            break;
	                        default:
	                            blendMode = "normal";
	                    }
	                    colorNum = ((colors[3] * 255) << 24) + colors[0] * 255 | 0 + ((colors[1] * 255) << 8) + ((colors[2] * 255) << 16);
	                    spineSkeletonIns.graphics.drawTriangles(texture, 0, 0, mVertices, mUVs, new Uint16Array(triangles), Laya.Matrix.EMPTY, alpha, color, blendMode, colorNum);
	                }
	            }
	            clipper.clipEndWithSlot(slot);
	        }
	        clipper.clipEnd();
	    }
	}
	SpineSkeletonRenderer.QUAD_TRIANGLES = [0, 1, 2, 2, 3, 0];

	var TimeKeeper = spine.TimeKeeper;
	var Skeleton = spine.Skeleton;
	var AnimationState = spine.AnimationState;
	var AnimationStateData = spine.AnimationStateData;
	class SpineSkeleton extends Laya.Sprite {
	    constructor(templet = null) {
	        super();
	        this.currentPlayTime = 0;
	        this._pause = true;
	        this._currAniName = null;
	        this._playbackRate = 1.0;
	        this._playAudio = true;
	        this._soundChannelArr = [];
	        this.trackIndex = 0;
	        if (templet)
	            this.init(templet);
	        this._ins = this;
	    }
	    init(templet) {
	        var that = this;
	        this._templet = templet;
	        this.skeleton = new Skeleton(this._templet.skeletonData);
	        this.stateData = new AnimationStateData(this.skeleton.data);
	        this.state = new AnimationState(this.stateData);
	        this.skeletonRenderer = new SpineSkeletonRenderer(false);
	        this.timeKeeper = new TimeKeeper();
	        this.skeletonRenderer.premultipliedAlpha = this._templet._spinePremultipliedAlpha;
	        this.state.addListener({
	            start: function (entry) {
	            },
	            interrupt: function (entry) {
	            },
	            end: function (entry) {
	            },
	            dispose: function (entry) {
	            },
	            complete: function (entry) {
	                if (entry.loop) {
	                    that.event(Laya.Event.COMPLETE);
	                }
	                else {
	                    that._currAniName = null;
	                    that.event(Laya.Event.STOPPED);
	                }
	            },
	            event: function (entry, event) {
	                var eventData = {
	                    audioValue: event.data.audioPath,
	                    audioPath: event.data.audioPath,
	                    floatValue: event.floatValue,
	                    intValue: event.intValue,
	                    name: event.data.name,
	                    stringValue: event.stringValue,
	                    time: event.time * 1000,
	                    balance: event.balance,
	                    volume: event.volume
	                };
	                that.event(Laya.Event.LABEL, eventData);
	                var _soundChannel;
	                if (that._playAudio && eventData.audioValue) {
	                    _soundChannel = Laya.SoundManager.playSound(templet._textureDic.root + eventData.audioValue, 1, Laya.Handler.create(that, that._onAniSoundStoped), null, (that.currentPlayTime * 1000 - eventData.time) / 1000);
	                    Laya.SoundManager.playbackRate = that._playbackRate;
	                    _soundChannel && that._soundChannelArr.push(_soundChannel);
	                }
	            },
	        });
	    }
	    play(nameOrIndex, loop, force = true, start = 0, end = 0, freshSkin = true, playAudio = true) {
	        this._playAudio = playAudio;
	        start /= 1000;
	        end /= 1000;
	        var animationName = nameOrIndex;
	        if (start < 0 || end < 0)
	            throw new Error("SpineSkeleton: start and end must large than zero.");
	        if ((end !== 0) && (start > end))
	            throw new Error("SpineSkeleton: start must less than end.");
	        if (typeof animationName == "number") {
	            animationName = this.getAniNameByIndex(nameOrIndex);
	        }
	        if (force || this._pause || this._currAniName != animationName) {
	            this._currAniName = animationName;
	            this.state.setAnimation(this.trackIndex, animationName, loop);
	            let trackEntry = this.state.getCurrent(this.trackIndex);
	            trackEntry.animationStart = start;
	            if (!!end && end < trackEntry.animationEnd)
	                trackEntry.animationEnd = end;
	            let animationDuration = trackEntry.animation.duration;
	            this._duration = animationDuration;
	            this._playStart = start;
	            this._playEnd = end <= animationDuration ? end : animationDuration;
	            if (this._pause) {
	                this._pause = false;
	                this.timer.frameLoop(1, this, this._update, null, true);
	            }
	            this._update();
	        }
	    }
	    _update() {
	        this.timeKeeper.update();
	        let delta = this.timeKeeper.delta * this._playbackRate;
	        let trackEntry = this.state.getCurrent(this.trackIndex);
	        this.state.update(delta);
	        this.state.apply(this.skeleton);
	        let animationLast = trackEntry.animationLast;
	        this.currentPlayTime = Math.max(0, animationLast);
	        if (!this.state || !this.skeleton) {
	            return;
	        }
	        this.skeleton.updateWorldTransform();
	        this._ins.graphics.clear();
	        this.skeletonRenderer.draw(this.skeleton, -1, -1, this._ins, this._templet._textureDic);
	    }
	    getAnimNum() {
	        return this._templet.skeletonData.animations.length;
	    }
	    getAniNameByIndex(index) {
	        return this._templet.getAniNameByIndex(index);
	    }
	    getSlotByName(slotName) {
	        return this.skeleton.findSlot(slotName);
	    }
	    playbackRate(value) {
	        this._playbackRate = value;
	    }
	    showSkinByName(name) {
	        this.showSkinByIndex(this._templet.getSkinIndexByName(name));
	    }
	    showSkinByIndex(skinIndex) {
	        let newSkine = this.skeleton.data.skins[skinIndex];
	        this.skeleton.setSkin(newSkine);
	        this.skeleton.setSlotsToSetupPose();
	    }
	    stop() {
	        if (!this._pause) {
	            this._pause = true;
	            this._currAniName = null;
	            this.timer.clear(this, this._update);
	            this.state.update(-this.currentPlayTime);
	            this.currentPlayTime = 0;
	            this.event(Laya.Event.STOPPED);
	            if (this._soundChannelArr.length > 0) {
	                this._onAniSoundStoped(true);
	            }
	        }
	    }
	    paused() {
	        if (!this._pause) {
	            this._pause = true;
	            this.timer.clear(this, this._update);
	            this.event(Laya.Event.PAUSED);
	            if (this._soundChannelArr.length > 0) {
	                var _soundChannel;
	                for (var len = this._soundChannelArr.length, i = 0; i < len; i++) {
	                    _soundChannel = this._soundChannelArr[i];
	                    if (!_soundChannel.isStopped) {
	                        _soundChannel.pause();
	                    }
	                }
	            }
	        }
	    }
	    resume() {
	        if (this._pause) {
	            this._pause = false;
	            this.timer.frameLoop(1, this, this._update, null, true);
	            if (this._soundChannelArr.length > 0) {
	                var _soundChannel;
	                for (var len = this._soundChannelArr.length, i = 0; i < len; i++) {
	                    _soundChannel = this._soundChannelArr[i];
	                    if (_soundChannel.audioBuffer) {
	                        _soundChannel.resume();
	                    }
	                }
	            }
	        }
	    }
	    _onAniSoundStoped(force) {
	        var _channel;
	        for (var len = this._soundChannelArr.length, i = 0; i < len; i++) {
	            _channel = this._soundChannelArr[i];
	            if (_channel.isStopped || force) {
	                !_channel.isStopped && _channel.stop();
	                this._soundChannelArr.splice(i, 1);
	                len--;
	                i--;
	            }
	        }
	    }
	    destroy(destroyChild = true) {
	        super.destroy(destroyChild);
	        this._templet._removeReference(1);
	        this._templet = null;
	        this.timeKeeper = null;
	        this.skeleton = null;
	        this.state.clearListeners();
	        this.state = null;
	        this.skeletonRenderer = null;
	        this.timer.clear(this, this._update);
	        if (this._soundChannelArr.length > 0) {
	            this._onAniSoundStoped(true);
	        }
	    }
	    get templet() {
	        return this._templet;
	    }
	    addAnimation(nameOrIndex, loop = false, delay = 0) {
	        delay /= 1000;
	        var animationName = nameOrIndex;
	        if (typeof animationName == "number") {
	            animationName = this.getAniNameByIndex(animationName);
	        }
	        this._currAniName = animationName;
	        this.state.addAnimation(this.trackIndex, animationName, loop, delay);
	    }
	    setMix(fromNameOrIndex, toNameOrIndex, duration) {
	        duration /= 1000;
	        var fromName = fromNameOrIndex;
	        if (typeof fromName == "number") {
	            fromName = this.getAniNameByIndex(fromName);
	        }
	        var toName = toNameOrIndex;
	        if (typeof toName == "number") {
	            toName = this.getAniNameByIndex(toName);
	        }
	        this.stateData.setMix(fromName, toName, duration);
	    }
	    getBoneByName(boneName) {
	        return this.skeleton.findBone(boneName);
	    }
	    getSkeleton() {
	        return this.skeleton;
	    }
	    setSlotAttachment(slotName, attachmentName) {
	        this.skeleton.setAttachment(slotName, attachmentName);
	    }
	    set currentTime(value) {
	        if (!this._currAniName || !this._templet)
	            return;
	        value /= 1000;
	        if (value < this._playStart || (!!this._playEnd && value > this._playEnd) || value > this._duration)
	            throw new Error("AnimationPlayer: value must large than playStartTime,small than playEndTime.");
	        this.state.update(value - this.currentPlayTime);
	        this.currentPlayTime = value;
	    }
	    get playState() {
	        if (!this._currAniName)
	            return SpineSkeleton.stopped;
	        if (this._pause)
	            return SpineSkeleton.paused;
	        return SpineSkeleton.playing;
	    }
	}
	SpineSkeleton.stopped = 0;
	SpineSkeleton.paused = 1;
	SpineSkeleton.playing = 2;
	Laya.ILaya.regClass(SpineSkeleton);
	Laya.ClassUtils.regClass("laya.layaspine.SpineSkeleton", SpineSkeleton);
	Laya.ClassUtils.regClass("Laya.SpineSkeleton", SpineSkeleton);

	var SharedAssetManager = spine.SharedAssetManager;
	var TextureAtlas = spine.TextureAtlas;
	var AtlasAttachmentLoader = spine.AtlasAttachmentLoader;
	var SkeletonJson = spine.SkeletonJson;
	class SpineTemplet extends Laya.Resource {
	    constructor() {
	        super();
	        this._textureDic = {};
	        this._isDestroyed = false;
	        this._layaPremultipliedAlpha = true;
	        this._spinePremultipliedAlpha = false;
	    }
	    loadAni(jsonUrl, textureUrlList = null) {
	        let splitIndex = jsonUrl.lastIndexOf("/") + 1;
	        let clientId = jsonUrl.slice(0, splitIndex);
	        jsonUrl = jsonUrl.slice(splitIndex);
	        let atlasUrl = jsonUrl.replace(".json", ".atlas");
	        if (!textureUrlList) {
	            textureUrlList = [jsonUrl.replace(".json", ".png")];
	        }
	        this._textureDic.root = clientId;
	        this._textureUrlList = textureUrlList;
	        this.clientId = clientId;
	        this.atlasUrl = atlasUrl;
	        this.jsonUrl = jsonUrl;
	        this.assetManager = new SharedAssetManager(clientId);
	        this.assetManager.loadJson(clientId, jsonUrl);
	        this.assetManager.loadText(clientId, atlasUrl);
	        for (var i = 0, len = textureUrlList.length, texture; i < len; i++) {
	            texture = textureUrlList[i];
	            this.assetManager.loadTexture(clientId, this.textureLoader.bind(this), texture);
	        }
	        window.requestAnimationFrame(this.loop.bind(this));
	    }
	    textureLoader(tex) {
	        var src = tex.url;
	        var tTextureName, item, textureUrlList = this._textureUrlList;
	        for (var i = 0, len = textureUrlList.length; i < len; i++) {
	            item = textureUrlList[i];
	            if (src.endsWith(`/${item}`)) {
	                tTextureName = item;
	                break;
	            }
	        }
	        var tTexture = this._textureDic[tTextureName] = new SpineGLTexture(tex.bitmap);
	        return tTexture;
	    }
	    loop() {
	        if (this.assetManager.isLoadingComplete(this.clientId)) {
	            this.parseSpineAni();
	            return;
	        }
	        if (this.assetManager.hasErrors()) {
	            this.event(Laya.Event.ERROR, "load failed:" + this.assetManager.getErrors());
	            return;
	        }
	        window.requestAnimationFrame(this.loop.bind(this));
	    }
	    parseSpineAni() {
	        if (this._isDestroyed) {
	            this.destroy();
	            return;
	        }
	        var _this = this;
	        var atlas = new TextureAtlas(this.assetManager.get(this.clientId, this.atlasUrl), function (path) {
	            return _this.assetManager.get(_this.clientId, path);
	        });
	        var atlasLoader = new AtlasAttachmentLoader(atlas);
	        this.skeletonJson = new SkeletonJson(atlasLoader);
	        this.skeletonData = this.skeletonJson.readSkeletonData(this.assetManager.get(this.clientId, this.jsonUrl));
	        this.event(Laya.Event.COMPLETE, this);
	    }
	    buildArmature() {
	        return new SpineSkeleton(this);
	    }
	    getAniNameByIndex(index) {
	        var tAni = this.skeletonData.animations[index];
	        if (tAni)
	            return tAni.name;
	        return null;
	    }
	    getSkinIndexByName(skinName) {
	        var skins = this.skeletonData.skins;
	        var tSkinData;
	        for (var i = 0, n = skins.length; i < n; i++) {
	            tSkinData = skins[i];
	            if (tSkinData.name == skinName) {
	                return i;
	            }
	        }
	        return -1;
	    }
	    destroy() {
	        this._isDestroyed = true;
	        var tTexture;
	        for (tTexture in this._textureDic) {
	            if (tTexture == "root")
	                continue;
	            if (tTexture) {
	                this._textureDic[tTexture].destroy();
	            }
	        }
	        super.destroy();
	    }
	}

	var AssetManager = spine.AssetManager;
	var AtlasAttachmentLoader$1 = spine.AtlasAttachmentLoader;
	var SkeletonBinary = spine.SkeletonBinary;
	class SpineTempletBinary extends Laya.Resource {
	    constructor() {
	        super();
	        this._textureDic = {};
	        this._isDestroyed = false;
	        this._layaPremultipliedAlpha = true;
	        this._spinePremultipliedAlpha = false;
	    }
	    loadAni(skelUrl, textureUrlList = null) {
	        let splitIndex = skelUrl.lastIndexOf("/") + 1;
	        let pathPrefix = skelUrl.slice(0, splitIndex);
	        skelUrl = skelUrl.slice(splitIndex);
	        this.skelUrl = skelUrl;
	        skelUrl = skelUrl.replace(".json", ".skel");
	        let atlasUrl = skelUrl.replace(".skel", ".atlas");
	        if (!textureUrlList) {
	            textureUrlList = [skelUrl.replace(".skel", ".png")];
	        }
	        this._textureDic.root = pathPrefix;
	        this.pathPrefix = pathPrefix;
	        this.atlasUrl = atlasUrl;
	        this.textureUrlList = textureUrlList;
	        this.assetManager = new AssetManager(this.textureLoader.bind(this), pathPrefix);
	        this.assetManager.loadBinary(this.skelUrl);
	        this.assetManager.loadTextureAtlas(atlasUrl);
	        Laya.Laya.timer.frameOnce(1, this, this.loop);
	    }
	    textureLoader(tex) {
	        let src = tex.url;
	        let tTextureName, item, textureUrlList = this.textureUrlList;
	        for (let i = 0, len = textureUrlList.length; i < len; i++) {
	            item = textureUrlList[i];
	            if (src.endsWith(item)) {
	                tTextureName = item;
	                break;
	            }
	        }
	        let tTexture = this._textureDic[tTextureName] = new SpineGLTexture(tex.bitmap);
	        return tTexture;
	    }
	    loop() {
	        if (this.assetManager.isLoadingComplete()) {
	            this.parseSpineAni();
	            return;
	        }
	        if (this.assetManager.hasErrors()) {
	            this.event(Laya.Event.ERROR, "load failed:" + this.assetManager.getErrors());
	            return;
	        }
	        window.requestAnimationFrame(this.loop.bind(this));
	    }
	    parseSpineAni() {
	        if (this._isDestroyed) {
	            this.destroy();
	            return;
	        }
	        let atlas = this.assetManager.get(this.atlasUrl);
	        let atlasLoader = new AtlasAttachmentLoader$1(atlas);
	        this.skeletonBinary = new SkeletonBinary(atlasLoader);
	        this.skeletonData = this.skeletonBinary.readSkeletonData(this.assetManager.get(this.skelUrl));
	        this.event(Laya.Event.COMPLETE, this);
	    }
	    buildArmature() {
	        return new SpineSkeleton(this);
	    }
	    getAniNameByIndex(index) {
	        let tAni = this.skeletonData.animations[index];
	        if (tAni)
	            return tAni.name;
	        return null;
	    }
	    getSkinIndexByName(skinName) {
	        let skins = this.skeletonData.skins;
	        let tSkinData;
	        for (let i = 0, n = skins.length; i < n; i++) {
	            tSkinData = skins[i];
	            if (tSkinData.name == skinName) {
	                return i;
	            }
	        }
	        return -1;
	    }
	    destroy() {
	        this._isDestroyed = true;
	        let tTexture;
	        for (tTexture in this._textureDic) {
	            if (tTexture == "root")
	                continue;
	            if (tTexture) {
	                this._textureDic[tTexture].destroy();
	            }
	        }
	        super.destroy();
	    }
	}

	exports.SpineGLTexture = SpineGLTexture;
	exports.SpineSkeleton = SpineSkeleton;
	exports.SpineSkeletonRenderer = SpineSkeletonRenderer;
	exports.SpineTemplet = SpineTemplet;
	exports.SpineTempletBinary = SpineTempletBinary;

}(window.Laya = window.Laya || {}, Laya));
