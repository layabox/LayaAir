interface conch_File{
    //lastModifiedDate:number;
   // name:string;
    size:number;
    type:string;
    close():void;
    slice(b:number,e:number):void;
    enableCache:boolean;
}
declare var conch_File:{new(url:string):conch_File;};
declare var File:{new(url:string):conch_File;};


interface  conch_FileReader {
    _t:any;
	setIgnoreError:(b:boolean)=>void;
    sync:boolean;
	error:string;
	result:string|ArrayBuffer;
	onload:()=>void;
    onloadend:()=>void;
	onerror:(e:number)=>void;
    onabort:()=>void;
    abort():void;
	onprogress:(total:number,now:number,speed:number)=>void;
	responseType:number;
    readyState:number;
	readAsArrayBuffer(f:conch_File):void;
	readAsText(f:conch_File):void;
    readAsDataURL(file:any):void;
    getErrorCode():number;
    getHttpCode():number;
	new():conch_FileReader;
}

declare var conch_FileReader:conch_FileReader;

declare var FileReader:conch_FileReader;

interface history{
    back():void;
    go(step:number):void;
    forward():void;
    _push(url:string):void;
    length:number;
}

declare var history:history;

declare module 'async' {
    export function delay(ms: number): Promise<{}>;
    export function loadImage(src: string): Promise<HTMLImageElement>;
    export function loadText(src: string): Promise<string>;
    export function downloadSync(url: string, bin: boolean, onprog: (total: number, now: number, speed: number) => number): Promise<{}>;
    /**
     * 等待完成回调
     */
    export function regGlobal(window: Window): void;
}

interface AppCache{
    cacheSize:number;
    /**
     * 用一个dcc文件来更新所有的资源。
     *  @param dccURL dcc文件的地址。
     *  @param checkSum 
     *  @param onchkok 更新成功的回调。
     *  @param onchkerr 更新失败的回调。
     * 
     * 还没有实现
     */
    update(dccURL:string, checkSum:number, onchkok:()=>void, onchkerr:()=>void):void;
    
    /**
     * 把一个url转换成本地地址
     */
    url2Local(url:string):string;
    
    /**
     * 是否允许缓存。
     * 还没实现
     */
    enableCache:boolean;
    
    /**
     * 获取一个保存的值。这个值被存在resources目录下。
     */
    getResourceID(res:string):string;
    /**
     * 设置一个需要保存的值。
     */
    setResourceID(res:string, id:string):void;
    
    /**
     * 把dcc的内容保存下来。
     */
    saveFileTable(dccdata:string):void;
    
    /**
     * 从缓存中读取某个文件。同步返回。
     * 如果带有BOM的话，会去掉。
     */
    loadCachedURL(url:string):string;
    
    /**
     * 得到当前的缓存目录
     */
    getCachePath():string;
    
    /**
     * 获得所有的缓存过的app.
     * return Array<string> 返回一个array，每个都是一个app的url
     */
    getAppList():Array<{path:string,url:string}>;
    
    /**
     * 获得某个app缓存的大小
     */
    getAppSize(app:string):number;
    
    /**
     * 删除某个app的缓存
     */
    delAppCache(app:string):void;
    
    /**
     * 删除所有的缓存
     */
    delAllCache():void;
    /**
     * 更新dcc中的一个文件
     * @param nameid 更新的文件，自己计算。
     *   路径规则：/，表示app根目录。例如：hashstr('/index.html')， 不要带参数，如果带参数的话-- hashstr('/aa/bb.html?ff=2') 会导致谁也找不到这个文件
     * @param chksum 校验码，如果0则此函数自己计算。如果是外部版本控制，则这个是hashstr后的版本号。
     * @param buf ArrayBuffer 文件内容。
     * @param extversion 是否使用外部版本号
     * @return boolean 如果返回true则表示更新成功，否则的话，表示校验码不一致，即
     *      先要更新dcc才能工作。
     */
    updateFile(nameid:number,chksum:number,buf:ArrayBuffer,extversion:boolean):boolean;
    
    hashstr(str:string):number;
}

declare var AppCache:{
    prototype:AppCache,
    /**
     * 传入的参数是app的url，是一个目录。
     */
    new(url:string):AppCache
};

