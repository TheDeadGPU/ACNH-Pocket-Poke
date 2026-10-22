# ACNH Pocket Poke

ACNH Pocket Poke lets you build a 40-slot Animal Crossing: New Horizons pocket
inventory and send it to a Switch running sys-botbase.

## Requirements

- Python 3.10 or later
- Node.js 20.9 or later
- sys-botbase running on the Switch, with the Switch and computer on the same
  reachable network

## Run locally

Install and start the API in one terminal:

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

Install and start the web app in another terminal:

```sh
cd frontend
npm install
npm run dev
```

Open <http://localhost:3000>, enter the Switch's LAN IP address and sys-botbase
port (6000 by default), choose a player, and build the inventory. The API URL
defaults to `http://localhost:8000`; set `POCKET_POKE_URL` in the frontend
environment if the API is hosted elsewhere.

**Applying an inventory replaces all 40 pocket slots for the selected player.**
Any empty slot in the editor is sent as empty and clears that slot on the Switch.

The API only accepts private/LAN IP addresses. Do not expose it to the public
internet.
