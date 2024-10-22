"use client";
import { useOptimistic } from "react";
import { formatDate } from "@/lib/format";
import LikeButton from "./like-icon";
import { togglePostLikeStatus } from "@/actions/posts";

function Post({ post, action }) {
  return (
    <article className="post">
      <div className="post-image">
        <img src={post.image} alt={post.title} />
      </div>
      <div className="post-content">
        <header>
          <div>
            <h2>{post.title}</h2>
            <p>
              Shared by {post.userFirstName} on{" "}
              <time dateTime={post.createdAt}>
                {formatDate(post.createdAt)}
              </time>
            </p>
          </div>
          <div>
            <form
              action={action.bind(null, post.id)}
              className={post.isLiked ? "liked" : ""}
            >
              <LikeButton />
            </form>
          </div>
        </header>
        <p>{post.content}</p>
      </div>
    </article>
  );
}

export default function Posts({ posts }) {
  const [optitimisticPosts, updateOptimisticPosts] = useOptimistic(
    posts,
    (prevPosts, uptdatedPostId) => {
      const updatedPostIndex = prevPosts.findIndex(
        (post) => post.id === uptdatedPostId
      );
      if (updatedPostIndex === -1) {
        return prevPosts;
      }
      const updatedPosts = { ...prevPosts[updatedPostIndex] }; // Düzeltildi
      updatedPosts.likes = updatedPosts.likes + (updatedPosts.isLiked ? -1 : 1);
      updatedPosts.isLiked = !updatedPosts.isLiked;
      const newPosts = [...prevPosts];
      newPosts[updatedPostIndex] = updatedPosts;
      return newPosts;
    }
  );
  if (!optitimisticPosts || optitimisticPosts.length === 0) {
    return <p>There are no posts yet. Maybe start sharing some?</p>;
  }
  async function updatePost(postId) {
    updateOptimisticPosts(postId);
    await togglePostLikeStatus(postId);
  }
  return (
    <ul className="posts">
      {optitimisticPosts.map((post) => (
        <li key={post.id}>
          <Post post={post} action={updatePost} />
        </li>
      ))}
    </ul>
  );
}
