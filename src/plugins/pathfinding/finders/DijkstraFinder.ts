import { AStarFinder } from "././AStarFinder";
/**
	 * ...
	 * @author ...
	 */
	export class DijkstraFinder extends AStarFinder 
	{
		
		constructor(opt:any){
			super(opt);
			this.heuristic = function(dx:number, dy:number):number {
				return 0;
			};
		}
		
	}


