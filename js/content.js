/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: 魏皮皮
 * @Date: 2023-03-09 22:44:39
 * @LastEditors: 魏皮皮
 * @LastEditTime: 2023-03-21 09:40:38
 */

// 控制显示
let domKey = {
    cw: ".haruna-sekai-de-ichiban-kawaii",
    sc: "#dys-sc"
};
function setShow(bodyDom, type, value) {
    let dom = bodyDom.find(domKey[type]);
    switch(type) {
        case "cw":
            value ? dom.hide() : dom.show();
            break;
        case "sc":
            value ? dom.show() : dom.hide();
            break;
    }
}

// 获取时间
function getTime(
    { 
        timeType, 
        time
    },
    cell
) {
    time = parseInt(time);
    if (isNaN(time)) {
        time = 10;
    }
    let wtime = 10000;
    if (timeType === "regular") {
        wtime = time * 1000;
    } else if (timeType === "cell") {
        wtime = cell / 100 * time * 1000;
    }
    console.log(`关闭时间：${wtime / 1000}秒`);
    return wtime;
}

// 复读弹幕
function pushRereadingDom(bodyDom) {
    let rereadingDom = $(`<li class="_context-menu-item_19b1c"><span class="_context-menu-text_19b1c">复读弹幕</span></li>`);
    let contextMenuDom = bodyDom.find("._web-player-context-menu_19b1c");
    contextMenuDom.append(rereadingDom);
    rereadingDom.on("click", () => {
        let value = contextMenuDom.find("li").eq(0).children("span").text();
        if (value !== "观看卡顿？切换备线试试") {
            let input = bodyDom.find(".chat-input");
            input.val(value).trigger("input");
            bodyDom.find(".bottom-actions").find("button").eq(0).click();
        }
        contextMenuDom.css("opacity", 0);
    });
}

// 初始化
async function init(bodyDom) {
    let documentDom = $(document);
    let livePlayerDom = bodyDom.find("#live-player");
    livePlayerDom.prepend(`<div id="dys-sc"></div>`);
    let dysScDom = bodyDom.find("#dys-sc");
    // pushRereadingDom(bodyDom);
    window.setTimeout(
        () => {
            console.log(123);
            livePlayerDom.trigger("mousemove");
        },
        10000
    );
    await initStorage();
    await localGet(["cw", "sc", "top", "left"]).then(result => {
        setShow(bodyDom, "cw", result.cw);
        setShow(bodyDom, "sc", result.sc);
        dysScDom.css("top", `${result.top}px`);
        dysScDom.css("left", `${result.left}px`);
    });
    dysScDom.on("mousedown", e => {
        let top = 0;
        let left = 0;
        function moveFun(e) {
            top = e.clientY;
            left = e.clientX;
            let leftBoundary = bodyDom.outerWidth() - 310;
            if (left > leftBoundary) {
                left = leftBoundary;
            }
            dysScDom.css("top", `${top}px`);
            dysScDom.css("left", `${left}px`);
        }
        documentDom.on("mousemove", moveFun);
        documentDom.on("mouseup", async () => {
            documentDom.off("mousemove", moveFun);
            await localSet({
                top: top,
                left: left
            });
        });
    });
    chrome.runtime.onMessage.addListener(({ type, value }) => {
        setShow(bodyDom, type, value);
    });
    bodyDom.find("#chat-history-list")[0].addEventListener("DOMNodeInserted", value => {
        $(value.relatedNode).children().toArray().forEach(async item => {
            item = $(item);
            let ct = item.attr("data-ct");
            if (
                ct && 
                item.children(".card-item-top-right").length && 
                !bodyDom.find(`#dys-sc-${ct}`).length
            ) {
                let uname = item.attr("data-uname");
                let danmaku = item.attr("data-danmaku");
                let cell = item.children(".card-item-top-right").html();
                let cellNum = parseInt(cell.substring(0, cell.length - 2));
                let tcolor = item.children(".card-item-middle-top").css("background-color");
                let bcolor = item.children(".card-item-middle-bottom").css("background-color");
                let scHtml = `
                    <div id="dys-sc-${ct}" class="dys-sc">
                        <div class="header" style="background-color: ${tcolor};">
                            <div>
                                <p>${uname}</p>
                                <span>￥${cellNum / 10}</span>
                            </div>
                            <span class="close">关闭</span>
                        </div>
                        <div class="footer" style="background-color: ${bcolor};">${danmaku}</div>
                    </div>
                `;
                let scDom = $(scHtml);
                scDom.on("click", ".close", function() {
                    $(this).parent().parent().hide();
                });
                dysScDom.append(scDom);
                await localGet(["time", "timeType"]).then(result => {
                    window.setTimeout(
                        () => {
                            let scDom = bodyDom.find(`#dys-sc-${ct}`);
                            if (scDom.length) {
                                scDom.hide();
                            }
                        }, 
                        getTime(result, cellNum)
                    );
                });
            }
        });
    });
}

function loadInit() {
    console.log("----------初始化加载----------");
    let bodyDom = $("#player-ctnr")
        .find("iframe")
        .contents()
        .find("body");
    if (!bodyDom.length) {
        bodyDom = $("body");
    } else {
        bodyDom.parent().find("head").append(`<link rel="stylesheet" href="${chrome.runtime.getURL("css/content.css")}">`);
    }
    if (bodyDom.find("#chat-history-list").length) {
        init(bodyDom);
    } else {
        console.log("----------初始化失败3秒后重新加载----------");
        window.setTimeout(
            () => {
                loadInit();
            }, 
            3000
        );
    }
}

loadInit();