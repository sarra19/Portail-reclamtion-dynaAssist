// const appelVideoModel = require("../models/appelVideoModel");

// async function add(req, res) {
//     try {
//         console.log('data', req.body.name)
//         const appel = new appelVideoModel(req.body)
        
//         await appel.save();
//         res.status(200).send("add good")
//     } catch (err) {
//         res.status(400).send({ error: err });
//         console.log()
//     }
// }
// async function getall(req, res) {
//     try {
//         const data = await appelVideoModel.find();

//         res.status(200).send(data)
//     } catch (err) {
//         res.status(400).send(err);
//     }
// }
// async function updateAppel(req, res) {
//     try {
//         await appelVideoModel.findByIdAndUpdate(
//             req.params.id,
//             req.body);
//         res.status(200).send("data updated")

//     } catch (err) {
//         res.status(400).json(err);
//     }
// }
// async function getbyid(req, res) {
//     try {
//         const data = await appelVideoModel.findById(req.params.id);

//         res.status(200).send(data)
//     } catch (err) {
//         res.status(400).send(err);
//     }
// }
// async function deleteAppel(req, res) {
//     try {
//         await appelVideoModel.findByIdAndDelete(req.params.id);
//         res.status(200).send("appel deleted")

//     } catch (err) {
//         res.status(500).json(err);
//     }
// }




// module.exports = { add, getall, getbyid, updateAppel, deleteAppel }