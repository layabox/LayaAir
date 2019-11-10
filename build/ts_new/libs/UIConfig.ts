/**全局配置*/
	export class UIConfig {
		/**是否开启触摸滚动（针对滚动条）*/
		 static touchScrollEnable:boolean = true;
		/**是否开启滑轮滚动（针对滚动条）*/
		 static mouseWheelEnable:boolean = true;
		/**是否显示滚动条按钮*/
		 static showButtons:boolean = true;
		/**弹出框背景颜色*/
		 static popupBgColor:string = "#000000";
		/**弹出框背景透明度*/
		 static popupBgAlpha:number = 0.5;
		/**模式窗口点击边缘，是否关闭窗口，默认是关闭的*/
		 static closeDialogOnSide:boolean = true;
	}
	(window as any).UIConfig = UIConfig;

