// components/StackStepper.tsx
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface StackStepperProps {
  value: number;
  max: number;
  onChange: (next: number) => void;
}

export default function StackStepper({ value, max, onChange }: StackStepperProps) {
  return (
    <div className="flex items-center gap-4">
      <Button aria-label="Decrease quantity" disabled={value <= 1} onClick={() => onChange(value - 1)}>-</Button>
      <Label>{value}</Label>
      <Button aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(value + 1)}>+</Button>
    </div>
  );
}