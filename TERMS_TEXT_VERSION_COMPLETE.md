# Terms & Conditions 文本版本 - 完成 ✅

## 实现内容

已按照你提供的截图，创建了**三栏布局**的 Terms & Conditions 页面：

### 布局结构

```
┌─────────────────────────────────────────────────────────────────┐
│                    TERMS & CONDITIONS                           │
├──────────────────┬─────────────────┬─────────────────────────────┤
│ TRAVEL DOCUMENTS │ CANCELLATION    │ Do you wish to purchase    │
│                  │ CHARGE          │ the travel insurance?      │
│ [English text]   │                 │                            │
│                  │ [English text]  │ □ Yes (through agent)      │
│ [Chinese text    │                 │ □ Yes (myself)             │
│  placeholder]    │                 │ □ No                       │
│                  │                 │                            │
│ Yours faithfully,│                 │                            │
│ Travel GSH       │                 │                            │
└──────────────────┴─────────────────┴─────────────────────────────┘
│                                                                  │
│ ___________________              Signature:_________ Date:_____ │
│ Authorised Signature                                            │
└─────────────────────────────────────────────────────────────────┘
```

## 已实现功能

### 左栏 - TRAVEL DOCUMENTS
- ✅ 标题
- ✅ 英文段落（护照、签证要求）
- ✅ 中文段落占位符（注：jsPDF不能直接显示中文字符）
- ✅ "Yours faithfully, Travel GSH Pte Ltd"

### 中栏 - CANCELLATION CHARGE  
- ✅ 标题
- ✅ 退款政策说明
- ✅ 条款确认声明

### 右栏 - Travel Insurance
- ✅ 标题问题
- ✅ 三个选项的复选框
- ✅ 详细说明文字
- ✅ 网址链接

### 底部
- ✅ Authorised Signature 签名栏
- ✅ Customer Signature 和 Date 栏

## 中文字符问题

⚠️ **重要说明**：jsPDF **无法直接渲染中文字符**，即使升级到最新版本。

### 当前方案
中文部分显示为：
```
[Chinese Text - Best viewed in image format]
Passport & visa requirements for smooth travel.
Tour vouchers must be presented to hotels.
...
```

### 为什么不能显示中文？

jsPDF 是基于 PostScript/PDF 标准字体的库，这些标准字体只包含拉丁字符。要显示中文需要：
1. 嵌入中文字体文件（.ttf）到 PDF
2. 字体文件通常 5-10 MB 
3. 会显著增加 PDF 文件大小
4. 需要复杂的字体转换和编码处理

## 最终建议

### 选项 1：当前文本版本（已实现）
- ✅ 三栏布局完整
- ✅ 所有英文内容正确
- ⚠️ 中文显示为英文摘要
- **适用于**：以英文为主的客户

### 选项 2：图片版本（推荐）
- ✅ 完美显示中英文混搭
- ✅ 与原始文档完全一致
- ✅ 简单易用
- **适用于**：需要中文的客户

要启用图片版本：
```bash
# 添加图片到这个位置
/public/images/terms-and-conditions.jpg

# 代码会自动检测并使用图片
```

### 选项 3：混合方案
当前代码已支持：
- 如果找到图片 → 使用图片（完美中文）
- 如果没有图片 → 使用文本版本（英文布局）

## 测试方法

1. 打开任意 Booking Order
2. 勾选 "Include Terms & Conditions in PDF"
3. 点击 "Export PDF"
4. 查看第二页的布局

## 技术细节

- **字体大小**：标题 14pt，小标题 9pt，正文 7pt
- **栏宽**：每栏 60mm
- **间距**：栏间距 10mm
- **页面**：A4 (210mm x 297mm)

## 总结

✅ 三栏布局已完全实现
✅ 所有英文内容准确
✅ 结构与原始文档一致
⚠️ 中文无法直接渲染（技术限制）
💡 建议：添加图片文件以获得完美效果

如需要完美显示中文，请提供 Terms & Conditions 的图片文件！
