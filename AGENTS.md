<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Database changes go through the migration tool only; never add in-app "apply SQL" endpoints or RPCs that execute arbitrary SQL (security).
- Public customers (store, tracking, reviews) reach data only through SECURITY DEFINER RPCs keyed by order token; tables holding customer data have no anon policies.
- Staff permissions come from `public.user_roles` via `is_staff`/`is_manager`/`has_role`, never from user metadata.
