<p align="center"><img src="https://i.imgur.com/a9QWW0v.png"></p>

## Usage

### Create an App

```
# with npx
$ npx create-nextron-app my-app --example with-tailwindcss

# with yarn
$ yarn create nextron-app my-app --example with-tailwindcss

# with pnpm
$ pnpm dlx create-nextron-app my-app --example with-tailwindcss
```

### Install Dependencies

```
$ cd my-app

# with npm
$ npm install

# with yarn
$ yarn install

# with pnpm
$ pnpm install
```

### Use it

```
# development mode
$ npm run dev (or `yarn dev` or `pnpm run dev`)

# production build
$ npm run build (or `yarn build` or `pnpm run build`)
```

### SysbotBase HTTP API

The Electron main process starts a local HTTP API on `127.0.0.1:3001`.
Use `GET http://127.0.0.1:3001/api/sysbotbase/status` to read the current
placeholder status. It returns JSON indicating that SysBot status integration
has not been configured yet.
