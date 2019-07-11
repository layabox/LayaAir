import { MiniAdpter } from "./MiniAdpter";
import { Handler } from "laya/utils/Handler";
import { Laya } from "../../../../bin/tsc/layaAir/Laya";
import { Browser } from "laya/utils/Browser";
import { Loader} from "laya/net/Loader";
import { URL } from "laya/net/URL";
	/** @private **/
	export class MiniFileMgr{
		/**@private 读取文件操作接口**/
		private static fs:any = (<any>window).wx.getFileSystemManager();
		/**@private 下载文件接口**/
		private static wxdown:any = (<any>window).wx.downloadFile;
		/**@private 文件缓存列表**/
		 static filesListObj:any = {};
		/**@private 文件磁盘路径**/
		 static fileNativeDir:string;
		/**@private 存储在磁盘的文件列表名称**/
		 static fileListName:string = "layaairfiles.txt";
		/**@private 子域数据存储对象**/
		 static ziyuFileData:any = {};
		/**子域图片磁盘缓存路径存储对象**/
		 static ziyuFileTextureData:any = {};
		/**加载路径设定(相当于URL.rootPath)**/
		 static loadPath:string = "";
		/**@private **/
		 static DESCENDING : number = 2;
		/**@private **/
		 static NUMERIC : number = 16;
		/**
		 * @private 
		 * 是否是本地4M包文件 
		 * @param url
		 * @return 
		 */		
		 static isLocalNativeFile(url:string):boolean
		{
			for(var i:number = 0,sz:number = MiniAdpter.nativefiles.length;i<sz;i++)
			{
				//优化调整  if(url.indexOf(MiniAdpter.nativefiles[i]) == 0)
				if(url.indexOf(MiniAdpter.nativefiles[i]) != -1)
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
		 static getFileInfo(fileUrl:string):any {
			var fileNativePath:string = fileUrl;//.split("?")[0];?????这里好像不需要
			var fileObj:any = MiniFileMgr.filesListObj[fileNativePath];//这里要去除?好的完整路径
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
		 static read(filePath:string, encoding:string = "ascill", callBack:Handler = null, readyUrl:string = "",isSaveFile:boolean = false,fileType:string = ""):void {
			var fileUrl:string;
			if(readyUrl!= "" && (readyUrl.indexOf("http://") != -1 || readyUrl.indexOf("https://") != -1))
			{
				fileUrl= MiniFileMgr.getFileNativePath(filePath)
			}else
			{
				fileUrl = filePath;
			}
			fileUrl = URL.getAdptedFilePath(fileUrl);
			MiniFileMgr.fs.readFile({filePath: fileUrl, encoding: encoding, success: function(data:any):void {
				callBack != null && callBack.runWith([0, data]);
			}, fail: function(data:any):void {
				if (data && readyUrl != "")
					MiniFileMgr.downFiles(readyUrl, encoding, callBack, readyUrl,isSaveFile,fileType);
				else
					callBack != null && callBack.runWith([1]);
			}});
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
		 static downFiles(fileUrl:string, encoding:string = "ascii", callBack:Handler = null, readyUrl:string = "",isSaveFile:boolean = false,fileType:string = "",isAutoClear:boolean =true):void {
			var downloadTask:any = MiniFileMgr.wxdown({url: fileUrl, success: function(data:any):void {
				if (data.statusCode === 200)
					MiniFileMgr.readFile(data.tempFilePath, encoding, callBack, readyUrl,isSaveFile,fileType,isAutoClear);
				else
					if(data.statusCode === 403)
					{
						callBack != null && callBack.runWith([0, fileUrl]);//修复本地加载非本地列表的配置文件处理
					}else
					{
						callBack != null && callBack.runWith([1, data]);
					}
			}, fail: function(data:any):void {
				callBack != null && callBack.runWith([1, data]);
			}});
			//获取加载进度
			downloadTask.onProgressUpdate(function(data:any):void {
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
		 static readFile(filePath:string, encoding:string = "ascill", callBack:Handler = null, readyUrl:string = "", isSaveFile:boolean = false, fileType:string = "", isAutoClear:boolean = true):void {
			filePath = URL.getAdptedFilePath(filePath);
			MiniFileMgr.fs.readFile({filePath: filePath, encoding: encoding, success: function(data:any):void {
				if (filePath.indexOf("http://") != -1 || filePath.indexOf("https://") != -1)
				{
					if(MiniAdpter.autoCacheFile || isSaveFile)
					{
						MiniFileMgr.copyFile(filePath, readyUrl, callBack,encoding,isAutoClear);
					}
				}
				else
					callBack != null && callBack.runWith([0, data]);
			}, fail: function(data:any):void {
				if (data)
					callBack != null && callBack.runWith([1, data]);
			}});
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
		 static downOtherFiles(fileUrl:string, callBack:Handler = null, readyUrl:string = "",isSaveFile:boolean = false,isAutoClear:boolean = true):void {
			MiniFileMgr.wxdown({url: fileUrl, success: function(data:any):void {
				if (data.statusCode === 200) {
					if((MiniAdpter.autoCacheFile || isSaveFile )&& readyUrl.indexOf("qlogo.cn")== -1 && readyUrl.indexOf(".php") == -1)
						MiniFileMgr.copyFile(data.tempFilePath, readyUrl, callBack,"",isAutoClear);
					else
						callBack != null && callBack.runWith([0, data.tempFilePath]);
				}else
				{
					callBack != null && callBack.runWith([1, data]);//修复下载文件返回非200状态码的bug
				}
			}, fail: function(data:any):void {
				callBack != null && callBack.runWith([1, data]);
			}});
		}

		/**
		 * @private 
		 * 下载文件 
		 * @param fileUrl 文件远端地址
		 * @param fileType 文件类型(image、text、json、xml、arraybuffer、sound、atlas、font)
		 * @param callBack 文件加载回调,回调内容[errorCode码(0成功,1失败,2加载进度)
		 * @param encoding 文件编码默认 ascill，非图片文件加载需要设置相应的编码，二进制编码为空字符串
		 */				
		 static downLoadFile(fileUrl:string, fileType:string = "",callBack:Handler = null,encoding:string = "ascii"):void
		{
			if(window.navigator.userAgent.indexOf('MiniGame') <0)
			{
				Laya.loader.load(fileUrl,callBack);
			}else
			{
				if(fileType == Loader.IMAGE || fileType == Loader.SOUND)
					MiniFileMgr.downOtherFiles(fileUrl,callBack,fileUrl,true,false);
				else
					MiniFileMgr.downFiles(fileUrl,encoding,callBack,fileUrl,true,fileType,false);
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
		private static copyFile(tempFilePath:string, readyUrl:string, callBack:Handler,encoding:string = "",isAutoClear:boolean = true):void {
			var temp:any[] = tempFilePath.split("/");
			var tempFileName:string = temp[temp.length - 1];
			var fileurlkey:string = readyUrl;//.split("?")[0];
			var fileObj:any = MiniFileMgr.getFileInfo(readyUrl);
			var saveFilePath:string = MiniFileMgr.getFileNativePath(tempFileName);
			
			//这里存储图片文件到磁盘里，需要检查磁盘空间容量是否已满50M，如果超过50M就需要清理掉不用的资源
			var totalSize:number = 50 * 1024 * 1024;//总量50M
			var chaSize:number = 4 * 1024 * 1024;//差值4M(预留加载缓冲空间,给文件列表用)
			var fileUseSize:number = MiniFileMgr.getCacheUseSize();//目前使用量
			if (fileObj) {
				if (fileObj.readyUrl != readyUrl)
				{
					MiniFileMgr.fs.getFileInfo({
						filePath:tempFilePath,
						success:function(data:any):void
						{
							if((isAutoClear && (fileUseSize + chaSize + data.size) >= totalSize))
							{
								if(data.size > MiniAdpter.minClearSize)
									MiniAdpter.minClearSize = data.size;
								MiniFileMgr.onClearCacheRes();//如果存储满了需要清理资源,检查没用的资源清理，然后在做存储
							}
							MiniFileMgr.deleteFile(tempFileName, readyUrl, callBack,encoding,data.size);
						},
						fail:function(data:any):void{
							callBack != null && callBack.runWith([1, data]);
						}
					});
				}
				else
					callBack != null && callBack.runWith([0]);
			}else
			{
				MiniFileMgr.fs.getFileInfo({
					filePath:tempFilePath,
					success:function(data:any):void
					{
						if((isAutoClear &&  (fileUseSize + chaSize + data.size) >= totalSize))
						{
							if(data.size > MiniAdpter.minClearSize)
								MiniAdpter.minClearSize = data.size;
							MiniFileMgr.onClearCacheRes();//如果存储满了需要清理资源,检查没用的资源清理，然后在做存储
						}
						MiniFileMgr.fs.copyFile({srcPath: tempFilePath, destPath: saveFilePath, success: function(data2:any):void {
							MiniFileMgr.onSaveFile(readyUrl, tempFileName,true,encoding,callBack,data.size);
						}, fail: function(data:any):void {
							callBack != null && callBack.runWith([1, data]);
						}});
					},
					fail:function(data:any):void{
						callBack != null && callBack.runWith([1, data]);
					}
				});
			}	
		}
		
		/**
		 * @private 
		 * 清理缓存到磁盘的图片,每次释放默认5M，可以配置
		 */		
		private static onClearCacheRes():void
		{
			var memSize:number = MiniAdpter.minClearSize;
			var  tempFileListArr:any[] = [];
			for(var key  in MiniFileMgr.filesListObj)
			{
				tempFileListArr.push(MiniFileMgr.filesListObj[key]);
			}
			MiniFileMgr.sortOn(tempFileListArr,"times",MiniFileMgr.NUMERIC);//按时间进行排序
			var clearSize:number = 0;
			for(var i:number = 1,sz:number = tempFileListArr.length;i<sz;i++)
			{
				var fileObj:any = tempFileListArr[i];
				if(clearSize >= memSize)
					break;//清理容量超过设置值就跳出清理操作
				clearSize += fileObj.size;
				MiniFileMgr.deleteFile("",fileObj.readyUrl);
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
		 static sortOn(array:any[], name:any, options:number=0):any[]
		{
			if (options == MiniFileMgr.NUMERIC)	return array.sort( function (a:any, b:any):number { return a[name] - b[name]; } );
			if (options == (MiniFileMgr.NUMERIC | MiniFileMgr.DESCENDING))	return array.sort( function (a:any, b:any):number { return b[name] - a[name]; } );
			return array.sort( function (a,b):any { return a[name]-b[name] } );
		}
		
		/**
		 * @private 
		 * 获取文件磁盘的路径(md5)
		 * @param fileName
		 * @return
		 */
		 static getFileNativePath(fileName:string):string {
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
		 static deleteFile(tempFileName:string, readyUrl:string = "", callBack:Handler = null,encoding:string = "",fileSize:number = 0):void {
			var fileObj:any = MiniFileMgr.getFileInfo(readyUrl);
			var deleteFileUrl:string = MiniFileMgr.getFileNativePath(fileObj.md5);
			MiniFileMgr.fs.unlink({filePath: deleteFileUrl, success: function(data:any):void {
				var isAdd:boolean = tempFileName != "" ? true : false;
				if(tempFileName != "")
				{
					var saveFilePath:string = MiniFileMgr.getFileNativePath(tempFileName);
					MiniFileMgr.fs.copyFile({srcPath: tempFileName, destPath: saveFilePath, success: function(data:any):void {
						MiniFileMgr.onSaveFile(readyUrl, tempFileName,isAdd,encoding,callBack,data.size);
					}, fail: function(data:any):void {
						callBack != null && callBack.runWith([1, data]);
					}});
				}else
				{
					MiniFileMgr.onSaveFile(readyUrl, tempFileName,isAdd,encoding,callBack,fileSize);//清理文件列表
				}
			}, fail: function(data:any):void {
			}});
		}
		
		/**
		 * @private 
		 * 清空缓存空间文件内容 
		 */		
		 static deleteAll():void
		{
			var  tempFileListArr:any[] = [];
			for(var key  in MiniFileMgr.filesListObj)
			{
				tempFileListArr.push(MiniFileMgr.filesListObj[key]);
			}
			for(var i:number = 1,sz:number = tempFileListArr.length;i<sz;i++)
			{
				var fileObj:any = tempFileListArr[i];
				MiniFileMgr.deleteFile("",fileObj.readyUrl);
			}
			//清理
			if(MiniFileMgr.filesListObj && MiniFileMgr.filesListObj.fileUsedSize)
			{
				MiniFileMgr.filesListObj.fileUsedSize = 0;
			}
			MiniFileMgr.writeFilesList("",JSON.stringify({}),false);
			
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
		 static onSaveFile(readyUrl:string, md5Name:string,isAdd:boolean = true,encoding:string = "",callBack:Handler = null,fileSize:number = 0):void {
			var fileurlkey:string = readyUrl;//.split("?")[0];
			if(MiniFileMgr.filesListObj['fileUsedSize'] == null)
				MiniFileMgr.filesListObj['fileUsedSize'] =  0;
			if(isAdd)
			{
				var fileNativeName:string = MiniFileMgr.getFileNativePath(md5Name);
				//获取文件大小为异步操作，如果放到完成回调里可能会出现文件列表获取没有内容
				MiniFileMgr.filesListObj[fileurlkey] = {md5: md5Name, readyUrl: readyUrl,size:fileSize,times:Browser.now(),encoding:encoding};
				MiniFileMgr.filesListObj['fileUsedSize'] = parseInt(MiniFileMgr.filesListObj['fileUsedSize']) + fileSize;
				MiniFileMgr.writeFilesList(fileurlkey,JSON.stringify(MiniFileMgr.filesListObj),true);
				callBack != null && callBack.runWith([0]);
			}else
			{
				if(MiniFileMgr.filesListObj[fileurlkey])
				{
					var deletefileSize:number = parseInt(MiniFileMgr.filesListObj[fileurlkey].size);
					MiniFileMgr.filesListObj['fileUsedSize']=parseInt(MiniFileMgr.filesListObj['fileUsedSize']) - deletefileSize;
					delete MiniFileMgr.filesListObj[fileurlkey];
					MiniFileMgr.writeFilesList(fileurlkey,JSON.stringify(MiniFileMgr.filesListObj),false);
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
		private static writeFilesList(fileurlkey:string,filesListStr:string,isAdd:boolean):void
		{
			var listFilesPath:string = MiniFileMgr.fileNativeDir + "/" + MiniFileMgr.fileListName;
			MiniFileMgr.fs.writeFile({filePath: listFilesPath, encoding: 'utf8', data: filesListStr, success: function(data:any):void {
			}, fail: function(data:any):void {
			}});
//			__JS__('wx').setStorage({key:listFilesPath,data:filesListStr,success:function(data:Object):void{
//				trace("-----setStorage--success------------");
//				trace(data);
//			},fail:function(data:Object):void{
//				trace("-----setStorage--fail------------");
//				trace(data);
//			}});
			//主域向子域传递消息
			if(!MiniAdpter.isZiYu &&MiniAdpter.isPosMsgYu)
			{
				MiniAdpter.window.wx.postMessage({url:fileurlkey,data:MiniFileMgr.filesListObj[fileurlkey],isLoad:"filenative",isAdd:isAdd});
			}
		}
		
		/**
		 * @private 
		 *获取当前缓存使用的空间大小(字节数，除以1024 再除以1024可以换算成M)
		 * @return 
		 */		
		 static getCacheUseSize():number
		{
			if(MiniFileMgr.filesListObj && MiniFileMgr.filesListObj['fileUsedSize'])
				return MiniFileMgr.filesListObj['fileUsedSize'];
			return 0;
		}
		/**
		 * @private 
		 * 判断资源目录是否存在
		 * @param dirPath 磁盘设定路径
		 * @param callBack 回调处理
		 */
		 static existDir(dirPath:string, callBack:Handler):void {
			MiniFileMgr.fs.mkdir({dirPath: dirPath, success: function(data:any):void {
				callBack != null && callBack.runWith([0, {data: JSON.stringify({})}]);
			}, fail: function(data:any):void {
				if (data.errMsg.indexOf("file already exists") != -1)
					MiniFileMgr.readSync(MiniFileMgr.fileListName, "utf8", callBack);
				else
					callBack != null && callBack.runWith([1, data]);
			}});
		}
		
		/**
		 * @private 
		 * 本地读取
		 * @param filePath 文件磁盘路径
		 * @param encoding 文件读取的编码格式
		 * @param callBack 回调处理
		 * @param readyUrl 文件请求加载地址
		 */
		 static readSync(filePath:string, encoding:string = "ascill", callBack:Handler = null, readyUrl:string = ""):void {
			var fileUrl:string = MiniFileMgr.getFileNativePath(filePath);
			var filesListStr:string
			try
			{
				filesListStr = MiniFileMgr.fs.readFileSync(fileUrl, encoding);
//				var tempFilesListStr:String = __JS__('wx').getStorageSync(fileUrl);
//				trace("--------tempFilesListStr:" + tempFilesListStr);
				callBack != null && callBack.runWith([0, {data: filesListStr}]);
			} 
			catch(error) 
			{
				callBack != null && callBack.runWith([1]);
			}
			
		}
		
		/**
		 * @private 
		 * 设置磁盘文件存储路径
		 * @param value 磁盘路径
		 * @return
		 */
		 static setNativeFileDir(value:string):void {
			MiniFileMgr.fileNativeDir = MiniAdpter.window.wx.env.USER_DATA_PATH + value;
		}
	}



