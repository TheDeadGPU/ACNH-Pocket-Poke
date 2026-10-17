import logging
from typing import Annotated

from fastapi import Body, FastAPI, HTTPException, Query
from pydantic import BaseModel, IPvAnyAddress

from sysbot_acnh import ACNHError, ACNHInjector, MAX_ITEM, MAX_PLAYERS, SLOT_COUNT

logger = logging.getLogger("pocket_poke")

DEFAULT_PORT = 6000

app = FastAPI(title="Pocket Poke API", version="1.0.0")


class SwitchStatus(BaseModel):
    reachable: bool                  # could we connect to sys-botbase at all?
    acnh_running: bool               # is ACNH the running title?
    error: str | None = None


def _require_private(ip: IPvAnyAddress) -> None:
    """Optional: stop the API being used to probe arbitrary hosts."""
    if not ip.is_private:
        raise HTTPException(400, "Only private/LAN addresses are allowed")


@app.get("/status", response_model=SwitchStatus)
def get_status(
    ip: IPvAnyAddress,
    port: int = Query(DEFAULT_PORT, ge=1, le=65535),
    timeout: float = Query(3.0, gt=0, le=10),
) -> SwitchStatus:
    """Check that the Switch is reachable and that ACNH is the running title."""
    _require_private(ip)
    try:
        with ACNHInjector(str(ip), port, timeout) as injector:
            return SwitchStatus(reachable=True, acnh_running=injector.is_acnh_running())
    except TimeoutError:
        error = "Connection timed out"
    except ConnectionRefusedError:
        error = "Connection refused (is sys-botbase running?)"
    except OSError as exc:
        error = f"Network error: {exc}"

    logger.warning("Status check failed for %s:%s: %s", ip, port, error)
    return SwitchStatus(reachable=False, acnh_running=False, error=error)


@app.post("/inject")
def inject_items(
    ip: IPvAnyAddress,
    items: Annotated[list[str], Body(min_length=1, max_length=SLOT_COUNT)],
    player: int = Query(1, ge=1, le=MAX_PLAYERS),
    port: int = Query(DEFAULT_PORT, ge=1, le=65535),
    timeout: float = Query(3.0, gt=0, le=10),
) -> dict:
    """Inject 8-byte item values (hex strings, up to 16 digits, e.g. ["0x1234",
    "0x00020000000A1234"]) into a player's inventory slots."""
    _require_private(ip)

    # Parse and validate before touching the network.
    try:
        item_codes = [int(item, 16) for item in items]
    except ValueError as exc:
        raise HTTPException(400, f"Invalid item hex code: {exc}")
    if any(not 0 <= code <= MAX_ITEM for code in item_codes):
        raise HTTPException(400, "Item codes must fit in 64 bits (up to 16 hex digits)")

    try:
        with ACNHInjector(str(ip), port, timeout) as injector:
            injector.inject_items(player, item_codes)
    except ACNHError as exc:
        raise HTTPException(409, str(exc))                       # ACNH not running
    except TimeoutError:
        raise HTTPException(504, "Connection to the Switch timed out")
    except ConnectionRefusedError:
        raise HTTPException(502, "Connection refused (is sys-botbase running?)")
    except OSError as exc:
        raise HTTPException(502, f"Network error: {exc}")

    logger.info("Injected %d items into player %d on %s:%s", len(item_codes), player, ip, port)
    return {"status": "success", "injected_items": [f"{code:#018x}" for code in item_codes]}