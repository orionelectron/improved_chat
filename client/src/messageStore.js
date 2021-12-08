class MessageStore{
    saveMessage(message) {

    }
    findMessageForUserID(userID){

    }
}
class InMemoryMessageStore extends MessageStore{
    constructor(){
        super();
        this.messages = [];
    }
    saveMessage(message){
        this.messages.push(message);
    }
    findMessagesForUserID(userID){
        const filtered = this.messages.filter((message) => {
            return (message.from === userID || message.to === userID)
        });
        
        return filtered;
    }
    getAllMessages(){
        return this.messages;
    }
}

export default InMemoryMessageStore;