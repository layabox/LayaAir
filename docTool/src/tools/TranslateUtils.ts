const http = require('http');


/**
 * 
 * @ brief: TranslateUtils
 * @ author: zyh
 * @ data: 2024-04-26 17:01
 */
export class TranslateUtils {
    static map: Map<string, any> = new Map<string, string>();

    static translate() {
        const obj: any = {};
        for (const [key, value] of this.map) {
            obj[key] = value;
        }
        this.translateHttp(JSON.stringify(obj));
    }

    static extractZHContent(text) {
        const regex = /zh\{(.*?)\}/g;
        let matches;
        const results = {};

        while ((matches = regex.exec(text)) !== null) {
            // 此正则表达式设计带有一个捕获组，用以匹配并捕获大括号中的内容
            const fullMatch = matches[0]; // 完整匹配的字符串，例如 "zh{View}"
            const valueMatch = matches[1]; // 捕获组的匹配，也就是大括号中的内容，例如 "View"
            results[fullMatch] = valueMatch;
        }

        return results;
    }

    static backfillMDWithJSONValues(mdText, jsonValues) {
        for (const key in jsonValues) {
            const value = jsonValues[key];
            // 构建搜索用的正则表达式，考虑到特殊字符需要转义
            const searchRegex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            mdText = mdText.replace(searchRegex, value);
        }
        return mdText;
    }


    static translateHttp(prompt: string) {
        // 构建请求的内容体
        const postData = JSON.stringify({
            prompt: "```" + prompt + '```翻译一下json中value的内容'
        });

        const options = {
            hostname: '180.76.243.32',
            port: 3002,
            path: '/wenxin4',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'API-Key': 'LayaBOX@123456',
                'Content-Length': Buffer.byteLength(postData) // 确保正确设置内容长度
            }
        };

        const req = http.request(options, (res) => {
            console.log(`状态码: ${res.statusCode}`);
            console.log(`响应头: ${JSON.stringify(res.headers)}`);
            res.setEncoding('utf8');

            res.on('data', (chunk) => {
                console.log(`响应内容: ${chunk}`);
            });

            res.on('end', () => {
                console.log('没有更多数据。');
            });
        });

        req.on('error', (e) => {
            console.error(`请求遇到问题: ${e.message}`);
        });

        // 将数据写入请求体
        req.write(postData);
        req.end();
    }
}