interface _XMLHttpRequest{
    _t:any;//这个是不得已。为什么不用this呢，因为jsc不行啊
    get_readyState():number;
    get_status():number;
    responseTypeCode:number;
    /**
     * 就是url
     */
    get_responseURL():string;
    _open(method:'post',url:string,async:boolean):void;
    _open(method:'get',url:string,async:boolean):void;
    _open(method:string,url:string,async:boolean):void;
    
    /**
     * 设置头，一次只能设置一个，可以设置多次。
     */
    setRequestHeader(name:string,value:string);
    /**
     * 设置当状态改变后的回调函数。
     */
    set_onreadystatechange(f:(state:number)=>void);
    /**
     * 脚本设置状态，会触发set_onreadystatechange 设置的函数。
     */
    _changeState(s:number);
    /**
     * 设置post的回调函数。
     */
    setPostCB(onok:(result:string|ArrayBuffer,strresult?:string)=>void,onerr:(e1:number,e2:number)=>void);
    postString(url:string,data:string,onok:(result:string,result1:string)=>void,onerr:(e:number)=>void);
    postData(url:string, data:string|ArrayBuffer);
    /**
     * 只有有header的时候才调用这个
     */
    getData(url:string);

    //扩展的
    mimeType:string;
   /* responseType:string;
    responseText:string;
    response:string|ArrayBuffer;
    url:string;
    async:boolean;
    method:string;
    evtmap:Object;  //TODO 这个要去掉。
    readyState:number;
    status:number;*/
}

interface _XmlDocument
{
    childNodes:Array<_XmlNode>;
}
declare var _XmlDocument

interface _XmlNode
{
    nodeValue:string;
    nodeName:string;
    textContent:string;
    childNodes:Array<_XmlNode>;
    attributes:Array<_XmlAttr>;
    
}
declare var _XmlNode:{new():_XmlNode};

interface _XmlAttr
{
    nodeValue:string;
    nodeName:string;
    textContent:string;
}
declare var  _XmlAttr:{new():_XmlAttr};

declare var _XMLHttpRequest:{new():_XMLHttpRequest;};
interface _DOMParser
{
    parseFromString(s:String,t:String):_XmlDocument;
    getResult():_XmlDocument;
    src:string;
    onload:()=>void;
    onerror:()=>void;
    _onload:any;
    _onerror:any;
}

declare var _DOMParser:{new():_DOMParser;};


interface ZipFile{
    /**
     * 注意这个文件不要太大，因为需要在内存中解开，太大了会直接导致崩溃。
     */
    setSrc(src:string):boolean;
    /**
     * 遍历zip中的文件。
     * id:
     * name:文件名，包含路径
     * dir:是否是
     * sz:文件大小
     */
    forEach(func:(id:number,name:string,dir:boolean,sz:number)=>void):void;
    /**
     * 不要用。
     */
    readFile1():void;
    /**
     * 读取zip中的文件的内容，返回一个ArrayBuffer
     */
    readFile(id:number):ArrayBuffer;
    close():void;
    
    new ():ZipFile;
}

declare var ZipFile:ZipFile;

declare class ConchInput{
    left:number;
    top:number;
    width:number;
    height:number;
    opacity:number;
    style:string;
    value:string; 
    visible:boolean;
    addEventListener(name:string,funciton:any):void;
    setLeft(l:number);
    setTop(t:number);
    setWidth(w:number);
    setHeight(h:number);
    setOpacity(o:number);
    setValue(v:string);
    getValue():string;
    setStyle(s:string);
    setVisible(b:boolean);
    focus();
    blur();
    setColor(c:string);
    setFontSize(s:number);
    setPos(x:number,y:number);
    setSize(w:number,h:number);
    setCursorPosition(p:number);
    setScale(w:number,h:number);
    setMaxLength(l:number);
    setType(t:string);
    setNumberOnly(b:boolean);
    setRegular(r:string);
    setFont(f:string);
    setMultiAble(b:boolean);
    setForbidEdit(b:boolean);
    setBgColor(c:string);
}

