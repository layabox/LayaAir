import { KGMiniAdapter } from "././KGMiniAdapter";
import { Laya } from "./../../../../../../core/src/Laya";
import { MiniSound } from "./../../../../../bd/src/laya/bd/mini/MiniSound";
import { Input } from "../../../../../../core/src/laya/display/Input"
	import { Event } from "../../../../../../core/src/laya/events/Event"
	import { Matrix } from "../../../../../../core/src/laya/maths/Matrix"
	import { SoundManager } from "../../../../../../core/src/laya/media/SoundManager"
	import { Render } from "../../../../../../core/src/laya/renders/Render"
	import { Browser } from "../../../../../../core/src/laya/utils/Browser"
	import { RunDriver } from "../../../../../../core/src/laya/utils/RunDriver"
	
	/** @private **/
	export class MiniInput {
		constructor(){
		}
		
		private static _createInputElement():void {
			Input['_initInput'](Input['area'] = Browser.createElement("textarea"));
			Input['_initInput'](Input['input'] = Browser.createElement("input"));
			
			Input['inputContainer'] = Browser.createElement("div");
			Input['inputContainer'].style.position = "absolute";
			Input['inputContainer'].style.zIndex = 1E5;
			Browser.container.appendChild(Input['inputContainer']);
			//[IF-SCRIPT] Input['inputContainer'].setPos = function(x:int, y:int):void { Input['inputContainer'].style.left = x + 'px'; Input['inputContainer'].style.top = y + 'px'; };
			
			//xiaosong add
			//运行环境判断
			var model:string= KGMiniAdapter.systemInfo.model;
			var system:string = KGMiniAdapter.systemInfo.system;
			Browser.onAndroid = true;
			Browser.onIPhone = false;
			Browser.onIOS = false;
			Browser.onIPad = false;
			
			Laya.stage.on("resize", null, MiniInput._onStageResize);
			
			//xiaosong add
			KGMiniAdapter.window.qg.onWindowResize && KGMiniAdapter.window.qg.onWindowResize(function(res:any):void {
				KGMiniAdapter.window.dispatchEvent && KGMiniAdapter.window.dispatchEvent("resize");
			});
			
			//替换声音
			SoundManager._soundClass = MiniSound;
			SoundManager._musicClass = MiniSound;
			
		}
		
		private static _onStageResize():void {
			var systemInfo:any = KGMiniAdapter.systemInfo;
			if(systemInfo && systemInfo.platform == "h5")
				return;
			var ts:Matrix = Laya.stage._canvasTransform.identity();
			ts.scale((Browser.width / Render.canvas.width / RunDriver.getPixelRatio()), Browser.height / Render.canvas.height / RunDriver.getPixelRatio());
		}
		
		 static wxinputFocus(e:any):void {
			debugger;
			var _inputTarget:any = Input['inputElement'].target;
			if (_inputTarget && !_inputTarget.editable) {
				return;//非输入编辑模式
			}
			KGMiniAdapter.window.qg.offKeyboardConfirm();
			KGMiniAdapter.window.qg.offKeyboardInput();
			//显示键盘
			KGMiniAdapter.window.qg.showKeyboard({defaultValue: _inputTarget.text, maxLength: _inputTarget.maxChars, multiple: _inputTarget.multiline, enterHold: true, enterType: 'done', success: function(res:any):void {
				debugger;
			}, fail: function(res:any):void {
				debugger;
			}});
			//输入确认
			KGMiniAdapter.window.qg.onKeyboardConfirm(function(res:any):void {
				debugger;
				var str:string = res ? res.value : "";
				// 对输入字符进行限制
				if (_inputTarget._restrictPattern) {
					// 部分输入法兼容
					str = str.replace(/\u2006|\x27/g, "");
					if (_inputTarget._restrictPattern.test(str)) {
						str = str.replace(_inputTarget._restrictPattern, "");
					}
				}
				_inputTarget.text = str;
				_inputTarget.event(Event.INPUT);
				MiniInput.inputEnter();
			});
			//输入时调用
			KGMiniAdapter.window.qg.onKeyboardInput(function(res:any):void {
				debugger;
				var str:string = res ? res.value : "";
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
				_inputTarget.event(Event.INPUT);
			});
		}
		
		 static inputEnter():void {
			Input['inputElement'].target.focus = false;
		}
		
		 static wxinputblur():void {
			MiniInput.hideKeyboard();
		}
		
		 static hideKeyboard():void {
			KGMiniAdapter.window.qg.offKeyboardConfirm();
			KGMiniAdapter.window.qg.offKeyboardInput();
			KGMiniAdapter.window.qg.hideKeyboard({success: function(res:any):void {
				debugger;
				console.log('隐藏键盘')
			}, fail: function(res:any):void {
				console.log("隐藏键盘出错:" + (res ? res.errMsg : ""));
				debugger;
			}});
		}
	}

