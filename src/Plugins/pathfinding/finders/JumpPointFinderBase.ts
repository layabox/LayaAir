import { Grid } from "../core/Grid"
	import { Heuristic } from "../core/Heuristic"
	import { Node } from "../../../../../core/src/laya/display/Node"
	import { Util } from "../core/Util"
	import { Heap } from "../libs/Heap"
	
	/**
	 * ...
	 * @author ...
	 */
	export class JumpPointFinderBase
	{
		 grid:Grid;
		 openList:Heap;
		 startNode:Node;
		 endNode:Node;
		 heuristic:Function;
		 trackJumpRecursion:boolean;
		
		/**
		 * Base class for the Jump Point Search algorithm
		 * @param {object} opt
		 * @param {function} opt.heuristic Heuristic function to estimate the distance
		 *     (defaults to manhattan).
		 */
		constructor(opt:any){
			opt = opt || {};
			this.heuristic = opt.heuristic || Heuristic.manhattan;
			this.trackJumpRecursion = opt.trackJumpRecursion || false;
		}
		
		/**
		 * Find and return the path.
		 * @return {Array<Array<number>>} The path, including both start and
		 *     end positions.
		 */
		 findPath(startX:number, startY:number, endX:number, endY:number, grid:Grid):any
		{
			var openList:Heap = this.openList = new Heap(function(nodeA:Node, nodeB:Node):number
			{
				return nodeA.f - nodeB.f;
			}), startNode:Node = this.startNode = grid.getNodeAt(startX, startY), endNode:Node = this.endNode = grid.getNodeAt(endX, endY), node:Node;
			
			this.grid = grid;
			
			// set the `g` and `f` value of the start node to be 0
			startNode.g = 0;
			startNode.f = 0;
			
			// push the start node into the open list
			openList.push(startNode);
			startNode.opened = true;
			
			// while the open list is not empty
			while (!openList.empty())
			{
				// pop the position of node which has the minimum `f` value.
				node = (<Node>openList.pop() );
				node.closed = true;
				
				if (node == endNode)
				{
					return Util.expandPath(Util.backtrace(endNode));
				}
				
				this._identifySuccessors(node);
			}
			
			// fail to find the path
			return [];
		}
		
		/**
		 * Identify successors for the given node. Runs a jump point search in the
		 * direction of each available neighbor, adding any points found to the open
		 * list.
		 * @protected
		 */
		private _identifySuccessors(node:Node):void
		{
			var grid:Grid = this.grid, heuristic:Function = this.heuristic, openList:Heap = this.openList, endX:number = this.endNode.x, endY:number = this.endNode.y, neighbors:any[], neighbor:Node, jumpPoint:any[], i:number, l:number, x:number = node.x, y:number = node.y, jx:number, jy:number, dx:number, dy:number, d:number, ng:number, jumpNode:Node, abs:Function = Math.abs, max:Function = Math.max;
			
			neighbors = this._findNeighbors(node);
			for (i = 0, l = neighbors.length; i < l; ++i)
			{
				neighbor = neighbors[i];
				jumpPoint = this._jump(neighbor[0], neighbor[1], x, y);
				if (jumpPoint)
				{
					
					jx = jumpPoint[0];
					jy = jumpPoint[1];
					jumpNode = grid.getNodeAt(jx, jy);
					
					if (jumpNode.closed)
					{
						continue;
					}
					
					// include distance, as parent may not be immediately adjacent:
					d = Heuristic.octile(abs(jx - x), abs(jy - y));
					ng = node.g + d; // next `g` value
					
					if (!jumpNode.opened || ng < jumpNode.g)
					{
						jumpNode.g = ng;
						jumpNode.h = jumpNode.h || heuristic(abs(jx - endX), abs(jy - endY));
						jumpNode.f = jumpNode.g + jumpNode.h;
						jumpNode.parent = node;
						
						if (!jumpNode.opened)
						{
							openList.push(jumpNode);
							jumpNode.opened = true;
						}
						else
						{
							openList.updateItem(jumpNode);
						}
					}
				}
			}
		}
		
		 _jump(x:number, y:number, px:number, py:number):any[]{
			return [];
		}
		
		 _findNeighbors(node:Node):any[]{
			return [];
		}
		
	}


