// listen-soul-vip-unlock.js
var body = $response.body;
var url = $request.url;

// 只处理 check-auth 接口
if (url.indexOf("/api/users/check-auth") !== -1) {
    try {
        var obj = JSON.parse(body);
        
        // 修改 user 对象下的 VIP 状态
        if (obj.user) {
            obj.user.vip_status = true;
            obj.user.vip_time = "2099-12-31T23:59:59.000Z";
        }
        
        // 修改 vip_info 对象下的 VIP 状态
        if (obj.vip_info) {
            obj.vip_info.vip_status = true;
            obj.vip_info.vip_time = "2099-12-31T23:59:59.000Z";
        }
        
        // 可选:也可以尝试修改 max_devices 以解锁更多设备
        if (obj.user) {
            obj.user.max_devices = 99;
        }
        if (obj.vip_info) {
            obj.vip_info.max_devices = 99;
        }
        
        var modifiedBody = JSON.stringify(obj);
        $done({ body: modifiedBody });
        
    } catch (e) {
        // 如果解析出错,保持不变
        $done({});
    }
} else {
    $done({});
}
