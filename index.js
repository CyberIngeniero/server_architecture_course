const express = require('express');
const Validator = require('jsonschema').Validator;
const validator = new Validator()

// json data
const data = require("./employees.json")

// schema from data
const scheme = {
    "id":"/estructura",
    "type":"object",
    "properties": {
        "name":{"type":"string"},
        "age":{"type":"integer"},
        "phone": {
            "type": "object",
            "properties": {
                "personal": {"type": "string"},
                "work": {"type": "string"},
                "ext": {"type": "string"},
            },
            "required": ["personal","work","ext"],
            "additionalProperties": false
        },
        "privileges":{"type": "string"},
        "favorites": {
            "type": "object",
            "properties": {
                "artist": {"type": "string"},
                "food": {"type": "string"},
            },
            "required": ["artist","food"],
            "additionalProperties": false
        },
        "finished":  {
            "type": "array",
            "items": {"type": "integer"},
        },
        "badges": {
            "type": "array",
            "items": {"type": "string"},
        },
        "points": {
            "type": "array",
            "items": {
                "properties": {
                    "points": {"type": "integer"},
                    "bonus": {"type": "integer"},
                },
                "required":["points", "bonus"],
                "additionalProperties": false
            },
        },
    },
    "required": ["name","age","phone","privileges","favorites","finished","badges","points"],
    "additionalProperties": false
  };

validator.addSchema(scheme,'/estructura');

// app express
const app = express();
app.use(express.json());

// methods
app.get('/', (req, res) => {
    res.send('Welcome to Api Server Architecture Course');
});

app.get('/api/employees', (req, res) => {
    if (req.query.page) {
        const n = Number(req.query.page);
        if (n >= 1 && n <= (data.length/2)) {
            res.json(data.slice(2*(n-1), 2*(n-1)+2));
        } else {
            res.status(400).send('Invalid page number');
        }
    } else if (req.query.user) {
        const Valid = req.query.user
        if (Valid) {
            res.json(data.filter(d => d.privileges === "user"));
        } else {
            res.status(400).send('Invalid privileges');
        }
    } else if (req.query.badges) {
        const dataFiltered = data.filter(d => d.badges.includes(req.query.badges));
        if (dataFiltered.length > 0) {
            res.json(dataFiltered);
        } else {
            res.status(400).send('Invalid badges');s
        }
    } else {
        res.json(data);
    }
});

app.get('/api/employees/oldest', (req, res) => {
    const max_age = Math.max(...data.map(data => data.age));
    const dataFiltered = data.filter(d => d.age >= max_age);
    if (dataFiltered.length > 1) {
        res.json(dataFiltered[0]);
    } else {
        res.json(dataFiltered);
    }
});

app.get('/api/employees/:name', (req, res) => {
    const name = req.params.name
    const dataFiltered = data.filter(d => d.name.toLowerCase() === name.toLowerCase());
    if (dataFiltered.length > 0) {
        res.json(dataFiltered);
    } else {
        res.status(400).send('Name not found!');
    }
});

app.post('/api/employees', (req, res) => {
    const validScheme = validator.validate(req.body, scheme)
    if (validScheme.valid) {
        data.push(req.body);
        res.json(data);
    } else {
        res.status(400).send('bad_request');
    }
});

app.listen(8000, () => {
    console.log('ready')
});