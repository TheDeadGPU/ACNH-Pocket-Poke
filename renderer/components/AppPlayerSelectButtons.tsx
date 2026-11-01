"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";

export default function AppPlayerSelectButtons() {
    const {selectedPlayer, setSelectedPlayer} = useACNHPocketPokeContext();
    const playerArray = Array.from(Array(8).keys()).map(x => x + 1);
    return (
        <div>
            <Field>
                <FieldLabel>Player</FieldLabel>
                <div className="flex">
                    {playerArray.map((playerIndex, idx) => (
                        <Button key={`player-${idx}`} variant={playerIndex === selectedPlayer ? "default" : "secondary"} className="font-bold" size="icon-lg" onClick={() => setSelectedPlayer(playerIndex)}>{playerIndex}</Button>
                    ))}
                </div>
            </Field>
        </div>
    )
}