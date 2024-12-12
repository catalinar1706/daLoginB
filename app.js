const express = require('express');
const app = express();

app.use(express.urlencoded({extend:false}));
app.use(express.json());

// inocra a docnvm

const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

//setear el directorio public
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

//5 Motor de plantillas
app.set('view engine', 'ejs');

//6 invocar a bcrypyjs
const bcryptjs = require('bcryptjs')

//7 Variables. de session
const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized:true
}));

//8 Invocar modulo de conexion de la BD
const conexion = require('./database/db.js')

//9 Establecer Rutas FRONTEND

app.get('/login', (req,res)=>{
    res.render('login')
})
app.get('/register', (req,res)=>{
    res.render('register')
})

//10 - Registracion

app.post('/register', async (req, res)=>{
     const user = req.body.user;
     const name = req.body.name;
     const rol = req.body.rol;
     const pass = req.body.pass; 
     let passwordHaash = await bcryptjs.hash(pass, 8);
     conexion.query('INSERT INTO users SET ?', {user:user, name:name, rol:rol, pass:passwordHaash}, async(error, results)=>{
        if(error){
            console.log(error);
        }else{
            res.render('register', {
                alert: true,
                alerTitle: "Registration",
                alertMessage: "¡Registro exitoso!",
                alertIcon: "success",
                showConfirmButton: false,
                timer:1500,
                ruta:''
            })
        }
     })
})

//11 Autenticacion

app.post('/auth', async (req, res)=>{
    const user = req.body.user;
    const pass = req.body.pass;
    //que es un hashing
    let passwordHaash = await bcryptjs.hash(pass, 8);
     if(user && pass){
        conexion.query('SELECT * FROM users WHERE user = ?', [user], async(error, results)=>{
            if(results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))){
                res.render('login', {
                    alert:true,
                    alertTitle: "Error",
                    alertMessage: "Usuario y/o password incorrectas",
                    alertIcon: "error",
                    showConfirmButton: true,
                    timer: false,
                    ruta:'login'
                })
            }else{
                req.session.loggedin = true;
                req.session.name = results[0].name
                res.render('login', {
                    alert:true,
                    alertTitle: "Conexion Exitosa",
                    alertMessage: "¡Inicio sesion correcto!",
                    alertIcon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                    ruta:''
                })
            }
        })
     }else{
        res.render('login', {
            alert:true,
            alertTitle: "Advertencia",
            alertMessage: "¡Inicio sesion correcto!",
            alertIcon: "warning",
            showConfirmButton: false,
            timer: 1500,
            ruta:''
        })
     }

})

//12. Auth pages
app.get('/', (req, res)=>{
    if(req.session.loggedin){
        res.render('index', {
            login: true,
            name: req.session.name
        })
    }else{
        res.render('index', {
            login:false,
            name: "Debes iniciar sesión"
        })
    }
})

//13 logout

app.get('/logout', (req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
})

app.listen(3000,(req, res) =>{
    console.log('Servidor corriendo en http://localhost:3000');
})