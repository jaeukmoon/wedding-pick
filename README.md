# wedding-pick

Private wedding-studio sample gallery for two people. All photos are AES-256-GCM
encrypted (`enc/*.bin`, `data.bin`); the page decrypts them in-browser after a
password is entered. Without the password the repository contains no readable
images or metadata.

Re-encrypt (after changing photos or the password):

```
node tools/encrypt.mjs <password>
```

`tmp_meta.json` (local photo paths + dimensions) is generated locally and not committed.
