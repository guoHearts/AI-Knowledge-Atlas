create table if not exists learning_tracks (
  id text primary key,
  slug text not null unique,
  title text not null,
  subtitle text,
  description text,
  difficulty text not null default 'beginner',
  estimated_hours integer,
  prerequisites text,
  outcome_skills text,
  outcome_project text,
  icon text,
  sort_order integer not null default 0,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists modules (
  id text primary key,
  track_id text not null references learning_tracks(id) on delete cascade,
  title text not null,
  description text,
  stage integer not null,
  sort_order integer not null default 0,
  estimated_hours integer,
  difficulty text not null default 'beginner',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists design_patterns (
  id text primary key,
  name text not null unique,
  title text not null,
  category text not null,
  description text,
  motivation text,
  structure_diagram text,
  implementation_guide text,
  code_example_langchain text,
  code_example_anthropic text,
  tradeoffs text,
  when_to_use text,
  when_not_to_use text,
  related_pattern_ids text,
  related_graph_nodes text,
  enterprise_scenario text,
  interview_questions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lessons (
  id text primary key,
  module_id text not null references modules(id) on delete cascade,
  title text not null,
  slug text not null,
  content_path text,
  sort_order integer not null default 0,
  difficulty text not null default 'beginner',
  estimated_minutes integer,
  analogy text,
  one_liner text,
  experiment_config text,
  design_pattern_id text references design_patterns(id) on delete set null,
  graph_node_ids text,
  tags text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, slug)
);

create table if not exists user_progress (
  id text primary key,
  user_id text not null default 'default',
  lesson_id text not null references lessons(id) on delete cascade,
  status text not null default 'not_started',
  experiment_status text,
  experiment_code text,
  notes text,
  started_at timestamptz,
  completed_at timestamptz,
  time_spent_seconds integer not null default 0,
  unique (user_id, lesson_id)
);

create table if not exists user_notes (
  id text primary key,
  user_id text not null default 'default',
  lesson_id text not null references lessons(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists experiment_logs (
  id text primary key,
  user_id text not null default 'default',
  lesson_id text not null references lessons(id) on delete cascade,
  status text not null,
  output text,
  created_at timestamptz not null default now()
);

create index if not exists idx_learning_tracks_slug on learning_tracks(slug);
create index if not exists idx_modules_track_id on modules(track_id);
create index if not exists idx_modules_published_track_sort
  on modules(track_id, sort_order)
  where status = 'published';
create index if not exists idx_lessons_module_slug on lessons(module_id, slug);
create index if not exists idx_lessons_published_module_sort
  on lessons(module_id, sort_order)
  where status = 'published';
create index if not exists idx_user_progress_user_lesson on user_progress(user_id, lesson_id);
create index if not exists idx_design_patterns_name on design_patterns(name);
create index if not exists idx_user_notes_user_lesson on user_notes(user_id, lesson_id);
create index if not exists idx_experiment_logs_user_lesson on experiment_logs(user_id, lesson_id);
