# 使用本地或离线的基础镜像
FROM nginx:latest

# 设置工作目录
WORKDIR /usr/share/nginx/html

# 复制项目文件到Nginx的默认静态文件目录
COPY index.html .
COPY script.js .
COPY style.css .
COPY flux-20miao-2.json .

# 如果有其他静态资源，也一并复制
# COPY images/ ./images/

# 使用自定义Nginx配置（可选）
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露80端口
EXPOSE 80

# 使用Nginx的默认启动命令
CMD ["nginx", "-g", "daemon off;"]
