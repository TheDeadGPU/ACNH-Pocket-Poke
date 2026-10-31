import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface CustomFieldInputProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onChange?(value: string): void;
}

export default function CustomFieldInput(props: CustomFieldInputProps) {
    return (
        <Field>
            <FieldLabel>{props.label}</FieldLabel>
            <Input placeholder={props.placeholder} className="bg-[var(--custom-field-input-bg)] font-bold" onChange={(e) => props.onChange?.(e.target.value)} />
        </Field>
    )
}