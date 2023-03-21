/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: 魏皮皮
 * @Date: 2023-03-17 11:15:51
 * @LastEditors: 魏皮皮
 * @LastEditTime: 2023-03-20 12:29:44
 */

// 默认配置
const configDefault = {
    timeType: "regular",
    time: 10,
    cw: true,
    cw: true,
    sc: true,
    top: 0,
    left: 0
};
// 配置列表
const configList = [
    "timeType",
    "time",
    "cw",
    "sc",
    "top",
    "left"
];

const urlValidate = {
    popup: [
        /https:\/\/live.bilibili.com\/*/
    ]
};

// 检查URL
const checkUrl = (type, url) => {
    let isPass = false;
    for (let index in urlValidate[type]) {
        isPass = urlValidate[type][index].test(url);
        if (isPass) {
            break;
        }
    }
    return isPass;
}

// 初始化缓存
const initStorage = () => {
    return new Promise(resolve => {
        chrome.storage.local.get(configList, result => {
            let setValue = {};
            configList.forEach(item => {
                if (result[item] === undefined) {
                    setValue[item] = configDefault[item];
                }
            });
            chrome.storage.local.set(setValue, () => {
                resolve(setValue);
            });
        });
    })
}

// 设置缓存
const localSet = async value => {
    return new Promise(resolve => {
        chrome.storage.local.set(value, () => {
            resolve(value);
        });
    });
}

// 设置缓存
const localGet = async value => {
    return new Promise(resolve => {
        chrome.storage.local.get(value, result => {
            resolve(result);
        });
    });
}
