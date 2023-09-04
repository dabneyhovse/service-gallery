const router = require("express").Router();

// TODO use your own api routes
router.use("/examples", require("./example.js"));

module.exports = router;
