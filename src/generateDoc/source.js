classList["Core"] = classList["Core"].concat(excludeClassList["Core"]);

var baseUrl = location.protocol + "//" + location.host + location.pathname;
var allClasses = [];

// 填充DOM
for (var i = 0; i < categories.length; ++i) {
    var categoryName = categories[i];
    var packageLi = "<li><a class='list-item' title='" + categoryName + "' href='javascript:void(0)'>" + categoryName + "</a></li>";
    $("#packageGroup").append(packageLi);

    allClasses = allClasses.concat(classList[categoryName]);
}
allClasses.sort();

// 填充所有类
for (i = 0; i < allClasses.length; i++) {
    var classItem = "<li><a href='javascript:void(0)'>" + allClasses[i] + "</a></li>";
    $("#allClassList").append(classItem);
}

$("window").ready(function () {
    // 解析pacakge
    var categoryName = getCategoryName();
    navToCategory(categoryName);
    showSelectedCategory(categoryName);

    // 解析class
    var fullClassName = getFullClassName();
    navToClass(fullClassName,"", 0);
});

// 显示指定分类对应的类列表
function navToCategory(packageName) {
    $("#classGroup").empty();
    packageName = decodeURIComponent(packageName);
    for (var i = 0; i < classList[packageName].length; ++i) {
        var className = classList[packageName][i];
        var classLi = "<li><a href='javascript:void(0)'>" + className + "</a></li>";
        $("#classGroup").append(classLi);
    }

    hideExcludeClasses($("#classGroup li a"));
}


