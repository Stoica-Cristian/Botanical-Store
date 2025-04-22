import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: {
      type: String,
      default:
        "https://ui-avatars.com/api/?name=User&background=random&color=fff",
    },
  },
  {
    timestamps: true,
  }
);

// Middleware pentru hash-ul parolei înainte de salvare
userSchema.pre("save", async function (next) {
  // Doar dacă parola a fost modificată (sau este nouă)
  if (!this.isModified("password")) return next();

  try {
    // Generează un salt și hash-ul parolei
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Metodă pentru a verifica parola
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
