## Ionic

我一直使用的是ionic@2.0.0-beta.25

### Ionic hooks
Ionic cli 有自己的 Build 流程, 在执行 ionic cli 命令时, 会检测本地是否有 gulp task 并执行.
在 gulpfile 中可以找到对应的 Ionic hooks.

## ionic.config.js
里面有基本的 ionic cli 配置, 如:

    - documentRoot: ionic serve 的根目录, 
    - watchPatterns: ionic server 自带的 Live reload 机制中对应观察的文件
    - proxies: http-proxy options, 主要 mapping api的请求, 可以解决 CORS 等问题


## Gulp Tasks

常用的任务

- watch
    - 开发中使用, 用于检测app 变动, 并生成以上 `watchPatterns` 对应的文件, 触发 live reload
- build
    - 一般用于生产环境, 带上 --release option 即启用生产配置
- www
    - 一般在生产机器上, 用于 拷贝到本机上, 打包成 cordova 的资源并发版
- lint
    - 会在 pre-commit 前调用
    - 会在 watch 中调用
  
## local.config.json

用于配置不同的环境设置, 可以被 gulp build 任务来写入到源代码中
  
- apiBaseUrl, API 调用的 URL
- staticBaseUrl, App-loader 配置的资源加载路径
- raven: Sentry 的 token 配置
- Sentry: 【deprecating】

## package.json

主要看看 scripts 相关任务