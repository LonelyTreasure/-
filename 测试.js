// listen-soul-vip-unlock.js
var body = $response.body;
var url = $request.url;
// 通用递归注入函数
function deepInject(obj) {
    if (!obj || typeof obj !== "object") return;
    // 定义常见的 VIP 关键词
    const vipKeys = ['vip_status', 'is_vip', 'isVip', 'member', 'level', 'role', 'vip'];
    for (var key in obj) {
        if (vipKeys.indexOf(key) !== -1 && typeof obj[key] === "boolean") {
            obj[key] = true; // 布尔型都改为 true
        } else if (vipKeys.indexOf(key) !== -1 && typeof obj[key] === "number") {
            obj[key] = 3; // 数值型改为 3(代表高级别)
        } else if (key === 'vip_time' || key === 'expire') {
            obj[key] = "2099-12-31T23:59:59.000Z"; // 时间字段统一改到未来
        } else if (typeof obj[key] === "object") {
            deepInject(obj[key]); // 递归深入下一层
        }
    }
    // 在顶层也强行加上一组 VIP 字段,确保万无一失
    obj.vip_status = true;
    obj.is_vip = true;
    obj.vip_time = "2099-12-31T23:59:59.000Z";
    obj.vip_level = 3;
}

if (url.indexOf("listensoul") !== -1 || url.indexOf("check-auth") !== -1) {
    try {
        var obj = JSON.parse(body);
        deepInject(obj);
        $done({ body: JSON.stringify(obj) });
    } catch (e) {
        $done({});
    }
} else {
    $done({});
}
