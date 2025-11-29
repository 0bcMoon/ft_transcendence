interface Props {
    id?: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    maxLength?: number;
    error?: string;
}

export default function TextField({ id, label, value, onChange, placeholder, maxLength, error }: Props) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-medium">{label}</label>
            <input
                id={id}
                type="text"
                value={value}
                placeholder={placeholder}
                maxLength={maxLength}
                onChange={(e) => onChange(e.target.value)}
                className={`border p-2 rounded-md focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : ''}`}
            />
            {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
        </div>
    );
}

