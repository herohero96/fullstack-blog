#!/bin/bash

# =============================================================================
# sync-db.sh - 一键同步本地数据库到服务器
#
# 用法:
#   ./sync-db.sh              # 完整同步（结构 + 数据）
#   ./sync-db.sh --data-only  # 只同步数据（不含建表语句）
# =============================================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# ============ 配置区 - 根据你的实际情况修改 ============
SERVER="root@120.55.183.31"      # SSH 连接地址（用户名@IP）
SSH_PORT="22"                     # SSH 端口
LOCAL_DB_USER="root"
LOCAL_DB_PASS="hero1234"
REMOTE_DB_USER="root"
REMOTE_DB_PASS="hero1234"
DB_NAME="fullstack_blog"
# =====================================================

DATA_ONLY=""
if [ "$1" = "--data-only" ]; then
  DATA_ONLY="--no-create-info"
  echo -e "${YELLOW}模式：只同步数据（不含表结构）${NC}"
else
  echo -e "${YELLOW}模式：完整同步（结构 + 数据）${NC}"
fi

# 检查本地数据库连接
echo "检查本地数据库连接..."
if ! mysql -u ${LOCAL_DB_USER} -p${LOCAL_DB_PASS} -e "SELECT 1" > /dev/null 2>&1; then
  echo -e "${RED}本地数据库连接失败，请检查密码${NC}"
  exit 1
fi
echo -e "${GREEN}✓ 本地数据库连接正常${NC}"

# 检查 SSH 连接
echo "检查服务器 SSH 连接..."
if ! ssh -p ${SSH_PORT} -o ConnectTimeout=5 ${SERVER} "echo ok" > /dev/null 2>&1; then
  echo -e "${RED}SSH 连接失败，请检查配置: ${SERVER}:${SSH_PORT}${NC}"
  exit 1
fi
echo -e "${GREEN}✓ SSH 连接正常${NC}"

# 先备份服务器数据库
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
echo "备份服务器数据库到 /tmp/${BACKUP_FILE}..."
ssh -p ${SSH_PORT} ${SERVER} "mysqldump -u ${REMOTE_DB_USER} -p${REMOTE_DB_PASS} ${DB_NAME} > /tmp/${BACKUP_FILE} 2>/dev/null" 2>/dev/null
echo -e "${GREEN}✓ 服务器备份完成: /tmp/${BACKUP_FILE}${NC}"

# 确保服务器数据库存在
ssh -p ${SSH_PORT} ${SERVER} "mysql -u ${REMOTE_DB_USER} -p${REMOTE_DB_PASS} -e 'CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'" 2>/dev/null

# 同步
echo "正在同步..."
mysqldump -u ${LOCAL_DB_USER} -p${LOCAL_DB_PASS} ${DATA_ONLY} --complete-insert ${DB_NAME} 2>/dev/null \
  | ssh -p ${SSH_PORT} ${SERVER} "mysql -u ${REMOTE_DB_USER} -p${REMOTE_DB_PASS} ${DB_NAME}" 2>/dev/null

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}  数据库同步完成${NC}"
  echo -e "${GREEN}  服务器备份: /tmp/${BACKUP_FILE}${NC}"
  echo -e "${GREEN}========================================${NC}"
else
  echo ""
  echo -e "${RED}同步失败，服务器数据可从备份恢复:${NC}"
  echo -e "${RED}  ssh -p ${SSH_PORT} ${SERVER} \"mysql -u ${REMOTE_DB_USER} -p${REMOTE_DB_PASS} ${DB_NAME} < /tmp/${BACKUP_FILE}\"${NC}"
  exit 1
fi
