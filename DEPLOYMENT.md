# Deployment Guide

This guide covers deploying justB to various hosting platforms.

## Deployment Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production` in environment variables
- [ ] Use production MongoDB database (not local)
- [ ] Switch to Stripe live keys (`sk_live_` and `pk_live_`)
- [ ] Set a strong `JWT_SECRET`
- [ ] Configure proper domain for `CLIENT_URL`
- [ ] Set up SSL/HTTPS
- [ ] Configure email service for notifications
- [ ] Set up monitoring and logging
- [ ] Configure automated backups

## Option 1: Heroku (Easiest)

### Prerequisites
- Heroku account (free tier available)
- Heroku CLI installed

### Steps

1. **Install Heroku CLI**
```bash
# Mac
brew tap heroku/brew && brew install heroku

# Windows/Linux: Download from https://devcenter.heroku.com/articles/heroku-cli
```

2. **Login to Heroku**
```bash
heroku login
```

3. **Create Heroku App**
```bash
heroku create your-app-name
```

4. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-secret
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set STRIPE_SECRET_KEY=sk_live_xxxxx
heroku config:set STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
heroku config:set CLIENT_URL=https://your-app-name.herokuapp.com
```

5. **Deploy**
```bash
git init
git add .
git commit -m "Initial deployment"
git push heroku main
```

6. **Open Your App**
```bash
heroku open
```

### MongoDB on Heroku

Use MongoDB Atlas (free tier available):
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Set as MONGODB_URI on Heroku

## Option 2: DigitalOcean App Platform

### Steps

1. **Create Account**
   - Sign up at https://www.digitalocean.com

2. **Create App**
   - Click "Create" → "Apps"
   - Connect your GitHub repository
   - Or upload code directly

3. **Configure Build**
   - Build Command: `npm install`
   - Run Command: `npm start`

4. **Set Environment Variables**
   - Add all variables from `.env`
   - Switch to production values

5. **Configure Database**
   - Add MongoDB database from DigitalOcean
   - Or use external MongoDB Atlas

6. **Deploy**
   - Click "Deploy"
   - App will be available at: `your-app.ondigitalocean.app`

### Pricing
- Basic plan: $5/month
- Includes 512MB RAM, 1 vCPU

## Option 3: AWS (EC2)

### Prerequisites
- AWS account
- Basic knowledge of Linux/SSH

### Steps

1. **Launch EC2 Instance**
   - Choose Ubuntu 22.04 LTS
   - Instance type: t2.micro (free tier)
   - Configure security group:
     - SSH (22) - Your IP
     - HTTP (80) - Anywhere
     - HTTPS (443) - Anywhere
     - Custom TCP (3000) - Anywhere

2. **Connect to Instance**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

3. **Install Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

4. **Upload Your Code**
```bash
# On your local machine
scp -i your-key.pem -r ./* ubuntu@your-ec2-ip:~/justb/
```

Or use Git:
```bash
# On EC2 instance
git clone your-repository-url
cd justb
npm install
```

5. **Configure Environment**
```bash
# Create .env file
nano .env
# Add your production environment variables
```

6. **Start Application with PM2**
```bash
pm2 start server/index.js --name justb
pm2 save
pm2 startup
```

7. **Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/justb
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/justb /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

8. **Set Up SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Option 4: Vercel (Frontend Only)

If you want to separate frontend and backend:

### Backend (Railway/Render)
Deploy backend separately to Railway or Render

### Frontend (Vercel)
1. Remove server code
2. Deploy to Vercel
3. Configure API_URL to point to backend

## Option 5: Docker

### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/justb
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:6
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

### Deploy
```bash
docker-compose up -d
```

## Post-Deployment

### 1. Set Up Monitoring

**Option A: PM2 Monitoring**
```bash
pm2 install pm2-logrotate
pm2 logs
```

**Option B: External Services**
- New Relic: https://newrelic.com
- Datadog: https://www.datadog.com
- Sentry: https://sentry.io

### 2. Set Up Backups

**MongoDB Backups:**
```bash
# Automated daily backup
crontab -e

# Add:
0 2 * * * mongodump --uri="your-mongodb-uri" --out=/backups/$(date +\%Y-\%m-\%d)
```

**Or use MongoDB Atlas automated backups**

### 3. Configure Domain

1. Buy domain (Namecheap, Google Domains, etc.)
2. Point DNS to your server IP
3. Wait for DNS propagation (up to 48 hours)
4. Set up SSL certificate

### 4. Set Up Email Notifications

**Using SendGrid:**
```bash
npm install @sendgrid/mail
```

Add to your code:
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Send booking confirmation
await sgMail.send({
  to: user.email,
  from: 'noreply@yourapp.com',
  subject: 'Booking Confirmed',
  html: '<strong>Your breakfast is confirmed!</strong>'
});
```

### 5. Performance Optimization

**Enable Gzip Compression:**
```javascript
const compression = require('compression');
app.use(compression());
```

**Add Caching:**
```javascript
app.use(express.static('client', {
  maxAge: '1d'
}));
```

**Database Indexing:**
Already included in models, but verify:
```javascript
// In MongoDB
db.providers.createIndex({ "address.coordinates": "2dsphere" });
db.bookings.createIndex({ userId: 1, createdAt: -1 });
```

## Troubleshooting Production Issues

### Check Logs

**Heroku:**
```bash
heroku logs --tail
```

**PM2:**
```bash
pm2 logs
```

**Docker:**
```bash
docker-compose logs -f
```

### Common Issues

**App crashes on startup:**
- Check environment variables
- Verify MongoDB connection
- Check Node.js version

**Payments not working:**
- Verify Stripe live keys
- Check webhook endpoint
- Review Stripe dashboard logs

**Database connection fails:**
- Check MongoDB Atlas IP whitelist
- Verify connection string
- Check database user permissions

## Scaling

### Horizontal Scaling

**Load Balancer + Multiple Instances:**
1. Deploy multiple instances
2. Use Nginx/HAProxy as load balancer
3. Use Redis for session storage

### Vertical Scaling

**Upgrade Server Resources:**
- More RAM
- More CPU cores
- Faster storage (SSD)

### Database Scaling

**MongoDB Atlas:**
- Upgrade cluster tier
- Enable auto-scaling
- Add read replicas

## Security Best Practices

1. **Keep Dependencies Updated**
```bash
npm audit
npm audit fix
```

2. **Rate Limiting**
```bash
npm install express-rate-limit
```

3. **Helmet for Security Headers**
```bash
npm install helmet
```

4. **Environment Variables**
- Never commit `.env` file
- Use secrets manager in production

5. **Input Validation**
- Already included with express-validator
- Review all user inputs

6. **Regular Backups**
- Automated daily backups
- Test restore procedures

## Monitoring Checklist

- [ ] Server uptime monitoring
- [ ] Error tracking
- [ ] Performance monitoring
- [ ] Database metrics
- [ ] Payment transaction logs
- [ ] User activity logs

## Cost Estimation

### Free/Low-Cost Setup
- Heroku Free Tier: $0 (limited hours)
- MongoDB Atlas Free: $0 (512MB)
- Stripe: Pay per transaction
- **Total: ~$0-5/month**

### Small Business
- DigitalOcean Droplet: $12/month
- MongoDB Atlas M10: $57/month
- Domain: $12/year
- **Total: ~$70/month**

### Growing Business
- Multiple servers: $100/month
- MongoDB Atlas M30: $200/month
- CDN: $20/month
- **Total: ~$320/month**

## Support Resources

- Heroku Docs: https://devcenter.heroku.com
- DigitalOcean Docs: https://docs.digitalocean.com
- AWS Docs: https://docs.aws.amazon.com
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- Stripe Docs: https://stripe.com/docs

Good luck with your deployment!
