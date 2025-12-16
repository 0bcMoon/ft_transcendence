export function RulesTab({ rules }: { rules: string[] }) {
    return (
        <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Tournament Rules</h3>
            <div className="space-y-4">
                {rules.map((rule, index) => (
                    <div key={index} className="flex gap-4 items-start">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg">
                            {index + 1}
                        </div>
                        <p className="text-gray-700 dark:text-slate-300 pt-2 text-base">{rule}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
