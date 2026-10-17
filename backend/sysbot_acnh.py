import struct
from sysbot import SysBot

ACNH_TITLE_ID = "01006F8002326000"
INVENTORY_BASES = (0xB27BB758, 0xB27BB6A0)  # slots 0-19, 20-39 (ACNH 3.0.0, heap-relative)
PLAYER_SPACING = 0x131F70
SLOT_STRIDE = 8                              # one item = 8 bytes
BLOCK_SIZE = 20
SLOT_COUNT = BLOCK_SIZE * len(INVENTORY_BASES)
EMPTY_ITEM = 0xFFFE
MAX_PLAYERS = 8
MAX_ITEM = 0xFFFF_FFFF_FFFF_FFFF  # full 8-byte item value


class ACNHError(RuntimeError):
    pass


class ACNHInjector:
    def __init__(self, switch_ip: str, port: int = 6000, timeout: float = 5.0):
        self.bot = SysBot(switch_ip, port, timeout)

    def close(self) -> None:
        self.bot.close()

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.close()

    # ---- helpers ----
    def is_acnh_running(self) -> bool:
        return ACNH_TITLE_ID.lower() in self.bot.Utility.title_id().lower()

    def _require_acnh(self) -> None:
        if not self.is_acnh_running():
            raise ACNHError("ACNH not detected")

    @staticmethod
    def _check_player(player: int) -> None:
        if not 1 <= player <= MAX_PLAYERS:
            raise ValueError(f"player must be 1-{MAX_PLAYERS}")

    def slot_address(self, player: int, slot: int) -> int:
        self._check_player(player)
        if not 0 <= slot < SLOT_COUNT:
            raise ValueError(f"slot must be 0-{SLOT_COUNT - 1}")
        block, index = divmod(slot, BLOCK_SIZE)
        return (INVENTORY_BASES[block]
                + PLAYER_SPACING * (player - 1)
                + SLOT_STRIDE * index)
    
    def parse_item(self, item: int | str) -> int:
        """Accept an int or a hex string like '0x21FE', '21FE' or '0x00020000000A1234'."""
        if isinstance(item, bool):
            raise ValueError("item must be an int or hex string")
        if isinstance(item, int):
            value = item
        elif isinstance(item, str):
            try:
                value = int(item.strip(), 16)
            except ValueError:
                raise ValueError(f"Invalid item hex code: {item!r}") from None
        else:
            raise ValueError(f"Unsupported item type: {type(item).__name__}")
        if not 0 <= value <= MAX_ITEM:
            raise ValueError(f"Item {item!r} must fit in 64 bits (up to 16 hex digits)")
        return value

    def _write_items(self, player: int, items: list[int]) -> None:
        """One poke per 20-slot block instead of one per slot."""
        self._check_player(player)
        if len(items) > SLOT_COUNT:
            raise ValueError(f"Too many items (max {SLOT_COUNT})")
        if any(not 0 <= i <= MAX_ITEM for i in items):
            raise ValueError("item codes must fit in 64 bits")

        self._require_acnh()
        for start in range(0, len(items), BLOCK_SIZE):
            chunk = items[start:start + BLOCK_SIZE]
            data = b"".join(struct.pack("<Q", i) for i in chunk)  # 8 bytes/slot
            self.bot.Ram.poke(self.slot_address(player, start), data)
    # ---- public API ----
    def inject_items(self, player: int, item_hex_codes: list[int | str]) -> None:
        items = [self.parse_item(i) for i in item_hex_codes]
        self._write_items(player, items)
        print(f"[+] Injected {len(items)} items into player {player}")

    def fill_inventory_with_item(self, player: int, item_hex_code: int | str) -> None:
        item = self.parse_item(item_hex_code)
        self._write_items(player, [item] * SLOT_COUNT)
        print(f"[+] Filled player {player}'s inventory with {item:#06x}")

    def wipe_player_inventory(self, player: int) -> None:
        self._write_items(player, [EMPTY_ITEM] * SLOT_COUNT)
        print(f"[-] Wiped player {player}'s inventory")