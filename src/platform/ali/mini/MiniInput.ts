import { Browser } from "laya/utils/Browser";
import { Input } from "laya/display/Input";
import { ALIMiniAdapter } from "./ALIMiniAdapter";
import { SoundManager } from "laya/media/SoundManager";
import { MiniSound } from "./MiniSound";
import { Matrix } from "laya/maths/Matrix";
import { Render } from "laya/renders/Render";
import { Laya } from "Laya";
import { Event } from "laya/events/Event";	
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
			
			Laya.stage.on("resize", null, MiniInput._onStageResize);
			
			ALIMiniAdapter.window.my.onWindowResize && ALIMiniAdapter.window.my.onWindowResize(function(res:any):void {
				// ALIMiniAdapter.window.dispatchEvent && window.dispatchEvent("resize");
			});
			
			//替换声音
			SoundManager._soundClass = MiniSound;
			SoundManager._musicClass = MiniSound;
			
			//运行环境判断
			var model:string= ALIMiniAdapter.systemInfo.model;
			var system:string = ALIMiniAdapter.systemInfo.system;
			if(model.indexOf("iPhone") != -1)
			{
				Browser.onIPhone = true;
				Browser.onIOS = true;
				Browser.onIPad = true;
				Browser.onAndroid = false;
			}
			if(system.indexOf("Android") != -1 || system.indexOf("Adr") != -1)
			{
				Browser.onAndroid = true;
				Browser.onIPhone = false;
				Browser.onIOS = false;
				Browser.onIPad = false;
			}
		}
		
		private static _onStageResize():void {
			var ts:Matrix = Laya.stage._canvasTransform.identity();
			ts.scale((Browser.width / Render.canvas.width / Browser.pixelRatio), Browser.height / Render.canvas.height / Browser.pixelRatio);
		}
		
		 static wxinputFocus(e:any):void {
			var _inputTarget:any = Input['inputElement'].target;
			if (_inputTarget && !_inputTarget.editable) {
				return;//非输入编辑模式
			}
			ALIMiniAdapter.window.my.offKeyboardConfirm();
			ALIMiniAdapter.window.my.offKeyboardInput();
			ALIMiniAdapter.window.my.showKeyboard({defaultValue: _inputTarget.text, maxLength: _inputTarget.maxChars, multiple: _inputTarget.multiline, confirmHold: true, confirmType: _inputTarget["confirmType"]||'done', success: function(res:any):void {
			}, fail: function(res:any):void {
			}});
			
			ALIMiniAdapter.window.my.onKeyboardConfirm(function(res:any):void {
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
				_inputTarget.event("confirm");
			})
			ALIMiniAdapter.window.my.onKeyboardInput(function(res:any):void {
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
			ALIMiniAdapter.window.my.offKeyboardConfirm();
			ALIMiniAdapter.window.my.offKeyboardInput();
			ALIMiniAdapter.window.my.hideKeyboard({success: function(res:any):void {
				console.log('隐藏键盘')
			}, fail: function(res:any):void {
				console.log("隐藏键盘出错:" + (res ? res.errMsg : ""));
			}});
		}
	}

