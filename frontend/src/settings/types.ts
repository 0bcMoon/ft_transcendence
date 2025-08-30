
export interface EmailData {
    email: string;
    confirmation_code: string;
}

export interface TwoFactorState {
    isEnabled: boolean;
    isSetupMode: boolean;
    qrCode: string;
    backupCodes: string[];
    verificationCode: string;
}

