import { JumpPointFinderBase } from "././JumpPointFinderBase";
import { DiagonalMovement } from "../core/DiagonalMovement"
	import { Grid } from "../core/Grid"
	import { Node } from "../../../../../core/src/laya/display/Node"
	
	/**
	 * ...
	 * @author ...
	 */
	export class JPFAlwaysMoveDiagonally extends JumpPointFinderBase
	{
		
		constructor(opt:any){
			super(opt);
		
		}
		
		/**
		 * Search recursively in the direction (parent -> child), stopping only when a
		 * jump point is found.
		 * @protected
		 * @return {Array<Array<number>>} The x, y coordinate of the jump point
		 *     found, or null if not found
		 */
		/*override*/  _jump(x:number, y:number, px:number, py:number):any[]
		{
			var grid:Grid = this.grid, dx:number = x - px, dy:number = y - py;
			
			if (!grid.isWalkableAt(x, y))
			{
				return null;
			}
			
			if (this.trackJumpRecursion == true)
			{
				grid.getNodeAt(x, y).tested = true;
			}
			
			if (grid.getNodeAt(x, y) == this.endNode)
			{
				return [x, y];
			}
			
			// check for forced neighbors
			// along the diagonal
			if (dx !== 0 && dy !== 0)
			{
				if ((grid.isWalkableAt(x - dx, y + dy) && !grid.isWalkableAt(x - dx, y)) || (grid.isWalkableAt(x + dx, y - dy) && !grid.isWalkableAt(x, y - dy)))
				{
					return [x, y];
				}
				// when moving diagonally, must check for vertical/horizontal jump points
				if (this._jump(x + dx, y, x, y) || this._jump(x, y + dy, x, y))
				{
					return [x, y];
				}
			}
			// horizontally/vertically
			else
			{
				if (dx !== 0)
				{ // moving along x
					if ((grid.isWalkableAt(x + dx, y + 1) && !grid.isWalkableAt(x, y + 1)) || (grid.isWalkableAt(x + dx, y - 1) && !grid.isWalkableAt(x, y - 1)))
					{
						return [x, y];
					}
				}
				else
				{
					if ((grid.isWalkableAt(x + 1, y + dy) && !grid.isWalkableAt(x + 1, y)) || (grid.isWalkableAt(x - 1, y + dy) && !grid.isWalkableAt(x - 1, y)))
					{
						return [x, y];
					}
				}
			}
			
			return this._jump(x + dx, y + dy, x, y);
		}
		
		/**
		 * Find the neighbors for the given node. If the node has a parent,
		 * prune the neighbors based on the jump point search algorithm, otherwise
		 * return all available neighbors.
		 * @return {Array<Array<number>>} The neighbors found.
		 */
		/*override*/  _findNeighbors(node:Node):any[]
		{
			var parent:Node = node.parent, x:number = node.x, y:number = node.y, grid:Grid = this.grid, px:number, py:number, nx:number, ny:number, dx:number, dy:number, neighbors:any[] = [], neighborNodes:any[], neighborNode:Node, i:number, l:number;
			
			// directed pruning: can ignore most neighbors, unless forced.
			if (parent)
			{
				px = parent.x;
				py = parent.y;
				// get the normalized direction of travel
				dx = (x - px) / Math.max(Math.abs(x - px), 1);
				dy = (y - py) / Math.max(Math.abs(y - py), 1);
				
				// search diagonally
				if (dx !== 0 && dy !== 0)
				{
					if (grid.isWalkableAt(x, y + dy))
					{
						neighbors.push([x, y + dy]);
					}
					if (grid.isWalkableAt(x + dx, y))
					{
						neighbors.push([x + dx, y]);
					}
					if (grid.isWalkableAt(x + dx, y + dy))
					{
						neighbors.push([x + dx, y + dy]);
					}
					if (!grid.isWalkableAt(x - dx, y))
					{
						neighbors.push([x - dx, y + dy]);
					}
					if (!grid.isWalkableAt(x, y - dy))
					{
						neighbors.push([x + dx, y - dy]);
					}
				}
				// search horizontally/vertically
				else
				{
					if (dx === 0)
					{
						if (grid.isWalkableAt(x, y + dy))
						{
							neighbors.push([x, y + dy]);
						}
						if (!grid.isWalkableAt(x + 1, y))
						{
							neighbors.push([x + 1, y + dy]);
						}
						if (!grid.isWalkableAt(x - 1, y))
						{
							neighbors.push([x - 1, y + dy]);
						}
					}
					else
					{
						if (grid.isWalkableAt(x + dx, y))
						{
							neighbors.push([x + dx, y]);
						}
						if (!grid.isWalkableAt(x, y + 1))
						{
							neighbors.push([x + dx, y + 1]);
						}
						if (!grid.isWalkableAt(x, y - 1))
						{
							neighbors.push([x + dx, y - 1]);
						}
					}
				}
			}
			// return all neighbors
			else
			{
				neighborNodes = grid.getNeighbors(node, DiagonalMovement.Always);
				for (i = 0, l = neighborNodes.length; i < l; ++i)
				{
					neighborNode = neighborNodes[i];
					neighbors.push([neighborNode.x, neighborNode.y]);
				}
			}
			
			return neighbors;
		}
	}


