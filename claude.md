# Project Name - Development Guide

## Build and Development Commands
- Run development server: `npm run dev` or `bun dev`
- Build project: `npm run build`
- Lint code: `npm run lint`

## Testing Commands
- Run all tests: `npm test`
- Run a specific test file: `npm test -- <path-to-file>`

## Code Style & Guidelines
- Use TypeScript for all new files; strictly avoid using `any`.
- Prefer functional components and React Hooks over class components.
- Use Tailwind CSS for styling and follow mobile-first responsive design.
- Keep components small, modular, and exported as default.