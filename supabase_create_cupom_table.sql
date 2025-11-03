-- Migration: create cupom table
-- Fields: id, cupom, active, createat, lastupdate

create table if not exists cupom (
  id bigserial primary key,
  cupom text not null unique,
  active boolean not null default true,
  createat timestamptz not null default now(),
  lastupdate timestamptz not null default now()
);

create or replace function set_lastupdate()
returns trigger as $$
begin
  new.lastupdate = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists cupom_set_lastupdate on cupom;
create trigger cupom_set_lastupdate
before update on cupom
for each row execute function set_lastupdate();