declare class conchImage{
    conchImgId:number;
    width:number;
    height:number;
    src:string;
    obj:Object;
    srcs:number;
    _onload:(evt:Event)=>any;
    onload:(evt:Event)=>any;
    onerror:(err:number)=>void;
    complete:boolean;
    setSrc(src:string):void;
    getImageData():ArrayBuffer;
    rect(x:number,y:number,w:number,h:number):void;
    test_setResState(state:number):void;
    putBitmapData(data:ArrayBuffer,w:number,h:number):void;
    destroy():void;
    enableMerageInAtlas(value:boolean):void;
    releaseTexture():void;
    setPremultiplyAlpha(b:Boolean):void;
}

declare class _layagl{
    setSize(w:number,h:number);
    setType(type:number);
    setLayaGLMode(bMode:Boolean);
    measureText(font:string,text:string):TextMetrics;
    setSyncArrayBufferID(id:number);
    setFrameAndSyncCountArrayBufferID(id:number);
    setRootCommandEncoder(id:number);
    addGlobalValueDefine(nModifyType:number, nDataType:number, nSize:number, deaultValue:any):number;
    endGlobalValueDefine();
    getProgramParameterEx(vs:string,ps:string,define:string,pname:number):number;
    getActiveAttribEx(vs:string,ps:string,define:string,index:number):any;
    getActiveUniformEx(vs:string,ps:string,define:string,index:number):any;
    getAttribLocationEx(vs:string,ps:string,define:string,name:string):any;
	getStringEx(name:number):string;
    getShaderInfoLogEx(src:string,type:number):string;
    getProgramInfoLogEx(vs:string,ps:string,define:string):string;
    getParameter(pname:number):any;
    getIntegerv(pname:number):number;
    getIntegerArrayv(pname:number):number[];
    getFloatv(pname:number):number;
    getFloatArrayv(pname:number):number[];
    getBooleanv(pname:number):number;
    getShaderPrecisionFormat(shaderType:number, precisionType:number):any;
    getBufferParameter(target:number,pname:number);
    getFramebufferAttachmentParameter(target:number,attachment:number,pname:number);
    getRenderbufferParameter(target:number,pname:number);
    getTexParameter(target:number,pname:number);
    getShaderParameter(src:string,type:number,pname:number);
    defineShaderMacro(nID:number, sMacro:string, uniformInfo:string);
    updateAnimationNodeWorldMatix(locPosition, locRotation, locScaling, parentIndices, outWorldMatrix);
    computeSubSkinnedDataNative(worldMatrixs, worldMatrixIndex, inverseBindPoses,boneIndices, bindPoseInices, resultData);
    computeSubSkinnedData(worldMatrixs, worldMatrixIndex, inverseBindPoses,boneIndices, bindPoseInices, resultData);
    culling(boundFrustumBuffer:Float32Array,cullingBuffer:Float32Array, cullingBufferIndices:Int32Array, cullingCount:number, cullingBufferResult:Int32Array):number;
    getThreadMode();
    checkFramebufferStatusEx(target:any):any;
    getVertexAttribEx(index:number, pname:any):any;
    getVertexAttribExfv(index:number, pname:any):any;
    getVertexAttribOffset(index:number, pname:any):any;
    getBufferParameterEx(target:number, pname:number):number;
    getRenderbufferParameterEx(target:number, pname:number):number;
    getTexParameterEx(target:any, pname:any):number;
    isEnabled(cap):number;
    getUniformEx(locationName:string):any;
    flushCommand():void;
    readPixels(x:number, y:number, width:number, height:number, format:any, type:any);

}
declare var layagl:_layagl;

declare class _callbackFuncObj
{
    constructor(id:number);
    id:number;
    addCallbackFunc(int:number,func:any);
}

declare class _conchFloatArrayKeyframe
{
    setTime(value:number);
    getTime():number;
    setInTangent(value:Float32Array);
    setOutTangent(value:Float32Array);
    setValue(value:Float32Array);
    setData(value:Float32Array);
}

