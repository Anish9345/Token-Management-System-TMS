const bcrypt = require('bcryptjs');

const generateHash = async (plainTextPassword) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plainTextPassword, salt);
  console.log('Your new hash is:');
  console.log(hash);
};

// Type the temporary password you want to give the user here:
generateHash('TempPassword123!');