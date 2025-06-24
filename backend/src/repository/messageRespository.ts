import db from '../../db/db';



interface Message {
    user_id: number
    id: number,
    sender_id: number,
    receiver_id: number,
    content: string,
    created_at: Date,

}
export const messageRepository = {

    createMessage: async (sender_id: number, receiver_id: number, content: string): Promise<Message | undefined> => {
        const result = await db.run(
            'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?) ',
            [sender_id, receiver_id, content]
        );
        return messageRepository.getMessage(result.lastID);
    },
    getMessage: async (id: number): Promise<Message | undefined> => {
        return await db.get<Message>('SELECT * FROM messages WHERE id = ?', [id]);
    }
}
