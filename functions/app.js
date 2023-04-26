const express = require("express");
const morgan = require("morgan");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controller/errorController");
const dotenv = require("dotenv");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const viewRouter = require("./routes/viewRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const mongoose = require("mongoose");

const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const catchAsync = require("./utils/catchAsync");

const app = express();

app.set("view engine", "pug");
app.set("views", "./views");
app.use(express.static("./public"));
dotenv.config({ path: "./config.env" });

app.use(express.urlencoded({ extended: true, limit: "10kb" }));

//Set security HTTP headers
app.use(
  helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Limit requests from same API
const limiter = rateLimit({
  max: 100, //100 req/hr
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour",
});

app.use("/api", limiter);
app.use(express.json({ limit: "10kb" })); //body parser, reading data from the body into req.body
app.use(cookieParser());
app.use(mongoSanitize()); //data sanitization against NoSql query injection
app.use(xss()); //data sanitization against XSS (cross-site attack)
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

app.use(
  catchAsync(async (req, res, next) => {
    const DB = process.env.DATABASE.replace(
      "<PASSWORD>",
      process.env.DATABASE_PASSWORD
    );

    await mongoose
      .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("DB connection successful");
      });
    next();
  })
);

// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//3) ROUTES
app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server!`, 404));
});

//ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

//4) START SERVER
module.exports = app;
