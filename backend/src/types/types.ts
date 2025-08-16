export interface CreateUser {
    email: string;
    display_name: string; 
    image_src: string; // Optional, can be set later
}

export interface GoogleOAuth2 {

    id: string
    email: string
    verified_email: boolean
    name: string
    given_name: string
    family_name: string
    picture: string

}
