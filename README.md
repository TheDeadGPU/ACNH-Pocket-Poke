# ACNH Pocket Poke

ACNH Pocket Poke is a desktop inventory editor for *Animal Crossing: New Horizons*. Build a 40-slot pocket inventory from the bundled item catalog, choose a player, and apply the inventory to a Switch running sys-botbase on your local network.

## Disclaimer

Use this application at your own risk. The developer is not responsible for any data loss, corrupted save data, or other damage resulting from using this application. Back up your save data before use.

## Features

- Search and filter a catalog of over 25,000 items.
- Edit all 40 pocket slots, choose stack quantities, fill the inventory with one item, or clear it.
- Select one of the eight player inventories.
- Check whether the Switch is reachable and whether ACNH is running.
- Mark catalog items that are nonfunctional or cannot be picked up.

## Requirements

- Node.js and Yarn 4.18.1.
- A computer and Nintendo Switch on the same local network.
- sys-botbase running on the Switch, with ACNH open.

The injector uses version-specific ACNH memory addresses. Confirm they match your game version before applying an inventory. Item images are loaded from the Catalogue AC CDN and require an internet connection.

## Development

```sh
git clone https://github.com/TheDeadGPU/ACNH-Pocket-Poke.git
cd ACNH-Pocket-Poke
yarn install
yarn dev
```

`yarn dev` starts the Electron application in development mode and opens the developer tools.

## Using the app

1. Enter the Switch's local IP address. The app only accepts private/LAN addresses.
2. Leave the sys-botbase port at `6000` unless you have configured a different port.
3. Choose player 1–8, select an inventory slot, then search or filter for an item and set its quantity.
4. Repeat for the slots you want to fill, then choose **Replace Switch inventory** and confirm.

Applying replaces all 40 pocket slots for the selected player. Empty slots in the editor are cleared on the Switch. The status indicator checks the entered IP and port periodically; inventory writes currently use sys-botbase's default port, `6000`.

## Commands

| Command | Description |
| --- | --- |
| `yarn dev` | Run the app in development mode |
| `yarn build` | Build the Electron application |

## Project structure

- `main/` — Electron main process, sys-botbase client, ACNH memory access, and IPC handlers.
- `renderer/` — Next.js/React interface, inventory editor, and bundled item data.
- `shared/` — Types shared between Electron, preload, and the renderer.
