# 💰 Budget Planner - Frontend Client

This is the React + Vite frontend client for the Budget Planner Application.

## 🚀 Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm

### Installation

1. Install frontend dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:8888`.

---

## 🛠️ GitHub Actions Deployment Workflow

A CI/CD deployment pipeline has been configured to build and deploy the frontend static assets automatically upon pushing to the `main` or `master` branches.

The workflow file is located at:
`.github/workflows/deploy.yml`

### 1. Configure GitHub Secrets

To make the deploy pipeline function, navigate to your repository's **Settings > Secrets and variables > Actions** and add the following repository secrets:

| Secret Name | Description |
| :--- | :--- |
| `DROPLET_SSH_KEY` | The private SSH key used to connect to your DigitalOcean Droplet. |
| `DROPLET_IP` | The IP address of your DigitalOcean Droplet. |
| `DROPLET_USER` | The user name to SSH into the Droplet (e.g. `root` or a deployment user). |
| `VITE_API_URL` | *(Optional)* The production API URL if required during compilation. |

### 2. Configure Nginx on the Droplet

To serve the React SPA and proxy backend API calls correctly on your DigitalOcean droplet, configure your Nginx block as follows:

Create or update `/etc/nginx/sites-available/budget-planner`:

```nginx
server {
    listen 80;
    server_name your-domain.com; # Or your Droplet's IP address

    root /var/www/budget-planner;
    index index.html;

    # Serve static assets and handle React routing (try_files prevents 404 on reload)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to the backend server (running on port 3001)
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the configuration and reload Nginx:
```bash
sudo ln -sf /etc/nginx/sites-available/budget-planner /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```
