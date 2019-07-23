import { Browser } from "laya/utils/Browser"
	
	/**
	 * ...
	 * @author ww
	 */
	export class FileSaver
	{
		
		constructor(){
		
		}
		 static dataURLtoBlob(dataurl:string):any
		{
			var arr:any[] = dataurl.split(',');
			var mime:string = arr[0].match(/:(.*?);/)[1];
			var bstr:string = Browser.window.atob(arr[1]);
			var n:number = bstr.length;
			var u8arr:Uint8Array = new Uint8Array(n);
			while (n--)
			{
				u8arr[n] = bstr.charCodeAt(n);
			}
			return new ((<new()=>any>FileSaver.createBlob([u8arr], {type: mime}) ));
		}
		
		 static createBlob(arr:any[], option:any):any
		{
			var blob:any;
			blob = new Blob(arr, option);;
			return blob;
		}
		
		 static saveBlob(blob:any, filename:string):void
		{
			Browser.window.saveAs(blob, filename);
		}
		 static saveTxtFile(filename:string, content:string):void
		{ //保存
			FileSaver.saveBlob(FileSaver.createBlob([content],{type: "text/plain;charset=utf-8"}),filename);
		}
		 static saveCanvas(filename:string, canvas:any):void
		{
			var dataurl:string = canvas.toDataURL('image/png');
			var blob:any= FileSaver.dataURLtoBlob(dataurl);
			FileSaver.saveBlob(blob, filename);
		}
	}


