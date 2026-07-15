# K12Teacher

An AI-assisted self-study platform for high school learners, covering subjects such as **Politics**, **History**, and **Geography**. It helps students upload textbooks, build knowledge structures, practice guided exercises, review with flashcards, explore timelines and causal chains, visualize with GeoGebra, and track learning progress.

> Goal: turn textbook content into structured, learnable, and reviewable learning paths.

## Features

- **Subject hub**: unified entry point for subjects with quick sidebar switching.
- **Textbook management**: upload PDF/DOCX files, extract chapters and sections, and build a clickable learning tree.
- **Knowledge graph**: import or auto-extract concepts, relationships, timelines, and causal chains.
- **Guided learning**: concept discrimination, textbook restoration, synthesis, and argumentation training.
- **Flashcards**: concept, event, and essay cards for spaced review.
- **History tools**: timeline, causal chain, and material analysis for stronger chronological and logical thinking.
- **Geography visualization**: interactive maps, regional comparisons, location analysis, and visual exploration.
- **GeoGebra**: dynamic geometry visualization with guided explanation.
- **AI tutoring**: knowledge explanations, similar questions, wrong-question analysis, and multi-turn follow-up.
- **Wrong questions, vocabulary, daily accumulation**: cover weak points, vocabulary, and long-term growth.
- **Learning records and analytics**: progress tracking, exercise statistics, and weakness analysis.

## Learning Paths

### Politics
Entry: `/subjects/politics` -> chapter selection -> module

Recommended flow:
1. Knowledge learning
2. Concept discrimination
3. Current affairs
4. Textbook restoration
5. Synthesis
6. Essay practice
7. Flashcards

### History
Entry: `/subjects/history` -> chapter selection -> module

Recommended flow:
1. Timeline
2. Causal chain
3. Knowledge
4. Textbook restoration
5. Practice
6. Analysis
7. Flashcards

### Geography
Entry: `/subjects/geography` -> chapter selection -> module

Recommended flow:
1. Knowledge
2. Interactive map
3. Regional comparison
4. Location analysis
5. Practice
6. Visual exploration
7. Flashcards

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript**
- **Tailwind CSS** + **Radix UI** + **shadcn/ui**
- **Zustand**
- **Supabase**
- **Vercel**
- **AI SDK** + model integrations
- **PDF/DOCX parsing**: pdf-parse, pdfjs-dist, mammoth, jszip
- **Visualization**: ECharts, ECharts for React, React Flow, KaTeX, GeoGebra
- **Speech**: Alibaba Cloud / iFlytek TTS

## Getting Started

```bash
git clone <your-fork-url>
cd <project-folder>
npm install
npm run dev
```

Environment variables examples:
- `.env.local`
- DeepSeek API Key
- Supabase config
- TTS / AI keys as needed

## Project Structure

- `src/app/` - routes and pages
- `src/components/` - reusable components
- `src/lib/` - utilities, data loading, AI calls
- `src/data/`, `src/stores/` - textbook data and state management
- `src/app/api/` - API layer for knowledge extraction, practice generation, explanation, and grading

## Live Preview

Dev preview:
https://k12-teacher-np5uirg51-leke1122s-projects.vercel.app

Production:
https://k12-teacher-theta.vercel.app

## Contributing

Issues and PRs are welcome, especially for:
- new subject templates
- practice generation and grading UX
- visualization components
- mobile experience

## Roadmap

- more subject templates
- automatic study plan and recommended order
- offline export / PDF wrong-question notebook
- multi-account progress sync and sharing

## License

MIT
