# Desre Birthday Website

A responsive birthday countdown, personal message, tribute page, photo gallery, and shared memory wall for Desre's birthday on **22 July 2026**.

## 1. Add your photographs

Place your images inside the `assets` folder using these exact filenames:

- `desre-hero.png`
- `memory-1.jpg`
- `memory-2.jpg`
- `memory-3.jpg`

You may use JPG, but keep each image reasonably compressed for fast loading.

## 2. Test the website

Because the site uses JavaScript modules, test it through a local web server rather than double-clicking `index.html`.

In the project folder, run:

```powershell
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## 3. Connect the shared memory wall with Firebase

GitHub Pages is static and cannot save visitor posts by itself. Firebase provides the database and image storage.

### Create the Firebase project

1. Go to Firebase Console and create a new project.
2. Add a **Web App** to the project.
3. Copy the configuration values into `firebase-config.js`.
4. In Firebase, open **Firestore Database** and create a database.
5. Open **Storage** and enable it.

### Firestore rules

In Firestore > Rules, use:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /memories/{memoryId} {
      allow read: if true;
      allow create: if
        request.resource.data.name is string &&
        request.resource.data.name.size() > 0 &&
        request.resource.data.name.size() <= 60 &&
        request.resource.data.message is string &&
        request.resource.data.message.size() > 0 &&
        request.resource.data.message.size() <= 800;
      allow update, delete: if false;
    }
  }
}
```

### Storage rules

In Storage > Rules, use:

```text
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /memory-photos/{fileName} {
      allow read: if true;
      allow write: if
        request.resource.size < 5 * 1024 * 1024 &&
        request.resource.contentType.matches('image/.*');
    }
  }
}
```

These rules let visitors add memories and images, but do not allow them to edit or delete existing posts.

> For a fully public launch, consider adding Firebase App Check or a simple approval workflow to reduce spam.

## 4. Publish to GitHub Pages

1. Create a new GitHub repository.
2. Upload all files and the `assets` folder.
3. Open the repository's **Settings**.
4. Choose **Pages**.
5. Under **Build and deployment**, select **Deploy from a branch**.
6. Select the `main` branch and `/root`.
7. Save.

GitHub will provide the live website address.

## 5. Connect the purchased domain

In GitHub Pages settings, enter the custom domain and save it.

At the domain provider, add the DNS records shown by GitHub. For a `www` address, this is normally a CNAME pointing to your GitHub Pages hostname. GitHub will then issue HTTPS automatically.

## Important date setting

The countdown is configured for:

```javascript
2026-07-22T00:00:00+02:00
```

This uses South African time.


## Monthly Letter Vault

The vault contains twelve letters. The birthday letter unlocks on 22 July 2026.
Each following letter unlocks automatically on the 22nd of the next month,
using the visitor's device date and time. The unlock dates are stored in
`index.html` in each vault card's `data-unlock` value.


## Final behaviour changes

- The full birthday letter is no longer shown on the homepage. It opens in a letter window.
- Monthly vault letters show no preview text and remain sealed until their unlock date.
- The default memory-wall message has been removed.
- The Celebrate Desre button appears only on 22 July 2026, using South African time.


## Permanent Supabase uploads

See `SUPABASE-SETUP.md` for the database, storage, PIN and email setup.


## Premium mobile and Supabase version

- Uses Supabase project `fkmssqbzfsqqonoghmmz`
- Permanent memory and photo uploads protected by PIN 2207
- Full-screen photo viewer
- Supabase-driven monthly letter vault
- Separate 22 July birthday letter
- Birthday-only surprise screen
- Email notification through the `upload-letter` Edge Function and Resend
- Responsive mobile layout


## Latest layout update

- Hero heading changed to `Desre`.
- Hero description replaced with Claudia's personal tribute.
- Static favourite-memory photo wall removed.
- Permanent Supabase photo uploader moved directly under `Our Memory Photos`.
- Letter Vault Admin moved to `/admin/`.


## Final production version

- Custom domain file included for `my-friend-des.co.za`
- Celebrate Desre button is created only on 22 July 2026 in South African time
- `/admin/` now requires PIN 2207 before the admin form is shown
- Permanent Supabase photo uploads remain available under Our Memory Photos
- Email notification target is `desreclaase@gmail.com`
