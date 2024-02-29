# E-Learning Platform

Welcome to the E-Learning Platform repository! This project is designed to provide a comprehensive and user-friendly platform for online education. Whether you are a student looking for courses or an instructor wanting to create and manage content, my platform aims to cater to your e-learning needs.

## ## Features

- **User-friendly Interface**: An intuitive interface designed for a seamless learning experience.
- **Courses and Modules**: Easily create, manage, and enroll in courses and modules.
- **Multimedia Content**: Support for diverse content types, including videos, documents.
- **Scalable Architecture**: Built with scalability in mind, ensuring a smooth experience as the platform grows.
- - **Testable Code**: Prioritizing testability to ensure robust and maintainable code.

## Architecture Diagram

```mermaid
graph TD
  subgraph Server-Side-Container
    C[Express.js] -->|Connects to| D[MongoDB]
    C -->|Connects to| E[Redis]
    C -->|Connects to| F[Oracle Object Storage]
  end
  subgraph Client-Side
    A[React App] -->|Styled with| B[Tailwind CSS]
    A -->|Send Request| C
  end
  subgraph MongoDB-Container
    D -->|Stores Data| G[MongoDB]
  end
  subgraph Cloud-Storage
    F -->|Stores Files| I[Oracle Object Storage]
  end
  subgraph Redis-Container
    E -->|Caches Data| H[Redis]
  end
  subgraph Docker
    J[Docker compose] --> A
    J --> C
    J --> G
    J --> H
  end
  ```

## License

This project is licensed under the [MIT License](./LICENSE). Feel free to use, modify, and distribute the code as per the terms of the license.

Thank you for your interest in our E-Learning Platform!
