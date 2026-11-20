import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import dns from 'node:dns'
import { MongoClient, ObjectId } from 'mongodb'
import admin from 'firebase-admin'

dotenv.config()
dns.setServers(['8.8.8.8', '8.8.4.4'])
const app = express()
app.use(cors({origin: process.env.CLIENT_URL?.split(',') || true}))
app.use(express.json({limit:'1mb'}))

let db
const client = new MongoClient(process.env.MONGODB_URI)
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
if (serviceAccount) {
  try {
    admin.initializeApp({credential: admin.credential.cert(JSON.parse(serviceAccount))})
  } catch (e) { console.error('Firebase Admin initialization failed:', e.message) }
}
const events = () => db.collection('events')
const joins = () => db.collection('joins')

async function auth(req,res,next) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ') || !admin.apps.length) return res.status(401).json({message:'Please log in to continue.'})
  try { req.user = await admin.auth().verifyIdToken(header.slice(7)); next() }
  catch { return res.status(401).json({message:'Your session is invalid. Please log in again.'}) }
}
function validId(id){return ObjectId.isValid(id)}
function futureDate(d){const date=new Date(d);return !Number.isNaN(date.getTime()) && date.getTime()>=new Date(new Date().setHours(0,0,0,0)).getTime()}
function clean(body){return {title:String(body.title||'').trim(),description:String(body.description||'').trim(),eventType:String(body.eventType||'').trim(),imageUrl:String(body.imageUrl||'').trim(),location:String(body.location||'').trim(),eventDate:new Date(body.eventDate)}}
function validEvent(e){return e.title&&e.description&&e.eventType&&e.imageUrl&&e.location&&futureDate(e.eventDate)}

app.get('/',(req,res)=>res.json({message:'Gatherly API is running'}))
app.get('/api/health',(req,res)=>res.json({status:'ok'}))

app.get('/api/events',async(req,res)=>{
 try {const limit=Math.min(parseInt(req.query.limit)||100,100);const list=await events().find({eventDate:{$gte:new Date(new Date().setHours(0,0,0,0))}}).sort({eventDate:1}).limit(limit).toArray();const counts=await joins().aggregate([{$group:{_id:'$eventId',count:{$sum:1}}}]).toArray();const map=new Map(counts.map(x=>[String(x._id),x.count]));res.json({events:list.map(e=>({...e,joinCount:map.get(String(e._id))||0}))})}
 catch(e){res.status(500).json({message:'Could not load events.'})}
})
app.get('/api/events/:id',async(req,res)=>{
 try {if(!validId(req.params.id))return res.status(400).json({message:'Invalid event id'});const event=await events().findOne({_id:new ObjectId(req.params.id)});if(!event)return res.status(404).json({message:'Event not found'});const joinCount=await joins().countDocuments({eventId:event._id});let joined=false;if(req.headers.authorization?.startsWith('Bearer ')){try{const u=await admin.auth().verifyIdToken(req.headers.authorization.slice(7));joined=!!await joins().findOne({eventId:event._id,userId:u.uid})}catch{}}res.json({event:{...event,joinCount},joined})}
 catch{res.status(500).json({message:'Could not load event.'})}
})
app.post('/api/events',auth,async(req,res)=>{
 try{const e=clean(req.body);if(!validEvent(e))return res.status(400).json({message:'Complete every field and choose a future event date.'});const doc={...e,ownerId:req.user.uid,ownerName:req.user.name||req.user.email,createdAt:new Date()};const result=await events().insertOne(doc);res.status(201).json({event:{...doc,_id:result.insertedId}})}
 catch{res.status(500).json({message:'Could not create event.'})}
})
app.patch('/api/events/:id',auth,async(req,res)=>{
 try{if(!validId(req.params.id))return res.status(400).json({message:'Invalid event id'});const e=clean(req.body);if(!validEvent(e))return res.status(400).json({message:'Complete every field and choose a future event date.'});const result=await events().findOneAndUpdate({_id:new ObjectId(req.params.id),ownerId:req.user.uid},{$set:{...e,updatedAt:new Date()}},{returnDocument:'after'});if(!result)return res.status(404).json({message:'Event not found or you are not its owner.'});res.json({event:result})}
 catch{res.status(500).json({message:'Could not update event.'})}
})
app.delete('/api/events/:id',auth,async(req,res)=>{
 try{if(!validId(req.params.id))return res.status(400).json({message:'Invalid event id'});const id=new ObjectId(req.params.id);const result=await events().deleteOne({_id:id,ownerId:req.user.uid});if(!result.deletedCount)return res.status(404).json({message:'Event not found or you are not its owner.'});await joins().deleteMany({eventId:id});res.json({message:'Event deleted'})}
 catch{res.status(500).json({message:'Could not delete event.'})}
})
app.post('/api/events/:id/join',auth,async(req,res)=>{
 try{if(!validId(req.params.id))return res.status(400).json({message:'Invalid event id'});const id=new ObjectId(req.params.id),event=await events().findOne({_id:id,eventDate:{$gte:new Date()}});if(!event)return res.status(404).json({message:'Upcoming event not found.'});const existing=await joins().findOne({eventId:id,userId:req.user.uid});if(existing)return res.status(409).json({message:'You already joined this event.'});await joins().insertOne({eventId:id,userId:req.user.uid,userName:req.user.name||req.user.email,userEmail:req.user.email,joinedAt:new Date()});res.status(201).json({message:'Successfully joined event'})}
 catch{res.status(500).json({message:'Could not join event.'})}
})
app.get('/api/my/events',auth,async(req,res)=>{try{const list=await events().find({ownerId:req.user.uid}).sort({eventDate:1}).toArray();const counts=await joins().aggregate([{$group:{_id:'$eventId',count:{$sum:1}}}]).toArray();const map=new Map(counts.map(x=>[String(x._id),x.count]));res.json({events:list.map(e=>({...e,joinCount:map.get(String(e._id))||0}))})}catch{res.status(500).json({message:'Could not load your events.'})}})
app.get('/api/my/joined',auth,async(req,res)=>{try{const mine=await joins().find({userId:req.user.uid}).sort({joinedAt:-1}).toArray();const ids=mine.map(x=>x.eventId);const list=await events().find({_id:{$in:ids},eventDate:{$gte:new Date()}}).sort({eventDate:1}).toArray();const counts=await joins().aggregate([{$group:{_id:'$eventId',count:{$sum:1}}}]).toArray();const map=new Map(counts.map(x=>[String(x._id),x.count]));res.json({events:list.map(e=>({...e,joinCount:map.get(String(e._id))||0}))})}catch{res.status(500).json({message:'Could not load joined events.'})}})

const port=process.env.PORT||5000
try{await client.connect();db=client.db(process.env.DB_NAME||'gatherly');await events().createIndex({eventDate:1});await events().createIndex({ownerId:1});await joins().createIndex({eventId:1,userId:1},{unique:true});app.listen(port,()=>console.log(`Gatherly API listening on ${port}`))}
catch(e){console.error('Database connection failed:',e.message);process.exit(1)}