declare class _conchKeyframeNode
{
    _indexInList:number;
    type:number;
    fullPath:string;
    propertyOwner:string;
    ownerPathCount:number;
    propertyCount:number;
    keyFramesCount:number;
    getOwnerPathCount();
    _setOwnerPathCount(value:number);
    getPropertyCount();
    _setPropertyCount(value:number);
    getKeyFramesCount();
    _setKeyframeCount(value:number);
    getOwnerPathByIndex(index:number);
    _setOwnerPathByIndex(index:number, value:string);
    getPropertyByIndex(index:number);
    _setPropertyByIndex(index:number, value:string);
    getKeyframeByIndex(index:number);
    _joinOwnerPath(value:string);
    _joinProperty(value:string);
    setFloat32ArrayData(data:any);
    getDataType();
    getFloatData();
}
declare class _conchKeyframeNodeList
{
    setCount(value);
    setNodeByIndex(index,node);
}

declare class context{
    getID();
    setSize(w:number,h:number);
    setType(type:number);
    commitToGPU();
}

declare class ConchCanvas{
    conchThisID:number;
    conchImgId:number;
    width:number;
    height:number;
    conchCanvasId:number;
    getThisID():number;
    isCanvas():boolean;//true
    setSize(w:number,h:number):void;
    //getContext(ctx:"2d"):context;
    //getContext(ctx:"experimental-webgl"):LayaWebGL2;
    //getContext(ctx:"webgl"):LayaWebGL2;
    //getContext(ctx:string):void;
    /**
     * 内部函数。设置canvas的2dcontext
     */   
    _setCtx2D(ctx:any):void;
}

declare class ConchAudio{
    autoplay:boolean;
    loop:boolean;
    muted:boolean;
    src:string;
    volume:number;
    currentTime:Number;
    setLoop(b:boolean):void;
    play():void;
    pause():void;
    stop():void;
    addEventListener(evt:string,callback:any);
}

declare class ConchVideo {
    conchImgId: number;
    width: number;
    height: number;
    videoWidth: number;
    videoHeight: number;
    currentTime: number;

    readonly duration:number;
    readonly readyState:number;

    load():void;
    play():void;
    pause():void;
    readonly paused: boolean;

    src:string;

    x:number;
    y:number;

    volume:number
    muted:boolean;

    loop:boolean;
    autoplay:boolean;

    canPlayType(val:string):boolean;
    addEvent(type: string): void;
    removeEvent(type:string):void;
    _setDispatchEventFunc(callback:any);
}

interface conchConfig{
    threadMode:number;
	PerfUpdateDt:(id:number,dt:number)=>void;
	PerfAddData:(id:number,color:number,scale:number,alert:number)=>void;
	PerfDelData:(id:number)=>void;
	//PerfShow:(b:number)=>void;
	//启动程序的时候的额外参数
	paramExt:string;
	maxFileMemSize:number;
	maxTextureMemSize:number;
	atlasWidth:number;
	atlasHeight:number;
	atlasGridSize:number;
	atlasNum:number;
    localizable:boolean;
	pushAtlasMaxWidth:number;
	maxEJAnimation:number;
	urlIgnoreCase:boolean;
	getStoragePath():string;
	setMemoryCanvasSize(w:number,h:number):void;
	getTotalMem():number;
	getUsedMem():number;
	getAvalidMem():number;
	getScreenInch():number;
	setTouchMoveRange(r:number):void;
	getScreenOrientation():number;
	setScreenOrientation(o:number):void;
    setScreenScale(sw:number,sh:number,tx:number,ty:number):void;
    getScreenScaleW():number;
    getScreenScaleH():number;
	setUrlIgnoreCase(b:boolean):void;
	getUrlIgnoreCase():boolean;
    /**
     * 返回网络类型
	 * NET_NO:     0 没有网络
	 * NET_2G:     1 2g网络
	 * NET_3G:     2 3g网络
	 * NET_4G:     3 4g网络
	 * NET_WIFI:   4 wifi
	 * NET_UNKNOWN:5 未知网络 
     */
	getNetworkType():number;
	getRuntimeVersion():string;
	setDownloadTryNum(opttry:number,conntry:number):void;
	setDownloadPathReplace(ori:string,replace:string):void;
	setDownloadTail(type:number,tail:string):void;
	setDownloadNoResponseTimeout(tm:number):void;
	setDownloadReplaceExt(ori:string,replace:string):void;
	setDownloadUseSession(b:boolean):void;
	addChkIgnoreChksumExt(ext:string):void;
	clearChkIgnoreChksumExt():void;
    /**
     * 
     */
	setDownloadUnmask(ext:string,key:number,len:number):void;
    /**
     * 设置版本控制字符串
     * 如 xxx.png?v=123  既可以传入conchConfig.setDownloadVersionString("v");
    */
    setDownloadVersionString(str:string):void;
    /**
     * 返回平台类型
        "Conch-ios"
        "Conch-android"
        "Conch-window"
     */
	getOS():string;
    /**
     * 获得唯一标示
     */
	getGuid():string;
    /**
     * 获取设备信息JSON字符串格式
     * 例如"{\"resolution\":\"1920*1080\",	\"guid\":\"xxxxxxxxx\",\"imei\":[\"imeixxx\"],\"imsi\":[\"imsixxx\"],\"os\":\"windows\",\"osversion\":\"windows7 64\",\"phonemodel\":\"Wintel\"	}"
     */
	getDeviceInfo():string;
    /**
     * return 返回是否是插件模式
     */
    getIsPlug():boolean;
    /**
     * 设置是否30帧
     * @parms b 是否30帧
     */
    setSlowFrame(b:boolean);
    
}

