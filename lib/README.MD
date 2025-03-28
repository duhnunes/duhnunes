# OPTIONAL USES TO DEPLOY

#### _To use gh-pages:_

1. Run `npm i gh-pages --save-dev`
2. Open `package.json` file  
   2.1 Add `homepage` property with URL: `https://{username}.github.io/{repo-name}` right after `version`
3. Open `package.json` file  
   3.1 Inside `scripts` object right before `start`  
    - 3.1.1 Add `"predeploy": "npm run build"`  
    - 3.1.2 Add `"deploy": "gh-pages -d build"`  
   3.2 If use TS in project rename `"gh-pages -d build"` to `"gh-pages -d dist"`

4. Run `npm run deploy` to deploy to the web  
   4.1 You can specify a custom commit message with:  
   `npm run build -- -m "Deploy React app to GitHub Pages"`
5. Configure Github Pages  
   5.1 Go repository settings in `GithubPages`
   5.2 Configure `Build and Deployment`
   - 5.2.1 Branch `gh-pages`
   - 5.2.2 Folder `/ (root)`

OR

#### _To use vercel:_

1. Run `npm i -g vercel`
2. Run `vercel`
3. Run `vercel --prod` to deploy to the web