function navToClass(classFullName, memberName, flags) {
    document.title = classFullName;
    var classPath;
    if(flags === 0){
        var htmlName = "_" + classFullName.toLowerCase().replace(/\./g, "_") + "_.";
        var classPaths = classFullName.split('.');
        if(classPaths.length === 0){
            return;
        }
        var className = classPaths[classPaths.length - 1];
        htmlName += className.toLowerCase() ;
        if (classList["Enum"].indexOf(classFullName)!=-1) {
            htmlName = "enums." + htmlName;
        }
        classPath = baseUrl.replace(/index.html/, "") + "laya/classes/" + htmlName + ".html";
        scrollTo(0);
    }
    else if(flags === 1){
        if(classFullName.indexOf("interfaces.") !== -1){
            classFullName = classFullName.replace(/interfaces./, "");
            classFullName = classFullName.replace(/classes/, "interfaces");
        }
        else if(classFullName.indexOf("classes.") !== -1){
            classFullName = classFullName.replace(/classes\./, "");
        }
        classPath = baseUrl.replace(/index.html/, "")  + classFullName + ".html";
        if(memberName && memberName != ""){
            classPath += '#' + memberName;
        }
        else{
            scrollTo(0);
        }
    }

    

    $.ajax(
        {
            type: "get",
            async: true,
            url: classPath,
            timeout: 1000,
            success: function (data) {
                data = data.replace(/<link.*?>/g, '').// 删除css文件加载
                replace(/<script.*?<\/script>/gm, '').// 删除js文件加载
                replace(/\.\.\//g, "");

                $(".right-part").html(data);
                $(".titleTable").remove();

                createCodeTable();

                translate();
                removeNodeByClass("tsd-page-toolbar");//tsd-kind-method tsd-parent-kind-class tsd-is-inherited
                removeNodeByClass("tsd-is-inherited");
                removeNodeByClass("tsd-page-title");
                removeNodeByClass("tsd-sources");
                removeNodeByClass("tsd-navigation");
                //继承类和被继承类
                replaceClassHypelink(".tsd-hierarchy li a", 1);
                replaceClassHypelink(".tsd-index-list li a", 1);
                //这是属性的类型，点击会跳转
                replaceClassHypelink(".tsd-member-group a", 0);


                memberName || (memberName = location.hash.substr(1));
                if (memberName) {
                    setTimeout(
                        function () {
                            // 解析类成员锚链接
                            var memeberPosY = $('a[name="' + memberName + '"]')[0].scrollIntoView();
                        }.bind(this),
                        50);
                }
            },
            error: function (error) {
                console.log(error.text);
                // 如果不是本地打开，return
                if (location.protocol.indexOf('file') == -1) {
                    return;
                }
                // 获取本地资源出错
                // 可能得情况: 1) 没有使用本地服务器 2)直接打开并别没有关闭浏览器的安全限制
                if (typeof language !== 'undefined' && language == 'en') {
                    alert('Please turn off browser security restrictions or use local server access!');
                } else {
                    alert('请关闭浏览器的安全限制或使用本地服务器访问！');
                }
            }
        });
}

function createCodeTable() {
    var listings = $(".listing");
    var asPre, jsPre, tsPre;
    for (var i = 0; i < listings.length; i++) {
        var listing = listings[i];

        if (i % 3 == 2) {
            tsPre = $('<pre class="brush:as3"></pre>');
            tsPre.html(listing.firstChild.innerText);

            var codeCon = $('<div class="bs-example bs-example-tabs">');
            var codeTab = $('<div class="tab-content"></div>');
            var asPanel = $('<div role="tabpanel" class="tab-pane fade in active" aria-labelledby="as-tab"></div>');
            asPanel.attr("id", "as" + i);
            var jsPanel = $('<div role="tabpanel" class="tab-pane fade" aria-labelledby="js-tab"></div>');
            jsPanel.attr("id", "js" + i);
            var tsPanel = $('<div role="tabpanel" class="tab-pane fade" aria-labelledby="ts-tab"></div>');
            tsPanel.attr("id", "ts" + i);

            codeCon.append($(
                '<ul id="myTabs" class="nav nav-tabs" role="tablist">' +
                '<li role="presentation" class="active">' +
                '<a href="#as' + i + '" role="tab" id="as-tab' + i + '" data-toggle="tab" aria-controls="as' + i + '" aria-expanded="true">ActionScript</a>' +
                '</li>' +
                '<li role="presentation">' +
                '<a href="#js' + i + '" role="tab" id="js-tab' + i + '" data-toggle="tab" aria-controls="js' + i + '">JavaScript</a>' +
                '</li>' +
                '<li role="presentation">' +
                '<a href="#ts' + i + '" role="tab" id="ts-tab' + i + '" data-toggle="tab" aria-controls="ts' + i + '">TypeScript</a>' +
                '</li>' +
                '</ul>'));

            codeCon.append(codeTab);

            codeTab.append(asPanel);
            codeTab.append(jsPanel);
            codeTab.append(tsPanel);

            asPanel.append(asPre);
            jsPanel.append(jsPre);
            tsPanel.append(tsPre);

            $(listing.parentNode).append(codeCon);

            SyntaxHighlighter.highlight();

            $(".code .container div").css("whiteSpace", "nowrap");
        }
        else if (i % 2 == 1) {
            jsPre = $('<pre class="brush:js"></pre>');
            jsPre.html(listing.firstChild.innerText);
        }
        else {
            asPre = $('<pre class="brush:as3"></pre>');
            asPre.html(listing.firstChild.innerText);
        }

        listing.remove();
    }
}

function translate() {
    var headerTableRows = $(".classHeaderTable tbody tr");

    var innerText, newText;
    for (var i = headerTableRows.length - 1; i >= 0; i--) {
        innerText = headerTableRows[i].firstChild.innerText;
        switch (innerText) {
            case "Class":
                newText = "类";
                break;
            case "Implements":
                newText = "实现";
                break;
            case "Subclasses":
                newText = "子类";
                break;
            default:
                newText = "";
        }

        if (newText)
            headerTableRows[i].firstChild.innerText = newText;
    }

    // if(headerTableRows[3])
    // headerTableRows[3].firstChild.innerText = "子类"
}


function removeNodeByID(node){
    var cmd = '#' + node;
    var node = $(cmd);
    if(node){
        node.remove();
    }
}
function removeNodeByClass(node){
    var cmd = '.' + node;
    var node = $(cmd);
    if(node){
        if(node.length > 1){
            for(var i = 0; i < node.length; ++i){
                node[i].remove();
            }
        }
        else{
            node.remove();
        }
    }
    else{
    }
}
// 更改
function removePackageHypelink() {
    var hypelinkContainer = $(".classHeaderTableLabel")[0].parentNode;

    var innerText = hypelinkContainer.childNodes[1].innerText;

    hypelinkContainer.childNodes[1].remove();

    var newElement = document.createElement("p");
    newElement.innerText = innerText;

    hypelinkContainer.appendChild(newElement);
}

function removeSeeAlsoHypeLink() {
    var seeAlsos = $(".seeAlso a");
    for (var i = seeAlsos.length - 1; i >= 0; i--) {
        var seeAlsoItem = $(seeAlsos[i]);
        var innerText = seeAlsoItem.html();

        if ((innerText.indexOf(".") == -1) && // 无.号
            (classList["TopLevel"].indexOf(innerText) == -1)) //目标类是当前类
        {
            seeAlsoItem.attr("href", "#" + innerText);
        }
        else {
            seeAlsoItem.attr("href", "javascript:void(0)");
        }
    }
    ;

    seeAlsos.click(function (e) {
        var innerText = e.target.innerText;
        if ($(e.target).attr("href") == "javascript:void(0)") {
            if (isClass(innerText)) // 目标是一个类
            {
                navToClass(innerText,"", 0);
                pushToHistory(getCategoryName(), innerText);
            }
            else // 目标是其他类成员
            {
                var dotIndex = innerText.lastIndexOf(".");
                var targetClass = innerText.substring(0, dotIndex);
                var memberName = innerText.substring(dotIndex + 1);

                setTimeout(
                    function () {
                        // 解析类成员锚链接
                        var memeberPosY = $('a[name="' + memberName + '"]')[0].scrollIntoView();
                    }.bind(this),
                    50);

                if (targetClass) {
                    navToClass(targetClass,"", 0);
                    pushToHistory(getCategoryName(), targetClass, memberName);
                }
            }
        }
    });

}
// 把ASDoc生成的页面跳转链接改成页内加载
// selector为JQuery的选择器
function replaceClassHypelink(selector, flags) {
    var elementList = $(selector);
    var element;
    for (var i = elementList.length - 1; i >= 0; i--) {
        element = elementList[i];
        if (!element.attributes.href)
            continue;
        if (element.attributes.href.nodeValue.charAt(0) != "#") {
            element.setAttribute("fullName", element.attributes.href.nodeValue.replace(".html", "").replace(/\//g, "."));
            element.onclick = function (e) {
                e.preventDefault();
                var fullClassName = e.currentTarget.attributes.fullName.nodeValue;
                var parts = fullClassName.split("#");
                var className = "laya/classes/" + parts[0];
                scrollTo(0);
                //navToClass(parts[0], parts[1]);
                navToClass(className, parts[1], 1);

                var categoryName = getClassCategary(fullClassName);

                pushToHistory(categoryName, fullClassName);
            };
            element.href = "javascript:void(0)";
        }
        else {
             /*element.setAttribute("anchor", element.attributes.href.nodeValue.substring(1));
             element.addEventListener('click', function(e)
            {
             	var anchor = e.target.attributes.anchor.nodeValue;
             	var anchorElem = $('a[name="' + anchor + '"]');
             	scrollTo(anchorElem.offset().top);
            });*/
        }

    }
}



// 选择包
packageGroup.onclick = function (e) {
    if (e.target.tagName != "A")
        return;

    // 导航至指定包
    var categoryName = e.target.innerText;

    pushToHistory(categoryName, classList[categoryName][0]);

    navToCategory(categoryName);

    showSelectedCategory(categoryName);
}

// 选择类
classGroup.onclick = allClassList.onclick = function (e) {
    if (e.target.tagName != "A")
        return;

    // 导航至指定类
    var categoryName = getCategoryName();

    history.pushState(
        {}, "",
        baseUrl + "?category=" + categoryName + "&class=" + e.target.innerText);

    navToClass(e.target.innerText, "", 0);
    scrollTo(0);
}

// 缓动滑动到y
function scrollTo(y) {
    $("#ldc_content").animate(
        {
            scrollTop: y
        }, 0);
}

// 获取路径参数值
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg); //匹配目标参数
    if(r != null){
        return decodeURIComponent(r[2]);
    }
    return null;//返回参数值
}

// 获取当前url的package参数
function getCategoryName() {
    var category = getUrlParam("category") || 'Core';
    return category;
}

// 获取当前url的class参数
function getFullClassName() {
    var classValue = getUrlParam('class') || 'Laya';
    return classValue;
}

// 获取当前class
function getClassName() {
    var fullName = getFullClassName();
    var dotIndex = fullName.lastIndexOf(".");
    return fullName.substr(dotIndex + 1);
}

function isClass(fullName) {
    for (var i = categories.length - 1; i >= 0; i--) {
        var classes = classList[categories[i]];
        if (classes.indexOf(fullName) > -1)
            return true;
    }
    ;
    return false;
}

classSearch.oninput = function (e) {
    var list = $("#classGroup li a");
    var searchFor = e.target.value.toLowerCase();

    if (searchFor == "")
        hideExcludeClasses(list);
    else
        searchHandler(list, searchFor);
}

searchAllClass.oninput = function (e) {
    searchHandler($("#allClassList li a"), e.target.value.toLowerCase());
}

function hideExcludeClasses(list) {
    for (var i = list.length - 1; i >= 0; i--) {
        var itemVal = list[i].innerText;
        var display;

        if (excludeClassList["Core"].indexOf(itemVal) > -1)
            display = "none";
        else
            display = "block";

        list[i].parentNode.style.display = display;
    }
}

// 符合的将显示 不符合的将隐藏
function searchHandler(list, value) {
    if (value.indexOf("laya.") == 0)
        value = value.substr(5);

    for (var i = list.length - 1; i >= 0; i--) {
        var itemVal = list[i].innerText;
        var display;

        if (itemVal.toLowerCase().indexOf(value) > -1)
            display = "block";
        else
            display = "none";

        list[i].parentNode.style.display = display;
    }
}

// 根据完全限定名称获取分类
function getClassCategary(classFullName) {
    for (var i = categories.length - 1; i >= 0; i--) {
        if (classList[categories[i]].indexOf(classFullName) > -1)
            return categories[i];
    }
    ;
    return '';
}

// 由于页面的切换无刷新 为了模拟前进后退 将切换的页面push到history中
function pushToHistory(packageName, className, search) {
    var url = baseUrl + "?category=" + packageName + "&class=" + className;

    if (search)
        url += "#" + search;

    history.pushState(
        {
            title: "",
            url: url
        }, "", url);
}

// 选中已选择的分类
function showSelectedCategory(categoryName) {
    var categories = $("#packageGroup li a");
    $("#packageGroup li").removeClass("swich");
    for (var i = categories.length - 1; i >= 0; i--) {
        if (categories[i].innerText == categoryName) {
            categories[i].setAttribute("class", "cur");
            categories[i].parentElement.setAttribute("class", "swich");
        }
        else
            categories[i].setAttribute("class", "list-item");
    }
    ;
}

// 用户执行前进或后退网页时 无刷跳转历史记录
window.onpopstate = function () {
    navToClass(getFullClassName(),"", 0);
}

category.style.display = "block";
classIndex.style.display = "none";

categoryRadio.onclick = function (e) {
    category.style.display = "block";
    classIndex.style.display = "none";
}

classIndexRadio.onclick = function (e) {
    category.style.display = "none";
    classIndex.style.display = "block";
}

resize();
window.onresize = resize;

function resize() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    $(".sider-content").height(h);
    $(".col-sm-9").height(h);
    $(".classCon").height(h - 288);
    $(".col-sm-9").width(w - $(".col-md-2").width() - 45);
    $("#classIndex").height(h - 112);
}