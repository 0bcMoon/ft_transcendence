export interface CreateUser {
    email: string;
    display_name: string;
    image_src: string;
    username: string;
    password: string;
    profile_picture?: string;
    oauth_type: 'intra42' | 'google' | 'local'; 
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

interface intra42ImageUser {
    link: string

}

export interface Intra42OAuth2 {

    email: string
    displayname: string
    image: intra42ImageUser

}

export interface EmailUpdate {
    email: string
    confirmtion_code?: string
}
