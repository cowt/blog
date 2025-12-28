# 文本格式化规则 (Text Formatting Rules)

基于日本博客内容分析和当前编辑器实现的统一文本格式化规范。

## 字体大小 (Font Sizes)

### 标题层级 (Heading Hierarchy)
```css
h1: 3xl/4xl (48px/56px)  - 主标题，用于文章标题
h2: 2xl/3xl (32px/48px)  - 主要章节标题  
h3: xl/2xl (24px/32px)   - 子章节标题，带左边框强调
h4: lg/xl (20px/24px)    - 小节标题
h5: base/lg (16px/20px)  - 子小节标题
h6: sm (14px)            - 最小标题，大写字母间距
```

### 正文字体 (Body Text)
```css
正文段落: base (16px)     - 标准正文大小
小字注释: sm (14px)       - 用于说明文字、图片说明
行内代码: sm (14px)       - 等宽字体
```

### 特殊元素 (Special Elements)
```css
引用块: base (16px)       - 与正文相同
列表项: base (16px)       - 与正文相同
表格内容: sm (14px)       - 紧凑显示
脚注: sm (14px)          - 页面底部脚注
```

## 行高设置 (Line Heights)

### 标题行高 (Heading Line Heights)
```css
h1: 1.2 (紧凑，突出标题)
h2: 1.25 (稍微紧凑)
h3: 1.3 (平衡可读性)
h4-h6: 1.4 (标准行高)
```

### 正文行高 (Body Line Heights)
```css
段落文本: 1.8 (relaxed) - 提高可读性
列表项: 1.7 - 稍微紧凑但保持可读性
引用块: 1.6 - 适中的行高
表格内容: 1.5 - 紧凑显示
代码块: 1.6 (relaxed) - 代码可读性
```

## 段落间距 (Paragraph Spacing)

### 垂直间距规则 (Vertical Spacing Rules)
```css
/* 标题间距 */
h1: mt-12 mb-6 (48px上 24px下)
h2: mt-10 mb-5 (40px上 20px下)  
h3: mt-8 mb-4 (32px上 16px下)
h4: mt-6 mb-3 (24px上 12px下)
h5: mt-5 mb-2 (20px上 8px下)
h6: mt-4 mb-2 (16px上 8px下)

/* 正文元素间距 */
段落 (p): mb-5 (20px下间距)
列表 (ul/ol): mb-4 (16px下间距)
列表项 (li): mb-2 (8px下间距)
引用块 (blockquote): my-5 (20px上下间距)
代码块 (pre): my-5 (20px上下间距)
分割线 (hr): my-8 (32px上下间距)
```

### 嵌套元素间距 (Nested Element Spacing)
```css
/* 嵌套列表 */
嵌套列表: mt-2 mb-0 (8px上间距，无下间距)

/* 引用块内部 */
引用块内段落: m-0 (无间距)

/* 详情折叠面板 */
details: my-4 (16px上下间距)
details内容: px-4 pt-3 pb-3 (内边距)

/* 任务列表 */
任务列表: my-4 (16px上下间距)
任务项: mb-2 (8px下间距)
```

## 文本与图片间距 (Text-Image Spacing)

### 图片边距规则 (Image Margin Rules)
```css
/* 独立图片 */
图片块: my-6 (24px上下间距)
图片边框: border border-border (细边框)
图片圆角: rounded-lg (8px圆角)
图片居中: mx-auto (水平居中)

/* 图片与文本关系 */
图片前文本: mb-5 (段落正常下间距)
图片后文本: mt-6 (图片下方额外间距)

/* 图片说明文字 */
图片说明: text-sm text-muted-foreground mt-2 mb-4
```

### 特殊图片布局 (Special Image Layouts)
```css
/* 行内图片 */
行内图片: mx-0.5 (左右2px间距)
行内图片垂直对齐: align-middle

/* 图片组合 */
多图片容器: space-y-4 (16px垂直间距)
图片网格: gap-4 (16px网格间距)
```

## 特殊元素间距 (Special Element Spacing)

### 表格间距 (Table Spacing)
```css
表格容器: my-6 (24px上下间距)
表格单元格: px-6 py-4 (24px水平，16px垂直内边距)
表格标题: px-6 py-4 font-medium (加粗标题)
```

### 代码块间距 (Code Block Spacing)
```css
代码块: my-5 p-4 (20px上下间距，16px内边距)
行内代码: px-1.5 py-0.5 mx-0.5 (内边距和左右间距)
```

### 数学公式间距 (Math Formula Spacing)
```css
行内公式: mx-0.5 (左右2px间距)
块级公式: my-6 py-4 px-2 (24px上下间距，16px上下内边距)
```

### 脚注间距 (Footnote Spacing)
```css
脚注区域: mt-12 pt-6 (48px上间距，24px上内边距)
脚注列表: space-y-2 (8px垂直间距)
脚注项: pl-2 (8px左内边距)
```

## 响应式调整 (Responsive Adjustments)

### 移动端优化 (Mobile Optimization)
```css
/* 小屏幕字体调整 */
@media (max-width: 768px) {
  h1: text-3xl (移动端较小)
  h2: text-2xl 
  h3: text-xl
  
  /* 间距压缩 */
  段落间距: mb-4 (16px)
  标题上间距: 减少20%
  图片间距: my-4 (16px)
}
```

### 大屏幕优化 (Large Screen Optimization)
```css
@media (min-width: 1024px) {
  /* 更大的标题 */
  h1: text-4xl md:text-5xl
  h2: text-3xl md:text-4xl
  
  /* 更宽松的间距 */
  最大宽度: max-w-4xl
  容器内边距: px-8 (32px)
}
```

## 主题变体 (Theme Variants)

### 默认主题 (Default Theme)
- 强调色: #42b983 (绿色)
- h3标题带左边框强调
- 适中的间距和字体大小

### 极简主题 (Minimal Theme)  
- 强调色: 前景色
- 去除装饰性边框
- 更紧凑的间距

### 杂志主题 (Magazine Theme)
- 强调色: #e63946 (红色)
- 衬线字体正文
- 首字母放大效果
- 更大的标题字体

### Notion主题 (Notion Theme)
- 强调色: #2383e2 (蓝色)
- 更紧凑的标题间距
- 简化的引用块样式

## 实现建议 (Implementation Guidelines)

### CSS变量使用 (CSS Variables)
```css
:root {
  --content-spacing-xs: 0.5rem;  /* 8px */
  --content-spacing-sm: 0.75rem; /* 12px */
  --content-spacing-md: 1rem;    /* 16px */
  --content-spacing-lg: 1.5rem;  /* 24px */
  --content-spacing-xl: 2rem;    /* 32px */
  --content-spacing-2xl: 3rem;   /* 48px */
}
```

### 编辑器一致性 (Editor Consistency)
- 编辑器样式与展示样式保持一致
- 使用相同的CSS类和间距规则
- 确保所见即所得的编辑体验

### 可访问性考虑 (Accessibility)
- 最小行高不低于1.5
- 足够的颜色对比度
- 合理的字体大小（最小14px）
- 清晰的标题层级结构