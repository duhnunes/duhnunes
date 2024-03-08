# Instal Vite + React + Typescript + ESLint + Prettier

1. Run `npm create vite@latest`
2. Run `npm install`
3. Run `npm i --save-dev  eslint prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react eslint-plugin-react-hooks`
4. Rename `.eslintrc.cjs` to `.eslintrc`  
   4.1 copy all [ESLint Config](./eslint.txt) and paste inside
5. Create file `.eslintignore` and put inside:
   > node_modules/  
   > dist/  
   > env.d.ts
6. Create file `.prettierrc` and paste all content from [prettierrclib](./prettier.txt)
7. Create file `.prettierignore` and put inside:
   > node_modules/  
   > dist/
8. Install VSCode Extensions:  
   8.1 [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)  
   8.2 [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)*
   
   ###### *Disable Prettier works nice
