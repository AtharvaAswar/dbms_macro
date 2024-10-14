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

const upload = multer({ dest: 'public/pictures/' });

// Connect to MongoDB
main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1/bloodBank');
}

// Home Route
app.get("/home", async (req, res) => {
    let infos = await Info.find();
    res.render("home.ejs", { infos });
});

// New Form Route
app.get("/new", (req, res) => {
    res.render("new.ejs");
});

// Create Route
app.post("/new", upload.single("imageUpload"), async (req, res) => {
    try {
        const imagePath = `/pictures/${req.file.filename}`;

        const newInfo = new Info({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            age: req.body.age,
            gender: req.body.gender,
            state: req.body.state,
            district: req.body.district,
            blood_grp: req.body.blood_grp,
            image: {
                data: imagePath,
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

// Show Record Route
app.get("/show/:id", async (req, res) => {
    const record = await Info.findById(req.params.id);
    res.render("show.ejs", { info: record });
});

// Find Route (by blood group)
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

// Update Form Route
app.get("/update/:id", async (req, res) => {
    const record = await Info.findById(req.params.id);
    res.render("update.ejs", { info: record });
});

// Update Data Route
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

        if (req.file) {
            updatedData.image = {
                data: `/pictures/${req.file.filename}`,
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

// Delete Route
app.get("/delete/:id", async (req, res) => {
    await Info.findByIdAndDelete(req.params.id);
    res.redirect("/home");
});

// Server Listen
app.listen(3000, () => {
    console.log("App is listening on port 3000");
});
