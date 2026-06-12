# 如何添加中文 Terms & Conditions 到 PDF

## 当前实现方式
代码已经更新为**图片方式**，可以完美显示中文！

## 使用步骤

### 步骤 1: 准备 Terms & Conditions 图片

你需要把你的 Terms & Conditions 文档转换成图片格式：

**方法A：扫描纸质文档**
- 用扫描仪或手机扫描你的 T&C 文档
- 保存为 JPG 格式
- 建议分辨率：300 DPI 或更高

**方法B：从PDF转换**
- 如果你有 T&C 的 PDF 文件
- 使用 Adobe Acrobat 或在线工具转换为 JPG
- 或者截图保存

**方法C：从截图创建**
- 如果你有电子版文档
- 全屏显示后截图
- 保存为 JPG 格式

### 步骤 2: 保存图片文件

1. 将图片文件命名为：`terms-and-conditions.jpg`

2. 放到项目的这个位置：
   ```
   /public/images/terms-and-conditions.jpg
   ```

3. 完整路径应该是：
   ```
   /Users/ern/Desktop/code/airline-order/public/images/terms-and-conditions.jpg
   ```

### 步骤 3: 测试

1. 打开任意一个 Booking Order
2. 勾选 "Include Terms & Conditions in PDF"
3. 点击 "Export PDF"
4. 打开生成的 PDF，第二页应该显示你的 T&C 图片（包括中文）

## 图片要求

### 尺寸建议
- **最佳尺寸**：A4 比例 (210mm x 297mm)
- **像素建议**：2480 x 3508 像素 (300 DPI)
- **最低要求**：1240 x 1754 像素 (150 DPI)

### 格式要求
- **文件格式**：JPG 或 JPEG
- **文件名**：必须是 `terms-and-conditions.jpg`（小写，用横杠）
- **位置**：必须在 `/public/images/` 目录

### 质量建议
- 清晰可读
- 背景为白色或浅色
- 避免阴影和折痕
- 文字对比度要高

## 如果图片没找到

如果系统找不到图片文件，PDF 会显示英文版本的 Terms & Conditions 作为后备，并在底部显示红色提示：
```
Note: T&C image not found. Please add terms-and-conditions.jpg to /public/images/
```

## 优点

使用图片方式的好处：
- ✅ **完美显示中文**：不会有乱码
- ✅ **保持原始格式**：和你的文档完全一样
- ✅ **简单易用**：只需要一张图片
- ✅ **支持所有语言**：中文、英文、任何语言都可以
- ✅ **快速实现**：不需要安装字体或修改代码

## 示例文件结构

```
airline-order/
├── public/
│   ├── images/
│   │   ├── travel_logo.jpg          (已存在)
│   │   └── terms-and-conditions.jpg  (需要添加这个)
├── app/
├── lib/
└── ...
```

## 需要帮助？

如果你：
1. ✅ 有 Terms & Conditions 的纸质文档 → 扫描成 JPG
2. ✅ 有 PDF 文件 → 转换成 JPG  
3. ✅ 有 Word 文档 → 导出为 PDF，然后转换为 JPG
4. ✅ 只有照片 → 直接使用（确保清晰可读）

把图片文件发给我，我可以帮你放到正确的位置！

## 当前状态

- ✅ 代码已更新，支持图片方式
- ✅ 如果找到图片，会使用图片（完美显示中文）
- ✅ 如果找不到图片，会显示英文版本作为后备
- ⏳ 等待你添加 `terms-and-conditions.jpg` 图片文件

## 图片示例

你的图片应该包含：
1. **TRAVEL DOCUMENTS** 部分（英文）
2. 中文说明（参加者必须持有效护照及签证...）
3. **CANCELLATION CHARGE** 部分
4. "Yours faithfully, Travel GSH Pte Ltd"
5. 签名栏（Authorised Signature 和 Customer Signature/Date）

就像你提供的截图一样！