declare var conchConfig:conchConfig;

declare interface conchMarket{
	constructor();
    setIAPCallBack(callback:(string)=>void):void;
    setIAPPurchaseResult(rst:string):void;
}
declare var conchMarket:conchMarket;


declare class conchNotify{
    constructor();	
}

/*
	socket接收到的数据
*/
interface ws_msgdata{
	data:string|ArrayBuffer;		//TODO 怎么能限制成string或者ArrayBuffer
}
/*
declare var ws_msgdata:{
	new(): ws_msgdata;
}
*/
//
/*
	websocket
*/
declare class  ConchWebSocket{
    constructor(url:string);
	binaryType:string;
	timegap:number;
    readyState:number;
	onopen:()=>void;
	protected _onmessage:(msg:string|ArrayBuffer)=>void;
	onclose:()=>void;
	onerror:()=>void;
	close():void;
	send(msg:string|ArrayBuffer):void;
}

interface downloadOptions{
    connTimeout:number;
    downloadTimeout:number;
    noCache:boolean;
}
interface conchTextCanvas {
    /**
     * 初始化freeType默认字体。
     * @param defaultTTFs 字体的路径，多个字体中间用 \4 分割.
     * @return boolean
     */
    initFreeTypeDefaultFontFromFile(defaultTTFs:string);
}
interface _textBitmap
{
    width;
    height;
    data;
}
interface conch {
    onerror:Function;
    __onerror:Function;
    callWebviewJS(methodName:string,parms:string,callbackMethodName:string);
    exp:any;
    showWebView();
    hideWebView();
    captureScreen(cb:(ab:ArrayBuffer,w:number,h:number)=>void):void;
    saveAsPng(ab:ArrayBuffer,w:number,h:number,file:string);
	loadingAuto:boolean;
    callMethod(objid:number,isSyn:boolean,className:string,methodName:string,param:string):string
    presetUrl:string;   //预设的url。一般是java或者通过参数传入的
    setHref(url:string);
    setMouseEvtFunction(f:Function);
    setKeyEvtFunction(f:Function);
    setTouchEvtFunction:(cb:(touchtype:number,id:number,etype:string,x:number,y:number)=>void)=>void;
    setDeviceMotionEvtFunction(f:Function);
    setNetworkEvtFunction(f:Function);
    setOnBackPressedFunction(f:()=>void);
    exit();//only android
    createTextureGroup(): any;//JSTextureGroup
    createBoneAnimTemplate(): any;//JSBoneAnimTemplate
    createBoneAnimation(): any;//JSBoneAnimation
    createBoneInfo(): any;//JSBoneInfo
    createEJTextureData(): any;//JSEJTextureData
    createTextWord(): any;//JSArrayTextWord
    createTextWordArray(): void;
    createTextWordImage(): void;
    printAllMemorySurvey(): void;
    setOnFrame(onframe: () => void): void;
    setOnDraw(onDraw:(vsynctm:number)=>void):void;
    setOnInvalidGLRes(): void;
    setOnTextureInvalid(f:(texid:number)=>void): void;
    setOnTextureRestore(f:(texid:number)=>void): void;
    setOnCommitStream(): void;
    setRootNode(): void;
    _setRootNode(): void;
    pushUrl(url: string): void;
    getRunParam(): string;
    setOnOriChanged(cb: (number)): void;
    showLoadingView(b: boolean): void;
    showWaiting(b: boolean): void;
    showAssistantTouch(b: boolean): void;
    /**
     * 显示一个webview
     */
    setExternalLink(url: string): void;
    /**
     * 显示一个webview
     * @param url {string} 要显示的url地址。
     * @param posx {number} weview的左上角位置
     * @param posy {number} webivew的左上角位置
     * @param width {number} webview的宽度
     * @param height {number} webview的高度
     * @param canclose {boolean} webview是否可以被关掉。
     */ 
    setExternalLinkEx(url:string,posx:number, posy:number,width:number,height:number,canclose:boolean):void;
    closeExternalLink(): void;
    setScreenWakeLock(b: boolean): void;
    setUrlToLower(b: boolean): void;
    setFontFace(family: string, src: string, type: string): void;
    addErrorEventListener(errname: string, handler: (type: number, desc: string, param: number) => void): void;
    showLogoImage(b: boolean): void;
    setLogoImageNode(node: any): void;
    _setLogoImageNode(node: any): void;
    setRunInfoNode(node: any): void;
    getLogoImageState(): boolean;
    popToast(msg: string): void;
    /**
     * 窗口大小发生改变了。第一次调用
     * @param cb 回调函数。 
     */
    setOnResize(cb: (w: number, h: number) => void): void;
    commitStream(cmds: string): void;
    JSToJavaBridge(jsname: string, method: string, jsonparam: string): void;
    printTextureManagerInfo(): void;
    byteCompress(dt: ArrayBuffer): void;
    byteUnCompress(dt: ArrayBuffer): ArrayBuffer;
    setMaxFPS(fps: number): void;
    showFPS(x:number,y:number):void;
    getCountVertext():number;
    getCountGroup():number;
    getCountNode():number;
    setSensorAble(b:boolean):void;
    createArrayBufferRef(buffer:any, type:number,isSyncToRender:boolean,refType:number);
    updateArrayBufferRef(bufferID:number,isSyncToRender:boolean, buffer:any);
    syncArrayBufferDataToRuntime(bufferID:number,isSyncToRender:boolean, buffer:any);
    calcMatrixFromScaleSkewRotation(nArrayBufferID:number, matrixFlag:number, matrixResultID:number, x:number, y:number, pivotX:number, pivotY:number, scaleX:number, scaleY:number, skewX:number, skewY:number, rotate:number);
    setGLTemplate(type:number,templateID);
    setEndGLTemplate(type:number,templateID);
    matrix4x4Multiply(m1:any,m2:any,out:any);
    evaluateClipDatasRealTime(nodes:any, playCurTime:number, realTimeCurrentFrameIndexs:any, addtive:boolean, frontPlay:boolean);
    

