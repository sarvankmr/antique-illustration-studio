# Deploy checklist

1. Upload the contents of this folder to a **new GitHub repository**.
2. Import that repository in **Vercel → Add New → Project**.
3. Set these **private** environment variables in Vercel project settings:
   - `OPENAI_API_KEY` = your API credential
   - `STUDIO_ACCESS_CODE` = a private long access passphrase
   - `SESSION_SECRET` = a second, independent random secret (32+ characters)
   - `OPENAI_IMAGE_MODEL` = `gpt-image-2.6-sunburst` (optional)
4. Deploy, then use **Unlock generation** with the access code.
5. Generate one illustration at a time and download the print-ready plate as PNG. Use **Export collection ZIP** to back up your gallery.

The app cannot generate new images until the API key and private code are added. The gallery still contains the starter Bird, Fish, and Botanical reference artwork before configuration.

**Important:** Browser-only storage means images do not sync between devices. Do not share your studio code publicly. See README.md for full security notes and commands.
