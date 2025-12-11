# AI-Enhanced To-Do List App  
Built with **Next.js**, **Supabase**, **N8N**, and **Vercel**

## Overview
This project is a demonstration of an AI-powered automation workflow for a simple To-Do List application. It mirrors the type of work done as an **AI Automation Developer: Client Transformation Specialist**, integrating frontend, backend, database, and automation layers to transform business processes.

The app allows users to:
- Log in with an email (stored via cookie).
- Create, edit, delete and complete tasks.
- Persist data in Supabase.
- Automatically enhance task titles via N8N and AI.

A companion Loom video explains the architecture, workflow, and design decisions.

---

## Tech Stack
### Frontend
- **Next.js 14 (App Router)**
- **Client Components + Server Actions**
- **TypeScript**

### Backend / Database
- **Supabase**
  - Postgres DB  
  - Supabase Client for CRUD

### Hosting
- **Vercel** (Next.js SSR environment)

### Automations (Part 2)
- **N8N**
  - Webhook listening for new tasks  
  - Calls AI model (OpenAI or similar)  
  - Updates enhanced task title in Supabase  
  - Optional API-first architecture

---

## Features
### Core Requirements (Part 1)
- Add a task
- Edit a task
- Mark a task complete
- Persist tasks in Supabase
- Basic login using email stored in a cookie
- Deployed to Vercel

### AI Automation (Part 2)
- When a new task is created, the app sends:
  - `task_id`
  - `original_title`
  - `user_email`
- N8N workflow enhances the title using AI and updates Supabase.

### Bonus (Optional)
- API-first architecture for better separation of concerns
- WhatsApp integration using Evolution API or similar (not included by request but supported)

---

## Project Structure
```
/
├─ app/
│  ├─ page.tsx
│  └─ login
│       ├─ actions.ts
│       └─ page.tsx
│
├─ components/
│  ├─ TaskList.tsx
│  └─ RequireLogin.tsx
│
├─ lib/
│  └─ supabase.ts
│
└─ README.md
```

---

## Supabase Setup

### 1. Create Table
```sql
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  title text not null,
  enhanced_title text,
  completed boolean default false,
  created_at timestamp default now()
);
```

### 2. Create notify function
```sql
create or replace function notify_new_task()
returns trigger as $$
begin
  perform
    pg_notify('new_task_channel', row_to_json(NEW)::text);
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists tr_new_task on tasks;

create trigger tr_new_task
after insert on tasks
for each row
execute function notify_new_task();
```

---

## N8N Workflow (Part 2)
The automation workflow includes:

1. **Webhook Trigger**  
   Receives new task data from Next.js.

2. **AI Node**  
   Enhances the title (clarifies, expands, or breaks into steps).

3. **Supabase Node**  
   Updates the task row with the enhanced title.

You may use either:
- OpenAI Node
- OpenAI Model via HTTP Request
- Any LLM supported by N8N

---

## Environment Variables
Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
N8N_WEBHOOK_URL=https://your-n8n-instance/webhook/ai-enhance
```

---

## Deployment
### Vercel
1. Connect GitHub repo  
2. Add environment variables  
3. Deploy  

### N8N
- Hosted on cloud or local  
- Ensure webhook URL is publicly accessible (ngrok if needed)

---

## How It Works (Workflow Summary)
1. User logs in with an email stored in a secure cookie.  
2. User adds a task.  
3. Next.js inserts the task into Supabase and notifies N8N.  
4. N8N enhances the task and updates Supabase.  
5. UI automatically fetches refreshed tasks via server components.

---

## Future Enhancements
- WhatsApp integration (#todo list filter)  
- Push notifications  
- Task categorization / priorities  
- Multi-user auth with Supabase Auth  
- Full API-first architecture (tasks API, AI API, ingest API)

---

## License
MIT
