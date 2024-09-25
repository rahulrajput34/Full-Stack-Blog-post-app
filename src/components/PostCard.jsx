import React from 'react';
import appwriteService from "../appwrite/config";
import { Link } from 'react-router-dom';

function PostCard({ $id, title, featuredImage }) {
    const imageUrl = appwriteService.getFilePreview(featuredImage);

    return (
        <Link to={`/post/${$id}`}>
            <div className='w-full bg-purple-100 rounded-xl p-4'>
                <div className='w-full justify-center mb-4'>
                    {imageUrl ? (
                        <img 
                            src={imageUrl} 
                            alt={title} 
                            className='rounded-xl' 
                        />
                    ) : (
                        <div className='flex items-center justify-center h-40 bg-gray-200 rounded-xl'>
                            <span>Unsupported format</span>
                        </div>
                    )}
                </div>
                <h2 className='text-xl font-bold'>{title}</h2>
            </div>
        </Link>
    );
}

export default PostCard;