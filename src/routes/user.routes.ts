import express from 'express';
import authenticateUser from '../middlewares/userAuth';
import { signUp,login,getUser, changePassword,updateUser } from '../controllers/user.controller';

const router = express.Router();

router.post('/signUp',signUp)
router.post('/login',login)
router.get('/getUser',authenticateUser,getUser)
router.post('/changePassword',authenticateUser,changePassword)
// add multer to the following update route
router.post('/updateUser',authenticateUser,updateUser)

export default router;