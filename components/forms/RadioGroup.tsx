import { cn } from "@/lib/utils/cn";

export interface RadioOption {
  label: string;
  value: string;
}

export interface RadioGroupProps {
  legend?: string;
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

export function RadioGroup({
  legend,
  name,
  options,
  value,
  onChange,
  error,
  className,
}: RadioGroupProps) {
  return (
    <fieldset className={cn("space-y-2", className)}>
      {legend ? (
        <legend className="text-sm font-medium text-axora-navy">
          {legend}
        </legend>
      ) : null}
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 text-sm text-axora-navy"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 border-axora-slate text-axora-blue focus:ring-axora-sky"
            />
            {option.label}
          </label>
        ))}
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </fieldset>
  );
}
