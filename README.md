# YouTube Backend Development

## Overview
This project is a complex backend system designed to handle robust data operations and secure authentication processes. Built using Node.js and Express.js, it leverages a MongoDB database managed through Mongoose for seamless data interactions. Security is enhanced using JWT (JSON Web Tokens) for authentication and bcrypt for password hashing. Additionally, Cloudinary is integrated for media storage and management, and Multer is used for handling multipart/form-data, primarily for file uploads.

## Data Model: 

[Data Model for Youtube Backend](https://app.eraser.io/workspace/FbWgxyVgP50fLAxkG2Ce)

![image](https://github.com/user-attachments/assets/a2199edb-353b-4aab-ba86-0456ae57b269)


## Features

- RESTful API architecture.
- Secure user authentication and authorization.
- Data validation and error handling.
- Scalable and maintainable code structure.
- Media Storage through Multer and Cloudinary services.

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository_url>
   cd <project_directory>
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Set up environment variables** Create a `.env` file in the root directory and add the necessary configurations:
   ```env
PORT=8000
MONGODB_URI=
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
   ```
4. **Run the server**
   ```bash
   npm start
   ```
   The server should now be running on `http://localhost:3000`.

## Usage

- Use tools like **Postman** to test API endpoints.
- Ensure **MongoDB** is running locally or use a cloud-hosted solution.
- Securely manage sensitive data using environment variables.

## Contact

For any questions or suggestions, feel free to reach out!

---

Happy coding! 🚀

