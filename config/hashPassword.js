import bcrypt from "bcrypt";

const hashPassword = async (password) => {
  const saltRounds = 10; // Number of hashing rounds
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log("Hashed Password:", hashedPassword);
};

hashPassword("Admin@123"); // Replace with your desired password
