
## Restangualr

https://github.com/mgonto/restangular

## ApiService

在 Restangular 之上的包装, 并被其他的 Model relate Service 使用.

- 配置超时设置
- 配置 root url
- 两个 api 实例
    - baseApi 给不需要登录的 api 调用
    - authApi 给需要登录的 api 调用, 匿名用户调用会被重定向到登录页面
- 错误处理
    - server relate error
    - 401 error
    - 其他错误信息 `getDisplayError`

## Model

- account
- user
- articles
- client
- clientKyc
- order
- product

用于调用不同 resource 下的 api(即主要被 REST 的 url 区分), 并适当缓存一部分数据 (如有必要的话)
