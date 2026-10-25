var url = $request.url;
var newUrl = url.replace(/^https?:\/\/api\.57016299\.xyz/, "https://106.54.57.62:8443");
console.log("[重定向] " + url + " → " + newUrl);
$done({ url: newUrl });
