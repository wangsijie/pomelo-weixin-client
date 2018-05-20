# pomelo-weixin-client

pomelo客户端的微信小程序实现

## 安装

```
npm install pomelo-weixin-client
```

## 使用

```js
const pomelo = require('pomelo-weixin-client');

pomelo.init({
    host: host,
    port: port
}, function() {
    console.log('success');
});
```

具体使用方法见官方的[websocket](https://github.com/pomelonode/pomelo-jsclient-websocket)版本客户端说明

## 特别说明

微信仅支持wss连接（https）并且不支持自定义端口号，因此在服务器端进行额外的处理

例如以下代码：

```js
pomelo.init({
    host: 'example.com',
    port: 3005
});
```

实际上连接的是```wss://example.com/ws/3005/```

需要在服务器端将以上连接转换为```ws://example.com:3005```

这里提供nginx的例子：

```nginx
server
{
    listen       443 ssl http2 default_server;
    listen       [::]:443 ssl http2 default_server;
    server_name example.com;
    ssl on;
    #证书文件
    ssl_certificate     /etc/ssl/certs/ssl-cert.crt;
    #私钥文件
    ssl_certificate_key /etc/ssl/private/ssl-cert.key;

    ssl_session_timeout 5m;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers AESGCM:ALL:!DH:!EXPORT:!RC4:+HIGH:!MEDIUM:!LOW:!aNULL:!eNULL;
    ssl_prefer_server_ciphers on;

    location /ws/3005/ {
        proxy_pass http://127.0.0.1:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## License

MIT © [Wang Sijie](http://sijie.wang)