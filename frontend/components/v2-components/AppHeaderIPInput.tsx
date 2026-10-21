"use client";

import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";
import { Button } from "../ui/button";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import CustomFieldInput from "./ShadUI Custom Components/CustomFieldInput";

interface AppHeaderIPInputProps
{
    className?: string;
}

export default function AppHeaderIPInput({className} : AppHeaderIPInputProps)
{
    const {setSwitchIPAddress} = useACNHPocketPokeContext();
    return(
        <div className={className}>
            <div className="flex gap-4">
                <CustomFieldInput label="Switch IP address" placeholder="192.168.1.1..." onChange={(value) => setSwitchIPAddress(value)}/>
                <CustomFieldInput label="Port" placeholder="6000"/>
            </div>
        </div>
    )
}