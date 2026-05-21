# TodoList 全栈项目

Vue 3 + Express + MySQL，支持 Docker 生产部署与 GitHub Actions CI/CD。

## 项目结构

```
todolist/
├── client/          # Vue 3 前端
├── server/          # Express API
├── deploy/          # Docker Compose、Nginx、init.sql
└── .github/workflows/deploy.yml
```

## 前置要求

- Node.js 18+
- Docker Desktop（本地 MySQL / 生产一键部署）

## 一、本地开发

### 1. 环境变量

```bash
# 项目根目录
copy .env.example .env

# 后端（本地 dev 读取 server/.env）
copy server\.env.example server\.env
```

编辑 `.env` 与 `server/.env`，保证数据库账号一致（与 `deploy/docker-compose.dev.yml` 默认值对应即可）。

### 2. 启动 MySQL（Docker）

在项目根目录执行：

```bash
docker compose -f deploy/docker-compose.dev.yml --env-file .env up -d
```

等待 MySQL 健康检查通过（约 10–30 秒）。首次启动会执行 `deploy/init.sql` 建表并插入示例数据。

### 3. 启动后端

```bash
cd server
npm install
npm run dev
```

API 地址：`http://localhost:3000`  
健康检查：`http://localhost:3000/api/health`

### 4. 启动前端

新开终端：

```bash
cd client
npm install
npm run dev
```

浏览器打开：`http://localhost:5173`

### 常见问题：页面显示「API 不可用」/ 503 / 500

**原因**：Express 已启动，但连不上 MySQL。

按顺序检查：

1. **是否已创建 `server/.env`**（可从 `server/.env.example` 复制，密码需与 `.env` 里 `MYSQL_PASSWORD` 一致）
2. **MySQL 是否在运行**（项目根目录）：
   ```bash
   npm run db:up
   docker ps
   ```
   若提示找不到 `docker` 命令，请先安装并启动 [Docker Desktop](https://www.docker.com/products/docker-desktop/)，安装后重启终端。
3. **重启后端**：修改 `.env` 后需停止 `npm run dev` 再重新启动
4. 浏览器访问 http://localhost:3000/api/health ，应返回 `"database":"connected"`

**使用 phpstudy / 小皮面板 MySQL（无 Docker）**：

1. 在小皮面板启动 MySQL
2. 复制 `server/.env.phpstudy.example` 为 `server/.env`，按面板里的 root 密码修改
3. 导入数据库（PowerShell，密码按实际修改）：
   ```powershell
   Get-Content deploy\init.sql -Raw | & "你的mysql路径\mysql.exe" -u root -p你的密码
   ```
4. 重启后端 `npm run dev`

### 5. 本地验收

- [ ] 页面显示「API 正常」
- [ ] 能看到示例待办
- [ ] 可新增、勾选完成、编辑标题、删除
- [ ] 刷新页面后数据仍在

---

## 二、生产部署（阿里云 VPS）

以下步骤由你在服务器上操作；遇到问题把命令输出贴给我即可。

### 阶段 A：准备环境（一次性）

1. **安全组**：放行 22、80（HTTPS 再加 443）
2. SSH 登录后安装 Docker：

```bash
sudo apt update
sudo apt install -y git docker.io docker-compose-plugin
sudo usermod -aG docker $USER
# 退出 SSH 重新登录，使 docker 组生效
```

3. 创建目录并上传代码：

```bash
sudo mkdir -p /var/www/todolist
sudo chown $USER:$USER /var/www/todolist
cd /var/www/todolist
git clone <你的仓库地址> .
```

（若暂未建仓库，可用 `scp` / SFTP 上传整个项目文件夹。）

### 阶段 B：首次上线

1. 在 VPS 项目根目录创建 `.env`（**务必修改密码**）：

```bash
cp .env.example .env
nano .env
```

2. 构建前端静态资源：

```bash
cd client
npm ci
npm run build
cd ..
```

3. 启动全部服务：

```bash
docker compose -f deploy/docker-compose.yml --env-file .env up -d --build
```

4. 验证：

- 浏览器访问 `http://<公网IP>`
- 访问 `http://<公网IP>/api/health` 应返回 `{"status":"ok","database":"connected"}`

常用排查：

```bash
docker compose -f deploy/docker-compose.yml ps
docker compose -f deploy/docker-compose.yml logs api
docker compose -f deploy/docker-compose.yml logs mysql
```

### 阶段 C：域名与 HTTPS（可选）

1. 域名 A 记录指向 VPS IP  
2. 修改 `deploy/nginx/default.conf` 中 `server_name` 为你的域名  
3. 使用 Certbot 等申请证书并配置 443（练手时可先跳过，用 IP + HTTP）

### 阶段 D：GitHub Actions CI/CD

1. 将代码推送到 GitHub，默认分支为 `main`
2. 在 VPS 配置部署专用 SSH 密钥，公钥写入 `~/.ssh/authorized_keys`
3. 仓库 **Settings → Secrets and variables → Actions** 添加：

| Secret | 说明 |
|--------|------|
| `SSH_HOST` | VPS 公网 IP |
| `SSH_USER` | SSH 用户名，如 `ubuntu` |
| `SSH_KEY` | 部署私钥全文 |
| `DEPLOY_PATH` | 可选，默认 `/var/www/todolist` |

4. `git push origin main` 后，Actions 会：拉代码 → 构建前端 → SSH 到 VPS 执行 `docker compose up -d --build`

也可在 VPS 手动执行脚本：

```bash
chmod +x deploy/deploy.sh
DEPLOY_PATH=/var/www/todolist ./deploy/deploy.sh
```

---

## API 说明

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/todos` | 列表 |
| POST | `/api/todos` | 新增 `{ "title": "..." }` |
| PATCH | `/api/todos/:id` | 更新 `{ "title"?, "completed"? }` |
| DELETE | `/api/todos/:id` | 删除 |

---

## 环境变量

见根目录 [.env.example](.env.example) 与 [server/.env.example](server/.env.example)。

生产 Docker 中 API 通过服务名 `mysql` 连接数据库（已在 `deploy/docker-compose.yml` 中配置）。
