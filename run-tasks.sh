#!/bin/bash

# =============================================================================
# run-tasks.sh - 自动循环执行 task.json 中的未完成任务
#
# 用法: ./run-tasks.sh
#
# 工作原理:
#   1. 读取 task.json，找到下一个可执行任务（passes=false，依赖已完成）
#   2. 调用 claude 执行该任务
#   3. 验证任务完成（build + API 测试）
#   4. 循环直到所有任务完成或遇到阻塞
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TASK_FILE="$SCRIPT_DIR/task.json"
MAX_RETRIES=2

# 检查依赖
if ! command -v claude &> /dev/null; then
  echo -e "${RED}Error: claude CLI 未安装或不在 PATH 中${NC}"
  exit 1
fi

if ! command -v node &> /dev/null; then
  echo -e "${RED}Error: node 未安装${NC}"
  exit 1
fi

# 用 node 解析 task.json，找到下一个可执行任务
get_next_task() {
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$TASK_FILE', 'utf-8'));
    const tasks = data.tasks;

    // 找到所有已完成的任务 id
    const completed = new Set(tasks.filter(t => t.passes).map(t => t.id));

    // 找到下一个：passes=false，所有 dependsOn 都已完成，取最小 id
    const next = tasks
      .filter(t => !t.passes && t.dependsOn.every(d => completed.has(d)))
      .sort((a, b) => a.id - b.id)[0];

    if (next) {
      // 输出 id|title|description|steps
      console.log(next.id + '|' + next.title + '|' + next.description + '|' + next.steps.join('; '));
    } else {
      // 检查是否全部完成
      const allDone = tasks.every(t => t.passes);
      console.log(allDone ? 'ALL_DONE' : 'BLOCKED');
    }
  "
}

# 统计进度
get_progress() {
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$TASK_FILE', 'utf-8'));
    const total = data.tasks.length;
    const done = data.tasks.filter(t => t.passes).length;
    console.log(done + '/' + total);
  "
}

