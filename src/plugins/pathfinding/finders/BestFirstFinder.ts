import { AStarFinder } from "./AStarFinder";
/**
	 * ...
	 * @author ...
	 */
	export class BestFirstFinder extends AStarFinder
	{
		
		constructor(opt:any){
			super(opt);
			var orig:Function = this.heuristic;
			this.heuristic = function(dx:number, dy:number):number
			{
				return orig(dx, dy) * 1000000;
			};
		}
	
	}


