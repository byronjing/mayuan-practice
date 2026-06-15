# 至尊刷题系统

这是一个支持云端账号的多学科在线刷题程序。朋友通过 GitHub Pages 网址访问，用“学号 + 密码”登录；账号只能由管理员创建，练习进度、错题本和手动修正答案保存到 Supabase。

当前学科：

- 马原：原有马原题库与历史进度。
- 军理：由 `军事理论题库(1)(3)(2).docx` 转换而来。

主要练习模式：

- 马原：套题练习、模拟考试、随机练习、错题重刷。
- 军理：章节练习、选择题专项、随机练习、错题重刷。
- 随机练习会优先抽没做过的题；题目旁会显示“未做 / 已做 / 错题”标签。
- 每个学科会保存当前刷题进度，再次登录后可以继续。
- 马原模拟考试共 5 套，每套 30 分钟，满分 70 分：50 道单选、25 道多选、20 道判断。

## 在线部署结构

- GitHub：托管本项目代码。
- GitHub Pages：发布静态网页。
- Supabase Auth：保存登录账号和密码。
- Supabase Postgres：保存每个学号自己的刷题记录；马原和军理共用同一行 `practice_records.records`，在 JSON 内按学科隔离。
- Supabase Edge Function：管理员创建账号、重置密码、启用/停用账号。

## 本地打开

```bash
python3 -m http.server 4173
```

然后打开：

```text
http://localhost:4173/
```

如果没有配置 Supabase，页面会停在登录页并提示填写 `config.js`。

## Supabase 初始化

1. 在 Supabase 新建项目。
2. 在 SQL Editor 执行 `supabase/migrations/001_initial_schema.sql`。
3. 在 Supabase Auth 里先手动创建你的管理员登录邮箱：`你的学号@mayuan.local`，并设置密码。
4. 在 SQL Editor 把这个 Auth 用户登记为管理员：

```sql
insert into public.app_users (user_id, student_id, display_name, role, is_active)
select id, '你的学号', '管理员', 'admin', true
from auth.users
where email = '你的学号@mayuan.local'
on conflict (user_id) do update set role = 'admin', is_active = true;

insert into public.practice_records (user_id)
select id from auth.users
where email = '你的学号@mayuan.local'
on conflict (user_id) do nothing;
```

5. 部署 Edge Function：

```bash
supabase functions deploy admin-users
```

6. 在 `config.js` 填入 Supabase Project URL 和 publishable/anon key。不要把 service role key 写进前端文件。

## GitHub Pages

把本项目推到 GitHub 后，在仓库 Settings -> Pages 里选择主分支根目录发布。朋友只需要打开 Pages 地址登录刷题。

## 账号管理

管理员登录后可点击“管理账号”：

- 创建学号账号并初始化密码。
- 重置朋友密码。
- 启用或停用账号。

朋友登录后可点击“改密码”自己修改密码。页面不提供注册入口。

## 数据隔离

- 每个学号账号在 `practice_records` 中只有自己的记录。
- 马原和军理仍写入同一个云端路径：`practice_records.records`。
- 多学科记录在 JSON 内保存为 `subjects.mayuan` 和 `subjects.junli`，错题本、练习历史、手动答案修正互相隔离。
- 旧格式 `attempts`、`wrongBook`、`answerOverrides` 会自动当作马原历史记录读取，并补出空的军理记录。
- 新建朋友账号默认两个学科都是空记录。
- Row Level Security 限制普通用户只能读写自己的记录。
- 管理员可以管理账号列表，但前端管理页不会读取朋友的完整刷题记录。

## 封存你的历史记录

上线前，管理员账号登录后如果当前浏览器里存在旧本地记录，会出现：

- “封存本机旧记录”：下载 `my-practice-records-sealed.json`。
- “导入本机旧记录到当前账号”：二次输入当前学号确认后，才会导入云端。

请把封存文件放到本机 `private/` 目录。`.gitignore` 已经排除 `private/`、备份 JSON 和环境变量文件，避免把你的历史记录或密钥提交到 GitHub。

## 文件说明

- `index.html`：页面结构、登录和管理入口。
- `styles.css`：页面样式。
- `config.js`：Supabase 公开配置。
- `app.js`：刷题、登录、云端同步和管理逻辑。
- `questions.js`：核心题库。
- `supplemental_questions.js`：扩展题库。
- `military_questions.js`：军理题库。
- `supabase/migrations/001_initial_schema.sql`：数据库表和 RLS。
- `supabase/functions/admin-users/index.ts`：管理员账号管理函数。
