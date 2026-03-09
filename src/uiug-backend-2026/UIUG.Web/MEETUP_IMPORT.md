# Meetup import

## Required: Events, Speakers, Attendees containers

The import looks for **three container nodes** in the content tree whose document type aliases are **`events`**, **`speakers`**, and **`attendees`**. They can be:

- **Direct children of the content root**, or  
- **Children of a root node** (e.g. under “Home”).

If any are missing, the API returns an error like:  
`Content node with content type 'events' not found. Create an Events container under the root.`

**In Umbraco Backoffice:**

1. Go to **Content**.
2. At the **root** (or under your home page), create three nodes:
   - One with document type **Events** (alias: `events`).
   - One with document type **Speakers** (alias: `speakers`).
   - One with document type **Attendees** (alias: `attendees`).

Then run **POST /api/import/meetup** again.

## Paths (appsettings)

Set in `appsettings.json` or `appsettings.Development.json` under `MeetupImport`:

| Setting | Example | Notes |
|--------|---------|------|
| **EventsJsonPath** | `C:\Data\MeetupScraper\meetup-events.json` or `/home/you/MeetupScraper/meetup-events.json` | Full path to the JSON file. Relative paths are resolved from the app’s current working directory (e.g. `./MeetupScraper/meetup-events.json` if you run from the repo root). |
| **ImagesFolderPath** | `C:\Data\MeetupScraper\images` or `/home/you/MeetupScraper/images` | Full path to the folder that contains speaker/attendee images. Image filenames in the JSON are looked up inside this folder. |
| **ImportApiKey** | Leave empty in Development, or set a secret string in Production | See “Why the API key” below. |
| **ImportUserId** | Omit or `0` (system user per [Umbraco docs](https://docs.umbraco.com)); or e.g. `1` | Backoffice user ID used when publishing. If you get “No user found with the specified id”, set this to a valid backoffice user ID (e.g. `1`). |

**Examples**

- **Windows (absolute):**  
  `"EventsJsonPath": "D:\\MeetupScraper\\meetup-events.json"`  
  `"ImagesFolderPath": "D:\\MeetupScraper\\images"`

- **Linux/macOS (absolute):**  
  `"EventsJsonPath": "/home/afreed/MeetupScraper/meetup-events.json"`  
  `"ImagesFolderPath": "/home/afreed/MeetupScraper/images"`

- **Relative to the process working directory:**  
  If you run from the solution root and have `MeetupScraper/` there:  
  `"EventsJsonPath": "MeetupScraper/meetup-events.json"`  
  `"ImagesFolderPath": "MeetupScraper/images"`

## Why the API key

The import endpoint **POST /api/import/meetup** creates and changes content in Umbraco. If it were open to the internet without protection, anyone could trigger it and fill your site with data.

- **ImportApiKey empty**
  - **Development:** The endpoint is allowed (no header required).
  - **Production:** The endpoint returns **403** and does nothing, so import is effectively disabled.
- **ImportApiKey set** (e.g. to a long random string)
  - Every request to **POST /api/import/meetup** must send header **X-Import-Key** with that same value; otherwise the request is **401 Unauthorized**.

So: use no key in Development for convenience; set a secret key in Production and send it in the header when you run the import (e.g. from a script or CI).

## Calling the endpoint

**Development (no key):**
```bash
curl -X POST https://localhost:44392/api/import/meetup -k
```

**Production (with key):**
```bash
curl -X POST https://your-site.com/api/import/meetup -H "X-Import-Key: YOUR_SECRET_KEY"
```

Replace `YOUR_SECRET_KEY` with the same value as in `MeetupImport:ImportApiKey`.
