const users = [];

const addUsers = ({ id, username, room })=>{
    //Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //Validate te data
    if(!username || !room){
        return {
            error: 'Username and room mandate!'
        }
    }

    //Ceck existing user
    const existingUsers = users.find((user)=>{
        return user.room === room && user.username === username;
    });

    if(existingUsers){
        return {
            error: 'Duplicate username in room!'
        }
    }

    //valid user to store
    const user = { id, username, room };
    users.push(user);
    return { user };
}

const removeUser = (id)=>{
    //alternate
    // let index = users.find((user, idx)=>{
    //     if(user.id === id){
    //         index = idx;
    //         return true;
    //     }
    //     return false;
    // });
    let index = users.findIndex(user => user.id === id);
    if(index > -1){
        return users.splice(index, 1)[0];
    }
    return index;
}


const getUser = id => users.find( user => user.id === id );

const getUsersInRoom = room => users.filter( user => user.room === room );

module.exports = {
    getUser,
    getUsersInRoom,
    addUsers,
    removeUser
}