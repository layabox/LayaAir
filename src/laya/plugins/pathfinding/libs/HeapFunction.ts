/**
	 * ...
	 * @author dongketao
	 */
	export class HeapFunction
	{
		
		constructor(){
		
		}
		
		/*
		   Default comparison function to be used
		 */
		
		//defaultCmp = function(x, y) {
		//if (x < y) {
		//return -1;
		//}
		//if (x > y) {
		//return 1;
		//}
		//return 0;
		//};
		 defaultCmp:Function = function(x:number, y:number):number
		{
			if (x < y)
			{
				return -1;
			}
			if (x > y)
			{
				return 1;
			}
			return 0;
		}
		
		/*
		   Insert item x in list a, and keep it sorted assuming a is sorted.
		
		   If x is already in a, insert it to the right of the rightmost x.
		
		   Optional args lo (default 0) and hi (default a.length) bound the slice
		   of a to be searched.
		 */
		
		//insort = function(a, x, lo, hi, cmp) {
		//var mid;
		//if (lo == null) {
		//lo = 0;
		//}
		//if (cmp == null) {
		//cmp = defaultCmp;
		//}
		//if (lo < 0) {
		//throw new Error('lo must be non-negative');
		//}
		//if (hi == null) {
		//hi = a.length;
		//}
		//while (lo < hi) {
		//mid = floor((lo + hi) / 2);
		//if (cmp(x, a[mid]) < 0) {
		//hi = mid;
		//} else {
		//lo = mid + 1;
		//}
		//}
		//return ([].splice.apply(a, [lo, lo - lo].concat(x)), x);
		//};
		 insort(a:any, x:any, lo:any = null, hi:any = null, cmp:any = null):any
		{
			var mid:number;
			if (lo == null)
			{
				lo = 0;
			}
			if (cmp == null)
			{
				cmp = this.defaultCmp;
			}
			if (lo < 0)
			{
				throw new Error('lo must be non-negative');
			}
			if (hi == null)
			{
				hi = a.length;
			}
			while (lo < hi)
			{
				mid = Math.floor((lo + hi) / 2);
				if (cmp(x, a[mid]) < 0)
				{
					hi = mid;
				}
				else
				{
					lo = mid + 1;
				}
			}
			return ([].splice.apply(a, [lo, lo - lo].concat(x)), x);
		}
		
		/*
		   Push item onto heap, maintaining the heap invariant.
		 */
		
		//heappush = function(array, item, cmp) {
		//if (cmp == null) {
		//cmp = defaultCmp;
		//}
		//array.push(item);
		//return _siftdown(array, 0, array.length - 1, cmp);
		//};
		 heappush(array:any, item:any, cmp:any):any
		{
			if (cmp == null)
			{
				cmp = this.defaultCmp;
			}
			array.push(item);
			return this._siftdown(array, 0, array.length - 1, cmp);
		}
		
		/*
		   Pop the smallest item off the heap, maintaining the heap invariant.
		 */
		//heappop = function(array, cmp) {
		//var lastelt, returnitem;
		//if (cmp == null) {
		//cmp = defaultCmp;
		//}
		//lastelt = array.pop();
		//if (array.length) {
		//returnitem = array[0];
		//array[0] = lastelt;
		//_siftup(array, 0, cmp);
		//} else {
		//returnitem = lastelt;
		//}
		//return returnitem;
		//};
		 heappop(array:any, cmp:any):any
		{
			var lastelt:any, returnitem:any;
			if (cmp == null)
			{
				cmp = this.defaultCmp;
			}
			lastelt = array.pop();
			if (array.length)
			{
				returnitem = array[0];
				array[0] = lastelt;
				this._siftup(array, 0, cmp);
			}
			else
			{
				returnitem = lastelt;
			}
			return returnitem;
		}
		
		/*
		   Pop and return the current smallest value, and add the new item.
		
		   This is more efficient than heappop() followed by heappush(), and can be
		   more appropriate when using a fixed size heap. Note that the value
		   returned may be larger than item! That constrains reasonable use of
		   this routine unless written as part of a conditional replacement:
		   if item > array[0]
		   item = heapreplace(array, item)
		 */
		
		//heapreplace = function(array, item, cmp) {
		//var returnitem;
		//if (cmp == null) {
		//cmp = defaultCmp;
		//}
		//returnitem = array[0];
		//array[0] = item;
		//_siftup(array, 0, cmp);
		//return returnitem;
		//};
		 heapreplace(array:any, item:any, cmp:any):any
		{
			var returnitem:any;
			if (cmp == null)
			{
				cmp = this.defaultCmp;
			}
			returnitem = array[0];
			array[0] = item;
			this._siftup(array, 0, cmp);
			return returnitem;
		}
		
		/*
		   Fast version of a heappush followed by a heappop.
		 */
		
		//heappushpop = function(array, item, cmp) {
		//var _ref;
		//if (cmp == null) {
		//cmp = defaultCmp;
		//}
		//if (array.length && cmp(array[0], item) < 0) {
		//_ref = [array[0], item], item = _ref[0], array[0] = _ref[1];
		//_siftup(array, 0, cmp);
		//}
		//return item;
		//};
		 heappushpop(array:any, item:any, cmp:any):any
		{
			var _ref:any;
			if (cmp == null)
			{
				cmp = this.defaultCmp;
			}
			if (array.length && cmp(array[0], item) < 0)
			{
				_ref = [array[0], item], item = _ref[0], array[0] = _ref[1];
				this._siftup(array, 0, cmp);
			}
			return item;
		}
		
		/*
		   Transform list into a heap, in-place, in O(array.length) time.
		 */
		
		//heapify = function(array, cmp) {
		//var i, _i, _j, _len, _ref, _ref1, _results, _results1;
		//if (cmp == null) {
		//cmp = defaultCmp;
		//}
		//_ref1 = (function() {
		//_results1 = [];
		//for (var _j = 0, _ref = floor(array.length / 2); 0 <= _ref ? _j < _ref : _j > _ref; 0 <= _ref ? _j++ : _j--){ _results1.push(_j); }
		//return _results1;
		//}).apply(this).reverse();
		//_results = [];
		//for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
		//i = _ref1[_i];
		//_results.push(_siftup(array, i, cmp));
		//}
		//return _results;
		//};
		 heapify(array:any, cmp:any):any
		{
			var i:number, _i:number, _j:number, _len:number, _ref:any, _ref1:any, _results:any, _results1:any;
			if (cmp == null)
			{
				cmp = this.defaultCmp;
			}
			_ref1 = (function():any
			{
				_results1 = [];
				for (_j = 0, _ref = Math.floor(array.length / 2); 0 <= _ref ? _j < _ref : _j > _ref; 0 <= _ref ? _j++ : _j--)
				{
					_results1.push(_j);
				}
				return _results1;
			}).apply(this).reverse();
			_results = [];
			for (_i = 0, _len = _ref1.length; _i < _len; _i++)
			{
				i = _ref1[_i];
				_results.push(this._siftup(array, i, cmp));
			}
			return _results;
		}
		
		/*
		   Update the position of the given item in the heap.
		   This function should be called every time the item is being modified.
		 */
		
		//updateItem = function(array, item, cmp) {
		//var pos;
		//if (cmp == null) {
		//cmp = defaultCmp;
		//}
		//pos = array.indexOf(item);
		//if (pos === -1) {
		//return;
		//}
		//_siftdown(array, 0, pos, cmp);
		//return _siftup(array, pos, cmp);
		//};
		 updateItem(array:any, item:any, cmp:any):any
		{
			var pos:number;
			if (cmp == null)
			{
				cmp = this.defaultCmp;
			}
			pos = array.indexOf(item);
			if (pos === -1)
			{
				return null;
			}
			this._siftdown(array, 0, pos, cmp);
			return this._siftup(array, pos, cmp);
		}
		
		/*
		   Find the n largest elements in a dataset.
		 */
		
		//nlargest = function(array, n, cmp) {
		//var elem, result, _i, _len, _ref;
		//if (cmp == null) {
		//cmp = defaultCmp;
		//}
		//result = array.slice(0, n);
		//if (!result.length) {
		//return result;
		//}
		//heapify(result, cmp);
		//_ref = array.slice(n);
		//for (_i = 0, _len = _ref.length; _i < _len; _i++) {
		//elem = _ref[_i];
		//heappushpop(result, elem, cmp);
		//}
		//return result.sort(cmp).reverse();
		//};
		 nlargest(array:any, n:number, cmp:any):any
		{
			var elem:any, result:any, _i:number, _len:number, _ref:any;
			if (cmp == null)
			{
				cmp = this.defaultCmp;
			}
			result = array.slice(0, n);
			if (!result.length)
			{
				return result;
			}
			this.heapify(result, cmp);
			_ref = array.slice(n);
			for (_i = 0, _len = _ref.length; _i < _len; _i++)
			{
				elem = _ref[_i];
				this.heappushpop(result, elem, cmp);
			}
			return result.sort(cmp).reverse();
		}
		
		/*
		   Find the n smallest elements in a dataset.
		 */
		
		//nsmallest = function(array, n, cmp) {
		//var elem, i, los, result, _i, _j, _len, _ref, _ref1, _results;
		//if (cmp == null) {
		//cmp = defaultCmp;
		//}
		//if (n * 10 <= array.length) {
		//result = array.slice(0, n).sort(cmp);
		//if (!result.length) {
		//return result;
		//}
		//los = result[result.length - 1];
		//_ref = array.slice(n);
		//for (_i = 0, _len = _ref.length; _i < _len; _i++) {
		//elem = _ref[_i];
		//if (cmp(elem, los) < 0) {
		//insort(result, elem, 0, null, cmp);
		//result.pop();
		//los = result[result.length - 1];
		//}
		//}
		//return result;
		//}
		//heapify(array, cmp);
		//_results = [];
		//for (i = _j = 0, _ref1 = min(n, array.length); 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
		//_results.push(heappop(array, cmp));
		//}
		//return _results;
		//};
		
		 nsmallest(array:any, n:number, cmp:any):any
		{
			var elem:any, i:any, los:any, result:any, _i:number, _j:number, _len:any, _ref:any, _ref1:any, _results:any;
			if (cmp == null)
			{
				cmp = this.defaultCmp;
			}
			if (n * 10 <= array.length)
			{
				result = array.slice(0, n).sort(cmp);
				if (!result.length)
				{
					return result;
				}
				los = result[result.length - 1];
				_ref = array.slice(n);
				for (_i = 0, _len = _ref.length; _i < _len; _i++)
				{
					elem = _ref[_i];
					if (cmp(elem, los) < 0)
					{
						this.insort(result, elem, 0, null, cmp);
						result.pop();
						los = result[result.length - 1];
					}
				}
				return result;
			}
			this.heapify(array, cmp);
			_results = [];
			for (i = _j = 0, _ref1 = Math.min(n, array.length); 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j)
			{
				_results.push(this.heappop(array, cmp));
			}
			return _results;
		}
		
		//_siftdown = function(array, startpos, pos, cmp) {
		//var newitem, parent, parentpos;
		//if (cmp == null) {
		//cmp = defaultCmp;
		//}
		//newitem = array[pos];
		//while (pos > startpos) {
		//parentpos = (pos - 1) >> 1;
		//parent = array[parentpos];
		//if (cmp(newitem, parent) < 0) {
		//array[pos] = parent;
		//pos = parentpos;
		//continue;
		//}
		//break;
		//}
		//return array[pos] = newitem;
		//};
		 _siftdown(array:any, startpos:number, pos:number, cmp:any):any
		{
			var newitem:any, parent:any, parentpos:number;
			if (cmp == null)
			{
				cmp = this.defaultCmp;
			}
			newitem = array[pos];
			while (pos > startpos)
			{
				parentpos = (pos - 1) >> 1;
				parent = array[parentpos];
				if (cmp(newitem, parent) < 0)
				{
					array[pos] = parent;
					pos = parentpos;
					continue;
				}
				break;
			}
			return array[pos] = newitem;
		}
		
		//_siftup = function(array, pos, cmp) {
		//var childpos, endpos, newitem, rightpos, startpos;
		//if (cmp == null) {
		//cmp = defaultCmp;
		//}
		//endpos = array.length;
		//startpos = pos;
		//newitem = array[pos];
		//childpos = 2 * pos + 1;
		//while (childpos < endpos) {
		//rightpos = childpos + 1;
		//if (rightpos < endpos && !(cmp(array[childpos], array[rightpos]) < 0)) {
		//childpos = rightpos;
		//}
		//array[pos] = array[childpos];
		//pos = childpos;
		//childpos = 2 * pos + 1;
		//}
		//array[pos] = newitem;
		//return _siftdown(array, startpos, pos, cmp);
		//};
		 _siftup(array:any, pos:number, cmp:any):any
		{
			var childpos:number, endpos:number, newitem:any, rightpos:number, startpos:number;
			if (cmp == null)
			{
				cmp = this.defaultCmp;
			}
			endpos = array.length;
			startpos = pos;
			newitem = array[pos];
			childpos = 2 * pos + 1;
			while (childpos < endpos)
			{
				rightpos = childpos + 1;
				if (rightpos < endpos && !(cmp(array[childpos], array[rightpos]) < 0))
				{
					childpos = rightpos;
				}
				array[pos] = array[childpos];
				pos = childpos;
				childpos = 2 * pos + 1;
			}
			array[pos] = newitem;
			return this._siftdown(array, startpos, pos, cmp);
		}
	}


