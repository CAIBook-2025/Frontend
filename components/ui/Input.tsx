// components/ui/Input.tsx

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

export const Input = ({ label, id, ...props }: InputProps) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="block w-full rounded-md border-slate-300 shadow-sm placeholder:text-slate-400 focus:border-brand-primary focus:ring focus:ring-brand-primary focus:ring-opacity-50"
      />
    </div>
  );
};
