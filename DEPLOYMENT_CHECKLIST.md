# Railway Deployment Checklist

Use this checklist to ensure a successful deployment to Railway.

## Pre-Deployment

- [ ] Code is committed and pushed to GitHub
- [ ] All dependencies are in `package.json`
- [ ] Firebase project is set up
- [ ] Firebase credentials are ready

## Railway Setup

- [ ] Created Railway account
- [ ] Created new project in Railway
- [ ] Connected GitHub repository
- [ ] Railway detected the project correctly

## Environment Variables

- [ ] `NODE_ENV=production` is set
- [ ] Firebase credentials configured:
  - [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` (full JSON string) OR
  - [ ] `FIREBASE_PROJECT_ID` (project ID only)
- [ ] `PORT` is set (Railway auto-sets this, but verify)

## Deployment

- [ ] Build started successfully
- [ ] Build completed without errors
- [ ] Deployment succeeded
- [ ] Public URL is available

## Post-Deployment

- [ ] `VITE_API_URL` is set to Railway URL
- [ ] Rebuild triggered with new API URL
- [ ] Frontend can connect to backend API

## Testing

- [ ] Can access the website at Railway URL
- [ ] Login page loads correctly
- [ ] Can login with `omar.samy` / `123`
- [ ] Can login with `abdelatif.reda` / `123`
- [ ] Can login with `karim.ali` / `123`
- [ ] Can login with `admin` / `123`
- [ ] Firebase connection is working
- [ ] Data can be read/written to Firebase

## Teacher Accounts Verification

Test each teacher account:

- [ ] **Omar Samy** (`omar.samy` / `123`)
  - [ ] Can login successfully
  - [ ] Has teacher permissions
  - [ ] Can access teacher features

- [ ] **Abdelatif Reda** (`abdelatif.reda` / `123`)
  - [ ] Can login successfully
  - [ ] Has teacher permissions
  - [ ] Can access teacher features

- [ ] **Karim Ali** (`karim.ali` / `123`)
  - [ ] Can login successfully
  - [ ] Has teacher permissions
  - [ ] Can access teacher features

## Monitoring

- [ ] Railway logs are accessible
- [ ] No errors in application logs
- [ ] Performance metrics look good
- [ ] Set up monitoring alerts (optional)

## Security

- [ ] Environment variables are secure
- [ ] Firebase credentials are not exposed
- [ ] API endpoints are protected
- [ ] CORS is configured correctly

## Documentation

- [ ] Deployment URL is documented
- [ ] Login credentials are documented
- [ ] Team members have access
- [ ] Railway project is shared (if needed)

## Troubleshooting

If something fails:

1. Check Railway build logs
2. Check Railway runtime logs
3. Verify environment variables
4. Test Firebase connection locally
5. Review error messages in logs
6. Check Railway status page

## Success Criteria

✅ Deployment is successful when:
- Website is accessible
- All teacher accounts can login
- Firebase connection works
- No errors in logs
- All features are functional
