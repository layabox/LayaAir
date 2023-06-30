var createImageBitmapOK = self.createImageBitmap ? true : false;

onmessage = function (evt) {
    var data = evt.data;//通过evt.data获得发送来的数据
    loadImage2(data.url, data.options);
}

var enableTrace = false;
var ifShowTraceToMain = false;
function myTrace(msg) {
    if (!enableTrace) return;
    //console.log("png:" + msg)
    if (ifShowTraceToMain) {
        showMsgToMain(msg);
    }
}

function loadImage2(url, options) {
    var failed = false;
    var xhr = new XMLHttpRequest;
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";
    myTrace("load:" + url);
    xhr.onload = function () {
        var response = xhr.response || xhr.mozResponseArrayBuffer;
        myTrace("onload:" + url);
        if ((xhr.status != 200 && xhr.status != 0) || response.byteLength < 10) {
            if (!failed) {
                failed = true;
                pngFail(url, "loadFail from onload" + xhr.status);
            }

            return;
        }
        var data = new Uint8Array(response);
        doCreateImageBitmap(data, url, options);

    };
    xhr.onerror = function (e) {
        pngFail(url, "loadFail");
    }

    xhr.send(null);
}

function doCreateImageBitmap(response, url, options) {
    try {
        var startTime = getTimeNow();

        response = new self.Blob([response], { type: "image/png" });
        self.createImageBitmap(response, options).then(function (imageBitmap) {
            //showMsgToMain("imageBitmapCreated:");
            var data = {};
            data.url = url;
            data.imageBitmap = imageBitmap;
            data.dataType = "imageBitmap";

            data.startTime = startTime;
            data.decodeTime = getTimeNow() - startTime;
            data.sendTime = getTimeNow();

            myTrace("png:Decode By createImageBitmap," + data.decodeTime, url);

            data.type = "Image";
            postMessage(data, [data.imageBitmap]);
        }).catch(
            function (e) {
                showMsgToMain("catch e:" + e);
                pngFail(url, "parse fail" + e + ":ya");
            }
        )
    } catch (e) {
        pngFail(url, "parse fail" + e.toString() + ":ya");
    }
}

function getTimeNow() {
    return new Date().getTime();
}

function disableWorker(msg) {
    var data = {};
    data.url = url;
    data.imagedata = null;
    data.type = "Disable";
    data.msg = msg;
    postMessage(data);
}

function pngFail(url, msg) {
    var data = {};
    data.url = url;
    data.imagedata = null;
    data.type = "Image";
    data.msg = msg;
    //console.log("png:" + msg + " " + url);
    postMessage(data);
}

function showMsgToMain(msg) {
    var data = {};
    data.type = "Msg";
    data.msg = msg;
    postMessage(data);
}
