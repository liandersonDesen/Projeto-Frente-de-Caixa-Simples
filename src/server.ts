import express from "express";
import { produtosRoutes } from "./routes/produto.routers";
import { vendaRoutes } from "./routes/venda.routers"; 

const PORT = process.env.PORT ?? 3333;

const app = express();

app.use(express.json());
app.use(produtosRoutes);
app.use(vendaRoutes);

app.listen(PORT, () =>
  console.log(`Server is running http://localhost:${PORT}`),
);