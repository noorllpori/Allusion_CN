[！[构建状态](https://travis-ci.com/allusion-app/Allusion.svg?token=a7yw4czL1Lye2zty617R&branch=master)](https://travis-ci.com/allusion-app/Allusion)


Allusion是一个为艺术家构建的工具，旨在帮助您组织您的**视觉库**——一个包含您的全部参考文献、灵感和任何其他类型图像的地方。

[阅读更多关于Allusion→](https://allusion-app.github.io/)

##发展

###快速入门

你需要有[NodeJS](https://nodejs.org/en/download/)以及包管理器，如[Yarn](https://yarnpkg.com/lang/en/docs/install/)安装。
然后运行以下命令开始：

1.运行`yarn install`以安装或更新所有必要的依赖项。
2.运行`yarn-dev`将项目文件构建到`/build`目录。这将继续运行，以便在更新时立即构建更改的文件。
3.在第二个终端中，运行“yarn start”以启动应用程序。修改文件后刷新窗口（Ctrl/Cmd+R）以加载更新的构建文件。

###发布版本

可以在“/dist”文件夹中使用“yarn package”为您的平台构建可安装的可执行文件。该建筑是使用[电子建筑商]进行的(https://www.electron.build/)package，并由`package.json `文件中的一节配置。
当在Github中创建标签时，构建会自动发布到Github Release。

##更多信息

从文档到常见问题，任何相关内容都可以在我们的[wiki]中找到(https://github.com/allusion-app/Allusion/wiki).
