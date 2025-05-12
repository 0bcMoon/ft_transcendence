const MessageApi = {

    getMessages: () => {
        return [

            {
                message: "Hello",
                sender: true
            },
            {
                message: "Hello",
                sender: true
            },
            {
                message: "Hello",
                sender: true
            },
            {
                message: "Hello",
                sender: true
            },
            {
                message: "Hi",
                sender: false
            },
            {
                message: "How are you doing?",
                sender: true
            },
            {
                message: "What about you?",
                sender: true
            },

            {
                message: "This is Working",
                sender: true
            },
        ]
    },
    getContactList: ()  => {
        return [
            {
                profilePicture: undefined,
                displayName: "john Doe",
                status: "Online",
                lastMessage: "Hello"
            },

            {
                profilePicture: undefined,
                displayName: "john Doe",
                status: "Online",
                lastMessage: "Hello"
            }
        ]
    }

}

export default MessageApi;
