# Study Beats

Study Beats is a digital music platform designed to optimize and increase user productivity through soothing and optimizing music and sounds. Unlike Spotify, Study Beats focuses exclusively on providing music and sounds that enhance concentration and productivity.

## Features
- **Full-Screen Mode**
- **Password Login & Verification Based Sign Up**
- **Forgot Password**
- **Google Login & Sign Up**
- **Create and Edit Custom Playlists & Collections Clone**
- **History**
- **Advanced Search with Filters (All, Artists, Albums, Tracks)**
- **Account Editing Options**
- **User's Recent Activity-Based Recommendations on Home Page**
- **Link Copy Feature (Track, Album, Artist)**
- **Audio Controls (Play, Pause, Next, Previous)**
- **Light & Dark Mode**
- **Responsive Design**
- **Audio Playback Restricted to Authenticated Users**

## Prerequisites
Ensure you have installed all of the following on your development machine:

- [Node.js & npm](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Git](https://git-scm.com/)

## Technology Used
- **Frontend**: Vite, React.js, SCSS, Redux Toolkit
- **Backend**: Node.js, Express.js, MongoDB, JSON Web Token (JWT) Authentication
- **Languages**: JavaScript

## Environment Variables
To run this project, you will need to add the following environment variables to your `.env` file in the server directory:

`PORT` = `5000`

`MONGO_URL`

`SITE_URL`

`JWT_SECRET`

`MAIL_EMAIL`

`MAIL_SECRET`

To run this project, you will need to add the following environment variables to your .env.local file in client directory

VITE_GOOGLE_CLIENT` #Google login api client id

## Run Locally

Clone the project

```bash
  git clone https://github.com/ansonbenny/Music-Streamer
```

##To Start BackEnd

Go to the server directory

```bash
  cd Music-Streamer/server
```

Install dependencies

```bash
  npm install
```

Start

```bash
  npm start
```

##To Start FrontEnd

Go to the client directory

```bash
  cd Music-Streamer/client
```

Install dependencies

```bash
  npm install
```

Start

```bash
  npm run dev
```