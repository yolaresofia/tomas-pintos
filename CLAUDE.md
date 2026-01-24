# Project Guidelines for Claude Code

## Vercel Skills Integration

This project uses Vercel's agent skills for best practices and deployment.

### Available Skills

1. **React Best Practices** - Performance optimization guidelines for React/Next.js
2. **Web Design Guidelines** - UI/UX audit rules for accessibility and performance
3. **Vercel Deploy** - Deploy to Vercel directly

### How to Use

#### React Best Practices
When writing or reviewing React/Next.js code, reference the guidelines at:
- Full guide: `.claude/skills/react-best-practices/AGENTS.md`
- Quick reference: `.claude/skills/react-best-practices/SKILL.md`

Key priorities:
1. **CRITICAL**: Eliminate waterfalls (use Promise.all, defer awaits)
2. **CRITICAL**: Optimize bundle size (avoid barrel imports, use dynamic imports)
3. **HIGH**: Server-side performance (use React.cache(), minimize serialization)

#### Web Design Guidelines
When reviewing UI code, reference:
- `.claude/skills/web-design-guidelines/SKILL.md`

Categories: Accessibility, Focus States, Forms, Animation, Typography, Images, Performance

#### Deploy to Vercel
To deploy this project:
```bash
bash .claude/scripts/vercel-deploy.sh frontend
```

This will:
1. Package the frontend directory
2. Auto-detect Next.js framework
3. Return a preview URL and claim URL

## Project Structure

- `frontend/` - Next.js application with Sanity CMS
- `studio/` - Sanity Studio (if present)

## Code Style

- Use TypeScript
- Use Tailwind CSS with custom breakpoint `min-[1100px]:`
- Mobile-first responsive design
- Font: Outfit (400-800 weights)