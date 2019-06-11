/**
	 * ...
	 * @author dongketao
	 */
	export class Node
	{
		 x:number;
		 y:number;
		 g:number;
		 f:number;
		 h:number;
		 by:number;
		 parent:Node;
		 opened:any = null;
		 closed:any = null;
		 tested:any = null;
		 retainCount:any = null;
		 walkable:boolean;
		
		constructor(x:number, y:number, walkable:boolean = true){
			this.x = x;
			this.y = y;
			this.walkable = walkable;
		}
	
	}


