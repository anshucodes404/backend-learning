# Chai aur Backend

A backend learning project inspired by Chai aur Code, built with Node.js, Express, and MongoDB.

## Technologies Used

- ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white&style=flat-square) **Node.js**: JavaScript runtime environment  
- ![Express.js](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white&style=flat-square) **Express.js**: Web framework for Node.js  
- ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white&style=flat-square) **MongoDB**: NoSQL database  
- ![Mongoose](https://img.shields.io/badge/Mongoose-880000?logo=mongoose&logoColor=white&style=flat-square) **Mongoose**: MongoDB object modeling for Node.js  
- ![dotenv](https://img.shields.io/badge/dotenv-8DD6F9?logo=dotenv&logoColor=white&style=flat-square) **dotenv**: Loads environment variables from `.env` file  
- ![body-parser](https://img.shields.io/badge/body--parser-4B8BBE?style=flat-square) **body-parser**: Middleware for parsing request bodies  
- ![CORS](https://img.shields.io/badge/CORS-00599C?style=flat-square) **CORS**: Middleware for enabling Cross-Origin Resource Sharing

## Project Structure

```
.
├── .env
├── .gitignore
├── package.json
├── public/
│   └── temp/
├── src/
│   ├── app.js
│   ├── constants.js
│   ├── index.js
│   ├── controllers/
│   ├── db/
│   │   └── index.js
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   └── utils/
```

## Getting Started

### 1. Clone the repository

```sh
git clone https://github.com/anshucodes404/chai-aur-backend.git
cd chai-aur-backend
```

### 2. Install dependencies

```sh
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory and add the following:

```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
```

### 4. Run the development server

```sh
npm run dev
```

The server will start on the port specified in your `.env` file.

## Scripts

- `npm run dev`: Starts the server in development mode with auto-reload.

## Author

[anshu kumar](https://github.com/anshucodes404)

## License

This project is licensed under the ISC License.