# Periodic Notes Calendar

一个基于 Vue 3 构建的 Obsidian 日历插件，提供年、季度、月、周四种视图，支持周期性笔记管理。

## 功能特性

### 多视图日历

- **年视图** - 概览全年，查看每个月的笔记记录情况
- **季度视图** - 以季度为单位组织和管理笔记
- **月视图** - 经典月历布局，直观展示每日笔记
- **周视图** - 聚焦当前周，适合短期规划

### 周期性笔记支持

完整支持五种周期性笔记：

| 笔记类型 | 默认格式 | 示例 |
|---------|---------|------|
| 日记 | `YYYY-MM-DD` | 2024-01-15 |
| 周记 | `YYYY-[W]ww` | 2024-W03 |
| 月记 | `YYYY-MM` | 2024-01 |
| 季记 | `YYYY-[Q]Q` | 2024-Q1 |
| 年记 | `YYYY` | 2024 |

### 丰富的设置选项

- 自定义每种笔记的存储文件夹
- 灵活的文件名日期格式
- 支持模板文件，快速初始化笔记内容
- 创建前确认对话框，防止误操作
- 智能文件夹和模板自动完成

### 快捷命令

通过命令面板快速访问：

- `Open calendar view` - 打开日历视图
- `Open daily note` - 打开日记
- `Open weekly note` - 打开周记
- `Open monthly note` - 打开月记
- `Open quarterly note` - 打开季记
- `Open yearly note` - 打开年记

## 安装

### 手动安装

1. 下载最新版本
2. 解压到 Obsidian 库的 `.obsidian/plugins/periodic-notes-calendar/` 目录
3. 重启 Obsidian
4. 在设置中启用插件

### 从源码构建

```bash
# 克隆仓库
git clone https://github.com/your-username/periodic-notes-calendar.git
cd periodic-notes-calendar

# 安装依赖
npm install

# 构建生产版本
npm run build
```

构建产物将输出到 `dist/` 目录。

## 开发

```bash
# 开发模式（监听文件变化）
npm run dev

# 类型检查
npm run typecheck
```

## 技术栈

- [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Pinia](https://pinia.vuejs.org/) - Vue 状态管理
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Moment.js](https://momentjs.com/) - 日期处理

## 配置说明

### 通用设置

| 设置项 | 说明 | 默认值 |
|-------|------|-------|
| Default view | 默认视图模式 | Month view |
| Confirm before creating | 创建笔记前是否确认 | 开启 |

### 周期性笔记设置

每种笔记类型都可独立配置：

- **Enable** - 是否启用该类型笔记
- **Folder** - 笔记存储文件夹（支持自动完成）
- **Format** - 文件名日期格式
- **Template** - 模板文件路径（支持自动完成）

## 使用技巧

1. **快速导航** - 使用视图切换器旁的箭头按钮快速切换月份/周/季度/年份
2. **回到今天** - 点击 "Today" 按钮快速返回当前日期
3. **模板复用** - 为不同类型笔记设置模板，保持笔记结构一致
4. **文件夹组织** - 建议为不同周期笔记创建独立文件夹，便于管理

## 许可证

[MIT](LICENSE)

## 贡献

欢迎提交 Issue 和 Pull Request！

---

如果这个插件对你有帮助，欢迎 Star 支持
