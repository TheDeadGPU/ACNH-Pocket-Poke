"use client";

import { IconDeviceNintendo } from "@tabler/icons-react";
import { Field } from "./ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";
import { isValidIPv4 } from "@/lib/IPHelper";

export default function NintendoSwitchIPInput()
{
    const {switchIP, setSwitchIPAddress} = useACNHPocketPokeContext();
    const invalid = switchIP.length > 0 && !isValidIPv4(switchIP);
    return(
        <Field className="max-w-sm">
            <InputGroup className={invalid ? "border border-red-400" : ""}>
                <InputGroupInput
                    id="inline-start-input"
                    placeholder="Switch IP address"
                    value={switchIP}
                    aria-invalid={invalid}
                    onChange={(event) => setSwitchIPAddress(event.target.value)}
                />
                <InputGroupAddon align="inline-start">
                    <IconDeviceNintendo className="text-muted-foreground" />
                </InputGroupAddon>
            </InputGroup>
        </Field>
    )
}