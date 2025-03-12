# Stramatel Next.js Application

A digital signage application for managing playlists, temperature monitoring, and accident tracking, built with Next.js.

## Features

- User authentication
- Playlist management (create, edit, delete)
- Media upload and management
- Temperature display from I2C sensor
- Accident tracking and statistics
- Real-time data updates via WebSocket
- Dark/light theme support
- Settings management including standby hours

## Technology Stack

- **Frontend**: Next.js 14 with App Router, React, Material UI
- **State Management**: Zustand
- **Backend**: Next.js API Routes
- **Database**: Prisma with SQLite
- **Real-time Updates**: WebSocket
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
stramatel-nextjs/
├── .env                      # Environment variables
├── prisma/                   # Prisma ORM
├── public/                   # Static files
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API Routes
│   │   ├── dashboard/        # Dashboard page
│   │   ├── login/            # Login page
│   │   ├── settings/         # Settings page
│   │   └── preview/          # Preview page
│   ├── components/           # Shared components
│   ├── features/             # Feature-based components
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Shared libraries
│   ├── stores/               # Zustand stores
│   └── styles/               # Styles
└── services/                 # Background services
```

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- npm or yarn
- Raspberry Pi with I2C enabled (for temperature monitoring)

### Installation

1. Clone this repository
   ```
   git clone https://github.com/yourusername/stramatel-nextjs.git
   cd stramatel-nextjs
   ```

2. Install dependencies
   ```
   npm install
   # or
   yarn install
   ```

3. Copy environment example file and modify as needed
   ```
   cp .env.example .env
   ```

4. Generate Prisma client and run migrations
   ```
   npx prisma generate
   npx prisma migrate dev
   ```

5. Start the development server
   ```
   npm run dev
   # or
   yarn dev
   ```

6. Start the WebSocket server
   ```
   node services/websocketServer.js
   ```

7. For temperature monitoring (on Raspberry Pi)
   ```
   node services/temperatureService.js
   ```

## Deployment

For production deployment, build the application:

```
npm run build
npm start
# or
yarn build
yarn start
```

For the temperature service, create a system service:

```
sudo nano /etc/systemd/system/temperature.service
```

Add configuration:

```
[Unit]
Description=Temperature Monitoring Service

[Service]
WorkingDirectory=/path/to/app
ExecStart=/usr/bin/node /path/to/app/services/temperatureService.js
User=youruser
Group=yourgroup
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```
sudo systemctl enable temperature.service
sudo systemctl start temperature.service
```

## License

This project is licensed under the MIT License.