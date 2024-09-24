// We can direct access inside the App.jsx all those below things
// But it is not good practice to write import.meta.env.whatever 
// So create the folder named config and write it like below and export it
// it is production grade approach
const conf = {
    appwriteurl: String(import.meta.env.VITE_APPWRITE_URL),
    appwriteProjectId: String(import.meta.env.VITE_APPWRITE_PROJECT_ID),
    appwriteDatabaceId: String(import.meta.env.VITE_APPWRITE_DATABACE_ID),
    appwriteCollectionId: String(import.meta.env.VITE_APPWRITE_COLLECTION_ID),
    appwriteBucketId: String(import.meta.env.VITE_APPWRITE_BUCKET_ID)
}

export default conf