class MessageStore{
    saveMessage(message) {

    }
    findMessageForUser(userID){

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
        return this.messages.filter((message) => {
            return message.from === userID || message.to === userID
        });
    }
}

export default InMemoryMessageStore;