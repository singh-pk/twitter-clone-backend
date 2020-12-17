const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

//Database connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`Database connected`))
  .catch((err) => console.error(err));

//Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(cors());

//Routes
const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api', postRoutes);
app.use('/api', authRoutes);
app.use('/api', userRoutes);

//Unauthorized Error message
app.use((err, _, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res
      .status(401)
      .json({ error: 'You are unauthorized to perform this action!' });
  }
  next();
});

//Port
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on ${port}`));
