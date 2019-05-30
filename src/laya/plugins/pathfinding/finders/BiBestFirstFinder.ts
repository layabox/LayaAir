import { BiAStarFinder } from "././BiAStarFinder";
/**
	 * ...
	 * @author ...
	 */
	export class BiBestFirstFinder extends BiAStarFinder
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


