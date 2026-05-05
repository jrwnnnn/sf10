#!/usr/bin/env bash
# Rewrite the 'linear' branch into a clean, linear history.
# Each PR is squashed into one commit with the format: <PR title> (#<PR number>)
#
# Usage:
#   bash .github/rewrite-linear.sh
#   git push origin linear --force
#
# Requirements: must be run from the repo root with fetch access to origin.

set -e

git fetch origin linear

declare -A PR_TITLES
PR_TITLES[1]="preparation"
PR_TITLES[2]="ci: Enable CodeQL job in CI workflow"
PR_TITLES[3]="Implement base webapp functionality"
PR_TITLES[5]="Add fontkit and embed custom fonts for PDF generation"
PR_TITLES[7]="feat: Add progress UI"
PR_TITLES[9]="feat: Link flattening warning to #6"
PR_TITLES[11]="Refactor PDF field population"
PR_TITLES[12]="chore(deps): Bump defu from 6.1.4 to 6.1.6"
PR_TITLES[13]="chore(deps): Bump vite from 7.3.1 to 7.3.2"
PR_TITLES[14]="refactor: PDF field styling"
PR_TITLES[15]="refactor: Renamed Acroform fields and sync the changes to Excel template and codebase"
PR_TITLES[16]="refactor: Simplify class info mapping"
PR_TITLES[22]="feat: Added remarks population; enabled criteria inputs"
PR_TITLES[24]="fix: Use absolute site URLs for canonical and og:url"
PR_TITLES[25]="fix: Use absolute URL for meta image"
PR_TITLES[27]="CloudFlare migration"
PR_TITLES[29]="feat: Added handling for two special-case checkboxes"
PR_TITLES[30]="feat: Updated link to website in excel template"
PR_TITLES[31]="chore: Add .wrangler to ESLint ignore patterns"
PR_TITLES[34]="docs: Update README"
PR_TITLES[35]="Update CI scripts and commands"
PR_TITLES[37]="Update README.md"
PR_TITLES[38]="chore(deps): Bump astro from 6.1.1 to 6.1.8"
PR_TITLES[40]="chore(deps): Bump postcss from 8.5.6 to 8.5.13"

mapfile -t COMMITS < <(git log --first-parent --format="%H" origin/linear | tac)

PREV_COMMIT=""

for commit in "${COMMITS[@]}"; do
    subject=$(git log -1 --format="%s" "$commit")
    tree=$(git rev-parse "$commit^{tree}")

    if echo "$subject" | grep -qP "^Merge pull request #(\d+)"; then
        pr_num=$(echo "$subject" | grep -oP "(?<=Merge pull request #)\d+")
        title="${PR_TITLES[$pr_num]}"
        [ -z "$title" ] && title="$subject"
        msg="$title (#$pr_num)"
    else
        msg="$subject"
    fi

    author_name=$(git log -1 --format="%an" "$commit")
    author_email=$(git log -1 --format="%ae" "$commit")
    author_date=$(git log -1 --format="%aI" "$commit")
    committer_name=$(git log -1 --format="%cn" "$commit")
    committer_email=$(git log -1 --format="%ce" "$commit")
    commit_date=$(git log -1 --format="%cI" "$commit")

    if [ -z "$PREV_COMMIT" ]; then
        new_commit=$(GIT_AUTHOR_NAME="$author_name" GIT_AUTHOR_EMAIL="$author_email" \
            GIT_AUTHOR_DATE="$author_date" GIT_COMMITTER_NAME="$committer_name" \
            GIT_COMMITTER_EMAIL="$committer_email" GIT_COMMITTER_DATE="$commit_date" \
            git commit-tree "$tree" -m "$msg")
    else
        new_commit=$(GIT_AUTHOR_NAME="$author_name" GIT_AUTHOR_EMAIL="$author_email" \
            GIT_AUTHOR_DATE="$author_date" GIT_COMMITTER_NAME="$committer_name" \
            GIT_COMMITTER_EMAIL="$committer_email" GIT_COMMITTER_DATE="$commit_date" \
            git commit-tree "$tree" -p "$PREV_COMMIT" -m "$msg")
    fi

    echo "  $msg"
    PREV_COMMIT=$new_commit
done

git branch -f linear "$PREV_COMMIT"
echo ""
echo "Done. Local 'linear' branch is now at: $PREV_COMMIT"
echo ""
echo "To publish: git push origin linear --force"
