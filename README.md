# TailorCraft Academy landing page

This is a marketing-style website for a tailoring course. It includes:

- A hero section and course highlights
- Visitor tracking data collection
- A lead form that stores entries locally or in Google Sheets

## Run locally

Open the project folder in a browser or use a local server:

```bash
cd /Users/aswin-16889/Documents/personal/tailoring
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Deploy to Netlify

1. Push this folder to GitHub.
2. Go to https://app.netlify.com
3. Click Add new site → Import from Git
4. Select your GitHub repo
5. Keep the build settings as-is
6. Publish the site

This project already includes a `netlify.toml` file for static hosting.

## Deploy to GitHub Pages

1. Push the folder to a GitHub repo
2. Open the repo settings
3. Go to Pages
4. Select the main branch
5. Save and wait for deployment

Your site will be available at:

```text
https://your-username.github.io/your-repo-name
```

## Send leads to Google

1. Open Google Sheets and create a new spreadsheet.
2. Name the first sheet `Leads`.
3. Create a Google Apps Script project linked to that spreadsheet.
4. Paste this code into `Code.gs` and save it.
5. Deploy as a Web App with "Anyone" access.
6. Copy the Web App URL and replace `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` in `script.js`.

### Apps Script example

```javascript
function doGet() {
  return ContentService.createTextOutput('TailorCraft Academy lead form is active.');
}

function doPost(e) {
  const payload = JSON.parse(e.postData.contents || '{}');
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads');

  if (!sheet) {
    SpreadsheetApp.getActiveSpreadsheet().insertSheet('Leads');
  }

  const row = [
    new Date(),
    payload.name || '',
    payload.email || '',
    payload.phone || '',
    payload.city || '',
    payload.interest || '',
    payload.message || '',
    JSON.stringify(payload.visitorInfo || {}),
    payload.page || ''
  ];

  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads').appendRow(row);

  return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
}
```

## Notes

- The page automatically captures visitor information such as referrer, browser language, timezone, and UTM parameters.
- If no Google Apps Script URL is set, the entry is saved in browser localStorage for testing.
