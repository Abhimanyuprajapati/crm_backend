import { error } from "../utils/response.js";

export async function register(req, res) {
  const { userName, email, password, fistName, lastName } = req.body;

//   console.log(userName, email, password, fistName, lastName);

if(!userName || !email || !password || !fistName || !lastName) {
    // return res.status(400).send("All fields are required")
    console.log(error(res, "All fields are required", 400));
}

  res.send("registered");
}

export async function login(req, res) {}
