#!/usr/bin/env zsh
# 개발일지 작성 전 증거 수집 — Cursor 터미널, zsh 히스토리, git, 파일 mtime
set -euo pipefail

TARGET_DATE="${1:-$(date +%Y-%m-%d)}"
DEVLOG_ROOT="${DEVLOG_ROOT:-$HOME/devlogs}"
OUT_DIR="$DEVLOG_ROOT/$TARGET_DATE"
OUT_FILE="$OUT_DIR/_context.md"
TERMINALS_DIR="${CURSOR_TERMINALS:-$HOME/.cursor/projects/home-joey/terminals}"
GENERATED_AT="$(date -Iseconds)"
HISTFILE="${HISTFILE:-$HOME/.zsh_history}"

KNOWN_REPOS=(
  "$HOME/portfolio"
  "$HOME/devlog-site"
  "$HOME/physical-ai-bootcamp-intro"
  "$HOME/daily-vision-lab"
)

SCRIPT_DIR="${0:A:h}"

# 비밀값 패턴 마스킹 (scripts/secrets.py와 동일 규칙)
redact() {
  python3 "$SCRIPT_DIR/secrets.py" redact
}

# 터미널 로그에서 cwd별 명령 추출
gather_terminals() {
  typeset -A by_cwd

  if [[ ! -d "$TERMINALS_DIR" ]]; then
    echo "_No terminal logs at $TERMINALS_DIR._"
    return
  fi

  local term_file pid cwd last_cmd exit_code body_cmds block
  for term_file in "$TERMINALS_DIR"/*.txt(N); do
    [[ -f "$term_file" ]] || continue

    pid="$(awk -F': ' '/^pid:/{print $2; exit}' "$term_file")"
    cwd="$(awk -F': ' '/^cwd:/{gsub(/^"|"$/, "", $2); print $2; exit}' "$term_file")"
    last_cmd="$(awk -F': ' '/^last_command:/{sub(/^last_command: /,""); print; exit}
      /^command:/{sub(/^command: /,""); gsub(/^"|"$/, ""); print; exit}' "$term_file")"
    exit_code="$(awk -F': ' '/^last_exit_code:/{print $2; exit}' "$term_file")"
    [[ -z "$exit_code" ]] && exit_code="$(awk -F': ' '/^exit_code:/{print $2; exit}' "$term_file")"
    [[ -z "$cwd" ]] && cwd="(unknown)"

    # 본문은 두 번째 --- 블록(메타 다음)
    body_cmds="$(
      awk 'BEGIN{n=0}
        /^---$/{n++; next}
        n==2 && NF {
          if ($0 !~ /^[%$#][[:space:]]*$/ && $0 !~ /^(pid|cwd|command|started_at|running_for_ms|last_command|last_exit_code):/ && $0 ~ /[A-Za-z0-9]/) print
        }' "$term_file" | redact
    )"

    block=""
    if [[ -n "$last_cmd" && "$last_cmd" != "(none)" ]]; then
      block="$(print -r -- "$last_cmd" | redact)"
    fi
    if [[ -n "$body_cmds" ]]; then
      [[ -n "$block" ]] && block+=$'\n'
      block+="$body_cmds"
    fi
      [[ -z "${block//[[:space:]]/}" ]] && continue
    [[ -n "$exit_code" && "$exit_code" != "unknown" ]] && block="# exit=$exit_code"$'\n'"$block"

    if [[ -n "${by_cwd[$cwd]:-}" ]]; then
      by_cwd[$cwd]+=$'\n'"$block"
    else
      by_cwd[$cwd]="$block"
    fi
  done

  if (( ${#by_cwd[@]} == 0 )); then
    echo "_No terminal activity parsed._"
    return
  fi

  local cwd_key
  for cwd_key in ${(ko)by_cwd}; do
    echo "### $cwd_key"
    echo '```'
    print -r -- "${by_cwd[$cwd_key]}" | awk '!seen[$0]++ { if (++n <= 40) print }'
    echo '```'
    echo
  done
}

# zsh EXTENDED_HISTORY 또는 plain fallback
gather_zsh_history() {
  if [[ ! -r "$HISTFILE" ]]; then
    echo "_History file not readable: $HISTFILE._"
    return
  fi

  local sample line ts cmd prev
  sample="$(head -1 "$HISTFILE" 2>/dev/null || true)"
  typeset -a lines
  prev=""

  if [[ "$sample" =~ '^: ?[0-9]+:[0-9]+;' ]]; then
    local day_start day_end
    day_start="$(date -d "$TARGET_DATE 00:00:00" +%s)"
    day_end="$(date -d "$TARGET_DATE 23:59:59" +%s)"

    while IFS= read -r line; do
      [[ "$line" =~ '^: ?([0-9]+):[0-9]+;(.*)' ]] || continue
      ts="$match[1]"
      cmd="$match[2]"
      [[ $ts -ge $day_start && $ts -le $day_end ]] || continue
      cmd="$(print -r -- "$cmd" | redact)"
      [[ "$cmd" == "$prev" ]] && continue
      prev="$cmd"
      lines+=("$cmd")
    done < "$HISTFILE"
  else
    echo "> **Warning:** no timestamps in history — enable \`setopt EXTENDED_HISTORY\` in ~/.zshrc"
    echo
    while IFS= read -r line; do
      [[ -n "$line" ]] || continue
      line="$(print -r -- "$line" | redact)"
      [[ "$line" == "$prev" ]] && continue
      prev="$line"
      lines+=("$line")
    done < <(tail -n 200 "$HISTFILE" | awk '!seen[$0]++')
  fi

  if (( ${#lines[@]} == 0 )); then
    echo "_No zsh commands for $TARGET_DATE._"
    return
  fi

  echo '```'
  if (( ${#lines[@]} > 80 )); then
    print -l -- "${lines[@]: -80}"
  else
    print -l -- "${lines[@]}"
  fi
  echo '```'
}

# 알려진 repo + 오늘 커밋 있는 ~/ 직하위 .git
gather_git_repos() {
  local -a repos=("${KNOWN_REPOS[@]}")
  local d n repo

  for d in "$HOME"/*(/N); do
    [[ -d "$d/.git" ]] || continue
    local skip=0
    for repo in "${repos[@]}"; do
      [[ "$repo" == "$d" ]] && skip=1 && break
    done
    [[ $skip -eq 1 ]] && continue
    n="$(git -C "$d" log --since="$TARGET_DATE 00:00:00" --until="$TARGET_DATE 23:59:59" \
      --oneline 2>/dev/null | wc -l | tr -d ' ')"
    [[ "$n" != "0" ]] && repos+=("$d")
  done

  local found=0
  for repo in "${repos[@]}"; do
    [[ -d "$repo/.git" ]] || continue
    found=1
    echo "### $(basename "$repo") — \`$repo\`"
    echo '**log (today):**'
    echo '```'
    local log_out
    log_out="$(git -C "$repo" log --since="$TARGET_DATE 00:00:00" --until="$TARGET_DATE 23:59:59" \
      --oneline 2>/dev/null | awk 'NR<=20')"
    if [[ -n "$log_out" ]]; then
      print -r -- "$log_out"
    else
      echo "(no commits)"
    fi
    echo '```'
    echo '**status:**'
    echo '```'
    git -C "$repo" status -sb 2>/dev/null | awk 'NR<=15'
    echo '```'
    echo
  done
  [[ $found -eq 1 ]] || echo "_No git repos found._"
}

# mtime 0 (오늘) 파일 — 경로 cap
gather_files() {
  local -a roots=("$DEVLOG_ROOT" "${KNOWN_REPOS[@]}")
  local root total=0 cap=50

  for root in "${roots[@]}"; do
    [[ -d "$root" ]] || continue
    [[ $total -ge $cap ]] && break
    echo "### $root"
    echo '```'
    while IFS= read -r f; do
      echo "$f"
      total=$(( total + 1 ))
      [[ $total -ge $cap ]] && break
    done < <(find "$root" -type f -mtime 0 \
      ! -path '*/.git/*' \
      ! -path '*/node_modules/*' \
      ! -path '*/.verify-screenshots/*' \
      2>/dev/null | awk 'NR<=30')
    echo '```'
    echo
  done
}

mkdir -p "$OUT_DIR"

{
  echo "# Devlog context — $TARGET_DATE"
  echo ""
  echo "_Generated: $GENERATED_AT._"
  echo ""
  echo "## Cursor terminals"
  echo ""
  gather_terminals
  echo "## Zsh commands"
  echo ""
  gather_zsh_history
  echo ""
  echo "## Git"
  echo ""
  gather_git_repos
  echo "## Files"
  echo ""
  gather_files
} > "$OUT_FILE"

echo "Wrote $OUT_FILE"