    /**
     * conch_jsgcdebug 对象在被垃圾回收后的会回调指定的func，传入一个对象id。
     */
    setOnGCCallback(func:(objid:number)=>void): void;
    /**
     * 给调试器发送一个命令。
     * @param jsonmsg 是一个json字符串
     */
    sendDbgMsg(jsonmsg: string): void;
    //供扩展用
    config: conchConfig;
    market: any;
    notify: any;
    /**
     * 在js引擎的调试环境中执行一段脚本。
     * 给v8用。实际封装在一个函数中，参数是  exec_state
     */
    runJsInDbg(str: string): void;
    /**
     * @param priority 0 普通， 1低
     */
    _loadUrl(url: string, priority: number,
        option: { opttimeout: number, nocache: boolean },
        onComp: (buf: ArrayBuffer) => void,
        onError: (e: Error) => void,
        onProg: () => number): void;
    /**
     * post 数据
     */
    _postUrl(url: string, priority: number,
        data: string | ArrayBuffer | DataView,
        option: { opttimeout: number, nocache: boolean },
        onComp: (buf: ArrayBuffer) => void,
        onError: (e: Error) => void,
        onProg: () => number): void;
        
    /**
     * 网络错误事件处理
     * @param h 如果返回true，则系统不提示，否则会弹toast
     */
    _setNetworkEvtHandler(
        h: (evt: {
            name: string,
            desc: string,
            nettype: number,
            speed: number,
            httpcode: number,
            url: string
            param: number,
        }) => boolean);
        
