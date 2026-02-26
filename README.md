# Bitespeed Identity Reconciliation API

## 🚀 Overview

This service reconciles customer identities across multiple purchases using different email addresses and phone numbers. It consolidates linked contacts and returns a unified identity profile.

## 🛠 Tech Stack

* Node.js (ES6)
* Express.js
* PostgreSQL
* pg (node-postgres)

## 📌 Endpoint

### POST /identify

#### Request Body

```json
{
  "email": "string?",
  "phoneNumber": "string?"
}
```

At least one field must be provided.

#### Response Format

```json
{
  "contact": {
    "primaryContatctId": number,
    "emails": string[],
    "phoneNumbers": string[],
    "secondaryContactIds": number[]
  }
}
```

## 🧠 Logic

* If no existing contact → create primary
* If matching email/phone → link as secondary
* If two primaries match → older becomes primary, newer becomes secondary
* Returns consolidated identity cluster

## 🌐 Hosted API
https://identity-reconciliation-np0v.onrender.com/
## 👨‍💻 Author

Niranjan C B
