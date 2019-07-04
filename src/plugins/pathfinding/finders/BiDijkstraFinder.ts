import { BiAStarFinder } from "./BiAStarFinder";
/**
	 * ...
	 * @author ...
	 */
	export class BiDijkstraFinder extends BiAStarFinder 
	{
		
		constructor(opt:any){
			super(opt);
			this.heuristic = function(dx:number, dy:number):number {
				return 0;
			};
		}
		
	}


