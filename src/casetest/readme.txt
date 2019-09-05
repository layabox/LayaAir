
Jest测试：
    依赖库：jest


渲染测试：
    目录设置要求：
        共享资源
        共享laya引擎

    依赖库：
        google的 puppeteer-core
            https://github.com/GoogleChrome/puppeteer
        用来比较图片的 looks-same 

    必须在本地根目录开 8888 的服务器，test和bin都是他的子目录， chrome测试的话地址是：
        http://localhost:8888/test/index.html?testCacheNormalClip.js

    /test/test/ 目录放测试例子，每个以test开头的js文件都算是测试文件。对应的源文件在 /src/casetest下面
    /test/testResult 目录保存测试对比结果。

    /test/test1.js 是测试文件。没有ts源码。
        这里面用绝对路径写死了chrome目录
