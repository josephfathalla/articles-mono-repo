# Deployment Guide

This folder contains the Docker Compose configuration for deploying the stack.

## Prerequisites

1.  **Server**: A Linux server with Docker and Docker Compose installed.
2.  **Domain**: Domains configured for your services (e.g., `api.example.com`, `app.example.com`, `www.example.com`).
3.  **GHCR Access**: The server needs to pull images from GitHub Container Registry.
    -   Create a Personal Access Token (PAT) on GitHub with `read:packages` scope.
    -   Run `echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin` on the server.

## Configuration

1.  Copy `docker-compose.yml` to your server.
2.  Create a `.env` file in the same directory with the following variables:

    ```env
    # GitHub Repository (owner/repo)
    GITHUB_REPOSITORY=your-username/my-better-t-app
    
    # Traefik ACME Email for Let's Encrypt
    ACME_EMAIL=your-email@example.com
    
    # Domains
    BACKEND_DOMAIN=api.example.com
    WEB_DOMAIN=app.example.com
    WEBSITE_DOMAIN=www.example.com
    
    # App Environment Variables
    DATABASE_URL=postgresql://...
    # Add other variables required by your apps
    ```

## Deploying

Run the following command to start the services:

```bash
docker-compose up -d
```

## Updates

Watchtower is configured to automatically pull new images and restart containers when a new image is pushed to the registry by the GitHub Action.

