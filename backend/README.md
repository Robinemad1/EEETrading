# EEETrading Online System

Express EJS and Node JS Application

## Setup

```
npm install
```

### Before Startup

Create an .env file with variables:

```
QUICKBOOKS_CLIENT_ID=xxxxxxxxx
QUICKBOOKS_CLIENT_SECRET=xxxxxxxxxxxxx
QUICKBOOKS_ENVIRONMENT=sandbox
QUICKBOOKS_REDIRECT_URI=http://localhost:3000/auth/quickbooks/callback
QUICKBOOKS_COMPANY_ID=9341453332001970


DB_HOST= database-1.cly0g4e4whi9.us-east-1.rds.amazonaws.com
DB_USER= admin
DB_PASSWORD= password
DB_NAME= inventory_db
DB_PORT= 3306


SECRETKEY=xxxxxxxx


# authoken= xxxxxxxxxxxx

# Invoice Emailing
EMAIL=xxxxxx@gmail.com
AUTOMATED_EMAIL_PASSWORD=password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Email Reset
RESET_EMAIL_USER=email@gmail.com
RESET_EMAIL_PASS=password
```

### Start Backend

```
npm run dev
```
