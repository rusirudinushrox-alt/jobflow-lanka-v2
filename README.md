# JobFlow Lanka v2

Local extraction (no AI) • Supabase • Netlify

## Features
- Public job board + district/city/pay filters
- Post job: rough WhatsApp text → local extract → save
- Auth (email/password) – worker / employer / admin
- My Jobs, Admin panel (status + delete)
- WhatsApp contact buttons
- Mobile responsive, Sinhala support

## Local dev
```bash
npm install
npm run dev
```

## Deploy to Netlify
1. Push this folder to GitHub
2. Netlify → Add new site → Import from Git
3. Build command: `npm run build`
4. Publish directory: `dist`

Or drag the `dist` folder after `npm run build` to Netlify Drop.

## First admin
1. Sign up on the site
2. Supabase → Table Editor → `profiles` → set your row `role` = `admin`
