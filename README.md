# Smart Energy Saving

Welcome to Nokia Summer Practice 2026. This is the project starting point, from which you will start your work.

## Tech Stack

### Backend

- Python 3 ([download](https://www.python.org/downloads/)) ([docs](https://docs.python.org/3/))
- Flask ([docs](https://flask.palletsprojects.com/en/stable/))
- Mongo DB ([download](https://www.mongodb.com/try/download/community))

### Frontend

- React - web framework ([learn](https://react.dev/learn)) ([docs](https://react.dev/reference/react))
- Vite - bundler and build system ([guide](https://vite.dev/guide/))
- Material UI - UI/UX framework ([docs](https://mui.com/material-ui/getting-started/))

### Tests

- Robot Framework ([docs](https://docs.robotframework.org/))
- RF Browser Library ([docs](https://robotframework-browser.org/))

## Get Started

### Prerequisites

- Install Python 3.10 or newer
- Install Node.js v22 or newer
- Install Mongo DB Community server

### Backend

Install dependencies:

```sh
$ cd backend
$ python -m venv venv
$ source venv/bin/activate # Windows: venv/Scripts/activate
$ pip install -r requirements.txt
```

Start the backend:

```sh
$ flask run --debug

Default development user 'admin' created.
 * Debug mode: on
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on http://127.0.0.1:5000
```

### Frontend

Install dependencies:

```sh
$ npm install
```

Start the frontend:

```sh
$ npm run dev

> frontend@0.0.0 dev
> vite


  VITE v5.2.7  ready in 484 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Tests

Install Robot Framework and Browser Library:

```sh
$ pip install robotframework robotframework-browser
$ rfbrowser init
```

### Results

- The backend has started a server on [http://localhost:5000](http://localhost:5000).
- The frontend has started a server on [http://localhost:5173](http://localhost:5173). **Open this in your browser.**
- On application startup, **only if running in development mode** a test user `admin:testuser` will be created. Log in with username `admin` and password `testuser`. If the user already exists, it will not be overwritten.
