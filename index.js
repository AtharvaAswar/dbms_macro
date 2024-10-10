const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const Info = require("./models/info.js");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store images in memory
const upload = multer({ storage: storage });

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1/bloodBank');
}

//info1.save().then(res => console.log(res));

app.get("/", (req, res) => {
    res.send("ok");
});

// Index Route
app.get("/home", async (req, res) => {
    let infos = await Info.find();
    res.render("home.ejs", { infos });
});

// new form route
app.get("/new", (req, res) => {
    res.render("new.ejs");
});

// new route
app.post("/new", upload.single("imageUpload"), async (req, res) => {
    try {
        const newInfo = new Info({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            age: req.body.age,
            gender: req.body.gender,
            state: req.body.state,
            district: req.body.district,
            blood_grp: req.body.blood_grp,
            image: {
                data: req.file.buffer,
                contentType: req.file.mimetype
            }
        });
        await newInfo.save();
        console.log("Data saved successfully:", newInfo);
        res.redirect("/home");
    } catch (error) {
        console.error("Error saving data:", error);
        res.status(500).send("Internal Server Error");
    }
});

// show route
app.get("/show/:id", async (req, res) => {
    const record = await Info.findById(req.params.id);
    res.render("show.ejs", { info: record });
});

// find route
app.get('/find', async (req, res) => {
    const blood_grp = req.query.blood_grp;

    try {
        const infos = await Info.find({ blood_grp: blood_grp });
        res.render('find', { blood_grp, infos });
    } catch (err) {
        console.error(err);
        res.redirect('/home');
    }
});

// update form route
app.get("/update/:id", async (req, res) => {
    const record = await Info.findById(req.params.id);
    res.render("update.ejs", { info: record });
});

// update route
app.post("/update/:id", upload.single("imageUpload"), async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, age, gender, blood_grp } = req.body;

    try {
        const updatedData = {
            first_name,
            last_name,
            age,
            gender,
            blood_grp
        };

        // If an image is uploaded, add it to the updated data
        if (req.file) {
            updatedData.image = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
        }

        await Info.findByIdAndUpdate(id, updatedData, { new: true });

        res.redirect(`/show/${id}`);
    } catch (error) {
        console.error("Error updating record:", error);
        res.status(500).send("Error updating record");
    }
});

// delete route
app.get("/delete/:id", async (req, res) => {
    await Info.findByIdAndDelete(req.params.id);
    res.redirect("/home");
});

app.listen(3000, () => {
    console.log("app is listening on port 3000");
});
