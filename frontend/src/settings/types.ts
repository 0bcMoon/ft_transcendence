
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

