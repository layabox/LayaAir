window.wxMiniGame = function (exports, Laya) {
	'use strict';

	class MiniFileMgr {
	    static isLocalNativeFile(url) {
	        for (var i = 0, sz = MiniAdpter.nativefiles.length; i < sz; i++) {
	            if (url.indexOf(MiniAdpter.nativefiles[i]) != -1)
	                return true;
	        }
	        return false;
	    }
	    static getFileInfo(fileUrl) {
	        var fileNativePath = fileUrl;
	        var fileObj = MiniFileMgr.fakeObj[fileNativePath];
	        if (fileObj == null)
	            return null;
	        else
	            return fileObj;
	        return null;
	    }
	    static read(filePath, encoding = "utf8", callBack = null, readyUrl = "", isSaveFile = false, fileType = "") {
	        var fileUrl;
	        if (readyUrl != "" && (readyUrl.indexOf("http://") != -1 || readyUrl.indexOf("https://") != -1)) {
	            fileUrl = MiniFileMgr.getFileNativePath(filePath);
	        }
	        else {
	            fileUrl = filePath;
	        }
	        fileUrl = Laya.URL.getAdptedFilePath(fileUrl);
	        MiniFileMgr.fs.readFile({ filePath: fileUrl, encoding: encoding, success: function (data) {
	                callBack != null && callBack.runWith([0, data]);
	            }, fail: function (data) {
	                if (data && readyUrl != "")
	                    MiniFileMgr.downFiles(readyUrl, encoding, callBack, readyUrl, isSaveFile, fileType);
	                else
	                    callBack != null && callBack.runWith([1]);
	            } });
	    }
	    static downFiles(fileUrl, encoding = "utf8", callBack = null, readyUrl = "", isSaveFile = false, fileType = "", isAutoClear = true) {
	        var downloadTask = MiniFileMgr.wxdown({ url: fileUrl, success: function (data) {
	                if (data.statusCode === 200)
	                    MiniFileMgr.readFile(data.tempFilePath, encoding, callBack, readyUrl, isSaveFile, fileType, isAutoClear);
	                else if (data.statusCode === 403) {
	                    callBack != null && callBack.runWith([0, fileUrl]);
	                }
	                else {
	                    callBack != null && callBack.runWith([1, data]);
	                }
	            }, fail: function (data) {
	                callBack != null && callBack.runWith([1, data]);
	            } });
	        downloadTask.onProgressUpdate(function (data) {
	            callBack != null && callBack.runWith([2, data.progress]);
	        });
	    }
	    static readFile(filePath, encoding = "utf8", callBack = null, readyUrl = "", isSaveFile = false, fileType = "", isAutoClear = true) {
	        filePath = Laya.URL.getAdptedFilePath(filePath);
	        MiniFileMgr.fs.readFile({ filePath: filePath, encoding: encoding, success: function (data) {
	                if (filePath.indexOf("http://") != -1 || filePath.indexOf("https://") != -1) {
	                    if (MiniAdpter.autoCacheFile || isSaveFile) {
	                        callBack != null && callBack.runWith([0, data]);
	                        MiniFileMgr.copyFile(filePath, readyUrl, null, encoding, isAutoClear);
	                    }
	                    else
	                        callBack != null && callBack.runWith([0, data]);
	                }
	                else
	                    callBack != null && callBack.runWith([0, data]);
	            }, fail: function (data) {
	                if (data)
	                    callBack != null && callBack.runWith([1, data]);
	            } });
	    }
	    static downOtherFiles(fileUrl, callBack = null, readyUrl = "", isSaveFile = false, isAutoClear = true) {
	        MiniFileMgr.wxdown({ url: fileUrl, success: function (data) {
	                if (data.statusCode === 200) {
	                    if ((MiniAdpter.autoCacheFile || isSaveFile) && readyUrl.indexOf("qlogo.cn") == -1 && readyUrl.indexOf(".php") == -1) {
	                        callBack != null && callBack.runWith([0, data.tempFilePath]);
	                        MiniFileMgr.copyFile(data.tempFilePath, readyUrl, null, "", isAutoClear);
	                    }
	                    else
	                        callBack != null && callBack.runWith([0, data.tempFilePath]);
	                }
	                else {
	                    callBack != null && callBack.runWith([1, data]);
	                }
	            }, fail: function (data) {
	                callBack != null && callBack.runWith([1, data]);
	            } });
	    }
	    static downLoadFile(fileUrl, fileType = "", callBack = null, encoding = "utf8") {
	        if (window.navigator.userAgent.indexOf('MiniGame') < 0) {
	            Laya.Laya.loader.load(fileUrl, callBack);
	        }
	        else {
	            if (fileType == Laya.Loader.IMAGE || fileType == Laya.Loader.SOUND)
	                MiniFileMgr.downOtherFiles(fileUrl, callBack, fileUrl, true, false);
	            else
	                MiniFileMgr.downFiles(fileUrl, encoding, callBack, fileUrl, true, fileType, false);
	        }
	    }
	    static copyFile(tempFilePath, readyUrl, callBack, encoding = "", isAutoClear = true) {
	        var temp = tempFilePath.split("/");
	        var tempFileName = temp[temp.length - 1];
	        var fileurlkey = readyUrl;
	        var fileObj = MiniFileMgr.getFileInfo(readyUrl);
	        var saveFilePath = MiniFileMgr.getFileNativePath(tempFileName);
	        MiniFileMgr.fakeObj[fileurlkey] = { md5: tempFileName, readyUrl: readyUrl, size: 0, times: Laya.Browser.now(), encoding: encoding };
	        var totalSize = 50 * 1024 * 1024;
	        var chaSize = 4 * 1024 * 1024;
	        var fileUseSize = MiniFileMgr.getCacheUseSize();
	        if (fileObj) {
	            if (fileObj.readyUrl != readyUrl) {
	                MiniFileMgr.fs.getFileInfo({
	                    filePath: tempFilePath,
	                    success: function (data) {
	                        if ((isAutoClear && (fileUseSize + chaSize + data.size) >= totalSize)) {
	                            if (data.size > MiniAdpter.minClearSize)
	                                MiniAdpter.minClearSize = data.size;
	                            MiniFileMgr.onClearCacheRes();
	                        }
	                        MiniFileMgr.deleteFile(tempFilePath, readyUrl, callBack, encoding, data.size);
	                    },
	                    fail: function (data) {
	                        callBack != null && callBack.runWith([1, data]);
	                    }
	                });
	            }
	            else
	                callBack != null && callBack.runWith([0]);
	        }
	        else {
	            MiniFileMgr.fs.getFileInfo({
	                filePath: tempFilePath,
	                success: function (data) {
	                    if ((isAutoClear && (fileUseSize + chaSize + data.size) >= totalSize)) {
	                        if (data.size > MiniAdpter.minClearSize)
	                            MiniAdpter.minClearSize = data.size;
	                        MiniFileMgr.onClearCacheRes();
	                    }
	                    MiniFileMgr.fs.copyFile({ srcPath: tempFilePath, destPath: saveFilePath, success: function (data2) {
	                            MiniFileMgr.onSaveFile(readyUrl, tempFileName, true, encoding, callBack, data.size);
	                        }, fail: function (data) {
	                            callBack != null && callBack.runWith([1, data]);
	                        } });
	                },
	                fail: function (data) {
	                    callBack != null && callBack.runWith([1, data]);
	                }
	            });
	        }
	    }
	    static onClearCacheRes() {
	        var memSize = MiniAdpter.minClearSize;
	        var tempFileListArr = [];
	        for (var key in MiniFileMgr.filesListObj) {
	            if (key != "fileUsedSize")
	                tempFileListArr.push(MiniFileMgr.filesListObj[key]);
	        }
	        MiniFileMgr.sortOn(tempFileListArr, "times", MiniFileMgr.NUMERIC);
	        var clearSize = 0;
	        for (var i = 1, sz = tempFileListArr.length; i < sz; i++) {
	            var fileObj = tempFileListArr[i];
	            if (clearSize >= memSize)
	                break;
	            clearSize += fileObj.size;
	            MiniFileMgr.deleteFile("", fileObj.readyUrl);
	        }
	    }
	    static sortOn(array, name, options = 0) {
	        if (options == MiniFileMgr.NUMERIC)
	            return array.sort(function (a, b) { return a[name] - b[name]; });
	        if (options == (MiniFileMgr.NUMERIC | MiniFileMgr.DESCENDING))
	            return array.sort(function (a, b) { return b[name] - a[name]; });
	        return array.sort(function (a, b) { return a[name] - b[name]; });
	    }
	    static getFileNativePath(fileName) {
	        return MiniFileMgr.fileNativeDir + "/" + fileName;
	    }
	    static deleteFile(tempFileName, readyUrl = "", callBack = null, encoding = "", fileSize = 0) {
	        var fileObj = MiniFileMgr.getFileInfo(readyUrl);
	        var deleteFileUrl = MiniFileMgr.getFileNativePath(fileObj.md5);
	        var isAdd = tempFileName != "" ? true : false;
	        MiniFileMgr.onSaveFile(readyUrl, tempFileName, isAdd, encoding, callBack, fileSize);
	        MiniFileMgr.fs.unlink({ filePath: deleteFileUrl, success: function (data) {
	                if (tempFileName != "") {
	                    var saveFilePath = MiniFileMgr.getFileNativePath(tempFileName);
	                    MiniFileMgr.fs.copyFile({ srcPath: tempFileName, destPath: saveFilePath, success: function (data) {
	                        }, fail: function (data) {
	                            callBack != null && callBack.runWith([1, data]);
	                        } });
	                }
	            }, fail: function (data) {
	            } });
	    }
	    static deleteAll() {
	        var tempFileListArr = [];
	        for (var key in MiniFileMgr.filesListObj) {
	            if (key != "fileUsedSize")
	                tempFileListArr.push(MiniFileMgr.filesListObj[key]);
	        }
	        for (var i = 1, sz = tempFileListArr.length; i < sz; i++) {
	            var fileObj = tempFileListArr[i];
	            MiniFileMgr.deleteFile("", fileObj.readyUrl);
	        }
	        if (MiniFileMgr.filesListObj && MiniFileMgr.filesListObj.fileUsedSize) {
	            MiniFileMgr.filesListObj.fileUsedSize = 0;
	        }
	        MiniFileMgr.writeFilesList("", JSON.stringify({}), false);
	    }
	    static onSaveFile(readyUrl, md5Name, isAdd = true, encoding = "", callBack = null, fileSize = 0) {
	        var fileurlkey = readyUrl;
	        if (MiniFileMgr.filesListObj['fileUsedSize'] == null)
	            MiniFileMgr.filesListObj['fileUsedSize'] = 0;
	        if (isAdd) {
	            var fileNativeName = MiniFileMgr.getFileNativePath(md5Name);
	            MiniFileMgr.filesListObj[fileurlkey] = { md5: md5Name, readyUrl: readyUrl, size: fileSize, times: Laya.Browser.now(), encoding: encoding };
	            MiniFileMgr.filesListObj['fileUsedSize'] = parseInt(MiniFileMgr.filesListObj['fileUsedSize']) + fileSize;
	            MiniFileMgr.writeFilesList(fileurlkey, JSON.stringify(MiniFileMgr.filesListObj), true);
	            callBack != null && callBack.runWith([0]);
	        }
	        else {
	            if (MiniFileMgr.filesListObj[fileurlkey]) {
	                var deletefileSize = parseInt(MiniFileMgr.filesListObj[fileurlkey].size);
	                MiniFileMgr.filesListObj['fileUsedSize'] = parseInt(MiniFileMgr.filesListObj['fileUsedSize']) - deletefileSize;
	                delete MiniFileMgr.filesListObj[fileurlkey];
	                MiniFileMgr.writeFilesList(fileurlkey, JSON.stringify(MiniFileMgr.filesListObj), false);
	                callBack != null && callBack.runWith([0]);
	            }
	        }
	    }
	    static writeFilesList(fileurlkey, filesListStr, isAdd) {
	        var listFilesPath = MiniFileMgr.fileNativeDir + "/" + MiniFileMgr.fileListName;
	        MiniFileMgr.fs.writeFile({ filePath: listFilesPath, encoding: 'utf8', data: filesListStr, success: function (data) {
	            }, fail: function (data) {
	            } });
	        if (!MiniAdpter.isZiYu && MiniAdpter.isPosMsgYu) {
	            MiniAdpter.window.wx.postMessage({ url: fileurlkey, data: MiniFileMgr.filesListObj[fileurlkey], isLoad: "filenative", isAdd: isAdd });
	        }
	    }
	    static getCacheUseSize() {
	        if (MiniFileMgr.filesListObj && MiniFileMgr.filesListObj['fileUsedSize'])
	            return MiniFileMgr.filesListObj['fileUsedSize'];
	        return 0;
	    }
	    static existDir(dirPath, callBack) {
	        MiniFileMgr.fs.mkdir({ dirPath: dirPath, success: function (data) {
	                callBack != null && callBack.runWith([0, { data: JSON.stringify({}) }]);
	            }, fail: function (data) {
	                if (data.errMsg.indexOf("file already exists") != -1)
	                    MiniFileMgr.readSync(MiniFileMgr.fileListName, "utf8", callBack);
	                else
	                    callBack != null && callBack.runWith([1, data]);
	            } });
	    }
	    static readSync(filePath, encoding = "utf8", callBack = null, readyUrl = "") {
	        var fileUrl = MiniFileMgr.getFileNativePath(filePath);
	        var filesListStr;
	        try {
	            filesListStr = MiniFileMgr.fs.readFileSync(fileUrl, encoding);
	            callBack != null && callBack.runWith([0, { data: filesListStr }]);
	        }
	        catch (error) {
	            callBack != null && callBack.runWith([1]);
	        }
	    }
	    static setNativeFileDir(value) {
	        MiniFileMgr.fileNativeDir = MiniAdpter.window.wx.env.USER_DATA_PATH + value;
	    }
	}
	MiniFileMgr.fs = window.wx.getFileSystemManager();
	MiniFileMgr.wxdown = window.wx.downloadFile;
	MiniFileMgr.filesListObj = {};
	MiniFileMgr.fakeObj = {};
	MiniFileMgr.fileListName = "layaairfiles.txt";
	MiniFileMgr.ziyuFileData = {};
	MiniFileMgr.ziyuFileTextureData = {};
	MiniFileMgr.loadPath = "";
	MiniFileMgr.DESCENDING = 2;
	MiniFileMgr.NUMERIC = 16;

	class MiniSoundChannel extends Laya.SoundChannel {
	    constructor(audio, miniSound) {
	        super();
	        this._audio = audio;
	        this._miniSound = miniSound;
	        this._onEnd = MiniSoundChannel.bindToThis(this.__onEnd, this);
	        audio.onEnded(this._onEnd);
	    }
	    static bindToThis(fun, scope) {
	        var rst = fun;
	        rst = fun.bind(scope);
	        return rst;
	    }
	    __onEnd() {
	        if (this.loops == 1) {
	            if (this.completeHandler) {
	                Laya.Laya.systemTimer.once(10, this, this.__runComplete, [this.completeHandler], false);
	                this.completeHandler = null;
	            }
	            this.stop();
	            this.event(Laya.Event.COMPLETE);
	            return;
	        }
	        if (this.loops > 0) {
	            this.loops--;
	        }
	        this.startTime = 0;
	        this.play();
	    }
	    play() {
	        this.isStopped = false;
	        Laya.SoundManager.addChannel(this);
	        this._audio.play();
	    }
	    set startTime(time) {
	        if (this._audio) {
	            this._audio.startTime = time;
	        }
	    }
	    set autoplay(value) {
	        this._audio.autoplay = value;
	    }
	    get autoplay() {
	        return this._audio.autoplay;
	    }
	    get position() {
	        if (!this._audio)
	            return 0;
	        return this._audio.currentTime;
	    }
	    get duration() {
	        if (!this._audio)
	            return 0;
	        return this._audio.duration;
	    }
	    stop() {
	        this.isStopped = true;
	        Laya.SoundManager.removeChannel(this);
	        this.completeHandler = null;
	        if (!this._audio)
	            return;
	        this._audio.stop();
	        if (!this.loop) {
	            this._audio.offEnded(null);
	            this._miniSound.dispose();
	            this._audio = null;
	            this._miniSound = null;
	            this._onEnd = null;
	        }
	    }
	    pause() {
	        this.isStopped = true;
	        this._audio.pause();
	    }
	    get loop() {
	        return this._audio.loop;
	    }
	    set loop(value) {
	        this._audio.loop = value;
	    }
	    resume() {
	        if (!this._audio)
	            return;
	        this.isStopped = false;
	        Laya.SoundManager.addChannel(this);
	        this._audio.play();
	    }
	    set volume(v) {
	        if (!this._audio)
	            return;
	        this._audio.volume = v;
	    }
	    get volume() {
	        if (!this._audio)
	            return 1;
	        return this._audio.volume;
	    }
	}

	class MiniSound extends Laya.EventDispatcher {
	    constructor() {
	        super();
	        this.loaded = false;
	    }
	    static _createSound() {
	        MiniSound._id++;
	        return MiniAdpter.window.wx.createInnerAudioContext();
	    }
	    load(url) {
	        if (!MiniSound._musicAudio)
	            MiniSound._musicAudio = MiniSound._createSound();
	        if (!MiniFileMgr.isLocalNativeFile(url)) {
	            url = Laya.URL.formatURL(url);
	        }
	        else {
	            if (url.indexOf("http://") != -1 || url.indexOf("https://") != -1) {
	                if (MiniFileMgr.loadPath != "") {
	                    url = url.split(MiniFileMgr.loadPath)[1];
	                }
	                else {
	                    var tempStr = Laya.URL.rootPath != "" ? Laya.URL.rootPath : Laya.URL._basePath;
	                    if (tempStr != "")
	                        url = url.split(tempStr)[1];
	                }
	            }
	        }
	        this.url = url;
	        this.readyUrl = url;
	        if (MiniSound._audioCache[this.readyUrl]) {
	            this.event(Laya.Event.COMPLETE);
	            return;
	        }
	        if (MiniAdpter.autoCacheFile && MiniFileMgr.getFileInfo(url)) {
	            this.onDownLoadCallBack(url, 0);
	        }
	        else {
	            if (!MiniAdpter.autoCacheFile) {
	                this.onDownLoadCallBack(url, 0);
	            }
	            else {
	                if (MiniFileMgr.isLocalNativeFile(url)) {
	                    tempStr = Laya.URL.rootPath != "" ? Laya.URL.rootPath : Laya.URL._basePath;
	                    var tempUrl = url;
	                    if (tempStr != "")
	                        url = url.split(tempStr)[1];
	                    if (!url) {
	                        url = tempUrl;
	                    }
	                    if (MiniAdpter.subNativeFiles && MiniAdpter.subNativeheads.length == 0) {
	                        for (var key in MiniAdpter.subNativeFiles) {
	                            var tempArr = MiniAdpter.subNativeFiles[key];
	                            MiniAdpter.subNativeheads = MiniAdpter.subNativeheads.concat(tempArr);
	                            for (var aa = 0; aa < tempArr.length; aa++) {
	                                MiniAdpter.subMaps[tempArr[aa]] = key + "/" + tempArr[aa];
	                            }
	                        }
	                    }
	                    if (MiniAdpter.subNativeFiles && url.indexOf("/") != -1) {
	                        var curfileHead = url.split("/")[0] + "/";
	                        if (curfileHead && MiniAdpter.subNativeheads.indexOf(curfileHead) != -1) {
	                            var newfileHead = MiniAdpter.subMaps[curfileHead];
	                            url = url.replace(curfileHead, newfileHead);
	                        }
	                    }
	                    this.onDownLoadCallBack(url, 0);
	                }
	                else {
	                    if (!MiniFileMgr.isLocalNativeFile(url) && (url.indexOf("http://") == -1 && url.indexOf("https://") == -1) || (url.indexOf("http://usr/") != -1)) {
	                        this.onDownLoadCallBack(url, 0);
	                    }
	                    else {
	                        MiniFileMgr.downOtherFiles(url, Laya.Handler.create(this, this.onDownLoadCallBack, [url]), url);
	                    }
	                }
	            }
	        }
	    }
	    onDownLoadCallBack(sourceUrl, errorCode, tempFilePath = null) {
	        if (!errorCode) {
	            var fileNativeUrl;
	            if (MiniAdpter.autoCacheFile) {
	                if (!tempFilePath) {
	                    if (MiniFileMgr.isLocalNativeFile(sourceUrl)) {
	                        var tempStr = Laya.URL.rootPath != "" ? Laya.URL.rootPath : Laya.URL._basePath;
	                        var tempUrl = sourceUrl;
	                        if (tempStr != "" && (sourceUrl.indexOf("http://") != -1 || sourceUrl.indexOf("https://") != -1))
	                            fileNativeUrl = sourceUrl.split(tempStr)[1];
	                        if (!fileNativeUrl) {
	                            fileNativeUrl = tempUrl;
	                        }
	                    }
	                    else {
	                        var fileObj = MiniFileMgr.getFileInfo(sourceUrl);
	                        if (fileObj && fileObj.md5) {
	                            var fileMd5Name = fileObj.md5;
	                            fileNativeUrl = MiniFileMgr.getFileNativePath(fileMd5Name);
	                        }
	                        else {
	                            fileNativeUrl = sourceUrl;
	                        }
	                    }
	                }
	                else {
	                    fileNativeUrl = tempFilePath;
	                }
	                if (this.url != Laya.SoundManager._bgMusic) {
	                    this._sound = MiniSound._createSound();
	                    this._sound.src = this.url = fileNativeUrl;
	                }
	                else {
	                    this._sound = MiniSound._musicAudio;
	                    this._sound.src = this.url = fileNativeUrl;
	                }
	            }
	            else {
	                if (this.url != Laya.SoundManager._bgMusic) {
	                    this._sound = MiniSound._createSound();
	                    this._sound.src = sourceUrl;
	                }
	                else {
	                    this._sound = MiniSound._musicAudio;
	                    this._sound.src = sourceUrl;
	                }
	            }
	            this._sound.onCanplay(MiniSound.bindToThis(this.onCanPlay, this));
	            this._sound.onError(MiniSound.bindToThis(this.onError, this));
	        }
	        else {
	            this.event(Laya.Event.ERROR);
	        }
	    }
	    onError(error) {
	        try {
	            console.log("-----1---------------minisound-----id:" + MiniSound._id);
	            console.log(error);
	        }
	        catch (error) {
	            console.log("-----2---------------minisound-----id:" + MiniSound._id);
	            console.log(error);
	        }
	        this.event(Laya.Event.ERROR);
	        this._sound.offError(null);
	    }
	    onCanPlay() {
	        this.loaded = true;
	        this.event(Laya.Event.COMPLETE);
	        this._sound.offCanplay(null);
	    }
	    static bindToThis(fun, scope) {
	        var rst = fun;
	        rst = fun.bind(scope);
	        return rst;
	    }
	    play(startTime = 0, loops = 0) {
	        var tSound;
	        if (this.url == Laya.SoundManager._bgMusic) {
	            if (!MiniSound._musicAudio)
	                MiniSound._musicAudio = MiniSound._createSound();
	            tSound = MiniSound._musicAudio;
	        }
	        else {
	            if (MiniSound._audioCache[this.readyUrl]) {
	                tSound = MiniSound._audioCache[this.readyUrl]._sound;
	            }
	            else {
	                tSound = MiniSound._createSound();
	            }
	        }
	        if (!tSound)
	            return null;
	        if (MiniAdpter.autoCacheFile && MiniFileMgr.getFileInfo(this.url)) {
	            var fileObj = MiniFileMgr.getFileInfo(this.url);
	            var fileMd5Name = fileObj.md5;
	            tSound.src = this.url = MiniFileMgr.getFileNativePath(fileMd5Name);
	        }
	        else {
	            tSound.src = this.url;
	        }
	        var channel = new MiniSoundChannel(tSound, this);
	        channel.url = this.url;
	        channel.loops = loops;
	        channel.loop = (loops === 0 ? true : false);
	        channel.startTime = startTime;
	        channel.play();
	        Laya.SoundManager.addChannel(channel);
	        return channel;
	    }
	    get duration() {
	        return this._sound.duration;
	    }
	    dispose() {
	        var ad = MiniSound._audioCache[this.readyUrl];
	        if (ad) {
	            ad.src = "";
	            if (ad._sound) {
	                ad._sound.destroy();
	                ad._sound = null;
	                ad = null;
	            }
	            delete MiniSound._audioCache[this.readyUrl];
	        }
	        if (this._sound) {
	            this._sound.destroy();
	            this._sound = null;
	            this.readyUrl = this.url = null;
	        }
	    }
	}
	MiniSound._id = 0;
	MiniSound._audioCache = {};

	class MiniInput {
	    constructor() {
	    }
	    static _createInputElement() {
	        Laya.Input['_initInput'](Laya.Input['area'] = Laya.Browser.createElement("textarea"));
	        Laya.Input['_initInput'](Laya.Input['input'] = Laya.Browser.createElement("input"));
	        Laya.Input['inputContainer'] = Laya.Browser.createElement("div");
	        Laya.Input['inputContainer'].style.position = "absolute";
	        Laya.Input['inputContainer'].style.zIndex = 1E5;
	        Laya.Browser.container.appendChild(Laya.Input['inputContainer']);
	        Laya.Laya.stage.on("resize", null, MiniInput._onStageResize);
	        MiniAdpter.window.wx.onWindowResize && MiniAdpter.window.wx.onWindowResize(function (res) {
	        });
	        Laya.SoundManager._soundClass = MiniSound;
	        Laya.SoundManager._musicClass = MiniSound;
	        var model = MiniAdpter.systemInfo.model;
	        var system = MiniAdpter.systemInfo.system;
	        if (model.indexOf("iPhone") != -1) {
	            Laya.Browser.onIPhone = true;
	            Laya.Browser.onIOS = true;
	            Laya.Browser.onIPad = true;
	            Laya.Browser.onAndroid = false;
	        }
	        if (system.indexOf("Android") != -1 || system.indexOf("Adr") != -1) {
	            Laya.Browser.onAndroid = true;
	            Laya.Browser.onIPhone = false;
	            Laya.Browser.onIOS = false;
	            Laya.Browser.onIPad = false;
	        }
	    }
	    static _onStageResize() {
	        var ts = Laya.Laya.stage._canvasTransform.identity();
	        ts.scale((Laya.Browser.width / Laya.Render.canvas.width / Laya.Browser.pixelRatio), Laya.Browser.height / Laya.Render.canvas.height / Laya.Browser.pixelRatio);
	    }
	    static wxinputFocus(e) {
	        var _inputTarget = Laya.Input['inputElement'].target;
	        if (_inputTarget && !_inputTarget.editable) {
	            return;
	        }
	        MiniAdpter.window.wx.offKeyboardConfirm();
	        MiniAdpter.window.wx.offKeyboardInput();
	        MiniAdpter.window.wx.showKeyboard({ defaultValue: _inputTarget.text, maxLength: _inputTarget.maxChars, multiple: _inputTarget.multiline, confirmHold: true, confirmType: _inputTarget["confirmType"] || 'done', success: function (res) {
	            }, fail: function (res) {
	            } });
	        MiniAdpter.window.wx.onKeyboardConfirm(function (res) {
	            var str = res ? res.value : "";
	            if (_inputTarget._restrictPattern) {
	                str = str.replace(/\u2006|\x27/g, "");
	                if (_inputTarget._restrictPattern.test(str)) {
	                    str = str.replace(_inputTarget._restrictPattern, "");
	                }
	            }
	            _inputTarget.text = str;
	            _inputTarget.event(Laya.Event.INPUT);
	            MiniInput.inputEnter();
	            _inputTarget.event("confirm");
	        });
	        MiniAdpter.window.wx.onKeyboardInput(function (res) {
	            var str = res ? res.value : "";
	            if (!_inputTarget.multiline) {
	                if (str.indexOf("\n") != -1) {
	                    MiniInput.inputEnter();
	                    return;
	                }
	            }
	            if (_inputTarget._restrictPattern) {
	                str = str.replace(/\u2006|\x27/g, "");
	                if (_inputTarget._restrictPattern.test(str)) {
	                    str = str.replace(_inputTarget._restrictPattern, "");
	                }
	            }
	            _inputTarget.text = str;
	            _inputTarget.event(Laya.Event.INPUT);
	        });
	    }
	    static inputEnter() {
	        Laya.Input['inputElement'].target.focus = false;
	    }
	    static wxinputblur() {
	        MiniInput.hideKeyboard();
	    }
	    static hideKeyboard() {
	        MiniAdpter.window.wx.offKeyboardConfirm();
	        MiniAdpter.window.wx.offKeyboardInput();
	        MiniAdpter.window.wx.hideKeyboard({ success: function (res) {
	                console.log('隐藏键盘');
	            }, fail: function (res) {
	                console.log("隐藏键盘出错:" + (res ? res.errMsg : ""));
	            } });
	    }
	}

	class MiniLoader extends Laya.EventDispatcher {
	    constructor() {
	        super();
	    }
	    _loadResourceFilter(type, url) {
	        var thisLoader = this;
	        if (url.indexOf(MiniAdpter.window.wx.env.USER_DATA_PATH) == -1 && (url.indexOf("http://") != -1 || url.indexOf("https://") != -1)) {
	            if (MiniFileMgr.loadPath != "") {
	                url = url.split(MiniFileMgr.loadPath)[1];
	            }
	            else {
	                var tempStr = Laya.URL.rootPath != "" ? Laya.URL.rootPath : Laya.URL._basePath;
	                var tempUrl = url;
	                if (tempStr != "")
	                    url = url.split(tempStr)[1];
	                if (!url) {
	                    url = tempUrl;
	                }
	            }
	        }
	        if (MiniAdpter.subNativeFiles && MiniAdpter.subNativeheads.length == 0) {
	            for (var key in MiniAdpter.subNativeFiles) {
	                var tempArr = MiniAdpter.subNativeFiles[key];
	                MiniAdpter.subNativeheads = MiniAdpter.subNativeheads.concat(tempArr);
	                for (var aa = 0; aa < tempArr.length; aa++) {
	                    MiniAdpter.subMaps[tempArr[aa]] = key + "/" + tempArr[aa];
	                }
	            }
	        }
	        if (MiniAdpter.subNativeFiles && url.indexOf("/") != -1) {
	            var curfileHead = url.split("/")[0] + "/";
	            if (curfileHead && MiniAdpter.subNativeheads.indexOf(curfileHead) != -1) {
	                var newfileHead = MiniAdpter.subMaps[curfileHead];
	                url = url.replace(curfileHead, newfileHead);
	            }
	        }
	        switch (type) {
	            case Laya.Loader.IMAGE:
	            case "htmlimage":
	            case "nativeimage":
	                MiniLoader._transformImgUrl(url, type, thisLoader);
	                break;
	            case Laya.Loader.SOUND:
	                thisLoader._loadSound(url);
	                break;
	            default:
	                thisLoader._loadResource(type, url);
	        }
	    }
	    _loadSound(url) {
	        var thisLoader = this;
	        var fileNativeUrl;
	        if (MiniFileMgr.isLocalNativeFile(url)) {
	            var tempStr = Laya.URL.rootPath != "" ? Laya.URL.rootPath : Laya.URL._basePath;
	            var tempUrl = url;
	            if (tempStr != "" && (url.indexOf("http://") != -1 || url.indexOf("https://") != -1))
	                fileNativeUrl = url.split(tempStr)[1];
	            if (!fileNativeUrl) {
	                fileNativeUrl = tempUrl;
	            }
	            MiniLoader.onDownLoadCallBack(url, thisLoader, 0);
	        }
	        else {
	            var tempurl = Laya.URL.formatURL(url);
	            if (!MiniFileMgr.isLocalNativeFile(url) && (tempurl.indexOf("http://") == -1 && tempurl.indexOf("https://") == -1) || (tempurl.indexOf(MiniAdpter.window.wx.env.USER_DATA_PATH) != -1)) {
	                MiniLoader.onDownLoadCallBack(url, thisLoader, 0);
	            }
	            else {
	                MiniFileMgr.downOtherFiles(encodeURI(tempurl), Laya.Handler.create(MiniLoader, MiniLoader.onDownLoadCallBack, [tempurl, thisLoader]), tempurl);
	            }
	        }
	    }
	    static onDownLoadCallBack(sourceUrl, thisLoader, errorCode, tempFilePath = null) {
	        if (!errorCode) {
	            var fileNativeUrl;
	            if (MiniAdpter.autoCacheFile) {
	                if (!tempFilePath) {
	                    if (MiniFileMgr.isLocalNativeFile(sourceUrl)) {
	                        var tempStr = Laya.URL.rootPath != "" ? Laya.URL.rootPath : Laya.URL._basePath;
	                        var tempUrl = sourceUrl;
	                        if (tempStr != "" && (sourceUrl.indexOf("http://") != -1 || sourceUrl.indexOf("https://") != -1))
	                            fileNativeUrl = sourceUrl.split(tempStr)[1];
	                        if (!fileNativeUrl) {
	                            fileNativeUrl = tempUrl;
	                        }
	                    }
	                    else {
	                        var fileObj = MiniFileMgr.getFileInfo(sourceUrl);
	                        if (fileObj && fileObj.md5) {
	                            var fileMd5Name = fileObj.md5;
	                            fileNativeUrl = MiniFileMgr.getFileNativePath(fileMd5Name);
	                        }
	                        else {
	                            fileNativeUrl = sourceUrl;
	                        }
	                    }
	                }
	                else {
	                    fileNativeUrl = tempFilePath;
	                }
	            }
	            sourceUrl = fileNativeUrl;
	            var sound = (new Laya.SoundManager._soundClass());
	            sound.load(sourceUrl);
	            thisLoader.onLoaded(sound);
	        }
	        else {
	            thisLoader.event(Laya.Event.ERROR, "Load sound failed");
	        }
	    }
	    static bindToThis(fun, scope) {
	        var rst = fun;
	        rst = fun.bind(scope);
	        return rst;
	    }
	    _loadHttpRequestWhat(url, contentType) {
	        var thisLoader = this;
	        var encoding = MiniAdpter.getUrlEncode(url, contentType);
	        if (Laya.Loader.preLoadedMap[url])
	            thisLoader.onLoaded(Laya.Loader.preLoadedMap[url]);
	        else {
	            var tempurl = Laya.URL.formatURL(url);
	            if (!MiniFileMgr.isLocalNativeFile(url) && !MiniFileMgr.getFileInfo(tempurl) && url.indexOf(MiniAdpter.window.wx.env.USER_DATA_PATH) == -1 && (tempurl.indexOf("http://") != -1 || tempurl.indexOf("https://") != -1) && !MiniAdpter.AutoCacheDownFile) {
	                thisLoader._loadHttpRequest(tempurl, contentType, thisLoader, thisLoader.onLoaded, thisLoader, thisLoader.onProgress, thisLoader, thisLoader.onError);
	            }
	            else {
	                var fileObj = MiniFileMgr.getFileInfo(Laya.URL.formatURL(url));
	                if (fileObj) {
	                    fileObj.encoding = fileObj.encoding == null ? "utf8" : fileObj.encoding;
	                    MiniFileMgr.readFile(MiniFileMgr.getFileNativePath(fileObj.md5), encoding, new Laya.Handler(MiniLoader, MiniLoader.onReadNativeCallBack, [url, contentType, thisLoader]), url);
	                }
	                else if (thisLoader.type == "image" || thisLoader.type == "htmlimage") {
	                    thisLoader._transformUrl(url, contentType);
	                }
	                else {
	                    if (contentType != Laya.Loader.IMAGE && ((tempurl.indexOf("http://") == -1 && tempurl.indexOf("https://") == -1) || MiniFileMgr.isLocalNativeFile(url))) {
	                        MiniFileMgr.readFile(url, encoding, new Laya.Handler(MiniLoader, MiniLoader.onReadNativeCallBack, [url, contentType, thisLoader]), url);
	                    }
	                    else {
	                        MiniFileMgr.downFiles(tempurl, encoding, new Laya.Handler(MiniLoader, MiniLoader.onReadNativeCallBack, [url, contentType, thisLoader]), tempurl, true);
	                    }
	                }
	            }
	        }
	    }
	    static onReadNativeCallBack(url, type = null, thisLoader = null, errorCode = 0, data = null) {
	        if (!errorCode) {
	            var tempData;
	            if (type == Laya.Loader.JSON || type == Laya.Loader.ATLAS || type == Laya.Loader.PREFAB || type == Laya.Loader.PLF) {
	                tempData = MiniAdpter.getJson(data.data);
	            }
	            else if (type == Laya.Loader.XML) {
	                tempData = Laya.Utils.parseXMLFromString(data.data);
	            }
	            else {
	                tempData = data.data;
	            }
	            if (!MiniAdpter.isZiYu && MiniAdpter.isPosMsgYu && type != Laya.Loader.BUFFER) {
	                MiniAdpter.window.wx.postMessage({ url: url, data: tempData, isLoad: "filedata" });
	            }
	            thisLoader.onLoaded(tempData);
	        }
	        else if (errorCode == 1) {
	            thisLoader._loadHttpRequest(url, type, thisLoader, thisLoader.onLoaded, thisLoader, thisLoader.onProgress, thisLoader, thisLoader.onError);
	        }
	    }
	    static _transformImgUrl(url, type, thisLoader) {
	        if (MiniAdpter.isZiYu) {
	            thisLoader._loadImage(url, false);
	            return;
	        }
	        if (MiniFileMgr.isLocalNativeFile(url)) {
	            thisLoader._loadImage(url, false);
	            return;
	        }
	        if (!MiniFileMgr.isLocalNativeFile(url) && !MiniFileMgr.getFileInfo(Laya.URL.formatURL(url))) {
	            var tempUrl = Laya.URL.formatURL(url);
	            if (url.indexOf(MiniAdpter.window.wx.env.USER_DATA_PATH) == -1 && (tempUrl.indexOf("http://") != -1 || tempUrl.indexOf("https://") != -1)) {
	                if (MiniAdpter.isZiYu) {
	                    thisLoader._loadImage(url);
	                }
	                else {
	                    MiniFileMgr.downOtherFiles(tempUrl, new Laya.Handler(MiniLoader, MiniLoader.onDownImgCallBack, [url, thisLoader]), tempUrl);
	                }
	            }
	            else
	                thisLoader._loadImage(url);
	        }
	        else {
	            MiniLoader.onCreateImage(url, thisLoader);
	        }
	    }
	    static onDownImgCallBack(sourceUrl, thisLoader, errorCode, tempFilePath = "") {
	        if (!errorCode)
	            MiniLoader.onCreateImage(sourceUrl, thisLoader, false, tempFilePath);
	        else {
	            thisLoader.onError(null);
	        }
	    }
	    static onCreateImage(sourceUrl, thisLoader, isLocal = false, tempFilePath = "") {
	        var fileNativeUrl;
	        if (MiniAdpter.autoCacheFile) {
	            if (!isLocal) {
	                if (tempFilePath != "") {
	                    fileNativeUrl = tempFilePath;
	                }
	                else {
	                    var fileObj = MiniFileMgr.getFileInfo(Laya.URL.formatURL(sourceUrl));
	                    var fileMd5Name = fileObj.md5;
	                    fileNativeUrl = MiniFileMgr.getFileNativePath(fileMd5Name);
	                }
	            }
	            else if (MiniAdpter.isZiYu) {
	                var tempUrl = Laya.URL.formatURL(sourceUrl);
	                if (MiniFileMgr.ziyuFileTextureData[tempUrl]) {
	                    fileNativeUrl = MiniFileMgr.ziyuFileTextureData[tempUrl];
	                }
	                else
	                    fileNativeUrl = sourceUrl;
	            }
	            else
	                fileNativeUrl = sourceUrl;
	        }
	        else {
	            if (!isLocal)
	                fileNativeUrl = tempFilePath;
	            else
	                fileNativeUrl = sourceUrl;
	        }
	        thisLoader._loadImage(fileNativeUrl, false);
	    }
	}

	class MiniLocalStorage {
	    constructor() {
	    }
	    static __init__() {
	        MiniLocalStorage.items = MiniLocalStorage;
	    }
	    static setItem(key, value) {
	        try {
	            MiniAdpter.window.wx.setStorageSync(key, value);
	        }
	        catch (error) {
	            MiniAdpter.window.wx.setStorage({
	                key: key,
	                data: value
	            });
	        }
	    }
	    static getItem(key) {
	        return MiniAdpter.window.wx.getStorageSync(key);
	    }
	    static setJSON(key, value) {
	        MiniLocalStorage.setItem(key, value);
	    }
	    static getJSON(key) {
	        return MiniLocalStorage.getItem(key);
	    }
	    static removeItem(key) {
	        MiniAdpter.window.wx.removeStorageSync(key);
	    }
	    static clear() {
	        MiniAdpter.window.wx.clearStorageSync();
	    }
	    static getStorageInfoSync() {
	        try {
	            var res = MiniAdpter.window.wx.getStorageInfoSync();
	            console.log(res.keys);
	            console.log(res.currentSize);
	            console.log(res.limitSize);
	            return res;
	        }
	        catch (e) {
	        }
	        return null;
	    }
	}
	MiniLocalStorage.support = true;

	class MiniAdpter {
	    static getJson(data) {
	        return JSON.parse(data);
	    }
	    static enable() {
	        MiniAdpter.init(Laya.Laya.isWXPosMsg, Laya.Laya.isWXOpenDataContext);
	    }
	    static init(isPosMsg = false, isSon = false) {
	        if (MiniAdpter._inited)
	            return;
	        MiniAdpter._inited = true;
	        MiniAdpter.window = window;
	        if (!MiniAdpter.window.hasOwnProperty("wx"))
	            return;
	        if (MiniAdpter.window.navigator.userAgent.indexOf('MiniGame') < 0)
	            return;
	        MiniAdpter.isZiYu = isSon;
	        MiniAdpter.isPosMsgYu = isPosMsg;
	        MiniAdpter.EnvConfig = {};
	        if (!MiniAdpter.isZiYu) {
	            MiniFileMgr.setNativeFileDir("/layaairGame");
	            MiniFileMgr.existDir(MiniFileMgr.fileNativeDir, Laya.Handler.create(MiniAdpter, MiniAdpter.onMkdirCallBack));
	        }
	        MiniAdpter.systemInfo = MiniAdpter.window.wx.getSystemInfoSync();
	        MiniAdpter.window.focus = function () {
	        };
	        Laya.Laya['_getUrlPath'] = function () {
	            return "";
	        };
	        MiniAdpter.window.logtime = function (str) {
	        };
	        MiniAdpter.window.alertTimeLog = function (str) {
	        };
	        MiniAdpter.window.resetShareInfo = function () {
	        };
	        MiniAdpter.window.CanvasRenderingContext2D = function () {
	        };
	        MiniAdpter.window.CanvasRenderingContext2D.prototype = MiniAdpter.window.wx.createCanvas().getContext('2d').__proto__;
	        MiniAdpter.window.document.body.appendChild = function () {
	        };
	        MiniAdpter.EnvConfig.pixelRatioInt = 0;
	        Laya.Browser["_pixelRatio"] = MiniAdpter.pixelRatio();
	        MiniAdpter._preCreateElement = Laya.Browser.createElement;
	        Laya.Browser["createElement"] = MiniAdpter.createElement;
	        Laya.RunDriver.createShaderCondition = MiniAdpter.createShaderCondition;
	        Laya.Utils['parseXMLFromString'] = MiniAdpter.parseXMLFromString;
	        Laya.Input['_createInputElement'] = MiniInput['_createInputElement'];
	        Laya.Loader.prototype._loadResourceFilter = MiniLoader.prototype._loadResourceFilter;
	        Laya.Loader.prototype._loadSound = MiniLoader.prototype._loadSound;
	        Laya.Loader.prototype._loadHttpRequestWhat = MiniLoader.prototype._loadHttpRequestWhat;
	        Laya.LocalStorage._baseClass = MiniLocalStorage;
	        MiniLocalStorage.__init__();
	        MiniAdpter.window.wx.onMessage && MiniAdpter.window.wx.onMessage(MiniAdpter._onMessage);
	    }
	    static _onMessage(data) {
	        switch (data.type) {
	            case "changeMatrix":
	                Laya.Laya.stage.transform.identity();
	                Laya.Laya.stage._width = data.w;
	                Laya.Laya.stage._height = data.h;
	                Laya.Laya.stage._canvasTransform = new Laya.Matrix(data.a, data.b, data.c, data.d, data.tx, data.ty);
	                break;
	            case "display":
	                Laya.Laya.stage.frameRate = data.rate || Laya.Stage.FRAME_FAST;
	                break;
	            case "undisplay":
	                Laya.Laya.stage.frameRate = Laya.Stage.FRAME_SLEEP;
	                break;
	        }
	        if (data['isLoad'] == "opendatacontext") {
	            if (data.url) {
	                MiniFileMgr.ziyuFileData[data.url] = data.atlasdata;
	                MiniFileMgr.ziyuFileTextureData[data.imgReadyUrl] = data.imgNativeUrl;
	            }
	        }
	        else if (data['isLoad'] == "openJsondatacontext") {
	            if (data.url) {
	                MiniFileMgr.ziyuFileData[data.url] = data.atlasdata;
	            }
	        }
	        else if (data['isLoad'] == "openJsondatacontextPic") {
	            MiniFileMgr.ziyuFileTextureData[data.imgReadyUrl] = data.imgNativeUrl;
	        }
	    }
	    static getUrlEncode(url, type) {
	        if (type == "arraybuffer")
	            return "";
	        return "utf8";
	    }
	    static downLoadFile(fileUrl, fileType = "", callBack = null, encoding = "utf8") {
	        var fileObj = MiniFileMgr.getFileInfo(fileUrl);
	        if (!fileObj)
	            MiniFileMgr.downLoadFile(fileUrl, fileType, callBack, encoding);
	        else {
	            callBack != null && callBack.runWith([0]);
	        }
	    }
	    static remove(fileUrl, callBack = null) {
	        MiniFileMgr.deleteFile("", fileUrl, callBack, "", 0);
	    }
	    static removeAll() {
	        MiniFileMgr.deleteAll();
	    }
	    static hasNativeFile(fileUrl) {
	        return MiniFileMgr.isLocalNativeFile(fileUrl);
	    }
	    static getFileInfo(fileUrl) {
	        return MiniFileMgr.getFileInfo(fileUrl);
	    }
	    static getFileList() {
	        return MiniFileMgr.filesListObj;
	    }
	    static exitMiniProgram() {
	        MiniAdpter.window["wx"].exitMiniProgram();
	    }
	    static onMkdirCallBack(errorCode, data) {
	        if (!errorCode) {
	            MiniFileMgr.filesListObj = JSON.parse(data.data);
	            MiniFileMgr.fakeObj = MiniFileMgr.filesListObj || {};
	        }
	        else {
	            MiniFileMgr.fakeObj = MiniFileMgr.filesListObj = {};
	        }
	        MiniFileMgr.fs.readdir({
	            dirPath: MiniFileMgr.fileNativeDir,
	            success: function (data) {
	                var tempMd5ListObj = {};
	                var fileObj;
	                for (let key in MiniFileMgr.filesListObj) {
	                    if (key != "fileUsedSize") {
	                        fileObj = MiniFileMgr.filesListObj[key];
	                        tempMd5ListObj[fileObj.md5] = true;
	                    }
	                }
	                var files = data.files;
	                var fileName;
	                for (let i = 0, sz = files.length; i < sz; i++) {
	                    fileName = files[i];
	                    if (fileName == MiniFileMgr.fileListName)
	                        continue;
	                    var deleteFileUrl = MiniFileMgr.getFileNativePath(fileName);
	                    if (tempMd5ListObj[deleteFileUrl])
	                        continue;
	                    if (tempMd5ListObj[fileName])
	                        continue;
	                    MiniFileMgr.fs.unlink({
	                        filePath: deleteFileUrl,
	                        success: function (data) {
	                            console.log("删除无引用的磁盘文件:" + fileName);
	                        }
	                    });
	                }
	            }
	        });
	    }
	    static pixelRatio() {
	        if (!MiniAdpter.EnvConfig.pixelRatioInt) {
	            try {
	                MiniAdpter.EnvConfig.pixelRatioInt = MiniAdpter.systemInfo.pixelRatio;
	                return MiniAdpter.systemInfo.pixelRatio;
	            }
	            catch (error) {
	            }
	        }
	        return MiniAdpter.EnvConfig.pixelRatioInt;
	    }
	    static createElement(type) {
	        if (type == "canvas") {
	            var _source;
	            if (MiniAdpter.idx == 1) {
	                if (MiniAdpter.isZiYu) {
	                    _source = MiniAdpter.window.sharedCanvas;
	                    _source.style = {};
	                }
	                else {
	                    _source = MiniAdpter.window.canvas;
	                }
	            }
	            else {
	                _source = MiniAdpter.window.wx.createCanvas();
	            }
	            MiniAdpter.idx++;
	            return _source;
	        }
	        else if (type == "textarea" || type == "input") {
	            return MiniAdpter.onCreateInput(type);
	        }
	        else if (type == "div") {
	            var node = MiniAdpter._preCreateElement(type);
	            node.contains = function (value) {
	                return null;
	            };
	            node.removeChild = function (value) {
	            };
	            return node;
	        }
	        else {
	            return MiniAdpter._preCreateElement(type);
	        }
	    }
	    static onCreateInput(type) {
	        var node = MiniAdpter._preCreateElement(type);
	        node.focus = MiniInput.wxinputFocus;
	        node.blur = MiniInput.wxinputblur;
	        node.style = {};
	        node.value = 0;
	        node.parentElement = {};
	        node.placeholder = {};
	        node.type = {};
	        node.setColor = function (value) {
	        };
	        node.setType = function (value) {
	        };
	        node.setFontFace = function (value) {
	        };
	        node.addEventListener = function (value) {
	        };
	        node.contains = function (value) {
	            return null;
	        };
	        node.removeChild = function (value) {
	        };
	        return node;
	    }
	    static createShaderCondition(conditionScript) {
	        var func = function () {
	            return this[conditionScript.replace("this.", "")];
	        };
	        return func;
	    }
	    static sendAtlasToOpenDataContext(url) {
	        if (!MiniAdpter.isZiYu) {
	            var atlasJson = Laya.Loader.getRes(Laya.URL.formatURL(url));
	            if (atlasJson) {
	                var textureArr = atlasJson.meta.image.split(",");
	                if (atlasJson.meta && atlasJson.meta.image) {
	                    var toloadPics = atlasJson.meta.image.split(",");
	                    var split = url.indexOf("/") >= 0 ? "/" : "\\";
	                    var idx = url.lastIndexOf(split);
	                    var folderPath = idx >= 0 ? url.substr(0, idx + 1) : "";
	                    for (var i = 0, len = toloadPics.length; i < len; i++) {
	                        toloadPics[i] = folderPath + toloadPics[i];
	                    }
	                }
	                else {
	                    toloadPics = [url.replace(".json", ".png")];
	                }
	                for (i = 0; i < toloadPics.length; i++) {
	                    var tempAtlasPngUrl = toloadPics[i];
	                    MiniAdpter.postInfoToContext(Laya.Laya.URL.formatURL(url), Laya.Laya.URL.formatURL(tempAtlasPngUrl), atlasJson);
	                }
	            }
	            else {
	                throw "传递的url没有获取到对应的图集数据信息，请确保图集已经过！";
	            }
	        }
	    }
	    static postInfoToContext(url, atlaspngUrl, atlasJson) {
	        var postData = { "frames": atlasJson.frames, "meta": atlasJson.meta };
	        var textureUrl = atlaspngUrl;
	        var fileObj = MiniFileMgr.getFileInfo(Laya.URL.formatURL(atlaspngUrl));
	        if (fileObj) {
	            var fileMd5Name = fileObj.md5;
	            var fileNativeUrl = MiniFileMgr.getFileNativePath(fileMd5Name);
	        }
	        else {
	            fileNativeUrl = textureUrl;
	        }
	        if (fileNativeUrl) {
	            MiniAdpter.window.wx.postMessage({ url: url, atlasdata: postData, imgNativeUrl: fileNativeUrl, imgReadyUrl: textureUrl, isLoad: "opendatacontext" });
	        }
	        else {
	            throw "获取图集的磁盘url路径不存在！";
	        }
	    }
	    static sendSinglePicToOpenDataContext(url) {
	        var tempTextureUrl = Laya.URL.formatURL(url);
	        var fileObj = MiniFileMgr.getFileInfo(tempTextureUrl);
	        if (fileObj) {
	            var fileMd5Name = fileObj.md5;
	            var fileNativeUrl = MiniFileMgr.getFileNativePath(fileMd5Name);
	            url = tempTextureUrl;
	        }
	        else {
	            fileNativeUrl = url;
	        }
	        if (fileNativeUrl) {
	            url = Laya.Laya.URL.formatURL(url);
	            MiniAdpter.window.wx.postMessage({ url: url, imgNativeUrl: fileNativeUrl, imgReadyUrl: url, isLoad: "openJsondatacontextPic" });
	        }
	        else {
	            throw "获取图集的磁盘url路径不存在！";
	        }
	    }
	    static sendJsonDataToDataContext(url) {
	        if (!MiniAdpter.isZiYu) {
	            url = Laya.Laya.URL.formatURL(url);
	            var atlasJson = Laya.Loader.getRes(url);
	            if (atlasJson) {
	                MiniAdpter.window.wx.postMessage({ url: url, atlasdata: atlasJson, isLoad: "openJsondatacontext" });
	            }
	            else {
	                throw "传递的url没有获取到对应的图集数据信息，请确保图集已经过！";
	            }
	        }
	    }
	}
	MiniAdpter._inited = false;
	MiniAdpter.autoCacheFile = true;
	MiniAdpter.minClearSize = (5 * 1024 * 1024);
	MiniAdpter.nativefiles = ["layaNativeDir", "wxlocal"];
	MiniAdpter.subNativeFiles = [];
	MiniAdpter.subNativeheads = [];
	MiniAdpter.subMaps = [];
	MiniAdpter.AutoCacheDownFile = false;
	MiniAdpter.parseXMLFromString = function (value) {
	    var rst;
	    value = value.replace(/>\s+</g, '><');
	    try {
	        rst = (new MiniAdpter.window.Parser.DOMParser()).parseFromString(value, 'text/xml');
	    }
	    catch (error) {
	        throw "需要引入xml解析库文件";
	    }
	    return rst;
	};
	MiniAdpter.idx = 1;

	class MiniAccelerator extends Laya.EventDispatcher {
	    constructor() {
	        super();
	    }
	    static __init__() {
	        try {
	            var Acc;
	            Acc = Laya.Accelerator;
	            if (!Acc)
	                return;
	            Acc["prototype"]["on"] = MiniAccelerator["prototype"]["on"];
	            Acc["prototype"]["off"] = MiniAccelerator["prototype"]["off"];
	        }
	        catch (e) {
	        }
	    }
	    static startListen(callBack) {
	        MiniAccelerator._callBack = callBack;
	        if (MiniAccelerator._isListening)
	            return;
	        MiniAccelerator._isListening = true;
	        try {
	            MiniAdpter.window.wx.onAccelerometerChange(MiniAccelerator.onAccelerometerChange);
	        }
	        catch (e) { }
	    }
	    static stopListen() {
	        MiniAccelerator._isListening = false;
	        try {
	            MiniAdpter.window.wx.stopAccelerometer({});
	        }
	        catch (e) { }
	    }
	    static onAccelerometerChange(res) {
	        var e;
	        e = {};
	        e.acceleration = res;
	        e.accelerationIncludingGravity = res;
	        e.rotationRate = {};
	        if (MiniAccelerator._callBack != null) {
	            MiniAccelerator._callBack(e);
	        }
	    }
	    on(type, caller, listener, args = null) {
	        super.on(type, caller, listener, args);
	        MiniAccelerator.startListen(this["onDeviceOrientationChange"]);
	        return this;
	    }
	    off(type, caller, listener, onceOnly = false) {
	        if (!this.hasListener(type))
	            MiniAccelerator.stopListen();
	        return super.off(type, caller, listener, onceOnly);
	    }
	}
	MiniAccelerator._isListening = false;

	class MiniImage {
	    _loadImage(url) {
	        var thisLoader = this;
	        if (MiniAdpter.isZiYu) {
	            MiniImage.onCreateImage(url, thisLoader, true);
	            return;
	        }
	        var isTransformUrl;
	        if (!MiniFileMgr.isLocalNativeFile(url)) {
	            isTransformUrl = true;
	            url = Laya.URL.formatURL(url);
	        }
	        else {
	            if (url.indexOf(MiniAdpter.window.wx.env.USER_DATA_PATH) == -1 && (url.indexOf("http://") != -1 || url.indexOf("https://") != -1)) {
	                if (MiniFileMgr.loadPath != "") {
	                    url = url.split(MiniFileMgr.loadPath)[1];
	                }
	                else {
	                    var tempStr = Laya.URL.rootPath != "" ? Laya.URL.rootPath : Laya.URL._basePath;
	                    var tempUrl = url;
	                    if (tempStr != "")
	                        url = url.split(tempStr)[1];
	                    if (!url) {
	                        url = tempUrl;
	                    }
	                }
	            }
	            if (MiniAdpter.subNativeFiles && MiniAdpter.subNativeheads.length == 0) {
	                for (var key in MiniAdpter.subNativeFiles) {
	                    var tempArr = MiniAdpter.subNativeFiles[key];
	                    MiniAdpter.subNativeheads = MiniAdpter.subNativeheads.concat(tempArr);
	                    for (var aa = 0; aa < tempArr.length; aa++) {
	                        MiniAdpter.subMaps[tempArr[aa]] = key + "/" + tempArr[aa];
	                    }
	                }
	            }
	            if (MiniAdpter.subNativeFiles && url.indexOf("/") != -1) {
	                var curfileHead = url.split("/")[0] + "/";
	                if (curfileHead && MiniAdpter.subNativeheads.indexOf(curfileHead) != -1) {
	                    var newfileHead = MiniAdpter.subMaps[curfileHead];
	                    url = url.replace(curfileHead, newfileHead);
	                }
	            }
	        }
	        if (!MiniFileMgr.getFileInfo(url)) {
	            if (url.indexOf(MiniAdpter.window.wx.env.USER_DATA_PATH) == -1 && (url.indexOf("http://") != -1 || url.indexOf("https://") != -1)) {
	                if (MiniAdpter.isZiYu) {
	                    MiniImage.onCreateImage(url, thisLoader, true);
	                }
	                else {
	                    MiniFileMgr.downOtherFiles(url, new Laya.Handler(MiniImage, MiniImage.onDownImgCallBack, [url, thisLoader]), url);
	                }
	            }
	            else
	                MiniImage.onCreateImage(url, thisLoader, true);
	        }
	        else {
	            MiniImage.onCreateImage(url, thisLoader, !isTransformUrl);
	        }
	    }
	    static onDownImgCallBack(sourceUrl, thisLoader, errorCode, tempFilePath = "") {
	        if (!errorCode)
	            MiniImage.onCreateImage(sourceUrl, thisLoader, false, tempFilePath);
	        else {
	            thisLoader.onError(null);
	        }
	    }
	    static onCreateImage(sourceUrl, thisLoader, isLocal = false, tempFilePath = "") {
	        var fileNativeUrl;
	        if (MiniAdpter.autoCacheFile) {
	            if (!isLocal) {
	                if (tempFilePath != "") {
	                    fileNativeUrl = tempFilePath;
	                }
	                else {
	                    var fileObj = MiniFileMgr.getFileInfo(sourceUrl);
	                    var fileMd5Name = fileObj.md5;
	                    fileNativeUrl = MiniFileMgr.getFileNativePath(fileMd5Name);
	                }
	            }
	            else if (MiniAdpter.isZiYu) {
	                var tempUrl = Laya.URL.formatURL(sourceUrl);
	                if (MiniFileMgr.ziyuFileTextureData[tempUrl]) {
	                    fileNativeUrl = MiniFileMgr.ziyuFileTextureData[tempUrl];
	                }
	                else
	                    fileNativeUrl = sourceUrl;
	            }
	            else
	                fileNativeUrl = sourceUrl;
	        }
	        else {
	            if (!isLocal)
	                fileNativeUrl = tempFilePath;
	            else
	                fileNativeUrl = sourceUrl;
	        }
	        if (thisLoader._imgCache == null)
	            thisLoader._imgCache = {};
	        var image;
	        function clear() {
	            var img = thisLoader._imgCache[fileNativeUrl];
	            if (img) {
	                img.onload = null;
	                img.onerror = null;
	                delete thisLoader._imgCache[fileNativeUrl];
	            }
	        }
	        var onerror = function () {
	            clear();
	            delete MiniFileMgr.fakeObj[sourceUrl];
	            delete MiniFileMgr.filesListObj[sourceUrl];
	            thisLoader.event(Laya.Event.ERROR, "Load image failed");
	        };
	        if (thisLoader._type == "nativeimage") {
	            var onload = function () {
	                clear();
	                thisLoader.onLoaded(image);
	            };
	            image = new Laya.Browser.window.Image();
	            image.crossOrigin = "";
	            image.onload = onload;
	            image.onerror = onerror;
	            image.src = fileNativeUrl;
	            thisLoader._imgCache[fileNativeUrl] = image;
	        }
	        else {
	            var imageSource = new Laya.Browser.window.Image();
	            onload = function () {
	                image = Laya.HTMLImage.create(imageSource.width, imageSource.height);
	                image.loadImageSource(imageSource, true);
	                image._setCreateURL(fileNativeUrl);
	                clear();
	                thisLoader.onLoaded(image);
	            };
	            imageSource.crossOrigin = "";
	            imageSource.onload = onload;
	            imageSource.onerror = onerror;
	            imageSource.src = fileNativeUrl;
	            thisLoader._imgCache[fileNativeUrl] = imageSource;
	        }
	    }
	}

	class MiniLocation {
	    constructor() {
	    }
	    static __init__() {
	        MiniAdpter.window.navigator.geolocation.getCurrentPosition = MiniLocation.getCurrentPosition;
	        MiniAdpter.window.navigator.geolocation.watchPosition = MiniLocation.watchPosition;
	        MiniAdpter.window.navigator.geolocation.clearWatch = MiniLocation.clearWatch;
	    }
	    static getCurrentPosition(success = null, error = null, options = null) {
	        var paramO;
	        paramO = {};
	        paramO.success = getSuccess;
	        paramO.fail = error;
	        MiniAdpter.window.wx.getLocation(paramO);
	        function getSuccess(res) {
	            if (success != null) {
	                success(res);
	            }
	        }
	    }
	    static watchPosition(success = null, error = null, options = null) {
	        MiniLocation._curID++;
	        var curWatchO;
	        curWatchO = {};
	        curWatchO.success = success;
	        curWatchO.error = error;
	        MiniLocation._watchDic[MiniLocation._curID] = curWatchO;
	        Laya.Laya.systemTimer.loop(1000, null, MiniLocation._myLoop);
	        return MiniLocation._curID;
	    }
	    static clearWatch(id) {
	        delete MiniLocation._watchDic[id];
	        if (!MiniLocation._hasWatch()) {
	            Laya.Laya.systemTimer.clear(null, MiniLocation._myLoop);
	        }
	    }
	    static _hasWatch() {
	        var key;
	        for (key in MiniLocation._watchDic) {
	            if (MiniLocation._watchDic[key])
	                return true;
	        }
	        return false;
	    }
	    static _myLoop() {
	        MiniLocation.getCurrentPosition(MiniLocation._mySuccess, MiniLocation._myError);
	    }
	    static _mySuccess(res) {
	        var rst = {};
	        rst.coords = res;
	        rst.timestamp = Laya.Browser.now();
	        var key;
	        for (key in MiniLocation._watchDic) {
	            if (MiniLocation._watchDic[key].success) {
	                MiniLocation._watchDic[key].success(rst);
	            }
	        }
	    }
	    static _myError(res) {
	        var key;
	        for (key in MiniLocation._watchDic) {
	            if (MiniLocation._watchDic[key].error) {
	                MiniLocation._watchDic[key].error(res);
	            }
	        }
	    }
	}
	MiniLocation._watchDic = {};
	MiniLocation._curID = 0;

	class MiniVideo {
	    constructor(width = 320, height = 240) {
	        this.videoend = false;
	        this.videourl = "";
	        this.videoElement = MiniAdpter.window.wx.createVideo({ width: width, height: height, autoplay: true });
	    }
	    static __init__() {
	    }
	    on(eventType, ths, callBack) {
	        if (eventType == "loadedmetadata") {
	            this.onPlayFunc = callBack.bind(ths);
	            this.videoElement.onPlay = this.onPlayFunction.bind(this);
	        }
	        else if (eventType == "ended") {
	            this.onEndedFunC = callBack.bind(ths);
	            this.videoElement.onEnded = this.onEndedFunction.bind(this);
	        }
	        this.videoElement.onTimeUpdate = this.onTimeUpdateFunc.bind(this);
	    }
	    onTimeUpdateFunc(data) {
	        this.position = data.position;
	        this._duration = data.duration;
	    }
	    get duration() {
	        return this._duration;
	    }
	    onPlayFunction() {
	        if (this.videoElement)
	            this.videoElement.readyState = 200;
	        console.log("=====视频加载完成========");
	        this.onPlayFunc != null && this.onPlayFunc();
	    }
	    onEndedFunction() {
	        if (!this.videoElement)
	            return;
	        this.videoend = true;
	        console.log("=====视频播放完毕========");
	        this.onEndedFunC != null && this.onEndedFunC();
	    }
	    off(eventType, ths, callBack) {
	        if (eventType == "loadedmetadata") {
	            this.onPlayFunc = callBack.bind(ths);
	            this.videoElement.offPlay = this.onPlayFunction.bind(this);
	        }
	        else if (eventType == "ended") {
	            this.onEndedFunC = callBack.bind(ths);
	            this.videoElement.offEnded = this.onEndedFunction.bind(this);
	        }
	    }
	    load(url) {
	        if (!this.videoElement)
	            return;
	        this.videoElement.src = url;
	    }
	    play() {
	        if (!this.videoElement)
	            return;
	        this.videoend = false;
	        this.videoElement.play();
	    }
	    pause() {
	        if (!this.videoElement)
	            return;
	        this.videoend = true;
	        this.videoElement.pause();
	    }
	    get currentTime() {
	        if (!this.videoElement)
	            return 0;
	        return this.videoElement.initialTime;
	    }
	    set currentTime(value) {
	        if (!this.videoElement)
	            return;
	        this.videoElement.initialTime = value;
	    }
	    get videoWidth() {
	        if (!this.videoElement)
	            return 0;
	        return this.videoElement.width;
	    }
	    get videoHeight() {
	        if (!this.videoElement)
	            return 0;
	        return this.videoElement.height;
	    }
	    get ended() {
	        return this.videoend;
	    }
	    get loop() {
	        if (!this.videoElement)
	            return false;
	        return this.videoElement.loop;
	    }
	    set loop(value) {
	        if (!this.videoElement)
	            return;
	        this.videoElement.loop = value;
	    }
	    get playbackRate() {
	        if (!this.videoElement)
	            return 0;
	        return this.videoElement.playbackRate;
	    }
	    set playbackRate(value) {
	        if (!this.videoElement)
	            return;
	        this.videoElement.playbackRate = value;
	    }
	    get muted() {
	        if (!this.videoElement)
	            return false;
	        return this.videoElement.muted;
	    }
	    set muted(value) {
	        if (!this.videoElement)
	            return;
	        this.videoElement.muted = value;
	    }
	    get paused() {
	        if (!this.videoElement)
	            return false;
	        return this.videoElement.paused;
	    }
	    size(width, height) {
	        if (!this.videoElement)
	            return;
	        this.videoElement.width = width;
	        this.videoElement.height = height;
	    }
	    get x() {
	        if (!this.videoElement)
	            return 0;
	        return this.videoElement.x;
	    }
	    set x(value) {
	        if (!this.videoElement)
	            return;
	        this.videoElement.x = value;
	    }
	    get y() {
	        if (!this.videoElement)
	            return 0;
	        return this.videoElement.y;
	    }
	    set y(value) {
	        if (!this.videoElement)
	            return;
	        this.videoElement.y = value;
	    }
	    get currentSrc() {
	        return this.videoElement.src;
	    }
	    destroy() {
	        if (this.videoElement)
	            this.videoElement.destroy();
	        this.videoElement = null;
	        this.onEndedFunC = null;
	        this.onPlayFunc = null;
	        this.videoend = false;
	        this.videourl = null;
	    }
	    reload() {
	        if (!this.videoElement)
	            return;
	        this.videoElement.src = this.videourl;
	    }
	}

	exports.MiniAccelerator = MiniAccelerator;
	exports.MiniAdpter = MiniAdpter;
	exports.MiniFileMgr = MiniFileMgr;
	exports.MiniImage = MiniImage;
	exports.MiniInput = MiniInput;
	exports.MiniLoader = MiniLoader;
	exports.MiniLocalStorage = MiniLocalStorage;
	exports.MiniLocation = MiniLocation;
	exports.MiniSound = MiniSound;
	exports.MiniSoundChannel = MiniSoundChannel;
	exports.MiniVideo = MiniVideo;

} 
