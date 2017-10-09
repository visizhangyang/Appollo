## Table of Contents

### 常见模式 
- StateService
    - 常见的导航模式
    - route 改变时页面切换的方向
    - 后退按钮的模式
    - 清空历史记录的模式
- LoadingService
    - show custom toast
    - predefined toast: faild, loading, loaded success
- RefresherFactory
    调用 model service api 之上的一层封装:
    - 检测 api 是否已经加载了, 或有了 cached
    - 检测 api 是否在请求中, 并显示 loading service 的 loading 情况
    - 当 api 调用出错 显示 loading service 的错误情况
    - 可以重试 api 调用
- FormFactory


### 基本服务
- ApiService
    restangular 的一层封装
- AutoUpdate
    cordova-app-loader 的触发情况
- CodeCounterFactory
    发送邀请码的 60 秒倒计时 factory
- DeviceService
    设备相关的信息
- WechatService
    检测手机是否装了微信, 并提供分享接口
- ShareModalService
    分享 ui 对应的 Service
- $raven