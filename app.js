// ======================== MongoDB server command ========================
// - Open mongod: brew services start mongodb-community
// - Open mongosh: mongosh
// (127.0.0.1)
// MUST use url to this:
// https://source.unsplash.com/collection/483251
// Delete All Reviews: db.reviews.deleteMany({})
// ========================================================================


// ======================== ✅External Modules ========================
// colors.js: 로그에 색상을 주는 라이브러리
const colors = require('colors')

// 서비스를 운영하는 경우 호스팅 서비스에서 직접 환경변수를 지정하므로,
// 개발상황인 경우에만 환경변수를 .env에서 가지고 온다
// if(process.env.NODE_ENV !== 'production'){
//   require('dotenv').config();
// }
require('dotenv').config()

// 환경변수를 직접 출력하는 것은 피하는 것이 좋다.
// 꼭 필요한 경우나 개발환경인 경우에만 로깅하기.
// console.log(process.env.SECRET)
// console.log(process.env.API_KEY)
// ==================================================================

// ======================== ✅Express Server ========================
// app: express 서버, 포트는 3000으로 한다
const express = require('express')
const app = express()
const PORT = 3000
// ================================================================

// ======================== ✅Routers ========================
// /: userRoutes가 담당한다
// /campgrounds: campgroundRoutes가 담당한다
// /campgrounds/:id/reviews: userRoutes가 담당한다
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')
// =========================================================

// ======================== ✅Using Custom Error Handler ========================
const ExpressError = require('./utils/ExpressError')
// ===========================================================================

// ======================== ✅Using mongoose ========================
// DB_URL 환경변수를 사용하던가, 기본 mongoDB url을 사용한다
const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1/yelp-camp";

// mongoose와 Campground, Review, User 모델을 갖고온다
const mongoose = require('mongoose')
const Campground = require('./models/campground')
const Review = require('./models/review')
const User = require('./models/user')

// dbUrl로 MongoDB 서버에 연결을 시도한다
// 127.0.0.1: 로컬 데이터베이스
// mongoose.connect('mongodb://127.0.0.1/yelp-camp')
mongoose.connect(dbUrl)

// mongoose.connection: 데이터베이스 연결을 확인하거나 이벤트리스너를 추가할 수 있음.
// 연결에러가 날 경우 connection error: ${에러} 형태로 로깅하기
// 연결을 성공할 경우 DATABASE CONNECTED! 로깅하기
const db = mongoose.connection
db.on('error', console.error.bind(console, "connection error:"))
db.once('open', () => console.log('DATABASE CONNECTED!'.bgCyan))
// ================================================================

// ======================== ✅Sessions ========================
// exress-session: 유저의 세션을 관리한다.
// connect-flash: 유저에게 전달할 일회성 메시지를 저장한다.
// connect-mongo: 세션데이터를 MongoDB에 저장한다.
const session = require('express-session')
const flash = require('connect-flash')
const MongoStore = require("connect-mongo")

// secret: 세션을 암호화하는 키.
const secret = process.env.SECRET || "thisshouldbeabettersecret!"

// store: MongoDB 서버로 세션 데이터를 저장한다.
// MongoDB 서버로 dbUrl을 사용한다.
// 24시간마다 한 번만 데이터베이스에 저장한다.
// 세션 암호화 키로 secret를 사용한다.
const store = MongoStore.create({
  mongoUrl: dbUrl,
  // mongoUrl: 'mongodb://127.0.0.1/yelp-camp',
  touchAfter: 24 * 60 * 60,
  // ttl: 세션의 만료시간을 설정
  // ttl: 7 * 24 * 60 * 60,
  crypto: {
    secret,
  },
});

// 세션을 저장하는 데 오류가 발생하는 경우 에러를 로깅한다.
// (MongoDB 연결 끊어짐, 저장소에 문제 발생, ...)
store.on("error", function (e) {
  console.log('Session Store Error!', e)
})
// ==========================================================

