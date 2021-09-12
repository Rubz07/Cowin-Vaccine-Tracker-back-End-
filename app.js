var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
require("./config/connection");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var app = express();
const axios = require("axios");
var User = require("./models/users");
var moment = require("moment");
var cron = require("node-cron");
const Messages = require("./models/message");
const venom = require("venom-bot");
const wbm = require("wbm");

app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

async function start(client, centers, phn_no) {
  console.log("cengfd", centers.centers[0].sessions[0].slots, phn_no);
  let slots = "";
  if (centers.centers[0].sessions[0].slots) {
    centers.centers[0].sessions[0].slots.map((item) => {
      slots = slots + item + ",";
    });
  }
  let messageContent = `Hi ${phn_no}, \nGreeting from us. 
      \nThis is to intimate about the availability of slot(s) for Covid-19 vaccination at your location. \nKindly visit https://cowin.gov.in to book your slot.
      \nCenter: ${centers.centers[0].name} \nVaccine: ${
    centers.centers[0].sessions[0].vaccine
  } (${centers.centers[0].fee_type}) \nDate: ${
    centers.centers[0].sessions[0].date
  } \nMinimum Age Limit:${
    centers.centers[0].sessions[0].min_age_limit
      ? centers.centers[0].sessions[0].min_age_limit
      : "NIL"
  } \nSlots Available: ${slots} \nDose1 Availability: ${
    centers.centers[0].sessions[0].available_capacity_dose1 > 0
      ? centers.centers[0].sessions[0].available_capacity_dose1
      : "NIL"
  } \nDose2 Availability: ${
    centers.centers[0].sessions[0].available_capacity_dose2 > 0
      ? centers.centers[0].sessions[0].available_capacity_dose2
      : "NIL"
  }  
      \nTeam \nDAT TECH LAB \nhttps://dattechlab.com`;
  client
    .sendText("91" + phn_no + "@c.us", messageContent)
    .then((result) => {
      console.log(""); //return object success
    })
    .catch((error) => {
      console.error(error); //return object error
    });
}

// cron.schedule('6 13 * * *', async() => {

// });

const updateIsMessageSend = async (a) => {
  const data = {
    phone: a.phone,
    pincode: a.pincode,
    categoery: a.categoery,
    status: a.status,
    isMessageSend: true,
    count: count + 1,
  };
  try {
    await User.findByIdAndUpdate(a._id, data, {
      new: true,
      useFindAndModify: false,
    });
    console.log("message status updated", a.phone);
  } catch (error) {
    console.log(error);
  }
};

const slotTracking = async () => {
  const users = await User.find({});
  if (users && users.length > 0) {
    users.map((item) => {
      if (item.status && !item.isMessageSend) {
        let centers = [];
        axios
          .get(
            `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${
              item.pincode
            }&date=${moment().format("DD-MM-YYYY")}`
          )
          .then((response) => {
            centers = response.data;
            if (centers.centers && centers.centers.length > 0) {
              centers.centers.map((center) => {
                center.sessions.map((session) => {
                  if (session.available_capacity > 0) {
                    venom
                      .create()
                      .then((client) =>
                        start(client, center, item.phone).then(() => {
                          console.log("message send to:", item.phone);
                          updateIsMessageSend(item);
                        })
                      )
                      .catch((error) => {
                        console.log(error);
                      });
                  }
                });
              });
            }
          })
          .catch((e) => console.log("err", e));
      }
    });
  }
};

setInterval(() => {
  slotTracking();
}, 5000);

// cron.schedule('1 * * * *', () => {
//   slotTracking()
// });

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
