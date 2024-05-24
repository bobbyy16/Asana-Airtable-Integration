const express = require("express");

const router = express.Router();

const { receiveWebhooks } = require("../controllers/asana.controllers.js");

router.post("/receivewebhooks", receiveWebhooks);

module.exports = router;