# 集成验证：build + API 健康检查
run_verification() {
  local task_id=$1
  local has_errors=false

  echo -e "${CYAN}  [验证] 运行集成验证...${NC}"

  # 后端 build
  if [ -d "$SCRIPT_DIR/backend" ]; then
    cd "$SCRIPT_DIR/backend"
    if npm run build > /dev/null 2>&1; then
      echo -e "${GREEN}  [验证] ✓ 后端 build 通过${NC}"
    else
      echo -e "${RED}  [验证] ✗ 后端 build 失败${NC}"
      has_errors=true
    fi
    cd "$SCRIPT_DIR"
  fi

  # 前端 build
  if [ -d "$SCRIPT_DIR/frontend" ]; then
    cd "$SCRIPT_DIR/frontend"
    if npm run build > /dev/null 2>&1; then
      echo -e "${GREEN}  [验证] ✓ 前端 build 通过${NC}"
    else
      echo -e "${RED}  [验证] ✗ 前端 build 失败${NC}"
      has_errors=true
    fi
    cd "$SCRIPT_DIR"
  fi

  # 数据库连接检查
  if command -v mysql &> /dev/null; then
    if mysql -u root -phero1234 -e "SELECT 1" > /dev/null 2>&1; then
      echo -e "${GREEN}  [验证] ✓ 数据库连接正常${NC}"
    else
      echo -e "${RED}  [验证] ✗ 数据库连接失败${NC}"
      has_errors=true
    fi
  fi

  # API 健康检查（仅在后端运行时）
  if curl -s http://localhost:5000/api/health 2>/dev/null | grep -q "ok"; then
    echo -e "${GREEN}  [验证] ✓ 后端 API 健康${NC}"

    # 登录接口测试
    if curl -s -X POST http://localhost:5000/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"admin@blog.com","password":"admin123"}' 2>/dev/null | grep -q "token"; then
      echo -e "${GREEN}  [验证] ✓ 登录接口正常${NC}"
    else
      echo -e "${YELLOW}  [验证] ⚠ 登录接口异常（可能需要运行 seed）${NC}"
    fi
  else
    echo -e "${YELLOW}  [验证] ⚠ 后端未运行，跳过 API 测试${NC}"
  fi

  if [ "$has_errors" = true ]; then
    return 1
  fi
  return 0
}

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Fullstack Blog - 自动任务执行器${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

LOOP_COUNT=0

while true; do
  LOOP_COUNT=$((LOOP_COUNT + 1))
  PROGRESS=$(get_progress)
  echo -e "${YELLOW}[进度 $PROGRESS] 查找下一个任务...${NC}"

  RESULT=$(get_next_task)

  if [ "$RESULT" = "ALL_DONE" ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  所有任务已完成! ($PROGRESS)${NC}"
    echo -e "${GREEN}========================================${NC}"

    # 最终集成验证
    echo ""
    echo -e "${CYAN}运行最终集成验证...${NC}"
    run_verification "final"

    exit 0
  fi

  if [ "$RESULT" = "BLOCKED" ]; then
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}  所有剩余任务被阻塞，无法继续${NC}"
    echo -e "${RED}  当前进度: $PROGRESS${NC}"
    echo -e "${RED}========================================${NC}"
    exit 1
  fi

  # 解析任务信息
  TASK_ID=$(echo "$RESULT" | cut -d'|' -f1)
  TASK_TITLE=$(echo "$RESULT" | cut -d'|' -f2)
  TASK_DESC=$(echo "$RESULT" | cut -d'|' -f3)
  TASK_STEPS=$(echo "$RESULT" | cut -d'|' -f4)

  echo ""
  echo -e "${CYAN}----------------------------------------${NC}"
  echo -e "${CYAN}  Task $TASK_ID: $TASK_TITLE${NC}"
  echo -e "${CYAN}  $TASK_DESC${NC}"
  echo -e "${CYAN}----------------------------------------${NC}"
  echo ""

  # 构造 prompt — 包含 CLAUDE.md 中的关键规则
  PROMPT="你现在要执行 task.json 中的 Task $TASK_ID: $TASK_TITLE

任务描述: $TASK_DESC

具体步骤:
$TASK_STEPS

请严格按照 CLAUDE.md 的工作流执行:
1. 先读取 CLAUDE.md 了解环境配置和规则
2. 实现该任务的所有步骤
3. 测试确保可用:
   - 后端改动: npm run build 通过 + curl 测试 API
   - 前端改动: npm run build 通过
   - schema 变更: 运行 prisma db push + npm run seed
4. 完成后将 task.json 中该任务的 passes 改为 true
5. 在 progress.txt 末尾追加该任务的完成记录
6. git add 并 commit

关键规则:
- 不得修改 .env 中已有字段的值（尤其是 DB_PASSWORD）
- 不得启动 dev server 后台进程
- 涉及新 model 时必须运行 prisma db push 和 npm run seed
- 不要跳过测试步骤，不要修改其他任务。一次只完成这一个任务。"

  # 执行任务，带重试
  RETRY=0
  SUCCESS=false

  while [ $RETRY -le $MAX_RETRIES ]; do
    if [ $RETRY -gt 0 ]; then
      echo -e "${YELLOW}  重试第 $RETRY 次...${NC}"
    fi

    echo -e "${GREEN}  调用 claude 执行 Task $TASK_ID...${NC}"

    if claude --dangerously-skip-permissions -p "$PROMPT" 2>&1; then
      # 检查任务是否被标记为完成
      TASK_PASSED=$(node -e "
        const fs = require('fs');
        const data = JSON.parse(fs.readFileSync('$TASK_FILE', 'utf-8'));
        const task = data.tasks.find(t => t.id === $TASK_ID);
        console.log(task && task.passes ? 'true' : 'false');
      ")

      if [ "$TASK_PASSED" = "true" ]; then
        # 任务标记完成后，运行集成验证
        if run_verification "$TASK_ID"; then
          echo -e "${GREEN}  ✓ Task $TASK_ID 完成并验证通过!${NC}"
          SUCCESS=true
          break
        else
          echo -e "${YELLOW}  Task $TASK_ID 标记完成但验证未通过，重试...${NC}"
        fi
      else
        echo -e "${YELLOW}  Task $TASK_ID 执行完毕但未标记为完成${NC}"
      fi
    else
      echo -e "${RED}  claude 执行出错${NC}"
    fi

    RETRY=$((RETRY + 1))
  done

  if [ "$SUCCESS" = false ]; then
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}  Task $TASK_ID 执行失败（已重试 $MAX_RETRIES 次）${NC}"
    echo -e "${RED}  当前进度: $(get_progress)${NC}"
    echo -e "${RED}========================================${NC}"
    exit 1
  fi

  echo ""
done
