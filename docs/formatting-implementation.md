# 格式化规则实现指南 (Formatting Implementation Guide)

基于日本博客内容分析的实际应用指南，用于优化当前编辑器的文本格式化。

## 当前问题分析 (Current Issues Analysis)

### 从日本博客内容观察到的问题
1. **标题层级不够清晰** - 需要更明显的视觉层级
2. **段落间距不够统一** - 不同元素间距不一致  
3. **图片与文本间距过紧** - 影响阅读体验
4. **列表项间距过密** - 降低可读性
5. **代码块与正文区分不够明显** - 需要更好的视觉分离

## 具体优化建议 (Specific Optimization Recommendations)

### 1. 标题间距优化

**当前问题**: 标题与内容间距不够明显
**解决方案**: 增加标题上下间距，建立清晰层级

```css
/* 优化前 */
.content-body h1 { @apply text-3xl font-bold mt-8 mb-4; }
.content-body h2 { @apply text-2xl font-bold mt-6 mb-3; }

/* 优化后 */
.content-body h1 { 
  @apply text-3xl md:text-4xl font-bold mt-12 mb-6 tracking-tight;
  line-height: 1.2;
}
.content-body h2 { 
  @apply text-2xl md:text-3xl font-bold mt-10 mb-5 tracking-tight;
  line-height: 1.25;
}
.content-body h3 { 
  @apply text-xl md:text-2xl font-semibold mt-8 mb-4 pl-3 border-l-4;
  border-color: var(--content-primary);
  line-height: 1.3;
}
```

### 2. 段落间距统一化

**当前问题**: 段落间距不够宽松，影响阅读体验
**解决方案**: 统一段落间距，提高可读性

```css
/* 优化段落间距 */
.content-body p {
  @apply mb-5; /* 从 mb-4 增加到 mb-5 (20px) */
  letter-spacing: 0.01em; /* 增加字母间距 */
}

/* 优化列表间距 */
.content-body li {
  @apply mb-2 pl-1; /* 增加下间距和左内边距 */
  line-height: 1.7; /* 从 1.6 增加到 1.7 */
}

/* 优化引用块间距 */
.content-body blockquote {
  @apply my-5 pl-4 py-3 rounded-r-lg border-l-4 not-italic;
  background-color: var(--content-quote-bg);
  border-color: var(--content-primary);
}
```

### 3. 图片间距优化

**当前问题**: 图片与文本间距过紧
**解决方案**: 增加图片上下间距，添加视觉呼吸空间

```css
/* 优化图片间距 */
.content-body img {
  @apply block mx-auto rounded-lg my-6 max-w-full h-auto border border-border;
  /* 从 my-4 增加到 my-6 (24px) */
}

/* 添加图片说明样式 */
.content-body .image-caption {
  @apply text-sm text-muted-foreground text-center mt-2 mb-4 italic;
}
```

### 4. 代码块视觉分离

**当前问题**: 代码块与正文区分不够明显
**解决方案**: 增强代码块的视觉效果

```css
/* 优化行内代码 */
.content-body code:not(pre code) {
  @apply px-1.5 py-0.5 mx-0.5 rounded text-sm font-mono;
  color: #c7254e;
  background-color: #f9f2f4;
  word-break: break-word;
  border: 1px solid rgba(199, 37, 78, 0.1); /* 添加细边框 */
}

/* 优化代码块 */
.content-body pre {
  @apply relative rounded-lg overflow-auto my-6 p-4 border bg-transparent;
  /* 从 my-5 增加到 my-6，增加视觉分离 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 添加阴影 */
}
```

### 5. 表格可读性提升

**当前问题**: 表格内容过于紧凑
**解决方案**: 增加单元格内边距，改善表格布局

```css
/* 优化表格间距 */
.content-body th,
.content-body td {
  @apply px-6 py-4 text-left align-middle; /* 增加内边距 */
  border: 1px solid hsl(var(--border) / 0.5);
  min-width: 100px; /* 增加最小宽度 */
}

/* 优化表格容器 */
.content-body .table-wrapper {
  @apply overflow-x-auto my-6 rounded-lg border; /* 添加圆角和边框 */
}
```

