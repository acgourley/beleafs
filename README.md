
### Install
Get the npm dependencies. Currently using Node 6 for dev.
```
npm install
```

### Run local server
This will reload on file changes. Running the command should launch a tab pointing at your localhost server.
```
npm start
```
### Deploy
Authenticating with firebase should only need to happen once.
```
firebase login 
npm run build
firebase deploy
```
See it live at https://beleafs-6f378.firebaseapp.com/ 
