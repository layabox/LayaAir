/*[IF-FLASH]*/
package {
	/**微信小程序API接口，只有在微信内才生效*/
	public var wx:WX;
}

/**
 * @private
 * 微信小程序API接口
 */
class WX {
	
	/**
	 * 创建一个画布对象。首次调用创建的是显示在屏幕上的画布，之后调用创建的都是离屏画布。
	 */
	public function createCanvas():* {
		return null;
	}
	
	/**
	 * 创建一个图片对象
	 */
	public function createImage():* {
		return null;
	}
	
	/**
	 * 获取一行文本的行高
	 */
	public function getTextLineHeight(object:Object):Number {
		return 0;
	}
	
	/**
	 * 加载自定义字体文件
	 */
	public function loadFont(path:String):String {
		return "font";
	}
	
	/**
	 * 可以修改渲染帧率。默认渲染帧率为 60 帧每秒。修改后，requestAnimationFrame 的回调频率会发生改变。
	 */
	public function setPreferredFramesPerSecond(fps:int):void {
	}
	
	/**
	 * 退出当前小游戏
	 */
	public function exitMiniProgram(object:Object):void {
	}
	
	/**
	 * 返回小程序启动参数
	 */
	public function getLaunchOptionsSync():Object {
		return null;
	}
	
	/**
	 * 监听小游戏隐藏到后台事件。锁屏、按 HOME 键退到桌面、显示在聊天顶部等操作会触发此事件。
	 */
	public function onHide(callBack:Function):void {
	}
	
	/**
	 * 取消监听小游戏隐藏到后台事件。锁屏、按 HOME 键退到桌面、显示在聊天顶部等操作会触发此事件。
	 */
	public function offHide(callBack:Function):void {
	}
	
	/**
	 * 监听小游戏回到前台的事件
	 */
	public function onShow(callBack:Function):void {
	}
	
	/**
	 * 取消监听小游戏回到前台的事件
	 */
	public function offShow(callBack:Function):void {
	}
	
	/**
	 * 获取系统信息
	 */
	public function getSystemInfo(object:Object):void {
	}
	
	/**
	 * wx.getSystemInfo 的同步版本
	 */
	public function getSystemInfoSync():Object {
		return null;
	}
	
	/**
	 * 监听全局错误事件
	 */
	public function onError(callBack:Function):void {
	}
	
	/**
	 * 取消监听全局错误事件
	 */
	public function offError(callBack:Function):void {
	}
	
	/**
	 * 监听加速度数据，频率：5次/秒，接口调用后会自动开始监听，可使用 wx.stopAccelerometer 停止监听。
	 */
	public function onAccelerometerChange(callBack:Function):void {
	}
	
	/**
	 * 开始监听加速度数据。
	 */
	public function startAccelerometer(object:Object):void {
	}
	
	/**
	 * 停止监听加速度数据。
	 */
	public function stopAccelerometer(object:Object):void {
	}
	
	/**
	 * 获取设备电量
	 */
	public function getBatteryInfo(object:Object):void {
	}
	
	/**
	 * wx.getBatteryInfo 的同步版本
	 */
	public function getBatteryInfoSync():String {
		return null;
	}
	
	/**
	 * 获取系统剪贴板的内容
	 */
	public function getClipboardData(object:Object):void {
	}
	
	/**
	 * 设置系统剪贴板的内容
	 */
	public function setClipboardData(object:Object):void {
	}
	
	/**
	 * 监听罗盘数据，频率：5 次/秒，接口调用后会自动开始监听，可使用 wx.stopCompass 停止监听。
	 */
	public function onCompassChange(callBack:Function):void {
	}
	
	/**
	 * 开始监听罗盘数据
	 */
	public function startCompass(object:Object):void {
	}
	
	/**
	 * 停止监听罗盘数据
	 */
	public function stopCompass(object:Object):void {
	}
	
	/**
	 * 获取网络类型
	 */
	public function getNetworkType(object:Object):void {
	}
	
	/**
	 * 监听网络状态变化事件
	 */
	public function onNetworkStatusChange(callBack:Function):void {
	}
	
	/**
	 * 获取屏幕亮度
	 */
	public function getScreenBrightness(object:Object):void {
	}
	
	/**
	 * 设置是否保持常亮状态。仅在当前小程序生效，离开小程序后设置失效。
	 */
	public function setKeepScreenOn(object:Object):void {
	}
	
	/**
	 * 设置屏幕亮度
	 */
	public function setScreenBrightness(object:Object):void {
	}
	
