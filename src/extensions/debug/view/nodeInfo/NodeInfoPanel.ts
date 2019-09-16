import { NodeInfosItem } from "./NodeInfosItem";
import { Sprite } from "laya/display/Sprite"
import { IDTools } from "../../tools/IDTools"
	
	/**
	 * ...
	 * @author ww
	 */
	export class NodeInfoPanel extends Sprite
	{
		
		
		 static I:NodeInfoPanel;
		
		 static init():void
		{
			if (!NodeInfoPanel.I)
			{
				NodeInfoPanel.I = new NodeInfoPanel();
				NodeInfosItem.init();
			}
		
		}
		
		constructor(){
			super();
		}
		private _stateDic:any = {};
		 isWorkState:boolean = false;
		 showDisInfo(node:Sprite):void
		{
			this.recoverNodes();
			NodeInfosItem.showDisInfos(node);
			this.showOnly(node);
			this.isWorkState = true;
		}
		
		 showOnly(node:Sprite):void
		{
			if (!node)
				return;
			this.hideBrothers(node);
			this.showOnly((<Sprite>node.parent ));
		}
		 recoverNodes():void
		{
			NodeInfosItem.hideAllInfos();
			var key:string;
			var data:any;
			var tTar:Sprite;
			for (key in this._stateDic)
			{
				data = this._stateDic[key];
				tTar = data["target"];
				if (tTar)
				{
					try
					{
						tTar.visible = data.visible;
					}catch (e)
					{
						
					}
					
				}
			}
			this.isWorkState = false;
		}
		 hideOtherChain(node:Sprite):void
		{
			if (!node)
				return;
			while (node)
			{
				this.hideBrothers(node);
				node = (<Sprite>node.parent );
			}
		}
		 hideChilds(node:Sprite):void
		{
			if (!node)
				return;
			var i:number, len:number;
			var cList:any[];
			cList = (node as any)._children;
			len = cList.length;
			var tChild:Sprite;
			for (i = 0; i < len; i++)
			{
				tChild = cList[i];
				if (tChild == NodeInfosItem.NodeInfoContainer) continue;
				
				this.saveNodeInfo(tChild);
				tChild.visible = false;
				
			}
		}
		 hideBrothers(node:Sprite):void
		{
			if (!node)
				return;
			var p:Sprite;
			p = (<Sprite>node.parent );
			if (!p)
				return;
			var i:number, len:number;
			var cList:any[];
			cList = (p as any)._children;
			len = cList.length;
			var tChild:Sprite;
			for (i = 0; i < len; i++)
			{
				tChild = cList[i];
				if (tChild == NodeInfosItem.NodeInfoContainer) continue;
				if (tChild != node)
				{
					this.saveNodeInfo(tChild);
					tChild.visible = false;
				}
			}
		}
		
		 saveNodeInfo(node:Sprite):void
		{
			
			IDTools.idObj(node);
			if(this._stateDic.hasOwnProperty(IDTools.getObjID(node))) return;
			var data:any;
			data = { };
			data.target = node;
			data.visible = node.visible;
			this._stateDic[IDTools.getObjID(node)] = data;
		}
		
		 recoverNodeInfo(node:Sprite):void
		{
			IDTools.idObj(node);
			if (this._stateDic.hasOwnProperty(IDTools.getObjID(node)))
			{
				var data:any;
				data = this._stateDic[IDTools.getObjID(node)];
				node["visible"] = data.visible;
			}
		}
	}


