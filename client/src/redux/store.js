import { createSlice } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
const initialState = { selectedID: '', messages: [], users: [] }

const messageSlice = createSlice({
    name: 'state',
    initialState,
    reducers: {
        selectedIDSet(state, action) {
            console.log(action.payload)
            state.selectedID = action.payload;
        },
        messageSet(state, action) {
            const selecteduserID = action.payload.to;
            
            const currentUser = action.payload.currentUser;

            for (let i = 0; i < state.users.length; i++) {
                const user = state.users[i];
                if (user.userID === selecteduserID) {
                    const messages = user.messages;
                    const selectedMessages = [];
                    messages.forEach((message) => {
                        console.log("message ", message)
                        if (message.from === currentUser || message.to === currentUser)
                            selectedMessages.push(message);
                        return message
                    })
                    console.log("SelectedMessages ",selectedMessages )
                    state.messages = selectedMessages;
                    break;
                }
            }
            
           


        },
        usersSet(state, action) {
            state.users = action.payload;
        },
        usersMessagesUpdate(state, action) {
            state.users = state.users.map((user) => {
                if (user.userID === action.payload.to) {
                    user.messages.push(action.payload);
                }
                return user;
            })
        },
        receivedMessageUserUpdate(state, action) {
            const { message, currentUser } = action.payload;
            state.users = state.users.map((user) => {
                const fromSelf = message.from === currentUser;
                if (user.userID === (fromSelf ? message.to : message.from)) {
                    user.messages.push(message);
                }
                return user;
            })
        },
        updateUsersAfterDisconnect(state, action) {
            state.users = state.users.map((user) => {
                if (user.userID === action.payload.userID) {
                    user.connected = action.payload.connected;
                }
                return user;
            });
        },
        addNewUser(state, action) {
            const filtered = state.users.filter((user) => {
                return user.userID !== action.payload.userID
            });
            console.log("addnewUser", filtered);
            filtered.push(action.payload);
            state.users = filtered;

        }
    }
});

export const { selectedIDSet, messageSet, usersSet, addNewUser, usersMessagesUpdate, receivedMessageUserUpdate, updateUsersAfterDisconnect } = messageSlice.actions;
let store = configureStore({
    reducer: {
        state: messageSlice.reducer
    }
});

export default store;



