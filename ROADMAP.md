# TrampoleanAgentEditor - Product Roadmap

## ✅ v0.1.0 (Current Foundation)
- [x] Rich text editor with TipTap/ProseMirror
- [x] AI agent integration (Review, Rewrite, Continue)
- [x] Document storage with MongoDB
- [x] Version history
- [x] Auto-save
- [x] Toolbar with formatting options
- [x] Dark mode support

## 🚀 v0.2.0 - Auth & Cloud Storage (IN PROGRESS)
### Phase 1: Completed ✅
- [x] NextAuth.js with Google OAuth
- [x] User authentication & session management
- [x] MongoDB models: User, WorkingProject, Bibliography, SessionLog
- [x] Google Drive service (list, download, upload, delete)
- [x] Project sync service (GDrive ↔ MongoDB)
- [x] Middleware for route protection
- [x] Login page with Google OAuth
- [x] Dashboard page (placeholder)
- [x] Type definitions for NextAuth
- [x] Build system configured and tested

### Phase 2: APIs (NEXT)
- [ ] `GET /api/projects` - list user's projects
- [ ] `POST /api/projects/open` - load project from Google Drive
- [ ] `POST /api/projects` - create new project
- [ ] `GET /api/projects/:id` - get project details
- [ ] `PUT /api/projects/:id` - auto-save to MongoDB
- [ ] `POST /api/projects/:id/finalize` - save to Google Drive + cleanup
- [ ] `DELETE /api/projects/:id` - delete project
- [ ] Redis rate limiting (100 AI/hour, 10 syncs/min)
- [ ] SessionLog logging

### Phase 3: UI & Features
- [ ] Dashboard full implementation (list projects from GDrive)
- [ ] EditorSession component with chapter/section navigation
- [ ] ChapterTree sidebar
- [ ] Auto-save integration with MongoDB
- [ ] Version history modal
- [ ] Google Drive export button
- [ ] Session management (open/close/save)
- [ ] E2E tests with Playwright

## 🚀 v0.3.0 - Project Structure & RAG
- [ ] Hierarchical structure (Project → Chapter → Section)
- [ ] Vector embeddings (OpenAI)
- [ ] Semantic search in MongoDB
- [ ] RAG memory per section
- [ ] Bibliography management
- [ ] Citation autocomplete

## 🏗️ v0.4.0 - Collaboration
- [ ] Real-time collaborative editing (Y.js / Liveblocks)
- [ ] Presence indicators (cursors, user avatars)
- [ ] Comments and annotations
- [ ] Document sharing and permissions

## 📚 v0.5.0 - Export & Publishing
- [ ] Citation style plugins (APA, ABNT, Chicago, MLA)
- [ ] Export to PDF (via Puppeteer or react-pdf)
- [ ] Export to Markdown
- [ ] Export to Word (.docx)
- [ ] Import from Word/Markdown

## 🔧 v0.6.0 - Advanced Features
- [ ] AI model selector (GPT-4, GPT-4o, Claude)
- [ ] Streaming AI responses
- [ ] Inline "ghost text" suggestions
- [ ] Diff/patch visualization
- [ ] Conversation history with AI

## 🌍 v0.7.0 - Internationalization
- [ ] Multi-language UI
- [ ] Language-specific AI prompts
- [ ] RTL (right-to-left) text support
- [ ] Localized number and date formatting

## 🏪 v1.0.0 - Plugin Marketplace
- [ ] Plugin SDK
- [ ] Public plugin marketplace
- [ ] Custom AI prompt plugins
- [ ] Third-party integrations (Notion, Google Docs, Confluence)
- [ ] API for external developers

## 🔐 Enterprise Features
- [ ] SSO / OAuth integration (Azure AD, Okta)
- [ ] Audit logs
- [ ] On-premise deployment
- [ ] Custom model fine-tuning
- [ ] Team workspaces with admin controls

---

## 📦 Implementation Status

### Current Architecture (v0.2.0 Phase 1)
```
MongoDB (Workspace)
├─ User (authenticated)
├─ WorkingProject (24h TTL)
│  ├─ chapters[]
│  ├─ sections[]
│  └─ bibliography[]
├─ Bibliography
└─ SessionLog (30d TTL)

Google Drive (Persistent)
└─ /TrampoleanAgent/
   ├─ project.json
   └─ project.meta.json
```

### Authentication
- ✅ NextAuth.js with Google OAuth
- ✅ User model with tokens
- ✅ Session management
- ✅ Route protection middleware

### Storage Strategy
- **MongoDB**: Workspace for editing (temporary, TTL-based auto-cleanup)
- **Google Drive**: Permanent storage with metadata export
- **Sync Flow**: GDrive → Load to MongoDB → Edit & Auto-save → Finalize → GDrive + Clean MongoDB

### Next Steps
1. Implement Phase 2 APIs (project CRUD with auth)
2. Build dashboard to list GDrive projects
3. Create EditorSession with chapter/section navigation
4. Integrate auto-save with WorkingProject model
5. Test full flow end-to-end

