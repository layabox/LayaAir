import { XML } from "laya/html/XML";

export class Network_XML {
	constructor() {
		this.setup();
	}

	private setup(): void {
		var xmlValueContainsError: string = "<root><item>item a</item><item>item b</item>somethis...</root1>";
		var xmlValue: string = "<root><item>item a</item><item>item b</item>somethings...</root>";

		this.proessXML(xmlValueContainsError);
		console.log("\n");
		this.proessXML(xmlValue);
	}

	// 使用xml
	private proessXML(source: string): void {
		try {
			var xml: XML = new XML(source);
		}
		catch (e) {
			console.log(e.massage);
			return;
		}

		this.printDirectChildren(xml);
	}

	// 打印直接子级
	private printDirectChildren(xml: XML): void {
		var nodes: any[] = xml.elements();
		for (var i: number = 0; i < nodes.length; i++) {
			var node: XML = nodes[i];

			console.log("节点名称: " + node.name);


			console.log("\n");
		}
	}

}