    /**
     * 代替上面的函数
     */
    _onNetworkEvt(name: 'download_connecterror', handler: (evt: {
        desc: string,
        nettype: number,
        httpcode: number,
        url: string
    }) => boolean);

    _onNetworkEvt(name: 'download_timeout', handler: (evt: {
        nettype: number,
        httpcode: number,
        url: string
    }) => boolean);
    _onNetworkEvt(name: 'download_404', handler: (evt: {
        nettype: number,
        httpcode: number,
        url: string
    }) => boolean);

    _onNetworkEvt(name: 'download_chksumerror', handler: (evt: {
        nettype: number,
        should: string,
        actual: string,
        url: string
    }) => boolean);

    _onNetworkEvt(name: 'networkSlowly', handler: (evt: {
        nettype: number,
        httpcode: number,
        url: string,
        speed: number
    }) => boolean);

    _onNetworkEvt(name: 'networkChanged', handler: (evt: {
        nettype: number,
    }) => boolean);

    _onNetworkEvt(name: string, handler: (evt: {
        desc: string,
        nettype: number,
        httpcode: number,
        url: string,
        should: string,
        actual: string,
        speed: number,
        param: number,
    }) => boolean);
    
    /**是否发送fps数据 */
    _sendFPS(b:boolean):void;
    /**间隔多长时间发送fps数据 */
    _setSendFPSTime(delay:number):void;
    /**获得缓存路径 */
    getCachePath():string;
    /**从assets中读取文件内容 */
    readFileFromAsset(file:string,encode:'utf8'):string|ArrayBuffer;
    readFileFromAsset(file:string,encode:'raw'):string|ArrayBuffer;
    readFileFromAsset(file:string,encode:string):string|ArrayBuffer;
    
    bufferToString(buf:ArrayBuffer):string;
    stringToBuffer(str:string):ArrayBuffer;
    /**
     * 胡高加的。为了给某些项目使用。实际没有在引擎中定义。
     */
    disableMultiTouch:boolean; 
    //js扩展
    maxFPS:number;
    maxInterval:number;
    otherBuffer:ArrayBuffer;
    otherDataView:DataView;
    setBuffer(buf:ArrayBuffer):void;
    setCmdBuffer(buf:ArrayBuffer):void;
    set2DCmdBuffer(buf:ArrayBuffer):void;
    strTobufer(s:string):ArrayBuffer;
    /**
     * 注册一个shaderdefine
     */
    regShaderDefine(name:string,value:number):void;
    /**
     * 希望的屏幕大小
     */
    _canvPosX:number;
    _canvPosY:number;
}

interface TextMetrics {
    width: number;
    height:number;
}

interface _console{
    log(type:LogLevel,msg:string):void;
}
declare var conch: conch;
declare var conchTextCanvas:conchTextCanvas;
declare var _console:_console;
//declare function require(f:string):any;

interface func_downloadProg{
	(total:number,now:number,speed:number):number;
}

interface Stats {
    isFile(): boolean;
    isDirectory(): boolean;
    isBlockDevice(): boolean;
    isCharacterDevice(): boolean;
    isSymbolicLink(): boolean;
    isFIFO(): boolean;
    isSocket(): boolean;
    dev: number;
    ino: number;
    mode: number;
    nlink: number;
    uid: number;
    gid: number;
    rdev: number;
    size: number;
    blksize: number;
    blocks: number;
    atime: Date;
    mtime: Date;
    ctime: Date;
    birthtime: Date;
}

/**
 * 用来做析构通知的。如果希望某个对象析构的时候获得通知，需要在这个对象中new conch_jsgcdebug
 * 需要 conch.setOnGCCallback的配合，gc会通知到那里指定的函数。
 */
interface conch_jsgcdebug{
    id:number;
}
    
