import { Box } from "laya/ui/Box";
import { View } from "laya/ui/View";
import { ComboBox } from "laya/ui/ComboBox";

/**Created by the LayaAirIDE,do not modify.*/
/*import laya.ui.*;
	import laya.display.*;*//*t laya.display.*; 

	public class IndexViewUI extends View {
*/export class IndexViewUI extends View {
		 box1:Box;
		 smallComBox:ComboBox;
		 bigComBox:ComboBox;

		 static uiView:any =/*[STATIC SAFE]*/{"type":"View","props":{"y":0,"x":0,"width":272,"height":54},"child":[{"type":"Box","props":{"y":21,"x":0,"width":272,"var":"box1","height":33},"child":[{"type":"ComboBox","props":{"y":0,"x":146,"width":120,"var":"smallComBox","skin":"comp/combobox.png","sizeGrid":"3,21,15,6","selectedIndex":0,"labels":"label1,label2","height":30}},{"type":"ComboBox","props":{"y":0,"x":0,"width":120,"var":"bigComBox","skin":"comp/combobox.png","sizeGrid":"3,21,15,6","selectedLabel":"label1","selectedIndex":0,"labels":"label1,label2","labelSize":16,"height":30}}]}]};
		/*override*/ protected createChildren():void {
			super.createChildren();
			this.createView(IndexViewUI.uiView);

		}

	}

