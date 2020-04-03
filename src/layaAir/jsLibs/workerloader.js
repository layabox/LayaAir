var createImageBitmapOK = self.createImageBitmap ? true : false;
onmessage = function (evt) {

    var data = evt.data;//通过evt.data获得发送来的数据
    loadImage2(data);
    if (!isSet) {
        isSet = true;
        setInterval(workerloop, 1000);
    }
}
var isSet = true;

function workerloop() {
    myTrace("png:workerloop");
}

var enableTrace = false;
var ifShowTraceToMain = false;

function myTrace(msg) {
    if (!enableTrace) return;
    console.log("png:" + msg)
    if (ifShowTraceToMain) {
        showMsgToMain(msg);
    }
}

function loadImage2(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    //showMsgToMain("loadImage2");
    xhr.responseType = "blob";
    myTrace("load:" + url);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            //showMsgToMain("onload:");
            myTrace("onload:" + url);
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                doCreateImageBitmap(xhr.response, url);
            } else {
                pngFail(url, "loadFail from onload" + xhr.status);
            }
        }
    };

    xhr.onerror = function (e) {
        pngFail(url, "loadFail");
    };

    xhr.send(null);
}

function doCreateImageBitmap(response, url) {
    try {
        //showMsgToMain("hihidoCreateImageBitmap");
        //showMsgToMain("doCreateImageBitmap:"+response);
        //var startTime=getTimeNow();
        //showMsgToMain("new self.Blob");
        var startTime = getTimeNow();
        self.createImageBitmap(response).then(function (imageBitmap) {
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
        }).catch(function (e) {
            showMsgToMain("catch e:" + e);
            pngFail(url, "parse fail" + e + ":ya");
        });
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
    console.log("png:" + msg + " " + url);
    postMessage(data);
}

function showMsgToMain(msg) {
    var data = {};
    data.type = "Msg";
    data.msg = msg;
    postMessage(data);
}
