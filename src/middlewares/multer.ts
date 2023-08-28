import multer from "multer";



const storage:multer.StorageEngine = multer.memoryStorage();

const upload = multer({ storage}).single('file');

export default upload;

