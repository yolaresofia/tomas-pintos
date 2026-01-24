#!/bin/bash

# Vercel Deployment Script (via claimable deploy endpoint)
# Usage: ./vercel-deploy.sh [project-path]
# Returns: JSON with previewUrl, claimUrl, deploymentId, projectId

set -e

DEPLOY_ENDPOINT="https://claude-skills-deploy.vercel.com/api/deploy"

# Detect framework from package.json
detect_framework() {
    local pkg_json="$1"

    if [ ! -f "$pkg_json" ]; then
        echo "null"
        return
    fi

    local content=$(cat "$pkg_json")

    # Helper to check if a package exists in dependencies or devDependencies
    has_dep() {
        echo "$content" | grep -q "\"$1\""
    }

    # Order matters - check more specific frameworks first
    if has_dep "next"; then echo "nextjs"; return; fi
    if has_dep "gatsby"; then echo "gatsby"; return; fi
    if has_dep "@remix-run/"; then echo "remix"; return; fi
    if has_dep "astro"; then echo "astro"; return; fi
    if has_dep "@sveltejs/kit"; then echo "sveltekit-1"; return; fi
    if has_dep "nuxt"; then echo "nuxtjs"; return; fi
    if has_dep "vite"; then echo "vite"; return; fi
    if has_dep "react-scripts"; then echo "create-react-app"; return; fi
    if has_dep "sanity"; then echo "sanity-v3"; return; fi

    echo "null"
}

# Parse arguments
INPUT_PATH="${1:-.}"

# Create temp directory for packaging
TEMP_DIR=$(mktemp -d)
TARBALL="$TEMP_DIR/project.tgz"
CLEANUP_TEMP=true

cleanup() {
    if [ "$CLEANUP_TEMP" = true ]; then
        rm -rf "$TEMP_DIR"
    fi
}
trap cleanup EXIT

echo "Preparing deployment..." >&2

# Check if input is a .tgz file or a directory
FRAMEWORK="null"

if [ -f "$INPUT_PATH" ] && [[ "$INPUT_PATH" == *.tgz ]]; then
    echo "Using provided tarball..." >&2
    TARBALL="$INPUT_PATH"
    CLEANUP_TEMP=false
elif [ -d "$INPUT_PATH" ]; then
    PROJECT_PATH=$(cd "$INPUT_PATH" && pwd)
    FRAMEWORK=$(detect_framework "$PROJECT_PATH/package.json")

    echo "Creating deployment package..." >&2
    tar -czf "$TARBALL" -C "$PROJECT_PATH" --exclude='node_modules' --exclude='.git' --exclude='.next' --exclude='.vercel' .
else
    echo "Error: Input must be a directory or a .tgz file" >&2
    exit 1
fi

if [ "$FRAMEWORK" != "null" ]; then
    echo "Detected framework: $FRAMEWORK" >&2
fi

# Deploy
echo "Deploying to Vercel..." >&2
RESPONSE=$(curl -s -X POST "$DEPLOY_ENDPOINT" -F "file=@$TARBALL" -F "framework=$FRAMEWORK")

# Check for error in response
if echo "$RESPONSE" | grep -q '"error"'; then
    ERROR_MSG=$(echo "$RESPONSE" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
    echo "Error: $ERROR_MSG" >&2
    exit 1
fi

# Extract URLs from response
PREVIEW_URL=$(echo "$RESPONSE" | grep -o '"previewUrl":"[^"]*"' | cut -d'"' -f4)
CLAIM_URL=$(echo "$RESPONSE" | grep -o '"claimUrl":"[^"]*"' | cut -d'"' -f4)

if [ -z "$PREVIEW_URL" ]; then
    echo "Error: Could not extract preview URL from response" >&2
    echo "$RESPONSE" >&2
    exit 1
fi

echo "" >&2
echo "✓ Deployment successful!" >&2
echo "" >&2
echo "Preview URL: $PREVIEW_URL" >&2
echo "Claim URL:   $CLAIM_URL" >&2
echo "" >&2
echo "View your site at the Preview URL." >&2
echo "To transfer this deployment to your Vercel account, visit the Claim URL." >&2

# Output JSON for programmatic use
echo "$RESPONSE"