const { io } = require('../app');

class  Room {
    constructor(id) {
        this.id = id;
        this.users = []
    }
    async addUser(user) {
        return new Promise((resolve, reject) => {
            this.users.push(user);
            resolve(this.users)

        })
    }
    removeUser(id) {
        return new Promise((resolve, reject) => {
            this.users = this.users.filter(user => user != id);
            resolve(this.users)
        })
    }
}

let rooms = []

io.on('connection', (client) => {
        
    let user;


   console.log('connection initialized')

    //////////////// DASHBOARD ROOM /////////////
    client.on('dashboardIn', async(payload) => {
        let dashboardRoom = await rooms.map((room) => { return room.id === 'dashboard' })[0];
        if (dashboardRoom) {
            let newUser = payload.user;
            rooms[rooms.map((room) => { return room.id }).indexOf('dashboard')].addUser(newUser)
            await client.join('dashboard')
        } else {
            dashboardRoom = new Room('dashboard');
            let newUser = payload.user;
            dashboardRoom.addUser(newUser)
            rooms.push(dashboardRoom)
            await client.join('dashboard')
        }
        user = payload.user
    })
    client.on('dashboardOut', async(payload) => {
        let room = rooms[rooms.map((room) => { return room.id }).indexOf('dashboard')];
        room ?room.removeUser(payload.user):null;
        if (room && room.users.length === 0) {
            rooms = rooms.filter((room) => { return room.id != 'dashboard' })
        }
        client.leave('dashboard')
    })


    //////// CALENDAR/PROJECTS ROOMS //////////
    client.on('userIn', async (payload, callback) => {
        if (rooms.map((room) => { return room.id }).indexOf(payload.room) < 0) {
            newRoom = new Room(payload.room)
            rooms.push(newRoom)
            newRoom.addUser(payload.user)
            callback([payload.user])
            await client.join(payload.room)
            return
        } else {
            if (rooms[rooms.map((room) => { return room.id }).indexOf(payload.room)].users.indexOf(payload.user) < 0) {
                rooms[rooms.map((room) => { return room.id }).indexOf(payload.room)].addUser(payload.user)
                await client.join(payload.room)
            }
            let usersOnline = await rooms[rooms.map((room) => { return room.id }).indexOf(payload.room)].users;
            callback(usersOnline)
            client.broadcast.to(payload.room).emit('usersOnline', usersOnline)
            return
        }
    })
    client.on('userOut', async (payload) => {
        if (payload.room) {
            if (rooms[rooms.map((room) => { return room.id }).indexOf(payload.room)]) {
                await rooms[rooms.map((room) => { return room.id }).indexOf(payload.room)].removeUser(payload.user)
                await client.leave(payload.room)
                let usersOnline = await rooms[rooms.map((room) => { return room.id }).indexOf(payload.room)].users;
                if (usersOnline.length === 0) {
                    rooms = rooms.filter((room) => { return room.id != payload.room })
                    return
                } else {
                    client.broadcast.to(payload.room).emit('usersOnline', usersOnline)
                    return
                }
            }
        }
    })

    ///////// UPDATING DASHBOARD AND PROJECTS ////////
    client.on('userSocket', async (payload) => {
        client.broadcast.emit('userSocket', payload);
    })
    client.on('message', async (payload) => {
        client.broadcast.to(payload.room).emit('message', payload.messageOrder)
        let dashboardPayload = { item: 'message', room: payload.room }
        client.broadcast.to('dashboard').emit('dashboard', dashboardPayload)
    })

    client.on('task', async (payload) => {
        client.broadcast.to(payload.room).emit('task', payload.taskOrder)
        let dashboardPayload = { item: 'task', room: payload.room }
        client.broadcast.to('dashboard').emit('dashboard', dashboardPayload)
    })

    client.on('event', async (payload) => {
        client.broadcast.to(payload.room).emit('event', payload)
        let dashboardPayload = { item: 'event' }
        client.broadcast.to('dashboard').emit('dashboard', dashboardPayload)
    })

    ///////// UPDATING PROJECT INFO AND USERS ////////
    client.on('project', async (projectOrder) => {
        client.broadcast.emit('project', projectOrder)
    })
    client.on('projectUser', async (payload) => {
        client.broadcast.emit('projectUser', payload)
    })  

    
    /////// UPDATING FILES //////
    client.on('files',async(payload)=>{
        client.broadcast.to(payload.room).emit('files',payload.fileOrder)
    })

    /////// LOGOUT ///////////
    client.on('logOut', async(payload) => {
   
      
    })
    client.on('disconnect', async() => {
        console.log('disconnected')
        await rooms.forEach(async(room) => {
            if (room.users.indexOf(user) >= 0) {
                room.removeUser(user).then((users) => {
                    if (users.length === 0) {
                        rooms = rooms.filter((myRoom) => { return myRoom.id != room.id });
                    }

                })
            }
        })
    })
})