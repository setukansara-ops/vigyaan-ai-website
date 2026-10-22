# Put the Vigyaan signature into Zoho Mail

This is **your click**: it changes a Zoho account setting. Nothing here has been done
for you, and Zoho was not opened while preparing it. The menu names below follow
Zoho Mail's documented layout. If a label on your screen reads slightly
differently, the step is the same.

**Files in this folder**

| File | For mail sent as |
|---|---|
| `zoho-signature.html` | `setu@vigyaan.ai`, the mailbox (default) |
| `zoho-signature-aura.html` | `aura@vigyaan.ai`, the alias (xAI and Aura mail) |
| `signature-plain.txt` / `signature-plain-aura.txt` | The Zoho mobile app, or any plain-text field |
| `preview.png` | What the result should look like |

**The logo** is a hosted PNG:

`https://vigyaan.ai/brand/v1.0/exports/email/sig-lockup-light@2x.png`

It exists only once the website serves the kit (website PR #23, merged and deployed).
- **Set the signature only after that address opens in a browser** and shows the tile
  and "Vigyaan" on white.
- Before then, the address returns "not found". A signature set early shows a broken
  image, not a clean word: in a plain viewer, a bordered empty frame with a blue
  underlined "Vigyaan" link above the text lines.
- Never point the signature at any other copy of the logo.

---

## A. On the web (mail.zoho.com), about 5 minutes

1. Sign in at <https://mail.zoho.com> as **setu@vigyaan.ai**.
2. Click the **Settings** gear at the top right. Then click **All settings** if Zoho
   shows that link.
3. In the settings list, open **Signature** (in some versions **Signatures**, under
   *Mail* or *Compose*).
4. Click **+ Add Signature** (or **New Signature**). Name it **Vigyaan – setu@**.
5. In the signature editor's toolbar, click **Insert HTML**. It is the `</>` icon. If
   you can't see it, it sits behind the toolbar's **⋯ / More** button.
   1. Open `C:\Project\Vigyaan\Brand\v1.0\signature\zoho-signature.html` in Notepad.
   2. Copy everything **from `<table` to the final `</table>`**. Skip the comment at
      the top.
   3. Paste it into the Insert HTML box and click **Insert**.
6. The editor should now show the logo, then **Setu Kansara** / *Founder, Vigyaan LLC*
   / setu@vigyaan.ai · vigyaan.ai / Aura · Attars. Click **Save**.
7. **Connect it to the address.** On the same Signature page, find the setting that
   links a signature to a From address. Zoho calls it *Associate with* or
   *Signature for*, listed per address.
   - Next to **setu@vigyaan.ai**, choose **Vigyaan – setu@** for **New mail** and for
     **Replies / Forwards**.
   - If Zoho asks where to place it, choose **Above the quoted text**.
8. Repeat steps 4–7 for the alias:
   - Name it **Vigyaan – aura@**.
   - Use `zoho-signature-aura.html`.
   - Associate it with **aura@vigyaan.ai**.

   Zoho then swaps the signature when you pick aura@ as the From address.
9. **Test it.**
   - Compose from setu@ to your own personal address and look at it on the phone and the
     desktop.
   - Then switch From to aura@ and check that the signature changes.

**If Insert HTML is missing:**
1. Use **Insert image** and choose **From URL**. Paste the logo URL above (or upload
   `..\exports\email\sig-lockup-light@2x.png`).
2. Set the image to **192 × 56**. It is a 2× image, so never show it at its full
   384 × 112.
3. Link the image to `https://vigyaan.ai`.
4. Type the four lines of `signature-plain.txt` under it. Make *Setu Kansara* bold.

## B. Zoho Mail mobile app (iPhone / Android)

The app keeps its own signature, separate from the web one, and it is **text only**.
- Open the app's menu → **Settings** → tap the account (**setu@vigyaan.ai**) →
  **Signature**.
- Turn it on and paste the text of `signature-plain.txt`.
- If the app lists aliases separately, use `signature-plain-aura.txt` for aura@.

## C. Optional: the organisation logo (Zoho Admin Console)

This logo shows in your Zoho webmail header, not in sent mail.
1. Open <https://mailadmin.zoho.com>.
2. Go to **Organization** (or **Branding**) → **Logo**.
3. Upload `C:\Project\Vigyaan\Brand\v1.0\exports\icons\logo-512.png`, the tile.

## Notes

- **Outlook and some corporate mail** block remote images until the reader clicks
  "download pictures". Until then they see the alt text "Vigyaan". This is normal and
  the same for every hosted signature logo.
- **Dark-mode mail apps:** the logo PNG has an opaque white background on purpose, so
  the ink word never lands on black.
- **Changing the signature later:** the text lines are yours to edit freely. The logo
  is not: keep the v1.0 URL. See the change policy in `../BRAND.md`.
