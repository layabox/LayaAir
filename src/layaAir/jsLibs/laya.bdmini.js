
window=window||global;if(!window.layalib){window.layalib=function(f,i){(window._layalibs || (window._layalibs=[])).push({f:f,i:i});}}
window.layalib(function(window,document,Laya){
	var __un=Laya.un,__uns=Laya.uns,__static=Laya.static,__class=Laya.class,__getset=Laya.getset,__newvec=Laya.__newvec;

	var Browser=laya.utils.Browser,Event=laya.events.Event,EventDispatcher=laya.events.EventDispatcher;
	var HTMLImage=laya.resource.HTMLImage,Handler=laya.utils.Handler,Input=laya.display.Input,Loader=laya.net.Loader;
	var LocalStorage=laya.net.LocalStorage,Matrix=laya.maths.Matrix,Render=laya.renders.Render,RunDriver=laya.utils.RunDriver;
	var SoundChannel=laya.media.SoundChannel,SoundManager=laya.media.SoundManager,URL=laya.net.URL,Utils=laya.utils.Utils;
/**@private **/
//class laya.bd.mini.MiniLocalStorage
var MiniLocalStorage$1=(function(){
	function MiniLocalStorage(){}
	__class(MiniLocalStorage,'laya.bd.mini.MiniLocalStorage',null,'MiniLocalStorage$1');
	MiniLocalStorage.__init__=function(){
		MiniLocalStorage.items=MiniLocalStorage;
	}

	MiniLocalStorage.setItem=function(key,value){
		BMiniAdapter.window.swan.setStorageSync(key,value);
	}

	MiniLocalStorage.getItem=function(key){
		return BMiniAdapter.window.swan.getStorageSync(key);
	}

	MiniLocalStorage.setJSON=function(key,value){
		MiniLocalStorage.setItem(key,value);
	}

	MiniLocalStorage.getJSON=function(key){
		return MiniLocalStorage.getItem(key);
	}

	MiniLocalStorage.removeItem=function(key){
		BMiniAdapter.window.swan.removeStorageSync(key);
	}

	MiniLocalStorage.clear=function(){
		BMiniAdapter.window.swan.clearStorageSync();
	}

	MiniLocalStorage.getStorageInfoSync=function(){
		try {
			var res=BMiniAdapter.window.swan.getStorageInfoSync();
			console.log(res.keys)
			console.log(res.currentSize)
			console.log(res.limitSize)
			return res;
		}catch (e){}
		return null;
	}

	MiniLocalStorage.support=true;
	MiniLocalStorage.items=null;
	return MiniLocalStorage;
})()


//class laya.bd.mini.BMiniAdapter
var BMiniAdapter=(function(){
	function BMiniAdapter(){}
	__class(BMiniAdapter,'laya.bd.mini.BMiniAdapter');
	BMiniAdapter.getJson=function(data){
		return JSON.parse(data);
	}

	BMiniAdapter.enable=function(){
		BMiniAdapter.init();
	}

	BMiniAdapter.init=function(isPosMsg,isSon){
		(isPosMsg===void 0)&& (isPosMsg=false);
		(isSon===void 0)&& (isSon=false);
		if (BMiniAdapter._inited)return;
		BMiniAdapter._inited=true;
		BMiniAdapter.window=/*__JS__ */window;
		if(BMiniAdapter.window.navigator.userAgent.indexOf('SwanGame')<0)return;
		BMiniAdapter.isZiYu=isSon;
		BMiniAdapter.isPosMsgYu=isPosMsg;
		BMiniAdapter.EnvConfig={};
		if(!BMiniAdapter.isZiYu){
			MiniFileMgr$1.setNativeFileDir("/layaairGame");
			MiniFileMgr$1.existDir(MiniFileMgr$1.fileNativeDir,Handler.create(BMiniAdapter,BMiniAdapter.onMkdirCallBack));
		}
		BMiniAdapter.systemInfo=laya.bd.mini.BMiniAdapter.window.swan.getSystemInfoSync();
		BMiniAdapter.window.focus=function (){
		};
		Laya['_getUrlPath']=function (){
			return "";
		};
		BMiniAdapter.window.logtime=function (str){
		};
		BMiniAdapter.window.alertTimeLog=function (str){
		};
		BMiniAdapter.window.resetShareInfo=function (){
		};
		BMiniAdapter.window.CanvasRenderingContext2D=function (){
		};
		BMiniAdapter.window.CanvasRenderingContext2D.prototype=laya.bd.mini.BMiniAdapter.window.swan.createCanvas().getContext('2d').__proto__;
		BMiniAdapter.window.document.body.appendChild=function (){
		};
		BMiniAdapter.EnvConfig.pixelRatioInt=0;
		Browser["_pixelRatio"]=BMiniAdapter.pixelRatio();
		BMiniAdapter._preCreateElement=Browser.createElement;
		Browser["createElement"]=BMiniAdapter.createElement;
		RunDriver.createShaderCondition=BMiniAdapter.createShaderCondition;
		Utils['parseXMLFromString']=BMiniAdapter.parseXMLFromString;
		Input['_createInputElement']=MiniInput$1['_createInputElement'];
		BMiniAdapter.EnvConfig.load=Loader.prototype.load;
		Loader.prototype.load=MiniLoader$1.prototype.load;
		Loader.prototype._loadImage=MiniImage$1.prototype._loadImage;
		MiniLocalStorage$1.__init__();
		LocalStorage._baseClass=MiniLocalStorage$1;
	}

	BMiniAdapter.getUrlEncode=function(url,type){
		if(type=="arraybuffer")
			return "";
		return "utf8";
	}

	BMiniAdapter.downLoadFile=function(fileUrl,fileType,callBack,encoding){
		(fileType===void 0)&& (fileType="");
		(encoding===void 0)&& (encoding="utf8");
		var fileObj=MiniFileMgr$1.getFileInfo(fileUrl);
		if(!fileObj)
			MiniFileMgr$1.downLoadFile(fileUrl,fileType,callBack,encoding);
		else{
			callBack !=null && callBack.runWith([0]);
		}
	}

	BMiniAdapter.remove=function(fileUrl,callBack){
		MiniFileMgr$1.deleteFile("",fileUrl,callBack,"",0);
	}

	BMiniAdapter.removeAll=function(){
		MiniFileMgr$1.deleteAll();
	}

	BMiniAdapter.hasNativeFile=function(fileUrl){
		return MiniFileMgr$1.isLocalNativeFile(fileUrl);
	}

	BMiniAdapter.getFileInfo=function(fileUrl){
		return MiniFileMgr$1.getFileInfo(fileUrl);
	}

	BMiniAdapter.getFileList=function(){
		return MiniFileMgr$1.filesListObj;
	}

	BMiniAdapter.exitMiniProgram=function(){
		laya.bd.mini.BMiniAdapter.window.swan.exitMiniProgram();
	}

	BMiniAdapter.onMkdirCallBack=function(errorCode,data){
		if (!errorCode)
			MiniFileMgr$1.filesListObj=JSON.parse(data.data);
	}

	BMiniAdapter.pixelRatio=function(){
		if (!BMiniAdapter.EnvConfig.pixelRatioInt){
			try {
				BMiniAdapter.EnvConfig.pixelRatioInt=BMiniAdapter.systemInfo.pixelRatio;
				return BMiniAdapter.systemInfo.pixelRatio;
			}catch (error){}
		}
		return BMiniAdapter.EnvConfig.pixelRatioInt;
	}

	BMiniAdapter.createElement=function(type){
		if (type=="canvas"){
			var _source;
			if (BMiniAdapter.idx==1){
				if(BMiniAdapter.isZiYu){
					_source=/*__JS__ */sharedCanvas;
					_source.style={};
					}else{
					_source=/*__JS__ */window.canvas;
				}
				}else {
				_source=laya.bd.mini.BMiniAdapter.window.swan.createCanvas();
			}
			BMiniAdapter.idx++;
			return _source;
			}else if (type=="textarea" || type=="input"){
			return BMiniAdapter.onCreateInput(type);
			}else if (type=="div"){
			var node=BMiniAdapter._preCreateElement(type);
			node.contains=function (value){
				return null
			};
			node.removeChild=function (value){
			};
			return node;
			}else {
			return BMiniAdapter._preCreateElement(type);
		}
	}

	BMiniAdapter.onCreateInput=function(type){
		var node=BMiniAdapter._preCreateElement(type);
		node.focus=MiniInput$1.wxinputFocus;
		node.blur=MiniInput$1.wxinputblur;
		node.style={};
		node.value=0;
		node.parentElement={};
		node.placeholder={};
		node.type={};
		node.setColor=function (value){
		};
		node.setType=function (value){
		};
		node.setFontFace=function (value){
		};
		node.addEventListener=function (value){
		};
		node.contains=function (value){
			return null
		};
		node.removeChild=function (value){
		};
		return node;
	}

	BMiniAdapter.createShaderCondition=function(conditionScript){
		var _$this=this;
		var func=function (){
			var abc=conditionScript;
			return _$this[conditionScript.replace("this.","")];
		}
		return func;
	}

	BMiniAdapter.EnvConfig=null;
	BMiniAdapter.window=null;
	BMiniAdapter._preCreateElement=null;
	BMiniAdapter._inited=false;
	BMiniAdapter.systemInfo=null;
	BMiniAdapter.isZiYu=false;
	BMiniAdapter.isPosMsgYu=false;
	BMiniAdapter.autoCacheFile=true;
	BMiniAdapter.minClearSize=(5 *1024 *1024);
	BMiniAdapter.subNativeFiles=null;
	BMiniAdapter.subNativeheads=[];
	BMiniAdapter.subMaps=[];
	BMiniAdapter.AutoCacheDownFile=false;
	BMiniAdapter.parseXMLFromString=function(value){
		var rst;
		var Parser;
		value=value.replace(/>\s+</g,'><');
		try {
			/*__JS__ */rst=(new window.Parser.DOMParser()).parseFromString(value,'text/xml');
			}catch (error){
			throw "需要引入xml解析库文件";
		}
		return rst;
	}

	BMiniAdapter.idx=1;
	__static(BMiniAdapter,
	['nativefiles',function(){return this.nativefiles=["layaNativeDir","wxlocal"];}
	]);
	return BMiniAdapter;
})()


/**@private **/
//class laya.bd.mini.MiniLocation
var MiniLocation$1=(function(){
	function MiniLocation(){}
	__class(MiniLocation,'laya.bd.mini.MiniLocation',null,'MiniLocation$1');
	MiniLocation.__init__=function(){
		BMiniAdapter.window.navigator.geolocation.getCurrentPosition=MiniLocation.getCurrentPosition;
		BMiniAdapter.window.navigator.geolocation.watchPosition=MiniLocation.watchPosition;
		BMiniAdapter.window.navigator.geolocation.clearWatch=MiniLocation.clearWatch;
	}

	MiniLocation.getCurrentPosition=function(success,error,options){
		var paramO;
		paramO={};
		paramO.success=getSuccess;
		paramO.fail=error;
		BMiniAdapter.window.swan.getLocation(paramO);
		function getSuccess (res){
			if (success !=null){
				success(res);
			}
		}
	}

	MiniLocation.watchPosition=function(success,error,options){
		MiniLocation._curID++;
		var curWatchO;
		curWatchO={};
		curWatchO.success=success;
		curWatchO.error=error;
		MiniLocation._watchDic[MiniLocation._curID]=curWatchO;
		Laya.systemTimer.loop(1000,null,MiniLocation._myLoop);
		return MiniLocation._curID;
	}

	MiniLocation.clearWatch=function(id){
		delete MiniLocation._watchDic[id];
		if (!MiniLocation._hasWatch()){
			Laya.systemTimer.clear(null,MiniLocation._myLoop);
		}
	}

	MiniLocation._hasWatch=function(){
		var key;
		for (key in MiniLocation._watchDic){
			if (MiniLocation._watchDic[key])return true;
		}
		return false;
	}

	MiniLocation._myLoop=function(){
		MiniLocation.getCurrentPosition(MiniLocation._mySuccess,MiniLocation._myError);
	}

	MiniLocation._mySuccess=function(res){
		var rst={};
		rst.coords=res;
		rst.timestamp=Browser.now();
		var key;
		for (key in MiniLocation._watchDic){
			if (MiniLocation._watchDic[key].success){
				MiniLocation._watchDic[key].success(rst);
			}
		}
	}

	MiniLocation._myError=function(res){
		var key;
		for (key in MiniLocation._watchDic){
			if (MiniLocation._watchDic[key].error){
				MiniLocation._watchDic[key].error(res);
			}
		}
	}

	MiniLocation._watchDic={};
	MiniLocation._curID=0;
	return MiniLocation;
})()


/**@private **/
//class laya.bd.mini.MiniImage
var MiniImage$1=(function(){
	function MiniImage(){}
	__class(MiniImage,'laya.bd.mini.MiniImage',null,'MiniImage$1');
	var __proto=MiniImage.prototype;
	/**@private **/
	__proto._loadImage=function(url){
		var thisLoader=this;
		if (BMiniAdapter.isZiYu){
			MiniImage.onCreateImage(url,thisLoader,true);
			return;
		};
		var isTransformUrl=false;
		if (!MiniFileMgr$1.isLocalNativeFile(url)){
			isTransformUrl=true;
			url=URL.formatURL(url);
			}else{
			if (url.indexOf("http://usr/")==-1&&(url.indexOf("http://")!=-1 || url.indexOf("https://")!=-1)){
				if(MiniFileMgr$1.loadPath !=""){
					url=url.split(MiniFileMgr$1.loadPath)[1];
					}else{
					var tempStr=URL.rootPath !="" ? URL.rootPath :URL.basePath;
					var tempUrl=url;
					if(tempStr !="")
						url=url.split(tempStr)[1];
					if(!url){
						url=tempUrl;
					}
				}
			}
			if (BMiniAdapter.subNativeFiles && BMiniAdapter.subNativeheads.length==0){
				for (var key in BMiniAdapter.subNativeFiles){
					var tempArr=BMiniAdapter.subNativeFiles[key];
					BMiniAdapter.subNativeheads=BMiniAdapter.subNativeheads.concat(tempArr);
					for (var aa=0;aa < tempArr.length;aa++){
						BMiniAdapter.subMaps[tempArr[aa]]=key+"/"+tempArr[aa];
					}
				}
			}
			if(BMiniAdapter.subNativeFiles && url.indexOf("/")!=-1){
				debugger;
				var curfileHead=url.split("/")[0]+"/";
				if(curfileHead && BMiniAdapter.subNativeheads.indexOf(curfileHead)!=-1){
					var newfileHead=BMiniAdapter.subMaps[curfileHead];
					url=url.replace(curfileHead,newfileHead);
				}
			}
		}
		if (!MiniFileMgr$1.getFileInfo(url)){
			if (url.indexOf('http://usr/')==-1&&(url.indexOf("http://")!=-1 || url.indexOf("https://")!=-1)){
				if(BMiniAdapter.isZiYu){
					MiniImage.onCreateImage(url,thisLoader,true);
					}else{
					MiniFileMgr$1.downOtherFiles(url,new Handler(MiniImage,MiniImage.onDownImgCallBack,[url,thisLoader]),url);
				}
			}
			else
			MiniImage.onCreateImage(url,thisLoader,true);
			}else {
			MiniImage.onCreateImage(url,thisLoader,!isTransformUrl);
		}
	}

	MiniImage.onDownImgCallBack=function(sourceUrl,thisLoader,errorCode,tempFilePath){
		(tempFilePath===void 0)&& (tempFilePath="");
		if (!errorCode)
			MiniImage.onCreateImage(sourceUrl,thisLoader,false,tempFilePath);
		else {
			thisLoader.onError(null);
		}
	}

	MiniImage.onCreateImage=function(sourceUrl,thisLoader,isLocal,tempFilePath){
		(isLocal===void 0)&& (isLocal=false);
		(tempFilePath===void 0)&& (tempFilePath="");
		var fileNativeUrl;
		if(BMiniAdapter.autoCacheFile){
			if (!isLocal){
				if(tempFilePath !=""){
					fileNativeUrl=tempFilePath;
					}else{
					var fileObj=MiniFileMgr$1.getFileInfo(sourceUrl);
					var fileMd5Name=fileObj.md5;
					fileNativeUrl=MiniFileMgr$1.getFileNativePath(fileMd5Name);
				}
			}else
			fileNativeUrl=sourceUrl;
			}else{
			if(!isLocal)
				fileNativeUrl=tempFilePath;
			else
			fileNativeUrl=sourceUrl;
		}
		if (thisLoader._imgCache==null)
			thisLoader._imgCache={};
		var image;
		function clear (){
			var img=thisLoader._imgCache[fileNativeUrl];
			if (img){
				img.onload=null;
				img.onerror=null;
				delete thisLoader._imgCache[fileNativeUrl];
			}
		};
		var onerror=function (){
			clear();
			thisLoader.event(/*laya.events.Event.ERROR*/"error","Load image failed");
		}
		if (thisLoader._type=="nativeimage"){
			var onload=function (){
				clear();
				thisLoader.onLoaded(image);
			};
			image=new Browser.window.Image();
			image.crossOrigin="";
			image.onload=onload;
			image.onerror=onerror;
			image.src=fileNativeUrl;
			thisLoader._imgCache[fileNativeUrl]=image;
			}else {
			var imageSource=new Browser.window.Image();
			onload=function (){
				image=HTMLImage.create(imageSource.width,imageSource.height);
				image.loadImageSource(imageSource,true);
				image._setCreateURL(fileNativeUrl);
				clear();
				thisLoader.onLoaded(image);
			};
			imageSource.crossOrigin="";
			imageSource.onload=onload;
			imageSource.onerror=onerror;
			imageSource.src=fileNativeUrl;
			thisLoader._imgCache[fileNativeUrl]=imageSource;
		}
	}

	return MiniImage;
})()


/**@private **/
//class laya.bd.mini.MiniInput
var MiniInput$1=(function(){
	function MiniInput(){}
	__class(MiniInput,'laya.bd.mini.MiniInput',null,'MiniInput$1');
	MiniInput._createInputElement=function(){
		Input['_initInput'](Input['area']=Browser.createElement("textarea"));
		Input['_initInput'](Input['input']=Browser.createElement("input"));
		Input['inputContainer']=Browser.createElement("div");
		Input['inputContainer'].style.position="absolute";
		Input['inputContainer'].style.zIndex=1E5;
		Browser.container.appendChild(Input['inputContainer']);
		Input['inputContainer'].setPos=function (x,y){Input['inputContainer'].style.left=x+'px';Input['inputContainer'].style.top=y+'px';};
		Laya.stage.on("resize",null,MiniInput._onStageResize);
		BMiniAdapter.window.swan.onWindowResize && BMiniAdapter.window.swan.onWindowResize(function(res){
			/*__JS__ */window.dispatchEvent && /*__JS__ */window.dispatchEvent("resize");
		});
		SoundManager._soundClass=MiniSound$1;
		SoundManager._musicClass=MiniSound$1;
		var model=BMiniAdapter.systemInfo.model;
		var system=BMiniAdapter.systemInfo.system;
		if(model.indexOf("iPhone")!=-1){
			Browser.onIPhone=true;
			Browser.onIOS=true;
			Browser.onIPad=true;
			Browser.onAndroid=false;
		}
		if(system.indexOf("Android")!=-1 || system.indexOf("Adr")!=-1){
			Browser.onAndroid=true;
			Browser.onIPhone=false;
			Browser.onIOS=false;
			Browser.onIPad=false;
		}
	}

	MiniInput._onStageResize=function(){
		var ts=Laya.stage._canvasTransform.identity();
		ts.scale((Browser.width / Render.canvas.width / Browser.pixelRatio),Browser.height / Render.canvas.height / Browser.pixelRatio);
	}

	MiniInput.wxinputFocus=function(e){
		var _inputTarget=Input['inputElement'].target;
		if (_inputTarget && !_inputTarget.editable){
			return;
		}
		BMiniAdapter.window.swan.offKeyboardConfirm();
		BMiniAdapter.window.swan.offKeyboardInput();
		BMiniAdapter.window.swan.showKeyboard({defaultValue:_inputTarget.text,maxLength:_inputTarget.maxChars,multiple:_inputTarget.multiline,confirmHold:true,confirmType:'done',success:function (res){
				},fail:function (res){
		}});
		BMiniAdapter.window.swan.onKeyboardConfirm(function(res){
			var str=res ? res.value :"";
			if (_inputTarget._restrictPattern){
				str=str.replace(/\u2006|\x27/g,"");
				if (_inputTarget._restrictPattern.test(str)){
					str=str.replace(_inputTarget._restrictPattern,"");
				}
			}
			_inputTarget.text=str;
			_inputTarget.event(/*laya.events.Event.INPUT*/"input");
			laya.bd.mini.MiniInput.inputEnter();
		})
		BMiniAdapter.window.swan.onKeyboardInput(function(res){
			var str=res ? res.value :"";
			if (!_inputTarget.multiline){
				if (str.indexOf("\n")!=-1){
					laya.bd.mini.MiniInput.inputEnter();
					return;
				}
			}
			if (_inputTarget._restrictPattern){
				str=str.replace(/\u2006|\x27/g,"");
				if (_inputTarget._restrictPattern.test(str)){
					str=str.replace(_inputTarget._restrictPattern,"");
				}
			}
			_inputTarget.text=str;
			_inputTarget.event(/*laya.events.Event.INPUT*/"input");
		});
	}

	MiniInput.inputEnter=function(){
		Input['inputElement'].target.focus=false;
	}

	MiniInput.wxinputblur=function(){
		MiniInput.hideKeyboard();
	}

	MiniInput.hideKeyboard=function(){
		BMiniAdapter.window.swan.offKeyboardConfirm();
		BMiniAdapter.window.swan.offKeyboardInput();
		BMiniAdapter.window.swan.hideKeyboard({success:function (res){
				console.log('隐藏键盘')
				},fail:function (res){
				console.log("隐藏键盘出错:"+(res ? res.errMsg :""));
		}});
	}

	return MiniInput;
})()


/**@private **/
//class laya.bd.mini.MiniFileMgr
var MiniFileMgr$1=(function(){
	function MiniFileMgr(){}
	__class(MiniFileMgr,'laya.bd.mini.MiniFileMgr',null,'MiniFileMgr$1');
	MiniFileMgr.isLocalNativeFile=function(url){
		for(var i=0,sz=BMiniAdapter.nativefiles.length;i<sz;i++){
			if(url.indexOf(BMiniAdapter.nativefiles[i])!=-1)
				return true;
		}
		return false;
	}

	MiniFileMgr.getFileInfo=function(fileUrl){
		var fileNativePath=fileUrl;
		var fileObj=MiniFileMgr.filesListObj[fileNativePath];
		if (fileObj==null)
			return null;
		else
		return fileObj;
		return null;
	}

	MiniFileMgr.read=function(filePath,encoding,callBack,readyUrl,isSaveFile,fileType){
		(encoding===void 0)&& (encoding="ascill");
		(readyUrl===void 0)&& (readyUrl="");
		(isSaveFile===void 0)&& (isSaveFile=false);
		(fileType===void 0)&& (fileType="");
		var fileUrl;
		if(readyUrl!="" && (readyUrl.indexOf("http://")!=-1 || readyUrl.indexOf("https://")!=-1)){
			fileUrl=MiniFileMgr.getFileNativePath(filePath)
			}else{
			fileUrl=filePath;
		}
		fileUrl=URL.getAdptedFilePath(fileUrl);
		MiniFileMgr.fs.readFile({filePath:fileUrl,encoding:encoding,success:function (data){
				callBack !=null && callBack.runWith([0,data]);
				},fail:function (data){
				if (data && readyUrl !="")
					MiniFileMgr.downFiles(readyUrl,encoding,callBack,readyUrl,isSaveFile,fileType);
				else
				callBack !=null && callBack.runWith([1]);
		}});
	}

	MiniFileMgr.downFiles=function(fileUrl,encoding,callBack,readyUrl,isSaveFile,fileType,isAutoClear){
		(encoding===void 0)&& (encoding="ascii");
		(readyUrl===void 0)&& (readyUrl="");
		(isSaveFile===void 0)&& (isSaveFile=false);
		(fileType===void 0)&& (fileType="");
		(isAutoClear===void 0)&& (isAutoClear=true);
		var downloadTask=MiniFileMgr.wxdown({url:fileUrl,success:function (data){
				if (data.statusCode===200)
					MiniFileMgr.readFile(data.tempFilePath,encoding,callBack,readyUrl,isSaveFile,fileType,isAutoClear);
				else{
					if(data.statusCode===403){
						callBack !=null && callBack.runWith([0,fileUrl]);
						}else{
						callBack !=null && callBack.runWith([1,data]);
					}
				}
				},fail:function (data){
				callBack !=null && callBack.runWith([1,data]);
		}});
		downloadTask.onProgressUpdate(function(data){
			callBack !=null && callBack.runWith([2,data.progress]);
		});
	}

	MiniFileMgr.readFile=function(filePath,encoding,callBack,readyUrl,isSaveFile,fileType,isAutoClear){
		(encoding===void 0)&& (encoding="ascill");
		(readyUrl===void 0)&& (readyUrl="");
		(isSaveFile===void 0)&& (isSaveFile=false);
		(fileType===void 0)&& (fileType="");
		(isAutoClear===void 0)&& (isAutoClear=true);
		filePath=URL.getAdptedFilePath(filePath);
		MiniFileMgr.fs.readFile({filePath:filePath,encoding:encoding,success:function (data){
				if (filePath.indexOf("http://")!=-1 || filePath.indexOf("https://")!=-1){
					if(BMiniAdapter.autoCacheFile || isSaveFile){
						MiniFileMgr.copyFile(filePath,readyUrl,callBack,encoding,isAutoClear);
					}
				}
				else
				callBack !=null && callBack.runWith([0,data]);
				},fail:function (data){
				if (data)
					callBack !=null && callBack.runWith([1,data]);
		}});
	}

	MiniFileMgr.downOtherFiles=function(fileUrl,callBack,readyUrl,isSaveFile,isAutoClear){
		(readyUrl===void 0)&& (readyUrl="");
		(isSaveFile===void 0)&& (isSaveFile=false);
		(isAutoClear===void 0)&& (isAutoClear=true);
		MiniFileMgr.wxdown({url:fileUrl,success:function (data){
				if (data.statusCode===200){
					if((BMiniAdapter.autoCacheFile || isSaveFile)&& readyUrl.indexOf("wx.qlogo.cn")==-1 && readyUrl.indexOf(".php")==-1)
						MiniFileMgr.copyFile(data.tempFilePath,readyUrl,callBack,"",isAutoClear);
					else
					callBack !=null && callBack.runWith([0,data.tempFilePath]);
					}else{
					if(data.statusCode===403){
						callBack !=null && callBack.runWith([0,fileUrl]);
						}else{
						callBack !=null && callBack.runWith([1,data]);
					}
				}
				},fail:function (data){
				callBack !=null && callBack.runWith([1,data]);
		}});
	}

	MiniFileMgr.downLoadFile=function(fileUrl,fileType,callBack,encoding){
		(fileType===void 0)&& (fileType="");
		(encoding===void 0)&& (encoding="ascii");
		if(/*__JS__ */window.navigator.userAgent.indexOf('MiniGame')<0){
			Laya.loader.load(fileUrl,callBack);
			}else{
			if(fileType==/*laya.net.Loader.IMAGE*/"image" || fileType==/*laya.net.Loader.SOUND*/"sound")
				MiniFileMgr.downOtherFiles(fileUrl,callBack,fileUrl,true,false);
			else
			MiniFileMgr.downFiles(fileUrl,encoding,callBack,fileUrl,true,fileType,false);
		}
	}

	MiniFileMgr.copyFile=function(tempFilePath,readyUrl,callBack,encoding,isAutoClear){
		(encoding===void 0)&& (encoding="");
		(isAutoClear===void 0)&& (isAutoClear=true);
		var temp=tempFilePath.split("/");
		var tempFileName=temp[temp.length-1];
		var fileurlkey=readyUrl;
		var fileObj=MiniFileMgr.getFileInfo(readyUrl);
		var saveFilePath=MiniFileMgr.getFileNativePath(tempFileName);
		var totalSize=50 *1024 *1024;
		var chaSize=4 *1024 *1024;
		var fileUseSize=MiniFileMgr.getCacheUseSize();
		if (fileObj){
			if (fileObj.readyUrl !=readyUrl){
				MiniFileMgr.fs.getFileInfo({
					filePath:tempFilePath,
					success:function (data){
						if((isAutoClear && (fileUseSize+chaSize+data.size)>=totalSize)){
							if(data.size > BMiniAdapter.minClearSize)
								BMiniAdapter.minClearSize=data.size;
							MiniFileMgr.onClearCacheRes();
						}
						MiniFileMgr.deleteFile(tempFileName,readyUrl,callBack,encoding,data.size);
					},
					fail:function (data){
						callBack !=null && callBack.runWith([1,data]);
					}
				});
			}
			else
			callBack !=null && callBack.runWith([0]);
			}else{
			MiniFileMgr.fs.getFileInfo({
				filePath:tempFilePath,
				success:function (data){
					if((isAutoClear && (fileUseSize+chaSize+data.size)>=totalSize)){
						if(data.size > BMiniAdapter.minClearSize)
							BMiniAdapter.minClearSize=data.size;
						MiniFileMgr.onClearCacheRes();
					}
					MiniFileMgr.fs.copyFile({srcPath:tempFilePath,destPath:saveFilePath,success:function (data2){
							MiniFileMgr.onSaveFile(readyUrl,tempFileName,true,encoding,callBack,data.size);
							},fail:function (data){
							callBack !=null && callBack.runWith([1,data]);
					}});
				},
				fail:function (data){
					callBack !=null && callBack.runWith([1,data]);
				}
			});
		}
	}

	MiniFileMgr.onClearCacheRes=function(){
		var memSize=BMiniAdapter.minClearSize;
		var tempFileListArr=[];
		for(var key in MiniFileMgr.filesListObj){
			tempFileListArr.push(MiniFileMgr.filesListObj[key]);
		}
		MiniFileMgr.sortOn(tempFileListArr,"times",16);
		var clearSize=0;
		for(var i=1,sz=tempFileListArr.length;i<sz;i++){
			var fileObj=tempFileListArr[i];
			if(clearSize >=memSize)
				break ;
			clearSize+=fileObj.size;
			MiniFileMgr.deleteFile("",fileObj.readyUrl);
		}
	}

	MiniFileMgr.sortOn=function(array,name,options){
		(options===void 0)&& (options=0);
		if (options==16)return array.sort(function(a,b){return a[name]-b[name];});
		if (options==(16 | 2))return array.sort(function(a,b){return b[name]-a[name];});
		return array.sort(function(a,b){return a[name]-b[name] });
	}

	MiniFileMgr.getFileNativePath=function(fileName){
		return laya.bd.mini.MiniFileMgr.fileNativeDir+"/"+fileName;
	}

	MiniFileMgr.deleteFile=function(tempFileName,readyUrl,callBack,encoding,fileSize){
		(readyUrl===void 0)&& (readyUrl="");
		(encoding===void 0)&& (encoding="");
		(fileSize===void 0)&& (fileSize=0);
		var fileObj=MiniFileMgr.getFileInfo(readyUrl);
		var deleteFileUrl=MiniFileMgr.getFileNativePath(fileObj.md5);
		MiniFileMgr.fs.unlink({filePath:deleteFileUrl,success:function (data){
				var isAdd=tempFileName !="" ? true :false;
				if(tempFileName !=""){
					var saveFilePath=MiniFileMgr.getFileNativePath(tempFileName);
					MiniFileMgr.fs.copyFile({srcPath:tempFileName,destPath:saveFilePath,success:function (data){
							MiniFileMgr.onSaveFile(readyUrl,tempFileName,isAdd,encoding,callBack,data.size);
							},fail:function (data){
							callBack !=null && callBack.runWith([1,data]);
					}});
					}else{
					MiniFileMgr.onSaveFile(readyUrl,tempFileName,isAdd,encoding,callBack,fileSize);
				}
				},fail:function (data){
		}});
	}

	MiniFileMgr.deleteAll=function(){
		var tempFileListArr=[];
		for(var key in MiniFileMgr.filesListObj){
			tempFileListArr.push(MiniFileMgr.filesListObj[key]);
		}
		for(var i=1,sz=tempFileListArr.length;i<sz;i++){
			var fileObj=tempFileListArr[i];
			MiniFileMgr.deleteFile("",fileObj.readyUrl);
		}
	}

	MiniFileMgr.onSaveFile=function(readyUrl,md5Name,isAdd,encoding,callBack,fileSize){
		(isAdd===void 0)&& (isAdd=true);
		(encoding===void 0)&& (encoding="");
		(fileSize===void 0)&& (fileSize=0);
		var fileurlkey=readyUrl;
		if(MiniFileMgr.filesListObj['fileUsedSize']==null)
			MiniFileMgr.filesListObj['fileUsedSize']=0;
		if(isAdd){
			var fileNativeName=MiniFileMgr.getFileNativePath(md5Name);
			MiniFileMgr.filesListObj[fileurlkey]={md5:md5Name,readyUrl:readyUrl,size:fileSize,times:Browser.now(),encoding:encoding};
			MiniFileMgr.filesListObj['fileUsedSize']=parseInt(MiniFileMgr.filesListObj['fileUsedSize'])+fileSize;
			MiniFileMgr.writeFilesList(fileurlkey,JSON.stringify(MiniFileMgr.filesListObj),true);
			callBack !=null && callBack.runWith([0]);
			}else{
			if(MiniFileMgr.filesListObj[fileurlkey]){
				var deletefileSize=parseInt(MiniFileMgr.filesListObj[fileurlkey].size);
				MiniFileMgr.filesListObj['fileUsedSize']=parseInt(MiniFileMgr.filesListObj['fileUsedSize'])-deletefileSize;
				delete MiniFileMgr.filesListObj[fileurlkey];
				MiniFileMgr.writeFilesList(fileurlkey,JSON.stringify(MiniFileMgr.filesListObj),false);
				callBack !=null && callBack.runWith([0]);
			}
		}
	}

	MiniFileMgr.writeFilesList=function(fileurlkey,filesListStr,isAdd){
		var listFilesPath=MiniFileMgr.fileNativeDir+"/"+MiniFileMgr.fileListName;
		MiniFileMgr.fs.writeFile({filePath:listFilesPath,encoding:'utf8',data:filesListStr,success:function (data){
				},fail:function (data){
		}});
		if(!BMiniAdapter.isZiYu &&BMiniAdapter.isPosMsgYu){
			BMiniAdapter.window.swan.postMessage({url:fileurlkey,data:MiniFileMgr.filesListObj[fileurlkey],isLoad:"filenative",isAdd:isAdd});
		}
	}

	MiniFileMgr.getCacheUseSize=function(){
		if(MiniFileMgr.filesListObj && MiniFileMgr.filesListObj['fileUsedSize'])
			return MiniFileMgr.filesListObj['fileUsedSize'];
		return 0;
	}

	MiniFileMgr.existDir=function(dirPath,callBack){
		MiniFileMgr.fs.mkdir({dirPath:dirPath,success:function (data){
				callBack !=null && callBack.runWith([0,{data:JSON.stringify({})}]);
				},fail:function (data){
				if (data.errMsg.indexOf("file already exists")!=-1)
					MiniFileMgr.readSync(MiniFileMgr.fileListName,"utf8",callBack);
				else
				callBack !=null && callBack.runWith([1,data]);
		}});
	}

	MiniFileMgr.readSync=function(filePath,encoding,callBack,readyUrl){
		(encoding===void 0)&& (encoding="ascill");
		(readyUrl===void 0)&& (readyUrl="");
		var fileUrl=MiniFileMgr.getFileNativePath(filePath);
		var filesListStr
		try{
			filesListStr=MiniFileMgr.fs.readFileSync(fileUrl,encoding);
			callBack !=null && callBack.runWith([0,{data:filesListStr}]);
		}
		catch(error){
			callBack !=null && callBack.runWith([1]);
		}
	}

	MiniFileMgr.setNativeFileDir=function(value){
		MiniFileMgr.fileNativeDir=BMiniAdapter.window.swan.env.USER_DATA_PATH+value;
	}

	MiniFileMgr.filesListObj={};
	MiniFileMgr.fileNativeDir=null;
	MiniFileMgr.fileListName="layaairfiles.txt";
	MiniFileMgr.ziyuFileData={};
	MiniFileMgr.ziyuFileTextureData={};
	MiniFileMgr.loadPath="";
	MiniFileMgr.DESCENDING=2;
	MiniFileMgr.NUMERIC=16;
	__static(MiniFileMgr,
	['fs',function(){return this.fs=BMiniAdapter.window.swan.getFileSystemManager();},'wxdown',function(){return this.wxdown=BMiniAdapter.window.swan.downloadFile;}
	]);
	return MiniFileMgr;
})()


/**@private **/
//class laya.bd.mini.MiniLoader extends laya.events.EventDispatcher
var MiniLoader$1=(function(_super){
	function MiniLoader(){
		MiniLoader.__super.call(this);
	}

	__class(MiniLoader,'laya.bd.mini.MiniLoader',_super,'MiniLoader$1');
	var __proto=MiniLoader.prototype;
	/**
	*@private
	*@param url
	*@param type
	*@param cache
	*@param group
	*@param ignoreCache
	*/
	__proto.load=function(url,type,cache,group,ignoreCache){
		(cache===void 0)&& (cache=true);
		(ignoreCache===void 0)&& (ignoreCache=false);
		var thisLoader=this;
		thisLoader._url=url;
		if (!url){
			thisLoader.onLoaded(null);
			return;
		}
		url=URL.customFormat(url);
		if (url.indexOf("data:image")===0)thisLoader._type=type=/*laya.net.Loader.IMAGE*/"image";
		else {
			thisLoader._type=type || (type=Loader.getTypeFromUrl(thisLoader._url));
		}
		thisLoader._cache=cache;
		thisLoader._data=null;
		if (!ignoreCache && Loader.loadedMap[URL.formatURL(url)]){
			thisLoader._data=Loader.loadedMap[URL.formatURL(url)];
			this.event(/*laya.events.Event.PROGRESS*/"progress",1);
			this.event(/*laya.events.Event.COMPLETE*/"complete",thisLoader._data);
			return;
		}
		if (Loader.parserMap[type] !=null){
			thisLoader._customParse=true;
			if (((Loader.parserMap[type])instanceof laya.utils.Handler ))Loader.parserMap[type].runWith(this);
			else Loader.parserMap[type].call(null,this);
			return;
		};
		var contentType;
		switch (type){
			case /*laya.net.Loader.ATLAS*/"atlas":
			case /*laya.net.Loader.PREFAB*/"prefab":
			case /*laya.net.Loader.PLF*/"plf":
				contentType=/*laya.net.Loader.JSON*/"json";
				break ;
			case /*laya.net.Loader.FONT*/"font":
				contentType=/*laya.net.Loader.XML*/"xml";
				break ;
			case /*laya.net.Loader.PLFB*/"plfb":
				contentType=/*laya.net.Loader.BUFFER*/"arraybuffer";
				break ;
			default :
				contentType=type;
			}
		if (Loader.preLoadedMap[URL.formatURL(url)]){
			thisLoader.onLoaded(Loader.preLoadedMap[URL.formatURL(url)]);
			return;
		};
		var encoding=BMiniAdapter.getUrlEncode(url,contentType);
		var urlType=Utils.getFileExtension(url);
		if ((MiniLoader._fileTypeArr.indexOf(urlType)!=-1)){
			BMiniAdapter.EnvConfig.load.call(this,url,type,cache,group,ignoreCache);
			}else {
			if(BMiniAdapter.isZiYu && MiniFileMgr$1.ziyuFileData[url]){
				var tempData=MiniFileMgr$1.ziyuFileData[url];
				thisLoader.onLoaded(tempData);
				return;
			}
			if (!MiniFileMgr$1.getFileInfo(url)){
				if (MiniFileMgr$1.isLocalNativeFile(url)){
					if (BMiniAdapter.subNativeFiles && BMiniAdapter.subNativeheads.length==0){
						for (var key in BMiniAdapter.subNativeFiles){
							var tempArr=BMiniAdapter.subNativeFiles[key];
							BMiniAdapter.subNativeheads=BMiniAdapter.subNativeheads.concat(tempArr);
							for (var aa=0;aa < tempArr.length;aa++){
								BMiniAdapter.subMaps[tempArr[aa]]=key+"/"+tempArr[aa];
							}
						}
					}
					if(BMiniAdapter.subNativeFiles && url.indexOf("/")!=-1){
						debugger;
						var curfileHead=url.split("/")[0]+"/";
						if(curfileHead && BMiniAdapter.subNativeheads.indexOf(curfileHead)!=-1){
							var newfileHead=BMiniAdapter.subMaps[curfileHead];
							url=url.replace(curfileHead,newfileHead);
						}
					};
					var tempStr=URL.rootPath !="" ? URL.rootPath :URL.basePath;
					var tempUrl=url;
					if (tempStr !="")
						url=url.split(tempStr)[1];
					if (!url){
						url=tempUrl;
					}
					MiniFileMgr$1.read(url,encoding,new Handler(MiniLoader,MiniLoader.onReadNativeCallBack,[encoding,url,type,cache,group,ignoreCache,thisLoader]));
					return;
				};
				var tempurl=URL.formatURL(url);
				if (tempurl.indexOf("http://usr/")==-1&& (tempurl.indexOf("http://")!=-1 || tempurl.indexOf("https://")!=-1)&& !BMiniAdapter.AutoCacheDownFile){
					BMiniAdapter.EnvConfig.load.call(thisLoader,url,type,cache,group,ignoreCache);
					}else {
					MiniFileMgr$1.readFile(url,encoding,new Handler(MiniLoader,MiniLoader.onReadNativeCallBack,[encoding,url,type,cache,group,ignoreCache,thisLoader]),url);
				}
				}else {
				var fileObj=MiniFileMgr$1.getFileInfo(url);
				fileObj.encoding=fileObj.encoding==null ? "utf8" :fileObj.encoding;
				MiniFileMgr$1.readFile(url,fileObj.encoding,new Handler(MiniLoader,MiniLoader.onReadNativeCallBack,[encoding,url,type,cache,group,ignoreCache,thisLoader]),url);
			}
		}
	}

	MiniLoader.onReadNativeCallBack=function(encoding,url,type,cache,group,ignoreCache,thisLoader,errorCode,data){
		(cache===void 0)&& (cache=true);
		(ignoreCache===void 0)&& (ignoreCache=false);
		(errorCode===void 0)&& (errorCode=0);
		if (!errorCode){
			var tempData;
			if (type==/*laya.net.Loader.JSON*/"json" || type==/*laya.net.Loader.ATLAS*/"atlas" || type==/*laya.net.Loader.PREFAB*/"prefab" || type==/*laya.net.Loader.PLF*/"plf"){
				tempData=BMiniAdapter.getJson(data.data);
				}else if (type==/*laya.net.Loader.XML*/"xml"){
				tempData=Utils.parseXMLFromString(data.data);
				}else {
				tempData=data.data;
			}
			if(!BMiniAdapter.isZiYu &&BMiniAdapter.isPosMsgYu && type !=/*laya.net.Loader.BUFFER*/"arraybuffer"){
				BMiniAdapter.window.swan.postMessage({url:url,data:tempData,isLoad:"filedata"});
			}
			thisLoader.onLoaded(tempData);
			}else if (errorCode==1){
			BMiniAdapter.EnvConfig.load.call(thisLoader,url,type,cache,group,ignoreCache);
		}
	}

	__static(MiniLoader,
	['_fileTypeArr',function(){return this._fileTypeArr=['png','jpg','bmp','jpeg','gif'];}
	]);
	return MiniLoader;
})(EventDispatcher)


/**@private **/
//class laya.bd.mini.MiniSound extends laya.events.EventDispatcher
var MiniSound$1=(function(_super){
	function MiniSound(){
		/**@private **/
		this._sound=null;
		/**
		*@private
		*声音URL
		*/
		this.url=null;
		/**
		*@private
		*是否已加载完成
		*/
		this.loaded=false;
		/**@private **/
		this.readyUrl=null;
		MiniSound.__super.call(this);
	}

	__class(MiniSound,'laya.bd.mini.MiniSound',_super,'MiniSound$1');
	var __proto=MiniSound.prototype;
	/**
	*@private
	*加载声音。
	*@param url 地址。
	*
	*/
	__proto.load=function(url){
		url=URL.formatURL(url);
		this.url=url;
		this.readyUrl=url;
		if (MiniSound._audioCache[this.readyUrl]){
			this.event(/*laya.events.Event.COMPLETE*/"complete");
			return;
		}
		if(BMiniAdapter.autoCacheFile&&MiniFileMgr$1.getFileInfo(url)){
			this.onDownLoadCallBack(url,0);
			}else{
			if(!BMiniAdapter.autoCacheFile){
				this.onDownLoadCallBack(url,0);
				}else{
				if (MiniFileMgr$1.isLocalNativeFile(url)){
					var tempStr=URL.rootPath !="" ? URL.rootPath :URL.basePath;
					var tempUrl=url;
					if(tempStr !="")
						url=url.split(tempStr)[1];
					if (!url){
						url=tempUrl;
					}
					this.onDownLoadCallBack(url,0);
					}else{
					if (!MiniFileMgr$1.isLocalNativeFile(url)&& (url.indexOf("http://")==-1 && url.indexOf("https://")==-1)|| (url.indexOf("http://usr/")!=-1)){
						this.onDownLoadCallBack(url,0);
						}else{
						MiniFileMgr$1.downOtherFiles(url,Handler.create(this,this.onDownLoadCallBack,[url]),url);
					}
				}
			}
		}
	}

	/**@private **/
	__proto.onDownLoadCallBack=function(sourceUrl,errorCode){
		if (!errorCode){
			var fileNativeUrl;
			if(BMiniAdapter.autoCacheFile){
				if (MiniFileMgr$1.isLocalNativeFile(sourceUrl)){
					var tempStr=URL.rootPath !="" ? URL.rootPath :URL.basePath;
					var tempUrl=sourceUrl;
					if(tempStr !="" && (sourceUrl.indexOf("http://")!=-1 || sourceUrl.indexOf("https://")!=-1))
						fileNativeUrl=sourceUrl.split(tempStr)[1];
					if(!fileNativeUrl){
						fileNativeUrl=tempUrl;
					}
					}else{
					var fileObj=MiniFileMgr$1.getFileInfo(sourceUrl);
					if(fileObj && fileObj.md5){
						var fileMd5Name=fileObj.md5;
						fileNativeUrl=MiniFileMgr$1.getFileNativePath(fileMd5Name);
						}else{
						fileNativeUrl=sourceUrl;
					}
				}
				this._sound=MiniSound._createSound();
				this._sound.src=this.url=fileNativeUrl;
				}else{
				this._sound=MiniSound._createSound();
				this._sound.src=sourceUrl;
			}
			this._sound.onCanplay(MiniSound.bindToThis(this.onCanPlay,this));
			this._sound.onError(MiniSound.bindToThis(this.onError,this));
			}else{
			this.event(/*laya.events.Event.ERROR*/"error");
		}
	}

	/**@private **/
	__proto.onError=function(error){
		try{
			console.log("-----1---------------minisound-----id:"+MiniSound._id);
			console.log(error);
		}
		catch(error){
			console.log("-----2---------------minisound-----id:"+MiniSound._id);
			console.log(error);
		}
		this.event(/*laya.events.Event.ERROR*/"error");
		this._sound.offError(null);
	}

	/**@private **/
	__proto.onCanPlay=function(){
		this.loaded=true;
		this.event(/*laya.events.Event.COMPLETE*/"complete");
		this._sound.offCanplay(null);
	}

	/**
	*@private
	*播放声音。
	*@param startTime 开始时间,单位秒
	*@param loops 循环次数,0表示一直循环
	*@return 声道 SoundChannel 对象。
	*
	*/
	__proto.play=function(startTime,loops){
		(startTime===void 0)&& (startTime=0);
		(loops===void 0)&& (loops=0);
		var tSound;
		if (this.url==SoundManager._bgMusic){
			if (!MiniSound._musicAudio)MiniSound._musicAudio=MiniSound._createSound();
			tSound=MiniSound._musicAudio;
			}else {
			if(MiniSound._audioCache[this.readyUrl]){
				tSound=MiniSound._audioCache[this.readyUrl]._sound;
				}else{
				tSound=MiniSound._createSound();
			}
		}
		if(BMiniAdapter.autoCacheFile&&MiniFileMgr$1.getFileInfo(this.url)){
			var fileNativeUrl;
			var fileObj=MiniFileMgr$1.getFileInfo(this.url);
			var fileMd5Name=fileObj.md5;
			tSound.src=this.url=MiniFileMgr$1.getFileNativePath(fileMd5Name);
			}else{
			tSound.src=this.url;
		}
		if(!tSound)
			return null;
		var channel=new MiniSoundChannel$1(tSound,this);
		channel.url=this.url;
		channel.loops=loops;
		channel.loop=(loops===0 ? true :false);
		channel.startTime=startTime;
		channel.play();
		SoundManager.addChannel(channel);
		return channel;
	}

	/**
	*@private
	*释放声音资源。
	*
	*/
	__proto.dispose=function(){
		var ad=MiniSound._audioCache[this.readyUrl];
		if (ad){
			ad.src="";
			if(ad._sound){
				ad._sound.destroy();
				ad._sound=null;
				ad=null;
			}
			delete MiniSound._audioCache[this.readyUrl];
		}
	}

	/**
	*@private
	*获取总时间。
	*/
	__getset(0,__proto,'duration',function(){
		return this._sound.duration;
	});

	MiniSound._createSound=function(){
		MiniSound._id++;
		return BMiniAdapter.window.swan.createInnerAudioContext();
	}

	MiniSound.bindToThis=function(fun,scope){
		var rst=fun;
		/*__JS__ */rst=fun.bind(scope);;
		return rst;
	}

	MiniSound._musicAudio=null;
	MiniSound._id=0;
	MiniSound._audioCache={};
	return MiniSound;
})(EventDispatcher)


/**@private **/
//class laya.bd.mini.MiniAccelerator extends laya.events.EventDispatcher
var MiniAccelerator$1=(function(_super){
	function MiniAccelerator(){
		MiniAccelerator.__super.call(this);
	}

	__class(MiniAccelerator,'laya.bd.mini.MiniAccelerator',_super,'MiniAccelerator$1');
	var __proto=MiniAccelerator.prototype;
	/**
	*侦听加速器运动。
	*@param observer 回调函数接受4个参数，见类说明。
	*/
	__proto.on=function(type,caller,listener,args){
		_super.prototype.on.call(this,type,caller,listener,args);
		MiniAccelerator.startListen(this["onDeviceOrientationChange"]);
		return this;
	}

	/**
	*取消侦听加速器。
	*@param handle 侦听加速器所用处理器。
	*/
	__proto.off=function(type,caller,listener,onceOnly){
		(onceOnly===void 0)&& (onceOnly=false);
		if (!this.hasListener(type))
			MiniAccelerator.stopListen();
		return _super.prototype.off.call(this,type,caller,listener,onceOnly);
	}

	MiniAccelerator.__init__=function(){
		try{
			var Acc;
			Acc=/*__JS__ */laya.device.motion.Accelerator;
			if (!Acc)return;
			Acc["prototype"]["on"]=MiniAccelerator["prototype"]["on"];
			Acc["prototype"]["off"]=MiniAccelerator["prototype"]["off"];
			}catch (e){
		}
	}

	MiniAccelerator.startListen=function(callBack){
		MiniAccelerator._callBack=callBack;
		if (MiniAccelerator._isListening)return;
		MiniAccelerator._isListening=true;
		try{
			BMiniAdapter.window.swan.onAccelerometerChange(laya.bd.mini.MiniAccelerator.onAccelerometerChange);
		}catch(e){}
	}

	MiniAccelerator.stopListen=function(){
		MiniAccelerator._isListening=false;
		try{
			BMiniAdapter.window.swan.stopAccelerometer({});
		}catch(e){}
	}

	MiniAccelerator.onAccelerometerChange=function(res){
		var e;
		e={};
		e.acceleration=res;
		e.accelerationIncludingGravity=res;
		e.rotationRate={};
		if (MiniAccelerator._callBack !=null){
			MiniAccelerator._callBack(e);
		}
	}

	MiniAccelerator._isListening=false;
	MiniAccelerator._callBack=null;
	return MiniAccelerator;
})(EventDispatcher)


/**@private **/
//class laya.bd.mini.MiniSoundChannel extends laya.media.SoundChannel
var MiniSoundChannel$1=(function(_super){
	function MiniSoundChannel(audio,miniSound){
		/**@private **/
		this._audio=null;
		/**@private **/
		this._onEnd=null;
		/**@private **/
		this._miniSound=null;
		MiniSoundChannel.__super.call(this);
		this._audio=audio;
		this._miniSound=miniSound;
		this._onEnd=MiniSoundChannel.bindToThis(this.__onEnd,this);
		audio.onEnded(this._onEnd);
	}

	__class(MiniSoundChannel,'laya.bd.mini.MiniSoundChannel',_super,'MiniSoundChannel$1');
	var __proto=MiniSoundChannel.prototype;
	/**@private **/
	__proto.__onEnd=function(){
		MiniSound$1._audioCache[this.url]=this._miniSound;
		if (this.loops==1){
			if (this.completeHandler){
				Laya.systemTimer.once(10,this,this.__runComplete,[this.completeHandler],false);
				this.completeHandler=null;
			}
			this.stop();
			this.event(/*laya.events.Event.COMPLETE*/"complete");
			return;
		}
		if (this.loops > 0){
			this.loops--;
		}
		this.startTime=0;
		this.play();
	}

	/**
	*@private
	*播放
	*/
	__proto.play=function(){
		this.isStopped=false;
		SoundManager.addChannel(this);
		this._audio.play();
	}

	/**
	*@private
	*停止播放
	*
	*/
	__proto.stop=function(){
		this.isStopped=true;
		SoundManager.removeChannel(this);
		this.completeHandler=null;
		if (!this._audio)
			return;
		this._audio.pause();
		this._audio.offEnded(null);
		this._miniSound.dispose();
		this._audio=null;
		this._miniSound=null;
		this._onEnd=null;
	}

	/**@private **/
	__proto.pause=function(){
		this.isStopped=true;
		this._audio.pause();
	}

	/**@private **/
	__proto.resume=function(){
		if (!this._audio)
			return;
		this.isStopped=false;
		SoundManager.addChannel(this);
		this._audio.play();
	}

	/**@private **/
	/**
	*@private
	*自动播放
	*@param value
	*/
	__getset(0,__proto,'autoplay',function(){
		return this._audio.autoplay;
		},function(value){
		this._audio.autoplay=value;
	});

	/**
	*@private
	*当前播放到的位置
	*@return
	*
	*/
	__getset(0,__proto,'position',function(){
		if (!this._audio)
			return 0;
		return this._audio.currentTime;
	});

	/**
	*@private
	*获取总时间。
	*/
	__getset(0,__proto,'duration',function(){
		if (!this._audio)
			return 0;
		return this._audio.duration;
	});

	/**@private **/
	/**@private **/
	__getset(0,__proto,'loop',function(){
		return this._audio.loop;
		},function(value){
		this._audio.loop=value;
	});

	/**
	*@private
	*设置音量
	*@param v
	*
	*/
	/**
	*@private
	*获取音量
	*@return
	*/
	__getset(0,__proto,'volume',function(){
		if (!this._audio)return 1;
		return this._audio.volume;
		},function(v){
		if (!this._audio)return;
		this._audio.volume=v;
	});

	MiniSoundChannel.bindToThis=function(fun,scope){
		var rst=fun;
		/*__JS__ */rst=fun.bind(scope);;
		return rst;
	}

	return MiniSoundChannel;
})(SoundChannel)



},1001);