	/**
	 * 使手机发生较短时间的振动（15 ms）
	 */
	public function vibrateShort(object:Object):void {
	}
	
	/**
	 * 使手机发生较长时间的振动（400 ms)
	 */
	public function vibrateLong(object:Object):void {
	}
	
	/**
	 * 获取当前的地理位置、速度。当用户离开小程序后，此接口无法调用；当用户点击“显示在聊天顶部”时，此接口可继续调用。
	 */
	public function getLocation(object:Object):void {
	}
	
	/**
	 * 下载文件资源到本地，客户端直接发起一个 HTTP GET 请求，返回文件的本地文件路径。
	 */
	public function downloadFile(object:Object):void {
	}
	
	/**
	 * 发起网络请求。
	 */
	public function request(object:Object):void {
	}
	
	/**
	 * 创建一个 WebSocket 连接。最多同时存在 2 个 WebSocket 连接。
	 */
	public function connectSocket(object:Object):void {
	}
	
	/**
	 * 关闭 WeSocket 连接
	 */
	public function closeSocket(object:Object):void {
	}
	
	/**
	 * 监听WebSocket 连接打开事件
	 */
	public function onSocketOpen(callBack:Function):void {
	}
	
	/**
	 * 监听WebSocket 连接关闭事件
	 */
	public function onSocketClose(callBack:Function):void {
	}
	
	/**
	 * 监听WebSocket 接受到服务器的消息事件
	 */
	public function onSocketMessage(callBack:Function):void {
	}
	
	/**
	 * 监听WebSocket 错误事件
	 */
	public function onSocketError(callBack:Function):void {
	}
	
	/**
	 * 通过 WebSocket 连接发送数据，需要先 wx.connectSocket，并在 wx.onSocketOpen 回调之后才能发送。
	 */
	public function sendSocketMessage(callBack:Function):void {
	}
	
	/**
	 * 将本地资源上传到开发者服务器，客户端发起一个 HTTPS POST 请求，其中 content-type 为 multipart/form-data 。
	 */
	public function uploadFile(object:Object):void {
	}
	
	/**
	 * 通过 wx.login 接口获得的用户登录态拥有一定的时效性。用户越久未使用小程序，用户登录态越有可能失效。反之如果用户一直在使用小程序，则用户登录态一直保持有效。具体时效逻辑由微信维护，对开发者透明。开发者只需要调用 wx.checkSession 接口检测当前用户登录态是否有效。登录态过期后开发者可以再调用 wx.login 获取新的用户登录态。
	 */
	public function checkSession(object:Object):void {
	}
	
	/**
	 * 调用接口获取登录凭证（code）进而换取用户登录态信息，包括用户的唯一标识（openid） 及本次登录的 会话密钥（session_key）等。用户数据的加解密通讯需要依赖会话密钥完成。
	 */
	public function login(object:Object):void {
	}
	
	/**
	 * 提前向用户发起授权请求。调用后会立刻弹窗询问用户是否同意授权小程序使用某项功能或获取用户的某些数据，但不会实际调用对应接口。如果用户之前已经同意授权，则不会出现弹窗，直接返回成功。
	 */
	public function authorize(object:Object):void {
	}
	
	/**
	 * 获取用户信息，withCredentials 为 true 时需要先调用 wx.login 接口。需要用户授权 scope.userInfo
	 */
	public function getUserInfo(object:Object):void {
	}
	
	/**
	 * 获取用户的当前设置。返回值中只会出现小程序已经向用户请求过的权限。
	 */
	public function getSetting(object:Object):void {
	}
	
	/**
	 * 调起客户端小程序设置界面，返回用户设置的操作结果。设置界面只会出现小程序已经向用户请求过的权限。
	 */
	public function openSetting(object:Object):void {
	}
	
	/**
	 * 获取用户过去三十天微信运动步数，需要先调用 wx.login 接口。需要用户授权 scope.werun。
	 */
	public function getWeRunData(object:Object):void {
	}
	
	/**
	 * 获取转发详细信息
	 */
	public function getShareInfo(object:Object):void {
	}
	
	/**
	 * 隐藏转发按钮
	 */
	public function hideShareMenu(object:Object):void {
	}
	
	/**
	 * 监听用户点击右上角菜单的“转发”按钮时触发的事件
	 */
	public function onShareAppMessage(callBack:Function):void {
	}
	
	/**
	 * 取消监听用户点击右上角菜单的“转发”按钮时触发的事件
	 */
	public function offShareAppMessage(callBack:Function):void {
	}
	
	/**
	 * 显示当前页面的转发按钮
	 */
	public function showShareMenu(object:Object):void {
	}
	
