import { DiagonalMovement } from "../core/DiagonalMovement"
	
	/**
	 * ...
	 * @author ...
	 */
	export class JumpPointFinder
	{
		/**
		 * Path finder using the Jump Point Search algorithm
		 * @param {Object} opt
		 * @param {function} opt.heuristic Heuristic function to estimate the distance
		 *     (defaults to manhattan).
		 * @param {DiagonalMovement} opt.diagonalMovement Condition under which diagonal
		 *      movement will be allowed.
		 */
		constructor(opt:any)
		{
			//opt = opt || {};
			//if (opt.diagonalMovement === DiagonalMovement.Never)
			//{
				//return new JPFNeverMoveDiagonally(opt);
			//}
			//else if (opt.diagonalMovement === DiagonalMovement.Always)
			//{
				//return new JPFAlwaysMoveDiagonally(opt);
			//}
			//else if (opt.diagonalMovement === DiagonalMovement.OnlyWhenNoObstacles)
			//{
				//return new JPFMoveDiagonallyIfNoObstacles(opt);
			//}
			//else
			//{
				//return new JPFMoveDiagonallyIfAtMostOneObstacle(opt);
			//}
			//return null;
		}
	
	}


