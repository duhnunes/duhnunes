# Install Vite + React with ESLint

- This is my default files for React with Vite used in all my projects and work.
- This is my default ***__[ESLINT](./.eslintrc.cjs)__*** configuration used in all my projects and work.
- This is my default ***__[VSCode settings](../.vscode/settings.json)__*** configuration used in all my projects and work.

## Instalation

1. Run `npm create vite@latest`
2. Run `npm install`
3. Run `npm i vite-plugin-eslint --save-dev`  
   3.1. Inside `vite.config.js`  
    - 3.1.1. Add `import eslint from 'vite-plugin-eslint'`
    - 3.1.2. Add `eslint()` inside `plugins:[react(), ]`
4. Run `npm i eslint --save-dev`
5. Run `npm i eslint-config-react-app --save-dev`
6. Configure `.eslintrc.cjs` by copying the file contents: ***[ESLINT](./.eslintrc.cjs)***
7. Create `.vscode` folder  
    7.1. Create `settings.josn`and copy my ***[VSCode settings](../.vscode/settings.json)***
8. Open `src/main.jsx`, `src/App.jsx`, `vite.config.js` and Save(CTRL+S) to fix errors
9. Run `npm run dev` to dev your app
10. Run `npm run build` to build your app


