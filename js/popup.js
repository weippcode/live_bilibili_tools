/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: 魏皮皮
 * @Date: 2023-03-07 22:53:36
 * @LastEditors: 魏皮皮
 * @LastEditTime: 2023-03-20 21:02:39
 */

// 发送消息
function sendMsg(type, value) {
    chrome.tabs.query(
        {
            active: true,
            currentWindow: true
        }, 
        tabs => { 
            let isPass = checkUrl("popup", tabs[0].url);
            if (isPass) {
                chrome.tabs.sendMessage(
                    tabs[0].id, 
                    {
                        type,
                        value
                    }
                )
            }
        }
    );
}

// 修改状态
async function setSelect(type, e, send) {
    let dom = $(e);
    let value = {};
    value[type] = dom.find("option:selected").val();
    if (value[type]) {
        await localSet(value);
        if (send) {
            sendMsg(type, state);
        }
    }
}
async function setInput(type, e, send) {
    let dom = $(e);
    let value = {};
    value[type] = parseInt(dom.val());
    if (!isNaN(value[type])) {
        await localSet(value);
        if (send) {
            sendMsg(type, state);
        }
    }
}
async function setCheckbox(type, state, send) {
    let value = {};
    value[type] = state;
    await localSet(value);
    if (send) {
        sendMsg(type, state);
    }
}

// 初始化
async function init() {
    await initStorage();
    await localGet(configList).then(result => {
        let timeTypeDom = $("#time-type");
        let timeDom = $("#time");
        let cwDom = $("#cw");
        let scDom = $("#sc");

        timeTypeDom.find(`option[value=${result.timeType}]`).attr("selected", true);
        timeDom.val(result.time);
        cwDom.attr("checked", result.cw);
        scDom.attr("checked", result.sc);

        cwDom.bootstrapSwitch();
        scDom.bootstrapSwitch();

        timeTypeDom.on("change", async function() {
            await setSelect("timeType", this, false);
        });
        timeDom.on("input", async function() {
            await setInput("time", this, false);
        });
        cwDom.on("switchChange.bootstrapSwitch", async function(event, state) {
            await setCheckbox("cw", state, true);
        });
        scDom.on("switchChange.bootstrapSwitch", async function(event, state) {
            await setCheckbox("sc", state, true);
        });
    });
}
init();