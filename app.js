const express = require("express");

const app = express();

const db = require('./models')

const {Member} = db;

// middle ware JSON을 가져오기 위한 메서드
app.use(express.json());

app.get('/', (req, res) => {
  res.send('URL should contain /api/..')
})

// URL이 members로 왔을때 모든 회원정보 호출
app.get("/api/members", async (req, res) => {
  // req.query == 쿼리스트링의 값을 가져옴
  const { team } = req.query;
  if (team) {
    const teamMember = await Member.findAll({where : { team }, order: [['admissionDate', 'DESC']]});
    res.send(teamMember);
  } else {
    const members = await Member.findAll({order :[['admissionDate', 'DESC']]});
    res.send(members);
  }
});

// URL이 :id에 따라 한명의 회원 조회
app.get("/api/members/:id", async (req, res) => {
  // req.params == URL의 파라미터 값을 가져옴
  const { id } = req.params;
  const member = await Member.findOne({where: {id}});
  if (member) {
    res.send(member);
  } else {
    res.status(404).send({ message: "There is no such member with the id!" });
  }
});

// 회원 등록 API
app.post("/api/members", async (req, res) => {
  const newMember = req.body;
  const member = Member.build(newMember);
  await member.save();
  res.send(member);
});

// 회원 수정 API
// app.put("/api/members/:id", async (req, res) => {
//   const { id } = req.params;
//   const newInfo = req.body;
//   const result = await Member.update(newInfo, { where: { id }})
//   if (result[0]) {
//     res.send({ message: `${result[0]} row(s) affected`});
//   } else {
//     res.status(404).send({ message: "There is no member with the id!" });
//   }
// });

// ORM을 활용한 회원 수정 API
app.put('/api/members/:id', async (req, res) => {
  const { id } = req.params;
  const newInfo = req.body;
  const member = await Member.findOne({ where: { id }});
  if(member) {
    Object.keys(newInfo).forEach((prop) => {
      member[prop] = newInfo[prop];
    });
    await member.save();
    res.send(member);
  }else{
    res.status(404).send({message: 'There is no member with the id'})
  }  
})

// 회원 삭제 API
app.delete("/api/members/:id", async (req, res) => {
  const { id } = req.params;  
  const deletedCount = await Member.destroy({where: { id }});
  if (deletedCount) {
    res.send({message: `${deletedCount} row(s) deleted`})
  } else {
    res.status(404).send({ message: "There is no member with the id" });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Sever is listening...");
});
