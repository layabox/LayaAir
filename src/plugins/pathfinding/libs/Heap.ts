import { HeapFunction } from "./HeapFunction";
/**
	 * ...
	 * @author dongketao
	 */
	export class Heap
	{
		 heapFunction:HeapFunction = new HeapFunction();
		
		 cmp:Function;
		 nodes:any[];
		
		constructor(cmp:Function = null){
			this.cmp = cmp != null ? cmp : this.heapFunction.defaultCmp;
			this.nodes = [];
		}
		
		 push(x:any):any
		{
			return this.heapFunction.heappush(this.nodes, x, this.cmp);
		}
		
		 pop():any
		{
			return this.heapFunction.heappop(this.nodes, this.cmp);
		}
		
		 peek():any
		{
			return this.nodes[0];
		}
		
		 contains(x:any):boolean
		{
			return this.nodes.indexOf(x) !== -1;
		}
		
		 replace(x:any):any
		{
			return this.heapFunction.heapreplace(this.nodes, x, this.cmp);
		}
		
		 pushpop(x:any):any
		{
			return this.heapFunction.heappushpop(this.nodes, x, this.cmp);
		}
		
		 heapify():any
		{
			return this.heapFunction.heapify(this.nodes, this.cmp);
		}
		
		 updateItem(x:any):any
		{
			return this.heapFunction.updateItem(this.nodes, x, this.cmp);
		}
		
		 clear():any
		{
			return this.nodes = [];
		}
		
		 empty():boolean
		{
			return this.nodes.length === 0;
		}
		
		 size():number
		{
			return this.nodes.length;
		}
		
		 clone():Heap
		{
			var heap:Heap = new Heap();
			heap.nodes = this.nodes.slice(0);
			return heap;
		}
		
		 toArray():any
		{
			return this.nodes.slice(0);
		}
	}


