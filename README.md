<div align="center">
  <img src="web/src/assets/Logo transparent.png" alt="Spatial Ring Logo" width="96"/>

  # 🪐 Spatial Ring

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Made with React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Powered by Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![Powered by Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat&logo=Prisma&logoColor=white)](https://www.prisma.io/)

A ~~modern~~ simple inventory management system with spatial organization capabilities. Inspired by fantasy series where "spatial rings" create pocket dimensions for storing items.
</div>

## 🌟 Overview

Spatial Ring is a full-stack inventory management application built with:

- 🔒 **API**: Express.js + Prisma ORM with PostgreSQL
- 🎨 **Web**: React + Vite with modern UI components
- 🔐 **Security**: JWT authentication, bcrypt password hashing
- 🐳 **Infrastructure**: Dockerized PostgreSQL database

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS version)
- Docker Desktop
- Visual Studio Code (recommended)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/pedjamusic/spatial-ring.git
cd spatial-ring
```

2. Start PostgreSQL with Docker:

```bash
docker run -d \
  --name pg-local \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=app \
  -p 5432:5432 \
  -v pg:/var/lib/postgresql/data \
  postgres
```

3. Set up the API:

```bash
cd api
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

4. Set up the web interface:

```bash
cd web
npm install
cp .env.example .env
npm run dev
```

## 📖 Documentation

- [Project Overview](docs/OVERVIEW.md)
- [Docker Deployment](docs/DEPLOY.md)
- [Coolify Deployment](docs/COOLIFY.md)
- [UI Configuration](docs/UI-CONFIG.md)

## 📦 Project Structure

```bash
spatial-ring/
├── api/                # Backend API
│   ├── prisma/        # Database schema and migrations
│   ├── src/           # API source code
│   └── test/          # API tests
├── web/               # Frontend application
│   ├── public/        # Static assets
│   └── src/           # React components and logic
├── docker/            # Docker config (nginx, supervisor, entrypoint)
├── docs/              # Guides and documentation
└── mobile/            # Mobile app (future development)
```

## 🛠️ Development

Start all services in development mode:

```bash
npm run dev
```

This will concurrently run:

- API server on <http://localhost:3000>
- Web interface on <http://localhost:5173>
- Prisma Studio on <http://localhost:5555> (optional, run with `npm run db`)

## 🧪 Testing

```bash
# Run API tests
cd api
npm test

# Run web tests
cd web
npm test
```

## 📚 API Documentation

The API provides endpoints for:

- User authentication
- Asset management
- Category organization
- Warehouse locations
- Movement tracking
- Event management

For detailed API documentation, run the development server and visit `/api/docs`.

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS and Helmet security middleware
- Input validation and sanitization
- OWASP security best practices

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

ISC License - see the [LICENSE](LICENSE) file for details.
