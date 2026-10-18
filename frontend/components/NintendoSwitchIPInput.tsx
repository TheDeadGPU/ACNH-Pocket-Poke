"use client";

import { IconDeviceNintendo } from "@tabler/icons-react";
import { Field } from "./ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "./ui/input-group";
import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";
import { useState } from "react";
import { InvalidIPError } from "@/lib/IPHelper";

export default function NintendoSwitchIPInput()
{
    const [ip, setIP] = useState("");
    const [isIPSet, setIsIPset] = useState(false);
    const [isError, setIsError] = useState(false);
    const {setSwitchIPAddress} = useACNHPocketPokeContext();

    const borderColor = () => {
        if(!isIPSet) return ""
        else
        {
            if(isError) return "border border-red-400"
            else
            {
                return "border border-emerald-400"
            }
        }
    }

    function setIPAddress(ip: string)
    {
        try
        {
            setSwitchIPAddress(ip);
            setIsError(false);
            setIsIPset(true);
        }
        catch(e)
        {
            if(e instanceof InvalidIPError)
            {
                setIsError(true);
                setIsIPset(true);
            }
        }
    }
    return(
        <Field className="max-w-sm">
            <InputGroup className={borderColor()}>
                <InputGroupInput id="inline-start-input" placeholder="Switch Ip Address" value={ip} onChange={(e) => setIP(e.target.value)} />
                <InputGroupAddon align="inline-start">
                    <IconDeviceNintendo className="text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupAddon align="inline-end">
                    <InputGroupButton variant="secondary" onClick={() => setIPAddress(ip)}>Set IP</InputGroupButton>
                </InputGroupAddon>
            </InputGroup>
        </Field>
    )
}