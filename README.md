# E-Learning Platform

Welcome to the E-Learning Platform repository! This project is designed to provide a comprehensive and user-friendly platform for online education. Whether you are a student looking for courses or an instructor wanting to create and manage content, my platform aims to cater to your e-learning needs.

## Features

- **User-friendly Interface**: An intuitive interface designed for a seamless learning experience.
- **Courses and Modules**: Easily create, manage, and enroll in courses and modules.
- **Multimedia Content**: Support for diverse content types, including videos, documents.
- **Scalable Architecture**: Built with scalability in mind, ensuring a smooth experience as the platform grows.
- **Testable Code**: Prioritizing testability to ensure robust and maintainable code.

## Architecture Diagram

![Diagram](./architecture.png)

## Get started

To get started with the project locally, follow the instructions

1- First clone repository
```
git clone https://github.com/amgadfikry/e-learning-platform.git
```
2- Choose mode you want to start with by change this line in docker compose file in main directory

	- test for testing server mode
	- dev for develpomental mode
	- prod for production mode
```
 environment:
      - NODE_ENV=[mode]
```
3- Start Docker compose file by run this command if you do not have docker and docker-compose  install it from official website
```
docker-compose up -d
```
4- Start you app in browser useing link
```
http://localhost:5173
```
5- If you want look on server logs and watch it use
```
docker-compose logs -f client server
```
6- After finish you can destroy you container by
```
docker-compose down
```

## License

This project is licensed under the [MIT License](./LICENSE). Feel free to use, modify, and distribute the code as per the terms of the license.

Thank you for your interest in our E-Learning Platform!
