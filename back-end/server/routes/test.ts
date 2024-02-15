import { Router } from "express";
import mongoDB from "../../databases/mongoDB"

const testRouter = Router();

testRouter.get('/', (req, res) => {
    res.json({ msg: 'Hello World' });
});


testRouter.post("/add", async (req, res) => {
    const { name } = req.body;
    try {
        await mongoDB.addOne("test", { name });
        res.status(200).json({ success: "Added" });
    } catch (e) {
        res.status(500).json({ failed: "Error" });
    }
});

testRouter.get("/get", async (req, res) => {
    try {
        const data = await mongoDB.getAll("test", {});
        res.status(200).json(data);
    } catch (e) {
        res.status(500).json({ failed: "Error" });
    }
});

testRouter.delete("/delete", async (req, res) => {
    try {
        await mongoDB.deleteMany("test", { name: "test" });
        res.status(200).json({ success: "Deleted" });
    } catch (e) {
        res.status(500).json({ failed: "Error" });
    }
  });

export default testRouter;