## 响应式优化 (Responsive Optimization)

### 移动端适配

```css
/* 移动端字体和间距调整 */
@media (max-width: 768px) {
  .content-body h1 {
    @apply text-2xl mt-8 mb-4; /* 减小移动端标题 */
  }
  
  .content-body h2 {
    @apply text-xl mt-6 mb-3;
  }
  
  .content-body p {
    @apply mb-4; /* 移动端减少段落间距 */
  }
  
  .content-body img {
    @apply my-4; /* 移动端减少图片间距 */
  }
  
  /* 移动端表格优化 */
  .content-body th,
  .content-body td {
    @apply px-3 py-2 text-sm; /* 减少移动端表格内边距 */
  }
}
```

## 主题定制 (Theme Customization)

### 日式简约主题

```css
/* 日式简约主题 - 基于观察到的日本博客风格 */
.content-theme-japanese {
  --content-primary: #2563eb; /* 蓝色强调 */
  --content-quote-bg: hsl(var(--muted) / 0.2);
  
  /* 更大的行高，提高可读性 */
  line-height: 1.8;
}

.content-theme-japanese h1 {
  @apply text-center pb-4 mb-8 border-b border-border;
  /* 标题居中，添加下边框 */
}

.content-theme-japanese h2 {
  @apply mt-12 mb-6; /* 增加章节间距 */
}

.content-theme-japanese p {
  @apply mb-6; /* 更大的段落间距 */
  text-indent: 1em; /* 段落首行缩进 */
}

/* 日式引用样式 */
.content-theme-japanese blockquote {
  @apply border-l-0 border-t-2 border-b-2 py-4 px-6 text-center italic;
  border-color: var(--content-primary);
}
```

## 编辑器集成 (Editor Integration)

### Tiptap编辑器样式同步

```typescript
// 在 tiptap-editor.tsx 中应用新的样式类
export function TiptapEditor({ content, onChange, onImageUpload }: TiptapEditorProps) {
  const editor = useEditor({
    // ... 其他配置
    editorProps: {
      attributes: {
        class: `${getEditorClassName(defaultContentConfig)} px-4 py-4 min-h-[600px]`,
        // 增加最小高度，提供更好的编辑体验
      },
    },
    // ...
  })
  
  // ...
}
```

### 内容样式配置更新

```typescript
// 在 lib/content-styles.ts 中添加新的配置选项
export interface ContentStyleConfig {
  theme: ContentTheme
  fontSize?: "sm" | "base" | "lg"
  lineHeight?: "normal" | "relaxed" | "loose"
  spacing?: "compact" | "normal" | "loose" // 新增间距选项
}

export const japaneseContentConfig: ContentStyleConfig = {
  theme: "japanese",
  fontSize: "base",
  lineHeight: "loose", // 1.8行高
  spacing: "loose", // 更大的间距
}
```

## 实施步骤 (Implementation Steps)

### 第一阶段：基础间距优化
1. 更新 `styles/content.css` 中的标题间距
2. 调整段落和列表项间距
3. 优化图片上下间距

### 第二阶段：视觉增强
1. 改善代码块样式
2. 优化表格布局
3. 增强引用块视觉效果

### 第三阶段：响应式完善
1. 添加移动端适配
2. 优化大屏幕显示
3. 测试各种设备兼容性

### 第四阶段：主题扩展
1. 实现日式简约主题
2. 添加主题切换功能
3. 用户自定义选项

## 测试建议 (Testing Recommendations)

### 内容测试用例
1. **长文章测试** - 包含多级标题、段落、图片的长文章
2. **混合内容测试** - 代码块、表格、列表、引用的组合
3. **移动端测试** - 各种屏幕尺寸的显示效果
4. **主题切换测试** - 不同主题下的一致性

### 可读性验证
1. **行高测试** - 确保文本行高适合阅读
2. **间距测试** - 验证元素间距的视觉平衡
3. **对比度测试** - 确保文字和背景对比度足够
4. **字体大小测试** - 验证各级标题的层级清晰度