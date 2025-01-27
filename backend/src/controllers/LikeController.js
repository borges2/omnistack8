const Dev = require('../models/Dev');

module.exports = {
    async store(req, res) {
        //console.log(req.io, req.connectedUsers);
        //console.log(req.params.devId);
        //console.log(req.headers.user);

        const { user } = req.headers;
        const { devId } = req.params;

        const loggedDev = await Dev.findById(user);

        try {
            const targetDev = await Dev.findById(devId);

            if (!targetDev) {
                return res.status(400).json({ error: 'Dev not exists' });
            }

            if (targetDev.likes.includes(loggedDev._id)) {
                const loggedSocket = req.connectedUsers[user];
                const targetSocket = req.connectedUsers[devId];

                if (loggedSocket) {
                    //Avisando usuário logado que ele deu um match no targetDev.
                    req.io.to(loggedSocket).emit('match', targetDev);
                }

                if (targetSocket) {
                    req.io.to(targetSocket).emit('match', loggedDev);
                }
            }

            if (loggedDev.likes.includes(targetDev._id) == false) {
                loggedDev.likes.push(targetDev._id);

                await loggedDev.save();
            }
        }
        catch
        {
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        //httpCode: 400 - usuário informou alguma coisa errada (badRequest)
        //push - serve para adicionar informação nova dentro do array

        return res.json(loggedDev);
    }
}