	/**
	 * 主动拉起转发，进入选择通讯录界面。
	 */
	public function shareAppMessage(object:Object):void {
	}
	
	/**
	 * 更新转发属性
	 */
	public function updateShareMenu(object:Object):void {
	}
	
	/**
	 * 设置是否打开调试开关，此开关对正式版也能生效。
	 */
	public function setEnableDebug(object:Object):void {
	}
	
	/**
	 * 隐藏消息提示框
	 */
	public function hideToast(object:Object):void {
	}
	
	/**
	 * 隐藏 loading 提示框
	 */
	public function hideLoading(object:Object):void {
	}
	
	/**
	 * 显示模态对话框
	 */
	public function showModal(object:Object):void {
	}
	
	/**
	 * 显示消息提示框
	 */
	public function showToast(objsect:Object):void {
	}
	
	/**
	 * 显示 loading 提示框, 需主动调用 wx.hideLoading 才能关闭提示框
	 */
	public function showLoading(object:Object):void {
	}
	
	public function showActionSheet(object:Object):void {
	}
	
	/**
	 * 隐藏键盘
	 */
	public function hideKeyboard(object:Object):void {
	}
	
	/**
	 * 监听键盘输入事件
	 */
	public function onKeyboardInput(callBack:Function):void {
	}
	
	/**
	 * 取消监听键盘输入事件
	 */
	public function offKeyboardInput(callBack:Function):void {
	}
	
	/**
	 * 监听用户点击键盘 Confirm 按钮时的事件
	 */
	public function onKeyboardConfirm(callBack:Function):void {
	}
	
	/**
	 * 取消监听用户点击键盘 Confirm 按钮时的事件
	 */
	public function offKeyboardConfirm(callBack:Function):void {
	}
	
	/**
	 * 监听监听键盘收起的事件
	 */
	public function onKeyboardComplete(callBack:Function):void {
	}
	
	/**
	 * 取消监听监听键盘收起的事件
	 */
	public function offKeyboardComplete(callBack:Function):void {
	}
	
	/**
	 * 显示键盘
	 */
	public function showKeyboard(object:Object):void {
	}
	
	/**
	 * 动态设置通过右上角按钮拉起的菜单的样式。
	 */
	public function setMenuStyle(object:Object):void {
	}
	
	/**
	 * 监听窗口尺寸变化事件
	 */
	public function onWindowResize(callBack:Function):void {
	}
	
	/**
	 * 取消监听窗口尺寸变化事件
	 */
	public function offWindowResize(callBack:Function):void {
	}
	
	/**
	 * 创建一个 Worker 线程，目前限制最多只能创建一个 Worker，创建下一个 Worker 前请调用
	 */
	public function createWorker():* {
		return null;
	}
	
	/**
	 * 创建一个 InnerAudioContext 实例
	 */
	public function createInnerAudioContext():* {
		return null;
	}
	
	/**
	 * 获取全局唯一的 RecorderManager
	 */
	public function getRecorderManager():* {
		return null;
	}
	
	/**
	 * 从本地相册选择图片或使用相机拍照。
	 */
	public function chooseImage(object:Object):void {
	}
	
	/**
	 * 预览图片
	 */
	public function previewImage(object:Object):void {
	}
	
	/**
	 * 保存图片到系统相册。需要用户授权 scope.writePhotosAlbum
	 */
	public function saveImageToPhotosAlbum(object:Object):void {
	}
	
	/**
	 * 创建视频
	 */
	public function createVideo(object:Object):void {
	}
	
	/**
	 * 获取性能管理器
	 */
	public function getPerformance():* {
		return null;
	}
	
	/**
	 * 加快触发 JavaScrpitCore Garbage Collection（垃圾回收），GC 时机是由 JavaScrpitCore 来控制的，并不能保证调用后马上触发 GC。
	 */
	public function triggerGC():void {
	}
	
	/**
	 * 用户登录上报，一般在第一次登陆上报是在游戏内完成选择分区分服之后进行上报。后续登录上报为在wx.onShow内进行上报。该接口在开发者工具不生效。
	 */
	public function gameLoginReport(object:Object):void {
	}
	
	/**
	 * 用户登出上报，一般在 wx.onHide 回调内执行登录上报，下一次 wx.onShow 回调作为重新登录。该接口在开发者工具不生效。
	 */
	public function gameLogoutReport(object:Object):void {
	}
	
	/**
	 * 获取全局唯一的文件管理器
	 */
	public function getFileSystemManager():* {
		return null;
	}
}