const User = require('../models/User');

module.exports = {

    getUsers(req, res) {
        User.find({})
        .select('-__v')
        .then((users) => res.json(users))
        .catch((err) => res.status(500).json(err));
    },

    getSingleUser(req, res) {
        User.findOne({ _id: req.params.userId })

        .select('-__v')
             .populate("thoughts")
             .populate("friends")
            .then((user) => 
                !user
                ? res.status(404).json({ message: 'No user with that ID' })
                : res.json(user)
            )
            .catch((err) => res.status(500).json(err));
    },

    createUser(req, res) {
        User.create(req.body)
            .then((user) => res.json(user))
            .catch((err) => res.status(500).json(err));
    },

    updateUser(req, res) {
        User.findOneAndUpdate(
            { _id: req.params.userId },
            req.body,
            { new: true, runValidators: true }
        )
 
            .then((UserData) => {
                !UserData
                    ? res.status(404).json({ message: 'No thought found with this ID' })
                    : res.json(UserData)
            })
            .catch(err => res.status(400).json(err));
    },

    deleteUser(req, res) {
        User.findOneAndDelete({ _id: req.params.userId })
        .then(userData => {
          !userData
            ? res.status(404).json({ message: 'No user found with this id' })
            : User.updateMany(
              { _id: { $in: userData.friends } },
              { $pull: { friends: req.params.userId } }
            )
              .then(() => {
                Thought.deleteMany({ username: userData.username })
                  .then(() => {
                    res.json({ message: "Successfully deleted user" });
                  })
                  .catch(err => res.status(400).json(err));
              })
              .catch(err => res.status(400).json(err));
        })
        .catch(err => res.status(400).json(err));
    },

    addFriend(req, res) {
        User.findOneAndUpdate(
            { _id: req.params.userId },
            { $addToSet: { friends: req.params.friendId } },
            { new: true, runValidators: true }
          )
            .then(userData => {
              !userData
                ? res.status(404).json({ message: 'No user found with this userId' })
                : User.findOneAndUpdate(
                  { _id: req.params.friendId },
                  { $addToSet: { friends: req.params.userId } },
                  { new: true, runValidators: true }
                )
                  .then(userData2 => {
                    !userData2
                      ? res.status(404).json({ message: 'No user found with this friendId' })
                      : res.json(userData);
                  })
                  .catch(err => res.json(err));
            })
            .catch(err => res.json(err));
    },
    deleteFriend(req, res) {
        User.findOneAndUpdate(
            { _id: req.params.userId },
            { $pull: { friends: req.params.friendId } },
            { new: true, runValidators: true }
          )
            .then(userData => {
              !userData
                ? res.status(404).json({ message: 'No user found with this userId' })
                : User.findOneAndUpdate(
                  { _id: req.params.friendId },
                  { $pull: { friends: req.params.userId } },
                  { new: true, runValidators: true }
                )
                  .then(userData2 => {
                    !userData2
                      ? res.status(404).json({ message: 'No user found with this friendId' })
                      : res.json({ message: 'Successfully deleted the friend' });
                  })
                  .catch(err => res.json(err));
            })
            .catch(err => res.json(err));
    }
}