if (url.indexOf("/api/users/check-auth") !== -1) {
    var fakeResponse = {
        "isLoggedIn": true,
        "user": {
            "id": 13271,
            "username": "LonelyTreasure",
            "email": null,
            "email_verified_at": null,
            "nickname": null,
            "avatar_base64": null,
            "signature": null,
            "activated_card_code": null,
            "created_at": "2026-06-17T03:03:34.000Z",
            "vip_status": true,
            "vip_time": "2099-12-31T23:59:59.000Z",   // ✅ 已改为未来时间
            "max_devices": 1,
            "device_ids": "DABEBAD6-3906-4ABB-B630-ADACF6AAABF4",
            "isPC": false
        },
        "vip_info": {
            "vip_status": true,
            "vip_time": "2099-12-31T23:59:59.000Z",   // ✅ 已改为未来时间
            "device_count": 1,
            "max_devices": 1
        },
        "message": "用户已登录"
    };
    $done({ body: JSON.stringify(fakeResponse) });
} else {
    $done({});
}