// ======================== ✅Passport ========================
// passport.js: Authentication을 담당하는 라이브러리.
// 로컬 로그인, OAuth, JWT로 로그인을 구현할 수 있다.
// passport-local: 아이디와 비밀번호로 로그인하는 방식.
const passport = require('passport')
const LocalStrategy = require('passport-local')
// ==========================================================

// ======================== ✅Using Joi ========================
// Joi: 유저가 입력한 값의 유효성을 검사하는 라이브러리.
// 직접 Joi라이브러리를 가져오는 대신, schemas.js에서 사용한다.
// const Joi = require('joi')
const { campgroundSchema, reviewSchema } = require('./schemas')
// ===========================================================

// ======================== ✅Express Mongoose Sanitize ========================
// NoSQL Injection: 유저가 MongoDB 쿼리를 입력해서 데이터를 조회하거나 수정하는 공격.
// express-mongo-sanitize: 요청값에서 $나 .을 제거해 NoSQL Injection을 방지한다.
const mongoSanitize = require('express-mongo-sanitize')
// ===========================================================================

// ======================== Using ejs ========================
const path = require('path')
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
// ===========================================================

// ======================== Using ejs-mate ========================
const ejsMate = require('ejs-mate')
app.engine('ejs', ejsMate)
// ================================================================

// ======================== ✅Using method-override ========================
// form은 기본적으로 GET, POST 요청만 보낼 수 있다.
// method-override: form 형태의 request에서도 PUT, DELETE 요청을 보낼 수 있게 해준다.
// <form action="/campgrounds/123?_method=DELETE" method="POST"><button>Submit</button></form>
// => 브라우저에서 POST 요청을 보내지만, 서버에서는 DELETE /campgrounds/123으로 처리 가능하다.
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
// =======================================================================

// ======================== ✅Using body-parser ========================
// 사용자가 form 데이터를 제출하면, 그 데이터는 URL 인코딩된 문자열로 전달된다.
// body-parser: URL 인코딩된 문자열을 javascript 객체형태로 변환해 req.body에 저장한다.
// extended: true: 중첩된 객체도 처리가능 (ex. { user: { name: 'Tom' }}))
// extended: false: 단순한 key-value 형태만 처리가능

// <input type="text" name="title" />인 경우 req.body.title로 접근 가능하다.
app.use(express.urlencoded({ extended: true }))
// ===================================================================

// ======================== ✅Using Public Assets ========================
// express.static(): 정적인 파일(CSS, javascript, 이미지)를 제공할 수 있다.
// path.join(__dirname, 'public'): 현재 디렉토리에서 public/ 폴더를 정적파일 루트경로로 설정한다.
// public/ 폴더 안 파일을 서버에서 직접 제공할 수 있다.
app.use(express.static(path.join(__dirname, 'public')))
// =====================================================================

// ======================== mongo-sanitize의 추가옵션 ========================
// replaceWith: '_': $와 .을 제거하는 대신 _로 바꾼다.
app.use(mongoSanitize({ replaceWith: '_' }))
// =========================================================================

// ======================== Using Sessions ========================

const sessionConfig = {
  store,
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    name: 'session',
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  }
}
app.use(session(sessionConfig))
app.use(flash())

// passport.session() should be a latter part than using sessions
app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
  // console.log(req.session)
  console.log(req.query)
  res.locals.currentUser = req.user
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next()
})
// ================================================================

// ======================== Using Router ========================
app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

// Home Route
app.get('/', (req, res) => {
  res.render('campgrounds/home')
})

// Not existing routes
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404))
})
// ==============================================================

// ======================== ERROR HANDLER ========================
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Something went wrong!'
  res.status(statusCode).render('error', { err })
  // res.send('Oh Boy, something went wrong!')
})
// ===============================================================

// ======================== ✅RUN SERVER ========================
app.listen(PORT, () => console.log(`SERVER LISTENING ON PORT: ${PORT}...`.bgCyan))
// ============================================================

// ======================== Routes ========================
// app.get('/fakeUser', async (req, res) => {
//   const user = new User({ email: 'colt@gmail.com', username: 'colttt' })
//   const newUser = await User.register(user, 'chicken')
//   res.send(newUser)
// })
