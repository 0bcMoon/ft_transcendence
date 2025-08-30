import { useValidationStore } from "@/state/Store";
import { z } from "zod";

export const registrationSchema = z.object({
    username: z.string()
        .min(1, 'Username is required')
        .min(3, 'Username must be at least 3 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    display_name: z.string()
        .min(1, 'Display name is required')
        .min(2, 'Display name must be at least 2 characters'),
    email: z.string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z.string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters')
        .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    confirm_password: z.string()
        .min(1, 'Please confirm your password')
}).refine(data => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
});



export interface IFormData {
    current_password?: string,
    new_password?: string,
    confirm_password?: string,
    display_name?: string;
    profile_picture?: File;
    username?: string;
}


const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const imageSchema = z.any()
    .refine((file) => file instanceof File, "Image is required.")
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max image size is 2MB.`)
    .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        "Only .jpg, .jpeg, .png and .webp formats are supported."
    );

export const profilePictureValidate = (file: File | null): boolean => {
    const errors = useValidationStore.getState();
    errors.setProfilePictureError(""); // Clear previous errors
    const imageValidationResult = imageSchema.safeParse(file);
    if (!imageValidationResult.success) {
        const fieldErrors = imageValidationResult.error.flatten().formErrors;
        errors.setProfilePictureError(fieldErrors[0]);
        return false; // Image validation failed
    }
    return true; // Image validation passed
}

const updateProfile = (formData: IFormData): boolean => {

    const { display_name, username } = formData;
    const { current_password, new_password, confirm_password } = formData;
    const errors = useValidationStore.getState();
    errors.clearErrors();
    let result = true;

    const changePasswordSchema = z.object({
        current_password: z
            .string()
            .min(1, "Old password is required.")
            .max(256),
        new_password: z
            .string()
            .min(8, "Password must be at least 8 characters long.")
            .regex(/[0-9]/, "Password must contain at least one number.")
            .regex(
                /[!@#$%^&*(),.?":{}|<>]/,
                "Password must contain at least one special character."
            ),
        confirm_password: z.string().min(1, "Please confirm your new password."),
    })
        .refine((data) => data.new_password === data.confirm_password, {
            message: "new passwords do not match.",
            path: ["confirm_password"], // path of the error
        })
        .refine((data) => data.new_password !== data.current_password, {
            message: "new password must be different from the old password.",
            path: ["new_password"], // path of the error
        });

    const updateProfileSchema = z.object({
        display_name: z
            .string()
            .min(1, "Display name is required.")
            .max(50, "Display name cannot exceed 50 characters."),
        username: z
            .string()
            .min(1, "Username is required.")
            .max(24, "username name cannot exceed 24 characters.")
            .regex(/^\S+$/, 'Username cannot contain whitespace'),

    });

    const formResult = updateProfileSchema.safeParse({ display_name, username });
    if (!formResult.success) {

        const fieldErrors = formResult.error.flatten().fieldErrors;
        if (fieldErrors.display_name) {
            errors.setDisplayNameError(fieldErrors.display_name[0]);
        }
        if (fieldErrors.username) {
            errors.setUsernameError(fieldErrors.username[0]);
        }
        result = false;
    }


    if (!current_password && !new_password && !confirm_password) {
        return result;
    }

    const changePasswordResult = changePasswordSchema.safeParse({
        current_password,
        new_password,
        confirm_password,
    });
    if (changePasswordResult.success) {
        return result; // Password validation passed
    }
    const fieldErrors = changePasswordResult.error.flatten().fieldErrors;
    if (fieldErrors.new_password)
        errors.setNewPasswordError(fieldErrors.new_password[0]);
    if (fieldErrors.confirm_password)
        errors.setConfirmPasswordError(fieldErrors.confirm_password[0]);
    if (fieldErrors.current_password)
        errors.setCurrentPasswordError(fieldErrors.current_password[0]);
    return false; // Password validation failed
};

export default updateProfile;
