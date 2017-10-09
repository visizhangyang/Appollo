## Root entry

`app/scss/app`

## Ionic Framework CSS Customization

1. 变量相关的配置就在 entry 里面
2. 模块相关的 override
    - `app/scss/_*.css`
  
可以参考参考 `app/lib/ionic/scss/` 目录下的 scss 文件结构、内容
    - 哪些变量可以修改
    - 哪些模块如何覆盖
  
## Component & Page 相关的 scss

entry:
  - app/js/component/component.scss
  - app/js/pages/pages.scss

实践方式: 在 Component 或 Page 的 template 的根 Dom 设置一个独一的 className 作为 scss 的名称空间来隔离

如页面 tab-account就会创建三个文件
  - tab-account.html
  - tab-account.scss
  - tab-account.js

并把 tab-account.scss 包括到 app/js/pages/pages.scss 里面去

