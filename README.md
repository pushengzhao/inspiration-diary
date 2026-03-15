# 灵感日记 - 微信小程序

一个用于记录日常灵感、真实事件和读书感悟的微信小程序，自动生成每日日记。

## 📱 项目简介

**灵感日记**帮助你随时捕捉生活中的闪光点：
- 💡 **灵感记录**：突然的想法、创意瞬间
- 📅 **事件记录**：当天发生的重要事情
- 📖 **读书感悟**：阅读时的思考与收获
- ✨ **自动成文**：一键生成结构化的当日日记

## 🚀 技术栈

- **前端框架**: 微信小程序原生开发
- **后端服务**: 微信云开发 (Cloud Base)
- **数据存储**: 云数据库 (NoSQL)
- **无需服务器**: 零运维成本

## 📁 项目结构

```
inspiration-diary/
├── app.js                 # 小程序入口
├── app.json               # 全局配置
├── app.wxss               # 全局样式
├── project.config.json    # 项目配置
├── sitemap.json           # 站点地图
├── images/                # 图标资源
├── pages/
│   ├── index/             # 首页（今日概览）
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   ├── record/            # 记录页（新增内容）
│   │   ├── record.js
│   │   ├── record.json
│   │   ├── record.wxml
│   │   └── record.wxss
│   ├── diary/             # 日记页（生成日记）
│   │   ├── diary.js
│   │   ├── diary.json
│   │   ├── diary.wxml
│   │   └── diary.wxss
│   └── history/           # 历史页（日历回顾）
│       ├── history.js
│       ├── history.json
│       ├── history.wxml
│       └── history.wxss
└── cloudfunctions/        # 云函数（可选）
    └── generateDiary/     # AI 日记生成云函数
```

## 🛠️ 快速开始

### 1. 环境准备

- 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 注册微信小程序账号（个人类型即可）

### 2. 导入项目

1. 打开微信开发者工具
2. 选择「导入项目」
3. 选择本项目目录 `/workspace`
4. 填入你的 AppID（或使用测试号）

### 3. 配置云开发

1. 在开发者工具中点击「云开发」按钮
2. 创建一个新的云开发环境
3. 复制环境 ID
4. 修改 `app.js` 中的 `env` 配置：
   ```javascript
   wx.cloud.init({
     env: 'your-env-id', // 替换为你的环境 ID
     traceUser: true,
   });
   ```

### 4. 创建数据库集合

在云开发控制台创建以下集合：

**集合名称**: `daily_entries`  
**权限**: 仅创建者可读写

数据结构示例：
```json
{
  "_id": "自动生成",
  "type": "inspiration|event|thought",
  "content": "记录内容",
  "tags": ["标签 1", "标签 2"],
  "date": "2024-01-15",
  "time": "14:30",
  "createTime": 1705308600000,
  "_openid": "自动填充"
}
```

**集合名称**: `diaries` (可选，用于保存生成的日记)  
**权限**: 仅创建者可读写

### 5. 添加 TabBar 图标

在 `images/` 目录下添加以下图标（81x81 像素 PNG）：
- `home.png` / `home-active.png` - 首页图标
- `edit.png` / `edit-active.png` - 记录图标
- `calendar.png` / `calendar-active.png` - 历史图标

> 💡 可从 [iconfont](https://www.iconfont.cn/) 下载免费图标

### 6. 运行项目

点击开发者工具的「编译」按钮即可预览小程序。

## 📝 功能说明

### 首页
- 显示今日日期、星期
- 统计今日各类记录数量
- 展示今日所有记录的列表预览
- 一键生成日记按钮

### 记录页
- 三种记录类型选择（灵感/事件/感悟）
- 富文本输入框（支持 1000 字）
- 标签管理功能
- 今日记录快速预览

### 日记生成页
- 自动聚合同日所有记录
- 智能分类整理（灵感/事件/感悟）
- 生成今日总结
- 支持复制、分享、保存

### 历史页
- 日历视图浏览历史记录
- 标记有记录的日期
- 查看任意日期的详细内容
- 月度统计数据

## 🔧 自定义配置

### 修改主题色

编辑 `app.wxss` 中的渐变色：
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### 启用 AI 日记生成

可以接入第三方 AI API（如文心一言、通义千问等）：

1. 创建云函数 `generateDiary`
2. 在云函数中调用 AI 接口
3. 在 `pages/diary/diary.js` 中调用云函数

示例云函数代码见 `cloudfunctions/generateDiary/index.js`（需自行创建）。

## 📊 数据库索引建议

为提升查询性能，建议在云数据库创建以下索引：

1. `daily_entries` 集合：
   - 字段：`date`，升序
   - 字段：`createTime`，升序
   - 复合索引：`date + type`

## 🐛 常见问题

### Q: 提示"appid 参数错误"
A: 在 `project.config.json` 中填入正确的 AppID，或在开发者工具中重新登录。

### Q: 云开发初始化失败
A: 检查 `app.js` 中的环境 ID 是否正确，确保已开通云开发服务。

### Q: 数据无法保存
A: 检查数据库集合权限设置，确保设置为"仅创建者可读写"。

### Q: TabBar 图标不显示
A: 确保图标文件路径正确，尺寸为 81x81 像素，格式为 PNG。

## 📄 开源协议

MIT License

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 邮件联系

---

**享受记录的乐趣，让每一天都值得回味！** ✨