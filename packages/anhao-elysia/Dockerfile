# 使用 Bun 基础镜像
FROM oven/bun:slim AS base

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 文件到容器
COPY package.json ./

# 安装依赖
RUN bun install

# 复制项目文件到容器
COPY . .

# 暴露端口 3000
EXPOSE 3000/tcp

# 以 bun 用户运行应用
USER bun

# 设置启动命令
ENTRYPOINT ["bun", "run", "start"]
