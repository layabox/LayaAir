import { View } from "laya/ui/View";

/**Created by the LayaAirIDE,do not modify.*/
/*import laya.ui.*;

	public class testUI extends View {
*/export class testUI extends View {

		 static uiView:any =/*[STATIC SAFE]*/{"type":"View","props":{"width":1334,"height":750},"child":[{"type":"Circle","props":{"y":186,"x":628,"radius":50,"lineWidth":1,"fillColor":"#ffffff"}},{"type":"Poly","props":{"y":305,"x":708,"points":"-10,20,106,-37,152,32,2,80","lineWidth":1,"lineColor":"#ff0000","fillColor":"#00ffff"}},{"type":"Curves","props":{"y":281,"x":804,"points":"0,0,64,35,102,69,95,128,16,202","lineWidth":1,"lineColor":"#ff0000"}},{"type":"Line","props":{"y":447,"x":921,"toY":150,"toX":120,"lineWidth":1,"lineColor":"#ff0000"}},{"type":"Graphic","props":{"y":136,"x":578,"skin":"comp/sound.png"}},{"type":"Rect","props":{"y":167,"x":15,"width":528,"lineWidth":1,"height":435,"fillColor":"#ff0000"}}]};
		/*override*/ protected createChildren():void {
			super.createChildren();
			this.createView(testUI.uiView);
		}
	}

