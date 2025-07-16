import bcrypt from "bcrypt";

(async () => {
  const saltRounds = 10;
  const hash = await bcrypt.hash("example2025", saltRounds);
  console.log("Hashed password:", hash);
})();
