
export interface FormData {
    displayName: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface EmailData {
    email: string;
    confirmationCode: string;
}

export interface TwoFactorState {
    isEnabled: boolean;
    isSetupMode: boolean;
    qrCode: string;
    backupCodes: string[];
    verificationCode: string;
}

export interface ValidationErrors {
    displayName?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    email?: string;
    confirmationCode?: string;
    verificationCode?: string;
}
