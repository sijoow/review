const express = require('express');
const path = require('path');
const multer = require('multer');
const nodemailer = require('nodemailer');
require('dotenv').config();//env
const app = express();
const port = 8002;

const CLEINT_EMAIL_ID = process.env.CLEINT_EMAIL_ID;
const CLIENT_EMAIL_PW = process.env.CLIENT_EMAIL_PW;


// 정적 파일 제공 (옵션)
app.use(express.static(path.join(__dirname, 'public')));

// Nodemailer 설정
const transporter = nodemailer.createTransport({
  host: 'smtp.naver.com',
  port: 465,
  secure: true,
  auth: {
    user: CLEINT_EMAIL_ID,
    pass: CLIENT_EMAIL_PW // 본인이 생성한 앱 비밀번호 사용
  }
});

// 이미지를 업로드하기 위한 Multer 설정
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 메일 보내기 함수 (이미지 첨부)
const sendEmailWithAttachment = (to, subject, text, imageBuffer) => {
  const mailOptions = {
    from: CLEINT_EMAIL_ID,
    to: to,
    subject: subject,
    text: text,
    attachments: [
      {
        filename: 'image.jpg',
        content: imageBuffer,
        encoding: 'base64',
        cid: 'unique@nodemailer.com'
      }
    ]
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('이메일 전송 성공:', info.response);
  });
};

// 이미지 및 텍스트 업로드 처리
app.post('/upload', upload.single('image'), (req, res) => {
  // 이미지 업로드 후, 이미지를 이메일로 보냄
  const imageBuffer = req.file.buffer;
  const { store, goods, orderNumber, name, phoneNumber } = req.body;
  // 테스트용 코드 (이미지 파일이 public 폴더에 저장되도록 함)
  const imagePath = path.join(__dirname, 'public', 'uploaded-image.jpg');

  // 이미지를 이메일로 보냄
  sendEmailWithAttachment(CLEINT_EMAIL_ID ,'요기보 포토후기 EVENT', 
  `구매처: ${store}\n구매제품: ${goods}\n주문번호: ${orderNumber}\n이름: ${name}\n연락처: ${phoneNumber}`, imageBuffer);
  res.redirect('/');
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 포트에서 실행 중입니다.`);
});
