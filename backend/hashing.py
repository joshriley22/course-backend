import bcrypt

async def hash_password(password):

    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

async def verify_password(password, hashed_password):

    return bcrypt.checkpw(password.encode(), hashed_password.encode())