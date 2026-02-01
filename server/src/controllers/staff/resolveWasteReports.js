import { db } from "../../firebaseadmin/firebaseadmin";
import admin from 'firebase-admin';

export const resolveWasteReports=async(req,res)=>{
    const { staffimageUrl, imageUrl, geohash, id, userId } = req.body;

    if (!staffimageUrl || !imageUrl || !geohash || !id || !userId) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields"
        });
    }
    const url=process.env.PYTHON_SERVER;
    const response=await axios.post(`${url}/resolveWasteReports`,{staffimageUrl,imageUrl})


}