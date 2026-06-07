import { cn } from "@/lib/utils/cn";

export interface CheckboxOption {
  label: string;
  value: string;
}

export interface CheckboxGroupProps {
  legend?: string;
  options: CheckboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  className?: string;
  name?: string;
}

export function CheckboxGroup({
  legend,
  options,
  value,
  onChange,
  error,
  className,
  name,
}: CheckboxGroupProps) {
  const toggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

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
              type="checkbox"
              name={name}
              value={option.value}
              checked={value.includes(option.value)}
              onChange={() => toggle(option.value)}
              className="h-4 w-4 rounded border-axora-slate text-axora-blue focus:ring-axora-sky"
            />
            {option.label}
          </label>
        ))}
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </fieldset>
  );
}
