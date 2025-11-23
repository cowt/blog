# Markdown 功能测试文档

本文档用于测试所有新增的 Markdown 功能。

## 1. 折叠列表（Collapsible Details）

<details>
<summary>点击展开查看详细内容</summary>

这是折叠列表的内容。你可以在这里放置任何 Markdown 内容：

- 列表项 1
- 列表项 2
- 列表项 3

还可以包含代码：

```javascript
console.log("Hello from collapsible section!");
```

</details>

<details>
<summary>另一个折叠示例</summary>

支持嵌套的内容，包括：

1. 有序列表
2. **粗体文本**
3. _斜体文本_

</details>

## 2. 任务列表（Task Lists）

- [x] 已完成的任务
- [x] 另一个已完成的任务
- [ ] 待完成的任务
- [ ] 另一个待完成的任务
  - [x] 子任务 1
  - [ ] 子任务 2

## 3. 删除线（Strikethrough）

这是 ~~被删除的文本~~，这是正常文本。

价格：~~¥199~~ 现价：¥99

## 4. 高亮文本（Highlight）

使用 HTML 标签实现高亮：这是 <mark>重要的高亮内容</mark>。

## 5. 上标和下标（Superscript & Subscript）

数学公式：E = mc^2^

化学公式：H~2~O

温度：25°C

## 6. 表情符号（Emoji）

支持 emoji 短代码：

- :smile: 笑脸
- :heart: 爱心
- :rocket: 火箭
- :tada: 庆祝
- :thumbsup: 点赞
- :fire: 火焰

也支持直接输入 emoji：😀 🎉 🚀 ❤️ 👍

## 7. 定义列表（Definition Lists）

<dl>
<dt>Markdown</dt>
<dd>一种轻量级标记语言，使用纯文本格式编写文档。</dd>

<dt>React</dt>
<dd>用于构建用户界面的 JavaScript 库。</dd>

<dt>Next.js</dt>
<dd>基于 React 的全栈 Web 应用框架。</dd>
</dl>

## 8. 组合示例

<details>
<summary>📋 项目任务清单</summary>

### 开发任务

- [x] 设计数据库结构
- [x] 实现用户认证
- [ ] 开发 API 接口
- [ ] 编写单元测试

### 重要提示

<mark>截止日期：2025-12-31</mark>

~~原计划：2025-11-30~~

</details>

## 9. 现有功能测试

### 代码块

```python
def hello_world():
    print("Hello, World! 🌍")
    return True
```

### 表格

| 功能     | 状态    | 优先级 |
| -------- | ------- | ------ |
| 折叠列表 | ✅ 完成 | 高     |
| 任务列表 | ✅ 完成 | 高     |
| 表情符号 | ✅ 完成 | 中     |

### 引用块

> 这是一个引用块。
>
> 可以包含多行内容。

### 数学公式

行内公式：$E = mc^2$

块级公式：

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

## 总结

所有新增的 Markdown 功能都已实现：

1. ✅ 折叠列表
2. ✅ 任务列表
3. ✅ 删除线
4. ✅ 高亮文本
5. ✅ 上标/下标
6. ✅ 表情符号
7. ✅ 定义列表

🎉 测试完成！
