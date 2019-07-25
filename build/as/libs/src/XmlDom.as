/*[IF-FLASH]*/
package
{
	
	/**
	 *  XML适配类，本类只用于适配js原生XML接口，在AS环境下提供对应的代码提示，代码真正执行时执行原生jsXML代码
	 */
	public dynamic class XmlDom
	{
		protected var _ns:String;
		/**
		 * NodeList 对象，表示节点集合。
		 */
		public var childNodes:Array;
		/**
		 * Node 对象，节点的子节点。
		 */
		public var firstChild:Object;
		/**
		 * 被选节点的最后一个子节点。如果选定的节点没有子节点，则该属性返回 NULL。
		 */
		public var lastChild:Object;
		/**
		 * 被选元素的本地名称（元素名称）。如果选定的节点不是元素或属性，则该属性返回 NULL。
		 */
		public var localName:String;
		/**
		 * 指定节点之后紧跟的节点，在相同的树层级中。被返回的节点以 Node 对象返回。
		 */
		public var nextSibling:Object;
		/**
		 * 指定节点的节点名称。
		 * 如果节点是元素节点，则 nodeName 属性返回标签名。
		 * 如果节点是属性节点，则 nodeName 属性返回属性的名称。
		 * 对于其他节点类型，nodeName 属性返回不同节点类型的不同名称。
		 */
		public var nodeName:String;
		/**
		 * 以数字值返回指定节点的节点类型。
		 * 如果节点是元素节点，则 nodeType 属性将返回 1。
		 * 如果节点是属性节点，则 nodeType 属性将返回 2。
		 */
		public var nodeType:int;
		/**
		 * 设置或返回指定节点的节点值。
		 */
		public var nodeValue:*;
		/**
		 * 以 Node 对象的形式返回指定节点的父节点。如果指定节点没有父节点，则返回 null。
		 */
		public var parentNode:XmlDom;
		/**
		 * 返回指定节点的属性集合，即 NamedNodeMap。
		 */
		public var attributes:Object;
		public var textContent:String;
		/**
		 * 添加的节点。
		 * @param	node 您希望添加的节点对象。
		 * @return
		 */
		public function appendChild(node:Object):XmlDom
		{
			childNodes =childNodes || [];
			childNodes.push(node);

			// Update firstChild and lastChild reference.
			if (childNodes.length == 1) this.firstChild = node;
			this.lastChild = node;
			
			return null;
		}
		
		/**
		 * 删除子节点。
		 * @param	node
		 * @return
		 */
		public function removeChild(node:XmlDom):XmlDom
		{
			var index:int = childNodes.indexOf(node);
			if (index > -1)
				childNodes.splice(index, 1);
			
			// Update firstChild and lastChild reference.
			if (childNodes.length > 0)
			{
				this.firstChild = childNodes[0];
				this.lastChild = childNodes[childNodes.length - 1];
			}
				
			return null;
		}
		
		/**
		 * 克隆节点。
		 * @return
		 */
		private static var tempParentNode:XmlDom;
		public function cloneNode(include_all:Boolean = false):XmlDom
		{
			var result:XmlDom = new XmlDom();
			
			// Copy attributes.
			if (attributes)
			{
				result.attributes = [];
				var len:int = attributes.length;
				for (var i:int = 0; i < len; i++)
				{
					var attri:XmlDom = new XmlDom();
					result.attributes.push(attri);
					
					var attriSrc:XmlDom = attributes[i];
					
					attri._ns = attriSrc._ns;
					
					attri.nodeType = 2;
					attri.nodeName = attriSrc.nodeName;
					attri.nodeValue = attriSrc.nodeValue;
				}
			}
			
			// Copy children if specify include_all as true.
			if (childNodes && include_all)
			{
				result.childNodes = [];
				len = childNodes.length;
				for (i = 0; i < len; i++)
				{
					var child:Object;
					
					// Copy fully recursive.
					if (childNodes[i].nodeType == 1)
					{
						tempParentNode = result;
						child = childNodes[i].cloneNode(true);
						tempParentNode = null;
					}
					else
						child = childNodes[i];
						
					result.childNodes.push(child);
					
					// Update nextSilbling reference.
					if (i > 0)
						result.childNodes[i - 1].nextSibling = child;
				}
				
				// Update firstChild and lastChild reference.
				if (result.childNodes.length > 0)
				{
					result.firstChild = result.childNodes[0];
					result.lastChild = result.childNodes[result.childNodes.length - 1];
				}
			}
			
			// Copy other properties.
			result._ns = _ns;
			result.localName = localName;
			result.nodeName = nodeName;
			result.nodeType = nodeType;
			result.nodeValue = nodeValue;
			result.parentNode = tempParentNode;
			
			return result;
		}
		
		/**
		 * 返回带有指定标签名的对象集合。
		 * @param	name
		 * @return
		 */
		public function getElementsByTagName(name:String):Array
		{
			var result:Array = [];
			
			var len:int = childNodes.length;
			for (var i:int = 0; i < len; i++)
			{
				var childNode:Object = childNodes[i];
				
				// Push to result while element found.
				if (childNode.localName == name)
					result.push(childNode);
					
				// Seach recursively when processing a element node.
				if (childNode.nodeType == 1)
					result = result.concat(childNode.getElementsByTagName(name));
			}
			
			return result;
		}
		
		/**
		 * 返回带有指定名称和命名空间的所有元素的一个节点列表。
		 * @param	ns 字符串值，可规定需检索的命名空间名称。值 "*" 可匹配所有的标签。
		 * @param	name 字符串值，可规定需检索的标签名。值 "*" 可匹配所有的标签。
		 * @return
		 */
		public function getElementsByTagNameNS(ns:String, name:String):Array
		{
			var result:Array = [];
			
			var len:int = childNodes.length;
			for (var i:int = 0; i < len; i++)
			{
				var childNode:Object = childNodes[i];
				
				// Push to result while element found.
				if (childNode.localName == name && childNode._ns == ns)
					result.push(childNode);
					
				// Seach recursively when processing a element node.
				if (childNode.nodeType == 1)
					result = result.concat(childNode.getElementsByTagName(name));
			}
			
			return result;
		}
		
		/**
		 * 把指定属性设置或修改为指定的值。
		 * @param	name 您希望添加的属性的名称。
		 * @param	value 您希望添加的属性值。
		 */
		public function setAttribute(name:String, value:*):void
		{
			var len:int = attributes.length;
			for (var i:int = 0; i < len; i++)
			{
				var attribute:XmlDom = attributes[i];
				if (attribute.nodeName == name)
					attribute.nodeValue = value;
			}
		}
		
		/**
		 * 返回指定的属性值。
		 * @param	name 需要获得属性值的属性名称。
		 * @return
		 */
		public function getAttribute(name:String):*
		{
			var len:int = attributes.length;
			for (var i:int = 0; i < len; i++)
			{
				var attribute:XmlDom = attributes[i];
				
				if (attribute.nodeName == name)
					return attribute.nodeValue;
			}
			return null;
		}
		
		/**
		 * 创建或改变具有命名空间的属性。
		 * @param	ns 规定要设置的属性的命名空间 URI。
		 * @param	name 规定要设置的属性的名称。
		 * @param	value 规定要设置的属性的值。
		 */
		public function setAttributeNS(ns:String, name:String, value:*):void
		{
			var len:int = attributes.length;
			for (var i:int = 0; i < len; i++)
			{
				var attribute:XmlDom = attributes[i];
				
				if (attribute.nodeName == name && attribute._ns == ns)
					attribute.nodeValue = value;
			}
		}
		
		/**
		 * 通过命名空间 URI 和名称来获取属性值。
		 * @param	ns 规定从中获取属性值的命名空间 URI
		 * @param	name 规定从中取得属性值的属性。
		 * @return
		 */
		public function getAttributeNS(ns:String, name:String):*
		{
			var len:int = attributes.length;
			for (var i:int = 0; i < len; i++)
			{
				var attribute:XmlDom = attributes[i];
				
				if (attribute.nodeName == name && attribute._ns == ns)
					return attribute.nodeValue;
			}
			return null;
		}
		
		public function createElement(name:String):XmlDom
		{
			var result:XmlDom = new XmlDom();
			result.localName = name;
			return result;
		}
		
		public function createTextNode(value:String):String
		{
			return value;
		}
		
		public function createNode(xml:XML, parent:XmlDom):void
		{
			this.parentNode = parent;
			
			createChild(xml.children());
			buildAttributes(xml.attributes());
		}
		
		private function createChild(children:*):void 
		{
			childNodes = [];
			if (children.length() > 0)
			{
				// 填充childNodes
				var len:int = children.length();
				for (var i:int = 0; i < len; i++)
				{
					var child:XML = children[i];
					var childElement:Object;
					
					switch (child.nodeKind())
					{
					case "element": 
						childElement = new XmlDom();
						childElement.nodeType = 1;
						
						childElement.localName = child.localName();
						childElement.nodeName = childElement.localName;
						childElement._ns = child.namespace();
						
						// Create all element node.
						childElement.createNode(child, this);
						break;
					case "text":
						childElement = new XmlDom();
						childElement.nodeType = 3;
						childElement.textContent = child;
						childElement.nodeValue = child;
						break;
					default: 
						childElement = child;
					}
					
					childNodes.push(childElement);
					
					// nextSibling
					if (i > 1)
						childNodes[i - 1].nextSibling = childNodes[i];
				}
				
				// firstChild and lastChild
				this.firstChild = childNodes[0];
				this.lastChild = childNodes[childNodes.length - 1];
			}
		}
		
		private function buildAttributes(attributeList:*):void 
		{
			var len:int = attributeList.length();
			if (len > 0)
			{
				attributes = [];
				for (var i:int = 0; i < len; i++)
				{
					var attribute:XML = attributeList[i];
					
					var attributeDom:XmlDom = new XmlDom();
					attributes.push(attributeDom);
					
					attributeDom._ns = attribute.namespace();
					
					attributeDom.nodeType = 2;
					attributeDom.nodeName = attribute.localName();
					attributeDom.nodeValue = attribute.toString();
					attributeDom.value = attributeDom.nodeValue;
					
					attributes[attributeDom.nodeName] = attributeDom;
				}
			}
		}
	}
}