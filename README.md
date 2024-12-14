# Flux Image Generator Web App

基于 Web 的 AI 图像生成应用，提供直观的用户界面和强大的图像生成功能。通过简单的操作即可创建独特的 AI 生成图片。

## 功能特点

- 🎨 AI 驱动的图像生成
- 💫 实时预览和编辑功能
- 📱 响应式设计，支持移动端
- 🔄 动态工作流管理
- 💾 图片保存和导出功能

## 快速开始

### 本地开发
1. 克隆仓库

```bash
git clone https://github.com/your-username/flux-image-generator.git
cd flux-image-generator
```

2. 直接用浏览器打开 `index.html` 即可开始使用

### Docker 部署

1. 构建 Docker 镜像

```bash
docker build -t flux-image-generator .
```

2. 使用 Docker Compose 运行
```bash
docker-compose up -d
```
另外，本项目已打包好镜像，可以直接pull使用

3. 访问应用
浏览器打开 `http://localhost:8080`

## 项目结构

```
project/
├── index.html          # 主页面
├── css/               # 样式文件
│   └── style.css
├── js/                # JavaScript 文件
│   └── script.js
├── images/           # 静态资源
├── Dockerfile        # Docker 配置
├── docker-compose.yml
└── nginx.conf        # Nginx 配置
```
### 下载压缩包
windows用户可下载release中的flux-image-generator.zip，解压后直接运行flux-image-generator.exe，配置运行confyui的服务器地址即可开始使用

## 技术栈

- HTML5
- JavaScript
- Nginx
- Docker

## 配置说明

### 基础配置
1. 修改 `script.js` 中的服务器 URL：
```javascript
const SERVER_URL = 'your-server-url';
```

2. 调整 `nginx.conf` 进行服务器配置：
```nginx
server {
    listen 80;
    server_name localhost;
    # 其他配置...
}
```

## 使用指南

1. 打开应用后，在主界面选择想要生成的图片类型
2. 输入描述文本或调整参数
3. 点击生成按钮，等待 AI 生成图片
4. 可以下载或分享生成的图片

## 注意事项

- 需要预先配置后端 AI 服务
- 确保网络连接正常
- 建议使用现代浏览器访问（Chrome、Firefox、Safari 等）
- 首次使用 Docker 部署时，镜像下载可能需要一些时间

## 常见问题

1. **图片生成失败**
   - 检查网络连接
   - 确认后端服务是否正常运行
   - 查看浏览器控制台错误信息

2. **Docker 部署问题**
   - 确保 Docker 和 Docker Compose 已正确安装
   - 检查端口 8080 是否被占用
   - 查看 Docker 日志排查问题

## 贡献指南

欢迎提交 Pull Request 或提出 Issue。在提交代码前，请确保：

1. 代码符合项目规范
2. 添加必要的注释和文档
3. 测试通过

## 许可证

本项目采用 MIT 许可证，详见 [LICENSE](LICENSE) 文件。

## 联系方式

- 项目维护者：[andy-brain]
- 邮箱：[beyonds99@outlook.com]
- 项目仓库：[https://github.com/andy-brain/flux-image-generator]

