<div align="center">

<h1>Maid Atelier Theme + Side Panel Bundle</h1>

<p><strong>给 DeepSeek Harness Web 一套优美、实用的工作界面。</strong></p>

<p>
  <img alt="DSH Web" src="https://img.shields.io/badge/DSH-Web-172347?style=flat-square">
  <img alt="Two plugins" src="https://img.shields.io/badge/plugins-2-5A6782?style=flat-square">
  <img alt="Community project" src="https://img.shields.io/badge/community-unofficial-C3A45D?style=flat-square">
</p>

<img src="docs/images/hero.webp" alt="Maid Atelier 主题界面预览" width="100%">

</div>

## 包含什么

作者修改之后的

- **Maid Atelier** — 柔和的深海蓝主题，支持亮色与暗色界面。推荐使用 *浅色* 主题。
- **Side Panel** — 在对话右侧浏览文件、搜索内容、预览代码、Markdown 与图片。

## 安装

运行这一条命令：

```sh
dsh plugin --profile web add \
  "github:flaricy/maid-atelier-ui-bundle#path:/plugins/maid-atelier" \
  "github:flaricy/maid-atelier-ui-bundle#path:/plugins/dsh-side-panel"
```

然后进入自己的项目目录并启动 DSH Web：

```sh
cd /path/to/your/project
dsh web
```

打开终端显示的网址，通常是 <http://localhost:3080>。

## 使用

不需要额外配置：

1. Maid Atelier 会自动生效，并跟随亮色或暗色模式。
2. 点击页面右上角的 **文件** 按钮打开侧栏。


## 默认设置

大多数用户可以直接使用默认值：

| Side Panel 项目 | 默认值 |
|---|---:|
| 单个文本文件 | 2 MiB |
| 单个预览图片 | 10 MiB |
| 文件搜索结果 | 200 条 |

高级配置见 [`plugins/dsh-side-panel/README.md`](plugins/dsh-side-panel/README.md)。

## 卸载

```sh
dsh plugin --profile web remove \
  @dsh-external/dsh-client-ui-skin-maid-atelier \
  @dsh-external/dsh-side-panel
```

## English

Maid Atelier UI Bundle combines a calm light/dark theme with a practical file,
preview, Git, and terminal side panel for DSH Web. Install both plugins with the
single command in [Install](#安装), start `dsh web` from your project directory,
then use the **File** button in the top-right corner. No extra configuration is
required.

## 来源与许可

这是非官方社区组合包，与 DeepSeek、DeepSeek Harness 或上游作者没有隶属或背书关系。

- Side Panel 基于 [ccq1/dsh-side-panel](https://github.com/ccq1/dsh-side-panel)，依 **BSD 3-Clause** 发布。
- Maid Atelier 基于 [Small-tailqwq/dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale)，主题与相关美术由上游声明为 **CC BY-NC-SA 4.0**。
- Maid Atelier **仅可用于非商业用途**；再分发或改作时必须保留署名、注明修改，并使用相同许可。
- 第三方 Apache-2.0 与 MIT 代码继续使用各自许可。

Maid Atelier 美术署名链：**上善**（角色原作）→ **ZipZipPipe / zipzip**（女仆二次设计）→ **Small-tailqwq**（Maid Atelier 主题设计）。完整范围与证据边界见 [`LICENSE_SCOPE.md`](LICENSE_SCOPE.md)、[`NOTICE`](plugins/maid-atelier/NOTICE) 和 [`ASSET_LICENSES.md`](plugins/maid-atelier/ASSET_LICENSES.md)。

> [!IMPORTANT]
> 上游公开仓库目前没有附带最初及二次作者允许改编、公开再分发和 CC 再许可的书面授权记录。本仓库保留上游许可声明和完整署名链，但不对素材权属作额外保证。公开镜像、再分发或改作美术素材前，请先阅读 `ASSET_LICENSES.md` 并取得必要授权，或替换相关素材。

本仓库仅通过 GitHub 分发，不代表拥有 `@dsh-external` npm scope 的发布权。
