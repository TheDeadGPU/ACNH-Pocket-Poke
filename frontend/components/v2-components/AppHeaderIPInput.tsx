"use client";

import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";
import { isValidIPv4 } from "@/lib/IPHelper";
import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

interface AppHeaderIPInputProps
{
    className?: string;
}

export default function AppHeaderIPInput({className} : AppHeaderIPInputProps)
{
    const {switchIP, setSwitchIPAddress, switchPort, setSwitchPort} = useACNHPocketPokeContext();
    const port = Number(switchPort);
    const validPort = Number.isInteger(port) && port >= 1 && port <= 65535;
    return(
        <div className={`flex gap-3 ${className ?? ""}`}>
            <Field className="w-44">
                <FieldLabel htmlFor="switch-ip">Switch IP address</FieldLabel>
                <Input
                    id="switch-ip"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="192.168.1.1"
                    value={switchIP}
                    aria-invalid={switchIP.length > 0 && !isValidIPv4(switchIP)}
                    onChange={(event) => setSwitchIPAddress(event.target.value)}
                />
            </Field>
            <Field className="w-24">
                <FieldLabel htmlFor="switch-port">Port</FieldLabel>
                <Input
                    id="switch-port"
                    type="number"
                    min={1}
                    max={65535}
                    value={switchPort}
                    aria-invalid={!validPort}
                    onChange={(event) => setSwitchPort(event.target.value)}
                />
            </Field>
            </div>
    )
}