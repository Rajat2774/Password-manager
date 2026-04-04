# 🔐 Lockyt Extension — Privacy Policy

**Last updated:** April 2026

---

## 📌 Overview

Lockyt is a privacy-first password manager designed to securely store and manage your credentials. We are committed to protecting your data and ensuring complete transparency in how it is handled.

---

## 📊 What Data We Collect

Lockyt collects only the minimum data required to function:

* Your **email address** for authentication via Firebase Authentication
* Your **master password is never stored or transmitted**

  * It is processed locally on your device to derive a cryptographic key

---

## 🚫 What Data We Do NOT Collect

Lockyt does **not** collect or track:

* Browsing history
* Websites you visit
* Page content
* Keystrokes or typing behavior
* Mouse movements or activity data

The extension only reads login form fields **at the moment of autofill** and does not store or retain that information.

---

## 🔒 How Your Vault Data Is Stored

* All sensitive data (passwords, card details, notes) is encrypted **on your device**
* Encryption standard: **AES-256-GCM**
* Only encrypted data (ciphertext) is stored in Firebase Firestore

👉 Lockyt cannot read or access your vault data (**zero-knowledge architecture**)

---

## 🔗 Third-Party Services

### Firebase (Google)

* Used for authentication and secure data storage
* Firebase privacy policy:
  https://firebase.google.com/support/privacy

---

### Have I Been Pwned (HIBP)

* Used for breach detection
* Only the **first 5 characters of a SHA-1 hash** of your password are sent
* Your actual password is **never transmitted**

---

## 🤝 Data Sharing

* Lockyt does **not sell, rent, or share** your personal data
* Data is only used for core functionality and stored securely via Firebase

---

## 🗑️ Data Deletion

You can delete your account and all associated data at any time:

**Path:**
`Settings → My Account → Delete Account`

---

## 📬 Contact

For any privacy-related questions or concerns:

📧 [rajatsingh2774@gmail.com](mailto:rajatsingh2774@gmail.com)

---

## 🔐 Security Commitment

Lockyt follows a **privacy-first, zero-knowledge architecture**, ensuring that only you have access to your sensitive data.
