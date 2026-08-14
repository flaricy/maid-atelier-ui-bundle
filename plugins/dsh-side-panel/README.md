# dsh-side-panel

DSH Web 的右侧工作区面板，在当前会话旁集中提供 Git 审查、终端和文件操作。
可以点击dsh会话区弹出的文件链接，会自动打开相应的文件以供审阅。

## 来源与状态

本项目基于 [ccq1/dsh-side-panel](https://github.com/ccq1/dsh-side-panel) 修改，并保留上游的 BSD 3-Clause 许可与版权声明。当前分支为社区维护的非官方修改版，不代表 DeepSeek、DSH 项目或上游作者对本修改版的认可。

旧版界面截图已移除；外观以当前构建为准。

## 功能

1. Git审查，可以查看工作区和暂存区的文件，以及dsh每轮修改的代码，后续会增加回退。
2. 文件浏览器， 可以在会话区点击文件跳转到文件浏览器浏览文件。
3. 终端，在当前工作区直接运行命令，无需离开工作区，专注你的任务。

## 安装

从 Maid Atelier UI Bundle 安装：

```sh
dsh plugin --profile web add \
  "github:flaricy/maid-atelier-ui-bundle#path:/plugins/dsh-side-panel"
```

构建产物已经包含在仓库中，安装时不需要额外授权构建脚本。安装后进入自己的项目目录运行 `dsh web`。


## 配置

组合包默认启用以下配置：

```yaml
- insert:
    - id: side-panel
      name: '@dsh-external/dsh-side-panel'
      config:
        maxTextBytes: 2097152
        maxImageBytes: 10485760
        searchMaxResults: 200
```

| 配置项             | 默认值 | 说明                               |
| ------------------ | -----: | ---------------------------------- |
| `maxTextBytes`     |  2 MiB | 可读取和编辑的单个文本文件大小上限 |
| `maxImageBytes`    | 10 MiB | 可预览的单个图片大小上限           |
| `searchMaxResults` |    200 | 文件筛选返回的最大结果数           |

## 许可

项目代码依 [BSD 3-Clause License](LICENSE) 发布。浏览器构建中包含的第三方软件及完整许可文本见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

安全问题请按 [SECURITY.md](SECURITY.md) 中的私密报告流程处理。
