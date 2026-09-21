-- Reels verticais: o preview do portal precisa mostrar 9:16 sem cortar a peça.
-- A constraint anterior aceitava apenas os formatos de feed ('1:1', '4:5').

alter table public.posts
  drop constraint posts_aspect_ratio_check;

alter table public.posts
  add constraint posts_aspect_ratio_check check (aspect_ratio in ('1:1', '4:5', '9:16'));
