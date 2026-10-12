# TeamPink submission service

The page lives at `/teampink`. Contact details are posted to `/api/teampink-order`, which validates them and forwards them to a private Google Apps Script service. Orders go to the `Orders` tab in the TeamPink sheet owned by jackdee.sync@gmail.com. Notifications go to jackdee@att.net.

## One-time Google setup

1. Sign into Google as **jackdee.sync@gmail.com** and open https://script.google.com/home/start.
2. Create a project named **TeamPink Orders**. Replace the default code with the prepared **TeamPink-Setup.gs** file. That file contains a private server secret: keep it out of GitHub and do not share it.
3. Select **setup** from the function dropdown and click **Run**. Authorize access to the spreadsheet, email sending, and the notification retry trigger. The script only sends notifications to jackdee@att.net.
4. Click **Deploy → New deployment → Web app**. Set **Execute as: Me** and **Who has access: Anyone**, then deploy.
5. Send the resulting **Web app URL** ending in `/exec` back to Codex. It will be stored as `TEAMPINK_SCRIPT_URL` on Vercel, then the site will be redeployed and tested.

The private secret is already configured as `TEAMPINK_SECRET` on Vercel. The public endpoint does not grant access to the sheet; every accepted request must have that secret. The spreadsheet is kept private. Duplicate retries with the same order reference do not create another row. Saved orders whose email fails stay Pending for a scheduled retry. Apps Script and Gmail daily quotas still apply.

The form reports a setup message until the service URL is configured; it never claims an order has been saved without a confirmed sheet write.
