const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_ATLAS_URL || process.env.MONGODB_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