declare var createProcess:(js:string,url:string)=>void;
declare var closeCurProcess:()=>void;
declare var reloadCurProcess:()=>void;
declare var urlBack:()=>void;
declare var urlForward:()=>void;
declare var setOnActive:(cb:()=>void)=>void;
declare var setOnDeactive:(cb:()=>void)=>void;
/**
 * @param url 远程地址
 * @param local 存到本地文件
 * @param onprog 进度回调
 * @param oncomp 完成回调
 * @param trynum 重试次数（0无限重试） 
 * @param opttimeout 超时时间，
 * 注意如果成功了不会返回ArrayBuffer，不要使用这个参数。因为可能太大。
 */
declare var downloadBigFile:(url:string,
	local:string,
	onprog:(total:number,now:number,speed:number)=>boolean,oncomp:(curlret:number, httpret:number)=>void,
	trynum:number,
	opttimeout:number)=>void;
/**
 * @param trynum 尝试次数，不能为0
 */
declare var downloadGetHeader:(url:string,
	oncomp:(curlret:number, httpret:number, data:string)=>void,
	trynum:number,
	opttimeout:number)=>void;
declare var fs_exists:(file:string)=>boolean;
declare var fs_mkdir:(file:string)=>boolean;
declare var fs_rm:(file:string)=>boolean;
/**
 * 异步删除一个目录。
 */
declare var fs_rmDir:(path:string,prog:(now:number,total:number)=>void, end:()=>void,err:(e:string)=>void)=>boolean;
declare var fs_rmDirSync:(path:string)=>boolean;
declare var fs_writeFileSync:(file:string,data:string|ArrayBuffer)=>boolean;
declare var fs_readFileSync:(file:string)=>ArrayBuffer;
declare var fs_readdirSync:(path:string)=>string [];
declare var fs_lstatSync:(path:string)=>{isDirectory:boolean,isFile:boolean,size:number,mtime:number};
declare var getInnerHeight:()=>number;
declare var getInnerWidth:()=>number;
declare var getDevicePixelRatio:()=>number;
declare var enableTouch:number;
declare var alert:(msg?:any)=>void; 
declare var IsStreamMode:()=>boolean;
declare var reloadJS:(force:boolean)=>void;
declare var showAlertOnJsException:(b:boolean)=>void;
declare var decodeTemp:(s:string)=>string;
//alert1:(msg:string,func:any)=>void;
declare var tmGetCurms:()=>number;
declare var PerfUpdateDt:(id:number, dt:number)=>void;
declare var PerfAddData:(id:number,color:number,scale:number,alert:number)=>void;
declare var PerfDelData:(id:number)=>void;
declare var PerfShow:(b:number)=>void;
declare var readFileSync:(file:string,encode:string)=>string;
declare var readBinFileSync:(file:string)=>ArrayBuffer;
declare var writeStrFileSync:(file:string,content:string)=>void;
declare var JSBegin:()=>void;
declare var JSEnd:()=>void;
declare var showLoadingView:(b:boolean)=>void;
declare var readTextAsset:(file:string)=>string;
declare var setJoystickEvtFunction:(cb:(type:number,thumbL_xoff:number,thumbL_yoff:number,thumbR_xoff:number,thumbR_yoff:number,LT_offset:number,RT_offset:number)=>void)=>void;
declare var simAndroidDeviceLosted:()=>void;
declare var getExePath:()=>string;
declare var dbg_uploadAllLog:()=>void;
declare var _uploadFile:(file:string,url:string,user:string)=>void;
declare var dbg_AlertOnJsException:(b:boolean)=>void;
declare var calcmd5:(buf:ArrayBuffer)=>string;
declare var dbg_flog:(msg:string)=>void;
declare var gc:()=>void;
/**
 * runtimeinit.js
 */
interface Window{
     require:(file:string)=>Object;
}
declare var require:(file:string)=>Object;

declare class _conchParticleTemplate2D
{
     conchID:number;
     setShader(id:number,vs:String,ps:String):void;
} 

declare var conchToBase64FlipY:(type, encoderOptions, buffer:ArrayBuffer, width, height)=>string;
declare var conchToBase64:(type, encoderOptions, buffer:ArrayBuffer, width, height)=>string;