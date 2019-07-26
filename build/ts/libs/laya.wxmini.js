window.wxMiniGame = function (exports, Laya) {
	'use strict';

	/** @private **/
	class MiniFileMgr {
	    /**
	     * @private
	     * 是否是本地4M包文件
	     * @param url
	     * @return
	     */
	    static isLocalNativeFile(url) {
	        for (var i = 0, sz = MiniAdpter.nativefiles.length; i < sz; i++) {
	            //优化调整  if(url.indexOf(MiniAdpter.nativefiles[i]) == 0)
	            if (url.indexOf(MiniAdpter.nativefiles[i]) != -1)
	                return true;
	        }
	        return false;
	    }
	    /**
	     * @private
	     * 判断缓存里是否存在文件
	     * @param fileUrl
	     * @return
	     */
	    static getFileInfo(fileUrl) {
	        var fileNativePath = fileUrl;
	        var fileObj = MiniFileMgr.fakeObj[fileNativePath];
	        if (fileObj == null)
	            return null;
	        else
	            return fileObj;
	        return null;
	    }
	    /**
	     * @private
	     * 本地读取
	     * @param filePath 文件磁盘路径
	     * @param encoding 文件读取的编码格式
	     * @param callBack 回调处理
	     * @param readyUrl 文件请求加载地址
	     * @param isSaveFile 是否自动缓存下载的文件,只有在开发者自己单独加载时生效
	     * @param fileType 文件类型
	     */
	    static read(filePath, encoding = "ascill", callBack = null, readyUrl = "", isSaveFile = false, fileType = "") {
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
	    /**
	     * @private
	     * 下载远端文件(非图片跟声音文件)
	     * @param fileUrl  文件远端下载地址
	     * @param encode 文件编码
	     * @param callBack 完成回调
	     * @param readyUrl 文件真实下载地址
	     * @param isSaveFile 是否自动缓存下载的文件,只有在开发者自己单独加载时生效
	     * @param fileType 文件类型
	     */
	    static downFiles(fileUrl, encoding = "ascii", callBack = null, readyUrl = "", isSaveFile = false, fileType = "", isAutoClear = true) {
	        var downloadTask = MiniFileMgr.wxdown({ url: fileUrl, success: function (data) {
	                if (data.statusCode === 200)
	                    MiniFileMgr.readFile(data.tempFilePath, encoding, callBack, readyUrl, isSaveFile, fileType, isAutoClear);
	                else if (data.statusCode === 403) {
	                    callBack != null && callBack.runWith([0, fileUrl]); //修复本地加载非本地列表的配置文件处理
	                }
	                else {
	                    callBack != null && callBack.runWith([1, data]);
	                }
	            }, fail: function (data) {
	                callBack != null && callBack.runWith([1, data]);
	            } });
	        //获取加载进度
	        downloadTask.onProgressUpdate(function (data) {
	            callBack != null && callBack.runWith([2, data.progress]);
	        });
	    }
	    /**
	     * @private
	     * 本地本地磁盘文件读取
	     * @param filePath 文件磁盘临时地址
	     * @param encoding 文件设定读取的编码格式
	     * @param callBack 完成回调
	     * @param readyUrl 真实的下载地址
	     * @param isSaveFile 是否自动缓存下载的文件,只有在开发者自己单独加载时生效
	     * @param fileType 文件类型
	     */
	    static readFile(filePath, encoding = "ascill", callBack = null, readyUrl = "", isSaveFile = false, fileType = "", isAutoClear = true) {
	        filePath = Laya.URL.getAdptedFilePath(filePath);
	        MiniFileMgr.fs.readFile({ filePath: filePath, encoding: encoding, success: function (data) {
	                if (filePath.indexOf("http://") != -1 || filePath.indexOf("https://") != -1) {
	                    if (MiniAdpter.autoCacheFile || isSaveFile) {
	                        MiniFileMgr.copyFile(filePath, readyUrl, callBack, encoding, isAutoClear);
	                    }
	                }
	                else
	                    callBack != null && callBack.runWith([0, data]);
	            }, fail: function (data) {
	                if (data)
	                    callBack != null && callBack.runWith([1, data]);
	            } });
	    }
	    /**
	     * @private
	     * 下载远端文件(图片跟声音文件)
	     * @param fileUrl  文件远端下载地址
	     * @param encode 文件编码
	     * @param callBack 完成回调
	     * @param readyUrl 文件真实下载地址
	     * @param isSaveFile 是否自动缓存下载的文件,只有在开发者自己单独加载时生效
	     */
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
	                    callBack != null && callBack.runWith([1, data]); //修复下载文件返回非200状态码的bug
	                }
	            }, fail: function (data) {
	                callBack != null && callBack.runWith([1, data]);
	            } });
	    }
	    /**
	     * @private
	     * 下载文件
	     * @param fileUrl 文件远端地址
	     * @param fileType 文件类型(image、text、json、xml、arraybuffer、sound、atlas、font)
	     * @param callBack 文件加载回调,回调内容[errorCode码(0成功,1失败,2加载进度)
	     * @param encoding 文件编码默认 ascill，非图片文件加载需要设置相应的编码，二进制编码为空字符串
	     */
	    static downLoadFile(fileUrl, fileType = "", callBack = null, encoding = "ascii") {
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
	    /**
	     * @private
	     * 别名处理文件
	     * @param tempFilePath
	     * @param readyUrl
	     * @param callBack
	     * @param encoding 编码
	     */
	    static copyFile(tempFilePath, readyUrl, callBack, encoding = "", isAutoClear = true) {
	        var temp = tempFilePath.split("/");
	        var tempFileName = temp[temp.length - 1];
	        var fileurlkey = readyUrl; //.split("?")[0];
	        var fileObj = MiniFileMgr.getFileInfo(readyUrl);
	        var saveFilePath = MiniFileMgr.getFileNativePath(tempFileName);
	        MiniFileMgr.fakeObj[fileurlkey] = { md5: tempFileName, readyUrl: readyUrl, size: 0, times: Laya.Browser.now(), encoding: encoding };
	        //这里存储图片文件到磁盘里，需要检查磁盘空间容量是否已满50M，如果超过50M就需要清理掉不用的资源
	        var totalSize = 50 * 1024 * 1024; //总量50M
	        var chaSize = 4 * 1024 * 1024; //差值4M(预留加载缓冲空间,给文件列表用)
	        var fileUseSize = MiniFileMgr.getCacheUseSize(); //目前使用量
	        if (fileObj) {
	            if (fileObj.readyUrl != readyUrl) {
	                MiniFileMgr.fs.getFileInfo({
	                    filePath: tempFilePath,
	                    success: function (data) {
	                        if ((isAutoClear && (fileUseSize + chaSize + data.size) >= totalSize)) {
	                            if (data.size > MiniAdpter.minClearSize)
	                                MiniAdpter.minClearSize = data.size;
	                            MiniFileMgr.onClearCacheRes(); //如果存储满了需要清理资源,检查没用的资源清理，然后在做存储
	                        }
	                        MiniFileMgr.deleteFile(tempFileName, readyUrl, callBack, encoding, data.size);
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
	                        MiniFileMgr.onClearCacheRes(); //如果存储满了需要清理资源,检查没用的资源清理，然后在做存储
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
	    /**
	     * @private
	     * 清理缓存到磁盘的图片,每次释放默认5M，可以配置
	     */
	    static onClearCacheRes() {
	        var memSize = MiniAdpter.minClearSize;
	        var tempFileListArr = [];
	        for (var key in MiniFileMgr.filesListObj) {
	            if (key != "fileUsedSize")
	                tempFileListArr.push(MiniFileMgr.filesListObj[key]);
	        }
	        MiniFileMgr.sortOn(tempFileListArr, "times", MiniFileMgr.NUMERIC); //按时间进行排序
	        var clearSize = 0;
	        for (var i = 1, sz = tempFileListArr.length; i < sz; i++) {
	            var fileObj = tempFileListArr[i];
	            if (clearSize >= memSize)
	                break; //清理容量超过设置值就跳出清理操作
	            clearSize += fileObj.size;
	            MiniFileMgr.deleteFile("", fileObj.readyUrl);
	        }
	    }
	    /**
	     * @private
	     * 数组排序
	     * @param array
	     * @param name
	     * @param options
	     * @return
	     */
	    static sortOn(array, name, options = 0) {
	        if (options == MiniFileMgr.NUMERIC)
	            return array.sort(function (a, b) { return a[name] - b[name]; });
	        if (options == (MiniFileMgr.NUMERIC | MiniFileMgr.DESCENDING))
	            return array.sort(function (a, b) { return b[name] - a[name]; });
	        return array.sort(function (a, b) { return a[name] - b[name]; });
	    }
	    /**
	     * @private
	     * 获取文件磁盘的路径(md5)
	     * @param fileName
	     * @return
	     */
	    static getFileNativePath(fileName) {
	        return MiniFileMgr.fileNativeDir + "/" + fileName;
	    }
	    /**
	     * @private
	     * 从本地删除文件
	     * @param tempFileName 文件临时地址 ,为空字符串时就会从文件列表删除
	     * @param readyUrl 文件真实下载地址
	     * @param callBack 回调处理，在存储图片时用到
	     * @param encoding  文件编码
	     * @param fileSize 文件大小
	     */
	    static deleteFile(tempFileName, readyUrl = "", callBack = null, encoding = "", fileSize = 0) {
	        var fileObj = MiniFileMgr.getFileInfo(readyUrl);
	        var deleteFileUrl = MiniFileMgr.getFileNativePath(fileObj.md5);
	        MiniFileMgr.fs.unlink({ filePath: deleteFileUrl, success: function (data) {
	                var isAdd = tempFileName != "" ? true : false;
	                if (tempFileName != "") {
	                    var saveFilePath = MiniFileMgr.getFileNativePath(tempFileName);
	                    MiniFileMgr.fs.copyFile({ srcPath: tempFileName, destPath: saveFilePath, success: function (data) {
	                            MiniFileMgr.onSaveFile(readyUrl, tempFileName, isAdd, encoding, callBack, data.size);
	                        }, fail: function (data) {
	                            callBack != null && callBack.runWith([1, data]);
	                        } });
	                }
	                else {
	                    MiniFileMgr.onSaveFile(readyUrl, tempFileName, isAdd, encoding, callBack, fileSize); //清理文件列表
	                }
	            }, fail: function (data) {
	            } });
	    }
	    /**
	     * @private
	     * 清空缓存空间文件内容
	     */
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
	        //清理
	        if (MiniFileMgr.filesListObj && MiniFileMgr.filesListObj.fileUsedSize) {
	            MiniFileMgr.filesListObj.fileUsedSize = 0;
	        }
	        MiniFileMgr.writeFilesList("", JSON.stringify({}), false);
	    }
	    /**
	     * @private
	     * 存储更新文件列表
	     * @param readyUrl
	     * @param md5Name
	     * @param isAdd
	     * @param encoding
	     * @param callBack
	     * @param fileSize 文件大小
	     */
	    static onSaveFile(readyUrl, md5Name, isAdd = true, encoding = "", callBack = null, fileSize = 0) {
	        var fileurlkey = readyUrl; //.split("?")[0];
	        if (MiniFileMgr.filesListObj['fileUsedSize'] == null)
	            MiniFileMgr.filesListObj['fileUsedSize'] = 0;
	        if (isAdd) {
	            var fileNativeName = MiniFileMgr.getFileNativePath(md5Name);
	            //获取文件大小为异步操作，如果放到完成回调里可能会出现文件列表获取没有内容
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
	    /**
	     * @private
	     * 写入文件列表数据
	     * @param fileurlkey
	     * @param filesListStr
	     */
	    static writeFilesList(fileurlkey, filesListStr, isAdd) {
	        var listFilesPath = MiniFileMgr.fileNativeDir + "/" + MiniFileMgr.fileListName;
	        MiniFileMgr.fs.writeFile({ filePath: listFilesPath, encoding: 'utf8', data: filesListStr, success: function (data) {
	            }, fail: function (data) {
	            } });
	        //			__JS__('wx').setStorage({key:listFilesPath,data:filesListStr,success:function(data:Object):void{
	        //				trace("-----setStorage--success------------");
	        //				trace(data);
	        //			},fail:function(data:Object):void{
	        //				trace("-----setStorage--fail------------");
	        //				trace(data);
	        //			}});
	        //主域向子域传递消息
	        if (!MiniAdpter.isZiYu && MiniAdpter.isPosMsgYu) {
	            MiniAdpter.window.wx.postMessage({ url: fileurlkey, data: MiniFileMgr.filesListObj[fileurlkey], isLoad: "filenative", isAdd: isAdd });
	        }
	    }
	    /**
	     * @private
	     *获取当前缓存使用的空间大小(字节数，除以1024 再除以1024可以换算成M)
	     * @return
	     */
	    static getCacheUseSize() {
	        if (MiniFileMgr.filesListObj && MiniFileMgr.filesListObj['fileUsedSize'])
	            return MiniFileMgr.filesListObj['fileUsedSize'];
	        return 0;
	    }
	    /**
	     * @private
	     * 判断资源目录是否存在
	     * @param dirPath 磁盘设定路径
	     * @param callBack 回调处理
	     */
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
	    /**
	     * @private
	     * 本地读取
	     * @param filePath 文件磁盘路径
	     * @param encoding 文件读取的编码格式
	     * @param callBack 回调处理
	     * @param readyUrl 文件请求加载地址
	     */
	    static readSync(filePath, encoding = "ascill", callBack = null, readyUrl = "") {
	        var fileUrl = MiniFileMgr.getFileNativePath(filePath);
	        var filesListStr;
	        try {
	            filesListStr = MiniFileMgr.fs.readFileSync(fileUrl, encoding);
	            //				var tempFilesListStr:String = __JS__('wx').getStorageSync(fileUrl);
	            //				trace("--------tempFilesListStr:" + tempFilesListStr);
	            callBack != null && callBack.runWith([0, { data: filesListStr }]);
	        }
	        catch (error) {
	            callBack != null && callBack.runWith([1]);
	        }
	    }
	    /**
	     * @private
	     * 设置磁盘文件存储路径
	     * @param value 磁盘路径
	     * @return
	     */
	    static setNativeFileDir(value) {
	        MiniFileMgr.fileNativeDir = MiniAdpter.window.wx.env.USER_DATA_PATH + value;
	    }
	}
	/**@private 读取文件操作接口**/
	MiniFileMgr.fs = window.wx.getFileSystemManager();
	/**@private 下载文件接口**/
	MiniFileMgr.wxdown = window.wx.downloadFile;
	/**@private 文件缓存列表**/
	MiniFileMgr.filesListObj = {};
	/**@private 本局游戏使用的本地资源地址列表**/
	MiniFileMgr.fakeObj = {};
	/**@private 存储在磁盘的文件列表名称**/
	MiniFileMgr.fileListName = "layaairfiles.txt";
	/**@private 子域数据存储对象**/
	MiniFileMgr.ziyuFileData = {};
	/**子域图片磁盘缓存路径存储对象**/
	MiniFileMgr.ziyuFileTextureData = {};
	/**加载路径设定(相当于URL.rootPath)**/
	MiniFileMgr.loadPath = "";
	/**@private **/
	MiniFileMgr.DESCENDING = 2;
	/**@private **/
	MiniFileMgr.NUMERIC = 16;

	/** @private **/
	class MiniSoundChannel extends Laya.SoundChannel {
	    constructor(audio, miniSound) {
	        super();
	        this._audio = audio;
	        this._miniSound = miniSound;
	        this._onEnd = MiniSoundChannel.bindToThis(this.__onEnd, this);
	        audio.onEnded(this._onEnd);
	    }
	    /**
	     * @private
	     * 给传入的函数绑定作用域，返回绑定后的函数。
	     * @param	fun 函数对象。
	     * @param	scope 函数作用域。
	     * @return 绑定后的函数。
	     */
	    static bindToThis(fun, scope) {
	        var rst = fun;
	        rst = fun.bind(scope);
	        return rst;
	    }
	    /**@private **/
	    __onEnd() {
	        //MiniSound._audioCache[this.url] = this._miniSound;
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
	    /**
	     * @private
	     * 播放
	     */
	    /*override*/ play() {
	        this.isStopped = false;
	        Laya.SoundManager.addChannel(this);
	        this._audio.play();
	    }
	    /**
	     * 设置开始时间
	     * @param time
	     */
	    set startTime(time) {
	        if (this._audio) {
	            this._audio.startTime = time;
	        }
	    }
	    /**@private  **/
	    set autoplay(value) {
	        this._audio.autoplay = value;
	    }
	    /**
	     * @private
	     * 自动播放
	     * @param value
	     */
	    get autoplay() {
	        return this._audio.autoplay;
	    }
	    /**
	     * @private
	     * 当前播放到的位置
	     * @return
	     *
	     */
	    /*override*/ get position() {
	        if (!this._audio)
	            return 0;
	        return this._audio.currentTime;
	    }
	    /**
	     * @private
	     * 获取总时间。
	     */
	    /*override*/ get duration() {
	        if (!this._audio)
	            return 0;
	        return this._audio.duration;
	    }
	    /**
	     * @private
	     * 停止播放
	     *
	     */
	    /*override*/ stop() {
	        this.isStopped = true;
	        Laya.SoundManager.removeChannel(this);
	        this.completeHandler = null;
	        if (!this._audio)
	            return;
	        this._audio.stop(); //停止播放
	        if (!this.loop) {
	            this._audio.offEnded(null);
	            this._miniSound.dispose();
	            this._audio = null;
	            this._miniSound = null;
	            this._onEnd = null;
	        }
	    }
	    /**@private **/
	    /*override*/ pause() {
	        this.isStopped = true;
	        this._audio.pause();
	    }
	    /**@private **/
	    get loop() {
	        return this._audio.loop;
	    }
	    /**@private **/
	    set loop(value) {
	        this._audio.loop = value;
	    }
	    /**@private **/
	    /*override*/ resume() {
	        if (!this._audio)
	            return;
	        this.isStopped = false;
	        Laya.SoundManager.addChannel(this);
	        this._audio.play();
	    }
	    /**
	     * @private
	     * 设置音量
	     * @param v
	     *
	     */
	    /*override*/ set volume(v) {
	        if (!this._audio)
	            return;
	        this._audio.volume = v;
	    }
	    /**
	     * @private
	     * 获取音量
	     * @return
	     */
	    /*override*/ get volume() {
	        if (!this._audio)
	            return 1;
	        return this._audio.volume;
	    }
	}

	/** @private **/
	class MiniSound extends Laya.EventDispatcher {
	    constructor() {
	        super();
	        /**
	         * @private
	         * 是否已加载完成
	         */
	        this.loaded = false;
	        //_sound = _createSound();
	    }
	    /** @private **/
	    static _createSound() {
	        MiniSound._id++;
	        return MiniAdpter.window.wx.createInnerAudioContext();
	    }
	    /**
	     * @private
	     * 加载声音。
	     * @param url 地址。
	     *
	     */
	    load(url) {
	        if (!MiniFileMgr.isLocalNativeFile(url)) {
	            url = Laya.URL.formatURL(url);
	        }
	        else {
	            if (url.indexOf("http://") != -1 || url.indexOf("https://") != -1) {
	                if (MiniFileMgr.loadPath != "") {
	                    url = url.split(MiniFileMgr.loadPath)[1]; //去掉http头
	                }
	                else {
	                    var tempStr = Laya.URL.rootPath != "" ? Laya.URL.rootPath : Laya.URL._basePath;
	                    if (tempStr != "")
	                        url = url.split(tempStr)[1]; //去掉http头
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
	                        url = url.split(tempStr)[1]; //去掉http头
	                    if (!url) {
	                        url = tempUrl;
	                    }
	                    //分包目录资源加载处理
	                    if (MiniAdpter.subNativeFiles && MiniAdpter.subNativeheads.length == 0) {
	                        for (var key in MiniAdpter.subNativeFiles) {
	                            var tempArr = MiniAdpter.subNativeFiles[key];
	                            MiniAdpter.subNativeheads = MiniAdpter.subNativeheads.concat(tempArr);
	                            for (var aa = 0; aa < tempArr.length; aa++) {
	                                MiniAdpter.subMaps[tempArr[aa]] = key + "/" + tempArr[aa];
	                            }
	                        }
	                    }
	                    //判断当前的url是否为分包映射路径
	                    if (MiniAdpter.subNativeFiles && url.indexOf("/") != -1) {
	                        var curfileHead = url.split("/")[0] + "/"; //文件头
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
	    /**@private **/
	    onDownLoadCallBack(sourceUrl, errorCode, tempFilePath = null) {
	        if (!errorCode) {
	            var fileNativeUrl;
	            if (MiniAdpter.autoCacheFile) {
	                if (!tempFilePath) {
	                    if (MiniFileMgr.isLocalNativeFile(sourceUrl)) {
	                        var tempStr = Laya.URL.rootPath != "" ? Laya.URL.rootPath : Laya.URL._basePath;
	                        var tempUrl = sourceUrl;
	                        if (tempStr != "" && (sourceUrl.indexOf("http://") != -1 || sourceUrl.indexOf("https://") != -1))
	                            fileNativeUrl = sourceUrl.split(tempStr)[1]; //去掉http头
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
	                this._sound = MiniSound._createSound();
	                this._sound.src = this.url = fileNativeUrl;
	            }
	            else {
	                this._sound = MiniSound._createSound();
	                this._sound.src = this.url = sourceUrl;
	            }
	            this._sound.onCanplay(MiniSound.bindToThis(this.onCanPlay, this));
	            this._sound.onError(MiniSound.bindToThis(this.onError, this));
	        }
	        else {
	            this.event(Laya.Event.ERROR);
	        }
	    }
	    /**@private **/
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
	    /**@private **/
	    onCanPlay() {
	        this.loaded = true;
	        this.event(Laya.Event.COMPLETE);
	        //_audioCache[this.readyUrl] = this;
	        this._sound.offCanplay(null);
	    }
	    /**
	     * @private
	     * 给传入的函数绑定作用域，返回绑定后的函数。
	     * @param	fun 函数对象。
	     * @param	scope 函数作用域。
	     * @return 绑定后的函数。
	     */
	    static bindToThis(fun, scope) {
	        var rst = fun;
	        rst = fun.bind(scope);
	        return rst;
	    }
	    /**
	     * @private
	     * 播放声音。
	     * @param startTime 开始时间,单位秒
	     * @param loops 循环次数,0表示一直循环
	     * @return 声道 SoundChannel 对象。
	     *
	     */
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
	    /**
	     * @private
	     * 获取总时间。
	     */
	    get duration() {
	        return this._sound.duration;
	    }
	    /**
	     * @private
	     * 释放声音资源。
	     *
	     */
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
	/**@private **/
	MiniSound._id = 0;
	/**@private **/
	MiniSound._audioCache = {};

	/** @private **/
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
	        //[IF-SCRIPT] Input['inputContainer'].setPos = function(x:int, y:int):void { Input['inputContainer'].style.left = x + 'px'; Input['inputContainer'].style.top = y + 'px'; };
	        Laya.Laya.stage.on("resize", null, MiniInput._onStageResize);
	        MiniAdpter.window.wx.onWindowResize && MiniAdpter.window.wx.onWindowResize(function (res) {
	            // MiniAdpter.window.dispatchEvent && window.dispatchEvent("resize");
	        });
	        //替换声音
	        Laya.SoundManager._soundClass = MiniSound;
	        Laya.SoundManager._musicClass = MiniSound;
	        //运行环境判断
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
	            return; //非输入编辑模式
	        }
	        MiniAdpter.window.wx.offKeyboardConfirm();
	        MiniAdpter.window.wx.offKeyboardInput();
	        MiniAdpter.window.wx.showKeyboard({ defaultValue: _inputTarget.text, maxLength: _inputTarget.maxChars, multiple: _inputTarget.multiline, confirmHold: true, confirmType: _inputTarget["confirmType"] || 'done', success: function (res) {
	            }, fail: function (res) {
	            } });
	        MiniAdpter.window.wx.onKeyboardConfirm(function (res) {
	            var str = res ? res.value : "";
	            // 对输入字符进行限制
	            if (_inputTarget._restrictPattern) {
	                // 部分输入法兼容
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
	            // 对输入字符进行限制
	            if (_inputTarget._restrictPattern) {
	                // 部分输入法兼容
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

	/** @private **/
	class MiniLoader extends Laya.EventDispatcher {
	    constructor() {
	        super();
	    }
	    /**
	     * @private
	     * @param type
	     * @param url
	     */
	    _loadResourceFilter(type, url) {
	        var thisLoader = this;
	        //url转义处理
	        if (url.indexOf("http://usr/") == -1 && (url.indexOf("http://") != -1 || url.indexOf("https://") != -1)) {
	            if (MiniFileMgr.loadPath != "") {
	                url = url.split(MiniFileMgr.loadPath)[1]; //去掉http头
	            }
	            else {
	                var tempStr = Laya.URL.rootPath != "" ? Laya.URL.rootPath : Laya.URL._basePath;
	                var tempUrl = url;
	                if (tempStr != "")
	                    url = url.split(tempStr)[1]; //去掉http头
	                if (!url) {
	                    url = tempUrl;
	                }
	            }
	        }
	        //分包映射url处理
	        if (MiniAdpter.subNativeFiles && MiniAdpter.subNativeheads.length == 0) {
	            for (var key in MiniAdpter.subNativeFiles) {
	                var tempArr = MiniAdpter.subNativeFiles[key];
	                MiniAdpter.subNativeheads = MiniAdpter.subNativeheads.concat(tempArr);
	                for (var aa = 0; aa < tempArr.length; aa++) {
	                    MiniAdpter.subMaps[tempArr[aa]] = key + "/" + tempArr[aa];
	                }
	            }
	        }
	        //判断当前的url是否为分包映射路径
	        if (MiniAdpter.subNativeFiles && url.indexOf("/") != -1) {
	            var curfileHead = url.split("/")[0] + "/"; //文件头
	            if (curfileHead && MiniAdpter.subNativeheads.indexOf(curfileHead) != -1) {
	                var newfileHead = MiniAdpter.subMaps[curfileHead];
	                url = url.replace(curfileHead, newfileHead);
	            }
	        }
	        switch (type) {
	            case Laya.Loader.IMAGE:
	            case "htmlimage": //内部类型
	            case "nativeimage": //内部类型
	                MiniLoader._transformImgUrl(url, type, thisLoader);
	                break;
	            case Laya.Loader.SOUND:
	                thisLoader._loadSound(url);
	                break;
	            default:
	                thisLoader._loadResource(type, url);
	        }
	    }
	    /**
	     * private
	     * @param url
	     **/
	    _loadSound(url) {
	        var thisLoader = this;
	        var fileNativeUrl;
	        if (MiniFileMgr.isLocalNativeFile(url)) {
	            var tempStr = Laya.URL.rootPath != "" ? Laya.URL.rootPath : Laya.URL._basePath;
	            var tempUrl = url;
	            if (tempStr != "" && (url.indexOf("http://") != -1 || url.indexOf("https://") != -1))
	                fileNativeUrl = url.split(tempStr)[1]; //去掉http头
	            if (!fileNativeUrl) {
	                fileNativeUrl = tempUrl;
	            }
	            MiniLoader.onDownLoadCallBack(url, thisLoader, 0); //直接创建声音实例
	        }
	        else {
	            var tempurl = Laya.URL.formatURL(url);
	            if (!MiniFileMgr.isLocalNativeFile(url) && (tempurl.indexOf("http://") == -1 && tempurl.indexOf("https://") == -1) || (tempurl.indexOf("http://usr/") != -1)) {
	                MiniLoader.onDownLoadCallBack(url, thisLoader, 0);
	            }
	            else {
	                MiniFileMgr.downOtherFiles(tempurl, Laya.Handler.create(MiniLoader, MiniLoader.onDownLoadCallBack, [tempurl, thisLoader]), tempurl);
	            }
	        }
	    }
	    /**
	     * private
	     * @param sourceUrl
	     * @param errorCode
	     * @param tempFilePath
	     *
	     **/
	    static onDownLoadCallBack(sourceUrl, thisLoader, errorCode, tempFilePath = null) {
	        if (!errorCode) {
	            var fileNativeUrl;
	            if (MiniAdpter.autoCacheFile) {
	                if (!tempFilePath) {
	                    if (MiniFileMgr.isLocalNativeFile(sourceUrl)) {
	                        var tempStr = Laya.URL.rootPath != "" ? Laya.URL.rootPath : Laya.URL._basePath;
	                        var tempUrl = sourceUrl;
	                        if (tempStr != "" && (sourceUrl.indexOf("http://") != -1 || sourceUrl.indexOf("https://") != -1))
	                            fileNativeUrl = sourceUrl.split(tempStr)[1]; //去掉http头
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
	            //需要测试这个方式是否可行
	            var sound = (new Laya.SoundManager._soundClass());
	            sound.load(sourceUrl);
	            thisLoader.onLoaded(sound);
	        }
	        else {
	            thisLoader.event(Laya.Event.ERROR, "Load sound failed");
	        }
	    }
	    /**
	     * @private
	     * 给传入的函数绑定作用域，返回绑定后的函数。
	     * @param	fun 函数对象。
	     * @param	scope 函数作用域。
	     * @return 绑定后的函数。
	     */
	    static bindToThis(fun, scope) {
	        var rst = fun;
	        rst = fun.bind(scope);
	        return rst;
	    }
	    /**
	     * @private
	     */
	    _loadHttpRequestWhat(url, contentType) {
	        var thisLoader = this;
	        var encoding = MiniAdpter.getUrlEncode(url, contentType);
	        if (Laya.Loader.preLoadedMap[url])
	            thisLoader.onLoaded(Laya.Loader.preLoadedMap[url]);
	        else {
	            var tempurl = Laya.URL.formatURL(url);
	            if (url.indexOf("http://usr/") == -1 && (tempurl.indexOf("http://") != -1 || tempurl.indexOf("https://") != -1) && !MiniAdpter.AutoCacheDownFile) {
	                thisLoader._loadHttpRequest(tempurl, contentType, thisLoader, thisLoader.onLoaded, thisLoader, thisLoader.onProgress, thisLoader, thisLoader.onError);
	            }
	            else {
	                //调用微信加载文件接口承载加载
	                //读取本地磁盘非写入的文件，只是检测文件是否需要本地读取还是外围加载
	                var fileObj = MiniFileMgr.getFileInfo(Laya.URL.formatURL(url));
	                if (fileObj) {
	                    fileObj.encoding = fileObj.encoding == null ? "utf8" : fileObj.encoding;
	                    MiniFileMgr.readFile(fileObj.url, encoding, new Laya.Handler(MiniLoader, MiniLoader.onReadNativeCallBack, [url, contentType, thisLoader]), url);
	                }
	                else if (thisLoader.type == "image" || thisLoader.type == "htmlimage") {
	                    thisLoader._transformUrl(url, contentType);
	                }
	                else {
	                    if ((tempurl.indexOf("http://") == -1 && tempurl.indexOf("https://") == -1) || MiniFileMgr.isLocalNativeFile(url)) {
	                        MiniFileMgr.readFile(url, encoding, new Laya.Handler(MiniLoader, MiniLoader.onReadNativeCallBack, [url, contentType, thisLoader]), url);
	                    }
	                    else {
	                        MiniFileMgr.downFiles(tempurl, encoding, new Laya.Handler(MiniLoader, MiniLoader.onReadNativeCallBack, [url, contentType, thisLoader]), tempurl, true);
	                    }
	                }
	            }
	        }
	    }
	    /**
	     * @private
	     * @param url
	     * @param thisLoader
	     * @param errorCode
	     * @param data
	     *
	     */
	    static onReadNativeCallBack(url, type = null, thisLoader = null, errorCode = 0, data = null) {
	        if (!errorCode) {
	            //文本文件读取本地存在
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
	            //主域向子域派发数据
	            if (!MiniAdpter.isZiYu && MiniAdpter.isPosMsgYu && type != Laya.Loader.BUFFER) {
	                MiniAdpter.window.wx.postMessage({ url: url, data: tempData, isLoad: "filedata" });
	            }
	            thisLoader.onLoaded(tempData);
	        }
	        else if (errorCode == 1) {
	            //远端文件加载走xmlhttprequest
	            thisLoader._loadHttpRequest(url, type, thisLoader, thisLoader.onLoaded, thisLoader, thisLoader.onProgress, thisLoader, thisLoader.onError);
	        }
	    }
	    /**
	     * @private
	     * @param url
	     * @param type
	     * @param thisLoader
	     ***/
	    static _transformImgUrl(url, type, thisLoader) {
	        //这里要预处理磁盘文件的读取,带layanative目录标识的视为本地磁盘文件，不进行路径转换操作
	        if (MiniAdpter.isZiYu) {
	            thisLoader._loadImage(url); //直接读取本地文件，非加载缓存的图片
	            return;
	        }
	        if (!MiniFileMgr.getFileInfo(url)) {
	            var tempUrl = Laya.URL.formatURL(url);
	            if (url.indexOf('http://usr/') == -1 && (tempUrl.indexOf("http://") != -1 || tempUrl.indexOf("https://") != -1)) {
	                //小游戏在子域里不能远端加载图片资源
	                if (MiniAdpter.isZiYu) {
	                    thisLoader._loadImage(url); //直接读取本地文件，非加载缓存的图片
	                }
	                else {
	                    MiniFileMgr.downOtherFiles(tempUrl, new Laya.Handler(MiniLoader, MiniLoader.onDownImgCallBack, [url, thisLoader]), tempUrl);
	                }
	            }
	            else
	                thisLoader._loadImage(url); //直接读取本地文件，非加载缓存的图片
	        }
	        else {
	            thisLoader._loadImage(url); //外网图片加载
	        }
	    }
	    /**
	     * @private
	     * 下载图片文件回调处理
	     * @param sourceUrl 图片实际加载地址
	     * @param thisLoader 加载对象
	     * @param errorCode 回调状态码，0成功 1失败
	     * @param tempFilePath 加载返回的临时地址
	     */
	    static onDownImgCallBack(sourceUrl, thisLoader, errorCode, tempFilePath = "") {
	        if (!errorCode)
	            MiniLoader.onCreateImage(sourceUrl, thisLoader, false, tempFilePath);
	        else {
	            thisLoader.onError(null);
	        }
	    }
	    /**
	     * @private
	     * 创建图片对象
	     * @param sourceUrl
	     * @param thisLoader
	     * @param isLocal 本地图片(没有经过存储的,实际存在的图片，需要开发者自己管理更新)
	     * @param tempFilePath 加载的临时地址
	     */
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
	                //子域里需要读取主域透传过来的信息，然后这里获取一个本地磁盘图片路径，然后赋值给fileNativeUrl
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
	        //将url传递给引擎层
	        thisLoader._loadImage(fileNativeUrl);
	    }
	}

	/** @private **/
	class MiniLocalStorage {
	    constructor() {
	    }
	    static __init__() {
	        MiniLocalStorage.items = MiniLocalStorage;
	    }
	    /**
	     * 存储指定键名和键值，字符串类型。
	     * @param key 键名。
	     * @param value 键值。
	     */
	    static setItem(key, value) {
	        try {
	            MiniAdpter.window.wx.setStorageSync(key, value); //安卓系统 4.4.4有bug，临时采用异步设置缓存的方式
	        }
	        catch (error) {
	            MiniAdpter.window.wx.setStorage({
	                key: key,
	                data: value
	            });
	        }
	    }
	    /**
	     * 获取指定键名的值。
	     * @param key 键名。
	     * @return 字符串型值。
	     */
	    static getItem(key) {
	        return MiniAdpter.window.wx.getStorageSync(key);
	    }
	    /**
	     * 存储指定键名及其对应的 <code>Object</code> 类型值。
	     * @param key 键名。
	     * @param value 键值。是 <code>Object</code> 类型，此致会被转化为 JSON 字符串存储。
	     */
	    static setJSON(key, value) {
	        MiniLocalStorage.setItem(key, value);
	    }
	    /**
	     * 获取指定键名对应的 <code>Object</code> 类型值。
	     * @param key 键名。
	     * @return <code>Object</code> 类型值
	     */
	    static getJSON(key) {
	        return MiniLocalStorage.getItem(key);
	    }
	    /**
	     * 删除指定键名的信息。
	     * @param key 键名。
	     */
	    static removeItem(key) {
	        MiniAdpter.window.wx.removeStorageSync(key);
	    }
	    /**
	     * 清除本地存储信息。
	     */
	    static clear() {
	        MiniAdpter.window.wx.clearStorageSync();
	    }
	    /**同步获取当前storage的相关信息**/
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
	/**
	 * 表示是否支持  <code>LocalStorage</code>。
	 */
	MiniLocalStorage.support = true;

	class MiniAdpter {
	    /**@private **/
	    static getJson(data) {
	        return JSON.parse(data);
	    }
	    /**激活微信小游戏适配器*/
	    static enable() {
	        MiniAdpter.init(Laya.Laya.isWXPosMsg, Laya.Laya.isWXOpenDataContext);
	    }
	    /**
	     * 初始化回调
	     * @param isPosMsg 是否需要在主域中自动将加载的文本数据自动传递到子域，默认 false
	     * @param isSon 是否是子域，默认为false
	     */
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
	        //设置资源存储目录
	        if (!MiniAdpter.isZiYu) {
	            MiniFileMgr.setNativeFileDir("/layaairGame");
	            MiniFileMgr.existDir(MiniFileMgr.fileNativeDir, Laya.Handler.create(MiniAdpter, MiniAdpter.onMkdirCallBack));
	        }
	        MiniAdpter.systemInfo = MiniAdpter.window.wx.getSystemInfoSync();
	        MiniAdpter.window.focus = function () {
	        };
	        //清空路径设定
	        Laya.Laya['_getUrlPath'] = function () {
	            return "";
	        };
	        //add---xiaosong--snowgame
	        MiniAdpter.window.logtime = function (str) {
	        };
	        MiniAdpter.window.alertTimeLog = function (str) {
	        };
	        MiniAdpter.window.resetShareInfo = function () {
	        };
	        //适配Context中的to对象
	        MiniAdpter.window.CanvasRenderingContext2D = function () {
	        };
	        MiniAdpter.window.CanvasRenderingContext2D.prototype = MiniAdpter.window.wx.createCanvas().getContext('2d').__proto__;
	        //重写body的appendChild方法
	        MiniAdpter.window.document.body.appendChild = function () {
	        };
	        //获取手机的设备像素比
	        MiniAdpter.EnvConfig.pixelRatioInt = 0;
	        //			RunDriver.getPixelRatio = pixelRatio;
	        Laya.Browser["_pixelRatio"] = MiniAdpter.pixelRatio();
	        //适配HTMLCanvas中的Browser.createElement("canvas")
	        MiniAdpter._preCreateElement = Laya.Browser.createElement;
	        //获取小程序pixel值
	        Laya.Browser["createElement"] = MiniAdpter.createElement;
	        //适配RunDriver.createShaderCondition
	        Laya.RunDriver.createShaderCondition = MiniAdpter.createShaderCondition;
	        //适配XmlDom
	        Laya.Utils['parseXMLFromString'] = MiniAdpter.parseXMLFromString;
	        //文本输入框
	        Laya.Input['_createInputElement'] = MiniInput['_createInputElement'];
	        //修改文件加载
	        // MiniAdpter.EnvConfig.load = Loader.prototype.load;
	        //文件加载处理
	        // Loader.prototype.load = MiniLoader.prototype.load;
	        //修改图片加载
	        // Loader.prototype._loadImage = MiniImage.prototype._loadImage;
	        //新调整-xiaosong20190709
	        // MiniAdpter.EnvConfig.load = Loader.prototype._loadResourceFilter;
	        Laya.Loader.prototype._loadResourceFilter = MiniLoader.prototype._loadResourceFilter;
	        Laya.Loader.prototype._loadSound = MiniLoader.prototype._loadSound;
	        Laya.Loader.prototype._loadHttpRequestWhat = MiniLoader.prototype._loadHttpRequestWhat;
	        //本地缓存类
	        Laya.LocalStorage._baseClass = MiniLocalStorage;
	        MiniLocalStorage.__init__();
	        //			MiniVideo.__init__();
	        //			MiniAccelerator.__init__();
	        //			MiniLocation.__init__();
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
	                MiniFileMgr.ziyuFileData[data.url] = data.atlasdata; //图集配置数据
	                MiniFileMgr.ziyuFileTextureData[data.imgReadyUrl] = data.imgNativeUrl; //imgNativeUrl 为本地磁盘地址;imgReadyUrl为外网路径
	            }
	        }
	        else if (data['isLoad'] == "openJsondatacontext") {
	            if (data.url) {
	                MiniFileMgr.ziyuFileData[data.url] = data.atlasdata; //json配置数据信息
	            }
	        }
	        else if (data['isLoad'] == "openJsondatacontextPic") {
	            MiniFileMgr.ziyuFileTextureData[data.imgReadyUrl] = data.imgNativeUrl; //imgNativeUrl 为本地磁盘地址;imgReadyUrl为外网路径
	        }
	    }
	    /**
	     * 获取url对应的encoding值
	     * @param url 文件路径
	     * @param type 文件类型
	     * @return
	     */
	    static getUrlEncode(url, type) {
	        if (type == "arraybuffer")
	            return "";
	        return "utf8";
	    }
	    /**
	     * 下载文件
	     * @param fileUrl 文件地址(全路径)
	     * @param fileType 文件类型(image、text、json、xml、arraybuffer、sound、atlas、font)
	     * @param callBack 文件加载回调,回调内容[errorCode码(0成功,1失败,2加载进度)
	     * @param encoding 文件编码默认utf8，非图片文件加载需要设置相应的编码，二进制编码为空字符串
	     */
	    static downLoadFile(fileUrl, fileType = "", callBack = null, encoding = "utf8") {
	        var fileObj = MiniFileMgr.getFileInfo(fileUrl);
	        if (!fileObj)
	            MiniFileMgr.downLoadFile(fileUrl, fileType, callBack, encoding);
	        else {
	            callBack != null && callBack.runWith([0]);
	        }
	    }
	    /**
	     * 从本地删除文件
	     * @param fileUrl 文件地址(全路径)
	     * @param callBack 回调处理，在存储图片时用到
	     */
	    static remove(fileUrl, callBack = null) {
	        MiniFileMgr.deleteFile("", fileUrl, callBack, "", 0);
	    }
	    /**
	     * 清空缓存空间文件内容
	     */
	    static removeAll() {
	        MiniFileMgr.deleteAll();
	    }
	    /**
	     * 判断是否是4M包文件
	     * @param fileUrl 文件地址(全路径)
	     * @return
	     */
	    static hasNativeFile(fileUrl) {
	        return MiniFileMgr.isLocalNativeFile(fileUrl);
	    }
	    /**
	     * 判断缓存里是否存在文件
	     * @param fileUrl 文件地址(全路径)
	     * @return
	     */
	    static getFileInfo(fileUrl) {
	        return MiniFileMgr.getFileInfo(fileUrl);
	    }
	    /**
	     * 获取缓存文件列表
	     * @return
	     */
	    static getFileList() {
	        return MiniFileMgr.filesListObj;
	    }
	    /**@private 退出小游戏**/
	    static exitMiniProgram() {
	        MiniAdpter.window["wx"].exitMiniProgram();
	    }
	    /**@private **/
	    static onMkdirCallBack(errorCode, data) {
	        if (!errorCode)
	            MiniFileMgr.filesListObj = JSON.parse(data.data);
	        MiniFileMgr.fakeObj = MiniFileMgr.filesListObj;
	    }
	    /**@private 设备像素比。*/
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
	    /**@private **/
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
	    /**@private **/
	    static onCreateInput(type) {
	        var node = MiniAdpter._preCreateElement(type);
	        node.focus = MiniInput.wxinputFocus;
	        node.blur = MiniInput.wxinputblur;
	        node.style = {};
	        node.value = 0; //文本内容
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
	    /**@private **/
	    static createShaderCondition(conditionScript) {
	        var func = function () {
	            return this[conditionScript.replace("this.", "")];
	        };
	        return func;
	    }
	    /**
	     * 传递图集url地址到
	     * @param url 为绝对地址
	     */
	    static sendAtlasToOpenDataContext(url) {
	        if (!MiniAdpter.isZiYu) {
	            var atlasJson = Laya.Loader.getRes(Laya.URL.formatURL(url));
	            if (atlasJson) {
	                var textureArr = atlasJson.meta.image.split(",");
	                //构造加载图片信息
	                if (atlasJson.meta && atlasJson.meta.image) {
	                    //带图片信息的类型
	                    var toloadPics = atlasJson.meta.image.split(",");
	                    var split = url.indexOf("/") >= 0 ? "/" : "\\";
	                    var idx = url.lastIndexOf(split);
	                    var folderPath = idx >= 0 ? url.substr(0, idx + 1) : "";
	                    for (var i = 0, len = toloadPics.length; i < len; i++) {
	                        toloadPics[i] = folderPath + toloadPics[i];
	                    }
	                }
	                else {
	                    //不带图片信息
	                    toloadPics = [url.replace(".json", ".png")];
	                }
	                for (i = 0; i < toloadPics.length; i++) {
	                    var tempAtlasPngUrl = toloadPics[i];
	                    MiniAdpter.postInfoToContext(url, tempAtlasPngUrl, atlasJson);
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
	            fileNativeUrl = textureUrl; //4M包使用
	        }
	        if (fileNativeUrl) {
	            MiniAdpter.window.wx.postMessage({ url: url, atlasdata: postData, imgNativeUrl: fileNativeUrl, imgReadyUrl: textureUrl, isLoad: "opendatacontext" });
	        }
	        else {
	            throw "获取图集的磁盘url路径不存在！";
	        }
	    }
	    /**
	     * 发送单张图片到开放数据域
	     * @param url
	     */
	    static sendSinglePicToOpenDataContext(url) {
	        var tempTextureUrl = Laya.URL.formatURL(url);
	        var fileObj = MiniFileMgr.getFileInfo(tempTextureUrl);
	        if (fileObj) {
	            var fileMd5Name = fileObj.md5;
	            var fileNativeUrl = MiniFileMgr.getFileNativePath(fileMd5Name);
	            url = tempTextureUrl;
	        }
	        else {
	            fileNativeUrl = url; //4M包使用
	        }
	        if (fileNativeUrl) {
	            MiniAdpter.window.wx.postMessage({ url: url, imgNativeUrl: fileNativeUrl, imgReadyUrl: url, isLoad: "openJsondatacontextPic" });
	        }
	        else {
	            throw "获取图集的磁盘url路径不存在！";
	        }
	    }
	    /**
	     * 传递json配置数据到开放数据域
	     * @param url 为绝对地址
	     */
	    static sendJsonDataToDataContext(url) {
	        if (!MiniAdpter.isZiYu) {
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
	/**@private 适配库是否初始化**/
	MiniAdpter._inited = false;
	/**是否自动缓存下载的图片跟声音文件，默认为true**/
	MiniAdpter.autoCacheFile = true;
	/**50M缓存容量满时每次清理容量值,默认每次清理5M**/
	MiniAdpter.minClearSize = (5 * 1024 * 1024);
	/**本地资源列表**/
	MiniAdpter.nativefiles = ["layaNativeDir", "wxlocal"];
	/**本地分包资源表**/
	MiniAdpter.subNativeFiles = [];
	/**本地分包文件目录数组**/
	MiniAdpter.subNativeheads = [];
	/**本地分包文件目录映射表**/
	MiniAdpter.subMaps = [];
	/**@private 是否自动缓存非图片声音文件(这里要确保文件编码最好一致)**/
	MiniAdpter.AutoCacheDownFile = false;
	/**
	 * @private
	 * 将字符串解析成 XML 对象。
	 * @param value 需要解析的字符串。
	 * @return js原生的XML对象。
	 */
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
	/**@private **/
	MiniAdpter.idx = 1;

	/**@private **/
	class MiniAccelerator extends Laya.EventDispatcher {
	    constructor() {
	        super();
	    }
	    /**@private **/
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
	    /**@private **/
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
	    /**@private **/
	    static stopListen() {
	        MiniAccelerator._isListening = false;
	        try {
	            MiniAdpter.window.wx.stopAccelerometer({});
	        }
	        catch (e) { }
	    }
	    /**@private **/
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
	    /**
	     * 侦听加速器运动。
	     * @param observer	回调函数接受4个参数，见类说明。
	     */
	    /*override*/ on(type, caller, listener, args = null) {
	        super.on(type, caller, listener, args);
	        MiniAccelerator.startListen(this["onDeviceOrientationChange"]);
	        return this;
	    }
	    /**
	     * 取消侦听加速器。
	     * @param	handle	侦听加速器所用处理器。
	     */
	    /*override*/ off(type, caller, listener, onceOnly = false) {
	        if (!this.hasListener(type))
	            MiniAccelerator.stopListen();
	        return super.off(type, caller, listener, onceOnly);
	    }
	}
	/**@private **/
	MiniAccelerator._isListening = false;

	/** @private **/
	class MiniImage {
	    /**@private **/
	    _loadImage(url) {
	        var thisLoader = this;
	        //这里要预处理磁盘文件的读取,带layanative目录标识的视为本地磁盘文件，不进行路径转换操作
	        if (MiniAdpter.isZiYu) {
	            MiniImage.onCreateImage(url, thisLoader, true); //直接读取本地文件，非加载缓存的图片
	            return;
	        }
	        var isTransformUrl;
	        //非本地文件处理
	        if (!MiniFileMgr.isLocalNativeFile(url)) {
	            isTransformUrl = true;
	            url = Laya.URL.formatURL(url);
	        }
	        else {
	            if (url.indexOf("http://usr/") == -1 && (url.indexOf("http://") != -1 || url.indexOf("https://") != -1)) {
	                if (MiniFileMgr.loadPath != "") {
	                    url = url.split(MiniFileMgr.loadPath)[1]; //去掉http头
	                }
	                else {
	                    var tempStr = Laya.URL.rootPath != "" ? Laya.URL.rootPath : Laya.URL._basePath;
	                    var tempUrl = url;
	                    if (tempStr != "")
	                        url = url.split(tempStr)[1]; //去掉http头
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
	            //判断当前的url是否为分包映射路径
	            if (MiniAdpter.subNativeFiles && url.indexOf("/") != -1) {
	                var curfileHead = url.split("/")[0] + "/"; //文件头
	                if (curfileHead && MiniAdpter.subNativeheads.indexOf(curfileHead) != -1) {
	                    var newfileHead = MiniAdpter.subMaps[curfileHead];
	                    url = url.replace(curfileHead, newfileHead);
	                }
	            }
	        }
	        if (!MiniFileMgr.getFileInfo(url)) {
	            if (url.indexOf('http://usr/') == -1 && (url.indexOf("http://") != -1 || url.indexOf("https://") != -1)) {
	                //小游戏在子域里不能远端加载图片资源
	                if (MiniAdpter.isZiYu) {
	                    MiniImage.onCreateImage(url, thisLoader, true); //直接读取本地文件，非加载缓存的图片
	                }
	                else {
	                    MiniFileMgr.downOtherFiles(url, new Laya.Handler(MiniImage, MiniImage.onDownImgCallBack, [url, thisLoader]), url);
	                }
	            }
	            else
	                MiniImage.onCreateImage(url, thisLoader, true); //直接读取本地文件，非加载缓存的图片
	        }
	        else {
	            MiniImage.onCreateImage(url, thisLoader, !isTransformUrl); //外网图片加载
	        }
	    }
	    /**
	     * @private
	     * 下载图片文件回调处理
	     * @param sourceUrl 图片实际加载地址
	     * @param thisLoader 加载对象
	     * @param errorCode 回调状态码，0成功 1失败
	     * @param tempFilePath 加载返回的临时地址
	     */
	    static onDownImgCallBack(sourceUrl, thisLoader, errorCode, tempFilePath = "") {
	        if (!errorCode)
	            MiniImage.onCreateImage(sourceUrl, thisLoader, false, tempFilePath);
	        else {
	            thisLoader.onError(null);
	        }
	    }
	    /**
	     * @private
	     * 创建图片对象
	     * @param sourceUrl
	     * @param thisLoader
	     * @param isLocal 本地图片(没有经过存储的,实际存在的图片，需要开发者自己管理更新)
	     * @param tempFilePath 加载的临时地址
	     */
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
	                //子域里需要读取主域透传过来的信息，然后这里获取一个本地磁盘图片路径，然后赋值给fileNativeUrl
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
	        //sourceUrl = URL.formatURL(url);
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
	            thisLoader.event(Laya.Event.ERROR, "Load image failed");
	        };
	        if (thisLoader._type == "nativeimage") {
	            var onload = function () {
	                clear();
	                //xiaosong20190301
	                //thisLoader._url = URL.formatURL(thisLoader._url);
	                thisLoader.onLoaded(image);
	            };
	            image = new Laya.Browser.window.Image();
	            image.crossOrigin = "";
	            image.onload = onload;
	            image.onerror = onerror;
	            image.src = fileNativeUrl;
	            //增加引用，防止垃圾回收
	            thisLoader._imgCache[fileNativeUrl] = image;
	        }
	        else {
	            var imageSource = new Laya.Browser.window.Image();
	            onload = function () {
	                //xiaosong20190301
	                //thisLoader._url = URL.formatURL(thisLoader._url);
	                image = Laya.HTMLImage.create(imageSource.width, imageSource.height);
	                image.loadImageSource(imageSource, true);
	                image._setCreateURL(fileNativeUrl);
	                //					image._setUrl(fileNativeUrl);
	                clear();
	                thisLoader.onLoaded(image);
	            };
	            imageSource.crossOrigin = "";
	            imageSource.onload = onload;
	            imageSource.onerror = onerror;
	            imageSource.src = fileNativeUrl;
	            thisLoader._imgCache[fileNativeUrl] = imageSource; //增加引用，防止垃圾回收
	        }
	    }
	}

	/**@private **/
	class MiniLocation {
	    constructor() {
	    }
	    /**@private **/
	    static __init__() {
	        MiniAdpter.window.navigator.geolocation.getCurrentPosition = MiniLocation.getCurrentPosition;
	        MiniAdpter.window.navigator.geolocation.watchPosition = MiniLocation.watchPosition;
	        MiniAdpter.window.navigator.geolocation.clearWatch = MiniLocation.clearWatch;
	    }
	    /**@private **/
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
	    /**@private **/
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
	    /**@private **/
	    static clearWatch(id) {
	        delete MiniLocation._watchDic[id];
	        if (!MiniLocation._hasWatch()) {
	            Laya.Laya.systemTimer.clear(null, MiniLocation._myLoop);
	        }
	    }
	    /**@private **/
	    static _hasWatch() {
	        var key;
	        for (key in MiniLocation._watchDic) {
	            if (MiniLocation._watchDic[key])
	                return true;
	        }
	        return false;
	    }
	    /**@private **/
	    static _myLoop() {
	        MiniLocation.getCurrentPosition(MiniLocation._mySuccess, MiniLocation._myError);
	    }
	    /**@private **/
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
	    /**@private **/
	    static _myError(res) {
	        var key;
	        for (key in MiniLocation._watchDic) {
	            if (MiniLocation._watchDic[key].error) {
	                MiniLocation._watchDic[key].error(res);
	            }
	        }
	    }
	}
	/**@private **/
	MiniLocation._watchDic = {};
	/**@private **/
	MiniLocation._curID = 0;

	/**
	     * 视频类
	     * @author xiaosong
	     * @date -2019-04-22
	     */
	class MiniVideo {
	    constructor(width = 320, height = 240) {
	        /**视频是否播放结束**/
	        this.videoend = false;
	        this.videourl = "";
	        this.videoElement = MiniAdpter.window.wx.createVideo({ width: width, height: height, autoplay: true });
	    }
	    static __init__() {
	        //Video = MiniVideo;
	    }
	    on(eventType, ths, callBack) {
	        if (eventType == "loadedmetadata") {
	            //加载完毕
	            this.onPlayFunc = callBack.bind(ths);
	            this.videoElement.onPlay = this.onPlayFunction.bind(this);
	        }
	        else if (eventType == "ended") {
	            //播放完毕
	            this.onEndedFunC = callBack.bind(ths);
	            this.videoElement.onEnded = this.onEndedFunction.bind(this);
	        }
	        this.videoElement.onTimeUpdate = this.onTimeUpdateFunc.bind(this);
	    }
	    onTimeUpdateFunc(data) {
	        this.position = data.position;
	        this._duration = data.duration;
	    }
	    /**
	     * 获取视频长度（秒）。ready事件触发后可用。
	     */
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
	            //加载完毕
	            this.onPlayFunc = callBack.bind(ths);
	            this.videoElement.offPlay = this.onPlayFunction.bind(this);
	        }
	        else if (eventType == "ended") {
	            //播放完毕
	            this.onEndedFunC = callBack.bind(ths);
	            this.videoElement.offEnded = this.onEndedFunction.bind(this);
	        }
	    }
	    /**
	     * 设置播放源。
	     * @param url	播放源路径。
	     */
	    load(url) {
	        if (!this.videoElement)
	            return;
	        this.videoElement.src = url;
	    }
	    /**
	     * 开始播放视频。
	     */
	    play() {
	        if (!this.videoElement)
	            return;
	        this.videoend = false;
	        this.videoElement.play();
	    }
	    /**
	     * 暂停视频播放。
	     */
	    pause() {
	        if (!this.videoElement)
	            return;
	        this.videoend = true;
	        this.videoElement.pause();
	    }
	    /**
	     * 设置和获取当前播放头位置。
	     */
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
	    /**
	     * 获取视频源尺寸。ready事件触发后可用。
	     */
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
	    /**
	     * 返回音频/视频的播放是否已结束
	     */
	    get ended() {
	        return this.videoend;
	    }
	    /**
	     * 设置或返回音频/视频是否应在结束时重新播放。
	     */
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
	        if (!this.videoElement)
	            return 0;
	        return this.videoElement.playbackRate;
	    }
	    set playbackRate(value) {
	        if (!this.videoElement)
	            return;
	        this.videoElement.playbackRate = value;
	    }
	    /**
	     * 获取和设置静音状态。
	     */
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
	    /**
	     * 返回视频是否暂停
	     */
	    get paused() {
	        if (!this.videoElement)
	            return false;
	        return this.videoElement.paused;
	    }
	    /**
	     * 设置大小
	     * @param width
	     * @param height
	     */
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
	    /**
	     * 获取当前播放源路径。
	     */
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
	    /**
	     * 重新加载视频。
	     */
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
