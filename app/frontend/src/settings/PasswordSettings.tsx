"use client"

import { useValidationStore } from "@/state/Store"
import { Lock, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

interface PasswordSettingsProps {
    showPasswords: { current: boolean; new: boolean; confirm: boolean }
    togglePasswordVisibility: (field: "current" | "new" | "confirm") => void
}

function PasswordSettings({ showPasswords, togglePasswordVisibility }: PasswordSettingsProps) {
    const errors = useValidationStore((state) => state)
    const [readOnly, setReadOnly] = useState(true)

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
            </h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                    <div className="relative">
                        <input
                            name="current_password"
                            type={showPasswords.current ? "text" : "password"}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg 
                                       text-white placeholder:text-slate-500
                                       focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Enter current password"
                            autoComplete="current-password"
                            readOnly={readOnly}
                            onFocus={() => setReadOnly(false)}
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility("current")}
                            className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-400"
                        >
                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {errors.current_password && <p className="mt-1 text-sm text-red-400">{errors.current_password}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                        <div className="relative">
                            <input
                                name="new_password"
                                type={showPasswords.new ? "text" : "password"}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg 
                                           text-white placeholder:text-slate-500
                                           focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Enter new password"
                                autoComplete="new-password"
                                readOnly={readOnly}
                                onFocus={() => setReadOnly(false)}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility("new")}
                                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-400"
                            >
                                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.new_password && <p className="mt-1 text-sm text-red-400">{errors.new_password}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                        <div className="relative">
                            <input
                                name="confirm_password"
                                type={showPasswords.confirm ? "text" : "password"}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg 
                                           text-white placeholder:text-slate-500
                                           focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Confirm new password"
                                autoComplete="new-password"
                                readOnly={readOnly}
                                onFocus={() => setReadOnly(false)}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility("confirm")}
                                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-400"
                            >
                                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.confirm_password && <p className="mt-1 text-sm text-red-400">{errors.confirm_password}</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PasswordSettings

