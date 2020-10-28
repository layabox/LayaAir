package laya.net {
	public interface loadItem {
		function get url():String;
		function get type():String;
		function get size():Number;
		function get priority():Number;
		function get useWorkerLoader():Boolean;
		function get progress():Number;
		function get group():String;
	}

}
