require('dotenv').config();
const express=require('express'), mongoose=require('mongoose'), bcrypt=require('bcryptjs'),
 jwt=require('jsonwebtoken'), cors=require('cors'), path=require('path');
const app=express();
app.use(cors()); app.use(express.json({limit:'1mb'})); app.use(express.static(path.join(__dirname,'public')));
mongoose.connect(process.env.MONGODB_URI).then(()=>console.log('MongoDB connected')).catch(e=>{console.error(e);process.exit(1);});
const User=mongoose.model('User',new mongoose.Schema({
 name:{type:String,required:true},email:{type:String,required:true,unique:true,lowercase:true},
 password:{type:String,required:true},role:{type:String,enum:['user','admin'],default:'user'}
},{timestamps:true}));
function tokenFor(u){return jwt.sign({id:u._id,role:u.role},process.env.JWT_SECRET,{expiresIn:'2d'});}
async function auth(req,res,next){try{const h=req.headers.authorization||'';const t=h.startsWith('Bearer ')?h.slice(7):'';const p=jwt.verify(t,process.env.JWT_SECRET);req.user=p;next();}catch(e){res.status(401).json({error:'Please log in'});}}
function admin(req,res,next){if(req.user.role!=='admin')return res.status(403).json({error:'Admin access required'});next();}
app.post('/api/auth/register',async(req,res)=>{try{const {name,email,password}=req.body;if(!name||!email||!password||password.length<8)return res.status(400).json({error:'Name, valid email and password (8+ characters) required'});const exists=await User.findOne({email});if(exists)return res.status(409).json({error:'Email already registered'});const user=await User.create({name,email,password:await bcrypt.hash(password,12)});res.status(201).json({token:tokenFor(user),user:{id:user._id,name:user.name,email:user.email,role:user.role}});}catch(e){res.status(400).json({error:e.message});}});
app.post('/api/auth/login',async(req,res)=>{const u=await User.findOne({email:req.body.email});if(!u||!await bcrypt.compare(req.body.password||'',u.password))return res.status(401).json({error:'Invalid email or password'});res.json({token:tokenFor(u),user:{id:u._id,name:u.name,email:u.email,role:u.role}});});
app.get('/api/auth/me',auth,async(req,res)=>{const u=await User.findById(req.user.id).select('-password');if(!u)return res.status(404).json({error:'User not found'});res.json(u);});

const Project = mongoose.model('Project', new mongoose.Schema({
  title:{type:String,required:true}, description:{type:String,required:true},
  tech:[String], github:String, demo:String, image:String, featured:{type:Boolean,default:false}
 }, {timestamps:true}));
app.get('/api/projects', async (req,res)=>res.json(await Project.find().sort({createdAt:-1})));
app.post('/api/projects', auth, async (req,res)=>res.status(201).json(await Project.create(req.body)));
app.put('/api/projects/:id', auth, async (req,res)=>res.json(await Project.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})));
app.delete('/api/projects/:id', auth, async (req,res)=>{await Project.findByIdAndDelete(req.params.id);res.json({message:'Project deleted'});});
app.get('/api/health',(req,res)=>res.json({ok:true,app:process.env.APP_NAME}));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
const port=process.env.PORT||3000;app.listen(port,()=>console.log(`${process.env.APP_NAME} running on ${port}`));
