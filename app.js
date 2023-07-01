require('dotenv').config();
const
    express = require("express"),
    alert = require("alert"),
    path = require("path"),
    app = express(),
    { FlightList, LogInCollection, bookedList } = require("./mongo.js"),
    bodyParser = require('body-parser'),
    port = process.env.PORT || 3000,
    hostname = '127.0.0.1',
    methodOverride = require('method-override'),
    session = require('express-session'),
    flash = require('connect-flash')

// Use the method-override middleware
app.use(session({
    secret: 'flight-ticket-booking',
    saveUninitialized: true,
    resave: true
}));

app.use(flash())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'));
app.use(bodyParser.json())

const
    tempelatePath = path.join(__dirname, '/views'),
    publicPath = path.join(__dirname, '/public')

console.log(publicPath);

app.set('view engine', 'ejs')
app.set('views', tempelatePath)
app.use(express.static(publicPath))


// Routes
app.get('/signup', (req, res) => {
    res.render('signup')
})
app.get('/', (req, res) => {
    res.render('login')
})
app.get('/home', (req, res) => {
    res.render('home')
})
app.get('/admin', (req, res) => {
    res.render('admin')
})
app.get('/user', (req, res) => {
    res.render('user')
})

//Admin Routes
app.get('/admin/add', (req, res) => {
    res.render('add')
})
app.get('/admin/remove', (req, res) => {
    res.render('remove')
})
app.get('/admin/booked', (req, res) => {
    bookedList.find({})
        .then((x) => {
            res.render('booked', { x });
            console.log(x);
        })
        .catch((y) => {
            console.log(y);
        })
})

// User Routes
app.get('/user/flights', (req, res) => {
    FlightList.find({})
        .then((x) => {
            res.render('flights', { x });
            console.log(x);
        })
        .catch((y) => {
            console.log(y);
        })
})

app.get('/user/bookTicket', (req, res) => {
    res.render("bookTicket");
})
app.get('/user/mybooking', (req, res) => {
    res.render("mybooking");
})
app.get('/user/contact-input', (req, res) => {
    res.render("contact-input")
})
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})



// Login and Signup 
app.post('/signup', async (req, res) => {

    const data = new LogInCollection({
        name: req.body.name,
        password: req.body.password,
        role: req.body.role
    })
    await data.save()

    if (req.body.role === "admin" || req.body.role === "Admin") {
        res.status(201).render("admin", {
            naming: req.body.name
        })
    }
    else {
        res.status(201).render("user", {
            naming: req.body.name
        })
    }
})

app.post('/login', async (req, res) => {
    try {
        const check = await LogInCollection.findOne({ name: req.body.name })
        if (check.password === req.body.password && check.role === req.body.role) {
            if (req.body.role === "admin" || req.body.role === "Admin") {
                res.status(201).render("admin", { naming: `${req.body.password} + ${req.body.name}` });
            }
            else {
                res.status(201).render("user", { naming: `${req.body.password}+${req.body.name}` })
            }
        }
        else {
            res.send("incorrect password or role")
        }
    }
    catch (e) {
        res.send(e);
    }
})


//Admin Components
app.post('/admin/add', async (req, res) => {
    const data = new FlightList({
        airline: req.body.airline,
        source: req.body.source,
        destination: req.body.destination,
        flightNumber: req.body.flightNumber,
        departure: req.body.departure,
        arrival: req.body.arrival,
        seats: req.body.seats
    })
    await data.save();
    try {
        const results = await FlightList.find().sort({ flightNumber: 'asc' }).exec();
        res.render("admin")
    } catch (error) {
        console.error('Error retrieving documents:', error);
        res.status(404).send()
    }
});


//Deleting Flight From FlightList
app.post('/admin/remove', async (req, res) => {
    const flight = req.body.flightNumber
    try {
        const query = { flightNumber: flight };
        const result = await FlightList.deleteMany(query);
        console.log("Deleted " + result.deletedCount + " documents");
        if (result.deletedCount == 0) {
            alert(`No Flight Exist With Flight Number as ${flight}`)
        }

        res.render("admin");
    } catch (error) {
        res.status(500).send(error);
        return;
    }
})

//User Components
app.post('/user/bookTicket', async (req, res) => {
    const data = new bookedList({
        source: req.body.source,
        destination: req.body.destination,
        flightNumber: req.body.flightNumber,
        departure: req.body.departure,
        arrival: req.body.arrival,
        seatCount: req.body.seatCount,
        contact: req.body.contact
    })
    let flight;
    try {
        flight = await FlightList.findOne({ flightNumber: data.flightNumber });

        if (!flight) {
            console.log('Flight not found')
            res.render("user")
            return
        }
        const seatCnt = data.seatCount;
        console.log(`${flight.seats} and ${seatCnt}`)
        if (flight.seats >= seatCnt) {
            flight.seats = flight.seats - seatCnt;
            flight.save();
            console.log(`Successfully booked ${seatCnt} tickets on flight ${flight}`);
            await data.save()
            res.render("user")
        } else {
            console.log('Insufficient seats available');
            res.render("bookTicket");
        }
    } catch (error) {
        console.log('Error booking tickets:', error);
        res.status(404).send();
    }
});

//Search 
app.post('/user/search', async (req, res) => {
    const source = req.body.source;
    const destination = req.body.destination;
    let exist = await FlightList.find({ source } || {destination});
    if (!exist) {
        alert("Sorry Flight Doesn't exist");
        res.status(404).send();
        return;
    }
    FlightList.find({source} || {destination})
        .then((x) => {
            res.render('flights', { x });
            console.log(x);
        })
        .catch((y) => {
            console.log(y);
        })

})

//My Bookings
app.post('/user/contact-input', async (req, res) => {
    const contact = req.body.contact;
    let exist = await bookedList.findOne({ contact });
    if (exist) {
        bookedList.find({ contact })
            .then((x) => {
                res.render('mybooking', { x });
                console.log(x);
            })
            .catch((y) => {
                console.log(y);
            })
    } else {
        req.flash('messsge', "You Don't have any booking")
        res.render("user");
        return;
    }
})

app.listen(port, () => {
    console.log(`port connected at : http://${hostname}:${port}`);
});
