# 😀 EmojiHub Finder

EmojiHub Finder is a simple web application that allows users to **search and explore emojis** using a public emoji API.
It is built using **HTML, CSS, and JavaScript** only—no frameworks required.

---

## 📁 Project Files

```
emojihub-Finder/
 ├── index.html   # Page structure and UI
 ├── style.css    # Design and layout
 └── script.js    # Logic and API handling
```

---

## ✨ Features

* Search emojis by name
* Filter emojis by category or group
* Display emojis in a responsive grid
* Show emoji details (name, category, group)
* Dark and light mode toggle
* Simple error handling when no results are found

---

## 🌐 API Used

**EmojiHub API**

* **Base URL:**

  ```
  https://emojihub.yurace.pro/api
  ```

* **Authentication:**
  ❌ No API key required

---

## ▶️ How to Run the Project

### Method 1: Open in Browser

1. Open the project folder
2. Double-click `index.html`
3. The app will open in your browser

---

### Method 2: Using a Local Server (Optional)

Using Python:

```bash
python -m http.server 8000
```

Then open:

```
http://localhost:8000/index.html
```

---

## 🧠 How to Use

Choose How to Find an Emoji

Click the Categories… dropdown and select one of the following:

Random – get a random emoji

Search by name – search using a keyword (e.g., cat, smile)

Filter by category – browse emojis by category

Filter by group – browse emojis by detailed group

2️⃣ Provide the Required Input

Depending on your selection:

Search by name → type a keyword

Filter by category → select a category

Filter by group → select a group

Random → no input needed

3️⃣ Fetch Emojis

Click the Fetch Emoji button to display emoji results.

4️⃣ Clear the Selection

Click Clear to reset inputs and start again.

5️⃣ Save Favorites (Optional)

Click the ⭐ icon on an emoji to save it to Favorites.

6️⃣ Switch Theme (Optional)

Click the 🌙 Dark button to toggle dark mode.

---

## ⌨️ Keyboard Support

* **Enter** → Search emojis
* **Escape** → Close pop-ups or clear focus

---

## 📱 Responsive Design

The application works on:

* Desktop ✔
* Tablet ✔
* Mobile ✔

---

## ⚙️ Technical Notes

* Uses `fetch()` with `async/await`
* DOM elements are updated dynamically
* Input is validated before searching
* No external libraries are used

---

## 🌍 Browser Compatibility

* Chrome / Edge ✅
* Firefox ✅
* Safari ✅

---

## 📜 License

This project is open source and may be used or modified for educational purposes.



