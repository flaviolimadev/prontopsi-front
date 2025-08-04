import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputMaskProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask?: "cpf" | "phone" | "currency";
}

const applyMask = (value: string, mask: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  
  switch (mask) {
    case 'cpf':
      return cleanValue
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .slice(0, 14);
    
    case 'phone':
      return cleanValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4,5})(\d{4})$/, '$1-$2')
        .slice(0, 15);
    
    case 'currency':
      const numberValue = parseInt(cleanValue) / 100;
      return numberValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
    
    default:
      return value;
  }
};

const InputMask = React.forwardRef<HTMLInputElement, InputMaskProps>(
  ({ className, mask, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (mask) {
        const maskedValue = applyMask(e.target.value, mask);
        e.target.value = maskedValue;
      }
      onChange?.(e);
    };

    return (
      <input
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

InputMask.displayName = "InputMask";

export { InputMask };