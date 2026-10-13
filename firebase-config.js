// Firebase 콘솔 → 프로젝트 설정 → 내 앱(웹) 의 firebaseConfig.
// null 로 바꾸면 '같은 컴퓨터 시험 모드' — 한 컴퓨터의 여러 탭끼리만 연결된다.
// 이 값은 비밀번호가 아니다(웹에 원래 공개되는 값). 보호는 Realtime Database 규칙이 맡는다.
export const FIREBASE = {
  apiKey: "AIzaSyAAwMy-r61onIGMR2sbDekmXkc5f3PjkI8",
  authDomain: "moonclipse-star-party.firebaseapp.com",
  databaseURL: "https://moonclipse-star-party-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "moonclipse-star-party",
  storageBucket: "moonclipse-star-party.firebasestorage.app",
  messagingSenderId: "984441301984",
  appId: "1:984441301984:web:5f13cb2fbf4232e9291985",
};
