

```markdown
# PostGenix

PostGenix is an AI-powered platform that helps creators generate high-performing LinkedIn content.  
It analyzes profiles, understands tone, and generates optimized posts that increase reach and engagement.

---

## 🚀 Features

- AI-powered LinkedIn post generation
- Profile analysis for personalized content
- Multiple writing styles
- Content optimization for engagement
- Simple and clean dashboard
- Fast generation using modern AI models

---

## 🛠 Tech Stack

### Frontend
- React
- TailwindCSS
- Axios / Fetch
- Vite

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

### AI
- OpenAI API

---

## 📂 Project Structure

```

postgenix/
│
├── backend/           # Express server
│   ├── controllers
│   ├── routes
│   ├── config
│   ├── utils
│   ├── models
│   ├── middleware
│   ├── db.js
│   └── index.js
│
├── frontend/          # React application
│   ├── src
│   ├── public
│   └── index.html
│
└── README.md

```

---

## ⚙️ Installation

### 1. Clone the repository

```

git clone [https://github.com/gitking-han/postgenix.git](https://github.com/gitking-han/postgenix.git)

```

### 2. Navigate to the project

```

cd postgenix

```

### 3. Install backend dependencies

```

cd backend
npm install

```

### 4. Install frontend dependencies

```

cd ../frontend
npm install

```

---

## 🔑 Environment Variables

### Backend `.env`

Create a `.env` file inside the **backend** folder.

```

PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key

GOOGLE_CLIENT_ID=your_google_clientID
GOOGLE_CLIENT_SECRET=your_google_client_secret

LINKEDIN_CLIENT_ID=your_linkedin_clientID
LINKEDIN_CLIENT_SECRET=your_linkedin_clientSecret
LINKEDIN_REDIRECT_URI=your_linkedin_redirectURI

BASE_URL=[http://localhost:5000](http://localhost:5000)
FRONTEND_URL=[http://localhost:8080](http://localhost:8080)

EMAIL_USER=your_email
EMAIL_PASS=your_email_password

PADDLE_API_KEY=your_paddle_api_key
PADDLE_WEBHOOK_SECRET=your_paddle_webhook_secret

AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_SESSION_TOKEN=your_aws_session_token
AWS_REGION=us-east-1

```

---

### Frontend `.env`

Create a `.env` file inside the **frontend** folder.

```

VITE_API_URL=[http://localhost:5000](http://localhost:5000)
VITE_PADDLE_PRO_PRICE_ID=your_paddle_product_price
VITE_PADDLE_CLIENT_TOKEN=your_paddle_client_token

VITE_LINKEDIN_CLIENT_ID=your_linkedin_clientID
VITE_LINKEDIN_REDIRECT_URI=your_linkedin_redirect_uri

```

---

## ▶️ Running the Project

### Start Backend

```

cd backend
npm start

```

### Start Frontend

```

cd frontend
npm run dev

```

Frontend will run on:

```

[http://localhost:8080](http://localhost:8080)

```

Backend will run on:

```

[http://localhost:5000](http://localhost:5000)

```

---

## 📌 Future Improvements

- Content performance analytics
- Post scheduling
- AI hook generator
- Multi-platform support (Twitter, Instagram)

---

## 🤝 Contributing

Contributions are welcome.  
Feel free to open issues or submit pull requests.

---

## 📄 License

This project is licensed under the **MIT License**.

---

Built with ❤️ to help creators grow on LinkedIn.
```

---
