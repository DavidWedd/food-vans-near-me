# Database

The foodvansnear Supabase project (Sydney, ref `ibvurnewvaksidzszphf`) holds vendor listings, live "I'm here" locations, weekly schedules, menus and the admin list.

Security is enforced in the database with row-level security:
- The public can only read approved vendors (and live locations that haven't expired).
- A logged-in vendor can create one listing and edit only their own. A trigger stops vendors changing their own approval status, plan, founding flag or login link.
- Admins (emails in `admin_emails`) can see and change everything.
- Photos go in the public `vendor-photos` bucket, in a folder named after the uploader's user id.

Migrations were applied through the Supabase dashboard tools: `vendors_core`, `move_helpers_private`, `owner_email`.
