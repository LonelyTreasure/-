var fakeBody = `{
  "isLoggedIn": true,
  "session": {
    "token": "eyJ2IjoxLCJ1c2VySWQiOiIxMzI3MSIsImRldmljZUlkIjoiREFCRUJBRDYtMzkwNi00QUJCLUI2MzAtQURBQ0Y2QUFBQkY0IiwiaXNzdWVkQXQiOjE3OTMzODAxMDEyMTIsImV4cGlyZXNBdCI6MTgwMTE1NjEwMTIxMiwibm9uY2UiOiI5OTY4YzIwNmVhMjlkOTM3NTNkZjEyNmIwNTA3ODM5NSJ9.KABnRyk0hKEg37LH2bE0UV8k2N4PSs7ilvOKDFJGyAg",
    "userId": "13271",
    "deviceId": "DABEBAD6-3906-4ABB-B630-ADACF6AAABF4",
    "expiresAt": 1801156101212
  },
  "user": {
    "id": 13271,
    "username": "LonelyTreasure",
    "email": "2012379431@qq.com",
    "email_verified_at": "2026-06-17T06:45:15.000Z",
    "nickname": null,
    "avatar_base64": null,
    "signature": null,
    "activated_card_code": null,
    "created_at": "2026-06-17T03:03:34.000Z",
    "vip_status": true,
    "vip_time": "2099-12-31T23:59:59.000Z",
    "max_devices": 1,
    "device_ids": "DABEBAD6-3906-4ABB-B630-ADACF6AAABF4",
    "isPC": false
  },
  "vip_info": {
    "vip_status": true,
    "vip_time": "2099-12-31T23:59:59.000Z",
    "device_count": 1,
    "max_devices": 1
  },
  "message": "用户已登录"
}`;

console.log("[动听] 成功替换响应: " + $request.url);
$done({ body: fakeBody });
