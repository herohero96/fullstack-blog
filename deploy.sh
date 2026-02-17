#!/bin/bash

# =============================================================================
# deploy.sh - 一键发布到服务器
#
# 用法:
#   ./deploy.sh              # 推送代码并重新构建部署
#   ./deploy.sh --skip-push  # 跳过 git push，只在服务器上拉取并重建
# =============================================================================

set +H

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# ============ 配置区 ============
SERVER="root@120.55.183.31"
SSH_PORT="22"
REMOTE_DIR="/root/fullstack-blog"
BRANCH="main"
# ================================

SSH_OPTS="-p ${SSH_PORT} -o ConnectTimeout=10 -o StrictHostKeyChecking=no"

SKIP_PUSH=""
if [ "$1" = "--skip-push" ]; then
  SKIP_PUSH="1"
fi

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  开始发布到服务器${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Step 1: 本地 git push
if [ -z "${SKIP_PUSH}" ]; then
  echo "Step 1: 推送本地代码..."
  if ! git push origin ${BRANCH} 2>&1; then
    echo -e "${RED}git push 失败，请检查本地提交状态${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ 代码已推送到 origin/${BRANCH}${NC}"
else
  echo "Step 1: 跳过 git push（--skip-push）"
fi
echo ""

# Step 2: 服务器拉取代码
echo "Step 2: 服务器拉取最新代码..."
if ! ssh ${SSH_OPTS} ${SERVER} "cd ${REMOTE_DIR} && git pull origin ${BRANCH}" 2>&1; then
  echo -e "${RED}服务器 git pull 失败${NC}"
  exit 1
fi
echo -e "${GREEN}✓ 服务器代码已更新${NC}"
echo ""

# Step 3: 重新构建镜像
echo "Step 3: 重新构建 Docker 镜像（这可能需要几分钟）..."
if ! ssh ${SSH_OPTS} ${SERVER} "cd ${REMOTE_DIR} && docker compose build" 2>&1; then
  echo -e "${RED}Docker 构建失败${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Docker 镜像构建完成${NC}"
echo ""

# Step 4: 重启服务
echo "Step 4: 重启服务..."
if ! ssh ${SSH_OPTS} ${SERVER} "cd ${REMOTE_DIR} && docker compose up -d" 2>&1; then
  echo -e "${RED}服务重启失败${NC}"
  exit 1
fi
echo -e "${GREEN}✓ 服务已重启${NC}"
echo ""

# Step 5: 等待健康检查
echo "Step 5: 等待服务启动..."
sleep 10

# 检查后端健康状态
echo "检查后端服务..."
HEALTH=$(ssh ${SSH_OPTS} ${SERVER} "curl -s -o /dev/null -w '%{http_code}' http://localhost:80/api/health" 2>/dev/null)
if [ "${HEALTH}" = "200" ]; then
  echo -e "${GREEN}✓ 后端服务正常${NC}"
else
  echo -e "${YELLOW}⚠ 后端健康检查返回 ${HEALTH}，服务可能还在启动中，请稍后手动检查${NC}"
fi

# 检查前端
FRONTEND=$(ssh ${SSH_OPTS} ${SERVER} "curl -s -o /dev/null -w '%{http_code}' http://localhost:80" 2>/dev/null)
if [ "${FRONTEND}" = "200" ]; then
  echo -e "${GREEN}✓ 前端服务正常${NC}"
else
  echo -e "${YELLOW}⚠ 前端返回 ${FRONTEND}，请稍后手动检查${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  发布完成${NC}"
echo -e "${GREEN}  服务器: ${SERVER}${NC}"
echo -e "${GREEN}  访问: http://120.55.183.31${NC}"
echo -e "${GREEN}========================================${NC}"
