# UI 设计规范 — 选择困难终结

> **版本**：v1.0  
> **更新日期**：2026-06-10  
> **设计风格**：暖色手绘 · 粗黑描边 · 扁平圆角 · 简笔立体感  
> **参考 Demo**：[demo.html](demo.html)

---

## 目录

1. [设计理念](#1-设计理念)
2. [配色方案](#2-配色方案)
3. [字体规范](#3-字体规范)
4. [描边与阴影](#4-描边与阴影)
5. [圆角规范](#5-圆角规范)
6. [间距与布局](#6-间距与布局)
7. [卡片样式](#7-卡片样式)
8. [按钮样式](#8-按钮样式)
9. [表单组件](#9-表单组件)
10. [标签与徽章](#10-标签与徽章)
11. [滑块组件](#11-滑块组件)
12. [进度条](#12-进度条)
13. [切换开关](#13-切换开关)
14. [表格样式](#14-表格样式)
15. [弹窗组件](#15-弹窗组件)
16. [柱状图规范](#16-柱状图规范)
17. [页面布局模板](#17-页面布局模板)
18. [CSS 变量速查表](#18-css-变量速查表)

---

## 1. 设计理念

### 核心风格关键词

| 关键词 | 说明 |
|--------|------|
| **暖色手绘** | 米白/浅黄/浅粉低饱和暖色调，模拟纸上作画的手工感 |
| **粗黑描边** | 所有组件统一使用 3.5px 纯黑实线边框，像用马克笔勾线 |
| **偏移阴影** | 右下方向 4-6px 偏移的硬阴影，无模糊，营造纸片叠加的立体感 |
| **扁平圆角** | 纯色填充，无渐变纹理，圆角统一柔和，形似贴纸/标签 |
| **简笔风** | 避免过于精致的渐变和投影，追求手绘般的拙朴感 |

### 设计原则

1. **一致性**：所有可交互组件必须有粗黑描边 + 偏移阴影，不可交互的辅助元素可省略
2. **层级**：通过边框粗细（3.5px > 2px）和阴影偏移量（6px > 4px > 2px）表达层级
3. **反馈**：hover 时阴影加深 + 轻微上移（-1px, -2px），active 时阴影减弱 + 下压（+2px）
4. **留白**：卡片内边距 32-36px，组件间距 12-20px，保持呼吸感

---

## 2. 配色方案

### 2.1 主色调 — 暖色系

| 变量名 | 色值 | 色块 | 用途 |
|--------|------|------|------|
| `--cream` | `#FFFBF5` | ██████ | 全局背景 |
| `--cream-deep` | `#FFF7EC` | ██████ | 卡片底色（暖黄版）、底部区域 |
| `--yellow-pale` | `#FFF6D5` | ██████ | 标签 / 权重徽章 / 图表柱子（默认） |
| `--yellow-warm` | `#FFEDB3` | ██████ | 主按钮底色 / 高亮柱子 / 推荐项底色 / 标题高亮背景 |
| `--pink-pale` | `#FFEFEC` | ██████ | 粉色标签 / 粉色卡片 / 次按钮 |
| `--pink-warm` | `#FFE0DA` | ██████ | 粉色按钮 hover |
| `--mint-pale` | `#EDF8F0` | ██████ | 薄荷绿标签 / 成功状态 / 开关 ON 态 |
| `--mint-warm` | `#C8ECD4` | ██████ | 开关 ON 态背景 |
| `--lavender` | `#F3EEFB` | ██████ | 预留：紫色标签（备选） |
| `--peach` | `#FFECD6` | ██████ | 蜜桃色标签（备选） |

### 2.2 中性色

| 变量名 | 色值 | 色块 | 用途 |
|--------|------|------|------|
| `--black` | `#1A1A1A` | ██████ | 主文字色、所有描边色 |
| `--black-soft` | `#3A3A3A` | ██████ | 正文文字 |
| `--gray-mid` | `#7A7A7A` | ██████ | 辅助文字、说明文字 |
| `--gray-light` | `#B0B0B0` | ██████ | 占位符文字、禁用态提示 |
| 白色 | `#FFFFFF` | ██████ | 卡片底、输入框底 |

### 2.3 功能色

| 用途 | 色值 | 色块 |
|------|------|------|
| 推荐 / 成功 | `--yellow-warm` `#FFEDB3` | ██████ |
| 警告 / 中等 | `--yellow-pale` `#FFF6D5` | ██████ |
| 危险 / 删除 | `#D94A3A` | ██████ |
| 信息 / 薄荷 | `--mint-pale` `#EDF8F0` | ██████ |

### 2.4 背景渐变

全局背景使用 CSS `radial-gradient` 叠加暖色光晕，不使用纯色：

```css
body {
  background-color: #FFFBF5;  /* fallback */
  background-image:
    radial-gradient(circle at 15% 5%,  rgba(255,235,210,0.5) 0%, transparent 55%),
    radial-gradient(circle at 85% 95%, rgba(255,215,210,0.4) 0%, transparent 55%),
    radial-gradient(circle at 50% 50%, rgba(255,245,225,0.3) 0%, transparent 70%);
}
```

---

## 3. 字体规范

### 3.1 字体家族

```css
--font-heading: 'DM Sans', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
--font-body:    'DM Sans', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
```

- **英文**优先使用 DM Sans（几何感、现代、与手绘风搭配）
- **中文**降级至苹方 / 微软雅黑
- 标题和正文使用同一字体栈，通过 weight 和 size 区分层级

### 3.2 字体层级

| 层级 | 用途 | 字号 | 字重 | 行高 | 字间距 | 示例 |
|:---:|------|:---:|:---:|:---:|:---:|------|
| **H0** | 页面大标题（Hero） | `2.4rem` (38px) | 900 | 1.25 | -0.03em | 🏆 沙拉 |
| **H1** | 页面标题 | `1.7rem` (27px) | 800 | 1.25 | -0.02em | 选择困难终结 |
| **H2** | 区块标题 | `1.15rem` (18px) | 700-800 | 1.4 | -0.01em | 问题库管理 |
| **Body** | 正文 / 标签文字 | `0.85-0.95rem` (14-15px) | 500-700 | 1.6 | 0 | 输入选项… |
| **Small** | 辅助说明 | `0.78-0.85rem` (12-14px) | 500-600 | 1.5 | 0 | 1 = 非常不符合 |
| **Caption** | 时间戳 / 表头 / Badge | `0.7-0.74rem` (11-12px) | 600-800 | 1.4 | +0.03em | 2026-06-10 |

### 3.3 排版规则

- 标题与大段文字之间至少留 12px 间距
- 说明文字紧跟标题，使用 `--gray-mid`
- 占位符使用 `--gray-light`，斜体（可选）
- 关键数据数字使用 `font-weight: 800` 加粗突出

---

## 4. 描边与阴影

### 4.1 描边规范

| 级别 | CSS | 用途 |
|:---:|------|------|
| **主描边** | `border: 3.5px solid #1A1A1A` | 卡片、按钮、输入框、图表框、弹窗 |
| **次描边** | `border: 2px solid #1A1A1A` | 滑块条、表单项、开关、分割线、标签、小按钮 |
| **虚线** | `border: 3px dashed #1A1A1A` | 添加表单区域（表示可扩展） |

### 4.2 阴影规范

| 级别 | CSS | 用途 |
|:---:|------|------|
| **卡片阴影** | `box-shadow: 6px 6px 0 rgba(0,0,0,0.09)` | 大卡片、弹窗 |
| **通用阴影** | `box-shadow: 4px 4px 0 rgba(0,0,0,0.1)` | 按钮、标签、滑块拇指 |
| **小型阴影** | `box-shadow: 3px 3px 0 rgba(0,0,0,0.07)` | 输入框、标签、历史列表项 |
| **微型阴影** | `box-shadow: 2px 2px 0 rgba(0,0,0,0.06)` | Badge、开关、得分小方块 |

**核心原则**：阴影只用 **偏移量 + 透明度**，不使用 `blur`（模糊半径始终为 0）。这样保持手绘简笔画的硬朗感。

### 4.3 Hover 反馈

```css
/* 卡片 hover — 阴影加深 + 轻微上浮 */
.card:hover {
  transform: translate(-1px, -2px);
  box-shadow: 8px 8px 0 rgba(0,0,0,0.1);
}

/* 按钮 hover — 阴影加深 */
.btn:hover {
  box-shadow: 5px 5px 0 rgba(0,0,0,0.13);
}

/* 按钮 active — 按下 */
.btn:active {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0 rgba(0,0,0,0.08);
}
```

---

## 5. 圆角规范

| 级别 | 值 | 用途 |
|:---:|:---:|------|
| **全圆角** | `9999px` (pill) | 按钮、输入框、标签、Badge、进度条 |
| **超大圆角** | `28px` (`--radius-xl`) | 大卡片、弹窗 |
| **大圆角** | `22px` (`--radius-lg`) | 卡片 |
| **标准圆角** | `18px` (`--radius`) | 滑块条、历史列表项、图表框 |
| **小圆角** | `12px` (`--radius-sm`) | 得分方块、权重徽章、开关（内部） |

**原则**：
- 用户频繁交互的组件用全圆角（pill），亲和力强
- 容器/卡片用大圆角，柔和但不失结构感
- 内部小组件用小圆角，与容器形成对比

---

## 6. 间距与布局

### 6.1 页面布局

```
┌──────────────────────────────────────────────┐
│                 max-width: 1120px             │
│  ┌──────────────────────────────────────────┐ │
│  │              padding: 0 28px              │ │
│  │  ┌──────────────────────────────────────┐ │ │
│  │  │         card: 480-880px wide          │ │ │
│  │  │         padding: 32px 36px            │ │ │
│  │  │         gap between cards: 36px       │ │ │
│  │  └──────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

### 6.2 间距量表

| Token | 值 | 用途 |
|:---:|:---:|------|
| `xs` | 8px | 紧密元素间距（标签 gap、按钮内 icon gap） |
| `sm` | 12px | 组件内间距（表单项 gap、进度条 gap） |
| `md` | 16px | 标签区域 margin-top |
| `lg` | 20px | 组件间 margin-top |
| `xl` | 24px | 操作按钮区域 margin-top |
| `2xl` | 28px | 按钮与上方内容间距 |
| `3xl` | 32px | 状态变体区块间距 |
| **section gap** | 80px | 页面章节间距 |
| **card padding** | 32px 36px | 卡片内边距 |
| **page padding** | 0 28px | 页面容器左右内边距 |

### 6.3 响应式断点

| 断点 | 行为 |
|:---:|------|
| `> 960px` | 双列网格（`minmax(480px, 1fr)`） |
| `≤ 960px` | 单列布局 |
| `≤ 700px` | 卡片内边距缩减至 22px 18px，全宽 |

---

## 7. 卡片样式

### 7.1 标准卡片

```css
.card {
  background: #FFFFFF;
  border: 3.5px solid #1A1A1A;
  border-radius: 28px;
  padding: 32px 36px;
  box-shadow: 6px 6px 0 rgba(0,0,0,0.09);
}
```

### 7.2 彩色卡片变体

| 类名 | 背景色 | 使用场景 |
|------|--------|----------|
| `.card` (默认) | `#FFFFFF` | 问答页、结果页、历史页、管理页 |
| `.card-cream` | `#FFF7EC` | 首页 |
| `.card-pink` | `#FFEFEC` | 强调型卡片（备选） |
| `.card-yellow` | `#FFF6D5` | 高亮型卡片（备选） |
| `.card-mint` | `#EDF8F0` | 成功/提示型卡片（备选） |

### 7.3 卡片内内容分区

```
┌─────────────────────────────────┐
│  padding: 32px 36px             │
│                                 │
│  [标题区域]                      │
│  [说明文字]                      │
│                                 │
│  [主要内容区域]                   │
│  (表单 / 列表 / 图表)            │
│                                 │
│  ─ ─ 分割线（2px dashed）─ ─ ─  │
│                                 │
│  [操作按钮区域]                   │
│                                 │
└─────────────────────────────────┘
```

---

## 8. 按钮样式

### 8.1 按钮基础样式

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 3.5px solid #1A1A1A;
  border-radius: 9999px;        /* 全圆角 pill */
  font-weight: 700;
  padding: 13px 28px;
  background: #FFFFFF;
  color: #1A1A1A;
  box-shadow: 4px 4px 0 rgba(0,0,0,0.1);
  cursor: pointer;
}

.btn:active {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0 rgba(0,0,0,0.08);
}
```

### 8.2 按钮变体

| 类名 | 底色 | 用途 |
|------|------|------|
| `.btn` (默认) | `#FFFFFF` | 次要操作 |
| `.btn-primary` | `#FFEDB3` (暖黄) | 主要操作：「开始决策」「保存到历史」「保存修改」 |
| `.btn-pink` | `#FFEFEC` (浅粉) | 特殊操作：「查看结果」 |
| `.btn-mint` | `#EDF8F0` (薄荷) | 积极操作（备选） |
| `.btn-ghost` | 透明 + 无边框 + 无阴影 | 弱操作：「返回首页」「查看」「上一题」 |

### 8.3 按钮尺寸

| 类名 | Padding | 字号 | 描边 |
|------|:---:|:---:|:---:|
| `.btn` (标准) | `13px 28px` | `0.92rem` | 3.5px |
| `.btn-sm` | `9px 18px` | `0.82rem` | 2px |
| `.btn-xs` | `5px 12px` | `0.74rem` | 2px |

### 8.4 禁用态

```css
.btn-disabled {
  opacity: 0.35;
  pointer-events: none;
  box-shadow: none;
}
```

### 8.5 按钮对齐

```css
.btn-block {
  width: 100%;   /* 占满父容器宽度 */
}
```

---

## 9. 表单组件

### 9.1 文本输入框

```css
.input {
  width: 100%;
  padding: 15px 20px;
  background: #FFFFFF;
  border: 3.5px solid #1A1A1A;
  border-radius: 9999px;
  color: #1A1A1A;
  font-size: 0.95rem;
  font-weight: 500;
  box-shadow: 3px 3px 0 rgba(0,0,0,0.06);
  outline: none;
}

.input:focus {
  box-shadow: 0 0 0 5px rgba(0,0,0,0.06);
}

.input::placeholder {
  color: #B0B0B0;
}
```

**使用场景**：
- 首页选项输入（全宽，pill 形状）
- 管理页问题输入（小尺寸变体）
- 管理页权重输入（宽度 64px，居中）

### 9.2 密码输入框

与文本输入框相同样式，`type="password"`。常见居中展示。

---

## 10. 标签与徽章

### 10.1 选项标签（Tag）

用于首页展示解析后的选项。

```css
.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: 3.5px solid #1A1A1A;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 700;
  background: #FFFFFF;
  box-shadow: 3px 3px 0 rgba(0,0,0,0.07);
}
```

**颜色变体**：`.tag.yellow` / `.tag.pink` / `.tag.mint` / `.tag.peach`

标签排列使用 flexbox wrap，gap: 10px。

### 10.2 徽章（Badge）

用于展示权重信息。

```css
.badge {
  display: inline-flex;
  padding: 4px 14px;
  border: 2px solid #1A1A1A;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: #FFFFFF;
  box-shadow: 2px 2px 0 rgba(0,0,0,0.06);
}

.badge-accent { background: #FFEDB3; }   /* 权重高亮 */
```

**使用**：问答页题目旁显示 `权重 ×3`

### 10.3 权重徽章（Weight Badge）

管理页表格内显示的权重指示。

```css
.weight-badge {
  width: 38px; height: 30px;
  border: 3.5px solid #1A1A1A;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.8rem;
  box-shadow: 2px 2px 0 rgba(0,0,0,0.08);
}

.weight-1 { background: #FFFFFF; }
.weight-2 { background: #FFF6D5; }
.weight-3 { background: #FFEDB3; }
```

---

## 11. 滑块组件

### 11.1 滑块容器

```css
.slider-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  background: #FFFFFF;
  border: 2px solid #1A1A1A;
  border-radius: 18px;
  box-shadow: 3px 3px 0 rgba(0,0,0,0.05);
}
```

### 11.2 轨道

```css
input[type="range"] {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #E8E5DF;
  border: 1.5px solid rgba(0,0,0,0.2);
}
```

### 11.3 拇指

```css
input[type="range"]::-webkit-slider-thumb {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: #FFFFFF;
  border: 3.5px solid #1A1A1A;
  box-shadow: 3px 3px 0 rgba(0,0,0,0.12);
  cursor: pointer;
}
```

### 11.4 得分显示

```css
.slider-score {
  min-width: 38px; height: 38px;
  border: 3.5px solid #1A1A1A;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.95rem;
  background: #FFFFFF;
  box-shadow: 2px 2px 0 rgba(0,0,0,0.08);
}

.slider-score.high {
  background: #FFEDB3;   /* 高分段（4-5 分）变黄 */
}
```

### 11.5 滑块提示文字

```css
.slider-hint {
  text-align: center;
  font-size: 0.72rem;
  color: #7A7A7A;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  /* 左：1 = 非常不符合   右：5 = 非常符合 */
}
```

---

## 12. 进度条

```css
.progress-track {
  flex: 1;
  height: 10px;
  background: #FFFFFF;
  border: 2px solid #1A1A1A;
  border-radius: 9999px;
  box-shadow: inset 0 2px 0 rgba(0,0,0,0.06);
}

.progress-fill {
  height: 100%;
  background: #FFEDB3;
  border-radius: 9999px;
}
```

**结构**：flex 行布局，左侧轨道 + 右侧文字 `第 2 / 5 题`

---

## 13. 切换开关

```css
.toggle {
  width: 48px; height: 28px;
  border: 3.5px solid #1A1A1A;
  border-radius: 9999px;
  background: #FFFFFF;
  box-shadow: 2px 2px 0 rgba(0,0,0,0.06);
}

.toggle.on { background: #C8ECD4; }

.toggle::after {
  width: 18px; height: 18px;
  border-radius: 50%;
  background: #1A1A1A;
  /* OFF: transform: translateX(0);  ON: translateX(18px); */
}
```

**使用**：管理页问题列表启用/停用列。

---

## 14. 表格样式

### 14.1 管理页表格

```css
.admin-table th {
  padding: 12px 16px;
  font-weight: 700;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #7A7A7A;
  border-bottom: 3.5px solid #1A1A1A;
}

.admin-table td {
  padding: 14px 16px;
  border-bottom: 2px solid #1A1A1A;
  font-weight: 500;
}
```

### 14.2 得分明细表

与管理员表格共用基础样式，但：
- 表头字号 0.74rem，颜色 `--gray-mid`
- 推荐项所在列用 `background: #FFF6D5` 高亮
- 最后一行（总分行）`font-weight: 800`

---

## 15. 弹窗组件

### 15.1 管理员密码弹窗

```css
.modal-box {
  background: #FFFFFF;
  border: 3.5px solid #1A1A1A;
  border-radius: 28px;
  padding: 36px 32px;
  max-width: 380px;
  box-shadow: 6px 6px 0 rgba(0,0,0,0.09);
  text-align: center;
}
```

弹窗内元素垂直居中排列：
1. 🔐 emoji 图标（3rem）
2. 标题 "管理员验证"（H2）
3. 说明文字（gray-mid）
4. 密码输入框（居中，max-width 240px）
5. 取消 + 验证按钮（flex 居中，gap 10px）
6. 底部提示文字（caption 字号）

---

## 16. 柱状图规范

### 16.1 图表配置（Chart.js）

| 属性 | 值 |
|------|-----|
| 类型 | `bar`（垂直柱状图） |
| 默认柱子色 | `#FFF6D5` (yellow-pale) |
| 推荐柱子色 | `#FFEDB3` (yellow-warm) |
| 描边色 | `#1A1A1A` |
| 描边宽度 | `3px` |
| 圆角 | `8px`（`borderSkipped: false` 四角统一） |
| 柱宽比例 | `barPercentage: 0.55, categoryPercentage: 0.7` |

### 16.2 坐标轴

| 属性 | X 轴 | Y 轴 |
|------|------|------|
| 文字色 | `#3A3A3A` | `#7A7A7A` |
| 字号 | `14px bold` | `12px bold` |
| 网格线 | 无 | `rgba(0,0,0,0.05)` |
| 轴线宽 | `2.5px` | `2.5px` |

### 16.3 Tooltip

```css
background: #FFFBF5;
titleColor: #1A1A1A;
bodyColor: #3A3A3A;
borderColor: #1A1A1A;
borderWidth: 3px;
```

### 16.4 动画

```css
animation: { duration: 800, easing: 'easeOutBounce' }
```

---

## 17. 页面布局模板

### 17.1 首页

```
┌──────────────────────────────┐
│          🎯 emoji             │
│     页面标题（H1）             │
│     说明文字（Body/Small）     │
│                              │
│   ┌──────────────────────┐   │
│   │  输入框（pill 全宽）   │   │
│   └──────────────────────┘   │
│                              │
│   [标签] [标签] [标签]        │
│                              │
│   ┌──────────────────────┐   │
│   │    开始决策 → (全宽)   │   │
│   └──────────────────────┘   │
│                              │
│   ─ ─ ─ 分割线 ─ ─ ─        │
│   📋 历史记录    ⚙ 管理      │
└──────────────────────────────┘
```

### 17.2 问答页

```
┌──────────────────────────────┐
│  ████████░░░░  第 2 / 5 题   │  ← 进度条
│                              │
│  [权重 ×3]                   │  ← Badge
│  你对价格敏感吗？             │  ← H1
│  拖动滑块为每个选项打分        │  ← 说明
│                              │
│  ─ ─ ─ 虚线分割 ─ ─ ─       │
│                              │
│  🍲 火锅  ──●────  2分       │  ← 滑块条
│  🥩 烧烤  ───●───  3分       │
│  🍣 日料  ────●──  5分       │
│  🥗 沙拉  ────●──  5分       │
│                              │
│  ← 上一题        下一题 →    │
└──────────────────────────────┘
```

### 17.3 结果页

```
┌──────────────────────────────┐
│                              │
│           🏆                  │
│        🥗 沙拉               │  ← H0（黄底 pill）
│     加权总分 · 22 分          │
│                              │
│  ┌──────────────────────────┐│
│  │ 📝 推荐理由              ││
│  │ ...沙拉综合得分最高...    ││  ← 白底描边 reason-box
│  └──────────────────────────┘│
│                              │
│  ┌──────────────────────────┐│
│  │     ██                    ││
│  │   █ ██ █                  ││  ← 柱状图（白底描边）
│  │   █ ██ █ █               ││
│  └──────────────────────────┘│
│                              │
│  ▼ 点击展开得分明细           │  ← details/summary
│                              │
│    🔄 重新开始   💾 保存到历史 │
└──────────────────────────────┘
```

### 17.4 历史页

```
┌──────────────────────────────┐
│  📋 历史决策                  │
│  最近做出的选择…              │
│                              │
│  ┌──────────────────────────┐│
│  │ 2026-06-10 14:32         ││
│  │ 火锅、烧烤、日料、沙拉    ││  ← 列表项 (白底描边)
│  │              🏆 沙拉 →  ││
│  └──────────────────────────┘│
│  ┌──────────────────────────┐│
│  │ ...更多记录...           ││
│  └──────────────────────────┘│
│                              │
│  [📥 JSON] [📥 CSV]   🗑 清空│
└──────────────────────────────┘
```

### 17.5 管理页

```
┌──────────────────────────────┐
│  ⚙ 问题库管理                │
│                              │
│  ┌────┬──────────┬────┬──┬──┐│
│  │ #  │ 问题文本  │权重│用│操││  ← 表格 (粗黑描边)
│  ├────┼──────────┼────┼──┼──┤│
│  │ 1  │ 价格…    │ ×3 │✓│..││
│  │ 2  │ 口味…    │ ×2 │✓│..││
│  └────┴──────────┴────┴──┴──┘│
│                              │
│  ┌ - - 添加新问题 - - ┐       │  ← 虚线区域
│  │ [输入框] [权重] [+添加] │   │
│  └──────────────────────┘    │
│                              │
│  ← 返回首页       💾 保存修改 │
└──────────────────────────────┘
```

---

## 18. CSS 变量速查表

开发时直接引用以下 CSS 变量，确保全局一致：

```css
:root {
  /* === 背景色 === */
  --cream:        #FFFBF5;
  --cream-deep:   #FFF7EC;
  --yellow-pale:  #FFF6D5;
  --yellow-warm:  #FFEDB3;
  --pink-pale:    #FFEFEC;
  --pink-warm:    #FFE0DA;
  --mint-pale:    #EDF8F0;
  --mint-warm:    #C8ECD4;
  --lavender:     #F3EEFB;
  --peach:        #FFECD6;

  /* === 文字色 === */
  --black:        #1A1A1A;
  --black-soft:   #3A3A3A;
  --gray-mid:     #7A7A7A;
  --gray-light:   #B0B0B0;

  /* === 描边 === */
  --stroke:       3.5px solid #1A1A1A;
  --stroke-thin:  2px solid #1A1A1A;

  /* === 圆角 === */
  --radius-sm:    12px;
  --radius:       18px;
  --radius-lg:    22px;
  --radius-xl:    28px;
  --radius-full:  9999px;

  /* === 阴影 === */
  --shadow-doodle: 5px 5px 0 rgba(0,0,0,0.1);
  --shadow-card:   6px 6px 0 rgba(0,0,0,0.09);

  /* === 字体 === */
  --font-heading: 'DM Sans', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  --font-body:    'DM Sans', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
}
```

---

> **维护说明**：本规范随 Demo 更新同步修订。所有组件样式以 [demo.html](demo.html) 为最终参考实现。