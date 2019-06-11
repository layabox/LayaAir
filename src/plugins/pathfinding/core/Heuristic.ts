/**
	 * ...
	 * @author dongketao
	 */
	export class Heuristic
	{
		
		constructor(){
		
		}
		
		 static manhattan(dx:number, dy:number):number
		{
			return dx + dy;
		}
		
		 static euclidean(dx:number, dy:number):number
		{
			return Math.sqrt(dx * dx + dy * dy);
		}
		
		 static octile(dx:number, dy:number):number
		{
			var F:number = Math.SQRT2 - 1;
			return (dx < dy) ? F * dx + dy : F * dy + dx;
		}
		
		 static chebyshev(dx:number, dy:number):number
		{
			return Math.max(dx, dy);
		}
	}

