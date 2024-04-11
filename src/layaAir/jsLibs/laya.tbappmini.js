window.tbMiniGame = function (exports, Laya) {
    'use strict';

    function ImageDataPolyfill() {
        let width, height, data;
        if (arguments.length == 3) {
            if (arguments[0] instanceof Uint8ClampedArray) {
                if (arguments[0].length % 4 !== 0) {
                    throw new Error("Failed to construct 'ImageData': The input data length is not a multiple of 4.");
                }
                if (arguments[0].length !== arguments[1] * arguments[2] * 4) {
                    throw new Error("Failed to construct 'ImageData': The input data length is not equal to (4 * width * height).");
                }
                else {
                    data = arguments[0];
                    width = arguments[1];
                    height = arguments[2];
                }
            }
            else {
                throw new Error("Failed to construct 'ImageData': parameter 1 is not of type 'Uint8ClampedArray'.");
            }
        }
        else if (arguments.length == 2) {
            width = arguments[0];
            height = arguments[1];
            data = new Uint8ClampedArray(arguments[0] * arguments[1] * 4);
        }
        else if (arguments.length < 2) {
            throw new Error("Failed to construct 'ImageData': 2 arguments required, but only " + arguments.length + " present.");
        }
        let imgdata = Laya.Browser.canvas.getContext("2d").getImageData(0, 0, width, height);
        for (let i = 0; i < data.length; i += 4) {
            imgdata.data[i] = data[i];
            imgdata.data[i + 1] = data[i + 1];
            imgdata.data[i + 2] = data[i + 2];
            imgdata.data[i + 3] = data[i + 3];
        }
        return imgdata;
    }

    class MiniFileMgr {
        static isLocalNativeFile(url) {
            for (var i = 0, sz = TBMiniAdapter.nativefiles.length; i < sz; i++) {
                if (url.indexOf(TBMiniAdapter.nativefiles[i]) != -1)
                    return true;
            }
            return false;
        }
        static isLocalNativeZipFile(url) {
            for (var i = 0, sz = TBMiniAdapter.nativezipfiles.length; i < sz; i++) {
                if (url.indexOf(TBMiniAdapter.nativezipfiles[i]) != -1)
                    return true;
            }
            return false;
        }
        static isSubNativeFile(url) {
            for (var i = 0, sz = TBMiniAdapter.subNativeheads.length; i < sz; i++) {
                if (url.indexOf(TBMiniAdapter.subNativeheads[i]) != -1)
                    return true;
            }
            return false;
        }
        static isNetFile(url) {
            return (url.indexOf("http://") != -1 || url.indexOf("https://") != -1) && url.indexOf(TBMiniAdapter.window.my.env.USER_DATA_PATH) == -1;
        }
        static getFileInfo(fileUrl) {
            var fileNativePath = fileUrl;
            var fileObj = MiniFileMgr.fakeObj[fileNativePath];
            if (fileObj == null)
                return null;
            else
                return fileObj;
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
                        MiniFileMgr.downFiles(TBMiniAdapter.safeEncodeURI(readyUrl), encoding, callBack, readyUrl, isSaveFile, fileType);
                    else
                        callBack != null && callBack.runWith([1]);
                } });
        }
        static isFile(url) {
            let stat;
            try {
                stat = MiniFileMgr.fs.statSync(url);
            }
            catch (err) {
                return false;
            }
            return stat.isFile();
        }
        static downFiles(fileUrl, encoding = "utf8", callBack = null, readyUrl = "", isSaveFile = false, fileType = "", isAutoClear = true) {
            var downloadTask = MiniFileMgr.wxdown({ url: fileUrl, success: function (data) {
                    if (!data.hasOwnProperty("statusCode")) {
                        data.statusCode = 200;
                    }
                    if (data.statusCode === 200)
                        MiniFileMgr.readFile(data.apFilePath, encoding, callBack, readyUrl, isSaveFile, fileType, isAutoClear);
                    else if (data.statusCode === 403) {
                        callBack != null && callBack.runWith([0, fileUrl]);
                    }
                    else {
                        callBack != null && callBack.runWith([1, data]);
                    }
                }, fail: function (data) {
                    console.log("downloadfile fail:", readyUrl, data);
                    callBack != null && callBack.runWith([1, data]);
                } });
            downloadTask.onProgressUpdate(function (data) {
                callBack != null && callBack.runWith([2, data.progress]);
            });
        }
        static readFile(filePath, encoding = "utf8", callBack = null, readyUrl = "", isSaveFile = false, fileType = "", isAutoClear = true) {
            filePath = Laya.URL.getAdptedFilePath(filePath);
            MiniFileMgr.fs.readFile({ filePath: filePath, encoding: encoding, success: function (data) {
                    if (filePath.indexOf(TBMiniAdapter.window.my.env.USER_DATA_PATH) && (filePath.indexOf("http://") != -1 || filePath.indexOf("https://") != -1)) {
                        if (isSaveFile) {
                            callBack != null && callBack.runWith([0, data]);
                            MiniFileMgr.copyTOCache(filePath, readyUrl, null, encoding, isAutoClear);
                        }
                        else
                            callBack != null && callBack.runWith([0, data]);
                    }
                    else {
                        callBack != null && callBack.runWith([0, data]);
                    }
                }, fail: function (data) {
                    if (data)
                        callBack != null && callBack.runWith([1, data]);
                } });
        }
        static downOtherFiles(fileUrl, callBack = null, readyUrl = "", isSaveFile = false, isAutoClear = true) {
            MiniFileMgr.wxdown({ url: fileUrl, success: function (data) {
                    if (!data.hasOwnProperty("statusCode"))
                        data.statusCode = 200;
                    if (data.statusCode === 200) {
                        if (isSaveFile && readyUrl.indexOf(".php") == -1) {
                            callBack != null && callBack.runWith([0, data.apFilePath]);
                            MiniFileMgr.copyTOCache(data.apFilePath, readyUrl, null, "", isAutoClear);
                        }
                        else
                            callBack != null && callBack.runWith([0, data.apFilePath]);
                    }
                    else {
                        callBack != null && callBack.runWith([1, data]);
                    }
                }, fail: function (data) {
                    console.log("downloadfile fail:", readyUrl, data);
                    callBack != null && callBack.runWith([1, data]);
                } });
        }
        static copyFile(src, dest, complete = null) {
            MiniFileMgr.fs.copyFile({
                srcPath: src,
                destPath: dest,
                success: function () {
                    complete && complete.runWith(0);
                },
                fail: function (err) {
                    complete && complete.runWith([1, err]);
                }
            });
        }
        static downLoadFile(fileUrl, fileType = "", callBack = null, encoding = "utf8", cacheFile = false) {
            if (window.navigator.userAgent.indexOf('AlipayMiniGame') < 0) {
                Laya.Laya.loader.load(fileUrl, callBack);
            }
            else {
                if (fileType == Laya.Loader.IMAGE || fileType == Laya.Loader.SOUND)
                    MiniFileMgr.downOtherFiles(TBMiniAdapter.safeEncodeURI(fileUrl), callBack, fileUrl, cacheFile, false);
                else
                    MiniFileMgr.downFiles(TBMiniAdapter.safeEncodeURI(fileUrl), encoding, callBack, fileUrl, true, fileType, cacheFile);
            }
        }
        static copyTOCache(tempFilePath, readyUrl, callBack, encoding = "", isAutoClear = true) {
            var temp = tempFilePath.split("/");
            var tempFileName = temp[temp.length - 1];
            var fileurlkey = readyUrl;
            var fileObj = MiniFileMgr.getFileInfo(readyUrl);
            var saveFilePath = MiniFileMgr.getFileNativePath(tempFileName);
            MiniFileMgr.fakeObj[fileurlkey] = { md5: tempFileName, readyUrl: readyUrl, size: 0, times: Laya.Browser.now(), encoding: encoding, tempFilePath: tempFilePath };
            var totalSize = TBMiniAdapter.sizeLimit;
            var chaSize = 4 * 1024 * 1024;
            var fileUseSize = MiniFileMgr.getCacheUseSize();
            if (fileObj) {
                if (fileObj.readyUrl != readyUrl) {
                    MiniFileMgr.fs.getFileInfo({
                        filePath: tempFilePath,
                        success: function (data) {
                            if ((isAutoClear && (fileUseSize + chaSize + data.size) >= totalSize)) {
                                if (data.size > TBMiniAdapter.minClearSize)
                                    TBMiniAdapter.minClearSize = data.size;
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
                            if (data.size > TBMiniAdapter.minClearSize)
                                TBMiniAdapter.minClearSize = data.size;
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
            var memSize = TBMiniAdapter.minClearSize;
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
            MiniFileMgr.fs.unlink({ filePath: deleteFileUrl, success: function (data) {
                    if (tempFileName != "") {
                        var saveFilePath = MiniFileMgr.getFileNativePath(tempFileName);
                        MiniFileMgr.fs.copyFile({ srcPath: tempFileName, destPath: saveFilePath, success: function (data) {
                                MiniFileMgr.onSaveFile(readyUrl, tempFileName, true, encoding, callBack, fileSize);
                            }, fail: function (data) {
                                callBack != null && callBack.runWith([1, data]);
                            } });
                    }
                    else {
                        MiniFileMgr.onSaveFile(readyUrl, tempFileName, false, encoding, callBack, fileSize);
                    }
                }, fail: function (data) {
                    callBack != null && callBack.runWith([1, data]);
                } });
            if (readyUrl && readyUrl != "" && readyUrl.indexOf(".zip") != -1) {
                var nativepath = TBMiniAdapter.zipHeadFiles[readyUrl];
                if (nativepath) {
                    try {
                        MiniFileMgr.fs.rmdirSync(nativepath, true);
                    }
                    catch (e) {
                        console.log("目录:" + nativepath + "delete fail");
                        console.log(e);
                    }
                }
            }
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
                MiniFileMgr.filesListObj[fileurlkey] = { md5: md5Name, readyUrl: readyUrl, size: fileSize, times: Laya.Browser.now(), encoding: encoding, tempFilePath: fileNativeName };
                MiniFileMgr.filesListObj['fileUsedSize'] = parseInt(MiniFileMgr.filesListObj['fileUsedSize']) + fileSize;
                MiniFileMgr.writeFilesList(fileurlkey, JSON.stringify(MiniFileMgr.filesListObj), true);
                callBack != null && callBack.runWith([0]);
            }
            else {
                if (MiniFileMgr.filesListObj[fileurlkey]) {
                    var deletefileSize = parseInt(MiniFileMgr.filesListObj[fileurlkey].size);
                    MiniFileMgr.filesListObj['fileUsedSize'] = parseInt(MiniFileMgr.filesListObj['fileUsedSize']) - deletefileSize;
                    if (MiniFileMgr.fakeObj[fileurlkey].md5 == MiniFileMgr.filesListObj[fileurlkey].md5) {
                        delete MiniFileMgr.fakeObj[fileurlkey];
                    }
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
            if (!TBMiniAdapter.isZiYu && TBMiniAdapter.isPosMsgYu && TBMiniAdapter.window.my.postMessage) {
                TBMiniAdapter.window.my.postMessage({ url: fileurlkey, data: MiniFileMgr.filesListObj[fileurlkey], isLoad: "filenative", isAdd: isAdd });
            }
        }
        static getCacheUseSize() {
            if (MiniFileMgr.filesListObj && MiniFileMgr.filesListObj['fileUsedSize'])
                return MiniFileMgr.filesListObj['fileUsedSize'];
            return 0;
        }
        static getCacheList(dirPath, cb) {
            let stat;
            try {
                stat = MiniFileMgr.fs.statSync(dirPath);
            }
            catch (err) {
                stat = null;
            }
            if (stat) {
                MiniFileMgr.readSync(MiniFileMgr.fileListName, "utf8", cb);
            }
            else {
                MiniFileMgr.fs.mkdirSync(dirPath, true);
                cb && cb.runWith([1]);
            }
        }
        static existDir(dirPath, callBack) {
            MiniFileMgr.fs.mkdir({ dirPath: dirPath, success: function (data) {
                    callBack != null && callBack.runWith([0, { data: JSON.stringify({}) }]);
                }, fail: function (data) {
                    if (data.error == 10025)
                        MiniFileMgr.readSync(MiniFileMgr.fileListName, "utf8", callBack);
                    else
                        callBack != null && callBack.runWith([1, data]);
                } });
        }
        static readSync(filePath, encoding = "utf8", callBack = null, readyUrl = "") {
            var fileUrl = MiniFileMgr.getFileNativePath(filePath);
            var filesListStr;
            try {
                MiniFileMgr.fs.readFile({
                    filePath: fileUrl,
                    encoding: encoding,
                    success: function (data) {
                        filesListStr = data.data;
                        callBack != null && callBack.runWith([0, { data: filesListStr }]);
                    },
                    fail: function () {
                        callBack != null && callBack.runWith([1]);
                    }
                });
            }
            catch (error) {
                callBack != null && callBack.runWith([1]);
            }
        }
        static setNativeFileDir(value) {
            MiniFileMgr.fileNativeDir = TBMiniAdapter.window.my.env.USER_DATA_PATH + value;
        }
    }
    MiniFileMgr.fs = window.my.getFileSystemManager();
    MiniFileMgr.wxdown = window.my.downloadFile;
    MiniFileMgr.filesListObj = {};
    MiniFileMgr.fakeObj = {};
    MiniFileMgr.fileListName = "layaairfiles.txt";
    MiniFileMgr.ziyuFileData = {};
    MiniFileMgr.ziyuFileTextureData = {};
    MiniFileMgr.loadPath = "";
    MiniFileMgr.DESCENDING = 2;
    MiniFileMgr.NUMERIC = 16;

    class MiniSoundChannel extends Laya.SoundChannel {
        constructor(sound) {
            super();
            this._sound = sound;
            this._audio = sound._sound;
            this._onCanplay = this.onCanPlay.bind(this);
            this._onError = this.onError.bind(this);
            this._onEnd = this.__onEnd.bind(this);
            this.addEventListener();
        }
        addEventListener() {
            this._audio.onError(this._onError);
            this._audio.onCanplay(this._onCanplay);
        }
        offEventListener() {
            this._audio.offError(this._onError);
            this._audio.offCanplay(this._onCanplay);
            this._audio.offEnded(this._onEnd);
        }
        onError(error) {
            console.log("-----1---------------minisound-----url:", this.url);
            console.log(error);
            this.event(Laya.Event.ERROR);
            if (!this._audio)
                return;
            this._sound.dispose();
            this.offEventListener();
            this._sound = this._audio = null;
        }
        onCanPlay() {
            if (!this._audio)
                return;
            this.event(Laya.Event.COMPLETE);
            this.offEventListener();
            this._audio.onEnded(this._onEnd);
            if (!this.isStopped) {
                this.play();
            }
            else {
                this.stop();
            }
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
            if (!this._audio)
                return;
            this._audio.play();
        }
        set startTime(time) {
            if (!this._audio)
                return;
            this._audio.startTime = time;
        }
        set autoplay(value) {
            if (!this._audio)
                return;
            this._audio.autoplay = value;
        }
        get autoplay() {
            if (!this._audio)
                return false;
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
            super.stop();
            this.isStopped = true;
            Laya.SoundManager.removeChannel(this);
            this.completeHandler = null;
            if (!this._audio)
                return;
            this._audio.stop();
            if (!this.loop) {
                this.offEventListener();
                this._sound.dispose();
                this._sound = null;
                this._audio = null;
            }
        }
        pause() {
            this.isStopped = true;
            if (!this._audio)
                return;
            this._audio.pause();
        }
        get loop() {
            if (!this._audio)
                return false;
            return this._audio.loop;
        }
        set loop(value) {
            if (!this._audio)
                return;
            this._audio.loop = value;
        }
        resume() {
            this.isStopped = false;
            Laya.SoundManager.addChannel(this);
            if (!this._audio)
                return;
            this._audio.play();
        }
        set volume(v) {
            if (!this._audio)
                return;
            this._audio.volume = v;
        }
        get volume() {
            if (!this._audio)
                return 0;
            return this._audio.volume;
        }
    }

    class MiniSound extends Laya.EventDispatcher {
        constructor() {
            super();
            this.loaded = false;
            this._sound = MiniSound._createSound();
        }
        static __init__() {
            for (let index = 0; index < 10; index++) {
                let s = TBMiniAdapter.window.my.createInnerAudioContext();
                MiniSound.cachePool.push(s);
            }
        }
        static _createSound() {
            if (MiniSound.cachePool.length) {
                return MiniSound.cachePool.pop();
            }
            else {
                return TBMiniAdapter.window.my.createInnerAudioContext();
            }
        }
        load(url) {
            if (!MiniFileMgr.isLocalNativeZipFile(url) && MiniFileMgr.isNetFile(url)) {
                url = Laya.URL.formatURL(url);
            }
            else {
                if (url.indexOf(TBMiniAdapter.window.my.env.USER_DATA_PATH) == -1 && (url.indexOf("http://") != -1 || url.indexOf("https://") != -1)) {
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
            if (TBMiniAdapter.autoCacheFile && MiniFileMgr.getFileInfo(url)) {
                this.onDownLoadCallBack(url, 0);
            }
            else {
                if (!TBMiniAdapter.autoCacheFile) {
                    this.onDownLoadCallBack(url, 0);
                }
                else {
                    if (MiniFileMgr.isLocalNativeFile(url)) {
                        if (TBMiniAdapter.subNativeFiles && TBMiniAdapter.subNativeheads.length == 0) {
                            for (var key in TBMiniAdapter.subNativeFiles) {
                                var tempArr = TBMiniAdapter.subNativeFiles[key];
                                TBMiniAdapter.subNativeheads = TBMiniAdapter.subNativeheads.concat(tempArr);
                                for (let i = 0; i < tempArr.length; i++) {
                                    TBMiniAdapter.subMaps[tempArr[i]] = key + "/" + tempArr[i];
                                }
                            }
                        }
                        if (TBMiniAdapter.subNativeFiles && url.indexOf("/") != -1) {
                            var curfileHead = url.split("/")[0] + "/";
                            if (curfileHead && TBMiniAdapter.subNativeheads.indexOf(curfileHead) != -1) {
                                var newfileHead = TBMiniAdapter.subMaps[curfileHead];
                                url = url.replace(curfileHead, newfileHead);
                            }
                        }
                        this.onDownLoadCallBack(url, 0);
                    }
                    else {
                        if ((url.indexOf("http://") == -1 && url.indexOf("https://") == -1)
                            || url.indexOf(TBMiniAdapter.window.my.env.USER_DATA_PATH) != -1) {
                            this.onDownLoadCallBack(url, 0);
                        }
                        else {
                            MiniFileMgr.downOtherFiles(url, Laya.Handler.create(this, this.onDownLoadCallBack, [url]), url, TBMiniAdapter.autoCacheFile);
                        }
                    }
                }
            }
        }
        onDownLoadCallBack(sourceUrl, errorCode, tempFilePath = null) {
            if (!errorCode && this._sound) {
                var fileNativeUrl;
                if (TBMiniAdapter.autoCacheFile) {
                    if (!tempFilePath) {
                        if (MiniFileMgr.isLocalNativeFile(sourceUrl)) {
                            var tempStr = Laya.URL.rootPath != "" ? Laya.URL.rootPath : Laya.URL._basePath;
                            var tempUrl = sourceUrl;
                            if (tempStr != "" && (sourceUrl.indexOf("http://") != -1 || sourceUrl.indexOf("https://") != -1))
                                fileNativeUrl = sourceUrl.split(tempStr)[1];
                            if (!fileNativeUrl) {
                                fileNativeUrl = tempUrl;
                            }
                            if (fileNativeUrl.indexOf(TBMiniAdapter.window.wx.env.USER_DATA_PATH) == -1 && MiniFileMgr.isLocalNativeZipFile(fileNativeUrl)) {
                                fileNativeUrl = MiniFileMgr.getFileNativePath(fileNativeUrl);
                            }
                            if (MiniFileMgr.isSubNativeFile(fileNativeUrl)) {
                                fileNativeUrl = fileNativeUrl;
                            }
                            else
                                fileNativeUrl = TBMiniAdapter.baseDir + fileNativeUrl;
                        }
                        else {
                            var fileObj = MiniFileMgr.getFileInfo(sourceUrl);
                            if (fileObj && fileObj.md5) {
                                var fileMd5Name = fileObj.md5;
                                fileNativeUrl = MiniFileMgr.getFileNativePath(fileMd5Name);
                            }
                            else {
                                if (sourceUrl.indexOf("http://") == -1
                                    && sourceUrl.indexOf("https://") == -1
                                    && sourceUrl.indexOf(TBMiniAdapter.window.my.env.USER_DATA_PATH) == -1) {
                                    fileNativeUrl = TBMiniAdapter.baseDir + sourceUrl;
                                }
                                else {
                                    fileNativeUrl = sourceUrl;
                                }
                            }
                        }
                    }
                    else {
                        fileNativeUrl = tempFilePath;
                    }
                    this._sound.src = this.readyUrl = fileNativeUrl;
                }
                else {
                    if (MiniFileMgr.isLocalNativeFile(sourceUrl) ||
                        (sourceUrl.indexOf("http://") == -1
                            && sourceUrl.indexOf("https://") == -1
                            && sourceUrl.indexOf(TBMiniAdapter.window.my.env.USER_DATA_PATH) == -1
                            && !MiniFileMgr.isSubNativeFile(fileNativeUrl))) {
                        sourceUrl = TBMiniAdapter.baseDir + sourceUrl;
                    }
                    this._sound.src = this.readyUrl = sourceUrl;
                }
            }
            else {
                this.event(Laya.Event.ERROR);
            }
        }
        play(startTime = 0, loops = 0) {
            if (!this.url)
                return null;
            var channel = new MiniSoundChannel(this);
            channel.url = this.url;
            channel.loops = loops;
            channel.loop = (loops === 0 ? true : false);
            channel.startTime = startTime;
            channel.isStopped = false;
            Laya.SoundManager.addChannel(channel);
            return channel;
        }
        get duration() {
            return this._sound.duration;
        }
        dispose() {
            if (this._sound) {
                MiniSound.cachePool.push(this._sound);
                this._sound = null;
                this.readyUrl = this.url = null;
            }
        }
    }
    MiniSound.cachePool = [];

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
            Laya.SoundManager._soundClass = MiniSound;
            Laya.SoundManager._musicClass = MiniSound;
            var model = TBMiniAdapter.systemInfo.model;
            var system = TBMiniAdapter.systemInfo.system;
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
            return;
        }
        static inputEnter() {
            Laya.Input['inputElement'].target.focus = false;
        }
        static wxinputblur() {
            MiniInput.hideKeyboard();
        }
        static hideKeyboard() {
            return;
        }
    }

    class MiniLoader extends Laya.EventDispatcher {
        constructor() {
            super();
        }
        _loadResourceFilter(type, url) {
            var thisLoader = this;
            this.sourceUrl = Laya.URL.formatURL(url);
            if (MiniFileMgr.isNetFile(url)) {
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
            if (TBMiniAdapter.subNativeFiles && TBMiniAdapter.subNativeheads.length == 0) {
                for (var key in TBMiniAdapter.subNativeFiles) {
                    var tempArr = TBMiniAdapter.subNativeFiles[key];
                    TBMiniAdapter.subNativeheads = TBMiniAdapter.subNativeheads.concat(tempArr);
                    for (var aa = 0; aa < tempArr.length; aa++) {
                        TBMiniAdapter.subMaps[tempArr[aa]] = key + "/" + tempArr[aa];
                    }
                }
            }
            if (TBMiniAdapter.subNativeFiles && url.indexOf("/") != -1) {
                var curfileHead = url.split("/")[0] + "/";
                if (curfileHead && TBMiniAdapter.subNativeheads.indexOf(curfileHead) != -1) {
                    var newfileHead = TBMiniAdapter.subMaps[curfileHead];
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
            if (!TBMiniAdapter.autoCacheFile) {
                MiniLoader.onDownLoadCallBack(url, thisLoader, 0);
            }
            else {
                var tempurl = Laya.URL.formatURL(url);
                if (MiniFileMgr.getFileInfo(tempurl)) {
                    MiniLoader.onDownLoadCallBack(url, thisLoader, 0);
                }
                else {
                    if (!MiniFileMgr.isLocalNativeFile(url)) {
                        if (MiniFileMgr.isNetFile(tempurl)) {
                            MiniFileMgr.downOtherFiles(TBMiniAdapter.safeEncodeURI(tempurl), Laya.Handler.create(MiniLoader, MiniLoader.onDownLoadCallBack, [tempurl, thisLoader]), tempurl, TBMiniAdapter.autoCacheFile);
                        }
                        else {
                            MiniLoader.onDownLoadCallBack(TBMiniAdapter.baseDir + url, thisLoader, 0);
                        }
                    }
                    else {
                        if (tempurl.indexOf(TBMiniAdapter.window.my.env.USER_DATA_PATH) == -1 && !MiniFileMgr.isSubNativeFile(url)) {
                            MiniLoader.onDownLoadCallBack(TBMiniAdapter.baseDir + url, thisLoader, 0);
                        }
                        else
                            MiniLoader.onDownLoadCallBack(url, thisLoader, 0);
                    }
                }
            }
        }
        static onDownLoadCallBack(sourceUrl, thisLoader, errorCode, tempFilePath = null) {
            if (!errorCode) {
                var fileNativeUrl;
                if (TBMiniAdapter.autoCacheFile) {
                    if (!tempFilePath) {
                        if (MiniFileMgr.isLocalNativeFile(sourceUrl)) {
                            fileNativeUrl = sourceUrl;
                            if (fileNativeUrl.indexOf(TBMiniAdapter.window.wx.env.USER_DATA_PATH) == -1 && MiniFileMgr.isLocalNativeZipFile(fileNativeUrl)) {
                                fileNativeUrl = MiniFileMgr.getFileNativePath(fileNativeUrl);
                            }
                        }
                        else {
                            var fileObj = MiniFileMgr.getFileInfo(sourceUrl);
                            if (fileObj && fileObj.md5) {
                                fileNativeUrl = fileObj.tempFilePath || MiniFileMgr.getFileNativePath(fileObj.md5);
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
                else {
                    fileNativeUrl = Laya.URL.formatURL(sourceUrl);
                }
                sourceUrl = fileNativeUrl;
                var sound = (new Laya.SoundManager._soundClass());
                sound.load(TBMiniAdapter.safeEncodeURI(sourceUrl));
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
        complete(data) {
            if (data instanceof Laya.Resource) {
                data._setCreateURL(this.sourceUrl);
            }
            else if ((data instanceof Laya.Texture) && (data.bitmap instanceof Laya.Resource)) {
                data.bitmap._setCreateURL(this.sourceUrl);
            }
            this.originComplete(data);
        }
        _loadHttpRequestWhat(url, contentType) {
            var thisLoader = this;
            var encoding = TBMiniAdapter.getUrlEncode(url, contentType);
            var tempurl = Laya.URL.formatURL(url);
            if (Laya.Loader.preLoadedMap[tempurl])
                thisLoader.onLoaded(Laya.Loader.preLoadedMap[tempurl]);
            else {
                var fileObj = MiniFileMgr.getFileInfo(tempurl);
                if (fileObj) {
                    fileObj.encoding = fileObj.encoding == null ? "utf8" : fileObj.encoding;
                    var fileNativeUrl = fileObj.tempFilePath || MiniFileMgr.getFileNativePath(fileObj.md5);
                    MiniFileMgr.readFile(fileNativeUrl, encoding, new Laya.Handler(MiniLoader, MiniLoader.onReadNativeCallBack, [url, contentType, thisLoader]), url);
                }
                else {
                    if ((tempurl.indexOf("http://") == -1 && tempurl.indexOf("https://") == -1) || MiniFileMgr.isLocalNativeFile(url)) {
                        if (tempurl.indexOf(TBMiniAdapter.window.my.env.USER_DATA_PATH) == -1 && !MiniFileMgr.isSubNativeFile(url)) {
                            MiniFileMgr.readFile(TBMiniAdapter.baseDir + url, encoding, new Laya.Handler(MiniLoader, MiniLoader.onReadNativeCallBack, [url, contentType, thisLoader]), url);
                        }
                        else {
                            if (url.indexOf(TBMiniAdapter.window.wx.env.USER_DATA_PATH) == -1 && MiniFileMgr.isLocalNativeZipFile(url)) {
                                url = MiniFileMgr.getFileNativePath(url);
                            }
                            MiniFileMgr.readFile(url, encoding, new Laya.Handler(MiniLoader, MiniLoader.onReadNativeCallBack, [url, contentType, thisLoader]), url);
                        }
                    }
                    else {
                        MiniFileMgr.downFiles(TBMiniAdapter.safeEncodeURI(tempurl), encoding, new Laya.Handler(MiniLoader, MiniLoader.onReadNativeCallBack, [url, contentType, thisLoader]), tempurl, TBMiniAdapter.AutoCacheDownFile);
                    }
                }
            }
        }
        static onReadNativeCallBack(url, type = null, thisLoader = null, errorCode = 0, data = null) {
            if (!errorCode) {
                try {
                    var tempData;
                    if (type == Laya.Loader.JSON || type == Laya.Loader.ATLAS || type == Laya.Loader.PREFAB || type == Laya.Loader.PLF) {
                        tempData = TBMiniAdapter.getJson(data.data);
                    }
                    else if (type == Laya.Loader.XML) {
                        tempData = Laya.Utils.parseXMLFromString(data.data);
                    }
                    else {
                        tempData = data.data;
                    }
                    thisLoader.onLoaded(tempData);
                }
                catch (err) {
                    thisLoader.onError && thisLoader.onError(data);
                }
            }
            else if (errorCode == 1) {
                thisLoader.onError && thisLoader.onError(data);
            }
        }
        static _transformImgUrl(url, type, thisLoader) {
            let tempurl = Laya.URL.formatURL(url);
            if (MiniFileMgr.isLocalNativeFile(url) || (tempurl.indexOf("http://") == -1 && tempurl.indexOf("https://") == -1)) {
                if (tempurl.indexOf(TBMiniAdapter.window.my.env.USER_DATA_PATH) == -1) {
                    MiniLoader.onCreateImage(url, thisLoader, true);
                }
                else {
                    if (MiniFileMgr.isLocalNativeZipFile(url)) {
                        url = MiniFileMgr.getFileNativePath(url);
                    }
                    MiniLoader.onCreateImage(url, thisLoader, false, url);
                }
            }
            else {
                MiniLoader.onCreateImage(url, thisLoader, false, tempurl);
            }
        }
        static onCreateImage(sourceUrl, thisLoader, isLocal = false, tempFilePath = "") {
            var fileNativeUrl;
            if (!isLocal) {
                if (tempFilePath != "") {
                    fileNativeUrl = tempFilePath;
                }
                else {
                    fileNativeUrl = sourceUrl;
                }
            }
            else {
                if (!MiniFileMgr.isSubNativeFile(sourceUrl)) {
                    fileNativeUrl = TBMiniAdapter.baseDir + sourceUrl;
                }
                else
                    fileNativeUrl = sourceUrl;
            }
            thisLoader._loadImage(TBMiniAdapter.safeEncodeURI(fileNativeUrl), false);
        }
    }

    class MiniLocalStorage {
        constructor() {
        }
        static __init__() {
            MiniLocalStorage.items = MiniLocalStorage;
        }
        static setItem(key, value) {
            TBMiniAdapter.window.my.setStorageSync({ key: key, data: value });
        }
        static getItem(key) {
            return TBMiniAdapter.window.my.getStorageSync({ "key": key }).data;
        }
        static setJSON(key, value) {
            try {
                MiniLocalStorage.setItem(key, JSON.stringify(value));
            }
            catch (e) {
                console.warn("set localStorage failed", e);
            }
        }
        static getJSON(key) {
            return JSON.parse(MiniLocalStorage.getItem(key));
        }
        static removeItem(key) {
            TBMiniAdapter.window.my.removeStorageSync({ key: key });
        }
        static clear() {
            TBMiniAdapter.window.my.clearStorageSync();
        }
        static getStorageInfoSync() {
            try {
                var res = TBMiniAdapter.window.my.getStorageInfoSync();
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

    class TBMiniAdapter {
        static getJson(data) {
            return JSON.parse(data);
        }
        static enable() {
            TBMiniAdapter.init(Laya.Laya.isWXPosMsg, Laya.Laya.isWXOpenDataContext);
        }
        static init(isPosMsg = false, isSon = false) {
            if (TBMiniAdapter._inited)
                return;
            TBMiniAdapter._inited = true;
            TBMiniAdapter.window = window;
            if (!TBMiniAdapter.window.hasOwnProperty("my"))
                return;
            TBMiniAdapter.isZiYu = isSon;
            TBMiniAdapter.isPosMsgYu = isPosMsg;
            TBMiniAdapter.EnvConfig = {};
            if (!TBMiniAdapter.isZiYu) {
                MiniFileMgr.setNativeFileDir("/layaairGame");
                MiniFileMgr.getCacheList(MiniFileMgr.fileNativeDir, Laya.Handler.create(TBMiniAdapter, TBMiniAdapter.onMkdirCallBack));
            }
            TBMiniAdapter.systemInfo = TBMiniAdapter.window.my.getSystemInfoSync();
            TBMiniAdapter.window.focus = function () {
            };
            Laya.Laya['_getUrlPath'] = function () {
                return "";
            };
            TBMiniAdapter.window.logtime = function (str) {
            };
            TBMiniAdapter.window.alertTimeLog = function (str) {
            };
            TBMiniAdapter.window.resetShareInfo = function () {
            };
            TBMiniAdapter.window.CanvasRenderingContext2D = function () {
            };
            Laya.HttpRequest._urlEncode = TBMiniAdapter.safeEncodeURI;
            TBMiniAdapter._preCreateElement = Laya.Browser.createElement;
            TBMiniAdapter.window.CanvasRenderingContext2D.prototype = TBMiniAdapter._preCreateElement("canvas").getContext('2d').__proto__;
            TBMiniAdapter.window.document.body.appendChild = function () {
            };
            Laya.Browser["createElement"] = TBMiniAdapter.createElement;
            Laya.RunDriver.createShaderCondition = TBMiniAdapter.createShaderCondition;
            Laya.Utils['parseXMLFromString'] = TBMiniAdapter.parseXMLFromString;
            Laya.Input['_createInputElement'] = MiniInput['_createInputElement'];
            if (!window.ImageData) {
                window.ImageData = ImageDataPolyfill;
            }
            Laya.Loader.prototype._loadResourceFilter = MiniLoader.prototype._loadResourceFilter;
            Laya.Loader.prototype._loadSound = MiniLoader.prototype._loadSound;
            Laya.Loader.prototype.originComplete = Laya.Loader.prototype.complete;
            Laya.Loader.prototype.complete = MiniLoader.prototype.complete;
            Laya.Loader.prototype._loadHttpRequestWhat = MiniLoader.prototype._loadHttpRequestWhat;
            Laya.Config.useRetinalCanvas = true;
            Laya.LocalStorage._baseClass = MiniLocalStorage;
            MiniLocalStorage.__init__();
            MiniSound.__init__();
            TBMiniAdapter.window.my.onMessage && TBMiniAdapter.window.my.onMessage(TBMiniAdapter._onMessage);
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
        static loadZip(zipurl, nativeurl, callBack, proCallBack, isUpdateType = 0) {
            var fs = MiniFileMgr.fs;
            if (fs && fs.unzip) {
                TBMiniAdapter.nativefiles.push(nativeurl);
                TBMiniAdapter.nativezipfiles.push(nativeurl);
                var path = MiniFileMgr.fileNativeDir + "/" + nativeurl;
                TBMiniAdapter.zipHeadFiles[zipurl] = nativeurl;
                fs.access({
                    path: path,
                    success: function (data) {
                        if (isUpdateType == 1) {
                            try {
                                fs.rmdirSync(path, true);
                            }
                            catch (e) {
                                console.log("目录删除成功");
                                console.log(e);
                            }
                            fs.mkdir({
                                dirPath: path,
                                recursive: true,
                                success: function (data1) {
                                    TBMiniAdapter.downZip(zipurl, path, fs, callBack, proCallBack);
                                }.bind(this),
                                fail: function (data1) {
                                    callBack != null && callBack.runWith([{ errCode: 3, errMsg: "创建压缩包目录失败", wxData: data1 }]);
                                }.bind(this)
                            });
                        }
                        else if (isUpdateType == 2) {
                            TBMiniAdapter.downZip(zipurl, path, fs, callBack, proCallBack);
                        }
                        else {
                            var fileObj = MiniFileMgr.getFileInfo(zipurl);
                            if (!fileObj) {
                                TBMiniAdapter.downZip(zipurl, path, fs, callBack, proCallBack);
                            }
                            else {
                                callBack != null && callBack.runWith([{ errCode: 0, errMsg: "zip包目录存在，直接返回完成", wxData: data }]);
                            }
                        }
                    }.bind(this),
                    fail: function (data) {
                        if (data && data.errMsg.indexOf("access:fail no such file or directory") != -1) {
                            fs.mkdir({
                                dirPath: path,
                                recursive: true,
                                success: function (data1) {
                                    TBMiniAdapter.downZip(zipurl, path, fs, callBack, proCallBack);
                                }.bind(this),
                                fail: function (data1) {
                                    callBack != null && callBack.runWith([{ errCode: 3, errMsg: "创建压缩包目录失败", wxData: data1 }]);
                                }.bind(this)
                            });
                        }
                    }.bind(this)
                });
            }
            else {
                callBack != null && callBack.runWith([{ errCode: 2, errMsg: "微信压缩接口不支持" }]);
            }
        }
        static downZip(zipurl, path, fs, callBack, proCallBack) {
            var obj = {
                zipFilePath: zipurl,
                targetPath: path,
                success: function (data) {
                    callBack != null && callBack.runWith([{ errCode: 0, errMsg: "解压成功", wxData: data }]);
                }.bind(this),
                fail: function (data) {
                    callBack != null && callBack.runWith([{ errCode: 1, errMsg: "解压失败", wxData: data }]);
                }.bind(this)
            };
            if (zipurl.indexOf('http://') == -1 && zipurl.indexOf('https://') == -1) {
                fs.unzip(obj);
            }
            else {
                var downloadTask = window.wx.downloadFile({
                    url: zipurl,
                    success: function (data) {
                        if (data.statusCode === 200) {
                            obj.zipFilePath = data.tempFilePath;
                            fs.unzip(obj);
                            MiniFileMgr.copyTOCache(data.tempFilePath, zipurl, null, 'utf8', true);
                        }
                        else {
                            callBack != null && callBack.runWith([{ errCode: 4, errMsg: "远端下载zip包失败", wxData: data }]);
                        }
                    }.bind(this),
                    fail: function (data) {
                        callBack != null && callBack.runWith([{ errCode: 4, errMsg: "远端下载zip包失败", wxData: data }]);
                    }.bind(this)
                });
                downloadTask.onProgressUpdate(function (data) {
                    proCallBack != null && proCallBack.runWith([{ errCode: 5, errMsg: "zip包下载中", progress: data.progress }]);
                });
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
                MiniFileMgr.downLoadFile(TBMiniAdapter.safeEncodeURI(fileUrl), fileType, callBack, encoding);
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
            TBMiniAdapter.window.my.exitMiniProgram();
        }
        static onMkdirCallBack(errorCode, data) {
            if (!errorCode) {
                MiniFileMgr.filesListObj = JSON.parse(data.data);
                MiniFileMgr.fakeObj = JSON.parse(data.data) || {};
            }
            else {
                MiniFileMgr.fakeObj = {};
                MiniFileMgr.filesListObj = {};
            }
            let files = MiniFileMgr.fs.readdirSync(MiniFileMgr.fileNativeDir);
            if (!files || !files.length)
                return;
            var tempMd5ListObj = {};
            var fileObj;
            for (let key in MiniFileMgr.filesListObj) {
                if (key != "fileUsedSize") {
                    fileObj = MiniFileMgr.filesListObj[key];
                    tempMd5ListObj[fileObj.md5] = fileObj.readyUrl;
                }
            }
            var fileName;
            for (let i = 0, sz = files.length; i < sz; i++) {
                fileName = files[i];
                if (fileName == MiniFileMgr.fileListName)
                    continue;
                if (!tempMd5ListObj[fileName]) {
                    let deleteFileUrl = MiniFileMgr.getFileNativePath(fileName);
                    MiniFileMgr.fs.unlink({
                        filePath: deleteFileUrl,
                        success: function (data) {
                            console.log("删除无引用的磁盘文件:" + fileName);
                        }
                    });
                }
                delete tempMd5ListObj[fileName];
            }
            for (let key in tempMd5ListObj) {
                delete MiniFileMgr.filesListObj[tempMd5ListObj[key]];
                delete MiniFileMgr.fakeObj[tempMd5ListObj[key]];
                console.log("删除错误记录：", tempMd5ListObj[key]);
            }
        }
        static pixelRatio() {
            if (!TBMiniAdapter.EnvConfig.pixelRatioInt) {
                try {
                    TBMiniAdapter.EnvConfig.pixelRatioInt = TBMiniAdapter.systemInfo.pixelRatio;
                    return TBMiniAdapter.systemInfo.pixelRatio;
                }
                catch (error) {
                }
            }
            return TBMiniAdapter.EnvConfig.pixelRatioInt;
        }
        static createElement(type) {
            if (type == "canvas") {
                var _source;
                if (TBMiniAdapter.idx == 1) {
                    _source = TBMiniAdapter.window.canvas.getRealCanvas();
                    if (!my.isIDE) {
                        var originfun = _source.getContext;
                        _source.getContext = function (type) {
                            var gl = originfun.apply(_source, [type]);
                            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                            return gl;
                        };
                    }
                }
                else {
                    _source = TBMiniAdapter._preCreateElement(type);
                }
                (!_source.style) && (_source.style = {});
                TBMiniAdapter.idx++;
                return _source;
            }
            else if (type == "textarea" || type == "input") {
                return TBMiniAdapter.onCreateInput(type);
            }
            else if (type == "div") {
                var node = TBMiniAdapter._preCreateElement(type);
                node.contains = function (value) {
                    return null;
                };
                node.removeChild = function (value) {
                };
                return node;
            }
            else {
                return TBMiniAdapter._preCreateElement(type);
            }
        }
        static onCreateInput(type) {
            var node = TBMiniAdapter._preCreateElement(type);
            node.focus = MiniInput.wxinputFocus;
            node.blur = MiniInput.wxinputblur;
            node.value = 0;
            node.placeholder = {};
            node.type = {};
            node.setColor = function (value) {
            };
            node.setType = function (value) {
            };
            node.setFontFace = function (value) {
            };
            node.contains = function (value) {
                return null;
            };
            return node;
        }
        static createShaderCondition(conditionScript) {
            var func = function () {
                return this[conditionScript.replace("this.", "")];
            };
            return func;
        }
    }
    TBMiniAdapter.IGNORE = new RegExp("[-_.!~*'();/?:@&=+$,#%]|[0-9|A-Z|a-z]");
    TBMiniAdapter.safeEncodeURI = function (str) {
        var strTemp = "";
        var length = str.length;
        for (var i = 0; i < length; i++) {
            var word = str[i];
            if (TBMiniAdapter.IGNORE.test(word)) {
                strTemp += word;
            }
            else {
                try {
                    strTemp += encodeURI(word);
                }
                catch (e) {
                    console.log("errorInfo", ">>>" + word);
                }
            }
        }
        return strTemp;
    };
    TBMiniAdapter._inited = false;
    TBMiniAdapter.autoCacheFile = true;
    TBMiniAdapter.minClearSize = (5 * 1024 * 1024);
    TBMiniAdapter.sizeLimit = (50 * 1024 * 1024);
    TBMiniAdapter.nativefiles = ["layaNativeDir"];
    TBMiniAdapter.nativezipfiles = [];
    TBMiniAdapter.zipRequestHead = "";
    TBMiniAdapter.zipHeadFiles = {};
    TBMiniAdapter.subNativeFiles = {};
    TBMiniAdapter.subNativeheads = [];
    TBMiniAdapter.subMaps = [];
    TBMiniAdapter.AutoCacheDownFile = false;
    TBMiniAdapter.baseDir = "pages/index/";
    TBMiniAdapter.parseXMLFromString = function (value) {
        var rst;
        value = value.replace(/>\s+</g, '><');
        try {
            rst = (new TBMiniAdapter.window.Parser.DOMParser()).parseFromString(value, 'text/xml');
        }
        catch (error) {
            throw "需要引入xml解析库文件";
        }
        return rst;
    };
    TBMiniAdapter.idx = 1;

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
                TBMiniAdapter.window.my.onAccelerometerChange(MiniAccelerator.onAccelerometerChange);
            }
            catch (e) { }
        }
        static stopListen() {
            MiniAccelerator._isListening = false;
            try {
                TBMiniAdapter.window.my.stopAccelerometer({});
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

    class MiniLocation {
        constructor() {
        }
        static __init__() {
            TBMiniAdapter.window.navigator.geolocation.getCurrentPosition = MiniLocation.getCurrentPosition;
            TBMiniAdapter.window.navigator.geolocation.watchPosition = MiniLocation.watchPosition;
            TBMiniAdapter.window.navigator.geolocation.clearWatch = MiniLocation.clearWatch;
        }
        static getCurrentPosition(success = null, error = null, options = null) {
            var paramO;
            paramO = {};
            paramO.success = getSuccess;
            paramO.fail = error;
            TBMiniAdapter.window.my.getLocation(paramO);
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
            this.videoElement = TBMiniAdapter.window.my.createVideo({ width: width, height: height, autoplay: true });
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

    exports.ImageDataPolyfill = ImageDataPolyfill;
    exports.MiniAccelerator = MiniAccelerator;
    exports.MiniFileMgr = MiniFileMgr;
    exports.MiniInput = MiniInput;
    exports.MiniLoader = MiniLoader;
    exports.MiniLocalStorage = MiniLocalStorage;
    exports.MiniLocation = MiniLocation;
    exports.MiniSound = MiniSound;
    exports.MiniSoundChannel = MiniSoundChannel;
    exports.MiniVideo = MiniVideo;
    exports.TBMiniAdapter = TBMiniAdapter;

} 
