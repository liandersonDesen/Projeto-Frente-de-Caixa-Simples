import express from "express"

const PORT = process.env.PORT ?? 3333

const app = express()

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'API Frente de Caixa funcionando!'
  });
});

app.listen(PORT, () => console.log(`Server is running http://localhost:${PORT}`))
